// Build the gateway's display client: the page served at every address of a
// site, its script (the shared client code, bundled with the browser's core
// library in place of the Node one), its stylesheet, and the core library's
// WebAssembly. The script is not minified, so anyone can read what their
// browser runs, and compare it with the release (website cMIP, rule 20).
//
//   node --import tsx scripts/build.ts                  into dist/, for working on it
//   node --import tsx scripts/build.ts --out DIR        into DIR
//   node --import tsx scripts/build.ts --release        into built/, the copy published
//                                                       in the release, with the versions
//                                                       of the tools that made it
//
// The build is reproducible (roadmap step 10a): the same sources and the same
// tool versions give the same bytes, on any machine, in any folder. The
// WebAssembly comes from ../genesis/wasm, built by ../genesis/scripts/build-wasm.sh,
// which strips the build machine's folders from it.

import { build, type Plugin } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE } from '../src/shell/view.ts';
import { DISPLAY_FILES } from '../src/released.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const args = process.argv.slice(2);
const release = args.includes('--release');
const at = args.indexOf('--out');
const out = release ? here('built') : at >= 0 ? resolve(args[at + 1]) : here('dist');

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

/** Every package is taken from this client's node_modules, whichever folder imports it: shared code from
 * the reader or barebone clients would otherwise take its packages from their node_modules when those are
 * installed, and the bundle would differ from one machine to another (found 6 October 2026, Mac against Linux). */
const ownPackages: Plugin = {
  name: 'own-packages',
  setup(b) {
    b.onResolve({ filter: /^[^./]/ }, async (a) => {
      if (a.path.startsWith('node:') || a.pluginData?.own) return undefined;
      const r = await b.resolve(a.path, { kind: a.kind, resolveDir: here(''), importer: a.importer, pluginData: { own: true } });
      return r.errors.length ? undefined : { path: r.path, namespace: r.namespace, sideEffects: r.sideEffects };
    });
  },
};

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
await build({
  entryPoints: [here('src/shell/app.ts')],
  outfile: `${out}/gateway.js`,
  // Paths in the bundle's comments are relative to this folder, whatever the machine.
  absWorkingDir: here(''),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  plugins: [browserCore, ownPackages],
  nodePaths: [here('node_modules')],
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/gateway.css`, STYLE + '\n');
copyFileSync(here('static/index.html'), `${out}/index.html`);
copyFileSync(here('../genesis/wasm/mor_wasm_bg.wasm'), `${out}/mor_wasm_bg.wasm`);

if (release) {
  // What made these bytes, so that anyone can rebuild them from source.
  const version = (cmd: string, a: string[]) => execFileSync(cmd, a, { encoding: 'utf8' }).trim();
  const esbuild = JSON.parse(readFileSync(here('node_modules/esbuild/package.json'), 'utf8')).version;
  const { workHash } = await import('../../genesis/src/core.ts');
  const lines = [
    'The display client, as published in the release (website cMIP, rule 20).',
    'Rebuild: cd clients/genesis && npm run wasm; cd ../site && npm run release.',
    'The same tools give the same bytes (test/build/reproducible.test.ts):',
    '',
    `rustc: ${version('rustc', ['-V'])}`,
    `wasm-bindgen: ${version('wasm-bindgen', ['--version'])}`,
    `esbuild: ${esbuild}`,
    '',
    'Work hash of each file:',
    ...DISPLAY_FILES.map((f) => `${workHash(new Uint8Array(readFileSync(`${out}/${f}`)))}  ${f}`),
  ];
  writeFileSync(`${out}/BUILT-WITH.txt`, lines.join('\n') + '\n');
}
console.log(`built ${out}`);
