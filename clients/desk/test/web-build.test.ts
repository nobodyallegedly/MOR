// Edubba's web client as released: the files in built/, their fingerprints
// listed beside them; the build giving the same bytes twice, in two folders;
// nothing of the program's in it (the agents, Anthropic's API, the pairing,
// the collective client's server); the banner and its risks in the page; the
// icons, Edubba's own, as on the Mac (H35); `mor-desk check`; the emerald
// tint (H36); and the operations the web client answers and refuses, in
// plain words. Whether built/ is what these sources give is `npm run
// test:build` (test/build/).

import { Publishing } from '../src/publishing.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256, workHash } from '../../genesis/src/core.ts';
import { start } from '../../genesis/test/world.ts';
import { BUILT, WEB_FILES } from '../src/web/released.ts';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { WEB_BANNER, STYLE, TINT, RELEASE_ON_WEB as SAID } from '../src/page/view.ts';
import { APPS } from '../../kit/src/style.ts';
import { ON_A_COMPUTER, RELEASE_ON_WEB, WEB_OPS, operations } from '../src/ops.ts';
import { Store } from '../src/store.ts';
import { Desk } from '../src/desk.ts';
import { Setup } from '../src/setup.ts';
import { Real } from '../src/real.ts';
import { AfterKishib } from '../src/kishib.ts';
import { Member } from '../src/member.ts';
import { Corrections } from '../src/corrections.ts';
import { Collectives } from '../src/collectives.ts';
import { check } from '../src/cli.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const buildInto = (dir: string) => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dir], { cwd: here, stdio: 'ignore' });

test('the release in built/: every file, each with its fingerprints listed, the banner and its risks in the page, Edubba’s icons', () => {
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
  assert.deepEqual(readFileSync(join(BUILT, 'icon.png')), readFileSync(join(here, 'static/icon/edubba.png')), 'Edubba’s icon, the same as on the Mac');
  assert.deepEqual(readFileSync(join(BUILT, 'apple-touch-icon.png')), readFileSync(join(here, 'static/icon/edubba-touch.png')));
  assert.match(contentSecurityPolicy(), /img-src 'self'/);
  assert.ok(page.includes(WEB_BANNER), 'the banner is in the page itself, outside the script');
  for (const risk of [
    /For testing only/,
    /could copy its signing key/,
    /storage keeps, as they are and not locked/,
    /signing key of each collective you found here/,
    /one-time key for your share/,
    /can be lost[\s\S]*or read by what runs in this page/,
    /holds the whole chain key, in its memory, never in its storage/,
    /a reload or a closed tab loses them/,
    /act alone\./,
    /No agents, no API key and nothing from Claude/,
    /Never bring a real identity here/,
  ])
    assert.match(WEB_BANNER, risk);
  const script = readFileSync(join(BUILT, 'edubba.js'), 'utf8');
  assert.ok(!/\/(home|Users|root)\/[a-z]/.test(script.replace(/'\/home'/g, '')), 'no build machine folder in the script');
});

test('built twice, in two folders, the same bytes; not minified; nothing of the program in it', () => {
  const a = mkdtempSync(join(tmpdir(), 'edubba-a-'));
  const b = mkdtempSync(join(tmpdir(), 'edubba b-'));
  buildInto(a);
  buildInto(b);
  for (const f of WEB_FILES) assert.equal(sha256(new Uint8Array(readFileSync(join(a, f)))), sha256(new Uint8Array(readFileSync(join(b, f)))), f);
  const js = readFileSync(join(a, 'edubba.js'), 'utf8');
  assert.ok(js.split('\n').length > 5000, 'readable, line by line');
  for (const absent of [/api\.anthropic\.com/, /@anthropic-ai/, /\/\/ src\/agents\.ts/, /\/\/ src\/machine\.ts/, /\/\/ src\/claude\.ts/, /\/\/ src\/server\.ts/, /\/\/ \.\.\/collective\/src\/access\.ts/, /createServer/]) assert.ok(!absent.test(js), `${absent} in the web client`);
  assert.ok(/\/\/ src\/web\/collective-server\.ts/.test(js), 'the collective client’s server replaced by its web stand-in');
});

test('mor-desk check: a server serving the release is SAME; one altering the script is caught on that file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'edubba-served-'));
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
    writeFileSync(join(dir, 'edubba.js'), readFileSync(join(dir, 'edubba.js'), 'utf8').replace('For testing only', 'For real'));
    assert.deepEqual(await check(url), ['edubba.js: not the released bytes']);
    const run = await new Promise<{ code: number | null; out: string }>((resolve) =>
      execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'check', url], { cwd: here }, (err, out) => resolve({ code: err ? ((err as { code?: number }).code ?? 1) : 0, out })),
    );
    assert.equal(run.code, 1);
    assert.match(run.out, /DIFFERS {2}edubba\.js: not the released bytes/);
  } finally {
    server.close();
  }
});

test('Edubba’s tint (H36), the same as on the Mac: the emerald of the Agreements layer, from the kit', () => {
  // Round 4: the kit holds each app's colours (`clients/kit`); Edubba keeps the emerald of the Agreements layer.
  assert.deepEqual(TINT, { layer: APPS.edubba.colour, pastel: APPS.edubba.pastel });
  assert.equal(TINT.layer, '#48c08c');
  assert.equal(readFileSync(join(BUILT, 'edubba.css'), 'utf8'), `${STYLE}\n`, 'the Mac page’s style, as it is');
  // H42: every list and feed in its own scrollable box.
  assert.match(STYLE, /\.e-in \.picks\{[^}]*max-height:[^;]+;overflow:auto/);
});

test('the web client’s operations: the ones it answers; everything of the agents, test collectives, money and folders refused in plain words', async () => {
  const relay = await start('relay');
  const home = await start('home');
  const store = new Store(mkdtempSync(join(tmpdir(), 'edubba-web-ops-')));
  const desk = new Desk(store);
  const real = new Real(desk, store);
  const run = operations(
    {
      store,
      desk,
      setup: new Setup(desk, store),
      real,
      after: new AfterKishib(desk, store, real),
      member: new Member(store, desk),
      publishing: new Publishing(desk, store, real),
      corrections: new Corrections(desk, store),
      collectives: new Collectives(join(store.dir, 'collective'), store),
      agents: null,
      access: null,
      money: null,
      folders: null,
      refuse: (_s, m) => new Error(m),
    },
    { web: true },
  );
  try {
    await run('settings', { homes: [home.base], relays: [relay.base], via: ['a.onion=127.0.0.1:1'], drafts: '/elsewhere' }, 'web');
    assert.deepEqual(store.settings().via, {}, 'no other way to reach an address on the web');
    const s = (await run('state', {}, 'web')) as { agents: unknown[]; machine: unknown; web: boolean; collectives: unknown[] };
    assert.deepEqual([s.agents, s.machine, s.web, s.collectives], [[], null, true, []]);
    // Round 4: Claude's drafts and the received piles are gone; the web refuses their names like any other.
    for (const op of ['drafts', 'waiting', 'agent add', 'machine look', 'shared key', 'agent prompt', 'identity', 'link', 'approve', 'resend', 'folders', 'money pay', 'money anchor', 'collective prepare', 'collective confirm', 'pair', 'code'])
      await assert.rejects(run(op, {}, 'web'), (e: Error) => e.message === ON_A_COMPUTER, op);
    await assert.rejects(run('real release prepare', { collective: 'x', folder: '/' }, 'web'), (e: Error) => e.message === RELEASE_ON_WEB);
    assert.equal(SAID, RELEASE_ON_WEB, 'the page and the operations say the same');
    for (const op of WEB_OPS) assert.ok(!/^(agent|machine|money|approve|pair|code|identity$)/.test(op), op);
  } finally {
    await relay.stop();
    await home.stop();
  }
});
