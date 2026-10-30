// Real collectives in Edubba (H18, decided by Nobody, allegedly: "great,
// three members that i will create seperately on three devices"). Edubba
// founds, proposes, operates and releases; each member consents in their own
// Dub; a collective's chain key lives only on its members' paper.
//
// - **Contacts**: identities added by ID, with a name the user gives (kept
//   here, as the people cMIP keeps names), and those Edubba's agents follow.
//   Members are chosen from them, or typed by ID.
// - **Proposals**: the founding terms, a member change's clone, a release,
//   each proposed by the founder's identity held here and sent to each other
//   member as an Agreements negotiation message (type 18), sealed to them
//   and left in their inbox (`clients/repo/src/proposals.ts`). Each member
//   signs or declines in Dub's Signing tab. Edubba reads the answers, shows
//   who has signed and who has not, and goes on once the agreement's rule is
//   met: founding needs every party (Agreements rule 1).
// - **The chain key** is dealt once every member has signed (the air-gapped
//   signer Module, 5.1), here, the one moment one device holds it (a stated
//   price). Each share goes sealed to the one-time key its member's Dub sent
//   with its acceptance (H18, decided: "never to the member's usual
//   encryption key"), or is shown here once, hand to hand, to a member in the
//   same room; the founder's own is shown here once. Nothing of a share is
//   kept, on disk or after it is shown; shares waiting to be shown are held
//   in this program's memory only, and lost if it stops.
// - **A member change** is proposed and signed the same way; the rotation
//   declaring it needs enough members' paper shares, Kišib's work: it waits
//   for Kišib (decided by Nobody, allegedly: "Wait for Kišib").
// - **A release** is published by the collective (its signing key is held
//   here), and counts once enough holders of its Releases area sign it, each
//   in their own app.
//
// TEST IDENTITIES ONLY.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MIRS, cborDecode, describeAct, hex, moneyRead, openSealed, publicationPayload, sha256, shareOnPaper, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { readId } from '../../genesis/src/forms.ts';
import { shownAct, shownId } from '../../genesis/src/shown.ts';
import { TestCollective, type Governance } from '../../repo/src/collective.ts';
import { AGREEMENTS_SPECS, SPLIT_CMIP, planIn, pointerPayload, proposePayload, record, sign } from '../../repo/src/agreements.ts';
import { negotiate, oneTimeKeyOf, readMessage, sealShare, DECLINED, SIGNED, type Reach } from '../../repo/src/proposals.ts';
import { allBy, prepareRelease, publishPrepared, verifyRelease, gitSource, type Prepared } from '../../repo/src/release.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { fromRules, standardWords, type Rules } from '../../collective/src/actions.ts';
import { readAgreement, readChanges, readRelease, termsOf, withAgreements, rulesHints, type Line, type Reading, type Section } from '../../collective/src/explain.ts';
import { beforeSigning } from '../../assess/src/assess.ts';
import { filesOf, folderOf } from './setup.ts';
import { governanceOf, gridOf, gridSay, type Grid } from './grid.ts';
import { areaReaching, chainFor, collectiveNow, collectivePlaces, collectivePointer, collectiveVerifier, publishAt, signAndAsk, signAsMember } from '../../grants/src/member.ts';
import { keep, keeperLogs, recordedBefore } from '../../grants/src/keeper.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { readSealedList, type Followed } from '../../dub/src/people.ts';
import type { Desk, Done } from './desk.ts';
import type { Store } from './store.ts';
import { CARRIED } from './known.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');

/** Said wherever the present test mode is offered (H18: kept, "clearly labelled as test mode"). */
export const TEST_MODE_SAY =
  'Test mode: every member is held in this Edubba, and their consent is simulated: you decide for all of them. The shares of its chain key are kept in this Edubba’s folder. For trying things alone, and for the tests: nobody else is asked, and nothing it signs binds anyone but you.';

/** Said beside "+ Found a real collective" (H27; the page's REAL_SAY, `page/view.ts`), word for word. */
export const REAL_SAY =
  'A real collective: each member is a person with their own identity, on their own device. Each reads the founding in plain words and signs it in their own Edubba (To sign, on a computer or on the web). Its chain key is dealt as one share per member, written on paper; no app keeps a share.';

/** Said where a member change waits for its rotation (decided by Nobody, allegedly: "Wait for Kišib"). */
/**
 * Said where Edubba founds a real collective, before anything is dealt (F337,
 * decided by Nobody, allegedly: "Kišib needs to lay all this properly to its
 * users", and Edubba at founding): who holds the whole key and when, what
 * that device could do if it were not honest, how to choose it, and the
 * practices. Ticked as read before "Found it".
 */
export const FOUNDING_SAY: Line[] = [
  { text: 'Founding deals the collective’s chain key on this device: one person, you, deals every member’s share. For a moment this Edubba holds the whole chain key, and sees every share before it goes.', tone: 'bad' },
  { text: 'If this device were compromised, or the person holding it dishonest, they could keep the key and later act alone, past the threshold the members agreed: the trusted-dealer weakness (the air-gapped signer Module’s stated price). Nothing can prove a device forgot a key. Kišib’s rotations of the collective have the same moment, on the starter’s device.', tone: 'bad' },
  { text: 'So found on the cleanest device you have: this app rather than any web page, ideally a computer used for nothing else. Making the key jointly, never whole anywhere, is not practical yet for the signature the chain key uses: a MOR 2 research item.', tone: 'warn' },
  { text: 'The practices Edubba follows: the key alive only in memory, dealt at once and overwritten, never written anywhere; each member’s share sealed to the one-time key their own Dub made; the shares to show here (yours, and any hand to hand) held in memory for one hour at most, then overwritten and lost: show them in one sitting, within the hour.' },
  { text: 'Afterwards every member writes their share on paper. A later change of members, or of the collective’s keys, is done in Kišib, from those papers.' },
];

/** How long a share waits here to be shown, in memory (F337: the waiting expires after an hour). */
export const SHARE_WAITS = 60 * 60;

export const WAIT_FOR_KISIB =
  'Every signature is in. The rotation that declares this change needs the chain key, rebuilt from enough members’ paper shares: that is Kišib’s work, not Edubba’s. Open Kišib and choose “Rotate a collective”: the member who proposed the change starts it there, and the other members give their shares in their own Kišib. Until it counts, the change waits, signed and not in force.';

/** A contact: an identity added by ID, with the name the user gave it (kept here, never published), or one an agent follows. */
export interface Contact {
  id: string;
  name: string;
  /** Where it comes from: added here, followed by an agent (its name), or in the follow list sealed to an identity held here (its name; people cMIP draft 2). */
  from: 'added' | { agent: string } | { list: string };
}

/** A proposal sent from here, and the answers gathered. */
export interface Proposal {
  /** The act proposed: founding terms, a clone, or a release. */
  act: string;
  kind: 'founding' | 'clone' | 'release' | 'money' | 'keepers';
  /** The collective's name, kept here. */
  name: string;
  collective: string | null;
  /** The identity held here that proposes, and signs first. */
  founder: string;
  /** Founding and clone: the parties, in order. */
  members: string[];
  /** Who must sign for it to go on: founding, every party; a clone, every voice and each joining member; a release, any `needed` of the area's holders. */
  signers: string[];
  needed: number;
  governance?: Governance;
  /** A split agreement (`money`): its split service, a party that signs it in its own app. */
  service?: string;
  relays: string[];
  /** The negotiation thread opened with each other member. */
  threads: Record<string, string>;
  answers: Record<string, { verdict: 'signed' | 'declined'; signature?: string; oneTime?: string; text: string; message: string }>;
  /** Members whose share is shown here, hand to hand, rather than sent. */
  byHand?: string[];
  /** Founding: the collective once founded. */
  founded?: string;
  /** A member change: the rotation, made in Kišib, that put it in force, once Edubba took the collective's new words (`kishib.ts`). */
  rotated?: string;
  at: number;
}

/** A collective's keepers and the disputes they and its line show (`Real.keepers`). */
export interface KeepersShown {
  keepers: { id: string; name: string; here: boolean; agent: boolean; records: number; ofThis: number }[];
  /** What counts as recorded: every keeper ('all'), a number of them, or null (none named). */
  rule: 'all' | number | null;
  disputes: { member: string; signature: string; version: string; what: string; status: string; rotation: string | null; keepers: string[]; counts: boolean }[];
}

/** A review: what would be signed, in plain words, with its digest. Nothing is signed until confirmed. */
interface Plan {
  digest: string;
  reading: Reading;
  expires: number;
  run(): Promise<Done>;
}

const PLAN_LIFE = 15 * 60 * 1000;

/** A grid as the page sent it, every ID read as the core reads one (`mid1…` or hex), its columns `members`. */
function normalGrid(g: Grid, members: string[]): Grid {
  const id = (x: string) => {
    try {
      return readId(x);
    } catch {
      return x;
    }
  };
  const ids = (xs: string[]) => [...new Set(xs.map(id))].filter((x) => members.includes(x));
  return { ...g, members, constitution: { ...g.constitution, holders: ids(g.constitution.holders) }, areas: g.areas.map((l) => ({ ...l, holders: ids(l.holders) })) };
}

/** The words everyone signs, drawn from the grid when none are typed: the collective's name, then each band's sentences. */
export function gridWords(name: string, said: { heading: string; lines: string[] }[]): string {
  return [`“${name}”, a MOR test collective. Test acts only, wiped before the first real acts. A member may leave alone at any time, keeping what they own.`, ...said.filter((x) => x.heading !== 'Each member').map((x) => `${x.heading}: ${x.lines.join(' ')}`)].join('\n\n');
}

export class Real {
  private plans = new Map<string, Plan>();
  /** The follow lists sealed to the identities held here (people cMIP draft 2), as last read: in memory only. */
  private listed = new Map<string, Followed[]>();
  /** Shares waiting to be shown here once (hand to hand, and the founder's own): in memory only, by `collective member`. */
  private waiting = new Map<string, { share: Uint8Array; positions?: number[]; until: number }>();

  /** Shares past their hour (F337): overwritten and dropped. */
  private expire(now = Math.floor(Date.now() / 1000)): void {
    for (const [k, w] of this.waiting) {
      if (w.until > now) continue;
      w.share.fill(0);
      this.waiting.delete(k);
    }
  }

  constructor(
    readonly desk: Desk,
    readonly store: Store,
  ) {
    for (const d of ['real', join('real', 'proposals'), join('real', 'collectives')]) mkdirSync(store.path(d), { recursive: true, mode: 0o700 });
  }

  private get via() {
    return this.store.settings().via;
  }

  private hints(extra: string[] = []): string[] {
    const s = this.store.settings();
    return [...new Set([...extra, ...s.relays, ...s.homes.map((h) => h.hint)])];
  }

  private write(path: string, v: unknown) {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, path);
  }

  // ------------------------------------------------------------ contacts

  private contactsPath() {
    return this.store.path('contacts.json');
  }

  private ownContacts(): { id: string; name: string }[] {
    return existsSync(this.contactsPath()) ? (JSON.parse(readFileSync(this.contactsPath(), 'utf8')) as { id: string; name: string }[]) : [];
  }

  /** Edubba's own list from before (H100), as kept here: what `known.ts` carries into the sealed lists, once. */
  macList(): { id: string; name: string }[] {
    return this.ownContacts();
  }

  /** H100: Edubba's own list was carried into the sealed lists (`known.ts`): only they are read from then on. */
  retired(): boolean {
    const p = this.store.path(CARRIED);
    return existsSync(p) && (JSON.parse(readFileSync(p, 'utf8')) as { done?: boolean }).done === true;
  }

  /** The follow list sealed to an identity held here, as just read or changed (`known.ts`). */
  setListed(identity: string, follows: Followed[]): void {
    this.listed.set(identity, follows);
  }

  /** The contacts list: added here (until carried into the sealed lists, H100), then those Edubba's agents follow, then the sealed lists (each once). */
  contacts(): Contact[] {
    const out: Contact[] = this.retired() ? [] : this.ownContacts().map((c) => ({ ...c, from: 'added' as const }));
    const names = new Map(this.store.book().identities.map((i) => [i.id, i.name]));
    for (const agent of this.store.agentIds()) {
      for (const f of this.store.people(agent).follows) {
        if (out.some((c) => c.id === f.id)) continue;
        out.push({ id: f.id, name: f.name ?? short(f.id), from: { agent: names.get(agent) ?? short(agent) } });
      }
    }
    const held = new Set(this.store.book().identities.map((i) => i.id));
    for (const [identity, follows] of this.listed) {
      for (const f of follows) {
        if (out.some((c) => c.id === f.id) || held.has(f.id)) continue;
        out.push({ id: f.id, name: f.name ?? short(f.id), from: { list: names.get(identity) ?? short(identity) } });
      }
    }
    return out;
  }

  /**
   * Read the follow list sealed to each identity held here (people cMIP
   * draft 2, section 3), at its homes, opened with its encryption keys: its
   * followed identities, with the names given in Dub, join the contacts.
   * Kept in memory only; read again when asked.
   */
  async readLists(): Promise<{ read: number; problems: string[] }> {
    const problems: string[] = [];
    let read = 0;
    for (const e of this.store.book().identities) {
      const me = this.store.identity(e.id);
      const secrets = [...me.f.encryption].reverse().map((x) => unhex(x.secret));
      if (!secrets.length) continue;
      try {
        const l = await readSealedList(e.id, secrets, me.f.homes.map((h) => h.hint), this.via);
        if (l.act) {
          this.listed.set(e.id, l.follows);
          read++;
        }
        problems.push(...l.problems.map((x) => `${e.name}: ${x}`));
      } catch (x) {
        problems.push(`${e.name}: ${err(x)}`);
      }
    }
    return { read, problems };
  }

  addContact(typed: string, name: string): Contact {
    const id = readId(typed);
    if (!name.trim()) throw new Error('Give it a name, so you can tell it apart here. The name stays on this Mac.');
    const list = this.ownContacts().filter((c) => c.id !== id);
    list.push({ id, name: name.trim() });
    this.write(this.contactsPath(), list);
    return { id, name: name.trim(), from: 'added' };
  }

  removeContact(id: string): void {
    this.write(this.contactsPath(), this.ownContacts().filter((c) => c.id !== id));
  }

  /** How an identity is named here: an identity held, a contact, then the desk's names. */
  names(): (id: string) => string {
    const desk = this.store.names();
    const contacts = new Map(this.contacts().map((c) => [c.id, c.name]));
    const real = new Map(this.collectives().map((c) => [c.id, c.name]));
    return (id: string) => {
      const n = this.store.book().identities.find((i) => i.id === id)?.name ?? contacts.get(id) ?? real.get(id);
      return n ? `${n} [${short(id)}]` : desk(id);
    };
  }

  // ------------------------------------------------------------ what is kept

  private proposalPath(act: string) {
    if (!/^[0-9a-f]{64}$/.test(act)) throw new Error('not a proposal');
    return this.store.path('real', 'proposals', `${act}.json`);
  }

  proposal(act: string): Proposal {
    const p = this.proposalPath(act);
    if (!existsSync(p)) throw new Error('No such proposal here.');
    return JSON.parse(readFileSync(p, 'utf8')) as Proposal;
  }

  private saveProposal(p: Proposal) {
    this.write(this.proposalPath(p.act), p);
  }

  proposals(): Proposal[] {
    return readdirSync(this.store.path('real', 'proposals'))
      .filter((f) => /^[0-9a-f]{64}\.json$/.test(f))
      .map((f) => JSON.parse(readFileSync(this.store.path('real', 'proposals', f), 'utf8')) as Proposal)
      .sort((a, b) => a.at - b.at);
  }

  private collectivePath(id: string) {
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('not a collective');
    return this.store.path('real', 'collectives', `${id}.json`);
  }

  isReal(id: string): boolean {
    return /^[0-9a-f]{64}$/.test(id) && existsSync(this.collectivePath(id));
  }

  collective(id: string): TestCollective {
    if (!this.isReal(id)) throw new Error('No such real collective here.');
    return TestCollective.load(this.collectivePath(id), this.via);
  }

  private saveCollective(c: TestCollective) {
    c.save(this.collectivePath(c.identity));
  }

  /** After Kišib's rotation, taken (`kishib.ts`): the collective's copy saved, its member change marked in force. */
  afterRotation(c: TestCollective, proposal: string, rotation: string): void {
    this.saveCollective(c);
    const p = this.proposal(proposal);
    p.rotated = rotation;
    this.saveProposal(p);
  }

  /** The real collectives founded here: each by its ID, the name given here, and its founder. */
  collectives(): { id: string; name: string; founder: string; members: number }[] {
    return this.proposals()
      .filter((p) => p.kind === 'founding' && p.founded && this.isReal(p.founded))
      .map((p) => ({ id: p.founded!, name: p.name, founder: p.founder, members: this.collective(p.founded!).f.members.length }));
  }

  // ------------------------------------------------------------ reviews

  private plan(p: Omit<Plan, 'expires'>): { plan: string; digest: string; reading: Reading } {
    const id = sha256(`${p.digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(id, { ...p, expires: Date.now() + PLAN_LIFE });
    return { plan: id, digest: p.digest, reading: p.reading };
  }

  cancel(plan: string): void {
    this.plans.delete(plan);
  }

  /** Carry out a review exactly as shown: only with its digest, within 15 minutes, once, never with reasons not to sign. */
  confirm(plan: string, digest: string): Promise<Done> {
    return this.desk.serial(async () => {
      const p = this.plans.get(plan);
      if (!p || p.expires < Date.now()) throw new Error('This review has expired or was already used. Review it again. Nothing was signed.');
      if (p.digest !== digest) throw new Error('The digest does not match what was shown. Nothing was signed.');
      if (p.reading.blocking.length) throw new Error('What was shown cannot be signed. Nothing was signed.');
      this.plans.delete(plan);
      return p.run();
    });
  }

  /** Refuse, before anything is signed, where the collective's own key held here no longer counts (H80: Kišib changes it at a member change). */


  /** Where an identity is reached for a sealed message: its current encryption key and its inbox. */
  private async reach(id: string): Promise<Reach> {
    const l = await lookUp(id, this.hints(), this.via);
    if (!l.encryptionKey) throw new Error(`${this.names()(id)} has published no encryption key: nothing can be sealed to it.`);
    const inbox = l.inbox(REPO_SPECS.agreements);
    if (!inbox?.length) throw new Error(`${this.names()(id)} declares no inbox: no proposal can reach it.`);
    return { id, key: l.encryptionKey, inbox };
  }

  /**
   * The proposer's own signature of a founding or a member change, with
   * their own key: a collective has no member keys (Agreements rule 58). On
   * a clone of a collective, the signature cites its chain too (its latest
   * decision), so that a rotation declaring the clone reads its history
   * through it (rule 58).
   */
  private async signAsParty(me: TestIdentity, act: string, relays: string[], collective?: string) {
    const cites: [string, string][] = collective ? [[collective, (await chainFor(collective, relays, this.via)).decision]] : [];
    try {
      return await sign(me, act, relays, cites);
    } finally {
      this.store.saveIdentity(me);
    }
  }

  /** Send a proposal to each signer but the founder, one thread each; returns the threads. */
  private async invite(founder: string, act: string, signer: string, others: string[], text: string, collective: string | null, lines: Line[]): Promise<Record<string, string>> {
    const me = this.store.identity(founder);
    const threads: Record<string, string> = {};
    for (const m of others) {
      try {
        const r = await this.reach(m);
        const sent = await negotiate(me, r, { text, refs: collective ? [[act, signer], [collective, collective]] : [[act, signer]] });
        this.store.saveIdentity(me);
        threads[m] = sent.id;
        lines.push({ text: sent.left.length ? `Sent to ${this.names()(m)}, sealed, in its inbox (${sent.left.join(', ')}).` : `Not delivered to ${this.names()(m)}: ${sent.failed.map((f) => `${f.relay}: ${f.reason}`).join('; ')}.`, tone: sent.left.length ? 'ok' : 'bad' });
      } catch (e) {
        this.store.saveIdentity(me);
        lines.push({ text: `Not sent to ${this.names()(m)}: ${err(e)}`, tone: 'bad' });
      }
    }
    return threads;
  }

  // ------------------------------------------------------------ founding

  /**
   * Found a real collective: the terms read back in plain words with the
   * deal-assessment tool's reading, nothing signed. Confirmed, the founder
   * proposes them, signs them, and sends them to each other member.
   */
  prepareFounding(a: { name: string; founder: string; members: string[]; rules?: Rules; grid?: Grid; words?: string }) {
    const names = this.names();
    const s = this.store.settings();
    const name = a.name.trim();
    const blocking: string[] = [];
    if (!name) blocking.push('Give the collective a name. It stays on this Mac: it is not published.');
    if (!s.homes.length) blocking.push('Name its homes first, under Settings.');
    if (!this.store.holds(a.founder)) blocking.push('Choose the founder among the identities held here: it proposes and signs first. The collective has no signing key: each member acts for it with their own.');
    const others: string[] = [];
    for (const t of a.members) {
      try {
        const id = readId(t);
        if (id !== a.founder && !others.includes(id)) others.push(id);
      } catch (e) {
        blocking.push(`“${t}”: ${err(e)}`);
      }
    }
    const members = [a.founder, ...others];
    if (members.length < 2) blocking.push('A collective has at least two members.');
    let g: Governance;
    let said: { heading: string; lines: string[] }[] = [];
    if (a.grid) {
      // Round 3: the founding grid (rules 60 and 62; `grid.ts`), its columns
      // the members, the founder first.
      const grid: Grid = normalGrid(a.grid, members);
      said = gridSay(grid, names);
      const words = a.words?.trim() || gridWords(name || 'unnamed', said);
      const r = governanceOf(grid, words);
      blocking.push(...r.blocking);
      g = r.governance;
    } else {
      let rules;
      try {
        rules = fromRules(a.rules ?? { safety: 2, release: 2, clone: 2, others: Math.max(1, members.length - 1) });
      } catch (e) {
        blocking.push(err(e));
        rules = fromRules({ safety: 2, release: 2, clone: 2, others: Math.max(1, members.length - 1) });
      }
      g = { ...rules, text: a.words?.trim() || standardWords(name || 'unnamed', rules) };
    }
    const relays = s.relays.length ? s.relays : s.homes.map((h) => h.hint);
    let payload: Uint8Array;
    try {
      payload = TestCollective.foundingTerms(g, members);
    } catch (e) {
      // Agreements refuse the terms the grid draws: said, nothing signed.
      blocking.push(`Agreements refuse these terms: ${err(e)}`);
      return this.plan({ digest: sha256(`refused founding ${Date.now()}`), reading: { title: `Found the collective “${name}”`, summary: [], sections: said.map((x) => ({ heading: x.heading, lines: x.lines.map((text) => ({ text })) })), plain: [], blocking }, run: async () => ({ title: '', lines: [], acts: [] }) });
    }
    const t = termsOf(payload);
    const read = readAgreement(t, names);
    blocking.push(...withAgreements(a.grid ? [] : rulesHints({ safety: g.safetyThreshold, release: g.releaseThreshold, clone: g.cloneThreshold, others: g.abandonmentOthers }, members.length), read.blocking));
    const reading: Reading = {
      title: `Propose to found the collective “${name}”`,
      summary: [
        `${names(a.founder)} proposes these founding terms and signs them first; each of the ${others.length} other members reads them in plain words in Dub’s Signing tab, on their own device, and signs or declines. The agreement exists only once every one has signed (Agreements rule 1): nobody is founded into a collective without signing (Q11).`,
        `Then this Edubba founds it: the collective’s chain key is dealt as ${members.length} shares, any ${g.safetyThreshold} rebuilding it. Each member’s share goes sealed to a one-time key their Dub makes when they sign (or is shown here, hand to hand), and is kept by no app; yours is shown here once. The collective has no signing key of its own: each member acts for it with their own key, within the rules above (Agreements rules 56 and 60).`,
      ],
      sections: [
        ...said.map((x) => ({ heading: x.heading, lines: x.lines.map((text) => ({ text })) })),
        ...read.sections,
        {
          heading: 'How it travels',
          lines: [
            { text: `The terms are a public act at ${relays.join(', ')}; each member’s signature is a public act of theirs.` },
            { text: 'Each member is sent the proposal as an Agreements negotiation message (rule 52), sealed to them, in their inbox. It binds nothing: talk.' },
          ],
        },
        { heading: 'Before you found: what this device will hold (F337)', lines: FOUNDING_SAY },
        ...beforeSigning(payload, names),
      ],
      plain: [{ heading: 'The words everyone signs', text: t.text }, ...read.plain],
      blocking,
    };
    return this.plan({
      digest: sha256(Buffer.concat([Buffer.from('MOR Edubba real founding, version 1\n'), payload, Buffer.from(JSON.stringify({ homes: s.homes, relays, name }))])),
      reading,
      run: async () => {
        await this.desk.keyCurrent(a.founder);
        const me = this.store.identity(a.founder);
        const lines: Line[] = [];
        // Left at its homes too: a collective publishes no routes, so a reader who knows where it lives (Kišib) finds it there.
        const places = [...new Set([...relays, ...s.homes.map((h) => h.hint)])];
        const terms = await proposePayload(me, payload, undefined, places);
        this.store.saveIdentity(me);
        const own = await this.signAsParty(me, terms.id, places);
        lines.push({ text: `The terms are act ${shownAct(terms.id)}; ${names(a.founder)} signed them (${shownAct(own.id)}).`, tone: 'ok' });
        const p: Proposal = {
          act: terms.id,
          kind: 'founding',
          name,
          collective: null,
          founder: a.founder,
          members,
          signers: members,
          needed: members.length,
          governance: g,
          relays,
          threads: {},
          answers: { [a.founder]: { verdict: 'signed', signature: own.id, text: '', message: '' } },
          at: now(),
        };
        this.saveProposal(p);
        p.threads = await this.invite(a.founder, terms.id, a.founder, others, `${names(a.founder)} proposes to found the collective “${name}” with ${others.map(names).join(', ')}. The founding terms are act ${terms.id}: read them in Dub’s Signing tab, in plain words, then sign or decline. If you sign, your share of its chain key comes to you sealed to a one-time key your Dub makes, once everyone has signed.`, null, lines);
        this.saveProposal(p);
        return { title: `The founding of “${name}” is proposed`, lines, acts: [terms.id] };
      },
    });
  }

  // ------------------------------------------------------------ answers

  /**
   * Read the answers to a proposal: the members' negotiation messages in
   * its threads, from the founder's inbox; a signature counts only where its
   * act is found, signed by that member and naming the act proposed.
   */
  async gather(act: string): Promise<{ proposal: Proposal; problems: string[] }> {
    return this.desk.serial(async () => {
      const p = this.proposal(act);
      const me = this.store.identity(p.founder);
      const problems: string[] = [];
      const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
      let inbox: string[] = [];
      try {
        inbox = (await lookUp(me.id, this.hints(me.f.homes.map((h) => h.hint)), this.via)).inbox(REPO_SPECS.agreements) ?? [];
      } catch (e) {
        problems.push(`The founder’s inbox could not be looked up: ${err(e)}`);
      }
      const threads = new Map(Object.entries(p.threads).map(([m, t]) => [t, m]));
      for (const hint of inbox) {
        let after: number | undefined;
        try {
          for (;;) {
            const page = await relayAt(hint, this.via).feed({ to: me.id, after });
            for (const it of page.items) {
              if (it.kind !== 'sealed') continue;
              let o: { described: Parameters<typeof readMessage>[0] } | null = null;
              for (const s of secrets) {
                try {
                  o = openSealed(it.item, me.id, s) as { described: Parameters<typeof readMessage>[0] };
                  break;
                } catch {
                  // the next key
                }
              }
              const m = o ? readMessage(o.described) : null;
              if (!m) continue;
              const member = threads.get(m.thread);
              if (!member || m.from !== member || p.answers[member]) continue;
              const first = m.text.split('\n')[0];
              if (first === DECLINED) p.answers[member] = { verdict: 'declined', text: m.text, message: m.id };
              else if (first === SIGNED) {
                const sig = /act ([0-9a-f]{64})/.exec(m.text)?.[1];
                const ok = sig ? await this.signatureFound(member, sig, p.act, p.relays) : false;
                if (!ok) {
                  problems.push(`${this.names()(member)} says signed, but its signature act naming the proposal was not found: not counted.`);
                  continue;
                }
                const k = oneTimeKeyOf(m.text);
                p.answers[member] = { verdict: 'signed', signature: sig!, ...(k ? { oneTime: b64(k) } : {}), text: m.text, message: m.id };
              }
            }
            if (!page.items.length || page.next === after) break;
            after = page.next;
          }
        } catch (e) {
          problems.push(`${hint}: ${err(e)}`);
        }
      }
      this.saveProposal(p);
      return { proposal: p, problems };
    });
  }

  /** Whether `member`'s signature act `sig` is found, signed by it and naming `act` (Agreements, signature). */
  private async signatureFound(member: string, sig: string, act: string, relays: string[]): Promise<boolean> {
    for (const a of await allBy(member, this.hints(relays), this.via)) {
      try {
        const d = describeAct(a) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
        if (d.id !== sig || d.signer !== member || d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.signature || !d.payload) continue;
        const named = (cborDecode(d.payload) as Map<number, unknown>).get(0);
        if (named instanceof Uint8Array && hex(named) === act) return true;
      } catch {
        // not an act this reads
      }
    }
    return false;
  }

  /** Who has signed, who declined, who has not answered, in plain words. */
  standing(p: Proposal): { signed: string[]; declined: string[]; waiting: string[]; enough: boolean } {
    const signed = p.signers.filter((m) => p.answers[m]?.verdict === 'signed');
    const declined = p.signers.filter((m) => p.answers[m]?.verdict === 'declined');
    const waiting = p.signers.filter((m) => !p.answers[m]);
    return { signed, declined, waiting, enough: signed.length >= p.needed };
  }

  /** Mark a member's share to be shown here, hand to hand, rather than sent (or back to sent). */
  byHand(act: string, member: string, on: boolean): Proposal {
    const p = this.proposal(act);
    if (!p.members.includes(member) || member === p.founder) throw new Error('Not a member to whom a share is sent.');
    p.byHand = on ? [...new Set([...(p.byHand ?? []), member])] : (p.byHand ?? []).filter((m) => m !== member);
    this.saveProposal(p);
    return p;
  }

  /**
   * Found the collective once every party has signed: the chain key dealt
   * here, the genesis declaring the agreement, each member's share sealed to
   * its one-time key (or held in memory to be shown here once, hand to hand),
   * the founder's own held to be shown once. Nothing of a share is written.
   */
  found(act: string, read = false): Promise<Done & { show: string[] }> {
    return this.desk.serial(async () => {
      const p = this.proposal(act);
      if (p.kind !== 'founding') throw new Error('Not a founding.');
      if (p.founded) throw new Error('It is founded already.');
      const st = this.standing(p);
      if (st.declined.length) throw new Error(`${st.declined.map(this.names()).join(', ')} declined: it cannot be founded with these terms. Propose others.`);
      if (!st.enough) throw new Error(`Waiting for ${st.waiting.map(this.names()).join(', ')}: founding terms exist only once every party has signed (Agreements rule 1).`);
      const missing = p.members.filter((m) => m !== p.founder && !p.answers[m]?.oneTime && !(p.byHand ?? []).includes(m));
      if (missing.length) throw new Error(`No one-time key from ${missing.map(this.names()).join(', ')}: their share can only be shown here, hand to hand. Choose that for them first.`);
      if (!read) throw new Error('Read what this device will hold while founding (F337), and tick it, first. Nothing was dealt.');
      // The founder seals the shares and tells each member with its own key: checked before anything is dealt (H80).
      await this.desk.keyCurrent(p.founder);
      const s = this.store.settings();
      const { collective: c, shares } = await TestCollective.foundSigned({ agreement: p.act, members: p.members, homes: s.homes, relays: p.relays, governance: p.governance!, via: this.via });
      this.saveCollective(c);
      p.founded = c.identity;
      p.collective = c.identity;
      this.saveProposal(p);
      const lines: Line[] = [{ text: `The collective is born: ${shownId(c.identity)}. Its genesis declares the agreement ${shownAct(p.act)}.`, tone: 'ok' }];
      const me = this.store.identity(p.founder);
      const show: string[] = [];
      for (const sh of shares) {
        const m = sh.holder;
        const x = (shareOnPaper(sh.share) as { x: number }).x;
        if (m === p.founder || (p.byHand ?? []).includes(m)) {
          this.waiting.set(`${c.identity} ${m}`, { share: sh.share, until: Math.floor(Date.now() / 1000) + SHARE_WAITS });
          show.push(m);
          lines.push({ text: `Share ${x}, for ${this.names()(m)}: to be shown here once${m === p.founder ? '' : ', hand to hand'}.` });
          continue;
        }
        try {
          const r = await this.reach(m);
          const sealed = await sealShare(me, sh.share, Uint8Array.from(Buffer.from(p.answers[m].oneTime!, 'base64')), [...new Set([...r.inbox, ...p.relays])]);
          this.store.saveIdentity(me);
          await negotiate(me, r, {
            text: `The collective “${p.name}” is founded: ${c.identity}. Your share of its chain key is sealed to the one-time key you sent: open the Signing tab to see it, once.`,
            thread: p.threads[m],
            previous: p.threads[m],
            acks: [p.answers[m].message],
            refs: [
              [p.act, p.founder],
              [c.identity, c.identity],
            ],
          });
          this.store.saveIdentity(me);
          lines.push({ text: `Share ${x}, sealed to ${this.names()(m)}’s one-time key (${sealed.left.join(', ')}).`, tone: 'ok' });
        } catch (e) {
          this.store.saveIdentity(me);
          lines.push({ text: `Share ${x} could not be sent to ${this.names()(m)}: ${err(e)}. Lost: a share is never kept here.`, tone: 'bad' });
        }
        sh.share.fill(0);
      }
      lines.push({ text: 'No share is kept by this program: the shares to show here wait in its memory only, for one hour at most (F337), until shown, and are lost if it stops or the hour passes.', tone: 'warn' });
      return { title: `“${p.name}” is founded`, lines, acts: [c.identity], show };
    });
  }

  /** The shares waiting here to be shown once: by collective and member. */
  toShow(collective: string): string[] {
    this.expire();
    return [...this.waiting.keys()].filter((k) => k.startsWith(`${collective} `)).map((k) => k.slice(65));
  }

  /** Show one member's share here, once (hand to hand, or the founder's own): its number and 24 words; three are then asked back. */
  showShare(collective: string, member: string): { x: number; holders: number; threshold: number; words: string[]; fingerprint: string; positions: number[]; member: string } {
    this.expire();
    const w = this.waiting.get(`${collective} ${member}`);
    if (!w) throw new Error('No share waits here for that member: shares are shown once, then forgotten, and wait an hour at most (F337).');
    if (w.positions) throw new Error('It was shown once already: type back the three words asked.');
    const p = shareOnPaper(w.share) as { x: number; value: Uint8Array; holders: number; threshold: number; fingerprint: string };
    w.positions = threePositions((n) => Math.floor(Math.random() * n));
    return { x: p.x, holders: p.holders, threshold: p.threshold, words: toWords(p.value), fingerprint: p.fingerprint.match(/.{1,4}/g)!.slice(0, 8).join(' '), positions: w.positions, member };
  }

  /** Three words of a shown share typed back: then it is forgotten here. */
  confirmShare(collective: string, member: string, typed: string[]): Done {
    const key = `${collective} ${member}`;
    this.expire();
    const w = this.waiting.get(key);
    if (!w?.positions) throw new Error('No share was shown here for that member.');
    const p = shareOnPaper(w.share) as { x: number; value: Uint8Array };
    if (!typedBack(toWords(p.value), w.positions, typed)) throw new Error(`Those are not words ${w.positions.join(', ')} of the share as shown. Look at what was written down.`);
    w.share.fill(0);
    this.waiting.delete(key);
    return { title: `Share ${p.x} is written down`, lines: [{ text: 'It is forgotten here: no app holds it now, only the paper.', tone: 'ok' }], acts: [] };
  }

  // ------------------------------------------------------------ a member change

  /** A member change: the clone read back (what it changes, the tool's reading); confirmed, proposed, signed by the founder, sent to every other signer. */
  prepareChange(a: { collective: string; members: string[]; grid?: Grid }) {
    const c = this.collective(a.collective);
    const names = this.names();
    const blocking: string[] = [];
    const members: string[] = [];
    for (const t of a.members) {
      try {
        const id = readId(t);
        if (!members.includes(id)) members.push(id);
      } catch (e) {
        blocking.push(`“${t}”: ${err(e)}`);
      }
    }
    if (members.length < 2) blocking.push('A collective has at least two members.');
    const founder = this.proposals().find((p) => p.founded === a.collective)?.founder ?? c.f.members[0];
    if (!members.includes(founder) && !this.store.holds(founder)) blocking.push('The founder held here must stay a member, or another identity held here propose.');
    if (c.f.pending) blocking.push('A member change already waits for its rotation (Kišib).');
    let clone: ReturnType<TestCollective['cloneFor']>;
    let said: { heading: string; lines: string[] }[] = [];
    let governance: Governance | undefined;
    if (a.grid) {
      // Round 3: the same grid as the founding, filled from the agreement in force (`grid.ts`).
      const grid: Grid = normalGrid(a.grid, members);
      said = gridSay(grid, names);
      const r = governanceOf(grid, c.f.governance.text, (c.f.governance.areas ?? []).map((x) => x.id), members.filter((m) => !c.f.members.includes(m)));
      blocking.push(...r.blocking);
      governance = r.governance;
    }
    try {
      clone = c.cloneFor(members, governance);
    } catch (e) {
      // Agreements refuse the clone as it stands (its numbers no longer fit the members): said, nothing made.
      const reading: Reading = {
        title: 'This member change cannot be proposed as it stands',
        summary: [`Agreements refuse it: ${err(e)}.`, 'With fewer members, the rules’ numbers (shares that rebuild the key, who judges absence) must change with them; changing them in the same proposal is not offered here yet.'],
        sections: [],
        plain: [],
        blocking: [...blocking, `Agreements refuse it: ${err(e)}.`],
      };
      return this.plan({ digest: sha256(`refused ${a.collective} ${members.join(',')}`), reading, run: async () => ({ title: '', lines: [], acts: [] }) });
    }
    const parent = TestCollective.foundingTerms(c.f.governance, c.f.members);
    const reading: Reading = {
      title: `Change the members of “${this.collectives().find((x) => x.id === a.collective)?.name ?? short(a.collective)}”`,
      summary: [
        `A clone of its agreement, naming ${members.map(names).join(', ')} as its members, proposed by ${names(founder)}. Membership is constitutional: every member whose voice remains must sign it, and each joining member signs to be bound (Agreements rules 1, 64, 69). Each signs in their own app.`,
        'It carries the shares in the same clone (H101): a joining member holds one, set above. It comes into force only with the rotation that declares it, which needs enough members’ paper shares: Kišib’s work. It waits for Kišib.',
      ],
      sections: [...said.map((x) => ({ heading: x.heading, lines: x.lines.map((text) => ({ text })) })), { heading: 'What it changes', lines: readChanges(parent, clone.payload, names) }, { heading: 'Who signs', lines: [{ text: `${clone.signers.map(names).join(', ')}.` }] }, ...beforeSigning(clone.payload, names)],
      plain: [],
      blocking,
    };
    return this.plan({
      digest: sha256(Buffer.concat([Buffer.from('MOR Edubba real member change, version 1\n'), Buffer.from(a.collective), clone.payload])),
      reading,
      run: async () => {
        await this.desk.keyCurrent(founder);
        const me = this.store.identity(founder);
        const lines: Line[] = [];
        const proposed = await proposePayload(me, clone.payload, c.f.agreement, c.places);
        this.store.saveIdentity(me);
        const own = await this.signAsParty(me, proposed.id, this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)]), a.collective);
        const name = this.collectives().find((x) => x.id === a.collective)?.name ?? short(a.collective);
        const p: Proposal = {
          act: proposed.id,
          kind: 'clone',
          name,
          collective: a.collective,
          founder,
          members,
          signers: clone.signers,
          needed: clone.signers.length,
          governance: clone.governance,
          relays: c.f.relays,
          threads: {},
          answers: { [founder]: { verdict: 'signed', signature: own.id, text: '', message: '' } },
          at: now(),
        };
        this.saveProposal(p);
        p.threads = await this.invite(founder, proposed.id, founder, clone.signers.filter((m) => m !== founder), `${names(founder)} proposes to change the members of the collective “${name}” to ${members.map(names).join(', ')}. The clone is act ${proposed.id}: read it in Dub’s Signing tab, then sign or decline. If you are a member after it, your new share of the chain key comes sealed to a one-time key your Dub makes.`, a.collective, lines);
        this.saveProposal(p);
        lines.push({ text: 'Once every signature is in, it waits for Kišib: the rotation needs enough members’ paper shares.', tone: 'warn' });
        return { title: 'The member change is proposed', lines, acts: [proposed.id] };
      },
    });
  }

  // ------------------------------------------------------------ the collective's money (round 3, part C; H101, decided)

  /**
   * Where the collective's payments land, read back before anything is
   * signed (H101, decided by Nobody, allegedly: "The split service is an
   * agreement that points to the ownership of the collective to attribute
   * shares, same as with the publication. Yes, it should. If people want to
   * operate with a single wallet it's their choice."). Who owns the
   * collective is its shares, set in its constitution (the grid's Shares
   * band); this tab never changes them. Two ways:
   *
   * - **a split service**: a split agreement, a publication selling nothing
   *   (Agreements type 6, no field 0), naming the collective's ownership
   *   agreement by its founding version (field 1: the shares read by
   *   reference to the version in force at each payment, rule 12), the
   *   service (field 3), and a referral share off the top where one is set.
   *   A member makes it for the collective, under the rule of its Agreements
   *   layer (or the finer area reaching publications); the service signs it,
   *   a party. Once it counts, the collective's payee pointer names the
   *   service's own rails (the pointer check), under the rule of Money.
   * - **one trusted pointer**: the collective's payee pointer names one
   *   member's own wallet; that member receives everything and divides it by
   *   the shares; the others rely on them. Said plainly.
   */
  prepareMoney(a: { collective: string; way?: 'service' | 'pointer'; referral?: number; service?: string; wallet?: string; by?: string }) {
    const c = this.collective(a.collective);
    const names = this.names();
    const blocking: string[] = [];
    const way = a.way ?? 'service';
    const founder = a.by ?? this.proposals().find((p) => p.founded === a.collective)?.founder ?? c.f.members.find((m) => this.store.holds(m)) ?? c.f.members[0];
    if (!this.store.holds(founder)) blocking.push('Choose a member held here: they make the act for the collective with their own key.');
    if (!c.f.members.includes(founder)) blocking.push('The member who acts must be a member of the collective.');
    if (c.f.pending) blocking.push('A member change already waits for its rotation (Kišib).');
    const referral = Math.round((a.referral ?? 0) * 10_000);
    if (!Number.isSafeInteger(referral) || referral < 0 || referral >= 1_000_000) blocking.push('The referral share is a percentage from 0 to less than 100.');
    let service = '';
    let wallet = '';
    if (way === 'service') {
      try {
        service = readId(a.service ?? '');
      } catch (e) {
        blocking.push(`The split service: ${err(e)}`);
      }
      if (service && c.f.members.includes(service)) blocking.push('The split service is a separate identity, not a member.');
    } else {
      try {
        wallet = readId(a.wallet ?? '');
      } catch (e) {
        blocking.push(`Whose wallet: ${err(e)}`);
      }
      if (wallet && !c.f.members.includes(wallet)) blocking.push('One trusted pointer names a member’s own wallet: choose a member.');
    }
    const owners = c.f.agreements[0];
    const shares = (c.f.governance.stakes?.find((x) => x.object === null)?.holders ?? c.f.members.map((m) => [m, Math.round(1_000_000 / c.f.members.length)] as [string, number])) as [string, number][];
    const cname = this.collectives().find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const pct = (n: number) => `${(n / 10_000).toLocaleString('en', { maximumFractionDigits: 4 })}%`;
    let payload: Uint8Array | null = null;
    if (way === 'service' && !blocking.length) {
      try {
        payload = (publicationPayload({ owners, partners: [], service, plan: planIn({ roles: referral ? [['referral', referral]] : [], cmip: SPLIT_CMIP }) }) as { payload: Uint8Array }).payload;
      } catch (e) {
        blocking.push(`Agreements refuse it: ${err(e)}.`);
      }
    }
    const reading: Reading = {
      title: `The money of “${cname}”: where its payments land`,
      summary:
        way === 'service'
          ? [
              `A split agreement of the collective, made by ${names(founder)} with their own key for it, naming its ownership: its shares are read from its constitution in force at each payment, never copied here. The split service ${service ? names(service) : '…'} signs it too.`,
              'Once it counts, the collective’s payee pointer names the service’s own rails: a buyer’s payment goes to the service, which receives it in its own name, pays each holder their share and publishes the split (Agreements rules 12, 15 to 23).',
            ]
          : [
              `One trusted pointer: the collective’s payee pointer names ${wallet ? names(wallet) : '…'}’s own wallet. ${wallet ? names(wallet) : 'That member'} receives everything and divides it by the shares; the others rely on them.`,
              'The shares stay on record as what each member is owed (its constitution); nothing in MOR divides the money for them.',
            ],
      sections: [
        { heading: 'Who owns it (its constitution, not changed here)', lines: shares.map(([m, n]) => ({ text: `${names(m)}: ${pct(n)}.` })) },
        ...(way === 'service'
          ? [
              {
                heading: 'How each payment is divided (the split agreement’s plan)',
                lines: [
                  ...(referral ? [{ text: `Off the top: a referral share of ${pct(referral)}, paid to whoever reposted the work where the buyer found it, when the buyer’s own claim names that repost (a role share with evidence, rule 22). Nobody named: it goes to the owners.` }] : [{ text: 'No share off the top: everything goes to the owners, by their shares.' }]),
                  { text: 'The rest: to the owners, by their shares in the constitution in force, each exact share rounded down, the leftover units one each to the largest remainders, ties taking turns (rule 9). Computed by the split cMIP.' },
                ],
              },
            ]
          : [{ heading: 'Stated cost', lines: [{ text: 'Every payment trusts one member. Nobody can check from MOR that they divided it by the shares.', tone: 'warn' as const }] }]),
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      digest: sha256(Buffer.concat([Buffer.from('MOR Edubba collective money, version 2\n'), Buffer.from(JSON.stringify([a.collective, way, referral, service, wallet, founder]))])),
      reading,
      run: async () => {
        if (blocking.length) throw new Error('This cannot be proposed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(founder);
        const me = this.store.identity(founder);
        const lines: Line[] = [];
        const places = this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)]);
        if (way === 'pointer') {
          const ptr = await this.pointTo(c, wallet, founder);
          lines.push({ text: `The collective’s payee pointer names ${names(wallet)}’s wallet (${short(ptr.act)}), made by ${names(ptr.signer)} with their own key under “${ptr.area}”.`, tone: 'ok' });
          if (ptr.needed > 1) lines.push({ text: `It asks ${ptr.needed}: ${ptr.asked.length ? `${ptr.asked.map(names).join(', ')} asked` : 'nobody could be asked'}.`, tone: 'warn' });
          return { title: 'One trusted pointer', lines, acts: [ptr.act] };
        }
        // A collective's split agreement is judged in its judicial tier (Agreements rules 48 and 94, as S7h-4 built them):
        // every member whose voice remains signs it, whatever the Agreements layer's rule.
        const at = await chainFor(c.identity, places, this.via);
        const made = await signAsMember(c.identity, me, at, { spec: MIRS.agreements, type: AGREEMENTS_TYPES.publication, payload: payload!, public: true, objects: [[owners, owners]] });
        this.store.saveIdentity(me);
        await publishAt([made.act], places, this.via);
        const voices = c.f.members.filter((m) => !(c.f.governance.departed ?? []).includes(m));
        const holders = voices.filter((h) => h !== founder);
        const needed = holders.length;
        const p: Proposal = {
          act: made.id,
          kind: 'money',
          name: cname,
          collective: a.collective,
          founder,
          members: c.f.members,
          signers: holders,
          needed,
          relays: c.f.relays,
          threads: {},
          answers: {},
          service,
          at: now(),
        };
        this.saveProposal(p);
        lines.push({ text: `The split agreement is act ${shownAct(made.id)}, made by ${names(founder)} for the collective; every member signs it (its judicial tier: it decides how the money of all is divided).`, tone: 'ok' });
        if (needed) p.threads = await this.invite(founder, made.id, founder, holders, `${names(founder)} made the split agreement of the collective “${cname}”, naming its split service ${names(service)}: act ${made.id}. Every member signs it (${needed + 1}): read it in Dub’s Signing tab, then sign or decline.`, a.collective, lines);
        this.saveProposal(p);
        lines.push({ text: `The split service ${names(service)} signs it in its own app. Once it counts, record it here: the collective’s payee pointer then names the service.` });
        return { title: 'The collective’s split agreement is made', lines, acts: [made.id] };
      },
    });
  }

  /** The split agreement as Agreements judge it: whether it counts, who has not signed. */
  private async splitAgreementCounts(c: TestCollective, act: string): Promise<{ counts: boolean; unsigned: string[]; problems: string[] }> {
    const places = this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)]);
    const { v } = await collectiveVerifier(c.identity, places, this.via, [act]);
    // The split service is a party: its chain and its signature act, read too.
    const service = this.proposal(act).service;
    if (service) {
      try {
        const l = await lookUp(service, places, this.via, v);
        for (const a of await allBy(service, this.hints([...places, ...l.resolution.homes.map((h) => h.hint)]), this.via)) {
          try {
            v.add(a);
          } catch {
            // held already
          }
        }
      } catch {
        // not found: its signature cannot count
      }
    }
    const pe = v.agreementsPublication(AGREEMENTS_SPECS, act) as { counts: boolean; unsigned: string[]; problems: string[] };
    return pe;
  }

  /**
   * The collective's payee pointer, a new version naming `payee`'s own rails
   * (a split service's, the pointer check; or one member's wallet), made by
   * a member with their own key under the rule of the Money layer, or of the
   * finer area reaching payee pointers (Money draft 10, rule 7; Agreements
   * rule 60): `by`, or another member held here who may act there; the
   * others the rule needs asked for their signature.
   */
  private async pointTo(c: TestCollective, payee: string, by: string): Promise<{ act: string; signer: string; area: string; needed: number; asked: string[]; notAsked: string[] }> {
    const hints = this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint), ...this.store.settings().homes.map((h) => h.hint)]);
    const l = await lookUp(payee, hints, this.via);
    const pPlaces = this.hints([...hints, ...l.resolution.homes.map((x) => x.hint), ...l.routes.routes.flatMap((r) => r.hints)]);
    for (const a of await allBy(payee, pPlaces, this.via)) {
      try {
        l.verifier.add(a);
      } catch {
        // held already
      }
    }
    const sp = l.verifier.moneyPointer(MIRS.money, payee) as { act: string | null };
    if (!sp.act) throw new Error(`${this.names()(payee)} publishes no payee pointer`);
    let spAct: Uint8Array | null = null;
    for (const h of pPlaces) {
      spAct = await relayAt(h, this.via).getAct(sp.act).catch(() => null);
      if (spAct) break;
    }
    if (!spAct) throw new Error('its payee pointer was not found');
    const rails = (moneyRead(0, (describeAct(spAct) as { payload: Uint8Array }).payload) as { act: { rails: { module: string; address: Uint8Array }[] } }).act.rails;
    const places = await collectivePlaces(c.identity, hints, this.via);
    const { area } = await areaReaching(c.identity, places, { spec: MIRS.money, type: 0 }, this.via);
    if (!area) throw new Error('its agreement in force was not read: who acts for it in Money is not known');
    const signer = [by, ...this.store.book().identities.map((i) => i.id)].find((id, i, xs) => xs.indexOf(id) === i && area.holders.includes(id) && this.store.holds(id));
    if (!signer) throw new Error(`no identity held here acts for the collective in ${area.name}: one of ${area.holders.map(this.names()).join(', ')} makes it, in Damgar or here`);
    const me = this.store.identity(signer);
    const cur = await collectivePointer(c.identity, places, this.via).catch(() => null);
    const payload = pointerPayload({ payee: c.identity, version: (cur?.version ?? 0) + 1, ...(cur?.pointer ? { previous: cur.pointer } : {}), rails: rails.map((x) => [x.module, new Uint8Array(x.address)] as [string, Uint8Array]) });
    const others = area.number > 1 ? area.holders.filter((h) => h !== signer) : [];
    const names = this.names();
    try {
      await this.desk.keyCurrent(signer);
      const made = await signAndAsk(me, c.identity, { spec: MIRS.money, type: 0, payload }, others, `${names(signer)} made the payee pointer of the collective, naming ${names(payee)}, with their own key under “${area.name}”, which asks ${area.number}. Read it in your Signing tab, then sign it.`, places, this.via);
      return { act: made.act, signer, area: area.name, needed: area.number, asked: made.asked, notAsked: made.notAsked };
    } finally {
      this.store.saveIdentity(me);
    }
  }

  /** Record a split agreement that counts (its members and its service signed): the collective's payee pointer then names the service. */
  recordMoney(act: string): Promise<Done> {
    return this.desk.serial(async () => {
      const p = this.proposal(act);
      if (p.kind !== 'money' || !p.collective || !p.service) throw new Error('Not a split agreement of the collective.');
      if (p.rotated) throw new Error('It is recorded already.');
      const st = this.standing(p);
      if (!st.enough) throw new Error(`Its rule asks more members first: waiting for ${st.waiting.map(this.names()).join(', ')}.`);
      const c = this.collective(p.collective);
      const judged = await this.splitAgreementCounts(c, p.act);
      if (!judged.counts) throw new Error(`The split agreement does not count yet${judged.unsigned.length ? `: waiting for ${judged.unsigned.map(this.names()).join(', ')} to sign it` : ''}${judged.problems.length ? ` (${judged.problems.join('; ')})` : ''}.`);
      p.rotated = p.act;
      this.saveProposal(p);
      const names = this.names();
      const lines: Line[] = [{ text: `The split agreement counts: the split service ${names(p.service)} divides each payment by the collective’s shares in force.`, tone: 'ok' }];
      const acts = [p.act];
      try {
        const ptr = await this.pointTo(c, p.service, p.founder);
        acts.push(ptr.act);
        lines.push({ text: `Its payee pointer now names the split service (${short(ptr.act)}), made by ${names(ptr.signer)} with their own key under “${ptr.area}”.`, tone: 'ok' });
        lines.push(
          ptr.needed > 1
            ? { text: `Its rule asks ${ptr.needed}: ${ptr.asked.length ? `${ptr.asked.map(names).join(', ')} ${ptr.asked.length === 1 ? 'is' : 'are'} asked, in their own app` : 'nobody could be asked'}${ptr.notAsked.length ? `; not reached: ${ptr.notAsked.map(names).join(', ')}` : ''}. Until then a buyer’s payment cannot reach the service.`, tone: 'warn' }
            : { text: 'One member alone may: a buyer’s payment goes there now.', tone: 'ok' },
        );
      } catch (e) {
        lines.push({ text: `Its payee pointer could not be pointed at the split service yet: ${err(e)}`, tone: 'warn' });
      }
      return { title: 'In force', lines, acts };
    });
  }

  /**
   * The collective's keepers (terms field 3, rules 36 to 44): a clone of its
   * agreement, every member signing it in their own app (a judicial clause,
   * rule 67), recorded here once every signature is in (rule 72).
   */
  prepareKeepers(a: { collective: string; keepers: string[]; keepersNeeded: number }) {
    const c = this.collective(a.collective);
    const names = this.names();
    const blocking: string[] = [];
    const members = c.f.members.filter((m) => !(c.f.governance.departed ?? []).includes(m));
    const founder = this.proposals().find((p) => p.founded === a.collective)?.founder ?? c.f.members.find((m) => this.store.holds(m)) ?? c.f.members[0];
    if (c.f.pending) blocking.push('A member change already waits for its rotation (Kišib).');
    const keepers: string[] = [];
    for (const k of a.keepers) {
      try {
        const id = readId(k);
        if (!keepers.includes(id)) keepers.push(id);
      } catch (e) {
        blocking.push(`A keeper: ${err(e)}`);
      }
    }
    if (!keepers.length) blocking.push('Name at least one keeper.');
    if (keepers.length && (!Number.isSafeInteger(a.keepersNeeded) || a.keepersNeeded < 1 || a.keepersNeeded > keepers.length)) blocking.push(`Keepers: how many must record an act, from 1 to ${keepers.length}.`);
    const g: Governance = { ...c.f.governance, keepers: { ids: keepers, rule: a.keepersNeeded === 1 ? { threshold: 1 } : a.keepersNeeded === keepers.length ? { all: true } : { threshold: a.keepersNeeded } } };
    let preview: ReturnType<TestCollective['sameMembersClone']> | null = null;
    if (!blocking.length) {
      try {
        preview = c.sameMembersClone(g);
      } catch (e) {
        blocking.push(`Agreements refuse it: ${err(e)}.`);
      }
    }
    const cname = this.collectives().find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const reading: Reading = {
      title: `The keepers of “${cname}”`,
      summary: ['One clone of its agreement, every member signing it in their own app: the keepers are judges (rule 67). It is recorded here at once once every signature is in (rule 72).'],
      sections: [
        { heading: 'Who keeps its record (keepers, field 3)', lines: [{ text: `${keepers.map(names).join(', ') || '…'}; an act counts as recorded once ${a.keepersNeeded === keepers.length ? 'every one of them' : `${a.keepersNeeded} of them`} recorded it (rules 36 to 44). A keeper sees the acts it records; one may be an Edubba agent.` }] },
        ...(preview ? [{ heading: 'What it changes', lines: readChanges(TestCollective.foundingTerms(c.f.governance, c.f.members), preview.payload, names) }, ...beforeSigning(preview.payload, names)] : []),
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      digest: sha256(Buffer.concat([Buffer.from('MOR Edubba collective keepers, version 1\n'), Buffer.from(JSON.stringify([a.collective, keepers, a.keepersNeeded]))])),
      reading,
      run: async () => {
        if (blocking.length || !preview) throw new Error('This cannot be proposed while a reason above stands. Nothing was signed.');
        await this.desk.keyCurrent(founder);
        const lines: Line[] = [];
        const me = this.store.identity(founder);
        const proposed = await proposePayload(me, preview.payload, c.f.agreement, c.places);
        this.store.saveIdentity(me);
        const own = await this.signAsParty(me, proposed.id, this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)]), a.collective);
        const p: Proposal = { act: proposed.id, kind: 'keepers', name: cname, collective: a.collective, founder, members, signers: members, needed: members.length, governance: g, relays: c.f.relays, threads: {}, answers: { [founder]: { verdict: 'signed', signature: own.id, text: '', message: '' } }, at: now() };
        this.saveProposal(p);
        p.threads = await this.invite(founder, proposed.id, founder, members.filter((m) => m !== founder), `${names(founder)} proposes the keepers of the collective “${cname}”. The clone is act ${proposed.id}: read it in Dub’s Signing tab, then sign or decline.`, a.collective, lines);
        this.saveProposal(p);
        lines.push({ text: 'Once every member has signed, record it here: it is then in force.' });
        return { title: 'The collective’s keepers are proposed', lines, acts: [proposed.id] };
      },
    });
  }

  /** Record a keepers clone every member signed (rule 72), the record drawn by its proposer. */
  recordKeepers(act: string): Promise<Done> {
    return this.desk.serial(async () => {
      const p = this.proposal(act);
      if (p.kind !== 'keepers' || !p.collective || !p.governance) throw new Error('Not a proposal of the collective’s keepers.');
      if (p.rotated) throw new Error('It is recorded already.');
      const st = this.standing(p);
      if (!st.enough) throw new Error(`Every member signs it first: waiting for ${st.waiting.map(this.names()).join(', ')}.`);
      const c = this.collective(p.collective);
      await this.actFor(c, p.founder);
      const r = await c.recordSigned({ governance: p.governance, clone: p.act, signatures: p.signers.map((m) => p.answers[m].signature!) });
      this.store.saveIdentity(c.id.actor!);
      this.saveCollective(c);
      p.rotated = r;
      this.saveProposal(p);
      return { title: 'In force', lines: [{ text: `Recorded on the collective’s line (${short(r)}): its keepers are in force.`, tone: 'ok' }], acts: [r] };
    });
  }

  /** A member held here acts for the collective next, with their own key (rule 58), their key checked current first (H80). */
  private async actFor(c: TestCollective, member: string): Promise<TestIdentity> {
    await this.desk.keyCurrent(member);
    const me = this.store.identity(member);
    c.by(me);
    return me;
  }

  // ------------------------------------------------------------ keepers (rules 36 to 44)

  /**
   * Its keepers, as its agreement in force names them (terms field 3), each
   * with what it recorded of this collective; and every signature a
   * recorded version relies on that its signer's own rotation disowned,
   * shown as a dispute where the collective's line placed it before any
   * line registering that rotation (C5, F302), or a keeper named recorded
   * it before recording the rotation (rule 41): never as a void.
   */
  async keepers(collective: string): Promise<KeepersShown> {
    const c = this.collective(collective);
    const names = this.names();
    const places = await collectivePlaces(c.identity, [...c.f.relays, ...this.store.settings().homes.map((h) => h.hint)], this.via);
    const k = c.f.governance.keepers;
    const ids = k?.ids ?? [];
    const logs = await keeperLogs(ids, places, this.via);
    const mine = new Set([c.identity, ...c.f.agreements, ...c.f.members]);
    const keepers = ids.map((id) => ({
      id,
      name: names(id),
      here: this.store.holds(id),
      agent: this.store.isAgent(id),
      records: (logs[id] ?? []).length,
      ofThis: (logs[id] ?? []).filter((a) => mine.has(a)).length,
    }));
    const disputes: KeepersShown['disputes'] = [];
    const recorded = this.proposals().filter((p) => p.collective === collective && p.rotated && p.kind !== 'release');
    const sigs = recorded.flatMap((p) => p.signers.filter((m) => p.answers[m]?.signature).map((m) => ({ p, m, sig: p.answers[m].signature! })));
    if (sigs.length) {
      const { v } = await collectiveVerifier(c.identity, places, this.via, sigs.map((x) => x.sig));
      const inForce = (await collectiveNow(c.identity, places, this.via).catch(() => null))?.agreement ?? c.f.agreement;
      for (const x of sigs) {
        let status = 'unknown';
        try {
          status = v.status(x.sig) as string;
        } catch {
          // not held
        }
        if (status !== 'void' && status !== 'disputed') continue;
        const rotations = (await allBy(x.m, places, this.via)).map((a) => describeAct(a) as { id: string; signer?: string; spec?: string; type?: number }).filter((d) => d.signer === x.m && d.spec === MIRS.identity && d.type === 1).map((d) => d.id);
        const rotation = rotations.find((r) => ids.some((kp) => (logs[kp] ?? []).includes(r))) ?? rotations.at(-1) ?? null;
        const before = rotation ? ids.filter((kp) => recordedBefore(logs[kp] ?? [], x.sig, rotation)) : [];
        const still = c.f.agreements.indexOf(inForce) >= c.f.agreements.indexOf(x.p.act) && c.f.agreements.includes(x.p.act);
        disputes.push({
          member: x.m,
          signature: x.sig,
          version: x.p.act,
          what: x.p.kind === 'money' ? 'its money terms' : x.p.kind === 'founding' ? 'its founding terms' : 'a member change',
          status,
          rotation,
          keepers: before,
          counts: still,
        });
      }
    }
    return { keepers, rule: k ? ('all' in k.rule ? 'all' : 'threshold' in k.rule ? k.rule.threshold : null) : null, disputes };
  }

  /** One round of keeping for this collective, by a keeper it names that is held here (an Edubba agent, say): what it recorded (rules 37, 40). */
  keep(collective: string, keeper: string): Promise<Done> {
    return this.desk.serial(async () => {
      const c = this.collective(collective);
      if (!(c.f.governance.keepers?.ids ?? []).includes(keeper)) throw new Error('That identity is no keeper its agreement in force names (rule 36).');
      if (!this.store.holds(keeper)) throw new Error('That keeper is not held here: it keeps in its own app.');
      await this.desk.keyCurrent(keeper);
      const me = this.store.identity(keeper);
      const places = await collectivePlaces(c.identity, [...c.f.relays, ...this.store.settings().homes.map((h) => h.hint)], this.via);
      try {
        const made = await keep(me, { collective: c.identity, agreements: c.f.agreements, parties: c.f.members, places, via: this.via });
        const names = this.names();
        return {
          title: made.length ? `${names(keeper)} recorded ${made.length} act${made.length === 1 ? '' : 's'}` : 'Nothing new to record',
          lines: made.length
            ? made.map((m) => ({ text: `${m.rotation ? 'A rotation of ' : 'An act of '}${names(m.signer)} (${short(m.act)}): recorded, ${short(m.record)}.`, tone: 'ok' as const }))
            : [{ text: 'Every act around the collective found now is recorded already.' }],
          acts: made.map((m) => m.record),
        };
      } finally {
        this.store.saveIdentity(me);
      }
    });
  }

  // ------------------------------------------------------------ leaving alone (rule 70)

  /**
   * The resignations of this collective's members, as its relays and homes
   * hold them (rule 70, F354 question 2): each with whether this collective's
   * line registered it here, a record drawn with its signing key.
   */
  async resignations(collective: string): Promise<{ member: string; act: string; registered: string | null }[]> {
    const c = this.collective(collective);
    const hints = this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint), ...this.store.settings().relays]);
    const now = await collectiveNow(collective, hints, this.via).catch(() => null);
    const out: { member: string; act: string; registered: string | null }[] = [];
    for (const r of now?.resignations ?? []) {
      if (r.kind !== 'resigned' || !c.f.members.includes(r.party)) continue;
      const d = (c.f.departed ?? []).find((x) => x.resignation === r.act);
      out.push({ member: r.party, act: r.act, registered: d?.record ?? null });
    }
    return out;
  }

  /**
   * Register a member's resignation at the collective's line: a record of the
   * collective, drawn by a member held here with their own key (any member
   * may, Agreements rule 58), naming it (record field 3). From that line on, their signature counts in no rule and no
   * area; the change of members without them is proposed next, and waits for
   * Kišib as any member change.
   */
  async registerResignation(collective: string, act: string): Promise<Done> {
    return this.desk.serial(async () => {
      const c = this.collective(collective);
      const r = (await this.resignations(collective)).find((x) => x.act === act);
      if (!r) throw new Error('No such resignation of a member was found at the collective’s relays.');
      if (r.registered) throw new Error('It is registered already.');
      const by = this.proposals().find((p) => p.founded === collective)?.founder ?? c.f.members.find((m) => m !== r.member && this.store.holds(m));
      if (!by) throw new Error('No other member’s identity is held here to draw the record.');
      const me = await this.actFor(c, by);
      const line = await record(c.id, { registers: [act], inForce: c.f.agreement }, c.places);
      this.store.saveIdentity(me);
      c.f.departed = [...(c.f.departed ?? []), { member: r.member, resignation: act, record: line.id }];
      c.f.records = [...(c.f.records ?? []), line.id];
      this.saveCollective(c);
      const names = this.names();
      return {
        title: `${names(r.member)}’s resignation is registered`,
        lines: [
          { text: `The collective’s line ${shownAct(line.id)} registers it: from there, ${names(r.member)}’s voice counts in no rule and no area (rule 70). They keep their stake, as a departed holder (rule 68).`, tone: 'ok' },
          { text: 'Now propose the change of members without them (“Change its members”): every member whose voice remains signs it, then it waits for Kišib.' },
        ],
        acts: [line.id],
      };
    });
  }

  /** The grid a member change of `collective` starts from (round 3): the agreement in force's rows, these members as its columns. */
  gridFor(collective: string, members: string[]): { grid: Grid } {
    const c = this.collective(collective);
    const ids = members.length ? members.map((m) => readId(m)) : c.f.members;
    return { grid: gridOf(c.f.governance, ids, c.f.members) };
  }

  // ------------------------------------------------------------ a release

  /** A release of the collective from a folder chosen now, read back; confirmed, published, signed by the founder, sent to the other holders. */
  async prepareRelease(a: { collective: string; folder: string; name: string; version: string }) {
    const c = this.collective(a.collective);
    const names = this.names();
    const folder = folderOf(a.folder);
    const { how, files } = filesOf(folder);
    const blocking: string[] = [];
    const version = a.version.trim();
    if (!version) blocking.push('Give the release a version.');
    if (c.f.releases.some((r) => r.version === version)) blocking.push(`A release ${version} was published already.`);
    if (c.f.pending) blocking.push('A member change waits for its rotation: publish the release once it counts, under the members it names.');
    const pub = { id: c.id, relays: c.f.relays, releases: c.f.releases };
    const prepared: Prepared = prepareRelease(pub, { name: a.name.trim() || 'release', version: version || '0', files, source: how === 'git' ? gitSource(folder) : undefined });
    const founder = this.proposals().find((p) => p.founded === a.collective)?.founder ?? c.f.members[0];
    const holders = c.f.members;
    const sections: Section[] = [
      ...readRelease(prepared.manifest, prepared.before),
      { heading: 'Who signs', lines: [{ text: `Uploaded for the collective by ${names(founder)}, with their own key, naming it (the collective has no key of its own, Agreements rules 56 and 58). It counts once any ${c.f.governance.releaseThreshold} of its Releases area’s holders (${holders.map(names).join(', ')}) are on it, ${names(founder)} the first, the others signing in their own app, in Dub’s Signing tab.` }] },
    ];
    const reading: Reading = { title: `Publish ${prepared.manifest.name} ${prepared.manifest.version} for the collective`, summary: [`${prepared.manifest.files.length} files from ${folder} (${how === 'git' ? 'what git tracks' : 'every file but hidden ones'}).`], sections, plain: [], blocking };
    return this.plan({
      digest: sha256(Buffer.concat([Buffer.from('MOR Edubba real release, version 1\n'), Buffer.from(a.collective), prepared.payload, prepared.encoded])),
      reading,
      run: async () => {
        const me = await this.actFor(c, founder);
        const out = await publishPrepared(pub, prepared, this.via);
        this.store.saveIdentity(me);
        this.saveCollective(c);
        const lines: Line[] = [{ text: `Release ${shownAct(out.id)}, uploaded for the collective by ${names(founder)}.`, tone: 'ok' }];
        const name = this.collectives().find((x) => x.id === a.collective)?.name ?? short(a.collective);
        const p: Proposal = {
          act: out.id,
          kind: 'release',
          name,
          collective: a.collective,
          founder,
          members: holders,
          signers: holders,
          needed: c.f.governance.releaseThreshold,
          relays: c.f.relays,
          threads: {},
          answers: { [founder]: { verdict: 'signed', signature: out.id, text: '', message: '' } },
          at: now(),
        };
        this.saveProposal(p);
        p.threads = await this.invite(founder, out.id, a.collective, holders.filter((m) => m !== founder), `${names(founder)} asks you to sign the release ${out.manifest.name} ${out.manifest.version} of the collective “${name}”: act ${out.id}. It counts once ${c.f.governance.releaseThreshold} of its holders sign it.`, a.collective, lines);
        this.saveProposal(p);
        return { title: `${out.manifest.name} ${out.manifest.version} is published, and sent to sign`, lines, acts: [out.id] };
      },
    });
  }

  /** A release, checked as a fresh verifier would: whether it counts, and whose signatures. */
  async releaseStanding(act: string): Promise<{ ok: boolean; signers: string[]; problems: string[] }> {
    const p = this.proposal(act);
    const v = await verifyRelease(act, this.hints(p.relays), { via: this.via });
    return { ok: v.ok, signers: v.signers, problems: v.problems };
  }
}
