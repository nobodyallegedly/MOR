// Deals (Law rule 45b): plain terms between named people, with no keys of
// their own, and the alarm a seller's client raises when a payment names a
// version of the deal that does not descend from the version it holds
// (F186, client conformance, decided by Nobody, allegedly, 9 October 2026).
// Test identities only.

import { MIPS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { LAW_SPECS } from './law.ts';
import { allBy } from './release.ts';
import { LAW_TYPES, REPO_SPECS } from './specs.ts';

/**
 * A deal's terms (Law type 0): founding terms every party signs (field 4,
 * every party), or a clone of `parent` marked with the clone rule and every
 * party whose voice remains (rule 45b). A clone settling a fork of two
 * complete versions names, beside its one parent, the other branch's
 * latest version it settles (field 26, F186).
 */
export function dealPayload(t: { parties: string[]; text: string; parent?: string; settles?: string }): Uint8Array {
  const m = new Map<number, unknown>([
    [0, t.parties.map(unhex)],
    [1, t.text],
    [2, new Map()],
    // Founding terms: every party signs (rule [0]); a clone: its mark, the
    // clone rule [1] with every party, ascending by hash.
    [4, t.parent ? [[[1], [...t.parties].sort().map(unhex)]] : [0]],
    [5, [0]],
  ]);
  if (t.parent) m.set(11, unhex(t.parent));
  if (t.settles) m.set(26, unhex(t.settles));
  return cborEncode(m);
}

/** What a seller's client says when it raises the alarm (F186). */
export interface SellerAlarm {
  /** "fork": the deal stands forked, or the payment follows another branch; "older": it names an older version. */
  kind: 'fork' | 'older';
  /** The version the payment names, and the version this identity holds. */
  named: string;
  held: string | null;
  /** In plain words, for the seller, before anything else about the payment. */
  words: string[];
}

const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-4)}`;

/**
 * Client conformance (Law rule 45b, F186): given a payment `me` received (a
 * Finance receipt or claim naming the claim it pays under, field 9), read
 * the deal it names from the relays (its versions, and every party's
 * signatures on them) and raise the alarm when the version the payment
 * names does not descend from the version `me` holds: the latest version
 * of that deal `me` signed, as its relays show. Where `me`'s own signatures
 * are on two branches, the fork itself is shown. Null when there is no
 * alarm: no claim named, no deal version, or one descending from what `me`
 * holds.
 */
export async function sellerAlarm(me: string, payment: Uint8Array, hints: string[], via: Via = {}): Promise<SellerAlarm | null> {
  let d: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
  try {
    d = describeAct(payment) as typeof d;
  } catch {
    return null;
  }
  if (d.spec !== MIPS.finance || (d.type !== 2 && d.type !== 3) || !d.payload) return null;
  const claim = (cborDecode(d.payload) as Map<number, unknown>).get(9);
  if (!Array.isArray(claim) || !(claim[1] instanceof Uint8Array)) return null;
  const named = hex(claim[1]);
  const v = new Verifier(SPECS.identity, MIPS.finance, MIPS.law);
  const add = (a: Uint8Array) => {
    try {
      v.add(a);
    } catch {
      // private, or not an act: it cannot count here
    }
  };
  const look = async (id: string) => {
    try {
      await lookUp(id, hints, via, v);
    } catch {
      // not found: its acts cannot count
    }
  };
  const fetched = new Set<string>();
  const parties = new Set<string>([me]);
  // A version and its lineage, fetched by id from the relays.
  const fetchLine = async (start: string) => {
    for (let x: string | null = start; x && !fetched.has(x); ) {
      fetched.add(x);
      let next: string | null = null;
      for (const h of hints) {
        try {
          const a = await relayAt(h, via).getAct(x);
          if (!a) continue;
          const t = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
          if (t.spec !== REPO_SPECS.law || t.type !== LAW_TYPES.terms || !t.payload) break;
          add(a);
          const m = cborDecode(t.payload) as Map<number, unknown>;
          for (const p of (m.get(0) as Uint8Array[]) ?? []) parties.add(hex(p));
          const par = m.get(11);
          next = par instanceof Uint8Array ? hex(par) : null;
          break;
        } catch {
          // away: the next relay
        }
      }
      x = next;
    }
  };
  if (d.signer) await look(d.signer);
  await look(me);
  add(payment);
  await fetchLine(named);
  // The versions `me` signed: its own signature acts, and what they name.
  for (const a of await allBy(me, hints, via)) {
    add(a);
    try {
      const s = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
      if (s.spec === REPO_SPECS.law && s.type === LAW_TYPES.signature && s.payload) {
        const x = (cborDecode(s.payload) as Map<number, unknown>).get(0);
        if (x instanceof Uint8Array) await fetchLine(hex(x));
      }
    } catch {
      // not an act this reads
    }
  }
  // Every party's signatures, so that which versions are complete is known.
  for (const p of parties) {
    if (p === me) continue;
    await look(p);
    for (const a of await allBy(p, hints, via)) add(a);
  }
  type Ag = { parent: string | null; signed: string[]; exists: boolean | null; collective: boolean };
  const ag = (x: string): Ag | null => {
    try {
      return v.lawAgreement(LAW_SPECS, x) as Ag;
    } catch {
      return null;
    }
  };
  const lineage = (x: string): string[] => {
    const out: string[] = [];
    for (let y: string | null = x; y; y = ag(y)?.parent ?? null) out.push(y);
    return out;
  };
  const root = lineage(named).at(-1);
  const a0 = ag(named);
  if (!a0 || a0.collective) return null;
  // The deal stands forked, as the relays show it: the fork itself.
  type Fork = { reference: string; branches: string[][] };
  let fork: Fork | null = null;
  try {
    fork = v.lawDealFork(LAW_SPECS, named) as Fork | null;
  } catch (e) {
    return {
      kind: 'fork',
      named,
      held: null,
      words: [
        `ALARM: this payment names version ${short(named)} of a deal whose versions branch in a way Law does not settle (${e instanceof Error ? e.message : String(e)}). Look at the whole deal with every party before relying on it (Law rule 45b, F186).`,
      ],
    };
  }
  // The latest version of this deal `me` signed that exists.
  const mine = [...fetched].filter((x) => lineage(x).at(-1) === root && ag(x)?.exists === true && ag(x)!.signed.includes(me));
  const held = mine.sort((a, b) => lineage(b).length - lineage(a).length)[0] ?? null;
  if (fork) {
    const branch = fork.branches.find((b) => b.includes(named));
    return {
      kind: 'fork',
      named,
      held,
      words: [
        `ALARM (Law rule 45b, F186): this payment names version ${short(named)} of a deal that stands forked. Every party signed two versions of ${short(fork.reference)}, neither descending from the other: ${fork.branches.map((b) => b.map(short).join(' → ')).join(', and ')}.`,
        `While the fork stands, ${short(fork.reference)} is the reference, and a payment may follow either branch and counts: ${branch ? `this one follows ${branch.map(short).join(' → ')}` : 'this one names the reference'}. The buyer is protected.`,
        'Settle the fork with every party: sign a version that names both branches, beside its one parent the other branch\'s latest version (terms field 26). Settlement is final: the other branch never comes back.',
      ],
    };
  }
  if (!held) return null;
  const alarm = v.lawForkAlarm(LAW_SPECS, d.id, held) as { named: string; held: string; shared: string; fork: boolean; heldLine: string[]; namedLine: string[] } | null;
  if (!alarm) return null;
  return alarm.fork
    ? {
        kind: 'fork',
        named,
        held,
        words: [
          `ALARM (Law rule 45b, F186): this payment names version ${short(named)} of the deal, which does not descend from ${short(held)}, the version this identity holds. The two lines part after ${short(alarm.shared)}: this identity's ${alarm.heldLine.map(short).join(' → ')}, the payment's ${alarm.namedLine.map(short).join(' → ')}.`,
          'The deal may have two branches this identity does not see. Look for the full picture with every party; if both versions are complete, the payment counts under the branch it followed (the buyer is protected), and the fork is settled by a version naming both branches.',
        ],
      }
    : {
        kind: 'older',
        named,
        held,
        words: [
          `ALARM (Law rule 45b, F186): this payment names version ${short(named)} of the deal, an older version than ${short(held)}, the version this identity holds: it does not descend from it. The payer's client followed a version since replaced.`,
        ],
      };
}
