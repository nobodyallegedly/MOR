// Build Edubba's web client (testing only): the page to be served at
// edubba.dubsar.org, its script (Edubba's own code, its operations
// `src/ops.ts`, and the shared client code, bundled with the browser's core
// library in place of the Node one), its stylesheet, and the core library's
// WebAssembly. The script is not minified, so anyone can read what their
// browser runs, and compare it with the release.
//
//   node --import tsx scripts/build-web.ts               into dist-web/, for working on it
//   node --import tsx scripts/build-web.ts --out DIR     into DIR
//   node --import tsx scripts/build-web.ts --release     into built/, the copy published in
//                                                        the release, with the versions of
//                                                        the tools that made it and each
//                                                        file's fingerprints
//
// Reproducible, as Dub's, Kišib's, Damgar's and Ummia's: the same sources
// and tool versions give the same bytes, in any folder. Edubba's code keeps
// a folder and runs on Node: in the browser, its folder is IndexedDB
// (`src/web/vfs.ts`) and the few Node modules it names are browser shims
// (`src/web/node-*.ts`, `src/web/buffer.ts`), each named below. Anything
// else from Node fails the build, and so does any of the program-only code
// named in PROGRAM_ONLY: the agents and their API, the pairing, the
// collective client's server.

import { build, type Plugin } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE, WEB_BANNER } from '../src/page/view.ts';
import { WEB_FILES } from '../src/web/released.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';

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

/** The imports from Node allowed, each put in place by a browser shim. Anything else from Node fails the build. */
const SHIMS: Record<string, string> = {
  'node:fs': 'src/web/node-fs.ts',
  'node:path': 'src/web/node-path.ts',
  'node:os': 'src/web/node-os.ts',
  'node:crypto': 'src/web/node-crypto.ts',
  'node:url': 'src/web/node-url.ts',
  'node:child_process': 'src/web/node-child-process.ts',
};
const nodeShims: Plugin = {
  name: 'node-shims',
  setup(b) {
    b.onResolve({ filter: /^node:/ }, (a) => {
      const s = SHIMS[a.path];
      if (s) return { path: here(s) };
      return { errors: [{ text: `${a.path} in the browser bundle, from ${relative(here(''), a.importer)}` }] };
    });
  },
};

/**
 * Program-only code: replaced (the collective client's server, whose page
 * operations serve only test-mode collectives) or refused (anything else
 * here reaching the bundle fails it).
 */
const PROGRAM_ONLY: Record<string, string | null> = {
  '../collective/src/server.ts': 'src/web/collective-server.ts',
  '../collective/src/access.ts': null,
  'src/agents.ts': null,
  'src/claude.ts': null,
  'src/machine.ts': null,
  'src/server.ts': null,
  'src/local.ts': null,
  'src/money.ts': null,
  'src/version.ts': null,
};
const programOnly: Plugin = {
  name: 'program-only',
  setup(b) {
    b.onResolve({ filter: /\.ts$/ }, (a) => {
      if (a.kind === 'entry-point') return undefined;
      const full = resolve(dirname(a.importer), a.path);
      for (const [f, stub] of Object.entries(PROGRAM_ONLY)) {
        if (here(f) !== full) continue;
        if (stub) return { path: here(stub) };
        return { errors: [{ text: `${f}, program-only code, in the browser bundle, from ${relative(here(''), a.importer)}` }] };
      }
      return undefined;
    });
    b.onResolve({ filter: /^(@anthropic-ai|@modelcontextprotocol|esbuild)/ }, (a) => ({ errors: [{ text: `${a.path}, program-only, in the browser bundle, from ${relative(here(''), a.importer)}` }] }));
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
  outfile: `${out}/edubba.js`,
  // Paths in the bundle's comments are relative to this folder, whatever the machine.
  absWorkingDir: here(''),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  // `Buffer`, wherever the shared code names it, is the browser's bytes (`src/web/buffer.ts`).
  inject: [here('src/web/buffer.ts')],
  plugins: [browserCore, programOnly, nodeShims, ownPackages],
  nodePaths: [here('node_modules')],
  legalComments: 'inline',
  logLevel: 'warning',
});
writeFileSync(`${out}/edubba.css`, `${STYLE}\n`);
const page = readFileSync(here('static/web.html'), 'utf8');
if (!page.includes('<!-- edubba banner -->')) throw new Error('static/web.html has lost its banner mark');
writeFileSync(`${out}/index.html`, page.replace('<!-- edubba banner -->', WEB_BANNER));
copyFileSync(here('../genesis/wasm/mor_wasm_bg.wasm'), `${out}/mor_wasm_bg.wasm`);
// Inter and its licence, copied byte for byte (F332, "Inter bundled").
for (const f of Object.keys(FONT_FILES)) copyFileSync(here(`../dub/${FONTS_DIR}/${f}`), `${out}/${f}`);

// Its icon (H35): the tab's (the 256-pixel PNG) and the one a phone keeps when the page is added to its home screen (180 pixels, full bleed), the same as Edubba's on the Mac.
copyFileSync(here('static/icon/edubba.png'), `${out}/icon.png`);
copyFileSync(here('static/icon/edubba-touch.png'), `${out}/apple-touch-icon.png`);

if (release) {
  // What made these bytes, so that anyone can rebuild them from source, and each file's fingerprints.
  const version = (cmd: string, a: string[]) => execFileSync(cmd, a, { encoding: 'utf8' }).trim();
  const esbuild = JSON.parse(readFileSync(here('node_modules/esbuild/package.json'), 'utf8')).version;
  const { sha256, workHash } = await import('../../genesis/src/core.ts');
  const file = (f: string) => new Uint8Array(readFileSync(`${out}/${f}`));
  const lines = [
    'Edubba’s web client, as published in the release (testing only; to be served at edubba.dubsar.org).',
    'Rebuild: cd clients/genesis && npm run wasm; cd ../desk && npm run release.',
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
