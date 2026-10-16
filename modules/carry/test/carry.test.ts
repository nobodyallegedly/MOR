// The identity carry Module's words: against the Rust code's vectors
// (modules/airgap/vectors/carry.json, made with the bip39 crate), BIP-39's
// own published words, and the refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ENGLISH } from '../src/english.ts';
import { Refused, encryptionSecret, fromWords, readId, threePositions, toWords, typedBack } from '../src/carry.ts';
import { hex, sha256, signingPublic, unhex, xwingPublic } from '../../../clients/genesis/src/core.ts';

const vectors = JSON.parse(readFileSync(new URL('../../airgap/vectors/carry.json', import.meta.url), 'utf8')) as {
  vectors: { signing_seed: string; words: string; public_key?: string; refused?: string; encryption_secret?: string; encryption_public_sha256?: string }[];
};

test('the word list is BIP-39 English', () => {
  assert.equal(ENGLISH.length, 2048);
  assert.equal(createHash('sha256').update(ENGLISH.join('\n') + '\n').digest('hex'), '2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda');
});

test('the Rust vectors: same words, same seed back, same public signing key', () => {
  for (const v of vectors.vectors) {
    const seed = unhex(v.signing_seed);
    assert.equal(toWords(seed).join(' '), v.words);
    assert.equal(hex(fromWords(v.words)), v.signing_seed);
    if (v.public_key) assert.equal(hex(signingPublic(fromWords(v.words))), v.public_key);
    else assert.throws(() => signingPublic(seed), 'all ones is not a key, as the Rust code refuses');
  }
  // BIP-39's own published vector for 32 zero bytes.
  assert.equal(toWords(new Uint8Array(32)).join(' '), `${'abandon '.repeat(23)}art`);
});

test('round trip, whatever the case and spacing', () => {
  for (let i = 0; i < 200; i++) {
    const s = randomBytes(32);
    const w = toWords(s);
    assert.deepEqual(fromWords(`  ${w.join('\n ').toUpperCase()} `), Uint8Array.from(s));
  }
});

test('a wrong word, a word off the list, a wrong count: refused', () => {
  let caught = 0;
  for (let i = 0; i < 200; i++) {
    const w = toWords(randomBytes(32));
    const at = randomInt(24);
    const other = ENGLISH[(ENGLISH.indexOf(w[at]) + 1 + randomInt(2047)) % 2048];
    const changed = w.slice();
    changed[at] = other;
    try {
      fromWords(changed);
    } catch (e) {
      assert.ok(e instanceof Refused);
      assert.match((e as Error).message, /checksum/);
      caught++;
    }
  }
  // An 8-bit checksum misses one changed word in 256: almost all are caught.
  assert.ok(caught >= 190, `${caught} of 200 caught`);
  const w = toWords(randomBytes(32));
  assert.throws(() => fromWords([...w.slice(0, 23), 'zebraa']), /word 24, “zebraa”, is not on the list/);
  assert.throws(() => fromWords(w.slice(0, 12)), /12 words, not 24/);
  // A checksum word replaced by its neighbour that the checksum catches for sure:
  const s = randomBytes(32);
  const ws = toWords(s);
  const last = ENGLISH.indexOf(ws[23]);
  ws[23] = ENGLISH[last ^ 1]; // changes the checksum's last bit only
  assert.throws(() => fromWords(ws), /checksum/);
});

test('three words typed back', () => {
  const w = toWords(randomBytes(32));
  const p = threePositions(randomInt);
  assert.equal(new Set(p).size, 3);
  assert.ok(p.every((x) => x >= 1 && x <= 24));
  assert.ok(typedBack(w, p, p.map((x) => ` ${w[x - 1].toUpperCase()} `)));
  assert.ok(!typedBack(w, p, [w[p[0] - 1], w[p[1] - 1], 'wrong']));
  assert.ok(!typedBack(w, p, [w[p[0] - 1], w[p[1] - 1]]));
});

test('an ID as typed', () => {
  const id = hex(randomBytes(32));
  assert.equal(readId(id.toUpperCase().match(/.{4}/g)!.join(' ')), id);
  assert.throws(() => readId(id.slice(1)), Refused);
  assert.throws(() => readId(`${id.slice(1)}g`), Refused);
});

test('draft 2: the encryption key the words carry, as the Rust vectors give it', () => {
  let n = 0;
  for (const v of vectors.vectors) {
    if (!v.encryption_secret) continue;
    const e = encryptionSecret(fromWords(v.words));
    assert.equal(hex(e), v.encryption_secret);
    assert.equal(sha256(xwingPublic(e)), v.encryption_public_sha256);
    n++;
  }
  assert.equal(n, 2);
  assert.throws(() => encryptionSecret(new Uint8Array(31)), Refused);
});
