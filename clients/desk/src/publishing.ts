// Edubba's Publishing tab (round 3, part B; F339, F347; decided by Nobody,
// allegedly, 17 October 2026: "Let's add a publishing tab. With option to
// select the identity that acts (collective or individual)").
//
// **Protected files.** A work sealed under terms: its bytes locked (the
// Envelopes "Media" rule: the publication public, its media key absent,
// delivered to each buyer), its price in the publication, and an offer
// selling it. The work is a text, a JPEG picture, an MP4 film or an M4A recording (video and audio decided by Nobody, allegedly, 21 October 2026): the media modules Edubba
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
import { MIRS, SPECS, cborEncode, moneyRead, openSealed, sha256, unhex } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readId } from '../../genesis/src/forms.ts';
import { SPLIT_CMIP, carryChain, dealGrantPayload, dealTermsPayload, sign } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { KEY_DELIVERY, MEDIA_WORDS, OFFER, keyDeliveryPayload, lockWork, offerPayload, type SealedMedia } from '../../barebone/src/sealed.ts';
import { NotFilm } from '../../../modules/video/src/video.ts';
import { NotSound } from '../../../modules/audio/src/audio.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { NotJpeg } from '../../../modules/jpeg/src/jpeg.ts';
import { areaReaching, chainFor, collectiveNow, collectivePlaces, memberKeyFor, publishAt, readMemberKeys, signAsMember, type AreaHere, type MemberKey } from '../../grants/src/member.ts';
import { actors, chosen, type Actor } from '../../ummia/src/acting.ts';
import { deliverKey, deliverSold, type SoldWorks } from '../../dub/src/delivery.ts';
import { VOW, contestSale, publishVow, purchaseContests, vowOfferWords, vowPayload, vowSales, type ContestsBeside, type VowShown } from '../../dub/src/vows.ts';
import { say } from '../../damgar/src/units.ts';
import { TYPES, readSale, sendDraft } from '../../damgar/src/messages.ts';
import { MESSAGES_SPECS } from '../../damgar/src/specs.ts';
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
export const MAX_WORK = 20 * 1024 * 1024;

/** Said on the Publishing tab, word for word. */
export const PUBLISHING_SAY = [
  'A protected file is published locked: anyone sees its offer and its price; its bytes open only with its key, delivered to each buyer once paid. A text, a JPEG picture, an MP4 film or an M4A recording: the kinds Edubba and Dub carry, each checked and stripped by its Module before it is locked.',
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
  /** As oneself, a judged referral (F215, F351): the one-party deal its offer is under, paid through its split service. */
  deal?: string | null;
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
  prepareWork(a: { media: string; data: string; title: string; price: string; referral?: string; service?: string; serviceKey?: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const acting = b.acting && this.held().includes(b.acting) ? b.acting : this.held()[0];
      if (!acting) throw new Error('No identity is held here: bring one on the Identities tab. Nothing was prepared.');
      const as = b.as ?? acting;
      const me = this.me(acting);
      const s = this.settings();
      const blocking: string[] = [];
      const media: SealedMedia = a.media === 'picture' || a.media === 'video' || a.media === 'audio' ? a.media : 'text';
      const bytes = Uint8Array.from(Buffer.from(a.data, 'base64'));
      if (!bytes.length) blocking.push(CHOOSE[media]);
      if (bytes.length > MAX_WORK) blocking.push(`The file is larger than Edubba seals (${MAX_WORK / 1024 / 1024} MB).`);
      const title = a.title.trim();
      if (!title) blocking.push('Give it a title: the public words beside its offer.');
      const price = Number(a.price);
      if (!Number.isSafeInteger(price) || price <= 0) blocking.push('A price is a whole number of regtest satoshis, above zero.');
      const referral = a.referral?.trim() ? Number(a.referral) : null;
      if (referral !== null && (!Number.isInteger(referral) || referral < 1 || referral > 99)) blocking.push('A referral share is a whole percentage, 1 to 99, or none.');
      const collective = as !== acting;
      if (collective && referral !== null) blocking.push('A collective’s referral share is written in its split plan (part C), not in its offer’s words.');
      // A judged referral (F215, F351): a split service named, the work under a one-party deal of its own.
      let service: string | null = null;
      const serviceKey = (a.serviceKey ?? '').trim().toLowerCase();
      if (a.service?.trim() || serviceKey) {
        if (collective) blocking.push('A collective’s split service is named in its money terms (the Collectives tab), not here.');
        else if (referral === null) blocking.push('A split service judges a referral share: give the share too, or name no service.');
        try {
          service = readId(a.service ?? '');
          if (service === acting) blocking.push('The split service is another identity than yours.');
        } catch (e) {
          blocking.push(`The split service: ${err(e)}`);
        }
        if (!/^[0-9a-f]{64}$/.test(serviceKey)) blocking.push('The split service’s key for you: 64 hexadecimal characters, as the service gives it.');
      }
      const judged = !!service && referral !== null && !collective;
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
          blocking.push(
            e instanceof NotJpeg
              ? `That file is not a JPEG picture: ${e.message}`
              : e instanceof NotFilm
                ? `That file is not a film the video Module plays (an MP4): ${e.message}`
                : e instanceof NotSound
                  ? `That file is not a recording the audio Module plays (an M4A): ${e.message}`
                  : media === 'text'
                    ? 'That text is not UTF-8: give a plain text.'
                    : err(e),
          );
        }
      }
      const names = this.store.names();
      const priceSaid = Number.isSafeInteger(price) && price > 0 ? say({ unit: REGTEST_UNIT, value: price }, new Set([REGTEST_UNIT])) : '?';
      const words = judged ? judgedWordsFor(media, priceSaid, referral!) : offerWordsFor(media, priceSaid, referral);
      const who = collective ? `the collective ${short(as)}, signed with your own key for it (${names(acting)})` : names(acting);
      const reading: Reading = {
        title: `A protected ${MEDIA_WORDS[media]}: “${title || '…'}”`,
        summary: [
          `Published by ${who}, locked: anyone sees its title, its offer and its price; its ${MEDIA_WORDS[media]} opens only with its key, delivered to each buyer once paid.`,
          collective
            ? `The offer is the collective’s, made under its agreement in force (${c?.agreement ? short(c.agreement) : '?'}) and paying the collective: how its income reaches its members is its split service’s.`
            : judged
              ? `The offer is made under a deal of its own, you its one party: its stake, the work, wholly yours; its split plan pays ${referral}% off the top to whoever reposted it where the buyer found it, the rest to you; its split service, ${service ? names(service) : '…'}, divides each payment (F215, F351).`
              : 'The offer is a lone seller’s: itself the agreement between you and each buyer (Agreements rule 11).',
        ],
        sections: [
          {
            heading: 'What is published',
            lines: [
              { text: `The ${STRIPPED[media]}, ${work ? `${work.size.toLocaleString('en')} bytes, fingerprint ${work.work.slice(0, 16)}…` : 'not read'}: locked with its own key; its locked bytes go to ${s.relays.join(', ')}.` },
              ...(work?.removed.length ? [{ text: `Stripped from the ${MEDIA_WORDS[media]} before it is locked: ${work.removed.join(', ')}.`, tone: 'warn' as const }] : []),
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
              ...(referral && !judged ? [{ text: `The referral share is a promise in words, not judged by the core (F351): your Damgar prepares it when it signs the receipt.`, tone: 'warn' as const }] : []),
              ...(judged ? [{ text: 'The service is paid nothing by this deal (no fee), and holds a key that signs receipts in your name for money coming in under this offer only (rule 16). It sees each sale; it never sees the work.', tone: 'warn' as const }] : []),
            ],
          },
          ...(judged
            ? [
                {
                  heading: 'The deal, before the offer (F215, F351)',
                  lines: [
                    { text: `Your grant to ${service ? names(service) : '…'}, naming the key it made for you (${serviceKey.slice(0, 16)}…) and “this agreement”: it counts once you sign the deal and the service signs to accept it (F129, H4).` },
                    { text: `The deal: you its one party; its stake, the publication, 100% yours; its split plan, ${referral}% to the referral role off the top, the rest to the stake (the split cMIP, draft 2); field 14, your grant. Signed by you, every party (rule 47).` },
                    { text: 'The offer: under the deal, paying you; a buyer’s Damgar reads field 14 and asks the service for the invoice (the money messages cMIP, draft 4).' },
                  ],
                },
              ]
            : []),
        ],
        plain: [{ heading: 'The offer’s words', text: words }],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba protected file, version 1', acting, as, media, work?.work ?? '', title, price, words, s.relays, judged ? [service, serviceKey, referral] : null]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !work) throw new Error('This cannot be published while a reason above stands. Nothing was signed.');
        return collective ? this.publishAsCollective(me, c!, { media, title, price, words, work }) : this.publishAsSelf(me, { media, title, price, words, work, judged: judged ? { service: service!, key: serviceKey, referral: referral! } : null });
      });
      return { plan, digest, reading };
    });
  }

  private async publishAsSelf(me: TestIdentity, a: { media: SealedMedia; title: string; price: number; words: string; work: ReturnType<typeof lockWork>; judged: { service: string; key: string; referral: number } | null }): Promise<Done> {
    const s = this.settings();
    await this.desk.keyCurrent(me.id);
    try {
      await carryChain(me, s.relays);
      const publication = await me.publish(POST_SPECS.envelopes, PUBLICATION, a.work.payload, { public: true, relays: s.relays });
      for (const h of s.relays) await relayAt(h, s.via).putMedia(a.work.locked);
      // A judged referral (F215, F351): the seller's grant to the service, then the one-party deal listing it, signed; the offer under it.
      let deal: string | null = null;
      if (a.judged) {
        const grant = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.grant, dealGrantPayload(a.judged.service, [1, unhex(a.judged.key)]), { public: true, relays: s.relays });
        const terms = dealTermsPayload({
          party: me.id,
          text: `A deal of one party for one work, “${a.title}”: its stake held wholly by its seller; ${a.judged.referral}% of each payment to whoever reposted it where the buyer found it, the rest to the seller, divided by the split service named.`,
          object: publication.id,
          plan: { stakes: [[0, 1_000_000]], roles: [['referral', a.judged.referral * 10_000]], cmip: SPLIT_CMIP },
          payeeGrant: grant.id,
        });
        const d = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.terms, terms, { public: true, relays: s.relays, refs: [referenceTo(grant.act)] });
        await sign(me, d.id, s.relays);
        deal = d.id;
      }
      const offer = await me.publish(
        MIRS.agreements,
        OFFER,
        offerPayload({ sells: { publication: publication.id }, price: { unit: REGTEST_UNIT, value: a.price }, words: a.words, ...(deal ? { under: deal, payee: me.id } : {}) }),
        { public: true, relays: s.relays, ...(deal ? { objects: [[deal, deal]] as [string, string][] } : {}) },
      );
      const post = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.title), { public: true, relays: s.relays, refs: [referenceTo(publication.act), referenceTo(offer.act)] });
      const b = this.book();
      b.works.unshift({ publication: publication.id, offer: offer.id, post: post.id, as: me.id, member: me.id, collective: false, media: a.media, title: a.title, price: a.price, words: a.words, relays: s.relays, at: now(), key: a.work.key, delivered: {}, toMembers: null, deal });
      this.save(b);
      return {
        title: 'Published, sealed',
        lines: [
          { text: `“${a.title}” is published locked, its offer public at ${s.relays.join(', ')}.`, tone: 'ok' },
          ...(deal ? [{ text: `Its deal (${short(deal)}) is signed: its split service answers buyers once it accepts your grant, and pays you and each reposter.`, tone: 'ok' as const }] : []),
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
    await this.desk.keyCurrent(me.id);
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

  /**
   * The buyers' contests shown beside each sale of a work published here in
   * one's own name (F386): each buyer's claim of the payment, sealed to the
   * seller and left in its inbox, opened here and given to the core with the
   * parties' chains and the public contests; `unknown` where the core cannot
   * say, never "none". A collective's works are paid to its split service,
   * which holds the claims: not read here.
   */
  salesContests(): Promise<{ by: Record<string, Record<string, ContestsBeside>>; problems: string[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const s = this.settings();
      const held = this.held();
      const acting = b.acting && held.includes(b.acting) ? b.acting : (held[0] ?? null);
      const works = b.works.filter((w) => !w.collective && w.member === acting && Object.keys(w.delivered).length);
      if (!acting || !works.length) return { by: {}, problems: [] };
      const me = this.me(acting);
      const buyers = list(works.flatMap((w) => Object.keys(w.delivered)));
      const offers = new Map(works.map((w) => [w.offer, w.publication]));
      const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
      const found: { publication: string; buyer: string; id: string; act: Uint8Array; key: Uint8Array | null }[] = [];
      const problems: string[] = [];
      const l = await lookUp(me.id, list([...s.homes, ...s.relays, ...me.f.homes.map((h) => h.hint)]), s.via).catch(() => null);
      const inbox = list([...(l?.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints) ?? []), ...me.f.homes.map((h) => h.hint)]);
      for (const h of inbox) {
        let after: number | undefined;
        try {
          for (;;) {
            const page = await relayAt(h, s.via).feed({ to: me.id, after });
            for (const it of page.items) {
              if (it.kind !== 'sealed') continue;
              for (const sec of secrets) {
                let o: { act: Uint8Array; key?: Uint8Array | null; described: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array } };
                try {
                  o = openSealed(it.item, me.id, sec) as typeof o;
                } catch {
                  continue;
                }
                const d = o.described;
                // A payer's claim (Money type 3) from a buyer, naming one of the offers published here.
                if (d.spec === MIRS.money && d.type === 3 && d.signer && buyers.includes(d.signer) && d.payload && !found.some((x) => x.id === d.id)) {
                  try {
                    const c = (moneyRead(3, d.payload) as { act: { fulfils?: string } }).act;
                    const publication = c.fulfils ? offers.get(c.fulfils) : undefined;
                    if (publication) found.push({ publication, buyer: d.signer, id: d.id, act: new Uint8Array(o.act), key: o.key ? new Uint8Array(o.key) : null });
                  } catch {
                    // not a claim this reads
                  }
                }
                break;
              }
            }
            if (!page.items.length || page.next === after) break;
            after = page.next;
          }
        } catch {
          problems.push(`${h} did not answer.`);
        }
      }
      const r = found.length ? await purchaseContests({ purchases: found, parties: [me.id, ...buyers], relays: list([...s.relays, ...s.homes]), via: s.via }) : { by: {} as Record<string, ContestsBeside>, problems: [] };
      const by: Record<string, Record<string, ContestsBeside>> = {};
      for (const w of works)
        for (const buyer of Object.keys(w.delivered)) {
          const mine = found.filter((x) => x.publication === w.publication && x.buyer === buyer);
          const read = mine.map((x) => r.by[x.id]).filter(Boolean);
          (by[w.publication] ??= {})[buyer] = !mine.length
            ? { state: 'unknown', contests: [], why: 'the buyer’s claim of the payment was not found in this identity’s inbox' }
            : read.some((x) => x.state === 'shown')
              ? { state: 'shown', contests: read.flatMap((x) => x.contests) }
              : (read[0] ?? { state: 'unknown', contests: [] });
        }
      return { by, problems: [...problems, ...r.problems] };
    });
  }

  /** Contest a sale whose buyer is held here (Agreements type 14, F253): public, naming the sale and the vow, the promise not kept in words if given. */
  contestSale(a: { vow: string; sale: string; buyer: string; promise: string }): Promise<Done> {
    return this.desk.serial(async () => {
      const me = this.me(readId(a.buyer));
      const s = this.settings();
      let id: string;
      await this.desk.keyCurrent(me.id);
      try {
        await carryChain(me, s.relays);
        id = await contestSale(me, { vow: readId(a.vow), sale: readId(a.sale), promise: a.promise, relays: list([...s.relays, ...me.f.homes.map((h) => h.hint)]) });
      } finally {
        this.store.saveIdentity(me);
      }
      return { title: 'Contested', lines: [{ text: 'Your contest of that sale is signed in public: it reads contested for anyone who looks. It voids nothing; the payment stays as it is.', tone: 'ok' }], acts: [id] };
    });
  }

  /**
   * Confirm a sale whose buyer is held here (decided by Nobody, allegedly,
   * 19 October 2026, F357: "Edubba prepares the confirmation, sealed to
   * oneself, and Damgar signs it, as Dub's tips are prepared"): a draft of
   * the money messages cMIP, draft 4 (what 3, confirm a purchase), naming
   * the buyer's own public claim of the payment and the vow; Damgar signs
   * the claim again in public, acknowledging the vow (rule 13).
   */
  confirmSale(a: { vow: string; sale: string; buyer: string; seller: string; unit: string; value: number }): Promise<Done> {
    return this.desk.serial(async () => {
      const me = this.me(readId(a.buyer));
      const s = this.settings();
      if (!Number.isSafeInteger(a.value) || a.value <= 0 || !/^[0-9a-f]{64}$/.test(a.unit)) throw new Error('The sale’s amount was not read: look it up again. Nothing was prepared.');
      await this.desk.keyCurrent(me.id);
      const r = await sendDraft(
        me,
        { what: 'confirm', other: readId(a.seller), amount: { unit: a.unit, value: a.value }, whatFor: 'a vow kept', app: 'Edubba', anchor: null, confirm: { claim: readId(a.sale), acks: [readId(a.vow)] } },
        { refs: [[readId(a.vow), readId(a.seller)]], via: s.via, save: async () => this.store.saveIdentity(me) },
      );
      return {
        title: 'Prepared for Damgar',
        lines: [{ text: `The confirmation is prepared, sealed to ${this.store.names()(me.id)} at its homes (${r.left.length} of them). Damgar, holding the same identity, shows it in To sign: signing there signs your claim of the payment again, in public, acknowledging the vow, and the sale reads confirmed.`, tone: 'ok' }],
        acts: [r.id],
      };
    });
  }

  /**
   * The sales of a collective's works this member published here, as its
   * split service told them (draft 4, 7.2.3): each checked against the
   * receipt the collective signed (sealed to every member, rule 57), then the
   * key delivered to the buyer as the collective, with this member's key,
   * sealed to the buyer and every member.
   */
  private async deliverForCollective(me: TestIdentity, b: Book): Promise<Line[]> {
    const s = this.settings();
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const inbox = list([...me.f.homes.map((h) => h.hint), ...s.relays]);
    const seen = new Map<string, Opened>();
    for (const h of inbox) {
      let after: number | undefined;
      try {
        for (;;) {
          const page = await relayAt(h, s.via).feed({ to: me.id, after });
          for (const it of page.items) {
            if (it.kind !== 'sealed') continue;
            for (const sec of secrets) {
              try {
                const d = (openSealed(it.item, me.id, sec) as { described: Opened }).described;
                seen.set(d.id, d);
                break;
              } catch {
                // the next key
              }
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        // away
      }
    }
    const lines: Line[] = [];
    for (const d of seen.values()) {
      if (!d.spec || !MESSAGES_SPECS.includes(d.spec) || d.type !== TYPES.sale || !d.payload) continue;
      const sale = readSale(d.payload);
      // A collective's work, or one's own under a deal (a judged referral): the service tells the sale (draft 4, 7.2.3).
      const w = b.works.find((x) => (x.collective || x.deal) && x.member === me.id && x.offer === sale.offer && x.publication === sale.publication);
      if (!w || w.delivered[sale.buyer] || !w.key) continue;
      const r = seen.get(sale.receipt);
      const rc = r?.payload && r.spec === MIRS.money && r.type === 2 ? (moneyRead(2, r.payload) as { act: { payer?: string; payee: string; fulfils: string } }).act : null;
      if (!r || r.signer !== w.as || !rc || rc.payer !== sale.buyer || rc.payee !== w.as || rc.fulfils !== w.offer) {
        lines.push({ text: `A sale told by ${short(d.signer ?? '?')} was set aside: its receipt, signed in the payee’s name, was not found sealed to you.`, tone: 'warn' });
        continue;
      }
      try {
        if (!w.collective) {
          w.delivered[sale.buyer] = await deliverKey(me, sale.buyer, w.publication, w.key, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current: () => this.desk.keyCurrent(me.id) });
          lines.push({ text: `The key of “${w.title}” was delivered to ${short(sale.buyer)}, sealed to them: a sale your deal’s split service receipted.`, tone: 'ok' });
          continue;
        }
        w.delivered[sale.buyer] = await this.collectiveKeyDelivery(me, w, sale.buyer);
        lines.push({ text: `The key of the collective’s “${w.title}” was delivered to ${short(sale.buyer)}, as the collective, sealed to them and to every member: a sale its split service receipted.`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `The key of “${w.title}” could not be delivered to ${short(sale.buyer)} yet: ${err(e)}`, tone: 'warn' });
      }
    }
    return lines;
  }

  /** A key delivery of the collective's (Envelopes type 1), with this member's key, sealed to the buyer and every member (rule 57). */
  private async collectiveKeyDelivery(me: TestIdentity, w: WorkHere, buyer: string): Promise<string> {
    const s = this.settings();
    const c = await this.collectiveHere(me, w.as);
    if (!c.key) throw new Error('no key of yours for the collective was found');
    const { parties } = await collectiveNow(c.id, c.places, s.via);
    const at = await chainFor(c.id, c.key, c.places, s.via);
    const kd = signAsMember(c.id, c.key, at, { spec: SPECS.envelopes, type: KEY_DELIVERY, payload: keyDeliveryPayload(w.publication, w.key!), public: false, to: list([buyer, ...parties]) });
    const to: { id: string; key: Uint8Array }[] = [];
    const inboxes: string[] = [];
    for (const m of list([buyer, ...parties])) {
      const l = await lookUp(m, list([...c.places, ...s.relays]), s.via).catch(() => null);
      if (!l?.encryptionKey) continue;
      to.push({ id: m, key: l.encryptionKey });
      inboxes.push(...(l.inbox(SPECS.envelopes) ?? []));
    }
    if (!to.some((x) => x.id === buyer)) throw new Error('the buyer publishes no encryption key');
    const sealed = sealFor(kd.act, kd.key, to);
    let left = 0;
    for (const h of list([...inboxes, ...c.places])) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
      } catch {
        // away
      }
    }
    if (!left) throw new Error('no inbox took it');
    return kd.id;
  }

  /** Deliver the keys of what the sellers held here sold, as their Damgar told of each sale (type 6). */
  deliver(): Promise<{ lines: Line[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const s = this.settings();
      const lines: Line[] = [];
      for (const id of list(b.works.filter((w) => !w.collective && !w.deal && w.key).map((w) => w.as))) {
        if (!this.store.holds(id)) continue;
        const me = this.me(id);
        const sold: SoldWorks = {};
        for (const w of b.works.filter((x) => x.as === id && !x.deal && x.key)) sold[w.publication] = { key: w.key!, offer: w.offer, post: w.post, media: w.media, delivered: w.delivered };
        try {
          for (const t of await deliverSold(me, sold, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current: () => this.desk.keyCurrent(me.id) })) lines.push({ text: t, tone: /could not/.test(t) ? 'warn' : 'ok' });
        } finally {
          this.store.saveIdentity(me);
        }
        for (const w of b.works) if (sold[w.publication]) w.delivered = sold[w.publication].delivered;
      }
      // A collective's works (round 3, part C): its split service tells every member of a sale (the money messages cMIP, draft 4, 7.2.3).
      // One's own works under a deal (a judged referral): its split service tells the seller, likewise.
      for (const member of list(b.works.filter((w) => (w.collective || w.deal) && w.key).map((w) => w.member))) {
        if (!this.store.holds(member)) continue;
        try {
          lines.push(...(await this.deliverForCollective(this.me(member), b)));
        } catch (e) {
          lines.push({ text: `A collective’s sales could not be read: ${err(e)}`, tone: 'warn' });
        }
      }
      this.save(b);
      return { lines: lines.length ? lines : [{ text: 'No sale waits for its key.' }] };
    });
  }
}

/** A sealed act opened, as the inbox holds it. */
type Opened = { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; binding?: string };

/** The offer's words under a one-party deal: the referral is the deal's split plan's, judged, never the sentence Damgar pays from (F215, F351). */
/** What to choose, said where nothing was. */
const CHOOSE: Record<SealedMedia, string> = { text: 'Write the text to seal.', picture: 'Choose a JPEG picture.', video: 'Choose a film: an MP4 file.', audio: 'Choose a recording: an M4A file.' };

/** Each kind, as the read-back says it is locked. */
const STRIPPED: Record<SealedMedia, string> = {
  text: 'text',
  picture: 'picture (a JPEG, stripped to the picture alone first: the JPEG Module, rule 6)',
  video: 'film (an MP4, stripped to the film alone first, every frame byte for byte: the video Module, rule 10)',
  audio: 'recording (an M4A, stripped to the sound alone first, every sample byte for byte: the audio Module, rule 10)',
};

export function judgedWordsFor(media: SealedMedia, price: string, referral: number): string {
  return `A sealed ${MEDIA_WORDS[media]}, opened once paid: ${price}. Under its deal, ${referral}% of each payment goes to the repost the buyer names, paid by its split service.`;
}

/** The offer's words: what it sells and its price, and a lone seller's referral share in the one sentence Damgar reads (F351). */
export function offerWordsFor(media: SealedMedia, price: string, referral: number | null): string {
  return `A sealed ${MEDIA_WORDS[media]}, opened once paid: ${price}.${referral ? ` Referral: ${referral}% of the price to the repost the buyer names.` : ''}`;
}

