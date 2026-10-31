// Damgar's page, as HTML strings, on the Dubsar Suite's kit (`clients/kit`),
// for the program on the Mac and Linux and for the web client alike (`web`
// set). Rebuilt on the kit on 22 October 2026, as the redesign drew it
// (`docs/design/suite-redesign.md`, "Damgar" and "Answered on the mockups";
// the mockups `damgar-*`): four tiles with their danger marks (Waiting
// three, Account one, Lanes two, Settings two), each opening its column;
// the identity top right, the collectives under each identity, so acting as
// a collective is the identity panel's gesture. Everything from the program,
// from relays or typed by the person is escaped.

import { APPS, KIT_STYLE } from '../../../kit/src/style.ts';
import { appMark, contactsButton, e, fold, meButton, note, opened, say, tiles, top, type ColumnEntry, type Named, type Tile, whatIsMor } from '../../../kit/src/html.ts';
import { actId, contactsButtonFor, hashButton, who } from '../../../kit/src/ids.ts';
import { qrSvg } from '../../../kit/src/qr.ts';
import { cardWords } from '../../../genesis/src/card-words.ts';
import { actFormOf } from '../../../dub/src/page/view.ts';
import type { Account, Accept, LaneShown, Line, PaymentShown, Rails, Shown, State, ToSign, Verdict, Who } from '../shapes.ts';

export { e, note, say };

/**
 * An identity wherever Damgar shows one (H96, H106, H121): its names (the
 * nickname, then the name it published, faint), asked of Damgar once drawn,
 * and its short ID under them, a button: one tap shows it whole, a second
 * copies it. Never a bare short ID.
 */
export const whoOf = (w: { id: string; me?: boolean }, inline = true): string => who({ id: w.id, me: !!w.me, inline });
export { actId, hashButton };
export type { Account, Accept, LaneShown, Line, PaymentShown, Rails, State, ToSign };

export const NAME = 'Damgar';
export const TEST_ONLY = 'Test identities and test networks only, until MOR is frozen. No real money';

/** Damgar's colour: the Money layer's gold (H36), in pastel fills (decided, 21 October 2026). */
export const TINT = { layer: APPS.damgar.colour, pastel: APPS.damgar.pastel } as const;

/**
 * The web client's banner, on every page it shows, in one line with a "?"
 * that opens the risks in plain words. In the page's HTML itself
 * (`static/web.html`, written there by the build), so it shows even when the
 * script does not run.
 */
export const WEB_BANNER = `<details class="k-say damgar-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY}. Damgar holds no wallet.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment you bring an identity here could copy its signing key, and the on-chain request key Damgar makes: with them, sign claims and receipts as you, and commit your side to payments you did not intend.</li>
<li>This browser’s storage, where those keys are kept, can be lost, or read by what runs in this page.</li>
<li>Damgar holds no wallet: money moves only in your own wallet, on a test network. This page follows no chain, so an on-chain payment is shown paid, not yet checked against the chain.</li></ol>
<p>Never bring a real identity here, and never pay real money for anything it shows.</p></div></details>`;

/** The page's style: the kit's, and Damgar's few own pieces. */
export const STYLE = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.damgar-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.damgar-banner strong{font-weight:400;color:var(--k-text)}
.damgar-banner ol{margin:4px 0;padding-left:1.4em}
.damgar-foot{flex:none;padding:0 28px 10px}
.damgar-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.damgar-first h2{font-size:24px;margin:8px 0 4px}
.damgar-pane{max-width:860px;width:100%}
.damgar-pane h2{font-size:24px;margin:2px 0 4px}
.damgar-pane .k-feed{flex:none;max-height:none}
.damgar-pane textarea{min-height:76px}
.damgar-lines{margin:4px 0;padding-left:1.1em;font-size:14px}
.damgar-lines li{margin:3px 0}
li.bad{color:var(--k-bad)}
li.warn{color:var(--k-soft)}
.damgar-qr{display:inline-block;line-height:0;border-radius:8px;overflow:hidden;max-width:100%}
.damgar-qr svg{max-width:100%;height:auto}
.damgar-wallet{margin:6px 0 8px}
.damgar-wallet a.k-btn{text-decoration:none;display:inline-flex;align-items:center}
.damgar-copy{font:12px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-soft);overflow-wrap:anywhere;border:1px solid var(--k-edge);border-radius:10px;padding:8px 10px;background:var(--k-bg);margin:6px 0}
.damgar-v{font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--k-edge);color:var(--k-soft)}
.damgar-v.valid{color:var(--k-text);border-color:var(--k-p)}
.damgar-v.invalid{color:var(--k-bad);border-color:var(--k-bad)}
.damgar-proofs{border-top:1px solid var(--k-line);margin-top:8px;padding-top:6px;font-size:13px}
.damgar-proofs .p{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin:4px 0}
.damgar-totals{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:10px 0}
.damgar-totals .k-box{margin:0}
.damgar-totals .k-box.k-fill{background:var(--k-raise)}
.damgar-totals h4{margin:0 0 6px;font-size:13px;color:var(--k-soft);font-weight:400}
.damgar-costs{border:1px solid var(--k-bad);border-radius:14px;padding:10px 16px;margin:10px 0}
.damgar-costs h3{font-size:14px;margin:0 0 4px}
.damgar-accept{list-style:none;padding:0;margin:0}
.damgar-accept li{border:1px solid var(--k-line);border-radius:12px;padding:10px 14px;margin:8px 0}
.damgar-accept .damgar-check{display:flex;gap:8px;align-items:center;color:var(--k-text);font-size:15px;margin:0}
.damgar-accept .k-kind{margin-left:6px}
.damgar-accept p{margin:4px 0 0 26px;font-size:13px;color:var(--k-soft)}
.damgar-check{display:flex!important;gap:8px;align-items:center;color:var(--k-text)!important;font-size:14px!important}
.damgar-lane{border:1px solid var(--k-line);border-radius:14px;padding:12px 16px;margin:10px 0}
.damgar-lane h3{font-size:17px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.damgar-state{font-size:12.5px;padding:2px 10px;border-radius:999px;background:var(--k-wash2);color:var(--k-text)}
.damgar-over{color:var(--k-bad)}
.k-act .damgar-acts{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 2px}
@media (max-width:600px){
  .k-top .k-tabs{display:none}
  .damgar-foot{padding:0 12px 8px}
}`;

const lines = (ls: Line[]) => (ls.length ? `<ul class="damgar-lines">${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>` : '');
export { lines };

/** An ID written for people (`mid1…`, `mact1…`) from its hexadecimal: Dub's, shared. */
export const formOf = actFormOf;

// ---------------------------------------------------------------- the frame

/** The tabs, by key, in the order of the tiles. */
export type Tab = 'waiting' | 'account' | 'lanes' | 'settings';

const TILES: (Tile & { key: Tab })[] = [
  { key: 'waiting', name: 'Waiting', say: 'Payments to read, sign and pay in your wallet; invoices to make, receipts to sign; one pasted by hand; to the vault.', icon: 'waiting', danger: 3 },
  { key: 'account', name: 'Account', say: 'In, out, pending, owed. Per unit, never summed across units. What other apps paid under their lanes.', icon: 'account', danger: 1 },
  { key: 'lanes', name: 'Lanes', say: 'What each app may pay without asking: a cap per act, a cap in all, kinds, an expiry.', icon: 'lanes', danger: 2 },
  { key: 'settings', name: 'Settings', say: 'Where you are paid (the vault set in Kišib), the rules you follow, homes and relays, every step by hand.', icon: 'settings', danger: 2 },
];

/** Acting as: the identity in use, or one of its collectives (the identity panel's gesture). */
export interface Acting {
  id: string;
  form: string;
  name: string | null;
  /** Its published name as read (H96). */
  named?: Named | null;
}

/** The top of the window: Damgar (back to the tiles), its tabs once a tile is open, the identity (or the collective acted as) top right. */
export function topBar(s: State, tab: Tab | null, acting: Acting | null): string {
  const i = s.identity;
  const tabs = tab ? `<nav class="k-tabs" aria-label="Damgar">${TILES.map((t) => `<button type="button" class="k-tab${t.key === tab ? ' k-on' : ''}" data-tab="${t.key}"${t.key === tab ? ' aria-current="page"' : ''}>${e(t.name)}${t.key === 'waiting' && s.counts.toSign + s.counts.toPay ? `<span class="k-count">${s.counts.toSign + s.counts.toPay}</span>` : ''}</button>`).join('')}</nav>` : '';
  // H96: its name as read: Loading…, its name, No name published, or Name not reached; never a bare mid1… in its place.
  const me = i ? meButton({ name: i.name, form: i.form, named: i.named ?? null, as: acting ? { name: acting.name, form: acting.form, named: acting.named ?? null } : null }) : '';
  // H100: Contacts top left, the one list, as in every app.
  return top({ left: `<div class="k-row">${contactsButton()}<button type="button" class="k-btn k-q" data-action="home-tiles" title="The four tiles">${appMark(NAME, 'icon.png')}</button></div>${tabs}`, right: me });
}

/** The four tiles, their danger marks; the counts on Waiting. */
export function home(s: State, web: boolean, acting: Acting | null): string {
  const n = s.counts;
  const ts = TILES.map((t) => (t.key === 'waiting' && n.toSign + n.toPay ? { ...t, say: `To sign: ${n.toSign} · to pay: ${n.toPay}. Each read in plain words before you sign; paid only in your own wallet.` } : t));
  return `${topBar(s, null, acting)}<div class="k-body k-col-flex">${tiles(ts)}</div>
<div class="damgar-foot">${say(TEST_ONLY, [web ? 'The web client is for testing only: the banner above says its risks.' : 'Damgar holds no wallet and no node: money moves only in your own wallet. The signing key and the on-chain request key are held in software in this program’s folder: a prototype, never for a real identity.'], { mor: whatIsMor })}</div>`;
}

/** Each tab's column. Acting as a collective, Waiting gains its own part. */
export function column(tab: Tab, s: State, c: { toPay: number; toReceive: number; asked: number; inForce: number; ended: number }, acting: Acting | null): ColumnEntry[] {
  switch (tab) {
    case 'waiting':
      return [
        { key: 'to-pay', label: 'To pay', k: c.toPay },
        { key: 'to-receive', label: 'To receive', k: c.toReceive },
        ...(acting ? ['-' as ColumnEntry, { key: 'collective', label: `For ${acting.name ?? 'the collective'}` } as ColumnEntry] : []),
        '-',
        { key: 'paste', label: '+ Paste an act to sign' },
        { key: 'vault', label: 'To the vault' },
      ];
    case 'account':
      return [{ key: 'summary', label: 'Summary' }, { key: 'payments', label: 'Payments' }, { key: 'shared', label: 'Shared deals' }, { key: 'under', label: 'Under the lanes' }, { key: 'anchors', label: 'Anchors' }];
    case 'lanes':
      return [{ key: 'asked', label: 'Asked', k: c.asked }, { key: 'in-force', label: 'In force', k: c.inForce }, { key: 'own', label: 'Damgar’s own' }, '-', { key: 'ended', label: 'Ended', k: c.ended }];
    case 'settings':
      return [{ key: 'paid', label: 'Where you are paid' }, { key: 'accept', label: 'Rules I follow' }, { key: 'relays', label: 'Homes and relays' }, '-', { key: 'manual', label: 'Every step by hand' }];
  }
}

export const firstPart = (tab: Tab): string => ({ waiting: 'to-pay', account: 'summary', lanes: 'in-force', settings: 'paid' })[tab];

/** A tab opened: its column on the left, the part on the right. */
export function tabPage(s: State, tab: Tab, part: string, counts: Parameters<typeof column>[2], acting: Acting | null): string {
  return `${topBar(s, tab, acting)}${opened(column(tab, s, counts, acting), part, `<div class="damgar-pane" id="pane"><p class="k-empty">Reading…</p></div><div id="status" class="k-status"></div>`)}`;
}

export function pairing(): string {
  return `<div class="damgar-first"><h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Damgar program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div>`;
}

/** A page of the program's start with nothing else: a note alone. */
export const alone = (html: string) => `<div class="damgar-first">${appMark(NAME, 'icon.png')}${html}</div>`;

// ---------------------------------------------------------------- the first screen, and + Add

const runnerSay = (web: boolean) => (web ? 'through Kišib’s runner, in the computer’s program only: never in the web client' : 'through Kišib’s runner, on this Mac: Damgar holds no key, and Kišib’s panel asks for every money act');

/** + Add's three ways, as the identity panel lists them. */
export const ADD = (web: boolean) => [
  { key: 'make', label: 'Make one', say: 'its chain key’s words shown once' },
  { key: 'bring', label: 'Bring one', say: 'its ID and its signing key’s words' },
  { key: 'kishib', label: 'Use one from Kišib', say: runnerSay(web), empty: web },
];

/** No identity yet: make one, bring one, or use one from Kišib. */
export function firstScreen(web: boolean, part: 'make' | 'bring' | 'kishib' = 'bring'): string {
  return `<div class="damgar-first">${appMark(NAME, 'icon.png')}<h2>First, an identity</h2>
<p class="k-soft">Damgar holds no wallet: it reads money acts in plain words, signs them for you, and keeps the account. It needs an identity to sign as.</p>
<div class="k-row">${ADD(web).map((a) => `<button type="button" class="k-btn${a.key === part ? ' k-p' : ''}" data-add="${a.key}"${a.empty ? ' disabled' : ''}>${e(a.label)}</button>`).join('')}</div>
<div id="first-part">${part === 'make' ? makeForm() : part === 'kishib' ? '<p class="k-small k-soft">Reading Kišib’s runner…</p>' : bringForm()}</div>
<div id="status" class="k-status"></div></div>`;
}

export function bringForm(): string {
  return `<form id="bring"><p class="k-small k-soft">By its ID and its signing key’s words, as Dub, Edubba or Kišib show them (never the chain key’s).</p>
<label>Its ID (mid1…, or its hexadecimal)</label><div class="k-row"><input name="id" class="k-grow" autocomplete="off" spellcheck="false" required>${contactsButtonFor('id')}</div>
<label>Its signing key: its 24 words, or its string (morsk1…), as you wrote it down</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<label>Relays, one per line, if it names none</label><textarea name="relays"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Bring it</button></div></form>`;
}

export function makeForm(): string {
  return `<form id="make"><p class="k-small k-soft">Its chain key’s 24 words are shown once, for you to write on paper; Damgar keeps none of them. Three are typed back before anything is published.</p>
<label>Its homes, one per line (where it lives; anyone checks it there)</label><textarea name="homes" required placeholder="https://"></textarea>
<label>Its relays, one per line (its acts and its inbox); its homes if none</label><textarea name="relays"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Make it</button></div></form>`;
}

/** The chain key's words, shown once; three asked back. */
export function makeWords(r: { words: string[]; positions: number[] }): string {
  return `<div class="k-box"><h3>Its chain key’s words</h3><p class="k-small k-soft">Write them on paper, in order, now. They are shown once: Damgar keeps none of them. With them, in Kišib, you change its keys, its vault, its successor.</p>
<div class="k-words">${r.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join('')}</div></div>
<form id="make-confirm"><p class="k-small k-soft">Hide them, then type back words ${r.positions.join(', ')}.</p>
<div class="k-row">${r.positions.map((p) => `<label class="k-grow">Word ${p}<input name="w${p}" autocomplete="off" autocapitalize="off" spellcheck="false" required></label>`).join('')}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Publish it</button></div></form>`;
}

/** Use one from Kišib: the pairing, its code, the identities Kišib lets Damgar use. */
export function runnerForm(r: { available: boolean; state: string | null; code: string | null; identities: { id: string; form: string; name: string | null; held: boolean }[]; problem: string | null }): string {
  if (!r.available) return `<p class="k-small k-soft">Kišib’s runner is in the computer’s program only, on the Mac: never in the web client. Bring the identity here by its words instead.</p>`;
  const ids = r.identities.length
    ? `<div class="k-list">${r.identities.map((x) => `<div><span>${who({ id: x.id, named: x.name ? { published: { state: 'name', name: x.name } } : null, inline: true })}</span><button type="button" class="k-btn k-small k-r" data-runner-take="${e(x.id)}">${x.held ? 'Use it' : 'Use it here'}</button></div>`).join('')}</div>`
    : '';
  return `${r.problem ? note('error', e(r.problem)) : ''}
${say('Kišib keeps the identity’s signing key on this Mac; Damgar holds none.', ['Pairing starts here and is approved in Kišib (Runner, Apps), comparing the code. Then every money act Damgar would sign is a request to Kišib, and Kišib’s panel appears inside Damgar’s window: money always asks. Allow “may open what is sealed to this identity” in Kišib, or Damgar cannot read what waits for it.'])}
${r.state === 'approved' ? `<p class="k-small">Kišib approved Damgar (code ${e(r.code ?? '')}). The identities it lets Damgar use:</p>${ids || '<p class="k-small k-soft">None yet: choose some for Damgar in Kišib.</p>'}` : r.state === 'waiting' ? `<p>Approve Damgar in Kišib (Runner, Apps), comparing this code: <span class="k-mono">${e(r.code ?? '')}</span></p><div class="k-row"><button type="button" class="k-btn" data-action="runner-look">I approved it in Kišib</button></div>` : `<div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Ask Kišib to pair</button></div>`}`;
}

/** What is accepted: each specification, with its version, what it does, what Damgar does with it. */
export function acceptList(items: Accept[]): string {
  return `<ul class="damgar-accept">${items
    .map(
      (a) => `<li><label class="damgar-check"><input type="checkbox" name="accept" value="${e(a.key)}"${a.accepted ? ' checked' : ''}> ${e(a.name)}<span class="k-kind">${e(a.kind)}, draft ${a.draft}</span></label>
<p>${e(a.does)}</p><p>${e(a.here)}</p><p class="k-faint">${e(a.text)}${a.built ? '' : ' · not used by Damgar yet'}${a.needs.length ? ` · needs ${a.needs.map(e).join(', ')}` : ''}</p></li>`,
    )
    .join('')}</ul>`;
}

export function acceptScreen(s: State): string {
  return `<div class="damgar-first">${appMark(NAME, 'icon.png')}<h2>Rules I follow</h2>
${say('Damgar signs only under what you accept here; anything else is shown unknown, never signed.', ['Every money act names the specifications it follows. Damgar reads, checks and signs only under those you accept; an act under any other is shown unknown, as the core treats a specification it does not implement. Your choice is sealed to your identity and kept at its homes, so every app holding it reads the same list; changeable in Settings.'])}
${s.list.problems.length ? note('', lines(s.list.problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}
<form id="accept">${acceptList(s.accept)}<div class="k-row"><button type="submit" class="k-btn k-p">Add these to my list</button><button type="submit" class="k-btn" data-in="here">In Damgar only</button><button type="button" class="k-btn" data-action="accept-later">Later</button><span class="k-grow"></span><button type="button" class="k-btn k-q" data-action="first-back">← Another identity</button></div><p class="k-small k-soft">Later: every money act is shown unknown until you choose, in Settings, Rules I follow.</p></form><div id="status" class="k-status"></div></div>`;
}

// ---------------------------------------------------------------- the identity's own menu, its parts in the pop-up

export const IDENTITY_MENU = [
  ['words', 'Words', ''],
  ['line', 'Line and homes', ''],
  ['renew', 'New words from Kišib', 'after a change of keys'],
  ['collective', 'A collective under it', ''],
  ['remove', 'Remove from Damgar…', ''],
] as const;

export function wordsShown(c: { grouped: string; words: string[] }): string {
  return `<p class="k-small k-soft">With the ID, they bring this identity into Damgar, Dub or Edubba on another device. Whoever holds them can sign claims and receipts as this identity and open what is sealed to it. They are not the chain key’s words, and not a Bitcoin wallet’s.</p>
<p class="k-mono">${e(c.grouped)}</p><div class="k-words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join('')}</div>`;
}

export function lineShown(s: State): string {
  const i = s.identity!;
  return `<dl class="k-facts"><dt>ID</dt><dd class="k-mono">${e(i.form)}</dd><dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd><dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd><dt>Damgar’s line</dt><dd>${cardWords(i.line, 'Damgar', e)}</dd></dl>
${say('Give Kišib this card at a change of keys.', ['Most of Damgar’s acts are sealed, so Kišib cannot read its line from the homes: when the signing key is changed there, give Kišib this card (latest act, position, summary), or every claim and receipt signed here becomes void.'])}
${i.encryption ? '' : note('error', 'Damgar holds no encryption key for this identity: nothing sealed to it opens here.')}`;
}

export function renewForm(): string {
  return `<form id="renew"><p class="k-small k-soft">Its signing key was changed elsewhere (in Kišib): give the new signing key’s words, and Damgar signs with them, in a new line.</p><label>The new signing key: its 24 words, or its string (morsk1…)</label><textarea name="words" required autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Use the new words</button></div></form>`;
}

export function collectiveForm(cs: { id: string; form: string }[]): string {
  // H121: each collective by its names, its short ID a button; H119: Contacts beside the field taking an ID.
  return `<p class="k-small k-soft">A collective whose Money area you hold: Damgar acts for it with your own key for it, sealed to you when you signed its founding. Then choose it under this identity in the panel: Waiting shows its part.</p>
${cs.length ? `<div class="k-list">${cs.map((c) => `<div><span>${who({ id: c.id, collective: true, inline: true })}</span><button type="button" class="k-btn k-q k-small k-r" data-collective-remove="${e(c.id)}">Stop acting for it</button></div>`).join('')}</div>` : ''}
<form id="collective-add" class="k-row"><input name="id" class="k-grow" placeholder="A collective’s ID (mid1… or hex)" autocomplete="off" spellcheck="false" required>${contactsButtonFor('id')}<button type="submit" class="k-btn k-p">Act for it</button></form>`;
}


// ---------------------------------------------------------------- what waits

const verdict = (v: Verdict) => `<span class="damgar-v ${e(v.answer)}" title="${e(v.why)}">${e(v.answer)}</span>`;
const btn = (action: string, id: string, label: string, primary = false, key = 'id') => `<button type="button" class="k-btn${primary ? ' k-p' : ' k-q'}" data-action="${e(action)}" data-${key}="${e(id)}">${e(label)}</button>`;

/** The buttons and forms of one thing waiting (inside its card). */
export function itemActs(t: ToSign): string {
  const offers = t.offers
    .map((o) => {
      switch (o) {
        case 'sign':
          return btn('sign draft', t.id, t.kind === 'draft' && t.title.startsWith('A request') ? 'Sign and send the request' : 'Sign it', true);
        case 'decline':
          return btn('decline', t.id, t.kind === 'unknown' ? 'Set it aside' : 'Decline');
        case 'debt':
          return btn('accept debt', t.id, 'Accept as a debt');
        case 'pay':
          return btn('pay request', t.id, 'Pay it', true);
        case 'receipt':
          return btn('sign receipt', t.id, 'Check it, and sign the receipt', true);
        case 'refuse':
          return btn('refuse invoice', t.id, 'Refuse');
        case 'grant':
          return btn('grant lane', t.id, 'Grant this lane', true);
        case 'address':
          return btn('answer address', t.id, 'Give an address bound to it', true);
        default:
          return '';
      }
    })
    .join('');
  const invoice = t.offers.includes('invoice')
    ? `<label>The description hash to give your wallet</label><div class="damgar-copy">${e(t.descriptionHash ?? '')}</div><button type="button" class="k-btn k-q k-small" data-action="copy" data-text="${e(t.descriptionHash ?? '')}">Copy it</button>
<form class="invoice" data-id="${e(t.id)}"><label>The invoice your wallet made (BOLT 11)</label><textarea name="invoice" required spellcheck="false" placeholder="lnbcrt…"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Check it and send it</button></div></form>`
    : '';
  return `${t.amount ? `<p>${e(t.amount.said)}</p>` : ''}${lines(t.lines)}${invoice}<div class="damgar-acts">${offers}</div>`;
}

/**
 * H117 (decided: "let's have at least the wallet receive the invoices for
 * aproval"): the invoice handed to the person's wallet, every payment still
 * approved there. Where a WebLN wallet is in the browser, it is offered
 * first, and the proof it returns is taken back by itself; **Open in
 * wallet**, a `lightning:` link opening the wallet app with the invoice
 * filled in, and its QR for a wallet on a phone, whose proof is pasted back.
 * No spending link.
 */
export function openInWallet(key: string, invoice: string): string {
  const webln = typeof globalThis !== 'undefined' && !!(globalThis as { webln?: unknown }).webln;
  const link = `lightning:${invoice}`;
  return `<div class="damgar-wallet" data-wallet="${e(key)}"><div class="k-row">${webln ? `<button type="button" class="k-btn k-p" data-action="webln" data-key="${e(key)}" data-invoice="${e(invoice)}">Pay with your browser’s wallet</button>` : ''}<a class="k-btn${webln ? '' : ' k-p'}" href="${e(link)}" data-open-wallet>Open in wallet</a></div>
${fold('Its QR code, for a wallet on your phone', `<div class="damgar-qr">${qrSvg(link, { level: 'M', label: 'The invoice, as a QR code' })}</div>`)}
<p class="k-small k-soft">${webln ? 'Your browser’s wallet asks you to approve it, then hands the proof back here by itself.' : 'Your wallet asks you to approve it; then paste its proof below.'} Nothing is paid without your approval in the wallet.</p></div>`;
}

/** What a payment shows to be paid: the invoice or address, the proof pasted back; a vault's invoice; an anchor's ticket. */
export function payment(p: PaymentShown, forPay = false): string {
  const proofs = p.proofs.length
    ? `<div class="damgar-proofs">${p.proofs.map((x) => `<div class="p"><span>${x.kind === 'claim' ? 'Claim' : 'Receipt'} by ${whoOf(x.by)}</span><span class="k-small k-soft">${e(x.how)}</span>${verdict(x.rail)}<span class="k-small k-soft">rail: ${e(x.rail.why || 'the rail’s own evidence holds')}</span>${x.confirmations ? `<span class="k-small">${x.confirmations[0]} of ${x.confirmations[1]} confirmations</span>` : ''}</div><div class="p k-small">Beside it: ${verdict(x.beside)} ${e(x.beside.why)}${x.standing !== 'valid' ? ` · the act itself: ${e(x.standing)}` : ''}</div>`).join('')}</div>`
    : '';
  const pay =
    forPay && p.pay
      ? p.pay.invoice
        ? `<label>Pay this invoice in your wallet</label>${openInWallet(p.key, p.pay.invoice)}<div class="damgar-copy">${e(p.pay.invoice)}</div><button type="button" class="k-btn k-q k-small" data-action="copy" data-text="${e(p.pay.invoice)}">Copy the invoice</button>
<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once paid: the preimage (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Check it and sign my claim</button></div></form>`
        : `<label>Pay exactly ${e(p.pay.amount.said)} to this address, from your wallet</label><div class="damgar-copy">${e(p.pay.address ?? '')}</div><button type="button" class="k-btn k-q k-small" data-action="copy" data-text="${e(p.pay.address ?? '')}">Copy the address</button>
${p.stage === 'paid' ? `<div class="k-row"><button type="button" data-action="recheck" data-key="${e(p.key)}" class="k-btn k-p">Check the chain again</button></div>` : `<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once sent: the transaction’s id (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Check it and sign my claim</button></div></form>`}`
      : '';
  const vaultInvoice =
    forPay && p.vaultInvoice
      ? `<p class="k-small k-soft">Make an invoice on your vault’s node (${hashButton(p.vaultInvoice.node)}) for exactly ${e(p.amount.said)}, with this description hash and no description (on regtest, in the test wallet, on the vault’s node):</p><div class="damgar-copy">${e(p.vaultInvoice.descriptionHash)}</div>
<form class="vault-invoice" data-key="${e(p.key)}"><label>The invoice your vault’s node made</label><input name="invoice" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Check it</button></div></form>`
      : '';
  const ticket = p.ticket ? `<p class="k-small k-soft">An anchor’s ticket: batch ${p.ticket.batch}, tier ${p.ticket.tier}, on the chain by block ${p.ticket.deadline}.${p.ticket.checked ? '' : ' Not checked here: this Damgar follows no chain, so whether that block is within the tier’s reach of today’s is unknown. Pay only if you trust the service on it, or check it in Damgar on a computer.'}</p>` : '';
  return `<p>${e(p.amount.said)} · ${e(p.railName)}${p.to === 'vault' ? ', to the vault' : ''}</p>${p.whatFor ? `<p class="k-small k-soft">For “${e(p.whatFor)}”</p>` : ''}${ticket}${lines(p.lines)}${vaultInvoice}${pay}${proofs}`;
}

/** Paid and confirmed: settled, its receipt and a claim each valid by the rail's own evidence, and counting. */
/** A payment no rail answer here shows valid (S7e): unknown, with what each rail said, never shown as paid. */
export const unverifiedSaid = (p: PaymentShown): string =>
  `unknown: this payment is not verified here (${[...new Set(p.proofs.map((x) => `the rail says ${x.rail.answer}${x.rail.why ? `: ${x.rail.why}` : ''}`))].join('; ')})`;

export const confirmed = (p: PaymentShown): boolean =>
  p.stage === 'settled' && (['claim', 'receipt'] as const).every((k) => p.proofs.some((x) => x.kind === k && x.rail.answer === 'valid' && x.standing === 'valid'));

/** Paste an act to sign (the first way, by hand). */
export function pastePane(): string {
  return `<h2>Paste an act to sign</h2>
${say('The first way to pay: by hand.', ['Another app (Dub, from its pay chooser’s “By hand”) shows the payment to copy. Paste it here: Damgar reads it to you in plain words, and it waits in To pay, to be signed or declined there. Pasting signs nothing.'])}
<form id="paste"><label>The payment, as the other app showed it</label><textarea name="text" required spellcheck="false" autocomplete="off" placeholder="Paste it here"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Read it</button></div></form><div id="pasted"></div>`;
}

/** To the vault (H46, F355): one of its entries and an amount, read back first; transfers waiting. */
export function vaultPane(r: Rails | null, problem: string | null, waiting: string): string {
  if (problem) return `<h2>To the vault</h2>${note('error', e(problem))}`;
  const v = r?.vault;
  if (!v) return `<h2>To the vault</h2><p class="k-soft">Your identity’s chain declares no vault: every payment goes to your flow. A vault, and its limit per unit, is declared with the chain key, in Kišib (Paper, Change the vault).</p>`;
  return `<h2>To the vault</h2>
${say('From your wallet to your vault, one way only.', ['Damgar binds the payment, you pay it in your wallet (on regtest, the test wallet) and paste the proof back. It names the act that declared your vault, a transfer to yourself (the payment cMIP, draft 4). Withdrawing needs the chain key and stays in Kišib.'])}
<p class="k-small k-soft">Your vault: ${e(v.entries.map((x) => `${x.railName}, ${x.unit.said}: ${x.said}`).join('; '))}. Declared in your chain (act ${actId(v.declaredBy)}), with the chain key: changed only in Kišib.</p>
<form id="vault-transfer"><label>To</label><select name="entry">${v.entries.map((x, i) => `<option value="${i}">${e(x.railName)}, ${e(x.unit.said)}</option>`).join('')}</select>
<label>Amount (whole units)</label><input name="value" inputmode="numeric" autocomplete="off" required>
<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div></form><div id="vault-review"></div>${waiting}`;
}

/** A transfer to the vault, read back: the vault, the amount, the fee as far as Damgar can say, and what it costs. */
export function vaultReview(r: { digest: string; lines: Line[]; costs: Line[]; blocking: string[] }): string {
  return `<div class="k-box"><h3>Transfer to your vault, read back</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="damgar-costs"><h3>Before you send</h3>${lines(r.costs)}</div>` : ''}
${r.blocking.length ? note('error', lines(r.blocking.map((t) => ({ text: t, tone: 'warn' as const })))) : `<div class="k-row"><button type="button" class="k-btn k-p" data-action="vault transfer" data-digest="${e(r.digest)}">Bind it, then pay it here</button></div>`}`;
}

/** For a collective (round 3, F353): its Money area, a promise to pay, and the promises signed here with how they stand. `name`: the collective as shown, markup (its names, `whoOf`). */
export function collectivePane(c: { id: string; area: { name: string; holders: string[]; number: number; cap: { value: number } | null } | null; why: string | null; acts: { act: string; to: string; amount: { value: number }; whatFor: string; standing: { met: boolean; areas: { signers: string[]; needed: number; limits?: string | null }[] } | null }[] } | null, name: string): string {
  if (!c) return `<h2>For ${name}</h2><p class="k-soft">Damgar does not act for this collective: add it in the identity’s menu (A collective under it).</p>`;
  const area = c.area;
  // H96, H121: whom each promise pays by its names, its act by its short ID, each a button.
  const acts = c.acts.length
    ? `<ul class="damgar-lines">${c.acts
        .map((a) => {
          const st = a.standing;
          const keys = st?.areas[0];
          return `<li class="${st?.met ? 'ok' : 'warn'}">${e(a.amount.value.toLocaleString('en'))} to ${who({ id: a.to, inline: true })}${a.whatFor ? ` (${e(a.whatFor)})` : ''}: ${e(st ? (st.met ? 'counts for the collective' : 'does not count yet') : 'not read')}${keys ? e(`, ${keys.signers.length} of ${keys.needed} keys${keys.limits === 'above' ? ', above the cap' : ''}`) : ''} · ${actId(a.act)}</li>`;
        })
        .join('')}</ul>`
    : '<p class="k-small k-soft">No promise signed here yet.</p>';
  return `<h2>For ${name}</h2>
${say('Damgar acts for it with your own identity’s key, naming the collective.', ['A collective has no key of its own, and its members no member keys (Agreements rule 58). Within the area’s cap, your signature alone; above it, another holder’s signature too, as its constitution writes it.'])}
${area ? `<p class="k-small k-soft">Its Money area, “${e(area.name)}”: ${area.holders.length} holder${area.holders.length === 1 ? '' : 's'}, ${area.number} key${area.number === 1 ? '' : 's'}${area.cap ? `; above ${area.cap.value.toLocaleString('en')} an act, one more` : ''}.</p>` : ''}
${c.why ? note('error', e(c.why)) : `<form class="collective-promise" data-collective="${e(c.id)}"><h3>A promise to pay, from the collective</h3>
<label>To whom (an ID)</label><div class="k-row"><input name="to" type="text" class="k-grow" required autocomplete="off" spellcheck="false">${contactsButtonFor('to')}</div>
<label>How much (regtest satoshis)</label><input name="value" type="text" inputmode="numeric" required>
<label>What for</label><input name="whatFor" type="text">
<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div><div class="promise-read"></div></form>`}
<h3>Promises signed here</h3>${acts}`;
}

/** A promise read back, before it is signed. */
export function promiseRead(r: { lines: Line[]; digest: string }): string {
  return `${lines(r.lines)}<div class="k-row"><button type="button" class="k-btn k-p" data-action="collective-promise" data-digest="${e(r.digest)}">Sign it for the collective, with my own key</button></div>`;
}

// ---------------------------------------------------------------- the account

const amounts = (xs: Shown[]) => (xs.length ? xs.map((x) => e(x.said)).join('<br>') : '<span class="k-faint">none</span>');

/** Summary: per unit, never added across units; requests and debts; what it does not judge. */
export function summaryPane(a: Account): string {
  const asks = a.asks.length
    ? `<h3>Requests and debts</h3><div class="k-list">${a.asks.map((x) => `<div><span>${x.side === 'out' ? 'You asked' : 'Asked of you by'} ${whoOf(x.other)}: ${e(x.amount.said)}${x.whatFor ? `, for “${e(x.whatFor)}”` : ''}</span><span class="k-r">${e(x.state)}</span></div>`).join('')}</div>`
    : '';
  return `<h2>Summary</h2>
${say('Per unit, never summed across units. Each verified from the rail’s evidence.', a.notes)}
<div class="damgar-totals"><div class="k-box k-fill"><dl class="k-facts">${a.totals.map((t) => `<dt>${e(t.label)}</dt><dd>${amounts(t.amounts)}</dd>`).join('')}</dl></div></div>
${asks}${a.problems.length ? note('', lines(a.problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}`;
}

// ---------------------------------------------------------------- lanes

/** The cap in all of an app's lane, said: what it spent by the acts Damgar reads, what is left, any overspend. */
export function laneTotal(l: LaneShown): string {
  if (!l.total) return '';
  const over = l.over ? `<span class="damgar-over"> · overspent by ${e(l.over.said)}</span>` : '';
  // What is paid, apart from what is only asked (H107): an asked payment holds its amount against the cap, but nothing has moved yet.
  const parts = l.spent ? [l.paid && l.paid.value ? `${l.paid.said} paid` : null, l.asked && l.asked.value ? `${l.asked.said} asked, not paid yet` : null].filter(Boolean).join(', ') : '';
  return `<dt>In all</dt><dd>${e(l.total.said)}${l.spent ? ` · ${e(l.spent.said)} spent${parts ? ` (${e(parts)})` : ''}, ${e(l.left?.said ?? '')} left` : ' · not read yet'}${over}</dd>`;
}

/** One lane, as Lanes shows it. */
export function lane(l: LaneShown, actions = true): string {
  const until = l.until ? new Date(l.until * 1000).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : null;
  return `<div class="damgar-lane" data-lane="${e(l.grant)}"><h3>${e(l.label)} <span class="damgar-state">${e(l.state)}</span></h3>
<dl class="k-facts">${l.cap ? `<dt>At most</dt><dd>${e(l.cap.said)} per payment</dd>` : ''}${laneTotal(l)}${until ? `<dt>Until</dt><dd>${e(until)}, on the timestamp clock named</dd>` : ''}<dt>Its key</dt><dd>held by ${e(l.here ? 'this Damgar' : l.app)}</dd><dt>Signed under it</dt><dd>${l.acts.length} act${l.acts.length === 1 ? '' : 's'}${l.sealed ? `, ${l.sealed} sealed (their keys not delivered here: not counted)` : ''}</dd></dl>
${say('In plain words', l.words)}
${actions && l.state === 'in force' ? `<div data-revoke="${e(l.grant)}"><div class="k-row"><button type="button" class="k-btn" data-action="revoke lane review" data-grant="${e(l.grant)}">Revoke it</button></div></div>` : ''}</div>`;
}

/** A lane's revocation, read back with its cost before it is signed (F352). */
export function revokeReview(grant: string, said: Line[]): string {
  return `<div class="k-box">${lines(said)}<div class="k-row"><button type="button" class="k-btn k-p" data-action="revoke lane" data-grant="${e(grant)}">Sign the revocation</button></div></div>`;
}

export function laneReview(r: { digest: string; lines: Line[] }): string {
  return `<div class="k-box"><h3>The lane, read back</h3>${lines(r.lines)}<div class="k-row"><button type="button" class="k-btn k-p" data-action="own lane" data-digest="${e(r.digest)}">Sign this lane</button></div></div>`;
}

/** In force: each lane, then the clock its expiries are judged on (moved here from Settings, accepted). */
export function inForcePane(ls: LaneShown[], clock: string | null, manual: boolean, dubsar = false): string {
  return `<h2>In force</h2>
${say('What an app may sign and pay without asking you each time.', ['A lane lets an app (Dub, or Damgar itself) sign some of your money acts by itself, within a cap per act and until a date: a grant of your identity to itself, its key held by that app. Every act signed under one is shown so, here and to every reader. One revocation ends it.', '“In all”, a cap for the whole lane, is kept by the apps and counted here: Dub refuses to sign past it; verifiers judge only the cap per payment and the expiry, since a total needs every act of the lane, some of them private.'])}
${manual ? note('', 'Every step is followed by hand (Settings): the lanes Damgar holds sign nothing until you turn it off. Lanes other apps hold still sign there.') : ''}
${ls.map((l) => lane(l)).join('') || '<p class="k-empty">No lane in force. An app asks for one (in Dub: the identity’s menu, “A lane from Damgar”), and it waits in Asked.</p>'}
<h3>The clock for lanes</h3><p class="k-small k-soft">A lane’s expiry is judged on a timestamp clock you name (the grant limits cMIP, 3.1): until it stamps an act, whether it came before the expiry is unknown.${dubsar ? ' Prefilled with the Dubsar clock, the one every app of the suite relies on; a lane’s grant names the clock, so its words say which.' : ''}</p>
<form id="clock" class="k-row"><input name="clock" class="k-grow" placeholder="its ID" value="${e(clock ?? '')}" spellcheck="false">${contactsButtonFor('clock')}<button type="submit" class="k-btn">Save the clock</button></form>`;
}

/** Damgar's own lanes: receipts and invoices, referral shares; and the node link (moved here from Settings, accepted). */
export function ownPane(ls: LaneShown[], units: { hash: string; label: string }[], l: { link: boolean; linkSay: string[] }, web: boolean): string {
  const unitOptions = units.map((u) => `<option value="${e(u.hash)}"${/regtest/.test(u.label) ? ' selected' : ''}>${e(u.label)}</option>`).join('');
  const own = (role: string, title: string, sayIt: string) => `<form class="own-lane" data-role="${role}"><h3>${title}</h3><p class="k-small k-soft">${sayIt}</p>
<div class="k-row"><label class="k-grow">At most, per act <input name="cap" inputmode="numeric" required></label><label>Unit <select name="unit">${unitOptions}</select></label></div>
<label>Until (optional; judged on the clock for lanes, In force)</label><input name="until" type="datetime-local">
<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div></form>`;
  return `<h2>Damgar’s own</h2>
${say('With these, a payment to you needs nothing from you.', ['Damgar answers and signs the receipt by itself, below the cap. Without them, everything waits in Waiting.'])}
${ls.map((x) => lane(x)).join('')}
${own('receipts', 'Receipts and invoices, by itself', 'Damgar checks a payment to you from the rail’s own evidence and signs the receipt; it answers an invoice request with an address, or with an invoice your node made through its receive-only link (below).')}
${own('payouts', 'Referral shares, by itself', 'When someone buys your work through a repost and your offer promises the reposter a share, Damgar asks for that payment by itself; you still pay it in your wallet, from Waiting.')}
<div id="lane-review"></div>
<h3>The node link (receive-only)</h3>${lines(l.linkSay.map((text) => ({ text })))}
${web ? note('', 'The web client never makes a link to a node: use Damgar on your computer.') : l.link ? `<p>A receive-only link is kept.</p><div class="k-row"><button type="button" class="k-btn" data-action="link remove">Remove it</button></div>` : `<form id="link"><label>Your node’s REST address</label><input name="rest" placeholder="https://127.0.0.1:8080" spellcheck="false" required>
<label>The receive-only permission’s file (on lnd, the macaroon baked with invoices:write and invoices:read)</label><input name="macaroonFile" spellcheck="false" required>
<label>The node’s certificate file (tls.cert)</label><input name="certFile" spellcheck="false" required>
<div class="k-row"><button type="submit" class="k-btn">Check it and keep it</button></div></form>`}`;
}

// ---------------------------------------------------------------- settings

/**
 * H92 (his words: "First the user selects the rail, that changes the content
 * of the setup page depending on rail"): each rail Module's own fields for
 * the payee pointer, by its key. A rail Module to come adds its fields here,
 * not a new page; its name and what it does come from its own entry
 * (`../specs.ts`), its costs from its read-back.
 */
export const RAIL_FIELDS: Record<string, { fields: (v: Record<string, string>) => string; network: boolean }> = {
  lightning: {
    fields: (v) => `<label>Your wallet’s node key (66 hexadecimal characters; the test wallet shows it)</label><input name="lightning" autocomplete="off" spellcheck="false" value="${e(v.lightning ?? '')}">`,
    network: true,
  },
  onchain: {
    fields: (v) =>
      `<label>A Bitcoin key of your wallet, x-only (64 hexadecimal characters)</label><input name="onchain" autocomplete="off" spellcheck="false" value="${e(v.onchain ?? '')}"><label class="damgar-check"><input type="checkbox" name="newRequestKey"${v.newRequestKey === 'on' ? ' checked' : ''}> Make a new on-chain request key (the old one then no longer counts for new payments)</label>`,
    network: true,
  },
};

/** The rail Modules this identity accepts that Damgar can put in a pointer: what + Add a rail offers. */
export const railsAccepted = (accept: Accept[]) => accept.filter((a) => a.kind === 'Module' && a.accepted && RAIL_FIELDS[a.key]);

/** The new pointer's form (H92): one card per rail chosen, each removable, its own fields; + Add a rail from those accepted. */
export function railsForm(accept: Accept[], chosen: string[], values: Record<string, string>): string {
  const can = railsAccepted(accept);
  if (!can.length) return `<p class="k-soft">You accept no rail Module yet: accept one in Settings, Rules I follow (the Lightning rail, the on-chain rail), then choose it here.</p>`;
  const cards = chosen
    .map((k) => can.find((a) => a.key === k))
    .filter((a): a is Accept => !!a)
    .map((a, n) => `<div class="k-box damgar-rail" data-rail-card="${e(a.key)}"><div class="k-row"><h4 class="k-grow">${n + 1}. ${e(a.name)}</h4><button type="button" class="k-btn k-q k-small" data-action="rail-remove" data-rail="${e(a.key)}">Remove</button></div><p class="k-small k-soft">${e(a.does)}</p>${RAIL_FIELDS[a.key].fields(values)}</div>`)
    .join('');
  const left = can.filter((a) => !chosen.includes(a.key));
  const add = left.length
    ? `<div class="k-row damgar-rail-add"><select name="rail-add" aria-label="A rail to add">${left.map((a) => `<option value="${e(a.key)}">${e(a.name)}</option>`).join('')}</select><button type="button" class="k-btn" data-action="rail-add">${chosen.length ? '+ Add a rail' : 'Choose this rail'}</button></div>`
    : '';
  const network = chosen.some((k) => RAIL_FIELDS[k]?.network) ? `<label>Network</label><select name="network"><option value="3"${values.network !== '2' ? ' selected' : ''}>regtest</option><option value="2"${values.network === '2' ? ' selected' : ''}>signet</option></select>` : '';
  return `<form id="rails">${chosen.length ? '' : '<p class="k-small k-soft">First choose a rail: the page then asks only what that rail needs.</p>'}${cards}${add}${network}${chosen.length ? '<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div>' : ''}</form>`;
}

export function paidPane(r: Rails | null, problem: string | null, accept: Accept[] = [], chosen: string[] = [], values: Record<string, string> = {}): string {
  const pointer = r?.pointer
    ? `<div class="k-box k-fill"><dl class="k-facts"><dt>In force</dt><dd>version ${r.pointer.version}${r.pointer.forked ? ' (its chain is forked: the last pointer before the fork counts)' : ''} · ${actId(r.pointer.act)}</dd>${r.pointer.rails.map((x, n) => `<dt>${n + 1}. ${e(x.name)}</dt><dd class="k-mono">${e(x.said)}${x.accepted ? '' : ' (a rail Module you do not accept)'}</dd>`).join('')}</dl></div>`
    : '<p class="k-soft">You have no payee pointer yet: nobody can pay you until you say where.</p>';
  const vault = r?.vault
    ? `${lines(r.vault.entries.map((x) => ({ text: `${x.unit.said}, on ${x.railName}: ${x.said}.` })))}<p class="k-small k-soft">Declared in your identity’s chain (act ${actId(r.vault.declaredBy)}), with the chain key: changed only in Kišib, in a change of keys, never here. Move money into it from Waiting, To the vault.</p>`
    : '<p class="k-small k-soft">None declared: every payment goes to your flow. A vault, and its limit per unit, is declared with the chain key, in Kišib.</p>';
  return `<h2>Where you are paid</h2>
${say('Your payee pointer: where payments to you go, with each rail’s costs.', ['Read back with each rail’s stated costs before it is signed. A new pointer replaces the one in force for new payments.'])}
${problem ? note('error', e(problem)) : pointer}
${fold('Change it', `<div id="rails-at">${railsForm(accept, chosen, values)}</div><div id="rails-review"></div>`, { attrs: 'id="rails-fold"', open: !!values.open })}
${r?.requestKey ? `<p class="k-small k-soft">The on-chain request key Damgar holds: ${hashButton(r.requestKey)}</p>` : ''}
<div class="k-box"><h3>The vault</h3>${vault}</div>`;
}

export function railsReview(r: { digest: string; lines: Line[]; costs: Line[] }): string {
  return `<div class="k-box"><h3>Your new payee pointer</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="damgar-costs"><h3>What each rail costs you, stated by its Module</h3>${lines(r.costs)}</div>` : ''}
<div class="k-row"><button type="button" class="k-btn k-p" data-action="rails publish" data-digest="${e(r.digest)}">Sign and publish it</button></div>`;
}

export function acceptPane(s: State): string {
  return `<h2>Rules I follow</h2>
${say(`Sealed to your identity at its homes${s.list.version ? ` (version ${s.list.version})` : ''}: every app holding it reads it.`, ['Each app changes only its part; Damgar the Money layer’s. An act under something you do not accept is shown unknown, and never signed.'])}
${s.list.merged.length ? note('', `Two apps changed it at once; merged: ${lines(s.list.merged.map((t) => ({ text: t })))}`) : ''}
${s.list.here ? note('', 'Kept in Damgar only: the rules ticked below are not sealed to this identity yet, so the other apps do not see them. Save them again once they can be sealed.') : ''}
<form id="accept">${acceptList(s.accept)}<div class="k-row"><button type="submit" class="k-btn k-p">Save to my list</button><button type="submit" class="k-btn" data-in="here">In Damgar only</button></div><p class="k-small k-soft">Save to my list: sealed to this identity, every app reads it. In Damgar only: kept here, your list unchanged, so the other apps still ask; a rule already on your list stays on it.</p></form>
<div class="k-row"><span class="k-grow k-small k-soft">${s.list.published ? 'Published: anyone can read which specifications you accept.' : 'Private: sealed to yourself (the default).'}</span><button type="button" class="k-btn" data-action="publish list" data-on="${s.list.published ? 'false' : 'true'}">${s.list.published ? 'Make it private again' : 'Publish it'}</button></div>`;
}

export function relaysPane(s: State, chain: string): string {
  const i = s.identity!;
  return `<h2>Homes and relays</h2><dl class="k-facts"><dt>Homes</dt><dd>${e(i.homes.join(', '))} (its chain names them; changed in Kišib)</dd><dt>The chain followed</dt><dd>${e(chain)}</dd></dl>
<form id="relays"><label>Relays its money acts go to, one per line</label><textarea name="relays">${e(i.relays.join('\n'))}</textarea><div class="k-row"><button type="submit" class="k-btn">Save the relays</button></div></form>`;
}

export function manualPane(on: boolean): string {
  return `<h2>Every step by hand</h2><p class="k-soft">For those who want to follow the real process step by step: every signature waits for you, as in round 1. Off by default.</p>
<label class="damgar-check"><input type="checkbox" id="manual"${on ? ' checked' : ''}> Follow every step by hand (a clear demonstration of the real process)</label>`;
}

// ---------------------------------------------------------------- the act menu: Rely on it, Anchor it (decided: "Agreed")

/** An act a card stands for, as the chooser says it: its receipts first, then its claims, then the request that began it. */
export interface CardAct {
  id: string;
  said: string;
}

const actChoice = (acts: CardAct[]) =>
  acts.length > 1
    ? `<div class="damgar-ways">${acts.map((x, i) => `<label class="k-row"><input type="radio" name="act" value="${e(x.id)}"${i === 0 ? ' checked' : ''}> <span>${e(x.said)} ${actId(x.id)}</span></label>`).join('')}</div>`
    : `<input type="hidden" name="act" value="${e(acts[0].id)}"><p class="k-small"><b>${e(acts[0].said)}</b> ${actId(acts[0].id)}</p>`;

const noAct = '<p class="k-soft">This card is not yet an act on MOR (a draft waiting to be signed here): there is nothing to rely on or anchor.</p>';

/** Rely on an act: which one (a receipt first), then RELY typed (Identity type 15, a witness act). */
export function relyForm(acts: CardAct[]): string {
  if (!acts.length) return noAct;
  return `<form id="rely">${say('Relying on an act keeps it visible as disputed should its author ever disown it.', ['A witness act (Identity type 15), public at your homes and relays, naming the act: it relies on it, it pays nothing. Signed with your key, checked first; through Kišib’s panel where Kišib holds this identity.'])}${actChoice(acts)}<label>Type RELY to sign the witness act</label><input name="typed" autocomplete="off" autocapitalize="characters" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Sign the witness act</button></div></form>`;
}

/** Anchor an act: which one, the service named and its offer read, a tier chosen; then prepared and signed here, in one step. */
export function anchorForm(acts: CardAct[], offers: { act: string; unit: string; tiers: { tier: number; words: string }[]; words: string | null }[] | null, service = '', chosen = ''): string {
  if (!acts.length) return noAct;
  const which = chosen ? acts.filter((x) => x.id === chosen) : acts;
  return `<form id="anchor-offers">${say('An anchor puts this act’s fingerprint on the Bitcoin chain, through a pooled anchoring service, paid here.', ['Anyone may anchor any act (the anchoring cMIP). The service is sent a leaf (the act’s fingerprint mixed with a random secret Damgar keeps), never the act. Damgar signs the payment’s request at once; you pay the invoice in To pay; it shows in Account › Anchors. Round 1 runs on regtest: its coins are worth nothing.'])}${actChoice(which.length ? which : acts)}
<label>The anchoring service’s ID</label><div class="k-row"><input name="service" value="${e(service)}" required spellcheck="false" autocomplete="off" class="k-grow">${contactsButtonFor('service')}<button type="submit" class="k-btn">Read its offer</button></div></form>${
    offers === null
      ? ''
      : offers.length
        ? `<form id="anchor" data-service="${e(service)}" data-act="${e(chosen)}"><div class="damgar-ways">${offers.flatMap((o) => o.tiers.map((t, i) => `<label class="k-row"><input type="radio" name="tier" value="${e(o.act)}:${t.tier}"${i === 0 ? ' checked' : ''}> <span>${e(t.words)}${o.words ? ` <span class="k-small k-soft">${e(o.words)}</span>` : ''}</span></label>`)).join('')}</div><div class="k-row"><button type="submit" class="k-btn k-p">Anchor it: sign the payment’s request</button></div></form>`
        : '<p class="k-small k-soft">No standing offer of that service was found.</p>'
  }`;
}
