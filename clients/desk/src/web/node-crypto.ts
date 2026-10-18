// `node:crypto` in Edubba's web client: only what the shared code it runs
// uses, from the browser's own sources. The build puts this file in place of
// `node:crypto` (`scripts/build-web.ts`).
//
//   randomBytes   the browser's secure random source (the genesis client's sealing, the collective client's plan ids)
//   createHash    SHA-256 only (the identity carry Module's checksum, the test spec hashes, the drafts' and plans' digests)

import { sha256 } from '@noble/hashes/sha2.js';
import { Buffer } from './buffer.ts';

export function randomBytes(n: number): Buffer {
  return new Buffer(crypto.getRandomValues(new Uint8Array(n)));
}

export function createHash(algorithm: string) {
  if (algorithm !== 'sha256') throw new Error(`${algorithm}: only sha256 in the browser`);
  const h = sha256.create();
  const hash = {
    update(data: Uint8Array | string) {
      h.update(typeof data === 'string' ? new TextEncoder().encode(data) : data);
      return hash;
    },
    /** The digest's bytes, or, as Node gives them, its hexadecimal or base64 text. */
    digest(encoding?: 'hex' | 'base64'): any {
      const d = Buffer.from(h.digest());
      return encoding ? d.toString(encoding) : d;
    },
  };
  return hash;
}
