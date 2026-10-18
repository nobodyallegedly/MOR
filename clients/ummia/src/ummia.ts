// What Ummia does (F339, 17 October 2026): the Development layer's app. It
// holds the developer's identity and acts in the Development layer only;
// whatever goes to another layer travels through MOR as acts, sealed to
// oneself where private (the working rule of 17 October 2026: the layers
// apart, talking through MOR).
//
// - An identity is brought by its ID and its signing key's words, as in
//   Dub, Damgar and Kišib (the identity carry Module, draft 2). Ummia never
//   makes one, and never holds a chain key. Who acts is chosen with the
//   shared chooser (`acting.ts`): oneself in round 1; collectives in round 2
//   (decided by Nobody, allegedly).
// - Releases of code under one's own name (moved from Edubba; `releases.ts`,
//   on a computer), with Bitcoin anchoring as an option: the payment
//   prepared here as a draft sealed to oneself, paid in Damgar (`anchor.ts`).
// - Releasing cMIPs and Modules: a specification published as its act, its
//   hash shown (`spec.ts`).
// - Tracking: which cMIPs, Modules, extensions and xtypes exist, by asking
//   the public relays the person names, with the filters relays already
//   have (`track.ts`).
// - A path to drafting MIPs: drafts as signed long-form documents, then,
//   once ready, the MIP as a specification (`mips.ts`).
// - Bug reports, sent from one's own identity, and their answers
//   (`reports.ts`).
// - The accepted list, shown whole and changed (the accepted cMIP, F340):
//   one list per identity, sealed at its homes, which every app reads.
//
// The same code runs in Ummia's program (a folder, `store.ts`) and its web
// client (the browser, `web/keep.ts`). A `Keep` says where.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { base64, hex, sha256, signingPublic, unhex } from '../../genesis/src/core.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { Refused, fromWords, groupId, toWords } from '../../../modules/carry/src/carry.ts';
import { readId } from '../../genesis/src/forms.ts';
import { carriedKey, lookCurrent, servedChain } from '../../dub/src/carryin.ts';
import { changeAccepted, publishAccepted, readAccepted } from '../../damgar/src/accepted.ts';
import { OURS as DAMGAR_PART, labelOf as damgarLabel } from '../../damgar/src/specs.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import { actors, chosen } from './acting.ts';
import { ANCHOR_SAY, ask as askAnchor, offers as anchorOffers, standing as anchorStanding, type Asked, type AnchorShown, type Offer } from './anchor.ts';
import { FORKABLE, MIP_SAY, publishDraft, replies as mipReplies, shapeOf, template, type MipDraft, type Reply } from './mips.ts';
import { REPORT_SAY, answers as reportAnswers, send as sendReport, type Answer, type Sent } from './reports.ts';
import type { OwnRelease, Releases } from './releases.ts';
import { KINDS, TASKS, prepareSpec, publishSpec, readHash, type SpecForm } from './spec.ts';
import { LIMIT_SAY, actsOf, track, type Tracked } from './track.ts';
import type { AcceptedEntry, Done, Line, Review, State } from './shapes.ts';

export type { State } from './shapes.ts';

export const TEST_ONLY = 'Test identities only, until MOR is frozen.';

/** Said where the identity is brought in (the carry Module; Identity rule 35). */
export const LINE_SAY =
  'Ummia keeps its own line of acts for this identity (its specifications, releases, drafts, reports, and the sealed acts it sends to itself). If the signing key is ever changed with the chain key, in Kišib, that change must keep this line, or every act signed here becomes void. Some of its acts are sealed, so give Kišib this line’s card, shown in the identity window.';

/** Said when a rotation made elsewhere counts. Its first words are how the page knows it. */
export const SPENT_SAY =
  'This identity’s signing key was changed elsewhere, with its chain key, so the signing key’s words Ummia holds no longer count. Nothing was signed. To go on here, give Ummia the new signing key’s words.';

/** Said where an encryption key is not held. */
export const NO_KEY_SAY =
  'Ummia holds no encryption key for this identity, so nothing sealed to it opens here and nothing can be sealed to it from here: the accepted list cannot be read or changed, and an anchor’s payment cannot be prepared for Damgar.';

/** Said where the accepted list is shown (F340). */
export const ACCEPTED_SAY = [
  'One list of the cMIPs and Modules you accept, sealed to your identity and kept at its homes: every app holding the identity reads the same list, each the part it understands (Damgar the payment specifications, Edubba the agreements’ and splits’, Dub the formats it shows). Here it is shown whole.',
  'A change is written on the latest version read, and the list is read again just before sending. Where two apps changed it at once, both changes are merged, never one dropped.',
  'Private by default; publishing it is the other choice.',
];

export interface Settings {
  /** Where this identity's public acts go: specifications, releases, drafts, reports. */
  relays: string[];
  /** The public relays tracking asks. */
  track: string[];
  /** The reporting identity (F287), by its ID. */
  reports: string | null;
  via: Via;
  /** Who acts (the chooser): the identity's own ID in round 1. */
  acting?: string | null;
}

/** A specification published from here. */
export interface Published {
  id: string;
  hash: string;
  name: string;
  kind: string;
  at: number;
}

export interface Book {
  releases: OwnRelease[];
  specs: Published[];
  mips: MipDraft[];
  reports: Sent[];
  anchors: Asked[];
  /** The published accepted list's chain, where published. */
  listPublished: { act: string; version: number; withdrawn: boolean } | null;
}

export const NO_BOOK = (): Book => ({ releases: [], specs: [], mips: [], reports: [], anchors: [], listPublished: null });

/** Where Ummia keeps things: a folder (`store.ts`) or the browser (`web/keep.ts`). */
export interface Keep {
  held(): Promise<string[]>;
  active(): Promise<string | null>;
  setActive(id: string | null): Promise<void>;
  identity(id: string): Promise<TestIdentity | null>;
  saveIdentity(id: TestIdentity): Promise<void>;
  read<T>(id: string, name: 'settings' | 'book'): Promise<T | null>;
  write(id: string, name: 'settings' | 'book', v: unknown): Promise<void>;
  forget(id: string): Promise<void>;
  exclusive<T>(f: () => Promise<T>): Promise<T>;
}

const list = (xs: string[]) => [...new Set(xs.map((s) => s.trim().replace(/\/$/, '')).filter(Boolean))];
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
export const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);

interface Plan {
  digest: string;
  identity: string;
  expires: number;
  blocking: string[];
  run(): Promise<Done>;
}

const PLAN_FOR = 15 * 60 * 1000;

export class Ummia {
  private queue: Promise<unknown> = Promise.resolve();
  private plans = new Map<string, Plan>();

  /** `web`: the web client. `releases`: the program's (a folder). `chain`: the chain followed (program only). */
  constructor(
    readonly store: Keep,
    readonly opts: { web?: boolean; releases?: Releases | null; chain?: ChainSource | null } = {},
  ) {}

  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async ctx(): Promise<{ me: TestIdentity; s: Settings; book: Book; hints: string[] }> {
    const active = await this.store.active();
    const me = active ? await this.store.identity(active) : null;
    if (!me) throw new Error('No identity in use: bring one by its signing key’s words.');
    const s: Settings = { relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(me.id, 'settings')) ?? {}) };
    const book: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
    return { me, s, book, hints: [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])] };
  }

  private saveBook(id: string, book: Book) {
    return this.store.write(id, 'book', book);
  }

  /** Who acts, from the chooser: the one chosen, if it may act. Round 1: oneself. */
  private async acting(me: TestIdentity, s: Settings): Promise<TestIdentity> {
    const who = chosen(actors(await this.store.held()), s.acting ?? me.id);
    if (!who || who.id !== me.id) throw new Error('Choose who acts: yourself, in round 1.');
    return me;
  }

  // ------------------------------------------------------------ the identity

  /**
   * Bring an identity by its ID and its signing key's words (the carry
   * Module, section 4): kept only if the words give its current signing
   * key; its encryption key where the words carry it. Ummia starts its own
   * line. One already held takes the new words instead.
   */
  bring(a: { id: string; words: string; address: string; relays?: string[]; via?: Via }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const via = a.via ?? {};
      let id: string;
      let seed: Uint8Array;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error('Give an address where this identity is found (one of its homes), starting with https://.');
      const look = await lookCurrent(id, seed, [address], via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via);
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) throw new Error('This identity names no relays. Give one or more relay addresses, and bring it again.');
      const enc = carriedKey(look, seed);
      const f: IdentityFile = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        safety: { scheme: 0, seeds: '' },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc ? [enc] : [],
        pending: null,
      };
      await this.store.write(id, 'settings', { relays, track: relays, reports: null, via, acting: id } satisfies Settings);
      await this.store.saveIdentity(new TestIdentity(f, via));
      await this.store.setActive(id);
      return {
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          enc ? { text: 'Its encryption key is the one the words carry: its accepted list opens here.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
  }

  /** The new signing key's words, after a rotation made elsewhere counts (the carry Module, 4.6). */
  renew(words: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error('No identity in use.');
      let seed: Uint8Array;
      try {
        seed = fromWords(words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      return this.renewHeld(active, seed);
    });
  }

  private async renewHeld(id: string, seed: Uint8Array): Promise<{ lines: Line[] }> {
    const me = (await this.store.identity(id))!;
    const s = (await this.store.read<Settings>(id, 'settings')) ?? { relays: [], track: [], reports: null, via: {} };
    if (hex(seed) === me.f.signingSecret) throw new Error('These are the signing key’s words Ummia already holds, and they still count: nothing to change.');
    const look = await lookCurrent(id, seed, [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    const r = look.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    me.f.sequence = [];
    me.f.routes = null;
    const carried = carriedKey(look, seed);
    if (carried && !me.f.encryption.some((e) => e.act === carried.act)) me.f.encryption.push(carried);
    await this.store.saveIdentity(me);
    return {
      lines: [
        { text: 'The new signing key’s words give its current signing key. Ummia signs with them from now on, in a new line.', tone: 'ok' },
        carried ? { text: 'Its encryption key is the one the new words carry.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
        { text: LINE_SAY, tone: 'warn' },
      ],
    };
  }

  async use(id: string): Promise<void> {
    if (!(await this.store.held()).includes(id)) throw new Error('Ummia does not hold that identity.');
    await this.store.setActive(id);
  }

  async leave(): Promise<void> {
    await this.store.setActive(null);
  }

  /** Forget an identity here: its keys and its book go. What it signed stays where it was sent. */
  forget(id: string): Promise<void> {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error('Ummia does not hold that identity.');
      const was = await this.store.active();
      await this.store.forget(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }

  /** The signing key's words, on request: the way back if this app's storage is lost. */
  async carry(): Promise<{ id: string; grouped: string; words: string[] }> {
    const { me } = await this.ctx();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)) };
  }

  /** Whether the signing key Ummia holds still counts. */
  async check(): Promise<{ current: boolean; say: string | null }> {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e) {
      if (message(e) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e;
    }
  }

  private async current(me: TestIdentity): Promise<void> {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing was signed.');
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }

  /** Who acts: chosen with the chooser. */
  setActing(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const who = actors(await this.store.held()).find((a) => a.id === id && a.available);
      if (!who) throw new Error('That one cannot act here.');
      if (who.id !== me.id) await this.store.setActive(who.id);
      const target = who.id === me.id ? s : ({ relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(who.id, 'settings')) ?? {}) } as Settings);
      await this.store.write(who.id, 'settings', { ...target, acting: who.id });
      return { lines: [{ text: `Acting as yourself, ${who.short}.`, tone: 'ok' }] };
    });
  }

  /** Settings: where this identity's acts go, the relays tracking asks, the reporting identity. */
  setSettings(a: { relays?: string[]; track?: string[]; reports?: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const next: Settings = { ...s };
      if (a.relays) {
        if (!list(a.relays).length) throw new Error('Name at least one relay its acts go to.');
        next.relays = list(a.relays);
      }
      if (a.track) next.track = list(a.track);
      if (a.reports !== undefined) {
        const t = a.reports.trim();
        next.reports = t ? readId(t) : null;
      }
      await this.store.write(me.id, 'settings', next);
      return { lines: [{ text: 'Saved.', tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ state

  async state(): Promise<State> {
    const active = await this.store.active();
    const heldIds = await this.store.held();
    const held = heldIds.map((id) => ({ id, grouped: groupId(id), short: short(id), active: id === active }));
    const me = active ? await this.store.identity(active) : null;
    const out: State = {
      web: !!this.opts.web,
      stage: 'identity',
      held,
      identity: null,
      actors: actors(heldIds),
      acting: null,
      settings: { relays: [], track: [], reports: null },
      releases: !!this.opts.releases,
      counts: { specs: 0, releases: 0, mips: 0, reports: 0 },
    };
    if (!me) return out;
    const s: Settings = { relays: [], track: [], reports: null, via: {}, ...((await this.store.read<Settings>(me.id, 'settings')) ?? {}) };
    const book: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
    const own = ownLine(me.f.sequence);
    out.stage = 'ready';
    out.identity = {
      id: me.id,
      grouped: groupId(me.id),
      short: short(me.id),
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null },
    };
    out.acting = chosen(out.actors, s.acting ?? me.id)?.id ?? null;
    out.settings = { relays: s.relays, track: s.track, reports: s.reports };
    out.counts = { specs: book.specs.length, releases: book.releases.length, mips: book.mips.length, reports: book.reports.length };
    return out;
  }

  // ------------------------------------------------------------ reviews

  private plan(identity: string, p: { digest: string; blocking: string[]; run(): Promise<Done> }): string {
    const id = sha256(`${p.digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(id, { ...p, identity, expires: Date.now() + PLAN_FOR });
    return id;
  }

  /** Carry out a review exactly as shown: only with its digest, within 15 minutes, once, never with reasons not to sign. */
  confirm(planId: string, digest: string): Promise<Done> {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const p = this.plans.get(planId);
      if (!p || p.expires < Date.now() || p.identity !== me.id) throw new Error('This review has expired or was already used. Review it again. Nothing was signed.');
      if (p.digest !== digest) throw new Error('The digest does not match what was shown. Nothing was signed.');
      if (p.blocking.length) throw new Error(`${p.blocking.join(' ')} Nothing was signed.`);
      this.plans.delete(planId);
      await this.current(me);
      return p.run();
    });
  }

  cancel(planId: string): void {
    this.plans.delete(planId);
    this.opts.releases?.cancel(planId);
  }

  // ------------------------------------------------------------ specifications

  /** What a specification form needs: the kinds, the tasks, what a MIP may fork. */
  specChoices() {
    return {
      kinds: [
        { kind: 0, name: KINDS[0] },
        { kind: 1, name: KINDS[1] },
      ],
      tasks: Object.entries(TASKS).map(([n, [layer, name]]) => ({ n: Number(n), layer, name })),
      forkable: FORKABLE,
    };
  }

  /** A specification made and read back, its hash shown; nothing signed until confirmed. */
  async prepareSpec(f: SpecForm): Promise<Review> {
    const { me, s } = await this.ctx();
    const actor = await this.acting(me, s);
    const form: SpecForm = {
      ...f,
      implements: f.implements ? readHash(f.implements, 'What it implements') : null,
      predecessor: f.predecessor ? readHash(f.predecessor, 'Its predecessor') : null,
      dependencies: (f.dependencies ?? []).map((d) => readHash(d, 'A dependency')),
    };
    const p = prepareSpec(form, actor.id);
    const blocking = [...p.blocking];
    if (!s.relays.length) blocking.push('Name at least one relay its acts go to, under Settings.');
    const sp = p.spec;
    const fields: Line[] = sp
      ? [
          { text: `Kind: ${KINDS[sp.kind]}. Its creator: you, ${short(actor.id)} (field 1): its hash covers your identity, so it is “this specification, by this identity”.` },
          ...sp.tasks.map(([, n]) => ({ text: `Fills task ${n}: ${TASKS[n][1]} (${TASKS[n][0]}).` })),
          ...sp.types.map((t) => ({ text: `Defines act type ${t.type}, “${t.name}” (field 3, for discovery).` })),
          ...(sp.types.length && !sp.tasks.length ? [{ text: 'Act types and no task: an xtype (Development rule 18).' }] : []),
          ...(sp.implements ? [{ text: `Works under ${sp.implements} (field 5).` }] : []),
          ...(sp.predecessor ? [{ text: `${sp.kind === 8 ? 'Forks' : 'Replaces, for its users,'} ${sp.predecessor} (field 8).` }] : []),
          ...(sp.layers ? [{ text: `As an extension, acts on the layers ${sp.layers.join(', ')} beyond Development (field 10).` }] : []),
          ...(sp.rail ? [{ text: `A ${sp.rail.kind} rail, its proof binding ${sp.rail.binds.join(', ') || 'nothing'} (fields 11 and 13).` }] : []),
          ...(sp.checker ? [{ text: 'Checks proofs of delivery (field 12).' }] : []),
          ...sp.dependencies.map((d) => ({ text: `Depends on ${d} (field 4, for discovery).` })),
        ]
      : [];
    const digest = sha256(new TextEncoder().encode(`MOR Ummia specification, version 1\n${actor.id}\n${p.hash}\n${s.relays.join('\n')}`));
    const plan = this.plan(me.id, {
      digest,
      blocking,
      run: async () => {
        let out;
        try {
          out = await publishSpec(me, p.content, s.relays);
        } finally {
          await this.store.saveIdentity(me);
        }
        const book: Book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
        book.specs.push({ id: out.id, hash: p.hash, name: p.name, kind: KINDS[form.kind], at: now() });
        if (form.kind === 8) {
          const m = book.mips.find((x) => x.text === form.text && !x.published);
          if (m) m.published = { id: out.id, hash: p.hash };
        }
        await this.saveBook(me.id, book);
        return {
          title: `${p.name} is published`,
          hash: p.hash,
          acts: [out.id],
          lines: [
            { text: `Its spec hash: ${p.hash}. Agreements and acts name it by this hash, wherever it is published.`, tone: 'ok' },
            { text: `Its publication: ${out.id}, on ${s.relays.join(', ')}.`, tone: 'ok' },
            ...out.refused.map((r) => ({ text: `Its content was refused by ${r}`, tone: 'warn' as const })),
          ],
        };
      },
    });
    return {
      plan,
      digest,
      hash: p.hash,
      title: `Publish ${form.kind === 8 ? 'the MIP' : `the ${KINDS[form.kind] ?? 'specification'}`} “${p.name}”`,
      summary: [
        `Its spec hash will be ${p.hash || '(none: it is not yet in the format)'}. The hash covers its content (the fields below and its text), never the act that publishes it.`,
        'Published for good: a changed specification is a new one, with a new hash, naming this one as its predecessor if you wish (Development rule 4).',
        'Nothing is signed until you press Sign and publish.',
      ],
      sections: [
        { heading: 'What it carries', lines: fields },
        { heading: 'Who signs, and where it goes', lines: [{ text: `A public publication signed by you, its content on ${s.relays.join(', ') || '(no relay yet)'}: anyone can fetch it by its hash, and adopt it, or not.` }] },
        { heading: 'A reading of the publishing rule (F322)', lines: [{ text: 'Ummia writes the fields the kind requires, and only the optional fields you filled. Fill only what your text says: two publications of one text that differ in an optional field are two specifications, with two hashes.' }] },
      ],
      blocking,
    };
  }

  /** The specifications published from here. */
  async specs(): Promise<Published[]> {
    const { book } = await this.ctx();
    return [...book.specs].reverse();
  }

  // ------------------------------------------------------------ tracking

  /** A plain look-up of the relays named (or tracking's own), with the filters relays have. */
  async track(a: { relays?: string[]; signer?: string } = {}): Promise<Tracked> {
    const { s } = await this.ctx();
    const relays = a.relays?.length ? list(a.relays) : s.track;
    if (!relays.length) throw new Error('Name the public relays to ask, under Settings or here.');
    return track(relays, { signer: a.signer ? readId(a.signer) : undefined, via: s.via });
  }

  /** The public acts of one specification (an xtype, say), by the feed's `spec`, `type` and `signer` filters. */
  async actsOf(a: { spec: string; type?: number | null; signer?: string; relays?: string[] }) {
    const { s } = await this.ctx();
    const relays = a.relays?.length ? list(a.relays) : s.track;
    if (!relays.length) throw new Error('Name the public relays to ask, under Settings or here.');
    return actsOf(relays, { spec: readHash(a.spec, 'The specification'), type: a.type ?? undefined, signer: a.signer ? readId(a.signer) : undefined, via: s.via });
  }

  limit(): string[] {
    return LIMIT_SAY;
  }

  // ------------------------------------------------------------ the accepted list (F340)

  private secrets(me: TestIdentity): Uint8Array[] {
    return [...me.f.encryption].reverse().map((e) => unhex(e.secret));
  }

  /** The whole list, as every app reads it: each entry, its label, and whose part it is where known. */
  async accepted(): Promise<{ entries: AcceptedEntry[]; version: number; forked: boolean; merged: string[]; published: boolean; problems: string[]; say: string[] }> {
    const { me, book } = await this.ctx();
    const l = await readAccepted(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), me.via);
    const entries: AcceptedEntry[] = [...l.entries.entries()]
      .map(([hash, label]) => ({ hash, label: label ?? damgarLabel(hash) ?? null, part: DAMGAR_PART.has(hash) ? 'Money: Damgar’s part' : 'Read by the apps that know it' }))
      .sort((a, b) => (a.part < b.part ? -1 : a.part > b.part ? 1 : (a.label ?? a.hash) < (b.label ?? b.hash) ? -1 : 1));
    return {
      entries,
      version: l.version,
      forked: l.tips.length > 1,
      merged: l.merged,
      published: !!book.listPublished && !book.listPublished.withdrawn,
      problems: [...(me.f.encryption.length ? [] : [NO_KEY_SAY]), ...l.problems],
      say: ACCEPTED_SAY,
    };
  }

  /** Change the list: add (with a label) and remove entries, every other entry kept as found; merged where forked. */
  changeAccepted(a: { add?: { hash: string; label?: string | null }[]; remove?: string[] }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me } = await this.ctx();
      await this.current(me);
      if (!me.f.encryption.length) throw new Error(NO_KEY_SAY);
      const add = (a.add ?? []).map((x) => ({ hash: readHash(x.hash, 'A specification to accept'), label: x.label?.trim().slice(0, 120) || null }));
      const remove = (a.remove ?? []).map((h) => readHash(h, 'A specification to remove'));
      const r = await changeAccepted(
        me,
        (entries) => {
          for (const x of add) entries.set(x.hash, x.label ?? entries.get(x.hash) ?? damgarLabel(x.hash) ?? null);
          for (const h of remove) entries.delete(h);
        },
        { via: me.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) },
      );
      const lines: Line[] = [];
      if (r.list.merged.length) lines.push({ text: `Two apps had changed the accepted list at once. Both changes were merged: ${r.list.merged.join(' ')}`, tone: 'warn' });
      lines.push(r.written ? { text: `Sealed to this identity and kept at its homes (version ${r.list.version}): every app holding it reads the change.`, tone: 'ok' } : { text: 'Nothing changed.' });
      return { lines };
    });
  }

  /** The other choice (F59): publish the accepted list, or withdraw it. */
  publishList(on: boolean): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const l = await readAccepted(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), me.via);
      const id = await publishAccepted(me, l, s.relays, book.listPublished ? { act: book.listPublished.act, version: book.listPublished.version } : null, !on, () => this.store.saveIdentity(me));
      book.listPublished = { act: id, version: (book.listPublished?.version ?? 0) + 1, withdrawn: !on };
      await this.saveBook(me.id, book);
      return { lines: [on ? { text: `Published at ${s.relays.join(', ')}: anyone can read which specifications you accept.`, tone: 'warn' } : { text: 'Withdrawn: it is private again. Earlier versions stay readable as acts.', tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ MIPs

  async mips(): Promise<{ drafts: MipDraft[]; say: string[]; forkable: typeof FORKABLE }> {
    const { book } = await this.ctx();
    return { drafts: book.mips, say: MIP_SAY, forkable: FORKABLE };
  }

  /** Start a MIP in the MIP shape: what it forks, by name (a MIR) or by spec hash (a MIP, the MICS document). */
  newMip(a: { title: string; forks: string }): Promise<{ key: string; text: string }> {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const named = FORKABLE.find((f) => f.key === a.forks);
      const forks = named ? named.hash : readHash(a.forks, 'What it forks');
      const forksName = named ? named.name : `the specification ${short(forks)}`;
      const text = template({ title: a.title, forks: `${forksName} (${forks})`, creator: short(me.id) });
      const key = sha256(`${me.id}${a.title}${Date.now()}${Math.random()}`).slice(0, 16);
      book.mips.push({ key, title: a.title.trim() || 'A proposal', forks, forksName, drafts: [], text, published: null });
      await this.saveBook(me.id, book);
      return { key, text };
    });
  }

  /** Keep the text as written here (nothing signed), with the shape checked. */
  saveMip(key: string, text: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error('No such draft here.');
      if (m.published) throw new Error('This MIP is published as a specification: a changed MIP is a new one. Start a new draft.');
      m.text = text;
      await this.saveBook(me.id, book);
      return { lines: [{ text: 'Kept here: nothing is signed or sent.', tone: 'ok' }, ...shapeOf(text)] };
    });
  }

  /** Publish a draft for discussion: a signed long-form document, public; not a specification. */
  publishMipDraft(key: string): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      await this.acting(me, s);
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error('No such draft here.');
      if (!s.relays.length) throw new Error('Name at least one relay its acts go to, under Settings. Nothing was signed.');
      let id: string;
      try {
        ({ id } = await publishDraft(me, m.text, s.relays));
      } finally {
        await this.store.saveIdentity(me);
      }
      m.drafts.push({ id, at: now(), name: m.text.split('\n')[0].replace(/^#+\s*/, '').slice(0, 120) });
      await this.saveBook(me.id, book);
      return {
        title: `Draft ${m.drafts.length} is published for discussion`,
        acts: [id],
        lines: [
          { text: `A signed long-form document, public: ${id}. It can be opened in the reader by its id, and answered from Dub.`, tone: 'ok' },
          { text: 'It is not a specification: nothing names it by a spec hash. Publish the MIP as a specification only when you are ready.' },
          ...shapeOf(m.text),
        ],
      };
    });
  }

  /** The replies to a MIP's drafts. */
  async mipReplies(key: string): Promise<{ replies: Record<string, Reply[]>; lines: Line[] }> {
    const { me, s, book } = await this.ctx();
    const m = book.mips.find((x) => x.key === key);
    if (!m) throw new Error('No such draft here.');
    const r = await mipReplies(me, m.drafts.map((d) => d.id), [...new Set([...s.relays, ...s.track])], s.via);
    return { replies: Object.fromEntries(r.replies), lines: r.lines };
  }

  /** Ready: the MIP as a specification (kind 8), naming its creator and what it would replace. Read back first, as any specification. */
  prepareMip(key: string): Promise<Review> {
    return this.ctx().then(({ book }) => {
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error('No such draft here.');
      if (m.published) throw new Error('This MIP is published already.');
      return this.prepareSpec({ kind: 8, text: m.text, predecessor: m.forks });
    });
  }

  // ------------------------------------------------------------ reports

  async reports(): Promise<{ sent: Sent[]; answers: Answer[]; lines: Line[]; say: string[]; to: string | null }> {
    const { s, book } = await this.ctx();
    const sent = [...book.reports].reverse();
    if (!s.reports) return { sent, answers: [], lines: [], say: REPORT_SAY, to: null };
    const r = await reportAnswers(s.reports, sent.map((x) => x.id), [...new Set([...s.relays, ...s.track])], s.via);
    return { sent, answers: r.answers, lines: r.lines, say: REPORT_SAY, to: s.reports };
  }

  /** Send a report from one's own identity to the reporting identity (F287). */
  sendReport(text: string): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      await this.acting(me, s);
      if (!s.reports) throw new Error('Give the reporting identity’s ID under Settings first. Nothing was signed.');
      if (!text.trim()) throw new Error('Write the report first. Nothing was signed.');
      if (!s.relays.length) throw new Error('Name at least one relay its acts go to, under Settings. Nothing was signed.');
      const r = await sendReport(me, { to: s.reports, text: text.trim(), relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me) });
      book.reports.push(r.sent);
      await this.saveBook(me.id, book);
      return { title: 'The report is sent', acts: [r.sent.id], lines: r.lines };
    });
  }

  // ------------------------------------------------------------ releases (on a computer)

  private releasesHere(): Releases {
    if (!this.opts.releases) throw new Error('Releases are made from a folder on a computer: in Ummia on the Mac or Linux, not in the web client.');
    return this.opts.releases;
  }

  /** This identity's releases: those made here, then those found on its relays (a line begun in Edubba before F339 goes on here). */
  private async ownReleases(me: TestIdentity, book: Book, hints: string[], via: Via): Promise<OwnRelease[]> {
    const here = new Set(book.releases.map((r) => r.id));
    const found = this.opts.releases ? await this.opts.releases.found(me.id, hints, via) : [];
    return [...found.filter((r) => !here.has(r.id)), ...book.releases];
  }

  async releases(): Promise<{ releases: { id: string; name: string; version: string; folder: string }[]; anchors: AnchorShown[]; anchorSay: string[] }> {
    const { me, book, hints, s } = await this.ctx();
    const anchors: AnchorShown[] = [];
    for (const x of book.anchors) anchors.push(await anchorStanding(x, [...hints, ...s.track], s.via, this.opts.chain ?? null));
    const own = this.opts.releases ? await this.ownReleases(me, book, hints, s.via) : book.releases;
    return { releases: [...own].reverse().map(({ id, name, version, folder }) => ({ id, name, version, folder })), anchors, anchorSay: ANCHOR_SAY };
  }

  async suggestRelease(folder: string) {
    const { me, book, hints, s } = await this.ctx();
    return this.releasesHere().suggest(await this.ownReleases(me, book, hints, s.via), folder);
  }

  async prepareRelease(a: { folder: string; name: string; version: string; previous: string | null; implements: string[] }): Promise<Review> {
    const { me, s, book, hints } = await this.ctx();
    await this.acting(me, s);
    return this.releasesHere().prepare(me, await this.ownReleases(me, book, hints, s.via), { ...a, relays: s.relays, via: s.via });
  }

  confirmRelease(plan: string, digest: string): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      let r;
      try {
        r = await this.releasesHere().confirm(me, await this.ownReleases(me, book, [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via), plan, digest, s.relays, s.via);
      } finally {
        await this.store.saveIdentity(me);
      }
      book.releases.push(r.release);
      await this.saveBook(me.id, book);
      return r.done;
    });
  }

  /** Check it as anyone would: the release fetched by its id from the relays alone, every file checked. */
  async checkRelease(id: string) {
    const { s, hints } = await this.ctx();
    return this.releasesHere().check(readHash(id, 'The release'), [...new Set([...hints, ...s.track])], s.via);
  }

  // ------------------------------------------------------------ anchoring a release (optional; paid in Damgar)

  async anchorOffers(service: string): Promise<Offer[]> {
    const { s, hints } = await this.ctx();
    return anchorOffers(readId(service), [...hints, ...s.track], s.via);
  }

  anchorRelease(a: { release: string; service: string; offer: string; tier: number }): Promise<Done> {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      await this.current(me);
      const rel = (await this.ownReleases(me, book, hints, s.via)).find((x) => x.id === a.release);
      if (!rel) throw new Error('That is not one of your releases published from here.');
      const service = readId(a.service);
      const offer = (await anchorOffers(service, [...hints, ...s.track], s.via)).find((o) => o.act === a.offer);
      if (!offer) throw new Error('No such standing offer of that service was found under the anchoring cMIP.');
      const r = await askAnchor(me, { act: rel.id, label: `the release ${rel.name} ${rel.version}`, service, offer, tier: a.tier, hints, via: s.via, save: () => this.store.saveIdentity(me) });
      book.anchors.push(r.asked);
      await this.saveBook(me.id, book);
      return { title: 'An anchor asked', acts: [r.asked.draft], lines: r.lines };
    });
  }
}
