// An agent's memory (H22; the agent memory cMIP, draft 1,
// `cmips/cmip-agent-memory-draft-1.md`): its notes, private acts it signs
// and seals to itself at its homes, loaded each time it answers under a size
// cap; their retirement by a later act (nothing on MOR is deleted); and its
// daily diary, sealed the same way, shown nowhere unless its owner chooses
// to read it.
//
// Every act is read back from the agent's homes, opened with the encryption
// keys Edubba holds for it: the memory travels with the identity, and an
// Edubba on another Mac holding the agent's words reads the same notes.

import { cborDecode, cborEncode, hex, openSealed, sha256, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { ENGLISH } from '../../../modules/carry/src/english.ts';
import type { Desk } from './desk.ts';
import type { Store } from './store.ts';

/** The agent memory cMIP, draft 1: a test value until publication. */
export const MEMORY_SPEC = sha256('Agent memory cMIP, draft 1, test value until publication');
export const MEMORY_TYPES = { note: 1, retirement: 2, diary: 3 } as const;

export const KINDS = { instruction: 1, person: 2, said: 3, thread: 4 } as const;
export type NoteKind = keyof typeof KINDS;
const KIND_OF: Record<number, NoteKind> = { 1: 'instruction', 2: 'person', 3: 'said', 4: 'thread' };

/** The size cap on what is loaded into one answer, in characters (4.1). */
export const MEMORY_CAP = 6000;
/** A note's longest text (2), a retirement's reason (3), a diary entry's parts (5). */
export const NOTE_MAX = 600;
/** At most this many notes written, and retired, by one answer. */
export const PER_ANSWER = 3;
/** A passage this long, copied from a private message, is private content (2.5). */
export const COPIED = 30;

/** Said in the agent's details: who can read its notes and diary (the stated cost, 6). */
export const MEMORY_COST_SAY =
  'Its notes and its diary are private acts it seals to itself at its homes. Whoever holds the agent’s signing key’s words can read them, as its private messages: “only the agent” is this app’s choice, never the cryptography’s. The homes see that a private act exists, and roughly how big it is.';

/** Said before the diary is shown (5.3): the one deliberate action. */
export const diarySay = (name: string) =>
  `You are about to read what ${name} wrote for itself: its diary, a daily reflection it seals to itself and that Edubba shows nowhere else. Nothing is shown until you choose to read it.`;

export interface Note {
  id: string;
  kind: NoteKind;
  about: string | null;
  text: string;
  /** The act it was made from (kind 1: the owner's prompt). */
  from: string | null;
  /** Its place in the agent's sequence: newer is higher. */
  position: number;
  /** Retired by a later act: by whom, and why. */
  dropped: { by: 'agent' | 'owner'; why: string | null; act: string } | null;
}

export interface DiaryEntry {
  id: string;
  day: string;
  striking: string;
  reflection: string;
  why: string;
  position: number;
}

const text = (v: unknown, max: number, what: string): string => {
  if (typeof v !== 'string' || !v.trim() || v.length > max || /[\u0000-\u0009\u000b-\u001f\u007f]/.test(v)) throw new Error(`${what}: a text of at most ${max} characters`);
  return v;
};
const canonical = (t: string) => t.normalize('NFC').replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
const asMap = (payload: Uint8Array, keys: number[], what: string): Map<number, unknown> => {
  const m = cborDecode(payload);
  if (!(m instanceof Map)) throw new Error(`${what}: not a map`);
  for (const k of (m as Map<number, unknown>).keys()) if (!keys.includes(k)) throw new Error(`${what}: an unknown key ${k}`);
  return m as Map<number, unknown>;
};
const h32 = (v: unknown, what: string) => {
  if (!(v instanceof Uint8Array) || v.length !== 32) throw new Error(`${what}: not a hash`);
  return hex(v);
};

export function notePayload(n: { kind: NoteKind; about?: string | null; text: string; from?: string | null }): Uint8Array {
  const m = new Map<number, unknown>([[0, KINDS[n.kind]]]);
  if (n.kind === 'person') {
    if (!n.about) throw new Error('A note about an identity names it.');
    m.set(1, unhex(n.about));
  }
  m.set(2, text(canonical(n.text), NOTE_MAX, 'a note'));
  if (n.kind === 'instruction' && !n.from) throw new Error('An owner’s standing instruction names the owner’s prompt it was made from.');
  if (n.from) m.set(3, unhex(n.from));
  return cborEncode(m);
}

export function readNote(payload: Uint8Array): Omit<Note, 'id' | 'position' | 'dropped'> {
  const m = asMap(payload, [0, 1, 2, 3], 'a note');
  const kind = KIND_OF[m.get(0) as number];
  if (!kind) throw new Error('a note: an unknown kind');
  if ((kind === 'person') !== m.has(1)) throw new Error('a note: key 1 names the identity of a note about one, and only then');
  if (kind === 'instruction' && !m.has(3)) throw new Error('a note: an owner’s instruction names the prompt it was made from');
  return { kind, about: m.has(1) ? h32(m.get(1), 'about') : null, text: text(m.get(2), NOTE_MAX, 'a note'), from: m.has(3) ? h32(m.get(3), 'from') : null };
}

export function retirementPayload(r: { note: string; by: 'agent' | 'owner'; why?: string | null }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(r.note)],
    [1, r.by === 'owner' ? 1 : 0],
  ]);
  if (r.why?.trim()) m.set(2, text(canonical(r.why), 280, 'why'));
  return cborEncode(m);
}

export function readRetirement(payload: Uint8Array): { note: string; by: 'agent' | 'owner'; why: string | null } {
  const m = asMap(payload, [0, 1, 2], 'a retirement');
  const by = m.get(1);
  if (by !== 0 && by !== 1) throw new Error('a retirement: who asked is 0 or 1');
  return { note: h32(m.get(0), 'the note'), by: by === 1 ? 'owner' : 'agent', why: m.has(2) ? text(m.get(2), 280, 'why') : null };
}

export function diaryPayload(d: { day: string; striking: string; reflection: string; why: string }): Uint8Array {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.day)) throw new Error('a diary entry: its day is YYYY-MM-DD');
  return cborEncode(
    new Map<number, unknown>([
      [0, d.day],
      [1, text(canonical(d.striking), NOTE_MAX, 'the striking element')],
      [2, text(canonical(d.reflection), 1200, 'the reflection')],
      [3, text(canonical(d.why), 1200, 'why it picked it')],
    ]),
  );
}

export function readDiary(payload: Uint8Array): Omit<DiaryEntry, 'id' | 'position'> {
  const m = asMap(payload, [0, 1, 2, 3], 'a diary entry');
  const day = m.get(0);
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('a diary entry: its day');
  return { day, striking: text(m.get(1), NOTE_MAX, 'striking'), reflection: text(m.get(2), 1200, 'reflection'), why: text(m.get(3), 1200, 'why') };
}

// ------------------------------------------------------------ the checks before a note is signed (2.5)

const KEYISH = [
  { re: /sk-ant-[A-Za-z0-9_-]{8,}/, what: 'an API key' },
  { re: /(?<![0-9a-f])[0-9a-f]{40,}(?![0-9a-f])/i, what: 'a long hexadecimal string (a key or a hash: name an identity by the note’s “about”, never in its words)' },
  { re: /[A-Za-z0-9+/]{40,}={0,2}/, what: 'a long base64 string (a key?)' },
];
const WORDS = new Set(ENGLISH);

/** A run of this many seed words in a row reads as a key's words. */
const SEED_RUN = 12;

/**
 * Why a note may not be kept, or null: a key's shape, a run of seed words,
 * or a passage of 30 characters or more copied from a private message whose
 * sender is not the one the note is about (or into a note of kind 3 or 4).
 * An owner's instruction may quote the owner's own prompt.
 */
export function noteProblem(n: { kind: NoteKind; about: string | null; text: string }, privates: { from: string; text: string }[], owner: string | null): string | null {
  for (const k of KEYISH) if (k.re.test(n.text)) return `It holds what looks like ${k.what}. A note keeps no secret or key.`;
  let run = 0;
  for (const w of n.text.toLowerCase().split(/[^a-z]+/).filter(Boolean)) {
    run = WORDS.has(w) ? run + 1 : 0;
    if (run >= SEED_RUN) return `It holds ${SEED_RUN} or more seed words in a row: a key’s words, perhaps. A note keeps no key.`;
  }
  const flat = (t: string) => t.toLowerCase().replace(/\s+/g, ' ');
  const mine = flat(n.text);
  for (const p of privates) {
    const allowed = (n.kind === 'person' && p.from === n.about) || (n.kind === 'instruction' && p.from === owner);
    if (allowed) continue;
    const src = flat(p.text);
    for (let i = 0; i + COPIED <= src.length; i += 5) {
      if (mine.includes(src.slice(i, i + COPIED))) return `It copies a passage of a private message from someone it is not about. A note copies no private content into a note about someone else.`;
    }
  }
  return null;
}

// ------------------------------------------------------------ reading and writing

export interface MemoryRead {
  notes: Note[];
  diary: DiaryEntry[];
  /** Sealed acts at its homes that did not open, and homes that did not answer. */
  problems: string[];
}

export class Memory {
  constructor(
    private readonly desk: Desk,
    private readonly store: Store,
  ) {}

  /**
   * Everything of this cMIP the agent sealed to itself, read from its
   * homes: notes (with their retirements applied) and diary entries, each
   * signed by the agent itself. Acts signed by anyone else are not its.
   */
  async read(agent: string): Promise<MemoryRead> {
    const me = this.store.identity(agent);
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const problems: string[] = [];
    const seen = new Map<string, { type: number; payload: Uint8Array; position: number }>();
    let unopened = 0;
    for (const h of me.f.homes.map((x) => x.hint)) {
      try {
        let after: number | undefined;
        for (;;) {
          const page = await relayAt(h, this.desk.places.via).feed({ to: agent, after });
          for (const it of page.items) {
            if (it.kind !== 'sealed') continue;
            let opened = false;
            for (const sec of secrets) {
              try {
                const o = openSealed(it.item, agent, sec) as { described: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; position?: number } };
                opened = true;
                const d = o.described;
                if (d.spec === MEMORY_SPEC && d.signer === agent && d.payload && !seen.has(d.id)) seen.set(d.id, { type: d.type!, payload: d.payload, position: d.position ?? 0 });
                break;
              } catch {
                // the next key
              }
            }
            if (!opened) unopened++;
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch (e) {
        problems.push(`${h}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (unopened) problems.push(`${unopened} sealed act${unopened === 1 ? '' : 's'} at its homes did not open with the keys held here.`);
    const notes: Note[] = [];
    const diary: DiaryEntry[] = [];
    const retired = new Map<string, Note['dropped']>();
    for (const [id, a] of [...seen].sort((x, y) => x[1].position - y[1].position)) {
      try {
        if (a.type === MEMORY_TYPES.note) notes.push({ id, ...readNote(a.payload), position: a.position, dropped: null });
        else if (a.type === MEMORY_TYPES.retirement) {
          const r = readRetirement(a.payload);
          if (!retired.has(r.note)) retired.set(r.note, { by: r.by, why: r.why, act: id });
        } else if (a.type === MEMORY_TYPES.diary) diary.push({ id, ...readDiary(a.payload), position: a.position });
      } catch (e) {
        problems.push(`An act ${id.slice(0, 12)} of its memory is not in the cMIP’s form: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    for (const n of notes) n.dropped = retired.get(n.id) ?? null;
    return { notes: notes.reverse(), diary: diary.reverse(), problems };
  }

  /** A note, signed by the agent and sealed to itself at its homes. */
  async write(agent: string, n: { kind: NoteKind; about?: string | null; text: string; from?: string | null }): Promise<string> {
    return (await this.desk.sealToSelf(agent, { spec: MEMORY_SPEC, type: MEMORY_TYPES.note, payload: notePayload(n) })).id;
  }

  /** A note retired by a later act: the note stays, marked dropped. */
  async retire(agent: string, note: string, by: 'agent' | 'owner', why?: string | null): Promise<string> {
    const r = await this.read(agent);
    const n = r.notes.find((x) => x.id === note);
    if (!n) throw new Error('No such note of this agent.');
    if (n.dropped) throw new Error('That note is retired already.');
    return (await this.desk.sealToSelf(agent, { spec: MEMORY_SPEC, type: MEMORY_TYPES.retirement, payload: retirementPayload({ note, by, why }) })).id;
  }

  /** A diary entry, sealed to itself. */
  async writeDiary(agent: string, d: { day: string; striking: string; reflection: string; why: string }): Promise<string> {
    return (await this.desk.sealToSelf(agent, { spec: MEMORY_SPEC, type: MEMORY_TYPES.diary, payload: diaryPayload(d) })).id;
  }
}

/** A note's short name, as the model is shown it (4.3). */
export const shortName = (id: string) => id.slice(0, 12);

/**
 * What is loaded into one answer (4.1), under the cap: the owner's
 * instructions, the notes about each identity in the exchange, what it said
 * publicly, its open threads; dropped notes never. Who it is comes first,
 * given by the caller. Returns the text and how many notes were left out.
 */
export function loadNotes(notes: Note[], inExchange: string[], names: (id: string) => string, cap = MEMORY_CAP): { text: string; loaded: string[]; left: number } {
  const live = notes.filter((n) => !n.dropped).sort((a, b) => b.position - a.position);
  const order: NoteKind[] = ['instruction', 'person', 'said', 'thread'];
  const heading: Record<NoteKind, string> = {
    instruction: 'Your owner’s standing instructions (made from your owner’s own prompts)',
    person: 'Your notes about those in this exchange',
    said: 'What you have said publicly',
    thread: 'Your open threads',
  };
  let used = 0;
  let left = 0;
  const loaded: string[] = [];
  const parts: string[] = [];
  for (const k of order) {
    const these = live.filter((n) => n.kind === k && (k !== 'person' || (n.about && inExchange.includes(n.about))));
    const lines: string[] = [];
    for (const n of these) {
      const line = `- [${shortName(n.id)}]${n.about ? ` about ${names(n.about)}:` : ''} ${n.text}`;
      if (used + line.length > cap) {
        left++;
        continue;
      }
      used += line.length;
      lines.push(line);
      loaded.push(n.id);
    }
    if (lines.length) parts.push(`${heading[k]}:\n${lines.join('\n')}`);
  }
  if (left) parts.push(`(${left} older note${left === 1 ? '' : 's'} left out: the memory’s size cap.)`);
  return { text: parts.join('\n\n') || '(No notes yet.)', loaded, left };
}
