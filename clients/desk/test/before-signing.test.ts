// Round two's lessons, as pure checks (src/before-signing.ts). Runs alone:
//   node --experimental-strip-types --test test/before-signing.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashFieldProblems, invoicesWarning, isHashBytes, newestOwnAct, ownNameAssenters, replacesInForce, unopenedSealedLine } from '../src/before-signing.ts';

const id = (c: string) => c.repeat(64);
const bytes = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));

test('a hash is 32 bytes; 64 hex digits of text are not (Hop, a69f00ea…)', () => {
  assert.equal(isHashBytes(bytes(id('a'))), true);
  assert.equal(isHashBytes(id('a')), false);
  assert.equal(isHashBytes(new Uint8Array(31)), false);
});

test('shower work owners: text owners are named, byte owners pass', () => {
  const OWNERS = [[1, '*', 0, 1], [2, 1]];
  const good = new Map<number, unknown>([[0, 'w'], [1, [[[0, bytes(id('a'))], 60], [[0, bytes(id('b'))], 40]]], [2, [0, bytes(id('a'))]]]);
  assert.deepEqual(hashFieldProblems(good, OWNERS), []);
  const bad = new Map<number, unknown>([[0, 'w'], [1, [[[0, id('a')], 60], [[0, bytes(id('b'))], 40]]], [2, [0, id('a')]]]);
  const p = hashFieldProblems(bad, OWNERS);
  assert.equal(p.length, 2);
  assert.match(p[0].said, /text that looks like a hash/);
  assert.equal(p[0].path, '$.1[0].0.1');
});

test('an update must replace the version in force, read now (G4.8)', () => {
  assert.equal(replacesInForce(id('1'), id('1')).ok, true);
  const r = replacesInForce(id('1'), id('2'));
  assert.equal(r.ok, false);
  assert.match(r.said, /count for nothing/);
  assert.equal(replacesInForce(id('1'), null).ok, false);
});

test('own line: the newest act, none, or a fork (Counterparty E2)', () => {
  const me = id('m');
  const acts = [
    { id: 'T1', signer: me, previous: [] },
    { id: 'A1', signer: me, previous: ['T1'] },
    { id: 'T2', signer: me, previous: ['A1'] },
    { id: 'X', signer: id('o'), previous: [] },
  ];
  assert.equal(newestOwnAct(acts, me), 'T2');
  assert.equal(newestOwnAct(acts, id('z')), null);
  assert.equal(newestOwnAct([...acts, { id: 'A2', signer: me, previous: ['A1'] }], me), 'fork');
});

test('only an assent in one\'s own name counts as one\'s own (Plain Words; Y1)', () => {
  const s = ownNameAssenters([{ signer: 'A' }, { signer: 'X', forParty: 'B' }, { signer: 'C', forParty: 'C' }]);
  assert.deepEqual([...s].sort(), ['A', 'C']);
  assert.equal(s.has('B'), false);
  assert.equal(s.has('X'), false);
});

test('invoices: warn before they run out, and when none is left (Alex)', () => {
  assert.match(invoicesWarning(0, 4) ?? '', /holds up its buyer/);
  assert.match(invoicesWarning(3, 4) ?? '', /Only 3 unused invoices/);
  assert.equal(invoicesWarning(16, 4), null);
});

test('unopened sealed acts are counted on the first screen', () => {
  assert.equal(unopenedSealedLine(0), null);
  assert.match(unopenedSealedLine(1) ?? '', /1 sealed act addressed to you/);
  assert.match(unopenedSealedLine(22) ?? '', /22 sealed acts/);
});
