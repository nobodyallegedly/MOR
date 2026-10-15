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
//
// A clock (website cMIP draft 8): a page may name a timestamp clock, an
// identity whose stamps say "I held this act at this time" (the timestamp
// clock Module). Where posts carry its stamps, they are ordered by them
// across identities: each act at the earliest stamp of itself or of any act
// naming it, never before what it names; a post it has not stamped above
// the rest, in signed order. Its stamps are its operator's word, and the
// feed says whose order it is. A stamp from any other identity is never
// asked for, so it orders nothing.

import { MIRS, SPECS, Verifier, cborDecode, describeAct, hex } from '../../genesis/src/core.ts';
import { holdSequence, lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readPost, type Judging, type ShownPost } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { relayAddress } from './settings.ts';
import { NUDGE, NUDGE_TYPES } from './specs.ts';
import { readStamps, earliestByNames } from '../../../modules/timestamp/src/read.ts';
import { TIMESTAMP_SPEC } from '../../../modules/timestamp/src/stamp.ts';

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
  /** Set on a visitor's note (draft 7): a public text act addressed to an identity the feed names, by an identity it does not name. */
  note?: boolean;
  /**
   * For each visitor's note this post answers (draft 7, F275): who picked it,
   * as the signed acts show it. A pick (nudge cMIP, type 2) signed by an
   * identity the feed names, for this post's signer, naming the note: the
   * pick's signer. Else a nudge (type 1) signed by an identity the feed
   * names, for this post's signer: this post's signer, who chose the note
   * under it. Else null.
   */
  picked?: Map<string, string | null>;
  /**
   * Where the page names a clock (draft 8): the time it places this post at,
   * in seconds since 1970 (UTC), the earliest of its stamps and of the
   * stamps of every act found naming it; null where it has none.
   */
  time?: number | null;
}

/** What was read of the clock a feed names (draft 8). */
export interface ClockLine extends Author {
  /** Where its stamps were asked for: its outbox routes a browser can reach, then the gateway's relays. */
  asked: string[];
  unreachable: string[];
  /** Why it could not be looked up, if so: its stamps then order nothing. */
  problem: string | null;
  /** Its stamps found at the places asked, and those valid for its chain. */
  found: number;
  verified: number;
  /** Posts of the feed it places (found, shown or not). */
  placed: number;
}

export interface Feed {
  authors: AuthorLine[];
  /** Newest first, in signed order (see above); at most `limit`. */
  posts: FeedPost[];
  /** Posts found and left out by the limit, oldest of the order. */
  more: number;
  /** Posts that are answered, by id: those of the feed, and those found elsewhere by a named identity. */
  answered: Map<string, FeedPost>;
  /** The clock the page names, and what was read of it; null where it names none (draft 8). */
  clock: ClockLine | null;
  /** How the posts are ordered: by the clock's stamps where any post found carries one, else in signed order. */
  order: 'clock' | 'signed';
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  payload?: Uint8Array;
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
  readonly v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  private looked = new Map<string, Promise<Lookup>>();
  constructor(
    private places: string[],
    private via: Via,
  ) {}
  private held = new Map<string, Promise<void>>();
  /** The signer's chain and its sequence, held before one of its acts is judged (F298). */
  sequence(identity: string): Promise<void> {
    let h = this.held.get(identity);
    if (!h) {
      h = this.lookUp(identity).then((l) => holdSequence(this.v, identity, l, this.places, this.via));
      this.held.set(identity, h);
    }
    return h;
  }
  lookUp(identity: string, places = this.places): Promise<Lookup> {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  async standing(act: Uint8Array, id: string, signer: string): Promise<string> {
    await this.sequence(signer);
    this.v.add(act);
    return this.v.status(id);
  }
}

/**
 * Where an identity's posts are asked for: its outbox routes for the Text
 * MIR (or, failing one, its routes for everything else), those a browser can
 * reach, then the gateway's relays; a clock's stamps (draft 8), by its
 * routes for the timestamp clock Module, or for everything else. An address
 * a browser cannot reach (an onion address, plain http) is not tried, and is
 * said.
 */
export function placesFor(l: Lookup | null, relays: string[], scope: string = POST_SPECS.text): { asked: string[]; unreachable: string[] } {
  const outbox = (l?.routes.routes ?? []).filter((r) => (r.kind ?? 0) === 0);
  const route = outbox.find((r) => r.scope === scope) ?? outbox.find((r) => r.scope === null);
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
 *
 * With a clock's times (draft 8; each act's earliest time, as
 * `earliestByNames` gives it, so an act is never later than one naming it):
 * among those free to come next, an act with no time first (the clock has
 * not stamped it, nor anything naming it: shown as newest, in signed order),
 * then the latest time, then as above. Signed order still holds throughout.
 */
export function signedOrder(acts: Described[], rank: (signer: string) => number, times?: Map<string, number>): string[] {
  const ids = new Set(acts.map((d) => d.id));
  const byId = new Map(acts.map((d) => [d.id, d]));
  // How many acts found name each act: it waits for all of them.
  const waiting = new Map<string, number>(acts.map((d) => [d.id, 0]));
  for (const d of acts) for (const n of new Set(linksOf(d))) if (ids.has(n) && n !== d.id) waiting.set(n, waiting.get(n)! + 1);
  const key = (d: Described) => [rank(d.signer!), -(d.position ?? 0), d.id] as const;
  const byTime = (a: Described, b: Described) => {
    if (!times) return 0;
    const [x, y] = [times.get(a.id), times.get(b.id)];
    if (x === undefined || y === undefined) return x === y ? 0 : x === undefined ? -1 : 1;
    return y - x;
  };
  const before = (a: Described, b: Described) => {
    const [x, y] = [key(a), key(b)];
    return byTime(a, b) || x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : 1);
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

/**
 * A pick or a nudge (nudge cMIP draft 2, types 2 and 1) a reply names, read
 * from the signed act only: public, valid for its signer's chain, signed by
 * an identity the feed names, and naming the reply's signer as its agent
 * (field 0); a pick's field 2, the act picked. Whether the agent kept its
 * published terms is the nudge cMIP's reading, not made here. Null for
 * anything else.
 */
async function causeOf(
  id: string,
  agent: string,
  named: Set<string>,
  places: string[],
  via: Via,
  judge: FeedJudge,
  found: Map<string, { d: Described; act: Uint8Array }>,
): Promise<{ type: number; signer: string; picked: string | null } | null> {
  let act = found.get(id)?.act ?? null;
  for (const h of act ? [] : places) {
    try {
      act = await relayAt(h, via).getAct(id);
      if (act) break;
    } catch {
      // try the next
    }
  }
  if (!act) return null;
  let d: Described;
  try {
    d = describeAct(act) as Described;
  } catch {
    return null;
  }
  if (d.id !== id || !d.public || !d.payload || !d.signer || d.spec !== NUDGE) return null;
  if (d.type !== NUDGE_TYPES.pick && d.type !== NUDGE_TYPES.nudge) return null;
  if (!named.has(d.signer)) return null;
  let m: Map<number, unknown>;
  try {
    m = cborDecode(d.payload) as Map<number, unknown>;
  } catch {
    return null;
  }
  const f0 = m.get(0);
  if (!(f0 instanceof Uint8Array) || hex(f0) !== agent) return null;
  const f2 = m.get(2);
  const picked = d.type === NUDGE_TYPES.pick ? (f2 instanceof Uint8Array ? hex(f2) : null) : null;
  if (d.type === NUDGE_TYPES.pick && !picked) return null;
  if (d.type === NUDGE_TYPES.nudge && !(typeof f2 === 'number' && f2 >= 1)) return null;
  if ((await judge.standing(act, id, d.signer)) !== 'valid') return null;
  return { type: d.type, signer: d.signer, picked };
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

/**
 * The feed of the identities named, from the gateway's relays and each
 * identity's own routes. Never throws: what could not be found or verified
 * is said, post by post and identity by identity.
 */
export async function readFeed(authors: Author[], relays: string[], via: Via = {}, limit = FEED_LIMIT, clock: Author | null = null): Promise<Feed> {
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

  // The clock the page names (draft 8): its stamps, by signer, at its own
  // outbox and the gateway's relays, each judged through its chain; each act
  // found placed at the earliest stamp of itself or of any act naming it.
  let clockLine: ClockLine | null = null;
  let times: Map<string, number> | undefined;
  if (clock) {
    let l: Lookup | null = null;
    let problem: string | null = null;
    try {
      l = await judge.lookUp(clock.identity);
    } catch (err) {
      problem = message(err);
    }
    const { asked, unreachable } = placesFor(l, relays, TIMESTAMP_SPEC);
    clockLine = { ...clock, asked, unreachable, problem, found: 0, verified: 0, placed: 0 };
    if (!problem) {
      const read = await readStamps(clock.identity, asked, judge, via);
      clockLine.found = read.found;
      clockLine.verified = read.verified.length;
      times = earliestByNames([...found.values()].map((x) => ({ id: x.d.id, links: linksOf(x.d) })), read.earliest);
    }
  }

  const rank = (s: string) => authors.findIndex((a) => a.identity === s);
  const all = [...found.values()].map((x) => x.d);
  const placed = times ? all.filter((d) => isPost(d) && times!.has(d.id)).length : 0;
  if (clockLine) clockLine.placed = placed;
  const byClock = placed > 0;
  const order = signedOrder(all, rank, byClock ? times : undefined);
  const shown = order.slice(0, limit);
  const posts = await Promise.all(
    shown.map(async (id) => {
      const { d } = found.get(id)!;
      const p = await readOne(id, d.signer!, d.position ?? null, placesOf.get(d.signer!)!, via, judge, problems.get(d.signer!) ?? null);
      if (byClock) p.time = times!.get(id) ?? null;
      return p;
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
      } else if (!named.has(d.signer) && (d.to ?? []).some((t) => named.has(t))) {
        // A visitor's note: shown beside a reply of an identity the feed
        // names that names it (draft 7, F275), checked as any post.
        const n = await readOne(r, d.signer, d.position ?? null, everywhere, via, judge, null);
        n.note = true;
        answered.set(r, n);
      } else if (!named.has(d.signer)) {
        answered.set(r, { id: r, signer: d.signer, position: d.position ?? null, post: null, problem: null, answers: [] });
      } else {
        answered.set(r, await readOne(r, d.signer, d.position ?? null, everywhere, via, judge, problems.get(d.signer) ?? null));
      }
      p.answers.push(r);
    }
  }

  // Who picked each note a post answers: the pick or nudge the post names,
  // fetched and judged as signed by an identity the feed names.
  for (const p of posts) {
    const notes = p.answers.filter((r) => answered.get(r)?.note);
    if (!notes.length) continue;
    p.picked = new Map(notes.map((r) => [r, null]));
    const causes = p.post!.refs.flatMap((x) => (x.kind === 'act' && !answered.has(x.id) ? [x.id] : []));
    let nudged = false;
    for (const c of causes) {
      const cause = await causeOf(c, p.signer, named, everywhere, via, judge, found);
      if (cause?.type === NUDGE_TYPES.pick && p.picked.has(cause.picked!)) p.picked.set(cause.picked!, cause.signer);
      if (cause?.type === NUDGE_TYPES.nudge) nudged = true;
    }
    if (nudged) for (const [r, by] of p.picked) if (by === null) p.picked.set(r, p.signer);
  }

  for (const line of lines) {
    const mine = posts.filter((p) => p.signer === line.identity);
    line.found = order.filter((id) => found.get(id)!.d.signer === line.identity).length;
    line.verified = mine.filter((p) => !p.problem).length;
  }
  return { authors: lines, posts, more: order.length - shown.length, answered, clock: clockLine, order: byClock ? 'clock' : 'signed' };
}
