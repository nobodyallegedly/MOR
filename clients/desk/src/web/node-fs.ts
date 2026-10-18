// `node:fs` in Edubba's web client: Edubba's folder, kept in this browser's
// IndexedDB (`vfs.ts`), with the calls the shared code makes, synchronous as
// on a computer. Nothing here reads a file of the computer the browser runs
// on. Modes are kept as they are asked and mean nothing in a browser: the
// folder is this site's only.

import { Buffer } from './buffer.ts';
import { folder, normal } from './vfs.ts';

type Enc = BufferEncoding | { encoding?: BufferEncoding | null; flag?: string; mode?: number } | null | undefined;
type BufferEncoding = 'utf8' | 'utf-8' | 'base64' | 'hex' | 'latin1' | 'binary';

const encodingOf = (o: Enc): BufferEncoding | null => (typeof o === 'string' ? o : (o?.encoding ?? null));
const bytesOf = (data: string | Uint8Array): Uint8Array => (typeof data === 'string' ? new TextEncoder().encode(data) : data);

export function existsSync(p: string): boolean {
  return !!folder.get(p);
}

export function readFileSync(p: string, o?: Enc): any {
  const b = Buffer.from(folder.file(p, 'open'));
  const enc = encodingOf(o);
  return enc ? b.toString(enc) : b;
}

export function writeFileSync(p: string, data: string | Uint8Array, _o?: Enc): void {
  folder.write(p, bytesOf(data), 'open');
}

export function appendFileSync(p: string, data: string | Uint8Array, _o?: Enc): void {
  const had = folder.get(p);
  const before = had && !had.dir ? had.data : new Uint8Array(0);
  folder.write(p, Buffer.concat([before, bytesOf(data)]), 'open');
}

export function mkdirSync(p: string, o?: { recursive?: boolean; mode?: number } | number): void {
  folder.mkdir(p, typeof o === 'object' && !!o?.recursive);
}

class Dirent {
  constructor(
    readonly name: string,
    private readonly dir: boolean,
  ) {}
  isFile() {
    return !this.dir;
  }
  isDirectory() {
    return this.dir;
  }
  isSymbolicLink() {
    return false;
  }
}

export function readdirSync(p: string, o?: { withFileTypes?: boolean } | BufferEncoding): any[] {
  const names = folder.list(p);
  if (typeof o === 'object' && o?.withFileTypes) return names.map((n) => new Dirent(n, !!folder.get(`${normal(p)}/${n}`)?.dir));
  return names;
}

export function renameSync(a: string, b: string): void {
  folder.rename(a, b);
}

export function rmSync(p: string, o: { recursive?: boolean; force?: boolean } = {}): void {
  folder.remove(p, o, 'rm');
}

export function unlinkSync(p: string): void {
  if (folder.get(p)?.dir) throw Object.assign(new Error(`EISDIR: illegal operation on a directory, unlink '${p}'`), { code: 'EISDIR' });
  folder.remove(p, {}, 'unlink');
}

export function rmdirSync(p: string): void {
  folder.remove(p, {}, 'rmdir');
}

export function copyFileSync(a: string, b: string): void {
  folder.write(b, folder.file(a, 'copyfile'), 'copyfile');
}

export function chmodSync(p: string, _mode: number): void {
  if (!folder.get(p)) throw Object.assign(new Error(`ENOENT: no such file or directory, chmod '${p}'`), { code: 'ENOENT' });
}

function stat(p: string) {
  const e = folder.get(p);
  if (!e) throw Object.assign(new Error(`ENOENT: no such file or directory, stat '${p}'`), { code: 'ENOENT' });
  return {
    isFile: () => !e.dir,
    isDirectory: () => e.dir,
    isSymbolicLink: () => false,
    size: e.dir ? 0 : e.data.length,
    mode: e.dir ? 0o40700 : 0o100600,
    mtimeMs: 0,
  };
}

export const statSync = stat;
export const lstatSync = stat;

export function realpathSync(p: string): string {
  stat(p);
  return normal(p);
}

export default { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync, renameSync, rmSync, unlinkSync, rmdirSync, copyFileSync, chmodSync, statSync, lstatSync, realpathSync };
