// Ummia's web client as released: the files in built/, their fingerprints
// listed beside them; the build giving the same bytes twice; the banner and
// its risks in the page; the icons (H35); `mor-ummia check`; the page asking
// only for operations the program answers; and the coral tint (H36), by
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
import { TEST_ONLY as CODE_TEST_ONLY } from '../src/ummia.ts';
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
  assert.deepEqual(readFileSync(join(BUILT, 'icon.png')), readFileSync(join(here, 'static/icon/ummia.png')));
  assert.deepEqual(readFileSync(join(BUILT, 'apple-touch-icon.png')), readFileSync(join(here, 'static/icon/ummia-touch.png')));
  assert.match(contentSecurityPolicy(), /img-src 'self'/);
  assert.ok(page.includes(WEB_BANNER), 'the banner is in the page itself, outside the script');
  for (const risk of [/could copy its signing key/, /can be lost, or read by what runs in this page/, /public and for good/, /reads no folder, so it makes no release/, /follows no chain, so it checks no anchor/]) assert.match(WEB_BANNER, risk);
  assert.ok(CODE_TEST_ONLY.startsWith(TEST_ONLY), 'the page and the code say the same');
  const script = readFileSync(join(BUILT, 'ummia.js'), 'utf8');
  assert.ok(!/\/(home|Users|root)\//.test(script), 'no build machine folder in the script');
});

test('built twice, in two folders, the same bytes; not minified; nothing from Node in it', () => {
  const a = mkdtempSync(join(tmpdir(), 'ummia-a-'));
  const b = mkdtempSync(join(tmpdir(), 'ummia b-'));
  buildInto(a);
  buildInto(b);
  for (const f of WEB_FILES) assert.equal(sha256(new Uint8Array(readFileSync(join(a, f)))), sha256(new Uint8Array(readFileSync(join(b, f)))), f);
  const js = readFileSync(join(a, 'ummia.js'), 'utf8');
  assert.ok(js.split('\n').length > 5000, 'readable, line by line');
  assert.ok(!/node:https|getrawtransaction/.test(js), 'the chain source (btcd, program only) is not in the web client');
  assert.ok(!/git ls-files|rev-parse/.test(js), 'releases (a folder, program only) are not in the web client');
});

test('the page asks only for operations the program and the web client answer', () => {
  const ui = readFileSync(join(here, 'src/page/ui.ts'), 'utf8');
  const asked = [...ui.matchAll(/b\.ask(?:<[^>]*>)?\('([a-z ]+)'/g)].map((m) => m[1]);
  const viaAction = [...readFileSync(join(here, 'src/page/view.ts'), 'utf8').matchAll(/data-action="([a-z ]+)"/g)].map((m) => m[1]).filter((x) => /^(confirm|release confirm|release check|mip draft|mip replies|mip prepare|accepted publish)$/.test(x));
  // The picker is the program's own: the web client shows no release form.
  for (const op of [...asked, ...viaAction].filter((x) => x !== 'folders')) assert.ok((OPS as readonly string[]).includes(op), `the page asks for ${op}, which no operation answers`);
  assert.ok(readFileSync(join(here, 'src/server.ts'), 'utf8').includes("case 'folders':"), 'the program answers the picker');
});

test('mor-ummia check: a server serving the release is SAME; one altering the script is caught on that file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ummia-served-'));
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
    writeFileSync(join(dir, 'ummia.js'), readFileSync(join(dir, 'ummia.js'), 'utf8').replace('sees public agreements only', 'sees every agreement'));
    assert.deepEqual(await check(url), ['ummia.js: not the released bytes']);
    const run = await new Promise<{ code: number | null; out: string }>((resolve) =>
      execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'check', url], { cwd: here }, (err, out) => resolve({ code: err ? ((err as { code?: number }).code ?? 1) : 0, out })),
    );
    assert.equal(run.code, 1);
    assert.match(run.out, /DIFFERS {2}ummia\.js: not the released bytes/);
  } finally {
    server.close();
  }
});

test('Ummia’s colour on the kit: the Development layer’s coral, in pastel fills; red only for alarms; its icon’s tint (H36)', () => {
  assert.deepEqual(TINT, { layer: '#ee8b74', pastel: '#f7c4b7' });
  assert.match(STYLE, /\.k-ummia\{--k-c:#ee8b74;--k-p:#f7c4b7;/);
  // Red stays the alarm's: the kit's --k-bad, never on a tile but an alarm.
  assert.match(STYLE, /--k-bad:#c4645f/);
  for (const m of STYLE.matchAll(/\.k-tile\.k-d[23]\{([^}]*)\}/g)) assert.doesNotMatch(m[1], /--k-bad/);
  const over = (share: number, base = '06080c') => '#' + [0, 2, 4].map((i) => Math.round(parseInt(base.slice(i, i + 2), 16) + share * (parseInt(TINT.layer.slice(1 + i, 3 + i), 16) - parseInt(base.slice(i, i + 2), 16))).toString(16).padStart(2, '0')).join('');
  // The icon's tint, by the same rule: a thick edge at 70% over the dark; the dark moved 6%; the clay, its rim and the carving 12%.
  const svg = readFileSync(join(here, 'static/icon/ummia.svg'), 'utf8');
  assert.equal(over(0.7), '#a86455');
  assert.match(svg, /stroke="#a86455" stroke-width="16"/);
  for (const [base, share] of [['06080c', 0.06], ['8a6a55', 0.12], ['a48469', 0.12], ['5e4634', 0.12]] as const) assert.ok(svg.includes(over(share, base)), `${base} moved ${share}`);
  // The name carved, UM.MI.A (decided by Nobody, allegedly): its three signs named in the drawing.
  assert.match(svg, /𒌝𒈪𒀀 \(UM\.MI\.A, U\+1231D, U\+1222A, U\+12000/);
});
