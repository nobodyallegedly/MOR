// Build Dub's web client (F281): the page served at dub.dubsar.org, its
// script (Dub's own code and the shared client code, bundled with the
// browser's core library in place of the Node one), its stylesheet, and the
// core library's WebAssembly. The script is not minified, so anyone can read
// what their browser runs, and compare it with the release.
//
//   node --import tsx scripts/build-web.ts               into dist-web/, for working on it
//   node --import tsx scripts/build-web.ts --out DIR     into DIR
//   node --import tsx scripts/build-web.ts --release     into built/, the copy published in
//                                                        the release, with the versions of
//                                                        the tools that made it and each
//                                                        file's fingerprints
//
// Reproducible, as the display client's build (clients/site/scripts/build.ts):
// the same sources and tool versions give the same bytes, in any folder.
// Nothing from Node reaches the bundle, except two shims named below, each
// for the files named.

import { build, type Plugin } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE, WEB_BANNER } from '../src/page/view.ts';
import { WEB_FILES } from '../src/web/released.ts';
import { FONT_FILES, FONTS_DIR } from '../src/fonts.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const args = process.argv.slice(2);
const release = args.includes('--release');
const at = args.indexOf('--out');
const out = release ? here('built') : at >= 0 ? resolve(args[at + 1]) : here('dist-web');

/** The shared client code imports the genesis client's core; in a browser, it gets the reader's browser core. */
const browserCore: Plugin = {
  name: 'browser-core',
  setup(b) {
    const nodeCore = here('../genesis/src/core.ts');
    b.onResolve({ filter: /core\.ts$/ }, (a) =>
      resolve(dirname(a.importer), a.path) === nodeCore ? { path: here('../reader/src/web/core.ts') } : undefined,
    );
  },
};

/**
 * The only imports from Node allowed, each for the files that make it, put
 * in place by a browser shim (`src/web/node-*.ts`). Anything else from Node
 * fails the build.
 */
const SHIMS: Record<string, { shim: string; for: string[] }> = {
  'node:crypto': { shim: 'src/web/node-crypto.ts', for: ['../genesis/src/identity.ts', '../../modules/carry/src/carry.ts', '../repo/src/specs.ts'] },
  'node:fs': { shim: 'src/web/node-fs.ts', for: ['../genesis/src/identity.ts'] },
};
const nodeShims: Plugin = {
  name: 'node-shims',
  setup(b) {
    b.onResolve({ filter: /^node:/ }, (a) => {
      const s = SHIMS[a.path];
      if (s && s.for.some((f) => here(f) === a.importer)) return { path: here(s.shim) };
      return { errors: [{ text: `${a.path} in the browser bundle, from ${relative(here(''), a.importer)}` }] };
    });
  },
};

/** Every package is taken from this client's node_modules, whichever folder imports it (as the display client's build). */
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
  entryPoints: [here('src/web/app.ts')],
  outfile: `${out}/dub.js`,
  // Paths in the bundle's comments are relative to this folder, whatever the machine.
  absWorkingDir: here(''),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  plugins: [browserCore, nodeShims, ownPackages],
  nodePaths: [here('node_modules')],
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/dub.css`, `${STYLE}\n`);
const page = readFileSync(here('static/web.html'), 'utf8');
if (!page.includes('<!-- dub banner -->')) throw new Error('static/web.html has lost its banner mark');
writeFileSync(`${out}/index.html`, page.replace('<!-- dub banner -->', WEB_BANNER));
copyFileSync(here('../genesis/wasm/mor_wasm_bg.wasm'), `${out}/mor_wasm_bg.wasm`);
// Inter and its licence, copied byte for byte (F332, "Inter bundled").
for (const f of Object.keys(FONT_FILES)) copyFileSync(here(`${FONTS_DIR}/${f}`), `${out}/${f}`);

// Its icon (H35): the tab's (the 256-pixel PNG) and the one a phone keeps when the page is added to its home screen (180 pixels, full bleed), from the page's own files.
copyFileSync(here('static/icon/dub.png'), `${out}/icon.png`);
copyFileSync(here('static/icon/dub-touch.png'), `${out}/apple-touch-icon.png`);

if (release) {
  // What made these bytes, so that anyone can rebuild them from source, and each file's fingerprints.
  const version = (cmd: string, a: string[]) => execFileSync(cmd, a, { encoding: 'utf8' }).trim();
  const esbuild = JSON.parse(readFileSync(here('node_modules/esbuild/package.json'), 'utf8')).version;
  const { sha256, workHash } = await import('../../genesis/src/core.ts');
  const file = (f: string) => new Uint8Array(readFileSync(`${out}/${f}`));
  const lines = [
    'Dub’s web client, as published in the release (F281; served at dub.dubsar.org).',
    'Rebuild: cd clients/genesis && npm run wasm; cd ../dub && npm run release.',
    'The same tools give the same bytes (test/web-build.test.ts):',
    '',
    `rustc: ${version('rustc', ['-V'])}`,
    `wasm-bindgen: ${version('wasm-bindgen', ['--version'])}`,
    `esbuild: ${esbuild}`,
    '',
    'Work hash of each file (as the display client lists them):',
    ...WEB_FILES.map((f) => `${workHash(file(f))}  ${f}`),
    '',
    'SHA-256 of each file (as sha256sum prints it):',
    ...WEB_FILES.map((f) => `${sha256(file(f))}  ${f}`),
  ];
  writeFileSync(`${out}/BUILT-WITH.txt`, lines.join('\n') + '\n');
}
console.log(`built ${out}`);
