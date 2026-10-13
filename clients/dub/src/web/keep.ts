// Where Dub's web client keeps the identity: this browser's IndexedDB,
// database "dub", for this site only. What is kept, and how:
//
//   identity   the identity, in the genesis client's format, with its
//              signing key AS IT IS. Not locked: the only lock this page
//              could put on it is one it could open by itself, and so could
//              anything else running in this page. Said plainly on the page.
//              Never a chain key: a web-made identity's chain key was shown
//              once as words and dropped (F281); a brought one's never came.
//   settings   made here or brought here, and the relays its posts go to.
//
// A new identity waiting for its three words is held in this page's memory
// only, never in storage: it carries the chain-key seed. A reload forgets it,
// and nothing of it was published.
//
// TEST IDENTITIES ONLY (F281).

import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../../genesis/src/identity.ts';
import type { Keep, Pending, Settings } from '../dub.ts';

export const DB = 'dub';
const STORE = 'keep';
/** The Web Locks name every tab signing for this identity takes in turn. */
const LOCK = 'dub-signing';

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export class WebKeep implements Keep {
  private waiting: Pending | null = null;

  private constructor(private db: IDBDatabase) {}

  static async open(): Promise<WebKeep> {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    return new WebKeep(await request(r));
  }

  private async get<T>(key: string): Promise<T | undefined> {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key)) as Promise<T | undefined>;
  }

  private async put(key: string, value: unknown): Promise<void> {
    const t = this.db.transaction(STORE, 'readwrite');
    t.objectStore(STORE).put(value, key);
    await new Promise<void>((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error('the browser refused to keep it'));
    });
  }

  async identity(): Promise<TestIdentity | null> {
    const f = await this.get<IdentityFile>('identity');
    if (!f) return null;
    if (f.label !== TEST_LABEL) throw new Error('What this browser keeps is not a MOR test identity.');
    return new TestIdentity(f);
  }

  async saveIdentity(id: TestIdentity): Promise<void> {
    if (id.f.safety.seeds) throw new Error('A chain key is never kept in this browser.');
    await this.put('identity', JSON.parse(JSON.stringify(id.f)));
  }

  async settings(): Promise<Settings> {
    return (await this.get<Settings>('settings')) ?? { kind: 'made', relays: [], via: {} };
  }

  async saveSettings(s: Settings): Promise<void> {
    await this.put('settings', { kind: s.kind, relays: s.relays, via: {} });
  }

  async pending(): Promise<Pending | null> {
    return this.waiting;
  }

  async savePending(p: Pending): Promise<void> {
    this.waiting = p;
  }

  async dropPending(): Promise<void> {
    this.waiting = null;
  }

  /** Forget the identity in this browser: its signing key and its line. Only its carry words, if written down, bring it back. */
  async forget(): Promise<void> {
    await this.exclusive(async () => {
      const t = this.db.transaction(STORE, 'readwrite');
      t.objectStore(STORE).clear();
      await new Promise<void>((resolve, reject) => {
        t.oncomplete = () => resolve();
        t.onerror = () => reject(t.error);
      });
    });
  }

  /**
   * One signer at a time across every tab of this site: two tabs signing at
   * once would put two acts at one position of the line. Each signer reads
   * the identity afresh inside the lock (`Dub` does).
   */
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f) as Promise<T>;
  }
}
