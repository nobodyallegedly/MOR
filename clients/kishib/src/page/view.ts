// Kišib's page, as HTML strings, on the Dubsar Suite's kit (`clients/kit`),
// for the program on the Mac and Linux and for the web client alike (`web`
// set). Rebuilt on the kit on 22 October 2026, as the redesign drew it
// (`docs/design/suite-redesign.md`, "Kišib"; the mockups `kishib-*`): four
// tiles with their danger marks, each opening its column; Paper and
// Collectives behind the quiet door; top right, what Kišib holds. The web
// client has no Runner tile (never on the web, decided). Everything from the
// program, from relays or typed by the person is escaped.

import { APPS, KIT_STYLE } from '../../../kit/src/style.ts';
import { appMark, danger, e, ICONS, note, opened, say, shortForm, tiles, top, type ColumnEntry, type Tile, whatIsMor } from '../../../kit/src/html.ts';
import { PANEL_STYLE } from './panel.ts';
import type { Line, Review, Section, Sitting, State } from '../shapes.ts';
import type { RunnerView } from '../runner.ts';
import { NAKISIB_SAY } from '../nakisib-say.ts';

export { e, note };
export type { Line, Review, Section, Sitting, State, RunnerView };

export const NAME = 'Kišib';
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Kišib's colour: the Identity layer's glacier blue (H36), in pastel fills (decided, 21 October 2026). */
export const TINT = { layer: APPS.kishib.colour, pastel: APPS.kishib.pastel } as const;

/**
 * The web client's banner, on every page it shows, in one line with a "?"
 * that opens the risks in plain words. In the page's HTML itself
 * (`static/web.html`, written there by the build), so it shows even when the
 * script does not run.
 */
export const WEB_BANNER = `<details class="k-say kishib-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY}.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>The words you type here are your chain key: whoever serves this page’s code at that moment could copy them, and with them change your identity’s keys, or keep a collective’s whole key.</li>
<li>This browser, its extensions and whatever else runs on this device see what you type. A collective’s whole chain key is rebuilt in the device that rotates it.</li>
<li>Kišib keeps nothing in this browser’s storage; but nothing can prove a device forgot what it held.</li></ol>
<p>Use the app on a clean device for anything of value; ideally a device used for nothing else. Never here for a real identity.</p></div></details>`;

/** The page's style: the kit's, the runner's panel's, and Kišib's few own pieces. */
export const STYLE = `${KIT_STYLE}
${PANEL_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.kishib-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.kishib-banner strong{font-weight:400;color:var(--k-text)}
.kishib-banner ol{margin:4px 0;padding-left:1.4em}
.k-home.kishib-three>.k-tile:last-child{grid-column:1 / -1}
.kishib-foot{flex:none;padding:0 28px 10px}
.kishib-holds{display:flex;align-items:center;gap:10px;white-space:nowrap;flex:none;padding:4px 6px 4px 14px;border:1px solid var(--k-line);border-radius:999px;font-size:14px}
.kishib-holds .k-s{font:11.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-faint);white-space:nowrap}
.kishib-door{flex:1;display:grid;place-items:center;padding:20px}
.kishib-door .k-box{max-width:560px;width:100%;padding:28px 32px;border-radius:22px;background:var(--k-raise);border-color:var(--k-line)}
.kishib-door .k-ic{width:44px;height:44px;color:var(--k-p)}
.kishib-door h2{font-size:30px;margin:10px 0 6px}
.kishib-steps{display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--k-faint);margin:2px 0 10px}
.kishib-steps .k-done-step{color:var(--k-soft)}
.kishib-steps .k-now{color:var(--k-text)}
.kishib-pane form{max-width:760px}
.kishib-pane textarea{min-height:76px}
.kishib-check{display:flex!important;gap:8px;align-items:center;color:var(--k-text)!important;font-size:14px!important}
.kishib-review{border:1px solid var(--k-line);border-radius:14px;padding:10px 16px;margin:10px 0;background:var(--k-raise)}
.kishib-review h3{font-size:14px;color:var(--k-soft);margin:12px 0 4px}
.kishib-review ul,.kishib-lines{margin:4px 0;padding-left:1.1em;font-size:14px}
.kishib-review li,.kishib-lines li{margin:3px 0}
li.bad{color:var(--k-bad)}
li.warn{color:var(--k-soft)}
.kishib-must{border:1px solid var(--k-bad);border-radius:14px;padding:12px 16px;margin:10px 0}
.kishib-signs{border:1px solid var(--k-edge);border-radius:12px;padding:8px 14px;margin:10px 0;font-size:14px}
.kishib-fpr{font:15px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id);letter-spacing:.04em}
.kishib-full{font:12px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-soft);overflow-wrap:anywhere}
.kishib-typed{display:flex;gap:12px;flex-wrap:wrap}
.kishib-typed label{flex:1;min-width:120px}
.kishib-seg{display:inline-flex;border:1px solid var(--k-edge);border-radius:999px;padding:3px;gap:2px}
.kishib-seg button{padding:4px 16px;border-radius:999px;color:var(--k-soft);font-size:14px}
.kishib-seg button.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}
.kishib-app{border:1px solid var(--k-line);border-radius:14px;padding:12px 16px;margin:10px 0}
.kishib-app h3{font-size:17px}
.kishib-kinds{border-top:1px solid var(--k-line);margin-top:8px}
.kishib-kinds>div{display:flex;align-items:center;gap:12px;padding:8px 2px;border-bottom:1px solid var(--k-line);font-size:14.5px}
.kishib-kinds .k-r{margin-left:auto}
.kishib-wait{border:1px solid var(--k-edge);border-radius:14px;padding:12px 16px;margin:10px 0;background:var(--k-raise)}
.kishib-wait h3{font-size:17px}
.kishib-pane .k-feed{flex:none;max-height:none}
@media (max-width:600px){
  .k-home.kishib-three{grid-template-rows:repeat(3,1fr)}
  .k-home.kishib-three>.k-tile:last-child{grid-column:auto}
  .kishib-holds .k-n,.kishib-holds .k-s{display:none}
  .kishib-holds{padding:6px 10px}
  .k-top .k-tabs{display:none}
  .kishib-door .k-box{padding:20px}
}`;

const lines = (ls: Line[]) => `<ul class="kishib-lines">${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;
export { lines };

/** The tabs, by key, in the order of the tiles. */
export type Tab = 'identities' | 'runner' | 'paper' | 'collectives';

const TILES: (Tile & { key: Tab })[] = [
  { key: 'identities', name: 'Identities', say: 'Make an identity. Read any identity’s record. Confirm a succession.', icon: 'identities', danger: 1 },
  { key: 'runner', name: 'Runner', say: 'Off. In this program only, never on the web: when on, Kišib signs for the apps you approve, from keys it keeps, encrypted.', icon: 'runner', danger: 2 },
  { key: 'paper', name: 'Paper', say: 'The chain key’s 24 words: check them, change keys, change the vault, name a successor, escape.', icon: 'paper', danger: 3 },
  { key: 'collectives', name: 'Collectives', say: 'A collective’s rotation: waiting for you, start it, in the same room, check a share.', icon: 'collectives', danger: 3 },
];

/** The tiles shown here: the web client has no Runner (never on the web, decided: “Correct, I meant not on web”). */
export const tilesFor = (web: boolean) => TILES.filter((t) => !web || t.key !== 'runner');

/** What Kišib holds, top right (decided: "the only place where an ID can be held is the new runner"). */
export function holds(web: boolean, r: RunnerView | null): string {
  // Draft 2: locked, it holds what it kept, encrypted, and signs nothing until its passphrase is given.
  if (!web && r?.state === 'locked') return `<button type="button" class="kishib-holds" data-action="holds" title="Kišib’s runner is locked: give its passphrase"><span class="k-n">Runner locked</span><span class="k-s">passphrase</span><span class="k-dot k-alt">–</span></button>`;
  if (web || !r?.on) return `<button type="button" class="kishib-holds" data-action="holds" title="What Kišib holds"><span class="k-n">Holds nothing</span><span class="k-s">${web ? 'web' : 'runner off'}</span><span class="k-dot k-alt">–</span></button>`;
  const names = r.held.map((h) => h.name ?? shortForm(h.form));
  const shown = names.length ? (names.length <= 2 ? names.join(', ') : `${names.length} identities`) : 'nothing yet';
  return `<button type="button" class="kishib-holds" data-action="holds" title="What Kišib’s runner holds"><span class="k-n">Holds ${e(shown)}</span><span class="k-s">runner on</span><span class="k-dot">${e(String(names.length))}</span></button>`;
}

/** The top of the window: Kišib, its tabs once a tile is open, and what it holds. */
export function topBar(web: boolean, tab: Tab | null, r: RunnerView | null): string {
  const tabs = tab ? `<nav class="k-tabs" aria-label="Kišib">${tilesFor(web).map((t) => `<button type="button" class="k-tab${t.key === tab ? ' k-on' : ''}" data-tab="${t.key}"${t.key === tab ? ' aria-current="page"' : ''}>${e(t.name)}</button>`).join('')}</nav>` : '';
  return top({ left: `<button type="button" class="k-btn k-q kishib-home-btn" data-action="home-tiles" title="The four tiles">${appMark(NAME, 'icon.png')}</button>${tabs}`, right: holds(web, r) });
}

/** The first screen: four tiles (three on the web), their danger marks, the test notice in one line. */
export function home(web: boolean, r: RunnerView | null): string {
  const ts = tilesFor(web).map((t) =>
    // H111: the Runner tile shows the menu bar's seal as the runner's state shows it there: filled while on, a padlock while locked, hollow while off.
    t.key === 'runner' && r?.on
      ? { ...t, icon: 'runnerOn' as const, say: `On: ${r.held.length} ${r.held.length === 1 ? 'identity' : 'identities'} held, ${r.apps.filter((a) => a.state === 'approved').length} ${r.apps.filter((a) => a.state === 'approved').length === 1 ? 'app' : 'apps'} paired${r.waiting.length ? `, ${r.waiting.length} waiting` : ''}. Kišib signs for the apps you approve.` }
      : t.key === 'runner' && r?.state === 'locked'
        ? { ...t, icon: 'runnerLocked' as const, say: 'Locked: what it keeps is encrypted on this Mac. Give its passphrase, and it signs again for the apps you approved.' }
        : t,
  );
  // Draft 2: Kišib started with the runner on asks its passphrase first.
  const locked = !web && r?.state === 'locked' ? unlockBox(r) : '';
  return `${topBar(web, null, r)}<div class="k-body k-col-flex">${locked}${tiles(ts).replace('class="k-home"', `class="k-home${ts.length === 3 ? ' kishib-three' : ''}"`)}</div>
<div class="kishib-foot">${say(TEST_ONLY, [web ? 'The web client is for testing only: the banner above says its risks.' : 'Kišib writes nothing of your words to this device; what it holds for an act lives in the program’s memory, and is gone when it stops. The runner, while on, is the one exception: it keeps the signing keys you give it, in Kišib’s folder, encrypted under its passphrase.'], { mor: true })}</div>`;
}

/** Each tab's column. */
export function column(tab: Tab, web: boolean, r: RunnerView | null): ColumnEntry[] {
  switch (tab) {
    case 'identities':
      return [
        ...(r?.on && !web ? [{ key: 'held', label: 'Held here', k: r.held.length } as ColumnEntry, '-' as ColumnEntry] : []),
        ...(r?.state === 'locked' && !web ? [{ key: 'held', label: 'Held here', k: 'locked' } as ColumnEntry, '-' as ColumnEntry] : []),
        { key: 'make', label: 'Make an identity' },
        { key: 'make-nakisib', label: 'Make one with Nakišib' },
        { key: 'record', label: 'Read a record' },
        { key: 'confirm', label: 'Confirm a succession' },
        ...(r?.state === 'off' && !web ? ['-' as ColumnEntry, { key: 'held', label: 'Held by the runner', k: 'off' } as ColumnEntry] : []),
      ];
    case 'runner':
      return [
        { key: 'onoff', label: 'On or off' },
        { key: 'apps', label: 'Apps', k: r?.apps.length ?? 0 },
        { key: 'waiting', label: 'Waiting', k: (r?.waiting.length ?? 0) + (r?.memberAsks.length ?? 0) },
        { key: 'signed', label: 'Signed', k: r?.signed.length ?? 0 },
      ];
    case 'paper':
      return [
        { key: 'check', label: 'Check the paper' },
        { key: 'rotate', label: 'Change keys' },
        { key: 'nakisib', label: 'Change keys with Nakišib' },
        { key: 'vault', label: 'Change the vault' },
        { key: 'successor', label: 'Name a successor' },
        '-',
        { key: 'escape', label: 'Escape a contested position' },
      ];
    case 'collectives':
      return [
        { key: 'give', label: 'Waiting for you' },
        { key: 'start', label: 'Start a rotation' },
        { key: 'room', label: 'In the same room' },
        { key: 'checkshare', label: 'Check a share', k: 'new' },
      ];
  }
}

/** The part a tab opens on. */
export const firstPart = (tab: Tab, r: RunnerView | null, web: boolean): string => (tab === 'identities' ? (r && r.state !== 'off' && !web ? 'held' : 'make') : tab === 'runner' ? 'onoff' : tab === 'paper' ? 'check' : 'give');

/** A tab opened, its column on the left, the part on the right. */
export function tabPage(web: boolean, tab: Tab, part: string | null, pane: string, r: RunnerView | null): string {
  return `${topBar(web, tab, r)}${opened(column(tab, web, r), part, `<div class="kishib-pane" id="pane">${pane}</div><div id="status"></div>`)}`;
}

/** The quiet door to Paper and Collectives (the mockup `kishib-paper-door`): nothing else on the screen. */
export function door(web: boolean, tab: Tab, r: RunnerView | null): string {
  const icon = tab === 'paper' ? ICONS.paper : ICONS.collectives;
  return `${topBar(web, tab, r)}<div class="k-body kishib-door"><div class="k-box" id="door">${icon}<h2>${tab === 'paper' ? 'Paper' : 'Collectives'}</h2>
<p class="k-soft">Have your paper ready. Kišib uses the words for one act and forgets them.</p>
<p class="k-soft">${tab === 'paper' ? 'Here the chain key’s 24 words are typed, used for one act, and forgotten. Kišib writes nothing of them to this device.' : 'Here a collective’s paper shares are typed, used for one rotation, and forgotten.'} Be alone with this screen.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="open-door">Open ${tab === 'paper' ? 'Paper' : 'Collectives'}</button><button type="button" class="k-btn k-q" data-action="home-tiles">Not now</button></div></div></div>`;
}

// ---------------------------------------------------------------- fields

const idField = (name: string, label: string, required = true) => `<label>${label} (mid1…, or its hexadecimal)</label><input name="${name}" type="text" autocomplete="off" spellcheck="false"${required ? ' required' : ''}>`;
const words = (name: string, label: string) => `<label>${label}</label><textarea name="${name}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>`;
const address = `<label>One of its homes</label><input name="address" type="text" placeholder="https://" required>`;
const forgotten = say('What you type is used for this act alone, then overwritten.', ['Nothing is written to this device. Close Kišib, and nothing of your words remains.']);
const submit = (label: string, after = 'Nothing is signed before you read it back.') => `<div class="k-row"><button type="submit" class="k-btn k-p">${e(label)}</button><span class="k-small k-faint">${e(after)}</span></div>`;

/** The units a vault may name, as the program lists them (set by the page on each state). */
let units: { hash: string; label: string; network: number }[] = [];
export const setUnits = (u: { hash: string; label: string; network: number }[] | undefined) => (units = u ?? []);

/** The vault, in a change of keys (Money rule 2: only with the chain key; decided by Nobody, allegedly: "its setting belongs in Kišib"). Kept unless chosen. */
function vaultFields(open: boolean): string {
  return `<details class="k-box"${open ? ' open' : ''}><summary>+ The vault: ${open ? 'declare it anew, or remove it' : 'keep it as it is'}</summary>
<p class="k-small k-soft">The vault is where a payment above a limit must go, per unit, and the one place a thief holding only the signing key cannot point payments (Money rules 2 and 3). It changes only with the chain key, so only here. Its node or key should be another than your flow’s, which Damgar names.</p>
<label>The vault</label><select name="vault"><option value="keep"${open ? '' : ' selected'}>Keep it as it is</option><option value="set"${open ? ' selected' : ''}>Declare it anew, as below</option><option value="remove">Remove it (every payment to the flow)</option></select>
<div class="k-row"><label class="k-grow">Its unit <select name="vaultUnit" data-vault-units>${units.map((u) => `<option value="${e(u.hash)}">${e(u.label)}</option>`).join('')}</select></label><label class="k-grow">Network <select name="vaultNetwork"><option value="3" selected>regtest</option><option value="2">signet</option></select></label></div>
<label>Lightning: the vault’s node key (66 hexadecimal characters; not your flow’s node)</label><input name="vaultNode" autocomplete="off" spellcheck="false">
<label>Its limit: the largest single payment that may still go to the flow (0: every payment to the vault)</label><input name="vaultLightningLimit" inputmode="numeric" value="0">
<label>On-chain: the vault’s Bitcoin key, x-only (64 hexadecimal characters)</label><input name="vaultKey" autocomplete="off" spellcheck="false">
<label>Its request key (Damgar’s Settings show one; it signs address requests, and must stay online)</label><input name="vaultRequest" autocomplete="off" spellcheck="false">
<label>Its limit</label><input name="vaultOnchainLimit" inputmode="numeric" value="0"></details>`;
}

/** Said first under Change the vault (H40): changing the vault, or its limit, is a change of keys. */
export const VAULT_SAY = [
  'Changing the vault or its limit is a change of keys. Only the chain key changes the vault (Money rules 2 and 3), so a thief holding only the signing key can never move it.',
  'You need the chain key’s paper, your newest one (written when the identity was made, or shown at its last change of keys). Kišib first shows two new sets of 24 words, each once: the new chain key’s (a new paper, for the next change; the old paper is then spent), written down before anything is signed; then it signs a change of keys that keeps every line of acts and declares the vault anew (or removes it), and once the homes accept it shows the new signing key’s, to give to Dub and Damgar.',
  'The old signing key’s words stop counting once the homes receipt the change.',
];

/** Said beside each way with Nakišib: what it protects, and that it is optional. */
const nakisibSaid = `<div class="k-box k-fill" id="nakisib-say">${NAKISIB_SAY.map((t) => `<p class="k-small k-soft">${e(t)}</p>`).join('')}</div>`;

/** Nakišib's answer, where Kišib was closed since it wrote the request. */
const nakisibLate = `<details class="k-box"><summary>+ Kišib was closed since it wrote the request</summary><form id="nakisib-late" autocomplete="off"><p class="k-small k-soft">Give the request’s file and Nakišib’s answer, with the identity and one of its homes. The new signing key Kišib made with the request is gone: said again before anything is sent.</p>${idField('id', 'The identity')}${address}<label>The request Kišib wrote</label><input name="request" type="file" required><label>Nakišib’s answer</label><input name="answer" type="file" required><div class="k-row"><button type="submit" class="k-btn k-p">Check it, and send it</button></div></form></details>`;

const cardsFold = (runnerOn: boolean) =>
  `<details class="k-box"><summary>+ Lines another app made that cannot be read here</summary><label>Their cards, one per line, copied whole from each app’s identity window (Dub, Edubba, Damgar, Ummia): latest act, position, summary, then the app’s count and name</label><textarea name="cards"></textarea>${runnerOn ? '<div class="k-row"><button type="button" class="k-btn" data-action="runner-cards">Add the cards of the lines Kišib’s runner signed</button><span class="k-small k-faint">for an identity the runner holds: Dub’s lines, signed here</span></div>' : ''}</details>`;

/** The steps of a change of keys, as built (H79: the new chain paper before signing, the signing words after the homes accept). */
const STEPS = ['The words', 'Read back', 'New chain paper', 'Signed', 'New signing words'];
export function steps(at: number): string {
  return `<div class="kishib-steps" aria-label="Steps">${STEPS.map((s, i) => `<span class="${i < at ? 'k-done-step' : i === at ? 'k-now' : ''}">${i < at ? '✓ ' : ''}${e(s)}</span>${i < STEPS.length - 1 ? '<span>›</span>' : ''}`).join('')}</div>`;
}

/** A part's pane: its form. */
export function part(tab: Tab, key: string, web: boolean, r: RunnerView | null): string {
  const f = (kind: string, title: string, intro: string, body: string, button = 'Read it back', after?: string) => `<h2>${e(title)}</h2><p class="k-soft k-small">${e(intro)}</p><form id="form-${kind}" data-kind="${kind}" autocomplete="off">${body}${forgotten}${submit(button, after)}</form><div id="result"></div>`;
  const runnerOn = !web && !!r?.on;
  switch (`${tab}/${key}`) {
    case 'identities/held':
      return held(r);
    case 'identities/make':
      return f(
        'make',
        'Make an identity',
        'A new identity: its homes, its relays, a chain key on a new paper, a signing key for the apps. Its chain key’s words are shown once and three asked back before anything is signed; its signing key’s words once its homes take it. Kišib keeps nothing.',
        `<label>Its homes (one address per line): where it lives, and anyone can check it</label><textarea name="homes" required placeholder="https://"></textarea><label>Its relays, if you like (where its posts are published and its inbox is): its homes otherwise</label><textarea name="relays" placeholder="https://"></textarea>`,
      );
    case 'identities/make-nakisib':
      return `${f(
        'make',
        'Make an identity with Nakišib',
        'A new identity whose chain-key paper Nakišib drew on the offline Mac (A new identity): only its commitment comes here, by the file Nakišib wrote. Kišib makes its signing key, signs its genesis committing that paper’s key, and sends it to its homes; its signing key’s words once its homes take it. Kišib keeps nothing.',
        `<label>Nakišib’s commitment (the file it wrote on the USB stick)</label><input name="commitment" type="file" required><label>Its homes (one address per line): where it lives, and anyone can check it</label><textarea name="homes" required placeholder="https://"></textarea><label>Its relays, if you like (where its posts are published and its inbox is): its homes otherwise</label><textarea name="relays" placeholder="https://"></textarea>`,
      )}${nakisibSaid}`;
    case 'identities/record':
      return f('record', 'An identity’s record', 'Homes, receipts, lines of acts, any contest, any succession, as any reader would see it, judged by the core library. Reading signs nothing.', `${idField('id', 'The identity')}${address}`, 'Read it', 'Reading signs nothing.');
    case 'identities/confirm':
      return f(
        'confirm',
        'Confirm a succession',
        'As the successor: the identity that named you in a change of its keys is followed only once you confirm it, with an act of your own naming that change (F300). It uses your signing key’s words, not paper.',
        `${idField('owner', 'The identity that named you')}${idField('successor', 'Your ID')}${address}${words('words', 'Your signing key’s 24 words (as Dub shows them)')}`,
      );
    case 'paper/check':
      return f('check', 'Check the paper', 'Kišib derives the chain key from the words and compares it with what the identity’s chain commits to: right, spent, or not these. Nothing is signed.', `${idField('id', 'The identity')}${address}${words('words', 'The chain key’s 24 words, in order')}`, 'Check them', 'Nothing is signed.');
    case 'paper/rotate':
      return `${steps(0)}${f(
        'rotate',
        'Change an identity’s keys',
        'From its chain key’s paper: a new signing key, and a new chain-key paper, every line of its acts kept. Kišib reads the identity from its homes and every relay its routes name, finds every line of its acts, and reads it all back in plain words before anything is signed.',
        `${idField('id', 'The identity')}${address}${words('words', 'The chain key’s 24 words, in order (its newest paper; never the signing key’s words)')}${cardsFold(runnerOn)}${vaultFields(false)}`,
      )}`;
    case 'paper/nakisib':
      return `${f(
        'nakisib',
        'Change keys with Nakišib',
        'The same change of keys, its chain key used only on the offline Mac: Kišib reads the identity, every line of its acts, the cards and the vault, and reads it all back; then writes the request for Nakišib. No paper is typed here.',
        `${idField('id', 'The identity')}${address}${cardsFold(runnerOn)}${vaultFields(false)}`,
        'Read it back',
        'Nothing is written or signed before you read it back.',
      )}${nakisibSaid}${nakisibLate}`;
    case 'paper/vault':
      return `<h2>Change the vault</h2><div class="kishib-review" id="vault-say">${lines(VAULT_SAY.map((text) => ({ text })))}</div><form id="form-rotate" data-kind="rotate">${idField('id', 'The identity')}${address}${words('words', 'The chain key’s 24 words, in order (its newest paper)')}${cardsFold(runnerOn)}${vaultFields(true)}${forgotten}${submit('Read it back')}</form><div id="result"></div>`;
    case 'paper/successor':
      return f(
        'rotate',
        'Name a successor',
        'The identity names its successor in a change of its keys, signed from its chain key’s paper. Nobody follows it until the successor confirms it (Identities, Confirm a succession). This identity goes on living.',
        `${idField('id', 'Your identity')}${address}${words('words', 'Your chain key’s 24 words')}${idField('successor', 'The successor')}${cardsFold(runnerOn)}`,
      );
    case 'paper/escape':
      return f(
        'escape',
        'Escape a contested position',
        'Last, and set apart: for when someone else has changed your identity’s keys with your chain key’s words (they were stolen), or two changes contest one position of a self-hosted identity. You need both papers: the chain key’s words, and the signing key’s words of the key you held before. You leave to new homes.',
        `${idField('id', 'The identity')}${address}${words('words', 'Its chain key’s 24 words')}${words('signingWords', 'Its signing key’s 24 words, the key you held before the other change')}<label>New homes (one address per line): not the old ones, which hold the other change</label><textarea name="homes" required placeholder="https://"></textarea>`,
      );
    case 'collectives/give':
      return f(
        'give',
        'Waiting for you: give your share',
        'A member who started a rotation sent you its fingerprint (in Dub, in the proposal’s thread). Kišib reads the rotation back to you first. Your share goes sealed to a one-time key that expires within the hour.',
        `${idField('collective', 'The collective')}<label>The rotation’s fingerprint (64 characters)</label><input name="fingerprint" type="text" autocomplete="off" spellcheck="false" required>${address}
<div class="k-row"><button type="button" class="k-btn" data-action="read request">Read the rotation first</button></div><div id="request"></div>
${idField('member', 'Your ID')}<label>Your share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words('shareWords', 'Your share’s 24 words')}${words('memberWords', 'Your signing key’s 24 words (to sign the small act that carries your share)')}`,
      );
    case 'collectives/start':
    case 'collectives/room': {
      const room = key === 'room';
      return f(
        'start',
        room ? 'In the same room' : 'Start a rotation',
        room
          ? 'Everyone is here: the papers are typed into this Kišib one after another; nothing is sent, and no signing words are needed. Every new share is shown on this screen, once.'
          : 'This completes a member change proposed in Edubba and signed by every member. The member who proposed it starts here; the other members give their shares in their own Kišib, within an hour.',
        `${idField('collective', 'The collective')}${address}<label>Your share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words('shareWords', 'Your share’s 24 words')}${room ? '<input type="hidden" name="room" value="1">' : `${idField('founder', 'Your ID (you proposed the change)')}${words('founderWords', 'Your signing key’s 24 words: they open your members’ answers, with the one-time keys their new shares go to')}`}`,
      );
    }
    case 'collectives/checkshare':
      return f(
        'checkshare',
        'Check a share',
        'A paper share of a collective’s chain key: its number and its 24 words, checked against the collective. One paper says whether it is written right and whose it is; as many papers as rebuild the key say whether they still rebuild it. Nothing is signed.',
        `${idField('collective', 'The collective')}${address}<label>The share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words('shareWords', 'The share’s 24 words')}
<details class="k-box"><summary>+ More papers, typed here in the same room, to check together</summary><label>One per line: the number, then its 24 words (“2 word word …”)</label><textarea name="more"></textarea></details>`,
        'Check it',
        'Nothing is signed.',
      );
    case 'runner/onoff':
      return runnerOnOff(r);
    case 'runner/apps':
      return runnerApps(r);
    case 'runner/waiting':
      return runnerWaiting(r);
    case 'runner/signed':
      return runnerSigned(r);
    default:
      return '';
  }
}

// ---------------------------------------------------------------- the runner (the Dubsar runner cMIP)

const when = (s: number) => new Date(s * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

/** The passphrase asked when Kišib starts with the runner on (draft 2, 6.2): the runner is locked until it is given. */
export function unlockBox(r: RunnerView): string {
  const choose = r.upgrade;
  return `<form class="k-box k-fill" id="form-unlock" data-kind="unlock" autocomplete="off"><h3>Kišib’s runner is locked</h3>
<p class="k-small k-soft">${choose ? 'Its file, written by an earlier Kišib, keeps its keys in the clear: choose a passphrase now, typed twice, and Kišib encrypts it under it. The keys, the apps and the log are kept.' : 'Kišib was closed, or the Mac restarted: what the runner keeps (its keys, the apps paired with it, what it signed and opened) waits on this Mac, encrypted. Give its passphrase, and everything is back; no app pairs again. Until then, an app asking is told that Kišib is locked.'}</p>
<label>${choose ? 'Choose a passphrase (at least 8 characters)' : 'The runner’s passphrase'}</label><input name="passphrase" type="password" autocomplete="off" required>
${choose ? '<label>The passphrase again</label><input name="again" type="password" autocomplete="off" required>' : ''}
<div class="k-row"><button type="submit" class="k-btn k-p">${choose ? 'Encrypt it, and unlock' : 'Unlock'}</button><span class="k-small k-faint">Forgotten? It cannot be found again: turn the runner off (Runner), which erases everything, then give the signing words again.</span></div></form>`;
}

/**
 * Lock now and Quit Kišib (decided: "accessible from both", the seal in the
 * menu bar and this page). Closing a Mac window never ends its program:
 * quitting does, and locks the runner.
 */
const quitBox = (on: boolean) =>
  `<div class="k-box" id="quit-box"><h3>${on ? 'Lock now, or quit Kišib' : 'Quit Kišib'}</h3><p class="k-small k-soft">${on ? 'Locked, the runner signs and opens nothing until its passphrase is given again; nothing is erased, no app pairs again. ' : ''}<b>Closing Kišib’s window does not end it</b>: its program keeps running${on ? ', unlocked' : ''}. Quit Kišib ends it${on ? ', locking the runner' : ''}; so does restarting the Mac. On the Mac, Kišib’s seal in the menu bar offers the same.</p><div class="k-row">${on ? '<button type="button" class="k-btn" data-action="runner-lock">Lock now</button>' : ''}<button type="button" class="k-btn" data-action="quit">Quit Kišib</button></div></div>`;

const offBox = (locked: boolean) =>
  `<div class="k-box"><h3>Turn it off</h3><p class="k-small k-soft">Turning the runner off <b>erases everything</b>: every signing key it holds, every app paired with it, and the log of what it signed and opened. Its file is overwritten, then removed. Turned on again, it starts from nothing: the risk read, a passphrase chosen, the words given again, each app paired again.${locked ? ' This is the way out of a forgotten passphrase.' : ''}</p><div class="k-row"><button type="button" class="k-btn k-alarm" data-action="runner-off">Turn it off, and erase everything</button></div></div>`;

function runnerOnOff(r: RunnerView | null): string {
  if (!r) return '';
  const seg = `<div class="kishib-seg" role="group" aria-label="The runner"><button type="button" class="${r.state === 'off' ? 'k-on' : ''}" data-action="${r.state === 'off' ? '' : 'runner-off-ask'}">Off</button><button type="button" class="${r.state === 'off' ? '' : 'k-on'}" data-action="${r.state === 'off' ? 'runner-on-ask' : ''}">${r.state === 'locked' ? 'Locked' : 'On'}</button></div>`;
  const state =
    r.state === 'on'
      ? `<div class="k-box k-fill" id="runner-state"><div class="k-row"><div class="k-grow"><b>On</b> <span class="k-small k-soft">since ${e(when(r.since!))}</span><p class="k-small k-soft">Kišib keeps the signing keys of ${r.held.length} ${r.held.length === 1 ? 'identity' : 'identities'} on this Mac, in its folder, encrypted under the runner’s passphrase. The chain key: never.</p></div>${seg}</div></div>
${quitBox(true)}
${offBox(false)}`
      : r.state === 'locked'
        ? `<div class="k-box k-fill" id="runner-state"><div class="k-row"><div class="k-grow"><b>Locked</b><p class="k-small k-soft">What the runner keeps is on this Mac, encrypted; it signs and opens nothing until its passphrase is given.</p></div>${seg}</div></div>
${unlockBox(r)}${quitBox(false)}${offBox(true)}`
        : `<div class="k-box k-fill" id="runner-state"><div class="k-row"><div class="k-grow"><b>Off</b><p class="k-small k-soft">No key stored. Every app signs with its own words, as today.</p></div>${seg}</div></div>
<div class="k-box" id="risk"><h3>Before you turn it on, the risk</h3>${lines(r.risk.map((text) => ({ text })))}
<label>Choose the runner’s passphrase (at least 8 characters): asked each time Kišib starts</label><input id="runner-pass" type="password" autocomplete="new-password">
<label>The passphrase again</label><input id="runner-pass-again" type="password" autocomplete="new-password">
<p class="k-small k-soft">Forget it, and it cannot be found again: the runner is then turned off, erasing everything, and the signing words given again.</p>
<label class="kishib-check"><input type="checkbox" id="risk-read"> I have read the risk</label><div class="k-row"><span class="k-grow"></span><button type="button" class="k-btn" data-action="runner-on">Turn it on</button></div></div>
<p class="k-small k-faint">The risk is optional: you may leave it off for good.</p>${quitBox(false)}`;
  return `<h2>The runner</h2><p class="k-soft k-small">On this Mac’s program only, never in the web client. An app asks to pair; you approve here; then Kišib signs for it, showing what it signs in a panel inside the app’s window. The app never holds a key.</p>${state}`;
}

/** What a part of the runner says while the runner is not on. */
const notOn = (r: RunnerView | null, title: string, off: string) => `<h2>${title}</h2>${r?.state === 'locked' ? `<p class="k-soft">The runner is locked: what it keeps is encrypted until its passphrase is given.</p>${unlockBox(r)}` : `<p class="k-soft">${off}</p>`}`;

/** Identities held by the runner, with their record and Remove; the form to give one. */
function held(r: RunnerView | null): string {
  if (r?.state === 'locked') return notOn(r, 'Held here', '');
  if (!r?.on) {
    return `<h2>Held by the runner</h2><p class="k-soft">The runner is off: Kišib holds nothing. Turned on (Runner), it keeps the signing keys of the identities you give it here, encrypted under its passphrase, and signs with them for the apps you approve.</p><div class="k-row"><button type="button" class="k-btn" data-tab="runner">Open Runner</button></div>`;
  }
  const rows = r.held
    .map(
      (h) => `<div class="kishib-app" data-held="${e(h.id)}"><div class="k-row"><span class="k-dot">${e((h.name ?? 'M')[0].toUpperCase())}</span><div class="k-grow"><h3>${e(h.name ?? 'No name')}</h3><span class="k-mono k-soft">${e(shortForm(h.form))}</span></div><button type="button" class="k-btn k-q" data-action="held-record" data-id="${e(h.id)}">Its record</button><button type="button" class="k-btn k-q" data-action="held-remove" data-id="${e(h.id)}">Remove</button></div>
<p class="k-small k-soft">${h.apps.length ? `Used by ${e(h.apps.join(', '))}.` : 'No app uses it yet.'}</p>
${h.members.length ? `<div class="kishib-members"><p class="k-small">Its own keys for its collectives, held here with it (encrypted):</p>${h.members.map((m) => `<div class="k-row" data-member="${e(m.collective)}"><span class="k-mono k-grow">${e(shortForm(m.form))}</span><span class="k-small k-faint">added ${e(when(m.added))}</span><button type="button" class="k-btn k-q" data-action="member-remove" data-id="${e(h.id)}" data-collective="${e(m.collective)}">Remove</button></div>`).join('')}</div>` : ''}
${h.spent ? `<div class="k-note k-error">Its keys were changed with its chain key: the signing key the runner holds no longer counts, and it signs nothing for it. Give the new signing key’s words.<form class="kishib-renew" data-renew="${e(h.id)}"><input type="hidden" name="id" value="${e(h.id)}"><label>One of its homes</label><input name="address" placeholder="https://" required><label>The new signing key’s 24 words</label><textarea name="words" required autocomplete="off" spellcheck="false"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Take the new words</button></div></form></div>` : ''}</div>`,
    )
    .join('');
  return `<h2>Held here</h2><p class="k-soft k-small">The identities Kišib’s runner keeps, by their signing keys, on this Mac, encrypted under its passphrase, with their own keys for their collectives. Remove one, and Kišib forgets its keys; the apps using it through Kišib stop signing as it.</p>${memberAsks(r)}${rows || '<p class="k-soft">None yet.</p>'}
<form id="form-give-runner" data-kind="give-runner" class="k-box" autocomplete="off"><h3>Give an identity to the runner</h3><p class="k-small k-soft">By its signing key’s words, as Dub shows them (its identity’s menu, Words): Kišib checks they give the key its homes serve. Never the chain key’s words.</p>${idField('id', 'The identity')}${address}${words('words', 'Its signing key’s 24 words')}<div class="k-row"><button type="submit" class="k-btn k-p">Keep it here</button><span class="k-small k-faint">kept while the runner is on, encrypted</span></div></form>`;
}

/** An app's asks that Kišib hold an identity's key for a collective (draft 3, 9.1), each to add or refuse. */
function memberAsks(r: RunnerView): string {
  return r.memberAsks
    .map(
      (x) => `<div class="kishib-wait" data-member-ask="${e(x.id)}"><h3>${e(x.app)} asks Kišib to hold ${e(x.name ?? 'this identity')}’s key for a collective</h3><p class="k-small k-soft">The collective ${e(shortForm(x.form))} · asked ${e(when(x.at))}. Kišib opens the key sealed to ${e(x.name ?? 'this identity')} at its homes and keeps it here, encrypted. Acting as the collective, ${e(x.app)} then asks, and Kišib’s panel shows each act before Kišib signs it; the key never goes to ${e(x.app)}.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="member-answer" data-ask="${e(x.id)}" data-yes="1">Add it</button><button type="button" class="k-btn k-q" data-action="member-answer" data-ask="${e(x.id)}" data-yes="0">Refuse</button></div></div>`,
    )
    .join('');
}

/** Said of the opening permission (draft 2, section 8): off unless chosen. */
const OPEN_WORDS = 'may open what is sealed to this identity';
const openSay = (app: string) => `Chosen for each identity (decided: “per identity, per app”). ${app} then reads the private messages sent to that identity, and its sealed contacts list, through Kišib, without a panel each time (an opening signs nothing; Kišib returns the act and the key of that one act, never the identity’s keys). Each opening is listed in Signed. Revoke ${app}, and it ends.`;

function runnerApps(r: RunnerView | null): string {
  if (!r?.on) return notOn(r, 'Apps', 'The runner is off: no app is paired. Turn it on first (On or off).');
  const name = (id: string) => r.held.find((h) => h.id === id)?.name ?? shortForm(r.held.find((h) => h.id === id)?.form ?? id);
  const waiting = r.apps
    .filter((a) => a.state === 'waiting')
    .map(
      (a) => `<div class="kishib-app" data-pairing="${e(a.id)}"><h3>${e(a.name)} asks to pair</h3><p class="k-small k-soft">From ${e(a.origin)}, on this computer. Its code: <b class="kishib-fpr">${e(a.code)}</b>: approve only if ${e(a.name)} shows the same.</p>
<p class="k-small">The identities ${e(a.name)} may use through Kišib, and, for each, whether ${e(a.name)} ${OPEN_WORDS}:</p>${r.held.map((h) => `<div class="k-row kishib-allow"><label class="kishib-check k-grow"><input type="checkbox" name="allow" value="${e(h.id)}" checked> ${e(h.name ?? 'No name')} <span class="k-mono k-faint">${e(shortForm(h.form))}</span></label><label class="kishib-check"><input type="checkbox" name="open" value="${e(h.id)}"> ${OPEN_WORDS}</label></div>`).join('') || '<p class="k-small k-soft">Kišib holds no identity yet: give one first (Identities, Held here).</p>'}
<p class="k-small k-faint">Opening is off unless chosen. ${e(openSay(a.name))} Without it, ${e(a.name)} sends private messages as that identity but cannot read the answers.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="approve" data-pairing="${e(a.id)}">Approve</button><button type="button" class="k-btn k-q" data-action="refuse" data-pairing="${e(a.id)}">Refuse</button></div></div>`,
    )
    .join('');
  const kinds = r.kinds;
  const approved = r.apps
    .filter((a) => a.state === 'approved')
    .map(
      (a) => `<div class="kishib-app" data-app="${e(a.id)}"><div class="k-row"><div class="k-grow"><h3>${e(a.name)}</h3><span class="k-small k-faint">${e(a.origin)} · paired ${a.approved ? e(when(a.approved)) : ''}</span></div><button type="button" class="k-btn k-alarm" data-action="revoke" data-pairing="${e(a.id)}">Revoke</button></div>
<p class="k-small k-soft">Signs as ${e(a.identities.map(name).join(', ') || 'no identity')}.</p>
<div class="kishib-kinds">${kinds
        .filter((k) => !k.always)
        .map((k) => `<div><span>${e(a.name)} · ${e(k.name)}</span><span class="k-r kishib-seg" role="group"><button type="button" class="${a.yes.includes(k.kind) ? '' : 'k-on'}" data-action="yes" data-pairing="${e(a.id)}" data-kind="${k.kind}" data-on="0">Ask</button><button type="button" class="${a.yes.includes(k.kind) ? 'k-on' : ''}" data-action="yes" data-pairing="${e(a.id)}" data-kind="${k.kind}" data-on="1">Yes</button></span></div>`)
        .join('')}<div><span class="k-soft">Money acts, agreements, relying on another’s act, keys, and acts Kišib cannot read</span><span class="k-r k-small k-faint">always ask</span></div>
${a.identities
        .map(
          (id) =>
            `<div data-open="${e(a.id)}" data-identity="${e(id)}"><span>${e(a.name)} ${OPEN_WORDS.replace('this identity', e(name(id)))}</span><span class="k-r kishib-seg" role="group"><button type="button" class="${a.opens.includes(id) ? '' : 'k-on'}" data-action="opening" data-pairing="${e(a.id)}" data-identity="${e(id)}" data-on="0">No</button><button type="button" class="${a.opens.includes(id) ? 'k-on' : ''}" data-action="opening" data-pairing="${e(a.id)}" data-identity="${e(id)}" data-on="1">Yes</button></span></div>`,
        )
        .join('')}</div>
<p class="k-small k-faint">${a.opens.length ? e(openSay(a.name)) : `${e(a.name)} sends private messages as these identities but cannot read the answers.`}</p></div>`,
    )
    .join('');
  return `<h2>Apps</h2><p class="k-soft k-small">Each app paired with the runner: what it may sign without asking (a standing yes, per kind), what always asks, and whether it may have what is sealed to its identities opened. Revoke, and the app signs and opens through Kišib no more.</p>${waiting}${approved || (waiting ? '' : '<p class="k-soft">No app is paired. In Dub, the identity panel: + Add, Use one from Kišib.</p>')}`;
}

function runnerWaiting(r: RunnerView | null): string {
  if (!r?.on) return notOn(r, 'Waiting', 'The runner is off.');
  const ws = r.waiting
    .map(
      (w) => `<div class="kishib-wait" data-request="${e(w.request)}"><h3>${e(w.title)}</h3><p class="k-small k-soft">As ${e(w.name ?? 'this identity')} · asked ${e(when(w.at))}</p><div class="kishib-review">${w.words.map((x) => `<p dir="auto">${e(x)}</p>`).join('')}</div>
${w.always ? '<p class="k-small k-faint">Money, agreements, relying on another’s act, and keys always ask.</p>' : `<label class="kishib-check"><input type="checkbox" data-always="${e(w.request)}"> Always yes for ${e(w.app)}’s ${e(r.kinds.find((k) => k.kind === w.kind)?.name ?? w.kind)}</label>`}
<div class="k-row"><button type="button" class="k-btn k-p" data-action="answer" data-yes="1" data-request="${e(w.request)}">Sign it</button><button type="button" class="k-btn k-q" data-action="answer" data-yes="0" data-request="${e(w.request)}">Decline</button></div></div>`,
    )
    .join('');
  return `<h2>Waiting</h2><p class="k-soft k-small">Requests not answered yet, in case their panel was closed in the app. Each waits ten minutes; the app that asked still waits for its answer.</p>${memberAsks(r)}${ws || (r.memberAsks.length ? '' : '<p class="k-soft">Nothing waits.</p>')}`;
}

/** What the runner signed and opened, newest first: each a card with the kit's two menus (drawn by `ui.ts`). */
function runnerSigned(r: RunnerView | null): string {
  if (!r?.on) return notOn(r, 'Signed', 'The runner is off: it keeps no record.');
  return `<h2>Signed</h2><p class="k-soft k-small">Every act the runner signed, and everything it opened for an app, newest first; kept, encrypted, until the runner is turned off.</p><div class="k-feedwrap"><div class="k-feed" id="signed">${r.signed.length ? '' : '<p class="k-empty">Nothing signed yet.</p>'}</div></div>`;
}

// ---------------------------------------------------------------- sittings

export function sections(ss: Section[]): string {
  return ss.map((s) => `<h3>${e(s.heading)}</h3>${lines(s.lines)}`).join('');
}

/** A review: read in full before signing; the warning, where a line is left out or cannot be placed (H80's question 2), must be read too. */
export function review(r: Review, mustRead: boolean, change: boolean): string {
  const blocked = r.blocking.length > 0;
  const must = mustRead ? r.sections[0] : null;
  const rest = mustRead ? r.sections.slice(1) : r.sections;
  return `${change ? steps(1) : ''}<h2>${e(r.title)}</h2>
${r.summary.map((s) => `<p class="k-small k-soft">${e(s)}</p>`).join('')}
${must ? `<div class="kishib-must" id="mustread"><h3>${e(must.heading)}</h3>${lines(must.lines)}<label class="kishib-check"><input type="checkbox" id="read-it"> I have read this, and chosen this device knowingly</label></div>` : ''}
<div class="kishib-review">${sections(rest)}</div>
${blocked ? note('error', `Nothing can be signed yet:${lines(r.blocking.map((t) => ({ text: t, tone: 'bad' })))}`) : ''}
${r.warning ? `<div class="k-alarmbox">${e(r.warning)}<label class="kishib-check"><input type="checkbox" id="warned"> I have read this: go on as it says</label></div>` : ''}
<div class="kishib-signs"><span class="k-small k-faint">What is signed</span>${r.signs.map((s) => `<p>${e(s)}</p>`).join('')}</div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="sign" ${blocked ? 'disabled' : ''}>Sign it</button><button type="button" class="k-btn k-q" data-action="forget">Cancel, and forget the words</button></div>`;
}

/** The words, shown once, before they are hidden and three asked back. */
export function wordsShown(ws: string[], say2: string[], label: string, step: number | null): string {
  return `${step !== null ? steps(step) : ''}<h2>${e(label)}</h2>${say2.map((s) => `<p class="k-small k-soft">${e(s)}</p>`).join('')}
<div class="k-words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="written">I have written them down</button></div>`;
}

export function askBack(positions: number[], step: number | null): string {
  return `${step !== null ? steps(step) : ''}<h2>Three of the words, from your paper</h2><p class="k-small k-soft">The words are hidden. Type the ones asked, from what you wrote.</p>
<form id="typed"><div class="kishib-typed">${positions.map((p) => `<label>Word ${p}<input name="w${p}" autocomplete="off" spellcheck="false" required></label>`).join('')}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Check</button><button type="button" class="k-btn k-q" data-action="show words">Show them again</button></div></form>`;
}

/** Where a sitting stands, with what can be done next. */
export function sitting(s: Sitting): string {
  const btn = (action: string, label: string, primary = false, extra = '') => `<button type="button" class="k-btn${primary ? ' k-p' : ''}" data-action="${action}"${extra}>${label}</button>`;
  const q = s.request;
  const req = q
    ? `<div class="kishib-review" id="request-state">${q.room ? `<p>${q.have} of ${q.need} paper shares are in, typed here.</p>` : `<p>Fingerprint of this rotation</p><p class="kishib-fpr">${e(q.fingerprint)}</p><p class="kishib-full">${e(q.full)}</p><p>${q.have} of ${q.need} shares are in. The one-time key expires at ${e(when(q.expires))} (this device’s clock).</p>`}</div>`
    : '';
  const acts: string[] = [];
  if (s.stage === 'sent') acts.push(btn('refresh', 'Look again'), btn('resend', 'Send it again (the same bytes)', true));
  // With Nakišib: the request written to a file, then its answer read.
  if (s.stage === 'request') acts.push(btn('nakisib write', 'Write the request for Nakišib', true));
  const answer = s.stage === 'request' ? `<form id="nakisib-answer" class="k-box k-fill" autocomplete="off"><label>Nakišib’s answer (the file it wrote on the USB stick)</label><input name="answer" type="file" required><div class="k-row"><button type="submit" class="k-btn k-p">Read Nakišib’s answer</button><span class="k-small k-faint">checked to be exactly this change before anything is sent</span></div></form>` : '';
  // H79: the new paper first, before anything is signed; the signing key's words once the receipts are in.
  if (s.stage === 'paper') acts.push(btn('show words', s.kind === 'make' ? 'Show the chain key’s words (its paper)' : 'Show the new chain key’s words (a new paper)', true));
  if (s.stage === 'counts' && s.kind !== 'confirm') acts.push(btn('show words', s.kind === 'collective' ? 'Show the collective’s new signing key’s words' : s.kind === 'make' ? 'Show its signing key’s words' : 'Show the new signing key’s words', true));
  if (s.stage === 'shown') acts.push(btn('show words', 'Show them again'));
  if (s.stage === 'waiting' && q) {
    if (!q.room) acts.push(btn('gather', 'Look for the members’ shares', q.have < q.need));
    if (q.have >= q.need) acts.push(btn('rotate collective', 'Rebuild, rotate and deal now', true));
  }
  const paper =
    s.stage === 'waiting' && q?.room && q.have < q.need
      ? `<form id="paper"><label>The next share’s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words('words', 'Its 24 words')}<div class="k-row"><button type="submit" class="k-btn k-p">Add this paper</button></div></form>`
      : '';
  const shares = s.shares?.length
    ? `<h3>New shares to show here, once each</h3><ul class="kishib-lines">${s.shares.map((x) => `<li>Share ${x.x}, for <span class="k-mono">${e(x.holder.slice(0, 8))}…${e(x.holder.slice(-4))}</span>: ${x.shown ? 'written down, forgotten here' : btn('show share', 'Show it', false, ` data-holder="${e(x.holder)}"`)}</li>`).join('')}</ul>`
    : '';
  const done = s.stage === 'done' || s.stage === 'expired';
  const step = s.kind === 'identity' ? ({ paper: 2, sent: 3, counts: 4, shown: s.words === 'signing' ? 4 : 2, done: 5 } as Record<string, number>)[s.stage] : undefined;
  return `${step !== undefined ? steps(step) : ''}<h2>${e(s.title)}</h2>${req}<div class="kishib-review">${lines(s.lines)}</div>${paper}${shares}
<div class="k-row">${acts.join('')}${done && !(s.shares ?? []).some((x) => !x.shown) ? btn('forget', 'Done', true) : ''}</div>${answer}`;
}

/** The tab a sitting belongs to. */
export const tabOf = (s: Sitting): Tab => (s.kind === 'make' || s.kind === 'confirm' ? 'identities' : s.kind === 'collective' ? 'collectives' : 'paper');

/** Pairing this browser with the program. */
export function pairing(): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body kishib-door"><div class="k-box"><h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Kišib program running on this machine. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div></div>`;
}

/** A message alone on the page (a browser that cannot keep a key, a program away). */
export function alone(html: string): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body kishib-door"><div class="k-box">${html}</div></div>`;
}

export { danger };

/** Kišib's program has ended (quit here, or from its seal in the menu bar). */
export function quitDone(off: boolean): string {
  return `<div class="k-body"><div class="k-box" id="quit-done"><h2>Kišib has quit</h2><p class="k-soft">Its program has ended${off ? '' : ', and the runner is locked'}. Open Kišib again from your Applications (or its seal in the menu bar).</p></div></div>`;
}
