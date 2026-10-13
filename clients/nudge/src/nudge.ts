// The nudge cMIP, draft 3 (cmips/cmip-nudge-draft-3.md): the agency terms
// (type 0), the nudge (type 1) and the pick (type 2), made and read; and the
// readings a verifier shows beside them (items 8a, 11 to 14). An action is
// an ordinary text act of an agent, naming a nudge or a pick, or naming
// neither (new in draft 3: every text act of an agent whose terms are held is
// read against them). Nothing here makes one, only reads it; `maySign` is the
// agent's client asking first (client conformance, new in draft 3).
//
// These are readings for display, never validity: an act passed in is one
// its caller already holds as valid under the MIRs (through its signer's
// identity chain); this module says what the cMIP reads of it, and says
// "unknown" for what it does not hold (MICS, "An act counts only where it is
// held").

import { cborDecode, cborEncode, checkText, describeAct, hex, openWithKey, unhex } from '../../genesis/src/core.ts';
import { KIND, KIND_NAMES, NUDGE_SPECS, NUDGE_TYPES, TEXT_ACT, type KindNumber } from './specs.ts';

export { NUDGE_SPECS, NUDGE_TYPES, KIND, KIND_NAMES } from './specs.ts';

/** An act malformed under this cMIP: it is no terms, nudge or pick (it may still be valid under the MIRs). */
export class Invalid extends Error {}

// ---------------------------------------------------------------- the three act types

/** One entry of the terms' field 1: a kind of action, to whom, and whether it goes out freely. */
export interface Allowed {
  kind: KindNumber;
  /** null: anyone; else only these identities (a post: always null). */
  whom: string[] | null;
  /** true: goes out freely; false: by pick. */
  free: boolean;
}

/** The agency terms (item 2). */
export interface Terms {
  principals: string[];
  allowed: Allowed[];
  previous?: string;
  owner?: string;
  /** Field 4: public nudges only. */
  publicOnly?: boolean;
  /** Field 5: whose picks count. */
  pickers?: string[];
  /** Field 6: an action caused by an allowed nudge goes out freely, within its count. */
  nudgedFree?: boolean;
}

/** A nudge (item 5). */
export interface Nudge {
  agent: string;
  terms: string;
  count: number;
  context?: string;
}

/** A pick (item 7a). */
export interface Pick {
  agent: string;
  terms: string;
  picked: string;
}

const HEX64 = /^[0-9a-f]{64}$/;
const bytes = (h: string, what: string): Uint8Array => {
  if (!HEX64.test(h)) throw new Invalid(`${what} is not a hash`);
  return unhex(h);
};

function asMap(payload: Uint8Array, what: string, fields: number[]): Map<number, unknown> {
  let m: unknown;
  try {
    m = cborDecode(payload);
  } catch (e) {
    throw new Invalid(`${what}: not CBOR (${e instanceof Error ? e.message : e})`);
  }
  if (!(m instanceof Map)) throw new Invalid(`${what}: not a map`);
  for (const k of m.keys()) if (!fields.includes(k as number)) throw new Invalid(`${what}: ${String(k)} is not one of its fields`);
  return m as Map<number, unknown>;
}

function hash(v: unknown, what: string): string {
  if (!(v instanceof Uint8Array) || v.length !== 32) throw new Invalid(`${what} is not a hash`);
  return hex(v);
}

/** A list of hashes, at least one, without repeats. */
function hashes(v: unknown, what: string): string[] {
  if (!Array.isArray(v) || !v.length) throw new Invalid(`${what} is not a list of at least one identity`);
  const out = v.map((x, i) => hash(x, `${what}, entry ${i + 1}`));
  if (new Set(out).size !== out.length) throw new Invalid(`${what} names an identity twice`);
  return out;
}

const count = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : typeof v === 'bigint' ? Number.MAX_SAFE_INTEGER : null);

/** Read terms from a payload; throws `Invalid` where this cMIP makes them invalid. */
export function decodeTerms(payload: Uint8Array): Terms {
  const m = asMap(payload, 'the terms', [0, 1, 2, 3, 4, 5, 6]);
  const t: Terms = { principals: hashes(m.get(0), 'the principals (field 0)'), allowed: [] };
  const list = m.get(1);
  if (!Array.isArray(list)) throw new Invalid('the actions allowed (field 1) are not a list');
  list.forEach((e, i) => {
    const at = `field 1, entry ${i + 1}`;
    if (!Array.isArray(e) || e.length !== 3) throw new Invalid(`${at} is not [kind, whom, free]`);
    const [kind, whom, free] = e;
    if (kind !== 0 && kind !== 1 && kind !== 2) throw new Invalid(`${at}: its kind is not 0, 1 or 2`);
    if (typeof free !== 'boolean') throw new Invalid(`${at}: free is not true or false`);
    const w = whom === null ? null : hashes(whom, `${at}, whom`);
    if (kind === 0 && w !== null) throw new Invalid(`${at}: a post names no one, so its whom must be null (item 2)`);
    t.allowed.push({ kind, whom: w, free });
  });
  if (m.has(2)) t.previous = hash(m.get(2), 'the previous version (field 2)');
  if (m.has(3)) t.owner = hash(m.get(3), 'the owner (field 3)');
  if (m.has(4)) {
    if (m.get(4) !== true) throw new Invalid('field 4, where present, is true');
    t.publicOnly = true;
  }
  if (m.has(5)) t.pickers = hashes(m.get(5), 'the pickers (field 5)');
  if (m.has(6)) {
    if (m.get(6) !== true) throw new Invalid('field 6, where present, is true');
    t.nudgedFree = true;
  }
  return t;
}

/** The terms' payload: deterministic CBOR, read back before it is returned. */
export function encodeTerms(t: Terms): Uint8Array {
  const m = new Map<number, unknown>([
    [0, t.principals.map((p) => bytes(p, 'a principal'))],
    [1, t.allowed.map((a) => [a.kind, a.whom === null ? null : a.whom.map((w) => bytes(w, 'an identity in whom')), a.free])],
  ]);
  if (t.previous) m.set(2, bytes(t.previous, 'the previous version'));
  if (t.owner) m.set(3, bytes(t.owner, 'the owner'));
  if (t.publicOnly) m.set(4, true);
  if (t.pickers) m.set(5, t.pickers.map((p) => bytes(p, 'a picker')));
  if (t.nudgedFree) m.set(6, true);
  const out = cborEncode(m) as Uint8Array;
  decodeTerms(out);
  return out;
}

/** Read a nudge from a payload; throws `Invalid` where this cMIP makes it invalid (a count of 0 included, item 5). */
export function decodeNudge(payload: Uint8Array): Nudge {
  const m = asMap(payload, 'the nudge', [0, 1, 2, 3]);
  const n: Nudge = { agent: hash(m.get(0), 'the agent (field 0)'), terms: hash(m.get(1), 'the terms (field 1)'), count: 0 };
  const c = count(m.get(2));
  if (c === null) throw new Invalid('the count (field 2) is not a whole number');
  if (c < 1) throw new Invalid('the count (field 2) is 0: a nudge allows at least one action (item 5)');
  n.count = c;
  if (m.has(3)) {
    const t = m.get(3);
    if (typeof t !== 'string') throw new Invalid('the context (field 3) is not text');
    try {
      checkText(t);
    } catch (e) {
      throw new Invalid(`the context (field 3): ${e instanceof Error ? e.message : e}`);
    }
    n.context = t;
  }
  return n;
}

export function encodeNudge(n: Nudge): Uint8Array {
  const m = new Map<number, unknown>([
    [0, bytes(n.agent, 'the agent')],
    [1, bytes(n.terms, 'the terms')],
    [2, n.count],
  ]);
  if (n.context !== undefined && n.context !== '') m.set(3, n.context);
  const out = cborEncode(m) as Uint8Array;
  decodeNudge(out);
  return out;
}

export function decodePick(payload: Uint8Array): Pick {
  const m = asMap(payload, 'the pick', [0, 1, 2]);
  return { agent: hash(m.get(0), 'the agent (field 0)'), terms: hash(m.get(1), 'the terms (field 1)'), picked: hash(m.get(2), 'the act picked (field 2)') };
}

export function encodePick(p: Pick): Uint8Array {
  const out = cborEncode(new Map<number, unknown>([[0, bytes(p.agent, 'the agent')], [1, bytes(p.terms, 'the terms')], [2, bytes(p.picked, 'the act picked')]])) as Uint8Array;
  decodePick(out);
  return out;
}

/** Which entry of the terms decides an action of this kind to these addressees (item 12): the first that fits. */
export function entryFor(t: Terms, kind: KindNumber, addressees: string[]): Allowed | undefined {
  return t.allowed.find((e) => e.kind === kind && (e.whom === null || addressees.every((x) => e.whom!.includes(x))));
}

// ---------------------------------------------------------------- plain words

export type Names = (id: string) => string;
const fpOf: Names = (id) => `${id.slice(0, 8)}…${id.slice(-4)}`;

const listOf = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** The terms in plain words (item 4, client conformance): shown before anyone signs a nudge or a pick under them, and beside any action read under them. */
export function termsInWords(t: Terms, names: Names = fpOf): string[] {
  const out = [`Who may nudge it: ${listOf(t.principals.map(names))}${t.publicOnly ? ', and only by a public nudge' : ''}.`];
  out.push(t.pickers ? `Whose picks count: ${listOf(t.pickers.map(names))}; an action that needs a pick needs a signed pick by one of them.` : 'It names no pickers: an action that needs a pick says only that the terms asked for one, never that anyone picked.');
  if (!t.allowed.length) out.push('It allows no kind of action on its own.');
  for (const a of t.allowed) {
    const whom = a.kind === 0 ? '' : a.whom === null ? ' to anyone' : ` to ${listOf(a.whom.map(names))}${a.kind === 2 ? ' alone' : ''}`;
    out.push(`${KIND_NAMES[a.kind][0].toUpperCase()}${KIND_NAMES[a.kind].slice(1)}${whom}: ${a.free ? 'goes out freely' : 'needs a pick'}.`);
  }
  out.push(t.nudgedFree ? 'An action naming an allowed nudge goes out freely, whoever it answers, within the nudge’s number of actions.' : 'An action naming a nudge follows the entries above, like any action.');
  if (!t.allowed.length && !t.nudgedFree) out.push('These terms allow no action: the agent has stopped acting under this cMIP.');
  if (t.owner) out.push(`Its owner, as the agent itself states it (it confers nothing): ${names(t.owner)}.`);
  if (t.previous) out.push(`It replaces the earlier version ${fpOf(t.previous)}.`);
  return out;
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const ordinal = (n: number) => ORDINALS[n - 1] ?? `${n}th`;
const number = (n: number) => NUMBERS[n - 1] ?? String(n);

// ---------------------------------------------------------------- what a verifier holds

/** An act as this module reads it: its outside, and its inside where it could be opened. */
export interface Held {
  id: string;
  signer: string;
  public: boolean;
  to: string[];
  /** Its inside could be read: a public act, or a private one opened with its key. */
  opened: boolean;
  spec?: string;
  type?: number;
  position?: number;
  prev?: string;
  refs: string[];
  acks: string[];
  payload?: Uint8Array;
}

interface Described {
  id: string;
  signer?: string | null;
  public: boolean;
  to?: string[] | null;
  spec?: string | null;
  type?: number | null;
  position?: number | null;
  prev?: string | null;
  refs?: string[] | null;
  acks?: string[] | null;
  payload?: Uint8Array | null;
}

export function heldFrom(d: Described): Held {
  return {
    id: d.id,
    signer: d.signer ?? d.id,
    public: d.public,
    to: d.to ?? [],
    opened: d.payload !== undefined && d.payload !== null,
    spec: d.spec ?? undefined,
    type: d.type ?? undefined,
    position: d.position ?? undefined,
    prev: d.prev ?? undefined,
    refs: d.refs ?? [],
    acks: d.acks ?? [],
    payload: d.payload ?? undefined,
  };
}

export type CauseVerdict = 'allowed' | 'not allowed' | 'unknown' | 'invalid';

/** A nudge or a pick, read under the terms it names (item 11). */
export interface CauseReading {
  id: string;
  kind: 'nudge' | 'pick';
  verdict: CauseVerdict;
  why: string[];
  signer: string;
  nudge?: Nudge;
  pick?: Pick;
  /** The terms it names, read; absent where they are not held or invalid. */
  terms?: Terms;
  /** Where a later version of its terms is held: the latest followed to, or the fork where following stopped. */
  replaced?: { latest: string; fork: string[] | null; stillNamed: boolean };
  words: string;
}

export type ActionVerdict = 'within, free' | 'within, by pick' | 'outside' | 'unknown' | 'unclear';

/** An action, read (item 13). */
export interface ActionReading {
  id: string;
  verdict: ActionVerdict;
  why: string[];
  agent: string;
  nudge?: CauseReading;
  pick?: CauseReading;
  kind: 'post' | 'reply' | 'message' | null;
  addressees: string[];
  /** Its place among the actions naming its nudge, where they can be ordered. */
  place?: { n: number | null; of: number; overCount: boolean; orderUnknown: boolean };
  /** The later terms version this action came after, where both lie in the agent's one sequence (scenario N5). */
  afterChange?: string;
  /** It names no nudge or pick: read against the agent's terms all the same (item 8a, new in draft 3). */
  uncaused?: boolean;
  /** For an action naming no cause: the terms act it is read under (item 8a). */
  terms?: string;
  words: string;
}

/**
 * What a verifier holds, and the readings of this cMIP over it. Add every
 * act held (the terms and their later versions, nudges, picks, actions,
 * the acts actions name, and the agent's other acts, so its sequence can
 * be followed); then read.
 */
export class Reading {
  private acts = new Map<string, Held>();

  constructor(private readonly names: Names = fpOf) {}

  /** An act, by its bytes; a private one opened with its content key when given. */
  add(act: Uint8Array, key?: Uint8Array): Held {
    const d = (key ? openWithKey(act, key) : describeAct(act)) as Described;
    return this.addHeld(heldFrom(d));
  }

  addHeld(h: Held): Held {
    const was = this.acts.get(h.id);
    if (!was || (!was.opened && h.opened)) this.acts.set(h.id, h);
    return this.acts.get(h.id)!;
  }

  held(id: string): Held | undefined {
    return this.acts.get(id);
  }

  all(): Held[] {
    return [...this.acts.values()];
  }

  private isOfThis(h: Held | undefined, type: number): boolean {
    return !!h && h.opened && h.spec === NUDGE_SPECS.nudge && h.type === type;
  }

  /** Terms held as a valid terms act (public, no acks, well formed), with their reading. */
  termsAct(id: string): { terms: Terms; held: Held } | { problem: string } | null {
    const h = this.acts.get(id);
    if (!h) return null;
    if (!h.opened) return { problem: 'the terms it names are private and cannot be opened here' };
    if (h.spec !== NUDGE_SPECS.nudge || h.type !== NUDGE_TYPES.terms) return { problem: 'the act it names as terms is not a terms act of this cMIP' };
    if (!h.public) return { problem: 'the terms it names are not public (item 1)' };
    if (h.acks.length) return { problem: 'the terms carry acknowledgements, which makes them invalid (Envelopes rule 18)' };
    try {
      return { terms: decodeTerms(h.payload!), held: h };
    } catch (e) {
      return { problem: `the terms are invalid under this cMIP: ${e instanceof Error ? e.message : e}` };
    }
  }

  /** Later versions (item 3): from successor to successor while there is exactly one; stopping at a fork. */
  follow(termsId: string): { latest: string; fork: string[] | null; path: string[] } {
    const start = this.termsAct(termsId);
    const signer = start && 'held' in start ? start.held.signer : null;
    const path = [termsId];
    let cur = termsId;
    for (;;) {
      const next = this.all().filter((h) => {
        if (h.signer !== signer || path.includes(h.id)) return false;
        const t = this.termsAct(h.id);
        return !!t && 'terms' in t && t.terms.previous === cur;
      });
      if (next.length === 1) {
        cur = next[0].id;
        path.push(cur);
        continue;
      }
      return { latest: cur, fork: next.length > 1 ? next.map((h) => h.id).sort() : null, path };
    }
  }

  /** A nudge or a pick, under the terms it names (item 11). Null for an act that is neither. */
  readCause(id: string): CauseReading | null {
    const h = this.acts.get(id);
    if (!h) return null;
    const isNudge = this.isOfThis(h, NUDGE_TYPES.nudge);
    const isPick = this.isOfThis(h, NUDGE_TYPES.pick);
    if (!h.opened) return { id, kind: 'nudge', verdict: 'unknown', why: ['it is private and cannot be opened here (Envelopes rule 10)'], signer: h.signer, words: 'Unknown: a private act that cannot be opened here.' };
    if (!isNudge && !isPick) return null;
    const kind = isNudge ? 'nudge' : 'pick';
    const r: CauseReading = { id, kind, verdict: 'allowed', why: [], signer: h.signer, words: '' };
    const done = (verdict: CauseVerdict, why: string[]) => {
      r.verdict = verdict;
      r.why = why;
      r.words = this.causeWords(r);
      return r;
    };
    if (h.acks.length) return done('invalid', ['it carries acknowledgements, which makes it invalid (Envelopes rule 18, F110)']);
    let agent: string;
    let termsId: string;
    try {
      if (isNudge) {
        r.nudge = decodeNudge(h.payload!);
        agent = r.nudge.agent;
        termsId = r.nudge.terms;
      } else {
        r.pick = decodePick(h.payload!);
        agent = r.pick.agent;
        termsId = r.pick.terms;
      }
    } catch (e) {
      return done('invalid', [`it is invalid under this cMIP: ${e instanceof Error ? e.message : e}`]);
    }
    const t = this.termsAct(termsId);
    if (!t) return done('unknown', [`the terms it names, ${fpOf(termsId)}, are not held`]);
    if ('problem' in t) return t.problem.includes('cannot be opened') ? done('unknown', [t.problem]) : done('not allowed', [t.problem]);
    if (t.held.signer !== agent) return done('not allowed', [`the terms it names are signed by ${this.names(t.held.signer)}, not by the agent it names`]);
    r.terms = t.terms;
    const f = this.follow(termsId);
    if (f.latest !== termsId || f.fork) {
      const latest = this.termsAct(f.latest);
      const lt = latest && 'terms' in latest ? latest.terms : null;
      const stillNamed = !!lt && (isNudge ? lt.principals.includes(h.signer) : !!lt.pickers?.includes(h.signer));
      r.replaced = { latest: f.latest, fork: f.fork, stillNamed };
    }
    const why: string[] = [];
    if (isNudge) {
      if (!t.terms.principals.includes(h.signer)) why.push(`its signer, ${this.names(h.signer)}, is not among the terms’ principals`);
      if (t.terms.publicOnly && !h.public) why.push('it is private, and the terms take public nudges only (field 4)');
    } else if (!t.terms.pickers) why.push('the terms name no pickers (field 5)');
    else if (!t.terms.pickers.includes(h.signer)) why.push(`its signer, ${this.names(h.signer)}, is not among the terms’ pickers`);
    return done(why.length ? 'not allowed' : 'allowed', why);
  }

  private causeWords(r: CauseReading): string {
    const who = this.names(r.signer);
    const what = r.kind === 'nudge' ? `A nudge from ${who}${r.nudge ? ` for ${r.nudge.count === 1 ? 'one action' : `${number(r.nudge.count)} actions`}` : ''}` : `A pick by ${who}`;
    const v = r.verdict === 'allowed' ? 'allowed under the terms it names' : r.verdict === 'not allowed' ? `not allowed: ${r.why.join('; ')}` : r.verdict === 'invalid' ? `invalid: ${r.why.join('; ')}` : `unknown: ${r.why.join('; ')}`;
    return `${what}, ${v}.${this.replacedWords(r)}`;
  }

  private replacedWords(r: CauseReading): string {
    if (!r.replaced) return '';
    const where = r.replaced.fork ? ` following stopped at a fork, between ${r.replaced.fork.map(fpOf).join(' and ')}` : ` the latest held is ${fpOf(r.replaced.latest)}`;
    const named = r.replaced.fork ? '' : r.replaced.stillNamed ? `, where its signer is still named` : `, where its signer is no longer named`;
    return ` Terms since replaced:${where}${named}.`;
  }

  /**
   * Whether the agent's client may act on a nudge or pick (client conformance,
   * "in one list"): allowed, under the latest version of the terms it holds,
   * from an identity those latest terms still name, with no fork.
   */
  mayAct(id: string): { ok: boolean; why: string } {
    const r = this.readCause(id);
    if (!r) return { ok: false, why: 'it is neither a nudge nor a pick' };
    if (r.verdict !== 'allowed') return { ok: false, why: r.words };
    if (r.replaced) return { ok: false, why: `it names an earlier version of the terms.${this.replacedWords(r)}` };
    return { ok: true, why: r.words };
  }

  /** Whether `a` lies before `b` in one sequence, following `prev` through acts held. */
  private before(a: string, b: string): boolean {
    let cur = this.acts.get(b)?.prev;
    const seen = new Set<string>();
    while (cur && !seen.has(cur)) {
      if (cur === a) return true;
      seen.add(cur);
      cur = this.acts.get(cur)?.prev;
    }
    return false;
  }

  /** The acts in one order of one sequence, or null where any two cannot be placed (item 13, counting). */
  private ordered(ids: string[]): string[] | null {
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (!this.before(ids[i], ids[j]) && !this.before(ids[j], ids[i])) return null;
    return [...ids].sort((x, y) => (this.before(x, y) ? -1 : 1));
  }

  /** The valid actions of `agent` held that name `cause` in their refs. */
  private naming(agent: string, cause: string): string[] {
    return this.all()
      .filter((h) => h.signer === agent && h.opened && h.spec === NUDGE_SPECS.text && h.type === TEXT_ACT && h.refs.includes(cause))
      .map((h) => h.id);
  }

  /** The kind of an action and whom it addresses (item 9), or what is missing to tell. */
  kindOf(a: Held, exclude: string[]): { kind: ActionReading['kind']; addressees: string[]; missing: string[] } {
    const addressees = new Set(a.to);
    const missing: string[] = [];
    for (const r of a.refs) {
      if (exclude.includes(r)) continue;
      const h = this.acts.get(r);
      if (!h) missing.push(r);
      else addressees.add(h.signer);
    }
    addressees.delete(a.signer);
    const list = [...addressees];
    const kind = !a.public ? (a.to.length ? 'message' : null) : list.length ? 'reply' : 'post';
    return { kind, addressees: list, missing };
  }

  /**
   * An action (item 13). A text act naming no nudge or pick of its signer's
   * is read against its signer's terms all the same, where they are held
   * (item 8a, new in draft 3); null where none are held: no action of this
   * cMIP.
   */
  readAction(id: string): ActionReading | null {
    const a = this.acts.get(id);
    if (!a || !a.opened || a.spec !== NUDGE_SPECS.text || a.type !== TEXT_ACT) return null;
    const causes = a.refs.map((r) => this.readCause(r)).filter((c): c is CauseReading => !!c && c.verdict !== 'invalid' && (c.nudge?.agent ?? c.pick?.agent) === a.signer);
    const nudges = causes.filter((c) => c.kind === 'nudge');
    const picks = causes.filter((c) => c.kind === 'pick');
    // A private nudge or pick not opened is read as unknown; one naming another agent is not this agent's.
    const unopened = a.refs.filter((r) => this.acts.get(r) && !this.acts.get(r)!.opened);
    if (!causes.length && !unopened.length) return this.readUncaused(a);
    const r: ActionReading = { id, verdict: 'unknown', why: [], agent: a.signer, kind: null, addressees: [], words: '' };
    const done = (verdict: ActionVerdict, why: string[]) => {
      r.verdict = verdict;
      r.why = why;
      r.words = this.actionWords(r);
      return r;
    };
    if (nudges.length > 1 || picks.length > 1) return done('unclear', [nudges.length > 1 ? 'it names two or more nudges, so it is read as caused by none of them (item 10)' : 'it names two or more picks, so it is read as caused by none of them (item 10)']);
    r.nudge = nudges[0];
    r.pick = picks[0];
    const k = this.kindOf(a, [r.nudge?.id, r.pick?.id].filter((x): x is string => !!x));
    r.kind = k.kind;
    r.addressees = k.addressees;
    const unknown: string[] = [];
    if (!causes.length) unknown.push(`it names a private act that cannot be opened here (${unopened.map(fpOf).join(', ')}), which may be a nudge or a pick`);
    if (r.nudge?.verdict === 'unknown') unknown.push(`its nudge is unknown: ${r.nudge.why.join('; ')}`);
    if (r.pick?.verdict === 'unknown') unknown.push(`its pick is unknown: ${r.pick.why.join('; ')}`);
    for (const m of k.missing) unknown.push(`the act ${fpOf(m)} it names is not held, so whom it addresses cannot be known`);
    if (unknown.length) return done('unknown', unknown);

    const n = r.nudge;
    const p = r.pick;
    const changed = [n, p].find((c) => c?.replaced && !c.replaced.fork);
    if (changed && this.before(changed.replaced!.latest, id)) r.afterChange = changed.replaced!.latest;
    const terms = n?.terms ?? p?.terms;
    const outside: string[] = [];
    if (n && n.verdict === 'not allowed') outside.push(`caused by a nudge the terms do not allow: ${n.why.join('; ')}`);
    if (n && n.verdict === 'allowed') {
      const all = this.naming(a.signer, n.id);
      const order = all.length > 1 ? this.ordered(all) : all;
      const count = n.nudge!.count;
      if (all.length <= count) r.place = { n: order ? order.indexOf(id) + 1 : null, of: count, overCount: false, orderUnknown: !order };
      else if (order) {
        const at = order.indexOf(id) + 1;
        r.place = { n: at, of: count, overCount: at > count, orderUnknown: false };
        if (at > count) outside.push(`over the count: the ${ordinal(at)} action naming a nudge for ${count === 1 ? 'one' : number(count)}`);
      } else {
        r.place = { n: null, of: count, overCount: true, orderUnknown: true };
        outside.push(`over the count, order unknown: ${number(all.length)} actions name a nudge for ${count === 1 ? 'one' : number(count)}, and they cannot be placed in one order`);
      }
    }
    if (outside.length) return done('outside', outside);
    if (n && n.verdict === 'allowed' && terms?.nudgedFree) return done('within, free', ['an action naming an allowed nudge goes out freely, within its count (field 6)']);
    if (!terms) return done('outside', [p ? `its pick is not allowed: ${p.why.join('; ')}` : 'no terms it can be read under']);
    if (!r.kind) return done('outside', ['a private act with no recipient is of no kind the terms can allow (item 9)']);
    const kind = KIND[r.kind];
    const entry = entryFor(terms, kind, r.addressees);
    if (!entry) return done('outside', [`no entry of the terms allows ${KIND_NAMES[kind]}${r.addressees.length ? ` to ${listOf(r.addressees.map(this.names))}` : ''}`]);
    if (entry.free) return done('within, free', [`the terms let ${KIND_NAMES[entry.kind]}${entry.whom ? ` to ${listOf(entry.whom.map(this.names))}` : ''} go out freely`]);
    if (!terms.pickers) return done('within, by pick', ['the terms ask for a pick, and name no pickers: no one’s pick is shown']);
    if (!p) return done('outside', ['the terms require a signed pick for it, and it names none']);
    if (p.verdict !== 'allowed') return done('outside', [`its pick is not allowed: ${p.why.join('; ')}`]);
    if (!a.refs.includes(p.pick!.picked)) return done('outside', ['it does not answer the act its pick selected']);
    const naming = this.naming(a.signer, p.id);
    if (naming.length > 1) {
      const order = this.ordered(naming);
      if (!order || order[0] !== id) return done('outside', ['a pick allows one action, and this is not the first naming it in the agent’s sequence (item 7b)']);
    }
    return done('within, by pick', [`picked by ${this.names(p.signer)}`]);
  }

  /**
   * The terms a text act of `agent` naming no cause is read under (item 8a,
   * new in draft 3; mechanic, this draft's): the agent's valid terms acts
   * held, followed from its one first version (no field 2) from successor
   * to successor (item 3); of the versions on that path, the latest that
   * does not lie after the act in the agent's one sequence. Null where the
   * verifier holds no terms of the agent, or every version lies after the
   * act (it was signed before the agent had terms); a problem where the
   * terms cannot be followed (no first version held, two of them, or a fork).
   */
  termsFor(agent: string, actId: string): { id: string; terms: Terms } | { problem: string } | null {
    const versions = this.all().filter((h) => h.signer === agent && h.spec === NUDGE_SPECS.nudge && h.type === NUDGE_TYPES.terms && 'terms' in (this.termsAct(h.id) ?? {}));
    if (!versions.length) return null;
    const firsts = versions.filter((h) => (this.termsAct(h.id) as { terms: Terms }).terms.previous === undefined);
    if (firsts.length !== 1) {
      return {
        problem: firsts.length
          ? `its terms have ${number(firsts.length)} first versions held (${firsts.map((h) => fpOf(h.id)).join(', ')}), so which it is read under cannot be told`
          : 'the first version of its terms is not held, so its later versions cannot be followed',
      };
    }
    const f = this.follow(firsts[0].id);
    if (f.fork) return { problem: `following its terms stopped at a fork, between ${f.fork.map(fpOf).join(' and ')}, so which it is read under cannot be told` };
    const before = f.path.filter((v) => !this.before(actId, v));
    if (!before.length) return null;
    const id = before[before.length - 1];
    return { id, terms: (this.termsAct(id) as { terms: Terms }).terms };
  }

  /**
   * A text act of an agent naming no nudge or pick (item 8a, new in draft 3,
   * Q2: "it should not exist without a nudge", read with the pick as the
   * other cause): read against the agent's terms all the same. What the
   * terms let go out freely needs no cause; anything else needs an allowed
   * nudge or pick, so, naming none, reads "outside the terms" (under terms
   * without field 5, "by pick, no pick shown", draft 1's cost). Null for no
   * act of an agent whose terms are held, and for a private act addressed to
   * no one, which reaches no one (mechanic, this draft's).
   */
  private readUncaused(a: Held): ActionReading | null {
    const t = this.termsFor(a.signer, a.id);
    if (!t) return null;
    const r: ActionReading = { id: a.id, verdict: 'unknown', why: [], agent: a.signer, kind: null, addressees: [], uncaused: true, words: '' };
    const done = (verdict: ActionVerdict, why: string[]) => {
      r.verdict = verdict;
      r.why = why;
      r.words = this.actionWords(r);
      return r;
    };
    if ('problem' in t) return done('unknown', [t.problem]);
    r.terms = t.id;
    const k = this.kindOf(a, []);
    if (!k.kind) return null;
    r.kind = k.kind;
    r.addressees = k.addressees;
    if (k.missing.length) return done('unknown', k.missing.map((m) => `the act ${fpOf(m)} it names is not held, so whom it addresses cannot be known`));
    const kind = KIND[k.kind];
    const to = r.addressees.length ? ` to ${listOf(r.addressees.map(this.names))}` : '';
    const entry = entryFor(t.terms, kind, r.addressees);
    if (!entry) return done('outside', [`it names no nudge or pick, and no entry of the terms allows ${KIND_NAMES[kind]}${to}`]);
    if (entry.free) return done('within, free', [`the terms let ${KIND_NAMES[entry.kind]}${entry.whom ? ` to ${listOf(entry.whom.map(this.names))}` : ''} go out freely, with no cause`]);
    if (!t.terms.pickers) return done('within, by pick', ['the terms ask for a pick, and name no pickers: no one’s pick is shown']);
    return done('outside', [`it names no nudge or pick, and the terms let ${KIND_NAMES[kind]}${to} go out only with a signed pick, or under a nudge`]);
  }

  /**
   * Whether the agent's client may sign a text act (client conformance, new
   * in draft 3, Q2): it MUST NOT sign one its terms do not let go out freely
   * without an allowed nudge or pick that allows it. The act is read as it
   * would be once signed, as the next of the agent's sequence (`prev`, its
   * latest act), against what this reading holds; anything but "within"
   * refuses, and so does a cause the client may not act on (`mayAct`). An
   * identity whose terms are not held here is no agent for this check.
   */
  maySign(a: { signer: string; public: boolean; to: string[]; refs: string[]; prev?: string }): { ok: boolean; why: string; reading: ActionReading | null } {
    const id = `to be signed by ${a.signer}`;
    this.acts.set(id, { id, signer: a.signer, public: a.public, to: a.to, opened: true, spec: NUDGE_SPECS.text, type: TEXT_ACT, prev: a.prev, refs: a.refs, acks: [], payload: undefined });
    try {
      const read = this.readAction(id);
      if (!read) return { ok: true, why: 'it is read under no terms of this cMIP: no terms of its signer held, or it reaches no one', reading: null };
      if (read.verdict !== 'within, free' && read.verdict !== 'within, by pick') return { ok: false, why: read.words, reading: read };
      for (const c of [read.nudge, read.pick]) {
        if (!c) continue;
        const may = this.mayAct(c.id);
        if (!may.ok) return { ok: false, why: `its ${c.kind} may not be acted on: ${may.why}`, reading: read };
      }
      return { ok: true, why: read.words, reading: read };
    } finally {
      this.acts.delete(id);
    }
  }

  /** The reading in plain words (client conformance: never a mark of trust). */
  private actionWords(r: ActionReading): string {
    const agent = this.names(r.agent);
    const n = r.nudge;
    const p = r.pick;
    const place = r.place && n?.nudge ? (r.place.n ? `, its ${ordinal(r.place.n)} of ${number(r.place.of)}` : `, of ${number(r.place.of)}`) : '';
    const replaced =
      ((n ? this.replacedWords(n) : '') || (p ? this.replacedWords(p) : '')) +
      (r.afterChange ? ` It was signed after the agent replaced those terms (${fpOf(r.afterChange)}), in its own sequence.` : '');
    if (r.uncaused) {
      // Naming no cause (item 8a): its terms read all the same, and "picked" never shown.
      const head = `${r.kind === 'reply' ? 'Answered' : 'Written'} by ${agent}, naming no nudge or pick`;
      if (r.verdict === 'within, free') return `${head}. Within its terms (free).`;
      if (r.verdict === 'within, by pick') return `${head}; its terms asked for a pick, and no one’s pick is shown. Within its terms (by pick).`;
      if (r.verdict === 'outside') return `${agent} wrote this outside its terms: ${r.why.join('; ')}.`;
      return `Unknown: ${r.why.join('; ')}.`;
    }
    switch (r.verdict) {
      case 'within, free':
      case 'within, by pick': {
        let head: string;
        // A reply born from a nudge never shows a pick (draft 2): only a signed pick shows "picked by".
        if (p && r.verdict === 'within, by pick') head = `Answered by ${agent}, picked by ${this.names(p.signer)}`;
        else if (n && n.verdict === 'allowed' && r.kind !== 'post') head = `Answered by ${agent}, under a nudge from ${this.names(n.signer)}${place}`;
        else if (n && n.verdict === 'allowed') head = `Written by ${agent} after a nudge from ${this.names(n.signer)}${place}`;
        else if (p) head = `Answered by ${agent}, picked by ${this.names(p.signer)}`;
        else head = `Answered by ${agent}`;
        if (r.verdict === 'within, by pick' && !p) head += '; its terms asked for a pick, and no one’s pick is shown';
        return `${head}. Within its terms (${r.verdict === 'within, free' ? 'free' : 'by pick'}).${replaced}`;
      }
      case 'outside':
        return `${agent} wrote this outside its terms: ${r.why.join('; ')}.${replaced}`;
      case 'unclear':
        return `Unclear: ${r.why.join('; ')}.`;
      default:
        return `Unknown: ${r.why.join('; ')}.`;
    }
  }

  /**
   * What a reader may show of the act a pick selected (item 7d, client
   * conformance): its words only where they are held opened here; a private
   * act it cannot open is named, never shown.
   */
  pickedShown(pickId: string): { act: string; text: string | null; why: string } | null {
    const p = this.readCause(pickId);
    if (!p?.pick) return null;
    const h = this.acts.get(p.pick.picked);
    if (!h) return { act: p.pick.picked, text: null, why: 'the act picked is not held here' };
    if (!h.opened) return { act: h.id, text: null, why: 'a private act, which only its recipients can open: a pick names it, never publishes it' };
    let text: string | null = null;
    try {
      const t = (cborDecode(h.payload!) as Map<number, unknown>).get(0);
      if (typeof t === 'string') text = t;
    } catch {
      // not text
    }
    return { act: h.id, text, why: '' };
  }
}
