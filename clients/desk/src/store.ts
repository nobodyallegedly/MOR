// Where the desk keeps what it holds: one folder on the machine it runs on,
// readable by its owner only.
//
//   book.json             names, and which identities are linked to Claude
//   settings.json         homes, relays, other ways to reach an address, the drafts folder
//   identities/ID.json    test identity files (the genesis client's format)
//   signed/DIGEST.json    each act signed from a draft, and what was sent, to send again
//   received/ID.json      what each identity received, and how the owner sorted it
//   history.jsonl         every answer given to a draft: approved, declined, sent back
//   access.json           the browsers paired with this program
//
// The drafts folder (DRAFTS.md in clients/connector) is elsewhere, shared
// with the connector; it holds no key.
//
// TEST IDENTITIES ONLY: every key is in these files, in software.

import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestIdentity, type Home } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { DEFAULT_DRAFTS } from '../../connector/src/config.ts';

export const BOOK_LABEL = "MOR DESK. Test identities, every key held in software in this folder: a prototype, never for real identities.";

export interface IdentityEntry {
  id: string;
  name: string;
  /** Linked to Claude: the connector may prepare drafts for it. */
  linked: boolean;
}

export interface Book {
  label: string;
  identities: IdentityEntry[];
  /** Names given to identities this desk does not hold (senders, recipients). */
  names: Record<string, string>;
}

export interface Settings {
  homes: Home[];
  relays: string[];
  via: Via;
  /** The drafts folder shared with the connector. */
  drafts: string;
}

export type Sorted = 'new' | 'to answer' | 'answered' | 'ignored';
export type Kind = 'message' | 'reply' | 'acknowledgement' | 'payment' | 'key delivery' | 'other';

/** One interaction an identity received, as read and judged when it arrived. */
export interface Item {
  /** The act's id; for a container that did not open, `sealed:` and the container's id. */
  key: string;
  kind: Kind;
  /** Who signed it. */
  from: string | null;
  act: string | null;
  /** Private (sealed to this identity) or public (addressed to it). */
  private: boolean;
  /** The core library's standing of the act, through its signer's identity chain. */
  standing: string;
  /** A text act's words, as its signer wrote them. */
  text?: string;
  /** This identity's own acts it answers (refs) or acknowledges (acks). */
  answers: string[];
  acknowledges: string[];
  /** A witness act (Identity type 15): its sender relies on the acts it names (F110). */
  witness?: boolean;
  /** Other acts it refers to. */
  refs: string[];
  /** What could not be read. */
  problem?: string;
  /** A payment naming a version of a deal that does not descend from the version this identity holds: the seller's alarm (Law rule 45b, F186, client conformance). */
  alarm?: string;
  /** When this desk first found it (this machine's clock: a hint, never part of any act). */
  found: number;
  sorted: Sorted;
}

export interface Received {
  /** Per inbox relay: the arrival number to ask after next time. */
  after: Record<string, number>;
  items: Item[];
}

/** What the desk answered to a draft. */
export interface Answered {
  time: number;
  draft: string;
  verdict: 'approved' | 'declined' | 'sent back';
  signer: string;
  title: string;
  note: string;
  act?: string;
}

/** An act signed from a draft, kept to send again if a relay or inbox was away. */
export interface SignedRecord {
  draft: string;
  act: string;
  /** The act's bytes, base64. */
  bytes: string;
  /** A message: the sealed container, base64, and the inboxes it goes to. */
  sealed?: string;
  inbox?: string[];
  /** A message's content key, base64: to check the act before it leaves. */
  key?: string;
  /** Media to put after a publication, base64. */
  media?: string[];
  relays: string[];
}

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};

const HEX64 = /^[0-9a-f]{64}$/;

export class Store {
  constructor(readonly dir: string) {
    for (const d of ['identities', 'signed', 'received']) mkdirSync(join(dir, d), { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
    if (!existsSync(this.path('book.json'))) writeJson(this.path('book.json'), { label: BOOK_LABEL, identities: [], names: {} } satisfies Book);
    if (!existsSync(this.path('settings.json'))) writeJson(this.path('settings.json'), { homes: [], relays: [], via: {}, drafts: DEFAULT_DRAFTS } satisfies Settings);
    if (this.book().label !== BOOK_LABEL) throw new Error(`${dir} is not a MOR desk folder`);
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

  // ------------------------------------------------------------ identities

  private identityPath(id: string): string {
    if (!HEX64.test(id)) throw new Error('not an identity');
    return this.path('identities', `${id}.json`);
  }

  holds(id: string): boolean {
    return HEX64.test(id) && existsSync(this.identityPath(id));
  }

  identity(id: string): TestIdentity {
    if (!this.holds(id)) throw new Error(`this desk does not hold ${id}`);
    return TestIdentity.load(this.identityPath(id), this.settings().via);
  }

  saveIdentity(i: TestIdentity): void {
    i.save(this.identityPath(i.id));
  }

  /** How an identity is shown: its name here and a short fingerprint. */
  names(): (id: string) => string {
    const b = this.book();
    const known = new Map<string, string>();
    for (const i of b.identities) known.set(i.id, i.name);
    for (const [id, n] of Object.entries(b.names)) if (!known.has(id)) known.set(id, n);
    return (id: string) => {
      const n = known.get(id);
      const fp = `${id.slice(0, 8)}…${id.slice(-4)}`;
      return n ? `${n} [${fp}]` : `an identity not known here [${fp}]`;
    };
  }

  // ------------------------------------------------------------ received

  received(id: string): Received {
    const p = this.path('received', `${id}.json`);
    if (!HEX64.test(id) || !existsSync(p)) return { after: {}, items: [] };
    return JSON.parse(readFileSync(p, 'utf8')) as Received;
  }

  saveReceived(id: string, r: Received): void {
    if (!HEX64.test(id)) throw new Error('not an identity');
    writeJson(this.path('received', `${id}.json`), r);
  }

  // ------------------------------------------------------------ signed acts

  signed(draft: string): SignedRecord | null {
    const p = this.path('signed', `${draft}.json`);
    if (!HEX64.test(draft) || !existsSync(p)) return null;
    return JSON.parse(readFileSync(p, 'utf8')) as SignedRecord;
  }

  saveSigned(s: SignedRecord): void {
    if (!HEX64.test(s.draft)) throw new Error('not a draft');
    writeJson(this.path('signed', `${s.draft}.json`), s);
  }

  // ------------------------------------------------------------ history

  record(a: Answered): void {
    appendFileSync(this.path('history.jsonl'), JSON.stringify(a) + '\n', { mode: 0o600 });
  }

  history(): Answered[] {
    if (!existsSync(this.path('history.jsonl'))) return [];
    return readFileSync(this.path('history.jsonl'), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Answered);
  }
}
