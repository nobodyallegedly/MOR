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

import { SPECS, describeAct, hex, openSealed, unhex } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { followRef, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { makeGrantKey } from '../../grants/src/grant.ts';
import { encodeLimits, limitsValue, type Limits } from '../../grants/src/limits.ts';
import { grantsForKey, revocationsOf } from '../../grants/src/lanes.ts';
import { Damgar, type Keep as DamgarKeep, type Keys } from '../../damgar/src/damgar.ts';
import { TYPES, laneRequestPayload, readSale, sendToSelf, type LaneKind } from '../../damgar/src/messages.ts';
import { MESSAGES_SPEC, MONEY } from '../../damgar/src/specs.ts';
import { say } from '../../damgar/src/units.ts';
import { servedChain } from './carryin.ts';
import { KEY_DELIVERY, keyDeliveryPayload, offerWords, openSealedText, postSealed, readKeyDelivery, readOffer, readSealed, repost as repostAct } from '../../barebone/src/sealed.ts';
import type { Keep, Settings } from './dub.ts';
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
  'Money still moves only in your own wallet: Dub shows the invoice to pay, and takes the proof back.',
];

export interface LaneShownHere {
  label: string;
  state: 'asked' | 'in force' | 'revoked' | 'past its expiry';
  cap: string;
  until: number | null;
  grant: string | null;
}

/** What Dub keeps of the lanes it asked for (inside Damgar's `keys`). */
type KeysHere = Keys & { asked?: { key: string; secret: string; label: string; limits: Limits; request: string; at: number }[] };

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
  text: string | null;
  problem: string | null;
}

interface Sold {
  [publication: string]: { key: string; offer: string; post: string; delivered: Record<string, string> };
}
interface Bought {
  [publication: string]: { key: string | null; payment: string | null; seller: string; offer: string | null };
}

const now = () => Math.floor(Date.now() / 1000);
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];

export class DubMoney {
  readonly engine: Damgar;

  constructor(
    private store: Keep,
    opts: { web: boolean; app: string },
  ) {
    this.engine = new Damgar(new DamgarKeepInDub(store), { web: opts.web, app: opts.app });
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
  async askLane(me: TestIdentity, s: Settings, a: { label: string; cap: number; unit: string; until: number | null; clock: string | null; app: string }): Promise<string[]> {
    if (!Number.isSafeInteger(a.cap) || a.cap <= 0) throw new Error('A lane needs a cap per payment: a whole amount above zero. Nothing was asked.');
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
    const asked = { key: hex(k.public[1]), secret: hex(k.secret), label, limits, request: '', at: now() };
    keys.asked = [...(keys.asked ?? []), asked];
    await this.store.saveMoney(me.id, 'keys', keys);
    const r = await sendToSelf(me, TYPES.laneRequest, laneRequestPayload({ key: asked.key, label, kinds: LANE_KINDS, limits: limitsValue(limits), app: a.app }), { via: s.via, save: () => this.store.saveIdentity(me) });
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
      keys.lanes = [...(keys.lanes ?? []), { grant: found.id, label: a.label, secret: a.secret, strand: [], kinds: LANE_KINDS, limits: found.grant.limits ?? a.limits, role: 'app' }];
      keys.asked = (keys.asked ?? []).filter((x) => x !== a);
      changed = true;
    }
    if (changed) await this.store.saveMoney(me.id, 'keys', keys);
    const shown = (l: { label: string; limits: Limits | null }, state: LaneShownHere['state'], grant: string | null): LaneShownHere => ({
      label: l.label,
      state,
      cap: l.limits?.cap ? say({ unit: l.limits.cap.unit, value: l.limits.cap.value }, new Set([l.limits.cap.unit])) : 'no cap',
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

  /** A tip on a post, paid now under the lane: the invoice request signed with the lane's key; refused before signing past its cap or expiry, saying why. */
  async tip(a: { post: string; signer: string; amount: { unit: string; value: number }; whatFor: string | null }): Promise<string[]> {
    const r = await this.engine.payUnderLane({ payee: a.signer, amount: a.amount, whatFor: a.whatFor, refs: [[a.post, a.signer]] });
    return r.lines.map((l) => l.text);
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
   * oneself): each a key delivery (Envelopes type 1), a private act signed
   * with the identity's own key, sealed to the buyer and left in its inbox.
   */
  async deliver(me: TestIdentity, s: Settings): Promise<string[]> {
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    if (!Object.keys(sold).length) return [];
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const out: string[] = [];
    for (const h of me.f.homes.map((x) => x.hint)) {
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
              if (d.signer !== me.id || d.spec !== MESSAGES_SPEC || d.type !== TYPES.sale || !d.payload) break;
              const x = readSale(d.payload);
              const mine = sold[x.publication];
              if (mine && !mine.delivered[x.buyer]) {
                try {
                  mine.delivered[x.buyer] = await this.deliverKey(me, s, x.buyer, x.publication, mine.key);
                  out.push(`The key of your sealed post was delivered to ${x.buyer.slice(0, 8)}…, sealed to them: a sale your Damgar signed the receipt for.`);
                } catch (e) {
                  out.push(`The key could not be delivered to ${x.buyer.slice(0, 8)}… yet: ${message(e)}`);
                }
              }
              break;
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        // that home is away
      }
    }
    await this.store.saveMoney(me.id, 'sold', sold);
    return out;
  }

  private async deliverKey(me: TestIdentity, s: Settings, buyer: string, publication: string, key: string): Promise<string> {
    const hints = list([...me.f.homes.map((h) => h.hint), ...s.relays]);
    const l = await lookUp(buyer, hints, s.via);
    if (!l.encryptionKey) throw new Error('the buyer publishes no encryption key');
    const inbox = l.inbox(SPECS.envelopes) ?? [];
    if (!inbox.length) throw new Error('the buyer declares no inbox');
    let made: { act: Uint8Array; id: string; key: Uint8Array };
    try {
      made = me.sign(SPECS.envelopes, KEY_DELIVERY, keyDeliveryPayload(publication, key), { public: false, to: [buyer] });
    } finally {
      await this.store.saveIdentity(me);
    }
    const sealed = sealFor(made.act, made.key, [{ id: buyer, key: l.encryptionKey }]);
    let left = 0;
    for (const h of inbox) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
      } catch {
        // away
      }
    }
    for (const h of me.f.homes.map((x) => x.hint)) {
      try {
        await relayAt(h, s.via).putAct(made.act);
      } catch {
        // away
      }
    }
    if (!left) throw new Error('its inbox took nothing');
    return made.id;
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
    const offer = acts.map((a) => readOffer(a, p.seller, p.publication)).find(Boolean) ?? null;
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
      text: null,
      problem: offer ? null : 'no offer of its seller selling it was found: it cannot be bought here',
    };
    const key = p.seller === me.id ? sold[p.publication]?.key : bought[p.publication]?.key;
    if (p.seller === me.id) out.state = 'yours';
    else if (bought[p.publication]?.payment && !key) out.state = 'paying';
    if (key) {
      try {
        out.text = await openSealedText(p, key, hints, via);
        if (out.state !== 'yours') out.state = 'opened';
      } catch (e) {
        out.problem = `its key is here, but ${message(e)}`;
      }
    }
    return out;
  }

  /** Buy a sealed post under the lane: an invoice request following the seller's offer, naming the repost followed (Money claim field 6) where it was found through one. */
  async buy(me: TestIdentity, hints: string[], via: Via, a: { publication: string; seller: string; repost: { id: string; by: string } | null }): Promise<string[]> {
    const pubAct = (await followRef([a.publication, a.seller], hints, via)).act;
    const p = readSealed(pubAct);
    if (!p) throw new Error('That is not a sealed post. Nothing was signed.');
    if (p.seller === me.id) throw new Error('That post is your own. Nothing was signed.');
    const offerId = await this.offerFor(a, hints, via);
    if (!offerId) throw new Error('No offer of its seller selling it was found. Nothing was signed.');
    const offer = readOffer((await followRef([offerId, a.seller], hints, via)).act, a.seller, a.publication)!;
    const r = await this.engine.payUnderLane({ payee: a.seller, amount: offer.price, whatFor: 'a sealed post', fulfils: offer.offer, refs: [[a.publication, a.seller]], referral: a.repost ? { identity: a.repost.by, evidence: a.repost.id } : null });
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    bought[a.publication] = { key: null, payment: r.key, seller: a.seller, offer: offer.offer };
    await this.store.saveMoney(me.id, 'bought', bought);
    return [...r.lines.map((l) => l.text), ...(a.repost ? [`Your claim will name the repost you followed, by ${a.repost.by.slice(0, 8)}…: it earns the referral share the offer states, if the seller pays it.`] : [])];
  }

  /** The offer selling a publication, named beside it in the post or repost that names it. */
  private async offerFor(a: { publication: string; seller: string; repost: { id: string; by: string } | null }, hints: string[], via: Via): Promise<string | null> {
    const from = a.repost ? [a.repost.id, a.repost.by] : null;
    const names: string[] = [];
    if (from) {
      const d = describeAct((await followRef(from as [string, string], hints, via)).act) as { refs?: string[] };
      names.push(...(d.refs ?? []));
    }
    for (const id of names) {
      try {
        const o = readOffer((await followRef([id, a.seller], hints, via)).act, a.seller, a.publication);
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
    const offerAct = named.find((x) => readOffer(x, p.seller, p.publication));
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
}

