// Where the desk keeps what it holds: one folder on the machine it runs on,
// readable by its owner only.
//
//   book.json             names, and which identities are linked to Claude
//   settings.json         homes, relays, other ways to reach an address, the drafts folder
//   identities/ID.json    test identity files (the genesis client's format)
//   signed/DIGEST.json    each act signed from a draft, and what was sent, to send again
//   received/ID.json      what each identity received, and how the owner sorted it
//   history.jsonl         every answer given to a draft: approved, declined, sent back;
//                         and Machine, allegedly's terms, picks, nudges and answers, each with its cause
//   agents/ID.json        each agent's answering (Edubba, F333): its identity, its owner, its
//                         terms, its cap, its key (shared or its own) and what each cause led to
//                         (src/machine.ts); machine.json, the one agent of MOR Identities, is
//                         moved here the first time Edubba reads the folder
//   agents/ID.people.json whom the agent follows (the people cMIP, private by default)
//   machine/ACT.json      the acts the answering signed or read, to read them again (the nudge cMIP's readings)
//   access.json           the browsers paired with this program
//
// The drafts folder (DRAFTS.md in clients/connector) is elsewhere, shared
// with the connector; it holds no key.
//
// TEST IDENTITIES ONLY: every key is in these files, in software.

import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
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
  /** Made here, or brought here by its signing key's words (H15; the carry Module, draft 2). Absent: made here. */
  kind?: 'made' | 'brought';
  /** Brought here: the acts its homes held, signed with its key, when it was brought (made by the app it came from), so they raise no warning (F152). */
  elsewhere?: string[];
  /** Releases it published under its own name from Edubba (H16), oldest first, each with its manifest, to name as the one before a later release. */
  releases?: OwnRelease[];
}

/** A release under one's own name (H16; release manifest cMIP). */
export interface OwnRelease {
  /** Its publication's act id. */
  id: string;
  name: string;
  version: string;
  /** The manifest's exact bytes, base64. */
  manifest: string;
  /** The folder it was made from: a hint for the person, never in any act. */
  folder: string;
}

/** A collective brought here by its ID (H15): read from its homes and relays; Edubba holds none of its keys. */
export interface BroughtCollective {
  id: string;
  name: string;
  /** Where it was read: its homes and relays as found. */
  hints: string[];
  /** The identity held here, or in the collective client's folder, among the parties of its agreement in force when it was brought. */
  member: string;
}

export interface Book {
  label: string;
  identities: IdentityEntry[];
  /** Names given to identities this desk does not hold (senders, recipients). */
  names: Record<string, string>;
  /** Collectives brought here by their ID (H15). Absent in folders from before. */
  collectives?: BroughtCollective[];
  /** "What you may do for it", folded (false) or unfolded, per collective, as the person left it (H14). Absent: unfolded. */
  unfolded?: Record<string, boolean>;
}

export interface Settings {
  homes: Home[];
  relays: string[];
  via: Via;
  /** The drafts folder shared with the connector. */
  drafts: string;
}

/** Whom an agent follows (the people cMIP, draft 1): kept here, private unless published. */
export interface AgentPeople {
  follows: { id: string; name: string | null }[];
  muted: string[];
}

export type Sorted = 'new' | 'to answer' | 'answered' | 'ignored';
export type Kind = 'message' | 'reply' | 'acknowledgement' | 'payment' | 'split' | 'key delivery' | 'nudge' | 'pick' | 'terms' | 'other';

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
  /** A payment naming a version of a deal that does not descend from the version this identity holds: the seller's alarm (Agreements rule 45b, F186, client conformance). */
  alarm?: string;
  /** A payment naming an older version of a deal, with no fork: a plain notice, not the alarm (Agreements rule 45b, F188, DQ7). */
  notice?: string;
  /** Terms received (Agreements type 0): the deal-assessment tool's shares and fees, and risks (roadmap step 14). Signed in the collective client. */
  assessment?: { heading: string; lines: { text: string; tone?: 'warn' | 'bad' | 'ok' }[] }[];
  /** A split received (Agreements type 8): its service, the deal version it pays under, and its number (F188, DQ6). */
  split?: { service: string; agreement: string; number: number | null };
  /** The act's bytes, base64, and its content key where it was private: kept for a text act or an act of the nudge cMIP, so Machine, allegedly's answering can read it again. */
  raw?: { act: string; key?: string };
  /** An act of the nudge cMIP (a nudge, a pick or terms): its reading in plain words. */
  reading?: string;
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
  /** The draft answered; empty for what Machine, allegedly's answering did. */
  draft: string;
  verdict: 'approved' | 'declined' | 'sent back' | 'terms published' | 'picked' | 'nudged' | 'answered' | 'not answered' | 'prompted' | 'named' | 'released';
  /** The agent it concerns (Edubba, several agents); absent in records made before 16 October 2026, which concern Machine, allegedly. */
  agent?: string;
  signer: string;
  title: string;
  note: string;
  act?: string;
  /** What caused it, in plain words (Machine, allegedly's answering): whose act, which pick, which nudge. */
  cause?: string;
  /** The act that caused it. */
  causeAct?: string;
  /** Machine, allegedly's words, as signed. */
  text?: string;
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
  /**
   * A public reply: for each identity whose act it answers, the act sealed
   * to that identity, base64, and its inboxes (reading B1, docs/f272-build.md).
   * Made at signing, so sending again sends the same bytes.
   */
  copies?: { to: string; sealed: string; inbox: string[] }[];
  /** Identities answered that could not be given a copy, and why. */
  noCopy?: { to: string; why: string }[];
}

const writeJson = (path: string, v: unknown) => {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, path);
};

const HEX64 = /^[0-9a-f]{64}$/;

export class Store {
  constructor(readonly dir: string) {
    for (const d of ['identities', 'signed', 'received', 'machine', 'agents']) mkdirSync(join(dir, d), { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
    if (!existsSync(this.path('book.json'))) writeJson(this.path('book.json'), { label: BOOK_LABEL, identities: [], names: {} } satisfies Book);
    if (!existsSync(this.path('settings.json'))) writeJson(this.path('settings.json'), { homes: [], relays: [], via: {}, drafts: DEFAULT_DRAFTS } satisfies Settings);
    if (this.book().label !== BOOK_LABEL) throw new Error(`${dir} is not a MOR desk folder`);
    this.moveMachine();
  }

  /**
   * MOR Identities kept one agent, Machine, allegedly, in machine.json.
   * Edubba keeps each agent in agents/ID.json: the file is moved there,
   * unchanged, the first time the folder is read (its history stays where it
   * is). A machine.json whose terms were never signed holds nothing to move.
   */
  private moveMachine(): void {
    const old = this.path('machine.json');
    if (!existsSync(old)) return;
    const m = JSON.parse(readFileSync(old, 'utf8')) as { agent?: string | null; terms?: string | null };
    if (m.agent && m.terms && HEX64.test(m.agent) && !existsSync(this.agentPath(m.agent))) renameSync(old, this.agentPath(m.agent));
    else renameSync(old, this.path('machine.json.unused'));
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

  // ------------------------------------------------------------ Machine, allegedly's answering

  private agentPath(id: string, what = 'json'): string {
    if (!HEX64.test(id)) throw new Error('not an identity');
    return this.path('agents', `${id}.${what}`);
  }

  /** The agents: identities whose terms were signed here, oldest first. */
  agentIds(): string[] {
    const dir = this.path('agents');
    return readdirSync(dir)
      .filter((f) => /^[0-9a-f]{64}\.json$/.test(f))
      .map((f) => ({ id: f.slice(0, 64), t: (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { since?: number }).since ?? 0 }))
      .sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1))
      .map((x) => x.id);
  }

  isAgent(id: string): boolean {
    return HEX64.test(id) && existsSync(this.agentPath(id));
  }

  agent<T>(id: string, fresh: () => T): T {
    return this.isAgent(id) ? (JSON.parse(readFileSync(this.agentPath(id), 'utf8')) as T) : fresh();
  }

  saveAgent(id: string, m: unknown): void {
    writeJson(this.agentPath(id), m);
  }

  people(id: string): AgentPeople {
    const p = this.agentPath(id, 'people.json');
    return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as AgentPeople) : { follows: [], muted: [] };
  }

  savePeople(id: string, p: AgentPeople): void {
    writeJson(this.agentPath(id, 'people.json'), p);
  }

  /** An act kept for the answering's readings, with its content key where private. */
  keepAct(id: string, act: Uint8Array, key?: Uint8Array): void {
    if (!HEX64.test(id)) throw new Error('not an act');
    writeJson(this.path('machine', `${id}.json`), { act: Buffer.from(act).toString('base64'), key: key ? Buffer.from(key).toString('base64') : undefined });
  }

  keptActs(): { act: Uint8Array; key?: Uint8Array }[] {
    const dir = this.path('machine');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => /^[0-9a-f]{64}\.json$/.test(f))
      .map((f) => {
        const j = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { act: string; key?: string };
        return { act: Uint8Array.from(Buffer.from(j.act, 'base64')), key: j.key ? Uint8Array.from(Buffer.from(j.key, 'base64')) : undefined };
      });
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
