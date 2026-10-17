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

import { IDENTITY_TYPES, MIRS, SPECS, base64, cborDecode, cborEncode, describeAct, hex, openSealed, shareOnPaper, signingPublic, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { TestIdentity, TEST_LABEL, sealFor, type Home, type IdentityFile } from '../../genesis/src/identity.ts';
import { followRef, lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, sealedId, type Via } from '../../genesis/src/transport.ts';
import { Judge, leaveInInbox, post, readPost, textPayload, withdraw, type ShownPicture, type ShownPost } from '../../barebone/src/post.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT, WITHDRAWAL } from '../../barebone/src/specs.ts';
import { readFeed, type FeedPost } from '../../site/src/feed.ts';
import { makeLink } from '../../reader/src/link.ts';
import { compose } from '../../longform/src/text.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { Refused, encryptionSecret, fromWords, groupId, readId, threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { newChainKey } from './chainwords.ts';
import { readMessage, acceptanceText, negotiate, openShare, DECLINED } from '../../repo/src/proposals.ts';
import { sign as signAct } from '../../repo/src/agreements.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { fetchAct, readProposal, SHARE_SAY, SIGNING_OFF_SAY, SIGNING_SAY } from './signing.ts';
import { carriedKey, lookCurrent, servedChain } from './carryin.ts';
import { NAME, NAME_WITHDRAWAL, namePayload, namesOf, readName } from './names.ts';
import { FOLLOW_LIST, NO_PEOPLE, PEOPLE_SPEC, PEOPLE_SPEC_1, PUBLISH_WARNING, SEALED_LIST, followListPayload, readFollowList, readSealedList, sealedListPayload, type Followed, type Kept, type People } from './people.ts';
import type { Held, Item, Line, Message, Pic, Proposal, ShareShown, State, Who } from './shapes.ts';
import { sendDraft } from '../../damgar/src/messages.ts';
import { UNITS_MODULES, readValue } from '../../damgar/src/units.ts';
import { authorityOfId } from '../../grants/src/grant.ts';
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
  /** The Signing tab (H18): off by default (F59), turned on in the identity window. */
  signing?: boolean;
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
  constructor(
    readonly store: Keep,
    readonly opts: { web?: boolean; reader?: string } = {},
  ) {}

  /** One thing at a time: a sequence must never be signed twice at once. */
  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => undefined);
    return next;
  }

  // ------------------------------------------------------------ who is who

  private whoFrom(id: string, me: string | null, p: People | null): Who {
    const f = p?.follows.find((x) => x.id === id);
    return {
      id,
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
      };
    }
    return out;
  }

  private async ctx(): Promise<{ me: TestIdentity; s: Settings; p: People; hints: string[] }> {
    const active = await this.store.active();
    const me = active ? await this.store.identity(active) : null;
    if (!me) throw new Error('No identity in use: make one, or bring one, in the identity window.');
    const s = await this.store.settings(me.id);
    const p = await this.store.people(me.id);
    return { me, s, p, hints: [...new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])] };
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
  post(a: { text: string; jpeg?: Uint8Array; to?: string; reply?: { id: string; signer: string } }): Promise<{ post: Item; lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { text, changes } = compose(a.text);
      if (!text.trim()) throw new Error('Write something to post.');
      const to: { id: string; inbox: string[] | null; why?: string }[] = [];
      if (a.to?.trim()) {
        let id: string;
        try {
          id = readId(a.to);
        } catch (e) {
          throw new Error(`To: ${message(e)}. Nothing was posted.`);
        }
        if (id === me.id) throw new Error('To: that is this identity itself. Nothing was posted.');
        let inbox: string[] | null;
        try {
          inbox = (await lookUp(id, hints, s.via)).inbox(SPECS.text);
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
      const made = await this.signed(me, () => post(me, { text, jpeg: a.jpeg, relays: s.relays, to: to.length ? to.map((t) => t.id) : undefined, refs }));
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
      const shown = await readPost(made.id, hints, s.via);
      return { post: this.item(shown, me.id, p, s, 'feed', [], false), lines };
    });
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
    const doc =
      isLongForm(sp.format)
        ? { title: titleOf(sp.text), link: makeLink(this.opts.reader ?? READER, sp.id, s.relays.filter((r) => /^https:\/\//.test(r))) }
        : null;
    return {
      id: sp.id,
      who: this.whoFrom(sp.signer, me, p),
      standing: sp.standing,
      text: doc ? '' : sp.text,
      doc,
      pictures,
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
  async feed(fresh = false): Promise<{ items: Item[]; more: number; problems: string[]; notes: string[]; followsChanged: boolean }> {
    const { notes, changed: followsChanged } = await this.refreshFollows(fresh);
    const { me, s, p, hints } = await this.ctx();
    const authors = [me.id, ...p.follows.map((f) => f.id).filter((id) => !p.muted.includes(id))].map((identity) => ({ identity, name: null }));
    const feed = await readFeed(authors, hints, s.via);
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
      items.push({ ...this.item(fp.post, me.id, p, s, 'feed', fp.corrects ? answers.filter((x) => x.id !== fp.corrects) : answers, toMe), corrects: fp.corrects ?? null, correctedBy: fp.correctedBy ?? [] });
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
    return { items, more: feed.more, problems, notes, followsChanged };
  }

  private unread(fp: FeedPost, me: string, p: People): Item {
    return { id: fp.id, who: this.whoFrom(fp.signer, me, p), standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'feed', problem: fp.problem, seen: true };
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
  async relay(max = 30): Promise<{ items: Item[]; hidden: number; problems: string[] }> {
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
    const picked: { d: Described; hint: string }[] = [];
    for (const x of order) {
      const d = describeAct(x.act) as Described;
      if (p.muted.includes(d.signer ?? d.id)) {
        hidden++;
        continue;
      }
      if (picked.length < max) picked.push({ d, hint: x.hint });
    }
    await this.warm(picked.map((x) => x.d.signer ?? x.d.id), hints, s.via);
    const judge = new Judge([...new Set([...s.relays, ...hints])], s.via);
    const items: Item[] = [];
    for (const { d, hint } of picked) {
      // A genesis carries no signer: the identity it makes is its own id.
      const who = this.whoFrom(d.signer ?? d.id, me.id, p);
      if (d.spec === POST_SPECS.text && d.type === TEXT_ACT && d.signer) {
        try {
          const shown = await readPost(d.id, [hint, ...s.relays, ...hints], s.via, judge);
          items.push({ ...this.item(shown, me.id, p, s, 'relay', [], false), what: null });
          continue;
        } catch (e) {
          items.push({ id: d.id, who, standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'relay', problem: message(e), seen: true, what: 'A post' });
          continue;
        }
      }
      items.push({ id: d.id, who, standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'relay', problem: null, seen: true, what: whatAct(d) });
    }
    return { items, hidden, problems };
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
    if (isText) {
      const t = (cborDecode(d.payload!) as Map<number, unknown>).get(0);
      if (typeof t === 'string') text = t;
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
      const messages: Message[] = [
        ...shown
          .filter((k) => k.kind === 'private' || (k.kind === 'other' && k.key.startsWith('sealed:')))
          .map((k) => ({
            key: k.key,
            who: k.from ? this.whoFrom(k.from, me.id, p) : { id: '', short: 'unknown', names: [], pet: null, me: false, followed: false, muted: false },
            dir: 'in' as const,
            text: k.text ?? '',
            standing: k.standing,
            at: k.found,
            seen: p.seen.includes(k.key),
            problem: k.problem ?? (k.standing === 'valid' ? null : `not verified: ${k.standing}`),
          })),
        ...p.sent.map((x) => ({ key: x.id, who: this.whoFrom(x.to, me.id, p), dir: 'out' as const, text: x.text, standing: 'valid', at: x.at, seen: true, problem: null })),
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
  message(a: { to: string; text: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      let to: string;
      try {
        to = readId(a.to);
      } catch (e) {
        throw new Error(`To: ${message(e)}. Nothing was sent.`);
      }
      if (to === me.id) throw new Error('To: that is this identity itself. Nothing was sent.');
      const { text } = compose(a.text);
      if (!text.trim()) throw new Error('Write something to send.');
      let l: Lookup;
      try {
        l = await lookUp(to, hints, s.via);
      } catch (e) {
        throw new Error(`To: the identity ${fingerprint(to)} was not found: ${message(e)}. Nothing was sent.`);
      }
      if (!l.encryptionKey) throw new Error(`To: the identity ${fingerprint(to)} has published no encryption key, so nothing can be sealed to it. Nothing was sent.`);
      const inbox = l.inbox(SPECS.text);
      if (!inbox?.length) throw new Error(`To: the identity ${fingerprint(to)} declares no inbox. Nothing was sent.`);
      await this.current(me);
      const made = await this.signed(me, async () => me.sign(SPECS.text, TEXT_ACT, textPayload(text), { public: false, to: [to] }));
      const sealed = sealFor(made.act, made.key, [{ id: to, key: l.encryptionKey }]);
      const lines: Line[] = [];
      let left = 0;
      for (const h of inbox) {
        try {
          await relayAt(h, s.via).putSealed(sealed);
          left++;
        } catch (e) {
          lines.push({ text: `${h} did not take it: ${message(e)}`, tone: 'warn' });
        }
      }
      if (!left) throw new Error(`No inbox of ${fingerprint(to)} took the message: ${lines.map((x) => x.text).join('; ')}. It is signed, not delivered.`);
      for (const h of me.f.homes) {
        try {
          await relayAt(h.hint, s.via).putAct(made.act);
        } catch {
          // a home may decline a private act: the line is then read by its card
        }
      }
      p.sent.push({ id: made.id, to, text, at: now() });
      await this.store.savePeople(me.id, p);
      lines.unshift({ text: `Sealed to ${fingerprint(to)} and left in its inbox: only it can open it.`, tone: 'ok' });
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
      const made = await this.signed(me, () => signAct(me, act, where));
      const lines: Line[] = [{ text: `Signed: your signature act ${made.id} is published at ${where.join(', ')}.`, tone: 'ok' }];
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
    const id = readId(a.id);
    const name = a.name?.trim() ? a.name.trim().slice(0, 64) : null;
    return this.people((p, me) => {
      if (id === me.id) throw new Error('That is this identity itself: its own posts are always in its feed.');
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
