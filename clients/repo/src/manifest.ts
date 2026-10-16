// The release manifest (release manifest cMIP, draft 4): its format,
// encoded and decoded strictly. Kept apart from the rest of the release code,
// with nothing from Node, so that a member's Dub (on a phone too, H18) can
// read a release it is asked to sign.

import { cborDecode, cborEncode, hex, unhex } from '../../genesis/src/core.ts';


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

const enc = new TextEncoder();
/** Compare two strings by their UTF-8 bytes. */
export function byBytes(a: string, b: string): number {
  const x = enc.encode(a);
  const y = enc.encode(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}

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

