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

import { e } from '../../../manage/src/view.ts';
import { STYLE as DUB, proposal as dubProposal, share as dubShare, SIGNING_LABEL } from '../../../dub/src/page/view.ts';
import type { Proposal as MemberProposal, ShareShown } from '../../../dub/src/shapes.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { Listing } from '../folders.ts';
import type { ActRead, RealCollective, RealProposal, ShareHere, AgentDetails, AgentSummary, AgentView, Constitution, Done, DraftView, IdentityRecord, Item, Line, MachineState, Permissions, ReleaseReview, Sorted, State } from './api.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';

export { e };

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
export const STYLE = `${DUB}
${TEXT}
main{max-width:760px}
.bar .tabs{margin:0 0 0 18px}
.bar .grow{flex:1}
.testonly{margin:10px 0 0;font-size:12px;color:var(--faint)}
h2{font-size:16px}
h3{font-size:15px}
h4{font-weight:400;font-size:14px;color:var(--soft);margin:16px 0 6px}
.list{display:flex;flex-direction:column;gap:8px;margin:16px 0}
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

const grouped = (id: string) => e(id.match(/.{1,4}/g)!.join(' '));

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

/**
 * A card that folds (H14, H26, H34): open or closed by default; the person's
 * choice remembered by the program, by `key` (`app.ts`, "toggle").
 */
export function foldCard(id: string, key: string, title: string, body: string, open = true, after = ''): string {
  return `<details class="card fold" id="${e(id)}" data-fold="${e(key)}"${open ? ' open' : ''}><summary><h3>${title}</h3>${after}<span class="small hint"></span></summary>${body}</details>`;
}

function lines(ls: Line[]): string {
  return `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;
}

/** What was done, inside the status note. */
export function done(d: Done): string {
  return `<strong>${e(d.title)}</strong>${lines(d.lines)}`;
}

/** Text already written out with <U+…> for each invisible control, shown character for character. */
const plain = (text: string) => `<div class="plain">${plainHtml(text)}</div>`;

const copyButton = (id: string) => `<button class="copy" data-action="copy" data-id="${e(id)}" title="Copies the whole ID, without spaces, to paste where an identity is asked for">Copy ID</button>`;

// ---------------------------------------------------------------- the frame

export type Tab = 'agents' | 'identities' | 'collectives' | 'settings';

export function top(tab: Tab | null = null, counts: Partial<Record<Tab, number>> = {}): string {
  const t = (k: Tab, words: string) =>
    `<button class="tab${tab === k ? ' on' : ''}" data-action="tab" data-tab="${k}" aria-pressed="${tab === k}">${words}<span class="count">${counts[k] ? counts[k] : ''}</span></button>`;
  return `<header class="bar"><h1 class="mark">${NAME}</h1>${
    tab ? `<nav class="tabs" aria-label="Edubba">${t('agents', 'Agents')}${t('identities', 'Identities')}${t('collectives', 'Collectives')}</nav><span class="grow"></span>${t('settings', 'Settings')}` : '<span class="grow"></span><span class="small">this machine only</span>'
  }</header>
<p class="testonly">Test identities only, until MOR is frozen. Every key is held in software in this program’s folders: a prototype, never for a real identity.</p>`;
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
    .join('')}<button class="entry add" data-action="pick-identity" data-id="new">+ A new identity</button></div>`;
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
<button class="entry add" data-action="pick-collective" data-id="found">+ Found a test collective: everyone held here, for trying alone</button>
<p class="choose">${e(TEST_MODE_SAY)}</p>
<button class="entry add" data-action="pick-collective" data-id="bring">+ Bring an existing collective</button></div>`;
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
    return `<div data-pile="${e(k)}"><h4>${e(w)} (${xs.length})</h4>${xs.map((x) => item(i.id, x)).join('') || '<p class="small">None.</p>'}</div>`;
  }).join('');
  const answered = s.history.filter((h) => h.signer === id);
  return `<div class="head"><h2>${e(i.name)}</h2><span class="id">${grouped(i.id)}</span>${copyButton(i.id)}<span class="tag">${i.kind === 'brought' ? 'brought here' : 'made here'}</span></div>
<div class="card" data-identity="${e(i.id)}">
<dl class="facts"><dt>This desk's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? '')}</code>` : ''}</dd></dl>
${linkSwitch(i.id, i.linked)}
<div class="here" data-here="${e(i.id)}" role="status" aria-live="polite"></div></div>
${foldCard('e-record-fold', 'identity-record', 'Its record', '<div id="e-record"><p class="small">Reading it from its homes and relays…</p></div>')}
${foldCard('e-rely', 'identity-rely', 'Rely on an act', `<p class="small">${e(WITNESS_EXPLANATION)}</p>
<form id="rely" class="row"><input name="act" type="text" class="grow" placeholder="The act’s id: 64 hexadecimal characters" autocomplete="off" spellcheck="false" required><button type="submit">Read it back</button></form>
<div id="e-rely-shown"></div>`, false)}
${releaseCard(i)}
${foldCard('e-drafts-fold', 'identity-drafts', `Drafts from Claude (${mine.length})`, `<div class="row"><button class="quiet" data-action="drafts">Look for new drafts now</button><span class="small" id="drafts-watch" role="status" aria-live="polite">${WATCHING}</span></div>
<div id="drafts">${mine.map(draft).join('') || '<p class="empty small">No draft is waiting for it.</p>'}</div>`)}
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
      ? `<dl class="facts card-of"><dt>Latest act</dt><dd><code>${e(l.card.act)}</code></dd><dt>Position</dt><dd>${l.card.position}</dd><dt>Summary</dt><dd><code>${e(l.card.summary)}</code></dd></dl>`
      : '';
  return `<p class="small">As its homes and relays show it now. Nothing here is signed.</p>
${r.problems.map((p) => note('warn', e(p))).join('')}
${r.sections.map((x) => `<h4>${e(x.heading)}</h4>${lines(x.lines)}`).join('')}
<h4>Its lines of acts (${r.lines.length})</h4>
<p class="small">A change of its signing key (in MOR Safety, with the chain key) must keep every line, or that line’s acts become void (Identity rule 35). Where MOR Safety cannot read a line, give it the latest act, position and summary shown here.</p>
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

/** H16: a release under this identity's own name, its folder chosen at each release. */
export function releaseCard(i: Held): string {
  return foldCard('e-release', 'identity-release', 'A release under its own name', `<p class="small">Publishes the files of a folder you choose now, signed by this identity alone. A git folder gives the files git tracks there; a plain folder gives every file but hidden ones. Every file is listed with its size and fingerprint, and the libraries it depends on, before anything is signed.</p>
<div class="row"><button type="button" data-action="pick-folder" data-target="release-folder">Choose a folder…</button><span class="small">or paste its path, as Finder or the Terminal gives it</span></div>
<form id="release-folder" class="row"><input name="folder" type="text" class="grow" placeholder="The folder: /Users/you/Projects/site or ~/Projects/site" autocomplete="off" spellcheck="false" required><button type="submit">Use this folder</button></form>
<div id="e-release-form"></div>
<div id="e-release-review"></div>
${
  i.releases.length
    ? `<details><summary>Its releases here (${i.releases.length})</summary><ul class="plain">${i.releases.map((r) => `<li>${e(r.name)} ${e(r.version)} ${fp(r.id)} <span class="small">from ${e(r.folder)}</span></li>`).join('')}</ul></details>`
    : ''
}`);
}

/** The release's name, version and the release before it, once the folder is chosen. */
export function releaseForm(i: Held, f: { folder: string; how: 'git' | 'plain'; name: string; previous: string | null }): string {
  const opts = [`<option value=""${f.previous ? '' : ' selected'}>None: a new release line</option>`, ...i.releases.map((r) => `<option value="${e(r.id)}"${r.id === f.previous ? ' selected' : ''}>${e(r.name)} ${e(r.version)} (${e(r.id.slice(0, 8))}…), from ${e(r.folder)}</option>`)].join('');
  return `<form id="release-prepare" data-folder="${e(f.folder)}">
<p class="small">${e(f.folder)}: ${f.how === 'git' ? 'a git folder: the files git tracks there.' : 'a plain folder: every file but hidden ones.'}</p>
<label>Its name</label><input name="name" type="text" value="${e(f.name)}" required>
<label>Its version</label><input name="version" type="text" placeholder="For example 1.0" required>
<label>The release before it</label><select name="previous">${opts}</select>
<p class="small">Pre-set to this identity’s last release of the same name, if any. The review says which release it follows and what changed since.</p>
<div class="row"><button type="submit">Review the release</button></div></form>`;
}

const size = (n: number) => (n < 1024 ? `${n} bytes` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** The release read back: every file with its size and fingerprint, the libraries, then the one button that signs exactly that. */
export function releaseReview(r: ReleaseReview): string {
  const blocked = r.blocking.length ? note('error', `<strong>This cannot be signed:</strong><ul>${r.blocking.map((b) => `<li>${e(b)}</li>`).join('')}</ul>`) : '';
  return `<div class="card review" id="e-release-shown"><h3>${e(r.title)}</h3>
${r.summary.map((x) => `<p>${e(x)}</p>`).join('')}
${blocked}
${r.sections.map((x) => `<h4>${e(x.heading)}</h4>${lines(x.lines)}`).join('')}
<h4>Every file (${r.files.length})</h4>
<div class="files"><table><tr><th>File</th><th>Size</th><th>Fingerprint</th></tr>${r.files.map((f) => `<tr><td dir="auto">${e(f.path)}</td><td>${e(size(f.size))}</td><td><code title="${e(f.fingerprint)}">${e(f.fingerprint.slice(0, 16))}…</code></td></tr>`).join('')}</table></div>
<h4>The libraries it depends on (${r.dependencies.length})</h4>
${r.dependencies.length ? `<div class="files"><table><tr><th>Where</th><th>Library</th><th>Version</th></tr>${r.dependencies.map((d) => `<tr><td>${e(d.registry)}</td><td>${e(d.name)}</td><td>${e(d.version)}</td></tr>`).join('')}</table></div>` : '<p class="small">None: it names no lock file (Cargo.lock, package-lock.json).</p>'}
${r.skipped.length ? `<h4>Not in the release (${r.skipped.length})</h4><ul>${r.skipped.map((x) => `<li class="warn">${e(x)}</li>`).join('')}</ul>` : ''}
<p class="digest">Digest of exactly what is signed: ${e(r.digest.match(/.{1,4}/g)!.join(' '))}</p>
<div class="row"><button class="primary" data-action="release-sign" data-plan="${e(r.plan)}" data-digest="${e(r.digest)}"${r.blocking.length ? ' disabled' : ''}>Sign and publish</button><button data-action="release-cancel" data-plan="${e(r.plan)}">Cancel</button></div></div>`;
}

/** Drafts naming an identity this desk does not hold: shown so nothing waits unseen. */
export function strayDrafts(s: State, drafts: DraftView[]): string {
  const stray = drafts.filter((d) => !s.identities.some((i) => i.id === d.signer));
  return stray.length ? `<h3>Drafts for no identity held here (${stray.length})</h3>${stray.map(draft).join('')}` : '';
}

export function newIdentity(): string {
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
<p class="small">Never type the chain key’s words here: they belong to MOR Safety, on a device that stays offline. Whoever holds the signing key’s words can sign as this identity and read its private messages: Edubba keeps them in its folder, as every key here.</p>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>`;
}

export function settings(s: State): string {
  const via = Object.entries(s.settings.via).map(([a, b]) => `${a}=${b}`).join('\n');
  return `<form id="desk-settings">
<label>Homes, one address per line: where new identities live</label><textarea name="homes">${e(s.settings.homes.map((h) => h.hint).join('\n'))}</textarea>
<label>Relays, one per line: where acts are published, and the inbox of new identities (empty: the homes)</label><textarea name="relays">${e(s.settings.relays.join('\n'))}</textarea>
<label>Other ways to reach an address, one per line, as address=where (for example the onion home at its local port)</label><textarea name="via">${e(via)}</textarea>
<label>The drafts folder, shared with the Claude connector</label><input name="drafts" type="text" value="${e(s.settings.drafts)}">
<div class="row"><button type="submit">Save settings</button></div>
<div class="here" id="settings-status" role="status" aria-live="polite"></div></form>`;
}

export function history(hs: State['history']): string {
  if (!hs.length) return '<p class="small">Nothing yet.</p>';
  return `<ul class="plain">${hs
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

/** "+ Found a collective": the collective client's founding form and the members held here. A release under one's own name is on the Identities tab now (H16). */
export function foundCollective(): string {
  return `<h2>Found a test collective</h2>${note('warn', `<strong>Test mode, for trying things alone.</strong> ${e(TEST_MODE_SAY)} To found one with other people, each on their own device, choose “+ Found a real collective”.`)}<div class="colroot" data-collective-root id="e-col-root"><div id="status"></div><div id="review"></div>
<section class="card"><h3>Its founding</h3><div id="found"></div></section>
<section class="card"><h3>Members held here</h3><p class="small">Yourself, and the simulated members a test collective needs: held in the collective client's folder.</p><div id="identities"></div></section></div>
<p class="small">A release under one’s own name is on the Identities tab, as an action of the identity selected.</p>`;
}

/** "+ Bring an existing collective" (H15): by its ID, read from its homes, one of your identities among its members. */
export function bringCollective(): string {
  return `<h2>Bring an existing collective</h2><section class="card"><form id="bring-collective">
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>A name for it, kept on this Mac</label><input name="name" type="text" required>
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

export function posts(r: { items: { id: string; text: string; standing: string; pictures: string[] }[]; problems: string[] }): string {
  return (
    r.problems.map((p) => `<p class="small">${e(p)}</p>`).join('') +
    (r.items
      .map(
        (p) => `<div class="post"><div class="who">${fp(p.id)}${p.standing === 'valid' ? '' : `<span class="flag bad">${e(p.standing)}</span>`}</div><div class="text" dir="auto">${e(p.text)}</div>${p.pictures
          .map((src) => `<figure><img alt="A picture of the post" src="${e(src)}"></figure>`)
          .join('')}</div>`,
      )
      .join('') || '<p class="empty small">Nothing posted for it yet.</p>')
  );
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
<p class="small">Identities you add by ID, with a name you give them, kept on this Mac and never published; those your agents follow; and those in the follow list sealed to an identity held here (as Dub keeps it, with the names given there: people cMIP draft 2). <button class="quiet" data-action="real-lists">Read the follow lists again</button></p>
${s.contacts.length ? `<ul class="plain">${s.contacts.map((c) => `<li>${e(c.name)} ${fp(c.id)} ${c.from === 'added' ? `<button class="quiet" data-action="contact-remove" data-id="${e(c.id)}">Remove</button>` : `<span class="small">${whence(c)}</span>`}</li>`).join('')}</ul>` : ''}
<form id="contact-add" class="row"><input name="id" type="text" class="grow" placeholder="An identity’s ID" autocomplete="off" spellcheck="false" required><input name="name" type="text" class="pet" placeholder="Its name here" required><button type="submit">Add</button></form></section>`;
}

/** "+ Found a real collective": the founder held here, the members from the contacts or typed, the rules; then a review. */
export function realFound(s: State): string {
  const founders = s.identities.filter((i) => !s.agents.some((a) => a.id === i.id));
  return `<h2>Found a real collective</h2>
${note('', `<strong>Real, not a test.</strong> ${e(REAL_SAY)}`)}
${note('', 'How: each member reads the founding terms in plain words and signs on their own device (Dub’s Signing tab, turned on in its identity window; or “To sign” in an Edubba holding them). The collective is founded once every one has signed. Its chain key is then dealt as one share per member, kept on paper: a member’s share goes sealed to a one-time key their Dub makes when they sign, or is shown here, hand to hand; yours is shown here once. No app keeps a share.')}
<section class="card"><form id="real-found">
<label>Its name, kept on this Mac</label><input name="name" type="text" required>
<label>You: the founder, who proposes, signs first, and holds its signing key here</label><select name="founder">${founders.map((i) => `<option value="${e(i.id)}"${i.id === s.acting ? ' selected' : ''}>${e(i.name)}</option>`).join('')}</select>
<label>Its other members, from your contacts</label>${contactPicks(s, [])}
<label>Or by ID, one per line</label><textarea name="typed" spellcheck="false"></textarea>
<fieldset><legend>Its rules</legend><div class="row">
<label>Shares that rebuild the chain key <input name="safety" type="number" min="1" value="2" class="narrow"></label>
<label>Signatures a release needs <input name="release" type="number" min="1" value="2" class="narrow"></label>
<label>Signatures an operational change needs <input name="clone" type="number" min="1" value="2" class="narrow"></label>
<label>Members who judge absence <input name="others" type="number" min="1" value="2" class="narrow"></label></div>
<p class="small">Changes of members or rules need every member whose voice remains (Agreements rule 64). A way to rotate must survive the loss of any one member’s share (F96): fewer shares than members.</p></fieldset>
<label>The words everyone signs (empty: the standard words for these rules)</label><textarea name="words"></textarea>
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
  const what = p.kind === 'founding' ? 'Founding terms' : p.kind === 'clone' ? 'A member change' : 'A release';
  const next =
    p.kind === 'founding'
      ? p.founded
        ? `<p class="small">Founded: ${fp(p.founded)}.</p>`
        : `<div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button><button class="primary" data-action="real-found" data-act="${e(p.act)}"${p.standing.enough && !p.standing.declined.length ? '' : ' disabled'}>Found it: deal the shares</button></div>`
      : p.kind === 'clone'
        ? `<div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button></div>${p.standing.enough ? note('warn', e(WAIT_FOR_KISIB)) : ''}`
        : `<div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button><button data-action="real-release-standing" data-act="${e(p.act)}">Check it as anyone would</button></div>`;
  return `<section class="card proposal-status" data-proposal="${e(p.act)}"><h3>${what} <span class="small">act ${fp(p.act)}</span></h3>
<p class="small">${p.standing.signed.length} of ${p.signers.length} signed; ${p.kind === 'release' ? `it counts with ${p.needed}` : 'every one must sign'}.</p>
<table class="signers"><tr><th>Member</th><th>Signed</th><th></th></tr>${p.signers.map(row).join('')}</table>
${next}<div class="here" data-here-proposal="${e(p.act)}" role="status" aria-live="polite"></div></section>`;
}

/** Said where a member change waits for its rotation (`src/real.ts`, WAIT_FOR_KISIB). */
export const WAIT_FOR_KISIB =
  'Every signature is in. The rotation that declares this change needs the chain key, rebuilt from enough members’ paper shares: that is Kišib’s work, not Edubba’s, and Kišib is not built yet. Until then the change waits, signed and not in force.';

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
<p class="small">Each is shown once, to its member, here: written on paper, then three words typed back, then forgotten. They wait in this program’s memory only: if it stops, they are lost.</p>
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

/** A real collective founded here: who it is, its proposals, a member change, a release. */
export function realDetails(s: State, id: string, c: RealCollective): string {
  const col = s.collectives.find((x) => x.id === id)!;
  const mine = s.proposals.filter((p) => p.collective === id && p.kind !== 'founding');
  return `<div class="head"><h2>${e(col.name)}</h2><span class="id">${grouped(id)}</span>${copyButton(id)}<span class="tag">real</span></div>
<div class="row"><button data-action="constitution">Its constitution, in plain words</button></div>
${foldCard('e-real-members', 'collective-members', `Its members (${c.members.length})`, `<ul class="plain">${c.members.map((m) => `<li>${person(s, m)}${m === c.holder ? ' <span class="small">holds its signing key, here</span>' : ''}</li>`).join('')}</ul>
<p class="small">Its chain key: one share per member, kept on paper, any ${c.threshold} rebuilding it. Dealing fingerprint <code>${e(c.fingerprint.match(/.{1,4}/g)!.slice(0, 8).join(' '))}</code>. No app holds a share.</p>
${c.pending ? note('warn', 'A member change was rotated and waits for its homes to count it.') : ''}`)}
${sharesHere(s, id, c.toShow)}<div id="e-shares-here"></div>
<div id="e-perms"><p class="small">Reading its agreement in force…</p></div>
${mine.map((p) => proposalStatus(s, p)).join('')}
${foldCard('e-real-change', 'collective-change', 'Change its members', `<form id="real-change" data-collective="${e(id)}">
<p class="small">Tick who is a member after the change. Every member whose voice remains signs it, and each joining member, each in their own app; then it waits for Kišib.</p>
<div class="picks">${c.members.map((m) => `<label class="check"><input type="checkbox" name="member" value="${e(m)}" checked> ${person(s, m)}</label>`).join('')}</div>
${contactPicks(s, [], c.members)}
<label>Or by ID, one per line</label><textarea name="typed" spellcheck="false"></textarea>
<div class="row"><button type="submit">Review the change</button></div></form>`, false)}
${foldCard('e-real-release', 'collective-release', 'A release', `<form id="real-release" data-collective="${e(id)}">
<p class="small">Published by the collective, from a folder chosen now (a git folder: what git tracks; a plain folder: every file but hidden ones). It counts once enough members sign it, each in their own app.</p>
<label>The folder</label><div class="row"><input name="folder" type="text" class="grow" required spellcheck="false" autocomplete="off"><button type="button" data-action="pick-folder" data-target="real-release">Choose a folder…</button></div>
<div class="row"><label>Its name <input name="name" type="text" class="pet"></label><label>Its version <input name="version" type="text" class="narrow" required></label></div>
<div class="row"><button type="submit">Review the release</button></div></form>`)}
<div id="e-real-review"></div>
<h3>Its posts</h3><div id="e-posts"><p class="small">Reading…</p></div>`;
}
