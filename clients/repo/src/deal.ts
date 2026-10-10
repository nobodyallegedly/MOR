// Deals (Agreements rule 45b): plain terms between named people, with no keys of
// their own, and the alarm a seller's client raises when a payment names a
// version of the deal that does not descend from the version it holds
// (F186, client conformance, decided by Nobody, allegedly, 9 October 2026).
// Test identities only.

import { MIPS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, settlementRequestPayload, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS, carryChain } from './agreements.ts';
import { allBy } from './release.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from './specs.ts';

/**
 * A deal's terms (Agreements type 0): founding terms every party signs (field 4,
 * every party), or a clone of `parent` marked with the clone rule and every
 * party whose voice remains (rule 45b). A clone settling a fork names,
 * beside its one parent, every tip it discards (field 26, F186; a list,
 * ascending, since QF3, F190), and is signed by the parties of all the
 * branches (F188, DQ5). `judge`: in founding terms or a clone, the judge of
 * the deal's forks (field 27, QF2), one of its arbitrators or verifiers
 * (`arbitrators`, field 13).
 */
export function dealPayload(t: {
  parties: string[];
  text: string;
  parent?: string;
  settles?: string | string[];
  arbitrators?: string[];
  judge?: string;
}): Uint8Array {
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
  if (t.arbitrators?.length) m.set(13, t.arbitrators.map(unhex));
  const settles = typeof t.settles === 'string' ? [t.settles] : (t.settles ?? []);
  if (settles.length) m.set(26, [...new Set(settles)].sort().map(unhex));
  if (t.judge) m.set(27, unhex(t.judge));
  return cborEncode(m);
}

/** What a seller's client says when it raises the alarm (F186) or a notice (F188, DQ7). */
export interface SellerAlarm {
  /**
   * "fork": the deal stands forked, or the payment follows another branch;
   * "unheld": it names a version this identity has never seen, the hidden
   * fork the alarm exists for (F189, 3); "older": it names an older
   * version, a plain notice, not the alarm (F188, DQ7).
   */
  kind: 'fork' | 'unheld' | 'older';
  /** The version the payment names, and the version this identity holds. */
  named: string;
  held: string | null;
  /** In plain words, for the seller, before anything else about the payment. */
  words: string[];
}

const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-4)}`;

/**
 * Client conformance (Agreements rule 45b, F186): given a payment `me` received (a
 * Money receipt or claim naming the claim it pays under, field 9), read
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
  if (d.spec !== MIPS.money || (d.type !== 2 && d.type !== 3) || !d.payload) return null;
  const claim = (cborDecode(d.payload) as Map<number, unknown>).get(9);
  if (!Array.isArray(claim) || !(claim[0] instanceof Uint8Array) || !(claim[1] instanceof Uint8Array)) return null;
  const agreement = hex(claim[0]);
  const named = hex(claim[1]);
  const v = new Verifier(SPECS.identity, MIPS.money, MIPS.agreements);
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
          if (t.spec !== REPO_SPECS.agreements || t.type !== AGREEMENTS_TYPES.terms || !t.payload) break;
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
  await fetchLine(agreement);
  // The versions `me` signed: its own signature acts, and what they name.
  for (const a of await allBy(me, hints, via)) {
    add(a);
    try {
      const s = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
      if (s.spec === REPO_SPECS.agreements && s.type === AGREEMENTS_TYPES.signature && s.payload) {
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
      return v.agreementsAgreement(AGREEMENTS_SPECS, x) as Ag;
    } catch {
      return null;
    }
  };
  const lineage = (x: string): string[] => {
    const out: string[] = [];
    for (let y: string | null = x; y; y = ag(y)?.parent ?? null) out.push(y);
    return out;
  };
  // F189 (3): a version this identity has never seen, of the deal the
  // payment names, is the hidden fork the alarm exists for.
  const a0 = ag(named);
  const root = (a0 ? lineage(named) : lineage(agreement)).at(-1);
  const top = root ? ag(root) : null;
  if (!top || top.collective) return null;
  // The latest version of this deal `me` signed that exists.
  const mine = [...fetched].filter((x) => lineage(x).at(-1) === root && ag(x)?.exists === true && ag(x)!.signed.includes(me));
  const held = mine.sort((a, b) => lineage(b).length - lineage(a).length)[0] ?? null;
  if (!a0) {
    return {
      kind: 'unheld',
      named,
      held,
      words: [
        `ALARM (Agreements rule 45b, F189): this payment names version ${short(named)} of the deal, a version this identity has never seen${held ? `; the version it holds is ${short(held)}` : ''}.`,
        'Every party may have signed a version this identity was never shown: the deal may have a branch hidden from it. Fetch that version from the payer\'s relays, and look at the whole deal with every party before relying on it.',
      ],
    };
  }
  // The deal stands forked, as the relays show it: the fork itself.
  type Fork = { reference: string; branches: string[][]; tangled: string | null };
  let fork: Fork | null = null;
  try {
    fork = v.agreementsDealFork(AGREEMENTS_SPECS, named) as Fork | null;
  } catch (e) {
    return {
      kind: 'fork',
      named,
      held,
      words: [
        `ALARM: this payment names version ${short(named)} of a deal whose versions branch in a way Agreements do not settle (${e instanceof Error ? e.message : String(e)}). Look at the whole deal with every party before relying on it (Agreements rule 45b, F186).`,
      ],
    };
  }
  if (fork?.tangled) {
    return {
      kind: 'fork',
      named,
      held,
      words: [
        `ALARM (Agreements rule 45b, F188): this payment names version ${short(named)} of a deal whose fork is tangled (${fork.tangled}). The deal stays on ${short(fork.reference)}, the last version every party agreed on: the changes the tangled versions made are lost.`,
        'A buyer who paid under a version every party signed stays protected: this payment counts under the version it names.',
        'Settle the deal cleanly with every party: sign a version that, beside its one parent, names every tip it discards (terms field 26), signed by the parties of every branch, so everyone sees every option and signs the choice (QF3). Where the reference names a judge of forks (terms field 27), a party who signed it may ask that judge instead (DQ8, QF2).',
      ],
    };
  }
  if (fork) {
    const branch = fork.branches.find((b) => b.includes(named));
    return {
      kind: 'fork',
      named,
      held,
      words: [
        `ALARM (Agreements rule 45b, F186): this payment names version ${short(named)} of a deal that stands forked. Every party signed two versions of ${short(fork.reference)}, neither descending from the other: ${fork.branches.map((b) => b.map(short).join(' → ')).join(', and ')}.`,
        `While the fork stands, ${short(fork.reference)} is the reference, and a payment may follow either branch and counts: ${branch ? `this one follows ${branch.map(short).join(' → ')}` : 'this one names the reference'}. The buyer is protected.`,
        'Settle the fork with every party of both branches: sign a version that names both branches, beside its one parent the other branch\'s latest version (terms field 26). Settlement is final: the other branch never comes back, and a version made on it later changes nothing where it cites the settlement; one citing nothing tangles the deal again (QF1). Where the parties cannot agree, a party who signed the reference may ask the judge of forks it names (terms field 27) to settle it (Agreements rule 45b, DQ8, QF2).',
      ],
    };
  }
  if (!held) return null;
  const alarm = v.agreementsForkAlarm(AGREEMENTS_SPECS, d.id, held) as { named: string; held: string; shared: string; kind: 'fork' | 'unheld' | 'older'; heldLine: string[]; namedLine: string[] } | null;
  if (!alarm) return null;
  if (alarm.kind === 'older') {
    return {
      kind: 'older',
      named,
      held,
      words: [
        `NOTICE (Agreements rule 45b, F188): this payment names version ${short(named)} of the deal, an older version than ${short(held)}, the version this identity holds. There is no fork: the payer's client followed an outdated offer, still read as valid.`,
      ],
    };
  }
  return {
    kind: 'fork',
    named,
    held,
    words: [
      `ALARM (Agreements rule 45b, F186): this payment names version ${short(named)} of the deal, which does not descend from ${short(held)}, the version this identity holds. The two lines part after ${short(alarm.shared)}: this identity's ${alarm.heldLine.map(short).join(' → ')}, the payment's ${alarm.namedLine.map(short).join(' → ')}.`,
      'The deal may have, or have had, two branches this identity does not see. Look for the full picture with every party; if both versions are complete and the fork is not settled, the payment counts under the branch it followed (the buyer is protected), and the fork is settled by a version naming both branches.',
    ],
  };
}

/**
 * The founding terms of the deal a version belongs to, following each
 * version's parent (field 11) on the relays. Null where a version is not
 * found there.
 */
export async function dealRoot(version: string, hints: string[], via: Via = {}): Promise<string | null> {
  const seen = new Set<string>();
  for (let x: string = version; !seen.has(x); ) {
    seen.add(x);
    let next: string | null | undefined;
    for (const h of hints) {
      try {
        const a = await relayAt(h, via).getAct(x);
        if (!a) continue;
        const t = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
        if (t.spec !== REPO_SPECS.agreements || t.type !== AGREEMENTS_TYPES.terms || !t.payload) return null;
        const par = (cborDecode(t.payload) as Map<number, unknown>).get(11);
        next = par instanceof Uint8Array ? hex(par) : null;
        break;
      } catch {
        // away: the next relay
      }
    }
    if (next === undefined) return null;
    if (next === null) return x;
    x = next;
  }
  return null;
}

/**
 * Client conformance (Agreements rule 15a with F188, DQ6, decided by Nobody,
 * allegedly, 9 October 2026): one numbering runs across every split a
 * service makes under a deal, on any branch of a fork, from 1. Given the
 * numbers on the splits a holder received from one service under one
 * deal, the numbers missing below the highest: where any is missing,
 * splits are being made where the holder is not shown, and its client
 * raises the alarm.
 */
export function splitGaps(numbers: number[]): number[] {
  const top = Math.max(0, ...numbers);
  const have = new Set(numbers);
  const out: number[] = [];
  for (let n = 1; n <= top; n++) if (!have.has(n)) out.push(n);
  return out;
}

/** What a buyer's client finds before paying under a deal's version (F188). */
export interface OfferCheck {
  /** Whether the version offered is truly the latest in its chain, as the relays show it. */
  current: boolean;
  /** The version in force (while forked or tangled, the reference), if Agreements can name one. */
  inForce: string | null;
  /** In plain words, for the buyer, before paying. */
  words: string[];
}

/**
 * Client conformance, a strong SHOULD (F188, decided by Nobody, allegedly,
 * 9 October 2026: "Find offer, verify that it is truly the last in its
 * chain."): before paying under version `offered` of a deal, a buyer's
 * client finds the offer and verifies that it is the latest in its chain,
 * fetching from the sellers' relays every version the deal's parties
 * signed, and warns where what it shows is outdated. While the deal stands
 * forked, a branch's latest version is current too (the buyer is
 * protected, A4).
 */
export async function offerCheck(offered: string, hints: string[], via: Via = {}): Promise<OfferCheck> {
  const v = new Verifier(SPECS.identity, MIPS.money, MIPS.agreements);
  const add = (a: Uint8Array) => {
    try {
      v.add(a);
    } catch {
      // private, or not an act: it cannot count here
    }
  };
  const fetched = new Set<string>();
  const parties = new Set<string>();
  const fetchLine = async (start: string) => {
    for (let x: string | null = start; x && !fetched.has(x); ) {
      fetched.add(x);
      let next: string | null = null;
      for (const h of hints) {
        try {
          const a = await relayAt(h, via).getAct(x);
          if (!a) continue;
          const t = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
          if (t.spec !== REPO_SPECS.agreements || t.type !== AGREEMENTS_TYPES.terms || !t.payload) break;
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
  await fetchLine(offered);
  if (!fetched.size || !parties.size) return { current: false, inForce: null, words: [`WARNING: the offer's version ${short(offered)} could not be found on ${hints.join(', ')}: it cannot be checked before paying.`] };
  // Every version the parties signed, and their signatures, so that which versions are complete is known.
  for (const p of [...parties]) {
    try {
      await lookUp(p, hints, via, v);
    } catch {
      // not found: its acts cannot count
    }
    for (const a of await allBy(p, hints, via)) {
      add(a);
      try {
        const s = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
        if (s.spec === REPO_SPECS.agreements && s.type === AGREEMENTS_TYPES.signature && s.payload) {
          const x = (cborDecode(s.payload) as Map<number, unknown>).get(0);
          if (x instanceof Uint8Array) await fetchLine(hex(x));
        }
      } catch {
        // not an act this reads
      }
    }
  }
  for (const p of parties) for (const a of await allBy(p, hints, via)) add(a);
  let inForce: string;
  let fork: { reference: string; branches: string[][]; tangled: string | null } | null;
  try {
    inForce = v.agreementsVersionInForce(AGREEMENTS_SPECS, offered) as string;
    fork = v.agreementsDealFork(AGREEMENTS_SPECS, offered) as typeof fork;
  } catch (e) {
    return { current: false, inForce: null, words: [`WARNING: the deal's versions branch in a way Agreements do not settle (${e instanceof Error ? e.message : String(e)}): look at the whole deal before paying.`] };
  }
  const tips = fork && !fork.tangled ? fork.branches.map((b) => b.at(-1)!) : [];
  const exists = (v.agreementsAgreement(AGREEMENTS_SPECS, offered) as { exists: boolean | null }).exists === true;
  const current = exists && (offered === inForce || tips.includes(offered) || (!!fork?.tangled && fork.branches.flat().includes(offered)));
  if (current) {
    return {
      current: true,
      inForce,
      words: [fork ? `The offer's version ${short(offered)} is the latest of its branch: the deal stands forked, and a payment under it counts (the buyer is protected, Agreements rule 45b).` : `The offer's version ${short(offered)} is the latest in its chain.`],
    };
  }
  return {
    current: false,
    inForce,
    words: [
      exists
        ? `WARNING: the offer shown is outdated: version ${short(offered)} has been replaced; the version in force is ${short(inForce)}. Pay under the latest version, or ask the seller (Agreements rules 32a, 45b; F188).`
        : `WARNING: the offer's version ${short(offered)} is not signed by every party: it is no version of the deal yet. The version in force is ${short(inForce)}.`,
    ],
  };
}

/**
 * A party's request that the judge of forks a deal's reference version
 * names (terms field 27, QF2, F190) settle its fork (Agreements type 22, rule 45b;
 * DQ8, decided by Nobody, allegedly, 9 October 2026): the judge acts only
 * once activated by one of the signing parties, by a signed request naming
 * the fork, which its settlement names. Public.
 */
export async function requestSettlement(by: TestIdentity, reference: string, relays: string[]) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.settlementRequest, settlementRequestPayload(reference), { public: true, relays, objects: [[reference, reference]] });
}
