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
import { propose, sign, type CollectiveTerms, type Rule } from './law.ts';
import { FOUNDING_AGREEMENT, REPO_SPECS } from './specs.ts';

export const COLLECTIVE_LABEL =
  'MOR TEST COLLECTIVE. Its everyday key and every member share are held in software, in this file: a prototype, never for a real collective.';

const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
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
  /** Any k members' visible signatures make a publication of the collective count. */
  releaseThreshold: number;
  /** Any k of the parties complete a clone. */
  cloneThreshold: number;
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
  pending: { safety: Dealt; agreement: string; members: string[] } | null;
  /** Releases published, newest last, with their manifests (for the next one to reuse unchanged files). */
  releases: { id: string; version: string; manifest: string }[];
}

/** What happened to one act the members signed. */
export interface Signed {
  member: string;
  act: string;
}

function terms(g: Governance, members: string[], holder: string, parent?: string): CollectiveTerms {
  const rule = (k: number): Rule => ({ threshold: k });
  return {
    parties: members,
    text: g.text,
    clone: rule(g.cloneThreshold),
    signingHolder: holder,
    safety: { threshold: g.safetyThreshold, members },
    // A release is a publication of the collective (Envelope type 0): it
    // needs this many members' visible signatures (F100).
    listed: [{ spec: SPECS.envelope, type: 0, rule: rule(g.releaseThreshold) }],
    abandonment: { others: g.abandonmentOthers, outcomes: [0] },
    extensions: [REPO_SPECS.manifest],
    parent,
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
  }): Promise<{ collective: TestCollective; agreement: string; signed: Signed[]; sent: Submitted[] }> {
    const ids = opts.members.map((m) => m.id);
    const holder = ids[0];
    const t = terms(opts.governance, ids, holder);
    const proposed = await propose(opts.members[0], t, opts.relays);
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
   * Change members (Law rule 37): a clone of the agreement in force naming
   * the new members, proposed by `proposer`, signed by `signers` (the
   * parent's clone rule counts the parent's parties; each joining member
   * signs to be bound); then a rotation of the collective declaring the
   * clone, signed by the safety key rebuilt from the shares of `rebuilders`
   * (members who stay: a leaving member hands over nothing), and committing
   * to a next key dealt to the new members only. A leaving member never held
   * the next key. Save every file after.
   */
  async changeMembers(opts: {
    members: string[];
    proposer: TestIdentity;
    signers: TestIdentity[];
    rebuilders: string[];
  }): Promise<{ clone: string; rotation: string; signed: Signed[]; sent: Submitted[] }> {
    if (this.f.pending || this.f.identity.pending) throw new Error('a member change is already pending: resend it');
    const holder = opts.members.includes(this.f.signingHolder) ? this.f.signingHolder : opts.members[0];
    const t = terms(this.f.governance, opts.members, holder, this.f.agreement);
    const proposed = await propose(opts.proposer, t, this.f.relays);
    const signed: Signed[] = [];
    for (const m of opts.signers) signed.push({ member: m.id, act: (await sign(m, proposed.id, this.f.relays)).id });

    // The rotating device: rebuild the current key from k shares of members who stay.
    const shares = this.f.safety.shares
      .filter((s) => opts.rebuilders.includes(s.holder))
      .slice(0, this.f.safety.threshold)
      .map((s) => unb64(s.share));
    const current = rebuildSafety(shares) as { scheme: number; seeds: Uint8Array; commit: string };
    const next = deal(opts.members, this.f.governance.safetyThreshold, this.f.safety.index + 1, this.f.safety.scheme);

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
      nextSafetyScheme: next.scheme,
      nextSafetyCommit: next.commit,
      kept,
      declarations: [{ spec: REPO_SPECS.law, kind: FOUNDING_AGREEMENT, value: proposed.id }],
    });
    const id = actId(rotation);
    f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: next.scheme, seeds: '' },
      homes: f.homes,
      rule: f.rule,
    };
    this.f.pending = { safety: next, agreement: proposed.id, members: opts.members };
    this.f.signingHolder = holder;
    const sent = await this.id.submitRotation();
    return { clone: proposed.id, rotation: id, signed, sent };
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
      this.f.pending = null;
    }
    return counts;
  }
}
