// Where the browser keeps its key for this page: IndexedDB, which holds a
// CryptoKey as it is, private half unreadable. One key per origin (here,
// per port on this machine).

import { newKey } from './api.ts';

const DB = 'mor-collective';
const STORE = 'keys';
const NAME = 'page-key';

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

/** This browser's key for this page, made the first time. */
export async function loadKey(): Promise<CryptoKeyPair> {
  const d = await db();
  const held = (await request(d.transaction(STORE).objectStore(STORE).get(NAME))) as CryptoKeyPair | undefined;
  if (held) return held;
  const keys = await newKey();
  await request(d.transaction(STORE, 'readwrite').objectStore(STORE).put(keys, NAME));
  return keys;
}

/** Forget the key: this browser must pair again. */
export async function forgetKey(): Promise<void> {
  const d = await db();
  await request(d.transaction(STORE, 'readwrite').objectStore(STORE).delete(NAME));
}
