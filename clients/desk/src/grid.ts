// The founding grid (round 3, decided by Nobody, allegedly, 19 October 2026:
// "We have members and we have lanes where their signatures can count, I see a
// matrix grid, filling boxes to assign power, column and rows giving
// summaries"; "Above rather than below separated by a line. Those are the
// powers that matter most. Constitutional, judicial and then operational";
// whole layers, with kinds of act "as an expandable option opened with a
// tick, to not crowd the UI").
//
// Members are the columns; the rows come in bands, strongest first: the
// constitution (who changes members and areas; the chain key's shares), the
// judges (who judges absence; who changes the judges, locked to every member,
// Agreements rule 67), the layers (Agreements rule 60, decided by Nobody,
// allegedly, 29 October 2026, F402: a founding names who acts for the
// collective in each of five layers, Text, Envelopes, Money, Agreements and
// Development, "any one member alone" a valid rule; shown layer by layer as
// what one member may do alone, Money first, before anyone signs), the finer
// areas (optional: some kinds of act within one layer, held by some members),
// then "other operations", the clone rule; and the shares (H101: a collective
// always has shares, as an ownership agreement does; even until touched). A
// collective has no signing key and no member keys (rule 56): each member
// acts with their own key. A row's end and a column's foot are its summaries.
//
// Here the grid is data: read from the page, turned into the founding's
// Governance (`governanceOf`), read back from an agreement in force for a
// member change (`gridOf`), and said in sentences (`gridSay`). The page draws
// it (`page/view.ts`, `gridForm`). Edubba refuses, in plain words, what
// Agreements would refuse, before anything is signed.

import type { Governance } from '../../repo/src/collective.ts';
import type { AreaKind, AreaSpec, LayerNumber, Rule } from '../../repo/src/agreements.ts';
import { GRID_LAYERS, type Kind } from './kinds.ts';

// The page draws the grid too, and loads no WebAssembly: the hashes it needs
// are written here, and `test/grid.test.ts` checks each against the core's.

export { MIRS } from './mirs.ts';
import { MIRS } from './mirs.ts';

/** The grant limits cMIP, draft 2 (section 7, F353): an area's cap on its holders' keys. `sha256("Grant limits cMIP, draft 2, test value until publication")`. */
export const GRANT_LIMITS_SPEC_2 = '1185fad343823042fe75481813a249b447fe61bec92c304b8e5948d566a12c9d';

/** The Bitcoin units Module's regtest unit, as the core names it (Damgar's `SPEC.units.regtest`): the cap's unit. */
export const REGTEST_UNIT = 'b674b1606df529b4a5b3857258d1b73e31b7a425f462c54ebfd5b7bd95e0d60e';

/** The five layers a collective acts in, in the core's numbering (MICS, "Structure"): the layers' band, one row each, Money first in what is said (rule 60, client conformance). */
export const LAYERS: { layer: LayerNumber; name: string; say: string; alone: string }[] = [
  { layer: 3, name: 'Money', say: 'money (the Money layer)', alone: 'say where the collective is paid (its payee pointer: their own wallet, if they choose), sign its receipts and debts, and price its works' },
  { layer: 1, name: 'Text', say: 'posts and messages (the Text layer)', alone: 'post and write in the collective’s name' },
  { layer: 2, name: 'Envelopes', say: 'bakes, their keys, vows (the Envelopes layer)', alone: 'upload and vow in the collective’s name, and hand out its files’ keys' },
  { layer: 4, name: 'Agreements', say: 'ownership agreements, publications, claims of works, grants (the Agreements layer)', alone: 'publish its works, claim works, and grant powers within this layer' },
  { layer: 5, name: 'Development', say: 'specifications and extensions (the Development layer)', alone: 'adopt extensions and publish specifications for it' },
];

/** The kinds of act offered for a finer area, per layer: the core's own types (rule 60, `[1, spec, type]`). */
export function kindsFor(layer: number): Kind[] {
  return GRID_LAYERS.filter((l) => l.layer === layer).flatMap((l) => l.kinds);
}

/** Who acts for the collective in one layer: the members ticked, and how many of them together. All ticked: any `number` of the members (every member at `number` = all); some ticked: those, every one of them, together. */
export interface LayerRow {
  holders: string[];
  number: number;
}

/** One finer area: some kinds of act within one layer, held by some members (field 34). */
export interface AreaRow {
  /** Its area id, permanent (Q32): set for an area of an agreement in force, new ones numbered next. */
  id?: number;
  name: string;
  layer: number;
  /** The kinds it reaches, by `spec:type`: at least one (a whole layer is the layer's row). */
  kinds: string[];
  /** The boxes filled: the members who act here. */
  holders: string[];
  /** How many of them together. */
  number: number;
  /** Money only: above this many regtest satoshis an act, one more holder (the grant limits cMIP, area key 6). */
  cap?: number;
  words?: string;
}

/** The founding grid, as the page sends it. */
export interface Grid {
  /** The columns: the founder first. */
  members: string[];
  /** Band 1: who changes members and areas; all ticked with a number, or some ticked (every one of them). */
  constitution: { holders: string[]; number: number };
  /** Band 1: shares that rebuild the chain key; every member holds one. */
  chainKey: number;
  /** Band 2: how many of the other members judge absence. */
  absence: number;
  /** Band 3: who acts for the collective in each of the five layers (field 19), every one named. */
  layers: Record<LayerNumber, LayerRow>;
  /** Band 4: finer areas, optional; then other operations (the clone rule), a number among every member. */
  areas: AreaRow[];
  clone: number;
  /** Band 5: each member's share of the collective, in percent, adding up to 100 (field 7). A member who left keeping theirs is listed in `departed`. */
  shares: Record<string, number>;
  /** Members who left keeping their share (departed holders, rule 68): shown in the Shares band, not columns. */
  departed?: string[];
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const whole = (n: unknown) => Number.isSafeInteger(n) && (n as number) >= 1;

/** Even shares in percent, to four decimals, the first taking what rounding leaves (H101: even until touched). */
export function evenPercent(members: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  const each = Math.floor(1_000_000 / Math.max(1, members.length));
  members.forEach((m, i) => (out[m] = (i === 0 ? 1_000_000 - each * (members.length - 1) : each) / 10_000));
  return out;
}

/** A new grid for these members: every layer any one member alone save Money and Agreements, which need every member (the page changes the rest), no finer area, even shares. */
export function defaultGrid(members: string[]): Grid {
  const n = members.length;
  const one = (): LayerRow => ({ holders: [...members], number: 1 });
  const all = (): LayerRow => ({ holders: [...members], number: n });
  return {
    members,
    constitution: { holders: [...members], number: n },
    chainKey: Math.max(1, Math.min(2, n - 1)),
    absence: Math.max(1, Math.min(2, n - 1)),
    layers: { 1: one(), 2: one(), 3: all(), 4: all(), 5: one() },
    areas: [],
    clone: Math.max(1, Math.min(2, n)),
    shares: evenPercent(members),
  };
}

/** A layer row as a rule of the terms: all ticked, any k (every member at k = n); some ticked, those together. */
export function ruleOf(row: LayerRow, members: string[]): Rule {
  const holders = members.filter((m) => row.holders.includes(m));
  if (holders.length === members.length) return row.number >= members.length ? { all: true } : { threshold: row.number };
  return { named: holders };
}

/** A rule of the terms as a layer row. */
export function rowOf(r: Rule | undefined, members: string[]): LayerRow {
  if (!r || 'all' in r) return { holders: [...members], number: members.length };
  if ('threshold' in r) return { holders: [...members], number: r.threshold };
  const named = r.named.filter((m) => members.includes(m));
  return { holders: named, number: named.length };
}

/** Who acts in a layer, in words: "any one member alone", "A alone", "any 2 of the 3 members", "A and B together", "every member". */
export function layerWho(row: LayerRow, members: string[], names: (id: string) => string): string {
  const holders = members.filter((m) => row.holders.includes(m));
  if (!holders.length) return 'nobody: the layer stands frozen';
  if (holders.length === members.length) {
    if (row.number <= 1) return 'any one member alone';
    if (row.number >= members.length) return 'every member together';
    return `any ${row.number} of the ${members.length} members`;
  }
  return holders.length === 1 ? `${names(holders[0])} alone` : `${list(holders.map(names))} together`;
}

/** Whether one member may act alone in this layer, and who: everyone, one named member, or nobody. */
export function alone(row: LayerRow, members: string[]): string[] {
  const holders = members.filter((m) => row.holders.includes(m));
  if (holders.length === members.length) return row.number <= 1 ? [...members] : [];
  return holders.length === 1 ? holders : [];
}

/**
 * What the founding lets one member do alone, layer by layer, Money first
 * (Agreements rule 60, client conformance: shown before a party signs).
 */
export function aloneSay(grid: Pick<Grid, 'members' | 'layers' | 'areas'>, names: (id: string) => string): string[] {
  return LAYERS.map((l) => {
    const row = grid.layers[l.layer];
    const who = alone(row, grid.members);
    const finer = grid.areas.filter((a) => a.layer === l.layer);
    const narrowed = finer.length ? ` (save ${list(finer.map((a) => `“${a.name}”`))}, a finer area)` : '';
    if (!who.length) return `${l.name}: no member alone${narrowed}. ${layerWho(row, grid.members, names)[0].toUpperCase()}${layerWho(row, grid.members, names).slice(1)} must sign.`;
    const subject = who.length === grid.members.length ? 'Any one member' : names(who[0]);
    return `${l.name}: ${subject} alone may ${l.alone}${narrowed}.`;
  });
}

function kindsOf(l: AreaRow): AreaKind[] {
  return l.kinds.map((k) => {
    const [spec, type] = k.split(':');
    return { spec, type: Number(type) };
  });
}

/** What a finer area reaches, in words. */
export function reachSay(l: AreaRow): string {
  const names = l.kinds.map((k) => kindsFor(l.layer).find((x) => `${x.spec}:${x.type}` === k)?.name ?? k);
  return `only ${list(names)}`;
}

/** The shares as millionths, the members' and departed holders' in order. */
export function sharesOf(grid: Pick<Grid, 'members' | 'shares' | 'departed'>): [string, number][] {
  return [...grid.members, ...(grid.departed ?? [])].filter((m) => (grid.shares[m] ?? 0) > 0).map((m) => [m, Math.round((grid.shares[m] ?? 0) * 10_000)]);
}

/**
 * The grid read: its refusals in plain words (nothing is signed while one
 * stands), and the Governance the founding terms are made from. Areas keep
 * their ids; new ones take the next free number (an id is never reused, Q32:
 * `used`, every id the collective's line ever carried). `joining`: members
 * a change adds, whose share is required (H101).
 */
export function governanceOf(grid: Grid, text: string, used: number[] = [], joining: string[] = []): { governance: Governance; blocking: string[] } {
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
  const layers: Partial<Record<LayerNumber, Rule>> = {};
  for (const l of LAYERS) {
    const row = grid.layers?.[l.layer];
    const holders = row ? m.filter((x) => row.holders.includes(x)) : [];
    if (!row || !holders.length) blocking.push(`${l.name}: fill at least one member’s box. Every layer names who acts for the collective there (rule 60): a layer nobody holds stands frozen.`);
    else if (holders.length === n && !(whole(row.number) && row.number <= n)) blocking.push(`${l.name}: a number from 1 to ${n}.`);
    else layers[l.layer] = ruleOf(row, m);
  }
  let next = Math.max(0, ...used, ...grid.areas.map((l) => l.id ?? 0)) + 1;
  const specs: AreaSpec[] = [];
  const names = new Set<string>();
  grid.areas.forEach((l, i) => {
    const label = `The area “${l.name || `row ${i + 1}`}”`;
    if (!l.name.trim()) blocking.push(`Area ${i + 1}: give it a name.`);
    else if (names.has(l.name.trim())) blocking.push(`${label}: two areas have this name.`);
    names.add(l.name.trim());
    if (!LAYERS.some((x) => x.layer === l.layer)) blocking.push(`${label}: choose its layer.`);
    if (!l.kinds?.length) blocking.push(`${label}: choose at least one kind of act. A whole layer is its row above.`);
    const holders = m.filter((x) => l.holders.includes(x));
    if (!holders.length) blocking.push(`${label}: fill at least one member’s box. An area nobody holds stands frozen.`);
    else if (!whole(l.number) || l.number > holders.length) blocking.push(`${label}: a number from 1 to ${holders.length}, its holders.`);
    if (l.cap !== undefined) {
      if (l.layer !== 3) blocking.push(`${label}: an amount above which one more holder is needed is for a Money area.`);
      else if (!whole(l.cap)) blocking.push(`${label}: the amount is a whole number of regtest satoshis.`);
      else if (holders.length < l.number + 1) blocking.push(`${label}: above the amount it asks ${l.number + 1} holders, and has ${holders.length}: tick another member.`);
    }
    for (const o of grid.areas.slice(0, i)) {
      if (o.layer === l.layer && o.kinds?.some((k) => l.kinds?.includes(k))) blocking.push(`${label} and “${o.name}” reach the same acts: such an act would need both areas. Choose other kinds of act, or one area.`);
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
  // The Shares band (H101): every member a share, a joining member's box required, adding up to 100.
  for (const x of m) {
    const v = grid.shares?.[x];
    if (v === undefined || !Number.isFinite(v) || v < 0) blocking.push(`Shares: a share for every member, from 0 to 100.`);
  }
  for (const x of joining) if (!((grid.shares?.[x] ?? 0) > 0)) blocking.push('Shares: a joining member’s share is required: write theirs.');
  const millionths = sharesOf(grid);
  const total = millionths.reduce((t, [, v]) => t + v, 0);
  if (total !== 1_000_000) blocking.push(`Shares: they add up to ${(total / 10_000).toLocaleString('en', { maximumFractionDigits: 4 })}%, not 100%.`);
  const constitution = allTicked
    ? c.number < n
      ? { constitutionalThreshold: c.number }
      : {}
    : { constitutionalNamed: m.filter((x) => c.holders.includes(x)) };
  const governance: Governance = {
    safetyThreshold: grid.chainKey,
    releaseThreshold: 1,
    cloneThreshold: grid.clone,
    abandonmentOthers: grid.absence,
    text,
    layers,
    areas: specs,
    stakes: [{ object: null, holders: millionths }],
    ...(grid.departed?.length ? { departed: [...grid.departed] } : {}),
    ...constitution,
  };
  return { governance, blocking: [...new Set(blocking)] };
}

/** A grid filled from a collective's Governance, for a member change: the same rows and shares, new members' columns and shares empty, departed members' gone from the columns (their shares kept). */
export function gridOf(g: Governance, members: string[], previous: string[] = members): Grid {
  const rows: AreaRow[] = (g.areas ?? []).map((a) => {
    const t = a.kinds[0] as { spec: string } | undefined;
    return {
      id: a.id,
      name: a.name,
      layer: GRID_LAYERS.find((x) => x.kinds.some((k) => k.spec === t?.spec))?.layer ?? 2,
      kinds: a.kinds.map((k) => `${k.spec}:${k.type}`),
      holders: a.holders.filter((h) => members.includes(h)),
      number: a.threshold,
      ...(a.cap ? { cap: a.cap.value } : {}),
      ...(a.words ? { words: a.words } : {}),
    };
  });
  const named = g.constitutionalNamed?.filter((x) => members.includes(x));
  const clone: Rule = { threshold: g.cloneThreshold };
  const layers = Object.fromEntries(LAYERS.map((l) => [l.layer, rowOf(g.layers?.[l.layer] ?? clone, members)])) as Record<LayerNumber, LayerRow>;
  // The one stake in the collective (field 7), as the governance carries it; even among the members before it was written.
  const own = g.stakes?.find((x) => x.object === null)?.holders.filter((h): h is [string, number] => h[0] !== null);
  const held: [string, number][] = own?.length ? own : Object.entries(evenPercent(previous)).map(([h, v]) => [h, Math.round(v * 10_000)]);
  const shares: Record<string, number> = {};
  for (const x of members) shares[x] = (held.find(([h]) => h === x)?.[1] ?? 0) / 10_000;
  const departed = held.filter(([h]) => !members.includes(h)).map(([h]) => h);
  for (const x of departed) shares[x] = (held.find(([h]) => h === x)?.[1] ?? 0) / 10_000;
  return {
    members,
    constitution: named?.length ? { holders: named, number: named.length } : { holders: [...members], number: Math.min(members.length, g.constitutionalThreshold ?? members.length) },
    chainKey: g.safetyThreshold,
    absence: g.abandonmentOthers,
    layers,
    areas: rows,
    clone: g.cloneThreshold,
    shares,
    ...(departed.length ? { departed } : {}),
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
        ? `Members, areas, keys, shares and these rules change only with every member whose voice remains (Agreements rule 64).`
        : `Members, areas, keys, shares and these rules change with any ${c.number} of the ${n} members (Agreements rule 64).`
      : `Members, areas, keys, shares and these rules change only with ${list(m.filter((x) => c.holders.includes(x)).map(names))}, every one of them (a rule naming parties, rule 64).`,
    `The chain key is cut into ${n} shares, one per member, written on paper; any ${grid.chainKey} rebuild it to rotate the collective (rule 59). The collective has no signing key: each member acts for it with their own (rule 56).`,
  ];
  const judges = [
    `Any ${grid.absence} of the other members may declare a member absent; that member then loses their voice (rules 85 to 89).`,
    'The judges change only with every member: one version for everyone (rule 67).',
  ];
  const layers = aloneSay(grid, names);
  const said = grid.areas.map((l) => {
    const holders = m.filter((x) => l.holders.includes(x));
    const who = l.number === 1 ? (holders.length === 1 ? `${names(holders[0])} alone` : `any one of ${list(holders.map(names))}`) : `any ${l.number} of ${list(holders.map(names))}`;
    const cap = l.cap !== undefined ? `; above ${l.cap.toLocaleString('en')} regtest satoshis an act, ${l.number + 1} of them (the grant limits cMIP)` : '';
    const layer = LAYERS.find((x) => x.layer === l.layer)?.name ?? `layer ${l.layer}`;
    return `“${l.name}”, within ${layer}: ${reachSay(l)}. ${who[0].toUpperCase()}${who.slice(1)}, each with their own key${cap} (rule 60).`;
  });
  said.push(`Other operations, outside every layer and area: any ${grid.clone} of the ${n} members (the clone rule).`);
  const shares = sharesOf(grid).map(([x, v]) => `${names(x)}: ${(v / 10_000).toLocaleString('en', { maximumFractionDigits: 4 })}%${grid.departed?.includes(x) ? ' (left, keeping it)' : ''}`);
  const columns = m.map((x) => {
    const held = grid.areas.filter((l) => l.holders.includes(x)).map((l) => `“${l.name}”`);
    const acts = LAYERS.filter((l) => alone(grid.layers[l.layer], m).includes(x)).map((l) => l.name);
    return `${names(x)}: ${acts.length ? `acts alone in ${list(acts)}` : 'acts alone in no layer'}${held.length ? `; holds ${list(held)}` : ''}; ${c.holders.includes(x) ? 'a voice in the constitution; ' : ''}a share of the chain key; ${(grid.shares[x] ?? 0).toLocaleString('en', { maximumFractionDigits: 4 })}% of the collective. Signs the founding with their own key.`;
  });
  return [
    { heading: 'What one member may do alone, layer by layer', lines: layers },
    { heading: 'The constitution', lines: constitution },
    { heading: 'The judges', lines: judges },
    { heading: 'Finer areas', lines: said },
    { heading: 'Shares', lines: shares },
    { heading: 'Each member', lines: columns },
  ];
}
