// Kišib's web client as released: the files in built/, their fingerprints
// listed beside them; the build giving the same bytes twice; nothing from
// Node in the bundle but the two shims; no storage touched by its code;
// `mor-kishib check`, which tells a server serving the release from one
// serving anything else; and the page asking only for operations the
// program answers. Whether built/ is what these sources give is
// `npm run test:build` (test/build/), as for Dub's.

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
import { OPS, RUNNER_OPS } from '../src/ops.ts';
import { check } from '../src/cli.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const buildInto = (dir: string) => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dir], { cwd: here, stdio: 'ignore' });

test('the release in built/: every file, each with its fingerprints listed, the banner in the page', () => {
  const listed = readFileSync(join(BUILT, 'BUILT-WITH.txt'), 'utf8');
  for (const f of WEB_FILES) {
    const bytes = new Uint8Array(readFileSync(join(BUILT, f)));
    assert.ok(listed.includes(`${workHash(bytes)}  ${f}`), `${f}: work hash listed`);
    assert.ok(listed.includes(`${sha256(bytes)}  ${f}`), `${f}: SHA-256 listed`);
  }
  for (const t of ['rustc', 'wasm-bindgen', 'esbuild']) assert.match(listed, new RegExp(`^${t}: `, 'm'));
  const page = readFileSync(join(BUILT, 'index.html'), 'utf8');
  // H35: its icon, as the tab's and as a phone's home screen's, from the page's own files (within its policy's img-src 'self').
  assert.ok(page.includes('<link rel="icon" type="image/png" href="icon.png">'), 'the tab icon');
  assert.ok(page.includes('<link rel="apple-touch-icon" href="apple-touch-icon.png">'), 'the home-screen icon');
  assert.deepEqual(readFileSync(join(BUILT, 'icon.png')), readFileSync(join(here, 'static/icon/kishib.png')));
  assert.deepEqual(readFileSync(join(BUILT, 'apple-touch-icon.png')), readFileSync(join(here, 'static/icon/kishib-touch.png')));
  assert.match(contentSecurityPolicy(), /img-src 'self'/);
  assert.ok(page.includes(WEB_BANNER), 'the banner is in the page itself, outside the script');
  assert.equal(TEST_ONLY, 'Test identities only, until MOR is frozen');
  const script = readFileSync(join(BUILT, 'kishib.js'), 'utf8');
  assert.ok(!/\/(home|Users|root)\//.test(script), 'no build machine folder in the script');
});

test('built twice, in two folders, the same bytes; not minified; its own code touches no browser storage', () => {
  const a = mkdtempSync(join(tmpdir(), 'kishib-a-'));
  const b = mkdtempSync(join(tmpdir(), 'kishib b-'));
  buildInto(a);
  buildInto(b);
  for (const f of WEB_FILES) assert.equal(sha256(new Uint8Array(readFileSync(join(a, f)))), sha256(new Uint8Array(readFileSync(join(b, f)))), f);
  assert.ok(readFileSync(join(a, 'kishib.js'), 'utf8').split('\n').length > 5000, 'readable, line by line');
  for (const f of ['src/kishib.ts', 'src/collective.ts', 'src/read.ts', 'src/words.ts', 'src/common.ts', 'src/page/ui.ts', 'src/page/view.ts', 'src/web/app.ts']) {
    const src = readFileSync(join(here, f), 'utf8');
    assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie|caches\./.test(src), `${f} touches no browser storage`);
  }
});

test('the page asks only for operations the program and the web client answer', () => {
  const ui = readFileSync(join(here, 'src/page/ui.ts'), 'utf8');
  const asked = [...ui.matchAll(/b\.ask(?:<[^>]*>)?\('([a-z ]+)'/g)].map((m) => m[1]);
  const mapped = [...ui.matchAll(/: '([a-z ]+ (?:plan|start|give))'/g)].map((m) => m[1]);
  for (const op of [...asked, ...mapped, 'collective gather', 'collective rotate']) assert.ok([...OPS, ...RUNNER_OPS].includes(op as never), `the page asks for ${op}, which no operation answers`);
  // The runner's are the program's only: the server answers each of them.
  const server = readFileSync(join(here, 'src/server.ts'), 'utf8');
  for (const op of RUNNER_OPS) assert.ok(server.includes(`case '${op}':`), `the program answers ${op}`);
});

test('mor-kishib check: a server serving the release is SAME; one altering the script is caught on that file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'kishib-served-'));
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
    writeFileSync(join(dir, 'kishib.js'), readFileSync(join(dir, 'kishib.js'), 'utf8').replace('forgotten', 'kept'));
    assert.deepEqual(await check(url), ['kishib.js: not the released bytes']);
    const run = await new Promise<{ code: number | null; out: string }>((resolve) =>
      execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'check', url], { cwd: here }, (err, out) => resolve({ code: err ? ((err as { code?: number }).code ?? 1) : 0, out })),
    );
    assert.equal(run.code, 1);
    assert.match(run.out, /DIFFERS {2}kishib\.js: not the released bytes/);
  } finally {
    server.close();
  }
});

test('Kišib’s colour on the kit: the Identity layer’s glacier blue, in pastel fills; red only for alarms', () => {
  assert.deepEqual(TINT, { layer: '#8ec5f0', pastel: '#cfe5f7' });
  assert.match(STYLE, /\.k-kishib\{--k-c:#8ec5f0;--k-p:#cfe5f7;/);
  // Red stays the alarm's: the kit's --k-bad, never on a tile but an alarm.
  assert.match(STYLE, /--k-bad:#c4645f/);
  // A tile's danger marks thicken its edge, never in red: red only where a tile carries an alarm.
  for (const m of STYLE.matchAll(/\.k-tile\.k-d[23]\{([^}]*)\}/g)) assert.doesNotMatch(m[1], /--k-bad/);
});
