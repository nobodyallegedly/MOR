// Where Ummia's program keeps what it holds: one folder on this machine,
// readable by its owner only (default ~/mor-ummia), never in the
// repository. Ummia's web client keeps the same things in the browser
// (`web/keep.ts`).
//
//   identities/ID/identity.json   an identity brought by its signing key's words, in the
//                                 genesis client's format: its signing key, its encryption
//                                 keys, its chain, Ummia's line. Never a chain key.
//   identities/ID/settings.json   the relays its acts go to, the relays tracking asks, the
//                                 reporting identity, who acts
//   identities/ID/book.json       its releases (each manifest's bytes), the specifications it
//                                 published, its MIP drafts, its reports, and each anchor asked
//                                 with its blind (a lost blind loses the anchor's use)
//   active.json                   the identity in use
//   access.json, run.json         the browsers paired, and how the launcher reaches the program
//
// TEST IDENTITIES ONLY.

import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../genesis/src/identity.ts';
import type { Keep } from './ummia.ts';

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const isId = (s: string) => /^[0-9a-f]{64}$/.test(s);

export class Store implements Keep {
  constructor(readonly dir: string) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
  }

  path(...p: string[]): string {
    return join(this.dir, ...p);
  }

  private idDir(id: string): string {
    if (!isId(id)) throw new Error('not an identity ID');
    const d = this.path('identities', id);
    mkdirSync(d, { recursive: true, mode: 0o700 });
    return d;
  }

  async held(): Promise<string[]> {
    const d = this.path('identities');
    if (!existsSync(d)) return [];
    return readdirSync(d)
      .filter((x) => isId(x) && existsSync(join(d, x, 'identity.json')))
      .sort();
  }

  async active(): Promise<string | null> {
    const p = this.path('active.json');
    if (!existsSync(p)) return null;
    const a = readJson<{ active: string | null }>(p).active;
    return a && (await this.held()).includes(a) ? a : null;
  }

  async setActive(id: string | null): Promise<void> {
    writeJson(this.path('active.json'), { active: id });
  }

  async identity(id: string): Promise<TestIdentity | null> {
    if (!isId(id)) return null;
    const p = this.path('identities', id, 'identity.json');
    if (!existsSync(p)) return null;
    const f = readJson<IdentityFile>(p);
    if (f.label !== TEST_LABEL) throw new Error(`${p} is not a MOR test identity file`);
    return new TestIdentity(f, (await this.read<{ via: Record<string, string> }>(id, 'settings'))?.via ?? {});
  }

  async saveIdentity(id: TestIdentity): Promise<void> {
    if (id.f.safety.seeds) throw new Error('Ummia never keeps a chain key.');
    id.save(join(this.idDir(id.id), 'identity.json'));
  }

  async read<T>(id: string, name: 'settings' | 'book'): Promise<T | null> {
    if (!isId(id)) return null;
    const p = this.path('identities', id, `${name}.json`);
    return existsSync(p) ? readJson<T>(p) : null;
  }

  async write(id: string, name: 'settings' | 'book', v: unknown): Promise<void> {
    writeJson(join(this.idDir(id), `${name}.json`), v);
  }

  async forget(id: string): Promise<void> {
    if (!isId(id)) return;
    rmSync(this.path('identities', id), { recursive: true, force: true });
  }

  /** One program per folder (the launcher sees to it), and `Ummia` runs one thing at a time. */
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    return f();
  }
}
