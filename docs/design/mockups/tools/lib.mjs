// The Dubsar Suite redesign: writes every mockup page (static HTML, pictures only, no app code).
// Helpers for the mockups; build.mjs runs them.
// Invented test data only: the walkthrough's cast (Max, Pa, Ph, T, Machine, allegedly) and "Collective Y".
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PAGES = [];

// ---------------------------------------------------------------- cast and helpers
const ID = {
  Max: 'mid1qx7…m4k', Pa: 'mid1p9e…2wf', Ph: 'mid1h3r…8tc', T: 'mid1t6v…q0z',
  Machine: 'mid1m5a…j7n', Y: 'mid1y2c…v9s', Pa2: 'mid1p4u…c3d', Z: 'mid1z8k…f2e',
};
const APPS = {
  kishib: { name: 'Kišib', tiles: ['Identities', 'Runner', 'Paper', 'Collectives'] },
  dub: { name: 'Dub' },
  damgar: { name: 'Damgar', tiles: ['Waiting', 'Account', 'Lanes', 'Settings'] },
  edubba: { name: 'Edubba', tiles: ['Agents', 'Collectives', 'Publishing', 'Vows'] },
  ummia: { name: 'Ummia', tiles: ['Look', 'Discuss', 'Publish', 'Choose'] },
};

/** The quiet tag on anything not decided (the note's "lead's, not discussed", or a choice made here where the note is silent). */
const nd = (why = '') => `<span class="nd">not decided${why ? `<b>· ${why}</b>` : ''}</span>`;
const dm = (l) => `<span class="dm l${l}" title="danger ${l} of 3"><i></i><i></i><i></i></span>`;
const help = '<span class="help">?</span>';

const SVG = (d) => `<svg class="ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  identities: SVG('<circle cx="24" cy="17" r="8"/><path d="M9 41c2-9 8-13 15-13s13 4 15 13"/>'),
  runner: SVG('<rect x="7" y="13" width="20" height="22" rx="4"/><path d="M27 20h6a6 6 0 0 1 0 12h-6M33 26h8M14 22h6M14 27h6"/>'),
  paper: SVG('<path d="M13 6h16l8 8v28H13z"/><path d="M29 6v8h8M18 22h14M18 28h14M18 34h9"/>'),
  collectives: SVG('<circle cx="16" cy="18" r="5.5"/><circle cx="32" cy="18" r="5.5"/><circle cx="24" cy="12" r="5"/><path d="M6 38c1-7 5-10 10-10s7 2 8 5c1-3 3-5 8-5s9 3 10 10"/>'),
  waiting: SVG('<path d="M14 6h20M14 42h20M16 6c0 10 16 12 16 18S16 32 16 42M32 6c0 10-16 12-16 18s16 8 16 18"/>'),
  account: SVG('<rect x="8" y="9" width="32" height="30" rx="4"/><path d="M8 17h32M15 25h8M15 31h12M31 25h3M31 31h3"/>'),
  lanes: SVG('<path d="M14 42 19 6M34 42 29 6M24 10v4M24 21v5M24 33v6"/>'),
  settings: SVG('<path d="M10 14h28M10 24h28M10 34h28"/><circle cx="18" cy="14" r="3.5" fill="#06080c"/><circle cx="31" cy="24" r="3.5" fill="#06080c"/><circle cx="22" cy="34" r="3.5" fill="#06080c"/>'),
  agents: SVG('<rect x="10" y="12" width="28" height="24" rx="7"/><circle cx="19" cy="24" r="2.4"/><circle cx="29" cy="24" r="2.4"/><path d="M24 6v6M6 22v6M42 22v6"/>'),
  publishing: SVG('<path d="M8 30v8h32v-8M24 30V8M15 17l9-9 9 9"/>'),
  vows: SVG('<circle cx="24" cy="22" r="12"/><path d="M18 22l4 4 8-8M17 33l-3 9 10-5 10 5-3-9"/>'),
  look: SVG('<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/>'),
  discuss: SVG('<path d="M6 10h24v16H16l-6 6v-6H6z"/><path d="M34 18h8v16h-4v6l-6-6H22v-4"/>'),
  publish: SVG('<path d="M10 40h28M24 32V8M15 17l9-9 9 9"/>'),
  choose: SVG('<path d="M8 12l3 3 6-6M8 24l3 3 6-6M8 36l3 3 6-6M22 12h18M22 24h18M22 36h18"/>'),
};

function page(app, slug, title, html, { before = [], group = '', note = '' } = {}) {
  PAGES.push({ app, slug, title, before, group, note, file: `${app}-${slug}.html` });
  const doc = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APPS[app]?.name ?? 'Suite'}: ${title} (mockup)</title><link rel="stylesheet" href="suite.css"></head>
<body class="${app}"><div class="win">
${html}
</div></body></html>
`;
  writeFileSync(join(OUT, `${app}-${slug}.html`), doc);
}

// ---------------------------------------------------------------- the frame of every app
function me(who = 'Max', opts = {}) {
  const coll = opts.as ? `<span class="dot c" style="width:22px;height:22px">Y</span>` : '';
  return `<button class="me${opts.open ? ' open' : ''}"><span class="n">${opts.as ?? who}</span><span class="s">${opts.as ? ID.Y : ID[who]}</span>${coll}<span class="dot${opts.as ? ' alt' : ''}">${who[0]}</span></button>`;
}
function bar(app, { on = null, center = '', left = '', right = null } = {}) {
  const a = APPS[app];
  const tabs = a.tiles && on ? `<nav class="tabs">${a.tiles.map((t) => `<span class="tab${t === on ? ' on' : ''}">${t}</span>`).join('')}</nav>` : '';
  const mark = left || `<div class="app"><img src="icons/${app}.png" alt=""><span class="nm">${a.name}</span></div>`;
  const phone = a.tiles && on ? `<nav class="phonetabs">${a.tiles.map((t) => `<span class="tab${t === on ? ' on' : ''}">${t}</span>`).join('')}</nav>` : '';
  return `<header class="top">${mark}${tabs}<span class="grow"></span>${center}<span class="grow"></span>${right ?? me()}</header>${phone}`;
}
const column = (groups) => `<aside class="col">${groups.map((g) => (g === '-' ? '<div class="sep"></div>' : typeof g === 'string' ? `<h3>${g}</h3>` : `<a class="${g.on ? 'on ' : ''}${g.add ? 'add' : ''}">${g.t}${g.k != null ? `<span class="k">${g.k}</span>` : ''}</a>`)).join('')}<div class="coltag">${nd('the column’s parts')}</div></aside>`;
const opened = (app, on, col, pane, extra = '') => `${bar(app, { on })}<div class="body">${column(col)}<section class="pane">${pane}</section></div>${extra}`;

// ---------------------------------------------------------------- the act card, the same in every app
function act(o) {
  const signer = `<button class="signer${o.open === 'signer' ? ' open' : ''}"><span class="sid">${ID[o.who] ?? o.who}</span><span class="nm">${o.name ?? o.who}</span>${o.of ? `<span class="of">of ${o.of}</span>` : ''}</button>`;
  const re = o.re ? `<div class="re">↳ answers ${o.re}</div>` : '';
  const kind = o.kind ? `<span class="kind">${o.kind}</span>` : '';
  const body = `<div class="txt">${kind}${o.text}</div>${o.pic ? '<div class="pic"></div>' : ''}${o.doc ? `<span class="doc">${o.doc}</span>` : ''}${o.extra ?? ''}`;
  const foot = `<div class="foot">${o.v === false ? '' : `<span class="v" title="verified">✓</span>`}${o.flag ?? ''}${o.alarm ? `<span class="alarmline">${o.alarm}</span>` : ''}<button class="actid${o.open === 'act' ? ' open' : ''}">${o.aid}</button></div>`;
  return `<article class="act${o.sel ? ' sel' : ''}"><span class="when">${o.when ?? ''}</span>${signer}${re}${body}${foot}${o.menu ?? ''}</article>`;
}
const feed = (cards, cls = '') => `<div class="feed ${cls}">${cards.join('')}</div>`;

// What you take above a line, what you do below. The top half is the same in every app; the bottom half is the app's own.
function signerMenu(app, who = 'Pa', style = 'top:36px;left:0') {
  const below = {
    dub: ['Follow: add to contacts', 'Message', 'Mute'],
    damgar: ['Follow: add to contacts', `Tip ${who} ${nd('in Damgar')}`, 'Mute'],
    ummia: ['Follow: add to contacts', `Follow ${who}’s releases`, 'Mute'],
    edubba: ['Follow: add to contacts', 'Message', 'Mute'],
  }[app];
  return `<div class="pop" style="${style}"><div class="t">${who} · ${ID[who]}</div><a>Copy ID</a><a>Copy ID link</a><a>Open profile</a><hr>${below.map((b) => `<a>${b}</a>`).join('')}</div>`;
}
function actMenu(app, { own = false, style = 'bottom:30px;right:0', aid } = {}) {
  const top = `<div class="t">${aid}</div><a>Copy act ID</a><a>Open what it answers</a><a>Why it’s valid</a><hr>`;
  const common = ['Rely on it', 'Anchor it'];
  const below = {
    dub: ['Reply', 'Repost', ...common, own ? 'Correct it' : null, 'Tip', `Buy ${nd('lead’s')}`],
    damgar: [...common, own ? 'Correct it' : null, 'Tip', `Show it in the account ${nd('choice')}`],
    ummia: [`Add to accepted list`, `Discuss it ${nd('choice')}`, ...common, own ? 'Correct it' : null],
    edubba: [...common, own ? 'Correct it' : null, 'Confirm: it was kept', 'Contest it'],
  }[app].filter(Boolean);
  return `<div class="pop" style="${style}">${top}<div class="own">${APPS[app].name}’s own</div>${below.map((b) => `<a>${b}</a>`).join('')}</div>`;
}

const typing = (ph, { typed = false, tools = '', opts = '', btn = 'Post', stack = false } = {}) =>
  stack
    ? `<div class="typing stack">${opts ? `<div class="opts">${opts}</div>` : ''}<div class="line"><div class="ta${typed ? ' typed' : ''}">${ph}</div><div class="tools">${tools}<span class="btn p">${btn}</span></div></div></div>`
    : `<div class="typing"><div class="ta${typed ? ' typed' : ''}">${ph}</div><div class="tools">${tools}<span class="btn p">${btn}</span></div></div>`;

// ---------------------------------------------------------------- homes: four tiles
function home(app, tiles, foot = '') {
  const t = tiles.map((x) => `<div class="tile d${x.d}${x.alarm ? ' alarm' : ''}">${ICON[x.icon]}${dm(x.d)}<h2>${x.name}</h2><p>${x.say}</p>${x.alert ? `<span class="alert">${x.alert}</span>` : ''}</div>`).join('');
  return `${bar(app)}<div class="home">${t}</div><div class="home-note">${foot}</div>`;
}
const TESTLINE = `Test identities only, until MOR is frozen ${help} ${nd('one line with “?”')}`;

export { ID, APPS, nd, dm, help, ICON, page, me, bar, column, opened, act, feed, signerMenu, actMenu, typing, home, TESTLINE };

