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
// Precisely (Agreements draft 17, redesigned at F407): a deal is three acts,
// each saying one thing.
// - A claim (Agreements type 3, `claimPayload`): the work's hash bound to its
//   creators (rule 7), opened by the proposer, completed by the others'
//   signature acts.
// - The work's ownership agreement (`dealTermsPayload`): terms targeting the
//   claim (field 33, `[0, claim]`), parties the people, field 4 and 5 `[0]`
//   (rule 47), one stake (field 7, `[+ [holder, share]]`, rule 9). It carries
//   no split plan, no split service, no fees and no payee grant (fields 8,
//   14, 28, 29 are withdrawn): ownership only.
// - A publication (Agreements type 6, `dealPublicationPayload`): what is
//   sold, the ownership agreement as its owners (field 1, by its founding
//   version, the act naming it `[agreement, agreement]` in its objects), the
//   split service (field 3) that receives every payment and pays everyone,
//   the split plan (field 4) with the referral role off the top (rule 22).
//   Every party signs it: the owners' side (the agreement, by every party,
//   rule 15), the split service. Its price is a price tag (Money type 5)
//   naming it, signed by the split service. It replaces the standing offer
//   (the old `AGREEMENTS_TYPES.offer`), and the deal's own payee and its
//   grant are gone: the split service is paid directly.
// - a vow's deal is two versions of the ownership agreement (rule 14: "An
//   ownership agreement whose target is a claim on a vow's name gives the
//   vow's signer the whole stake in its founding version"): the founding
//   writes the stake wholly to the vow's signer, a clone (field 11, mark
//   `[[1], every party]`, rule 47) shares it;
// - a plain post names the deal in `refs` (Text rule 14 allows no other
//   objects): the ownership agreement, or its publication.
//
// How an app finds a work's deal: from a post, the acts its `refs` name: an
// ownership agreement on a claim directly, or a publication whose field 1
// names one; the version read is the one named. Nothing indexes anything.
//
// TEST IDENTITIES ONLY, regtest only.

import { cborDecode, cborEncode, checkTerms, describeAct, hex, publicationPayload, unhex } from '../../genesis/src/core.ts';
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
  /** The claim the ownership agreement targets (Agreements type 3, terms field 33 `[0, claim]`). */
  claim: string;
  /** The referral role off the top, in millionths of each payment; 0 for none. A publication's plan carries it. */
  referral: number;
  /** The split service the publication names (field 3): it receives every payment and pays everyone. */
  service: string;
}

const PARTS = 1_000_000;

/** The deal's words: what everyone signs, in plain words (Agreements rule 4). */
export function dealWords(d: DealDraft, names: (id: string) => string): string {
  const who = d.shares.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ');
  return [
    `“${d.title}”: a deal between ${d.shares.length} people for ${d.what}, shared ${who}.`,
    d.referral ? `Off the top of each payment, ${pct(d.referral)} to whoever reposted it where the buyer found it; the rest to the owners by their shares.` : 'Each payment goes to the owners by their shares.',
    `Every payment for it, a tip included, goes to the split service its publication names, ${names(d.service)}, which divides it and pays each owner.`,
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

/** The split plan a deal's publication carries (field 4): the referral role off the top, if any; the rest is the owners' line; the split cMIP. */
function plan(referral: number) {
  return { shares: referral ? [{ role: 'referral', part: referral }] : [], cmip: SPLIT_CMIP };
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

/** A claim (Agreements type 3): the work's hash bound to its creators, ascending (rule 7). The proposer opens it; every other creator completes it by a signature act naming it. */
export function claimPayload(work: string, creators: string[]): Uint8Array {
  return cborEncode(new Map<number, unknown>([[0, unhex(work)], [1, [...new Set(creators)].sort().map(unhex)]]));
}

/**
 * The work's ownership agreement (Agreements type 0, terms field 33
 * `[0, claim]`): the parties (the people), its words, its one stake. For a
 * vow (`vowSigner`), the stake is written wholly to the vow's signer (rule
 * 14), shared by the clone. No split plan, no split service: a publication
 * carries them. Checked by the core library.
 */
export function dealTermsPayload(d: DealDraft, words: string, vowSigner: string | null = null): Uint8Array {
  const holders: [string, number][] = vowSigner ? [[vowSigner, PARTS]] : d.shares;
  const m = new Map<number, unknown>([
    [0, d.shares.map(([id]) => unhex(id))],
    [1, words.normalize('NFC')],
    [2, new Map()],
    [4, [0]],
    [5, [0]],
    [7, holders.map(([h, n]) => [unhex(h), n])],
    [33, [0, unhex(d.claim)]],
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
  const parties = d.shares.map(([id]) => id);
  const m = new Map<number, unknown>([
    [0, parties.map(unhex)],
    [1, words.normalize('NFC')],
    [2, new Map()],
    [4, [[[1], [...parties].sort().map(unhex)]]],
    [5, [0]],
    [7, d.shares.map(([h, n]) => [unhex(h), n])],
    [11, unhex(founding)],
    [33, [0, unhex(d.claim)]],
  ]);
  const payload = cborEncode(m);
  checkTerms(payload, AGREEMENTS_SPECS);
  return payload;
}

/** What a deal's publication sells: bakes by act id, or a vow by its name. */
export type Sold = { bake: string } | { vow: string };

/**
 * The deal's publication (Agreements type 6): what it sells, its owners the
 * ownership agreement (by its founding version), the split service, the
 * plan with the referral off the top. Signed by the drafter, then by the
 * agreement's parties and the split service (rule 11). Its act names
 * `[agreement, agreement]` in its objects (`dealPublicationObjects`).
 * Checked by the core library as it is encoded.
 */
export function dealPublicationPayload(d: DealDraft, agreement: string, sold: Sold[], words?: string): { type: number; payload: Uint8Array } {
  return publicationPayload({ sold, owners: agreement, service: d.service, plan: plan(d.referral), partners: [], ...(words ? { words: words.normalize('NFC') } : {}) }) as { type: number; payload: Uint8Array };
}

/** The objects a deal's publication names: its ownership agreement, as `[agreement, agreement]`. */
export const dealPublicationObjects = (agreement: string): [string, string][] => [[agreement, agreement]];

/** A deal as an app reads it, to buy, tip or show. */
export interface DealRead {
  /** The ownership agreement's version named: what a purchase's receipt names (field 9), what a tip fulfils. */
  version: string;
  name: string | null;
  text: string;
  /** Every party of the ownership agreement. */
  parties: string[];
  /** The owners: the stake's holders and their shares, in millionths. */
  owners: [string, number][];
  /** The claim it targets (field 33). */
  claim: string | null;
  /** The publication it was found through, if any. */
  publication: string | null;
  /** Who is paid under it: the publication's split service (rule 16), the payee of its price tag; null with no publication. */
  payee: string | null;
  /** The split service (publication field 3); the same as `payee`. */
  service: string | null;
  /** The referral role off the top in the publication's plan, in millionths. */
  referral: number;
}

type Terms = { parties: string[]; text: string; grammar?: unknown; target?: [string, string | null] | null; stakes?: [string | null, [string | null, number][]][] };

/** A publication's split service and referral share, read from its payload (fields 1, 3, 4). */
export function dealPublicationRead(payload: Uint8Array): { owners: string | null; service: string | null; referral: number } {
  const m = cborDecode(payload) as Map<number, unknown>;
  const owners = m.get(1);
  const service = m.get(3);
  const plan = m.get(4);
  let referral = 0;
  const shares = plan instanceof Map ? plan.get(0) : null;
  if (Array.isArray(shares)) {
    for (const s of shares) {
      if (Array.isArray(s) && s.includes('referral')) {
        const n = s.at(-1);
        if (typeof n === 'number') referral = n;
      }
    }
  }
  return { owners: owners instanceof Uint8Array ? hex(owners) : null, service: service instanceof Uint8Array ? hex(service) : null, referral };
}

async function actAt(id: string, places: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of places) {
    const a = await relayAt(h, via).getAct(id).catch(() => null);
    if (a) return a;
  }
  return null;
}

/**
 * Read a deal's version at these places: null where it is not a work's
 * ownership agreement (a collective's, or none). With `publication`, the
 * split service and referral are read from it.
 */
export async function readDeal(version: string, places: string[], via: Via = {}, publication: string | null = null): Promise<DealRead | null> {
  const t = (await termsAt(version, places, via)) as Terms | null;
  if (!t || t.grammar || t.target?.[0] !== 'claim') return null;
  let service: string | null = null;
  let referral = 0;
  if (publication) {
    const a = await actAt(publication, places, via);
    const d = a ? (describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array }) : null;
    if (d?.payload && d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.publication) ({ service, referral } = dealPublicationRead(d.payload));
  }
  const owners = (t.stakes?.[0]?.[1] ?? []).filter((x): x is [string, number] => typeof x[0] === 'string');
  return { version, name: dealName(t.text), text: t.text, parties: t.parties, owners, claim: t.target?.[1] ?? null, publication, payee: service, service, referral };
}

/**
 * The deal a post is under, found from what it names: a work's ownership
 * agreement in its `refs`, or a publication in its `refs` whose field 1
 * names one (a protected file, a vow). Null where it names none: a
 * person's own post.
 */
export async function dealOfPost(post: Uint8Array, places: string[], via: Via = {}): Promise<DealRead | null> {
  const d = describeAct(post) as { refs?: (string | [string, string])[] };
  for (const ref of d.refs ?? []) {
    const id = Array.isArray(ref) ? ref[0] : ref;
    const act = await actAt(id, places, via);
    if (!act) continue;
    const x = describeAct(act) as { spec?: string; type?: number; payload?: Uint8Array };
    if (x.spec !== REPO_SPECS.agreements || !x.payload) continue;
    if (x.type === AGREEMENTS_TYPES.terms) {
      const r = await readDeal(id, places, via);
      if (r) return r;
    }
    if (x.type === AGREEMENTS_TYPES.publication) {
      const { owners } = dealPublicationRead(x.payload);
      if (owners) {
        const r = await readDeal(owners, places, via, id);
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
