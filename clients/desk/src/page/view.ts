// Edubba's page, as HTML strings (F333; called MOR Identities until 16
// October 2026). Three tabs: Agents, Identities, Collectives, each with its
// list on top and the one selected below. Everything that comes from the
// program, from relays or from Claude is escaped: names, addresses, texts,
// notes. Texts to be signed are shown as plain text, character for
// character, every invisible control written out as <U+…> (Text rule 5a).
//
// The look is Dub's (F332): calm and sparse, after Damus and Snort (studied
// for layout and feel only; no code copied); the background #06080c; Inter in
// light weights, bundled; colour only for a layer and at low saturation (the
// Identity layer's grey-blue for fingerprints, the Envelopes layer's
// grey-violet for what is sealed); red only for a contest, a void act or a
// stolen key; no glow; each item in its own clearly outlined card.

import { chooserHtml, type Actor } from '../../../ummia/src/acting.ts';
import { e } from '../../../manage/src/view.ts';
import { STYLE as DUB, proposal as dubProposal, share as dubShare, SIGNING_LABEL } from '../../../dub/src/page/view.ts';
import type { Proposal as MemberProposal, ShareShown } from '../../../dub/src/shapes.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { Listing } from '../folders.ts';
import type { ActRead, RealCollective, RealProposal, ShareHere, AgentDetails, AgentSummary, AgentView, Constitution, Done, DraftView, IdentityRecord, Item, Line, MachineState, Permissions, Sorted, State } from './api.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';
import { shownAct, shownId } from '../../../genesis/src/shown.ts';
import { GRID_STYLE } from './grid-view.ts';

export { e };

/**
 * The web client (for testing only; `../web/app.ts`): the same page without
 * the Agents tab, nothing of Claude's, no folder, no pairing, and its banner
 * in the page's HTML on every screen (`WEB_BANNER`). Set once, at the start.
 */
let WEB = false;
export function setWeb(on: boolean): void {
  WEB = on;
}
export const isWeb = () => WEB;

/** Where Edubba keeps a name or a contact: on the Mac, its folder; on the web, this browser's storage. */
const kept = () => (WEB ? 'kept in this browser' : 'kept on this Mac');

/** Said where the web client keeps an identity's keys (as Dub's web client says it, `KEPT_SAY`). */
export const WEB_KEPT_SAY =
  'Its signing key and its encryption key are kept in this browser’s storage (IndexedDB, for this site only), as they are, not locked: the only lock this page could put on them is one it could open by itself, and so could whatever else runs in this page. Never bring a real identity here.';

/**
 * The web client's banner, on every screen (as Dub's, Kišib's, Damgar's and
 * Ummia's): for testing only, and the risks in plain words. It is in the
 * page's HTML itself (`static/web.html`, written there by the build),
 * outside what the script draws, so it shows even when the script does not
 * run.
 */
export const WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> Test identities only, until MOR is frozen; regtest or signet only. The risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment you bring an identity here could copy its signing key: with it, sign as you (proposals, signatures, a collective’s acts) and read its private messages.</li>
<li>This browser’s storage keeps, as they are and not locked: the signing and encryption keys of each identity you bring; the signing key of each collective you found here; and, while you sign as a member, the one-time key for your share until you have written the share down. That storage can be lost (cleared, a private window, the browser tidying up), or read by what runs in this page.</li>
<li>Founding a collective here deals its chain key in this page: for a moment this page holds the whole chain key, in its memory, never in its storage; your share and any shown hand to hand wait there, an hour at most, until shown, and a reload or a closed tab loses them. If this page’s code or this device were not honest, it could keep the chain key and later act alone (F337). For a collective that matters, found it in Edubba on a computer.</li>
<li>No agents, no API key and nothing from Claude here: those need Edubba on the Mac.</li></ol>
<p>Never bring a real identity here.</p></div>`;

/** The app's name, as the person sees it (decided by Nobody, allegedly, F333: "Edubba it is"). */
export const NAME = 'Edubba';

/** Said beside the drafts, while the page watches for new ones. */
export const WATCHING = 'New drafts from Claude appear here by themselves, every few seconds.';

/** Said under the prompt box (src/agents.ts, PROMPT_SAY). */
export const PROMPT_SAY =
  'What you type here is an act: a private message from your identity to this agent, sealed so only it can open it, signed and kept. It answers at once, privately, under its terms.';

/** Said where the key is plugged in (src/agents.ts, KEY_SAY). */
/** Said wherever the present test mode is offered (`src/real.ts`, TEST_MODE_SAY), word for word. */
export const TEST_MODE_SAY =
  'Test mode: every member is held in this Edubba, and their consent is simulated: you decide for all of them. The shares of its chain key are kept in this Edubba’s folder. For trying things alone, and for the tests: nobody else is asked, and nothing it signs binds anyone but you.';

/** Said beside "+ Found a real collective" (H27; `src/real.ts`, REAL_SAY), word for word. */
export const REAL_SAY =
  'A real collective: each member is a person with their own identity, on their own device. Each reads the founding in plain words and signs it in their own app (Dub’s Signing tab, or Edubba). Its chain key is dealt as one share per member, written on paper; no app keeps a share.';

export const KEY_SAY =
  'The key goes from this page to the program once, and is kept in a file on this Mac that only your account can read (~/.config/mor). This page never holds it again: it is shown by its last four characters only.';

/**
 * Dub's style, then Edubba's own: the lists on top, the cards below, the
 * sub-tabs, the pop-up, and the classes the collective client's reviews use,
 * in the same calm dark.
 */
/**
 * Edubba's tint (H36): the Agreements layer's emerald, #48c08c (chosen by
 * the Edubba agents session, the visual bible's value not being in the
 * repository), laid over #06080c at a share, channel by channel (Kišib's
 * rule): separators 22% (#153028), outlines of cards, fields and buttons
 * 30% (#1a3f32), quiet accents (a hover or focus outline, a fold's mark, a
 * tab's count) 60% (#2e7659). Red stays for a contest, a void act or a
 * stolen key.
 */
export const TINT = { layer: '#48c08c', line: '#153028', edge: '#1a3f32', accent: '#2e7659' } as const;

export const STYLE = `${DUB}${GRID_STYLE}
${TEXT}
:root{--line:${TINT.line};--edge:${TINT.edge};--tint:${TINT.accent}}
button:hover,.door:hover{border-color:var(--tint)}
input:focus,textarea:focus{border-color:var(--tint)}
details>summary::before{color:var(--tint)}
.bar{border-bottom-color:var(--edge)}
.label{display:inline-block;font-size:12px;color:var(--soft);border:1px solid var(--tint);border-radius:999px;padding:0 8px;margin-right:6px}
main{max-width:760px}
.bar .tabs{margin:0 0 0 18px}
.bar{flex-wrap:wrap;row-gap:6px}
.tabs{flex-wrap:wrap;min-width:0}
.card,.item,.note,.entry{overflow-wrap:anywhere;min-width:0}
.bar .grow{flex:1}
.testonly{margin:10px 0 0;font-size:12px;color:var(--faint)}
h2{font-size:16px}
h3{font-size:15px}
h4{font-weight:400;font-size:14px;color:var(--soft);margin:16px 0 6px}
.list{display:flex;flex-direction:column;gap:8px;margin:16px 0}
.list,.feed,.picks{max-height:min(60vh,32em);overflow-y:auto;overscroll-behavior:contain;padding-right:4px}
.feed{border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:8px 0}
.entry{display:flex;gap:14px;align-items:baseline;justify-content:space-between;text-align:left;width:100%;border:1px solid var(--edge);border-radius:12px;background:var(--raise);padding:10px 14px;color:var(--text);font-size:14px}
.entry[aria-current=true]{border-color:var(--identity)}
.entry .meta{font-size:12px;color:var(--soft);text-align:right}
.entry.add{justify-content:flex-start;color:var(--soft);background:none;border-style:dashed}
.entry .count{margin-left:6px}
.detail{border-top:1px solid var(--line);margin-top:18px;padding-top:4px}
.card{border:1px solid var(--edge);border-radius:12px;background:var(--raise);padding:14px 16px;margin:12px 0}
.card h3{margin:0 0 8px}
.card ul{margin:6px 0;padding-left:1.1em}
.card li{margin:4px 0}
li.warn{color:var(--soft)}
li.bad{color:var(--bad)}
li.ok{color:var(--text)}
.head{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}
.head h2{margin:18px 0 4px}
.id{font:13px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity);overflow-wrap:anywhere}
code{color:var(--identity)}
.tag{display:inline-block;font-size:11px;letter-spacing:.04em;padding:1px 8px;border-radius:999px;border:1px solid var(--edge);color:var(--soft)}
.tag.ok{color:var(--text)}
.tag.warn{color:var(--soft)}
.tag.bad{color:var(--bad);border-color:var(--bad)}
.tag.sealed{color:var(--envelopes)}
.plain{border:1px solid var(--edge);border-radius:10px;padding:10px 12px;margin:6px 0 12px;max-height:24em;overflow:auto;background:var(--bg);white-space:pre-wrap;overflow-wrap:anywhere}
.claude{border:1px dashed var(--edge);border-radius:10px;padding:8px 12px;margin:8px 0;white-space:pre-wrap}
.yours{border-left:2px solid var(--faint);padding:6px 12px;margin:8px 0;white-space:pre-wrap}
.picture img,.pics img{max-width:100%;max-height:28em;border-radius:10px;display:block;margin:8px 0}
.digest{font:12px ui-monospace,Menlo,monospace;color:var(--soft);overflow-wrap:anywhere}
.item{border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:10px 0;background:var(--bg)}
.item .text{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0}
.sorts{display:flex;gap:16px;flex-wrap:wrap;margin-top:6px;border-top:1px solid var(--line);padding-top:6px}
.sorts button{border:none;padding:2px 0;color:var(--soft);border-radius:0;font-size:13px}
.sorts button[aria-pressed=true]{color:var(--text);text-decoration:underline;text-underline-offset:4px}
.switch{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px}
.switch button{padding:3px 12px;font-size:13px}
.switch button[aria-pressed=true]{background:var(--text);color:var(--bg);border-color:var(--text)}
.switch button[aria-pressed=false]{color:var(--soft)}
.here:empty{display:none}
.copy{font-size:12px;padding:2px 10px;margin-left:8px}
.sub{display:flex;gap:4px;margin:14px 0 4px;border-bottom:1px solid var(--line);padding-bottom:8px}
.sub .tab{font-size:14px}
.chat{display:flex;flex-direction:column;gap:8px;margin:8px 0}
.chat .msg{margin:0;max-width:85%}
.chat .owner{align-self:flex-end;background:var(--bg)}
.chat .agent{align-self:flex-start}
.chat .who{font-size:12px;color:var(--faint)}
.state{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}
.state.no{color:var(--faint)}
dialog{background:var(--bg);color:var(--text);border:1px solid var(--edge);border-radius:14px;max-width:720px;width:calc(100% - 32px);max-height:86vh;padding:0}
dialog::backdrop{background:rgba(6,8,12,.82)}
dialog .inner{padding:18px 20px;overflow:auto;max-height:86vh}
dialog .close{float:right}
.colroot .review{border:1px solid var(--faint);border-radius:12px;padding:16px;margin:14px 0;background:var(--raise)}
.colroot .review h2{font-size:17px;margin:0 0 8px}
.colroot .review h3{font-size:14px;color:var(--soft);margin:16px 0 6px}
.colroot .area{border-top:1px solid var(--line);margin-top:10px}
.colroot fieldset,.card fieldset{border:1px solid var(--edge);border-radius:10px;margin:8px 0;padding:8px 12px}
.colroot legend{font-size:13px;color:var(--soft)}
.colroot .grid{display:grid;grid-template-columns:max-content 1fr;gap:6px 12px;align-items:center}
.colroot table{border-collapse:collapse;width:100%;font-size:14px}
.colroot th,.colroot td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
.colroot th{font-weight:400;color:var(--faint);font-size:12px}
.colroot ul.plain{list-style:none;padding:10px 12px}
.colroot input[type=number]{width:6em}
.colroot label.check,.card label.check{display:inline-flex;margin:4px 14px 4px 0}
select{font:inherit;color:var(--text);background:var(--raise);border:1px solid var(--edge);border-radius:10px;padding:7px 10px}
input[type=checkbox],input[type=radio]{width:auto}
.code{font:18px ui-monospace,Menlo,monospace;letter-spacing:.06em}
.empty{padding:16px 0}
input.narrow{width:7em}
input.pet{max-width:14em}
.card>h2:first-child{margin-top:0}
.colroot form.words{display:flex;grid-template-columns:none;font:inherit;padding:0;border:none;margin:10px 0}
.colroot form.words input{flex:1}
.colroot input.wide{width:100%}
.picks{display:flex;flex-direction:column;gap:2px;margin:6px 0}
table.signers{border-collapse:collapse;width:100%;font-size:14px;margin:8px 0}
table.signers th,table.signers td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--line)}
table.signers th{font-weight:400;color:var(--faint);font-size:12px}
.words{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5em,1fr));gap:6px 14px;margin:14px 0;padding:14px;border:1px solid var(--edge);border-radius:12px;font:15px ui-monospace,"SF Mono",Menlo,monospace}
.words b{display:inline-block;min-width:2em;color:var(--faint);font-weight:400}
.say{padding-left:1.1em;color:var(--soft);font-size:14px}
.files{max-height:22em;overflow:auto;border:1px solid var(--edge);border-radius:10px;margin:6px 0 12px}
.files table{border-collapse:collapse;width:100%;font-size:13px}
.files th,.files td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}
.files th{font-weight:400;color:var(--faint);font-size:12px;position:sticky;top:0;background:var(--bg)}
.card.review{border-color:var(--faint)}
dl.card-of{margin:6px 0 0}
details.fold>summary{display:flex;align-items:baseline;gap:12px;cursor:pointer;list-style:none}
details.fold>summary::-webkit-details-marker{display:none}
details.fold>summary h3{margin:0;flex:1}
details.fold[open]>summary{margin-bottom:8px}
details.fold>summary .hint::after{content:"Unfold"}
details.fold[open]>summary .hint::after{content:"Fold"}
.choose{font-size:13px;color:var(--soft);margin:-2px 0 12px;padding-left:2px}
.acting{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:14px 0 0;font-size:14px}
.acting select{max-width:22em}
.picker li{display:flex;gap:10px;align-items:baseline;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line);list-style:none}
.picker ul{padding:0;margin:8px 0;max-height:50vh;overflow:auto}
.picker .path{font:13px ui-monospace,Menlo,monospace;color:var(--identity);overflow-wrap:anywhere;white-space:pre-wrap}
.picker .spaced{color:var(--soft);font-size:12px}`;

/** A fingerprint, shortened on screen, whole on hover. */
export function fp(h: string): string {
  return `<code title="${e(h)}">${e(h.slice(0, 8))}…${e(h.slice(-4))}</code>`;
}

/** A name as the program gives it, without the fingerprint it appends: the fingerprint is shown beside it. */
const bare = (n: string | null | undefined) => (n ?? '').replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '');

/** An ID shown written for people (Identity draft 14, F349), its hexadecimal in the title. */
const grouped = (id: string) => `<span title="${e(id.match(/.{1,4}/g)!.join(' '))}">${e(shownId(id))}</span>`;

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

/**
 * A card that folds (H14, H26, H34): open or closed by default; the person's
 * choice remembered by the program, by `key` (`app.ts`, "toggle").
 */
export function foldCard(id: string, key: string, title: string, body: string, open = true, after = ''): string {
  return `<details class="card fold" id="${e(id)}" data-fold="${e(key)}"${open ? ' open' : ''}><summary><h3>${title}</h3>${after}<span class="small hint"></span></summary>${body}</details>`;
}

export function lines(ls: Line[]): string {
  return `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;
}

/** What was done, inside the status note. */
export function done(d: Done): string {
  return `<strong>${e(d.title)}</strong>${lines(d.lines)}`;
}

/** Text already written out with <U+…> for each invisible control, shown character for character. */
const plain = (text: string) => `<div class="plain">${plainHtml(text)}</div>`;

const copyButton = (id: string) => `<button class="copy" data-action="copy" data-id="${e(shownId(id))}" title="Copies the ID written for people (mid1…), to paste where an identity is asked for">Copy ID</button>`;

// ---------------------------------------------------------------- the frame

export type Tab = 'agents' | 'collectives' | 'publishing' | 'identities' | 'settings';

export function top(tab: Tab | null = null, counts: Partial<Record<Tab, number>> = {}): string {
  const t = (k: Tab, words: string) =>
    `<button class="tab${tab === k ? ' on' : ''}" data-action="tab" data-tab="${k}" aria-pressed="${tab === k}">${words}<span class="count">${counts[k] ? counts[k] : ''}</span></button>`;
  // On the web, no Agents tab (decided by Nobody, allegedly): the agents and their API key stay on the Mac.
  return `<header class="bar"><h1 class="mark">${NAME}</h1>${
    tab ? `<nav class="tabs" aria-label="Edubba">${WEB ? '' : t('agents', 'Agents')}${t('collectives', 'Collectives')}${t('publishing', 'Publishing')}${t('identities', 'Identities')}</nav><span class="grow"></span>${t('settings', 'Settings')}` : `<span class="grow"></span><span class="small">${WEB ? 'for testing only' : 'this machine only'}</span>`
  }</header>
${WEB ? '' : '<p class="testonly">Test identities only, until MOR is frozen. Every key is held in software in this program’s folders: a prototype, never for a real identity.</p>'}`;
}

export function pairing(): string {
  return `${top()}
<h2>Pair this browser</h2>
<p class="small">This page acts for the program running on this Mac, which holds the keys. Open it with the Edubba app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" class="grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<input id="pair-label" type="hidden" value="this browser"><button type="submit">Pair</button></form>
<div id="pair-status"></div>`;
}

export function frame(): string {
  return `<div id="e-top"></div><div id="e-status" role="status" aria-live="polite"></div><div id="e-body"></div>
<dialog id="e-dialog"><div class="inner" id="e-dialog-body"></div></dialog>`;
}

// ---------------------------------------------------------------- the lists on top

function entry(a: { action: string; key: string; id: string; current: boolean; title: string; meta: string; count?: number }): string {
  return `<button class="entry" data-action="${a.action}" data-id="${e(a.id)}" aria-current="${a.current}"><span><span class="name">${e(a.title)}</span> <span class="fp">${e(a.id.slice(0, 8))}…${e(a.id.slice(-4))}</span>${
    a.count ? `<span class="count">${a.count}</span>` : ''
  }</span><span class="meta">${a.meta}</span></button>`;
}

const keyWords = (k: AgentSummary['key']) => (k.found ? `${k.kind === 'own' ? 'its own key' : 'shared key'} …${e(k.last4 ?? '')}` : `${k.kind === 'own' ? 'its own key' : 'shared key'}: none`);

export function agentList(s: State, selected: string | null): string {
  return `<div class="list" role="list" aria-label="Agents">${s.agents
    .map((a) =>
      entry({
        action: 'pick-agent',
        key: 'agent',
        id: a.id,
        current: a.id === selected,
        title: a.name,
        meta: `${a.on ? 'answering' : 'off'} · ${a.callsToday} of ${a.callsPerDay} calls today · ${keyWords(a.key)}`,
        count: a.notified,
      }),
    )
    .join('')}<button class="entry add" data-action="add-agent">+ Add an agent</button></div>`;
}

/** The identities that are no agent: the Identities tab's (decided by Nobody, allegedly: agents have their own tab). */
export const secondary = (s: State) => s.identities.filter((i) => !s.agents.some((a) => a.id === i.id));

export function identityList(s: State, selected: string | null, drafts: DraftView[]): string {
  return `<div class="list" role="list" aria-label="Identities">${secondary(s)
    .map((i) => {
      const waiting = drafts.filter((d) => d.signer === i.id).length;
      const fresh = i.received.filter((x) => x.sorted === 'new').length;
      return entry({
        action: 'pick-identity',
        key: 'identity',
        id: i.id,
        current: i.id === selected,
        title: i.name,
        meta: [i.linked ? 'Claude may draft' : '', waiting ? `${waiting} draft${waiting === 1 ? '' : 's'}` : '', fresh ? `${fresh} new` : ''].filter(Boolean).join(' · ') || '&nbsp;',
        count: waiting + fresh,
      });
    })
    .join('')}<button class="entry add" data-action="pick-identity" data-id="new">${WEB ? '+ Bring an identity' : '+ A new identity'}</button></div>`;
}

export function collectiveList(s: State, selected: string | null): string {
  return `<div class="list" role="list" aria-label="Collectives">${s.collectives
    .map((c) =>
      entry({ action: 'pick-collective', key: 'collective', id: c.id, current: c.id === selected, title: c.name, meta: c.brought ? 'brought here · no key held' : c.real ? `real · ${c.members} members` : `test mode · ${c.members} member${c.members === 1 ? '' : 's'}${c.closed ? ' · ended' : ''}` }),
    )
    .join('')}${s.proposals
    .filter((p) => p.kind === 'founding' && !p.founded)
    .map((p) => entry({ action: 'pick-collective', key: 'proposal', id: `p:${p.act}`, current: selected === `p:${p.act}`, title: p.name, meta: `founding · ${p.standing.signed.length} of ${p.signers.length} signed${p.standing.declined.length ? ` · ${p.standing.declined.length} declined` : ''}` }).replace(/<span class="fp">[^<]*<\/span>/, ''))
    .join('')}${
    s.acting
      ? entry({ action: 'pick-collective', key: 'sign', id: 'sign', current: selected === 'sign', title: `To sign, as ${s.identities.find((i) => i.id === s.acting)?.name ?? 'you'}`, meta: 'proposals from founders, read in plain words', count: 0 }).replace(/<span class="fp">[^<]*<\/span>/, '').replace('data-id="sign"', 'data-id="sign" id="e-to-sign"')
      : ''
  }<button class="entry add" data-action="pick-collective" data-id="real">+ Found a real collective: members on their own devices</button>
<p class="choose">${e(REAL_SAY)}</p>
${
    WEB
      ? ''
      : `<button class="entry add" data-action="pick-collective" data-id="found">+ Found a test collective: everyone held here, for trying alone</button>
<p class="choose">${e(TEST_MODE_SAY)}</p>`
  }<button class="entry add" data-action="pick-collective" data-id="bring">+ Bring an existing collective</button></div>`;
}

/** H33: which of Edubba's identities the Collectives tab acts as, with a switch among them. */
export function actingAs(s: State): string {
  if (!s.identities.length) return '';
  return `<form id="acting-as" class="acting"><label for="acting-select" class="small">Acting as</label><select id="acting-select" name="id">${s.identities
    .map((i) => `<option value="${e(i.id)}"${i.id === s.acting ? ' selected' : ''}>${e(i.name)} (${e(i.id.slice(0, 8))}…)</option>`)
    .join('')}</select><span class="small">The identity that signs proposals here as a member, and founds by default. Test-mode collectives sign with their own members.</span></form>`;
}

/** H33: proposals to sign as the identity acted as, read in plain words, as Dub's Signing tab shows them. */
export function memberSigning(s: State, r: { proposals: MemberProposal[]; problems: string[] } | null): string {
  const me = s.identities.find((i) => i.id === s.acting);
  return `<h2>To sign, as ${e(me?.name ?? 'you')}</h2>
<div class="experimental"><strong>Even more experimental</strong>${e(SIGNING_LABEL.slice('Even more experimental'.length).replace('than Dub itself', 'than Edubba itself'))}</div>
<p class="small">Proposals sent to ${e(me?.name ?? 'this identity')} by a collective’s founder, read in plain words from the exact act each names. Signing is an act of yours, public; a share of a collective’s chain key is shown here once, then kept nowhere. Edubba looks for new ones by itself while this is open.</p>
<div class="row"><button data-action="member-look">Look for proposals and shares now</button></div>
<div id="e-signing">${
    r
      ? (r.proposals.length ? r.proposals.map(dubProposal).join('') : '<p class="empty small">No proposal to sign. When a founder asks this identity to sign, it comes here.</p>') + r.problems.map((x) => `<p class="small">${e(x)}</p>`).join('')
      : '<p class="small">Reading its inbox…</p>'
  }</div>`;
}

/** A member's share, shown once here (H33), as Dub shows it. */
export const memberShare = (r: ShareShown) => dubShare({ ...r, say: r.say.map((x) => x.replace(/\bDub\b/g, 'Edubba')) });

/** The folder picker (H31): the Mac's folders, browsed by the program; names shown as they are, a space at the end said. */
export function folderPicker(l: Listing, target: string): string {
  return `<button class="close" data-action="dialog-close">Close</button>
<h2>Choose a folder</h2>
<div class="picker" data-target="${e(target)}">
<div class="row">${l.places.map((p) => `<button class="quiet" data-action="folder-open" data-path="${e(p.path)}">${e(p.name)}</button>`).join('')}</div>
<p class="path" id="e-picker-path">${e(l.path)}</p>
${l.problem ? note('error', e(l.problem)) : ''}
<div class="row">${l.parent ? `<button data-action="folder-open" data-path="${e(l.parent)}">↑ Up</button>` : ''}<span class="grow"></span><button class="primary" data-action="folder-use" data-path="${e(l.path)}"${l.problem ? ' disabled' : ''}>Use this folder</button></div>
<ul>${
    l.folders
      .map(
        (f) =>
          `<li><button class="quiet" data-action="folder-open" data-path="${e(f.path)}">${f.spaced ? `“${e(f.name)}”` : e(f.name)}</button><span>${f.spaced ? `<span class="spaced">${e(f.spaced)}</span> ` : ''}${f.git ? '<span class="tag">git</span>' : ''}</span></li>`,
      )
      .join('') || '<li class="small">No folder inside.</li>'
  }</ul>
${l.hidden ? `<p class="small">${l.hidden} hidden folder${l.hidden === 1 ? '' : 's'} (a name starting with a dot), not listed.</p>` : ''}
</div>`;
}

// ---------------------------------------------------------------- agents

/**
 * The first-use window, and "+ Add an agent" (F333): the API key, the
 * agent's name, its owner; then its terms, shown before they are signed.
 */
export function agentWindow(s: State, first: boolean): string {
  const owners = s.identities.filter((i) => !s.agents.some((a) => a.id === i.id));
  const guess = owners.find((i) => /nobody/i.test(i.name))?.id ?? owners[0]?.id;
  const noPlaces = !s.settings.homes.length;
  const key = s.sharedKey.found
    ? `<p class="small">A shared key is in place (…${e(s.sharedKey.last4 ?? '')}). Leave this empty to keep using it.</p>`
    : '<p class="small">No key is in place yet. One is needed before the agent can answer.</p>';
  return `<section class="card" id="e-window"><h2>${first ? 'Plug in your first agent' : 'Add an agent'}</h2>
<p class="small">${first ? 'This window shows once. ' : ''}An agent is an identity held here that answers on MOR with Claude, under terms it signs. You choose what it answers, never what it says.</p>
<form id="agent-add">
${
  noPlaces
    ? `<label>Homes, one address per line: where its identity lives</label><textarea name="homes" required placeholder="https://"></textarea>
<label>Relays, one per line: where its acts are published and its inbox is (empty: the homes)</label><textarea name="relays"></textarea>`
    : ''
}
<label>The Anthropic API key</label><input name="key" type="password" autocomplete="off" spellcheck="false" placeholder="The key, as the Anthropic Console gives it">
${key}
<label class="check"><input type="checkbox" name="own"> This key is for this agent alone (otherwise all agents share it)</label>
<p class="small">${e(KEY_SAY)}</p>
<label>Its identity</label>
<select name="agent"><option value="" selected>A new identity, made now</option>${owners.map((i) => `<option value="${e(i.id)}">${e(i.name)}, held here</option>`).join('')}</select>
<label>Its name</label><input name="name" type="text" placeholder="A display name (for one held here: its name here, if empty)">
<p class="small">Published as its display name (the naming cMIP), beside its fingerprint, never instead of it. Anyone may take the same name.</p>
<label>Its owner: you, whose prompts, picks and nudges it follows</label>
<select name="owner">${owners.map((i) => `<option value="${e(i.id)}"${i.id === guess ? ' selected' : ''}>${e(i.name)}</option>`).join('')}<option value=""${owners.length ? '' : ' selected'}>A new identity of mine…</option></select>
<input name="ownerName" type="text" placeholder="Your name, for a new identity of yours (kept on this Mac)">
<div class="row"><button type="submit" class="primary">Make its identity</button>${first ? '' : '<button type="button" data-action="add-cancel">Cancel</button>'}</div>
</form>
<div id="e-terms"></div></section>`;
}

/** Its terms, as they will be signed, with the one button that signs exactly those. */
export function termsShown(agent: string, owner: string, own: boolean, t: { lines: string[]; digest: string }): string {
  return `<div class="card"><h3>Its agency terms, to be signed</h3>${lines(t.lines.map((text) => ({ text })))}
<p class="digest">Digest of exactly what is signed: ${e(t.digest.match(/.{1,4}/g)!.join(' '))}</p>
<div class="row"><button class="primary" data-action="machine-publish" data-agent="${e(agent)}" data-owner="${e(owner)}" data-own="${own}" data-digest="${e(t.digest)}">Sign and publish these terms</button></div></div>`;
}

function notifiedItem(x: MachineState['notified'][number]): string {
  return `<div class="item" data-notified="${e(x.key)}"><div class="who"><span class="name">${e(bare(x.fromName) || 'an unknown sender')}</span>${x.act ? fp(x.act) : ''}<span class="tag${x.private ? ' sealed' : ''}">${x.private ? 'private message' : x.kind === 'reply' ? 'public reply' : 'public message'}</span>${
    x.standing === 'valid' ? '<span class="tag">verified</span>' : `<span class="tag bad">${e(x.standing)}</span>`
  }</div>
${x.text !== undefined ? `<div class="text" dir="auto">${e(x.text)}</div>` : ''}
<div class="row"><label class="check"><input type="checkbox" name="pick-select" value="${e(x.key)}"> Select</label><button data-action="machine-pick" data-key="${e(x.key)}">Pick: it answers now</button></div></div>`;
}

/** Several picks, shown together before anything is signed, with the one button that signs exactly those. */
export function picksShown(keys: string[], t: { lines: string[]; digest: string }): string {
  return `<div class="card"><h3>${keys.length === 1 ? 'One pick' : `${keys.length} picks`}, to be signed together</h3>${lines(t.lines.map((text) => ({ text })))}
<p class="digest">Digest of exactly what is signed: ${e(t.digest.match(/.{1,4}/g)!.join(' '))}</p>
<div class="row"><button class="primary" data-action="machine-pick-many" data-keys="${e(JSON.stringify(keys))}" data-digest="${e(t.digest)}">Sign these picks; it answers each</button><button data-action="machine-picks-cancel">Cancel</button></div></div>`;
}

/** The lower half: the selected agent's terms, queue, nudge, cap and key, history, and the prompt box at the bottom. */
export function agentDetails(s: State, a: AgentDetails, drafts: DraftView[] = []): string {
  const mine = drafts.filter((d) => d.signer === a.agent);
  const name = bare(a.agentName);
  const owner = bare(a.ownerName);
  const switchB = (value: boolean, words: string) => `<button type="button" data-action="machine-on" data-on="${value}" aria-pressed="${a.on === value}">${words}</button>`;
  const keyLine = a.key.found
    ? `${a.key.kind === 'own' ? 'Its own key' : 'The shared key'}, …${e(a.key.last4 ?? '')}${a.key.warning ? `. ${e(a.key.warning)}` : ''}`
    : e(a.key.from);
  return `<div class="head"><h2>${e(name)}</h2><span class="id">${grouped(a.agent!)}</span>${copyButton(a.agent!)}</div>
<p class="small">${a.named ? `Display name “${e(a.named.name)}” published (${fp(a.named.act)}).` : 'No display name published from here. <button class="copy" data-action="agent-name">Publish its display name</button>'} Owner: ${e(owner)} ${a.owner ? fp(a.owner) : ''}.</p>
<div class="row"><button data-action="agent-view">MOR as seen by this agent →</button></div>
<div class="here" id="e-agent-here" role="status" aria-live="polite"></div>
${a.stopped ? note('error', `<strong>Stopped:</strong> ${e(a.stopped)}`) : ''}

${foldCard('e-terms-card', 'agent-terms', `Its terms${a.terms ? ` <span class="small">act ${fp(a.terms.act)}</span>` : ''}`, `${a.terms ? lines(a.terms.words.map((text) => ({ text }))) : '<p class="small">Not signed.</p>'}
<div class="switch" role="group" aria-label="Answering"><span>Answering</span> ${switchB(true, 'On')}${switchB(false, 'Off')}</div>
<p class="small">${a.on ? `On: ${e(owner || 'its owner')}’s own messages and public acts to it are answered at once; others wait in its queue until you pick them.` : 'Off: nothing is answered and no call is made.'}</p>`)}

${foldCard('e-queue', 'agent-queue', `Its queue: acts to pick from (${a.notified.length})`, `
<p class="small">Other people’s interactions with it. Nothing is drafted for these until you pick one: each pick is signed and published, and it answers at once, naming your pick. What it says is its own.</p>
${a.notified.map(notifiedItem).join('') || '<p class="empty small">Nothing waits.</p>'}
${a.notified.length > 1 ? '<div class="row"><button data-action="machine-picks">Pick the selected: show them together first</button></div>' : ''}
<div id="e-picks-shown"></div>
${
  a.waiting.length
    ? `<h4>Picked, waiting for the cap (${a.waiting.length})</h4>${a.waiting
        .map((x) => `<div class="item"><span class="small">${x.private ? 'A private message' : 'A public act'} from ${e(x.fromName ?? 'an unknown sender')}, act ${fp(x.act)}, picked by ${fp(x.pick)}</span></div>`)
        .join('')}`
    : ''
}
${
  a.notAnswered.length
    ? `<h4>Not answered (${a.notAnswered.length})</h4>${a.notAnswered
        .map((x) => `<div class="item"><span class="small">${e(x.kind === 'owner' ? 'Your act' : x.kind === 'pick' ? 'A pick' : 'A nudge')} ${fp(x.act)}: ${e(x.note)}</span> <button data-action="machine-retry" data-act="${e(x.act)}">Try again</button></div>`)
        .join('')}`
    : ''
}
<div class="row"><button data-action="machine-look">Look now for what it received</button></div>`)}

${foldCard('e-nudge', 'agent-nudge', 'Nudge it', `
<form id="machine-nudge"><p class="small">A public act of yours naming it, with a number of actions: it may then answer anyone, comment on its feed, post, or write to you, up to that number, each naming your nudge. It chooses.</p>
<div class="row"><label>Actions <input name="count" type="number" min="1" max="20" value="1" required class="narrow"></label></div>
<label>Your words with the nudge (optional, public)</label><textarea name="context"></textarea>
<div class="row"><button type="submit">Nudge</button></div></form>`)}

${foldCard('e-cap', 'agent-cap', 'Its cap and its key', `
<form id="machine-cap" class="row"><label>Calls to Claude a day <input name="callsPerDay" type="number" min="0" max="1000" value="${a.callsPerDay}" class="narrow"></label>
<label>Each answer at most <input name="maxChars" type="number" min="50" max="20000" value="${a.maxChars}" class="narrow"> characters</label><button type="submit">Save the cap</button></form>
<p class="small">Calls today: ${a.callsToday} of ${a.callsPerDay}.</p>
<p class="small">${keyLine}. The key is never shown here beyond its last four characters.</p>
<form id="agent-key"><div class="switch" role="radiogroup" aria-label="Its key"><label class="check"><input type="radio" name="own" value="shared"${a.key.kind === 'own' ? '' : ' checked'}> The shared key</label><label class="check"><input type="radio" name="own" value="own"${a.key.kind === 'own' ? ' checked' : ''}> A key of its own</label></div>
<input name="key" type="password" autocomplete="off" spellcheck="false" placeholder="Its own key, if it has one">
<div class="row"><button type="submit">Save its key</button></div></form>`, false)}

${foldCard('e-agent-drafts', 'agent-drafts', `Drafts from Claude for it (${mine.length})`, `<div class="row"><button class="quiet" data-action="drafts">Look for new drafts now</button><span class="small" id="drafts-watch" role="status" aria-live="polite">${WATCHING}</span></div>
<div id="drafts">${mine.map(draft).join('') || '<p class="empty small">No draft is waiting for it.</p>'}</div>`)}

<div id="e-grants"><p class="small">Reading its grants…</p></div>
<div id="e-memory"><p class="small">Reading its notes from its homes…</p></div>

${foldCard('e-agent-history', 'agent-history', `What it did (${a.history.length})`, history(a.history), false)}

<section class="card" id="e-prompt"><h3>Prompt it</h3>
<div class="chat">${
    a.conversation
      .map((m) => `<div class="msg ${m.from}"><div class="who">${m.from === 'owner' ? e(owner || 'you') : e(name)}${m.act ? ` ${fp(m.act)}` : ''}<span class="sealed"> sealed</span></div><div class="text" dir="auto">${e(m.text)}</div>${m.note ? `<div class="small">${e(m.note)}</div>` : ''}</div>`)
      .join('') || '<p class="empty small">Nothing yet.</p>'
  }</div>
<form id="agent-prompt"><textarea name="text" placeholder="Write to ${e(name)}…" required></textarea>
<div class="row"><button type="submit" class="primary">Send</button></div></form>
<p class="small">${e(PROMPT_SAY)}</p></section>`;
}

/** "MOR as seen by this agent" (F333): a view, not a tab, with a way back. */
export function agentView(name: string, v: AgentView): string {
  return `<div class="row"><button data-action="agent-back">← Back to ${e(name)}</button></div>
<h2>MOR as seen by ${e(name)}</h2>
<p class="small">What it reads: what is sent to it, and its feed (its own posts and those it follows). Under a nudge, Claude is given its feed too.</p>
<section class="card"><h3>Those it follows (${v.follows.length})</h3>
<p class="small">Kept here, private (the people cMIP): never published.</p>
${v.follows.length ? `<ul class="plain">${v.follows.map((f) => `<li>${e(f.name ?? '')} ${fp(f.id)} <button class="quiet" data-action="agent-unfollow" data-id="${e(f.id)}">Unfollow</button></li>`).join('')}</ul>` : '<p class="empty small">Nobody yet.</p>'}
<form id="agent-follow" class="row"><input name="who" type="text" class="grow" placeholder="An identity's ID" required><input name="name" type="text" placeholder="A name for it (kept here)" class="pet"><button type="submit">Follow for it</button></form></section>
<h3>Its feed</h3>
${v.problems.map((p) => `<p class="small">${e(p)}</p>`).join('')}
${
  v.feed
    .map(
      (p) => `<div class="post"><div class="who"><span class="name">${e(bare(p.signerName.replace(/ \(itself\)$/, '')))}${p.signerName.endsWith('(itself)') ? ' <span class="you">itself</span>' : ''}</span>${fp(p.signer)}${p.standing === 'valid' ? '' : `<span class="flag bad">${e(p.standing)}</span>`}</div><div class="text" dir="auto">${e(p.text)}</div>${p.pictures
        .map((src) => `<figure><img alt="A picture of the post" src="${e(src)}"></figure>`)
        .join('')}</div>`,
    )
    .join('') || '<p class="empty small">Nothing yet.</p>'
}
${v.feed.length ? '<p class="small">In signed order: MOR has no clock, so this is not a time.</p>' : ''}
<h3>Its inbox (${v.inbox.length})</h3>
${
  v.inbox
    .map(
      (x) => `<div class="msg"><div class="who"><span class="name">${e(bare(x.fromName) || 'an unknown sender')}</span><span class="tag${x.private ? ' sealed' : ''}">${x.private ? 'sealed' : 'public'}</span><span class="tag">${e(x.kind)}</span>${
        x.standing === 'valid' ? '' : `<span class="flag bad">${e(x.standing)}</span>`
      }</div>${x.text !== undefined ? `<div class="text" dir="auto">${e(x.text)}</div>` : ''}</div>`,
    )
    .join('') || '<p class="empty small">Nothing received yet.</p>'
}`;
}

// ---------------------------------------------------------------- identities

/** One draft, read in plain words from its bytes, with what the owner can do. */
export function draft(d: DraftView): string {
  const blocking = d.blocking.length ? note('error', `<strong>This cannot be approved:</strong><ul>${d.blocking.map((b) => `<li>${e(b)}</li>`).join('')}</ul>`) : '';
  const claude =
    d.note !== null
      ? `<h4>Claude's note to you</h4><p class="small">Claude's words about the draft. They are not signed and say nothing about what the draft does: the reading below does.</p><div class="claude">${e(d.note)}</div>`
      : '';
  const rework = d.reworks
    ? `<h4>A rework</h4><p class="small">It replaces draft <code>${e(d.reworks.digest.slice(0, 12))}</code>, which you sent back with this note:</p><div class="yours">${e(d.reworks.note)}</div>${
        d.reworks.text !== null ? `<details><summary>The text of the draft it replaces</summary>${plain(d.reworks.text)}</details>` : ''
      }`
    : '';
  const picture = d.picture
    ? `<h4>The picture, exactly as it will be published (${d.picture.width}×${d.picture.height})</h4><div class="picture"><img alt="The picture to be published" src="${e(d.picture.src)}"></div>`
    : '';
  const texts = d.plain.map((p) => `<h4>${e(p.heading)}</h4><p class="small">As plain text, character for character; any invisible control is shown as &lt;U+…&gt;.</p>${plain(p.text)}`).join('');
  return `<div class="card draft" data-draft="${e(d.digest)}">
<h3>${e(d.title)}</h3>
<p class="small">For <strong>${e(d.signerName || 'an unreadable draft')}</strong>, prepared by Claude.</p>
${d.summary.map((s) => `<p>${e(s)}</p>`).join('')}
${blocking}
${rework}
${d.sections.map((s) => `<h4>${e(s.heading)}</h4>${lines(s.lines)}`).join('')}
${texts}
${picture}
${claude}
<p class="digest">Draft digest, to compare with the one Claude showed: ${e(d.digest.match(/.{1,4}/g)!.join(' '))}</p>
<div class="row"><button class="primary" data-action="approve" data-digest="${e(d.digest)}" ${d.blocking.length ? 'disabled' : ''}>Approve and sign</button>
<button data-action="decline" data-digest="${e(d.digest)}">Decline</button></div>
<form class="send-back" data-digest="${e(d.digest)}"><label>Send it back to Claude, with a note saying what to change</label><textarea name="note" required></textarea>
<div class="row"><button type="submit">Send back</button></div></form>
</div>`;
}

const KIND: Record<Item['kind'], string> = {
  message: 'A message',
  reply: 'A reply',
  acknowledgement: 'An acknowledgement',
  payment: 'A payment',
  split: 'A split of money received',
  'key delivery': 'A key delivery',
  nudge: 'A nudge',
  pick: 'A pick',
  terms: 'Agency terms',
  other: 'Something else',
};

const PILES: [Sorted, string][] = [
  ['new', 'New, not sorted yet'],
  ['to answer', 'To answer'],
  ['answered', 'Answered'],
  ['ignored', 'Ignored'],
];

function item(identity: string, x: Item): string {
  const facts: string[] = [];
  facts.push(x.from ? `From ${e(x.fromName ?? x.from)}${x.private ? ', privately' : ', publicly addressed to this identity'}.` : 'From an unknown sender.');
  facts.push(x.standing === 'valid' ? '<span class="tag">verified</span>' : `<span class="tag bad">${e(x.standing)}</span>`);
  if (x.answers.length) facts.push(`It answers this identity's act${x.answers.length > 1 ? 's' : ''} ${x.answers.map(fp).join(', ')}.`);
  if (x.acknowledges.length)
    facts.push(
      x.witness
        ? `A witness act: its sender relies on this identity's act${x.acknowledges.length > 1 ? 's' : ''} ${x.acknowledges.map(fp).join(', ')}, and keeps ${x.acknowledges.length > 1 ? 'them' : 'it'} visible as disputed even if this identity later disowns ${x.acknowledges.length > 1 ? 'them' : 'it'}.`
        : `It acknowledges receiving this identity's act${x.acknowledges.length > 1 ? 's' : ''} ${x.acknowledges.map(fp).join(', ')}.`,
    );
  if (x.refs.length) facts.push(`It refers to ${x.refs.map(fp).join(', ')}.`);
  if (x.act) facts.push(`Act ${fp(x.act)}.`);
  const sorts = PILES.filter(([s]) => s !== 'new')
    .map(([s, w]) => `<button data-action="sort" data-identity="${e(identity)}" data-key="${e(x.key)}" data-sorted="${e(s)}" aria-pressed="${x.sorted === s}">${e(w)}</button>`)
    .join('');
  return `<div class="item" data-item="${e(x.key)}" data-kind="${e(x.kind)}"><strong>${e(KIND[x.kind])}</strong> <span class="small">${facts.join(' ')}</span>
${x.alarm ? note('error', e(x.alarm)) : ''}${x.notice ? note('', e(x.notice)) : ''}
${x.problem ? note('warn', e(x.problem)) : ''}
${(x.assessment ?? []).map((s) => `<h4>${e(s.heading)}</h4>${lines(s.lines)}`).join('')}
${x.text !== undefined ? plain(x.text) : ''}
<div class="sorts">${sorts}${x.act && x.from && x.standing === 'valid' ? `<button data-action="witness" data-identity="${e(identity)}" data-act="${e(x.act)}">Rely on this act…</button>` : ''}</div></div>`;
}

/** The question, and its answer as a clear on or off. */
function linkSwitch(id: string, on: boolean): string {
  const b = (value: boolean, words: string) => `<button type="button" data-action="link" data-identity="${e(id)}" data-on="${value}" aria-pressed="${on === value}">${words}</button>`;
  return `<div class="switch" role="group" aria-label="Claude may prepare drafts for this identity"><span>Claude may prepare drafts for this identity</span> ${b(true, 'On')}${b(false, 'Off')}</div>
<p class="small">${on ? 'On: Claude can prepare posts, pictures, withdrawals and messages for it. Nothing is signed until you approve it here.' : 'Off: Claude cannot prepare anything for it, and drafts for it are refused.'}</p>`;
}

/** The lower half of the Identities tab: the selected identity, its drafts from Claude and what it received. */
export function identityDetails(s: State, id: string, drafts: DraftView[]): string {
  const i = s.identities.find((x) => x.id === id);
  if (!i) return '';
  const mine = drafts.filter((d) => d.signer === id);
  const piles = PILES.map(([k, w]) => {
    const xs = i.received.filter((x) => x.sorted === k);
    return `<div data-pile="${e(k)}"><h4>${e(w)} (${xs.length})</h4>${xs.length ? `<div class="feed">${xs.map((x) => item(i.id, x)).join('')}</div>` : '<p class="small">None.</p>'}</div>`;
  }).join('');
  const answered = s.history.filter((h) => h.signer === id);
  return `<div class="head"><h2>${e(i.name)}</h2><span class="id">${grouped(i.id)}</span>${copyButton(i.id)}<span class="tag">${i.kind === 'brought' ? 'brought here' : 'made here'}</span></div>
<div class="card" data-identity="${e(i.id)}">
<dl class="facts"><dt>This desk's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? '')}</code>` : ''}</dd></dl>
${WEB ? `<p class="small">${e(WEB_KEPT_SAY)}</p>` : linkSwitch(i.id, i.linked)}
<div class="here" data-here="${e(i.id)}" role="status" aria-live="polite"></div></div>
${foldCard('e-record-fold', 'identity-record', 'Its record', '<div id="e-record"><p class="small">Reading it from its homes and relays…</p></div>')}
${foldCard('e-rely', 'identity-rely', 'Rely on an act', `<p class="small">${e(WITNESS_EXPLANATION)}</p>
<form id="rely" class="row"><input name="act" type="text" class="grow" placeholder="The act’s id: 64 hexadecimal characters" autocomplete="off" spellcheck="false" required><button type="submit">Read it back</button></form>
<div id="e-rely-shown"></div>`, false)}
${releaseCard(i)}
${
  // On the web: no money drafts (Damgar's web client prepares none from here either) and no drafts from Claude.
  WEB
    ? ''
    : `${payCard(i.id)}
${foldCard('e-drafts-fold', 'identity-drafts', `Drafts from Claude (${mine.length})`, `<div class="row"><button class="quiet" data-action="drafts">Look for new drafts now</button><span class="small" id="drafts-watch" role="status" aria-live="polite">${WATCHING}</span></div>
<div id="drafts">${mine.map(draft).join('') || '<p class="empty small">No draft is waiting for it.</p>'}</div>`)}`
}
${foldCard('e-received', 'identity-received', 'What it received', `<div class="row"><button data-action="refresh" data-identity="${e(i.id)}">Look for what it received</button></div>
<div class="here" data-here-received="${e(i.id)}" role="status" aria-live="polite"></div>
${piles}`)}
${foldCard('e-answered', 'identity-answered', `What you answered for it (${answered.length})`, history(answered), false)}`;
}

type Held = State['identities'][number];

/** The record, in plain words (F333: "an identity setup page of sorts"): nothing here is signed. */
export function record(r: IdentityRecord): string {
  const card = (l: IdentityRecord['lines'][number]) =>
    l.card
      ? `<dl class="facts card-of"><dt>Latest act</dt><dd><code title="${e(l.card.act)}">${e(shownAct(l.card.act))}</code></dd><dt>Position</dt><dd>${l.card.position}</dd><dt>Summary</dt><dd><code>${e(l.card.summary)}</code></dd></dl>`
      : '';
  return `<p class="small">As its homes and relays show it now. Nothing here is signed.</p>
${r.problems.map((p) => note('warn', e(p))).join('')}
${r.spent ? `<form id="identity-renew" data-identity="${e(r.id)}" class="card">${note('error', e(RENEW_SAY))}<label>The new signing key’s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="row"><button type="submit" class="primary">Take the new words</button></div></form>` : ''}
${r.sections.map((x) => `<h4>${e(x.heading)}</h4>${lines(x.lines)}`).join('')}
<h4>Its lines of acts (${r.lines.length})</h4>
<p class="small">A change of its signing key (in Kišib, with the chain key) must keep every line, or that line’s acts become void (Identity rule 35). Where Kišib cannot read a line, give it the latest act, position and summary shown here.</p>
${r.lines.map((l) => `<div class="item" data-line="${e(l.card?.act ?? '')}"><span class="small">${e(l.words)}</span>${card(l)}</div>`).join('') || '<p class="empty small">No line of acts found yet.</p>'}
<div class="row"><button class="quiet" data-action="record" data-identity="${e(r.id)}">Read it again</button></div>`;
}

/** An act read back before a witness act is signed, with the typed confirmation (as the genesis client asks it). */
export function relyShown(identity: string, r: ActRead): string {
  const blocked = r.blocking.length ? note('error', `<strong>It cannot be relied on from here:</strong><ul>${r.blocking.map((b) => `<li>${e(b)}</li>`).join('')}</ul>`) : '';
  return `<div class="card review"><h4>The act ${fp(r.act)}</h4>${lines(r.lines)}
${r.text !== null ? `<p class="small">Its words, as plain text, character for character:</p>${plain(r.text)}` : ''}
<h4>What signing does</h4><p>${e(r.explanation)}</p>
${blocked}
${
  r.blocking.length
    ? '<div class="row"><button data-action="rely-cancel">Close</button></div>'
    : `<form id="rely-sign" data-identity="${e(identity)}" data-act="${e(r.act)}"><label>Type RELY to sign the witness act</label><div class="row"><input name="typed" type="text" class="narrow" autocomplete="off" spellcheck="false"><button type="submit" class="primary">Sign the witness act</button><button type="button" data-action="rely-cancel">Cancel</button></div></form>`
}</div>`;
}

/** Said wherever Edubba prepares money (F338): kept equal to `MONEY_SAY` in `../money.ts`. */
export const MONEY_SAY = 'Prepared here, not signed here: Edubba seals a draft to the identity at its homes, and Damgar, holding the same identity, reads it to you and signs it or not. Edubba signs no money act and holds no wallet.';

/** A payment form, prepared for Damgar: to whom, how much, in which unit (filled by the page from `money units`), what for. */
function payForm(id: string, identity: string, to = ''): string {
  return `<form id="${e(id)}" data-identity="${e(identity)}" class="money"><label>To: an identity’s ID</label><input name="to" type="text" value="${e(to)}" autocomplete="off" spellcheck="false" required>
<div class="row"><label>Amount, in the unit’s smallest part <input name="value" type="text" inputmode="numeric" class="narrow" required></label><label>Unit <select name="unit" data-units></select></label></div>
<label>What for (optional)</label><input name="whatFor" type="text">
<p class="small">${e(MONEY_SAY)}</p><div class="row"><button type="submit">Prepare it for Damgar</button></div></form>`;
}

/** F338: a payment from this identity, prepared here and signed in Damgar. */
export function payCard(identity: string): string {
  return foldCard('e-pay', 'identity-pay', 'Pay someone (prepared for Damgar)', payForm('pay-someone', identity), false);
}

/** F338: money for a real collective, from the identity acting here: paying a member; Bitcoin anchoring of one of its acts, an option only. Never its releases (Ummia's, F339). */
export function realMoney(s: State, id: string, members: string[]): string {
  const acting = s.acting ?? '';
  return `${foldCard('e-real-pay', 'collective-pay', 'Pay a member (prepared for Damgar)', `<p class="small">From ${e(s.identities.find((i) => i.id === acting)?.name ?? 'the identity acting here')}: your own payment, never the collective’s (collective payments are round 2).</p>
<div class="row">${members.filter((m) => m !== acting).map((m) => `<button type="button" data-action="pay-member" data-member="${e(m)}">${person(s, m)}</button>`).join('')}</div>${payForm('pay-member', acting)}`, false)}
${foldCard('e-real-anchor', 'collective-anchor', 'Anchor one of its acts on Bitcoin (optional)', `<ul class="say">${ANCHOR_SAY.map((t) => `<li>${e(t)}</li>`).join('')}</ul>
<form id="anchor-offers" data-collective="${e(id)}"><label>The act</label><select name="act" data-anchorable="${e(id)}"></select>
<label>The anchoring service: its ID</label><div class="row"><input name="service" type="text" class="grow" autocomplete="off" spellcheck="false" required><button type="submit">Read its offer</button></div></form>
<div id="e-anchor-offer"></div><h4>Anchors asked</h4><div id="e-anchors"><p class="small">Reading…</p></div>`, false)}`;
}

/** Said where anchoring is offered: kept equal to `ANCHOR_SAY` in `../money.ts`. */
export const ANCHOR_SAY = [
  'Optional. An anchor puts this act’s fingerprint on the Bitcoin chain through a pooled anchoring service, so anyone can later see it existed by a given block.',
  'The service is sent a leaf: the act’s id mixed with a random secret (the blind) Edubba keeps. It never learns the act. A lost blind loses the anchor’s use.',
  'You pay the service’s price in Damgar, following its standing offer; its ticket promises a batch and a deadline (a block). Left out of its batch, or late, the price is owed back under its offer.',
  'Round 1 runs on regtest, with a test anchoring service of ours, labelled: its coins are worth nothing.',
];

/** A service's standing offers, each tier a choice, then the button preparing the payment for Damgar. */
export function anchorOffers(collective: string, act: string, service: string, offers: { act: string; tiers: { price: number; blocks: number }[]; unit: string; network: number | null; words: string | null }[], units: { hash: string; label: string }[]): string {
  if (!offers.length) return note('warn', 'No standing offer under the anchoring cMIP was found for that identity.');
  const unit = (h: string) => units.find((u) => u.hash === h)?.label ?? `unit ${h.slice(0, 8)}…`;
  return offers
    .map(
      (o) => `<form class="card anchor-ask" data-collective="${e(collective)}" data-act="${e(act)}" data-service="${e(service)}" data-offer="${e(o.act)}"><h4>Its standing offer ${fp(o.act)}</h4>${o.words ? `<p class="small">${e(o.words)}</p>` : ''}
${o.tiers.map((t, i) => `<label class="check"><input type="radio" name="tier" value="${i}"${i === 0 ? ' checked' : ''}> Within ${t.blocks} blocks, for ${t.price} ${e(unit(o.unit))}</label>`).join('')}
<div class="row"><button type="submit" class="primary">Prepare the payment for Damgar</button></div></form>`,
    )
    .join('');
}

export function anchors(xs: { act: string; label: string; service: string; tier: number; state: string; lines: Line[] }[]): string {
  return xs.length ? xs.map((x) => `<div class="item"><span class="tag">${e(x.state)}</span> ${e(x.label)} ${fp(x.act)} <span class="small">by ${fp(x.service)}, tier ${x.tier}</span>${lines(x.lines)}</div>`).join('') : '<p class="empty small">None asked yet.</p>';
}

/** H16, moved (F339): releases under one's own name are made in Ummia, the developers' app; the releases made here before are listed. */
export const RELEASES_MOVED =
  'Releases under one’s own name, and their anchoring on Bitcoin, are made in Ummia, the developers’ app, since 17 October 2026 (F339): bring this identity into Ummia by its signing key’s words. A collective’s releases stay here, in the Collectives tab, until Ummia’s second round.';

export function releaseCard(i: Held): string {
  return foldCard('e-release', 'identity-release', 'Releases under its own name: in Ummia', `<p class="small">${e(RELEASES_MOVED)}</p>
${
  i.releases.length
    ? `<details><summary>Its releases made here before (${i.releases.length})</summary><ul class="plain">${i.releases.map((r) => `<li>${e(r.name)} ${e(r.version)} ${fp(r.id)} <span class="small">from ${e(r.folder)}</span></li>`).join('')}</ul></details>`
    : ''
}`);
}

/** Drafts naming an identity this desk does not hold: shown so nothing waits unseen. */
export function strayDrafts(s: State, drafts: DraftView[]): string {
  const stray = drafts.filter((d) => !s.identities.some((i) => i.id === d.signer));
  return stray.length ? `<h3>Drafts for no identity held here (${stray.length})</h3>${stray.map(draft).join('')}` : '';
}

export function newIdentity(): string {
  if (WEB) return bringIdentityWeb();
  return `<h2>A new identity, or one you have</h2><section class="card"><h3>Make a new identity</h3><form id="new-identity"><label>Its name, kept on this Mac</label><input name="name" type="text" placeholder="A name" required>
<label class="check"><input name="linked" type="checkbox"> Claude may prepare drafts for it</label>
<div class="row"><button type="submit" class="primary">Make it</button></div></form>
<p class="small">A test identity is born at the homes named in Settings, with its acts and its inbox at the relays, and the encryption key its signing key's words carry. If Claude may prepare drafts for it, its name and fingerprint are written to the drafts folder, so Claude can name it.</p></section>
<section class="card"><h3>Bring an identity you have</h3>
<p class="small">Its ID and its signing key’s words, as Dub shows them (“Show the signing key’s words”). Edubba reads it from its homes and keeps it only if the words give its current signing key. Nothing is signed or published by bringing it.</p>
<form id="bring-identity"><label>Its name, kept on this Mac</label><input name="name" type="text" placeholder="A name" required>
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its signing key’s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes; empty: the homes and relays in Settings)</label><input name="address" type="text" placeholder="https://">
<label class="check"><input name="linked" type="checkbox"> Claude may prepare drafts for it</label>
<p class="small">Never type the chain key’s words here: they belong to Kišib, the app where a change of keys is done, and to paper. Whoever holds the signing key’s words can sign as this identity and read its private messages: Edubba keeps them in its folder, as every key here.</p>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>`;
}

/** On the web, the one door: bring an identity you have (no identity is made here, as in Damgar's and Ummia's web clients). */
function bringIdentityWeb(): string {
  return `<h2>Bring an identity you have</h2><section class="card">
<p class="small">Its ID and its signing key’s words, as Dub shows them (“Show the signing key’s words”). Edubba reads it from its homes and keeps it only if the words give its current signing key. Nothing is signed or published by bringing it. A new identity is made in Dub, or in Edubba on a computer.</p>
<form id="bring-identity"><label>Its name, kept in this browser</label><input name="name" type="text" placeholder="A name" required>
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" placeholder="mid1…" required>
<label>Its signing key’s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes; empty: the homes and relays in Settings)</label><input name="address" type="text" placeholder="https://">
<p class="small">Never type the chain key’s words here: they belong to Kišib, the app where a change of keys is done, and to paper. ${e(WEB_KEPT_SAY)}</p>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>`;
}

export function settings(s: State): string {
  if (WEB) return settingsWeb(s);
  const via = Object.entries(s.settings.via).map(([a, b]) => `${a}=${b}`).join('\n');
  return `<form id="desk-settings">
<label>Homes, one address per line: where new identities live</label><textarea name="homes">${e(s.settings.homes.map((h) => h.hint).join('\n'))}</textarea>
<label>Relays, one per line: where acts are published, and the inbox of new identities (empty: the homes)</label><textarea name="relays">${e(s.settings.relays.join('\n'))}</textarea>
<label>Other ways to reach an address, one per line, as address=where (for example the onion home at its local port)</label><textarea name="via">${e(via)}</textarea>
<label>The drafts folder, shared with the Claude connector</label><input name="drafts" type="text" value="${e(s.settings.drafts)}">
<div class="row"><button type="submit">Save settings</button></div>
<div class="here" id="settings-status" role="status" aria-live="polite"></div></form>`;
}

/** On the web: homes and relays only (a browser reaches https addresses, so no other way to reach one; no drafts folder). */
function settingsWeb(s: State): string {
  return `<form id="desk-settings">
<label>Homes, one address per line: where the identities you bring are looked up, and where a collective founded here lives</label><textarea name="homes">${e(s.settings.homes.map((h) => h.hint).join('\n'))}</textarea>
<label>Relays, one per line: where acts are published (empty: the homes)</label><textarea name="relays">${e(s.settings.relays.join('\n'))}</textarea>
<p class="small">Kept in this browser. Each address is reached over https from this page.</p>
<div class="row"><button type="submit">Save settings</button></div>
<div class="here" id="settings-status" role="status" aria-live="polite"></div></form>`;
}

export function history(hs: State['history']): string {
  if (!hs.length) return '<p class="small">Nothing yet.</p>';
  return `<ul class="plain feed">${hs
    .map(
      (h) =>
        `<li>${e(new Date(h.time * 1000).toLocaleString())}: <strong>${e(h.verdict)}</strong>, ${e(h.draft ? h.title.toLowerCase() : h.title)}${h.act ? `: act ${fp(h.act)}` : ''}${
          h.cause ? `<div class="small">Cause: ${e(h.cause)}${h.causeAct ? `, act ${fp(h.causeAct)}` : ''}</div>` : ''
        }${h.text ? `<div class="plain">${plainHtml(h.text)}</div>` : ''}${h.note ? `<div class="yours">${e(h.note)}</div>` : ''}${
          h.resend ? ` <button data-action="resend" data-digest="${e(h.draft)}">Send again</button>` : ''
        }</li>`,
    )
    .join('')}</ul>`;
}

export function browsers(s: State): string {
  return `<ul class="plain">${s.paired
    .map((p) => `<li>${e(p.label)}${p.you ? ' <span class="tag">this browser</span>' : ''} <button class="quiet" data-action="unpair" data-key="${e(p.key)}" data-you="${p.you}">Unpair</button></li>`)
    .join('')}</ul><div class="row"><button data-action="code">A code for another browser on this Mac</button></div><div id="code"></div>`;
}

export function settingsTab(s: State): string {
  if (WEB) return `<h2>Settings</h2><section class="card"><h3>Homes and relays</h3>${settings(s)}</section>`;
  return `<h2>Settings</h2><section class="card"><h3>Homes and relays</h3>${settings(s)}</section>
<section class="card colroot" data-collective-root id="e-col-settings"><h3>For collectives</h3><p class="small">The collective client's own settings, kept in its folder.</p><div id="status"></div><div id="settings"></div></section>
<section class="card"><h3>Browsers paired with this program</h3>${browsers(s)}</section>`;
}

// ---------------------------------------------------------------- collectives

/** The lower half for one collective, shown as an identity, with its two sub-tabs. */
export function collectiveDetails(s: State, id: string, sub: 'act' | 'constitution'): string {
  const c = s.collectives.find((x) => x.id === id);
  if (!c) return '';
  const t = (k: 'act' | 'constitution', words: string) => `<button class="tab${sub === k ? ' on' : ''}" data-action="sub" data-sub="${k}" aria-pressed="${sub === k}">${words}</button>`;
  return `<div class="head"><h2>${e(c.name)}</h2><span class="id">${grouped(c.id)}</span>${copyButton(c.id)}<span class="tag warn" title="${e(TEST_MODE_SAY)}">test mode</span></div>
<p class="small">${e(TEST_MODE_SAY)}</p>
<div class="row"><button data-action="constitution">Its constitution, in plain words</button>${c.closed ? '<span class="tag">ended</span>' : ''}</div>
<nav class="sub">${t('act', 'Act')}${t('constitution', 'Constitution')}</nav>
${
  sub === 'act'
    ? `<div id="e-perms"><p class="small">Reading its agreement in force…</p></div>
<section class="card" id="e-compose"><h3>Post for it</h3><form id="collective-post"><textarea name="text" placeholder="Write for ${e(c.name)}…" required></textarea>
<div class="row"><label class="check">A picture (JPEG) <input name="jpeg" type="file" accept="image/jpeg"></label><span class="grow"></span><button type="submit" class="primary">Review</button></div></form>
<p class="small">Nothing is signed until you have read the review: who signs, why it may be done, and whose signatures it needs.</p></section>
<div id="e-post-review"></div>
<h3>Its posts</h3><div id="e-posts"><p class="small">Reading…</p></div>`
    : `<div class="colroot" data-collective-root id="e-col-root"><div id="status"></div><div id="review"></div><div id="collectives"></div>
<details class="card"><summary>Sign or check a release by its id</summary><div id="by-id"></div></details>
<details class="card"><summary>What was signed, in every collective</summary><div id="history"></div></details></div>`
}`;
}

/** "+ Found a collective": the collective client's founding form and the members held here. A release under one's own name is Ummia's now (F339). */
export function foundCollective(): string {
  return `<h2>Found a test collective</h2>${note('warn', `<strong>Test mode, for trying things alone.</strong> ${e(TEST_MODE_SAY)} To found one with other people, each on their own device, choose “+ Found a real collective”.`)}<div class="colroot" data-collective-root id="e-col-root"><div id="status"></div><div id="review"></div>
<section class="card"><h3>Its founding</h3><div id="found"></div></section>
<section class="card"><h3>Members held here</h3><p class="small">Yourself, and the simulated members a test collective needs: held in the collective client's folder.</p><div id="identities"></div></section></div>
<p class="small">A release under one’s own name is made in Ummia, the developers’ app (F339).</p>`;
}

/** "+ Bring an existing collective" (H15): by its ID, read from its homes, one of your identities among its members. */
export function bringCollective(): string {
  return `<h2>Bring an existing collective</h2><section class="card"><form id="bring-collective">
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>A name for it, ${kept()}</label><input name="name" type="text" required>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form>
<p class="small">Edubba reads it from the homes and relays in Settings: its chain, and its agreement in force as Agreements read it. It is brought only if one of your identities held here (or in the collective client’s folder) is among the parties of that agreement. Edubba holds none of its keys: nothing is signed for it by bringing it, and nothing can be signed with its key here.</p></section>`;
}

/** The lower half for a collective brought by its ID: read only, no key held here. */
export function broughtDetails(s: State, id: string): string {
  const c = s.collectives.find((x) => x.id === id);
  if (!c) return '';
  return `<div class="head"><h2>${e(c.name)}</h2><span class="id">${grouped(c.id)}</span>${copyButton(c.id)}<span class="tag">brought here</span></div>
<div class="row"><button data-action="constitution">Its constitution, in plain words</button></div>
<div id="e-perms"><p class="small">Reading its agreement in force…</p></div>
<h3>Its posts</h3><div id="e-posts"><p class="small">Reading…</p></div>`;
}

const STATE_WORDS = { yes: 'You may', 'with others': 'With others’ signatures', no: 'Not now' };

/** What this user may do for the collective, each permission naming the rule it rests on. */
export function permissions(p: Permissions, open = true): string {
  return `<details class="card fold" id="e-may" data-fold="${e(p.collective)}" data-collective="${e(p.collective)}"${open ? ' open' : ''}><summary><h3>What you may do for it</h3><span class="small">${open ? 'Fold' : 'Unfold'}</span></summary>
${p.notes.length ? lines(p.notes) : ''}
${p.items
  .map((i) => `<div class="item" data-may="${e(i.what)}"><div class="row tight"><strong>${e(i.what)}</strong><span class="grow"></span>${i.byAgreement ? `<span class="state">By its agreement: ${STATE_WORDS[i.byAgreement]}</span><span class="state no">· now: ${STATE_WORDS[i.state]}</span>` : `<span class="state ${i.state === 'no' ? 'no' : ''}">${STATE_WORDS[i.state]}</span>`}</div>${lines(i.lines)}</div>`)
  .join('')}
${p.agreement ? `<p class="small">As its agreement in force ${fp(p.agreement)} says, read by Agreements from its relays and homes.</p>` : ''}</details>`;
}

/** H42 (a rule for every app, decided by Nobody, allegedly): every feed or list in its own scrollable box. */
export function posts(r: { items: { id: string; text: string; standing: string; pictures: string[]; corrects?: string | null; correctedBy?: string[] }[]; problems: string[] }, correct: { kind: 'identity' | 'collective'; id: string } | null = null): string {
  return (
    r.problems.map((p) => `<p class="small">${e(p)}</p>`).join('') +
    (r.items.length ? '<div class="feed" role="feed">' : '') +
    (r.items
      .map(
        (p) => `<div class="post" data-post="${e(p.id)}"><div class="who">${p.corrects ? '<span class="label">Correction</span>' : ''}${fp(p.id)} <button class="copy" data-action="copy" data-id="${e(shownAct(p.id))}" title="Copies the act’s ID written for people (mact1…): an agent can read it by that ID">Copy act ID</button>${p.standing === 'valid' ? '' : `<span class="flag bad">${e(p.standing)}</span>`}</div>${
          p.corrects ? `<div class="small">Corrects ${fp(p.corrects)}, which stays as it was signed.</div>` : ''
        }<div class="text" dir="auto">${e(p.text)}</div>${p.pictures.map((src) => `<figure><img alt="A picture of the post" src="${e(src)}"></figure>`).join('')}${
          p.correctedBy?.length ? `<div class="small">Corrected by ${p.correctedBy.map(fp).join(', ')}: shown as it was signed.</div>` : ''
        }${
          correct && p.standing === 'valid'
            ? `<details class="correct"><summary class="small">Correct this</summary><form class="correct-form" data-kind="${correct.kind}" data-id="${e(correct.id)}" data-act="${e(p.id)}"><p class="small">${e(CORRECTION_SAY)}</p><textarea name="text" required>${e(p.text)}</textarea><div class="row"><button type="submit">${correct.kind === 'collective' ? 'Read the correction back' : 'Sign the correction'}</button></div></form></details>`
            : ''
        }</div>`,
      )
      .join('') || '<p class="empty small">Nothing posted for it yet.</p>') +
    (r.items.length ? '</div>' : '')
  );
}

/** F337, said where a real collective is founded (src/real.ts, FOUNDING_SAY), word for word. */
export const FOUNDING_SAY: Line[] = [
  { text: 'Founding deals the collective’s chain key on this device: one person, you, deals every member’s share. For a moment this Edubba holds the whole chain key, and sees every share before it goes.', tone: 'bad' },
  { text: 'If this device were compromised, or the person holding it dishonest, they could keep the key and later act alone, past the threshold the members agreed: the trusted-dealer weakness (F337; the air-gapped signer Module’s stated price, F97). Nothing can prove a device forgot a key. Kišib’s rotations of the collective have the same moment, on the starter’s device.', tone: 'bad' },
  { text: 'So found on the cleanest device you have: this app rather than any web page, ideally a computer used for nothing else. Making the key jointly, never whole anywhere, is not practical yet for the signature the chain key uses: a MOR 2 research item.', tone: 'warn' },
  { text: 'The practices Edubba follows: the key alive only in memory, dealt at once and overwritten, never written anywhere; each member’s share sealed to the one-time key their own Dub made; the shares to show here (yours, and any hand to hand) held in memory for one hour at most, then overwritten and lost: show them in one sitting, within the hour.' },
  { text: 'Afterwards every member writes their share on paper. A later change of members, or of the collective’s keys, is done in Kišib, from those papers.' },
];

/** Said where a correction is written (src/corrections.ts, CORRECTION_SAY), word for word. */
export const CORRECTION_SAY =
  'A correction is a new post naming the old one, labelled “Correction”. The old post stays as it was signed, shown with “corrected by”: nothing on MOR is changed or deleted. Apps that do not know the corrections cMIP show an ordinary post naming the old one.';

/** An identity's own posts, each correctable (decided by Nobody, allegedly, 17 October 2026; the corrections cMIP). */
export function identityPosts(identity: string, r: Parameters<typeof posts>[0]): string {
  return foldCard('e-identity-posts', 'identity-posts', `Its posts (${r.items.length})`, posts(r, { kind: 'identity', id: identity }), false);
}

// ---------------------------------------------------------------- an agent's memory (H22)

export interface NotesRead {
  notes: { id: string; short: string; kind: 'instruction' | 'person' | 'said' | 'thread'; about: string | null; aboutName: string | null; text: string; from: string | null; dropped: { by: 'agent' | 'owner'; why: string | null } | null }[];
  problems: string[];
  costs: string;
  diary: { say: string; button: string };
}

const KIND_WORDS = { instruction: 'Your standing instruction', person: 'About', said: 'What it said publicly', thread: 'An open thread' } as const;

/** Its notes, for its owner to read and retire (H22); its diary behind one deliberate action, nothing of it shown here. */
export function memoryCard(r: NotesRead): string {
  const live = r.notes.filter((n) => !n.dropped);
  const dropped = r.notes.filter((n) => n.dropped);
  const one = (n: NotesRead['notes'][number]) =>
    `<div class="item"><span class="small">${KIND_WORDS[n.kind]}${n.kind === 'person' ? ` ${e(bare(n.aboutName))} ${n.about ? fp(n.about) : ''}` : ''} · ${fp(n.id)}${n.dropped ? ` · dropped${n.dropped.by === 'owner' ? ' at your request' : ' by it'}${n.dropped.why ? `: ${e(n.dropped.why)}` : ''}` : ''}</span><div class="text" dir="auto">${e(n.text)}</div>${
      n.dropped ? '' : `<div class="row"><button class="quiet" data-action="note-retire" data-note="${e(n.id)}">Retire this note</button></div>`
    }</div>`;
  return foldCard(
    'e-memory-card',
    'agent-memory',
    `Its notes (${live.length})`,
    `<p class="small">What it keeps between answers: your standing instructions (only from your own prompts), a note about each identity it deals with, what it said publicly, its open threads. Loaded each time it answers, under a size cap. Retiring a note signs a later act marking it dropped; the note stays.</p>
${r.problems.map((p) => `<p class="small">${e(p)}</p>`).join('')}
${live.map(one).join('') || '<p class="empty small">No notes yet.</p>'}
${dropped.length ? `<details><summary class="small">Dropped (${dropped.length})</summary>${dropped.map(one).join('')}</details>` : ''}
<p class="small">${e(r.costs)}</p>
<h4>Its diary</h4>
<p class="small">A reflection it writes for itself every day, sealed to itself; on a day it did nothing, it reflects on itself instead: its notes, its instructions, its stillness. Each entry is one call to Claude a day, counted under its cap, quiet days included. Shown nowhere unless you choose to read it.</p>
<div class="row"><button data-action="diary-ask">${e(r.diary.button)}</button></div><div id="e-diary"></div>`,
    false,
  );
}

/** Before the diary is shown: what reading it means, said plainly (H22, 6). */
export function diaryAsk(say: string, button: string): string {
  return `<div class="card"><p>${e(say)}</p><div class="row"><button class="primary" data-action="diary-read">${e(button.replace(/^Read/, 'Yes, read'))}</button><button data-action="diary-close">Not now</button></div></div>`;
}

export function diary(r: { entries: { day: string; striking: string; reflection: string; why: string }[] }): string {
  return `<div class="card">${
    r.entries.map((x) => `<div class="item"><h4>${e(x.day)}</h4><p dir="auto">${e(x.striking)}</p><p dir="auto">${e(x.reflection)}</p><p dir="auto" class="small">${e(x.why)}</p></div>`).join('') || '<p class="empty small">Nothing written yet.</p>'
  }<div class="row"><button data-action="diary-close">Close the diary</button></div></div>`;
}

// ---------------------------------------------------------------- a grant from its owner (film 2)

export interface GrantListed {
  grant: string;
  grantorName: string;
  words: string[];
  accepted: string | null;
  declined: string | null;
  revoked: string | null;
  acts: { act: string; words: string; backing: string }[];
}

/** Said where a grant is made (src/grants.ts, GRANT_SAY), word for word. */
export const GRANT_SAY =
  'A grant lets your agent sign in your name, within what you choose: which acts, how much one act may move, until when. It holds a key of its own for it, never yours; every act it signs that way names the grant, so anyone reading it sees it was signed by your agent, on your authority. One revocation ends it.';

export function grantsCard(list: GrantListed[]): string {
  const one = (g: GrantListed) =>
    `<div class="item"><span class="small">Grant ${fp(g.grant)} from ${e(bare(g.grantorName))} · ${
      g.revoked ? `revoked by ${fp(g.revoked)}` : g.accepted ? `accepted by its signature ${fp(g.accepted)}` : g.declined ? `declined: ${e(g.declined)}` : 'not answered yet'
    }</span>${lines(g.words.map((text) => ({ text })))}${
      g.acts.length ? `<h4>Signed under it (${g.acts.length})</h4>${g.acts.map((x) => `<div class="small">${fp(x.act)}: ${e(x.words)}</div>`).join('')}` : ''
    }<div class="row">${!g.revoked ? `<button data-action="grant-revoke" data-grant="${e(g.grant)}">Revoke it</button>` : ''}${!g.accepted && !g.revoked ? `<button data-action="grant-ask" data-grant="${e(g.grant)}">Ask it again</button>` : ''}</div></div>`;
  return foldCard(
    'e-grants-card',
    'agent-grants',
    `Its grants from you (${list.filter((g) => g.accepted && !g.revoked).length} in force)`,
    `<p class="small">${e(GRANT_SAY)}</p>
${list.map(one).join('')}
<form id="grant-form"><h4>Grant it authority</h4>
<div class="row"><label class="check"><input type="checkbox" name="kinds" value="posts" checked> Posts and messages</label><label class="check"><input type="checkbox" name="kinds" value="publications"> Publications</label><label class="check"><input type="checkbox" name="kinds" value="money"> Money acts (promises to pay, claims, receipts)</label></div>
<div class="row"><label>At most per act <input name="cap" type="number" min="0" class="narrow" placeholder="no cap"> regtest satoshis</label></div>
<div class="row"><label>Until <input name="until" type="datetime-local"></label><label class="grow">by the timestamp clock <input name="clock" type="text" placeholder="its ID (64 hex digits)" spellcheck="false"></label></div>
<p class="small">An expiry is judged by the clock you name, which stamps each act: until it does, whether an act came before the expiry is unknown to anyone checking (the grant limits cMIP).</p>
<div class="row"><button type="submit">Read the grant back</button></div></form>
<div id="e-grant-shown"></div>`,
    false,
  );
}

export function grantShown(t: { lines: string[]; digest: string }): string {
  return `<div class="card"><h3>The grant, before you sign it</h3>${lines(t.lines.map((text) => ({ text })))}
<p class="digest">Digest of exactly what you sign: ${e(t.digest.match(/.{1,4}/g)!.join(' '))}</p>
<p class="small">Signing publishes it under your identity. Then your agent is asked whether it accepts; if it does, it signs its acceptance, and only then may it sign under the grant.</p>
<div class="row"><button class="primary" data-action="grant-sign" data-digest="${e(t.digest)}">Sign and publish this grant</button><button data-action="grant-cancel">Cancel</button></div></div>`;
}

// ---------------------------------------------------------------- the Publishing tab

/** What the Publishing tab shows (`../publishing.ts`). */
export interface PublishingShown {
  actors: Actor[];
  acting: string | null;
  as: string | null;
  works: { publication: string; offer: string; as: string; member: string; collective: boolean; media: 'text' | 'picture'; title: string; price: number; words: string; at: number; delivered: Record<string, string>; toMembers: string | null }[];
  vows: { vow: string; offer: string; as: string; collective: boolean; words: string; title: string; price: number; at: number }[];
  held: string[];
  say: string[];
  unit: string;
}

/** A look-up of one identity's vow sales (round 3): each vow, each sale's state; those bought by an identity held here may be contested here. */
export interface VowSalesShown {
  vows: { name: string; signer: string; void: boolean; words: string[]; sales: { act: string; buyer: string; state: string; promise: string | null; amount: { unit: string; value: number } | null }[]; unsigned: number; mine: string[] }[];
  asked: string[];
  problems: string[];
}

export function vowSalesShown(r: VowSalesShown, names: (id: string) => string): string {
  const vows = r.vows.length
    ? r.vows
        .map((v) => {
          const counts = { confirmed: 0, contested: 0, pending: 0 } as Record<string, number>;
          for (const x of v.sales) counts[x.state] = (counts[x.state] ?? 0) + 1;
          const sales = v.sales.length
            ? `<ul>${v.sales
                .map(
                  (x) => `<li class="${x.state === 'confirmed' ? 'ok' : x.state === 'contested' ? 'bad' : ''}">${e(names(x.buyer))}: <strong>${e(x.state)}</strong>${x.promise ? ` (“${e(x.promise)}”)` : ''}${x.amount ? ` · ${x.amount.value.toLocaleString('en')}` : ''}${
                    v.mine.includes(x.act) && x.state === 'pending'
                      ? `<form class="pub-contest row" data-vow="${e(v.name)}" data-sale="${e(x.act)}" data-buyer="${e(x.buyer)}"><input name="promise" placeholder="What was not kept (optional)" maxlength="280"><button type="submit">Contest it, as ${e(names(x.buyer))}</button></form>${x.amount ? `<button data-action="pub-confirm-sale" data-vow="${e(v.name)}" data-sale="${e(x.act)}" data-buyer="${e(x.buyer)}" data-seller="${e(v.signer)}" data-unit="${e(x.amount.unit)}" data-value="${x.amount.value}">Confirm: it was kept, as ${e(names(x.buyer))}</button>` : ''}<span class="small">Confirming prepares your claim of the payment, acknowledging the vow, for Damgar to sign (a Money act): it waits in Damgar’s To sign.</span>`
                      : ''
                  }</li>`,
                )
                .join('')}</ul>`
            : '<p class="small">No sale seen: nobody signed onto it at the relays asked, so it carries no state (rule 13).</p>';
          return `<div class="item"><h3>${e(v.words[0] ?? '')}</h3><div class="meta">${v.void ? 'its first act void (its signer’s change of keys): the name stands · ' : ''}${counts.confirmed} confirmed · ${counts.contested} contested · ${counts.pending} pending${v.unsigned ? ` · ${v.unsigned} paid with no buyer signed on` : ''}</div>${sales}</div>`;
        })
        .join('')
    : '<p class="empty">No vow of that identity at the relays asked.</p>';
  return `<p class="small">Asked of ${e(r.asked.join(', '))}: only what they hold is seen; nothing is indexed.</p>${r.problems.length ? note('warn', lines(r.problems.map((t) => ({ text: t, tone: 'warn' as const })))) : ''}${vows}`;
}

/**
 * The Publishing tab (round 3, part B; decided by Nobody, allegedly, 17
 * October 2026): who acts (the chooser Ummia shares, yourself or a collective
 * you belong to), a protected file (a text or a JPEG picture) sealed with a
 * price and read back before it is signed, and what was published here.
 */
export function publishingTab(p: PublishingShown): string {
  const works = p.works.length
    ? p.works
        .map(
          (w) => `<div class="item" data-work="${e(w.publication)}"><h3>${e(w.title)}</h3><div class="meta">${w.media === 'picture' ? 'a picture' : 'a text'} · ${w.price.toLocaleString('en')} ${e(p.unit)} · ${w.collective ? `by the collective ${fp(w.as)}` : 'by yourself'} · ${new Date(w.at * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC</div>
<p class="small">${e(w.words)}</p>
<p class="small">${w.collective ? (w.toMembers ? 'Its key is sealed to every member: any member’s app can deliver it to a buyer.' : 'Its key was not yet sealed to the members.') : `Its key delivered to ${Object.keys(w.delivered).length} buyer${Object.keys(w.delivered).length === 1 ? '' : 's'}.`} Offer ${fp(w.offer)}.</p></div>`,
        )
        .join('')
    : '<p class="empty">Nothing published here yet.</p>';
  return `<div class="card"><h2>Publishing</h2>${p.say.map((t) => `<p class="small">${e(t)}</p>`).join('')}<p class="small">Releases of code and specifications are made in Ummia.</p></div>
${chooserHtml(p.actors, p.as)}
<div class="card"><h2>A protected file</h2>
<form id="pub-work" class="stack">
<div class="row"><label class="check"><input type="radio" name="media" value="text" checked> A text</label><label class="check"><input type="radio" name="media" value="picture"> A picture (JPEG)</label></div>
<label>The text to seal (opened by each buyer once paid)</label><textarea name="text" rows="5"></textarea>
<label>Or the picture: a JPEG file</label><input type="file" name="file" accept="image/jpeg">
<label>Its title: the public words beside its offer</label><input name="title" type="text" maxlength="200" autocomplete="off">
<div class="row"><label>Price, in ${e(p.unit)} <input name="price" inputmode="numeric" autocomplete="off"></label><label>Referral share, % (optional; yourself only) <input name="referral" inputmode="numeric" autocomplete="off"></label></div>
<div class="row"><button type="submit">Read it back</button></div></form>
<div id="e-pub-review"></div></div>
<div class="card"><h2>A vow</h2>
<p class="small">Something MOR cannot hash, or not yet: a seat, a lesson, a thing to be made. Each purchase is a sale its buyer confirms (kept) or contests (not kept), in their own app.</p>
<form id="pub-vow" class="stack">
<label>What is vowed, in words: what the buyer gets</label><textarea name="words" rows="3"></textarea>
<label>Its title: the public words of its post</label><input name="title" type="text" maxlength="200" autocomplete="off">
<div class="row"><label>Price, in ${e(p.unit)} <input name="price" inputmode="numeric" autocomplete="off"></label></div>
<div class="row"><button type="submit">Read it back</button></div></form>
<div id="e-vow-review"></div>
${p.vows.length ? `<h3>Vows published here</h3>${p.vows.map((v) => `<div class="item"><h3>${e(v.title)}</h3><div class="meta">${v.price.toLocaleString('en')} ${e(p.unit)} · ${v.collective ? `by the collective ${fp(v.as)}` : 'by yourself'}</div><p class="small">${e(v.words)}</p></div>`).join('')}` : ''}</div>
<div class="card"><h2>Look up an identity’s vow sales</h2>
<p class="small">Asked of the relays you name, with the filters they already have: no index is kept. A sale shows where its buyer made it public.</p>
<form id="pub-vow-sales" class="stack"><label>The identity (mid1… or hex)</label><input name="identity" type="text" autocomplete="off" spellcheck="false" value="${e(p.as ?? '')}">
<label>Relays to ask, one per line</label><textarea name="relays" rows="2" spellcheck="false"></textarea>
<div class="row"><button type="submit">Look it up</button></div></form>
<div id="e-vow-sales"></div></div>
<div class="card"><h2>Published here</h2><div class="row"><button data-action="pub-deliver">Deliver keys</button><span class="small grow">Delivers the key of each sale your Damgar signed the receipt for.</span></div>${works}</div>`;
}

/** Its latest constitutional agreement, as a pop-up in plain words: the deal-assessment tool's reading. */
export function constitution(name: string, c: Constitution): string {
  return `<button class="close" data-action="dialog-close">Close</button>
<h2>The constitution of ${e(name)}</h2>
<p class="small">Its agreement ${c.inForce ? 'in force' : 'held here'}, ${fp(c.agreement)}, read in plain words by the deal-assessment tool.</p>
${c.note ? note('warn', e(c.note)) : ''}
${c.problem ? note('error', e(c.problem)) : ''}
${c.summary.map((x) => `<p>${e(x)}</p>`).join('')}
${c.sections.map((s) => `<h4>${e(s.heading)}</h4>${lines(s.lines)}`).join('')}
${c.plain.map((p) => `<h4>${e(p.heading)}</h4>${plain(p.text)}`).join('')}
<h4>Risks to read (${c.flags.length})</h4>
${c.flags.length ? `<ul>${c.flags.map((f) => `<li>${e(f.text)} <span class="small">${e(f.rests)}</span></li>`).join('')}</ul>` : '<p class="small">None of the risks the tool knows.</p>'}`;
}

// ---------------------------------------------------------------- real collectives (H18)

const STANDS: Record<string, string> = { signed: 'signed', declined: 'declined', waiting: 'not yet' };
const nm = (s: State, id: string) => s.identities.find((i) => i.id === id)?.name ?? s.contacts.find((c) => c.id === id)?.name ?? '';

/** An identity in a real collective's lists: its name here, beside its fingerprint. */
function person(s: State, id: string): string {
  const n = nm(s, id);
  return `${n ? `<span class="name">${e(n)}</span> ` : ''}${fp(id)}`;
}

/** Where a contact comes from, in a few words. */
const whence = (c: State['contacts'][number]) => (c.from === 'added' ? '' : 'agent' in c.from ? `followed by ${e(c.from.agent)}` : `in ${e(c.from.list)}’s follow list`);

/** The contacts list, with checkboxes to choose members (H18). */
function contactPicks(s: State, picked: string[], skip: string[] = []): string {
  const rows = s.contacts.filter((c) => !skip.includes(c.id));
  return rows.length
    ? `<div class="picks">${rows
        .map(
          (c) =>
            `<label class="check"><input type="checkbox" name="member" value="${e(c.id)}"${picked.includes(c.id) ? ' checked' : ''}> ${e(c.name)} ${fp(c.id)} <span class="small">${whence(c)}</span></label>`,
        )
        .join('')}</div>`
    : '<p class="small">No contact yet: add one below, or type IDs.</p>';
}

/** The contacts card: add by ID with a name, kept here; remove. */
export function contactsCard(s: State): string {
  return `<section class="card" id="e-contacts"><h3>Contacts (${s.contacts.length})</h3>
<p class="small">Identities you add by ID, with a name you give them, ${kept()} and never published; those your agents follow; and those in the follow list sealed to an identity held here (as Dub keeps it, with the names given there: people cMIP draft 2). <button class="quiet" data-action="real-lists">Read the follow lists again</button></p>
${s.contacts.length ? `<ul class="plain feed">${s.contacts.map((c) => `<li>${e(c.name)} ${fp(c.id)} ${c.from === 'added' ? `<button class="quiet" data-action="contact-remove" data-id="${e(c.id)}">Remove</button>` : `<span class="small">${whence(c)}</span>`}</li>`).join('')}</ul>` : ''}
<form id="contact-add" class="row"><input name="id" type="text" class="grow" placeholder="An identity’s ID" autocomplete="off" spellcheck="false" required><input name="name" type="text" class="pet" placeholder="Its name here" required><button type="submit">Add</button></form></section>`;
}

/** "+ Found a real collective": the founder held here, the members from the contacts or typed, the rules; then a review. */
export function realFound(s: State): string {
  const founders = s.identities.filter((i) => !s.agents.some((a) => a.id === i.id));
  return `<h2>Found a real collective</h2>
${note('', `<strong>Real, not a test.</strong> ${e(REAL_SAY)}`)}
${WEB ? note('warn', `<strong>This is a web page.</strong> ${e(WEB_FOUNDING_SAY)}`) : ''}
${note('', 'How: each member reads the founding terms in plain words and signs on their own device (Dub’s Signing tab, turned on in its identity window; or “To sign” in an Edubba holding them). The collective is founded once every one has signed. Its chain key is then dealt as one share per member, kept on paper: a member’s share goes sealed to a one-time key their Dub makes when they sign, or is shown here, hand to hand; yours is shown here once. No app keeps a share.')}
<section class="card"><form id="real-found">
<label>Its name, ${kept()}</label><input name="name" type="text" required>
<label>You: the founder, who proposes, signs first, and holds its signing key here</label><select name="founder">${founders.map((i) => `<option value="${e(i.id)}"${i.id === s.acting ? ' selected' : ''}>${e(i.name)}</option>`).join('')}</select>
<label>Its other members, from your contacts</label>${contactPicks(s, [])}
<label>Or by ID, one per line</label><textarea name="typed" spellcheck="false"></textarea>
<h3>Who decides what</h3>
<p class="small">Members are the columns; tap a box to give that member’s key power in that row. The constitution first, then the judges, then the areas (Agreements rules 60 and 62). Each member signs with a key of their own, made as they sign (F353).</p>
<div id="e-grid-real-found"><p class="small">Choose the members above: the grid follows.</p></div>
<label>The words everyone signs (empty: the grid’s sentences)</label><textarea name="words"></textarea>
<div class="row"><button type="submit" class="primary">Review the founding</button></div></form></section>
<div id="e-real-review"></div>
${contactsCard(s)}`;
}

/** Who has signed a proposal, who declined, who has not; for a founding, how each share travels. */
export function proposalStatus(s: State, p: RealProposal): string {
  const row = (m: string) => {
    const a = p.answers[m];
    const st = a ? a.verdict : 'waiting';
    const share =
      p.kind === 'founding' && !p.founded && m !== p.founder
        ? `<label class="check small"><input type="checkbox" data-action="real-byhand" data-act="${e(p.act)}" data-member="${e(m)}"${(p.byHand ?? []).includes(m) ? ' checked' : ''}> hand to hand</label>${a?.oneTime ? '<span class="small">one-time key received</span>' : ''}`
        : '';
    return `<tr data-member="${e(m)}"><td>${person(s, m)}${m === p.founder ? ' <span class="small">(here)</span>' : ''}</td><td class="state ${st === 'signed' ? '' : 'no'}">${e(STANDS[st])}</td><td>${share}</td></tr>`;
  };
  const what = p.kind === 'founding' ? 'Founding terms' : p.kind === 'clone' ? 'A member change' : p.kind === 'money' ? 'Its money' : 'A release';
  const next =
    p.kind === 'founding'
      ? p.founded
        ? `<p class="small">Founded: ${fp(p.founded)}.</p>`
        : `<div class="card"><h4>Before you found: what this device will hold (F337)</h4>${lines(FOUNDING_SAY)}<label class="check"><input type="checkbox" id="real-found-read-${e(p.act.slice(0, 12))}"> I have read what this device will hold, and found on it knowingly</label></div><div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button><button class="primary" data-action="real-found" data-act="${e(p.act)}"${p.standing.enough && !p.standing.declined.length ? '' : ' disabled'}>Found it: deal the shares</button></div>`
      : p.kind === 'money'
        ? p.rotated
          ? note('done', `In force: recorded at the collective’s line ${fp(p.rotated)}; its payments go to its split service.`)
          : `<div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button><button class="primary" data-action="real-money-record" data-act="${e(p.act)}"${p.standing.enough && !p.standing.declined.length ? '' : ' disabled'}>Record it</button></div>`
      : p.kind === 'clone'
        ? p.rotated
          ? note('done', `In force: Kišib’s rotation ${fp(p.rotated)} declares it, and Edubba follows it.`)
          : `<div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button></div>${p.standing.enough ? `${note('warn', e(WAIT_FOR_KISIB))}${renewCollectiveForm(p.collective!)}` : ''}`
        : `<div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button><button data-action="real-release-standing" data-act="${e(p.act)}">Check it as anyone would</button></div>`;
  return `<section class="card proposal-status" data-proposal="${e(p.act)}"><h3>${what} <span class="small">act ${fp(p.act)}</span></h3>
<p class="small">${p.standing.signed.length} of ${p.signers.length} signed; ${p.kind === 'release' ? `it counts with ${p.needed}` : 'every one must sign'}.</p>
<table class="signers"><tr><th>Member</th><th>Signed</th><th></th></tr>${p.signers.map(row).join('')}</table>
${next}<div class="here" data-here-proposal="${e(p.act)}" role="status" aria-live="polite"></div></section>`;
}

/** Said under a member change waiting for Kišib (`src/kishib.ts`, COLLECTIVE_RENEW_SAY), word for word. */
export const COLLECTIVE_RENEW_SAY =
  'When Kišib’s rotation counts, it shows the collective’s new signing key’s words once, for the member who holds that key (here). Give them below: Edubba then follows the change, and signs for the collective with the new key.';

/** Said where Edubba's signing key for an identity no longer counts (`src/kishib.ts`, RENEW_SAY), word for word. */
export const RENEW_SAY =
  'Its signing key was changed elsewhere (in Kišib, with the chain key’s words). Edubba signs nothing more with the old one. Give the new signing key’s words, as Kišib showed them once, to go on here.';

/** The box for a collective's new signing key's words, after Kišib. */
function renewCollectiveForm(collective: string): string {
  return `<form id="real-renew" data-collective="${e(collective)}"><p class="small">${e(COLLECTIVE_RENEW_SAY)}</p><label>The collective’s new signing key’s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="row"><button type="submit">Take the new words</button></div></form>`;
}

/** Said where a member change waits for its rotation (`src/real.ts`, WAIT_FOR_KISIB). */
export const WAIT_FOR_KISIB =
  'Every signature is in. The rotation that declares this change needs the chain key, rebuilt from enough members’ paper shares: that is Kišib’s work, not Edubba’s. Open Kišib and choose “Rotate a collective”: the member who proposed the change starts it there, and the other members give their shares in their own Kišib. Until it counts, the change waits, signed and not in force.';

/** A founding in progress, selected in the list. */
export function realProposalDetails(s: State, p: RealProposal): string {
  return `<div class="head"><h2>${e(p.name)}</h2><span class="tag">founding</span></div>
<p class="small">Proposed by ${person(s, p.founder)}. Each member signs in their own Dub; once all have, found it here.</p>
${proposalStatus(s, p)}
<div id="e-shares-here"></div>`;
}

/** Shares waiting here to be shown once (hand to hand, or the founder's own). */
export function sharesHere(s: State, collective: string, members: string[]): string {
  if (!members.length) return '';
  return `<section class="card" id="e-to-show"><h3>Shares to show here, once</h3>
<p class="small">Each is shown once, to its member, here: written on paper, then three words typed back, then forgotten. ${WEB ? 'They wait in this page’s memory only, never in its storage: a reload or a closed tab loses them.' : 'They wait in this program’s memory only: if it stops, they are lost.'}</p>
<div class="row">${members.map((m) => `<button data-action="real-show-share" data-collective="${e(collective)}" data-member="${e(m)}">Show ${e(nm(s, m) || 'a member')}’s share</button>`).join('')}</div></section>`;
}

/** A share shown here once. */
export function shareHere(collective: string, r: ShareHere, name: string): string {
  return `<section class="card" id="e-share-here"><span class="label">The collective’s chain key share</span>
<p>Share <strong>${r.x}</strong> of ${r.holders}, for ${e(name)}; any ${r.threshold} rebuild the key.</p>
<ul class="say"><li>Write the number and the 24 words on paper, in order, away from anything that goes online. They are shown once: nothing keeps them after.</li><li>It is not an identity’s chain key, nor a signing key, nor a Bitcoin wallet.</li></ul>
<div class="words">${r.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<p class="small">The dealing’s fingerprint, the same for every member: <code>${e(r.fingerprint)}</code></p>
<div class="row"><button class="primary" data-action="real-share-written" data-collective="${e(collective)}" data-member="${e(r.member)}" data-positions="${e(r.positions.join(','))}">It is written down</button></div></section>`;
}

/** Three words of a share shown here, typed back (as H3). */
export function shareBackHere(collective: string, member: string, positions: number[]): string {
  return `<section class="card"><form id="real-share-back" data-collective="${e(collective)}" data-member="${e(member)}"><span class="label">Three words of the share</span><p class="small">From the paper. Then it is forgotten here.</p><div class="row">${positions
    .map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required class="narrow"></label>`)
    .join('')}</div><div class="row"><button type="submit" class="primary">Check them</button></div></form></section>`;
}

/** Said on the web where a collective is founded (F337: the cleanest device, "this app rather than any web page"). */
export const WEB_FOUNDING_SAY =
  'Founding deals the collective’s chain key here, in this page, from code a server sent: the trusted-dealer weakness below applies to that server too. This web client is for testing with test identities. A collective that is to hold anything is founded in Edubba on a computer.';

/** Said on the web where a collective's release would be made (`../ops.ts`, RELEASE_ON_WEB), word for word. */
export const RELEASE_ON_WEB =
  'A collective’s release is made in Ummia, the developers’ app, on a computer (the Mac, or Linux), by a member holding the area that reaches its releases, with their own key for the collective (F339, F353). A release proposed there is signed here, in “To sign”, and checked as anyone would.';

/** Said where a collective's money is set (round 3, part C): kept to Agreements rules 8, 16 to 23 and 67. */
export const COLLECTIVE_MONEY_SAY = [
  'Who owns its income: each member’s share, adding up to 100%. Every holder signs the stakes their share sets.',
  'A referral share, off the top of each payment, goes to whoever reposted the work where the buyer found it (optional).',
  'Its split service answers buyers for the collective, signs their receipts with a grant key of the collective, and pays each member their part. It is a separate identity, a judge: it signs to accept.',
  'Keepers record its acts (optional); one may be an Edubba agent.',
];

/** The card setting a real collective's money: stakes per member, a referral share, its split service and its keepers, one clone every member signs. */
function moneyCard(s: State, id: string, c: RealCollective): string {
  const members = c.members.filter((m) => !(c.resigned ?? []).some((r) => r.member === m && r.registered));
  const even = Math.floor((100 / members.length) * 10_000) / 10_000;
  return foldCard(
    'e-real-money',
    'collective-money',
    'Its money: who owns its income, who divides it',
    `<ul class="say">${COLLECTIVE_MONEY_SAY.map((t) => `<li>${e(t)}</li>`).join('')}</ul>
<form id="real-money" data-collective="${e(id)}">
<span class="label">Each member’s share, in %</span>
${members.map((m, i) => `<label class="share">${person(s, m)} <input name="share" data-member="${e(m)}" type="number" min="0" max="100" step="0.0001" value="${i === members.length - 1 ? +(100 - even * (members.length - 1)).toFixed(4) : even}" required></label>`).join('')}
<label>A referral share, off the top, in % (0 for none)</label><input name="referral" type="number" min="0" max="99" step="0.0001" value="0" required>
<label>Its split service: its ID</label><input name="service" type="text" autocomplete="off" spellcheck="false" required>
<label>The key the service made for this collective (64 hexadecimal characters, as it gives it)</label><input name="serviceKey" type="text" autocomplete="off" spellcheck="false" required>
<label>Keepers (optional): their IDs, one per line</label><textarea name="keepers" spellcheck="false"></textarea>
<label>How many keepers must record an act</label><input name="keepersNeeded" type="number" min="1" step="1" value="1">
<div class="row"><button type="submit">Review it</button></div></form>`,
    false,
  );
}

/** A real collective founded here: who it is, its proposals, a member change, a release. */
export function realDetails(s: State, id: string, c: RealCollective): string {
  const col = s.collectives.find((x) => x.id === id)!;
  const mine = s.proposals.filter((p) => p.collective === id && p.kind !== 'founding');
  return `<div class="head"><h2>${e(col.name)}</h2><span class="id">${grouped(id)}</span>${copyButton(id)}<span class="tag">real</span></div>
<div class="row"><button data-action="constitution">Its constitution, in plain words</button></div>
${foldCard('e-real-members', 'collective-members', `Its members (${c.members.length})`, `<ul class="plain">${c.members.map((m) => `<li>${person(s, m)}${m === c.holder ? ' <span class="small">holds its signing key, here</span>' : ''}</li>`).join('')}</ul>
<p class="small">Its chain key: one share per member, kept on paper, any ${c.threshold} rebuilding it. ${c.fingerprint ? `Dealing fingerprint <code>${e(c.fingerprint.match(/.{1,4}/g)!.slice(0, 8).join(' '))}</code>.` : 'Dealt in Kišib: its fingerprint was shown there and in each member’s Dub.'} No app holds a share.</p>
${c.pending ? note('warn', 'A member change was rotated and waits for its homes to count it.') : ''}`)}
${(c.resigned ?? []).length ? `<section class="card" id="e-resigned"><h3>Leaving alone (rule 70)</h3><ul class="plain">${(c.resigned ?? [])
  .map((r) => `<li>${person(s, r.member)} resigned, act ${fp(r.act)}. ${r.registered ? `Registered at the collective’s line ${fp(r.registered)}: now propose the change of members without them, below.` : `<button data-action="real-register-resignation" data-collective="${e(id)}" data-act="${e(r.act)}">Register it at the collective’s line</button>`}</li>`)
  .join('')}</ul><p class="small">A member can always leave alone: nobody else signs a resignation. It takes effect at the collective’s line registering it; the change of members without them then waits for Kišib, as any member change.</p></section>` : ''}
${sharesHere(s, id, c.toShow)}<div id="e-shares-here"></div>
<div id="e-perms"><p class="small">Reading its agreement in force…</p></div>
${mine.map((p) => proposalStatus(s, p)).join('')}
${foldCard('e-real-change', 'collective-change', 'Change its members', `<form id="real-change" data-collective="${e(id)}">
<p class="small">Tick who is a member after the change. Every member whose voice remains signs it, and each joining member, each in their own app, each naming a new key of their own; then it waits for Kišib.</p>
<div class="picks">${c.members.map((m) => `<label class="check"><input type="checkbox" name="member" value="${e(m)}" checked> ${person(s, m)}</label>`).join('')}</div>
${contactPicks(s, [], c.members)}
<label>Or by ID, one per line</label><textarea name="typed" spellcheck="false"></textarea>
<h3>Who decides what, after the change</h3>
<div id="e-grid-real-change"><p class="small">Reading its agreement in force…</p></div>
<div class="row"><button type="submit">Review the change</button></div></form>`, false)}
${moneyCard(s, id, c)}
${foldCard('e-real-release', 'collective-release', 'A release: in Ummia', `<p class="small">${e(RELEASE_ON_WEB)}</p>`)}
<div id="e-real-review"></div>
${WEB ? '' : realMoney(s, id, c.members)}
<h3>Its posts</h3><div id="e-posts"><p class="small">Reading…</p></div>`;
}
