// What counts as a version of an identity's site (website cMIP, "What counts
// as a version", "Verifying"), checked with the core library. The same code
// runs on the gateway's server, on the command line, and in the visitor's
// browser, where the build gives it the browser's core library.

import { Verifier, cborDecode, describeAct, hex, openMedia, workHash } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { decodeSite, type FileEntry, type SiteManifest } from './manifest.ts';
import { PUBLICATION, SITE_SPECS, WITHDRAWAL } from './specs.ts';

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
  /** True only if the publication is a version of the expected identity's site, its manifest checked. */
  ok: boolean;
  version: string;
  /** The identity the version was expected from (the gateway's setting). */
  expected: string;
  /** Who signed it, once the publication was found and opened. */
  signer?: string;
  /** The publication's standing for its signer's identity chain, as the core library judges it. */
  standing?: string;
  /** A withdrawal of the version by its signer, found at the places asked. */
  withdrawn?: string;
  manifest?: SiteManifest;
  /** Where the version's files can be fetched: the places asked, then those the publication names. */
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
 * Open a version (cMIP, "Verifying", steps 1 to 3): fetch the publication,
 * judge it through its signer's identity chain, check that the signer is the
 * identity expected and not a collective, look for a withdrawal, and fetch,
 * open and decode the manifest. Never throws: every reason is in `problems`.
 */
export async function openVersion(version: string, expected: string, hints: string[], via: Via = {}): Promise<Version> {
  const r: Version = { ok: false, version, expected, places: [...hints], problems: [] };
  const fail = (p: string) => (r.problems.push(p), r);
  if (!/^[0-9a-f]{64}$/.test(version)) return fail('the version named is not an act id');

  // 1. The publication.
  const act = await fetchAct(version, hints, via);
  if (!act) return fail(`the version ${version} was not found at ${hints.join(', ')}`);
  let d: Described;
  try {
    d = describeAct(act) as Described;
  } catch (e) {
    return fail(`the version is not a valid act: ${e instanceof Error ? e.message : e}`);
  }
  if (!d.public || !d.payload) return fail('the version is not a public act');
  if (d.spec !== SITE_SPECS.envelope || d.type !== PUBLICATION) return fail('the version is not a publication (Envelope type 0)');
  if (!d.signer) return fail('the version has no signer');
  r.signer = d.signer;
  let media: Map<number, unknown>;
  try {
    media = cborDecode(d.payload) as Map<number, unknown>;
  } catch {
    return fail('the publication does not decode');
  }
  const spec = media.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== SITE_SPECS.site) return fail('the publication is not a site manifest');
  const named = Array.isArray(media.get(6)) ? (media.get(6) as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  r.places = [...hints, ...named.filter((n) => !hints.includes(n))];

  // 2. The signer's chain, the publication's standing, and who the signer is.
  const v = new Verifier(SITE_SPECS.identity);
  try {
    await lookUp(d.signer, r.places, via, v);
  } catch (e) {
    return fail(`the signer's identity was not found: ${e instanceof Error ? e.message : e}`);
  }
  v.add(act);
  r.standing = v.status(version);
  if (d.signer !== expected) fail(`signed by ${d.signer}, not by the identity expected (${expected})`);
  if (r.standing !== 'valid') fail(`the version is ${r.standing}, not valid, for its signer's identity chain`);
  const res = v.resolve(d.signer) as { links: { act: string }[] };
  for (const link of res.links) {
    if (v.lawDeclared(SITE_SPECS.law, d.signer, link.act)) {
      fail("the signer is a collective (its chain declares an agreement): a collective's site counts only once Law draft 7 is approved, under its Envelope lane (website cMIP, rule 3)");
      break;
    }
  }
  const w = await findWithdrawal(version, d.signer, r.places, via, v);
  if (w) {
    r.withdrawn = w;
    fail(`withdrawn by its signer (act ${w})`);
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

/**
 * A withdrawal of the version (Envelope, "Withdrawal"): an Envelope act of
 * type 3 naming it in `objects`, valid, by its signer. Silence proves
 * nothing: a version is a version when none is found where we looked.
 */
async function findWithdrawal(version: string, signer: string, hints: string[], via: Via, v: Verifier): Promise<string | null> {
  for (const h of hints) {
    let after: number | undefined;
    for (;;) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== 'act') continue;
        let d: Described;
        try {
          d = describeAct(it.item) as Described;
        } catch {
          continue;
        }
        if (d.spec !== SITE_SPECS.envelope || d.type !== WITHDRAWAL || d.signer !== signer) continue;
        if (!(d.objects ?? []).some(([chain]) => chain === version)) continue;
        try {
          v.add(it.item);
        } catch {
          continue;
        }
        if (v.status(d.id) === 'valid') return d.id;
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  return null;
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
