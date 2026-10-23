// A deal between separate people (the round "splits between separate
// people", decided by Nobody, allegedly, 22 October 2026: "Edubba is the
// place"; "with a tip IF there is a split the target is the agreement not the
// act"; the reading, `docs/splits-reading.md`). Shared by Edubba (setting it
// up), Dub (buying and tipping under it), Damgar and the test split service
// (reading it).
//
// In plain words: two or three people agree, in one signed document, who
// owns what share of a work (a protected file, a vow, a plain post), what
// comes off the top for a reposter, and which split service divides each
// payment. The deal has **its own payee**: one more identity, made for the
// deal and held in the proposer's Edubba, whose only job is to be paid. Its
// payee pointer leads to the split service; its grant is the one field 14
// lists. So nobody's own wallet changes: a tip to a person still goes to
// their own pointer (the reading, "The one thing to know first": as the
// texts stand, a deal's payee must point its whole flow at the service).
//
// Precisely (Agreements draft 17):
// - founding terms (type 0, no key grammar: a deal), parties the people and
//   the deal's payee, field 4 and 5 `[0]` (rule 47); one stake (field 7), its
//   object the work, its holders the people by their shares in millionths
//   (rule 9); a split plan (field 8) with the referral role off the top
//   (rule 22) and the rest to the stake; field 14, the deal's payee's grant
//   to the service, naming "this agreement" by null (rule 16; Grant, "A
//   payee's grant in a deal");
// - a vow's deal is two versions (rule 14: "A stake whose object is a vow is
//   held by the vow's signer … in the version that first writes it"): the
//   founding writes the vow's stake wholly to its signer, a clone (field 11,
//   mark `[[1], every party]`, rule 47) shares it;
// - a plain post names the deal in `refs` (Text rule 14 forbids `objects`),
//   and the deal's stake object is the work hash of the post's words.
//
// How an app finds a work's deal (the money messages cMIP, draft 5, 8): from
// a post, the acts its `refs` name: a deal's terms directly (a plain post),
// or an offer whose field 0 names one (a protected file, a vow); the version
// read is the one named. Nothing indexes anything.
//
// TEST IDENTITIES ONLY, regtest only.

import { cborDecode, cborEncode, checkTerms, describeAct, hex, unhex } from '../../genesis/src/core.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS, SPLIT_CMIP } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { termsAt } from './member.ts';

/** What a deal between separate people says, as Edubba writes it. */
export interface DealDraft {
  /** The work's title: the deal's name, the first words of its text. */
  title: string;
  /** What it is a deal for, in words: "a protected recording", "a vow", "a post". */
  what: string;
  /** The people (the proposer first), each with their share in millionths, summing to 1,000,000. */
  shares: [string, number][];
  /** The deal's own payee: a party holding no stake, whose grant field 14 lists. */
  payee: string;
  /** The stake's object: a publication's id, a vow's name, or a post's words' work hash. */
  object: string;
  /** The referral role off the top, in millionths of each payment; 0 for none. */
  referral: number;
  /** The deal's payee's grant to the split service. */
  grant: string;
}

const PARTS = 1_000_000;

/** The deal's words: what everyone signs, in plain words (Agreements rule 4). */
export function dealWords(d: DealDraft, names: (id: string) => string): string {
  const who = d.shares.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ');
  return [
    `“${d.title}”: a deal between ${d.shares.length} people for ${d.what}, shared ${who}.`,
    d.referral ? `Off the top of each payment, ${pct(d.referral)} to whoever reposted it where the buyer found it; the rest to the owners by their shares.` : 'Each payment goes to the owners by their shares.',
    'Every payment for it, a tip included, goes to the deal’s own payee, whose pointer leads to the split service its grant names; the service divides it and pays each owner.',
  ].join(' ');
}

/** A share in millionths, as a percentage in words. */
export function pct(n: number): string {
  const p = n / 10_000;
  return `${Number.isInteger(p) ? p : p.toFixed(4).replace(/0+$/, '')}%`;
}

/** The deal's name, read back from its words (their first quoted words), or null. */
export function dealName(text: string): string | null {
  const m = /^“([^”]{1,200})”/.exec(text);
  return m ? m[1] : null;
}

/** The split plan: the stake, then the referral role off the top (plan key 4), the split cMIP. */
function plan(referral: number): Map<number, unknown> {
  const shares: unknown[] = [[0, 0, PARTS]];
  if (referral) shares.push([1, 'referral', referral]);
  const m = new Map<number, unknown>([
    [0, shares],
    [1, unhex(SPLIT_CMIP)],
  ]);
  if (referral) m.set(4, [1]);
  return m;
}

/** Why the draft cannot be a deal, in plain words; null where it can. */
export function dealProblem(d: Pick<DealDraft, 'shares' | 'referral'>): string | null {
  if (d.shares.length < 2) return 'A deal between people names at least two of them.';
  if (new Set(d.shares.map(([id]) => id)).size !== d.shares.length) return 'Each person is named once.';
  if (d.shares.some(([, n]) => !Number.isSafeInteger(n) || n <= 0)) return 'Each person’s share is above zero.';
  const sum = d.shares.reduce((a, [, n]) => a + n, 0);
  if (sum !== PARTS) return `The shares add up to ${pct(sum)}, not 100%.`;
  if (!Number.isSafeInteger(d.referral) || d.referral < 0 || d.referral >= PARTS) return 'A referral share is from 0 to under 100%.';
  return null;
}

/**
 * The founding terms (Agreements type 0): the parties (the people, then the
 * deal's payee), its words, its stake, its plan, field 14. For a vow
 * (`vowSigner`), the stake is written wholly to the vow's signer (rule 14),
 * shared by the clone. Checked by the core library.
 */
export function dealTermsPayload(d: DealDraft, words: string, vowSigner: string | null = null): Uint8Array {
  const holders: [string, number][] = vowSigner ? [[vowSigner, PARTS]] : d.shares;
  const m = new Map<number, unknown>([
    [0, [...d.shares.map(([id]) => unhex(id)), unhex(d.payee)]],
    [1, words.normalize('NFC')],
    [2, new Map()],
    [4, [0]],
    [5, [0]],
    [7, [[unhex(d.object), holders.map(([h, n]) => [unhex(h), n])]]],
    [8, plan(d.referral)],
    [14, [unhex(d.grant)]],
  ]);
  const payload = cborEncode(m);
  checkTerms(payload, AGREEMENTS_SPECS);
  return payload;
}

/**
 * A vow's deal, its second version (rule 14: the vow's signer shares what
 * she owns by a version she signs; rule 47: a deal's clone completes with
 * every party's signature, its mark the clone rule and every party): the
 * same terms, the stake shared. Its `objects`: `[[founding, founding]]`.
 */
export function dealClonePayload(d: DealDraft, words: string, founding: string): Uint8Array {
  const parties = [...d.shares.map(([id]) => id), d.payee];
  const m = new Map<number, unknown>([
    [0, parties.map(unhex)],
    [1, words.normalize('NFC')],
    [2, new Map()],
    [4, [[[1], [...parties].sort().map(unhex)]]],
    [5, [0]],
    [7, [[unhex(d.object), d.shares.map(([h, n]) => [unhex(h), n])]]],
    [8, plan(d.referral)],
    [11, unhex(founding)],
    [14, [unhex(d.grant)]],
  ]);
  const payload = cborEncode(m);
  checkTerms(payload, AGREEMENTS_SPECS);
  return payload;
}

/** A deal as an app reads it, to buy, tip or show. */
export interface DealRead {
  /** The version named (an offer's field 0, or the terms a post names): what a purchase names, what a tip fulfils. */
  version: string;
  name: string | null;
  text: string;
  /** Every party, the deal's payee included. */
  parties: string[];
  /** The owners: the stake's holders and their shares, in millionths. */
  owners: [string, number][];
  /** The deal's payee: the signer of field 14's grant. */
  payee: string | null;
  /** The split service: field 14's grant's grantee. */
  service: string | null;
  grant: string | null;
  referral: number;
}

type Terms = { parties: string[]; text: string; grammar?: unknown; stakes?: [string | null, [string | null, number][]][]; payeeGrants?: string[] | null; plan?: { shares: { kind: string; role?: string | null; part: number }[] } | null };

/** Read a deal's version at these places: null where it is not a deal's terms (a collective's, or none). */
export async function readDeal(version: string, places: string[], via: Via = {}): Promise<DealRead | null> {
  const t = (await termsAt(version, places, via)) as Terms | null;
  if (!t || t.grammar) return null;
  const grant = t.payeeGrants?.[0] ?? null;
  let payee: string | null = null;
  let service: string | null = null;
  if (grant) {
    for (const h of places) {
      const a = await relayAt(h, via).getAct(grant).catch(() => null);
      if (!a) continue;
      const d = describeAct(a) as { signer?: string; payload?: Uint8Array };
      payee = d.signer ?? null;
      const g = d.payload ? (cborDecode(d.payload) as Map<number, unknown>).get(0) : null;
      service = g instanceof Uint8Array ? hex(g) : null;
      break;
    }
  }
  const owners = (t.stakes?.[0]?.[1] ?? []).filter((x): x is [string, number] => typeof x[0] === 'string');
  const referral = t.plan?.shares.find((s) => s.kind === 'role' && s.role === 'referral')?.part ?? 0;
  return { version, name: dealName(t.text), text: t.text, parties: t.parties, owners, payee, service, grant, referral };
}

/**
 * The deal a post is under, found from what it names (the money messages
 * cMIP, draft 5, 8): a deal's terms in its `refs` (a plain post), or an
 * offer in its `refs` whose field 0 names a deal's version (a protected
 * file, a vow). Null where it names none: a person's own post.
 */
export async function dealOfPost(post: Uint8Array, places: string[], via: Via = {}): Promise<DealRead | null> {
  const d = describeAct(post) as { refs?: string[] };
  for (const id of d.refs ?? []) {
    let act: Uint8Array | null = null;
    for (const h of places) {
      act = await relayAt(h, via).getAct(id).catch(() => null);
      if (act) break;
    }
    if (!act) continue;
    const x = describeAct(act) as { spec?: string; type?: number; payload?: Uint8Array };
    if (x.spec !== REPO_SPECS.agreements || !x.payload) continue;
    if (x.type === AGREEMENTS_TYPES.terms) {
      const r = await readDeal(id, places, via);
      if (r) return r;
    }
    if (x.type === AGREEMENTS_TYPES.offer) {
      const under = (cborDecode(x.payload) as Map<number, unknown>).get(0);
      if (under instanceof Uint8Array) {
        const r = await readDeal(hex(under), places, via);
        if (r) return r;
      }
    }
  }
  return null;
}

/** The one line a buyer or tipper reads before paying (decided: "This work is shared: X, Y, Z. The split service answers for it."). */
export function sharedLine(d: DealRead, names: (id: string) => string): string {
  return `This work is shared: ${d.owners.map(([id, n]) => `${names(id)} (${pct(n)})`).join(', ')}. The split service${d.service ? `, ${names(d.service)},` : ''} answers for it.`;
}
