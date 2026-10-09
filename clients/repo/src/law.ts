// Law acts as the test collective makes them (Law draft 8): terms, whether a
// founding agreement or a clone of one (with its mark), signature acts,
// resignations and records. The payloads are built here and checked by the
// core library (`checkTerms`, `lawClonePlan`) before anything is signed;
// the core library alone judges them afterwards.

import {
  MIPS,
  SPECS,
  Verifier,
  cborDecode,
  cborEncode,
  checkTerms,
  contestPayload,
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
   * null, this collective itself (a share of all its income, F121 Q8,
   * F124 S1), or a work; a holder null is this collective. */
  stakes?: Stake[];
  /** The split service's grant (field 14), a judicial clause. */
  splitGrant?: string;
  /** The departed members entry (field 22): who left (F124 N5); their stake is in field 7. */
  departed?: string[];
  /** Forked from (field 23): founding terms of a side of a fork, naming the original collective, a back-link (F124 N4). */
  forkedFrom?: string;
}

/** A stake (terms field 7): null names this collective (F124, S1). */
export interface Stake {
  object: string | null;
  holders: [string | null, number][];
}

const who = (h: string | null) => (h === null ? null : unhex(h));

/** The outcomes an abandonment clause may allow (Law rule 53), in plain words. */
const ABSENCE_OUTCOMES = [
  'the member loses their voice (they no longer count in any rule or area)',
  'their stake is shared among the remaining holders',
  'their stake is transferred to parties named or defined by role',
  'their obligations are redirected or held',
  'the agreement is closed',
];

/**
 * The abandonment clause in plain words, shown before a member signs terms
 * carrying it (Law rule 49, client conformance; F172, F178 item 11): who
 * may declare a member absent, with which outcomes, and whether an
 * absence-proof cMIP stands between. This client writes none (clause key
 * 3), so the declaration is the authority's judgment alone, a stated cost.
 */
export function absenceNotice(a: CollectiveTerms['abandonment']): string {
  const outcomes = a.outcomes.map((o) => ABSENCE_OUTCOMES[o] ?? `outcome ${o}`);
  const listed = outcomes.length <= 1 ? outcomes.join('') : `${outcomes.slice(0, -1).join(', ')} and ${outcomes[outcomes.length - 1]}`;
  return (
    `Absence: any ${a.others} of the other members together may declare a member absent. What may then follow: ${listed}. ` +
    'No absence-proof cMIP stands between: their word alone is enough, nobody checks it against time or the member\'s activity. ' +
    'Signing accepts that (Law rules 49 and 51, a stated cost); a member declared absent wrongly can only contest it, in public (Law rule 52).'
  );
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
    // The collective's own stake (null) first, then works by hash.
    const key = (o: string | null) => (o === null ? '' : o);
    m.set(7, [...t.stakes].sort((a, b) => (key(a.object) < key(b.object) ? -1 : 1)).map((x) => [who(x.object), x.holders.map(([h, n]) => [who(h), n])]));
  }
  if (t.splitGrant) m.set(14, unhex(t.splitGrant));
  if (t.departed?.length) m.set(22, t.departed.map(unhex));
  if (t.forkedFrom) m.set(23, unhex(t.forkedFrom));
  return cborEncode(m);
}

/** A kept tip: an act, its position, the running summary including it. */
export interface Tip {
  act: string;
  position: number;
  summary: string;
}

/** The fork of a collective (Law type 19, rule 47a, F121 shape B, F124). */
export interface ForkAct {
  agreement: string;
  collective: string;
  chainAct: string;
  tips: Tip[];
  /** Each side: the successor collective it founded first (N4), and its members. */
  sides: { successor: string; members: string[] }[];
  /** Shares of stakes the original held, where not the default: [agreement, index, a share per side]. */
  shares?: [string, number, number[]][];
  /** Every obligation of the original, each to one side or several jointly (N13): [obligation, sides]. */
  debts?: [string, number[]][];
}

export function forkPayload(f: ForkAct): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(f.agreement)],
    [1, unhex(f.collective)],
    [2, unhex(f.chainAct)],
    [3, f.tips.map((t) => [unhex(t.act), t.position, unhex(t.summary)])],
    [4, f.sides.map((s) => [unhex(s.successor), s.members.map(unhex)])],
  ]);
  if (f.shares?.length) m.set(5, f.shares.map(([a, i, s]) => [unhex(a), i, s]));
  if (f.debts?.length) m.set(6, f.debts.map(([o, i]) => [unhex(o), [...i].sort((x, y) => x - y)]));
  return cborEncode(m);
}

/** The closing of a collective that holds nothing (Law type 20, F124 N9): its line, as a fork's. */
export function closingPayload(c: { agreement: string; collective: string; chainAct: string; tips: Tip[] }): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(c.agreement)],
      [1, unhex(c.collective)],
      [2, unhex(c.chainAct)],
      [3, c.tips.map((t) => [unhex(t.act), t.position, unhex(t.summary)])],
    ]),
  );
}

/** A creditor's release (Finance type 4, F126; Law type 21 under F125): the creditor ends an obligation owed to it without full payment; `against`, for the record only, what it took instead (receipts, a Law agreement it was traded for). A collective signs it by its Finance lane. */
export function debtReleasePayload(r: { obligation: string; against?: string[] }): Uint8Array {
  const m = new Map<number, unknown>([[0, unhex(r.obligation)]]);
  if (r.against?.length) m.set(1, r.against.map(unhex));
  return cborEncode(m);
}

/** A release to the public domain (Law type 5, rule 17, F121 shape D). */
export interface ReleaseAct {
  work: string;
  /** The stakes it ends: [agreement, index]. */
  stakes: [string, number][];
  /** The work claims naming its creators. */
  claims?: string[];
  /** Each publication carrying it, and its content key; may be empty in a timed release. */
  keys: [string, Uint8Array][];
  /** A timed release (F124 N11): a point on the time reference, and who delivers the keys then. */
  timed?: { point: number; keeper: string };
}

export function releasePayload(r: ReleaseAct): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(r.work)],
    [1, r.stakes.map(([a, i]) => [unhex(a), i])],
  ]);
  if (r.keys.length) m.set(3, r.keys.map(([p, k]) => [unhex(p), k]));
  if (r.claims?.length) m.set(2, r.claims.map(unhex));
  if (r.timed) m.set(4, [r.timed.point, unhex(r.timed.keeper)]);
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

/**
 * A split (Law type 8). `tally`: for each stake it pays, the running count
 * of leftover units each holder has received from the service's splits for
 * that stake, this one included, as `[stake, [[holder, count]]]` (Law rule
 * 15a, F165, F171, F178 item 15): field 4, a PROPOSED format, to confirm
 * with Nobody, allegedly (the spec gives the field, not its key). The split
 * act cites, in `refs`, the service's previous split for each stake.
 */
export function splitPayload(s: { receipt: string; payouts: PayoutIn[]; cmip: string; agreement: string; tally?: [number, [string, number][]][]; number?: number }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(s.receipt)],
    [
      1,
      s.payouts.map((p) => {
        const x = new Map<number, unknown>([
          [0, unhex(p.receiver)],
          [1, p.amount],
        ]);
        if (p.stake !== undefined) x.set(2, p.stake);
        if (p.feeModule) x.set(5, unhex(p.feeModule));
        return x;
      }),
    ],
    [2, unhex(s.cmip)],
    [3, unhex(s.agreement)],
  ]);
  if (s.tally?.length) m.set(4, s.tally.map(([stake, hs]) => [stake, hs.map(([h, n]) => [unhex(h), n])]));
  // DQ6 (F188): one numbering across every split the service makes under a deal, from 1.
  if (s.number !== undefined) m.set(5, s.number);
  return cborEncode(m);
}

/** A grant (Law type 9) to act for the grantor: here, a split service's.
 * `key`: the grant key (field 9, F128), the public part of a signing key
 * the grantee made and keeps, as Identity's `[scheme, key]`: acts signed
 * with it are the collective's own, a strand of its actions chain, within
 * the grant. `byThis`: its grantor is "this collective", the one whose
 * founding terms name it (field 8, null; F124 S1), signed before the
 * collective exists. */
export function grantPayload(grantee: string, key: [number, Uint8Array], byThis = false): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(grantee)],
    [1, 2],
  ]);
  if (byThis) m.set(8, null);
  m.set(9, key);
  return cborEncode(m);
}

/** A payee's grant to a deal's split service (Law type 9, F129 H4): signed
 * by the payee with its own key, public, managing "this agreement" (scope 1,
 * field 2 written null), the deal whose terms list it in field 14, one grant
 * per payee. It counts once every party has signed that deal, and the
 * service has signed to accept it. Its key signs only receipts for money
 * coming into the deal, never one whose payer is the service, nor a split's
 * payout (H5). */
export function dealGrantPayload(service: string, key: [number, Uint8Array]): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(service)],
      [1, 1],
      [2, null],
      [9, key],
    ]),
  );
}

/** An obligation (Finance type 1), signed by the debtor. */
export function obligationPayload(o: { debtor: string; creditor: string; unit: string; value: number; pointer: string }): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(o.debtor)],
      [1, unhex(o.creditor)],
      [2, [unhex(o.unit), o.value]],
      [3, unhex(o.pointer)],
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

/** A settlement receipt (Finance type 2), signed by the payee of the hop; `purchase`, for a purchase, the claim it pays under: [agreement, line] (field 9, F126). */
export function receiptPayload(r: { rail: string; payee: string; unit: string; value: number; fulfils: string; payer?: string; purchase?: [string, string] }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(r.rail)],
    [1, new Uint8Array()],
    [3, unhex(r.payee)],
    [4, [unhex(r.unit), r.value]],
    [5, unhex(r.fulfils)],
  ]);
  if (r.payer) m.set(2, unhex(r.payer));
  if (r.purchase) m.set(9, r.purchase.map(unhex));
  return cborEncode(m);
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
  // F189 (6): a version settling a deal's fork also cites each tip it
  // settles (field 26, a list since QF3), after its parent, in that order,
  // so that verifiers fetching by citation find them.
  const settles = (cborDecode(payload) as Map<number, unknown>).get(26);
  if (objects && Array.isArray(settles)) for (const x of settles) if (x instanceof Uint8Array) objects.push([hex(x), hex(x)]);
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.terms, payload, { public: true, relays, objects });
}

/**
 * The latest of `by`'s own payee pointers (Finance type 0) found on
 * `relays`, where its pointers are published, whichever of its devices
 * published it (Finance rule 14, F163): each pointer valid on `by`'s chain,
 * naming `by` as its payee; the latest of the unbroken chain, or at a fork
 * the last before it (rule 12). Null where none is found.
 */
export async function latestPointer(by: TestIdentity, relays: string[]): Promise<string | null> {
  const v = new Verifier(SPECS.identity, MIPS.finance, MIPS.law);
  for (const a of by.chainActs()) v.add(a);
  const found = new Map<string, { version: number; previous: string | null }>();
  for (const h of relays) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, by.via).feed({ signer: by.id, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          try {
            const d = describeAct(it.item) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
            if (d.spec !== MIPS.finance || d.type !== FINANCE_POINTER || !d.payload) continue;
            const m = cborDecode(d.payload) as Map<number, unknown>;
            const payee = m.get(0);
            if (!(payee instanceof Uint8Array) || hex(payee) !== by.id) continue;
            const id = v.add(it.item);
            if (v.status(id) !== 'valid') continue;
            const prev = m.get(2);
            found.set(id, { version: Number(m.get(1)), previous: prev instanceof Uint8Array ? hex(prev) : null });
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
  // Rule 12: from the one first version, follow the one next version.
  const firsts = [...found].filter(([, p]) => p.version === 1 && p.previous === null);
  if (firsts.length !== 1) return null;
  let [at, p] = firsts[0];
  for (;;) {
    const next = [...found].filter(([, q]) => q.previous === at && q.version === p.version + 1);
    if (next.length !== 1) return at;
    [at, p] = next[0];
  }
}

/** Finance's payee pointer type (Finance draft 6, type 0). */
const FINANCE_POINTER = 0;

/**
 * Sign an act: a Law signature act that follows the act it signs. Where it
 * signs terms or an offer, which can pay its signer, it cites in `refs` the
 * latest of the signer's payee pointers found on `relays` (Finance rule 14,
 * F163, client conformance): an identity keeps one sequence per device, so
 * a deal signed on one device finds a wallet published from another.
 */
export async function sign(by: TestIdentity, act: string, relays: string[]) {
  await carryChain(by, relays);
  let refs: string[] | undefined;
  if (await canPaySigner(act, relays, by.via)) {
    const p = await latestPointer(by, relays);
    if (p) refs = [p];
  }
  return by.publish(REPO_SPECS.law, LAW_TYPES.signature, signaturePayload(act), {
    public: true,
    relays,
    objects: [[act, act]],
    refs,
  });
}

/** Whether the act signed is terms or a standing offer (Law types 0 and 6), as a relay holding it shows. */
async function canPaySigner(act: string, relays: string[], via: Via): Promise<boolean> {
  for (const h of relays) {
    try {
      const a = await relayAt(h, via).getAct(act);
      if (!a) continue;
      const d = describeAct(a) as { spec?: string; type?: number };
      return d.spec === REPO_SPECS.law && (d.type === LAW_TYPES.terms || d.type === LAW_TYPES.offer);
    } catch {
      // that relay is away
    }
  }
  return false;
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
  // F189 (8): a declaration counts only if public or addressed to the
  // member it names; it is published, and also delivered to that member's
  // inbox, so they see it early (a SHOULD; the safeguard is that it counts
  // only where they can obtain it).
  return by.publish(REPO_SPECS.law, LAW_TYPES.declaration, declarationPayload(d.agreement, d.clause, d.party, Uint32Array.from(d.outcomes)), {
    public: true,
    relays,
    to: [d.party],
    objects: [[d.agreement, d.agreement]],
  });
}

/**
 * A contest of a declaration of absence (Law type 14, rule 52; BQ4,
 * decided by Nobody, allegedly, 9 October 2026), signed by the party the
 * declaration names: it shows presence and the dispute, and voids nothing.
 * Public, and delivered to the declaration's signer.
 */
export async function contest(by: TestIdentity, declaration: { act: string; signer: string }, relays: string[]) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.contest, contestPayload(declaration.act), {
    public: true,
    relays,
    to: [declaration.signer],
    objects: [[declaration.act, declaration.act]],
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
