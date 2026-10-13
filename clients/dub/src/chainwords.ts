// The chain key of an identity made by Dub's web client, as the words seed
// Module writes it (modules/module-chain-key-seed-words-draft-1.md): a
// 256-bit seed, written as 24 words (BIP-39's English list and checksum,
// never its wallet derivation), from which the chain key is derived exactly
// as the air-gapped chain key Module derives it (modules/airgap/src/seed.rs).
// So the paper the web client shows once restores, in that Module, the very
// key the genesis committed, and the web client keeps nothing of it.
//
// TEST IDENTITIES ONLY (F281: "with risks stated, for testing purpose only").

import { chainKeyFromSeeds, sha256, unhex } from '../../genesis/src/core.ts';
import { toWords } from '../../../modules/carry/src/carry.ts';

/** The words seed Module's tag for deriving chain keys. */
export const WORDS_KEY_TAG = 'MOR/module/seed-words/key';
/** The chain key a web-made identity commits at genesis: SLH-DSA scheme 3, as Dub's identities, key index 0. */
export const SCHEME = 3;
export const INDEX = 0n;

const cat = (...xs: Uint8Array[]) => {
  const out = new Uint8Array(xs.reduce((n, x) => n + x.length, 0));
  let at = 0;
  for (const x of xs) {
    out.set(x, at);
    at += x.length;
  }
  return out;
};

/** Identity's tagged hash: SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ data). */
function taggedHash(tag: string, data: Uint8Array): Uint8Array {
  const t = unhex(sha256(tag));
  return unhex(sha256(cat(t, t, data)));
}

/**
 * FIPS 205's three key-generation seeds (sk_seed, sk_prf, pk_seed, 48 bytes)
 * of the chain key at `index` under `scheme`: the first 48 bytes of
 * tagged_hash(tag, seed ‖ scheme ‖ index ‖ 0) ‖ tagged_hash(tag, seed ‖ scheme ‖ index ‖ 1).
 */
export function keySeeds(seed: Uint8Array, scheme: number, index: bigint): Uint8Array {
  if (seed.length !== 32) throw new Error('a chain-key seed is 32 bytes');
  const i = new Uint8Array(8);
  new DataView(i.buffer).setBigUint64(0, index);
  const a = taggedHash(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(0)));
  const b = taggedHash(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(1)));
  return cat(a, b.subarray(0, 16));
}

export interface ChainKeyShown {
  /** The seed's 24 words: the only copy, shown once. */
  words: string[];
  /** The chain key the genesis commits (its FIPS 205 seeds, public key and commitment). */
  key: { scheme: number; seeds: Uint8Array; public: Uint8Array; commit: string };
}

/** A fresh chain-key seed, its words and the chain key it gives. The caller drops the seed once the words are shown. */
export function newChainKey(seed: Uint8Array): ChainKeyShown {
  const key = chainKeyFromSeeds(SCHEME, keySeeds(seed, SCHEME, INDEX)) as ChainKeyShown['key'];
  return { words: toWords(seed), key };
}
