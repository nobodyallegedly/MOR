// Build the gateway's display client into dist/: the page served at every
// address of a site, its script (the shared client code, bundled with the
// browser's core library in place of the Node one), its stylesheet, and the
// core library's WebAssembly. The script is not minified, so anyone can read
// what their browser runs, and compare it with the release (website cMIP,
// rule 20).

import { build, type Plugin } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE } from '../src/shell/view.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const out = here('dist');

/** The shared client code imports the genesis client's core; in a browser, it gets this client's browser core. */
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
  entryPoints: [here('src/shell/app.ts')],
  outfile: `${out}/gateway.js`,
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  plugins: [browserCore],
  nodePaths: [here('node_modules')],
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/gateway.css`, STYLE + '\n');
copyFileSync(here('static/index.html'), `${out}/index.html`);
copyFileSync(here('../genesis/wasm/mor_wasm_bg.wasm'), `${out}/mor_wasm_bg.wasm`);
console.log(`built ${out}`);
