// Edubba's page parts, as HTML strings: the forms and readings kept from
// before the kit (round 4 keeps their screens inside the kit's panes,
// `view.ts`). Formerly the whole page (F333; called MOR Identities until 16
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
import { cardWords } from '../../../genesis/src/card-words.ts';
import { proposal as dubProposal, share as dubShare, SIGNING_LABEL } from '../../../dub/src/page/view.ts';
import type { Proposal as MemberProposal, ShareShown } from '../../../dub/src/shapes.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { Listing } from '../folders.ts';
import type { ActRead, RealCollective, RealProposal, ShareHere, AgentDetails, AgentSummary, AgentView, Constitution, Done, DraftView, IdentityRecord, Item, Line, MachineState, Permissions, Sorted, State } from './api.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';
import { shownAct, shownId } from '../../../genesis/src/shown.ts';
import { GRID_STYLE } from './grid-view.ts';
import { actId, contactsButtonFor, idForm, who } from '../../../kit/src/ids.ts';

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
/** Where Edubba keeps a name or a contact: on the Mac, its folder; on the web, this browser's storage. */
const kept = () => (WEB ? 'kept in this browser' : 'kept on this Mac');

/** Said where the web client keeps an identity's keys (as Dub's web client says it, `KEPT_SAY`). */
export const WEB_KEPT_SAY =
  'Its signing key and its encryption key are kept in this browser’s storage (IndexedDB, for this site only), as they are, not locked: the only lock this page could put on them is one it could open by itself, and so could whatever else runs in this page. Never bring a real identity here.';


/** Said under the prompt box (src/agents.ts, PROMPT_SAY). */
export const PROMPT_SAY =
  'What you type here is an act: a private message from your identity to this agent, sealed so only it can open it, signed and kept. It answers at once, privately, under its terms.';

/** Said where the key is plugged in (src/agents.ts, KEY_SAY). */
/** Said wherever the present test mode is offered (`src/real.ts`, TEST_MODE_SAY), word for word. */
export const TEST_MODE_SAY =
  'Test mode: every member is held in this Edubba, and their consent is simulated: you decide for all of them. The shares of its chain key are kept in this Edubba’s folder. For trying things alone, and for the tests: nobody else is asked, and nothing it signs binds anyone but you.';

/** Said beside "+ Found a real collective" (H27; `src/real.ts`, REAL_SAY), word for word. */
export const REAL_SAY =
  'A real collective: each member is a person with their own identity, on their own device. Each reads the founding in plain words and signs it in their own Edubba (To sign, on a computer or on the web). Its chain key is dealt as one share per member, written on paper; no app keeps a share.';

export const KEY_SAY =
  'The key goes from this page to the program once, and is kept in a file on this Mac that only your account can read (~/.config/mor). This page never holds it again: it is shown by its last four characters only.';

/**
 * The forms and readings kept from before the kit, drawn inside the kit's
 * panes in a box of class `e-in`: their own classes (card, item, row,
 * small, note, tag, primary…) restyled with the kit's colours and lines,
 * scoped there so the kit's own pieces are never touched. Also the grid's
 * and the long-form reader's, and the collective client's kept screens.
 */
export const PARTS_STYLE = `${GRID_STYLE}
${TEXT}
.e-in{--line:var(--k-line);--edge:var(--k-edge);--bg:var(--k-bg);--raise:var(--k-raise);--text:var(--k-text);--soft:var(--k-soft);--faint:var(--k-faint);--bad:var(--k-bad);--tint:var(--k-p);--identity:var(--k-id);--envelopes:var(--k-soft);--warn:var(--k-c);font-size:14.5px;overflow-wrap:anywhere;min-width:0}
.e-in h2{font-size:20px;margin:8px 0 6px}.e-in h3{font-size:16px;margin:6px 0}.e-in h4{font-size:14px;color:var(--k-soft);margin:14px 0 6px}
.e-in .small{font-size:13px;color:var(--k-soft)}.e-in .grow{flex:1}
.e-in .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0}.e-in .row.tight{margin:2px 0}
.e-in button{display:inline-flex;align-items:center;gap:6px;padding:6px 15px;border:1px solid var(--k-edge);border-radius:999px;font-size:14px;color:var(--k-text)}
.e-in button.primary{background:var(--k-p);border-color:var(--k-p);color:var(--k-ink);font-weight:400}
.e-in button.quiet,.e-in button.copy{border-color:transparent;color:var(--k-soft);padding:4px 8px}
.e-in table.grid button.box{padding:0;justify-content:center;border-radius:6px}
.e-in .card,.e-in .proposal,.e-in .review{border:1px solid var(--k-line);border-radius:14px;padding:14px 16px;margin:10px 0;background:none}
.e-in .card.review,.e-in .review{background:var(--k-wash);border-color:transparent}
.e-in .item{border-top:1px solid var(--k-line);padding:10px 2px;margin:0}
.e-in .item:first-child{border-top:0}
.e-in .meta{font-size:12.5px;color:var(--k-faint)}
.e-in ul{margin:6px 0;padding-left:1.1em}.e-in li{margin:3px 0}
.e-in li.bad,.e-in .bad{color:var(--k-bad)}.e-in li.warn{color:var(--k-soft)}.e-in li.ok{color:var(--k-text)}
.e-in ul.plain{list-style:none;padding-left:0}
.e-in .note{margin:8px 0;padding:8px 12px;border-left:2px solid var(--k-line);color:var(--k-soft)}
.e-in .note.error{border-left-color:var(--k-bad);color:var(--k-text)}.e-in .note.done{border-left-color:var(--k-p);color:var(--k-text)}.e-in .note.warn{border-left-color:var(--k-c)}
.e-in .tag,.e-in .label{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--k-soft);border:1px solid var(--k-line);border-radius:5px;padding:1px 6px;margin-right:6px}
.e-in .tag.bad,.e-in .flag{color:var(--k-bad);border-color:var(--k-bad)}
.e-in code,.e-in .fp,.e-in .id{font:12px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id)}
.e-in .plain{border:1px solid var(--k-line);border-radius:10px;padding:10px 12px;margin:6px 0 12px;max-height:24em;overflow:auto;white-space:pre-wrap;background:var(--k-bg)}
.e-in .digest{font:12px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-faint)}
.e-in .words{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5em,1fr));gap:6px 14px;margin:12px 0;padding:14px;border:1px solid var(--k-edge);border-radius:14px;font:14.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;background:var(--k-raise)}
.e-in .words b{display:inline-block;min-width:2em;color:var(--k-faint);font-weight:400}
.e-in .say{padding-left:1.1em;color:var(--k-soft);font-size:13.5px}
.e-in label.check{display:inline-flex;gap:8px;align-items:center;margin:4px 14px 4px 0;color:var(--k-text);font-size:14px}
.e-in input.narrow{width:7em}.e-in input.pet{max-width:14em}
.e-in .picks{display:flex;flex-direction:column;gap:2px;margin:6px 0;max-height:16em;overflow:auto}
.e-in table.signers,.e-in .colroot table{border-collapse:collapse;width:100%;font-size:14px;margin:8px 0}
.e-in table.signers :is(th,td),.e-in .colroot :is(th,td){text-align:left;padding:5px 8px;border-bottom:1px solid var(--k-line);vertical-align:top}
.e-in table.signers th,.e-in .colroot th{font-weight:400;color:var(--k-faint);font-size:12px}
.e-in .state{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--k-soft)}.e-in .state.no{color:var(--k-faint)}
.e-in details.fold>summary{display:flex;align-items:baseline;gap:12px;cursor:pointer;list-style:none}
.e-in details.fold>summary::-webkit-details-marker{display:none}
.e-in details.fold>summary h3{margin:0;flex:1}
.e-in details.fold[open]>summary{margin-bottom:8px}
.e-in details.fold>summary .hint::after{content:"Unfold";color:var(--k-faint);font-size:12.5px}
.e-in details.fold[open]>summary .hint::after{content:"Fold"}
.e-in details>summary{cursor:pointer;color:var(--k-soft)}
.e-in .experimental{border:1px solid var(--k-c);border-radius:12px;padding:8px 12px;margin:8px 0;font-size:13.5px;color:var(--k-soft)}
.e-in .experimental strong{color:var(--k-text);font-weight:400;margin-right:6px}
.e-in .files{max-height:22em;overflow:auto;border:1px solid var(--k-line);border-radius:10px}
.e-in .picker li{display:flex;gap:10px;align-items:baseline;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--k-line);list-style:none}
.e-in .picker ul{padding:0;margin:8px 0;max-height:50vh;overflow:auto}
.e-in .picker .path{font:13px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id);white-space:pre-wrap}
.e-in fieldset{border:1px solid var(--k-line);border-radius:10px;margin:8px 0;padding:8px 12px}
.e-in legend{font-size:13px;color:var(--k-soft)}
.e-in .colroot .grid{display:grid;grid-template-columns:max-content 1fr;gap:6px 12px;align-items:center}
.e-in .colroot .area{border-top:1px solid var(--k-line);margin-top:10px}
.e-in .colroot input[type=number]{width:6em}
.e-in .typed{display:flex;gap:10px;flex-wrap:wrap}.e-in .typed label{flex:1;min-width:8em}
.e-in dl.facts,.e-in dl.card-of{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:6px 0}
.e-in dl.facts dt,.e-in dl.card-of dt{color:var(--k-faint)}.e-in dl dd{margin:0}
.e-in label.share{display:flex;align-items:center;gap:10px}.e-in label.share input{width:8em}`;

/** An act's ID, short (H121): a button, one tap shows it whole (`mact1…`), a second copies it. */
export function fp(h: string): string {
  return /^[0-9a-f]{64}$/.test(h) ? actId(h) : `<code>${e(h)}</code>`;
}

/** A name as the program gives it, without the fingerprint it appends: the fingerprint is shown beside it. */
const bare = (n: string | null | undefined) => (n ?? '').replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '');

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

// ---------------------------------------------------------------- the frame

export type Tab = 'agents' | 'collectives' | 'publishing' | 'identities' | 'settings';

// ---------------------------------------------------------------- the lists on top

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

/** "MOR as seen by this agent" (F333): a view, not a tab, with a way back. */
export function agentView(name: string, v: AgentView): string {
  return `<div class="row"><button data-action="agent-back">← Back to ${e(name)}</button></div>
<h2>MOR as seen by ${e(name)}</h2>
<p class="small">What it reads: what is sent to it, and its feed (its own posts and those it follows). Under a nudge, Claude is given its feed too.</p>
<section class="card"><h3>Those it follows (${v.follows.length})</h3>
<p class="small">Kept here, private (the people cMIP): never published.</p>
${v.follows.length ? `<ul class="plain">${v.follows.map((f) => `<li>${f.name ? `${e(f.name)} ` : ''}${who({ id: f.id, inline: true })} <button class="quiet" data-action="agent-unfollow" data-id="${e(f.id)}">Unfollow</button></li>`).join('')}</ul>` : '<p class="empty small">Nobody yet.</p>'}
<form id="agent-follow" class="row"><input name="who" type="text" class="grow" placeholder="An identity's ID" required>${contactsButtonFor('who')}<input name="name" type="text" placeholder="A name for it (kept here)" class="pet"><button type="submit">Follow for it</button></form></section>
<h3>Its feed</h3>
${v.problems.map((p) => `<p class="small">${e(p)}</p>`).join('')}
${
  v.feed
    .map(
      (p) => `<div class="post"><div class="who"><span class="name">${e(bare(p.signerName.replace(/ \(itself\)$/, '')))}${p.signerName.endsWith('(itself)') ? ' <span class="you">itself</span>' : ''}</span>${who({ id: p.signer, inline: true })}${p.standing === 'valid' ? '' : `<span class="flag bad">${e(p.standing)}</span>`}</div><div class="text" dir="auto">${e(p.text)}</div>${p.pictures
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

type Held = State['identities'][number];

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
  return `<form id="${e(id)}" data-identity="${e(identity)}" class="money"><label>To: an identity’s ID</label><div class="row tight"><input name="to" type="text" class="grow" value="${e(to)}" autocomplete="off" spellcheck="false" required>${contactsButtonFor('to')}</div>
<div class="row"><label>Amount, in the unit’s smallest part <input name="value" type="text" inputmode="numeric" class="narrow" required></label><label>Unit <select name="unit" data-units></select></label></div>
<label>What for (optional)</label><input name="whatFor" type="text">
<p class="small">${e(MONEY_SAY)}</p><div class="row"><button type="submit">Prepare it for Damgar</button></div></form>`;
}

/** F338: money for a real collective, from the identity acting here: paying a member; Bitcoin anchoring of one of its acts, an option only. Never its releases (Ummia's, F339). */
export function realMoney(s: State, id: string, members: string[]): string {
  const acting = s.acting ?? '';
  return `${foldCard('e-real-pay', 'collective-pay', 'Pay a member (prepared for Damgar)', `<p class="small">From ${e(s.identities.find((i) => i.id === acting)?.name ?? 'the identity acting here')}: your own payment, never the collective’s (collective payments are round 2).</p>
<div class="row">${members.filter((m) => m !== acting).map((m) => `<button type="button" data-action="pay-member" data-member="${e(m)}">${e(nm(s, m) || 'A member')}</button>`).join('')}</div>${payForm('pay-member', acting)}`, false)}
${foldCard('e-real-anchor', 'collective-anchor', 'Anchor one of its acts on Bitcoin (optional)', `<ul class="say">${ANCHOR_SAY.map((t) => `<li>${e(t)}</li>`).join('')}</ul>
<form id="anchor-offers" data-collective="${e(id)}"><label>The act</label><select name="act" data-anchorable="${e(id)}"></select>
<label>The anchoring service: its ID</label><div class="row"><input name="service" type="text" class="grow" autocomplete="off" spellcheck="false" required>${contactsButtonFor('service')}<button type="submit">Read its offer</button></div></form>
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
  return xs.length ? xs.map((x) => `<div class="item"><span class="tag">${e(x.state)}</span> ${e(x.label)} ${fp(x.act)} <span class="small">by ${who({ id: x.service, inline: true })}, tier ${x.tier}</span>${lines(x.lines)}</div>`).join('') : '<p class="empty small">None asked yet.</p>';
}

export function newIdentity(): string {
  if (WEB) return bringIdentityWeb();
  return `<section class="card"><h3>Make a new identity</h3><form id="new-identity"><label>Its name, kept on this Mac</label><input name="name" type="text" placeholder="A name" required>
<div class="row"><button type="submit" class="primary">Make it</button></div></form>
<p class="small">A test identity is born at the homes named in Settings, with its acts and its inbox at the relays, and the encryption key its signing key's words carry.</p></section>
<section class="card"><h3>Bring an identity you have</h3>
<p class="small">Its ID and its signing key’s words, as Dub shows them (“Show the signing key’s words”). Edubba reads it from its homes and keeps it only if the words give its current signing key. Nothing is signed or published by bringing it.</p>
<form id="bring-identity"><label>Its name, kept on this Mac</label><input name="name" type="text" placeholder="A name" required>
<label>Its ID</label><div class="row tight"><input name="id" type="text" class="grow" autocomplete="off" spellcheck="false" required>${contactsButtonFor('id')}</div>
<label>Its signing key’s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes; empty: the homes and relays in Settings)</label><input name="address" type="text" placeholder="https://">
<p class="small">Never type the chain key’s words here: they belong to Kišib, the app where a change of keys is done, and to paper. Whoever holds the signing key’s words can sign as this identity and read its private messages: Edubba keeps them in its folder, as every key here.</p>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>`;
}

/** On the web, the one door: bring an identity you have (no identity is made here, as in Damgar's and Ummia's web clients). */
function bringIdentityWeb(): string {
  return `<h2>Bring an identity you have</h2><section class="card">
<p class="small">Its ID and its signing key’s words, as Dub shows them (“Show the signing key’s words”). Edubba reads it from its homes and keeps it only if the words give its current signing key. Nothing is signed or published by bringing it. A new identity is made in Dub, or in Edubba on a computer.</p>
<form id="bring-identity"><label>Its name, kept in this browser</label><input name="name" type="text" placeholder="A name" required>
<label>Its ID</label><div class="row tight"><input name="id" type="text" class="grow" autocomplete="off" spellcheck="false" placeholder="mid1…" required>${contactsButtonFor('id')}</div>
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

// ---------------------------------------------------------------- collectives


/** "+ Bring an existing collective" (H15): by its ID, read from its homes, one of your identities among its members. */
export function bringCollective(): string {
  return `<h2>Bring an existing collective</h2><section class="card"><form id="bring-collective">
<label>Its ID</label><div class="row tight"><input name="id" type="text" class="grow" autocomplete="off" spellcheck="false" required>${contactsButtonFor('id')}</div>
<label>A name for it, ${kept()}</label><input name="name" type="text" required>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form>
<p class="small">Edubba reads it from the homes and relays in Settings: its chain, and its agreement in force as Agreements read it. It is brought only if one of your identities held here (or in the collective client’s folder) is among the parties of that agreement. Edubba holds none of its keys: nothing is signed for it by bringing it, and nothing can be signed with its key here.</p></section>`;
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
  { text: 'If this device were compromised, or the person holding it dishonest, they could keep the key and later act alone, past the threshold the members agreed: the trusted-dealer weakness (F337; the air-gapped signer Module’s stated price). Nothing can prove a device forgot a key. Kišib’s rotations of the collective have the same moment, on the starter’s device.', tone: 'bad' },
  { text: 'So found on the cleanest device you have: this app rather than any web page, ideally a computer used for nothing else. Making the key jointly, never whole anywhere, is not practical yet for the signature the chain key uses: a MOR 2 research item.', tone: 'warn' },
  { text: 'The practices Edubba follows: the key alive only in memory, dealt at once and overwritten, never written anywhere; each member’s share sealed to the one-time key their own Dub made; the shares to show here (yours, and any hand to hand) held in memory for one hour at most, then overwritten and lost: show them in one sitting, within the hour.' },
  { text: 'Afterwards every member writes their share on paper. A later change of members, or of the collective’s keys, is done in Kišib, from those papers.' },
];

/** Said where a correction is written (src/corrections.ts, CORRECTION_SAY), word for word. */
export const CORRECTION_SAY =
  'A correction is a new post naming the old one, labelled “Correction”. The old post stays as it was signed, shown with “corrected by”: nothing on MOR is changed or deleted. Apps that do not know the corrections cMIP show an ordinary post naming the old one.';

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
    `<div class="item"><span class="small">${KIND_WORDS[n.kind]}${n.kind === 'person' ? ` ${e(bare(n.aboutName))} ${n.about ? who({ id: n.about, inline: true }) : ''}` : ''} · ${fp(n.id)}${n.dropped ? ` · dropped${n.dropped.by === 'owner' ? ' at your request' : ' by it'}${n.dropped.why ? `: ${e(n.dropped.why)}` : ''}` : ''}</span><div class="text" dir="auto">${e(n.text)}</div>${
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
<div class="row"><label>Until <input name="until" type="datetime-local"></label><label class="grow">by the timestamp clock <input name="clock" type="text" placeholder="its ID (64 hex digits)" spellcheck="false"></label>${contactsButtonFor('clock')}</div>
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
  works: { publication: string; offer: string; as: string; member: string; collective: boolean; media: 'text' | 'picture' | 'video' | 'audio'; title: string; price: number; words: string; at: number; delivered: Record<string, string>; toMembers: string | null }[];
  vows: { vow: string; offer: string; as: string; collective: boolean; words: string; title: string; price: number; at: number; deal?: string | null; shares?: [string, number][] | null }[];
  /** Plain posts shared under a deal (this round). */
  posts?: { post: string; deal: string; as: string; text: string; shares: [string, number][]; at: number }[];
  /** The deals set up here (this round): waiting for signatures, or announced. */
  deals?: { id: string; version: string; kind: 'work' | 'vow' | 'post'; title: string; payee: string; service: string; shares: [string, number][]; referral: number; state: 'waiting' | 'announced'; signed: string; post: string | null; offer: string | null; at: number }[];
  /** The deal's own payee the next deal will take: its ID, to give the split service (`mor-split-service key ID`). */
  dealPayee?: string | null;
  sharesSay?: string[];
  held: string[];
  say: string[];
  unit: string;
}

/** A look-up of one identity's vow sales (round 3): each vow, each sale's state; those bought by an identity held here may be contested here. */
export interface VowSalesShown {
  vows: { name: string; signer: string; void: boolean; words: string[]; sales: { act: string; buyer: string; state: string; why?: string | null; promise: string | null; amount: { unit: string; value: number } | null; beside?: { state: 'shown' | 'unknown'; contests: { act: string; promise: string | null }[]; why?: string } }[]; unsigned: number; unknown?: number; mine: string[] }[];
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
                  (x) => `<li class="${x.state === 'confirmed' ? 'ok' : x.state === 'contested' ? 'bad' : ''}">${e(names(x.buyer))}: <strong>${e(x.state)}</strong>${x.state === 'unknown' && x.why ? ` (${e(x.why)})` : ''}${x.promise ? ` (“${e(x.promise)}”)` : ''}${x.amount ? ` · ${x.amount.value.toLocaleString('en')}` : ''}${
                    v.mine.includes(x.act) && x.state === 'pending'
                      ? `<form class="pub-contest row" data-vow="${e(v.name)}" data-sale="${e(x.act)}" data-buyer="${e(x.buyer)}"><input name="promise" placeholder="What was not kept (optional)" maxlength="280"><button type="submit">Contest it, as ${e(names(x.buyer))}</button></form>${x.amount ? `<button data-action="pub-confirm-sale" data-vow="${e(v.name)}" data-sale="${e(x.act)}" data-buyer="${e(x.buyer)}" data-seller="${e(v.signer)}" data-unit="${e(x.amount.unit)}" data-value="${x.amount.value}">Confirm: it was kept, as ${e(names(x.buyer))}</button>` : ''}<span class="small">Confirming prepares your claim of the payment, acknowledging the vow, for Damgar to sign (a Money act): it waits in Damgar’s To sign.</span>`
                      : ''
                  }</li>`,
                )
                .join('')}</ul>`
            : '<p class="small">No sale seen: nobody signed onto it at the relays asked, so it carries no state (rule 13).</p>';
          return `<div class="item"><h3>${e(v.words[0] ?? '')}</h3><div class="meta">${v.void ? 'its first act void (its signer’s change of keys): the name stands · ' : ''}${counts.confirmed} confirmed · ${counts.contested} contested · ${counts.pending} pending${counts.unknown ? ` · ${counts.unknown} unknown` : ''}${v.unsigned ? ` · ${v.unsigned} paid with no buyer signed on` : ''}${v.unknown ? ` · ${v.unknown} payment${v.unknown === 1 ? '' : 's'} unknown (no rail answer here)` : ''}</div>${sales}</div>`;
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
          (w) => `<div class="item" data-work="${e(w.publication)}"><h3>${e(w.title)}</h3><div class="meta">${w.media === 'picture' ? 'a picture' : 'a text'} · ${w.price.toLocaleString('en')} ${e(p.unit)} · ${w.collective ? `by the collective ${who({ id: w.as, collective: true, inline: true })}` : 'by yourself'} · ${new Date(w.at * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC</div>
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
<details class="judged"><summary>Judge the referral: paid by a split service (optional)</summary><p class="small">${e(JUDGED_SAY)}</p>
<label>The split service: its ID</label><div class="row tight"><input name="service" type="text" class="grow" autocomplete="off" spellcheck="false">${contactsButtonFor('service')}</div>
<label>The key the service made for you (64 hexadecimal characters)</label><input name="serviceKey" type="text" autocomplete="off" spellcheck="false"></details>
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
${p.vows.length ? `<h3>Vows published here</h3>${p.vows.map((v) => `<div class="item"><h3>${e(v.title)}</h3><div class="meta">${v.price.toLocaleString('en')} ${e(p.unit)} · ${v.collective ? `by the collective ${who({ id: v.as, collective: true, inline: true })}` : 'by yourself'}</div><p class="small">${e(v.words)}</p></div>`).join('')}` : ''}</div>
<div class="card"><h2>Look up an identity’s vow sales</h2>
<p class="small">Asked of the relays you name, with the filters they already have: no index is kept. A sale shows where its buyer made it public.</p>
<form id="pub-vow-sales" class="stack"><label>The identity (mid1… or hex)</label><div class="row tight"><input name="identity" type="text" class="grow" autocomplete="off" spellcheck="false" value="${e(p.as ?? '')}">${contactsButtonFor('identity')}</div>
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

/** An identity in a real collective's lists (H96, H106, H121): its names (the nickname, the name it published, faint), its short ID under them, a button. */
export function person(_s: State, id: string): string {
  return who({ id, inline: true });
}

/**
 * One member's row (H118, as splits do it): an ID, typed, pasted, or chosen
 * from Contacts beside it; removable unless it is one of the two a
 * collective needs.
 */
export function memberRow(n: number, value: string, removable: boolean): string {
  return `<div class="member-row row tight" data-member-row="${n}"><input name="member-${n}" data-member-id value="${e(value)}" spellcheck="false" autocomplete="off" placeholder="mid1…, or a contact" aria-label="Member ${n}">${contactsButtonFor(`member-${n}`)}${removable ? `<button type="button" class="quiet" data-action="member-remove" aria-label="Remove member ${n}">Remove</button>` : ''}</div>`;
}

/** The members of a founding (you, and one other) or of a change (those in force): rows, then + Add a member (H118). */
export function memberRows(fid: string, founder: boolean, members: string[]): string {
  const rows = founder
    ? [`<div class="member-row" data-member-row="1"><span class="small">You, the founder chosen above</span></div>`, memberRow(2, '', false)]
    : members.map((m, i) => memberRow(i + 1, idForm(m), members.length > 2));
  return `<div class="member-rows" data-member-rows="${e(fid)}">${rows.join('')}</div><div class="row"><button type="button" data-action="member-add" data-form="${e(fid)}">+ Add a member</button></div>`;
}

/** "+ Found a real collective": the founder held here, the members from the contacts or typed, the rules; then a review. */
export function realFound(s: State): string {
  const founders = s.identities.filter((i) => !s.agents.some((a) => a.id === i.id));
  return `<h2>Found a real collective</h2>
${note('', `<strong>Real, not a test.</strong> ${e(REAL_SAY)}`)}
${WEB ? note('warn', `<strong>This is a web page.</strong> ${e(WEB_FOUNDING_SAY)}`) : ''}
${note('', 'How: each member reads the founding terms in plain words and signs on their own device, in their own Edubba (Collectives, To sign; on a computer or on the web). The collective is founded once every one has signed. Its chain key is then dealt as one share per member, kept on paper: a member’s share goes sealed to a one-time key their Edubba makes when they sign, or is shown here, hand to hand; yours is shown here once. No app keeps a share.')}
<section class="card"><form id="real-found">
<label>Its name, ${kept()}</label><input name="name" type="text" required>
<label>You: the founder, who proposes, signs first, and holds its signing key here</label><select name="founder">${founders.map((i) => `<option value="${e(i.id)}"${i.id === s.acting ? ' selected' : ''}>${e(i.name)}</option>`).join('')}</select>
<label>Its members: you, and at least one other (each by ID, or chosen from Contacts beside it)</label>${memberRows('real-found', true, [])}
<h3>Who decides what</h3>
<p class="small">Members are the columns; tap a box to give that member’s key power in that row. The constitution first, then the judges, then the areas (Agreements rules 60 and 62). Each member signs with a key of their own, made as they sign.</p>
<div id="e-grid-real-found"><p class="small">Choose the members above: the grid follows.</p></div>
<label>The words everyone signs (empty: the grid’s sentences)</label><textarea name="words"></textarea>
<div class="row"><button type="submit" class="primary">Review the founding</button></div></form></section>
<div id="e-real-review"></div>
<p class="small">Your contacts are the one list, top left (Contacts): sealed to you at your homes, the same in every app. <button class="quiet" data-action="real-lists">Read the follow lists again</button></p>`;
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
        ? `<p class="small">Founded: ${who({ id: p.founded, collective: true, inline: true })}.</p>`
        : `<div class="card"><h4>Before you found: what this device will hold</h4>${lines(FOUNDING_SAY)}<label class="check"><input type="checkbox" id="real-found-read-${e(p.act.slice(0, 12))}"> I have read what this device will hold, and found on it knowingly</label></div><div class="row"><button data-action="real-gather" data-act="${e(p.act)}">Look for answers</button><button class="primary" data-action="real-found" data-act="${e(p.act)}"${p.standing.enough && !p.standing.declined.length ? '' : ' disabled'}>Found it: deal the shares</button></div>`
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

/** How the program's refusal begins where a key held here was changed elsewhere (`src/desk.ts`, KEY_CHANGED_SAY and COLLECTIVE_KEY_CHANGED_SAY). */
export const KEY_CHANGED_START = ['This identity’s signing key was changed elsewhere', 'This collective’s signing key was changed elsewhere'];

/** The box for an identity's new signing key's words, after Kišib: in its record, and wherever a refusal says its key changed (H80). */
export function renewIdentityForm(id: string, name?: string): string {
  return `<form id="identity-renew" data-identity="${e(id)}" class="card">${note('error', e(RENEW_SAY))}<label>${name ? `${e(name)}: the` : 'The'} new signing key’s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="row"><button type="submit" class="primary">Take the new words</button></div></form>`;
}

/** The box for a collective's new signing key's words, after Kišib. */
export function renewCollectiveForm(collective: string): string {
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
  'A collective’s release is made in Ummia, the developers’ app, on a computer (the Mac, or Linux), by a member holding the area that reaches its releases, with their own key for the collective. A release proposed there is signed here, in “To sign”, and checked as anyone would.';

/** Said where a lone seller's referral is judged (F215, F351): kept equal to the reading in `../publishing.ts`. */
export const JUDGED_SAY =
  'Without a service, the referral share is a promise in words, paid by your Damgar. With one, the work gets a deal of its own, you its one party holding its whole stake, its split plan carrying the referral share off the top: the service answers buyers, signs their receipts with a key you grant it, and pays you and the reposter, as Agreements judges.';

/** Said where a collective's keepers are shown: kept to Agreements rules 36 to 44, C5 and F302. */
export const KEEPERS_SAY = [
  'A keeper is a notary the agreement names: it records each act around the collective as it arrives, in its own sequence, and signs each record. It sees act IDs and signers, never content.',
  'Before recording a member’s act, it checks their identity chain and records any rotation first: an act recorded before a rotation stays a visible dispute if that rotation disowns it, never a void (rule 41).',
];

/** A collective's keepers and disputes, as Edubba reads them (`../real.ts`, KeepersShown). */
export interface KeepersShown {
  keepers: { id: string; name: string; here: boolean; agent: boolean; records: number; ofThis: number }[];
  rule: 'all' | number | null;
  disputes: { member: string; signature: string; version: string; what: string; status: string; rotation: string | null; keepers: string[]; counts: boolean }[];
}

/** Its keepers' card and the disputes shown (a disowned signature the line or a keeper placed). */
export function keepersShown(s: State, id: string, k: KeepersShown): string {
  const keepers = k.keepers.length
    ? `<ul class="plain">${k.keepers
        .map(
          (x) =>
            `<li>${person(s, x.id)}${x.agent ? ' <span class="tag">agent here</span>' : x.here ? ' <span class="tag">here</span>' : ''}: ${x.ofThis} record${x.ofThis === 1 ? '' : 's'} of this collective’s acts.${x.here ? ` <button data-action="real-keep" data-collective="${e(id)}" data-keeper="${e(x.id)}">Record what arrived</button>` : ''}</li>`,
        )
        .join('')}</ul><p class="small">An act counts as recorded once ${k.rule === 'all' ? 'every keeper' : k.rule === 1 ? 'any one keeper' : `${k.rule} keepers`} recorded it.</p>`
    : '<p class="small">Its agreement in force names no keepers: set them with its money terms, above.</p>';
  const disputes = k.disputes.length
    ? `<h4>Disputes, not voids</h4><ul class="plain">${k.disputes
        .map(
          (d) =>
            `<li class="${d.counts || d.keepers.length ? 'warn' : 'bad'}">${person(s, d.member)}’s signature on ${e(d.what)} (${fp(d.signature)}) was disowned by their own rotation${d.rotation ? ` (${fp(d.rotation)})` : ''}: under Identity it is ${e(d.status)}. ${
              d.counts || d.keepers.length
                ? `Shown as a dispute, not a void:${d.counts ? ' the collective’s line placed it before any line registering that rotation, so the version it signed stays in force for the collective (C5);' : ''}${d.keepers.length ? ` ${d.keepers.map((x) => person(s, x)).join(', ')} recorded it before recording the rotation (rule 41).` : ''}`
                : 'Nothing placed it before the rotation: it counts for nothing.'
            }</li>`,
        )
        .join('')}</ul>`
    : '';
  return foldCard('e-real-keepers', 'collective-keepers', `Its keepers (${k.keepers.length})`, `<ul class="say">${KEEPERS_SAY.map((t) => `<li>${e(t)}</li>`).join('')}</ul>${keepers}${disputes}`, k.disputes.length > 0);
}

/** Said where a collective's money is set (round 3, part C): kept to Agreements rules 8, 16 to 23 and 67. */
export const COLLECTIVE_MONEY_SAY = [
  'Who owns its income: each member’s share, adding up to 100%. Every holder signs the stakes their share sets.',
  'A referral share, off the top of each payment, goes to whoever reposted the work where the buyer found it (optional).',
  'Its split service answers buyers for the collective, signs their receipts with a grant key of the collective, and pays each member their part. It is a separate identity, a judge: it signs to accept.',
  'Keepers record its acts (optional); one may be an Edubba agent.',
];

/** The card setting a real collective's money: stakes per member, a referral share, its split service and its keepers, one clone every member signs. */
export function moneyCard(s: State, id: string, c: RealCollective): string {
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
<label>Its split service: its ID</label><div class="row tight"><input name="service" type="text" class="grow" autocomplete="off" spellcheck="false" required>${contactsButtonFor('service')}</div>
<label>The key the service made for this collective (64 hexadecimal characters, as it gives it)</label><input name="serviceKey" type="text" autocomplete="off" spellcheck="false" required>
<label>Keepers (optional): their IDs, one per line</label><textarea name="keepers" spellcheck="false"></textarea><div class="row tight">${contactsButtonFor('keepers')}</div>
<label>How many keepers must record an act</label><input name="keepersNeeded" type="number" min="1" step="1" value="1">
<div class="row"><button type="submit">Review it</button></div></form>`,
    false,
  );
}
