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
import { STYLE as DUB } from '../../../dub/src/page/view.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { AgentDetails, AgentSummary, AgentView, Constitution, Done, DraftView, Item, Line, MachineState, Permissions, Sorted, State } from './api.ts';
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
.colroot input.wide{width:100%}`;

/** A fingerprint, shortened on screen, whole on hover. */
export function fp(h: string): string {
  return `<code title="${e(h)}">${e(h.slice(0, 8))}…${e(h.slice(-4))}</code>`;
}

/** A name as the program gives it, without the fingerprint it appends: the fingerprint is shown beside it. */
const bare = (n: string | null | undefined) => (n ?? '').replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '');

const grouped = (id: string) => e(id.match(/.{1,4}/g)!.join(' '));

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

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
      entry({ action: 'pick-collective', key: 'collective', id: c.id, current: c.id === selected, title: c.name, meta: `${c.members} member${c.members === 1 ? '' : 's'}${c.closed ? ' · ended' : ''}` }),
    )
    .join('')}<button class="entry add" data-action="pick-collective" data-id="found">+ Found a collective</button></div>`;
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

<section class="card" id="e-terms-card"><h3>Its terms${a.terms ? ` <span class="small">act ${fp(a.terms.act)}</span>` : ''}</h3>${a.terms ? lines(a.terms.words.map((text) => ({ text }))) : '<p class="small">Not signed.</p>'}
<div class="switch" role="group" aria-label="Answering"><span>Answering</span> ${switchB(true, 'On')}${switchB(false, 'Off')}</div>
<p class="small">${a.on ? `On: ${e(owner || 'its owner')}’s own messages and public acts to it are answered at once; others wait in its queue until you pick them.` : 'Off: nothing is answered and no call is made.'}</p></section>

<section class="card" id="e-queue"><h3>Its queue: acts to pick from (${a.notified.length})</h3>
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
<div class="row"><button data-action="machine-look">Look now for what it received</button></div></section>

<section class="card" id="e-nudge"><h3>Nudge it</h3>
<form id="machine-nudge"><p class="small">A public act of yours naming it, with a number of actions: it may then answer anyone, comment on its feed, post, or write to you, up to that number, each naming your nudge. It chooses.</p>
<div class="row"><label>Actions <input name="count" type="number" min="1" max="20" value="1" required class="narrow"></label></div>
<label>Your words with the nudge (optional, public)</label><textarea name="context"></textarea>
<div class="row"><button type="submit">Nudge</button></div></form></section>

<section class="card" id="e-cap"><h3>Its cap and its key</h3>
<form id="machine-cap" class="row"><label>Calls to Claude a day <input name="callsPerDay" type="number" min="0" max="1000" value="${a.callsPerDay}" class="narrow"></label>
<label>Each answer at most <input name="maxChars" type="number" min="50" max="20000" value="${a.maxChars}" class="narrow"> characters</label><button type="submit">Save the cap</button></form>
<p class="small">Calls today: ${a.callsToday} of ${a.callsPerDay}.</p>
<p class="small">${keyLine}. The key is never shown here beyond its last four characters.</p>
<form id="agent-key"><div class="switch" role="radiogroup" aria-label="Its key"><label class="check"><input type="radio" name="own" value="shared"${a.key.kind === 'own' ? '' : ' checked'}> The shared key</label><label class="check"><input type="radio" name="own" value="own"${a.key.kind === 'own' ? ' checked' : ''}> A key of its own</label></div>
<input name="key" type="password" autocomplete="off" spellcheck="false" placeholder="Its own key, if it has one">
<div class="row"><button type="submit">Save its key</button></div></form></section>

<h3>Drafts from Claude for it (${mine.length})</h3>
<div class="row"><button class="quiet" data-action="drafts">Look for new drafts now</button><span class="small" id="drafts-watch" role="status" aria-live="polite">${WATCHING}</span></div>
<div id="drafts">${mine.map(draft).join('') || '<p class="empty small">No draft is waiting for it.</p>'}</div>

<details class="card"><summary>What it did (${a.history.length})</summary>${history(a.history)}</details>

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

/** Before a witness act is signed: what it does, in plain words (Identity rule 18c). */
export function witnessAsk(identity: string, act: string): string {
  return `${note('', `${e(WITNESS_EXPLANATION)}<br>Act ${fp(act)}.`)}
<div class="row"><button class="primary" data-action="witness-sign" data-identity="${e(identity)}" data-act="${e(act)}">Sign the witness act</button> <button data-action="witness-cancel" data-identity="${e(identity)}">Cancel</button></div>`;
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
  return `<div class="head"><h2>${e(i.name)}</h2><span class="id">${grouped(i.id)}</span>${copyButton(i.id)}</div>
<div class="card" data-identity="${e(i.id)}">
<dl class="facts"><dt>This desk's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? '')}</code>` : ''}</dd></dl>
${linkSwitch(i.id, i.linked)}
<div class="here" data-here="${e(i.id)}" role="status" aria-live="polite"></div></div>
<h3>Drafts from Claude (${mine.length})</h3>
<div class="row"><button class="quiet" data-action="drafts">Look for new drafts now</button><span class="small" id="drafts-watch" role="status" aria-live="polite">${WATCHING}</span></div>
<div id="drafts">${mine.map(draft).join('') || '<p class="empty small">No draft is waiting for it.</p>'}</div>
<h3>What it received</h3>
<div class="row"><button data-action="refresh" data-identity="${e(i.id)}">Look for what it received</button></div>
<div class="here" data-here-received="${e(i.id)}" role="status" aria-live="polite"></div>
${piles}
<details class="card"><summary>What you answered for it (${answered.length})</summary>${history(answered)}</details>`;
}

/** Drafts naming an identity this desk does not hold: shown so nothing waits unseen. */
export function strayDrafts(s: State, drafts: DraftView[]): string {
  const stray = drafts.filter((d) => !s.identities.some((i) => i.id === d.signer));
  return stray.length ? `<h3>Drafts for no identity held here (${stray.length})</h3>${stray.map(draft).join('')}` : '';
}

export function newIdentity(): string {
  return `<h2>A new identity</h2><section class="card"><form id="new-identity"><label>Its name, kept on this Mac</label><input name="name" type="text" placeholder="A name" required>
<label class="check"><input name="linked" type="checkbox"> Claude may prepare drafts for it</label>
<div class="row"><button type="submit" class="primary">Make it</button></div></form>
<p class="small">A test identity is born at the homes named in Settings, with its acts and its inbox at the relays, and the encryption key its signing key's words carry. If Claude may prepare drafts for it, its name and fingerprint are written to the drafts folder, so Claude can name it.</p></section>`;
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
  return `<div class="head"><h2>${e(c.name)}</h2><span class="id">${grouped(c.id)}</span>${copyButton(c.id)}</div>
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

/** "+ Found a collective": the collective client's founding form, the members held here, a release under one's own name. */
export function foundCollective(): string {
  return `<h2>Found a collective</h2><div class="colroot" data-collective-root id="e-col-root"><div id="status"></div><div id="review"></div>
<section class="card"><h3>Its founding</h3><div id="found"></div></section>
<section class="card"><h3>Members held here</h3><p class="small">Yourself, and the simulated members a test collective needs: held in the collective client's folder.</p><div id="identities"></div></section>
<details class="card"><summary>A release under your own name</summary><div id="own-release"></div></details></div>`;
}

const STATE_WORDS = { yes: 'You may', 'with others': 'With others’ signatures', no: 'Not now' };

/** What this user may do for the collective, each permission naming the rule it rests on. */
export function permissions(p: Permissions): string {
  return `<section class="card" id="e-may"><h3>What you may do for it</h3>
${p.notes.length ? lines(p.notes) : ''}
${p.items
  .map((i) => `<div class="item" data-may="${e(i.what)}"><div class="row tight"><strong>${e(i.what)}</strong><span class="grow"></span>${i.byAgreement ? `<span class="state">By its agreement: ${STATE_WORDS[i.byAgreement]}</span><span class="state no">· now: ${STATE_WORDS[i.state]}</span>` : `<span class="state ${i.state === 'no' ? 'no' : ''}">${STATE_WORDS[i.state]}</span>`}</div>${lines(i.lines)}</div>`)
  .join('')}
${p.agreement ? `<p class="small">As its agreement in force ${fp(p.agreement)} says, read by Agreements from its relays and homes.</p>` : ''}</section>`;
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
