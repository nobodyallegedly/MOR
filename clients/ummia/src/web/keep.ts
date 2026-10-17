// Where Ummia's web client keeps what it holds: this browser's IndexedDB,
// database "ummia", for this site only.
//
//   identity:ID   an identity brought by its signing key's words, its signing
//                 key and encryption keys AS THEY ARE, not locked (the only
//                 lock this page could put on them is one it could open by
//                 itself). Never a chain key.
//   settings:ID   the relays its acts go to, the relays tracking asks, the reporting identity.
//   book:ID       the specifications it published, its MIP drafts, its reports, each anchor
//                 asked with its blind. No release: releases need a folder on a computer.
//   active        the identity in use.
//
// TEST IDENTITIES ONLY.

import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../../genesis/src/identity.ts';
import type { Keep } from '../ummia.ts';

export const DB = 'ummia';
const STORE = 'keep';
const LOCK = 'ummia-signing';

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export class WebKeep implements Keep {
  private constructor(private db: IDBDatabase) {}

  static async open(): Promise<WebKeep> {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    return new WebKeep(await request(r));
  }

  private async get<T>(key: string): Promise<T | undefined> {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key)) as Promise<T | undefined>;
  }

  private async tx(f: (s: IDBObjectStore) => void): Promise<void> {
    const t = this.db.transaction(STORE, 'readwrite');
    f(t.objectStore(STORE));
    await new Promise<void>((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error('the browser refused to keep it'));
    });
  }

  private put(key: string, value: unknown): Promise<void> {
    return this.tx((s) => s.put(JSON.parse(JSON.stringify(value)), key));
  }

  async held(): Promise<string[]> {
    const keys = (await request(this.db.transaction(STORE).objectStore(STORE).getAllKeys())) as IDBValidKey[];
    return keys
      .map(String)
      .filter((k) => k.startsWith('identity:'))
      .map((k) => k.slice(9))
      .sort();
  }

  async active(): Promise<string | null> {
    const a = (await this.get<string | null>('active')) ?? null;
    return a && (await this.held()).includes(a) ? a : null;
  }

  async setActive(id: string | null): Promise<void> {
    await this.put('active', id);
  }

  async identity(id: string): Promise<TestIdentity | null> {
    const f = await this.get<IdentityFile>(`identity:${id}`);
    if (!f) return null;
    if (f.label !== TEST_LABEL) throw new Error('What this browser keeps is not a MOR test identity.');
    return new TestIdentity(f);
  }

  async saveIdentity(id: TestIdentity): Promise<void> {
    if (id.f.safety.seeds) throw new Error('A chain key is never kept in this browser.');
    await this.put(`identity:${id.id}`, id.f);
  }

  async read<T>(id: string, name: 'settings' | 'book'): Promise<T | null> {
    return (await this.get<T>(`${name}:${id}`)) ?? null;
  }

  async write(id: string, name: 'settings' | 'book', v: unknown): Promise<void> {
    await this.put(`${name}:${id}`, name === 'settings' ? { ...(v as object), via: {} } : v);
  }

  async forget(id: string): Promise<void> {
    await this.tx((s) => {
      for (const k of ['identity', 'settings', 'book']) s.delete(`${k}:${id}`);
    });
  }

  exclusive<T>(f: () => Promise<T>): Promise<T> {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f) as Promise<T>;
  }
}
