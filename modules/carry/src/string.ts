// The signing key as a string (modules/module-signing-key-string-draft-1.md;
// round 9 of the Dubsar Suite, F411; H104, decided 25 October 2026: "Chain
// key, only words in dubsar apps. Signing key, users choses"). The same 32
// bytes as the carry Module's 24 words (draft 2), written as one string with
// a checksum, so a typo is caught: Bech32m (BIP-350), its human-readable
// part `morsk` ("MOR signing key"), its 52 data characters the seed's 256
// bits, then 6 checksum characters. A string and the words of one seed are
// the same key: either brings the identity, and an app shows the other on
// request.
//
// The chain key is never written this way: its words only, in the Dubsar
// apps (`fromCarried` takes a signing key alone).

import { Refused, fromWords, splitWords, toWords } from './carry.ts';

/** The string's human-readable part: "MOR signing key". */
export const KEY_PREFIX = 'morsk';

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32M = 0x2bc830a3;

function polymod(values: number[]): number {
  const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >>> i) & 1) chk ^= G[i];
  }
  return chk >>> 0;
}

const expand = (hrp: string): number[] => [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];

function checksum(hrp: string, data: number[]): number[] {
  const mod = polymod([...expand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ BECH32M;
  return [0, 1, 2, 3, 4, 5].map((i) => (mod >>> (5 * (5 - i))) & 31);
}

/** Regroup bits: 8 to 5 (padding the last group with zeros), or 5 to 8 (refusing padding that is not zero). */
function regroup(data: number[], from: number, to: number, pad: boolean): number[] | null {
  let acc = 0;
  let bits = 0;
  const out: number[] = [];
  const max = (1 << to) - 1;
  for (const v of data) {
    acc = (acc << from) | v;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((acc >> bits) & max);
    }
  }
  if (pad) {
    if (bits) out.push((acc << (to - bits)) & max);
  } else if (bits >= from || ((acc << (to - bits)) & max)) return null;
  return out;
}

/** A 32-byte signing seed as its string: `morsk1` and 58 characters, the last 6 a checksum. */
export function toKeyString(seed: Uint8Array): string {
  if (seed.length !== 32) throw new Refused('a signing seed is 32 bytes');
  const data = regroup([...seed], 8, 5, true)!;
  return `${KEY_PREFIX}1${[...data, ...checksum(KEY_PREFIX, data)].map((d) => CHARSET[d]).join('')}`;
}

/** The string as a person shows it: in groups of four after its prefix, easier to copy by hand. Spaces are ignored when it is typed back. */
export const groupKeyString = (s: string): string => `${s.slice(0, KEY_PREFIX.length + 1)} ${s.slice(KEY_PREFIX.length + 1).match(/.{1,4}/g)!.join(' ')}`;

/** Whether what was typed looks like a signing key's string rather than words: it starts with the prefix, once spaces are taken out. */
export const looksLikeKeyString = (typed: string): boolean => typed.replace(/[\s-]/g, '').toLowerCase().startsWith(`${KEY_PREFIX}1`);

/**
 * Read a signing key's string back to its 32-byte seed. Spaces and dashes
 * do not matter; letter case does not, unless it is mixed. A wrong prefix, a
 * character outside the alphabet, a wrong length or a wrong checksum is
 * refused, saying which.
 */
export function fromKeyString(typed: string): Uint8Array {
  const s = typed.replace(/[\s-]/g, '');
  if (s !== s.toLowerCase() && s !== s.toUpperCase()) throw new Refused('the string mixes capital and small letters: type it all in one case');
  const t = s.toLowerCase();
  if (!t.startsWith(`${KEY_PREFIX}1`)) throw new Refused(`a signing key’s string starts with “${KEY_PREFIX}1”`);
  const body = t.slice(KEY_PREFIX.length + 1);
  for (let i = 0; i < body.length; i++) {
    if (!CHARSET.includes(body[i])) throw new Refused(`character ${KEY_PREFIX.length + 2 + i}, “${body[i]}”, is not one a signing key’s string uses (no b, i, o or 1 after the prefix): check how it is written`);
  }
  if (body.length !== 58) throw new Refused(`${body.length} characters after “${KEY_PREFIX}1”, not 58: a character is missing or one too many`);
  const data = [...body].map((c) => CHARSET.indexOf(c));
  if (polymod([...expand(KEY_PREFIX), ...data]) !== BECH32M) throw new Refused('the checksum does not match: a character was written or read wrong');
  const bytes = regroup(data.slice(0, -6), 5, 8, false);
  if (!bytes || bytes.length !== 32) throw new Refused('it does not carry 32 bytes');
  return Uint8Array.from(bytes);
}

/** A signing seed in both forms: its 24 words and its string, the same key. */
export function bothForms(seed: Uint8Array): { words: string[]; key: string } {
  return { words: toWords(seed), key: toKeyString(seed) };
}

/**
 * A signing key brought in as the person chose to write it: 24 words, or
 * its string (H104: "Signing key, users choses"). The same seed either way.
 * Refused, saying why, as `fromWords` or `fromKeyString` say it. Never for a
 * chain key, which stays words only.
 */
export function fromCarried(typed: string | string[]): Uint8Array {
  if (typeof typed === 'string' && looksLikeKeyString(typed)) return fromKeyString(typed);
  if (Array.isArray(typed) && typed.length && looksLikeKeyString(typed.join(''))) return fromKeyString(typed.join(''));
  if (typeof typed === 'string' && splitWords(typed).length === 1 && splitWords(typed)[0].length > 20) throw new Refused(`neither 24 words nor a signing key’s string (which starts with “${KEY_PREFIX}1”)`);
  return fromWords(typed);
}

/** Whether a whole Bech32m string checks, whatever its prefix (for the test vectors of BIP-350). */
export function bech32mChecks(s: string): boolean {
  const t = s.toLowerCase();
  const at = t.lastIndexOf('1');
  if (at < 1 || t.length - at < 7) return false;
  const data = [...t.slice(at + 1)].map((c) => CHARSET.indexOf(c));
  return !data.includes(-1) && polymod([...expand(t.slice(0, at)), ...data]) === BECH32M;
}

export { KEY_STRING_SAY, keyStringHtml } from './key-html.ts';
