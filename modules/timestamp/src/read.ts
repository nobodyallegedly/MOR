// Reading a timestamp clock's stamps (modules/module-clock-timestamp-draft-1.md,
// "The proofs it accepts"): the clock's acts asked for by signer at the
// places given, each that is a stamp judged through the clock's chain by
// the core library, and each act placed at its earliest stamp. Then the
// client conformance for a reader that orders by them: an act existed by
// the earliest stamp of any act naming it.

import { describeAct } from '../../../clients/genesis/src/core.ts';
import { relayAt, type Via } from '../../../clients/genesis/src/transport.ts';
import { NotAStamp, STAMP_TYPE, TIMESTAMP_SPEC, decodeStamp } from './stamp.ts';

/** An act as the core library describes it: only what reading a stamp needs. */
export interface StampAct {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

/** A stamp found: its act id, its time, the acts it names. */
export interface Found {
  stamp: string;
  time: number;
  acts: string[];
}

/** The core library's judgment of an act through its signer's chain ("valid", or why not). */
export interface Judging {
  standing(act: Uint8Array, id: string, signer: string): Promise<string>;
}

/** What was read of one clock. */
export interface ClockReading {
  /** Stamps found at the places asked, before judging. */
  found: number;
  /** Stamps whose standing for the clock's chain is valid: the only ones that place anything. */
  verified: Found[];
  /** Each act's earliest time among the verified stamps. */
  earliest: Map<string, number>;
}

/**
 * The stamp an act is, if it is one of `clock`'s (rules 1 and 2, and the
 * proof's steps 1 and 2 but its standing): public, of this Module's spec and
 * type, signed by the clock, its payload a stamp. Null for anything else.
 */
export function asStamp(d: StampAct, clock: string): Found | null {
  if (!d.public || d.signer !== clock || d.spec !== TIMESTAMP_SPEC || d.type !== STAMP_TYPE || !d.payload) return null;
  try {
    const s = decodeStamp(d.payload);
    return { stamp: d.id, time: s.time, acts: s.acts };
  } catch (e) {
    if (e instanceof NotAStamp) return null;
    throw e;
  }
}

/** For each act, its earliest time among the stamps given (anchoring cMIP, item 2: an act is judged by its earliest anchor). */
export function earliest(stamps: Found[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of stamps) for (const a of s.acts) if (!out.has(a) || s.time < out.get(a)!) out.set(a, s.time);
  return out;
}

/**
 * Client conformance ("Reading the stamps of linked acts"): an act existed
 * by the earliest stamp of any act found that names it, directly or through
 * others. `acts` are the acts found, each with the acts it names by hash;
 * `own` each act's earliest stamp. Returns, for every act that has one, the
 * earliest of its own stamps and of every act naming it.
 */
export function earliestByNames(acts: { id: string; links: string[] }[], own: Map<string, number>): Map<string, number> {
  const ids = new Set(acts.map((a) => a.id));
  const links = new Map(acts.map((a) => [a.id, a.links.filter((l) => ids.has(l) && l !== a.id)]));
  const out = new Map<string, number>();
  for (const [a, t] of own) if (ids.has(a)) out.set(a, t);
  // Each act passes its time down to what it names, while that lowers it:
  // times only fall and are finite, so this ends.
  const work = [...out.keys()];
  while (work.length) {
    const a = work.pop()!;
    const t = out.get(a)!;
    for (const n of links.get(a) ?? []) {
      if (!out.has(n) || t < out.get(n)!) {
        out.set(n, t);
        work.push(n);
      }
    }
  }
  return out;
}

/**
 * Read `clock`'s stamps: its acts asked for by signer at each place given
 * (relay transport cMIP, "Following: the feed"), each stamp judged through
 * the clock's chain. A place that does not answer is passed over: silence
 * proves nothing. Never throws for what it finds; a stamp that is not valid
 * places nothing.
 */
export async function readStamps(clock: string, places: string[], judge: Judging, via: Via = {}): Promise<ClockReading> {
  const seen = new Map<string, { s: Found; act: Uint8Array }>();
  for (const h of places) {
    let after: number | undefined;
    for (;;) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer: clock, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== 'act') continue;
        let s: Found | null = null;
        try {
          s = asStamp(describeAct(it.item) as StampAct, clock);
        } catch {
          continue;
        }
        if (s && !seen.has(s.stamp)) seen.set(s.stamp, { s, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  const verified: Found[] = [];
  for (const { s, act } of seen.values()) {
    try {
      if ((await judge.standing(act, s.stamp, clock)) === 'valid') verified.push(s);
    } catch {
      // its standing could not be judged: it places nothing
    }
  }
  return { found: seen.size, verified, earliest: earliest(verified) };
}
