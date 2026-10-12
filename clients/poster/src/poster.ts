// What MOR Post does: one identity, made here or brought here, and its
// posts. Making an identity is the genesis client's code; bringing one is
// the identity carry Module (modules/module-identity-carry-words-draft-1.md);
// posting, reading back and withdrawing are the barebone client's code.
// Every act is made and judged by the core library.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { randomInt } from 'node:crypto';
import { describeAct, hex, runningSummary, signingPublic, unhex } from '../../genesis/src/core.ts';
import { TestIdentity, TEST_LABEL, type Home, type IdentityFile } from '../../genesis/src/identity.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { listPosts, post, readPost, withdraw, type ShownPicture } from '../../barebone/src/post.ts';
import { renderPost } from '../../barebone/src/html.ts';
import { escapeHtml } from '../../longform/src/html.ts';
import { compose } from '../../longform/src/text.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { Refused, fromWords, groupId, readId, threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { Store, type Pending } from './store.ts';

/** Said on the first screen (asked by Nobody, allegedly). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Said where the words are shown (the carry Module, 3.2). */
export const WORDS_SAY = [
  'Write these 24 words on paper, in order, and keep the paper safe. They are shown once.',
  'Whoever holds these words can post as this identity. They are its signing key; the chain key is not in them.',
  'Type them into another app to post from there as the same identity. They stop working when the signing key is changed.',
  'They are not a Bitcoin wallet. Never type them into one.',
];

/** Said where an identity is brought in (the carry Module, 5.1, and Identity rule 17). */
export const LINE_SAY =
  'This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, on the device that holds it), that change must keep this line, or every post made here becomes void. Before a change, take this line’s latest act, position and summary to that device.';

/** Said where the words do not give the current key (the carry Module, costs). */
const NOT_CURRENT =
  'These words do not give this identity’s current signing key: they are another identity’s, an earlier key’s, or written wrong. Nothing was kept. If these are your chain key’s words, they must never be typed into an online device.';

export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
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

export class Poster {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(readonly store: Store) {}

  /** One thing at a time: a sequence must never be signed twice at once. */
  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(f, f);
    this.queue = next.catch(() => undefined);
    return next;
  }

  state(): State {
    const me = this.store.identity();
    if (me) {
      const s = this.store.settings();
      const seq = me.f.sequence;
      return {
        stage: 'ready',
        identity: {
          id: me.id,
          grouped: groupId(me.id),
          kind: s.kind,
          homes: me.f.homes.map((h) => h.hint),
          relays: s.relays,
          line: { acts: seq.length, latest: seq.at(-1) ?? null, summary: seq.length ? runningSummary(seq) : null },
        },
      };
    }
    const p = this.store.pending();
    if (p) return { stage: 'confirm', confirm: { positions: p.positions, id: p.identity.identity } };
    return { stage: 'doors' };
  }

  private me(): TestIdentity {
    const me = this.store.identity();
    if (!me) throw new Error('No identity yet: make one, or bring one.');
    return me;
  }

  private get via(): Via {
    return this.store.settings().via;
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
   * Make a new identity with the genesis client's code, and show its
   * signing seed's words once. Nothing is published until three of the
   * words are typed back (`confirm`). Starting again forgets the last one.
   */
  async begin(a: { homes: string[]; relays: string[]; via?: Via }): Promise<{ words: string[]; positions: number[]; say: string[] }> {
    if (this.store.identity()) throw new Error('This app already holds an identity.');
    const via = a.via ?? {};
    const hints = list(a.homes);
    if (!hints.length) throw new Error('Give at least one home address: where the identity lives, and anyone can check it.');
    const homes = await this.homes(hints, via);
    const relays = list(a.relays);
    for (const r of relays) if (!/^https?:\/\//.test(r)) throw new Error(`“${r}”: an address starts with https:// (or http://)`);
    const id = TestIdentity.create({ homes, via, scheme: 3 });
    const words = toWords(unhex(id.f.signingSecret));
    const positions = threePositions(randomInt);
    this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via });
    return { words, positions, say: WORDS_SAY };
  }

  /** Forget a new identity before it was published. */
  abandon(): void {
    this.store.dropPending();
  }

  /**
   * The three words typed back. Refused, with nothing published, unless
   * each is the word at its position. Then the genesis goes to the homes,
   * the routes name the relays, and the identity is this app's.
   */
  confirm(typed: string[]): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const p = this.store.pending();
      if (!p) throw new Error('No new identity is waiting.');
      const words = toWords(unhex(p.identity.signingSecret));
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
      this.store.saveSettings({ kind: 'made', relays: p.relays, via: p.via });
      this.store.saveIdentity(id);
      this.store.dropPending();
      await id.publishRoutes([{ scope: null, hints: p.relays, kind: 0 }]);
      this.store.saveIdentity(id);
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
      if (this.store.identity()) throw new Error('This app already holds an identity.');
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
        chain: chain.map((c) => Buffer.from(c).toString('base64')),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null,
      };
      this.store.saveSettings({ kind: 'brought', relays, via });
      this.store.saveIdentity(new TestIdentity(f, via));
      return {
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          { text: named.length ? `Its posts are published at the relays it names: ${relays.join(', ')}.` : `It names no relays: its posts are published at ${relays.join(', ')}.` },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
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
      const me = this.me();
      const { text, changes } = compose(a.text);
      if (!text.trim()) throw new Error('Write something to post.');
      await this.current(me);
      const relays = this.store.settings().relays;
      let made;
      try {
        made = await post(me, { text, jpeg: a.jpeg, relays });
      } finally {
        // The sequence grew, even if a relay was away: never sign the same position twice.
        this.store.saveIdentity(me);
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
    const me = this.me();
    const p = await readPost(id, this.store.settings().relays, this.via);
    const withdrawable = p.refs
      .filter((r): r is ShownPicture => r.kind === 'picture')
      .filter((r) => r.signer === me.id && !r.withdrawn && r.standing === 'valid')
      .map((r) => r.publication);
    return { id, html: renderPost(p), withdrawable };
  }

  /** This identity's posts at its relays, from every line, newest first. */
  async posts(limit = 20): Promise<Shown[]> {
    const me = this.me();
    const ids: string[] = [];
    for (const r of this.store.settings().relays) {
      try {
        for (const id of await listPosts(me.id, r, this.via)) if (!ids.includes(id)) ids.push(id);
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
      const me = this.me();
      if (!/^[0-9a-f]{64}$/.test(publication)) throw new Error('not a publication id');
      const act = await (async () => {
        for (const r of this.store.settings().relays) {
          try {
            const a = await relayAt(r, this.via).getAct(publication);
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
        return await withdraw(me, publication, this.store.settings().relays);
      } finally {
        this.store.saveIdentity(me);
      }
    });
  }
}

export type { Pending };
