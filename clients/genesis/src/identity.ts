// A test identity and what the genesis client does with it: genesis, routes,
// encryption key, rotation, looking an identity up, and delivering keys in
// sealed containers (Identity; Envelope draft 6; relay transport cMIP).
//
// A TEST IDENTITY HOLDS ITS SAFETY KEY IN SOFTWARE. It is a prototype, never
// for a real identity: the real identity's safety key is made and used only
// by the air-gapped safety key Module (build brief; roadmap step 17).

import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import {
  ACK_SPECS,
  SPECS,
  ENVELOPE_TYPES,
  IDENTITY_TYPES,
  Verifier,
  actId,
  cborDecode,
  cborEncode,
  describeAct,
  encryptionKeyPayload,
  hex,
  keyDeliveryPayload,
  makeEveryday,
  makeGenesis,
  makeRotation,
  newEncryptionSecret,
  newSigningSecret,
  newTestSafetyKey,
  openSealed,
  pickupTag,
  readKeyDelivery,
  routesPayload,
  runningSummary,
  safetyFromSeeds,
  seal,
  sealedParts,
  signingPublic,
  unhex,
  xwingPublic,
} from './core.ts';
import { WITNESS_EXPLANATION } from './witness.ts';
import { CODE, Relay, RelayError, type PutResult, type Via, relayAt, sealedId } from './transport.ts';
import { record } from './kex.ts';
import { lookUp, type Home, type Lookup, type RouteIn } from './lookup.ts';

export { lookUp, type Home, type Lookup, type Resolution, type RouteIn } from './lookup.ts';

export const TEST_LABEL =
  'MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.';

interface Safety {
  scheme: number;
  /** FIPS 205 seeds, hex (48 bytes). */
  seeds: string;
}

interface Pending {
  /** The rotation's exact bytes, base64: resubmitted unchanged (Identity rule 8a). */
  rotation: string;
  id: string;
  signingSecret: string;
  safety: Safety;
  homes: Home[];
  rule: number[] | null;
}

/** The test identity file. Everything in it is secret except where noted. */
export interface IdentityFile {
  label: string;
  identity: string;
  /** Position of the chain act that bound the current signing key. */
  position: number;
  binding: string;
  signingSecret: string;
  /** The safety key the current chain act committed: the next to be revealed. */
  safety: Safety;
  /** This identity's chain acts, exact bytes, base64, oldest first. */
  chain: string[];
  homes: Home[];
  rule: number[] | null;
  /** The everyday sequence, act ids, oldest first. */
  sequence: string[];
  routes: { version: number; act: string } | null;
  /** Every encryption key published, oldest first; old ones still open old deliveries. */
  encryption: { version: number; act: string; secret: string }[];
  pending: Pending | null;
}

const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

/** What one home answered to one act. */
export interface Submitted {
  home: string;
  result?: PutResult;
  error?: string;
  code?: number;
}

export class TestIdentity {
  constructor(
    public f: IdentityFile,
    public via: Via = {},
  ) {}

  get id(): string {
    return this.f.identity;
  }

  // ------------------------------------------------------------ files

  static load(path: string, via: Via = {}): TestIdentity {
    const f = JSON.parse(readFileSync(path, 'utf8')) as IdentityFile;
    if (f.label !== TEST_LABEL) throw new Error(`${path} is not a MOR test identity file`);
    return new TestIdentity(f, via);
  }

  /** Written whole to a temporary file, then renamed, readable by its owner only. */
  save(path: string): void {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.f, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, path);
  }

  // ------------------------------------------------------------ genesis

  /**
   * A new test identity: an everyday signing key, a safety key held in
   * software and committed by hash, and a genesis naming its homes. Nothing
   * is sent yet: save the file first, then `publishGenesis`.
   */
  static create(opts: { homes: Home[]; rule?: number[]; scheme?: 2 | 3; via?: Via }): TestIdentity {
    if (!opts.homes.length) throw new Error('a genesis declares at least one home');
    const signingSecret = newSigningSecret();
    const safety = newTestSafetyKey(opts.scheme ?? 2);
    const genesis = makeGenesis({
      identitySpec: SPECS.identity,
      signingSecret,
      safetyScheme: safety.scheme,
      safetyCommit: safety.commit,
      homes: opts.homes,
      rule: opts.rule,
    });
    const id = actId(genesis);
    return new TestIdentity(
      {
        label: TEST_LABEL,
        identity: id,
        position: 0,
        binding: id,
        signingSecret: hex(signingSecret),
        safety: { scheme: safety.scheme, seeds: hex(safety.seeds) },
        chain: [b64(genesis)],
        homes: opts.homes,
        rule: opts.rule ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null,
      },
      opts.via ?? {},
    );
  }

  chainActs(): Uint8Array[] {
    return this.f.chain.map(unb64);
  }

  private relay(hint: string): Relay {
    return relayAt(hint, this.via);
  }

  /**
   * Send an identity-chain act to each home. A home that lacks the earlier
   * chain acts (error 3: a home newly named) gets them first, oldest first.
   */
  private async submitChainAct(act: Uint8Array, homes: Home[]): Promise<Submitted[]> {
    const out: Submitted[] = [];
    for (const h of homes) {
      const r = this.relay(h.hint);
      try {
        out.push({ home: h.hint, result: await r.putAct(act) });
      } catch (e) {
        if (e instanceof RelayError && e.code === CODE.missingPredecessor) {
          try {
            for (const earlier of this.chainActs()) {
              if (actId(earlier) !== actId(act)) await r.putAct(earlier);
            }
            out.push({ home: h.hint, result: await r.putAct(act) });
            continue;
          } catch (e2) {
            out.push(failure(h.hint, e2));
            continue;
          }
        }
        out.push(failure(h.hint, e));
      }
    }
    return out;
  }

  /** Send the genesis to every home it names; each signs a receipt. */
  async publishGenesis(): Promise<Submitted[]> {
    return this.submitChainAct(this.chainActs()[0], this.f.homes);
  }

  // ------------------------------------------------------------ everyday acts

  private everyday(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: string[]; acks?: string[] },
  ) {
    // F110: only Identity, Finance and Law act types carry acknowledgements;
    // a text act, a publication or a cMIP's act carrying them is invalid.
    // To rely on such an act, sign a witness act (see `witness`).
    if (opts.acks?.length && !ACK_SPECS.includes(spec)) {
      throw new Error('only Identity, Finance and Law acts may acknowledge (Envelope rule 4a, F110): to rely on this act, sign a witness act');
    }
    const made = makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: this.f.sequence,
      public: opts.public,
      to: opts.to,
      objects: opts.objects,
      refs: opts.refs,
      acks: opts.acks,
    }) as { act: Uint8Array; id: string; key: Uint8Array };
    this.f.sequence.push(made.id);
    return made;
  }

  /** Send an everyday identity act to every home: its standing depends on it (Envelope, "How acts reach people"). */
  private async toHomes(act: Uint8Array): Promise<Submitted[]> {
    const out: Submitted[] = [];
    for (const h of this.f.homes) {
      try {
        out.push({ home: h.hint, result: await this.relay(h.hint).putAct(act) });
      } catch (e) {
        out.push(failure(h.hint, e));
      }
    }
    return out;
  }

  /**
   * Publish a new version of the routes (Identity type 3): where this
   * identity's content is found (outbox) and where others deliver to it
   * (inbox). Save the file after, since the sequence moved.
   */
  async publishRoutes(routes: RouteIn[]): Promise<{ id: string; sent: Submitted[] }> {
    const version = (this.f.routes?.version ?? 0) + 1;
    const payload = routesPayload({ version, previous: this.f.routes?.act, routes });
    const made = this.everyday(SPECS.identity, IDENTITY_TYPES.routes, payload, { public: true });
    this.f.routes = { version, act: made.id };
    return { id: made.id, sent: await this.toHomes(made.act) };
  }

  /**
   * Sign a witness act (Identity type 15, F110): "I received this act and
   * rely on it", for each act named. It keeps them visible as disputed if
   * their author later disowns them. Client conformance (Identity rule 18c):
   * never a side effect; the caller passes back the explanation it showed
   * the owner, `WITNESS_EXPLANATION`, word for word, or nothing is signed.
   * Sent to every home and to the relays given, as a public Identity act.
   */
  async witness(acts: string[], opts: { shown: string; relays?: string[] }): Promise<{ id: string; act: Uint8Array; sent: Submitted[] }> {
    if (opts.shown !== WITNESS_EXPLANATION) {
      throw new Error('a witness act is signed only after the owner was shown what it does (Identity rule 18c)');
    }
    if (!acts.length) throw new Error('a witness act names at least one act');
    if (acts.some((a) => this.f.sequence.includes(a))) throw new Error("a witness act names other identities' acts, not this one's");
    const made = this.everyday(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(new Map()), { public: true, acks: acts });
    const sent = await this.toHomes(made.act);
    for (const hint of opts.relays ?? []) await relayAt(hint, this.via).putAct(made.act);
    return { id: made.id, act: made.act, sent };
  }

  /**
   * Publish a new encryption key (Envelope type 4): a fresh X-Wing key
   * pair; the public half in the act, the private half kept in the file.
   */
  async publishEncryptionKey(): Promise<{ id: string; sent: Submitted[] }> {
    const last = this.f.encryption.at(-1);
    const version = (last?.version ?? 0) + 1;
    const secret = newEncryptionSecret();
    const payload = encryptionKeyPayload(version, last?.act, xwingPublic(secret));
    const made = this.everyday(SPECS.envelope, ENVELOPE_TYPES.encryptionKey, payload, { public: true });
    this.f.encryption.push({ version, act: made.id, secret: hex(secret) });
    return { id: made.id, sent: await this.toHomes(made.act) };
  }

  // ------------------------------------------------------------ rotation

  /**
   * Prepare a rotation: a new signing key, a new committed safety key, the
   * latest act of the sequence kept, and optionally new homes or rule
   * (`rule: []` returns to the default). Signed with the safety key the
   * current chain act committed. The rotation is stored as pending; save
   * the file before submitting, so that a retry sends the same bytes.
   */
  prepareRotation(opts: { homes?: Home[]; rule?: number[]; scheme?: 2 | 3 } = {}): string {
    if (this.f.pending) throw new Error('a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)');
    const newSigning = newSigningSecret();
    const next = newTestSafetyKey(opts.scheme ?? (this.f.safety.scheme as 2 | 3));
    const seq = this.f.sequence;
    const kept = seq.length
      ? [{ act: seq[seq.length - 1], position: seq.length, summary: runningSummary(seq) }]
      : [];
    const previous = actId(this.chainActs()[this.f.position]);
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous,
      position: this.f.position + 1,
      safetyScheme: this.f.safety.scheme,
      safetySeeds: unhex(this.f.safety.seeds),
      newSigningPublic: signingPublic(newSigning),
      nextSafetyScheme: next.scheme,
      nextSafetyCommit: next.commit,
      kept,
      homes: opts.homes,
      rule: opts.rule,
    });
    const id = actId(rotation);
    this.f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: next.scheme, seeds: hex(next.seeds) },
      homes: opts.homes ?? this.f.homes,
      rule: opts.rule === undefined ? this.f.rule : opts.rule.length ? opts.rule : null,
    };
    return id;
  }

  /**
   * Submit the pending rotation, the exact same bytes, to the homes whose
   * receipts count (the current set) and to any new homes it names.
   */
  async submitRotation(): Promise<Submitted[]> {
    const p = this.f.pending;
    if (!p) throw new Error('no rotation pending');
    const homes = [...this.f.homes];
    for (const h of p.homes) if (!homes.some((x) => x.hint === h.hint)) homes.push(h);
    return this.submitChainAct(unb64(p.rotation), homes);
  }

  /**
   * Look the identity up as any reader would, and if the pending rotation
   * now counts, take on its keys. Returns whether it counts.
   */
  async settleRotation(): Promise<{ counts: boolean; lookup: Lookup }> {
    const p = this.f.pending;
    if (!p) throw new Error('no rotation pending');
    const lookup = await lookUp(this.f.identity, [...this.f.homes, ...p.homes].map((h) => h.hint), this.via);
    const links = lookup.resolution.links;
    const counts = links.some((l) => l.act === p.id);
    if (counts) {
      this.f.chain.push(p.rotation);
      this.f.position += 1;
      this.f.binding = p.id;
      this.f.signingSecret = p.signingSecret;
      this.f.safety = p.safety;
      this.f.homes = p.homes;
      this.f.rule = p.rule;
      this.f.pending = null;
      await this.spread(lookup);
    }
    return { counts, lookup };
  }

  /**
   * Bring every home up to date, as the owner's client should: the chain
   * acts a home missed while it was away (the exact same bytes), and the
   * receipts the other homes signed (cMIP, identity record part 8), so a
   * reader who reaches a single home can still count the majority.
   */
  async spread(lookup?: Lookup): Promise<void> {
    const l = lookup ?? (await lookUp(this.f.identity, this.f.homes.map((h) => h.hint), this.via));
    const extra = [...l.operatorChains, ...l.receipts];
    for (const h of this.f.homes) {
      const r = this.relay(h.hint);
      try {
        for (const a of this.chainActs()) await r.putAct(a);
        for (const rc of extra) {
          try {
            await r.putAct(rc);
          } catch {
            // a home may decline other operators' receipts (a MAY)
          }
        }
      } catch (e) {
        // that home is away (or refused its own chain); it is brought up to date next time
        if (!(e instanceof TypeError) && !(e instanceof RelayError)) throw e;
      }
    }
  }

  /** The public half of the safety key held for the next rotation. */
  nextSafety(): { scheme: number; commit: string } {
    const s = safetyFromSeeds(this.f.safety.scheme, unhex(this.f.safety.seeds));
    return { scheme: s.scheme, commit: s.commit };
  }

  // ------------------------------------------------------------ keys

  /**
   * Deliver a content key to another identity (Envelope, "Key delivery"):
   * look up its current encryption key and inbox, make a private key
   * delivery addressed to it, seal it with X-Wing, and put it in its inbox.
   */
  async deliverKey(opts: {
    to: string;
    hints: string[];
    target: string;
    key: Uint8Array;
    media?: boolean;
  }): Promise<{ delivery: string; sealed: string; inbox: string[] }> {
    const them = await lookUp(opts.to, opts.hints, this.via);
    const pk = them.encryptionKey;
    if (!pk) throw new Error('that identity has published no encryption key that counts');
    const inbox = them.inbox(SPECS.envelope);
    if (!inbox) throw new Error('that identity declares no inbox');
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = this.everyday(SPECS.envelope, ENVELOPE_TYPES.keyDelivery, payload, {
      public: false,
      to: [opts.to],
    });
    const sealed = sealFor(made.act, made.key, [{ id: opts.to, key: pk }]);
    const id = sealedId(sealed);
    for (const hint of inbox) await relayAt(hint, this.via).putSealed(sealed);
    return { delivery: made.id, sealed: id, inbox };
  }

  /** A fresh bare key for one expected delivery (cMIP: a fresh bare key per delivery). */
  static newBareKey(): { secret: Uint8Array; public: Uint8Array; pickup: string } {
    const secret = newEncryptionSecret();
    const pub = xwingPublic(secret);
    return { secret, public: pub, pickup: pickupTag(pub) };
  }

  /** Deliver a content key to a bare key someone supplied, found by its pickup tag. */
  async deliverKeyToBare(opts: {
    bareKey: Uint8Array;
    relays: string[];
    target: string;
    key: Uint8Array;
    media?: boolean;
  }): Promise<{ delivery: string; sealed: string }> {
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = this.everyday(SPECS.envelope, ENVELOPE_TYPES.keyDelivery, payload, { public: false });
    const sealed = sealFor(made.act, made.key, [{ key: opts.bareKey }]);
    for (const hint of opts.relays) await relayAt(hint, this.via).putSealed(sealed, [pickupTag(opts.bareKey)]);
    return { delivery: made.id, sealed: sealedId(sealed) };
  }

  /**
   * Sign an everyday act, next in this identity's sequence, without sending
   * it: for a signer that hands the act to someone else to submit. Save the
   * file before handing the act out, so the next act follows it.
   */
  sign(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: string[]; acks?: string[] },
  ): { act: Uint8Array; id: string; key: Uint8Array } {
    return this.everyday(spec, type, payload, opts);
  }

  /**
   * Publish an act on this identity's own relays, for example a private
   * post whose key it will deliver. Returns the act id and its content key.
   */
  async publish(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; relays: string[]; to?: string[]; objects?: [string, string][]; refs?: string[]; acks?: string[] },
  ) {
    const made = this.everyday(spec, type, payload, {
      public: opts.public,
      to: opts.to,
      objects: opts.objects,
      refs: opts.refs,
      acks: opts.acks,
    });
    for (const hint of opts.relays) await relayAt(hint, this.via).putAct(made.act);
    return made;
  }

  /**
   * Read this identity's inbox: every sealed container addressed to it, opened
   * with its encryption keys (newest first), the sender looked up and its act
   * judged by the core library.
   */
  async readInbox(opts: { inbox: string[]; senderHints: string[] }): Promise<Received[]> {
    const out: Received[] = [];
    const secrets = [...this.f.encryption].reverse().map((e) => unhex(e.secret));
    for (const hint of opts.inbox) {
      const page = await relayAt(hint, this.via).feed({ to: this.f.identity });
      for (const it of page.items) {
        if (it.kind !== 'sealed') continue;
        out.push(await receive(it.item, this.f.identity, secrets, opts.senderHints, this.via));
      }
    }
    return out;
  }
}

/** What one sealed container held, once opened and judged. */
export interface Received {
  sealed: string;
  opened: boolean;
  error?: string;
  from?: string;
  act?: string;
  type?: number;
  spec?: string;
  /** The sender's act, as the core library judges it after looking the sender up. */
  status?: string;
  delivery?: { target: string; key: Uint8Array; media: boolean };
  /** A message: the text of a text act (Text MIP, type 0), as the core library opened it. */
  text?: string;
}

/** Open one container with each private key in turn (as `me`, or as a bare key if `me` is null). */
export async function receive(
  sealed: Uint8Array,
  me: string | null,
  secrets: Uint8Array[],
  senderHints: string[],
  via: Via = {},
): Promise<Received> {
  const id = sealedId(sealed);
  let parts: { to: string[]; capsules: Uint8Array[] };
  try {
    parts = sealedParts(sealed);
  } catch (e) {
    return { sealed: id, opened: false, error: String(e) };
  }
  const index = me === null ? 0 : parts.to.indexOf(me);
  if (index < 0) return { sealed: id, opened: false, error: 'not addressed to this identity' };
  let lastError = 'no key';
  for (const secret of secrets) {
    record({ kind: 'decapsulate', secret, ct: parts.capsules[index] });
    let o: { act: Uint8Array; key?: Uint8Array; described: Described };
    try {
      o = openSealed(sealed, me ?? undefined, secret);
    } catch (e) {
      lastError = String(e);
      continue;
    }
    const d = o.described;
    const r: Received = { sealed: id, opened: true, from: d.signer, act: d.id, type: d.type, spec: d.spec };
    if (d.spec === SPECS.envelope && d.type === ENVELOPE_TYPES.keyDelivery && d.payload) {
      r.delivery = readKeyDelivery(d.payload);
    }
    if (d.spec === SPECS.text && d.type === 0 && d.payload) {
      const t = (cborDecode(d.payload) as Map<number, unknown>).get(0);
      if (typeof t === 'string') r.text = t;
    }
    if (d.signer) {
      try {
        const them = await lookUp(d.signer, senderHints, via);
        if (o.key) them.verifier.addWithKey(o.act, o.key);
        else them.verifier.add(o.act);
        r.status = them.verifier.status(d.id);
      } catch (e) {
        r.status = `sender not found: ${e}`;
      }
    }
    return r;
  }
  return { sealed: id, opened: false, error: lastError };
}

interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  position?: number;
  payload?: Uint8Array;
}

/** Seal an act for its recipients, drawing the randomness here so that every key exchange can be recorded. */
export function sealFor(act: Uint8Array, key: Uint8Array | undefined, recipients: { id?: string; key: Uint8Array }[]): Uint8Array {
  const eseeds = recipients.map(() => new Uint8Array(randomBytes(64)));
  const sealed = seal({
    act,
    key,
    recipients,
    random: {
      containerKey: new Uint8Array(randomBytes(32)),
      nonce: new Uint8Array(randomBytes(24)),
      eseeds,
      oneTimeSecret: newSigningSecret(),
    },
  });
  const parts = sealedParts(sealed) as { capsules: Uint8Array[] };
  recipients.forEach((r, i) => record({ kind: 'encapsulate', publicKey: r.key, eseed: eseeds[i], ct: parts.capsules[i] }));
  return sealed;
}

function failure(home: string, e: unknown): Submitted {
  if (e instanceof RelayError) return { home, error: e.reason, code: e.code };
  return { home, error: String(e) };
}
