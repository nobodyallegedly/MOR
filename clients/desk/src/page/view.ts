// The desk's sections, as HTML strings. Everything that comes from the
// program, from relays or from Claude is escaped: names, addresses, texts,
// notes. Texts to be signed are shown as plain text, character for
// character, every invisible control written out as <U+…> (Text rule 5a).

import { STYLE as BASE, e } from '../../../manage/src/view.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { Done, DraftView, Item, Line, Sorted, State } from './api.ts';

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
h4.pile{margin:14px 0 4px;font-size:14px}`;

/** A fingerprint, shortened on screen, whole on hover. */
export function fp(h: string): string {
  return `<code title="${e(h)}">${e(h.slice(0, 8))}…${e(h.slice(-4))}</code>`;
}

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export function top(): string {
  return `<header class="top"><h1>MOR desk</h1><span class="small">this machine only · ${e(location.host)}</span></header>
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
<section><h2>Drafts waiting for you</h2><div class="row"><button class="quiet" data-action="drafts">Look for new drafts</button></div><div id="drafts"></div></section>
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
  'key delivery': 'A key delivery',
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
  if (x.acknowledges.length) facts.push(`It acknowledges receiving this identity's act${x.acknowledges.length > 1 ? 's' : ''} ${x.acknowledges.map(fp).join(', ')}.`);
  if (x.refs.length) facts.push(`It refers to ${x.refs.map(fp).join(', ')}.`);
  if (x.act) facts.push(`Act ${fp(x.act)}.`);
  const sorts = PILES.filter(([s]) => s !== 'new')
    .map(([s, w]) => `<button class="quiet" data-action="sort" data-identity="${e(identity)}" data-key="${e(x.key)}" data-sorted="${e(s)}" aria-pressed="${x.sorted === s}">${e(w)}</button>`)
    .join('');
  return `<div class="item" data-item="${e(x.key)}" data-kind="${e(x.kind)}"><strong>${e(KIND[x.kind])}</strong> <span class="small">${facts.join(' ')}</span>
${x.problem ? note('warn', e(x.problem)) : ''}
${x.text !== undefined ? plain(x.text) : ''}
<div class="sorts">${sorts}</div></div>`;
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
<dl class="facts"><dt>Fingerprint</dt><dd><code>${e(i.id.match(/.{1,4}/g)!.join(' '))}</code></dd>
<dt>Claude</dt><dd><label class="check"><input type="checkbox" data-action="link" data-identity="${e(i.id)}" ${i.linked ? 'checked' : ''}> linked: Claude may prepare drafts for it, which you approve here</label></dd></dl>
<div class="row"><button class="quiet" data-action="refresh" data-identity="${e(i.id)}">Look for what it received</button></div>
${piles}</div>`;
    })
    .join('');
}

export function newIdentity(): string {
  return `<form id="new-identity" class="row"><input name="name" type="text" placeholder="A name, kept on this device" required>
<label class="check"><input name="linked" type="checkbox"> link it to Claude</label>
<button type="submit">Make it</button></form>
<p class="small">A test identity is born at the homes named in Settings, with its acts and its inbox at the relays, and a key to receive messages. Linked to Claude, its name and fingerprint are written to the drafts folder, so Claude can name it.</p>`;
}

export function settings(s: State): string {
  const via = Object.entries(s.settings.via).map(([a, b]) => `${a}=${b}`).join('\n');
  return `<form id="settings">
<label>Homes, one address per line: where new identities live</label><textarea name="homes">${e(s.settings.homes.map((h) => h.hint).join('\n'))}</textarea>
<label>Relays, one per line: where acts are published, and the inbox of new identities (empty: the homes)</label><textarea name="relays">${e(s.settings.relays.join('\n'))}</textarea>
<label>Other ways to reach an address, one per line, as address=where (for example the onion home at its local port)</label><textarea name="via">${e(via)}</textarea>
<label>The drafts folder, shared with the Claude connector</label><input name="drafts" type="text" class="wide" value="${e(s.settings.drafts)}">
<div class="row"><button type="submit">Save settings</button></div></form>`;
}

export function history(s: State): string {
  if (!s.history.length) return '<p class="small">Nothing yet.</p>';
  return `<ul class="plain">${s.history
    .map(
      (h) =>
        `<li>${e(new Date(h.time * 1000).toLocaleString())}: <strong>${e(h.verdict)}</strong>, ${e(h.title.toLowerCase())}, for ${e(h.signerName)}${h.act ? `: act ${fp(h.act)}` : ''}${h.note ? `<div class="yours">${e(h.note)}</div>` : ''}${
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
