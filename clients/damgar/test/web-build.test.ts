// Damgar's web client as released: the files in built/, their fingerprints
// listed beside them; the build giving the same bytes twice; the banner and
// its risks in the page; the icons (H35); `mor-damgar check`; the page asking
// only for operations the program answers; and the gold tint (H36), by
// Kišib's rule. Whether built/ is what these sources give is `npm run
// test:build` (test/build/), as for Dub's and Kišib's.

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
import { WEB_BANNER, TEST_ONLY, STYLE, TINT } from '../src/page/view.ts';
import { TEST_ONLY as CODE_TEST_ONLY } from '../src/damgar.ts';
import { OPS } from '../src/ops.ts';
import { check } from '../src/cli.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const buildInto = (dir: string) => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dir], { cwd: here, stdio: 'ignore' });

test('the release in built/: every file, each with its fingerprints listed, the banner and its risks in the page, the icons', () => {
  const listed = readFileSync(join(BUILT, 'BUILT-WITH.txt'), 'utf8');
  for (const f of WEB_FILES) {
    const bytes = new Uint8Array(readFileSync(join(BUILT, f)));
    assert.ok(listed.includes(`${workHash(bytes)}  ${f}`), `${f}: work hash listed`);
    assert.ok(listed.includes(`${sha256(bytes)}  ${f}`), `${f}: SHA-256 listed`);
  }
  for (const t of ['rustc', 'wasm-bindgen', 'esbuild']) assert.match(listed, new RegExp(`^${t}: `, 'm'));
  const page = readFileSync(join(BUILT, 'index.html'), 'utf8');
  assert.ok(page.includes('<link rel="icon" type="image/png" href="icon.png">'), 'the tab icon');
  assert.ok(page.includes('<link rel="apple-touch-icon" href="apple-touch-icon.png">'), 'the home-screen icon');
  assert.deepEqual(readFileSync(join(BUILT, 'icon.png')), readFileSync(join(here, 'static/icon/damgar.png')));
  assert.deepEqual(readFileSync(join(BUILT, 'apple-touch-icon.png')), readFileSync(join(here, 'static/icon/damgar-touch.png')));
  assert.match(contentSecurityPolicy(), /img-src 'self'/);
  assert.ok(page.includes(WEB_BANNER), 'the banner is in the page itself, outside the script');
  for (const risk of [/could copy its signing key, and the on-chain request key/, /can be lost, or read by what runs in this page/, /holds no wallet/, /follows no chain/]) assert.match(WEB_BANNER, risk);
  assert.ok(CODE_TEST_ONLY.startsWith(TEST_ONLY), 'the page and the code say the same');
  const script = readFileSync(join(BUILT, 'damgar.js'), 'utf8');
  assert.ok(!/\/(home|Users|root)\//.test(script), 'no build machine folder in the script');
});

test('built twice, in two folders, the same bytes; not minified; nothing from Node in it', () => {
  const a = mkdtempSync(join(tmpdir(), 'damgar-a-'));
  const b = mkdtempSync(join(tmpdir(), 'damgar b-'));
  buildInto(a);
  buildInto(b);
  for (const f of WEB_FILES) assert.equal(sha256(new Uint8Array(readFileSync(join(a, f)))), sha256(new Uint8Array(readFileSync(join(b, f)))), f);
  const js = readFileSync(join(a, 'damgar.js'), 'utf8');
  assert.ok(js.split('\n').length > 5000, 'readable, line by line');
  assert.ok(!/node:https|getrawtransaction/.test(js), 'the chain source (btcd, program only) is not in the web client');
});

test('the page asks only for operations the program and the web client answer', () => {
  const ui = readFileSync(join(here, 'src/page/ui.ts'), 'utf8');
  const asked = [...ui.matchAll(/b\.ask(?:<[^>]*>)?\('([a-z ]+)'/g)].map((m) => m[1]);
  const viaAction = [...readFileSync(join(here, 'src/page/view.ts'), 'utf8').matchAll(/data-action="([a-z ]+)"/g)].map((m) => m[1]).filter((x) => /^(sign draft|decline|accept debt|pay request|sign receipt|refuse invoice|recheck|publish list|rails publish)$/.test(x));
  for (const op of [...asked, ...viaAction]) assert.ok((OPS as readonly string[]).includes(op), `the page asks for ${op}, which no operation answers`);
});

test('mor-damgar check: a server serving the release is SAME; one altering the script is caught on that file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'damgar-served-'));
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
    writeFileSync(join(dir, 'damgar.js'), readFileSync(join(dir, 'damgar.js'), 'utf8').replace('holds no wallet', 'holds a wallet'));
    assert.deepEqual(await check(url), ['damgar.js: not the released bytes']);
    const run = await new Promise<{ code: number | null; out: string }>((resolve) =>
      execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'check', url], { cwd: here }, (err, out) => resolve({ code: err ? ((err as { code?: number }).code ?? 1) : 0, out })),
    );
    assert.equal(run.code, 1);
    assert.match(run.out, /DIFFERS {2}damgar\.js: not the released bytes/);
  } finally {
    server.close();
  }
});

test('Damgar’s tint (H36): the gold of the Money layer, by Kišib’s rule, on outlines, separators and quiet accents only; red only for alarms', () => {
  assert.deepEqual(TINT, { layer: '#e8b33a', line: '#382e16', edge: '#4a3b1a', accent: '#8e6f28' });
  const over = (share: number) => '#' + [0, 2, 4].map((i) => Math.round(parseInt('06080c'.slice(i, i + 2), 16) + share * (parseInt(TINT.layer.slice(1 + i, 3 + i), 16) - parseInt('06080c'.slice(i, i + 2), 16))).toString(16).padStart(2, '0')).join('');
  assert.deepEqual([over(0.22), over(0.3), over(0.6)], [TINT.line, TINT.edge, TINT.accent]);
  assert.match(STYLE, /:root\{--line:#382e16;--edge:#4a3b1a;--tint:#8e6f28\}/);
  const textUses = [...STYLE.matchAll(/([^{}]+)\{[^}]*(?<![-a-z])color:var\(--tint\)/g)].map((m) => m[1].trim());
  assert.deepEqual(textUses, ['details>summary::before']);
  assert.match(STYLE, /--bad:#b4615f/);
  // The icon's tint, by the same rule: a thick edge at 70% over the dark; the dark moved 6%; the clay 12%.
  const svg = readFileSync(join(here, 'static/icon/damgar.svg'), 'utf8');
  for (const c of ['#a4802c', '#14120f', '#957359', '#6f5335']) assert.ok(svg.includes(c), c);
  assert.match(svg, /stroke="#a4802c" stroke-width="16"/);
});
