// Where the collective client keeps what it holds: one folder on the
// machine it runs on, readable by its owner only.
//
//   book.json             names, which identities are "you", personal releases
//   settings.json         homes, relays, other ways to reach an address, the checkout
//   identities/ID.json    test identity files (the genesis client's format)
//   collectives/ID.json   test collective files (the repo client's format)
//   kept/ID.json          each holder's kept tally chains (Agreements rule 15a, F171)
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

/**
 * What a holder's client keeps of a split service's tally chain for one
 * stake (Agreements rule 15a, F171): the latest split it received that continued
 * the chain, and the running count that split carries; a split that
 * deviates never becomes the reference (F182). `tip` is null where the
 * chain was kept from its start and no split has continued it yet. Keyed by
 * `service collective stake`.
 */
export interface KeptTally {
  tip: string | null;
  counts: [string, number][];
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
  /**
   * Each identity file as last read or written here, with the one object
   * holding it: every part of this program that acts as a member uses the
   * same object, so that two copies of one member never sign two acts at
   * the same place in its sequence. A collective has no signing key
   * (Agreements rule 56): a member held here acts for it with their own key,
   * and that member's file is the one saved with the collective's.
   */
  private live = new Map<string, { i: TestIdentity; text: string }>();

  constructor(readonly dir: string) {
    mkdirSync(join(dir, 'identities'), { recursive: true, mode: 0o700 });
    mkdirSync(join(dir, 'collectives'), { recursive: true, mode: 0o700 });
    mkdirSync(join(dir, 'kept'), { recursive: true, mode: 0o700 });
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
    const path = this.identityPath(id);
    const text = readFileSync(path, 'utf8');
    const via = this.settings().via;
    const held = this.live.get(id);
    // The file unchanged since it was last read or written here: the same object.
    if (held && held.text === text) {
      held.i.via = via;
      return held.i;
    }
    const i = TestIdentity.load(path, via);
    this.live.set(id, { i, text });
    return i;
  }

  saveIdentity(i: TestIdentity): void {
    const path = this.identityPath(i.id);
    i.save(path);
    this.live.set(i.id, { i, text: readFileSync(path, 'utf8') });
  }

  isCollective(id: string): boolean {
    return /^[0-9a-f]{64}$/.test(id) && existsSync(this.collectivePath(id));
  }

  /**
   * A collective held here, with the member who acts for it set (`by`): a
   * collective has no signing key (Agreements rule 56), so a member makes
   * each act for it with their own key, naming it (rule 58). `actor`: that
   * member; otherwise a member held here whose voice remains, yours first.
   */
  collective(id: string, actor?: string): TestCollective {
    if (!this.isCollective(id)) throw new Error(`this program holds no collective ${id}`);
    const c = TestCollective.load(this.collectivePath(id), this.settings().via);
    const who = actor ?? this.actorFor(c);
    if (who && this.holds(who)) c.by(this.identity(who));
    return c;
  }

  /** The member held here who acts for a collective by default: one whose voice remains, yours first; else any member held here. */
  actorFor(c: TestCollective, not: string[] = []): string | null {
    const gone = new Set((c.f.departed ?? []).filter((d) => !d.returned).map((d) => d.member));
    const mine = new Set(this.book().identities.filter((i) => i.mine).map((i) => i.id));
    const held = c.f.members.filter((m) => this.holds(m) && !not.includes(m));
    const voices = held.filter((m) => !gone.has(m));
    return [...voices.filter((m) => mine.has(m)), ...voices, ...held][0] ?? null;
  }

  /** Saves the collective's file, and the file of the member who acted for it. */
  saveCollective(c: TestCollective): void {
    c.save(this.collectivePath(c.identity));
    const actor = c.id.actor;
    if (actor && this.holds(actor.id)) this.saveIdentity(actor);
  }

  /** A holder's kept tally chains (Agreements rule 15a, F171): its client's own record of every split delivered to it. */
  kept(holder: string): Record<string, KeptTally> {
    const p = this.keptPath(holder);
    return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as Record<string, KeptTally>) : {};
  }

  saveKept(holder: string, k: Record<string, KeptTally>): void {
    writeJson(this.keptPath(holder), k);
  }

  private keptPath(id: string): string {
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('not an identity');
    return this.path('kept', `${id}.json`);
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
