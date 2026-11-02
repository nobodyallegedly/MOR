// Fable's bound (Money rule 8; S7j, F413, decided by Nobody, allegedly): a
// vow whose sales rest on two or more receipts or claims with no rail answer
// is unknown as a whole (the core throws `law/rail-unanswered`), shown as
// waiting for the rail, never as a vow that could not be read.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VOW_WAITING, vowProblem } from '../src/vows.ts';

test('a vow unknown as a whole is said to wait for the rail; any other refusal keeps the core\'s words', () => {
  const name = 'ab'.repeat(32);
  const waiting = vowProblem(name, new Error('law/rail-unanswered: unknown: it rests on a receipt or claim whose verification answer is pending or not held'));
  assert.equal(waiting, `The vow abababab…: ${VOW_WAITING}`);
  assert.match(waiting, /unknown, waiting for the rail: two or more of its sales/);
  assert.match(vowProblem(name, new Error('law/not-held: x')), /could not be read: law\/not-held: x/);
});
