// The desk's sections, as HTML strings. Everything that comes from the
// program, from relays or from Claude is escaped: names, addresses, texts,
// notes. Texts to be signed are shown as plain text, character for
// character, every invisible control written out as <U+…> (Text rule 5a).

import { STYLE as BASE, e } from '../../../manage/src/view.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { Done, DraftView, Item, Line, MachineState, Sorted, State } from './api.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';

export { e };

export const STYLE = `${BASE}
${TEXT}
.banner{margin:12px 0;padding:8px 12px;border:1px solid var(--warn);color:var(--warn);font-weight:600;font-size:13px}
.card{border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}
.card h3{margin:0 0 4px;font-size:17px}
.draft{border:2px solid CanvasText;border-radius:8px;padding:16px;margin:16px 0;background:Canvas}
.draft h3{font-size:19px;margin:0 0 6px}
.draft h4{font-size:14px;margin:16px 0 6px}
.draft ul{margin:0;padding-left:20px}
.draft li{margin:4px 0}
li.warn{color:var(--warn)}
li.bad{color:var(--bad);font-weight:600}
li.ok{color:var(--ok)}
.plain{border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin:6px 0 12px;max-height:24em;overflow:auto}
.claude{border:1px dashed var(--soft);border-radius:6px;padding:8px 12px;margin:8px 0;white-space:pre-wrap}
.yours{border-left:3px solid var(--ok);padding:6px 12px;margin:8px 0;white-space:pre-wrap}
.picture img{max-width:100%;max-height:28em;border:1px solid var(--line);border-radius:6px}
.digest{font:13px ui-monospace,Menlo,monospace;overflow-wrap:anywhere}
textarea{font:inherit;width:100%;min-height:5em;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText}
label.check{display:inline-flex;gap:6px;align-items:center;margin-right:16px}
.item{border-top:1px solid var(--line);padding:10px 0}
.item:first-child{border-top:0}
.sorts{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.sorts button[aria-pressed=true]{outline:2px solid var(--ok)}
h4.pile{margin:14px 0 4px;font-size:14px}
.switch{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.switch button[aria-pressed=true]{background:CanvasText;color:Canvas;border-color:CanvasText}
.switch button[aria-pressed=false]{background:transparent;color:var(--soft);border-color:var(--line);font-weight:400}
.here:empty{display:none}
.here .note{margin:8px 0 0}
.copy{font-size:12px;padding:2px 8px;margin-left:8px;vertical-align:baseline}`;

/** The app's name, as the person sees it (decided by Nobody, allegedly, 2 October 2026). */
export const NAME = 'MOR Identities';

/** Said beside the drafts, while the page watches for new ones. */
export const WATCHING = 'New drafts from Claude appear here by themselves, every few seconds.';

/** A fingerprint, shortened on screen, whole on hover. */
export function fp(h: string): string {
  return `<code title="${e(h)}">${e(h.slice(0, 8))}…${e(h.slice(-4))}</code>`;
}

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export function top(): string {
  return `<header class="top"><h1>${NAME}</h1><span class="small">this machine only · ${e(location.host)}</span></header>
<div class="banner">TEST IDENTITIES ONLY. Every key is held in software in this program's folder. A prototype, never for a real identity.</div>`;
}

export function pairing(): string {
  return `${top()}
<section><h2>Pair this browser</h2>
<p>This page acts for the program running on this machine, which holds the keys. Open it with the launcher (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<input id="pair-label" type="text" placeholder="A name for this browser" value="this browser"><button type="submit">Pair</button></form>
<div id="pair-status"></div></section>`;
}

export function frame(): string {
  return `${top()}
<div id="status"></div>
<section><h2>Machine, allegedly</h2><div id="machine"></div></section>
<section><h2>Drafts waiting for you</h2><div class="row"><button class="quiet" data-action="drafts">Look for new drafts now</button>
<span class="small" id="drafts-watch" role="status" aria-live="polite">${WATCHING}</span></div><div id="drafts"></div></section>
<section><h2>Identities, and what they received</h2><div id="identities"></div></section>
<section><h2>A new test identity</h2><div id="new"></div></section>
<section><h2>What you answered</h2><div id="history"></div></section>
<section><h2>Settings</h2><div id="settings"></div></section>
<section><h2>Browsers</h2><div id="browsers"></div></section>`;
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

/** One draft, read in plain words from its bytes, with what the owner can do. */
export function draft(d: DraftView): string {
  const blocking = d.blocking.length
    ? note('error', `<strong>This cannot be approved:</strong><ul>${d.blocking.map((b) => `<li>${e(b)}</li>`).join('')}</ul>`)
    : '';
  const claude =
    d.note !== null
      ? `<h4>Claude's note to you</h4><p class="small">Claude's words about the draft. They are not signed and say nothing about what the draft does: the reading below does.</p><div class="claude">${e(d.note)}</div>`
      : '';
  const rework = d.reworks
    ? `<h4>A rework</h4><p>It replaces draft <code>${e(d.reworks.digest.slice(0, 12))}</code>, which you sent back with this note:</p><div class="yours">${e(d.reworks.note)}</div>${
        d.reworks.text !== null ? `<details><summary>The text of the draft it replaces</summary>${plain(d.reworks.text)}</details>` : ''
      }`
    : '';
  const picture = d.picture
    ? `<h4>The picture, exactly as it will be published (${d.picture.width}×${d.picture.height})</h4><div class="picture"><img alt="The picture to be published" src="${e(d.picture.src)}"></div>`
    : '';
  const texts = d.plain.map((p) => `<h4>${e(p.heading)}</h4><p class="small">As plain text, character for character; any invisible control is shown as &lt;U+…&gt;.</p>${plain(p.text)}`).join('');
  return `<div class="draft" data-draft="${e(d.digest)}">
<h3>${e(d.title)}</h3>
<p>For <strong>${e(d.signerName || 'an unreadable draft')}</strong>, prepared by Claude.</p>
${d.summary.map((s) => `<p>${e(s)}</p>`).join('')}
${blocking}
${rework}
${d.sections.map((s) => `<h4>${e(s.heading)}</h4>${lines(s.lines)}`).join('')}
${texts}
${picture}
${claude}
<p class="small">Draft digest, to compare with the one Claude showed: <span class="digest">${e(d.digest.match(/.{1,4}/g)!.join(' '))}</span></p>
<div class="row"><button data-action="approve" data-digest="${e(d.digest)}" ${d.blocking.length ? 'disabled' : ''}>Approve and sign</button>
<button class="quiet" data-action="decline" data-digest="${e(d.digest)}">Decline</button></div>
<form class="send-back" data-digest="${e(d.digest)}"><label>Send it back to Claude, with a note saying what to change</label><textarea name="note" required></textarea>
<div class="row"><button type="submit" class="quiet">Send back</button></div></form>
</div>`;
}

export function drafts(ds: DraftView[]): string {
  return ds.length ? ds.map(draft).join('') : '<p class="small">No draft is waiting.</p>';
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
  facts.push(x.standing === 'valid' ? '<span class="tag ok">verified</span> its signer’s identity chain counts it.' : `<span class="tag warn">${e(x.standing)}</span>`);
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
    .map(([s, w]) => `<button class="quiet" data-action="sort" data-identity="${e(identity)}" data-key="${e(x.key)}" data-sorted="${e(s)}" aria-pressed="${x.sorted === s}">${e(w)}</button>`)
    .join('');
  return `<div class="item" data-item="${e(x.key)}" data-kind="${e(x.kind)}"><strong>${e(KIND[x.kind])}</strong> <span class="small">${facts.join(' ')}</span>
${x.alarm ? note('error', e(x.alarm)) : ''}${x.notice ? note('', e(x.notice)) : ''}
${x.problem ? note('warn', e(x.problem)) : ''}
${(x.assessment ?? []).map((s) => `<h4>${e(s.heading)}</h4>${lines(s.lines)}`).join('')}
${x.text !== undefined ? plain(x.text) : ''}
<div class="sorts">${sorts}</div>
${x.act && x.from && x.standing === 'valid' ? `<div class="row"><button class="quiet" data-action="witness" data-identity="${e(identity)}" data-act="${e(x.act)}">Rely on this act…</button></div>` : ''}</div>`;
}

/** Before a witness act is signed: what it does, in plain words (Identity rule 18c). */
export function witnessAsk(identity: string, act: string): string {
  return `${note('', `${e(WITNESS_EXPLANATION)}<br>Act ${fp(act)}.`)}
<div class="row"><button data-action="witness-sign" data-identity="${e(identity)}" data-act="${e(act)}">Sign the witness act</button> <button class="quiet" data-action="witness-cancel" data-identity="${e(identity)}">Cancel</button></div>`;
}

export function identities(s: State): string {
  if (!s.identities.length) return '<p class="small">None yet: make one below.</p>';
  return s.identities
    .map((i) => {
      const piles = PILES.map(([k, w]) => {
        const xs = i.received.filter((x) => x.sorted === k);
        return `<div data-pile="${e(k)}"><h4 class="pile">${e(w)} (${xs.length})</h4>${xs.map((x) => item(i.id, x)).join('') || '<p class="small">None.</p>'}</div>`;
      }).join('');
      return `<div class="card" data-identity="${e(i.id)}"><h3>${e(i.name)}</h3>
<dl class="facts"><dt>Fingerprint</dt><dd><code>${e(i.id.match(/.{1,4}/g)!.join(' '))}</code><button class="quiet copy" data-action="copy" data-id="${e(i.id)}" title="Copies the whole ID, without spaces, to paste where an identity is asked for">Copy ID</button></dd>
<dt>This desk's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? '')}</code>` : ''}</dd>
<dt>Claude</dt><dd>${linkSwitch(i.id, i.linked)}</dd></dl>
<div class="here" data-here="${e(i.id)}" role="status" aria-live="polite"></div>
<div class="row"><button class="quiet" data-action="refresh" data-identity="${e(i.id)}">Look for what it received</button></div>
${piles}</div>`;
    })
    .join('');
}

/** The question, and its answer as a clear on or off. */
function linkSwitch(id: string, on: boolean): string {
  const b = (value: boolean, words: string) =>
    `<button type="button" class="quiet" data-action="link" data-identity="${e(id)}" data-on="${value}" aria-pressed="${on === value}">${words}</button>`;
  return `<div class="switch" role="group" aria-label="Claude may prepare drafts for this identity"><span>Claude may prepare drafts for this identity:</span> ${b(true, 'On')}${b(false, 'Off')}</div>
<p class="small">${on ? 'On: Claude can prepare posts, pictures, withdrawals and messages for it. Nothing is signed until you approve it here.' : 'Off: Claude cannot prepare anything for it, and drafts for it are refused.'}</p>`;
}

export function newIdentity(): string {
  return `<form id="new-identity" class="row"><input name="name" type="text" placeholder="A name, kept on this device" required>
<label class="check"><input name="linked" type="checkbox"> Claude may prepare drafts for it</label>
<button type="submit">Make it</button></form>
<p class="small">A test identity is born at the homes named in Settings, with its acts and its inbox at the relays, and a key to receive messages. If Claude may prepare drafts for it, its name and fingerprint are written to the drafts folder, so Claude can name it. You can change this later on its card.</p>`;
}

export function settings(s: State): string {
  const via = Object.entries(s.settings.via).map(([a, b]) => `${a}=${b}`).join('\n');
  return `<form id="settings">
<label>Homes, one address per line: where new identities live</label><textarea name="homes">${e(s.settings.homes.map((h) => h.hint).join('\n'))}</textarea>
<label>Relays, one per line: where acts are published, and the inbox of new identities (empty: the homes)</label><textarea name="relays">${e(s.settings.relays.join('\n'))}</textarea>
<label>Other ways to reach an address, one per line, as address=where (for example the onion home at its local port)</label><textarea name="via">${e(via)}</textarea>
<label>The drafts folder, shared with the Claude connector</label><input name="drafts" type="text" class="wide" value="${e(s.settings.drafts)}">
<div class="row"><button type="submit">Save settings</button></div>
<div class="here" id="settings-status" role="status" aria-live="polite"></div></form>`;
}

export function history(s: State): string {
  if (!s.history.length) return '<p class="small">Nothing yet.</p>';
  return `<ul class="plain">${s.history
    .map(
      (h) =>
        `<li>${e(new Date(h.time * 1000).toLocaleString())}: <strong>${e(h.verdict)}</strong>, ${e(h.draft ? h.title.toLowerCase() : h.title)}, for ${e(h.signerName)}${h.act ? `: act ${fp(h.act)}` : ''}${
          h.cause ? `<div class="small">Cause: ${e(h.cause)}${h.causeAct ? `, act ${fp(h.causeAct)}` : ''}</div>` : ''
        }${h.text ? `<div class="plain">${plainHtml(h.text)}</div>` : ''}${h.note ? `<div class="yours">${e(h.note)}</div>` : ''}${
          h.resend ? ` <button class="quiet" data-action="resend" data-digest="${e(h.draft)}">Send again</button>` : ''
        }</li>`,
    )
    .join('')}</ul>`;
}

export function browsers(s: State): string {
  return `<ul class="plain">${s.paired
    .map((p) => `<li>${e(p.label)}${p.you ? ' <span class="tag ok">this browser</span>' : ''} <button class="quiet" data-action="unpair" data-key="${e(p.key)}" data-you="${p.you}">Unpair</button></li>`)
    .join('')}</ul><div class="row"><button class="quiet" data-action="code">A code for another browser on this machine</button></div><div id="code"></div>`;
}

// ---------------------------------------------------------------- Machine, allegedly

/** Choosing its identity and its owner, then its terms in plain words before anything is signed. */
function machineSetup(s: State): string {
  const options = (selected: string | null) => s.identities.map((i) => `<option value="${e(i.id)}"${i.id === selected ? ' selected' : ''}>${e(i.name)}</option>`).join('');
  const guess = (n: RegExp) => s.identities.find((i) => n.test(i.name))?.id ?? null;
  return `<p>Machine, allegedly answers by itself: your own messages and public acts at once; anyone else’s only once you pick them; and what it chooses when you nudge it. First its agency terms are shown, then signed with its key and published (the nudge cMIP, draft 2).</p>
<form id="machine-terms" class="row"><label>Machine, allegedly <select name="agent">${options(guess(/machine/i))}</select></label>
<label>Its owner, whose acts it answers and whose picks and nudges count <select name="owner">${options(guess(/nobody/i))}</select></label>
<button type="submit">Show its terms</button></form>
<div id="machine-shown"></div>`;
}

/** The terms, as they will be signed, with the one button that signs exactly those. */
export function machineTermsShown(agent: string, owner: string, t: { lines: string[]; digest: string }): string {
  return `<div class="draft"><h3>Machine, allegedly’s agency terms, to be signed</h3>${lines(t.lines.map((text) => ({ text })))}
<p class="small">Digest of exactly what is signed: <span class="digest">${e(t.digest.match(/.{1,4}/g)!.join(' '))}</span></p>
<div class="row"><button data-action="machine-publish" data-agent="${e(agent)}" data-owner="${e(owner)}" data-digest="${e(t.digest)}">Sign and publish these terms</button></div></div>`;
}

function notifiedItem(x: MachineState['notified'][number]): string {
  return `<div class="item" data-notified="${e(x.key)}"><strong>${x.private ? 'A private message' : x.kind === 'reply' ? 'A public reply' : 'A public message'}</strong> <span class="small">from ${e(x.fromName ?? 'an unknown sender')}${
    x.standing === 'valid' ? ' <span class="tag ok">verified</span>' : ` <span class="tag warn">${e(x.standing)}</span>`
  }${x.act ? `, act ${fp(x.act)}` : ''}</span>
${x.text !== undefined ? `<div class="plain">${plainHtml(x.text)}</div>` : ''}
<div class="row"><label class="check"><input type="checkbox" name="pick-select" value="${e(x.key)}"> Select, to pick several in one approval</label><button data-action="machine-pick" data-key="${e(x.key)}">Pick: Machine, allegedly answers it now</button></div></div>`;
}

/** Several picks, shown together before anything is signed, with the one button that signs exactly those. */
export function machinePicksShown(keys: string[], t: { lines: string[]; digest: string }): string {
  return `<div class="draft"><h3>${keys.length === 1 ? 'One pick' : `${keys.length} picks`}, to be signed together</h3>${lines(t.lines.map((text) => ({ text })))}
<p class="small">Digest of exactly what is signed: <span class="digest">${e(t.digest.match(/.{1,4}/g)!.join(' '))}</span></p>
<div class="row"><button data-action="machine-pick-many" data-keys="${e(JSON.stringify(keys))}" data-digest="${e(t.digest)}">Sign these picks; Machine, allegedly answers each</button><button class="quiet" data-action="machine-picks-cancel">Cancel</button></div></div>`;
}

export function machine(s: State): string {
  const m = s.machine;
  if (!m.terms || !m.agent) return machineSetup(s);
  const switchB = (value: boolean, words: string) => `<button type="button" class="quiet" data-action="machine-on" data-on="${value}" aria-pressed="${m.on === value}">${words}</button>`;
  const key = m.key.found
    ? `The API key is found (${e(m.key.from === 'ANTHROPIC_API_KEY' ? 'the environment variable ANTHROPIC_API_KEY' : m.key.from)}); it is never shown here.${m.key.warning ? ` ${e(m.key.warning)}` : ''}`
    : e(m.key.from);
  return `<div class="card"><h3>${e(m.agentName ?? '')}</h3>
<h4>Its terms, signed and published (act ${fp(m.terms.act)})</h4>${lines(m.terms.words.map((text) => ({ text })))}
<div class="switch" role="group" aria-label="Answering"><span>Answering:</span> ${switchB(true, 'On')}${switchB(false, 'Off')}</div>
<p class="small">${m.on ? `On: ${e(m.ownerName ?? '')}’s own messages and public acts to it are answered at once; others wait below until you pick them.` : 'Off: nothing is answered and no call is made.'}</p>
<p class="small">${key}</p>
<form id="machine-cap" class="row"><label>Calls to Claude a day <input name="callsPerDay" type="number" min="0" max="1000" value="${m.callsPerDay}"></label>
<label>Each answer at most <input name="maxChars" type="number" min="50" max="20000" value="${m.maxChars}"> characters</label><button type="submit" class="quiet">Save the cap</button></form>
<p class="small">Calls today: ${m.callsToday} of ${m.callsPerDay}.</p>
${m.stopped ? note('error', `<strong>Stopped:</strong> ${e(m.stopped)}`) : ''}
<div class="row"><button class="quiet" data-action="machine-look">Look now for what it received</button></div>
<div class="here" id="machine-here" role="status" aria-live="polite"></div>
<h4 class="pile">Notified: other people’s interactions with it (${m.notified.length})</h4>
<p class="small">Nothing is drafted for these. Pick the ones that need an answer, one at a time or several selected together: each pick is signed and published, one for each act, and Machine, allegedly answers each at once, naming its pick. What it says is its own.</p>
${m.notified.map(notifiedItem).join('') || '<p class="small">None.</p>'}
${m.notified.length > 1 ? '<div class="row"><button class="quiet" data-action="machine-picks">Pick the selected: show them together first</button></div>' : ''}
<div id="machine-picks-shown"></div>
${
  m.waiting.length
    ? `<h4 class="pile">Picked, waiting for the cap (${m.waiting.length})</h4><p class="small">Your picks are signed; Machine, allegedly answers each once the cap allows, the next day or once it is raised.</p>${m.waiting
        .map((x) => `<div class="item"><strong>${x.private ? 'A private message' : 'A public act'}</strong> <span class="small">from ${e(x.fromName ?? 'an unknown sender')}, act ${fp(x.act)}, picked by ${fp(x.pick)}</span></div>`)
        .join('')}`
    : ''
}
<h4 class="pile">Nudge it</h4>
<form id="machine-nudge"><p class="small">A public act of yours naming it, with a number of actions: it may then answer anyone, post, or write to you, up to that number, each naming your nudge. It chooses.</p>
<div class="row"><label>Actions <input name="count" type="number" min="1" max="20" value="1" required></label></div>
<label>Your words with the nudge (optional, public)</label><textarea name="context"></textarea>
<div class="row"><button type="submit">Nudge</button></div></form>
${
  m.notAnswered.length
    ? `<h4 class="pile">Not answered (${m.notAnswered.length})</h4>${m.notAnswered
        .map((x) => `<div class="item"><strong>${e(x.kind === 'owner' ? 'Your act' : x.kind === 'pick' ? 'A pick' : 'A nudge')}</strong> ${fp(x.act)} <span class="small">${e(x.note)}</span> <button class="quiet" data-action="machine-retry" data-act="${e(x.act)}">Try again</button></div>`)
        .join('')}`
    : ''
}
</div>`;
}
