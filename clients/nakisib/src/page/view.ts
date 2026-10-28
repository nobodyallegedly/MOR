// Nakišib's page, on the Dubsar Suite's kit: what each screen says, as HTML
// strings. Its own colour is stone, quiet; dominantly black as the suite.
// The page holds no rule: every check, summary and signature is the
// Module's, in Nakišib's program (`src/sitting.rs`); this draws what the
// program says and hands each choice back to it.

import { KIT_STYLE } from '../../../kit/src/style.ts';
import { appMark, e, ICONS, note, opened, say, tiles, top, type ColumnEntry } from '../../../kit/src/html.ts';

export const NAME = 'Nakišib';

/** Stone: quiet greys with a little warmth, in the kit's four values. */
export const STONE = { colour: '#b9b2a5', pastel: '#ddd8ce', wash: 'rgba(221,216,206,.06)', wash2: 'rgba(221,216,206,.13)' } as const;

export const NEVER = 'This Mac should never connect again.';

/** Said once on the first screen, under the line above. */
export const NEVER_MORE = [
  'Nakišib opens no connection: not to a home, a relay, a font or an update. Its page is served on this Mac alone (127.0.0.1).',
  'Keep Wi-Fi off and Bluetooth off, and plug in nothing but the USB stick that carries files between this Mac and Kišib.',
  'It keeps nothing secret: a paper’s words are typed for one use and overwritten once used. It keeps only its memory of what it signed, so it never signs two different changes for one key. A stolen Mac gives nothing.',
  'Test identities only, until the step 17 rehearsal.',
];

export const STYLE = `${KIT_STYLE}
.k-nakisib{--k-c:${STONE.colour};--k-p:${STONE.pastel};--k-wash:${STONE.wash};--k-wash2:${STONE.wash2}}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.nk-never{flex:none;margin:0;padding:8px 20px;border-bottom:1px solid var(--k-line);font-size:14px;color:var(--k-text)}
.nk-never strong{font-weight:400;color:var(--k-p);letter-spacing:.01em}
.nk-holds{white-space:nowrap;padding:4px 14px;border:1px solid var(--k-line);border-radius:999px;font-size:13px;color:var(--k-soft)}
.nk-steps{display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--k-faint);margin:2px 0 10px}
.nk-steps .nk-done{color:var(--k-soft)}.nk-steps .nk-now{color:var(--k-text)}
.nk-loud{border:1px solid var(--k-p);border-radius:14px;padding:12px 16px;margin:10px 0}
.nk-loud h3{margin:0 0 6px;font-size:13px;letter-spacing:.08em;color:var(--k-p);font-weight:400}
.nk-loud p{margin:4px 0;color:var(--k-text)}
.nk-plain p{margin:3px 0}
.nk-apart{border-left:2px dashed var(--k-edge);padding:4px 12px;margin:10px 0}
.nk-id{font:12.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id);word-break:break-all}
.nk-typed{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.nk-sign input{max-width:12em;font:15px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.1em}
.nk-pane{padding:20px 28px;overflow:auto;max-width:860px}
.nk-list{list-style:none;padding:0;margin:0}
.nk-list li{border:1px solid var(--k-line);border-radius:14px;padding:10px 14px;margin:8px 0}
.k-home.nk-three>.k-tile:last-child{grid-column:1 / -1}
.nk-homefoot{flex:none;padding:0 28px 10px}
.nk-foot{flex:none;display:flex;gap:10px;align-items:center;padding:8px 20px;border-top:1px solid var(--k-line)}
@media (max-width:700px){.k-home.nk-three>.k-tile:last-child{grid-column:auto}.nk-typed{grid-template-columns:1fr}.nk-pane{padding:14px}}
`;

export interface Summary {
  prominent: string[];
  plain: string[];
  notChecked: string[];
  context: string[];
}

export interface State {
  stage: string;
  kind?: 'rotation' | 'first';
  preview?: { identity: string; position: number; index: number; summary: Summary; supplied: boolean; already: 'new' | 'same' | 'other'; sameAct: string | null; otherAct: string | null };
  summary?: Summary | null;
  repeat?: boolean;
  asked?: number[] | null;
  act?: string | null;
  written?: string[];
  module?: string;
  commit?: string | null;
}

export interface Shown {
  module: string;
  parts: string[];
  say: string[];
}

export interface Signed {
  key: string;
  identity: string | null;
  position: number | null;
  act: string;
  homeless: boolean;
}

const p = (t: string, cls = '') => `<p${cls ? ` class="${cls}"` : ''}>${e(t)}</p>`;
const btn = (action: string, label: string, primary = false, extra = '') => `<button type="button" class="k-btn${primary ? ' k-p' : ''}" data-action="${action}"${extra}>${e(label)}</button>`;

const ROTATION_STEPS = ['Read', 'Its summary', 'Your paper', 'The new paper', 'SIGN', 'Write'];
const FIRST_STEPS = ['The paper', 'Three asked back', 'The commitment'];

function steps(all: string[], at: number): string {
  return `<div class="nk-steps" aria-label="Steps">${all.map((s, i) => `<span class="${i < at ? 'nk-done' : i === at ? 'nk-now' : ''}">${i < at ? '✓ ' : ''}${e(s)}</span>${i < all.length - 1 ? '<span>›</span>' : ''}`).join('')}</div>`;
}

/** A summary as the Module writes it: the consequential lines first, under its own heading in capitals; then the rest; then what was not checked; then the online side's words, apart. */
export function summary(s: Summary, id = 'summary'): string {
  return `<div id="${id}">${s.prominent.length ? `<div class="nk-loud"><h3>CONSEQUENTIAL — READ BEFORE SIGNING</h3>${s.prominent.map((t) => p(t)).join('')}</div>` : ''}
<div class="nk-plain">${s.plain.map((t) => p(t)).join('')}</div>
${s.notChecked.length ? `<div class="k-box"><h3>Nakišib did NOT check</h3>${s.notChecked.map((t) => p(t, 'k-small k-soft')).join('')}</div>` : ''}
${s.context.length ? `<div class="nk-apart"><p class="k-small k-faint">Kišib’s own words, NOT checked, never trusted:</p>${s.context.map((t) => p(t, 'k-small k-soft')).join('')}</div>` : ''}</div>`;
}

function topBar(): string {
  return top({ left: `<button type="button" class="k-btn k-q" data-action="home" title="The first screen">${appMark(NAME, 'icon.png')}</button>`, right: '<span class="nk-holds">Offline · keeps nothing secret</span>' });
}

/** The line under the top, on every screen. */
export const NEVER_LINE = `<div class="nk-never" role="note"><strong>${e(NEVER)}</strong></div>`;

const FOOT = `<div class="nk-foot"><span class="k-small k-faint k-grow">Closing Nakišib forgets everything it holds now.</span>${btn('forget', 'Forget')}${btn('quit', 'Quit Nakišib')}</div>`;

export function home(): string {
  return `${topBar()}${NEVER_LINE}<div class="k-body k-col-flex">${tiles([
    { key: 'rotation', name: 'Change keys', say: 'Read a request from Kišib: your paper, a new paper, SIGN.', icon: 'paper', danger: 3 },
    { key: 'first', name: 'A new identity', say: 'Its first paper, and the commitment Kišib makes the identity from.', icon: 'identities', danger: 3 },
    { key: 'signed', name: 'What it signed', say: 'Its memory: each change it signed. Nothing secret in it.', icon: 'choose', danger: 1 },
  ]).replace('class="k-home"', 'class="k-home nk-three"')}</div><div class="nk-homefoot">${say('What “never connect” means, and what Nakišib keeps', NEVER_MORE)}</div>${FOOT}`;
}

const COLUMN: ColumnEntry[] = ['Nakišib', { key: 'rotation', label: 'Change keys' }, { key: 'first', label: 'A new identity' }, { key: 'signed', label: 'What it signed' }];

export function frame(on: string, pane: string): string {
  return `${topBar()}${NEVER_LINE}${opened(COLUMN, on, `<div class="nk-pane" id="pane">${pane}</div>`)}${FOOT}`;
}

/** A file to read or write: the Mac's own dialog where there is one; a path typed where not. */
export function fileRow(action: string, label: string, typed: boolean): string {
  return `<div class="k-row">${btn(action, label, true)}</div>${typed ? `<form data-path="${action}" autocomplete="off"><label>Or type the file’s path</label><div class="k-row"><input name="path" spellcheck="false" autocomplete="off"><button type="submit" class="k-btn">${e(label.replace('…', ''))}</button></div></form>` : ''}`;
}

export function rotationStart(typed: boolean): string {
  return `${steps(ROTATION_STEPS, 0)}<h2>Read a request from Kišib</h2>
${p('Kišib wrote it to the USB stick (Change keys with Nakišib, “Write the request for Nakišib”). Nakišib believes none of it: it reads the exact bytes itself, and shows what they really say.', 'k-soft')}
${fileRow('read', 'Choose the file…', typed)}`;
}

export function preview(s: State): string {
  const v = s.preview!;
  const already =
    v.already === 'same'
      ? note('done', `Nakišib signed this same request before. It answers with the same signed bytes, without your paper: ${btn('same', 'Answer it again: the same bytes', true)}`)
      : v.already === 'other'
        ? note('error', `This chain key already signed a different change of keys (${e(v.otherAct ?? '')}). Nakišib signs no other with it, and will refuse once your paper is typed. If you did not make that change, someone holds your paper: use Kišib’s “Escape a contested position”.`)
        : '';
  return `${steps(ROTATION_STEPS, 1)}<h2>What these bytes say</h2>
${p(`Nakišib’s own reading of the request, before any paper: identity ${v.identity}, the change of its keys at position ${v.position}, signed with its chain key number ${v.index}.`, 'k-small k-soft')}
${already}${summary(v.summary, 'preview')}
${v.already === 'same' ? '' : paperForm()}`;
}

function paperForm(): string {
  return `<form id="paper" class="k-box k-fill" autocomplete="off"><h3>Your paper</h3>${p('The chain key’s paper this identity uses now: its 24 words, or the 72 characters of a hex paper. Nakišib uses it for this request only and overwrites it once signed; the Module checks again everything above with it.', 'k-small k-soft')}
<label>The paper</label><textarea name="words" rows="4" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Use this paper</button><span class="k-small k-faint">Nothing is signed yet.</span></div></form>`;
}

export function reviewed(s: State): string {
  return `${steps(ROTATION_STEPS, 3)}<h2>The paper is the right one</h2>
${note('done', 'It gives the chain key this request is signed with. The Module has checked the request again with it, and built the change of keys it will sign.')}
${p('Next, a new paper: the next change of keys needs it. It is drawn now on this Mac, shown once, then hidden; three of its parts are asked back. Nothing is signed before.', 'k-soft')}
<div class="k-row">${btn('show', 'Show the new paper', true)}</div>`;
}

export function shown(w: Shown, first: boolean): string {
  const hex = w.module === 'hex';
  return `${first ? steps(FIRST_STEPS, 0) : steps(ROTATION_STEPS, 3)}<h2>${first ? 'The first paper of a new identity' : 'The new paper'}</h2>${w.say.map((t) => p(t, 'k-small k-soft')).join('')}
<div class="k-words" id="words">${w.parts.map((x, i) => `<span><b>${hex ? i * 4 + 1 : i + 1}.</b>${e(x)}</span>`).join('')}</div>
${hex ? p('Each group is four characters; the numbers are each group’s first character.', 'k-small k-faint') : ''}
<div class="k-row">${btn('hide', 'I have written it down', true)}</div>`;
}

export function askBack(asked: number[], first: boolean, hex: boolean): string {
  const what = hex ? 'Group' : 'Word';
  return `${first ? steps(FIRST_STEPS, 1) : steps(ROTATION_STEPS, 3)}<h2>Three parts, from your paper</h2>${p(`The paper is hidden. Type the ${hex ? 'groups' : 'words'} asked, from what you wrote.`, 'k-small k-soft')}
<form id="typed" autocomplete="off"><div class="nk-typed">${asked.map((n) => `<label>${what} ${n}<input name="t${n}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></label>`).join('')}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Check</button>${btn('show', 'Show it again')}</div></form>`;
}

export function signScreen(s: State): string {
  return `${steps(ROTATION_STEPS, 4)}<h2>${s.repeat ? 'Signed before: the same bytes' : 'Sign this change of keys'}</h2>
${s.repeat ? note('done', 'ALREADY SIGNED: Nakišib answers with the same signed bytes; it signs nothing new.') : note('done', 'The new paper is written: three of its parts matched. Below, the Module’s own summary of the exact bytes it will sign.')}
${summary(s.summary!, 'module-summary')}
<form id="sign" class="nk-sign" autocomplete="off"><label>Type SIGN to sign exactly this</label><div class="k-row"><input name="word" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit" class="k-btn k-p">Sign</button>${btn('forget', 'Cancel, and forget both papers')}</div></form>`;
}

export function signed(s: State, typed: boolean): string {
  const w = s.written ?? [];
  return `${steps(ROTATION_STEPS, w.length ? 6 : 5)}<h2>${w.length ? 'Written' : 'Signed'}</h2>
${note('done', `The change of keys is signed (act <span class="nk-id">${e(s.act ?? '')}</span>). Both papers’ words are forgotten here; Nakišib’s memory holds what it signed, nothing secret.`)}
${w.length ? `${p(`Written to ${w.join(', ')}.`)}${p('Carry the stick to Kišib: “Read Nakišib’s answer”. Kišib checks it is the change it asked for, then sends it to every home. Keep the new paper apart from every device: the next change of keys needs it.', 'k-soft')}` : p('Write the signed change of keys to the USB stick, for Kišib.', 'k-soft')}
${fileRow('write', w.length ? 'Write it again elsewhere…' : 'Choose where to write it…', typed)}
${w.length ? `<div class="k-row">${btn('forget', 'Done', true)}</div>` : ''}`;
}

export function firstStart(): string {
  return `${steps(FIRST_STEPS, 0)}<h2>A new identity’s first paper</h2>
${p('For an identity Kišib makes (“Make an identity with Nakišib”): Nakišib draws the paper here, shows it once, asks three parts back, then writes only its commitment for Kišib. The paper never leaves this Mac, and Nakišib forgets it.', 'k-soft')}
<div class="k-row">${btn('first', 'Draw a paper of 24 words', true, ' data-module="words"')}${btn('first', 'Draw a hex paper (72 characters)', false, ' data-module="hex"')}</div>`;
}

export function firstReady(s: State, typed: boolean): string {
  const w = s.written ?? [];
  return `${steps(FIRST_STEPS, 2)}<h2>${w.length ? 'The commitment is written' : 'The paper is written'}</h2>
${note('done', 'Three parts matched. Nakišib has forgotten the paper; only its commitment is left, which is not secret.')}
${p('Its commitment, for Kišib to make the identity from (compare it on Kišib’s screen):', 'k-small k-soft')}<p class="nk-id" id="commit">${e(s.commit ?? '')}</p>
${w.length ? p(`Written to ${w.join(', ')}. In Kišib: Identities, “Make an identity with Nakišib”, read this file.`, 'k-soft') : ''}
${fileRow('write', w.length ? 'Write it again elsewhere…' : 'Choose where to write the commitment…', typed)}
${w.length ? `<div class="k-row">${btn('forget', 'Done', true)}</div>` : ''}`;
}

export function signedList(list: Signed[], typed: boolean): string {
  return `<h2>What it signed</h2>${p('Nakišib’s memory, from its folder: each change of keys it signed, by chain key. Nothing secret is in it. Asked again for the same request, it gives the same bytes; asked for a different change with the same key, it refuses.', 'k-small k-soft')}
${list.length ? `<ul class="nk-list" id="signed-list">${list.map((x) => `<li><p>Identity <span class="nk-id">${e(x.identity ?? '?')}</span>, position ${e(x.position ?? '?')}${x.homeless ? ' (homeless)' : ''}</p><p class="k-small k-soft">Act <span class="nk-id">${e(x.act)}</span> · chain key ${e(x.key)}…</p><div class="k-row">${btn('again', 'Write it again…', false, ` data-act="${e(x.act)}"`)}</div></li>`).join('')}</ul>${typed ? `<form data-path="again" autocomplete="off"><label>Path to write to (Write it again)</label><input name="path" spellcheck="false" autocomplete="off"></form>` : ''}` : p('Nothing yet.', 'k-faint')}`;
}

export function error(t: string): string {
  return note('error', e(t));
}

export { ICONS };
