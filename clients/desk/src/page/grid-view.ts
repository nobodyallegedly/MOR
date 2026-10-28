// The founding grid, drawn (round 3; `../grid.ts` for what it means). Members
// are the columns; three bands of rows, strongest first, each behind a line
// with its tier's name: the constitution, the judges, the areas. A filled box
// means that member's key counts there; a row's end says how many keys out
// of its holders, and in words; a column's foot what that member holds. A
// area picks a whole layer; "Only some kinds of act", ticked, opens its kinds
// (decided by Nobody, allegedly: "as an expandable option opened with a tick,
// to not crowd the UI"). At a phone's width the grid scrolls sideways in its
// own box, the row names fixed on the left.

import { e } from '../../../manage/src/view.ts';
import { LAYERS, choiceOf, kindsFor, reachSay, type Grid, type AreaRow } from '../grid.ts';

/** The grid's own look, added to the page's (`view.ts`, STYLE). */
export const GRID_STYLE = `
.gridbox{overflow-x:auto;overscroll-behavior-x:contain;margin:10px 0;border:1px solid var(--line);border-radius:10px}
table.grid{border-collapse:collapse;font-size:14px;min-width:100%}
table.grid th,table.grid td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:center;vertical-align:middle;white-space:nowrap}
table.grid th.rowname{position:sticky;left:0;background:var(--bg);text-align:left;font-weight:400;white-space:normal;min-width:10em;max-width:16em;z-index:1}
table.grid tr.band th{text-align:left;font-weight:500;color:var(--soft);letter-spacing:.04em;text-transform:uppercase;font-size:12px;border-top:2px solid var(--line);padding-top:12px}
table.grid td.say{text-align:left;white-space:normal;color:var(--soft);font-size:13px;min-width:14em}
table.grid td.span{color:var(--soft);font-size:13px}
table.grid button.box{width:30px;height:30px;padding:0;border-radius:6px;border:1px solid var(--line);background:transparent;color:var(--text);font-size:16px;line-height:1}
table.grid button.box.on{background:var(--tint);border-color:var(--tint);color:var(--bg)}
table.grid span.locked{display:inline-block;width:30px;height:30px;line-height:30px;border-radius:6px;background:var(--line);color:var(--soft)}
table.grid input[type=number]{width:4em}
table.grid input.cap{width:7em}
table.grid input.areaname{width:9em}
table.grid tr.kinds td{text-align:left;white-space:normal}
table.grid tfoot td{vertical-align:top;font-size:12px;color:var(--soft);white-space:normal;text-align:left;min-width:6em}
table.grid .areamore{display:flex;flex-direction:column;gap:4px;margin-top:4px;font-size:12px}`;

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** A box: filled or not, a tap toggles it. */
const box = (on: boolean, row: string, m: string, label: string) =>
  `<td><button type="button" class="box${on ? ' on' : ''}" data-grid-cell="${e(row)}" data-m="${e(m)}" aria-pressed="${on}" title="${e(label)}">${on ? '■' : ''}</button></td>`;
const locked = (label: string) => `<td><span class="locked" title="${e(label)}">■</span></td>`;
// No min or max: a browser would refuse the form silently; Edubba's refusals say why, in words (`../grid.ts`).
const num = (field: string, value: number, _min: number, _max: number) => `<input type="number" data-grid-num="${e(field)}" value="${value}" inputmode="numeric">`;

function areaRows(g: Grid, l: AreaRow, i: number, name: (id: string) => string): string {
  const holders = g.members.filter((m) => l.holders.includes(m));
  const layer = `<select data-grid-layer="${i}">${LAYERS.map((x) => `<option value="${x.value}"${x.value === choiceOf(l) ? ' selected' : ''}>${e(x.name)}</option>`).join('')}</select>`;
  // The Development MIR defines no act type of its own: chosen whole.
  const some = l.kinds !== undefined && kindsFor(l.layer, l.part).length > 0;
  const money = l.layer === 2
    ? `<label title="Above this amount an act, one more key: the grant limits cMIP, draft 2, judges it on each act (a cMIP's rule; the core counts keys).">ⓘ Above <input type="number" data-grid-cap="${i}" value="${l.cap ?? ''}" placeholder="no cap" class="cap"> regtest sats, one more key</label>`
    : '';
  const keysSay = holders.length ? `${l.number === 1 ? (holders.length === 1 ? `${name(holders[0])} alone` : `any one of ${list(holders.map(name))}`) : `any ${l.number} of ${list(holders.map(name))}`}` : 'nobody: frozen';
  const capSay = l.cap ? `; above ${l.cap.toLocaleString('en')}, ${l.number + 1} keys` : '';
  const row = `<tr data-area="${i}"><th class="rowname"><input class="areaname" type="text" data-grid-name="${i}" value="${e(l.name)}" aria-label="The area's name" placeholder="Its name">
<div class="areamore">${layer}${kindsFor(l.layer, l.part).length ? `<label class="check"><input type="checkbox" data-grid-some="${i}"${some ? ' checked' : ''}> Only some kinds of act</label>` : ''}${money}<button type="button" class="quiet" data-grid-remove="${i}">Remove this area</button></div></th>
${g.members.map((m) => box(l.holders.includes(m), `area:${i}`, m, `${name(m)}’s key counts in “${l.name}”`)).join('')}
<td>${num(`area:${i}`, l.number, 1, Math.max(1, holders.length))} <span class="small">of ${holders.length}</span></td>
<td class="say">${e(reachSay(l))}: ${e(keysSay)}${e(capSay)}.</td></tr>`;
  if (!some) return row;
  // H120: every kind the layer's MIR defines, from the core's own type tables.
  const kinds = kindsFor(l.layer, l.part);
  return `${row}<tr class="kinds"><td></td><td colspan="${g.members.length + 2}">${kinds
    .map((k) => {
      const v = `${k.spec}:${k.type}`;
      return `<label class="check"><input type="checkbox" data-grid-kind="${i}" value="${e(v)}"${l.kinds!.includes(v) ? ' checked' : ''}> ${e(k.name)}</label>`;
    })
    .join(' ')}</td></tr>`;
}

/**
 * The grid of a founding or a member change. `form`: the form it belongs to.
 * `name`: a member in words, in the sentences; `head`: a member as its
 * column shows it, its names and its short ID as a button (H106, H121).
 */
export function gridTable(form: string, g: Grid, name: (id: string) => string, head?: (id: string) => string): string {
  const n = g.members.length;
  const cols = g.members.map((m) => `<th scope="col">${head ? head(m) : e(name(m))}</th>`).join('');
  const span = `colspan="${n}"`;
  const band = (t: string) => `<tr class="band"><th class="rowname" colspan="${n + 3}">${e(t)}</th></tr>`;
  const c = g.constitution;
  const all = g.members.every((m) => c.holders.includes(m));
  const constSay = all ? (c.number >= n ? 'every member whose voice remains (the default)' : `any ${c.number} of the ${n} members`) : `${list(g.members.filter((m) => c.holders.includes(m)).map(name))}, every one of them`;
  const holds = (m: string) => {
    const areas = g.areas.filter((l) => l.holders.includes(m)).map((l) => e(l.name || 'unnamed'));
    return `${c.holders.includes(m) ? 'Constitution<br>' : ''}A share of the chain key<br>${areas.length ? areas.join('<br>') : 'No area'}`;
  };
  return `<div class="gridbox" data-grid-form="${e(form)}"><table class="grid">
<thead><tr><th class="rowname"></th>${cols}<th>Keys needed</th><th>In words</th></tr></thead>
<tbody>
${band('The constitution')}
<tr><th class="rowname">Change members and areas</th>${g.members.map((m) => box(c.holders.includes(m), 'const', m, `${name(m)} has a voice in changing the constitution`)).join('')}
<td>${all ? num('const', c.number, 1, n) : `${c.holders.length} <span class="small">of ${c.holders.length}</span>`}</td><td class="say">${e(constSay)}.</td></tr>
<tr><th class="rowname">Rebuild the chain key</th>${g.members.map((m) => locked(`${name(m)} holds a share, on paper`)).join('')}
<td>${num('chain', g.chainKey, 1, n)} <span class="small">of ${n}</span></td><td class="say">One share per member, on paper; any ${g.chainKey} rebuild it. Fewer than every member, so the loss of one never freezes it.</td></tr>
${band('The judges')}
<tr><th class="rowname">Judge absence</th><td ${span} class="span">the other members</td><td>${num('absence', g.absence, 1, Math.max(1, n - 1))}</td><td class="say">Any ${g.absence} of the other members may declare a member absent: that member loses their voice.</td></tr>
<tr><th class="rowname">Change the judges</th>${g.members.map((m) => locked('Every member, always (rule 67)')).join('')}<td>${n} <span class="small">of ${n}</span></td><td class="say">Always every member: one version of the judges for everyone (rule 67). Keepers and the split service join this band later.</td></tr>
${band('The areas: operations')}
${g.areas.map((l, i) => areaRows(g, l, i, name)).join('')}
<tr><td class="rowname" colspan="${n + 3}"><button type="button" data-grid-add="${e(form)}">+ Add an area</button></td></tr>
<tr><th class="rowname">Other operations</th><td ${span} class="span">every member</td><td>${num('clone', g.clone, 1, n)} <span class="small">of ${n}</span></td><td class="say">Changes no area reaches: any ${g.clone} of the ${n} members (the clone rule).</td></tr>
</tbody>
<tfoot><tr><th class="rowname">Each member holds</th>${g.members.map((m) => `<td>${holds(m)}</td>`).join('')}<td colspan="2" class="say">Each member signs with a key of their own, made as they sign.</td></tr></tfoot>
</table></div>`;
}
