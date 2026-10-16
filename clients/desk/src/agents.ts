// Edubba's agents (F333, decided by Nobody, allegedly, 16 October 2026): the
// agents' hub. Each agent is an identity held here whose agency terms (the
// nudge cMIP) were signed here, with its own answering (`machine.ts`), its
// own daily cap, and the shared API key or one of its own.
//
// - Adding one: its identity (an inbox, and the encryption key its signing
//   key's words carry), its display name published (the naming cMIP: "(a)
//   Published"), then its terms, shown in plain words and signed.
// - The prompt box: what the owner types is an act, a private message sealed
//   from the owner's identity to the agent, signed and kept, answered at once
//   under the nudge cMIP (F333, "A)").
// - "MOR as seen by this agent": its inbox, its feed (its posts and those it
//   follows) and its follows. The owner follows for it (the people cMIP,
//   kept here, private); under a nudge, Claude is given its feed too (F333,
//   the agent's view, answer (a)).
//
// The API key lives in an owner-only file on this machine, never in the
// browser beyond the moment it is typed, and the page is shown its last four
// characters only.

import { SPECS, cborEncode } from '../../genesis/src/core.ts';
import { readFeed } from '../../site/src/feed.ts';
import { compose } from '../../longform/src/text.ts';
import { escapeControls } from '../../connector/src/words.ts';
import { readId } from '../../../modules/carry/src/carry.ts';
import { agentKeyFile, saveKey, sharedKeyFile, findKey, lastFour } from './claude.ts';
import { Machine, type MachineOptions } from './machine.ts';
import type { Desk, Done } from './desk.ts';
import type { Store } from './store.ts';
import { homedir } from 'node:os';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);

/** The longest prompt the owner types in one act. */
export const MAX_PROMPT = 4000;

/** Said under the prompt box: what typing there does. */
export const PROMPT_SAY =
  'What you type here is an act: a private message from your identity to this agent, sealed so only it can open it, signed and kept. It answers at once, privately, under its terms.';

/** Said where the key is plugged in. */
export const KEY_SAY =
  'The key goes from this page to the program once, and is kept in a file on this Mac that only your account can read (~/.config/mor). This page never holds it again: it is shown by its last four characters only.';

export interface Seen {
  id: string;
  signer: string;
  signerName: string;
  standing: string;
  text: string;
  pictures: string[];
  answers: string[];
}

export class Agents {
  private machines = new Map<string, Machine>();
  private none: Machine;

  constructor(
    private readonly desk: Desk,
    private readonly store: Store,
    private readonly opts: MachineOptions = {},
  ) {
    this.none = new Machine(desk, store, opts, null);
  }

  private get home(): string {
    return this.opts.home ?? homedir();
  }

  ids(): string[] {
    return this.store.agentIds();
  }

  /** An agent's answering; with no agent named, the first agent's, or, before any, one that can only show and sign terms. */
  for(agent?: string | null): Machine {
    const id = agent || this.ids()[0];
    if (!id) return this.none;
    if (agent && !this.store.holds(agent)) throw new Error('This identity is not held here.');
    let m = this.machines.get(id);
    if (!m) {
      m = new Machine(this.desk, this.store, this.opts, id);
      this.machines.set(id, m);
    }
    return m;
  }

  /** Every agent looks for what it received, one after another; one failing does not stop the others. */
  async tickAll(): Promise<void> {
    for (const id of this.ids()) {
      const m = this.for(id);
      await m.tick().catch((e) => m.failed(e));
    }
  }

  // ------------------------------------------------------------ adding an agent

  /**
   * The first-use window's first step, and "+ Add an agent": the key if
   * typed, the owner (an identity held here, or a new one), the agent's
   * identity, its display name published. Its terms are then shown, and
   * signed only by `publishTerms` with their digest.
   */
  async add(a: { name: string; agent?: string; owner?: string; ownerName?: string; key?: string; own?: boolean }): Promise<Done & { agent: string; owner: string; terms: { lines: string[]; digest: string } }> {
    const held = a.agent?.trim() || null;
    if (held && (!this.store.holds(held) || this.store.isAgent(held))) throw new Error('Choose an identity held here that is not an agent yet, or a new one.');
    const name = a.name.trim() || (held ? (this.store.book().identities.find((i) => i.id === held)?.name ?? '') : '');
    if (!name) throw new Error('Name the agent: the name is published as its display name, beside its fingerprint.');
    if (!this.store.settings().homes.length) throw new Error('Name the homes first, under Settings: an identity is born at its homes.');
    const lines: Done['lines'] = [];
    let owner = a.owner?.trim() ?? '';
    if (!owner) {
      if (!a.ownerName?.trim()) throw new Error('Choose its owner: your identity, whose prompts, picks and nudges it follows.');
      const made = await this.desk.createIdentity({ name: a.ownerName, linked: false });
      owner = made.acts[0];
      lines.push({ text: `Your identity “${a.ownerName.trim()}” is born (${short(owner)}).`, tone: 'ok' });
    } else if (!this.store.holds(owner)) throw new Error('Its owner must be an identity held here.');
    if (owner === held) throw new Error('An agent and its owner are two identities.');
    let agent: string;
    if (held) {
      agent = held;
      if (a.name.trim()) this.desk.rename(agent, name);
      lines.push({ text: `“${name}” (${short(agent)}), held here, becomes an agent.`, tone: 'ok' });
    } else {
      agent = (await this.desk.createIdentity({ name, linked: false })).acts[0];
      lines.push({ text: `The agent “${name}” is born (${short(agent)}), with an inbox and the encryption key its signing key’s words carry.`, tone: 'ok' });
    }
    try {
      const n = await this.desk.publishName(agent, name);
      lines.push({ text: `Its display name “${n.name}” is published (the naming cMIP): shown beside its fingerprint, never instead of it. Anyone may take the same name.`, tone: 'ok' });
    } catch (e) {
      lines.push({ text: `Its display name was not published: ${err(e)}`, tone: 'warn' });
    }
    if (a.key?.trim()) {
      const k = this.saveKey(a.own ? agent : null, a.key);
      lines.push({ text: `The ${a.own ? 'agent’s own' : 'shared'} API key is kept on this Mac: …${k.last4}.`, tone: 'ok' });
    }
    const terms = this.for(null).previewTerms(agent, owner);
    return { title: `“${name}” is born: read its terms, then sign them`, lines, acts: [agent], agent, owner, terms };
  }

  /** Sign the terms shown, by their digest; the agent then answers. Its display name, if published here, is kept with it. */
  async publishTerms(agent: string, owner: string, digest: string, own?: boolean): Promise<Done> {
    const d = await this.for(agent).publishTerms(agent, owner, digest);
    const m = this.for(agent);
    const named = this.store
      .history()
      .filter((h) => h.verdict === 'named' && h.signer === agent && h.act)
      .pop();
    if (named) m.setNamed({ name: this.store.book().identities.find((i) => i.id === agent)?.name ?? '', act: named.act! });
    if (own) m.setKeyKind('own');
    return d;
  }

  /** Publish the display name of an agent that has none published from here (Machine, allegedly). */
  async name(agent: string): Promise<Done> {
    if (!this.store.isAgent(agent)) throw new Error('Not an agent of this desk.');
    const name = this.store.book().identities.find((i) => i.id === agent)?.name ?? '';
    const n = await this.desk.publishName(agent, name);
    this.for(agent).setNamed({ name: n.name, act: n.act });
    return { title: `Display name “${n.name}” published`, lines: [{ text: 'Shown beside its fingerprint, never instead of it. Anyone may take the same name.', tone: 'ok' }], acts: [n.act] };
  }

  // ------------------------------------------------------------ the key

  /** Keep a key typed on the page: the shared one, or an agent's own. */
  saveKey(agent: string | null, key: string): { last4: string } {
    return saveKey(agent ? agentKeyFile(this.home, agent) : sharedKeyFile(this.opts.env, this.home), key, this.opts.repo);
  }

  /** The shared key as the page sees it: found or not, its last four characters, where. */
  sharedKey(): { found: boolean; last4?: string; from: string; warning?: string } {
    try {
      const k = findKey(this.opts.env, this.opts.home, this.opts.repo);
      return { found: true, last4: lastFour(k.key), from: k.from === 'ANTHROPIC_API_KEY' ? 'the environment variable ANTHROPIC_API_KEY' : k.from, warning: k.warning };
    } catch (e) {
      return { found: false, from: err(e) };
    }
  }

  /** An agent's key: its own (typed now, or already in place), or back to the shared one. */
  setKey(agent: string, a: { own: boolean; key?: string }): { last4: string | null } {
    const m = this.for(agent);
    let last4: string | null = null;
    if (a.own && a.key?.trim()) last4 = this.saveKey(agent, a.key).last4;
    m.setKeyKind(a.own ? 'own' : 'shared');
    return { last4 };
  }

  // ------------------------------------------------------------ the prompt box

  /**
   * The owner prompts the agent: a private message sealed from the owner's
   * identity to the agent, signed, kept and delivered (F333, A); then the
   * agent looks at once, and answers it privately under its terms (its
   * owner's own message, free). The answer is returned.
   */
  async prompt(agent: string, typed: string): Promise<Done & { answer: string | null }> {
    const m = this.for(agent);
    const st = m.state();
    if (!st.terms || !st.owner) throw new Error('Sign its terms first.');
    const { text } = compose(typed);
    if (!text.trim()) throw new Error('Write something first.');
    if (text.length > MAX_PROMPT) throw new Error(`A prompt is at most ${MAX_PROMPT} characters.`);
    const s = await this.desk.signAndSend(st.owner, { spec: SPECS.text, type: 0, payload: cborEncode(new Map([[0, text]])) as Uint8Array, public: false, to: [agent], refs: [] });
    const names = this.store.names();
    this.store.record({ time: now(), draft: '', verdict: 'prompted', agent, signer: st.owner, title: `${names(st.owner)} prompted ${names(agent)}`, note: '', act: s.id, text });
    const lines: Done['lines'] = [{ text: `Your prompt ${short(s.id)}: signed, sealed to ${names(agent)} and kept.`, tone: 'ok' }];
    for (const x of s.sent) lines.push({ text: `${x.to}: ${x.answer}`, tone: x.accepted ? 'ok' : 'bad' });
    if (!st.on) {
      lines.push({ text: 'Answering is off: it answers once you turn it on.', tone: 'warn' });
      return { title: 'Prompt sent', lines, acts: [s.id], answer: null };
    }
    const t = await m.tick();
    const answer = m.history().find((h) => h.causeAct === s.id);
    if (answer?.verdict === 'answered') lines.push({ text: `${names(agent)} answered at once, privately: act ${short(answer.act ?? '')}.`, tone: 'ok' });
    else if (answer) lines.push({ text: `Not answered: ${answer.note}`, tone: 'bad' });
    else lines.push({ text: `Not answered yet: ${t.stopped ?? t.problems.join('; ') ?? 'it was not found in its inbox'}`, tone: 'bad' });
    return { title: answer?.verdict === 'answered' ? 'Answered' : 'Prompt sent', lines, acts: [s.id, ...(answer?.act ? [answer.act] : [])], answer: answer?.verdict === 'answered' ? (answer.text ?? null) : null };
  }

  /** The conversation of the prompt box: the owner's prompts and the agent's answers to them, oldest first. */
  conversation(agent: string): { from: 'owner' | 'agent'; text: string; act?: string; time: number; note?: string }[] {
    const h = this.for(agent).history().slice().reverse();
    const prompts = new Set(h.filter((x) => x.verdict === 'prompted').map((x) => x.act));
    const out: { from: 'owner' | 'agent'; text: string; act?: string; time: number; note?: string }[] = [];
    for (const x of h) {
      if (x.verdict === 'prompted') out.push({ from: 'owner', text: escapeControls(x.text ?? ''), act: x.act, time: x.time });
      else if (x.causeAct && prompts.has(x.causeAct)) out.push({ from: 'agent', text: escapeControls(x.text ?? ''), act: x.act, time: x.time, note: x.verdict === 'answered' ? undefined : x.note });
    }
    return out;
  }

  // ------------------------------------------------------------ whom it follows (the people cMIP, kept here)

  follow(agent: string, typed: string, name: string): void {
    if (!this.store.isAgent(agent)) throw new Error('Not an agent of this desk.');
    let id: string;
    try {
      id = readId(typed);
    } catch (e) {
      throw new Error(`Follow: ${err(e)}`);
    }
    if (id === agent) throw new Error('An agent does not follow itself: its own posts are in its feed already.');
    const p = this.store.people(agent);
    const was = p.follows.find((f) => f.id === id);
    if (was) was.name = name.trim() || was.name;
    else p.follows.push({ id, name: name.trim() || null });
    this.store.savePeople(agent, p);
  }

  unfollow(agent: string, id: string): void {
    const p = this.store.people(agent);
    p.follows = p.follows.filter((f) => f.id !== id);
    this.store.savePeople(agent, p);
  }

  /**
   * "MOR as seen by this agent" (F333): what it reads. Its inbox (what was
   * sent to it, as received), its feed (its own posts and those it follows,
   * as the site's feed reads them, in signed order) and its follows.
   */
  async view(agent: string): Promise<{ follows: { id: string; name: string | null }[]; feed: Seen[]; problems: string[]; inbox: unknown[] }> {
    if (!this.store.isAgent(agent)) throw new Error('Not an agent of this desk.');
    const p = this.store.people(agent);
    const names = this.store.names();
    const shownName = (id: string) => p.follows.find((f) => f.id === id)?.name ?? names(id);
    const { hints, via } = this.desk.places;
    const problems: string[] = [];
    let feed: Seen[] = [];
    try {
      const authors = [agent, ...p.follows.map((f) => f.id).filter((id) => !p.muted.includes(id))].map((identity) => ({ identity, name: null }));
      const f = await readFeed(authors, hints, via);
      feed = f.posts.map((x) => ({
        id: x.id,
        signer: x.signer,
        signerName: x.signer === agent ? `${names(agent)} (itself)` : shownName(x.signer),
        standing: x.post?.standing ?? 'unknown',
        text: escapeControls(x.post?.text ?? ''),
        pictures: (x.post?.refs ?? []).flatMap((r) => (r.kind === 'picture' && r.bytes ? [`data:image/jpeg;base64,${Buffer.from(r.bytes).toString('base64')}`] : [])),
        answers: x.answers,
      }));
      for (const a of f.authors) if (a.problem) problems.push(`${shownName(a.identity)}: ${a.problem}`);
    } catch (e) {
      problems.push(`Its feed could not be read: ${err(e)}`);
    }
    const inbox = this.store
      .received(agent)
      .items.slice()
      .sort((a, b) => b.found - a.found)
      .map((x) => ({ key: x.key, kind: x.kind, from: x.from, fromName: x.from ? names(x.from) : null, private: x.private, standing: x.standing, text: x.text === undefined ? undefined : escapeControls(x.text), found: x.found }));
    return { follows: p.follows, feed, problems, inbox };
  }

  // ------------------------------------------------------------ the page's state

  /** The list on top of the Agents tab: each agent by its ID and display name, its cap and key beside it. */
  list() {
    const names = this.store.book();
    return this.ids().map((id) => {
      const s = this.for(id).state();
      return {
        id,
        name: names.identities.find((i) => i.id === id)?.name ?? short(id),
        named: s.named,
        on: s.on,
        callsPerDay: s.callsPerDay,
        callsToday: s.callsToday,
        key: { kind: s.key.kind, found: s.key.found, last4: s.key.last4 ?? null },
        notified: s.notified.length,
        stopped: s.stopped,
      };
    });
  }

  /** Everything the lower half shows of one agent. */
  details(agent: string) {
    const m = this.for(agent);
    return { ...m.state(), conversation: this.conversation(agent), history: m.history().slice(0, 30), follows: this.store.people(agent).follows };
  }
}
