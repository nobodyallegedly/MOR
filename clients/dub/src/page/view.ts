// Dub's page, as HTML strings, for the program on the Mac and for the web
// client alike (`web` set). Everything from the program, from relays or
// typed by the person is escaped.
//
// The look (F332): calm and sparse, one column, after Damus and Snort
// (studied for layout and feel only; no code copied); the visual bible's
// world: the background #06080c, Inter in light weights, colour only for a
// layer and at low saturation, red only for a contest, a void act or a
// stolen key, no glow. Compact posts and a quiet action row: reply, follow,
// mute. No likes, no zaps, no notification hub: a count on each tab.

import { e } from '../../../manage/src/view.ts';
import { PUBLISH_WARNING, type Held, type Item, type Line, type Message, type Proposal, type ShareShown, type State, type Suggested, type Who } from '../shapes.ts';

export { e, PUBLISH_WARNING };
export type { Held, Item, Line, Message, Proposal, ShareShown, State, Suggested, Who };

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
  'Its signing key and its encryption key are kept in this browser’s storage (IndexedDB), as they are, not locked: the only lock this page could put on them is one it could open by itself, and so could whatever else runs in this page. Its signing key’s words are the way out: write them down.';

/**
 * The page's style. Inter, light and regular, bundled and served beside the
 * page (`../fonts.ts`; F332, "Inter bundled"). Colours: the background and its greys; the Identity
 * layer's (fingerprints) a grey-blue, the Envelopes layer's (what is sealed)
 * a grey-violet, both at low saturation; red only for a contest, a void act
 * or a stolen key. No shadow, no glow.
 */
export const STYLE = `@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(inter_light.woff2) format("woff2")}
@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(inter_regular.woff2) format("woff2")}
:root{color-scheme:dark;--bg:#06080c;--raise:#0f131b;--line:#2a313d;--edge:#3a4250;--text:#d6dae1;--soft:#7f8794;--faint:#4c5360;--identity:#8394a8;--envelopes:#9a92ad;--bad:#b4615f;--ok:#7f8794}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text)}
body{font:300 15px/1.55 Inter,"Inter Variable",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:600px;margin:0 auto;padding:0 16px 64px}
a{color:var(--text);text-decoration:underline;text-decoration-color:var(--faint);text-underline-offset:3px}
h1,h2,h3{font-weight:400;letter-spacing:.01em;margin:0}
h2{font-size:17px;margin:28px 0 10px}
h3{font-size:15px;margin:0 0 6px}
p{margin:8px 0}
code,.mono{font:13px/1.4 ui-monospace,"SF Mono",Menlo,monospace}
.small{font-size:13px;color:var(--soft)}
button{font:inherit;font-size:14px;color:var(--text);background:none;border:1px solid var(--edge);border-radius:999px;padding:5px 14px;cursor:pointer}
button:hover{border-color:var(--faint)}
button:disabled{opacity:.45;cursor:default}
button.primary{background:var(--text);color:var(--bg);border-color:var(--text);font-weight:400}
button.quiet,.acts button{border:none;padding:4px 0;color:var(--soft);border-radius:0}
button.quiet:hover,.acts button:hover{color:var(--text)}
input,textarea{font:inherit;color:var(--text);background:var(--raise);border:1px solid var(--edge);border-radius:10px;padding:8px 10px;width:100%}
input:focus,textarea:focus{outline:none;border-color:var(--faint)}
textarea{min-height:3.2em;resize:vertical}
label{display:block;margin:12px 0 4px;font-size:13px;color:var(--soft)}
.row{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:10px 0}
.grow{flex:1}
.row.tight{margin:0}
input.pet{max-width:14em}
label.check{margin:0;display:flex;gap:8px;align-items:center}
label.check input{width:auto}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;align-items:center;gap:12px;padding:14px 0 10px;border-bottom:1px solid var(--line)}
.mark{font-weight:400;letter-spacing:.06em;font-size:15px}
.tabs{display:flex;gap:4px;margin:0 auto}
.tab{border:none;border-radius:999px;color:var(--soft);padding:5px 14px}
.tab.on{color:var(--text);background:var(--raise)}
.count{display:inline-block;min-width:1.5em;margin-left:6px;padding:0 6px;border-radius:999px;background:var(--line);color:var(--text);font-size:12px;line-height:1.6;text-align:center}
.count:empty{display:none}
.me{border:none;padding:4px 0;color:var(--soft);max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fp{font:12px/1.4 ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity)}
.who{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:14px}
.who .name{color:var(--text);font-weight:400}
.who .dn{color:var(--soft)}
.who .you{color:var(--faint);font-size:12px}
.compose{padding:12px 14px;margin:14px 0;border:1px solid var(--edge);border-radius:12px;background:var(--raise)}
.compose textarea{border:none;background:none;padding:4px 0;font-size:16px;min-height:2.6em}
.compose .row{margin:6px 0 0}
.compose input[type=file]{display:none}
.compose .to{display:none}
.compose.addressed .to{display:block}
.chip{display:inline-flex;gap:8px;align-items:baseline;font-size:13px;color:var(--soft);border:1px solid var(--edge);border-radius:999px;padding:2px 10px}
.chip button{border:none;padding:0;color:var(--soft)}
.filters{display:flex;gap:6px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.filters .tab{font-size:13px}
.post,.msg{padding:12px 14px;margin:10px 0;border:1px solid var(--edge);border-radius:12px;background:var(--raise)}
.post .text,.msg .text{margin:6px 0 2px;white-space:pre-wrap;overflow-wrap:anywhere}
.post figure{margin:10px 0 4px}
.post img{display:block;max-width:100%;height:auto;border-radius:10px;image-orientation:from-image}
.post .acts{border-top:1px solid var(--line);padding-top:6px}
.post figcaption,.re{font-size:12px;color:var(--faint)}
.re{margin-top:2px}
.doc{display:block;margin:8px 0 2px;padding:10px 12px;border:1px solid var(--edge);background:var(--bg);border-radius:10px;text-decoration:none}
.doc .small{display:block}
.acts{display:flex;gap:22px;margin-top:6px}
.acts button{font-size:13px}
.flag{font-size:12px;color:var(--soft)}
.flag.bad{color:var(--bad)}
.msg.out{margin-left:28px;background:none}
.msg .sealed{color:var(--envelopes);font-size:12px}
.note{margin:10px 0;padding:10px 12px;border-left:2px solid var(--line);font-size:14px;color:var(--soft)}
.note.error{border-left-color:var(--bad);color:var(--text)}
.note.done{border-left-color:var(--faint);color:var(--text)}
.note.spent{border-left-color:var(--bad);color:var(--text)}
.note ul{margin:6px 0 0;padding-left:1.1em}
.note li.bad{color:var(--bad)}
.empty{padding:28px 0;color:var(--faint);font-size:14px;text-align:center}
.card{border:1px solid var(--edge);border-radius:14px;padding:14px 16px;margin:12px 0}
details{margin:10px 0}
details>summary{cursor:pointer;color:var(--soft);font-size:14px;list-style:none}
details>summary::-webkit-details-marker{display:none}
details>summary::before{content:"+ ";color:var(--faint)}
details[open]>summary::before{content:"− "}
.people{padding:6px 0 10px;border-bottom:1px solid var(--line)}
.people li{display:flex;gap:10px;align-items:baseline;justify-content:space-between;padding:6px 0;list-style:none}
.people ul{margin:0;padding:0}
.words{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5em,1fr));gap:6px 14px;margin:14px 0;padding:14px;border:1px solid var(--edge);border-radius:12px;font:15px ui-monospace,"SF Mono",Menlo,monospace}
.words span{white-space:nowrap}
.words b{display:inline-block;min-width:2em;color:var(--faint);font-weight:400}
.say{padding-left:1.1em;color:var(--soft);font-size:14px}
.say li{margin:4px 0}
.label{display:inline-block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);margin:0 0 4px}
.typed{display:flex;flex-wrap:wrap;gap:10px}
.typed label{margin:0}
.typed input{width:10em}
.id{font:13px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity);overflow-wrap:anywhere}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;font-size:13px;margin:8px 0}
dl.facts dt{color:var(--faint)}
dl.facts dd{margin:0;color:var(--soft);overflow-wrap:anywhere}
.held li{list-style:none;display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.held ul{padding:0;margin:0}
.banner{margin:12px 0;padding:10px 12px;border:1px solid var(--edge);border-radius:10px;color:var(--soft);font-size:13px}
.banner p,.banner ol{margin:4px 0}
.banner ol{padding-left:1.4em}
#for-testing-only{max-width:568px;margin:12px auto 0}
@media (max-width:600px){#for-testing-only{margin:12px 16px 0}}
[hidden]{display:none!important}
.experimental{margin:10px 0;padding:10px 12px;border:1px solid var(--bad);border-radius:10px;color:var(--soft);font-size:13px}
.experimental strong{color:var(--text);font-weight:400}
.proposal{border:1px solid var(--edge);border-radius:12px;background:var(--raise);padding:12px 14px;margin:12px 0}
.proposal h3{margin:0 0 6px;font-weight:400;font-size:15px}
.proposal h4{margin:12px 0 4px;font-weight:400;font-size:13px;color:var(--soft)}
.proposal ul{margin:4px 0;padding-left:1.1em;font-size:14px}
.proposal .plain{border:1px solid var(--edge);border-radius:10px;padding:8px 10px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;max-height:18em;overflow:auto;background:var(--bg)}
.proposal .state{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}
.share-number{font-size:15px;margin:8px 0}`;

export const note = (kind: 'error' | 'done' | 'warn' | 'spent' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export const lines = (ls: Line[]) => `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;

/** An identity: the person's name for it and its display names beside its fingerprint, never instead of it (the naming cMIP, 4.1). */
export function who(w: Who): string {
  const dn = w.names.length ? w.names.map((n) => `“${e(n)}”`).join(' / ') : '';
  const first = w.pet ? `<span class="name" dir="auto">${e(w.pet)}</span>${dn ? `<span class="dn" dir="auto" title="its display name">${dn}</span>` : ''}` : dn ? `<span class="name" dir="auto">${dn.replace(/“|”/g, '')}</span>` : '';
  return `<span class="who">${first}<span class="fp" title="${e(w.id)}">${e(w.short)}</span>${w.me ? '<span class="you">you</span>' : ''}</span>`;
}

/** The test notice, under every screen on the Mac. The web client's banner is in its page already (`WEB_BANNER`). */
function testNotice(web: boolean): string {
  return web ? '' : `<div class="banner" id="test-only">${TEST_ONLY}. Every key is held in software in this program's folder: a prototype, never for a real identity.</div>`;
}

/** The top of a screen with no tabs: the identity window, the words, pairing. */
export function top(web = false, back = false): string {
  return `<header class="bar"><h1 class="mark">${NAME}</h1><span class="grow"></span>${back ? '<button class="quiet" data-action="back">Back to Dub</button>' : `<span class="small">${web ? 'web client, for testing only' : 'this machine only'}</span>`}</header>
${testNotice(web)}`;
}

export function pairing(): string {
  return `${top()}
<h2>Pair this browser</h2>
<p class="small">This page acts for the program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" class="grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit">Pair</button></form>
<div id="pair-status"></div>`;
}

const via = `<details><summary>Another way to reach an address (rarely needed)</summary>
<label>One per line, as address=where (for example an onion home at its local port)</label><textarea name="via"></textarea></details>`;

// ------------------------------------------------------------------ the identity window

/**
 * The identity window (F332): where an identity is made or brought, where
 * one switches between those held, and where the signing key's words are
 * shown. The app opens only once an identity is here.
 */
export function identityWindow(s: State, web = false, suggested: Suggested = {}): string {
  const i = s.identity;
  const others = s.held.filter((h) => !h.active);
  const lns = (xs?: string[]) => e((xs ?? []).join('\n'));
  const make = `<section class="card"><h3>Make a new identity</h3>
<p class="small">Dub makes it here and shows you 24 words, once: the chain key’s words, to write on paper. Dub keeps nothing of the chain key. Its signing key stays in ${web ? 'this browser' : 'this app'}.</p>
<form id="begin">
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://">${lns(suggested.homes)}</textarea>
<label>Relays for its posts and its inbox (one per line; empty: its home)</label><textarea name="relays">${lns(suggested.relays)}</textarea>
<label>A display name, if you like: published right after it is made, shown beside its fingerprint, never instead of it. Anyone can take the same name.</label><input name="name" type="text" maxlength="48" autocomplete="off" placeholder="No name: its fingerprint alone">
${web ? '' : via}
<div class="row"><button type="submit" class="primary">Make it</button></div></form></section>`;
  const bring = `<section class="card"><h3>Bring an identity you have</h3>
<p class="small">Its ID and its signing key’s words. Dub reads it from its homes and checks the words give its current signing key.</p>
<form id="bring">
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its signing key’s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if it names none; one per line)</label><textarea name="relays"></textarea>
${web ? '' : via}
<p class="small">Never type the chain key’s words here: they belong to MOR Safety, on a device that stays offline.${web ? ` ${e(KEPT_SAY)}` : ''}</p>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>`;
  const doors = i ? `<details id="doors"><summary>Another identity: make one, or bring one</summary>${make}${bring}</details>` : `${make}${bring}`;
  const browsers = web
    ? ''
    : `<details><summary>Browsers paired with this app</summary><div class="row"><button data-action="code">A code for another browser on this machine</button><button class="quiet" data-action="unpair">Unpair this browser</button></div><div id="code"></div></details>`;
  return `${top(web, !!i)}
<div id="status"></div>
<h2>Identity</h2>
${i ? current(s) : '<p class="small">Dub opens once an identity is here.</p>'}
${others.length ? `<div class="held"><span class="label">Also here</span><ul>${others.map((h) => `<li>${who(h.who)}<button data-action="use" data-id="${e(h.id)}">Use this one</button></li>`).join('')}</ul></div>` : ''}
${doors}
${browsers}`;
}

/** The identity in use: its name, its words on request, its line. */
function current(s: State): string {
  const i = s.identity!;
  const name = i.who.names.join(' / ');
  return `<div class="card" id="identity">
<span class="label">In use</span>
<p>${who(i.who)}</p>
<p class="id">${e(i.grouped)}</p>
<div class="row"><button class="quiet" data-action="copy" data-id="${e(i.id)}">Copy ID</button></div>
<form id="name"><label>Your display name: shown beside your fingerprint, never instead of it. Anyone can take the same name.</label>
<div class="row"><input class="grow" name="name" maxlength="48" autocomplete="off" value="${e(name)}" placeholder="No name: your fingerprint alone"><button type="submit">Save</button></div></form>
<div class="row"><label class="small check"><input type="checkbox" id="signing-on" ${i.signing ? 'checked' : ''}> Signing: sign agreements of real collectives here. Even more experimental than Dub itself; off unless you turn it on.</label></div>
<div class="row"><button data-action="carry">Show the signing key’s words</button><button class="quiet" data-action="forget" data-id="${e(i.id)}">Forget it here</button></div>
<div id="carry"></div>
<details><summary>This app’s line, and where it lives</summary>
<dl class="facts"><dt>Made</dt><dd>${i.kind === 'made' ? 'Here. Its chain key was shown once as words, and is kept nowhere here.' : 'Elsewhere, brought here by its signing key’s words. Its chain key is not here.'}</dd>
${i.oldChainKey ? '<dt>Old chain key</dt><dd>Made by Dub before 16 October 2026: its chain key is still in this app’s folder, unused. MOR Safety will take it from there.</dd>' : ''}
<dt>Private messages</dt><dd>${i.encryption ? 'Its encryption key is here: its private messages open here.' : 'No encryption key here: its private messages cannot be opened here.'}</dd>
<dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd>
<dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd>
<dt>This app's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? '' : 's'}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? '')}</code>` : ''}</dd></dl>
<p class="small">If the signing key is ever changed (in MOR Safety, with the chain key’s words), that change must keep this line, or the posts made here become void: take the line above to it.</p></details>
</div>`;
}

/** The chain key's words, shown once (F332, amended), with no question beside them: three are asked only once they are hidden (H3). */
export function words(ws: string[], say: string[], web = false): string {
  return `${top(web)}
<h2>The chain key’s words</h2>
<ul class="say">${say.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
<div class="words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<div class="row"><button class="primary" data-action="written">I have written them down</button><button class="quiet" data-action="abandon">Start again</button></div>
<p class="small">Once you go on, the words are hidden, and three of them are asked back.</p>`;
}

/** Three words typed back, the words hidden (H3: "it is useless if the words are still displayed when asked"). */
export function typeBack(positions: number[], web = false): string {
  return `${top(web)}
<div id="status"></div>
<h2>Three of the chain key’s words</h2>
<p class="small">From what you wrote down. Nothing is published until these three are right.</p>
<form id="confirm"><div class="typed">${positions
    .map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`)
    .join('')}</div>
<div class="row"><button type="submit" class="primary">Go on</button><button type="button" class="quiet" data-action="abandon">Start again with a new identity</button></div></form>`;
}

/** The signing key's words, on request (the carry Module, draft 2, 3.2 and 3.3). */
export function carry(c: { grouped: string; words: string[]; say: string[] }): string {
  return `<div class="card"><span class="label">The signing key’s words</span>
<p class="id">${e(c.grouped)}</p>
<ul class="say">${c.say.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
<div class="words" id="carry-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<div class="row"><button data-action="hide-carry">Hide them</button></div></div>`;
}

// ------------------------------------------------------------------ the app: two tabs

export function app(s: State, web = false): string {
  const i = s.identity!;
  return `<header class="bar"><h1 class="mark">${NAME}</h1>
<nav class="tabs"><button class="tab on" data-tab="public">Public<span class="count" id="count-public"></span></button><button class="tab" data-tab="private">Private<span class="count" id="count-private"></span></button>${i.signing ? '<button class="tab" data-tab="signing">Signing<span class="count" id="count-signing"></span></button>' : ''}</nav>
<button class="me" data-action="window" title="The identity window">${who(i.who)}</button></header>
${testNotice(web)}
<div id="spent"></div>
<div id="status"></div>
<section id="public">
<form id="post" class="compose">
<div id="replying"></div>
<textarea name="text" required placeholder="Write something public"></textarea>
<div class="to"><input name="to" autocomplete="off" spellcheck="false" placeholder="To an identity: its ID (a public message, left in its inbox too)"></div>
<div class="row"><label class="quiet-file"><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg"><span class="small" data-action="pick">Picture</span></label><button type="button" class="quiet" data-action="address">To…</button><span class="grow small" id="picked"></span><button type="submit" class="primary">Post</button></div>
</form>
<div class="filters"><button class="tab on" data-filter="all">Everyone</button><button class="tab" data-filter="toyou">To you<span class="count" id="count-toyou"></span></button><span class="grow"></span><button class="quiet" data-action="feed">Look again</button></div>
${people(s)}
<div id="feed"><p class="empty">Reading the feed…</p></div>
</section>
<section id="private" hidden>
<form id="message" class="compose">
<input name="to" autocomplete="off" spellcheck="false" placeholder="To: an identity’s ID" required>
<textarea name="text" required placeholder="Write something private"></textarea>
<div class="row"><span class="grow small">Sealed to them: only they can open it.</span><button type="submit" class="primary">Send</button></div>
</form>
${i.encryption ? '' : `<div class="note">No encryption key for this identity is here, so its private messages cannot be opened here: it was brought by words that do not carry the one it publishes.</div>`}
<div id="signing-waiting"></div>
<div id="inbox"><p class="empty">Reading the inbox…</p></div>
</section>
${
  i.signing
    ? `<section id="signing" hidden>
<div class="experimental"><strong>Even more experimental.</strong> ${e(SIGNING_LABEL)}</div>
<div id="signing-list"><p class="empty">Reading the proposals…</p></div>
</section>`
    : ''
}`;
}

/** Said at the top of the Signing tab (`signing.ts`, SIGNING_SAY), word for word. */
export const SIGNING_LABEL =
  'Even more experimental than Dub itself. Here you sign agreements for real collectives: founding one, changing its members, its releases. A signature binds you, and it is public. Read every proposal in full before signing; when in doubt, decline.';

const STATE_OF: Record<string, string> = { signed: 'Signed by you', declined: 'Declined' };

/** One proposal, read in plain words from the exact bytes of the act it names, with what can be done. */
export function proposal(p: Proposal): string {
  const r = p.reading;
  const head = `<h3>${e(r?.title ?? 'A proposal')}</h3><p class="small">From ${who(p.from)}${p.collective ? `, for the collective <span class="fp" title="${e(p.collective)}">${e(p.collective.slice(0, 8))}…${e(p.collective.slice(-4))}</span>` : ''}. Act <span class="fp" title="${e(p.act)}">${e(p.act.slice(0, 8))}…${e(p.act.slice(-4))}</span>.</p>
<p class="small">Their words with it:</p><div class="plain">${e(p.text)}</div>${p.later.map((t) => `<div class="plain">${e(t)}</div>`).join('')}`;
  if (!r) return `<div class="proposal" data-thread="${e(p.thread)}">${head}${note('error', e(p.problem ?? 'It could not be read.'))}</div>`;
  const body = `${r.summary.map((x) => `<p>${e(x)}</p>`).join('')}
${r.sections.map((x) => `<h4>${e(x.heading)}</h4>${lines(x.lines)}`).join('')}
${r.plain.map((x) => `<h4>${e(x.heading)}</h4><p class="small">As plain text, character for character; any invisible control is shown as &lt;U+…&gt;.</p><div class="plain">${e(x.text)}</div>`).join('')}
${r.kind === 'founding' || r.kind === 'clone' ? `<h4>Risks to read (${r.risks.length})</h4>${r.risks.length ? `<ul>${r.risks.map((f) => `<li>${e(f.text)} <span class="small">${e(f.rests)}</span></li>`).join('')}</ul>` : '<p class="small">None of the risks the deal-assessment tool knows.</p>'}` : ''}
${r.blocking.length ? note('error', `<strong>It cannot be signed here:</strong>${lines(r.blocking.map((text) => ({ text })))}`) : ''}`;
  const share =
    p.share === 'none'
      ? ''
      : p.share === 'waiting'
        ? `<p class="small">Your share of the collective’s chain key will arrive once every member has signed and the founder’s Edubba deals the key. Its one-time key waits in this app until then.</p><div class="row"><button class="quiet" data-action="sharehand" data-thread="${e(p.thread)}">I received my share by hand</button></div>`
        : p.share === 'ready'
          ? `<div class="row"><button class="primary" data-action="share" data-thread="${e(p.thread)}">Show my share of the chain key, once</button></div>`
          : p.share === 'shown'
            ? shareTypeBack(p.thread, p.positions ?? [])
            : p.share === 'byHand'
              ? '<p class="small">Your share came by hand. The one-time key is destroyed.</p>'
              : '<p class="small">Your share is written down. The one-time key is destroyed: nothing of it is here.</p>';
  const actions = p.answer
    ? `<p class="state">${e(STATE_OF[p.answer.verdict])}${p.answer.signature ? ` · signature act <span class="fp" title="${e(p.answer.signature)}">${e(p.answer.signature.slice(0, 8))}…</span>` : ''}</p>`
    : r.blocking.length
      ? `<div class="row"><button data-action="decline" data-thread="${e(p.thread)}">Decline</button></div>`
      : `<div class="row"><button class="primary" data-action="accept" data-thread="${e(p.thread)}">Sign it</button><button data-action="decline" data-thread="${e(p.thread)}">Decline</button></div><p class="small">Your signature is an act of yours, public: it binds you to exactly what is read above.</p>`;
  return `<div class="proposal" data-thread="${e(p.thread)}">${head}${body}${actions}${share}</div>`;
}

/** A share of a collective's chain key, shown once (H18), with nothing asked beside it. */
export function share(s: ShareShown): string {
  return `<div class="proposal" id="share-shown" data-thread="${e(s.thread)}"><span class="label">The collective’s chain key share</span>
<p class="share-number">Share <strong>${s.x}</strong> of ${s.holders}; any ${s.threshold} rebuild the key.${s.collective ? ` Collective <span class="fp" title="${e(s.collective)}">${e(s.collective.slice(0, 8))}…${e(s.collective.slice(-4))}</span>.` : ''}</p>
<ul class="say">${s.say.map((x) => `<li>${e(x)}</li>`).join('')}</ul>
<div class="words" id="share-words">${s.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<p class="small">The dealing’s fingerprint, the same for every member: compare it with theirs. <code>${e(s.fingerprint)}</code></p>
<div class="row"><button class="primary" data-action="share-written" data-thread="${e(s.thread)}" data-positions="${e(s.positions.join(','))}">I have written share ${s.x} and its 24 words down</button></div>
<p class="small">Once you go on, the words are hidden, and three of them are asked back.</p></div>`;
}

/** Three words of a share typed back, the words hidden (as H3). */
export function shareTypeBack(thread: string, positions: number[]): string {
  return `<form class="share-back" data-thread="${e(thread)}"><span class="label">Three words of your share</span><p class="small">From what you wrote down. The one-time key is destroyed only once these are right.</p><div class="typed">${positions
    .map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`)
    .join('')}</div><div class="row"><button type="submit" class="primary">Check them</button></div></form>`;
}

/** Follow and mute (the people cMIP): quiet, folded away. */
export function people(s: State): string {
  const i = s.identity!;
  const row = (w: Who, actions: string) => `<li>${who(w)}<span class="acts">${actions}</span></li>`;
  return `<details class="people" id="people"><summary>Following ${i.follows.length}${i.muted.length ? ` · muted ${i.muted.length}` : ''}</summary>
<form id="follow" class="row"><input class="grow" name="id" autocomplete="off" spellcheck="false" placeholder="Follow an identity: its ID" required><input class="pet" name="name" autocomplete="off" placeholder="Your name for it (stays here)"><button type="submit">Follow</button></form>
${i.follows.length ? `<ul>${i.follows.map((f) => row(f, `<button data-action="call" data-id="${e(f.id)}">Name</button><button data-action="unfollow" data-id="${e(f.id)}">Unfollow</button>`)).join('')}</ul>` : '<p class="small">Nobody yet. Follow by ID, or from any post or message.</p>'}
${i.muted.length ? `<span class="label">Muted</span><ul>${i.muted.map((m) => row(m, `<button data-action="unmute" data-id="${e(m.id)}">Unmute</button>`)).join('')}</ul>` : ''}
<div class="row"><label class="small check"><input type="checkbox" id="publish-list" ${i.list === 'published' ? 'checked' : ''}> Publish whom this identity follows</label></div>
<p class="small">${i.list === 'published' ? 'Published: anyone can read the IDs it follows. The names you gave them stay here.' : 'Private, the default: the list stays in this app. Muting is always private.'}</p>
</details>`;
}

const bad = (standing: string) => /void|contest|invalid|stolen/.test(standing);

/** A post: compact, its action row quiet. A long-form document is not shown: a link opens it in the reader. */
export function post(p: Item): string {
  const flag = p.problem ? `<span class="flag ${bad(p.problem) ? 'bad' : ''}">${e(p.problem)}</span>` : '';
  const answers = p.answers
    .map((a) => `<div class="re">↳ answering ${a.who ? who(a.who) : '<span class="fp">an act not found</span>'}${a.snippet ? ` · <span dir="auto">${e(a.snippet)}</span>` : ''}</div>`)
    .join('');
  const pics = p.pictures
    .map((x) =>
      x.src
        ? `<figure><img src="${e(x.src)}" width="${x.width}" height="${x.height}" alt=""></figure>`
        : `<figure><figcaption>A picture not shown: ${e(x.problem ?? 'unknown')}.</figcaption></figure>`,
    )
    .join('');
  const doc = p.doc
    ? `<a class="doc" href="${e(p.doc.link)}" target="_blank" rel="noopener noreferrer"><span dir="auto">${e(p.doc.title)}</span><span class="small">A long-form document: open it in the reader</span></a>`
    : '';
  const acts = [
    `<button data-action="reply">Reply</button>`,
    p.who.me ? '' : p.who.followed ? `<button data-action="unfollow" data-id="${e(p.who.id)}">Following</button>` : `<button data-action="follow" data-id="${e(p.who.id)}">Follow</button>`,
    p.who.me ? '' : `<button data-action="mute" data-id="${e(p.who.id)}">Mute</button>`,
    ...p.pictures.filter((x) => x.withdrawable).map((x) => `<button data-action="withdraw" data-publication="${e(x.publication)}">Withdraw picture</button>`),
  ].join('');
  return `<article class="post" data-post="${e(p.id)}" data-signer="${e(p.who.id)}">
<div class="row tight">${who(p.who)}${flag}</div>${answers}
${p.text ? `<div class="text" dir="auto">${e(p.text)}</div>` : ''}${pics}${doc}
<div class="acts">${acts}</div></article>`;
}

/** A private message, received or sent here. */
export function msg(m: Message): string {
  const flag = m.problem ? `<span class="flag ${bad(m.problem) ? 'bad' : ''}">${e(m.problem)}</span>` : '';
  const acts =
    m.dir === 'in' && m.who.id
      ? [
          `<button data-action="answer" data-id="${e(m.who.id)}">Reply</button>`,
          m.who.followed ? '' : `<button data-action="follow" data-id="${e(m.who.id)}">Follow</button>`,
          `<button data-action="mute" data-id="${e(m.who.id)}">Mute</button>`,
        ].join('')
      : '';
  return `<article class="msg ${m.dir}" data-key="${e(m.key)}">
<div class="row tight">${m.dir === 'out' ? '<span class="small">to</span>' : ''}${who(m.who)}<span class="sealed">sealed</span>${flag}</div>
${m.text ? `<div class="text" dir="auto">${e(m.text)}</div>` : ''}
${acts ? `<div class="acts">${acts}</div>` : ''}</article>`;
}

/** The spent key, said plainly, and the new signing key's words taken (F332, amended). */
export function spent(say: string): string {
  return note(
    'spent',
    `<p>${e(say)}</p><form id="renew"><label>The new signing key’s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="row"><button type="submit" class="primary">Use the new words</button></div></form>`,
  );
}
