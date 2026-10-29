// The founding grid (round 3, decided by Nobody, allegedly, 19 October 2026:
// "We have members and we have lanes where their signatures can count, I see a
// matrix grid, filling boxes to assign power, column and rows giving
// summaries"; "Above rather than below separated by a line. Those are the
// powers that matter most. Constitutional, judicial and then operational";
// whole layers, with kinds of act "as an expandable option opened with a
// tick, to not crowd the UI").
//
// Members are the columns; the rows come in three bands, strongest first:
// the constitution (who changes members and areas; the chain key's shares),
// the judges (who judges absence; who changes the judges, locked to every
// member, Agreements rule 67), and the areas (Agreements rule 60: each a whole
// layer, or some kinds of act in one, its holders the boxes filled, its
// number counted in members' own keys, F353), then "other operations", the
// clone rule. A row's end and a column's foot are its summaries.
//
// Here the grid is data: read from the page, turned into the founding's
// Governance (`governanceOf`), read back from an agreement in force for a
// member change (`gridOf`), and said in sentences (`gridSay`). The page draws
// it (`page/view.ts`, `gridForm`). Edubba refuses, in plain words, what
// Agreements would refuse, before anything is signed.

import type { Governance } from '../../repo/src/collective.ts';
import type { AreaKind, AreaSpec } from '../../repo/src/agreements.ts';
import { GRID_LAYERS, type Kind } from './kinds.ts';

// The page draws the grid too, and loads no WebAssembly: the hashes it needs
// are written here, and `test/grid.test.ts` checks each against the core's.

export { MIRS } from './mirs.ts';
import { MIRS } from './mirs.ts';

/** The grant limits cMIP, draft 2 (section 7, F353): an area's cap on its holders' keys. `sha256("Grant limits cMIP, draft 2, test value until publication")`. */
export const GRANT_LIMITS_SPEC_2 = '1185fad343823042fe75481813a249b447fe61bec92c304b8e5948d566a12c9d';

/** The Bitcoin units Module's regtest unit, as the core names it (Damgar's `SPEC.units.regtest`): the cap's unit. */
export const REGTEST_UNIT = 'b674b1606df529b4a5b3857258d1b73e31b7a425f462c54ebfd5b7bd95e0d60e';

/**
 * What an area may reach, one choice per layer (H120, decided): Text,
 * Envelopes, Money, Agreements, Development, each with every kind of act its
 * MIR defines, drawn from the core's own type tables (`kinds.ts`); and Text
 * and Envelopes together, which the core counts as one layer (Agreements,
 * "Layer"), as the founding's Publishing area needs. `value` is what the
 * page's choice carries: the core's layer, and the part of it where narrower.
 */
export const LAYERS: { value: string; layer: number; part?: 'text' | 'envelopes'; name: string; say: string }[] = [
  ...GRID_LAYERS.filter((l) => l.key === 'text' || l.key === 'envelopes').map((l) => ({ value: `1:${l.key}`, layer: 1, part: l.key as 'text' | 'envelopes', name: l.name, say: l.say })),
  { value: '1', layer: 1, name: 'Text and Envelopes, together', say: 'posts and publications (the Text and Envelopes layers)' },
  ...GRID_LAYERS.filter((l) => l.layer > 1).map((l) => ({ value: String(l.layer), layer: l.layer, name: l.name, say: l.say })),
];

/** The kinds of act offered under "Only some kinds of act", per layer and part: the core's own types (rule 60, `[1, spec, type]`). */
export function kindsFor(layer: number, part?: 'text' | 'envelopes'): Kind[] {
  return GRID_LAYERS.filter((l) => l.layer === layer && (!part || l.key === part)).flatMap((l) => l.kinds);
}

/** An area's choice, as the page's select carries it. */
export const choiceOf = (l: { layer: number; part?: 'text' | 'envelopes' }) => (l.part ? `${l.layer}:${l.part}` : String(l.layer));

/** One area: a row of the third band. */
export interface AreaRow {
  /** Its area id, permanent (Q32): set for an area of an agreement in force, new ones numbered next. */
  id?: number;
  name: string;
  layer: number;
  /** Within Text and Envelopes' layer, one of them only (H120); absent, both. */
  part?: 'text' | 'envelopes';
  /** "Only some kinds of act": the kinds ticked, by `spec:type`; absent, the whole layer (or part). */
  kinds?: string[];
  /** The boxes filled: the members whose keys count here. */
  holders: string[];
  /** How many of their keys must sign. */
  number: number;
  /** Money only: above this many regtest satoshis an act, one more key (the grant limits cMIP, draft 2). */
  cap?: number;
  words?: string;
}

/** The founding grid, as the page sends it. */
export interface Grid {
  /** The columns: the founder first. */
  members: string[];
  /** Band 1: who changes members and areas; all ticked with a number, or some ticked (every one of them). */
  constitution: { holders: string[]; number: number };
  /** Band 1: shares that rebuild the chain key; every member holds one (kept as today). */
  chainKey: number;
  /** Band 2: how many of the other members judge absence (kept as today). */
  absence: number;
  /** Band 3: the areas, then other operations (the clone rule), a number among every member. */
  areas: AreaRow[];
  clone: number;
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const whole = (n: unknown) => Number.isSafeInteger(n) && (n as number) >= 1;

/** A new grid for these members: one area, posts and publications, any one member (the page changes the rest). */
export function defaultGrid(members: string[]): Grid {
  const n = members.length;
  return {
    members,
    constitution: { holders: [...members], number: n },
    chainKey: Math.max(1, Math.min(2, n - 1)),
    absence: Math.max(1, Math.min(2, n - 1)),
    areas: [{ name: 'Publishing', layer: 1, holders: [...members], number: 1 }],
    clone: Math.max(1, Math.min(2, n)),
  };
}

/** The kinds an area reaches, by `spec:type`; null for its whole layer. */
function reach(l: AreaRow): string[] | null {
  if (l.kinds?.length) return l.kinds;
  if (l.part) return kindsFor(l.layer, l.part).map((k) => `${k.spec}:${k.type}`);
  return null;
}

function kindsOf(l: AreaRow): AreaKind[] {
  const r = reach(l);
  if (!r) return [{ layer: l.layer }];
  return r.map((k) => {
    const [spec, type] = k.split(':');
    return { spec, type: Number(type) };
  });
}

/** Whether two areas reach a common act: then both would have to be met, which the founding refuses. */
function overlap(a: AreaRow, b: AreaRow): boolean {
  if (a.layer !== b.layer) return false;
  const ra = reach(a);
  const rb = reach(b);
  if (!ra || !rb) return true;
  return ra.some((k) => rb.includes(k));
}

/** What the page offers for one area, in words: its reach. */
export function reachSay(l: AreaRow): string {
  const layer = LAYERS.find((x) => x.value === choiceOf(l));
  if (!l.kinds?.length) return `all ${layer?.say ?? `layer ${l.layer}`}`;
  const names = l.kinds.map((k) => kindsFor(l.layer).find((x) => `${x.spec}:${x.type}` === k)?.name ?? k);
  return `only ${list(names)}`;
}

/**
 * The grid read: its refusals in plain words (nothing is signed while one
 * stands), and the Governance the founding terms are made from. Areas keep
 * their ids; new ones take the next free number (an id is never reused, Q32:
 * `used`, every id the collective's line ever carried).
 */
export function governanceOf(grid: Grid, text: string, used: number[] = []): { governance: Governance; blocking: string[] } {
  const blocking: string[] = [];
  const m = grid.members;
  const n = m.length;
  const c = grid.constitution;
  const allTicked = m.every((x) => c.holders.includes(x));
  if (!c.holders.length) blocking.push('Change members and areas: tick at least one member. A constitution nobody can change is frozen for good.');
  if (allTicked && !(whole(c.number) && c.number <= n)) blocking.push(`Change members and areas: a number from 1 to ${n}.`);
  if (!whole(grid.chainKey) || grid.chainKey > n) blocking.push(`Rebuild the chain key: a number from 1 to ${n}.`);
  else if (grid.chainKey === n) blocking.push(`Rebuild the chain key: with ${n} of ${n}, losing one member’s share would leave nobody able to rotate the collective (F96). Ask for fewer shares than members.`);
  if (!whole(grid.absence) || grid.absence >= n) blocking.push(`Judge absence: a number from 1 to ${n - 1}, among the other members.`);
  if (!whole(grid.clone) || grid.clone > n) blocking.push(`Other operations: a number from 1 to ${n}.`);
  let next = Math.max(0, ...used, ...grid.areas.map((l) => l.id ?? 0)) + 1;
  const specs: AreaSpec[] = [];
  const names = new Set<string>();
  grid.areas.forEach((l, i) => {
    const label = `The area “${l.name || `row ${i + 1}`}”`;
    if (!l.name.trim()) blocking.push(`Area ${i + 1}: give it a name.`);
    else if (names.has(l.name.trim())) blocking.push(`${label}: two areas have this name.`);
    names.add(l.name.trim());
    if (!LAYERS.some((x) => x.value === choiceOf(l))) blocking.push(`${label}: choose what it reaches.`);
    if (l.kinds && !l.kinds.length) blocking.push(`${label}: “Only some kinds of act” is ticked, and none is chosen.`);
    const holders = m.filter((x) => l.holders.includes(x));
    if (!holders.length) blocking.push(`${label}: fill at least one member’s box. An area nobody holds stands frozen.`);
    else if (!whole(l.number) || l.number > holders.length) blocking.push(`${label}: a number of keys from 1 to ${holders.length}, its holders.`);
    if (l.cap !== undefined) {
      if (l.layer !== 2) blocking.push(`${label}: an amount above which one more key is needed is for a Money area.`);
      else if (!whole(l.cap)) blocking.push(`${label}: the amount is a whole number of regtest satoshis.`);
      else if (holders.length < l.number + 1) blocking.push(`${label}: above the amount it asks ${l.number + 1} keys, and has ${holders.length} holder${holders.length === 1 ? '' : 's'}: tick another member.`);
    }
    for (const o of grid.areas.slice(0, i)) {
      if (overlap(l, o)) blocking.push(`${label} and “${o.name}” reach the same acts: such an act would need both areas. Choose other kinds of act under “Only some kinds of act”, or one area.`);
    }
    specs.push({
      id: l.id ?? next++,
      name: l.name.trim(),
      holders,
      threshold: l.number,
      kinds: kindsOf(l),
      ...(l.cap !== undefined ? { cap: { cmip: GRANT_LIMITS_SPEC_2, unit: REGTEST_UNIT, value: l.cap } } : {}),
      ...(l.words?.trim() ? { words: l.words.trim() } : {}),
    });
  });
  if (!grid.areas.length) blocking.push('Add at least one area: without one, members’ own keys count nowhere and only the collective’s key speaks for it.');
  const constitution = allTicked
    ? c.number < n
      ? { constitutionalThreshold: c.number }
      : {}
    : { constitutionalNamed: m.filter((x) => c.holders.includes(x)) };
  const governance: Governance = {
    safetyThreshold: grid.chainKey,
    releaseThreshold: specs[0]?.threshold ?? 1,
    cloneThreshold: grid.clone,
    abandonmentOthers: grid.absence,
    text,
    areas: specs,
    ...constitution,
  };
  return { governance, blocking };
}

/** A grid filled from a collective's Governance, for a member change: the same rows, new members' columns empty, departed members' gone. */
export function gridOf(g: Governance, members: string[]): Grid {
  const kinds = (a: AreaSpec): string[] | undefined => {
    const ts = a.kinds.filter((k): k is { spec: string; type: number } => 'spec' in k);
    return ts.length ? ts.map((k) => `${k.spec}:${k.type}`) : undefined;
  };
  const layerOf = (a: AreaSpec): number => {
    const l = a.kinds.find((k): k is { layer: number } => 'layer' in k);
    if (l) return l.layer;
    const t = a.kinds[0] as { spec: string } | undefined;
    return GRID_LAYERS.find((x) => x.kinds.some((k) => k.spec === t?.spec))?.layer ?? 1;
  };
  // Within Text and Envelopes' layer: one of them alone, where every kind is its; and all its kinds read as that part, whole.
  const partOf = (a: AreaSpec, layer: number): { part?: 'text' | 'envelopes'; kinds?: string[] } => {
    const ks = kinds(a);
    if (layer !== 1 || !ks) return { kinds: ks };
    for (const p of ['text', 'envelopes'] as const) {
      const all = kindsFor(1, p).map((k) => `${k.spec}:${k.type}`);
      if (ks.every((k) => all.includes(k))) return ks.length === all.length ? { part: p } : { part: p, kinds: ks };
    }
    return { kinds: ks };
  };
  const rows: AreaRow[] = (g.areas ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    layer: layerOf(a),
    ...partOf(a, layerOf(a)),
    holders: a.holders.filter((h) => members.includes(h)),
    number: a.threshold,
    ...(a.cap ? { cap: a.cap.value } : {}),
    ...(a.words ? { words: a.words } : {}),
  }));
  const named = g.constitutionalNamed?.filter((x) => members.includes(x));
  return {
    members,
    constitution: named?.length ? { holders: named, number: named.length } : { holders: [...members], number: g.constitutionalThreshold ?? members.length },
    chainKey: g.safetyThreshold,
    absence: g.abandonmentOthers,
    areas: rows.length ? rows : [{ name: 'Releases', layer: 1, kinds: [`${MIRS.envelopes}:0`], holders: [...members], number: g.releaseThreshold }],
    clone: g.cloneThreshold,
  };
}

/** The grid in sentences: the read-back before anything is signed, band by band, then each member's column. */
export function gridSay(grid: Grid, names: (id: string) => string): { heading: string; lines: string[] }[] {
  const m = grid.members;
  const n = m.length;
  const c = grid.constitution;
  const all = m.every((x) => c.holders.includes(x));
  const constitution = [
    all
      ? c.number >= n
        ? `Members, areas, keys and these rules change only with every member whose voice remains (Agreements rule 64).`
        : `Members, areas, keys and these rules change with any ${c.number} of the ${n} members (Agreements rule 64).`
      : `Members, areas, keys and these rules change only with ${list(m.filter((x) => c.holders.includes(x)).map(names))}, every one of them (a rule naming parties, rule 64).`,
    `The chain key is cut into ${n} shares, one per member, written on paper; any ${grid.chainKey} rebuild it to rotate the collective (rule 59).`,
  ];
  const judges = [
    `Any ${grid.absence} of the other members may declare a member absent; that member then loses their voice (rules 85 to 89).`,
    'The judges (absence, and later in round 3 the keepers and the split service) change only with every member: one version for everyone (rule 67).',
  ];
  const said = grid.areas.map((l) => {
    const holders = m.filter((x) => l.holders.includes(x));
    const keys = l.number === 1 ? (holders.length === 1 ? `${names(holders[0])} alone` : `any one of ${list(holders.map(names))}`) : `any ${l.number} of ${list(holders.map(names))}`;
    const cap = l.cap !== undefined ? `; above ${l.cap.toLocaleString('en')} regtest satoshis an act, ${l.number + 1} keys (the grant limits cMIP, draft 2)` : '';
    return `“${l.name}”: ${reachSay(l)}. ${keys[0].toUpperCase()}${keys.slice(1)}, each signing with a key of their own${cap} (rule 60, F353).`;
  });
  said.push(`Other operations, outside every area: any ${grid.clone} of the ${n} members (the clone rule).`);
  const columns = m.map((x) => {
    const held = grid.areas.filter((l) => l.holders.includes(x)).map((l) => `“${l.name}”`);
    return `${names(x)}: ${held.length ? `holds ${list(held)}` : 'holds no area'}; ${c.holders.includes(x) ? 'a voice in the constitution; ' : ''}a share of the chain key. Signs the founding with a key of their own, made as they sign.`;
  });
  return [
    { heading: 'The constitution', lines: constitution },
    { heading: 'The judges', lines: judges },
    { heading: 'The areas', lines: said },
    { heading: 'Each member', lines: columns },
  ];
}
