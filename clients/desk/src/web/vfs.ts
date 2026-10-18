// Edubba's folder in the web client: the same files the program keeps on a
// computer (`../store.ts`, `../real.ts`, `../member.ts`), held in this
// browser's IndexedDB, database "edubba", for this site only, one record per
// file. Edubba's code reads and writes its folder synchronously, so the
// whole folder is read into this page's memory when the page opens, every
// change is written back to IndexedDB at once, and each operation is
// answered only once its changes are kept (`flushed`).
//
// What is kept, as on a computer: the identities brought here (their signing
// and encryption keys, as they are, not locked), the real collectives founded
// here (the collective's signing key; never a share, never its chain key),
// the proposals and their answers, the contacts, a member's one-time key
// while its share waits to be written down, what each identity received.
// TEST IDENTITIES ONLY.
//
// One tab at a time (`web/app.ts` takes a lock): two tabs would each hold
// their own copy of the folder and sign from it.

export const DB = 'edubba';
const STORE = 'files';

type Entry = { dir: true } | { dir: false; data: Uint8Array };

const fail = (code: string, what: string, path: string) => Object.assign(new Error(`${code}: ${what}, '${path}'`), { code, path });

/** A path made absolute and plain: no `.`, no `..`, no trailing slash. */
export function normal(path: string): string {
  const out: string[] = [];
  for (const part of String(path).split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return `/${out.join('/')}`;
}

const parent = (p: string) => (p === '/' ? '/' : normal(`${p}/..`));

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

class Folder {
  private files = new Map<string, Entry>([['/', { dir: true }]]);
  private db: IDBDatabase | null = null;
  /** Changes not yet written to IndexedDB: a path's entry, or null for one removed. */
  private changed = new Map<string, Entry | null>();
  private writing: Promise<void> = Promise.resolve();
  private refused: Error | null = null;

  /** Read the whole folder from this browser's storage. */
  async open(): Promise<void> {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    this.db = await request(r);
    const t = this.db.transaction(STORE);
    const s = t.objectStore(STORE);
    const keys = (await request(s.getAllKeys())) as string[];
    const values = (await request(s.getAll())) as Entry[];
    keys.forEach((k, i) => this.files.set(k, values[i]));
  }

  /** Every change made so far, kept in IndexedDB; throws if the browser refused one. */
  async flushed(): Promise<void> {
    await this.writing;
    if (this.refused) {
      const e = this.refused;
      this.refused = null;
      throw new Error(`This browser refused to keep Edubba’s files (${e.message}): what was just done may not be kept.`);
    }
  }

  private scheduled = false;

  private queue(path: string, e: Entry | null): void {
    this.changed.set(path, e);
    if (this.scheduled) return;
    this.scheduled = true;
    // One transaction for the changes made meanwhile, written in order after the ones before.
    this.writing = this.writing.then(
      () =>
        new Promise<void>((resolve) => {
          queueMicrotask(() => {
            const batch = [...this.changed];
            this.changed.clear();
            this.scheduled = false;
            if (!this.db) return resolve();
            const t = this.db.transaction(STORE, 'readwrite');
            const s = t.objectStore(STORE);
            for (const [k, v] of batch) {
              if (v) s.put(v, k);
              else s.delete(k);
            }
            t.oncomplete = () => resolve();
            t.onerror = t.onabort = () => {
              this.refused = t.error ?? new Error('the transaction was aborted');
              resolve();
            };
          });
        }),
    );
  }

  private set(path: string, e: Entry | null): void {
    if (e) this.files.set(path, e);
    else this.files.delete(path);
    this.queue(path, e);
  }

  get(path: string): Entry | undefined {
    return this.files.get(normal(path));
  }

  file(path: string, op: string): Uint8Array {
    const p = normal(path);
    const e = this.files.get(p);
    if (!e) throw fail('ENOENT', `no such file or directory, ${op}`, p);
    if (e.dir) throw fail('EISDIR', `illegal operation on a directory, ${op}`, p);
    return e.data;
  }

  write(path: string, data: Uint8Array, op: string): void {
    const p = normal(path);
    const up = this.files.get(parent(p));
    if (!up?.dir) throw fail('ENOENT', `no such file or directory, ${op}`, p);
    if (this.files.get(p)?.dir) throw fail('EISDIR', `illegal operation on a directory, ${op}`, p);
    this.set(p, { dir: false, data: new Uint8Array(data) });
  }

  mkdir(path: string, recursive: boolean): void {
    const p = normal(path);
    const e = this.files.get(p);
    if (e) {
      if (e.dir && recursive) return;
      throw fail('EEXIST', 'file already exists, mkdir', p);
    }
    if (!this.files.get(parent(p))) {
      if (!recursive) throw fail('ENOENT', 'no such file or directory, mkdir', p);
      this.mkdir(parent(p), true);
    }
    this.set(p, { dir: true });
  }

  /** The names directly inside a folder, sorted. */
  list(path: string): string[] {
    const p = normal(path);
    const e = this.files.get(p);
    if (!e) throw fail('ENOENT', 'no such file or directory, scandir', p);
    if (!e.dir) throw fail('ENOTDIR', 'not a directory, scandir', p);
    const head = p === '/' ? '/' : `${p}/`;
    return [...this.files.keys()]
      .filter((k) => k !== p && k.startsWith(head) && !k.slice(head.length).includes('/'))
      .map((k) => k.slice(head.length))
      .sort();
  }

  /** A path and everything under it. */
  private under(p: string): string[] {
    return [...this.files.keys()].filter((k) => k === p || k.startsWith(`${p}/`));
  }

  rename(from: string, to: string): void {
    const a = normal(from);
    const b = normal(to);
    if (!this.files.get(a)) throw fail('ENOENT', 'no such file or directory, rename', a);
    if (!this.files.get(parent(b))?.dir) throw fail('ENOENT', 'no such file or directory, rename', b);
    if (a === b) return;
    for (const k of this.under(b)) this.set(k, null);
    for (const k of this.under(a)) {
      const e = this.files.get(k)!;
      this.set(k, null);
      this.set(b + k.slice(a.length), e);
    }
  }

  remove(path: string, o: { recursive?: boolean; force?: boolean }, op: string): void {
    const p = normal(path);
    const e = this.files.get(p);
    if (!e) {
      if (o.force) return;
      throw fail('ENOENT', `no such file or directory, ${op}`, p);
    }
    if (e.dir && !o.recursive && this.list(p).length) throw fail('ENOTEMPTY', `directory not empty, ${op}`, p);
    for (const k of this.under(p)) this.set(k, null);
  }
}

/** Edubba's folder in this browser: opened by `web/app.ts` before anything reads it. */
export const folder = new Folder();
