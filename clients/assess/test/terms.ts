// Terms and publication payloads for the tests, written field by field as
// Agreements draft 17 gives them ("Terms (type 0)", "Publication (type 6)").
// Only the encoding is here: every terms payload is read back by the core
// library (`readTerms`), which refuses what is not in Agreements' format and
// says why terms in it still fail Agreements' checks; every publication is
// encoded and checked by the core (`publicationPayload`).

import { cborEncode, publicationPayload, sha256, unhex } from '../../genesis/src/core.ts';

/** A test identity, specification or act: a hash of its name. */
export const id = (name: string): string => sha256(name);

const b = (h: string) => unhex(h);

/** `rule`: every party, any k of them, named ones, or holders by share of the stake. */
export type Rule = { all: true } | { threshold: number } | { named: string[] } | { share: number };
const rule = (r: Rule): unknown[] => ('all' in r ? [0] : 'threshold' in r ? [1, r.threshold] : 'named' in r ? [2, r.named.map(b)] : [3, 0, r.share]);

export interface Area {
  id: number;
  name: string;
  holders: string[];
  threshold: number;
  /** Act types it reaches: `[spec, type]`. */
  kinds: [string, number][];
  /** A grant limits cMIP capping it (key 6). */
  limits?: string;
}

export interface Terms {
  parties: string[];
  text: string;
  cmips?: Record<number, string>;
  keepers?: { operators: string[]; rule: Rule };
  clone?: Rule;
  /** The time reference's cMIP (field 6, with task 10 of field 2). */
  time?: string;
  /** The target (field 33): a work's claim, or this collective (null). */
  target: { claim: string } | { collective: true };
  /** The one stake (field 7). */
  owners: [string, number][];
  abandonment?: { named?: string; others?: number; outcomes: number[]; proof?: string };
  arbitrators?: string[];
  extensions?: string[];
  succession?: { party: string; stakes?: [string, number][] }[];
  refundUntil?: number;
  constitutional?: Rule;
  /** Field 19, for a collective: each layer's rule; a layer left out takes the clone rule. */
  layers?: Partial<Record<1 | 2 | 3 | 4 | 5, Rule>>;
  areas?: Area[];
  /** Field 21: each judge (a task number, or an identity) and those that take over, with their periods. */
  chain?: [{ task: number } | { identity: string }, [string, number][]][];
  departed?: string[];
  releaseRule?: Rule;
  forkJudge?: string;
  /** Field 30: the stake's holders' rule by share, and a standing waiver of pre-emption. */
  holdersRule?: { share: number; waived?: boolean };
  /** Field 12, for a collective: the chain key, any k of these members. */
  chainKey?: { threshold: number; members: string[] };
  /** Field 11, for a clone, with its mark (field 4): the clone rule and these signers. */
  parent?: { id: string; signers: string[] };
}

/** The exact payload of these terms. */
export function encode(t: Terms): Uint8Array {
  const m = new Map<number, unknown>();
  const collective = 'collective' in t.target;
  m.set(0, t.parties.map(b));
  m.set(1, t.text);
  const cmips = new Map<number, unknown>(Object.entries(t.cmips ?? {}).map(([k, v]) => [Number(k), b(v)]));
  if (t.time) cmips.set(10, b(t.time));
  m.set(2, cmips);
  if (t.keepers) m.set(3, [[...t.keepers.operators].sort().map(b), rule(t.keepers.rule)]);
  m.set(4, t.parent ? [[[1], [...t.parent.signers].sort().map(b)]] : [0]);
  m.set(5, rule(t.clone ?? { all: true }));
  if (t.time) m.set(6, [b(t.time), 0]);
  m.set(7, t.owners.map(([h, n]) => [b(h), n]));
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
  if (collective) {
    const ck = t.chainKey ?? { threshold: Math.max(1, t.parties.length - 1), members: t.parties };
    m.set(12, new Map<number, unknown>([[1, [1, ck.threshold, ck.members.map(b)]]]));
    m.set(19, new Map<number, unknown>([1, 2, 3, 4, 5].map((l) => [l, rule(t.layers?.[l as 1] ?? t.clone ?? { all: true })])));
  }
  if (t.arbitrators) m.set(13, t.arbitrators.map(b));
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
  if (t.chain) {
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
  if (t.holdersRule) m.set(30, [[0, [3, t.holdersRule.share], ...(t.holdersRule.waived ? [true] : [])]]);
  m.set(33, collective ? [1, null] : [0, b((t.target as { claim: string }).claim)]);
  if (t.areas) {
    m.set(
      34,
      [...t.areas]
        .sort((x, y) => x.id - y.id)
        .map((a) => {
          const x = new Map<number, unknown>([
            [0, a.name],
            [1, a.holders.map(b)],
            [2, a.threshold],
            [3, a.kinds.map(([spec, type]) => [1, b(spec), type])],
            [5, a.id],
          ]);
          if (a.limits) x.set(6, [b(a.limits), new Map<number, unknown>([[0, [b(id('a unit')), 1000]]])]);
          return x;
        }),
    );
  }
  return cborEncode(m);
}

/** A publication's fields, as the core's `publicationPayload` takes them. */
export interface Pub {
  /** What it sells; absent: a split agreement. */
  sold?: ({ bake: string } | { vow: string })[];
  owners?: string;
  partners?: { identity: string; share: number; label?: string }[];
  service: string;
  roles?: [string, number][];
  cmip: string;
  max?: number;
  serviceBears?: boolean;
  fees?: { module: string; part: number }[];
  words?: string;
  designated?: string;
  backups?: string[];
}

/** The exact payload of this publication, encoded and checked by the core. */
export function encodePub(p: Pub): Uint8Array {
  const made = publicationPayload({
    ...(p.sold ? { sold: p.sold } : {}),
    ...(p.owners ? { owners: p.owners } : {}),
    partners: p.partners ?? [],
    service: p.service,
    plan: {
      shares: (p.roles ?? []).map(([role, part]) => ({ role, part })),
      cmip: p.cmip,
      serviceBearsRailFees: !!p.serviceBears,
      ...(p.max !== undefined ? { maxRailFeeMillionths: p.max } : {}),
      fees: p.fees ?? [],
    },
    ...(p.words ? { words: p.words } : {}),
    ...(p.designated ? { designated: p.designated } : {}),
    backups: p.backups ?? [],
  }) as { payload: Uint8Array };
  return made.payload;
}
