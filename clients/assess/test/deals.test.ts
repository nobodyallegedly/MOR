// Roadmap step 14, "Done when": the tool reads the freeze suite's deals and
// the case studies' agreements, explains each, and flags each listed risk
// where a test deal carries it; a deal carrying none shows none.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, type Found } from '../src/assess.ts';
import { FREEZE, P, STUDIES, clean, names, type TestDeal } from './deals.ts';

/** What every explanation says, in this order (step 14: who signed, what each party is bound to, the shares and fees, who judges and in what order, how it ends, what is still owed). */
const HEADINGS = ['Who signed', 'What each party is bound to', 'Shares and fees', 'Who judges, and in what order', 'How it ends', 'What is still owed'];

function check(d: TestDeal) {
  const a = assess(d.payload(), names);
  const headings = a.sections.map((s) => s.heading);
  let at = -1;
  for (const h of HEADINGS) {
    const i = headings.indexOf(h);
    assert.ok(i > at, `${d.name}: “${h}” explained, in order (${headings.join(' / ')})`);
    at = i;
  }
  assert.ok(a.summary.length > 0, `${d.name}: summed up`);
  assert.equal(a.plain[0]?.text, d.terms.text, `${d.name}: its words shown as signed`);
  if (d.refused) {
    assert.ok(a.problem, `${d.name}: Agreements' objection shown`);
    assert.deepEqual(a.flags, [], `${d.name}: refused terms are judged no further`);
    return;
  }
  assert.equal(a.problem, null, `${d.name}: no objection`);
  assert.deepEqual(a.flags.map((f) => f.code).sort(), [...d.flags].sort(), `${d.name} (${d.source})`);
  for (const f of a.flags) assert.match(f.rests, /rule \d+|stated cost|field \d+/i, `${d.name}: ${f.code} names what it rests on`);
  // The risks are also in the explanation, last, as its own section.
  const risks = a.sections.find((s) => s.heading === 'Risks');
  assert.equal(risks?.lines.length ?? 0, Math.max(a.flags.length, 1));
}

for (const d of FREEZE) test(`freeze suite: ${d.name}`, () => check(d));
for (const d of STUDIES) test(`case study: ${d.name}`, () => check(d));
test(`no risk: ${clean.name}`, () => check(clean));

test('every listed risk is carried by some test deal, and flagged there', () => {
  const carried = new Set([...FREEZE, ...STUDIES].flatMap((d) => d.flags));
  for (const code of ['no-exit', 'uncapped-fee', 'judge-is-party', 'no-fork-judge', 'dilutable-stake', 'no-owner'] as const) assert.ok(carried.has(code), code);
});

test('the shares, fees and judges are said in plain words, from the core’s reading', () => {
  const film = FREEZE[1];
  const a = assess(film.payload(), names);
  const said = (h: string) => a.sections.find((s) => s.heading === h)!.lines.map((l) => l.text).join(' ');
  assert.match(said('Shares and fees'), /ana 50%.*ben 30%.*cy 20%/);
  assert.match(said('Shares and fees'), /2% of each payout/);
  assert.match(said('Who judges, and in what order'), /arb.*then arb2.*30/);
  assert.match(said('Who judges, and in what order'), /judge of forks.*arb/i);
  assert.match(said('How it ends'), /every party signs/);
  const label = STUDIES[1];
  const l = assess(label.payload(), names);
  assert.match(l.sections.find((s) => s.heading === 'Shares and fees')!.lines.map((x) => x.text).join(' '), /off the top/);
  const band = STUDIES[0];
  assert.match(assess(band.payload(), names).sections.find((s) => s.heading === 'Shares and fees')!.lines.map((x) => x.text).join(' '), /referral.*preset maker|fee entry/);
});

test('what the relays show is said: who signed, whether it is in force, what is still owed', () => {
  const found: Found = {
    at: ['http://relay.test'],
    signed: [P.ana],
    exists: false,
    invalid: null,
    inForce: null,
    fork: null,
    owed: [{ text: 'The split service owes 40 to ben.' }],
  };
  const a = assess(FREEZE[8].payload(), names, found);
  const said = (h: string) => a.sections.find((s) => s.heading === h)!.lines.map((l) => l.text).join(' ');
  assert.match(said('Who signed'), /ana has signed/);
  assert.match(said('Who signed'), /ben has not signed/);
  assert.match(said('Who signed'), /not in force/i);
  assert.match(said('What is still owed'), /owes 40 to ben/);
  const terms = assess(FREEZE[8].payload(), names);
  assert.match(terms.sections.find((s) => s.heading === 'Who signed')!.lines.map((l) => l.text).join(' '), /relays were not asked/);
});
