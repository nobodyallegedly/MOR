// Ummia's page, as HTML strings, for the program and the web client alike
// (`web` set). Everything from the program, from relays or typed by the
// person is escaped.
//
// The look (H36): Dub's (F332: Inter bundled, low saturation, no glow),
// tinted with coral, #ee8b74, the Development layer's colour here, by
// Kišib's rule (`docs/kishib-report.md`): the layer colour laid over the
// background #06080c at a share, channel by channel, on separators 22%,
// outlines 30% and quiet accents 60% only, never on text that must be read;
// red only for an alarm (a check that fails, a key changed elsewhere).

import { e } from '../../../manage/src/view.ts';
import { shownSpec } from '../../../genesis/src/shown.ts';
import { STYLE as DUB_STYLE } from '../../../dub/src/page/view.ts';
import { chooserHtml } from '../acting.ts';
import type { AcceptedEntry, Line, Review, State } from '../shapes.ts';
import type { Tracked, TrackedSpec, FoundAct } from '../track.ts';
import type { MipDraft, Reply } from '../mips.ts';
import type { AnchorShown, Offer } from '../anchor.ts';

export { e };
export type { Line, State };

export const NAME = 'Ummia';
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** The web client's banner, on every page it shows: for testing only, and the risks in plain words. In the page's HTML itself (`static/web.html`). */
export const WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. The risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment you bring an identity here could copy its signing key: with it, publish specifications, MIP drafts and reports as you, and read your accepted list.</li>
<li>This browser’s storage, where that key is kept, can be lost, or read by what runs in this page.</li>
<li>What you publish here is public and for good: a specification is never updated, only succeeded. This page reads no folder, so it makes no release, and follows no chain, so it checks no anchor: use Ummia on a computer for those.</li></ol>
<p>Never bring a real identity here.</p></div>`;

/**
 * Ummia's tint (H36): coral, #ee8b74, laid over #06080c at a share, channel
 * by channel (Kišib's rule): separators 22% (#392523), outlines of cards,
 * fields and buttons 30% (#4c2f2b), quiet accents (a hover or focus
 * outline, a fold's mark, a tab's count) 60% (#91574a).
 */
export const TINT = { layer: '#ee8b74', line: '#392523', edge: '#4c2f2b', accent: '#91574a' } as const;

export const STYLE = `${DUB_STYLE}
:root{--line:${TINT.line};--edge:${TINT.edge};--tint:${TINT.accent}}
button:hover,.door:hover{border-color:var(--tint)}
input:focus,textarea:focus,select:focus{border-color:var(--tint)}
details>summary::before{color:var(--tint)}
.bar{border-bottom-color:var(--edge)}
.count{background:var(--edge)}
.card{background:var(--raise)}
.tabs{flex-wrap:wrap;min-width:0}
.bar .me{flex-shrink:0}
.item{border:1px solid var(--edge);border-radius:12px;padding:12px 14px;margin:12px 0;background:var(--raise)}
.item h3{margin:0 0 4px;font-weight:400;font-size:15px}
.item .meta{font-size:12px;color:var(--soft);overflow-wrap:anywhere}
.item ul{margin:6px 0;padding-left:1.1em;font-size:14px}
.item li{margin:3px 0}
li.bad{color:var(--bad)}
li.warn{color:var(--soft)}
.hash{font:12px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--text);overflow-wrap:anywhere;border:1px solid var(--edge);border-radius:10px;padding:8px 10px;background:var(--bg);margin:6px 0}
.v{font-size:12px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--edge);color:var(--soft)}
.v.valid{color:var(--text);border-color:var(--tint)}
.v.bad{color:var(--bad);border-color:var(--bad)}
.limit{border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:12px 0;font-size:13px;color:var(--soft)}
.files{max-height:320px;overflow:auto;border-top:1px solid var(--line);margin-top:6px;font-size:12px}
.files div{display:flex;gap:10px;justify-content:space-between;border-bottom:1px solid var(--line);padding:3px 0}
.files code{overflow-wrap:anywhere}
.ticks{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:2px 12px}
.ticks label{font-size:13px;color:var(--soft)}
textarea.spec{min-height:220px;font:13px/1.5 ui-monospace,"SF Mono",Menlo,monospace}
.picker{border:1px solid var(--edge);border-radius:12px;padding:8px 12px;margin:8px 0}
.picker button{margin:2px 4px 2px 0}
.blocking{border:1px solid var(--bad);border-radius:12px;padding:10px 14px;margin:12px 0}`;

export const note = (kind: 'error' | 'done' | 'warn' | 'spent' | '', html: string) => `<div class="note ${kind}">${html}</div>`;
export const lines = (ls: Line[]) => (ls.length ? `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>` : '');
const says = (xs: string[]) => xs.map((x) => `<p class="small">${e(x)}</p>`).join('');
const fp = (id: string) => `<span class="fp" title="${e(id)}">${e(id.slice(0, 8))}…${e(id.slice(-4))}</span>`;

function testNotice(web: boolean): string {
  return web ? '' : `<div class="banner" id="test-only">${TEST_ONLY}. The signing key is held in software in this program’s folder: a prototype, never for a real identity.</div>`;
}

export function top(web = false, back = false): string {
  return `<header class="bar"><h1 class="mark">${NAME}</h1><span class="grow"></span>${back ? '<button class="quiet" data-action="back">Back to Ummia</button>' : `<span class="small">${web ? 'web client, for testing only' : 'this machine only'}</span>`}</header>
${testNotice(web)}`;
}

export function pairing(): string {
  return `${top()}
<h2>Pair this browser</h2>
<p class="small">This page acts for the Ummia program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" class="grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit">Pair</button></form>
<div id="pair-status"></div>`;
}

// ------------------------------------------------------------------ the identity window

export function identityWindow(s: State, web: boolean): string {
  const held = s.held.length
    ? `<h2>Identities held here</h2><div class="held"><ul>${s.held.map((h) => `<li><span class="fp" title="${e(h.id)}">${e(h.short)}</span>${h.active ? '<span class="small">in use</span>' : `<button data-action="use" data-id="${e(h.id)}">Use this one</button>`}<button class="quiet" data-action="forget" data-id="${e(h.id)}">Forget it here</button></li>`).join('')}</ul></div>`
    : '';
  const i = s.identity;
  const mine = i
    ? `<section class="card"><h3>In use</h3><p class="id">${e(i.grouped)}</p>
<dl class="facts"><dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd><dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd><dt>Ummia’s line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `: its card, for Kišib, <code class="card-line">${e(i.line.latest)} ${i.line.acts} ${e(i.line.summary ?? '')}</code>` : ''}</dd></dl>
<p class="small">Some of Ummia’s acts are sealed (your accepted list, an anchor’s payment for Damgar), so Kišib cannot read its line from the homes: when the signing key is changed there, give Kišib this card (latest act, position, summary), or every act signed here becomes void (Identity rule 35).</p>
${i.encryption ? '' : note('warn', 'Ummia holds no encryption key for this identity: its accepted list cannot be read or changed here.')}
<div class="row"><button data-action="carry">Show the signing key’s words</button><button data-action="leave" class="quiet">Leave it</button><button data-action="back" class="primary">Back to Ummia</button></div>
<details><summary>Its signing key was changed elsewhere (in Kišib): take the new words</summary><form id="renew"><label>The new signing key’s 24 words</label><textarea name="words" required></textarea><div class="row"><button type="submit">Use the new words</button></div></form></details></section>`
    : '';
  return `${top(web, !!i)}
<h2>${i ? 'The identity' : 'First, an identity'}</h2>
<p class="small">Ummia never makes an identity and never holds a chain key. Bring one you have, by its ID and its signing key’s words, as in Dub: Dub’s identity window shows them (“Show the signing key’s words”).</p>
${mine}
${held}
<section class="card"><h3>Bring an identity you have</h3>
<form id="bring"><label>Its ID</label><input name="id" autocomplete="off" spellcheck="false" required>
<label>Its signing key’s 24 words (never the chain key’s)</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<details><summary>Relays, if it names none</summary><label>One per line</label><textarea name="relays"></textarea></details>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>
<div id="status"></div>`;
}

export function carry(c: { grouped: string; words: string[] }, web: boolean): string {
  return `${top(web, true)}<h2>The signing key’s words</h2>
<p class="small">With the ID, they bring this identity into Ummia, Dub, Damgar or Edubba on another device. Whoever holds them can publish as this identity and open what is sealed to it. They are not the chain key’s words.</p>
<p class="id">${e(c.grouped)}</p><div class="words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join('')}</div>
<div class="row"><button data-action="back" class="primary">Back to Ummia</button></div>`;
}

// ------------------------------------------------------------------ the app: tabs

export type Tab = 'releases' | 'specs' | 'track' | 'mips' | 'reports' | 'accepted' | 'settings';
export const TABS: [Tab, string][] = [
  ['releases', 'Releases'],
  ['specs', 'Specifications'],
  ['track', 'Tracking'],
  ['mips', 'MIPs'],
  ['reports', 'Reports'],
  ['accepted', 'Accepted'],
  ['settings', 'Settings'],
];

export function app(s: State, web: boolean, on: Tab): string {
  const i = s.identity!;
  return `<header class="bar"><h1 class="mark">${NAME}</h1>
<nav class="tabs">${TABS.map(([k, label]) => `<button class="tab${k === on ? ' on' : ''}" data-tab="${k}">${label}</button>`).join('')}</nav>
<button class="me" data-action="window" title="The identity"><span class="who"><span class="fp" title="${e(i.id)}">${e(i.short)}</span><span class="you">you</span></span></button></header>
${testNotice(web)}
<div id="spent"></div>
${chooserHtml(s.actors, s.acting)}
<div id="status"></div>
${TABS.map(([k]) => `<section id="${k}"${k === on ? '' : ' hidden'}><div id="${k}-body"><p class="empty">Reading…</p></div></section>`).join('\n')}`;
}

// ------------------------------------------------------------------ a review, before anything is signed

export function review(r: Review, confirmAction = 'confirm'): string {
  const files = r.files
    ? `<details class="fold" open><summary>Its files (${r.files.length}), each with its size and fingerprint</summary><div class="files">${r.files.map((f) => `<div><span>${e(f.path)}</span><span>${f.size} bytes</span><code>${e(f.fingerprint)}</code></div>`).join('')}</div></details>${r.skipped?.length ? `<p class="small">Left out: ${e(r.skipped.join('; '))}</p>` : ''}
<details class="fold"><summary>The libraries it depends on (${r.dependencies?.length ?? 0})</summary>${r.dependencies?.length ? `<div class="files">${r.dependencies.map((d) => `<div><span>${e(d.registry)}</span><span>${e(d.name)}</span><span>${e(d.version)}</span></div>`).join('')}</div>` : '<p class="small">None: it names no lock file (Cargo.lock, package-lock.json).</p>'}</details>`
    : '';
  return `<div class="item review" data-plan="${e(r.plan)}"><h3>${e(r.title)}</h3>
${r.hash ? `<label>Its spec hash</label><div class="hash" id="review-hash" title="${e(r.hash)}">${e(shownSpec(r.hash))}</div><p class="small">In hexadecimal: ${e(r.hash)}</p>` : ''}
${says(r.summary)}
${r.sections.map((x) => `<p class="small"><b>${e(x.heading)}</b></p>${lines(x.lines)}`).join('')}
${files}
${r.blocking.length ? `<div class="blocking"><b>It cannot be signed as it is</b>${lines(r.blocking.map((t) => ({ text: t, tone: 'bad' })))}</div>` : ''}
<p class="small">The digest of exactly what is signed: <code>${e(r.digest)}</code></p>
<div class="row">${r.blocking.length ? '' : `<button class="primary" data-action="${e(confirmAction)}" data-plan="${e(r.plan)}" data-digest="${e(r.digest)}">Sign and publish</button>`}<button class="quiet" data-action="cancel" data-plan="${e(r.plan)}">Leave it</button></div></div>`;
}

// ------------------------------------------------------------------ releases

export function releases(s: State, r: { releases: { id: string; name: string; version: string; folder: string }[]; anchors: AnchorShown[]; anchorSay: string[] } | null): string {
  if (!s.releases) {
    return `<h2>Releases of code</h2>${note('warn', 'Releases are made from a folder on a computer: in Ummia on the Mac or Linux. This web client reads no folder, so it makes no release.')}`;
  }
  const list = r?.releases ?? [];
  const opts = list.map((x) => `<option value="${e(x.id)}">${e(x.name)} ${e(x.version)} (${e(x.id.slice(0, 8))}…)</option>`).join('');
  const rows = list.length
    ? list
        .map(
          (x) => `<div class="item" data-release="${e(x.id)}"><h3>${e(x.name)} ${e(x.version)}</h3><div class="meta">${fp(x.id)} · from ${e(x.folder)}</div>
<div class="row"><button data-action="release check" data-id="${e(x.id)}">Check it as anyone would</button><button class="quiet" data-action="anchor open" data-id="${e(x.id)}">Anchor it on Bitcoin (optional)</button></div><div class="check-out" id="check-${e(x.id)}"></div><div id="anchor-${e(x.id)}"></div></div>`,
        )
        .join('')
    : '<p class="empty">No release from here yet.</p>';
  const anchors = r?.anchors.length
    ? `<h2>Anchors asked</h2>${r.anchors.map((a) => `<div class="item"><h3>${e(a.label)}</h3><div class="meta">${fp(a.act)} · tier ${a.tier} · by ${fp(a.service)} · <span class="v${a.state === 'anchored' ? ' valid' : a.state === 'invalid' ? ' bad' : ''}">${e(a.state)}</span></div>${lines(a.lines)}</div>`).join('')}`
    : '';
  return `<h2>A release under your own name</h2>
<p class="small">A collective’s releases are made in Edubba’s Collectives tab, until Ummia’s second round.</p>
<form id="release"><label>The folder (a git folder gives what git tracks; a plain folder every file but hidden ones)</label>
<div class="row"><input name="folder" class="grow" autocomplete="off" spellcheck="false" placeholder="~/code/my-module"><button type="button" data-action="folders">Choose a folder…</button></div>
<div id="picker"></div><p class="small" id="folder-said"></p>
<label>Its name (the folder’s, by default)</label><input name="name" autocomplete="off">
<label>Its version</label><input name="version" autocomplete="off" placeholder="1.0">
<label>The release before it</label><select name="previous"><option value="">None: a new release line</option>${opts}</select>
<label>Specifications it implements (optional): their publications’ act ids, one per line</label><textarea name="implements" spellcheck="false"></textarea>
<div class="row"><button type="submit">Read it back</button></div></form>
<div id="release-review"></div>
<h2>Your releases</h2>${rows}${anchors}`;
}

export function picker(l: { path: string; parent: string | null; places: { name: string; path: string }[]; folders: { name: string; path: string; git: boolean; spaced: string | null }[]; hidden: number; problem: string | null }): string {
  return `<div class="picker"><p class="small">${e(l.path)}</p>
<div>${l.places.map((p) => `<button type="button" class="quiet" data-action="folders" data-path="${e(p.path)}">${e(p.name)}</button>`).join('')}${l.parent ? `<button type="button" class="quiet" data-action="folders" data-path="${e(l.parent)}">Up</button>` : ''}<button type="button" class="primary" data-action="folder use" data-path="${e(l.path)}">Use this folder</button></div>
${l.problem ? note('warn', e(l.problem)) : ''}
<div>${l.folders.map((f) => `<button type="button" data-action="folders" data-path="${e(f.path)}">${e(f.name)}${f.git ? ' · git' : ''}${f.spaced ? ` (${e(f.spaced)})` : ''}</button>`).join('')}</div>${l.hidden ? `<p class="small">${l.hidden} hidden folder${l.hidden === 1 ? '' : 's'} not shown.</p>` : ''}</div>`;
}

export function checked(c: { ok: boolean; lines: Line[] }): string {
  return `<div class="${c.ok ? '' : 'blocking'}">${lines(c.lines)}</div>`;
}

export function anchorForm(release: string, offers: Offer[] | null, say: string[]): string {
  const choose = offers
    ? offers.length
      ? `<label>Its standing offer, and a tier</label><select name="choice">${offers.flatMap((o) => o.tiers.map((t, i) => `<option value="${e(o.act)} ${i}">offer ${e(o.act.slice(0, 8))}…, tier ${i}: within ${t.blocks} blocks, ${t.price} (its unit)</option>`)).join('')}</select><div class="row"><button type="submit" class="primary">Prepare the payment for Damgar</button></div>`
      : note('warn', 'No standing offer of that service was found under the anchoring cMIP.')
    : '<div class="row"><button type="submit">Read its offer</button></div>';
  return `<form class="anchor" data-release="${e(release)}">${says(say)}<label>The anchoring service’s ID</label><input name="service" autocomplete="off" spellcheck="false" required>${choose}</form>`;
}

// ------------------------------------------------------------------ specifications

const TASK_TICKS = (tasks: { n: number; layer: string; name: string }[]) => `<div class="ticks">${tasks.map((t) => `<label class="check"><input type="checkbox" name="tasks" value="${t.n}"> ${t.n}. ${e(t.name)} (${e(t.layer)})</label>`).join('')}</div>`;

export function specs(choices: { tasks: { n: number; layer: string; name: string }[] }, published: { id: string; hash: string; name: string; kind: string }[]): string {
  return `<h2>Publish a specification</h2>
<p class="small">A cMIP or a Module, published as its act and named by its spec hash, shown before anything is signed. Published for good: a changed specification is a new one. A MIP is drafted under MIPs.</p>
<form id="spec"><label>Its kind</label><select name="kind"><option value="0">cMIP: a specification for a task, an extension, or new act types (an xtype)</option><option value="1">Module: an implementation or extension under a cMIP, or under a MIR</option></select>
<label>Its text (canonical text: no space at the end of a line, no final line break)</label><textarea class="spec" name="text" spellcheck="false" placeholder="# cMIP: …"></textarea>
<input type="file" id="spec-file" accept=".md,.txt,text/plain,text/markdown"><span class="small"> or load it from a file</span>
<p class="small">Fill below only what your text says.</p>
<details class="fold"><summary>A cMIP: the tasks it fills (field 2)</summary>${TASK_TICKS(choices.tasks)}</details>
<details class="fold"><summary>Act types it defines (field 3): one per line, “number name schema”</summary><textarea name="types" spellcheck="false" placeholder="0 note note = tstr"></textarea></details>
<details class="fold"><summary>A Module: the cMIP it implements, or the MIR it works under (field 5)</summary><input name="implements" spellcheck="false" placeholder="a spec hash"></details>
<details class="fold"><summary>A rail Module: its kind and what its proof binds (fields 11 and 13)</summary><select name="railKind"><option value="">Not a rail</option><option value="0">a request rail</option><option value="1">a push rail</option></select>
<div class="ticks"><label class="check"><input type="checkbox" name="railBinds" value="0"> the payee</label><label class="check"><input type="checkbox" name="railBinds" value="1"> the purpose</label><label class="check"><input type="checkbox" name="railBinds" value="2"> the previous hop</label></div></details>
<details class="fold"><summary>As an extension, the layers it acts on (field 10)</summary><div class="ticks">${['Identity', 'Envelopes and Text', 'Money', 'Agreements'].map((l, i) => `<label class="check"><input type="checkbox" name="layers" value="${i}"> ${l}</label>`).join('')}</div></details>
<details class="fold"><summary>Its predecessor (field 8), dependencies (field 4), a proof-of-delivery checker (field 12)</summary><label>The specification it replaces, for its users</label><input name="predecessor" spellcheck="false" placeholder="a spec hash">
<label>Specifications it depends on, one per line</label><textarea name="dependencies" spellcheck="false"></textarea>
<label class="check"><input type="checkbox" name="checker"> It checks proofs of delivery of proven offers</label></details>
<div class="row"><button type="submit">Read it back, with its hash</button></div></form>
<div id="spec-review"></div>
<h2>Published from here</h2>${published.length ? published.map((p) => `<div class="item"><h3>${e(p.name)}</h3><div class="meta">${e(p.kind)} · publication ${fp(p.id)}</div><div class="hash" title="${e(p.hash)}">${e(shownSpec(p.hash))}</div></div>`).join('') : '<p class="empty">None yet.</p>'}`;
}

// ------------------------------------------------------------------ tracking

function specCard(x: TrackedSpec, accepted: Set<string>): string {
  const release = x.releases.length ? `<p class="small">Code released: ${x.releases.map((r) => `${e(r.name ?? 'a release')} ${e(r.version ?? '')}${r.problem ? ` (not verified: ${e(r.problem)})` : ''}`).join(', ')}.</p>` : '';
  const use = x.use ? `<p class="small">Used: ${x.use.acts} public act${x.use.acts === 1 ? '' : 's'} of its types (${x.use.byType.map((t) => `${e(t.name)} ${t.acts}`).join(', ')})${x.use.notValid ? `; ${x.use.notValid} not valid, not counted` : ''}.</p>` : '';
  return `<div class="item spec-card" data-hash="${e(x.hash)}"><h3>${e(x.name)}</h3>
<div class="meta">${e(x.kind)} · ${e(x.layer)}${x.draft > 1 ? ` · draft ${x.draft} in its line` : ''} · by ${x.creator ? fp(x.creator) : 'no creator'}${x.creator ? (x.claimed ? '' : ' (unclaimed: its creator never published it)') : ''}</div>
${lines(x.role.map((t) => ({ text: t })))}${x.otherCreator ? note('warn', 'Its creator is not its predecessor’s (Development rule 25).') : ''}${release}${use}
<div class="hash" title="${e(x.hash)}">${e(shownSpec(x.hash))}</div>
<div class="row">${accepted.has(x.hash) ? '<span class="small">Accepted</span>' : `<button data-action="accept spec" data-hash="${e(x.hash)}" data-label="${e(`${x.name}`.slice(0, 120))}">Accept it</button>`}</div></div>`;
}

export function trackForm(s: State): string {
  return `<h2>Tracking</h2>
<form id="track"><label>The public relays to ask, one per line</label><textarea name="relays" spellcheck="false">${e(s.settings.track.join('\n'))}</textarea>
<label>Only the specifications and releases of one signer (optional)</label><input name="signer" spellcheck="false" placeholder="an identity's ID">
<div class="row"><button type="submit" class="primary">Look</button></div></form>
<div id="track-out"></div>
<h2>The acts of one specification</h2>
<form id="acts"><label>Its spec hash</label><input name="spec" spellcheck="false" required><label>An act type (optional)</label><input name="type" inputmode="numeric"><label>A signer (optional)</label><input name="signer" spellcheck="false">
<div class="row"><button type="submit">Look</button></div></form><div id="acts-out"></div>`;
}

export function tracked(t: Tracked, accepted: Set<string>): string {
  const relays = `<p class="small">${t.relays.map((r) => `${e(r.address)}: ${r.problem ? e(r.problem) : `${r.read} acts read, ${r.specs} specification${r.specs === 1 ? '' : 's'}${r.stopped ? ' (stopped: more than a look reads)' : ''}`}`).join('<br>')}</p>`;
  const ext = t.extensions.length
    ? t.extensions.map((x) => `<div class="item"><h3>${e(x.name ?? `A cMIP not found on these relays`)}</h3><div class="meta">named by ${x.agreements} public agreement${x.agreements === 1 ? '' : 's'}${x.layers ? ` · touches ${e(x.layers.join(', '))}` : ''}</div><div class="hash" title="${e(x.hash)}">${e(shownSpec(x.hash))}</div></div>`).join('')
    : '<p class="empty">No public agreement found naming an extension.</p>';
  const mips = t.mips.length
    ? t.mips.map((m) => `<div class="item"><h3>${e(m.name)}</h3><div class="meta">${fp(m.root)}</div>${m.forks.length ? lines(m.forks.map((f) => ({ text: `${f.name}, by ${f.creator ? `${f.creator.slice(0, 8)}…` : 'no creator'} (${f.total} fork${f.total === 1 ? '' : 's'} under it)` }))) : '<p class="small">No MIP forks it here.</p>'}</div>`).join('')
    : '<p class="empty">No MIP found.</p>';
  return `<div class="limit">${says(t.limit)}</div>${relays}
<h2>Extensions public agreements name</h2><p class="small">Each marks work the core did not foresee: the raw material of MOR 2. Agreements counted: ${t.agreements.counted} (${t.agreements.proposed} proposed, not signed by every party; ${t.agreements.notCounted} not verified; ${t.agreements.private} private items unread).</p>${ext}
<h2>Xtypes: new act types from core pieces</h2>${t.xtypes.length ? t.xtypes.map((x) => specCard(x, accepted)).join('') : '<p class="empty">None found.</p>'}
<h2>cMIPs and Modules</h2>${t.lines.length ? t.lines.map((l) => l.map((x) => specCard(x, accepted)).join('')).join('') : '<p class="empty">None found.</p>'}
<h2>MIPs, by what they fork</h2>${mips}
${t.unverified.length ? `<h2>Not verified</h2>${lines(t.unverified.map((u) => ({ text: `${u.id.slice(0, 12)}…: ${u.problem}`, tone: 'warn' })))}` : ''}`;
}

export function acts(r: { acts: FoundAct[]; lines: Line[] }): string {
  return `${lines(r.lines)}${r.acts.length ? r.acts.map((a) => `<div class="item"><div class="meta">${fp(a.id)} · type ${a.type} · by ${fp(a.signer)} · <span class="v${a.standing === 'valid' ? ' valid' : ''}">${e(a.standing)}</span></div></div>`).join('') : '<p class="empty">No public act of it found.</p>'}`;
}

// ------------------------------------------------------------------ MIPs

export function mips(m: { drafts: MipDraft[]; say: string[]; forkable: { key: string; name: string }[] }, open: string | null): string {
  const drafts = m.drafts.length
    ? m.drafts
        .map(
          (d) => `<div class="item mip" data-key="${e(d.key)}"><h3>${e(d.title)}</h3><div class="meta">forks ${e(d.forksName)} · ${d.drafts.length} draft${d.drafts.length === 1 ? '' : 's'} published${d.published ? ` · published as a MIP, its hash ${e(d.published.hash.slice(0, 12))}…` : ''}</div>
${d.drafts.length ? lines(d.drafts.map((x, i) => ({ text: `Draft ${i + 1}: ${x.id}` }))) : ''}
${d.published ? `<div class="hash">${e(d.published.hash)}</div>` : `<details class="fold"${open === d.key ? ' open' : ''}><summary>Write it</summary><form class="mip-text" data-key="${e(d.key)}"><textarea class="spec" name="text" spellcheck="false">${e(d.text)}</textarea><div class="row"><button type="submit">Keep it here (nothing is sent)</button></div></form></details>
<div class="row"><button data-action="mip draft" data-key="${e(d.key)}">Publish this draft for discussion</button><button class="quiet" data-action="mip replies" data-key="${e(d.key)}">Replies</button><button class="primary" data-action="mip prepare" data-key="${e(d.key)}">I am ready: publish it as a MIP…</button></div>`}
<div id="mip-out-${e(d.key)}"></div></div>`,
        )
        .join('')
    : '<p class="empty">No MIP drafted here yet.</p>';
  return `<h2>A path to drafting MIPs</h2>${says(m.say)}
<form id="mip-new"><label>Its title</label><input name="title" required><label>What it forks</label><select name="forks">${m.forkable.map((f) => `<option value="${e(f.key)}">${e(f.name)}</option>`).join('')}<option value="">A MIP, or the MICS document (for a new layer), by its spec hash:</option></select><input name="hash" spellcheck="false" placeholder="a spec hash, where chosen above">
<div class="row"><button type="submit">Start it in the MIP shape</button></div></form>
<h2>Your MIPs</h2>${drafts}`;
}

export function replies(r: { replies: Record<string, Reply[]>; lines: Line[] }): string {
  const all = Object.entries(r.replies);
  return `${lines(r.lines)}${all.length ? all.map(([draft, rs]) => `<p class="small">To draft ${e(draft.slice(0, 12))}…</p>${rs.map((x) => `<div class="item"><div class="meta">${fp(x.signer)} · <span class="v${x.standing === 'valid' ? ' valid' : ''}">${e(x.standing)}</span>${x.sealed ? ' · sent to you' : ''}</div><p>${e(x.text)}</p></div>`).join('')}`).join('') : '<p class="empty">No reply found yet.</p>'}`;
}

// ------------------------------------------------------------------ reports

export function reports(r: { sent: { id: string; title: string; at: number }[]; answers: { id: string; report: string; text: string; standing: string }[]; lines: Line[]; say: string[]; to: string | null }): string {
  const sent = r.sent.length
    ? r.sent
        .map((s) => {
          const as = r.answers.filter((a) => a.report === s.id);
          return `<div class="item"><h3>${e(s.title)}</h3><div class="meta">${fp(s.id)}</div>${as.length ? as.map((a) => `<p class="small">Answered (<span class="v${a.standing === 'valid' ? ' valid' : ''}">${e(a.standing)}</span>): ${e(a.text)}</p>`).join('') : '<p class="small">No answer yet.</p>'}</div>`;
        })
        .join('')
    : '<p class="empty">No report sent from here.</p>';
  return `<h2>Report a bug</h2>${says(r.say)}
${r.to ? `<p class="small">To the reporting identity ${fp(r.to)}.</p><form id="report"><label>The report: its first line is its title</label><textarea name="text" required></textarea><div class="row"><button type="submit" class="primary">Sign and send it</button></div></form>` : note('warn', 'Give the reporting identity’s ID under Settings first.')}
${lines(r.lines)}
<h2>Sent from here</h2>${sent}`;
}

// ------------------------------------------------------------------ the accepted list

export function accepted(a: { entries: AcceptedEntry[]; version: number; forked: boolean; merged: string[]; published: boolean; problems: string[]; say: string[] }): string {
  return `<h2>What you accept</h2>${says(a.say)}
${a.problems.length ? note('warn', lines(a.problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}
${a.forked ? note('warn', `Two apps changed it at once. Shown merged, nothing dropped: ${lines(a.merged.map((t) => ({ text: t })))} Your next change writes the merge.`) : ''}
<p class="small">${a.version ? `Version ${a.version}.` : 'Nothing accepted yet: the default, under which no app signs anything under any specification.'}</p>
${a.entries.length ? a.entries.map((x) => `<div class="item"><h3>${e(x.label ?? 'A specification with no label')}</h3><div class="meta">${e(x.part)}</div><div class="hash" title="${e(x.hash)}">${e(shownSpec(x.hash))}</div><div class="row"><button class="quiet" data-action="accepted remove" data-hash="${e(x.hash)}">Remove it</button></div></div>`).join('') : ''}
<form id="accept-add"><label>Accept a specification by its spec hash (or press “Accept it” on one found under Tracking)</label><input name="hash" spellcheck="false" required><label>Its label (its name and draft)</label><input name="label" maxlength="120">
<div class="row"><button type="submit">Accept it</button></div></form>
<div class="row"><span class="grow small">${a.published ? 'Published: anyone can read which specifications you accept.' : 'Private: sealed to yourself (the default).'}</span><button data-action="accepted publish" data-on="${a.published ? 'false' : 'true'}">${a.published ? 'Make it private again' : 'Publish it'}</button></div>`;
}

// ------------------------------------------------------------------ settings

export function settings(s: State): string {
  return `<h2>Settings</h2>
<form id="settings"><label>Relays your acts go to (specifications, releases, drafts, reports), one per line</label><textarea name="relays" spellcheck="false">${e(s.settings.relays.join('\n'))}</textarea>
<label>Public relays tracking asks, one per line</label><textarea name="track" spellcheck="false">${e(s.settings.track.join('\n'))}</textarea>
<label>The reporting identity’s ID</label><input name="reports" spellcheck="false" value="${e(s.settings.reports ?? '')}">
<div class="row"><button type="submit" class="primary">Save</button></div></form>
<dl class="facts"><dt>Homes</dt><dd>${e(s.identity!.homes.join(', '))} (the identity’s chain names them; changed in Kišib)</dd></dl>`;
}

export function spent(say: string): string {
  return note('spent', `${e(say)} <button data-action="window">Give the new words</button>`);
}
