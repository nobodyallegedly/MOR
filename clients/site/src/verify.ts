// What counts as a version of an identity's site (website cMIP draft 12,
// "What counts as a version", "Verifying"), checked with the core library.
// A version is a bake (Envelopes type 0, "I uploaded this"), never withdrawn
// (F407). A person's site is uploaded by the person; a collective's, which
// has no key, by a member with their own key, naming the collective in the
// bake's objects, and it counts for the collective as Agreements judge an
// act done for it (rule 3, as a release does). The same code
// runs on the gateway's server, on the command line, and in the visitor's
// browser, where the build gives it the browser's core library.

import { MIRS, SPECS, Verifier, cborDecode, describeAct, hex, openMedia, workHash } from '../../genesis/src/core.ts';
import { holdSequence, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { decodeSite, type FileEntry, type SiteManifest } from './manifest.ts';
import { BAKE, SITE_AGREEMENTS_SPECS, SITE_SPECS } from './specs.ts';

interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  spec?: string;
  type?: number;
  objects?: [string, string][];
  payload?: Uint8Array;
}

export interface Version {
  /** True only if the bake is a version of the expected identity's site, its manifest checked. */
  ok: boolean;
  version: string;
  /** The identity the version was expected from (the gateway's setting). */
  expected: string;
  /** Who uploaded it (its signer), once the bake was found and opened. */
  signer?: string;
  /** The bake's standing for its uploader's identity chain, as the core library judges it. */
  standing?: string;
  /** For a collective's site: the collective the bake names (the identity expected), and its members, whose bakes may be later versions. */
  collective?: string;
  members?: string[];
  /** For a collective's site: Agreements' rule, and the members whose acts it counted. */
  rule?: string;
  signers?: string[];
  manifest?: SiteManifest;
  /** Where the version's files can be fetched: the places asked, then those the bake names. */
  places: string[];
  problems: string[];
}

async function fetchAct(id: string, hints: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
      // not reachable: try the next
    }
  }
  return null;
}

/**
 * Open a version (cMIP draft 12, "Verifying", steps 1 to 3): fetch the bake,
 * judge it through its uploader's identity chain, check that it is the
 * identity expected's (a person's own upload; a collective's, uploaded by a
 * member naming it and counting for it under Agreements), and fetch, open
 * and decode the manifest. Never throws: every reason is in `problems`.
 */
export async function openVersion(version: string, expected: string, hints: string[], via: Via = {}): Promise<Version> {
  const r: Version = { ok: false, version, expected, places: [...hints], problems: [] };
  const fail = (p: string) => (r.problems.push(p), r);
  if (!/^[0-9a-f]{64}$/.test(version)) return fail('the version named is not an act id');

  // 1. The bake.
  const act = await fetchAct(version, hints, via);
  if (!act) return fail(`the version ${version} was not found at ${hints.join(', ')}`);
  let d: Described;
  try {
    d = describeAct(act) as Described;
  } catch (e) {
    return fail(`the version is not a valid act: ${e instanceof Error ? e.message : e}`);
  }
  if (!d.public || !d.payload) return fail('the version is not a public act');
  if (d.spec !== SITE_SPECS.envelopes || d.type !== BAKE) return fail('the version is not a bake (Envelopes type 0)');
  if (!d.signer) return fail('the version has no signer');
  r.signer = d.signer;
  let media: Map<number, unknown>;
  try {
    media = cborDecode(d.payload) as Map<number, unknown>;
  } catch {
    return fail('the bake does not decode');
  }
  const spec = media.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== SITE_SPECS.site) return fail('the bake is not a site manifest');
  const named = Array.isArray(media.get(6)) ? (media.get(6) as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  r.places = [...hints, ...named.filter((n) => !hints.includes(n))];

  // 2. The uploader's chain, the bake's standing, and whose site it is.
  // Every client holds the Envelopes and Text hashes, and decodes their acts strictly (F295, Fable's E5).
  const named0 = d.objects?.[0]?.[0];
  const forCollective = named0 && named0 === expected && d.signer !== expected ? expected : null;
  const v = forCollective
    ? new Verifier(SITE_SPECS.identity, MIRS.money, MIRS.agreements, SPECS.envelopes, SPECS.text)
    : new Verifier(SITE_SPECS.identity, undefined, undefined, SPECS.envelopes, SPECS.text);
  try {
    // F298: the uploader's sequence too, before judging the version.
    await holdSequence(v, d.signer, await lookUp(d.signer, r.places, via, v), r.places, via);
  } catch (e) {
    return fail(`the signer's identity was not found: ${e instanceof Error ? e.message : e}`);
  }
  if (forCollective) {
    try {
      await lookUp(forCollective, r.places, via, v);
    } catch (e) {
      return fail(`the collective it names was not found: ${e instanceof Error ? e.message : e}`);
    }
  }
  v.add(act);
  r.standing = v.status(version);
  if (r.standing !== 'valid') fail(`the version is ${r.standing}, not valid, for its signer's identity chain`);
  if (forCollective) {
    r.collective = forCollective;
    await countsForCollective(r, v, version, forCollective, via);
  } else if (d.signer !== expected) {
    fail(`signed by ${d.signer}, not by the identity expected (${expected})`);
  } else if (named0) {
    // An act naming a chain in its objects is done for that identity (a collective, Agreements rule 58), not as its uploader's own.
    fail(`uploaded for ${named0}, which it names in its objects: not a version of its uploader's own site (website cMIP draft 12, rule 2)`);
  } else {
    // Rule 2: a person's site is uploaded by the person. A collective has no key and uploads nothing itself (Agreements rule 56).
    const res = v.resolve(d.signer) as { links: { act: string }[] };
    for (const link of res.links) {
      if (v.agreementsDeclared(SITE_AGREEMENTS_SPECS, d.signer, link.act)) {
        fail("the signer is a collective (its chain declares an agreement): a collective's site is uploaded by a member naming it (website cMIP draft 12, rule 2)");
        break;
      }
    }
  }

  // 3. The manifest.
  const work = media.get(1);
  const locked = media.get(2);
  const size = media.get(3);
  const nonce = media.get(4);
  const key = media.get(5);
  if (!(key instanceof Uint8Array)) return fail('the manifest is locked: its key is not public');
  if (!(work instanceof Uint8Array) || !(locked instanceof Uint8Array) || typeof size !== 'number' || !(nonce instanceof Uint8Array)) {
    return fail('the publication does not describe its manifest');
  }
  const bytes = await fetchMedia(hex(locked), r.places, via);
  if (!bytes) return fail('the manifest was not found');
  try {
    const plain = openMedia(bytes, key, nonce);
    if (workHash(plain) !== hex(work) || plain.length !== size) return fail('the manifest does not match its work hash or size');
    r.manifest = decodeSite(plain);
  } catch (e) {
    return fail(`the manifest: ${e instanceof Error ? e.message : e}`);
  }
  r.ok = r.problems.length === 0;
  return r;
}

/** Every act a relay holds signed by `signer`, page by page. */
async function allBy(signer: string, hints: string[], via: Via): Promise<Uint8Array[]> {
  const out: Uint8Array[] = [];
  for (const h of hints) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ signer, after });
        for (const it of page.items) if (it.kind === 'act') out.push(it.item);
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that relay is away: the others may hold them
    }
  }
  return out;
}

const addAll = (v: Verifier, acts: Uint8Array[]) => {
  for (const a of acts) {
    try {
      v.add(a);
    } catch {
      // a private act, or malformed: it proves nothing here
    }
  }
};

/**
 * Rule 3 for a collective's site (website cMIP draft 12; release manifest
 * cMIP draft 5, rule 3): the agreements the collective declared, their
 * parties' chains and acts (their signature acts, their records, the
 * uploader's own), then Agreements' answer for the bake as an act done for
 * the collective: the rule reaching it (an area within the Envelopes layer
 * naming bakes, else the Envelopes layer's rule) met by the uploader and the
 * members whose signature acts name it.
 */
async function countsForCollective(r: Version, v: Verifier, version: string, collective: string, via: Via): Promise<void> {
  const fail = (p: string) => void r.problems.push(p);
  const res = v.resolve(collective) as { links: { act: string }[] };
  const agreements = new Set<string>();
  for (const link of res.links) {
    const a = v.agreementsDeclared(SITE_AGREEMENTS_SPECS, collective, link.act);
    if (a) agreements.add(a);
  }
  if (!agreements.size) return fail(`it names ${collective}, which declares no agreement: not a collective, and not its uploader`);
  const parties = new Set<string>();
  const seen = new Set<string>();
  const queue = [...agreements];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const t = await fetchAct(id, r.places, via);
    if (!t) continue; // Agreements will say what is missing
    try {
      v.add(t);
      const p = cborDecode((describeAct(t) as Described).payload!) as Map<number, unknown>;
      for (const x of (p.get(0) as Uint8Array[]) ?? []) parties.add(hex(x));
      if (p.get(11) instanceof Uint8Array) queue.push(hex(p.get(11) as Uint8Array));
    } catch {
      // malformed: Agreements will refuse it
    }
  }
  r.members = [...parties];
  for (const party of parties) {
    try {
      await lookUp(party, r.places, via, v);
    } catch {
      // that member's chain was not found: their acts cannot count
    }
    addAll(v, await allBy(party, r.places, via));
  }
  let consent: { kind: string; reason?: string; areas: { name: string; frozen: boolean; needed: number; signers: string[]; met: boolean }[]; met: boolean };
  try {
    consent = v.agreementsConsent(SITE_AGREEMENTS_SPECS, version);
  } catch (e) {
    return fail(`Agreements: ${e instanceof Error ? e.message : e}`);
  }
  r.signers = consent.areas.flatMap((a) => a.signers);
  const area = consent.areas[0];
  if (consent.kind === 'areas' && area) r.rule = area.frozen ? `the ${area.name} area, which has no holder left` : `any ${area.needed} of the ${area.name} area's holders`;
  else if (consent.kind === 'no-area') r.rule = "the uploading member's own act";
  if (consent.kind !== 'areas' && consent.kind !== 'no-area') return fail(`Agreements count it as no act of the collective ${collective}: ${consent.reason ?? consent.kind}`);
  if (!consent.met) fail(`it does not count for the collective yet: Agreements ask for ${r.rule ?? 'more signatures'}, and ${r.signers.length === 1 ? '1 member' : `${r.signers.length} members`} counted at the places asked (website cMIP draft 12, rule 3)`);
}

async function fetchMedia(lockedHash: string, hints: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of hints) {
    try {
      const b = await relayAt(h, via).getMedia(lockedHash);
      if (b) return b;
    } catch {
      // try the next
    }
  }
  return null;
}

/** Whether bytes, from wherever they came, are the file the manifest names (step 4). */
export function matches(entry: FileEntry, bytes: Uint8Array): boolean {
  return bytes.length === entry.size && workHash(bytes) === entry.work;
}

/** A file fetched from relays by its locked hash, opened and checked (step 4); null if no place has it right. */
export async function fetchFile(entry: FileEntry, places: string[], via: Via = {}): Promise<Uint8Array | null> {
  const locked = await fetchMedia(entry.locked, places, via);
  if (!locked) return null;
  try {
    const plain = openMedia(locked, entry.key, entry.nonce);
    return matches(entry, plain) ? plain : null;
  } catch {
    return null;
  }
}
