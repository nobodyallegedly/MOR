// The core library, through WebAssembly (crate `mor-wasm`). Every act is
// made and judged by the core library's own Rust code; this client only
// fetches, stores and shows. Build it first with `npm run wasm`.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { initSync } from '../wasm/mor_wasm.js';

initSync({ module: readFileSync(new URL('../wasm/mor_wasm_bg.wasm', import.meta.url)) });

export * from '../wasm/mor_wasm.js';

export const hex = (b: Uint8Array): string => Buffer.from(b).toString('hex');
export const unhex = (s: string): Uint8Array => Uint8Array.from(Buffer.from(s, 'hex'));
export const base64 = (b: Uint8Array): string => Buffer.from(b).toString('base64');
/** SHA-256 of bytes, or of a string's UTF-8, in hex. */
export const sha256 = (data: Uint8Array | string): string => createHash('sha256').update(data).digest('hex');

// Everything above that needs Node is here, in this file alone: the web
// reader (clients/reader) builds the other client modules for a browser with
// its own copy of this file, `clients/reader/src/web/core.ts`.

/** The spec hashes a test identity names. The real ones are fixed at the
 * freeze; until then, the same test values as the relays and the core's tests. */
export const SPECS = {
  identity: sha256('IDENTITY, test value until the freeze'),
  envelope: sha256('ENVELOPE, test value until the freeze'),
  text: sha256('TEXT, test value until the freeze'),
};

/** The six MIPs' spec hashes, as the core library's Law calls take them
 * (Law draft 7 reads an act's layer from its spec hash). Test values. */
export const MIPS = {
  ...SPECS,
  finance: sha256('FINANCE, test value until the freeze'),
  law: sha256('LAW, test value until the freeze'),
  production: sha256('PRODUCTION, test value until the freeze'),
};

export const IDENTITY_TYPES = { genesis: 0, rotation: 1, receipt: 2, routes: 3, witness: 15 } as const;

/** The specifications whose act types may carry acknowledgements (Envelope
 * draft 7, rule 4a, F110): Identity, Finance and Law. Any other act carrying
 * `acks` is invalid. */
export const ACK_SPECS: readonly string[] = [MIPS.identity, MIPS.finance, MIPS.law];

export { WITNESS_EXPLANATION } from './witness.ts';
export const ENVELOPE_TYPES = { publication: 0, keyDelivery: 1, encryptionKey: 4 } as const;
