// Kišib's half, by clicks, in its web client (the same page the program
// shows, its code in the browser): "Change keys with Nakišib" (everything
// read back, the request written to a file, Nakišib's answer read, checked
// and sent, the new signing key's words once it counts) and "Make an identity
// with Nakišib" (the commitment read, the genesis made from it, read back at
// the homes). Kišib's own WebAssembly for the Module's online side is
// fetched beside the page, within its content security policy. Nakišib is
// asked as its page asks it. Said beside each way: what the offline way
// protects, and that it is optional. MOR_SCREENSHOTS=DIR keeps the screens.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { lookUp } from '../../genesis/src/lookup.ts';
import { contentSecurityPolicy } from '../../kishib/src/web/headers.ts';
import { closeAll, dub, nakisib, start, stopAll, walkPaper, type Relay } from './world.ts';

const kishibDir = fileURLToPath(new URL('../../kishib/', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHOTS = process.env.MOR_SCREENSHOTS;
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png' };
let homes: Relay[];
let relay: Relay;
let site: Server;
let web: string;
let browser: Browser;
const refusedByPolicy: string[] = [];
const files = mkdtempSync(join(tmpdir(), 'nakisib-stick-'));
const stick = (name: string) => join(files, name);

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const out = mkdtempSync(join(tmpdir(), 'kishib-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', out], { cwd: kishibDir, stdio: 'ignore' });
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    if (req.method === 'POST' && path === '/csp') {
      let b = '';
      req.on('data', (c) => (b += c));
      req.on('end', () => (refusedByPolicy.push(b), res.end()));
      return;
    }
    const name = path === '/' ? 'index.html' : path.slice(1);
    try {
      if (!/^[a-z0-9_.-]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(out, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': `${policy}; report-uri /csp`, 'x-content-type-options': 'nosniff' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  web = `http://127.0.0.1:${(site.address() as { port: number }).port}/`;
  browser = await chromium.launch({ executablePath: CHROMIUM });
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
});

after(async () => {
  await browser?.close();
  await stopAll();
  await closeAll();
  await new Promise((r) => site?.close(r));
  for (const h of [...(homes ?? []), relay]) await h?.stop();
});

const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  await page.evaluate(() => document.getElementById('pane')?.scrollTo(0, 0));
  await page.screenshot({ path: join(SHOTS, `kishib-nakisib-${name}.png`), fullPage: true });
};

async function failFast(page: Page, wait: Promise<unknown>) {
  const err = page.locator('#status .k-note.k-error');
  await Promise.race([wait, err.waitFor({ timeout: 60_000 }).then(async () => assert.fail(await err.innerText()))]);
}

async function go(page: Page, tab: string, part: string) {
  if (await page.locator(`[data-k-tile="${tab}"]`).count()) await page.click(`[data-k-tile="${tab}"]`);
  else await page.click(`[data-tab="${tab}"]`);
  if (await page.locator('#door').count()) await page.click('[data-action="open-door"]');
  await page.click(`[data-k-col="${part}"]`);
}

/** The new signing key's words, shown once it counts, written, three typed back. */
async function signingWords(page: Page) {
  await failFast(page, page.locator('[data-action="refresh"], [data-action="show words"]').first().waitFor());
  for (let i = 0; i < 10 && !(await page.getByRole('button', { name: /signing key’s words/ }).count()); i++) {
    await page.click('[data-action="refresh"]');
    await page.waitForTimeout(300);
  }
  await page.getByRole('button', { name: /signing key’s words/ }).click();
  await page.locator('#words').waitFor();
  const words = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.?\s*/, '').trim());
  await page.click('[data-action="written"]');
  await page.locator('form#typed').waitFor();
  const inputs = page.locator('form#typed input');
  const names = await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name));
  for (const [i, n] of names.entries()) await inputs.nth(i).fill(words[Number(n.slice(1)) - 1]);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('button', { name: 'Done' }).waitFor();
}

test('Kišib’s web client: change keys with Nakišib, and make an identity with Nakišib, by clicks', async () => {
  const H = homes.map((h) => h.base);
  const d = await dub(H, [relay.base]);
  const n = await nakisib();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
  // The browser's own save dialog cannot be answered headless: the download path instead (the page falls back to it).
  await context.addInitScript(() => delete (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker);
  const page = await context.newPage();
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text()) && problems.push(m.text()));
  await page.goto(web);

  // Change keys with Nakišib: read back, nothing about a paper; what it protects, and that it is optional.
  await go(page, 'paper', 'nakisib');
  await page.getByRole('heading', { name: 'Change keys with Nakišib' }).waitFor();
  const said = await page.locator('#nakisib-say').innerText();
  assert.match(said, /the chain key never touches a connected device/);
  assert.match(said, /Optional: Kišib’s own way, the paper typed here, stays as it is/);
  assert.equal(await page.locator('#form-nakisib textarea[name=words]').count(), 0, 'no paper typed here');
  await shot(page, '1-form');
  await page.fill('#form-nakisib [name=id]', d.id);
  await page.fill('#form-nakisib [name=address]', H[0]);
  await page.click('#form-nakisib button[type=submit]');
  await failFast(page, page.getByRole('heading', { name: /with Nakišib$/ }).first().waitFor());
  await shot(page, '2-review');
  await page.click('[data-action="sign"]');
  await failFast(page, page.getByRole('button', { name: 'Write the request for Nakišib' }).waitFor());
  await shot(page, '3-request');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="nakisib write"]')]);
  await download.saveAs(stick('request.mor'));
  assert.match(download.suggestedFilename(), /^nakisib-request-[0-9a-f]{8}\.mor$/);

  // Nakišib, on the offline Mac.
  await n.ask('read', { path: stick('request.mor') });
  await n.ask('paper', { words: d.chainWords.join(' ') });
  await walkPaper(n, false);
  const signed = await n.ask<{ act: string }>('sign', { word: 'SIGN' });
  await n.ask('write', { path: stick('answer.mor') });

  // Back in Kišib: the answer read, checked, sent; counting; the new signing key's words.
  await page.setInputFiles('#nakisib-answer input[name=answer]', stick('answer.mor'));
  await page.click('#nakisib-answer button[type=submit]');
  await failFast(page, page.getByText(/exactly the change Kišib asked for/).waitFor());
  await shot(page, '4-answer');
  await signingWords(page);
  await shot(page, '5-done');
  assert.equal((await lookUp(d.id, H)).resolution.links[1].act, signed.act);
  await page.click('[data-action="forget"]');

  // Make an identity with Nakišib.
  await n.ask('forget');
  await n.ask('first', { module: 'words' });
  await walkPaper(n, false);
  const ready = await n.ask<{ commit: string }>('state');
  await n.ask('write', { path: stick('commitment.mor') });
  await page.click('[data-action="home-tiles"]');
  await go(page, 'identities', 'make-nakisib');
  await page.getByRole('heading', { name: 'Make an identity with Nakišib' }).waitFor();
  assert.match(await page.locator('#nakisib-say').innerText(), /Optional/);
  await page.setInputFiles('#form-make input[name=commitment]', stick('commitment.mor'));
  await page.fill('#form-make [name=homes]', H.join('\n'));
  await page.fill('#form-make [name=relays]', relay.base);
  await shot(page, '6-make-form');
  await page.click('#form-make button[type=submit]');
  await failFast(page, page.getByText(ready.commit).waitFor());
  await shot(page, '7-make-review');
  await page.click('[data-action="sign"]');
  await signingWords(page);
  await shot(page, '8-made');

  assert.deepEqual(problems, []);
  assert.deepEqual(refusedByPolicy, [], 'nothing the content security policy refused');
  await context.close();
});
