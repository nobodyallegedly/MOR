// Notes (hand test v3, H122, decided for Dub's next round): a note is a
// private text act sealed to oneself (`to` naming only the identity), left at
// its homes, so any app holding the identity opens it, through Kišib's
// runner where it may open. The notes cMIP, draft 1
// (`cmips/cmip-notes-draft-1.md`, the suite's) marks a text act as a note by
// its format, and says how a note changes: nothing is updated. **Edit**
// signs a new version naming the one it corrects first in its references
// (as the corrections cMIP does), the latest shown, the earlier ones kept;
// **Retire** signs a version with no text, marking the note dropped (it
// stays, readable, as the agent memory cMIP's notes do).
//
// Nothing from Node: the web client runs it too.

import { MIRS, SPECS, Verifier, cborDecode, hex, sha256 } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { leaveAtHomes } from '../../genesis/src/private.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { TEXT_ACT } from '../../barebone/src/specs.ts';
import { openerOf, type Opener } from './people.ts';

/** The notes cMIP, draft 1: the format a text act names to be a note (a test value until publication). */
export const NOTES_FORMAT = sha256('Notes cMIP, draft 1, test value until publication');

/** A note's longest text, in characters: a note, not a document. */
export const NOTE_MAX = 20_000;

/** One version of a note, as signed. */
export interface NoteVersion {
  id: string;
  /** Its text; empty for the version retiring the note. */
  text: string;
  /** Its place in the identity's own chain of acts: later is greater. */
  position: number;
  /** The version it corrects, or null for the first. */
  corrects: string | null;
}

/** A note: its versions, the latest first. */
export interface Note {
  /** The first version's act: the note's own ID. */
  id: string;
  versions: NoteVersion[];
  /** Retired: its latest version has no text (the note dropped, kept readable). */
  retired: boolean;
}

/** A note's text payload: the Text MIR's, its format the notes cMIP's. */
function readNoteText(payload: Uint8Array): string | null {
  try {
    const m = cborDecode(payload) as Map<number, unknown>;
    const text = m.get(0);
    const format = m.get(1);
    if (typeof text !== 'string' || !(format instanceof Uint8Array) || hex(format) !== NOTES_FORMAT) return null;
    return text;
  } catch {
    return null;
  }
}

/** Every note at the identity's homes, opened with the keys held here or through Kišib's runner; each valid version, its corrections chained. */
export async function readNotes(me: TestIdentity, keys: Uint8Array[] | Opener, via: Via = {}): Promise<{ notes: Note[]; problems: string[] }> {
  const problems: string[] = [];
  if (Array.isArray(keys) && !keys.length) return { notes: [], problems: ['this app holds no encryption key of this identity, so its notes do not open here'] };
  const open: Opener = Array.isArray(keys) ? openerOf(me.id, keys) : keys;
  const homes = me.f.homes.map((h) => h.hint);
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l: Awaited<ReturnType<typeof lookUp>>;
  try {
    l = await lookUp(me.id, homes, via, v);
  } catch (e) {
    return { notes: [], problems: [`its homes did not answer (${e instanceof Error ? e.message : String(e)})`] };
  }
  const versions = new Map<string, NoteVersion>();
  for (const h of [...new Set([...homes, ...l.resolution.homes.map((x) => x.hint)])]) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ to: me.id, after });
        const sealed = page.items.filter((it) => it.kind === 'sealed').map((it) => it.item);
        const opened = sealed.length ? await open(sealed) : [];
        for (const o of opened) {
          const d = o?.described as { id: string; signer?: string; position?: number; public: boolean; to?: string[]; spec?: string; type?: number; payload?: Uint8Array; refs?: string[] } | undefined;
          if (!o || !d || versions.has(d.id) || d.public || d.signer !== me.id || d.spec !== SPECS.text || d.type !== TEXT_ACT || !d.payload) continue;
          // Sealed to oneself alone: a message to others is no note.
          if ((d.to ?? []).some((x) => x !== me.id)) continue;
          const text = readNoteText(d.payload);
          if (text === null) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== 'valid') continue;
          versions.set(d.id, { id: d.id, text, position: d.position ?? 0, corrects: d.refs?.[0] ?? null });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e) {
      problems.push(`${h}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  // Each version's note: the first of its chain of corrections. A version correcting one not found starts a note of its own.
  const rootOf = (x: NoteVersion): string => {
    const seen = new Set<string>();
    let at = x;
    while (at.corrects && versions.has(at.corrects) && !seen.has(at.id)) {
      seen.add(at.id);
      at = versions.get(at.corrects)!;
    }
    return at.id;
  };
  const byNote = new Map<string, NoteVersion[]>();
  for (const x of versions.values()) {
    const r = rootOf(x);
    byNote.set(r, [...(byNote.get(r) ?? []), x]);
  }
  const notes = [...byNote.entries()].map(([id, vs]) => {
    const sorted = vs.sort((a, b) => b.position - a.position || (a.id < b.id ? -1 : 1));
    return { id, versions: sorted, retired: sorted[0].text === '' };
  });
  // Latest first, by its latest version.
  notes.sort((a, b) => b.versions[0].position - a.versions[0].position);
  return { notes, problems };
}

/**
 * Sign a note, or a new version of one (`corrects`: the version it
 * replaces), sealed to the identity's own encryption key and left at its
 * homes. `text` empty retires the note. Returns the act's ID.
 */
export async function writeNote(me: TestIdentity, a: { text: string; corrects?: string | null }, o: { via?: Via; sign: <T>(f: () => Promise<T>) => Promise<T> }): Promise<string> {
  const via = o.via ?? {};
  const text = a.text.normalize('NFC');
  if ([...text].length > NOTE_MAX) throw new Error(`A note holds at most ${NOTE_MAX.toLocaleString('en')} characters. Nothing was signed.`);
  if (!text.trim() && !a.corrects) throw new Error('Write something in the note. Nothing was signed.');
  const homes = me.f.homes.map((h) => h.hint);
  const look = await lookUp(me.id, homes, via);
  if (!look.encryptionKey) throw new Error('This identity publishes no encryption key, so nothing can be sealed to it. Nothing was signed.');
  const made = await o.sign(() => me.signNow(SPECS.text, TEXT_ACT, textPayload(text, NOTES_FORMAT), { public: false, to: [me.id], ...(a.corrects ? { refs: [a.corrects] } : {}) }));
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
  let left = 0;
  for (const h of homes) {
    try {
      await relayAt(h, via).putSealed(sealed);
      left++;
    } catch {
      // that home is away: the others hold it
    }
  }
  // Its locked act beside it (H80's question 2): this app's line, which Kišib places by the acts at the homes.
  await o.sign(() => leaveAtHomes(me, made, { via, sealed: left > 0 }));
  if (!left) throw new Error('No home took the note: it is signed, not kept. Try again.');
  return made.id;
}
