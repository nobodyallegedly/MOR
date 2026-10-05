// What `clients/genesis/src/core.ts` adds to the core library's bindings,
// written for a browser: no Node, no Buffer. The tests check that it gives
// the same answers as the genesis client's.

import { sha256 as sha } from '@noble/hashes/sha2.js';

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

export const hex = (b: Uint8Array): string => {
  let s = '';
  for (const x of b) s += HEX[x];
  return s;
};

export const unhex = (s: string): Uint8Array => {
  if (s.length % 2 || /[^0-9a-fA-F]/.test(s)) throw new Error('not hex');
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(2 * i, 2 * i + 2), 16);
  return out;
};

export const base64 = (b: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};

/** SHA-256 of bytes, or of a string's UTF-8, in hex. */
export const sha256 = (data: Uint8Array | string): string =>
  hex(sha(typeof data === 'string' ? new TextEncoder().encode(data) : data));

/** The same test values as the genesis client, the relays and the core's tests, until the freeze. */
export const SPECS = {
  identity: sha256('IDENTITY, test value until the freeze'),
  envelope: sha256('ENVELOPE, test value until the freeze'),
  text: sha256('TEXT, test value until the freeze'),
};

/** The six MIPs' spec hashes, as in the genesis client. Test values. */
export const MIPS = {
  ...SPECS,
  finance: sha256('FINANCE, test value until the freeze'),
  law: sha256('LAW, test value until the freeze'),
  production: sha256('PRODUCTION, test value until the freeze'),
};

/** The specifications whose act types may carry acknowledgements (F110). */
export const ACK_SPECS: readonly string[] = [MIPS.identity, MIPS.finance, MIPS.law];

export { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';

export const IDENTITY_TYPES = { genesis: 0, rotation: 1, receipt: 2, routes: 3, witness: 15 } as const;
export const ENVELOPE_TYPES = { publication: 0, keyDelivery: 1, encryptionKey: 4 } as const;
