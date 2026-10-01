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
  markMatches,
  proposePayload,
  record,
  resign,
  sign,
  termsPayload,
  type CollectiveTerms,
  type MarkEntry,
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
    abandonment: { others: g.abandonmentOthers, outcomes: [0] },
    extensions: [REPO_SPECS.manifest],
    parent,
    mark,
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
    const governance = opts.governance ?? this.f.governance;
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
    const mark: MarkEntry[] = [
      {
        power: { constitutional: true },
        signers: opts.signers.map((m) => m.id).filter((id) => this.f.members.includes(id) && !left.has(id)),
      },
    ];
    const parent = collectiveTerms(this.f.governance, this.f.members, this.f.signingHolder);
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
      declarations: [{ spec: LAW_SPECS.law, kind: FOUNDING_AGREEMENT, value: proposed.id, signatures: signed.map((s) => s.act) }],
    });
    const id = actId(rotation);
    f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: dealt.scheme, seeds: '' },
      homes: f.homes,
      rule: f.rule,
    };
    this.f.pending = { safety: dealt, agreement: proposed.id, members: opts.members, governance: opts.governance };
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
  }): Promise<{ clone: string; record: string; signed: Signed[] }> {
    if (this.f.pending) throw new Error('a member change is pending: settle it first');
    const governance = { ...this.f.governance, releaseWords: opts.words };
    const mark: MarkEntry[] = [{ power: { area: 1 }, signers: opts.signers.map((m) => m.id) }];
    const parent = collectiveTerms(this.f.governance, this.f.members, this.f.signingHolder);
    const next = collectiveTerms(governance, this.f.members, this.f.signingHolder, this.f.agreement, mark);
    if (!markMatches(mark, clonePlan(parent, next).needs)) throw new Error('not an ordinary change of the release area');
    const proposed = await proposePayload(opts.proposer, termsPayload(next), this.f.agreement, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays)).id });
    const r = await record(this.id, { clone: proposed.id, signatures: signed.map((s) => s.act), inForce: this.f.agreement }, this.f.relays);
    this.f.governance = governance;
    this.f.agreement = proposed.id;
    this.f.agreements.push(proposed.id);
    return { clone: proposed.id, record: r.id, signed };
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
