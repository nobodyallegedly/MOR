// A listing of the specifications published on the relays a page names, as
// its `mor-listing` names them (website cMIP draft 9, rule 13c; F288; draft
// 10: the use of xtypes, and code released read from "implements"). One
// listing among any: it reads, checks and shows; it decides nothing and
// refuses nothing (Development rule 17, "No core registry").
//
// How it reads: each relay named is asked for everything it serves (relay
// transport cMIP, "Following: the feed", with no filter). A specification
// is a public publication (Envelopes type 0) whose media spec is the
// Development MIR's (Development, Part three: "a public act ... whose media
// is the specification's content"; draft 9, F290: "Its publication names
// the Development MIR's spec hash as its media spec"). Each one found is checked in full: its
// signer's identity chain looked up from its homes and the publication
// judged through it by the core library; its content fetched, opened and
// matched against its work hash and size; decoded strictly as Development's
// `spec`; its spec hash computed. One that fails any of these is shown as
// not verified, with the reason, and nothing it says is shown.
//
// Its first purpose (F288, Nobody, allegedly: "What really matters for MOR2
// is the tracking of extensions, cMIPs and modules are a nice side
// effect"): the extensions agreements name. An extension is a cMIP an
// agreement names in its terms, field 15, for work the core did not foresee
// (Development rule 19). From the same relays: every public terms act
// (Agreements type 0) and every public signature act (type 1), each judged
// through its signer's chain; an agreement counts once the core library says
// it exists (every party signed, a deal or founding terms) or, a
// collective's clone, is ready; its versions (field 11) count once. For each
// cMIP named, how many agreements name it, the layers the work touches (its
// specification's field 10, beside Development, where the specification is
// listed), and those agreements' public terms. Private agreements cannot be
// read, so they are not counted, and the listing says so.
//
// What it shows of each, from the specification's own fields only: its name
// (the first line of its text), its kind, the layer and task it fills
// (field 2, by the MIR the task names), an xtype (field 3, act types,
// filling no task), the layers it declares for use as an extension (field
// 10), the cMIP a Module works under (field 5), a rail Module's kind (field
// 11), and field 12, a proof-of-delivery checker, the field that serves
// discovery; its creator (field 1), and whether the creator published it
// (Development rule 3: otherwise "unclaimed by that creator"); its drafts in
// order, by the predecessor each names (field 8), saying where a successor's
// creator differs from its predecessor's (rule 25) and where two name the
// same one; and code released for it: a release (release manifest cMIP)
// whose manifest names the specification's publication in "implements"
// (draft 3, field 6), read first; for a release whose manifest has no such
// field (every release before draft 3), one whose publication names the
// specification's publication among its references; checked through its
// signer's chain either way.
//
// And the use of each xtype listed (a cMIP defining act types and filling no
// task, Development rule 18): the public acts of its types found on the
// relays read, each judged through its signer's chain, counted by type.
// Private acts are not counted: which specification a private act belongs
// to cannot be read from outside, and the listing says so.

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, checkText, describeAct, hex, openMedia, workHash } from '../../genesis/src/core.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { sha256 } from '@noble/hashes/sha2.js';
import { relayAddress } from './settings.ts';
import { PUBLICATION, RELEASE_MANIFEST } from './specs.ts';

/** Agreements act types a listing reads: terms and signatures. */
const AGREEMENTS_TERMS = 0;
const AGREEMENTS_SIGNATURE = 1;

/** A relay a listing reads, with the page's word for it. */
export interface ListedRelay {
  address: string;
  /** The page's name for it, or null. */
  name: string | null;
}

/** What was read at one relay named. */
export interface RelayLine extends ListedRelay {
  /** False for an address a browser cannot reach (not https), not asked. */
  asked: boolean;
  /** Why it could not be read, if so. */
  problem: string | null;
  /** Acts read there, and of those, publications of specifications. */
  read: number;
  specs: number;
  /** Set when it holds more than a listing reads of one relay. */
  stopped: boolean;
  /** Private acts and sealed containers read there, which a listing cannot open: private agreements among them are not counted. */
  private: number;
  /** Public terms (Agreements type 0) read there. */
  terms: number;
}

/** Development's specification kinds (Part three, field 0). */
export const KINDS = ['cMIP', 'Module', 'unit', 'media type', 'MIR', 'signature scheme'] as const;

/** The six layers, by the MIR whose spec hash a task names (test values until the freeze). */
export const LAYERS: Record<string, string> = {
  [MIRS.identity]: 'Identity',
  [MIRS.text]: 'Text',
  [MIRS.envelopes]: 'Envelopes',
  [MIRS.money]: 'Money',
  [MIRS.agreements]: 'Agreements',
  [MIRS.development]: 'Development',
};

/** Field 10's layer numbers (Development, "Layers an extension acts on"). */
export const EXTENSION_LAYERS = ['Identity', 'Envelopes and Text', 'Money', 'Agreements'];

/** The tasks the core defines (Development, "The tasks the core defines"): number, MIR, name. */
export const TASKS: Record<number, [layer: string, name: string]> = {
  1: ['Identity', 'Identity proofs and credentials'],
  2: ['Identity', 'Naming'],
  3: ['Identity', 'Outside link proofs'],
  4: ['Text', 'Text format'],
  5: ['Envelopes', 'Media interpretation'],
  6: ['Money', 'Payment'],
  7: ['Money', 'Conversion'],
  8: ['Agreements', 'Split'],
  9: ['Agreements', 'Condition evaluation'],
  10: ['Agreements', 'Time reference'],
  11: ['Envelopes', 'Anchoring'],
  12: ['Agreements', 'Grant limits'],
  13: ['Agreements', 'Work claims'],
  14: ['Agreements', 'Absence proof'],
};

/** A rail Module's kind (field 11). */
export const RAIL_KINDS = ['a request rail', 'a push rail binding the commitment', 'a push rail binding nothing'];

/** A specification's content, decoded (Development, Part three). */
export interface Spec {
  kind: number;
  creator: string | null;
  /** Field 2: [MIR spec hash, task number]. */
  tasks: [string, number][];
  /** Field 3: act types it defines. */
  types: { type: number; name: string }[];
  dependencies: string[];
  /** Field 5: the cMIP a Module implements. */
  implements: string | null;
  rules: number;
  fee: boolean;
  /** Field 8: the specification it names as its predecessor. */
  predecessor: string | null;
  text: string;
  /** Field 10: layers it acts on as an extension. */
  layers: number[] | null;
  /** Field 11: a rail Module's kind. */
  rail: number | null;
  /** Field 12: a proof-of-delivery checker. */
  checker: boolean;
}

/** A release naming a specification's publication (release manifest cMIP). */
export interface Release {
  id: string;
  signer: string;
  /** The release's name and version label, from its manifest, when it could be read. */
  name: string | null;
  version: string | null;
  /** Set when it is not shown as verified, saying why. */
  problem: string | null;
  /** How it names the specification: its manifest's "implements" (release manifest cMIP draft 3), or, for a release without one, a reference from its publication. */
  by: 'implements' | 'reference';
}

/** The use of an xtype: the public acts of its types found on the relays read. */
export interface Use {
  /** Public acts of its types, valid for their signers' chains. */
  acts: number;
  /** The same, by act type, in the order its specification defines them. */
  byType: { type: number; name: string; acts: number }[];
  /** Public acts of its types found that are not valid for their signers' chains: not counted. */
  notValid: number;
}

/** One publication of a specification found at the relays read. */
export interface Found {
  /** The publication's act id. */
  id: string;
  /** The identity the act names as its signer: a claim until `problem` is null. */
  signer: string;
  /** Set when it is not shown as verified, saying why; nothing it says is then shown. */
  problem: string | null;
  /** Its spec hash and content, once verified. */
  hash: string | null;
  spec: Spec | null;
}

/** A specification, by its spec hash: every verified publication of it found. */
export interface Listed {
  hash: string;
  spec: Spec;
  /** Its name: the first line of its text. */
  name: string;
  /** The publications of it found, verified; the first by its creator where there is one. */
  publications: Found[];
  /** Whether its creator (field 1) published it (Development rule 3). */
  claimed: boolean;
  /** Releases naming one of its publications. */
  releases: Release[];
  /** For an xtype (act types, no task): its use, counted; null for anything else. */
  use: Use | null;
}

/** A line of drafts: a specification and every one naming it as predecessor, and on. */
export interface Line {
  drafts: Draft[];
  /** The newest draft: the last in order. */
  newest: Listed;
}

export interface Draft {
  listed: Listed;
  /** Its place in the line: 1 for a specification naming no predecessor found here. */
  number: number;
  /** Its predecessor, found here, or the hash it names when not found here. */
  after: Listed | null;
  afterMissing: string | null;
  /** Set when its creator differs from its predecessor's (Development rule 25). */
  otherCreator: boolean;
  /** Other specifications naming the same predecessor (a fork in the line). */
  siblings: string[];
}

/** An agreement naming extensions: its public terms found, by version. */
export interface NamingAgreement {
  /** Its first version found: the terms its versions clone, back as far as found. */
  agreement: string;
  /** Its versions found that count and name the extension, by act id. */
  terms: string[];
}

/** A cMIP agreements name as an extension (Agreements terms field 15; Development rule 19). */
export interface Extension {
  hash: string;
  /** Its specification, where listed here; null otherwise. */
  listed: Listed | null;
  /** The agreements naming it, counted. */
  agreements: NamingAgreement[];
  /** The layers the work touches, from its field 10 beside Development; null where its specification is not listed. */
  layers: string[] | null;
}

/** What was read of agreements. */
export interface AgreementsRead {
  /** Public terms found, valid for their signers' chains. */
  terms: number;
  /** Agreements counted: they exist (every party signed), or a collective's clone is ready. */
  counted: number;
  /** Public terms not yet signed by every party: proposals, not counted. */
  proposed: number;
  /** Public terms that could not be verified, or that the core library finds invalid: not counted. */
  notCounted: { id: string; why: string }[];
  /** Private acts and sealed containers read, which cannot be opened: private agreements are not counted. */
  private: number;
}

export interface Listing {
  relays: RelayLine[];
  /** The extensions agreements name, most named first: the listing's first purpose (F288). */
  extensions: Extension[];
  agreements: AgreementsRead;
  lines: Line[];
  /** Publications of specifications that could not be verified. */
  unverified: Found[];
  /** The xtypes listed, most used first (each a line's draft: every draft is its own specification, counted on its own). */
  xtypes: Listed[];
}

/** The most acts a listing reads of one relay (a reading, website cMIP draft 9, rule 13c). */
export const LISTING_READ = 5000;

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));
const bytes32 = (x: unknown): x is Uint8Array => x instanceof Uint8Array && x.length === 32;

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** `tagged_hash("MOR/spec", content)` (Development, "Spec hash"; core `hash.rs`). */
export function specHash(content: Uint8Array): string {
  const tag = sha256(new TextEncoder().encode('MOR/spec'));
  return hex(sha256(concat(tag, tag, content)));
}

/**
 * Decode a specification's content strictly (Development, Part three):
 * known keys only, each of its kind; field 9, canonical text; a creator
 * for every kind but a MIR; field 10 ascending, from 0 to 3. Throws saying why.
 */
export function decodeSpec(content: Uint8Array): Spec {
  let m: unknown;
  try {
    m = cborDecode(content);
  } catch (e) {
    throw new Error(`its content is not CBOR: ${message(e)}`);
  }
  if (!(m instanceof Map)) throw new Error('its content is not a map');
  for (const k of m.keys()) if (typeof k !== 'number' || !Number.isInteger(k) || k < 0 || k > 12) throw new Error(`its content has a key Development does not define (${String(k)})`);
  const kind = m.get(0);
  if (typeof kind !== 'number' || !Number.isInteger(kind) || kind < 0 || kind >= KINDS.length) throw new Error('its kind (field 0) is not one Development defines');
  const creator = m.get(1);
  if (creator !== undefined && !bytes32(creator)) throw new Error('its creator (field 1) is not an identity hash');
  if (kind !== 4 && creator === undefined) throw new Error('it names no creator (field 1), which every kind but a MIR must');
  const list = (k: number): unknown[] => {
    const v = m.get(k);
    if (v === undefined) return [];
    if (!Array.isArray(v) || !v.length) throw new Error(`field ${k} is not a list of at least one`);
    return v;
  };
  const tasks = list(2).map((t) => {
    if (!Array.isArray(t) || t.length !== 2 || !bytes32(t[0]) || typeof t[1] !== 'number') throw new Error('a task (field 2) is not [MIR, number]');
    return [hex(t[0]), t[1]] as [string, number];
  });
  const types = list(3).map((t) => {
    if (!Array.isArray(t) || t.length !== 3 || typeof t[0] !== 'number' || typeof t[1] !== 'string' || typeof t[2] !== 'string') throw new Error('an act type (field 3) is not [type, name, schema]');
    return { type: t[0], name: t[1] };
  });
  const dependencies = list(4).map((d) => {
    if (!bytes32(d)) throw new Error('a dependency (field 4) is not a hash');
    return hex(d);
  });
  const impl = m.get(5);
  if (impl !== undefined && !bytes32(impl)) throw new Error('field 5 (implements) is not a hash');
  const rules = list(6).length;
  const fee = m.get(7);
  if (fee !== undefined && !Array.isArray(fee)) throw new Error('its fee (field 7) is not a list');
  const pred = m.get(8);
  if (pred !== undefined && !bytes32(pred)) throw new Error('its predecessor (field 8) is not a hash');
  const text = m.get(9);
  if (typeof text !== 'string') throw new Error('it holds no text (field 9)');
  try {
    checkText(text);
  } catch (e) {
    throw new Error(`its text is not canonical text: ${message(e)}`);
  }
  let layers: number[] | null = null;
  if (m.has(10)) {
    const l = list(10);
    if (!l.every((x, i) => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= 3 && (i === 0 || x > (l[i - 1] as number)))) {
      throw new Error('its layers (field 10) are not ascending, from 0 to 3');
    }
    layers = l as number[];
  }
  const rail = m.get(11);
  if (rail !== undefined && (typeof rail !== 'number' || !Number.isInteger(rail) || rail < 0 || rail > 2)) throw new Error('its rail kind (field 11) is not 0, 1 or 2');
  const checker = m.get(12);
  if (checker !== undefined && checker !== true) throw new Error('field 12 is not true');
  // Canonical: the same bytes again once decoded, so one specification has one hash.
  if (hex(cborEncode(m)) !== hex(content)) throw new Error('its content is not in canonical encoding');
  return {
    kind,
    creator: creator ? hex(creator) : null,
    tasks,
    types,
    dependencies,
    implements: impl ? hex(impl) : null,
    rules,
    fee: fee !== undefined,
    predecessor: pred ? hex(pred) : null,
    text,
    layers,
    rail: rail ?? null,
    checker: checker === true,
  };
}

/** An xtype, as the listing names one (Development rule 18): it defines act types and fills no task. */
export const isXtype = (s: Spec): boolean => s.types.length > 0 && s.tasks.length === 0;

/** A specification's name: the first line of its text that holds a letter, its leading "#" and spaces removed. */
export function nameOf(text: string): string {
  const line = text.split('\n').map((l) => l.replace(/^#+\s*/, '').trim()).find((l) => /\p{L}/u.test(l)) ?? '(no name)';
  return line.length > 100 ? `${line.slice(0, 99)}…` : line;
}

interface Described {
  id: string;
  signer?: string;
  objects?: [string, string][];
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  refs?: string[];
}

interface Media {
  spec: string;
  work: Uint8Array;
  locked: Uint8Array;
  size: number;
  nonce: Uint8Array;
  key: Uint8Array | null;
  places: string[];
}

/** A publication's media fields (Envelopes, "Media"), or null when it describes none. */
function mediaOf(d: Described): Media | null {
  if (!d.public || !d.payload || d.type !== PUBLICATION || d.spec !== SPECS.envelopes) return null;
  let m: Map<number, unknown>;
  try {
    m = cborDecode(d.payload) as Map<number, unknown>;
  } catch {
    return null;
  }
  if (!(m instanceof Map)) return null;
  const [spec, work, locked, size, nonce, key, places] = [0, 1, 2, 3, 4, 5, 6].map((k) => m.get(k));
  if (!bytes32(spec) || !(work instanceof Uint8Array) || !(locked instanceof Uint8Array) || typeof size !== 'number' || !(nonce instanceof Uint8Array)) return null;
  return {
    spec: hex(spec),
    work,
    locked,
    size,
    nonce,
    key: key instanceof Uint8Array ? key : null,
    places: Array.isArray(places) ? places.filter((p): p is string => typeof p === 'string') : [],
  };
}

/** One verifier for the whole listing: each signer looked up once, every act judged with everything found. */
class Judge {
  readonly v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
  private looked = new Map<string, Promise<Lookup>>();
  constructor(
    private places: string[],
    private via: Via,
  ) {}
  lookUp(identity: string): Promise<Lookup> {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, this.places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  /** Why the act is not valid for its signer's chain, or null when it is. */
  async problem(act: Uint8Array, id: string, signer: string): Promise<string | null> {
    try {
      await this.lookUp(signer);
    } catch (e) {
      return `its signer's identity chain could not be looked up: ${message(e)}`;
    }
    try {
      this.v.add(act);
    } catch (e) {
      return `the act is not valid: ${message(e)}`;
    }
    const s = this.v.status(id);
    return s === 'valid' ? null : `its standing is “${s}”, not valid, for its signer's identity chain`;
  }
}

/** Fetch a media object by its locked hash, open it, and check its work hash and size; null when no place has it right. */
async function openAt(m: Media, places: string[], via: Via): Promise<Uint8Array | null> {
  if (!m.key) return null;
  for (const h of places) {
    try {
      const locked = await relayAt(h, via).getMedia(hex(m.locked));
      if (!locked) continue;
      const plain = openMedia(locked, m.key, m.nonce);
      if (plain.length === m.size && workHash(plain) === hex(m.work)) return plain;
    } catch {
      // try the next
    }
  }
  return null;
}

/** Everything a relay serves, up to `LISTING_READ` acts, described. */
async function readRelay(line: RelayLine, via: Via, into: Map<string, { d: Described; act: Uint8Array }>): Promise<void> {
  let after: number | undefined;
  try {
    for (;;) {
      const page = await relayAt(line.address, via).feed({ after });
      for (const it of page.items) {
        if (line.read >= LISTING_READ) {
          line.stopped = true;
          return;
        }
        line.read++;
        if (it.kind !== 'act') {
          line.private++;
          continue;
        }
        let d: Described;
        try {
          d = describeAct(it.item) as Described;
        } catch {
          continue;
        }
        if (!d.public) line.private++;
        else if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TERMS) line.terms++;
        if (!into.has(d.id)) into.set(d.id, { d, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  } catch (e) {
    line.problem = message(e);
  }
}

/**
 * The listing of the relays named: every specification found there, each
 * checked, grouped into lines of drafts. Never throws: what could not be
 * read or verified is said, relay by relay and publication by publication.
 */
export async function readListing(relays: ListedRelay[], gatewayRelays: string[], via: Via = {}): Promise<Listing> {
  const lines: RelayLine[] = relays.map((r) => ({ ...r, asked: relayAddress(r.address) !== null, problem: null, read: 0, specs: 0, stopped: false, private: 0, terms: 0 }));
  const asked = lines.filter((l) => l.asked).map((l) => relayAddress(l.address)!);
  for (const l of lines) if (l.asked) l.address = relayAddress(l.address)!;
  const found = new Map<string, { d: Described; act: Uint8Array }>();
  const at = new Map<string, string>();
  for (const l of lines.filter((x) => x.asked)) {
    const before = new Set(found.keys());
    await readRelay(l, via, found);
    for (const id of found.keys()) if (!before.has(id)) at.set(id, l.address);
  }
  // Places to look up signers and fetch content: the relays named, then the gateway's.
  const places = [...new Set([...asked, ...gatewayRelays])];
  const judge = new Judge(places, via);

  const pubs: Found[] = [];
  const releases: { d: Described; act: Uint8Array; m: Media }[] = [];
  for (const { d, act } of found.values()) {
    const m = mediaOf(d);
    if (!m) continue;
    if (m.spec === RELEASE_MANIFEST) {
      releases.push({ d, act, m });
      continue;
    }
    if (m.spec !== MIRS.development) continue;
    const l = lines.find((x) => x.address === at.get(d.id));
    if (l) l.specs++;
    pubs.push({ id: d.id, signer: d.signer ?? '', problem: null, hash: null, spec: null });
  }
  await Promise.all(
    pubs.map(async (p) => {
      const { d, act } = found.get(p.id)!;
      const m = mediaOf(d)!;
      if (!d.signer) return void (p.problem = 'it names no signer');
      const bad = await judge.problem(act, d.id, d.signer);
      if (bad) return void (p.problem = bad);
      if (!m.key) return void (p.problem = 'its content is locked: its key is not public');
      const content = await openAt(m, [...places, ...m.places.map(relayAddress).filter((x): x is string => !!x)], via);
      if (!content) return void (p.problem = 'its content was not found, or does not match its work hash and size');
      try {
        p.spec = decodeSpec(content);
      } catch (e) {
        return void (p.problem = `not a specification as Development defines one: ${message(e)}`);
      }
      p.hash = specHash(content);
    }),
  );

  // By spec hash: the same specification, published by several, is one.
  const byHash = new Map<string, Listed>();
  for (const p of pubs.filter((x) => !x.problem)) {
    let l = byHash.get(p.hash!);
    if (!l) {
      l = { hash: p.hash!, spec: p.spec!, name: nameOf(p.spec!.text), publications: [], claimed: false, releases: [], use: null };
      byHash.set(p.hash!, l);
    }
    l.publications.push(p);
  }
  for (const l of byHash.values()) {
    l.claimed = l.spec.creator !== null && l.publications.some((p) => p.signer === l.spec.creator);
    l.publications.sort((a, b) => Number(b.signer === l.spec.creator) - Number(a.signer === l.spec.creator) || (a.id < b.id ? -1 : 1));
  }

  // Code released: a release naming one of a specification's publications, checked through its signer's chain.
  // Its manifest's "implements" first (release manifest cMIP draft 3); without one, its publication's references.
  const pubOf = new Map<string, Listed>();
  for (const l of byHash.values()) for (const p of l.publications) pubOf.set(p.id, l);
  const listedBy = (ids: string[]) => [...new Set(ids.map((r) => pubOf.get(r)).filter((x): x is Listed => !!x))];
  await Promise.all(
    releases.map(async ({ d, act, m }) => {
      if (!d.signer) return;
      const fallback = listedBy(d.refs ?? []);
      if (!pubOf.size) return;
      const bad = await judge.problem(act, d.id, d.signer);
      const plain = bad ? null : await openAt(m, [...places, ...m.places.map(relayAddress).filter((x): x is string => !!x)], via);
      let man: Map<number, unknown> | null = null;
      try {
        const x = plain ? cborDecode(plain) : null;
        man = x instanceof Map && typeof x.get(0) === 'string' && typeof x.get(1) === 'string' ? (x as Map<number, unknown>) : null;
      } catch {
        man = null;
      }
      const impl = man?.get(6);
      const implemented = Array.isArray(impl) && impl.length && impl.every(bytes32) ? (impl as Uint8Array[]).map((h) => hex(h)) : null;
      const named = implemented ? listedBy(implemented) : fallback;
      if (!named.length) return;
      const r: Release = { id: d.id, signer: d.signer, name: null, version: null, problem: bad, by: implemented ? 'implements' : 'reference' };
      if (!r.problem) {
        if (man) {
          r.name = man.get(0) as string;
          r.version = man.get(1) as string;
        } else r.problem = plain ? 'its manifest does not read as one' : 'its manifest was not found, or does not read as one';
      }
      for (const l of named) l.releases.push(r);
    }),
  );
  for (const l of byHash.values()) l.releases.sort((a, b) => Number(!!a.problem) - Number(!!b.problem) || (a.id < b.id ? -1 : 1));

  const { extensions, agreements } = await readExtensions(found, byHash, judge, lines.reduce((n, l) => n + l.private, 0));
  const xtypes = await countUse(found, byHash, judge);
  return { relays: lines, extensions, agreements, lines: linesOf([...byHash.values()]), unverified: pubs.filter((p) => p.problem).sort((a, b) => (a.id < b.id ? -1 : 1)), xtypes };
}

/**
 * The use of each xtype listed: the public acts naming its spec hash and one
 * of its act types (Development rule 2: every act names its type within the
 * specification that defines it), found on the relays read, each judged
 * through its signer's chain. Private acts are not counted: their
 * specification cannot be read. Most used first.
 */
async function countUse(found: Map<string, { d: Described; act: Uint8Array }>, byHash: Map<string, Listed>, judge: Judge): Promise<Listed[]> {
  const xtypes = [...byHash.values()].filter((l) => isXtype(l.spec));
  for (const l of xtypes) l.use = { acts: 0, byType: l.spec.types.map((t) => ({ type: t.type, name: t.name, acts: 0 })), notValid: 0 };
  const of = new Map(xtypes.map((l) => [l.hash, l]));
  for (const { d, act } of found.values()) {
    const l = d.public && d.spec ? of.get(d.spec) : undefined;
    const t = l?.use!.byType.find((x) => x.type === d.type);
    if (!l || !t) continue;
    if (!d.signer || (await judge.problem(act, d.id, d.signer))) {
      l.use!.notValid++;
      continue;
    }
    t.acts++;
    l.use!.acts++;
  }
  return xtypes.sort((a, b) => b.use!.acts - a.use!.acts || (a.name < b.name ? -1 : a.name > b.name ? 1 : a.hash < b.hash ? -1 : 1));
}

/**
 * Lines of drafts (Development rules 4 and 25): a specification naming no
 * predecessor found here starts a line; every one naming it follows, and
 * on, oldest first. A predecessor is a claim, so a successor by another
 * creator is said, and two naming the same one are both shown, said as a fork.
 */
export function linesOf(all: Listed[]): Line[] {
  const byHash = new Map(all.map((l) => [l.hash, l]));
  const after = (l: Listed) => (l.spec.predecessor && l.spec.predecessor !== l.hash ? byHash.get(l.spec.predecessor) ?? null : null);
  const children = new Map<string, Listed[]>();
  for (const l of all) {
    const p = after(l);
    if (p) children.set(p.hash, [...(children.get(p.hash) ?? []), l]);
  }
  const order = (a: Listed, b: Listed) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.hash < b.hash ? -1 : 1);
  for (const c of children.values()) c.sort(order);
  const placed = new Set<string>();
  const out: Line[] = [];
  const walk = (l: Listed, n: number, drafts: Draft[]) => {
    if (placed.has(l.hash)) return;
    placed.add(l.hash);
    const p = after(l);
    const siblings = p ? (children.get(p.hash) ?? []).filter((x) => x !== l).map((x) => x.hash) : [];
    drafts.push({
      listed: l,
      number: n,
      after: p,
      afterMissing: !p && l.spec.predecessor ? l.spec.predecessor : null,
      otherCreator: !!p && p.spec.creator !== l.spec.creator,
      siblings,
    });
    for (const c of children.get(l.hash) ?? []) walk(c, n + 1, drafts);
  };
  const roots = all.filter((l) => !after(l)).sort(order);
  for (const r of roots) {
    const drafts: Draft[] = [];
    walk(r, 1, drafts);
    out.push({ drafts, newest: drafts[drafts.length - 1].listed });
  }
  // A cycle of predecessors cannot be signed in order, but could be claimed: what is left, one line each.
  for (const l of all.filter((x) => !placed.has(x.hash)).sort(order)) {
    const drafts: Draft[] = [];
    walk(l, 1, drafts);
    out.push({ drafts, newest: drafts[drafts.length - 1].listed });
  }
  return out.sort((a, b) => order(a.newest, b.newest));
}

/** What a specification is, from its own fields, in plain words. */
export function roleWords(l: Listed, all: Map<string, Listed>): { kind: string; layer: string; role: string[] } {
  const s = l.spec;
  const kind = KINDS[s.kind];
  const role: string[] = [];
  const layers = new Set<string>();
  for (const [mir, n] of s.tasks) {
    const layer = LAYERS[mir];
    const known = TASKS[n];
    if (layer) layers.add(layer);
    if (known && layer === known[0]) role.push(`fills task ${n}, ${known[1]}`);
    else role.push(`fills task ${n}${layer ? ` of ${layer}` : ', of a MIR this listing does not know'}`);
  }
  if (s.implements) {
    const under = all.get(s.implements);
    if (under) {
      role.push(`works under the cMIP “${under.name}”`);
      if (!s.tasks.length) for (const [mir] of under.spec.tasks) if (LAYERS[mir]) layers.add(LAYERS[mir]);
    } else role.push(`works under a cMIP not found here (${s.implements.slice(0, 12)}…)`);
  }
  if (s.types.length) {
    role.push(
      !s.tasks.length
        ? `an xtype: defines ${s.types.length === 1 ? 'an act type' : `${s.types.length} act types`} (${s.types.map((t) => t.name).join(', ')}), filling no task`
        : `defines ${s.types.length === 1 ? 'an act type' : `${s.types.length} act types`} (${s.types.map((t) => t.name).join(', ')})`,
    );
  }
  if (s.layers) role.push(`declares, for use as an extension, the layers it acts on beyond Development: ${s.layers.map((n) => EXTENSION_LAYERS[n]).join(', ')}`);
  if (s.rail !== null) role.push(`a rail Module: ${RAIL_KINDS[s.rail]}`);
  if (s.checker) role.push('checks proofs of delivery of proven offers (field 12)');
  if (!role.length) role.push(s.kind === 0 ? 'names no task, defines no act type' : 'declares nothing more');
  // An xtype's or an extension's own acts belong to Development (F106).
  if (!layers.size && (s.types.length || s.layers || (s.kind === 0 && !s.tasks.length))) layers.add('Development');
  return { kind, layer: [...layers].join(', ') || 'not said', role };
}

/**
 * The extensions agreements name (F288): from the public terms and
 * signatures found, each agreement judged by the core library with every
 * party's chain looked up; counted once it exists, or, a collective's
 * clone, is ready; its versions (field 11) one agreement. Most named first.
 */
async function readExtensions(
  found: Map<string, { d: Described; act: Uint8Array }>,
  byHash: Map<string, Listed>,
  judge: Judge,
  privateActs: number,
): Promise<{ extensions: Extension[]; agreements: AgreementsRead }> {
  const read: AgreementsRead = { terms: 0, counted: 0, proposed: 0, notCounted: [], private: privateActs };
  const terms = new Map<string, { act: Uint8Array; signer: string; fields: Map<number, unknown> }>();
  const signatures: { act: Uint8Array; d: Described }[] = [];
  for (const { d, act } of found.values()) {
    if (!d.public || d.spec !== MIRS.agreements || !d.payload || !d.signer) continue;
    if (d.type === AGREEMENTS_SIGNATURE) signatures.push({ act, d });
    if (d.type !== AGREEMENTS_TERMS) continue;
    try {
      const fields = cborDecode(d.payload) as Map<number, unknown>;
      if (fields instanceof Map) terms.set(d.id, { act, signer: d.signer, fields });
    } catch {
      read.notCounted.push({ id: d.id, why: 'its terms do not decode' });
    }
  }
  // Every party's chain, and the signer's, then the terms and the signatures, in one verifier.
  const parties = new Set<string>();
  for (const t of terms.values()) {
    parties.add(t.signer);
    for (const p of Array.isArray(t.fields.get(0)) ? (t.fields.get(0) as unknown[]) : []) if (bytes32(p)) parties.add(hex(p));
  }
  for (const s of signatures) parties.add(s.d.signer!);
  await Promise.all([...parties].map((p) => judge.lookUp(p).catch(() => null)));
  const valid = new Set<string>();
  for (const [id, t] of terms) {
    const bad = await judge.problem(t.act, id, t.signer);
    if (bad) read.notCounted.push({ id, why: bad });
    else valid.add(id);
  }
  for (const s of signatures) {
    try {
      judge.v.add(s.act);
    } catch {
      // not one the core library takes: it signs nothing here
    }
  }
  read.terms = valid.size;
  const named = (t: Map<number, unknown>): string[] => (Array.isArray(t.get(15)) ? (t.get(15) as unknown[]).filter(bytes32).map((h) => hex(h)) : []);
  const extLayers: Record<string, number[]> = {};
  for (const id of valid) for (const h of named(terms.get(id)!.fields)) extLayers[h] = byHash.get(h)?.spec.layers ?? [];
  const specs = { ...MIRS, extLayers };

  const counts = new Set<string>();
  for (const id of valid) {
    try {
      const a = judge.v.agreementsAgreement(specs, id) as { exists: boolean | null; ready: boolean; invalid: string | null };
      if (a.invalid) read.notCounted.push({ id, why: `the core library finds these terms invalid: ${a.invalid}` });
      else if (a.exists === true || (a.exists === null && a.ready)) counts.add(id);
      else read.proposed++;
    } catch (e) {
      read.notCounted.push({ id, why: `the core library could not judge it: ${message(e)}` });
    }
  }
  // One agreement, its versions: back through field 11 as far as found.
  const first = (id: string): string => {
    const seen = new Set<string>();
    let x = id;
    for (;;) {
      seen.add(x);
      const p = terms.get(x)?.fields.get(11);
      const ph = bytes32(p) ? hex(p) : null;
      if (!ph || !terms.has(ph) || seen.has(ph)) return x;
      x = ph;
    }
  };
  const byExt = new Map<string, Map<string, string[]>>();
  const agreementsCounted = new Set<string>();
  for (const id of [...counts].sort()) {
    const ag = first(id);
    agreementsCounted.add(ag);
    for (const h of new Set(named(terms.get(id)!.fields))) {
      const m = byExt.get(h) ?? new Map<string, string[]>();
      m.set(ag, [...(m.get(ag) ?? []), id]);
      byExt.set(h, m);
    }
  }
  read.counted = agreementsCounted.size;
  read.notCounted.sort((a, b) => (a.id < b.id ? -1 : 1));
  const extensions: Extension[] = [...byExt].map(([hash, m]) => {
    const listed = byHash.get(hash) ?? null;
    return {
      hash,
      listed,
      agreements: [...m].map(([agreement, ids]) => ({ agreement, terms: ids })).sort((a, b) => (a.agreement < b.agreement ? -1 : 1)),
      layers: listed ? ['Development', ...(listed.spec.layers ?? []).map((n) => EXTENSION_LAYERS[n])] : null,
    };
  });
  const name = (x: Extension) => x.listed?.name ?? `~${x.hash}`;
  extensions.sort((a, b) => b.agreements.length - a.agreements.length || (name(a) < name(b) ? -1 : name(a) > name(b) ? 1 : 0));
  return { extensions, agreements: read };
}
