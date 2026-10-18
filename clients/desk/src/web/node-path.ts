// `node:path` in Edubba's web client: POSIX paths inside Edubba's folder in
// this browser (`vfs.ts`), whose working folder is `/`. The build puts this
// file in place of `node:path` (`scripts/build-web.ts`).

import { normal } from './vfs.ts';

export const sep = '/';
export const delimiter = ':';

export const isAbsolute = (p: string) => p.startsWith('/');

export function join(...parts: string[]): string {
  const j = parts.filter((p) => p !== '').join('/');
  if (!j) return '.';
  const n = normal(j);
  return isAbsolute(j) ? n : n.slice(1) || '.';
}

export function resolve(...parts: string[]): string {
  let at = '/';
  for (const p of parts) if (p) at = isAbsolute(p) ? p : `${at}/${p}`;
  return normal(at);
}

export const normalize = (p: string) => (isAbsolute(p) ? normal(p) : join(p));

export function dirname(p: string): string {
  const n = normalize(p);
  const i = n.lastIndexOf('/');
  return i < 0 ? '.' : i === 0 ? '/' : n.slice(0, i);
}

export function basename(p: string, ext?: string): string {
  const b = normalize(p).split('/').pop() ?? '';
  return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b;
}

export function extname(p: string): string {
  const b = basename(p);
  const i = b.lastIndexOf('.');
  return i > 0 ? b.slice(i) : '';
}

export function relative(from: string, to: string): string {
  const a = resolve(from).split('/').filter(Boolean);
  const b = resolve(to).split('/').filter(Boolean);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return [...a.slice(i).map(() => '..'), ...b.slice(i)].join('/');
}

export const posix = { sep, delimiter, isAbsolute, join, resolve, normalize, dirname, basename, extname, relative };
export default posix;
