// X-Wing through the core library's WebAssembly (fips203 + x25519-dalek)
// against noble (@noble/post-quantum's ml_kem768_x25519, which is X-Wing on
// noble's own ML-KEM and X25519): the draft's test vectors, and many fresh
// exchanges, byte for byte.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { ml_kem768_x25519 as noble } from '@noble/post-quantum/hybrid.js';
import { hex, unhex, xwingDecapsulate, xwingEncapsulate, xwingPublic } from '../src/core.ts';

const vectors = JSON.parse(
  readFileSync(new URL('../../../core/tests/data/xwing-draft-11.json', import.meta.url), 'utf8'),
) as Record<string, string>[];

test('the draft test vectors, in both implementations', () => {
  for (const t of vectors) {
    const sk = unhex(t.sk);
    assert.equal(hex(xwingPublic(sk)), t.pk);
    assert.equal(hex(noble.keygen(sk).publicKey), t.pk);
    const a = xwingEncapsulate(unhex(t.pk), unhex(t.eseed));
    const b = noble.encapsulate(unhex(t.pk), unhex(t.eseed));
    assert.equal(hex(a.ct), t.ct);
    assert.equal(hex(b.cipherText), t.ct);
    assert.equal(hex(a.ss), t.ss);
    assert.equal(hex(b.sharedSecret), t.ss);
    assert.equal(hex(xwingDecapsulate(sk, unhex(t.ct))), t.ss);
    assert.equal(hex(noble.decapsulate(unhex(t.ct), sk)), t.ss);
  }
});

test('fresh keys and exchanges agree, and only the right key recovers the secret', () => {
  for (let i = 0; i < 25; i++) {
    const sk = new Uint8Array(randomBytes(32));
    const eseed = new Uint8Array(randomBytes(64));
    const pk = xwingPublic(sk);
    assert.deepEqual(pk, noble.keygen(sk).publicKey);
    const a = xwingEncapsulate(pk, eseed);
    const b = noble.encapsulate(pk, eseed);
    assert.deepEqual(a.ct, b.cipherText);
    assert.deepEqual(a.ss, b.sharedSecret);
    assert.deepEqual(xwingDecapsulate(sk, a.ct), a.ss);
    const other = new Uint8Array(randomBytes(32));
    const wrongA = xwingDecapsulate(other, a.ct);
    const wrongB = noble.decapsulate(a.ct, other);
    assert.deepEqual(wrongA, wrongB);
    assert.notDeepEqual(wrongA, a.ss);
  }
});
