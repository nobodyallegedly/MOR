// Edubba signs as a member (H33, the project lead's lean, accepted by Nobody,
// allegedly, with H29: "yes, everything makes sense"), as Dub's Signing tab
// does, for any identity Edubba holds: the proposal read in plain words from
// the exact bytes of the act it names, signed or declined, the one-time key
// made for a share, the share shown once and kept nowhere. It is Dub's own
// code (`../../dub/src/dub.ts`), run over Edubba's folder through a `Keep`
// that reads Edubba's identities: the same reading, the same answers, the
// same one-time keys, so a member signs alike in either app.
//
// What it keeps, per identity, in `member/` (owner-only): `ID.people.json`,
// its inbox as read for proposals (never names: Edubba's names are its own),
// and `ID.signing.json`, the answers given and, only while a share waits, the
// one-time key's secret (deleted once the share is written down, as in Dub on
// the Mac, its reading 15). The identity it acts as ("acting as", H33) is in
// `member/acting.json`.
//
// TEST IDENTITIES ONLY.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { Dub, NO_SIGNING, type Keep, type Pending, type Settings, type SigningState } from '../../dub/src/dub.ts';
import { NO_PEOPLE, type People } from '../../dub/src/people.ts';
import type { Desk } from './desk.ts';
import type { RunnerLink } from '../../dub/src/runner.ts';
import type { Store } from './store.ts';
import { approveRules, readRules, rulesOf, type RulesShown } from '../../kit/src/engine/rules.ts';

/** The rules Edubba runs (H93): money (purchases, drafts for Damgar, its agents' lanes), people, names, corrections, collectives, agents' memory. */
export const EDUBBA_RULES = rulesOf('payment', 'messages', 'grant-limits', 'people', 'naming', 'corrections', 'appended', 'member-keys', 'agent-memory');

const HEX64 = /^[0-9a-f]{64}$/;

/** Edubba's folder, as Dub's code asks for it: the identities held here, one of them acted as. */
export class MemberKeep implements Keep {
  constructor(
    private store: Store,
    private desk: Desk,
    /** The names Edubba gives identities (those held, its contacts): shown in a reading beside each fingerprint, as Dub shows the names given there. */
    private named: () => { id: string; name: string }[] = () => [],
  ) {
    mkdirSync(store.path('member'), { recursive: true, mode: 0o700 });
  }

  private file(...p: string[]) {
    return this.store.path('member', ...p);
  }

  private read<T>(name: string, none: () => T): T {
    const f = this.file(name);
    return existsSync(f) ? { ...none(), ...(JSON.parse(readFileSync(f, 'utf8')) as T) } : none();
  }

  private write(name: string, v: unknown) {
    writeFileSync(this.file(name), `${JSON.stringify(v, null, 2)}\n`, { mode: 0o600 });
  }

  async held(): Promise<string[]> {
    return this.store.book().identities.map((i) => i.id);
  }

  async active(): Promise<string | null> {
    const a = this.read<{ id: string | null }>('acting.json', () => ({ id: null })).id;
    const held = await this.held();
    return a && held.includes(a) ? a : null;
  }

  async setActive(id: string | null): Promise<void> {
    this.write('acting.json', { id });
  }

  async identity(id: string): Promise<TestIdentity | null> {
    return this.store.holds(id) ? this.store.identity(id) : null;
  }

  async saveIdentity(i: TestIdentity): Promise<void> {
    this.store.saveIdentity(i);
    if (this.taking.delete(i.id)) {
      const b = this.store.book();
      if (!b.identities.some((x) => x.id === i.id)) {
        b.identities.push({ id: i.id, name: `${i.id.slice(0, 8)}…`, linked: false, kind: 'runner' });
        this.store.saveBook(b);
      }
    }
  }

  async settings(id: string): Promise<Settings> {
    const s = this.store.settings();
    const kind = this.store.book().identities.find((i) => i.id === id)?.kind ?? (this.taking.has(id) ? 'runner' : 'made');
    // Signing as a member is the Collectives tab's own work here (H33): always on, labelled. A collective is acted as only for the one post being made (`postAs`).
    return { kind, relays: s.relays.length ? s.relays : s.homes.map((h) => h.hint), via: s.via, signing: true, ...(this.postingAs ? { acting: this.postingAs } : {}) };
  }

  /** The collective a post is made for, while `Member.postAs` runs: Dub's own posting as a collective, with the member's own key. */
  postingAs: string | null = null;

  /** Identities being taken from Kišib's runner (Dub's `runnerTake`): listed in Edubba's book once their file is saved. */
  private taking = new Set<string>();

  async saveSettings(id: string, s: Settings): Promise<void> {
    // Edubba's settings are its own (the identity panel's foot); only an identity used through Kišib is noted here, to list it.
    if (s.kind === 'runner') this.taking.add(id);
  }

  async people(id: string): Promise<People> {
    if (!HEX64.test(id)) throw new Error('not an identity');
    const p = this.read<People>(`${id}.people.json`, NO_PEOPLE);
    // Not kept: the names come from Edubba's own lists each time.
    return { ...p, follows: this.named().filter((x) => x.id !== id) };
  }

  async savePeople(id: string, p: People): Promise<void> {
    if (!HEX64.test(id)) throw new Error('not an identity');
    this.write(`${id}.people.json`, { ...p, follows: [] });
  }

  async signing(id: string): Promise<SigningState> {
    if (!HEX64.test(id)) throw new Error('not an identity');
    return this.read<SigningState>(`${id}.signing.json`, NO_SIGNING);
  }

  async saveSigning(id: string, s: SigningState): Promise<void> {
    if (!HEX64.test(id)) throw new Error('not an identity');
    this.write(`${id}.signing.json`, s);
  }

  /** Edubba signs no money under a lane: nothing kept for it (Dub's round 2 lanes are Dub's own). */
  async money<T>(): Promise<T | null> {
    return null;
  }

  async saveMoney(): Promise<void> {
    throw new Error('Edubba keeps no lane: money under a lane is Dub’s.');
  }

  async forget(): Promise<void> {
    throw new Error('Identities are forgotten on the Identities tab, not here.');
  }

  async pending(): Promise<Pending | null> {
    return null;
  }

  async savePending(): Promise<void> {
    throw new Error('Identities are made on the Identities tab, not here.');
  }

  async dropPending(): Promise<void> {}

  /** One post as a collective at a time (the acting collective is this keep's, for that post only). */
  private chain: Promise<unknown> = Promise.resolve();
  exclusiveAs<T>(f: () => Promise<T>): Promise<T> {
    const next = this.chain.then(f);
    this.chain = next.catch(() => undefined);
    return next;
  }

  /** One signer at a time, with every other part of Edubba that signs. */
  exclusive<T>(f: () => Promise<T>): Promise<T> {
    return this.desk.serial(f);
  }
}

/** Edubba as a member: Dub's signing over Edubba's identities, acting as one of them (H33). */
export class Member {
  readonly keep: MemberKeep;
  readonly dub: Dub;

  constructor(
    readonly store: Store,
    desk: Desk,
    named: () => { id: string; name: string }[] = () => [],
    /** Kišib's runner, on the computer only: an identity used through it signs in To sign through Kišib's panel (as Dub does). */
    readonly runner?: RunnerLink,
  ) {
    this.keep = new MemberKeep(store, desk, named);
    this.dub = new Dub(this.keep, { runner });
  }

  /**
   * Use an identity Kišib's runner holds (+ Add, Use one from Kišib): Dub's
   * own taking, over Edubba's folder; its name here is the one Kišib gives.
   */
  async runnerTake(id: string): Promise<{ lines: { text: string; tone?: string }[] }> {
    const r = await this.dub.runnerTake({ id });
    const k = (await this.runner?.paired().catch(() => null))?.identities.find((x) => x.id === id);
    const b = this.store.book();
    const e = b.identities.find((x) => x.id === id);
    if (e && e.kind === 'runner' && k?.name && /…$/.test(e.name)) {
      e.name = k.name;
      this.store.saveBook(b);
    }
    return { lines: r.lines.map((l) => ({ ...l, text: l.text.replace(/\bDub\b/g, 'Edubba') })) };
  }

  // ------------------------------------------------------------ Rules I follow (H93)

  private rulesRead = new Map<string, { shown: RulesShown; at: number }>();

  private rulesHere(id: string): string[] {
    const f = this.store.path('member', `${id}.rules.json`);
    return existsSync(f) ? ((JSON.parse(readFileSync(f, 'utf8')) as { here?: string[] }).here ?? []) : [];
  }

  /** The rules Edubba runs, held against the identity's sealed list and what was approved in Edubba only: read again at most once a minute. */
  async rules(id: string | null, fresh = false): Promise<RulesShown | null> {
    if (!id || !HEX64.test(id) || !this.store.holds(id)) return null;
    const c = this.rulesRead.get(id);
    if (c && !fresh && c.at + 60 > Date.now() / 1000) return c.shown;
    const me = await this.store.identity(id);
    const open = await this.dub.openerFor(id).catch(() => null);
    const { shown } = await readRules('Edubba', EDUBBA_RULES, me, this.rulesHere(id), { open, via: this.store.settings().via });
    this.rulesRead.set(id, { shown, at: Date.now() / 1000 });
    return shown;
  }

  /** Approve rules Edubba runs, in Edubba only or added to the list; or stop following one in Edubba only. */
  async approveRules(id: string | null, a: { keys: string[]; where: 'here' | 'list'; remove?: boolean }): Promise<{ lines: { text: string; tone?: string }[]; rules: RulesShown | null }> {
    if (!id || !this.store.holds(id)) throw new Error('No identity in use: choose one in the identity panel.');
    const now = await this.rules(id, true);
    const keys = a.keys.includes('*') ? (now?.rules ?? []).filter((r) => !r.on).map((r) => r.key) : a.keys;
    if (!keys.length) return { lines: [{ text: 'Every rule Edubba runs is followed already.' }], rules: now };
    const me = await this.store.identity(id);
    const open = await this.dub.openerFor(id).catch(() => null);
    const r = await this.keep.exclusive(() => approveRules('Edubba', EDUBBA_RULES, me, { keys, where: a.where, remove: a.remove, here: this.rulesHere(id) }, { open, via: this.store.settings().via, save: async () => this.store.saveIdentity(me) }));
    writeFileSync(this.store.path('member', `${id}.rules.json`), `${JSON.stringify({ here: r.here }, null, 2)}\n`, { mode: 0o600 });
    return { lines: r.lines, rules: await this.rules(id, true) };
  }

  /** The identity the Collectives tab acts as: the one chosen, else the first held that is no agent, else the first held. */
  async acting(): Promise<string | null> {
    const a = await this.keep.active();
    if (a) return a;
    const ids = this.store.book().identities.map((i) => i.id);
    return ids.find((i) => !this.store.isAgent(i)) ?? ids[0] ?? null;
  }

  async actAs(id: string): Promise<void> {
    if (!this.store.holds(id)) throw new Error('Edubba does not hold that identity.');
    await this.keep.setActive(id);
  }

  /**
   * Post for a real collective (Collectives, Act): Dub's own posting as a
   * collective, signed with the member's own key for it in the area that
   * reaches public posts (F353); through Kišib's panel where the identity is
   * used through it. Where the area asks more keys, its other holders sign
   * it in their To sign.
   */
  async postAs(identity: string, collective: string, text: string): Promise<{ post: string; lines: { text: string; tone?: string }[] }> {
    if (!this.store.holds(identity)) throw new Error('Edubba does not hold that identity.');
    return this.keep.exclusiveAs(async () => {
      await this.keep.setActive(identity);
      this.keep.postingAs = collective;
      try {
        const r = await this.dub.post({ text });
        return { post: r.post.id, lines: r.lines.map((l) => ({ ...l, text: l.text.replace(/\bDub\b/g, 'Edubba') })) };
      } catch (e) {
        // Dub's own words, said here as Edubba's.
        throw new Error((e instanceof Error ? e.message : String(e)).replace(/\bDub\b/g, 'Edubba'));
      } finally {
        this.keep.postingAs = null;
      }
    });
  }

  /** Run one of Dub's signing steps as the identity acted as. */
  async as<T>(f: (d: Dub) => Promise<T>): Promise<T> {
    const id = await this.acting();
    if (!id) throw new Error('No identity is held here: make or bring one on the Identities tab.');
    if ((await this.keep.active()) !== id) await this.keep.setActive(id);
    return f(this.dub);
  }
}
