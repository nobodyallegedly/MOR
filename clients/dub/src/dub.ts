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
// MOR Safety's (F332, amended), and when a rotation made there counts, Dub
// says so and takes the new signing key's words.
//
// The same code runs in two places: in Dub's program on the Mac, keeping
// things in a folder (`store.ts`), and in Dub's web client, in the browser
// (`web/keep.ts`). A `Keep` says where.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { SPECS, base64, cborDecode, cborEncode, describeAct, hex, openSealed, signingPublic, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { TestIdentity, TEST_LABEL, sealFor, type Home, type IdentityFile } from '../../genesis/src/identity.ts';
import { followRef, lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, sealedId, type Via } from '../../genesis/src/transport.ts';
import { leaveInInbox, post, readPost, textPayload, withdraw, type ShownPicture, type ShownPost } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { readFeed, type FeedPost } from '../../site/src/feed.ts';
import { makeLink } from '../../reader/src/link.ts';
import { compose } from '../../longform/src/text.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { Refused, encryptionSecret, fromWords, groupId, readId, threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { newChainKey } from './chainwords.ts';
import { NAME, NAME_WITHDRAWAL, namePayload, namesOf, readName } from './names.ts';
import { FOLLOW_LIST, NO_PEOPLE, PEOPLE_SPEC, PUBLISH_WARNING, followListPayload, readFollowList, type Kept, type People } from './people.ts';
import type { Held, Item, Line, Message, Pic, State, Who } from './shapes.ts';

export type { Line, State } from './shapes.ts';

/** Said on the first screen (asked by Nobody, allegedly). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Said where a new identity's chain key is shown, once (F332, amended; the words seed Module). */
export const CHAIN_WORDS_SAY = [
  'These are the chain key’s words. Write them on paper, in order, and keep the paper away from anything that goes online. They are shown once: Dub keeps nothing of the chain key.',
  'The chain key is the only way to change this identity’s signing key if it is ever stolen or lost. That is done by another app, MOR Safety, never by Dub. Lost paper means no change of keys, ever.',
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
  'This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, in MOR Safety), that change must keep this line, or every post made here becomes void. The app making the change reads this line from the homes and relays and keeps it, unless you leave it out; if it cannot read it, give it this line’s latest act, position and summary, shown in the identity window.';

/** Said when a rotation made elsewhere counts (F332, amended; the carry Module, draft 2, 4.6). Its first words are how the page knows it. */
export const SPENT_SAY =
  'This identity’s signing key was changed elsewhere, with its chain key, so the signing key’s words this app holds no longer count. Nothing was signed. Changing keys is MOR Safety’s work, not Dub’s. To go on here, give this app the new signing key’s words.';

/** Said where the words do not give the current key (the carry Module, costs). */
const NOT_CURRENT =
  'These words do not give this identity’s current signing key: they are another identity’s, an earlier key’s, or written wrong. Nothing was kept. If these are your chain key’s words, they must never be typed into an online app.';

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
}

/** A new identity whose chain key's words were shown, until three are typed back. Held in memory only: it carries the chain-key seed. */
export interface Pending {
  identity: IdentityFile;
  /** The three positions (1 to 24) to type back. */
  positions: number[];
  relays: string[];
  via: Via;
  /** The chain-key seed whose words were shown. Never stored. */
  chainSeed: string;
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
    const out: State = { stage: 'identity', held };
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
  async begin(a: { homes: string[]; relays: string[]; via?: Via }): Promise<{ words: string[]; positions: number[]; say: string[] }> {
    const via = a.via ?? {};
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
    await this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via, chainSeed: hex(seed) });
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

  /** Look an identity up, and refuse unless `seed` gives its current signing key (the carry Module, 4.2). */
  private async lookCurrent(id: string, seed: Uint8Array, hints: string[], via: Via): Promise<Lookup> {
    let pub: Uint8Array;
    try {
      pub = signingPublic(seed);
    } catch {
      throw new Error('The words do not hold a signing key. Nothing was kept.');
    }
    let look: Lookup;
    try {
      look = await lookUp(id, hints, via);
    } catch (e) {
      throw new Error(`This identity was not found at ${hints.join(', ')}: ${message(e)}`);
    }
    const r = look.resolution;
    if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing can be signed for it until they agree.');
    if (r.stop === 'pending' || r.waiting.length) throw new Error('A change of its keys is waiting for its homes: bring it once that change counts, with the new words.');
    if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
    if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
    return look;
  }

  /** The chain acts, as its homes serve them, to carry along with posts. */
  private async servedChain(id: string, homes: Home[], via: Via): Promise<Uint8Array[]> {
    for (const h of homes) {
      try {
        const chain = (await relayAt(h.hint, via).identity(id)).chain;
        if (chain.length) return chain;
      } catch {
        // the next home
      }
    }
    throw new Error('None of its homes served its chain.');
  }

  /** The identity's encryption key that counts, where the words carry it (the carry Module, draft 2, 2a.3); else null. */
  private carriedKey(look: Lookup, seed: Uint8Array): { version: number; act: string; secret: string } | null {
    const secret = encryptionSecret(seed);
    if (!look.encryptionKey || !look.encryptionKeyAct || hex(xwingPublic(secret)) !== hex(look.encryptionKey)) return null;
    return { version: this.keyVersion(look), act: look.encryptionKeyAct, secret: hex(secret) };
  }

  private keyVersion(look: Lookup): number {
    const e = (look.verifier as unknown as { latest(i: string, s: string, t: number): { payload?: Uint8Array } }).latest(look.resolution.identity, SPECS.envelopes, 4);
    return e.payload ? Number((cborDecode(e.payload) as Map<number, unknown>).get(0)) : 1;
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
      const { me, s, hints } = await this.ctx();
      const name = typed.trim() ? readName(typed) : null;
      await this.current(me);
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
    });
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
  private item(sp: ShownPost, me: string, p: People, s: Settings, via: 'feed' | 'inbox', answers: Item['answers'], toMe: boolean): Item {
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
      sp.format === POST_SPECS.longform
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
  async feed(): Promise<{ items: Item[]; more: number; problems: string[] }> {
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
      items.push(this.item(fp.post, me.id, p, s, 'feed', answers, toMe));
    }
    const problems = feed.authors.filter((a) => a.problem).map((a) => `${fingerprint(a.identity)}: ${a.problem}`);
    return { items, more: feed.more, problems };
  }

  private unread(fp: FeedPost, me: string, p: People): Item {
    return { id: fp.id, who: this.whoFrom(fp.signer, me, p), standing: 'unknown', text: '', doc: null, pictures: [], answers: [], toMe: false, via: 'feed', problem: fp.problem, seen: true };
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
    return {
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
      f(p, me);
      await this.store.savePeople(me.id, p);
      const lines: Line[] = [];
      if (p.list === 'published') lines.push(...(await this.publishList(me, s, p, false)));
      return { lines };
    });
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
