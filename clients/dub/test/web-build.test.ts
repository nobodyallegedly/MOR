// Dub's web client as released (F281: "served as a signed, checkable
// release"): the files in built/, their fingerprints listed beside them; the
// build giving the same bytes twice; nothing from Node in the bundle but
// the two shims; and `mor-dub check`, which tells a server serving the
// release from one serving anything else. Whether built/ is what these
// sources give is `npm run test:build` (test/build/), as for the display client.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256, workHash } from '../../genesis/src/core.ts';
import { BUILT, WEB_FILES } from '../src/web/released.ts';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { WEB_BANNER } from '../src/page/view.ts';
import { check, defaultDir } from '../src/cli.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const buildInto = (dir: string) => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dir], { cwd: here, stdio: 'ignore' });

test('the release in built/: every file, each with its fingerprints listed, the banner in the page', () => {
  const listed = readFileSync(join(BUILT, 'BUILT-WITH.txt'), 'utf8');
  for (const f of WEB_FILES) {
    const bytes = new Uint8Array(readFileSync(join(BUILT, f)));
    assert.ok(listed.includes(`${workHash(bytes)}  ${f}`), `${f}: work hash listed`);
    assert.ok(listed.includes(`${sha256(bytes)}  ${f}`), `${f}: SHA-256 listed`);
  }
  assert.match(listed, /^rustc: /m);
  assert.match(listed, /^wasm-bindgen: /m);
  assert.match(listed, /^esbuild: /m);
  const page = readFileSync(join(BUILT, 'index.html'), 'utf8');
  // H35: its icon, as the tab's and as a phone's home screen's, from the page's own files (within its policy's img-src 'self').
  assert.ok(page.includes('<link rel="icon" type="image/png" href="icon.png">'), 'the tab icon');
  assert.ok(page.includes('<link rel="apple-touch-icon" href="apple-touch-icon.png">'), 'the home-screen icon');
  assert.deepEqual(readFileSync(join(BUILT, 'icon.png')), readFileSync(join(here, 'static/icon/dub.png')));
  assert.deepEqual(readFileSync(join(BUILT, 'apple-touch-icon.png')), readFileSync(join(here, 'static/icon/dub-touch.png')));
  assert.match(contentSecurityPolicy(), /img-src 'self'/);
  assert.ok(page.includes(WEB_BANNER), 'the banner is in the page itself, outside the script');
  const script = readFileSync(join(BUILT, 'dub.js'), 'utf8');
  assert.ok(!/\/(home|Users|root)\//.test(script), 'no build machine folder in the script');
  // The same core library the display client released.
  // Compared by digest: a byte-by-byte diff of two differing WebAssembly
  // files exhausts the machine's memory before it fails (16 October 2026).
  assert.equal(
    sha256(new Uint8Array(readFileSync(join(BUILT, 'mor_wasm_bg.wasm')))),
    sha256(new Uint8Array(readFileSync(join(here, '../site/built/mor_wasm_bg.wasm')))),
    'Dub’s WebAssembly is not the display client’s: release both (npm run release in clients/site and clients/dub)',
  );
});

test('built twice, in two folders, the same bytes; not minified', () => {
  const a = mkdtempSync(join(tmpdir(), 'dub-a-'));
  const b = mkdtempSync(join(tmpdir(), 'dub b-'));
  buildInto(a);
  buildInto(b);
  for (const f of WEB_FILES) assert.equal(sha256(new Uint8Array(readFileSync(join(a, f)))), sha256(new Uint8Array(readFileSync(join(b, f)))), f);
  assert.ok(readFileSync(join(a, 'dub.js'), 'utf8').split('\n').length > 5000, 'readable, line by line');
});

test('mor-dub check: a server serving the release is SAME; one altering the script is caught on that file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dub-served-'));
  cpSync(BUILT, dir, { recursive: true });
  const server = createServer((req, res) => {
    const name = req.url === '/' ? 'index.html' : (req.url ?? '').slice(1);
    try {
      res.end(readFileSync(join(dir, name)));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
  try {
    assert.deepEqual(await check(url), []);
    writeFileSync(join(dir, 'dub.js'), readFileSync(join(dir, 'dub.js'), 'utf8').replace('Whoever', 'Whomever'));
    assert.deepEqual(await check(url), ['dub.js: not the released bytes']);
    // From the command line, in another process: it says which file, and fails.
    const run = await new Promise<{ code: number | null; out: string }>((resolve) =>
      execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'check', url], { cwd: here }, (err, out) => resolve({ code: err ? ((err as { code?: number }).code ?? 1) : 0, out })),
    );
    assert.equal(run.code, 1);
    assert.match(run.out, /DIFFERS {2}dub\.js: not the released bytes/);
  } finally {
    server.close();
  }
});

test('the program’s folder: ~/mor-dub, or ~/mor-poster while an install from before the rename has it and ~/mor-dub does not exist', async () => {
  const { mkdirSync } = await import('node:fs');
  const home = mkdtempSync(join(tmpdir(), 'dub-home-'));
  assert.equal(defaultDir(home), join(home, 'mor-dub'));
  mkdirSync(join(home, 'mor-poster'));
  assert.equal(defaultDir(home), join(home, 'mor-poster'));
  mkdirSync(join(home, 'mor-dub'));
  assert.equal(defaultDir(home), join(home, 'mor-dub'));
});
