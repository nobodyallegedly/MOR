// Keepers (Agreements rules 36 to 44; round 3, part C, item 8): a keeper is
// a notary an agreement names (terms field 3), recording the acts around it
// as they arrive, in its operator's own sequence, and signing each record.
//
// The record's format is the one decided in text (OF21 a and d; Agreements
// draft 16, "Decided in text only"): one act per record, public,
// `{ 0 => [act, signer] }`, Agreements type 2, signed by the keeper's
// operator. The core library still takes each keeper's log as the client
// states it (`keeperLogs`): this file reads the records back into that log.
//
// - Before recording an act, the keeper checks its signer's identity chain
//   at its homes and records any rotation it sees first (rule 40), so a
//   thief's acts after a rotation sit after it.
// - A record counts against a rotation only if it sits before the keeper's
//   own record of that rotation (rule 41): such an act, though disowned,
//   is a visible dispute rather than void.
// - A keeper records act ids and signers, never content (rule 43): it reads
//   only public outsides, and no key is delivered to it for being a keeper.
//
// TEST IDENTITIES ONLY.

import { SPECS, cborDecode, cborEncode, describeAct, hex, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { allBy } from './grant.ts';

/** Agreements type 2: a keeper record. */
export const KEEPER_RECORD = 2;

/** The record's payload (OF21 a, d): `{ 0 => [act, signer] }`. */
export function keeperRecordPayload(act: string, signer: string): Uint8Array {
  return cborEncode(new Map<number, unknown>([[0, [unhex(act), unhex(signer)]]]));
}

/** A record's act and signer; null where the payload is not one. */
export function readKeeperRecord(payload: Uint8Array): { act: string; signer: string } | null {
  try {
    const m = cborDecode(payload) as Map<number, unknown>;
    const x = m.get(0);
    if (!Array.isArray(x) || x.length !== 2 || !(x[0] instanceof Uint8Array) || !(x[1] instanceof Uint8Array)) return null;
    return { act: hex(x[0]), signer: hex(x[1]) };
  } catch {
    return null;
  }
}

type Outside = { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; objects?: [string, string][]; prev?: string };

/**
 * A keeper's log, in its own sequence: the acts its records name, each
 * once, earliest first. The sequence is the operator's own line (each act
 * naming the one before, `prev`), followed from its first record; records
 * off that line follow, in the order a place gave them (a reading, the
 * build's: one device keeps).
 */
export async function keeperLog(operator: string, places: string[], via: Via = {}): Promise<{ act: string; signer: string; record: string }[]> {
  const records = new Map<string, Outside & { rec: { act: string; signer: string } }>();
  for (const a of await allBy(operator, places, via)) {
    const d = describeAct(a) as Outside;
    if (d.signer !== operator || d.spec !== REPO_SPECS.agreements || d.type !== KEEPER_RECORD || !d.payload) continue;
    const rec = readKeeperRecord(d.payload);
    if (rec && !records.has(d.id)) records.set(d.id, { ...d, rec });
  }
  // Follow the line: the record no other record names as `prev` is the latest.
  const byPrev = new Map<string, string>();
  for (const r of records.values()) if (r.prev && records.has(r.prev)) byPrev.set(r.prev, r.id);
  const firsts = [...records.values()].filter((r) => !r.prev || !records.has(r.prev));
  const ordered: string[] = [];
  for (const f of firsts) {
    for (let at: string | undefined = f.id; at && !ordered.includes(at); at = byPrev.get(at)) ordered.push(at);
  }
  const out: { act: string; signer: string; record: string }[] = [];
  for (const id of ordered) {
    const r = records.get(id)!;
    if (!out.some((x) => x.act === r.rec.act)) out.push({ ...r.rec, record: id });
  }
  return out;
}

/** The logs of several keepers, as the core library takes them (`keeperLogs`: operator → acts in order). */
export async function keeperLogs(operators: string[], places: string[], via: Via = {}): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  for (const k of operators) out[k] = (await keeperLog(k, places, via)).map((x) => x.act);
  return out;
}

/**
 * One round of keeping, by the keeper's operator `me`, for a collective:
 * the acts around its agreement, as they are found now (the collective's
 * own public acts; each party's public acts naming one of the collective's
 * agreements in `objects`), each party's rotations recorded before its
 * acts (rule 40). Records what its log does not hold yet; the records made,
 * in order.
 */
export async function keep(me: TestIdentity, a: { collective: string; agreements: string[]; parties: string[]; places: string[]; via?: Via }): Promise<{ act: string; signer: string; record: string; rotation: boolean }[]> {
  const via = a.via ?? {};
  const logged = new Set((await keeperLog(me.id, a.places, via)).map((x) => x.act));
  const made: { act: string; signer: string; record: string; rotation: boolean }[] = [];
  const record = async (act: string, signer: string, rotation: boolean) => {
    if (logged.has(act)) return;
    const r = await me.publish(REPO_SPECS.agreements, KEEPER_RECORD, keeperRecordPayload(act, signer), { public: true, relays: a.places });
    logged.add(act);
    made.push({ act, signer, record: r.id, rotation });
  };
  const versions = new Set(a.agreements);
  const outsides = async (id: string) => {
    let places = a.places;
    try {
      const l = await lookUp(id, a.places, via);
      places = [...new Set([...a.places, ...l.resolution.homes.map((h) => h.hint)])];
    } catch {
      // its homes did not answer: the places given are read
    }
    return (await allBy(id, places, via)).map((x) => describeAct(x) as Outside).filter((d) => d.signer === id);
  };
  for (const who of [a.collective, ...a.parties.filter((p) => p !== a.collective)]) {
    const acts = await outsides(who);
    // Rule 40: its identity chain first, every rotation seen recorded before its other acts.
    for (const d of acts) if (d.spec === SPECS.identity && d.type === 1) await record(d.id, who, true);
    for (const d of acts) {
      if (d.spec === SPECS.identity && d.type === 1) continue;
      if (d.spec === REPO_SPECS.agreements && d.type === KEEPER_RECORD) continue;
      const around = who === a.collective || (d.objects ?? []).some(([o]) => versions.has(o));
      if (around) await record(d.id, who, false);
    }
  }
  return made;
}

/** Whether a keeper's log places `act` before `rotation` (rule 41): a disowned act it shows as a dispute, not a void. */
export function recordedBefore(log: string[], act: string, rotation: string): boolean {
  const x = log.indexOf(act);
  const y = log.indexOf(rotation);
  return x >= 0 && (y < 0 || x < y);
}

/** Every act recorded so far by these keepers, by act: which keepers hold it (for showing). */
export function recordedBy(logs: Record<string, string[]>, act: string): string[] {
  return Object.entries(logs)
    .filter(([, log]) => log.includes(act))
    .map(([k]) => k);
}
