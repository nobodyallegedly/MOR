// Lanes (F338, round 2; F351): a person's grant to itself, its key made and
// held by an app (Dub, or Damgar itself for its receipts), so that the app
// signs the person's money acts within the grant's reach and limits, and
// every reader sees each act signed under that grant rather than with the
// person's own key. A grant whose grantee is its own grantor is valid, its
// acceptance the grantor's (Agreements draft 15, rule 73, F351). A lane
// names a key, never an app: any app, one not yet written among them,
// holds one by its key alone.
//
// The grant itself carries no words (Agreements type 9 has no field for
// them), so a lane's name, "Dub on the Mac", travels in the sealed request
// that asked for it, and in the granting app's own record.

import { cborDecode, describeAct, hex, MIRS } from '../../genesis/src/core.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { allBy, readGrant, REVOCATION, type GrantRead, type Kind } from './grant.ts';

/** A lane as the app holding its key keeps it. */
export interface HeldLane {
  grant: string;
  /** Its words, as asked: "Dub on the Mac". */
  label: string;
  secret: string;
  strand: string[];
}

/** Whether a grant reaches an act of this specification and type (field 6; none named: every act but a decision). */
export function reaches(kinds: Kind[] | null, spec: string, type: number, layerOf: (spec: string) => number | null): boolean {
  if (!kinds?.length) return true;
  return kinds.some((k) => ('layer' in k ? layerOf(spec) === k.layer : k.spec === spec && k.type === type));
}

/** The person's grants to itself whose key is this one, at these places: the lanes it granted that key. */
export async function grantsForKey(person: string, key: string, hints: string[], via: Via = {}): Promise<{ id: string; grant: GrantRead }[]> {
  const out: { id: string; grant: GrantRead }[] = [];
  for (const a of await allBy(person, hints, via)) {
    const d = describeAct(a) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
    if (d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.grant || !d.payload) continue;
    try {
      const g = readGrant(d.payload);
      if (g.grantee === person && g.key === key && !out.some((x) => x.id === d.id)) out.push({ id: d.id, grant: g });
    } catch {
      // not a grant this reads
    }
  }
  return out;
}

/** The grantor's revocations naming this grant (rule 76), at these places: one is enough to end it. */
export async function revocationsOf(grantor: string, grant: string, hints: string[], via: Via = {}): Promise<string[]> {
  const out: string[] = [];
  for (const a of await allBy(grantor, hints, via)) {
    const d = describeAct(a) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
    if (d.spec !== MIRS.agreements || d.type !== REVOCATION || !d.payload) continue;
    const named = (cborDecode(d.payload) as Map<number, unknown>).get(0);
    if (named instanceof Uint8Array && hex(named) === grant && !out.includes(d.id)) out.push(d.id);
  }
  return out;
}

/** The acts the places hold signed under this grant: the person's own acts whose binding is the grant (their outsides; a private act's inside stays sealed). */
export async function actsUnder(grantor: string, grant: string, hints: string[], via: Via = {}): Promise<{ id: string; public: boolean; spec?: string; type?: number }[]> {
  const out: { id: string; public: boolean; spec?: string; type?: number }[] = [];
  for (const a of await allBy(grantor, hints, via)) {
    const d = describeAct(a) as { id: string; binding?: string; public: boolean; spec?: string; type?: number };
    if (d.binding === grant && !out.some((x) => x.id === d.id)) out.push({ id: d.id, public: d.public, spec: d.spec, type: d.type });
  }
  return out;
}
