// Where MOR Post keeps what it holds: one folder on this machine, readable
// by its owner only (default ~/mor-poster), never in the repository.
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
import type { Via } from '../../genesis/src/transport.ts';

export const SETTINGS_LABEL = 'MOR POST. A test identity, its keys held in software in this folder: a prototype, never for a real identity.';

export interface Settings {
  label: string;
  /** Made here (the chain key held here, in software, as the genesis client holds it) or brought here (no chain key). */
  kind: 'made' | 'brought';
  relays: string[];
  via: Via;
}

export interface Pending {
  identity: IdentityFile;
  /** The three positions (1 to 24) to type back. */
  positions: number[];
  relays: string[];
  via: Via;
}

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};

export class Store {
  constructor(readonly dir: string) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
  }

  path(...p: string[]): string {
    return join(this.dir, ...p);
  }

  identity(): TestIdentity | null {
    const p = this.path('identity.json');
    if (!existsSync(p)) return null;
    const f = JSON.parse(readFileSync(p, 'utf8')) as IdentityFile;
    if (f.label !== TEST_LABEL) throw new Error(`${p} is not a MOR test identity file`);
    return new TestIdentity(f, this.settings().via);
  }

  saveIdentity(id: TestIdentity): void {
    id.save(this.path('identity.json'));
  }

  settings(): Omit<Settings, 'label'> {
    const p = this.path('settings.json');
    if (!existsSync(p)) return { kind: 'made', relays: [], via: {} };
    return JSON.parse(readFileSync(p, 'utf8')) as Settings;
  }

  saveSettings(s: Omit<Settings, 'label'>): void {
    writeJson(this.path('settings.json'), { label: SETTINGS_LABEL, ...s } satisfies Settings);
  }

  pending(): Pending | null {
    const p = this.path('pending.json');
    return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as Pending) : null;
  }

  savePending(p: Pending): void {
    writeJson(this.path('pending.json'), p);
  }

  dropPending(): void {
    rmSync(this.path('pending.json'), { force: true });
  }
}
