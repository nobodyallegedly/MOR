// An act of Agreements draft 25 (encoding 2) in plain words, from its fields
// as `agreements-25.ts` reads them: what it is, each field as written, the
// defaults draft 25 gives where one is left out, the checker's verdict, and
// the grammar verifier's answer on whether the Terms are in force.
//
// Nothing here reads what Terms say: their words are named by fingerprint,
// and how to read them is the cMIP in their body's socket (task K1), which
// this client does not hold. It says so.
//
// TEST IDENTITIES ONLY.

import { PASS_MEANS, GRAMMAR_SAYS, answerLine, inForce, rootOf, verdictLine, type Fields, type Held, type Read25 } from './agreements-25.ts';

export interface Section25 {
  heading: string;
  lines: { text: string; tone?: 'warn' | 'bad' | 'ok' }[];
}

type Names = (id: string) => string;

const socket = (s: unknown): string => {
  const x = s as { cmip?: string; params?: string } | undefined;
  return x?.cmip ? `the cMIP ${x.cmip}, with parameters ${x.params === 'f6' ? 'none (null)' : `CBOR ${x.params}`}` : 'no cMIP';
};
const who = (w: unknown, names: Names): string => {
  const x = w as { signer?: string; agreement?: string };
  return x.signer ? `${names(x.signer)} (${x.signer})` : x.agreement ? `the agreement with the root ${x.agreement}` : 'nobody';
};

function party(p: Fields, i: number, names: Names): string {
  if (typeof p.signer === 'string') return `${i}. ${names(p.signer)} (${p.signer}), a signer`;
  if (typeof p.agreement === 'string') return `${i}. the agreement with the root ${p.agreement}`;
  const r = p.role as { kind: string; what?: string; spot: unknown };
  return `${i}. a role of kind ${r.kind}${r.what ? `, its what ${r.what}` : ''}; who fills it is said by ${socket(r.spot)} (task K5)`;
}

/** Terms' fields, one line each, with draft 25's defaults where one is left out. */
export function termsLines(f: Fields, names: Names): string[] {
  const out: string[] = [];
  const parties = (f.parties as Fields[] | undefined) ?? [];
  if (f.replaces) out.push(`A new version: it replaces ${f.replaces as string}, of the agreement with the root ${f.agreement as string} (G4.8). It replaces it only if that version’s update condition answers valid for it (G4.11).`);
  if (parties.length) out.push(`Parties: ${parties.map((p, i) => party(p, i, names)).join('; ')}.`);
  if (f.authors) out.push(`Written by party ${(f.authors as number[]).join(', party ')} (G3).`);
  const b = f.body as { words: string; cmip: string; params: string } | undefined;
  if (b) out.push(`Their words: named by the fingerprint ${b.words}, read as ${socket(b)} says (task K1). This client holds no cMIP that reads them: read the words themselves before you assent.`);
  for (const [k, task, what] of [
    ['inForce', 'K2', 'In force'],
    ['condition', 'K4', 'Update condition'],
    ['control', 'K6', 'Control'],
    ['data', 'K8', 'Data'],
  ] as const) {
    if (f[k]) out.push(`${what}: ${socket(f[k])} (task ${task}).`);
  }
  for (const p of (f.powers as { kind: string; rule: unknown }[] | undefined) ?? []) out.push(`A power of kind ${/^[0-9a-f]{64}$/.test(p.kind) ? `the kind the cMIP ${p.kind} defines` : p.kind}, its rule ${socket(p.rule)} (task K3).`);
  if (f.receiver !== undefined) out.push(`Receiver: ${typeof f.receiver === 'number' ? `party ${f.receiver}` : `the agreement with the root ${f.receiver as string}`} (G1.3).`);
  for (const c of (f.calls as { task: number; from: string }[] | undefined) ?? []) out.push(`A call for reports on task K${c.task}, from ${c.from === 'doer' ? 'the doer' : c.from === 'both' ? 'both sides' : 'the receiving side'} (G11).`);
  if (f.envelope) out.push(`For the baked work ${f.envelope as string}, citing the act ${f.envelopeAt as string} of its chain (G14).`);
  if (f.place) out.push(`Its place: ${f.place as string} (G7).`);
  if (f.clock) out.push(`Its clock: ${f.clock as string} (G7).`);
  if (f.reliesOn) out.push(`It relies on: ${(f.reliesOn as string[]).join(', ')} (G13).`);
  if (f.resolves) out.push(`It resolves a fork of the tips ${(f.resolves as string[]).join(', ')}${f.continues ? `; the tip that continues: ${f.continues as string}` : ', naming none that continues: it resolves nothing (G12.3)'}.`);
  out.push(`Previous act of its signer in this agreement: ${(f.previous as string | null) ?? 'none'} (G6.1).`);
  if (f.resolves && f.continues) return out;
  if (!f.inForce) out.push('In force: no cMIP named. Draft 25’s default: in force once there is an assent in the name of every party named as a signer, its author included (G4.1).');
  if (!f.condition) out.push('Update condition: no cMIP named. Draft 25’s default: an update is valid when everyone who signed the original signs it (G4.11(e)).');
  if (!f.powers) out.push('No powers: no act made in another’s name under these Terms binds that other (G5.1(b)).');
  return out;
}

const KIND_WORDS: Record<string, string> = {
  assent: 'An assent: its signer agrees to the Terms it names. It binds them only while those Terms are in force (G4.3).',
  counter_signature: 'A counter signature: it cancels its signer’s assent to the Terms it names, if those Terms are not in force yet (G4.10).',
  contest: 'A contest against the version of an offer or vow it names: it stands on the record and reaches its signers; it moves no money (G11.8).',
  resolve: 'A resolve: a resolving update in its signer’s own line (G12.3).',
};

/** A Statement's fields, one line each. */
export function statementLines(f: Fields, names: Names): string[] {
  const out: string[] = [];
  const k = f.kind;
  out.push(typeof k === 'string' ? KIND_WORDS[k] : `A Statement of a kind ${socket(k)} defines (task K7): this client cannot read what it states.`);
  out.push(`Within the Terms ${f.terms as string}, of the agreement with the root ${f.agreement as string}.`);
  if (f.for) out.push(`Made in the name of ${who(f.for, names)}, under the Terms ${f.under as string}: it binds them only where those Terms give a power for this kind and its rule says yes (G5.1(b)).`);
  if (f.settlement) out.push(`Tied to the settlement ${f.settlement as string} (G8, G11).`);
  if (f.content) out.push(`Its content, as written (CBOR): ${f.content as string}.`);
  if (f.answers) out.push(`It answers: ${(f.answers as string[]).join(', ')}.`);
  if (f.resolves) out.push(`Tips of the fork in its signer’s line: ${(f.resolves as string[]).join(', ')}; the one that continues: ${f.continues as string}.`);
  if (f.reliesOn) out.push(`It relies on: ${(f.reliesOn as string[]).join(', ')} (G13).`);
  out.push(`Previous act of its signer in this agreement: ${(f.previous as string | null) ?? 'none'} (G6.1).`);
  return out;
}

/** A report's fields, one line each (the report block's fourth proposal: a proposal). */
export function reportLines(f: Fields, names: Names): string[] {
  const out: string[] = [];
  const c = f.call as { act: string; task?: number };
  out.push(`A report answering the call ${c.task ? `on task K${c.task} in the Terms ${c.act}` : `made by default by the act ${c.act}`} (the report block, a proposal).`);
  for (const [i, l] of ((f.lines as Fields[] | undefined) ?? []).entries()) {
    const a = l.amount as { unit: string; value: number };
    const amount = `${a.value} of the unit ${a.unit}`;
    out.push(`Line ${i}: ${l.line}, ${amount}${l.to ? `, to ${who(l.to, names)}` : ''}${l.by ? `, by the act ${l.by as string}` : ''}${l.closes ? `, closing line ${(l.closes as [string, number])[1]} of the report ${(l.closes as [string, number])[0]}` : ''}.`);
  }
  if (f.reliesOn) out.push(`It relies on: ${(f.reliesOn as string[]).join(', ')}.`);
  return out;
}

/** An act of draft 25 read in plain words: what it is, its fields, the checker, and, for Terms or an assent, whether the Terms are in force among the acts held. */
export function explain25(r: Read25, held: Held[], names: Names): { title: string; sections: Section25[] } {
  const title = r.act === 'terms' ? 'Terms (Agreements draft 25)' : r.act === 'statement' ? 'A Statement (Agreements draft 25)' : r.act === 'report' ? 'A report (the report block, proposal 4)' : 'An act under draft 25’s spec hash of no type it gives';
  const sections: Section25[] = [];
  const pass = r.check.verdict === 'pass';
  sections.push({ heading: 'The checker', lines: [{ text: verdictLine(r.check), tone: pass ? 'ok' : 'bad' }, { text: PASS_MEANS }] });
  if (r.fields) {
    const lines = r.act === 'terms' ? termsLines(r.fields, names) : r.act === 'statement' ? statementLines(r.fields, names) : reportLines(r.fields, names);
    sections.push({ heading: 'As written', lines: lines.map((text) => ({ text })) });
  } else if (pass) sections.push({ heading: 'As written', lines: [{ text: 'Its fields could not be read back as the core’s builder writes them: not shown.', tone: 'warn' }] });
  const terms = r.act === 'terms' && !(r.fields?.resolves && r.fields?.continues) ? r.id : r.act === 'statement' && r.fields?.kind === 'assent' ? (r.fields.terms as string) : null;
  if (pass && terms && rootOf(r)) {
    const lines: Section25['lines'] = [{ text: GRAMMAR_SAYS }];
    try {
      for (const a of inForce(held, terms)) lines.push({ text: `Whether the Terms ${terms} are in force: ${answerLine(a)}.`, tone: a.word === 'shown' ? 'ok' : 'warn' });
    } catch (e) {
      lines.push({ text: `The grammar verifier could not answer: ${e instanceof Error ? e.message : String(e)}.`, tone: 'warn' });
    }
    sections.push({ heading: 'In force?', lines });
  }
  return { title, sections };
}
