// The kit refuses a Terms field the builder does not know, before anything is built (round two, day two).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Kit } from '../kit/lib/kit.mjs';

test('a misspelt or unknown field is refused by name, with the builder\'s spelling where there is one', () => {
  assert.throws(() => Kit.agreementsFieldNames({ parties: [{ signer: 'aa' }], in_force: { cmip: 'bb' } }), /"in_force".*"inForce"/);
  assert.throws(() => Kit.agreementsFieldNames({ parties: [{ signer: 'aa' }], relies_on: [] }), /"relies_on".*"reliesOn"/);
  assert.throws(() => Kit.agreementsFieldNames({ parties: [{ role: { kind: 'done', spot: { cmip: 'cc', bogus: 1 } } }] }), /"parties\[0\]\.role\.spot\.bogus"/);
  assert.doesNotThrow(() => Kit.agreementsFieldNames({ parties: [{ signer: 'aa' }], authors: [0], inForce: { cmip: 'bb', params: '00' }, reliesOn: [] }));
});
