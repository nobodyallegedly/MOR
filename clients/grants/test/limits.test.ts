// The grant limits cMIP, draft 1 (F345): the format read back, its
// refusals, and each limit judged act by act. The grants themselves, on
// real relays, are tested in Edubba (`clients/desk/test/agents-grant.test.ts`).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS, cborEncode, sha256, unhex } from '../../genesis/src/core.ts';
import { CLOCKS, encodeLimits, judge, limitsValue, readLimits, refuseBeforeSigning } from '../src/limits.ts';
import { personGrantPayload, readGrant } from '../src/grant.ts';

const UNIT = sha256('a unit');
const CLOCK = sha256('a clock identity');
const owe = (value: number, unit = UNIT) => ({
  id: sha256(`owe ${value} ${unit}`),
  spec: MIRS.money,
  type: 1,
  payload: cborEncode(new Map<number, unknown>([[0, unhex(sha256('d'))], [1, unhex(sha256('c'))], [2, [unhex(unit), value]], [3, unhex(sha256('p'))]])) as Uint8Array,
});

test('the limits read back as written; a key the cMIP does not define, or no limit, refused', () => {
  const l = { cap: { unit: UNIT, value: 5000 }, expiry: { clock: 'timestamp' as const, identity: CLOCK, time: 1_800_000_000 } };
  assert.deepEqual(readLimits(limitsValue(l)), l);
  assert.throws(() => encodeLimits({}), /a cap, an expiry, or both/);
  assert.throws(() => readLimits(new Map([[2, 1]])), /a key this cMIP does not define/);
  assert.throws(() => readLimits(new Map([[0, [unhex(UNIT)]]])), /not \[unit, value\]/);
  assert.equal(CLOCKS.timestamp.length, 64);
});

test('the cap per act: within, above it, in another unit; an act moving nothing is within it', () => {
  const l = { cap: { unit: UNIT, value: 5000 } };
  assert.deepEqual(judge(l, owe(5000), MIRS.money), { within: true });
  assert.match((judge(l, owe(5001), MIRS.money) as { why: string }).why, /above the cap of 5000/);
  assert.match((judge(l, owe(1, sha256('another unit')), MIRS.money) as { why: string }).why, /another unit/);
  assert.deepEqual(judge(l, { id: sha256('a post'), spec: MIRS.text, type: 0 }, MIRS.money), { within: true });
  assert.match(refuseBeforeSigning(l, owe(9000), MIRS.money, 0)!, /9000 is above the grant’s cap of 5000 per act/);
  assert.equal(refuseBeforeSigning(l, owe(10), MIRS.money, 0), null);
});

test('the expiry on a timestamp clock: within, past it, unknown without the named clock’s stamp', () => {
  const l = { expiry: { clock: 'timestamp' as const, identity: CLOCK, time: 1000 } };
  const a = owe(1);
  const at = (t: number) => ({ stamps: new Map([[CLOCK, new Map([[a.id, t]])]]) });
  assert.deepEqual(judge(l, a, MIRS.money, at(1000)), { within: true });
  assert.equal(judge(l, a, MIRS.money, at(1001)).within, false);
  assert.equal(judge(l, a, MIRS.money, { stamps: new Map([[sha256('another clock'), new Map([[a.id, 10]])]]) }).within, null);
  assert.match(refuseBeforeSigning(l, a, MIRS.money, 2000)!, /expired/);
});

test('a person’s grant: scope 2, its kinds, its limits under this cMIP, its key; read back', () => {
  const p = personGrantPayload({ grantee: CLOCK, kinds: [{ spec: MIRS.text, type: 0 }, { layer: 3 }], limits: { cap: { unit: UNIT, value: 7 } }, key: [1, new Uint8Array(32)] });
  const g = readGrant(p);
  assert.equal(g.scope, 2);
  // The Money layer is 3 since F407 split Text and Envelopes into two layers (was 2).
  assert.deepEqual(g.kinds, [{ spec: MIRS.text, type: 0 }, { layer: 3 }]);
  assert.deepEqual(g.limits, { cap: { unit: UNIT, value: 7 } });
  assert.equal(g.limitsProblem, null);
});
