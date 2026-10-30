// A test collective (Agreements rules 56 to 60): an identity of its own, founded by
// an agreement its members sign, with no signing key of its own (rule 56):
// each member acts for it with their own key, naming it (rule 58); its
// chain key dealt as shares among the members (air-gapped Module, section
// 5), its members changed by a clone of the founding agreement, put in
// force by a record, or by a rotation declaring it where the chain key's
// holders change.
//
// A TEST COLLECTIVE HOLDS ITS CHAIN KEY'S SHARES IN SOFTWARE, IN ONE FILE:
// every member's share. Its members are simulated, so the mechanics
// run (release rule, visible signatures, clone, rotation) while independent
// consent does not (roadmap step 5a, "Run and not run"). A real collective
// deals and rebuilds its chain key on offline devices, one share per member.

import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import {
  SPECS,
  actId,
  dealChainKey,
  declarationPayload,
  hex,
  makeGenesis,
  makeRotation,
  newTestChainKey,
  rebuildChainKey,
  rebuildChainKeyFromPaper,
  verifyShare,
} from '../../genesis/src/core.ts';
import { TestIdentity, type Home, type IdentityFile, type Submitted } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { checkWarned, type Card, type LinePlan } from '../../genesis/src/lines.ts';
import {
  AGREEMENTS_SPECS,
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
  type AreaSpec,
  type LayerNumber,
  collectiveShares,
  evenShares,
} from './agreements.ts';
import { FOUNDING_AGREEMENT, REPO_SPECS } from './specs.ts';

export const COLLECTIVE_LABEL =
  'MOR TEST COLLECTIVE. Every member share of its chain key is held in software, in this file: a prototype, never for a real collective.';

const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const same = (a: Uint8Array, b: Uint8Array) => Buffer.from(a).equals(Buffer.from(b));
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

/** A dealing of the collective's chain key: one share per holder. */
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
  /** Any k members rebuild the chain key (a way to rotate below the member count). */
  safetyThreshold: number;
  /** The release rule, an area held by every member: any k members' own
   * signature acts make a publication of the collective count. */
  releaseThreshold: number;
  /** Any k of the parties complete a clone under the clone rule: the
   * judicial tier and matters outside every area (Agreements draft 7). */
  cloneThreshold: number;
  /** The constitutional change rule (members, the rules, the key grammar,
   * the areas): any k of the parties. Absent: every party whose voice
   * remains (F103), the default nobody loses their say under. */
  constitutionalThreshold?: number;
  /** The constitutional change rule naming the members who hold constitutional power (a rule `named`, terms field 18): set by another client, or by tests of Agreements rule 37a's last voice (RB5). Absent: the threshold above. */
  constitutionalNamed?: string[];
  /** The release area's own words (terms field 20), changed by its holders. */
  releaseWords?: string;
  /** Members who do not hold the release area: a stepping down a rollback registers (Agreements rules 37b, 37d; F187, 8). Absent: every member holds it. */
  releaseOut?: string[];
  /** A threshold of the other parties decides absence. */
  abandonmentOthers: number;
  /** Who acts for the collective in each layer (terms field 19, rule 60): Text, Envelopes, Money, Agreements, Development; a layer left out takes the clone rule. */
  layers?: Partial<Record<LayerNumber, Rule>>;
  /** The finer areas the founding grid draws (field 34, rules 60 and 62); absent, the one Releases area above. */
  areas?: AreaSpec[];
  text: string;
  /** The one stake (terms field 7), on the collective itself (field 33,
   * `[1, null]`): its holders' shares of all its income, in millionths.
   * Absent: even shares among the members. */
  stakes?: Stake[];
  /** Named keepers (field 3; round 3, part C). */
  keepers?: { ids: string[]; rule: Rule };
  /** Departed holders (field 22): who left keeping a share of the collective's income, which is in `stakes` (F124 N5). */
  departed?: string[];
  /** Forked from (field 23): the original collective, for a successor of a fork (F124 N4). */
  forkedFrom?: string;
}

export interface CollectiveFile {
  label: string;
  /** The collective's own identity. Its chain key is held as shares (`chainKey`), never whole. */
  identity: IdentityFile;
  /** Where its Agreements acts, releases and files are published. */
  relays: string[];
  governance: Governance;
  /** The parties of the agreement in force, in order. */
  members: string[];
  /** The agreement in force: the founding agreement, then each clone. */
  agreement: string;
  agreements: string[];
  safety: Dealt;
  /** A member change sent and not yet counted. `governance`: the clone's rules, when they changed. */
  pending: { safety: Dealt; agreement: string; members: string[]; governance?: Governance } | null;
  /** Releases published, newest last, with their manifests (for the next one to reuse unchanged files). */
  releases: { id: string; version: string; manifest: string }[];
  /**
   * Kept by the collective client (Agreements draft 7), absent in older files:
   * members who left alone, each by a resignation the collective
   * registered at once by a record, its line (rule 37a), or who were
   * declared absent, by a declaration it registered the same way (rule 53). They stay parties
   * of the agreement in force until the members refit the collective
   * without them; the list stays as history after. During a broken stretch
   * the declaration names `signatures`, the other members' signature acts
   * on it, and the rollback registers it; `rotation` and `at` are kept in
   * older files only.
   */
  departed?: {
    member: string;
    resignation?: string;
    /** The agreement the resignation names: during a broken stretch, the one in force just before the broken act (Agreements rule 37a, F185). */
    named?: string;
    /** The rollback that registered the resignation, its line (Agreements rule 37d, F185). */
    rollback?: string;
    declaration?: string;
    record?: string;
    signatures?: string[];
    rotation?: string;
    at?: number;
    /** The clone by which the member came back, named again (B10): the entry is closed (F189, 1). */
    returned?: string;
  }[];
  /** Kept by the collective client: holders who stepped down from an area (rule 37b), each registered at once by a record. */
  /**
   * Kept by the collective client: steppings down from an area (Agreements rule
   * 37b), each registered by a record, its line; or, during a broken
   * stretch, naming the agreement in force just before the broken act
   * (`named`), with no record, registered by the rollback (`rollback`;
   * Agreements rules 37a, 37d; F187, 8).
   */
  steppedDown?: { member: string; area: number; resignation: string; record?: string; named?: string; rollback?: string }[];
  /** Kept by the collective client: the records the collective drew, its everyday lines (Agreements type 17), oldest first. */
  records?: string[];
  /** Kept by the collective client: the fork or closing that ended the collective (Agreements rule 47a, F121, F124 N9), once complete. */
  closed?: string;
  /**
   * Kept by the collective client: splits its simulated split service made, with their content keys (base64);
   * the service, the stake (its index), and the previous split it cites for the stake (Agreements rule 15a, F171).
   */
  splits?: { id: string; key: string; receipt: string; service?: string; stake?: number; previous?: string | null }[];
  /** Kept by the collective client: the notices it sent to payers owed money back who gave no address (Agreements type 24, F197): the payment, the notice and its content key (base64), its payer, and the deadline on the test time reference. */
  notices?: { payment: string; notice: string; key: string; to: string; deadline: number }[];
  /** Kept by the collective client: debts the collective signed, private, with their content keys (base64) (F124 N13). */
  /** `relied`: the creditor's receipts and releases ending it, which the collective acknowledges before it closes (Agreements draft 14, F303). */
  debts?: { id: string; key: string; creditor: string; relied?: string[] }[];
  /** Kept by the collective client: its payee pointers, newest last. */
  pointers?: string[];
  /**
   * Kept by this client (F185), absent in older files: the rules of each
   * agreement put in force from this device, by its id, so that a rollback
   * can rebuild the agreement in force just before a broken act (Agreements rule
   * 37d).
   */
  rules?: Record<string, { governance: Governance; members: string[] }>;
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
  return `The MOR test collective. It publishes releases of the MOR code and nothing else. Test acts only, wiped before the first real acts. It has no signing key of its own: each member acts for it with their own key. Its chain key is split among the members, any ${g.safetyThreshold} of whom rebuild it. Releases are an area held by every member: a release counts only when ${g.releaseThreshold} members have signed it, each with an act of their own. Members, these rules and the release area change by a clone signed by ${constitution} and by each member who joins, and a rotation of the collective declaring it. Other changes need any ${g.cloneThreshold} members, and are recorded by the collective at once. A member may leave alone at any time, keeping what they own. The other members together decide whether a member is absent; the outcome is that member losing their voice.`;
}

/** The abandonment clause these rules write: any `abandonmentOthers` of the other members, outcome 0, no absence-proof cMIP. */
export function abandonmentOf(g: Omit<Governance, 'text'>): CollectiveTerms['abandonment'] {
  return { others: g.abandonmentOthers, outcomes: [0] };
}

/**
 * What a client that had Agreements count a change passes to it: the mark as Agreements
 * counted it (rules 44c, 44d, 45a), used as given; a check before the clone
 * is proposed, and one once it is signed, before the record or rotation that
 * would put it in force is sent. A problem stops the change there.
 */
export interface Gates {
  mark?: MarkEntry[];
  beforeClone?: () => Promise<string | null>;
  beforeSend?: (clone: string) => Promise<string | null>;
}

/** The terms of a founding agreement (no parent) or of a clone, from its rules. */
export function collectiveTerms(g: Governance, members: string[], parent?: string, mark?: MarkEntry[]): CollectiveTerms {
  const rule = (k: number): Rule => ({ threshold: k });
  return {
    parties: members,
    text: g.text,
    clone: rule(g.cloneThreshold),
    constitutional: g.constitutionalNamed?.length ? { named: g.constitutionalNamed } : g.constitutionalThreshold ? rule(g.constitutionalThreshold) : undefined,
    layers: g.layers,
    chainKey: { threshold: g.safetyThreshold, members },
    // A release is a bake of the collective (Envelopes type 0): a finer
    // area of Envelopes held by every member, counting with this many
    // members' own acts (F100, F103).
    releases: { holders: members.filter((m) => !(g.releaseOut ?? []).includes(m)), threshold: g.releaseThreshold, words: g.releaseWords },
    // Outcome 0, a voice removed: every member is covered (F105).
    abandonment: abandonmentOf(g),
    extensions: [REPO_SPECS.manifest],
    parent,
    mark,
    stakes: g.stakes,
    keepers: g.keepers,
    departed: g.departed,
    // Field 23 is for founding terms only: a clone never carries it.
    forkedFrom: parent ? undefined : g.forkedFrom,
    areas: g.areas?.map((a) => ({ ...a, holders: a.holders.filter((h) => members.includes(h)) })),
  };
}

/**
 * Deal a fresh chain key to the members (Module 5.1): each member checks
 * their own share and compares the dealing's fingerprint with every other;
 * then k members rebuild it on a "second device" and compare it with the
 * commitment. Here both devices are this program: a test collective.
 */
function deal(members: string[], threshold: number, index: number, scheme: number): Dealt {
  const d = dealChainKey({
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
  const check = rebuildChainKey(d.shares.slice(0, threshold)) as { commit: string };
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

/**
 * What a rotation of the collective keeps besides this device's own line
 * (Identity rule 35, was 17; `clients/genesis/src/lines.ts`): every line of
 * the collective's acts its homes and relays hold is kept, unless named in
 * `leaveOut` (by its latest act); a line this device cannot read is kept by
 * its card in `cards`. Anything left out, by name or for want of a card, is
 * left out only where `warned` is, word for word, the warning shown.
 */
export interface KeptLines {
  leaveOut?: string[];
  cards?: Card[];
  warned?: string;
}

/**
 * The shares after a member change, where the caller set none: a member who
 * leaves keeps theirs; the members who stay, who all sign the change,
 * divide their shares evenly with each joining member, so that no share is
 * lowered without its holder's signature (rules 46, 46b) and every joining
 * member holds one. Unchanged where nobody joins.
 */
export function sharesAfter(before: [string, number][], from: string[], members: string[]): [string | null, number][] {
  const joining = members.filter((m) => !from.includes(m) && !before.some(([h]) => h === m));
  if (!joining.length) return before;
  const staying = before.filter(([h]) => members.includes(h));
  const pot = staying.reduce((n, [, x]) => n + x, 0);
  const holders = [...staying.map(([h]) => h), ...joining];
  const each = Math.floor(pot / holders.length);
  // The first who stays takes what rounding leaves.
  const scaled = holders.map((h, i): [string, number] => [h, i === 0 ? pot - each * (holders.length - 1) : each]);
  return [...before.filter(([h]) => !members.includes(h)), ...scaled];
}

/** The power a clone plan's need names, as a mark writes it. */
export const powerOf = (n: { form: string; area?: number }): Power =>
  n.form === 'area' ? { area: n.area! } : n.form === 'layer' ? { layer: n.area! } : n.form === 'constitutional' ? { constitutional: true } : n.form === 'judicial' ? { judicial: true } : { clone: true };

/**
 * A collective's genesis (Identity rule 1): it declares its founding
 * agreement in place of a signing key, and is signed by a first chain key,
 * revealed in its signature, made here and dropped at once; it commits the
 * next chain key, dealt as shares to the members (index 1).
 */
export function keylessGenesis(members: string[], threshold: number, scheme: number, homes: Home[], agreement: string): { genesis: Uint8Array; chainKey: Dealt } {
  const first = newTestChainKey(scheme) as { scheme: number; seeds: Uint8Array; commit: string };
  const chainKey = deal(members, threshold, 1, scheme);
  const genesis = makeGenesis({
    identitySpec: SPECS.identity,
    firstChainKeySeeds: first.seeds,
    firstChainKeyScheme: first.scheme,
    chainKeyScheme: scheme,
    chainKeyCommit: chainKey.commit,
    homes,
    declarations: [{ spec: REPO_SPECS.agreements, kind: FOUNDING_AGREEMENT, value: agreement }],
  });
  first.seeds.fill(0);
  return { genesis, chainKey };
}

/** The identity file of a keyless collective: no signing key; its acts cite its genesis first (rule 58). */
export function collectiveIdentity(genesis: Uint8Array, homes: Home[]): IdentityFile {
  const id = actId(genesis);
  return {
    label: 'MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.',
    identity: id,
    position: 0,
    binding: id,
    // A collective has no signing key (Agreements rule 56): its members act for it.
    signingSecret: '',
    // Held as shares, never whole: see `safety` in the collective file.
    safety: { scheme: 0, seeds: '' },
    chain: [b64(genesis)],
    homes,
    rule: null,
    sequence: [],
    routes: null,
    encryption: [],
    pending: null,
    // Rule 58: its acts cite, on its chain, the decision they act under:
    // its genesis first, then its latest rotation, record or grant.
    cites: [id],
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
   * The member who makes the collective's next acts, with their own key,
   * naming it (Agreements rules 56, 58): a collective has no signing key.
   * Returns this collective, so a call reads `c.by(member).…`.
   */
  by(member: TestIdentity): this {
    this.id.actor = member;
    return this;
  }

  /** The collective's chain as its next act cites it (rule 58): its latest decision and the head this device made since. */
  citing(): [string, string][] {
    return (this.f.identity.cites ?? [this.identity]).map((d): [string, string] => [this.identity, d]);
  }

  /**
   * What a rotation of the collective would keep now (Identity rule 35):
   * every line read from its homes and relays, as `KeptLines` leaves them.
   */
  async planLines(o: KeptLines = {}): Promise<LinePlan> {
    return (await this.id.planRotation({ leaveOut: o.leaveOut, cards: o.cards, hints: this.f.relays, specs: AGREEMENTS_SPECS })).plan;
  }

  /**
   * The rules after a member change: a member who leaves keeping a share
   * of the collective's income (its stake in itself, field 7) is recorded
   * as departed in the departed members entry, nothing else (Agreements rules
   * 37a, 46b; F121, F124 N5). The shares are carried in the same clone
   * (`sharesAfter`): a joining member always holds one.
   */
  departedAfter(g: Governance, members: string[], from: string[] = this.f.members): Governance {
    const before = collectiveShares({ stakes: g.stakes, parties: from });
    const departed = [...(g.departed ?? [])];
    for (const m of from.filter((x) => !members.includes(x))) {
      const share = before.find(([h]) => h === m)?.[1] ?? 0;
      if (share > 0 && !departed.includes(m)) departed.push(m);
    }
    const out = { ...g, stakes: [{ object: null, holders: sharesAfter(before, from, members) }] };
    return departed.length ? { ...out, departed } : out;
  }

  /** Keep the rules of the agreement now in force (F185): what a rollback rebuilds. */
  remember(): void {
    this.f.rules = { ...(this.f.rules ?? {}), [this.f.agreement]: { governance: this.f.governance, members: [...this.f.members] } };
  }

  /**
   * The rules a rollback writes (Agreements rule 37d, F185): those of `before`,
   * the agreement in force just before the broken act, as this device kept
   * them, without the members in `leaving`, whose resignations the
   * rollback registers, and, given Agreements' count of the voices that remain
   * there (`voices`), without anyone else Agreements no longer counts (F187, 1).
   * Null where this device kept no rules for it.
   */
  rollbackRules(before: string, leaving: string[], voices?: string[]): { governance: Governance; members: string[] } | null {
    const r = this.f.rules?.[before];
    if (!r) return null;
    // F187 (1): the members are Agreements' voices, never this device's copy: a
    // member whose departure a line registered before the broken act is no
    // longer one, and is written to the departed entry, as at any change.
    const members = r.members.filter((m) => !leaving.includes(m) && (!voices || voices.includes(m)));
    return {
      governance: this.departedAfter(r.governance, members, r.members),
      members,
    };
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
   * every member signs it (its signing rule: all parties); the chain key
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
    const payload = termsPayload(collectiveTerms(opts.governance, ids));
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the founding agreement is not the one shown: nothing signed');
    const proposed = await proposePayload(opts.members[0], payload, undefined, opts.relays);
    const signed: Signed[] = [];
    for (const m of opts.members) signed.push({ member: m.id, act: (await sign(m, proposed.id, opts.relays)).id });

    const scheme = opts.scheme ?? 2;
    const { genesis, chainKey } = keylessGenesis(ids, opts.governance.safetyThreshold, scheme, opts.homes, proposed.id);
    const c = new TestCollective(
      {
        label: COLLECTIVE_LABEL,
        identity: collectiveIdentity(genesis, opts.homes),
        relays: opts.relays,
        governance: opts.governance,
        members: ids,
        agreement: proposed.id,
        agreements: [proposed.id],
        safety: chainKey,
        pending: null,
        releases: [],
      },
      opts.via ?? {},
    );
    // Its first acts are made by the first member, naming it.
    c.by(opts.members[0]);
    c.remember();
    // Its genesis only: routes are an everyday Identity act, and a collective signs none (Identity, everyday check 4).
    const sent = await c.id.publishGenesis();
    return { collective: c, agreement: proposed.id, signed, sent };
  }

  /**
   * Change members (Agreements rules 37, 37a): members who leave alone sign a
   * resignation (`leaving`), and the collective registers it at once by a
   * record, its line (A1); then a clone of the agreement in force naming
   * the new members, its mark naming the constitutional change rule and
   * the members who sign it (F104), proposed by `proposer`, signed by
   * `signers` (members whose voice remains, and each joining member, to be
   * bound); then a rotation of the collective declaring the clone with
   * those signature acts (Flaw M), signed by the chain key rebuilt from
   * the shares of `rebuilders` (members who stay: a leaving member hands
   * over nothing), and committing to a next key dealt to the new members
   * only. A member removed without resigning (`members` leaving them out)
   * must still sign, unless the constitutional change rule needs fewer.
   * With `governance`, the clone also rewrites the rules. `drafts`: for a
   * member in `leaving`, the versions they signed and leave behind, which
   * their resignation names (F207). Save every file after.
   */
  async changeMembers(opts: {
    members: string[];
    proposer: TestIdentity;
    signers: TestIdentity[];
    rebuilders: string[];
    leaving?: TestIdentity[];
    /** For each member in `leaving`, by id: the drafts their resignation names (F207). */
    drafts?: Record<string, string[]>;
    governance?: Governance;
    /** The exact clone payload shown to the members: refused if the clone made now differs. */
    expect?: Uint8Array;
    /** The mark, as the caller had Agreements count it (rules 44c, 44d): used as given. */
    mark?: MarkEntry[];
    /** Asked once the resignations are registered, before the clone is proposed: a problem stops the change there. */
    beforeClone?: () => Promise<string | null>;
    /** Asked once the clone is signed, before the rotation is sent: a problem stops the change there, nothing sent. */
    beforeSend?: (clone: string) => Promise<string | null>;
    /** The lines of the collective's acts the rotation keeps (Identity rule 35): all, unless left out after the warning. */
    lines?: KeptLines;
  }): Promise<{ clone: string; rotation: string; record?: string; resigned: Signed[]; signed: Signed[]; sent: Submitted[]; stopped?: string }> {
    if (this.f.pending || this.f.identity.pending) throw new Error('a member change is already pending: resend it');
    // Identity rule 35: before anything is signed, so that nothing is.
    checkWarned(await this.planLines(opts.lines), opts.lines?.warned);
    const governance = this.departedAfter(opts.governance ?? this.f.governance, opts.members);
    if (!this.id.actor) this.by(opts.proposer);
    const resigned: Signed[] = [];
    let line: string | undefined;
    for (const m of opts.leaving ?? []) {
      resigned.push({ member: m.id, act: (await resign(m, this.f.agreement, this.f.relays, undefined, opts.drafts?.[m.id])).id });
    }
    if (resigned.length) {
      line = (await record(this.id, { registers: resigned.map((r) => r.act), inForce: this.f.agreement }, this.f.relays)).id;
    }
    const left = new Set(resigned.map((r) => r.member));
    let mark: MarkEntry[];
    if (opts.mark) mark = opts.mark;
    else {
      const voices = opts.signers.map((m) => m.id).filter((id) => this.f.members.includes(id) && !left.has(id));
      mark = [{ power: { constitutional: true }, signers: voices }];
      const parent = collectiveTerms(this.f.governance, this.f.members);
      // F122: a version that also changes a judge needs every member for it.
      if (clonePlan(parent, collectiveTerms(governance, opts.members, this.f.agreement, mark)).needs.some((n) => n.form === 'judicial')) {
        mark.push({ power: { judicial: true }, signers: voices });
      }
      if (!markMatches(mark, clonePlan(parent, collectiveTerms(governance, opts.members, this.f.agreement, mark)).needs)) {
        throw new Error('a member change is constitutional: its mark names the constitutional change rule');
      }
    }
    const next = collectiveTerms(governance, opts.members, this.f.agreement, mark);
    const payload = termsPayload(next);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the clone is not the one shown: nothing signed');
    const stop = (stopped: string, clone = '', signed: Signed[] = []) => ({ clone, rotation: '', record: line, resigned, signed, sent: [], stopped });
    const before = await opts.beforeClone?.();
    if (before) return stop(before);
    const proposed = await proposePayload(opts.proposer, payload, this.f.agreement, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays, this.citing())).id });
    const unsent = await opts.beforeSend?.(proposed.id);
    if (unsent) return stop(unsent, proposed.id, signed);

    const declaration = {
      spec: AGREEMENTS_SPECS.agreements,
      kind: FOUNDING_AGREEMENT,
      value: proposed.id,
      signatures: signed.map((s) => s.act),
    };
    const { id, sent } = await this.rotateTo({ agreement: proposed.id, members: opts.members, governance, rebuilders: opts.rebuilders, declaration, lines: opts.lines });
    return { clone: proposed.id, rotation: id, record: line, resigned, signed, sent };
  }

  /**
   * Rotate the collective to declare a clone (Agreements rule 37, Flaw M): the
   * current chain key, rebuilt from the shares of `rebuilders` (a
   * leaving member hands over nothing), signs a rotation carrying
   * `declaration` and committing to a next key dealt to `members` only.
   * The change waits in `pending` until the homes count it ([`settle`]).
   */
  private async rotateTo(o: {
    agreement: string;
    members: string[];
    governance: Governance;
    rebuilders: string[];
    declaration: Record<string, unknown>;
    lines?: KeptLines;
  }): Promise<{ id: string; sent: Submitted[]; at: number }> {
    // Identity rule 35: every line read again now (this device's own has
    // grown by the record), kept as the owner left them.
    const plan = await this.planLines(o.lines);
    checkWarned(plan, o.lines?.warned);
    // The rotating device: rebuild the current key from k shares of members who stay.
    const shares = this.f.safety.shares
      .filter((s) => o.rebuilders.includes(s.holder))
      .slice(0, this.f.safety.threshold)
      .map((s) => unb64(s.share));
    const current = rebuildChainKey(shares) as { scheme: number; seeds: Uint8Array; commit: string };
    const dealt = deal(o.members, o.governance.safetyThreshold, this.f.safety.index + 1, this.f.safety.scheme);

    const f = this.f.identity;
    const seq = f.sequence;
    // Identity rotation check 4: a collective's rotation installs no signing key and keeps no tip.
    void plan;
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: f.identity,
      previous: actId(this.id.chainActs()[f.position]),
      position: f.position + 1,
      chainKeySeeds: current.seeds,
      chainKeyScheme: current.scheme,
      nextChainKeyScheme: dealt.scheme,
      nextChainKeyCommit: dealt.commit,
      kept: [],
      declarations: [o.declaration],
    });
    const id = actId(rotation);
    f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: '',
      safety: { scheme: dealt.scheme, seeds: '' },
      homes: f.homes,
      rule: f.rule,
    };
    this.f.pending = { safety: dealt, agreement: o.agreement, members: o.members, governance: o.governance === this.f.governance ? undefined : o.governance };
    const sent = await this.id.submitRotation();
    return { id, sent, at: seq.length };
  }

  /**
   * Roll a broken collective back (Agreements rule 37d, F185): a clone of
   * `before`, the agreement in force just before the broken act, rebuilt
   * from the rules this device kept for it ([`rollbackRules`]), without the
   * members in `leaving`, whose resignations (`registers`) it registers;
   * its mark as the caller had Agreements count it (the constitutional change
   * rule of `before`, counted among the voices that remain); signed by
   * `signers`; then a rotation declaring it as a rollback, naming the
   * broken act. The rotation is signed with the keys the broken stretch
   * holds, rebuilt from the shares of `rebuilders`, and deals a fresh
   * chain key to the members after. Nothing is erased: the broken act and
   * everything after it stay shown, counting for nothing. Save every file
   * after.
   */
  async rollback(opts: {
    broken: string;
    before: string;
    leaving: string[];
    registers: string[];
    /** Agreements' count of the voices that remain at the rollback: the members are among them (F187, 1). */
    voices?: string[];
    proposer: TestIdentity;
    signers: TestIdentity[];
    rebuilders: string[];
    mark: MarkEntry[];
    /** New rules, where the members chose new numbers for the members left: otherwise those of `before`. */
    governance?: Governance;
    /** The exact clone payload shown to the members: refused if the clone made now differs. */
    expect?: Uint8Array;
    beforeClone?: () => Promise<string | null>;
    beforeSend?: (clone: string) => Promise<string | null>;
    /** The lines of the collective's acts the rotation keeps (Identity rule 35): all, unless left out after the warning. */
    lines?: KeptLines;
  }): Promise<{ clone: string; rotation: string; signed: Signed[]; sent: Submitted[]; stopped?: string }> {
    if (this.f.pending || this.f.identity.pending) throw new Error('a member change is already pending: resend it');
    checkWarned(await this.planLines(opts.lines), opts.lines?.warned);
    const kept = this.rollbackRules(opts.before, opts.leaving, opts.voices);
    if (!kept) throw new Error('this device kept no rules for the agreement in force before the broken act');
    const r = opts.governance ? { ...kept, governance: opts.governance } : kept;
    const payload = termsPayload(collectiveTerms(r.governance, r.members, opts.before, opts.mark));
    if (!this.id.actor) this.by(opts.proposer);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the clone is not the one shown: nothing signed');
    const stop = (stopped: string, clone = '', signed: Signed[] = []) => ({ clone, rotation: '', signed, sent: [], stopped });
    const ahead = await opts.beforeClone?.();
    if (ahead) return stop(ahead);
    const proposed = await proposePayload(opts.proposer, payload, opts.before, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays, this.citing())).id });
    const unsent = await opts.beforeSend?.(proposed.id);
    if (unsent) return stop(unsent, proposed.id, signed);
    const declaration = {
      spec: AGREEMENTS_SPECS.agreements,
      kind: FOUNDING_AGREEMENT,
      value: proposed.id,
      signatures: signed.map((s) => s.act),
      broken: opts.broken,
      registers: opts.registers,
    };
    const { id, sent } = await this.rotateTo({ agreement: proposed.id, members: r.members, governance: r.governance, rebuilders: opts.rebuilders, declaration, lines: opts.lines });
    return { clone: proposed.id, rotation: id, signed, sent };
  }

  /**
   * An ordinary change (Agreements rule 37c): the release area's own words, which
   * its holders change alone. A clone marked with the release area's power
   * and the members who sign it; the collective records it at once with
   * their signature acts (A2), with its signing key: no rotation (Q8).
   */
  async changeReleaseWords(opts: {
    words: string;
    proposer: TestIdentity;
    signers: TestIdentity[];
    /** The exact clone payload shown to the holders: refused if the clone made now differs. */
    expect?: Uint8Array;
  } & Gates): Promise<{ clone: string; record: string; signed: Signed[]; stopped?: string }> {
    const governance = { ...this.f.governance, releaseWords: opts.words };
    return this.recordChange({ ...opts, governance, power: { area: 1 }, what: 'not an ordinary change of the release area' });
  }

  /**
   * A judicial change (Agreements rules 44a, 46a; Agreements draft 8, B13): only who
   * judges absence, the abandonment clause's number of the other members.
   * A clone marked with the judicial tier's power, every member whose voice
   * remains signing it (Agreements draft 10, F121: one version for everyone),
   * recorded at once (rule 37c, Q8).
   */
  async changeAbsenceRule(opts: {
    others: number;
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  } & Gates): Promise<{ clone: string; record: string; signed: Signed[]; stopped?: string }> {
    const governance = { ...this.f.governance, abandonmentOthers: opts.others };
    return this.recordChange({ ...opts, governance, power: { judicial: true }, what: 'not a judicial change of who judges absence' });
  }

  /**
   * The collective's stakes (terms field 7, F121 Q8): its members' shares
   * of all its income, and the works it owns. An ordinary change, outside
   * every area, under the clone rule, recorded at once; every holder whose
   * share it sets signs it (Agreements rule 13).
   */
  async setStakes(opts: {
    stakes: Stake[];
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  } & Gates): Promise<{ clone: string; record: string; signed: Signed[]; stopped?: string }> {
    const governance = { ...this.f.governance, stakes: opts.stakes };
    return this.recordChange({ ...opts, governance, power: { clone: true }, what: 'not an ordinary change of the stakes' });
  }

  /**
   * The clone a change of these rules would be (round 3: the money card,
   * the split plan, the split service, the keepers): its terms, marked with
   * every power its changes need, each met by every member whose voice
   * remains (the judicial tier needs them all, rule 67), and its payload,
   * checked by the core. Members then sign it in their own apps.
   */
  sameMembersClone(governance: Governance): { terms: CollectiveTerms; payload: Uint8Array; needs: { form: string; area?: number }[] } {
    const parent = collectiveTerms(this.f.governance, this.f.members);
    const draft = collectiveTerms(governance, this.f.members, this.f.agreement, [{ power: { clone: true }, signers: [this.f.members[0]] }]);
    const needs = clonePlan(parent, draft).needs;
    const mark: MarkEntry[] = needs.map((n) => ({ power: powerOf(n), signers: [...this.f.members] }));
    const terms = collectiveTerms(governance, this.f.members, this.f.agreement, mark);
    return { terms, payload: termsPayload(terms), needs };
  }

  /**
   * Record a clone its members signed in their own apps (rule 72: every
   * complete clone is written on the record at once), with their signature
   * acts, drawn by any member (`by`, Agreements rule 60); from then on it is in force.
   */
  async recordSigned(a: { governance: Governance; clone: string; signatures: string[] }): Promise<string> {
    if (this.f.pending) throw new Error('a member change is pending: settle it first');
    const r = await record(this.id, { clone: a.clone, signatures: a.signatures, inForce: this.f.agreement }, this.f.relays);
    this.f.governance = a.governance;
    this.f.agreement = a.clone;
    this.f.agreements.push(a.clone);
    this.remember();
    return r.id;
  }

  /**
   * A change written on the collective's record at once (rule 37c): a
   * clone marked with the one power its changes need, signed by `signers`,
   * recorded with their signature acts (A2), the record drawn by the
   * proposer unless another member was given (`by`).
   */
  private async recordChange(opts: {
    governance: Governance;
    power: Power;
    what: string;
    proposer: TestIdentity;
    signers: TestIdentity[];
    expect?: Uint8Array;
  } & Gates): Promise<{ clone: string; record: string; signed: Signed[]; stopped?: string }> {
    if (this.f.pending) throw new Error('a member change is pending: settle it first');
    if (!this.id.actor) this.by(opts.proposer);
    const mark: MarkEntry[] = opts.mark ?? [{ power: opts.power, signers: opts.signers.map((m) => m.id) }];
    const next = collectiveTerms(opts.governance, this.f.members, this.f.agreement, mark);
    if (!opts.mark) {
      const parent = collectiveTerms(this.f.governance, this.f.members);
      if (!markMatches(mark, clonePlan(parent, next).needs)) throw new Error(opts.what);
    }
    const payload = termsPayload(next);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the clone is not the one shown: nothing signed');
    const before = await opts.beforeClone?.();
    if (before) return { clone: '', record: '', signed: [], stopped: before };
    const proposed = await proposePayload(opts.proposer, payload, this.f.agreement, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays, this.citing())).id });
    const unsent = await opts.beforeSend?.(proposed.id);
    if (unsent) return { clone: proposed.id, record: '', signed, stopped: unsent };
    const r = await record(this.id, { clone: proposed.id, signatures: signed.map((s) => s.act), inForce: this.f.agreement }, this.f.relays);
    this.f.governance = opts.governance;
    this.f.agreement = proposed.id;
    this.f.agreements.push(proposed.id);
    this.remember();
    return { clone: proposed.id, record: r.id, signed };
  }

  /**
   * The clause version a declaration against `member` applies: the newest
   * version of the agreement chain, up to the agreement in force, that the
   * member signed (Agreements rule 51, B12).
   */
  async clauseOf(member: string, via: Via = {}, upTo: string = this.f.agreement): Promise<string | null> {
    const chain = this.f.agreements.slice(0, this.f.agreements.indexOf(upTo) + 1);
    return (await signedVersions(member, chain, this.f.relays, via)).at(-1) ?? null;
  }

  /**
   * A declaration's payload against `member`, outcome 0, under the clause
   * they signed last; naming `agreement`, the agreement in force (during a
   * broken stretch, the one in force just before the broken act: RB3).
   */
  async declarationFor(member: string, via: Via = {}, agreement: string = this.f.agreement): Promise<Uint8Array> {
    const clause = await this.clauseOf(member, via, agreement);
    if (!clause) throw new Error('that member signed no version of the agreement');
    return declarationPayload(agreement, clause, member, Uint32Array.from([0]));
  }

  /**
   * Declare a member absent (Agreements rules 49, 51, 53; B12, B15), with outcome
   * 0, their voice removed: one of the other members signs the declaration,
   * under the clause the absent member signed last; the others add
   * signature acts naming it, as for terms; the collective registers it at
   * once by a record that acknowledges those signatures, placing them at
   * its line, drawn by the declaring member. From that line the member's
   * voice counts for nothing (F109). A collective has no signing key, so
   * no member's absence keeps it from drawing its line (rule 60).
   */
  async declareAbsent(opts: {
    member: string;
    by: TestIdentity;
    cosigners: TestIdentity[];
    expect?: Uint8Array;
    via?: Via;
    /**
     * During a broken stretch (Agreements rule 37d, RB3): the agreement in force
     * just before the broken act, which the declaration names. No record is
     * drawn: the rollback registers the declaration, naming the signature
     * acts beside it.
     */
    broken?: { before: string };
  }): Promise<{ declaration: string; signed: Signed[]; record?: string }> {
    if (this.f.pending) throw new Error('a member change is pending: settle it first');
    const named = opts.broken?.before ?? this.f.agreement;
    const payload = await this.declarationFor(opts.member, opts.via, named);
    if (opts.expect && !same(opts.expect, payload)) throw new Error('the declaration is not the one shown: nothing signed');
    const clause = await this.clauseOf(opts.member, opts.via, named);
    const d = await declare(opts.by, { agreement: named, clause: clause!, party: opts.member, outcomes: [0] }, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.cosigners) signed.push({ member: m.id, act: (await sign(m, d.id, this.f.relays)).id });
    if (opts.broken) {
      this.f.departed = [...(this.f.departed ?? []), { member: opts.member, declaration: d.id, signatures: signed.map((s) => s.act), named }];
      return { declaration: d.id, signed };
    }
    if (!this.id.actor || this.id.actor.id === opts.member) this.by(opts.by);
    const r = await record(this.id, { registers: [d.id], inForce: this.f.agreement, acks: signed.map((s) => s.act) }, this.f.relays);
    this.f.departed = [...(this.f.departed ?? []), { member: opts.member, declaration: d.id, record: r.id }];
    this.f.records = [...(this.f.records ?? []), r.id];
    return { declaration: d.id, signed, record: r.id };
  }

  /**
   * A chain signature of the collective (Identity type 16): its chain key,
   * rebuilt from the shares of `rebuilders`, signs `signs` on its identity
   * chain and commits a fresh key dealt to the same members. A fork's
   * successor signs for the debts it takes on this way (Agreements draft 14,
   * F303).
   */
  async chainSign(signs: string, relays: string[] = [], rebuilders: string[] = this.f.members): Promise<{ id: string; counts: boolean }> {
    const shares = this.f.safety.shares
      .filter((s) => rebuilders.includes(s.holder))
      .slice(0, this.f.safety.threshold)
      .map((s) => unb64(s.share));
    const current = rebuildChainKey(shares) as { scheme: number; seeds: Uint8Array; commit: string };
    const dealt = deal(this.f.members, this.f.safety.threshold, this.f.safety.index + 1, this.f.safety.scheme);
    const r = await this.id.chainSign(signs, relays, { scheme: current.scheme, seeds: current.seeds, next: { scheme: dealt.scheme, commit: dealt.commit } });
    this.f.safety = dealt;
    this.remember();
    return { id: r.id, counts: r.counts };
  }

  // ------------------------------------------------------------ real collectives (H18)

  /**
   * The founding terms of a real collective (H18): every member a party,
   * no signing key (rule 56). Nothing is signed here: the founder
   * proposes them, and each member signs on their own device.
   */
  static foundingTerms(governance: Governance, members: string[]): Uint8Array {
    return termsPayload(collectiveTerms(governance, members));
  }

  /**
   * Found a real collective once every party signed its founding terms
   * elsewhere (H18; Agreements rule 1): the chain key dealt to the members
   * (the air-gapped signer Module, 5.1: verifiably, each share checked, the
   * rebuild check done here, the one place that ever held the key), the
   * genesis declaring the agreement and naming its homes, the routes. **No
   * share is kept**: they are returned, to be sent to each member (sealed
   * to a one-time key) or shown once, and the file holds the dealing's
   * public part only. The genesis is signed by a first chain key made here
   * and dropped at once (Identity rule 1); the key dealt is the next one.
   * The collective has no signing key: its members act for it.
   */
  static async foundSigned(opts: {
    agreement: string;
    members: string[];
    homes: Home[];
    relays: string[];
    governance: Governance;
    scheme?: 2 | 3;
    via?: Via;
    /** The member whose app founds it, who makes its first acts with their own key. */
    actor?: TestIdentity;
  }): Promise<{ collective: TestCollective; shares: { holder: string; share: Uint8Array }[]; sent: Submitted[] }> {
    const ids = opts.members;
    const scheme = opts.scheme ?? 3;
    const { genesis, chainKey } = keylessGenesis(ids, opts.governance.safetyThreshold, scheme, opts.homes, opts.agreement);
    const shares = chainKey.shares.map((s) => ({ holder: s.holder, share: unb64(s.share) }));
    const c = new TestCollective(
      {
        label: COLLECTIVE_LABEL,
        identity: collectiveIdentity(genesis, opts.homes),
        relays: opts.relays,
        governance: opts.governance,
        members: ids,
        agreement: opts.agreement,
        agreements: [opts.agreement],
        safety: { ...chainKey, shares: [] },
        pending: null,
        releases: [],
      },
      opts.via ?? {},
    );
    c.remember();
    // Its genesis only: a collective signs no everyday act, routes among them (Identity, everyday check 4).
    const sent = await c.id.publishGenesis();
    if (opts.actor) c.by(opts.actor);
    return { collective: c, shares, sent };
  }

  /**
   * A member change's clone for a real collective (H18; rule 69), made and
   * not signed: its mark names the constitutional change rule and the
   * members whose voice remains (every one of them must sign, by default),
   * each signing on their own device; a joining member signs too, to be
   * bound. The founder proposes it; the rotation that declares it waits for
   * Kišib (decided by Nobody, allegedly: "Wait for Kišib").
   */
  cloneFor(members: string[], governance?: Governance): { payload: Uint8Array; signers: string[]; governance: Governance } {
    const g = this.departedAfter(governance ?? this.f.governance, members);
    const voices = this.f.members.filter((m) => !(this.f.departed ?? []).some((d) => d.member === m));
    const mark: MarkEntry[] = [{ power: { constitutional: true }, signers: voices }];
    const parent = collectiveTerms(this.f.governance, this.f.members);
    if (clonePlan(parent, collectiveTerms(g, members, this.f.agreement, mark)).needs.some((n) => n.form === 'judicial')) {
      mark.push({ power: { judicial: true }, signers: voices });
    }
    const payload = termsPayload(collectiveTerms(g, members, this.f.agreement, mark));
    return { payload, signers: [...new Set([...voices, ...members])], governance: g };
  }

  /**
   * The rotation of a real collective from its members' paper shares (H18:
   * a share is its number and 24 words; Kišib's work, this the stand-in in
   * tests): the current chain key rebuilt from the papers and checked
   * against the key this collective's chain commits to, the rotation
   * declaring the clone `agreement` with its signature acts and keeping
   * every line, the next key dealt to `members`, its shares returned and
   * kept nowhere. Waits in `pending` until the homes count it ([`settle`]).
   */
  async rotateFromPaper(o: {
    agreement: string;
    signatures: string[];
    members: string[];
    governance: Governance;
    papers: { x: number; value: Uint8Array }[];
    lines?: KeptLines;
  }): Promise<{ id: string; sent: Submitted[]; shares: { holder: string; share: Uint8Array }[] }> {
    if (this.f.pending || this.f.identity.pending) throw new Error('a member change is already pending: resend it');
    const plan = await this.planLines(o.lines);
    checkWarned(plan, o.lines?.warned);
    const current = rebuildChainKeyFromPaper({
      seedModule: 'words',
      scheme: this.f.safety.scheme,
      index: this.f.safety.index,
      commit: this.f.safety.commit,
      papers: o.papers,
    }) as { scheme: number; seeds: Uint8Array; commit: string };
    const dealt = deal(o.members, o.governance.safetyThreshold, this.f.safety.index + 1, this.f.safety.scheme);
    const shares = dealt.shares.map((s) => ({ holder: s.holder, share: unb64(s.share) }));
    const f = this.f.identity;
    // Identity rotation check 4: no signing key, no kept tip.
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: f.identity,
      previous: actId(this.id.chainActs()[f.position]),
      position: f.position + 1,
      chainKeySeeds: current.seeds,
      chainKeyScheme: current.scheme,
      nextChainKeyScheme: dealt.scheme,
      nextChainKeyCommit: dealt.commit,
      kept: [],
      declarations: [{ spec: AGREEMENTS_SPECS.agreements, kind: FOUNDING_AGREEMENT, value: o.agreement, signatures: o.signatures }],
    });
    current.seeds.fill(0);
    const id = actId(rotation);
    f.pending = { rotation: b64(rotation), id, signingSecret: '', safety: { scheme: dealt.scheme, seeds: '' }, homes: f.homes, rule: f.rule };
    this.f.pending = { safety: { ...dealt, shares: [] }, agreement: o.agreement, members: o.members, governance: o.governance === this.f.governance ? undefined : o.governance };
    const sent = await this.id.submitRotation();
    return { id, sent, shares };
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
      this.remember();
    }
    return counts;
  }
}
