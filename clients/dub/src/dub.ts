// What Dub does (F332, 16 October 2026; amended the same afternoon): the
// identities it holds, made here or brought here by their words, one in use
// at a time; for the one in use, a public side (the feed of its own posts and
// those of the identities it follows, posting, optionally addressed to an
// identity, replies, follow and mute, and what is addressed to it) and a
// private side (its inbox, and messages sealed to one identity).
//
// Making an identity is the genesis client's code; its chain key is shown
// once as words and kept nowhere (F332, amended: "The app show the seed for
// the chain key at creation, once, and that's it"). Bringing one, and the
// encryption key its words carry, is the identity carry Module, draft 2.
// Posting, reading back and withdrawing are the barebone client's code; the
// feed is the site's (website cMIP, draft 8, in signed order). Display names
// are the naming cMIP's; follow and mute the people cMIP's. Every act is
// made and judged by the core library. There is no rotation here: that is
// Kišib's (F332, amended; F335), and when a rotation made there counts, Dub
// says so and takes the new signing key's words.
//
// The same code runs in two places: in Dub's program on the Mac, keeping
// things in a folder (`store.ts`), and in Dub's web client, in the browser
// (`web/keep.ts`). A `Keep` says where.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { IDENTITY_TYPES, MIRS, SPECS, resignationPayload, sha256, base64, cborDecode, cborEncode, describeAct, hex, openSealed, shareOnPaper, signingPublic, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { TestIdentity, TEST_LABEL, sealFor, type Home, type IdentityFile } from '../../genesis/src/identity.ts';
import { followRef, lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, sealedId, type Via } from '../../genesis/src/transport.ts';
import { Judge, filmBytes, leaveInInbox, post, readPost, textPayload, withdraw, type ShownFilm, type ShownPicture, type ShownPost } from '../../barebone/src/post.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT, WITHDRAWAL } from '../../barebone/src/specs.ts';
import { readFeed, type FeedPost } from '../../site/src/feed.ts';
import { makeLink } from '../../reader/src/link.ts';
import { compose } from '../../longform/src/text.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { Refused, encryptionSecret, fromWords, groupId, threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { actForm, idForm, idWhere, readActId, readId, readIdWhere } from '../../genesis/src/forms.ts';
import { WITNESS_EXPLANATION } from '../../genesis/src/witness.ts';
import { NUDGE_SPECS, NUDGE_TYPES } from '../../nudge/src/specs.ts';
import { decodeNudge, decodePick } from '../../nudge/src/nudge.ts';
import { standingWords } from '../../reader/src/read.ts';
import { readStamps } from '../../../modules/timestamp/src/read.ts';
import { APPENDED_FORMAT, appendedOf, appendedRef, membership } from './appended.ts';
import { draftPayload, type Draft } from '../../damgar/src/messages.ts';
import { offers as anchorOffers, type Offer } from '../../ummia/src/anchor.ts';
import { shownAct, shownId } from '../../genesis/src/shown.ts';
import { newChainKey } from './chainwords.ts';
import { readMessage, acceptanceText, negotiate, openShare, DECLINED, RESIGNED } from '../../repo/src/proposals.ts';
import { resign as resignAct, sign as signAct } from '../../repo/src/agreements.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { fetchAct, readProposal, SHARE_SAY, SIGNING_OFF_SAY, SIGNING_SAY } from './signing.ts';
import { carriedKey, lookCurrent, servedChain } from './carryin.ts';
import { NAME, NAME_WITHDRAWAL, namePayload, namesOf, readName } from './names.ts';
import { FOLLOW_LIST, NO_PEOPLE, PEOPLE_SPEC, PEOPLE_SPEC_1, PUBLISH_WARNING, SEALED_LIST, followListPayload, readFollowList, readSealedList, sealedListPayload, type Followed, type Kept, type People } from './people.ts';
import type { Collective, FilmShown, Held, Item, Label, Line, Message, Pic, PayWays, Proposal, Purchase, ShareShown, State, Who } from './shapes.ts';
import { sendDraft } from '../../damgar/src/messages.ts';
import { anchoringLeaf, randomBytes } from '../../genesis/src/core.ts';
import { UNITS_MODULES, readValue, say } from '../../damgar/src/units.ts';
import { authorityOfId } from '../../grants/src/grant.ts';
import { areaReaching, chainFor, collectiveNow, collectivePlaces, cosignAsMember, makeMemberKey, memberKeyFor, publishAt, readMemberKeys, resealMemberKeys, sealMemberKey, signAsMember, type MemberKey } from '../../grants/src/member.ts';
import { holdsAnArea } from './signing.ts';
import { DubMoney, LANE_SAY, type LaneShownHere, type SealedShown } from './money.ts';
import type { PaymentShown } from '../../damgar/src/shapes.ts';
import { isLongForm } from '../../barebone/src/corrections.ts';

export type { Line, State } from './shapes.ts';

/** Said on the first screen (asked by Nobody, allegedly). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Said where a new identity's chain key is shown, once (F332, amended; the words seed Module). */
export const CHAIN_WORDS_SAY = [
  'These are the chain key’s words. Write them on paper, in order, and keep the paper away from anything that goes online. They are shown once: Dub keeps nothing of the chain key.',
  'The chain key is the only way to change this identity’s signing key if it is ever stolen or lost. That is done in another app, Kišib, never in Dub. Lost paper means no change of keys, ever.',
  'Never type these words into Dub, or into any app that goes online. They are not the signing key’s words, which Dub shows on request.',
  'They are not a Bitcoin wallet. Never type them into one.',
];

/** Said where the signing key's words are shown, on request (the carry Module, draft 2, 3.2 and 3.3). */
export const CARRY_SAY = [
  'These are the signing key’s words. With the ID, they bring this identity into Dub on another computer or device: choose “Bring an identity you have” there.',
  'Whoever holds these words can post as this identity and read its private messages. The chain key is not in them.',
  'Write them on paper: if this app’s storage is lost, they are the way back. They stop working when the signing key is changed.',
  'Each place you bring them keeps its own line of acts. A change of the signing key must keep every line, or that line’s posts become void.',
  'They are not a Bitcoin wallet. Never type them into one.',
];

/** Said where an identity is brought in (the carry Module, 5.1; Identity rule 35). */
export const LINE_SAY =
  'This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, in Kišib), that change must keep this line, or every post made here becomes void. The app making the change reads this line from the homes and relays and keeps it, unless you leave it out; if it cannot read it, give it this line’s latest act, position and summary, shown in the identity window.';

/** Said when a rotation made elsewhere counts (F332, amended; the carry Module, draft 2, 4.6). Its first words are how the page knows it. */
export const SPENT_SAY =
  'This identity’s signing key was changed elsewhere, with its chain key, so the signing key’s words this app holds no longer count. Nothing was signed. Changing keys is Kišib’s work, not Dub’s. To go on here, give this app the new signing key’s words.';

/** Said where the identity's encryption key is not one this app holds (the carry Module, draft 2, 2a.3). */
export const NO_KEY_SAY =
  'This app holds no encryption key for this identity, so its private messages cannot be opened here: its encryption key was not made from its signing key’s words. Messages can still be sent from here.';

/** Where Dub's link opens a long-form document, unless the deployer names another reader. */
export const READER = 'https://reader.dubsar.org/';

/** What Dub keeps for each identity it holds. */
export interface Settings {
  /** Made here (its chain key shown once as words, kept nowhere) or brought here by its signing key's words. */
  kind: 'made' | 'brought';
  relays: string[];
  via: Via;
  /** The Signing tab (H18): off by default (F59), turned on in the identity window. Its page is removed (decided, 21 October 2026); its operations stay, run by Edubba's To sign. */
  signing?: boolean;
  /** The timestamp clock this identity's feeds are ordered by (H54): its ID and the name given it here; none until one is named. */
  clock?: { id: string; name: string } | null;
  /** The collectives this identity can act as from here, added by ID (its member key read from its homes). */
  collectives?: { id: string; available: boolean; why: string | null }[];
  /** The collective acted as now, or none: the identity itself. */
  acting?: string | null;
}

/**
 * What the Signing tab keeps for one identity (H18). The one-time keys'
 * secrets are held here, and only here, from the moment the member accepts
 * a proposal until its share has been shown and three of its words typed
 * back (or the member says it came by hand, or declines); then they are
 * destroyed. Nothing of a share is ever kept.
 */
export interface SigningState {
  /** Answers given, by thread (the proposal's first message). */
  answered: Record<string, { act: string; verdict: 'signed' | 'declined'; signature?: string; reply: string; at: number }>;
  /** One-time keys waiting for a share, by thread: the X-Wing secret, hex; `shown`, the three positions asked once the share was shown. */
  waiting: Record<string, { secret: string; since: number; act: string; shown?: number[] }>;
  /** Shares received and written down (nothing of them kept but this): by thread. */
  received: Record<string, { x: number; fingerprint: string; collective: string | null; at: number; byHand?: boolean }>;
  /** Collectives left alone (rule 70): the resignation signed, by the founding's thread. */
  left?: Record<string, string>;
}

export const NO_SIGNING = (): SigningState => ({ answered: {}, waiting: {}, received: {} });

/** A new identity whose chain key's words were shown, until three are typed back. Held in memory only: it carries the chain-key seed. */
export interface Pending {
  identity: IdentityFile;
  /** The three positions (1 to 24) to type back. */
  positions: number[];
  relays: string[];
  via: Via;
  /** The chain-key seed whose words were shown. Never stored. */
  chainSeed: string;
  /** A display name to publish right after the genesis (the naming cMIP; H12), already checked; none if not given. */
  name?: string;
}

/**
 * Where Dub keeps its identities: a folder on the Mac (`store.ts`) or the
 * browser's storage (`web/keep.ts`). `exclusive` runs one signer at a time,
 * across every page or program holding the same keep: a sequence must never
 * be signed twice at one position.
 */
/** What Dub keeps for money, by name (round 2): Damgar's code's settings, book and keys (its lane), and the keys of posts sold and bought. */
export const MONEY_KEPT = ['settings', 'book', 'keys', 'sold', 'bought', 'vows', 'anchors'] as const;
export type MoneyKept = (typeof MONEY_KEPT)[number];

export interface Keep {
  /** The identities held, by ID. */
  held(): Promise<string[]>;
  /** The identity in use, or null. */
  active(): Promise<string | null>;
  setActive(id: string | null): Promise<void>;
  identity(id: string): Promise<TestIdentity | null>;
  saveIdentity(id: TestIdentity): Promise<void>;
  settings(id: string): Promise<Settings>;
  saveSettings(id: string, s: Settings): Promise<void>;
  people(id: string): Promise<People>;
  savePeople(id: string, p: People): Promise<void>;
  /** The Signing tab's state (H18). */
  signing(id: string): Promise<SigningState>;
  saveSigning(id: string, s: SigningState): Promise<void>;
  /** Forget an identity here: its keys and everything kept about it. */
  forget(id: string): Promise<void>;
  /** What Dub keeps for money (round 2): by name. */
  money<T>(id: string, name: MoneyKept): Promise<T | null>;
  saveMoney(id: string, name: MoneyKept, v: unknown): Promise<void>;
  pending(): Promise<Pending | null>;
  savePending(p: Pending): Promise<void>;
  dropPending(): Promise<void>;
  exclusive<T>(f: () => Promise<T>): Promise<T>;
}

const list = (xs: string[]) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const now = () => Math.floor(Date.now() / 1000);
/** The fingerprint: an ID's first eight and last four characters. */
export const fingerprint = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

/** A whole number below `n`, from the platform's secure random source (Node 22 and browsers alike). */
export function randomBelow(n: number): number {
  const limit = Math.floor(0x100000000 / n) * n;
  const x = new Uint32Array(1);
  do crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  refs?: string[];
  refSigners?: (string | undefined)[];
  objects?: [string, string][];
  acks?: string[];
}

/** How long a display name found is trusted before it is read again, in seconds. */
const NAMES_FOR = 600;

export class Dub {
  private queue: Promise<unknown> = Promise.resolve();
  /** Display names found, by ID, and when (this app's memory only). */
  private names = new Map<string, { names: string[]; at: number }>();

  /** `web`: Dub's web client (F281). `reader`: where long-form documents open. */
  /** Money, round 2: a lane asked here, payments signed under it, sealed posts (`money.ts`). */
  readonly money: DubMoney;

  constructor(
    readonly store: Keep,
    readonly opts: { web?: boolean; reader?: string } = {},
  ) {
    this.money = new DubMoney(store, { web: !!opts.web, app: opts.web ? 'Dub on the web' : 'Dub on this computer' });
  }

  /** One thing at a time: a sequence must never be signed twice at once. */
  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => undefined);
    return next;
  }

  // ------------------------------------------------------------ who is who

  /** Where this app found the identities it shows (its own relays): the hint an ID link carries where nothing better is known. */
  private near: string[] = [];

  private whoFrom(id: string, me: string | null, p: People | null): Who {
    const f = p?.follows.find((x) => x.id === id);
    const hints = [...(p?.where?.[id] ?? []), ...this.near].filter((h) => /^https?:\/\//.test(h)).slice(0, 1);
    return {
      id,
      form: /^[0-9a-f]{64}$/.test(id) ? idForm(id) : id,
      link: /^[0-9a-f]{64}$/.test(id) ? idWhere(id, hints) : id,
      short: fingerprint(id),
      names: this.names.get(id)?.names ?? [],
      pet: f?.name ?? null,
      me: id === me,
      followed: !!f,
      muted: !!p?.muted.includes(id),
    };
  }

  /** Read the display names of these identities, where not read lately. A name not found is no name: silence proves nothing. */
  private async warm(ids: string[], places: string[], via: Via): Promise<void> {
    const due = [...new Set(ids)].filter((id) => (this.names.get(id)?.at ?? 0) + NAMES_FOR < now());
    await Promise.all(
      due.map(async (id) => {
        try {
          this.names.set(id, { names: (await namesOf(id, places, via)).map((n) => n.name), at: now() });
        } catch {
          // its homes did not answer: its fingerprint alone is shown
        }
      }),
    );
  }

  // ------------------------------------------------------------ state

  async state(): Promise<State> {
    const active = await this.store.active();
    const held: Held[] = [];
    for (const id of await this.store.held()) {
      const s = await this.store.settings(id);
      held.push({ id, grouped: groupId(id), who: this.whoFrom(id, active, null), active: id === active, kind: s.kind });
    }
    const pend = await this.store.pending();
    const units = UNITS_MODULES.flatMap((m) => m.units.map((u) => ({ hash: u.hash, label: `${u.many} (${m.name})`, regtest: u.network === 3 })));
    units.sort((a, b) => Number(b.regtest) - Number(a.regtest));
    const out: State = { stage: 'identity', held, units: units.map(({ hash, label }) => ({ hash, label })) };
    if (pend) {
      out.stage = 'confirm';
      out.confirm = { positions: pend.positions, id: pend.identity.identity };
    }
    const me = active ? await this.store.identity(active) : null;
    if (me) {
      const s = await this.store.settings(me.id);
      const p = await this.store.people(me.id);
      const own = ownLine(me.f.sequence);
      if (!pend) out.stage = 'ready';
      out.identity = {
        id: me.id,
        grouped: groupId(me.id),
        form: idForm(me.id),
        where: idWhere(me.id, [...me.f.homes.map((h) => h.hint).slice(0, 1), ...s.relays.filter((r) => !me.f.homes.some((h) => h.hint === r)).slice(0, 1)]),
        who: this.whoFrom(me.id, me.id, p),
        kind: s.kind,
        homes: me.f.homes.map((h) => h.hint),
        relays: s.relays,
        encryption: me.f.encryption.length > 0,
        oldChainKey: !!me.f.safety.seeds,
        line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null },
        list: p.list,
        sealed: p.sealed ? { version: p.sealed.version, forked: !!p.sealed.forked } : null,
        signing: !!s.signing,
        follows: p.follows.map((f) => this.whoFrom(f.id, me.id, p)),
        muted: p.muted.map((m) => this.whoFrom(m, me.id, p)),
        collectives: (s.collectives ?? []).map((c) => ({ id: c.id, form: idForm(c.id), name: this.names.get(c.id)?.names[0] ?? null, available: c.available, why: c.why })),
        acting: s.acting ?? null,
        clock: s.clock ? { id: s.clock.id, form: idForm(s.clock.id), name: s.clock.name } : null,
      };
      // Proposals to sign wait in the inbox as this app read it: signed in Edubba (Dub's Signing tab removed, decided).
      out.proposalsWaiting = p.inbox.items.filter((k) => k.talk && k.talk.thread === k.key && k.from && k.from !== me.id && k.refs.length).length;
    }
    return out;
  }

  private async ctx(): Promise<{ me: TestIdentity; s: Settings; p: People; hints: string[] }> {
    const active = await this.store.active();
    const me = active ? await this.store.identity(active) : null;
    if (!me) throw new Error('No identity in use: make one, or bring one, in the identity window.');
    const s = await this.store.settings(me.id);
    const p = await this.store.people(me.id);
    this.near = s.relays.slice(0, 1);
    return { me, s, p, hints: [...new Set([...s.relays, ...me.f.homes.map((h) => h.hint), ...Object.values(p.where ?? {}).flat()])] };
  }

  /** Each home's operator, as it declares itself (relay transport cMIP, `info`). */
  private async homes(hints: string[], via: Via): Promise<Home[]> {
    const out: Home[] = [];
    for (const hint of hints) {
      if (!/^https?:\/\//.test(hint)) throw new Error(`“${hint}”: an address starts with https:// (or http://)`);
      let info: Map<number, unknown>;
      try {
        info = (await relayAt(hint, via).info()) as Map<number, unknown>;
      } catch (e) {
        throw new Error(`${hint} did not answer: ${message(e)}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      out.push({ operator: hex(op), hint });
    }
    return out;
  }

  // ------------------------------------------------------------ the identity window: a new identity

  /**
   * Make a new identity with the genesis client's code, and show its chain
   * key's words once (F332, amended): the chain key is derived from a seed
   * shown as words (the words seed Module) and kept nowhere, on the Mac as on
   * the web. Nothing is published until three of the words are typed back
   * (`confirm`). Starting again forgets the last one.
   */
  async begin(a: { homes: string[]; relays: string[]; via?: Via; name?: string }): Promise<{ words: string[]; positions: number[]; say: string[] }> {
    const via = a.via ?? {};
    // A display name, if given, is checked now, before anything is made (the naming cMIP, section 2; H12).
    const name = a.name?.trim() ? readName(a.name) : undefined;
    const hints = list(a.homes);
    if (!hints.length) throw new Error('Give at least one home address: where the identity lives, and anyone can check it.');
    const homes = await this.homes(hints, via);
    const relays = list(a.relays);
    for (const r of relays) if (!/^https?:\/\//.test(r)) throw new Error(`“${r}”: an address starts with https:// (or http://)`);
    const positions = threePositions(randomBelow);
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const chain = newChainKey(seed);
    const id = TestIdentity.create({ homes, via, chainKey: chain.key });
    // The chain key is not kept with the identity, even while it waits: only the seed, in memory, to check the words typed back.
    id.f.safety = { scheme: 0, seeds: '' };
    chain.key.seeds.fill(0);
    await this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via, chainSeed: hex(seed), ...(name ? { name } : {}) });
    seed.fill(0);
    return { words: chain.words, positions, say: CHAIN_WORDS_SAY };
  }

  /** Forget a new identity before it was published. */
  async abandon(): Promise<void> {
    await this.store.dropPending();
  }

  /**
   * The three words typed back. Refused, with nothing published, unless
   * each is the word at its position. Then the genesis goes to the homes; its
   * routes name the relays as its outbox and its inbox; its encryption key,
   * the one its signing key's words carry (the carry Module, draft 2, 2a.2),
   * is published, as the desk's identities have theirs at once; and it is the
   * identity in use.
   */
  confirm(typed: string[]): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const p = await this.store.pending();
      if (!p) throw new Error('No new identity is waiting.');
      if (!typedBack(toWords(unhex(p.chainSeed)), p.positions, typed)) {
        throw new Error(`Those are not words ${p.positions.join(', ')} as shown. Look at what you wrote down. Nothing has been published.`);
      }
      const id = new TestIdentity(p.identity, p.via);
      const sent = await id.publishGenesis();
      const lines: Line[] = sent.map((x) => ({
        text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
        tone: x.result?.receipt ? 'ok' : 'bad',
      }));
      if (!sent.some((x) => x.result?.receipt)) {
        throw new Error(`No home took the identity, so it was not kept. ${lines.map((l) => l.text).join('; ')}`);
      }
      // Kept before anything else is signed: the sequence starts here.
      await this.store.saveSettings(id.id, { kind: 'made', relays: p.relays, via: p.via });
      await this.store.saveIdentity(id);
      await this.store.setActive(id.id);
      // The chain-key seed goes with the pending identity: from here, nothing holds it but the paper.
      await this.store.dropPending();
      await id.publishRoutes([
        { scope: null, hints: p.relays, kind: 0 },
        { scope: null, hints: p.relays, kind: 1 },
      ]);
      await this.store.saveIdentity(id);
      await id.publishEncryptionKey(encryptionSecret(unhex(id.f.signingSecret)));
      await this.store.saveIdentity(id);
      for (const r of p.relays) {
        for (const act of id.chainActs()) {
          try {
            await relayAt(r, p.via).putAct(act);
          } catch {
            // that relay's policy: the homes serve it anyway
          }
        }
      }
      lines.push({ text: `Its posts are published at, and its inbox is, ${p.relays.join(', ')}. Its encryption key is published: private messages can be sealed to it.` });
      // The display name given in the form, published right after the genesis (H12; the naming cMIP, section 1).
      if (p.name) {
        try {
          lines.push(...(await this.publishName(id, { relays: p.relays, via: p.via }, p.name)).lines);
        } catch (e) {
          lines.push({ text: `The display name was not published (${message(e)}). Give it again in the identity window.`, tone: 'warn' });
        }
      }
      return { lines };
    });
  }

  // ------------------------------------------------------------ the identity window: an identity made elsewhere

  /**
   * Bring an identity made elsewhere (the carry Module, section 4): read its
   * chain from its homes, starting at `address`, and keep it only if the
   * words give its current signing key; with its encryption key where the
   * words carry the one that counts (2a.3). Relays are asked for only where
   * its routes name none. This app starts its own line. An identity already
   * held here takes the new words instead (`renew`).
   */
  bring(a: { id: string; words: string; address: string; relays?: string[]; via?: Via }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const via = a.via ?? {};
      let id: string;
      let seed: Uint8Array;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error('Give an address where this identity is found (one of its homes), starting with https://.');
      const look = await this.lookCurrent(id, seed, [address], via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await this.servedChain(id, r.homes, via);
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) {
        throw new Error('This identity names no relays for its posts. Give one or more relay addresses, and bring it again.');
      }
      const enc = this.carriedKey(look, seed);
      const f: IdentityFile = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        // The chain key never travels (the carry Module, 1.3): none is held here.
        safety: { scheme: 0, seeds: '' },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc ? [enc] : [],
        pending: null,
      };
      await this.store.saveSettings(id, { kind: 'brought', relays, via });
      await this.store.saveIdentity(new TestIdentity(f, via));
      await this.store.setActive(id);
      return {
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          enc ? { text: 'Its encryption key is the one the words carry: its private messages open here.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
          { text: named.length ? `Its posts are published at the relays it names: ${relays.join(', ')}.` : `It names no relays: its posts are published at ${relays.join(', ')}.` },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
  }

  private lookCurrent(id: string, seed: Uint8Array, hints: string[], via: Via): Promise<Lookup> {
    return lookCurrent(id, seed, hints, via);
  }

  private servedChain(id: string, homes: Home[], via: Via): Promise<Uint8Array[]> {
    return servedChain(id, homes, via);
  }

  private carriedKey(look: Lookup, seed: Uint8Array): { version: number; act: string; secret: string } | null {
    return carriedKey(look, seed);
  }

  /**
   * The new signing key's words, after a rotation made elsewhere counts (the
   * carry Module, draft 2, 4.6; F332, amended): checked as any brought words
   * are, then this app signs with them in a new line under the new binding,
   * keeping what it held of the identity. Where this app published the
   * identity's last encryption key, it publishes the next one, from the new
   * words (2a.4).
   */
  renew(words: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error('No identity in use.');
      let seed: Uint8Array;
      try {
        seed = fromWords(words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      return this.renewHeld(active, seed);
    });
  }

  private async renewHeld(id: string, seed: Uint8Array): Promise<{ lines: Line[] }> {
    const me = (await this.store.identity(id))!;
    const s = await this.store.settings(id);
    const look = await this.lookCurrent(id, seed, [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    if (hex(seed) === me.f.signingSecret) throw new Error('These are the signing key’s words this app already holds, and they still count: nothing to change.');
    const r = look.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await this.servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    // A new line under the new binding (the carry Module, 4.3): the old one ended with the old key.
    me.f.sequence = [];
    // Routes are versioned: this app goes on with them only where it wrote the version that counts.
    me.f.routes = me.f.routes && look.routes.act === me.f.routes.act ? me.f.routes : null;
    const lines: Line[] = [{ text: 'The new signing key’s words give its current signing key. This app signs with them from now on, in a new line.', tone: 'ok' }];
    const carried = this.carriedKey(look, seed);
    const last = me.f.encryption.at(-1);
    if (carried) {
      if (!me.f.encryption.some((e) => e.act === carried.act)) me.f.encryption.push(carried);
      lines.push({ text: 'Its encryption key is the one the new words carry.', tone: 'ok' });
      await this.store.saveIdentity(me);
    } else if (last && look.encryptionKeyAct === last.act) {
      await this.store.saveIdentity(me);
      // This app wrote the version that counts: it renews it from the new words (2a.4); the old secrets stay, to open older messages.
      await me.publishEncryptionKey(encryptionSecret(seed));
      // F353: the member keys sealed to this identity, sealed again to its new encryption key (the member keys cMIP, 4.1).
      const resealed = await resealMemberKeys(me.id, me.f.encryption.slice(0, -1).map((e) => unhex(e.secret)), xwingPublic(encryptionSecret(seed)), me.f.homes.map((h) => h.hint), me.via).catch(() => 0);
      if (resealed) lines.push({ text: `Its ${resealed} member key${resealed === 1 ? '' : 's'} for collectives, sealed to it, sealed again to the new encryption key: unchanged, so its apps still act with them (F353).`, tone: 'ok' });
      await this.store.saveIdentity(me);
      lines.push({ text: 'Its encryption key was renewed from the new words: messages sealed from now on open only with them. Messages sealed before, to the old key, stay readable by whoever held the old words.', tone: 'ok' });
    } else {
      await this.store.saveIdentity(me);
      lines.push({ text: NO_KEY_SAY, tone: 'warn' });
    }
    lines.push({ text: LINE_SAY, tone: 'warn' });
    return { lines };
  }

  /**
   * Leave the identity in use (H28): nothing is forgotten, its keys stay
   * here; the identity window then opens with no identity in use, to choose
   * one held here, or make or bring another.
   */
  async leave(): Promise<void> {
    await this.store.setActive(null);
  }

  /** Use another identity held here. */
  async use(id: string): Promise<void> {
    if (!(await this.store.held()).includes(id)) throw new Error('This app does not hold that identity.');
    await this.store.setActive(id);
  }

  /** Forget an identity here: its keys go. Only its signing key's words, written down, bring it back. Its posts stay published. */
  forget(id: string): Promise<void> {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error('This app does not hold that identity.');
      const was = await this.store.active();
      await this.store.forget(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }

  /** The identity's ID and its signing key's words (the carry Module), on request: the way to another app. */
  async carry(): Promise<{ id: string; grouped: string; words: string[]; say: string[] }> {
    const { me } = await this.ctx();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)), say: CARRY_SAY };
  }

  // ------------------------------------------------------------ the key in use

  /**
   * Whether the signing key this app holds still counts (the carry Module,
   * 4.5): false once a rotation made elsewhere bound another key.
   */
  async check(): Promise<{ current: boolean; say: string | null }> {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e) {
      if (message(e) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e;
    }
  }

  /** Refuse to sign once a rotation counts that this app did not see: the key it holds is spent. */
  private async current(me: TestIdentity): Promise<void> {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing was signed.');
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }

  /** An act signed and kept: the sequence is saved before anything leaves. */
  private async signed<T>(me: TestIdentity, f: () => Promise<T>): Promise<T> {
    try {
      return await f();
    } finally {
      await this.store.saveIdentity(me);
    }
  }

  // ------------------------------------------------------------ one's own display name (the naming cMIP)

  /**
   * Publish a display name (the naming cMIP, section 1), then withdraw every
   * other name of this identity under that cMIP found counting (1.3). An
   * empty name withdraws them all.
   */
  setName(typed: string): Promise<{ lines: Line[]; names: string[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const name = typed.trim() ? readName(typed) : null;
      await this.current(me);
      return this.publishName(me, s, name);
    });
  }

  /** Publish `name` and withdraw every other counting name, for an identity whose key is current. Inside `serial`. */
  private async publishName(me: TestIdentity, s: { relays: string[]; via: Via }, name: string | null): Promise<{ lines: Line[]; names: string[] }> {
    const hints = [...new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])];
    const before = await namesOf(me.id, hints, s.via);
    const lines: Line[] = [];
    const send = async (act: Uint8Array) => {
      for (const h of [...me.f.homes.map((x) => x.hint), ...s.relays]) {
        try {
          await relayAt(h, s.via).putAct(act);
        } catch {
          // that place is away: the others hold it
        }
      }
    };
    if (name && !before.some((n) => n.name === name)) {
      const made = await this.signed(me, async () => me.sign(SPECS.identity, NAME, namePayload(name), { public: true }));
      await send(made.act);
      lines.push({ text: `Your display name is “${name}”, shown beside your fingerprint, never instead of it. Anyone may take the same name.`, tone: 'ok' });
    }
    for (const old of before.filter((n) => n.name !== name)) {
      const made = await this.signed(me, async () => me.sign(SPECS.identity, NAME_WITHDRAWAL, cborEncode(new Map()), { public: true, objects: [[old.act, old.act]] }));
      await send(made.act);
      lines.push({ text: `“${old.name}” withdrawn: it stays readable as an act, no longer as your name.` });
    }
    const names = (await namesOf(me.id, hints, s.via)).map((n) => n.name);
    this.names.set(me.id, { names, at: now() });
    return { lines, names };
  }

  // ------------------------------------------------------------ the public side

  /**
   * Post a text, with a JPEG if one is given, then read it back from the
   * relays, verified. `to`, an identity's ID: a public message to it (F287):
   * the post names it and is left, unsealed, in its inbox too. `reply`, a
   * post: this one answers it (it names it in `refs`, with its signer), is
   * addressed to its signer, and left in its inbox where it has one. No
   * private switch here: the private side is its own tab.
   */
  post(a: { text: string; jpeg?: Uint8Array; mp4?: Uint8Array; to?: string | string[]; reply?: { id: string; signer: string } }): Promise<{ post: Item; lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { text, changes } = compose(a.text);
      if (!text.trim()) throw new Error('Write something to post.');
      if (a.jpeg && a.mp4) throw new Error('A picture or a film, one at a time. Nothing was posted.');
      if (s.acting) return this.postAsCollective(me, s, p, hints, text, a);
      const to: { id: string; inbox: string[] | null; why?: string }[] = [];
      // To…, and each @ chosen by name (a mention is an address: the post names them and is left in their inboxes).
      for (const typed of (Array.isArray(a.to) ? a.to : [a.to ?? '']).map((x) => x.trim()).filter(Boolean)) {
        let id: string;
        let where: string[] = [];
        try {
          ({ id, hints: where } = readIdWhere(typed));
        } catch (e) {
          throw new Error(`To: ${message(e)}. Nothing was posted.`);
        }
        if (to.some((t) => t.id === id)) continue;
        if (id === me.id) throw new Error('To: that is this identity itself. Nothing was posted.');
        let inbox: string[] | null;
        try {
          inbox = (await lookUp(id, [...where, ...hints], s.via)).inbox(SPECS.text);
        } catch (e) {
          throw new Error(`To: the identity ${fingerprint(id)} was not found: ${message(e)}. Nothing was posted.`);
        }
        if (!inbox?.length) throw new Error(`To: the identity ${fingerprint(id)} declares no inbox, so nothing can be left for it. Nothing was posted.`);
        to.push({ id, inbox });
      }
      let refs: [string, string][] | undefined;
      if (a.reply) {
        const signer = readId(a.reply.signer);
        const id = readId(a.reply.id);
        // The post answered is held first, so the reference names its real signer (F272).
        let act: Uint8Array;
        try {
          act = (await followRef([id, signer], [...hints, ...this.inboxPlaces(p)], s.via)).act;
        } catch (e) {
          throw new Error(`The post answered could not be found: ${message(e)}. Nothing was posted.`);
        }
        const d = describeAct(act) as Described;
        refs = [[d.id, d.signer!]];
        if (d.signer !== me.id && !to.some((t) => t.id === d.signer)) {
          try {
            to.push({ id: d.signer!, inbox: (await lookUp(d.signer!, hints, s.via)).inbox(SPECS.text) });
          } catch (e) {
            to.push({ id: d.signer!, inbox: null, why: message(e) });
          }
        }
      }
      await this.current(me);
      const made = await this.signed(me, () => post(me, { text, jpeg: a.jpeg, mp4: a.mp4, relays: s.relays, to: to.length ? to.map((t) => t.id) : undefined, refs }));
      const lines: Line[] = changes.map((c) => ({ text: `Text: ${c}.` }));
      for (const t of to) {
        if (!t.inbox?.length) {
          lines.push({ text: `${fingerprint(t.id)} declares no inbox${t.why ? ` (${t.why})` : ''}: the reply is published, not left for it.`, tone: 'warn' });
          continue;
        }
        const { left, failed } = await leaveInInbox(me, made.act, t.inbox);
        if (left.length) lines.push({ text: `Left in the inbox of ${fingerprint(t.id)} too, unsealed: anyone may read it.`, tone: 'ok' });
        if (failed.length) lines.push({ text: `Its inbox did not take it at ${failed.map((f) => `${f.relay} (${f.reason})`).join(', ')}.`, tone: left.length ? 'warn' : 'bad' });
      }
      if (made.picture) {
        lines.push({
          text: made.picture.removed.length
            ? `Taken out of the picture before publishing: ${made.picture.removed.map((c) => CARRIED_WORDS[c]).join('; ')}.`
            : 'The picture carried nothing to take out.',
          tone: 'ok',
        });
      }
      if (made.film) lines.push({ text: made.film.removed.length ? `Taken out of the film before publishing: ${made.film.removed.join('; ')}.` : 'The film carried nothing to take out.', tone: 'ok' });
      const shown = await readPost(made.id, hints, s.via);
      return { post: this.item(shown, me.id, p, s, 'feed', [], false), lines };
    });
  }

  /**
   * A public post signed as the collective acted as, with this identity's
   * own member key (F353), in the area reaching public posts: text, and a
   * reply's reference. Where the area asks more keys than one, it counts
   * once its other holders sign it (in Edubba's To sign), said.
   */
  private async postAsCollective(me: TestIdentity, s: Settings, p: People, hints: string[], text: string, a: { jpeg?: Uint8Array; mp4?: Uint8Array; to?: string | string[]; reply?: { id: string; signer: string } }): Promise<{ post: Item; lines: Line[] }> {
    const collective = s.acting!;
    if (a.jpeg || a.mp4 || (Array.isArray(a.to) ? a.to.some((x) => x.trim()) : a.to?.trim())) throw new Error('As a collective, Dub posts text and replies only: no picture, film or address. Nothing was posted.');
    const k = await this.memberKeyHere(me, s, collective, hints);
    if (!k.key || k.why) throw new Error(`Dub cannot post as this collective: ${k.why ?? 'no member key'} Nothing was posted.`);
    await this.current(me);
    const refs: [string, string][] = a.reply ? [[readId(a.reply.id), readId(a.reply.signer)]] : [];
    const at = await chainFor(collective, k.key, k.places, s.via);
    const made = signAsMember(collective, k.key, at, { spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload(text), public: true, ...(refs.length ? { refs } : {}) });
    const took = await publishAt([made.act], [...new Set([...s.relays, ...k.places])], s.via);
    if (!took.length) throw new Error('No relay took the post. Nothing counts yet: try again.');
    const lines: Line[] = [{ text: `Posted as the collective, with your own member key, at ${took.join(', ')}.`, tone: 'ok' }];
    if (k.number > 1) lines.push({ text: `Its area asks ${k.number} keys: it counts once another holder signs it too (Edubba, Collectives › To sign).`, tone: 'warn' });
    let item: Item;
    try {
      item = this.item(await readPost(made.id, [...s.relays, ...k.places], s.via), me.id, p, s, 'feed', [], false);
    } catch {
      item = { id: made.id, form: actForm(made.id), who: this.whoFrom(collective, me.id, p), standing: 'unknown', text, doc: null, pictures: [], answers: [], toMe: false, via: 'feed', problem: null, seen: true };
    }
    return { post: item, lines };
  }

  /** A post read and judged, as the page shows it. */
  private item(sp: ShownPost, me: string, p: People, s: Settings, via: 'feed' | 'inbox' | 'relay', answers: Item['answers'], toMe: boolean): Item {
    const pictures: Pic[] = sp.refs
      .filter((r): r is ShownPicture => r.kind === 'picture')
      .map((r) => ({
        src: r.bytes && r.picture ? `data:image/jpeg;base64,${base64(r.bytes)}` : null,
        width: r.picture?.shownWidth ?? 0,
        height: r.picture?.shownHeight ?? 0,
        publication: r.publication,
        problem: r.problem,
        withdrawable: r.signer === me && sp.signer === me && !r.withdrawn && r.standing === 'valid',
      }));
    const films: FilmShown[] = sp.refs
      .filter((r): r is ShownFilm => r.kind === 'film')
      .map((r) => ({ publication: r.publication, signer: r.signer, size: r.size, problem: r.problem, withdrawable: r.signer === me && sp.signer === me && !r.withdrawn && r.standing === 'valid' }));
    const doc =
      isLongForm(sp.format)
        ? { title: titleOf(sp.text), link: makeLink(this.opts.reader ?? READER, sp.id, s.relays.filter((r) => /^https:\/\//.test(r))) }
        : null;
    return {
      id: sp.id,
      form: actForm(sp.id),
      who: this.whoFrom(sp.signer, me, p),
      standing: sp.standing,
      text: doc ? '' : sp.text,
      doc,
      pictures,
      films,
      answers,
      toMe,
      via,
      problem: sp.standing === 'valid' ? null : `not verified: ${sp.standing}`,
      seen: !toMe || p.seen.includes(sp.id),
    };
  }

  /**
   * The feed: this identity's own posts and those of the identities it
   * follows, muted ones left out (the people cMIP, 2.2), read and judged as
   * the site's feed reads them, in signed order (website cMIP, draft 6: MOR
   * has no clock; a reply comes after what it answers). Only text acts and
   * JPEG pictures are shown; a long-form document is named, with a link to
   * the reader.
   */
  async feed(fresh = false): Promise<{ items: Item[]; more: number; problems: string[]; notes: string[]; followsChanged: boolean; clock: { name: string; placed: number; shown: number } | null }> {
    const { notes, changed: followsChanged } = await this.refreshFollows(fresh);
    const { me, s, p, hints } = await this.ctx();
    // The collective acted as is in its member's feed too.
    const authors = [me.id, ...(s.acting ? [s.acting] : []), ...p.follows.map((f) => f.id).filter((id) => !p.muted.includes(id))].map((identity) => ({ identity, name: null }));
    // H54: ordered by the timestamp clock this identity names (the timestamp clock Module), each signer's own sequence kept.
    const feed = await readFeed(authors, hints, s.via, undefined, s.clock ? { identity: s.clock.id, name: s.clock.name } : null);
    await this.warm([...feed.posts.map((x) => x.signer), ...[...feed.answered.values()].map((x) => x.signer).filter(Boolean)], hints, s.via);
    const items: Item[] = [];
    for (const fp of feed.posts) {
      if (!fp.post) {
        items.push(this.unread(fp, me.id, p));
        continue;
      }
      const answers = fp.answers.map((id) => {
        const a = feed.answered.get(id);
        return { id, who: a?.signer ? this.whoFrom(a.signer, me.id, p) : null, snippet: a?.post ? snippet(a.post.text) : null };
      });
      const toMe = fp.signer !== me.id && answers.some((x) => x.who?.me);
      const it: Item = { ...this.item(fp.post, me.id, p, s, 'feed', fp.corrects ? answers.filter((x) => x.id !== fp.corrects) : answers, toMe), corrects: fp.corrects ?? null, correctedBy: fp.correctedBy ?? [] };
      it.when = fp.time ? timeWords(fp.time) : null;
      it.labels = await this.labelsOf(fp.post, me.id, p, [...hints, ...this.inboxPlaces(p)], s.via);
      // A sealed post (round 2): its publication has no key; read with its offer, and opened where its key is here.
      if (fp.post.refs.some((r) => r.kind === 'picture' && !r.bytes)) {
        const sealed = await this.money.read(me, [...hints, ...this.inboxPlaces(p)], s.via, fp.post.refs.map((r) => (r.kind === 'picture' || r.kind === 'film' ? { id: r.publication, signer: r.signer || undefined } : { id: r.id, signer: r.signer ?? r.actSigner }))).catch(() => null);
        if (sealed) {
          it.sealed = sealed;
          it.pictures = it.pictures.filter((x) => x.publication !== sealed.publication);
          if (sealed.seller !== fp.signer) it.repost = { by: this.whoFrom(fp.signer, me.id, p), of: this.whoFrom(sealed.seller, me.id, p) };
        }
      }
      // A vow (round 3): the post names it and its offer.
      if (!it.sealed && fp.post.refs.some((r) => r.kind === 'act')) {
        const vow = await this.money.readVowRef(me, [...hints, ...this.inboxPlaces(p)], s.via, fp.post.refs.filter((r) => r.kind === 'act').map((r) => ({ id: (r as { id: string }).id, signer: (r as { signer?: string }).signer ?? (r as { actSigner?: string }).actSigner }))).catch(() => null);
        if (vow) it.vow = vow;
      }
      items.push(it);
    }
    // A post signed under a grant (an agent posting in its owner's name, F343): its standing is Agreements', said on whose authority.
    for (const it of items) {
      // Its feed's verifier holds no grant: unknown there (F298), or scoped; only an act bound to a grant is read so.
      if (it.standing === 'valid' || it.via !== 'feed') continue;
      const a = await authorityOfId(it.id, hints, s.via, { names: (id) => this.whoFrom(id, me.id, p).pet ?? this.whoFrom(id, me.id, p).names[0] ?? fingerprint(id) }).catch(() => null);
      if (!a) continue;
      const backed = a.backing === 'backed' || a.backing === 'binds';
      it.authority = { words: a.words, backed };
      it.problem = backed ? null : it.problem;
    }
    const problems = feed.authors.filter((a) => a.problem).map((a) => `${fingerprint(a.identity)}: ${a.problem}`);
    if (feed.clock?.problem) problems.push(`${s.clock?.name ?? 'The clock'}: ${feed.clock.problem}`);
    const clock = s.clock ? { name: s.clock.name, placed: feed.posts.filter((x) => x.time).length, shown: feed.posts.length } : null;
    return { items, more: feed.more, problems, notes, followsChanged, clock };
  }

  private unread(fp: FeedPost, me: string, p: People): Item {
    return { id: fp.id, form: actForm(fp.id), who: this.whoFrom(fp.signer, me, p), standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'feed', problem: fp.problem, seen: true };
  }

  // ------------------------------------------------------------ the relay view (H29)

  /** What each relay was read up to, and its latest acts, by address (this app's memory only). */
  private relays = new Map<string, { after: number | undefined; acts: { id: string; act: Uint8Array }[] }>();

  /**
   * Every public act at this identity's relays, newest first (H29: a filter
   * one chooses, never the default): each relay read from where it was left,
   * its latest acts kept here in memory, newest first in the order each relay
   * received them (its own order, not a signed time), several relays taken
   * in turn. Posts are read and judged as the feed's are; any other public act
   * is named by what it is. Muted identities are left out (the people cMIP,
   * 2.2), and counted. At most `max` shown.
   */
  async relay(max = 30, layers: string[] = RELAY_DEFAULT): Promise<{ items: Item[]; hidden: number; left: number; problems: string[]; clock: { name: string; placed: number; shown: number } | null }> {
    const { me, s, p, hints } = await this.ctx();
    const problems: string[] = [];
    const columns: { id: string; act: Uint8Array; hint: string }[][] = [];
    for (const hint of s.relays) {
      const c = this.relays.get(hint) ?? { after: undefined, acts: [] };
      try {
        for (let pages = 0; pages < 50; pages++) {
          const page = await relayAt(hint, s.via).feed({ after: c.after });
          for (const it of page.items) {
            if (it.kind !== 'act') continue;
            try {
              const d = describeAct(it.item) as Described;
              if (d.public && !c.acts.some((x) => x.id === d.id)) c.acts.push({ id: d.id, act: it.item });
            } catch {
              // not an act this library reads
            }
          }
          if (c.acts.length > 300) c.acts.splice(0, c.acts.length - 300);
          if (!page.items.length || page.next === c.after) break;
          c.after = page.next;
        }
      } catch (e) {
        problems.push(`${hint}: ${message(e)}`);
      }
      this.relays.set(hint, c);
      columns.push([...c.acts].reverse().map((x) => ({ ...x, hint })));
    }
    const order: { id: string; act: Uint8Array; hint: string }[] = [];
    for (let i = 0; columns.some((c) => i < c.length); i++) for (const c of columns) if (c[i] && !order.some((x) => x.id === c[i].id)) order.push(c[i]);
    let hidden = 0;
    let left = 0;
    const picked: { d: Described; hint: string }[] = [];
    for (const x of order) {
      const d = describeAct(x.act) as Described;
      if (p.muted.includes(d.signer ?? d.id)) {
        hidden++;
        continue;
      }
      // H55: text and envelope acts by default; other layers behind the filter.
      if (!layers.includes(layerOf(d))) {
        left++;
        continue;
      }
      if (picked.length < max) picked.push({ d, hint: x.hint });
    }
    // H54: where a clock is named, the acts it stamped by its word, newest first; the others keep the relay's order after them.
    const times = await this.clockTimes(s, hints);
    if (times.size) picked.sort((a, b) => (times.get(b.d.id) ?? -1) - (times.get(a.d.id) ?? -1));
    await this.warm(picked.map((x) => x.d.signer ?? x.d.id), hints, s.via);
    const judge = new Judge([...new Set([...s.relays, ...hints])], s.via);
    const items: Item[] = [];
    for (const { d, hint } of picked) {
      // A genesis carries no signer: the identity it makes is its own id.
      const who = this.whoFrom(d.signer ?? d.id, me.id, p);
      if (d.spec === POST_SPECS.text && d.type === TEXT_ACT && d.signer) {
        try {
          const shown = await readPost(d.id, [hint, ...s.relays, ...hints], s.via, judge);
          items.push({ ...this.item(shown, me.id, p, s, 'relay', [], false), what: null, labels: await this.labelsOf(shown, me.id, p, [hint, ...s.relays, ...hints], s.via) });
          continue;
        } catch (e) {
          items.push({ id: d.id, form: actForm(d.id), who, standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'relay', problem: message(e), seen: true, what: 'A post' });
          continue;
        }
      }
      items.push({ id: d.id, form: actForm(d.id), who, standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'relay', problem: null, seen: true, what: whatAct(d) });
    }
    for (const it of items) it.when = times.has(it.id) ? timeWords(times.get(it.id)!) : null;
    const clock = s.clock ? { name: s.clock.name, placed: items.filter((x) => x.when).length, shown: items.length } : null;
    return { items, hidden, left, problems, clock };
  }

  // ------------------------------------------------------------ the inbox: "to you", and the private side

  private inboxPlaces(p: People): string[] {
    return Object.keys(p.inbox.after);
  }

  /**
   * Read this identity's inbox since last time: everything its inbox relays
   * hold addressed to it, sealed or not; each container opened with its
   * encryption keys, each act judged through its signer's chain. Kept here,
   * so each is read once. Silence proves nothing: what was not delivered to
   * the inbox is not found here.
   */
  private async readInbox(me: TestIdentity, s: Settings, p: People, hints: string[]): Promise<string[]> {
    const problems: string[] = [];
    let inbox: string[] = [];
    try {
      const l = await lookUp(me.id, hints, s.via);
      inbox = list(l.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints));
    } catch (e) {
      problems.push(`Its inbox could not be looked up: ${message(e)}`);
    }
    if (!inbox.length) {
      problems.push('This identity declares no inbox: nothing addressed to it can be found here.');
      return problems;
    }
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const looked = new Map<string, Promise<Lookup>>();
    const judge = async (signer: string, act: Uint8Array, id: string, key?: Uint8Array) => {
      let l = looked.get(signer);
      if (!l) looked.set(signer, (l = lookUp(signer, hints, s.via)));
      try {
        const x = await l;
        if (key) x.verifier.addWithKey(act, key);
        else x.verifier.add(act);
        return x.verifier.status(id) as string;
      } catch (e) {
        return `its signer was not found (${message(e)})`;
      }
    };
    for (const hint of inbox) {
      let after = p.inbox.after[hint];
      try {
        for (;;) {
          const page = await relayAt(hint, s.via).feed({ to: me.id, after });
          for (const it of page.items) {
            const k = await this.readItem(it.kind, it.item, me.id, secrets, judge);
            if (k && !p.inbox.items.some((x) => x.key === k.key)) p.inbox.items.push(k);
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
        p.inbox.after[hint] = after ?? 0;
      } catch (e) {
        problems.push(`${hint}: ${message(e)}`);
      }
    }
    await this.store.savePeople(me.id, p);
    return problems;
  }

  private async readItem(
    kind: 'act' | 'sealed',
    bytes: Uint8Array,
    me: string,
    secrets: Uint8Array[],
    judge: (signer: string, act: Uint8Array, id: string, key?: Uint8Array) => Promise<string>,
  ): Promise<Kept | null> {
    let act = bytes;
    let key: Uint8Array | undefined;
    let d: Described;
    if (kind === 'sealed') {
      type Opened = { act: Uint8Array; key?: Uint8Array; described: Described };
      const open = (): Opened | null => {
        for (const s of secrets) {
          try {
            return openSealed(bytes, me, s) as Opened;
          } catch {
            // the next key
          }
        }
        return null;
      };
      const opened = open();
      if (!opened) {
        return {
          key: `sealed:${sealedId(bytes)}`,
          kind: 'other',
          from: null,
          text: null,
          standing: 'unknown',
          refs: [],
          to: [],
          found: now(),
          problem: secrets.length ? 'a sealed message that does not open with this identity’s encryption keys' : NO_KEY_SAY,
        };
      }
      act = opened.act;
      key = opened.key;
      d = opened.described;
    } else {
      try {
        d = describeAct(bytes) as Described;
      } catch {
        return null;
      }
    }
    if (!d.signer || d.signer === me) return null;
    const isText = d.spec === POST_SPECS.text && d.type === TEXT_ACT && !!d.payload;
    let text: string | null = null;
    let format: string | null = null;
    if (isText) {
      const m = cborDecode(d.payload!) as Map<number, unknown>;
      const t = m.get(0);
      if (typeof t === 'string') text = t;
      const f = m.get(1);
      if (f instanceof Uint8Array) format = hex(f);
    }
    // An Agreements negotiation message (H18): a proposal to sign, or talk in its thread, for the Signing tab.
    const talk = readMessage(d as Parameters<typeof readMessage>[0]);
    if (talk) text = talk.text;
    return {
      ...(talk ? { talk: { thread: talk.thread, previous: talk.previous, acks: talk.acks } } : {}),
      key: d.id,
      kind: !isText ? 'other' : d.public ? 'public' : 'private',
      from: d.signer,
      text,
      standing: await judge(d.signer, act, d.id, key),
      refs: (d.refs ?? []).map((id, i) => ({ id, signer: d.refSigners?.[i] ?? null })),
      to: d.to ?? [],
      format,
      found: now(),
      problem: d.payload ? undefined : 'a private act whose key was not delivered with it: it cannot be read here',
    };
  }

  /**
   * The inbox, read: on the public side, "to you" (public posts that answer
   * one of this identity's posts or are addressed to it); on the private
   * side, the messages sealed to it, with those sent from here. Muted
   * identities are left out (the people cMIP, 2.2), and counted.
   */
  async inbox(): Promise<{ toYou: Item[]; messages: Message[]; encryption: boolean; hidden: number; problems: string[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const problems = await this.readInbox(me, s, p, hints);
      const shown = p.inbox.items.filter((k) => !k.from || !p.muted.includes(k.from));
      const hidden = p.inbox.items.length - shown.length;
      await this.warm([...shown.map((k) => k.from!).filter(Boolean), ...p.sent.map((x) => x.to)], hints, s.via);
      const places = [...hints, ...this.inboxPlaces(p)];
      const toYou: Item[] = [];
      for (const k of shown.filter((x) => x.kind === 'public').sort((a, b) => b.found - a.found).slice(0, 30)) {
        const answers = k.refs.filter((r) => r.signer === me.id || me.f.sequence.includes(r.id));
        if (!answers.length && !k.to.includes(me.id)) continue;
        const ans = answers.map((r) => ({ id: r.id, who: this.whoFrom(me.id, me.id, p), snippet: null }));
        let item: Item;
        try {
          item = this.item(await readPost(k.key, places, s.via), me.id, p, s, 'inbox', ans, true);
        } catch {
          item = {
            id: k.key,
            form: actForm(k.key),
            who: this.whoFrom(k.from!, me.id, p),
            standing: k.standing,
            text: k.text ?? '',
            doc: null,
            pictures: [],
            answers: ans,
            toMe: true,
            via: 'inbox',
            problem: k.standing === 'valid' ? null : `not verified: ${k.standing}`,
            seen: false,
          };
        }
        item.seen = p.seen.includes(k.key);
        toYou.push(item);
      }
      const privates = shown.filter((k) => k.kind === 'private' || (k.kind === 'other' && k.key.startsWith('sealed:')));
      const appended = [...privates.flatMap((k) => (k.from && appendedOf(k.format, k.refs) ? [appendedOf(k.format, k.refs)!] : [])), ...p.sent.flatMap((x) => (x.of ? [x.of] : []))];
      await this.warm([...appended, ...privates.flatMap((k) => k.to), ...p.sent.flatMap((x) => x.cc ?? [])], hints, s.via);
      const ofFor = async (from: string, collective: string | null): Promise<Message['of']> => {
        if (!collective) return null;
        const m = await this.member(from, collective, hints, s.via);
        return { id: collective, name: this.names.get(collective)?.names[0] ?? null, checked: m.checked, why: m.why };
      };
      const unknown: Who = { id: '', short: 'unknown', names: [], pet: null, me: false, followed: false, muted: false, form: '', link: '' };
      const messages: Message[] = [
        ...(await Promise.all(
          privates.map(async (k) => ({
            key: k.key,
            form: k.key.startsWith('sealed:') ? '' : actForm(k.key),
            who: k.from ? this.whoFrom(k.from, me.id, p) : unknown,
            with: k.from ?? k.key,
            // Every recipient sees who else received it (decided: "all parties see it").
            cc: k.to.filter((x) => x !== me.id).map((x) => this.whoFrom(x, me.id, p)),
            of: k.from ? await ofFor(k.from, appendedOf(k.format, k.refs)) : null,
            dir: 'in' as const,
            text: k.text ?? '',
            standing: k.standing,
            at: k.found,
            seen: p.seen.includes(k.key),
            problem: k.problem ?? (k.standing === 'valid' ? null : `not verified: ${k.standing}`),
          })),
        )),
        ...(await Promise.all(
          p.sent.map(async (x) => ({
            key: x.id,
            form: actForm(x.id),
            who: this.whoFrom(me.id, me.id, p),
            with: x.to,
            cc: (x.cc ?? []).map((y) => this.whoFrom(y, me.id, p)),
            of: await ofFor(me.id, x.of ?? null),
            dir: 'out' as const,
            text: x.text,
            standing: 'valid',
            at: x.at,
            seen: true,
            problem: null,
          })),
        )),
      ].sort((a, b) => b.at - a.at);
      return { toYou, messages, encryption: me.f.encryption.length > 0, hidden, problems };
    });
  }

  /**
   * A private message (F293): a private text act addressed to one identity,
   * sealed to its current encryption key and left in its inbox. Only it can
   * open it. Kept here as sent; the act itself, locked, goes to this
   * identity's homes too, so this app's line can be rebuilt by whoever
   * changes its keys (Identity rule 35), and it shows only that a private act
   * exists.
   */
  message(a: { to: string; text: string; cc?: string[]; collective?: string | null }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (s.acting) throw new Error('A collective writes in public only, from Dub: write in your own name, and append the collective to your message. Nothing was sent.');
      const read = (typed: string, label: string) => {
        try {
          return readIdWhere(typed);
        } catch (e) {
          throw new Error(`${label}: ${message(e)}. Nothing was sent.`);
        }
      };
      const first = read(a.to, 'To');
      const all = [first, ...(a.cc ?? []).filter((x) => x.trim()).map((x) => read(x, 'Cc'))];
      const to = first.id;
      const ids = [...new Set(all.map((x) => x.id))];
      if (ids.includes(me.id)) throw new Error('To or Cc: that is this identity itself. Nothing was sent.');
      const { text } = compose(a.text);
      if (!text.trim()) throw new Error('Write something to send.');
      // A collective appended (the appended collective cMIP): one this identity can act as from here, so its membership is known.
      let of: string | null = null;
      if (a.collective) {
        of = readId(a.collective);
        if (!(s.collectives ?? []).some((c) => c.id === of)) throw new Error('Only a collective added under this identity can be appended. Nothing was sent.');
      }
      const reach: { id: string; key: Uint8Array; inbox: string[] }[] = [];
      for (const x of all.filter((y, i) => all.findIndex((z) => z.id === y.id) === i)) {
        let l: Lookup;
        try {
          l = await lookUp(x.id, [...x.hints, ...hints], s.via);
        } catch (e) {
          throw new Error(`The identity ${fingerprint(x.id)} was not found: ${message(e)}. Nothing was sent.`);
        }
        if (!l.encryptionKey) throw new Error(`The identity ${fingerprint(x.id)} has published no encryption key, so nothing can be sealed to it. Nothing was sent.`);
        const inbox = l.inbox(SPECS.text);
        if (!inbox?.length) throw new Error(`The identity ${fingerprint(x.id)} declares no inbox. Nothing was sent.`);
        reach.push({ id: x.id, key: l.encryptionKey, inbox });
      }
      await this.current(me);
      // Every recipient is named in the inner act's `to`, and the container holds one capsule each (Envelopes, the sealed container): each sees who else received it.
      const made = await this.signed(me, async () =>
        me.sign(SPECS.text, TEXT_ACT, textPayload(text, of ? APPENDED_FORMAT : null), { public: false, to: ids, ...(of ? { refs: [appendedRef(of)] } : {}) }),
      );
      const sealed = sealFor(made.act, made.key, reach.map((r) => ({ id: r.id, key: r.key })));
      const lines: Line[] = [];
      let left = 0;
      for (const r of reach) {
        let here = 0;
        for (const h of r.inbox) {
          try {
            await relayAt(h, s.via).putSealed(sealed);
            here++;
          } catch (e) {
            lines.push({ text: `${h} did not take it: ${message(e)}`, tone: 'warn' });
          }
        }
        if (here) left++;
        else if (r.id !== to) lines.push({ text: `No inbox of ${fingerprint(r.id)} (Cc) took it.`, tone: 'bad' });
      }
      if (!left) throw new Error(`No inbox took the message: ${lines.map((x) => x.text).join('; ')}. It is signed, not delivered.`);
      for (const h of me.f.homes) {
        try {
          await relayAt(h.hint, s.via).putAct(made.act);
        } catch {
          // a home may decline a private act: the line is then read by its card
        }
      }
      const cc = ids.filter((x) => x !== to);
      p.sent.push({ id: made.id, to, text, at: now(), ...(cc.length ? { cc } : {}), ...(of ? { of } : {}) });
      await this.store.savePeople(me.id, p);
      lines.unshift({ text: cc.length ? `Sealed to ${this.nameOf(to, me.id, p)} and, in Cc, ${cc.map((x) => this.nameOf(x, me.id, p)).join(', ')}, and left in each inbox: only they can open it, and each sees who else received it.` : `Sealed to ${this.nameOf(to, me.id, p)} and left in their inbox: only they can open it.`, tone: 'ok' });
      if (of) lines.push({ text: `Written in your own name, with the collective ${fingerprint(of)} appended: it binds nothing, and the reader’s app shows it only where your membership checks.` });
      return { lines };
    });
  }

  /** Mark what the person has seen, for the counts on the tabs. */
  // ------------------------------------------------------------ the Signing tab (H18)

  /** Turn the Signing tab on or off for the identity in use (off by default, F59). */
  setSigning(on: boolean): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.saveSettings(me.id, { ...s, signing: on });
      return { lines: [{ text: on ? `Signing is on. ${SIGNING_SAY}` : 'Signing is off. Proposals wait in your inbox, unread, until it is on again.', tone: on ? 'warn' : undefined }] };
    });
  }

  /** How this app names an identity in a reading: the name given here or its display name, beside its fingerprint; "you" for itself. */
  private namer(me: string, p: People): (id: string) => string {
    return (id: string) => {
      const w = this.whoFrom(id, me, p);
      const n = w.pet ?? w.names[0] ?? null;
      return `${id === me ? 'you' : n ? n : 'an identity'} [${w.short}]`;
    };
  }

  /** The proposals in this identity's inbox (negotiation messages opening a thread), each read in plain words; or, with Signing off, how many wait. */
  proposals(): Promise<{ on: boolean; waiting: number; proposals: Proposal[]; problems: string[]; say: string }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const problems = await this.readInbox(me, s, p, hints);
      const firsts = p.inbox.items.filter((k) => k.talk && k.talk.thread === k.key && k.from && k.from !== me.id && !p.muted.includes(k.from) && k.refs.length);
      if (!s.signing) return { on: false, waiting: firsts.length, proposals: [], problems, say: SIGNING_OFF_SAY };
      const st = await this.store.signing(me.id);
      await this.warm(firsts.map((k) => k.from!), hints, s.via);
      const names = this.namer(me.id, p);
      const out: Proposal[] = [];
      for (const k of firsts.sort((a, b) => b.found - a.found)) {
        const act = k.refs[0].id;
        const signer = k.refs[0].signer;
        const places = [...new Set([...hints, ...(await this.placesOf(signer ?? k.from!, hints, s.via))])];
        const laterKept = p.inbox.items.filter((x) => x.talk?.thread === k.key && x.key !== k.key && x.from === k.from);
        const later = laterKept.map((x) => x.text ?? '');
        let reading: Awaited<ReturnType<typeof readProposal>> | null = null;
        let problem: string | null = null;
        try {
          const got = await fetchAct(act, places, s.via);
          if (!got) problem = `The act it asks you to sign (${act}) was not found at ${places.join(', ')}.`;
          else reading = await readProposal(got.act, names, places, s.via);
        } catch (e) {
          problem = `It could not be read: ${message(e)}`;
        }
        const ans = st.answered[k.key] ?? null;
        const w = st.waiting[k.key];
        const r = st.received[k.key];
        let share: Proposal['share'] = 'none';
        if (r) share = r.byHand ? 'byHand' : 'received';
        else if (w?.shown) share = 'shown';
        else if (w) {
          try {
            share = (await openShare(unhex(w.secret), places, places, s.via)) ? 'ready' : 'waiting';
          } catch {
            share = 'waiting';
          }
        }
        out.push({
          thread: k.key,
          from: this.whoFrom(k.from!, me.id, p),
          text: k.text ?? '',
          later,
          act,
          collective: this.collectiveOf(p, k.key) ?? reading?.collective ?? null,
          reading: reading ? { kind: reading.kind, title: reading.title, summary: reading.summary, sections: reading.sections, plain: reading.plain, risks: reading.risks, blocking: reading.blocking } : null,
          problem,
          answer: ans ? { verdict: ans.verdict, signature: ans.signature } : null,
          share,
          positions: w?.shown ?? null,
          seen: p.seen.includes(k.key),
          left: st.left?.[k.key] ?? null,
        });
      }
      return { on: true, waiting: firsts.filter((k) => !st.answered[k.key]).length, proposals: out, problems, say: SIGNING_SAY };
    });
  }

  /** The collective a thread is about, as the proposer's messages in it name it (their second reference). */
  private collectiveOf(p: People, thread: string): string | null {
    for (const x of p.inbox.items) if (x.talk?.thread === thread && x.refs[1]) return x.refs[1].id;
    return null;
  }

  /** Where an identity's acts are: its homes and the relays its routes name. */
  private async placesOf(id: string, hints: string[], via: Via): Promise<string[]> {
    try {
      const l = await lookUp(id, hints, via);
      return [...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)];
    } catch {
      return [];
    }
  }

  /** The proposal a thread opens, from the inbox as read, with the act it names fetched again. */
  private async proposal(me: TestIdentity, s: Settings, p: People, hints: string[], thread: string) {
    if (!s.signing) throw new Error(SIGNING_OFF_SAY);
    const k = p.inbox.items.find((x) => x.key === thread && x.talk?.thread === thread && x.from && x.refs.length);
    if (!k) throw new Error('No such proposal in this identity’s inbox.');
    const act = k.refs[0].id;
    const places = [...new Set([...hints, ...(await this.placesOf(k.refs[0].signer ?? k.from!, hints, s.via))])];
    const got = await fetchAct(act, places, s.via);
    if (!got) throw new Error(`The act it asks you to sign (${act}) was not found. Nothing was signed.`);
    const reading = await readProposal(got.act, this.namer(me.id, p), places, s.via);
    const collective = k.refs[1]?.id ?? reading.collective;
    return { k, act, places, reading, collective, proposer: k.from! };
  }

  /**
   * Sign what a proposal names, as read (Agreements rule 4): the member's own
   * signature act, public, at this identity's relays, where the act was
   * found and, for a collective's clone or release, at the collective's
   * homes; then the answer to the proposer, a negotiation message in its
   * thread, acknowledging it. For a founding or a member change, the answer
   * carries the public half of a one-time key made for this share alone
   * (H18), whose secret is held here until the share is shown and written
   * down.
   */
  signProposal(thread: string): Promise<{ lines: Line[]; signature: string }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      if (st.answered[thread]) throw new Error(`You already ${st.answered[thread].verdict} it. Nothing more was signed.`);
      const { act, places, reading, collective, proposer } = await this.proposal(me, s, p, hints, thread);
      if (reading.blocking.length) throw new Error(`It cannot be signed here: ${reading.blocking.join(' ')} Nothing was signed.`);
      await this.current(me);
      const where = [...new Set([...s.relays, ...places, ...(collective ? await this.placesOf(collective, hints, s.via) : [])])];
      // F353 (Agreements draft 16): a holder of an area in a founding or a
      // member change names a key of their own in their signature, made now;
      // its private half is sealed to themself at their homes (the member
      // keys cMIP), so any of their apps can act with it.
      const holds = reading.kind === 'founding' || reading.kind === 'clone' ? await holdsAnArea(act, places, me.id, s.via) : false;
      const key = holds ? makeMemberKey() : null;
      // A collective's act or release waiting for a second key: signed as
      // the collective with your own member key where your apps hold one
      // (F353: "it needs two keys that have grant active on that lane");
      // otherwise with your own identity's key, which counts as before.
      let own: MemberKey | null = null;
      if ((reading.kind === 'act' || reading.kind === 'release') && collective) {
        const keys = await readMemberKeys(me.id, me.f.encryption.map((e) => unhex(e.secret)), me.f.homes.map((h) => h.hint), s.via).catch(() => []);
        own = keys.length ? await memberKeyFor(keys, collective, where, s.via).catch(() => null) : null;
      }
      let made: { id: string };
      if (own) {
        const at = await chainFor(collective!, own, where, s.via);
        const x = cosignAsMember(collective!, own, at, act);
        const took = await publishAt([x.act], where, s.via);
        if (!took.length) throw new Error('No relay took your signature. Nothing counts yet: try again.');
        made = { id: x.id };
      } else made = await this.signed(me, () => signAct(me, act, where, key?.public));
      const lines: Line[] = [{ text: own ? `Signed for the collective with your own key (F353): the signature act ${made.id} is published at ${where.join(', ')}.` : `Signed: your signature act ${made.id} is published at ${where.join(', ')}.`, tone: 'ok' }];
      if (key) {
        try {
          await this.signed(me, () => sealMemberKey(me, { terms: act, signature: made.id, public: key.public, secret: key.secret }, () => undefined));
          lines.push({ text: `Your own key for this collective was made and named in your signature: once the collective is complete, it signs for you in the areas you hold, from any of your apps. Its private half is sealed to you at your homes (it sits there encrypted, a stated cost; F353).`, tone: 'ok' });
        } catch (e) {
          lines.push({ text: `Your own key was named in your signature, but could not be sealed to you: ${message(e)}`, tone: 'bad' });
        }
      }
      let oneTime: Uint8Array | undefined;
      if (reading.kind === 'founding' || reading.kind === 'clone') {
        const k = TestIdentity.newBareKey();
        oneTime = k.public;
        st.waiting[thread] = { secret: hex(k.secret), since: now(), act };
        lines.push({ text: 'A one-time key was made for your share of the collective’s chain key: its secret stays in this app only until the share arrives and you have written it down, then it is destroyed.' });
      }
      st.answered[thread] = { act, verdict: 'signed', signature: made.id, reply: '', at: now() };
      await this.store.saveSigning(me.id, st);
      const reach = await this.reach(proposer, hints, s.via);
      const reply = await this.signed(me, () => negotiate(me, reach, { text: acceptanceText(made.id, oneTime), thread, previous: this.lastFrom(p, thread, proposer), acks: [this.lastFrom(p, thread, proposer)] }));
      st.answered[thread].reply = reply.id;
      await this.store.saveSigning(me.id, st);
      lines.push({ text: reply.left.length ? `Your answer was left in the proposer’s inbox (${reply.left.join(', ')}).` : `Your answer could not be left in the proposer’s inbox: ${reply.failed.map((f) => `${f.relay}: ${f.reason}`).join('; ')}.`, tone: reply.left.length ? undefined : 'bad' });
      return { lines, signature: made.id };
    });
  }

  /** Decline a proposal: a negotiation message in its thread saying so; nothing is signed for it. */
  declineProposal(thread: string, why = ''): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      if (st.answered[thread]) throw new Error(`You already ${st.answered[thread].verdict} it.`);
      const k = p.inbox.items.find((x) => x.key === thread && x.talk?.thread === thread && x.from);
      if (!k) throw new Error('No such proposal in this identity’s inbox.');
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      await this.current(me);
      const reach = await this.reach(k.from!, hints, s.via);
      const last = this.lastFrom(p, thread, k.from!);
      const reply = await this.signed(me, () => negotiate(me, reach, { text: why.trim() ? `${DECLINED}\n${compose(why).text}` : DECLINED, thread, previous: last, acks: [last] }));
      st.answered[thread] = { act: k.refs[0]?.id ?? '', verdict: 'declined', reply: reply.id, at: now() };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: 'Declined: nothing was signed, and the proposer was told.' }] };
    });
  }

  /**
   * Leaving a collective alone (Agreements rule 70, F354 question 2): read
   * back first. The collective is the one a founding (or member change) this
   * identity signed founded; its agreement in force read as anyone reads it;
   * the warnings rule 70 asks of the client before signing (the last voice;
   * the last constitutional voice, BQ5), counted with the resignations the
   * other parties published that no line registered yet (F187, 3). Nothing
   * is signed.
   */
  leaveRead(thread: string): Promise<{ collective: string; agreement: string; lines: Line[]; digest: string }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      const st = await this.store.signing(me.id);
      const ans = st.answered[thread];
      const collective = this.collectiveOf(p, thread);
      if (!ans || ans.verdict !== 'signed' || !collective) throw new Error('Only a collective this identity signed into, once founded, can be left from here.');
      const places = [...new Set([...hints, ...s.relays, ...(await this.placesOf(collective, hints, s.via))])];
      const now = await collectiveNow(collective, places, s.via);
      if (!now.agreement) throw new Error('The collective’s agreement in force could not be read from its relays and homes: no resignation can name it. Nothing was signed.');
      if (!now.parties.includes(me.id) || now.departed.includes(me.id)) throw new Error('This identity is no member of it now: there is nothing to leave.');
      if (now.resignations.some((r) => r.party === me.id && r.kind === 'resigned')) throw new Error('This identity already published its resignation: it takes effect once the collective registers it.');
      const leaving = new Set([me.id, ...now.departed, ...now.resignations.filter((r) => r.kind === 'resigned').map((r) => r.party)]);
      const others = now.parties.filter((x) => !leaving.has(x));
      const lines: Line[] = [
        { text: `You resign from the collective ${shownId(collective)}, alone: nobody else’s signature is needed (Agreements rule 70).`, tone: 'warn' },
        { text: 'It takes effect at the collective’s line registering it: its founder’s Edubba draws it, then proposes the change of members without you, which waits for Kišib.' },
        { text: 'You keep your stake, and stay bound by what you signed: you become a departed holder, paid as every holder is, with no voice (rule 68).' },
        { text: 'Your own key for this collective acts no more once the change without you is in force; a signature of yours placed before the line still counts for what it signed.' },
      ];
      if (!others.length) {
        lines.push({ text: 'You are the last voice that remains: once you leave, the collective’s works are frozen as they stand, and nobody will be able to change, release or move them (rule 70, F185). Leaving stays yours alone.', tone: 'bad' });
      }
      const payload = resignationPayload(now.agreement);
      return { collective, agreement: now.agreement, lines, digest: sha256(payload) };
    });
  }

  /** Sign the resignation read back by [`leaveRead`], publish it at the collective's places, and tell the proposer in the founding's thread. */
  leaveCollective(thread: string, digest: string): Promise<{ lines: Line[]; resignation: string }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      const collective = this.collectiveOf(p, thread);
      if (!collective) throw new Error('No such collective here.');
      const places = [...new Set([...hints, ...s.relays, ...(await this.placesOf(collective, hints, s.via))])];
      const now = await collectiveNow(collective, places, s.via);
      if (!now.agreement || sha256(resignationPayload(now.agreement)) !== digest) throw new Error('The collective’s agreement in force changed since it was read back: read it again. Nothing was signed.');
      await this.current(me);
      const made = await this.signed(me, () => resignAct(me, now.agreement!, places));
      const k = p.inbox.items.find((x) => x.key === thread && x.from);
      const lines: Line[] = [{ text: `Your resignation is act ${made.id}, public at ${places.join(', ')}. It takes effect once the collective registers it.`, tone: 'ok' }];
      if (k?.from) {
        try {
          const reach = await this.reach(k.from, hints, s.via);
          const last = this.lastFrom(p, thread, k.from);
          await this.signed(me, () => negotiate(me, reach, { text: `${RESIGNED}\n${made.id}`, thread, previous: st.answered[thread]?.reply || last, acks: [last] }));
          lines.push({ text: 'The founder was told, in the founding’s thread: their Edubba registers it and proposes the change of members without you.' });
        } catch (e) {
          lines.push({ text: `The founder could not be told (${message(e)}): their Edubba still finds your resignation at the collective’s relays.`, tone: 'warn' });
        }
      }
      st.left = { ...(st.left ?? {}), [thread]: made.id };
      await this.store.saveSigning(me.id, st);
      return { lines, resignation: made.id };
    });
  }

  /** The latest message of the other side in a thread, as this app read it: what an answer follows and acknowledges. */
  private lastFrom(p: People, thread: string, from: string): string {
    const theirs = p.inbox.items.filter((x) => x.talk?.thread === thread && x.from === from);
    const ids = new Set(theirs.map((x) => x.key));
    // The one no other of theirs follows.
    return theirs.find((x) => !theirs.some((y) => y.talk?.previous === x.key && ids.has(y.key)))?.key ?? thread;
  }

  private async reach(id: string, hints: string[], via: Via) {
    const l = await lookUp(id, hints, via);
    if (!l.encryptionKey) throw new Error('The proposer has published no encryption key: no answer can be sealed to it. Nothing was sent.');
    const inbox = l.inbox(REPO_SPECS.agreements) ?? l.inbox(POST_SPECS.text);
    if (!inbox?.length) throw new Error('The proposer declares no inbox. Nothing was sent.');
    return { id, key: l.encryptionKey, inbox };
  }

  /** Open the share waiting for a thread with its one-time key. */
  private async shareFor(me: TestIdentity, s: Settings, hints: string[], thread: string) {
    const st = await this.store.signing(me.id);
    const w = st.waiting[thread];
    if (!w) throw new Error('No share is waiting for this proposal here.');
    const places = [...new Set([...hints, ...(await this.inboxOf(me.id, hints, s.via))])];
    const got = await openShare(unhex(w.secret), places, places, s.via);
    if (!got) throw new Error('The share has not arrived yet: the founder’s Edubba sends it once every member has signed.');
    const paper = shareOnPaper(got.share) as { x: number; value: Uint8Array; threshold: number; holders: number; fingerprint: string };
    return { st, w, paper };
  }

  private async inboxOf(id: string, hints: string[], via: Via): Promise<string[]> {
    try {
      return list((await lookUp(id, hints, via)).routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints));
    } catch {
      return [];
    }
  }

  /**
   * Show a member's share once (H18): its number and 24 words, labelled as
   * the collective's chain key share, checked against the dealing first.
   * From then on it is never shown again; three of its words are asked back
   * (as H3), and only then is the one-time key destroyed.
   */
  shareShow(thread: string): Promise<ShareShown> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      const { st, w, paper } = await this.shareFor(me, s, hints, thread);
      if (w.shown) throw new Error('It was shown once already: type back the three words asked.');
      const positions = threePositions(randomBelow);
      w.shown = positions;
      await this.store.saveSigning(me.id, st);
      return {
        thread,
        x: paper.x,
        holders: paper.holders,
        threshold: paper.threshold,
        words: toWords(paper.value),
        fingerprint: paper.fingerprint.match(/.{1,4}/g)!.slice(0, 8).join(' '),
        collective: this.collectiveOf(p, thread),
        say: SHARE_SAY,
        positions,
      };
    });
  }

  /** Three words of the share typed back: then the one-time key is destroyed, and the relays' copy can never be opened again. */
  shareConfirm(thread: string, typed: string[]): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { st, w, paper } = await this.shareFor(me, s, hints, thread);
      if (!w.shown) throw new Error('The share has not been shown yet.');
      if (!typedBack(toWords(paper.value), w.shown, typed)) {
        throw new Error(`Those are not words ${w.shown.join(', ')} of your share as shown. Look at what you wrote down. The one-time key is kept until they are.`);
      }
      delete st.waiting[thread];
      st.received[thread] = { x: paper.x, fingerprint: paper.fingerprint, collective: this.collectiveOf(p, thread), at: now() };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: `Share ${paper.x} is written down. The one-time key is destroyed: the copy on the relays can never be opened again, by anyone. Keep the paper safe.`, tone: 'ok' }] };
    });
  }

  /** The share came by hand, shown on the founder's screen: the one-time key is destroyed unused. */
  shareByHand(thread: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const st = await this.store.signing(me.id);
      const w = st.waiting[thread];
      if (!w) throw new Error('No share is waiting for this proposal here.');
      delete st.waiting[thread];
      st.received[thread] = { x: 0, fingerprint: '', collective: null, at: now(), byHand: true };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: 'The one-time key is destroyed: a share sealed to it later could never be opened.' }] };
    });
  }

  async seen(keys: string[]): Promise<void> {
    await this.serial(async () => {
      const { me, p } = await this.ctx();
      p.seen = [...new Set([...p.seen, ...keys])];
      await this.store.savePeople(me.id, p);
    });
  }

  // ------------------------------------------------------------ follow and mute (the people cMIP)

  private async people<T>(f: (p: People, me: TestIdentity) => T): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      // The change is made to the list as the identity's homes hold it now (the people cMIP, draft 2, 3.6).
      const lines = await this.syncFollows(me, s, p, (q) => f(q, me));
      if (p.list === 'published') lines.push(...(await this.publishList(me, s, p, false)));
      return { lines };
    });
  }

  // ------------------------------------------------------------ the redesign (21 October 2026): what the act card's menus, the profile and the mailbox ask

  /** Memberships checked lately (the appended collective cMIP), by member and collective: this app's memory only. */
  private checked = new Map<string, { at: number; r: { checked: boolean; why: string | null } }>();

  /** Whether `member` is a member of `collective` now, read at most every ten minutes. */
  private async member(member: string, collective: string, hints: string[], via: Via): Promise<{ checked: boolean; why: string | null }> {
    const k = `${member}:${collective}`;
    const c = this.checked.get(k);
    if (c && c.at + NAMES_FOR > now()) return c.r;
    const r = await membership(member, collective, hints, via);
    this.checked.set(k, { at: now(), r });
    return r;
  }

  /** Stamps read lately from the clock named (H54), by clock: this app's memory only, at most once a minute. */
  private stamps = new Map<string, { at: number; earliest: Map<string, number> }>();

  /** When the clock this identity names says it held each act (its earliest stamp); empty where none is named or it cannot be read. */
  private async clockTimes(s: Settings, hints: string[]): Promise<Map<string, number>> {
    if (!s.clock) return new Map();
    const c = this.stamps.get(s.clock.id);
    if (c && c.at + 60 > now()) return c.earliest;
    try {
      const places = [...new Set([...(await this.placesOf(s.clock.id, hints, s.via)), ...hints])];
      const r = await readStamps(s.clock.id, places, new Judge(places, s.via), s.via);
      this.stamps.set(s.clock.id, { at: now(), earliest: r.earliest });
      return r.earliest;
    } catch {
      return new Map();
    }
  }

  /**
   * Name the timestamp clock this identity's feeds are ordered by (H54; the
   * timestamp clock Module, draft 2): its ID, and a name for it here. Empty:
   * none, each signer's own order. Nothing is signed.
   */
  setClock(a: { id: string; name: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (!a.id.trim()) {
        await this.store.saveSettings(me.id, { ...s, clock: null });
        return { lines: [{ text: 'No clock named: feeds are in each signer’s own order, which is not a time.' }] };
      }
      const id = readId(a.id);
      const name = a.name.trim().slice(0, 48) || `the clock ${fingerprint(id)}`;
      await this.store.saveSettings(me.id, { ...s, clock: { id, name } });
      this.stamps.delete(id);
      return { lines: [{ text: `Feeds are ordered by ${name}’s clock: its word on when it held each act, never a verdict. Acts it did not stamp keep their signer’s own order.`, tone: 'ok' }] };
    });
  }

  /** Labels a post carries (H65): an agent's answer to a pick or under a nudge, and who gave it, read from the acts it names first. */
  private async labelsOf(sp: ShownPost, me: string, p: People, places: string[], via: Via): Promise<Label[]> {
    const out: Label[] = [];
    for (const r of sp.refs) {
      if (r.kind !== 'act' || !r.actSigner || r.what === 'a text act') continue;
      try {
        const act = (await followRef(r.signer ? [r.id, r.signer] : r.id, places, via)).act;
        const d = describeAct(act) as Described;
        if (d.spec !== NUDGE_SPECS.nudge || !d.payload || !d.signer) continue;
        const name = this.nameOf(d.signer, me, p);
        if (d.type === NUDGE_TYPES.pick && decodePick(d.payload).agent === sp.signer) out.push({ text: `a pick by ${name}` });
        if (d.type === NUDGE_TYPES.nudge && decodeNudge(d.payload).agent === sp.signer) out.push({ text: `under a nudge from ${name}` });
      } catch {
        // not found, or not a pick or a nudge
      }
    }
    return out;
  }

  /** An identity's name as this app says it: the name given here, its display name, or its fingerprint. */
  private nameOf(id: string, me: string, p: People): string {
    const w = this.whoFrom(id, me, p);
    return id === me ? 'you' : (w.pet ?? w.names[0] ?? w.short);
  }

  /** One act, read and judged, as a card shows it: a post as the feed reads posts, any other act named by what it is. */
  private async readOne(id: string, signer: string | null, me: string, p: People, s: Settings, places: string[]): Promise<Item> {
    try {
      const sp = await readPost(id, places, s.via);
      const it = this.item(sp, me, p, s, 'feed', [], false);
      await this.warm([sp.signer], places, s.via);
      it.who = this.whoFrom(sp.signer, me, p);
      it.labels = await this.labelsOf(sp, me, p, places, s.via);
      return it;
    } catch {
      // not a public text act: read it as an act
    }
    let act: Uint8Array;
    try {
      act = (await followRef(signer ? [id, signer] : id, places, s.via)).act;
    } catch (e) {
      throw new Error(`The act ${shortAct(id)} was not found: ${message(e)}. Silence proves nothing: another relay may hold it.`);
    }
    const d = describeAct(act) as Described;
    const by = d.signer ?? d.id;
    await this.warm([by], places, s.via);
    let standing = 'unknown';
    try {
      const l = await lookUp(by, places, s.via);
      l.verifier.add(act);
      standing = l.verifier.status(d.id) as string;
    } catch {
      // its signer was not found
    }
    return { id: d.id, form: actForm(d.id), who: this.whoFrom(by, me, p), standing, text: d.public ? '' : 'A private act: only its recipients can open it.', doc: null, pictures: [], answers: [], toMe: false, via: 'relay', problem: standing === 'valid' ? null : `not verified: ${standing}`, seen: true, what: whatAct(d) };
  }

  /**
   * Open an act by its ID (H50, H74): what a post answers or corrects,
   * fetched from where its signer lives. Read, judged and returned as a card;
   * nothing is signed.
   */
  open(a: { id: string; signer?: string }): Promise<{ item: Item }> {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const signer = a.signer ? readId(a.signer) : null;
      const places = [...new Set([...hints, ...this.inboxPlaces(p), ...(signer ? await this.placesOf(signer, hints, s.via) : [])])];
      return { item: await this.readOne(id, signer, me.id, p, s, places) };
    });
  }

  /**
   * Why an act is valid, or not, in plain words (the act's menu): what it is,
   * who signed it and with what key their identity chain counts, its
   * standing as the core library judges it, and what it names. Nothing is
   * signed.
   */
  why(a: { id: string; signer?: string }): Promise<{ title: string; lines: Line[] }> {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const signer = a.signer ? readId(a.signer) : null;
      const places = [...new Set([...hints, ...this.inboxPlaces(p), ...(signer ? await this.placesOf(signer, hints, s.via) : [])])];
      let act: Uint8Array;
      try {
        act = (await followRef(signer ? [id, signer] : id, places, s.via)).act;
      } catch (e) {
        return { title: 'Not found', lines: [{ text: `The act ${shortAct(id)} was not found at ${places.join(', ')}: ${message(e)}. Silence proves nothing: another relay may hold it.`, tone: 'warn' as const }] };
      }
      const d = describeAct(act) as Described;
      const by = d.signer ?? d.id;
      await this.warm([by], places, s.via);
      const lines: Line[] = [{ text: `${whatAct(d)}, act ${actForm(d.id)}.` }];
      if (!d.signer) lines.push({ text: 'An identity’s genesis: it makes the identity whose ID is its own.' });
      else lines.push({ text: `Signed by ${this.nameOf(by, me.id, p)} (${idForm(by)}).` });
      let standing = 'unknown';
      try {
        const l = await lookUp(by, places, s.via);
        l.verifier.add(act);
        standing = l.verifier.status(d.id) as string;
        if (l.resolution.stop === 'contested') lines.push({ text: 'Its signer’s homes disagree about its keys: its identity is contested.', tone: 'bad' });
        else lines.push({ text: `Its signer’s identity chain was read from ${l.resolution.homes.length} home${l.resolution.homes.length === 1 ? '' : 's'}, ${l.resolution.links.length} act${l.resolution.links.length === 1 ? '' : 's'} long.` });
      } catch (e) {
        lines.push({ text: `Its signer was not found: ${message(e)}.`, tone: 'warn' });
      }
      const w = standingWords(standing);
      lines.push({ text: w.words.replace(' in this browser', ' here'), tone: w.ok ? 'ok' : standing === 'void' || standing === 'invalid' ? 'bad' : 'warn' });
      if (standing !== 'valid' && d.signer) {
        const auth = await authorityOfId(d.id, places, s.via, { names: (x) => this.nameOf(x, me.id, p) }).catch(() => null);
        if (auth) lines.push({ text: auth.words, tone: auth.backing === 'backed' || auth.backing === 'binds' ? 'ok' : 'warn' });
      }
      if (d.refs?.length) lines.push({ text: `It names ${d.refs.length} other act${d.refs.length === 1 ? '' : 's'}: ${d.refs.map((r) => shortAct(r)).join(', ')}.` });
      if (d.to?.length) lines.push({ text: `It is addressed to ${d.to.map((x) => this.nameOf(x, me.id, p)).join(', ')}.` });
      lines.push({ text: 'A verdict rests on signatures and identity chains only: no clock, no relay and no app decides it.' });
      return { title: w.ok ? 'Why it’s valid' : 'Why it is not valid', lines };
    });
  }

  /**
   * An identity's profile (decided: "light and friendly"): its name and
   * display name, where it lives (and since when, by the clock named, where
   * it stamped its genesis), trouble only where there is, and its posts.
   */
  profile(a: { id: string }): Promise<{ who: Who; lives: string; trouble: string | null; items: Item[]; clock: { name: string; placed: number; shown: number } | null; problems: string[] }> {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const { id, hints: where } = readIdWhere(a.id);
      const places = [...new Set([...where, ...hints])];
      await this.warm([id], places, s.via);
      let lives = 'Where it lives was not found.';
      let trouble: string | null = null;
      let theirs: string[] = [];
      try {
        const l = await lookUp(id, places, s.via);
        const homes = l.resolution.homes.map((h) => hostOf(h.hint));
        const relays = list(l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints));
        theirs = [...l.resolution.homes.map((h) => h.hint), ...relays];
        lives = `Lives on ${homes.length === 1 ? 'one home' : `${homes.length} homes`} (${homes.join(', ')}), reached through ${relays.length === 1 ? 'one relay' : `${relays.length} relays`}.`;
        if (l.resolution.stop === 'contested') trouble = 'Its homes disagree about its keys: this identity is contested. Its acts may not be what they seem.';
        const t = await this.clockTimes(s, hints);
        const since = t.get(id);
        if (since) lives += ` Since ${timeWords(since)}, by ${s.clock!.name}’s clock.`;
      } catch (e) {
        trouble = `It could not be looked up: ${message(e)}.`;
      }
      const feed = await readFeed([{ identity: id, name: null }], [...new Set([...theirs, ...places])], s.via, undefined, s.clock ? { identity: s.clock.id, name: s.clock.name } : null);
      const items: Item[] = [];
      for (const fp of feed.posts) {
        if (!fp.post) continue;
        const it = { ...this.item(fp.post, me.id, p, s, 'feed', fp.answers.map((x) => ({ id: x, who: null, snippet: null })), false), corrects: fp.corrects ?? null, correctedBy: fp.correctedBy ?? [] };
        it.when = fp.time ? timeWords(fp.time) : null;
        items.push(it);
      }
      return {
        who: this.whoFrom(id, me.id, p),
        lives,
        trouble,
        items,
        clock: feed.clock ? { name: s.clock?.name ?? feed.clock.name ?? 'the clock', placed: feed.posts.filter((x) => x.time).length, shown: feed.posts.length } : null,
        problems: feed.authors.filter((x) => x.problem).map((x) => x.problem!),
      };
    });
  }

  /** Rely on an act, read back first (H77; Identity, the witness act): what it is, who signed it, and what signing says. Nothing is signed. */
  relyRead(a: { id: string; signer?: string }): Promise<{ lines: Line[]; explanation: string; blocking: string[] }> {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const signer = a.signer ? readId(a.signer) : null;
      const places = [...new Set([...hints, ...this.inboxPlaces(p), ...(signer ? await this.placesOf(signer, hints, s.via) : [])])];
      const blocking: string[] = [];
      const lines: Line[] = [];
      try {
        const act = (await followRef(signer ? [id, signer] : id, places, s.via)).act;
        const d = describeAct(act) as Described;
        lines.push({ text: `${whatAct(d)}, act ${actForm(d.id)}, signed by ${this.nameOf(d.signer ?? d.id, me.id, p)}.` });
        if (d.signer === me.id || me.f.sequence.includes(d.id)) blocking.push('It is this identity’s own act: a witness act names other identities’ acts.');
      } catch (e) {
        blocking.push(`It was not found (${message(e)}): Dub relies only on an act it has read.`);
      }
      return { lines, explanation: WITNESS_EXPLANATION, blocking };
    });
  }

  /** Sign the witness act, once RELY is typed (as Edubba asks), its key checked first (H80). */
  rely(a: { id: string; signer?: string; typed: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (s.acting) throw new Error('A collective relies on nothing from Dub: switch back to the identity itself. Nothing was signed.');
      if (a.typed.trim() !== 'RELY') throw new Error('Type RELY to sign the witness act. Nothing was signed.');
      const id = readActId(a.id);
      if (me.f.sequence.includes(id)) throw new Error('It is this identity’s own act. Nothing was signed.');
      await this.current(me);
      const made = await this.signed(me, () => me.witness([id], { shown: WITNESS_EXPLANATION, relays: s.relays }));
      if (!made.sent.some((x) => x.result)) throw new Error(`No home took the witness act: ${made.sent.map((x) => `${x.home}: ${x.error}`).join('; ')}. It is signed here, not published.`);
      return { lines: [{ text: `You rely on ${shortAct(id)}: witness act ${shortAct(made.id)}, public at this identity’s homes and relays. It keeps that act visible as disputed should its author ever disown it.`, tone: 'ok' }] };
    });
  }

  /** An anchoring service's standing offers (the anchoring cMIP, draft 5), read from its public acts; the person names the service. */
  anchorOffers(a: { service: string }): Promise<{ offers: { act: string; unit: string; tiers: { tier: number; words: string }[]; words: string | null }[] }> {
    return this.serial(async () => {
      const { s, hints } = await this.ctx();
      const service = readIdWhere(a.service);
      const found = await anchorOffers(service.id, [...service.hints, ...hints], s.via);
      return { offers: found.map((o) => ({ act: o.act, unit: o.unit, words: o.words, tiers: o.tiers.map((t, i) => ({ tier: i, words: `within ${t.blocks} block${t.blocks === 1 ? '' : 's'}, ${say({ unit: o.unit, value: t.price }, new Set([o.unit]))}` })) })) };
    });
  }

  /**
   * Anchor an act (decided: beside Rely, on any act; the anchoring cMIP: "anyone
   * may anchor any act"): a payment prepared for Damgar, as Ummia and Edubba
   * prepare one (the money messages cMIP, an anchor draft), sealed to this
   * identity at its homes; its blind kept here. Dub signs no money act.
   */
  anchor(a: { id: string; service: string; offer: string; tier: number }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const service = readIdWhere(a.service);
      const offer = (await anchorOffers(service.id, [...service.hints, ...hints], s.via)).find((o: Offer) => o.act === a.offer);
      if (!offer) throw new Error('That offer was not found at the service’s places. Nothing was prepared.');
      const tier = offer.tiers[a.tier];
      if (!tier) throw new Error('The offer has no such tier. Nothing was prepared.');
      await this.current(me);
      const blind = new Uint8Array(randomBytes(32));
      const leaf = anchoringLeaf(id, blind) as string;
      const r = await sendDraft(me, { what: 'anchor', other: service.id, amount: { unit: offer.unit, value: tier.price }, whatFor: `an anchor of ${shortAct(id)}`, app: 'Dub', anchor: { offer: offer.act, tier: a.tier, leaf } }, { via: s.via, save: () => this.store.saveIdentity(me) });
      const kept = (await this.store.money<Record<string, unknown>[]>(me.id, 'anchors')) ?? [];
      kept.push({ act: id, blind: hex(blind), leaf, service: service.id, offer: offer.act, tier: a.tier, draft: r.id, at: now() });
      await this.store.saveMoney(me.id, 'anchors', kept);
      return {
        lines: [
          { text: `Asked: an anchor of ${shortAct(id)} on the Bitcoin chain, within ${tier.blocks} blocks, for ${say({ unit: offer.unit, value: tier.price }, new Set([offer.unit]))}.`, tone: 'ok' },
          { text: `The payment is prepared, not signed: sealed to you at your homes (${r.left.join(', ')}), it waits in Damgar, in Waiting. The blind that ties the anchor to this act is kept here.` },
        ],
      };
    });
  }

  /**
   * Correct one's own act (the corrections cMIP, draft 2): a new post naming
   * it first, labelled "Correction"; the old one stays as signed. Only this
   * identity's own acts.
   */
  correct(a: { id: string; text: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const { text } = compose(a.text);
      if (!text.trim()) throw new Error('Write the correction. Nothing was signed.');
      let act: Uint8Array;
      try {
        act = (await followRef([id, me.id], hints, s.via)).act;
      } catch (e) {
        throw new Error(`The act to correct was not found: ${message(e)}. Nothing was signed.`);
      }
      if ((describeAct(act) as Described).signer !== me.id) throw new Error('Only this identity’s own acts are corrected here (a reply is the way to answer another’s). Nothing was signed.');
      await this.current(me);
      const made = await this.signed(me, () => post(me, { text, relays: s.relays, corrects: [id, me.id] }));
      return { lines: [{ text: `Correction ${shortAct(made.id)}, naming ${shortAct(id)}, which stays as it was signed: readers show it with “corrected by”.`, tone: 'ok' }] };
    });
  }

  /** A film's bytes, when asked to play it (the video Module, rule 13): checked against its publication before they leave here. */
  film(a: { publication: string; signer?: string }): Promise<{ b64: string; type: string }> {
    return this.serial(async () => {
      const { p, s, hints } = await this.ctx();
      const signer = a.signer ? readId(a.signer) : null;
      const r = await filmBytes(readActId(a.publication), signer, [...hints, ...this.inboxPlaces(p)], s.via);
      return { b64: base64(r.bytes), type: r.film.type };
    });
  }

  // ------------------------------------------------------------ collectives under the identity (acting as one: the same gesture as switching)

  /**
   * Add a collective this identity can act as from here, by its ID: its
   * member key (F353) read from this identity's homes, and the area of its
   * agreement in force that reaches public posts. Added even where it cannot
   * act yet, saying why.
   */
  collectiveAdd(a: { id: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const { id, hints: where } = readIdWhere(a.id);
      if (id === me.id) throw new Error('That is this identity itself.');
      const r = await this.memberKeyHere(me, s, id, [...where, ...hints]);
      const rest = (s.collectives ?? []).filter((c) => c.id !== id);
      await this.store.saveSettings(me.id, { ...s, collectives: [...rest, { id, available: !r.why, why: r.why }] });
      await this.warm([id], [...where, ...hints], s.via);
      return { lines: [r.why ? { text: `Added, not usable yet: ${r.why}`, tone: 'warn' } : { text: `${this.names.get(id)?.names[0] ?? fingerprint(id)} is under this identity: choose it in the identity panel to act as it.`, tone: 'ok' }] };
    });
  }

  /** Forget a collective here (nothing is published); acting as it stops. */
  collectiveRemove(a: { id: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.saveSettings(me.id, { ...s, collectives: (s.collectives ?? []).filter((c) => c.id !== a.id), acting: s.acting === a.id ? null : (s.acting ?? null) });
      return { lines: [{ text: 'Removed from this app. Nothing is published; the collective and your membership are untouched.' }] };
    });
  }

  /** Act as a collective under this identity, or (null) as the identity itself. */
  actAs(a: { id: string | null }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (a.id) {
        const c = (s.collectives ?? []).find((x) => x.id === a.id);
        if (!c) throw new Error('That collective is not under this identity here.');
        if (!c.available) throw new Error(`Dub cannot act as it: ${c.why ?? 'its member key is not here'}`);
      }
      await this.store.saveSettings(me.id, { ...s, acting: a.id });
      return { lines: [] };
    });
  }

  /** The member key this identity holds for a collective, and the area reaching public posts; `why` where it cannot act. */
  private async memberKeyHere(me: TestIdentity, s: Settings, collective: string, hints: string[]): Promise<{ key: MemberKey | null; places: string[]; why: string | null; number: number }> {
    const places = [...new Set([...(await collectivePlaces(collective, hints, s.via).catch(() => [] as string[])), ...hints])];
    const keys = await readMemberKeys(me.id, me.f.encryption.map((e) => unhex(e.secret)), me.f.homes.map((h) => h.hint), s.via).catch(() => [] as MemberKey[]);
    const key = keys.length ? await memberKeyFor(keys, collective, places, s.via).catch(() => null) : null;
    if (!key) return { key: null, places, why: 'no member key of this identity for it was found at its homes (one is made when you sign its founding, in Edubba).', number: 0 };
    const reach = await areaReaching(collective, places, { spec: POST_SPECS.text, type: TEXT_ACT }, s.via).catch(() => ({ agreement: null, area: null }));
    if (!reach.area) return { key, places, why: 'its agreement in force gives no area reaching public posts.', number: 0 };
    if (!reach.area.holders.includes(me.id)) return { key, places, why: `this identity holds no box in its area “${reach.area.name}”, which reaches public posts.`, number: 0 };
    return { key, places, why: null, number: reach.area.number };
  }

  // ------------------------------------------------------------ Purchases (decided, 21 October 2026)

  /** Files bought and vows purchased here, each as it stands: a file opened once its key arrived, a vow with its sale. */
  purchases(): Promise<{ items: Purchase[]; problems: string[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const places = [...new Set([...hints, ...this.inboxPlaces(p), ...s.relays])];
      const bought = (await this.store.money<Record<string, { seller: string }>>(me.id, 'bought')) ?? {};
      const problems: string[] = [];
      const items: Purchase[] = [];
      await this.warm(Object.values(bought).map((b) => b.seller), places, s.via);
      for (const [publication, b] of Object.entries(bought)) {
        const x = await this.money.read(me, places, s.via, [{ id: publication, signer: b.seller }]).catch((e) => (problems.push(message(e)), null));
        items.push({
          kind: 'file',
          id: publication,
          form: actForm(publication),
          seller: this.whoFrom(b.seller, me.id, p),
          what: x?.media === 'picture' ? 'picture' : 'text',
          price: x?.price ?? null,
          state: x?.state === 'opened' ? 'opened: its key came with the receipt' : x?.state === 'paying' ? 'bought: pay it in your wallet; its key comes with the receipt' : (x?.problem ?? 'bought'),
          text: x?.state === 'opened' ? x.text : null,
          picture: x?.state === 'opened' ? x.picture : null,
        });
      }
      const vows = await this.money.vowsBought(me, places, s.via).catch((e) => (problems.push(message(e)), []));
      await this.warm(vows.map((v) => v.seller), places, s.via);
      for (const v of vows) {
        items.push({
          kind: 'vow',
          id: v.vow,
          form: actForm(v.vow),
          seller: this.whoFrom(v.seller, me.id, p),
          what: 'vow',
          price: v.price,
          state: !v.paid ? 'not paid yet' : v.sale === 'confirmed' ? 'confirmed: it was kept' : v.sale === 'contested' ? `contested${v.promise ? `: “${v.promise}”` : ''}` : 'not yet confirmed: confirm or contest it in its menu',
          text: v.words,
          picture: null,
          sale: v.sale,
          paid: v.paid,
        });
      }
      return { items, problems };
    });
  }

  // ------------------------------------------------------------ paying from Dub, three ways (decided, 21 October 2026)

  /**
   * The ways open for one payment (decided: "Dub has no money signing by
   * default, everything has to be done in Damgar… now we're looking at
   * using more to do something closer to a prototype"): under Dub's lane,
   * with what is left of it; Ask Damgar, a money message it queues; by
   * hand, the draft shown to copy for Damgar. A purchase names its offer,
   * which a money message cannot carry yet: only the lane buys.
   */
  payWays(a: { kind: 'tip' | 'buy' | 'vow' | 'pay' }): Promise<PayWays> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const lanes = await this.money.lanes(me, s, hints).catch(() => []);
      const lane = lanes.find((l) => l.state === 'in force');
      const purchase = a.kind === 'buy' || a.kind === 'vow';
      const noDraft = 'A purchase names the seller’s offer, which a money message to Damgar cannot carry yet: buy it under Dub’s lane.';
      let spent: string | null = null;
      if (lane?.grant) {
        const book = (await this.store.money<{ payments?: Record<string, { side: string; amount: { unit: string; value: number }; how?: { by: string; grant?: string }; stage: string }> }>(me.id, 'book')) ?? {};
        const by = new Map<string, number>();
        for (const x of Object.values(book.payments ?? {})) if (x.side === 'out' && x.how?.by === 'lane' && x.how.grant === lane.grant && x.stage !== 'refused' && x.stage !== 'declined') by.set(x.amount.unit, (by.get(x.amount.unit) ?? 0) + x.amount.value);
        spent = by.size ? [...by].map(([unit, value]) => say({ unit, value }, new Set([unit]))).join(', ') : 'nothing yet';
      }
      return {
        lane: lane
          ? { open: true, why: null, label: lane.label, perPayment: lane.cap, until: lane.until, spent }
          : { open: false, why: lanes.some((l) => l.state === 'asked') ? 'Dub’s lane is asked, not yet granted in Damgar.' : 'Dub has no lane from Damgar: ask for one in the identity’s menu (A lane from Damgar).', label: null, perPayment: null, until: null, spent: null },
        damgar: purchase ? { open: false, why: noDraft } : { open: true, why: null },
        hand: purchase ? { open: false, why: noDraft } : { open: true, why: null },
      };
    });
  }

  /**
   * Pay, the way chosen: under Dub's lane (Dub signs with the lane's key,
   * refused past its cap or expiry); Ask Damgar (a money message sealed to
   * this identity, which Damgar queues); or by hand (the same draft, shown
   * to copy, signed and sent by nothing here). Tip a post, pay an identity
   * (from its profile), buy a file or a vow.
   */
  pay(a: { how: 'lane' | 'damgar' | 'hand'; kind: 'tip' | 'buy' | 'vow' | 'pay'; signer: string; post?: string; publication?: string; vow?: string; repost?: string; reposter?: string; value?: string; unit?: string; whatFor?: string }): Promise<{ lines: Line[]; hand?: { text: string; said: string[] } }> {
    if (a.kind === 'buy' && a.how === 'lane') return this.buy({ publication: a.publication ?? '', seller: a.signer, post: a.post, repost: a.repost, reposter: a.reposter });
    if (a.kind === 'vow' && a.how === 'lane') return this.buyVow({ vow: a.vow ?? '', seller: a.signer, post: a.post ?? '' });
    if (a.kind === 'buy' || a.kind === 'vow') return Promise.reject(new Error('A purchase is made under Dub’s lane: a money message to Damgar cannot carry its offer yet. Nothing was signed.'));
    if (a.how === 'lane' && a.kind === 'tip') return this.tipNow({ post: a.post ?? '', signer: a.signer, value: a.value ?? '', unit: a.unit ?? '', whatFor: a.whatFor });
    if (a.how === 'lane') return this.payNow({ signer: a.signer, value: a.value ?? '', unit: a.unit ?? '', whatFor: a.whatFor ?? '' });
    if (a.how === 'damgar') return this.moneyDraft({ what: 'pay', other: a.signer, post: a.post, value: a.value ?? '', unit: a.unit ?? '', whatFor: a.whatFor });
    return this.byHand({ signer: a.signer, value: a.value ?? '', unit: a.unit ?? '', whatFor: a.whatFor ?? '' });
  }

  /** Pay an identity now, under the lane (from its profile): the invoice request signed with the lane's key. */
  private payNow(a: { signer: string; value: string; unit: string; whatFor: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const payee = readId(a.signer);
      if (payee === me.id) throw new Error('That is this identity itself. Nothing was signed.');
      const whatFor = a.whatFor.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : null;
      const r = await this.money.engine.payUnderLane({ payee, amount: { unit: a.unit, value: readValue(a.value) }, whatFor });
      return { lines: r.lines.map((l) => ({ text: l.text, tone: 'ok' as const })) };
    });
  }

  /**
   * The third way, by hand: the payment as a draft of the money messages
   * cMIP (section 2.1), written out to copy into Damgar. Nothing is signed or
   * sent from here. Damgar's "paste an act to sign" is its own round's.
   */
  private byHand(a: { signer: string; value: string; unit: string; whatFor: string }): Promise<{ lines: Line[]; hand: { text: string; said: string[] } }> {
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      const other = readId(a.signer);
      if (other === me.id) throw new Error('That is this identity itself. Nothing was prepared.');
      if (!UNITS_MODULES.some((m) => m.units.some((u) => u.hash === a.unit))) throw new Error('Choose a unit. Nothing was prepared.');
      const amount = { unit: a.unit, value: readValue(a.value) };
      const d: Draft = { what: 'pay', other, amount, whatFor: a.whatFor.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : null, app: 'Dub', anchor: null };
      return {
        lines: [{ text: 'Shown, not signed and not sent: copy it into Damgar, which reads it to you and signs it there.' }],
        hand: {
          text: base64(draftPayload(d)),
          said: [`To ${this.nameOf(other, me.id, p)} (${idForm(other)})`, `Amount: ${say(amount, new Set([amount.unit]))}`, ...(d.whatFor ? [`What for: ${d.whatFor}`] : []), 'From: this identity, paid in your own wallet'],
        },
      };
    });
  }

  // ------------------------------------------------------------ money, prepared here and signed in Damgar (F338)

  /**
   * A tip on a post, or a request to be paid, prepared here and never
   * signed here as money (F338: "the other apps need to be able to offer to
   * create the acts without signing them"): a draft of the money messages
   * cMIP, a private act sealed to this identity itself and left at its
   * homes, where Damgar, holding the same identity, picks it up, reads it in
   * plain words, and signs or declines it. Dub signs only the draft.
   */
  moneyDraft(a: { what: 'pay' | 'ask'; other: string; value: string; unit: string; whatFor?: string; post?: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      let other: string;
      try {
        other = readId(a.other);
      } catch (e) {
        throw new Error(`${a.what === 'pay' ? 'Whom to tip' : 'Whom to ask'}: ${message(e)}. Nothing was prepared.`);
      }
      if (other === me.id) throw new Error('That is this identity itself. Nothing was prepared.');
      if (!UNITS_MODULES.some((m) => m.units.some((u) => u.hash === a.unit))) throw new Error('Choose a unit. Nothing was prepared.');
      const value = readValue(a.value);
      const whatFor = a.whatFor?.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : null;
      let refs: [string, string][] | undefined;
      if (a.post) {
        const d = describeAct((await followRef([readId(a.post), other], [...hints, ...this.inboxPlaces(await this.store.people(me.id))], s.via)).act) as Described;
        if (d.signer !== other) throw new Error('The post tipped is not signed by the identity tipped. Nothing was prepared.');
        refs = [[d.id, other]];
      }
      await this.current(me);
      const r = await sendDraft(me, { what: a.what, other, amount: { unit: a.unit, value }, whatFor, app: 'Dub', anchor: null }, { refs, via: s.via, save: () => this.store.saveIdentity(me) });
      return {
        lines: [
          { text: `Prepared, not signed: ${a.what === 'pay' ? 'a tip' : 'a request to be paid'}, sealed to this identity and left at its homes (${r.left.join(', ')}).`, tone: 'ok' },
          { text: 'Open Damgar with this identity: the draft waits there, in To sign, to be read and signed or declined. Dub signs no money act.' },
        ],
      };
    });
  }

  // ------------------------------------------------------------ where it lives (H39)

  /** Said where relays are changed: homes are the chain key's (H39). */
  static readonly HOMES_SAY = 'Its homes are named in its identity chain and change only with the chain key: in Kišib, “Change an identity’s keys”, from the chain key’s paper.';

  /**
   * Read back new relays for this identity (H39): a new routes act
   * (Identity type 3), its outbox and inbox the relays given. Only for an
   * identity Dub made and whose routes Dub wrote (reading 5: a second writer
   * would fork its routes). Nothing is signed until `relaysPublish` with the
   * same digest.
   */
  async relaysReview(relays: string[]): Promise<{ digest: string; lines: Line[] }> {
    const { me, s } = await this.ctx();
    const r = list(relays);
    if (!r.length) throw new Error('Give at least one relay.');
    for (const x of r) if (!/^https?:\/\//.test(x)) throw new Error(`“${x}”: an address starts with https:// (or http://)`);
    if (s.kind !== 'made' || !me.f.routes) throw new Error('This identity was brought here, or its routes were written by another app: Dub publishes no routes for it (Dub’s reading 5: a second writer would fork them). Change them in the app that made it.');
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    if (look.routes.act !== me.f.routes.act) throw new Error('Its routes in force are not the version Dub wrote: another app changed them. Nothing to sign here.');
    const lines: Line[] = [
      { text: `Its acts will be found at ${r.join(', ')} (its outbox), and others will leave what is for it there (its inbox).` },
      { text: `A new routes act, version ${me.f.routes.version + 1}, public, replacing version ${me.f.routes.version} (now: ${list(look.routes.routes.flatMap((x) => x.hints)).join(', ') || 'none'}). Its identity chain and its acts stay as they are.` },
      { text: 'Those who follow it find its new relays through its homes; a where-it-lives form copied before still names the old ones (hints guide, never decide).' },
      { text: Dub.HOMES_SAY },
    ];
    return { digest: await digestOf(JSON.stringify({ me: me.id, r, act: me.f.routes.act })), lines };
  }

  relaysPublish(relays: string[], digest: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const r = list(relays);
      if (!me.f.routes || (await digestOf(JSON.stringify({ me: me.id, r, act: me.f.routes.act }))) !== digest) throw new Error('This is not what was read back: read it back again.');
      await this.current(me);
      // Read back first: the routes in force are still the version Dub wrote.
      const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
      if (look.routes.act !== me.f.routes.act) throw new Error('Its routes changed meanwhile, from another app. Nothing was signed.');
      const made = await this.signed(me, () => me.publishRoutes([
        { scope: null, hints: r, kind: 0 },
        { scope: null, hints: r, kind: 1 },
      ]));
      await this.store.saveSettings(me.id, { ...s, relays: r });
      for (const x of r) {
        for (const act of me.chainActs()) {
          try {
            await relayAt(x, s.via).putAct(act);
          } catch {
            // that relay's policy
          }
        }
      }
      return { lines: [{ text: `New routes published (act ${made.id.slice(0, 12)}…): its relays are now ${r.join(', ')}.`, tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ money under a lane, round 2 (F338, F351)

  /** Ask Damgar for a lane (sealed to oneself); nothing is paid until it is granted there. */
  laneAsk(a: { label: string; cap: string; unit: string; until: number | null; clock: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      if (!UNITS_MODULES.some((m) => m.units.some((u) => u.hash === a.unit))) throw new Error('Choose a unit. Nothing was asked.');
      const lines = await this.money.askLane(me, s, { label: a.label, cap: readValue(a.cap), unit: a.unit, until: a.until, clock: a.clock.trim().toLowerCase() || null, app: this.money.engine.opts.app! });
      return { lines: lines.map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** The lanes asked here, and where each stands. */
  lanes(): Promise<{ lanes: LaneShownHere[]; say: string[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      return { lanes: await this.money.lanes(me, s, hints), say: LANE_SAY };
    });
  }

  /** A tip on a post, paid now under the lane (refused, saying why, past its cap or expiry). */
  tipNow(a: { post: string; signer: string; value: string; unit: string; whatFor?: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const signer = readId(a.signer);
      if (signer === me.id) throw new Error('That is this identity itself. Nothing was signed.');
      const whatFor = a.whatFor?.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : 'a tip';
      const lines = await this.money.tip({ post: readId(a.post), signer, amount: { unit: a.unit, value: readValue(a.value) }, whatFor });
      return { lines: lines.map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** Payments signed here under the lane: to pay in the wallet, or done. */
  payments(): Promise<{ payments: PaymentShown[]; done: PaymentShown[]; problems: string[] }> {
    return this.serial(async () => {
      await this.ctx();
      return this.money.payments();
    });
  }

  /** The proof from the wallet: checked, and the claim signed under the lane. */
  paidNow(key: string, proof: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      await this.ctx();
      return { lines: (await this.money.paid(key, proof)).map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** A post sealed with a price (pay-per-view), its offer, its key kept here for each buyer. */
  sell(a: { text: string; teaser?: string; value: string; unit: string; referral?: string }): Promise<{ post: string; lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      const text = compose(a.text.trim()).text;
      if (!text) throw new Error('Write the sealed text. Nothing was posted.');
      const teaser = compose((a.teaser ?? '').trim() || 'A sealed post.').text;
      const referral = a.referral?.trim() ? Number(a.referral) : null;
      const r = await this.money.sell(me, s, { text, teaser, price: { unit: a.unit, value: readValue(a.value) }, referral });
      return { post: r.post, lines: r.lines.map((t) => ({ text: t, tone: 'ok' as const })) };
    });
  }

  /** Buy a sealed post under the lane, naming the repost it was found through, if any. */
  buy(a: { publication: string; seller: string; post?: string; repost?: string; reposter?: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const repost = a.repost && a.reposter ? { id: readId(a.repost), by: readId(a.reposter) } : null;
      const lines = await this.money.buy(me, [...hints, ...this.inboxPlaces(p)], s.via, { publication: readId(a.publication), seller: readId(a.seller), repost, post: a.post ? readId(a.post) : null });
      return { lines: lines.map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** Buy a vow under the lane (round 3): its claim, once paid, is published too, the sale anyone can read. */
  buyVow(a: { vow: string; seller: string; post: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const lines = await this.money.buyVow(me, [...hints, ...this.inboxPlaces(p)], s.via, { vow: readId(a.vow), seller: readId(a.seller), post: readId(a.post) });
      return { lines: lines.map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** The vows bought here, each sale as the relays read it (round 3; the Signing tab). */
  vowsBought(): Promise<{ vows: Awaited<ReturnType<DubMoney['vowsBought']>> }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      return { vows: await this.money.vowsBought(me, [...hints, ...this.inboxPlaces(p), ...s.relays], s.via) };
    });
  }

  /** Confirm a vow bought: its sale reads confirmed (rule 13). */
  confirmVow(vow: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      return { lines: (await this.money.confirmVow(me, readId(vow))).map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** Contest a vow bought: its sale reads contested, the promise not kept in words if given (F253). */
  contestVow(vow: string, promise: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      // H80: a contest is signed with the identity's own key: checked first.
      await this.current(me);
      return { lines: (await this.money.contestVow(me, s, readId(vow), promise.trim() || null)).map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** Repost a sealed post at this identity's relays, holding what it names there too. */
  repost(a: { post: string; signer: string }): Promise<{ id: string; lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      await this.current(me);
      const r = await this.money.repost(me, s, [...hints, ...this.inboxPlaces(p)], { post: readId(a.post), signer: readId(a.signer) });
      return { id: r.id, lines: r.lines.map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** Keys to deliver for sales the seller's Damgar told of; keys arrived for posts bought. */
  moneyLook(): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      const inbox = await this.inboxOf(me.id, [...new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])], s.via).catch(() => this.inboxPlaces(p));
      const lines = [...(await this.money.deliver(me, s, () => this.current(me))), ...(await this.money.keysArrived(me, s, inbox))];
      return { lines: lines.map((text) => ({ text, tone: 'ok' as const })) };
    });
  }

  /** When the sealed list was last read, by identity (this app's memory only). */
  private synced = new Map<string, number>();

  /**
   * The follow list sealed to the identity itself (the people cMIP, draft 2,
   * section 3): read from its homes; this app's list replaced by it, or, the
   * first time, this app's own list carried over into it (3.7); `change`
   * applied to it; and, where it changed, the next version signed, sealed to
   * the identity's own encryption key and left at its homes. Inside `serial`.
   * Where this app holds no encryption key of the identity, the list stays
   * in this app, said.
   */
  private async syncFollows(me: TestIdentity, s: Settings, p: People, change?: (p: People) => void): Promise<Line[]> {
    const homes = me.f.homes.map((h) => h.hint);
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const save = async () => {
      this.synced.set(me.id, now());
      await this.store.savePeople(me.id, p);
    };
    if (!secrets.length) {
      change?.(p);
      await save();
      return [{ text: 'This app holds no encryption key of this identity, so its follow list cannot be sealed to it: the list stays in this app only.', tone: 'warn' }];
    }
    const found = await readSealedList(me.id, secrets, homes, s.via);
    const ours = p.sealed?.version ?? 0;
    const lines: Line[] = [];
    let base: Followed[] = p.follows;
    if (found.act && found.version >= ours) {
      base = found.follows.map((f) => ({ ...f }));
      // Carried over once (3.7): what this app held that the sealed list lacks is added, with its names; nothing is removed.
      if (!p.carried) for (const f of p.follows) if (!base.some((x) => x.id === f.id)) base.push({ ...f });
      p.sealed = { version: found.version, act: found.act, forked: found.forked };
    }
    if (found.forked) lines.push({ text: 'The follow list kept at this identity’s homes was forked: two apps changed it at once. The longer branch is shown; follow again anyone missing.', tone: 'warn' });
    const before = JSON.stringify(found.act ? found.follows : null);
    p.follows = base;
    change?.(p);
    const homesSilent = !found.act && found.problems.length >= homes.length;
    const needed = JSON.stringify(p.follows) !== before && !(found.act === null && !p.follows.length && !p.sealed);
    if (!needed || homesSilent) {
      if (homesSilent && needed) lines.push({ text: `The follow list was not sealed to the homes, which did not answer (${found.problems.join('; ')}): it is kept here and sealed at the next change.`, tone: 'warn' });
      if (found.act || !p.follows.length) p.carried = true;
      await save();
      return lines;
    }
    await this.current(me);
    const look = await lookUp(me.id, homes, s.via);
    const held = me.f.encryption.find((e) => look.encryptionKey && hex(xwingPublic(unhex(e.secret))) === hex(look.encryptionKey));
    if (!held || !look.encryptionKey) {
      await save();
      return [...lines, { text: 'The encryption key this identity publishes is not one this app holds: the follow list stays in this app, not sealed.', tone: 'warn' }];
    }
    const version = Math.max(found.version, ours) + 1;
    const previous = found.act && found.version >= ours ? found.act : (p.sealed?.act ?? null);
    const made = await this.signed(me, async () => me.sign(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version, previous, follows: p.follows }), { public: false, to: [me.id] }));
    const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
    let left = 0;
    for (const h of homes) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
        await relayAt(h, s.via).putAct(made.act);
      } catch {
        // that home is away: the others hold it
      }
    }
    p.sealed = { version, act: made.id };
    p.carried = true;
    await save();
    lines.push(
      left
        ? { text: `The follow list, with the names you gave, is sealed to this identity and kept at its homes (version ${version}): any app holding this identity reads it; nobody else can.`, tone: 'ok' }
        : { text: 'No home took the sealed follow list: it is kept here, and sealed again at the next change.', tone: 'warn' },
    );
    return lines;
  }

  /** Read the sealed follow list again, outside a change (for the feed): at most once a minute, or now when `fresh` (Look again). */
  private async refreshFollows(fresh: boolean): Promise<{ notes: string[]; changed: boolean }> {
    const active = await this.store.active();
    if (!active || (!fresh && (this.synced.get(active) ?? 0) + 60 > now())) return { notes: [], changed: false };
    try {
      return await this.serial(async () => {
        const { me, s, p } = await this.ctx();
        const was = JSON.stringify(p.follows);
        const notes = (await this.syncFollows(me, s, p)).filter((l) => l.tone === 'warn' || l.tone === 'ok').map((l) => l.text);
        return { notes, changed: JSON.stringify(p.follows) !== was };
      });
    } catch (e) {
      return { notes: [`The follow list kept at this identity’s homes could not be read: ${message(e)}`], changed: false };
    }
  }

  /** Follow an identity, by its ID or the signer of an act shown; a name for it, if given, stays in this app. */
  follow(a: { id: string; name?: string }) {
    // H38: an ID, its where-it-lives form, or an ID with a home address beside it.
    const { id, hints } = readIdWhere(a.id);
    const name = a.name?.trim() ? a.name.trim().slice(0, 64) : null;
    return this.people((p, me) => {
      if (id === me.id) throw new Error('That is this identity itself: its own posts are always in its feed.');
      if (hints.length) (p.where ??= {})[id] = [...new Set([...(p.where?.[id] ?? []), ...hints])];
      const f = p.follows.find((x) => x.id === id);
      if (f) f.name = name ?? f.name;
      else p.follows.push({ id, name });
    });
  }

  unfollow(id: string) {
    return this.people((p) => {
      p.follows = p.follows.filter((x) => x.id !== id);
    });
  }

  /** Your own name for an identity you follow: in this app only, never published. */
  callIt(a: { id: string; name: string }) {
    return this.people((p) => {
      const f = p.follows.find((x) => x.id === a.id);
      if (!f) throw new Error('Follow it first.');
      f.name = a.name.trim() ? a.name.trim().slice(0, 64) : null;
    });
  }

  /** Mute an identity: nothing of it is shown here. Never published, never told. */
  async mute(id: string) {
    const x = readId(id);
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      if (x === me.id) throw new Error('That is this identity itself.');
      if (!p.muted.includes(x)) p.muted.push(x);
      await this.store.savePeople(me.id, p);
      return { lines: [] as Line[] };
    });
  }

  async unmute(id: string) {
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      p.muted = p.muted.filter((m) => m !== id);
      await this.store.savePeople(me.id, p);
      return { lines: [] as Line[] };
    });
  }

  /**
   * The follow list's option (the people cMIP, 1.3): private (the default)
   * or published. Published is chosen only with the warning shown, word for
   * word (3.5); back to private publishes one last, empty, withdrawn version
   * (3.4).
   */
  listOption(a: { published: boolean; shown?: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      if (a.published === (p.list === 'published')) return { lines: [] };
      if (a.published && a.shown !== PUBLISH_WARNING) throw new Error('The follow list is published only once its warning was shown. Nothing was signed.');
      const lines = await this.publishList(me, s, p, !a.published);
      p.list = a.published ? 'published' : 'private';
      await this.store.savePeople(me.id, p);
      return { lines };
    });
  }

  private async publishList(me: TestIdentity, s: Settings, p: People, withdrawn: boolean): Promise<Line[]> {
    await this.current(me);
    // The chain goes on from the latest version found (section 3.3), this app's or another's.
    let last = p.published;
    try {
      const found = await readFollowList(me.id, s.relays, s.via);
      if (found.act && found.version >= (last?.version ?? 0)) last = { version: found.version, act: found.act };
    } catch {
      // not found: this app's own record is the latest it knows
    }
    const version = (last?.version ?? 0) + 1;
    const payload = followListPayload({ version, previous: last?.act ?? null, ids: p.follows.map((f) => f.id), withdrawn });
    const made = await this.signed(me, async () => me.publish(PEOPLE_SPEC, FOLLOW_LIST, payload, { public: true, relays: s.relays }));
    p.published = { version, act: made.id };
    await this.store.savePeople(me.id, p);
    return [
      withdrawn
        ? { text: `The follow list is private again: a last, empty version (${version}) says so. What was published stays published.`, tone: 'warn' }
        : { text: `The follow list is published (version ${version}): ${p.follows.length} identit${p.follows.length === 1 ? 'y' : 'ies'}, by ID only. The names you gave them stay here.`, tone: 'ok' },
    ];
  }

  // ------------------------------------------------------------ pictures

  /** Withdraw a picture this identity published (Envelopes, "Withdrawal"): readers stop showing it; the post stands. */
  withdraw(publication: string): Promise<{ id: string }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (!/^[0-9a-f]{64}$/.test(publication)) throw new Error('not a publication id');
      let act: Uint8Array | null = null;
      for (const r of s.relays) {
        try {
          act = await relayAt(r, s.via).getAct(publication);
          if (act) break;
        } catch {
          // the next
        }
      }
      if (!act) throw new Error('That picture was not found at the relays.');
      if ((describeAct(act) as Described).signer !== me.id) throw new Error('That picture was published by another identity: only its signer can withdraw it.');
      await this.current(me);
      return this.signed(me, () => withdraw(me, publication, s.relays));
    });
  }
}

/** The Relay lens's layers (H55): text and envelope acts by default; the others behind the filter. */
export const RELAY_LAYERS = ['text', 'envelopes', 'identity', 'agreements', 'money', 'development', 'other'] as const;
export const RELAY_DEFAULT = ['text', 'envelopes'];

/** The layer an act belongs to, for the Relay lens's filter. */
function layerOf(d: Described): string {
  if (d.spec === POST_SPECS.text) return 'text';
  if (d.spec === SPECS.envelopes) return 'envelopes';
  if (d.spec === SPECS.identity) return 'identity';
  if (d.spec === MIRS.agreements) return 'agreements';
  if (d.spec === MIRS.money) return 'money';
  if (d.spec === MIRS.development) return 'development';
  return 'other';
}

/** What a public act is, in a few words, for the relay view (H29). */
function whatAct(d: Described): string {
  if (d.spec === SPECS.identity) {
    if (d.type === IDENTITY_TYPES.genesis) return 'A new identity (its genesis)';
    if (d.type === IDENTITY_TYPES.rotation) return 'A change of keys (a rotation)';
    if (d.type === IDENTITY_TYPES.routes) return 'Where its acts and inbox are (its routes)';
    if (d.type === IDENTITY_TYPES.witness) return 'A witness act: it relies on another act';
    if (d.type === NAME) return 'A display name';
    if (d.type === NAME_WITHDRAWAL) return 'A display name withdrawn';
    return 'An Identity act';
  }
  if (d.spec === SPECS.envelopes) {
    if (d.type === PUBLICATION) return 'A publication (a picture or a file)';
    if (d.type === WITHDRAWAL) return 'A publication withdrawn';
    if (d.type === 4) return 'Its encryption key';
    return 'An Envelopes act';
  }
  if (d.spec === POST_SPECS.text) return 'A text act';
  if (d.spec === MIRS.agreements) return 'An Agreements act (an agreement, a signature, or talk about one)';
  if (d.spec === MIRS.money) return 'A Money act';
  if (d.spec === MIRS.development) return 'A Development act';
  if (d.spec === PEOPLE_SPEC || d.spec === PEOPLE_SPEC_1) return d.type === FOLLOW_LIST ? 'A published follow list' : 'A people act';
  return 'An act of another specification';
}

/** An act's ID written for people, short (`mact1r8d…4kq`): said in lines; the whole form is on its card. */
function shortAct(id: string): string {
  const f = shownAct(id);
  return f.length > 16 ? `${f.slice(0, 8)}…${f.slice(-3)}` : f;
}

/** An address's host, as said to a person. */
function hostOf(hint: string): string {
  try {
    return new URL(hint).host;
  } catch {
    return hint;
  }
}

/** A time, in words, UTC (the display client's words). */
export function timeWords(t: number): string {
  const d = new Date(t * 1000);
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

/** A document's title: its first line, without the heading's marks. */
function titleOf(text: string): string {
  const first = text.split('\n').find((l) => l.trim()) ?? '';
  return first.replace(/^#+\s*/, '').trim().slice(0, 120) || 'A document';
}

/** The start of a post, on one line. */
function snippet(text: string): string {
  const one = text.replace(/\s+/g, ' ').trim();
  return one.length > 80 ? `${one.slice(0, 79)}…` : one;
}

export { NO_PEOPLE, PUBLISH_WARNING };

async function digestOf(x: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(x));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
