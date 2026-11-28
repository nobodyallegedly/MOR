// Edubba reading an act of Agreements draft 25 (encoding 2) that reaches an
// identity: until this file, such an act was filed as "other" and nothing of
// it was read (`desk.ts`, `readItem`). The collective client's library reads
// it (`../../collective/src/agreements-25.ts`, the core library's draft-25
// binding) and says it in plain words (`explain-25.ts`): what it is, each
// field as written, the checker's verdict, and whether the Terms are in force
// among the acts this identity holds, as the grammar verifier answers.
//
// Program only: the web build replaces this file by `web/agreements-25.ts`,
// which says that such acts are read in the program on a computer (the
// draft-25 binding is not in the web release).
//
// TEST IDENTITIES ONLY.

import { isSpec25, opened, read, type Held } from '../../collective/src/agreements-25.ts';
import { explain25 } from '../../collective/src/explain-25.ts';

/** What Edubba files for an act of draft 25: its kind, a line saying what it is, and its reading. Null for an act of any other specification. */
export interface Draft25Item {
  kind: 'terms' | 'other';
  problem: string;
  assessment: { heading: string; lines: { text: string; tone?: 'warn' | 'bad' | 'ok' }[] }[];
  /** Its fields as read, by the builders' names (the kit's AGREEMENTS-FIELDS.md), or null where they cannot be given; and the checker's verdict. Kept with the item, not shown as such. */
  fields?: Record<string, unknown> | null;
  verdict?: string;
}

export function draft25Item(spec: string | undefined, act: Uint8Array, key: Uint8Array | undefined, held: Held[], names: (id: string) => string): Draft25Item | null {
  if (!isSpec25(spec)) return null;
  // Only acts of draft 25 are held for its checker and grammar: anything else an identity received is no act of theirs.
  held = held.filter((h) => isSpec25(opened(h.act, h.key)?.spec));
  const r = read(act, key, held);
  if (!r) return null;
  const { title, sections } = explain25(r, [...held, { act, key }], names);
  const problem =
    r.act === 'terms'
      ? `${title}: read below. Signing them states them, it is no assent; an assent is a Statement of its own (G4.1, draft 25, section 3.2).`
      : r.check.verdict === 'pass'
        ? `${title}: read below.`
        : `${title}, which the checker does not pass (${r.check.verdict}${r.check.rule ? `, ${r.check.rule}` : ''}): it counts for nothing.`;
  return { kind: r.act === 'terms' ? 'terms' : 'other', problem, assessment: sections, fields: r.fields, verdict: r.check.verdict };
}
