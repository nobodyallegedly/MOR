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
// - **The vow**: Envelopes type 5, `{ 0: words }`; its offer, a publication
//   (Agreements type 6, which replaced the standing offer at F407), selling
//   `[3, vow]`, its words required (F237): a lone seller's, or under an
//   ownership agreement where co-owners stand behind it. Its price is a
//   price tag (Money type 5) naming the publication's first version, signed
//   by its split service or the party it designates (field 10).
// - **A sale** is the buyer's own payer's claim of a payment following the
//   price tag: a purchase under the publication (rule 12; F193's shape). For the look-up to see it, Dub signs that claim in
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

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, moneyRead, openWithKey, publicationPayload, purchaseContestPayload, readPaymentProof, vowContestPayload, withGrantLimits } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS, SPLIT_CMIP, planIn } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { readPublication, type Amount, type PublicationRead } from '../../barebone/src/sealed.ts';
import { putTag, readTag, tagsOf, type TagRead } from '../../barebone/src/tag.ts';
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

/**
 * A publication selling a vow, read from one act (Agreements type 6,
 * selling `[3, vow]`; it replaced the standing offer, F407): its id, its
 * words, and where it was made under an ownership agreement (`under`). Null
 * where `act` is no publication drafted by `seller` selling `vow`. A
 * publication carries no price: `price` is null here; the price is its
 * price tag (`vowOffer` finds it). Kept under its name from before.
 */
export function readVowOffer(act: Uint8Array, seller: string, vow: string): { offer: string; first: string; price: Amount | null; words: string | null; under?: string; payee?: string; service: string; designated: string | null } | null {
  const p = readPublication(act);
  if (!p || p.drafter !== seller || !p.vows.includes(vow)) return null;
  return { offer: p.id, first: p.first, price: null, words: p.words, ...(p.owners ? { under: p.owners } : {}), payee: p.service, service: p.service, designated: p.designated };
}

/** A vow's offer as a buyer reads it before paying: the publication (its first version and the version read), and the price tag under it that counts. */
export interface VowOffer {
  /** The publication's first version: what its price tag names. */
  publication: string;
  /** The version read (the latest found on its drafter's line). */
  version: string;
  words: string | null;
  /** The ownership agreement it names, where co-owners stand behind the vow; null for a lone seller's publication. */
  owners: string | null;
  service: string;
  designated: string | null;
  /** The tag's version a purchase follows, its price and payee; null where none counts. */
  tag: TagRead | null;
  price: Amount | null;
  payee: string | null;
  /** How the core reads the tag under it (`agreementsTagUnder`): "counts", "nobody's offer", "unknown", or "withdrawn". */
  standing: string;
  /** Why it cannot be bought, where it cannot. */
  why: string | null;
}

/**
 * The offer of a vow (Agreements rule 13 on the redesigned core): a
 * publication selling `[3, vow]`, drafted by the vow's `seller` (named among
 * `named`, the acts a post names, or found in the seller's feed), at its
 * latest version (one selling nothing ends it), and its price tag: a Money
 * type 5 naming the publication's first version, signed by its split service
 * or the party it designates (field 10), judged by the core. Null where no
 * publication sells it.
 */
export async function vowOffer(vow: string, seller: string, hints: string[], via: Via = {}, named: Uint8Array[] = []): Promise<VowOffer | null> {
  const r = reader(hints, via);
  await r.hold(seller);
  for (const a of named) r.add(a);
  const pubs = [...r.held.values()].map((a) => readPublication(a)).filter((p): p is PublicationRead => !!p && p.drafter === seller && (p.vows.includes(vow) || (p.ends && p.vows.length === 0)));
  const firsts = [...new Set(pubs.filter((p) => p.vows.includes(vow)).map((p) => p.first))];
  if (!firsts.length) return null;
  // The latest version on each line (each later version naming the one before); the first line still selling it.
  let chosen: PublicationRead | null = null;
  for (const f of firsts) {
    let at = pubs.find((p) => p.id === f) ?? pubs.find((p) => p.first === f)!;
    for (let i = 0; i < 1024; i++) {
      const next = pubs.filter((p) => p.previous === at.id);
      if (next.length !== 1) break;
      at = next[0];
    }
    if (!chosen || (chosen.ends && !at.ends)) chosen = at;
  }
  const pub = chosen!;
  const out: VowOffer = { publication: pub.first, version: pub.id, words: pub.words, owners: pub.owners, service: pub.service, designated: pub.designated, tag: null, price: null, payee: null, standing: 'none', why: null };
  if (pub.ends) return { ...out, why: 'the publication selling it has ended: a later version sells nothing' };
  // Its tag: the split service's, or the designated party's (Money rule 18).
  const signers = [...new Set([pub.service, ...(pub.designated ? [pub.designated] : [])])];
  for (const x of signers) await r.hold(x);
  for (const p of pub.partners) await r.hold(p.identity);
  const tags = await Promise.all(signers.map((x) => tagsOf({ publication: pub.first }, x, hints, via)));
  for (const t of tags) for (const a of t.acts) r.add(a);
  const latest = tags.map((t) => t.latest).find((t) => t) ?? named.map(readTag).find((t) => t?.publication === pub.first) ?? null;
  if (!latest) return { ...out, why: 'no price tag of the publication’s split service or designated party was found: it cannot be bought here' };
  out.tag = latest;
  if (!latest.price) return { ...out, standing: 'withdrawn', why: 'its price tag is withdrawn: a later version carries no price' };
  if (pub.owners) {
    // Co-owners behind it: the ownership agreement's parties held, so their signatures count.
    const t = r.held.get(pub.owners);
    const td = t ? (describeAct(t) as { payload?: Uint8Array }) : null;
    const m = td?.payload ? (cborDecode(td.payload) as Map<number, unknown>) : null;
    for (const p of ((m?.get(0) as Uint8Array[] | undefined) ?? []).map((x) => hex(x))) await r.hold(p);
  }
  for (let pass = 0; pass < 3; pass++) for (const a of [...r.held.values()]) r.add(a);
  let verdict = 'unknown';
  try {
    verdict = (r.v.agreementsTagUnder(AGREEMENTS_SPECS, latest.id) as { verdict: string }).verdict;
  } catch {
    // the core cannot say
  }
  out.standing = verdict;
  if (verdict !== 'counts') return { ...out, why: verdict === "nobody's offer" ? 'its price tag is nobody’s offer under the publication (signed by someone other than its split service or designated party)' : 'whether its price tag counts under the publication is unknown here' };
  return { ...out, price: latest.price, payee: latest.payee };
}

/** The words a vow's publication carries: what it promises and its price (required where it sells a vow, F237). */
export function vowOfferWords(words: string, price: string): string {
  return `A vow: ${words} For ${price}. Each sale is confirmed or contested by its buyer.`;
}

/**
 * A vow's publication (Agreements type 6, selling `[3, vow]`, its words
 * required): a lone seller's (no owners; by default the seller is its own
 * split service, so it is signed by drafting it), or, with `owners`, one
 * under an ownership agreement where co-owners stand behind the vow (its act
 * then names `[agreement, agreement]`). `designated` (field 10) may sign its
 * price tags beside the split service: the seller, where the service is
 * another identity. Checked by the core library as it is encoded.
 */
export function vowPublicationPayload(a: { vow: string; words: string; service: string; owners?: string | null; designated?: string | null; partners?: { identity: string; share: number; label?: string }[] }): { type: number; payload: Uint8Array } {
  return publicationPayload({
    sold: [{ vow: a.vow }],
    ...(a.owners ? { owners: a.owners } : {}),
    service: a.service,
    plan: planIn({ roles: [], cmip: SPLIT_CMIP }),
    partners: a.partners ?? [],
    words: a.words.normalize('NFC'),
    ...(a.designated ? { designated: a.designated } : {}),
  }) as { type: number; payload: Uint8Array };
}

/**
 * A vow published by oneself (round 8, F407): the vow (Envelopes type 5),
 * the publication selling it (`offerWords` its words), its price tag (Money
 * type 5, naming the publication's first version, signed by the seller,
 * who is its split service or its designated party), and a post naming all
 * three, so it shows in a feed. By default the seller is its own split
 * service; with `service`, another identity is, and the seller is the
 * designated party (the service must then sign the publication for it to
 * count). With `owners`, it is sold under that ownership agreement. `offer`
 * in the answer: the publication, its name from before. Save the identity after.
 */
export async function publishVow(
  by: TestIdentity,
  a: { words: string; title: string; price: Amount; offerWords: string; relays: string[]; service?: string; owners?: string | null },
): Promise<{ vow: string; offer: string; publication: string; tag: string; post: string }> {
  const service = a.service ?? by.id;
  const vow = await by.publish(SPECS.envelopes, VOW, vowPayload(a.words), { public: true, relays: a.relays });
  const p = vowPublicationPayload({ vow: vow.id, words: a.offerWords, service, owners: a.owners ?? null, designated: service === by.id ? null : by.id });
  const pub = await by.publish(MIRS.agreements, p.type, p.payload, { public: true, relays: a.relays, ...(a.owners ? { objects: [[a.owners, a.owners] as [string, string]] } : {}) });
  const tag = await putTag(by, { publication: pub.id }, { price: a.price, payee: service, relays: a.relays });
  const post = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.title), { public: true, relays: a.relays, refs: [referenceTo(vow.act), referenceTo(pub.act), referenceTo(tag.act)] });
  return { vow: vow.id, offer: pub.id, publication: pub.id, tag: tag.id, post: post.id };
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
  /** Why its state is unknown, in words (S7e): the rail's own answer where it gave one. */
  why: string | null;
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
  // Each publication of this identity selling a vow (it replaced the standing offer): its split service, designated party and partners held, with their tags and signatures,
  // and, under an ownership agreement, every party of it, so the publication counts only signed by every party (Agreements rule 11).
  for (const a of [...r.held.values()]) {
    const p = readPublication(a);
    if (!p || p.drafter !== identity || !p.vows.length) continue;
    for (const x of [p.service, ...(p.designated ? [p.designated] : []), ...p.partners.map((y) => y.identity)]) await r.hold(x);
    const t = p.owners ? r.held.get(p.owners) : undefined;
    const td = t ? (describeAct(t) as { spec?: string; type?: number; payload?: Uint8Array }) : null;
    if (!td?.payload || td.type !== 0) continue;
    const m = cborDecode(td.payload) as Map<number, unknown>;
    for (const x of ((m.get(0) as Uint8Array[] | undefined) ?? []).map((y) => hex(y))) await r.hold(x);
  }
  // Each claim's and contest's signer, held with its acts (its chain, its lanes).
  for (const a of [...claims, ...contests]) {
    const d = describeAct(a) as { signer?: string };
    if (d.signer) await r.hold(d.signer);
    r.add(a);
  }
  const { specs, amounts, unanswered } = judged(r, claims.map((act) => ({ act })));
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
          beside: contestsOf(r, specs, s.act, contests, unanswered),
          // S7e: why it is unknown, in the rail's own words where it said anything.
          why: s.state === 'unknown' ? `its payment is not verified here: ${unanswered.get(s.act) ?? 'a receipt or claim it rests on has no rail answer here'}; whether it is a sale is unknown` : null,
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
  // A collective's publication is drafted by a member naming the collective in its objects (Agreements rule 58): the
  // collective's own chain is read too, or the core cannot tell it is a collective, nor count its consent.
  for (const x of [...r.held.values()]) {
    const d = describeAct(x) as { spec?: string; type?: number; objects?: [string, string][] };
    if (d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.publication) continue;
    for (const [named] of d.objects ?? []) if (!a.parties.includes(named)) await r.hold(named);
  }
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
  const { specs, unanswered } = judged(r, a.purchases.map((p) => ({ act: p.act, key: p.key ?? undefined })));
  const by: Record<string, ContestsBeside> = {};
  for (const id of ids) if (id) by[id] = contestsOf(r, specs, id, [...contests, ...held], unanswered);
  // Where the core reads a payment as no purchase, said beside it: a contest shows beside a purchase only (F386), never silently "none".
  for (const id of ids) {
    if (!id || by[id]?.state !== 'shown' || by[id].contests.length) continue;
    try {
      const p = r.v.agreementsPurchase(specs, id) as { verdict: string; why?: string | null } | null;
      if (p && p.verdict === 'no-purchase') by[id] = { ...by[id], noPurchase: p.why ?? 'no purchase' };
      // S7e (Q53): whether it is a purchase rests on a rail answer not given here: unknown, never "none".
      else if (p && p.verdict === 'unknown') by[id] = { state: 'unknown', contests: [], why: `${railSaid(unanswered) ?? 'a receipt or claim it rests on has no rail answer here'}: whether it is a purchase is unknown` };
    } catch {
      // not read: as before
    }
  }
  return { by, problems: r.problems };
}

/** The buyer's contests the core shows beside one purchase, each with its promise not kept, in words, where it says. */
function contestsOf(r: Reader, specs: unknown, purchase: string, contests: Uint8Array[], unanswered: Map<string, string>): ContestsBeside {
  try {
    const shown = r.v.agreementsPurchaseContests(specs, purchase) as string[];
    return { state: 'shown', contests: shown.map((act) => ({ act, promise: promiseOf(contests, [act]) })) };
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return { state: 'unknown', contests: [], why: /payment-unstated/.test(m) ? 'its payment is not stated: whether it is a purchase, and whose, is unknown' : /rail-unanswered/.test(m) ? `its payment is not verified here: ${unanswered.has(purchase) ? `its claim’s ${unanswered.get(purchase)!.replace(/^its /, '')}` : (railSaid(unanswered) ?? 'its claim has no rail answer here')}; whether it is a purchase is unknown` : m };
  }
}

/** What the rails said of the records not verified, in their own words, or null where every record held was judged valid. */
function railSaid(unanswered: Map<string, string>): string | null {
  const said = [...new Set(unanswered.values())];
  return said.length ? `a receipt or claim it rests on is not verified here: ${said.join('; ')}` : null;
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
function judged(r: Reader, claims: { act: Uint8Array; key?: Uint8Array }[]): { specs: unknown; amounts: Map<string, Amount>; unanswered: Map<string, string> } {
  const accepted = ACCEPTABLE.flatMap((x) => x.hashes);
  const railValid: [string, string, number | null][] = [];
  // Which payment each proof is, as its rail Module says (Money rule 12): never read from the proofs' bytes.
  const railPayments: [string, string][] = [];
  const limits: [string, boolean][] = [];
  const amounts = new Map<string, Amount>();
  // What each rail said where it did not say valid, in its own words (S7e): the reason an answer resting on it is unknown.
  const unanswered = new Map<string, string>();
  for (const { act, key } of claims) {
    const d = (key ? openWithKey(act, key) : describeAct(act)) as { id: string; type?: number; payload?: Uint8Array; binding?: string };
    try {
      const j = r.v.moneyJudge(d.id, { money: MIRS.money, accepted }) as { rail: { answer: string; why?: string }; payment?: string | null };
      if (j.rail.answer !== 'valid') {
        unanswered.set(d.id, `its rail says ${j.rail.answer}${j.rail.why ? ` (${j.rail.why})` : ''}`);
        continue;
      }
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
    } catch (e) {
      // not judged: it counts for nothing here
      if (d.id) unanswered.set(d.id, `it could not be judged here (${e instanceof Error ? e.message : String(e)})`);
    }
  }
  return { specs: withGrantLimits({ ...AGREEMENTS_SPECS, railValid, railPayments }, limits), amounts, unanswered };
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

