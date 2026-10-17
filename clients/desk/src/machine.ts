// Machine, allegedly, plugged in (roadmap, "Claude through the API";
// decided by Nobody, allegedly, 12 October 2026). Part of the desk's program,
// on the author's own machine, where the identities' keys and the API key
// are:
//
// - Its agency terms (the nudge cMIP, draft 2, "Machine, allegedly's first
//   terms") are shown in plain words, then signed with its key and published.
// - The owner's own acts sent to it or naming it, his messages and his
//   public replies, signed by his identity's key, are answered at once, with
//   no approval step: a reply to him, or a message to him alone, both free
//   under its terms.
// - Everyone else's are notified on the desk, nothing drafted. The owner
//   picks the ones that need an answer: his pick is a signed act (type 2)
//   naming the act; Machine, allegedly's answer names the pick and the act,
//   and goes out at once. "I censor only what interactions it does so with."
// - His nudge, a public act naming it with a number of actions: it chooses
//   what to do, a post, an answer to anyone, a message to him, within the
//   number; each action names the nudge, never a pick.
//
// Its words are drafted with Claude through Anthropic's API (src/claude.ts),
// from the act, its thread and MOR's texts, under a cap on calls per day and
// on each answer's length. Every answer, and what caused it, is kept in the
// desk's history.

import { cborDecode, cborEncode, sha256 } from '../../genesis/src/core.ts';
import type { Reference } from '../../genesis/src/identity.ts';
import { recipientOf } from '../../connector/src/draft.ts';
import { escapeControls } from '../../connector/src/words.ts';
import { NUDGE_SPECS, NUDGE_TYPES, TEXT_ACT, KIND, type KindNumber } from '../../nudge/src/specs.ts';
import { Reading, encodeNudge, encodePick, encodeTerms, entryFor, termsInWords, type Terms } from '../../nudge/src/nudge.ts';
import { ClaudeError, DEFAULT_MODEL, findKey, inRepository, lastFour, writeAcceptance, writeAnswer, writeDiary, writeNudged, type Answering, type MemoryChanges, type Reach, type Read, type Settings, type Tools } from './claude.ts';
import { Memory, PER_ANSWER, loadNotes, noteProblem, shortName, type Note } from './memory.ts';
import type { AgentGrants } from './grants.ts';
import { identity as lookIdentity, readAct, toldText } from '../../connector/src/read.ts';
import { parseTarget } from '../../connector/src/target.ts';
import { readFeed } from '../../site/src/feed.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import type { Desk, Done } from './desk.ts';
import type { Answered, Item, Store } from './store.ts';

const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const now = () => Math.floor(Date.now() / 1000);
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

export const MACHINE_LABEL = 'MOR desk, Machine, allegedly’s answering, version 1';

/** The defaults of the cap (mechanics taken by the project lead: a spending cap). */
export const DEFAULTS = { callsPerDay: 20, maxChars: 1500, maxTokens: 8000 };

/** What one interaction led to. */
export interface Cause {
  kind: 'owner' | 'pick' | 'nudge';
  /** The act that caused it. */
  act: string;
  status: 'answered' | 'not answered';
  /** The acts Machine, allegedly signed because of it. */
  actions: string[];
  /** The acts answered because of it (a pick's act, a nudge's choices). */
  answered: string[];
  note: string;
  time: number;
}

export interface MachineFile {
  label: string;
  agent: string | null;
  owner: string | null;
  /** Its latest terms act signed here. */
  terms: string | null;
  /** Answering on or off: off, nothing is drafted and no call is made. */
  on: boolean;
  /** This machine's clock when the terms were published: what arrived before is not answered. */
  since: number;
  callsPerDay: number;
  maxChars: number;
  maxTokens: number;
  model: string;
  /** Calls made today, by this machine's local date. */
  usage: { day: string; calls: number };
  /** Why answering stopped, said on the desk until it can go on. */
  stopped: string | null;
  /** Which API key it uses (Edubba, F333): the shared one by default, or its own. Absent in files from before: shared. */
  keyKind?: 'shared' | 'own';
  /** Its display name as published (the naming cMIP), the act; absent where none was published from here. */
  named?: { name: string; act: string } | null;
  /** The days whose diary entry was written from here (H22, 6): the homes hold the entries; this only spares a look. */
  diaryDays?: string[];
  causes: Record<string, Cause>;
}

const fresh = (): MachineFile => ({
  label: MACHINE_LABEL,
  agent: null,
  owner: null,
  terms: null,
  on: false,
  since: 0,
  ...DEFAULTS,
  model: DEFAULT_MODEL,
  usage: { day: '', calls: 0 },
  stopped: null,
  keyKind: 'shared',
  named: null,
  causes: {},
});

/** Machine, allegedly's first terms, as cMIP draft 2 writes them, for this owner. */
export function firstTerms(owner: string, previous?: string): Terms {
  return {
    principals: [owner],
    allowed: [
      { kind: 0, whom: null, free: true },
      { kind: 1, whom: [owner], free: true },
      { kind: 2, whom: [owner], free: true },
      { kind: 1, whom: null, free: false },
      { kind: 2, whom: null, free: false },
    ],
    previous,
    owner,
    publicOnly: true,
    pickers: [owner],
    nudgedFree: true,
  };
}

/** Something the agent may answer under a nudge: an act sent to it, or a post of its feed (F333, the agent's view, answer (a)). */
interface Candidate {
  act: string;
  from: string;
  private: boolean;
  text?: string;
  how: string;
  /** A post of its feed, not something sent to it: fetched and kept before it is answered. */
  feed?: boolean;
}

/** The answering was stopped, with nothing sent and nothing spent: it waits, and goes on when the reason is gone. */
class Stopped extends Error {}

export interface MachineOptions {
  /** Where the API is: only the tests change it. */
  reach?: Reach;
  /** Where the key is looked for: the process's environment by default. */
  env?: NodeJS.ProcessEnv;
  home?: string;
  /** The repository: the grounding is read from it; a key file or the desk's folder inside it is refused. */
  repo?: string;
  /** The local date, for the daily cap. */
  today?: () => string;
}

const localDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** What an answer is given besides the act: who it is, its exchange and its notes (H22). */
interface Context {
  who: string;
  memory: string;
  thread: { from: string; text: string }[];
  /** The identities in the exchange: notes about them are loaded, and may be written. */
  identities: string[];
  /** Private messages it received: a note copies none of them into a note about someone else. */
  privates: { from: string; text: string }[];
  notes: Note[];
}

export class Machine {
  private running: Promise<unknown> = Promise.resolve();
  private memoryOf: Memory | null = null;
  /** The grants its owner gave it (set by Edubba's agents): under a nudge, it may post in its owner's name. */
  grants: AgentGrants | null = null;

  /** Its notes and diary, sealed to itself at its homes (H22). */
  get memory(): Memory {
    return (this.memoryOf ??= new Memory(this.desk, this.store));
  }

  /**
   * One agent's answering (Edubba keeps several, F333). `agentId`: the agent,
   * or null before any agent's terms are signed (its terms can then be shown
   * and signed, nothing else).
   */
  constructor(
    private readonly desk: Desk,
    private readonly store: Store,
    private readonly opts: MachineOptions = {},
    readonly agentId: string | null = null,
  ) {}

  private file(): MachineFile {
    return this.agentId ? { ...fresh(), ...this.store.agent(this.agentId, fresh) } : fresh();
  }

  /** Kept once its terms are signed; before, there is nothing of it to keep. */
  private save(m: MachineFile): void {
    const id = m.agent ?? this.agentId;
    if (id && m.terms) this.store.saveAgent(id, m);
  }

  /** A record in the history, naming this agent. */
  private note(a: Answered): void {
    this.store.record({ ...a, agent: a.agent ?? this.file().agent ?? this.agentId ?? undefined });
  }

  /** One answering operation at a time. */
  private alone<T>(f: () => Promise<T>): Promise<T> {
    const p = this.running.then(f, f);
    this.running = p.catch(() => undefined);
    return p;
  }

  /** A name for the readings and for Claude: the name given at this desk, else a fingerprint. */
  private nameOf(): (id: string) => string {
    const b = this.store.book();
    return (id: string) => b.identities.find((i) => i.id === id)?.name ?? b.names[id] ?? `an identity not known here [${short(id)}]`;
  }

  // ------------------------------------------------------------ the terms, shown first

  private check(agent: string, owner: string): void {
    if (!this.store.holds(agent)) throw new Error('Choose, as Machine, allegedly, an identity this desk holds: its terms are signed with its key.');
    if (!this.store.holds(owner)) throw new Error('Choose, as its owner, an identity this desk holds: his nudges and picks are signed with his key.');
    if (agent === owner) throw new Error('Machine, allegedly and its owner are two identities.');
  }

  private termsPayload(agent: string, owner: string): Uint8Array {
    const m = this.file();
    return encodeTerms(firstTerms(owner, m.agent === agent && m.terms ? m.terms : undefined));
  }

  /** The terms in plain words, before anything is signed (item 4), with the digest of exactly what would be signed. */
  previewTerms(agent: string, owner: string): { lines: string[]; digest: string } {
    this.check(agent, owner);
    const payload = this.termsPayload(agent, owner);
    const names = this.nameOf();
    return { lines: [`Signed by ${names(agent)}, public: its agency terms under the nudge cMIP (draft 2).`, ...termsInWords(firstTerms(owner), names)], digest: sha256(payload) };
  }

  /** Sign the terms shown, by their digest, with Machine, allegedly's key, and publish them. Answering is on from then. */
  async publishTerms(agent: string, owner: string, digest: string): Promise<Done> {
    return this.alone(async () => {
      this.check(agent, owner);
      const payload = this.termsPayload(agent, owner);
      if (sha256(payload) !== digest) throw new Error('These are not the terms shown: look at them again. Nothing was signed.');
      const s = await this.desk.signAndSend(agent, { spec: NUDGE_SPECS.nudge, type: NUDGE_TYPES.terms, payload, public: true, to: [], refs: [] });
      const m = this.agentId === agent ? this.file() : { ...fresh(), ...this.store.agent(agent, fresh) };
      Object.assign(m, { agent, owner, terms: s.id, on: true, since: m.since || now(), stopped: null });
      this.save(m);
      const names = this.nameOf();
      this.note({ time: now(), draft: '', verdict: 'terms published', agent, signer: agent, title: `${names(agent)}’s agency terms signed and published`, note: '', act: s.id });
      return { title: 'Terms signed and published', lines: s.sent.map((x) => ({ text: `${x.to}: ${x.answer}`, tone: x.accepted ? 'ok' : 'bad' })), acts: [s.id] };
    });
  }

  /** Which key it uses: the shared one, or its own (F333). */
  setKeyKind(kind: 'shared' | 'own'): void {
    const m = this.file();
    if (!m.terms) throw new Error('Sign its terms first.');
    m.keyKind = kind;
    if (m.stopped && !m.stopped.startsWith('The cap')) m.stopped = null;
    this.save(m);
  }

  /** Its display name, as published from here (the naming cMIP). */
  setNamed(named: { name: string; act: string }): void {
    const m = this.file();
    m.named = named;
    this.save(m);
  }

  /** The history of this agent: what it answered and why, its owner's picks, nudges and prompts, newest first. */
  history(): Answered[] {
    const m = this.file();
    if (!m.agent) return [];
    const oldest = this.store.agentIds()[0];
    return this.store
      .history()
      .filter((h) => h.agent === m.agent || (!h.agent && m.agent === oldest && (h.signer === m.agent || ['picked', 'nudged', 'terms published'].includes(h.verdict))))
      .reverse();
  }

  setOn(on: boolean): void {
    const m = this.file();
    if (on && !m.terms) throw new Error('Publish Machine, allegedly’s terms first.');
    m.on = on;
    if (on) m.stopped = null;
    this.save(m);
  }

  setCap(a: { callsPerDay: number; maxChars: number }): void {
    if (!this.file().terms) throw new Error('Sign its terms first: the cap belongs to an agent.');
    if (!Number.isInteger(a.callsPerDay) || a.callsPerDay < 0 || a.callsPerDay > 1000) throw new Error('Calls a day: a whole number from 0 to 1000.');
    if (!Number.isInteger(a.maxChars) || a.maxChars < 50 || a.maxChars > 20_000) throw new Error('An answer’s length: a whole number of characters from 50 to 20000.');
    const m = this.file();
    m.callsPerDay = a.callsPerDay;
    m.maxChars = a.maxChars;
    if (m.stopped?.startsWith('The cap')) m.stopped = null;
    this.save(m);
  }

  // ------------------------------------------------------------ what is read

  /** Every act this answering holds: what it signed and read, and what Machine, allegedly received. */
  private reading(m: MachineFile): Reading {
    const r = new Reading(this.nameOf());
    for (const k of this.store.keptActs()) r.add(k.act, k.key);
    if (m.agent) for (const it of this.store.received(m.agent).items) if (it.raw) r.add(unb64(it.raw.act), it.raw.key ? unb64(it.raw.key) : undefined);
    return r;
  }

  /** The text of an act held, or null. */
  private textOf(r: Reading, id: string): string | null {
    const h = r.held(id);
    if (!h?.opened || h.spec !== NUDGE_SPECS.text || h.type !== TEXT_ACT) return null;
    const t = (cborDecode(h.payload!) as Map<number, unknown>).get(0);
    return typeof t === 'string' ? t : null;
  }

  /** The thread an act belongs to: the acts it names that are held, oldest first, one level back each, at most five. */
  private thread(r: Reading, id: string, skip: string[]): { from: string; text: string; act: string; signer: string }[] {
    const names = this.nameOf();
    const out: { from: string; text: string; act: string; signer: string }[] = [];
    let cur = r.held(id);
    const seen = new Set<string>([id]);
    while (cur && out.length < 5) {
      const next = cur.refs.map((x) => r.held(x)).find((h) => h && !seen.has(h.id) && !skip.includes(h.id) && this.textOf(r, h.id) !== null);
      if (!next) break;
      seen.add(next.id);
      out.unshift({ from: names(next.signer), text: this.textOf(r, next.id)!, act: next.id, signer: next.signer });
      cur = next;
    }
    return out;
  }

  /**
   * The exchange an act belongs to (H22, 1): the acts it names, back a few
   * steps, then the earlier acts between the agent and the same counterpart
   * that Edubba holds (what the counterpart sent it, and what it answered),
   * oldest first, at most eight. "Right now it's not even aware of the
   * previous message" (Nobody, allegedly): a prompt names nothing, so the
   * conversation is found by who it is with.
   */
  private exchange(m: MachineFile, r: Reading, act: string, counterpart: string): { from: string; text: string; act: string; signer: string }[] {
    const agent = m.agent!;
    const names = this.nameOf();
    const refs = this.thread(r, act, []);
    const items = this.store.received(agent).items.filter((x) => x.from === counterpart && x.act && x.act !== act && x.text !== undefined);
    const theirs = new Set(items.map((x) => x.act!));
    const earlier: { from: string; text: string; act: string; signer: string; time: number }[] = items.map((x) => ({ from: names(counterpart), text: x.text!, act: x.act!, signer: counterpart, time: x.found }));
    for (const h of this.store.history()) {
      if (h.agent !== agent && h.signer !== agent) continue;
      if (h.verdict === 'answered' && h.act && h.text && h.causeAct && theirs.has(h.causeAct)) earlier.push({ from: `${names(agent)} (you)`, text: h.text, act: h.act, signer: agent, time: h.time });
    }
    const named = new Set(refs.map((x) => x.act));
    const rest = earlier
      .filter((x) => !named.has(x.act))
      .sort((a, b) => a.time - b.time)
      .slice(-8)
      .map(({ time: _t, ...x }) => x);
    return [...rest, ...refs];
  }

  /** Who the agent is, in plain words: loaded each time, not a note (H22). */
  private who(m: MachineFile, r: Reading): string {
    const names = this.nameOf();
    const terms = this.termsNow(r, m);
    return [
      `You are ${names(m.agent!)}, the MOR identity ${m.agent}.`,
      `Your owner is ${names(m.owner!)}, the identity ${m.owner}.`,
      'Your signed terms (the nudge cMIP), in plain words:',
      ...(terms ? termsInWords(terms, names).map((l) => `- ${l}`) : ['- (your terms could not be read here)']),
    ].join('\n');
  }

  /** What an answer is given besides the act (H22): who it is, the exchange, its notes loaded under the cap. */
  private async context(m: MachineFile, r: Reading, act: string, counterpart: string, more: string[] = []): Promise<Context> {
    const names = this.nameOf();
    const thread = this.exchange(m, r, act, counterpart);
    const identities = [...new Set([counterpart, ...more, ...thread.map((t) => t.signer)])].filter((x) => x !== m.agent);
    const privates = this.store
      .received(m.agent!)
      .items.filter((x) => x.private && x.from && x.text)
      .map((x) => ({ from: x.from!, text: x.text! }));
    let notes: Note[] = [];
    let memory: string;
    try {
      notes = (await this.memory.read(m.agent!)).notes;
      memory = loadNotes(notes, identities, names).text;
    } catch (e) {
      memory = `(Your notes could not be read from your homes: ${err(e)})`;
    }
    const people = identities.map((id) => `- ${names(id)}: fingerprint ${id}`).join('\n');
    return { who: `${this.who(m, r)}\n\nIdentities in this exchange:\n${people || '- none but you'}`, memory, thread: thread.map(({ from, text }) => ({ from, text })), identities, privates, notes };
  }

  /**
   * The notes an answer asked for, checked, then signed and sealed to itself
   * (H22): an owner's instruction only from the owner's own prompt; a note
   * about an identity only about one in the exchange; no key, no seed words,
   * no private content in a note about someone else; at most three added
   * and three retired. What is refused is said, never signed.
   */
  private async remember(m: MachineFile, ctx: Context, changes: MemoryChanges, cause: { prompt: string | null }): Promise<string[]> {
    const said: string[] = [];
    const agent = m.agent!;
    for (const a of changes.add.slice(0, PER_ANSWER)) {
      let about: string | null = null;
      if (a.kind === 'person') {
        const t = (a.about ?? '').toLowerCase().replace(/[^0-9a-f]/g, '');
        about = t.length >= 8 ? (ctx.identities.find((id) => id.startsWith(t) || id.endsWith(t)) ?? null) : null;
        if (!about) {
          said.push('A note about someone not in this exchange was not kept.');
          continue;
        }
      }
      if (a.kind === 'instruction' && !cause.prompt) {
        said.push('A standing instruction was not kept: one is made only from your own prompt to it.');
        continue;
      }
      const why = noteProblem({ kind: a.kind, about, text: a.text }, ctx.privates, m.owner);
      if (why) {
        said.push(`A note was not kept: ${why}`);
        continue;
      }
      try {
        const id = await this.memory.write(agent, { kind: a.kind, about, text: a.text, from: a.kind === 'instruction' ? cause.prompt : null });
        said.push(`Noted (${a.kind}${about ? `, about ${this.nameOf()(about)}` : ''}): ${shortName(id)}.`);
      } catch (e) {
        said.push(`A note was not kept: ${err(e)}`);
      }
    }
    if (changes.add.length > PER_ANSWER) said.push(`Only ${PER_ANSWER} new notes are kept from one answer.`);
    for (const short of changes.retire.slice(0, PER_ANSWER)) {
      const n = ctx.notes.find((x) => shortName(x.id) === short.trim().toLowerCase() && !x.dropped);
      if (!n) {
        said.push(`No live note named ${short.slice(0, 12)} to retire.`);
        continue;
      }
      try {
        await this.memory.retire(agent, n.id, 'agent');
        said.push(`Retired its note ${shortName(n.id)}.`);
      } catch (e) {
        said.push(`A note was not retired: ${err(e)}`);
      }
    }
    return said;
  }

  /** Acts sent to Machine, allegedly by anyone but its owner, that nothing answered yet: the "Notified" pile. */
  private notified(m: MachineFile): Item[] {
    if (!m.agent) return [];
    const answered = new Set(Object.values(m.causes).flatMap((c) => c.answered));
    const waiting = new Set(this.waiting(m).map((w) => w.picked));
    return this.store
      .received(m.agent)
      .items.filter((it) => it.act && it.from && it.from !== m.owner && it.from !== m.agent && (it.kind === 'message' || it.kind === 'reply') && !answered.has(it.act) && !waiting.has(it.act))
      .sort((a, b) => b.found - a.found);
  }

  /**
   * Picks signed here that wait to be answered (the cap, or no key): nothing
   * was recorded for them yet. The acts they name leave the Notified pile, so
   * that no act is picked twice; each is answered once the cap allows.
   */
  private waiting(m: MachineFile): { pick: string; picked: string; time: number }[] {
    if (!m.owner || !m.agent) return [];
    // Several agents may share an owner: a pick is this agent's where the act it names is one this agent received.
    const mine = new Set(this.store.received(m.agent).items.map((x) => x.act));
    return this.store
      .history()
      .filter((h) => h.verdict === 'picked' && h.signer === m.owner && h.act && h.causeAct && mine.has(h.causeAct) && !m.causes[h.act])
      .map((h) => ({ pick: h.act!, picked: h.causeAct!, time: h.time }));
  }

  // ------------------------------------------------------------ the cap and the key

  /** Count one call before it is made; stop, with nothing spent, at the cap or without a key. */
  private spend(m: MachineFile): string {
    if (inRepository(this.store.dir, this.opts.repo)) {
      throw new Stopped(`The desk’s folder ${this.store.dir} is inside the repository, where Machine, allegedly’s keys could be committed. Answering stopped; move the folder out.`);
    }
    let key: string;
    try {
      key = findKey(this.opts.env, this.opts.home, this.opts.repo, m.keyKind === 'own' ? m.agent! : undefined).key;
    } catch (e) {
      throw new Stopped(err(e));
    }
    const day = (this.opts.today ?? localDay)();
    if (m.usage.day !== day) m.usage = { day, calls: 0 };
    if (m.usage.calls >= m.callsPerDay) {
      throw new Stopped(`The cap was reached: ${m.callsPerDay} call${m.callsPerDay === 1 ? '' : 's'} to Claude today (${day}, this Mac’s clock). Machine, allegedly makes no more calls until tomorrow, or until the cap is raised; what arrives meanwhile waits, and is answered then.`);
    }
    m.usage.calls++;
    m.stopped = null;
    this.save(m);
    return key;
  }

  /**
   * The connector's read-and-verify tools, for this agent (H21): any public
   * act fetched by its id from the places Edubba reads (and the relays a
   * link names), judged by the core library, and said as the connector says
   * it; an identity looked up at its homes. Read only: nothing here signs,
   * keeps or sends anything. Each further round of reading is one more call
   * under the agent's daily cap.
   */
  private tools(): Tools {
    const { hints, via } = this.desk.places;
    return {
      run: async (name, input) => {
        if (name === 'mor_read') {
          const t = parseTarget(String(input.target ?? ''));
          return { text: toldText(await readAct(t.id, [...new Set([...t.relays, ...hints])], via)), ok: true };
        }
        if (name === 'mor_identity') {
          const id = String(input.identity ?? '').trim().toLowerCase();
          if (!/^[0-9a-f]{64}$/.test(id)) return { text: 'An identity is its hash: 64 hex digits.', ok: false };
          return { text: toldText(await lookIdentity(id, hints, via)), ok: true };
        }
        return { text: `No tool named ${name}.`, ok: false };
      },
      canMore: () => {
        const m = this.file();
        const day = (this.opts.today ?? localDay)();
        return (m.usage.day === day ? m.usage.calls : 0) < m.callsPerDay;
      },
      more: () => {
        const m = this.file();
        const day = (this.opts.today ?? localDay)();
        if (m.usage.day !== day) m.usage = { day, calls: 0 };
        if (m.usage.calls >= m.callsPerDay) return false;
        m.usage.calls++;
        this.save(m);
        return true;
      },
    };
  }

  private settings(m: MachineFile): Settings {
    const names = this.nameOf();
    return { model: m.model, maxTokens: m.maxTokens, maxChars: m.maxChars, agent: m.agent ? names(m.agent) : undefined, owner: m.owner ? names(m.owner) : undefined };
  }

  /**
   * The newest posts of those it follows (the people cMIP, kept here), muted
   * ones left out, verified, not yet answered: what it reads besides what is
   * sent to it, given to Claude under a nudge (F333, answer (a)).
   */
  async feedCandidates(m: MachineFile, limit = 10): Promise<Candidate[]> {
    if (!m.agent) return [];
    const p = this.store.people(m.agent);
    const authors = p.follows.map((f) => f.id).filter((id) => id !== m.agent && !p.muted.includes(id));
    if (!authors.length) return [];
    const answered = new Set(Object.values(m.causes).flatMap((c) => c.answered));
    const names = this.nameOf();
    const feed = await readFeed(authors.map((identity) => ({ identity, name: null })), this.desk.places.hints, this.desk.places.via, limit);
    return feed.posts
      .filter((x) => x.post && x.post.standing === 'valid' && !answered.has(x.id))
      .map((x) => ({ act: x.id, from: x.signer, private: false, text: x.post!.text, how: `a public post by ${names(x.signer)}, in your feed (those you follow)`, feed: true }));
  }

  // ------------------------------------------------------------ answering

  /**
   * Look for what Machine, allegedly received, and answer what it answers
   * on its own: its owner's acts, his picks and his nudges. Others' acts are
   * only notified. Run every so often by the desk's program, and at once on
   * the desk's "Look now".
   */
  async tick(): Promise<{ answered: number; stopped: string | null; problems: string[] }> {
    return this.alone(async () => {
      let m = this.file();
      if (m.stopped?.startsWith('The last look')) {
        m.stopped = null;
        this.save(m);
      }
      if (!m.on || !m.agent || !m.owner) return { answered: 0, stopped: m.on ? 'Machine, allegedly’s terms are not published yet.' : null, problems: [] };
      const { problems } = await this.desk.refresh(m.agent);
      let answered = 0;
      for (const it of this.store.received(m.agent).items) {
        m = this.file();
        if (!it.act || it.from !== m.owner || it.standing !== 'valid' || it.found < m.since || m.causes[it.act]) continue;
        try {
          if (it.kind === 'message' || it.kind === 'reply') await this.answerOwner(it);
          else if (it.kind === 'nudge') await this.answerNudge(it.act);
          else if (it.kind === 'pick') await this.answerPick(it.act);
          else continue;
          answered++;
        } catch (e) {
          if (e instanceof Stopped) break;
          throw e;
        }
      }
      try {
        await this.diaryIfDue();
      } catch (e) {
        if (!(e instanceof Stopped)) problems.push(`Its diary was not written: ${err(e)}`);
      }
      return { answered, stopped: this.file().stopped, problems };
    });
  }

  /** The day a record belongs to, by this machine's clock. */
  private static dayOf(time: number): string {
    const d = new Date(time * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * The diary (H22, 6): once a day, for the latest day before today on which
   * the agent acted and that has no entry yet, one call to Claude, the entry
   * sealed to the agent at its homes. "Not a log": the day's most striking
   * element, a brief reflection, and why it picked it. Never loaded into an
   * answer, shown nowhere unless its owner chooses to read it.
   */
  private async diaryIfDue(): Promise<string | null> {
    const m = this.file();
    if (!m.agent || !m.owner || !m.terms || !m.on) return null;
    const today = (this.opts.today ?? localDay)();
    const mine = this.history().filter((h) => Machine.dayOf(h.time) < today && h.text && (h.signer === m.agent || h.verdict === 'prompted'));
    if (!mine.length) return null;
    const day = Machine.dayOf(Math.max(...mine.map((h) => h.time)));
    if (m.diaryDays?.includes(day)) return null;
    const read = await this.memory.read(m.agent);
    if (read.diary.some((e) => e.day === day)) {
      m.diaryDays = [...(m.diaryDays ?? []), day].slice(-60);
      this.save(m);
      return null;
    }
    const key = this.spend(m);
    const names = this.nameOf();
    const r = this.reading(m);
    const happened = mine
      .filter((h) => Machine.dayOf(h.time) === day)
      .sort((a, b) => a.time - b.time)
      .map((h) => ({ from: h.verdict === 'prompted' ? `${names(h.signer)}, your owner, prompting you` : `${names(m.agent!)} (you): ${h.title}`, text: h.text! }));
    const w = await writeDiary({ who: this.who(m, r), day, happened }, key, this.settings(m), this.opts.reach, this.opts.repo);
    const id = await this.memory.writeDiary(m.agent, { day, striking: w.striking, reflection: w.reflection, why: w.why });
    const f = this.file();
    f.diaryDays = [...(f.diaryDays ?? []), day].slice(-60);
    this.save(f);
    this.note({ time: now(), draft: '', verdict: 'diary', signer: m.agent, title: `${names(m.agent)} wrote its diary for ${day}, sealed to itself`, note: 'Not shown here: read it only by choosing to, in its details.', act: id });
    return id;
  }

  /** Record a cause and its outcome, in machine.json and the desk's history. */
  private done(cause: Cause, history: { title: string; text?: string; act?: string; why: string; notClaimed?: string[]; read?: Read[] }): void {
    const m = this.file();
    m.causes[cause.act] = cause;
    this.save(m);
    this.note({
      time: cause.time,
      draft: '',
      verdict: cause.status === 'answered' ? 'answered' : 'not answered',
      signer: m.agent!,
      title: history.title,
      note: history.notClaimed?.length ? `Not claimed: ${history.notClaimed.join('; ')}` : cause.note,
      act: history.act,
      cause: history.why,
      causeAct: cause.act,
      text: history.text,
      read: history.read?.length ? history.read : undefined,
    });
  }

  /** Stop, saying why on the desk; nothing is recorded for the cause, which waits. */
  private stop(e: Stopped): never {
    const m = this.file();
    m.stopped = e.message;
    this.save(m);
    throw e;
  }

  /** The owner's own act, sent to Machine, allegedly or naming it: answered at once, a reply to him or a message to him alone. */
  private async answerOwner(it: Item): Promise<void> {
    const m = this.file();
    const agent = m.agent!;
    const owner = m.owner!;
    const names = this.nameOf();
    const r = this.reading(m);
    const terms = this.termsNow(r, m);
    const kind: KindNumber = it.private ? KIND.message : KIND.reply;
    const how = it.private ? 'a private message to you' : it.kind === 'reply' ? 'a public reply to one of your acts' : 'a public act addressed to you';
    const why = `${names(owner)}’s own ${it.private ? 'message' : 'public act'} ${short(it.act!)}, answered at once`;
    const cause: Cause = { kind: 'owner', act: it.act!, status: 'not answered', actions: [], answered: [], note: '', time: now() };
    const entry = terms && entryFor(terms, kind, [owner]);
    if (!entry?.free) {
      cause.note = `Its terms do not let ${it.private ? 'a message to him alone' : 'a reply to him'} go out freely.`;
      return this.done(cause, { title: `Not answered: ${names(owner)}’s ${it.private ? 'message' : 'act'}`, why });
    }
    let key: string;
    try {
      key = this.spend(m);
    } catch (e) {
      if (e instanceof Stopped) this.stop(e);
      throw e;
    }
    const ctx = await this.context(m, r, it.act!, owner);
    const answering: Answering = { who: ctx.who, memory: ctx.memory, from: `${names(owner)}, your owner`, how, text: it.text ?? '', thread: ctx.thread, why: 'his own act: you answer him at once' };
    try {
      const w = await writeAnswer(answering, key, this.settings(m), this.opts.reach, this.opts.repo, this.tools());
      const refs: Reference[] = [it.private ? it.act! : [it.act!, owner]];
      const s = await this.desk.signAndSend(agent, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: textPayload(w.text), public: !it.private, to: [owner], refs });
      const noted = await this.remember(m, ctx, w.memory, { prompt: it.private ? it.act! : null });
      Object.assign(cause, { status: 'answered', actions: [s.id], answered: [it.act!], note: [delivered(s.sent), ...noted].join(' ') });
      this.done(cause, { title: `${names(agent)} answered ${names(owner)}’s ${it.private ? 'message, privately' : 'act, publicly'}`, text: w.text, act: s.id, why, notClaimed: w.notClaimed, read: w.read });
    } catch (e) {
      cause.note = err(e);
      this.done(cause, { title: `Not answered: ${names(owner)}’s ${it.private ? 'message' : 'act'}`, why });
    }
  }

  /** The latest terms this desk signed, read. */
  private termsNow(r: Reading, m: MachineFile): Terms | null {
    if (!m.terms) return null;
    const t = r.termsAct(m.terms);
    return t && 'terms' in t ? t.terms : null;
  }

  /**
   * The agent is asked whether it accepts a grant from its owner (F128: the
   * grantee signs to accept it): one call to Claude under its cap, with who
   * it is and the grant in plain words.
   */
  async askAcceptance(words: string[]): Promise<{ accept: boolean; why: string }> {
    return this.alone(async () => {
      const m = this.file();
      if (!m.agent || !m.terms) throw new Error('Sign its terms first.');
      let key: string;
      try {
        key = this.spend(m);
      } catch (e) {
        if (e instanceof Stopped) this.stop(e);
        throw e;
      }
      const a = await writeAcceptance({ who: this.who(m, this.reading(m)), grant: words }, key, this.settings(m), this.opts.reach, this.opts.repo);
      return { accept: a.accept, why: a.why };
    });
  }

  /** The owner picks an act someone sent: his pick is signed and delivered, then Machine, allegedly answers it at once. */
  async pick(key: string): Promise<Done> {
    return this.alone(async () => {
      const m = this.file();
      if (!m.agent || !m.owner || !m.terms) throw new Error('Publish Machine, allegedly’s terms first.');
      const it = this.notified(m).find((x) => x.key === key);
      if (!it) throw new Error('That act is not in the Notified pile: it was answered already, or is not one Machine, allegedly received.');
      const s = await this.desk.signAndSend(m.owner, {
        spec: NUDGE_SPECS.nudge,
        type: NUDGE_TYPES.pick,
        payload: encodePick({ agent: m.agent, terms: m.terms, picked: it.act! }),
        public: true,
        to: [m.agent],
        refs: [],
      });
      const names = this.nameOf();
      this.note({ time: now(), draft: '', verdict: 'picked', signer: m.owner, title: `${names(m.owner)} picked ${names(it.from!)}’s ${it.private ? 'message' : 'act'} ${short(it.act!)}`, note: '', act: s.id, causeAct: it.act! });
      const r = await this.answerPick(s.id).catch((e) => (e instanceof Stopped ? null : Promise.reject(e)));
      const c = this.file().causes[s.id];
      const lines: Done['lines'] = [{ text: `The pick ${short(s.id)}, signed and delivered.`, tone: 'ok' }];
      if (c?.status === 'answered') lines.push({ text: `Machine, allegedly answered: ${short(c.actions[0])}. ${c.note}`, tone: 'ok' });
      else if (c) lines.push({ text: `Not answered: ${c.note}`, tone: 'bad' });
      else if (r === null) lines.push({ text: `Waiting: ${this.file().stopped}`, tone: 'bad' });
      return { title: 'Picked', lines, acts: [s.id, ...(c?.actions ?? [])] };
    });
  }

  /**
   * Several notified acts, picked in one approval (decided by Nobody,
   * allegedly, 13 October 2026: "document states that at most one pick per
   * action. As long as the app allows me to batch them it's fine."). The cMIP
   * is unchanged: one pick act for each act selected, each naming that act
   * alone; one answer for each pick. The selection, in the Notified pile's
   * order, with the pick payloads that would be signed.
   */
  private batch(m: MachineFile, keys: unknown): { items: Item[]; payloads: Uint8Array[] } {
    if (!m.agent || !m.owner || !m.terms) throw new Error('Publish Machine, allegedly’s terms first.');
    if (!Array.isArray(keys) || !keys.length || keys.some((k) => typeof k !== 'string')) throw new Error('Select at least one act in the Notified pile.');
    if (new Set(keys).size !== keys.length) throw new Error('An act was selected twice.');
    const pile = this.notified(m);
    const missing = keys.filter((k) => !pile.some((x) => x.key === k));
    if (missing.length) throw new Error(`${missing.length === 1 ? 'An act selected is' : `${missing.length} acts selected are`} no longer in the Notified pile: answered already, or picked and waiting. Nothing was signed.`);
    const items = pile.filter((x) => keys.includes(x.key));
    return { items, payloads: items.map((it) => encodePick({ agent: m.agent!, terms: m.terms!, picked: it.act! })) };
  }

  /** The digest of exactly what a batch signs: its pick payloads, one after another, in order. */
  private static batchDigest(payloads: Uint8Array[]): string {
    return sha256(Buffer.concat(payloads.map((p) => Buffer.from(p))));
  }

  /** The picks a batch would sign, shown together in plain words, with the acts' fingerprints, before anything is signed. */
  previewPicks(keys: unknown): { lines: string[]; digest: string; acts: string[] } {
    const m = this.file();
    const { items, payloads } = this.batch(m, keys);
    const names = this.nameOf();
    const n = items.length;
    const day = (this.opts.today ?? localDay)();
    const left = Math.max(0, m.callsPerDay - (m.usage.day === day ? m.usage.calls : 0));
    const excerpt = (t: string | undefined) => (t === undefined ? '(its words are not readable here)' : `“${escapeControls(t.length > 140 ? `${t.slice(0, 140)}…` : t)}”`);
    return {
      lines: [
        `Signed by ${names(m.owner!)}, public, delivered to ${names(m.agent!)}: ${n === 1 ? 'one pick' : `${n} picks`}, one for each act below. Each pick names that act alone, and lets ${names(m.agent!)} answer it once.`,
        ...items.map((it, i) => `${i + 1}. ${it.private ? 'A private message' : it.kind === 'reply' ? 'A public reply' : 'A public message'} from ${names(it.from!)}, act ${short(it.act!)}: ${excerpt(it.text)}`),
        `Then ${names(m.agent!)} answers them in this order, one call to Claude each, in kind (a private message privately). What it says is its own.`,
        left >= n
          ? `The cap allows it: ${left} call${left === 1 ? '' : 's'} left today, of ${m.callsPerDay}.`
          : `The cap allows ${left} more call${left === 1 ? '' : 's'} today, of ${m.callsPerDay}: ${left === 0 ? 'none' : `the first ${left}`} answered now; the other picks are signed all the same, and wait, answered the next day or once the cap is raised.`,
      ],
      digest: Machine.batchDigest(payloads),
      acts: items.map((it) => it.act!),
    };
  }

  /** Sign the picks shown, by their digest, one for each act; then answer each in turn, within the cap. */
  async pickMany(keys: unknown, digest: string): Promise<Done> {
    return this.alone(async () => {
      const m = this.file();
      const { items, payloads } = this.batch(m, keys);
      if (Machine.batchDigest(payloads) !== digest) throw new Error('These are not the picks shown: look at them again. Nothing was signed.');
      const names = this.nameOf();
      const what = (it: Item) => `${names(it.from!)}’s ${it.private ? 'message' : 'act'} ${short(it.act!)}`;
      const lines: Done['lines'] = [];
      const picks: { it: Item; id: string }[] = [];
      // The approval: one pick act for each act selected.
      for (const [i, it] of items.entries()) {
        try {
          const s = await this.desk.signAndSend(m.owner!, { spec: NUDGE_SPECS.nudge, type: NUDGE_TYPES.pick, payload: payloads[i], public: true, to: [m.agent!], refs: [] });
          this.note({ time: now(), draft: '', verdict: 'picked', signer: m.owner!, title: `${names(m.owner!)} picked ${what(it)}`, note: `One of ${items.length} picked together.`, act: s.id, causeAct: it.act! });
          picks.push({ it, id: s.id });
        } catch (e) {
          lines.push({ text: `Not picked: ${what(it)}. The pick was not signed: ${err(e)}`, tone: 'bad' });
        }
      }
      // Then each answered as a single pick is, in order; at the cap, the rest wait.
      const answered: string[] = [];
      const waiting: string[] = [];
      const failed: string[] = [];
      const acts: string[] = [];
      let stopped = false;
      for (const p of picks) {
        if (!stopped) {
          try {
            await this.answerPick(p.id);
          } catch (e) {
            if (!(e instanceof Stopped)) throw e;
            stopped = true;
          }
        }
        const c = this.file().causes[p.id];
        acts.push(p.id, ...(c?.actions ?? []));
        if (c?.status === 'answered') {
          answered.push(what(p.it));
          lines.push({ text: `Answered: ${what(p.it)}, under the pick ${short(p.id)}, by ${short(c.actions[0])}. ${c.note}`, tone: 'ok' });
        } else if (c) {
          failed.push(what(p.it));
          lines.push({ text: `Not answered: ${what(p.it)}, under the pick ${short(p.id)}. ${c.note}`, tone: 'bad' });
        } else {
          waiting.push(what(p.it));
          lines.push({ text: `Waiting: ${what(p.it)}, under the pick ${short(p.id)}, signed; answered once the cap allows.`, tone: 'warn' });
        }
      }
      const summary: Done['lines'] = [{ text: `${picks.length === 1 ? 'One pick' : `${picks.length} picks`} signed and delivered, of ${items.length} selected.`, tone: picks.length === items.length ? 'ok' : 'bad' }];
      summary.push({ text: `Answered (${answered.length}): ${answered.join('; ') || 'none'}.`, tone: answered.length ? 'ok' : 'warn' });
      if (waiting.length) summary.push({ text: `Waiting (${waiting.length}): ${waiting.join('; ')}. ${this.file().stopped ?? ''}`.trim(), tone: 'bad' });
      if (failed.length) summary.push({ text: `Not answered (${failed.length}): ${failed.join('; ')}. Listed under “Not answered”, with Try again.`, tone: 'bad' });
      return { title: `Picked ${picks.length === 1 ? 'one act' : `${picks.length} acts`}`, lines: [...summary, ...lines], acts };
    });
  }

  /** Answer a pick: one action, naming the pick and the act it selected (item 7b). */
  private async answerPick(pickId: string): Promise<void> {
    const m = this.file();
    const agent = m.agent!;
    const names = this.nameOf();
    const r = this.reading(m);
    const may = r.mayAct(pickId);
    const p = r.readCause(pickId);
    const cause: Cause = { kind: 'pick', act: pickId, status: 'not answered', actions: [], answered: [], note: '', time: now() };
    const why = `picked by ${p ? names(p.signer) : 'someone'} (${short(pickId)})`;
    if (!may.ok || !p?.pick) {
      cause.note = `Not acted on: ${may.why}`;
      return this.done(cause, { title: 'A pick not acted on', why });
    }
    const it = this.store.received(agent).items.find((x) => x.act === p.pick!.picked);
    if (!it?.from) {
      cause.note = 'The act picked is not among what Machine, allegedly received.';
      return this.done(cause, { title: 'A pick not acted on', why });
    }
    const target = await this.reach(it);
    if (target) {
      cause.note = target;
      return this.done(cause, { title: `Not answered: ${names(it.from)}’s ${it.private ? 'message' : 'act'}`, why });
    }
    let key: string;
    try {
      key = this.spend(m);
    } catch (e) {
      if (e instanceof Stopped) this.stop(e);
      throw e;
    }
    const ctx = await this.context(m, r, it.act!, it.from);
    try {
      const w = await writeAnswer(
        { who: ctx.who, memory: ctx.memory, from: names(it.from), how: it.private ? 'a private message to you' : 'a public act addressed to you', text: it.text ?? '', thread: ctx.thread, why: `picked by ${names(p.signer)}, your owner: he chose that it be answered, never what you say` },
        key,
        this.settings(m),
        this.opts.reach,
        this.opts.repo,
        this.tools(),
      );
      const refs: Reference[] = [[pickId, p.signer], it.private ? it.act! : [it.act!, it.from]];
      const s = await this.desk.signAndSend(agent, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: textPayload(w.text), public: !it.private, to: [it.from], refs });
      const noted = await this.remember(m, ctx, w.memory, { prompt: null });
      Object.assign(cause, { status: 'answered', actions: [s.id], answered: [it.act!], note: [this.wordsOf(s.id), delivered(s.sent), ...noted].join(' ') });
      this.done(cause, { title: `${names(agent)} answered ${names(it.from)}’s ${it.private ? 'message, privately' : 'act, publicly'}`, text: w.text, act: s.id, why, notClaimed: w.notClaimed, read: w.read });
    } catch (e) {
      cause.note = err(e);
      this.done(cause, { title: `Not answered: ${names(it.from)}’s ${it.private ? 'message' : 'act'}`, why });
    }
  }

  /**
   * Whether an answer can reach the signer of an act, in kind: a public act
   * gets a public reply (published, a copy in its inbox where it has one);
   * a private one a private message, which needs the sender's inbox and
   * key. Null when it can; else why not, said before any call is made.
   */
  private async reach(it: { private: boolean; from: string | null }): Promise<string | null> {
    if (!it.private) return null;
    try {
      await recipientOf(it.from!, this.desk.places.hints, this.desk.places.via);
      return null;
    } catch (e) {
      return `A private message is answered privately, and its sender cannot receive one: ${err(e)}. Nothing was drafted or sent.`;
    }
  }

  /** A public act, from where acts are looked for. */
  private async fetchAct(id: string): Promise<Uint8Array | null> {
    for (const h of this.desk.places.hints) {
      try {
        const a = await relayAt(h, this.desk.places.via).getAct(id);
        if (a) return a;
      } catch {
        // not at that place
      }
    }
    return null;
  }

  /** The nudge cMIP's reading of an act just signed, in plain words. */
  private wordsOf(id: string): string {
    const r = this.reading(this.file());
    return r.readAction(id)?.words ?? '';
  }

  /** The owner nudges Machine, allegedly: a public act naming it, the number of actions it allows and his words; then it chooses, at once. */
  async nudge(count: number, context: string): Promise<Done> {
    return this.alone(async () => {
      const m = this.file();
      if (!m.agent || !m.owner || !m.terms) throw new Error('Publish Machine, allegedly’s terms first.');
      if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error('A nudge allows a whole number of actions, from 1 to 20.');
      const words = context.trim().normalize('NFC').replace(/\r\n?/g, '\n');
      if (words.length > 2000) throw new Error('The nudge’s words are longer than 2000 characters.');
      const payload = encodeNudge({ agent: m.agent, terms: m.terms, count, context: words || undefined });
      // Public, as its terms take public nudges only (field 4); delivered to its inbox.
      const s = await this.desk.signAndSend(m.owner, { spec: NUDGE_SPECS.nudge, type: NUDGE_TYPES.nudge, payload, public: true, to: [m.agent], refs: [] });
      const names = this.nameOf();
      this.note({ time: now(), draft: '', verdict: 'nudged', signer: m.owner, title: `${names(m.owner)} nudged ${names(m.agent)}, for ${count === 1 ? 'one action' : `${count} actions`}`, note: words, act: s.id });
      await this.answerNudge(s.id).catch((e) => (e instanceof Stopped ? null : Promise.reject(e)));
      const c = this.file().causes[s.id];
      const lines: Done['lines'] = [{ text: `The nudge ${short(s.id)}, signed, published and delivered.`, tone: 'ok' }];
      if (c) lines.push({ text: c.actions.length ? `Machine, allegedly took ${c.actions.length === 1 ? 'one action' : `${c.actions.length} actions`}. ${c.note}` : `No action: ${c.note}`, tone: c.actions.length ? 'ok' : 'warn' });
      else lines.push({ text: `Waiting: ${this.file().stopped}`, tone: 'bad' });
      return { title: 'Nudged', lines, acts: [s.id, ...(c?.actions ?? [])] };
    });
  }

  /** Under a nudge, Machine, allegedly chooses: posts, answers to anyone, a message to its owner; at most the nudge's number, each naming the nudge. */
  private async answerNudge(nudgeId: string): Promise<void> {
    const m = this.file();
    const agent = m.agent!;
    const owner = m.owner!;
    const names = this.nameOf();
    const r = this.reading(m);
    const may = r.mayAct(nudgeId);
    const n = r.readCause(nudgeId);
    const why = `a nudge from ${n ? names(n.signer) : 'someone'} (${short(nudgeId)})`;
    const cause: Cause = { kind: 'nudge', act: nudgeId, status: 'not answered', actions: [], answered: [], note: '', time: now() };
    if (!may.ok || !n?.nudge) {
      cause.note = `Not acted on: ${may.why}`;
      return this.done(cause, { title: 'A nudge not acted on', why });
    }
    const count = n.nudge.count;
    const notified: Candidate[] = this.notified(m)
      .slice(0, 10)
      .map((c) => ({ act: c.act!, from: c.from!, private: c.private, text: c.text, how: c.private ? 'a private message' : 'a public act addressed to you' }));
    let feed: Candidate[] = [];
    try {
      feed = (await this.feedCandidates(m)).filter((f) => !notified.some((x) => x.act === f.act));
    } catch {
      // its feed could not be read: it chooses from what was sent to it
    }
    const candidates = [...notified, ...feed];
    const named = (r.held(nudgeId)?.refs ?? []).flatMap((x) => {
      const t = this.textOf(r, x);
      return t === null ? [] : [{ from: names(r.held(x)!.signer), text: t }];
    });
    let key: string;
    try {
      key = this.spend(m);
    } catch (e) {
      if (e instanceof Stopped) this.stop(e);
      throw e;
    }
    const ctx = await this.context(m, r, nudgeId, owner, candidates.map((c) => c.from));
    const grant = this.grants?.live(agent, NUDGE_SPECS.text, TEXT_ACT) ?? null;
    let chosen: Awaited<ReturnType<typeof writeNudged>>;
    try {
      chosen = await writeNudged(
        { who: ctx.who, memory: ctx.memory, grant: grant ? this.grants!.wordsOf(grant).join('\n') : undefined, count, context: n.nudge.context ?? null, named, candidates: candidates.map((c, i) => ({ n: i + 1, from: names(c.from), how: c.how, text: c.text ?? '' })) },
        key,
        this.settings(m),
        this.opts.reach,
        this.opts.repo,
        this.tools(),
      );
    } catch (e) {
      cause.note = err(e);
      return this.done(cause, { title: 'A nudge not acted on', why });
    }
    const notes: string[] = [];
    const texts: string[] = [];
    // Client conformance: no more actions under a nudge than its count.
    for (const a of chosen.actions.slice(0, count)) {
      const refs: Reference[] = [[nudgeId, n.signer]];
      let to: string[] = [];
      let pub = true;
      let answered: string | null = null;
      if (a.kind === 'post in your owner’s name') {
        // Signed with the grant key, the owner's own act on the agent's strand (Agreements rule 73, F343).
        if (!grant) {
          notes.push('A post in its owner’s name was left out: it holds no live grant for posts.');
          continue;
        }
        try {
          const g = await this.grants!.sign(agent, grant.grant, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: textPayload(a.text), public: true, refs });
          cause.actions.push(g.act);
          texts.push(a.text);
          notes.push(g.authority?.words ?? `Signed under the grant ${short(grant.grant)}.`);
        } catch (e) {
          notes.push(`A post in its owner’s name was not signed: ${err(e)}`);
        }
        continue;
      } else if (a.kind === 'message to the owner') {
        to = [owner];
        pub = false;
      } else if (a.kind === 'answer') {
        const c = a.answers ? candidates[a.answers - 1] : undefined;
        if (!c) {
          notes.push(`An answer to an act not listed (${a.answers ?? 'none'}) was left out.`);
          continue;
        }
        const cannot = await this.reach(c);
        if (cannot) {
          notes.push(`An answer to ${names(c.from)} was left out: ${cannot}`);
          continue;
        }
        if (c.feed) {
          // Held before it is named, as what it receives is: its readings (and the
          // nudge cMIP's client conformance) read the act an answer names.
          const held = await this.fetchAct(c.act);
          if (!held) {
            notes.push(`An answer to ${names(c.from)}’s post was left out: the post was not found again.`);
            continue;
          }
          this.store.keepAct(c.act, held);
        }
        to = [c.from];
        pub = !c.private;
        refs.push(c.private ? c.act : [c.act, c.from]);
        answered = c.act;
      }
      try {
        const s = await this.desk.signAndSend(agent, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: textPayload(a.text), public: pub, to, refs });
        cause.actions.push(s.id);
        if (answered) cause.answered.push(answered);
        texts.push(a.text);
        notes.push(`${this.wordsOf(s.id)} ${delivered(s.sent)}`);
      } catch (e) {
        notes.push(`An action was not sent: ${err(e)}`);
      }
    }
    notes.push(...(await this.remember(m, ctx, chosen.memory, { prompt: null })));
    if (chosen.actions.length > count) notes.push(`Claude proposed ${chosen.actions.length} actions; only the first ${count} were taken (the nudge’s number).`);
    if (!chosen.actions.length) notes.push('Machine, allegedly chose to do nothing.');
    cause.status = cause.actions.length ? 'answered' : 'not answered';
    cause.note = notes.join(' ');
    this.done(cause, { title: `${names(agent)}, nudged: ${cause.actions.length === 1 ? 'one action' : `${cause.actions.length} actions`} of ${count}`, text: texts.join('\n\n———\n\n'), act: cause.actions[0], why, notClaimed: chosen.notClaimed, read: chosen.read });
  }

  /** Try again a cause that was not answered (an error, a sender out of reach): it is forgotten, and handled anew. */
  async retry(act: string): Promise<{ answered: number; stopped: string | null; problems: string[] }> {
    const m = this.file();
    const c = m.causes[act];
    if (!c || c.status !== 'not answered') throw new Error('Only what was not answered can be tried again.');
    delete m.causes[act];
    this.save(m);
    if (c.kind === 'pick' || c.kind === 'nudge') {
      await this.alone(() => (c.kind === 'pick' ? this.answerPick(act) : this.answerNudge(act))).catch((e) => (e instanceof Stopped ? null : Promise.reject(e)));
      return { answered: this.file().causes[act]?.status === 'answered' ? 1 : 0, stopped: this.file().stopped, problems: [] };
    }
    return this.tick();
  }

  /** A look that failed on its own (relays away): said on the desk, tried again at the next look. */
  failed(e: unknown): void {
    const m = this.file();
    m.stopped = `The last look for what Machine, allegedly received failed: ${err(e)}. It is tried again at the next look.`;
    this.save(m);
  }

  // ------------------------------------------------------------ the page's state

  state() {
    const m = this.file();
    const names = this.store.names();
    const r = m.agent ? this.reading(m) : null;
    const terms = r && m.terms ? r.termsAct(m.terms) : null;
    let key: { found: boolean; from: string; warning?: string; last4?: string; kind: 'shared' | 'own' };
    const kind = m.keyKind ?? 'shared';
    try {
      const k = findKey(this.opts.env, this.opts.home, this.opts.repo, kind === 'own' && m.agent ? m.agent : undefined);
      key = { found: true, from: k.from, warning: k.warning, last4: lastFour(k.key), kind };
    } catch (e) {
      key = { found: false, from: err(e), kind };
    }
    const day = (this.opts.today ?? localDay)();
    return {
      agent: m.agent,
      agentName: m.agent ? names(m.agent) : null,
      owner: m.owner,
      ownerName: m.owner ? names(m.owner) : null,
      terms: terms && 'terms' in terms ? { act: m.terms!, words: termsInWords(terms.terms, this.nameOf()) } : null,
      on: m.on,
      callsPerDay: m.callsPerDay,
      maxChars: m.maxChars,
      callsToday: m.usage.day === day ? m.usage.calls : 0,
      stopped: m.stopped,
      key,
      named: m.named ?? null,
      notified: this.notified(m).map((it) => ({ key: it.key, act: it.act, from: it.from, fromName: it.from ? names(it.from) : null, private: it.private, kind: it.kind, standing: it.standing, text: it.text === undefined ? undefined : escapeControls(it.text) })),
      waiting: this.waiting(m).map((w) => {
        const it = m.agent ? this.store.received(m.agent).items.find((x) => x.act === w.picked) : undefined;
        return { pick: w.pick, act: w.picked, fromName: it?.from ? names(it.from) : null, private: it?.private ?? false };
      }),
      notAnswered: Object.values(m.causes)
        .filter((c) => c.status === 'not answered')
        .map((c) => ({ act: c.act, kind: c.kind, note: c.note })),
    };
  }
}

/** A text act's payload: the words alone (Text MIR, "The text act"). */
function textPayload(text: string): Uint8Array {
  return cborEncode(new Map([[0, text]])) as Uint8Array;
}

/** Where an act went, in a few words. */
function delivered(all: { to: string; accepted: boolean }[]): string {
  // The locked copy at the sender's homes is its line, not a delivery.
  const sent = all.filter((s) => s.to !== 'its homes');
  const ok = sent.filter((s) => s.accepted).length;
  return ok ? `Delivered (${ok} of ${sent.length} accepted).` : 'Signed, but nothing accepted it yet: send it again from the history.';
}
