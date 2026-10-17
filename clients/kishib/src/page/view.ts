// Kišib's page, as HTML strings, for the program on the Mac and Linux and
// for the web client alike (`web` set). Everything from the program, from
// relays or typed by the person is escaped.
//
// The look is Dub's (F332): calm and sparse, one column, the visual bible's
// background #06080c, Inter, low saturation, red only for a contest, a void
// act or a stolen key, no glow. Dub's style, with a few additions for
// reviews and the cards of the first screen.

import { e } from '../../../manage/src/view.ts';
import { STYLE as DUB_STYLE } from '../../../dub/src/page/view.ts';
import type { Line, Review, Section, Sitting, State } from '../shapes.ts';

export { e };
export type { Line, Review, Section, Sitting, State };

export const NAME = 'Kišib';
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/**
 * The web client's banner, on every page it shows: for testing only, and
 * the risks in plain words. In the page's HTML itself (`static/web.html`,
 * written there by the build), so it shows even when the script does not
 * run.
 */
export const WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. The risks, in plain words:</p>
<ol><li>The words you type here are your chain key: whoever serves this page’s code at that moment could copy them, and with them change your identity’s keys, or keep a collective’s whole key.</li>
<li>This browser, its extensions and whatever else runs on this device see what you type. A collective’s whole chain key is rebuilt in the device that rotates it.</li>
<li>Kišib keeps nothing in this browser’s storage; but nothing can prove a device forgot what it held.</li></ol>
<p>Use the app on a clean device for anything of value; ideally a device used for nothing else. Never here for a real identity.</p></div>`;

/**
 * Kišib's tint (H36): the Identity layer's glacier blue, #8ec5f0 in the
 * visual bible, at low saturation, on outlines, separators and quiet accents
 * only, never on text that must be read; red stays for a contest, a void act
 * or a stolen key. Each value is the layer colour laid over the background
 * #06080c at a share: separators 22% (#24323e), outlines 30% (#2f4150),
 * quiet accents (a hover or focus outline, a fold's mark) 60% (#587995).
 * The other apps take theirs the same way from their own layer's colour.
 */
export const TINT = { layer: '#8ec5f0', line: '#24323e', edge: '#2f4150', accent: '#587995' } as const;

/** The page's style: Dub's, Kišib's tint over it, and Kišib's few additions. */
export const STYLE = `${DUB_STYLE}
:root{--line:${TINT.line};--edge:${TINT.edge};--tint:${TINT.accent}}
button:hover,.door:hover{border-color:var(--tint)}
input:focus,textarea:focus{border-color:var(--tint)}
details>summary::before{color:var(--tint)}
.bar{border-bottom-color:var(--edge)}
.door{display:block;width:100%;text-align:left;border:1px solid var(--edge);border-radius:14px;padding:12px 16px;margin:10px 0;background:none}
.door strong{display:block;font-weight:400;font-size:15px;color:var(--text)}
.door span{display:block;font-size:13px;color:var(--soft);margin-top:2px}
.door.rare strong{color:var(--soft)}
.review{border:1px solid var(--edge);border-radius:12px;padding:12px 14px;margin:12px 0;background:var(--raise)}
.review h3{margin:14px 0 4px;font-size:13px;color:var(--soft)}
.review ul{margin:4px 0;padding-left:1.1em;font-size:14px}
.review li{margin:3px 0}
li.bad{color:var(--bad)}
li.ok{color:var(--text)}
li.warn{color:var(--soft)}
.signs{border:1px solid var(--edge);border-radius:10px;padding:10px 12px;margin:12px 0}
.signs p{margin:4px 0;font-size:14px}
.mustread{border:1px solid var(--bad);border-radius:12px;padding:12px 14px;margin:12px 0}
.mustread h3{margin:0 0 6px;font-weight:400}
.fpr{font:15px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity);letter-spacing:.04em}
.full{font:12px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--soft);overflow-wrap:anywhere}`;

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export const lines = (ls: Line[]) => `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;

/** The test notice, under every screen of the program. The web client's banner is in its page already. */
function testNotice(web: boolean): string {
  return web ? '' : `<div class="banner" id="test-only">${TEST_ONLY}. Kišib writes nothing of your words to this device; what it holds for an act lives in the program’s memory, and is gone when it stops.</div>`;
}

export function top(web = false, back = false): string {
  return `<header class="bar"><h1 class="mark">${NAME}</h1><span class="grow"></span>${back ? '<button class="quiet" data-action="home">Back to the start</button>' : `<span class="small">${web ? 'web client, for testing only' : 'this machine only'}</span>`}</header>
${testNotice(web)}`;
}

export function pairing(): string {
  return `${top()}
<h2>Pair this browser</h2>
<p class="small">This page acts for the Kišib program running on this machine. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" class="grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit">Pair</button></form>
<div id="pair-status"></div>`;
}

/** The first screen: what Kišib is, and its doors. */
export function start(web: boolean): string {
  const door = (action: string, title: string, say: string, rare = false) => `<button class="door${rare ? ' rare' : ''}" data-action="open" data-form="${action}"><strong>${title}</strong><span>${say}</span></button>`;
  return `${top(web)}
<p>Kišib is the one place where a chain key is used, from paper, and then forgotten. Open it only for the act at hand.</p>
<h2>What it does</h2>
${door('rotate', 'Change an identity’s keys', 'From its chain key’s 24 words on paper: a new signing key, every line of its acts kept. For a lost or stolen phone, or any time.')}
${door('start', 'Rotate a collective', 'From its members’ paper shares, completing a member change signed in Edubba. Started by the member who proposed it.')}
${door('give', 'Give my share to a collective’s rotation', 'When a member asks for your paper share: read the rotation, then give it.')}
${door('escape', 'Escape a contested position', 'Someone else changed your keys with your chain key’s words: leave with both keys, to new homes.')}
${door('succession', 'Name or confirm a successor', 'Name the identity that succeeds yours (with the chain key’s words), or, as the successor, confirm it.')}
<h2>What it may do</h2>
${door('check', 'Check paper words', 'Whether these are the right words for an identity. Nothing is signed.', true)}
${door('record', 'Show an identity’s record', 'Its homes, receipts, lines and any contest, in plain words.', true)}`;
}

const idField = (name: string, label: string) => `<label>${label}</label><input name="${name}" type="text" autocomplete="off" spellcheck="false" required>`;
const words = (name: string, label: string) => `<label>${label}</label><textarea name="${name}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>`;
const address = `<label>An address where it is found (one of its homes)</label><input name="address" type="text" placeholder="https://" required>`;
const forgotten = `<p class="small">What you type is used for this act alone, then overwritten. Nothing is written to this device.</p>`;

/** The units a vault may name, as the program lists them (set by the page on each state). */
let units: { hash: string; label: string; network: number }[] = [];
export const setUnits = (u: { hash: string; label: string; network: number }[] | undefined) => (units = u ?? []);

/** The vault, in a change of keys (Money rule 2: only with the chain key; decided by Nobody, allegedly: "its setting belongs in Kišib"). Kept unless chosen. */
const vaultFields = `<details><summary>The vault (optional): keep it, change it, or remove it</summary>
<p class="small">The vault is where a payment above a limit must go, per unit, and the one place a thief holding only the signing key cannot point payments (Money rules 2 and 3). It changes only with the chain key, so only here. Its node or key should be another than your flow’s, which Damgar names.</p>
<label>The vault</label><select name="vault"><option value="keep" selected>Keep it as it is</option><option value="set">Declare it anew, as below</option><option value="remove">Remove it (every payment to the flow)</option></select>
<div class="row"><label>Its unit <select name="vaultUnit" data-vault-units>${'{units}'}</select></label><label>Network <select name="vaultNetwork"><option value="3" selected>regtest</option><option value="2">signet</option></select></label></div>
<label>Lightning: the vault’s node key (66 hexadecimal characters; not your flow’s node)</label><input name="vaultNode" autocomplete="off" spellcheck="false">
<label>Its limit: the largest single payment that may still go to the flow (0: every payment to the vault)</label><input name="vaultLightningLimit" inputmode="numeric" value="0">
<label>On-chain: the vault’s Bitcoin key, x-only (64 hexadecimal characters)</label><input name="vaultKey" autocomplete="off" spellcheck="false">
<label>Its request key (Damgar’s Settings show one; it signs address requests, and must stay online)</label><input name="vaultRequest" autocomplete="off" spellcheck="false">
<label>Its limit</label><input name="vaultOnchainLimit" inputmode="numeric" value="0"></details>`;

/** A form for one door. */
export function form(kind: string, web: boolean): string {
  const f = (title: string, intro: string, body: string, button: string) =>
    `${top(web, true)}<h2>${title}</h2><p class="small">${intro}</p><form id="form-${kind}" data-kind="${kind}">${body}${forgotten}<div class="row"><button type="submit" class="primary">${button}</button></div></form><div id="status"></div>`;
  switch (kind) {
    case 'rotate':
      return f(
        'Change an identity’s keys',
        'Kišib reads the identity from its homes and every relay its routes name, finds every line of its acts (Dub’s, Edubba’s, the web client’s), and reads it all back in plain words before anything is signed.',
        `${idField('id', 'The identity’s ID')}${address}${words('words', 'Its chain key’s 24 words, in order (the paper written when it was made; never the signing key’s words)')}
<details><summary>Lines another app made that cannot be read here</summary><label>Their cards, one per line: latest act, position, summary (as that app shows them)</label><textarea name="cards"></textarea></details>${vaultFields.replace('{units}', units.map((u) => `<option value="${e(u.hash)}">${e(u.label)}</option>`).join(''))}`,
        'Read it back',
      );
    case 'succession':
      return `${top(web, true)}<h2>Name or confirm a successor</h2>
<p class="small">A succession needs both sides (F300): the identity names its successor in a change of its keys, signed with its chain key; the successor confirms it with an act of its own. Until it confirms, clients show it as declared and follow nobody.</p>
<h3>Name a successor, as the identity that will be succeeded</h3>
<form id="form-rotate" data-kind="rotate">${idField('id', 'Your identity’s ID')}${address}${words('words', 'Your chain key’s 24 words')}${idField('successor', 'The successor’s ID')}${forgotten}<div class="row"><button type="submit" class="primary">Read it back</button></div></form>
<h3>Confirm, as the successor</h3>
<form id="form-confirm" data-kind="confirm">${idField('owner', 'The ID of the identity that named you')}${idField('successor', 'Your ID')}${address}${words('words', 'Your signing key’s 24 words (as Dub shows them)')}${forgotten}<div class="row"><button type="submit" class="primary">Read it back</button></div></form><div id="status"></div>`;
    case 'escape':
      return f(
        'Escape a contested position, with both keys',
        'For when someone else has changed your identity’s keys with your chain key’s words (they were stolen), or two changes contest one position of a self-hosted identity. You need both papers: the chain key’s words, and the signing key’s words of the key you held before. You leave to new homes.',
        `${idField('id', 'The identity’s ID')}${address}${words('words', 'Its chain key’s 24 words')}${words('signingWords', 'Its signing key’s 24 words, the key you held before the other change')}
<label>New homes (one address per line): not the old ones, which hold the other change</label><textarea name="homes" required placeholder="https://"></textarea>`,
        'Read it back',
      );
    case 'start':
      return f(
        'Rotate a collective',
        'This completes a member change proposed in Edubba and signed by every member. The member who proposed it starts here. Remote: the other members give their shares in their own Kišib, within an hour. In the same room: their papers are typed here, one after another.',
        `${idField('collective', 'The collective’s ID')}${address}
<label>Your share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>
${words('shareWords', 'Your share’s 24 words')}
<label class="check"><input type="checkbox" name="room"> Everyone is here: type every paper on this device; nothing is sent, and no signing words are needed</label>
<div data-remote>${idField('founder', 'Your ID (you proposed the change)')}${words('founderWords', 'Your signing key’s 24 words: they open your members’ answers, with the one-time keys their new shares go to')}</div>`,
        'Read it back',
      );
    case 'give':
      return f(
        'Give my share to a collective’s rotation',
        'The member who started the rotation sent you its fingerprint (in Dub, in the proposal’s thread). Kišib reads the rotation back to you first.',
        `${idField('collective', 'The collective’s ID')}<label>The rotation’s fingerprint (64 characters)</label><input name="fingerprint" type="text" autocomplete="off" spellcheck="false" required>${address}
<div class="row"><button type="button" data-action="read request">Read the rotation first</button></div><div id="request"></div>
${idField('member', 'Your ID')}<label>Your share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>
${words('shareWords', 'Your share’s 24 words')}${words('memberWords', 'Your signing key’s 24 words (to sign the small act that carries your share)')}`,
        'Read it back',
      );
    case 'check':
      return f('Check paper words', 'Kišib derives the chain key from the words and compares it with what the identity’s chain commits to. Nothing is signed.', `${idField('id', 'The identity’s ID')}${address}${words('words', 'The chain key’s 24 words')}`, 'Check them');
    case 'record':
      return f('Show an identity’s record', 'As any reader would see it, judged by the core library.', `${idField('id', 'The identity’s ID')}${address}`, 'Read it');
    default:
      return start(web);
  }
}

export function sections(ss: Section[]): string {
  return ss.map((s) => `<h3>${e(s.heading)}</h3>${lines(s.lines)}`).join('');
}

/** A review: read in full before signing; the warning, where a line is left out, must be read too. */
export function review(r: Review, web: boolean, mustRead: boolean): string {
  const blocked = r.blocking.length > 0;
  const must = mustRead ? r.sections[0] : null;
  const rest = mustRead ? r.sections.slice(1) : r.sections;
  return `${top(web, true)}<h2>${e(r.title)}</h2>
${r.summary.map((s) => `<p class="small">${e(s)}</p>`).join('')}
${must ? `<div class="mustread" id="mustread"><h3>${e(must.heading)}</h3>${lines(must.lines)}<label class="check"><input type="checkbox" id="read-it"> I have read this, and chosen this device knowingly</label></div>` : ''}
<div class="review">${sections(rest)}</div>
${blocked ? note('error', `Nothing can be signed yet:${lines(r.blocking.map((t) => ({ text: t, tone: 'bad' })))}`) : ''}
${r.warning ? note('error', `${e(r.warning)}<label class="check"><input type="checkbox" id="warned"> I understand: leave ${'them'} out</label>`) : ''}
<div class="signs"><span class="label">What is signed</span>${r.signs.map((s) => `<p>${e(s)}</p>`).join('')}</div>
<div class="row"><button class="primary" data-action="sign" ${blocked ? 'disabled' : ''}>Sign it</button><button data-action="home">Cancel, and forget the words</button></div><div id="status"></div>`;
}

/** The words, shown once, before they are hidden and three asked back. */
export function wordsShown(ws: string[], say: string[], web: boolean, label = 'The new signing key’s words'): string {
  return `${top(web)}<h2>${e(label)}</h2>${say.map((s) => `<p class="small">${e(s)}</p>`).join('')}
<div class="words" id="words">${ws.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join('')}</div>
<div class="row"><button class="primary" data-action="written">I have written them down</button></div>`;
}

export function askBack(positions: number[], web: boolean): string {
  return `${top(web)}<h2>Three of the words, from your paper</h2><p class="small">The words are hidden. Type the ones asked, from what you wrote.</p>
<form id="typed"><div class="typed">${positions.map((p) => `<label>Word ${p}<input name="w${p}" autocomplete="off" spellcheck="false" required></label>`).join('')}</div>
<div class="row"><button type="submit" class="primary">Check</button><button type="button" data-action="show words">Show them again</button></div></form><div id="status"></div>`;
}

/** Where a sitting stands, with what can be done next. */
export function sitting(s: Sitting, web: boolean): string {
  const btn = (action: string, label: string, primary = false, extra = '') => `<button ${primary ? 'class="primary" ' : ''}data-action="${action}"${extra}>${label}</button>`;
  const q = s.request;
  const req = q
    ? `<div class="review" id="request-state">${q.room ? `<p>${q.have} of ${q.need} paper shares are in, typed here.</p>` : `<p>Fingerprint of this rotation</p><p class="fpr">${e(q.fingerprint)}</p><p class="full">${e(q.full)}</p><p>${q.have} of ${q.need} shares are in. The one-time key expires at ${e(new Date(q.expires * 1000).toISOString().replace('T', ' ').slice(0, 16))} UTC (this device’s clock).</p>`}</div>`
    : '';
  const acts: string[] = [];
  if (s.stage === 'sent') acts.push(btn('refresh', 'Look again'), btn('resend', 'Send it again (the same bytes)', true));
  if (s.stage === 'counts' && s.kind !== 'confirm') acts.push(btn('show words', s.kind === 'collective' ? 'Show the collective’s new signing key’s words' : 'Show the new signing key’s words', true));
  if (s.stage === 'shown') acts.push(btn('show words', 'Show them again'));
  if (s.stage === 'waiting' && q) {
    if (!q.room) acts.push(btn('gather', 'Look for the members’ shares', q.have < q.need));
    if (q.have >= q.need) acts.push(btn('rotate collective', 'Rebuild, rotate and deal now', true));
  }
  const paper =
    s.stage === 'waiting' && q?.room && q.have < q.need
      ? `<form id="paper"><label>The next share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words('words', 'Its 24 words')}<div class="row"><button type="submit" class="primary">Add this paper</button></div></form>`
      : '';
  const shares = s.shares?.length
    ? `<h3>New shares to show here, once each</h3><ul class="say">${s.shares.map((x) => `<li>Share ${x.x}, for <span class="fp">${e(x.holder.slice(0, 8))}…${e(x.holder.slice(-4))}</span>: ${x.shown ? 'written down, forgotten here' : btn('show share', 'Show it', false, ` data-holder="${e(x.holder)}"`)}</li>`).join('')}</ul>`
    : '';
  const done = s.stage === 'done' || s.stage === 'expired';
  return `${top(web)}<h2>${e(s.title)}</h2>${req}<div class="review">${lines(s.lines)}</div>${paper}${shares}
<div class="row">${acts.join('')}${done && !(s.shares ?? []).some((x) => !x.shown) ? btn('home', 'Done: back to the start', true) : ''}</div><div id="status"></div>`;
}
