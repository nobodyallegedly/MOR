// Bringing an identity in by its signing key's words (the identity carry
// Module, draft 2, section 4): look it up, refuse unless the words give its
// current signing key, read its chain as its homes serve it, and take its
// encryption key where the words carry the one that counts (2a.3). Dub's
// identity window and Edubba's Identities tab use the same steps (H15).
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { SPECS, cborDecode, hex, signingPublic, xwingPublic } from '../../genesis/src/core.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import type { Home } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Said where the words do not give the current key (the carry Module, costs). */
export const NOT_CURRENT =
  'These words do not give this identity’s current signing key: they are another identity’s, an earlier key’s, or written wrong. Nothing was kept. If these are your chain key’s words, they must never be typed into an online app.';

/** Look an identity up, and refuse unless `seed` gives its current signing key (the carry Module, 4.2). */
export async function lookCurrent(id: string, seed: Uint8Array, hints: string[], via: Via): Promise<Lookup> {
  let pub: Uint8Array;
  try {
    pub = signingPublic(seed);
  } catch {
    throw new Error('The words do not hold a signing key. Nothing was kept.');
  }
  let look: Lookup;
  try {
    look = await lookUp(id, hints, via);
  } catch (e) {
    throw new Error(`This identity was not found at ${hints.join(', ')}: ${message(e)}`);
  }
  const r = look.resolution;
  if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing can be signed for it until they agree.');
  if (r.stop === 'pending' || r.waiting.length) throw new Error('A change of its keys is waiting for its homes: bring it once that change counts, with the new words.');
  if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
  if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
  return look;
}

/** The chain acts, as its homes serve them, to carry along with posts. */
export async function servedChain(id: string, homes: Home[], via: Via): Promise<Uint8Array[]> {
  for (const h of homes) {
    try {
      const chain = (await relayAt(h.hint, via).identity(id)).chain;
      if (chain.length) return chain;
    } catch {
      // the next home
    }
  }
  throw new Error('None of its homes served its chain.');
}

/** The identity's encryption key that counts, where the words carry it (the carry Module, draft 2, 2a.3); else null. */
export function carriedKey(look: Lookup, seed: Uint8Array): { version: number; act: string; secret: string } | null {
  const secret = encryptionSecret(seed);
  if (!look.encryptionKey || !look.encryptionKeyAct || hex(xwingPublic(secret)) !== hex(look.encryptionKey)) return null;
  const e = (look.verifier as unknown as { latest(i: string, s: string, t: number): { payload?: Uint8Array } }).latest(look.resolution.identity, SPECS.envelopes, 4);
  const version = e.payload ? Number((cborDecode(e.payload) as Map<number, unknown>).get(0)) : 1;
  return { version, act: look.encryptionKeyAct, secret: hex(secret) };
}
