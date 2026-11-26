// cMIP an arbiter's award, draft 1, section 8 vectors. node --experimental-strip-types --test arbiter.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAward, execute, type Claim, type Answer, type Award, type Ctx } from './arbiter.ts';
const L = 'landlord', T = 'tenant', X = 'arbiterX', TERMS = 'let-v1';
const ctx = (over: Partial<Ctx> = {}): Ctx => ({ termsInForceAtSettlement: TERMS, clauseOf: (t) => (t === TERMS ? { arbiter: X } : null), parties: [L, T], lodgedBefore: (id) => id.startsWith('photo'), ...over });
const claim: Claim = { id: 'c1', signer: L, pos: 10, block: 1000, terms: TERMS, disputed: 'deposit', evidence: ['photo-in', 'photo-out'] };
const answer: Answer = { id: 'a1', signer: T, pos: 20, block: 1100, claim: 'c1', evidence: ['photo-in'] };
const aw = (o: unknown, extra: Partial<Award> = {}): Award => ({ id: 'w', signer: X, pos: 30, block: 1300, claim: 'c1', outcome: o, read: ['photo-in', 'photo-out', 'c1', 'a1'], ...extra });
test('1. a deposit partly kept: [2, 250000] on 10,000 sats → 2,500 released, 7,500 back', () => {
  const v = readAward(claim, answer, [aw([2, 250000])], ctx()); assert.equal(v.word, 'valid'); assert.deepEqual(execute(v, 10000), { release: 2500, refund: 7500 });
});
test('2. silence: the tenant does not answer; the award stands on the claim alone', () => {
  const v = readAward(claim, null, [aw([0], { read: ['photo-in', 'photo-out', 'c1'] })], ctx()); assert.equal(v.word, 'valid'); assert.deepEqual(execute(v, 10000), { release: 10000, refund: 0 });
});
test('3. no award in time: default 0 returns the deposit to the tenant', () => {
  const v = readAward(claim, answer, [], ctx()); assert.equal(v.apply, 'default'); assert.deepEqual(execute(v, 10000), { release: 0, refund: 10000 });
});
test('4. two awards for one claim: neither counts, the default applies', () => {
  const v = readAward(claim, answer, [aw([0]), aw([1], { id: 'w2', pos: 31 })], ctx()); assert.equal(v.word, 'not an award'); assert.match(v.why, /fork/); assert.deepEqual(execute(v, 10000), { release: 0, refund: 10000 });
});
test('5. an arbiter named late: the Terms in force at the payment rely on no clause', () => {
  const v = readAward({ ...claim, terms: 'let-v2' }, answer, [aw([0])], ctx()); assert.equal(v.word, 'not an award'); assert.match(v.why, /not in force/);
});
test('6. evidence never lodged: not an award', () => {
  const v = readAward(claim, answer, [aw([0], { read: ['secret-word'] })], ctx({ lodgedBefore: () => false })); assert.equal(v.word, 'not an award'); assert.match(v.why, /never lodged/);
});
test('an award after award_window: the default applies', () => {
  const v = readAward(claim, answer, [aw([0], { block: 1000 + 144 + 288 + 1 })], ctx()); assert.equal(v.apply, 'default');
});
test('a share above 1,000,000 is not one of the three forms', () => { assert.equal(readAward(claim, answer, [aw([2, 1_000_001])], ctx()).word, 'not an award'); });
test('without the place\'s positions: unchecked, never yes or no', () => { assert.equal(readAward({ ...claim, pos: undefined }, answer, [aw([0])], ctx()).word, 'unchecked'); });
import { onTime } from './arbiter.ts';
test('7 (draft 2). two references disagree: the first governs, and the line shows both', () => {
  const r = onTime([true, false], ['Postmark', 'Longhouse']); assert.equal(r.word, 'on time'); assert.equal(r.line, 'on time by Postmark, late by Longhouse');
});
test('8 (draft 2). no anchor yet: unchecked, never late', () => { assert.equal(onTime([null, true], ['Postmark', 'Longhouse']).word, 'unchecked'); });
test('two references agree', () => { assert.equal(onTime([false, false], ['Postmark', 'Longhouse']).line, 'late by Postmark and Longhouse'); });
