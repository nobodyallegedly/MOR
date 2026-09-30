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
  SPECS,
  ENVELOPE_TYPES,
  IDENTITY_TYPES,
  Verifier,
  actId,
  cborDecode,
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
import { CODE, Relay, RelayError, type PutResult, type Via, relayAt, sealedId } from './transport.ts';
import { record } from './kex.ts';

export const TEST_LABEL =
  'MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.';

export interface Home {
  /** The operator's identity hash, or null for a self-hosted home. */
  operator: string | null;
  /** The base address (relay transport cMIP, "Addresses"). */
  hint: string;
}

export interface RouteIn {
  /** A spec hash, or null for everything else. */
  scope: string | null;
  hints: string[];
  /** 0 outbox (default), 1 inbox. */
  kind?: 0 | 1;
}

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
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: string[] },
  ) {
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
   * Publish an act on this identity's own relays, for example a private
   * post whose key it will deliver. Returns the act id and its content key.
   */
  async publish(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; relays: string[]; to?: string[]; objects?: [string, string][]; refs?: string[] },
  ) {
    const made = this.everyday(spec, type, payload, {
      public: opts.public,
      to: opts.to,
      objects: opts.objects,
      refs: opts.refs,
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

// ---------------------------------------------------------------- looking up

export interface Resolution {
  identity: string;
  links: { act: string; position: number; how: string }[];
  stop: string;
  waiting: string[];
  contested: number[];
  signingKey?: Uint8Array;
  safetyScheme?: number;
  safetyCommit?: string;
  homes: Home[];
  rule?: number[];
  effective?: string;
}

export interface Lookup {
  resolution: Resolution;
  verifier: Verifier;
  /** Homes that did not answer (a hint, never evidence). */
  unreachable: string[];
  routes: { act: string | null; contested: boolean; routes: RouteIn[] };
  encryptionKeyAct: string | null;
  encryptionKey: Uint8Array | null;
  /** Every receipt held for this identity's chain acts, from any home. */
  receipts: Uint8Array[];
  /** The identity-chain acts of its homes' operators, as found. */
  operatorChains: Uint8Array[];
  inbox(spec: string): string[] | null;
}

/**
 * Look an identity up as a reader: fetch its genesis from any hint, then
 * the identity record from every home its chain names (and each home's
 * operator's own chain, to check the receipts), and let the core library
 * decide which rotation counts and which routes and encryption key count.
 * Nothing unsigned is trusted. With `into`, the acts are added to that
 * verifier, so several identities can be judged together.
 */
export async function lookUp(identity: string, hints: string[], via: Via = {}, into?: Verifier): Promise<Lookup> {
  const v = into ?? new Verifier(SPECS.identity);
  const tried = new Set<string>();
  const unreachable: string[] = [];
  const operatorActs = new Map<string, Uint8Array[]>();
  const add = (acts: Uint8Array[]) => {
    for (const a of acts) {
      try {
        v.add(a);
      } catch {
        // a malformed act from a relay: ignored, it proves nothing
      }
    }
  };
  let genesis: Uint8Array | null = null;
  for (const h of hints) {
    try {
      genesis = await relayAt(h, via).getAct(identity);
    } catch {
      unreachable.push(h);
    }
    if (genesis) break;
  }
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(', ')}`);
  add([genesis]);

  // Every home named anywhere in the chain held so far; more may appear as rotations arrive.
  const homesNamed = (): Home[] => {
    const out: Home[] = [];
    for (const id of v.held()) {
      let d: Described;
      try {
        d = describeAct(heldBytes.get(id)!);
      } catch {
        continue;
      }
      if (d.spec !== SPECS.identity || !d.payload) continue;
      if (d.type !== IDENTITY_TYPES.genesis && d.type !== IDENTITY_TYPES.rotation) continue;
      if ((d.signer ?? d.id) !== identity) continue;
      const p = cborDecode(d.payload) as Map<number, unknown>;
      const homes = p.get(d.type === 0 ? 2 : 6) as [Uint8Array | null, string][] | undefined;
      for (const [op, hint] of homes ?? []) out.push({ operator: op ? hex(op) : null, hint });
    }
    return out;
  };
  const heldBytes = new Map<string, Uint8Array>([[actId(genesis), genesis]]);
  const keep = (acts: Uint8Array[]) => {
    for (const a of acts) {
      try {
        heldBytes.set(actId(a), a);
      } catch {
        // malformed
      }
    }
    add(acts);
  };

  for (let round = 0; round < 4; round++) {
    const fresh = homesNamed().filter((h) => !tried.has(h.hint));
    if (!fresh.length) break;
    for (const h of fresh) {
      tried.add(h.hint);
      const r = relayAt(h.hint, via);
      try {
        const rec = await r.identity(identity);
        keep([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
      } catch {
        unreachable.push(h.hint);
        continue;
      }
    }
  }

  // Each home's operator's own chain, so its receipts can be checked
  // ("Resolving an operator"): from its own home first, then, as signed
  // acts that any relay may carry, from every other home that answered.
  const operators = new Set(homesNamed().map((h) => h.operator ?? identity));
  operators.delete(identity);
  const answered = [...tried].filter((h) => !unreachable.includes(h));
  for (const op of operators) {
    const own = homesNamed().filter((h) => h.operator === op).map((h) => h.hint);
    for (const hint of [...own.filter((h) => answered.includes(h)), ...answered.filter((h) => !own.includes(h))]) {
      const r = relayAt(hint, via);
      try {
        const g = await r.getAct(op);
        if (!g) continue;
        keep([g]);
        operatorActs.set(op, [g]);
        const page = await r.feed({ signer: op });
        const chain = page.items
          .filter((i) => i.kind === 'act')
          .map((i) => i.item)
          .filter((a) => {
            const d = describeAct(a) as Described;
            return d.spec === SPECS.identity && d.type === IDENTITY_TYPES.rotation;
          });
        keep(chain);
        operatorActs.get(op)!.push(...chain);
        break;
      } catch {
        // not here; try the next
      }
    }
  }

  const resolution = v.resolve(identity) as Resolution;
  const r = v.latest(identity, SPECS.identity, IDENTITY_TYPES.routes) as { act?: string; contested: boolean; payload?: Uint8Array };
  const routes: RouteIn[] = [];
  if (r.payload) {
    const p = cborDecode(r.payload) as Map<number, unknown>;
    for (const x of p.get(2) as unknown[][]) {
      routes.push({
        scope: x[0] ? hex(x[0] as Uint8Array) : null,
        hints: x[1] as string[],
        kind: ((x[2] as number) ?? 0) as 0 | 1,
      });
    }
  }
  const e = v.latest(identity, SPECS.envelope, ENVELOPE_TYPES.encryptionKey) as { act?: string; payload?: Uint8Array };
  let encryptionKey: Uint8Array | null = null;
  if (e.payload) {
    const p = cborDecode(e.payload) as Map<number, unknown>;
    const [scheme, key] = p.get(2) as [number, Uint8Array];
    if (scheme === 4) encryptionKey = key;
  }
  const receipts: Uint8Array[] = [];
  for (const [id, a] of heldBytes) {
    const d = describeAct(a) as Described;
    if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.receipt || !d.payload) continue;
    const p = cborDecode(d.payload) as Map<number, unknown>;
    if (hex(p.get(0) as Uint8Array) === identity && v.status(id) === 'valid') receipts.push(a);
  }
  return {
    resolution,
    verifier: v,
    receipts,
    operatorChains: [...operatorActs.values()].flat(),
    unreachable,
    routes: { act: r.act ?? null, contested: r.contested, routes },
    encryptionKeyAct: e.act ?? null,
    encryptionKey,
    inbox(spec: string) {
      const inboxes = routes.filter((x) => x.kind === 1);
      const hit = inboxes.find((x) => x.scope === spec) ?? inboxes.find((x) => x.scope === null);
      return hit ? hit.hints : null;
    },
  };
}
