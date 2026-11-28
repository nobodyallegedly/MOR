// The Agreements acts of draft 25, in the bytes of encoding 2, for the
// collective client and Edubba (clients/desk): Terms and Statement
// (`docs/agreements-from-scratch/draft-25.md`, `encoding-2.md`, branch
// claude/agreements-clean-1-hahuwn) and the report (the report block's
// fourth proposal, a proposal), read and written by the core library's own
// code, never by bytes written here.
//
// In plain words: until now these two clients knew only the earlier
// Agreements (the MIR series, drafts 7 to 24, under the test spec hash
// "LAW"), whose acts draft 25 calls "not this encoding". This file gives
// them draft 25: it reads an act to its fields, by the same names the
// players' kit gives them (tools/postman/kit/AGREEMENTS-FIELDS.md), says what
// the checker answers about it, asks the grammar verifier whether Terms are
// in force, and writes the acts draft 25 has (Terms, an assent, a counter
// signature, a contest, a resolve, a report), each checked before the
// identity's key signs it and again after.
//
// Precisely: the core is the binding in `../built-25/` (the kit's, unchanged:
// core/src/agreements_new of claude/agreements-verifier-2). Every payload is
// written by its builders (`agreementsNewTermsPayload`,
// `agreementsNewStatementPayload`, `agreementsNewReportPayload`); a payload
// read here is decoded to the builders' fields and accepted as read only
// where the builder, given those fields, writes the same bytes again. The
// checker is `agreementsNewCheck` and `agreementsNewCheckHeld`; the grammar's
// answers are `agreementsNewAsk`, which rests on stub cMIPs and stand-in
// layers: provisional. Main's core library has no draft 25 yet, so this
// binding is loaded beside it, for these acts only.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as core from '../built-25/mor_wasm.js';
import { nextLine, type TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';

core.initSync({ module: readFileSync(new URL('../built-25/mor_wasm_bg.wasm', import.meta.url)) });

const hex = (b: Uint8Array) => Buffer.from(b).toString('hex');
const unhex = (s: string) => Uint8Array.from(Buffer.from(s, 'hex'));
const HEX64 = /^[0-9a-f]{64}$/;
const err = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** The three acts (encoding 2, E2). */
export type Act25 = 'terms' | 'statement' | 'report';
export const ACTS_25: readonly Act25[] = ['terms', 'statement', 'report'];

/** Their spec hashes and types, from the binding (encoding 2, E2): draft 25's `dd90f8af…`, types 0 and 1; the report block's fourth proposal's `7b65c60f…`, type 0. */
export const SPECS_25 = core.agreementsNewSpecs() as Record<Act25, { spec: string; type: number }>;

/** The act a spec hash and type name, or null. */
export function actOf(spec: string | undefined, type: number | undefined): Act25 | null {
  for (const a of ACTS_25) if (SPECS_25[a].spec === spec && SPECS_25[a].type === type) return a;
  return null;
}

/** A spec hash of draft 25 or of the report block's fourth proposal, whatever the type. */
export const isSpec25 = (spec: string | undefined): boolean => ACTS_25.some((a) => SPECS_25[a].spec === spec);

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

/** An act held beside the one checked or asked about: its bytes, and its content key if private. */
export interface Held {
  act: Uint8Array;
  key?: Uint8Array | null;
}

/** An act's fields, as the binding's builders take them and the kit's AGREEMENTS-FIELDS.md writes them: hashes in hex, `params` and `content` CBOR in hex. */
export type Fields = Record<string, unknown>;

/** Said beside every verdict. */
export const PASS_MEANS =
  'A pass means only that the bytes are well formed and signed (encoding 2, section 9). Whether Terms are in force, whether two acts are a fork, who receives, and the baker’s rights are the grammar verifier’s answers, which rest on stub cMIPs and stand-in layers: provisional.';

// ---------------------------------------------------------------- the checker

/** The checker on one act, with the acts held before it. */
export function check(act: Uint8Array, key?: Uint8Array | null, held: Held[] = []): Answer {
  const one = (h: Held) => (h.key ? { act: h.act, key: h.key } : { act: h.act });
  const a = held.length ? (core.agreementsNewCheckHeld([...held.map(one), one({ act, key })]) as Answer[]).at(-1)! : (core.agreementsNewCheck(act, key ?? undefined) as Answer);
  return { ...a, act: a.act ?? null, id: a.id ?? null, signer: a.signer ?? null, rule: a.rule ?? null };
}

/** The verdict in one line. */
export function verdictLine(a: Answer): string {
  return `${a.verdict.toUpperCase()}${a.rule ? `, ${a.rule}` : ''}: ${a.says}${a.notes.length ? ` (notes: ${a.notes.map((n) => `${n.rule}, ${n.says}`).join('; ')})` : ''}`;
}

// ---------------------------------------------------------------- building

/** Every field name the builders read (the binding's `agreements_new_js.rs`), as the kit lists them: a name it does not know would be dropped by the binding without a word, so it is refused here. */
const KNOWN = new Set(['act', 'agreement', 'amount', 'answers', 'authors', 'body', 'by', 'call', 'calls', 'clock', 'closes', 'cmip', 'condition', 'content', 'continues', 'control', 'data', 'envelope', 'envelopeAt', 'for', 'from', 'inForce', 'key', 'kind', 'line', 'lines', 'params', 'parties', 'place', 'powers', 'previous', 'receiver', 'reliesOn', 'replaces', 'resolves', 'role', 'rule', 'settlement', 'signer', 'spot', 'task', 'terms', 'to', 'under', 'unit', 'value', 'what', 'words']);

function knownNames(v: unknown, path: string) {
  if (Array.isArray(v)) return v.forEach((x, n) => knownNames(x, `${path}[${n}]`));
  if (!v || typeof v !== 'object') return;
  for (const [k, x] of Object.entries(v)) {
    if (!KNOWN.has(k)) throw new Error(`the field "${path ? `${path}.` : ''}${k}" is not one the builder knows: nothing was built or signed`);
    // `closes` is a pair [report, line]; nothing below it is a field name.
    if (k !== 'closes') knownNames(x, path ? `${path}.${k}` : k);
  }
}

function forBuilder(v: unknown, key = ''): unknown {
  if ((key === 'params' || key === 'content') && typeof v === 'string') return unhex(v);
  if (Array.isArray(v)) return v.map((x) => forBuilder(x));
  if (v && typeof v === 'object' && !(v instanceof Uint8Array)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forBuilder(x, k)]));
  return v;
}

/** An act's payload, written by the binding's builder from its fields; an error naming the rule where the act would be rejected. */
export function build(act: Act25, fields: Fields): Uint8Array {
  knownNames(fields, '');
  const i = forBuilder(fields);
  if (act === 'terms') return core.agreementsNewTermsPayload(i);
  if (act === 'statement') return core.agreementsNewStatementPayload(i);
  if (act === 'report') return core.agreementsNewReportPayload(i);
  throw new Error('the acts of draft 25 are terms, statement and report');
}

// ---------------------------------------------------------------- reading

const ROLE_KINDS = ['done', 'received', 'holding', 'fits', 'future'];
const POWER_KINDS = ['assent', 'counter_signature', 'contest', 'resolves', 'replaces'];
const STATEMENT_KINDS = ['assent', 'counter_signature', 'contest', 'resolve'];
const FROM = ['doer', 'receiving side', 'both'];
const LINES = ['received', 'passed on', 'own part', 'kept', 'still owed'];

const num = (v: unknown): number => (typeof v === 'bigint' ? Number(v) : (v as number));
const isFp = (v: unknown): v is Uint8Array => v instanceof Uint8Array && v.length === 32;

class Unreadable extends Error {}
const fp = (v: unknown): string => {
  if (!isFp(v)) throw new Unreadable('not a fingerprint');
  return hex(v);
};
const fps = (v: unknown): string[] => {
  if (!Array.isArray(v)) throw new Unreadable('not a list');
  return v.map(fp);
};
const socket = (v: unknown): Fields => {
  if (!Array.isArray(v) || v.length !== 2) throw new Unreadable('not a socket');
  return { cmip: fp(v[0]), params: hex(core.cborEncode(v[1])) };
};
const who = (v: unknown): Fields => {
  if (Array.isArray(v) && v[0] === 0) return { signer: fp(v[1]) };
  if (Array.isArray(v) && v[0] === 2) return { agreement: fp(v[1]) };
  throw new Unreadable('not a signer or an agreement');
};
const previous = (v: unknown): string | null => {
  if (Array.isArray(v) && v.length === 0) return null;
  if (Array.isArray(v) && v.length === 1) return fp(v[0]);
  throw new Unreadable('not a previous');
};

function party(p: unknown): Fields {
  if (!Array.isArray(p)) throw new Unreadable('not a party');
  if (p[0] === 0) return { signer: fp(p[1]) };
  if (p[0] === 2) return { agreement: fp(p[1]) };
  if (p[0] === 1 && p[1] instanceof Map) {
    const r = p[1] as Map<number, unknown>;
    const kind = ROLE_KINDS[num(r.get(0))];
    if (!kind) throw new Unreadable('a role of no kind draft 25 gives');
    return { role: { kind, ...(r.has(1) ? { what: fp(r.get(1)) } : {}), spot: socket(r.get(2)) } };
  }
  throw new Unreadable('not a party');
}

function termsFields(m: Map<number, unknown>): Fields {
  const f: Fields = {};
  for (const [k, v] of m) {
    switch (num(k)) {
      case 0: f.replaces = fp(v); break;
      case 1: f.agreement = fp(v); break;
      case 2: f.parties = (v as unknown[]).map(party); break;
      case 3: f.authors = (v as unknown[]).map(num); break;
      case 4: {
        const b = v as unknown[];
        const s = socket(b[1]);
        f.body = { words: fp(b[0]), cmip: s.cmip, params: s.params };
        break;
      }
      case 5: f.reliesOn = fps(v); break;
      case 6: f.inForce = socket(v); break;
      case 7: f.powers = (v as unknown[][]).map((p) => ({ kind: typeof p[0] === 'number' || typeof p[0] === 'bigint' ? POWER_KINDS[num(p[0])] : fp(p[0]), rule: socket(p[1]) })); break;
      case 8: f.place = fp(v); break;
      case 9: f.clock = fp(v); break;
      case 10: {
        const r = v as unknown[];
        f.receiver = r[0] === 0 ? num(r[1]) : fp(r[1]);
        break;
      }
      case 11: f.envelope = fp(v); break;
      case 12: f.envelopeAt = fp(v); break;
      case 13: f.condition = socket(v); break;
      case 14: f.control = socket(v); break;
      case 15: f.calls = (v as unknown[][]).map((c) => ({ task: num(c[0]), from: FROM[num(c[1])] })); break;
      case 16: f.data = socket(v); break;
      case 17: f.resolves = fps(v); break;
      case 18: f.continues = fp(v); break;
      case 19: f.previous = previous(v); break;
      default: throw new Unreadable(`field ${k}`);
    }
  }
  return f;
}

function statementFields(m: Map<number, unknown>): Fields {
  const f: Fields = {};
  for (const [k, v] of m) {
    switch (num(k)) {
      case 0: f.agreement = fp(v); break;
      case 1: f.terms = fp(v); break;
      case 2: f.kind = Array.isArray(v) ? socket(v) : STATEMENT_KINDS[num(v)]; break;
      case 3: f.content = hex(core.cborEncode(v)); break;
      case 4: f.for = who(v); break;
      case 5: f.under = fp(v); break;
      case 6: f.previous = previous(v); break;
      case 7: f.answers = fps(v); break;
      case 8: f.reliesOn = fps(v); break;
      case 9: f.settlement = fp(v); break;
      case 10: f.resolves = fps(v); break;
      case 11: f.continues = fp(v); break;
      default: throw new Unreadable(`field ${k}`);
    }
  }
  return f;
}

const amount = (a: unknown): Fields => {
  const x = a as unknown[];
  return { unit: fp(x[0]), value: num(x[1]) };
};

function reportFields(m: Map<number, unknown>): Fields {
  const f: Fields = {};
  for (const [k, v] of m) {
    switch (num(k)) {
      case 0: {
        const c = v as unknown[];
        f.call = c.length === 2 ? { act: fp(c[0]), task: num(c[1]) } : { act: fp(c[0]) };
        break;
      }
      case 1: f.reliesOn = fps(v); break;
      case 2:
        f.lines = (v as unknown[][]).map((l) => {
          const line = LINES[num(l[0])];
          if (line === 'received') return { line, amount: amount(l[1]), by: fp(l[2]) };
          if (line === 'passed on') {
            const c = l[4] as unknown[] | undefined;
            return { line, amount: amount(l[1]), to: who(l[2]), by: fp(l[3]), ...(c ? { closes: [fp(c[0]), num(c[1])] } : {}) };
          }
          if (line === 'still owed') return { line, amount: amount(l[1]), to: who(l[2]) };
          if (line) return { line, amount: amount(l[1]) };
          throw new Unreadable('a line of no kind');
        });
        break;
      default: throw new Unreadable(`field ${k}`);
    }
  }
  return f;
}

/**
 * A payload's fields, by the builders' names; null where they cannot be
 * given (an act that is rejected, or one whose faults the builders cannot
 * write: a body's words not a fingerprint, say). Accepted only where the
 * builder, given them, writes the same bytes: the fields are then the act.
 */
export function fieldsOf(act: Act25, payload: Uint8Array): Fields | null {
  let f: Fields;
  try {
    const m = core.cborDecode(payload);
    if (!(m instanceof Map)) return null;
    f = act === 'terms' ? termsFields(m) : act === 'statement' ? statementFields(m) : reportFields(m);
  } catch {
    return null;
  }
  try {
    return hex(build(act, f)) === hex(payload) ? f : null;
  } catch {
    return null;
  }
}

/** One act of draft 25, opened and read. */
export interface Read25 {
  act: Act25 | null;
  id: string;
  signer: string | null;
  public: boolean;
  /** Its fields, or null where they cannot be given (see `fieldsOf`). */
  fields: Fields | null;
  check: Answer;
}

/** An act's spec, type and payload, opened with its key where it is private; null where it cannot be read. */
export function opened(act: Uint8Array, key?: Uint8Array | null): { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; public: boolean; position?: number } | null {
  try {
    const d = core.describeAct(act);
    if (d.payload || !key) return d;
    return core.openWithKey(act, key);
  } catch {
    return null;
  }
}

/** Read an act of draft 25 (or of the report block): what it is, its fields, the checker's answer with the acts held. Null for an act of any other specification. */
export function read(act: Uint8Array, key?: Uint8Array | null, held: Held[] = []): Read25 | null {
  const d = opened(act, key);
  if (!d || !isSpec25(d.spec)) return null;
  const a = actOf(d.spec, d.type);
  const payload = d.payload instanceof Uint8Array ? d.payload : typeof d.payload === 'string' ? unhex(d.payload) : null;
  return { act: a, id: d.id, signer: d.signer ?? null, public: d.public, fields: a && payload ? fieldsOf(a, payload) : null, check: check(act, key, held) };
}

// ---------------------------------------------------------------- the grammar's answers

/** One answer of the grammar verifier. */
export interface GrammarAnswer {
  word: string;
  rule: string | null;
  qualifier: string;
  disputed: boolean;
  cmip: string | null;
  says: string;
}

/** Said above the grammar's answers. */
export const GRAMMAR_SAYS =
  'Read by the core library’s grammar verifier for draft 25, from the acts held here: its sockets are answered by stub cMIPs for tests only (any other cMIP gives unchecked, G9), and places, the envelope’s chain and Money are stand-ins. Provisional.';

/** Ask the grammar verifier one question (`agreementsNewQuestions` lists them), over the acts held. */
export function ask(held: Held[], question: string, args: string[]): GrammarAnswer[] {
  const acts = held.map((h) => ({ bytes: h.act, ...(h.key ? { key: h.key } : {}) }));
  return JSON.parse(core.agreementsNewAsk({ acts, ask: question, args })) as GrammarAnswer[];
}

/** Whether Terms are in force (G4.1, G4.6): the grammar's word ("shown" where they are, "not shown", "fork", "unchecked", …), its rule, qualifier and words. */
export function inForce(held: Held[], terms: string): GrammarAnswer[] {
  return ask(held, 'in_force', [terms]);
}

/** An answer in one line. */
export const answerLine = (a: GrammarAnswer): string =>
  `${a.word.toUpperCase()}${a.rule ? `, ${a.rule}` : ''}${a.qualifier && a.qualifier !== 'none' ? `, ${a.qualifier}` : ''}${a.disputed ? ', disputed' : ''}${a.cmip ? `, by the cMIP ${a.cmip}` : ''}: ${a.says}`;

// ---------------------------------------------------------------- lines within an agreement (G6.1)

/** The root of the agreement an act of draft 25 is made within: a Statement's `agreement`; a Terms act's `agreement`, or, for a first Terms act, its own id (encoding 2, E23). */
export function rootOf(r: Read25): string | null {
  if (!r.fields) return null;
  if (r.act === 'statement') return (r.fields.agreement as string) ?? null;
  if (r.act === 'terms') return (r.fields.agreement as string | undefined) ?? r.id;
  return null;
}

/**
 * What a signer's next act within an agreement names in `previous` (draft
 * 25, G6.1 and section 3.2; encoding 2, E17): their latest act within it
 * among the acts held, by their sequence's position; none (null) where they
 * have made none there. An author's first act there is the Terms act, so
 * their assent names it.
 */
export function previousFor(signer: string, root: string, held: Held[]): string | null {
  let best: { id: string; position: number } | null = null;
  for (const h of held) {
    const d = opened(h.act, h.key);
    if (!d || d.signer !== signer || !isSpec25(d.spec)) continue;
    const r = read(h.act, h.key);
    if (!r || r.act === 'report' || rootOf(r) !== root) continue;
    const position = typeof d.position === 'number' ? d.position : 0;
    if (!best || position > best.position) best = { id: d.id, position };
  }
  return best?.id ?? null;
}

/** An assent's fields (draft 25, section 3.2; AGREEMENTS-FIELDS.md): to Terms `terms` of the agreement `root`, its `previous` the signer's latest act there. */
export function assentFields(signer: string, terms: string, root: string, held: Held[]): Fields {
  return { agreement: root, terms, kind: 'assent', previous: previousFor(signer, root, held) };
}

/** A counter signature's fields (G4.10): it names the Terms of the assent it cancels, and follows that assent in the signer's line. */
export function counterSignatureFields(signer: string, terms: string, root: string, held: Held[]): Fields {
  return { agreement: root, terms, kind: 'counter_signature', previous: previousFor(signer, root, held) };
}

/** A contest's fields (G11.8): against the version `terms` of an offer or vow, with the settlement it is tied to where there is one; `content` CBOR in hex, not read by the grammar. */
export function contestFields(signer: string, terms: string, root: string, held: Held[], o: { settlement?: string; content?: string } = {}): Fields {
  return { agreement: root, terms, kind: 'contest', previous: previousFor(signer, root, held), ...(o.settlement ? { settlement: o.settlement } : {}), ...(o.content ? { content: o.content } : {}) };
}

/** A resolve's fields (G12.3): every tip of the fork in the signer's own line, sorted, and the one that continues; `previous` the shared act both tips follow. */
export function resolveFields(terms: string, root: string, shared: string | null, tips: string[], continues: string): Fields {
  return { agreement: root, terms, kind: 'resolve', previous: shared, resolves: [...tips].sort(), continues };
}

// ---------------------------------------------------------------- signing

/** A refusal: nothing was signed. */
export class Refused extends Error {
  constructor(
    readonly rule: string | null,
    message: string,
  ) {
    super(message);
  }
}

/** The check before signing: the act signed by a throwaway key (never the identity's) on the identity's next place in its line, and checked with the acts held. */
export function precheck(me: TestIdentity, act: Act25, payload: Uint8Array, held: Held[], isPublic: boolean, to?: string[]): Answer {
  const throwaway = new Uint8Array(randomBytes(32));
  try {
    const { spec, type } = SPECS_25[act];
    const d = core.makeEveryday({ signingSecret: throwaway, signer: me.id, binding: me.f.binding, spec, type, payload, sequence: [...nextLine(me.f, isPublic)], public: isPublic, ...(to ? { to } : {}) }) as { act: Uint8Array; key: Uint8Array };
    return check(d.act, isPublic ? null : d.key, held);
  } finally {
    throwaway.fill(0);
  }
}

/**
 * Write one act of draft 25 and sign it with the identity's own key: the
 * payload by the builder; checked first as signed by a throwaway key, and
 * refused unless it passes; then signed, as the next act of the identity's
 * line, checked again, and only then sent to `relays`. A collective's own
 * line is refused: under draft 25 an agreement signs by its signers' own
 * acts (G1.2, encoding 2, E24), and an act carrying `objects` is rejected
 * (E3); how a collective of the earlier Agreements becomes one is a
 * question for the MOR lead (fault list, Q1).
 */
export async function sign(me: TestIdentity, act: Act25, fields: Fields, o: { held?: Held[]; relays?: string[]; public?: boolean; to?: string[] } = {}): Promise<{ id: string; act: Uint8Array; key: Uint8Array; check: Answer; fields: Fields }> {
  const held = o.held ?? [];
  const isPublic = o.public ?? true;
  if (me.f.cites || me.keyless) throw new Refused('E3', 'A collective of the earlier Agreements signs by naming its chain in `objects`, which draft 25 rejects (encoding 2, E3); under draft 25 an agreement signs by its signers’ own acts (G1.2). Nothing was signed.');
  let payload: Uint8Array;
  try {
    payload = build(act, fields);
  } catch (e) {
    const m = /^((?:E|G)\d+(?:\.\d+)?): /.exec(err(e));
    throw new Refused(m?.[1] ?? null, `The ${act} could not be written: ${err(e)}. Nothing was signed.`);
  }
  const to = o.to?.length ? o.to : isPublic ? undefined : [me.id];
  const pre = precheck(me, act, payload, held, isPublic, to);
  if (pre.verdict !== 'pass') throw new Refused(pre.rule, `Checked before signing, it does not pass: ${verdictLine(pre)}. Nothing was signed.`);
  const { spec, type } = SPECS_25[act];
  const made = me.sign(spec, type, payload, { public: isPublic, ...(to ? { to } : {}) });
  const post = check(made.act, isPublic ? null : made.key, held);
  if (post.verdict !== 'pass') throw new Refused(post.rule, `The act signed does not pass the checker: ${verdictLine(post)}. It was not sent.`);
  for (const r of o.relays ?? []) await relayAt(r, me.via).putAct(made.act);
  return { ...made, check: post, fields };
}

/** The binding's own describe, for tests and readers that hold only these bytes. */
export const describe25 = (act: Uint8Array) => core.describeAct(act);
export const actId25 = (act: Uint8Array): string => core.actId(act);
export const isHex64 = (s: unknown): s is string => typeof s === 'string' && HEX64.test(s);
