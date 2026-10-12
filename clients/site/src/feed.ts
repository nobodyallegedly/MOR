// The public posts of a list of identities, as a page's `mor-feed` names them
// (website cMIP draft 6, rule 13a). For each identity: its chain looked up
// from its homes, its outbox routes for the Text MIR read from it, and the
// feed by signer of every place a browser can reach (those routes and the
// gateway's relays); each public text act found is a post. Each post shown is
// judged through its signer's chain with the core library, its pictures
// checked, as the reader shows a post. The same code runs in the visitor's
// browser and on the command line.
//
// Order: MOR has no clock, so the feed is in signed order only (decided by
// Nobody, allegedly, 12 October 2026). An act that names another by its hash
// (its previous act in the sequence, a reference, a chain it follows, an
// acknowledgement) was signed after it: that is the only "before" used. A
// reply is therefore after the post it answers, and an identity's own line is
// never reversed. Between posts no signed link orders, the order is the
// page's order of identities, then the position in the signer's sequence,
// then the act id: an order of finding, which the feed says is not a time.

import { MIRS, SPECS, Verifier, describeAct } from '../../genesis/src/core.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readPost, type Judging, type ShownPost } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { relayAddress } from './settings.ts';

/** An identity a feed names, with the page's word for it. */
export interface Author {
  identity: string;
  /** The page's name for it, or null: the display client then shows its fingerprint alone. */
  name: string | null;
}

/** What was found for one identity named. */
export interface AuthorLine extends Author {
  /** Where its posts were asked for: its outbox routes a browser can reach, then the gateway's relays. */
  asked: string[];
  /** Outbox addresses a browser cannot reach (not https), not asked. */
  unreachable: string[];
  /** Why it could not be looked up, if so; its posts found are then all shown as not verified. */
  problem: string | null;
  /** Posts found, verified and not. */
  found: number;
  verified: number;
}

/** A post of the feed. */
export interface FeedPost {
  id: string;
  /** The identity the act names as its signer: a claim until `post` says verified. */
  signer: string;
  /** Its position in the signer's sequence, as it says. */
  position: number | null;
  /** The post read and judged, or null (and `problem`) when it could not be read. */
  post: ShownPost | null;
  /** Set when it is not shown as verified, saying why. */
  problem: string | null;
  /** The text acts it names (Text MIR: a reply names the post it answers). */
  answers: string[];
}

export interface Feed {
  authors: AuthorLine[];
  /** Newest first, in signed order (see above); at most `limit`. */
  posts: FeedPost[];
  /** Posts found and left out by the limit, oldest of the order. */
  more: number;
  /** Posts that are answered, by id: those of the feed, and those found elsewhere by a named identity. */
  answered: Map<string, FeedPost>;
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  position?: number;
  prev?: string;
  objects?: [string, string][];
  refs?: string[];
  acks?: string[];
}

/** The most posts a display client reads and shows of one feed (a reading, cMIP draft 6, rule 13a). */
export const FEED_LIMIT = 30;

const isPost = (d: Described) => d.public && d.spec === POST_SPECS.text && d.type === TEXT_ACT;

/**
 * One verifier for the whole feed: each identity looked up once, from the
 * places given, its acts added to the same verifier (Identity, "Reaching an
 * identity"), so every post is judged with everything found.
 */
class FeedJudge implements Judging {
  readonly v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
  private looked = new Map<string, Promise<Lookup>>();
  constructor(
    private places: string[],
    private via: Via,
  ) {}
  lookUp(identity: string, places = this.places): Promise<Lookup> {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  async standing(act: Uint8Array, id: string, signer: string): Promise<string> {
    await this.lookUp(signer);
    this.v.add(act);
    return this.v.status(id);
  }
}

/**
 * Where an identity's posts are asked for: its outbox routes for the Text
 * MIR (or, failing one, its routes for everything else), those a browser can
 * reach, then the gateway's relays. An address a browser cannot reach (an
 * onion address, plain http) is not tried, and is said.
 */
export function placesFor(l: Lookup | null, relays: string[]): { asked: string[]; unreachable: string[] } {
  const outbox = (l?.routes.routes ?? []).filter((r) => (r.kind ?? 0) === 0);
  const route = outbox.find((r) => r.scope === POST_SPECS.text) ?? outbox.find((r) => r.scope === null);
  const asked: string[] = [];
  const unreachable: string[] = [];
  for (const h of route?.hints ?? []) {
    const a = relayAddress(h);
    if (a) {
      if (!asked.includes(a)) asked.push(a);
    } else if (!unreachable.includes(h)) unreachable.push(h);
  }
  for (const r of relays) if (!asked.includes(r)) asked.push(r);
  return { asked, unreachable };
}

/** Every act signed by `signer` that the places hold, described; the bytes of its public text acts. */
async function actsBy(signer: string, places: string[], via: Via, into: Map<string, { d: Described; act: Uint8Array }>): Promise<void> {
  for (const h of places) {
    let after: number | undefined;
    for (;;) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer, after });
      } catch {
        break; // that place is away: silence proves nothing
      }
      for (const it of page.items) {
        if (it.kind !== 'act') continue;
        let d: Described;
        try {
          d = describeAct(it.item) as Described;
        } catch {
          continue;
        }
        if (d.signer !== signer || into.has(d.id)) continue;
        into.set(d.id, { d, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
}

/** The acts an act names by hash, each signed before it. */
const linksOf = (d: Described): string[] => [
  ...(d.prev ? [d.prev] : []),
  ...(d.refs ?? []),
  ...(d.objects ?? []).flatMap(([chain, pred]) => [chain, pred]),
  ...(d.acks ?? []),
];

/**
 * Newest first, in signed order: an act is listed only once every act found
 * that names it (directly, or through others) is listed. Among those free to
 * come next: the page's order of identities, then the higher position in the
 * signer's sequence, then the act id. Acts that are not posts carry the order
 * between posts (an identity's line runs through its pictures and routes too)
 * and are then left out.
 */
export function signedOrder(acts: Described[], rank: (signer: string) => number): string[] {
  const ids = new Set(acts.map((d) => d.id));
  const byId = new Map(acts.map((d) => [d.id, d]));
  // How many acts found name each act: it waits for all of them.
  const waiting = new Map<string, number>(acts.map((d) => [d.id, 0]));
  for (const d of acts) for (const n of new Set(linksOf(d))) if (ids.has(n) && n !== d.id) waiting.set(n, waiting.get(n)! + 1);
  const key = (d: Described) => [rank(d.signer!), -(d.position ?? 0), d.id] as const;
  const before = (a: Described, b: Described) => {
    const [x, y] = [key(a), key(b)];
    return x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : 1);
  };
  const free = acts.filter((d) => waiting.get(d.id) === 0);
  const out: string[] = [];
  while (free.length) {
    free.sort(before);
    const d = free.shift()!;
    out.push(d.id);
    for (const n of new Set(linksOf(d))) {
      if (!ids.has(n) || n === d.id) continue;
      const left = waiting.get(n)! - 1;
      waiting.set(n, left);
      if (left === 0) free.push(byId.get(n)!);
    }
  }
  // A cycle cannot be signed (each act names hashes of acts that existed);
  // anything left by a malformed one goes last, in the same order.
  for (const d of acts.filter((x) => !out.includes(x.id)).sort(before)) out.push(d.id);
  return out.filter((id) => isPost(byId.get(id)!));
}

async function readOne(id: string, signer: string, position: number | null, places: string[], via: Via, judge: FeedJudge, lookupProblem: string | null): Promise<FeedPost> {
  const p: FeedPost = { id, signer, position, post: null, problem: null, answers: [] };
  if (lookupProblem) {
    p.problem = `its signer's identity chain could not be looked up: ${lookupProblem}`;
    return p;
  }
  try {
    p.post = await readPost(id, places, via, judge);
    if (p.post.standing !== 'valid') p.problem = `its standing is “${p.post.standing}”, not valid`;
  } catch (err) {
    p.problem = err instanceof Error ? err.message : String(err);
  }
  return p;
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

/**
 * The feed of the identities named, from the gateway's relays and each
 * identity's own routes. Never throws: what could not be found or verified
 * is said, post by post and identity by identity.
 */
export async function readFeed(authors: Author[], relays: string[], via: Via = {}, limit = FEED_LIMIT): Promise<Feed> {
  const judge = new FeedJudge(relays, via);
  const lines: AuthorLine[] = [];
  const found = new Map<string, { d: Described; act: Uint8Array }>();
  const placesOf = new Map<string, string[]>();
  const problems = new Map<string, string>();
  await Promise.all(
    authors.map(async (a) => {
      let l: Lookup | null = null;
      let problem: string | null = null;
      try {
        l = await judge.lookUp(a.identity);
      } catch (err) {
        problem = message(err);
      }
      const { asked, unreachable } = placesFor(l, relays);
      lines.push({ ...a, asked, unreachable, problem, found: 0, verified: 0 });
      placesOf.set(a.identity, asked);
      if (problem) problems.set(a.identity, problem);
    }),
  );
  lines.sort((x, y) => authors.findIndex((a) => a.identity === x.identity) - authors.findIndex((a) => a.identity === y.identity));
  for (const a of authors) await actsBy(a.identity, placesOf.get(a.identity)!, via, found);

  const rank = (s: string) => authors.findIndex((a) => a.identity === s);
  const order = signedOrder([...found.values()].map((x) => x.d), rank);
  const shown = order.slice(0, limit);
  const posts = await Promise.all(
    shown.map((id) => {
      const { d } = found.get(id)!;
      return readOne(id, d.signer!, d.position ?? null, placesOf.get(d.signer!)!, via, judge, problems.get(d.signer!) ?? null);
    }),
  );
  // The posts answered (a text act a verified post names, Text MIR): from the
  // feed when there, otherwise looked for at every place asked. Only a post
  // by an identity the feed names is shown with its reply; one by any other
  // identity is named, not shown (decision (a): the feed of the identities
  // named only).
  const answered = new Map<string, FeedPost>();
  const byId = new Map(posts.map((p) => [p.id, p]));
  const everywhere = [...new Set([...placesOf.values()].flat())];
  const named = new Set(authors.map((a) => a.identity));
  for (const p of posts) {
    if (!p.post || p.problem) continue;
    for (const ref of p.post.refs) {
      if (ref.kind !== 'act') continue;
      const r = ref.id;
      if (answered.has(r)) {
        p.answers.push(r);
        continue;
      }
      const inFeed = byId.get(r);
      if (inFeed) {
        answered.set(r, inFeed);
        p.answers.push(r);
        continue;
      }
      let d: Described | null = found.get(r)?.d ?? null;
      for (const h of d ? [] : everywhere) {
        try {
          const act = await relayAt(h, via).getAct(r);
          if (act) {
            d = describeAct(act) as Described;
            if (d.id !== r) d = null;
            if (d) break;
          }
        } catch {
          // try the next
        }
      }
      if (!d) {
        if (ref.what !== 'not found at the relays asked') continue;
        answered.set(r, { id: r, signer: '', position: null, post: null, problem: 'not found at the places asked', answers: [] });
      } else if (!isPost(d) || !d.signer) {
        continue; // a picture, or anything else that is not a post
      } else if (!named.has(d.signer)) {
        answered.set(r, { id: r, signer: d.signer, position: d.position ?? null, post: null, problem: null, answers: [] });
      } else {
        answered.set(r, await readOne(r, d.signer, d.position ?? null, everywhere, via, judge, problems.get(d.signer) ?? null));
      }
      p.answers.push(r);
    }
  }

  for (const line of lines) {
    const mine = posts.filter((p) => p.signer === line.identity);
    line.found = order.filter((id) => found.get(id)!.d.signer === line.identity).length;
    line.verified = mine.filter((p) => !p.problem).length;
  }
  return { authors: lines, posts, more: order.length - shown.length, answered };
}
