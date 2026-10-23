// Tracking (F339: "the tracking of modules and cMIPs by pinging at public
// relays ... the tracking of extensions and xtypes"): which cMIPs and
// Modules exist, which public agreements name which cMIPs as extensions,
// and which new act types are defined from core pieces and used. A plain
// look-up, not an aggregator: the relays the person chooses are asked, with
// the filters relays already have (relay transport cMIP, "Following: the
// feed": `spec`, `type`, `signer`); nothing is indexed, kept or published,
// and no cMIP is added. The listing on dubsar.org is one source among any,
// never a registry (Development rule 17).
//
// What is read and checked is the website cMIP's listing code
// (`clients/site/src/listing.ts`), asked with filters: the publications
// (Envelopes type 0, optionally of one signer), Agreements' terms and
// signatures, and each xtype's acts by its spec hash.
//
// Nothing from Node: the web client runs it too.

import { MIRS, SPECS, Verifier, describeAct } from '../../genesis/src/core.ts';
import { holdSequence, lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { KINDS, MIP, readListing, roleWords, type Listed, type Listing } from '../../site/src/listing.ts';
import type { Line } from './shapes.ts';

/** The stated limit, in plain words, said wherever tracking is shown (F339). */
export const LIMIT_SAY = [
  'Ummia sees public agreements only. A sealed agreement’s use of a cMIP stays invisible unless someone publishes it.',
  'It is a plain look-up of the relays you name, asked with the filters relays already have (spec, type, signer). Nothing is indexed or kept: ask again to see what changed. Other relays may hold what these do not.',
  'The listing on dubsar.org reads the relays its page names: one source among any, never a registry. Name those relays here, or any others.',
];

/** A specification found, as the page shows it. */
export interface TrackedSpec {
  hash: string;
  name: string;
  kind: string;
  layer: string;
  role: string[];
  creator: string | null;
  claimed: boolean;
  /** Who published it (the publications found, verified). */
  publishers: string[];
  /** Its publications found, verified, by act id and signer: the creator's first where there is one. */
  publications: { id: string; signer: string }[];
  /** Its text's first line: its own name (Development, Part three, field 9). */
  text: string;
  /** Public agreements naming it as an extension, counted. */
  agreements: number;
  /** Its draft in its line, and the hash of the one before it, where named. */
  draft: number;
  after: string | null;
  otherCreator: boolean;
  releases: { id: string; name: string | null; version: string | null; problem: string | null }[];
  /** For an xtype: public acts of its types found, by type. */
  use: { acts: number; byType: { type: number; name: string; acts: number }[]; notValid: number } | null;
}

export interface Tracked {
  relays: { address: string; read: number; specs: number; problem: string | null; stopped: boolean }[];
  /** Lines of drafts: each line oldest first. */
  lines: TrackedSpec[][];
  xtypes: TrackedSpec[];
  extensions: { hash: string; name: string | null; agreements: number; terms: string[]; layers: string[] | null }[];
  agreements: { terms: number; counted: number; proposed: number; notCounted: number; private: number };
  mips: { root: string; name: string; forks: { hash: string; name: string; creator: string | null; total: number }[] }[];
  /** Every specification found, MIPs included, each once: what Look's feed shows. */
  specs: TrackedSpec[];
  unverified: { id: string; signer: string; problem: string }[];
  limit: string[];
}

const flatten = (f: Listing['mips']['roots'][number]['forks']): { hash: string; name: string; creator: string | null; total: number }[] =>
  f.flatMap((x) => [{ hash: x.listed.hash, name: x.listed.name, creator: x.listed.spec.creator, total: x.total }, ...flatten(x.forks)]);

/** Ask the relays named, with the filters given; never throws for a relay that is away (said). */
export async function track(relays: string[], o: { signer?: string; via?: Via } = {}): Promise<Tracked> {
  const listing = await readListing(
    relays.map((address) => ({ address, name: null })),
    [],
    o.via ?? {},
    { signer: o.signer || undefined },
  );
  const all = new Map<string, Listed>();
  for (const l of listing.lines) for (const d of l.drafts) all.set(d.listed.hash, d.listed);
  for (const x of listing.xtypes) all.set(x.hash, x);
  const inAll = (f: Listing['mips']['roots'][number]['forks']): void => f.forEach((x) => (all.set(x.listed.hash, x.listed), inAll(x.forks)));
  for (const r of listing.mips.roots) (all.set(r.listed.hash, r.listed), inAll(r.forks));
  for (const u of listing.mips.unrooted) inAll(u.forks);
  const shown = (l: Listed, d?: { number: number; after: Listed | null; afterMissing: string | null; otherCreator: boolean }): TrackedSpec => {
    const w = roleWords(l, all);
    return {
      hash: l.hash,
      name: l.name,
      kind: KINDS[l.spec.kind] ?? `kind ${l.spec.kind}`,
      layer: w.layer,
      role: w.role,
      creator: l.spec.creator,
      claimed: l.claimed,
      publishers: [...new Set(l.publications.map((p) => p.signer))],
      publications: l.publications.map((p) => ({ id: p.id, signer: p.signer })),
      text: l.spec.text,
      agreements: listing.extensions.find((x) => x.hash === l.hash)?.agreements.length ?? 0,
      draft: d?.number ?? 1,
      after: d ? (d.after?.hash ?? d.afterMissing) : l.spec.predecessor,
      otherCreator: d?.otherCreator ?? false,
      releases: l.releases.map((r) => ({ id: r.id, name: r.name, version: r.version, problem: r.problem })),
      use: l.use,
    };
  };
  // Every specification found, each once: the lines' drafts, the xtypes, the MIPs and what they fork.
  const every = new Map<string, TrackedSpec>();
  for (const l of listing.lines) for (const d of l.drafts) every.set(d.listed.hash, shown(d.listed, d));
  for (const x of listing.xtypes) if (!every.has(x.hash)) every.set(x.hash, shown(x));
  const walk = (f: Listing['mips']['roots'][number]['forks']) => {
    for (const x of f) {
      if (!every.has(x.listed.hash)) every.set(x.listed.hash, shown(x.listed));
      walk(x.forks);
    }
  };
  for (const r of listing.mips.roots) {
    if (!every.has(r.listed.hash)) every.set(r.listed.hash, shown(r.listed));
    walk(r.forks);
  }
  for (const u of listing.mips.unrooted) walk(u.forks);
  return {
    specs: [...every.values()],
    relays: listing.relays.map((r) => ({ address: r.address, read: r.read, specs: r.specs, problem: r.asked ? r.problem : 'not asked: an address a browser cannot reach', stopped: r.stopped })),
    lines: listing.lines.map((l) => l.drafts.map((d) => shown(d.listed, d))),
    xtypes: listing.xtypes.map((x) => shown(x)),
    extensions: listing.extensions.map((x) => ({ hash: x.hash, name: x.listed?.name ?? null, agreements: x.agreements.length, terms: x.agreements.flatMap((a) => a.terms), layers: x.layers })),
    agreements: { terms: listing.agreements.terms, counted: listing.agreements.counted, proposed: listing.agreements.proposed, notCounted: listing.agreements.notCounted.length, private: listing.agreements.private },
    mips: [
      ...listing.mips.roots.map((r) => ({ root: r.listed.hash, name: r.listed.name, forks: flatten(r.forks) })),
      ...listing.mips.unrooted.map((u) => ({ root: u.hash, name: u.kind === null ? 'not found on these relays' : `a ${KINDS[u.kind] ?? 'specification'}, which no MIP forks`, forks: flatten(u.forks) })),
    ].filter((m) => m.forks.length || m.root),
    unverified: listing.unverified.map((u) => ({ id: u.id, signer: u.signer, problem: u.problem ?? '' })),
    limit: LIMIT_SAY,
  };
}

export { MIP };

/** An act found by a plain look-up of one specification's acts. */
export interface FoundAct {
  id: string;
  signer: string;
  type: number;
  standing: string;
  at: string;
}

/**
 * The public acts of one specification on the relays named, by the feed's
 * own filters (`spec`, and `type` and `signer` where given), each judged
 * through its signer's chain. Private acts cannot be asked for: a relay
 * cannot read their specification (relay transport cMIP).
 */
export async function actsOf(relays: string[], q: { spec: string; type?: number; signer?: string; via?: Via }): Promise<{ acts: FoundAct[]; lines: Line[] }> {
  const via = q.via ?? {};
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const looked = new Map<string, Promise<Lookup>>();
  const acts = new Map<string, FoundAct>();
  const lines: Line[] = [];
  for (const r of relays) {
    let after: number | undefined;
    let read = 0;
    try {
      for (;;) {
        const page = await relayAt(r, via).feed({ spec: q.spec, type: q.type, signer: q.signer || undefined, after });
        for (const it of page.items) {
          if (it.kind !== 'act' || read >= 2000) continue;
          read++;
          const d = describeAct(it.item) as { id: string; signer?: string; type?: number; public: boolean };
          if (!d.signer || acts.has(d.id)) continue;
          let standing = 'unknown';
          try {
            let l = looked.get(d.signer);
            if (!l) looked.set(d.signer, (l = lookUp(d.signer, relays, via, v)));
            await holdSequence(v, d.signer, await l, relays, via);
            v.add(it.item);
            standing = v.status(d.id);
          } catch (e) {
            standing = `not checked: ${e instanceof Error ? e.message : String(e)}`;
          }
          acts.set(d.id, { id: d.id, signer: d.signer, type: d.type ?? 0, standing, at: r });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
      lines.push({ text: `${r}: ${read} act${read === 1 ? '' : 's'} read.` });
    } catch (e) {
      lines.push({ text: `${r}: ${e instanceof Error ? e.message : String(e)}`, tone: 'warn' });
    }
  }
  return { acts: [...acts.values()], lines };
}
