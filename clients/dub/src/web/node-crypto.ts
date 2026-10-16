// `node:crypto` in Dub's web client: only what the shared code it runs uses,
// from the browser's own sources. The build puts this file in place of
// `node:crypto` for the files it names (`scripts/build-web.ts`), and refuses
// every other import from Node.
//
//   randomBytes        the genesis client's sealing (identity.ts): the browser's secure random source
//   createHash         the identity carry Module's checksum (carry.ts) and the repo client's test spec hashes (specs.ts): SHA-256 only

import { sha256 } from '@noble/hashes/sha2.js';

export function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

export function createHash(algorithm: string) {
  if (algorithm !== 'sha256') throw new Error(`${algorithm}: only sha256 in the browser`);
  const parts: Uint8Array[] = [];
  const h = {
    update(data: Uint8Array | string) {
      parts.push(typeof data === 'string' ? new TextEncoder().encode(data) : data);
      return h;
    },
    digest(): Uint8Array {
      const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of parts) {
        all.set(p, at);
        at += p.length;
      }
      return sha256(all);
    },
  };
  return h;
}
