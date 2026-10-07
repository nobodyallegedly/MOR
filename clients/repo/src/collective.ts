// A test collective (Law rules 35 to 37): an identity of its own, founded by
// an agreement its members sign, its everyday key with one member, its
// safety key dealt as shares among the members (air-gapped Module, section
// 5), its members changed by a clone of the founding agreement plus a
// rotation declaring the clone.
//
// A TEST COLLECTIVE HOLDS EVERY KEY IN SOFTWARE, IN ONE FILE: the everyday
// key and every member's share. Its members are simulated, so the mechanics
// run (release rule, visible signatures, clone, rotation) while independent
// consent does not (roadmap step 5a, "Run and not run"). A real collective
// deals and rebuilds its safety key on offline devices, one share per member.

import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import {
  SPECS,
  actId,
  dealSafety,
  declarationPayload,
  hex,
  makeGenesis,
  makeRotation,
  newSigningSecret,
  rebuildSafety,
  runningSummary,
  signingPublic,
  verifyShare,
} from '../../genesis/src/core.ts';
import { TestIdentity, type Home, type IdentityFile, type Submitted } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import {
  LAW_SPECS,
  clonePlan,
  declare,
  markMatches,
  proposePayload,
  record,
  resign,
  sign,
  signedVersions,
  termsPayload,
  type CollectiveTerms,
  type MarkEntry,
  type Stake,
  type Power,
  type Rule,
} from './law.ts';
import { FOUNDING_AGREEMENT, REPO_SPECS } from './specs.ts';

export const COLLECTIVE_LABEL =
  'MOR TEST COLLECTIVE. Its everyday key and every member share are held in software, in this file: a prototype, never for a real collective.';

const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const same = (a: Uint8Array, b: Uint8Array) => Buffer.from(a).equals(Buffer.from(b));
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

/** A dealing of the collective's safety key: one share per holder. */
export interface Dealt {
  scheme: number;
  /** The key's number in the collective's life: 0 at genesis, +1 per rotation. */
  index: number;
  threshold: number;
  commit: string;
  /** The dealing's fingerprint, which every holder compares with every other. */
  fingerprint: string;
  shares: { holder: string; share: string }[];
}

/** How the collective is governed, the same in the founding agreement and every clone. */
export interface Governance {
  /** Any k members rebuild the safety key (a way to rotate below the member count). */
  safetyThreshold: number;
  /** The release rule, an area held by every member: any k members' own
   * signature acts make a publication of the collective count. */
  releaseThreshold: number;
  /** Any k of the parties complete a clone under the clone rule: the
   * judicial tier and matters outside every area (Law draft 7). */
  cloneThreshold: number;
  /** The constitutional change rule (members, the rules, the key grammar,
   * the areas): any k of the parties. Absent: every party whose voice
   * remains (F103), the default nobody loses their say under. */
  constitutionalThreshold?: number;
  /** The release area's own words (terms field 20), changed by its holders. */
  releaseWords?: string;
  /** A threshold of the other parties decides absence. */
  abandonmentOthers: number;
  text: string;
  /** Stakes (terms field 7): the collective's own (object null, F124 S1:
   * a share of all its income, F121 Q8), keyed by holder, and works it
   * holds (holder null). Absent in older files. */
  stakes?: Stake[];
  /** The split service's grant (field 14), a judicial clause. */
  splitGrant?: string;
  /** Departed holders (field 22): who left keeping a share of the collective's income, which is in `stakes` (F124 N5). */
  departed?: string[];
  /** Forked from (field 23): the original collective, for a successor of a fork (F124 N4). */
  forkedFrom?: string;
}

export interface CollectiveFile {
  label: string;
  /** The collective's own identity. Its safety key is held as shares (`safety`), never whole. */
  identity: IdentityFile;
  /** Where its Law acts, releases and files are published. */
  relays: string[];
  governance: Governance;
  /** The parties of the agreement in force, in order. */
  members: string[];
  /** Who holds the everyday signing key. */
  signingHolder: string;
  /** The agreement in force: the founding agreement, then each clone. */
  agreement: string;
  agreements: string[];
  safety: Dealt;
  /** A member change sent and not yet counted. `governance`: the clone's rules, when they changed. */
  pending: { safety: Dealt; agreement: string; members: string[]; governance?: Governance } | null;
  /** Releases published, newest last, with their manifests (for the next one to reuse unchanged files). */
  releases: { id: string; version: string; manifest: string }[];
  /**
   * Kept by the collective client (Law draft 7), absent in older files:
   * members who left alone, each by a resignation the collective
   * registered at once by a record, its line (rule 37a), or who were
   * declared absent, by a declaration it registered the same way (rule 53). They stay parties
   * of the agreement in force until the members refit the collective
   * without them; the list stays as history after. A member declared
   * absent while holding the everyday key has no record (Law draft 9, C7,
   * B16, B18): the declaration takes effect at the recovery rotation, the
   * member change removing them, which names `signatures`, the other
   * members' signature acts on it; `rotation` is that rotation once made,
   * and `at` the length of the collective's sequence it kept.
   */
  departed?: {
    member: string;
    resignation?: string;
    declaration?: string;
    record?: string;
    signatures?: string[];
    rotation?: string;
    at?: number;
  }[];
  /** Kept by the collective client: holders who stepped down from an area (rule 37b), each registered at once by a record. */
  steppedDown?: { member: string; area: number; resignation: string; record: string }[];
  /** Kept by the collective client: the records the collective drew, its everyday lines (Law type 17), oldest first. */
  records?: string[];
  /** Kept by the collective client: the fork or closing that ended the collective (Law rule 47a, F121, F124 N9), once complete. */
  closed?: string;
  /** Kept by the collective client: splits its simulated split service made, with their content keys (base64). */
  splits?: { id: string; key: string; receipt: string }[];
  /** Kept by the collective client: debts the collective signed, private, with their content keys (base64) (F124 N13). */
  debts?: { id: string; key: string; creditor: string }[];
  /** Kept by the collective client: its payee pointers, newest last. */
  pointers?: string[];
}

/** What happened to one act the members signed. */
export interface Signed {
  member: string;
  act: string;
}

/**
 * The words of an agreement with these rules, as the command line writes
 * them. Members may write other words; the rules are what MOR enforces.
 */
export function governanceText(g: Omit<Governance, 'text'>): string {
  const constitution = g.constitutionalThreshold
    ? `any ${g.constitutionalThreshold} members`
    : 'every member whose voice remains';
  return `The MOR test collective. It publishes releases of the MOR code and nothing else. Test acts only, wiped before the first real acts. Its everyday key is held by its first member; its safety key is split among the members, any ${g.safetyThreshold} of whom rebuild it. Releases are an area held by every member: a release counts only when ${g.releaseThreshold} members have signed it, each with an act of their own. Members, these rules and the release area change by a clone signed by ${constitution} and by each member who joins, and a rotation of the collective declaring it. Other changes need any ${g.cloneThreshold} members, and are recorded by the collective at once. A member may leave alone at any time, keeping what they own. The other members together decide whether a member is absent; the outcome is that member losing their voice.`;
}

/** The abandonment clause these rules write: any `abandonmentOthers` of the other members, outcome 0, no absence-proof cMIP. */
export function abandonmentOf(g: Omit<Governance, 'text'>): CollectiveTerms['abandonment'] {
  return { others: g.abandonmentOthers, outcomes: [0] };
}

/** The terms of a founding agreement (no parent) or of a clone, from its rules. */
export function collectiveTerms(g: Governance, members: string[], holder: string, parent?: string, mark?: MarkEntry[]): CollectiveTerms {
  const rule = (k: number): Rule => ({ threshold: k });
  return {
    parties: members,
    text: g.text,
    clone: rule(g.cloneThreshold),
    constitutional: g.constitutionalThreshold ? rule(g.constitutionalThreshold) : undefined,
    signingHolder: holder,
    safety: { threshold: g.safetyThreshold, members },
    // A release is a publication of the collective (Envelope type 0): an
    // area held by every member, counting with this many members' own
    // signature acts (F100, F103).
    releases: { holders: members, threshold: g.releaseThreshold, words: g.releaseWords },
    // Outcome 0, a voice removed: every member is covered (F105).
    abandonment: abandonmentOf(g),
    extensions: [REPO_SPECS.manifest],
    parent,
    mark,
    stakes: g.stakes,
    splitGrant: g.splitGrant,
    departed: g.departed,
    // Field 23 is for founding terms only: a clone never carries it.
    forkedFrom: parent ? undefined : g.forkedFrom,
  };
}

/**
 * Deal a fresh safety key to the members (Module 5.1): each member checks
 * their own share and compares the dealing's fingerprint with every other;
 * then k members rebuild it on a "second device" and compare it with the
 * commitment. Here both devices are this program: a test collective.
 */
function deal(members: string[], threshold: number, index: number, scheme: number): Dealt {
  const d = dealSafety({
    seedModule: 'words',
    scheme,
    index,
    threshold,
    holders: members.map((m) => ({ role: 0, identity: m })),
  }) as { shares: Uint8Array[]; scheme: number; commit: string; fingerprint: string };
  for (const s of d.shares) {
    const v = verifyShare(s) as { fingerprint: string };
    if (v.fingerprint !== d.fingerprint) throw new Error('a member saw another dealing');
  }
  const check = rebuildSafety(d.shares.slice(0, threshold)) as { commit: string };
  if (check.commit !== d.commit) throw new Error('the rebuild check failed: the shares do not rebuild the committed key');
  return {
    scheme: d.scheme,
    index,
    threshold,
    commit: d.commit,
    fingerprint: d.fingerprint,
    shares: d.shares.map((s, i) => ({ holder: members[i], share: b64(s) })),
  };
}

export class TestCollective {
  readonly id: TestIdentity;

  constructor(
    public f: CollectiveFile,
    via: Via = {},
  ) {
    this.id = new TestIdentity(f.identity, via);
  }

  get identity(): string {
    return this.f.identity.identity;
  }

  /**
   * The rules after a member change: a member who leaves keeping a share
   * of the collective's income (its stake in itself, field 7) is recorded
   * as departed in the departed members entry, nothing else (Law rules
   * 37a, 46b; F121, F124 N5).
   */
  departedAfter(g: Governance, members: string[]): Governance {
    const own = g.stakes?.find((x) => x.object === null);
    const departed = [...(g.departed ?? [])];
    for (const m of this.f.members.filter((x) => !members.includes(x))) {
      const share = own?.holders.find(([h]) => h === m)?.[1] ?? 0;
      if (share > 0 && !departed.includes(m)) departed.push(m);
    }
    return departed.length ? { ...g, departed } : g;
  }

  /** Who holds the everyday key after a member change: the holder if they stay, else the first member. */
  nextHolder(members: string[]): string {
    return members.includes(this.f.signingHolder) ? this.f.signingHolder : members[0];
  }

  static load(path: string, via: Via = {}): TestCollective {
    const f = JSON.parse(readFileSync(path, 'utf8')) as CollectiveFile;
    if (f.label !== COLLECTIVE_LABEL) throw new Error(`${path} is not a MOR test collective file`);
    return new TestCollective(f, via);
  }

  save(path: string): void {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.f, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, path);
  }

  /**
   * Found a collective. The first member proposes the founding agreement;
   * every member signs it (its signing rule: all parties); the safety key
   * is dealt to the members; the collective's genesis declares the
   * agreement and names its homes. The members' files move on (their
   * sequences grew): save them after.
   */
  static async found(opts: {
    members: TestIdentity[];
    homes: Home[];
    relays: string[];
    governance: Governance;
    scheme?: 2 | 3;
    via?: Via;
    /** The exact terms payload shown to the members: refused if the terms made now differ. */
    expect?: Uint8Array;
  }): Promise<{ collective: TestCollective; agreement: string; signed: Signed[]; sent: Submitted[] }> {
    const ids = opts.members.map((m) => m.id);
    const holder = ids[0];
    const payload = termsPayload(collectiveTerms(opts.governance, ids, holder));
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the founding agreement is not the one shown: nothing signed');
    const proposed = await proposePayload(opts.members[0], payload, undefined, opts.relays);
    const signed: Signed[] = [];
    for (const m of opts.members) signed.push({ member: m.id, act: (await sign(m, proposed.id, opts.relays)).id });

    const scheme = opts.scheme ?? 2;
    const safety = deal(ids, opts.governance.safetyThreshold, 0, scheme);
    const signingSecret = newSigningSecret();
    const genesis = makeGenesis({
      identitySpec: SPECS.identity,
      signingSecret,
      safetyScheme: scheme,
      safetyCommit: safety.commit,
      homes: opts.homes,
      declarations: [{ spec: REPO_SPECS.law, kind: FOUNDING_AGREEMENT, value: proposed.id }],
    });
    const id = actId(genesis);
    const identity: IdentityFile = {
      label: 'MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.',
      identity: id,
      position: 0,
      binding: id,
      signingSecret: hex(signingSecret),
      // Held as shares, never whole: see `safety` in the collective file.
      safety: { scheme, seeds: '' },
      chain: [b64(genesis)],
      homes: opts.homes,
      rule: null,
      sequence: [],
      routes: null,
      encryption: [],
      pending: null,
      // F127: its actions cite, on its chain, the decision they act under:
      // its genesis first, then its latest rotation or record.
      cites: [id],
    };
    const c = new TestCollective(
      {
        label: COLLECTIVE_LABEL,
        identity,
        relays: opts.relays,
        governance: opts.governance,
        members: ids,
        signingHolder: holder,
        agreement: proposed.id,
        agreements: [proposed.id],
        safety,
        pending: null,
        releases: [],
      },
      opts.via ?? {},
    );
    const sent = await c.id.publishGenesis();
    await c.id.publishRoutes([{ scope: null, hints: opts.relays }]);
    return { collective: c, agreement: proposed.id, signed, sent };
  }

  /**
   * Change members (Law rules 37, 37a): members who leave alone sign a
   * resignation (`leaving`), and the collective registers it at once by a
   * record, its line (A1); then a clone of the agreement in force naming
   * the new members, its mark naming the constitutional change rule and
   * the members who sign it (F104), proposed by `proposer`, signed by
   * `signers` (members whose voice remains, and each joining member, to be
   * bound); then a rotation of the collective declaring the clone with
   * those signature acts (Flaw M), signed by the safety key rebuilt from
   * the shares of `rebuilders` (members who stay: a leaving member hands
   * over nothing), and committing to a next key dealt to the new members
   * only. A member removed without resigning (`members` leaving them out)
   * must still sign, unless the constitutional change rule needs fewer.
   * With `governance`, the clone also rewrites the rules. Save every file
   * after.
   */
  async changeMembers(opts: {
    members: string[];
    proposer: TestIdentity;
    signers: TestIdentity[];
    rebuilders: string[];
    leaving?: TestIdentity[];
    governance?: Governance;
    /** The exact clone payload shown to the members: refused if the clone made now differs. */
    expect?: Uint8Array;
  }): Promise<{ clone: string; rotation: string; record?: string; resigned: Signed[]; signed: Signed[]; sent: Submitted[] }> {
    if (this.f.pending || this.f.identity.pending) throw new Error('a member change is already pending: resend it');
    const governance = this.departedAfter(opts.governance ?? this.f.governance, opts.members);
    const holder = this.nextHolder(opts.members);
    const resigned: Signed[] = [];
    let line: string | undefined;
    for (const m of opts.leaving ?? []) {
      resigned.push({ member: m.id, act: (await resign(m, this.f.agreement, this.f.relays)).id });
    }
    if (resigned.length) {
      line = (await record(this.id, { registers: resigned.map((r) => r.act), inForce: this.f.agreement }, this.f.relays)).id;
    }
    const left = new Set(resigned.map((r) => r.member));
    // C7, B16, Flaw B18: a declared holder of the everyday key, removed by
    // this change, is removed at this rotation, which names the other
    // members' signature acts on the declaration.
    const recovered = this.recovering().filter((d) => !opts.members.includes(d.member));
    const absence = recovered.flatMap((d) => d.signatures ?? []);
    const voices = opts.signers.map((m) => m.id).filter((id) => this.f.members.includes(id) && !left.has(id));
    const mark: MarkEntry[] = [{ power: { constitutional: true }, signers: voices }];
    const parent = collectiveTerms(this.f.governance, this.f.members, this.f.signingHolder);
    // F122: a version that also changes a judge needs every member for it.
    if (clonePlan(parent, collectiveTerms(governance, opts.members, holder, this.f.agreement, mark)).needs.some((n) => n.form === 'judicial')) {
      mark.push({ power: { judicial: true }, signers: voices });
    }
    const next = collectiveTerms(governance, opts.members, holder, this.f.agreement, mark);
    if (!markMatches(mark, clonePlan(parent, next).needs)) {
      throw new Error('a member change is constitutional: its mark names the constitutional change rule');
    }
    const payload = termsPayload(next);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the clone is not the one shown: nothing signed');
    const proposed = await proposePayload(opts.proposer, payload, this.f.agreement, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays)).id });

    // The rotating device: rebuild the current key from k shares of members who stay.
    const shares = this.f.safety.shares
      .filter((s) => opts.rebuilders.includes(s.holder))
      .slice(0, this.f.safety.threshold)
      .map((s) => unb64(s.share));
    const current = rebuildSafety(shares) as { scheme: number; seeds: Uint8Array; commit: string };
    const dealt = deal(opts.members, governance.safetyThreshold, this.f.safety.index + 1, this.f.safety.scheme);

    const f = this.f.identity;
    const newSigning = newSigningSecret();
    const seq = f.sequence;
    const kept = seq.length
      ? [{ act: seq[seq.length - 1], position: seq.length, summary: runningSummary(seq) }]
      : [];
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: f.identity,
      previous: actId(this.id.chainActs()[f.position]),
      position: f.position + 1,
      safetyScheme: current.scheme,
      safetySeeds: current.seeds,
      newSigningPublic: signingPublic(newSigning),
      nextSafetyScheme: dealt.scheme,
      nextSafetyCommit: dealt.commit,
      kept,
      // The clone, and the signature acts that complete it (Flaw M).
      // At a recovery rotation, also the signature acts on the declaration (Flaw B18).
      declarations: [
        {
          spec: LAW_SPECS.law,
          kind: FOUNDING_AGREEMENT,
          value: proposed.id,
          signatures: signed.map((s) => s.act),
          ...(absence.length ? { absence } : {}),
        },
      ],
    });
    const id = actId(rotation);
    for (const d of recovered) {
      d.rotation = id;
      d.at = seq.length;
    }
    f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: dealt.scheme, seeds: '' },
      homes: f.homes,
      rule: f.rule,
    };
    this.f.pending = { safety: dealt, agreement: proposed.id, members: opts.members, governance: governance === this.f.governance ? undefined : governance };
    this.f.signingHolder = holder;
    const sent = await this.id.submitRotation();
    return { clone: proposed.id, rotation: id, record: line, resigned, signed, sent };
  }

  /**
   * An ordinary change (Law rule 37c): the release area's own words, which
   * its holders change alone. A clone marked with the release area's power
   * and the members who sign it; the collective records it at once with
   * their signature acts (A2), with its everyday key: no rotation (Q8).
   */
  async changeReleaseWords(opts: {
    words: string;
    proposer: TestIdentity;
    signers: TestIdentity[];
    /** The exact clone payload shown to the holders: refused if the clone made now differs. */
    expect?: Uint8Array;
  }): Promise<{ clone: string; record: string; signed: Signed[] }> {
    const governance = { ...this.f.governance, releaseWords: opts.words };
    return this.recordChange({ ...opts, governance, power: { area: 1 }, what: 'not an ordinary change of the release area' });
  }

  /**
   * A judicial change (Law rules 44a, 46a; Law draft 8, B13): only who
   * judges absence, the abandonment clause's number of the other members.
   * A clone marked with the judicial tier's power, every member whose voice
   * remains signing it (Law draft 10, F121: one version for everyone),
   * recorded at once (rule 37c, Q8).
   */
  async changeAbsenceRule(opts: {
    others: number;
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  }): Promise<{ clone: string; record: string; signed: Signed[] }> {
    const governance = { ...this.f.governance, abandonmentOthers: opts.others };
    return this.recordChange({ ...opts, governance, power: { judicial: true }, what: 'not a judicial change of who judges absence' });
  }

  /**
   * The collective's stakes (terms field 7, F121 Q8): its members' shares
   * of all its income, and the works it owns. An ordinary change, outside
   * every area, under the clone rule, recorded at once; every holder whose
   * share it sets signs it (Law rule 13).
   */
  async setStakes(opts: {
    stakes: Stake[];
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  }): Promise<{ clone: string; record: string; signed: Signed[] }> {
    const governance = { ...this.f.governance, stakes: opts.stakes };
    return this.recordChange({ ...opts, governance, power: { clone: true }, what: 'not an ordinary change of the stakes' });
  }

  /**
   * Name the split service (terms field 14, by its grant): a judicial
   * change, every member whose voice remains signing it (Law rule 46a,
   * F121), recorded at once.
   */
  async nameSplitService(opts: {
    grant: string;
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  }): Promise<{ clone: string; record: string; signed: Signed[] }> {
    const governance = { ...this.f.governance, splitGrant: opts.grant };
    return this.recordChange({ ...opts, governance, power: { judicial: true }, what: 'not a judicial change naming the split service' });
  }

  /**
   * A change written on the collective's record at once (rule 37c): a  /**
   * A change written on the collective's record at once (rule 37c): a
   * clone marked with the one power its changes need, signed by `signers`,
   * recorded with their signature acts (A2) and the everyday key.
   */
  private async recordChange(opts: {
    governance: Governance;
    power: Power;
    what: string;
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  }): Promise<{ clone: string; record: string; signed: Signed[] }> {
    if (this.f.pending) throw new Error('a member change is pending: settle it first');
    const mark: MarkEntry[] = [{ power: opts.power, signers: opts.signers.map((m) => m.id) }];
    const parent = collectiveTerms(this.f.governance, this.f.members, this.f.signingHolder);
    const next = collectiveTerms(opts.governance, this.f.members, this.f.signingHolder, this.f.agreement, mark);
    if (!markMatches(mark, clonePlan(parent, next).needs)) throw new Error(opts.what);
    const payload = termsPayload(next);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the clone is not the one shown: nothing signed');
    const proposed = await proposePayload(opts.proposer, payload, this.f.agreement, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays)).id });
    const r = await record(this.id, { clone: proposed.id, signatures: signed.map((s) => s.act), inForce: this.f.agreement }, this.f.relays);
    this.f.governance = opts.governance;
    this.f.agreement = proposed.id;
    this.f.agreements.push(proposed.id);
    return { clone: proposed.id, record: r.id, signed };
  }

  /**
   * The clause version a declaration against `member` applies: the newest
   * version of the agreement chain, up to the agreement in force, that the
   * member signed (Law rule 51, B12).
   */
  async clauseOf(member: string, via: Via = {}): Promise<string | null> {
    const chain = this.f.agreements.slice(0, this.f.agreements.indexOf(this.f.agreement) + 1);
    return (await signedVersions(member, chain, this.f.relays, via)).at(-1) ?? null;
  }

  /** A declaration's payload against `member`, outcome 0, under the clause they signed last. */
  async declarationFor(member: string, via: Via = {}): Promise<Uint8Array> {
    const clause = await this.clauseOf(member, via);
    if (!clause) throw new Error('that member signed no version of the agreement');
    return declarationPayload(this.f.agreement, clause, member, Uint32Array.from([0]));
  }

  /**
   * Declare a member absent (Law rules 49, 51, 53; B12, B15), with outcome
   * 0, their voice removed: one of the other members signs the declaration,
   * under the clause the absent member signed last; the others add
   * signature acts naming it, as for terms; the collective registers it at
   * once by a record that acknowledges those signatures, placing them at
   * its line. From that line the member's voice counts for nothing (F109).
   * Where the member holds the everyday key, the collective cannot draw
   * its line without them: no record is made, and the declaration takes
   * effect at the recovery rotation, the member change removing them,
   * which names those signature acts (Law draft 9, C7, B16, B18).
   */
  async declareAbsent(opts: {
    member: string;
    by: TestIdentity;
    cosigners: TestIdentity[];
    expect?: Uint8Array;
    via?: Via;
  }): Promise<{ declaration: string; signed: Signed[]; record?: string }> {
    if (this.f.pending) throw new Error('a member change is pending: settle it first');
    if (this.recovering().length) throw new Error('the everyday key\'s holder was declared absent: refit the collective first');
    const payload = await this.declarationFor(opts.member, opts.via);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the declaration is not the one shown: nothing signed');
    const clause = await this.clauseOf(opts.member, opts.via);
    const d = await declare(opts.by, { agreement: this.f.agreement, clause: clause!, party: opts.member, outcomes: [0] }, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.cosigners) signed.push({ member: m.id, act: (await sign(m, d.id, this.f.relays)).id });
    if (opts.member === this.f.signingHolder) {
      this.f.departed = [...(this.f.departed ?? []), { member: opts.member, declaration: d.id, signatures: signed.map((s) => s.act) }];
      return { declaration: d.id, signed };
    }
    const r = await record(this.id, { registers: [d.id], inForce: this.f.agreement, acks: signed.map((s) => s.act) }, this.f.relays);
    this.f.departed = [...(this.f.departed ?? []), { member: opts.member, declaration: d.id, record: r.id }];
    this.f.records = [...(this.f.records ?? []), r.id];
    return { declaration: d.id, signed, record: r.id };
  }

  /**
   * Declarations against the everyday key's holder waiting for the
   * recovery rotation (C7, B16): no record could register them, since the
   * collective cannot draw its line without the declared holder.
   */
  recovering(): NonNullable<CollectiveFile['departed']> {
    return (this.f.departed ?? []).filter((d) => d.declaration && !d.record && !d.rotation && this.f.members.includes(d.member));
  }

  /** Once the member change's rotation counts, the new shares and agreement take over. */
  async settle(): Promise<boolean> {
    const p = this.f.pending;
    if (!p) throw new Error('no member change pending');
    const { counts } = await this.id.settleRotation();
    if (counts) {
      this.f.safety = p.safety;
      this.f.agreement = p.agreement;
      this.f.agreements.push(p.agreement);
      this.f.members = p.members;
      if (p.governance) this.f.governance = p.governance;
      this.f.pending = null;
    }
    return counts;
  }
}
