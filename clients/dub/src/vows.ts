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

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, moneyRead, readPaymentProof, vowContestPayload, withGrantLimits } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { allBy } from '../../repo/src/release.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { OFFER, offerPayload, type Amount } from '../../barebone/src/sealed.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { ACCEPTABLE } from '../../damgar/src/specs.ts';
import { judge as judgeLimits } from '../../grants/src/limits.ts';
import { readGrant } from '../../grants/src/grant.ts';

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
export function readVowOffer(act: Uint8Array, seller: string, vow: string): { offer: string; price: Amount; words: string | null; under?: string } | null {
  const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
  if (d.spec !== MIRS.agreements || d.type !== OFFER || d.signer !== seller || !d.payload) return null;
  try {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const sells = (m.get(1) as unknown[][]).some((x) => x[0] === 3 && x[1] instanceof Uint8Array && hex(x[1] as Uint8Array) === vow);
    if (!sells) return null;
    const price = m.get(2) as [Uint8Array, number];
    const under = m.get(0);
    return { offer: d.id, price: { unit: hex(price[0]), value: Number(price[1]) }, words: typeof m.get(4) === 'string' ? (m.get(4) as string) : null, ...(under instanceof Uint8Array ? { under: hex(under) } : {}) };
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
  state: 'pending' | 'confirmed' | 'contested';
  by: string[];
  /** What a contest says was not kept, where it says (field 1). */
  promise: string | null;
  amount: Amount | null;
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
}

/**
 * The look-up (decided by Nobody, allegedly, 17 October 2026): every vow of
 * `identity` the relays asked hold, each with its sales, confirmed,
 * contested or pending, as the core reads them. `relays`: the relays the
 * person chose. What they do not hold is not seen; no index is kept.
 */
export async function vowSales(identity: string, relays: string[], via: Via = {}): Promise<{ vows: VowShown[]; asked: string[]; problems: string[] }> {
  const problems: string[] = [];
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const held = new Map<string, Uint8Array>();
  const add = (a: Uint8Array) => {
    try {
      v.add(a);
      held.set((describeAct(a) as { id: string }).id, a);
    } catch {
      // private, or held already
    }
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
  await hold(identity);
  // The public claims and contests the relays hold, by the feed's own filters (spec and type).
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
  const claims = await byKind(MIRS.money, CLAIM);
  const contests = await byKind(MIRS.agreements, CONTEST);
  const vows: { name: string; words: string }[] = [];
  for (const a of held.values()) {
    const x = readVow(a);
    if (x?.genesis && x.signer === identity) vows.push({ name: x.name, words: x.words });
  }
  // Each claim's and contest's signer, held with its acts (its chain, its lanes).
  for (const a of [...claims, ...contests]) {
    const d = describeAct(a) as { signer?: string };
    if (d.signer) await hold(d.signer);
    add(a);
  }
  // Each claim's rail, checked by its rail Module and stated to the core (the core reads no rail).
  const accepted = ACCEPTABLE.flatMap((x) => x.hashes);
  const railValid: [string, string, number | null][] = [];
  const limits: [string, boolean][] = [];
  const amounts = new Map<string, Amount>();
  for (const a of claims) {
    const d = describeAct(a) as { id: string; payload?: Uint8Array; binding?: string };
    try {
      const j = v.moneyJudge(d.id, { money: MIRS.money, accepted }) as { rail: { answer: string } };
      if (j.rail.answer !== 'valid') continue;
      const c = (moneyRead(CLAIM, d.payload!) as { act: { proof: Uint8Array; amount: Amount } }).act;
      amounts.set(d.id, c.amount);
      const p = readPaymentProof(new Uint8Array(c.proof)) as { paidTo: { flow?: { pointer: string }; vault?: { declaredBy: string; entry: number } } & Record<string, unknown> };
      const to = paidToOf(p.paidTo);
      if (to) railValid.push([d.id, to[0], to[1]]);
      // A claim signed under a lane: its cap judged by the grant limits cMIP (the core asks it of the client).
      const w = limitsOf(held, d, a);
      if (w !== null) limits.push([d.id, w]);
    } catch {
      // not judged: it counts for nothing here
    }
  }
  const specs = withGrantLimits({ ...AGREEMENTS_SPECS, railValid }, limits);
  const out: VowShown[] = [];
  for (const x of vows) {
    try {
      const e = v.agreementsVow(specs, x.name) as { name: string; signer: string; void: boolean; words: string[]; offers: string[]; sales: { act: string; offer: string; buyer: string; state: SaleShown['state']; by: string[] }[]; unsigned: string[] };
      out.push({
        name: e.name,
        signer: e.signer,
        void: e.void,
        words: e.words,
        offers: e.offers,
        sales: e.sales.map((s) => ({ ...s, promise: s.state === 'contested' ? promiseOf(contests, s.by) : null, amount: amounts.get(s.act) ?? null })),
        unsigned: e.unsigned.length,
      });
    } catch (err) {
      problems.push(`The vow ${x.name.slice(0, 8)}… could not be read: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { vows: out, asked: relays, problems };
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
function limitsOf(held: Map<string, Uint8Array>, d: { id: string }, act: Uint8Array): boolean | null {
  const b = (describeAct(act) as { binding?: string }).binding;
  if (!b) return null;
  try {
    const g = held.get(b);
    const gd = g ? (describeAct(g) as { spec?: string; type?: number; payload?: Uint8Array }) : null;
    if (!gd || gd.spec !== MIRS.agreements || gd.type !== 9 || !gd.payload) return null;
    const grant = readGrant(gd.payload);
    if (!grant.limits) return null;
    const w = judgeLimits(grant.limits, { id: d.id, ...(describeAct(act) as object) }, MIRS.money);
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

