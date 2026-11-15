// The new Agreements acts in Kišib: Terms and Statement (Agreements written
// from scratch, `docs/agreements-from-scratch/draft-25.md`, in the bytes of
// `encoding-2.md`), and the report (the report block's fourth proposal,
// `docs/lead/proposals/report-block-4.md`, a proposal), each built from the
// binding's builders, checked by the binding's checker before anything is
// signed with an identity's key, and said on the screen as written.
//
// In plain words: an app (through the runner) or the person (on the command
// line) gives the act's fields; Kišib writes its bytes with the core
// library's builder, signs a draft of it with a throwaway key, never the
// identity's, and runs the checker on that draft. Only an act that passes
// is offered for signing, with the checker's verdict, the rule it names and
// what a pass does not mean. The identity's own act is checked again before
// it leaves Kišib.
//
// The client conformance rule (decided by Nobody, allegedly, 11 November:
// before a signature that binds a person to terms, the client shows what its
// terms-reading cMIP produces from them, names that cMIP, and shows what the
// person can always do). No terms-reading cMIP for draft 25 exists: Kišib
// says so, shows the Terms' fields as written, and shows what draft 25 itself
// says a person can do whatever Terms say, by its rule numbers, and what it
// does not give (`ALWAYS_SAY`). The suite lead's lean, not decided.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { randomBytes } from 'node:crypto';
import {
  agreementsNewAsk,
  agreementsNewCheck,
  agreementsNewCheckHeld,
  agreementsNewReportPayload,
  agreementsNewSpecs,
  agreementsNewStatementPayload,
  agreementsNewTermsPayload,
  cborDecode,
  describeAct,
  hex,
  makeEveryday,
  openWithKey,
  unhex,
  workHash,
} from '../../genesis/src/core.ts';

/** The three new acts. */
export type NewAct = 'terms' | 'statement' | 'report';
export const NEW_ACTS: readonly NewAct[] = ['terms', 'statement', 'report'];

/** Their spec hashes and types (encoding 2, E2), from the binding. Acts under encoding 1's are "not this encoding". */
export const NEW_SPECS = agreementsNewSpecs() as Record<NewAct, { spec: string; type: number }>;

/** The act a spec hash and type name, or null (a type the encoding does not give: the checker rejects it, E2). */
export function newActOf(spec: string, type: number): NewAct | null {
  for (const a of NEW_ACTS) if (NEW_SPECS[a].spec === spec && NEW_SPECS[a].type === type) return a;
  return null;
}

/** A spec hash of the new acts, whatever the type: every act under it is checked before it is signed. */
export const isNewSpec = (spec: string): boolean => NEW_ACTS.some((a) => NEW_SPECS[a].spec === spec);

/** The checker's answer (encoding 2, section 9). */
export interface Answer {
  verdict: 'pass' | 'rejected' | 'invalid' | 'unknown' | 'cannot open' | 'not this encoding';
  act: string | null;
  id: string | null;
  signer: string | null;
  rule: string | null;
  says: string;
  invalid: { rule: string; says: string }[];
  notes: { rule: string; says: string }[];
}

/** An act a verifier holds beside the one checked: its bytes, and its content key if it is private. */
export interface Held {
  act: Uint8Array;
  key?: Uint8Array | null;
}

/** Said beside every verdict: what a pass is, and what it is not. */
export const PASS_MEANS_SAY =
  'A pass means only that the bytes are well formed and signed. It gives none of the grammar’s answers: whether Terms are in force, whether two acts are a fork, who receives, whether an act is late, or the baker’s rights. Those are the grammar verifier’s, which rests for now on stub cMIPs and stand-in layers: provisional.';

/** Said before a signature that binds a person to Terms: no reader exists (the suite lead's lean, not decided). */
export const NO_READER_SAY = 'No terms-reading cMIP for Agreements draft 25 exists yet: this is the text as written, not a reading of it';

/**
 * What draft 25 itself says a person can do whatever Terms say, by rule,
 * and what it does not give. Draft 25 has no list of what a person can
 * always do (the earlier Agreements' rule 98, the way out, has no
 * counterpart in it): these are the grammar rules that hold whatever Terms
 * say, each with its limit, and the one thing it plainly does not give,
 * which its own stated cost says ("No default way out", section 7).
 */
export const ALWAYS_SAY: readonly string[] = [
  'What you can always do: Agreements draft 25 has no list of it. These are its grammar rules that hold whatever these Terms say:',
  'You are bound by an act only if you signed it in your own name; or it was made for you under a power in Terms you are bound by, and that power’s rule says yes; or it is an update that the update condition of Terms you are bound by answers valid (G5.1). An act with no “for” and no “under” is made in its signer’s name only (G5.3).',
  'An assent binds you only while the Terms it names are in force (G4.3).',
  'Until the Terms are in force, you can cancel your assent with a counter signature (G4.10). Once they are in force, a counter signature changes nothing.',
  'Against an offer or a vow (Terms that name a party by role), you can make a contest: it reaches their signers and stands on the record; it moves no money (G11.8; section 7).',
  'A delegator can end a delegation at any time, by default: only where its Terms name no update condition and state no condition on ending it (G5.5).',
  'What draft 25 does not give you: a way to leave Terms once they are in force. An agreement never ends (G4.9); by default an update needs everyone who signed the original (G4.11(e)); a party can leave alone only where the Terms’ update condition answers valid for that (section 5.2, task K4), and Kišib reads no update condition. Draft 25 says so itself: “No default way out” (section 7).',
];

/** A refusal: the rule named and what it says. Nothing was signed. */
export class AgreementsRefusal extends Error {
  constructor(
    readonly rule: string | null,
    readonly says: string,
    message: string,
  ) {
    super(message);
  }
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** A builder's error, read as the rule it names ("E19: …"), or none. */
function ruleOf(e: unknown): { rule: string | null; says: string } {
  const m = /^((?:E|G)\d+(?:\.\d+)?|Envelopes rule \d+): ([\s\S]*)$/.exec(errorText(e));
  return m ? { rule: m[1], says: m[2] } : { rule: null, says: errorText(e) };
}

/**
 * The input as JSON gives it, for the binding's builder: a socket's
 * `params` and a Statement's `content`, CBOR bytes, are written in hex in
 * JSON; everything else is as the builder takes it (encoding 2; the
 * binding's `agreements_new_js.rs`).
 */
function forBuilder(v: unknown, key = ''): unknown {
  if ((key === 'params' || key === 'content') && typeof v === 'string') {
    if (!/^([0-9a-f]{2})*$/.test(v)) throw new AgreementsRefusal(null, `${key} is CBOR bytes, written in hex`, `The ${key} given is not CBOR bytes in hex. Nothing was signed.`);
    return unhex(v);
  }
  if (Array.isArray(v)) return v.map((x) => forBuilder(x));
  if (v && typeof v === 'object' && !(v instanceof Uint8Array)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forBuilder(x, k)]));
  return v;
}

/** An act's payload, built by the binding's builder from the fields given; refused, the rule named, where it would be rejected. */
export function build(act: NewAct, input: unknown): Uint8Array {
  if (!NEW_ACTS.includes(act)) throw new AgreementsRefusal(null, 'an act is terms, statement or report', `Kišib builds three acts: terms, statement or report, not “${String(act)}”. Nothing was signed.`);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AgreementsRefusal(null, 'the fields are an object', 'The act’s fields are an object (JSON). Nothing was signed.');
  const i = forBuilder(input);
  try {
    if (act === 'terms') return agreementsNewTermsPayload(i);
    if (act === 'statement') return agreementsNewStatementPayload(i);
    return agreementsNewReportPayload(i);
  } catch (e) {
    const r = ruleOf(e);
    throw new AgreementsRefusal(r.rule, r.says, `Kišib could not build this ${act === 'terms' ? 'Terms act' : act}: ${r.rule ? `${r.rule}: ` : ''}${r.says}. Nothing was signed.`);
  }
}

/** The checker (the binding's `agreementsNewCheck`, or `agreementsNewCheckHeld` with the acts held before it): its answer about `act`. */
export function check(act: Uint8Array, key?: Uint8Array | null, held: Held[] = []): Answer {
  const one = (h: Held) => (h.key ? { act: h.act, key: h.key } : { act: h.act });
  const a = held.length ? (agreementsNewCheckHeld([...held.map(one), one({ act, key })]) as Answer[]).at(-1)! : (agreementsNewCheck(act, key ?? undefined) as Answer);
  return { ...a, rule: a.rule ?? null, act: a.act ?? null, id: a.id ?? null, signer: a.signer ?? null };
}

/** The verdict and the rule, in one line, as Kišib says it. */
export function verdictLine(a: Answer): string {
  const v = a.verdict.toUpperCase();
  return `${v}${a.rule ? `, ${a.rule}` : ''}: ${a.says}${a.notes.length ? ` (notes: ${a.notes.map((n) => `${n.rule}, ${n.says}`).join('; ')})` : ''}`;
}

/** What an act to sign carries, as a runner request or the command line gives it. */
export interface Draft {
  identity: string;
  binding: string;
  spec: string;
  type: number;
  payload: Uint8Array;
  sequence: string[];
  public: boolean;
  to?: string[];
  objects?: [string, string][];
  refs?: unknown[];
  acks?: string[];
}

/**
 * The check before signing: the draft is signed with a throwaway key, never
 * the identity's (the checker verifies the signature with the key an act
 * carries, so a throwaway key shows the same about the bytes), and checked
 * with the acts held before it. Refused, with the rule the checker names,
 * unless it passes.
 */
export function precheck(d: Draft, held: Held[] = []): Answer {
  return precheckDraft(d, held).answer;
}

/** The draft signed by a throwaway key, never given out: its bytes, content key and id. */
export interface Drafted {
  act: Uint8Array;
  key: Uint8Array;
  id: string;
}

/** `precheck`, with the draft it checked, for the grammar's read-only answers (`grammarLines`). */
export function precheckDraft(d: Draft, held: Held[] = []): { answer: Answer; draft: Drafted } {
  const throwaway = new Uint8Array(randomBytes(32));
  let made: { act: Uint8Array; id: string; key: Uint8Array };
  try {
    made = makeEveryday({ signingSecret: throwaway, signer: d.identity, binding: d.binding, spec: d.spec, type: d.type, payload: d.payload, sequence: d.sequence, public: d.public, to: d.to, objects: d.objects, refs: d.refs, acks: d.acks }) as typeof made;
  } catch (e) {
    throw new AgreementsRefusal('Envelopes rule 1', errorText(e), `Kišib could not write this act’s bytes (${errorText(e)}). Nothing was signed.`);
  } finally {
    throwaway.fill(0);
  }
  const a = check(made.act, made.key, held);
  if (a.verdict !== 'pass') throw new AgreementsRefusal(a.rule, a.says, `Kišib checked this act before signing, and it does not pass: ${verdictLine(a)}. Kišib signs only what passes. Nothing was signed.`);
  return { answer: a, draft: made };
}

/** One answer of the grammar verifier (the binding's `agreementsNewAsk`). */
export interface GrammarAnswer {
  word: string;
  rule: string | null;
  qualifier: string;
  disputed: boolean;
  cmip: string | null;
  says: string;
}

/** Said above the grammar's answers: what they rest on, and that they are provisional. */
export const GRAMMAR_SAY =
  'Read by the grammar verifier (read-only), from the acts Kišib was handed and this act as signed by the throwaway key, as they would stand once you sign. Its sockets are answered by stub cMIPs for tests only (any other cMIP gives unchecked, G9), and places, the envelope’s chain and Money are stand-ins: every answer here is provisional.';

/** The read-only grammar's answers that matter to the signer, each with its word, rule and qualifier; none where the act is not one that binds. */
export function grammarLines(d: { spec: string; type: number; payload: Uint8Array; identity: string }, draft: Drafted, held: Held[] = []): string[] {
  const act = newActOf(d.spec, d.type);
  const m = payloadMap(d.payload) ?? new Map<number, unknown>();
  const me = `signer:${d.identity}`;
  const asks: [string, string, string[]][] = [];
  if (act === 'terms' && !(m.has(17) && m.has(18))) {
    asks.push(['Whether these Terms are in force once you sign them', 'in_force', [draft.id]]);
    asks.push(['Whether you are bound by them once you sign', 'bound', [me, draft.id]]);
  } else if (act === 'statement' && m.get(2) === 0 && isHash(m.get(1))) {
    const terms = hex(m.get(1) as Uint8Array);
    asks.push(['Whether the Terms you assent to are in force once you sign', 'in_force', [terms]]);
    asks.push(['Whether you are bound by them once you sign', 'bound', [me, terms]]);
  } else if (act === 'statement' && m.get(2) === 3) {
    asks.push(['What this resolve resolves', 'resolution', [draft.id]]);
  } else return [];
  const acts = [...held.map((h) => ({ bytes: h.act, ...(h.key ? { key: h.key } : {}) })), { bytes: draft.act, key: draft.key }];
  const out = [GRAMMAR_SAY];
  for (const [what, ask, args] of asks) {
    try {
      const answers = JSON.parse(agreementsNewAsk({ acts, ask, args })) as GrammarAnswer[];
      for (const a of answers) out.push(`${what} (${ask}): ${a.word.toUpperCase()}${a.rule ? `, ${a.rule}` : ''}, ${a.qualifier === 'none' ? 'no qualifier' : a.qualifier}${a.disputed ? ', disputed' : ''}${a.cmip ? `, by the cMIP ${a.cmip}` : ''}: ${a.says}.`);
    } catch (e) {
      out.push(`${what} (${ask}): the grammar verifier could not answer (${errorText(e)}).`);
    }
  }
  return out;
}

/** The identity's own act, checked again before it leaves Kišib: refused unless it passes. */
export function postcheck(act: Uint8Array, key: Uint8Array | null, held: Held[] = []): Answer {
  const a = check(act, key, held);
  if (a.verdict !== 'pass') throw new AgreementsRefusal(a.rule, a.says, `The act Kišib signed does not pass the checker: ${verdictLine(a)}. It was not given out. Nothing was signed.`);
  return a;
}

// ---------------------------------------------------------------- the fields as written

const TERMS_FIELDS = ['replaces', 'agreement', 'parties', 'authors', 'body', 'relies_on', 'in_force', 'powers', 'place', 'clock', 'receiver', 'envelope', 'envelope_at', 'condition', 'control', 'calls', 'data', 'resolves', 'continues', 'previous'];
const STATEMENT_FIELDS = ['agreement', 'terms', 'kind', 'content', 'for', 'under', 'previous', 'answers', 'relies_on', 'settlement', 'resolves', 'continues'];
const REPORT_FIELDS = ['call', 'relies_on', 'lines'];
const ROLE_KINDS = ['done', 'received', 'holding', 'fits', 'future'];
const POWER_KINDS = ['assent', 'counter_signature', 'contest', 'resolves', 'replaces'];
const STATEMENT_KINDS = ['assent', 'counter signature', 'contest', 'resolve'];
const FROM = ['the doer', 'the receiving side', 'both'];
const LINE_KINDS = ['received', 'passed on', 'own part', 'kept', 'still owed'];

const isHash = (v: unknown): v is Uint8Array => v instanceof Uint8Array && v.length === 32;

/** A value as written, in a plain, short form: a fingerprint whole (the panel shows it short, a tap whole), anything else in CBOR's diagnostic way. */
export function diag(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (v instanceof Uint8Array) return isHash(v) ? hex(v) : `h'${hex(v)}'`;
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'bigint' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `[${v.map(diag).join(', ')}]`;
  if (v instanceof Map) return `{${[...v.entries()].map(([k, x]) => `${diag(k)}: ${diag(x)}`).join(', ')}}`;
  return String(v);
}

const socket = (s: unknown): string => (Array.isArray(s) && s.length === 2 ? `the cMIP ${diag(s[0])}, with parameters ${s[1] === null ? 'none (null)' : diag(s[1])}` : `${diag(s)} (not a socket)`);

function party(p: unknown, i: number): string {
  if (!Array.isArray(p)) return `${i}. ${diag(p)}`;
  if (p[0] === 0) return `${i}. a signer, ${diag(p[1])}`;
  if (p[0] === 2) return `${i}. an agreement, by its root ${diag(p[1])}`;
  if (p[0] === 1 && p[1] instanceof Map) {
    const r = p[1] as Map<number, unknown>;
    const k = r.get(0);
    const kind = typeof k === 'number' && ROLE_KINDS[k] ? ROLE_KINDS[k] : `${diag(k)} (no kind draft 25 gives)`;
    return `${i}. a role of kind ${kind}${r.has(1) ? `, its what ${diag(r.get(1))}` : ''}, filled as ${socket(r.get(2))} says`;
  }
  return `${i}. ${diag(p)}`;
}

const who = (w: unknown) => (Array.isArray(w) && w[0] === 0 ? `the signer ${diag(w[1])}` : Array.isArray(w) && w[0] === 2 ? `the agreement with the root ${diag(w[1])}` : diag(w));
const hashes = (v: unknown) => (Array.isArray(v) ? v.map(diag).join(', ') : diag(v));
const previous = (v: unknown) => (Array.isArray(v) && v.length === 0 ? 'none: the signer’s first act in this agreement' : Array.isArray(v) ? hashes(v) : diag(v));

/** The Terms' fields as written, one line each, and the defaults draft 25 gives where one is left out. */
export function termsFields(m: Map<number, unknown>, words?: string): string[] {
  const out: string[] = [];
  const parties = Array.isArray(m.get(2)) ? (m.get(2) as unknown[]) : [];
  for (const [k, v] of [...m.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const name = TERMS_FIELDS[Number(k)] ?? `field ${k}`;
    switch (Number(k)) {
      case 2:
        out.push(`parties: ${parties.map(party).join('; ')}`);
        break;
      case 3:
        out.push(`authors: ${Array.isArray(v) ? v.map((i) => `party ${diag(i)}`).join(', ') : diag(v)}`);
        break;
      case 4: {
        const b = Array.isArray(v) ? v : [];
        out.push(`body: the words ${diag(b[0])}, read as ${socket(b[1])} says (task K1)`);
        if (words !== undefined && isHash(b[0]) && workHash(new TextEncoder().encode(words.normalize('NFC'))) === hex(b[0])) out.push(`The words, as given to Kišib, matching that fingerprint: “${words}”`);
        else if (words !== undefined) out.push('The words given to Kišib do not match the fingerprint these Terms name: they are not shown.');
        else out.push('The words are named by their fingerprint only: Kišib was not given them, and cannot show them. Read them before you sign.');
        break;
      }
      case 6:
      case 13:
      case 14:
      case 16:
        out.push(`${name}: ${socket(v)}`);
        break;
      case 7:
        out.push(`powers: ${Array.isArray(v) ? v.map((p) => (Array.isArray(p) ? `${typeof p[0] === 'number' ? (POWER_KINDS[p[0]] ?? diag(p[0])) : `the kind ${diag(p[0])} a cMIP defines`}, under ${socket(p[1])}` : diag(p))).join('; ') : diag(v)}`);
        break;
      case 10:
        // Encoding 2, E12: [0, position] for one of these Terms' parties, [2, root] for an agreement.
        out.push(`receiver: ${Array.isArray(v) && v[0] === 0 ? `party ${diag(v[1])}` : Array.isArray(v) && v[0] === 2 ? `the agreement with the root ${diag(v[1])}` : diag(v)}`);
        break;
      case 15:
        out.push(`calls: ${Array.isArray(v) ? v.map((c) => (Array.isArray(c) ? `task K${diag(c[0])}, a report from ${FROM[Number(c[1])] ?? diag(c[1])}` : diag(c))).join('; ') : diag(v)}`);
        break;
      case 19:
        out.push(`previous: ${previous(v)}`);
        break;
      default:
        out.push(`${name}: ${Array.isArray(v) ? hashes(v) : diag(v)}`);
    }
  }
  // The defaults draft 25 gives where a field is left out (its words, not a reading); not for a resolving update, which carries none of them.
  if (m.has(17) && m.has(18)) return out;
  if (!m.has(6)) out.push('in_force: not written. Draft 25’s default: in force once there is an assent in the name of every party named as a signer (G4.1).');
  if (!m.has(13)) out.push('condition: not written. Draft 25’s default: an update is valid when everyone who signed the original signs it (G4.11(e)).');
  if (!m.has(7)) out.push('powers: none written: no act made in another’s name under these Terms binds that other (G5.1(b)).');
  return out;
}

/** A Statement's fields as written. */
export function statementFields(m: Map<number, unknown>): string[] {
  const out: string[] = [];
  for (const [k, v] of [...m.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const name = STATEMENT_FIELDS[Number(k)] ?? `field ${k}`;
    if (Number(k) === 2) out.push(`kind: ${typeof v === 'number' ? (STATEMENT_KINDS[v] ?? diag(v)) : Array.isArray(v) ? `a kind ${socket(v)} defines (task K7): Kišib cannot read what it states, or whether it binds you` : diag(v)}`);
    else if (Number(k) === 4) out.push(`for: ${who(v)}`);
    else if (Number(k) === 6) out.push(`previous: ${previous(v)}`);
    else out.push(`${name}: ${Array.isArray(v) ? hashes(v) : diag(v)}`);
  }
  if (m.has(4)) out.push('Made in another’s name: it binds them only where the Terms named in “under” give a power for this kind and its rule says yes (G5.1(b)). Kišib cannot apply that rule.');
  return out;
}

/** A report's fields as written. */
export function reportFields(m: Map<number, unknown>): string[] {
  const out: string[] = [];
  const call = m.get(0);
  out.push(`call: ${Array.isArray(call) ? (call.length === 2 ? `the act ${diag(call[0])}, task K${diag(call[1])}` : `the act ${diag(call[0])} (a call made by default, or written without its task)`) : diag(call)}`);
  if (m.has(1)) out.push(`relies_on: ${hashes(m.get(1))}`);
  const lines = m.get(2);
  if (Array.isArray(lines))
    lines.forEach((l, i) => {
      if (!Array.isArray(l)) return out.push(`line ${i}: ${diag(l)}`);
      const amount = Array.isArray(l[1]) ? `${diag(l[1][1])} of the unit ${diag(l[1][0])}` : diag(l[1]);
      const kind = LINE_KINDS[Number(l[0])] ?? diag(l[0]);
      const rest = l[0] === 0 ? `, by ${diag(l[2])}` : l[0] === 1 ? `, to ${who(l[2])}, by ${diag(l[3])}${l[4] ? `, closing line ${diag(l[4][1])} of the report ${diag(l[4][0])}` : ''}` : l[0] === 4 ? `, to ${who(l[2])}` : '';
      out.push(`line ${i}: ${kind}, ${amount}${rest}`);
    });
  return out;
}

/** An act's spec, type, payload and addressing, opened with its key where it is private; null where it cannot be read. */
export function opened(act: Uint8Array, key?: Uint8Array | null): { id: string; signer?: string; spec: string; type: number; payload: Uint8Array; public: boolean; to?: string[] } | null {
  try {
    const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; public: boolean; to?: string[] };
    if (d.spec !== undefined && d.payload) return d as ReturnType<typeof opened>;
    if (!key) return null;
    return openWithKey(act, key) as ReturnType<typeof opened>;
  } catch {
    return null;
  }
}

const payloadMap = (p: Uint8Array): Map<number, unknown> | null => {
  try {
    const m = cborDecode(p);
    return m instanceof Map ? (m as Map<number, unknown>) : null;
  } catch {
    return null;
  }
};

/**
 * What Kišib shows before signing one of the new acts: what it is, the
 * checker's verdict and the rule it names, what a pass does not mean; and,
 * where the act binds a person to Terms (a Terms act, an assent, a kind a
 * cMIP defines), that no terms-reading cMIP exists, the Terms' fields as
 * written, and what draft 25 says a person can do whatever Terms say.
 * `words`: the Terms' words, where an app or the person gave them, shown
 * only where they match the fingerprint the Terms name.
 */
export function screen(d: { spec: string; type: number; payload: Uint8Array; identity?: string }, answer: Answer, held: Held[] = [], words?: string, draft?: Drafted): string[] {
  const act = newActOf(d.spec, d.type);
  const m = payloadMap(d.payload) ?? new Map<number, unknown>();
  const out: string[] = [];
  const resolving = act === 'terms' && m.has(17) && m.has(18);
  if (act === 'terms') out.push(resolving ? `A resolving update of Terms, Agreements draft 25 (encoding 2; spec ${d.spec}, type ${d.type}): it resolves a fork of these Terms, carrying no words of its own (G12.3).` : `A Terms act of Agreements draft 25 (encoding 2; spec ${d.spec}, type ${d.type}): stating Terms, and signing them as their writer.`);
  if (act === 'statement') out.push(`A Statement of Agreements draft 25 (encoding 2; spec ${d.spec}, type ${d.type}).`);
  if (act === 'report') out.push(`A report (spec ${d.spec}, type ${d.type}): a proposal of the report block (proposal 4), not yet written into any spec text.`);
  out.push(`Checked before signing, as signed by a throwaway key, never this identity’s: ${verdictLine(answer)}.`);
  out.push(PASS_MEANS_SAY);
  const kind = m.get(2);
  const binds = act === 'terms' || (act === 'statement' && (kind === 0 || kind === 3 || Array.isArray(kind)));
  if (resolving) {
    out.push(`${NO_READER_SAY}:`);
    out.push(...termsFields(m, words));
    out.push('Which tip continues is yours to sign; that the update resolves the fork is the grammar’s, from the acts held, and the update condition of the Terms both tips replace says who must sign it (G12.3, G4.11(g)).');
  } else if (act === 'terms') {
    out.push(`${NO_READER_SAY}:`);
    out.push(...termsFields(m, words));
  } else if (act === 'statement') {
    const named = m.get(1);
    if (kind === 0 && isHash(named)) {
      // An assent: the Terms it agrees to, from the acts handed to Kišib.
      const t = held.map((h) => ({ h, o: opened(h.act, h.key) })).find((x) => x.o?.id === hex(named) && newActOf(x.o.spec, x.o.type) === 'terms');
      const tm = t?.o ? payloadMap(t.o.payload) : null;
      const verdict = t ? check(t.h.act, t.h.key) : null;
      if (t && tm && verdict?.verdict === 'pass') {
        out.push(`An assent: you agree to the Terms ${hex(named)}. ${NO_READER_SAY}:`);
        out.push(...termsFields(tm, words));
      } else {
        out.push(`An assent to the Terms ${hex(named)}. ${NO_READER_SAY}, and Kišib does not hold these Terms${t ? ' as an act that passes the checker' : ''}: it cannot show them. Signing binds you to Terms not shown here. Ask the app to hand Kišib those Terms, or decline.`);
      }
    } else if (kind === 3) out.push('A resolve: a resolving update in your own line. Of the fork of your acts in this agreement, the tip it names in “continues” goes on, the others are set aside (G12.3). The tip that continues counts as your act; Kišib does not read what it binds you to. Its fields as written:');
    else if (Array.isArray(kind)) out.push(`${NO_READER_SAY}. A kind a cMIP defines may bind you; Kišib cannot tell. Its fields as written:`);
    out.push(...statementFields(m));
  } else if (act === 'report') out.push(...reportFields(m));
  if (binds && draft && d.identity) out.push(...grammarLines({ ...d, identity: d.identity }, draft, held));
  if (binds) out.push(...ALWAYS_SAY);
  return out;
}
