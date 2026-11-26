// Shared vector J4, edition 2 (DubPay's seam act 6e9ddac0…), in DubLaw's reader. node --experimental-strip-types --test test/deal-parameters.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dealParameters } from '../src/deal-parameters.ts';
test("J4.2: DubPay's shape, all six, integer keys", () => {
  const r = dealParameters(new Map<number, unknown>([[0, [10000]], [1, 100000], [2, 10000], [3, 432], [4, 'lightning'], [5, 'postmark-place']]));
  assert.equal(r.meets, true); assert.equal(r.line, 'section 6: all six named');
});
test("J4.2: Léa's text keys (deal 795859ee…)", () => {
  const r = dealParameters({ cap: 100000, fee: 0, rail: 'lightning regtest', place: 'postmark-place', deadline: 432, capPerReceiver: 10000 });
  assert.equal(r.meets, true);
});
test('J4.2: text keys read case-insensitively, ignoring spaces, hyphens, underscores; lodgedAt for place', () => {
  assert.equal(dealParameters({ FEE: 0, Cap: 1, 'per-receiver': 2, dead_line: 3, Rail: 'x', 'Lodged At': 'p' }).meets, true);
});
test('J4.2: fee only: MISSING five', () => {
  const r = dealParameters(new Map<number, unknown>([[0, [10000]]]));
  assert.equal(r.meets, false); assert.equal(r.line, 'does not meet straight split draft 7, section 6: missing cap, cap per receiver, deadline, rail, place');
});
test('J4.2: null: MISSING six', () => { const r = dealParameters(null); assert.equal(r.meets, false); assert.equal(r.params.filter((p) => p.state === 'MISSING').length, 6); });
test('J4.2: parameters in the words: unchecked, never MISSING', () => { const r = dealParameters(null, true); assert.equal(r.meets, null); assert.match(r.line, /^unchecked/); });
test("Steward's case (DubPay's better): five in control, the place in the words: place unchecked, not MISSING", () => {
  const r = dealParameters(new Map<number, unknown>([[0, 0], [1, 1], [2, 1], [3, 432], [4, 'lightning']]), true);
  assert.equal(r.meets, null); assert.equal(r.params[5].state, 'unchecked'); assert.equal(r.line, 'unchecked: place not in control: read the words');
});
test('no words: the same five are MISSING the place', () => { assert.equal(dealParameters(new Map<number, unknown>([[0, 0], [1, 1], [2, 1], [3, 432], [4, 'lightning']])).meets, false); });
test('a value of another form is unchecked, never wrong', () => {
  const r = dealParameters(new Map<number, unknown>([[0, 'one'], [1, 1], [2, 1], [3, 1], [4, 'l'], [5, 'p']]));
  assert.equal(r.meets, null); assert.equal(r.params[0].state, 'unchecked');
});
