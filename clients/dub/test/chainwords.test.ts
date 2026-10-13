// The web client's chain-key words are the words seed Module's, and the
// chain key it commits is the one the air-gapped chain key Module derives
// from them: checked on the Module's published vectors
// (modules/airgap/vectors/seeds.json, made by the Rust implementation).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chainKeyFromSeeds, hex, unhex } from '../../genesis/src/core.ts';
import { fromWords, toWords } from '../../../modules/carry/src/carry.ts';
import { INDEX, SCHEME, keySeeds, newChainKey } from '../src/chainwords.ts';

interface Vector {
  module: string;
  seed: string;
  backup: string;
  keys: { scheme: number; index: number; sk_seed: string; sk_prf: string; pk_seed: string; public_key: string; commitment: string }[];
}
const vectors = (JSON.parse(readFileSync(new URL('../../../modules/airgap/vectors/seeds.json', import.meta.url), 'utf8')) as { vectors: Vector[] }).vectors;

test('the words and the keys are the words seed Module’s, on its published vectors', () => {
  const words = vectors.filter((v) => v.module === 'words');
  assert.ok(words.length >= 3);
  for (const v of words) {
    assert.equal(toWords(unhex(v.seed)).join(' '), v.backup, 'the backup');
    assert.equal(hex(fromWords(v.backup)), v.seed, 'read back');
    for (const k of v.keys) {
      const seeds = keySeeds(unhex(v.seed), k.scheme, BigInt(k.index));
      assert.equal(hex(seeds), k.sk_seed + k.sk_prf + k.pk_seed, `seeds, scheme ${k.scheme}, index ${k.index}`);
      const key = chainKeyFromSeeds(k.scheme, seeds) as { public: Uint8Array; commit: string };
      assert.equal(hex(key.public), k.public_key);
      assert.equal(key.commit, k.commitment);
    }
  }
});

test('a new chain key: its words give back the seed, and the seed the key the genesis commits (scheme 3, index 0)', () => {
  const v = vectors.find((x) => x.module === 'words' && x.keys.some((k) => k.scheme === 3 && k.index === 0))!;
  const shown = newChainKey(unhex(v.seed));
  assert.equal(SCHEME, 3);
  assert.equal(INDEX, 0n);
  assert.equal(shown.words.join(' '), v.backup);
  assert.equal(shown.key.commit, v.keys.find((k) => k.scheme === 3 && k.index === 0)!.commitment);
  // The hex seed Module's vectors give other keys from the same bits: the words Module's tag is in the hash.
  const hexModule = vectors.find((x) => x.module === 'hex' && x.seed === v.seed);
  if (hexModule) assert.notEqual(newChainKey(unhex(hexModule.seed)).key.commit, hexModule.keys.find((k) => k.scheme === 3 && k.index === 0)!.commitment);
});
