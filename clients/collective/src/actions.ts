// What the collective client does. Everything that signs goes in two steps:
// `prepare` makes the exact bytes and reads them back in plain words, the
// page shows that reading, and `confirm` signs those same bytes, only if the
// person sends back the reading's digest and nothing it depends on changed
// in between (Law rule 4a: what you sign is what you saw).

import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SPECS, describeAct, resignationPayload } from '../../genesis/src/core.ts';
import { TestIdentity, type Home } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestCollective, collectiveTerms, type Governance } from '../../repo/src/collective.ts';
import { RELEASE_AREA, encodeTerms, record, resign, type MarkEntry } from '../../repo/src/law.ts';
import {
  allBy,
  compareWithTree,
  decodeManifest,
  gitFiles,
  gitSource,
  prepareRelease,
  publishPrepared,
  signRelease,
  verifyRelease,
  type Manifest,
  type Publisher,
  type Verified,
} from '../../repo/src/release.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import {
  count,
  lawThrown,
  list,
  problemWords,
  readAgreement,
  readChanges,
  readRelease,
  rulesHints,
  short,
  termsOf,
  withLaw,
  type Line,
  type Reading,
  type Section,
  type TermsRead,
} from './explain.ts';
import type { Store } from './store.ts';

/** The MOR repository this program is part of: what a release publishes unless another folder is set. */
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

function digestOf(kind: string, ...parts: (Uint8Array | string)[]): string {
  const h = createHash('sha256').update(`MOR collective client, ${kind}\n`);
  for (const p of parts) {
    const b = typeof p === 'string' ? Buffer.from(p) : Buffer.from(p);
    h.update(Buffer.from(String(b.length) + ':'));
    h.update(b);
  }
  return h.digest('hex');
}

/** What was done, as the page shows it after signing. */
export interface Done {
  title: string;
  lines: Line[];
  /** The acts made, by id. */
  acts: string[];
}

/** An operation made and shown, waiting for the person's confirmation. */
interface Plan {
  id: string;
  kind: string;
  digest: string;
  reading: Reading;
  /** The files it depends on, and their fingerprint when it was shown. */
  depends: string[];
  stamp: string;
  expires: number;
  run: () => Promise<Done>;
}

/** The standard words for a test collective's rules. Members may write their own. */
export function standardWords(name: string, g: Omit<Governance, 'text'>): string {
  const constitution = g.constitutionalThreshold ? `any ${g.constitutionalThreshold} members` : 'every member whose voice remains';
  return `“${name}”, a MOR test collective. Test acts only, wiped before the first real acts. Its everyday key is held by its first member; its safety key is split among the members, any ${g.safetyThreshold} of whom rebuild it. Releases are an area held by every member: a release counts only when ${g.releaseThreshold} members have signed it, each with an act of their own. Members, the change rules, the keys and the areas change by a clone signed by ${constitution} and by each member who joins, and a rotation of the collective declaring it. Other changes need any ${g.cloneThreshold} members, and are recorded by the collective at once. A member may leave alone at any time, keeping what they own. Any ${g.abandonmentOthers} of the other members together decide whether a member is absent; the outcome is that member losing their voice.`;
}

export interface Rules {
  safety: number;
  release: number;
  clone: number;
  others: number;
  /** The constitutional change rule: any k members. Absent: every member whose voice remains (F103). */
  constitution?: number;
}

const toRules = (g: Governance): Rules => ({
  safety: g.safetyThreshold,
  release: g.releaseThreshold,
  clone: g.cloneThreshold,
  others: g.abandonmentOthers,
  ...(g.constitutionalThreshold ? { constitution: g.constitutionalThreshold } : {}),
});

/** The numbers of a Governance from the rules typed on the page. */
const fromRules = (r: Rules) => ({
  safetyThreshold: whole(r.safety, 'the shares needed'),
  releaseThreshold: whole(r.release, 'the signatures a release needs'),
  cloneThreshold: whole(r.clone, 'the signatures a change needs'),
  abandonmentOthers: whole(r.others, 'who judges absence'),
  ...(r.constitution !== undefined ? { constitutionalThreshold: whole(r.constitution, 'the signatures a change of the constitution needs') } : {}),
});

/** The departures a collective file keeps (Law draft 7), with defaults for older files. */
const departedOf = (c: TestCollective) => c.f.departed ?? [];
const steppedDownOf = (c: TestCollective) => c.f.steppedDown ?? [];

/** Members whose voice remains: not departed (rule 37a). */
export const voicesOf = (c: TestCollective): string[] => c.f.members.filter((m) => !departedOf(c).some((d) => d.member === m));

/** The release area's holders whose voice there remains: not departed, not stepped down (rules 37a, 37b). */
export const releaseVoicesOf = (c: TestCollective): string[] =>
  voicesOf(c).filter((m) => !steppedDownOf(c).some((d) => d.member === m && d.area === RELEASE_AREA));

/** How many must sign: the number as written, or all who remain when fewer do (rule 44d). */
const needed = (k: number, voices: number) => Math.min(k, voices);

/** Plain words for how many of whom: "any 2 of A, B and C", "all of A and B", "A alone". */
const anyOf = (k: number, ids: string[], names: (id: string) => string): string =>
  !ids.length ? 'nobody' : ids.length === 1 ? `${names(ids[0])} alone` : k >= ids.length ? `all of ${list(ids.map(names))}` : `any ${k} of ${list(ids.map(names))}`;

function whole(n: unknown, what: string): number {
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 0) throw new Error(`${what}: a whole number`);
  return n;
}

const PLAN_LIFE = 15 * 60_000;

export class Actions {
  private plans = new Map<string, Plan>();
  /** One signing operation at a time. */
  private busy: Promise<unknown> = Promise.resolve();

  constructor(readonly store: Store) {}

  private get via() {
    return this.store.settings().via;
  }

  private checkout(): string {
    return this.store.settings().checkout ?? ROOT;
  }

  private plan(p: Omit<Plan, 'id' | 'stamp' | 'expires'>): { plan: string; digest: string; reading: Reading } {
    const now = Date.now();
    for (const [k, v] of this.plans) if (v.expires < now) this.plans.delete(k);
    const id = randomBytes(16).toString('hex');
    this.plans.set(id, { ...p, id, stamp: this.store.stamp(p.depends), expires: now + PLAN_LIFE });
    return { plan: id, digest: p.digest, reading: p.reading };
  }

  /** Forget a plan the person turned down. */
  cancel(plan: string): void {
    this.plans.delete(plan);
  }

  /**
   * Carry out a plan the person reviewed. Refused if the digest is not the
   * one shown, the plan has expired or was already used, the reading had
   * reasons not to sign, or anything it depends on changed since.
   */
  async confirm(plan: string, digest: string): Promise<Done> {
    const run = async () => {
      const p = this.plans.get(plan);
      if (!p || p.expires < Date.now()) throw new Error('This review has expired or was already used. Review it again.');
      if (p.digest !== digest) throw new Error('The digest does not match what was shown. Nothing was signed.');
      if (p.reading.blocking.length) throw new Error('What was shown cannot be signed. Nothing was signed.');
      if (this.store.stamp(p.depends) !== p.stamp) {
        this.plans.delete(plan);
        throw new Error('Something it depends on changed since it was shown. Nothing was signed: review it again.');
      }
      this.plans.delete(plan);
      const done = await p.run();
      this.store.record({ time: Math.floor(Date.now() / 1000), kind: p.kind, title: p.reading.title, digest: p.digest, acts: done.acts });
      return done;
    };
    const next = this.busy.then(run, run);
    this.busy = next.catch(() => undefined);
    return next;
  }

  // ------------------------------------------------------------ settings

  async setSettings(a: { homes: string[]; relays: string[]; via: Record<string, string>; checkout: string | null }): Promise<void> {
    const homes: Home[] = [];
    for (const hint of a.homes) {
      let info: Map<number, unknown>;
      try {
        info = (await relayAt(hint, a.via).info()) as Map<number, unknown>;
      } catch (e) {
        throw new Error(`${hint} did not answer: ${e instanceof Error ? e.message : e}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      homes.push({ operator: Buffer.from(op).toString('hex'), hint });
    }
    if (a.checkout && !existsSync(a.checkout)) throw new Error(`no folder ${a.checkout}`);
    this.store.saveSettings({ homes, relays: a.relays, via: a.via, checkout: a.checkout || null });
  }

  rename(id: string, name: string): void {
    const b = this.store.book();
    const i = b.identities.find((x) => x.id === id);
    const c = b.collectives.find((x) => x.id === id);
    if (i) i.name = name;
    else if (c) c.name = name;
    else b.names[id] = name;
    this.store.saveBook(b);
  }

  // ------------------------------------------------------------ a new test identity

  prepareIdentity(a: { name: string; mine: boolean }) {
    const s = this.store.settings();
    const name = a.name.trim();
    if (!s.homes.length) throw new Error('Name the homes first, under Settings: a genesis names at least one.');
    const blocking: string[] = [];
    if (!name) blocking.push('Give it a name, so you can tell it apart here. The name stays on this device: it is not published.');
    const relays = s.relays.length ? s.relays : s.homes.map((h) => h.hint);
    const id = TestIdentity.create({ homes: s.homes, via: s.via });
    const genesis = id.chainActs()[0];
    const reading: Reading = {
      title: `A new test identity, “${name}”`,
      summary: [
        'A new identity is born. Its genesis, signed now, goes to each of its homes, and each home signs a receipt.',
        'Its safety key is kept in software, in this program’s folder: a test identity, never for a real one.',
        a.mine
          ? 'It is you: the identity you act as here.'
          : 'It is a simulated member: held here so that one person can play every part in a test. Its consent is not independent.',
      ],
      sections: [
        {
          heading: 'Where it lives',
          lines: [
            ...s.homes.map((h) => ({ text: `Home ${h.hint}, run by operator ${h.operator ? short(h.operator) : 'unknown'}.` })),
            { text: `Its routes say its acts are found at ${relays.join(', ') || 'no relay yet'}.` },
          ],
        },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'identity',
      digest: digestOf('identity', genesis),
      reading,
      depends: [],
      run: async () => {
        this.store.saveIdentity(id);
        const b = this.store.book();
        b.identities.push({ id: id.id, name, mine: a.mine, releases: [] });
        this.store.saveBook(b);
        const sent = await id.publishGenesis();
        const lines: Line[] = sent.map((x) => ({
          text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
          tone: x.result?.receipt ? 'ok' : 'bad',
        }));
        const routes = await id.publishRoutes([{ scope: null, hints: relays }]);
        this.store.saveIdentity(id);
        return { title: `“${name}” is born`, lines, acts: [id.id, routes.id] };
      },
    });
  }

  // ------------------------------------------------------------ releases

  private publisher(id: string): { p: Publisher; save: () => void; collective: TestCollective | null } {
    if (this.store.isCollective(id)) {
      const c = this.store.collective(id);
      return { p: { id: c.id, relays: c.f.relays, releases: c.f.releases }, save: () => this.store.saveCollective(c), collective: c };
    }
    const who = this.store.identity(id);
    const s = this.store.settings();
    const b = this.store.book();
    const entry = b.identities.find((x) => x.id === id);
    if (!entry) throw new Error('not an identity of this program');
    return {
      p: { id: who, relays: s.relays.length ? s.relays : s.homes.map((h) => h.hint), releases: entry.releases },
      save: () => {
        this.store.saveIdentity(who);
        const b2 = this.store.book();
        b2.identities.find((x) => x.id === id)!.releases = entry.releases;
        this.store.saveBook(b2);
      },
      collective: null,
    };
  }

  prepareRelease(a: { publisher: string; version: string; name?: string }) {
    const names = this.store.names();
    const { p, save, collective } = this.publisher(a.publisher);
    const version = a.version.trim();
    const name = a.name?.trim() || 'MOR';
    const blocking: string[] = [];
    if (!version) blocking.push('Give the release a version, for example 11b.1.');
    if (!p.relays.length) blocking.push('Name at least one relay first, under Settings: the files go there.');
    if (collective?.f.pending) blocking.push('A member change of this collective is still waiting for its homes. Send it again first: a release signed with the old key would be void once the change counts.');
    const voices = collective ? releaseVoicesOf(collective) : [];
    if (collective && !voices.length) {
      blocking.push(
        'The Releases area has no holder left whose voice remains: it is frozen, and a release would count for nothing until the members refit it, by a change of members or rules that gives the area a holder again (Law rule 37b).',
      );
    }
    if (p.releases.some((r) => r.version === version)) blocking.push(`A release ${version} was already published by ${names(a.publisher)}. Choose another version.`);
    const dir = this.checkout();
    const prepared = prepareRelease(p, { name, version, files: gitFiles(dir), source: gitSource(dir) });
    const who: Line[] = collective
      ? [
          {
            text: `It is published by ${names(a.publisher)}, signed with its everyday key. It is not a release yet: it counts once ${anyOf(needed(collective.f.governance.releaseThreshold, voices.length), voices, names)}, the holders of its Releases area whose voice remains, have signed it, each with an act of their own (agreement in force ${short(collective.f.agreement)}).`,
          },
          ...(voices.length < collective.f.governance.releaseThreshold && voices.length
            ? [{ text: `The area asks for ${collective.f.governance.releaseThreshold}; fewer holders remain, so all of them together meet it (Law rule 44d).` }]
            : []),
        ]
      : [
          {
            text: `It is published under ${names(a.publisher)}'s own name. Not a collective: it is a release as soon as it is published, signed by this identity alone (release manifest cMIP, “What counts as a release”).`,
          },
        ];
    who.push({ text: `The manifest and every new file go to ${p.relays.join(', ')}.` });
    const reading: Reading = {
      title: `Publish ${name} ${version} as ${names(a.publisher)}`,
      summary: [
        `Every file git tracks in ${dir} is listed with its fingerprint; ${count(prepared.upload.length, 'file is', 'files are')} new since the last release and uploaded.`,
        'Anyone can later fetch the release by its id and check every file against the list.',
      ],
      sections: [...readRelease(prepared.manifest, prepared.before), { heading: 'Who signs', lines: who }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'release',
      digest: digestOf('release', a.publisher, prepared.payload, prepared.encoded),
      reading,
      depends: [a.publisher],
      run: async () => {
        const out = await publishPrepared(p, prepared, this.via);
        save();
        return {
          title: `${name} ${version} is published`,
          lines: [
            { text: `Release ${out.id}.`, tone: 'ok' },
            { text: `${count(out.manifest.files.length, 'file')}, ${out.uploaded} uploaded new.` },
            ...out.refused.map((r) => ({ text: `Refused by ${r}`, tone: 'warn' as const })),
            ...(collective ? [{ text: `It counts once ${anyOf(needed(collective.f.governance.releaseThreshold, voices.length), voices, names)} sign it.` }] : []),
          ],
          acts: [out.id],
        };
      },
    });
  }

  /** Fetch a public act by id from the first of these relays that holds it. */
  private async fetchAct(id: string, hints: string[]): Promise<Uint8Array | null> {
    for (const h of hints) {
      try {
        const a = await relayAt(h, this.via).getAct(id);
        if (a) return a;
      } catch {
        // away, or not there: the next
      }
    }
    return null;
  }

  /** A public terms act, fetched: its exact payload, and the core's reading of it. */
  private async termsAct(id: string, hints: string[]): Promise<{ payload: Uint8Array; t: TermsRead } | null> {
    const a = await this.fetchAct(id, hints);
    if (!a) return null;
    const d = describeAct(a) as { public: boolean; spec?: string; type?: number; payload?: Uint8Array };
    if (!d.public || d.spec !== REPO_SPECS.law || d.type !== 0 || !d.payload) return null;
    return { payload: d.payload, t: termsOf(d.payload) };
  }

  /** Read terms this client made, or say plainly why Law cannot. */
  private read(payload: Uint8Array): TermsRead {
    try {
      return termsOf(payload);
    } catch (e) {
      const p = lawThrown(e);
      throw new Error(p ? problemWords(p) : `Law cannot read these terms: ${e instanceof Error ? e.message : e}`);
    }
  }

  private hintsOf(c: TestCollective): string[] {
    return [...new Set([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)])];
  }

  /**
   * Before drawing a record: acts of the collective its relays hold that
   * this device's sequence does not. A record names no other sequence, so
   * they would count as made after its line (Law, "Made before, made
   * after"). Client conformance: the collective's devices share their tips
   * before a line is drawn, and a client warns before drawing one with a
   * device not heard from.
   */
  private async unheard(c: TestCollective): Promise<Line[]> {
    const mine = new Set(c.f.identity.sequence);
    const found = new Map<string, number>();
    for (const a of await allBy(c.identity, this.hintsOf(c), this.via)) {
      let d: { id: string; signer?: string; spec?: string; type?: number; position?: number };
      try {
        d = describeAct(a);
      } catch {
        continue;
      }
      if (d.signer !== c.identity || !d.spec) continue;
      if (d.spec === SPECS.identity && (d.type === 0 || d.type === 1)) continue; // genesis and rotations: the chain
      if (!mine.has(d.id)) found.set(d.id, d.position ?? 0);
    }
    if (!found.size) return [];
    const latest = [...found].sort((x, y) => y[1] - x[1])[0][0];
    const n = found.size;
    return [
      {
        text: `${count(n, 'act')} signed by the collective ${n === 1 ? 'is' : 'are'} at its relays but not in this device's sequence (latest ${short(latest)}): another device made ${n === 1 ? 'it' : 'them'}. The record names no other sequence, so ${n === 1 ? 'it' : 'they'} will count as made after its line (Law, “Made before, made after”). Client conformance: the collective's devices share their tips before a line is drawn.`,
        tone: 'warn',
      },
    ];
  }

  // ------------------------------------------------------------ founding

  prepareFound(a: { name: string; members: string[]; rules: Rules; words?: string }) {
    const names = this.store.names();
    const s = this.store.settings();
    const name = a.name.trim();
    const blocking: string[] = [];
    if (!name) blocking.push('Give the collective a name. The name stays on this device: it is not published.');
    if (!s.homes.length) blocking.push('Name its homes first, under Settings.');
    const relays = s.relays.length ? s.relays : s.homes.map((h) => h.hint);
    const b = this.store.book();
    // You first: the first member proposes the agreement and holds the everyday key.
    const members = [...new Set(a.members)].sort(
      (x, y) => Number(!b.identities.find((i) => i.id === x)?.mine) - Number(!b.identities.find((i) => i.id === y)?.mine),
    );
    for (const m of members) if (!this.store.holds(m)) blocking.push(`${names(m)} is not held by this program, so it cannot sign here.`);
    if (members.length < 2) blocking.push('A collective has at least two members.');
    const rules = fromRules(a.rules);
    const g: Governance = { ...rules, text: a.words?.trim() || standardWords(name || 'unnamed', rules) };
    const payload = encodeTerms(collectiveTerms(g, members, members[0]));
    const t = this.read(payload);
    const read = readAgreement(t, names);
    blocking.push(...withLaw(rulesHints(toRules(g), members.length), read.blocking));
    const reading: Reading = {
      title: `Found the collective “${name}”`,
      summary: [
        `Each of the ${members.length} members signs the founding agreement below, each with a visible act of their own. It exists only once every one has signed: nobody is founded into a collective without signing (Q11).`,
        `Then the collective is born: an identity of its own, whose genesis declares this agreement. Its safety key is dealt as ${members.length} shares, and each member checks theirs; any ${rules.safetyThreshold} rebuild it.`,
        `${names(members[0])} proposes it and holds the collective's everyday key.`,
      ],
      sections: [
        ...read.sections,
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${members.map(names).join(', ')} sign here: test identities this program holds.` },
            { text: 'Their consent is simulated: one person decides for all of them. The mechanics are real; independent consent is not (test only).', tone: 'warn' },
            { text: `Every share of the safety key and the everyday key are kept in this program's folder, in software.`, tone: 'warn' },
          ],
        },
        {
          heading: 'Where it lives',
          lines: [
            ...s.homes.map((h) => ({ text: `Home ${h.hint}, run by operator ${h.operator ? short(h.operator) : 'unknown'}.` })),
            { text: `Its agreement, signatures, releases and files go to ${relays.join(', ')}.` },
          ],
        },
      ],
      plain: [{ heading: 'The words everyone signs', text: t.text }, ...read.plain],
      blocking,
    };
    return this.plan({
      kind: 'found',
      digest: digestOf('found', payload, JSON.stringify({ homes: s.homes, relays })),
      reading,
      depends: members,
      run: async () => {
        const ids = members.map((m) => this.store.identity(m));
        const got = await TestCollective.found({ members: ids, homes: s.homes, relays, governance: g, via: s.via, expect: payload });
        this.store.saveCollective(got.collective);
        for (const i of ids) this.store.saveIdentity(i);
        const book = this.store.book();
        book.collectives.push({ id: got.collective.identity, name });
        this.store.saveBook(book);
        return {
          title: `“${name}” is founded`,
          lines: [
            { text: `The collective ${got.collective.identity}.`, tone: 'ok' },
            { text: `Founding agreement ${got.agreement}, signed by ${got.signed.length} members.` },
            { text: `Safety key dealt: any ${rules.safetyThreshold} of ${members.length}; dealing ${got.collective.f.safety.fingerprint.slice(0, 16)}…` },
            ...got.sent.map((x) => ({
              text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
              tone: (x.result?.receipt ? 'ok' : 'bad') as Line['tone'],
            })),
          ],
          acts: [got.agreement, ...got.signed.map((x) => x.act), got.collective.identity],
        };
      },
    });
  }

  // ------------------------------------------------------------ changing members and rules

  /**
   * A constitutional change (Law rules 37, 44c): members join or are
   * removed, the rules may be rewritten. Members removed who have not left
   * yet first sign a resignation each, registered at once by a record; the
   * clone's mark names the constitutional change rule and the members whose
   * voice remains who sign it; a rotation of the collective declares it.
   */
  async prepareChange(a: { collective: string; join?: string[]; leave?: string[]; rules?: Rules; words?: string }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    // Only who judges absence changes: a judicial change, under the clone
    // rule, recorded at once (Law draft 8, B13), not a constitutional one.
    if (!a.join?.length && !a.leave?.length && a.rules && !a.words?.trim()) {
      const cur = toRules(c.f.governance);
      const r = a.rules;
      const same = (x: keyof Rules) => r[x] === cur[x];
      if (!same('others') && same('safety') && same('release') && same('clone') && same('constitution')) {
        return this.prepareAbsenceRule({ collective: a.collective, others: r.others });
      }
    }
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const join = [...new Set(a.join ?? [])];
    const leave = new Set(a.leave ?? []);
    const blocking: string[] = [];
    if (c.f.pending) blocking.push('A member change is already waiting for the homes: send it again before making another.');
    for (const l of leave) if (!c.f.members.includes(l)) blocking.push(`${names(l)} is not a member.`);
    for (const j of join) {
      if (c.f.members.includes(j)) blocking.push(`${names(j)} is already a member.`);
      if (!this.store.holds(j)) blocking.push(`${names(j)} is not held by this program, so it cannot sign the clone here.`);
    }
    const departed = new Set(departedOf(c).map((d) => d.member));
    for (const d of departed) {
      if (c.f.members.includes(d) && !leave.has(d)) {
        blocking.push(`${names(d)} left the collective. A change that keeps them as a member would deal them a share of the new safety key: remove them in the same change.`);
      }
    }
    const members = [...c.f.members.filter((m) => !leave.has(m)), ...join.filter((j) => !c.f.members.includes(j))];
    const staying = c.f.members.filter((m) => !leave.has(m));
    // Removed members who have not left yet: held here, they resign first; otherwise they keep their voice for this clone.
    const resigning = [...leave].filter((l) => c.f.members.includes(l) && !departed.has(l) && this.store.holds(l));
    const removedUnheld = [...leave].filter((l) => c.f.members.includes(l) && !departed.has(l) && !this.store.holds(l));
    const signersStaying = staying.filter((m) => this.store.holds(m) && !departed.has(m));
    // The constitutional change rule, counted among the voices that remain at the rotation (rule 44d).
    const voices = c.f.members.filter((m) => !departed.has(m) && !resigning.includes(m));
    const k = c.f.governance.constitutionalThreshold;
    if (!k) {
      const missing = voices.filter((v) => !signersStaying.includes(v));
      if (missing.length) {
        blocking.push(
          `A change of members needs every member whose voice remains (the constitutional change rule); ${list(missing.map(names))} cannot sign here: not held by this program${removedUnheld.length ? ', and removed without resigning' : ''}.`,
        );
      }
    } else {
      const need = needed(k, voices.length);
      const have = signersStaying.filter((m) => voices.includes(m)).length;
      if (have < need) blocking.push(`A change of members needs any ${need} of the ${voices.length} members whose voice remains (the constitutional change rule); only ${have} sign here.`);
    }

    const current = c.f.governance;
    const rules = fromRules(a.rules ?? toRules(current));
    const rulesChanged = JSON.stringify(toRules({ ...rules, text: '' })) !== JSON.stringify(toRules(current));
    let text = a.words?.trim() || current.text;
    const notes: Line[] = [];
    if (!a.words?.trim() && rulesChanged) {
      if (current.text === standardWords(cname, current)) text = standardWords(cname, rules);
      else notes.push({ text: 'The rules change but the words stay as they were: check they still say what the rules do.', tone: 'warn' });
    }
    const changedGovernance = rulesChanged || text !== current.text;
    const g: Governance = { ...rules, releaseWords: current.releaseWords, text };

    const holder = c.nextHolder(members);
    const mark: MarkEntry[] = [{ power: { constitutional: true }, signers: signersStaying }];
    const payload = encodeTerms(collectiveTerms(g, members, holder, c.f.agreement, mark));
    const after = this.read(payload);
    const hints = this.hintsOf(c);
    const before = await this.termsAct(c.f.agreement, hints);
    if (!before) blocking.push(`The agreement in force (${short(c.f.agreement)}) could not be fetched from ${hints.join(', ')}, so what changes cannot be shown.`);
    const changes = before ? readChanges(before.payload, payload, names) : [];
    if (changes.some((l) => l.tone === 'bad')) {
      blocking.push('This change needs other powers than the constitutional change rule its mark names; this client makes member and rules changes as constitutional changes only (F104).');
    }

    const rebuilders = c.f.safety.shares
      .filter((x) => staying.includes(x.holder) && !departed.has(x.holder) && this.store.holds(x.holder))
      .map((x) => x.holder);
    if (rebuilders.length < c.f.safety.threshold) {
      blocking.push(`Rotating the collective needs ${c.f.safety.threshold} shares of its safety key from members who stay; only ${rebuilders.length} are here.`);
    }
    if (!members.length) blocking.push('Nobody would be left.');
    if (!join.length && !leave.size && !changedGovernance) blocking.push('Nothing changes.');

    const read = readAgreement(after, names, before?.t);
    blocking.push(...withLaw(members.length ? rulesHints(toRules(g), members.length) : [], read.blocking));
    const usedRebuilders = rebuilders.slice(0, c.f.safety.threshold);
    const title =
      join.length && !leave.size
        ? `Add ${join.map(names).join(', ')} to “${cname}”`
        : leave.size && !join.length
          ? `Remove ${[...leave].map(names).join(', ')} from “${cname}”`
          : join.length || leave.size
            ? `Change the members of “${cname}”`
            : `Change the rules of “${cname}”`;
    const summary: string[] = [];
    if (resigning.length) {
      summary.push(
        `First ${list(resigning.map(names))} ${resigning.length === 1 ? 'signs a resignation' : 'each sign a resignation'}, alone, and the collective registers ${resigning.length === 1 ? 'it' : 'them'} at once by a record, its line (Law rule 37a). ${resigning.length === 1 ? 'It is a simulated member' : 'They are simulated members'} held here, so this program signs for ${resigning.length === 1 ? 'it' : 'them'}.`,
      );
    }
    const gone = [...leave].filter((l) => departed.has(l));
    if (gone.length) summary.push(`${list(gone.map(names))} already left: their resignation is on the collective's record, so nothing more is asked of them.`);
    summary.push(
      `The members whose voice remains sign a clone of the agreement in force: a new version naming it, with ${members.length} members, marked with the constitutional change rule (Law rules 44c, 45a).`,
      `Then the collective rotates: its safety key, rebuilt from the shares of ${list(usedRebuilders.map(names)) || 'nobody'}, signs a rotation declaring the clone, and a new safety key is dealt to the new members only.`,
      'Once the homes count the rotation, the new rules apply, and anything the old key signs is void (F100).',
    );
    // The release area: who stepped down, and whether this change refits it (rule 37b).
    const releaseArea = (t: TermsRead) => t.areas.find((x) => x.id === RELEASE_AREA);
    const areaChanged = !!before && JSON.stringify(releaseArea(before.t)) !== JSON.stringify(releaseArea(after));
    const down = steppedDownOf(c).filter((d) => d.area === RELEASE_AREA && members.includes(d.member));
    if (down.length) {
      notes.push(
        areaChanged
          ? { text: `${list(down.map((d) => names(d.member)))} stepped down from the Releases area. This change redraws the area, so whoever it names as a holder and signs it holds the area again (Law rules 37b, 44d).` }
          : {
              text: `${list(down.map((d) => names(d.member)))} stepped down from the Releases area. This change leaves the area's entry as it is, so it does not refit the area (Law rule 37b): they stay stepped down${releaseVoicesOf(c).length ? '' : ', and the area stays frozen'}. Change the number of members a release needs, or its holders, to refit it.`,
              tone: 'warn',
            },
      );
    }
    const warnings = resigning.length ? await this.unheard(c) : [];
    const reading: Reading = {
      title,
      summary,
      sections: [
        { heading: 'What changes', lines: [...changes, ...notes, ...warnings] },
        ...read.sections.map((s) => ({ ...s, heading: `After the change: ${s.heading.charAt(0).toLowerCase()}${s.heading.slice(1)}` })),
        {
          heading: 'Signed on this device',
          lines: [
            ...(resigning.length ? [{ text: `${list(resigning.map(names))} sign${resigning.length === 1 ? 's' : ''} a resignation; the collective's everyday key, held here, signs the record.` }] : []),
            { text: `The clone is proposed by ${names(signersStaying[0] ?? staying[0] ?? '')} and signed by ${list([...signersStaying, ...join].map(names))}.` },
            { text: `The shares of ${list(usedRebuilders.map(names))} rebuild the safety key for the rotation. Members who leave hand over nothing.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
          ],
        },
      ],
      plain: [
        { heading: 'The words after the change', text: after.text },
        ...(before && before.t.text !== after.text ? [{ heading: 'The words before', text: before.t.text }] : []),
        ...read.plain,
      ],
      blocking,
    };
    return this.plan({
      kind: 'change',
      digest: digestOf('change', a.collective, payload, JSON.stringify({ members, rebuilders: usedRebuilders, resigning })),
      reading,
      depends: [a.collective, ...new Set([...c.f.members, ...join].filter((m) => this.store.holds(m)))],
      run: async () => {
        const col = this.store.collective(a.collective);
        const stay = signersStaying.map((m) => this.store.identity(m));
        const joining = join.map((m) => this.store.identity(m));
        const leaving = resigning.map((m) => this.store.identity(m));
        const got = await col.changeMembers({
          members,
          proposer: stay[0],
          signers: [...stay, ...joining],
          rebuilders: usedRebuilders,
          leaving,
          governance: changedGovernance ? g : undefined,
          expect: payload,
        });
        if (got.record) {
          col.f.records = [...(col.f.records ?? []), got.record];
          col.f.departed = [...departedOf(col), ...got.resigned.map((r) => ({ member: r.member, resignation: r.act, record: got.record! }))];
        }
        this.store.saveCollective(col);
        for (const i of [...stay, ...joining, ...leaving]) this.store.saveIdentity(i);
        const counts = await col.settle();
        if (counts) this.afterRefit(col, areaChanged ? signersStaying.concat(join) : []);
        this.store.saveCollective(col);
        return {
          title: counts ? `${title}: done` : `${title}: waiting for the homes`,
          lines: [
            ...got.resigned.map((r) => ({ text: `Resignation ${r.act} by ${names(r.member)}.` })),
            ...(got.record ? [{ text: `Record ${got.record}: the line from which ${list(got.resigned.map((r) => names(r.member)))} no longer count.` }] : []),
            { text: `Clone ${got.clone}, signed by ${got.signed.length}.` },
            { text: `Rotation ${got.rotation}.` },
            ...got.sent.map((x) => ({
              text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
              tone: (x.result?.receipt ? 'ok' : 'bad') as Line['tone'],
            })),
            counts
              ? { text: `The change counts. Members now: ${col.f.members.map(names).join(', ')}.`, tone: 'ok' }
              : { text: 'Not counted yet: too few homes took the rotation. Send it again once they are back (the same bytes; nothing new is signed).', tone: 'warn' },
          ],
          acts: [...got.resigned.map((r) => r.act), ...(got.record ? [got.record] : []), got.clone, ...got.signed.map((x) => x.act), got.rotation],
        };
      },
    });
  }

  /**
   * Once a constitutional change counts: holders it names again in a
   * redrawn release area, who signed it, hold that area again (rules 37b,
   * 44d); steppings down of members no longer members are history.
   */
  private afterRefit(col: TestCollective, signedRedrawn: string[]): void {
    const down = steppedDownOf(col).filter((d) => col.f.members.includes(d.member) && !(d.area === RELEASE_AREA && signedRedrawn.includes(d.member)));
    col.f.steppedDown = down;
  }

  // ------------------------------------------------------------ leaving, stepping down, an ordinary change

  /** The collective, its name here, and a member it holds, for the actions below. */
  private memberOf(collective: string, member: string, blocking: string[]) {
    const names = this.store.names();
    const c = this.store.collective(collective);
    const cname = this.store.book().collectives.find((x) => x.id === collective)?.name ?? short(collective);
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first. A record signed with the old everyday key would be void once it counts.');
    if (!c.f.members.includes(member)) blocking.push(`${names(member)} is not a member of “${cname}”.`);
    if (!this.store.holds(member)) blocking.push(`${names(member)} is not held by this program, so it cannot sign here.`);
    if (departedOf(c).some((d) => d.member === member)) blocking.push(`${names(member)} already left “${cname}”.`);
    return { c, cname, names };
  }

  /** Who decides, from a line on, in plain words: the constitution, the Releases area, other changes (rule 44d). */
  private decidersAfter(c: TestCollective, voices: string[], releaseVoices: string[], names: (id: string) => string): Line[] {
    const g = c.f.governance;
    const out: Line[] = [
      {
        text: g.constitutionalThreshold
          ? `A change of the constitution (members, rules, keys, areas) needs ${anyOf(needed(g.constitutionalThreshold, voices.length), voices, names)}.`
          : `A change of the constitution (members, rules, keys, areas) needs every member whose voice remains: ${list(voices.map(names)) || 'nobody'}.`,
      },
    ];
    if (releaseVoices.length) {
      out.push({ text: `A release needs ${anyOf(needed(g.releaseThreshold, releaseVoices.length), releaseVoices, names)}${releaseVoices.length < g.releaseThreshold ? `: the area asks for ${g.releaseThreshold}, and when fewer holders remain all of them together meet it (Law rule 44d)` : ''}.` });
    } else {
      out.push({
        text: 'Nobody would hold the Releases area: it is frozen from the line. A release counts for nothing until the members refit the area by a change of the constitution (Law rule 37b).',
        tone: 'bad',
      });
    }
    out.push({ text: `Other changes need ${anyOf(needed(g.cloneThreshold, voices.length), voices, names)}.` });
    return out;
  }

  /**
   * Leave a collective alone (Law rule 37a): the member signs a resignation
   * nobody else signs, and the collective registers it at once by a record,
   * its line. Nothing else changes: the members who stay refit the
   * collective afterwards (Change members), rotating to keys the member
   * who left never held.
   */
  async prepareLeave(a: { collective: string; member: string }) {
    const blocking: string[] = [];
    const { c, cname, names } = this.memberOf(a.collective, a.member, blocking);
    const who = names(a.member);
    const voices = voicesOf(c).filter((m) => m !== a.member);
    const releaseVoices = releaseVoicesOf(c).filter((m) => m !== a.member);
    const mine = !!this.store.book().identities.find((i) => i.id === a.member)?.mine;
    const what: Line[] = [
      { text: `${who} keeps what they own, and stays bound by what they signed (Law rule 37a).` },
      { text: `A signature of theirs placed before the line still counts for what it signed: a release made before the line can still be completed with it (Law, “Made before, made after”, C1).` },
    ];
    if (c.f.signingHolder === a.member) {
      what.push({ text: `${who} holds the collective's everyday key under its key grammar until the refit; here this program draws the line with it.`, tone: 'warn' });
    }
    what.push({ text: `${who}'s share of the current safety key exists until the refit; the rotation that follows fences it off (F100).`, tone: 'warn' });
    const then: Line[] = [
      {
        text: `The members who stay then refit the collective: Change members, removing ${who}, rotates it to keys ${who} never held, and deals the safety key afresh among those who stay (Law rule 37).`,
      },
    ];
    if (voices.length && c.f.governance.safetyThreshold >= voices.length) {
      then.push({
        text: `With ${voices.length} member${voices.length === 1 ? '' : 's'} left, a safety key needing ${c.f.governance.safetyThreshold} of them would be lost with any one of them: the refit must ask fewer to rebuild it (F96).`,
        tone: 'warn',
      });
    }
    const payload = resignationPayload(c.f.agreement);
    const reading: Reading = {
      title: `${who} leaves “${cname}”`,
      summary: [
        `${who} signs a resignation from the agreement in force (${short(c.f.agreement)}), alone: nobody else's signature is asked for, and nobody can stop it (Law rule 37a).`,
        `The collective then registers it at once by a record, its line, signed with its everyday key. From that line on, ${who}'s signature counts toward no rule and no area of the collective (F109).`,
        'Nothing else changes now: no rule is rewritten, no key rotates.',
      ],
      sections: [
        { heading: 'What leaving means', lines: what },
        { heading: 'Who decides from the line on', lines: this.decidersAfter(c, voices, releaseVoices, names) },
        { heading: 'Then', lines: then },
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${who} signs the resignation here: a test identity this program holds.` },
            { text: "The collective's everyday key, kept in this program's folder, signs the record." },
            ...(mine ? [] : [{ text: `${who} is a simulated member: their consent is simulated (test only).`, tone: 'warn' as const }]),
            ...(await this.unheard(c)),
          ],
        },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'leave',
      digest: digestOf('leave', a.collective, a.member, payload),
      reading,
      depends: [a.collective, a.member],
      run: async () => {
        const col = this.store.collective(a.collective);
        const m = this.store.identity(a.member);
        const r = await resign(m, col.f.agreement, col.f.relays);
        this.store.saveIdentity(m);
        const line = await record(col.id, { registers: [r.id], inForce: col.f.agreement }, col.f.relays);
        col.f.departed = [...departedOf(col), { member: a.member, resignation: r.id, record: line.id }];
        col.f.records = [...(col.f.records ?? []), line.id];
        this.store.saveCollective(col);
        return {
          title: `${who} left “${cname}”`,
          lines: [
            { text: `Resignation ${r.id}, signed by ${who} alone.` },
            { text: `Record ${line.id}: the collective's line, from which ${who}'s signature counts for nothing.`, tone: 'ok' },
            { text: `Next: the members who stay refit the collective (Change members: remove ${who}).` },
          ],
          acts: [r.id, line.id],
        };
      },
    });
  }

  /**
   * Step down from the release area at once, alone (Law rule 37b,
   * "Stepping down at once"): a resignation naming the area, registered at
   * once by a record. The other holders carry on; with none left, the area
   * is frozen until the members refit it.
   */
  async prepareStepDown(a: { collective: string; member: string }) {
    const blocking: string[] = [];
    const { c, cname, names } = this.memberOf(a.collective, a.member, blocking);
    const who = names(a.member);
    if (steppedDownOf(c).some((d) => d.member === a.member && d.area === RELEASE_AREA)) blocking.push(`${who} already stepped down from the Releases area.`);
    const releaseVoices = releaseVoicesOf(c).filter((m) => m !== a.member);
    const payload = resignationPayload(c.f.agreement, RELEASE_AREA);
    const area: Line[] = releaseVoices.length
      ? [
          {
            text: `The other holders carry on: a release needs ${anyOf(needed(c.f.governance.releaseThreshold, releaseVoices.length), releaseVoices, names)}${releaseVoices.length < c.f.governance.releaseThreshold ? `; the area asks for ${c.f.governance.releaseThreshold}, and when fewer remain all of them together meet it (Law rule 44d)` : ''}.`,
          },
        ]
      : [
          {
            text: 'Nobody would hold the Releases area: it is frozen from the line. A release counts for nothing until the members refit the area, by a change of the constitution that gives it a holder again (Law rule 37b).',
            tone: 'bad',
          },
        ];
    area.push({ text: `A signature of ${who}'s on a release made before the line still counts for it (Law, “Made before, made after”, C1).` });
    const reading: Reading = {
      title: `${who} steps down from the Releases area of “${cname}”`,
      summary: [
        `${who} signs a resignation naming the Releases area (area ${RELEASE_AREA}), alone: nobody else's signature is asked for (Law rule 37b, “Stepping down at once”).`,
        `The collective registers it at once by a record, its line. From that line on, ${who}'s signature counts for nothing in the Releases area.`,
        `${who} keeps the rest of their voice, as a member, and what they own.`,
      ],
      sections: [
        { heading: 'The Releases area from the line on', lines: area },
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${who} signs the stepping down here; the collective's everyday key, kept in this program's folder, signs the record.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
            ...(await this.unheard(c)),
          ],
        },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'stepdown',
      digest: digestOf('stepdown', a.collective, a.member, payload),
      reading,
      depends: [a.collective, a.member],
      run: async () => {
        const col = this.store.collective(a.collective);
        const m = this.store.identity(a.member);
        const r = await resign(m, col.f.agreement, col.f.relays, RELEASE_AREA);
        this.store.saveIdentity(m);
        const line = await record(col.id, { registers: [r.id], inForce: col.f.agreement }, col.f.relays);
        col.f.steppedDown = [...steppedDownOf(col), { member: a.member, area: RELEASE_AREA, resignation: r.id, record: line.id }];
        col.f.records = [...(col.f.records ?? []), line.id];
        this.store.saveCollective(col);
        const frozen = !releaseVoicesOf(col).length;
        return {
          title: `${who} stepped down from the Releases area`,
          lines: [
            { text: `Stepping down ${r.id}, signed by ${who} alone.` },
            { text: `Record ${line.id}: the collective's line.`, tone: 'ok' },
            frozen
              ? { text: 'The Releases area has no holder left: it is frozen until the members refit it.', tone: 'warn' }
              : { text: `A release now needs ${anyOf(needed(col.f.governance.releaseThreshold, releaseVoicesOf(col).length), releaseVoicesOf(col), names)}.` },
          ],
          acts: [r.id, line.id],
        };
      },
    });
  }

  /**
   * An ordinary change (Law rule 37c, Q8): the release area's own words,
   * changed by enough of its holders, marked with the area's power, and
   * written on the collective's record at once with its everyday key. No
   * rotation.
   */
  async prepareWords(a: { collective: string; text: string; signers?: string[] }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const text = a.text.trim();
    const blocking: string[] = [];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    if (!text) blocking.push('Write the words.');
    if (text && text === (c.f.governance.releaseWords ?? '')) blocking.push('Nothing changes: these are the area’s words already.');
    const voices = releaseVoicesOf(c);
    const k = needed(c.f.governance.releaseThreshold, voices.length);
    if (!voices.length) blocking.push('The Releases area is frozen: nobody holds it, so nobody can change its words until the members refit it (Law rule 37b).');
    const signers = a.signers?.length ? [...new Set(a.signers)] : voices.filter((m) => this.store.holds(m)).slice(0, k);
    for (const s of signers) {
      if (!voices.includes(s)) blocking.push(`${names(s)} does not hold the Releases area with a voice that remains, so their signature cannot meet its power.`);
      else if (!this.store.holds(s)) blocking.push(`${names(s)} is not held by this program, so it cannot sign here.`);
    }
    if (voices.length && signers.length < k) blocking.push(`Its words change with ${anyOf(k, voices, names)}; only ${signers.length} sign here.`);
    const mark: MarkEntry[] = [{ power: { area: RELEASE_AREA }, signers }];
    const g: Governance = { ...c.f.governance, releaseWords: text };
    const payload = encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, mark));
    let changes: Line[] = [];
    if (signers.length && text) {
      // Terms with nobody in the mark are not even in Law's format: read only what could be signed.
      const after = this.read(payload);
      const hints = this.hintsOf(c);
      const before = await this.termsAct(c.f.agreement, hints);
      if (!before) blocking.push(`The agreement in force (${short(c.f.agreement)}) could not be fetched from ${hints.join(', ')}, so what changes cannot be shown.`);
      changes = before ? readChanges(before.payload, payload, names) : [];
      if (changes.some((l) => l.tone === 'bad')) blocking.push('Its mark does not name exactly the powers its changes need (F104).');
      blocking.push(...withLaw([], readAgreement(after, names, before?.t).blocking));
    } else if (!blocking.length) blocking.push('Nobody here can sign it.');
    const oldWords = c.f.governance.releaseWords;
    const reading: Reading = {
      title: `New words for the Releases area of “${cname}”`,
      summary: [
        "An ordinary change: it changes only the Releases area's own words, an operational matter in that area (Law rules 44a, 44b).",
        `The clone is marked with the Releases area's power and signed by ${list(signers.map(names))}: enough of the area's holders (${anyOf(k, voices, names)}) (Law rules 44c, 45a).`,
        "The collective writes it on its record at once, signed with its everyday key: no rotation, no new keys (Law rule 37c, Q8).",
      ],
      sections: [
        { heading: 'What changes', lines: [...changes, ...(await this.unheard(c))] },
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${list(signers.map(names))} sign the clone; the collective's everyday key, kept in this program's folder, signs the record.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
          ],
        },
      ],
      plain: [
        { heading: "The Releases area's new words", text },
        ...(oldWords ? [{ heading: 'Its words before', text: oldWords }] : []),
      ],
      blocking,
    };
    return this.plan({
      kind: 'words',
      digest: digestOf('words', a.collective, payload),
      reading,
      depends: [a.collective, ...signers.filter((s) => this.store.holds(s))],
      run: async () => {
        const col = this.store.collective(a.collective);
        const ids = signers.map((s) => this.store.identity(s));
        const got = await col.changeReleaseWords({ words: text, proposer: ids[0], signers: ids, expect: payload });
        col.f.records = [...(col.f.records ?? []), got.record];
        this.store.saveCollective(col);
        for (const i of ids) this.store.saveIdentity(i);
        return {
          title: `The Releases area of “${cname}” has new words`,
          lines: [
            { text: `Clone ${got.clone}, signed by ${got.signed.length}.` },
            { text: `Record ${got.record}: written on the collective's record at once; no rotation.`, tone: 'ok' },
          ],
          acts: [got.clone, ...got.signed.map((s) => s.act), got.record],
        };
      },
    });
  }

  /**
   * A judicial change (Law draft 8, B13): only who judges absence changes,
   * the abandonment clause, a protected clause of the judicial tier (Law
   * rules 44a, 46a). Marked with the clone rule, signed by enough members
   * whose voice remains, and written on the collective's record at once
   * with its everyday key: no rotation (rule 37c, Q8). For a member who
   * does not sign it, absence stays judged by the clause they signed.
   */
  async prepareAbsenceRule(a: { collective: string; others: number; signers?: string[] }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    const old = c.f.governance.abandonmentOthers;
    const others = whole(a.others, 'who judges absence');
    if (others === old) blocking.push('Nothing changes: this is who judges absence already.');
    const voices = voicesOf(c);
    const k = needed(c.f.governance.cloneThreshold, voices.length);
    const signers = a.signers?.length ? [...new Set(a.signers)] : voices.filter((m) => this.store.holds(m)).slice(0, k);
    for (const s of signers) {
      if (!voices.includes(s)) blocking.push(`${names(s)} is not a member whose voice remains, so their signature cannot meet the clone rule.`);
      else if (!this.store.holds(s)) blocking.push(`${names(s)} is not held by this program, so it cannot sign here.`);
    }
    if (voices.length && signers.length < k) blocking.push(`A judicial change needs ${anyOf(k, voices, names)} (the clone rule); only ${signers.length} sign here.`);
    const g: Governance = { ...c.f.governance, abandonmentOthers: others };
    const hints = rulesHints(toRules(g), c.f.members.length);
    const mark: MarkEntry[] = [{ power: { clone: true }, signers }];
    const payload = encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, mark));
    let changes: Line[] = [];
    if (signers.length && !hints.length) {
      const after = this.read(payload);
      const at = this.hintsOf(c);
      const before = await this.termsAct(c.f.agreement, at);
      if (!before) blocking.push(`The agreement in force (${short(c.f.agreement)}) could not be fetched from ${at.join(', ')}, so what changes cannot be shown.`);
      changes = before ? readChanges(before.payload, payload, names) : [];
      if (changes.some((l) => l.tone === 'bad')) blocking.push('Its mark does not name exactly the powers its changes need (F104).');
      blocking.push(...withLaw([], readAgreement(after, names, before?.t).blocking));
    } else if (!signers.length && !blocking.length) blocking.push('Nobody here can sign it.');
    blocking.unshift(...hints);
    const unsigned = voices.filter((v) => !signers.includes(v));
    const notes: Line[] = [];
    if (c.f.governance.text === standardWords(cname, c.f.governance)) {
      notes.push({
        text: `The constitution's words say “any ${old} of the other members together decide whether a member is absent”. The words are constitutional, so this judicial change cannot rewrite them: they will describe the old number. Rewrite them with a change of the rules, which is constitutional.`,
        tone: 'warn',
      });
    }
    const reading: Reading = {
      title: `Who judges absence in “${cname}”`,
      summary: [
        'A judicial change: only who judges absence changes. The abandonment clause is a protected clause, in the judicial tier (Law rules 44a, 46a).',
        `Today any ${old} of the other members together decide whether a member is absent; after the change, any ${others}. The outcome stays the same: the member loses their voice, never what they own (F105).`,
        `The clone is marked with the clone rule and signed by ${list(signers.map(names))}: enough members (${anyOf(k, voices, names)}) (Law rules 44c, 45a).`,
        unsigned.length
          ? `For ${list(unsigned.map(names))}, who ${unsigned.length === 1 ? 'does' : 'do'} not sign it, absence stays judged by the clause they signed: any ${old} of the other members (Law rule 46a). A protected clause changes for a member only with that member's signature.`
          : 'Every member whose voice remains signs it, so the new clause judges each of them.',
        "The collective writes it on its record at once, signed with its everyday key: no rotation, no new keys (Law rule 37c, Q8).",
      ],
      sections: [
        { heading: 'What changes', lines: [...changes, ...notes, ...(await this.unheard(c))] },
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${list(signers.map(names))} sign the clone; the collective's everyday key, kept in this program's folder, signs the record.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
          ],
        },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'absence',
      digest: digestOf('absence', a.collective, payload),
      reading,
      depends: [a.collective, ...signers.filter((s) => this.store.holds(s))],
      run: async () => {
        const col = this.store.collective(a.collective);
        const ids = signers.map((s) => this.store.identity(s));
        const got = await col.changeAbsenceRule({ others, proposer: ids[0], signers: ids, expect: payload });
        col.f.records = [...(col.f.records ?? []), got.record];
        this.store.saveCollective(col);
        for (const i of ids) this.store.saveIdentity(i);
        return {
          title: `Who judges absence in “${cname}” has changed`,
          lines: [
            { text: `Clone ${got.clone}, signed by ${got.signed.length}.` },
            { text: `Record ${got.record}: written on the collective's record at once; no rotation.`, tone: 'ok' },
          ],
          acts: [got.clone, ...got.signed.map((s) => s.act), got.record],
        };
      },
    });
  }

  /** Send a waiting member change again: the same bytes, nothing new signed (Identity rule 8a). */
  async resend(collective: string): Promise<Done> {
    const c = this.store.collective(collective);
    if (!c.f.pending) throw new Error('No member change is waiting.');
    const sent = await c.id.submitRotation();
    const counts = await c.settle();
    if (counts) this.afterRefit(c, []);
    this.store.saveCollective(c);
    return {
      title: counts ? 'The member change counts' : 'Still waiting for the homes',
      lines: sent.map((x) => ({
        text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
        tone: x.result?.receipt ? 'ok' : 'bad',
      })),
      acts: [],
    };
  }

  // ------------------------------------------------------------ signing and verifying releases

  /** Where to look for a release: the relays of the collective that published it, if held here, else the settings'. */
  private placesFor(release: string, at?: string[]): string[] {
    if (at?.length) return at;
    for (const c of this.store.book().collectives) {
      const col = this.store.collective(c.id);
      if (col.f.releases.some((r) => r.id === release)) return col.f.relays;
    }
    const s = this.store.settings();
    return s.relays.length ? s.relays : s.homes.map((h) => h.hint);
  }

  /** A manifest this program published, to show what a release changed. */
  private heldManifest(release: string | null): Manifest | null {
    if (!release) return null;
    for (const c of this.store.book().collectives) {
      const r = this.store.collective(c.id).f.releases.find((x) => x.id === release);
      if (r) return decodeManifest(unb64(r.manifest));
    }
    for (const i of this.store.book().identities) {
      const r = i.releases.find((x) => x.id === release);
      if (r) return decodeManifest(unb64(r.manifest));
    }
    return null;
  }

  private verifiedLines(v: Verified, names: (id: string) => string): Section[] {
    const lines: Line[] = [];
    if (v.collective) lines.push({ text: `Published by ${names(v.collective)}.` });
    lines.push({ text: `${count(v.checked, 'file')} fetched, each checked against its fingerprint.` });
    if (v.agreement) {
      lines.push({ text: `Under agreement ${short(v.agreement)}, in force when it was signed: ${v.rule} must sign it.` });
      lines.push({ text: v.signers.length ? `Signed so far by ${v.signers.map(names).join(', ')}.` : 'No member has signed it yet.' });
    } else if (v.rule) lines.push({ text: `It needs ${v.rule}.` });
    for (const p of v.problems) lines.push({ text: p, tone: p.startsWith('not a release:') ? 'warn' : 'bad' });
    return [{ heading: 'What was checked', lines }];
  }

  async prepareSign(a: { member: string; release: string; at?: string[] }) {
    const names = this.store.names();
    const member = this.store.identity(a.member);
    const at = this.placesFor(a.release, a.at);
    const v = await verifyRelease(a.release, at, { via: this.via });
    const blocking: string[] = [];
    const onlyUnsigned = v.problems.every((p) => p.startsWith('not a release:'));
    if (!v.manifest || !onlyUnsigned) blocking.push(`The release does not check: ${v.problems.join('; ')}`);
    const checks: Line[] = [];
    if (v.agreement) {
      const t = await this.termsAct(v.agreement, at);
      if (t && !t.t.parties.includes(member.id)) {
        blocking.push(`${names(member.id)} is not a member under the agreement in force when it was signed: their signature would not count.`);
      } else if (v.collective && this.store.isCollective(v.collective)) {
        // Left, or stepped down, on the collective's line: counted only for an act made before it (F109, C1).
        const col = this.store.collective(v.collective);
        const seq = col.f.identity.sequence;
        const before = (line: string) => seq.includes(a.release) && seq.indexOf(a.release) < seq.indexOf(line);
        const left = departedOf(col).find((d) => d.member === member.id);
        const down = steppedDownOf(col).find((d) => d.member === member.id && d.area === RELEASE_AREA);
        for (const [d, words, rule] of [
          [left, 'left the collective', '37a'],
          [down, 'stepped down from the Releases area', '37b'],
        ] as const) {
          if (!d) continue;
          if (before(d.record)) {
            checks.push({ text: `${names(member.id)} ${words} after this release was made: their signature still counts for it (Law, “Made before, made after”, C1).` });
          } else {
            blocking.push(`${names(member.id)} ${words}: from the collective's line (record ${short(d.record)}) their signature counts for nothing there, and this release comes after that line (Law rule ${rule}, F109).`);
          }
        }
      }
    } else if (v.manifest) {
      blocking.push('It is not a collective’s release: nobody else’s signature is asked for.');
    }
    if (v.signers.includes(member.id)) blocking.push(`${names(member.id)} has already signed it.`);
    if (v.manifest) {
      const dir = this.checkout();
      const cmp = compareWithTree(v.manifest, dir);
      if (cmp.differ.length || cmp.missing.length) {
        const some = [...cmp.differ, ...cmp.missing];
        blocking.push(
          `It differs from your checkout (${dir}): ${cmp.differ.length} files differ and ${cmp.missing.length} are missing (${some.slice(0, 10).join(', ')}${some.length > 10 ? ', …' : ''}). A member signs only what they checked.`,
        );
      } else {
        checks.push({ text: `Compared with your checkout (${dir}): ${cmp.same === 1 ? 'the one file is' : `all ${cmp.same} files are`} the same.`, tone: 'ok' });
      }
    }
    const m = v.manifest;
    const reading: Reading = {
      title: m ? `Sign ${m.name} ${m.version} as ${names(member.id)}` : `Sign release ${short(a.release)}`,
      summary: [
        `${names(member.id)}'s signature says: I checked these files, and I agree this is the collective's release. It is a public act of their own, and cannot be taken back.`,
        'A release counts once enough members have signed it, under the agreement in force when the collective signed it.',
      ],
      sections: [...this.verifiedLines(v, names), ...(checks.length ? [{ heading: 'Your own check', lines: checks }] : []), ...(m ? readRelease(m, this.heldManifest(m.previous)) : [])],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'sign',
      digest: digestOf('sign', a.member, a.release),
      reading,
      depends: [a.member],
      run: async () => {
        const who = this.store.identity(a.member);
        const s = await signRelease(who, a.release, at);
        this.store.saveIdentity(who);
        const after = await verifyRelease(a.release, at, { via: this.via });
        return {
          title: `Signed by ${names(a.member)}`,
          lines: [
            { text: `Signature ${s.id}.` },
            after.ok
              ? { text: 'It is now a release: VERIFIED.', tone: 'ok' }
              : { text: `Not a release yet: ${after.problems.join('; ')}`, tone: 'warn' },
          ],
          acts: [s.id],
        };
      },
    });
  }

  /** Verify a release as anyone would, and say what was found. Nothing is signed. */
  async verify(a: { release: string; at?: string[] }): Promise<{ ok: boolean; reading: Reading }> {
    const names = this.store.names();
    const at = this.placesFor(a.release, a.at);
    const v = await verifyRelease(a.release, at, { via: this.via });
    const m = v.manifest;
    const sections = [...this.verifiedLines(v, names), ...(m ? readRelease(m, this.heldManifest(m.previous)) : [])];
    return {
      ok: v.ok,
      reading: {
        title: v.ok ? `VERIFIED: ${m!.name} ${m!.version}` : `NOT VERIFIED: ${m ? `${m.name} ${m.version}` : short(a.release)}`,
        summary: [
          v.ok
            ? 'The publisher really signed it, the members its agreement asks for signed it, and every file matches its fingerprint.'
            : 'Something did not check: see below.',
          `Looked for at ${at.join(', ')}.`,
        ],
        sections,
        plain: [],
        blocking: [],
      },
    };
  }

  // ------------------------------------------------------------ what the page shows

  state() {
    const b = this.store.book();
    const s = this.store.settings();
    const names = this.store.names();
    return {
      settings: { ...s, checkoutDefault: ROOT },
      identities: b.identities.map((i) => ({
        id: i.id,
        name: i.name,
        mine: i.mine,
        releases: i.releases.map((r) => ({ id: r.id, version: r.version })),
      })),
      collectives: b.collectives.map((x) => {
        const c = this.store.collective(x.id);
        const departed = departedOf(c);
        const down = steppedDownOf(c);
        const voices = releaseVoicesOf(c);
        return {
          id: x.id,
          name: x.name,
          members: c.f.members.map((m) => ({ id: m, name: names(m), held: this.store.holds(m), left: departed.some((d) => d.member === m) })),
          areas: [
            {
              id: RELEASE_AREA,
              name: 'Releases',
              holders: c.f.members.map((m) => ({
                id: m,
                name: names(m),
                held: this.store.holds(m),
                voice: voices.includes(m),
                steppedDown: down.some((d) => d.member === m && d.area === RELEASE_AREA),
              })),
              threshold: c.f.governance.releaseThreshold,
              needed: needed(c.f.governance.releaseThreshold, voices.length),
              frozen: !voices.length,
              words: c.f.governance.releaseWords ?? '',
            },
          ],
          departed: departed.map((d) => ({ id: d.member, name: names(d.member), record: d.record, stillParty: c.f.members.includes(d.member) })),
          steppedDown: down.map((d) => ({ id: d.member, name: names(d.member), area: d.area, record: d.record })),
          records: (c.f.records ?? []).length,
          holder: names(c.f.signingHolder),
          agreement: c.f.agreement,
          agreements: c.f.agreements.length,
          rules: toRules(c.f.governance),
          words: c.f.governance.text,
          shares: { threshold: c.f.safety.threshold, of: c.f.safety.shares.length },
          relays: c.f.relays,
          releases: c.f.releases.map((r) => ({ id: r.id, version: r.version })),
          pending: !!c.f.pending,
        };
      }),
      history: this.store.history().slice(-50).reverse(),
    };
  }
}
