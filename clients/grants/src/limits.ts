// The grant limits cMIP, draft 1 (`cmips/cmip-grant-limits-draft-1.md`,
// F345): a grant's field 3, under field 4 naming this cMIP. Two limits, each
// judged act by act: a cap on the amount one act moves, in one unit; and an
// expiry, a point on a clock the grant names (the timestamp clock Module's
// stamp of the act, or a Bitcoin block height). A verifier implementing it
// gives Agreements its verdict through the core's limits input
// (`withGrantLimits`); one that does not answers unknown.
//
// Shared: Edubba's agents now, Damgar's round 2 lanes next. Nothing here
// reads a relay: the stamps are handed in.

import { cborDecode, cborEncode, hex, moneyRead, readCommitment, sha256, unhex } from '../../genesis/src/core.ts';
import { TIMESTAMP_SPEC } from '../../../modules/timestamp/src/stamp.ts';

/** The grant limits cMIP, draft 1: a test value until publication. */
export const GRANT_LIMITS_SPEC = sha256('Grant limits cMIP, draft 1, test value until publication');

/** The clocks an expiry may name. The Bitcoin clock's hash is the core's (`moneySpecs().bitcoinClock`), passed in by the caller where used. */
export const CLOCKS = { timestamp: TIMESTAMP_SPEC } as const;

export interface Cap {
  unit: string;
  value: number;
}

export type Expiry = { clock: 'timestamp'; identity: string; time: number } | { clock: 'height'; spec: string; network: number; height: number };

export interface Limits {
  cap?: Cap;
  expiry?: Expiry;
}

export function encodeLimits(l: Limits): Uint8Array {
  if (!l.cap && !l.expiry) throw new Error('Limits name a cap, an expiry, or both.');
  const m = new Map<number, unknown>();
  if (l.cap) {
    if (!Number.isSafeInteger(l.cap.value) || l.cap.value < 0) throw new Error('The cap is a whole amount.');
    m.set(0, [unhex(l.cap.unit), l.cap.value]);
  }
  if (l.expiry) {
    if (l.expiry.clock === 'timestamp') m.set(1, [unhex(CLOCKS.timestamp), unhex(l.expiry.identity), l.expiry.time]);
    else m.set(1, [unhex(l.expiry.spec), l.expiry.network, l.expiry.height]);
  }
  return cborEncode(m);
}

/** The limits as the grant carries them (field 3 is any CBOR): its encoded bytes' value. */
export function limitsValue(l: Limits): unknown {
  return cborDecode(encodeLimits(l));
}

const h32 = (v: unknown) => v instanceof Uint8Array && v.length === 32;

/** Field 3 read back, or why it cannot be (1.1: unreadable limits leave every act unknown). */
export function readLimits(v: unknown): Limits {
  if (!(v instanceof Map)) throw new Error('the limits are not a map');
  const m = v as Map<number, unknown>;
  for (const k of m.keys()) if (k !== 0 && k !== 1) throw new Error(`the limits carry a key this cMIP does not define (${k})`);
  if (!m.size) throw new Error('the limits name neither a cap nor an expiry');
  const out: Limits = {};
  if (m.has(0)) {
    const c = m.get(0);
    if (!Array.isArray(c) || c.length !== 2 || !h32(c[0]) || typeof c[1] !== 'number' || c[1] < 0) throw new Error('the cap is not [unit, value]');
    out.cap = { unit: hex(c[0]), value: c[1] };
  }
  if (m.has(1)) {
    const e = m.get(1);
    if (!Array.isArray(e) || e.length !== 3 || !h32(e[0]) || typeof e[2] !== 'number') throw new Error('the expiry is not [clock, reference, point]');
    if (hex(e[0]) === CLOCKS.timestamp) {
      if (!h32(e[1])) throw new Error('a timestamp clock is named by its identity');
      out.expiry = { clock: 'timestamp', identity: hex(e[1]), time: e[2] };
    } else {
      if (typeof e[1] !== 'number') throw new Error('a Bitcoin clock is named by its network');
      out.expiry = { clock: 'height', spec: hex(e[0]), network: e[1], height: e[2] };
    }
  }
  return out;
}

/**
 * The money messages cMIP's drafts, whose acts carry an amount (2.1): an
 * invoice request (type 3) carries the payment's commitment, whose amount it
 * is. Set by the app that reads them (Damgar's `MESSAGES_SPECS`); empty, no
 * message act moves anything here.
 */
export const MESSAGES: { specs: string[] } = { specs: [] };

/** The amount an act moves (2.1): a Money act's, an invoice request's commitment's (a money messages cMIP act), or none. */
export function amountOf(act: { spec?: string; type?: number; payload?: Uint8Array }, moneySpec: string): Cap | null {
  if (act.type === undefined || !act.payload) return null;
  if (act.spec && MESSAGES.specs.includes(act.spec)) {
    // The money messages cMIP: a draft's amount (type 1, field 2), a request's (type 2, field 0), an invoice request's commitment's (type 3), an answer's (type 4, field 4, draft 3; F352).
    try {
      const m = cborDecode(act.payload) as Map<number, unknown>;
      const pair = (x: unknown): Cap | null => (Array.isArray(x) && x.length === 2 && x[0] instanceof Uint8Array ? { unit: hex(x[0]), value: Number(x[1]) } : null);
      if (act.type === 1) return pair(m.get(2));
      if (act.type === 2) return pair(m.get(0));
      if (act.type === 4) return pair(m.get(4));
      if (act.type !== 3) return null;
      const c = readCommitment(cborEncode(m.get(0))) as { amount: { unit: string; value: number } };
      return { unit: c.amount.unit, value: c.amount.value };
    } catch {
      return null;
    }
  }
  if (act.spec !== moneySpec) return null;
  try {
    const r = moneyRead(act.type, act.payload) as { act: { amount?: { unit: string; value: number } } };
    return r.act.amount ? { unit: r.act.amount.unit, value: r.act.amount.value } : null;
  } catch {
    return null;
  }
}

export type Verdict = { within: true } | { within: false; why: string } | { within: null; why: string };

/**
 * Whether one act lies within the limits (sections 2 and 3). `stamps`: the
 * act's earliest time on each timestamp clock whose stamps the caller read
 * and verified (by clock identity). `heights` likewise for a Bitcoin clock,
 * where the caller follows a chain; absent, a height expiry is unknown.
 */
export function judge(l: Limits, act: { id: string; spec?: string; type?: number; payload?: Uint8Array }, moneySpec: string, places: { stamps?: Map<string, Map<string, number>>; heights?: Map<string, number> } = {}): Verdict {
  if (l.cap) {
    const a = amountOf(act, moneySpec);
    if (a && a.unit !== l.cap.unit) return { within: false, why: `it moves an amount in another unit than the cap’s (2.2): no conversion is assumed` };
    if (a && a.value > l.cap.value) return { within: false, why: `it moves ${a.value}, above the cap of ${l.cap.value} per act (2.2)` };
  }
  if (l.expiry) {
    if (l.expiry.clock === 'timestamp') {
      const t = places.stamps?.get(l.expiry.identity)?.get(act.id);
      if (t === undefined) return { within: null, why: 'no stamp of the clock the grant names places it yet: whether it came before the expiry is unknown (3.1)' };
      if (t > l.expiry.time) return { within: false, why: `the clock the grant names stamped it at ${new Date(t * 1000).toISOString()}, past the expiry ${new Date(l.expiry.time * 1000).toISOString()} (3.1)` };
    } else {
      const h = places.heights?.get(act.id);
      if (h === undefined) return { within: null, why: 'no anchor placing it on the Bitcoin clock the grant names is checked here: unknown (3.2)' };
      if (h > l.expiry.height) return { within: false, why: `anchored at height ${h}, past the expiry at height ${l.expiry.height} (3.2)` };
    }
  }
  return { within: true };
}

/**
 * Client conformance (5.1), before signing with a grant key: refused above
 * the cap or in another unit, or while this device's clock is past the
 * expiry. Null where it may be signed.
 */
export function refuseBeforeSigning(l: Limits | null, act: { spec: string; type: number; payload: Uint8Array }, moneySpec: string, nowSeconds: number): string | null {
  if (!l) return null;
  if (l.cap) {
    const a = amountOf(act, moneySpec);
    if (a && a.unit !== l.cap.unit) return 'The grant’s cap is in another unit: an act moving this unit is outside it. Nothing was signed.';
    if (a && a.value > l.cap.value) return `${a.value} is above the grant’s cap of ${l.cap.value} per act. Nothing was signed.`;
  }
  if (l.expiry?.clock === 'timestamp' && nowSeconds > l.expiry.time) return `The grant expired on ${new Date(l.expiry.time * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC (this device’s clock). Nothing was signed.`;
  return null;
}
