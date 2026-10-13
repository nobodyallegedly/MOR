// The timestamp clock Module, draft 1 (modules/module-clock-timestamp-draft-1.md):
// a clock that is an ordinary identity signing one kind of act, a stamp, "I
// held these acts at this time". Its operator's word, and only that.
//
// This file is the stamp's format, read and made, and the clock's
// reference. Whether a stamp counts (its standing for the clock's chain) is
// the core library's judgment, made by whoever reads it (src/read.ts).

import { cborDecode, cborEncode, hex, sha256, unhex } from '../../../clients/genesis/src/core.ts';

/** The Module's spec hash: a test value until its creator is named at step 17. Readers and the clock must use the same. */
export const TIMESTAMP_SPEC = sha256('timestamp clock Module, draft 1, test value until publication');

/** The stamp's act type; the Module defines no other. */
export const STAMP_TYPE = 1;

/** The most acts one stamp names (a mechanic of the build). */
export const MOST_PER_STAMP = 256;

/** A stamp's payload, read: the time (seconds since 1970, UTC) and the act ids held at that time. */
export interface Stamp {
  time: number;
  acts: string[];
}

/** A payload that is no stamp under this Module (the act may still be valid under the MIRs). */
export class NotAStamp extends Error {}

/** The clock's reference, `[ this Module's spec hash, clock ]` (anchoring cMIP, item 1), as deterministic CBOR, hex. */
export function reference(clock: string): string {
  return hex(cborEncode([unhex(TIMESTAMP_SPEC), unhex(clock)]) as Uint8Array);
}

/** Read a stamp from a payload; throws `NotAStamp` where the Module's rules 1 and 2 make it none. */
export function decodeStamp(payload: Uint8Array): Stamp {
  let m: unknown;
  try {
    m = cborDecode(payload);
  } catch (e) {
    throw new NotAStamp(`not CBOR (${e instanceof Error ? e.message : e})`);
  }
  if (!(m instanceof Map)) throw new NotAStamp('not a map');
  for (const k of m.keys()) if (k !== 0 && k !== 1) throw new NotAStamp(`${String(k)} is not one of its fields`);
  const time = m.get(0);
  if (typeof time !== 'number' || !Number.isSafeInteger(time) || time < 0) throw new NotAStamp('its time (field 0) is not a whole number of seconds');
  const list = m.get(1);
  if (!Array.isArray(list) || !list.length) throw new NotAStamp('its acts (field 1) are not a list of at least one');
  if (list.length > MOST_PER_STAMP) throw new NotAStamp(`it names more than ${MOST_PER_STAMP} acts`);
  const acts = list.map((x, i) => {
    if (!(x instanceof Uint8Array) || x.length !== 32) throw new NotAStamp(`its act ${i + 1} is not an act id`);
    return hex(x);
  });
  if (new Set(acts).size !== acts.length) throw new NotAStamp('it names an act twice');
  return { time, acts };
}

/** A stamp's payload: deterministic CBOR, read back before it is returned. */
export function encodeStamp(s: Stamp): Uint8Array {
  const out = cborEncode(new Map<number, unknown>([[0, s.time], [1, s.acts.map((a) => unhex(a))]])) as Uint8Array;
  decodeStamp(out);
  return out;
}
