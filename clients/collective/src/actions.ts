// What the collective client does. Everything that signs goes in two steps:
// `prepare` makes the exact bytes and reads them back in plain words, the
// page shows that reading, and `confirm` signs those same bytes, only if the
// person sends back the reading's digest and nothing it depends on changed
// in between (Law rule 4a: what you sign is what you saw).

import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MIPS, SPECS, Verifier, cborDecode, describeAct, hex, lawClonePlan, lawDivideStake, lawRollbackPlan, lawSplitTally, noticePayload, resignationPayload, runningSummary } from '../../genesis/src/core.ts';
import { TestIdentity, lookUp, type Home } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestCollective, collectiveTerms, type Governance } from '../../repo/src/collective.ts';
import {
  LAW_SPECS,
  RELEASE_AREA,
  closingPayload,
  type LeftOpen,
  contest,
  debtReleasePayload,
  encodeTerms,
  forkPayload,
  grantPayload,
  obligationPayload,
  pointerPayload,
  receiptPayload,
  record,
  releasePayload,
  resign,
  signedBy,
  sign as lawSign,
  splitPayload,
  type MarkEntry,
  type PayoutIn,
  type Stake,
} from '../../repo/src/law.ts';
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
import { FINANCE_TYPES, LAW_TYPES, REPO_SPECS, TEST_RAIL, TEST_TIME } from '../../repo/src/specs.ts';
import {
  absenceSection,
  collectiveClause,
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
  /** The constitutional change rule naming the members who hold constitutional power (Law rule 44c): only some members change the constitution (RB5). */
  constitutionNamed?: string[];
}

const toRules = (g: Governance): Rules => ({
  safety: g.safetyThreshold,
  release: g.releaseThreshold,
  clone: g.cloneThreshold,
  others: g.abandonmentOthers,
  ...(g.constitutionalThreshold ? { constitution: g.constitutionalThreshold } : {}),
  ...(g.constitutionalNamed?.length ? { constitutionNamed: g.constitutionalNamed } : {}),
});

/** The numbers of a Governance from the rules typed on the page. */
const fromRules = (r: Rules) => ({
  safetyThreshold: whole(r.safety, 'the shares needed'),
  releaseThreshold: whole(r.release, 'the signatures a release needs'),
  cloneThreshold: whole(r.clone, 'the signatures a change needs'),
  abandonmentOthers: whole(r.others, 'who judges absence'),
  ...(r.constitution !== undefined ? { constitutionalThreshold: whole(r.constitution, 'the signatures a change of the constitution needs') } : {}),
  ...(r.constitutionNamed?.length ? { constitutionalNamed: r.constitutionNamed } : {}),
});

/** Law's own reading of a collective ([`Actions.lawOf`]). */
export interface LawOf {
  v: Verifier;
  broken: string | null;
  /** Where Law reads the collective as broken and a rollback can bring it back (Law rule 37d, F185): the broken act, the agreement in force just before it, and Law's reason. */
  brokenAct: BrokenAct | null;
  unread?: string;
  agreement: string | null;
  terms: { payload: Uint8Array; t: TermsRead } | null;
  departed: string[];
  steppedDown: [number, string][];
  frozen: number[];
  closed: string | null;
  fork: boolean;
}

/** A broken collective's broken act, as Law gives it (`lawBrokenAct`, Law rule 37d, F185). */
export interface BrokenAct {
  act: string;
  before: string;
  reason: string;
}

/** A collective as the page shows it: Law's reading, or this device's copy where Law has none, said so. */
interface Shown {
  broken: string | null;
  /** Broken, and a rollback can bring it back (Law rule 37d). */
  rollback: boolean;
  unread: string | null;
  agreement: string;
  members: { id: string; left: boolean }[];
  holder: string;
  rules: Rules;
  words: string;
  shares: { threshold: number; of: number };
  area: { holders: { id: string; voice: boolean; steppedDown: boolean }[]; threshold: number; needed: number; frozen: boolean; words: string };
  /** Payments received during a broken stretch, owed back until the sale is signed anew after the rollback (Law rule 37d, RB2). */
  owedBack?: { payment: string; to: string | null; toKind: 'identity' | 'key' | 'nobody'; unit: string; value: number; stillBroken: boolean }[];
  /** Declarations of absence naming a member, as Law's verifier holds them (RB3, client conformance). */
  declared?: { member: string; act: string; signer: string; agreement: string; outcomes: number[]; contests?: string[] }[];
}

const ruleNumber = (r: { form: string; threshold?: number | null } | null | undefined, all: number): number | undefined =>
  !r ? undefined : r.form === 'threshold' && r.threshold ? r.threshold : r.form === 'all' ? all : undefined;

/**
 * A declaration of absence as the member it names is shown it, with the way
 * to contest it (RB3, client conformance; Law rules 51, 52, 53; F172).
 */
function contestWords(who: string, by: string, d: { act: string; agreement: string; outcomes: number[]; contests?: string[] }): string {
  const outs = d.outcomes.map((o) => (o === 0 ? 'voice removed' : o === 1 ? 'stake redistributed' : o === 2 ? 'stake transferred' : o === 3 ? 'obligations redirected' : `outcome ${o}`)).join(', ');
  const contested = d.contests?.length ? ` ${who} contested it (${d.contests.map(short).join(', ')}): shown beside it, it voids nothing.` : '';
  return `${who} is named as absent by a declaration ${short(d.act)}, signed by ${by}, under the agreement ${short(d.agreement)} (outcomes: ${outs}). It moves nothing by itself: it takes effect only where a line of the collective registers it (a record, or a rollback). To contest it: ${who} signs a contest act (Law rule 52), shown beside the declaration to everyone who reads it; a contest shows the declaration, it does not void it. A voice removed comes back only by a later version of the agreement naming ${who}, signed under the collective's rules.${contested}`;
}

/** What the page shows: from Law's reading of the agreement in force where it has one, else from this device's copy. */
function shownOf(c: TestCollective, law: LawOf): Shown {
  if (law.agreement && law.terms) {
    const t = law.terms.t;
    const area = t.areas.find((a) => a.id === RELEASE_AREA);
    const downIn = (m: string) => law.steppedDown.some(([a, p]) => a === RELEASE_AREA && p === m);
    let voices: string[] = [];
    let need = 0;
    if (area) {
      const nv = law.v.lawNextVoices(LAW_SPECS, c.identity, { form: 'area', area: RELEASE_AREA }, []) as { error: string | null; voices: string[]; needed: number | null };
      if (!nv.error) {
        voices = nv.voices;
        need = nv.needed ?? 0;
      }
    }
    const safety = t.grammar?.safety;
    const signing = t.grammar?.signing;
    const parties = t.parties.length;
    return {
      broken: null,
      rollback: false,
      unread: null,
      agreement: law.agreement,
      // Left: gone as Law counts it, or declared absent while holding the
      // everyday key, the declaration signed and taking effect at the
      // recovery rotation (C7, B16), where Law still counts them until then.
      members: t.parties.map((m) => ({ id: m, left: law.departed.includes(m) || c.recovering().some((d) => d.member === m) })),
      holder: signing?.form === 'one' && signing.holder ? signing.holder : c.f.signingHolder,
      rules: {
        safety: safety?.threshold ?? c.f.governance.safetyThreshold,
        release: area?.threshold ?? c.f.governance.releaseThreshold,
        clone: ruleNumber(t.clone, parties) ?? c.f.governance.cloneThreshold,
        others: t.abandonment?.threshold ?? Math.max(parties - 1, 1),
        ...(ruleNumber(t.constitutional, parties) !== undefined && t.constitutional?.form === 'threshold' ? { constitution: ruleNumber(t.constitutional, parties)! } : {}),
      },
      words: t.text,
      shares: { threshold: safety?.threshold ?? c.f.safety.threshold, of: safety?.members?.length ?? c.f.safety.shares.length },
      area: {
        holders: (area?.holders ?? []).map((h) => ({ id: h, voice: voices.includes(h), steppedDown: downIn(h) })),
        threshold: area?.threshold ?? 0,
        needed: need,
        frozen: !voices.length,
        words: t.areaWords.find(([a]) => a === RELEASE_AREA)?.[1] ?? '',
      },
    };
  }
  // No reading from Law: this device's copy, which the page labels as such.
  const departed = departedOf(c);
  const voices = releaseVoicesOf(c);
  return {
    broken: law.broken,
    rollback: !!law.brokenAct,
    unread: law.broken ? null : (law.unread ?? 'no reading'),
    agreement: c.f.agreement,
    members: c.f.members.map((m) => ({ id: m, left: departed.some((d) => d.member === m) })),
    holder: c.f.signingHolder,
    rules: toRules(c.f.governance),
    words: c.f.governance.text,
    shares: { threshold: c.f.safety.threshold, of: c.f.safety.shares.length },
    area: {
      holders: c.f.members.map((m) => ({ id: m, voice: voices.includes(m), steppedDown: steppedDownOf(c).some((d) => d.member === m && d.area === RELEASE_AREA) })),
      threshold: c.f.governance.releaseThreshold,
      needed: needed(c.f.governance.releaseThreshold, voices.length),
      frozen: !voices.length,
      words: c.f.governance.releaseWords ?? '',
    },
  };
}

/** A change Law would not count, stopped before its clone or before the record putting it in force. */
function stoppedDone(title: string, got: { clone: string; signed: { act: string }[]; stopped?: string }): Done {
  return {
    title: `${title}: stopped, nothing in force`,
    lines: [
      got.clone ? { text: `Clone ${got.clone}, signed by ${got.signed.length}: a draft, never put in force; no record was written.` } : { text: 'No clone was proposed or signed.' },
      { text: `Law would not count it: ${got.stopped}`, tone: 'bad' },
    ],
    acts: [...(got.clone ? [got.clone] : []), ...got.signed.map((x) => x.act)],
  };
}

/** A power of a clone plan (`lawClonePlan`) as a mark entry names it. */
const powerOf = (n: { form: string; area?: number }): MarkEntry['power'] =>
  n.form === 'area' ? { area: n.area! } : n.form === 'constitutional' ? { constitutional: true } : n.form === 'judicial' ? { judicial: true } : { clone: true };

/** A power in words. */
function powerWords(p: MarkEntry['power']): string {
  if ('constitutional' in p) return 'the constitutional change rule';
  if ('judicial' in p) return "the judicial tier's rule";
  if ('area' in p) return p.area === RELEASE_AREA ? "the Releases area's power" : `the power of area ${p.area}`;
  return 'the clone rule';
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A collective Law reads as broken, in a plain sentence: what it means, and Law's reason. */
export function brokenWords(it: string, reason: string): string {
  return `Law reads ${it} as broken: no agreement can be found in force for it, so nothing signed in its name counts, and no change of it can come into force. Law's reason: ${reason}.`;
}

/** The departures a collective file keeps (Law draft 7), with defaults for older files. */
// A member named again by a version they signed has come back (B10): their
// old entry is closed, and their old resignation is spent (F189, 1).
const departedOf = (c: TestCollective) => (c.f.departed ?? []).filter((d) => !d.returned);
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
  private shownCache = new Map<string, { stamp: string; at: number; shown: Shown }>();
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

  async prepareRelease(a: { publisher: string; version: string; name?: string }) {
    const names = this.store.names();
    const { p, save, collective } = this.publisher(a.publisher);
    const version = a.version.trim();
    const name = a.name?.trim() || 'MOR';
    const blocking: string[] = [];
    if (!version) blocking.push('Give the release a version, for example 11b.1.');
    if (!p.relays.length) blocking.push('Name at least one relay first, under Settings: the files go there.');
    if (collective?.f.pending) blocking.push('A member change of this collective is still waiting for its homes. Send it again first: a release signed with the old key would be void once the change counts.');
    // Who must sign, as Law counts the Releases area's holders whose voice
    // remains in the agreement in force (rules 36a, 44d), never this
    // device's copy; nothing in the name of a collective Law reads as broken.
    let voices: string[] = [];
    let need = 0;
    let threshold = 0;
    let counted = false;
    if (collective) {
      const law = await this.lawOf(collective);
      const cname = this.store.book().collectives.find((x) => x.id === collective.identity)?.name;
      if (law.broken) blocking.push(brokenWords(cname ? `“${cname}”` : 'this collective', law.broken));
      else if (!law.terms) blocking.push(`Law's own reading of the collective could not be had (${law.unread ?? 'nothing found'}), so who must sign cannot be told.`);
      else {
        threshold = law.terms.t.areas.find((x) => x.id === RELEASE_AREA)?.threshold ?? 0;
        const nv = law.v.lawNextVoices(LAW_SPECS, collective.identity, { form: 'area', area: RELEASE_AREA }, []) as { error: string | null; voices: string[]; needed: number | null };
        if (nv.error) blocking.push(`Law cannot count the Releases area's holders: ${nv.error}.`);
        voices = nv.voices ?? [];
        need = nv.needed ?? 0;
        counted = !nv.error;
      }
    }
    if (collective && counted && !voices.length) {
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
            text: `It is published by ${names(a.publisher)}, signed with its everyday key. It is not a release yet: it counts once ${anyOf(need, voices, names)}, the holders of its Releases area whose voice remains, have signed it, each with an act of their own (agreement in force ${short(collective.f.agreement)}).`,
          },
          ...(voices.length < threshold && voices.length
            ? [{ text: `The area asks for ${threshold}; fewer holders remain, so all of them together meet it (Law rule 44d).` }]
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
            ...(collective ? [{ text: `It counts once ${anyOf(need, voices, names)} sign it.` }] : []),
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

  /**
   * Law's own reading of a collective, from a verifier holding what its
   * relays and homes hold (never this device's copy of it): the agreement
   * in force and its bytes, who left, who stepped down from which area,
   * which areas are frozen; or why Law reads it as broken. `unread`: why
   * no reading could be had (its relays and homes away).
   */
  async lawOf(c: TestCollective, extra: string[] = []): Promise<LawOf> {
    const hints = this.hintsOf(c);
    const ids = new Set([c.identity, ...extra, ...c.f.members, ...departedOf(c).map((d) => d.member), ...(c.f.governance.departed ?? [])]);
    for (const a of c.f.agreements) for (const p of (await this.termsAct(a, hints))?.t.parties ?? []) ids.add(p);
    const { v } = await this.lawVerifier(c, [...ids]);
    const none = { v, broken: null, brokenAct: null, agreement: null, terms: null, departed: [], steppedDown: [], frozen: [], closed: null, fork: false };
    let broken: string | null;
    try {
      broken = v.lawBroken(LAW_SPECS, c.identity) ?? null;
    } catch (e) {
      return { ...none, unread: e instanceof Error ? e.message : String(e) };
    }
    if (broken) return { ...none, broken, brokenAct: (v.lawBrokenAct(LAW_SPECS, c.identity) as BrokenAct | null) ?? null };
    const cur = v.lawCurrent(LAW_SPECS, c.identity) as {
      agreement: string;
      departed: string[];
      steppedDown: [number, string][];
      frozen: number[];
      closed: string | null;
      fork: boolean;
    } | null;
    if (!cur) return { ...none, unread: `the collective's chain was not found at ${hints.join(', ')}` };
    const terms = await this.termsAct(cur.agreement, hints);
    if (!terms) return { ...none, unread: `its agreement in force (${short(cur.agreement)}) was not found at ${hints.join(', ')}` };
    return { v, broken: null, brokenAct: null, agreement: cur.agreement, terms, departed: cur.departed, steppedDown: cur.steppedDown, frozen: cur.frozen, closed: cur.closed, fork: cur.fork };
  }

  /**
   * A clone's mark as Law asks it (rules 44c, 44d, 45a): the powers its
   * changes need, from the agreement in force as Law finds it and the
   * clone's own bytes (`lawClonePlan`), and for each the voices Law counts
   * at the collective's next line (`lawNextVoices`), less `leaving`, whose
   * resignations a record of this change registers first. Each power is
   * named with the voices held here (`take`: only as many as it needs, else
   * all of them). Where Law cannot count, or too few of its voices sign
   * here, the review is blocked, in plain words. `lines`: what Law counts,
   * for the review.
   */
  private lawMark(
    c: TestCollective,
    law: LawOf,
    clone: (mark: MarkEntry[]) => Uint8Array,
    leaving: string[],
    names: (id: string) => string,
    take: 'all' | 'needed' = 'all',
  ): { mark: MarkEntry[]; blocking: string[]; lines: Line[]; counts: { power: MarkEntry['power']; voices: string[]; needed: number }[] } {
    const counts: { power: MarkEntry['power']; voices: string[]; needed: number }[] = [];
    const blocking: string[] = [];
    const cname = this.store.book().collectives.find((x) => x.id === c.identity)?.name;
    const it = cname ? `“${cname}”` : 'this collective';
    if (law.broken) return { mark: [], blocking: [brokenWords(it, law.broken)], lines: [], counts };
    if (!law.agreement || !law.terms) {
      return { mark: [], blocking: [`Law's own reading of ${it} could not be had (${law.unread ?? 'nothing found'}), so who must sign cannot be counted: nothing is signed until it can.`], lines: [], counts };
    }
    if (law.agreement !== c.f.agreement) {
      return {
        mark: [],
        blocking: [`This device holds ${short(c.f.agreement)} as the agreement in force, but Law finds ${short(law.agreement)} in force at the collective's relays and homes: a clone of the wrong agreement would count for nothing. Bring this device up to date first.`],
        lines: [],
        counts,
      };
    }
    let needs: { form: string; area?: number }[];
    try {
      const placeholder: MarkEntry[] = [{ power: { clone: true }, signers: [c.f.members[0]] }];
      needs = (lawClonePlan(law.terms.payload, clone(placeholder), LAW_SPECS) as { needs: { form: string; area?: number }[] }).needs;
    } catch {
      // Terms Law refuses: the review already says why, with Law's own words.
      return { mark: [], blocking: [], lines: [], counts };
    }
    const mark: MarkEntry[] = [];
    const lines: Line[] = [];
    for (const n of needs) {
      const power = powerOf(n);
      const what = powerWords(power);
      const nv = law.v.lawNextVoices(LAW_SPECS, c.identity, { form: n.form, area: n.area }, leaving) as {
        error: string | null;
        voices: string[];
        needed: number | null;
      };
      if (nv.error) {
        blocking.push(`Law cannot count ${what} in ${it}: ${nv.error}.`);
        continue;
      }
      if (nv.needed == null) {
        blocking.push(`Nobody's voice remains for ${what}, so nothing can meet it (Law rule 44d): ${n.form === 'area' ? 'the area is frozen until the members refit it (rule 37b)' : 'no change of this kind can come into force'}.`);
        continue;
      }
      counts.push({ power, voices: nv.voices, needed: nv.needed });
      const held = nv.voices.filter((m) => this.store.holds(m));
      const signers = take === 'needed' ? held.slice(0, nv.needed) : held;
      lines.push({ text: `Law counts, for ${what}: ${anyOf(nv.needed, nv.voices, names)} (Law rule 44d). Its mark names ${list(signers.map(names)) || 'nobody'}.` });
      if (held.length < nv.needed) {
        const away = nv.voices.filter((m) => !this.store.holds(m));
        blocking.push(
          `${cap(what)} needs ${anyOf(nv.needed, nv.voices, names)}, as Law counts the voices that remain (rule 44d); only ${held.length} of them sign here${away.length ? ` (${list(away.map(names))} ${away.length === 1 ? 'is' : 'are'} not held by this program)` : ''}. A mark naming fewer would be false, and the clone invalid whatever signatures it gathers (Law rule 45a).`,
        );
      }
      mark.push({ power, signers });
    }
    return { mark, blocking, lines, counts };
  }

  /**
   * Before a clone is proposed, and again once it is signed, before the
   * record or rotation that would put it in force is sent: Law's own count
   * from a fresh reading of the relays and homes, never this device's
   * copy. Null when the mark names, for each power, voices Law counts there
   * and enough of them; else why not, in plain words. With `clone`, also
   * that Law finds it valid and every signature it needs held.
   */
  private async markHolds(
    c: TestCollective,
    mark: MarkEntry[],
    names: (id: string) => string,
    o: { clone?: string; joining?: string[]; leaving?: string[] } = {},
  ): Promise<string | null> {
    const law = await this.lawOf(c, o.joining);
    if (law.broken) return brokenWords('the collective', law.broken);
    if (!law.agreement) return `Law's own reading of the collective could not be had (${law.unread ?? 'nothing found'}).`;
    for (const e of mark) {
      const what = powerWords(e.power);
      const p = 'area' in e.power ? { form: 'area', area: e.power.area } : { form: Object.keys(e.power)[0] };
      const nv = law.v.lawNextVoices(LAW_SPECS, c.identity, p, o.leaving ?? []) as { error: string | null; voices: string[]; needed: number | null };
      if (nv.error) return `Law cannot count ${what}: ${nv.error}.`;
      const out = e.signers.filter((s) => !nv.voices.includes(s));
      if (out.length) return `The mark names ${list(out.map(names))} for ${what}, whose voice Law does not count there (rule 44d).`;
      if (nv.needed == null || e.signers.length < nv.needed) {
        return `The mark names ${e.signers.length} for ${what}, but Law counts ${anyOf(nv.needed ?? 0, nv.voices, names)} there (rules 44d, 45a): the clone would be invalid.`;
      }
    }
    if (o.clone) {
      const a = law.v.lawAgreement(LAW_SPECS, o.clone) as { invalid: string | null; ready: boolean };
      if (a.invalid) return `Law finds the clone invalid: ${a.invalid}.`;
      if (!a.ready) return 'Not every signature the clone needs is held at the relays yet.';
    }
    return null;
  }

  /**
   * Who counts in a collective, as Law reads it now from what its relays
   * and homes hold (rule 44d), never this device's copy: the members whose
   * voice remains, the Releases area's holders whose voice remains and how
   * many of them a release needs, and the constitutional change rule's
   * number. `problem`: why Law has no count (the collective broken, or not
   * readable); the lists are then empty.
   */
  private async counted(c: TestCollective): Promise<{
    voices: string[];
    releaseVoices: string[];
    releaseNeeded: number;
    releaseThreshold: number;
    constitution?: number;
    clone: number;
    safety: number;
    problem: string | null;
    /** Law reads the collective as broken (Law rule 37d). */
    broken?: boolean;
  }> {
    const law = await this.lawOf(c);
    const cname = this.store.book().collectives.find((x) => x.id === c.identity)?.name;
    const it = cname ? `“${cname}”` : 'this collective';
    const none = { voices: [], releaseVoices: [], releaseNeeded: 0, releaseThreshold: 0, clone: 0, safety: 0 };
    if (law.broken) return { ...none, problem: brokenWords(it, law.broken), broken: true };
    if (!law.terms) return { ...none, problem: `Law's own reading of ${it} could not be had (${law.unread ?? 'nothing found'}), so who counts cannot be told.` };
    type NV = { error: string | null; voices: string[]; needed: number | null };
    const all = law.v.lawNextVoices(LAW_SPECS, c.identity, { form: 'judicial' }, []) as NV;
    const area = law.v.lawNextVoices(LAW_SPECS, c.identity, { form: 'area', area: RELEASE_AREA }, []) as NV;
    const k = law.terms.t.constitutional;
    return {
      voices: all.voices ?? [],
      releaseVoices: area.error ? [] : area.voices,
      releaseNeeded: area.needed ?? 0,
      releaseThreshold: law.terms.t.areas.find((x) => x.id === RELEASE_AREA)?.threshold ?? 0,
      ...(k?.form === 'threshold' && k.threshold ? { constitution: k.threshold } : {}),
      clone: law.terms.t.clone.form === 'threshold' && law.terms.t.clone.threshold ? law.terms.t.clone.threshold : law.terms.t.parties.length,
      safety: law.terms.t.grammar?.safety.threshold ?? 0,
      problem: all.error ? `Law cannot count the members of ${it}: ${all.error}.` : null,
    };
  }

  /** The checks a change written on the record passes to the repo client: the mark as Law counted it, and Law counting again before the clone and before the record. */
  private gates(col: TestCollective, mark: MarkEntry[], names: (id: string) => string) {
    return {
      mark,
      beforeClone: () => this.markHolds(col, mark, names),
      beforeSend: (clone: string) => this.markHolds(col, mark, names, { clone }),
    };
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
    const found = await this.unheardActs(c);
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

  /** Acts of the collective its relays hold that this device's sequence does not, with their positions. */
  private async unheardActs(c: TestCollective): Promise<Map<string, number>> {
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
    return found;
  }

  /**
   * Before signing a fork or closing (F131, IT2b, client conformance): this
   * client refuses until it has pulled every device's latest acts and holds
   * every act the ending's history should hold. A line drawn without them
   * would leave out acts the collective already did, and any debt or sale
   * they carry would be void: a cost the text states only for an ending
   * whose signers all chose it. Also (F131, IT1) the endings of the
   * collective already held, which the new one names, so that it counts as
   * made after them and never undoes a complete one.
   */
  private async endingGate(
    c: TestCollective,
    v: Verifier,
    specs: typeof LAW_SPECS,
    line: { act: string; position: number; summary: string }[],
  ): Promise<{ blocking: string[]; named: string[] }> {
    const blocking: string[] = [];
    const found = await this.unheardActs(c);
    if (found.size) {
      const latest = [...found].sort((x, y) => y[1] - x[1])[0][0];
      blocking.push(
        `This device has not caught up with the collective's other devices: ${count(found.size, 'act')} signed by the collective ${found.size === 1 ? 'is' : 'are'} at its relays but not in its sequence (latest ${short(latest)}). An ending drawn here would leave ${found.size === 1 ? 'it' : 'them'} out of its history, and void what ${found.size === 1 ? 'it carries' : 'they carry'}: bring this device up to date first (Law rule 47a; F131 IT2b, client conformance).`,
      );
    }
    const unheld = v.lawLineUnheld(specs, c.identity, c.f.identity.binding, line) as string[];
    if (unheld.length) {
      blocking.push(
        `${count(unheld.length, 'act')} in the history this ending would cite ${unheld.length === 1 ? 'is' : 'are'} not held here (first ${short(unheld[0])}): until ${unheld.length === 1 ? 'it is' : 'they are'}, what it must hand out cannot be told (F127; F131 IT2b, client conformance).`,
      );
    }
    // F132 (U4, client conformance): once a complete ending of the
    // collective is held, a member's client signs no further one.
    const closed = (v.lawCurrent(specs, c.identity) as { closed: string | null } | null)?.closed;
    if (closed) {
      blocking.push(`The collective is already ended by ${short(closed)}: a member's client signs no further fork or closing of it (Law rule 47a; F132 U4, client conformance).`);
    }
    return { blocking, named: v.lawEndingActs(specs, c.identity) as string[] };
  }

  // ------------------------------------------------------------ founding

  prepareFound(a: { name: string; members: string[]; rules: Rules; words?: string; shares?: Record<string, number> }) {
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
    // F128: the founding terms name no relays; the relays are where the
    // collective's clients publish and look first, never a condition.
    const g: Governance = { ...rules, text: a.words?.trim() || standardWords(name || 'unnamed', rules) };
    // F124 S1: founding terms may carry each member's share of all the
    // collective's income, the collective written null, "this collective".
    if (a.shares && Object.keys(a.shares).length) {
      for (const k of Object.keys(a.shares)) if (!members.includes(k)) blocking.push(`${names(k)} is not a founder.`);
      const m = this.millionths(members, a.shares);
      if (m.problem) blocking.push(m.problem);
      g.stakes = [{ object: null, holders: m.pairs }];
    }
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
        ...(g.stakes ? [`Each founder's share of all the collective's income, in its founding terms, which name the collective as null, "this collective" (F124 S1): ${g.stakes[0].holders.map(([h, n]) => `${names(h!)} ${n / 10_000}%`).join(', ')}.`] : []),
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
    if (removedUnheld.length) {
      blocking.push(`${list(removedUnheld.map(names))} ${removedUnheld.length === 1 ? 'is' : 'are'} removed without resigning and not held by this program, so ${removedUnheld.length === 1 ? 'their voice remains' : 'their voices remain'} for this change, and ${removedUnheld.length === 1 ? 'they' : 'each'} cannot sign here.`);
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
    const g: Governance = c.departedAfter(
      { ...rules, releaseWords: current.releaseWords, text, stakes: current.stakes, splitGrant: current.splitGrant, departed: current.departed },
      members,
    );

    const holder = c.nextHolder(members);
    // The mark as Law asks it (rules 44c, 44d, 45a): the powers from the
    // agreement in force as Law finds it, each named with the voices Law
    // counts at the rotation, the members resigning first left out. A
    // version that also changes a judge names the judicial tier's rule too
    // (F122): Law's plan says so, not this client.
    const law = await this.lawOf(c);
    // Leaving the count too: a member declared absent while holding the
    // everyday key, whose declaration takes effect at this rotation (C7, B16).
    const recoveringOut = c.recovering().filter((d) => leave.has(d.member)).map((d) => d.member);
    const lm = this.lawMark(c, law, (m) => encodeTerms(collectiveTerms(g, members, holder, c.f.agreement, m)), [...resigning, ...recoveringOut], names);
    blocking.push(...lm.blocking);
    const mark: MarkEntry[] = lm.mark.length ? lm.mark : [{ power: { constitutional: true }, signers: staying.filter((m) => this.store.holds(m) && !departed.has(m)) }];
    const signersStaying = [...new Set(mark.flatMap((e) => e.signers))];
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
    const recovering = c.recovering().filter((d) => leave.has(d.member));
    const gone = [...leave].filter((l) => departed.has(l) && !recovering.some((d) => d.member === l));
    if (gone.length) summary.push(`${list(gone.map(names))} already left: their resignation, or the declaration of their absence, is on the collective's record, so nothing more is asked of them.`);
    for (const d of recovering) {
      const n = d.signatures?.length ?? 0;
      summary.push(
        `${names(d.member)} was declared absent while holding the everyday key: this rotation is where the declaration takes effect (Law, “Made before, made after”, C7, B16). ${n ? `It names the ${n === 1 ? 'other member’s signature act' : `${n} other members’ signature acts`} on the declaration beside the clone’s, so that they count there (Law draft 9, B18).` : 'Its signer alone met the number, so the rotation names no signature on it.'} The clone is counted without ${names(d.member)}.`,
      );
    }
    summary.push(
      `The members whose voice remains sign a clone of the agreement in force: a new version naming it, with ${members.length} members, marked with the constitutional change rule (Law rules 44c, 45a).`,
      `Then the collective rotates: its safety key, rebuilt from the shares of ${list(usedRebuilders.map(names)) || 'nobody'}, signs a rotation declaring the clone, and a new safety key is dealt to the new members only.`,
      'Once the homes count the rotation, the new rules apply, and anything the old key signs is void (F100).',
    );
    // The release area: who stepped down, and whether this change refits it (rule 37b).
    const releaseArea = (t: TermsRead) => t.areas.find((x) => x.id === RELEASE_AREA);
    const areaChanged = !!before && JSON.stringify(releaseArea(before.t)) !== JSON.stringify(releaseArea(after));
    const down = steppedDownOf(c).filter((d) => d.area === RELEASE_AREA && members.includes(d.member));
    const areaVoices = law.agreement ? (law.v.lawNextVoices(LAW_SPECS, c.identity, { form: 'area', area: RELEASE_AREA }, []) as { voices?: string[] }).voices : undefined;
    const areaFrozen = areaVoices ? !areaVoices.length : !releaseVoicesOf(c).length;
    if (down.length) {
      notes.push(
        areaChanged
          ? { text: `${list(down.map((d) => names(d.member)))} stepped down from the Releases area. This change redraws the area, so whoever it names as a holder and signs it holds the area again (Law rules 37b, 44d).` }
          : {
              text: `${list(down.map((d) => names(d.member)))} stepped down from the Releases area. This change leaves the area's entry as it is, so it does not refit the area (Law rule 37b): they stay stepped down${areaFrozen ? ', and the area stays frozen' : ''}. Change the number of members a release needs, or its holders, to refit it.`,
              tone: 'warn',
            },
      );
    }
    const warnings = resigning.length ? await this.unheard(c) : [];
    const reading: Reading = {
      title,
      summary,
      sections: [
        { heading: 'What changes', lines: [...changes, ...lm.lines, ...notes, ...warnings] },
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
          mark,
          // Law counts again, from what the relays and homes now hold, once
          // the resignations are registered and once the clone is signed:
          // nothing more is signed, and no rotation sent, unless Law would
          // count this mark (rules 44d, 45a).
          beforeClone: () => this.markHolds(col, mark, names, { leaving: recoveringOut }),
          beforeSend: (clone) => this.markHolds(col, mark, names, { clone, joining: join, leaving: recoveringOut }),
        });
        if (got.stopped) {
          if (got.record) {
            col.f.records = [...(col.f.records ?? []), got.record];
            col.f.departed = [...departedOf(col), ...got.resigned.map((r) => ({ member: r.member, resignation: r.act, record: got.record! }))];
          }
          this.store.saveCollective(col);
          for (const i of [...stay, ...joining, ...leaving]) this.store.saveIdentity(i);
          return {
            title: `${title}: stopped, nothing in force`,
            lines: [
              ...got.resigned.map((r) => ({ text: `Resignation ${r.act} by ${names(r.member)}, registered by record ${got.record}: they have left (Law rule 37a).` })),
              ...(got.clone ? [{ text: `Clone ${got.clone}, signed by ${got.signed.length}: a draft, never put in force; no rotation was sent.` }] : [{ text: 'No clone was proposed or signed.' }]),
              { text: `Law would not count it: ${got.stopped}`, tone: 'bad' as const },
            ],
            acts: [...got.resigned.map((r) => r.act), ...(got.record ? [got.record] : []), ...(got.clone ? [got.clone] : []), ...got.signed.map((x) => x.act)],
          };
        }
        if (got.record) {
          col.f.records = [...(col.f.records ?? []), got.record];
          col.f.departed = [...departedOf(col), ...got.resigned.map((r) => ({ member: r.member, resignation: r.act, record: got.record! }))];
        }
        // F189 (1): a member who left and is named again here has come back:
        // their departed entry is closed, so no later line registers their
        // old resignation again.
        if (join.length) col.f.departed = (col.f.departed ?? []).map((d) => (join.includes(d.member) && !d.returned ? { ...d, returned: got.clone ?? 'returned' } : d));
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

  /**
   * While the everyday key's holder is declared absent and not yet removed,
   * the collective draws no line with their key: the refit, the recovery
   * rotation, comes first (Law, “Made before, made after”, C7, B16, B18).
   */
  private awaitingRecovery(c: TestCollective, names: (id: string) => string): string[] {
    return c
      .recovering()
      .map(
        (d) =>
          `${names(d.member)}, who holds the collective's everyday key, was declared absent: the collective draws no line with their key. Refit it first (Change members: remove ${names(d.member)}); that rotation is where the declaration takes effect (Law, “Made before, made after”, C7, B16).`,
      );
  }

  /** The collective, its name here, and a member it holds, for the actions below. */
  private memberOf(collective: string, member: string, blocking: string[]) {
    const names = this.store.names();
    const c = this.store.collective(collective);
    const cname = this.store.book().collectives.find((x) => x.id === collective)?.name ?? short(collective);
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first. A record signed with the old everyday key would be void once it counts.');
    blocking.push(...this.awaitingRecovery(c, names));
    if (!c.f.members.includes(member)) blocking.push(`${names(member)} is not a member of “${cname}”.`);
    if (!this.store.holds(member)) blocking.push(`${names(member)} is not held by this program, so it cannot sign here.`);
    if (departedOf(c).some((d) => d.member === member)) blocking.push(`${names(member)} already left “${cname}”.`);
    return { c, cname, names };
  }

  /** Who decides, from a line on, in plain words: the constitution, the Releases area, other changes (rule 44d). */
  private decidersAfter(
    g: { constitution?: number; releaseThreshold: number; clone: number },
    voices: string[],
    releaseVoices: string[],
    names: (id: string) => string,
  ): Line[] {
    const out: Line[] = [
      {
        text: g.constitution
          ? `A change of the constitution (members, rules, keys, areas) needs ${anyOf(needed(g.constitution, voices.length), voices, names)}.`
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
    out.push({ text: `A change of who judges (the protected clauses) needs every member whose voice remains: ${list(voices.map(names)) || 'nobody'} (Law rule 46a, F121).` });
    out.push({ text: `Other changes need ${anyOf(needed(g.clone, voices.length), voices, names)}.` });
    return out;
  }

  /**
   * The drafts `member` signed and leaves behind (F207): every version of
   * this collective's agreement they signed by a signature act its relays
   * hold, other than `named` and the versions this device has seen in
   * force, sorted. The core finds each one's collective by its lineage.
   */
  private async draftsLeft(c: TestCollective, law: LawOf, member: string, named: string): Promise<string[]> {
    const hints = this.hintsOf(c);
    const out: string[] = [];
    for (const x of await signedBy(member, hints, this.via)) {
      if (x === named || x === law.agreement || c.f.agreements.includes(x)) continue;
      const a = await this.fetchAct(x, hints);
      if (!a) continue;
      const d = describeAct(a) as { spec?: string; type?: number };
      if (d.spec !== REPO_SPECS.law || d.type !== LAW_TYPES.terms) continue;
      try {
        law.v.add(a);
      } catch {
        // already held
      }
      try {
        if (law.v.lawCollectiveOf(LAW_SPECS, x) === c.identity) out.push(x);
      } catch {
        // its lineage not held: not shown as this collective's
      }
    }
    return out.sort();
  }

  /**
   * Leave a collective alone (Law rule 37a): the member signs a resignation
   * nobody else signs, and the collective registers it at once by a record,
   * its line. Nothing else changes: the members who stay refit the
   * collective afterwards (Change members), rotating to keys the member
   * who left never held. In a broken collective (Law rule 37d, F185) the
   * resignation names the agreement in force just before the broken act,
   * and no record is drawn: it takes effect at the collective's next valid
   * line, normally the rollback, which registers it. Where the member is
   * the last voice that remains, the review says so first, in plain words:
   * the works will be frozen (client conformance, F185). Leaving is never
   * blocked.
   */
  async prepareLeave(a: { collective: string; member: string }) {
    const blocking: string[] = [];
    const { c, cname, names } = this.memberOf(a.collective, a.member, blocking);
    const who = names(a.member);
    // Who remains, as Law counts it. Leaving is never blocked (rule 37a);
    // where Law has no count, the review says so.
    const law = await this.lawOf(c);
    const b = law.brokenAct;
    const n = await this.counted(c);
    // F187 (3): resignations published from other devices count only once a
    // line registers them, so Law's count still has them; the relays hold
    // them, and they are read too, so that the last voice is warned.
    const published = (law.agreement || b ? ((law.v.lawPublishedResignations(LAW_SPECS, c.identity) as { party: string }[]) ?? []) : []).map((d) => d.party);
    const otherDevices: string[] = [];
    const remaining = (vs: string[]) => {
      const out = vs.filter((m) => m !== a.member && !published.includes(m));
      for (const m of vs) if (m !== a.member && published.includes(m) && !otherDevices.includes(m)) otherDevices.push(m);
      return out;
    };
    let voices = remaining(n.voices);
    let last = n.voices.includes(a.member) && !voices.length;
    // F187 (4): the resignation names the agreement Law finds in force (in
    // a broken stretch, the one in force just before the broken act); this
    // device's copy only where Law cannot be read, and the review says so.
    const named = b ? b.before : (law.agreement ?? c.f.agreement);
    const blind = !b && !law.agreement;
    // F207 (client conformance): the drafts the member signed and leaves
    // behind are named in the resignation, so none of them ever brings
    // them back, whichever line puts it in force.
    const drafts = await this.draftsLeft(c, law, a.member, named);
    // In a broken stretch: who remains for the rollback, those whose
    // resignations it will register taken out (rules 37a, 37d, 44d).
    let rollbackLine: Line = { text: '' };
    if (b) {
      const waiting = departedOf(c).filter((d) => d.resignation && d.member !== a.member).map((d) => d.member);
      const rv = law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: 'judicial' }, waiting) as { error: string | null; voices: string[] };
      if (!rv.error) {
        voices = remaining(rv.voices);
        last = rv.voices.includes(a.member) && !voices.length;
      }
      const k = law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: 'constitutional' }, [...waiting, a.member]) as { error: string | null; voices: string[]; needed: number | null };
      rollbackLine = k.error
        ? { text: `Law cannot count who decides the rollback: ${k.error}.`, tone: 'warn' }
        : k.needed == null
          ? { text: 'Nobody would be left to roll the collective back: it would stay broken (Law rules 37d, 44d).', tone: 'bad' }
          : { text: `A rollback would need the constitutional change rule of the agreement before the broken act: ${anyOf(k.needed, k.voices, names)} (Law rules 37d, 44d).` };
    }
    // RB5 (decided 8 and 9 October 2026): where the constitutional change
    // rule names some members only, the last of them leaving freezes the
    // constitution while the others keep their voices in their areas: the
    // client says so too, before signing.
    let lastConstitutional = false;
    if (!last && voices.length && (law.agreement || b)) {
      const waiting = departedOf(c).filter((d) => d.resignation && d.member !== a.member).map((d) => d.member);
      const kv = (b
        ? law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: 'constitutional' }, waiting)
        : law.v.lawNextVoices(LAW_SPECS, c.identity, { form: 'constitutional' }, [])) as { error: string | null; voices: string[] };
      if (!kv.error && kv.voices.includes(a.member) && !remaining(kv.voices).length) lastConstitutional = true;
    }
    const releaseVoices = n.releaseVoices.filter((m) => m !== a.member);
    const mine = !!this.store.book().identities.find((i) => i.id === a.member)?.mine;
    const what: Line[] = [
      { text: `${who} keeps what they own, and stays bound by what they signed (Law rule 37a).` },
      { text: `A signature of theirs placed before the line still counts for what it signed: a release made before the line can still be completed with it (Law, “Made before, made after”, C1).` },
    ];
    if (c.f.signingHolder === a.member && !b) {
      what.push({ text: `${who} holds the collective's everyday key under its key grammar until the refit; here this program draws the line with it.`, tone: 'warn' });
    }
    what.push({ text: `${who}'s share of the current safety key exists until the refit; the rotation that follows fences it off (F100).`, tone: 'warn' });
    const then: Line[] = b
      ? [
          {
            text: `The members whose voice remains then roll the collective back (Roll back): a rotation declares a new version of the agreement in force just before the broken act, without ${who}, naming the broken act, and registers this resignation there (Law rules 37a, 37d).`,
          },
        ]
      : [
          {
            text: `The members who stay then refit the collective: Change members, removing ${who}, rotates it to keys ${who} never held, and deals the safety key afresh among those who stay (Law rule 37).`,
          },
        ];
    if (n.problem && !b) what.push({ text: n.problem, tone: 'warn' });
    if (voices.length && n.safety >= voices.length) {
      then.push({
        text: `With ${voices.length} member${voices.length === 1 ? '' : 's'} left, a safety key needing ${n.safety} of them would be lost with any one of them: the refit must ask fewer to rebuild it (F96).`,
        tone: 'warn',
      });
    }
    // Client conformance (Law rule 37a, F185): the last voice is told, in
    // plain words, before anything is signed.
    const fromElsewhere = otherDevices.length
      ? [`${list(otherDevices.map(names))} ${otherDevices.length === 1 ? 'has' : 'have'} signed a resignation that no line has registered yet, published from another device: once yours is registered with theirs, no voice remains.`]
      : [];
    const lastWords = [
      `${who} is the last voice that remains in “${cname}”: nobody else's voice counts there any more (Law rule 44d).`,
      ...fromElsewhere,
      `If ${who} leaves, the collective's works will be frozen as they stand: nobody will be able to change, release or move them, ever. Nothing can be decided in its name again${b ? ', and the collective can no longer be rolled back: it stays broken' : ''}.`,
      `${who} keeps their stake, as a departed holder (Law rule 46b). Someone with stakes in works worth keeping does not resign. Leaving is still ${who}'s alone to decide.`,
    ];
    const payload = resignationPayload(named, undefined, drafts.length ? drafts : undefined);
    const draftLines: Line[] = drafts.length
      ? [
          {
            text: `${who} signed ${drafts.length === 1 ? 'a version' : `${drafts.length} versions`} of the agreement that ${drafts.length === 1 ? 'is' : 'are'} not in force: ${list(drafts.map(short))}. The resignation names ${drafts.length === 1 ? 'it' : 'them'} as left behind, so that none ever brings ${who} back, whichever line puts ${drafts.length === 1 ? 'it' : 'one'} in force (F207).`,
          },
          { text: `A version ${who} signed that is not held at the collective's relays cannot be named here: if a line ever put it in force, it would bring ${who} back (F207, a stated cost).`, tone: 'warn' },
        ]
      : [
          {
            text: `No version of the agreement that ${who} signed and that is not in force was found at the collective's relays: the resignation names no draft. One signed elsewhere and not found here would bring ${who} back if a line ever put it in force (F207, a stated cost).`,
          },
        ];
    const summary = b
      ? [
          `Law reads “${cname}” as broken since the rotation ${short(b.act)}: ${b.reason}.`,
          `${who} signs a resignation from the agreement in force just before that broken act (${short(b.before)}), alone: nobody else's signature is asked for, and nobody can stop it (Law rule 37a).`,
          'No record is drawn: a record made while the collective is broken counts for nothing (Law rule 37d). The resignation takes effect at the collective\'s next valid line, normally the rollback, which registers it; from there, ' + `${who}'s signature counts toward no rule and no area of the collective.`,
          'Nothing else changes now: no rule is rewritten, no key rotates.',
        ]
      : [
          `${who} signs a resignation from the agreement in force (${short(named)}), alone: nobody else's signature is asked for, and nobody can stop it (Law rule 37a).`,
          `The collective then registers it at once by a record, its line, signed with its everyday key. From that line on, ${who}'s signature counts toward no rule and no area of the collective (F109).`,
          'Nothing else changes now: no rule is rewritten, no key rotates.',
        ];
    // BQ5 (decided by Nobody, allegedly, 9 October 2026): "It breaks, but
    // it only breaks one layer." Not a broken collective (Law rule 37d): no
    // rollback; a collective may choose to freeze its rules for good.
    const constitutionWords = [
      "You are about to break the collective's constitutional layer.",
      'Once you leave, nobody will be able to change its rules again.',
      'The other members keep acting in their areas.',
      `${who} holds the last constitutional voice that remains in “${cname}”: its constitutional change rule names no other member whose voice remains (Law rules 44c, 44d).`,
      `If ${who} leaves, its constitution freezes as it stands: nobody will be able to add or remove a member, redraw an area or change any rule of the constitution again${b ? ', and the collective can no longer be rolled back: it stays broken' : ''}. The other members keep their voices in their areas, under rules nobody can change.`,
      ...fromElsewhere,
      `${who} keeps their stake, as a departed holder (Law rule 46b). Leaving is still ${who}'s alone to decide.`,
    ];
    if (last) summary.unshift(...lastWords.slice(0, 2 + fromElsewhere.length));
    else if (lastConstitutional) summary.unshift(...constitutionWords.slice(0, 5));
    if (blind) {
      summary.unshift(
        law.broken
          ? `Law reads “${cname}” as broken with no way back by a rollback (${law.broken}): the resignation names this device's copy of the agreement in force (${short(named)}), which may not be the one Law finds; if it is not, no line can register it, and it must be signed again.`
          : `Law's own reading of “${cname}” could not be had (${law.unread ?? 'nothing found'}): the resignation names this device's copy of the agreement in force (${short(named)}), which may not be the one Law finds; if it is not, no line can register it, and it must be signed again.`,
        'No last-voice warning can be given without Law\'s count of the voices that remain: if this member is the last voice, the collective\'s works will be frozen as they stand.',
      );
    }
    const reading: Reading = {
      title: `${who} leaves “${cname}”`,
      summary,
      sections: [
        ...(last ? [{ heading: 'The last voice', lines: lastWords.map((text) => ({ text, tone: 'bad' as const })) }] : []),
        ...(lastConstitutional ? [{ heading: 'The last constitutional voice', lines: constitutionWords.map((text) => ({ text, tone: 'bad' as const })) }] : []),
        ...(b ? [{ heading: 'A broken collective', lines: [{ text: brokenWords(`“${cname}”`, b.reason), tone: 'warn' as const }] }] : []),
        { heading: 'What leaving means', lines: what },
        { heading: 'Drafts left behind', lines: draftLines },
        b ? { heading: 'Who decides the rollback', lines: [rollbackLine] } : { heading: 'Who decides from the line on', lines: this.decidersAfter(n, voices, releaseVoices, names) },
        { heading: 'Then', lines: then },
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${who} signs the resignation here: a test identity this program holds.` },
            ...(b ? [] : [{ text: "The collective's everyday key, kept in this program's folder, signs the record." }]),
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
      digest: digestOf('leave', a.collective, a.member, payload, last ? 'last voice' : lastConstitutional ? 'last constitutional voice' : ''),
      reading,
      depends: [a.collective, a.member],
      run: async () => {
        const col = this.store.collective(a.collective);
        const m = this.store.identity(a.member);
        const r = await resign(m, named, col.f.relays, undefined, drafts);
        this.store.saveIdentity(m);
        if (b) {
          col.f.departed = [...departedOf(col), { member: a.member, resignation: r.id, named }];
          this.store.saveCollective(col);
          return {
            title: `${who} left “${cname}”`,
            lines: [
              { text: `Resignation ${r.id}, signed by ${who} alone, from the agreement in force just before the broken act (${short(named)}).` },
              { text: 'No record was drawn: it takes effect at the collective\'s next valid line, normally the rollback, which registers it (Law rules 37a, 37d).', tone: 'ok' },
              ...(last ? [{ text: `${who} was the last voice: the collective's works are frozen as they stand.`, tone: 'warn' as const }] : []),
            ],
            acts: [r.id],
          };
        }
        const line = await record(col.id, { registers: [r.id], inForce: named }, col.f.relays);
        col.f.departed = [...departedOf(col), { member: a.member, resignation: r.id, named, record: line.id }];
        col.f.records = [...(col.f.records ?? []), line.id];
        this.store.saveCollective(col);
        return {
          title: `${who} left “${cname}”`,
          lines: [
            { text: `Resignation ${r.id}, signed by ${who} alone.` },
            { text: `Record ${line.id}: the collective's line, from which ${who}'s signature counts for nothing.`, tone: 'ok' },
            last
              ? { text: `${who} was the last voice: the collective's works are frozen as they stand.`, tone: 'warn' }
              : { text: `Next: the members who stay refit the collective (Change members: remove ${who}).` },
          ],
          acts: [r.id, line.id],
        };
      },
    });
  }

  /**
   * Roll a broken collective back (Law rule 37d, F185). Law reads it as
   * broken since a rotation whose declared agreement fails rule 37, the
   * broken act; a later rotation declares a new version of the agreement in
   * force just before it, naming the broken act, which stays shown and
   * counts for nothing. The new version is rebuilt from the rules this
   * device kept for that agreement, without the members whose
   * resignations the rollback registers. Its mark names that agreement's
   * constitutional change rule (and the judicial tier's rule where it
   * changes a judge), with the voices Law counts at the rollback; Law
   * counts again from the relays before the clone is proposed and before
   * the rotation is sent.
   */
  async prepareRollback(a: { collective: string; rules?: Rules }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const it = `“${cname}”`;
    const blocking: string[] = [];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    const law = await this.lawOf(c);
    const b = law.brokenAct;
    const title = `Roll ${it} back`;
    if (!b) {
      blocking.push(
        law.broken
          ? `Law reads ${it} as broken in a way a rollback cannot repair: ${law.broken}. There is no agreement in force before it to roll back to (Law rule 37d): nothing Law would accept ever existed, so the collective is simply founded again, as a new collective (F188).`
          : law.unread
            ? `Law's own reading of ${it} could not be had (${law.unread}), so whether it is broken cannot be told.`
            : `Law does not read ${it} as broken: there is nothing to roll back.`,
      );
      const reading: Reading = { title, summary: [], sections: [], plain: [], blocking };
      return this.plan({ kind: 'rollback', digest: digestOf('rollback', a.collective, 'nothing'), reading, depends: [a.collective], run: async () => ({ title, lines: [], acts: [] }) });
    }
    const hints = this.hintsOf(c);
    const before = await this.termsAct(b.before, hints);
    if (!before) blocking.push(`The agreement in force just before the broken act (${short(b.before)}) could not be fetched from ${hints.join(', ')}.`);
    const kept = c.f.rules?.[b.before];
    if (!kept) {
      blocking.push(`This device kept no copy of the rules of the agreement in force just before the broken act (${short(b.before)}), so it cannot rebuild it. Collectives founded or changed with this version keep them.`);
    }
    // The resignations the rollback registers: every resignation this
    // device holds by a party of that agreement whose voice Law still
    // counts there, naming that agreement or one it descends from.
    const lineage: string[] = [];
    for (let x: string | null = b.before; x; ) {
      lineage.push(x);
      x = (law.v.lawAgreement(LAW_SPECS, x) as { parent: string | null }).parent;
    }
    const all = law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: 'judicial' }, []) as { error: string | null; voices: string[] };
    if (all.error) blocking.push(`Law cannot count the voices that remain for the rollback: ${all.error}.`);
    const registering: { member: string; resignation: string; area?: number }[] = [];
    // F189 (1): a resignation its signer made before coming back (named
    // again by a version they signed) is spent: Law no longer lists it, and
    // the rollback never registers it. QF6 (F190): so is a stepping down
    // its signer made before holding the area again.
    const spent = (x: string) => /F189, 1|QF6/.test((law.v.lawRollbackRegisters(LAW_SPECS, c.identity, [x]) as { error: string | null }).error ?? '');
    for (const d of departedOf(c)) {
      if (!d.resignation || !all.voices?.includes(d.member) || spent(d.resignation)) continue;
      const nm = d.named ?? (await this.resignationNames(d.resignation, hints));
      if (nm && lineage.includes(nm)) registering.push({ member: d.member, resignation: d.resignation });
    }
    // Declarations of absence made during the broken stretch, with no
    // record: the rollback registers each, naming the other members'
    // signature acts on it beside it (RB3, decided 9 October 2026).
    const extra: Record<string, string[]> = {};
    for (const d of departedOf(c)) {
      if (!d.declaration || d.record || d.rollback || d.rotation || !all.voices?.includes(d.member)) continue;
      if (d.named && !lineage.includes(d.named)) continue;
      registering.push({ member: d.member, resignation: d.declaration });
      extra[d.declaration] = d.signatures ?? [];
    }
    // Steppings down signed during the broken stretch, with no record: the
    // rollback registers them too (Law rules 37a, 37b, 37d; F187, 8).
    for (const d of steppedDownOf(c)) {
      if (d.record || d.rollback || !all.voices?.includes(d.member) || spent(d.resignation)) continue;
      const nm = d.named ?? (await this.resignationNames(d.resignation, hints));
      if (nm && lineage.includes(nm)) registering.push({ member: d.member, resignation: d.resignation, area: d.area });
    }
    const leaving = registering.filter((r) => r.area === undefined).map((r) => r.member);
    const steppingDown = registering.filter((r) => r.area !== undefined).map((r) => r.member);
    const regs = registering.flatMap((r) => [r.resignation, ...(extra[r.resignation] ?? [])]);
    const declared = registering.filter((r) => extra[r.resignation]).map((r) => r.member);
    // F187 (2): Law, reading what the relays hold, checks every act the
    // rollback would register before anything is signed; a lost act would
    // make the whole rollback put nothing in force.
    if (regs.length) {
      const rr = law.v.lawRollbackRegisters(LAW_SPECS, c.identity, regs) as { error: string | null };
      if (rr.error) blocking.push(`Law refuses what the rollback would register: ${rr.error}. Every act it registers must be held at the collective's relays first: an act they lost is sent again (or, if this device no longer has it, signed again) before the rollback.`);
    }
    // F187 (1): the members after the rollback are the voices Law counts
    // there, never this device's copy of who was a member.
    const kept0 = c.rollbackRules(b.before, leaving, all.error ? undefined : all.voices);
    // New numbers, where the members give them: the rules before the broken
    // act may not fit the members left after the rollback (F96).
    let rules = kept0;
    if (kept0 && a.rules) {
      const g0 = kept0.governance;
      const next = { ...g0, ...fromRules(a.rules) };
      const text = g0.text === standardWords(cname, g0) ? standardWords(cname, next) : g0.text;
      rules = { ...kept0, governance: { ...next, text } };
    }
    // F187 (8): a member who stepped down during the stretch is left out
    // of the Releases area by the rollback's clone, which registers the
    // stepping down; named there and signing it, they would hold the area
    // again (Law rules 37b, 44d).
    if (rules && steppingDown.length) rules = { ...rules, governance: { ...rules.governance, releaseOut: [...new Set([...(rules.governance.releaseOut ?? []), ...steppingDown])] } };
    const members = rules?.members ?? [];
    if (rules && !members.length) blocking.push('Every member whose voice remains has resigned: nobody is left to roll the collective back, and its works stay frozen as they stand (Law rules 37a, 37d).');
    const fit = rules && members.length ? rulesHints(toRules(rules.governance), members.length) : [];
    if (fit.length) {
      blocking.push(`The rules ${a.rules ? 'given' : 'of the agreement before the broken act'} do not fit the ${members.length} member${members.length === 1 ? '' : 's'} left after the rollback. Give the rollback new numbers:`, ...fit);
    }
    // The mark: the constitutional change rule of that agreement, and the
    // judicial tier's rule where the new version changes a judge (rule 37d),
    // each with the voices Law counts at the rollback.
    const termsOf = (mark: MarkEntry[]) => encodeTerms(collectiveTerms(rules!.governance, rules!.members, rules!.holder, b.before, mark));
    const mark: MarkEntry[] = [];
    const lines: Line[] = [];
    if (rules && before && members.length && !fit.length) {
      // This device's copy must be the agreement the relays hold: rebuilt
      // with nobody leaving, it changes nothing.
      const same = kept0 ? c.rollbackRules(b.before, [])! : rules;
      const unchanged = encodeTerms(collectiveTerms(same.governance, same.members, same.holder, b.before, [{ power: { constitutional: true }, signers: [same.members[0]] }]));
      if ((lawClonePlan(before.payload, unchanged, LAW_SPECS) as { changes: unknown[] }).changes.length) {
        blocking.push(`This device's copy of the rules of ${short(b.before)} differs from the agreement the relays hold: a rollback rebuilt from it would change what nobody asked to change.`);
      }
      const needs = (lawRollbackPlan(before.payload, termsOf([{ power: { constitutional: true }, signers: [members[0]] }])) as { needs: { form: string; area?: number }[] }).needs;
      for (const nd of needs) {
        const power = powerOf(nd);
        const what = powerWords(power);
        const nv = law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: nd.form, area: nd.area }, leaving) as { error: string | null; voices: string[]; needed: number | null };
        if (nv.error) {
          blocking.push(`Law cannot count ${what} for the rollback: ${nv.error}.`);
          continue;
        }
        if (nv.needed == null) {
          blocking.push(`Nobody's voice remains for ${what}: no rollback can come into force (Law rules 37d, 44d).`);
          continue;
        }
        const held = nv.voices.filter((m) => this.store.holds(m));
        lines.push({ text: `Law counts, for ${what} of that agreement: ${anyOf(nv.needed, nv.voices, names)} (Law rules 37d, 44d). Its mark names ${list(held.map(names)) || 'nobody'}.` });
        if (held.length < nv.needed) {
          const away = nv.voices.filter((m) => !this.store.holds(m));
          blocking.push(`${cap(what)} needs ${anyOf(nv.needed, nv.voices, names)}; only ${held.length} of them sign here${away.length ? ` (${list(away.map(names))} ${away.length === 1 ? 'is' : 'are'} not held by this program)` : ''}.`);
        }
        mark.push({ power, signers: held });
      }
    }
    const payload = rules && members.length && !fit.length ? termsOf(mark.length ? mark : [{ power: { constitutional: true }, signers: [members[0]] }]) : new Uint8Array();
    const changes = before && payload.length ? readChanges(before.payload, payload, names) : [];
    // A rollback that redraws the Releases area gives it back to whoever it
    // names as a holder and signs it, a member who stepped down included
    // (Law rules 37b, 44d), as any change redrawing it does.
    if (steppingDown.length && before && payload.length) {
      const area = (t: TermsRead) => JSON.stringify(t.areas.find((x) => x.id === RELEASE_AREA));
      const holders = this.read(payload).areas.find((x) => x.id === RELEASE_AREA)?.holders ?? [];
      if (area(before.t) !== area(this.read(payload)) && steppingDown.some((m) => holders.includes(m))) {
        changes.push({ text: `${list(steppingDown.map(names))} stepped down from the Releases area, and this rollback redraws the area: whoever it names as a holder and signs it holds the area again (Law rules 37b, 44d).`, tone: 'warn' });
      }
    }
    const signers = [...new Set(mark.flatMap((e) => e.signers))];
    const rebuilders = c.f.safety.shares.filter((x) => this.store.holds(x.holder) && !leaving.includes(x.holder)).map((x) => x.holder);
    const usedRebuilders = rebuilders.slice(0, c.f.safety.threshold);
    if (rebuilders.length < c.f.safety.threshold) {
      blocking.push(`The rotation needs ${c.f.safety.threshold} shares of the collective's current safety key, the one the broken act dealt; only ${rebuilders.length} are held here by members who stay.`);
    }
    const reading: Reading = {
      title,
      summary: [
        `Law reads ${it} as broken since the rotation ${short(b.act)}, the broken act: ${b.reason}. Since then nothing signed in its name counts.`,
        `The way back is a rollback (Law rule 37d): a new rotation of the collective declares a new version of the agreement that was in force just before the broken act (${short(b.before)}), and names the broken act. The collective keeps its identity; nothing is erased.`,
        `It needs that agreement's constitutional change rule, counted among the voices that remain${leaving.length ? `; ${list(leaving.map(names))} resigned or ${leaving.length === 1 ? 'was' : 'were'} declared absent, and the rollback registers ${leaving.length === 1 ? 'that act' : 'those acts'}, so they no longer count` : ''}.`,
        ...(declared.length ? [`${list(declared.map(names))} ${declared.length === 1 ? 'was' : 'were'} declared absent during the broken stretch, under the clause of the agreement in force just before the broken act; the rollback registers ${declared.length === 1 ? 'that declaration' : 'those declarations'} with the other members' signatures on ${declared.length === 1 ? 'it' : 'them'}, exactly as a record would (RB3). Each is shown to the member it names, with the way to contest it.`] : []),
        ...(steppingDown.length ? [`${list(steppingDown.map(names))} stepped down from the Releases area during the broken stretch; the rollback registers ${steppingDown.length === 1 ? 'it' : 'them'} too (Law rules 37b, 37d).`] : []),
        `Members after the rollback: ${list(members.map(names)) || 'nobody'}.`,
      ],
      sections: [
        {
          heading: 'What changes from the agreement before the broken act',
          lines: !payload.length ? [{ text: 'Shown once the rollback can be made.' }] : changes.length ? changes : [{ text: 'Nothing: the rollback restores that agreement as it was.' }],
        },
        { heading: 'Who must sign', lines },
        {
          heading: 'What stays as it was',
          lines: [
            { text: `The broken act and every act signed in the collective's name since (records, releases, changes) stay shown, and count for nothing, for good (Law rule 37d). Sign again, after the rollback, what is still wanted.`, tone: 'warn' },
            { text: 'What a counterparty relied on during the broken stretch is signed anew after the rollback, never adopted (RB2). The collective keeps exactly what its rules before the break allowed, judged by the offer a payment names (BQ2, BQ3): a sale under an offer made before the break is kept, and what the collective owes for it is done once the rollback lets it act; a payment under an offer made during the stretch is owed back to its payer unless the sale is signed anew after the rollback, by a receipt of the collective for the same payment (RB2). Money owed back is a debt: the collective cannot close until those payers are settled (F189, 7). Grants made before the broken act work again after the rollback; what grantees signed during the stretch counts for nothing (RB1). The rollback restores every condition as at the act before the break.' },
          ],
        },
        {
          heading: 'Signed on this device',
          lines: [
            { text: `The new version is proposed by ${names(signers[0] ?? members[0] ?? '')} and signed by ${list(signers.map(names)) || 'nobody'}.` },
            { text: `The shares of ${list(usedRebuilders.map(names)) || 'nobody'} rebuild the collective's current safety key for the rotation; a new one is dealt to ${list(members.map(names)) || 'nobody'}.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
          ],
        },
      ],
      plain: payload.length ? [{ heading: 'The words after the rollback', text: this.read(payload).text }] : [],
      blocking,
    };
    return this.plan({
      kind: 'rollback',
      digest: digestOf('rollback', a.collective, b.act, payload, JSON.stringify({ registering, rebuilders: usedRebuilders, rules: a.rules ?? null })),
      reading,
      depends: [a.collective, ...signers],
      run: async () => {
        const col = this.store.collective(a.collective);
        const ids = signers.map((m) => this.store.identity(m));
        const got = await col.rollback({
          broken: b.act,
          before: b.before,
          leaving,
          registers: regs,
          voices: all.error ? undefined : all.voices,
          proposer: ids[0],
          signers: ids,
          rebuilders: usedRebuilders,
          mark,
          governance: rules!.governance,
          expect: payload,
          // Law counts again, from what the relays and homes hold, before
          // the clone is proposed and before the rotation is sent.
          beforeClone: () => this.rollbackHolds(col, b, mark, leaving, names, regs),
          beforeSend: (clone) => this.rollbackHolds(col, b, mark, leaving, names, regs, clone),
        });
        for (const i of ids) this.store.saveIdentity(i);
        if (got.stopped) {
          this.store.saveCollective(col);
          return stoppedDone(title, got);
        }
        col.f.departed = departedOf(col).map((d) => (registering.some((r) => r.resignation === (d.resignation ?? d.declaration)) ? { ...d, rollback: got.rotation } : d));
        col.f.steppedDown = steppedDownOf(col).map((d) => (registering.some((r) => r.resignation === d.resignation) ? { ...d, rollback: got.rotation } : d));
        this.store.saveCollective(col);
        const counts = await col.settle();
        if (counts) this.afterRefit(col, []);
        this.store.saveCollective(col);
        // F187 (2): done is what Law reads, from the relays, not what the
        // homes counted: the rotation counts in Identity even where the
        // rollback puts nothing in force in Law.
        const after = counts ? await this.lawOf(col) : null;
        const repaired = !!after && !after.broken && !after.unread && after.agreement === got.clone;
        const lawLine: Line | null = !after
          ? null
          : repaired
            ? null
            : {
                text: after.broken
                  ? `The homes took the rotation, but Law still reads the collective as broken: ${after.broken}. Nothing signed in its name counts yet.`
                  : `The homes took the rotation, but Law's own reading could not confirm the rollback (${after.unread ?? `it finds ${short(after.agreement ?? '')} in force`}).`,
                tone: 'bad',
              };
        return {
          title: !counts ? `${title}: waiting for the homes` : repaired ? `${title}: done` : `${title}: not repaired`,
          lines: [
            { text: `Clone ${got.clone} of ${short(b.before)}, signed by ${got.signed.length}.` },
            { text: `Rotation ${got.rotation}: the rollback, naming the broken act ${short(b.act)}${registering.length ? ` and registering ${registering.length === 1 ? 'one resignation' : `${registering.length} resignations`}` : ''}.` },
            ...got.sent.map((x) => ({
              text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
              tone: (x.result?.receipt ? 'ok' : 'bad') as Line['tone'],
            })),
            lawLine ??
              (counts
                ? { text: `Law reads the collective as working again. Members now: ${col.f.members.map(names).join(', ')}.`, tone: 'ok' }
                : { text: 'Not counted yet: too few homes took the rotation. Send it again once they are back (the same bytes; nothing new is signed).', tone: 'warn' }),
          ],
          acts: [got.clone, ...got.signed.map((x) => x.act), got.rotation],
        };
      },
    });
  }

  /** The agreement a resignation names (Law type 16, field 0), read from the act at the relays. */
  private async resignationNames(id: string, hints: string[]): Promise<string | null> {
    const a = await this.fetchAct(id, hints);
    if (!a) return null;
    const d = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
    if (d.spec !== REPO_SPECS.law || d.type !== LAW_TYPES.resignation || !d.payload) return null;
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const h = m instanceof Map ? m.get(0) : null;
    return h instanceof Uint8Array ? hex(h) : null;
  }

  /**
   * Before a rollback's clone is proposed, and again once it is signed,
   * before the rotation is sent: Law's own count from a fresh reading of
   * the relays and homes. Null when the collective is still broken at the
   * same act and the mark names, for each power, voices Law counts for the
   * rollback, and enough of them; with `clone`, also that Law finds it a
   * valid rollback with every signature it needs held.
   */
  private async rollbackHolds(c: TestCollective, b: BrokenAct, mark: MarkEntry[], leaving: string[], names: (id: string) => string, registers: string[], clone?: string): Promise<string | null> {
    const law = await this.lawOf(c);
    if (!law.brokenAct) return law.broken ? `Law reads the collective as broken in a way a rollback cannot repair: ${law.broken}.` : 'Law no longer reads the collective as broken: there is nothing to roll back.';
    if (law.brokenAct.act !== b.act || law.brokenAct.before !== b.before) return 'Law now reads another broken act: review the rollback again.';
    // F187 (2): every act the rollback registers, as Law reads it from the relays.
    if (registers.length) {
      const rr = law.v.lawRollbackRegisters(LAW_SPECS, c.identity, registers) as { error: string | null };
      if (rr.error) return `Law refuses what the rollback would register: ${rr.error}.`;
    }
    for (const e of mark) {
      const what = powerWords(e.power);
      const p = 'area' in e.power ? { form: 'area', area: e.power.area } : { form: Object.keys(e.power)[0] };
      const nv = law.v.lawRollbackVoices(LAW_SPECS, c.identity, p, leaving) as { error: string | null; voices: string[]; needed: number | null };
      if (nv.error) return `Law cannot count ${what}: ${nv.error}.`;
      const out = e.signers.filter((s) => !nv.voices.includes(s));
      if (out.length) return `The mark names ${list(out.map(names))} for ${what}, whose voice Law does not count there (rule 44d).`;
      if (nv.needed == null || e.signers.length < nv.needed) return `The mark names ${e.signers.length} for ${what}, but Law counts ${anyOf(nv.needed ?? 0, nv.voices, names)} there (rules 37d, 44d).`;
    }
    if (clone) {
      const a = law.v.lawRollbackAgreement(LAW_SPECS, clone) as { invalid: string | null; ready: boolean };
      if (a.invalid) return `Law finds the rollback's clone invalid: ${a.invalid}.`;
      if (!a.ready) return 'Not every signature the rollback needs is held at the relays yet.';
    }
    return null;
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
    // During a broken stretch (Law rules 37a, 37d; F187, 8): stepping down
    // is treated as resigning is: it names the agreement in force just
    // before the broken act, no record is drawn, and the rollback registers
    // it. Leaving an area is never blocked by the break.
    const law = await this.lawOf(c);
    const b = law.brokenAct;
    // The Releases area's holders whose voice remains, as Law counts them (rules 37b, 44d).
    const n = await this.counted(c);
    if (n.problem && !b) blocking.push(n.problem);
    let releaseVoices = n.releaseVoices.filter((m) => m !== a.member);
    let threshold = n.releaseThreshold;
    if (b) {
      const rv = law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: 'area', area: RELEASE_AREA }, []) as { error: string | null; voices: string[] };
      releaseVoices = rv.error ? [] : rv.voices.filter((m) => m !== a.member && !steppedDownOf(c).some((d) => d.member === m && d.area === RELEASE_AREA));
      threshold = c.f.rules?.[b.before]?.governance.releaseThreshold ?? threshold;
    }
    const named = b ? b.before : (law.agreement ?? c.f.agreement);
    const payload = resignationPayload(named, RELEASE_AREA);
    const area: Line[] = releaseVoices.length
      ? [
          {
            text: `The other holders carry on${b ? ' once the collective is rolled back' : ''}: a release needs ${anyOf(needed(threshold, releaseVoices.length), releaseVoices, names)}${releaseVoices.length < threshold ? `; the area asks for ${threshold}, and when fewer remain all of them together meet it (Law rule 44d)` : ''}.`,
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
      summary: b
        ? [
            `Law reads “${cname}” as broken since the rotation ${short(b.act)}: ${b.reason}.`,
            `${who} signs a resignation naming the Releases area (area ${RELEASE_AREA}) of the agreement in force just before that broken act (${short(b.before)}), alone: nobody else's signature is asked for (Law rules 37a, 37b).`,
            `No record is drawn: a record made while the collective is broken counts for nothing (Law rule 37d). The stepping down takes effect at the collective's next valid line, normally the rollback, which registers it; from there, ${who}'s signature counts for nothing in the Releases area.`,
            `${who} keeps the rest of their voice, as a member, and what they own.`,
          ]
        : [
            `${who} signs a resignation naming the Releases area (area ${RELEASE_AREA}), alone: nobody else's signature is asked for (Law rule 37b, “Stepping down at once”).`,
            `The collective registers it at once by a record, its line. From that line on, ${who}'s signature counts for nothing in the Releases area.`,
            `${who} keeps the rest of their voice, as a member, and what they own.`,
          ],
      sections: [
        { heading: 'The Releases area from the line on', lines: area },
        {
          heading: 'Signed on this device',
          lines: [
            { text: b ? `${who} signs the stepping down here; no record is drawn.` : `${who} signs the stepping down here; the collective's everyday key, kept in this program's folder, signs the record.` },
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
      digest: digestOf('stepdown', a.collective, a.member, payload, b ? 'broken' : ''),
      reading,
      depends: [a.collective, a.member],
      run: async () => {
        const col = this.store.collective(a.collective);
        const m = this.store.identity(a.member);
        const r = await resign(m, named, col.f.relays, RELEASE_AREA);
        this.store.saveIdentity(m);
        if (b) {
          col.f.steppedDown = [...steppedDownOf(col), { member: a.member, area: RELEASE_AREA, resignation: r.id, named }];
          this.store.saveCollective(col);
          return {
            title: `${who} stepped down from the Releases area`,
            lines: [
              { text: `Stepping down ${r.id}, signed by ${who} alone, from the agreement in force just before the broken act (${short(named)}).` },
              { text: "No record was drawn: it takes effect at the collective's next valid line, normally the rollback, which registers it (Law rules 37a, 37b, 37d).", tone: 'ok' },
            ],
            acts: [r.id],
          };
        }
        const line = await record(col.id, { registers: [r.id], inForce: named }, col.f.relays);
        col.f.steppedDown = [...steppedDownOf(col), { member: a.member, area: RELEASE_AREA, resignation: r.id, record: line.id }];
        col.f.records = [...(col.f.records ?? []), line.id];
        this.store.saveCollective(col);
        const after = await this.counted(col);
        const frozen = !after.problem && !after.releaseVoices.length;
        return {
          title: `${who} stepped down from the Releases area`,
          lines: [
            { text: `Stepping down ${r.id}, signed by ${who} alone.` },
            { text: `Record ${line.id}: the collective's line.`, tone: 'ok' },
            frozen
              ? { text: 'The Releases area has no holder left: it is frozen until the members refit it.', tone: 'warn' }
              : after.problem
                ? { text: after.problem, tone: 'bad' }
                : { text: `A release now needs ${anyOf(after.releaseNeeded, after.releaseVoices, names)}.` },
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
    blocking.push(...this.awaitingRecovery(c, names));
    if (!text) blocking.push('Write the words.');
    if (text && text === (c.f.governance.releaseWords ?? '')) blocking.push('Nothing changes: these are the area’s words already.');
    const g: Governance = { ...c.f.governance, releaseWords: text };
    // Who must sign, as Law counts the area's holders whose voice remains (rules 37b, 44d).
    const law = await this.lawOf(c);
    const lm = this.lawMark(c, law, (m) => encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, m)), [], names, 'needed');
    const areaCount = lm.counts.find((x) => 'area' in x.power);
    const voices: string[] = areaCount?.voices ?? [];
    const k = areaCount?.needed ?? 0;
    if (law.agreement && !law.broken && !voices.length) blocking.push('The Releases area is frozen: nobody holds it, so nobody can change its words until the members refit it (Law rule 37b).');
    else blocking.push(...lm.blocking);
    const signers = a.signers?.length ? [...new Set(a.signers)] : (lm.mark.find((e) => 'area' in e.power)?.signers ?? []);
    if (a.signers?.length) {
      for (const s of signers) {
        if (!voices.includes(s)) blocking.push(`${names(s)} does not hold the Releases area with a voice that remains, as Law counts it, so their signature cannot meet its power.`);
        else if (!this.store.holds(s)) blocking.push(`${names(s)} is not held by this program, so it cannot sign here.`);
      }
      if (voices.length && signers.length < k) blocking.push(`Its words change with ${anyOf(k, voices, names)}; only ${signers.length} sign here.`);
    }
    const mark: MarkEntry[] = [{ power: { area: RELEASE_AREA }, signers }];
    const payload = encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, mark));
    let changes: Line[] = [];
    let after: TermsRead | null = null;
    if (signers.length && text) {
      // Terms with nobody in the mark are not even in Law's format: read only what could be signed.
      after = this.read(payload);
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
        // Law rule 49: every clone carries the abandonment clause; shown before signing.
        ...absenceSection(after ?? { abandonment: collectiveClause(g.abandonmentOthers) }, names),
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
        const got = await col.changeReleaseWords({ words: text, proposer: ids[0], signers: ids, expect: payload, ...this.gates(col, mark, names) });
        if (got.stopped) {
          for (const i of ids) this.store.saveIdentity(i);
          return stoppedDone(`New words for the Releases area of “${cname}”`, got);
        }
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
   * rules 44a, 46a). The judicial tier changes only with every member's
   * signature, one version for everyone (Law draft 10, F121): marked with
   * that power, signed by every member whose voice remains, and written on
   * the collective's record at once with its everyday key: no rotation
   * (rule 37c, Q8).
   */
  async prepareAbsenceRule(a: { collective: string; others: number; signers?: string[] }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    blocking.push(...this.awaitingRecovery(c, names));
    const old = c.f.governance.abandonmentOthers;
    const others = whole(a.others, 'who judges absence');
    if (others === old) blocking.push('Nothing changes: this is who judges absence already.');
    const g: Governance = { ...c.f.governance, abandonmentOthers: others };
    const hints = rulesHints(toRules(g), c.f.members.length);
    // Every member whose voice remains, as Law counts them (rules 44d, 46a, F121).
    const law = await this.lawOf(c);
    const lm = hints.length ? null : this.lawMark(c, law, (m) => encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, m)), [], names);
    const voices: string[] = lm?.counts.find((x) => 'judicial' in x.power)?.voices ?? [];
    const signers = a.signers?.length ? [...new Set(a.signers)] : (lm?.mark.find((e) => 'judicial' in e.power)?.signers ?? []);
    if (lm) {
      if (a.signers?.length) {
        for (const s of signers) {
          if (!voices.includes(s)) blocking.push(`${names(s)} is not a member whose voice remains, as Law counts it, so their signature cannot meet the judicial tier's rule.`);
          else if (!this.store.holds(s)) blocking.push(`${names(s)} is not held by this program, so it cannot sign here.`);
        }
        const missing = voices.filter((v) => !signers.includes(v));
        if (missing.length) blocking.push(`A judicial change needs every member whose voice remains (Law rule 46a, F121); ${list(missing.map(names))} ${missing.length === 1 ? 'does' : 'do'} not sign here.`);
      } else blocking.push(...lm.blocking);
    }
    const mark: MarkEntry[] = [{ power: { judicial: true }, signers }];
    const payload = encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, mark));
    let changes: Line[] = [];
    let after: TermsRead | null = null;
    if (signers.length && !hints.length) {
      after = this.read(payload);
      const at = this.hintsOf(c);
      const before = await this.termsAct(c.f.agreement, at);
      if (!before) blocking.push(`The agreement in force (${short(c.f.agreement)}) could not be fetched from ${at.join(', ')}, so what changes cannot be shown.`);
      changes = before ? readChanges(before.payload, payload, names) : [];
      if (changes.some((l) => l.tone === 'bad')) blocking.push('Its mark does not name exactly the powers its changes need (F104).');
      blocking.push(...withLaw([], readAgreement(after, names, before?.t).blocking));
    } else if (!signers.length && !blocking.length) blocking.push('Nobody here can sign it.');
    blocking.unshift(...hints);
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
        `The clone is marked with the judicial tier's power and signed by ${list(signers.map(names))}: every member whose voice remains (Law rules 44c, 45a, 46a).`,
        'The judicial tier changes only with every member\'s signature, so there is one version for everyone: the new clause judges each member (Law draft 10, F121).',
        "The collective writes it on its record at once, signed with its everyday key: no rotation, no new keys (Law rule 37c, Q8).",
      ],
      sections: [
        { heading: 'What changes', lines: [...changes, ...notes, ...(await this.unheard(c))] },
        // Law rule 49: the clause as it will read, shown before signing.
        ...absenceSection(after ?? { abandonment: collectiveClause(others) }, names, 'If someone disappears, after the change'),
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
        const got = await col.changeAbsenceRule({ others, proposer: ids[0], signers: ids, expect: payload, ...this.gates(col, mark, names) });
        if (got.stopped) {
          for (const i of ids) this.store.saveIdentity(i);
          return stoppedDone(`Who judges absence in “${cname}”`, got);
        }
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

  /**
   * Declare a member absent (Law rules 49, 51, 53; F105, B12, B15), under
   * the collective's own rule: any k of the other members judge absence.
   * One of them signs the declaration, applying the clause the absent
   * member signed last, with outcome 0, their voice removed; the others
   * add signature acts naming it, as for terms; the collective registers it
   * at once by a record that acknowledges those signatures, its line. The
   * member keeps what they own. The members who remain then refit the
   * collective (Change members), as after a resignation.
   */
  /**
   * The member a declaration of absence names contests it (Law type 14,
   * rule 52; BQ4, decided by Nobody, allegedly, 9 October 2026): a contest
   * naming the declaration, signed by that member, which shows presence and
   * the dispute and voids nothing.
   */
  async prepareContest(a: { collective: string; declaration: string }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const shown = await this.shown(c);
    const d = (shown.declared ?? []).find((x) => x.act === a.declaration);
    const blocking: string[] = [];
    if (!d) blocking.push(`No declaration of absence ${short(a.declaration)} naming a member of “${cname}” is held here.`);
    const who = d ? names(d.member) : 'The member';
    if (d && !this.store.holds(d.member)) blocking.push(`${who} is not held by this program, so it cannot sign the contest here: only the member named signs it.`);
    if (d?.contests?.length) blocking.push(`${who} already contested it (${d.contests.map(short).join(', ')}).`);
    const reading: Reading = {
      title: `${who} contests the declaration of their absence from “${cname}”`,
      summary: [
        `${who} signs a contest of the declaration ${short(a.declaration)}${d ? `, signed by ${names(d.signer)}` : ''}: a Law act (type 14) naming it, signed by ${who} alone, which shows ${who} is present (Law rule 52).`,
        'It is published, and delivered to the one who signed the declaration. Everyone who reads the declaration sees the contest beside it.',
        `It voids nothing: the declaration stays as it is, and where a line of the collective registered it, ${who}'s voice stays removed. A voice removed comes back only by a later version of the agreement naming ${who}, signed under the collective's rules (F172).`,
      ],
      sections: [{ heading: 'Signed on this device', lines: [{ text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' }] }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'contest',
      digest: digestOf('contest', a.collective, a.declaration),
      reading,
      depends: [a.collective, ...(d ? [d.member] : [])],
      run: async () => {
        const col = this.store.collective(a.collective);
        const me = this.store.identity(d!.member);
        const x = await contest(me, { act: a.declaration, signer: d!.signer }, col.f.relays);
        this.store.saveIdentity(me);
        this.shownCache.delete(col.identity);
        return { title: `${who} contested the declaration`, lines: [{ text: `Contest ${x.id}, naming declaration ${a.declaration}.`, tone: 'ok' as const }], acts: [x.id] };
      },
    });
  }

  async prepareDeclare(a: { collective: string; member: string; signers?: string[] }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const who = names(a.member);
    const blocking: string[] = [];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first. A record signed with the old everyday key would be void once it counts.');
    if (!c.f.members.includes(a.member)) blocking.push(`${who} is not a member of “${cname}”.`);
    if (departedOf(c).some((d) => d.member === a.member)) blocking.push(`${who} has already left “${cname}”, or was already declared absent.`);
    blocking.push(...this.awaitingRecovery(c, names));
    // C7, B16, B18: the collective cannot draw its line without the holder
    // of its everyday key; the declaration takes effect at the recovery
    // rotation, which names the others' signature acts on it.
    // RB3 (decided 9 October 2026): during a broken stretch, the
    // declaration names the agreement in force just before the broken act,
    // under its clause, exactly as outside the stretch; no record is drawn,
    // and the rollback registers it, naming the others' signature acts.
    const law = await this.lawOf(c);
    const b = law.brokenAct;
    const holder = !b && c.f.signingHolder === a.member;
    const at = this.hintsOf(c);
    const named = b ? b.before : c.f.agreement;
    const clause = c.f.members.includes(a.member) ? await c.clauseOf(a.member, this.via, named) : null;
    const version = clause ? await this.termsAct(clause, at) : null;
    if (c.f.members.includes(a.member) && !clause) blocking.push(`${who} signed no version of the agreement that this program can find on ${at.join(', ')}.`);
    else if (clause && !version) blocking.push(`The version ${who} signed last (${short(clause)}) could not be fetched from ${at.join(', ')}, so its clause cannot be read.`);
    const ab = version?.t.abandonment;
    if (version && (!ab || ab.authority !== 'others' || !ab.threshold || !ab.outcomes.includes(0))) {
      blocking.push(`The clause ${who} signed does not let the other members remove a voice, so this client cannot declare it.`);
    }
    const k = ab?.threshold ?? c.f.governance.abandonmentOthers;
    // The other members whose voice remains, as Law counts them (rules 44d, 49).
    const n = await this.counted(c);
    if (n.problem && !b) blocking.push(n.problem);
    let others = n.voices.filter((m) => m !== a.member);
    if (b) {
      const waiting = departedOf(c).filter((d) => d.member !== a.member && !d.record && !d.rollback).map((d) => d.member);
      const rv = law.v.lawRollbackVoices(LAW_SPECS, c.identity, { form: 'judicial' }, waiting) as { error: string | null; voices: string[] };
      if (rv.error) blocking.push(`Law cannot count the other members whose voice remains for the rollback: ${rv.error}.`);
      others = (rv.voices ?? []).filter((m) => m !== a.member);
    }
    const need = needed(k, others.length);
    if (!others.length) blocking.push('No other member whose voice remains can judge absence.');
    const signers = a.signers?.length ? [...new Set(a.signers)] : others.filter((m) => this.store.holds(m)).slice(0, need);
    for (const s of signers) {
      if (!others.includes(s)) blocking.push(`${names(s)} is not one of the other members whose voice remains, so their signature cannot count toward the declaration.`);
      else if (!this.store.holds(s)) blocking.push(`${names(s)} is not held by this program, so it cannot sign here.`);
    }
    if (others.length && signers.length < need) blocking.push(`The declaration needs ${anyOf(need, others, names)} (the clause ${who} signed); only ${signers.length} sign here.`);
    const payload: Uint8Array = clause ? await c.declarationFor(a.member, this.via, named) : new Uint8Array();
    const [by, ...cosigners] = signers;
    const voices = others;
    const releaseVoices = n.releaseVoices.filter((m) => m !== a.member);
    const reading: Reading = {
      title: `${who} is declared absent from “${cname}”`,
      summary: [
        ...(b ? [`Law reads “${cname}” as broken since the rotation ${short(b.act)}: ${b.reason}.`] : []),
        `${by ? names(by) : 'One of the other members'} signs a declaration that ${who} is absent, with one outcome: ${who}'s voice removed (Law rules 49, 51, 53; F105). It applies the clause ${who} signed last (${clause ? short(clause) : 'none'}), and names the agreement in force${b ? ' just before the broken act' : ''} (${short(named)}): a declaration can never pick a friendlier clause (Law rule 46a).`,
        need > 1
          ? `The clause asks for ${anyOf(need, others, names)}: ${list(cosigners.map(names)) || 'nobody else'} add${cosigners.length === 1 ? 's' : ''} a signature act naming it, as for terms. It counts once ${need} have signed (Law draft 8, B15).`
          : `The clause asks for one of the other members${k > need ? ` (it names ${k}, and when fewer remain all of them together meet it, Law rule 44d)` : ''}: ${by ? names(by) : 'one of them'} alone.`,
        b
          ? `No record is drawn: a record made while the collective is broken counts for nothing (Law rule 37d). The rollback registers the declaration${cosigners.length ? ', naming those signature acts beside it, so that they count there' : ''}, exactly as a record would outside the broken stretch (RB3): from the rollback on, ${who}'s signature counts toward no rule and no area, and ${who} no longer blocks the way back.`
          : holder
          ? `${who} holds the collective's everyday key, so the collective cannot draw its line without them: no record is made now. The declaration takes effect at the recovery rotation, the member change that removes ${who} (Change members), which rotates the collective to keys ${who} never held${cosigners.length ? ' and names those signature acts beside the clone’s, so that they count there' : ''} (Law, “Made before, made after”, C7, B16; Law draft 9, B18). From that rotation on, ${who}'s signature counts toward no rule and no area.`
          : `The collective registers it at once by a record, its line, signed with its everyday key${cosigners.length ? ', acknowledging those signatures so that they count at the line' : ''}. From that line on, ${who}'s signature counts toward no rule and no area (F109).`,
        `${who} keeps what they own: outcome 0 removes the voice, never the stake. ${who} may contest it (Law rule 52); a contest is shown alongside it and changes nothing by itself. ${who}'s client shows ${who} this declaration, with the way to contest it (client conformance, RB3).`,
      ],
      sections: [
        {
          heading: 'What stands',
          lines: [
            { text: `A signature of ${who}'s placed before the line still counts for what it signed: a release made before the line can still be completed with it (Law, “Made before, made after”, C1).` },
            { text: `${who}'s share of the current safety key exists until the refit; the rotation that follows fences it off (F100).`, tone: 'warn' },
          ],
        },
        { heading: 'Who decides from the line on', lines: this.decidersAfter(n, voices, releaseVoices, names) },
        {
          heading: 'Then',
          lines: [{ text: `The members who remain refit the collective: Change members, removing ${who}, rotates it to keys ${who} never held (Law rules 37, 53).` }],
        },
        {
          heading: 'Signed on this device',
          lines: [
            {
              text: holder
                ? `${list(signers.map(names)) || 'Nobody'} sign${signers.length === 1 ? 's' : ''} here; the collective's everyday key signs nothing now.`
                : `${list(signers.map(names)) || 'Nobody'} sign${signers.length === 1 ? 's' : ''} here; the collective's everyday key, kept in this program's folder, signs the record.`,
            },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
            ...(await this.unheard(c)),
          ],
        },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'declare',
      digest: digestOf('declare', a.collective, a.member, ...signers, payload, b ? b.act : ''),
      reading,
      depends: [a.collective, ...signers.filter((s) => this.store.holds(s))],
      run: async () => {
        const col = this.store.collective(a.collective);
        const ids = signers.map((s) => this.store.identity(s));
        const got = await col.declareAbsent({ member: a.member, by: ids[0], cosigners: ids.slice(1), expect: payload, via: this.via, ...(b ? { broken: { before: b.before } } : {}) });
        this.store.saveCollective(col);
        for (const i of ids) this.store.saveIdentity(i);
        return {
          title: `${who} was declared absent from “${cname}”`,
          lines: [
            { text: `Declaration ${got.declaration}, signed by ${names(signers[0])}.` },
            ...got.signed.map((x) => ({ text: `Signature ${x.act}, by ${names(x.member)}, naming the declaration.` })),
            got.record
              ? { text: `Record ${got.record}: the collective's line, from which ${who}'s signature counts for nothing.`, tone: 'ok' as const }
              : b
                ? { text: 'No record: the collective is broken. The rollback registers the declaration (Law rule 37d, RB3).', tone: 'ok' as const }
                : { text: `No record: ${who} holds the everyday key. The declaration takes effect at the recovery rotation.`, tone: 'warn' as const },
            {
              text: got.record
                ? `Next: the members who remain refit the collective (Change members: remove ${who}).`
                : `Next: the members who remain refit the collective (Change members: remove ${who}); that rotation names the signatures on the declaration (Law draft 9, B18).`,
            },
          ],
          acts: [got.declaration, ...got.signed.map((x) => x.act), ...(got.record ? [got.record] : [])],
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
    if (v.law?.kind === 'broken') blocking.push(`No signature can make it a release. ${v.problems.find((p) => p.startsWith('Law reads') || p.startsWith('It was published while'))}.`);
    else if (!v.manifest || !onlyUnsigned) blocking.push(`The release does not check: ${v.problems.join('; ')}`);
    const checks: Line[] = [];
    if (v.agreement) {
      const t = await this.termsAct(v.agreement, at);
      if (t && !t.t.parties.includes(member.id)) {
        blocking.push(`${names(member.id)} is not a member under the agreement in force when it was signed: their signature would not count.`);
      } else if (v.collective && this.store.isCollective(v.collective)) {
        // Left, or stepped down, on the collective's line: counted only for an act made before it (F109, C1).
        const col = this.store.collective(v.collective);
        const seq = col.f.identity.sequence;
        const before = (d: { record?: string; at?: number }) =>
          seq.includes(a.release) &&
          (d.record ? seq.indexOf(a.release) < seq.indexOf(d.record) : d.at === undefined || seq.indexOf(a.release) < d.at);
        const left = departedOf(col).find((d) => d.member === member.id);
        const down = steppedDownOf(col).find((d) => d.member === member.id && d.area === RELEASE_AREA);
        for (const [d, words, rule] of [
          [left, left?.declaration ? 'was declared absent' : 'left the collective', left?.declaration ? '53' : '37a'],
          [down, 'stepped down from the Releases area', '37b'],
        ] as const) {
          if (!d) continue;
          if (before(d)) {
            checks.push({ text: `${names(member.id)} ${words} after this release was made: their signature still counts for it (Law, “Made before, made after”, C1).` });
          } else {
            const line = d.record ? `record ${short(d.record)}` : `the recovery rotation${'rotation' in d && d.rotation ? ` ${short(d.rotation)}` : ''}`;
            blocking.push(`${names(member.id)} ${words}: from the collective's line (${line}) their signature counts for nothing there, and this release comes after that line (Law rule ${rule}, F109).`);
          }
        }
      }
    } else if (v.manifest && v.law?.kind === 'not-collective') {
      blocking.push('It is published under its signer’s own name, not by a collective: no member’s signature is asked for.');
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

  // ------------------------------------------------------------ money and endings (Law draft 10: F121 to F124)

  /** Why nothing more can be done in a collective a fork or closing ended (Law rule 47a, F121, F124 N9). */
  private closedBlock(c: TestCollective): string[] {
    return c.f.closed
      ? [`The collective was closed by its fork or closing (${short(c.f.closed)}): what its keys sign afterwards counts for nothing in Law (rule 47a).`]
      : [];
  }

  /**
   * A verifier holding these identities' chains and every act their relays
   * hold, and the collective's own splits with their keys: what the core
   * library judges the money and endings with. An obligation a collective
   * signed binds it once done, sealed to every member, wherever it is held
   * (F128, withdrawing N13's public outside).
   */
  private async lawVerifier(c: TestCollective, ids: string[]): Promise<{ v: Verifier; specs: typeof LAW_SPECS }> {
    const v = new Verifier(SPECS.identity, MIPS.finance, MIPS.law);
    const hints = this.hintsOf(c);
    // The relays are where this program looks first (client conformance);
    // where it found an act is never a condition of its validity (F128).
    for (const id of new Set(ids)) {
      try {
        await lookUp(id, hints, this.via, v);
      } catch {
        // not found: its acts cannot count
      }
      for (const hint of hints) {
        for (const a of await allBy(id, [hint], this.via)) {
          try {
            v.add(a);
          } catch {
            // a private act: added below with its key where this program holds it
          }
        }
      }
    }
    // The collective's splits and debts, and the debts of every collective
    // this program holds: a successor owes those the fork of the collective
    // it was forked from handed to it (F124 N13, F127).
    const debts = this.store.book().collectives.flatMap((x) => (x.id === c.identity || !this.store.isCollective(x.id) ? [] : (this.store.collective(x.id).f.debts ?? [])));
    for (const sp of [...(c.f.splits ?? []), ...(c.f.debts ?? []), ...(c.f.notices ?? []).map((n) => ({ id: n.notice, key: n.key })), ...debts]) {
      const a = await this.fetchAct(sp.id, hints);
      if (a) {
        try {
          v.addWithKey(a, unb64(sp.key));
        } catch {
          // already held
        }
      }
    }
    return { v, specs: LAW_SPECS };
  }

  /** The debts a collective signed, and those of the collectives it was forked from, which their forks handed to its successors (F124 N13, F127); the core says who owes each. */
  private debtsOf(c: TestCollective): { id: string; creditor: string; inherited: boolean; debtor: string }[] {
    const out = (c.f.debts ?? []).map((d) => ({ id: d.id, creditor: d.creditor, inherited: false, debtor: c.identity }));
    let from = c.f.governance.forkedFrom;
    for (let depth = 0; from && this.store.isCollective(from) && depth < 64; depth++) {
      const o = this.store.collective(from);
      out.push(...(o.f.debts ?? []).map((d) => ({ id: d.id, creditor: d.creditor, inherited: true, debtor: o.identity })));
      from = o.f.governance.forkedFrom;
    }
    return out;
  }

  /** Everyone a collective's money concerns: its members, departed holders, its successors, the identities and collectives held here. */
  private concerned(c: TestCollective): string[] {
    const b = this.store.book();
    return [c.identity, ...c.f.members, ...(c.f.governance.departed ?? []), ...b.identities.map((i) => i.id), ...b.collectives.map((x) => x.id)];
  }

  /** The collective's stake in itself (object null, F124 S1), as its terms carry it (F121, Q8). */
  private ownStake(c: TestCollective): [string, number][] {
    return (c.f.governance.stakes?.find((x) => x.object === null)?.holders ?? []).filter((x): x is [string, number] => x[0] !== null);
  }

  /** The index of a stake in the terms as encoded: the collective's own (null) first, then works by hash. */
  private stakeIndex(c: TestCollective, object: string | null): number {
    const key = (o: string | null) => (o === null ? '' : o);
    return [...(c.f.governance.stakes ?? [])].sort((x, y) => (key(x.object) < key(y.object) ? -1 : 1)).findIndex((x) => x.object === object);
  }

  /** The work hash a release of the collective carries (its publication's media, field 1). */
  private async workOf(c: TestCollective, release: string): Promise<{ work: string; key: Uint8Array } | null> {
    const a = await this.fetchAct(release, this.hintsOf(c));
    if (!a) return null;
    const d = describeAct(a) as { payload?: Uint8Array };
    if (!d.payload) return null;
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const w = m.get(1);
    const k = m.get(5);
    return w instanceof Uint8Array && k instanceof Uint8Array ? { work: hex(w), key: k } : null;
  }

  /** Shares typed in percent, as millionths summing to 1,000,000, rounding to the first listed (rule 15a); or why not. */
  private millionths(holders: string[], shares: Record<string, number>): { pairs: [string, number][]; problem?: string } {
    const pairs = holders.map((h) => [h, Math.round((shares[h] ?? 0) * 10_000)] as [string, number]).filter(([, n]) => n > 0);
    const total = pairs.reduce((x, [, n]) => x + n, 0);
    if (!pairs.length) return { pairs, problem: 'Give at least one holder a share.' };
    if (total !== 1_000_000) {
      if (Math.abs(total - 1_000_000) <= holders.length) pairs[0][1] += 1_000_000 - total;
      else return { pairs, problem: `The shares add up to ${total / 10_000}%, not 100%.` };
    }
    return { pairs };
  }

  /**
   * The collective's stakes (terms field 7, F121 Q8): each member's and
   * departed holder's share of all its income, in percent, and the
   * collective's ownership of every release it published, both written
   * with null for the collective itself (F124 S1). An ordinary change
   * under the clone rule, recorded at once; every member whose voice
   * remains signs it, and no holder's share is lowered without them
   * (rule 46).
   */
  async prepareStakes(a: { collective: string; shares: Record<string, number> }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [...this.closedBlock(c)];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    blocking.push(...this.awaitingRecovery(c, names));
    // The members whose voice remains, as Law reads the collective (rule 44d).
    const law = await this.lawOf(c);
    const voices = law.terms ? law.terms.t.parties.filter((p) => !law.departed.includes(p)) : voicesOf(c);
    const departed = c.f.governance.departed ?? [];
    const holders = [...voices, ...departed];
    for (const k of Object.keys(a.shares)) if (!holders.includes(k)) blocking.push(`${names(k)} is neither a member whose voice remains nor a departed holder.`);
    const m = this.millionths(holders, a.shares);
    if (m.problem) blocking.push(m.problem);
    const millionths = m.pairs;
    for (const [h, n] of this.ownStake(c)) {
      if (!departed.includes(h)) continue;
      const now = millionths.find(([x]) => x === h)?.[1] ?? 0;
      if (now < n) blocking.push(`${names(h)} left keeping ${n / 10_000}%: a stake never shrinks without its holder's signature (Law rule 46), which this change does not carry.`);
    }
    const missing = voices.filter((x) => !this.store.holds(x));
    if (missing.length) blocking.push(`${list(missing.map(names))} cannot sign here, and every member's share is set with their signature (Law rule 13).`);
    const works: Stake[] = [];
    for (const r of c.f.releases) {
      const w = await this.workOf(c, r.id);
      if (w && !works.some((x) => x.object === w.work)) works.push({ object: w.work, holders: [[null, 1_000_000]] });
    }
    const stakes: Stake[] = [{ object: null, holders: millionths }, ...works];
    const g: Governance = { ...c.f.governance, stakes };
    const lm = this.lawMark(c, law, (mk) => encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, mk)), [], names);
    blocking.push(...lm.blocking);
    const signers = lm.mark.find((e) => 'clone' in e.power)?.signers ?? voices.filter((x) => this.store.holds(x));
    const mark: MarkEntry[] = lm.mark.length ? lm.mark : [{ power: { clone: true }, signers }];
    const payload = encodeTerms(collectiveTerms(g, c.f.members, c.f.signingHolder, c.f.agreement, mark));
    if (!blocking.length) blocking.push(...withLaw([], readAgreement(this.read(payload), names).blocking));
    const reading: Reading = {
      title: `The stakes in “${cname}”`,
      summary: [
        'A stake whose object is the collective itself is a share of all its income, whoever earns it and whenever (Law draft 10, F121 Q8); the terms write the collective as null, "this collective" (F124 S1).',
        ...millionths.map(([h, n]) => `${names(h)}: ${n / 10_000}% of all the collective's income${departed.includes(h) ? ', as a departed holder: no voice; the stakes, not the departed entry, decide what they are paid (F124 N5)' : ''}.`),
        works.length ? `The collective owns ${count(works.length, 'release')} it published, each wholly: its income is shared by the stakes above.` : 'The collective has published no release yet.',
        'Every payout of a split must match its stake exactly, within one smallest unit of rounding, every fee alike for every stake (F124 N10).',
        "An ordinary change outside every area, under the clone rule, written on the collective's record at once; no rotation (Law rules 37c, 44c).",
      ],
      sections: [
        // Law rule 49: the clone carries the abandonment clause, unchanged; shown before signing.
        ...absenceSection({ abandonment: collectiveClause(g.abandonmentOthers) }, names),
        {
          heading: 'Signed on this device',
          lines: [
            { text: `${list(signers.map(names))} sign the clone; the collective's everyday key signs the record.` },
            { text: 'Every member here is a test identity held by this program: their consent is simulated (test only).', tone: 'warn' },
          ],
        },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'stakes',
      digest: digestOf('stakes', a.collective, payload),
      reading,
      depends: [a.collective, ...signers],
      run: async () => {
        const col = this.store.collective(a.collective);
        const ids = signers.map((x) => this.store.identity(x));
        const got = await col.setStakes({ stakes, proposer: ids[0], signers: ids, expect: payload, ...this.gates(col, mark, names) });
        if (got.stopped) {
          for (const i of ids) this.store.saveIdentity(i);
          return stoppedDone(`The stakes in “${cname}”`, got);
        }
        col.f.records = [...(col.f.records ?? []), got.record];
        this.store.saveCollective(col);
        for (const i of ids) this.store.saveIdentity(i);
        return {
          title: `The stakes in “${cname}” are set`,
          lines: [{ text: `Clone ${got.clone}, recorded by ${got.record}.`, tone: 'ok' }],
          acts: [got.clone, ...got.signed.map((x) => x.act), got.record],
        };
      },
    });
  }

  /**
   * Name a split service (terms field 14, by a grant of the collective): a
   * judicial change, every member whose voice remains signing it (rule
   * 46a). Here the service is a test identity held by this program.
   */
  async prepareSplitService(a: { collective: string; service: string }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [...this.closedBlock(c)];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    blocking.push(...this.awaitingRecovery(c, names));
    if (!this.store.holds(a.service) || this.store.isCollective(a.service)) blocking.push('The split service must be a test identity this program holds (it is simulated here).');
    // Every member whose voice remains, as Law counts them (rules 44d, 46a,
    // F121); the grant is made at signing, so its place is held by zeros here:
    // who must sign does not depend on which grant is named.
    const law = await this.lawOf(c);
    const lm = this.lawMark(c, law, (m) => encodeTerms(collectiveTerms({ ...c.f.governance, splitGrant: '0'.repeat(64) }, c.f.members, c.f.signingHolder, c.f.agreement, m)), [], names);
    blocking.push(...lm.blocking);
    const voices = lm.mark.flatMap((e) => e.signers);
    const reading: Reading = {
      title: `A split service for “${cname}”`,
      summary: [
        `The collective grants ${names(a.service)} the right to receive its payments and split them (Law rule 18).`,
        'The split service is a judicial clause: every member whose voice remains signs it, one version for everyone (Law rule 46a, F121).',
        "From then on the collective's payee pointer counts, for Law, only if every address in it is also in the split service's own signed pointer, and every entry of its vault in the service's own vault (Law rule 18, F123, F124 P2); a Law client shows any other as bypassing the split.",
        'Every split is delivered to every holder it pays, and names each fee and who received it (F121, Q9). A collective naming no split service is paid payer-side instead: a wallet reading Law pays each holder by the stakes (F124 P2).',
        `The grant hands ${names(a.service)} a grant key: a key of the collective scoped to the grant, which the service makes and keeps, and signs to accept (F128). What the service signs with it, its receipts among them, is the collective's own act, a strand of its actions chain; a revocation removes the key.`,
      ],
      sections: [
        // Law rule 49: the clone carries the abandonment clause, unchanged; shown before signing.
        ...absenceSection({ abandonment: collectiveClause(c.f.governance.abandonmentOthers) }, names),
        { heading: 'Signed on this device', lines: [{ text: 'The collective signs the grant; every member signs the clone; the collective records it. Test identities: consent simulated.', tone: 'warn' }] },
      ],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'split-service',
      digest: digestOf('split-service', a.collective, a.service, c.f.agreement),
      reading,
      depends: [a.collective, ...voices],
      run: async () => {
        const col = this.store.collective(a.collective);
        // F128: the service makes its grant key and keeps its secret; the
        // grant names its public part; the service signs to accept it.
        const service = this.store.identity(a.service);
        const key = service.makeGrantKey();
        const g = await col.id.publish(REPO_SPECS.law, LAW_TYPES.grant, grantPayload(a.service, key.public), { public: true, relays: col.f.relays });
        service.keepGrantKey(g.id, col.id.id, key.secret);
        await lawSign(service, g.id, col.f.relays);
        this.store.saveIdentity(service);
        const ids = voices.map((x) => this.store.identity(x));
        const got = await col.nameSplitService({ grant: g.id, proposer: ids[0], signers: ids, ...this.gates(col, lm.mark, names) });
        if (got.stopped) {
          for (const i of ids) this.store.saveIdentity(i);
          return stoppedDone(`A split service for “${cname}”`, got);
        }
        col.f.records = [...(col.f.records ?? []), got.record];
        this.store.saveCollective(col);
        for (const i of ids) this.store.saveIdentity(i);
        return {
          title: `${names(a.service)} is the split service of “${cname}”`,
          lines: [
            { text: `Grant ${g.id}.` },
            { text: `Clone ${got.clone}, signed by every member, recorded by ${got.record}.`, tone: 'ok' },
          ],
          acts: [g.id, got.clone, ...got.signed.map((x) => x.act), got.record],
        };
      },
    });
  }

  /** Publish a payee pointer (Finance type 0) for an identity or a collective this program holds: its addresses on the test rail. */
  async preparePointer(a: { owner: string; addresses: string[] }) {
    const names = this.store.names();
    const isCol = this.store.isCollective(a.owner);
    const blocking: string[] = [];
    if (!isCol && !this.store.holds(a.owner)) blocking.push('This program does not hold that identity.');
    if (isCol) blocking.push(...this.closedBlock(this.store.collective(a.owner)));
    const addresses = a.addresses.map((x) => x.trim()).filter(Boolean);
    if (!addresses.length) blocking.push('Give at least one address.');
    const hints = isCol ? this.hintsOf(this.store.collective(a.owner)) : this.store.settings().relays;
    let previous: string | undefined;
    let version = 1;
    for (const x of await allBy(a.owner, hints, this.via)) {
      try {
        const d = describeAct(x) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
        if (d.spec !== MIPS.finance || d.type !== FINANCE_TYPES.pointer || !d.payload) continue;
        const v = (cborDecode(d.payload) as Map<number, unknown>).get(1) as number;
        if (v >= version) {
          version = v + 1;
          previous = d.id;
        }
      } catch {
        // not a pointer
      }
    }
    const payload = pointerPayload({
      payee: a.owner,
      version,
      previous,
      rails: addresses.map((x) => [TEST_RAIL, new TextEncoder().encode(x)]),
    });
    const reading: Reading = {
      title: `A payee pointer for ${names(a.owner)}`,
      summary: [
        `Version ${version}: payments to ${names(a.owner)} go to ${list(addresses.map((x) => `“${x}”`))}, on a test rail (no real money).`,
        isCol
          ? "Where the collective's agreement names a split service, this pointer counts for Law only if every address in it is also in the service's own pointer, and every entry of its vault in the service's own vault (Law rule 18, F123, F124 P2). A wallet reading only Finance cannot check it (cost stated)."
          : 'An ordinary pointer of a test identity.',
      ],
      sections: [],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'pointer',
      digest: digestOf('pointer', a.owner, payload),
      reading,
      depends: [a.owner],
      run: async () => {
        if (isCol) {
          const col = this.store.collective(a.owner);
          const x = await col.id.publish(MIPS.finance, FINANCE_TYPES.pointer, payload, { public: true, relays: col.f.relays });
          col.f.pointers = [...(col.f.pointers ?? []), x.id];
          this.store.saveCollective(col);
          return { title: 'The pointer is published', lines: [{ text: `Pointer ${x.id}, version ${version}.`, tone: 'ok' }], acts: [x.id] };
        }
        const i = this.store.identity(a.owner);
        const x = await i.publish(MIPS.finance, FINANCE_TYPES.pointer, payload, { public: true, relays: this.store.settings().relays });
        this.store.saveIdentity(i);
        return { title: 'The pointer is published', lines: [{ text: `Pointer ${x.id}, version ${version}.`, tone: 'ok' }], acts: [x.id] };
      },
    });
  }

  /** The pointer check (Law rule 18, F123, F124 P2), as a Law client makes it before paying the collective. */
  async checkPointer(a: { collective: string }): Promise<{ reading: Reading; kind: string }> {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const { v, specs } = await this.lawVerifier(c, this.concerned(c));
    const r = v.lawPointerCheck(specs, c.identity, c.f.agreement) as {
      kind: string;
      pointer?: string;
      service?: string;
      missing: [string, string][];
      vaultMissing: [string, string][];
      reason?: string;
    };
    const text = (h: string) => Buffer.from(h, 'hex').toString('utf8');
    const lines: Line[] =
      r.kind === 'ordinary'
        ? [{ text: `Every address in the collective's pointer, and every entry of its vault, is also in ${names(r.service!)}'s own: it leads to the split service, an ordinary pointer.`, tone: 'ok' }]
        : r.kind === 'bypasses'
          ? [
              { text: 'BYPASSES THE SPLIT SERVICE: this pointer counts for nothing in Law. A Law client never shows it as an ordinary pointer, and does not pay it as one.', tone: 'bad' },
              ...r.missing.map(([, addr]) => ({ text: `“${text(addr)}” is in no split service's own pointer.`, tone: 'bad' as const })),
              ...r.vaultMissing.map(([, src]) => ({ text: `The vault entry “${text(src)}” is in no split service's own vault (F124 P2).`, tone: 'bad' as const })),
              { text: 'A wallet reading only Finance cannot check this, and would pay the pointer as it stands (cost stated, F68, F121).', tone: 'warn' },
            ]
          : r.kind === 'no-split-service'
            ? [{ text: "The collective's agreement names no split service: a wallet reading Law splits payer-side, paying each holder's own pointer by the stakes (F124 P2)." }]
            : [{ text: `Undetermined: ${r.reason}.`, tone: 'warn' }];
    return {
      kind: r.kind,
      reading: { title: `The pointer check for ${names(c.identity)}`, summary: ["Law rule 18, F123, F124 P2: the split service vouches for the addresses in the owners' pointer and vault, publicly."], sections: [{ heading: 'What a Law client sees before paying', lines }], plain: [], blocking: [] },
    };
  }

  /**
   * A payment of `amount` to the collective, received and split by its
   * split service (simulated here): the service signs a receipt, then a
   * split paying each holder of the collective's stake in itself, and a
   * fee to itself. The split cites the service's previous split for the
   * stake and carries the running count of leftover units (Law rule 15a,
   * F165, F171), and is delivered to every holder of the stake, paid or
   * not (client conformance, F171); each holder's client held here checks
   * it against the chain it keeps. `amounts` overrides the computed
   * payouts, and `cite` the split it cites ("none": a reset;
   * "before-latest": a fork), to show a deviation the core shows.
   */
  async prepareSplit(a: { collective: string; amount: number; fee: number; amounts?: Record<string, number>; cite?: 'latest' | 'none' | 'before-latest' }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [];
    const own = this.ownStake(c);
    if (!own.length) blocking.push('The collective has no stakes in itself yet: set them first.');
    const amount = whole(a.amount, 'the amount');
    const fee = whole(a.fee, 'the fee');
    if (fee > amount) blocking.push('The fee is more than the amount.');
    let service: string | null = null;
    if (!c.f.governance.splitGrant) blocking.push('The collective names no split service yet.');
    else {
      const g = await this.fetchAct(c.f.governance.splitGrant, this.hintsOf(c));
      const p = g ? ((describeAct(g) as { payload?: Uint8Array }).payload ?? null) : null;
      service = p ? hex((cborDecode(p) as Map<number, unknown>).get(0) as Uint8Array) : null;
      if (!service || !this.store.holds(service)) blocking.push('The split service is not held by this program, so it cannot split here.');
    }
    const pool = amount - fee;
    const index = this.stakeIndex(c, null);
    // Law rule 15a (F165, F171): each holder its exact share rounded down,
    // the leftover units one each to the largest remainders; holders with
    // equal remainders take turns, the fewest leftover units from this
    // stake so far, then the smallest identity hash. The count is a field
    // of the split act: the service's next split cites its previous one for
    // the stake and carries the running count, so a tie is checked from two
    // acts; the core reads the turns from the previous split
    // (lawSplitTurns), divides (lawDivideStake) and adds this split's
    // leftover units to the count (lawSplitTally). The order of holders
    // decides nothing.
    const chain = (c.f.splits ?? []).filter((x) => (x.service ?? service) === service && (x.stake ?? index) === index);
    const latest = chain.at(-1) ?? null;
    const cite = a.cite ?? 'latest';
    const previous = cite === 'none' ? null : cite === 'before-latest' ? (latest?.previous ?? null) : (latest?.id ?? null);
    let turns: number[] | null = null;
    let before: [string, number][] | null = null;
    if (own.length && service) {
      const { v, specs } = await this.lawVerifier(c, this.concerned(c));
      const t = v.lawSplitTurns(specs, service, c.f.agreement, BigInt(index), own.map(([h]) => h), previous) as Float64Array | number[] | undefined | null;
      turns = t ? Array.from(t, Number) : null;
      if (previous === null) before = [];
      else {
        const e = v.lawSplit(specs, previous) as { tally: [number, [string, number][]][] };
        before = e.tally.find(([st]) => st === index)?.[1] ?? null;
      }
      if (!turns || !before) blocking.push("The turns of tied leftover units cannot be read: the service's previous split for the stake is not held, or carries no count (Law rule 15a, F171).");
    }
    const divide = (): [string, number][] | null => {
      try {
        const parts = lawDivideStake({ total: pool, holders: own, turns: turns ?? undefined }) as number[] | Float64Array;
        return own.map(([h], i) => [h, Number(parts[i])] as [string, number]);
      } catch {
        return null;
      }
    };
    const tied = own.length > 0 && (() => {
      try {
        lawDivideStake({ total: pool, holders: own });
        return false;
      } catch {
        return true;
      }
    })();
    const auto = divide() ?? own.map(([h, n]) => [h, Math.floor((pool * n) / 1_000_000)] as [string, number]);
    const payouts: [string, number][] = auto.map(([h, n]) => [h, a.amounts?.[h] ?? n]);
    const left = pool - own.map(([, n]) => Math.floor((pool * n) / 1_000_000)).reduce((x, n) => x + n, 0);
    const departed = c.f.governance.departed ?? [];
    const reading: Reading = {
      title: `A payment of ${amount} to “${cname}”, split`,
      summary: [
        `The split service ${service ? names(service) : ''} receives ${amount} and takes a fee of ${fee}, named in the split with who received it (F121, Q9).`,
        ...payouts.map(([h, n]) => `${names(h)}: ${n}${departed.includes(h) ? ' (a departed holder)' : ''}.`),
        ...(tied
          ? [`${left} leftover unit${left === 1 ? '' : 's'} of rounding: holders whose remainders are equal take turns, the one with the fewest leftover units from this stake so far first, as the service's previous split counts them, then the smallest identity hash (Law rule 15a, F165).`]
          : []),
        `The split cites ${previous ? `the service's previous split for the stake, ${short(previous)}` : 'no previous split: the first for the stake'}, and carries the running count of leftover units each holder has received (Law rule 15a, F171).`,
        'The split is delivered to every holder of the stake, paid or not, and each holder keeps the chain and checks each split as it arrives: a split not citing the latest, or two citing the same one, breaks the plan (Law rule 15a, rule 46b, F171).',
        'Law checks that every payout matches its stake exactly, every fee alike for every stake: any deviation, either way, breaks the plan (F124 N10, rule 26).',
      ],
      sections: [{ heading: 'Simulated', lines: [{ text: 'The split service and the payment are simulated on a test rail: no money moves.', tone: 'warn' }] }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'split',
      digest: digestOf('split', a.collective, String(amount), String(fee), JSON.stringify(payouts), String(previous)),
      reading,
      depends: [a.collective, ...(service ? [service] : [])],
      run: async () => {
        const col = this.store.collective(a.collective);
        const svc = this.store.identity(service!);
        const relays = col.f.relays;
        const r = await svc.publish(MIPS.finance, FINANCE_TYPES.receipt, receiptPayload({ rail: TEST_RAIL, payee: svc.f.identity, unit: TEST_RAIL, value: amount, fulfils: col.f.agreement }), { public: true, relays });
        const final: [string, number][] = payouts;
        const ps: PayoutIn[] = [
          ...(fee ? [{ receiver: svc.f.identity, amount: fee, feeModule: TEST_RAIL }] : []),
          ...final.map(([h, n]) => ({ receiver: h, amount: n, stake: index })),
        ];
        // The running count after this split: the previous one plus what
        // each holder was paid above its share rounded down (F171).
        const pot = final.reduce((x, [, n]) => x + n, 0);
        const tally = lawSplitTally({ pot, holders: own, paid: final, before: before ?? [] }) as [string, number][];
        // Delivered to every holder of the stake, paid or not (F171).
        const to = [...new Set(own.map(([h]) => h))];
        const x = await svc.publish(
          REPO_SPECS.law,
          LAW_TYPES.split,
          splitPayload({ receipt: r.id, payouts: ps, cmip: TEST_RAIL, agreement: col.f.agreement, tally: [[index, tally]] }),
          { public: false, to, relays, refs: previous ? [previous] : undefined },
        );
        col.f.splits = [...(col.f.splits ?? []), { id: x.id, key: Buffer.from(x.key).toString('base64'), receipt: r.id, service: service!, stake: index, previous }];
        this.store.saveCollective(col);
        this.store.saveIdentity(svc);
        const judged = await this.checkSplit({ collective: a.collective, split: x.id });
        // Each holder's client held here receives it and checks it against
        // the chain it keeps (client conformance, F171).
        const arrived: Line[] = [];
        for (const h of to) if (this.store.holds(h)) arrived.push(await this.receiveSplit({ holder: h, collective: a.collective, split: x.id }));
        return { title: 'The payment is split', lines: [{ text: `Receipt ${r.id}; split ${x.id}.`, tone: 'ok' }, ...judged.reading.sections.flatMap((s) => s.lines), ...arrived], acts: [r.id, x.id] };
      },
    });
  }

  /**
   * A holder's client receiving a split (Law rule 15a, F171, client
   * conformance): it keeps the service's tally chain for each stake it
   * holds, from every split delivered to it, paid or not, and checks each
   * one as it arrives. The split must cite the latest split delivered to
   * it for the stake (none, for the first), and carry the count that one
   * carries plus this split's leftover units; one that does not is a
   * deviation that breaks the plan, shown. After a deviation the reference
   * stays the last split that continued the chain, so a deviating split
   * never becomes the baseline, and the next split is checked against that
   * one (Law rule 15a, F182). Unlike a verifier holding a set of acts, the
   * holder's client knows which came second: the one that arrived after
   * the chain had moved on.
   */
  async receiveSplit(a: { holder: string; collective: string; split: string }): Promise<Line> {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const { v, specs } = await this.lawVerifier(c, this.concerned(c));
    const e = v.lawSplit(specs, a.split) as { payouts: [string, number, number | null, string | null][]; cites: string[]; tally: [number, [string, number][]][] };
    const entry = (c.f.splits ?? []).find((x) => x.id === a.split);
    const index = entry?.stake ?? this.stakeIndex(c, null);
    const own = this.ownStake(c);
    const key = `${entry?.service ?? ''} ${a.collective} ${index}`;
    const kept = this.store.kept(a.holder);
    const mine = kept[key] ?? null;
    const who = names(a.holder);
    const carried = e.tally.find(([st]) => st === index)?.[1] ?? null;
    const paid = e.payouts.filter(([, , st]) => st === index).map(([h, n]) => [h, Number(n)] as [string, number]);
    const pot = paid.reduce((x, [, n]) => x + n, 0);
    const expected = lawSplitTally({ pot, holders: own, paid, before: mine?.counts ?? [] }) as [string, number][];
    const count = (v: [string, number][], h: string) => v.filter(([x]) => x === h).reduce((s, [, n]) => s + Number(n), 0);
    const sameCount = carried !== null && [...carried, ...expected].every(([h]) => count(carried, h) === count(expected, h));
    const knownSplits = new Set((c.f.splits ?? []).map((x) => x.id));
    if (!mine && e.cites.some((x) => knownSplits.has(x))) {
      // A holder that joined the stake after the chain began: it keeps the
      // chain from here, and cannot check this first count.
      kept[key] = { tip: a.split, counts: carried ?? [] };
      this.store.saveKept(a.holder, kept);
      return { text: `${who}'s client: it keeps the chain from this split on; the earlier splits for the stake were never delivered to it, so this count is not checked here (Law rule 15a, F171).`, tone: 'warn' };
    }
    // The reference: the last split that continued the chain (none yet: the
    // split must cite none, as the first does).
    const citesLatest = mine ? (mine.tip === null ? !e.cites.some((x) => knownSplits.has(x)) : e.cites.includes(mine.tip)) : true;
    if (citesLatest && sameCount) {
      kept[key] = { tip: a.split, counts: carried ?? [] };
      this.store.saveKept(a.holder, kept);
      return { text: `${who}'s client: the split continues the chain it keeps, citing the latest split it holds for the stake, its count adding up (Law rule 15a, F171).`, tone: 'ok' };
    }
    // F182: a deviating split never becomes the reference.
    if (!mine) {
      kept[key] = { tip: null, counts: [] };
      this.store.saveKept(a.holder, kept);
    }
    const reference = mine?.tip ? short(mine.tip) : null;
    const why = [
      ...(citesLatest ? [] : [reference ? `it does not cite ${reference}, the last split that continued the chain this client keeps for the stake` : 'it cites a previous split, though none has continued the chain this client keeps for the stake']),
      ...(sameCount ? [] : [carried ? 'its running count is not the one kept plus its own leftover units' : 'it carries no running count for the stake']),
    ];
    return {
      text: `${who}'s client: THE SPLIT DOES NOT CONTINUE THE CHAIN IT KEEPS: ${why.join('; ')}. A deviation that breaks the plan (Law rule 15a, rule 46b, F171), shown. The chain this client keeps stays at ${reference ?? 'its start'}, the last split that continued it: the next split is checked against that one, never against this (F182).`,
      tone: 'bad',
    };
  }

  /** A split, as the core library judges it: its fees and their receivers, delivery, every payout matching its stake (F121 Q9, F124 N10). */
  async checkSplit(a: { collective: string; split: string }): Promise<{ reading: Reading; mismatched: number; breaks: number }> {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const departed = c.f.governance.departed ?? [];
    const { v, specs } = await this.lawVerifier(c, this.concerned(c));
    const e = v.lawSplit(specs, a.split) as {
      sums: boolean | null;
      payouts: [string, number, number | null, string | null][];
      fees: [string, string, number][];
      undelivered: string[];
      mismatched: [number, string, number, number][];
      problems: string[];
      unevidenced: string[];
      unplanned: string[];
      turnsUnknown: number[];
      breaks: { stake: number; kind: string; with: string[]; previous: string | null }[];
      countUnknown: number[];
    };
    const others = (hs: string[]) => list(hs.map(short));
    const lines: Line[] = [
      ...e.problems.map((p) => ({ text: `NOT THE NAMED SERVICE'S SPLIT UNDER THE AGREEMENT IN FORCE: ${p}.`, tone: 'bad' as const })),
      ...e.unevidenced.map((r) => ({ text: `ROLE SHARE WITHOUT EVIDENCE THAT HOLDS: ${names(r)} (Law rule 22).`, tone: 'bad' as const })),
      ...e.unplanned.map((r) => ({ text: `Paid to ${names(r)} as a fee, a role or a named receiver that the split plan and fees of the version in force do not name: nothing in the agreement justifies it (Law rules 26, 27).` })),
      ...e.fees.map(([, r, n]) => ({ text: `Fee: ${n}, received by ${names(r)}.` })),
      ...e.payouts.filter(([, , st]) => st !== null).map(([r, n]) => ({ text: `Paid: ${n} to ${names(r)}${departed.includes(r) ? ' (a departed holder)' : ''}.` })),
      e.sums === false ? { text: 'The payouts do not add up to what arrived (Law rule 21): an invalid split.', tone: 'bad' as const } : { text: 'The payouts add up exactly to what arrived.', tone: 'ok' as const },
      ...(e.undelivered.length
        ? [{ text: `Not delivered to ${list(e.undelivered.map(names))}, whom it pays (Q9).`, tone: 'bad' as const }]
        : [{ text: 'Delivered to every holder it pays (Q9).', tone: 'ok' as const }]),
      ...(e.mismatched.length
        ? e.mismatched.map(([, h, paid, due]) => ({ text: `DOES NOT MATCH ITS STAKE: ${names(h)} is paid ${paid}, their share is ${due} (F124 N10, rule 26).`, tone: 'bad' as const }))
        : [{ text: 'Every payout matches its stake exactly, every fee alike for every stake, member or departed (F124 N10).', tone: 'ok' as const }]),
      ...(e.turnsUnknown.length
        ? [{ text: "Who should have had a tied leftover unit is unknown: the service's previous split for the stake is not held, or carries no count, so the turns cannot be read (Law rule 15a, F165, F171). The rest is checked.", tone: 'warn' as const }]
        : []),
      ...(e.countUnknown.length && !e.turnsUnknown.length
        ? [{ text: "The running count cannot be checked: the service's previous split for the stake is not held, or carries no count (Law rule 15a, F171). The rest is checked.", tone: 'warn' as const }]
        : []),
      // The tally chain (Law rule 15a, rule 46b, F171): each break breaks the plan.
      ...e.breaks.map((b) => ({
        text:
          b.kind === 'reset'
            ? `THE TALLY CHAIN IS RESET: this split and ${others(b.with)} each cite no previous split for the stake, so one of them restarts the count (Law rule 15a, rule 46b, F171).`
            : b.kind === 'fork'
              ? `THE TALLY CHAIN FORKS: this split and ${others(b.with)} both cite ${short(b.previous ?? '')} as the previous split for the stake (Law rule 15a, rule 46b, F171).`
              : b.kind === 'count'
                ? "THE RUNNING COUNT DOES NOT ADD UP: it is not the previous split's count plus this split's leftover units (Law rule 15a, rule 46b, F171)."
                : 'THE SPLIT CARRIES NO RUNNING COUNT for a stake it pays (Law rule 15a, F171).',
        tone: 'bad' as const,
      })),
    ];
    return {
      mismatched: e.mismatched.length,
      breaks: e.breaks.length,
      reading: { title: `The split ${short(a.split)}`, summary: [], sections: [{ heading: 'What the core library finds', lines }], plain: [], blocking: [] },
    };
  }

  /**
   * A debt of the collective (a Finance obligation it signs as debtor),
   * to a creditor: private, its outside published on the collective's
   * relays, so it binds the collective (F124 N13), and sealed to every
   * member as well as the creditor (client conformance, N13: no member can
   * keep the collective's debts out of the others' sight).
   */
  async prepareDebt(a: { collective: string; creditor: string; amount: number }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [...this.closedBlock(c)];
    const value = whole(a.amount, 'the amount');
    if (!/^[0-9a-f]{64}$/.test(a.creditor)) blocking.push('Name the creditor by its identity.');
    const to = [...new Set([a.creditor, ...c.f.members])];
    const payload = blocking.length ? new Uint8Array() : obligationPayload({ debtor: c.identity, creditor: a.creditor, unit: TEST_RAIL, value, pointer: c.f.agreement });
    const reading: Reading = {
      title: `“${cname}” owes ${value} to ${names(a.creditor)}`,
      summary: [
        'The collective signs an obligation as its debtor (F66). It binds the collective only once its outside is public: it is published on the collective\'s relays, its inside locked (F124 N13).',
        `Sealed to the creditor and to every member: ${list(to.map(names))} (client conformance, F124 N13).`,
        'Cost, stated: anyone can see that the collective has debts, and how many, never their content.',
      ],
      sections: [],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'debt',
      digest: digestOf('debt', a.collective, payload),
      reading,
      depends: [a.collective],
      run: async () => {
        const col = this.store.collective(a.collective);
        const x = await col.id.publish(MIPS.finance, FINANCE_TYPES.obligation, payload, { public: false, to, relays: col.f.relays });
        col.f.debts = [...(col.f.debts ?? []), { id: x.id, key: Buffer.from(x.key).toString('base64'), creditor: a.creditor }];
        this.store.saveCollective(col);
        return { title: 'The debt is signed and published', lines: [{ text: `Obligation ${x.id}, sealed to ${count(to.length, 'recipient')}.`, tone: 'ok' }], acts: [x.id] };
      },
    });
  }

  /**
   * The fork of the collective (Law rule 47a, F121 shape B, F124). Each
   * side first founds its successor: a new collective whose founding terms
   * have that side's members as parties, keep every departed holder and
   * every member who signs no side at their share of all income, and name
   * the original in "forked from", a back-link (N4). Then the fork act,
   * naming each successor, is signed by the members on the sides with their
   * own identities, under the constitutional change rule (N1), and each
   * successor signs for the debts it is assigned (N13): every obligation of
   * the original is assigned, by default to every side jointly. Once
   * complete, the original is closed in Law; its ownership passes to the
   * successors by the members' stakes; every grant ends, the split
   * service's included; payment follows the work's current claim (N14).
   */
  async prepareFork(a: { collective: string; sides: string[][]; debts?: Record<string, number[]> }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [...this.closedBlock(c)];
    if (c.f.pending) blocking.push('A member change is waiting for the homes: send it again first.');
    const sides = a.sides.map((s) => [...new Set(s)]).filter((s) => s.length);
    // The members whose voice remains, and the constitutional change rule, as Law reads them (rule 44d, F124 N1).
    const n = await this.counted(c);
    if (n.problem) blocking.push(n.problem);
    if (n.broken) blocking.push('A broken collective cannot fork or close before it is fixed: the members roll it back first (Law rule 37d, RB6).');
    const voices = n.voices;
    if (sides.length < 2) blocking.push('A fork has at least two sides.');
    if (sides.some((x) => x.length < 2)) blocking.push("This client founds collectives of two members or more (absence is judged by a threshold of the other members): put two members on each side.");
    const listed = sides.flat();
    if (new Set(listed).size !== listed.length) blocking.push('A member is on one side at most.');
    const leaving = voices.filter((m) => !listed.includes(m));
    for (const m of listed) {
      if (!voices.includes(m)) blocking.push(`${names(m)} is not a member whose voice remains.`);
      else if (!this.store.holds(m)) blocking.push(`${names(m)} cannot sign here.`);
    }
    // N1: the constitutional change rule, every member whose voice remains by default.
    const k = n.constitution;
    const needed = k ? Math.min(k, voices.length) : voices.length;
    if (listed.filter((m) => voices.includes(m)).length < needed) {
      blocking.push(
        k
          ? `A fork follows the constitutional change rule: any ${k} members (F124 N1); ${listed.length} sign here.`
          : `A fork follows the constitutional change rule, every member whose voice remains by default (F124 N1): ${list(leaving.map(names))} would sign no side.`,
      );
    }
    // Each member's percentage of all income: the stake in itself, else each alike (N3).
    const own = this.ownStake(c);
    const alike = Math.floor(1_000_000 / Math.max(voices.length, 1));
    const pct = (m: string) => (own.length ? (own.find(([h]) => h === m)?.[1] ?? 0) : m === voices[0] ? 1_000_000 - alike * (voices.length - 1) : alike);
    const departed = c.f.governance.departed ?? [];
    const kept: [string, number][] = [...departed.map((d) => [d, pct(d)] as [string, number]), ...leaving.map((m) => [m, pct(m)] as [string, number])];
    const weight = (s: string[]) => s.reduce((x, m) => x + pct(m), 0);
    const w = sides.map((s) => weight(s) || s.length);
    const sum = w.reduce((x, y) => x + y, 0) || 1;
    // F127: the fork hands out every obligation in the history it cites
    // (paid or not), its own and what an earlier fork handed to it, or it
    // does not take effect. The core reads that history from the line this
    // fork will draw: the collective's latest act.
    const { v: v0, specs: s0 } = await this.lawVerifier(c, this.concerned(c));
    const debts: [string, number[]][] = [];
    const seq0 = c.f.identity.sequence;
    const line = seq0.length ? [{ act: seq0[seq0.length - 1], position: seq0.length, summary: runningSummary(seq0) }] : [];
    const gate = await this.endingGate(c, v0, s0, line);
    blocking.push(...gate.blocking);
    const history = (v0.lawHandOut(s0, c.identity, c.f.agreement, c.f.identity.binding, line) as string[] | null) ?? [];
    for (const o of new Set(history)) {
      const to = a.debts?.[o] ?? sides.map((_, i) => i);
      if (!to.length || to.some((i) => i < 0 || i >= sides.length)) blocking.push(`The debt ${short(o)} is assigned to no side the fork lists.`);
      debts.push([o, [...new Set(to)].sort((x, y) => x - y)]);
    }
    const reading: Reading = {
      title: `Fork “${cname}”`,
      summary: [
        `${sides.length} sides: ${sides.map((s, i) => `side ${i + 1}, ${list(s.map(names))}`).join('; ')}. Each side first founds its own collective, its successor; the fork act names them (F124 N4). Every member on a side signs with their own identity, not the collective's key, with their safety key on their own identity chain (a chain signature, F132), under the constitutional change rule (Law rule 47a, F124 N1).`,
        leaving.length
          ? `${list(leaving.map(names))} sign${leaving.length === 1 ? 's' : ''} no side: no seat in any successor, and a departed holder of each at their percentage (F124 N1).`
          : 'Every member whose voice remains is on a side.',
        "Once complete, the collective is closed in Law: anything its keys sign after the fork's line counts for nothing. Its rotation is optional cleanup.",
        `Its ownership of each work passes to the successors, ${own.length ? "by the members' stakes" : 'each member counting alike, since the collective carries no stakes in itself (F124 N3)'}: ${sides.map((_, i) => `side ${i + 1} ${((100 * w[i]) / sum).toFixed(2)}%`).join(', ')}.`,
        kept.length ? `${list(kept.map(([h, n]) => `${names(h)} (${n / 10_000}%)`))} keep their share in every successor, and in its future works.` : 'There are no departed holders.',
        debts.length
          ? `Every debt is handed out, and the successor of each side it goes to signs for it (F124 N13): ${debts.map(([o, i]) => `${short(o)} to ${i.map((x) => `side ${x + 1}`).join(' and ')}`).join('; ')}.`
          : 'The collective owes nothing.',
        "The fork cites the collective's history up to its line, and hands out every debt in it, or it does not take effect (F127). Whatever the collective's keys sign that the fork's history does not include is void: the ending wins.",
        'Every grant of the collective ends, its split service\'s included; its open offers are withdrawn; payment follows the work\'s current claim, to the successors (F124 N14).',
      ],
      sections: [
        // Law rule 49: each side signs its successor's founding terms, which carry an abandonment clause.
        ...sides.flatMap((side, i) =>
          absenceSection(
            { abandonment: collectiveClause(Math.max(1, Math.min(c.f.governance.abandonmentOthers, side.length - 1))) },
            names,
            `If someone disappears from the successor of side ${i + 1}`,
          ),
        ),
        { heading: 'Signed on this device', lines: [{ text: 'Every member and each successor here is held by this program: their consent is simulated (test only).', tone: 'warn' }] },
      ],
      plain: [],
      blocking,
    };
    const s = this.store.settings();
    return this.plan({
      kind: 'fork',
      digest: digestOf('fork', a.collective, c.f.agreement, JSON.stringify({ sides, debts, kept, named: gate.named })),
      reading,
      depends: [a.collective, ...listed],
      run: async () => {
        const col = this.store.collective(a.collective);
        const relays = col.f.relays;
        const acts: string[] = [];
        // Each side founds its successor first (N4).
        const successors: TestCollective[] = [];
        for (const [i, side] of sides.entries()) {
          const ids = side.map((m) => this.store.identity(m));
          const rest = 1_000_000 - kept.reduce((x, [, n]) => x + n, 0);
          const each = Math.floor(rest / side.length);
          const holders: [string, number][] = [...kept, ...side.map((m, j) => [m, j === 0 ? rest - each * (side.length - 1) : each] as [string, number])];
          const rules = { ...col.f.governance };
          const n = side.length;
          const g: Governance = {
            safetyThreshold: Math.min(rules.safetyThreshold, Math.max(n - 1, 1)),
            releaseThreshold: Math.min(rules.releaseThreshold, n),
            cloneThreshold: Math.min(rules.cloneThreshold, n),
            constitutionalThreshold: rules.constitutionalThreshold ? Math.min(rules.constitutionalThreshold, n) : undefined,
            abandonmentOthers: Math.max(1, Math.min(rules.abandonmentOthers, n - 1)),
            text: '',
            stakes: [{ object: null, holders }],
            departed: kept.length ? kept.map(([h]) => h) : undefined,
            forkedFrom: col.identity,
          };
          g.text = `${standardWords(`${cname}, side ${i + 1}`, g)} Forked from ${col.identity}.`;
          if (n === 1) {
            // One member alone: the clone and constitution rules are theirs.
            g.safetyThreshold = 1;
          }
          const got = await TestCollective.found({ members: ids, homes: s.homes, relays, governance: g, via: s.via });
          for (const x of ids) this.store.saveIdentity(x);
          this.store.saveCollective(got.collective);
          const book = this.store.book();
          book.collectives.push({ id: got.collective.identity, name: `${cname}, side ${i + 1}` });
          this.store.saveBook(book);
          successors.push(got.collective);
          acts.push(got.agreement, got.collective.identity);
        }
        const seq = col.f.identity.sequence;
        const tips = seq.length ? [{ act: seq[seq.length - 1], position: seq.length, summary: runningSummary(seq) }] : [];
        const payload = forkPayload({
          agreement: col.f.agreement,
          collective: col.identity,
          chainAct: col.f.identity.binding,
          tips,
          sides: sides.map((m, i) => ({ successor: successors[i].identity, members: m })),
          debts,
        });
        const first = this.store.identity(sides[0][0]);
        // F131 (IT1): it names every ending of the collective held, so it
        // counts as made after them.
        const objects: [string, string][] = [[col.f.agreement, col.f.agreement], ...gate.named.map((e): [string, string] => [col.f.agreement, e])];
        const x = await first.publish(REPO_SPECS.law, LAW_TYPES.fork, payload, { public: true, relays, objects });
        acts.push(x.id);
        // F132 (U1): every member on a side, the fork's signer included,
        // signs it with their safety key, by a chain signature on their own
        // identity chain.
        const ids = [];
        for (const m of listed) {
          const i = this.store.identity(m);
          acts.push((await i.chainSign(x.id, relays)).id);
          ids.push(i);
        }
        for (const i of ids) this.store.saveIdentity(i);
        // Each successor assigned a debt signs for it (N13).
        const owing = new Set(debts.flatMap(([, i]) => i));
        for (const i of owing) {
          const sc = this.store.collective(successors[i].identity);
          acts.push((await lawSign(sc.id, x.id, relays)).id);
          this.store.saveCollective(sc);
        }
        const { v, specs } = await this.lawVerifier(col, [...this.concerned(col), ...successors.map((x) => x.identity)]);
        const e = v.lawFork(specs, x.id) as { complete: boolean; why: string | null; shares: number[]; successors: (string | null)[] };
        if (e.complete) col.f.closed = x.id;
        this.store.saveCollective(col);
        return {
          title: e.complete ? `“${cname}” is forked, and closed in Law` : `The fork of “${cname}” is not complete`,
          lines: [
            ...successors.map((sc, i) => ({ text: `Side ${i + 1}'s successor: ${sc.identity}, founded first, forked from “${cname}” (a back-link).` })),
            { text: `Fork ${x.id}, signed by ${listed.length}.`, tone: e.complete ? 'ok' : 'bad' },
            ...(e.complete ? [{ text: `Shares by default: ${e.shares.map((n, i) => `side ${i + 1} ${n / 10_000}%`).join(', ')}.` }] : [{ text: e.why ?? '', tone: 'bad' as const }]),
          ],
          acts,
        };
      },
    });
  }

  /**
   * Release one of the collective's releases to the public domain (Law
   * rule 17, F121 shape D, F124 N7): the claim ends, its history stays
   * named, its content key is published. It needs every direct owner of the
   * work: here the collective alone, which signs by its own rules, meeting
   * the lanes of every layer a release touches (Envelope, Finance, Law).
   */
  async prepareReleaseWork(a: { collective: string; release: string }) {
    const c = this.store.collective(a.collective);
    const blocking: string[] = [...this.closedBlock(c)];
    const w = await this.workOf(c, a.release);
    if (!w) blocking.push("That release was not found at the collective's relays.");
    const index = w ? this.stakeIndex(c, w.work) : -1;
    if (w && index < 0) blocking.push("The collective's terms carry no stake in that release: set the stakes first.");
    const payload = w ? releasePayload({ work: w.work, stakes: [[c.f.agreement, Math.max(index, 0)]], keys: [[a.release, w.key]] }) : new Uint8Array();
    const reading: Reading = {
      title: `Release ${short(a.release)} to the public domain`,
      summary: [
        'The claim ends: nobody earns from this work as its owner any more. Its history (who made it, who owned it) stays named, and its content key is published: anyone may carry or sell copies (Law rule 17, F121).',
        "The collective owns the work wholly, so it alone signs, by its own rules, meeting the lanes of every layer a release touches: Envelope, Finance and Law (F124 N7). This collective gives none of them to an area, so its own signature counts. Its members and departed holders own shares of its income, not the work; a release affects every holder alike.",
        'A claim on this work that the release does not name is shown beside it, openly contested (F124 N12).',
      ],
      sections: [{ heading: 'Signed on this device', lines: [{ text: "The collective's everyday key signs it (test only).", tone: 'warn' }] }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'release-work',
      digest: digestOf('release-work', a.collective, payload),
      reading,
      depends: [a.collective],
      run: async () => {
        const col = this.store.collective(a.collective);
        const x = await col.id.publish(REPO_SPECS.law, LAW_TYPES.release, payload, { public: true, relays: col.f.relays, objects: [[col.f.agreement, col.f.agreement]] });
        this.store.saveCollective(col);
        const { v, specs } = await this.lawVerifier(col, this.concerned(col));
        const e = v.lawRelease(specs, x.id) as { complete: boolean; why: string | null; signed: string[] };
        const names = this.store.names();
        return {
          title: e.complete ? 'Released to the public domain' : 'The release is not complete',
          lines: [{ text: `Release ${x.id}, signed by ${list(e.signed.map(names))}.`, tone: e.complete ? 'ok' : 'bad' }, ...(e.why ? [{ text: e.why, tone: 'bad' as const }] : [])],
          acts: [x.id],
        };
      },
    });
  }

  /**
   * Close a collective that holds nothing (Law rule 47a, F124 N9): every
   * work sold or released, every debt paid. A closing act, signed by its
   * members with their own identities under the constitutional change rule;
   * after its line, the collective's keys count for nothing in Law.
   */
  async prepareClosing(a: { collective: string }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const blocking: string[] = [...this.closedBlock(c)];
    // The members whose voice remains, and the constitutional change rule, as Law reads them (rule 44d, F124 N9).
    const n = await this.counted(c);
    if (n.problem) blocking.push(n.problem);
    if (n.broken) blocking.push('A broken collective cannot fork or close before it is fixed: the members roll it back first (Law rule 37d, RB6).');
    const voices = n.voices;
    const k = n.constitution;
    const signers = voices.filter((m) => this.store.holds(m));
    if (signers.length < (k ? Math.min(k, voices.length) : voices.length)) blocking.push(`A closing follows the constitutional change rule (F124 N9); ${list(voices.filter((m) => !this.store.holds(m)).map(names))} cannot sign here.`);
    // D5: a collective cannot close while it owes anything, its own debts
    // and those it owes as a fork's successor alike.
    const { v: v0, specs: s0 } = await this.lawVerifier(c, this.concerned(c));
    const seq0 = c.f.identity.sequence;
    const line = seq0.length ? [{ act: seq0[seq0.length - 1], position: seq0.length, summary: runningSummary(seq0) }] : [];
    const gate = await this.endingGate(c, v0, s0, line);
    blocking.push(...gate.blocking);
    // Money owed back from a broken stretch (Law rule 37d; QG1, F191; F197):
    // what is owed to nobody, and what is owed to a payer who gave no
    // address and was sent a notice, the closing names as left open; the
    // rest is repaid first.
    let owedBack: NonNullable<Shown['owedBack']> = [];
    try {
      owedBack = v0.lawOwedBack(s0, c.identity) as NonNullable<Shown['owedBack']>;
    } catch {
      owedBack = [];
    }
    const noticeOf = (p: string) => (c.f.notices ?? []).find((n) => n.payment === p);
    const leftOpen: LeftOpen[] = [];
    for (const o of owedBack) {
      if (o.toKind === 'nobody') leftOpen.push({ payment: o.payment, notice: null });
      else if (o.toKind === 'identity' && noticeOf(o.payment)) leftOpen.push({ payment: o.payment, notice: noticeOf(o.payment)!.notice });
      else
        blocking.push(
          `${o.value} (unit ${short(o.unit)}) is owed back to ${o.toKind === 'identity' && o.to ? names(o.to) : 'the key the payment committed to'} from the broken stretch: repay it first (Law rule 37d; F189, 7)${o.toKind === 'identity' ? ', or, where they gave no address, send them a notice with a deadline (F197)' : ''}.`,
        );
    }
    const owes = v0.lawOwes(s0, c.identity);
    if (owes.length) {
      const creditor = new Map(this.debtsOf(c).map((d) => [d.id, d.creditor]));
      blocking.push(
        `A collective cannot close while it owes anything (F125 D5): ${owes.map((o) => `${short(o)}${creditor.has(o) ? ` to ${names(creditor.get(o)!)}` : ''}`).join('; ')}. Pay it, or ask its creditor for a release; one that cannot pay stays open, its debts visible.`,
      );
    }
    const reading: Reading = {
      title: `Close “${cname}”`,
      summary: [
        'A closing ends a collective that holds nothing and owes nothing: every work sold or released, every debt paid or released by its creditor (F124 N9, F125 D5). After its line, anything the collective\'s keys sign counts for nothing in Law.',
        `Signed by ${list(signers.map(names))}, each with their own identity and their safety key, on their own identity chain (a chain signature, F132), under the constitutional change rule.`,
        owes.length ? `It owes ${owes.length === 1 ? 'one debt' : `${owes.length} debts`}, its own or as a fork's successor.` : 'It owes nothing: every debt it signed or owes as a successor is paid or released.',
        ...(() => {
          const nobody = leftOpen.filter((x) => !x.notice).length;
          const noticed = owedBack.filter((o) => o.toKind === 'identity' && noticeOf(o.payment));
          return [
            ...(nobody
              ? [`It leaves open, visibly, ${nobody} payment${nobody === 1 ? '' : 's'} owed back to nobody: the payer committed no key, so nobody can ever claim it (Finance rule 10a). The closing act names ${nobody === 1 ? 'it' : 'them'}, and ${nobody === 1 ? 'it stays' : 'they stay'} shown after it (QG1).`]
              : []),
            ...noticed.map(
              (o) =>
                `It leaves open, visibly, ${o.value} (unit ${short(o.unit)}) owed back to ${o.to ? names(o.to) : 'its payer'}, who gave no address: a notice was sent, sealed to them, with a deadline at ${noticeOf(o.payment)!.deadline} on the test time reference (F197). The closing counts only once that deadline has passed with no address given, as the time reference shows; this program reads no time reference, so here it does not take effect.`,
            ),
          ];
        })(),
      ],
      sections: [{ heading: 'Signed on this device', lines: [{ text: 'Test identities: consent simulated.', tone: 'warn' }] }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'closing',
      digest: digestOf('closing', a.collective, c.f.agreement, String(c.f.identity.sequence.length), gate.named.join(',')),
      reading,
      depends: [a.collective, ...signers],
      run: async () => {
        const col = this.store.collective(a.collective);
        const seq = col.f.identity.sequence;
        const tips = seq.length ? [{ act: seq[seq.length - 1], position: seq.length, summary: runningSummary(seq) }] : [];
        const payload = closingPayload({ agreement: col.f.agreement, collective: col.identity, chainAct: col.f.identity.binding, tips, open: leftOpen });
        const first = this.store.identity(signers[0]);
        const objects: [string, string][] = [[col.f.agreement, col.f.agreement], ...gate.named.map((e): [string, string] => [col.f.agreement, e])];
        const x = await first.publish(REPO_SPECS.law, LAW_TYPES.closing, payload, { public: true, relays: col.f.relays, objects });
        const acts = [x.id];
        // F132 (U1): each signer, the closing's own included, signs it with
        // their safety key, by a chain signature on their identity chain.
        const ids = [];
        for (const m of signers) {
          const i = this.store.identity(m);
          acts.push((await i.chainSign(x.id, col.f.relays)).id);
          ids.push(i);
        }
        for (const i of ids) this.store.saveIdentity(i);
        const { v, specs } = await this.lawVerifier(col, this.concerned(col));
        const e = v.lawClosing(specs, x.id) as { complete: boolean; why: string | null; holds: [string, number][] };
        if (e.complete) col.f.closed = x.id;
        this.store.saveCollective(col);
        return {
          title: e.complete ? `“${cname}” is closed in Law` : `The closing of “${cname}” does not take effect`,
          lines: [{ text: `Closing ${x.id}.`, tone: e.complete ? 'ok' : 'bad' }, ...(e.why ? [{ text: e.why, tone: 'bad' as const }] : [])],
          acts,
        };
      },
    });
  }

  /**
   * A notice to a payer owed money back from a broken stretch who gave no
   * address (Law type 24; F197, decided 10 October 2026): sealed to the
   * payer's identity, asking where the money should go, with a deadline on
   * a time reference. Its conditions are visible, so its good faith can be
   * judged; once the deadline passes with no address given, the collective
   * may close, the debt named in the closing act, unpaid and visible.
   */
  async prepareNotice(a: { collective: string; payment: string; deadline: number }) {
    const names = this.store.names();
    const c = this.store.collective(a.collective);
    const cname = this.store.book().collectives.find((x) => x.id === a.collective)?.name ?? short(a.collective);
    const shown = await this.shown(c);
    const o = (shown.owedBack ?? []).find((x) => x.payment === a.payment);
    const blocking: string[] = [...this.closedBlock(c)];
    if (!o) blocking.push(`No payment ${short(a.payment)} owed back by “${cname}” is held here.`);
    else if (o.toKind !== 'identity' || !o.to) blocking.push('A notice is sealed to the payer\'s identity: this payment names none (a bare key, or nobody), so no notice can reach its payer (F197; QG1).');
    if ((c.f.notices ?? []).some((n) => n.payment === a.payment)) blocking.push('A notice was already sent for this payment.');
    if (!Number.isInteger(a.deadline) || a.deadline <= 0) blocking.push('The deadline is a point on the time reference: a whole number above zero.');
    const who = o?.to ? names(o.to) : 'the payer';
    const reading: Reading = {
      title: `A notice to ${who}: money owed back by “${cname}”`,
      summary: [
        `“${cname}” sends ${who} a notice, sealed to ${who} (and to its members, as every act in its name), naming the payment ${short(a.payment)} it owes back from its broken stretch, and asking where the money should go (Law type 24, F197).`,
        `Its deadline: ${a.deadline}, on the test time reference (${short(TEST_TIME)}). If ${who} names an address in time, ${who} is paid. If not, the collective may close, the debt named in the closing act, visible and unpaid.`,
        'The notice and its deadline are visible to whoever checks the closing: the notice shows good faith, and how much depends on its conditions.',
      ],
      sections: [{ heading: 'Signed on this device', lines: [{ text: 'Signed by the collective\'s everyday key, held here. Test identities only.', tone: 'warn' }] }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'notice',
      digest: digestOf('notice', a.collective, a.payment, String(a.deadline)),
      reading,
      depends: [a.collective],
      run: async () => {
        const col = this.store.collective(a.collective);
        const payload = noticePayload(a.payment, TEST_TIME, BigInt(a.deadline));
        // Sealed to the payer, and to every member: an act in the collective's name is done once sealed to every member (Law rule 35a).
        const x = await col.id.publish(REPO_SPECS.law, LAW_TYPES.notice, payload, { public: false, to: [o!.to!, ...col.f.members], relays: col.f.relays, objects: [[a.payment, a.payment]] });
        col.f.notices = [...(col.f.notices ?? []), { payment: a.payment, notice: x.id, key: Buffer.from(x.key).toString('base64'), to: o!.to!, deadline: a.deadline }];
        this.store.saveCollective(col);
        this.shownCache.delete(col.identity);
        return { title: `Notice sent to ${who}`, lines: [{ text: `Notice ${x.id}, sealed to ${who}, deadline ${a.deadline} on the test time reference.`, tone: 'ok' as const }], acts: [x.id] };
      },
    });
  }

  /**
   * A creditor's release (Finance type 4, F126; rule 47b): the creditor of a
   * collective's debt ends it without full payment, for instance against
   * stakes or a partial payment. Only the creditor signs it; a collective
   * creditor would sign by its Finance lane (E2). It counts wherever held
   * (E1); published here, so that every verifier that sees the debt sees it
   * end.
   */
  async prepareDebtRelease(a: { debt: string; against?: string[] }) {
    const names = this.store.names();
    const all = this.store.book().collectives.filter((x) => this.store.isCollective(x.id)).flatMap((x) => this.debtsOf(this.store.collective(x.id)).filter((d) => !d.inherited));
    const d = all.find((x) => x.id === a.debt);
    const blocking: string[] = [];
    if (!d) blocking.push('That debt is not one this program holds.');
    else if (!this.store.holds(d.creditor)) blocking.push(`Only the creditor signs its release, and ${names(d.creditor)} cannot sign here (F125).`);
    const against = (a.against ?? []).filter((x) => /^[0-9a-f]{64}$/.test(x));
    const payload = blocking.length ? new Uint8Array() : debtReleasePayload({ obligation: a.debt, against });
    const debtor = d ? this.store.collective(d.debtor) : null;
    const dname = d ? (this.store.book().collectives.find((x) => x.id === d.debtor)?.name ?? short(d.debtor)) : '';
    const reading: Reading = {
      title: d ? `${names(d.creditor)} releases “${dname}” from its debt ${short(a.debt)}` : 'A creditor\'s release',
      summary: [
        'The creditor ends the obligation without full payment, for instance against stakes or a partial payment (F125). Only the creditor signs it: nobody else can discharge a debt, and MOR has no court to force one. It is a Finance act (F126): forgiving a sum is a money decision.',
        'A release traded for future terms (a share of income, stakes) is also a deal: a Law agreement of its own, which the release names among what it was released against, and which binds on its own (F126).',
        'With every debt paid or released, the collective may close (F125 D5). Its members were never personal debtors of what it owed (F124 N13).',
        against.length ? `Released against, for the record: ${against.map(short).join(', ')}.` : 'Released against nothing named.',
      ],
      sections: [{ heading: 'Signed on this device', lines: [{ text: "The creditor's key signs it (test only).", tone: 'warn' }] }],
      plain: [],
      blocking,
    };
    return this.plan({
      kind: 'debt-release',
      digest: digestOf('debt-release', a.debt, payload),
      reading,
      depends: d ? [d.creditor, d.debtor] : [],
      run: async () => {
        const col = debtor!;
        const creditor = this.store.identity(d!.creditor);
        const x = await creditor.publish(MIPS.finance, FINANCE_TYPES.release, payload, { public: true, relays: col.f.relays });
        this.store.saveIdentity(creditor);
        const { v, specs } = await this.lawVerifier(col, this.concerned(col));
        const e = v.lawDebtRelease(specs, x.id) as { counts: boolean; why: string | null };
        return {
          title: e.counts ? 'The debt is released by its creditor' : 'The release ends nothing',
          lines: [{ text: `Creditor's release ${x.id}.`, tone: e.counts ? 'ok' : 'bad' }, ...(e.why ? [{ text: e.why, tone: 'bad' as const }] : [])],
          acts: [x.id],
        };
      },
    });
  }

  // ------------------------------------------------------------ what the page shows

  /**
   * What the page shows of a collective's rules, members and release area:
   * Law's own reading of what its relays and homes hold ([`Actions.lawOf`]),
   * never this device's copy, so the two cannot disagree. Kept until the
   * collective's file changes, or for a minute.
   */
  private async shown(c: TestCollective): Promise<Shown> {
    const stamp = this.store.stamp([c.identity]);
    const hit = this.shownCache.get(c.identity);
    if (hit && hit.stamp === stamp && Date.now() - hit.at < 60_000) return hit.shown;
    const law = await this.lawOf(c);
    const shown = shownOf(c, law);
    // RB2: what the collective received during a broken stretch and owes back.
    // RB3: every declaration of absence naming a member is shown, with the way
    // to contest it, broken collective or not (client conformance).
    if (!law.unread) {
      try {
        shown.owedBack = law.v.lawOwedBack(LAW_SPECS, c.identity) as Shown['owedBack'];
      } catch {
        shown.owedBack = [];
      }
      const parties = new Set([...c.f.members, ...departedOf(c).map((d) => d.member)]);
      shown.declared = [...parties].flatMap((m) =>
        ((law.v.lawDeclarationsNaming(LAW_SPECS, m) as { act: string; signer: string; agreement: string; outcomes: number[]; contests: string[] }[]) ?? []).map((d) => ({ member: m, ...d })),
      );
    }
    this.shownCache.set(c.identity, { stamp, at: Date.now(), shown });
    return shown;
  }

  async state() {
    const b = this.store.book();
    const s = this.store.settings();
    const names = this.store.names();
    const shown = new Map<string, Shown>();
    for (const x of b.collectives) shown.set(x.id, await this.shown(this.store.collective(x.id)));
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
        const w = shown.get(x.id)!;
        return {
          id: x.id,
          name: x.name,
          // Law's reading: where Law reads the collective as broken, or
          // could not be read, the box says so; what follows is then this
          // device's copy, labelled as such on the page.
          law: { broken: w.broken, unread: w.unread, rollback: w.rollback },
          members: w.members.map((m) => ({ id: m.id, name: names(m.id), held: this.store.holds(m.id), left: m.left })),
          areas: [
            {
              id: RELEASE_AREA,
              name: 'Releases',
              holders: w.area.holders.map((h) => ({ ...h, name: names(h.id), held: this.store.holds(h.id) })),
              threshold: w.area.threshold,
              needed: w.area.needed,
              frozen: w.area.frozen,
              words: w.area.words,
            },
          ],
          departed: departed.map((d) => ({ id: d.member, name: names(d.member), record: d.record, stillParty: w.members.some((m) => m.id === d.member) })),
          steppedDown: down.map((d) => ({ id: d.member, name: names(d.member), area: d.area, record: d.record })),
          records: (c.f.records ?? []).length,
          holder: names(w.holder),
          agreement: w.agreement,
          agreements: c.f.agreements.indexOf(w.agreement) + 1 || c.f.agreements.length,
          rules: w.rules,
          words: w.words,
          shares: w.shares,
          relays: c.f.relays,
          releases: c.f.releases.map((r) => ({ id: r.id, version: r.version })),
          pending: !!c.f.pending,
          closed: c.f.closed ?? null,
          stakes: this.ownStake(c).map(([h, n]) => ({ id: h, name: names(h), percent: n / 10_000, member: c.f.members.includes(h) })),
          holdersToBe: [...voicesOf(c), ...(c.f.governance.departed ?? [])].map((h) => ({ id: h, name: names(h) })),
          forkedFrom: c.f.governance.forkedFrom ?? null,
          splitService: !!c.f.governance.splitGrant,
          splits: (c.f.splits ?? []).map((x) => x.id),
          debts: this.debtsOf(c).map((d) => ({ id: d.id, creditor: d.creditor, creditorName: names(d.creditor), creditorHeld: this.store.holds(d.creditor), inherited: d.inherited })),
          owedBack: (w.owedBack ?? []).map((o) => {
            const sent = (c.f.notices ?? []).find((n) => n.payment === o.payment);
            const toName = o.to && /^[0-9a-f]{64}$/.test(o.to) ? names(o.to) : (o.to ?? 'nobody named');
            return {
              payment: o.payment,
              to: o.to,
              toKind: o.toKind,
              toName,
              value: o.value,
              unit: o.unit,
              notice: sent?.notice ?? null,
              text:
                `${o.value} (unit ${short(o.unit)}) paid under an offer made ${o.stillBroken ? 'while the collective is broken' : 'during a broken stretch since rolled back'}: no purchase, owed back to ${toName} unless the sale is signed anew after the rollback, by a receipt of the collective for the same payment (Law rule 37d, RB2). Shown here as an open obligation: the network records and shows it; it cannot force a payment back.` +
                (o.toKind === 'nobody'
                  ? ' The payment committed no key: nobody can claim it (Finance rule 10a). It stays shown, and does not block a closing that names it (QG1).'
                  : o.toKind === 'key'
                    ? ' It is repaid where a claim signed with the key the payment committed to says (Finance rule 10a, QG1).'
                    : sent
                      ? ` A notice was sent to ${toName}, sealed to them, with a deadline at ${sent.deadline} on the test time reference (F197): once it passes with no address given, the collective may close, the debt named in the closing act.`
                      : ' It is repaid as a debt: where the payer\'s own claim on the payment says, or to the pointer their own acts on it hold, or their pointer in force (QG2). Where the payer gave no address, the collective sends a notice with a deadline before closing (F197).'),
            };
          }),
          declared: (w.declared ?? []).map((d) => ({
            member: d.member,
            name: names(d.member),
            held: this.store.holds(d.member),
            act: d.act,
            by: names(d.signer),
            text: contestWords(names(d.member), names(d.signer), d),
            contested: !!d.contests?.length,
          })),
        };
      }),
      history: this.store.history().slice(-50).reverse(),
    };
  }
}
