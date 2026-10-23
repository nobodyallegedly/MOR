// The signer's own hint (Envelopes, the inside's field 9: "a timestamp or
// other hint, never load-bearing"; rule 6, "Hints never decide"), through
// the WebAssembly binding: `makeEveryday` writes the `hint` its caller
// gives, and `describeAct` returns it as `hint`, display only. And a
// purchase's contest payload (Agreements rule 54, "Contest (type 14)").
// Test identities only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS, cborEncode, describeAct, makeEveryday, newSigningSecret, purchaseContestPayload, sha256, unhex } from '../src/core.ts';

const text = (t: string) => cborEncode(new Map<number, unknown>([[0, t]]));

function make(hint?: string) {
  return makeEveryday({
    signingSecret: newSigningSecret(),
    signer: sha256('a test identity'),
    binding: sha256('a test binding'),
    spec: MIRS.text,
    type: 0,
    payload: text('a post'),
    sequence: [],
    public: true,
    hint,
  }) as { act: Uint8Array; id: string };
}

test("the signer's hint is written when given, and read back as display", () => {
  const d = describeAct(make('2026-10-22T21:40:00Z').act) as { hint?: string | null };
  assert.equal(d.hint, '2026-10-22T21:40:00Z');
  const none = describeAct(make().act) as { hint?: string | null };
  assert.equal(none.hint ?? null, null);
  // A hint is canonical text, as every text in an inside is.
  assert.throws(() => make('é'), /canonical/);
});

test("a purchase's contest payload: the purchase, and the promise not kept in words", () => {
  const purchase = sha256('a payer’s claim');
  const p = purchaseContestPayload(purchase, 'A slideshow, not the concert.');
  assert.deepEqual(p, cborEncode(new Map<number, unknown>([[0, unhex(purchase)], [1, 'A slideshow, not the concert.']])));
  assert.deepEqual(purchaseContestPayload(purchase), cborEncode(new Map<number, unknown>([[0, unhex(purchase)]])));
});
