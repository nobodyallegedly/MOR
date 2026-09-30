// Build the management page into relay/manage/, where the relay program
// embeds it and serves it at /manage/ (relay/src/manage.rs): the page, its
// script and its stylesheet. The script is not minified, so an operator can
// read what their browser runs. `--out DIR` builds elsewhere (the tests
// build a second copy and compare it with the committed one).

import { build } from 'esbuild';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { STYLE } from '../src/view.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const i = process.argv.indexOf('--out');
const out = i >= 0 ? process.argv[i + 1] : here('../../relay/manage');

mkdirSync(out, { recursive: true });
await build({
  entryPoints: [here('src/app.ts')],
  outfile: `${out}/manage.js`,
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/manage.css`, STYLE + '\n');
copyFileSync(here('static/index.html'), `${out}/index.html`);
console.log(`built ${out}`);
