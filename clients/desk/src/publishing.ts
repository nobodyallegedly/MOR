// Edubba's Publishing tab (round 3, part B; F339, F347; decided by Nobody,
// allegedly, 17 October 2026: "Let's add a publishing tab. With option to
// select the identity that acts (collective or individual)").
//
// **Protected files.** A work sealed under terms: its bytes locked (the
// Envelopes "Media" rule: the publication public, its media key absent,
// delivered to each buyer), its price in the publication, and an offer
// selling it. The work is a text or a JPEG picture: the media modules Edubba
// and Dub carry (decided by Nobody, allegedly, 19 October 2026: "Keep it to
// the modules supported by the app, in the future the app will be able to
// add them as plugins").
//
// - **As oneself**, the offer is a lone seller's (Agreements rule 11, F215):
//   itself the agreement with the buyer. The buyer pays from Dub (under its
//   lane) or Damgar; the seller's Damgar signs the receipt and tells the
//   seller's apps of the sale (the money messages cMIP, type 6); Edubba then
//   delivers the key, sealed to the buyer (`../../dub/src/delivery.ts`, the
//   code Dub delivers with).
// - **As a collective** one belongs to, the acts are the collective's, each
//   signed with this member's own key for it (F353): the publication in the
//   area reaching publications, the offer in the area reaching offers, made
//   under the agreement in force (field 0) and paying the collective (field
//   3). The work's key is delivered at once to every member, sealed to each
//   (a key delivery of the collective's: rule 57, a collective keeps no
//   secret from its members), so any member's app can deliver it to a buyer.
//   How a buyer's payment reaches the collective and its members is its
//   split service's (part C).
//
// Nothing is signed before it is read back in plain words, with its digest.
//
// TEST IDENTITIES ONLY.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { MIRS, SPECS, cborEncode, sha256, unhex } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readId } from '../../genesis/src/forms.ts';
import { carryChain } from '../../repo/src/agreements.ts';
import { KEY_DELIVERY, OFFER, keyDeliveryPayload, lockWork, offerPayload, type SealedMedia } from '../../barebone/src/sealed.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { NotJpeg } from '../../../modules/jpeg/src/jpeg.ts';
import { areaReaching, chainFor, collectiveNow, collectivePlaces, memberKeyFor, publishAt, readMemberKeys, signAsMember, type AreaHere, type MemberKey } from '../../grants/src/member.ts';
import { actors, chosen, type Actor } from '../../ummia/src/acting.ts';
import { deliverSold, type SoldWorks } from '../../dub/src/delivery.ts';
import { VOW, contestSale, publishVow, vowOfferWords, vowPayload, vowSales, type VowShown } from '../../dub/src/vows.ts';
import { say } from '../../damgar/src/units.ts';
import { REGTEST_UNIT } from './grid.ts';
import type { Line, Reading } from '../../collective/src/explain.ts';
import type { Desk, Done } from './desk.ts';
import type { Real } from './real.ts';
import type { Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];

/** The largest file Edubba seals: the relays' media limit is theirs; this keeps a page's upload sensible (a reading, the build's). */
export const MAX_WORK = 8 * 1024 * 1024;

/** Said on the Publishing tab, word for word. */
export const PUBLISHING_SAY = [
  'A protected file is published locked: anyone sees its offer and its price; its bytes open only with its key, delivered to each buyer once paid. A text, or a JPEG picture: the kinds Edubba and Dub carry. More kinds come later, as the apps learn them.',
  'As yourself, your offer is itself the agreement with the buyer (a lone seller’s offer). The buyer pays from Dub or Damgar; your Damgar signs the receipt, and Edubba delivers the key, sealed to the buyer, when you open this tab.',
  'As a collective you belong to, the publication and its offer are the collective’s, signed with your own key for it, each in the area that reaches it; the offer is made under its agreement in force and pays the collective. The key is sealed at once to every member: a collective keeps no secret from its members.',
];

/** A protected file published here. */
export interface WorkHere {
  publication: string;
  offer: string;
  post: string;
  /** Who signed: an identity held here, or a collective (signed with `member`'s key). */
  as: string;
  member: string;
  collective: boolean;
  media: SealedMedia;
  title: string;
  price: number;
  words: string;
  relays: string[];
  at: number;
  /** As oneself: the key, kept here to deliver to each buyer, and the deliveries (buyer → act). */
  key: string | null;
  delivered: Record<string, string>;
  /** As a collective: the key delivery sealed to every member. */
  toMembers: string | null;
}

interface Book {
  /** The identity held here acting, and the one chosen to sign (itself, or a collective it belongs to). */
  acting: string | null;
  as: string | null;
  /** Collectives added by ID, per identity held: those it acts for here. */
  collectives: Record<string, string[]>;
  works: WorkHere[];
  vows: VowHere[];
}

/** A vow published here (round 3). */
export interface VowHere {
  vow: string;
  offer: string;
  post: string;
  as: string;
  member: string;
  collective: boolean;
  words: string;
  title: string;
  price: number;
  at: number;
}

const NO_BOOK = (): Book => ({ acting: null, as: null, collectives: {}, works: [], vows: [] });

/** A review waiting for its confirmation. */
interface Plan {
  digest: string;
  expires: number;
  run(): Promise<Done>;
}

const PLAN_LIFE = 15 * 60 * 1000;

/** A collective as the chooser offers it: available where this member's key and the areas it needs are found. */
interface CollectiveHere {
  id: string;
  places: string[];
  agreement: string | null;
  key: MemberKey | null;
  /** The areas reaching a publication and an offer (rule 60). */
  publishing: AreaHere | null;
  offers: AreaHere | null;
  /** The area reaching vows (Envelopes type 5). */
  vows: AreaHere | null;
  why: string | null;
}

export class Publishing {
  private plans = new Map<string, Plan>();

  constructor(
    private desk: Desk,
    private store: Store,
    private real: Real | null = null,
  ) {}

  // ------------------------------------------------------------ the book

  private file() {
    return this.store.path('publishing.json');
  }

  private book(): Book {
    const f = this.file();
    return existsSync(f) ? { ...NO_BOOK(), ...(JSON.parse(readFileSync(f, 'utf8')) as Book) } : NO_BOOK();
  }

  private save(b: Book) {
    mkdirSync(this.store.path(), { recursive: true });
    writeFileSync(this.file(), `${JSON.stringify(b, null, 2)}\n`, { mode: 0o600 });
  }

  private settings(): { relays: string[]; homes: string[]; via: Via } {
    const s = this.store.settings();
    const homes = s.homes.map((h) => h.hint);
    return { relays: s.relays.length ? s.relays : homes, homes, via: s.via };
  }

  /** The identities held here that may act: every one but the agents' (theirs is the Agents tab). */
  private held(): string[] {
    return this.store
      .book()
      .identities.map((i) => i.id)
      .filter((id) => !this.store.isAgent(id));
  }

  private me(id: string): TestIdentity {
    if (!this.store.holds(id)) throw new Error('Edubba does not hold that identity.');
    return this.store.identity(id);
  }

  /** Real collectives founded here whose members include `id`, and those added by ID for it. */
  private collectiveIds(id: string, b: Book): string[] {
    const here = this.real ? this.real.collectives().filter((c) => this.real!.collective(c.id).f.members.includes(id)).map((c) => c.id) : [];
    return list([...here, ...(b.collectives[id] ?? [])]);
  }

  /** A collective as `me` would act for it here: its places, its agreement in force, the areas reaching publications and offers, and `me`'s own key for it. */
  private async collectiveHere(me: TestIdentity, id: string): Promise<CollectiveHere> {
    const s = this.settings();
    const places = await collectivePlaces(id, list([...s.relays, ...s.homes]), s.via);
    const [p, o, w] = await Promise.all([
      areaReaching(id, places, { spec: SPECS.envelopes, type: PUBLICATION }, s.via).catch(() => ({ agreement: null, area: null })),
      areaReaching(id, places, { spec: MIRS.agreements, type: OFFER }, s.via).catch(() => ({ agreement: null, area: null })),
      areaReaching(id, places, { spec: SPECS.envelopes, type: VOW }, s.via).catch(() => ({ agreement: null, area: null })),
    ]);
    const keys = await readMemberKeys(me.id, me.f.encryption.map((e) => unhex(e.secret)), me.f.homes.map((h) => h.hint), s.via).catch(() => []);
    const key = keys.length ? await memberKeyFor(keys, id, places, s.via).catch(() => null) : null;
    let why: string | null = null;
    if (!p.agreement) why = 'its agreement in force could not be read from its relays and homes';
    else if (!p.area) why = 'no area of its constitution reaches publications: they would count only on its own key';
    else if (!p.area.holders.includes(me.id)) why = `you hold no box in its area reaching publications (“${p.area.name}”)`;
    else if (!o.area) why = 'no area of its constitution reaches offers (the Agreements layer, or offers): an offer would count only on its own key';
    else if (!o.area.holders.includes(me.id)) why = `you hold no box in its area reaching offers (“${o.area.name}”)`;
    else if (!key) why = 'no key of yours for it was found sealed to you at your homes: it is made when you sign its founding or a member change';
    return { id, places, agreement: p.agreement, key, publishing: p.area, offers: o.area, vows: w.area, why };
  }

  // ------------------------------------------------------------ who acts

  /** The tab's state: who acts (the identities held, and the collectives the one acting belongs to), and what was published here. */
  state(): Promise<{ actors: Actor[]; acting: string | null; as: string | null; works: WorkHere[]; vows: VowHere[]; held: string[]; say: string[]; unit: string }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const held = this.held();
      const acting = b.acting && held.includes(b.acting) ? b.acting : (held[0] ?? null);
      const cs: { id: string; available: boolean; why: string | null }[] = [];
      if (acting) {
        const me = this.me(acting);
        for (const id of this.collectiveIds(acting, b)) {
          const c = await this.collectiveHere(me, id).catch((e) => ({ why: err(e) }) as Partial<CollectiveHere>);
          cs.push({ id, available: !c.why, why: c.why ?? null });
        }
      }
      const all = actors(acting ? [acting] : [], cs);
      const as = chosen(all, b.as ?? acting)?.id ?? null;
      return { actors: all, acting, as, works: b.works.filter((w) => w.member === acting || w.as === acting), vows: b.vows.filter((w) => w.member === acting || w.as === acting), held, say: PUBLISHING_SAY, unit: say({ unit: REGTEST_UNIT, value: 2 }, new Set([REGTEST_UNIT])).replace(/^2 /, '') };
    });
  }

  /** Act as an identity held here, or as a collective it belongs to. */
  actAs(id: string): Promise<{ lines: Line[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const target = readId(id);
      if (this.held().includes(target)) {
        b.acting = target;
        b.as = target;
        this.save(b);
        return { lines: [{ text: `Acting as ${this.store.names()(target)}.`, tone: 'ok' }] };
      }
      const acting = b.acting ?? this.held()[0];
      if (!acting || !this.collectiveIds(acting, b).includes(target)) throw new Error('That is neither an identity held here nor a collective it acts for: add the collective by its ID first.');
      b.as = target;
      this.save(b);
      return { lines: [{ text: `Acting as the collective ${short(target)}, with your own key for it.`, tone: 'ok' }] };
    });
  }

  /** Act for a collective by its ID: kept where the identity acting holds the areas reaching publications and offers, and its own key for it is found. */
  collectiveAdd(typed: string): Promise<{ lines: Line[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const acting = b.acting ?? this.held()[0];
      if (!acting) throw new Error('No identity is held here: bring one on the Identities tab.');
      const id = readId(typed);
      const c = await this.collectiveHere(this.me(acting), id);
      if (c.why) throw new Error(`The collective ${short(id)}: ${c.why}. Nothing was kept.`);
      b.collectives[acting] = list([...(b.collectives[acting] ?? []), id]);
      b.as = id;
      this.save(b);
      return {
        lines: [
          {
            text: `Edubba publishes for ${short(id)} with your own key for it: publications through its area “${c.publishing!.name}” (${c.publishing!.number} key${c.publishing!.number === 1 ? '' : 's'}), offers through “${c.offers!.name}” (${c.offers!.number} key${c.offers!.number === 1 ? '' : 's'}).`,
            tone: 'ok',
          },
        ],
      };
    });
  }

  // ------------------------------------------------------------ a protected file

  private plan(digest: string, run: () => Promise<Done>): string {
    const id = sha256(`${digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(id, { digest, run, expires: Date.now() + PLAN_LIFE });
    return id;
  }

  /** Confirm a plan read back: it runs only with the digest shown. */
  confirm(plan: string, digest: string): Promise<Done> {
    const p = this.plans.get(plan);
    if (!p || p.expires < Date.now()) return Promise.reject(new Error('This reading has expired: read it again. Nothing was signed.'));
    if (p.digest !== digest) return Promise.reject(new Error('What you confirmed is not what was read back. Nothing was signed.'));
    this.plans.delete(plan);
    return this.desk.serial(p.run);
  }

  /**
   * A protected file read back before anything is signed: what is sealed,
   * who signs, at what price, what the buyer gets, and the stated costs.
   * `data`: the file's bytes, base64.
   */
  prepareWork(a: { media: string; data: string; title: string; price: string; referral?: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const acting = b.acting && this.held().includes(b.acting) ? b.acting : this.held()[0];
      if (!acting) throw new Error('No identity is held here: bring one on the Identities tab. Nothing was prepared.');
      const as = b.as ?? acting;
      const me = this.me(acting);
      const s = this.settings();
      const blocking: string[] = [];
      const media: SealedMedia = a.media === 'picture' ? 'picture' : 'text';
      const bytes = Uint8Array.from(Buffer.from(a.data, 'base64'));
      if (!bytes.length) blocking.push(media === 'picture' ? 'Choose a JPEG picture.' : 'Write the text to seal.');
      if (bytes.length > MAX_WORK) blocking.push(`The file is larger than Edubba seals (${MAX_WORK / 1024 / 1024} MB).`);
      const title = a.title.trim();
      if (!title) blocking.push('Give it a title: the public words beside its offer.');
      const price = Number(a.price);
      if (!Number.isSafeInteger(price) || price <= 0) blocking.push('A price is a whole number of regtest satoshis, above zero.');
      const referral = a.referral?.trim() ? Number(a.referral) : null;
      if (referral !== null && (!Number.isInteger(referral) || referral < 1 || referral > 99)) blocking.push('A referral share is a whole percentage, 1 to 99, or none.');
      const collective = as !== acting;
      if (collective && referral !== null) blocking.push('A collective’s referral share is written in its split plan (part C), not in its offer’s words.');
      let c: CollectiveHere | null = null;
      if (collective) {
        c = await this.collectiveHere(me, as);
        if (c.why) blocking.push(`The collective ${short(as)}: ${c.why}.`);
      }
      let work: ReturnType<typeof lockWork> | null = null;
      if (bytes.length && Number.isSafeInteger(price) && price > 0) {
        try {
          work = lockWork({ media, bytes, price: { unit: REGTEST_UNIT, value: price }, relays: s.relays });
        } catch (e) {
          blocking.push(e instanceof NotJpeg ? `That file is not a JPEG picture: ${e.message}` : media === 'text' ? 'That text is not UTF-8: give a plain text.' : err(e));
        }
      }
      const priceSaid = Number.isSafeInteger(price) && price > 0 ? say({ unit: REGTEST_UNIT, value: price }, new Set([REGTEST_UNIT])) : '?';
      const words = offerWordsFor(media, priceSaid, referral);
      const names = this.store.names();
      const who = collective ? `the collective ${short(as)}, signed with your own key for it (${names(acting)})` : names(acting);
      const reading: Reading = {
        title: `A protected ${media === 'picture' ? 'picture' : 'text'}: “${title || '…'}”`,
        summary: [
          `Published by ${who}, locked: anyone sees its title, its offer and its price; its ${media === 'picture' ? 'picture' : 'text'} opens only with its key, delivered to each buyer once paid.`,
          collective
            ? `The offer is the collective’s, made under its agreement in force (${c?.agreement ? short(c.agreement) : '?'}) and paying the collective: how its income reaches its members is its split service’s.`
            : 'The offer is a lone seller’s: itself the agreement between you and each buyer (Agreements rule 11).',
        ],
        sections: [
          {
            heading: 'What is published',
            lines: [
              { text: `The ${media === 'picture' ? 'picture (a JPEG, stripped to the picture alone first: the JPEG Module, rule 6)' : 'text'}, ${work ? `${work.size.toLocaleString('en')} bytes, fingerprint ${work.work.slice(0, 16)}…` : 'not read'}: locked with its own key; its locked bytes go to ${s.relays.join(', ')}.` },
              ...(work?.removed.length ? [{ text: `Stripped from the picture before it is locked: ${work.removed.join(', ')}.`, tone: 'warn' as const }] : []),
              { text: `Its offer, public: ${priceSaid}. Its words: “${words}”` },
              { text: `A post naming both, its words the title: “${title || '…'}”, so it shows in a feed.` },
            ],
          },
          {
            heading: 'Who signs',
            lines: collective
              ? [
                  { text: `The publication, in its area “${c?.publishing?.name ?? '?'}”: ${c?.publishing ? `${c.publishing.number} key${c.publishing.number === 1 ? '' : 's'} of ${c.publishing.holders.length}` : '?'}.` },
                  { text: `The offer, in its area “${c?.offers?.name ?? '?'}”: ${c?.offers ? `${c.offers.number} key${c.offers.number === 1 ? '' : 's'} of ${c.offers.holders.length}` : '?'}. Where an area asks more keys than yours, its other holders sign in their own apps.` },
                  { text: 'The key, delivered at once to every member, sealed to each: a collective keeps no secret from its members (rule 57).' },
                ]
              : [{ text: `${names(acting)}, with its own signing key; the key kept in this Edubba, to deliver to each buyer.` }],
          },
          {
            heading: 'Stated costs',
            lines: [
              { text: collective ? 'Any member can open the work and deliver its key: the key is sealed to every one of them.' : 'The key sits in this Edubba’s folder until each buyer has it; a buyer may pass it on: what a buyer does with the bytes, MOR cannot stop.', tone: 'warn' },
              ...(referral ? [{ text: `The referral share is a promise in words, not judged by the core (F351): your Damgar prepares it when it signs the receipt.`, tone: 'warn' as const }] : []),
            ],
          },
        ],
        plain: [{ heading: 'The offer’s words', text: words }],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba protected file, version 1', acting, as, media, work?.work ?? '', title, price, words, s.relays]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !work) throw new Error('This cannot be published while a reason above stands. Nothing was signed.');
        return collective ? this.publishAsCollective(me, c!, { media, title, price, words, work }) : this.publishAsSelf(me, { media, title, price, words, work });
      });
      return { plan, digest, reading };
    });
  }

  private async publishAsSelf(me: TestIdentity, a: { media: SealedMedia; title: string; price: number; words: string; work: ReturnType<typeof lockWork> }): Promise<Done> {
    const s = this.settings();
    try {
      await carryChain(me, s.relays);
      const publication = await me.publish(POST_SPECS.envelopes, PUBLICATION, a.work.payload, { public: true, relays: s.relays });
      for (const h of s.relays) await relayAt(h, s.via).putMedia(a.work.locked);
      const offer = await me.publish(MIRS.agreements, OFFER, offerPayload({ sells: { publication: publication.id }, price: { unit: REGTEST_UNIT, value: a.price }, words: a.words }), { public: true, relays: s.relays });
      const post = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.title), { public: true, relays: s.relays, refs: [referenceTo(publication.act), referenceTo(offer.act)] });
      const b = this.book();
      b.works.unshift({ publication: publication.id, offer: offer.id, post: post.id, as: me.id, member: me.id, collective: false, media: a.media, title: a.title, price: a.price, words: a.words, relays: s.relays, at: now(), key: a.work.key, delivered: {}, toMembers: null });
      this.save(b);
      return {
        title: 'Published, sealed',
        lines: [
          { text: `“${a.title}” is published locked, its offer public at ${s.relays.join(', ')}.`, tone: 'ok' },
          { text: 'A buyer pays from Dub or Damgar; once your Damgar signs the receipt, Edubba delivers the key when you open this tab (or press “Deliver keys”).' },
        ],
        acts: [publication.id, offer.id, post.id],
      };
    } finally {
      this.store.saveIdentity(me);
    }
  }

  private async publishAsCollective(me: TestIdentity, c: CollectiveHere, a: { media: SealedMedia; title: string; price: number; words: string; work: ReturnType<typeof lockWork> }): Promise<Done> {
    const s = this.settings();
    const at = await chainFor(c.id, c.key!, c.places, s.via);
    const pub = signAsMember(c.id, c.key!, at, { spec: POST_SPECS.envelopes, type: PUBLICATION, payload: a.work.payload, public: true });
    const off = signAsMember(c.id, c.key!, at, {
      spec: MIRS.agreements,
      type: OFFER,
      payload: offerPayload({ sells: { publication: pub.id }, price: { unit: REGTEST_UNIT, value: a.price }, words: a.words, under: c.agreement!, payee: c.id }),
      public: true,
      objects: [[c.agreement!, c.agreement!]],
    });
    const post = signAsMember(c.id, c.key!, at, { spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload(a.title), public: true, refs: [referenceTo(pub.act), referenceTo(off.act)] });
    const places = list([...c.places, ...s.relays]);
    const took = await publishAt([pub.act, off.act, post.act], places, s.via);
    if (!took.length) throw new Error('No relay took the publication: nothing counts. Try again.');
    for (const h of took) await relayAt(h, s.via).putMedia(a.work.locked).catch(() => undefined);
    // The key to every member, sealed to each (rule 57): a key delivery of the collective's.
    const { parties } = await collectiveNow(c.id, c.places, s.via);
    const lines: Line[] = [];
    let toMembers: string | null = null;
    try {
      const kd = signAsMember(c.id, c.key!, at, { spec: SPECS.envelopes, type: KEY_DELIVERY, payload: keyDeliveryPayload(pub.id, a.work.key), public: false, to: parties });
      const to: { id: string; key: Uint8Array }[] = [];
      for (const m of parties) {
        const l = await lookUp(m, places, s.via).catch(() => null);
        if (l?.encryptionKey) to.push({ id: m, key: l.encryptionKey });
        else lines.push({ text: `${this.store.names()(m)} publishes no encryption key: the key could not be sealed to them.`, tone: 'warn' });
      }
      const sealed = sealFor(kd.act, kd.key, to);
      let left = 0;
      for (const h of places) {
        try {
          await relayAt(h, s.via).putSealed(sealed);
          left++;
        } catch {
          // away
        }
      }
      if (left) toMembers = kd.id;
      lines.push(left ? { text: `Its key is sealed to every member (${to.length}), at ${left} of the collective’s places.`, tone: 'ok' } : { text: 'Its key could not be left at the collective’s places: deliver it again from here.', tone: 'warn' });
    } catch (e) {
      lines.push({ text: `Its key was not delivered to the members: ${err(e)}`, tone: 'warn' });
    }
    const b = this.book();
    b.works.unshift({ publication: pub.id, offer: off.id, post: post.id, as: c.id, member: me.id, collective: true, media: a.media, title: a.title, price: a.price, words: a.words, relays: took, at: now(), key: a.work.key, delivered: {}, toMembers });
    this.save(b);
    return {
      title: 'Published by the collective, sealed',
      lines: [
        { text: `“${a.title}” is published by the collective ${short(c.id)}, signed with your own key for it, its offer made under its agreement in force and paying the collective.`, tone: 'ok' },
        ...lines,
        ...((c.publishing?.number ?? 1) > 1 || (c.offers?.number ?? 1) > 1 ? [{ text: 'An area asks more keys than yours: its other holders sign it in their own apps before it counts.', tone: 'warn' as const }] : []),
      ],
      acts: [pub.id, off.id, post.id],
    };
  }

  // ------------------------------------------------------------ vows (Agreements rule 13)

  /**
   * A vow read back before anything is signed: its words, its price, who
   * signs, and what a buyer may do with each sale (confirm or contest it).
   */
  prepareVow(a: { words: string; title: string; price: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const acting = b.acting && this.held().includes(b.acting) ? b.acting : this.held()[0];
      if (!acting) throw new Error('No identity is held here: bring one on the Identities tab. Nothing was prepared.');
      const as = b.as ?? acting;
      const me = this.me(acting);
      const s = this.settings();
      const blocking: string[] = [];
      const words = a.words.normalize('NFC').trim();
      if (!words) blocking.push('Say what is vowed, in words: what the buyer gets.');
      if (words.length > 2000) blocking.push('A vow’s words: at most 2,000 characters.');
      const title = a.title.trim();
      if (!title) blocking.push('Give it a title: the public words of its post.');
      const price = Number(a.price);
      if (!Number.isSafeInteger(price) || price <= 0) blocking.push('A price is a whole number of regtest satoshis, above zero.');
      const collective = as !== acting;
      let c: CollectiveHere | null = null;
      if (collective) {
        c = await this.collectiveHere(me, as);
        if (c.why) blocking.push(`The collective ${short(as)}: ${c.why}.`);
        else if (!c.vows) blocking.push(`The collective ${short(as)}: no area of its constitution reaches vows: one would count only on its own key.`);
        else if (!c.vows.holders.includes(me.id)) blocking.push(`The collective ${short(as)}: you hold no box in its area reaching vows (“${c.vows.name}”).`);
      }
      const priceSaid = Number.isSafeInteger(price) && price > 0 ? say({ unit: REGTEST_UNIT, value: price }, new Set([REGTEST_UNIT])) : '?';
      const offerWords = vowOfferWords(words, priceSaid);
      const names = this.store.names();
      const reading: Reading = {
        title: `A vow: “${title || '…'}”`,
        summary: [
          `Published by ${collective ? `the collective ${short(as)}, signed with your own key for it (${names(acting)})` : names(acting)}: a vow, in words, and an offer selling it for ${priceSaid}.`,
          'Each purchase is a sale, pending until its buyer confirms it (kept) or contests it (not kept), in their own app: Dub’s Signing tab, or Edubba. The core reads that state, never the promise itself (Agreements rule 13).',
        ],
        sections: [
          {
            heading: 'What is published',
            lines: [
              { text: `The vow, public, its first act its name for good: “${words || '…'}”` },
              { text: `Its offer, public: ${priceSaid}. Its words: “${offerWords}”` },
              { text: `A post naming both, its words the title: “${title || '…'}”.` },
              ...(collective ? [{ text: `Made under the collective’s agreement in force, paying the collective: the vow in its area “${c?.vows?.name ?? '?'}”, the offer in “${c?.offers?.name ?? '?'}”.` }] : []),
            ],
          },
          {
            heading: 'Stated costs',
            lines: [
              { text: 'Every sale’s confirmation and contest is public: anyone who looks at relays holding them reads how your vows were kept.', tone: 'warn' },
              { text: 'A vow names what is promised to the buyer, never the event itself; another vow for the same thing is another vow (F259).' },
            ],
          },
        ],
        plain: [{ heading: 'The vow’s words', text: words }],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba vow, version 1', acting, as, words, title, price, s.relays]));
      const plan = this.plan(digest, async () => {
        if (blocking.length) throw new Error('This cannot be published while a reason above stands. Nothing was signed.');
        return collective ? this.vowAsCollective(me, c!, { words, title, price, offerWords }) : this.vowAsSelf(me, { words, title, price, offerWords });
      });
      return { plan, digest, reading };
    });
  }

  private async vowAsSelf(me: TestIdentity, a: { words: string; title: string; price: number; offerWords: string }): Promise<Done> {
    const s = this.settings();
    try {
      await carryChain(me, s.relays);
      const made = await publishVow(me, { words: a.words, title: a.title, price: { unit: REGTEST_UNIT, value: a.price }, offerWords: a.offerWords, relays: s.relays });
      const b = this.book();
      b.vows.unshift({ ...made, as: me.id, member: me.id, collective: false, words: a.words, title: a.title, price: a.price, at: now() });
      this.save(b);
      return { title: 'A vow, published', lines: [{ text: `“${a.title}” is published with its offer at ${s.relays.join(', ')}. Each buyer confirms or contests their sale.`, tone: 'ok' }], acts: [made.vow, made.offer, made.post] };
    } finally {
      this.store.saveIdentity(me);
    }
  }

  private async vowAsCollective(me: TestIdentity, c: CollectiveHere, a: { words: string; title: string; price: number; offerWords: string }): Promise<Done> {
    const s = this.settings();
    const at = await chainFor(c.id, c.key!, c.places, s.via);
    const vow = signAsMember(c.id, c.key!, at, { spec: SPECS.envelopes, type: VOW, payload: vowPayload(a.words), public: true });
    const off = signAsMember(c.id, c.key!, at, {
      spec: MIRS.agreements,
      type: OFFER,
      payload: offerPayload({ sells: { vow: vow.id }, price: { unit: REGTEST_UNIT, value: a.price }, words: a.offerWords, under: c.agreement!, payee: c.id }),
      public: true,
      objects: [[c.agreement!, c.agreement!]],
    });
    const post = signAsMember(c.id, c.key!, at, { spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload(a.title), public: true, refs: [referenceTo(vow.act), referenceTo(off.act)] });
    const took = await publishAt([vow.act, off.act, post.act], list([...c.places, ...s.relays]), s.via);
    if (!took.length) throw new Error('No relay took the vow: nothing counts. Try again.');
    const b = this.book();
    b.vows.unshift({ vow: vow.id, offer: off.id, post: post.id, as: c.id, member: me.id, collective: true, words: a.words, title: a.title, price: a.price, at: now() });
    this.save(b);
    return { title: 'A vow of the collective, published', lines: [{ text: `“${a.title}” is published by the collective ${short(c.id)}, signed with your own key for it, its offer under its agreement in force and paying the collective.`, tone: 'ok' }], acts: [vow.id, off.id, post.id] };
  }

  /**
   * The look-up (decided by Nobody, allegedly, 17 October 2026: "no need to
   * become an aggregator"): one identity's vows and their sales, confirmed,
   * contested or pending, read from the relays chosen, the core judging each.
   * Where a sale's buyer is an identity held here, it may be contested here.
   */
  vowSales(a: { identity: string; relays: string[] }): Promise<{ vows: (VowShown & { mine: string[] })[]; asked: string[]; problems: string[] }> {
    return this.desk.serial(async () => {
      const s = this.settings();
      const relays = list(a.relays.map((r) => r.trim()).filter((r) => /^https?:\/\//.test(r)));
      if (!relays.length) throw new Error('Name at least one relay to ask (an address starting with https://).');
      const r = await vowSales(readId(a.identity), relays, s.via);
      const held = new Set(this.held());
      return { ...r, vows: r.vows.map((v) => ({ ...v, mine: v.sales.filter((x) => held.has(x.buyer)).map((x) => x.act) })) };
    });
  }

  /** Contest a sale whose buyer is held here (Agreements type 14, F253): public, naming the sale and the vow, the promise not kept in words if given. */
  contestSale(a: { vow: string; sale: string; buyer: string; promise: string }): Promise<Done> {
    return this.desk.serial(async () => {
      const me = this.me(readId(a.buyer));
      const s = this.settings();
      let id: string;
      try {
        await carryChain(me, s.relays);
        id = await contestSale(me, { vow: readId(a.vow), sale: readId(a.sale), promise: a.promise, relays: list([...s.relays, ...me.f.homes.map((h) => h.hint)]) });
      } finally {
        this.store.saveIdentity(me);
      }
      return { title: 'Contested', lines: [{ text: 'Your contest of that sale is signed in public: it reads contested for anyone who looks. It voids nothing; the payment stays as it is.', tone: 'ok' }], acts: [id] };
    });
  }

  /** Deliver the keys of what the sellers held here sold, as their Damgar told of each sale (type 6). */
  deliver(): Promise<{ lines: Line[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const s = this.settings();
      const lines: Line[] = [];
      for (const id of list(b.works.filter((w) => !w.collective && w.key).map((w) => w.as))) {
        if (!this.store.holds(id)) continue;
        const me = this.me(id);
        const sold: SoldWorks = {};
        for (const w of b.works.filter((x) => x.as === id && x.key)) sold[w.publication] = { key: w.key!, offer: w.offer, post: w.post, media: w.media, delivered: w.delivered };
        try {
          for (const t of await deliverSold(me, sold, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me) })) lines.push({ text: t, tone: /could not/.test(t) ? 'warn' : 'ok' });
        } finally {
          this.store.saveIdentity(me);
        }
        for (const w of b.works) if (sold[w.publication]) w.delivered = sold[w.publication].delivered;
      }
      this.save(b);
      return { lines: lines.length ? lines : [{ text: 'No sale waits for its key.' }] };
    });
  }
}

/** The offer's words: what it sells and its price, and a lone seller's referral share in the one sentence Damgar reads (F351). */
export function offerWordsFor(media: SealedMedia, price: string, referral: number | null): string {
  return `A sealed ${media === 'picture' ? 'picture' : 'text'}, opened once paid: ${price}.${referral ? ` Referral: ${referral}% of the price to the repost the buyer names.` : ''}`;
}

