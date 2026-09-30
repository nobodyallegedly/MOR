// Where the collective client keeps what it holds: one folder on the
// machine it runs on, readable by its owner only.
//
//   book.json             names, which identities are "you", personal releases
//   settings.json         homes, relays, other ways to reach an address, the checkout
//   identities/ID.json    test identity files (the genesis client's format)
//   collectives/ID.json   test collective files (the repo client's format)
//   history.jsonl         what was signed, when, and its digest
//   access.json           the browsers paired with this program
//
// TEST IDENTITIES ONLY: every key is in these files, in software.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, appendFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { TestIdentity, type Home } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { TestCollective } from '../../repo/src/collective.ts';

export const BOOK_LABEL =
  'MOR COLLECTIVE CLIENT. Test identities and test collectives, every key held in software in this folder: a prototype, never for real identities.';

export interface IdentityEntry {
  id: string;
  name: string;
  /** Yours: the identity you act as. Otherwise a simulated member, held here for the test. */
  mine: boolean;
  /** Releases this identity published under its own name, newest last. */
  releases: { id: string; version: string; manifest: string }[];
}

export interface Book {
  label: string;
  identities: IdentityEntry[];
  collectives: { id: string; name: string }[];
  /** Names given to identities this program does not hold. */
  names: Record<string, string>;
}

export interface Settings {
  homes: Home[];
  relays: string[];
  via: Via;
  /** The folder whose git-tracked files a release publishes, and a member compares before signing. */
  checkout: string | null;
}

export interface Signed {
  time: number;
  kind: string;
  title: string;
  digest: string;
  acts: string[];
}

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};

export class Store {
  constructor(readonly dir: string) {
    mkdirSync(join(dir, 'identities'), { recursive: true, mode: 0o700 });
    mkdirSync(join(dir, 'collectives'), { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
    if (!existsSync(this.path('book.json'))) {
      writeJson(this.path('book.json'), { label: BOOK_LABEL, identities: [], collectives: [], names: {} } satisfies Book);
    }
    if (!existsSync(this.path('settings.json'))) {
      writeJson(this.path('settings.json'), { homes: [], relays: [], via: {}, checkout: null } satisfies Settings);
    }
    if (this.book().label !== BOOK_LABEL) throw new Error(`${dir} is not a MOR collective client folder`);
  }

  path(...p: string[]): string {
    return join(this.dir, ...p);
  }

  book(): Book {
    return JSON.parse(readFileSync(this.path('book.json'), 'utf8')) as Book;
  }

  saveBook(b: Book): void {
    writeJson(this.path('book.json'), b);
  }

  settings(): Settings {
    return JSON.parse(readFileSync(this.path('settings.json'), 'utf8')) as Settings;
  }

  saveSettings(s: Settings): void {
    writeJson(this.path('settings.json'), s);
  }

  // ------------------------------------------------------------ identities and collectives

  private identityPath(id: string): string {
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('not an identity');
    return this.path('identities', `${id}.json`);
  }

  private collectivePath(id: string): string {
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('not a collective');
    return this.path('collectives', `${id}.json`);
  }

  holds(id: string): boolean {
    return /^[0-9a-f]{64}$/.test(id) && existsSync(this.identityPath(id));
  }

  identity(id: string): TestIdentity {
    if (!this.holds(id)) throw new Error(`this program does not hold ${id}`);
    return TestIdentity.load(this.identityPath(id), this.settings().via);
  }

  saveIdentity(i: TestIdentity): void {
    i.save(this.identityPath(i.id));
  }

  isCollective(id: string): boolean {
    return /^[0-9a-f]{64}$/.test(id) && existsSync(this.collectivePath(id));
  }

  collective(id: string): TestCollective {
    if (!this.isCollective(id)) throw new Error(`this program holds no collective ${id}`);
    return TestCollective.load(this.collectivePath(id), this.settings().via);
  }

  saveCollective(c: TestCollective): void {
    c.save(this.collectivePath(c.identity));
  }

  /**
   * A fingerprint of the files an operation depends on. An operation
   * reviewed on the page is carried out only if none of them changed in
   * between: otherwise what was shown may no longer be what gets signed.
   */
  stamp(ids: string[]): string {
    const h = createHash('sha256');
    for (const id of [...ids].sort()) {
      for (const p of [this.identityPath(id), this.collectivePath(id)]) {
        h.update(p);
        h.update(existsSync(p) ? readFileSync(p) : Buffer.alloc(0));
      }
    }
    return h.digest('hex');
  }

  // ------------------------------------------------------------ names

  /** How an identity is shown: its name here and a short fingerprint. */
  names(): (id: string) => string {
    const b = this.book();
    const known = new Map<string, string>();
    for (const i of b.identities) known.set(i.id, i.mine ? `${i.name} (you)` : i.name);
    for (const c of b.collectives) known.set(c.id, `the collective “${c.name}”`);
    for (const [id, n] of Object.entries(b.names)) if (!known.has(id)) known.set(id, n);
    return (id: string) => {
      const n = known.get(id);
      const fp = `${id.slice(0, 8)}…${id.slice(-4)}`;
      return n ? `${n} [${fp}]` : `an identity not known here [${fp}]`;
    };
  }

  // ------------------------------------------------------------ history

  record(s: Signed): void {
    appendFileSync(this.path('history.jsonl'), JSON.stringify(s) + '\n', { mode: 0o600 });
  }

  history(): Signed[] {
    if (!existsSync(this.path('history.jsonl'))) return [];
    return readFileSync(this.path('history.jsonl'), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Signed);
  }
}
