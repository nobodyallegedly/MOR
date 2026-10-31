// Edubba: asking other people to sign (round 8, F407; the Publishing tab's
// four ways in, decided by Nobody, allegedly, 24 October 2026). A claim of a
// work made with others, a work's ownership agreement, a publication and the
// version that ends one are each signed here first, then sent to every other
// person who signs it, each in their own Edubba (To sign). Nothing counts
// for them until they have signed (Agreements rule 1: "A party is bound by
// an agreement only through its own signature act").
//
// In plain words: you name the people by the names your contacts give them
// (never by an ID alone, H119); for shares, the form opens with two rows,
// you and one other person, then "+ Add a person" (H98), the shares even
// until you change one. Edubba sends each of them, sealed, a message naming
// what to sign; each time Publishing opens (or "Look for signatures"), it
// looks for their signature acts where they publish, and says who has signed.
//
// Precisely: the message is an Agreements negotiation message (rule 52),
// sealed to each person and left in their inbox, its `refs` naming every act
// to sign; a person's signature act (type 1) naming an act, found among the
// acts they published, is their signature. What was there before this
// round, the deal's own payee (an identity made for each deal, its grant to
// the split service, its payee pointer), is gone: a publication's split
// service receives in its own name (Agreements draft 17, rule 16).
//
// TEST IDENTITIES ONLY, regtest only.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cborDecode, describeAct, hex, readTerms } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readId as readIdForm } from '../../genesis/src/forms.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { negotiate } from '../../repo/src/proposals.ts';
import { allBy } from '../../grants/src/grant.ts';
import { pct } from '../../grants/src/deal.ts';
import type { Line } from '../../collective/src/explain.ts';
import type { Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];
const now = () => Math.floor(Date.now() / 1000);

/** Shares are written in millionths, summing to 1,000,000 (Agreements rule 9). */
export const PARTS = 1_000_000;

/** Said beside "Who owns it" (H98), word for word. */
export const SHARES_SAY = [
  'It opens with two rows: you, and one other person, chosen by the name your contacts give them (never by an ID alone). “+ Add a person” for each more. The shares are even until you change one; together they make 100.',
  'Each person signs it in their own Edubba (To sign). It counts once every one of them has signed.',
];

/** Rows of people as a form gives them: the first is the identity in use. */
export interface PeopleIn {
  rows: { who: string; share?: string; label?: string }[];
}

/** Something signed here and sent to others to sign, waiting or complete. */
export interface Waiting {
  /** The first act to sign: what it is known by. */
  id: string;
  kind: 'claim' | 'ownership' | 'publication' | 'ending';
  title: string;
  by: string;
  /** Every act each other person signs. */
  acts: string[];
  /** Every other person who signs. */
  people: string[];
  /** Each person's signature acts found, by the act they sign. */
  signed: Record<string, Record<string, string>>;
  threads: Record<string, string>;
  state: 'waiting' | 'complete';
  at: number;
}

const DIR = 'publishing';

/**
 * The people other than you a thing waits on, their signatures looked for
 * at their places; the names this Edubba gives.
 */
export class Asking {
  constructor(
    private store: Store,
    private contacts: () => { id: string; name: string }[],
    private settings: () => { relays: string[]; homes: string[]; via: Via },
  ) {
    mkdirSync(store.path(DIR), { recursive: true, mode: 0o700 });
  }

  private file() {
    return this.store.path(DIR, 'waiting.json');
  }

  list(): Waiting[] {
    const f = this.file();
    return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as Waiting[]) : [];
  }

  private save(ws: Waiting[]) {
    writeFileSync(this.file(), `${JSON.stringify(ws, null, 2)}\n`, { mode: 0o600 });
  }

  get(id: string): Waiting | null {
    return this.list().find((w) => w.id === id) ?? null;
  }

  /** The names this Edubba gives: the identities held, then its contacts. */
  names(): (id: string) => string {
    const held = this.store.names();
    const cs = this.contacts();
    return (id: string) => {
      const c = cs.find((x) => x.id === id);
      return this.store.holds(id) || !c ? held(id) : `${c.name} [${short(id)}]`;
    };
  }

  /**
   * A person named in a form: a contact's name or an identity held here
   * (H119: a person is named by your name for them). With `ids`, an ID is
   * taken too: a partner or a split service may be a relay or a client, not
   * a contact. Null with why, otherwise.
   */
  person(typed: string, me: string, o: { ids?: boolean } = {}): { id: string } | { why: string } {
    const name = typed.trim();
    if (!name) return { why: 'empty' };
    const c = this.contacts().find((x) => x.name === name) ?? this.store.book().identities.find((x) => x.name === name);
    if (c) return { id: c.id };
    if (/^(mid1|[0-9a-f]{64})/i.test(name)) {
      if (!o.ids) return { why: `“${short(name)}”: name a person as your contacts name them, never by an ID alone. Add them to your contacts first (Follow: add to contacts).` };
      try {
        return { id: /^[0-9a-f]{64}$/i.test(name) ? name.toLowerCase() : readIdForm(name) };
      } catch (e) {
        return { why: `“${short(name)}”: ${err(e)}` };
      }
    }
    if (name === me) return { id: me };
    return { why: `“${name}” is not a name in your contacts.` };
  }

  /**
   * "Who owns it" (H98): the rows, the first the identity in use, each with
   * its share; shares left blank are even (the leftover millionths to the
   * first rows, so they make exactly 100%). Problems in plain words.
   */
  shares(me: string, a: PeopleIn): { shares: [string, number][]; problems: string[] } {
    const problems: string[] = [];
    const people: { id: string; share: string }[] = [{ id: me, share: (a.rows[0]?.share ?? '').trim() }];
    for (const r of a.rows.slice(1)) {
      if (!r.who.trim()) continue;
      const p = this.person(r.who, me);
      if ('why' in p) {
        problems.push(p.why);
        continue;
      }
      if (people.some((x) => x.id === p.id)) {
        problems.push(`${this.names()(p.id)} is named twice: each person once.`);
        continue;
      }
      people.push({ id: p.id, share: (r.share ?? '').trim() });
    }
    if (people.length < 2) problems.push('Name at least one other person: an agreement between people names two at least (H98).');
    const typed = people.filter((p) => p.share !== '');
    let shares: [string, number][];
    if (!typed.length) {
      // Even until touched (H98): the leftover millionths to the first rows.
      const each = Math.floor(PARTS / people.length);
      let left = PARTS - each * people.length;
      shares = people.map((p) => [p.id, each + (left-- > 0 ? 1 : 0)]);
    } else {
      shares = people.map((p) => {
        const n = Number(p.share.replace('%', ''));
        if (p.share === '' || !Number.isFinite(n) || n <= 0 || n >= 100) {
          problems.push(`${this.names()(p.id)}: a share is a percentage above 0 and under 100.`);
          return [p.id, 0];
        }
        return [p.id, Math.round(n * 10_000)];
      });
      const sum = shares.reduce((x, [, n]) => x + n, 0);
      if (!problems.length && sum !== PARTS) problems.push(`The shares add up to ${pct(sum)}, not 100%.`);
    }
    return { shares, problems };
  }

  /**
   * Send each other person a sealed message naming every act to sign, and
   * keep it waiting here. Lines say where each was left.
   */
  async ask(me: TestIdentity, w: { id: string; kind: Waiting['kind']; title: string; acts: string[]; people: string[]; text: string }): Promise<{ waiting: Waiting; lines: Line[] }> {
    const s = this.settings();
    const names = this.names();
    const lines: Line[] = [];
    const threads: Record<string, string> = {};
    for (const id of w.people) {
      try {
        const l = await lookUp(id, list([...s.relays, ...s.homes]), s.via);
        const inbox = l.inbox(REPO_SPECS.agreements);
        if (!l.encryptionKey || !inbox?.length) throw new Error('it publishes no encryption key or inbox');
        const sent = await negotiate(me, { id, key: l.encryptionKey, inbox }, { text: w.text, refs: w.acts.map((a) => [a, me.id] as [string, string]) });
        threads[id] = sent.id;
        lines.push({ text: sent.left.length ? `Sent to ${names(id)}, sealed, in their inbox: they sign it in their own Edubba (To sign).` : `Not delivered to ${names(id)}: ${sent.failed.map((f) => `${f.relay}: ${f.reason}`).join('; ')}.`, tone: sent.left.length ? 'ok' : 'bad' });
      } catch (e) {
        lines.push({ text: `Not sent to ${names(id)}: ${err(e)}`, tone: 'bad' });
      }
    }
    const waiting: Waiting = { id: w.id, kind: w.kind, title: w.title, by: me.id, acts: w.acts, people: w.people, signed: {}, threads, state: w.people.length ? 'waiting' : 'complete', at: now() };
    this.save([waiting, ...this.list().filter((x) => x.id !== w.id)]);
    return { waiting, lines };
  }

  /** Keep something with nobody else to ask (a lone claim, a lone publication waiting only for its split service). */
  keep(w: Waiting): void {
    this.save([w, ...this.list().filter((x) => x.id !== w.id)]);
  }

  /** Each person's signature acts naming any of `acts`, found among what they published (their places looked up). */
  async signaturesOf(person: string, acts: string[]): Promise<Record<string, string>> {
    const s = this.settings();
    let places = list([...s.relays, ...s.homes]);
    try {
      const l = await lookUp(person, places, s.via);
      places = list([...places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)]);
    } catch {
      // asked where we look
    }
    const out: Record<string, string> = {};
    for (const a of await allBy(person, places, s.via)) {
      const x = describeAct(a) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
      if (x.signer !== person || x.spec !== REPO_SPECS.agreements || x.type !== AGREEMENTS_TYPES.signature || !x.payload) continue;
      const named = (cborDecode(x.payload) as Map<number, unknown>).get(0);
      const act = named instanceof Uint8Array ? hex(named) : null;
      if (act && acts.includes(act)) out[act] = x.id;
    }
    return out;
  }

  /**
   * Look for each other person's signature on everything waiting; `done` is
   * called on each one every person has signed (and is then complete). Lines
   * in plain words.
   */
  async gather(done: (w: Waiting) => Promise<Line[]>): Promise<{ lines: Line[] }> {
    const names = this.names();
    const ws = this.list();
    const lines: Line[] = [];
    for (const w of ws.filter((x) => x.state === 'waiting')) {
      for (const p of w.people) {
        const got = await this.signaturesOf(p, w.acts).catch(() => ({}) as Record<string, string>);
        w.signed[p] = { ...(w.signed[p] ?? {}), ...got };
      }
      const missing = w.people.filter((p) => w.acts.some((a) => !w.signed[p]?.[a]));
      if (missing.length) {
        lines.push({ text: `“${w.title}”: waiting for ${missing.map(names).join(', ')} to sign.` });
        continue;
      }
      try {
        lines.push(...(await done(w)));
        w.state = 'complete';
      } catch (e) {
        lines.push({ text: `“${w.title}”: every person signed, but what follows could not be done yet: ${err(e)}`, tone: 'warn' });
      }
    }
    this.save(ws);
    return { lines };
  }

  /** Who has signed, in plain words. */
  signedWords(w: Waiting): string {
    const names = this.names();
    if (!w.people.length) return 'nobody else signs it';
    return w.people.map((x) => `${names(x)}: ${w.acts.every((a) => w.signed[x]?.[a]) ? 'signed' : 'not yet'}`).join(' · ');
  }
}

/** An ownership agreement's terms read by the core: its parties, its stake, its target. Null where the act is none. */
export function ownershipOf(act: Uint8Array): { id: string; parties: string[]; holders: [string, number][]; claim: string | null; text: string; parent: string | null } | null {
  const d = describeAct(act) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
  if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) return null;
  try {
    const t = readTerms(d.payload, AGREEMENTS_SPECS) as { parties: string[]; text: string; parent?: string | null; target?: [string, string | null] | null; stakes?: [string | null, [string | null, number][]][] };
    if (t.target?.[0] !== 'claim') return null;
    const holders = (t.stakes?.[0]?.[1] ?? []).filter((x): x is [string, number] => typeof x[0] === 'string');
    return { id: d.id, parties: t.parties, holders, claim: t.target[1], text: t.text, parent: t.parent ?? null };
  } catch {
    return null;
  }
}

/** Fetch an act by its id at these places. */
export async function actAt(id: string, places: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of places) {
    const a = await relayAt(h, via).getAct(id).catch(() => null);
    if (a) return a;
  }
  return null;
}
