// Edubba's Publishing tab, reorganized in four ways in (round 8, F407;
// decided by Nobody, allegedly, 24 October 2026: "So publishing tab gets
// reorganized. One should be able to: Upload and optionally set a price tag
// or claim and optionally setup a publishing envelope. Claim. Setup an
// ownership agreement. Build a publishing envelope from an ownership
// agreement"). The tab keeps its name, Publishing ("Yes, publishing is
// good"); each way may stop where the person chooses.
//
// In plain words:
// 1. **Upload**: a file is locked and uploaded (a bake: "I uploaded this").
//    Then, if you want, either a **price tag** on it (whoever pays it pays
//    you, the uploader, unsplit), or a **claim** ("I made this", with the
//    people you made it with). Then, if you want, a publication (way 4).
// 2. **Claim** alone: a work already uploaded, here or anywhere, by its bake
//    or by its fingerprint.
// 3. **An ownership agreement** from a claim: who owns what share. The other
//    owners sign it in their own Edubba (To sign).
// 4. **A publication** from an ownership agreement (or as its lone seller):
//    what it sells, its partners (each with a short label and a share off
//    the top), the split service that receives every payment and pays
//    everyone, and its price tag. Every party signs it.
//
// Precisely (Envelopes draft 11, Money draft 11, Agreements draft 17):
// - the bake is Envelopes type 0, public, its media key absent ("Media":
//   delivered to each buyer); its locked bytes go to the relays;
// - a price tag is Money type 5 (rule 18): on a bare bake only the
//   uploader's tag counts; under a publication only its split service's or
//   its designated party's (field 10, one of its parties) counts;
// - a claim is Agreements type 3 (rule 7), bound once every other creator
//   has signed it;
// - an ownership agreement is terms whose target is the claim (field 33,
//   `[0, claim]`) with one stake (field 7, in millionths); a vow's is two
//   versions, the founding writing the stake to the vow's signer (rule 14);
// - a publication is Agreements type 6 (`publicationPayload`), naming the
//   ownership agreement by its founding version (`objects`
//   `[[agreement, agreement]]`), its partners, its split service (field 3),
//   its plan (the referral role off the top), and, where you sign its price
//   tag yourself, you as its designated party (field 10).
// - withdrawal, one per layer: a publication is ended by a later version
//   that sells nothing, signed by every party; a price tag by a version with
//   no price, signed by its signer alone; a bake is never withdrawn by the
//   protocol: its bytes stay where they were uploaded unless homes and
//   relays drop them.
//
// The work's key stays in this Edubba (and is sealed to each co-owner once a
// publication counts); it is delivered to each buyer once paid: on a bare
// bake when your Damgar tells of the sale, under a publication when its
// split service does.
//
// As a collective one belongs to, a member acts with their own key, naming
// the collective (Agreements rules 56 to 60): upload and its price tag here;
// a collective's claim, ownership and publication are not offered yet.
//
// Nothing is signed before it is read back in plain words, with its digest.
//
// TEST IDENTITIES ONLY, regtest only.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { MIRS, SPECS, Verifier, cborEncode, cborDecode, describeAct, hex, moneyRead, openSealed, publicationPayload, sha256, unhex } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readId } from '../../genesis/src/forms.ts';
import { AGREEMENTS_SPECS, SPLIT_CMIP, carryChain, sign } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { KEY_DELIVERY, MEDIA_WORDS, keyDeliveryPayload, lockWork, readPublication, readSealed, type SealedMedia } from '../../barebone/src/sealed.ts';
import { putTag, readTag, tagPayload, tagsOf, withdrawTag, type TagRead } from '../../barebone/src/tag.ts';
import { NotFilm } from '../../../modules/video/src/video.ts';
import { NotSound } from '../../../modules/audio/src/audio.ts';
import { BAKE, POST_SPECS, PRICE_TAG, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { NotJpeg } from '../../../modules/jpeg/src/jpeg.ts';
import { areaReaching, chainFor, collectiveNow, collectivePlaces, collectiveVerifier, publishAt, signAsMember, termsAt, type AreaHere } from '../../grants/src/member.ts';
import { negotiate } from '../../repo/src/proposals.ts';
import { actors, chosen, type Actor } from '../../ummia/src/acting.ts';
import { deliverKey, deliverSold, type SoldWorks } from '../../dub/src/delivery.ts';
import { VOW, contestSale, purchaseContests, readVow, vowOfferWords, vowPayload, vowSales, type ContestsBeside, type VowShown } from '../../dub/src/vows.ts';
import { say } from '../../damgar/src/units.ts';
import { TYPES, readSale, sendDraft } from '../../damgar/src/messages.ts';
import { MESSAGES_SPECS } from '../../damgar/src/specs.ts';
import { REGTEST_UNIT } from './grid.ts';
import type { Line, Reading, Section } from '../../collective/src/explain.ts';
import type { Desk, Done } from './desk.ts';
import type { Real } from './real.ts';
import type { Store } from './store.ts';
import { Asking, PARTS, SHARES_SAY, actAt, ownershipOf, type PeopleIn, type Waiting } from './deals.ts';
import { claimPayload, dealClonePayload, dealTermsPayload, pct, readDeal, type DealDraft } from '../../grants/src/deal.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];
const HEX64 = /^[0-9a-f]{64}$/;

/** The largest file Edubba seals: the relays' media limit is theirs; this keeps a page's upload sensible (a reading, the build's). */
export const MAX_WORK = 20 * 1024 * 1024;

/** Said on the Publishing tab, word for word: the four ways in. */
export const PUBLISHING_SAY = [
  'Four ways in, each stopping where you choose. Upload: a file locked and uploaded, then, if you want, a price tag on it (paying you, the uploader, unsplit) or a claim that you made it. Claim: a work already uploaded. An ownership agreement: who owns what share of a claimed work. A publication: how it is sold, with which partners, through which split service, at what price.',
  'A text, a JPEG picture, an MP4 film or an M4A recording: the kinds Edubba and Dub carry, each checked and stripped by its Module before it is locked. Its bytes open only with its key, delivered to each buyer once paid.',
  'As a collective you belong to, you act with your own key, naming it: an upload and its price tag. A collective’s claim, ownership agreement and publication are not offered here yet.',
];

/** Said where a bake would be withdrawn (decided with the MOR lead, 28 October 2026: one withdrawal per layer). */
export const BAKE_STAYS_SAY = 'A bake is never withdrawn by the protocol: its bytes stay where they were uploaded unless the homes and relays holding them drop them. What you can stop is selling it: withdraw its price tag, or end the publication selling it.';

/** A price tag's state, as kept here: its versions' ids (the first first), its price now (null: withdrawn). */
export interface TagHere {
  first: string;
  latest: string;
  versions: string[];
  price: number | null;
  /** Its signer: the uploader on a bare bake; the designated party or the service under a publication. */
  signer: string;
}

/** A file uploaded here (way 1): its bake, kept with its key. */
export interface BakeHere {
  bake: string;
  post: string;
  /** Its uploader: an identity held here, or a collective (acted for by `member`). */
  as: string;
  member: string;
  collective: boolean;
  media: SealedMedia;
  title: string;
  work: string;
  size: number;
  relays: string[];
  at: number;
  /** The key, kept here to deliver to each buyer; the deliveries (buyer → act). */
  key: string | null;
  delivered: Record<string, string>;
  /** A collective's: the key delivery sealed to every member. */
  toMembers: string | null;
  /** Its price tag on the bare bake, if any. */
  tag: TagHere | null;
  /** The claim made of it here, if any. */
  claim: string | null;
}

/** A claim made here (ways 1 and 2). */
export interface ClaimHere {
  claim: string;
  work: string;
  title: string;
  /** The bake it names the work of, where known; or the vow whose name it claims. */
  bake: string | null;
  vow: string | null;
  by: string;
  creators: string[];
  at: number;
}

/** An ownership agreement set up here (way 3). */
export interface OwnershipHere {
  /** Its founding version: what a publication names. */
  id: string;
  /** The version in force once signed: the founding, or a vow's second version sharing the stake (rule 14). */
  version: string;
  claim: string;
  title: string;
  by: string;
  holders: [string, number][];
  at: number;
}

/** A publication drafted here (way 4). */
export interface PublicationHere {
  /** Its first version. */
  id: string;
  /** The latest version drafted here (an ending is a later version). */
  latest: string;
  title: string;
  by: string;
  /** A collective's publication (made by `by` for it), or null. */
  collective?: string | null;
  owners: string | null;
  holders: [string, number][];
  bakes: string[];
  vow: string | null;
  partners: { identity: string; share: number; label: string | null }[];
  service: string;
  referral: number;
  designated: string | null;
  price: number;
  words: string;
  /** Every party but you, each signing it. */
  people: string[];
  state: 'waiting' | 'counts' | 'ending' | 'ended';
  tag: TagHere | null;
  post: string | null;
  delivered: Record<string, string>;
  at: number;
}

interface Book {
  /** The identity held here acting, and the one chosen to sign (itself, or a collective it belongs to). */
  acting: string | null;
  as: string | null;
  /** Collectives added by ID, per identity held: those it acts for here. */
  collectives: Record<string, string[]>;
  bakes: BakeHere[];
  claims: ClaimHere[];
  ownerships: OwnershipHere[];
  publications: PublicationHere[];
  vows: VowHere[];
}

/** A vow published here: the vow, and its lone publication (self-published: you its split service) with its price tag. */
export interface VowHere {
  vow: string;
  publication: string;
  /** The price tag (the old field name kept: what a buyer pays). */
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

const NO_BOOK = (): Book => ({ acting: null, as: null, collectives: {}, bakes: [], claims: [], ownerships: [], publications: [], vows: [] });

/** A review waiting for its confirmation. */
interface Plan {
  digest: string;
  expires: number;
  run(): Promise<Done>;
}

const PLAN_LIFE = 15 * 60 * 1000;

/** A collective as the chooser offers it: available where the identity acting holds a voice in the rules reaching uploads and price tags. */
interface CollectiveHere {
  id: string;
  places: string[];
  agreement: string | null;
  /** Who acts for it on a bake (Envelopes) and on a price tag (Money), rule 60; and on vows. */
  bakes: AreaHere | null;
  tags: AreaHere | null;
  vows: AreaHere | null;
  why: string | null;
}

/** What way 1 does after the upload: nothing more, a price tag, or a claim. */
export type Then = 'none' | 'price' | 'claim';

export class Publishing {
  private plans = new Map<string, Plan>();
  readonly asking: Asking;

  constructor(
    private desk: Desk,
    private store: Store,
    private real: Real | null = null,
  ) {
    this.asking = new Asking(store, () => (this.real ? this.real.contacts().map((c) => ({ id: c.id, name: c.name })) : []), () => this.settings());
  }

  // ------------------------------------------------------------ the book

  private file() {
    return this.store.path('publishing.json');
  }

  private book(): Book {
    const f = this.file();
    if (!existsSync(f)) return NO_BOOK();
    const b = { ...NO_BOOK(), ...(JSON.parse(readFileSync(f, 'utf8')) as Partial<Book>) } as Book;
    // Kept from before this round, and no longer read: protected files sold by a standing offer, deals with their own payee.
    for (const k of ['works', 'posts'] as const) delete (b as unknown as Record<string, unknown>)[k];
    b.vows = b.vows.filter((v) => v.publication);
    return b;
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

  private actingOf(b: Book): string | null {
    const held = this.held();
    return b.acting && held.includes(b.acting) ? b.acting : (held[0] ?? null);
  }

  /** Real collectives founded here whose members include `id`, and those added by ID for it. */
  private collectiveIds(id: string, b: Book): string[] {
    const here = this.real ? this.real.collectives().filter((c) => this.real!.collective(c.id).f.members.includes(id)).map((c) => c.id) : [];
    return list([...here, ...(b.collectives[id] ?? [])]);
  }

  /** A collective as `me` would act for it here: its places, its agreement in force, who acts for it on a bake, a price tag and a vow (rule 60). */
  private async collectiveHere(me: TestIdentity, id: string): Promise<CollectiveHere> {
    const s = this.settings();
    const places = await collectivePlaces(id, list([...s.relays, ...s.homes]), s.via);
    const none = { agreement: null, area: null };
    const [b, t, w] = await Promise.all([
      areaReaching(id, places, { spec: SPECS.envelopes, type: BAKE }, s.via).catch(() => none),
      areaReaching(id, places, { spec: MIRS.money, type: PRICE_TAG }, s.via).catch(() => none),
      areaReaching(id, places, { spec: SPECS.envelopes, type: VOW }, s.via).catch(() => none),
    ]);
    let why: string | null = null;
    if (!b.agreement) why = 'its agreement in force could not be read from its relays and homes';
    else if (!b.area) why = 'no rule of its agreement reaches uploads (the Envelopes layer)';
    else if (!b.area.holders.includes(me.id)) why = `you have no voice in ${b.area.name.startsWith('the ') ? b.area.name : `its area “${b.area.name}”`}, which reaches uploads`;
    return { id, places, agreement: b.agreement, bakes: b.area, tags: t.area, vows: w.area, why };
  }

  // ------------------------------------------------------------ who acts

  /** The tab's state: who acts, and what was uploaded, claimed, agreed and published here, with what waits for others' signatures. */
  state(): Promise<PublishingState> {
    return this.desk.serial(async () => {
      const b = this.book();
      const held = this.held();
      const acting = this.actingOf(b);
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
      const mine = <T extends { by?: string; as?: string; member?: string }>(x: T) => !!acting && (x.by === acting || x.as === acting || x.member === acting);
      const waiting = this.asking.list().filter((w) => w.by === acting);
      const waitingOf = (id: string) => waiting.find((w) => w.id === id) ?? null;
      const shown = (id: string) => {
        const w = waitingOf(id);
        return w ? { state: w.state, signed: this.asking.signedWords(w) } : null;
      };
      return {
        actors: all,
        acting,
        as,
        bakes: b.bakes.filter(mine),
        claims: b.claims.filter(mine).map((c) => ({ ...c, waiting: shown(c.claim) })),
        ownerships: b.ownerships.filter(mine).map((o) => ({ ...o, waiting: shown(o.id) })),
        publications: b.publications.filter(mine).map((p) => ({ ...p, waiting: shown(p.latest) })),
        vows: b.vows.filter(mine),
        sharesSay: SHARES_SAY,
        bakeStays: BAKE_STAYS_SAY,
        held,
        say: PUBLISHING_SAY,
        unit: say({ unit: REGTEST_UNIT, value: 2 }, new Set([REGTEST_UNIT])).replace(/^2 /, ''),
      };
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
      return { lines: [{ text: `Acting for the collective ${short(target)}, with your own key, naming it.`, tone: 'ok' }] };
    });
  }

  /** Act for a collective by its ID: kept where the identity acting has a voice in the rule reaching uploads. */
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
      return { lines: [{ text: `Edubba uploads for ${short(id)} with your own key, naming it: under ${c.bakes!.name.startsWith('the ') ? c.bakes!.name : `its area “${c.bakes!.name}”`} (${c.bakes!.number} of ${c.bakes!.holders.length}).`, tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ reading back, then signing

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

  /** The identity acting and the one it acts as; throws where none is held. */
  private who(b: Book): { acting: string; as: string; me: TestIdentity; collective: boolean } {
    const acting = this.actingOf(b);
    if (!acting) throw new Error('No identity is held here: bring one on the Identities tab. Nothing was prepared.');
    const as = b.as ?? acting;
    return { acting, as, me: this.me(acting), collective: as !== acting };
  }

  private priceOf(typed: string | undefined, blocking: string[]): number | null {
    const price = Number((typed ?? '').trim());
    if (!Number.isSafeInteger(price) || price <= 0) {
      blocking.push('A price is a whole number of regtest satoshis, above zero.');
      return null;
    }
    return price;
  }

  private said(price: number | null): string {
    return price ? say({ unit: REGTEST_UNIT, value: price }, new Set([REGTEST_UNIT])) : '?';
  }

  /** People named in rows (beyond the first, you): by a contact's name, never an ID alone. */
  private others(me: string, rows: { who: string }[], blocking: string[]): string[] {
    const out: string[] = [];
    for (const r of rows) {
      if (!r.who.trim()) continue;
      const p = this.asking.person(r.who, me);
      if ('why' in p) blocking.push(p.why);
      else if (p.id !== me && !out.includes(p.id)) out.push(p.id);
    }
    return out;
  }

  // ------------------------------------------------------------ way 1: upload

  /**
   * Way 1, read back before anything is signed: the file locked and
   * uploaded (a bake), then, as chosen, a price tag on the bare bake or a
   * claim. `data`: the file's bytes, base64.
   */
  prepareUpload(a: { media: string; data: string; title: string; then?: string; price?: string; creators?: { who: string }[] }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, as, me, collective } = this.who(b);
      const s = this.settings();
      const names = this.asking.names();
      const blocking: string[] = [];
      const media: SealedMedia = a.media === 'picture' || a.media === 'video' || a.media === 'audio' ? a.media : 'text';
      const then: Then = a.then === 'price' || a.then === 'claim' ? a.then : 'none';
      const bytes = Uint8Array.from(Buffer.from(a.data ?? '', 'base64'));
      if (!bytes.length) blocking.push(CHOOSE[media]);
      if (bytes.length > MAX_WORK) blocking.push(`The file is larger than Edubba uploads (${MAX_WORK / 1024 / 1024} MB).`);
      const title = (a.title ?? '').trim();
      if (!title) blocking.push('Give it a title: the public words of the post that shows it in a feed.');
      const price = then === 'price' ? this.priceOf(a.price, blocking) : null;
      const creators = then === 'claim' ? this.others(acting, a.creators ?? [], blocking) : [];
      let c: CollectiveHere | null = null;
      if (collective) {
        c = await this.collectiveHere(me, as);
        if (c.why) blocking.push(`The collective ${short(as)}: ${c.why}.`);
        if (then === 'claim') blocking.push('A collective’s claim is not offered here yet: upload it for the collective, then claim it once that is built (or claim it yourself, as yourself).');
        if (then === 'price' && c.tags && !c.tags.holders.includes(acting)) blocking.push(`The collective ${short(as)}: you have no voice in ${c.tags.name}, which reaches price tags.`);
      }
      let work: ReturnType<typeof lockWork> | null = null;
      if (bytes.length) {
        try {
          work = lockWork({ media, bytes, relays: s.relays });
        } catch (e) {
          blocking.push(notPlayable(media, e));
        }
      }
      const uploader = collective ? `the collective ${short(as)}, by you (${names(acting)}) with your own key, naming it` : names(acting);
      const sections: Section[] = [
        {
          heading: 'Uploaded: the bake',
          lines: [
            { text: `The ${STRIPPED[media]}, ${work ? `${work.size.toLocaleString('en')} bytes, fingerprint ${work.work.slice(0, 16)}…` : 'not read'}: locked with its own key; its locked bytes go to ${s.relays.join(', ')}.` },
            ...(work?.removed.length ? [{ text: `Stripped from the ${MEDIA_WORDS[media]} before it is locked: ${work.removed.join(', ')}.`, tone: 'warn' as const }] : []),
            { text: `The bake, public, says one thing: ${uploader} uploaded it. It names its locked bytes, never a price (Envelopes, “Bake”).` },
            { text: `A post naming it, its words the title: “${title || '…'}”, so it shows in a feed.` },
          ],
        },
      ];
      if (then === 'price')
        sections.push({
          heading: 'Then: a price tag on the bare bake',
          lines: [
            { text: `A price tag (Money), public, naming the bake: ${this.said(price)}, paid to ${collective ? 'the collective' : 'you'}, the uploader, unsplit. On a bare bake only its uploader’s tag counts (Money rule 18).` },
            { text: collective ? 'A buyer pays the collective; its key is sealed at once to every member, so any member’s app can deliver it.' : 'A buyer pays from Dub or Damgar; once your Damgar signs the receipt, Edubba delivers the key, sealed to the buyer.' },
          ],
        });
      if (then === 'claim')
        sections.push({
          heading: 'Then: a claim',
          lines: [
            { text: `A claim (Agreements), public: “I made this”, binding the work’s fingerprint to its creators: ${[acting, ...creators].map(names).join(', ')}.` },
            ...(creators.length ? [{ text: `It is bound once ${creators.map(names).join(', ')} ${creators.length === 1 ? 'has' : 'have'} signed it, each in their own Edubba (To sign).` }] : [{ text: 'You alone: bound by your claim alone (rule 7).' }]),
            { text: 'Next, if you want: an ownership agreement from it, then a publication. Until then, nothing is for sale.' },
          ],
        });
      sections.push({
        heading: 'Stated costs',
        lines: [
          { text: BAKE_STAYS_SAY, tone: 'warn' },
          { text: collective ? 'Any member can open the work and deliver its key: it is sealed to every one of them.' : 'The key sits in this Edubba’s folder until each buyer has it; a buyer may pass it on: what a buyer does with the bytes, MOR cannot stop.', tone: 'warn' },
          ...(then === 'claim' ? [{ text: 'A claim records who said it first on MOR, never who truly made it: MOR is not a court (rule 7).', tone: 'warn' as const }] : []),
        ],
      });
      const reading: Reading = {
        title: `Upload ${MEDIA_WORDS[media] === 'picture' ? 'a picture' : `a ${MEDIA_WORDS[media]}`}: “${title || '…'}”`,
        summary: [`Uploaded by ${uploader}: anyone sees its title and that it was uploaded; its ${MEDIA_WORDS[media]} opens only with its key.`, then === 'none' ? 'Nothing more: no price, no claim. You may add either later.' : then === 'price' ? `Then a price tag on it: ${this.said(price)}, paid to the uploader, unsplit.` : 'Then a claim: you made it, with the people named.'],
        sections,
        plain: [],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba upload, version 1', acting, as, media, work?.work ?? '', title, then, price ?? 0, creators, s.relays]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !work) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        return collective ? this.uploadAsCollective(me, c!, { media, title, work, price }) : this.uploadAsSelf(me, { media, title, work, price, creators: then === 'claim' ? creators : null });
      });
      return { plan, digest, reading };
    });
  }

  private async uploadAsSelf(me: TestIdentity, a: { media: SealedMedia; title: string; work: ReturnType<typeof lockWork>; price: number | null; creators: string[] | null }): Promise<Done> {
    const s = this.settings();
    await this.desk.keyCurrent(me.id);
    const lines: Line[] = [];
    try {
      await carryChain(me, s.relays);
      const bake = await me.publish(POST_SPECS.envelopes, BAKE, a.work.payload, { public: true, relays: s.relays });
      for (const h of s.relays) await relayAt(h, s.via).putMedia(a.work.locked);
      let tag: (TagRead & { act: Uint8Array }) | null = null;
      if (a.price) tag = await putTag(me, { bake: bake.id }, { price: { unit: REGTEST_UNIT, value: a.price }, payee: me.id, relays: s.relays });
      const post = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.title), { public: true, relays: s.relays, refs: [referenceTo(bake.act), ...(tag ? [referenceTo(tag.act)] : [])] });
      const b = this.book();
      const here: BakeHere = { bake: bake.id, post: post.id, as: me.id, member: me.id, collective: false, media: a.media, title: a.title, work: a.work.work, size: a.work.size, relays: s.relays, at: now(), key: a.work.key, delivered: {}, toMembers: null, tag: tag ? { first: tag.id, latest: tag.id, versions: [tag.id], price: a.price, signer: me.id } : null, claim: null };
      b.bakes.unshift(here);
      this.save(b);
      lines.push({ text: `“${a.title}” is uploaded, locked, at ${s.relays.join(', ')}.`, tone: 'ok' });
      const acts = [bake.id, ...(tag ? [tag.id] : []), post.id];
      if (tag) lines.push({ text: `Its price tag is public: ${this.said(a.price)}, paid to you. A buyer pays from Dub or Damgar; once your Damgar signs the receipt, Edubba delivers the key when you open this tab (or press “Deliver keys”).`, tone: 'ok' });
      if (a.creators) {
        const r = await this.claimNow(me, { work: a.work.work, title: a.title, bake: bake.id, vow: null, creators: a.creators });
        lines.push(...r.lines);
        acts.push(r.claim);
      }
      if (!tag) lines.push({ text: 'Nothing is for sale: add a price tag on it, or claim it and build a publication, when you want.' });
      return { title: 'Uploaded', lines, acts };
    } finally {
      this.store.saveIdentity(me);
    }
  }

  private async uploadAsCollective(me: TestIdentity, c: CollectiveHere, a: { media: SealedMedia; title: string; work: ReturnType<typeof lockWork>; price: number | null }): Promise<Done> {
    const s = this.settings();
    await this.desk.keyCurrent(me.id);
    try {
      const at = await chainFor(c.id, c.places, s.via);
      const bake = await signAsMember(c.id, me, at, { spec: POST_SPECS.envelopes, type: BAKE, payload: a.work.payload, public: true });
      let tag: { act: Uint8Array; id: string } | null = null;
      if (a.price) {
        const t = moneyTag({ bake: bake.id, version: 1, price: a.price, payee: c.id });
        tag = await signAsMember(c.id, me, at, { spec: MIRS.money, type: t.type, payload: t.payload, public: true });
      }
      const post = await signAsMember(c.id, me, at, { spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload(a.title), public: true, refs: [referenceTo(bake.act), ...(tag ? [referenceTo(tag.act)] : [])] });
      const places = list([...c.places, ...s.relays]);
      const took = await publishAt([bake.act, ...(tag ? [tag.act] : []), post.act], places, s.via);
      if (!took.length) throw new Error('No relay took the upload: nothing counts. Try again.');
      for (const h of took) await relayAt(h, s.via).putMedia(a.work.locked).catch(() => undefined);
      // The key to every member, sealed to each (rule 57: a collective keeps no secret from its members).
      const lines: Line[] = [];
      let toMembers: string | null = null;
      try {
        toMembers = await this.collectiveKeyDelivery(me, c, bake.id, a.work.key, [], lines);
        lines.push({ text: `Its key is sealed to every member, at the collective’s places.`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `Its key was not delivered to the members: ${err(e)}`, tone: 'warn' });
      }
      const b = this.book();
      b.bakes.unshift({ bake: bake.id, post: post.id, as: c.id, member: me.id, collective: true, media: a.media, title: a.title, work: a.work.work, size: a.work.size, relays: took, at: now(), key: a.work.key, delivered: {}, toMembers, tag: tag ? { first: tag.id, latest: tag.id, versions: [tag.id], price: a.price, signer: c.id } : null, claim: null });
      this.save(b);
      return {
        title: 'Uploaded for the collective',
        lines: [
          { text: `“${a.title}” is uploaded for the collective ${short(c.id)}, by you with your own key, naming it${tag ? `, its price tag ${this.said(a.price)}, paid to the collective` : ''}.`, tone: 'ok' },
          ...lines,
          ...((c.bakes?.number ?? 1) > 1 ? [{ text: 'Its rule asks more members than you: they sign it in their own apps before it counts.', tone: 'warn' as const }] : []),
        ],
        acts: [bake.id, ...(tag ? [tag.id] : []), post.id],
      };
    } finally {
      this.store.saveIdentity(me);
    }
  }

  /** A key delivery of the collective's (Envelopes type 1), by a member with their own key, sealed to `extra` (a buyer) and every member (rule 57). */
  private async collectiveKeyDelivery(me: TestIdentity, c: CollectiveHere, bake: string, key: string, extra: string[], lines: Line[]): Promise<string> {
    const s = this.settings();
    const { parties } = await collectiveNow(c.id, c.places, s.via);
    const at = await chainFor(c.id, c.places, s.via);
    const to = list([...extra, ...parties]);
    const kd = await signAsMember(c.id, me, at, { spec: SPECS.envelopes, type: KEY_DELIVERY, payload: keyDeliveryPayload(bake, key), public: false, to });
    const keys: { id: string; key: Uint8Array }[] = [];
    const inboxes: string[] = [];
    for (const m of to) {
      const l = await lookUp(m, list([...c.places, ...s.relays]), s.via).catch(() => null);
      if (!l?.encryptionKey) {
        lines.push({ text: `${this.store.names()(m)} publishes no encryption key: the key could not be sealed to them.`, tone: 'warn' });
        continue;
      }
      keys.push({ id: m, key: l.encryptionKey });
      inboxes.push(...(l.inbox(SPECS.envelopes) ?? []));
    }
    for (const x of extra) if (!keys.some((k) => k.id === x)) throw new Error('the buyer publishes no encryption key');
    const sealed = sealFor(kd.act, kd.key, keys);
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

  // ------------------------------------------------------------ a price tag, changed or withdrawn

  /**
   * A price tag withdrawn, read back first (Money rule 18: its next version,
   * with no price, signed by its signer alone): on a bare bake uploaded
   * here, or on a publication this identity signs tags for.
   */
  prepareTagWithdrawal(a: { on: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, me } = this.who(b);
      const s = this.settings();
      const blocking: string[] = [];
      const bake = b.bakes.find((x) => x.bake === a.on);
      const pub = b.publications.find((x) => x.id === a.on);
      const tag = bake?.tag ?? pub?.tag ?? null;
      if (!tag) blocking.push('There is no price tag kept here on that to withdraw.');
      else if (!tag.price) blocking.push('That price tag is withdrawn already.');
      else if (tag.signer !== acting) blocking.push(`That price tag was signed by ${this.asking.names()(tag.signer)}: only its signer withdraws it (Money rule 18).`);
      const title = bake?.title ?? pub?.title ?? '…';
      const reading: Reading = {
        title: `Withdraw the price tag of “${title}”`,
        summary: ['A new version of the price tag, with no price, signed by you alone: from then on, paying it buys nothing.', pub ? 'The publication stands: to stop it for everyone, end it (every party signs that).' : BAKE_STAYS_SAY],
        sections: [{ heading: 'What is signed', lines: [{ text: `The price tag’s next version (${tag ? tag.versions.length + 1 : '?'}), naming its first and the one it replaces, carrying no price.` }, { text: 'Past purchases stand. A payment racing the withdrawal is owed back (Money rule 18).', tone: 'warn' }] }],
        plain: [],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba tag withdrawal, version 1', acting, a.on, tag?.latest ?? '']));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !tag) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, s.relays);
          const latest = (await tagsOf(bake ? { bake: bake.bake } : { publication: pub!.id }, me.id, list([...s.relays, ...s.homes]), s.via)).latest;
          if (!latest?.price) throw new Error('Its latest version was not found at the relays, or carries no price already. Nothing was signed.');
          const w = await withdrawTag(me, latest, s.relays);
          const bb = this.book();
          const t = bake ? bb.bakes.find((x) => x.bake === bake.bake)!.tag! : bb.publications.find((x) => x.id === pub!.id)!.tag!;
          t.latest = w.id;
          t.versions.push(w.id);
          t.price = null;
          this.save(bb);
          return { title: 'Price tag withdrawn', lines: [{ text: `The price tag of “${title}” is withdrawn: its version ${w.version} carries no price. Paying it buys nothing now.`, tone: 'ok' }], acts: [w.id] };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
  }

  /** A price tag on a bare bake uploaded here, added after the upload (way 1, later), read back first. */
  prepareTag(a: { bake: string; price: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, me } = this.who(b);
      const s = this.settings();
      const blocking: string[] = [];
      const bake = b.bakes.find((x) => x.bake === a.bake && x.member === acting);
      if (!bake) blocking.push('That upload is not kept here.');
      else if (bake.collective) blocking.push('A collective’s price tag is set at its upload, here: a later one is not offered yet.');
      const price = this.priceOf(a.price, blocking);
      const reading: Reading = {
        title: `A price tag on “${bake?.title ?? '…'}”`,
        summary: [`A price tag, public, naming the bare bake: ${this.said(price)}, paid to you, the uploader, unsplit (Money rule 18).`, bake?.tag?.price ? 'It replaces the price tag in force: its next version.' : 'Its first version.'],
        sections: [{ heading: 'Stated costs', lines: [{ text: 'Whoever pays it pays you alone, whatever any claim or ownership agreement says: money to a bare bake is the uploader’s. To share it, sell it through a publication instead.', tone: 'warn' }] }],
        plain: [],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba tag, version 1', acting, a.bake, price ?? 0]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !bake || !price) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, s.relays);
          const after = bake.tag ? (await tagsOf({ bake: bake.bake }, me.id, list([...s.relays, ...s.homes]), s.via)).latest : null;
          const t = await putTag(me, { bake: bake.bake }, { price: { unit: REGTEST_UNIT, value: price }, payee: me.id, relays: s.relays, after });
          const bb = this.book();
          const x = bb.bakes.find((y) => y.bake === bake.bake)!;
          x.tag = x.tag ? { ...x.tag, latest: t.id, versions: [...x.tag.versions, t.id], price } : { first: t.id, latest: t.id, versions: [t.id], price, signer: me.id };
          this.save(bb);
          return { title: 'Price tag signed', lines: [{ text: `“${bake.title}” has a price tag: ${this.said(price)}, paid to you.`, tone: 'ok' }], acts: [t.id] };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
  }

  // ------------------------------------------------------------ way 2: claim

  /** What a typed work names: a bake (its work's fingerprint), a vow (its name), or a fingerprint itself. */
  private async workOf(typed: string, blocking: string[]): Promise<{ work: string; bake: string | null; vow: string | null; signer: string | null; title: string | null }> {
    const s = this.settings();
    const b = this.book();
    const t = typed.trim().toLowerCase();
    let id = t;
    if (!HEX64.test(id)) {
      try {
        id = readId(typed);
      } catch {
        blocking.push('The work: a bake’s ID (an upload, here or anywhere), a vow’s name, or a work’s fingerprint (64 hexadecimal characters).');
        return { work: '', bake: null, vow: null, signer: null, title: null };
      }
    }
    const kept = b.bakes.find((x) => x.bake === id);
    if (kept) return { work: kept.work, bake: kept.bake, vow: null, signer: kept.as, title: kept.title };
    const act = await actAt(id, list([...s.relays, ...s.homes]), s.via);
    if (act) {
      const sealed = readSealed(act);
      if (sealed) return { work: sealed.work, bake: sealed.bake, vow: null, signer: sealed.seller, title: null };
      const v = readVow(act);
      if (v?.genesis) return { work: v.name, bake: null, vow: v.name, signer: v.signer, title: v.words.slice(0, 80) };
    }
    return { work: id, bake: null, vow: null, signer: null, title: null };
  }

  /** Way 2, read back before anything is signed: a claim of a work already uploaded (or a vow's name), with the other creators asked to sign. */
  prepareClaim(a: { work: string; title?: string; creators?: { who: string }[] }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, me, collective } = this.who(b);
      const names = this.asking.names();
      const blocking: string[] = [];
      if (collective) blocking.push('A collective’s claim is not offered here yet: act as yourself to claim a work.');
      const w = await this.workOf(a.work ?? '', blocking);
      const creators = this.others(acting, a.creators ?? [], blocking);
      const title = (a.title ?? '').trim() || w.title || '';
      if (!title) blocking.push('Give it a title: how it is called here and in the people’s To sign.');
      const reading: Reading = {
        title: `Claim “${title || '…'}”`,
        summary: [`A claim, public: “I made this”, binding ${w.vow ? 'the vow’s name' : 'the work’s fingerprint'} to its creators: ${[acting, ...creators].map(names).join(', ')}.`, creators.length ? `Bound once ${creators.map(names).join(', ')} ${creators.length === 1 ? 'has' : 'have'} signed it, each in their own Edubba (To sign).` : 'You alone: bound by your claim alone (Agreements rule 7).'],
        sections: [
          {
            heading: 'What it names',
            lines: [
              { text: w.bake ? `The work of the bake ${short(w.bake)}${w.signer ? `, uploaded by ${names(w.signer)}` : ''}: fingerprint ${w.work.slice(0, 16)}…` : w.vow ? `The vow ${short(w.vow)}${w.signer ? `, by ${names(w.signer)}` : ''}, by its name.` : w.work ? `The work whose fingerprint is ${w.work.slice(0, 16)}… (no bake of it was found where Edubba looks: it names the fingerprint alone).` : 'Nothing yet.' },
              ...(w.signer && w.signer !== acting && w.bake ? [{ text: `Its uploader is ${names(w.signer)}, not you: a claim says who made it, the bake who uploaded it. Money to its bare bake stays its uploader’s.`, tone: 'warn' as const }] : []),
            ],
          },
          { heading: 'Stated costs', lines: [{ text: 'A claim records who said it first on MOR, never who truly made it: another claim of the same work stays openly contested beside it (rule 7).', tone: 'warn' }, { text: 'Next, if you want: an ownership agreement from it, then a publication. A claim alone sells nothing.' }] },
        ],
        plain: [],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba claim, version 1', acting, w.work, title, creators]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !w.work) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, this.settings().relays);
          const r = await this.claimNow(me, { work: w.work, title, bake: w.bake, vow: w.vow, creators });
          return { title: 'Claimed', lines: r.lines, acts: [r.claim] };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
  }

  /** Sign a claim, keep it, and ask every other creator to sign it. */
  private async claimNow(me: TestIdentity, a: { work: string; title: string; bake: string | null; vow: string | null; creators: string[] }): Promise<{ claim: string; lines: Line[] }> {
    const s = this.settings();
    const made = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.claim, claimPayload(a.work, [me.id, ...a.creators]), { public: true, relays: s.relays });
    const b = this.book();
    b.claims.unshift({ claim: made.id, work: a.work, title: a.title, bake: a.bake, vow: a.vow, by: me.id, creators: [me.id, ...a.creators], at: now() });
    const bk = b.bakes.find((x) => x.bake === a.bake);
    if (bk) bk.claim = made.id;
    this.save(b);
    const lines: Line[] = [{ text: `The claim ${short(made.id)} is public: “${a.title}”, made by ${[me.id, ...a.creators].map(this.asking.names()).join(', ')}.`, tone: 'ok' }];
    if (a.creators.length) {
      const r = await this.asking.ask(me, { id: made.id, kind: 'claim', title: a.title, acts: [made.id], people: a.creators, text: `A claim to sign: “${a.title}”, made with ${short(me.id)}. Read it in To sign, from its exact bytes, and sign it, or decline.` });
      lines.push(...r.lines);
    } else this.asking.keep({ id: made.id, kind: 'claim', title: a.title, by: me.id, acts: [made.id], people: [], signed: {}, threads: {}, state: 'complete', at: now() });
    return { claim: made.id, lines };
  }

  // ------------------------------------------------------------ way 3: an ownership agreement

  /**
   * Way 3, read back before anything is signed: from a claim, who owns
   * what share (H98: you and one other first, then more; even until
   * touched). Ownership only: no split, no fees, no split service. Each
   * other owner signs it in their own Edubba.
   */
  prepareOwnership(a: { claim: string; title?: string; people: PeopleIn }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, me, collective } = this.who(b);
      const s = this.settings();
      const names = this.asking.names();
      const blocking: string[] = [];
      if (collective) blocking.push('A collective’s ownership agreement is its own agreement: act as yourself here.');
      let claim = (a.claim ?? '').trim();
      try {
        if (claim && !HEX64.test(claim)) claim = readId(claim);
      } catch {
        blocking.push('The claim: its ID, as To sign or this tab shows it.');
      }
      if (!claim) blocking.push('Choose the claim it is made from: an ownership agreement targets a claim (Agreements rule 7).');
      const kept = b.claims.find((x) => x.claim === claim);
      let creators: string[] = kept?.creators ?? [];
      let work = kept?.work ?? '';
      if (claim && !kept) {
        const act = await actAt(claim, list([...s.relays, ...s.homes]), s.via);
        const d = act ? (describeAct(act) as { spec?: string; type?: number; payload?: Uint8Array }) : null;
        if (!d?.payload || d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.claim) blocking.push('That claim was not found where Edubba looks, or it is no claim.');
        else {
          const m = cborDecode(d.payload) as Map<number, unknown>;
          work = hex(m.get(0) as Uint8Array);
          creators = ((m.get(1) as Uint8Array[]) ?? []).map(hex);
        }
      }
      const r = this.asking.shares(acting, a.people);
      blocking.push(...r.problems);
      const title = (a.title ?? '').trim() || kept?.title || '';
      if (!title) blocking.push('Give it a title: its words begin with it.');
      // A vow's name claimed: the founding writes the stake to the vow's signer, a second version shares it (rule 14).
      const wAct = work ? await actAt(work, list([...s.relays, ...s.homes]), s.via) : null;
      const vow = wAct ? readVow(wAct) : null;
      if (vow && vow.signer !== acting) blocking.push(`It claims a vow of ${names(vow.signer)}: its ownership agreement is set up by the vow’s signer (rule 14).`);
      // Its words name each owner by a short form of their ID: your names for them are your own, and these words are public.
      const words = ownershipWords(title, r.shares, short);
      const draft: DealDraft = { title, what: vow ? 'a vow' : 'a work', shares: r.shares, claim: claim || sha256('a claim to come'), referral: 0, service: '' };
      let payload: Uint8Array | null = null;
      try {
        payload = dealTermsPayload(draft, words, vow ? acting : null);
      } catch (e) {
        if (!r.problems.length) blocking.push(`Agreements refuse these terms: ${err(e)}`);
      }
      const notCreators = r.shares.map(([id]) => id).filter((id) => creators.length && !creators.includes(id));
      const reading: Reading = {
        title: `An ownership agreement: “${title || '…'}”`,
        summary: [`Who owns the work its claim names, and what share: ${r.shares.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ')}.`, 'Ownership only: no split, no fees, no split service. How it is sold, with which partners and who takes what, is a publication’s, which reads these shares (Agreements rule 7).'],
        sections: [
          { heading: 'Who owns it', lines: r.shares.map(([id, n]) => ({ text: `${names(id)}: ${pct(n)}${id === acting ? ' (you)' : ''}.` })) },
          {
            heading: 'Who signs, and when it counts',
            lines: [
              { text: 'You sign it first; each other owner is sent it, sealed, and signs it in their own Edubba (To sign). It counts once every one has signed (rule 1).' },
              ...(vow ? [{ text: 'It claims a vow: its first version writes the whole stake to you, the vow’s signer (rule 14); a second version, signed by everyone, shares it.' }] : []),
              { text: 'Changing it later needs every owner: nobody’s share is lowered without them (rules 8, 47).', tone: 'warn' as const },
            ],
          },
          ...(notCreators.length ? [{ heading: 'Stated costs', lines: [{ text: `${notCreators.map(names).join(', ')} ${notCreators.length === 1 ? 'is' : 'are'} not among the claim’s creators: an owner need not be a creator, and the agreement says so in public.`, tone: 'warn' as const }] }] : []),
        ],
        plain: [{ heading: 'Its words, which every owner signs', text: words }],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba ownership agreement, version 1', acting, claim, title, r.shares, s.relays]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !payload) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, s.relays);
          const t = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.terms, payload, { public: true, relays: s.relays });
          await sign(me, t.id, s.relays);
          let version = t.id;
          if (vow) {
            const c = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.terms, dealClonePayload(draft, words, t.id), { public: true, relays: s.relays, objects: [[t.id, t.id]] });
            await sign(me, c.id, s.relays);
            version = c.id;
          }
          const bb = this.book();
          bb.ownerships.unshift({ id: t.id, version, claim, title, by: me.id, holders: r.shares, at: now() });
          this.save(bb);
          const others = r.shares.map(([id]) => id).filter((id) => id !== me.id);
          const acts = list([t.id, version]);
          const asked = await this.asking.ask(me, { id: t.id, kind: 'ownership', title, acts, people: others, text: `An ownership agreement to sign: “${title}”, proposed by ${short(me.id)}. Read it in To sign, from its exact bytes, and sign it, or decline.` });
          return { title: 'Signed by you, sent to each owner', lines: [{ text: `The ownership agreement ${short(t.id)} is signed by you.`, tone: 'ok' }, ...asked.lines, { text: 'It counts once every owner has signed: their signatures are looked for each time Publishing opens (or with “Look for signatures”). Then build a publication from it.' }], acts };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
  }

  // ------------------------------------------------------------ way 4: a publication

  /**
   * Way 4, read back before anything is signed: a publication from an
   * ownership agreement (or as its lone seller): what it sells, its
   * partners, its split service and referral, its price tag and who signs
   * it. Every party signs it: the owners, each partner, the service.
   */
  preparePublication(a: { owners?: string; sold?: string[]; partners?: { who: string; share?: string; label?: string }[]; service: string; referral?: string; price: string; tagBy?: string; words?: string; title?: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, as, me, collective } = this.who(b);
      const s = this.settings();
      const names = this.asking.names();
      const blocking: string[] = [];
      // The owners: an ownership agreement (by its founding version), or none: you, its lone seller.
      let owners: string | null = (a.owners ?? '').trim() || null;
      let holders: [string, number][] = [[acting, PARTS]];
      let parties: string[] = [acting];
      let ownTitle = '';
      // A collective's publication (Agreements rules 15, 58, 60): its owners the collective's own founding agreement, its shares read
      // by reference from its agreement in force; made by a member with their own key for it, under the rule reaching publications.
      let c: CollectiveHere | null = null;
      let area: AreaHere | null = null;
      if (collective) {
        owners = null;
        c = await this.collectiveHere(me, as);
        if (c.why) blocking.push(`The collective ${short(as)}: ${c.why}.`);
        else {
          owners = (await collectiveVerifier(c.id, c.places, s.via)).founding;
          area = (await areaReaching(c.id, c.places, { spec: MIRS.agreements, type: AGREEMENTS_TYPES.publication }, s.via).catch(() => ({ area: null }))).area;
          if (!area) blocking.push(`The collective ${short(as)}: no rule of its agreement reaches publications (the Agreements layer).`);
          else if (!area.holders.includes(acting)) blocking.push(`The collective ${short(as)}: you have no voice in ${area.name.startsWith('the ') ? area.name : `its area “${area.name}”`}, which reaches publications.`);
          const t = c.agreement ? ((await termsAt(c.agreement, c.places, s.via)) as { stakes?: [string | null, [string | null, number][]][] } | null) : null;
          const own = t?.stakes?.find(([o]) => o === null)?.[1] ?? [];
          holders = own.filter((x): x is [string, number] => typeof x[0] === 'string');
          parties = [as];
          ownTitle = `the collective ${short(as)}`;
        }
        if (a.tagBy === 'me') blocking.push('A collective’s publication: its split service signs its price tag, in its own app.');
      } else if (owners) {
        try {
          if (!HEX64.test(owners)) owners = readId(owners);
        } catch {
          blocking.push('The ownership agreement: its ID, as this tab shows it.');
        }
        const kept = b.ownerships.find((o) => o.id === owners || o.version === owners);
        if (kept) {
          owners = kept.id;
          holders = kept.holders;
          parties = kept.holders.map(([id]) => id);
          ownTitle = kept.title;
          const w = this.asking.get(kept.id);
          if (w && w.state !== 'complete') blocking.push(`The ownership agreement “${kept.title}” waits for ${w.people.filter((p) => w.acts.some((x) => !w.signed[p]?.[x])).map(names).join(', ')} to sign: a publication naming it counts only once it does. Look for signatures first.`);
        } else if (owners) {
          const act = await actAt(owners, list([...s.relays, ...s.homes]), s.via);
          const o = act ? ownershipOf(act) : null;
          if (!o) blocking.push('That ownership agreement was not found where Edubba looks, or it is no work’s ownership agreement.');
          else if (o.parent) blocking.push('Name an ownership agreement by its founding version (rule 12), not a later one.');
          else {
            holders = o.holders;
            parties = o.parties;
            ownTitle = o.text.slice(0, 80);
          }
        }
        if (owners && !parties.includes(acting)) blocking.push('You are not one of its owners: a publication of a work is drafted by one of its owners.');
      }
      // What it sells: bakes by ID, or a vow by its name.
      const bakes: string[] = [];
      let vow: string | null = null;
      for (const typed of (a.sold ?? []).map((x) => x.trim()).filter(Boolean)) {
        let id = typed.toLowerCase();
        try {
          if (!HEX64.test(id)) id = readId(typed);
        } catch {
          blocking.push(`What it sells: “${short(typed)}” is no ID.`);
          continue;
        }
        const kept = b.bakes.find((x) => x.bake === id);
        if (kept) {
          if (!bakes.includes(id)) bakes.push(id);
          continue;
        }
        const act = await actAt(id, list([...s.relays, ...s.homes]), s.via);
        if (act && readSealed(act)) bakes.push(id);
        else if (act && readVow(act)?.genesis) vow = id;
        else blocking.push(`What it sells: ${short(id)} is neither a bake nor a vow found where Edubba looks.`);
      }
      if (!bakes.length && !vow) blocking.push('Choose what it sells: an upload (a bake), or a vow by its name.');
      if (bakes.length && vow) blocking.push('One publication sells bakes, or a vow: not both here.');
      // Its partners: any identity, each with an optional label and a share off the top.
      const partners: { identity: string; share: number; label: string | null }[] = [];
      for (const p of a.partners ?? []) {
        if (!p.who.trim()) continue;
        const x = this.asking.person(p.who, acting, { ids: true });
        if ('why' in x) {
          blocking.push(`A partner: ${x.why}`);
          continue;
        }
        const n = Number((p.share ?? '').trim().replace('%', '') || '0');
        if (!Number.isFinite(n) || n < 0 || n >= 100) blocking.push(`${names(x.id)}: a partner’s share is a percentage from 0 to under 100, off the top.`);
        const label = (p.label ?? '').normalize('NFC').trim();
        if (label.length > 60) blocking.push(`${names(x.id)}: a label is a few words (“client”, “relay”, “split service”…).`);
        if (partners.some((y) => y.identity === x.id)) blocking.push(`${names(x.id)} is named twice among the partners.`);
        else partners.push({ identity: x.id, share: Math.round((Number.isFinite(n) ? n : 0) * 10_000), label: label || null });
      }
      // The split service: receives every payment, and pays everyone (rule 16).
      let service: string | null = null;
      const sv = this.asking.person(a.service ?? '', acting, { ids: true });
      if ('why' in sv) blocking.push(sv.why === 'empty' ? 'Name the split service that receives every payment and pays everyone: a name in your contacts, or its ID.' : `The split service: ${sv.why}`);
      else service = sv.id;
      const r = (a.referral ?? '').trim() ? Number((a.referral ?? '').trim().replace('%', '')) : 0;
      if (!Number.isFinite(r) || r < 0 || r >= 100) blocking.push('A referral share is a percentage from 0 to under 100.');
      const referral = Math.round((Number.isFinite(r) ? r : 0) * 10_000);
      const top = partners.reduce((x, p) => x + p.share, 0) + referral;
      if (top >= PARTS) blocking.push(`The partners’ shares and the referral take ${pct(top)} off the top: they must leave something to the owners.`);
      const price = this.priceOf(a.price, blocking);
      // Who signs its price tag: its split service, in its own app, or you, as the party it designates (field 10, one of its parties).
      const tagByMe = a.tagBy === 'me' && !collective;
      const myParty = !owners || partners.some((p) => p.identity === acting) || service === acting;
      if (tagByMe && !myParty) blocking.push('You sign its price tag only as one of its parties (field 10): add yourself as a partner (a “publisher”, at 0% if you like), or let the split service sign it.');
      const designated = tagByMe && service !== acting ? acting : null;
      const title = (a.title ?? '').trim() || ownTitle || b.bakes.find((x) => x.bake === bakes[0])?.title || '';
      if (!title) blocking.push('Give it a title: the public words of the post announcing it.');
      const words = (a.words ?? '').normalize('NFC').trim() || (vow ? vowOfferWords(this.vowWords(b, vow) ?? 'as promised.', this.said(price)) : `“${title}”, sold through its split service for ${this.said(price)}${referral ? `; ${pct(referral)} of each payment to the repost the buyer names` : ''}.`);
      let made: { type: number; payload: Uint8Array } | null = null;
      if (service) {
        try {
          made = publicationPayload({ sold: vow ? [{ vow }] : bakes.map((bake) => ({ bake })), ...(owners ? { owners } : {}), partners: partners.map((p) => ({ identity: p.identity, share: p.share, ...(p.label ? { label: p.label } : {}) })), service, plan: { shares: referral ? [{ role: 'referral', part: referral }] : [], cmip: SPLIT_CMIP }, words, ...(designated ? { designated } : {}) }) as { type: number; payload: Uint8Array };
        } catch (e) {
          blocking.push(`Agreements refuse this publication: ${err(e)}`);
        }
      }
      const people = list([...(collective ? [] : parties.filter((x) => x !== acting)), ...partners.map((p) => p.identity).filter((x) => x !== acting), ...(service && service !== acting ? [service] : [])]);
      // A collective's: the other members its rule asks, each signing with their own key in their own app (rules 6, 60).
      const cosigners = collective && area && area.number > 1 ? area.holders.filter((h) => h !== acting) : [];
      const barePriced = bakes.map((x) => b.bakes.find((y) => y.bake === x)).filter((x) => x?.tag?.price);
      const notMine = bakes.filter((x) => !b.bakes.some((y) => y.bake === x && y.key && (collective ? y.as === as : !y.collective)));
      const reading: Reading = {
        title: `A publication: “${title || '…'}”`,
        summary: [
          collective
            ? `Sold by the collective ${short(as)}, made by you (${names(acting)}) with your own key for it, under ${area ? (area.name.startsWith('the ') ? area.name : `its area “${area.name}”`) : 'its rule for publications'}; its owners its constitution in force (${holders.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ')}), read by reference at each payment.`
            : owners
              ? `Sold by the owners of “${ownTitle || short(owners)}” (${holders.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ')}), read from their ownership agreement in force.`
              : 'Sold by you alone: a lone seller’s publication, you its only owner.',
          `Every payment goes to its split service, ${service ? names(service) : '…'}, which pays everyone: the partners and the referral off the top, then the owners by their shares.`,
        ],
        sections: [
          { heading: 'What it sells', lines: [...bakes.map((x) => ({ text: `The upload ${b.bakes.find((y) => y.bake === x)?.title ? `“${b.bakes.find((y) => y.bake === x)!.title}”` : short(x)} (a bake).` })), ...(vow ? [{ text: `The vow ${short(vow)}, by its name.` }] : []), { text: `Its price tag: ${this.said(price)}, signed by ${designated || service === acting ? 'you, the party it designates' : 'its split service, in its own app'}, paid to the split service.` }] },
          {
            heading: 'Who takes what',
            lines: [
              ...partners.map((p) => ({ text: `${names(p.identity)}${p.label ? ` (“${p.label}”)` : ''}: ${pct(p.share)} off the top, a partner.` })),
              ...(referral ? [{ text: `Off the top: ${pct(referral)} of each payment to whoever reposted it where the buyer found it.` }] : []),
              { text: `The rest, to the owners: ${holders.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ')}.` },
            ],
          },
          {
            heading: 'Who signs, and when it counts',
            lines: [
              { text: 'You draft it, which is your signature. Each other party signs it: every owner (the ownership agreement consents through every one of them), each partner, and the split service in its own app. It sells once every one has signed (rule 11).' },
              ...(people.length ? [{ text: `Asked to sign: ${people.map(names).join(', ')}.` }] : []),
              ...(collective ? [{ text: area && area.number > 1 ? `Its rule asks ${area.number} members: ${cosigners.map(names).join(', ')} asked, each signing with their own key.` : 'For the collective, your act alone is its consent under its rule.' }] : []),
              { text: 'Once it counts: its price tag, a post announcing it, and the work’s key sealed to each owner.' },
            ],
          },
          {
            heading: 'Stated costs',
            lines: [
              { text: 'The split service sees who pays, how much and for what, never the work; it holds the money until it pays each one.', tone: 'warn' },
              { text: 'To end it later, a version selling nothing, signed by every party: no party ends it alone. Its price tag’s signer can stop sales at once by withdrawing the tag.', tone: 'warn' },
              ...(barePriced.length ? [{ text: `${barePriced.map((x) => `“${x!.title}”`).join(', ')} still ${barePriced.length === 1 ? 'has' : 'have'} a price tag on the bare bake, paying you alone: withdraw it, so buyers pay through the publication.`, tone: 'warn' as const }] : []),
              ...(notMine.length ? [{ text: `The key of ${notMine.map(short).join(', ')} is not kept here: its uploader’s app delivers it to buyers, or nobody does.`, tone: 'warn' as const }] : []),
            ],
          },
        ],
        plain: [{ heading: 'Its words, which every party signs', text: words }],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba publication, version 1', acting, as, made ? hex(made.payload) : '', title, price ?? 0, people]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !made || !service || !price) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, s.relays);
          let p: { id: string; act: Uint8Array };
          const lines: Line[] = [];
          if (collective) {
            const at = await chainFor(c!.id, c!.places, s.via);
            p = await signAsMember(c!.id, me, at, { spec: MIRS.agreements, type: made.type, payload: made.payload, public: true, objects: [[owners!, owners!]] });
            if (!(await publishAt([p.act], list([...c!.places, ...s.relays]), s.via)).length) throw new Error('No relay took the publication: nothing counts. Try again.');
            lines.push({ text: `The publication ${short(p.id)} is made for the collective ${short(c!.id)} by you, with your own key, naming it.`, tone: 'ok' });
            for (const h of cosigners) {
              try {
                const l = await lookUp(h, c!.places, s.via);
                const inbox = l.inbox(MIRS.agreements) ?? [];
                if (!l.encryptionKey || !inbox.length) throw new Error('no inbox or encryption key');
                await negotiate(me, { id: h, key: l.encryptionKey, inbox }, { text: `${names(me.id)} made a publication of the collective, “${title}”: act ${p.id}. Its rule asks ${area!.number} members: read it in your Signing tab, then sign or decline.`, refs: [[p.id, c!.id], [c!.id, c!.id]] });
                lines.push({ text: `${names(h)} is asked, in their own app.`, tone: 'ok' });
              } catch (e) {
                lines.push({ text: `${names(h)} could not be asked: ${err(e)}`, tone: 'warn' });
              }
            }
          } else {
            p = await me.publish(MIRS.agreements, made.type, made.payload, { public: true, relays: s.relays, ...(owners ? { objects: [[owners, owners]] as [string, string][] } : {}) });
            lines.push({ text: `The publication ${short(p.id)} is drafted and signed by you.`, tone: 'ok' });
          }
          // The split service signs it in its own app (rule 11: every party signs).
          if (service !== me.id) lines.push(this.askService(service, p.id));
          const here: PublicationHere = { id: p.id, latest: p.id, title, by: me.id, collective: collective ? as : null, owners, holders, bakes, vow, partners, service, referral, designated, price, words, people: list([...people, ...cosigners]), state: 'waiting', tag: null, post: null, delivered: {}, at: now() };
          const bb = this.book();
          bb.publications.unshift(here);
          this.save(bb);
          const asked = await this.asking.ask(me, { id: p.id, kind: 'publication', title, acts: [p.id], people: people.filter((x) => x !== service), text: `A publication to sign: “${title}”, drafted by ${short(me.id)}. Read it in To sign, from its exact bytes, and sign it, or decline.` });
          // The service is waited on too, though it reads no proposal: it signs in its own app; so are a collective's other members asked above.
          const w = asked.waiting;
          if (service !== me.id || cosigners.length) {
            w.people = list([...w.people, ...(service !== me.id ? [service] : []), ...cosigners]);
            w.state = 'waiting';
            this.asking.keep(w);
          }
          lines.push(...asked.lines);
          // Nobody else to wait for: it counts now.
          if (w.state === 'complete') lines.push(...(await this.publicationCounts(me, p.id)));
          else lines.push({ text: 'It sells once every party has signed: their signatures are looked for each time Publishing opens (or with “Look for signatures”).' });
          return { title: w.state === 'complete' ? 'Published' : 'Signed by you, sent to each party', lines, acts: [p.id] };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
  }

  private vowWords(b: Book, vow: string): string | null {
    return b.vows.find((v) => v.vow === vow)?.words ?? null;
  }

  /** What the split service is told: it signs in its own app, its operator given the act's ID (the test split service: `mor-split-service accept ID`). */
  private askService(service: string, act: string): Line {
    return { text: `Its split service, ${this.asking.names()(service)}, signs it in its own app: give its operator the ID ${act} (the test split service: mor-split-service accept ${act}).`, tone: 'warn' };
  }

  /**
   * A publication every party signed: judged by the core where its acts are
   * found; then its price tag (where you sign it), the post announcing it,
   * and the work's key sealed to each other owner.
   */
  private async publicationCounts(me: TestIdentity, id: string): Promise<Line[]> {
    const s = this.settings();
    const names = this.asking.names();
    const b = this.book();
    const p = b.publications.find((x) => x.id === id);
    if (!p) return [];
    const lines: Line[] = [];
    const judged = await this.judgePublication(p).catch(() => null);
    if (judged && !judged.counts) {
      const problems = judged.problems.filter((x) => !/not every party has signed/.test(x));
      if (problems.length || judged.unsigned.some((u) => u !== p.owners)) throw new Error(`Agreements do not count it yet: ${[...problems, ...(judged.unsigned.length ? [`not signed by ${judged.unsigned.map(names).join(', ')}`] : [])].join('; ')}`);
    }
    if (p.collective) return this.collectivePublicationCounts(me, p, b);
    await this.desk.keyCurrent(me.id);
    await carryChain(me, s.relays);
    let tagAct: Uint8Array | null = null;
    if (p.designated === me.id || p.service === me.id) {
      const t = await putTag(me, { publication: p.id }, { price: { unit: REGTEST_UNIT, value: p.price }, payee: p.service, relays: s.relays });
      p.tag = { first: t.id, latest: t.id, versions: [t.id], price: p.price, signer: me.id };
      tagAct = t.act;
      lines.push({ text: `Its price tag is public: ${this.said(p.price)}, paid to ${p.service === me.id ? 'you, its split service' : `its split service, ${names(p.service)}`}, signed by you, the party it designates.`, tone: 'ok' });
    } else lines.push({ text: `Its split service, ${names(p.service)}, puts its price tag on it in its own app (${this.said(p.price)}): a buyer can pay once it has.` });
    const pubAct = await actAt(p.id, list([...s.relays, ...s.homes]), s.via);
    const named: Uint8Array[] = [];
    for (const x of [...p.bakes, ...(p.vow ? [p.vow] : [])]) {
      const a = await actAt(x, list([...s.relays, ...s.homes]), s.via);
      if (a) named.push(a);
    }
    if (pubAct) named.push(pubAct);
    if (tagAct) named.push(tagAct);
    const post = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(p.title), { public: true, relays: s.relays, refs: named.map((a) => referenceTo(a)) });
    p.post = post.id;
    p.state = 'counts';
    lines.push({ text: `“${p.title}” is published: every party signed it. A post announces it.`, tone: 'ok' });
    // The key to every other owner: they co-own the work.
    for (const bake of p.bakes) {
      const kept = b.bakes.find((x) => x.bake === bake && x.key && !x.collective);
      if (!kept) continue;
      for (const [o] of p.holders.filter(([x]) => x !== me.id)) {
        try {
          await deliverKey(me, o, bake, kept.key!, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current: () => this.desk.keyCurrent(me.id) });
          lines.push({ text: `The key of “${kept.title}” is sealed to ${names(o)}, an owner.`, tone: 'ok' });
        } catch (e) {
          lines.push({ text: `The key of “${kept.title}” could not be sealed to ${names(o)}: ${err(e)}`, tone: 'warn' });
        }
      }
    }
    this.save(b);
    this.store.saveIdentity(me);
    return lines;
  }

  /** A collective's publication that counts: the post announcing it, made by the member for the collective (its key was sealed to every member at its upload). */
  private async collectivePublicationCounts(me: TestIdentity, p: PublicationHere, b: Book): Promise<Line[]> {
    const s = this.settings();
    const c = await this.collectiveHere(me, p.collective!);
    const places = list([...c.places, ...s.relays]);
    const named: Uint8Array[] = [];
    for (const x of [...p.bakes, ...(p.vow ? [p.vow] : []), p.id]) {
      const a = await actAt(x, places, s.via);
      if (a) named.push(a);
    }
    await this.desk.keyCurrent(me.id);
    const at = await chainFor(c.id, c.places, s.via);
    const post = await signAsMember(c.id, me, at, { spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload(p.title), public: true, refs: named.map((a) => referenceTo(a)) });
    this.store.saveIdentity(me);
    if (!(await publishAt([post.act], places, s.via)).length) throw new Error('No relay took the post announcing it. Try again.');
    p.post = post.id;
    p.state = 'counts';
    this.save(b);
    return [
      { text: `“${p.title}” is published by the collective ${short(c.id)}: every party signed it. A post announces it.`, tone: 'ok' },
      { text: `Its split service, ${this.asking.names()(p.service)}, puts its price tag on it in its own app (${this.said(p.price)}): a buyer can pay once it has.` },
    ];
  }

  /** A publication as the core judges it, from the acts of its drafter and every party found where Edubba looks (a collective's from its own chain too). */
  private async judgePublication(p: PublicationHere): Promise<{ counts: boolean; problems: string[]; unsigned: string[] }> {
    const s = this.settings();
    const places = list([...s.relays, ...s.homes]);
    const v = p.collective ? (await collectiveVerifier(p.collective, await collectivePlaces(p.collective, places, s.via), s.via, [p.latest])).v : new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
    const held: Uint8Array[] = [];
    for (const x of list([p.by, p.service, ...p.partners.map((y) => y.identity), ...p.holders.map(([h]) => h)])) {
      await lookUp(x, places, s.via, v).catch(() => null);
      for (const h of places) {
        const page = await relayAt(h, s.via).feed({ signer: x }).catch(() => null);
        for (const it of page?.items ?? []) if (it.kind === 'act') held.push(it.item);
      }
    }
    for (let pass = 0; pass < 3; pass++)
      for (const a of held)
        try {
          v.add(a);
        } catch {
          // held, or waits
        }
    return v.agreementsPublication(AGREEMENTS_SPECS, p.latest) as { counts: boolean; problems: string[]; unsigned: string[] };
  }

  /**
   * Withdraw a publication, read back first: a later version selling
   * nothing (Agreements rule 11), drafted by you, signed by every party of
   * it. Past sales stand.
   */
  preparePublicationEnd(a: { publication: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, me } = this.who(b);
      const s = this.settings();
      const names = this.asking.names();
      const blocking: string[] = [];
      const p = b.publications.find((x) => x.id === a.publication && x.by === acting);
      if (!p) blocking.push('That publication is not one drafted here.');
      else if (p.state === 'ended' || p.state === 'ending') blocking.push('Its ending is signed already.');
      else if (p.collective) blocking.push('A collective’s publication is ended by a version made for the collective: not offered here yet. To stop sales at once, its split service withdraws its price tag.');
      let made: { type: number; payload: Uint8Array } | null = null;
      if (p) {
        try {
          made = publicationPayload({ sold: [], ...(p.owners ? { owners: p.owners } : {}), partners: p.partners.map((x) => ({ identity: x.identity, share: x.share, ...(x.label ? { label: x.label } : {}) })), service: p.service, plan: { shares: p.referral ? [{ role: 'referral', part: p.referral }] : [], cmip: SPLIT_CMIP }, words: p.words, ...(p.designated ? { designated: p.designated } : {}) }) as { type: number; payload: Uint8Array };
        } catch (e) {
          blocking.push(`Agreements refuse its ending: ${err(e)}`);
        }
      }
      const reading: Reading = {
        title: `Withdraw the publication “${p?.title ?? '…'}”`,
        summary: ['A later version of it that sells nothing: once every party has signed it, the publication is ended for everyone (Agreements rule 11).', 'Past sales stand. A payment racing the ending is owed back, by the split service and each party paid from it.'],
        sections: [
          { heading: 'Who signs', lines: [{ text: `You, by drafting it; then ${p?.people.length ? p.people.map(names).join(', ') : 'nobody else'}.` }, { text: 'Until they have, it sells: to stop sales at once, its price tag’s signer withdraws the tag.', tone: 'warn' }] },
          { heading: 'What stays', lines: [{ text: BAKE_STAYS_SAY, tone: 'warn' }] },
        ],
        plain: [],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba publication end, version 1', acting, p?.latest ?? '']));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !p || !made) throw new Error('This cannot be signed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, s.relays);
          const x = await me.publish(MIRS.agreements, made.type, made.payload, { public: true, relays: s.relays, objects: [[p.id, p.latest] as [string, string], ...(p.owners ? [[p.owners, p.owners] as [string, string]] : [])] });
          const lines: Line[] = [{ text: `Its ending ${short(x.id)} is drafted and signed by you.`, tone: 'ok' }];
          if (p.service !== me.id) lines.push(this.askService(p.service, x.id));
          const asked = await this.asking.ask(me, { id: x.id, kind: 'ending', title: `the end of “${p.title}”`, acts: [x.id], people: p.people.filter((y) => y !== p.service), text: `The end of a publication to sign: “${p.title}”, a version selling nothing, drafted by ${short(me.id)}. Read it in To sign, and sign it, or decline.` });
          const w = asked.waiting;
          if (p.service !== me.id) {
            w.people = list([...w.people, p.service]);
            w.state = 'waiting';
            this.asking.keep(w);
          }
          const bb = this.book();
          const q = bb.publications.find((y) => y.id === p.id)!;
          q.latest = x.id;
          q.state = w.state === 'complete' ? 'ended' : 'ending';
          this.save(bb);
          lines.push(...asked.lines, { text: q.state === 'ended' ? 'It is ended: it sells nothing now.' : 'It ends once every party has signed its ending.' });
          return { title: q.state === 'ended' ? 'Publication ended' : 'Its ending signed by you, sent to each party', lines, acts: [x.id] };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
  }

  /** Look for everyone's signatures on what waits; a publication every party signed is published, an ending ends it. */
  gather(): Promise<{ lines: Line[] }> {
    return this.desk.serial(() => this.gatherNow());
  }

  private async gatherNow(): Promise<{ lines: Line[] }> {
    const names = this.asking.names();
    return this.asking.gather(async (w: Waiting) => {
      const me = this.me(w.by);
      if (w.kind === 'publication') return this.publicationCounts(me, w.id);
      if (w.kind === 'ending') {
        const b = this.book();
        const p = b.publications.find((x) => x.latest === w.id);
        if (p) p.state = 'ended';
        this.save(b);
        return [{ text: `“${p?.title ?? w.title}” is ended: every party signed its ending. It sells nothing now.`, tone: 'ok' }];
      }
      return [{ text: `“${w.title}”: ${w.people.map(names).join(', ')} signed it. ${w.kind === 'claim' ? 'The claim is bound.' : 'The ownership agreement counts: build a publication from it when you want.'}`, tone: 'ok' }];
    });
  }

  // ------------------------------------------------------------ vows (Agreements rule 13)

  /**
   * A vow read back before anything is signed: its words, its price, and
   * what a buyer may do with each sale (confirm or contest it). Sold by a
   * lone seller's publication, self-published: you its split service, its
   * price tag yours. To share a vow, claim it by its name, then an
   * ownership agreement and a publication (the four ways in, Publishing).
   */
  prepareVow(a: { words: string; title: string; price: string }): Promise<{ plan: string; digest: string; reading: Reading }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const { acting, as, me, collective } = this.who(b);
      const s = this.settings();
      const blocking: string[] = [];
      const words = (a.words ?? '').normalize('NFC').trim();
      if (!words) blocking.push('Say what is vowed, in words: what the buyer gets.');
      if (words.length > 2000) blocking.push('A vow’s words: at most 2,000 characters.');
      const title = (a.title ?? '').trim();
      if (!title) blocking.push('Give it a title: the public words of its post.');
      const price = this.priceOf(a.price, blocking);
      if (collective) blocking.push(`The collective ${short(as)}: a collective’s vow is sold through a publication of the collective, not offered here yet. Act as yourself.`);
      const priceSaid = this.said(price);
      const offerWords = vowOfferWords(words, priceSaid);
      const names = this.store.names();
      const reading: Reading = {
        title: `A vow: “${title || '…'}”`,
        summary: [`Published by ${names(acting)}: a vow, in words, sold for ${priceSaid} by a publication of your own (you its lone seller and its split service: paid to you).`, 'Each purchase is a sale, pending until its buyer confirms it (kept) or contests it (not kept), in their own app: Dub’s Signing tab, or Edubba. The core reads that state, never the promise itself (Agreements rule 13).'],
        sections: [
          {
            heading: 'What is published',
            lines: [
              { text: `The vow, public, its first act its name for good: “${words || '…'}”` },
              { text: `Its publication, selling it, its words: “${offerWords}”` },
              { text: `Its price tag: ${priceSaid}, signed by you, paid to you.` },
              { text: `A post naming them, “${title || '…'}”.` },
            ],
          },
          {
            heading: 'Stated costs',
            lines: [
              { text: 'Every sale’s confirmation and contest is public: anyone who looks at relays holding them reads how your vows were kept.', tone: 'warn' },
              { text: 'A vow names what is promised to the buyer, never the event itself; another vow for the same thing is another vow (F259).' },
              { text: 'To share what it earns, claim the vow by its name, then set up an ownership agreement and a publication (Publishing).' },
            ],
          },
        ],
        plain: [{ heading: 'The vow’s words', text: words }],
        blocking,
      };
      const digest = sha256(cborEncode(['MOR Edubba vow, version 2', acting, as, words, title, price ?? 0, s.relays]));
      const plan = this.plan(digest, async () => {
        if (blocking.length || !price) throw new Error('This cannot be published while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(me.id);
        try {
          await carryChain(me, s.relays);
          const vow = await me.publish(SPECS.envelopes, VOW, vowPayload(words), { public: true, relays: s.relays });
          const made = publicationPayload({ sold: [{ vow: vow.id }], partners: [], service: me.id, plan: { shares: [], cmip: SPLIT_CMIP }, words: offerWords }) as { type: number; payload: Uint8Array };
          const pub = await me.publish(MIRS.agreements, made.type, made.payload, { public: true, relays: s.relays });
          const tag = await putTag(me, { publication: pub.id }, { price: { unit: REGTEST_UNIT, value: price }, payee: me.id, relays: s.relays });
          const post = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(title), { public: true, relays: s.relays, refs: [referenceTo(vow.act), referenceTo(pub.act), referenceTo(tag.act)] });
          const bb = this.book();
          bb.vows.unshift({ vow: vow.id, publication: pub.id, offer: tag.id, post: post.id, as: me.id, member: me.id, collective: false, words, title, price, at: now() });
          this.save(bb);
          return { title: 'A vow, published', lines: [{ text: `“${title}” is published, sold by its own publication at ${s.relays.join(', ')}. Each buyer confirms or contests their sale.`, tone: 'ok' }], acts: [vow.id, tag.id, post.id, pub.id] };
        } finally {
          this.store.saveIdentity(me);
        }
      });
      return { plan, digest, reading };
    });
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

  // ------------------------------------------------------------ sales and keys

  /** Every sealed act in this identity's inbox and homes, opened. */
  private async inboxOf(me: TestIdentity): Promise<Map<string, { d: Opened; act: Uint8Array; key: Uint8Array | null }>> {
    const s = this.settings();
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const seen = new Map<string, { d: Opened; act: Uint8Array; key: Uint8Array | null }>();
    let inbox = list([...me.f.homes.map((h) => h.hint), ...s.relays]);
    try {
      const l = await lookUp(me.id, list([...s.homes, ...s.relays, ...me.f.homes.map((h) => h.hint)]), s.via);
      inbox = list([...l.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints), ...inbox]);
    } catch {
      // the places named here
    }
    for (const h of inbox) {
      let after: number | undefined;
      try {
        for (;;) {
          const page = await relayAt(h, s.via).feed({ to: me.id, after });
          for (const it of page.items) {
            if (it.kind !== 'sealed') continue;
            for (const sec of secrets) {
              try {
                const o = openSealed(it.item, me.id, sec) as { act: Uint8Array; key?: Uint8Array | null; described: Opened };
                seen.set(o.described.id, { d: o.described, act: new Uint8Array(o.act), key: o.key ? new Uint8Array(o.key) : null });
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
    return seen;
  }

  /**
   * The buyers' contests shown beside each sale of a bare bake uploaded here
   * in one's own name (F386): each buyer's claim of the payment, sealed to
   * the seller and left in its inbox, opened here and given to the core with
   * the parties' chains and the public contests; `unknown` where the core
   * cannot say, never "none".
   */
  salesContests(): Promise<{ by: Record<string, Record<string, ContestsBeside>>; problems: string[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const s = this.settings();
      const acting = this.actingOf(b);
      const bakes = b.bakes.filter((w) => !w.collective && w.member === acting && Object.keys(w.delivered).length);
      if (!acting || !bakes.length) return { by: {}, problems: [] };
      const me = this.me(acting);
      const buyers = list(bakes.flatMap((w) => Object.keys(w.delivered)));
      const tags = new Map(bakes.flatMap((w) => (w.tag?.versions ?? []).map((t) => [t, w.bake] as [string, string])));
      const seen = await this.inboxOf(me);
      const found: { bake: string; buyer: string; id: string; act: Uint8Array; key: Uint8Array | null }[] = [];
      for (const o of seen.values()) {
        const d = o.d;
        // A payer's claim (Money type 3) from a buyer, naming one of the price tags kept here.
        if (d.spec !== MIRS.money || d.type !== 3 || !d.signer || !buyers.includes(d.signer) || !d.payload) continue;
        try {
          const c = (moneyRead(3, d.payload) as { act: { fulfils?: string } }).act;
          const bake = c.fulfils ? tags.get(c.fulfils) : undefined;
          if (bake) found.push({ bake, buyer: d.signer, id: d.id, act: o.act, key: o.key });
        } catch {
          // not a claim this reads
        }
      }
      const r = found.length ? await purchaseContests({ purchases: found, parties: [me.id, ...buyers], relays: list([...s.relays, ...s.homes]), via: s.via }) : { by: {} as Record<string, ContestsBeside>, problems: [] };
      const by: Record<string, Record<string, ContestsBeside>> = {};
      for (const w of bakes)
        for (const buyer of Object.keys(w.delivered)) {
          const mine = found.filter((x) => x.bake === w.bake && x.buyer === buyer);
          const read = mine.map((x) => r.by[x.id]).filter(Boolean);
          (by[w.bake] ??= {})[buyer] = !mine.length
            ? { state: 'unknown', contests: [], why: 'the buyer’s claim of the payment was not found in this identity’s inbox' }
            : read.some((x) => x.state === 'shown')
              ? { state: 'shown', contests: read.flatMap((x) => x.contests) }
              : (read[0] ?? { state: 'unknown', contests: [] });
        }
      return { by, problems: r.problems };
    });
  }

  /**
   * The sales under publications this identity is an owner or partner of,
   * as their split service told it (the money messages cMIP, draft 4,
   * 7.2.3): beside each, the buyer's contests, read from the buyer's claim
   * of the payment sealed to every owner (decided with the MOR lead, 23
   * October 2026), and the public contests; "unknown" where the core cannot
   * say, never "none".
   */
  sharedSales(): Promise<{ sales: SharedSale[]; problems: string[] }> {
    return this.desk.serial(async () => {
      const b = this.book();
      const s = this.settings();
      const acting = this.actingOf(b);
      if (!acting) return { sales: [], problems: [] };
      const me = this.me(acting);
      const places = list([...s.relays, ...s.homes]);
      const seen = await this.inboxOf(me);
      const problems: string[] = [];
      const sales: SharedSale[] = [];
      const claims: { id: string; buyer: string; offer: string; act: Uint8Array; key: Uint8Array | null }[] = [];
      for (const o of seen.values()) {
        const d = o.d;
        if (d.spec !== MIRS.money || d.type !== 3 || !d.signer || !d.payload) continue;
        try {
          const c = (moneyRead(3, d.payload) as { act: { fulfils?: string } }).act;
          if (c.fulfils) claims.push({ id: d.id, buyer: d.signer, offer: c.fulfils, act: o.act, key: o.key });
        } catch {
          // not a claim this reads
        }
      }
      for (const o of seen.values()) {
        const d = o.d;
        if (!d.spec || !MESSAGES_SPECS.includes(d.spec) || d.type !== TYPES.sale || !d.payload) continue;
        const sale = readSale(d.payload);
        if (sales.some((x) => x.receipt === sale.receipt)) continue;
        // The sale names the price tag paid: under a publication, read it; a bare bake's sale is the uploader's own (Sales, above).
        const tagAct = await actAt(sale.offer, places, s.via);
        const tag = tagAct ? readTag(tagAct) : null;
        if (!tag?.publication) continue;
        const pubAct = await actAt(tag.publication, places, s.via);
        const pub = pubAct ? readPublication(pubAct) : null;
        if (!pub) continue;
        const deal = pub.owners ? await readDeal(pub.owners, places, s.via, pub.id).catch(() => null) : null;
        const owners = deal ? deal.owners.map(([x]) => x) : [pub.drafter];
        const parties = list([...owners, pub.service, ...pub.partners.map((x) => x.identity)]);
        if (!parties.includes(me.id)) continue;
        const kept = b.publications.find((x) => x.id === pub.first);
        const title = kept?.title ?? deal?.name ?? 'a work shared through a publication';
        const mine = claims.filter((c) => c.buyer === sale.buyer && c.offer === sale.offer);
        let beside: ContestsBeside;
        if (!mine.length) beside = { state: 'unknown', contests: [], why: 'the buyer’s claim of the payment was not found sealed to you' };
        else {
          const r = await purchaseContests({ purchases: mine.map((c) => ({ act: c.act, key: c.key })), parties: list([...parties, sale.buyer, me.id]), relays: places, via: s.via }).catch((e) => ({ by: {} as Record<string, ContestsBeside>, problems: [err(e)] }));
          problems.push(...r.problems);
          const read = mine.map((c) => r.by[c.id]).filter(Boolean);
          beside = read.some((x) => x.state === 'shown') ? { state: 'shown', contests: read.flatMap((x) => x.contests), noPurchase: read.every((x) => x.noPurchase) ? read[0].noPurchase : null } : (read[0] ?? { state: 'unknown', contests: [] });
        }
        sales.push({ kind: 'publication', title, version: pub.first, offer: sale.offer, publication: sale.publication, buyer: sale.buyer, receipt: sale.receipt, claim: mine[0]?.id ?? null, beside });
      }
      return { sales, problems };
    });
  }

  /**
   * The sales a publication's split service told of (draft 4, 7.2.3): each
   * checked to come from the service the publication names, its price tag
   * one the publication counts (the service's or the designated party's),
   * selling a bake whose key is kept here; then the key delivered, sealed to
   * the buyer. For a collective's bake, as the collective, sealed to the
   * buyer and every member.
   */
  private async deliverTold(me: TestIdentity, b: Book): Promise<Line[]> {
    const s = this.settings();
    const places = list([...s.relays, ...s.homes]);
    const lines: Line[] = [];
    for (const o of (await this.inboxOf(me)).values()) {
      const d = o.d;
      if (!d.spec || !MESSAGES_SPECS.includes(d.spec) || d.type !== TYPES.sale || !d.payload || !d.signer) continue;
      const sale = readSale(d.payload);
      const bake = b.bakes.find((x) => x.bake === sale.publication && x.key && x.member === me.id);
      if (!bake || bake.delivered[sale.buyer]) continue;
      const tagAct = await actAt(sale.offer, places, s.via);
      const tag = tagAct ? readTag(tagAct) : null;
      const pub = tag?.publication ? b.publications.find((x) => x.id === tag.publication) : null;
      if (!tag || !pub || !pub.bakes.includes(bake.bake) || d.signer !== pub.service || (tag.signer !== pub.service && tag.signer !== pub.designated)) {
        if (tag?.publication) lines.push({ text: `A sale told by ${short(d.signer)} was set aside: it is not from the split service of a publication selling “${bake.title}”, under a price tag it counts.`, tone: 'warn' });
        continue;
      }
      try {
        if (bake.collective) {
          // A collective's: a key delivery of the collective's, by this member with their own key, sealed to the buyer and every member (rule 57).
          await this.desk.keyCurrent(me.id);
          bake.delivered[sale.buyer] = await this.collectiveKeyDelivery(me, await this.collectiveHere(me, bake.as), bake.bake, bake.key!, [sale.buyer], []);
          this.store.saveIdentity(me);
          pub.delivered[sale.buyer] = bake.delivered[sale.buyer];
          lines.push({ text: `The key of the collective’s “${bake.title}” was delivered to ${short(sale.buyer)}, as the collective, sealed to them and to every member: a sale its publication’s split service receipted.`, tone: 'ok' });
          continue;
        }
        bake.delivered[sale.buyer] = await deliverKey(me, sale.buyer, bake.bake, bake.key!, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current: () => this.desk.keyCurrent(me.id) });
        pub.delivered[sale.buyer] = bake.delivered[sale.buyer];
        lines.push({ text: `The key of “${bake.title}” was delivered to ${short(sale.buyer)}, sealed to them: a sale its publication’s split service receipted.`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `The key of “${bake.title}” could not be delivered to ${short(sale.buyer)} yet: ${err(e)}`, tone: 'warn' });
      }
    }
    return lines;
  }

  /** Deliver the keys of what was sold: bare bakes as the uploader's Damgar told of each sale (type 6), publications as their split service did. */
  deliver(): Promise<{ lines: Line[] }> {
    return this.desk.serial(async () => {
      // What waits for others' signatures: looked for first, each publication every party signed published.
      const lines: Line[] = (await this.gatherNow().catch((e) => ({ lines: [{ text: `The signatures could not be read: ${err(e)}`, tone: 'warn' as const }] }))).lines.filter((l) => l.tone);
      const b = this.book();
      const s = this.settings();
      for (const id of list(b.bakes.filter((w) => w.key).map((w) => w.member))) {
        if (!this.store.holds(id)) continue;
        const me = this.me(id);
        const sold: SoldWorks = {};
        for (const w of b.bakes.filter((x) => x.as === id && !x.collective && x.key && x.tag)) sold[w.bake] = { key: w.key!, offer: w.tag!.first, post: w.post, media: w.media, delivered: w.delivered };
        try {
          for (const t of await deliverSold(me, sold, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current: () => this.desk.keyCurrent(me.id) })) lines.push({ text: t, tone: /could not/.test(t) ? 'warn' : 'ok' });
        } finally {
          this.store.saveIdentity(me);
        }
        for (const w of b.bakes) if (sold[w.bake]) w.delivered = sold[w.bake].delivered;
        if (b.publications.some((p) => p.by === id || p.holders.some(([h]) => h === id))) {
          // A collective's bakes and publications are kept under the member who acts.
          try {
            lines.push(...(await this.deliverTold(me, b)));
          } catch (e) {
            lines.push({ text: `The sales told by a split service could not be read: ${err(e)}`, tone: 'warn' });
          }
        }
      }
      this.save(b);
      return { lines: lines.length ? lines : [{ text: 'No sale waits for its key.' }] };
    });
  }
}

/** A sealed act opened, as the inbox holds it. */
type Opened = { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; binding?: string };

/** What the Publishing tab shows. */
export interface PublishingState {
  actors: Actor[];
  acting: string | null;
  as: string | null;
  bakes: BakeHere[];
  claims: (ClaimHere & { waiting: { state: string; signed: string } | null })[];
  ownerships: (OwnershipHere & { waiting: { state: string; signed: string } | null })[];
  publications: (PublicationHere & { waiting: { state: string; signed: string } | null })[];
  vows: VowHere[];
  sharesSay: string[];
  bakeStays: string;
  held: string[];
  say: string[];
  unit: string;
}

/** A price tag's payload (Money type 5) on a bare bake, through the core library: for a member's act for a collective, signed with `signAsMember`. */
function moneyTag(a: { bake: string; version: number; price: number; payee: string }): { type: number; payload: Uint8Array } {
  return tagPayload({ bake: a.bake, version: a.version, price: { unit: REGTEST_UNIT, value: a.price }, payee: a.payee });
}

/** The words of a work's ownership agreement (Agreements rule 4: what every owner signs, in plain words). */
export function ownershipWords(title: string, shares: [string, number][], names: (id: string) => string): string {
  return `“${title || '…'}”: the ownership agreement of the work its claim names, owned ${shares.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ')}. Ownership only: how it is sold, with which partners and through which split service, is each publication’s.`;
}

/** Why a file is not one its Module plays, in plain words. */
function notPlayable(media: SealedMedia, e: unknown): string {
  return e instanceof NotJpeg
    ? `That file is not a JPEG picture: ${e.message}`
    : e instanceof NotFilm
      ? `That file is not a film the video Module plays (an MP4): ${e.message}`
      : e instanceof NotSound
        ? `That file is not a recording the audio Module plays (an M4A): ${e.message}`
        : media === 'text'
          ? 'That text is not UTF-8: give a plain text.'
          : err(e);
}

/** What to choose, said where nothing was. */
const CHOOSE: Record<SealedMedia, string> = { text: 'Write the text to upload.', picture: 'Choose a JPEG picture.', video: 'Choose a film: an MP4 file.', audio: 'Choose a recording: an M4A file.' };

/** Each kind, as the read-back says it is locked. */
const STRIPPED: Record<SealedMedia, string> = {
  text: 'text',
  picture: 'picture (a JPEG, stripped to the picture alone first: the JPEG Module, rule 6)',
  video: 'film (an MP4, stripped to the film alone first, every frame byte for byte: the video Module, rule 10)',
  audio: 'recording (an M4A, stripped to the sound alone first, every sample byte for byte: the audio Module, rule 10)',
};

/** A sale of a work sold through a publication, as an owner or partner sees it. */
export interface SharedSale {
  kind: 'publication' | 'collective';
  title: string;
  version: string;
  offer: string;
  publication: string;
  buyer: string;
  receipt: string;
  claim: string | null;
  beside: ContestsBeside;
}
