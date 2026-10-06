// The display client's build is reproducible (roadmap step 10a, decided by
// Nobody, allegedly): the built display client is published in the release
// (`built/`), and anyone can rebuild those bytes from source. Slow: it
// builds the core library's WebAssembly three times. Run with
// `npm run test:build`; it needs Rust and wasm-bindgen-cli, as for `npm run wasm`.
//
// 1. The WebAssembly built from two copies of the sources, in two different
//    folders, is the same, byte for byte, and names none of those folders,
//    nor the build machine's home or Cargo's.
// 2. Built here, it is the same again; and the display client built twice
//    from it is the same twice.
// 3. That is the copy published in the release, `built/`, when the tools
//    are those `built/BUILT-WITH.txt` names; with other tools, the test says
//    which, rather than pass.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { BUILT, DISPLAY_FILES } from '../../src/released.ts';

const site = fileURLToPath(new URL('../..', import.meta.url));
const root = fileURLToPath(new URL('../../../..', import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 'mor-reproducible-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

const run = (cmd: string, args: string[], cwd: string) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** What the WebAssembly build reads: the Rust workspace and the build script, as committed or changed here. */
function copySources(to: string): void {
  const files = run('git', ['ls-files', '-co', '--exclude-standard', 'Cargo.toml', 'Cargo.lock', 'core', 'wasm', 'cmips/payment', 'modules/airgap', 'modules/lightning', 'relay', 'harness', 'clients/genesis/scripts'], root)
    .split('\n')
    .filter(Boolean);
  for (const f of files) {
    mkdirSync(dirname(join(to, f)), { recursive: true });
    cpSync(join(root, f), join(to, f));
  }
}

/** Build the WebAssembly in a checkout at `dir`, its own target folder inside it. */
function buildWasm(dir: string): { wasm: Buffer; glue: Buffer } {
  const env = { ...process.env };
  delete env.CARGO_TARGET_DIR;
  execFileSync('sh', ['clients/genesis/scripts/build-wasm.sh'], { cwd: dir, env, stdio: 'ignore' });
  return {
    wasm: readFileSync(join(dir, 'clients/genesis/wasm/mor_wasm_bg.wasm')),
    glue: readFileSync(join(dir, 'clients/genesis/wasm/mor_wasm.js')),
  };
}

const cargoHome = process.env.CARGO_HOME ?? join(homedir(), '.cargo');

function namesNoFolder(bytes: Buffer, folders: string[]): void {
  const text = bytes.toString('latin1');
  for (const f of folders) assert.ok(!text.includes(f), `the build names ${f}`);
}

let here: { wasm: Buffer; glue: Buffer };

test('the WebAssembly built in two folders is the same, and names neither', { timeout: 30 * 60_000 }, () => {
  const a = join(scratch, 'first', 'MOR');
  const b = join(scratch, 'second place', 'another-name');
  copySources(a);
  copySources(b);
  const one = buildWasm(a);
  const two = buildWasm(b);
  assert.ok(one.wasm.length > 100_000);
  assert.ok(one.wasm.equals(two.wasm), 'the two WebAssembly builds differ');
  assert.ok(one.glue.equals(two.glue), 'the two JavaScript glues differ');
  namesNoFolder(one.wasm, [a, b, scratch, homedir(), cargoHome, root]);
  // The folders it does name are the fixed ones.
  assert.match(one.wasm.toString('latin1'), /\/cargo\/registry\/src\//);

  here = buildWasm(root);
  assert.ok(here.wasm.equals(one.wasm), 'built in this checkout, the WebAssembly differs from the copies');
  assert.ok(here.glue.equals(one.glue));
});

test('the display client built twice is the same, and is the one published in the release', { timeout: 10 * 60_000 }, () => {
  assert.ok(here, 'the WebAssembly was built');
  const outs = [join(scratch, 'display-1'), join(scratch, 'display-2')];
  for (const o of outs) run('node', ['--import', 'tsx', 'scripts/build.ts', '--out', o], site);
  for (const f of DISPLAY_FILES) {
    assert.ok(readFileSync(join(outs[0], f)).equals(readFileSync(join(outs[1], f))), `${f} differs between two builds`);
  }
  assert.ok(readFileSync(join(outs[0], 'mor_wasm_bg.wasm')).equals(here.wasm));

  const recorded = readFileSync(join(BUILT, 'BUILT-WITH.txt'), 'utf8');
  const tools = {
    rustc: run('rustc', ['-V'], site).trim(),
    'wasm-bindgen': run('wasm-bindgen', ['--version'], site).trim(),
  };
  const other = Object.entries(tools).filter(([k, v]) => !recorded.includes(`${k}: ${v}\n`));
  assert.deepEqual(
    other,
    [],
    `built/ was made with other tools than this machine's (${other.map(([k, v]) => `${k} here: ${v}`).join('; ')}); see built/BUILT-WITH.txt. Install those to rebuild the released bytes.`,
  );
  for (const f of DISPLAY_FILES) {
    assert.ok(readFileSync(join(outs[0], f)).equals(readFileSync(join(BUILT, f))), `${f} differs from the released copy in built/`);
  }
});
