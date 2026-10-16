// Display names, as the naming cMIP says (cmips/cmip-naming-draft-1.md): an
// Identity name act (type 4) naming the cMIP by its hash, free text, not
// unique, shown beside the fingerprint, never instead of it. A rename is a
// new name act and the withdrawal (type 5) of the old ones.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { SPECS, Verifier, MIRS, cborDecode, cborEncode, describeAct, hex, sha256, unhex } from '../../genesis/src/core.ts';
import { holdSequence, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';

/** The naming cMIP's hash: a test value until its creator is named at step 17. */
export const NAMING_SPEC = sha256('Naming cMIP, draft 1, test value until publication');
/** Identity's name act and name withdrawal (Identity MIR, act types). */
export const NAME = 4;
export const NAME_WITHDRAWAL = 5;
/** The longest display name, in characters (section 2.2). */
export const MAX_NAME = 48;

/** Characters a name never holds (section 2.1): controls, line breaks, bidirectional overrides and isolates. */
const FORBIDDEN = new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'u');

/** Why a name is not a display name under this cMIP, or null where it is one. */
export function nameProblem(name: string): string | null {
  if (name !== name.normalize('NFC')) return 'it is not canonical text (NFC)';
  if (!name.trim()) return 'it is empty';
  if (/^\s|\s$/u.test(name)) return 'it starts or ends with a space';
  if (FORBIDDEN.test(name)) return 'it holds a line break, a control character or a direction override';
  if ([...name].length > MAX_NAME) return `it is longer than ${MAX_NAME} characters`;
  return null;
}

/** A name as a person typed it, made canonical (NFC, trimmed), or refused, saying why. */
export function readName(typed: string): string {
  const name = typed.normalize('NFC').trim();
  const why = nameProblem(name);
  if (why) throw new Error(`That name cannot be used: ${why}. Nothing was signed.`);
  return name;
}

/** A name act's payload (Identity MIR: key 0 the name, key 1 the naming cMIP). */
export const namePayload = (name: string): Uint8Array =>
  cborEncode(
    new Map<number, unknown>([
      [0, name],
      [1, unhex(NAMING_SPEC)],
    ]),
  );

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  objects?: [string, string][];
}

/** A name act found, and what it says. */
export interface FoundName {
  act: string;
  name: string;
}

/**
 * The display names of an identity under this cMIP (section 3): its name
 * acts naming the cMIP, valid for its chain, well formed, with no valid
 * withdrawal of its own naming them; at its homes, then the relays its
 * routes name, and `places`. In act id order. Silence proves nothing: a
 * withdrawal not found leaves a name shown.
 */
export async function namesOf(identity: string, places: string[], via: Via = {}): Promise<FoundName[]> {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [...new Set([...l.resolution.homes.map((h) => h.hint), ...routed, ...places])];
  await holdSequence(v, identity, l, at, via);
  const names = new Map<string, FoundName>();
  const withdrawn = new Set<string>();
  const seen = new Set<string>();
  for (const h of at) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ signer: identity, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          let d: Described;
          try {
            d = describeAct(it.item) as Described;
          } catch {
            continue;
          }
          if (seen.has(d.id) || d.spec !== SPECS.identity || d.signer !== identity) continue;
          if (d.type !== NAME && d.type !== NAME_WITHDRAWAL) continue;
          seen.add(d.id);
          v.add(it.item);
          if (v.status(d.id) !== 'valid') continue;
          if (d.type === NAME_WITHDRAWAL) {
            for (const [chain, target] of d.objects ?? []) if (chain === target) withdrawn.add(target);
            continue;
          }
          const m = cborDecode(d.payload!) as Map<number, unknown>;
          const name = m.get(0);
          const cmip = m.get(1);
          if (typeof name !== 'string' || !(cmip instanceof Uint8Array) || hex(cmip) !== NAMING_SPEC) continue;
          if (nameProblem(name)) continue;
          names.set(d.id, { act: d.id, name });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that place did not answer: what the others hold is still read
    }
  }
  return [...names.values()].filter((n) => !withdrawn.has(n.act)).sort((a, b) => (a.act < b.act ? -1 : 1));
}

