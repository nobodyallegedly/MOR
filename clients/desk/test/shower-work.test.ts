// cMIP shower work, draft 12, as Edubba reads it: the draft's own vectors, on decoded words.
// Runs alone: node --experimental-strip-types --test test/shower-work.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { condition, divide, read, refundOwed, releaseHeld, sameService, showerLines, whichShowerWork } from '../src/shower-work.ts';

const u = (c: string) => Uint8Array.from(Buffer.from(c.repeat(64), 'hex'));
const id = (c: string) => c.repeat(64);
const P = (...cs: string[]) => cs.map((c) => ({ signer: id(c) }));
const o = (c: string) => [0, u(c)];
const k = (c: string) => 'p:' + id(c);
const W = (m: [number, unknown][]) => new Map(m);
const amounts = (lines: [string, number, string][]) => lines.filter(([, s]) => s > 0).map(([h, s]) => [h === 'service' ? 'svc' : h.slice(2, 3), s]);

test('vector 1: three owners, 101 sats', () => {
  const r = read(W([[0, 'w'], [1, [[o('a'), 40], [o('b'), 30], [o('c'), 30]]], [2, o('a')]]), P('a', 'b', 'c'));
  assert.deepEqual(amounts(divide(r, 101)), [['a', 41], ['b', 30], ['c', 30]]);
});
test('vector 2: text where bytes are due is no reading, and the screen says so', () => {
  const r = read(W([[0, 'w'], [1, [[[0, id('a')], 100]]], [2, [0, id('a')]]]), P('a'));
  assert.equal(r.ok, false);
  assert.match(showerLines(r)[0], /No reading/);
});
test('vectors 3, 18: fixed line, then the fee, then the parts', () => {
  const r = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 40]]], [2, o('a')], [5, [[o('c'), 2]]]]), P('a', 'b', 'c'));
  assert.deepEqual(amounts(divide(r, 100)), [['c', 2], ['a', 59], ['b', 39]]);
  assert.deepEqual(amounts(divide(r, 100, { fee: 10 })), [['c', 2], ['svc', 10], ['a', 53], ['b', 35]]);
});
test('vector 7: an unfilled spot goes to the owners by parts, never to one', () => {
  const spot = { role: { kind: 'done' } };
  const r = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 39], [[2, 2], 1]]], [2, o('a')]]), [...P('a', 'b'), spot]);
  assert.deepEqual(amounts(divide(r, 100)), [['a', 61], ['b', 39]]);
});
test('vector 9: a cut needs its owner', () => {
  const ps = P('a', 'b');
  const a = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 40]]], [2, o('a')]]), ps);
  const b = read(W([[0, 'w'], [1, [[o('a'), 70], [o('b'), 30]]], [2, o('a')]]), ps);
  assert.equal(condition(a, b, { own: new Set([k('a')]), params: { 0: 500000 } }).answer, 'not valid');
});
test('vector 19: a change of service like for like is rule 2', () => {
  const ps = P('a', 'b');
  const a = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 40]]], [2, o('a')]]), ps);
  const b = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 40]]], [2, o('a')], [10, [u('d')]]]), ps);
  const same = sameService({ control: id('3'), fee: 1, unit: 'parts' }, { control: id('3'), fee: 1, unit: 'parts', signers: [id('a'), id('b')] }, [k('a'), k('b')]);
  assert.equal(condition(a, b, { own: new Set([k('a')]), changed: new Set(['receiver']), likeForLike: same, params: { 0: 500000 } }).answer, 'valid');
  assert.equal(sameService(null, null, []), false, 'deals not held: cannot tell like from unlike');
});
test('vector 17: delivery owed, and the screen names who delivers', () => {
  const r = read(W([[0, 'w'], [1, [[o('a'), 100]]], [2, o('a')], [9, [o('a'), 144, true]]]), P('a'));
  assert.equal(refundOwed(r, { noteBlock: 200, now: 345, delivered: false, received: false }).owed, true);
  assert.equal(refundOwed(r, { noteBlock: null, now: 9999, delivered: false, received: false }).owed, false, 'no note, no refund owed');
  assert.ok(showerLines(r, () => 'A').some((l) => /A delivers within 144 blocks of payment, or refunds in full, counted from the service's delivery note/.test(l)));
});
test('vectors 20 to 22: one division at 97 sats; an unchecked step holds only its own line', () => {
  const spot = { role: { kind: 'done' } };
  const r = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 39], [[2, 2], 1]]], [2, o('a')]]), [...P('a', 'b'), spot]);
  assert.deepEqual(amounts(divide(r, 97)), [['a', 59], ['b', 38]]);
  const e = read(W([[0, 'w'], [1, [[o('a'), 60], [o('b'), 40]]], [2, o('a')], [5, [[o('c'), 2, [u('6'), null]]]]]), P('a', 'b', 'c'));
  const lines = divide(e, 100);
  assert.equal(lines[0][2].startsWith('held'), true);
  assert.deepEqual(amounts(lines.slice(1)), [['a', 59], ['b', 39]]);
  assert.deepEqual(amounts(releaseHeld(e, 2)), [['a', 2]]);
});
test('draft 12 has no key 11: such words give no reading', () => {
  assert.equal(read(W([[0, 'w'], [1, [[o('a'), 100]]], [2, o('a')], [11, [o('a')]]]), P('a')).ok, false);
});
test('older drafts and unknown cMIPs read as unchecked', () => {
  assert.equal(whichShowerWork('bf4e89e47839b26038a9e9872a7ee373711ed906051a8ff05cfab6364361e6b6').known, true);
  assert.match(whichShowerWork('121aad7a40758e1b9cb249c68dc2ec9cf5c197daf4caeb221d6bac6b37fbf1b4').said, /draft 11.*unchecked/);
  assert.match(whichShowerWork('589f817964a5c6e853a736d1a3f1bf30edae1a6b09600a6a5464cc2848aa5004').said, /draft 10.*unchecked/);
  assert.match(whichShowerWork('04c3185f636b2e40ed0e005fc711bb0e6f1e3ab9a101463605f066aa30b6a78c').said, /unchecked/);
  assert.match(whichShowerWork('ff'.repeat(32)).said, /unchecked/);
});
