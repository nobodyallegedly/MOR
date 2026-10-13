// Where Dub's program keeps what it holds: one folder on this machine,
// readable by its owner only (default ~/mor-dub, or ~/mor-poster from before
// the rename), never in the repository. Dub's web client keeps the same
// things in the browser instead (`web/keep.ts`).
//
//   identity.json   the identity, in the genesis client's format: its keys
//                   (for an identity brought here, the signing key only: the
//                   chain key never travels), its chain, and this app's line
//   settings.json   made here or brought here, the relays its posts go to,
//                   other ways to reach an address
//   pending.json    a new identity whose words were shown, until three are
//                   typed back; nothing of it is published yet
//   access.json     the browsers paired with this program
//   run.json        how the launcher reaches the running program
//
// TEST IDENTITIES ONLY: every key is in these files, in software.

import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../genesis/src/identity.ts';
import type { Keep, Pending, Settings } from './dub.ts';

export const SETTINGS_LABEL = 'DUB. A test identity, its keys held in software in this folder: a prototype, never for a real identity.';

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};

export class Store implements Keep {
  constructor(readonly dir: string) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
  }

  path(...p: string[]): string {
    return join(this.dir, ...p);
  }

  async identity(): Promise<TestIdentity | null> {
    const p = this.path('identity.json');
    if (!existsSync(p)) return null;
    const f = JSON.parse(readFileSync(p, 'utf8')) as IdentityFile;
    if (f.label !== TEST_LABEL) throw new Error(`${p} is not a MOR test identity file`);
    return new TestIdentity(f, (await this.settings()).via);
  }

  async saveIdentity(id: TestIdentity): Promise<void> {
    id.save(this.path('identity.json'));
  }

  async settings(): Promise<Settings> {
    const p = this.path('settings.json');
    if (!existsSync(p)) return { kind: 'made', relays: [], via: {} };
    const { label: _, ...s } = JSON.parse(readFileSync(p, 'utf8')) as Settings & { label: string };
    return s;
  }

  async saveSettings(s: Settings): Promise<void> {
    writeJson(this.path('settings.json'), { label: SETTINGS_LABEL, ...s });
  }

  async pending(): Promise<Pending | null> {
    const p = this.path('pending.json');
    return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as Pending) : null;
  }

  async savePending(p: Pending): Promise<void> {
    writeJson(this.path('pending.json'), p);
  }

  async dropPending(): Promise<void> {
    rmSync(this.path('pending.json'), { force: true });
  }

  /** One program per folder (the launcher sees to it), and `Dub` runs one thing at a time. */
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    return f();
  }
}
