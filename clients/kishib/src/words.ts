// What Kišib reads from paper, and nothing else: an identity's chain key's
// 24 words (the words seed Module), and a collective's paper share (its
// number and 24 words, as real collectives deal them, H18). The words are
// turned into keys here, used for the act at hand by the caller, and
// dropped: nothing in this file keeps anything.
//
// The words seed Module (modules/module-chain-key-seed-words-draft-1.md)
// derives every chain key of an identity from one seed: key 0 is the one
// the genesis commits, key n the one the rotation at position n commits.
// The rotation at position n is signed with key n − 1 (the air-gapped
// chain key Module, section 2, "Key index"). So the same paper serves the
// first rotation, then the next, and so on: Kišib signs with key n − 1 and
// commits key n, both from the same words.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { chainKeyFromSeeds } from '../../genesis/src/core.ts';
import { fromWords, Refused } from '../../../modules/carry/src/carry.ts';
import { keySeeds } from '../../dub/src/chainwords.ts';

export { Refused };

/** A chain key derived from paper: its FIPS 205 seeds, public key and commitment. */
export interface ChainKey {
  scheme: number;
  index: number;
  seeds: Uint8Array;
  public: Uint8Array;
  commit: string;
}

/** The chain key at `index` under `scheme`, from a seed (the words seed Module, "Deriving chain keys"). */
export function chainKeyAt(seed: Uint8Array, scheme: number, index: number): ChainKey {
  const k = chainKeyFromSeeds(scheme, keySeeds(seed, scheme, BigInt(index))) as { scheme: number; seeds: Uint8Array; public: Uint8Array; commit: string };
  return { ...k, index };
}

/** A seed from the chain key's 24 words, refusing words written wrong, saying which (the words seed Module, "The backup"). */
export function seedOf(words: string): Uint8Array {
  return fromWords(words);
}

/**
 * Which key of the seed a commitment names, looking at indices up to
 * `upTo`: the index, or null where none matches (another identity's words,
 * the signing key's words, or words written wrong but with a checksum that
 * passed by chance).
 */
export function indexOf(seed: Uint8Array, scheme: number, commit: string, upTo: number): number | null {
  for (let i = 0; i <= upTo; i++) {
    const k = chainKeyAt(seed, scheme, i);
    k.seeds.fill(0);
    if (k.commit === commit) return i;
  }
  return null;
}

/** A paper share: its number and its value. */
export interface Paper {
  x: number;
  value: Uint8Array;
}

/** A paper share as typed: the number written beside the words, and the 24 words. */
export function paperOf(number: string, words: string): Paper {
  const x = Number(number.trim());
  if (!Number.isSafeInteger(x) || x < 1 || x > 255) throw new Refused('The share’s number is the whole number written beside its 24 words (1, 2, 3, …)');
  return { x, value: fromWords(words) };
}

/** Overwrite secret bytes once they are used. */
export function wipe(...xs: (Uint8Array | null | undefined)[]): void {
  for (const x of xs) x?.fill(0);
}
