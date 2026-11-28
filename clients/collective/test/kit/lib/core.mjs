// The core library, through its WebAssembly binding (crate `mor-wasm`),
// loaded from the files beside this kit (`../core/`), for Node.js with no
// network and nothing to install. Every act this kit makes or checks is
// made and checked by the core library's own code.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as mor from '../core/mor_wasm.js';

mor.initSync({ module: readFileSync(new URL('../core/mor_wasm_bg.wasm', import.meta.url)) });

export { mor };

export const hex = (b) => Buffer.from(b).toString('hex');
export const unhex = (s) => Uint8Array.from(Buffer.from(s, 'hex'));
export const b64 = (b) => Buffer.from(b).toString('base64');
export const unb64 = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
export const sha256 = (data) => createHash('sha256').update(data).digest('hex');
export const isHash = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);

/** The spec hashes, the same test values as the relays, homes and every client until the freeze. */
export const SPECS = {
  identity: sha256('IDENTITY, test value until the freeze'),
  envelopes: sha256('ENVELOPE, test value until the freeze'),
  text: sha256('TEXT, test value until the freeze'),
  money: sha256('FINANCE, test value until the freeze'),
  agreements: sha256('LAW, test value until the freeze'),
  development: sha256('PRODUCTION, test value until the freeze'),
};

/**
 * The hosts' bank order of round two (`BANK-ORDERS.md`): an everyday act
 * under this spec hash, type 0, addressed to the postman's bank only. It is
 * no MIR and no cMIP: a stand-in label, for this simulation only.
 */
export const BANK = { spec: sha256('MOR ROUND 2, THE HOSTS BANK ORDER, draft 1, test value'), type: 0 };

/** The text act (Text MIR, type 0): its payload, the text and an optional format. */
export function textPayload(text, format = null) {
  const m = new Map([[0, text]]);
  if (format) m.set(1, unhex(format));
  return mor.cborEncode(m);
}

/** A JSON-friendly copy of what the binding returns (bytes as hex, Maps as objects or pairs, BigInts as strings). */
export function plain(v) {
  if (v instanceof Uint8Array) return hex(v);
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof Map) {
    const keys = [...v.keys()];
    if (keys.every((k) => typeof k === 'string')) return Object.fromEntries([...v].map(([k, x]) => [k, plain(x)]));
    return { map: [...v].map(([k, x]) => [plain(k), plain(x)]) };
  }
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

export const errorText = (e) => (e instanceof Error ? e.message : String(e));
