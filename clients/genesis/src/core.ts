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

/** The spec hashes a test identity names. The real ones are fixed at the
 * freeze; until then, the same test values as the relays and the core's tests. */
export const SPECS = {
  identity: createHash('sha256').update('IDENTITY, test value until the freeze').digest('hex'),
  envelope: createHash('sha256').update('ENVELOPE, test value until the freeze').digest('hex'),
};

export const IDENTITY_TYPES = { genesis: 0, rotation: 1, receipt: 2, routes: 3 } as const;
export const ENVELOPE_TYPES = { publication: 0, keyDelivery: 1, encryptionKey: 4 } as const;
