// Roadmap step 14, "Done when", on the redesigned acts (round 9, F411): the
// tool reads the freeze suite's and the case studies' agreements as people
// now sign them (ownership agreements, constitutions, publications),
// explains each, and flags each listed risk where a test act carries it; an
// act carrying none shows none.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, assessPublication, type Found } from '../src/assess.ts';
import { FREEZE, P, STUDIES, clean, cleanPub, names, type TestDeal } from './deals.ts';
import { encode } from './terms.ts';

/** What every explanation of terms says, in this order. */
const TERMS = ['Who signed', 'What each party is bound to', 'Who owns what', 'How the owners decide', 'Who judges, and in what order', 'How it ends', 'What is still owed'];
/** And of a publication. */
const PUB = ['What it sells', 'The owners', 'Partners and their labels', 'The split plan and its fees', 'The split service and its backups', 'Who signs, and how it ends'];

function check(d: TestDeal) {
  const a = d.read();
  const headings = a.sections.map((s) => s.heading);
  let at = -1;
  for (const h of d.terms ? TERMS : PUB) {
    const i = headings.indexOf(h);
    assert.ok(i > at, `${d.name}: “${h}” explained, in order (${headings.join(' / ')})`);
    at = i;
  }
  assert.ok(a.summary.length > 0, `${d.name}: summed up`);
  if (d.terms) assert.equal(a.plain[0]?.text, d.terms.text, `${d.name}: its words shown as signed`);
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
  assert.equal(headings[headings.length - 1], 'Risks');
}

for (const d of FREEZE) test(`freeze suite: ${d.name}`, () => check(d));
for (const d of STUDIES) test(`case study: ${d.name}`, () => check(d));
test(`no risk: ${clean.name}`, () => check(clean));
test(`no risk: ${cleanPub.name}`, () => check(cleanPub));

test('every listed risk is carried by some test act, and flagged there', () => {
  const carried = new Set([...FREEZE, ...STUDIES].flatMap((d) => d.flags));
  for (const code of ['no-exit', 'uncapped-fee', 'judge-is-party', 'no-fork-judge', 'dilutable-stake', 'no-owner', 'partners-first', 'money-alone', 'absence-on-word', 'split-service-window'] as const) assert.ok(carried.has(code), code);
});

const said = (a: ReturnType<typeof assess>, h: string) => a.sections.find((s) => s.heading === h)!.lines.map((l) => l.text).join(' ');

test('an ownership agreement: the stake, the judges, the ending, in plain words, from the core’s reading', () => {
  const a = FREEZE[1].read();
  assert.equal(a.kind, 'ownership');
  assert.match(said(a, 'Who owns what'), /ana 50%.*ben 30%.*cy 20%/);
  assert.match(said(a, 'Who owns what'), /no split plan, no fees and no split service: those are a publication’s/);
  assert.match(said(a, 'Who judges, and in what order'), /arb.*then arb2.*30/);
  assert.match(said(a, 'Who judges, and in what order'), /judge of forks.*arb/i);
  assert.match(said(a, 'How it ends'), /every party signs/);
});

test('a constitution: an ownership agreement with an identity of its own; its layers, Money first; how the owners decide', () => {
  const a = FREEZE.find((d) => d.name === 'The band’s constitution')!.read();
  assert.equal(a.kind, 'collective');
  assert.match(a.summary[0], /ownership agreement with an identity of its own/);
  assert.match(said(a, 'Who owns what'), /a share of all its income/);
  assert.match(said(a, 'How the owners decide'), /judicial tier.*every member/);
  const layers = said(a, 'The five layers: who acts for it');
  assert.ok(layers.indexOf('Money') < layers.indexOf('Text'), 'Money first');
});

test('a publication: its price tags, owners by reference, partners and labels, plan and fees, service and backups, ending', () => {
  const d = FREEZE.find((x) => x.name === 'Publisher A’s publication of the song')!;
  const a = assessPublication(d.payload(), names, {
    owners: encode(d.owners!),
    tags: [
      { price: { unit: P.pay, value: 500 }, payee: P.service },
      { price: { unit: P.pay, value: 900 }, payee: P.publisher },
    ],
    unit: (_u, v) => `${v} test sats`,
  });
  assert.equal(a.kind, 'publication');
  assert.match(said(a, 'Its price'), /500 test sats, paid to service, its split service/);
  assert.match(said(a, 'Its price'), /900 test sats, paid to publisher, not to its split service.*rule 16/);
  assert.match(said(a, 'Its price'), /latest versions before paying/);
  assert.match(said(a, 'The owners'), /read by reference.*never a copy/);
  assert.match(said(a, 'The owners'), /ana 50%.*ben 50%/);
  assert.match(said(a, 'Partners and their labels'), /publisher, labelled “publisher”: 30% of each payment, off the top/);
  assert.match(said(a, 'The split plan and its fees'), /role “referral”: 5%/);
  assert.match(said(a, 'The split plan and its fees'), /Off the top of each payment: 35%.*owners’ line/);
  assert.match(said(a, 'The split plan and its fees'), /no maximum fee per payout: there is no cap/);
  assert.match(said(a, 'The split service and its backups'), /signs its receipt as itself.*every receiver receipting their own/);
  assert.match(said(a, 'Who signs, and how it ends'), /no party ends it alone/);
  const b = FREEZE.find((x) => x.name === 'Ana and Ben’s publication, with a backup service')!.read();
  assert.match(said(b, 'The split service and its backups'), /backup.*takes that payment/);
});

test('a collective’s publication: the collective signs under its rule for Agreements; a split agreement says so', () => {
  const a = FREEZE.find((d) => d.name === 'The band’s split agreement')!.read();
  assert.equal(a.kind, 'split agreement');
  assert.match(said(a, 'The owners'), /collective’s constitution/);
  assert.match(said(a, 'The owners'), /any 2 of its 3 members, each with their own key, naming the collective/);
  assert.match(said(a, 'What it sells'), /sells nothing and takes no price tag/);
});

test('what the relays show is said: who signed, whether it is in force, what is still owed; a publication’s verdicts', () => {
  const found: Found = { at: ['http://relay.test'], signed: [P.ana], exists: false, invalid: null, inForce: null, fork: null, owed: [{ text: 'The split service owes 40 to ben.' }] };
  const song = FREEZE.find((x) => x.name === 'The song, before its publishers')!;
  const a = assess(song.payload(), names, found);
  assert.match(said(a, 'Who signed'), /ana has signed/);
  assert.match(said(a, 'Who signed'), /ben has not signed/);
  assert.match(said(a, 'Who signed'), /not in force/i);
  assert.match(said(a, 'What is still owed'), /owes 40 to ben/);
  assert.match(said(song.read(), 'Who signed'), /relays were not asked/);
  const pub = FREEZE.find((x) => x.name === 'The film’s publication, a distributor partner')!;
  const p = assessPublication(pub.payload(), names, { found: { at: ['http://relay.test'], counts: false, unsigned: [P.publisher], problems: [], latest: ['a', 'b'] } });
  assert.match(said(p, 'Who signs, and how it ends'), /publisher has not signed/);
  assert.match(said(p, 'Who signs, and how it ends'), /stands forked/);
  assert.match(said(p, 'The owners'), /not held here/);
});
