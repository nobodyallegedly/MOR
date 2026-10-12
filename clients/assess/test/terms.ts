// Terms payloads for the tests, written field by field as Agreements draft 11
// gives them ("Formats", terms). Only the encoding is here: every payload is
// read back by the core library (`readTerms`), which refuses what is not in
// Agreements' format and says why terms in it still fail Agreements' checks.

import { cborEncode, sha256, unhex } from '../../genesis/src/core.ts';

/** A test identity, specification or act: a hash of its name. */
export const id = (name: string): string => sha256(name);

const b = (h: string) => unhex(h);

/** `rule`: every party, any k of them, or named ones. */
export type Rule = { all: true } | { threshold: number } | { named: string[] };
const rule = (r: Rule): unknown[] => ('all' in r ? [0] : 'threshold' in r ? [1, r.threshold] : [2, r.named.map(b)]);

export type Share = { stake: number; part: number } | { role: string; part: number } | { receiver: string; part: number };

export interface Plan {
  shares: Share[];
  cmip: string;
  /** Shares off the top, by index (plan key 4): a recoupment. */
  top?: number[];
  /** The largest rail fee a payout may lose, in millionths (plan key 6); absent: none stated. */
  max?: number;
  serviceBears?: boolean;
}

export type Holding = { one: string } | { threshold: number; members: string[] } | { custodian: string; grant: string };
const holding = (h: Holding): unknown[] =>
  'one' in h ? [0, b(h.one)] : 'threshold' in h ? [1, h.threshold, h.members.map(b)] : [2, b(h.custodian), b(h.grant)];

export interface Area {
  id: number;
  name: string;
  holders: string[];
  threshold: number;
  /** Layers it reaches as a whole (its lanes). */
  layers?: number[];
  /** Operational fields it reaches (7, 8, 17, 28). */
  fields?: number[];
}

export interface Terms {
  parties: string[];
  text: string;
  cmips?: Record<number, string>;
  keepers?: { operators: string[]; rule: Rule };
  clone?: Rule;
  /** The time reference's cMIP (field 6, with task 10 of field 2). */
  time?: string;
  /** Each object (null: this collective) and its holders' shares in millionths (null: this collective). */
  stakes?: [string | null, [string, number][]][];
  plan?: Plan;
  abandonment?: { named?: string; others?: number; outcomes: number[]; proof?: string };
  arbitrators?: string[];
  /** Field 14 in a collective: the split service's grant. */
  splitGrant?: string;
  /** Field 14 in a deal: one grant per payee. */
  payeeGrants?: string[];
  extensions?: string[];
  succession?: { party: string; stakes?: [string, number][] }[];
  refundUntil?: number;
  constitutional?: Rule;
  areas?: Area[];
  /** Field 21: each judge (a task number, or an identity) and those that take over, with their periods. */
  chain?: [{ task: number } | { identity: string }, [string, number][]][];
  departed?: string[];
  releaseRule?: Rule;
  forkJudge?: string;
  /** Field 28: each fee's module and part, for every payment. */
  fees?: [string, number][];
  /** Field 29: each backup service's grants. */
  backups?: string[][];
  /** Field 12: present for a collective. */
  grammar?: { signing: Holding; chainKey: Holding; recovery?: { custodian: string; grant: string } | { authority: string } };
  /** Field 11, for a clone, with its mark (field 4): the clone rule and these signers. */
  parent?: { id: string; signers: string[] };
}

/** The exact payload of these terms. */
export function encode(t: Terms): Uint8Array {
  const m = new Map<number, unknown>();
  m.set(0, t.parties.map(b));
  m.set(1, t.text);
  const cmips = new Map<number, unknown>(Object.entries(t.cmips ?? {}).map(([k, v]) => [Number(k), b(v)]));
  if (t.time) cmips.set(10, b(t.time));
  m.set(2, cmips);
  if (t.keepers) m.set(3, [t.keepers.operators.map(b), rule(t.keepers.rule)]);
  m.set(4, t.parent ? [[[1], [...t.parent.signers].sort().map(b)]] : [0]);
  m.set(5, rule(t.clone ?? { all: true }));
  if (t.time) m.set(6, [b(t.time), 0]);
  if (t.stakes) m.set(7, t.stakes.map(([o, hs]) => [o === null ? null : b(o), hs.map(([h, n]) => [b(h), n])]));
  if (t.plan) {
    const p = new Map<number, unknown>([
      [
        0,
        t.plan.shares.map((s) => ('stake' in s ? [0, s.stake, s.part] : 'role' in s ? [1, s.role, s.part] : [2, b(s.receiver), s.part])),
      ],
      [1, b(t.plan.cmip)],
    ]);
    if (t.plan.top) p.set(4, t.plan.top);
    if (t.plan.serviceBears) p.set(5, 1);
    if (t.plan.max !== undefined) p.set(6, t.plan.max);
    m.set(8, p);
  }
  if (t.abandonment) {
    const a = t.abandonment;
    const c = new Map<number, unknown>([
      [0, a.named ? [0, b(a.named)] : [1, a.others]],
      [1, a.outcomes],
    ]);
    if (a.proof) c.set(3, [b(a.proof), 0]);
    m.set(9, c);
  }
  if (t.parent) m.set(11, b(t.parent.id));
  if (t.grammar) {
    const g = new Map<number, unknown>([
      [0, holding(t.grammar.signing)],
      [1, holding(t.grammar.chainKey)],
    ]);
    const r = t.grammar.recovery;
    if (r) g.set(3, 'authority' in r ? [1, b(r.authority)] : [0, b(r.custodian), b(r.grant)]);
    m.set(12, g);
  }
  if (t.arbitrators) m.set(13, t.arbitrators.map(b));
  if (t.splitGrant) m.set(14, b(t.splitGrant));
  if (t.payeeGrants) m.set(14, t.payeeGrants.map(b));
  if (t.extensions) m.set(15, t.extensions.map(b));
  if (t.succession) {
    m.set(
      16,
      t.succession.map((s) => {
        const p = new Map<number, unknown>([[0, b(s.party)]]);
        if (s.stakes) p.set(1, s.stakes.map(([h, n]) => [b(h), n]));
        return p;
      }),
    );
  }
  if (t.refundUntil !== undefined) m.set(17, new Map([[0, [0, t.refundUntil]]]));
  if (t.constitutional) m.set(18, rule(t.constitutional));
  if (t.areas) {
    m.set(
      19,
      t.areas.map((a) => {
        const x = new Map<number, unknown>([
          [0, a.name],
          [1, a.holders.map(b)],
          [2, a.threshold],
        ]);
        if (a.layers?.length) x.set(3, a.layers.map((l) => [0, l]));
        if (a.fields?.length) x.set(4, a.fields.map((f) => [0, f]));
        x.set(5, a.id);
        return x;
      }),
    );
  }
  if (t.chain) {
    // Links ascending by the judge's encoding: tasks before identities, then by number or hash.
    const links = [...t.chain].sort(([x], [y]) => {
      const k = (j: typeof x) => ('task' in j ? `0${String(j.task).padStart(4, '0')}` : `1${j.identity}`);
      return k(x) < k(y) ? -1 : 1;
    });
    m.set(
      21,
      links.map(([j, next]) => ['task' in j ? [0, j.task] : [1, b(j.identity)], next.map(([h, p]) => [b(h), p])]),
    );
  }
  if (t.departed) m.set(22, t.departed.map(b));
  if (t.releaseRule) m.set(24, rule(t.releaseRule));
  if (t.forkJudge) m.set(27, b(t.forkJudge));
  if (t.fees) m.set(28, t.fees.map(([mod, part]) => [b(mod), part]));
  if (t.backups) m.set(29, new Map([[0, t.backups.map((g) => (g.length === 1 ? b(g[0]) : g.map(b)))]]));
  return cborEncode(m);
}
