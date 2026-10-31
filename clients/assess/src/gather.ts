// What the relays show of an agreement, every fact a verdict of the core
// library: its terms' exact bytes, who signed, whether it exists, the version
// of the deal in force or its fork, and what is still owed. The acts are
// fetched here and handed to the core's verifier; nothing is decided here.
// "As far as the relays asked show" (the connector's reading 2): a relay
// that holds less shows less.

import { MIRS, SPECS, Verifier, cborDecode, describeAct, hex } from '../../genesis/src/core.ts';
import { readTag } from '../../barebone/src/tag.ts';
import { readPublicationPayload, type PublicationContext } from './publication.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { allBy } from '../../repo/src/release.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { list, type Line, type Names } from '../../collective/src/explain.ts';
import type { Found } from './assess.ts';

interface Described {
  id: string;
  signer?: string;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

/** An agreement as the relays hold it: its terms' exact payload, and what the core says of it. */
export interface Gathered {
  id: string;
  payload: Uint8Array;
  found: Found;
}

/** The first relay holding act `id`, or null. */
async function fetchAct(id: string, hints: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
      // away: the next relay
    }
  }
  return null;
}

/** A split service's open obligations under this agreement's line, as the core's `agreementsServiceAccount` returns them. */
export interface ServiceAccount {
  service: string;
  unsplit: [payment: string, claim: boolean, receiver: string, agreement: string, unit: string, value: number][];
  unpaid: [split: string, payout: number, receiver: string, agreement: string, amount: number, received: number][];
}

/** A split service's open obligations under any version of `line`, in plain words (Agreements rule 30). */
export function owedWords(a: ServiceAccount, line: Set<string>, names: Names): Line[] {
  const out: Line[] = [];
  for (const [payment, , receiver, agreement, , value] of a.unsplit) {
    if (!line.has(agreement)) continue;
    out.push({ text: `${names(a.service)}, the split service, received ${value} for ${names(receiver)} (payment ${payment.slice(0, 8)}…) and has published no split of it: an open obligation (Agreements rule 30).`, tone: 'warn' });
  }
  for (const [split, payout, receiver, agreement, amount, received] of a.unpaid) {
    if (!line.has(agreement)) continue;
    out.push({ text: `${names(a.service)} owes ${names(receiver)} ${amount - received} of payout ${payout} of split ${split.slice(0, 8)}…${received ? ` (${received} received)` : ''}: no receipt discharges it (Agreements rules 23, 30).`, tone: 'warn' });
  }
  return out;
}

/**
 * Fetch agreement `id` from the relays `hints`, with its earlier versions,
 * every act its parties published (their signatures, later versions);
 * hand them to the core library's
 * verifier and ask it. Throws if no relay holds `id` as public terms.
 */
export async function gather(id: string, hints: string[], via: Via = {}, names: Names = (h) => h): Promise<Gathered> {
  const act = await fetchAct(id, hints, via);
  if (!act) throw new Error(`No relay asked holds act ${id} (${list(hints)}).`);
  const d = describeAct(act) as Described;
  if (d.id !== id) throw new Error(`The act fetched is not ${id}.`);
  if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms) throw new Error(`Act ${id} is not terms (Agreements type 0): there is no agreement to assess.`);
  if (!d.payload) throw new Error(`Act ${id} is private: its terms cannot be read here.`);
  const payload = d.payload;

  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const add = (a: Uint8Array) => {
    try {
      v.add(a);
    } catch {
      // private, or not an act: it cannot count here
    }
  };
  const looked = new Set<string>();
  const look = async (who: string) => {
    if (looked.has(who)) return;
    looked.add(who);
    try {
      await lookUp(who, hints, via, v);
    } catch {
      // not an identity the relays know (an agreement as a party): its acts cannot count
    }
    for (const a of await allBy(who, hints, via)) add(a);
  };

  // The line: this version and its parents, by field 11, and every party of each.
  const line = new Set<string>();
  const parties = new Set<string>();
  const fetchLine = async (start: string) => {
    for (let x: string | null = start; x && !line.has(x); ) {
      const a = x === id ? act : await fetchAct(x, hints, via);
      if (!a) break;
      const t = describeAct(a) as Described;
      if (t.spec !== REPO_SPECS.agreements || t.type !== AGREEMENTS_TYPES.terms || !t.payload) break;
      line.add(x);
      add(a);
      const m = cborDecode(t.payload) as Map<number, unknown>;
      for (const p of (m.get(0) as Uint8Array[]) ?? []) parties.add(hex(p));
      const par = m.get(11);
      x = par instanceof Uint8Array ? hex(par) : null;
    }
  };
  await fetchLine(id);
  if (d.signer) await look(d.signer);
  for (const p of [...parties]) await look(p);
  // Later versions the parties signed: their lines too, and their parties.
  for (const p of [...parties]) {
    for (const a of await allBy(p, hints, via)) {
      try {
        const s = describeAct(a) as Described;
        if (s.spec === REPO_SPECS.agreements && s.type === AGREEMENTS_TYPES.signature && s.payload) {
          const x = (cborDecode(s.payload) as Map<number, unknown>).get(0);
          if (x instanceof Uint8Array) await fetchLine(hex(x));
        }
      } catch {
        // not an act this reads
      }
    }
  }
  for (const p of [...parties]) await look(p);

  const ag = v.agreementsAgreement(AGREEMENTS_SPECS, id) as { signed: string[]; exists: boolean | null; invalid: string | null; collective: string | null };
  const found: Found = { at: hints, signed: ag.signed, exists: ag.exists ?? null, invalid: ag.invalid ?? null, inForce: null, fork: null, owed: [] };

  const terms = cborDecode(payload) as Map<number, unknown>;
  const collective = terms.has(12) ? ((v.agreementsCollectiveOf(AGREEMENTS_SPECS, id) as string | null) ?? null) : null;
  if (!terms.has(12)) {
    try {
      found.inForce = v.agreementsVersionInForce(AGREEMENTS_SPECS, id) as string;
      found.fork = (v.agreementsDealFork(AGREEMENTS_SPECS, id) as Found['fork']) ?? null;
    } catch (e) {
      found.owed.push({ text: `Which version of the deal is in force cannot be said: ${e instanceof Error ? e.message : String(e)}`, tone: 'warn' });
    }
  } else if (collective) {
    await look(collective);
    const owes = v.agreementsOwes(AGREEMENTS_SPECS, collective) as string[];
    for (const o of owes) found.owed.push({ text: `The collective owes under obligation ${o.slice(0, 8)}…, not yet paid or released by its creditor (Agreements rule 92).`, tone: 'warn' });
    const back = v.agreementsOwedBack(AGREEMENTS_SPECS, collective) as { payment: string; to: string; value: number; unknown?: boolean }[];
    for (const b of back)
      found.owed.push({
        text: b.unknown
          ? `Whether the collective owes ${b.value} back for payment ${b.payment.slice(0, 8)}… is unknown: it rests on a receipt or claim with no rail answer read here (S7e). It still blocks a closing.`
          : `The collective owes ${b.value} back for payment ${b.payment.slice(0, 8)}…, to ${names(b.to)} (Agreements rule 93).`,
        tone: 'warn',
      });
  }
  return { id, payload, found };
}

/** A publication as the relays hold it: its exact payload, and what the tool needs to read it (`PublicationContext`), every verdict the core's. */
export interface GatheredPublication {
  id: string;
  payload: Uint8Array;
  context: PublicationContext;
}

/**
 * Fetch publication `id` from the relays `hints`, with the ownership
 * agreement it names (its line), and every act its parties published
 * (their signatures, its later versions, its price tags); hand them to the
 * core library's verifier and ask it whether it counts, who has not signed,
 * its latest versions and the tags that count under it, and the ownership
 * agreement's latest version (`agreementsPublication`,
 * `agreementsPublicationTip`). Throws if no relay holds `id` as a public
 * publication.
 */
export async function gatherPublication(id: string, hints: string[], via: Via = {}): Promise<GatheredPublication> {
  const act = await fetchAct(id, hints, via);
  if (!act) throw new Error(`No relay asked holds act ${id} (${list(hints)}).`);
  const d = describeAct(act) as Described;
  if (d.id !== id) throw new Error(`The act fetched is not ${id}.`);
  if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.publication) throw new Error(`Act ${id} is not a publication (Agreements type 6).`);
  if (!d.payload) throw new Error(`Act ${id} is private: it cannot be read here.`);
  const fields = readPublicationPayload(d.payload);

  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const held = new Map<string, Uint8Array>();
  const add = (a: Uint8Array) => {
    try {
      held.set((describeAct(a) as Described).id, a);
      v.add(a);
    } catch {
      // private, or not an act: it cannot count here
    }
  };
  add(act);
  const looked = new Set<string>();
  const look = async (who: string) => {
    if (!who || looked.has(who)) return;
    looked.add(who);
    try {
      await lookUp(who, hints, via, v);
    } catch {
      // not an identity the relays know: its acts cannot count
    }
    for (const a of await allBy(who, hints, via)) add(a);
  };
  // The ownership agreement it names, and each of its parties.
  const parties = new Set<string>([d.signer ?? '', ...fields.partners.map((p) => p.identity), fields.service, ...fields.backups, ...(fields.designated ? [fields.designated] : [])]);
  if (fields.owners) {
    const o = await fetchAct(fields.owners, hints, via);
    if (o) {
      add(o);
      const t = describeAct(o) as Described;
      if (t.payload) for (const p of ((cborDecode(t.payload) as Map<number, unknown>).get(0) as Uint8Array[]) ?? []) parties.add(hex(p));
    }
  }
  for (const p of parties) await look(p);
  // A collective's members sign for it: their acts too.
  for (const p of [...parties]) {
    for (const a of held.values()) {
      const t = describeAct(a) as Described;
      if (t.signer === p && t.spec === REPO_SPECS.agreements && t.type === AGREEMENTS_TYPES.terms && t.payload) {
        for (const m of ((cborDecode(t.payload) as Map<number, unknown>).get(0) as Uint8Array[]) ?? []) await look(hex(m));
      }
    }
  }

  const pub = v.agreementsPublication(AGREEMENTS_SPECS, id) as { first: string; drafter: string; counts: boolean; unsigned: string[]; problems: string[]; latest: string[]; ends: boolean };
  let tip: { latest: string[]; tags: string[]; owners: string | null; ownersLatest: string | null } = { latest: pub.latest, tags: [], owners: null, ownersLatest: null };
  try {
    tip = v.agreementsPublicationTip(AGREEMENTS_SPECS, pub.first) as typeof tip;
  } catch {
    // its tip cannot be read: the version held is shown
  }
  const tags = tip.tags.map((t) => (held.get(t) ? readTag(held.get(t)!) : null)).filter((t): t is NonNullable<typeof t> => !!t);
  const ownersAct = tip.ownersLatest ? held.get(tip.ownersLatest) : fields.owners ? held.get(fields.owners) : undefined;
  const owners = ownersAct ? ((describeAct(ownersAct) as Described).payload ?? null) : null;
  return {
    id,
    payload: d.payload,
    context: {
      drafter: pub.drafter,
      owners,
      tags: tags.map((t) => ({ id: t.id, price: t.price, payee: t.payee, signer: t.signer })),
      found: { at: hints, counts: pub.counts, unsigned: pub.unsigned, problems: pub.problems, latest: tip.latest.length ? tip.latest : pub.latest, ends: pub.ends },
    },
  };
}

/** Whether act `id` at the relays is a publication (Agreements type 6); null where no relay holds it. */
export async function isPublication(id: string, hints: string[], via: Via = {}): Promise<boolean | null> {
  const act = await fetchAct(id, hints, via);
  if (!act) return null;
  const d = describeAct(act) as Described;
  return d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.publication;
}
