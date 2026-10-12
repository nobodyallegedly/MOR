// Each risk the tool flags (roadmap step 14), shown present and absent on
// the smallest terms that carry it, and the rule or stated cost it rests on.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, type FlagCode } from '../src/assess.ts';
import { P, clean, names } from './deals.ts';
import { encode, id, type Terms } from './terms.ts';

const work = id('a work');
/** Two parties, half each of a work, nothing else. */
const base: Terms = { parties: [P.ana, P.ben], text: 'Ana and Ben share a work.', stakes: [[work, [[P.ana, 500_000], [P.ben, 500_000]]]] };
const grants = { payeeGrants: [id('grant: Ana'), id('grant: Ben')] };
const plan = (max?: number) => ({ shares: [{ stake: 0, part: 1 }], cmip: P.split, max });
/** A clause removing an absent party's voice, judged by a third party with an absence-proof cMIP. */
const clause = { named: P.authority, outcomes: [0], proof: P.proof };

const flagsOf = (t: Terms) => assess(encode(t), names).flags;
const codes = (t: Terms) => flagsOf(t).map((f) => f.code);
const one = (t: Terms, code: FlagCode) => {
  const f = flagsOf(t).filter((x) => x.code === code);
  assert.equal(f.length, 1, `one ${code} flag: ${JSON.stringify(flagsOf(t))}`);
  return f[0];
};
const none = (t: Terms, code: FlagCode) => assert.ok(!codes(t).includes(code), `no ${code} flag: ${JSON.stringify(flagsOf(t))}`);

test('a deal carrying none of the risks shows none', () => {
  const a = assess(clean.payload(), names);
  assert.equal(a.problem, null);
  assert.deepEqual(a.flags, []);
  assert.ok(a.sections.length > 0, 'still explained');
});

test('no exit: a party nobody can declare absent holds the whole deal (rule 47, stated cost)', () => {
  const f = one(base, 'no-exit');
  assert.equal(f.family, 'listed');
  assert.deepEqual([...(f.who ?? [])].sort(), [P.ana, P.ben].sort());
  assert.match(f.rests, /rule 47.*stated cost/i);
  assert.match(f.text, /silent/);
  none({ ...base, abandonment: clause }, 'no-exit');
  // A clause that never removes a voice leaves every party holding the deal.
  assert.deepEqual(one({ ...base, abandonment: { ...clause, outcomes: [1] } }, 'no-exit').who?.sort(), [P.ana, P.ben].sort());
  // A party who is the absence authority cannot be declared absent: that party alone holds it.
  assert.deepEqual(one({ ...base, abandonment: { ...clause, named: P.ana } }, 'no-exit').who, [P.ana]);
  // A collective's member can always leave alone (rule 70): no such flag.
  none(collective({}), 'no-exit');
});

test('uncapped fee: a plan stating no maximum fee per payout (rule 25), or fees raised without their bearers (rule 28)', () => {
  const f = one({ ...base, ...grants, plan: plan() }, 'uncapped-fee');
  assert.match(f.rests, /rule 25/);
  // Rule 25's current words (F271): the plan “may state” one; none, no cap.
  assert.match(f.rests, /may state a maximum fee per payout/);
  assert.match(f.rests, /there is no cap/);
  assert.match(f.text, /no maximum/i);
  none({ ...base, ...grants, plan: plan(20_000) }, 'uncapped-fee');
  none(base, 'uncapped-fee');
  // A collective whose fees one member's area reaches: the others bear them without signing.
  const g = one(collective({ areas: [{ id: 1, name: 'Fees', holders: [P.ana], threshold: 1, fields: [28] }] }), 'uncapped-fee');
  assert.match(g.rests, /rule 28/);
  assert.deepEqual([...(g.who ?? [])].sort(), [P.ben, P.cy].sort());
  // Every member must sign a change of the fees: nobody bears one they did not sign.
  none(collective({}), 'uncapped-fee');
  // F270: a deal's holder who is no party signs a version adding a fee; the core refuses it otherwise.
  none({ ...base, ...grants, plan: plan(20_000), stakes: [[work, [[P.ana, 400_000], [P.ben, 400_000], [P.cy, 200_000]]]] }, 'uncapped-fee');
  // F270: so does a collective's departed holder, whatever area places the fees.
  assert.equal(assess(encode(departed({})), names).problem, null, 'terms Agreements accept');
  // Ben, a member outside the area, is left to the collective's rules, and still flagged; Cy is not.
  assert.deepEqual(one(departed({ areas: [{ id: 1, name: 'Fees', holders: [P.ana], threshold: 1, fields: [28] }] }), 'uncapped-fee').who, [P.ben]);
});

test('judge who is also a party: an arbitrator, the judge of forks, a keeper, the absence authority or a later link', () => {
  for (const t of [
    { ...base, arbitrators: [P.ana] },
    { ...base, arbitrators: [P.ana], forkJudge: P.ana },
    { ...base, keepers: { operators: [P.ben], rule: { all: true } as const } },
    { ...base, abandonment: { ...clause, named: P.ben } },
    { ...base, time: P.clock, arbitrators: [P.arb], chain: [[{ identity: P.arb }, [[P.ben, 30]]]] as Terms['chain'] },
  ] satisfies Terms[]) {
    const f = one(t, 'judge-is-party');
    assert.equal(f.who?.length, 1);
    assert.ok(f.who![0] === P.ana || f.who![0] === P.ben);
    assert.match(f.rests, /rule 35/);
  }
  none({ ...base, arbitrators: [P.arb], forkJudge: P.arb, abandonment: clause }, 'judge-is-party');
});

test('no judge of forks: the deal waits on its reference (rule 47)', () => {
  const f = one(base, 'no-fork-judge');
  assert.match(f.rests, /rule 47/);
  assert.match(f.text, /reference/);
  none({ ...base, arbitrators: [P.arb], forkJudge: P.arb }, 'no-fork-judge');
  none(collective({}), 'no-fork-judge');
});

test('a stake diluted without its holder: pre-authorised outcomes (rule 48), a release rule, a plan changed without them', () => {
  for (const outcome of [1, 2]) {
    const f = one({ ...base, abandonment: { ...clause, outcomes: [0, outcome] } }, 'dilutable-stake');
    assert.match(f.rests, /rule 48/);
  }
  none({ ...base, abandonment: clause }, 'dilutable-stake');
  // A release rule short of every holder: two may release Cy's stake to the public domain.
  const r = one({ ...base, stakes: [[work, [[P.ana, 400_000], [P.ben, 400_000], [P.cy, 200_000]]]], releaseRule: { named: [P.ana, P.ben] } }, 'dilutable-stake');
  assert.deepEqual(r.who, [P.cy]);
  assert.match(r.rests, /rule 55|field 24/);
  // A holder who is no party of a deal signs a version paying it less (F270): no longer a risk, the core refuses it.
  none({ ...base, ...grants, plan: plan(1), stakes: [[work, [[P.ana, 400_000], [P.ben, 400_000], [P.cy, 200_000]]]] }, 'dilutable-stake');
  // A collective's departed holder too (F270), whatever area reaches the plan; Ben, a member outside it, is still flagged.
  assert.deepEqual(one(departed({ areas: [{ id: 1, name: 'Money', holders: [P.ana], threshold: 1, fields: [8] }] }), 'dilutable-stake').who, [P.ben]);
  // Unless the clause may take its stake: that permission reaches its pay (F273).
  const g = one(departed({ abandonment: { others: 1, outcomes: [0, 1], proof: P.proof } }), 'dilutable-stake');
  assert.ok(g.who?.includes(P.cy), JSON.stringify(g.who));
  assert.match(g.text, /departed, may be declared absent/);
  assert.match(g.rests, /F273/);
  assert.match(g.rests, /rule 48/);
  // A collective whose split plan one member's area reaches.
  const c = one(collective({ areas: [{ id: 1, name: 'Money', holders: [P.ana], threshold: 1, fields: [8] }] }), 'dilutable-stake');
  assert.deepEqual([...(c.who ?? [])].sort(), [P.ben, P.cy].sort());
  none(collective({}), 'dilutable-stake');
  none(base, 'dilutable-stake');
});

test('stated costs a clause brings: absence on the authority’s word, payer-side splitting, the split service’s window', () => {
  const w = one({ ...base, abandonment: { named: P.authority, outcomes: [0] } }, 'absence-on-word');
  assert.equal(w.family, 'stated cost');
  assert.match(w.rests, /rule 87/);
  none({ ...base, abandonment: clause }, 'absence-on-word');
  const p = one(base, 'payer-side-split');
  assert.match(p.rests, /rule 16/);
  none({ ...base, ...grants }, 'payer-side-split');
  const s = one({ ...base, ...grants }, 'split-service-window');
  assert.match(s.rests, /rule 10/);
  none(base, 'split-service-window');
  // No stakes, no money divided by them: neither.
  none(clean.terms, 'payer-side-split');
  none(clean.terms, 'split-service-window');
});

test('terms Agreements refuse are explained with the core’s objection, and judged no further', () => {
  const a = assess(encode({ ...base, abandonment: { others: 1, outcomes: [0] } }), names);
  assert.match(a.problem ?? '', /B19/);
  assert.deepEqual(a.flags, []);
});

/** A collective of three holding all its income 40/30/30, every change by every member, unless `over` says otherwise. */
function collective(over: Partial<Terms>): Terms {
  const m = [P.ana, P.ben, P.cy];
  return {
    parties: m,
    text: 'A collective of three.',
    grammar: { signing: { threshold: 2, members: m }, chainKey: { threshold: 2, members: m } },
    abandonment: { others: 2, outcomes: [0], proof: P.proof },
    stakes: [[null, [[P.ana, 400_000], [P.ben, 300_000], [P.cy, 300_000]]]],
    splitGrant: id('grant: the collective to its service'),
    plan: plan(10_000),
    ...over,
  };
}

/** The same collective after Cy left, keeping a stake (field 22): Ana and Ben decide. */
function departed(over: Partial<Terms>): Terms {
  const m = [P.ana, P.ben];
  return collective({
    parties: m,
    grammar: { signing: { threshold: 1, members: m }, chainKey: { threshold: 1, members: m } },
    abandonment: { others: 1, outcomes: [0], proof: P.proof },
    departed: [P.cy],
    ...over,
  });
}

test('before signing, the clients show the shares and fees and the risks; nothing for bytes that are not terms', async () => {
  const { beforeSigning } = await import('../src/assess.ts');
  const s = beforeSigning(encode(base), names);
  assert.deepEqual(s.map((x) => x.heading), ['Shares and fees', 'Risks, before you sign (the deal-assessment tool)']);
  assert.match(s[1].lines.map((l) => l.text).join(' '), /cannot be declared absent/);
  assert.deepEqual(beforeSigning(new Uint8Array([1, 2, 3]), names), []);
});
