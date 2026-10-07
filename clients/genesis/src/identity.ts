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
  MIPS,
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
  makeChainSignature,
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

/**
 * One anchoring reference: an anchoring cMIP and its parameters, naming one
 * time reference (Envelope, task "Anchoring"; Finance's clock, F181). The
 * parameters are deterministic CBOR, hex.
 */
export interface ClockRef {
  cmip: string;
  params: string;
}

/**
 * The clock the owner declares with the safety key (Finance, "The clock",
 * F176, F179): a main anchoring reference and, optionally, a backup. A lock
 * change is compared with payers' claims on it (Finance rule 15). Public.
 */
export interface Clock {
  main: ClockRef;
  backup?: ClockRef;
}

/**
 * An anchoring cMIP this client carries, on one reference: it anchors an
 * act id and returns the proof that it existed by a point on that
 * reference. How is the cMIP's business (F169, F173).
 */
export interface Anchoring {
  reference: ClockRef;
  anchor(act: string): Promise<Uint8Array>;
}

/** An anchor this client obtained: the act, which reference, the proof. */
export interface Anchored {
  act: string;
  on: 'main' | 'backup';
  proof: Uint8Array;
}

/** Finance's clock kind in the declarations slot (F176). */
export const CLOCK_KIND = 1;

/**
 * Said plainly before a genesis or a rotation that leaves the identity with
 * no declared clock (Finance rule 14b, F181: client conformance).
 */
export const NO_CLOCK_WARNING =
  'This identity declares no clock. If its signing key is ever stolen, what the thief does with it until you change your keys, and every payment made to what the thief published, will be your loss, whatever you anchor: payers are compared with your key change only on a clock you named in advance (Finance rule 15).';

const sameRef = (a: ClockRef, b: ClockRef) => a.cmip === b.cmip && a.params === b.params;

/** The clock as a declaration (Identity's declarations slot): null removes it. */
export function clockDeclaration(c: Clock | null): { spec: string; kind: number; cbor?: Uint8Array } {
  if (!c) return { spec: MIPS.finance, kind: CLOCK_KIND };
  const ref = (r: ClockRef) => [unhex(r.cmip), cborDecode(unhex(r.params))];
  return { spec: MIPS.finance, kind: CLOCK_KIND, cbor: cborEncode([ref(c.main), ...(c.backup ? [ref(c.backup)] : [])]) };
}

interface Pending {
  /** The rotation's exact bytes, base64: resubmitted unchanged (Identity rule 8a). */
  rotation: string;
  id: string;
  signingSecret: string;
  safety: Safety;
  homes: Home[];
  rule: number[] | null;
  /** The clock in force once it counts; absent where the rotation leaves it unchanged. */
  clock?: Clock | null;
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
  /** The clock its chain declares (Finance, F176), public; absent or null: none. */
  clock?: Clock | null;
  /** The anchors this client obtained after its lock changes (Finance rule 15, F181). */
  anchored?: { act: string; on: 'main' | 'backup'; proof: string }[];
  /** The everyday sequence, act ids, oldest first. */
  sequence: string[];
  routes: { version: number; act: string } | null;
  /** Every encryption key published, oldest first; old ones still open old deliveries. */
  encryption: { version: number; act: string; secret: string }[];
  pending: Pending | null;
  /**
   * For a collective (Law, F127): the decision its next action cites on its
   * chain, the collective's own identity as chain: its genesis, its latest
   * rotation, or its latest record. Absent for anyone else. Every everyday
   * act it signs cites it, except Identity's own acts (which carry no
   * objects) and records, decisions that cite by their kept tips.
   */
  cites?: string[];
  /**
   * Grant keys this identity holds as a grantee (Law, F128): for each grant
   * naming it, the secret part of the key the grant names (field 9). Acts
   * signed with it are the granting collective's own, within the grant.
   */
  grantKeys?: { grant: string; collective: string; secret: string }[];
}

/** Law's record (type 17): a decision, which cites by its kept tips (F127). */
const LAW_RECORD = 17;

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
  static create(opts: { homes: Home[]; rule?: number[]; scheme?: 2 | 3; via?: Via; clock?: Clock }): TestIdentity {
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
      declarations: opts.clock ? [clockDeclaration(opts.clock)] : undefined,
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
        clock: opts.clock ?? null,
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
    // F127: a collective's action cites, on its chain, the decision it acts
    // under, after the entries its type defines.
    const isRecord = spec === MIPS.law && type === LAW_RECORD;
    let objects = opts.objects;
    if (this.f.cites && spec !== SPECS.identity && !isRecord && !objects?.some((o) => o[0] === this.f.identity)) {
      objects = [...(objects ?? []), ...this.f.cites.map((d): [string, string] => [this.f.identity, d])];
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
      objects,
      refs: opts.refs,
      acks: opts.acks,
    }) as { act: Uint8Array; id: string; key: Uint8Array };
    this.f.sequence.push(made.id);
    // A record is the collective's latest decision: its next actions cite it.
    if (this.f.cites && isRecord) this.f.cites = [made.id];
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
  prepareRotation(opts: { homes?: Home[]; rule?: number[]; scheme?: 2 | 3; clock?: Clock | null } = {}): string {
    if (this.f.pending) throw new Error('a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)');
    const newSigning = newSigningSecret();
    const next = newTestSafetyKey(opts.scheme ?? (this.f.safety.scheme as 2 | 3));
    const seq = this.f.sequence;
    const kept = seq.length
      ? [{ act: seq[seq.length - 1], position: seq.length, summary: runningSummary(seq) }]
      : [];
    // The latest identity-chain act: the binding, or a chain signature
    // made since (F132).
    const chain = this.chainActs();
    const previous = actId(chain[chain.length - 1]);
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous,
      position: chain.length,
      safetyScheme: this.f.safety.scheme,
      safetySeeds: unhex(this.f.safety.seeds),
      newSigningPublic: signingPublic(newSigning),
      nextSafetyScheme: next.scheme,
      nextSafetyCommit: next.commit,
      kept,
      homes: opts.homes,
      rule: opts.rule,
      declarations: opts.clock !== undefined ? [clockDeclaration(opts.clock)] : undefined,
    });
    const id = actId(rotation);
    this.f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: next.scheme, seeds: hex(next.seeds) },
      homes: opts.homes ?? this.f.homes,
      rule: opts.rule === undefined ? this.f.rule : opts.rule.length ? opts.rule : null,
      clock: opts.clock,
    };
    return id;
  }

  /**
   * What to say plainly before a genesis or a rotation, where it leaves the
   * identity with no clock (Finance rule 14b, F181): `NO_CLOCK_WARNING`, or
   * null. `clock` is what the act would declare (undefined: unchanged).
   */
  clockWarning(clock?: Clock | null): string | null {
    const after = clock === undefined ? this.f.clock : clock;
    return after ? null : NO_CLOCK_WARNING;
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
  async settleRotation(anchoring: Anchoring[] = []): Promise<{ counts: boolean; lookup: Lookup; anchored: Anchored[]; unanchored?: string }> {
    const p = this.f.pending;
    if (!p) throw new Error('no rotation pending');
    const lookup = await lookUp(this.f.identity, [...this.f.homes, ...p.homes].map((h) => h.hint), this.via);
    const links = lookup.resolution.links;
    const counts = links.some((l) => l.act === p.id);
    const before = this.f.clock ?? null;
    let anchored: Anchored[] = [];
    let unanchored: string | undefined;
    if (counts) {
      this.f.chain.push(p.rotation);
      this.f.position = this.f.chain.length - 1;
      this.f.binding = p.id;
      this.f.signingSecret = p.signingSecret;
      this.f.safety = p.safety;
      this.f.homes = p.homes;
      this.f.rule = p.rule;
      if (p.clock !== undefined) this.f.clock = p.clock;
      this.f.pending = null;
      // A rotation is a decision: a collective's next actions cite it (F127).
      if (this.f.cites) this.f.cites = [p.id];
      await this.spread(lookup);
      // Finance rule 15 (F181, client conformance): after a lock change,
      // obtain the home receipts that make up the rotation's quorum and
      // anchor them on the main reference of the clock declared before it;
      // on the backup only where the main one cannot be used. Any rotation
      // can be a lock change (it voids what its kept line does not hold,
      // and whatever it changes in the vault), so every one is anchored.
      try {
        anchored = await this.anchorQuorum(lookup, p.id, before, anchoring);
        this.f.anchored = [...(this.f.anchored ?? []), ...anchored.map((a) => ({ act: a.act, on: a.on, proof: b64(a.proof) }))];
      } catch (e) {
        unanchored = (e as Error).message;
      }
    }
    return { counts, lookup, anchored, unanchored };
  }

  /**
   * Anchor a counting rotation's home quorum on `clock` (Finance rule 15,
   * F180, F181): every receipt the core library names as supporting it
   * under the home rule before it (for a homeless rotation, the new homes'
   * receipts under the new rule, F182; for a self-hosted identity, the
   * rotation itself), on the main reference, or, where no anchoring for it is given
   * or it fails, on the backup. Nothing where no clock was declared: there
   * is nothing to compare on, and the owner bears (said by `clockWarning`).
   */
  async anchorQuorum(lookup: Lookup, rotation: string, clock: Clock | null, anchoring: Anchoring[]): Promise<Anchored[]> {
    if (!clock) return [];
    const q = lookup.verifier.quorum(this.f.identity, rotation) as { kind: string; need: number; supports: string[][] } | null;
    if (!q) return [];
    const acts = q.supports.flat();
    const tryOn = async (ref: ClockRef | undefined, on: 'main' | 'backup'): Promise<Anchored[] | null> => {
      const a = ref && anchoring.find((x) => sameRef(x.reference, ref));
      if (!a) return null;
      try {
        const out: Anchored[] = [];
        for (const act of acts) out.push({ act, on, proof: await a.anchor(act) });
        return out;
      } catch {
        return null;
      }
    };
    const done = (await tryOn(clock.main, 'main')) ?? (await tryOn(clock.backup, 'backup'));
    if (!done) throw new Error('the rotation counts, but its home quorum could not be anchored on the declared clock: anchor it before relying on it (Finance rule 15)');
    return done;
  }

  /**
   * A chain signature (Identity type 16, F132): `signs` signed with the
   * safety key the latest identity-chain act committed, on the identity
   * chain, committing a new one; the everyday key, homes and rules stay.
   * Law takes a member's signature on a fork or closing only in this form.
   * The safety key is spent once signed, so the act is kept in the chain
   * file at once and sent to every home, as a rotation is (the same bytes
   * whenever resent, rule 8a); it counts once the homes hold it. Sent to
   * `relays` too, beside the act it signs.
   */
  async chainSign(signs: string, relays: string[] = []): Promise<{ id: string; counts: boolean; sent: Submitted[] }> {
    if (this.f.pending) throw new Error('a rotation is pending: submit and settle it first; one safety key signs one identity-chain act (Identity rule 8a)');
    const next = newTestSafetyKey(this.f.safety.scheme as 2 | 3);
    const chain = this.chainActs();
    const act = makeChainSignature({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous: actId(chain[chain.length - 1]),
      position: chain.length,
      safetyScheme: this.f.safety.scheme,
      safetySeeds: unhex(this.f.safety.seeds),
      nextSafetyScheme: next.scheme,
      nextSafetyCommit: next.commit,
      signs,
    });
    const id = actId(act);
    this.f.chain.push(b64(act));
    this.f.safety = { scheme: next.scheme, seeds: hex(next.seeds) };
    const sent = await this.submitChainAct(act, this.f.homes);
    for (const hint of relays) await relayAt(hint, this.via).putAct(act);
    const lookup = await lookUp(this.f.identity, this.f.homes.map((h) => h.hint), this.via);
    const counts = lookup.resolution.links.some((l) => l.act === id);
    if (counts) await this.spread(lookup);
    return { id, counts, sent };
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

  /**
   * Make a grant key (Law, F128): a fresh signing key, its secret kept in
   * this identity's file under the grant once known; its public part, as
   * Identity's `[scheme, key]`, goes into the grant (field 9).
   */
  makeGrantKey(): { secret: Uint8Array; public: [number, Uint8Array] } {
    const secret = newSigningSecret();
    return { secret, public: [1, signingPublic(secret)] };
  }

  /** Keep a grant key's secret, under the grant that names it (F128). */
  keepGrantKey(grant: string, collective: string, secret: Uint8Array): void {
    this.f.grantKeys = [...(this.f.grantKeys ?? []).filter((k) => k.grant !== grant), { grant, collective, secret: hex(secret) }];
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
   * Acts its homes hold signed by this identity that this file did not make
   * (F152): each a warning for the owner. A home takes an act of an
   * identity it serves only signed with the key its binding set, and serves
   * the identity's private acts too, sealed, as opaque acts by their signer;
   * so a private link that a thief confirmed with a stolen signing key
   * counts only once it is published there, where this shows it. The owner
   * cannot read it, only see that it exists: if they did not make it
   * elsewhere, the signing key may be stolen, and a rotation ends its use.
   * Homes that do not answer are skipped: silence proves nothing.
   */
  async unrecognised(): Promise<{ id: string; home: string; private: boolean }[]> {
    const known = new Set([...this.f.sequence, ...this.chainActs().map((a) => actId(a))]);
    const out: { id: string; home: string; private: boolean }[] = [];
    const seen = new Set<string>();
    for (const h of this.f.homes) {
      try {
        let after: number | undefined;
        for (;;) {
          const page = await this.relay(h.hint).feed({ signer: this.f.identity, after });
          for (const it of page.items) {
            if (it.kind !== 'act') continue;
            const d = describeAct(it.item) as { id: string; signer?: string; public: boolean };
            if (d.signer !== this.f.identity || known.has(d.id) || seen.has(d.id)) continue;
            seen.add(d.id);
            out.push({ id: d.id, home: h.hint, private: !d.public });
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        // this home did not answer: nothing learnt from it
      }
    }
    return out;
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
