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
import { ClaudeError, DEFAULT_MODEL, findKey, inRepository, writeAnswer, writeNudged, type Answering, type Reach, type Settings } from './claude.ts';
import type { Desk, Done } from './desk.ts';
import type { Item, Store } from './store.ts';

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

export class Machine {
  private running: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly desk: Desk,
    private readonly store: Store,
    private readonly opts: MachineOptions = {},
  ) {}

  private file(): MachineFile {
    return { ...fresh(), ...this.store.machine(fresh) };
  }

  private save(m: MachineFile): void {
    this.store.saveMachine(m);
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
      const m = this.file();
      Object.assign(m, { agent, owner, terms: s.id, on: true, since: now(), stopped: null });
      this.save(m);
      const names = this.nameOf();
      this.store.record({ time: now(), draft: '', verdict: 'terms published', signer: agent, title: `${names(agent)}’s agency terms signed and published`, note: '', act: s.id });
      return { title: 'Terms signed and published', lines: s.sent.map((x) => ({ text: `${x.to}: ${x.answer}`, tone: x.accepted ? 'ok' : 'bad' })), acts: [s.id] };
    });
  }

  setOn(on: boolean): void {
    const m = this.file();
    if (on && !m.terms) throw new Error('Publish Machine, allegedly’s terms first.');
    m.on = on;
    if (on) m.stopped = null;
    this.save(m);
  }

  setCap(a: { callsPerDay: number; maxChars: number }): void {
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
  private thread(r: Reading, id: string, skip: string[]): { from: string; text: string }[] {
    const names = this.nameOf();
    const out: { from: string; text: string }[] = [];
    let cur = r.held(id);
    const seen = new Set<string>([id]);
    while (cur && out.length < 5) {
      const next = cur.refs.map((x) => r.held(x)).find((h) => h && !seen.has(h.id) && !skip.includes(h.id) && this.textOf(r, h.id) !== null);
      if (!next) break;
      seen.add(next.id);
      out.unshift({ from: names(next.signer), text: this.textOf(r, next.id)! });
      cur = next;
    }
    return out;
  }

  /** Acts sent to Machine, allegedly by anyone but its owner, that nothing answered yet: the "Notified" pile. */
  private notified(m: MachineFile): Item[] {
    if (!m.agent) return [];
    const answered = new Set(Object.values(m.causes).flatMap((c) => c.answered));
    return this.store
      .received(m.agent)
      .items.filter((it) => it.act && it.from && it.from !== m.owner && it.from !== m.agent && (it.kind === 'message' || it.kind === 'reply') && !answered.has(it.act))
      .sort((a, b) => b.found - a.found);
  }

  // ------------------------------------------------------------ the cap and the key

  /** Count one call before it is made; stop, with nothing spent, at the cap or without a key. */
  private spend(m: MachineFile): string {
    if (inRepository(this.store.dir, this.opts.repo)) {
      throw new Stopped(`The desk’s folder ${this.store.dir} is inside the repository, where Machine, allegedly’s keys could be committed. Answering stopped; move the folder out.`);
    }
    let key: string;
    try {
      key = findKey(this.opts.env, this.opts.home, this.opts.repo).key;
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

  private settings(m: MachineFile): Settings {
    return { model: m.model, maxTokens: m.maxTokens, maxChars: m.maxChars };
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
      return { answered, stopped: this.file().stopped, problems };
    });
  }

  /** Record a cause and its outcome, in machine.json and the desk's history. */
  private done(cause: Cause, history: { title: string; text?: string; act?: string; why: string; notClaimed?: string[] }): void {
    const m = this.file();
    m.causes[cause.act] = cause;
    this.save(m);
    this.store.record({
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
    const answering: Answering = { from: `${names(owner)}, your owner`, how, text: it.text ?? '', thread: this.thread(r, it.act!, []), why: 'his own act: you answer him at once' };
    try {
      const w = await writeAnswer(answering, key, this.settings(m), this.opts.reach, this.opts.repo);
      const refs: Reference[] = [it.private ? it.act! : [it.act!, owner]];
      const s = await this.desk.signAndSend(agent, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: textPayload(w.text), public: !it.private, to: [owner], refs });
      Object.assign(cause, { status: 'answered', actions: [s.id], answered: [it.act!], note: delivered(s.sent) });
      this.done(cause, { title: `${names(agent)} answered ${names(owner)}’s ${it.private ? 'message, privately' : 'act, publicly'}`, text: w.text, act: s.id, why, notClaimed: w.notClaimed });
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
      this.store.record({ time: now(), draft: '', verdict: 'picked', signer: m.owner, title: `${names(m.owner)} picked ${names(it.from!)}’s ${it.private ? 'message' : 'act'} ${short(it.act!)}`, note: '', act: s.id, causeAct: it.act! });
      const r = await this.answerPick(s.id).catch((e) => (e instanceof Stopped ? null : Promise.reject(e)));
      const c = this.file().causes[s.id];
      const lines: Done['lines'] = [{ text: `The pick ${short(s.id)}, signed and delivered.`, tone: 'ok' }];
      if (c?.status === 'answered') lines.push({ text: `Machine, allegedly answered: ${short(c.actions[0])}. ${c.note}`, tone: 'ok' });
      else if (c) lines.push({ text: `Not answered: ${c.note}`, tone: 'bad' });
      else if (r === null) lines.push({ text: `Waiting: ${this.file().stopped}`, tone: 'bad' });
      return { title: 'Picked', lines, acts: [s.id, ...(c?.actions ?? [])] };
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
    try {
      const w = await writeAnswer(
        { from: names(it.from), how: it.private ? 'a private message to you' : 'a public act addressed to you', text: it.text ?? '', thread: this.thread(r, it.act!, []), why: `picked by ${names(p.signer)}, your owner: he chose that it be answered, never what you say` },
        key,
        this.settings(m),
        this.opts.reach,
        this.opts.repo,
      );
      const refs: Reference[] = [[pickId, p.signer], it.private ? it.act! : [it.act!, it.from]];
      const s = await this.desk.signAndSend(agent, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: textPayload(w.text), public: !it.private, to: [it.from], refs });
      Object.assign(cause, { status: 'answered', actions: [s.id], answered: [it.act!], note: `${this.wordsOf(s.id)} ${delivered(s.sent)}` });
      this.done(cause, { title: `${names(agent)} answered ${names(it.from)}’s ${it.private ? 'message, privately' : 'act, publicly'}`, text: w.text, act: s.id, why, notClaimed: w.notClaimed });
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
  private async reach(it: Item): Promise<string | null> {
    if (!it.private) return null;
    try {
      await recipientOf(it.from!, this.desk.places.hints, this.desk.places.via);
      return null;
    } catch (e) {
      return `A private message is answered privately, and its sender cannot receive one: ${err(e)}. Nothing was drafted or sent.`;
    }
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
      this.store.record({ time: now(), draft: '', verdict: 'nudged', signer: m.owner, title: `${names(m.owner)} nudged ${names(m.agent)}, for ${count === 1 ? 'one action' : `${count} actions`}`, note: words, act: s.id });
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
    const candidates = this.notified(m).slice(0, 10);
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
    let chosen: Awaited<ReturnType<typeof writeNudged>>;
    try {
      chosen = await writeNudged(
        { count, context: n.nudge.context ?? null, named, candidates: candidates.map((c, i) => ({ n: i + 1, from: names(c.from!), how: c.private ? 'a private message' : 'a public act addressed to you', text: c.text ?? '' })) },
        key,
        this.settings(m),
        this.opts.reach,
        this.opts.repo,
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
      if (a.kind === 'message to the owner') {
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
          notes.push(`An answer to ${names(c.from!)} was left out: ${cannot}`);
          continue;
        }
        to = [c.from!];
        pub = !c.private;
        refs.push(c.private ? c.act! : [c.act!, c.from!]);
        answered = c.act!;
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
    if (chosen.actions.length > count) notes.push(`Claude proposed ${chosen.actions.length} actions; only the first ${count} were taken (the nudge’s number).`);
    if (!chosen.actions.length) notes.push('Machine, allegedly chose to do nothing.');
    cause.status = cause.actions.length ? 'answered' : 'not answered';
    cause.note = notes.join(' ');
    this.done(cause, { title: `${names(agent)}, nudged: ${cause.actions.length === 1 ? 'one action' : `${cause.actions.length} actions`} of ${count}`, text: texts.join('\n\n———\n\n'), act: cause.actions[0], why, notClaimed: chosen.notClaimed });
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
    let key: { found: boolean; from: string; warning?: string };
    try {
      const k = findKey(this.opts.env, this.opts.home, this.opts.repo);
      key = { found: true, from: k.from, warning: k.warning };
    } catch (e) {
      key = { found: false, from: err(e) };
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
      notified: this.notified(m).map((it) => ({ key: it.key, act: it.act, from: it.from, fromName: it.from ? names(it.from) : null, private: it.private, kind: it.kind, standing: it.standing, text: it.text === undefined ? undefined : escapeControls(it.text) })),
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
function delivered(sent: { to: string; accepted: boolean }[]): string {
  const ok = sent.filter((s) => s.accepted).length;
  return ok ? `Delivered (${ok} of ${sent.length} accepted).` : 'Signed, but nothing accepted it yet: send it again from the history.';
}
