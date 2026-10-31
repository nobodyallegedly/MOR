// Each risk the tool flags (roadmap step 14, moved in round 9, F411), shown
// present and absent on the smallest act that carries it, and the rule or
// stated cost it rests on.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, assessPublication, beforeSigning, beforeSigningPublication, type Flag, type FlagCode } from '../src/assess.ts';
import { MIRS } from '../../genesis/src/core.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { P, names } from './deals.ts';
import { encode, encodePub, id, type Pub, type Terms } from './terms.ts';

/** Two owners of a work, half each, nothing else. */
const base: Terms = { parties: [P.ana, P.ben], text: 'Ana and Ben share a work.', target: { claim: id('a claim') }, owners: [[P.ana, 500_000], [P.ben, 500_000]] };
/** A clause removing an absent party's voice, judged by a third party with an absence-proof cMIP. */
const clause = { named: P.authority, outcomes: [0], proof: P.proof };
const work = id('the work’s ownership agreement');
/** A publication of that work, a capped fee, no partner. */
const pub: Pub = { sold: [{ bake: id('a bake') }], owners: work, service: P.service, cmip: P.split, max: 10_000 };

/** A collective of three holding all its income 40/30/30, two of three in every layer. */
function collective(over: Partial<Terms>): Terms {
  return {
    parties: [P.ana, P.ben, P.cy],
    text: 'A collective of three.',
    target: { collective: true },
    owners: [[P.ana, 400_000], [P.ben, 300_000], [P.cy, 300_000]],
    clone: { threshold: 2 },
    abandonment: { others: 2, outcomes: [0], proof: P.proof },
    extensions: [REPO_SPECS.manifest],
    ...over,
  };
}

const flagsOf = (t: Terms): Flag[] => assess(encode(t), names).flags;
const pubFlags = (p: Pub, owners: Terms | null = base): Flag[] => assessPublication(encodePub(p), names, { owners: owners ? encode(owners) : null, drafter: P.ana }).flags;
const one = (fs: Flag[], code: FlagCode) => {
  const f = fs.filter((x) => x.code === code);
  assert.equal(f.length, 1, `one ${code} flag: ${JSON.stringify(fs.map((x) => x.code))}`);
  return f[0];
};
const none = (fs: Flag[], code: FlagCode) => assert.ok(!fs.some((x) => x.code === code), `no ${code} flag: ${JSON.stringify(fs.map((x) => x.code))}`);

test('no exit: an owner nobody can declare absent holds a work’s ownership agreement (rule 47, stated cost)', () => {
  const f = one(flagsOf(base), 'no-exit');
  assert.equal(f.family, 'listed');
  assert.deepEqual([...(f.who ?? [])].sort(), [P.ana, P.ben].sort());
  assert.match(f.rests, /rule 47, stated cost/);
  assert.match(f.text, /silent.*publication/);
  none(flagsOf({ ...base, abandonment: clause }), 'no-exit');
  assert.deepEqual(one(flagsOf({ ...base, abandonment: { ...clause, named: P.ana } }), 'no-exit').who, [P.ana]);
  // A collective's member can always leave alone (rule 70): no such flag.
  none(flagsOf(collective({})), 'no-exit');
});

test('no exit, in a publication: no party ends it alone, though its tag’s signer can stop sales (rule 11; Money rule 18)', () => {
  const f = one(pubFlags(pub), 'no-exit');
  assert.match(f.rests, /rule 11/);
  assert.match(f.rests, /Money rule 18/);
  assert.match(f.text, /withdraw the tag/);
  // A lone seller selling through itself: one party, no exit to want.
  none(pubFlags({ ...pub, owners: undefined, service: P.ana }, null), 'no-exit');
});

test('uncapped fee: a publication’s plan states no maximum fee per payout (rule 25, client conformance)', () => {
  const f = one(pubFlags({ ...pub, max: undefined }), 'uncapped-fee');
  assert.match(f.rests, /rule 25/);
  assert.match(f.rests, /may state a maximum fee per payout/);
  assert.match(f.rests, /there is no cap/);
  assert.match(f.rests, /must flag the absence before a party signs/);
  none(pubFlags(pub), 'uncapped-fee');
  // An ownership agreement carries no plan: nothing to cap.
  none(flagsOf(base), 'uncapped-fee');
});

test('judge who is also a party: an arbitrator, the judge of forks, a keeper, the absence authority or a later link', () => {
  for (const t of [
    { ...base, arbitrators: [P.ana] },
    { ...base, arbitrators: [P.ana], forkJudge: P.ana },
    { ...base, keepers: { operators: [P.ben], rule: { all: true } as const } },
    { ...base, abandonment: { ...clause, named: P.ben } },
    { ...base, time: P.clock, arbitrators: [P.arb], chain: [[{ identity: P.arb }, [[P.ben, 30]]]] as Terms['chain'] },
  ] satisfies Terms[]) {
    const f = one(flagsOf(t), 'judge-is-party');
    assert.match(f.rests, /rule 35/);
  }
  none(flagsOf({ ...base, arbitrators: [P.arb] }), 'judge-is-party');
});

test('no judge of forks: a work’s ownership agreement waits on its reference (rule 47)', () => {
  assert.match(one(flagsOf(base), 'no-fork-judge').rests, /rule 47, field 27/);
  none(flagsOf({ ...base, arbitrators: [P.arb], forkJudge: P.arb }), 'no-fork-judge');
  none(flagsOf(collective({})), 'no-fork-judge');
  none(flagsOf({ ...base, parties: [P.ana], owners: [[P.ana, 1_000_000]] }), 'no-fork-judge');
});

test('a stake diluted without its holder: outcome 1 (rule 89), a release rule (rule 55), the holders’ rule by share (rules 94, 95), pre-emption waived (rule 96), a collective’s publication', () => {
  const o = one(flagsOf({ ...base, abandonment: { ...clause, outcomes: [0, 1] } }), 'dilutable-stake');
  assert.match(o.rests, /rule 89/);
  // A stake successor named: outcome 1 does not reach the stake.
  none(flagsOf({ ...base, abandonment: { ...clause, outcomes: [0, 1] }, succession: [{ party: P.ana, stakes: [[P.cy, 1_000_000]] }, { party: P.ben, stakes: [[P.cy, 1_000_000]] }] }), 'dilutable-stake');
  const r = one(flagsOf({ ...base, releaseRule: { named: [P.ana] } }), 'dilutable-stake');
  assert.deepEqual(r.who, [P.ben]);
  assert.match(r.rests, /rule 55/);
  const h = one(flagsOf(collective({ holdersRule: { share: 600_000 } })), 'dilutable-stake');
  assert.match(h.rests, /rules 94 and 95/);
  assert.match(h.text, /60%/);
  assert.match(one(flagsOf(collective({ holdersRule: { share: 600_000, waived: true } })), 'dilutable-stake').rests, /rule 96/);
  none(flagsOf(collective({})), 'dilutable-stake');
  // A collective's publication signed under its rule for Agreements, two of three.
  const c = collective({});
  const p = one(pubFlags(pub, c), 'dilutable-stake');
  assert.match(p.rests, /rules 11 and 15/);
  assert.match(p.text, /any 2 of 3 members/);
  none(pubFlags(pub, collective({ layers: { 4: { all: true } } })), 'dilutable-stake');
});

test('no owner: a publication leaving nothing for the owners’ line (rule 22), or a split agreement naming a work or none', () => {
  const f = one(pubFlags({ ...pub, partners: [{ identity: P.publisher, share: 1_000_000 }] }), 'no-owner');
  assert.match(f.rests, /rule 22/);
  assert.match(f.text, /nothing is left/);
  assert.match(one(pubFlags({ owners: work, service: P.service, cmip: P.split, max: 10_000 }), 'no-owner').text, /counts for nothing/);
  none(pubFlags({ owners: work, service: P.service, cmip: P.split, max: 10_000 }, collective({})), 'no-owner');
  none(pubFlags(pub), 'no-owner');
});

test('partners paid before the owners with no cap but 100%: half or more off the top (rules 22 and 11)', () => {
  const f = one(pubFlags({ ...pub, partners: [{ identity: P.label, share: 450_000, label: 'label' }], roles: [['referral', 100_000]] }), 'partners-first');
  assert.match(f.text, /55%.*label \(label\) 45%.*referral.*10%.*leaving the owners 45%/);
  assert.match(f.rests, /rule 22/);
  assert.deepEqual(f.who, [P.label]);
  none(pubFlags({ ...pub, partners: [{ identity: P.label, share: 400_000 }] }), 'partners-first');
});

test('one member alone holding Money: the layer’s rule (rule 60), or an uncapped Money area held by one', () => {
  const f = one(flagsOf(collective({ layers: { 3: { threshold: 1 } } })), 'money-alone');
  assert.match(f.text, /any one member can act alone in Money/);
  assert.match(f.rests, /rule 60/);
  assert.deepEqual(one(flagsOf(collective({ layers: { 3: { named: [P.ben] } } })), 'money-alone').who, [P.ben]);
  const area = { id: 1, name: 'Price tags', holders: [P.ana], threshold: 1, kinds: [[MIRS.money, 5]] as [string, number][] };
  assert.match(one(flagsOf(collective({ areas: [area] })), 'money-alone').text, /“Price tags”, in Money.*no cap/);
  none(flagsOf(collective({})), 'money-alone');
});

test('stated costs a clause brings: absence on the authority’s word (rule 87), the split service’s window (rule 32)', () => {
  assert.match(one(flagsOf({ ...base, abandonment: { named: P.authority, outcomes: [0] } }), 'absence-on-word').rests, /rule 87, stated cost/);
  none(flagsOf({ ...base, abandonment: clause }), 'absence-on-word');
  const w = one(pubFlags(pub), 'split-service-window');
  assert.equal(w.family, 'stated cost');
  assert.match(w.rests, /rule 32/);
  // Selling through oneself: nobody else's money is held.
  none(pubFlags({ ...pub, owners: undefined, service: P.ana }, null), 'split-service-window');
});

test('terms Agreements refuse are explained with the core’s objection, and judged no further', () => {
  const a = assess(encode({ ...base, abandonment: { others: 1, outcomes: [0] } }), names);
  assert.match(a.problem ?? '', /B19/);
  assert.deepEqual(a.flags, []);
});

test('before signing, the clients show who owns what, how the owners decide, the plan and the risks; nothing for bytes that are not terms or a publication', () => {
  const s = beforeSigning(encode(base), names);
  assert.deepEqual(s.map((x) => x.heading), ['Who owns what', 'How the owners decide', 'Risks, before you sign (the assessment tool)']);
  assert.match(s[2].lines.map((l) => l.text).join(' '), /cannot be declared absent/);
  assert.deepEqual(beforeSigning(new Uint8Array([1, 2, 3]), names), []);
  const p = beforeSigningPublication(encodePub({ ...pub, max: undefined }), names, { owners: encode(base) });
  assert.deepEqual(p.map((x) => x.heading), ['The split plan and its fees', 'Risks, before you sign (the assessment tool)']);
  assert.match(p[1].lines.map((l) => l.text).join(' '), /Uncapped fee/);
  assert.deepEqual(beforeSigningPublication(new Uint8Array([1, 2, 3]), names), []);
});
