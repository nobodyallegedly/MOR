// Damgar for a collective (round 3; F353, decided by Nobody, allegedly, 18
// and 19 October 2026; Agreements draft 16). A member holding a collective's
// Money area acts for it here with their own key, made as they signed its
// founding and sealed to them at their homes (the member keys cMIP): any of
// their apps opens it, Damgar too. What Damgar signs for the collective is a
// promise to pay (a Money obligation, the collective the debtor), signed with
// that key: within the area's cap, as the constitution writes it (the grant
// limits cMIP, draft 2, area key 6), it counts on that key alone; above it,
// a second holder's key is asked, as a release's signatures are asked, in
// their Dub, Edubba or this Damgar (an act of the collective waiting for
// their key). Every count is Agreements', from what the collective's relays
// and homes hold. Damgar still holds no wallet: paying the promise is done
// as any payment is.
//
// TEST IDENTITIES ONLY.

import { cborDecode, describeAct, hex, readTerms, sha256, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS, obligationPayload } from '../../repo/src/agreements.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { negotiate } from '../../repo/src/proposals.ts';
import { chainFor, collectiveNow, judgeCollective, memberKeyFor, publishAt, readMemberKeys, signAsMember, type ConsentRead, type MemberKey } from '../../grants/src/member.ts';
import { relayAt } from '../../genesis/src/transport.ts';

const MONEY_LAYER = 2;

/** The collective's Money area, as the agreement in force writes it. */
export interface MoneyArea {
  id: number;
  name: string;
  holders: string[];
  number: number;
  /** Where the area names the grant limits cMIP (key 6): above this, one more key. */
  cap: { unit: string; value: number } | null;
}

/** A collective as Damgar acts for it. */
export interface CollectiveHere {
  id: string;
  agreement: string | null;
  area: MoneyArea | null;
  key: MemberKey | null;
  /** Why this member cannot act for it in money, where they cannot. */
  why: string | null;
}

/** The cap a grant limits cMIP's parameters name (key 0, `[unit, value]`), from their CBOR hex. */
function capOf(hexed: string | null | undefined): { unit: string; value: number } | null {
  if (!hexed) return null;
  try {
    const m = cborDecode(unhex(hexed)) as Map<number, unknown>;
    const c = m instanceof Map ? (m.get(0) as unknown[]) : null;
    return Array.isArray(c) && c[0] instanceof Uint8Array && typeof c[1] === 'number' ? { unit: hex(c[0]), value: c[1] } : null;
  } catch {
    return null;
  }
}

async function termsOf(id: string, hints: string[], via: Via): Promise<{ areas: { id: number; name: string; holders: string[]; threshold: number; kinds: { form: string; layer?: number | null; spec?: string | null }[]; limits?: string | null }[] } | null> {
  for (const h of hints) {
    const a = await relayAt(h, via).getAct(id).catch(() => null);
    if (!a) continue;
    const d = describeAct(a) as { payload?: Uint8Array; spec?: string; type?: number };
    if (d.spec !== REPO_SPECS.agreements || d.type !== 0 || !d.payload) return null;
    return readTerms(d.payload, AGREEMENTS_SPECS) as never;
  }
  return null;
}

/** Read a collective for this member: its Money area, and this member's own key for it. */
export async function readCollective(me: TestIdentity, id: string, hints: string[], via: Via): Promise<CollectiveHere> {
  const now = await collectiveNow(id, hints, via);
  if (!now.agreement) return { id, agreement: null, area: null, key: null, why: 'Its agreement in force could not be read from its relays and homes.' };
  const t = await termsOf(now.agreement, hints, via);
  const a = t?.areas.find((x) => x.kinds.some((k) => (k.form === 'layer' && k.layer === MONEY_LAYER) || k.spec === AGREEMENTS_SPECS.money));
  const area: MoneyArea | null = a ? { id: a.id, name: a.name, holders: a.holders, number: a.threshold, cap: capOf(a.limits) } : null;
  const keys = await readMemberKeys(me.id, me.f.encryption.map((e) => unhex(e.secret)), me.f.homes.map((h) => h.hint), via).catch(() => []);
  const key = keys.length ? await memberKeyFor(keys, id, hints, via).catch(() => null) : null;
  let why: string | null = null;
  if (!area) why = 'Its constitution draws no Money area: the collective’s money acts count on its own key, held by its founder’s Edubba.';
  else if (!area.holders.includes(me.id)) why = `You hold no box in its Money area (“${area.name}”): your key does not count there.`;
  else if (!key) why = 'No key of yours for this collective was found sealed to you at your homes: it is made when you sign its founding or a member change.';
  return { id, agreement: now.agreement, area, key, why };
}

/** Whether an amount lies within the area's cap (the grant limits cMIP, 7.2): the same unit, at most its value. */
export const withinCap = (area: MoneyArea, amount: { unit: string; value: number }) => !area.cap || (area.cap.unit === amount.unit && amount.value <= area.cap.value);

/** What a promise from the collective would need, in plain words, before anything is signed. */
export function promiseSay(c: CollectiveHere, me: string, a: { to: string; amount: { unit: string; value: number }; whatFor: string }, names: (id: string) => string): { lines: string[]; above: boolean; others: string[] } {
  const area = c.area!;
  const above = !withinCap(area, a.amount);
  const need = area.number + (above ? 1 : 0);
  const others = area.holders.filter((h) => h !== me);
  const lines = [
    `A promise to pay, by the collective ${names(c.id)}: it owes ${names(a.to)} ${a.amount.value.toLocaleString('en')} (a Money obligation, public, signed with your own key for the collective; F353).`,
    `What for: ${a.whatFor || 'nothing said'}.`,
    `Its Money area, “${area.name}”: ${area.holders.map(names).join(', ')}; ${area.number} key${area.number === 1 ? '' : 's'}${area.cap ? `; above ${area.cap.value.toLocaleString('en')} an act, one more (the grant limits cMIP, draft 2)` : ''}.`,
    above
      ? `It is above the cap: it counts only with ${need} keys. Yours signs it now; ${others.map(names).join(', ')} ${others.length === 1 ? 'is' : 'are'} asked for theirs, in their own app.`
      : need === 1
        ? 'Within the area: your key alone makes it count.'
        : `The area asks ${need} keys: yours signs it now; the others are asked for theirs.`,
    'Damgar holds no wallet: paying the promise is a payment like any other.',
  ];
  return { lines, above, others: need > 1 ? others : [] };
}

/** The digest of exactly what a promise signs. */
export const promiseDigest = (c: CollectiveHere, payload: Uint8Array) => sha256(new Uint8Array([...new TextEncoder().encode(`MOR Damgar collective promise, version 1\n${c.id}\n`), ...payload]));

/** The promise's payload: a Money obligation, the collective the debtor (Money type 1). */
export const promisePayload = (c: CollectiveHere, a: { to: string; amount: { unit: string; value: number }; pointer: string }) => obligationPayload({ debtor: c.id, creditor: a.to, unit: a.amount.unit, value: a.amount.value, pointer: a.pointer });

/**
 * Sign the promise with the member's key, publish it where the collective's
 * acts are, and ask the area's other holders for their key where it needs
 * more than one: each sent a negotiation message naming the act and the
 * collective, sealed to them, as Edubba sends a release to sign.
 */
export async function signPromise(me: TestIdentity, c: CollectiveHere, payload: Uint8Array, ask: string[], text: string, hints: string[], via: Via): Promise<{ act: string; places: string[]; asked: string[]; notAsked: string[] }> {
  const at = await chainFor(c.id, c.key!, hints, via);
  const made = signAsMember(c.id, c.key!, at, { spec: AGREEMENTS_SPECS.money, type: 1, payload, public: true });
  const places = await publishAt([made.act], hints, via);
  if (!places.length) throw new Error('No relay took the promise: nothing counts. Try again.');
  const asked: string[] = [];
  const notAsked: string[] = [];
  for (const h of ask) {
    try {
      const l = await lookUp(h, hints, via);
      const inbox = l.inbox(REPO_SPECS.agreements) ?? l.routes.routes.flatMap((r) => r.hints);
      if (!l.encryptionKey || !inbox?.length) throw new Error('no inbox or encryption key');
      await negotiate(me, { id: h, key: l.encryptionKey, inbox }, { text, refs: [[made.id, c.id], [c.id, c.id]] });
      asked.push(h);
    } catch {
      notAsked.push(h);
    }
  }
  return { act: made.id, places, asked, notAsked };
}

/** Agreements' answer for a promise of the collective, the cap judged here (the grant limits cMIP, draft 2: Damgar implements it). */
export async function standing(c: CollectiveHere, act: string, amount: { unit: string; value: number }, hints: string[], via: Via): Promise<ConsentRead> {
  const area = c.area;
  const verdicts: [string, boolean][] = area?.cap ? [[act, withinCap(area, amount)]] : [];
  return (await judgeCollective(c.id, [act], hints, via, verdicts)).get(act)!;
}
