// Ummia's page, as HTML strings, on the Dubsar Suite's kit (`clients/kit`),
// for the program on the Mac and Linux and for the web client alike (`web`
// set). Rebuilt on the kit on 23 October 2026, the last app of the
// redesign, as it was drawn (`docs/design/suite-redesign.md`, "Ummia" and
// "Answered on the mockups"; the mockups `ummia-*`): four tiles with their
// danger marks (Look one, Discuss one, Publish two, Choose two), each
// opening its column; the identity top right, the collectives under each
// identity, so acting as a collective is the identity panel's gesture;
// Look one feed, pointed at a relay, a single ID, your contacts or a
// release, filtered by kind and layer; hashes easy to copy everywhere.
// Everything from the program, from relays or typed by the person is
// escaped.

import { APPS, KIT_STYLE } from '../../../kit/src/style.ts';
import { appMark, contactsButton, e, fold, meButton, nameOf, note, opened, ownId, pointRow, say, tiles, top, type ColumnEntry, type Named, type Tile, whatIsMor } from '../../../kit/src/html.ts';
import { actId, contactsButtonFor, idButton, who } from '../../../kit/src/ids.ts';
import { cardWords } from '../../../genesis/src/card-words.ts';
import { actFormOf } from '../../../dub/src/page/view.ts';
import type { Actor } from '../acting.ts';
import type { AcceptedEntry, Line, Review, State } from '../shapes.ts';
import type { FoundAct } from '../track.ts';
import type { MipDraft } from '../mips.ts';
import type { AnchorShown, Offer } from '../anchor.ts';
import type { FoundCard } from '../cards.ts';
import type { Filter, SpecPage } from '../look.ts';
import type { Saved } from '../ummia.ts';

export { e, fold, note, say, who };
export type { Line, State };

export const NAME = 'Ummia';
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Ummia's colour: coral, the Development layer's (H36), in pastel fills (decided, 21 October 2026). */
export const TINT = { layer: APPS.ummia.colour, pastel: APPS.ummia.pastel } as const;

/**
 * The web client's banner, on every page it shows, in one line with a "?"
 * that opens the risks in plain words. In the page's HTML itself
 * (`static/web.html`, written there by the build), so it shows even when the
 * script does not run.
 */
export const WEB_BANNER = `<details class="k-say ummia-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY}.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment you bring an identity here could copy its signing key: with it, publish specifications, MIP drafts and reports as you, and read your accepted list.</li>
<li>This browser’s storage, where that key is kept, can be lost, or read by what runs in this page.</li>
<li>What you publish here is public and for good: a specification is never updated, only succeeded. This page reads no folder, so it makes no release, and follows no chain, so it checks no anchor: use Ummia on a computer for those.</li></ol>
<p>Never bring a real identity here.</p></div></details>`;

/** The page's style: the kit's, and Ummia's few own pieces. */
export const STYLE = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.ummia-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.ummia-banner strong{font-weight:400;color:var(--k-text)}
.ummia-banner ol{margin:4px 0;padding-left:1.4em}
.ummia-foot{flex:none;padding:0 28px 10px}
.ummia-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.ummia-first h2{font-size:24px;margin:8px 0 4px}
.ummia-pane{max-width:900px;width:100%}
.ummia-pane h2{font-size:24px;margin:2px 0 4px}
.ummia-pane h3{font-size:16px;margin:16px 0 4px;font-weight:400}
.ummia-pane .k-feed{flex:none;max-height:none}
.ummia-look{display:flex;flex-direction:column;min-height:0;flex:1}
.ummia-look .k-feedwrap{min-height:240px}
.ummia-pane textarea{min-height:76px}
.ummia-pane textarea.ummia-code{min-height:220px;font:13px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.ummia-lines{margin:4px 0;padding-left:1.1em;font-size:14px}
.ummia-lines li{margin:3px 0}
li.bad{color:var(--k-bad)}
li.warn{color:var(--k-soft)}
.ummia-hash{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0}
.ummia-hash .k-mono{color:var(--k-p);overflow-wrap:anywhere}
.ummia-hash .ummia-big{font-size:15px}
.ummia-files{max-height:320px;overflow:auto;border-top:1px solid var(--k-line);margin-top:6px;font-size:12px}
.ummia-files div{display:flex;gap:10px;justify-content:space-between;border-bottom:1px solid var(--k-line);padding:3px 0}
.ummia-files code{overflow-wrap:anywhere}
.ummia-ticks{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:2px 12px}
.ummia-ticks label{font-size:13px;color:var(--k-soft);display:flex;gap:6px;align-items:center}
.ummia-picker{border:1px solid var(--k-line);border-radius:12px;padding:8px 12px;margin:8px 0}
.ummia-picker button{margin:2px 4px 2px 0}
.ummia-blocking{border:1px solid var(--k-bad);border-radius:14px;padding:10px 16px;margin:10px 0}
.ummia-v{font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--k-edge);color:var(--k-soft)}
.ummia-v.valid{color:var(--k-text);border-color:var(--k-p)}
.ummia-v.bad{color:var(--k-bad);border-color:var(--k-bad)}
.ummia-who{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px}
.ummia-list{list-style:none;padding:0;margin:0}
.ummia-list>li{display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--k-line);padding:9px 2px}
.ummia-list>li .k-grow{min-width:180px}
.ummia-tick{color:var(--k-p)}
.ummia-cardsay{border-left:2px solid var(--k-p);padding:2px 0 2px 12px;margin:8px 0}
.ummia-word{border-left:2px solid var(--k-edge);padding:2px 0 2px 12px;margin:8px 0}
.k-act .ummia-acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0 2px}
@media (max-width:600px){
  .k-top .k-tabs{display:none}
  .ummia-foot{padding:0 12px 8px}
}`;

export const lines = (ls: Line[]) => (ls.length ? `<ul class="ummia-lines">${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>` : '');
const says = (xs: string[]) => xs.map((x) => `<p class="k-small k-soft">${e(x)}</p>`).join('');

/** An ID written for people (`mid1…`, `mact1…`) from its hexadecimal: Dub's, shared. */
export const formOf = actFormOf;

/** A spec hash written for people (`mspec1…`). */
export const specFormOf = (hex: string): string => (/^[0-9a-f]{64}$/.test(hex) ? specBech(hex) : hex);

/** bech32m, as the IDs' forms are written (Identity's forms for people), for the label `mspec`. */
function specBech(hex: string): string {
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16));
  const data: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data.push((acc >> bits) & 31);
    }
  }
  if (bits) data.push((acc << (5 - bits)) & 31);
  const hrp = 'mspec';
  const polymod = (v: number[]) => {
    const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const x of v) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ x;
      for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= G[i];
    }
    return chk;
  };
  const expand = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
  const mod = polymod([...expand, ...data, 0, 0, 0, 0, 0, 0]) ^ 0x2bc830a3;
  const check = [0, 1, 2, 3, 4, 5].map((i) => (mod >> (5 * (5 - i))) & 31);
  return `${hrp}1${[...data, ...check].map((d) => CHARSET[d]).join('')}`;
}

/**
 * A hash, easy to copy (decided): shown whole where it is the one being
 * read back (`big`), with Copy; elsewhere its short form, the kit's button
 * (H121: one tap shows it whole, a second copies it).
 */
export const hashCopy = (hex: string, big = false, label = '') =>
  `<span class="ummia-hash">${label ? `<span class="k-small k-soft">${e(label)}</span>` : ''}${big ? `<span class="k-mono ummia-big" title="${e(specFormOf(hex))}">${e(specFormOf(hex))}</span><button type="button" class="k-btn k-q k-small" data-copy="${e(specFormOf(hex))}">Copy</button>` : idButton(specFormOf(hex))}</span>`;
/** An act's ID (`mact1…`), short: the kit's button (H121). */
export const actCopy = (hex: string, label = '') => `<span class="ummia-hash">${label ? `<span class="k-small k-soft">${e(label)}</span>` : ''}${actId(hex)}</span>`;

/** An identity, wherever Ummia shows one (H96, H106, H121): its names, its short ID under them, the kit's button. */
export const idCopy = (hex: string, o: { me?: boolean; collective?: boolean; inline?: boolean } = {}) => who({ id: hex, form: formOf(hex, 'mid'), ...o });

/** An identity's label in plain words, where a piece takes words only (a menu's title, a question): its names, else what is said instead. */
export const labelOf = (named: Named | null | undefined, instead: string) => nameOf(named) ?? instead;

// ---------------------------------------------------------------- the frame

/** The tabs, by key, in the order of the tiles. */
export type Tab = 'look' | 'discuss' | 'publish' | 'choose';

export const TILES: (Tile & { key: Tab })[] = [
  { key: 'look', name: 'Look', say: 'One feed: point at a relay, an ID, your contacts or a release; filter by releases, cMIPs, Modules, xtypes, extensions.', icon: 'look', danger: 1 },
  { key: 'discuss', name: 'Discuss', say: 'MIP drafts, their discussion, bug reports and answers.', icon: 'discuss', danger: 1 },
  { key: 'publish', name: 'Publish', say: 'Releases of code, cMIPs and Modules, the hash first, and their cards; anchoring, paid in Damgar.', icon: 'publish', danger: 2 },
  { key: 'choose', name: 'Choose', say: 'The accepted list, by layer: what every app may use.', icon: 'choose', danger: 2 },
];

/** Who acts now: the identity in use, or one of its collectives (the identity panel's gesture). */
export function actingOf(s: State): Actor | null {
  return s.actors.find((a) => a.id === s.acting && a.kind === 'collective') ?? null;
}

/** The top of the window: Ummia (back to the tiles), its tabs once a tile is open, the identity (or the collective acted as) top right. */
export function topBar(s: State, tab: Tab | null): string {
  const i = s.identity;
  const tabs = tab ? `<nav class="k-tabs" aria-label="Ummia">${TILES.map((t) => `<button type="button" class="k-tab${t.key === tab ? ' k-on' : ''}" data-tab="${t.key}"${t.key === tab ? ' aria-current="page"' : ''}>${e(t.name)}</button>`).join('')}</nav>` : '';
  const c = actingOf(s);
  // H96: the identity's names, as read (its published name, or why none is shown); one used through Kišib with no name says so.
  const shownName = i && !nameOf(i.named) && i.runner ? 'via Kišib' : null;
  const cn = c ? s.names?.[c.id] : null;
  const me = i
    ? meButton({
        name: shownName ?? nameOf(i.named),
        form: i.form,
        named: shownName ? null : i.named,
        as: c ? (nameOf(cn) ? { name: nameOf(cn), form: formOf(c.id, 'mid'), named: cn } : { name: 'Collective', form: formOf(c.id, 'mid') }) : null,
      })
    : '';
  // H100: Contacts top left, the one list, as in every app.
  return top({ left: `<div class="k-row">${contactsButton()}<button type="button" class="k-btn k-q" data-action="home-tiles" title="The four tiles">${appMark(NAME, 'icon.png')}</button></div>${tabs}`, right: me });
}

/** The four tiles and their danger marks. */
export function home(s: State, web: boolean): string {
  return `${topBar(s, null)}<div id="spent-at"></div><div class="k-body k-col-flex">${tiles(TILES)}</div>
<div class="ummia-foot">${say(TEST_ONLY, [web ? 'The web client is for testing only: the banner above says its risks.' : 'The signing key is held in software in this program’s folder: a prototype, never for a real identity.'], { mor: whatIsMor })}</div>`;
}

/** Each tab's column. */
export function column(tab: Tab, s: State, k: { mips: number; threads: number; reports: number; anchors: number; published: number }): ColumnEntry[] {
  switch (tab) {
    case 'look':
      return [
        { key: 'feed', label: 'The feed' },
        { key: 'page', label: 'A specification’s page' },
        { key: 'acts', label: 'One specification’s acts' },
        '-',
        'Saved',
        ...s.saved.map((x) => ({ key: `saved:${x.key}`, label: x.label })),
        ...(s.saved.length ? [] : [{ key: 'saved-none', label: 'None yet' }]),
      ];
    case 'discuss':
      return [{ key: 'mips', label: 'MIP drafts', k: k.mips }, { key: 'threads', label: 'Discussions', k: k.threads }, { key: 'reports', label: 'Bug reports', k: k.reports }, '-', { key: 'mip-new', label: '+ Start a MIP' }];
    case 'publish':
      return [{ key: 'release', label: 'A release' }, { key: 'spec', label: 'A cMIP or Module' }, { key: 'anchoring', label: 'Anchoring', k: k.anchors }, '-', { key: 'published', label: 'Published here', k: k.published }];
    case 'choose':
      return [{ key: 'every', label: 'Every layer' }, ...LAYERS.map((l) => ({ key: `layer:${l}`, label: l })), '-', { key: 'accept-hash', label: '+ Accept by hash' }, '-', { key: 'ummia-rules', label: 'Ummia’s own rules', k: s.rules?.missing.length || undefined }];
  }
}

export const LAYERS = ['Identity', 'Text', 'Envelopes', 'Money', 'Agreements', 'Development'] as const;

export const firstPart = (tab: Tab): string => ({ look: 'feed', discuss: 'mips', publish: 'release', choose: 'every' })[tab];

/** A tab opened: its column on the left, the part on the right. */
export function tabPage(s: State, tab: Tab, part: string, k: Parameters<typeof column>[2]): string {
  return `${topBar(s, tab)}<div id="spent-at"></div>${opened(column(tab, s, k), part, `<div class="ummia-pane${tab === 'look' && part !== 'page' && part !== 'acts' ? ' ummia-look' : ''}" id="pane"><p class="k-empty">Reading…</p></div><div id="status" class="k-status"></div>`)}`;
}

export function pairing(): string {
  return `<div class="ummia-first">${appMark(NAME, 'icon.png')}<h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Ummia program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div>`;
}

/** A page of the program's start with nothing else: a note alone. */
export const alone = (html: string) => `<div class="ummia-first">${appMark(NAME, 'icon.png')}${html}</div>`;
export const top0 = (web = false) => alone(web ? '<p class="k-small k-soft">The web client, for testing only.</p>' : '');

// ---------------------------------------------------------------- the first screen, and + Add

const runnerSay = (web: boolean) => (web ? 'through Kišib’s runner, in the computer’s program only: never in the web client' : 'through Kišib’s runner, on this Mac: Ummia holds no key, and Kišib’s panel asks for every act');

/** + Add's ways, as the identity panel lists them: Ummia never makes an identity (as before), so bring one or use one from Kišib. */
export const ADD = (web: boolean) => [
  { key: 'bring', label: 'Bring one', say: 'its ID and its signing key’s words (Ummia never makes one)' },
  { key: 'kishib', label: 'Use one from Kišib', say: runnerSay(web), empty: web },
];

/** No identity yet: bring one, or use one from Kišib. */
export function firstScreen(web: boolean, part: 'bring' | 'kishib' = 'bring'): string {
  return `<div class="ummia-first">${appMark(NAME, 'icon.png')}<h2>First, an identity</h2>
<p class="k-soft">Ummia never makes an identity and never holds a chain key. Bring one you have, by its ID and its signing key’s words, as Dub, Edubba or Kišib show them; or, on the Mac, use one Kišib holds.</p>
<div class="k-row">${ADD(web).map((a) => `<button type="button" class="k-btn${a.key === part ? ' k-p' : ''}" data-add="${a.key}"${a.empty ? ' disabled' : ''}>${e(a.label)}</button>`).join('')}</div>
<div id="first-part">${part === 'kishib' ? '<p class="k-small k-soft">Reading Kišib’s runner…</p>' : bringForm()}</div>
<div id="status" class="k-status"></div></div>`;
}

export function bringForm(): string {
  return `<form id="bring"><p class="k-small k-soft">By its ID and its signing key’s words (never the chain key’s).</p>
<label>Its ID (mid1…, or its hexadecimal)</label><input name="id" autocomplete="off" spellcheck="false" required>
<label>Its signing key’s 24 words</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<label>Relays, one per line, if it names none</label><textarea name="relays"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Bring it</button></div></form>`;
}

/** Use one from Kišib: the pairing, its code, the identities Kišib lets Ummia use. */
export function runnerForm(r: { available: boolean; state: string | null; code: string | null; identities: { id: string; form: string; name: string | null; held: boolean }[]; problem: string | null }): string {
  if (!r.available) return `<p class="k-small k-soft">Kišib’s runner is in the computer’s program only, on the Mac: never in the web client. Bring the identity here by its words instead.</p>`;
  const ids = r.identities.length
    ? `<div class="k-list">${r.identities.map((x) => `<div>${who({ id: x.id, form: x.form, named: x.name ? { nick: null, published: { state: 'name', name: x.name } } : null })}<button type="button" class="k-btn k-small k-r" data-runner-take="${e(x.id)}">${x.held ? 'Use it' : 'Use it here'}</button></div>`).join('')}</div>`
    : '';
  return `${r.problem ? note('error', e(r.problem)) : ''}
${say('Kišib keeps the identity’s signing key on this Mac; Ummia holds none.', ['Pairing starts here and is approved in Kišib (Runner, Apps), comparing the code. Then every act Ummia would sign is a request to Kišib, and Kišib’s panel appears inside Ummia’s window. What is sealed to the identity (the accepted list, the follow list) does not open in Ummia.'])}
${r.state === 'approved' ? `<p class="k-small">Kišib approved Ummia (code ${e(r.code ?? '')}). The identities it lets Ummia use:</p>${ids || '<p class="k-small k-soft">None yet: choose some for Ummia in Kišib.</p>'}` : r.state === 'waiting' ? `<p>Approve Ummia in Kišib (Runner, Apps), comparing this code: <span class="k-mono">${e(r.code ?? '')}</span></p><div class="k-row"><button type="button" class="k-btn" data-action="runner-look">I approved it in Kišib</button></div>` : `<div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Ask Kišib to pair</button></div>`}`;
}

// ---------------------------------------------------------------- the identity's own menu, its parts in the pop-up

export const IDENTITY_MENU = [
  ['words', 'Words', ''],
  ['line', 'Line and homes', ''],
  ['renew', 'New words from Kišib', 'after a change of keys'],
  ['collective', 'A collective under it', ''],
  ['remove', 'Remove from Ummia…', ''],
] as const;

export function wordsShown(c: { grouped: string; words: string[] }): string {
  return `<p class="k-small k-soft">With the ID, they bring this identity into Ummia, Dub, Damgar or Edubba on another device. Whoever holds them can publish as this identity and open what is sealed to it. They are not the chain key’s words.</p>
<p class="k-mono">${e(c.grouped)}</p><div class="k-words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join('')}</div>`;
}

export function lineShown(s: State): string {
  const i = s.identity!;
  // H88: its own ID whole, with Copy ID and Share your ID link.
  return `<dl class="k-facts"><dt>ID</dt><dd>${ownId({ form: i.form, link: i.link })}</dd><dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd><dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd><dt>Ummia’s line</dt><dd>${cardWords(i.line, 'Ummia', e)}</dd></dl>
${say('Give Kišib this card at a change of keys.', ['Some of Ummia’s acts are sealed (your accepted list, the follow list, an anchor’s payment for Damgar), so Kišib cannot read its line from the homes: when the signing key is changed there, give Kišib this card (latest act, position, summary), or every act signed here becomes void.'])}
${i.encryption || i.runner ? '' : note('error', 'Ummia holds no encryption key for this identity: its accepted list cannot be read or changed here.')}`;
}

export function renewForm(): string {
  return `<form id="renew"><p class="k-small k-soft">Its signing key was changed elsewhere (in Kišib): give the new signing key’s words, and Ummia signs with them, in a new line.</p><label>The new signing key’s 24 words</label><textarea name="words" required autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Use the new words</button></div></form>`;
}

export function collectiveForm(s: State): string {
  const cs = s.actors.filter((a) => a.kind === 'collective');
  return `<p class="k-small k-soft">A collective whose area reaching its releases you hold a box in: Ummia acts for it with your own key for it, sealed to you when you signed its founding or a member change. Then choose it under this identity in the panel: Publish signs its releases.</p>
${cs.length ? `<div class="k-list">${cs.map((c) => `<div>${who({ id: c.id, form: formOf(c.id, 'mid'), named: s.names?.[c.id] ?? null, collective: true })}<span class="k-small k-soft">${c.available ? 'can act' : e(c.why ?? '')}</span></div>`).join('')}</div>` : ''}
<form id="collective-add" class="k-row"><input name="collective" class="k-grow" placeholder="A collective’s ID (mid1… or hex)" autocomplete="off" spellcheck="false" required data-k-id-field>${contactsButtonFor('collective')}<button type="submit" class="k-btn k-p">Act for it</button></form>`;
}

/** Relays, in the panel's foot (as drawn): where this identity's acts go, and the relays Look asks. The reporting identity is in Discuss › Bug reports. */
export function relaysForm(s: State): string {
  return `<form id="relays"><label>Relays your acts go to (specifications, releases, cards, drafts, reports), one per line</label><textarea name="relays" spellcheck="false">${e(s.settings.relays.join('\n'))}</textarea>
<label>Public relays Look asks, one per line</label><textarea name="track" spellcheck="false">${e(s.settings.track.join('\n'))}</textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Save</button></div></form>
<dl class="k-facts"><dt>Homes</dt><dd>${e(s.identity?.homes.join(', ') ?? '')} (the identity’s chain names them; changed in Kišib)</dd></dl>`;
}



// ---------------------------------------------------------------- a review, before anything is signed

export function review(r: Review, confirmAction = 'confirm'): string {
  const files = r.files
    ? `<details open><summary>Its files (${r.files.length}), each with its size and fingerprint</summary><div class="ummia-files">${r.files.map((f) => `<div><span>${e(f.path)}</span><span>${f.size} bytes</span><code>${e(f.fingerprint)}</code></div>`).join('')}</div></details>${r.skipped?.length ? `<p class="k-small k-soft">Left out: ${e(r.skipped.join('; '))}</p>` : ''}
<details><summary>The libraries it depends on (${r.dependencies?.length ?? 0})</summary>${r.dependencies?.length ? `<div class="ummia-files">${r.dependencies.map((d) => `<div><span>${e(d.registry)}</span><span>${e(d.name)}</span><span>${e(d.version)}</span></div>`).join('')}</div>` : '<p class="k-small k-soft">None: it names no lock file (Cargo.lock, package-lock.json).</p>'}</details>`
    : '';
  return `<div class="k-box k-fill review" data-plan="${e(r.plan)}"><h3>${e(r.title)}</h3>
${r.hash ? `<p class="k-small k-soft">Its hash, first</p><div id="review-hash">${hashCopy(r.hash, true)}</div><p class="k-small k-faint">In hexadecimal: ${e(r.hash)}</p>` : ''}
${says(r.summary)}
${r.sections.map((x) => `<p class="k-small"><b>${e(x.heading)}</b></p>${lines(x.lines)}`).join('')}
${files}
${r.blocking.length ? `<div class="ummia-blocking"><b>It cannot be signed as it is</b>${lines(r.blocking.map((t) => ({ text: t, tone: 'bad' })))}</div>` : ''}
<p class="k-small k-faint">The digest of exactly what is signed: <code>${e(r.digest)}</code></p>
<div class="k-row">${r.blocking.length ? '' : `<button type="button" class="k-btn k-p" data-action="${e(confirmAction)}" data-plan="${e(r.plan)}" data-digest="${e(r.digest)}">Sign and publish</button>`}<button type="button" class="k-btn k-q" data-action="cancel" data-plan="${e(r.plan)}">Leave it</button></div></div>`;
}

// ---------------------------------------------------------------- Look

export const POINT_KINDS: { key: 'relay' | 'id' | 'contacts' | 'release'; label: string }[] = [
  { key: 'relay', label: 'a relay' },
  { key: 'id', label: 'a single ID' },
  { key: 'contacts', label: 'my contacts' },
  { key: 'release', label: 'a release' },
];
export const FILTER_CHIPS: { key: Filter; label: string }[] = [
  { key: 'releases', label: 'releases' },
  { key: 'cmips', label: 'cMIPs' },
  { key: 'modules', label: 'Modules' },
  { key: 'xtypes', label: 'xtypes' },
  { key: 'extensions', label: 'extensions' },
  { key: 'mips', label: 'MIPs' },
];

export interface LookAt {
  point: { kind: 'relay' | 'id' | 'contacts' | 'release'; value: string };
  filters: Filter[];
  layer: string | null;
}

/** Point at, filter by, by layer: the rows above the feed (as drawn), and the field for what is pointed at. */
export function lookHead(at: LookAt, s: State, saved: Saved | null): string {
  const relays = s.settings.track.length ? s.settings.track : s.settings.relays;
  const field =
    at.point.kind === 'relay'
      ? `<select name="value" class="k-grow">${relays.map((r) => `<option${r === at.point.value ? ' selected' : ''}>${e(r)}</option>`).join('')}<option value="">every relay Look asks</option></select>`
      : at.point.kind === 'contacts'
        ? '<span class="k-small k-soft k-grow">the people you follow (the one contacts list, the same in every app)</span>'
        : `<input name="value" class="k-grow" value="${e(at.point.value)}" placeholder="${at.point.kind === 'id' ? 'Their ID: mid1…' : 'The release’s act ID: mact1…'}" autocomplete="off" spellcheck="false"${at.point.kind === 'id' ? ' data-k-id-field' : ''}>${at.point.kind === 'id' ? contactsButtonFor('value') : ''}`;
  return `${saved ? `<div class="k-row"><h2 class="k-grow">${e(saved.label)}</h2><button type="button" class="k-btn k-q k-small" data-saved-remove="${e(saved.key)}">Remove this point</button></div>` : ''}
${pointRow('Point at', POINT_KINDS.map((p) => ({ key: p.key, label: p.key === 'relay' && at.point.kind === 'relay' && (at.point.value || relays.length === 1) ? (at.point.value || relays[0]).replace(/^https?:\/\//, '') : p.label, on: p.key === at.point.kind })), 'point')}
${pointRow('Filter by', FILTER_CHIPS.map((f) => ({ key: f.key, label: f.label, on: at.filters.includes(f.key) })), 'filter')}
${pointRow('Layer', [{ key: '', label: 'any', on: !at.layer }, ...LAYERS.map((l) => ({ key: l, label: l, on: at.layer === l }))], 'layer')}
<form id="look" class="k-row">${field}<button type="submit" class="k-btn k-p">Look</button>${saved ? '' : '<button type="button" class="k-btn k-q" data-action="save-point">Save this point</button>'}</form>`;
}

/** Under the feed: the one line with its "?" (decided), tracking's counts behind it. */
export function lookFoot(limit: string[], counts: Line[], placed: { placed: number; shown: number } | null): string {
  return `${placed ? `<p class="k-clock">${placed.placed ? `Ordered by the Dubsar clock${placed.placed < placed.shown ? `; ${placed.shown - placed.placed} not stamped, kept after` : ''}.` : 'The Dubsar clock stamped none of these: in each signer’s own order, not a time.'}</p>` : ''}${say('Public agreements only, as the relays answer', [...limit.map((x) => `<p>${e(x)}</p>`), counts.length ? `<p><b>What the relays answered</b></p>${lines(counts)}` : ''].join(''))}`;
}

/** A specification's page (decided 23 October 2026): everything that can be tied to it. */
export function specPagePane(p: SpecPage & { mine: boolean; say: string[] }, whoOf: (id: string) => string): string {
  // H96, H106: whoever is named here (its creator, a card's signer), by their names, the short ID under, a tap away.
  const card = (c: FoundCard, own: boolean) => `<div class="${own ? 'ummia-cardsay' : 'ummia-word'}" data-card="${e(c.id)}"><p class="k-small k-soft">${own ? 'Its creator’s card' : `${whoOf(c.signer)}’s card: their word, not the specification’s`}</p><h3>${e(c.fields.title)}</h3>${c.fields.summary ? `<p>${e(c.fields.summary)}</p>` : ''}${actCopy(c.id, 'the card')}</div>`;
  const head = `<div class="k-row"><button type="button" class="k-btn k-q k-small" data-action="look-back">← The feed</button></div>
<h2 id="spec-title">${e(p.title)}</h2>
${hashCopy(p.hash, true)}
<p class="k-small k-soft">${[e(p.kind), e(p.layer), p.creator ? `by ${whoOf(p.creator)}${p.claimed ? '' : ' (unclaimed: its creator never published it)'}` : p.builtIn ? 'no creator: one of the core’s texts' : ''].filter(Boolean).join(' · ')}</p>
${lines(p.lines)}`;
  const own = p.own ? card(p.own, true) : p.builtIn ? `<div class="ummia-cardsay" data-builtin><p class="k-small k-soft">Ummia’s own words, built in</p><h3>${e(p.title)}</h3><p>${e(p.builtIn.summary)}</p><p class="k-small k-faint">${e(p.builtIn.say)}</p></div>` : p.found ? '<p class="k-small k-soft">Its creator has signed no card for it yet: its title is its own first line.</p>' : '';
  const also = p.ownAlso.length ? `<p class="k-small k-soft">Its creator also signed, on another line:</p>${p.ownAlso.map((c) => card(c, true)).join('')}` : '';
  const sect = (h: string, body: string) => `<h3>${e(h)}</h3>${body}`;
  return `${head}${own}${also}${p.superseded ? `<p class="k-small k-faint">${p.superseded} earlier card${p.superseded === 1 ? '' : 's'}, superseded by a later one in its signer’s own sequence.</p>` : ''}
${p.mine || (!p.creator && p.found) || !p.found ? '' : ''}<div class="k-row">${p.found ? `<button type="button" class="k-btn${p.mine ? ' k-p' : ''}" data-action="card-new" data-hash="${e(p.hash)}" data-title="${e(p.own?.fields.title ?? p.name ?? '')}">${p.mine ? 'Sign a later card' : 'Write a card of your own'}</button>` : ''}<button type="button" class="k-btn k-q" data-action="accept-hash" data-hash="${e(p.hash)}" data-label="${e((p.name ?? p.title).slice(0, 120))}">Add to accepted list</button></div>
${sect('Its text', p.text ? `<details><summary>${e(p.name ?? '')}</summary><pre class="k-small">${e(p.text)}</pre></details>${lines(p.role.map((t) => ({ text: t })))}` : p.builtIn ? '<p class="k-small k-soft">The frozen texts are dubsar.org’s front door.</p>' : '<p class="k-empty">Not found on the relays asked.</p>')}
${sect('Releases implementing it', p.releases.length ? `<ul class="ummia-list">${p.releases.map((r) => `<li><span class="k-grow">${e(r.name ?? 'a release')} ${e(r.version ?? '')}${r.problem ? ` <span class="k-small k-soft">(${e(r.problem)})</span>` : ''}${r.from === 'card' ? ' <span class="k-small k-faint">named by its card</span>' : ''}</span>${actCopy(r.id)}<button type="button" class="k-btn k-q k-small" data-point-release="${e(r.id)}">Its line</button></li>`).join('')}</ul>` : '<p class="k-empty">None found.</p>')}
${sect('Its test vectors', p.vectors.length ? `<ul class="ummia-list">${p.vectors.map((v) => `<li>${/^https:\/\//.test(v) ? `<span class="k-mono k-grow">${e(v)}</span><button type="button" class="k-btn k-q k-small" data-copy="${e(v)}">Copy</button>` : actCopy(v)}</li>`).join('')}</ul>` : '<p class="k-empty">None named by its card.</p>')}
${sect('Its discussion', p.discussion ? `<p>${e(p.discussion.text?.split('\n')[0] ?? 'Its thread')}</p>${actCopy(p.discussion.id, 'the thread')} <button type="button" class="k-btn k-q k-small" data-action="reply-open" data-to="${e(p.discussion.id)}">Reply, as a signed document</button>` : '<p class="k-empty">No thread named by its card.</p>')}
${sect('Public agreements naming it', `<p class="k-small">${p.agreements ? `${p.agreements} public agreement${p.agreements === 1 ? '' : 's'} name${p.agreements === 1 ? 's' : ''} it as an extension.` : 'None found.'}</p>`)}
${p.use ? sect('Its use', `<p class="k-small">${p.use.acts} public act${p.use.acts === 1 ? '' : 's'} of its types (${p.use.byType.map((t) => `${e(t.name)} ${t.acts}`).join(', ')})${p.use.notValid ? `; ${p.use.notValid} not valid, not counted` : ''}.</p>`) : ''}
${sect('Its drafts', `${p.predecessor ? `<p class="k-small">After ${e(p.predecessor.name ?? 'a specification not found here')}${p.predecessor.otherCreator ? ' <span class="k-small">(its creator is not its predecessor’s)</span>' : ''}</p>${hashCopy(p.predecessor.hash)} <button type="button" class="k-btn k-q k-small" data-spec="${e(p.predecessor.hash)}">Its page</button>` : '<p class="k-small k-soft">It names no predecessor.</p>'}${p.successors.map((x) => `<p class="k-small">Followed by ${e(x.name)}${x.otherCreator ? ' — by another creator than this one’s' : ''}</p>${hashCopy(x.hash)} <button type="button" class="k-btn k-q k-small" data-spec="${e(x.hash)}">Its page</button>`).join('')}`)}
${p.others.length ? sect('Others’ cards', p.others.map((c) => card(c, false)).join('')) : ''}
${say('What a card is', p.say)}`;
}

export function pageForm(): string {
  return `<h2>A specification’s page</h2><p class="k-small k-soft">Everything that can be tied to one specification, from the relays Look asks: its text, its creator’s card, others’ cards as their word, its releases, vectors, discussion, the agreements naming it, its drafts.</p>
<form id="page" class="k-row"><input name="hash" class="k-grow" placeholder="Its hash: mspec1…, or hexadecimal" spellcheck="false" autocomplete="off" required><button type="submit" class="k-btn k-p">Open its page</button></form><div id="page-out"></div>`;
}

export function actsForm(): string {
  return `<h2>One specification’s acts</h2><p class="k-small k-soft">The public acts of one specification on the relays Look asks, by the filters relays already have: its spec hash, and an act type and a signer where given. Each judged through its signer’s chain.</p>
<form id="acts"><label>Its spec hash</label><input name="spec" spellcheck="false" required><label>An act type (optional)</label><input name="type" inputmode="numeric"><label>A signer (optional)</label><div class="k-row"><input name="signer" class="k-grow" spellcheck="false" data-k-id-field>${contactsButtonFor('signer')}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Look</button></div></form><div id="acts-out"></div>`;
}

export function acts(r: { acts: FoundAct[]; lines: Line[] }): string {
  return `${lines(r.lines)}${r.acts.length ? `<ul class="ummia-list">${r.acts.map((a) => `<li><span class="k-grow">type ${a.type} · by ${who({ id: a.signer, inline: true })} · <span class="ummia-v${a.standing === 'valid' ? ' valid' : ''}">${e(a.standing)}</span></span>${actCopy(a.id)}</li>`).join('')}</ul>` : '<p class="k-empty">No public act of it found.</p>'}`;
}

// ---------------------------------------------------------------- Discuss

export function mipsPane(m: { drafts: MipDraft[]; say: string[] }, open: string | null): string {
  const one = (d: MipDraft) => `<div class="k-box mip" data-key="${e(d.key)}"><div class="k-row"><h3 class="k-grow">${e(d.title)}</h3><span class="k-chip">${d.published ? 'published as a MIP' : d.drafts.length ? 'draft · discussed' : 'draft · kept here'}</span></div>
<p class="k-small k-soft">Forks ${e(d.forksName)} · ${d.drafts.length} draft${d.drafts.length === 1 ? '' : 's'} published for discussion${d.published ? '' : ' · kept here until you publish it'}</p>
${d.drafts.map((x, i) => `<div>${actCopy(x.id, `draft ${i + 1}`)}</div>`).join('')}
${d.published ? hashCopy(d.published.hash, false, 'its hash') : `${fold('Write it', `<form class="mip-text" data-key="${e(d.key)}"><textarea class="ummia-code" name="text" spellcheck="false">${e(d.text)}</textarea><div class="k-row"><button type="submit" class="k-btn">Keep it here (nothing is sent)</button></div></form>`, { open: open === d.key })}
<div class="k-row"><button type="button" class="k-btn" data-action="mip draft" data-key="${e(d.key)}">Publish this draft for discussion</button><button type="button" class="k-btn k-q" data-action="mip replies" data-key="${e(d.key)}">Replies</button><button type="button" class="k-btn k-q" data-action="mip prepare" data-key="${e(d.key)}">I am ready: publish it as a MIP…</button></div>`}
<div id="mip-out-${e(d.key)}"></div></div>`;
  return `<h2>MIP drafts</h2>${say('A MIP is a proposal toward MOR 2, drafted and discussed before it is published.', m.say)}${m.drafts.length ? m.drafts.map(one).join('') : '<p class="k-empty">No MIP drafted here yet: + Start a MIP.</p>'}`;
}

export function mipNew(forkable: { key: string; name: string }[]): string {
  return `<h2>Start a MIP</h2><form id="mip-new"><label>Its title</label><input name="title" required><label>What it forks</label><select name="forks">${forkable.map((f) => `<option value="${e(f.key)}">${e(f.name)}</option>`).join('')}<option value="">A MIP, or the MICS document (for a new layer), by its spec hash:</option></select><input name="hash" spellcheck="false" placeholder="a spec hash, where chosen above">
<div class="k-row"><button type="submit" class="k-btn k-p">Start it in the MIP shape</button></div></form>`;
}

/** Bug reports: the reporting identity settled here (settled on the mockups), the report, its answers. */
export function reportsPane(r: { sent: { id: string; title: string; at: number }[]; answers: { id: string; report: string; text: string; standing: string }[]; lines: Line[]; say: string[]; to: string | null }): string {
  const sent = r.sent.length
    ? r.sent
        .map((s) => {
          const as = r.answers.filter((a) => a.report === s.id);
          return `<div class="k-box"><h3>${e(s.title)}</h3>${actCopy(s.id)}${as.length ? as.map((a) => `<p class="k-small">Answered (<span class="ummia-v${a.standing === 'valid' ? ' valid' : ''}">${e(a.standing)}</span>): ${e(a.text)}</p>`).join('') : '<p class="k-small k-soft">No answer yet.</p>'}</div>`;
        })
        .join('')
    : '<p class="k-empty">No report sent from here.</p>';
  return `<h2>Bug reports</h2>${say('A report is public, signed by you, left in the reporting identity’s inbox.', r.say)}
${r.to ? `<p class="k-small k-soft">Reports go to ${who({ id: r.to, inline: true })}</p>` : ''}<form id="reporting" class="k-row"><label class="k-grow">The reporting identity<input name="reports" spellcheck="false" value="${e(r.to ? formOf(r.to, 'mid') : '')}" placeholder="Its ID: mid1…" data-k-id-field></label>${contactsButtonFor('reports')}<button type="submit" class="k-btn">Save</button></form>
${r.to ? `<form id="report"><label>The report: its first line is its title</label><textarea name="text" required></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Sign and send it</button></div></form>` : note('', 'Give the reporting identity’s ID first.')}
${lines(r.lines)}<h3>Sent from here</h3>${sent}`;
}

/** The reply box: a signed document (decided on the mockups). */
export function replyForm(to: string, title: string): string {
  return `<form id="reply" data-to="${e(to)}"><p class="k-small k-soft">Answering ${e(title)}: a long-form document, public, signed by you, naming it.</p><textarea name="text" required placeholder="Reply, as a signed document…"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Sign and send</button></div></form>`;
}

// ---------------------------------------------------------------- Publish

/** Who acts, as chips in Publish only (as drawn): yourself, or a collective you act for. */
export function whoActs(s: State): string {
  if (s.actors.length < 2) return '';
  // H96, H121: a collective by its name where it published one; else "Collective", numbered where there are several (its short ID is in the identity panel, a tap away).
  const unnamed = s.actors.filter((a) => a.kind === 'collective' && !nameOf(s.names?.[a.id]));
  const label = (a: Actor) => (a.kind === 'self' ? 'You' : (nameOf(s.names?.[a.id]) ?? `Collective${unnamed.length > 1 ? ` ${unnamed.indexOf(a) + 1}` : ''}`));
  return `<div class="ummia-who"><span class="k-small k-soft">Who acts</span>${s.actors.map((a) => `<button type="button" class="k-chip${a.id === s.acting ? ' k-on' : ''}" data-acting="${e(a.id)}"${a.available ? '' : ' disabled'} aria-pressed="${a.id === s.acting}">${e(label(a))}</button>`).join('')}</div>`;
}

export function releasePane(s: State, r: { releases: { id: string; name: string; version: string; folder: string; collective?: string }[] } | null): string {
  if (!s.releases) return `<h2>A release</h2>${note('', 'Releases are made from a folder on a computer: in Ummia on the Mac or Linux. This web client reads no folder, so it makes no release.')}`;
  const list = r?.releases ?? [];
  // H121: no short act ID in a choice (it cannot be tapped there): each release by its name and version, from its folder.
  const opts = list.map((x) => `<option value="${e(x.id)}">${e(x.name)} ${e(x.version)} (${e(x.folder)})</option>`).join('');
  const forCollective = !!actingOf(s);
  const rows = list.length
    ? list
        .map(
          (x) => `<div class="k-box" data-release="${e(x.id)}"><div class="k-row"><h3 class="k-grow">${e(x.name)} ${e(x.version)}</h3>${actCopy(x.id)}</div><p class="k-small k-soft">from ${e(x.folder)}</p>
<div class="k-row"><button type="button" class="k-btn" data-action="release check" data-id="${e(x.id)}">Check it as anyone would</button>${x.collective ? `<button type="button" class="k-btn" data-action="release standing" data-id="${e(x.id)}">Does it count for the collective?</button>` : ''}<button type="button" class="k-btn k-q" data-action="anchor open" data-id="${e(x.id)}">Anchor it on Bitcoin (optional)</button></div><div id="check-${e(x.id)}"></div><div id="anchor-${e(x.id)}"></div></div>`,
        )
        .join('')
    : '<p class="k-empty">No release from here yet.</p>';
  return `<h2>A release</h2>${whoActs(s)}
${say(forCollective ? 'Signed with your own key for the collective: it counts once the area reaching its releases is met.' : 'A release of code under your own name, from a folder, checked as anyone would.', [forCollective ? 'Where its area asks more keys, its other holders are asked, and sign in their own app.' : 'A collective’s releases are made here too: choose it in the identity panel, under your identity.', 'A git folder gives what git tracks; a plain folder every file but hidden ones; links are never followed. Every file is listed with its size and fingerprint before anything is signed.'])}
<form id="release"><label>The folder</label>
<div class="k-row"><input name="folder" class="k-grow" autocomplete="off" spellcheck="false" placeholder="~/code/my-module"><button type="button" class="k-btn" data-action="folders">Choose a folder…</button></div>
<div id="picker"></div><p class="k-small k-soft" id="folder-said"></p>
<label>Its name (the folder’s, by default)</label><input name="name" autocomplete="off">
<label>Its version</label><input name="version" autocomplete="off" placeholder="1.0">
<label>The release before it</label><select name="previous"><option value="">None: a new release line</option>${opts}</select>
<label>Specifications it implements (optional): their publications’ act ids, one per line</label><textarea name="implements" spellcheck="false"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form>
<div id="release-review"></div>
<h3>${forCollective ? 'The collective’s releases' : 'Your releases'}</h3>${rows}`;
}

export function picker(l: { path: string; parent: string | null; places: { name: string; path: string }[]; folders: { name: string; path: string; git: boolean; spaced: string | null }[]; hidden: number; problem: string | null }): string {
  return `<div class="ummia-picker"><p class="k-small">${e(l.path)}</p>
<div>${l.places.map((p) => `<button type="button" class="k-btn k-q k-small" data-action="folders" data-path="${e(p.path)}">${e(p.name)}</button>`).join('')}${l.parent ? `<button type="button" class="k-btn k-q k-small" data-action="folders" data-path="${e(l.parent)}">Up</button>` : ''}<button type="button" class="k-btn k-p k-small" data-action="folder use" data-path="${e(l.path)}">Use this folder</button></div>
${l.problem ? note('', e(l.problem)) : ''}
<div>${l.folders.map((f) => `<button type="button" class="k-btn k-small" data-action="folders" data-path="${e(f.path)}">${e(f.name)}${f.git ? ' · git' : ''}${f.spaced ? ` (${e(f.spaced)})` : ''}</button>`).join('')}</div>${l.hidden ? `<p class="k-small k-soft">${l.hidden} hidden folder${l.hidden === 1 ? '' : 's'} not shown.</p>` : ''}</div>`;
}

export function checked(c: { ok: boolean; lines: Line[] }): string {
  return `<div class="${c.ok ? '' : 'ummia-blocking'}">${lines(c.lines)}</div>`;
}

export function anchorForm(release: string, offers: Offer[] | null, sayIt: string[]): string {
  const choose = offers
    ? offers.length
      ? `<label>Its standing offer, and a tier</label><select name="choice">${offers.flatMap((o, n) => o.tiers.map((t, i) => `<option value="${e(o.act)} ${i}">offer ${n + 1}, tier ${i}: within ${t.blocks} blocks, ${t.price} (its unit)</option>`)).join('')}</select><div class="k-row"><button type="submit" class="k-btn k-p">Prepare the payment for Damgar</button></div>`
      : note('', 'No standing offer of that service was found under the anchoring cMIP.')
    : '<div class="k-row"><button type="submit" class="k-btn">Read its offer</button></div>';
  return `<form class="anchor" data-release="${e(release)}">${say('Anchoring is optional: offered by a service, its tier chosen here, prepared for Damgar and paid there.', sayIt)}<label>The anchoring service’s ID</label><div class="k-row"><input name="service" class="k-grow" autocomplete="off" spellcheck="false" required data-k-id-field>${contactsButtonFor('service')}</div>${choose}</form>`;
}

const TASK_TICKS = (tasks: { n: number; layer: string; name: string }[]) => `<div class="ummia-ticks">${tasks.map((t) => `<label><input type="checkbox" name="tasks" value="${t.n}"> ${t.n}. ${e(t.name)} (${e(t.layer)})</label>`).join('')}</div>`;

export function specPane(s: State, choices: { tasks: { n: number; layer: string; name: string }[] }): string {
  return `<h2>A cMIP or Module</h2>${whoActs(s)}
${say('Its hash first: read back before anything is signed. Published for good.', ['A cMIP or a Module, published as its act and named by its spec hash. A changed specification is a new one. A MIP is drafted under Discuss. A specification is published as yourself: a collective acts here for its releases.', 'Right after it is signed, Ummia offers its card (title, summary, links) and a discussion thread naming it, so there is somewhere to go from day one.'])}
<form id="spec"><label>Its kind</label><select name="kind"><option value="0">cMIP: a specification for a task, an extension, or new act types (an xtype)</option><option value="1">Module: an implementation or extension under a cMIP, or under a MIR</option></select>
<label>Its text (canonical text: no space at the end of a line, no final line break)</label><textarea class="ummia-code" name="text" spellcheck="false" placeholder="# cMIP: …"></textarea>
<input type="file" id="spec-file" accept=".md,.txt,text/plain,text/markdown"><span class="k-small k-soft"> or load it from a file</span>
<p class="k-small k-soft">Fill below only what your text says.</p>
${fold('A cMIP: the tasks it fills (field 2)', `${TASK_TICKS(choices.tasks)}`)}
${fold('Act types it defines (field 3): one per line, “number name schema”', `<textarea name="types" spellcheck="false" placeholder="0 note note = tstr"></textarea>`)}
${fold('A Module: the cMIP it implements, or the MIR it works under (field 5)', `<input name="implements" spellcheck="false" placeholder="a spec hash">`)}
${fold('A rail Module: its kind and what its proof binds (fields 11 and 13)', `<select name="railKind"><option value="">Not a rail</option><option value="0">a request rail</option><option value="1">a push rail</option></select>
<div class="ummia-ticks"><label><input type="checkbox" name="railBinds" value="0"> the payee</label><label><input type="checkbox" name="railBinds" value="1"> the purpose</label><label><input type="checkbox" name="railBinds" value="2"> the previous hop</label></div>`)}
${fold('As an extension, the layers it acts on (field 10)', `<div class="ummia-ticks">${['Identity', 'Envelopes and Text', 'Money', 'Agreements'].map((l, i) => `<label><input type="checkbox" name="layers" value="${i}"> ${l}</label>`).join('')}</div>`)}
${fold('Its predecessor (field 8), dependencies (field 4), a proof-of-delivery checker (field 12)', `<label>The specification it replaces, for its users</label><input name="predecessor" spellcheck="false" placeholder="a spec hash">
<label>Specifications it depends on, one per line</label><textarea name="dependencies" spellcheck="false"></textarea>
<label><input type="checkbox" name="checker"> It checks proofs of delivery of proven offers</label>`)}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back, with its hash</button></div></form>
<div id="spec-review"></div>`;
}

/** Its card (and a thread), offered right after a specification is signed, or later from Published here. */
export function cardForm(c: { hash: string; title: string; summary?: string; discussion?: string | null; later: boolean; limits: { title: number; summary: number } }): string {
  return `<div class="k-box k-fill" id="card-offer"><h3>${c.later ? 'A later card' : 'Its card'}</h3>${hashCopy(c.hash, false, 'for')}
${say('A card says what it is for and where to go next: a plain post, signed by you.', ['Every app shows it as the post it is. The latest card in your own sequence is the one that counts: sign a later one whenever a release, its vectors or its discussion arrive. Read back before it is signed.'])}
<form id="card" data-hash="${e(c.hash)}"><label>Its title</label><input name="title" maxlength="${c.limits.title}" value="${e(c.title)}" required>
<label>A short summary: what it is for, in plain words</label><textarea name="summary" maxlength="${c.limits.summary}">${e(c.summary ?? '')}</textarea>
<label>Releases implementing it: their act IDs, one per line (optional)</label><textarea name="releases" spellcheck="false"></textarea>
<label>Its test vectors: act IDs or https addresses, one per line (optional)</label><textarea name="vectors" spellcheck="false"></textarea>
${c.discussion ? `<input type="hidden" name="discussion" value="${e(c.discussion)}"><p class="k-small k-soft">Its discussion: the thread already named.</p>` : `<label class="k-row"><input type="checkbox" name="thread" checked> Start a discussion thread naming it, signed just before the card</label>`}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button><button type="button" class="k-btn k-q" data-action="card-skip">Not now</button></div></form><div id="card-review"></div></div>`;
}

/** Anchoring: offered, its tier, prepared and paid in Damgar (as drawn): the anchors asked, and how to ask one. */
export function anchoringPane(anchors: AnchorShown[], sayIt: string[], web: boolean): string {
  return `<h2>Anchoring</h2>${say('Optional: a release’s fingerprint on Bitcoin, through a pooled anchoring service, paid in Damgar.', sayIt)}
<p class="k-small k-soft">Ask from a release (A release › Anchor it on Bitcoin), or from any card’s act menu (Anchor it).${web ? ' The web client follows no chain: anchors are shown asked, never checked here.' : ''}</p>
<h3>Anchors asked</h3>${anchors.length ? anchors.map((a) => `<div class="k-box"><div class="k-row"><h3 class="k-grow">${e(a.label)}</h3><span class="ummia-v${a.state === 'anchored' ? ' valid' : a.state === 'invalid' ? ' bad' : ''}">${e(a.state)}</span></div>${actCopy(a.act)}<p class="k-small k-soft">tier ${a.tier} · by ${who({ id: a.service, inline: true })}</p>${lines(a.lines)}</div>`).join('') : '<p class="k-empty">None asked yet.</p>'}`;
}

// ---------------------------------------------------------------- Choose

export function choosePane(a: { entries: AcceptedEntry[]; version: number; forked: boolean; merged: string[]; published: boolean; problems: string[]; say: string[] }, layer: string | null): string {
  const shown = layer ? a.entries.filter((x) => (x.layer ?? '').split(', ').includes(layer)) : a.entries;
  return `<h2>Rules I follow${layer ? ` · ${e(layer)}` : ''}</h2>${say('Sealed to you, read by every app', a.say)}
${a.problems.length ? note('', lines(a.problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}
${a.forked ? note('', `Two apps changed it at once. Shown merged, nothing dropped: ${lines(a.merged.map((t) => ({ text: t })))} Your next change writes the merge.`) : ''}
<p class="k-small k-soft">${a.version ? `Version ${a.version}.` : 'Nothing accepted yet: the default, under which no app signs anything under any specification.'}</p>
${shown.length ? `<ul class="ummia-list" id="accepted">${shown.map((x) => `<li data-hash="${e(x.hash)}"><span class="ummia-tick">✓</span><span class="k-grow"><span>${e(x.label ?? 'A specification with no label')}</span><br><span class="k-small k-soft">${e(x.layer ?? 'layer not found on your relays')} · ${e(x.part)}</span></span>${hashCopy(x.hash)}<button type="button" class="k-btn k-q k-small" data-action="accepted remove" data-hash="${e(x.hash)}">Remove</button><button type="button" class="k-btn k-q k-small" data-spec="${e(x.hash)}">Its page</button></li>`).join('')}</ul>` : `<p class="k-empty">${layer ? `Nothing accepted in ${e(layer)}.` : 'Nothing accepted.'}</p>`}
<div class="k-row"><button type="button" class="k-btn" data-action="accept-hash-open">+ Accept by hash</button><span class="k-grow"></span><span class="k-small k-soft">${a.published ? 'Published: anyone can read it.' : 'Private: sealed to yourself (the default).'}</span><button type="button" class="k-btn k-q" data-action="accepted publish" data-on="${a.published ? 'false' : 'true'}">${a.published ? 'Make it private again' : 'Publish it'}</button></div>`;
}

export function acceptForm(hash = '', label = ''): string {
  return `<form id="accept-add"><label>Its spec hash</label><input name="hash" spellcheck="false" required value="${e(hash)}"><label>Its label (its name and draft)</label><input name="label" maxlength="120" value="${e(label)}">
<div class="k-row"><button type="submit" class="k-btn k-p">Accept it</button></div></form>`;
}

export function relyForm(id: string): string {
  return `<form id="rely" data-id="${e(id)}">${say('Relying on an act keeps it visible as disputed should its author ever disown it.', ['A witness act (Identity type 15), public at your homes and relays, naming the act: it relies on it, it pays nothing. Signed with your key, checked first; through Kišib’s panel where Kišib holds this identity.'])}${actCopy(id)}<label>Type RELY to sign the witness act</label><input name="typed" autocomplete="off" autocapitalize="characters" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Sign the witness act</button></div></form>`;
}
