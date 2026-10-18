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
import type { Store } from './store.ts';

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
  }

  async settings(id: string): Promise<Settings> {
    const s = this.store.settings();
    const kind = this.store.book().identities.find((i) => i.id === id)?.kind ?? 'made';
    // Signing as a member is the Collectives tab's own work here (H33): always on, labelled.
    return { kind, relays: s.relays.length ? s.relays : s.homes.map((h) => h.hint), via: s.via, signing: true };
  }

  async saveSettings(): Promise<void> {
    // Edubba's settings are its own (the Settings tab).
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
  ) {
    this.keep = new MemberKeep(store, desk, named);
    this.dub = new Dub(this.keep);
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

  /** Run one of Dub's signing steps as the identity acted as. */
  async as<T>(f: (d: Dub) => Promise<T>): Promise<T> {
    const id = await this.acting();
    if (!id) throw new Error('No identity is held here: make or bring one on the Identities tab.');
    if ((await this.keep.active()) !== id) await this.keep.setActive(id);
    return f(this.dub);
  }
}
