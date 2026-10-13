// What Dub does: one identity, made here or brought here, and its
// posts. Making an identity is the genesis client's code; bringing one is
// the identity carry Module (modules/module-identity-carry-words-draft-1.md);
// posting, reading back and withdrawing are the barebone client's code.
// Every act is made and judged by the core library.
//
// The same code runs in two places: in Dub's program on the Mac, its keys in
// a folder (`store.ts`), and in Dub's web client, in the browser, its
// signing key in the browser's storage (`web/keep.ts`). The web client makes
// an identity differently (F281): its chain key is shown once as words and
// never kept (`chainwords.ts`).
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { base64, describeAct, hex, signingPublic, unhex } from '../../genesis/src/core.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { TestIdentity, TEST_LABEL, type Home, type IdentityFile } from '../../genesis/src/identity.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { listPosts, post, readPost, withdraw, type ShownPicture } from '../../barebone/src/post.ts';
import { renderPost } from '../../barebone/src/html.ts';
import { escapeHtml } from '../../longform/src/html.ts';
import { compose } from '../../longform/src/text.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { Refused, fromWords, groupId, readId, threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { newChainKey } from './chainwords.ts';

/** Said on the first screen (asked by Nobody, allegedly). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Said where the words are shown (the carry Module, 3.2). */
export const WORDS_SAY = [
  'Write these 24 words on paper, in order, and keep the paper safe. They are shown once.',
  'Whoever holds these words can post as this identity. They are its signing key; the chain key is not in them.',
  'Type them into another app to post from there as the same identity. They stop working when the signing key is changed.',
  'They are not a Bitcoin wallet. Never type them into one.',
];

/** Said where the web client shows a new identity's chain key, once (F281; the words seed Module). */
export const CHAIN_WORDS_SAY = [
  'Write these 24 words on paper, in order, and keep the paper away from anything that goes online. They are shown once: neither this page nor this browser keeps them.',
  'They are this identity’s chain key: the only way to change its signing key if it is ever stolen or lost. Without them, the identity can never change its key.',
  'They are the chain-key seed words Module’s backup: the air-gapped chain key Module restores the chain key from them. Never type them into this page, or into any device that goes online.',
  'They are not a Bitcoin wallet. Never type them into one.',
];

/** Said where the web client shows the identity's carry words, on request (the carry Module, 3.2 and 5.1). */
export const CARRY_SAY = [
  'These 24 words and the ID carry this identity to Dub on a computer, or to another device: choose “Bring an identity you have” there.',
  'Whoever holds these words can post as this identity. They are its signing key; the chain key is not in them.',
  'Write them on paper; they are the way out of this browser if its storage is lost. They stop working when the signing key is changed.',
  'Each place you bring them keeps its own line of acts. A change of the signing key must keep every line, or that line’s posts become void.',
  'They are not a Bitcoin wallet. Never type them into one.',
];

/** Said where an identity is brought in (the carry Module, 5.1, and Identity rule 17). */
export const LINE_SAY =
  'This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, on the device that holds it), that change must keep this line, or every post made here becomes void. The client making the change reads this line from the homes and relays and keeps it, unless you leave it out; if it cannot read it, give it this line’s latest act, position and summary, shown on this app’s card.';

/** Said where the words do not give the current key (the carry Module, costs). */
const NOT_CURRENT =
  'These words do not give this identity’s current signing key: they are another identity’s, an earlier key’s, or written wrong. Nothing was kept. If these are your chain key’s words, they must never be typed into an online device.';

export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
}

/** What Dub keeps: made here (with or without its chain key) or brought here, and where its posts go. */
export interface Settings {
  /** Made here (the chain key held in this folder, or, in the web client, shown once and not kept) or brought here (no chain key). */
  kind: 'made' | 'brought';
  relays: string[];
  via: Via;
}

/** A new identity whose words were shown, until three are typed back. Nothing of it is published yet. */
export interface Pending {
  identity: IdentityFile;
  /** The three positions (1 to 24) to type back. */
  positions: number[];
  relays: string[];
  via: Via;
  /** The web client only: the chain-key seed whose words were shown. Never stored (`web/keep.ts` holds a pending identity in memory). */
  chainSeed?: string;
}

/**
 * Where Dub keeps the identity: a folder on the Mac (`store.ts`) or the
 * browser's storage (`web/keep.ts`). `exclusive` runs one signer at a time,
 * across every page or program holding the same keep: a sequence must never
 * be signed twice at one position.
 */
export interface Keep {
  identity(): Promise<TestIdentity | null>;
  saveIdentity(id: TestIdentity): Promise<void>;
  settings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;
  pending(): Promise<Pending | null>;
  savePending(p: Pending): Promise<void>;
  dropPending(): Promise<void>;
  exclusive<T>(f: () => Promise<T>): Promise<T>;
}

/** What the page is told. Never a key or a word, except `words` once. */
export interface State {
  stage: 'doors' | 'confirm' | 'ready';
  /** While a new identity waits for three words typed back. */
  confirm?: { positions: number[]; id: string };
  identity?: {
    id: string;
    grouped: string;
    kind: 'made' | 'brought';
    /** Where its chain key is: in this app's folder, shown once and kept nowhere here (the web client), or elsewhere. */
    chainKey: 'held' | 'shown' | 'elsewhere';
    homes: string[];
    relays: string[];
    line: { acts: number; latest: string | null; summary: string | null };
  };
}

export interface Shown {
  id: string;
  html: string;
  /** Pictures of this identity's own, shown, that can be withdrawn. */
  withdrawable: string[];
}

const list = (xs: string[]) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];

/** A whole number below `n`, from the platform's secure random source (Node 22 and browsers alike). */
export function randomBelow(n: number): number {
  const limit = Math.floor(0x100000000 / n) * n;
  const x = new Uint32Array(1);
  do crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}

export class Dub {
  private queue: Promise<unknown> = Promise.resolve();

  /** `web`: Dub's web client (F281): a new identity's chain key is shown once as words and never kept. */
  constructor(
    readonly store: Keep,
    readonly opts: { web?: boolean } = {},
  ) {}

  /** One thing at a time: a sequence must never be signed twice at once. */
  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => undefined);
    return next;
  }

  async state(): Promise<State> {
    const me = await this.store.identity();
    if (me) {
      const s = await this.store.settings();
      // F152: this app's own line, as the rotating client reads it (`lines.ts`).
      const own = ownLine(me.f.sequence);
      return {
        stage: 'ready',
        identity: {
          id: me.id,
          grouped: groupId(me.id),
          kind: s.kind,
          chainKey: s.kind === 'brought' ? 'elsewhere' : me.f.safety.seeds ? 'held' : 'shown',
          homes: me.f.homes.map((h) => h.hint),
          relays: s.relays,
          line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null },
        },
      };
    }
    const p = await this.store.pending();
    if (p) return { stage: 'confirm', confirm: { positions: p.positions, id: p.identity.identity } };
    return { stage: 'doors' };
  }

  private async me(): Promise<TestIdentity> {
    const me = await this.store.identity();
    if (!me) throw new Error('No identity yet: make one, or bring one.');
    return me;
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
        throw new Error(`${hint} did not answer: ${e instanceof Error ? e.message : e}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      out.push({ operator: hex(op), hint });
    }
    return out;
  }

  // ------------------------------------------------------------ door 1: a new identity

  /**
   * Make a new identity with the genesis client's code, and show its words
   * once: on the Mac, its signing seed's (the chain key kept in the folder);
   * in the web client, its chain key's, which nothing keeps (F281). Nothing
   * is published until three of the words are typed back (`confirm`).
   * Starting again forgets the last one.
   */
  async begin(a: { homes: string[]; relays: string[]; via?: Via }): Promise<{ words: string[]; positions: number[]; say: string[] }> {
    if (await this.store.identity()) throw new Error('This app already holds an identity.');
    const via = a.via ?? {};
    const hints = list(a.homes);
    if (!hints.length) throw new Error('Give at least one home address: where the identity lives, and anyone can check it.');
    const homes = await this.homes(hints, via);
    const relays = list(a.relays);
    for (const r of relays) if (!/^https?:\/\//.test(r)) throw new Error(`“${r}”: an address starts with https:// (or http://)`);
    const positions = threePositions(randomBelow);
    if (this.opts.web) {
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
    const id = TestIdentity.create({ homes, via, scheme: 3 });
    const words = toWords(unhex(id.f.signingSecret));
    await this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via });
    return { words, positions, say: WORDS_SAY };
  }

  /** Forget a new identity before it was published. */
  async abandon(): Promise<void> {
    await this.store.dropPending();
  }

  /**
   * The three words typed back. Refused, with nothing published, unless
   * each is the word at its position. Then the genesis goes to the homes,
   * the routes name the relays, and the identity is this app's.
   */
  confirm(typed: string[]): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const p = await this.store.pending();
      if (!p) throw new Error('No new identity is waiting.');
      const words = toWords(unhex(p.chainSeed ?? p.identity.signingSecret));
      if (!typedBack(words, p.positions, typed)) {
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
      await this.store.saveSettings({ kind: 'made', relays: p.relays, via: p.via });
      await this.store.saveIdentity(id);
      // The web client's chain-key seed goes with the pending identity: from here, nothing holds it but the paper.
      await this.store.dropPending();
      await id.publishRoutes([{ scope: null, hints: p.relays, kind: 0 }]);
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
      lines.push({ text: `Its posts are published at ${p.relays.join(', ')}.` });
      return { lines };
    });
  }

  // ------------------------------------------------------------ door 2: an identity made elsewhere

  /**
   * Bring an identity made elsewhere (the carry Module, section 4): read its
   * chain from its homes, starting at `address`, and keep it only if the
   * words give its current signing key. Relays are asked for only where
   * its routes name none. This app starts its own line.
   */
  bring(a: { id: string; words: string; address: string; relays?: string[]; via?: Via }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      if (await this.store.identity()) throw new Error('This app already holds an identity.');
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
      let pub: Uint8Array;
      try {
        pub = signingPublic(seed);
      } catch {
        throw new Error('The words do not hold a signing key. Nothing was kept.');
      }
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error('Give an address where this identity is found (one of its homes), starting with https://.');
      let look: Lookup;
      try {
        look = await lookUp(id, [address], via);
      } catch (e) {
        throw new Error(`This identity was not found at ${address}: ${e instanceof Error ? e.message : e}`);
      }
      const r = look.resolution;
      if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing can be signed for it until they agree.');
      if (r.stop === 'pending' || r.waiting.length) throw new Error('A change of its keys is waiting for its homes: bring it once that change counts, with the new words.');
      if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
      if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
      const binding = r.links[r.links.length - 1];
      // The chain acts, as its homes serve them, to carry along with posts.
      let chain: Uint8Array[] = [];
      for (const h of r.homes) {
        try {
          chain = (await relayAt(h.hint, via).identity(id)).chain;
          if (chain.length) break;
        } catch {
          // the next home
        }
      }
      if (!chain.length) throw new Error('None of its homes served its chain.');
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) {
        throw new Error('This identity names no relays for its posts. Give one or more relay addresses, and bring it again.');
      }
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
        encryption: [],
        pending: null,
      };
      await this.store.saveSettings({ kind: 'brought', relays, via });
      await this.store.saveIdentity(new TestIdentity(f, via));
      return {
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          { text: named.length ? `Its posts are published at the relays it names: ${relays.join(', ')}.` : `It names no relays: its posts are published at ${relays.join(', ')}.` },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
  }

  /**
   * The identity's ID and carry words (the carry Module), on request: the
   * way out of the web client, to Dub on a computer or another device.
   */
  async carry(): Promise<{ id: string; grouped: string; words: string[]; say: string[] }> {
    const me = await this.me();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)), say: CARRY_SAY };
  }

  // ------------------------------------------------------------ posting

  /**
   * Refuse to sign once a rotation counts that this app did not make: the
   * key it holds is spent (the carry Module, 4.5; Identity rule 17).
   */
  private async current(me: TestIdentity): Promise<void> {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing was signed.');
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) {
      throw new Error('This identity’s signing key was changed elsewhere, so the key this app holds no longer counts. Nothing was signed. To post from here again, bring the identity again with its new words.');
    }
  }

  /** Post a text, with a JPEG if one is given, then read it back from the relays, verified. */
  post(a: { text: string; jpeg?: Uint8Array }): Promise<{ post: Shown; lines: Line[] }> {
    return this.serial(async () => {
      const me = await this.me();
      const { text, changes } = compose(a.text);
      if (!text.trim()) throw new Error('Write something to post.');
      await this.current(me);
      const relays = (await this.store.settings()).relays;
      let made;
      try {
        made = await post(me, { text, jpeg: a.jpeg, relays });
      } finally {
        // The sequence grew, even if a relay was away: never sign the same position twice.
        await this.store.saveIdentity(me);
      }
      const lines: Line[] = changes.map((c) => ({ text: `Text: ${c}.` }));
      if (made.picture) {
        lines.push({
          text: made.picture.removed.length
            ? `Taken out of the picture before publishing: ${made.picture.removed.map((c) => CARRIED_WORDS[c]).join('; ')}.`
            : 'The picture carried nothing to take out.',
          tone: 'ok',
        });
      }
      return { post: await this.show(made.id), lines };
    });
  }

  /** A post as the barebone client's reader shows it: fetched from the relays and verified. */
  async show(id: string): Promise<Shown> {
    const me = await this.me();
    const s = await this.store.settings();
    const p = await readPost(id, s.relays, s.via);
    const withdrawable = p.refs
      .filter((r): r is ShownPicture => r.kind === 'picture')
      .filter((r) => r.signer === me.id && !r.withdrawn && r.standing === 'valid')
      .map((r) => r.publication);
    return { id, html: renderPost(p), withdrawable };
  }

  /** This identity's posts at its relays, from every line, newest first. */
  async posts(limit = 20): Promise<Shown[]> {
    const me = await this.me();
    const s = await this.store.settings();
    const ids: string[] = [];
    for (const r of s.relays) {
      try {
        for (const id of await listPosts(me.id, r, s.via)) if (!ids.includes(id)) ids.push(id);
      } catch {
        // that relay is away: the others may hold them
      }
    }
    const out: Shown[] = [];
    for (const id of ids.reverse().slice(0, limit)) {
      try {
        out.push(await this.show(id));
      } catch (e) {
        out.push({ id, html: `<p class="small">Post ${id.slice(0, 12)}… could not be read: ${escapeHtml(String(e instanceof Error ? e.message : e))}</p>`, withdrawable: [] });
      }
    }
    return out;
  }

  /** Withdraw a picture this identity published (Envelopes, "Withdrawal"): readers stop showing it; the post stands. */
  withdraw(publication: string): Promise<{ id: string }> {
    return this.serial(async () => {
      const me = await this.me();
      const s = await this.store.settings();
      if (!/^[0-9a-f]{64}$/.test(publication)) throw new Error('not a publication id');
      const act = await (async () => {
        for (const r of s.relays) {
          try {
            const a = await relayAt(r, s.via).getAct(publication);
            if (a) return a;
          } catch {
            // the next
          }
        }
        return null;
      })();
      if (!act) throw new Error('That picture was not found at the relays.');
      if ((describeAct(act) as { signer?: string }).signer !== me.id) throw new Error('That picture was published by another identity: only its signer can withdraw it.');
      await this.current(me);
      try {
        return await withdraw(me, publication, s.relays);
      } finally {
        await this.store.saveIdentity(me);
      }
    });
  }
}
