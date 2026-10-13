// Dub's page, as HTML strings, for the program on the Mac and for the web
// client alike (`web` set). Everything from the program, from relays or
// typed by the person is escaped; a post's HTML is the barebone client's
// reader's (`clients/barebone/src/html.ts`), which escapes its text.

import { STYLE as BASE, e } from '../../../manage/src/view.ts';

export { e };

export const NAME = 'Dub';
/** Asked by Nobody, allegedly, for the first screen. Kept equal to `TEST_ONLY` in `dub.ts` (a test checks). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/**
 * The web client's banner, on every page it shows (F281: "With risks
 * stated, for testing purpose only"): for testing only, and both risks in
 * plain words. It is in the page's HTML itself (`static/web.html`, written
 * there by the build), outside what the script draws, so it shows even when
 * the script does not run.
 */
export const WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. Two risks, in plain words:</p>
<ol><li>Whoever serves this page's code at the moment an identity is made here could copy its keys.</li>
<li>This browser's storage, where the identity's signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div>`;

/** Said wherever the web client keeps the signing key. */
export const KEPT_SAY =
  'Its signing key is kept in this browser’s storage (IndexedDB), as it is, not locked: the only lock this page could put on it is one it could open by itself, and so could whatever else runs in this page. Its carry words are the way out: write them down.';

/** The page's own style; the program adds the barebone reader's (`src/server.ts`), whose module needs Node. */
export const STYLE = `${BASE}
.banner{margin:12px 0;padding:8px 12px;border:1px solid var(--warn);color:var(--warn);font-weight:600;font-size:13px}
#for-testing-only{max-width:868px;margin:16px auto 0;box-sizing:border-box}
@media (max-width:900px){#for-testing-only{margin:16px 16px 0}}
.banner p,.banner ol{margin:4px 0}
.banner ol{padding-left:1.4em}
.card{border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}
.card h3{margin:0 0 4px;font-size:17px}
.doors{display:grid;grid-template-columns:repeat(auto-fit,minmax(18em,1fr));gap:12px}
label{display:block;margin:10px 0 4px;font-weight:600;font-size:14px}
textarea{font:inherit;width:100%;min-height:4em;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText}
textarea.write{min-height:8em}
input.wide{width:100%}
.words{display:grid;grid-template-columns:repeat(auto-fill,minmax(9em,1fr));gap:6px 12px;margin:12px 0;padding:12px;border:2px solid CanvasText;border-radius:8px;font:16px ui-monospace,Menlo,monospace}
.words span{white-space:nowrap}
.words b{display:inline-block;min-width:2em;color:var(--soft);font-weight:400}
.say li{margin:4px 0}
.typed{display:flex;flex-wrap:wrap;gap:8px}
.typed label{margin:0;font-weight:400}
.typed input{width:10em}
.published{border:2px solid var(--ok);border-radius:8px;padding:4px 12px;margin:12px 0}
.id{font:14px ui-monospace,Menlo,monospace;overflow-wrap:anywhere}
.copy{font-size:12px;padding:2px 8px;margin-left:8px;vertical-align:baseline}
.here:empty{display:none}
details.more summary{cursor:pointer;color:var(--soft);font-size:13px;margin-top:8px}`;

export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
}

export interface Shown {
  id: string;
  html: string;
  withdrawable: string[];
}

export interface State {
  stage: 'doors' | 'confirm' | 'ready';
  confirm?: { positions: number[]; id: string };
  identity?: {
    id: string;
    grouped: string;
    kind: 'made' | 'brought';
    chainKey: 'held' | 'shown' | 'elsewhere';
    homes: string[];
    relays: string[];
    line: { acts: number; latest: string | null; summary: string | null };
  };
}

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export const lines = (ls: Line[]) => `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;

/** The top of every screen. The web client's banner is in its page already (`WEB_BANNER`). */
export function top(web = false): string {
  if (web) return `<header class="top"><h1>${NAME}</h1><span class="small">web client, for testing only · ${e(location.host)}</span></header>`;
  return `<header class="top"><h1>${NAME}</h1><span class="small">this machine only · ${e(location.host)}</span></header>
<div class="banner" id="test-only">${TEST_ONLY}. Every key is held in software in this program's folder: a prototype, never for a real identity.</div>`;
}

export function pairing(): string {
  return `${top()}
<section><h2>Pair this browser</h2>
<p>This page acts for the program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit">Pair</button></form>
<div id="pair-status"></div></section>`;
}

const via = `<details class="more"><summary>Another way to reach an address (rarely needed)</summary>
<label>One per line, as address=where (for example an onion home at its local port)</label><textarea name="via"></textarea></details>`;

/** Addresses a web client's deployer suggests (`dub.json`), filled in. */
export interface Suggested {
  homes?: string[];
  relays?: string[];
}

/** The first screen: two doors. */
export function doors(web = false, suggested: Suggested = {}): string {
  const make = web
    ? `<p>A new test identity of your own, made in this browser. You will be shown 24 words to write down, once: its chain key, which this page then forgets. Its signing key stays in this browser.</p>`
    : `<p>A new identity of your own, made here. You will be shown 24 words to write down, once.</p>`;
  const lines = (xs?: string[]) => e((xs ?? []).join('\n'));
  return `${top(web)}
<div id="status"></div>
<div class="doors">
<section class="card"><h3>Make a new identity</h3>
${make}
<form id="begin">
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://">${lines(suggested.homes)}</textarea>
<label>Relays where its posts are published (one per line; leave empty to use its home)</label><textarea name="relays">${lines(suggested.relays)}</textarea>
${web ? '' : via}
<div class="row"><button type="submit">Make it</button></div></form></section>
<section class="card"><h3>Bring an identity you have</h3>
<p>An identity made in another app: its ID and its 24 words. This app reads the identity from its homes and checks that the words give its current signing key.</p>
<form id="bring">
<label>Its ID</label><input class="wide" name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input class="wide" name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if the identity names none; one per line)</label><textarea name="relays"></textarea>
${web ? '' : via}
<p class="small">Never type the chain key's words here: the chain key stays on the device that holds it.${web ? ` ${e(KEPT_SAY)}` : ''}</p>
<div class="row"><button type="submit">Bring it</button></div></form></section>
</div>`;
}

/** The words, shown once, and the three to type back. */
export function words(ws: string[], positions: number[], say: string[], web = false): string {
  return `${top(web)}
<section><h2>${web ? 'Write these words down: the chain key' : 'Write these words down'}</h2>
<ul class="say">${say.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
<div class="words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
${typeBack(positions, false, web)}</section>`;
}

/** Three words typed back before going on. */
export function typeBack(positions: number[], again: boolean, web = false): string {
  const ask = again
    ? `<p>The 24 words of this new identity were shown once. Type three of them from what you wrote down.</p>`
    : `<p>When they are written down, type three of them back.</p>`;
  return `${again ? top(web) : ''}<div id="status"></div>${ask}
<form id="confirm"><div class="typed">${positions
    .map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`)
    .join('')}</div>
<div class="row"><button type="submit">Go on</button> <button type="button" class="quiet" data-action="abandon">Start again with a new identity</button></div></form>
<p class="small">Nothing is published until these three are right.</p>`;
}

/** Once the identity is here: write, post, see. */
export function ready(s: State, web = false): string {
  const tail = web
    ? `<section><h2>Carry it elsewhere</h2><p>The identity's ID and 24 words bring it into Dub on a computer, or onto another device. Write them down: if this browser's storage is lost, they are the only way back.</p>
<div class="row"><button class="quiet" data-action="carry">Show the carry words</button> <button class="quiet" data-action="forget">Forget this identity in this browser</button></div><div id="carry"></div></section>`
    : `<section><h2>Browsers</h2><div class="row"><button class="quiet" data-action="code">A code for another browser on this machine</button> <button class="quiet" data-action="unpair">Unpair this browser</button></div><div id="code"></div></section>`;
  return `${top(web)}
<div id="status"></div>
<section><h2>Write</h2>
<form id="post"><textarea class="write" name="text" required placeholder="What do you want to say?"></textarea>
<label>A picture (optional, JPEG)</label><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg">
<p class="small">Before it leaves, the picture is stripped to the picture alone: no location, camera data or previews.</p>
<div class="row"><button type="submit">Post</button></div></form></section>
<section><h2>Published</h2><div id="published"><p class="small">Your post appears here, read back from the relays and verified.</p></div></section>
<section><h2>Your posts, newest first</h2><div class="row"><button class="quiet" data-action="posts">Look again</button></div><div id="posts"></div></section>
<section><h2>This identity</h2><div class="card" id="identity">${identity(s, web)}</div></section>
${tail}`;
}

/** The carry words, on request (the carry Module, 3.2): the ID, the words, what they do. */
export function carry(c: { grouped: string; words: string[]; say: string[] }): string {
  return `<div class="card"><p class="id">${e(c.grouped)}</p>
<ul class="say">${c.say.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
<div class="words" id="carry-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<div class="row"><button class="quiet" data-action="hide-carry">Hide them</button></div></div>`;
}

/** The identity, and this app's line as it is now. */
export function identity(s: State, web = false): string {
  const i = s.identity!;
  const made = {
    held: 'Here. Its chain key is held here too, in software, as test identities hold it.',
    shown: 'Here, in this browser. Its chain key was shown once as words, and is kept nowhere here.',
    elsewhere: 'Elsewhere, and brought here by its words. Its chain key is not here.',
  }[i.chainKey];
  return `<p class="id">${e(i.grouped)}<button class="quiet copy" data-action="copy" data-id="${e(i.id)}">Copy ID</button></p>
<dl class="facts"><dt>Made</dt><dd>${e(made)}</dd>${web ? `<dt>Kept</dt><dd>${e(KEPT_SAY)}</dd>` : ''}
<dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd>
<dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd>
<dt>This app's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? '')}</code>` : ''}</dd></dl>
<p class="small">This app keeps its own line of acts. If the signing key is ever changed, that change must keep this line, or the posts made here become void: take the line above to the device that changes it.</p>`;
}

/** A post as the reader shows it, with a withdrawal button for each of this identity's pictures. */
export function shown(p: Shown): string {
  return `<div data-post="${e(p.id)}">${p.html}${p.withdrawable
    .map((w) => `<div class="row"><button class="quiet" data-action="withdraw" data-publication="${e(w)}">Withdraw this picture</button><span class="small">Readers stop showing it; the post stands.</span></div>`)
    .join('')}</div>`;
}
