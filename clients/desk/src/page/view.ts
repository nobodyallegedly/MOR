// Edubba's page on the Dubsar Suite's kit (`clients/kit`), round 4 of the
// redesign (22 October 2026), as the redesign drew it
// (`docs/design/suite-redesign.md`, "Edubba", "The identity panel",
// "Answered on the mockups"; the mockups `edubba-*`): the agreements hub.
// Four tiles on the computer, three on the web (decided: "4 tiles but only 3
// on web"): Agents (two danger bars, Mac only), Collectives (three),
// Publishing (two), Vows (two); each opening its column on the left. The
// identity top right, the collectives under each identity, so acting as a
// collective is the identity panel's gesture. The forms and readings kept
// from before are `parts.ts`, drawn inside the panes in a box of class
// `e-in`. HTML strings only: what a click does is `ui.ts`. Everything from
// the program, from relays or typed by a person is escaped.

import { APPS, KIT_STYLE } from '../../../kit/src/style.ts';
import { appMark, contactsButton, e, feedBox, fold, identityPanel, meButton, opened, removeSaid, say, shortForm, tiles, top, typingBox, type ColumnEntry, type PanelIdentity, type Tile, whatIsMor } from '../../../kit/src/html.ts';
import { actId, contactsButtonFor, idButton, who } from '../../../kit/src/ids.ts';
import { cardWords } from '../../../genesis/src/card-words.ts';
import { shownAct, shownId } from '../../../genesis/src/shown.ts';
import { PARTS_STYLE, WEB_KEPT_SAY, setWeb as setPartsWeb } from './parts.ts';
import type { AgentDetails, State } from './api.ts';

export * from './parts.ts';
export { e, say, shortForm };

let WEB = false;
/** The web client (for testing only): no Agents tile, nothing of Claude's, no pairing. Set once, at the start. */
export function setWeb(on: boolean): void {
  WEB = on;
  setPartsWeb(on);
}
export const isWeb = () => WEB;

/** The app's name, as the person sees it (decided by Nobody, allegedly, F333: "Edubba it is"). */
export const NAME = 'Edubba';
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Edubba's colour: the Agreements layer's emerald (H36), in pastel fills (decided, 21 October 2026). */
export const TINT = { layer: APPS.edubba.colour, pastel: APPS.edubba.pastel } as const;

/**
 * The web client's banner, on every screen it shows, in one line with a "?"
 * that opens the risks in plain words. In the page's HTML itself
 * (`static/web.html`, written there by the build), so it shows even when the
 * script does not run.
 */
export const WEB_BANNER = `<details class="k-say edubba-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY}; regtest or signet only.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment you bring an identity here could copy its signing key: with it, sign as you (proposals, signatures, a collective’s acts) and read its private messages.</li>
<li>This browser’s storage keeps, as they are and not locked: the signing and encryption keys of each identity you bring; the signing key of each collective you found here; and, while you sign as a member, the one-time key for your share until you have written the share down. That storage can be lost (cleared, a private window, the browser tidying up), or read by what runs in this page.</li>
<li>Founding a collective here deals its chain key in this page: for a moment this page holds the whole chain key, in its memory, never in its storage; your share and any shown hand to hand wait there, an hour at most, until shown, and a reload or a closed tab loses them. If this page’s code or this device were not honest, it could keep the chain key and later act alone. For a collective that matters, found it in Edubba on a computer.</li>
<li>No agents, no API key and nothing from Claude here: those need Edubba on the Mac.</li></ol>
<p>Never bring a real identity here.</p></div></details>`;

/** The page's style: the kit's, the kept parts', and Edubba's few own pieces. */
export const STYLE = `${KIT_STYLE}
${PARTS_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.edubba-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.edubba-banner strong{font-weight:400;color:var(--k-text)}
.edubba-banner ol{margin:4px 0;padding-left:1.4em}
.edubba-foot{flex:none;padding:0 28px 10px}
.edubba-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.edubba-pane{display:flex;flex-direction:column;flex:1;min-height:0}
.edubba-pane .k-feedwrap{min-height:220px}
.edubba-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 6px}
.edubba-head h2{font-size:26px}
.edubba-head .k-mono{color:var(--k-faint)}
.edubba-head .edubba-badge{font-size:13px;padding:3px 12px;border-radius:999px;background:var(--k-wash2);color:var(--k-text)}
.edubba-head .edubba-badge.edubba-line{background:none;border:1px solid var(--k-edge);color:var(--k-soft)}
.edubba-head .edubba-right{margin-left:auto;color:var(--k-soft);font-size:14px}
.edubba-tabs{display:flex;gap:4px;border-bottom:1px solid var(--k-line);margin:6px 0 14px;flex-wrap:wrap}
.edubba-tabs button{padding:8px 14px;color:var(--k-soft);font-size:14.5px;border-bottom:2px solid transparent;margin-bottom:-1px}
.edubba-tabs button.k-on{color:var(--k-text);border-bottom-color:var(--k-p)}
.edubba-chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px;font-size:13.5px;color:var(--k-soft)}
.edubba-chips .k-chip.k-on{background:var(--k-p);color:var(--k-ink)}
.edubba-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;align-items:start}
.edubba-grid .k-box{margin:0}
.edubba-wrap{overflow-wrap:anywhere;word-break:break-all}
.edubba-card-acts{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 2px}
.edubba-diary{background:var(--k-wash);border-radius:16px;padding:16px 18px}
.edubba-diary .edubba-act{border:1px solid var(--k-edge);border-radius:12px;padding:10px 12px;margin:10px 0;background:var(--k-bg)}
.edubba-modal-body{min-height:0;overflow:auto}
.k-typing .k-tools .k-btn.k-p{color:var(--k-ink)}
.edubba-play{display:flex;align-items:center;gap:10px;border:1px solid var(--k-line);border-radius:12px;padding:10px 12px;margin:6px 0;font-size:14px;color:var(--k-soft)}
@media (max-width:600px){
  .k-top .k-tabs{display:none}
  .edubba-foot{padding:0 12px 8px}
  .edubba-head h2{font-size:21px}
  .edubba-head .edubba-right{margin-left:0}
}`;

/** An ID written for people (`mid1…`, `mact1…`) from its hexadecimal. */
export const formOf = (id: string, kind: 'mid' | 'mact' = 'mact') => (/^[0-9a-f]{64}$/.test(id) ? (kind === 'mid' ? shownId(id) : shownAct(id)) : id);
export const idForm = (id: string) => formOf(id, 'mid');

// ---------------------------------------------------------------- the frame

/** The tiles, by key, in their order (decided): Agents, Collectives, Publishing, Vows; no Agents on the web. */
export type Tab = 'agents' | 'collectives' | 'publishing' | 'vows';
const TAB_NAMES: Record<Tab, string> = { agents: 'Agents', collectives: 'Collectives', publishing: 'Publishing', vows: 'Vows' };
export const tabsHere = (): Tab[] => (WEB ? ['collectives', 'publishing', 'vows'] : ['agents', 'collectives', 'publishing', 'vows']);

/** Who is in use: the identity, or a collective under it (the identity panel's gesture). */
export interface Acting {
  id: string;
  name: string | null;
}

/** The identity in use, as the top right shows it: its names as read (H96), never a bare short ID. */
export function me(s: State, as: Acting | null): string {
  const i = s.identities.find((x) => x.id === s.acting);
  if (!i) return `<button type="button" class="k-me" data-k-open="identity" aria-haspopup="dialog" title="Identities"><span class="k-n">No identity yet</span><span class="k-dot k-alt">+</span></button>`;
  return meButton({ name: i.name, form: idForm(i.id), named: s.held?.[i.id]?.named ?? null, as: as ? { name: as.name, form: idForm(as.id) } : null });
}

/** The top of the window: Contacts top left (H100, the one list, the same in every app), Edubba (back to the tiles), its tabs once a tile is open, the identity (or the collective acted as) top right. */
export function topBar(s: State, tab: Tab | null, as: Acting | null, counts: Partial<Record<Tab, number>> = {}): string {
  const tabs = tab
    ? `<nav class="k-tabs" aria-label="Edubba">${tabsHere()
        .map((t) => `<button type="button" class="k-tab${t === tab ? ' k-on' : ''}" data-tab="${t}"${t === tab ? ' aria-current="page"' : ''}>${e(TAB_NAMES[t])}${counts[t] ? `<span class="k-count">${counts[t]}</span>` : ''}</button>`)
        .join('')}</nav>`
    : '';
  return top({ left: `${contactsButton()}<button type="button" class="k-btn k-q" data-action="home-tiles" title="The tiles">${appMark(NAME, 'icon.png')}</button>${tabs}`, right: me(s, as) });
}

/** The home: the tiles, their danger marks as drawn (decided: Agents 2, Collectives 3, Publishing 2, Vows 2). */
export function home(s: State, as: Acting | null, alarms: string): string {
  const agents = s.agents.map((a) => `${a.name}: ${a.on ? 'answering' : 'off'}`).join(' · ');
  const founding = s.proposals.filter((p) => p.kind === 'founding' && !p.founded);
  const cs = s.collectives.filter((c) => !c.closed).map((c) => c.name);
  const ts: (Tile & { key: Tab })[] = [
    { key: 'agents', name: 'Agents', say: `${agents ? `${agents}. ` : ''}Its talk, its queue, its mind, its terms. Mac only.`, icon: 'agents', danger: 2 },
    {
      key: 'collectives',
      name: 'Collectives',
      say: `${cs.length ? cs.slice(0, 3).join(', ') : 'None yet'}${founding.length ? `, and ${founding.length === 1 ? 'one founding' : `${founding.length} foundings`} (${founding.map((p) => `${p.standing.signed.length} of ${p.signers.length} signed`).join('; ')})` : ''}. Agreements are born here.`,
      icon: 'collectives',
      danger: 3,
    },
    { key: 'publishing', name: 'Publishing', say: 'Protected files under terms: text, pictures, video, audio.', icon: 'publishing', danger: 2 },
    { key: 'vows', name: 'Vows', say: 'Simple vows; track contests by pointing at people, collectives or relays.', icon: 'vows', danger: 2 },
  ];
  return `${topBar(s, null, as)}${alarms}<div class="k-body">${tiles(ts.filter((t) => tabsHere().includes(t.key)))}</div>
<div class="edubba-foot">${say(TEST_ONLY, [WEB ? 'The web client is for testing only: the banner above says its risks.' : 'Every key is held in software in this program’s folders: a prototype, never for a real identity.'], { mor: whatIsMor })}</div>`;
}

/** Each tile's column. */
export function column(tab: Tab, s: State, k: { queue?: Record<string, number>; here?: number; sales?: number; mine?: number; toSign?: number; deals?: number; dealsToSign?: number }): ColumnEntry[] {
  switch (tab) {
    case 'agents':
      return [
        // H125: the agents of the identity in use, and said so when it has none.
        ...(s.agents.length ? [] : [`No agents for ${s.identities.find((i) => i.id === s.acting)?.name ?? 'this identity'} yet`]),
        ...s.agents.map((a) => ({ key: `agent:${a.id}`, label: a.name, k: a.on ? 'on' : 'off' })),
        { key: 'add', label: '+ Add an agent' },
        '-',
        { key: 'key', label: 'The API key', k: s.sharedKey.found ? `…${s.sharedKey.last4 ?? ''}` : 'none' },
      ];
    case 'collectives': {
      const list: ColumnEntry[] = s.collectives.map((c) => ({ key: `c:${c.id}`, label: c.name, k: c.brought ? 'brought' : c.real ? c.members : c.closed ? 'ended' : 'test' }));
      // H125: the foundings the identity in use signs in, as its collectives.
      for (const p of s.proposals.filter((x) => x.kind === 'founding' && !x.founded && !!s.acting && x.signers.includes(s.acting))) list.push({ key: `p:${p.act}`, label: p.name, k: `${p.standing.signed.length} of ${p.signers.length} signed` });
      if (!list.length) list.push(`No collectives for ${s.identities.find((i) => i.id === s.acting)?.name ?? 'this identity'} yet`);
      return [
        ...list,
        { key: 'sign', label: 'To sign', k: k.toSign || undefined },
        '-',
        { key: 'found', label: '+ Found a collective' },
        { key: 'bring', label: '+ Bring a collective' },
      ];
    }
    case 'publishing':
      // The four ways in (F407): upload, claim, an ownership agreement, a publication; then what was done here, what waits, and sales.
      return [{ key: 'upload', label: '1 · Upload' }, { key: 'claim', label: '2 · Claim' }, { key: 'ownership', label: '3 · Ownership agreement' }, { key: 'publication', label: '4 · Publication' }, '-', { key: 'here', label: 'Published here', k: k.here }, { key: 'sign', label: 'To sign', k: k.dealsToSign || undefined }, { key: 'sales', label: 'Sales', k: k.sales }];
    case 'vows':
      return [{ key: 'track', label: 'Track' }, { key: 'new', label: 'A new vow' }, { key: 'mine', label: 'Vows published here', k: k.mine }];
  }
}

export function firstPart(tab: Tab, s: State): string {
  switch (tab) {
    case 'agents':
      return s.agents[0] ? `agent:${s.agents[0].id}` : 'add';
    case 'collectives':
      return s.collectives[0] ? `c:${s.collectives[0].id}` : 'found';
    case 'publishing':
      return 'upload';
    case 'vows':
      return 'track';
  }
}

/** A tile opened: its column on the left, the part on the right. */
export function tabPage(s: State, tab: Tab, part: string, k: Parameters<typeof column>[2], as: Acting | null, alarms: string, counts: Partial<Record<Tab, number>>): string {
  return `${topBar(s, tab, as, counts)}${alarms}${opened(column(tab, s, k), part, `<div class="edubba-pane" id="pane"><p class="k-empty">Reading…</p></div>`)}<div id="e-status" class="k-status" role="status" aria-live="polite"></div>`;
}

/** The pane's inner tabs (an agent's four, a collective's five). */
export function innerTabs(tabs: { key: string; label: string }[], on: string): string {
  return `<nav class="edubba-tabs" role="tablist">${tabs.map((t) => `<button type="button" role="tab" data-sub="${e(t.key)}" class="${t.key === on ? 'k-on' : ''}" aria-selected="${t.key === on}">${e(t.label)}</button>`).join('')}</nav>`;
}

/** A head over a pane: a round mark, the name, its short ID (a button, H121: one tap shows it whole), a badge, and what sits top right. */
export function head(o: { name: string; id: string; collective?: boolean; badge?: string; quiet?: boolean; right?: string }): string {
  const initial = (o.name.trim()[0] ?? '?').toUpperCase();
  return `<div class="edubba-head"><span class="k-dot${o.collective ? ' k-c' : ''}">${e(initial)}</span><h2 dir="auto">${e(o.name)}</h2>${idButton(idForm(o.id), { person: o.id })}${o.badge ? `<span class="edubba-badge${o.quiet ? ' edubba-line' : ''}">${e(o.badge)}</span>` : ''}${o.right ? `<span class="edubba-right">${o.right}</span>` : ''}</div>`;
}

/** Kept parts, inside a pane. */
export const inside = (html: string) => `<div class="e-in">${html}</div>`;

export function pairing(): string {
  return `<div class="edubba-first">${appMark(NAME, 'icon.png')}<h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Edubba program running on this Mac, which holds the keys. Open it with the Edubba app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div>`;
}

/** A page of the program's start with nothing else: a note alone. */
export const alone = (html: string) => `<div class="edubba-first">${appMark(NAME, 'icon.png')}${html}</div>`;

/** Before the program answers (the web client's start). */
export const top0 = () => alone('');

// ---------------------------------------------------------------- the identity panel

const runnerSay = () => (WEB ? 'through Kišib’s runner, in the computer’s program only: never in the web client' : 'through Kišib’s runner, on this Mac: Edubba holds no key, and Kišib’s panel asks before To sign signs');

/** + Add's three ways, as the identity panel lists them: make, bring, use one from Kišib (as Dub and Damgar). */
export const ADD = () => [
  { key: 'make', label: 'Make one', say: WEB ? 'in Dub, or in Edubba on a computer' : 'born at the homes in “This app”, its words kept here', empty: WEB },
  { key: 'bring', label: 'Bring one', say: 'its ID and its signing key’s words' },
  { key: 'kishib', label: 'Use one from Kišib', say: runnerSay(), empty: WEB },
];

/** The panel: the identities held (agents are the Agents tile's), the collectives under each, + Add, the foot for the app itself. */
export function panel(s: State, as: Acting | null, adding: boolean, inside = ''): string {
  const ids: PanelIdentity[] = s.identities
    .filter((i) => !s.agents.some((a) => a.id === i.id))
    .map((i) => ({
      id: i.id,
      form: idForm(i.id),
      name: i.kind === 'runner' ? `${i.name} · via Kišib` : i.name,
      // H96: the name Edubba gives it (a nickname, kept here) and the name it published; H88: its ID link, for Share your ID link.
      named: s.held?.[i.id] ? { ...s.held[i.id].named, nick: i.kind === 'runner' ? `${s.held[i.id].named.nick ?? i.name} · via Kišib` : s.held[i.id].named.nick } : null,
      link: s.held?.[i.id]?.link,
      on: i.id === s.acting && !as,
      collectives: (s.under[i.id] ?? []).map((c) => ({ id: c.id, form: idForm(c.id), name: c.name, on: i.id === s.acting && as?.id === c.id, why: c.real ? null : null })),
    }));
  return identityPanel({ ids, adding, add: ADD(), foot: `<button type="button" class="k-btn k-q k-small" data-action="this-app">This app: ${WEB ? 'homes and relays' : 'paired browsers, homes and relays, the collective client’s settings'}</button>`, inside });
}

/** An identity's menu (`⋯`): Name, Words, Line and homes, New words from Kišib; then Remove. */
export function idMenu(i: State['identities'][number]): string {
  const item = (k: string, label: string, hint = '') => `<button type="button" role="menuitem" data-k-item="${e(k)}">${e(label)}${hint ? `<span class="k-k">${e(hint)}</span>` : ''}</button>`;
  return `<div class="k-pop" role="menu"><div class="k-t">${e(i.name)}</div>${item('name', 'Name', i.name)}${i.kind === 'runner' ? '' : item('words', 'Words', 'show the signing words')}${item('line', 'Line and homes')}${i.kind === 'runner' ? '' : item('renew', 'New words from Kišib', 'after a change of keys')}<hr>${item('remove', `Remove from ${NAME}…`)}</div>`;
}

export const nameForm = (i: { id: string; name: string }) =>
  `<form id="rename" data-identity="${e(i.id)}"><label>Its name in ${NAME} (kept ${WEB ? 'in this browser' : 'on this Mac'}; never published)</label><input name="name" value="${e(i.name)}" required><div class="k-row"><button type="submit" class="k-btn k-p">Save</button></div></form>`;

export function lineShown(i: State['identities'][number]): string {
  return `<h4>${e(i.name)}: line and homes</h4><dl class="k-facts"><dt>${NAME}’s line</dt><dd>${cardWords(i.line, NAME, e)}</dd><dt>Kind</dt><dd>${i.kind === 'brought' ? 'brought here by its signing key’s words' : i.kind === 'runner' ? 'used through Kišib’s runner: no key of it here' : 'made here'}</dd></dl><p class="k-small k-faint">Its full record, every line of its acts and what a change of keys must keep, is in Kišib (Identities, An identity’s record). Releases under its own name are made in Ummia.</p>${
    i.releases.length ? `<h4>Its releases made here before (${i.releases.length})</h4><div class="k-list">${i.releases.map((r) => `<div><span>${e(r.name)} ${e(r.version)}</span><span class="k-r">${actId(r.id)}</span></div>`).join('')}</div>` : ''
  }`;
}

export function wordsShown(c: { grouped: string; words: string[]; say: string[] }): string {
  return `<h4>Its signing key’s words</h4><p class="k-small k-soft">${c.say.map(e).join(' ')}</p><div class="k-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div><p class="k-small k-mono">${e(c.grouped)}</p>`;
}

export const removeBox = (name: string) => removeSaid(NAME, name);

/** The panel's foot: the app itself (settled on the mockups): homes and relays, the collective client's settings, the paired browsers. */
export function thisApp(s: State, settingsHtml: string, browsersHtml: string): string {
  return `<h4>This app</h4>${inside(`${s.acting ? `<h3>Rules I follow</h3><div class="k-row"><span class="k-grow k-small k-soft">${s.rules?.missing.length ? `${s.rules.missing.length} not approved yet for this identity.` : 'Every rule Edubba runs is followed by this identity.'}</span><button type="button" class="k-btn k-small" data-action="rules">Rules I follow</button></div>` : ''}<h3>Homes and relays</h3>${settingsHtml}${
    WEB
      ? ''
      : `<section class="card colroot" data-collective-root id="e-col-settings"><h3>For test collectives</h3><p class="small">The collective client’s own settings, kept in its folder.</p><div id="status-col"></div><div id="settings"></div></section><h3>Browsers paired with this program</h3>${browsersHtml}`
  }`)}`;
}

/** No identity yet: what Edubba needs first. */
export function firstScreen(): string {
  return alone(`<h2>First, an identity</h2><p class="k-soft">Edubba signs agreements as an identity: founding a collective, signing as its member, publishing a protected file or a vow. Make one, bring one, or use one Kišib holds, from the panel top right.</p><div class="k-row">${ADD()
    .map((a) => `<button type="button" class="k-btn${a.key === 'bring' ? ' k-p' : ''}" data-add="${a.key}"${a.empty ? ' disabled' : ''}>${e(a.label)}</button>`)
    .join('')}</div><div id="first-part"></div>`);
}

/** Kišib's runner: pair, then choose one it lets Edubba use. */
export function runnerForm(r: { available: boolean; state: string | null; code: string | null; identities: { id: string; form: string; name: string | null; held: boolean }[]; problem: string | null }): string {
  if (!r.available) return '<p class="k-small k-soft">Kišib’s runner is in Edubba on a computer only, never the web client: bring the identity with its signing key’s words instead.</p>';
  const ids = r.identities.length
    ? `<div class="k-list">${r.identities.map((x) => `<div><span>${who({ id: x.id, form: x.form })}</span><span class="k-r">${x.held ? 'held here' : `<button type="button" class="k-btn k-small" data-action="runner-take" data-id="${e(x.id)}">Use it here</button>`}</span></div>`).join('')}</div>`
    : '';
  const state =
    r.state === 'approved'
      ? `<p class="k-small k-soft">Kišib approved Edubba. The identities it lets Edubba use:</p>${ids || '<p class="k-small k-soft">None yet: choose some for Edubba in Kišib (Runner, Apps).</p>'}`
      : r.state === 'waiting'
        ? `<p class="k-small k-soft">Waiting for Kišib: approve Edubba there (Runner, Apps), comparing this code:</p><p class="k-mono">${e(r.code ?? '')}</p><div class="k-row"><button type="button" class="k-btn" data-action="runner-look">Look again</button></div>`
        : `<p class="k-small k-soft">Edubba holds no key of an identity used through Kišib: Kišib signs, in its panel inside Edubba’s window, for To sign (as Dub does); let Edubba open what is sealed to it there (Runner, Apps), so the proposals sent to it can be read here. Member keys are added to Kišib one at a time, on an app’s ask, each approved there.</p><div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Pair with Kišib</button></div>`;
  return `<h4>Use one from Kišib</h4>${r.problem ? `<p class="k-small k-bad">${e(r.problem)}</p>` : ''}${state}`;
}

/** Where a key held here was changed elsewhere: the warning, and the box for the new words right under it (H80, as in the other apps). */
export function spent(lines: { id: string; name: string; say: string; kind: 'identity' | 'collective' }[], forms: string): string {
  return lines.length ? `<div class="k-alarmbox" id="spent">${lines.map((x) => `<p><strong>${e(x.name)}</strong>: ${e(x.say)}</p>`).join('')}${inside(forms)}</div>` : '';
}

/** The seller's alarm (Agreements rule 45b, client conformance): a payment naming a version of a deal that does not descend from the one an identity here holds; shown in red at the top, never filed in a pile. */
export function sellerAlarms(xs: { name: string; alarm?: string; notice?: string; act: string | null }[]): string {
  return xs.length ? `<div class="k-alarmbox" id="seller-alarm">${xs.map((x) => `<p>${x.alarm ? '' : '<span class="k-soft">Notice: </span>'}<strong>${e(x.name)}</strong> received a payment${x.act ? ` (${actId(x.act)})` : ''}: ${e(x.alarm ?? x.notice ?? '')}</p>`).join('')}</div>` : '';
}

// ---------------------------------------------------------------- agents

export const AGENT_TABS = [
  { key: 'talk', label: 'Talk' },
  { key: 'queue', label: 'Queue' },
  { key: 'mind', label: 'Mind' },
  { key: 'terms', label: 'Terms' },
];

export function agentHead(a: AgentDetails, queue: number, sub: string): string {
  return `${head({ name: a.agentName?.replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '') ?? 'An agent', id: a.agent!, badge: a.stopped ? 'stopped' : a.on ? 'answering' : 'off', quiet: !a.on })}${innerTabs(AGENT_TABS.map((t) => (t.key === 'queue' && queue ? { ...t, label: `Queue · ${queue}` } : t)), sub)}`;
}

/** Talk: what it did and the conversation in the feed box, the typing box at the bottom (a sealed private act, as before). */
export function talkPane(cards: string, name: string, stopped: string | null): string {
  return `${stopped ? `<div class="k-alarmbox">Stopped: ${e(stopped)}</div>` : ''}${feedBox({ id: 'talk-feed', cards, empty: `Nothing yet. Write to ${name} below.` })}${typingBox({ id: 'agent-prompt', placeholder: `Write to ${name}… (a sealed private act, answered at once)`, button: 'Send' })}`;
}

/** Queue: pick one or several, retry, look now, nudge. */
export function queuePane(a: AgentDetails, cards: string): string {
  const waiting = a.waiting.length;
  const notAnswered = a.notAnswered.length
    ? inside(`<h4>Not answered (${a.notAnswered.length})</h4>${a.notAnswered.map((x) => `<div class="item"><span class="small">${e(x.kind === 'owner' ? 'Your act' : x.kind === 'pick' ? 'A pick' : 'A nudge')} ${actId(x.act)}: ${e(x.note)}</span> <button data-action="machine-retry" data-act="${e(x.act)}">Try again</button></div>`).join('')}`)
    : '';
  return `<div class="k-row"><button type="button" class="k-btn" data-action="machine-look">Look now for what it received</button><button type="button" class="k-btn" data-action="nudge-open">Nudge it…</button><span class="k-grow"></span><span class="k-small k-soft">picked, waiting for the cap: ${waiting}</span></div>
<div id="nudge-here"></div>
${feedBox({ id: 'queue-feed', cards, empty: 'Nothing waits. Other people’s acts to it come here until you pick them.' })}
<div class="k-row">${a.notified.length > 1 ? '<button type="button" class="k-btn" data-action="machine-picks">Pick the selected: show them together first</button>' : ''}</div><div id="e-picks-shown" class="e-in"></div>${notAnswered}`;
}

export function nudgeForm(): string {
  return inside(`<form id="machine-nudge" class="card"><p class="small">A public act of yours naming it, with a number of actions: it may then answer anyone, comment on its feed, post, or write to you, up to that number, each naming your nudge. It chooses.</p>
<div class="row"><label>Actions <input name="count" type="number" min="1" max="20" value="1" required class="narrow"></label></div>
<label>Your words with the nudge (optional, public)</label><textarea name="context"></textarea>
<div class="row"><button type="submit" class="primary">Nudge</button><button type="button" data-action="nudge-close">Not now</button></div></form>`);
}

/** Mind: its notes (Retire), "MOR as seen by it", its diary behind the public act. */
export function mindPane(notes: string, follows: number, diary: string): string {
  return `<div class="edubba-grid"><div>${inside(notes)}<p class="k-small"><button type="button" class="k-btn k-q" data-action="agent-view">MOR as seen by it: its follows (${follows}), its feed, its inbox →</button></p></div><div id="e-diary">${diary}</div></div>`;
}

/** The public act shown before the diary opens (decided): its words, to whom, public; then Sign it, or Not now. */
export function diaryAct(r: { owner: string; ownerName: string; to: string; text: string; digest: string; say: string; rule: string }, agentName: string): string {
  return `<div class="edubba-diary"><h3>Its diary</h3><p class="k-small k-soft">You can open it on one condition: first sign a public act that says you did. It is addressed to ${e(agentName)}, and everyone can see it.</p>
<div class="edubba-act">${who({ id: r.owner })}<div dir="auto">${e(r.text)}</div><div class="k-small k-faint">to ${who({ id: r.to, inline: true })} · public</div></div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="diary-sign" data-digest="${e(r.digest)}">Sign it, then open the diary</button><button type="button" class="k-btn k-q" data-action="diary-close">Not now</button></div>
${say('The rule is the app’s, not the cryptography’s', [r.rule, r.say])}</div>`;
}

export function diaryShut(): string {
  return `<div class="edubba-diary"><h3>Its diary</h3><p class="k-small k-soft">A reflection it writes for itself every day, sealed to itself; one call to Claude a day, counted under its cap, quiet days included. It opens only after you sign a public act saying you read it.</p><div class="k-row"><button type="button" class="k-btn" data-action="diary-ask">Read it…</button></div></div>`;
}

export function diaryOpen(r: { act: string; entries: { day: string; striking: string; reflection: string; why: string }[] }): string {
  return `<div class="edubba-diary"><h3>Its diary</h3><p class="k-small k-soft">Opened after your public act ${actId(r.act)}, accepted by your homes.</p>${inside(
    r.entries.map((x) => `<div class="item"><h4>${e(x.day)}</h4><p dir="auto">${e(x.striking)}</p><p dir="auto">${e(x.reflection)}</p><p dir="auto" class="small">${e(x.why)}</p></div>`).join('') || '<p class="small">Nothing written yet.</p>',
  )}<div class="k-row"><button type="button" class="k-btn" data-action="diary-close">Close the diary</button></div></div>`;
}

/** Terms: answering on or off, its terms, its cap, its key, its grants; the keepers noted. */
export function termsPane(a: AgentDetails, grants: string, keeperFor: string[]): string {
  const switchB = (value: boolean, words: string) => `<button type="button" class="k-btn${a.on === value ? ' k-p' : ' k-q'}" data-action="machine-on" data-on="${value}" aria-pressed="${a.on === value}">${words}</button>`;
  const keyLine = a.key.found ? `${a.key.kind === 'own' ? 'its own key' : 'the shared key'} …${e(a.key.last4 ?? '')}${a.key.warning ? `. ${e(a.key.warning)}` : ''}` : e(a.key.from);
  return `<div class="edubba-grid"><div class="k-box k-fill"><h3>Its agency terms</h3><p class="k-small k-soft">${a.terms ? `Signed · ${actId(a.terms.act)}` : 'Not signed.'}${a.named ? ` · display name “${e(a.named.name)}”` : ' · <button type="button" class="k-btn k-q k-small" data-action="agent-name">Publish its display name</button>'}</p>
<div class="k-row" role="group" aria-label="Answering">${switchB(true, 'Answering')}${switchB(false, 'Off')}</div>
${a.terms ? `<details class="k-say"><summary>Its terms in words<span class="k-help">?</span></summary><div class="k-more-text">${a.terms.words.map((w) => `<p>${e(w)}</p>`).join('')}</div></details>` : ''}
<p class="k-small k-soft">${a.on ? 'Its owner’s own messages and public acts to it are answered at once; others wait in its queue until you pick them.' : 'Nothing is answered and no call is made.'}</p></div>
<div class="k-box"><h3>Its cap and its key</h3><dl class="k-facts"><dt>Calls a day</dt><dd>${a.callsPerDay} (${a.callsToday} today)</dd><dt>Each answer</dt><dd>at most ${a.maxChars.toLocaleString('en')} characters</dd><dt>Key</dt><dd>${keyLine}</dd></dl>
${fold('Change them', `<div class="e-in"><form id="machine-cap" class="row"><label>Calls a day <input name="callsPerDay" type="number" min="0" max="1000" value="${a.callsPerDay}" class="narrow"></label><label>Each answer at most <input name="maxChars" type="number" min="50" max="20000" value="${a.maxChars}" class="narrow"></label><button type="submit">Save the cap</button></form>
<form id="agent-key"><div class="row"><label class="check"><input type="radio" name="own" value="shared"${a.key.kind === 'own' ? '' : ' checked'}> The shared key</label><label class="check"><input type="radio" name="own" value="own"${a.key.kind === 'own' ? ' checked' : ''}> A key of its own</label></div>
<input name="key" type="password" autocomplete="off" spellcheck="false" placeholder="Its own key, if it has one"><div class="row"><button type="submit">Save its key</button></div></form><p class="small">The key is never shown here beyond its last four characters.</p></div>`)}</div></div>
<div id="e-grants">${inside(grants)}</div>
<div class="k-box"><h3>Keeper for</h3><p class="k-small k-soft">${keeperFor.length ? keeperFor.map((n) => `${e(n)}’s acts · record what arrived (in Collectives › ${e(n)} › Keepers)`).join('<br>') : 'No collective here names it as a keeper.'}</p></div>`;
}

/** The API key: the shared key, by its last four characters; a new one plugged in. */
export function keyPane(s: State, keySay: string): string {
  return `<h2>The API key</h2><p class="k-soft">${s.sharedKey.found ? `A shared key is in place (…${e(s.sharedKey.last4 ?? '')}), used by every agent without a key of its own.` : 'No key is in place yet. One is needed before an agent can answer.'}</p>
<form id="shared-key"><label>The Anthropic API key</label><input name="key" type="password" autocomplete="off" spellcheck="false" placeholder="The key, as the Anthropic Console gives it" required><div class="k-row"><button type="submit" class="k-btn k-p">Keep this key</button></div></form>${say('Kept on this Mac only', [keySay])}`;
}

// ---------------------------------------------------------------- collectives

export const COLLECTIVE_TABS = [
  { key: 'act', label: 'Act' },
  { key: 'members', label: 'Members' },
  { key: 'money', label: 'Money' },
  { key: 'keepers', label: 'Keepers' },
  { key: 'sign', label: 'To sign' },
];

export function collectiveHead(c: State['collectives'][number], sub: string, toSign: number): string {
  const badge = c.brought ? 'brought here · no key held' : c.real ? `real · ${c.members} members` : `test mode · ${c.members} member${c.members === 1 ? '' : 's'}${c.closed ? ' · ended' : ''}`;
  const tabs = c.real ? COLLECTIVE_TABS : c.brought ? COLLECTIVE_TABS.filter((t) => t.key === 'act' || t.key === 'sign') : [{ key: 'act', label: 'Act' }, { key: 'members', label: 'Members, money and endings' }];
  return `${head({ name: c.name, id: c.id, collective: true, badge, quiet: true, right: '<button type="button" class="k-btn k-q" data-action="constitution">Its constitution, in plain words</button>' })}${innerTabs(tabs.map((t) => (t.key === 'sign' && toSign ? { ...t, label: `To sign · ${toSign}` } : t)), sub)}`;
}

/** Act: what you may do as chips, the collective's feed, the typing box (post for it). */
export function actPane(o: { name: string; acting: string; chips: string; cards: string; typing: string | null; note?: string }): string {
  return `<div class="edubba-chips"><span>Acting as ${e(o.acting)}, for ${e(o.name)}. What you may do, from its agreement:</span>${o.chips}</div>${o.note ? `<p class="k-small k-soft" id="e-perms">${o.note}</p>` : ''}
<div id="e-post-review" class="e-in"></div>${feedBox({ id: 'collective-feed', cards: o.cards, empty: `Nothing posted for ${o.name} yet.` })}${o.typing ?? ''}`;
}

export function postBox(name: string, picture: boolean): string {
  return typingBox({ id: 'collective-post', placeholder: `Post for ${name}…`, button: picture ? 'Review' : 'Post', tools: picture ? '<label title="A picture (JPEG)">▣ Picture<input name="jpeg" type="file" accept="image/jpeg"></label>' : '' });
}

/** A permission as a chip: its words, and whether it may be done now. */
export function chip(what: string, state: 'yes' | 'with others' | 'no', rest: string): string {
  return `<span class="k-chip${state === 'yes' ? ' k-on' : ''}" title="${e(rest)}">${e(what)}${state === 'with others' ? ' · with others’ keys' : state === 'no' ? ' · not now' : ''}</span>`;
}

// ---------------------------------------------------------------- publishing and vows

export const MEDIA = [
  { key: 'text', label: 'A text' },
  { key: 'picture', label: 'A picture' },
  { key: 'video', label: 'A video' },
  { key: 'audio', label: 'An audio (M4A)' },
] as const;

/** Who acts, as chips: the identity in use, and the collectives it acts for (the chooser Ummia shares, drawn as the mockup does). */
export function whoActs(actors: { id: string; short: string; kind: 'self' | 'collective'; available: boolean; why: string | null }[], as: string | null, names: (id: string) => string): string {
  return `<div class="edubba-chips"><span class="k-lbl">Who acts</span>${actors
    .map((a) => `<button type="button" class="k-chip${a.id === as ? ' k-on' : ''}" data-actor="${e(a.id)}"${a.available ? '' : ` disabled title="${e(a.why ?? '')}"`}>${e(names(a.id))}</button>`)
    .join('')}${fold('+ a collective by its ID', `<form id="collective-add" class="k-row"><input name="collective" placeholder="mid1…" autocomplete="off" spellcheck="false">${contactsButtonFor('collective')}<button type="submit" class="k-btn">Add it</button></form>`)}</div>`;
}

/**
 * Rows of people (H98, decided by Nobody, allegedly: "start with two IDs me
 * and another, then give option to add more people"): you, filled in, and
 * one other person, then "+ Add a person"; the first two not removable.
 * With shares, even until one is touched; with labels, a short note of who
 * each is ("client", "relay", "split service"…), suggested, never required.
 */
export function peopleRows(o: { id: string; me: string; shares?: boolean; labels?: boolean; names: string[]; meLabel?: string; other?: string; add?: string }): string {
  const list = `<datalist id="e-names-${e(o.id)}">${o.names.map((n) => `<option value="${e(n)}"></option>`).join('')}</datalist><datalist id="e-labels"><option value="publisher"></option><option value="client"></option><option value="relay"></option><option value="split service"></option></datalist>`;
  return `${list}<div class="e-people" data-people="${e(o.id)}"${o.shares && !o.labels ? ' data-even' : ''}>${personRow(o, 1, o.me, true)}${personRow(o, 2, '', false)}</div><div class="k-row"><button type="button" class="k-btn" data-action="people-add" data-people-for="${e(o.id)}">${e(o.add ?? '+ Add a person')}</button></div>`;
}

/** One row of `peopleRows`: the first is you (filled in, not typed). */
export function personRow(o: { id: string; shares?: boolean; labels?: boolean; meLabel?: string; other?: string }, n: number, me: string, first: boolean): string {
  const who = first
    ? `<input name="who-${n}" value="${e(me)}" readonly aria-label="You" class="k-grow">`
    : `<input name="who-${n}" class="k-grow" list="e-names-${e(o.id)}" autocomplete="off" placeholder="${e(o.other ?? 'A name in your contacts')}" aria-label="Person ${n}">${contactsButtonFor(`who-${n}`)}`;
  return `<div class="edubba-grid e-person" data-person="${n}"><div><label>${first ? 'You' : n === 2 ? 'And' : 'And also'}</label><div class="k-row">${who}</div></div>${o.labels ? `<div><label>Label (optional)</label><input name="label-${n}" list="e-labels" maxlength="60" autocomplete="off" value="${first && o.meLabel ? e(o.meLabel) : ''}"></div>` : ''}${o.shares ? `<div><label>${o.labels ? 'Share off the top, %' : 'Share, %'}</label><div class="k-row"><input name="share-${n}" inputmode="decimal" autocomplete="off" class="k-grow">${n > 2 ? `<button type="button" class="k-btn k-q" data-action="people-remove" aria-label="Remove person ${n}">Remove</button>` : ''}</div></div>` : n > 2 ? '<div><button type="button" class="k-btn k-q" data-action="people-remove">Remove</button></div>' : ''}</div>`;
}

/** Way 1: upload, then (optional) a price tag on the bare bake or a claim. */
export function uploadPane(o: { who: string; media: string; unit: string; say: string[]; me: string; names: string[]; bakeStays: string }): string {
  const what = `<div class="edubba-chips"><span class="k-lbl">What</span>${MEDIA.map((m) => `<button type="button" class="k-chip${m.key === o.media ? ' k-on' : ''}" data-media="${m.key}">${e(m.label)}</button>`).join('')}</div>`;
  const input =
    o.media === 'text'
      ? '<label>The text to upload (opened by each buyer once paid)</label><textarea name="text" rows="5"></textarea>'
      : `<label>${o.media === 'picture' ? 'The picture: a JPEG file' : o.media === 'video' ? 'The film: an MP4 file (the video Module)' : 'The recording: an M4A file (the audio Module)'}</label><input type="file" name="file" accept="${o.media === 'picture' ? 'image/jpeg' : o.media === 'video' ? '.mp4,video/mp4' : '.m4a,audio/mp4'}">${o.media === 'picture' ? '' : `<p class="k-small k-soft">Checked by the ${o.media === 'video' ? 'video' : 'audio'} Module, then stripped to the ${o.media === 'video' ? 'film' : 'sound'} alone before anything is locked: every ${o.media === 'video' ? 'frame' : 'sample'} byte for byte; titles, dates, places and covers removed.</p>`}`;
  return `<h2>Upload</h2>${say('Locked, uploaded; then, if you want, a price tag or a claim', [...o.say, o.bakeStays])}${o.who}${what}
<form id="pub-upload" data-media="${e(o.media)}">${input}
<label>Title</label><input name="title" type="text" maxlength="200" autocomplete="off" placeholder="The public words of the post that shows it">
<fieldset class="e-then"><legend class="k-lbl">Then</legend>
<label class="k-check"><input type="radio" name="then" value="none" checked> Nothing more for now</label>
<label class="k-check"><input type="radio" name="then" value="price"> A price tag on it: whoever pays it pays you, the uploader, unsplit</label>
<div class="e-then-price"><label>Price (${e(o.unit)})</label><input name="price" inputmode="numeric" autocomplete="off"></div>
<label class="k-check"><input type="radio" name="then" value="claim"> A claim: you made it (with others, if so); then an ownership agreement and a publication, if you want</label>
<div class="e-then-claim"><p class="k-small k-soft">Made with (optional): each signs the claim in their own Edubba.</p>${peopleRows({ id: 'upload-creators', me: o.me, names: o.names, other: 'Made with… (a name in your contacts, or nobody)' })}</div>
</fieldset>
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form><div id="e-pub-review" class="e-in"></div>`;
}

/** Way 2: a claim alone, of a work already uploaded (here or anywhere) or a vow by its name. */
export function claimPane(o: { who: string; me: string; names: string[]; bakes: { id: string; title: string }[] }): string {
  return `<h2>Claim</h2>${say('“I made this”: a work already uploaded', ['A claim binds a work’s fingerprint to its creators (Agreements rule 7). It records who said it first on MOR, never who truly made it, and sells nothing: an ownership agreement and a publication come after, if you want.'])}${o.who}
<form id="pub-claim"><label>The work: an upload here, or a bake’s ID, a vow’s name, or a work’s fingerprint</label>
<div class="k-row"><input name="work" class="k-grow" list="e-bakes" autocomplete="off" spellcheck="false">${contactsButtonFor('work')}</div>
<datalist id="e-bakes">${o.bakes.map((b) => `<option value="${e(b.id)}">${e(b.title)}</option>`).join('')}</datalist>
<label>Title</label><input name="title" type="text" maxlength="200" autocomplete="off" placeholder="How it is called here and in To sign">
<p class="k-small k-soft">Its creators: you, and those you made it with (optional), each signing it in their own Edubba.</p>${peopleRows({ id: 'claim-creators', me: o.me, names: o.names, other: 'Made with… (a name in your contacts, or nobody)' })}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form><div id="e-pub-review" class="e-in"></div>`;
}

/** Way 3: an ownership agreement from a claim (H98: you and one other, then more; shares even until touched). */
export function ownershipPane(o: { who: string; me: string; names: string[]; claims: { id: string; title: string }[]; say: string[] }): string {
  return `<h2>Ownership agreement</h2>${say('Who owns what share of a claimed work', ['Ownership only: no split, no fees, no split service. How it is sold, with which partners, is each publication’s, reading these shares.', ...o.say])}${o.who}
<form id="pub-ownership"><label>From the claim</label>
<select name="claim">${o.claims.length ? o.claims.map((c) => `<option value="${e(c.id)}">${e(c.title)} · ${e(c.id.slice(0, 8))}…</option>`).join('') : '<option value="">No claim made here yet: claim a work first (2 · Claim)</option>'}</select>
<label>Title</label><input name="title" type="text" maxlength="200" autocomplete="off" placeholder="Its words begin with it (the claim’s title if empty)">
<h3>Who owns it</h3>${peopleRows({ id: 'owners', me: o.me, shares: true, names: o.names })}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form><div id="e-pub-review" class="e-in"></div>`;
}

/** Way 4: a publication from an ownership agreement (or as its lone seller). */
export function publicationPane(o: { who: string; me: string; names: string[]; unit: string; ownerships: { id: string; title: string; ready: boolean }[]; bakes: { id: string; title: string }[] }): string {
  return `<h2>Publication</h2>${say('How it is sold: what, with which partners, through which split service, at what price', ['The publication is the offer. Every payment goes to its split service, which pays everyone: the partners and a referral off the top, then the owners by their shares. Every party signs it: each owner, each partner, the split service.'])}${o.who}
<form id="pub-publication"><label>Its owners</label>
<select name="owners">${o.ownerships.map((x) => `<option value="${e(x.id)}">The ownership agreement “${e(x.title)}”${x.ready ? '' : ' (not every owner has signed yet)'}</option>`).join('')}<option value="">You alone: a lone seller’s publication</option></select>
<label>What it sells</label><div class="e-sold">${o.bakes.length ? o.bakes.map((b, i) => `<label class="k-check"><input type="checkbox" name="sold" value="${e(b.id)}"${i === 0 ? ' checked' : ''}> ${e(b.title)}</label>`).join('') : '<p class="k-small k-soft">Nothing uploaded here yet: give a bake’s ID or a vow’s name below.</p>'}</div>
<input name="soldTyped" placeholder="Or a bake’s ID, or a vow’s name" autocomplete="off" spellcheck="false">
<label>Title</label><input name="title" type="text" maxlength="200" autocomplete="off" placeholder="The public words of the post announcing it">
<div class="edubba-grid"><div><label>Price (${e(o.unit)})</label><input name="price" inputmode="numeric" autocomplete="off"></div><div><label>Referral off the top, % (optional)</label><input name="referral" inputmode="decimal" autocomplete="off"></div></div>
<label>The split service: receives every payment, pays everyone</label><div class="k-row"><input name="service" class="k-grow" list="e-names-partners" autocomplete="off" spellcheck="false" placeholder="A name in your contacts, or its ID">${contactsButtonFor('service')}</div>
<label class="k-check"><input type="checkbox" name="withPartners" value="yes"> With partners, each paid off the top (a publisher, a relay, a client…)</label>
<div class="e-partners">${peopleRows({ id: 'partners', me: o.me, shares: true, labels: true, names: o.names, meLabel: 'publisher', other: 'A name in your contacts, or an ID', add: '+ Add a partner' })}</div>
<fieldset><legend class="k-lbl">Its price tag, signed by</legend>
<label class="k-check"><input type="radio" name="tagBy" value="service" checked> Its split service, in its own app</label>
<label class="k-check"><input type="radio" name="tagBy" value="me"> You, the party it designates (as its lone seller, or one of its partners)</label></fieldset>
<label>Its words (optional): its terms of delivery, refund and contest</label><textarea name="words" rows="2"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form><div id="e-pub-review" class="e-in"></div>`;
}

export function herePane(cards: string, waiting: number): string {
  return `<h2>Published here</h2><div class="k-row"><button type="button" class="k-btn" data-action="pub-gather">Look for signatures${waiting ? ` · ${waiting} waiting` : ''}</button><button type="button" class="k-btn" data-action="pub-deliver">Deliver keys to buyers</button><span class="k-small k-soft">Keys go to each buyer your Damgar, or a publication’s split service, told of.</span></div><div id="e-pub-review" class="e-in"></div>${feedBox({ id: 'here-feed', cards, empty: 'Nothing uploaded, claimed or published here yet.' })}`;
}

export function salesPane(rows: string, problems: string[] = [], shared = ''): string {
  return `<h2>Sales</h2><p class="k-small k-soft">Each buyer whose key was delivered from here: a sale your Damgar signed the receipt for. A buyer’s contest of their purchase is shown beside it: it undoes nothing.</p>${problems.length ? `<p class="k-small k-soft">${problems.map(e).join('<br>')}</p>` : ''}${rows || '<p class="k-empty">No sale yet.</p>'}
<h3>Shared works</h3><p class="k-small k-soft">Sales of a work you share with other people, or of a collective you are a member of, as its split service told you: the buyer’s claim is sealed to every one of you, and their contest shows beside it.</p>${shared || '<p class="k-empty">No sale of a shared work told to you yet.</p>'}`;
}

/** The buyer's contests shown beside one purchase (F386), as the core reads them. */
export interface ContestsBeside {
  state: 'shown' | 'unknown';
  contests: { act: string; promise: string | null }[];
  why?: string;
  /** The core reads the payment as no purchase: its words (a contest shows beside a purchase only). */
  noPurchase?: string | null;
}

/** The contests beside a sale: each in red, the promise not kept in words where said; "unknown" where the core cannot say; nothing where there is none. */
/** Track: a vow's sale whose answer rests on a payment not verified here reads unknown, with its reason, never pending or paid (S7e). */
export function saleUnknown(s: { state: string; why?: string | null }): { text: string; tone: 'warn' }[] {
  return s.state === 'unknown' ? [{ text: `unknown: ${s.why ?? 'a receipt or claim it rests on has no rail answer here'}`, tone: 'warn' }] : [];
}

export function contestsBeside(c: ContestsBeside | undefined): string {
  if (!c) return '';
  if (c.state === 'unknown') return `<div class="k-small k-soft edubba-beside">Its buyer’s contests: unknown (${e(c.why ?? 'not read')}).</div>`;
  if (c.noPurchase) return `<div class="k-small k-soft edubba-beside">The core reads this payment as no purchase (${e(c.noPurchase)}): a buyer’s contest shows beside a purchase only.</div>`;
  return c.contests.map((x) => `<div class="k-label k-bad edubba-beside" data-contest="${e(x.act)}">Contested by its buyer${x.promise ? `: “${e(x.promise)}”` : ''} · ${actId(x.act)}</div>`).join('');
}

/** Track (decided: "track contests by pointing at people, collectives or relays"): point at, show, one feed. */
export function trackPane(points: { key: string; label: string }[], show: string, cards: string, problems: string[]): string {
  const shows = ['all', 'vows', 'sales', 'confirmed', 'contested'];
  return `<h2>Track</h2><div class="k-point"><span class="k-lbl">Point at</span>${points.map((p) => `<span class="k-chip k-on">${/^[0-9a-f]{64}$/.test(p.key) ? who({ id: p.key, inline: true }) : e(p.label)} <button type="button" class="k-x" data-unpoint="${e(p.key)}" aria-label="Not this one">×</button></span>`).join('')}<form id="point-add" class="k-row"><input name="at" placeholder="+ a person, a collective, a relay" autocomplete="off" spellcheck="false">${contactsButtonFor('at')}</form></div>
<div class="k-point"><span class="k-lbl">Show</span>${shows.map((x) => `<button type="button" class="k-chip${x === show ? ' k-on' : ''}" data-show="${x}">${x}</button>`).join('')}</div>
${problems.length ? `<p class="k-small k-soft">${problems.map(e).join('<br>')}</p>` : ''}${feedBox({ id: 'track-feed', cards, empty: points.length ? 'Nothing of that kind at the places pointed at.' : 'Point at a person, a collective or a relay.' })}<p class="k-clock">Asked of the relays pointed at (or Edubba’s own): only what they hold is seen; nothing is indexed.</p>`;
}

export function newVowPane(o: { who: string; unit: string; shares?: string }): string {
  return `<h2>A new vow</h2>${say('Something MOR cannot hash, or not yet', ['A seat, a lesson, a thing to be made. Each purchase is a sale its buyer confirms (kept) or contests (not kept), in their own app: Dub, or here in Track.'])}${o.who}
<form id="pub-vow"><label>What is vowed, in words: what the buyer gets</label><textarea name="words" rows="3"></textarea>
<div class="edubba-grid"><div><label>Title</label><input name="title" type="text" maxlength="200" autocomplete="off"></div><div><label>Price (${e(o.unit)})</label><input name="price" inputmode="numeric" autocomplete="off"></div></div>
${o.shares ?? ''}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form><div id="e-vow-review" class="e-in"></div>`;
}

export function minePane(cards: string): string {
  return `<h2>Vows published here</h2>${feedBox({ id: 'mine-feed', cards, empty: 'No vow published here yet.' })}`;
}

/** A modal of Edubba's own (a reading, the constitution, a form): the kit's pop-up look, without its thread. */
export function modal(title: string, body: string): string {
  return `<div class="k-shade" data-e-modal></div><div class="k-modal" role="dialog" aria-label="${e(title)}" data-e-modal><div class="k-mh"><h3>${e(title)}</h3><button type="button" class="k-round" data-action="modal-close" aria-label="Close">×</button></div><div class="edubba-modal-body e-in">${body}</div></div>`;
}

export { WEB_KEPT_SAY };
