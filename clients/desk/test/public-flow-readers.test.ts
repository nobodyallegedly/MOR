// Shared vector J2 (DubWeb, ledger S15), run in DubLaw's reader. node --experimental-strip-types --test test/public-flow-readers.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PUBLIC_FLOW_8, publicFlowReaders, readersLine } from '../src/public-flow-readers.ts';

test('J2: {0: "anyone"} reads as anyone', () => assert.deepEqual(publicFlowReaders(PUBLIC_FLOW_8, new Map([[0, 'anyone']])), { readers: 'anyone' }));
test('J2: null and an empty map read as parties', () => {
  assert.deepEqual(publicFlowReaders(PUBLIC_FLOW_8, null), { readers: 'parties' });
  assert.deepEqual(publicFlowReaders(PUBLIC_FLOW_8, new Map()), { readers: 'parties' });
});
test('J2: {0: 1} reads as parties, unchecked', () => assert.deepEqual(publicFlowReaders(PUBLIC_FLOW_8, new Map([[0, 1]])), { readers: 'parties', unchecked: 'public flow parameter not read' }));
test('{0: "parties"} reads as parties; text "anyone" (not a map) is unchecked', () => {
  assert.deepEqual(publicFlowReaders(PUBLIC_FLOW_8, new Map([[0, 'parties']])), { readers: 'parties' });
  assert.equal(publicFlowReaders(PUBLIC_FLOW_8, 'anyone')?.unchecked, 'public flow parameter not read');
});
test('another cMIP is not read here, and the line says so', () => {
  assert.equal(publicFlowReaders('479417d9ec8d53cc949ab76db460733da0c41f6414de9fb4acd45e79fcb44384', null), null);
  assert.match(readersLine(null), /read its own text/);
});
