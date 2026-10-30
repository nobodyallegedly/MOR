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

import { MIRS, SPECS, Verifier, base64, cborDecode, cborEncode, describeAct, hex, openSealed, unhex } from '../../genesis/src/core.ts';
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
import { KEY_DELIVERY, PUBLICATION_ACT, checkPlayable, offerWords, openSealedBytes, postSealed, readKeyDelivery, readPublication, readSealed, repost as repostAct, type PublicationRead, type SealedRead } from '../../barebone/src/sealed.ts';
import { readTag, tagsOf, withdrawTag, type TagRead } from '../../barebone/src/tag.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import type { Keep, Settings } from './dub.ts';
import { deliverSold } from './delivery.ts';
import type { RunnerLink } from './runner.ts';
import { contestPurchase, contestSale, purchaseContests, readVow, readVowOffer, vowSales, type ContestsBeside } from './vows.ts';
import { collectiveNow, collectivePlaces } from '../../grants/src/member.ts';
import { dealOfPost, pct, readDeal, sharedLine, type DealRead } from '../../grants/src/deal.ts';
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
  /** The bake (its uploader `seller`); `publication` the same id, its name from before. */
  bake: string;
  publication: string;
  /** The price tag's version a purchase follows (`offer`, its name from before); null where none counts. */
  tag: string | null;
  offer: string | null;
  seller: string;
  price: string;
  words: string | null;
  state: 'for sale' | 'paying' | 'opened' | 'yours';
  /** The publication it is offered through, where it is (Agreements type 6): its partners paid off the top, then the owners. */
  through: { publication: string; version: string; words: string } | null;
  /** Said plainly where its uploader is no owner of the work, as the claim's ownership agreement names them (Agreements rule 14). */
  outside: string | null;
  /** The owners' own publication of the same work, where Dub has read one: buy there instead. */
  owners: { post: string; signer: string; bake: string; price: string; words: string } | null;
  /** What this identity can end on it, named by its layer: its price tag (Money), or its publication (Agreements). A bake itself is never withdrawn. */
  ends: 'tag' | 'publication' | null;
  /** The work's hash (the bake's field 1). */
  work: string;
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
  /** By the bake's id. `offer`: the price tag's version paid. */
  [bake: string]: { key: string | null; payment: string | null; seller: string; offer: string | null; contests?: string[] };
}

/**
 * What a payment for a sealed work follows, read before paying (Money rule
 * 18): the price tag that counts, its payee and price; under a publication,
 * which publication and version, its partners and owners. Null `tag` where
 * none counts, with `why`.
 */
export interface PriceRead {
  bake: SealedRead;
  tag: TagRead | null;
  /** How the core reads the tag: "counts", "nobody's offer", "unknown", or "withdrawn" (its latest version has no price). */
  standing: string;
  why: string | null;
  through: (PublicationRead & { ends: boolean }) | null;
  /** The work's ownership, where its claim's ownership agreement is read (from the post, or the publication's owners). */
  deal: DealRead | null;
  /** The bake's uploader as the core tells it (Verifier.bakeUploader). */
  uploader: string;
  /** Every act read, for whoever judges further. */
  acts: Uint8Array[];
}

/** What Dub has read of works' ownership, by work hash: the deal and where the owners sell it (their own post). */
interface OwnersSeen {
  deal: DealRead;
  post: string | null;
  signer: string | null;
  bake: string | null;
  price: string | null;
  words: string | null;
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

const short = (x: string) => `${x.slice(0, 8)}…`;

/** Said wherever something is withdrawn or nothing can be (decided 28 October 2026). */
export const BYTES_STAY = 'The bytes stay where they were uploaded unless homes and relays drop them: the bake itself is never withdrawn by the protocol.';

/** Said where a work has nothing of this identity's to end: no price tag, no publication. */
export const NOTHING_TO_END =
  'There is nothing to withdraw at the protocol level: a bake is never withdrawn, its bytes staying where they were uploaded unless homes and relays drop them, and no price tag or publication of yours sells it. A profile’s picture is changed by a later profile simply naming another picture.';

/** An act by id from the first of these places that holds it. */
async function actAt(id: string, places: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of places) {
    const a = await relayAt(h, via).getAct(id).catch(() => null);
    if (a) return a;
  }
  return null;
}

/** The publications (Agreements type 6) in `signer`'s feed at these places, read, with their acts. */
async function publicationsBy(signer: string, places: string[], via: Via): Promise<{ p: PublicationRead; act: Uint8Array }[]> {
  const out = new Map<string, { p: PublicationRead; act: Uint8Array }>();
  for (const h of places) {
    let after: number | undefined;
    for (let i = 0; i < 200; i++) {
      const page = await relayAt(h, via).feed({ signer, after }).catch(() => null);
      if (!page) break;
      for (const it of page.items) {
        if (it.kind !== 'act') continue;
        const p = readPublication(it.item);
        if (p && p.drafter === signer) out.set(p.id, { p, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  return [...out.values()];
}

/** The latest version of a publication on its drafter's line (each later version naming the one before), with every version's act. */
async function publicationLine(first: string, drafter: string, places: string[], via: Via): Promise<{ latest: PublicationRead | null; acts: Uint8Array[] }> {
  const all = (await publicationsBy(drafter, places, via)).filter((x) => x.p.first === first || x.p.id === first);
  let at = all.find((x) => x.p.id === first)?.p ?? null;
  for (let i = 0; at && i < 1024; i++) {
    const next = all.filter((x) => x.p.previous === at!.id);
    if (next.length !== 1) break; // none, or a fork: the last before it
    at = next[0].p;
  }
  return { latest: at, acts: all.map((x) => x.act) };
}

/** The publications of `drafter` selling a bake, each at its latest version. */
async function publicationsSelling(bake: string, drafter: string, places: string[], via: Via): Promise<{ first: string; latest: PublicationRead }[]> {
  const all = await publicationsBy(drafter, places, via);
  const firsts = list(all.filter((x) => x.p.bakes.includes(bake)).map((x) => x.p.first));
  const out: { first: string; latest: PublicationRead }[] = [];
  for (const f of firsts) {
    const l = await publicationLine(f, drafter, places, via);
    if (l.latest) out.push({ first: f, latest: l.latest });
  }
  return out;
}

/**
 * The one line a buyer or tipper reads before paying through a publication:
 * its split service pays its partners first, off the top, then the owners
 * (by their shares in the ownership agreement, or its lone seller).
 */
export function throughLine(d: DealRead & { partners?: { identity: string; share: number; label: string | null }[] }, names: (id: string) => string): string {
  const partners = (d.partners ?? []).map((p) => `${names(p.identity)} ${pct(p.share)}${p.label ? `, “${p.label}”` : ''}`);
  const owners = d.owners.map(([id, n]) => (d.owners.length > 1 ? `${names(id)} (${pct(n)})` : names(id)));
  return `Through the publication where you found it: its split service${d.service ? `, ${names(d.service)},` : ''} pays ${partners.length ? `its partners first (${partners.join('; ')}), then ` : ''}the owners: ${owners.join(', ')}.`;
}

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
   * why. A work found through a publication (the post names it, or a price
   * tag under it): the tip goes through that publication, not to whoever
   * posted it (decided: "with a tip IF there is a split the target is the
   * agreement not the act"; Money rule 18: "a payment naming a publication
   * itself, without a tag, is a tip through the publication: no purchase,
   * divided as the publication's split says"). It is paid to the
   * publication's split service, naming the publication, and the service
   * pays its partners first, then the owners; said in one line before
   * paying. A tip to a person's own post is unchanged.
   */
  async tip(a: { post: string; signer: string; amount: { unit: string; value: number }; whatFor: string | null; deal?: DealRead | null; names?: (id: string) => string }): Promise<string[]> {
    const t = a.deal?.publication && a.deal.service ? a.deal : null;
    if (t) {
      const r = await this.engine.payUnderLane({ payee: t.service!, amount: a.amount, whatFor: a.whatFor ?? 'a tip to a work', fulfils: t.publication!, refs: [[a.post, a.signer]] });
      return [throughLine(t, a.names ?? short), 'The tip goes through the publication where you found it, not to the one who posted it: no purchase, nothing owed back.', ...r.lines.map((l) => l.text)];
    }
    const r = await this.engine.payUnderLane({ payee: a.signer, amount: a.amount, whatFor: a.whatFor, refs: [[a.post, a.signer]] });
    return r.lines.map((l) => l.text);
  }

  /**
   * The publication a post's work was found through, with its owners where
   * it names an ownership agreement: from what the post names (a
   * publication, a price tag under one, or a work's ownership agreement).
   * Null for a person's own post. Its `publication` is the founding version,
   * what a tip through it names; its `service` the split service paid.
   */
  async dealOf(post: string, signer: string, hints: string[], via: Via): Promise<DealRead | null> {
    try {
      const act = (await followRef([post, signer], hints, via)).act;
      const named = await this.named(act, hints, via);
      // A publication named directly, or through a price tag under it.
      let pub: PublicationRead | null = named.map(readPublication).find((x) => x && !x.ends) ?? null;
      if (!pub) {
        const t = named.map(readTag).find((x) => x?.publication);
        const pa = t?.publication ? await actAt(t.publication, hints, via) : null;
        pub = pa ? readPublication(pa) : null;
      }
      if (pub) {
        const deal = pub.owners ? await readDeal(pub.owners, hints, via, pub.id).catch(() => null) : null;
        if (deal) return { ...deal, publication: pub.first, service: pub.service, payee: pub.service };
        // A lone seller's publication: its drafter is the lone owner.
        return { version: pub.id, name: null, text: pub.words ?? '', parties: [pub.drafter], owners: [[pub.drafter, 1_000_000]], claim: null, publication: pub.first, payee: pub.service, service: pub.service, referral: 0, partners: pub.partners } as DealRead;
      }
      return await dealOfPost(act, hints, via);
    } catch {
      return null;
    }
  }

  /** The acts a post names in its refs, fetched (each from its signer's places where named). */
  private async named(post: Uint8Array, hints: string[], via: Via): Promise<Uint8Array[]> {
    const d = describeAct(post) as { refs?: string[]; refSigners?: (string | undefined)[] };
    const out: Uint8Array[] = [];
    await Promise.all(
      (d.refs ?? []).map(async (id, i) => {
        try {
          out[i] = (await followRef(d.refSigners?.[i] ? [id, d.refSigners[i]!] : id, hints, via)).act;
        } catch {
          // not found
        }
      }),
    );
    return out.filter(Boolean);
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

  /**
   * Seal a post with a price: the bake (its key absent), the uploader's price
   * tag on it (Money type 5: on a bare bake, paying it pays the uploader,
   * unsplit), the post naming both; the key kept here, to be delivered on
   * each sale. `publication` and `offer` in the answer: the bake and the tag,
   * their names from before.
   */
  async sell(me: TestIdentity, s: Settings, a: { text: string; teaser: string; price: { unit: string; value: number }; referral: number | null }): Promise<{ post: string; bake: string; tag: string; publication: string; offer: string; lines: string[] }> {
    if (!Number.isSafeInteger(a.price.value) || a.price.value <= 0) throw new Error('A price is a whole amount above zero. Nothing was posted.');
    if (a.referral !== null && (!Number.isInteger(a.referral) || a.referral < 1 || a.referral > 99)) throw new Error('A referral share is a whole percentage, 1 to 99. Nothing was posted.');
    const priceSaid = say(a.price, new Set([a.price.unit]));
    const made = await postSealed(me, { text: a.text, teaser: a.teaser, price: a.price, words: offerWords(priceSaid, a.referral), relays: s.relays });
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    sold[made.bake] = { key: made.key, offer: made.tag, post: made.post, delivered: {} };
    await this.store.saveMoney(me.id, 'sold', sold);
    return {
      post: made.post,
      bake: made.bake,
      tag: made.tag,
      publication: made.bake,
      offer: made.tag,
      lines: [
        `Posted, sealed: ${priceSaid} to open it, by your price tag on it. Its words are public; its text opens only with its key, which Dub keeps and delivers to each buyer once your Damgar has signed the receipt.`,
        a.referral ? `Your words promise ${a.referral}% of the price to the repost a buyer names: Damgar prepares that payment when it signs the receipt. A promise in words, not judged by the core (F351).` : 'No referral share.',
        'To stop selling it, withdraw the price tag (its menu): the bake stays where it was uploaded.',
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

  /**
   * What a payment for a sealed work would follow, read from the acts a feed
   * item names (Money rule 18): the bake, then the price tag that counts.
   * Under a publication (the item names one selling the bake, or a tag under
   * one), only the split service's tag or the designated party's counts,
   * judged by the core (`agreementsTagUnder`). On a bare bake, only its
   * uploader's latest tag counts (`priceTag`), and paying it pays the
   * uploader, unsplit. A tag whose latest version carries no price is
   * withdrawn: nothing to buy.
   */
  async priceOf(hints: string[], via: Via, refs: { id: string; signer?: string }[], post?: Uint8Array | null): Promise<PriceRead | null> {
    const acts: Uint8Array[] = [];
    await Promise.all(
      refs.map(async (r, i) => {
        try {
          acts[i] = (await followRef(r.signer ? [r.id, r.signer] : r.id, hints, via)).act;
        } catch {
          // not found
        }
      }),
    );
    const named = acts.filter(Boolean);
    const bakeAct = named.find((a) => readSealed(a));
    if (!bakeAct) return null;
    const bake = readSealed(bakeAct)!;
    const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
    const held: Uint8Array[] = [...named];
    const look = async (id: string) => {
      await lookUp(id, hints, via, v).catch(() => null);
    };
    await look(bake.seller);
    v.add(bakeAct);
    const uploader = v.bakeUploader(bake.bake) ?? bake.seller;
    // A publication selling it, named by the item or by a tag under it.
    let pubAct = named.find((a) => readPublication(a)?.bakes.includes(bake.bake)) ?? null;
    if (!pubAct) {
      const t = named.map(readTag).find((x) => x?.publication);
      const a = t?.publication ? await actAt(t.publication, hints, via) : null;
      if (a && readPublication(a)?.bakes.includes(bake.bake)) pubAct = a;
    }
    const out: PriceRead = { bake, tag: null, standing: 'none', why: null, through: null, deal: null, uploader, acts: held };
    if (post) out.deal = await dealOfPost(post, hints, via).catch(() => null);
    if (pubAct) {
      const first = readPublication(pubAct)!;
      // The latest version on its drafter's line: a later one selling nothing ends it.
      const line = await publicationLine(first.first, first.drafter, hints, via);
      const pub = line.latest ?? first;
      out.through = { ...pub, ends: pub.ends };
      held.push(...line.acts);
      if (pub.owners && !out.deal) out.deal = await readDeal(pub.owners, hints, via, pub.id).catch(() => null);
      if (pub.ends) {
        out.why = 'the publication it was offered through has ended: a later version sells nothing';
        return out;
      }
      // Its tag: the split service's, or the designated party's (Money rule 18).
      const signers = list([pub.service, ...(pub.designated ? [pub.designated] : [])]);
      const tags = await Promise.all(signers.map((x) => tagsOf({ publication: pub.first }, x, hints, via)));
      for (const t of tags) held.push(...t.acts);
      const latest = tags.map((t) => t.latest).find((t) => t) ?? named.map(readTag).find((t) => t?.publication === pub.first) ?? null;
      out.tag = latest;
      if (!latest) {
        out.why = 'no price tag of the publication’s split service was found: it cannot be bought here';
        return out;
      }
      // Judged by the core: every party's signature acts held, as the split service's tag counts only under a publication that counts.
      for (const x of list([pub.drafter, pub.service, ...pub.partners.map((p) => p.identity), ...(pub.designated ? [pub.designated] : []), ...(out.deal?.parties ?? [])])) {
        await look(x);
        for (const h of hints) {
          const page = await relayAt(h, via).feed({ signer: x }).catch(() => null);
          for (const it of page?.items ?? []) if (it.kind === 'act') held.push(it.item);
        }
      }
      for (let pass = 0; pass < 3; pass++) for (const a of held) try { v.add(a); } catch { /* held, or waits */ }
      let verdict = 'unknown';
      try {
        verdict = (v.agreementsTagUnder(AGREEMENTS_SPECS, latest.id) as { verdict: string }).verdict;
      } catch {
        // the core cannot say
      }
      out.standing = latest.price ? verdict : 'withdrawn';
      if (!latest.price) out.why = 'its price tag is withdrawn: a later version carries no price';
      else if (verdict !== 'counts') out.why = verdict === "nobody's offer" ? 'its price tag is nobody’s offer under the publication (signed by someone other than its split service or designated party)' : 'whether its price tag counts under the publication is unknown here: its parties’ signatures were not all found';
      return out;
    }
    // A bare bake: only its uploader's tag counts.
    const mine = await tagsOf({ bake: bake.bake }, uploader, hints, via);
    held.push(...mine.acts);
    out.tag = mine.latest;
    if (!mine.latest) {
      out.why = named.some((a) => readTag(a)?.bake === bake.bake) ? 'the price tag it names is not its uploader’s: nobody’s offer, it buys nothing' : 'no price tag of its uploader was found: it cannot be bought here';
      return out;
    }
    for (const a of mine.acts) try { v.add(a); } catch { /* held */ }
    out.standing = mine.latest.price ? (v.priceTag(mine.latest.id) ?? 'unknown') : 'withdrawn';
    if (!mine.latest.price) out.why = 'its uploader withdrew its price tag: a later version carries no price';
    else if (out.standing !== 'counts') out.why = `its price tag is ${out.standing}`;
    return out;
  }

  /** A sealed post a feed item names, read: its bake, the price tag a purchase follows, and where this identity stands with it. */
  async read(me: TestIdentity, hints: string[], via: Via, refs: { id: string; signer?: string }[], post?: Uint8Array | null): Promise<SealedShown | null> {
    const pr = await this.priceOf(hints, via, refs, post);
    if (!pr) return null;
    const p = pr.bake;
    const sold = (await this.store.money<Sold>(me.id, 'sold')) ?? {};
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    const counts = pr.tag?.price && pr.standing === 'counts' ? pr.tag : null;
    const names = (x: string) => short(x);
    const out: SealedShown = {
      bake: p.bake,
      publication: p.bake,
      tag: counts?.id ?? null,
      offer: counts?.id ?? null,
      seller: p.seller,
      price: counts?.price ? say(counts.price, new Set([counts.price.unit])) : pr.tag?.price ? say(pr.tag.price, new Set([pr.tag.price.unit])) : 'no price stated',
      words: pr.through?.words ?? null,
      state: 'for sale',
      media: p.media,
      text: null,
      picture: null,
      problem: counts ? null : (pr.why ?? 'no price tag that counts was found: it cannot be bought here'),
      through: pr.through ? { publication: pr.through.first, version: pr.through.id, words: throughLine(this.asDeal(pr), names) } : null,
      outside: null,
      owners: null,
      ends: null,
      work: p.work,
    };
    // Its ownership, where read: said plainly when its uploader is none of the owners (Agreements rule 14).
    if (pr.deal) {
      const pd = post ? (describeAct(post) as { id: string; signer?: string }) : null;
      await this.ownersSeen(pr.deal, p.work, hints, via, pd ? { post: pd.id, signer: pd.signer ?? null, bake: p.bake, price: counts ? out.price : null, words: pr.through?.words ?? null } : null);
    }
    this.outsideOf(out, pr.uploader, me.id);
    if (p.seller === me.id) {
      out.state = 'yours';
      if (pr.through && !pr.through.ends && pr.through.drafter === me.id) out.ends = 'publication';
      else if (!pr.through && pr.tag?.price && pr.tag.signer === me.id) out.ends = 'tag';
    }
    const key = p.seller === me.id ? sold[p.bake]?.key : bought[p.bake]?.key;
    if (p.seller !== me.id && bought[p.bake]?.payment && !key) out.state = 'paying';
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

  /** The ownership Dub has read, by work hash (this app's memory only): where a re-upload of the same work is met, its owners and their own publication are known. */
  private owned = new Map<string, OwnersSeen>();

  /** Keep what was read of a work's owners: its claim's work hash, from the claim itself. */
  private async ownersSeen(deal: DealRead, work: string, hints: string[], via: Via, own: { post: string; signer: string | null; bake: string; price: string | null; words: string | null } | null): Promise<void> {
    let w = work;
    if (deal.claim) {
      const c = await actAt(deal.claim, hints, via);
      const d = c ? (describeAct(c) as { payload?: Uint8Array }) : null;
      const x = d?.payload ? (cborDecode(d.payload) as Map<number, unknown>).get(0) : null;
      if (x instanceof Uint8Array) w = hex(x);
    }
    const before = this.owned.get(w);
    const holders = deal.owners.map(([h]) => h);
    // Their own publication: the one sold by one of the owners, naming the ownership agreement.
    const theirs = own && own.signer && holders.includes(own.signer) && own.price ? own : null;
    this.owned.set(w, { deal, post: theirs?.post ?? before?.post ?? null, signer: theirs?.signer ?? before?.signer ?? null, bake: theirs?.bake ?? before?.bake ?? null, price: theirs?.price ?? before?.price ?? null, words: theirs?.words ?? before?.words ?? null });
  }

  /**
   * Where a sealed work's uploader is none of its owners, as the claim's
   * ownership agreement names them (Verifier.bakeUploader, compared with the
   * agreement's holders): said plainly, before paying (Agreements rule 14),
   * and the owners' own publication offered, where Dub has read one.
   */
  outsideOf(out: SealedShown, uploader: string, me: string): void {
    const seen = this.owned.get(out.work);
    if (!seen) return;
    const owners = seen.deal.owners;
    if (!owners.length || owners.some(([h]) => h === uploader)) return;
    const who = owners.map(([h, n]) => `${h === me ? 'you' : short(h)} (${pct(n)})`).join(', ');
    out.outside = `Its uploader, ${uploader === me ? 'you' : short(uploader)}, is not one of this work’s owners as its claim’s ownership agreement names them: ${who}. Paying here pays the uploader alone, outside that agreement; the owners are paid nothing of it.`;
    if (seen.post && seen.signer && seen.bake && seen.bake !== out.bake) out.owners = { post: seen.post, signer: seen.signer, bake: seen.bake, price: seen.price ?? 'its price', words: `The owners sell it themselves, through their own publication: ${seen.price ?? 'its price'}.` };
  }

  /** A price read as the deal line's shape (`throughLine`). */
  private asDeal(pr: PriceRead): DealRead & { partners?: PublicationRead['partners'] } {
    const t = pr.through!;
    if (pr.deal) return { ...pr.deal, publication: t.first, service: t.service, payee: t.service, partners: t.partners };
    return { version: t.id, name: null, text: t.words ?? '', parties: [t.drafter], owners: [[t.drafter, 1_000_000]], claim: null, publication: t.first, payee: t.service, service: t.service, referral: 0, partners: t.partners };
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
    const key = p.seller === me.id ? sold[p.bake]?.key : bought[p.bake]?.key;
    if (!key) throw new Error('its key is not here: it opens once its seller’s Damgar signs the receipt');
    const bytes = await openSealedBytes(p, key, hints, via);
    checkPlayable(p.media, bytes);
    return { b64: base64(bytes), type: p.media === 'video' ? 'video/mp4' : 'audio/mp4' };
  }

  /**
   * What a purchase pays, before anything is signed (Money rule 18): the
   * price tag that counts, followed (`fulfils`), its price, to its payee; under
   * a publication, the purchase names the publication and the version read
   * (`[first, version]`), and the split service, the tag's payee, pays its
   * partners first, then the owners. Throws, saying why, where nothing can
   * be bought.
   */
  async purchaseOf(me: TestIdentity, hints: string[], via: Via, a: { publication: string; seller: string; post?: string | null; repost?: { id: string; by: string } | null }): Promise<{ payee: string; amount: { unit: string; value: number }; fulfils: string; purchase: [string, string] | null; said: string[]; read: PriceRead }> {
    const from = a.repost ? [a.repost.id, a.repost.by] : a.post ? [a.post, a.seller] : null;
    const postAct = from ? (await followRef(from as [string, string], hints, via)).act : null;
    const refs: { id: string; signer?: string }[] = [{ id: a.publication, signer: a.seller }];
    if (postAct) {
      const d = describeAct(postAct) as { refs?: string[]; refSigners?: (string | undefined)[] };
      for (const [i, id] of (d.refs ?? []).entries()) if (id !== a.publication) refs.push({ id, signer: d.refSigners?.[i] });
    }
    const pr = await this.priceOf(hints, via, refs, postAct);
    if (!pr) throw new Error('That is not a sealed work. Nothing was signed.');
    if (pr.bake.seller === me.id) throw new Error('That work is your own upload. Nothing was signed.');
    if (!pr.tag?.price || pr.standing !== 'counts') throw new Error(`It cannot be bought: ${pr.why ?? 'no price tag that counts was found'}. Nothing was signed.`);
    const said: string[] = [];
    if (pr.through) said.push(throughLine(this.asDeal(pr), short));
    const shown: SealedShown = { work: pr.bake.work, publication: pr.bake.bake, outside: null, owners: null } as SealedShown;
    if (pr.deal) await this.ownersSeen(pr.deal, pr.bake.work, hints, via, null);
    this.outsideOf(shown, pr.uploader, me.id);
    if (shown.outside) said.push(shown.outside);
    return { payee: pr.tag.payee, amount: pr.tag.price, fulfils: pr.tag.id, purchase: pr.through ? [pr.through.first, pr.through.id] : null, said, read: pr };
  }

  /** Buy a sealed work under the lane: an invoice request following its price tag, naming the repost followed (Money claim field 6) where it was found through one. */
  async buy(me: TestIdentity, hints: string[], via: Via, a: { publication: string; seller: string; repost: { id: string; by: string } | null; post?: string | null; names?: (id: string) => string }): Promise<string[]> {
    const x = await this.purchaseOf(me, hints, via, a);
    const r = await this.engine.payUnderLane({ payee: x.payee, amount: x.amount, whatFor: x.read.through ? 'a work, through its publication' : 'a sealed post', fulfils: x.fulfils, refs: [[a.publication, a.seller]], referral: a.repost ? { identity: a.repost.by, evidence: a.repost.id } : null, purchase: x.purchase });
    const bought = (await this.store.money<Bought>(me.id, 'bought')) ?? {};
    bought[a.publication] = { key: null, payment: r.key, seller: a.seller, offer: x.fulfils };
    await this.store.saveMoney(me.id, 'bought', bought);
    return [...x.said, ...r.lines.map((l) => l.text), ...(a.repost ? [`Your claim will name the repost you followed, by ${a.repost.by.slice(0, 8)}…: it earns a referral share where the publication's split plan has one.`] : [])];
  }

  /**
   * End what this identity sells a work by, named by its layer (decided 28
   * October 2026; Nobody, allegedly, 30 October: "Yes, or even withdraw
   * publication could also work"): its price tag on a bare bake (a later
   * version with no price, Money rule 18), or its publication (a later
   * version selling nothing, Agreements; it ends once every party signs it).
   * A bake itself is never withdrawn: the bytes stay where they were
   * uploaded unless homes and relays drop them.
   */
  async end(me: TestIdentity, s: Settings, hints: string[], bake: string): Promise<{ id: string; ended: 'tag' | 'publication'; lines: string[] }> {
    const relays = list([...s.relays, ...me.f.homes.map((h) => h.hint)]);
    const tags = await tagsOf({ bake }, me.id, list([...hints, ...relays]), s.via);
    if (tags.latest?.price) {
      const w = await withdrawTag(me, tags.latest, relays);
      return { id: w.id, ended: 'tag', lines: [`Price tag withdrawn: version ${w.version} carries no price, so a payment of it buys nothing.`, BYTES_STAY] };
    }
    const mine = await publicationsSelling(bake, me.id, list([...hints, ...relays]), s.via);
    const open = mine.find((x) => !x.latest.ends);
    if (!open) throw new Error(`${NOTHING_TO_END} Nothing was signed.`);
    const prev = (await actAt(open.latest.id, list([...hints, ...relays]), s.via))!;
    const m = cborDecode((describeAct(prev) as { payload: Uint8Array }).payload) as Map<number, unknown>;
    m.set(0, []);
    const objects: [string, string][] = [[open.latest.first, open.latest.id], ...(open.latest.owners ? [[open.latest.owners, open.latest.owners] as [string, string]] : [])];
    const made = await me.publish(MIRS.agreements, PUBLICATION_ACT, cborEncode(m), { public: true, relays, objects });
    const others = list([open.latest.service, ...open.latest.partners.map((p) => p.identity), ...(open.latest.designated ? [open.latest.designated] : [])]).filter((x) => x !== me.id);
    return {
      id: made.id,
      ended: 'publication',
      lines: [
        `Publication withdrawn: a later version that sells nothing, signed by you. It ends the publication once every party signs it too${others.length ? ` (${others.map(short).join(', ')})` : ''}, as the first version needed.`,
        BYTES_STAY,
      ],
    };
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
    // What sells it: its price tag (on a bare bake), or the publication it is offered through.
    const offerAct = named.find((x) => readTag(x)?.bake === p.bake || readTag(x)?.publication) ?? named.find((x) => readPublication(x)?.bakes.includes(p.bake));
    if (!offerAct) throw new Error('That post names no price tag or publication selling it. Nothing was reposted.');
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
    return { id: made.id, lines: [`Reposted at your relays (${s.relays.join(', ')}), with the sealed post and its price tag held there too: a reader of those relays finds it through you. A buyer who names your repost earns you a referral share where the publication's split plan has one.`] };
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
    // Under a publication, every party is held too: a tag under it counts only where the publication counts, signed by every party (Agreements rule 11).
    const parties: string[] = [];
    for (const b of Object.values(bought)) {
      if (!b.offer) continue;
      try {
        const t = readTag((await followRef(b.offer, hints, via)).act);
        const pa = t?.publication ? await actAt(t.publication, hints, via) : null;
        const pub = pa ? readPublication(pa) : null;
        if (pub) parties.push(pub.drafter, pub.service, ...pub.partners.map((x) => x.identity));
        const d = pub?.owners ? await readDeal(pub.owners, hints, via) : null;
        if (d) parties.push(...d.parties);
      } catch {
        // its tag was not found: held as before
      }
    }
    const r = await purchaseContests({ purchases, parties: list([me.id, ...purchases.map((p) => bought[p.publication].seller), ...parties]), relays: hints, via });
    const paid: Record<string, ContestsBeside> = {};
    for (const p of purchases) paid[p.publication] = r.by[p.id] ?? { state: 'unknown', contests: [], why: 'its claim could not be read' };
    return { paid, problems: r.problems };
  }

}

