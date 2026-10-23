// Build Nakišib's page into built/, which its program carries inside
// itself (src/main.rs, include_bytes!): the page, its script (Nakišib's page
// code and the kit, bundled, not minified, so anyone can read what runs),
// its stylesheet, Inter and its licence, and its icon. Run it after changing
// src/page/ or the kit, then build the program again:
//
//   npm run build        (then: cargo build --release)
//
// Reproducible: the same sources and esbuild give the same bytes, in any
// folder (test/build.test.ts). Nakišib has no web client, and must never
// have one: built/ is served by its own program on 127.0.0.1 only.

import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { STYLE } from '../src/page/view.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const at = process.argv.indexOf('--out');
const out = at >= 0 ? resolve(process.argv[at + 1]) : here('built');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
await build({
  entryPoints: [here('src/page/app.ts')],
  outfile: `${out}/nakisib.js`,
  absWorkingDir: here(''),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/nakisib.css`, `${STYLE}\n`);
copyFileSync(here('static/index.html'), `${out}/index.html`);
for (const f of Object.keys(FONT_FILES)) copyFileSync(here(`../dub/${FONTS_DIR}/${f}`), `${out}/${f}`);
copyFileSync(here('static/icon/nakisib.png'), `${out}/icon.png`);
// The page asks nothing of the network: no address but its own in what is built.
for (const f of ['nakisib.js', 'nakisib.css', 'index.html']) {
  const t = readFileSync(`${out}/${f}`, 'utf8');
  if (/\bhttps?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(t)) throw new Error(`${f} names an address: Nakišib's page loads from its own origin only`);
}
