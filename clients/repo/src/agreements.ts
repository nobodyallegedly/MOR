// Agreements acts as the test collective makes them (Agreements draft 8): terms, whether a
// founding agreement or a clone of one (with its mark), signature acts,
// resignations and records. The payloads are built here and checked by the
// core library (`checkTerms`, `agreementsClonePlan`) before anything is signed;
// the core library alone judges them afterwards.

import {
  MIRS,
  SPECS,
  Verifier,
  cborDecode,
  cborEncode,
  checkTerms,
  contestPayload,
  declarationPayload,
  describeAct,
  hex,
  agreementsClonePlan,
  publicationPayload,
  recordPayload,
  resignationPayload,
  signaturePayload,
  sha256,
  unhex,
} from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { referenceTo, type Reference } from '../../genesis/src/lookup.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from './specs.ts';

/** `rule`: every party, any k of them, or named ones. */
export type Rule = { all: true } | { threshold: number } | { named: string[] };

const ruleValue = (r: Rule): unknown[] =>
  'all' in r ? [0] : 'threshold' in r ? [1, r.threshold] : [2, r.named.map(unhex)];

/** A power a clone's mark claims (Agreements rule 65): the constitutional tier, the clone rule, the judicial tier, an area (field 34), or a layer's rule (field 19, `[6, layer]`). */
export type Power = { constitutional: true } | { clone: true } | { area: number } | { judicial: true } | { layer: number };

/** The powers a mark lists, ascending by their encoding (Agreements, "mark"): [0] < [1] < [4] < [2, area] < [6, layer]. */
export const markOrder = (p: Power): number =>
  'constitutional' in p ? 0 : 'clone' in p ? 1 : 'judicial' in p ? 2 : 'area' in p ? 1000 + p.area : 1_000_000 + p.layer;

const powerValue = (p: Power): unknown[] =>
  'constitutional' in p ? [0] : 'clone' in p ? [1] : 'judicial' in p ? [4] : 'area' in p ? [2, p.area] : [6, p.layer];

/** The five layers a collective acts in, each named at its founding (Agreements rule 60; MICS, "Structure"): 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development. */
export const LAYERS = { text: 1, envelopes: 2, money: 3, agreements: 4, development: 5 } as const;
export type LayerNumber = 1 | 2 | 3 | 4 | 5;
export const LAYER_NUMBERS: LayerNumber[] = [1, 2, 3, 4, 5];
export const LAYER_NAMES: Record<LayerNumber, string> = { 1: 'Text', 2: 'Envelopes', 3: 'Money', 4: 'Agreements', 5: 'Development' };

/** One entry of a mark: the power, and the parties whose signatures meet it. */
export interface MarkEntry {
  power: Power;
  signers: string[];
}

/** The release area's id: permanent, never reused (Agreements draft 7, Q32). */
export const RELEASE_AREA = 1;

/** The spec hashes the core library's Agreements calls take: the six MIRs, and the
 * layers each extension the collective names declares (the release manifest
 * cMIP declares none beyond Development). */
export const AGREEMENTS_SPECS = { ...MIRS, agreements: REPO_SPECS.agreements, extLayers: { [REPO_SPECS.manifest]: [] as number[] } };

/** What a finer area reaches (Agreements rule 60, area key 3): every act of
 * one type in one specification, `[1, spec, type]`. A whole layer is no area:
 * it is the layer's rule (terms field 19). */
export type AreaKind = { spec: string; type: number };

/**
 * A finer area (terms field 34, Agreements rules 60 and 62): some act types
 * of one layer held by some members, each acting with their own key. `cap`:
 * limits a cMIP judges on its holders' acts (area key 6): within the cap,
 * `threshold` holders; above it, one more.
 */
export interface AreaSpec {
  id: number;
  name: string;
  holders: string[];
  threshold: number;
  kinds: AreaKind[];
  cap?: { cmip: string; unit: string; value: number };
  /** The area's own words (field 20), changed by its holders. */
  words?: string;
}

export const kindValue = (k: AreaKind): unknown[] => {
  if ('layer' in k) throw new Error('a finer area reaches act types; a whole layer is the layer\'s rule (terms field 19, Agreements rule 60)');
  return [1, unhex(k.spec), k.type];
};

/** A founding agreement for a collective, or a clone of one (Agreements draft 7). */
export interface CollectiveTerms {
  /** The members, in order: the parties. */
  parties: string[];
  /** The constitution's words, as canonical text. What every member reads before signing. */
  text: string;
  /** The clone rule: the judicial tier, and operational matters outside every area. */
  clone: Rule;
  /** The constitutional change rule (field 18); absent: every party. */
  constitutional?: Rule;
  /** Who acts for the collective in each layer (field 19, Agreements rule 60): a rule for each of Text, Envelopes, Money, Agreements and Development. A layer left out takes the clone rule. A collective has no signing key (rule 56): each member acts with their own. */
  layers?: Partial<Record<LayerNumber, Rule>>;
  /** The chain key as shares: any `threshold` of these members rebuild it. */
  chainKey: { threshold: number; members: string[] };
  /** The release rule, as a finer area of Envelopes (field 34): bakes of the
   * collective (Envelopes type 0) count only with this many of its holders. */
  releases: { holders: string[]; threshold: number; words?: string };
  /** Who decides absence: a threshold of the other parties; the outcomes
   * include 0, a voice removed, so every member is covered (F105). */
  abandonment: { others: number; outcomes: number[] };
  /** Extensions: cMIPs outside the listed tasks (the release manifest cMIP). */
  extensions: string[];
  /** For a clone: the agreement it replaces, and its mark. */
  parent?: string;
  mark?: MarkEntry[];
  /** The one stake (field 7), on the collective itself (target `[1, null]`,
   * field 33): its holders' shares in millionths. Absent: even shares among
   * the parties. A work is owned by its own ownership agreement, on its claim. */
  stakes?: Stake[];
  /** The departed members entry (field 22): who left (F124 N5); their stake is in field 7. */
  departed?: string[];
  /** Forked from (field 23): founding terms of a side of a fork, naming the original collective, a back-link (F124 N4). */
  forkedFrom?: string;
  /** The finer areas, as the founding grid draws them (field 34, rules 60 and 62): where present, even empty, they replace the one Releases area. */
  areas?: AreaSpec[];
  /** Named keepers (field 3; round 3, part C): their operators, and what counts as recorded (any one, a number, or all). */
  keepers?: { ids: string[]; rule: Rule };
}

/**
 * A split plan, as a publication carries it (Agreements, "Publication
 * (type 6)", field 4): roles by name and part, each off the top (a
 * referral); the rest to the owners' line, the stake of the ownership
 * agreement the publication names; the split cMIP that computes the
 * amounts. Named receivers are the publication's partners (field 2).
 */
export interface SplitPlan {
  roles: [string, number][];
  cmip: string;
}

/** The split cMIP's spec hash, draft 4's test value (`cmips/split`, `mor_split::spec()`): the one this client's plans name, the cMIP the Rust computes. */
export const SPLIT_CMIP = sha256('split cMIP, draft 4, test value until publication');

/** The plan as `publicationPayload` takes it. */
export const planIn = (p: SplitPlan) => ({ shares: p.roles.map(([role, part]) => ({ role, part })), cmip: p.cmip });

/** A stake (terms field 7): null names this collective (F124, S1). */
export interface Stake {
  object: string | null;
  holders: [string | null, number][];
}

const who = (h: string | null) => (h === null ? null : unhex(h));

/** The outcomes an abandonment clause may allow (Agreements rule 53), in plain words. */
const ABSENCE_OUTCOMES = [
  'the member loses their voice (they no longer count in any rule or area)',
  'their stake is shared among the remaining holders',
  'their stake is transferred to parties named or defined by role',
  'their obligations are redirected or held',
  'the agreement is closed',
];

/**
 * The abandonment clause in plain words, shown before a member signs terms
 * carrying it (Agreements rule 49, client conformance; F172, F178 item 11): who
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
    'Signing accepts that (Agreements rules 49 and 51, a stated cost); a member declared absent wrongly can only contest it, in public (Agreements rule 52).'
  );
}

function areaValue(a: AreaSpec): Map<number, unknown> {
  const m = new Map<number, unknown>([
    [0, a.name],
    [1, a.holders.map(unhex)],
    [2, a.threshold],
    [3, a.kinds.map(kindValue)],
    [5, a.id],
  ]);
  if (a.cap) m.set(6, [unhex(a.cap.cmip), new Map<number, unknown>([[0, [unhex(a.cap.unit), a.cap.value]]])]);
  return m;
}

/** The terms payload, as CBOR, checked by the core library. */
export function termsPayload(t: CollectiveTerms): Uint8Array {
  const payload = encodeTerms(t);
  checkTerms(payload, AGREEMENTS_SPECS);
  return payload;
}

/** The terms payload, as CBOR, not yet checked: for showing why Agreements would refuse it. */
export function encodeTerms(t: CollectiveTerms): Uint8Array {
  // Rule 59: the chain key's alone; keys 0 and 2 (a signing key) are retired.
  const grammar = new Map<number, unknown>([[1, [1, t.chainKey.threshold, t.chainKey.members.map(unhex)]]]);
  const area = new Map<number, unknown>([
    [0, 'Releases'],
    [1, t.releases.holders.map(unhex)],
    [2, t.releases.threshold],
    [3, [[1, unhex(MIRS.envelopes), 0]]],
    [5, RELEASE_AREA],
  ]);
  // A mark's signers are ascending by hash (Agreements draft 8, B8): lowercase
  // hex sorts as the bytes do.
  const field4 = t.parent
    ? [...(t.mark ?? [])].sort((a, b) => markOrder(a.power) - markOrder(b.power)).map((e) => [powerValue(e.power), [...e.signers].sort().map(unhex)])
    : [0];
  // Rule 60: who acts for the collective in each of the five layers, every one named.
  const layers = new Map<number, unknown>(LAYER_NUMBERS.map((l) => [l, ruleValue(t.layers?.[l] ?? t.clone)]));
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
    [19, layers],
    [33, [1, null]],
  ]);
  // Field 34, the finer areas: those given (none where an empty list is given), else the one Releases area.
  const areas = t.areas ? [...t.areas].sort((a, b) => a.id - b.id).map(areaValue) : [area];
  if (areas.length) m.set(34, areas);
  if (t.constitutional) m.set(18, ruleValue(t.constitutional));
  if (t.areas) {
    const words = [...t.areas].sort((a, b) => a.id - b.id).filter((a) => a.words);
    if (words.length) m.set(20, new Map(words.map((a) => [a.id, a.words!])));
  } else if (t.releases.words) m.set(20, new Map([[RELEASE_AREA, t.releases.words]]));
  if (t.parent) m.set(11, unhex(t.parent));
  // Field 7: the one stake, on the collective itself (field 33, [1, null]).
  m.set(7, collectiveShares(t).map(([h, n]) => [unhex(h), n]));
  if (t.keepers?.ids.length) m.set(3, [[...t.keepers.ids].sort().map(unhex), ruleValue(t.keepers.rule)]);
  if (t.departed?.length) m.set(22, t.departed.map(unhex));
  if (t.forkedFrom) m.set(23, unhex(t.forkedFrom));
  return cborEncode(m);
}

/** Even shares in millionths among `holders`, the first taking what rounding leaves (the Shares band's default until touched). */
export function evenShares(holders: string[]): [string, number][] {
  if (!holders.length) return [];
  const each = Math.floor(1_000_000 / holders.length);
  return holders.map((h, i) => [h, i === 0 ? 1_000_000 - each * (holders.length - 1) : each]);
}

/** The holders of the collective's one stake in itself (field 7): those written, else even shares among the parties and departed holders kept. */
export function collectiveShares(t: Pick<CollectiveTerms, 'stakes' | 'parties'>): [string, number][] {
  if (t.stakes?.some((x) => x.object !== null)) {
    throw new Error('a collective\'s ownership agreement carries one stake, on itself (Agreements rule 56, field 33): a work is owned by its own ownership agreement, on its claim');
  }
  const own = t.stakes?.find((x) => x.object === null);
  if (!own) return evenShares(t.parties);
  if (own.holders.some(([h]) => h === null)) throw new Error('a collective holds no stake in itself');
  return own.holders.filter(([, n]) => n > 0).map(([h, n]) => [h as string, n]);
}

/**
 * A lone seller's publication (Agreements type 6, no field 1: its drafter
 * takes the owners' line; round 3's judged referral): what it sells, its
 * split service, its plan (a referral off the top), signed by the seller
 * alone. Its price is a price tag (Money type 5) naming it. Checked by the
 * core library as it is encoded.
 */
export function lonePublicationPayload(d: { sold: { bake: string }[]; service: string; plan: SplitPlan; words?: string; partners?: { identity: string; share: number; label?: string }[] }): Uint8Array {
  const made = publicationPayload({ sold: d.sold, service: d.service, plan: planIn(d.plan), partners: d.partners ?? [], ...(d.words ? { words: d.words } : {}) }) as { payload: Uint8Array };
  return made.payload;
}

/** A kept tip: an act, its position, the running summary including it. */
export interface Tip {
  act: string;
  position: number;
  summary: string;
}

/** The fork of a collective (Agreements type 19, rule 47a, F121 shape B, F124). */
export interface ForkAct {
  agreement: string;
  collective: string;
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
    // Keys 2 and 3 are retired: an ending's line is what it cites on the collective's chain (rule 91).
    [4, f.sides.map((s) => [unhex(s.successor), s.members.map(unhex)])],
  ]);
  if (f.shares?.length) m.set(5, f.shares.map(([a, i, s]) => [unhex(a), i, s]));
  if (f.debts?.length) m.set(6, f.debts.map(([o, i]) => [unhex(o), [...i].sort((x, y) => x - y)]));
  return cborEncode(m);
}

/** Money owed back a closing leaves open (Agreements type 20, field 4; QG1, F197): the payment, by one receipt or claim of it; the notice sent to its payer (type 24), or null where it is owed to nobody; and a holder that outlives the closing, where the collective chose one. */
export interface LeftOpen {
  payment: string;
  notice: string | null;
  holder?: string;
}

/** The closing of a collective that holds nothing (Agreements type 20, F124 N9): its line, as a fork's; and the money owed back it leaves open, ascending by payment (field 4; QG1, F197). */
export function closingPayload(c: { agreement: string; collective: string; open?: LeftOpen[] }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(c.agreement)],
    [1, unhex(c.collective)],
  ]);
  if (c.open?.length) {
    const open = [...c.open].sort((a, b) => (a.payment < b.payment ? -1 : a.payment > b.payment ? 1 : 0));
    m.set(4, open.map((o) => [unhex(o.payment), o.notice ? unhex(o.notice) : null, ...(o.holder ? [unhex(o.holder)] : [])]));
  }
  return cborEncode(m);
}

/** A creditor's release (Money type 4, F126; Agreements type 21 under F125): the creditor ends an obligation owed to it without full payment; `against`, for the record only, what it took instead (receipts, an Agreements agreement it was traded for). A collective signs it by its Money lane. */
export function debtReleasePayload(r: { obligation: string; against?: string[] }): Uint8Array {
  const m = new Map<number, unknown>([[0, unhex(r.obligation)]]);
  if (r.against?.length) m.set(1, r.against.map(unhex));
  return cborEncode(m);
}

/** A release to the public domain (Agreements type 5, rule 17, F121 shape D). */
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

/** One payout of a split (Agreements type 8, F121 Q9). */
export interface PayoutIn {
  receiver: string;
  amount: number;
  /** On the owners' line: the ownership agreement whose stake it pays, by its founding version (key 2). */
  owners?: string;
  /** A partner of the publication it pays, by its index there (key 8). */
  partner?: number;
  /** A fee: the module whose fee it pays. */
  feeModule?: string;
  /** A role it fills (round 3: a referral), and the evidence for it: an act signed by someone other than the service and the payee (rule 22). */
  role?: string;
  evidence?: string;
}

/**
 * A split (Agreements type 8). `tally`: for each stake it pays, the running count
 * of leftover units each holder has received from the service's splits for
 * that stake, this one included, as `[stake, [[holder, count]]]` (Agreements rule
 * 15a, F165, F171, F178 item 15): field 4, a PROPOSED format, to confirm
 * with Nobody, allegedly (the spec gives the field, not its key). The split
 * act cites, in `refs`, the service's previous split for each stake.
 */
export function splitPayload(s: { receipt: string; payouts: PayoutIn[]; cmip: string; publication: string; tally?: [number, [string, number][]][]; number?: number }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(s.receipt)],
    [
      1,
      s.payouts.map((p) => {
        const x = new Map<number, unknown>([
          [0, unhex(p.receiver)],
          [1, p.amount],
        ]);
        if (p.owners) x.set(2, unhex(p.owners));
        if (p.role) x.set(3, p.role);
        if (p.role && p.evidence) x.set(4, unhex(p.evidence));
        if (p.feeModule) x.set(5, unhex(p.feeModule));
        if (p.partner !== undefined) x.set(8, p.partner);
        return x;
      }),
    ],
    [2, unhex(s.cmip)],
    [3, unhex(s.publication)],
  ]);
  if (s.tally?.length) m.set(4, s.tally.map(([stake, hs]) => [stake, hs.map(([h, n]) => [unhex(h), n])]));
  // DQ6 (F188): one numbering across every split the service makes under a deal, from 1.
  if (s.number !== undefined) m.set(5, s.number);
  return cborEncode(m);
}

/**
 * A collective's grant (Agreements type 9, scope 2, act for it): its grantee
 * acts with its own key, naming the collective and the grant (rule 73); a
 * collective's grant carries no key (field 9 refused, key 8 retired). It
 * reaches the act kinds given, within the layer or area whose power issues
 * it (field 5 the area, field 6 the kinds).
 */
export function grantPayload(grantee: string, reach?: { area?: number; kinds: AreaKind[] }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(grantee)],
    [1, 2],
  ]);
  if (reach?.area !== undefined) m.set(5, reach.area);
  if (reach) m.set(6, reach.kinds.map((k) => ('layer' in k ? [0, (k as { layer: number }).layer] : kindValue(k))));
  return cborEncode(m);
}

/** An obligation (Money type 1), signed by the debtor. */
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

/** A payee pointer (Money type 0): rails, each [rail Module, address bytes]. */
export function pointerPayload(p: { payee: string; version: number; previous?: string; rails: [string, Uint8Array][] }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(p.payee)],
    [1, p.version],
    [3, p.rails.map(([mod, a]) => [unhex(mod), a])],
  ]);
  if (p.previous) m.set(2, unhex(p.previous));
  return cborEncode(m);
}

/** A settlement receipt (Money type 2), signed by the payee of the hop; `purchase`, for a purchase, the claim it pays under: [agreement, line] (field 9, F126). */
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

/** What a clone changes, and the powers its mark must name (Agreements rule 44c). */
export function clonePlan(parent: CollectiveTerms, clone: CollectiveTerms): {
  changes: { form: string; tier: string; field?: number; task?: number; area?: number }[];
  needs: { form: string; area?: number }[];
} {
  return agreementsClonePlan(encodeTerms(parent), encodeTerms({ ...clone, mark: [{ power: { clone: true }, signers: [clone.parties[0]] }] }), AGREEMENTS_SPECS);
}

/** Whether the powers a mark names are exactly those a plan needs. */
export function markMatches(mark: MarkEntry[], needs: { form: string; area?: number }[]): boolean {
  const key = (p: Power) =>
    'constitutional' in p ? 'constitutional' : 'clone' in p ? 'clone' : 'judicial' in p ? 'judicial' : 'area' in p ? `area ${p.area}` : `layer ${p.layer}`;
  const want = needs.map((n) => (n.form === 'area' ? `area ${n.area}` : n.form === 'layer' ? `layer ${n.area}` : n.form));
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
 * the proposer (Agreements rule 4a): a clone names its parent in `objects`.
 */
export async function proposePayload(by: TestIdentity, payload: Uint8Array, parent: string | undefined, relays: string[]) {
  checkTerms(payload, AGREEMENTS_SPECS);
  const objects: [string, string][] | undefined = parent ? [[parent, parent]] : undefined;
  // F189 (6): a version settling a deal's fork also cites each tip it
  // settles (field 26, a list since QF3), after its parent, in that order,
  // so that verifiers fetching by citation find them.
  const settles = (cborDecode(payload) as Map<number, unknown>).get(26);
  if (objects && Array.isArray(settles)) for (const x of settles) if (x instanceof Uint8Array) objects.push([hex(x), hex(x)]);
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.terms, payload, { public: true, relays, objects });
}

/**
 * The latest of `by`'s own payee pointers (Money type 0) found on
 * `relays`, where its pointers are published, whichever of its devices
 * published it (Money rule 14, F163): each pointer valid on `by`'s chain,
 * naming `by` as its payee; the latest of the unbroken chain, or at a fork
 * the last before it (rule 12). Null where none is found.
 */
export async function latestPointer(by: TestIdentity, relays: string[]): Promise<string | null> {
  return (await latestPointerAct(by, relays))?.id ?? null;
}

/** The latest payee pointer, as `latestPointer` finds it, with the act itself: held, to refer to (F272). */
export async function latestPointerAct(by: TestIdentity, relays: string[]): Promise<{ id: string; act: Uint8Array } | null> {
  const acts = new Map<string, Uint8Array>();
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
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
            if (d.spec !== MIRS.money || d.type !== MONEY_POINTER || !d.payload) continue;
            const m = cborDecode(d.payload) as Map<number, unknown>;
            const payee = m.get(0);
            if (!(payee instanceof Uint8Array) || hex(payee) !== by.id) continue;
            const id = v.add(it.item);
            if (v.status(id) !== 'valid') continue;
            const prev = m.get(2);
            found.set(id, { version: Number(m.get(1)), previous: prev instanceof Uint8Array ? hex(prev) : null });
            acts.set(id, it.item);
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
    if (next.length !== 1) return { id: at, act: acts.get(at)! };
    [at, p] = next[0];
  }
}

/** Money's payee pointer type (Money draft 6, type 0). */
const MONEY_POINTER = 0;

/**
 * Sign an act: an Agreements signature act that follows the act it signs. Where it
 * signs terms or an offer, which can pay its signer, it cites in `refs` the
 * latest of the signer's payee pointers found on `relays` (Money rule 14,
 * F163, client conformance): an identity keeps one sequence per device, so
 * a deal signed on one device finds a wallet published from another. The
 * pointer is a public act the client holds, so the reference names its
 * signer (Envelopes draft 9, rule 20, F272).
 */
/**
 * A signature act, with the member's own key. A collective has no member
 * keys (Agreements rule 58): signature field 1 is refused. `cites`: on a
 * collective's clone, the collective's chain as its acts cite it.
 */
export async function sign(by: TestIdentity, act: string, relays: string[], cites: [string, string][] = []) {
  await carryChain(by, relays);
  let refs: Reference[] | undefined;
  if (await canPaySigner(act, relays, by.via)) {
    const p = await latestPointerAct(by, relays);
    if (p) refs = [referenceTo(p.act)];
  }
  const payload = signaturePayload(act);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, payload, {
    public: true,
    relays,
    // On a collective's clone: the collective's chain too, so that a rotation
    // declaring it reads its history through these acts (rule 58).
    objects: [[act, act], ...cites],
    refs,
  });
}

/** Whether the act signed is terms or a publication (Agreements types 0 and 6), as a relay holding it shows. */
async function canPaySigner(act: string, relays: string[], via: Via): Promise<boolean> {
  for (const h of relays) {
    try {
      const a = await relayAt(h, via).getAct(act);
      if (!a) continue;
      const d = describeAct(a) as { spec?: string; type?: number };
      return d.spec === REPO_SPECS.agreements && (d.type === AGREEMENTS_TYPES.terms || d.type === AGREEMENTS_TYPES.publication);
    } catch {
      // that relay is away
    }
  }
  return false;
}

/**
 * Leave the collective alone (Agreements rule 37a): a resignation act naming the
 * agreement, signed by the member with their own key, no one else's. It
 * takes effect for the collective at the line its record draws. `drafts`:
 * the versions the member signed and leaves behind (F207), none of which
 * ever brings them back.
 */
export async function resign(by: TestIdentity, agreement: string, relays: string[], area?: number, drafts?: string[]) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.resignation, resignationPayload(agreement, area, drafts?.length ? drafts : undefined), {
    public: true,
    relays,
    objects: [[agreement, agreement]],
  });
}

/**
 * An abandonment declaration (Agreements type 13, B12): the agreement, the version
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
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.declaration, declarationPayload(d.agreement, d.clause, d.party, Uint32Array.from(d.outcomes)), {
    public: true,
    relays,
    to: [d.party],
    objects: [[d.agreement, d.agreement]],
  });
}

/**
 * A contest of a declaration of absence (Agreements type 14, rule 52; BQ4,
 * decided by Nobody, allegedly, 9 October 2026), signed by the party the
 * declaration names: it shows presence and the dispute, and voids nothing.
 * Public, and delivered to the declaration's signer.
 */
export async function contest(by: TestIdentity, declaration: { act: string; signer: string }, relays: string[]) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.contest, contestPayload(declaration.act), {
    public: true,
    relays,
    to: [declaration.signer],
    objects: [[declaration.act, declaration.act]],
  });
}

/**
 * The agreements of `chain` (oldest first) that `member` signed, by an Agreements
 * signature act its relays hold: the newest of them is the clause version
 * a declaration against that member applies (Agreements rule 51, B12). The core
 * library checks it again when it judges the declaration.
 */
export async function signedVersions(member: string, chain: string[], relays: string[], via: Via = {}): Promise<string[]> {
  const signed = await signedBy(member, relays, via);
  return chain.filter((a) => signed.has(a));
}

/**
 * Every act `member` signed by an Agreements signature act its relays hold (terms
 * or offers), by hash: for the versions a resignation leaves behind (F207)
 * and the clause version a declaration applies (rule 51).
 */
export async function signedBy(member: string, relays: string[], via: Via = {}): Promise<Set<string>> {
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
            if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.signature || !d.payload) continue;
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
  return signed;
}

/**
 * The collective's record (Agreements type 17), its everyday line: it writes a
 * complete clone with the signature acts that complete it (A2), and
 * registers departures (A1). A collective has no signing key (rule 56):
 * any member draws it with their own key (the collective file's `actor`),
 * naming the collective and its latest decision in `objects` (rule 58). `acks`:
 * acts it acknowledges (Envelopes), which places members' signature acts at
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
    registers: r.registers?.length ? r.registers : null,
  });
  const named = r.clone ?? r.inForce;
  return collective.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.record, payload, {
    public: true,
    relays,
    objects: [[named, named]],
    acks: r.acks?.length ? r.acks : undefined,
  });
}
