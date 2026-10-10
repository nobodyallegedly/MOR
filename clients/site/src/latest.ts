// Later versions of a site (website cMIP draft 2, "Later versions"). MOR has
// no clock, so "latest" is read from the versions themselves: each names the
// one before it, so from a version one knows, the later ones are those that
// name it, then those that name them, and so on, each a version itself
// (signed by the same identity, valid, not withdrawn where we looked). Two
// versions naming the same one are a fork: following stops before it, and
// says so. The same code runs on the gateway's server, which follows a
// publisher's latest version, and in the visitor's browser, where the
// display client says when a newer version exists.

import { cborDecode, describeAct, hex, openMedia, workHash } from '../../genesis/src/core.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { decodeSite } from './manifest.ts';
import { PUBLICATION, SITE_SPECS } from './specs.ts';
import { openVersion, type Version } from './verify.ts';

export interface Later {
  /** The latest version reached: `from` itself when none later was found. */
  latest: Version;
  /** Every version after `from`, oldest first, ending with `latest`. */
  after: Version[];
  /** Where following stopped at a fork: the versions naming `latest`, each valid. */
  fork: string[];
}

interface Candidate {
  id: string;
  previous: string | null;
}

/**
 * The site publications by `signer` that the relays hold, each with the
 * version it names as previous, read from its manifest. Nothing here is
 * judged yet: a candidate counts only once `openVersion` has checked it.
 */
async function candidates(signer: string, places: string[], via: Via): Promise<Candidate[]> {
  const found = new Map<string, Candidate>();
  for (const h of places) {
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
        let d: { id: string; signer?: string; public: boolean; spec?: string; type?: number; payload?: Uint8Array };
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (found.has(d.id) || d.signer !== signer || !d.public || !d.payload) continue;
        if (d.spec !== SITE_SPECS.envelopes || d.type !== PUBLICATION) continue;
        const previous = await previousOf(d.payload, places, via);
        if (previous !== undefined) found.set(d.id, { id: d.id, previous });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  return [...found.values()];
}

/** The previous version a site publication's manifest names; undefined if it is not a site or cannot be read. */
async function previousOf(payload: Uint8Array, places: string[], via: Via): Promise<string | null | undefined> {
  try {
    const media = cborDecode(payload) as Map<number, unknown>;
    const spec = media.get(0);
    if (!(spec instanceof Uint8Array) || hex(spec) !== SITE_SPECS.site) return undefined;
    const [work, locked, size, nonce, key] = [1, 2, 3, 4, 5].map((k) => media.get(k));
    if (!(locked instanceof Uint8Array) || !(key instanceof Uint8Array) || !(nonce instanceof Uint8Array) || !(work instanceof Uint8Array)) return undefined;
    for (const h of places) {
      let bytes: Uint8Array | null = null;
      try {
        bytes = await relayAt(h, via).getMedia(hex(locked));
      } catch {
        continue;
      }
      if (!bytes) continue;
      const plain = openMedia(bytes, key, nonce);
      if (workHash(plain) !== hex(work) || plain.length !== size) return undefined;
      return decodeSite(plain).previous;
    }
  } catch {
    // not a readable site manifest
  }
  return undefined;
}

/**
 * Follow a site from a version that verified, `from`, to the latest version
 * that names it through an unbroken line of versions, each checked in full
 * (cMIP, "What counts as a version"). Never throws.
 */
export async function findLater(from: Version, via: Via = {}): Promise<Later> {
  const r: Later = { latest: from, after: [], fork: [] };
  if (!from.ok || !from.signer) return r;
  const all = await candidates(from.signer, from.places, via);
  const seen = new Set([from.version]);
  for (;;) {
    const named = all.filter((c) => c.previous === r.latest.version && !seen.has(c.id));
    const valid: Version[] = [];
    for (const c of named) {
      seen.add(c.id);
      const v = await openVersion(c.id, from.expected, from.places, via);
      if (v.ok) valid.push(v);
    }
    if (valid.length === 1) {
      r.latest = valid[0];
      r.after.push(valid[0]);
      continue;
    }
    if (valid.length > 1) r.fork = valid.map((v) => v.version).sort();
    return r;
  }
}
