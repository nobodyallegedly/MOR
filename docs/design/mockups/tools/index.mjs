// Writes docs/design/mockups/index.html: every screenshot by app, today's beside the new where both exist.
// Run from the repository root, after build.mjs and shoot.mjs: node docs/design/mockups/tools/index.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = JSON.parse(readFileSync(join(root, 'pages.json'), 'utf8'));
const NAMES = { kishib: 'Kišib', dub: 'Dub', damgar: 'Damgar', edubba: 'Edubba', ummia: 'Ummia', suite: 'Every app' };
const COLOUR = { kishib: '#cfe5f7', dub: '#efe8dc', damgar: '#f2d89c', edubba: '#a9e3c7', ummia: '#f7c4b7', suite: '#d6dae1' };
const FIRST = ['dub-home', 'dub-act-menu', 'ummia-act-menu', 'kishib-home', 'dub-runner', 'kishib-paper-chain-words', 'dub-private', 'edubba-diary'];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const shot = (p, size) => `shots/after/${p.file.replace('.html', '')}-${size}.png`;
const used = new Set(pages.flatMap((p) => p.before));

const card = (p) => `<article class="m" id="${p.file.replace('.html', '')}"><header><h3>${esc(p.title)}</h3>${p.note ? `<span class="note">${esc(p.note)}</span>` : ''}<a href="${p.file}">open the page</a></header>
<div class="pair"><div class="new"><span class="lbl">new · Mac 1280×800</span><a href="${shot(p, 'mac')}"><img loading="lazy" src="${shot(p, 'mac')}" alt="${esc(p.title)}, Mac"></a></div>
<div class="phone"><span class="lbl">new · phone 390×844</span><a href="${shot(p, 'phone')}"><img loading="lazy" src="${shot(p, 'phone')}" alt="${esc(p.title)}, phone"></a></div>
${p.before.length ? `<div class="before"><span class="lbl">today</span>${p.before.map((b) => `<a href="shots/before/${b}"><img loading="lazy" src="shots/before/${b}" alt="today: ${b}"><span>${b}</span></a>`).join('')}</div>` : '<div class="before none"><span class="lbl">today</span><p>No screen of today: new in the redesign.</p></div>'}</div></article>`;

let body = `<h1>The Dubsar Suite, redesigned: mockups for approval</h1>
<p class="lede">Pictures only, drawn from <code>docs/design/suite-redesign.md</code>. Invented test data (Max, Pa, Ph, T, Machine, allegedly; Collective Y). A dashed <span class="nd">not decided</span> tag marks what the design note leaves open or what was chosen here; the report (<code>docs/design/mockups-report.md</code>) lists each one.</p>
<h2>Look at these first</h2><div class="first">${FIRST.map((f) => pages.find((p) => p.file === `${f}.html`)).map((p) => `<a href="#${p.file.replace('.html', '')}"><img src="${shot(p, 'mac')}" alt=""><span>${NAMES[p.app]}: ${esc(p.title)}</span></a>`).join('')}</div>
<nav>${Object.keys(NAMES).map((a) => `<a href="#app-${a}" style="--c:${COLOUR[a]}">${NAMES[a]}</a>`).join('')}<a href="#today">Today, every screen</a></nav>`;
for (const app of Object.keys(NAMES)) {
  const ps = pages.filter((p) => p.app === app);
  body += `<section id="app-${app}" style="--c:${COLOUR[app]}"><h2>${NAMES[app]}</h2>${ps.map(card).join('')}</section>`;
}
body += `<section id="today"><h2>Today, every screen</h2><p class="lede">Captured from each app's own browser walkthrough (<code>test/*browser*.test.ts</code>, <code>MOR_SCREENSHOTS</code>) on local test homes and relays, test identities only; long pages shown whole. Grouped by the folder of the test that took them (Damgar's test also visits Dub, Edubba and Kišib). Those not already beside a new screen are marked “·”.</p>`;
for (const dir of readdirSync(join(root, 'shots/before')).sort()) {
  const files = readdirSync(join(root, 'shots/before', dir)).sort();
  body += `<h3>${NAMES[dir] ?? dir} (${files.length})</h3><div class="grid">${files.map((f) => `<a href="shots/before/${dir}/${f}"><img loading="lazy" src="shots/before/${dir}/${f}" alt=""><span>${used.has(`${dir}/${f}`) ? '' : '· '}${f}</span></a>`).join('')}</div>`;
}
writeFileSync(join(root, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Suite redesign mockups</title>
<style>@font-face{font-family:Inter;font-weight:300;src:url(fonts/inter_light.woff2) format("woff2")}@font-face{font-family:Inter;font-weight:400;src:url(fonts/inter_regular.woff2) format("woff2")}
:root{color-scheme:dark}body{margin:0;background:#06080c;color:#d6dae1;font:300 15px/1.5 Inter,system-ui,sans-serif;padding:24px 28px 80px}
h1{font-weight:300;font-size:28px;margin:0 0 6px}h2{font-weight:300;font-size:22px;margin:34px 0 12px;color:var(--c,#d6dae1)}h3{font-weight:400;font-size:15px;margin:0}
code{font:13px ui-monospace,Menlo,monospace;color:#9aa8b8}.lede{color:#8a919d;max-width:60em}a{color:inherit}
.nd{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a8f6a;border:1px dashed #5a5340;border-radius:5px;padding:1px 6px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0;position:sticky;top:0;background:#06080c;padding:10px 0;z-index:2;border-bottom:1px solid #232a35}
nav a{text-decoration:none;border:1px solid #323a47;border-radius:999px;padding:4px 14px;color:var(--c,#d6dae1)}
.first{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}.first a{text-decoration:none;font-size:13px;color:#8a919d}.first img{width:100%;border:1px solid #232a35;border-radius:10px;display:block;margin-bottom:4px}
.m{border-top:1px solid #232a35;padding:16px 0 20px}.m header{display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;margin-bottom:10px}.m header a{font-size:13px;color:#8a919d}
.note{font-size:12px;color:var(--c);border:1px solid #323a47;border-radius:999px;padding:0 9px}
.pair{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}.lbl{display:block;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:#4f5663;margin-bottom:4px}
.pair img{display:block;border:1px solid #232a35;border-radius:8px}.new img{width:560px;max-width:100%}.phone img{width:150px}
.before{flex:1;min-width:220px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start}.before .lbl{width:100%}.before a{text-decoration:none;font-size:11px;color:#4f5663;width:170px}.before img{width:170px;max-height:300px;object-fit:cover;object-position:top}.before.none p{color:#4f5663;font-size:13px;margin:0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:20px}.grid a{text-decoration:none;font-size:11px;color:#4f5663;overflow-wrap:anywhere}.grid img{width:100%;height:220px;object-fit:cover;object-position:top;border:1px solid #232a35;border-radius:8px;display:block}
@media(max-width:600px){body{padding:16px}.new img{width:100%}}</style></head><body>${body}</body></html>
`);
console.log('index written');
