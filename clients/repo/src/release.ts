// Releases of the code (release manifest cMIP, draft 1; draft 3's
// "implements"): a manifest naming every file by its hash, the release
// before, the libraries it depends on and, since draft 3, the specifications
// it implements, named since draft 4 by their spec hashes, a publication of
// each beside it as a hint (Development Q7, taken), published by the collective
// as a public Envelopes publication; the
// members' visible signatures that make it a release; and the checks a fresh
// machine runs to fetch one and verify every file.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  MIRS,
  SPECS,
  Verifier,
  cborDecode,
  cborEncode,
  decodeSpec,
  describeAct,
  hex,
  lockMedia,
  openMedia,
  unhex,
  workHash,
} from '../../genesis/src/core.ts';
import { lookUp, type TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import type { TestCollective } from './collective.ts';
import { AGREEMENTS_SPECS, carryChain, sign } from './agreements.ts';
import { REPO_SPECS } from './specs.ts';

const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

// ---------------------------------------------------------------- the manifest

/** `file = [ path, work hash, size, locked hash, nonce, key ]` */
export interface FileEntry {
  path: string;
  work: string;
  size: number;
  locked: string;
  nonce: Uint8Array;
  key: Uint8Array;
}

/** `dependency = [ registry, name, version, checksum ]` */
export interface Dependency {
  registry: string;
  name: string;
  version: string;
  checksum: string;
}

export interface Manifest {
  name: string;
  version: string;
  /** The previous release: its publication's act id, or null for the first. */
  previous: string | null;
  files: FileEntry[];
  dependencies: Dependency[];
  /** Where it was built from, for example a git commit. A hint, never load-bearing. */
  source?: string;
  /**
   * The specifications it implements (release manifest cMIP draft 4, field
   * 6): each by its spec hash, its name, with the act id of one of its
   * publications beside it as a hint, never the name; sorted by spec hash,
   * no spec hash twice, at least one when present. Signed with the release,
   * as every field is: a claim of whoever releases it, which a reader
   * checks against the specifications it finds.
   */
  implements?: Implemented[];
}

/** A field 6 entry: `[spec, ? hint]` (release manifest cMIP draft 4). */
export interface Implemented {
  spec: string;
  hint?: string;
}

/** A relative path with `/` separators, no empty, `.` or `..` segment, no `\` or control character. */
export function validPath(p: string): boolean {
  if (!p || p.startsWith('/') || p !== p.normalize('NFC')) return false;
  if (/[\\\u0000-\u001f\u007f]/.test(p)) return false;
  return p.split('/').every((s) => s !== '' && s !== '.' && s !== '..');
}

const byBytes = (a: string, b: string) => Buffer.compare(Buffer.from(a), Buffer.from(b));

export function encodeManifest(m: Manifest): Uint8Array {
  const map = new Map<number, unknown>([
    [0, m.name],
    [1, m.version],
    [2, m.previous ? unhex(m.previous) : null],
    [3, m.files.map((f) => [f.path, unhex(f.work), f.size, unhex(f.locked), f.nonce, f.key])],
    [4, m.dependencies.map((d) => [d.registry, d.name, d.version, d.checksum])],
  ]);
  if (m.source !== undefined) map.set(5, m.source);
  if (m.implements !== undefined) map.set(6, m.implements.map((i) => (i.hint ? [unhex(i.spec), unhex(i.hint)] : [unhex(i.spec)])));
  return cborEncode(map);
}

/** Decode a manifest strictly (closed format, sorted unique paths, exact sizes). Throws the reason. */
export function decodeManifest(bytes: Uint8Array): Manifest {
  const m = cborDecode(bytes);
  if (!(m instanceof Map)) throw new Error('a manifest is a map');
  for (const k of m.keys()) if (typeof k !== 'number' || k < 0 || k > 6) throw new Error(`manifest: unknown field ${k}`);
  const text = (v: unknown, w: string) => {
    if (typeof v !== 'string') throw new Error(`manifest: ${w}`);
    return v;
  };
  const bytesOf = (v: unknown, n: number, w: string) => {
    if (!(v instanceof Uint8Array) || v.length !== n) throw new Error(`manifest: ${w}`);
    return v;
  };
  const list = (v: unknown, w: string) => {
    if (!Array.isArray(v)) throw new Error(`manifest: ${w}`);
    return v as unknown[];
  };
  const prev = m.get(2);
  const files = list(m.get(3), 'files').map((x) => {
    const a = list(x, 'file');
    if (a.length !== 6) throw new Error('manifest: a file has six fields');
    const size = a[2];
    if (typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0) throw new Error('manifest: file size');
    return {
      path: text(a[0], 'file path'),
      work: hex(bytesOf(a[1], 32, 'work hash')),
      size,
      locked: hex(bytesOf(a[3], 32, 'locked hash')),
      nonce: bytesOf(a[4], 24, 'nonce'),
      key: bytesOf(a[5], 32, 'key'),
    };
  });
  if (!files.length) throw new Error('manifest: no files');
  files.forEach((f, i) => {
    if (!validPath(f.path)) throw new Error(`manifest: not a valid path: ${JSON.stringify(f.path)}`);
    if (i && byBytes(files[i - 1].path, f.path) >= 0) throw new Error('manifest: paths sorted and unique');
  });
  const dependencies = list(m.get(4), 'dependencies').map((x) => {
    const a = list(x, 'dependency');
    if (a.length !== 4) throw new Error('manifest: a dependency has four fields');
    return {
      registry: text(a[0], 'registry'),
      name: text(a[1], 'dependency name'),
      version: text(a[2], 'dependency version'),
      checksum: text(a[3], 'dependency checksum'),
    };
  });
  let impl: Implemented[] | undefined;
  if (m.has(6)) {
    const entries: Implemented[] = list(m.get(6), 'implements').map((e) => {
      if (!Array.isArray(e) || e.length < 1 || e.length > 2) throw new Error('manifest: an implemented specification is [spec, ? hint]');
      const spec = hex(bytesOf(e[0], 32, 'an implemented specification'));
      return e.length === 2 ? { spec, hint: hex(bytesOf(e[1], 32, 'a publication hint')) } : { spec };
    });
    if (!entries.length) throw new Error('manifest: implements names at least one specification');
    entries.forEach((x, i) => {
      if (i && entries[i - 1].spec >= x.spec) throw new Error('manifest: implements sorted by spec hash and unique');
    });
    impl = entries;
  }
  return {
    name: text(m.get(0), 'name'),
    version: text(m.get(1), 'version'),
    previous: prev === null ? null : hex(bytesOf(prev, 32, 'previous')),
    files,
    dependencies,
    source: m.has(5) ? text(m.get(5), 'source') : undefined,
    implements: impl,
  };
}

// ---------------------------------------------------------------- what goes in

export interface FileIn {
  path: string;
  bytes: Uint8Array;
}

/** Every file git tracks in the working tree at `root`, as it is on disk (a tracked file deleted from the tree is left out). */
export function gitFiles(root: string): FileIn[] {
  const out = execFileSync('git', ['ls-files', '-z'], { cwd: root });
  return out
    .toString('utf8')
    .split('\0')
    .filter((p) => p && existsSync(join(root, p)))
    .sort(byBytes)
    .map((path) => ({ path, bytes: new Uint8Array(readFileSync(join(root, path))) }));
}

/** The commit checked out at `root`, and whether the tree differs from it. */
export function gitSource(root: string): string {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root, encoding: 'utf8' }).trim();
  return `git ${commit}${dirty ? ' with local changes' : ''}`;
}

/**
 * The libraries the code depends on, from its lock files: every crate from
 * a registry in `Cargo.lock` (checksum: SHA-256, hex), and every package in
 * each `package-lock.json` (checksum: its integrity string). Sorted, unique.
 */
export function dependencies(files: FileIn[]): Dependency[] {
  const out = new Map<string, Dependency>();
  const add = (d: Dependency) => out.set(`${d.registry}\0${d.name}\0${d.version}`, d);
  for (const f of files) {
    const text = Buffer.from(f.bytes).toString('utf8');
    if (f.path === 'Cargo.lock') {
      for (const block of text.split('[[package]]').slice(1)) {
        const get = (k: string) => block.match(new RegExp(`^${k} = "([^"]*)"`, 'm'))?.[1];
        const source = get('source');
        const checksum = get('checksum');
        if (!source || !checksum) continue; // a crate of this repository
        const registry = source === 'registry+https://github.com/rust-lang/crates.io-index' ? 'crates.io' : source;
        add({ registry, name: get('name')!, version: get('version')!, checksum });
      }
    } else if (f.path.endsWith('package-lock.json')) {
      const lock = JSON.parse(text) as { packages?: Record<string, { version?: string; integrity?: string; link?: boolean }> };
      for (const [p, v] of Object.entries(lock.packages ?? {})) {
        if (!p || v.link || !v.version || !v.integrity) continue;
        const name = p.slice(p.lastIndexOf('node_modules/') + 'node_modules/'.length);
        add({ registry: 'npm', name, version: v.version, checksum: v.integrity });
      }
    }
  }
  return [...out.values()].sort(
    (a, b) => byBytes(a.registry, b.registry) || byBytes(a.name, b.name) || byBytes(a.version, b.version),
  );
}

// ---------------------------------------------------------------- publishing

async function toRelays(relays: string[], via: Via, put: (r: ReturnType<typeof relayAt>) => Promise<unknown>) {
  const errors: string[] = [];
  let ok = 0;
  for (const hint of relays) {
    try {
      await put(relayAt(hint, via));
      ok++;
    } catch (e) {
      errors.push(`${hint}: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (!ok) throw new Error(`no relay took it: ${errors.join('; ')}`);
  return errors;
}

export interface Published {
  /** The release: its publication's act id. */
  id: string;
  manifest: Manifest;
  /** Files uploaded new; the rest are the same locked objects as in the previous release. */
  uploaded: number;
  /** Relays that refused something (their policy): a hint, never a failure while one took it. */
  refused: string[];
}

/** Whoever publishes releases: a collective (`TestCollective.publisher`), or one identity under its own name (as at step 17). */
export interface Publisher {
  id: TestIdentity;
  /** Where the release and its files go. */
  relays: string[];
  /** Releases already published, newest last; a new one is pushed here. */
  releases: { id: string; version: string; manifest: string }[];
}

/** A release made and locked, not yet signed: what is shown before signing. */
export interface Prepared {
  manifest: Manifest;
  /** The manifest's exact bytes. */
  encoded: Uint8Array;
  /** The publication's exact payload: the manifest's hashes, key and relays. */
  payload: Uint8Array;
  /** The manifest's locked bytes. */
  lockedManifest: Uint8Array;
  /** The locked bytes of each file new since the previous release. */
  upload: Uint8Array[];
  /** The previous release's manifest, if any (to show what changed). */
  before: Manifest | null;
}

const HEX64 = /^[0-9a-f]{64}$/;

/** Field 6 as the manifest holds it: sorted by spec hash, each once (the first hint given kept); absent when none is named. */
export function implementsField(entries: Implemented[] | undefined): Implemented[] | undefined {
  if (!entries?.length) return undefined;
  const by = new Map<string, Implemented>();
  for (const e of entries) {
    if (!HEX64.test(e.spec)) throw new Error(`implements: a spec hash is 64 hex digits, not “${e.spec}”`);
    if (e.hint !== undefined && !HEX64.test(e.hint)) throw new Error(`implements: a hint is an act id, 64 hex digits, not “${e.hint}”`);
    if (!by.has(e.spec)) by.set(e.spec, e);
  }
  return [...by.values()].sort((x, y) => (x.spec < y.spec ? -1 : x.spec > y.spec ? 1 : 0));
}

/** A specification's content, read from one of its publications at the places given. */
async function specificationAt(id: string, hints: string[], via: Via): Promise<{ content: Uint8Array } | { problem: string }> {
  const act = await fetchFirst(hints, via, (r) => r.getAct(id));
  if (!act) return { problem: `${id}: not found at ${hints.join(', ')}` };
  const d = describeAct(act) as Described;
  let media: Map<number, unknown> | null = null;
  try {
    media = d.public && d.spec === SPECS.envelopes && d.type === 0 && d.payload ? (cborDecode(d.payload) as Map<number, unknown>) : null;
  } catch {
    media = null;
  }
  const spec = media?.get(0);
  if (!media || !(spec instanceof Uint8Array) || hex(spec) !== MIRS.development) {
    return { problem: `${id}: not the publication of a specification (a public publication whose media spec is the Development MIR's)` };
  }
  const locked = await fetchFirst([...hints, ...((media.get(6) as string[] | undefined) ?? [])], via, (x) => x.getMedia(hex(media!.get(2) as Uint8Array)));
  if (!locked) return { problem: `${id}: its content was not found` };
  try {
    const content = openMedia(locked, media.get(5) as Uint8Array, media.get(4) as Uint8Array);
    if (workHash(content) !== hex(media.get(1) as Uint8Array)) return { problem: `${id}: its content does not match its work hash` };
    return { content };
  } catch (e) {
    return { problem: `${id}: its content does not open: ${e instanceof Error ? e.message : e}` };
  }
}

/**
 * Before a release names them (release manifest cMIP draft 4, client
 * conformance): for each publication given, read the specification's
 * content, decode it whole (Development draft 10, F323: content not in the
 * format is no specification), and name it by its spec hash, the
 * publication beside it as a hint. Returns the entries, and a problem for
 * each publication that is not a specification's; a release naming them is
 * refused.
 */
export async function resolveImplements(ids: string[], hints: string[], via: Via = {}): Promise<{ entries: Implemented[]; problems: string[] }> {
  const entries: Implemented[] = [];
  const problems: string[] = [];
  for (const id of ids) {
    const got = await specificationAt(id, hints, via);
    if ('problem' in got) {
      problems.push(got.problem);
      continue;
    }
    try {
      const sp = decodeSpec(got.content, REPO_SPECS.payment) as { hash: string };
      entries.push({ spec: sp.hash, hint: id });
    } catch (e) {
      problems.push(`${id}: ${e instanceof Error ? e.message : e}`);
    }
  }
  return { entries, problems };
}

/** As [`resolveImplements`], the problems only. */
export async function checkImplements(ids: string[], hints: string[], via: Via = {}): Promise<string[]> {
  return (await resolveImplements(ids, hints, via)).problems;
}

/**
 * What a reader finds for each specification a release implements (release
 * manifest cMIP draft 4, rule 4): `found` where the hint's publication
 * carries content whose spec hash is the entry's; `wrong hint` where it
 * carries another; `not found` (unknown, never invalid) where the
 * specification is found nowhere it looked. None of these changes what the
 * entry names.
 */
export async function findImplemented(entries: Implemented[], hints: string[], via: Via = {}): Promise<{ spec: string; seen: 'found' | 'wrong hint' | 'not found' }[]> {
  const out: { spec: string; seen: 'found' | 'wrong hint' | 'not found' }[] = [];
  for (const e of entries) {
    if (!e.hint) {
      out.push({ spec: e.spec, seen: 'not found' });
      continue;
    }
    const got = await specificationAt(e.hint, hints, via);
    if ('problem' in got) {
      out.push({ spec: e.spec, seen: 'not found' });
      continue;
    }
    let hash: string | null = null;
    try {
      hash = (decodeSpec(got.content, REPO_SPECS.payment) as { hash: string }).hash;
    } catch {
      hash = null;
    }
    out.push({ spec: e.spec, seen: hash === e.spec ? 'found' : 'wrong hint' });
  }
  return out;
}

/**
 * Make a release without signing anything: every file locked as a media
 * object (a file unchanged since the previous release is the same object,
 * not a new one), the manifest, and the publication's payload.
 */
export function prepareRelease(
  p: Publisher,
  opts: { name: string; version: string; files: FileIn[]; source?: string; implements?: Implemented[] },
): Prepared {
  const last = p.releases.at(-1);
  const beforeManifest = last ? decodeManifest(unb64(last.manifest)) : null;
  const before = new Map<string, FileEntry>();
  for (const f of beforeManifest?.files ?? []) before.set(`${f.path}\0${f.work}`, f);

  const files = [...opts.files].sort((a, b) => byBytes(a.path, b.path));
  const entries: FileEntry[] = [];
  const upload: Uint8Array[] = [];
  for (const f of files) {
    if (!validPath(f.path)) throw new Error(`not a valid path: ${f.path}`);
    const work = workHash(f.bytes);
    const same = before.get(`${f.path}\0${work}`);
    if (same) {
      entries.push(same);
      continue;
    }
    const l = lockMedia(f.bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string };
    entries.push({ path: f.path, work, size: f.bytes.length, locked: l.lockedHash, nonce: l.nonce, key: l.key });
    upload.push(l.locked);
  }
  const manifest: Manifest = {
    name: opts.name,
    version: opts.version,
    previous: last?.id ?? null,
    files: entries,
    dependencies: dependencies(files),
    source: opts.source,
    implements: implementsField(opts.implements),
  };
  const encoded = encodeManifest(manifest);
  decodeManifest(encoded); // the same checks a verifier runs
  const lm = lockMedia(encoded) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(REPO_SPECS.manifest)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, encoded.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, p.relays],
    ]),
  );
  return { manifest, encoded, payload, lockedManifest: lm.locked, upload, before: beforeManifest };
}

/**
 * Sign and publish a prepared release, exactly as prepared: the manifest as
 * the media of a public publication signed by the publisher, all on its
 * relays. A collective's release is not a release until the members sign it
 * (`signRelease`). Save the publisher's file after.
 */
export async function publishPrepared(p: Publisher, r: Prepared, via: Via = {}): Promise<Published> {
  const last = p.releases.at(-1);
  if ((last?.id ?? null) !== r.manifest.previous) throw new Error('another release was published since this one was made: make it again');
  await carryChain(p.id, p.relays);
  // The publication first: a relay that keeps media only for publications it holds then takes the manifest.
  const made = await p.id.publish(SPECS.envelopes, 0, r.payload, { public: true, relays: p.relays });
  const refused = await toRelays(p.relays, via, (x) => x.putMedia(r.lockedManifest));
  for (const u of r.upload) refused.push(...(await toRelays(p.relays, via, (x) => x.putMedia(u))));
  p.releases.push({ id: made.id, version: r.manifest.version, manifest: b64(r.encoded) });
  return { id: made.id, manifest: r.manifest, uploaded: r.upload.length, refused: [...new Set(refused)] };
}

/**
 * Publish a release of a collective: prepared and published at once, as the
 * command line does. It is not a release until the members sign it. Save
 * the collective's file after.
 */
export async function publishRelease(
  c: TestCollective,
  opts: { name: string; version: string; files: FileIn[]; source?: string; implements?: Implemented[]; via?: Via },
): Promise<Published> {
  const p: Publisher = { id: c.id, relays: c.f.relays, releases: c.f.releases };
  return publishPrepared(p, prepareRelease(p, opts), opts.via);
}

/** A member signs a release: an Agreements signature act naming it. Save the member's file after. */
export async function signRelease(member: TestIdentity, release: string, relays: string[]) {
  return sign(member, release, relays);
}

// ---------------------------------------------------------------- verifying

export interface Verified {
  /** True only if every check passed. */
  ok: boolean;
  release: string;
  collective?: string;
  /** Agreements' answer: under which agreement, which rule, who signed. */
  agreement?: string;
  rule?: string;
  /** Agreements' verdict on it as an act of its publisher (`agreementsConsent`): its kind ("areas", "no-area", "not-collective", "broken", …) and Agreements' reason. */
  agreements?: { kind: string; reason?: string };
  signers: string[];
  manifest?: Manifest;
  /** Files checked against their hashes. */
  checked: number;
  problems: string[];
  /** Where this verifier found each act of the collective it read, and the release: information only; no validity rests on it (F128). */
  foundAt?: { act: string; hint: string }[];
}

async function fetchFirst<T>(hints: string[], via: Via, get: (r: ReturnType<typeof relayAt>) => Promise<T | null>): Promise<T | null> {
  for (const h of hints) {
    try {
      const x = await get(relayAt(h, via));
      if (x) return x;
    } catch {
      // not reachable, or not there: try the next
    }
  }
  return null;
}

/** Every act a relay holds signed by `signer`, page by page. */
export async function allBy(signer: string, hints: string[], via: Via): Promise<Uint8Array[]> {
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

interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

/**
 * Fetch a release and verify it, as a fresh machine with nothing but the
 * release's id and one place to look (release manifest cMIP, "Verifying"):
 *
 * 1. the publication: public, of the manifest's media type;
 * 2. its signer's identity chain, from its homes: the publication is valid
 *    (bound by a counting chain act, not voided by a rotation);
 * 3. Agreements: the agreement the collective declared in force at the
 *    publication's binding, and the visible member signatures its grammar
 *    requires, every member's chain resolved in turn;
 * 4. the manifest: its locked hash, its work hash, its format;
 * 5. every file: fetched, its locked hash, opened, its work hash and size.
 *
 * With `collective`, the release must be that identity's. With `out`, the
 * files are written there once all of them passed.
 */
export async function verifyRelease(
  release: string,
  hints: string[],
  opts: { via?: Via; out?: string; collective?: string } = {},
): Promise<Verified> {
  const via = opts.via ?? {};
  const r: Verified = { ok: false, release, signers: [], checked: 0, problems: [] };
  const fail = (p: string) => {
    r.problems.push(p);
    return r;
  };

  const act = await fetchFirst(hints, via, (x) => x.getAct(release));
  if (!act) return fail(`the release ${release} was not found at ${hints.join(', ')}`);
  const d = describeAct(act) as Described;
  if (!d.public || !d.payload) return fail('the release is not a public act');
  if (d.spec !== SPECS.envelopes || d.type !== 0) return fail('the release is not a publication (Envelopes type 0)');
  const media = cborDecode(d.payload) as Map<number, unknown>;
  if (!(media.get(0) instanceof Uint8Array) || hex(media.get(0) as Uint8Array) !== REPO_SPECS.manifest) {
    return fail('the publication is not a release manifest');
  }
  if (!d.signer) return fail('the release has no signer');
  r.collective = d.signer;
  if (opts.collective && opts.collective !== d.signer) {
    return fail(`the release is signed by ${d.signer}, not by the collective ${opts.collective}`);
  }

  // 2. The signer's chain, and the publication's standing.
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let homes: string[];
  try {
    const l = await lookUp(d.signer, hints, via, v);
    homes = l.resolution.homes.map((h) => h.hint);
  } catch (e) {
    return fail(`the collective's identity was not found: ${e}`);
  }
  v.add(act);
  // The signer's other acts first: a release that is no longer the latest
  // act a rotation kept is valid only through the acts after it, which link
  // it to the kept tip (Identity, kept ancestry). A collective's records
  // (Agreements draft 7) put such acts after a release before the next rotation.
  for (const a of await allBy(d.signer, [...new Set([...hints, ...homes])], via)) {
    try {
      v.add(a);
    } catch {
      // a private act, or malformed
    }
  }
  const standing = v.status(release);
  if (standing !== 'valid') return fail(`the publication is ${standing}, not valid, for its signer's identity chain`);

  // 3. Agreements: the agreements the collective declared, their parties' chains and signature acts.
  const places = [...new Set([...hints, ...((media.get(6) as string[]) ?? []), ...homes])];
  const res = v.resolve(d.signer) as { links: { act: string }[] };
  const agreements = new Set<string>();
  for (const link of res.links) {
    const a = v.agreementsDeclared(AGREEMENTS_SPECS, d.signer, link.act);
    if (a) agreements.add(a);
  }
  const parties = new Set<string>();
  const seen = new Set<string>();
  const queue = [...agreements];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const t = await fetchFirst(places, via, (x) => x.getAct(id));
    if (!t) continue; // Agreements will say what is missing
    try {
      v.add(t);
      const td = describeAct(t) as Described;
      const p = cborDecode(td.payload!) as Map<number, unknown>;
      for (const x of (p.get(0) as Uint8Array[]) ?? []) parties.add(hex(x));
      if (p.get(11) instanceof Uint8Array) queue.push(hex(p.get(11) as Uint8Array));
    } catch {
      // malformed: Agreements will refuse it
    }
  }
  for (const party of parties) {
    try {
      await lookUp(party, places, via, v);
    } catch {
      // that member's chain was not found: their signatures cannot count
    }
    for (const a of await allBy(party, places, via)) {
      try {
        v.add(a);
      } catch {
        // a private act, or malformed: never a visible signature
      }
    }
  }
  // The collective's own acts: its records (its everyday line, which writes
  // its ordinary clones and registers departures, Agreements draft 7, F109), and
  // the clones they name with their signature acts.
  // The collective's acts, its records included (F127): this verifier
  // states where it found each, as information only (F128).
  const found: { act: string; hint: string }[] = [];
  for (const hint of places) {
    for (const a of await allBy(d.signer, [hint], via)) {
      try {
        found.push({ act: v.add(a), hint });
      } catch {
        // a private act, or malformed
      }
    }
  }
  let consent: {
    kind: string;
    agreement?: string;
    reason?: string;
    areas: { area: number; name: string; frozen: boolean; voices: string[]; needed: number; signers: string[]; met: boolean }[];
    met: boolean;
  };
  // Where the release was found: information only (F128). A release in a
  // collective's name is done once sealed to every member, or public, and
  // on the collective's chain, wherever it is held.
  const foundAt: { act: string; hint: string }[] = [...found];
  for (const hint of places) {
    try {
      if (await relayAt(hint, via).getAct(release)) foundAt.push({ act: release, hint });
    } catch {
      // not reachable, or not there
    }
  }
  r.foundAt = foundAt;
  try {
    consent = v.agreementsConsent(AGREEMENTS_SPECS, release);
  } catch (e) {
    return fail(`Agreements: ${e instanceof Error ? e.message : e}`);
  }
  r.agreement = consent.agreement;
  r.agreements = { kind: consent.kind, ...(consent.reason ? { reason: consent.reason } : {}) };
  r.signers = consent.areas.flatMap((a) => a.signers);
  const area = consent.areas[0];
  const counted = ['areas', 'no-area', 'not-collective'].includes(consent.kind);
  r.rule =
    consent.kind === 'areas'
      ? area.frozen
        ? `the ${area.name} area, which has no holder left: frozen until the members refit it`
        : `any ${area.needed} of the ${area.name} area's holders`
      : consent.kind === 'no-area'
        ? "the collective's own signature (no area of its agreement reaches publications)"
        : consent.kind === 'not-collective'
          ? "its signer's own signature (not a collective)"
          : undefined;
  if (!counted) {
    // No signature can make it a release: say what Agreements read, as a sentence.
    fail(
      consent.kind === 'broken'
        ? v.agreementsBroken(AGREEMENTS_SPECS, d.signer)
          ? `Agreements read the collective that published it as broken: no agreement can be found in force for it, so no member's signature can make this a release. Agreements' reason: ${consent.reason ?? 'none given'}`
          : // Rolled back since (Agreements rule 37d, F185): the act stays in the broken stretch.
            `It was published while Agreements read the collective that published it as broken, before the rollback that brought the collective back: it counts for nothing, for good, so no member's signature can make this a release (Agreements rule 37d). Agreements' reason for the broken act: ${consent.reason ?? 'none given'}`
        : `Agreements count it as no release of its publisher, whatever signatures it gathers: ${consent.reason ?? consent.kind}`,
    );
  } else if (!consent.met) {
    fail(`not a release: ${r.rule} must sign it; ${r.signers.length} did (${r.signers.join(', ') || 'none'})`);
  }

  // 4. The manifest.
  const lockedHash = hex(media.get(2) as Uint8Array);
  const locked = await fetchFirst(places, via, (x) => x.getMedia(lockedHash));
  if (!locked) return fail('the manifest was not found');
  let manifest: Manifest;
  try {
    const plain = openMedia(locked, media.get(5) as Uint8Array, media.get(4) as Uint8Array);
    if (workHash(plain) !== hex(media.get(1) as Uint8Array) || plain.length !== media.get(3)) {
      return fail('the manifest does not match its work hash or size');
    }
    manifest = decodeManifest(plain);
  } catch (e) {
    return fail(`the manifest: ${e instanceof Error ? e.message : e}`);
  }
  r.manifest = manifest;

  // 5. Every file.
  const got: { path: string; bytes: Uint8Array }[] = [];
  for (const f of manifest.files) {
    const lb = await fetchFirst(places, via, (x) => x.getMedia(f.locked));
    if (!lb) {
      fail(`${f.path}: not found`);
      continue;
    }
    let plain: Uint8Array;
    try {
      plain = openMedia(lb, f.key, f.nonce);
    } catch {
      fail(`${f.path}: its key does not open it`);
      continue;
    }
    if (workHash(plain) !== f.work || plain.length !== f.size) {
      fail(`${f.path}: does not match its hash`);
      continue;
    }
    r.checked++;
    got.push({ path: f.path, bytes: plain });
  }
  r.ok = r.problems.length === 0;
  if (r.ok && opts.out) {
    for (const f of got) {
      const p = join(opts.out, f.path);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, f.bytes);
    }
  }
  return r;
}

/** Compare a verified manifest with files on disk (a checkout from GitHub, the mirror). */
export function compareWithTree(m: Manifest, root: string): { same: number; differ: string[]; missing: string[] } {
  const out = { same: 0, differ: [] as string[], missing: [] as string[] };
  for (const f of m.files) {
    const p = join(root, f.path);
    if (!existsSync(p)) {
      out.missing.push(f.path);
      continue;
    }
    if (workHash(new Uint8Array(readFileSync(p))) === f.work) out.same++;
    else out.differ.push(f.path);
  }
  return out;
}

