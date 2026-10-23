// The Dubsar timestamp clock, which every app of the suite relies on by
// default (decided by Nobody, allegedly, 23 October 2026: "it is assumed
// that everyone would [use the dumb clock] unless more precise method is
// needed"; "For now, the dubsar suite relies on the dubsar timestamp clock
// module with optional anchoring to BTC"; a choice of clock comes "later
// when there are better clocks").
//
// In plain words: a timestamp clock is an ordinary MOR identity that signs
// "I held these acts at this time", its operator's word and nothing more
// (the timestamp clock Module, draft 2). The apps order their feeds by its
// stamps, each signer's own sequence kept, and show its time on each card,
// faint, "by the Dubsar clock". Where it has not stamped an act, the card
// shows the signer's own hint instead, labelled as the signer's; with
// neither, no time. A clock orders what is shown; it never decides what is
// true. Anchoring to Bitcoin stays optional: Anchor it, paid in Damgar.
//
// Precisely: the clock is the identity dubsar.org's feed names (website
// cMIP rule 13a, `mor-clock`). That page names it by a placeholder in this
// repository (`docs/dubsar.org/feed.html`, CLOCK-IDENTITY), filled only when
// the site is published, so its identity is not written here either: it is
// asked of Nobody, allegedly (the Edubba round 4 report, "After S7d").
// Until it is given, `DUBSAR_CLOCK_ID` is null: no clock orders anything and
// cards show the signer's hint or nothing. A program or a test may name it
// in its own memory with `useDubsarClock`; nothing of it is kept.
//
// TEST IDENTITIES ONLY.

import { readStamps } from '../../../modules/timestamp/src/read.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { Judge } from './post.ts';

/** The Dubsar clock's identity: not yet given (see above). */
export const DUBSAR_CLOCK_ID: string | null = null;

/** Its name on the cards. */
export const DUBSAR_CLOCK_NAME = 'the Dubsar clock';

let named: string | null = DUBSAR_CLOCK_ID;

/** Name the Dubsar clock's identity in this program's memory (a test, or a program told it); null: back to the default. */
export function useDubsarClock(id: string | null): void {
  if (id !== null && !/^[0-9a-f]{64}$/.test(id)) throw new Error('A clock is named by its identity hash: 64 hexadecimal digits.');
  named = id ?? DUBSAR_CLOCK_ID;
  stamps.clear();
}

/** The clock the apps rely on, as the feed reader takes it; null while its identity is not given. */
export function dubsarClock(): { identity: string; name: string } | null {
  return named ? { identity: named, name: DUBSAR_CLOCK_NAME } : null;
}

/** A time, in words, UTC: the clock's word. */
export function timeWords(t: number): string {
  const d = new Date(t * 1000);
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

/** What a card shows of a time the clock stamped: faint, its clock named. */
export function byClock(t: number): string {
  return `${timeWords(t)} · by the Dubsar clock`;
}

/** Stamps read lately, by clock: this program's memory only, read again at most once a minute. */
const stamps = new Map<string, { at: number; earliest: Map<string, number> }>();
const now = () => Math.floor(Date.now() / 1000);

/**
 * When the Dubsar clock says it held each act: its earliest stamp of it
 * (the timestamp clock Module's `readStamps`, each stamp judged through the
 * clock's own chain). Empty where its identity is not given or it cannot be
 * read: then nothing is ordered by it.
 */
export async function clockTimes(hints: string[], via: Via): Promise<Map<string, number>> {
  const c = dubsarClock();
  if (!c) return new Map();
  const kept = stamps.get(c.identity);
  if (kept && kept.at + 60 > now()) return kept.earliest;
  try {
    let places = hints;
    try {
      const l = await lookUp(c.identity, hints, via);
      places = [...new Set([...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints), ...hints])];
    } catch {
      // not found where asked: its stamps are looked for at the places given
    }
    const r = await readStamps(c.identity, places, new Judge(places, via), via);
    stamps.set(c.identity, { at: now(), earliest: r.earliest });
    return r.earliest;
  } catch {
    return new Map();
  }
}

/** Each act's time by the clock, in words, for the cards: absent where the clock has not stamped it. */
export async function clockWords(ids: string[], hints: string[], via: Via): Promise<Record<string, string>> {
  const t = await clockTimes(hints, via);
  const out: Record<string, string> = {};
  for (const id of ids) if (t.has(id)) out[id] = byClock(t.get(id)!);
  return out;
}
