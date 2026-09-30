// The reader's pages, as HTML strings. Everything that comes from an act or
// from the settings is escaped; the only markup written is the reader's own
// and the long-form format's, which escapes every character it shows.

import { escapeHtml as e } from '../../longform/src/html.ts';
import { renderPost, STYLE as POST_STYLE } from '../../barebone/src/html.ts';
import type { Settings } from './settings.ts';
import { fingerprint, standingWords, type Shown } from './read.ts';
import { MAX_MESSAGE } from './message.ts';

export const STYLE = `${POST_STYLE}
:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 22%,transparent);--soft:color-mix(in srgb,CanvasText 70%,Canvas);--ok:#1a7f37;--bad:#b3261e}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80}}
*{box-sizing:border-box}
body{margin:0;background:Canvas;color:CanvasText;font:17px/1.55 Georgia,'Times New Roman',serif}
main{max-width:42em;margin:0 auto;padding:24px 16px 64px}
header.top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line);font-family:system-ui,sans-serif;font-size:14px}
header.top a{color:inherit;text-decoration:none;font-weight:600}
.small{font-family:system-ui,sans-serif;font-size:14px;color:var(--soft)}
code,.fp{font-family:ui-monospace,Menlo,monospace;font-size:.88em;overflow-wrap:anywhere}
.signer{margin:20px 0;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-family:system-ui,sans-serif;font-size:14px}
.signer .fp{display:block;margin:4px 0;font-size:13px;letter-spacing:.02em}
.standing{font-weight:600}
.standing.ok{color:var(--ok)}
.standing.bad{color:var(--bad)}
.docs{list-style:none;padding:0}
.docs li{padding:10px 0;border-bottom:1px solid var(--line)}
.docs a{font-size:1.1em}
section{margin-top:40px}
h2.section{font:600 13px system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:var(--soft)}
textarea{width:100%;min-height:9em;font:inherit;padding:8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText}
button{font:600 15px system-ui,sans-serif;padding:8px 16px;border-radius:6px;border:1px solid CanvasText;background:CanvasText;color:Canvas;cursor:pointer}
button:disabled{opacity:.5;cursor:default}
.note{padding:10px 12px;border-left:3px solid var(--line);font-family:system-ui,sans-serif;font-size:14px}
.error{border-left-color:var(--bad)}
.done{border-left-color:var(--ok)}
.mor-post{border:0;padding:0;margin:0}
.mor-post>.mor-post-by:first-child{display:none}
details{margin-top:2.5em;font-family:system-ui,sans-serif;font-size:14px}`;

const words = (s: string) => standingWords(s);

export function top(settings: Settings): string {
  return `<header class="top"><a href="#">MOR reader</a><span>the door of ${e(settings.name)}</span></header>`;
}

function signer(s: Shown, settings: Settings): string {
  const w = words(s.post.standing);
  const who = s.byOwner
    ? `The identity this reader names as ${e(settings.name)}.`
    : `<strong>Not the identity this reader names as ${e(settings.name)}.</strong>`;
  return `<div class="signer" id="signer">
<div class="standing ${w.ok ? 'ok' : 'bad'}">${e(w.words)}</div>
<div>Signed by the identity</div><span class="fp" title="the identity hash">${fingerprint(s.post.signer)}</span>
<div>${who} The name is this reader's setting; the identity is what was checked.</div>
<div class="small">Act <code>${e(s.post.id)}</code></div>
</div>`;
}

/** One document or post. */
export function documentPage(s: Shown, settings: Settings): string {
  return `${top(settings)}
${signer(s, settings)}
${renderPost(s.post)}
${contact(settings)}`;
}

/** The front page: whose door this is, their documents, links, and how to reach them. */
export function frontPage(settings: Settings): string {
  const links = settings.links.length
    ? `<section><h2 class="section">Elsewhere</h2><ul class="docs">${settings.links
        .map((l) => `<li><a href="${e(l.href)}" rel="noopener noreferrer">${e(l.label)}</a></li>`)
        .join('')}</ul></section>`
    : '';
  return `${top(settings)}
<section><h2 class="section">Documents</h2>
<p class="small">Signed by the identity this reader names as ${e(settings.name)}:</p>
<span class="fp">${fingerprint(settings.identity)}</span>
<ul class="docs" id="docs"><li class="small">Fetching from ${settings.relays.map(e).join(', ')}…</li></ul></section>
${links}
${contact(settings)}`;
}

export function documentItem(s: Shown, link: string): string {
  const w = words(s.post.standing);
  return `<li><a href="${e(link)}">${e(s.title)}</a><div class="small"><span class="standing ${w.ok ? 'ok' : 'bad'}">${w.ok ? 'verified' : e(s.post.standing)}</span>${s.byOwner ? '' : ' · not by this identity'}</div></li>`;
}

export function contact(settings: Settings): string {
  const email = settings.email
    ? `<p>By email: <a href="mailto:${e(settings.email)}">${e(settings.email)}</a>. <span class="small">Email is outside MOR: nothing about it is signed or checked.</span></p>`
    : '';
  const mor = settings.messageHomes.length
    ? `<form id="message">
<p>Or over MOR: the message is sealed in this browser to ${e(settings.name)}'s encryption key and left in their inbox. Relays see that a message came, and its size; not what it says, nor who sent it.</p>
<textarea id="message-text" maxlength="${MAX_MESSAGE}" placeholder="Your message" required></textarea>
<p class="small">To sign it, this page makes a one-time identity, born at ${settings.messageHomes.map(e).join(' and ')}, and forgets its keys once the message is sent. No reply can reach it: if you want an answer, say in the message how to reach you.</p>
<button type="submit">Send over MOR</button>
<div id="message-status" aria-live="polite"></div>
</form>`
    : '';
  if (!email && !mor) return '';
  return `<section id="contact"><h2 class="section">Reach ${e(settings.name)}</h2>${email}${mor}</section>`;
}

export const note = (kind: 'error' | 'done' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export function errorPage(settings: Settings | null, what: string): string {
  return `${settings ? top(settings) : '<header class="top"><a href="#">MOR reader</a></header>'}
<section>${note('error', e(what))}</section>
${settings ? contact(settings) : ''}`;
}
