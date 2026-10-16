// The identity carry Module (modules/module-identity-carry-words-draft-1.md):
// an identity's ID and its current signing seed, written by a person so that
// another app can sign as the identity. The signing seed is the 32-byte
// secret of the identity's Schnorr signing key (scheme 1); it is written as
// 24 words in the words seed Module's encoding: BIP-39's English list and
// its checksum, never its wallet derivation.
//
// The chain key never travels. Whoever holds the words can sign as the
// identity until its signing key is rotated.
//
// Draft 2 (modules/module-identity-carry-words-draft-2.md): the words carry
// the identity's encryption key too, derived from the signing seed
// (`encryptionSecret`): whoever holds them can also open its private
// messages, a cost the draft states.

import { createHash } from 'node:crypto';
import { ENGLISH } from './english.ts';

/** Why written words or an ID are refused. */
export class Refused extends Error {}

const INDEX = new Map(ENGLISH.map((w, i) => [w, i]));

/** The 24 words of a 32-byte signing seed, the last carrying an 8-bit checksum. */
export function toWords(seed: Uint8Array): string[] {
  if (seed.length !== 32) throw new Refused('a signing seed is 32 bytes');
  const check = createHash('sha256').update(seed).digest()[0];
  let bits = 0n;
  for (const b of seed) bits = (bits << 8n) | BigInt(b);
  bits = (bits << 8n) | BigInt(check);
  const out: string[] = [];
  for (let i = 23; i >= 0; i--) out.push(ENGLISH[Number((bits >> BigInt(i * 11)) & 2047n)]);
  return out;
}

/** The words as a person reads them back: lower case, any spacing. */
export function splitWords(written: string): string[] {
  return written.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Read 24 written words back to the signing seed. Case and spacing do not
 * matter; a word not on the list, a wrong count or a wrong checksum is
 * refused, saying which.
 */
export function fromWords(written: string | string[]): Uint8Array {
  const words = typeof written === 'string' ? splitWords(written) : written.map((w) => w.trim().toLowerCase());
  if (words.length !== 24) throw new Refused(`${words.length} words, not 24`);
  let bits = 0n;
  words.forEach((w, i) => {
    const n = INDEX.get(w);
    if (n === undefined) throw new Refused(`word ${i + 1}, “${w}”, is not on the list: check how it is written`);
    bits = (bits << 11n) | BigInt(n);
  });
  const seed = new Uint8Array(32);
  for (let i = 0; i < 32; i++) seed[i] = Number((bits >> BigInt(8 + (31 - i) * 8)) & 255n);
  const check = Number(bits & 255n);
  if (createHash('sha256').update(seed).digest()[0] !== check) {
    throw new Refused('the checksum does not match: a word was written or read wrong');
  }
  return seed;
}

/** The tag of the encryption key's derivation (draft 2, section 2a). */
export const ENCRYPTION_TAG = 'MOR/module/carry/encryption';

/**
 * The X-Wing secret (32 bytes) an identity's encryption key is made from,
 * derived from its signing seed (draft 2, section 2a):
 * tagged_hash("MOR/module/carry/encryption", signing seed), the Identity
 * MIR's tagged hash, SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ data).
 */
export function encryptionSecret(signingSeed: Uint8Array): Uint8Array {
  if (signingSeed.length !== 32) throw new Refused('a signing seed is 32 bytes');
  const t = createHash('sha256').update(ENCRYPTION_TAG).digest();
  return new Uint8Array(createHash('sha256').update(t).update(t).update(signingSeed).digest());
}

/** An identity's ID as typed: 64 hexadecimal characters, spaces and case ignored. */
export function readId(typed: string): string {
  const s = typed.replace(/\s+/g, '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(s)) throw new Refused('an ID is 64 characters, 0 to 9 and a to f (spaces do not matter)');
  return s;
}

/** An ID in groups of four, to read and write by hand. */
export const groupId = (id: string): string => id.match(/.{1,4}/g)!.join(' ');

/**
 * Three positions (1 to 24) to type back, different and in order, drawn at
 * random, so that a person shows they wrote the words down.
 */
export function threePositions(random: (n: number) => number): number[] {
  const out = new Set<number>();
  while (out.size < 3) out.add(1 + random(24));
  return [...out].sort((a, b) => a - b);
}

/** Whether the words typed back at those positions are the ones written. */
export function typedBack(words: string[], positions: number[], typed: string[]): boolean {
  return positions.length === 3 && typed.length === 3 && positions.every((p, i) => words[p - 1] === (typed[i] ?? '').trim().toLowerCase());
}
