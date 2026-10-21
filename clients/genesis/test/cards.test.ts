// The cards Kišib is given and how it places lines with them (H80's question
// 2): read as the apps show them, tied to acts the homes hold, the counts of
// what Kišib cannot place added up, and said in red where a line cannot be
// placed. Plain data: no homes needed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardText, planLines, readCards, type FoundLine } from '../src/lines.ts';

const h = (c: string) => c.repeat(64);
const unread = (tip: string): FoundLine => ({ tip, own: false, readable: false, card: null, latest: 'a private act', why: 'it holds a private act made elsewhere', walked: [tip] });

test('a card reads back as an app shows it: act, position, summary, count, app, and what is missing', () => {
  const shown = cardText({ act: h('a'), position: 9, summary: h('b'), hidden: 7, missing: 2 }, 'Edubba');
  assert.equal(shown, `${h('a')} 9 ${h('b')} 7 Edubba missing 2`);
  assert.deepEqual(readCards(shown), [{ act: h('a'), position: 9, summary: h('b'), hidden: 7, missing: 2, app: 'Edubba' }]);
  // A card as typed before (three parts) still reads.
  assert.deepEqual(readCards(`${h('c')} 2 ${h('d')}`), [{ act: h('c'), position: 2, summary: h('d') }]);
  assert.throws(() => readCards(`${h('c')} 2 ${h('d')} 3 ${'5e'.repeat(32)}`), /what its app adds/);
});

test('the counts add up: the unread acts that are no card’s latest lie on the cards’ lines, kept with them, nothing to tick', () => {
  const lines = [unread(h('1')), unread(h('2')), unread(h('3'))];
  const cards = [{ act: h('1'), position: 4, summary: h('9'), hidden: 2, app: 'Edubba' }, { act: h('2'), position: 1, summary: h('8'), hidden: 1, app: 'Damgar' }];
  const plan = planLines(lines, { cards, held: [h('1'), h('2'), h('3')], unplaced: [h('1'), h('2'), h('3')] });
  assert.equal(plan.warning, null);
  assert.deepEqual(plan.kept.map((k) => k.act), [h('1'), h('2')]);
  assert.deepEqual(Object.keys(plan.kept[0]).sort(), ['act', 'position', 'summary'], 'the rotation names only what field 4 holds');
  assert.ok(plan.shown.some((s) => /One more act Kišib cannot read lies on the lines kept by the cards given/.test(s.text) && s.tone === 'ok'));
});

test('the counts fall short: an act on no line whose card was given is left out, after the warning', () => {
  const lines = [unread(h('1')), unread(h('2')), unread(h('3'))];
  const cards = [{ act: h('1'), position: 4, summary: h('9'), hidden: 2, app: 'Edubba' }];
  const plan = planLines(lines, { cards, held: [h('1'), h('2'), h('3')], unplaced: [h('1'), h('2'), h('3')] });
  assert.ok(plan.warning && /left out/.test(plan.warning));
  assert.deepEqual(plan.left.map((l) => l.tip).sort(), [h('2'), h('3')]);
  assert.ok(plan.shown.some((s) => /lies on no line whose card was given/.test(s.text) && s.tone === 'bad'));
});

test('a card whose latest act the homes do not hold, or whose app says acts are missing, is said in red and must be read', () => {
  const lines = [unread(h('1'))];
  const cards = [
    { act: h('1'), position: 3, summary: h('9'), hidden: 1, app: 'Damgar', missing: 1 },
    { act: h('7'), position: 5, summary: h('8'), hidden: 0, app: 'Edubba' },
  ];
  const plan = planLines(lines, { cards, held: [h('1')], unplaced: [h('1')] });
  assert.match(plan.warning!, /Edubba’s line is not placed: its latest act \(7{64}\) is not at the identity's homes/);
  assert.match(plan.warning!, /Damgar’s line is not placed: one of its acts is not at the identity's homes \(Damgar says so\)/);
  assert.match(plan.warning!, /the accepted list/);
  assert.match(plan.warning!, /a member key for a collective would be lost with it/);
  assert.ok(plan.shown.filter((s) => /is not placed/.test(s.text)).every((s) => s.tone === 'bad'));
  // Still kept by their cards: leaving them out is not what the warning does.
  assert.deepEqual(plan.kept.map((k) => k.act).sort(), [h('1'), h('7')]);
});

test('no counts on the cards (typed by hand, or an app from before): every unread line without a card is left out, as before', () => {
  const lines = [unread(h('1')), unread(h('2'))];
  const plan = planLines(lines, { cards: [{ act: h('1'), position: 2, summary: h('9') }], held: [h('1'), h('2')], unplaced: [h('1'), h('2')] });
  assert.deepEqual(plan.left.map((l) => l.tip), [h('2')]);
  assert.ok(plan.warning && /left out/.test(plan.warning));
});
