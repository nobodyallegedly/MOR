// Where Dub's web client keeps its identities: this browser's IndexedDB,
// database "dub", for this site only. What is kept, and how:
//
//   identity:ID   an identity, in the genesis client's format, with its
//                 signing key and encryption keys AS THEY ARE. Not locked:
//                 the only lock this page could put on them is one it could
//                 open by itself, and so could anything else running in this
//                 page. Said plainly on the page. Never a chain key: it was
//                 shown once as words and dropped (F281, F332); a brought
//                 identity's never came.
//   settings:ID   made here or brought here, and the relays its posts go to.
//   people:ID     whom it follows (with the names given them, never
//                 published), whom it mutes, its inbox as read, the messages
//                 sent from here.
//   active        the identity in use.
//
// A new identity waiting for its three words is held in this page's memory
// only, never in storage: it carries the chain-key seed. A reload forgets it,
// and nothing of it was published. An identity kept before 16 October 2026
// (keys "identity" and "settings") is moved under its ID when first read.
//
// TEST IDENTITIES ONLY (F281).

import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../../genesis/src/identity.ts';
import type { Keep, Pending, Settings } from '../dub.ts';
import { NO_PEOPLE, type People } from '../people.ts';

export const DB = 'dub';
const STORE = 'keep';
/** The Web Locks name every tab signing for these identities takes in turn. */
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
    const k = new WebKeep(await request(r));
    await k.migrate();
    return k;
  }

  private async get<T>(key: string): Promise<T | undefined> {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key)) as Promise<T | undefined>;
  }

  private async write(f: (s: IDBObjectStore) => void): Promise<void> {
    const t = this.db.transaction(STORE, 'readwrite');
    f(t.objectStore(STORE));
    await new Promise<void>((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error('the browser refused to keep it'));
    });
  }

  private put(key: string, value: unknown): Promise<void> {
    return this.write((s) => s.put(JSON.parse(JSON.stringify(value)), key));
  }

  /** The single identity kept before 16 October 2026, moved under its ID and put in use. */
  private async migrate(): Promise<void> {
    const f = await this.get<IdentityFile>('identity');
    if (!f || f.label !== TEST_LABEL) return;
    const s = await this.get<Settings>('settings');
    await this.write((st) => {
      st.put(f, `identity:${f.identity}`);
      if (s) st.put(s, `settings:${f.identity}`);
      st.put(f.identity, 'active');
      st.delete('identity');
      st.delete('settings');
    });
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

  async settings(id: string): Promise<Settings> {
    return (await this.get<Settings>(`settings:${id}`)) ?? { kind: 'made', relays: [], via: {} };
  }

  async saveSettings(id: string, s: Settings): Promise<void> {
    await this.put(`settings:${id}`, { kind: s.kind, relays: s.relays, via: {} });
  }

  async people(id: string): Promise<People> {
    return { ...NO_PEOPLE(), ...((await this.get<People>(`people:${id}`)) ?? {}) };
  }

  async savePeople(id: string, p: People): Promise<void> {
    await this.put(`people:${id}`, p);
  }

  /** Forget an identity in this browser: its keys and everything kept about it. Only its signing key's words, if written down, bring it back. */
  async forget(id: string): Promise<void> {
    await this.write((s) => {
      for (const k of ['identity', 'settings', 'people']) s.delete(`${k}:${id}`);
    });
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

  /**
   * One signer at a time across every tab of this site: two tabs signing at
   * once would put two acts at one position of a line. Each signer reads
   * the identity afresh inside the lock (`Dub` does).
   */
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f) as Promise<T>;
  }
}
