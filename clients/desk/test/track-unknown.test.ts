// Vows › Track (S7e): a vow's sale whose payment is not verified here reads
// unknown, with the reason Dub's look-up gives (`vowSales`, the rail's own
// words), never pending or confirmed. Its rendering only: an unknown vow sale
// cannot yet be made end to end in the suite, a collective's vow reading void
// (docs/splits-report.md, "After S7e").

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saleUnknown } from '../src/page/view.ts';

test('Track: an unknown vow sale is labelled unknown, with its reason', () => {
  const why = 'its payment is not verified here: its rail says unknown (the payee pointer it was paid to is not held); whether it is a sale is unknown';
  assert.deepEqual(saleUnknown({ state: 'unknown', why }), [{ text: `unknown: ${why}`, tone: 'warn' }]);
  assert.match(saleUnknown({ state: 'unknown' })[0].text, /^unknown: a receipt or claim it rests on has no rail answer here$/);
  assert.deepEqual(saleUnknown({ state: 'pending', why: null }), []);
});
