// Releasing cMIPs and Modules (F339: "the release of cMIPs and modules"): a
// specification published as its act, its hash shown. Development, Part
// three: "A specification is a public act (Envelopes type 0, a publication)
// whose media is the specification's content, published and signed by its
// creator", naming the Development MIR's spec hash as its media spec (F290).
//
// Ummia writes every field the kind requires (F322): the kind and the text,
// the creator (the identity acting), the tasks a cMIP fills, the cMIP or
// MIR a Module works under, a rail Module's kind and binding, a MIP's
// predecessor. Every optional field is written only where the person fills
// it, from what their text says ("A publishing tool writes every required
// field, and no optional field it cannot fill from the specification's
// text"). The content is decoded by the core library before anything is
// signed: content not in the format is no specification (F323), and is
// refused here, saying why.
//
// Nothing from Node: the same code runs in the web client.

import { readForm } from '../../genesis/src/forms.ts';
import { MIRS, SPECS, cborEncode, checkText, lockMedia, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { KINDS, LAYERS, TASKS, decodeSpec, nameOf, specHash, type Spec } from '../../site/src/listing.ts';

export { KINDS, TASKS, specHash, nameOf, type Spec };

/** The kinds Ummia publishes as specifications: a cMIP, a Module, a MIP (its last step). */
export const PUBLISHED_KINDS = { cmip: 0, module: 1, mip: 8 } as const;

/** The MIR each task belongs to, by the task's layer name (Development, "The tasks the core defines"). */
export const MIR_OF_LAYER: Record<string, string> = Object.fromEntries(Object.entries(LAYERS).map(([hash, name]) => [name, hash]));

/** What the person fills in: the kind, the text, and whatever else the text says. */
export interface SpecForm {
  kind: number;
  text: string;
  /** cMIP: task numbers it fills (field 2). */
  tasks?: number[];
  /** Act types it defines (field 3, discovery only): `[type, name, schema]`. */
  types?: [number, string, string][];
  /** Specifications it depends on (field 4, discovery only), by spec hash. */
  dependencies?: string[];
  /** Module: the cMIP it implements or the MIR it works under (field 5). */
  implements?: string | null;
  /** The specification it replaces (field 8); for a MIP, the MIR, MIP or MICS document it forks. */
  predecessor?: string | null;
  /** Field 10: the layers it acts on as an extension, 0 to 3. */
  layers?: number[];
  /** Fields 11 and 13: a rail Module's kind (0 request, 1 push) and what its proof binds. */
  rail?: { kind: number; binds: number[] } | null;
  /** Field 12: a proof-of-delivery checker. */
  checker?: boolean;
}

const HEX64 = /^[0-9a-f]{64}$/;

/** A spec hash, as typed: its form written for people (`mspec1…`, Identity draft 14, F349), or 64 hexadecimal characters, spaces taken out; another kind refused, saying so. */
export function readHash(s: string, what: string): string {
  const h = s.replace(/\s+/g, '').toLowerCase();
  if (HEX64.test(h)) return h;
  try {
    return readForm(s, 'mspec').hex;
  } catch (e) {
    throw new Error(`${what}: ${e instanceof Error ? e.message : String(e)} (a spec hash is mspec1…, or 64 hexadecimal characters).`);
  }
}

/**
 * The specification's content (Development's `spec` map, canonical CBOR),
 * with the creator given: the fields the kind requires, then only the
 * optional ones filled. Throws saying what is missing.
 */
export function specContent(f: SpecForm, creator: string): Uint8Array {
  const m = new Map<number, unknown>([[0, f.kind]]);
  if (![0, 1, 8].includes(f.kind)) throw new Error('Ummia publishes a cMIP, a Module or a MIP.');
  m.set(1, unhex(creator));
  const tasks = [...new Set(f.tasks ?? [])].sort((a, b) => a - b);
  if (tasks.length) {
    if (f.kind !== 0) throw new Error('Only a cMIP fills a task.');
    m.set(
      2,
      tasks.map((n) => {
        const t = TASKS[n];
        if (!t) throw new Error(`There is no task ${n}.`);
        return [unhex(MIR_OF_LAYER[t[0]]), n];
      }),
    );
  }
  if (f.types?.length) m.set(3, [...f.types].sort((a, b) => a[0] - b[0]).map(([n, name, schema]) => [n, name, schema]));
  if (f.dependencies?.length) m.set(4, [...new Set(f.dependencies)].sort().map(unhex));
  if (f.kind === 1) {
    if (!f.implements) throw new Error('A Module names the cMIP it implements, or the MIR it works under (field 5).');
    m.set(5, unhex(f.implements));
  } else if (f.implements) throw new Error('Only a Module names what it implements (field 5).');
  if (f.predecessor) m.set(8, unhex(f.predecessor));
  else if (f.kind === 8) throw new Error('A MIP names the MIR or MIP it forks, or for a new layer the MICS document (field 8).');
  m.set(9, f.text);
  if (f.layers?.length) m.set(10, [...new Set(f.layers)].sort((a, b) => a - b));
  if (f.rail) {
    m.set(11, f.rail.kind);
    m.set(13, [...new Set(f.rail.binds)].sort((a, b) => a - b));
  }
  if (f.checker) m.set(12, true);
  return cborEncode(m);
}

/** A specification made and checked, nothing signed: what is shown before signing. */
export interface PreparedSpec {
  content: Uint8Array;
  hash: string;
  spec: Spec;
  name: string;
  /** Why it cannot be published as it is, in plain words. */
  blocking: string[];
}

/** Make the content and check it as any client will: canonical text, then the core library's decoder (F323). */
export function prepareSpec(f: SpecForm, creator: string): PreparedSpec {
  const blocking: string[] = [];
  if (!f.text.trim()) blocking.push('Write the specification’s text, or load it from a file.');
  try {
    checkText(f.text);
  } catch (e) {
    blocking.push(`Its text is not canonical text (Text MIR), which field 9 must be: ${e instanceof Error ? e.message : String(e)}. A final line break or a space at the end of a line is the usual cause.`);
  }
  let content: Uint8Array;
  try {
    content = specContent(f, creator);
  } catch (e) {
    return { content: new Uint8Array(), hash: '', spec: null as unknown as Spec, name: nameOf(f.text), blocking: [...blocking, e instanceof Error ? e.message : String(e)] };
  }
  let spec: Spec | null = null;
  if (!blocking.length) {
    try {
      spec = decodeSpec(content);
    } catch (e) {
      blocking.push(`The core library reads it as no specification (Development, F323): ${e instanceof Error ? e.message : String(e)}.`);
    }
  }
  return { content, hash: specHash(content), spec: spec as Spec, name: nameOf(f.text), blocking };
}

/** Publish a specification's content as Development's Part three says: a public publication whose media is its content, on the relays given. */
export async function publishSpec(by: TestIdentity, content: Uint8Array, relays: string[]): Promise<{ id: string; act: Uint8Array; refused: string[] }> {
  const lm = lockMedia(content) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(MIRS.development)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, content.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, relays],
    ]),
  );
  // The signer's chain first, so that a reader knowing only a relay finds its homes.
  for (const r of relays) for (const a of by.chainActs()) await relayAt(r, by.via).putAct(a).catch(() => undefined);
  const made = await by.publish(SPECS.envelopes, 0, payload, { public: true, relays });
  const refused: string[] = [];
  for (const r of relays) {
    try {
      await relayAt(r, by.via).putMedia(lm.locked);
    } catch (e) {
      refused.push(`${r}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { id: made.id, act: made.act, refused };
}
