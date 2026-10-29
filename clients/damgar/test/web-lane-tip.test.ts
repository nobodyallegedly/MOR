// H107 (hand test v3): a tip under Dub's lane, across web clients, by
// clicks alone, as Nobody, allegedly, walked it: Alice on the iPad in Dub's
// and Damgar's web clients, Bob on the iPhone in Damgar's. Alice asks for a
// lane in Dub, grants it in Damgar, tips Bob's post under it in Dub; the
// invoice request must reach Bob: found in his Damgar's Waiting › To
// receive. And Alice's Damgar, Account › Under the lanes, says the stage
// first: "Asked: waiting for Bob's invoice", not paid. Real homes and a
// relay on local ports; test identities only, made here.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { closeAll, damgar, dub, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import { ACCEPTABLE } from '../src/specs.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
};
const IPAD = { width: 820, height: 1180 };
const IPHONE = { width: 390, height: 844 };
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `lane-tip-${name}.png`) });
};

let homes: Relay[];
let relay: Relay;
const sites: Server[] = [];
let damgarWeb: string;
let dubWeb: string;
let browser: Browser;
const problems: string[] = [];

function serveBuilt(dist: string, policy: string, json?: string): Promise<string> {
  const site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    if (json && name === 'dub.json') {
      res.writeHead(200, { 'content-type': TYPES['.json'] });
      res.end(json);
      return;
    }
    try {
      if (!/^[a-z0-9_.-]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': policy, 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  sites.push(site);
  return new Promise((r) => site.listen(0, '127.0.0.1', () => r(`http://127.0.0.1:${(site.address() as { port: number }).port}`)));
}

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  const d = mkdtempSync(join(tmpdir(), 'damgar-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', d], { cwd: here, stdio: 'ignore' });
  damgarWeb = await serveBuilt(d, policy);
  const u = mkdtempSync(join(tmpdir(), 'dub-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', u], { cwd: join(here, '..', 'dub'), stdio: 'ignore' });
  dubWeb = await serveBuilt(u, policy, JSON.stringify({ homes: homes.map((h) => h.base), relays: [relay.base] }));
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const s of sites) await new Promise((r) => s.close(r));
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string, size: { width: number; height: number }): Promise<Page> {
  const context = await browser.newContext({ viewport: size, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  return page;
}

/** Wait for an element, or fail at once with what the page said. */
async function sees(page: Page, selector: string, name: string, timeout = 60_000) {
  const err = page.locator('#status .k-note.k-error');
  try {
    await Promise.race([page.locator(selector).first().waitFor({ timeout }), err.waitFor({ timeout }).then(async () => assert.fail(await err.innerText()))]);
  } catch (e) {
    await shot(page, `failed-${name}`);
    console.error(`at ${name}:`, (await page.locator('body').innerText()).slice(-1500));
    throw e;
  }
}

/** Damgar's web client: an identity brought by its signing words, everything accepted. */
async function damgarBrings(page: Page, id: string, words: string) {
  await sees(page, 'form#bring', 'bring');
  await page.locator('form#bring [name=id]').fill(id);
  await page.locator('form#bring [name=words]').fill(words);
  await page.locator('form#bring [name=address]').fill(homes[0].base);
  await page.getByRole('button', { name: 'Bring it' }).click();
  await sees(page, 'form#accept, .k-tile', 'accept');
  if (await page.locator('form#accept').count()) {
    for (const box of await page.locator('input[name=accept]').all()) await box.check();
    await page.getByRole('button', { name: 'Add these to my list' }).click();
  }
  await sees(page, '.k-tile', 'tiles');
}

/** Open a part of Damgar by its tile and column. */
async function go(page: Page, tile: string, part: string) {
  await page.evaluate(() => {
    const st = document.getElementById('status');
    if (st) st.innerHTML = '';
  });
  await page.locator('[data-action="home-tiles"]').click();
  await page.locator(`[data-k-tile="${tile}"]`).click();
  await sees(page, '.k-opened', tile);
  if (await page.locator('.k-pane .k-back').isVisible()) await page.locator('.k-pane .k-back').click();
  await page.locator(`.k-col [data-k-col="${part}"]`).click();
  await page.locator('#pane .damgar-looking').waitFor({ state: 'detached', timeout: 60_000 });
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled), undefined, { timeout: 60_000 });
}

test('H107: a tip under Dub’s lane, from Dub’s and Damgar’s web clients on the iPad, reaches Bob’s Damgar web client on the iPhone, in Waiting › To receive', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const node = new TestNode();
  // Bob: made in a Dub, paid at his node (his payee pointer), a post worth a tip.
  const bob = await dub(H, R);
  const bobD = await damgar();
  await bobD.c.ask('bring', { id: bob.id, words: bob.words, address: H[0] });
  await bobD.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const rv = await bobD.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bobD.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await bob.c.ask('name', { name: 'Bob' });
  await bob.c.ask('post', { text: 'A post worth a tip.' });
  // Alice: her words, carried into Dub's and Damgar's web clients.
  const alice = await dub(H, R);
  await alice.c.ask('name', { name: 'Alice' });
  await alice.c.ask('follow', { id: bob.id, name: 'Bob' });

  // Alice's Dub web client, on the iPad: brought by her words.
  const dp = await open(`${dubWeb}/`, IPAD);
  await sees(dp, 'form#bring', 'dub bring');
  await dp.locator('form#bring input[name=id]').fill(alice.id);
  await dp.locator('form#bring textarea[name=words]').fill(alice.words);
  await dp.locator('form#bring input[name=address]').fill(H[0]);
  await dp.locator('form#bring').getByRole('button', { name: 'Bring it' }).click();
  await dp.locator('#status .k-note.k-done', { hasText: 'The identity is here' }).waitFor({ timeout: 60_000 });
  // Alice's Damgar web client, on the iPad; Bob's, on the iPhone.
  const ap = await open(`${damgarWeb}/`, IPAD);
  await damgarBrings(ap, alice.id, alice.words);
  const bp = await open(`${damgarWeb}/`, IPHONE);
  await damgarBrings(bp, bob.id, bob.words);

  // The lane: asked in Dub, granted in Damgar.
  const modal = dp.locator('.k-modal');
  await dp.locator('[data-k-open="identity"]').click();
  await dp.locator('[data-k-idmenu]').first().click();
  await dp.getByRole('menuitem', { name: /^A lane from Damgar/ }).click();
  const laneForm = modal.locator('form#lane');
  await laneForm.waitFor({ timeout: 60_000 });
  await laneForm.locator('[name=cap]').fill('2000');
  await laneForm.getByRole('button', { name: 'Ask Damgar for this lane' }).click();
  await dp.locator('#status .k-note.k-done').waitFor({ timeout: 60_000 });
  await modal.locator('[data-k-popup="close"]').click().catch(() => undefined);
  await go(ap, 'lanes', 'asked');
  await sees(ap, '#pane button:has-text("Grant this lane")', 'lane asked', 60_000).catch(async () => {
    await ap.locator('[data-action="look"]').first().click().catch(() => undefined);
    await sees(ap, '#pane button:has-text("Grant this lane")', 'lane asked');
  });
  await ap.getByRole('button', { name: 'Grant this lane' }).click();
  await sees(ap, '#status .k-note.k-done', 'granted');

  // The tip, from Bob's post in Alice's Dub, under the lane: twice, as he did.
  const theirs = dp.locator('#feed .k-act', { hasText: 'A post worth a tip.' });
  await theirs.waitFor({ timeout: 60_000 });
  for (const n of [1, 2]) {
    await theirs.locator('.k-actid').click();
    await dp.getByRole('menuitem', { name: 'Tip', exact: true }).click();
    await modal.locator('form#pay').waitFor({ timeout: 60_000 });
    await modal.locator('input[value=lane]').check();
    await modal.locator('input[name=value]').fill('280');
    await modal.getByRole('button', { name: 'Tip' }).click();
    await dp.locator('#status .k-note, .k-modal .k-mbody', { hasText: /under the lane/ }).first().waitFor({ timeout: 60_000 });
    await shot(dp, `dub-tipped-${n}`);
    await modal.locator('[data-k-popup="close"]').click().catch(() => undefined);
  }

  // Bob's Damgar, on the iPhone: both requests in Waiting › To receive, an invoice to make for each.
  await go(bp, 'waiting', 'to-receive');
  await bp.locator('#pane [data-action="look"]').click();
  await bp.waitForFunction(() => document.querySelectorAll('#pane .k-act').length >= 2, undefined, { timeout: 60_000 }).catch(async (e) => {
    await shot(bp, 'failed-to-receive');
    console.error((await bp.locator('body').innerText()).slice(-2000));
    throw e;
  });
  const received = await bp.locator('#pane').innerText();
  assert.match(received, /280 regtest satoshis/);
  await shot(bp, 'bob-to-receive');

  // Alice's Damgar: under the lanes, each card says its stage first; nothing reads as paid.
  await go(ap, 'account', 'under');
  await sees(ap, '#pane .k-act', 'under the lanes');
  const under = await ap.locator('#pane').innerText();
  assert.match(under, /Asked: waiting for Bob’s invoice/);
  assert.doesNotMatch(under, /Paid: its claim/);
  assert.match(under, /Paid: none yet · Asked, not paid yet: 2, 560 regtest satoshis/);
  await shot(ap, 'alice-under-the-lanes');
  assert.deepEqual(problems, []);
});
