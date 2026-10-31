// The signing key as a string (module-signing-key-string-draft-1.md): the
// same seed as the 24 words, a typo caught by its checksum; the chain key
// never so.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Refused, fromWords, toWords } from '../src/carry.ts';
import { KEY_PREFIX, bech32mChecks, bothForms, fromCarried, fromKeyString, groupKeyString, toKeyString } from '../src/string.ts';

const seed = Uint8Array.from(createHash('sha256').update('a test signing seed').digest());

test('Bech32m as BIP-350 defines it: its valid test vectors check, a changed one does not', () => {
  for (const v of ['A1LQFN3A', 'a1lqfn3a', 'abcdef1l7aum6echk45nj3s0wdvt2fg8x9yrzpqzd3ryx', '?1v759aa']) assert.ok(bech32mChecks(v), v);
  for (const v of ['a1lqfn3q', 'abcdef1l7aum6echk45nj3s0wdvt2fg8x9yrzpqzd3ryy']) assert.ok(!bech32mChecks(v), v);
});

test('a seed and its string: “morsk1” and 58 characters, back to the same 32 bytes; the same key as its 24 words', () => {
  const s = toKeyString(seed);
  assert.ok(s.startsWith(`${KEY_PREFIX}1`));
  assert.equal(s.length, KEY_PREFIX.length + 1 + 58);
  assert.deepEqual(fromKeyString(s), seed);
  const both = bothForms(seed);
  assert.deepEqual(fromWords(both.words), fromKeyString(both.key), 'the words and the string are one key');
  // Spaces, dashes and one case do not matter; the grouped form reads back.
  assert.deepEqual(fromKeyString(groupKeyString(s)), seed);
  assert.deepEqual(fromKeyString(s.toUpperCase()), seed);
  assert.deepEqual(fromKeyString(s.match(/.{1,5}/g)!.join('-')), seed);
});

test('a typo is caught, saying which: a changed character, two swapped, one missing or extra, a wrong prefix, mixed case', () => {
  const s = toKeyString(seed);
  const at = 20;
  const other = s[at] === 'q' ? 'p' : 'q';
  assert.throws(() => fromKeyString(s.slice(0, at) + other + s.slice(at + 1)), /checksum does not match/);
  const swapped = s.slice(0, at) + s[at + 1] + s[at] + s.slice(at + 2);
  if (swapped !== s) assert.throws(() => fromKeyString(swapped), /checksum does not match/);
  assert.throws(() => fromKeyString(s.slice(0, -1)), /57 characters .* not 58/);
  assert.throws(() => fromKeyString(`${s}q`), /59 characters .* not 58/);
  assert.throws(() => fromKeyString(s.replace(/^morsk1/, 'morck1')), /starts with “morsk1”/);
  assert.throws(() => fromKeyString(s.slice(0, at) + 'b' + s.slice(at + 1)), /“b”, is not one a signing key’s string uses/);
  assert.throws(() => fromKeyString(s.slice(0, 10) + s.slice(10).toUpperCase()), /mixes capital and small letters/);
  for (const bad of ['', 'morsk1']) assert.throws(() => fromKeyString(bad), Refused);
});

test('brought in as the person chose: 24 words or the string, the same seed; anything else refused, saying why', () => {
  assert.deepEqual(fromCarried(toWords(seed).join(' ')), seed);
  assert.deepEqual(fromCarried(toWords(seed)), seed);
  assert.deepEqual(fromCarried(groupKeyString(toKeyString(seed))), seed);
  assert.throws(() => fromCarried(toWords(seed).slice(1).join(' ')), /23 words, not 24/);
  assert.throws(() => fromCarried('xyzxyzxyzxyzxyzxyzxyzxyz'), /neither 24 words nor a signing key’s string/);
});
