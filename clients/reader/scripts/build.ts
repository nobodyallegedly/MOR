// Build the web reader into dist/: the page, its script (the shared client
// code, bundled with the browser's core library in place of the Node one),
// its stylesheet, and the core library's WebAssembly. The script is not
// minified, so anyone can read what their browser runs.
//
// The settings (reader.json) are not built in: whoever deploys the reader
// writes them beside these files (see README).

import { build, type Plugin } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE } from '../src/view.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const out = here('dist');

/** The shared client code imports the genesis client's core; in a browser, it gets this one. */
const browserCore: Plugin = {
  name: 'browser-core',
  setup(b) {
    const nodeCore = here('../genesis/src/core.ts');
    b.onResolve({ filter: /core\.ts$/ }, (a) =>
      resolve(dirname(a.importer), a.path) === nodeCore ? { path: here('src/web/core.ts') } : undefined,
    );
    b.onResolve({ filter: /^node:/ }, (a) => ({ errors: [{ text: `${a.path} in the browser bundle, from ${a.importer}` }] }));
  },
};

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
await build({
  entryPoints: [here('src/app.ts')],
  outfile: `${out}/reader.js`,
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  plugins: [browserCore],
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/reader.css`, STYLE + '\n');
copyFileSync(here('static/index.html'), `${out}/index.html`);
copyFileSync(here('../genesis/wasm/mor_wasm_bg.wasm'), `${out}/mor_wasm_bg.wasm`);
console.log(`built ${out}`);
