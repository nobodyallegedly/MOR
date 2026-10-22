// The cap in all of a lane (the grant limits cMIP, draft 3, section 8;
// decided by Nobody, allegedly, 21 October 2026: "Yes, add it"): the most a
// lane may move in all its acts, kept by the apps and never judged by a
// verifier. A total needs every act of the lane, some of them private, so
// no outsider can check it (draft 2, 2.3): the app holding the lane's key
// refuses to sign past it, and the money app counts it and shows any
// overspend.
//
// It travels as limits key 2 in the limits an app asks with (the money
// messages cMIP's lane request, field 3) and in the money app's own record,
// sealed to the identity; never in a grant, whose limits are read as draft 2
// reads them (a key it does not define there leaves them unreadable, 1.1).

import { cborDecode, cborEncode, hex, sha256, unhex } from '../../genesis/src/core.ts';
import { readLimits, type Cap, type Limits } from '../../grants/src/limits.ts';

/** The grant limits cMIP, draft 3 (`cmips/cmip-grant-limits-draft-3.md`): a test value until publication. Named by no grant: draft 3 changes nothing a verifier judges. */
export const GRANT_LIMITS_SPEC_3 = sha256('Grant limits cMIP, draft 3, test value until publication');

/** The key of the cap in all in a limits map (draft 3, 8.1). */
export const TOTAL = 2;

/** Said wherever the cap in all is shown: whose rule it is. */
export const TOTAL_SAY = 'In all: kept by the apps, not judged by verifiers. Dub refuses to sign past it and Damgar counts it here; a reader of the lane’s acts judges only the cap per payment and the expiry, since a total needs every act of the lane, some of them private.';

/** Limits as asked: the grant's (keys 0 and 1, read as draft 2 reads them) and the cap in all (key 2), read apart. */
export function readAsked(v: unknown): { limits: Limits; total: Cap | null } {
  if (!(v instanceof Map)) throw new Error('the limits are not a map');
  const m = new Map(v as Map<number, unknown>);
  let total: Cap | null = null;
  if (m.has(TOTAL)) {
    const t = m.get(TOTAL);
    if (!Array.isArray(t) || t.length !== 2 || !(t[0] instanceof Uint8Array) || t[0].length !== 32 || typeof t[1] !== 'number' || !Number.isSafeInteger(t[1]) || t[1] <= 0) throw new Error('the cap in all is not [unit, value], a whole amount above zero');
    total = { unit: hex(t[0]), value: t[1] };
    m.delete(TOTAL);
  }
  const limits = readLimits(m);
  if (total && limits.cap && limits.cap.unit !== total.unit) throw new Error('the cap in all is in another unit than the cap per act');
  return { limits, total };
}

/** The limits an app asks with: the grant's, and the cap in all where one is given (key 2). */
export function askedValue(limits: Limits, total: Cap | null, encode: (l: Limits) => Uint8Array): unknown {
  const m = cborDecode(encode(limits)) as Map<number, unknown>;
  if (total) {
    if (!Number.isSafeInteger(total.value) || total.value <= 0) throw new Error('The cap in all is a whole amount above zero.');
    if (limits.cap && total.value < limits.cap.value) throw new Error('The cap in all is at least the cap per payment.');
    m.set(TOTAL, [unhex(total.unit), total.value]);
  }
  return cborDecode(cborEncode(m));
}

/** What a lane has spent, by its committed payments (8.2): each payment once, a refused one giving back. */
export function spent(payments: { amount: { unit: string; value: number }; refused: boolean }[], unit: string): number {
  return payments.filter((p) => !p.refused && p.amount.unit === unit).reduce((n, p) => n + p.amount.value, 0);
}
