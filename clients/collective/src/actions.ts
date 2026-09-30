// What the collective client does. Everything that signs goes in two steps:
// `prepare` makes the exact bytes and reads them back in plain words, the
// page shows that reading, and `confirm` signs those same bytes, only if the
// person sends back the reading's digest and nothing it depends on changed
// in between (Law rule 4a: what you sign is what you saw).

import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describeAct } from '../../genesis/src/core.ts';
import { TestIdentity, type Home } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestCollective, collectiveTerms, type Governance } from '../../repo/src/collective.ts';
import { encodeTerms } from '../../repo/src/law.ts';
import {
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
import { count, readAgreement, readChanges, readRelease, rulesHints, short, termsOf, withLaw, type Line, type Reading, type Section, type TermsRead } from './explain.ts';
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
  return `“${name}”, a MOR test collective. Test acts only, wiped before the first real acts. Its everyday key is held by its first member; its safety key is split among the members, any ${g.safetyThreshold} of whom rebuild it. A release counts only when ${g.releaseThreshold} members have signed it, each with an act of their own. Members change by a clone of this agreement, signed by any ${g.cloneThreshold} members and by each member who joins, and a rotation of the collective declaring it. Any ${g.abandonmentOthers} of the other members together decide whether a member is absent; the outcome is that member losing their voice.`;
}

export interface Rules {
  safety: number;
  release: number;
  clone: number;
  others: number;
}

const toRules = (g: Governance): Rules => ({
  safety: g.safetyThreshold,
  release: g.releaseThreshold,
  clone: g.cloneThreshold,
  others: g.abandonmentOthers,
});

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
    if (p.releases.some((r) => r.version === version)) blocking.push(`A release ${version} was already published by ${names(a.publisher)}. Choose another version.`);
    const dir = this.checkout();
    const prepared = prepareRelease(p, { name, version, files: gitFiles(dir), source: gitSource(dir) });
    const who: Line[] = collective
      ? [
          {
            text: `It is published by ${names(a.publisher)}, signed with its everyday key. It is not a release yet: it counts once any ${collective.f.governance.releaseThreshold} of its ${collective.f.members.length} members have signed it, each with an act of their own (agreement in force ${short(collective.f.agreement)}).`,
          },
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
            ...(collective ? [{ text: `It counts once ${collective.f.governance.releaseThreshold} members sign it.` }] : []),
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

  /** The terms payload of a public terms act, fetched. */
  private async termsAct(id: string, hints: string[]): Promise<TermsRead | null> {
    const a = await this.fetchAct(id, hints);
    if (!a) return null;
    const d = describeAct(a) as { public: boolean; spec?: string; type?: number; payload?: Uint8Array };
    if (!d.public || d.spec !== REPO_SPECS.law || d.type !== 0 || !d.payload) return null;
    return termsOf(d.payload);
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
    const rules = {
      safetyThreshold: whole(a.rules.safety, 'the shares needed'),
      releaseThreshold: whole(a.rules.release, 'the signatures a release needs'),
      cloneThreshold: whole(a.rules.clone, 'the signatures a change needs'),
      abandonmentOthers: whole(a.rules.others, 'who judges absence'),
    };
    const g: Governance = { ...rules, text: a.words?.trim() || standardWords(name || 'unnamed', rules) };
    const payload = encodeTerms(collectiveTerms(g, members, members[0]));
    let t: TermsRead;
    try {
      t = termsOf(payload);
    } catch (e) {
      throw new Error(`Law cannot read these terms: ${e instanceof Error ? e.message : e}`);
    }
    const read = readAgreement(t, names);
    blocking.push(...withLaw(rulesHints(toRules(g), members.length), read.blocking));
    const reading: Reading = {
      title: `Found the collective “${name}”`,
      summary: [
        `Each of the ${members.length} members signs the founding agreement below, each with a visible act of their own.`,
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
      plain: [{ heading: 'The words everyone signs', text: t.text }],
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

  async prepareChange(a: { collective: string; join?: string[]; leave?: string[]; rules?: Rules; words?: string }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
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
    const members = [...c.f.members.filter((m) => !leave.has(m)), ...join.filter((j) => !c.f.members.includes(j))];
    const staying = c.f.members.filter((m) => !leave.has(m));
    const signersStaying = staying.filter((m) => this.store.holds(m));

    const current = c.f.governance;
    const rules = a.rules
      ? {
          safetyThreshold: whole(a.rules.safety, 'the shares needed'),
          releaseThreshold: whole(a.rules.release, 'the signatures a release needs'),
          cloneThreshold: whole(a.rules.clone, 'the signatures a change needs'),
          abandonmentOthers: whole(a.rules.others, 'who judges absence'),
        }
      : { ...current };
    const rulesChanged = JSON.stringify(toRules({ ...rules, text: '' })) !== JSON.stringify(toRules(current));
    let text = a.words?.trim() || current.text;
    const notes: Line[] = [];
    if (!a.words?.trim() && rulesChanged) {
      if (current.text === standardWords(cname, current)) text = standardWords(cname, rules);
      else notes.push({ text: 'The rules change but the words stay as they were: check they still say what the rules do.', tone: 'warn' });
    }
    const changedGovernance = rulesChanged || text !== current.text;
    const g: Governance = { ...rules, text };

    const holder = c.nextHolder(members);
    const payload = encodeTerms(collectiveTerms(g, members, holder, c.f.agreement));
    let after: TermsRead;
    try {
      after = termsOf(payload);
    } catch (e) {
      throw new Error(`Law cannot read these terms: ${e instanceof Error ? e.message : e}`);
    }
    const hints = [...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)];
    const before = await this.termsAct(c.f.agreement, hints);
    if (!before) blocking.push(`The agreement in force (${short(c.f.agreement)}) could not be fetched from ${hints.join(', ')}, so what changes cannot be shown.`);

    // Law: the parent's clone rule, counted among the parent's parties who sign here.
    const cloneRule = before?.clone;
    if (before && cloneRule) {
      const k = cloneRule.form === 'all' ? before.parties.length : cloneRule.form === 'threshold' ? cloneRule.threshold! : 0;
      if (cloneRule.form === 'named') {
        const missing = (cloneRule.named ?? []).filter((n) => !signersStaying.includes(n));
        if (missing.length) blocking.push(`The clone needs ${missing.map(names).join(', ')} to sign it, and they do not stay here.`);
      } else if (signersStaying.length < k) {
        blocking.push(`A change needs ${k} of the current members to sign it; only ${signersStaying.length} stay and are held here.`);
      }
    }
    const rebuilders = c.f.safety.shares.filter((x) => staying.includes(x.holder) && this.store.holds(x.holder)).map((x) => x.holder);
    if (rebuilders.length < c.f.safety.threshold) {
      blocking.push(`Rotating the collective needs ${c.f.safety.threshold} shares of its safety key from members who stay; only ${rebuilders.length} are here.`);
    }
    if (!members.length) blocking.push('Nobody would be left.');
    if (!join.length && !leave.size && !changedGovernance) blocking.push('Nothing changes.');

    const read = readAgreement(after, names, before);
    blocking.push(...withLaw(members.length ? rulesHints(toRules(g), members.length) : [], read.blocking));
    const usedRebuilders = rebuilders.slice(0, c.f.safety.threshold);
    const mineLeaving = [...leave].filter((l) => this.store.book().identities.find((i) => i.id === l)?.mine);
    const title =
      mineLeaving.length && leave.size === 1 && !join.length
        ? `${names(mineLeaving[0])} leaves “${cname}”`
        : join.length && !leave.size
          ? `Add ${join.map(names).join(', ')} to “${cname}”`
          : leave.size && !join.length
            ? `Remove ${[...leave].map(names).join(', ')} from “${cname}”`
            : join.length || leave.size
              ? `Change the members of “${cname}”`
              : `Change the rules of “${cname}”`;
    const summary = [
      `The members sign a clone of the agreement in force: a new version naming it, with ${members.length} members.`,
      `Then the collective rotates: its safety key, rebuilt from the shares of ${usedRebuilders.map(names).join(' and ') || 'nobody'}, signs a rotation declaring the clone, and a new safety key is dealt to the new members only.`,
      'Once the homes count the rotation, the new rules apply, and anything the old key signs is void (F100).',
    ];
    if (mineLeaving.length) summary.push('The members who stay write the rules from here on: yours end with your membership.');
    const reading: Reading = {
      title,
      summary,
      sections: [
        { heading: 'What changes', lines: [...(before ? readChanges(before, after, names) : []), ...notes] },
        ...read.sections.map((s) => ({ ...s, heading: `After the change: ${s.heading.toLowerCase()}` })),
        {
          heading: 'Signed on this device',
          lines: [
            { text: `The clone is proposed by ${names(signersStaying[0] ?? staying[0] ?? '')} and signed by ${[...signersStaying, ...join].map(names).join(', ')}.` },
            { text: `The shares of ${usedRebuilders.map(names).join(' and ')} rebuild the safety key for the rotation. Members who leave hand over nothing.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
          ],
        },
      ],
      plain: [
        { heading: 'The words after the change', text: after.text },
        ...(before && before.text !== after.text ? [{ heading: 'The words before', text: before.text }] : []),
      ],
      blocking,
    };
    return this.plan({
      kind: 'change',
      digest: digestOf('change', a.collective, payload, JSON.stringify({ members, rebuilders: usedRebuilders })),
      reading,
      depends: [a.collective, ...new Set([...c.f.members, ...join].filter((m) => this.store.holds(m)))],
      run: async () => {
        const col = this.store.collective(a.collective);
        const stay = signersStaying.map((m) => this.store.identity(m));
        const joining = join.map((m) => this.store.identity(m));
        const got = await col.changeMembers({
          members,
          proposer: stay[0],
          signers: [...stay, ...joining],
          rebuilders: usedRebuilders,
          governance: changedGovernance ? g : undefined,
          expect: payload,
        });
        this.store.saveCollective(col);
        for (const i of [...stay, ...joining]) this.store.saveIdentity(i);
        const counts = await col.settle();
        this.store.saveCollective(col);
        return {
          title: counts ? `${title}: done` : `${title}: waiting for the homes`,
          lines: [
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
          acts: [got.clone, ...got.signed.map((x) => x.act), got.rotation],
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
    if (v.agreement) {
      const t = await this.termsAct(v.agreement, at);
      if (t && !t.parties.includes(member.id)) {
        blocking.push(`${names(member.id)} is not a member under the agreement in force when it was signed: their signature would not count.`);
      }
    } else if (v.manifest) {
      blocking.push('It is not a collective’s release: nobody else’s signature is asked for.');
    }
    if (v.signers.includes(member.id)) blocking.push(`${names(member.id)} has already signed it.`);
    const checks: Line[] = [];
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
        return {
          id: x.id,
          name: x.name,
          members: c.f.members.map((m) => ({ id: m, name: names(m), held: this.store.holds(m) })),
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
