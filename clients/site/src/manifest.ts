// The site manifest (website cMIP, draft 4; the manifest unchanged since draft 2): one version of a site, file by
// file, each named by its hash, in the same file entries as a release of the
// code. Written for both Node and a browser: no Buffer here.

import { cborDecode, cborEncode, checkText, hex, unhex } from '../../genesis/src/core.ts';

/** `file = [ path, work hash, size, locked hash, nonce, key ]`, as in the release manifest. */
export interface FileEntry {
  path: string;
  work: string;
  size: number;
  locked: string;
  nonce: Uint8Array;
  key: Uint8Array;
}

export interface SiteManifest {
  /** What the site is, e.g. "dubsar.org": a label, never an address. */
  name: string;
  /** The previous version: its publication's act id, or null for the first. */
  previous: string | null;
  files: FileEntry[];
}

export type Kind = 'page' | 'stylesheet' | 'picture' | 'text' | 'film';

/** Rule 4: the extension decides what a file is; any other extension is invalid. Draft 4 adds films (the video Module). */
export const KINDS: Record<string, Kind> = { html: 'page', css: 'stylesheet', jpg: 'picture', txt: 'text', mp4: 'film' };

export const FRONT = 'index.html';

const SEGMENT = /^[a-z0-9_-][a-z0-9._-]{0,99}$/;

/** What a file at this path is, or null if the path is not a valid one (rules 2 and 4). */
export function kindOf(path: string): Kind | null {
  if (typeof path !== 'string' || !path || path.length > 512) return null;
  const segments = path.split('/');
  if (!segments.every((s) => SEGMENT.test(s))) return null;
  const last = segments.at(-1)!;
  const dot = last.lastIndexOf('.');
  if (dot <= 0) return null;
  return KINDS[last.slice(dot + 1)] ?? null;
}

export const validPath = (p: string): boolean => kindOf(p) !== null;

/** Byte order of UTF-8; paths are ASCII, so this is also the order of the strings' code units. */
const byBytes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function encodeSite(m: SiteManifest): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, m.name],
      [1, m.previous ? unhex(m.previous) : null],
      [2, m.files.map((f) => [f.path, unhex(f.work), f.size, unhex(f.locked), f.nonce, f.key])],
    ]),
  );
}

/** Decode a manifest strictly (closed format, valid sorted unique paths, a front page). Throws the reason. */
export function decodeSite(bytes: Uint8Array): SiteManifest {
  const m = cborDecode(bytes);
  if (!(m instanceof Map)) throw new Error('a site manifest is a map');
  for (const k of m.keys()) if (k !== 0 && k !== 1 && k !== 2) throw new Error(`site manifest: unknown field ${String(k)}`);
  const name = m.get(0);
  if (typeof name !== 'string') throw new Error('site manifest: name');
  try {
    checkText(name);
  } catch {
    throw new Error('site manifest: the name is not canonical text');
  }
  const prev = m.get(1);
  if (prev !== null && !(prev instanceof Uint8Array && prev.length === 32)) throw new Error('site manifest: previous');
  const list = m.get(2);
  if (!Array.isArray(list) || !list.length) throw new Error('site manifest: no files');
  const bytesOf = (v: unknown, n: number, w: string) => {
    if (!(v instanceof Uint8Array) || v.length !== n) throw new Error(`site manifest: ${w}`);
    return v;
  };
  const files = list.map((x: unknown) => {
    if (!Array.isArray(x) || x.length !== 6) throw new Error('site manifest: a file has six fields');
    const [path, work, size, locked, nonce, key] = x as unknown[];
    if (typeof path !== 'string' || !validPath(path)) throw new Error(`site manifest: not a valid path: ${JSON.stringify(path)}`);
    if (typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0) throw new Error('site manifest: file size');
    return {
      path,
      work: hex(bytesOf(work, 32, 'work hash')),
      size,
      locked: hex(bytesOf(locked, 32, 'locked hash')),
      nonce: bytesOf(nonce, 24, 'nonce'),
      key: bytesOf(key, 32, 'key'),
    };
  });
  files.forEach((f, i) => {
    if (i && byBytes(files[i - 1].path, f.path) >= 0) throw new Error('site manifest: paths sorted and unique');
  });
  if (!files.some((f) => f.path === FRONT)) throw new Error('site manifest: no front page (index.html)');
  return { name, previous: prev === null ? null : hex(prev as Uint8Array), files };
}

/**
 * The path a request's address names (rule 3): `/` and `/a/` name the
 * folder's `index.html`; `/a.html` names `a.html`. Null when the address
 * names no valid path. Nothing is decoded: a valid path needs no escape.
 */
export function pathFor(address: string): string | null {
  if (!address.startsWith('/')) return null;
  let p = address.slice(1);
  if (p === '' || p.endsWith('/')) p += FRONT;
  return validPath(p) ? p : null;
}

/** The address of a path: the inverse of `pathFor`, with the front pages at their folder. */
export function addressOf(path: string): string {
  return '/' + (path === FRONT ? '' : path.endsWith(`/${FRONT}`) ? path.slice(0, -FRONT.length) : path);
}

/**
 * A reference in a page, resolved against the page's own path, to a path
 * of the site; null if it leaves the site or names no valid path. Only
 * relative references and absolute paths are the site's.
 */
export function resolveRef(page: string, ref: string): string | null {
  if (!ref || /^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) return null;
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return page; // a link to a place in the same page
  const parts = clean.startsWith('/') ? [] : page.split('/').slice(0, -1);
  for (const s of clean.split('/')) {
    if (s === '' || s === '.') continue;
    if (s === '..') {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(s);
  }
  let p = parts.join('/');
  if (clean.endsWith('/') || p === '') p = p ? `${p}/${FRONT}` : FRONT;
  return validPath(p) ? p : null;
}
