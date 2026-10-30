// A test identity and what the genesis client does with it: genesis, routes,
// encryption key, rotation, looking an identity up, and delivering keys in
// sealed containers (Identity; Envelopes draft 6; relay transport cMIP).
//
// A TEST IDENTITY HOLDS ITS CHAIN KEY IN SOFTWARE. It is a prototype, never
// for a real identity: the real identity's chain key is made and used only
// by the air-gapped chain key Module (build brief; roadmap step 17).

import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import {
  ACK_SPECS,
  MIRS,
  base64,
  SPECS,
  ENVELOPES_TYPES,
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
  newTestChainKey,
  openSealed,
  pickupTag,
  readKeyDelivery,
  routesPayload,
  chainKeyFromSeeds,
  seal,
  sealedParts,
  signingPublic,
  unhex,
  xwingPublic,
} from './core.ts';
import { WITNESS_EXPLANATION } from './witness.ts';
import { CODE, Relay, RelayError, type PutResult, type Via, relayAt, sealedId } from './transport.ts';
import { record } from './kex.ts';
import { lookUp, type Home, type Lookup, type Reference, type RouteIn } from './lookup.ts';
import { actsBy, checkWarned, linesOf, planLines, type Card, type FoundLine, type LinePlan, type Specs } from './lines.ts';

export { lookUp, followRef, referTo, referenceTo, carryChains, chainOf, type Carried, refAct, refSigner, cannotReach, type Followed, type Home, type Lookup, type NotTried, type Reference, type Resolution, type RouteIn } from './lookup.ts';

export const TEST_LABEL =
  'MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.';

interface ChainKey {
  scheme: number;
  /** FIPS 205 seeds, hex (48 bytes). */
  seeds: string;
}

/**
 * One anchoring reference: an anchoring cMIP and its parameters, naming one
 * time reference (Envelopes, task "Anchoring"; Money's clock, F181). The
 * parameters are deterministic CBOR, hex.
 */
export interface ClockRef {
  cmip: string;
  params: string;
}

/**
 * The clock the owner declares with the chain key (Money, "The clock",
 * F176, F179): a main anchoring reference and, optionally, a backup. A lock
 * change is compared with payers' claims on it (Money rule 15). Public.
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

/** Money's clock kind in the declarations slot (F176). */
export const CLOCK_KIND = 1;

/**
 * Said plainly before a genesis or a rotation that leaves the identity with
 * no declared clock (Money rule 14b, F181: client conformance).
 */
export const NO_CLOCK_WARNING =
  'This identity declares no clock. If its signing key is ever stolen, what the thief does with it until you change your keys, and every payment made to what the thief published, will be your loss, whatever you anchor: payers are compared with your key change only on a clock you named in advance (Money rule 15).';

const sameRef = (a: ClockRef, b: ClockRef) => a.cmip === b.cmip && a.params === b.params;

/** The clock as a declaration (Identity's declarations slot): null removes it. */
export function clockDeclaration(c: Clock | null): { spec: string; kind: number; cbor?: Uint8Array } {
  if (!c) return { spec: MIRS.money, kind: CLOCK_KIND };
  const ref = (r: ClockRef) => [unhex(r.cmip), cborDecode(unhex(r.params))];
  return { spec: MIRS.money, kind: CLOCK_KIND, cbor: cborEncode([ref(c.main), ...(c.backup ? [ref(c.backup)] : [])]) };
}

interface Pending {
  /** The rotation's exact bytes, base64: resubmitted unchanged (Identity rule 8a). */
  rotation: string;
  id: string;
  signingSecret: string;
  safety: ChainKey;
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
  /** The chain key the current chain act committed: the next to be revealed. */
  safety: ChainKey;
  /** This identity's chain acts, exact bytes, base64, oldest first. */
  chain: string[];
  homes: Home[];
  rule: number[] | null;
  /** The clock its chain declares (Money, F176), public; absent or null: none. */
  clock?: Clock | null;
  /** The anchors this client obtained after its lock changes (Money rule 15, F181). */
  anchored?: { act: string; on: 'main' | 'backup'; proof: string }[];
  /**
   * The everyday sequence, act ids, oldest first. Since F376, this app's
   * public line: its public acts only, so that anyone can follow it after a
   * change of keys. For a collective, its one line.
   */
  sequence: string[];
  /** This app's private line (F376): its private acts, kept through a change of keys by its card. */
  private?: string[];
  /** The line this app kept before F376, public and private acts together: frozen, kept by its own card. */
  earlier?: string[];
  /** Whether this file keeps its public and private acts on two lines (F376). */
  split?: boolean;
  routes: { version: number; act: string } | null;
  /** Every encryption key published, oldest first; old ones still open old deliveries. */
  encryption: { version: number; act: string; secret: string; /** Its public half, hex, where the secret is not held here (an identity held by Kišib's runner): `secret` is then empty. */ public?: string }[];
  pending: Pending | null;
  /**
   * For a collective (Agreements rule 58): the decision its next action cites on its
   * chain, the collective's own identity as chain (its genesis, its latest
   * rotation, record, grant or revocation), then the last act made for it
   * from this device since, so that the next act joins the heads. Absent
   * for anyone else. Every act made for it cites them, except Identity's
   * own acts (which carry no objects). A collective has no signing key
   * (rule 56): a member makes each act for it with their own key
   * (`TestIdentity.actor`).
   */
  cites?: string[];
  /**
   * Grant keys this identity holds as a grantee (Agreements, F128): for each grant
   * naming it, the secret part of the key the grant names (field 9). Acts
   * signed with it are the granting collective's own, within the grant.
   */
  grantKeys?: { grant: string; collective: string; secret: string }[];
  /**
   * Private acts signed here that no home has yet taken both ways (H80's
   * question 2): locked, and sealed to this identity itself (`private.ts`,
   * `leaveAtHomes`). Each act's bytes and content key, base64, by id; sent
   * again before this app shows its line's card. Absent for a collective.
   */
  unsent?: Record<string, { act: string; key: string }>;
}

/**
 * The line an act goes on (F376, decided by Nobody, allegedly, 21 October
 * 2026, option (a) of `docs/private-lines-report.md`'s question 1): a
 * member's public acts on one line, its private acts on another, so that a
 * public act is never behind a private one and anyone can follow the public
 * line after a change of keys. A file from before keeps its mixed line as
 * it is (`earlier`), kept by its own card; both new lines start empty. A
 * collective keeps its one line (its acts are the collective's).
 */
export function lineFor(f: IdentityFile, isPublic: boolean): string[] {
  if (f.cites) return f.sequence;
  if (!f.split) {
    if (f.sequence.length) f.earlier = f.sequence;
    f.sequence = [];
    f.private = [];
    f.split = true;
  }
  return isPublic ? f.sequence : (f.private ??= []);
}

/** The line the next act goes on, as `lineFor` would choose it, without changing the file (a draft read before signing). */
export function nextLine(f: IdentityFile, isPublic: boolean): string[] {
  if (f.cites) return f.sequence;
  if (!f.split) return [];
  return isPublic ? f.sequence : (f.private ?? []);
}

/** Every line this file keeps, each oldest first: the public, the private, and the one kept before F376. Empty lines left out. */
export function ownLines(f: IdentityFile): string[][] {
  return [f.sequence, f.private ?? [], f.earlier ?? []].filter((l) => l.length);
}

/** Every act on this file's lines. */
export function ownIds(f: IdentityFile): string[] {
  return ownLines(f).flat();
}

/** New lines for new words (an identity brought again, or its key renewed): nothing of the earlier lines continues. */
export function freshLines(f: IdentityFile): void {
  f.sequence = [];
  f.private = [];
  delete f.earlier;
  f.split = true;
}

/**
 * What a signer outside this file signs (the Dubsar runner cMIP, section 3):
 * an everyday act, field by field, the line it goes on and that line's acts
 * so far. Used where the file holds no signing key: an identity held by
 * Kišib's runner, which signs for the app.
 */
export interface SignRequest {
  identity: string;
  binding: string;
  /** The line (F376): `apart` for an act on a line of its own (`signApart`). */
  line: 'public' | 'private' | 'apart';
  sequence: string[];
  spec: string;
  type: number;
  payload: Uint8Array;
  public: boolean;
  to?: string[];
  objects?: [string, string][];
  refs?: Reference[];
  acks?: string[];
}

/** Signs a request elsewhere (the runner) and returns the act made, its ID and content key, as `makeEveryday` does. */
export type Signer = (r: SignRequest) => Promise<{ act: Uint8Array; id: string; key: Uint8Array }>;

/** Said where an act would be signed here for an identity whose key this app does not hold. */
export const HELD_ELSEWHERE_SAY = 'This identity’s signing key is not held by this app: it is signed for by Kišib’s runner, and this act cannot be signed that way here. Nothing was signed.';

/** Agreements' decisions on a collective's chain (rule 58): grant (9), revocation (10), record (17). */
const AGREEMENTS_DECISIONS = [9, 10, 17];

/** Said where an act would be made for a collective with no member to make it: a collective signs no act of its own. */
export const NO_ACTOR_SAY = 'A collective has no signing key (Agreements rule 56): a member acts for it with their own key, naming it. No member was given to act here, and nothing was signed.';

// No Buffer: Dub's web client runs this file in a browser (clients/dub/src/web).
const b64 = (b: Uint8Array) => base64(b);
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** What one home answered to one act. */
export interface Submitted {
  home: string;
  result?: PutResult;
  error?: string;
  code?: number;
}

export class TestIdentity {
  /** Where this file holds no signing key: who signs for it (the Dubsar runner cMIP). Never saved with the file. */
  signer?: Signer;
  /**
   * For a collective (no signing key, Agreements rule 56): the member who
   * makes its next acts, each with their own key, naming the collective in
   * `objects` (rule 58). Never saved with the file.
   */
  actor?: TestIdentity;

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
   * A new test identity: an signing key, a chain key held in
   * software and committed by hash, and a genesis naming its homes. Nothing
   * is sent yet: save the file first, then `publishGenesis`.
   */
  static create(opts: {
    homes: Home[];
    rule?: number[];
    scheme?: 2 | 3;
    via?: Via;
    clock?: Clock;
    /** A chain key made elsewhere (Dub's web client derives it from a seed it shows once as words, then drops). */
    chainKey?: { scheme: number; seeds: Uint8Array; commit: string };
  }): TestIdentity {
    if (!opts.homes.length) throw new Error('a genesis declares at least one home');
    const signingSecret = newSigningSecret();
    const chainKey = opts.chainKey ?? (newTestChainKey(opts.scheme ?? 2) as { scheme: number; seeds: Uint8Array; commit: string });
    const genesis = makeGenesis({
      identitySpec: SPECS.identity,
      signingSecret,
      chainKeyScheme: chainKey.scheme,
      chainKeyCommit: chainKey.commit,
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
        safety: { scheme: chainKey.scheme, seeds: hex(chainKey.seeds) },
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

  /** The objects an everyday act carries: a collective's action cites the decision it acts under, after the entries its type defines (F127). */
  private everydayObjects(spec: string, type: number, objects: [string, string][] | undefined, acks?: string[]): [string, string][] | undefined {
    // F110: only Identity, Money and Agreements act types carry acknowledgements;
    // a text act, a publication or a cMIP's act carrying them is invalid.
    // To rely on such an act, sign a witness act (see `witness`).
    if (acks?.length && !ACK_SPECS.includes(spec)) {
      throw new Error('only Identity, Money and Agreements acts may acknowledge (Envelopes rule 4a, F110): to rely on this act, sign a witness act');
    }
    if (this.f.cites && spec !== SPECS.identity && !objects?.some((o) => o[0] === this.f.identity)) {
      objects = [...(objects ?? []), ...this.f.cites.map((d): [string, string] => [this.f.identity, d])];
    }
    return objects;
  }

  /** After an act is made: on its line, waiting for the homes if private, a record cited next. */
  private everydayMade(spec: string, type: number, isPublic: boolean, line: string[], made: { act: Uint8Array; id: string; key: Uint8Array }) {
    line.push(made.id);
    // A private act waits to be left at the homes, locked and sealed to this identity (`private.ts`): a member's line, not a collective's.
    if (!isPublic && !this.f.cites) (this.f.unsent ??= {})[made.id] = { act: b64(made.act), key: b64(made.key) };
    // A decision is the collective's latest: its next acts cite it; any
    // other act is the head the next one joins (rule 58).
    if (this.f.cites) this.f.cites = spec === MIRS.agreements && AGREEMENTS_DECISIONS.includes(type) ? [made.id] : [this.f.cites[0], made.id];
    return made;
  }

  /** Whether this file is a collective's, keyless: its acts are made by a member (`actor`). */
  get keyless(): boolean {
    return !!this.f.cites && !this.f.signingSecret;
  }

  /** An act for this keyless collective, made by its `actor` with their own key, naming the collective (rule 58). */
  private async byActor(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: Reference[]; acks?: string[]; hint?: string },
  ): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
    if (!this.actor) throw new Error(NO_ACTOR_SAY);
    const objects = this.everydayObjects(spec, type, opts.objects, opts.acks);
    const made = await this.actor.everydayNow(spec, type, payload, { ...opts, objects });
    return this.everydayMade(spec, type, true, this.f.sequence, made);
  }

  everyday(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: Reference[]; acks?: string[]; hint?: string },
  ): { act: Uint8Array; id: string; key: Uint8Array } {
    if (this.keyless && this.actor) {
      const made: { act: Uint8Array; id: string; key: Uint8Array } = this.actor.everyday(spec, type, payload, { ...opts, objects: this.everydayObjects(spec, type, opts.objects, opts.acks) });
      return this.everydayMade(spec, type, true, this.f.sequence, made);
    }
    if (!this.f.signingSecret) throw new Error(this.f.cites ? NO_ACTOR_SAY : HELD_ELSEWHERE_SAY);
    const objects = this.everydayObjects(spec, type, opts.objects, opts.acks);
    // F376: a member's public and private acts on two lines; a collective's on its one.
    const line = lineFor(this.f, opts.public);
    const made = makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: line,
      public: opts.public,
      to: opts.to,
      objects,
      refs: opts.refs,
      acks: opts.acks,
      // The signer's own hint (field 9, display only): no app writes one yet (whether they should is not decided).
      ...(opts.hint !== undefined ? { hint: opts.hint } : {}),
    }) as { act: Uint8Array; id: string; key: Uint8Array };
    return this.everydayMade(spec, type, opts.public, line, made);
  }

  /**
   * An everyday act signed here, or, where this file holds no signing key,
   * by its `signer` (Kišib's runner, which may wait for the person's click).
   * The line is the same either way. One act at a time: the caller keeps
   * signing serial, as every app does.
   */
  async everydayNow(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: Reference[]; acks?: string[]; hint?: string },
  ): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
    if (this.keyless) return this.byActor(spec, type, payload, opts);
    if (this.f.signingSecret || !this.signer) return this.everyday(spec, type, payload, opts);
    const objects = this.everydayObjects(spec, type, opts.objects, opts.acks);
    const line = lineFor(this.f, opts.public);
    const made = await this.signer({
      identity: this.f.identity,
      binding: this.f.binding,
      line: this.f.cites ? 'public' : opts.public ? 'public' : 'private',
      sequence: [...line],
      spec,
      type,
      payload,
      public: opts.public,
      ...(opts.to ? { to: opts.to } : {}),
      ...(objects ? { objects } : {}),
      ...(opts.refs ? { refs: opts.refs } : {}),
      ...(opts.acks ? { acks: opts.acks } : {}),
    });
    return this.everydayMade(spec, type, opts.public, line, made);
  }

  /** Send an everyday identity act to every home: its standing depends on it (Envelopes, "How acts reach people"). */
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
    const made = await this.everydayNow(SPECS.identity, IDENTITY_TYPES.routes, payload, { public: true });
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
    if (acts.some((a) => ownIds(this.f).includes(a))) throw new Error("a witness act names other identities' acts, not this one's");
    const made = await this.everydayNow(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(new Map()), { public: true, acks: acts });
    const sent = await this.toHomes(made.act);
    for (const hint of opts.relays ?? []) await relayAt(hint, this.via).putAct(made.act);
    return { id: made.id, act: made.act, sent };
  }

  /**
   * Publish a new encryption key (Envelopes type 4): a fresh X-Wing key
   * pair, or the one `secret` gives (the identity carry Module, draft 2,
   * derives it from the signing seed); the public half in the act, the
   * private half kept in the file.
   */
  async publishEncryptionKey(given?: Uint8Array): Promise<{ id: string; sent: Submitted[] }> {
    const last = this.f.encryption.at(-1);
    const version = (last?.version ?? 0) + 1;
    const secret = given ?? newEncryptionSecret();
    const payload = encryptionKeyPayload(version, last?.act, xwingPublic(secret));
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.encryptionKey, payload, { public: true });
    this.f.encryption.push({ version, act: made.id, secret: hex(secret) });
    return { id: made.id, sent: await this.toHomes(made.act) };
  }

  // ------------------------------------------------------------ rotation

  /**
   * Every line of this identity's everyday acts that a rotation would judge
   * (Identity rule 35, was 17; `lines.ts`): read from its homes, the
   * relays its routes name, and `hints`, each followed back by `prev` to
   * its first act; this device's own line among them.
   */
  async lines(o: { hints?: string[]; specs?: Specs } = {}): Promise<FoundLine[]> {
    const homes = this.f.homes.map((h) => h.hint);
    let routed: string[] = [];
    try {
      routed = (await lookUp(this.f.identity, homes, this.via)).routes.routes.flatMap((r) => r.hints);
    } catch {
      // its homes did not answer: what the hints hold is still read
    }
    const at = [...new Set([...homes, ...routed, ...(o.hints ?? [])])];
    return linesOf({ identity: this.f.identity, binding: this.f.binding, own: ownLines(this.f), acts: await actsBy(this.f.identity, at, this.via), specs: o.specs });
  }

  /**
   * What a rotation would keep (Identity rule 35, client conformance): the
   * lines read now, every one kept unless named in `leaveOut` (by its
   * latest act); a line this device cannot read kept by its card in
   * `cards`, or, given none, left out. Show `plan.shown` to the owner, and
   * `plan.warning` where it is not null, before signing.
   */
  async planRotation(o: { leaveOut?: string[]; cards?: Card[]; hints?: string[]; specs?: Specs } = {}): Promise<{ lines: FoundLine[]; plan: LinePlan }> {
    const lines = await this.lines(o);
    return { lines, plan: planLines(lines, o) };
  }

  /**
   * Prepare a rotation: a new signing key, a new committed chain key, and
   * every line of this identity's acts kept (`planRotation`): its own, the
   * other apps' and devices', read from its homes and relays, and those it
   * cannot read by the cards given. A line left out, by name or for want of
   * a card, is left out only where `warned` is, word for word, the warning
   * shown (`plan.warning`): otherwise nothing is signed. Optionally new
   * homes or rule (`rule: []` returns to the default). Signed with the
   * chain key the current chain act committed. The rotation is stored as
   * pending; save the file before submitting, so that a retry sends the
   * same bytes.
   */
  async prepareRotation(
    opts: { homes?: Home[]; rule?: number[]; scheme?: 2 | 3; clock?: Clock | null; leaveOut?: string[]; cards?: Card[]; warned?: string; hints?: string[] } = {},
  ): Promise<string> {
    if (this.f.pending) throw new Error('a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)');
    const { plan } = await this.planRotation(opts);
    checkWarned(plan, opts.warned);
    if (this.f.pending) throw new Error('a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)');
    const newSigning = newSigningSecret();
    const next = newTestChainKey(opts.scheme ?? (this.f.safety.scheme as 2 | 3));
    const kept = plan.kept;
    // The latest identity-chain act: the binding, or a chain signature
    // made since (F132).
    const chain = this.chainActs();
    const previous = actId(chain[chain.length - 1]);
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous,
      position: chain.length,
      chainKeyScheme: this.f.safety.scheme,
      chainKeySeeds: unhex(this.f.safety.seeds),
      newSigningPublic: signingPublic(newSigning),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
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
   * identity with no clock (Money rule 14b, F181): `NO_CLOCK_WARNING`, or
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
      // Money rule 15 (F181, client conformance): after a lock change,
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
   * Anchor a counting rotation's home quorum on `clock` (Money rule 15,
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
    if (!done) throw new Error('the rotation counts, but its home quorum could not be anchored on the declared clock: anchor it before relying on it (Money rule 15)');
    return done;
  }

  /**
   * A chain signature (Identity type 16, F132): `signs` signed with the
   * chain key the latest identity-chain act committed, on the identity
   * chain, committing a new one; the signing key, homes and rules stay.
   * Agreements take a member's signature on a fork or closing only in this form.
   * The chain key is spent once signed, so the act is kept in the chain
   * file at once and sent to every home, as a rotation is (the same bytes
   * whenever resent, rule 8a); it counts once the homes hold it. Sent to
   * `relays` too, beside the act it signs.
   */
  async chainSign(
    signs: string,
    relays: string[] = [],
    shared?: { scheme: number; seeds: Uint8Array; next: { scheme: number; commit: string } },
  ): Promise<{ id: string; counts: boolean; sent: Submitted[] }> {
    if (this.f.pending) throw new Error('a rotation is pending: submit and settle it first; one chain key signs one identity-chain act (Identity rule 8a)');
    // `shared`: a chain key held as shares (a collective's), rebuilt by the
    // caller, the next one dealt as shares too, so never kept whole here.
    const fresh = shared ? null : newTestChainKey(this.f.safety.scheme as 2 | 3);
    const next = shared ? shared.next : fresh!;
    const chain = this.chainActs();
    const act = makeChainSignature({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous: actId(chain[chain.length - 1]),
      position: chain.length,
      chainKeyScheme: shared ? shared.scheme : this.f.safety.scheme,
      chainKeySeeds: shared ? shared.seeds : unhex(this.f.safety.seeds),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
      signs,
    });
    const id = actId(act);
    this.f.chain.push(b64(act));
    this.f.safety = { scheme: next.scheme, seeds: fresh ? hex(fresh.seeds) : '' };
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
   * Make a grant key (Agreements, F128): a fresh signing key, its secret kept in
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

  /** The public half of the chain key held for the next rotation. */
  nextChainKey(): { scheme: number; commit: string } {
    const s = chainKeyFromSeeds(this.f.safety.scheme, unhex(this.f.safety.seeds));
    return { scheme: s.scheme, commit: s.commit };
  }

  // ------------------------------------------------------------ keys

  /**
   * Deliver a content key to another identity (Envelopes, "Key delivery"):
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
    const inbox = them.inbox(SPECS.envelopes);
    if (!inbox) throw new Error('that identity declares no inbox');
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, {
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
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, { public: false });
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
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: Reference[]; acks?: string[] },
  ): { act: Uint8Array; id: string; key: Uint8Array } {
    return this.everyday(spec, type, payload, opts);
  }

  /** As `sign`, by the runner where this file holds no signing key (the Dubsar runner cMIP). */
  signNow(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; to?: string[]; objects?: [string, string][]; refs?: Reference[]; acks?: string[] },
  ): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
    return this.everydayNow(spec, type, payload, opts);
  }

  /**
   * Sign a private act on a line of its own (one act, first in its line),
   * outside this identity's sequence, never left at its homes: for an act
   * whose content no other app of this identity may read, a share of a
   * collective's chain key (F337). *Cost:* its line is never kept by a
   * change of keys, so the act is void after the next one; it is read once,
   * soon after it is made.
   */
  signApart(spec: string, type: number, payload: Uint8Array, opts: { to?: string[]; refs?: Reference[] } = {}): { act: Uint8Array; id: string; key: Uint8Array } {
    if (!this.f.signingSecret) throw new Error(HELD_ELSEWHERE_SAY);
    return makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: [],
      public: false,
      to: opts.to,
      refs: opts.refs,
    }) as { act: Uint8Array; id: string; key: Uint8Array };
  }

  /** As `signApart`, by the runner where this file holds no signing key: the act on its line of its own (`apart`). */
  async signApartNow(spec: string, type: number, payload: Uint8Array, opts: { to?: string[]; refs?: Reference[] } = {}): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
    if (this.f.signingSecret || !this.signer) return this.signApart(spec, type, payload, opts);
    return this.signer({ identity: this.f.identity, binding: this.f.binding, line: 'apart', sequence: [], spec, type, payload, public: false, ...(opts.to ? { to: opts.to } : {}), ...(opts.refs ? { refs: opts.refs } : {}) });
  }

  /**
   * Publish an act on this identity's own relays, for example a private
   * post whose key it will deliver. Returns the act id and its content key.
   */
  async publish(
    spec: string,
    type: number,
    payload: Uint8Array,
    opts: { public: boolean; relays: string[]; to?: string[]; objects?: [string, string][]; refs?: Reference[]; acks?: string[]; hint?: string },
  ) {
    const made = await this.everydayNow(spec, type, payload, {
      public: opts.public,
      to: opts.to,
      objects: opts.objects,
      refs: opts.refs,
      acks: opts.acks,
      hint: opts.hint,
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
    const known = new Set([...ownIds(this.f), ...this.chainActs().map((a) => actId(a))]);
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
  /** A message: the text of a text act (Text MIR, type 0), as the core library opened it. */
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
    if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery && d.payload) {
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
