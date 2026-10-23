// Vows (round 3, part B; Agreements rule 13, F237, F240, F253; decided by
// Nobody, allegedly, 17 October 2026: a vow "published with an offer, bought
// through Damgar, each sale confirmed or contested by the buyer, in Edubba or
// in Dub's Signing tab"; and "a plain look-up of one identity's vow sales,
// confirmed and contested, asked of the relays one chooses with the filters
// they already have": "Yes, that is enough, no need to become an
// aggregator").
//
// In plain words: a vow is an act saying, in words, what is promised (a
// seat, a lesson, a chair to be made); its first act's id is its name, for
// good. An offer names it and its price. Each purchase of it is a sale,
// pending until its buyer confirms or contests it; the core reads the state,
// never the promise.
//
// Precisely:
// - **The vow**: Envelopes type 5, `{ 0: words }`; its offer, Agreements type
//   6, selling `[3, vow]`, its words required (F237).
// - **A sale** is the buyer's own payer's claim of a payment following the
//   offer (F193's shape). For the look-up to see it, Dub signs that claim in
//   public when it buys a vow (a reading, the build's: the claim at payment
//   is otherwise sealed to the payee).
// - **Confirmed**: a second public claim of the same payment by the buyer,
//   acknowledging the vow (rule 13: "in a payer's claim of that payment ...
//   its acks naming an act about the vow"). It is a Money act: Dub signs it
//   under its lane from Damgar.
// - **Contested**: an Agreements contest (type 14) by the buyer, naming the
//   sale (field 0), the vow as its chain (`[[vow, vow]]`), and, optionally,
//   the promise not kept, in words (field 1, reading Q3). It voids nothing.
// - **The look-up**: one identity's public acts at the relays chosen (its
//   vows and offers, by signer), the public claims and contests those relays
//   hold (by spec and type, the feed's own filters), each claim's rail
//   checked by its rail Module and stated to the core; then the core reads
//   each vow (`agreementsVow`). No index: what the relays chosen do not
//   hold, it does not see.
//
// TEST IDENTITIES ONLY.

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, moneyRead, openWithKey, purchaseContestPayload, readPaymentProof, vowContestPayload, withGrantLimits } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { OFFER, offerPayload, type Amount } from '../../barebone/src/sealed.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { ACCEPTABLE } from '../../damgar/src/specs.ts';
import { judge as judgeLimits } from '../../grants/src/limits.ts';
import { allBy, readGrant } from '../../grants/src/grant.ts';

/** The vow (Envelopes type 5), and the contest (Agreements type 14). */
export const VOW = 5;
export const CONTEST = 14;
/** Money's claim (type 3). */
const CLAIM = 3;

/** A vow's payload: its words, canonical text (Envelopes, "Vow"). */
export function vowPayload(words: string): Uint8Array {
  return cborEncode(new Map<number, unknown>([[0, words]]));
}

/** A vow read from its act: null where it is none. */
export function readVow(act: Uint8Array): { name: string; signer: string; words: string; genesis: boolean } | null {
  const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; objects?: [string, string][] };
  if (d.spec !== SPECS.envelopes || d.type !== VOW || !d.payload || !d.signer) return null;
  try {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const words = m.get(0);
    if (typeof words !== 'string') return null;
    const own = (d.objects ?? []).filter(([c]) => c !== d.signer);
    return { name: own.length ? own[0][0] : d.id, signer: d.signer, words, genesis: !own.length };
  } catch {
    return null;
  }
}

/** An offer selling a vow, read: its id, price and words; null where `act` is no offer of `seller` naming `vow`. */
export function readVowOffer(act: Uint8Array, seller: string, vow: string): { offer: string; price: Amount; words: string | null; under?: string; payee?: string } | null {
  const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
  if (d.spec !== MIRS.agreements || d.type !== OFFER || d.signer !== seller || !d.payload) return null;
  try {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const sells = (m.get(1) as unknown[][]).some((x) => x[0] === 3 && x[1] instanceof Uint8Array && hex(x[1] as Uint8Array) === vow);
    if (!sells) return null;
    const price = m.get(2) as [Uint8Array, number];
    const under = m.get(0);
    const payee = m.get(3);
    return { offer: d.id, price: { unit: hex(price[0]), value: Number(price[1]) }, words: typeof m.get(4) === 'string' ? (m.get(4) as string) : null, ...(under instanceof Uint8Array ? { under: hex(under) } : {}), ...(payee instanceof Uint8Array ? { payee: hex(payee) } : {}) };
  } catch {
    return null;
  }
}

/** The offer's words for a vow: what it promises and its price (required where it names a vow, F237). */
export function vowOfferWords(words: string, price: string): string {
  return `A vow: ${words} For ${price}. Each sale is confirmed or contested by its buyer.`;
}

/**
 * A vow published by oneself: the vow, the lone seller's offer naming it,
 * and a post naming both, so it shows in a feed. Save the identity after.
 */
export async function publishVow(by: TestIdentity, a: { words: string; title: string; price: Amount; offerWords: string; relays: string[] }): Promise<{ vow: string; offer: string; post: string }> {
  const vow = await by.publish(SPECS.envelopes, VOW, vowPayload(a.words), { public: true, relays: a.relays });
  const offer = await by.publish(MIRS.agreements, OFFER, offerPayload({ sells: { vow: vow.id }, price: a.price, words: a.offerWords }), { public: true, relays: a.relays });
  const post = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.title), { public: true, relays: a.relays, refs: [referenceTo(vow.act), referenceTo(offer.act)] });
  return { vow: vow.id, offer: offer.id, post: post.id };
}

/** A contest of a vow's sale (Agreements type 14, F253): public, its chain the vow's name. Save the identity after. */
export async function contestSale(by: TestIdentity, a: { vow: string; sale: string; promise?: string | null; relays: string[] }): Promise<string> {
  const made = await by.publish(MIRS.agreements, CONTEST, vowContestPayload(a.vow, a.sale, a.promise?.trim() || undefined) as Uint8Array, { public: true, relays: a.relays, objects: [[a.vow, a.vow]] });
  return made.id;
}

/** One sale of a vow, as the core reads it. */
export interface SaleShown {
  act: string;
  offer: string;
  buyer: string;
  /** S7e (Q53): unknown where the answer rests on a receipt or claim whose rail answer is not given, never pending. */
  state: 'pending' | 'confirmed' | 'contested' | 'unknown';
  by: string[];
  /** What a contest says was not kept, where it says (field 1). */
  promise: string | null;
  amount: Amount | null;
  /** The buyer's contests of it in the purchase's form (F386): shown beside the sale; they mark no sale. */
  beside: ContestsBeside;
}

/** A vow, read from what the relays asked hold. */
export interface VowShown {
  name: string;
  signer: string;
  void: boolean;
  words: string[];
  offers: string[];
  sales: SaleShown[];
  /** Payments following its offers whose buyer signed on to nothing public: no state. */
  unsigned: number;
  /** Payments whose buyer the core cannot tell without a rail answer (S7e): shown as unknown, never as unsigned. */
  unknown?: number;
}

/**
 * The look-up (decided by Nobody, allegedly, 17 October 2026): every vow of
 * `identity` the relays asked hold, each with its sales, confirmed,
 * contested or pending, as the core reads them. `relays`: the relays the
 * person chose. What they do not hold is not seen; no index is kept.
 */
export async function vowSales(identity: string, relays: string[], via: Via = {}): Promise<{ vows: VowShown[]; asked: string[]; problems: string[] }> {
  const r = reader(relays, via);
  await r.hold(identity);
  // The public claims and contests the relays hold, by the feed's own filters (spec and type).
  const claims = await r.byKind(MIRS.money, CLAIM);
  const contests = await r.byKind(MIRS.agreements, CONTEST);
  const vows: { name: string; words: string }[] = [];
  for (const a of r.held.values()) {
    const x = readVow(a);
    if (x?.genesis && x.signer === identity) vows.push({ name: x.name, words: x.words });
  }
  // An offer made under a deal between separate people counts only signed by every party (Agreements, Standing offer): each party held too, the deal's payee among them.
  for (const a of [...r.held.values()]) {
    const d = describeAct(a) as { spec?: string; type?: number; signer?: string; payload?: Uint8Array };
    if (d.spec !== MIRS.agreements || d.type !== OFFER || d.signer !== identity || !d.payload) continue;
    const under = (cborDecode(d.payload) as Map<number, unknown>).get(0);
    const t = under instanceof Uint8Array ? r.held.get(hex(under)) : undefined;
    const td = t ? (describeAct(t) as { spec?: string; type?: number; payload?: Uint8Array }) : null;
    if (!td?.payload || td.type !== 0) continue;
    const m = cborDecode(td.payload) as Map<number, unknown>;
    if (m.has(12)) continue;
    for (const p of ((m.get(0) as Uint8Array[] | undefined) ?? []).map((x) => hex(x))) await r.hold(p);
  }
  // Each claim's and contest's signer, held with its acts (its chain, its lanes).
  for (const a of [...claims, ...contests]) {
    const d = describeAct(a) as { signer?: string };
    if (d.signer) await r.hold(d.signer);
    r.add(a);
  }
  const { specs, amounts } = judged(r, claims.map((act) => ({ act })));
  const out: VowShown[] = [];
  for (const x of vows) {
    try {
      const e = r.v.agreementsVow(specs, x.name) as { name: string; signer: string; void: boolean; words: string[]; offers: string[]; sales: { act: string; offer: string; buyer: string; state: SaleShown['state']; by: string[] }[]; unsigned: string[]; unknown?: string[] };
      out.push({
        name: e.name,
        signer: e.signer,
        void: e.void,
        words: e.words,
        offers: e.offers,
        sales: e.sales.map((s) => ({
          ...s,
          promise: s.state === 'contested' ? promiseOf(contests, s.by) : null,
          amount: amounts.get(s.act) ?? null,
          // A vow's sale is a purchase (F386): a contest of it in the purchase's form marks no sale, and is shown beside it, so it is not lost.
          beside: contestsOf(r, specs, s.act, contests),
        })),
        unsigned: e.unsigned.length,
        unknown: e.unknown?.length ?? 0,
      });
    } catch (err) {
      r.problems.push(`The vow ${x.name.slice(0, 8)}… could not be read: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { vows: out, asked: relays, problems: r.problems };
}

/**
 * A contest of a purchase (Agreements type 14, rule 54, F386): signed by its
 * buyer, public, naming the purchase (the buyer's own payer's claim of the
 * payment) as its object, `[[purchase, purchase]]`, and, optionally, the
 * promise not kept, in words. It undoes nothing: no payment, refund,
 * delivery or verdict moves. Save the identity after.
 */
export async function contestPurchase(by: TestIdentity, a: { purchase: string; promise?: string | null; relays: string[] }): Promise<string> {
  const made = await by.publish(MIRS.agreements, CONTEST, purchaseContestPayload(a.purchase, a.promise?.trim() || undefined) as Uint8Array, { public: true, relays: a.relays, objects: [[a.purchase, a.purchase]] });
  return made.id;
}

/** The contests shown beside one purchase: its buyer's own, as the core reads them; `unknown` where the core cannot say (a payment not stated), never "none". */
export interface ContestsBeside {
  state: 'shown' | 'unknown';
  contests: { act: string; promise: string | null }[];
  /** Why it is unknown, in words. */
  why?: string;
  /** Where the core reads the payment as no purchase (a buyer's contest is then shown beside nothing): its words (this round). */
  noPurchase?: string | null;
}

/**
 * The buyer's contests shown beside each purchase (F386,
 * `agreementsPurchaseContests`). A purchase is the buyer's own payer's claim
 * of the payment, with its content key where it is private (sealed to the
 * seller): the buyer's Damgar keeps it, the seller's homes hold it. The
 * parties' chains and public acts are read from their homes (the offer, the
 * lanes), the public contests from the relays asked, each claim's rail
 * checked by its rail Module and stated to the core. A contest signed by
 * anyone but the buyer shows nothing.
 */
export async function purchaseContests(a: { purchases: { act: Uint8Array; key?: Uint8Array | null }[]; parties: string[]; relays: string[]; via?: Via }): Promise<{ by: Record<string, ContestsBeside>; problems: string[] }> {
  const r = reader(a.relays, a.via ?? {});
  for (const id of a.parties) await r.hold(id);
  const ids: string[] = [];
  for (const p of a.purchases) ids.push(r.add(p.act, p.key ?? undefined));
  const contests = (await r.byKind(MIRS.agreements, CONTEST)).filter((x) => {
    const d = describeAct(x) as { objects?: [string, string][] };
    return (d.objects ?? []).some(([c]) => ids.includes(c));
  });
  for (const x of contests) {
    const d = describeAct(x) as { signer?: string };
    if (d.signer) await r.hold(d.signer);
    r.add(x);
  }
  // The contests the parties' homes hold are read too (the buyer's own acts).
  const held = [...r.held.values()].filter((x) => {
    const d = describeAct(x) as { spec?: string; type?: number };
    return d.spec === MIRS.agreements && d.type === CONTEST;
  });
  const { specs } = judged(r, a.purchases.map((p) => ({ act: p.act, key: p.key ?? undefined })));
  const by: Record<string, ContestsBeside> = {};
  for (const id of ids) if (id) by[id] = contestsOf(r, specs, id, [...contests, ...held]);
  // Where the core reads a payment as no purchase, said beside it: a contest shows beside a purchase only (F386), never silently "none".
  for (const id of ids) {
    if (!id || by[id]?.state !== 'shown' || by[id].contests.length) continue;
    try {
      const p = r.v.agreementsPurchase(specs, id) as { verdict: string; why?: string | null } | null;
      if (p && p.verdict === 'no-purchase') by[id] = { ...by[id], noPurchase: p.why ?? 'no purchase' };
      // S7e (Q53): whether it is a purchase rests on a rail answer not given here: unknown, never "none".
      else if (p && p.verdict === 'unknown') by[id] = { state: 'unknown', contests: [], why: 'a receipt or claim it rests on has no rail answer here: whether it is a purchase is unknown' };
    } catch {
      // not read: as before
    }
  }
  return { by, problems: r.problems };
}

/** The buyer's contests the core shows beside one purchase, each with its promise not kept, in words, where it says. */
function contestsOf(r: Reader, specs: unknown, purchase: string, contests: Uint8Array[]): ContestsBeside {
  try {
    const shown = r.v.agreementsPurchaseContests(specs, purchase) as string[];
    return { state: 'shown', contests: shown.map((act) => ({ act, promise: promiseOf(contests, [act]) })) };
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return { state: 'unknown', contests: [], why: /payment-unstated/.test(m) ? 'its payment is not stated: whether it is a purchase, and whose, is unknown' : /rail-unanswered/.test(m) ? 'its claim has no rail answer here: whether it is a purchase is unknown' : m };
  }
}

/** What a look-up holds: a verifier, the acts by id, and how to hold an identity's chain and public acts. */
interface Reader {
  v: Verifier;
  held: Map<string, Uint8Array>;
  /** Content keys of the private acts held, by id: a claim sealed to its payee, opened. */
  keys: Map<string, Uint8Array>;
  problems: string[];
  add(a: Uint8Array, key?: Uint8Array): string;
  hold(id: string): Promise<void>;
  byKind(spec: string, type: number): Promise<Uint8Array[]>;
}

function reader(relays: string[], via: Via): Reader {
  const problems: string[] = [];
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const held = new Map<string, Uint8Array>();
  const keys = new Map<string, Uint8Array>();
  const add = (a: Uint8Array, key?: Uint8Array): string => {
    const id = (describeAct(a) as { id: string }).id;
    try {
      if (key) {
        v.addWithKey(a, key);
        keys.set(id, key);
      } else v.add(a);
      held.set(id, a);
    } catch {
      // private, or held already
    }
    return id;
  };
  const chains = new Set<string>();
  const hold = async (id: string) => {
    if (chains.has(id)) return;
    chains.add(id);
    let places = relays;
    try {
      const l = await lookUp(id, relays, via, v);
      places = [...new Set([...relays, ...l.resolution.homes.map((h) => h.hint)])];
    } catch {
      // not found: its acts cannot count
    }
    for (const a of await allBy(id, places, via)) add(a);
  };
  const byKind = async (spec: string, type: number): Promise<Uint8Array[]> => {
    const out: Uint8Array[] = [];
    for (const h of relays) {
      let after: number | undefined;
      try {
        for (;;) {
          const page = await relayAt(h, via).feed({ spec, type, after });
          for (const it of page.items) if (it.kind === 'act') out.push(it.item);
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        problems.push(`${h} did not answer.`);
      }
    }
    return out;
  };
  return { v, held, keys, problems, add, hold, byKind };
}

/** Each claim's rail, checked by its rail Module and stated to the core (the core reads no rail); its amount; its lane's cap. */
function judged(r: Reader, claims: { act: Uint8Array; key?: Uint8Array }[]): { specs: unknown; amounts: Map<string, Amount> } {
  const accepted = ACCEPTABLE.flatMap((x) => x.hashes);
  const railValid: [string, string, number | null][] = [];
  // Which payment each proof is, as its rail Module says (Money rule 12): never read from the proofs' bytes.
  const railPayments: [string, string][] = [];
  const limits: [string, boolean][] = [];
  const amounts = new Map<string, Amount>();
  for (const { act, key } of claims) {
    const d = (key ? openWithKey(act, key) : describeAct(act)) as { id: string; type?: number; payload?: Uint8Array; binding?: string };
    try {
      const j = r.v.moneyJudge(d.id, { money: MIRS.money, accepted }) as { rail: { answer: string }; payment?: string | null };
      if (j.rail.answer !== 'valid') continue;
      // A claim, or (S7e, Q53) a receipt the answer rests on, such as a collective's recording its sale: each stated by its own rail answer.
      const c = (moneyRead(d.type === 2 ? 2 : CLAIM, d.payload!) as { act: { proof: Uint8Array; amount: Amount } }).act;
      amounts.set(d.id, c.amount);
      if (j.payment) railPayments.push([hex(new Uint8Array(c.proof)), j.payment]);
      const p = readPaymentProof(new Uint8Array(c.proof)) as { paidTo: { flow?: { pointer: string }; vault?: { declaredBy: string; entry: number } } & Record<string, unknown> };
      const to = paidToOf(p.paidTo);
      if (to) railValid.push([d.id, to[0], to[1]]);
      // A claim signed under a lane: its cap judged by the grant limits cMIP (the core asks it of the client).
      const w = limitsOf(r.held, d, act, key);
      if (w !== null) limits.push([d.id, w]);
    } catch {
      // not judged: it counts for nothing here
    }
  }
  return { specs: withGrantLimits({ ...AGREEMENTS_SPECS, railValid, railPayments }, limits), amounts };
}

/** Where a proof says it was paid, as the core takes it: `[act, vault entry or null]`. */
function paidToOf(p: unknown): [string, number | null] | null {
  const x = p as { flow?: { pointer: string }; vault?: { declaredBy: string; entry: number }; pointer?: string; declaredBy?: string; entry?: number };
  if (x.flow) return [x.flow.pointer, null];
  if (x.vault) return [x.vault.declaredBy, x.vault.entry];
  if (typeof x.pointer === 'string') return [x.pointer, null];
  if (typeof x.declaredBy === 'string') return [x.declaredBy, x.entry ?? 0];
  return null;
}

/** A claim signed with a grant key whose grant carries limits: within them or not, as the grant limits cMIP reads its cap; null where it names no such grant. */
function limitsOf(held: Map<string, Uint8Array>, d: { id: string }, act: Uint8Array, key?: Uint8Array): boolean | null {
  const b = (describeAct(act) as { binding?: string }).binding;
  if (!b) return null;
  try {
    const g = held.get(b);
    const gd = g ? (describeAct(g) as { spec?: string; type?: number; payload?: Uint8Array }) : null;
    if (!gd || gd.spec !== MIRS.agreements || gd.type !== 9 || !gd.payload) return null;
    const grant = readGrant(gd.payload);
    if (!grant.limits) return null;
    const w = judgeLimits(grant.limits, { id: d.id, ...((key ? openWithKey(act, key) : describeAct(act)) as object) }, MIRS.money);
    return w.within === null ? null : w.within;
  } catch {
    return null;
  }
}

/** What the contests of a sale say was not kept, in words, where they say it. */
function promiseOf(contests: Uint8Array[], by: string[]): string | null {
  for (const a of contests) {
    const d = describeAct(a) as { id: string; payload?: Uint8Array };
    if (!by.includes(d.id) || !d.payload) continue;
    try {
      const p = (cborDecode(d.payload) as Map<number, unknown>).get(1);
      if (typeof p === 'string') return p;
    } catch {
      // not readable
    }
  }
  return null;
}

