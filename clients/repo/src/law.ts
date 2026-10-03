// Law acts as the test collective makes them (Law draft 8): terms, whether a
// founding agreement or a clone of one (with its mark), signature acts,
// resignations and records. The payloads are built here and checked by the
// core library (`checkTerms`, `lawClonePlan`) before anything is signed;
// the core library alone judges them afterwards.

import {
  MIPS,
  cborDecode,
  cborEncode,
  checkTerms,
  declarationPayload,
  describeAct,
  hex,
  lawClonePlan,
  recordPayload,
  resignationPayload,
  signaturePayload,
  unhex,
} from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { LAW_TYPES, REPO_SPECS } from './specs.ts';

/** `rule`: every party, any k of them, or named ones. */
export type Rule = { all: true } | { threshold: number } | { named: string[] };

const ruleValue = (r: Rule): unknown[] =>
  'all' in r ? [0] : 'threshold' in r ? [1, r.threshold] : [2, r.named.map(unhex)];

/** A power a clone's mark claims (Law draft 7, F104); the judicial tier, every member (Law draft 10, F121). */
export type Power = { constitutional: true } | { clone: true } | { area: number } | { judicial: true };

/** The powers a mark lists, ascending by their encoding (Law, "mark"): [0] < [1] < [4] < [2, area]. */
export const markOrder = (p: Power): number => ('constitutional' in p ? 0 : 'clone' in p ? 1 : 'judicial' in p ? 2 : 3);

const powerValue = (p: Power): unknown[] =>
  'constitutional' in p ? [0] : 'clone' in p ? [1] : 'judicial' in p ? [4] : [2, p.area];

/** One entry of a mark: the power, and the parties whose signatures meet it. */
export interface MarkEntry {
  power: Power;
  signers: string[];
}

/** The release area's id: permanent, never reused (Law draft 7, Q32). */
export const RELEASE_AREA = 1;

/** The spec hashes the core library's Law calls take: the six MIPs, and the
 * layers each extension the collective names declares (the release manifest
 * cMIP declares none beyond Production). */
export const LAW_SPECS = { ...MIPS, law: REPO_SPECS.law, extLayers: { [REPO_SPECS.manifest]: [] as number[] } };

/** A founding agreement for a collective, or a clone of one (Law draft 7). */
export interface CollectiveTerms {
  /** The members, in order: the parties. */
  parties: string[];
  /** The constitution's words, as canonical text. What every member reads before signing. */
  text: string;
  /** The clone rule: the judicial tier, and operational matters outside every area. */
  clone: Rule;
  /** The constitutional change rule (field 18); absent: every party. */
  constitutional?: Rule;
  /** Who holds the collective's everyday signing key. */
  signingHolder: string;
  /** The safety key as shares: any `threshold` of these members rebuild it. */
  safety: { threshold: number; members: string[] };
  /** The release rule, as an area: publications of the collective (Envelope
   * type 0) count only with this many of its holders' signature acts. */
  releases: { holders: string[]; threshold: number; words?: string };
  /** Who decides absence: a threshold of the other parties; the outcomes
   * include 0, a voice removed, so every member is covered (F105). */
  abandonment: { others: number; outcomes: number[] };
  /** Extensions: cMIPs outside the listed tasks (the release manifest cMIP). */
  extensions: string[];
  /** For a clone: the agreement it replaces, and its mark. */
  parent?: string;
  mark?: MarkEntry[];
  /** Stakes (field 7), each object and its holders' shares in millionths:
   * the collective itself (a share of all its income, F121 Q8), or a work. */
  stakes?: { object: string; holders: [string, number][] }[];
  /** The split service's grant (field 14), a judicial clause. */
  splitGrant?: string;
  /** The departed members entry (field 22): who left, and their stake. */
  departed?: [string, number][];
  /** Forked from (field 23): founding terms of a side of a fork (F121, B). */
  forkedFrom?: { original: string; fork: string; side: number };
}

/** The terms payload, as CBOR, checked by the core library. */
export function termsPayload(t: CollectiveTerms): Uint8Array {
  const payload = encodeTerms(t);
  checkTerms(payload, LAW_SPECS);
  return payload;
}

/** The terms payload, as CBOR, not yet checked: for showing why Law would refuse it. */
export function encodeTerms(t: CollectiveTerms): Uint8Array {
  const grammar = new Map<number, unknown>([
    [0, [0, unhex(t.signingHolder)]],
    [1, [1, t.safety.threshold, t.safety.members.map(unhex)]],
  ]);
  const area = new Map<number, unknown>([
    [0, 'Releases'],
    [1, t.releases.holders.map(unhex)],
    [2, t.releases.threshold],
    [3, [[1, unhex(MIPS.envelope), 0]]],
    [5, RELEASE_AREA],
  ]);
  // A mark's signers are ascending by hash (Law draft 8, B8): lowercase
  // hex sorts as the bytes do.
  const field4 = t.parent
    ? [...(t.mark ?? [])].sort((a, b) => markOrder(a.power) - markOrder(b.power)).map((e) => [powerValue(e.power), [...e.signers].sort().map(unhex)])
    : [0];
  const m = new Map<number, unknown>([
    [0, t.parties.map(unhex)],
    [1, t.text],
    [2, new Map()],
    [4, field4],
    [5, ruleValue(t.clone)],
    [9, new Map<number, unknown>([
      [0, [1, t.abandonment.others]],
      [1, t.abandonment.outcomes],
    ])],
    [12, grammar],
    [15, t.extensions.map(unhex)],
    [19, [area]],
  ]);
  if (t.constitutional) m.set(18, ruleValue(t.constitutional));
  if (t.releases.words) m.set(20, new Map([[RELEASE_AREA, t.releases.words]]));
  if (t.parent) m.set(11, unhex(t.parent));
  if (t.stakes?.length) {
    m.set(7, [...t.stakes].sort((a, b) => (a.object < b.object ? -1 : 1)).map((x) => [unhex(x.object), x.holders.map(([h, n]) => [unhex(h), n])]));
  }
  if (t.splitGrant) m.set(14, unhex(t.splitGrant));
  if (t.departed?.length) m.set(22, t.departed.map(([h, n]) => [unhex(h), n]));
  if (t.forkedFrom) m.set(23, [unhex(t.forkedFrom.original), unhex(t.forkedFrom.fork), t.forkedFrom.side]);
  return cborEncode(m);
}

/** A kept tip: an act, its position, the running summary including it. */
export interface Tip {
  act: string;
  position: number;
  summary: string;
}

/** The fork of a collective (Law type 19, rule 47a, F121 shape B). */
export interface ForkAct {
  agreement: string;
  collective: string;
  chainAct: string;
  tips: Tip[];
  sides: string[][];
  /** Shares of stakes the original held, where not the default: [agreement, index, a share per side]. */
  shares?: [string, number, number[]][];
  /** Debts assigned to a side: [obligation, side]. */
  debts?: [string, number][];
}

export function forkPayload(f: ForkAct): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(f.agreement)],
    [1, unhex(f.collective)],
    [2, unhex(f.chainAct)],
    [3, f.tips.map((t) => [unhex(t.act), t.position, unhex(t.summary)])],
    [4, f.sides.map((s) => s.map(unhex))],
  ]);
  if (f.shares?.length) m.set(5, f.shares.map(([a, i, s]) => [unhex(a), i, s]));
  if (f.debts?.length) m.set(6, f.debts.map(([o, i]) => [unhex(o), i]));
  return cborEncode(m);
}

/** A release to the public domain (Law type 5, rule 17, F121 shape D). */
export interface ReleaseAct {
  work: string;
  /** The stakes it ends: [agreement, index]. */
  stakes: [string, number][];
  /** The work claims naming its creators. */
  claims?: string[];
  /** Each publication carrying it, and its content key. */
  keys: [string, Uint8Array][];
}

export function releasePayload(r: ReleaseAct): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(r.work)],
    [1, r.stakes.map(([a, i]) => [unhex(a), i])],
    [3, r.keys.map(([p, k]) => [unhex(p), k])],
  ]);
  if (r.claims?.length) m.set(2, r.claims.map(unhex));
  return cborEncode(m);
}

/** One payout of a split (Law type 8, F121 Q9). */
export interface PayoutIn {
  receiver: string;
  amount: number;
  /** The stake it pays, by its index in the agreement's terms. */
  stake?: number;
  /** A fee: the module whose fee it pays. */
  feeModule?: string;
}

export function splitPayload(s: { receipt: string; payouts: PayoutIn[]; cmip: string; agreement: string }): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(s.receipt)],
      [
        1,
        s.payouts.map((p) => {
          const m = new Map<number, unknown>([
            [0, unhex(p.receiver)],
            [1, p.amount],
          ]);
          if (p.stake !== undefined) m.set(2, p.stake);
          if (p.feeModule) m.set(5, unhex(p.feeModule));
          return m;
        }),
      ],
      [2, unhex(s.cmip)],
      [3, unhex(s.agreement)],
    ]),
  );
}

/** A grant (Law type 9) to act for the grantor: here, a split service's. */
export function grantPayload(grantee: string): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(grantee)],
      [1, 2],
    ]),
  );
}

/** A payee pointer (Finance type 0): rails, each [rail Module, address bytes]. */
export function pointerPayload(p: { payee: string; version: number; previous?: string; rails: [string, Uint8Array][] }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(p.payee)],
    [1, p.version],
    [3, p.rails.map(([mod, a]) => [unhex(mod), a])],
  ]);
  if (p.previous) m.set(2, unhex(p.previous));
  return cborEncode(m);
}

/** A settlement receipt (Finance type 2), signed by the payee of the hop. */
export function receiptPayload(r: { rail: string; payee: string; unit: string; value: number; fulfils: string }): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(r.rail)],
      [1, new Uint8Array()],
      [3, unhex(r.payee)],
      [4, [unhex(r.unit), r.value]],
      [5, unhex(r.fulfils)],
    ]),
  );
}

/** What a clone changes, and the powers its mark must name (Law rule 44c). */
export function clonePlan(parent: CollectiveTerms, clone: CollectiveTerms): {
  changes: { form: string; tier: string; field?: number; task?: number; area?: number }[];
  needs: { form: string; area?: number }[];
} {
  return lawClonePlan(encodeTerms(parent), encodeTerms({ ...clone, mark: [{ power: { clone: true }, signers: [clone.parties[0]] }] }), LAW_SPECS);
}

/** Whether the powers a mark names are exactly those a plan needs. */
export function markMatches(mark: MarkEntry[], needs: { form: string; area?: number }[]): boolean {
  const key = (p: Power) =>
    'constitutional' in p ? 'constitutional' : 'clone' in p ? 'clone' : 'judicial' in p ? 'judicial' : `area ${p.area}`;
  const want = needs.map((n) => (n.form === 'area' ? `area ${n.area}` : n.form));
  const sorted = [...mark].sort((a, b) => markOrder(a.power) - markOrder(b.power));
  return JSON.stringify(sorted.map((e) => key(e.power))) === JSON.stringify(want);
}

/**
 * Carry an identity's chain acts (genesis, rotations: the same bytes) to the
 * relays it publishes on, so a reader who knows only a relay finds its
 * genesis, and from it its homes. Any relay may carry them; a refusal is
 * the relay's policy.
 */
export async function carryChain(by: TestIdentity, relays: string[]): Promise<void> {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
        // that relay's policy, or it is away
      }
    }
  }
}

/** Propose terms: an act of the proposer, public so anyone can check the collective. */
export async function propose(by: TestIdentity, t: CollectiveTerms, relays: string[]) {
  return proposePayload(by, termsPayload(t), t.parent, relays);
}

/**
 * Propose terms given as their exact payload, already checked and shown to
 * the proposer (Law rule 4a): a clone names its parent in `objects`.
 */
export async function proposePayload(by: TestIdentity, payload: Uint8Array, parent: string | undefined, relays: string[]) {
  checkTerms(payload, LAW_SPECS);
  const objects: [string, string][] | undefined = parent ? [[parent, parent]] : undefined;
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.terms, payload, { public: true, relays, objects });
}

/** Sign an act: a Law signature act that follows the act it signs. */
export async function sign(by: TestIdentity, act: string, relays: string[]) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.signature, signaturePayload(act), {
    public: true,
    relays,
    objects: [[act, act]],
  });
}

/**
 * Leave the collective alone (Law rule 37a): a resignation act naming the
 * agreement, signed by the member with their own key, no one else's. It
 * takes effect for the collective at the line its record draws.
 */
export async function resign(by: TestIdentity, agreement: string, relays: string[], area?: number) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.resignation, resignationPayload(agreement, area), {
    public: true,
    relays,
    objects: [[agreement, agreement]],
  });
}

/**
 * An abandonment declaration (Law type 13, B12): the agreement, the version
 * whose clause it applies (the last the party signed), the party and the
 * outcomes. Signed by the authority, here one of the other members, with
 * their own key; where the clause asks for more of them, the others add
 * signature acts naming it (B15).
 */
export async function declare(
  by: TestIdentity,
  d: { agreement: string; clause: string; party: string; outcomes: number[] },
  relays: string[],
) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.declaration, declarationPayload(d.agreement, d.clause, d.party, Uint32Array.from(d.outcomes)), {
    public: true,
    relays,
    objects: [[d.agreement, d.agreement]],
  });
}

/**
 * The agreements of `chain` (oldest first) that `member` signed, by a Law
 * signature act its relays hold: the newest of them is the clause version
 * a declaration against that member applies (Law rule 51, B12). The core
 * library checks it again when it judges the declaration.
 */
export async function signedVersions(member: string, chain: string[], relays: string[], via: Via = {}): Promise<string[]> {
  const signed = new Set<string>();
  for (const h of relays) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ signer: member, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          try {
            const d = describeAct(it.item) as { spec?: string; type?: number; payload?: Uint8Array };
            if (d.spec !== REPO_SPECS.law || d.type !== LAW_TYPES.signature || !d.payload) continue;
            const m = cborDecode(d.payload) as Map<number, unknown>;
            const x = m.get(0);
            if (x instanceof Uint8Array) signed.add(hex(x));
          } catch {
            // not one of ours, or malformed
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that relay is away: the others may hold them
    }
  }
  return chain.filter((a) => signed.has(a));
}

/**
 * The collective's record (Law type 17), its everyday line: it writes a
 * complete clone with the signature acts that complete it (A2), and
 * registers departures (A1). Signed with the collective's everyday key.
 * A test collective keeps one sequence, so it names no other. `acks`:
 * acts it acknowledges (Envelope), which places members' signature acts at
 * this line ("Made before, made after", 2): the signatures completing a
 * declaration it registers (B15).
 */
export async function record(
  collective: TestIdentity,
  r: { clone?: string; signatures?: string[]; registers?: string[]; inForce: string; acks?: string[] },
  relays: string[],
) {
  const payload = recordPayload({
    clone: r.clone ?? null,
    signatures: r.signatures ?? null,
    kept: [],
    registers: r.registers?.length ? r.registers : null,
  });
  const named = r.clone ?? r.inForce;
  return collective.publish(REPO_SPECS.law, LAW_TYPES.record, payload, {
    public: true,
    relays,
    objects: [[named, named]],
    acks: r.acks?.length ? r.acks : undefined,
  });
}
