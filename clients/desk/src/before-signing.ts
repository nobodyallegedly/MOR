// Checks made before Edubba signs, from round two's lessons (DubLaw, 17
// November 2026; build/clients/desk/ROUND-2-LESSONS.md). Pure functions: no
// keys, no network, no imports from genesis, so each can be tested alone and
// called from any signing path once its inputs are read.
//
// 1. Bytes, not their printout: a field that must be a hash is 32 bytes,
//    never 64 hexadecimal characters of text (Hop's finding, act a69f00ea…).
// 2. An update replaces the version in force, read at signing time (G4.8;
//    DubLaw's mistake in the fields it gave an entrant).
// 3. A signer's own line: name their newest act, refuse where it forks
//    (Counterparty's E2 on Edubba's tray version 1).
// 4. "Your own signature" counts only an act in your own name, never one
//    made for you under a power (Plain Words' finding; Counterparty's Y1).
// 5. Invoices: say early that a payee's unused invoices are running out
//    (Gaël's payment held at the split service).
// 6. Sealed acts addressed to you and not yet opened are counted and shown.
//
// TEST IDENTITIES ONLY.

export type Problem = { path: string; said: string };

/** A hash is a byte string of 32. Text is never a hash, even 64 hex digits of it. */
export function isHashBytes(v: unknown): v is Uint8Array {
  return v instanceof Uint8Array && v.length === 32;
}

/**
 * Walks a decoded value (as the core library decodes CBOR: Map, Array,
 * Uint8Array, string, number) and reports each place named in `paths` whose
 * value is not 32 bytes. A path is a list of keys and indexes; `*` means every
 * element of an array. Example: the owners of shower work's key 1 are
 * `[1, '*', 0, 1]`.
 */
export function hashFieldProblems(value: unknown, paths: (string | number)[][]): Problem[] {
  const out: Problem[] = [];
  const walk = (v: unknown, rest: (string | number)[], at: string): void => {
    if (!rest.length) {
      if (!isHashBytes(v)) {
        const what = typeof v === 'string' && /^[0-9a-f]{64}$/i.test(v) ? 'text that looks like a hash: a hash is 32 bytes' : 'not 32 bytes';
        out.push({ path: at, said: what });
      }
      return;
    }
    const [k, ...more] = rest;
    if (k === '*') {
      if (!Array.isArray(v)) { out.push({ path: at, said: 'not a list' }); return; }
      v.forEach((x, i) => walk(x, more, `${at}[${i}]`));
      return;
    }
    const next = v instanceof Map ? v.get(k) : Array.isArray(v) && typeof k === 'number' ? v[k] : undefined;
    if (next === undefined) return; // an absent optional field is not a problem here
    walk(next, more, `${at}.${String(k)}`);
  };
  for (const p of paths) walk(value, p, '$');
  return out;
}

/** An update may be signed only if what it replaces is, now, the version in force. */
export function replacesInForce(replaces: string, inForceNow: string | null): { ok: boolean; said: string } {
  if (inForceNow === null) return { ok: false, said: 'Which version is in force could not be read now: nothing is signed until it can.' };
  if (replaces === inForceNow) return { ok: true, said: `It replaces ${replaces.slice(0, 8)}…, the version in force.` };
  return { ok: false, said: `It replaces ${replaces.slice(0, 8)}…, but the version in force is ${inForceNow.slice(0, 8)}…: an update replaces only the version in force, so this one would count for nothing. Nothing was signed.` };
}

export type LineAct = { id: string; signer: string; previous: string[] };

/**
 * The signer's own acts in one agreement, as held: the newest is the one no
 * other of theirs names as previous. Returns null for none, the id for one
 * newest, or 'fork' where their own line already has two ends.
 */
export function newestOwnAct(acts: LineAct[], me: string): string | null | 'fork' {
  const mine = acts.filter((a) => a.signer === me);
  if (!mine.length) return null;
  const named = new Set(mine.flatMap((a) => a.previous));
  const ends = mine.filter((a) => !named.has(a.id));
  return ends.length === 1 ? ends[0].id : 'fork';
}

export type Assent = { signer: string; forParty?: string };

/** The parties who assented in their own name: an assent made for someone under a power does not count as theirs here. */
export function ownNameAssenters(assents: Assent[]): Set<string> {
  return new Set(assents.filter((a) => a.forParty === undefined || a.forParty === a.signer).map((a) => a.signer));
}

/** Plain words for a payee whose unused invoices run low. `perWindow` is the sales one window usually brings. */
export function invoicesWarning(unused: number, perWindow: number): string | null {
  if (unused <= 0) return 'No unused invoice is left: every payment owed to you now waits at the split service, and holds up its buyer. Post fresh invoices.';
  if (unused <= Math.max(3, perWindow)) return `Only ${unused} unused invoice${unused === 1 ? '' : 's'} left, about ${perWindow} sale${perWindow === 1 ? '' : 's'} a window: post more before they run out.`;
  return null;
}

/** What the first screen says of sealed acts addressed to an identity and not yet opened. */
export function unopenedSealedLine(count: number): string | null {
  return count > 0 ? `${count} sealed act${count === 1 ? '' : 's'} addressed to you not opened yet: open ${count === 1 ? 'it' : 'them'} before acting on anything else.` : null;
}
