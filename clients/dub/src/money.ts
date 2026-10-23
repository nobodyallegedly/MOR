// Money in Dub, round 2 (F338, F351): a lane, asked here and granted in
// Damgar, through MOR as an act sealed to oneself, never a shared file;
// payments signed here under it, without opening Damgar (a tip, a
// pay-per-view post); and pay-per-view posts sold and bought.
//
// Dub runs Damgar's own code for the payer's side (`clients/damgar`,
// `payUnderLane`), its book and its lane kept in Dub's own place
// (`money-*`): the same checks, the same messages, the same claim; but every
// act it signs for money is signed with the lane's key, never the
// identity's own, and is refused before signing past the lane's cap or
// expiry, saying why. Money still moves only in the person's own wallet:
// Dub shows what to pay and takes the proof back.
//
// The key of a sealed post sold is delivered here, by the seller's Dub, when
// the seller's Damgar tells it of the sale (a sale, sealed to oneself): an
// Envelopes act, Dub's layer, signed with the identity's own key.

import { SPECS, base64, describeAct, hex, openSealed, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { followRef, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { makeGrantKey } from '../../grants/src/grant.ts';
import { encodeLimits, type Cap, type Limits } from '../../grants/src/limits.ts';
import { askedValue } from '../../damgar/src/total.ts';
import { grantsForKey, revocationsOf } from '../../grants/src/lanes.ts';
import { Damgar, type Keep as DamgarKeep, type Keys } from '../../damgar/src/damgar.ts';
import { TYPES, laneRequestPayload, sendToSelf, type LaneKind } from '../../damgar/src/messages.ts';
import { MESSAGES_SPEC, MONEY } from '../../damgar/src/specs.ts';
import { say } from '../../damgar/src/units.ts';
import { servedChain } from './carryin.ts';
import { KEY_DELIVERY, checkPlayable, offerWords, openSealedBytes, postSealed, readKeyDelivery, readOffer, readSealed, repost as repostAct } from '../../barebone/src/sealed.ts';
import type { Keep, Settings } from './dub.ts';
import { deliverSold } from './delivery.ts';
import type { RunnerLink } from './runner.ts';
import { contestPurchase, contestSale, purchaseContests, readVow, readVowOffer, vowSales, type ContestsBeside } from './vows.ts';
import { collectiveNow, collectivePlaces } from '../../grants/src/member.ts';
import { dealOfPost, readDeal, sharedLine, type DealRead } from '../../grants/src/deal.ts';
import type { PaymentShown } from '../../damgar/src/shapes.ts';

/** What Dub's lane may sign: invoice requests (the money messages cMIP) and payment claims (Money). */
export const LANE_KINDS: LaneKind[] = [
  { spec: MESSAGES_SPEC, type: TYPES.invoiceRequest },
  { spec: MONEY, type: 3 },
];

/** Said where a lane is asked (F338: "the person sees each lane in plain words before signing it"; it is signed in Damgar). */
export const LANE_SAY = [
  'A lane lets Dub pay by itself, without opening Damgar: a tip, or a sealed post, up to a cap per payment, until a date if you give one.',
  'Dub makes a key of its own for the lane and asks Damgar for it, sealed to yourself. Damgar shows you the lane in plain words; only once you grant it there can Dub sign with it. Every payment Dub signs under it is shown, in Damgar and to every reader, as signed under this lane, not with your own key.',
  'Revoke it in Damgar (Lanes) at any time: one public act ends it.',
  'Its key is kept in this app’s folder: someone who takes that folder can pay within the cap until you revoke the lane.',
  'Money still moves only in your own wallet: Dub shows the invoice to pay, and takes the proof back.',
];

export interface LaneShownHere {
  label: string;
  state: 'asked' | 'in force' | 'revoked' | 'past its expiry';
  cap: string;
  /** The cap in all (the grant limits cMIP, draft 3), said, or null where none was asked. */
  total: string | null;
  until: number | null;
  grant: string | null;
}

/** What Dub keeps of the lanes it asked for (inside Damgar's `keys`). */
type KeysHere = Keys & { asked?: { key: string; secret: string; label: string; limits: Limits; total?: Cap | null; request: string; at: number }[] };

/** Damgar's keep, inside Dub's own place: the identity Dub holds, its relays, and Damgar's settings, book and keys as `money-*`. */
class DamgarKeepInDub implements DamgarKeep {
  constructor(private s: Keep) {}
  held() {
    return this.s.held();
  }
  active() {
    return this.s.active();
  }
  setActive(id: string | null) {
    return this.s.setActive(id);
  }
  identity(id: string) {
    return this.s.identity(id);
  }
  saveIdentity(id: TestIdentity) {
    return this.s.saveIdentity(id);
  }
  async read<T>(id: string, name: 'settings' | 'book' | 'keys'): Promise<T | null> {
    if (name === 'settings') {
      const st = await this.s.settings(id);
      return { ...((await this.s.money<object>(id, 'settings')) ?? {}), relays: st.relays, via: st.via } as T;
    }
    return this.s.money<T>(id, name);
  }
  async write(id: string, name: 'settings' | 'book' | 'keys', v: unknown): Promise<void> {
    if (name === 'settings') {
      const { relays: _, via: __, ...rest } = v as Record<string, unknown>;
      return this.s.saveMoney(id, 'settings', rest);
    }
    return this.s.saveMoney(id, name, v);
  }
  async forget(): Promise<void> {
    // Dub forgets an identity whole, its money with it.
  }
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    return f();
  }
}

/** A sealed post as the feed shows it. */
export interface SealedShown {
  publication: string;
  offer: string | null;
  seller: string;
  price: string;
  words: string | null;
  state: 'for sale' | 'paying' | 'opened' | 'yours';
  /** Text, or a JPEG picture (round 3: a protected file from Edubba's Publishing tab). */
  media: 'text' | 'picture' | 'video' | 'audio';
  text: string | null;
  /** A picture, opened: a data link the page shows. */
  picture: string | null;
  problem: string | null;
}

interface Sold {
  [publication: string]: { key: string; offer: string; post: string; delivered: Record<string, string> };
}
interface Bought {
  [publication: string]: { key: string | null; payment: string | null; seller: string; offer: string | null; contests?: string[] };
}

/** Vows bought here (round 3), by the vow's name: its seller and offer, the payment, and where it was found. */
interface VowsBought {
  [vow: string]: { seller: string; offer: string; payment: string | null; post: string | null; words: string; contests?: string[] };
}

/** A vow as the feed shows it (round 3). */
export interface VowCard {
  vow: string;
  offer: string | null;
  seller: string;
  words: string;
  price: string;
  state: 'for sale' | 'paying' | 'bought' | 'yours';
  problem: string | null;
}

/** A vow bought here, with where its sale stands as the relays read it. */
export interface VowBoughtShown {
  vow: string;
  seller: string;
  words: string;
  price: string | null;
  /** Paid, and its claim published: a sale anyone can read. */
  paid: boolean;
  sale: 'pending' | 'confirmed' | 'contested' | 'unknown' | null;
  promise: string | null;
  /** Its buyer's contests in the purchase's form (F386), shown beside it: they mark no sale. */
  beside: ContestsBeside | null;
  /** Why the sale is unknown, in words (S7e): its payment not verified here, as its rail said. */
  why: string | null;
}

const now = () => Math.floor(Date.now() / 1000);
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];

export class DubMoney {
  readonly engine: Damgar;

  constructor(
    private store: Keep,
    opts: { web: boolean; app: string; runner?: RunnerLink },
  ) {
    // With Kišib's runner (the Mac), an identity used through Kišib signs a lane's record through it (the Dubsar runner cMIP, draft 3, 7.5).
    this.engine = new Damgar(new DamgarKeepInDub(store), { web: opts.web, app: opts.app, runner: opts.runner });
  }

  private async keys(id: string): Promise<KeysHere> {
    return ((await this.store.money<KeysHere>(id, 'keys')) ?? { request: null, earlier: [] }) as KeysHere;
  }

  // ------------------------------------------------------------ the lane

  /**
   * Ask Damgar for a lane (the money messages cMIP draft 2, type 5): a grant
   * key made here, its secret kept here, and the request sealed to this
   * identity at its homes, where Damgar finds it. Nothing is signed for
   * money; the request itself is signed with the identity's key.
   */
  async askLane(me: TestIdentity, s: Settings, a: { label: string; cap: number; total?: number | null; unit: string; until: number | null; clock: string | null; app: string }): Promise<string[]> {
    if (!Number.isSafeInteger(a.cap) || a.cap <= 0) throw new Error('A lane needs a cap per payment: a whole amount above zero. Nothing was asked.');
    // The cap in all (the grant limits cMIP, draft 3, 8): optional; kept by Dub and counted by Damgar, never judged by verifiers.
    const total: Cap | null = a.total === null || a.total === undefined ? null : { unit: a.unit, value: a.total };
    if (total && (!Number.isSafeInteger(total.value) || total.value < a.cap)) throw new Error('The cap in all is a whole amount, at least the cap per payment. Nothing was asked.');
    const limits: Limits = { cap: { unit: a.unit, value: a.cap } };
    if (a.until !== null) {
      if (!a.clock || !/^[0-9a-f]{64}$/.test(a.clock)) throw new Error('An expiry is judged on a timestamp clock: give its ID, or leave Until empty. Nothing was asked.');
      limits.expiry = { clock: 'timestamp', identity: a.clock, time: a.until };
    }
    encodeLimits(limits);
    const k = makeGrantKey();
    const keys = await this.keys(me.id);
    const label = a.label.trim().slice(0, 80) || a.app;
    // Kept before anything leaves: the key whose grant Damgar will sign.
    const asked = { key: hex(k.public[1]), secret: hex(k.secret), label, limits, total, request: '', at: now() };
    keys.asked = [...(keys.asked ?? []), asked];
    await this.store.saveMoney(me.id, 'keys', keys);
    const r = await sendToSelf(me, TYPES.laneRequest, laneRequestPayload({ key: asked.key, label, kinds: LANE_KINDS, limits: askedValue(limits, total, encodeLimits), app: a.app }), { via: s.via, save: () => this.store.saveIdentity(me) });
    asked.request = r.id;
    await this.store.saveMoney(me.id, 'keys', keys);
    return [`Asked, not granted: the lane “${label}”, sealed to this identity and left at its homes (${r.left.join(', ')}).`, 'Open Damgar with this identity: the lane waits in To sign, read in plain words, to be granted or declined. Until then Dub pays nothing by itself.'];
  }

  /** The lanes asked here, as they stand: a grant found for each key at the identity's places (then held), revoked or past its expiry. */
  async lanes(me: TestIdentity, s: Settings, hints: string[]): Promise<LaneShownHere[]> {
    const keys = await this.keys(me.id);
    let changed = false;
    for (const a of [...(keys.asked ?? [])]) {
      const found = (await grantsForKey(me.id, a.key, hints, s.via).catch(() => []))[0];
      if (!found) continue;
      keys.lanes = [...(keys.lanes ?? []), { grant: found.id, label: a.label, secret: a.secret, strand: [], kinds: LANE_KINDS, limits: found.grant.limits ?? a.limits, role: 'app', total: a.total ?? null }];
      keys.asked = (keys.asked ?? []).filter((x) => x !== a);
      changed = true;
    }
    if (changed) await this.store.saveMoney(me.id, 'keys', keys);
    const shown = (l: { label: string; limits: Limits | null; total?: Cap | null }, state: LaneShownHere['state'], grant: string | null): LaneShownHere => ({
      label: l.label,
      state,
      cap: l.limits?.cap ? say({ unit: l.limits.cap.unit, value: l.limits.cap.value }, new Set([l.limits.cap.unit])) : 'no cap',
      total: l.total ? say(l.total, new Set([l.total.unit])) : null,
      until: l.limits?.expiry?.clock === 'timestamp' ? l.limits.expiry.time : null,
      grant,
    });
    const out: LaneShownHere[] = (keys.asked ?? []).map((a) => shown(a, 'asked', null));
    for (const l of keys.lanes ?? []) {
      const revoked = (await revocationsOf(me.id, l.grant, hints, s.via).catch(() => [])).length > 0;
      const expired = l.limits?.expiry?.clock === 'timestamp' && now() > l.limits.expiry.time;
      out.push(shown(l, revoked ? 'revoked' : expired ? 'past its expiry' : 'in force', l.grant));
    }
    return out;
  }

  // ------------------------------------------------------------ paying, under the lane

  /**
   * A tip on a post, paid now under the lane: the invoice request signed with
   * the lane's key; refused before signing past its cap or expiry, saying
   * why. A post under a deal between separate people (it names the deal, or
   * an offer under it): the tip goes to the deal, not to the act (decided:
   * "with a tip IF there is a split the target is the agreement not the
   * act"): paid to the deal's own payee, following the deal, through its
   * split service; said in one line before paying. A tip to a person's own
   * post is unchanged.
   */
  async tip(a: { post: string; signer: string; amount: { unit: string; value: number }; whatFor: string | null; deal?: DealRead | null; names?: (id: string) => string }): Promise<string[]> {
    const d = a.deal;
    if (d && d.payee) {
      const r = await this.engine.payUnderLane({ payee: d.payee, amount: a.amount, whatFor: a.whatFor ?? 'a tip to a shared work', fulfils: d.version, refs: [[a.post, a.signer]] });
      return [sharedLine(d, a.names ?? ((x) => `${x.slice(0, 8)}…`)), 'The tip goes to the deal, not to the one who posted it: divided by its split service like a sale, and no purchase (nothing is owed back).', ...r.lines.map((l) => l.text)];
    }
    const r = await this.engine.payUnderLane({ payee: a.signer, amount: a.amount, whatFor: a.whatFor, refs: [[a.post, a.signer]] });
    return r.lines.map((l) => l.text);
  }

  /** The deal a post is under, where it names one: null for a person's own post (the money messages cMIP, draft 5, 8). */
  async dealOf(post: string, signer: string, hints: string[], via: Via): Promise<DealRead | null> {
    try {
      const act = (await followRef([post, signer], hints, via)).act;
      return await dealOfPost(act, hints, via);
    } catch {
      return null;
    }
  }

  /** The payments asked here: answered ones to pay in the wallet, the others waiting, after a look for answers and receipts. */
  async payments(): Promise<{ payments: PaymentShown[]; done: PaymentShown[]; problems: string[] }> {
    const looked = await this.engine.look().catch((e) => ({ lines: [], problems: [message(e)] }));
    const pay = (await this.engine.pay()).payments;
    const done = (await this.engine.account()).payments.filter((p) => p.side === 'out' && !pay.some((x) => x.key === p.key)).slice(0, 10);
    return { payments: pay, done, problems: looked.problems };
  }

  /** The proof pasted back from the wallet: checked, and the claim signed under the lane. */
  async paid(key: string, proof: string): Promise<string[]> {
    return (await this.engine.paid(key, proof)).lines.map((l) => l.text);
  }

  // ------------------------------------------------------------ pay-per-view, the seller's side

  /** Seal a post with a price: the publication, its offer, the post naming both; the key kept here, to be delivered on each sale. */
  async sell(me: TestIdentity, s: Settings, a: { text: string; teaser: string; price: { unit: string; value: number }; referral: number | null }): Promise<{ post: string; publication: string; offer: string; lines: string[] }> {
    if (!Number.isSafeInteger(a.price.value) || a.price.value <= 0) throw new Error('A price is a whole amount above zero. Nothing was posted.');
    if (a.referral !== null && (!Number.isInteger(a.referral) || a.referral < 1 || a.referral > 99)) throw new Error('A referral share is a whole percentage, 1 to 99. Nothing was posted.');
    const priceSaid = say(a.price, new Set([a.price.unit]));
    const made = await postSealed(me, { text: a.text, teaser: a.teaser, price: a.price, words: offerWords(priceSaid, a.referral), relays: s.relays });
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    sold[made.publication] = { key: made.key, offer: made.offer, post: made.post, delivered: {} };
    await this.store.saveMoney(me.id, 'sold', sold);
    return {
      post: made.post,
      publication: made.publication,
      offer: made.offer,
      lines: [
        `Posted, sealed: ${priceSaid} to open it. Its words are public; its text opens only with its key, which Dub keeps and delivers to each buyer once your Damgar has signed the receipt.`,
        a.referral ? `Your offer promises ${a.referral}% of the price to the repost a buyer names: Damgar prepares that payment when it signs the receipt. A promise in words, not judged by the core (F351).` : 'No referral share.',
      ],
    };
  }

  /**
   * Deliver the keys of sales the seller's Damgar told of (type 6, sealed to
   * oneself): each a key delivery (Envelopes type 1), sealed to the buyer
   * and left in its inbox (`delivery.ts`, shared with Edubba's Publishing tab).
   */
  async deliver(me: TestIdentity, s: Settings, current: () => Promise<void>): Promise<string[]> {
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    if (!Object.keys(sold).length) return [];
    const out = await deliverSold(me, sold, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current });
    await this.store.saveMoney(me.id, 'sold', sold);
    return out;
  }

  // ------------------------------------------------------------ pay-per-view, the buyer's side

  /** A sealed post a feed item names, read: its publication and offer, as this identity stands with it. */
  async read(me: TestIdentity, hints: string[], via: Via, refs: { id: string; signer?: string }[]): Promise<SealedShown | null> {
    let pub: { act: Uint8Array; s: NonNullable<ReturnType<typeof readSealed>> } | null = null;
    const acts: Uint8Array[] = [];
    for (const r of refs) {
      try {
        const a = (await followRef(r.signer ? [r.id, r.signer] : r.id, hints, via)).act;
        acts.push(a);
        const x = readSealed(a);
        if (x && !pub) pub = { act: a, s: x };
      } catch {
        // not found
      }
    }
    if (!pub) return null;
    const p = pub.s;
    const offer = acts.map((a) => readOffer(a, p.seller, p.publication, true)).find(Boolean) ?? null;
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    const price = offer?.price ?? p.price;
    const out: SealedShown = {
      publication: p.publication,
      offer: offer?.offer ?? null,
      seller: p.seller,
      price: price ? say(price, new Set([price.unit])) : 'no price stated',
      words: offer?.words ?? null,
      state: 'for sale',
      media: p.media,
      text: null,
      picture: null,
      problem: offer ? null : 'no offer of its seller selling it was found: it cannot be bought here',
    };
    const key = p.seller === me.id ? sold[p.publication]?.key : bought[p.publication]?.key;
    if (p.seller === me.id) out.state = 'yours';
    else if (bought[p.publication]?.payment && !key) out.state = 'paying';
    if (key) {
      try {
        const bytes = await openSealedBytes(p, key, hints, via);
        if (p.media === 'picture') out.picture = `data:image/jpeg;base64,${base64(bytes)}`;
        // A film or a recording (sold from Edubba's Publishing): checked by its Module now, played only when asked (`sealedBytes`).
        else if (p.media === 'video' || p.media === 'audio') checkPlayable(p.media, bytes);
        else out.text = new TextDecoder().decode(bytes);
        if (out.state !== 'yours') out.state = 'opened';
      } catch (e) {
        out.problem = p.media === 'video' || p.media === 'audio' ? `its key is here, but it is not played: ${message(e)}` : `its key is here, but ${message(e)}`;
      }
    }
    return out;
  }

  /**
   * A sealed film or recording's bytes, opened with the key that came with
   * the receipt (or one's own), checked against the work hash and size, then
   * by the video or audio Module (rules 2 to 9) before they leave here: a
   * file the Module refuses never reaches the player.
   */
  async sealedBytes(me: TestIdentity, hints: string[], via: Via, a: { publication: string; seller: string }): Promise<{ b64: string; type: string }> {
    const act = (await followRef([a.publication, a.seller], hints, via)).act;
    const p = readSealed(act);
    if (!p || (p.media !== 'video' && p.media !== 'audio')) throw new Error('not a sealed film or recording');
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    const key = p.seller === me.id ? sold[p.publication]?.key : bought[p.publication]?.key;
    if (!key) throw new Error('its key is not here: it opens once its seller’s Damgar signs the receipt');
    const bytes = await openSealedBytes(p, key, hints, via);
    checkPlayable(p.media, bytes);
    return { b64: base64(bytes), type: p.media === 'video' ? 'video/mp4' : 'audio/mp4' };
  }

  /** Buy a sealed post under the lane: an invoice request following the seller's offer, naming the repost followed (Money claim field 6) where it was found through one. */
  async buy(me: TestIdentity, hints: string[], via: Via, a: { publication: string; seller: string; repost: { id: string; by: string } | null; post?: string | null; names?: (id: string) => string }): Promise<string[]> {
    const pubAct = (await followRef([a.publication, a.seller], hints, via)).act;
    const p = readSealed(pubAct);
    if (!p) throw new Error('That is not a sealed post. Nothing was signed.');
    if (p.seller === me.id) throw new Error('That post is your own. Nothing was signed.');
    const offerId = await this.offerFor(a, hints, via);
    if (!offerId) throw new Error('No offer of its seller selling it was found. Nothing was signed.');
    const offer = readOffer((await followRef([offerId, a.seller], hints, via)).act, a.seller, a.publication, true)!;
    // An offer made under an agreement (a collective's, round 3): the purchase names that agreement, at the version in force read now (Agreements rule 12).
    let purchase: [string, string] | null = null;
    if (offer.under) {
      const now = await collectiveNow(a.seller, await collectivePlaces(a.seller, hints, via), via).catch(() => null);
      purchase = [offer.under, now?.agreement ?? offer.under];
    }
    // Under a deal between separate people: its payee is paid (the offer's field 3), through its split service, said in one line first.
    const deal = offer.under ? await readDeal(offer.under, hints, via).catch(() => null) : null;
    const said = deal ? [sharedLine(deal, a.names ?? ((x) => `${x.slice(0, 8)}…`))] : [];
    const r = await this.engine.payUnderLane({ payee: offer.payee ?? a.seller, amount: offer.price, whatFor: 'a sealed post', fulfils: offer.offer, refs: [[a.publication, a.seller]], referral: a.repost ? { identity: a.repost.by, evidence: a.repost.id } : null, purchase });
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    bought[a.publication] = { key: null, payment: r.key, seller: a.seller, offer: offer.offer };
    await this.store.saveMoney(me.id, 'bought', bought);
    return [...said, ...r.lines.map((l) => l.text), ...(a.repost ? [`Your claim will name the repost you followed, by ${a.repost.by.slice(0, 8)}…: it earns the referral share the offer states, if the seller pays it.`] : [])];
  }

  /** The offer selling a publication, named beside it in the post or repost that names it. */
  private async offerFor(a: { publication: string; seller: string; repost: { id: string; by: string } | null; post?: string | null }, hints: string[], via: Via): Promise<string | null> {
    const from = a.repost ? [a.repost.id, a.repost.by] : a.post ? [a.post, a.seller] : null;
    const names: string[] = [];
    if (from) {
      const d = describeAct((await followRef(from as [string, string], hints, via)).act) as { refs?: string[] };
      names.push(...(d.refs ?? []));
    }
    for (const id of names) {
      try {
        const o = readOffer((await followRef([id, a.seller], hints, via)).act, a.seller, a.publication, true);
        if (o) return o.offer;
      } catch {
        // not that one
      }
    }
    return null;
  }

  /** Key deliveries arrived in this identity's inbox (Envelopes type 1), each from the seller of the post it opens: kept here. */
  async keysArrived(me: TestIdentity, s: Settings, inbox: string[]): Promise<string[]> {
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    const waiting = Object.entries(bought).filter(([, b]) => !b.key);
    if (!waiting.length) return [];
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const out: string[] = [];
    for (const h of list([...inbox, ...me.f.homes.map((x) => x.hint)])) {
      let after: number | undefined;
      try {
        for (;;) {
          const page = await relayAt(h, s.via).feed({ to: me.id, after });
          for (const it of page.items) {
            if (it.kind !== 'sealed') continue;
            for (const sec of secrets) {
              let o: { described: { signer?: string; spec?: string; type?: number; payload?: Uint8Array } };
              try {
                o = openSealed(it.item, me.id, sec) as typeof o;
              } catch {
                continue;
              }
              const d = o.described;
              if (d.spec === SPECS.envelopes && d.type === KEY_DELIVERY && d.payload) {
                const k = readKeyDelivery(d.payload);
                const b = k ? bought[k.publication] : undefined;
                if (k && b && !b.key && d.signer === b.seller) {
                  b.key = k.key;
                  out.push('The key of a sealed post you bought arrived from its seller: it opens in the feed.');
                }
              }
              break;
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        // away
      }
    }
    await this.store.saveMoney(me.id, 'bought', bought);
    return out;
  }

  /** A repost of a sealed post, at this identity's relays, with what it names held there too (F272), so a reader of those relays alone finds it. */
  async repost(me: TestIdentity, s: Settings, hints: string[], a: { post: string; signer: string }): Promise<{ id: string; lines: string[] }> {
    const postAct = (await followRef([a.post, a.signer], hints, s.via)).act;
    const d = describeAct(postAct) as { refs?: string[]; refSigners?: (string | undefined)[] };
    const named = await Promise.all((d.refs ?? []).map(async (id, i) => (await followRef(d.refSigners?.[i] ? [id, d.refSigners[i]!] : id, hints, s.via)).act));
    const pubAct = named.find((x) => readSealed(x));
    if (!pubAct) throw new Error('That post names no sealed post. Nothing was reposted.');
    const p = readSealed(pubAct)!;
    const offerAct = named.find((x) => readOffer(x, p.seller, p.publication, true));
    if (!offerAct) throw new Error('That post names no offer selling it. Nothing was reposted.');
    const seller = await lookUp(p.seller, hints, s.via);
    const chain = await servedChain(p.seller, seller.resolution.homes, s.via).catch(() => [] as Uint8Array[]);
    let locked: Uint8Array | null = null;
    for (const h of list([...hints, ...p.places])) {
      try {
        locked = await relayAt(h, s.via).getMedia(p.lockedHash);
        if (locked) break;
      } catch {
        // not there
      }
    }
    let made: { id: string; act: Uint8Array };
    try {
      made = await repostAct(me, { publication: pubAct, offer: offerAct, seller: chain, text: 'Reposted: a sealed post.', relays: s.relays, locked, via: s.via });
    } finally {
      await this.store.saveIdentity(me);
    }
    return { id: made.id, lines: [`Reposted at your relays (${s.relays.join(', ')}), with the sealed post and its offer held there too: a reader of those relays finds it through you. A buyer who names your repost earns you the share its offer promises, if any.`] };
  }

  // ------------------------------------------------------------ vows (round 3)

  /** A vow a feed item names, read with its offer: null where the item names none. */
  async readVowRef(me: TestIdentity, hints: string[], via: Via, refs: { id: string; signer?: string }[]): Promise<VowCard | null> {
    const acts: Uint8Array[] = [];
    for (const r of refs) {
      try {
        acts.push((await followRef(r.signer ? [r.id, r.signer] : r.id, hints, via)).act);
      } catch {
        // not found
      }
    }
    const v = acts.map(readVow).find((x) => x?.genesis);
    if (!v) return null;
    const offer = acts.map((a) => readVowOffer(a, v.signer, v.name)).find(Boolean) ?? null;
    const bought = ((await this.store.money<VowsBought>(me.id, 'vows')) ?? {})[v.name];
    return {
      vow: v.name,
      offer: offer?.offer ?? null,
      seller: v.signer,
      words: v.words,
      price: offer ? say(offer.price, new Set([offer.price.unit])) : 'no price stated',
      state: v.signer === me.id ? 'yours' : bought?.payment ? ((await this.engine.payment(bought.payment))?.proof ? 'bought' : 'paying') : 'for sale',
      problem: offer ? null : 'no offer of its signer selling it was found: it cannot be bought here',
    };
  }

  /** Buy a vow under the lane: an invoice request following its offer; its claim, once paid, is also published, so its sale is seen (Agreements rule 13). */
  async buyVow(me: TestIdentity, hints: string[], via: Via, a: { vow: string; seller: string; post: string; names?: (id: string) => string }): Promise<string[]> {
    const card = await this.readVowRef(me, hints, via, [{ id: a.post, signer: a.seller }, ...(((describeAct((await followRef([a.post, a.seller], hints, via)).act) as { refs?: string[] }).refs ?? []).map((id) => ({ id, signer: a.seller })))]);
    if (!card || card.vow !== a.vow) throw new Error('That post names no vow. Nothing was signed.');
    if (card.seller === me.id) throw new Error('That vow is your own. Nothing was signed.');
    if (!card.offer || card.problem) throw new Error(`${card.problem ?? 'No offer was found'}. Nothing was signed.`);
    const offer = readVowOffer((await followRef([card.offer, card.seller], hints, via)).act, card.seller, card.vow)!;
    let purchase: [string, string] | null = null;
    if (offer.under) {
      const now = await collectiveNow(card.seller, await collectivePlaces(card.seller, hints, via), via).catch(() => null);
      purchase = [offer.under, now?.agreement ?? offer.under];
    }
    const deal = offer.under ? await readDeal(offer.under, hints, via).catch(() => null) : null;
    const said = deal ? [sharedLine(deal, a.names ?? ((x) => `${x.slice(0, 8)}…`))] : [];
    const r = await this.engine.payUnderLane({ payee: offer.payee ?? card.seller, amount: offer.price, whatFor: 'a vow', fulfils: offer.offer, refs: [[card.vow, card.seller]], visible: true, purchase });
    const vows = (await this.store.money<VowsBought>(me.id, 'vows')) ?? {};
    vows[card.vow] = { seller: card.seller, offer: offer.offer, payment: r.key, post: a.post, words: card.words };
    await this.store.saveMoney(me.id, 'vows', vows);
    return [...said, ...r.lines.map((l) => l.text), 'Once paid, your claim of the payment is published too: it is the sale, pending until you confirm or contest it, in its menu (Purchases).'];
  }

  /** The vows bought here, each with its sale's state as the relays asked read it (the look-up, `vows.ts`). */
  async vowsBought(me: TestIdentity, hints: string[], via: Via): Promise<VowBoughtShown[]> {
    const vows = (await this.store.money<VowsBought>(me.id, 'vows')) ?? {};
    const out: VowBoughtShown[] = [];
    const bySeller = new Map<string, Awaited<ReturnType<typeof vowSales>>>();
    for (const [vow, b] of Object.entries(vows)) {
      const p = b.payment ? await this.engine.payment(b.payment) : null;
      const paid = !!p?.publicClaims?.length;
      let sale: VowBoughtShown['sale'] = null;
      let promise: string | null = null;
      let beside: ContestsBeside | null = null;
      let why: string | null = null;
      if (paid) {
        if (!bySeller.has(b.seller)) bySeller.set(b.seller, await vowSales(b.seller, hints, via).catch(() => ({ vows: [], asked: hints, problems: [] })));
        const x = bySeller.get(b.seller)!.vows.find((y) => y.name === vow)?.sales.find((y) => y.buyer === me.id);
        sale = x?.state ?? null;
        promise = x?.promise ?? null;
        beside = x?.beside ?? null;
        why = x?.why ?? null;
      }
      out.push({ vow, seller: b.seller, words: b.words, price: p ? say(p.amount, new Set([p.amount.unit])) : null, paid, sale, promise, beside, why });
    }
    return out;
  }

  /** Confirm a vow bought: a public claim of its payment acknowledging the vow (rule 13), under the lane. */
  async confirmVow(me: TestIdentity, vow: string): Promise<string[]> {
    const b = ((await this.store.money<VowsBought>(me.id, 'vows')) ?? {})[vow];
    if (!b?.payment) throw new Error('No vow bought here by that name. Nothing was signed.');
    const r = await this.engine.confirmPurchase(b.payment, [vow]);
    return r.lines.map((l) => l.text);
  }

  /** Contest a vow bought: a contest naming its sale (the public claim), the promise not kept in words if given (F253). */
  async contestVow(me: TestIdentity, s: Settings, vow: string, promise: string | null): Promise<string[]> {
    const vows = (await this.store.money<VowsBought>(me.id, 'vows')) ?? {};
    const b = vows[vow];
    const p = b?.payment ? await this.engine.payment(b.payment) : null;
    const sale = p?.publicClaims?.[0];
    if (!b || !sale) throw new Error('No sale of that vow is here to contest: it is contested once paid. Nothing was signed.');
    let id: string;
    try {
      id = await contestSale(me, { vow, sale, promise, relays: list([...s.relays, ...me.f.homes.map((h) => h.hint)]) });
    } finally {
      await this.store.saveIdentity(me);
    }
    b.contests = [...(b.contests ?? []), id];
    await this.store.saveMoney(me.id, 'vows', vows);
    return ['Your contest of that sale is signed in public: it reads contested for anyone who looks. It voids nothing; the payment stays as it is.'];
  }

  /**
   * Contest a file bought (F386): a contest naming the purchase (your own
   * payer's claim of its payment), the promise not kept in words if given,
   * signed in public with the identity's own key. It undoes nothing: no
   * payment, refund or delivery moves. A vow keeps its own form
   * (`contestVow`): that is what marks its sale.
   */
  async contestFile(me: TestIdentity, s: Settings, publication: string, promise: string | null): Promise<string[]> {
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    const b = bought[publication];
    const claims = b?.payment ? await this.engine.ownClaims(b.payment) : [];
    if (!b) throw new Error('Nothing bought here by that name. Nothing was signed.');
    if (!claims.length) throw new Error('It is not paid yet: a purchase is contested once paid, naming your claim of its payment. Nothing was signed.');
    let id: string;
    try {
      id = await contestPurchase(me, { purchase: claims[0].id, promise, relays: list([...s.relays, ...me.f.homes.map((h) => h.hint)]) });
    } finally {
      await this.store.saveIdentity(me);
    }
    b.contests = [...(b.contests ?? []), id];
    await this.store.saveMoney(me.id, 'bought', bought);
    return ['Your contest of that purchase is signed in public: it is shown beside the purchase, to you and to the seller. It undoes nothing: the payment, the key and the file stay as they are.'];
  }

  /** Each file bought and paid, by publication: the buyer's contests the core shows beside it (`unknown` where it cannot say). Unpaid ones are left out. */
  async filesContested(me: TestIdentity, hints: string[], via: Via): Promise<{ paid: Record<string, ContestsBeside>; problems: string[] }> {
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    const purchases: { publication: string; id: string; act: Uint8Array; key: Uint8Array | null }[] = [];
    for (const [publication, b] of Object.entries(bought)) {
      const c = b.payment ? (await this.engine.ownClaims(b.payment))[0] : undefined;
      if (c) purchases.push({ publication, ...c });
    }
    if (!purchases.length) return { paid: {}, problems: [] };
    // Under a deal between separate people, every party and its payee are held too: the offer counts only signed by every party (Agreements, Standing offer).
    const parties: string[] = [];
    for (const b of Object.values(bought)) {
      if (!b.offer) continue;
      try {
        const o = readOffer((await followRef([b.offer, b.seller], hints, via)).act, b.seller, Object.keys(bought).find((k) => bought[k] === b)!, true);
        const d = o?.under ? await readDeal(o.under, hints, via) : null;
        if (d) parties.push(...d.parties, ...(d.service ? [d.service] : []));
      } catch {
        // its offer was not found: held as before
      }
    }
    const r = await purchaseContests({ purchases, parties: list([me.id, ...purchases.map((p) => bought[p.publication].seller), ...parties]), relays: hints, via });
    const paid: Record<string, ContestsBeside> = {};
    for (const p of purchases) paid[p.publication] = r.by[p.id] ?? { state: 'unknown', contests: [], why: 'its claim could not be read' };
    return { paid, problems: r.problems };
  }

}

