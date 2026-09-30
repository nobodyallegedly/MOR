// The relay program on the operator's side, as the tests use it.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const bin = join(fileURLToPath(new URL('../../..', import.meta.url)), 'target/debug/mor-relay');

/** A one-time pairing code, as the operator gets it on the relay's machine. */
export function pairingCode(dir: string): string {
  const out = execFileSync(bin, ['pair', '--dir', dir], { encoding: 'utf8' });
  const m = out.match(/([0-9A-Z]{5}-[0-9A-Z]{5}-[0-9A-Z]{5}-[0-9A-Z]{5})/);
  assert.ok(m, out);
  return m[1];
}
