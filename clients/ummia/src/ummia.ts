// What Ummia does (F339, 17 October 2026): the Development layer's app. It
// holds the developer's identity and acts in the Development layer only;
// whatever goes to another layer travels through MOR as acts, sealed to
// oneself where private (the working rule of 17 October 2026: the layers
// apart, talking through MOR).
//
// - An identity is brought by its ID and its signing key's words, as in
//   Dub, Damgar and Kišib (the identity carry Module, draft 2). Ummia never
//   makes one, and never holds a chain key. Who acts is chosen with the
//   shared chooser (`acting.ts`): oneself in round 1; collectives in round 2
//   (decided by Nobody, allegedly).
// - Releases of code under one's own name (moved from Edubba; `releases.ts`,
//   on a computer), with Bitcoin anchoring as an option: the payment
//   prepared here as a draft sealed to oneself, paid in Damgar (`anchor.ts`).
// - Releasing cMIPs and Modules: a specification published as its act, its
//   hash shown (`spec.ts`).
// - Tracking: which cMIPs, Modules, extensions and xtypes exist, by asking
//   the public relays the person names, with the filters relays already
//   have (`track.ts`).
// - A path to drafting MIPs: drafts as signed long-form documents, then,
//   once ready, the MIP as a specification (`mips.ts`).
// - Bug reports, sent from one's own identity, and their answers
//   (`reports.ts`).
// - The accepted list, shown whole and changed (the accepted cMIP, F340):
//   one list per identity, sealed at its homes, which every app reads.
//
// The same code runs in Ummia's program (a folder, `store.ts`) and its web
// client (the browser, `web/keep.ts`). A `Keep` says where.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { SPECS, WITNESS_EXPLANATION, base64, describeAct, hex, readTerms, sha256, signingPublic, unhex } from '../../genesis/src/core.ts';
import { lineReader, noLine, sendWaiting, type LineAtHomes } from '../../genesis/src/private.ts';
import { TestIdentity, TEST_LABEL, freshLines, type IdentityFile } from '../../genesis/src/identity.ts';
import { lookUp, referTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { negotiate } from '../../repo/src/proposals.ts';
import { areaReaching, chainFor, judgeCollective, publishAt, signAsMember } from '../../grants/src/member.ts';
import { Refused, fromWords, groupId, toWords } from '../../../modules/carry/src/carry.ts';
import { fromCarried, groupKeyString, toKeyString } from '../../../modules/carry/src/string.ts';
import { actForm, readId } from '../../genesis/src/forms.ts';
import { carriedKey, lookCurrent, servedChain } from '../../dub/src/carryin.ts';
import { changeAccepted, publishAccepted, readAccepted } from '../../damgar/src/accepted.ts';
import { OURS as DAMGAR_PART, labelOf as damgarLabel } from '../../damgar/src/specs.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import type { RunnerLink } from '../../dub/src/runner.ts';
import { clockWords } from '../../barebone/src/clock.ts';
import { idForm, idWhere } from '../../genesis/src/forms.ts';
import { CARD_SAY, LIMITS, builtIn, cardText, readCardText, publishCard, publishDiscussion, readActId, type CardFields } from './cards.ts';
import { FOLLOW_SAY } from './follows.ts';
import { FILTERS, look as lookAt, specPage, type Filter, type Looked, type PointKind, type SpecPage } from './look.ts';
import { textPayload as longformPayload } from '../../longform/src/act.ts';
import { leaveInInbox } from '../../barebone/src/post.ts';
import { LONGFORM_SPECS, TEXT_ACT as LONGFORM_TEXT_ACT } from '../../longform/src/specs.ts';
import { actors, chosen } from './acting.ts';
import { ANCHOR_SAY, ask as askAnchor, offers as anchorOffers, standing as anchorStanding, type Asked, type AnchorShown, type Offer } from './anchor.ts';
import { FORKABLE, MIP_SAY, publishDraft, replies as mipReplies, shapeOf, template, type MipDraft, type Reply } from './mips.ts';
import { REPORT_SAY, answers as reportAnswers, send as sendReport, type Answer, type Sent } from './reports.ts';
import type { OwnRelease, Releases } from './releases.ts';
import { KINDS, TASKS, prepareSpec, publishSpec, readHash, type SpecForm } from './spec.ts';
import { LIMIT_SAY, actsOf, track, type Tracked } from './track.ts';
import type { AcceptedEntry, Done, Line, Review, State } from './shapes.ts';
import { approveRules, readRules, rulesOf, type RulesShown } from '../../kit/src/engine/rules.ts';
import { Known, type KnownContacts } from '../../kit/src/engine/known.ts';
import { heldSecrets } from '../../kit/src/engine/people.ts';
import type { Named } from '../../kit/src/html.ts';

/** The rules Ummia runs (H93): long-form drafts and discussions, releases, and names. */
export const UMMIA_RULES = rulesOf('long-form', 'release-manifest', 'naming');

export type { State } from './shapes.ts';

export const TEST_ONLY = 'Test identities only, until MOR is frozen.';

/** Said where the identity is brought in (the carry Module; Identity rule 35). */
export const LINE_SAY =
  'Ummia keeps its own line of acts for this identity (its specifications, releases, drafts, reports, and the sealed acts it sends to itself). If the signing key is ever changed with the chain key, in Kišib, that change must keep this line, or every act signed here becomes void. Some of its acts are sealed, so give Kišib this line’s card, shown in the identity window.';

/** Said when a rotation made elsewhere counts. Its first words are how the page knows it. */
export const SPENT_SAY =
  'This identity’s signing key was changed elsewhere, with its chain key, so the signing key’s words Ummia holds no longer count. Nothing was signed. To go on here, give Ummia the new signing key’s words.';

/** Said where Kišib's runner still holds the old signing key after a change of keys (the Dubsar runner cMIP, 3.5 and 7.4). */
export const RUNNER_OLD_KEY_SAY = 'This identity’s keys were changed with its chain key, and Kišib’s runner still holds the old signing key: nothing was signed. Give the runner the new signing key’s words, in Kišib (Runner, Identities held here). Ummia then goes on, in new lines.';

/** Said where an identity is used through Kišib's runner. */
export const RUNNER_HOLDS_SAY = 'Kišib’s runner holds this identity’s signing key, on this Mac; Ummia holds none of its keys. Every act Ummia would sign for it is shown first in Kišib’s panel, inside Ummia’s window. What is sealed to it (the accepted list, the follow list) does not open here.';

/** Said where an encryption key is not held. */
export const NO_KEY_SAY =
  'Ummia holds no encryption key for this identity, so nothing sealed to it opens here and nothing can be sealed to it from here: the accepted list cannot be read or changed, and an anchor’s payment cannot be prepared for Damgar.';

/** Said where the contacts list cannot be opened here: no encryption key held (H100). */
export const CONTACTS_NO_KEY_SAY = 'Ummia holds no encryption key of this identity, so its contacts, sealed to it at its homes, do not open here';

/** Said where the contacts list cannot be opened for an identity used through Kišib's runner (H100). */
export const CONTACTS_RUNNER_SAY = 'Kišib’s runner holds this identity’s keys and Ummia none, so its contacts, sealed to it at its homes, do not open in Ummia: see and change them in Dub';

/** Said where the accepted list is shown (F340). */
export const ACCEPTED_SAY = [
  'One list of the cMIPs and Modules you accept, sealed to your identity and kept at its homes: every app holding the identity reads the same list, each the part it understands (Damgar the payment specifications, Edubba the agreements’ and splits’, Dub the formats it shows). Here it is shown whole.',
  'A change is written on the latest version read, and the list is read again just before sending. Where two apps changed it at once, both changes are merged, never one dropped.',
  'Private by default; publishing it is the other choice.',
];

export interface Settings {
  /** Where this identity's public acts go: specifications, releases, drafts, reports. */
  relays: string[];
  /** The public relays tracking asks. */
  track: string[];
  /** The reporting identity (F287), by its ID. */
  reports: string | null;
  via: Via;
  /** Who acts (the chooser): the identity's own ID, or a collective it acts for (round 2). */
  acting?: string | null;
  /** Rules followed in Ummia only (H93): their spec hashes, the sealed list unchanged. */
  rulesHere?: string[];
  /** The collectives this identity acts for here, with its own key (round 2, F353). */
  collectives?: { id: string; available: boolean; why: string | null }[];
  /** Look's saved points (decided: a release line, a developer's releases; "the same follow list, but here it filters"). */
  saved?: Saved[];
}

/** A saved point of Look: what it points at, and what it shows. */
export interface Saved {
  key: string;
  label: string;
  point: { kind: PointKind; value: string };
  filters: Filter[];
}

/** A specification published from here. */
export interface Published {
  id: string;
  hash: string;
  name: string;
  kind: string;
  at: number;
}

export interface Book {
  releases: OwnRelease[];
  /** Releases made here for a collective, with this member's own key (round 2), by collective. */
  collectiveReleases?: (OwnRelease & { collective: string; asked: string[] })[];
  specs: Published[];
  mips: MipDraft[];
  reports: Sent[];
  anchors: Asked[];
  /** The published accepted list's chain, where published. */
  listPublished: { act: string; version: number; withdrawn: boolean } | null;
  /** Specification cards signed here (the Dubsar Specification Card cMIP), newest last. */
  cards?: { id: string; spec: string; title: string; at: number }[];
  /** Discussion threads started here, each naming a specification. */
  discussions?: { id: string; spec: string; title: string; at: number }[];
  /** Replies signed here as documents, by the act they answer. */
  replies?: { id: string; to: string; at: number }[];
}

export const NO_BOOK = (): Book => ({ releases: [], specs: [], mips: [], reports: [], anchors: [], listPublished: null });

/** Where Ummia keeps things: a folder (`store.ts`) or the browser (`web/keep.ts`). */
export interface Keep {
  held(): Promise<string[]>;
  active(): Promise<string | null>;
  setActive(id: string | null): Promise<void>;
  identity(id: string): Promise<TestIdentity | null>;
  saveIdentity(id: TestIdentity): Promise<void>;
  read<T>(id: string, name: 'settings' | 'book'): Promise<T | null>;
  write(id: string, name: 'settings' | 'book', v: unknown): Promise<void>;
  forget(id: string): Promise<void>;
  exclusive<T>(f: () => Promise<T>): Promise<T>;
}

const list = (xs: string[]) => [...new Set(xs.map((s) => s.trim().replace(/\/$/, '')).filter(Boolean))];
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
export const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);

interface Plan {
  digest: string;
  identity: string;
  expires: number;
  blocking: string[];
  run(): Promise<Done>;
}

const PLAN_FOR = 15 * 60 * 1000;

/** The area of a collective reaching its releases (a publication, Envelopes type 0), as its agreement in force writes it. */
export async function releaseArea(collective: string, places: string[], via: Via): Promise<{ name: string; holders: string[]; number: number } | null> {
  // A release is a bake (Envelopes type 0): the finer area reaching bakes, else the Envelopes layer's rule (rule 60).
  const r = await areaReaching(collective, places, { spec: SPECS.envelopes, type: 0 }, via).catch(() => null);
  return r?.area ? { name: r.area.layer ? 'the Envelopes layer' : r.area.name, holders: r.area.holders, number: r.area.number } : null;
}

export class Ummia {
  /** This app's line as the homes hold it, for its card (H80's question 2). */
  private readonly line = lineReader('Ummia');
  /** Who is known (H96, H100): the one contacts list and the names identities published, read as every app reads them. */
  private readonly known = new Known('Ummia');

  /** This app's line: what waits sent first, in its own turn (the file read again there, the key checked first), then read back. Null where the homes could not be read. */
  private async lineNow(me: TestIdentity, via: Via): Promise<LineAtHomes | null> {
    if (Object.keys(me.f.unsent ?? {}).length) {
      await this.serial(async () => {
        const f = await this.store.identity(me.id);
        if (!f) return;
        // Sending signs a key delivery to oneself: only with a key still current (H80).
        await this.current(f);
        await sendWaiting(f, via);
        await this.store.saveIdentity(f);
        me.f.unsent = f.f.unsent;
      }).catch(() => undefined);
    }
    return this.line(me, via).catch(() => null);
  }
  private queue: Promise<unknown> = Promise.resolve();
  private plans = new Map<string, Plan>();

  /** `web`: the web client. `releases`: the program's (a folder). `chain`: the chain followed (program only). */
  constructor(
    readonly store: Keep,
    readonly opts: { web?: boolean; releases?: Releases | null; chain?: ChainSource | null; runner?: RunnerLink } = {},
  ) {}

  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => undefined);
    return next;
  }

  /** An identity held here; one used through Kišib's runner signs by it, Ummia holding no key (the Dubsar runner cMIP). */
  private async load(id: string): Promise<TestIdentity | null> {
    const me = await this.store.identity(id);
    if (me && !me.f.signingSecret && this.opts.runner) me.signer = this.opts.runner.signer();
    return me;
  }

  private async ctx(): Promise<{ me: TestIdentity; s: Settings; book: Book; hints: string[] }> {
    const active = await this.store.active();
    const me = active ? await this.load(active) : null;
    if (!me) throw new Error('No identity in use: bring one by its signing key’s words.');
    const s: Settings = { relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(me.id, 'settings')) ?? {}) };
    const book: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
    return { me, s, book, hints: [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])] };
  }

  private saveBook(id: string, book: Book) {
    return this.store.write(id, 'book', book);
  }

  /** Who acts, from the chooser: oneself, or a collective this identity acts for, with this identity's own key, naming the collective (rule 58: a collective has no key, its members no member keys). */
  private async acting(me: TestIdentity, s: Settings): Promise<{ kind: 'self' } | { kind: 'collective'; id: string; places: string[] }> {
    const who = chosen(actors(await this.store.held(), s.collectives ?? []), s.acting ?? me.id);
    if (!who) throw new Error('Choose who acts.');
    if (who.kind === 'self') {
      if (who.id !== me.id) throw new Error('Choose who acts: yourself, or a collective you act for.');
      return { kind: 'self' };
    }
    const places = await this.placesOf(who.id, [...me.f.homes.map((h) => h.hint), ...s.relays, ...s.track], s.via);
    return { kind: 'collective', id: who.id, places };
  }

  private async placesOf(id: string, hints: string[], via: Via): Promise<string[]> {
    try {
      const l = await lookUp(id, hints, via);
      return [...new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
      return hints;
    }
  }

  /**
   * Act for a collective here (round 2, F353), by its ID: kept where this
   * identity holds a box in the area, or the Envelopes layer's rule,
   * reaching its releases (a release is a bake, Envelopes type 0; rule 60).
   * It acts with its own key, naming the collective (rule 58).
   */
  collectiveAdd(typed: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readId(typed);
      const places = await this.placesOf(id, [...hints, ...s.track], s.via);
      const area = await releaseArea(id, places, s.via);
      let why: string | null = null;
      if (!area) why = 'Its agreement in force names nobody who uploads for it (no rule for its Envelopes layer, nor an area reaching bakes).';
      else if (!area.holders.includes(me.id)) why = `You hold no box in the area reaching its releases (“${area.name}”).`;
      if (why) throw new Error(`${why} Nothing was kept.`);
      s.collectives = [...(s.collectives ?? []).filter((c) => c.id !== id), { id, available: true, why: null }];
      await this.store.write(me.id, 'settings', s);
      return { lines: [{ text: `Ummia acts for ${short(id)} with your own identity’s key, naming the collective: its releases go through “${area!.name}”, ${area!.number} signature${area!.number === 1 ? '' : 's'} of ${area!.holders.length}.`, tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ the identity

  /**
   * Bring an identity by its ID and its signing key's words (the carry
   * Module, section 4): kept only if the words give its current signing
   * key; its encryption key where the words carry it. Ummia starts its own
   * line. One already held takes the new words instead.
   */
  bring(a: { id: string; words: string; address: string; relays?: string[]; via?: Via }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const via = a.via ?? {};
      let id: string;
      let seed: Uint8Array;
      try {
        id = readId(a.id);
        seed = fromCarried(a.words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error('Give an address where this identity is found (one of its homes), starting with https://.');
      const look = await lookCurrent(id, seed, [address], via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via);
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) throw new Error('This identity names no relays. Give one or more relay addresses, and bring it again.');
      const enc = carriedKey(look, seed);
      const f: IdentityFile = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        safety: { scheme: 0, seeds: '' },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc ? [enc] : [],
        pending: null,
      };
      await this.store.write(id, 'settings', { relays, track: relays, reports: null, via, acting: id } satisfies Settings);
      await this.store.saveIdentity(new TestIdentity(f, via));
      await this.store.setActive(id);
      return {
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          enc ? { text: 'Its encryption key is the one the words carry: its accepted list opens here.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
  }

  /** The new signing key's words, after a rotation made elsewhere counts (the carry Module, 4.6). */
  renew(words: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error('No identity in use.');
      let seed: Uint8Array;
      try {
        seed = fromCarried(words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      return this.renewHeld(active, seed);
    });
  }

  private async renewHeld(id: string, seed: Uint8Array): Promise<{ lines: Line[] }> {
    const me = (await this.store.identity(id))!;
    const s = (await this.store.read<Settings>(id, 'settings')) ?? { relays: [], track: [], reports: null, via: {} };
    if (hex(seed) === me.f.signingSecret) throw new Error('These are the signing key’s words Ummia already holds, and they still count: nothing to change.');
    const look = await lookCurrent(id, seed, [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    const r = look.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    freshLines(me.f);
    me.f.routes = null;
    const carried = carriedKey(look, seed);
    if (carried && !me.f.encryption.some((e) => e.act === carried.act)) me.f.encryption.push(carried);
    await this.store.saveIdentity(me);
    return {
      lines: [
        { text: 'The new signing key’s words give its current signing key. Ummia signs with them from now on, in a new line.', tone: 'ok' },
        carried ? { text: 'Its encryption key is the one the new words carry.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
        { text: LINE_SAY, tone: 'warn' },
      ],
    };
  }

  async use(id: string): Promise<void> {
    if (!(await this.store.held()).includes(id)) throw new Error('Ummia does not hold that identity.');
    await this.store.setActive(id);
  }

  async leave(): Promise<void> {
    await this.store.setActive(null);
  }

  /** Forget an identity here: its keys and its book go. What it signed stays where it was sent. */
  forget(id: string): Promise<void> {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error('Ummia does not hold that identity.');
      const was = await this.store.active();
      await this.store.forget(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }

  /** The signing key's words, on request: the way back if this app's storage is lost. */
  async carry(): Promise<{ id: string; grouped: string; words: string[]; key: string }> {
    const { me } = await this.ctx();
    // The same key as a string, shown on request (module-signing-key-string-draft-1.md; H104).
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)), key: groupKeyString(toKeyString(unhex(me.f.signingSecret))) };
  }

  /** Whether the signing key Ummia holds still counts. */
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

  private async current(me: TestIdentity): Promise<void> {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing was signed.');
    if (!me.f.signingSecret) {
      // Through Kišib's runner (the Dubsar runner cMIP, 3.5 and 7.4): a change of keys made since is followed once the runner holds the new key; otherwise nothing is signed.
      const binding = r.links[r.links.length - 1];
      if (!binding || binding.act === me.f.binding) return;
      const p = await this.opts.runner?.paired().catch(() => null);
      const k = p?.identities.find((x) => x.id === me.id);
      if (!k || k.binding !== binding.act || !r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY);
      me.f.chain = (await servedChain(me.id, r.homes, me.via)).map(base64);
      me.f.position = binding.position;
      me.f.binding = binding.act;
      me.f.homes = r.homes;
      me.f.rule = r.rule ?? null;
      freshLines(me.f);
      me.f.routes = null;
      await this.store.saveIdentity(me);
      return;
    }
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }

  /** Who acts: chosen with the chooser. */
  setActing(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const who = actors(await this.store.held(), s.collectives ?? []).find((a) => a.id === id && a.available);
      if (!who) throw new Error('That one cannot act here.');
      if (who.kind === 'collective') {
        await this.store.write(me.id, 'settings', { ...s, acting: who.id });
        return { lines: [{ text: `Acting for the collective ${who.short}, with your own key for it.`, tone: 'ok' }] };
      }
      if (who.id !== me.id) await this.store.setActive(who.id);
      const target = who.id === me.id ? s : ({ relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(who.id, 'settings')) ?? {}) } as Settings);
      await this.store.write(who.id, 'settings', { ...target, acting: who.id });
      return { lines: [{ text: `Acting as yourself, ${who.short}.`, tone: 'ok' }] };
    });
  }

  /** Settings: where this identity's acts go, the relays tracking asks, the reporting identity. */
  setSettings(a: { relays?: string[]; track?: string[]; reports?: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const next: Settings = { ...s };
      if (a.relays) {
        if (!list(a.relays).length) throw new Error('Name at least one relay its acts go to.');
        next.relays = list(a.relays);
      }
      if (a.track) next.track = list(a.track);
      if (a.reports !== undefined) {
        const t = a.reports.trim();
        next.reports = t ? readId(t) : null;
      }
      await this.store.write(me.id, 'settings', next);
      return { lines: [{ text: 'Saved.', tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ state

  async state(): Promise<State> {
    const active = await this.store.active();
    const heldIds = await this.store.held();
    const held = await Promise.all(
      heldIds.map(async (id) => {
        const f = await this.store.identity(id);
        const hs: Settings = { relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(id, 'settings')) ?? {}) };
        const homes = f?.f.homes.map((h) => h.hint) ?? [];
        // H96: each one's published name, read at its own homes (kept a while), so the top right and the panel say it, or why not.
        const published = f ? await this.known.names.read(id, this.namePlaces(f, hs)) : ({ state: 'unreached' } as const);
        // H88: its ID link, with one home and one relay, so whoever is given it finds it.
        const link = idWhere(id, [...homes.slice(0, 1), ...hs.relays.filter((r) => !homes.includes(r)).slice(0, 1)]);
        return { id, grouped: groupId(id), short: short(id), form: idForm(id), link, named: { nick: null, published } satisfies Named, active: id === active, runner: !f?.f.signingSecret };
      }),
    );
    const me = active ? await this.load(active) : null;
    const out: State = {
      web: !!this.opts.web,
      stage: 'identity',
      held,
      identity: null,
      actors: actors(heldIds),
      acting: null,
      settings: { relays: [], track: [], reports: null },
      saved: [],
      releases: !!this.opts.releases,
      counts: { specs: 0, releases: 0, mips: 0, reports: 0, cards: 0, anchors: 0 },
    };
    if (!me) return out;
    const s: Settings = { relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(me.id, 'settings')) ?? {}) };
    const book: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
    // Ummia's line, its card naming only an act the homes hold (H80's question 2): what waited sent first.
    const line = await this.lineNow(me, s.via);
    out.stage = 'ready';
    out.identity = {
      id: me.id,
      grouped: groupId(me.id),
      short: short(me.id),
      form: idForm(me.id),
      link: held.find((h) => h.id === me.id)!.link,
      named: held.find((h) => h.id === me.id)!.named,
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: line ?? noLine(me.f),
      runner: !me.f.signingSecret,
    };
    out.actors = actors(heldIds, s.collectives ?? []);
    out.acting = chosen(out.actors, s.acting ?? me.id)?.id ?? null;
    // H96: the collectives it acts for, named as every identity is (their published names; a contact's nickname first).
    const cs = out.actors.filter((x) => x.kind === 'collective').map((x) => x.id);
    out.names = cs.length ? await this.known.named(me, this.opener(me).open, cs, this.namePlaces(me, s), { via: s.via }).catch(() => ({})) : {};
    out.settings = { relays: s.relays, track: s.track, reports: s.reports };
    out.saved = s.saved ?? [];
    out.rules = await this.rulesNow(me, s);
    out.counts = { specs: book.specs.length, releases: book.releases.length + (book.collectiveReleases?.length ?? 0), mips: book.mips.length, reports: book.reports.length, cards: (book.cards?.length ?? 0) + (book.discussions?.length ?? 0), anchors: book.anchors.length };
    return out;
  }

  // ------------------------------------------------------------ reviews

  private plan(identity: string, p: { digest: string; blocking: string[]; run(): Promise<Done> }): string {
    const id = sha256(`${p.digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(id, { ...p, identity, expires: Date.now() + PLAN_FOR });
    return id;
  }

  /** Carry out a review exactly as shown: only with its digest, within 15 minutes, once, never with reasons not to sign. */
  confirm(planId: string, digest: string): Promise<Done> {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const p = this.plans.get(planId);
      if (!p || p.expires < Date.now() || p.identity !== me.id) throw new Error('This review has expired or was already used. Review it again. Nothing was signed.');
      if (p.digest !== digest) throw new Error('The digest does not match what was shown. Nothing was signed.');
      if (p.blocking.length) throw new Error(`${p.blocking.join(' ')} Nothing was signed.`);
      this.plans.delete(planId);
      await this.current(me);
      return p.run();
    });
  }

  cancel(planId: string): void {
    this.plans.delete(planId);
    this.opts.releases?.cancel(planId);
  }

  // ------------------------------------------------------------ specifications

  /** What a specification form needs: the kinds, the tasks, what a MIP may fork. */
  specChoices() {
    return {
      kinds: [
        { kind: 0, name: KINDS[0] },
        { kind: 1, name: KINDS[1] },
      ],
      tasks: Object.entries(TASKS).map(([n, [layer, name]]) => ({ n: Number(n), layer, name })),
      forkable: FORKABLE,
    };
  }

  /** A specification made and read back, its hash shown; nothing signed until confirmed. */
  async prepareSpec(f: SpecForm): Promise<Review> {
    const { me, s } = await this.ctx();
    // A collective's specification is not offered in round 2: releases are its acts here.
    if ((await this.acting(me, s)).kind === 'collective') throw new Error('A specification is published as yourself: choose yourself under Who acts. A collective acts here for its releases.');
    const actor = me;
    const form: SpecForm = {
      ...f,
      implements: f.implements ? readHash(f.implements, 'What it implements') : null,
      predecessor: f.predecessor ? readHash(f.predecessor, 'Its predecessor') : null,
      dependencies: (f.dependencies ?? []).map((d) => readHash(d, 'A dependency')),
    };
    const p = prepareSpec(form, actor.id);
    const blocking = [...p.blocking];
    if (!s.relays.length) blocking.push('Name at least one relay its acts go to, under Settings.');
    const sp = p.spec;
    const fields: Line[] = sp
      ? [
          { text: `Kind: ${KINDS[sp.kind]}. Its creator: you, ${short(actor.id)} (field 1): its hash covers your identity, so it is “this specification, by this identity”.` },
          ...sp.tasks.map(([, n]) => ({ text: `Fills task ${n}: ${TASKS[n][1]} (${TASKS[n][0]}).` })),
          ...sp.types.map((t) => ({ text: `Defines act type ${t.type}, “${t.name}” (field 3, for discovery).` })),
          ...(sp.types.length && !sp.tasks.length ? [{ text: 'Act types and no task: an xtype (Development rule 18).' }] : []),
          ...(sp.implements ? [{ text: `Works under ${sp.implements} (field 5).` }] : []),
          ...(sp.predecessor ? [{ text: `${sp.kind === 8 ? 'Forks' : 'Replaces, for its users,'} ${sp.predecessor} (field 8).` }] : []),
          ...(sp.layers ? [{ text: `As an extension, acts on the layers ${sp.layers.join(', ')} beyond Development (field 10).` }] : []),
          ...(sp.rail ? [{ text: `A ${sp.rail.kind} rail, its proof binding ${sp.rail.binds.join(', ') || 'nothing'} (fields 11 and 13).` }] : []),
          ...(sp.checker ? [{ text: 'Checks proofs of delivery (field 12).' }] : []),
          ...sp.dependencies.map((d) => ({ text: `Depends on ${d} (field 4, for discovery).` })),
        ]
      : [];
    const digest = sha256(new TextEncoder().encode(`MOR Ummia specification, version 1\n${actor.id}\n${p.hash}\n${s.relays.join('\n')}`));
    const plan = this.plan(me.id, {
      digest,
      blocking,
      run: async () => {
        let out;
        try {
          out = await publishSpec(me, p.content, s.relays);
        } finally {
          await this.store.saveIdentity(me);
        }
        const book: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
        book.specs.push({ id: out.id, hash: p.hash, name: p.name, kind: KINDS[form.kind], at: now() });
        if (form.kind === 8) {
          const m = book.mips.find((x) => x.text === form.text && !x.published);
          if (m) m.published = { id: out.id, hash: p.hash };
        }
        await this.saveBook(me.id, book);
        return {
          title: `${p.name} is published`,
          hash: p.hash,
          acts: [out.id],
          lines: [
            { text: `Its spec hash: ${p.hash}. Agreements and acts name it by this hash, wherever it is published.`, tone: 'ok' },
            { text: `Its publication: ${out.id}, on ${s.relays.join(', ')}.`, tone: 'ok' },
            ...out.refused.map((r) => ({ text: `Its content was refused by ${r}`, tone: 'warn' as const })),
          ],
        };
      },
    });
    return {
      plan,
      digest,
      hash: p.hash,
      title: `Publish ${form.kind === 8 ? 'the MIP' : `the ${KINDS[form.kind] ?? 'specification'}`} “${p.name}”`,
      summary: [
        `Its spec hash will be ${p.hash || '(none: it is not yet in the format)'}. The hash covers its content (the fields below and its text), never the act that publishes it.`,
        'Published for good: a changed specification is a new one, with a new hash, naming this one as its predecessor if you wish (Development rule 4).',
        'Nothing is signed until you press Sign and publish.',
      ],
      sections: [
        { heading: 'What it carries', lines: fields },
        { heading: 'Who signs, and where it goes', lines: [{ text: `A public publication signed by you, its content on ${s.relays.join(', ') || '(no relay yet)'}: anyone can fetch it by its hash, and adopt it, or not.` }] },
        { heading: 'A reading of the publishing rule (F322)', lines: [{ text: 'Ummia writes the fields the kind requires, and only the optional fields you filled. Fill only what your text says: two publications of one text that differ in an optional field are two specifications, with two hashes.' }] },
      ],
      blocking,
    };
  }

  /** The specifications published from here. */
  async specs(): Promise<Published[]> {
    const { book } = await this.ctx();
    return [...book.specs].reverse();
  }

  // ------------------------------------------------------------ tracking

  /** A plain look-up of the relays named (or tracking's own), with the filters relays have. */
  async track(a: { relays?: string[]; signer?: string } = {}): Promise<Tracked> {
    const { s } = await this.ctx();
    const relays = a.relays?.length ? list(a.relays) : s.track;
    if (!relays.length) throw new Error('Name the public relays to ask, under Settings or here.');
    return track(relays, { signer: a.signer ? readId(a.signer) : undefined, via: s.via });
  }

  /** The public acts of one specification (an xtype, say), by the feed's `spec`, `type` and `signer` filters. */
  async actsOf(a: { spec: string; type?: number | null; signer?: string; relays?: string[] }) {
    const { s } = await this.ctx();
    const relays = a.relays?.length ? list(a.relays) : s.track;
    if (!relays.length) throw new Error('Name the public relays to ask, under Settings or here.');
    return actsOf(relays, { spec: readHash(a.spec, 'The specification'), type: a.type ?? undefined, signer: a.signer ? readId(a.signer) : undefined, via: s.via });
  }

  limit(): string[] {
    return LIMIT_SAY;
  }

  // ------------------------------------------------------------ the accepted list (F340)

  private secrets(me: TestIdentity): Uint8Array[] {
    return [...me.f.encryption].reverse().map((e) => unhex(e.secret));
  }

  private layerCache: { at: number; layers: Map<string, string> } | null = null;

  /** Each specification's layer, as tracking reads it from its own fields, on the relays tracking asks: read again at most once a minute. */
  private async layersOf(hashes: string[]): Promise<Map<string, string>> {
    if (!hashes.length) return new Map();
    if (this.layerCache && this.layerCache.at + 60 > now() && hashes.every((h) => this.layerCache!.layers.has(h))) return this.layerCache.layers;
    try {
      const { s } = await this.ctx();
      const t = await track(this.lookRelays(s), { via: s.via });
      this.layerCache = { at: now(), layers: new Map(t.specs.map((x) => [x.hash, x.layer])) };
      return this.layerCache.layers;
    } catch {
      return new Map();
    }
  }

  /** Ummia's own rules (H93), held against the list and what was approved in Ummia only: read again at most once a minute. */
  private rulesRead = new Map<string, { shown: RulesShown; at: number }>();
  private async rulesNow(me: TestIdentity, s: Settings, fresh = false): Promise<RulesShown> {
    const c = this.rulesRead.get(me.id);
    if (c && !fresh && c.at + 60 > now()) return c.shown;
    const { shown } = await readRules('Ummia', UMMIA_RULES, me, s.rulesHere ?? [], { open: this.secrets(me), via: me.via });
    this.rulesRead.set(me.id, { shown, at: now() });
    return shown;
  }

  async rules(): Promise<RulesShown> {
    const { me, s } = await this.ctx();
    return this.rulesNow(me, s, true);
  }

  /** Approve rules Ummia runs, in Ummia only or added to the list; or stop following one in Ummia only. */
  approveRules(a: { keys: string[]; where: 'here' | 'list'; remove?: boolean }): Promise<{ lines: Line[]; rules: RulesShown }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const keys = a.keys.includes('*') ? (await this.rulesNow(me, s, true)).rules.filter((r) => !r.on).map((r) => r.key) : a.keys;
      if (!keys.length) return { lines: [{ text: 'Every rule Ummia runs is followed already.' }], rules: await this.rulesNow(me, s) };
      const r = await approveRules('Ummia', UMMIA_RULES, me, { keys, where: a.where, remove: a.remove, here: s.rulesHere ?? [] }, { via: me.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) });
      const next = { ...s, rulesHere: r.here };
      await this.store.write(me.id, 'settings', next);
      return { lines: r.lines, rules: await this.rulesNow(me, next, true) };
    });
  }

  /** The whole list, as every app reads it: each entry, its label, and whose part it is where known. */
  async accepted(): Promise<{ entries: AcceptedEntry[]; version: number; forked: boolean; merged: string[]; published: boolean; problems: string[]; say: string[] }> {
    const { me, book } = await this.ctx();
    const l = await readAccepted(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), me.via);
    const layers = await this.layersOf([...l.entries.keys()].filter((h) => !DAMGAR_PART.has(h) && !builtIn(h)));
    const entries: AcceptedEntry[] = [...l.entries.entries()]
      .map(([hash, label]) => ({ hash, label: label ?? damgarLabel(hash) ?? builtIn(hash)?.title ?? null, part: DAMGAR_PART.has(hash) ? 'Money: Damgar’s part' : 'Read by the apps that know it', layer: DAMGAR_PART.has(hash) ? 'Money' : (builtIn(hash)?.title.replace(/^MIR: /, '') ?? layers.get(hash) ?? null) }))
      .sort((a, b) => (a.part < b.part ? -1 : a.part > b.part ? 1 : (a.label ?? a.hash) < (b.label ?? b.hash) ? -1 : 1));
    return {
      entries,
      version: l.version,
      forked: l.tips.length > 1,
      merged: l.merged,
      published: !!book.listPublished && !book.listPublished.withdrawn,
      problems: [...(me.f.encryption.length ? [] : [NO_KEY_SAY]), ...l.problems],
      say: ACCEPTED_SAY,
    };
  }

  /** Change the list: add (with a label) and remove entries, every other entry kept as found; merged where forked. */
  changeAccepted(a: { add?: { hash: string; label?: string | null }[]; remove?: string[] }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me } = await this.ctx();
      await this.current(me);
      if (!me.f.encryption.length) throw new Error(NO_KEY_SAY);
      const add = (a.add ?? []).map((x) => ({ hash: readHash(x.hash, 'A specification to accept'), label: x.label?.trim().slice(0, 120) || null }));
      const remove = (a.remove ?? []).map((h) => readHash(h, 'A specification to remove'));
      const r = await changeAccepted(
        me,
        (entries) => {
          for (const x of add) entries.set(x.hash, x.label ?? entries.get(x.hash) ?? damgarLabel(x.hash) ?? null);
          for (const h of remove) entries.delete(h);
        },
        { via: me.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) },
      );
      const lines: Line[] = [];
      if (r.list.merged.length) lines.push({ text: `Two apps had changed the accepted list at once. Both changes were merged: ${r.list.merged.join(' ')}`, tone: 'warn' });
      lines.push(r.written ? { text: `Sealed to this identity and kept at its homes (version ${r.list.version}): every app holding it reads the change.`, tone: 'ok' } : { text: 'Nothing changed.' });
      return { lines };
    });
  }

  /** The other choice (F59): publish the accepted list, or withdraw it. */
  publishList(on: boolean): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const l = await readAccepted(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), me.via);
      const id = await publishAccepted(me, l, s.relays, book.listPublished ? { act: book.listPublished.act, version: book.listPublished.version } : null, !on, () => this.store.saveIdentity(me));
      book.listPublished = { act: id, version: (book.listPublished?.version ?? 0) + 1, withdrawn: !on };
      await this.saveBook(me.id, book);
      return { lines: [on ? { text: `Published at ${s.relays.join(', ')}: anyone can read which specifications you accept.`, tone: 'warn' } : { text: 'Withdrawn: it is private again. Earlier versions stay readable as acts.', tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ MIPs

  async mips(): Promise<{ drafts: MipDraft[]; say: string[]; forkable: typeof FORKABLE }> {
    const { book } = await this.ctx();
    return { drafts: book.mips, say: MIP_SAY, forkable: FORKABLE };
  }

  /** Start a MIP in the MIP shape: what it forks, by name (a MIR) or by spec hash (a MIP, the MICS document). */
  newMip(a: { title: string; forks: string }): Promise<{ key: string; text: string }> {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const named = FORKABLE.find((f) => f.key === a.forks);
      const forks = named ? named.hash : readHash(a.forks, 'What it forks');
      const forksName = named ? named.name : `the specification ${short(forks)}`;
      const text = template({ title: a.title, forks: `${forksName} (${forks})`, creator: short(me.id) });
      const key = sha256(`${me.id}${a.title}${Date.now()}${Math.random()}`).slice(0, 16);
      book.mips.push({ key, title: a.title.trim() || 'A proposal', forks, forksName, drafts: [], text, published: null });
      await this.saveBook(me.id, book);
      return { key, text };
    });
  }

  /** Keep the text as written here (nothing signed), with the shape checked. */
  saveMip(key: string, text: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error('No such draft here.');
      if (m.published) throw new Error('This MIP is published as a specification: a changed MIP is a new one. Start a new draft.');
      m.text = text;
      await this.saveBook(me.id, book);
      return { lines: [{ text: 'Kept here: nothing is signed or sent.', tone: 'ok' }, ...shapeOf(text)] };
    });
  }

  /** Publish a draft for discussion: a signed long-form document, public; not a specification. */
  publishMipDraft(key: string): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      if ((await this.acting(me, s)).kind === 'collective') throw new Error('A MIP draft is published as yourself: choose yourself under Who acts.');
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error('No such draft here.');
      if (!s.relays.length) throw new Error('Name at least one relay its acts go to, under Settings. Nothing was signed.');
      let id: string;
      try {
        ({ id } = await publishDraft(me, m.text, s.relays));
      } finally {
        await this.store.saveIdentity(me);
      }
      m.drafts.push({ id, at: now(), name: m.text.split('\n')[0].replace(/^#+\s*/, '').slice(0, 120) });
      await this.saveBook(me.id, book);
      return {
        title: `Draft ${m.drafts.length} is published for discussion`,
        acts: [id],
        lines: [
          { text: `A signed long-form document, public: ${id}. It can be opened in the reader by its id, and answered from Dub.`, tone: 'ok' },
          { text: 'It is not a specification: nothing names it by a spec hash. Publish the MIP as a specification only when you are ready.' },
          ...shapeOf(m.text),
        ],
      };
    });
  }

  /** The replies to a MIP's drafts. */
  async mipReplies(key: string): Promise<{ replies: Record<string, Reply[]>; lines: Line[] }> {
    const { me, s, book } = await this.ctx();
    const m = book.mips.find((x) => x.key === key);
    if (!m) throw new Error('No such draft here.');
    const r = await mipReplies(me, m.drafts.map((d) => d.id), [...new Set([...s.relays, ...s.track])], s.via);
    return { replies: Object.fromEntries(r.replies), lines: r.lines };
  }

  /** Ready: the MIP as a specification (kind 8), naming its creator and what it would replace. Read back first, as any specification. */
  prepareMip(key: string): Promise<Review> {
    return this.ctx().then(({ book }) => {
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error('No such draft here.');
      if (m.published) throw new Error('This MIP is published already.');
      return this.prepareSpec({ kind: 8, text: m.text, predecessor: m.forks });
    });
  }

  // ------------------------------------------------------------ reports

  async reports(): Promise<{ sent: Sent[]; answers: Answer[]; lines: Line[]; say: string[]; to: string | null }> {
    const { s, book } = await this.ctx();
    const sent = [...book.reports].reverse();
    if (!s.reports) return { sent, answers: [], lines: [], say: REPORT_SAY, to: null };
    const r = await reportAnswers(s.reports, sent.map((x) => x.id), [...new Set([...s.relays, ...s.track])], s.via);
    return { sent, answers: r.answers, lines: r.lines, say: REPORT_SAY, to: s.reports };
  }

  /** Send a report from one's own identity to the reporting identity (F287). */
  sendReport(text: string): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      if ((await this.acting(me, s)).kind === 'collective') throw new Error('A report is sent as yourself: choose yourself under Who acts.');
      if (!s.reports) throw new Error('Give the reporting identity’s ID under Settings first. Nothing was signed.');
      if (!text.trim()) throw new Error('Write the report first. Nothing was signed.');
      if (!s.relays.length) throw new Error('Name at least one relay its acts go to, under Settings. Nothing was signed.');
      const r = await sendReport(me, { to: s.reports, text: text.trim(), relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me) });
      book.reports.push(r.sent);
      await this.saveBook(me.id, book);
      return { title: 'The report is sent', acts: [r.sent.id], lines: r.lines };
    });
  }

  // ------------------------------------------------------------ releases (on a computer)

  private releasesHere(): Releases {
    if (!this.opts.releases) throw new Error('Releases are made from a folder on a computer: in Ummia on the Mac or Linux, not in the web client.');
    return this.opts.releases;
  }

  /** This identity's releases: those made here, then those found on its relays (a line begun in Edubba before F339 goes on here). */
  private async ownReleases(me: TestIdentity, book: Book, hints: string[], via: Via): Promise<OwnRelease[]> {
    const here = new Set(book.releases.map((r) => r.id));
    const found = this.opts.releases ? await this.opts.releases.found(me.id, hints, via) : [];
    return [...found.filter((r) => !here.has(r.id)), ...book.releases];
  }

  async releases(): Promise<{ releases: { id: string; name: string; version: string; folder: string; collective?: string }[]; anchors: AnchorShown[]; anchorSay: string[] }> {
    const { me, book, hints, s } = await this.ctx();
    const anchors: AnchorShown[] = [];
    for (const x of book.anchors) anchors.push(await anchorStanding(x, [...hints, ...s.track], s.via, this.opts.chain ?? null));
    const acting = s.collectives?.some((c) => c.id === s.acting) ? s.acting! : null;
    if (acting) {
      const places = await this.placesOf(acting, [...hints, ...s.track], s.via);
      const own = await this.collectiveReleases(acting, book, places, s.via);
      return { releases: [...own].reverse().map(({ id, name, version, folder }) => ({ id, name, version, folder, collective: acting })), anchors, anchorSay: ANCHOR_SAY };
    }
    const own = this.opts.releases ? await this.ownReleases(me, book, hints, s.via) : book.releases;
    return { releases: [...own].reverse().map(({ id, name, version, folder }) => ({ id, name, version, folder })), anchors, anchorSay: ANCHOR_SAY };
  }

  async suggestRelease(folder: string) {
    const { me, book, hints, s } = await this.ctx();
    return this.releasesHere().suggest(await this.ownReleases(me, book, hints, s.via), folder);
  }

  /** A collective's releases: those made here for it, then those found on its places. */
  private async collectiveReleases(c: string, book: Book, places: string[], via: Via): Promise<OwnRelease[]> {
    const here = (book.collectiveReleases ?? []).filter((r) => r.collective === c);
    const ids = new Set(here.map((r) => r.id));
    const found = this.opts.releases ? await this.opts.releases.found(c, places, via) : [];
    return [...found.filter((r) => !ids.has(r.id)), ...here];
  }

  async prepareRelease(a: { folder: string; name: string; version: string; previous: string | null; implements: string[] }): Promise<Review> {
    const { me, s, book, hints } = await this.ctx();
    const who = await this.acting(me, s);
    if (who.kind === 'collective') {
      const area = await releaseArea(who.id, who.places, s.via);
      return this.releasesHere().prepare(me, await this.collectiveReleases(who.id, book, who.places, s.via), { ...a, relays: [...new Set([...s.relays, ...who.places])], via: s.via, as: { collective: who.id, area } });
    }
    return this.releasesHere().prepare(me, await this.ownReleases(me, book, hints, s.via), { ...a, relays: s.relays, via: s.via });
  }

  confirmRelease(plan: string, digest: string): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const who = await this.acting(me, s);
      if (who.kind === 'collective') return this.confirmCollectiveRelease(me, s, book, who, plan, digest);
      let r;
      try {
        r = await this.releasesHere().confirm(me, await this.ownReleases(me, book, [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via), plan, digest, s.relays, s.via);
      } finally {
        await this.store.saveIdentity(me);
      }
      book.releases.push(r.release);
      await this.saveBook(me.id, book);
      return r.done;
    });
  }

  /**
   * A collective's release, as reviewed (round 2, F339, F353): the
   * publication signed as the collective with this member's own key; where
   * the area reaching it asks more keys, its other holders are asked, each
   * sent a negotiation message naming it, sealed to them, to sign in their
   * own app; then how it stands, as anyone reads it.
   */
  private async confirmCollectiveRelease(me: TestIdentity, s: Settings, book: Book, who: { id: string; places: string[] }, plan: string, digest: string): Promise<Done> {
    const relays = [...new Set([...s.relays, ...who.places])];
    const at = await chainFor(who.id, who.places, s.via);
    const sign = async (payload: Uint8Array) => {
      const made = await signAsMember(who.id, me, at, { spec: SPECS.envelopes, type: 0, payload, public: true });
      if (!(await publishAt([made.act], relays, s.via)).length) throw new Error('No relay took the release. Nothing counts: try again.');
      return { id: made.id };
    };
    const r = await this.releasesHere().confirm(me, await this.collectiveReleases(who.id, book, who.places, s.via), plan, digest, relays, s.via, sign);
    const area = await releaseArea(who.id, who.places, s.via);
    const asked: string[] = [];
    const lines = [...r.done.lines];
    if (area && area.number > 1) {
      for (const h of area.holders.filter((x) => x !== me.id)) {
        try {
          const l = await lookUp(h, who.places, s.via);
          const inbox = l.inbox(REPO_SPECS.agreements) ?? l.routes.routes.flatMap((x) => x.hints);
          if (!l.encryptionKey || !inbox?.length) throw new Error('no inbox');
          await negotiate(me, { id: h, key: l.encryptionKey, inbox }, { text: `A release of the collective ${short(who.id)}, ${r.release.name} ${r.release.version}: its area “${area.name}” asks ${area.number} keys. Read it in your Signing tab, check its files, then sign it with your own key for the collective.`, refs: [[r.release.id, who.id], [who.id, who.id]] });
          asked.push(h);
        } catch {
          lines.push({ text: `${short(h)} could not be reached to sign it (no inbox or encryption key found).`, tone: 'warn' });
        }
      }
      await this.store.saveIdentity(me);
      if (asked.length) lines.push({ text: `Asked for their key: ${asked.map(short).join(', ')}.` });
    }
    const st = (await judgeCollective(who.id, [r.release.id], who.places, s.via)).get(r.release.id);
    lines.push(st?.met ? { text: 'It counts as the collective’s release: its area is met.', tone: 'ok' } : { text: `It does not count yet: ${st?.areas.map((x) => `${x.signers.length} of ${x.needed} keys`).join('; ') ?? 'not read'}.`, tone: 'warn' });
    book.collectiveReleases = [...(book.collectiveReleases ?? []), { ...r.release, collective: who.id, asked }];
    await this.saveBook(me.id, book);
    return { ...r.done, title: `${r.release.name} ${r.release.version} is published for the collective`, lines };
  }

  /** Where a collective's release stands, as anyone reads it: the keys its area asks, and who signed with their own. */
  async collectiveReleaseStanding(id: string): Promise<{ met: boolean; lines: Line[] }> {
    const { me, s, book } = await this.ctx();
    const r = (book.collectiveReleases ?? []).find((x) => x.id === id);
    if (!r) throw new Error('No release of a collective made here has that id.');
    const places = await this.placesOf(r.collective, [...me.f.homes.map((h) => h.hint), ...s.relays, ...s.track], s.via);
    const st = (await judgeCollective(r.collective, [id], places, s.via)).get(id);
    return {
      met: !!st?.met,
      lines: st?.met
        ? [{ text: `It counts as the collective’s release: ${st.areas.map((x) => `${x.signers.length} of ${x.needed} signatures, each with its member’s own key`).join('; ')}.`, tone: 'ok' }]
        : [{ text: `It does not count yet: ${st?.areas.map((x) => `${x.signers.length} of ${x.needed} keys`).join('; ') ?? st?.reason ?? 'not read'}.`, tone: 'warn' }],
    };
  }

  /** Check it as anyone would: the release fetched by its id from the relays alone, every file checked. */
  async checkRelease(id: string) {
    const { s, hints } = await this.ctx();
    return this.releasesHere().check(readHash(id, 'The release'), [...new Set([...hints, ...s.track])], s.via);
  }

  // ------------------------------------------------------------ anchoring a release (optional; paid in Damgar)

  async anchorOffers(service: string): Promise<Offer[]> {
    const { s, hints } = await this.ctx();
    return anchorOffers(readId(service), [...hints, ...s.track], s.via);
  }

  anchorRelease(a: { release: string; service: string; offer: string; tier: number }): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      await this.current(me);
      // A release of yours, or any act shown (the act menu's Anchor it, in every app: decided).
      const own = [...(await this.ownReleases(me, book, hints, s.via).catch(() => book.releases)), ...(book.collectiveReleases ?? [])].find((x) => x.id === a.release);
      if (!own) {
        const id = readActId(a.release);
        const held = await referTo(id, [...new Set([...hints, ...s.relays, ...s.track])], s.via).catch(() => null);
        if (!held?.public) throw new Error('That is neither one of your releases nor a public act found on your relays. Nothing was prepared.');
      }
      const rel = own ?? { id: readActId(a.release), name: 'the act', version: short(readActId(a.release)) };
      const service = readId(a.service);
      const offer = (await anchorOffers(service, [...hints, ...s.track], s.via)).find((o) => o.act === a.offer);
      if (!offer) throw new Error('No such standing offer of that service was found under the anchoring cMIP.');
      const r = await askAnchor(me, { act: rel.id, label: own ? `the release ${rel.name} ${rel.version}` : `the act ${rel.version}`, service, offer, tier: a.tier, hints, via: s.via, save: () => this.store.saveIdentity(me) });
      book.anchors.push(r.asked);
      await this.saveBook(me.id, book);
      return { title: 'An anchor asked', acts: [r.asked.draft], lines: r.lines };
    });
  }

  // ------------------------------------------------------------ Look: one feed (decided), and a page per specification

  /** The relays Look asks: those named for tracking, else this identity's own. */
  private lookRelays(s: Settings, typed?: string): string[] {
    const r = typed?.trim() ? list([typed]) : s.track.length ? s.track : s.relays;
    if (!r.length) throw new Error('Name the public relays to ask: in the identity panel, Relays, or point at one here.');
    return r;
  }

  /**
   * The feed, pointed at a relay, a single ID, your contacts or a release,
   * filtered by kind and layer (decided). Nothing is kept: ask again to see
   * what changed.
   */
  async look(a: { point?: { kind?: string; value?: string }; filters?: string[]; layer?: string | null }): Promise<Looked & { point: { kind: PointKind; value: string; said: string }; limit: string[] }> {
    const { me, s, hints } = await this.ctx();
    const kind = (['relay', 'id', 'contacts', 'release'] as const).find((k) => k === a.point?.kind) ?? 'relay';
    const value = (a.point?.value ?? '').trim();
    const filters = (a.filters ?? [...FILTERS].filter((f) => f !== 'mips')).filter((f): f is Filter => (FILTERS as readonly string[]).includes(f));
    const layer = a.layer || null;
    let out: Looked;
    let said: string;
    if (kind === 'relay') {
      const relays = this.lookRelays(s, value);
      said = relays.join(', ');
      out = await lookAt(relays, { filters, layer, via: s.via, hints });
    } else if (kind === 'id') {
      if (!value) throw new Error('Point at an identity by its ID (mid1…, or hexadecimal).');
      const id = readId(value);
      said = idForm(id);
      out = await lookAt(this.lookRelays(s), { signers: [id], filters, layer, via: s.via, hints });
    } else if (kind === 'contacts') {
      // The one contacts list (H100), read afresh: a contact added in any app is pointed at here.
      const { open, problem } = this.opener(me);
      const c = await this.known.followed(me, open, s.via, true);
      said = `your contacts (${c.contacts.length})`;
      out = await lookAt(this.lookRelays(s), { signers: c.contacts.map((f) => f.id), filters, layer, via: s.via, hints });
      if (problem ?? c.problem) out.lines.unshift({ text: `Your contacts could not be read: ${problem ?? c.problem}.`, tone: 'warn' });
    } else {
      if (!value) throw new Error('Point at a release by its act ID (mact1…, or hexadecimal).');
      const id = readActId(value);
      said = `the release ${short(id)} and its line`;
      out = await lookAt(this.lookRelays(s), { release: id, filters: ['releases'], via: s.via, hints });
    }
    return { ...out, point: { kind, value, said }, limit: LIMIT_SAY };
  }

  /** A specification's page: everything that can be tied to it, from the relays named (decided 23 October 2026). */
  async specPage(a: { hash: string }): Promise<SpecPage & { mine: boolean; say: string[] }> {
    const { me, s, hints } = await this.ctx();
    const hash = readHash(a.hash, 'The specification');
    const p = await specPage(hash, this.lookRelays(s), s.via, hints);
    return { ...p, mine: p.creator === me.id, say: CARD_SAY };
  }

  /** The Dubsar clock's time on each act it stamped, in words (decided 23 October 2026). */
  async clockWords(ids: string[]): Promise<Record<string, string>> {
    const { s, hints } = await this.ctx();
    return clockWords(ids.slice(0, 500), [...new Set([...s.relays, ...s.track, ...hints])], s.via);
  }

  // ------------------------------------------------------------ saved points and contacts (the same follow list, here it filters)

  savedAdd(a: { label: string; point: { kind: string; value: string }; filters: string[] }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const kind = (['relay', 'id', 'contacts', 'release'] as const).find((k) => k === a.point.kind);
      if (!kind) throw new Error('A saved point points at a relay, an ID, your contacts or a release.');
      const label = a.label.trim().slice(0, 60) || a.point.value.slice(0, 24) || 'A point';
      const filters = a.filters.filter((f): f is Filter => (FILTERS as readonly string[]).includes(f));
      const key = sha256(`${kind} ${a.point.value} ${filters.join(',')}`).slice(0, 12);
      s.saved = [...(s.saved ?? []).filter((x) => x.key !== key), { key, label, point: { kind, value: a.point.value.trim() }, filters }];
      await this.store.write(me.id, 'settings', s);
      return { lines: [{ text: `Saved in Look: “${label}”. Kept in this app only, never published.`, tone: 'ok' }] };
    });
  }

  savedRemove(key: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      s.saved = (s.saved ?? []).filter((x) => x.key !== key);
      await this.store.write(me.id, 'settings', s);
      return { lines: [{ text: 'Removed from Look’s saved points.', tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ who is known (H96, H100, H106, H109, H119)

  /**
   * How Ummia opens what is sealed to an identity (its contacts): with the
   * encryption keys it holds. One used through Kišib's runner, or brought
   * without its encryption key, has none here: `open` is null and `problem`
   * says so, plainly.
   */
  private opener(me: TestIdentity): { open: Uint8Array[] | null; problem: string | null } {
    const keys = heldSecrets(me);
    if (keys.length) return { open: keys, problem: null };
    return { open: null, problem: me.f.signingSecret ? CONTACTS_NO_KEY_SAY : CONTACTS_RUNNER_SAY };
  }

  /** Where an identity's names are read: its homes, the relays its acts go to, the relays Look asks. */
  private namePlaces(me: TestIdentity, s: Settings): string[] {
    return list([...me.f.homes.map((h) => h.hint), ...s.relays, ...s.track]);
  }

  /**
   * The names of these identities, for the page (the kit's `attachIds`;
   * H96, H106): the nickname given in the one contacts list (the people
   * cMIP's, sealed) and the name each published (the naming cMIP's), read
   * by the kit's one name reader. `fresh`: asked again (a retry).
   */
  async names(a: { ids: string[]; fresh?: boolean }): Promise<Record<string, Named>> {
    // Before any identity is in use (Use one from Kišib, on the first screen): no contacts yet, and no place to ask known here, so a name not found reads "Name not reached" (silence proves nothing).
    if (!(await this.store.active())) {
      const published = await this.known.names.many(a.ids.slice(0, 200), [], !!a.fresh);
      return Object.fromEntries(Object.entries(published).map(([id, p]) => [id, { nick: null, published: p }]));
    }
    const { me, s } = await this.ctx();
    return this.known.named(me, this.opener(me).open, a.ids, this.namePlaces(me, s), { via: s.via, fresh: !!a.fresh });
  }

  /** The one contacts list (H100), each with its names: the same list Dub, Damgar and Edubba read, sealed to the identity at its homes. Read again each time it is asked for. */
  async contacts(): Promise<KnownContacts & { say: string }> {
    const { me, s } = await this.ctx();
    const { open, problem } = this.opener(me);
    const r = await this.known.contacts(me, open, this.namePlaces(me, s), { via: s.via, fresh: true });
    return { ...r, problem: problem ?? r.problem, say: FOLLOW_SAY };
  }

  /** The contacts list changed (H109): a contact added (with a nickname, where given), its nickname set or taken away, or taken out. */
  contactChange(a: { op: 'add' | 'nick' | 'remove'; id: string; nick?: string | null }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const { open, problem } = this.opener(me);
      if (!open) throw new Error(`${problem}. Nothing was signed.`);
      // Signing a new version of the list: only with a key still current.
      await this.current(me);
      const said = await this.known.change(me, a, { open, via: s.via, save: () => this.store.saveIdentity(me) });
      return { lines: said.map((x) => ({ text: x.text, tone: x.tone })) };
    });
  }

  /** Follow: add to contacts, with a nickname where given (H109): the one list, as Contacts top left adds to it. */
  async follow(a: { id: string; name?: string | null }): Promise<{ lines: Line[] }> {
    const r = await this.contactChange({ op: 'add', id: readId(a.id), nick: a.name?.trim() || null });
    if (r.lines[0]?.text === 'Nothing changed.') return { lines: [{ text: 'Already in your contacts: nothing to change.', tone: 'ok' }] };
    return { lines: [{ text: 'Added to your contacts.', tone: 'ok' }, ...r.lines] };
  }

  /** Follow their releases (decided: "the same follow list, but here it filters"): added to contacts, and a saved point of Look showing their releases. */
  async followReleases(a: { id: string; name?: string | null }): Promise<{ lines: Line[] }> {
    const id = readId(a.id);
    const f = await this.follow({ id, name: a.name });
    const label = `${a.name?.trim() || short(id)}’s releases`;
    const saved = await this.savedAdd({ label, point: { kind: 'id', value: id }, filters: ['releases'] });
    return { lines: [...f.lines, ...saved.lines] };
  }

  // ------------------------------------------------------------ specification cards (the Dubsar Specification Card cMIP)

  /** The specification a card would name: its creator's publication where one is found, or one of the core's texts. */
  private async specFound(hash: string, s: Settings, book: Book): Promise<{ publication: string | null; creator: string | null; name: string }> {
    const here = book.specs.find((x) => x.hash === hash);
    if (here) return { publication: here.id, creator: null, name: here.name };
    const b = builtIn(hash);
    if (b) return { publication: null, creator: null, name: b.title };
    const t = await track(this.lookRelays(s), { via: s.via });
    const x = t.specs.find((y) => y.hash === hash);
    if (!x) throw new Error('No specification with this hash was found on your relays: a card names one Ummia can find. Nothing was signed.');
    const pub = x.publications.find((p) => p.signer === x.creator) ?? x.publications[0];
    return { publication: pub?.id ?? null, creator: x.creator, name: x.name };
  }

  /**
   * A card (and, where asked, a discussion thread naming the specification),
   * read back exactly as it would be signed; nothing signed until confirmed.
   * As yourself only: a card speaks for its signer.
   */
  async prepareCard(a: { spec: string; title: string; summary?: string; releases?: string[]; vectors?: string[]; discussion?: string }): Promise<Review> {
    const { me, s, book } = await this.ctx();
    if ((await this.acting(me, s)).kind === 'collective') throw new Error('A card is signed as yourself: choose yourself in the identity panel.');
    const hash = readHash(a.spec, 'The specification');
    const found = await this.specFound(hash, s, book);
    const newThread = a.discussion === 'new';
    const fields: CardFields = {
      spec: hash,
      title: a.title,
      summary: a.summary?.trim() || null,
      releases: (a.releases ?? []).map((r) => readActId(r.trim())),
      vectors: (a.vectors ?? []).map((v) => (/^https:\/\//.test(v.trim()) ? v.trim() : readActId(v.trim()))),
      discussion: newThread || !a.discussion?.trim() ? null : readActId(a.discussion.trim()),
    };
    const blocking: string[] = [];
    let text = '';
    try {
      text = cardText({ ...fields, discussion: newThread ? '0'.repeat(64) : fields.discussion });
    } catch (e) {
      blocking.push(message(e).replace(/ Nothing was signed\.$/, ''));
    }
    if (!s.relays.length) blocking.push('Name at least one relay its acts go to, in the identity panel, Relays.');
    const core = !!builtIn(hash);
    const creators = !core && (found.creator === me.id || (found.creator === null && book.specs.some((x) => x.hash === hash)));
    const shown = newThread ? text.replace(`Discussion: ${actForm('0'.repeat(64))}`, 'Discussion: (the thread signed just before it)') : text;
    const digest = sha256(new TextEncoder().encode(`MOR Ummia specification card, version 1\n${me.id}\n${newThread ? 'with a new thread\n' : ''}${text}\n${s.relays.join('\n')}`));
    const plan = this.plan(me.id, {
      digest,
      blocking,
      run: async () => {
        const acts: string[] = [];
        const lines: Line[] = [];
        try {
          if (newThread) {
            const d = await publishDiscussion(me, { title: fields.title, spec: hash, publication: found.publication, relays: s.relays, find: s.track, via: s.via });
            fields.discussion = d.id;
            acts.push(d.id);
            lines.push({ text: `A discussion thread is published, naming it: ${actForm(d.id)}. Replies to it come from Dub, or from Discuss here.`, tone: 'ok' });
          }
          const c = await publishCard(me, fields, { publication: found.publication, relays: s.relays, find: s.track, via: s.via });
          acts.push(c.id);
          lines.push({ text: `Its card is published: ${actForm(c.id)}, a plain post every app shows.`, tone: 'ok' });
          const b: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
          b.cards = [...(b.cards ?? []), { id: c.id, spec: hash, title: fields.title, at: now() }];
          if (newThread) b.discussions = [...(b.discussions ?? []), { id: fields.discussion!, spec: hash, title: fields.title, at: now() }];
          await this.saveBook(me.id, b);
        } finally {
          await this.store.saveIdentity(me);
        }
        lines.push(creators ? { text: 'Signed by its creator: the latest card in your own sequence is the one that counts; a later card replaces this one.', tone: 'ok' } : { text: 'You are not its creator: your card is shown as your word, never as the specification’s own.', tone: 'warn' });
        return { title: `The card of “${fields.title}” is published`, acts, hash, lines };
      },
    });
    return {
      plan,
      digest,
      hash,
      title: `Sign the card of “${found.name}”`,
      summary: [
        creators ? 'You are its creator: this card speaks for it until you sign a later one.' : core ? 'One of the core’s texts: it names no creator, so your card is shown as your word, never as the text’s own.' : 'You are not its creator: this card is shown as your word, beside its creator’s.',
        'A plain post, public, signed by you, readable by every app (Dub shows it as a post). It changes nothing in the specification.',
        'Nothing is signed until you press Sign and publish.',
      ],
      sections: [
        { heading: 'The card, exactly as it is signed', lines: shown.split('\n').map((t) => ({ text: t })) },
        ...(newThread ? [{ heading: 'Signed just before it', lines: [{ text: `A discussion thread: “Discussion of ${fields.title.trim()}”, naming the specification${found.publication ? ' (its publication, with its signer)' : ''}.` }] }] : []),
        { heading: 'Where it goes', lines: [{ text: s.relays.join(', ') || '(no relay yet)' }] },
      ],
      blocking,
    };
  }

  /** The cards and threads signed here, newest first (Publish › Published here). */
  async publishedHere(): Promise<{ specs: Published[]; cards: NonNullable<Book['cards']>; discussions: NonNullable<Book['discussions']>; limits: typeof LIMITS }> {
    const { book } = await this.ctx();
    return { specs: [...book.specs].reverse(), cards: [...(book.cards ?? [])].reverse(), discussions: [...(book.discussions ?? [])].reverse(), limits: LIMITS };
  }

  // ------------------------------------------------------------ Discuss: discussions, a reply as a signed document

  /** The discussion threads started here, and the MIP drafts published, each with its replies. */
  async discussions(): Promise<{ threads: { id: string; title: string; spec: string | null; kind: 'thread' | 'draft'; replies: { id: string; signer: string; text: string; standing: string; mine: boolean }[] }[]; lines: Line[] }> {
    const { me, s, book } = await this.ctx();
    const threads = [
      ...(book.discussions ?? []).map((d) => ({ id: d.id, title: `Discussion of ${d.title}`, spec: d.spec, kind: 'thread' as const })),
      ...book.mips.flatMap((m) => m.drafts.map((d, i) => ({ id: d.id, title: `${m.title}, draft ${i + 1}`, spec: null, kind: 'draft' as const }))),
    ];
    if (!threads.length) return { threads: [], lines: [] };
    const r = await mipReplies(me, threads.map((t) => t.id), [...new Set([...s.relays, ...s.track])], s.via);
    // A card naming the thread is not a reply to it: it shows on the specification's page.
    return { threads: threads.map((t) => ({ ...t, replies: (r.replies.get(t.id) ?? []).filter((x) => !readCardText(x.text)).map((x) => ({ ...x, mine: x.signer === me.id })) })), lines: r.lines };
  }

  /** A reply as a signed document (decided on the mockups: "Reply, as a signed document"): a long-form text act naming the act it answers. */
  reply(a: { to: string; text: string }): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      if ((await this.acting(me, s)).kind === 'collective') throw new Error('A reply is signed as yourself: choose yourself in the identity panel.');
      const text = a.text.trim();
      if (!text) throw new Error('Write the reply first. Nothing was signed.');
      if (!s.relays.length) throw new Error('Name at least one relay its acts go to, in the identity panel, Relays. Nothing was signed.');
      const to = readActId(a.to);
      let ref;
      let author: string;
      try {
        const r = await referTo(to, [...new Set([...s.relays, ...s.track])], s.via);
        ref = r.ref;
        author = r.signer;
      } catch {
        throw new Error('The act it answers was not found on your relays: a reply names only an act held. Nothing was signed.');
      }
      let id: string;
      try {
        for (const hint of s.relays) for (const c of me.chainActs()) await relayAt(hint, s.via).putAct(c).catch(() => undefined);
        const made = await me.publish(LONGFORM_SPECS.text, LONGFORM_TEXT_ACT, longformPayload(text), { public: true, relays: s.relays, refs: [ref] });
        id = made.id;
        // A copy left in the inbox of whoever wrote what it answers, so their app finds it (as Dub's replies are).
        if (author !== me.id) {
          const l = await lookUp(author, [...s.relays, ...s.track], s.via).catch(() => null);
          const inbox = l?.inbox(SPECS.text) ?? [];
          if (inbox.length) await leaveInInbox(me, made.act, inbox).catch(() => undefined);
        }
      } finally {
        await this.store.saveIdentity(me);
      }
      book.replies = [...(book.replies ?? []), { id, to, at: now() }];
      await this.saveBook(me.id, book);
      return { title: 'Your reply is published', acts: [id], lines: [{ text: `A signed document, public, answering ${actForm(to)}: ${actForm(id)}.`, tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ the act menu: Rely on it (in every app, decided)

  /**
   * Rely on an act shown: the witness act (Identity type 15) signed once
   * RELY is typed, as everywhere, its key checked first (H80); through
   * Kišib's panel where the identity is used through it. It keeps that act
   * visible as disputed should its author ever disown it.
   */
  rely(a: { id: string; typed: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (a.typed.trim() !== 'RELY') throw new Error('Type RELY to sign the witness act. Nothing was signed.');
      const id = readActId(a.id);
      if (me.f.sequence.includes(id)) throw new Error('It is this identity’s own act: a witness act names other identities’ acts. Nothing was signed.');
      await this.current(me);
      let made;
      try {
        made = await me.witness([id], { shown: WITNESS_EXPLANATION, relays: s.relays });
      } finally {
        await this.store.saveIdentity(me);
      }
      if (!made.sent.some((x) => x.result)) throw new Error(`No home took the witness act: ${made.sent.map((x) => `${x.home}: ${x.error}`).join('; ')}. It is signed here, not published.`);
      return { lines: [{ text: `You rely on ${short(id)}: witness act ${short(made.id)}, public at this identity’s homes and relays. It keeps that act visible as disputed should its author ever disown it.`, tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ an identity used through Kišib (the Dubsar runner cMIP)

  private runner(): RunnerLink {
    if (!this.opts.runner) throw new Error('Kišib’s runner is in the computer’s program only, never the web client: bring the identity with its signing key’s words instead.');
    return this.opts.runner;
  }

  /** Where the pairing with Kišib stands, and the identities it lets Ummia use. */
  async runnerState(): Promise<{ available: boolean; origin: string | null; state: string | null; code: string | null; identities: { id: string; form: string; name: string | null; held: boolean }[]; problem: string | null }> {
    if (!this.opts.runner) return { available: false, origin: null, state: null, code: null, identities: [], problem: null };
    const held = await this.store.held();
    try {
      const p = await this.opts.runner.paired();
      return { available: true, origin: this.opts.runner.origin(), state: p?.state ?? null, code: p?.code ?? null, identities: (p?.identities ?? []).map((x) => ({ id: x.id, form: idForm(x.id), name: x.name, held: held.includes(x.id) })), problem: null };
    } catch (e) {
      return { available: true, origin: this.opts.runner.origin(), state: null, code: this.opts.runner.code(), identities: [], problem: message(e) };
    }
  }

  runnerPair(): Promise<{ code: string }> {
    return this.runner().pair();
  }

  /** Use an identity Kišib's runner holds and lets Ummia use: no key of it kept here; every act shows Kišib's panel inside Ummia's window. */
  runnerTake(a: { id: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const p = await this.runner().paired();
      if (!p || p.state !== 'approved') throw new Error(p?.state === 'waiting' ? 'Kišib has not approved Ummia yet: approve it in Kišib (Runner, Apps), comparing the code.' : 'Ummia is not paired with Kišib’s runner: pair it first.');
      const k = p.identities.find((x) => x.id === a.id);
      if (!k) throw new Error('Kišib does not let Ummia use this identity: choose it for Ummia in Kišib (Runner, Apps).');
      if ((await this.store.held()).includes(k.id)) {
        await this.store.setActive(k.id);
        return { lines: [{ text: 'Ummia already uses this identity: it is the one in use now.', tone: 'ok' }] };
      }
      const look = await lookUp(k.id, k.homes, {});
      const r = look.resolution;
      if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): Ummia cannot use it until they agree.');
      const binding = r.links[r.links.length - 1];
      if (!r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY);
      const chain = await servedChain(k.id, r.homes, {});
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : r.homes.map((h) => h.hint);
      const f: IdentityFile = {
        label: TEST_LABEL,
        identity: k.id,
        position: binding.position,
        binding: binding.act,
        // No key of it is held here: Kišib's runner signs (the Dubsar runner cMIP, 3.2).
        signingSecret: '',
        safety: { scheme: 0, seeds: '' },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null,
      };
      await this.store.write(k.id, 'settings', { relays, track: relays, reports: null, via: {}, acting: k.id } satisfies Settings);
      await this.store.saveIdentity(new TestIdentity(f, {}));
      await this.store.setActive(k.id);
      return {
        lines: [
          { text: `Ummia uses ${k.name ?? short(k.id)} through Kišib’s runner: Kišib holds its signing key, Ummia none. Every act is shown by Kišib, in its panel here, before it is signed.`, tone: 'ok' },
          { text: RUNNER_HOLDS_SAY, tone: 'warn' },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
  }

  /** The request waiting for the person now, for the page to draw Kišib's panel. Not serial: it is asked while an act waits. */
  async runnerAsking(): Promise<{ asking: { request: string; panel: string; title: string } | null; origin: string | null }> {
    const r = this.opts.runner;
    return { asking: r?.asking ?? null, origin: r?.origin() ?? null };
  }

  async runnerDrop(a: { request: string }): Promise<void> {
    this.opts.runner?.drop(a.request);
  }

  async runnerUnpair(): Promise<void> {
    await this.runner().unpair();
  }
}
