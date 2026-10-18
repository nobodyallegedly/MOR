// Where Dub's program keeps what it holds: one folder on this machine,
// readable by its owner only (default ~/mor-dub, or ~/mor-poster from before
// the rename), never in the repository. Dub's web client keeps the same
// things in the browser instead (`web/keep.ts`).
//
//   identities/ID/identity.json   an identity, in the genesis client's format:
//                                 its signing key and its encryption keys, its
//                                 chain, and this app's line. Never a chain
//                                 key (F332, amended): it was shown once as
//                                 words. An identity made by Dub here before
//                                 16 October 2026 keeps the chain key it was
//                                 made with, unused, as it was.
//   identities/ID/settings.json   made here or brought here, the relays its
//                                 posts go to, other ways to reach an address
//   identities/ID/people.json     whom it follows (with the names given them,
//                                 never published), whom it mutes, its inbox
//                                 as read, the messages sent from here
//   active.json                   the identity in use
//   access.json                   the browsers paired with this program
//   run.json                      how the launcher reaches the running program
//
// A new identity waiting for three of its words is held in the program's
// memory only, never here: it carries the chain-key seed. Quitting forgets
// it, and nothing of it was published.
//
// A folder from before 16 October 2026 (one identity.json and settings.json
// at its top) is moved into identities/ID/ the first time it is read.
//
// TEST IDENTITIES ONLY: every key is in these files, in software.

import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../genesis/src/identity.ts';
import { NO_SIGNING, type Keep, type MoneyKept, type Pending, type Settings, type SigningState } from './dub.ts';
import { NO_PEOPLE, type People } from './people.ts';

export const SETTINGS_LABEL = 'DUB. A test identity, its keys held in software in this folder: a prototype, never for a real identity.';

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const isId = (s: string) => /^[0-9a-f]{64}$/.test(s);

export class Store implements Keep {
  private waiting: Pending | null = null;

  constructor(readonly dir: string) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
    this.migrate();
  }

  path(...p: string[]): string {
    return join(this.dir, ...p);
  }

  /** One identity at the folder's top, as Dub kept it before 16 October 2026: moved into identities/ID/, and in use. */
  private migrate(): void {
    const old = this.path('identity.json');
    if (!existsSync(old)) return;
    const f = readJson<IdentityFile>(old);
    if (f.label !== TEST_LABEL || !isId(f.identity)) return;
    const to = this.idDir(f.identity);
    renameSync(old, join(to, 'identity.json'));
    if (existsSync(this.path('settings.json'))) renameSync(this.path('settings.json'), join(to, 'settings.json'));
    rmSync(this.path('pending.json'), { force: true });
    writeJson(this.path('active.json'), { active: f.identity });
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
    return new TestIdentity(f, (await this.settings(id)).via);
  }

  async saveIdentity(id: TestIdentity): Promise<void> {
    id.save(join(this.idDir(id.id), 'identity.json'));
  }

  async settings(id: string): Promise<Settings> {
    const p = this.path('identities', id, 'settings.json');
    if (!existsSync(p)) return { kind: 'made', relays: [], via: {} };
    const { label: _, ...s } = readJson<Settings & { label: string }>(p);
    return s;
  }

  async saveSettings(id: string, s: Settings): Promise<void> {
    writeJson(join(this.idDir(id), 'settings.json'), { label: SETTINGS_LABEL, ...s });
  }

  async people(id: string): Promise<People> {
    const p = this.path('identities', id, 'people.json');
    return existsSync(p) ? { ...NO_PEOPLE(), ...readJson<People>(p) } : NO_PEOPLE();
  }

  async savePeople(id: string, p: People): Promise<void> {
    writeJson(join(this.idDir(id), 'people.json'), p);
  }

  /** The Signing tab's state: `identities/ID/signing.json`, owner-only, holding a one-time key's secret only while its share waits (H18). */
  async signing(id: string): Promise<SigningState> {
    const p = this.path('identities', id, 'signing.json');
    return existsSync(p) ? { ...NO_SIGNING(), ...readJson<SigningState>(p) } : NO_SIGNING();
  }

  async saveSigning(id: string, s: SigningState): Promise<void> {
    writeJson(join(this.idDir(id), 'signing.json'), s);
  }

  /** What Dub keeps for money (round 2): `identities/ID/money-NAME.json`, owner-only: its lane's key and strand, the payments it signs under it, the keys of posts sold or bought. */
  async money<T>(id: string, name: MoneyKept): Promise<T | null> {
    const p = this.path('identities', id, `money-${name}.json`);
    return existsSync(p) ? readJson<T>(p) : null;
  }

  async saveMoney(id: string, name: MoneyKept, v: unknown): Promise<void> {
    writeJson(join(this.idDir(id), `money-${name}.json`), v);
  }

  async forget(id: string): Promise<void> {
    if (!isId(id)) return;
    rmSync(this.path('identities', id), { recursive: true, force: true });
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

  /** One program per folder (the launcher sees to it), and `Dub` runs one thing at a time. */
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    return f();
  }
}
