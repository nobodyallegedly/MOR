// A listing of the specifications published on the relays a page names, as
// its `mor-listing` names them (website cMIP draft 9, rule 13c; F288; draft
// 10: the use of xtypes, and code released read from "implements"; draft 11:
// the specification format of Development draft 10, decoded by the core
// library, a content that does not decode no specification (F323); the MIPs
// in a part of their own, by the MIR they fork and how many fork each
// (F325; F328, Q10); versions of one text shown together (F322); a rail's
// kind and what its proof binds (F301); code released matched by spec hash
// (release manifest cMIP draft 4; Development Q7, taken)). One
// listing among any: it reads, checks and shows; it decides nothing and
// refuses nothing (Development rule 17, "No core registry").
//
// How it reads: each relay named is asked for everything it serves (relay
// transport cMIP, "Following: the feed", with no filter). A specification
// is a public bake (Envelopes type 0, called a publication before F407) whose media spec is the
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

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, decodeSpec as coreDecodeSpec, describeAct, hex, openMedia, workHash } from '../../genesis/src/core.ts';
import { holdSequence, lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { sha256 } from '@noble/hashes/sha2.js';
import { relayAddress } from './settings.ts';
import { PAYMENT_CMIP, BAKE, RELEASE_MANIFEST } from './specs.ts';

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
export const KINDS = ['cMIP', 'Module', 'unit', 'media type', 'MIR', 'signature scheme', 'MICS document', 'test suite', 'MIP'] as const;

/** The kinds published with no creator (Development draft 10, F291): a MIR, the MICS document, a test suite. */
export const NO_CREATOR_KINDS = [4, 6, 7];
/** A MIR, the MICS document, a MIP (kinds 4, 6, 8): what a MIP may fork (F325; F328, Q10). */
export const MIR = 4;
export const MICS = 6;
export const MIP = 8;

/** The six layers, by the MIR whose spec hash a task names (test values until the freeze). */
export const LAYERS: Record<string, string> = {
  [MIRS.identity]: 'Identity',
  [MIRS.text]: 'Text',
  [MIRS.envelopes]: 'Envelopes',
  [MIRS.money]: 'Money',
  [MIRS.agreements]: 'Agreements',
  [MIRS.development]: 'Development',
};

/** Field 10's layer numbers (Development draft 11, "Layers an extension acts on"): the core's layers, Text and Envelopes two of them (F407). */
export const EXTENSION_LAYERS = ['Identity', 'Text', 'Envelopes', 'Money', 'Agreements'];

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

/** A rail Module's kind (field 11) and the set its proof binds (field 13), as the core reads them (Development draft 10, F301). */
export interface Rail {
  kind: 'request' | 'push';
  binds: ('payee' | 'purpose' | 'previous hop')[];
}

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
  /** Fields 11 and 13: a rail Module's kind and the set its proof binds. */
  rail: Rail | null;
  /** Field 12: a proof-of-delivery checker. */
  checker: boolean;
}

/** A release naming a specification's bake (release manifest cMIP). */
export interface Release {
  id: string;
  /** Its uploader: the bake's signer. */
  signer: string;
  /** For a collective's release, the collective its bake names in its objects (a keyless collective's release is uploaded by a member naming it, Agreements rule 58); null otherwise. */
  collective: string | null;
  /** The release's name and version label, from its manifest, when it could be read. */
  name: string | null;
  version: string | null;
  /** Set when it is not shown as verified, saying why. */
  problem: string | null;
  /** How it names the specification: its manifest's "implements", by spec hash (release manifest cMIP draft 4; Development Q7, taken), or, for a release without one, a reference from its publication. */
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
  /** Its content's bytes, once verified: to say where versions of one text differ. */
  content: Uint8Array | null;
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

/** A MIP, or a MIR or the MICS document a MIP forks, with the MIPs under it (website cMIP draft 11, F325). */
export interface Forked {
  listed: Listed;
  /** MIPs naming it as their predecessor. */
  direct: number;
  /** MIPs standing under it in all. */
  total: number;
  /** The MIPs naming it, most forked first, then by name. */
  forks: Forked[];
}

/** MIPs whose line of predecessors leads to a specification not found here, or to one neither a MIR, the MICS document nor a MIP. */
export interface Unrooted {
  /** The specification the line leads to, by its hash. */
  hash: string;
  /** Its kind, where found here; null where not found. */
  kind: number | null;
  forks: Forked[];
}

/** The MIPs' part: each MIR and the MICS document found, with the MIPs under it; then those that lead elsewhere. */
export interface Mips {
  /** The MIRs and the MICS document found, in the order of their names, each with its MIPs. */
  roots: Forked[];
  unrooted: Unrooted[];
  /** MIPs listed. */
  count: number;
}

/** Specifications holding one text (field 9) and differing in other fields: versions of one text (F322). */
export interface Versions {
  name: string;
  versions: { listed: Listed; differs: number[] }[];
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
  /** The MIPs, in a part of their own, by what they fork (website cMIP draft 11, F325). */
  mips: Mips;
  /** Versions of one text found (F322). */
  versions: Versions[];
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
 * Decode a specification's content as the core library does (Development
 * draft 10, Part three; `mor_core::development::Spec::decode`): only the keys
 * it defines, each of its kind; field 9 canonical text; a creator for every
 * kind but a MIR, the MICS document and a test suite; what each kind
 * requires (a Module's field 5; fields 11 and 13 on a Module under the
 * payment cMIP; a MIP's predecessor); field 10 ascending, from 0 to 4 (Development draft 11: Text and Envelopes two layers); in
 * canonical encoding. A content that does not decode so is no specification
 * (F323). Throws saying why.
 */
export function decodeSpec(content: Uint8Array): Spec {
  let d: CoreSpec;
  try {
    d = coreDecodeSpec(content, PAYMENT_CMIP) as CoreSpec;
  } catch (e) {
    throw new Error(message(e));
  }
  return {
    kind: d.kind,
    creator: d.creator ?? null,
    tasks: d.tasks,
    types: d.types.map(([type, name]) => ({ type, name })),
    dependencies: d.dependencies,
    implements: d.implements ?? null,
    rules: d.rules,
    fee: d.fee,
    predecessor: d.predecessor ?? null,
    text: d.text,
    layers: d.layers.length ? d.layers : null,
    rail: d.railKind ? { kind: d.railKind, binds: d.railBinds ?? [] } : null,
    checker: d.checksDelivery,
  };
}

/** What the core library's `decodeSpec` returns. */
interface CoreSpec {
  hash: string;
  kind: number;
  creator?: string | null;
  tasks: [string, number][];
  types: [number, string][];
  dependencies: string[];
  implements?: string | null;
  predecessor?: string | null;
  text: string;
  layers: number[];
  checksDelivery: boolean;
  railKind?: 'request' | 'push' | null;
  railBinds?: Rail['binds'] | null;
  rules: number;
  fee: boolean;
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

/** A bake's media fields (Envelopes, "Media"), or null when it describes none. */
function mediaOf(d: Described): Media | null {
  if (!d.public || !d.payload || d.type !== BAKE || d.spec !== SPECS.envelopes) return null;
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
  readonly v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
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
      // F298: the signer's sequence too, before judging one of its acts.
      await holdSequence(this.v, signer, await this.lookUp(signer), this.places, this.via);
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

/** A filtered read (Ummia's look-up, F339): the relays asked with the filters they already have, never read whole. */
export interface Filtered {
  /** Only the publications of this signer: whose specifications and releases are looked up. */
  signer?: string;
}

type Query = { signer?: string; spec?: string; type?: number };

/** What a filtered read asks each relay: publications (specifications and releases), Agreements' terms and signatures. */
function queriesOf(f: Filtered): Query[] {
  return [{ spec: SPECS.envelopes, type: BAKE, signer: f.signer }, { spec: MIRS.agreements, type: AGREEMENTS_TERMS }, { spec: MIRS.agreements, type: AGREEMENTS_SIGNATURE }];
}

/** Everything a relay serves for each query (with none, everything), up to `LISTING_READ` acts, described. */
async function readRelay(line: RelayLine, via: Via, into: Map<string, { d: Described; act: Uint8Array }>, queries: Query[] = [{}]): Promise<void> {
  for (const q of queries) {
    await readQuery(line, via, into, q);
    if (line.stopped || line.problem) return;
  }
}

async function readQuery(line: RelayLine, via: Via, into: Map<string, { d: Described; act: Uint8Array }>, q: Query): Promise<void> {
  let after: number | undefined;
  try {
    for (;;) {
      const page = await relayAt(line.address, via).feed({ ...q, after });
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
export async function readListing(relays: ListedRelay[], gatewayRelays: string[], via: Via = {}, filtered?: Filtered): Promise<Listing> {
  const lines: RelayLine[] = relays.map((r) => ({ ...r, asked: relayAddress(r.address) !== null, problem: null, read: 0, specs: 0, stopped: false, private: 0, terms: 0 }));
  const asked = lines.filter((l) => l.asked).map((l) => relayAddress(l.address)!);
  for (const l of lines) if (l.asked) l.address = relayAddress(l.address)!;
  const found = new Map<string, { d: Described; act: Uint8Array }>();
  const at = new Map<string, string>();
  for (const l of lines.filter((x) => x.asked)) {
    const before = new Set(found.keys());
    await readRelay(l, via, found, filtered ? queriesOf(filtered) : undefined);
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
    pubs.push({ id: d.id, signer: d.signer ?? '', problem: null, hash: null, spec: null, content: null });
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
        return void (p.problem = `no specification (Development draft 10, F323): ${message(e)}`);
      }
      p.hash = specHash(content);
      p.content = content;
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

  // Code released: its manifest's "implements" first, read by spec hash (release manifest cMIP draft 4;
  // Development Q7, taken), the publication beside each a hint only; without one, its publication's references.
  const pubOf = new Map<string, Listed>();
  for (const l of byHash.values()) for (const p of l.publications) pubOf.set(p.id, l);
  const listedBy = (ids: string[]) => [...new Set(ids.map((r) => pubOf.get(r)).filter((x): x is Listed => !!x))];
  await Promise.all(
    releases.map(async ({ d, act, m }) => {
      if (!d.signer || !byHash.size) return;
      const bad = await judge.problem(act, d.id, d.signer);
      const plain = bad ? null : await openAt(m, [...places, ...m.places.map(relayAddress).filter((x): x is string => !!x)], via);
      let man: Map<number, unknown> | null = null;
      try {
        const x = plain ? cborDecode(plain) : null;
        man = x instanceof Map && typeof x.get(0) === 'string' && typeof x.get(1) === 'string' ? (x as Map<number, unknown>) : null;
      } catch {
        man = null;
      }
      const field6 = implementsOf(man);
      let named: Listed[];
      let problem = bad;
      if (field6 === null) named = listedBy(d.refs ?? []);
      else if ('specs' in field6) named = [...new Set(field6.specs.map((h) => byHash.get(h)).filter((x): x is Listed => !!x))];
      else {
        // Draft 3's field 6, naming publications: not a valid manifest under draft 4.
        named = listedBy(field6.publications);
        problem ??= field6.problem;
      }
      if (!named.length) return;
      const r: Release = { id: d.id, signer: d.signer, collective: d.objects?.[0]?.[0] ?? null, name: null, version: null, problem, by: field6 ? 'implements' : 'reference' };
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
  // A filtered read asks for each xtype's acts by its spec hash (the feed's `spec` filter), relay by relay.
  if (filtered) for (const x of [...byHash.values()].filter((l) => isXtype(l.spec))) for (const l of lines.filter((y) => y.asked && !y.problem)) await readQuery(l, via, found, { spec: x.hash });
  const xtypes = await countUse(found, byHash, judge);
  const all = [...byHash.values()];
  return {
    relays: lines,
    extensions,
    agreements,
    // A MIP's predecessor is what it forks, shown in the MIPs' part, never as a line of drafts (draft 11, F325).
    lines: linesOf(all.filter((l) => l.spec.kind !== MIP)),
    unverified: pubs.filter((p) => p.problem).sort((a, b) => (a.id < b.id ? -1 : 1)),
    xtypes,
    mips: mipsOf(all),
    versions: versionsOf(all),
  };
}

/**
 * A manifest's field 6 (release manifest cMIP draft 4): null where it holds
 * none; the spec hashes its entries `[spec, ? hint]` name, sorted and each
 * once; or, where it holds draft 3's form, bare hashes naming publications,
 * those publications and why it is not verified.
 */
function implementsOf(man: Map<number, unknown> | null): null | { specs: string[] } | { publications: string[]; problem: string } {
  if (!man || !man.has(6)) return null;
  const v = man.get(6);
  const wrong = { publications: [] as string[], problem: 'its manifest\'s “implements” (field 6) is not as release manifest cMIP draft 4 gives it: [spec, ? hint] entries, sorted by spec hash' };
  if (!Array.isArray(v) || !v.length) return wrong;
  if (v.every(bytes32)) {
    return { publications: v.map((h) => hex(h)), problem: 'its manifest names publications in “implements” (field 6), as release manifest cMIP draft 3 did; under draft 4 it names spec hashes, so it is not a valid manifest' };
  }
  const specs: string[] = [];
  for (const e of v) {
    if (!Array.isArray(e) || e.length < 1 || e.length > 2 || !e.every(bytes32)) return wrong;
    const h = hex(e[0]);
    if (specs.length && specs[specs.length - 1] >= h) return wrong;
    specs.push(h);
  }
  return { specs };
}

/**
 * The MIPs, by what they fork (website cMIP draft 11, F325; F328, Q10): each
 * MIP under the specification its predecessor names, back through the MIPs
 * as far as found; each MIR and the MICS document found, with the MIPs under
 * it, a MIR no MIP forks with none; a line leading to a specification not
 * found, or to one neither a MIR, the MICS document nor a MIP, in a group of
 * its own. Most forked first, then by name; the roots by name.
 */
export function mipsOf(all: Listed[]): Mips {
  const byHash = new Map(all.map((l) => [l.hash, l]));
  const mips = all.filter((l) => l.spec.kind === MIP);
  const children = new Map<string, Listed[]>();
  for (const l of mips) {
    const p = l.spec.predecessor!;
    if (p !== l.hash) children.set(p, [...(children.get(p) ?? []), l]);
  }
  const order = (a: Forked, b: Forked) => b.total - a.total || b.direct - a.direct || (a.listed.name < b.listed.name ? -1 : a.listed.name > b.listed.name ? 1 : a.listed.hash < b.listed.hash ? -1 : 1);
  const placed = new Set<string>();
  const tree = (l: Listed): Forked => {
    placed.add(l.hash);
    const forks = (children.get(l.hash) ?? []).filter((c) => !placed.has(c.hash)).map(tree).sort(order);
    return { listed: l, direct: forks.length, total: forks.reduce((n, f) => n + 1 + f.total, 0), forks };
  };
  const byName = (a: Forked, b: Forked) => (a.listed.name < b.listed.name ? -1 : a.listed.name > b.listed.name ? 1 : a.listed.hash < b.listed.hash ? -1 : 1);
  const roots = all.filter((l) => l.spec.kind === MIR || l.spec.kind === MICS).map(tree).sort(byName);
  // The rest: MIPs whose line leads to a specification not found, or found and of another kind.
  const unrooted = new Map<string, Unrooted>();
  const top = (l: Listed): string => {
    const seen = new Set<string>();
    let x = l;
    for (;;) {
      seen.add(x.hash);
      const p = byHash.get(x.spec.predecessor!);
      if (!p || p.spec.kind !== MIP || seen.has(p.hash)) return x.hash;
      x = p;
    }
  };
  for (const l of mips.filter((x) => !placed.has(x.hash)).sort((a, b) => (a.hash < b.hash ? -1 : 1))) {
    if (placed.has(l.hash)) continue;
    const head = byHash.get(top(l))!;
    const leads = head.spec.predecessor!;
    const u = unrooted.get(leads) ?? { hash: leads, kind: byHash.get(leads)?.spec.kind ?? null, forks: [] };
    u.forks.push(tree(head));
    u.forks.sort(order);
    unrooted.set(leads, u);
  }
  return { roots, unrooted: [...unrooted.values()].sort((a, b) => (a.hash < b.hash ? -1 : 1)), count: mips.length };
}

/**
 * Versions of one text (F322): specifications whose field 9 is the same and
 * which differ in other fields, each its own specification, with the fields
 * in which it differs from the others. Shown together, never merged.
 */
export function versionsOf(all: Listed[]): Versions[] {
  const byText = new Map<string, Listed[]>();
  for (const l of all) byText.set(l.spec.text, [...(byText.get(l.spec.text) ?? []), l]);
  const out: Versions[] = [];
  for (const group of byText.values()) {
    if (group.length < 2) continue;
    const fields = group.map((l) => {
      const c = l.publications.find((p) => p.content)?.content;
      const m = c ? (cborDecode(c) as Map<number, unknown>) : new Map<number, unknown>();
      return new Map([...m].map(([k, v]) => [k, hex(cborEncode(v))]));
    });
    const keys = [...new Set(fields.flatMap((f) => [...f.keys()]))].filter((k) => k !== 9).sort((a, b) => a - b);
    const versions = group.map((listed, i) => ({
      listed,
      differs: keys.filter((k) => fields.some((f, j) => j !== i && f.get(k) !== fields[i].get(k))),
    }));
    versions.sort((a, b) => (a.listed.hash < b.listed.hash ? -1 : 1));
    out.push({ name: group[0].name, versions });
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
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
  if (s.implements && LAYERS[s.implements]) {
    // A Module working under a MIR (Development draft 10, rule 5; F328, Q6): its layer that MIR's.
    role.push(`works under the ${LAYERS[s.implements]} MIR`);
    if (!s.tasks.length) layers.add(LAYERS[s.implements]);
  } else if (s.implements) {
    const under = all.get(s.implements);
    if (under && under.spec.kind === MIR) {
      role.push(`works under the MIR “${under.name}”`);
    } else if (under) {
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
  if (s.rail) role.push(`a rail Module: a ${s.rail.kind} rail, its proof binding ${s.rail.binds.length ? s.rail.binds.join(', ') : 'nothing'}`);
  if (s.checker) role.push('checks proofs of proven deliveries (field 12)');
  if (s.kind === MIP) role.push(`a MIP: a proposal toward a successor protocol, not a rule of MOR; it forks ${all.get(s.predecessor!) ? `“${all.get(s.predecessor!)!.name}”` : `a specification not found here (${s.predecessor!.slice(0, 12)}…)`}`);
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
