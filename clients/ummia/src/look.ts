// Look (decided by Nobody, allegedly, on the redesign: "One feed, point at
// (relay, single ID, contact list, release) filter by (releases, cMIPs,
// modules, xtypes)", and extensions; "more a poking tool… see all sorts of
// acts and filter by their type"). One feed, read from the relays the
// person names with the filters relays already have, as tracking always
// was: nothing indexed, kept or published, no new cMIP. Each specification
// shows its creator's latest card's title where it has one (the Dubsar
// Specification Card cMIP); each release says what changed since the
// version before (accepted). The Dubsar clock orders the feed and gives
// each item its time; where it stamped nothing, the signer's own hint.
//
// A page per specification gathers what can be tied to it (decided 23
// October 2026): its text, the cards, its releases, vectors, discussion,
// the public agreements naming it, its drafts and its creator.
//
// Nothing from Node: the web client runs it too.

import { SPECS, cborDecode, describeAct, hex, openMedia, workHash } from '../../genesis/src/core.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { Judge } from '../../barebone/src/post.ts';
import { clockTimes, byClock, newestFirst } from '../../barebone/src/clock.ts';
import { decodeManifest, type Manifest } from '../../repo/src/manifest.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { specForm, actForm } from '../../genesis/src/forms.ts';
import { BUILT_IN, BUILT_IN_SAY, builtIn, cardsFor, ownCard, readCards, type CardRead, type FoundCard } from './cards.ts';
import { LIMIT_SAY, track, type Tracked, type TrackedSpec } from './track.ts';
import type { Line } from './shapes.ts';

/** What Look points at (decided). */
export type PointKind = 'relay' | 'id' | 'contacts' | 'release';

/** What it filters by (decided; extensions added; MIPs kept from tracking). */
export const FILTERS = ['releases', 'cmips', 'modules', 'xtypes', 'extensions', 'mips'] as const;
export type Filter = (typeof FILTERS)[number];
export const FILTER_WORDS: Record<Filter, string> = { releases: 'releases', cmips: 'cMIPs', modules: 'Modules', xtypes: 'xtypes', extensions: 'extensions', mips: 'MIPs' };

/** The layers a specification can belong to (filter by layer, decided for Choose and offered here too). */
export const LAYER_NAMES = ['Identity', 'Text', 'Envelopes', 'Money', 'Agreements', 'Development'] as const;

/** Said under the feed, in one line, and behind its "?" (decided: "Public agreements only, as the relays answer"). */
export const LOOK_SAY = 'Public agreements only, as the relays answer';
export { LIMIT_SAY };

/** One item of the feed: an act, as a card shows it. */
export interface LookItem {
  /** The act: a specification's publication, or a release's. */
  id: string;
  signer: string;
  /** What it is: release, cMIP, Module, xtype, MIP, extension. */
  kind: string;
  filter: Filter;
  title: string;
  text: string;
  /** A specification's hash, easy to copy (decided). */
  hash: string | null;
  layer: string | null;
  labels: { text: string; tone?: 'warn' | 'bad' }[];
  verified: boolean;
  alarm: string | null;
  /** By the Dubsar clock, in words; or null. */
  when: string | null;
  hint: string | null;
  release?: { name: string; version: string; files: number; previous: string | null; changed: string | null; implements: string[] };
}

export interface Looked {
  items: LookItem[];
  lines: Line[];
  /** Tracking's counts (F339): agreements read, and the relays asked. */
  counts: Line[];
  ordered: { placed: number; shown: number };
}

// ---------------------------------------------------------------- releases

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  hint?: string;
}

/** A release found: its manifest read and checked against its work hash, judged through its signer's chain. */
export interface FoundRelease {
  id: string;
  signer: string;
  manifest: Manifest;
  standing: string;
  hint: string | null;
}

async function manifestOf(d: Described, places: string[], via: Via): Promise<Manifest | null> {
  if (!d.payload) return null;
  const m = cborDecode(d.payload) as Map<number, unknown>;
  if (!(m.get(0) instanceof Uint8Array) || hex(m.get(0) as Uint8Array) !== REPO_SPECS.manifest || !(m.get(5) instanceof Uint8Array)) return null;
  for (const at of places) {
    try {
      const locked = await relayAt(at, via).getMedia(hex(m.get(2) as Uint8Array));
      if (!locked) continue;
      const plain = openMedia(locked, m.get(5) as Uint8Array, m.get(4) as Uint8Array) as Uint8Array;
      if (workHash(plain) !== hex(m.get(1) as Uint8Array)) continue;
      return decodeManifest(plain);
    } catch {
      // the next place
    }
  }
  return null;
}

/** The releases at the relays named (of one signer, where given), each read and judged. */
export async function releasesAt(relays: string[], via: Via, judge: Judge, signer?: string): Promise<FoundRelease[]> {
  const out = new Map<string, FoundRelease>();
  for (const r of relays) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(r, via).feed({ spec: SPECS.envelopes, type: 0, signer, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          const d = describeAct(it.item) as Described;
          if (!d.public || !d.signer || out.has(d.id)) continue;
          const manifest = await manifestOf(d, [r, ...relays], via);
          if (!manifest) continue;
          let standing = 'unknown';
          try {
            standing = await judge.standing(it.item, d.id, d.signer);
          } catch (e) {
            standing = `not checked: ${e instanceof Error ? e.message : String(e)}`;
          }
          out.set(d.id, { id: d.id, signer: d.signer, manifest, standing, hint: d.hint ?? null });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that relay is away
    }
  }
  return [...out.values()];
}

/** One release, by its id, from the relays named. */
export async function releaseById(id: string, relays: string[], via: Via, judge: Judge): Promise<FoundRelease | null> {
  for (const r of relays) {
    try {
      const act = await relayAt(r, via).getAct(id);
      if (!act) continue;
      const d = describeAct(act) as Described;
      const manifest = d.signer ? await manifestOf(d, [r, ...relays], via) : null;
      if (!manifest) return null;
      return { id, signer: d.signer!, manifest, standing: await judge.standing(act, id, d.signer!).catch(() => 'unknown'), hint: d.hint ?? null };
    } catch {
      // the next relay
    }
  }
  return null;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** A form for people, short (`mspec1745…mvq`): the whole is copied from its card. */
const short = (form: string) => `${form.slice(0, form.indexOf('1') + 4)}…${form.slice(-3)}`;

/**
 * What changed since the version before (accepted): the files changed,
 * added and removed, by path and fingerprint, and the specifications it
 * implements that the one before did not. Null where it names none before.
 */
export function changedSince(m: Manifest, before: Manifest | null): string | null {
  if (!m.previous) return null;
  if (!before) return 'The release before it is not found on these relays: what changed cannot be said.';
  const was = new Map(before.files.map((f) => [f.path, f.work]));
  const now = new Map(m.files.map((f) => [f.path, f.work]));
  const changed = [...now].filter(([p, w]) => was.has(p) && was.get(p) !== w).length;
  const added = [...now.keys()].filter((p) => !was.has(p)).length;
  const removed = [...was.keys()].filter((p) => !now.has(p)).length;
  const parts = [changed ? `${plural(changed, 'file')} changed` : '', added ? `${added} added` : '', removed ? `${removed} removed` : ''].filter(Boolean);
  const impl = (m.implements ?? []).filter((i) => !(before.implements ?? []).some((b) => b.spec === i.spec)).map((i) => specForm(i.spec));
  const libs = m.dependencies.length !== before.dependencies.length || m.dependencies.some((d, i) => before.dependencies[i]?.version !== d.version || before.dependencies[i]?.name !== d.name);
  const said = [parts.length ? parts.join(', ') : 'no file changed', ...(libs ? ['its libraries changed'] : []), ...(impl.length ? [`now implements ${impl.join(', ')}`] : [])];
  return `What changed since ${before.version}: ${said.join('; ')}.`;
}

function releaseItem(r: FoundRelease, before: Manifest | null): LookItem {
  const m = r.manifest;
  const changed = changedSince(m, before);
  return {
    id: r.id,
    signer: r.signer,
    kind: 'release',
    filter: 'releases',
    title: `${m.name} ${m.version}`,
    text: `${m.name} ${m.version} · ${plural(m.files.length, 'file')}${changed ? `\n${changed}` : ''}${m.implements?.length ? `\nImplements ${m.implements.map((i) => specForm(i.spec)).join(', ')}.` : ''}`,
    hash: null,
    layer: null,
    labels: [],
    verified: r.standing === 'valid',
    alarm: r.standing === 'valid' ? null : `not valid for its signer’s chain: ${r.standing}`,
    when: null,
    hint: r.hint,
    release: { name: m.name, version: m.version, files: m.files.length, previous: m.previous, changed, implements: (m.implements ?? []).map((i) => i.spec) },
  };
}

/** Each release with the manifest of the one before it, from those found or fetched by id. */
async function withBefore(rs: FoundRelease[], relays: string[], via: Via, judge: Judge): Promise<LookItem[]> {
  const byId = new Map(rs.map((r) => [r.id, r]));
  const out: LookItem[] = [];
  for (const r of rs) {
    const p = r.manifest.previous;
    let before = p ? (byId.get(p)?.manifest ?? null) : null;
    if (p && !before) {
      const got = await releaseById(p, relays, via, judge);
      if (got) byId.set(p, got);
      before = got?.manifest ?? null;
    }
    out.push(releaseItem(r, before));
  }
  return out;
}

// ---------------------------------------------------------------- specifications

const filterOf = (s: TrackedSpec): Filter => (s.kind === 'MIP' ? 'mips' : s.kind === 'Module' ? 'modules' : s.role.some((r) => r.startsWith('an xtype')) ? 'xtypes' : 'cmips');

function specItem(s: TrackedSpec, card: FoundCard | null): LookItem | null {
  const pub = s.publications.find((p) => p.signer === s.creator) ?? s.publications[0];
  if (!pub) return null;
  const f = filterOf(s);
  const title = card?.fields.title ?? s.name;
  const use = s.use ? `\nUsed: ${plural(s.use.acts, 'public act')} of its types${s.use.notValid ? ` (${s.use.notValid} not valid, not counted)` : ''}.` : '';
  return {
    id: pub.id,
    signer: pub.signer,
    kind: f === 'xtypes' ? 'xtype' : s.kind,
    filter: f,
    title,
    text: `${title}${s.draft > 1 ? `, draft ${s.draft} in its line` : ''} · ${short(specForm(s.hash))}${card?.fields.summary ? `\n${card.fields.summary}` : `\n${s.role[0] ?? ''}`}${use}`,
    hash: s.hash,
    layer: s.layer,
    labels: [
      ...(card ? [{ text: 'its creator’s card' }] : []),
      ...(s.creator && !s.claimed ? [{ text: 'unclaimed: its named creator never published it', tone: 'warn' as const }] : []),
      ...(s.otherCreator ? [{ text: 'its creator is not its predecessor’s', tone: 'warn' as const }] : []),
      ...(s.agreements ? [{ text: `named by ${plural(s.agreements, 'public agreement')} as an extension` }] : []),
    ],
    verified: true,
    alarm: null,
    when: null,
    hint: null,
  };
}

function extensionItem(s: TrackedSpec, card: FoundCard | null): LookItem | null {
  const base = specItem(s, card);
  if (!base) return null;
  return { ...base, kind: 'extension', filter: 'extensions', text: `${base.title} · ${short(specForm(s.hash))}\nNamed as an extension by ${plural(s.agreements, 'public agreement')}.` };
}

// ---------------------------------------------------------------- the feed

/**
 * The feed: what the relays named hold, for the signers given (none: any),
 * or a release and its line; filtered by kind and by layer; ordered by the
 * Dubsar clock where it stamped, each signer's own order otherwise.
 */
export async function look(relays: string[], q: { signers?: string[]; release?: string; filters: Filter[]; layer?: string | null; via: Via; hints?: string[] }): Promise<Looked> {
  const via = q.via;
  const judge = new Judge(relays, via);
  const want = new Set(q.filters);
  const lines: Line[] = [];
  const counts: Line[] = [];
  let items: LookItem[] = [];
  if (q.release) {
    // A release and its line: each one before it, back as far as found.
    const line: FoundRelease[] = [];
    let at: string | null = q.release;
    for (let i = 0; at && i < 50; i++) {
      const r = await releaseById(at, relays, via, judge);
      if (!r) {
        if (!line.length) lines.push({ text: `The release ${actForm(at)} was not found on ${relays.join(', ')}.`, tone: 'warn' });
        break;
      }
      line.push(r);
      at = r.manifest.previous;
    }
    items = await withBefore(line, relays, via, judge);
  } else {
    const signers: (string | undefined)[] = q.signers?.length ? q.signers : [undefined];
    if (q.signers && !q.signers.length) lines.push({ text: 'Nobody to point at: your contacts are empty.', tone: 'warn' });
    const tracked: Tracked[] = [];
    for (const s of q.signers && !q.signers.length ? [] : signers) {
      const specsWanted = [...want].some((f) => f !== 'releases');
      if (specsWanted) tracked.push(await track(relays, { signer: s, via }));
      if (want.has('releases')) items.push(...(await withBefore(await releasesAt(relays, via, judge, s), relays, via, judge)));
    }
    const seen = new Set<string>();
    // The cards at these relays, read once for the whole feed (the Dubsar Specification Card cMIP, 5.1).
    const pre: CardRead[] = tracked.length ? await readCards(relays, via) : [];
    for (const t of tracked) {
      for (const s of t.specs) {
        if (seen.has(s.hash)) continue;
        seen.add(s.hash);
        const pub = s.publications.find((p) => p.signer === s.creator);
        const cards = s.creator && pub ? (await cardsFor(s.hash, s.creator, relays, via, new Map(), { pre, onlyCreator: true })).cards : [];
        const card = ownCard(cards);
        const item = specItem(s, card);
        if (item) items.push(item);
        if (s.agreements && want.has('extensions')) {
          const x = extensionItem(s, card);
          if (x) items.push({ ...x, id: x.id });
        }
      }
      for (const r of t.relays) counts.push({ text: `${r.address}: ${r.problem ? r.problem : `${r.read} acts read, ${plural(r.specs, 'specification')}${r.stopped ? ' (stopped: more than a look reads)' : ''}`}`, tone: r.problem ? 'warn' : undefined });
      counts.push({ text: `Public agreements counted: ${t.agreements.counted} (${t.agreements.proposed} proposed, not signed by every party; ${t.agreements.notCounted} not verified; ${t.agreements.private} private items unread).` });
      for (const x of t.extensions.filter((e) => !e.name)) counts.push({ text: `An extension not found on these relays, ${specForm(x.hash)}, named by ${plural(x.agreements, 'public agreement')}.` });
      for (const u of t.unverified) lines.push({ text: `Not verified: ${actForm(u.id)}: ${u.problem}`, tone: 'warn' });
    }
    // An extension's card stands beside the specification's own: it is the same act, shown once, under extensions where that filter is on.
    items = items.filter((x, i) => x.filter !== 'extensions' || !items.some((y, j) => j !== i && y.id === x.id && y.filter !== 'extensions' && want.has(y.filter)));
  }
  items = items.filter((x) => want.has(x.filter) && (!q.layer || (x.layer ?? '').split(', ').includes(q.layer)));
  // The Dubsar clock orders the feed (decided 23 October 2026), each signer's own order otherwise.
  const times = await clockTimes([...relays, ...(q.hints ?? [])], via);
  let placed = 0;
  for (const x of items) {
    const t = times.get(x.id);
    if (t !== undefined) {
      x.when = byClock(t);
      placed++;
    }
  }
  // H110: an act the clock has not stamped yet is placed by its signer's own sequence, first, as the newest.
  items = newestFirst(items, times, { id: (x) => x.id, signer: (x) => x.signer });
  return { items, lines, counts, ordered: { placed, shown: items.length } };
}

// ---------------------------------------------------------------- a page per specification

export interface SpecPage {
  hash: string;
  found: boolean;
  title: string;
  /** Its own name: its text's first line. */
  name: string | null;
  kind: string | null;
  layer: string | null;
  role: string[];
  text: string | null;
  creator: string | null;
  claimed: boolean;
  publication: { id: string; signer: string } | null;
  builtIn: { summary: string; say: string } | null;
  own: FoundCard | null;
  /** The creator's other latest cards (another line), and their superseded ones, counted. */
  ownAlso: FoundCard[];
  superseded: number;
  others: FoundCard[];
  releases: { id: string; name: string | null; version: string | null; signer: string | null; problem: string | null; from: 'manifest' | 'card' }[];
  vectors: string[];
  discussion: { id: string; text: string | null; signer: string | null } | null;
  agreements: number;
  predecessor: { hash: string; name: string | null; otherCreator: boolean } | null;
  successors: { hash: string; name: string; otherCreator: boolean }[];
  use: TrackedSpec['use'];
  lines: Line[];
}

/** Everything that can be tied to one specification, from the relays named (decided 23 October 2026). */
export async function specPage(hash: string, relays: string[], via: Via, hints: string[] = []): Promise<SpecPage> {
  const t = await track(relays, { via });
  const s = t.specs.find((x) => x.hash === hash) ?? null;
  const b = builtIn(hash);
  const times = await clockTimes([...relays, ...hints], via);
  const { cards, lines } = await cardsFor(hash, s?.creator ?? null, relays, via, times);
  const own = ownCard(cards);
  const ownAlso = cards.filter((c) => c.creators && !c.superseded && c !== own);
  const others = cards.filter((c) => !c.creators && !c.superseded);
  const judge = new Judge(relays, via);
  const releases: SpecPage['releases'] = (s?.releases ?? []).map((r) => ({ id: r.id, name: r.name, version: r.version, signer: null, problem: r.problem, from: 'manifest' as const }));
  for (const id of own?.fields.releases ?? []) {
    if (releases.some((r) => r.id === id)) continue;
    const r = await releaseById(id, relays, via, judge);
    releases.push({ id, name: r?.manifest.name ?? null, version: r?.manifest.version ?? null, signer: r?.signer ?? null, problem: r ? (r.standing === 'valid' ? null : r.standing) : 'not found on these relays', from: 'card' });
  }
  let discussion: SpecPage['discussion'] = null;
  const did = own?.fields.discussion ?? null;
  if (did) {
    discussion = { id: did, text: null, signer: null };
    for (const r of relays) {
      try {
        const a = await relayAt(r, via).getAct(did);
        if (!a) continue;
        const d = describeAct(a) as Described;
        const x = d.payload ? (cborDecode(d.payload) as Map<number, unknown>).get(0) : null;
        discussion = { id: did, text: typeof x === 'string' ? x : null, signer: d.signer ?? null };
        break;
      } catch {
        // the next relay
      }
    }
  }
  const pred = s?.after ? { hash: s.after, name: t.specs.find((x) => x.hash === s.after)?.name ?? builtIn(s.after)?.title ?? null, otherCreator: s.otherCreator } : null;
  const successors = t.specs.filter((x) => x.after === hash).map((x) => ({ hash: x.hash, name: x.name, otherCreator: !!s && x.creator !== s.creator }));
  const pub = s ? (s.publications.find((p) => p.signer === s.creator) ?? s.publications[0] ?? null) : null;
  if (!s && !b) lines.unshift({ text: `No specification with this hash was found on ${relays.join(', ')}: what is shown below is only what others say of it. Other relays may hold it.`, tone: 'warn' });
  return {
    hash,
    found: !!s || !!b,
    title: own?.fields.title ?? s?.name ?? b?.title ?? `A specification not found (${specForm(hash).slice(0, 12)}…)`,
    name: s?.name ?? b?.title ?? null,
    kind: s?.kind ?? b?.kind ?? null,
    layer: s?.layer ?? null,
    role: s?.role ?? [],
    text: s?.text ?? null,
    creator: s?.creator ?? null,
    claimed: s?.claimed ?? false,
    publication: pub,
    builtIn: b ? { summary: b.summary, say: BUILT_IN_SAY } : null,
    own,
    ownAlso,
    superseded: cards.filter((c) => c.superseded).length,
    others,
    releases,
    vectors: own?.fields.vectors ?? [],
    discussion,
    agreements: s?.agreements ?? 0,
    predecessor: pred,
    successors,
    use: s?.use ?? null,
    lines,
  };
}

export { BUILT_IN };
