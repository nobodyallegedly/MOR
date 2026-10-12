// MOR Post's page, as HTML strings. Everything from the program, from
// relays or typed by the person is escaped; a post's HTML is the barebone
// client's reader's (`clients/barebone/src/html.ts`), which escapes its text.

import { STYLE as BASE, e } from '../../../manage/src/view.ts';

export { e };

export const NAME = 'MOR Post';
/** Asked by Nobody, allegedly, for the first screen. Kept equal to `TEST_ONLY` in `poster.ts` (a test checks). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** The page's own style; the program adds the barebone reader's (`src/server.ts`), whose module needs Node. */
export const STYLE = `${BASE}
.banner{margin:12px 0;padding:8px 12px;border:1px solid var(--warn);color:var(--warn);font-weight:600;font-size:13px}
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
    homes: string[];
    relays: string[];
    line: { acts: number; latest: string | null; summary: string | null };
  };
}

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export const lines = (ls: Line[]) => `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;

export function top(): string {
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

/** The first screen: two doors. */
export function doors(): string {
  return `${top()}
<div id="status"></div>
<div class="doors">
<section class="card"><h3>Make a new identity</h3>
<p>A new identity of your own, made here. You will be shown 24 words to write down, once.</p>
<form id="begin">
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://"></textarea>
<label>Relays where its posts are published (one per line; leave empty to use its home)</label><textarea name="relays"></textarea>
${via}
<div class="row"><button type="submit">Make it</button></div></form></section>
<section class="card"><h3>Bring an identity you have</h3>
<p>An identity made in another app: its ID and its 24 words. This app reads the identity from its homes and checks that the words give its current signing key.</p>
<form id="bring">
<label>Its ID</label><input class="wide" name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input class="wide" name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if the identity names none; one per line)</label><textarea name="relays"></textarea>
${via}
<p class="small">Never type the chain key's words here: the chain key stays on the device that holds it.</p>
<div class="row"><button type="submit">Bring it</button></div></form></section>
</div>`;
}

/** The words, shown once, and the three to type back. */
export function words(ws: string[], positions: number[], say: string[]): string {
  return `${top()}
<section><h2>Write these words down</h2>
<ul class="say">${say.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
<div class="words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
${typeBack(positions, false)}</section>`;
}

/** Three words typed back before going on. */
export function typeBack(positions: number[], again: boolean): string {
  const ask = again
    ? `<p>The 24 words of this new identity were shown once. Type three of them from what you wrote down.</p>`
    : `<p>When they are written down, type three of them back.</p>`;
  return `${again ? top() : ''}<div id="status"></div>${ask}
<form id="confirm"><div class="typed">${positions
    .map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`)
    .join('')}</div>
<div class="row"><button type="submit">Go on</button> <button type="button" class="quiet" data-action="abandon">Start again with a new identity</button></div></form>
<p class="small">Nothing is published until these three are right.</p>`;
}

/** Once the identity is here: write, post, see. */
export function ready(s: State): string {
  const i = s.identity!;
  return `${top()}
<div id="status"></div>
<section><h2>Write</h2>
<form id="post"><textarea class="write" name="text" required placeholder="What do you want to say?"></textarea>
<label>A picture (optional, JPEG)</label><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg">
<p class="small">Before it leaves, the picture is stripped to the picture alone: no location, camera data or previews.</p>
<div class="row"><button type="submit">Post</button></div></form></section>
<section><h2>Published</h2><div id="published"><p class="small">Your post appears here, read back from the relays and verified.</p></div></section>
<section><h2>Your posts, newest first</h2><div class="row"><button class="quiet" data-action="posts">Look again</button></div><div id="posts"></div></section>
<section><h2>This identity</h2><div class="card" id="identity">${identity(s)}</div></section>
<section><h2>Browsers</h2><div class="row"><button class="quiet" data-action="code">A code for another browser on this machine</button> <button class="quiet" data-action="unpair">Unpair this browser</button></div><div id="code"></div></section>`;
}

/** The identity, and this app's line as it is now. */
export function identity(s: State): string {
  const i = s.identity!;
  return `<p class="id">${e(i.grouped)}<button class="quiet copy" data-action="copy" data-id="${e(i.id)}">Copy ID</button></p>
<dl class="facts"><dt>Made</dt><dd>${i.kind === 'made' ? 'Here. Its chain key is held here too, in software, as test identities hold it.' : 'Elsewhere, and brought here by its words. Its chain key is not here.'}</dd>
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
