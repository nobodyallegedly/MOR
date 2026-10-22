// Damgar in a real browser (headless Chromium, fresh profiles), by clicks
// and typing alone, against real homes and a relay on local ports, on the
// Dubsar Suite's kit (round 3 of the redesign):
//
// - the program's page at a Mac's size: an identity brought by its words;
//   what is accepted; the four tiles and their danger marks (Waiting three,
//   Account one, Lanes two, Settings two); every tile's column; then the
//   three ways to pay from Dub, by clicks in Dub's page: by hand (copied in
//   Dub, pasted in Damgar's Waiting, read and signed there, the invoice paid
//   in the wallet, the proof pasted); Ask Damgar from a profile, Damgar
//   woken and its panel drawn inside Dub's window, unreadable from Dub,
//   authorised there; a lane with a cap per act and a cap in all, refused
//   past each in Dub, what is left in Dub's chooser and in Damgar's Lanes,
//   the record under the lanes in Damgar's Account, and an overspend shown;
//   the same page at a phone's size;
// - the web client at a phone's size and a Mac's: the banner in one line;
//   Make an identity, its chain key's words shown once and three typed back;
//   a collective under the identity acted as from the identity panel, its
//   part in Waiting; nothing of a chain key in the browser's storage;
// - Use one from Kišib: Damgar paired with Kišib's runner, an identity used
//   through it, a payment signed with Kišib's panel inside Damgar's window
//   (money always asks);
// - Edubba's pieces, and Kišib's vault fields.
//
// `MOR_SCREENSHOTS=DIR` keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Locator, type Page } from 'playwright-core';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { closeAll, damgar, dub, edubba, founded, kishib, moneyCollective, start, type Relay } from './world.ts';
import { FakeChain, addressScript } from './chain.ts';
import { StubLnd, TestNode } from './node.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import { ACCEPTABLE, SPEC } from '../src/specs.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
};
const MAC = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`) });
};

let homes: Relay[];
let relay: Relay;
const sites: Server[] = [];
let damgarWeb: string;
let browser: Browser;
const csp: string[] = [];
const problems: string[] = [];

async function serveBuilt(dist: string, policy: string): Promise<string> {
  const site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    if (req.method === 'POST' && path === '/csp') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        csp.push(body);
        res.end();
      });
      return;
    }
    try {
      if (!/^[a-z0-9_.-]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': `${policy}; report-uri /csp`, 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  sites.push(site);
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${(site.address() as { port: number }).port}`;
}

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  const d = mkdtempSync(join(tmpdir(), 'damgar-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', d], { cwd: here, stdio: 'ignore' });
  damgarWeb = await serveBuilt(d, policy);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const s of sites) await new Promise((r) => s.close(r));
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string, size = MAC): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: size });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  return { context, page };
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

/** Click, the earlier note cleared first, and wait for what the page says done. */
async function done(page: Page, button: Locator, name: string): Promise<string> {
  await page.evaluate(() => {
    const st = document.getElementById('status');
    if (st) st.innerHTML = '';
  });
  await button.click();
  await sees(page, '#status .k-note.k-done', name);
  return page.locator('#status').innerText();
}

const settled = (page: Page) => page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled), undefined, { timeout: 60_000 });

/** The four tiles: their names and danger levels, as drawn (decided on the mockups). */
async function tilesAre(page: Page) {
  await sees(page, '.k-tile', 'tiles');
  const t = await page.locator('.k-tile').evaluateAll((ts) => ts.map((x) => [x.querySelector('h2')!.textContent, [...x.classList].find((c) => /^k-d\d$/.test(c)), x.querySelector('.k-dm')!.getAttribute('title')]));
  assert.deepEqual(t, [
    ['Waiting', 'k-d3', 'danger 3 of 3'],
    ['Account', 'k-d1', 'danger 1 of 3'],
    ['Lanes', 'k-d2', 'danger 2 of 3'],
    ['Settings', 'k-d2', 'danger 2 of 3'],
  ]);
}

const COLUMNS: Record<string, string[]> = {
  waiting: ['To pay', 'To receive', '+ Paste an act to sign', 'To the vault'],
  account: ['Summary', 'Payments', 'Under the lanes', 'Anchors'],
  lanes: ['Asked', 'In force', 'Damgar’s own', 'Ended'],
  settings: ['Where you are paid', 'What you accept', 'Homes and relays', 'Every step by hand'],
};

/** Each tile opened, its column read, each part opened (a picture of each). */
async function columns(page: Page, tag: string, phone = false) {
  for (const [tab, labels] of Object.entries(COLUMNS)) {
    await page.locator('[data-action="home-tiles"]').click();
    await page.locator(`[data-k-tile="${tab}"]`).click();
    await sees(page, '.k-opened', `${tab}-opened`);
    if (phone) {
      // On a phone the tile opens on its first part; the back arrow brings the column.
      await page.locator('.k-pane .k-back').click();
      await shot(page, `${tag}-${tab}-column`);
    }
    const got = (await page.locator('.k-col [data-k-col]').allInnerTexts()).map((x) => x.split('\n')[0].trim());
    assert.deepEqual(got, labels, tab);
    for (const k of await page.locator('.k-col [data-k-col]').evaluateAll((bs) => bs.map((b) => (b as HTMLElement).dataset.kCol!))) {
      if (phone && k !== (await page.locator('.k-col [data-k-col]').first().getAttribute('data-k-col'))) continue;
      const label = (await page.locator(`.k-col [data-k-col="${k}"]`).innerText()).split('\n')[0].replace(/^\+ /, '').trim();
      await page.locator(`.k-col [data-k-col="${k}"]`).click();
      await sees(page, `#pane h2:text-is("${label}")`, `${tab}-${k}`);
      await settled(page);
      await shot(page, `${tag}-${tab}-${k}`);
      if (phone) await page.locator('.k-pane .k-back').click();
    }
  }
}

/** Accept every specification, by clicks, on the first screen that asks. */
async function acceptAll(page: Page) {
  await sees(page, 'form#accept', 'accept');
  for (const box of await page.locator('input[name=accept]').all()) await box.check();
  await page.getByRole('button', { name: 'Accept these' }).click();
  await sees(page, '.k-tile', 'tiles after accept');
}

/** Open a part by the top's tabs and the column. */
async function go(page: Page, tab: string, part: string) {
  if (await page.locator(`.k-tabs [data-tab="${tab}"]`).isVisible().catch(() => false)) await page.locator(`.k-tabs [data-tab="${tab}"]`).click();
  else {
    await page.locator('[data-action="home-tiles"]').click();
    await page.locator(`[data-k-tile="${tab}"]`).click();
  }
  await sees(page, '.k-opened', `${tab}`);
  if (await page.locator('.k-pane .k-back').isVisible()) await page.locator('.k-pane .k-back').click();
  const label = (await page.locator(`.k-col [data-k-col="${part}"]`).innerText()).split('\n')[0].replace(/^\+ /, '').trim();
  await page.locator(`.k-col [data-k-col="${part}"]`).click();
  // The part's own heading: the one shown before may still be on screen a moment.
  await sees(page, `#pane h2:text-is("${label}")`, `${tab}-${part}`);
  await settled(page);
}

/** In Dub's page: a card's act menu, an item. */
const actMenu = async (card: Locator, item: string) => {
  await card.locator('.k-actid').click();
  await card.page().getByRole('menuitem', { name: item, exact: true }).click();
};

const R_UNIT = SPEC.units.regtest;

test('Damgar on the kit, the program’s page by clicks at a Mac’s size and a phone’s: tiles, columns; the three ways to pay from Dub', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const node = new TestNode();
  // Bob: paid at his node; Alice: made in Dub, which knows her Damgar on this computer (Ask Damgar wakes it).
  const bobD = await damgar();
  const bob = await dub(H, R, { damgar: bobD.dir });
  await bobD.c.ask('bring', { id: bob.id, words: bob.words, address: H[0] });
  await bobD.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const rv = await bobD.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bobD.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await bob.c.ask('name', { name: 'Bob' });
  const bobPost = (await bob.c.ask<{ post: { id: string } }>('post', { text: 'A post worth a tip.' })).post.id;
  const ad = await damgar();
  const alice = await dub(H, R, { damgar: ad.dir });
  await alice.c.ask('name', { name: 'Alice' });
  await alice.c.ask('follow', { id: bob.id, name: 'Bob' });

  // Alice's Damgar, the program's page: its first screen, bring by her words, what she accepts.
  const { page: gp } = await open(`${ad.app.base}/#pair=${ad.app.access.newCode()}`);
  await sees(gp, 'form#bring', 'first screen');
  assert.deepEqual(await gp.locator('[data-add]').allInnerTexts(), ['Make one', 'Bring one', 'Use one from Kišib']);
  await shot(gp, 'mac-01-first-screen');
  await gp.locator('form#bring [name=id]').fill(alice.id);
  await gp.locator('form#bring [name=words]').fill(alice.words);
  await gp.locator('form#bring [name=address]').fill(H[0]);
  await gp.getByRole('button', { name: 'Bring it' }).click();
  await shot(gp, 'mac-02-accept');
  await acceptAll(gp);
  await tilesAre(gp);
  assert.match(await gp.locator('.k-me').innerText(), /Alice/);
  await shot(gp, 'mac-03-home');
  await columns(gp, 'mac');

  // The identity panel: Alice in use; + Add's three ways; her menu.
  await gp.locator('[data-k-open="identity"]').click();
  await sees(gp, '.k-panel [data-k-use]', 'panel');
  assert.match(await gp.locator('.k-panel').innerText(), /Alice/);
  await gp.locator('[data-k-add="toggle"]').click();
  assert.deepEqual((await gp.locator('.k-panel [data-k-add]:not([data-k-add="toggle"]) .k-n').allInnerTexts()), ['Make one', 'Bring one', 'Use one from Kišib']);
  await shot(gp, 'mac-04-identity-panel');
  await gp.locator('[data-k-idmenu]').first().click();
  assert.deepEqual((await gp.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Words', 'Line and homes', 'New words from Kišib', 'A collective under it', 'Remove from Damgar…']);
  await gp.getByRole('menuitem', { name: 'Remove from Damgar…' }).click();
  await sees(gp, '[data-k-remove]', 'remove said');
  assert.match(await gp.locator('[data-k-remove]').innerText(), /Damgar forgets .*signing words/);
  await shot(gp, 'mac-05-remove-said');
  await gp.locator('[data-k-remove-no]').click();
  await gp.keyboard.press('Escape');

  // Dub's page, Alice's.
  const { page: dp } = await open(`${alice.app.base}/#pair=${alice.app.access.newCode()}`);
  const modal = dp.locator('.k-modal');
  const theirs = dp.locator('#feed .k-act', { hasText: 'A post worth a tip.' });
  await theirs.waitFor({ timeout: 60_000 });

  // 1. By hand: a tip shown in Dub to copy; pasted in Damgar's Waiting, read in plain words, signed there.
  await actMenu(theirs, 'Tip');
  await modal.locator('form#pay').waitFor({ timeout: 60_000 });
  await modal.locator('input[name=value]').fill('700');
  await modal.locator('input[name=whatFor]').fill('by hand');
  await modal.locator('input[value=hand]').check();
  await modal.getByRole('button', { name: 'Tip' }).click();
  await modal.locator('textarea.dub-hand').waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /In Damgar: Waiting, \+ Paste an act to sign/);
  await shot(dp, 'dub-01-by-hand');
  const copied = await modal.locator('textarea.dub-hand').inputValue();
  await modal.locator('[data-k-popup="close"]').click();
  await go(gp, 'waiting', 'paste');
  await shot(gp, 'mac-10-paste');
  await gp.locator('form#paste textarea').fill(copied);
  await gp.locator('form#paste').getByRole('button', { name: 'Read it' }).click();
  await sees(gp, '#status .k-note.k-done', 'pasted');
  const pasted = gp.locator('#pane .k-act', { hasText: 'pasted by hand' });
  await pasted.waitFor();
  assert.match(await pasted.innerText(), /700 regtest satoshis[\s\S]*for “by hand”[\s\S]*On Lightning, to their flow/);
  await shot(gp, 'mac-11-pasted');
  await done(gp, pasted.getByRole('button', { name: 'Sign it' }), 'pasted signed');
  // Bob's Damgar makes the invoice (its own page is tested elsewhere); Alice's Waiting shows it to pay, the proof pasted back.
  await bobD.c.ask('look');
  const inv = (await bobD.c.ask<{ items: { id: string; kind: string; descriptionHash?: string }[] }>('to sign')).items.find((i) => i.kind === 'invoice')!;
  const made = node.invoice(700, inv.descriptionHash!);
  await bobD.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
  await gp.locator('[data-action="look"]').click();
  await sees(gp, '#pane form.paid', 'to pay');
  assert.ok((await gp.locator('#pane .damgar-copy').first().innerText()).includes(made.invoice));
  await shot(gp, 'mac-12-to-pay-invoice');
  await gp.locator('#pane form.paid [name=proof]').fill(made.preimage);
  assert.match(await done(gp, gp.getByRole('button', { name: 'Check it and sign my claim' }), 'claimed'), /says valid/);

  // 2. Ask Damgar, from Bob's profile: Damgar woken; its panel inside Dub's window, unreadable from Dub; authorised there.
  await theirs.locator('.k-signer').click();
  await dp.getByRole('menuitem', { name: 'Open profile', exact: true }).click();
  const prof = dp.locator('.k-prof');
  await prof.waitFor({ timeout: 60_000 });
  await prof.getByRole('button', { name: 'Pay' }).click();
  await modal.locator('form#pay[data-kind="pay"]').waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /Damgar pops up here/);
  await modal.locator('input[name=value]').fill('900');
  await modal.locator('input[name=whatFor]').fill('asked');
  await modal.locator('input[value=damgar]').check();
  await modal.getByRole('button', { name: 'Pay' }).click();
  const frame = await dp.waitForSelector('.k-frame.k-damgar iframe', { timeout: 60_000 });
  assert.match(await dp.textContent('.k-frame .k-by') ?? '', /Drawn by Damgar · Dub cannot read or change this frame/);
  assert.equal(await frame.getAttribute('sandbox'), 'allow-scripts allow-forms');
  const fl = dp.frameLocator('.k-frame iframe');
  await fl.locator('text=Damgar · woken by Dub').waitFor({ timeout: 60_000 });
  await fl.locator('text=900 regtest satoshis').first().waitFor();
  const reads = await dp.evaluate(() => {
    const f = document.querySelector<HTMLIFrameElement>('.k-frame iframe')!;
    try {
      return f.contentDocument ? 'readable' : 'null';
    } catch {
      return 'refused';
    }
  });
  assert.notEqual(reads, 'readable', 'Dub cannot read Damgar’s panel');
  // Dub's policy frames Kišib's and Damgar's origins, and nothing else.
  const policy = (await fetch(`${alice.app.base}/`)).headers.get('content-security-policy') ?? '';
  assert.ok((/frame-src ([^;]*);/.exec(policy)?.[1] ?? '').split(' ').includes(ad.app.base));
  await shot(dp, 'dub-02-damgar-panel');
  // It waits in Damgar's Waiting too, until authorised.
  await go(gp, 'waiting', 'to-pay');
  assert.match(await gp.locator('#pane').innerText(), /900 regtest satoshis/);
  await fl.locator('button:has-text("Authorise and sign")').click();
  await dp.waitForSelector('.k-frame', { state: 'detached', timeout: 60_000 });
  await dp.locator('#status .k-note', { hasText: 'Damgar signed it' }).waitFor({ timeout: 60_000 });
  await shot(dp, 'dub-03-damgar-signed');
  await prof.getByRole('button', { name: '← Back' }).click();

  // 3. A lane with a cap per act and a cap in all: asked in Dub, granted in Damgar's Lanes.
  await dp.locator('[data-k-open="identity"]').click();
  await dp.locator('[data-k-idmenu]').first().click();
  await dp.getByRole('menuitem', { name: /^A lane from Damgar/ }).click();
  const laneForm = modal.locator('form#lane');
  await laneForm.waitFor({ timeout: 60_000 });
  await laneForm.locator('[name=cap]').fill('2000');
  await laneForm.locator('[name=total]').fill('3000');
  await laneForm.getByRole('button', { name: 'Ask Damgar for this lane' }).click();
  await dp.locator('#status .k-note.k-done').waitFor({ timeout: 60_000 });
  await modal.locator('[data-k-popup="close"]').click().catch(() => undefined);
  await go(gp, 'lanes', 'asked');
  await gp.locator('[data-action="home-tiles"]').count();
  await gp.locator('#pane .k-act').waitFor({ timeout: 60_000 }).catch(async () => {
    await gp.locator('[data-k-col="asked"]').click();
  });
  assert.match(await gp.locator('#pane').innerText(), /In all: at most 3 000 regtest satoshis for the whole lane/);
  await shot(gp, 'mac-20-lane-asked');
  await done(gp, gp.getByRole('button', { name: 'Grant this lane' }), 'granted');
  // Dub: past the cap per act, refused; within it, 1 800 from the post and 1 000 from the profile; then the cap in all.
  const payLane = async (card: 'post' | 'profile', value: string, said: RegExp) => {
    if (card === 'post') await actMenu(theirs, 'Tip');
    else {
      await theirs.locator('.k-signer').click();
      await dp.getByRole('menuitem', { name: 'Open profile', exact: true }).click();
      await prof.getByRole('button', { name: 'Pay' }).click();
    }
    await modal.locator('form#pay').waitFor({ timeout: 60_000 });
    await modal.locator('input[value=lane]').check();
    await modal.locator('input[name=value]').fill(value);
    const text = await modal.innerText();
    await modal.getByRole('button', { name: card === 'post' ? 'Tip' : 'Pay' }).click();
    // Refused: said under Dub's top; signed under the lane: said in the chooser's pop-up, with the invoice to pay.
    await dp.locator('#status .k-note, .k-modal .k-mbody', { hasText: said }).first().waitFor({ timeout: 60_000 });
    await modal.locator('[data-k-popup="close"]').click().catch(() => undefined);
    if (card === 'profile') await prof.getByRole('button', { name: '← Back' }).click();
    return text;
  };
  await payLane('post', '2500', /above the grant’s cap of 2000 per act/);
  const first = await payLane('post', '1800', /under the lane/);
  assert.match(first, /In all: 3 000 regtest satoshis left of 3 000 regtest satoshis/);
  const second = await payLane('profile', '1000', /under the lane/);
  assert.match(second, /In all: 1 200 regtest satoshis left/);
  await actMenu(theirs, 'Tip');
  await modal.locator('form#pay').waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /In all: 200 regtest satoshis left of 3 000/);
  await shot(dp, 'dub-04-chooser-in-all');
  await modal.locator('[data-k-popup="close"]').click();
  await payLane('profile', '500', /would go past the lane’s cap in all of 3000: 200 left/);
  await shot(dp, 'dub-05-in-all-refused');
  // Damgar: what is left, and the record of Dub's payments under the lane.
  await go(gp, 'lanes', 'in-force');
  await gp.locator('#pane .damgar-lane', { hasText: 'In all' }).waitFor({ timeout: 60_000 });
  assert.match(await gp.locator('#pane .damgar-lane').first().innerText(), /In all\s*3 000 regtest satoshis · 2 800 regtest satoshis spent, 200 regtest satoshis left/);
  await shot(gp, 'mac-21-lane-in-all');
  await go(gp, 'account', 'under');
  assert.equal(await gp.locator('#pane .k-act').count(), 2);
  await shot(gp, 'mac-22-under-the-lanes');
  // A Dub ignoring the total (its record of it removed) pays within the cap per act; Damgar shows the overspend.
  const keysFile = join(alice.dir, 'identities', alice.id, 'money-keys.json');
  const keys = JSON.parse(readFileSync(keysFile, 'utf8'));
  for (const x of keys.lanes) delete x.total;
  writeFileSync(keysFile, JSON.stringify(keys));
  await alice.c.ask('pay', { how: 'lane', kind: 'pay', signer: bob.id, value: '1000', unit: R_UNIT });
  await go(gp, 'lanes', 'in-force');
  await gp.locator('#pane .damgar-over').waitFor({ timeout: 60_000 });
  assert.match(await gp.locator('#pane .damgar-over').innerText(), /overspent by 800 regtest satoshis/);
  await shot(gp, 'mac-23-overspent');
  // Account: the payments, each a card with its two menus.
  await go(gp, 'account', 'payments');
  const paidCard = gp.locator('#pane .k-act').first();
  await paidCard.locator('.k-actid').click();
  assert.deepEqual((await gp.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Copy act ID', 'Open what it answers', 'Why it’s valid']);
  await shot(gp, 'mac-24-act-menu');
  await gp.keyboard.press('Escape');
  await paidCard.locator('.k-signer').click();
  // Its signer: Alice herself (she signed the claim, or the invoice request): what you take, nothing to change.
  assert.deepEqual((await gp.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Copy ID', 'Copy ID link', 'Open profile']);
  await shot(gp, 'mac-25-signer-menu');
  await gp.keyboard.press('Escape');
  await go(gp, 'account', 'summary');
  assert.match(await gp.locator('#pane').innerText(), /Went out \(verified\)/);
  await shot(gp, 'mac-26-summary');

  // The same page at a phone's size: the tiles stacked, each column first, a part with its back arrow.
  const { page: pp } = await open(`${ad.app.base}/#pair=${ad.app.access.newCode()}`, PHONE);
  await tilesAre(pp);
  await shot(pp, 'phone-01-home');
  await columns(pp, 'phone', true);
  await pp.locator('[data-k-open="identity"]').click();
  await sees(pp, '.k-panel', 'phone panel');
  await shot(pp, 'phone-02-identity-panel');
  assert.deepEqual(problems, []);
});

test('the web client by clicks, at a phone’s size and a Mac’s: Make an identity; a collective under it acted as from the identity panel; nothing of a chain key kept', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const { context: wc, page: wp } = await open(`${damgarWeb}/`, PHONE);
  await sees(wp, '[data-add="make"]', 'web first screen');
  // The banner in one line, its "?" opening the risks.
  assert.match(await wp.locator('#for-testing-only summary').innerText(), /^For testing only\. Test identities and test networks only, until MOR is frozen\. No real money\. Damgar holds no wallet\./);
  await wp.locator('#for-testing-only summary').click();
  assert.match(await wp.locator('#for-testing-only').innerText(), /could copy its signing key, and the on-chain request key Damgar makes/);
  await wp.locator('#for-testing-only summary').click();
  assert.ok(await wp.locator('[data-add="kishib"]').isDisabled(), 'never in the web client');
  // Make an identity: its chain key's words shown once, three typed back.
  await wp.locator('[data-add="make"]').click();
  await wp.locator('form#make [name=homes]').fill(H.join('\n'));
  await wp.locator('form#make [name=relays]').fill(R.join('\n'));
  await wp.getByRole('button', { name: 'Make it' }).click();
  await sees(wp, 'form#make-confirm', 'words');
  const words = await wp.locator('.k-words span').evaluateAll((ss) => ss.map((x) => x.lastChild!.textContent!));
  assert.equal(words.length, 24);
  await shot(wp, 'phone-web-01-make-words');
  for (const inp of await wp.locator('form#make-confirm input').all()) {
    const n = Number((await inp.getAttribute('name'))!.slice(1));
    await inp.fill(words[n - 1]);
  }
  await wp.getByRole('button', { name: 'Publish it' }).click();
  await acceptAll(wp);
  await tilesAre(wp);
  await shot(wp, 'phone-web-02-home');
  // The browser's storage: the signing key, as said; never the chain key.
  const kept = await wp.evaluate(async () => {
    const db: IDBDatabase = await new Promise((res, rej) => {
      const r = indexedDB.open('damgar');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const all: unknown[] = await new Promise((res) => {
      const r = db.transaction('keep').objectStore('keep').getAll();
      r.onsuccess = () => res(r.result);
    });
    return JSON.stringify(all);
  });
  assert.ok(!kept.includes(words.join(' ')) && !/"seeds":"[0-9a-f]+"/.test(kept), 'no chain key kept');
  await wc.close();

  // A collective whose Money area A holds, brought into the web client at a Mac's size; acted as from the identity panel.
  const e = await edubba(H, R);
  const { A, col } = await moneyCollective(H, R, e);
  const { context: mc, page: mp } = await open(`${damgarWeb}/`, MAC);
  await sees(mp, 'form#bring', 'web bring');
  await mp.locator('form#bring [name=id]').fill(A.id);
  await mp.locator('form#bring [name=words]').fill(A.words);
  await mp.locator('form#bring [name=address]').fill(H[0]);
  await mp.getByRole('button', { name: 'Bring it' }).click();
  await acceptAll(mp);
  await shot(mp, 'mac-web-01-home');
  await mp.locator('[data-k-open="identity"]').click();
  await mp.locator('[data-k-idmenu]').first().click();
  await mp.getByRole('menuitem', { name: 'A collective under it' }).click();
  await mp.locator('form#collective-add [name=id]').fill(col);
  await mp.locator('form#collective-add').getByRole('button', { name: 'Act for it' }).click();
  await mp.locator('.k-mbody .k-note.k-done').waitFor({ timeout: 60_000 });
  await mp.locator('[data-k-popup="close"]').click();
  await mp.locator('[data-k-open="identity"]').click();
  const under = mp.locator('.k-panel [data-k-under]');
  await under.waitFor({ timeout: 60_000 });
  // Named by its display name where it has one; this one has none, so by its short ID.
  const colShort = (await under.innerText()).match(/mid1\w{3}…\w{3}/)![0];
  assert.match(await under.innerText(), /collective/);
  await shot(mp, 'mac-web-02-panel-collective');
  await under.click();
  // Acting as it: shown top right beside its member; Waiting gains its part.
  await sees(mp, '#pane form.collective-promise', 'for the collective');
  const me = await mp.locator('.k-me').innerText();
  assert.ok(me.includes(colShort), `${me} / ${colShort}`);
  assert.ok((await mp.locator('.k-col').innerText()).includes(`For ${colShort}`));
  // Its promise to pay is read back and signed there (`collective.test.ts` signs them through the program).
  assert.match(await mp.locator('#pane').innerText(), /Its Money area, “Money”: 2 holders, 1 key; above 10,000 an act, one more/);
  await shot(mp, 'mac-web-03-for-the-collective');
  // The same gesture again: back to A alone.
  await mp.locator('[data-k-open="identity"]').click();
  await mp.locator('.k-panel [data-k-under]').click();
  await mp.waitForFunction(() => !/For mid1/.test(document.querySelector('.k-col')?.textContent ?? ''));
  await mc.close();
  assert.deepEqual(problems, []);
  assert.deepEqual(csp, []);
});

test('Use one from Kišib: Damgar paired with Kišib’s runner; a payment signed with Kišib’s panel inside Damgar’s window, money always asking', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const node = new TestNode();
  const bobD = await damgar();
  const bob = await dub(H, R, { damgar: bobD.dir });
  await bobD.c.ask('bring', { id: bob.id, words: bob.words, address: H[0] });
  await bobD.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const rv = await bobD.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bobD.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  // Max: made in Dub; Kišib's runner on, holding Max's signing key.
  const max = await dub(H, R);
  await max.c.ask('name', { name: 'Max' });
  const k = await kishib();
  await k.c.ask('runner on', { read: true, passphrase: 'test passphrase, not a real one', again: 'test passphrase, not a real one' });
  await k.c.ask('runner give', { id: max.id, address: H[0], words: max.words });
  // Max's Damgar, beside that Kišib: its first screen, Use one from Kišib.
  const g = await damgar(null, undefined, { kishib: k.dir });
  const { page: gp } = await open(`${g.app.base}/#pair=${g.app.access.newCode()}`);
  await sees(gp, '[data-add="kishib"]', 'first');
  await gp.locator('[data-add="kishib"]').click();
  await gp.locator('[data-action="runner-pair"]').click();
  await sees(gp, '[data-action="runner-look"]', 'code');
  const code = /([0-9A-Z]{4}-[0-9A-Z]{4})/.exec(await gp.locator('#first-part').innerText())![1];
  await shot(gp, 'mac-30-kishib-code');
  // Approved in Kišib, comparing the code, Damgar allowed to open what is sealed to Max.
  const st = await k.c.ask<{ apps: { id: string; code: string; name: string }[] }>('runner state');
  const app = st.apps.find((x) => x.code === code)!;
  assert.equal(app.name, 'Damgar');
  await k.c.ask('runner approve', { pairing: app.id, identities: [max.id], opens: [max.id] });
  await gp.locator('[data-action="runner-look"]').click();
  await gp.locator(`[data-runner-take="${max.id}"]`).click();
  // What Max accepts is sealed to Max: signed through Kišib too, its panel in Damgar's window.
  await sees(gp, 'form#accept', 'accept through Kišib');
  for (const box of await gp.locator('input[name=accept]').all()) await box.check();
  await gp.getByRole('button', { name: 'Accept these' }).click();
  await gp.waitForSelector('.k-frame.k-kishib iframe', { timeout: 60_000 });
  await gp.frameLocator('.k-frame iframe').locator('button:has-text("Sign it")').click();
  await sees(gp, '.k-tile', 'tiles through Kišib');
  assert.match(await gp.locator('.k-me').innerText(), /Max/);
  // A tip prepared in Max's Dub (which holds the key there), found here through Kišib's opening.
  const post = (await bob.c.ask<{ post: { id: string } }>('post', { text: 'For Max to tip.' })).post.id;
  await max.c.ask('tip', { post, signer: bob.id, value: '400', unit: R_UNIT });
  await go(gp, 'waiting', 'to-pay');
  await gp.locator('[data-action="look"]').click();
  const item = gp.locator('#pane .k-act', { hasText: '400 regtest satoshis' });
  await item.waitFor({ timeout: 60_000 });
  // Signing it: Kišib's panel, drawn inside Damgar's window; money always asks.
  await gp.evaluate(() => {
    const st = document.getElementById('status');
    if (st) st.innerHTML = '';
  });
  await item.getByRole('button', { name: 'Sign it' }).click();
  await gp.waitForSelector('.k-frame.k-kishib iframe', { timeout: 60_000 });
  assert.match(await gp.textContent('.k-frame .k-by') ?? '', /Drawn by Kišib · Damgar cannot read or change this frame/);
  const fl = gp.frameLocator('.k-frame iframe');
  await fl.locator('text=Damgar asks Kišib to sign').waitFor({ timeout: 60_000 });
  assert.equal(await fl.locator('input[name=always]').count(), 0, 'money always asks: no standing yes offered');
  await shot(gp, 'mac-31-kishib-panel');
  await fl.locator('button:has-text("Sign it")').click();
  await gp.locator('#status .k-note.k-done', { hasText: 'invoice request was sent' }).waitFor({ timeout: 60_000 });
  assert.deepEqual(problems, []);
});

test('Edubba’s pieces by clicks: a payment prepared for Damgar; a collective’s act anchored, its service’s offer read; Kišib’s vault fields', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  chain.mine(5);
  const lnd = new StubLnd(chain, addressScript);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'damgar-svc-')), 'svc'), lnd, chain, { homes: H, relays: R });
  await svc.start();
  const e = await edubba(H, R, chain);
  const { f, col } = await founded(H, R, e);
  await e.c.ask('acting as', { id: f.id });
  const { page: ep } = await open(`${e.app.base}/#pair=${e.app.access.newCode()}`);
  // Identities tab: pay someone.
  await sees(ep, 'button[data-tab=identities], [data-tab=identities]', 'edubba');
  await ep.locator('[data-tab=identities]').first().click();
  await sees(ep, '#e-pay', 'edubba-pay');
  await ep.locator('#e-pay > summary').click();
  await ep.locator('form#pay-someone [name=to]').fill(svc.id);
  await ep.locator('form#pay-someone [name=value]').fill('42');
  await ep.locator('form#pay-someone [name=whatFor]').fill('a thank you');
  await shot(ep, 'edubba-pay-someone');
  await ep.locator('form#pay-someone').getByRole('button', { name: 'Prepare it for Damgar' }).click();
  await sees(ep, 'form#pay-someone .note.done', 'edubba-paid');
  assert.match(await ep.locator('form#pay-someone .note.done').innerText(), /Prepared, not signed/);
  // Collectives tab: the anchor of one of its acts, the service's offer read, a tier chosen.
  await ep.locator('[data-tab=collectives]').first().click();
  await sees(ep, '#e-real-anchor', 'edubba-collective');
  await ep.locator('#e-real-anchor > summary').click();
  await ep.locator('form#anchor-offers [name=service]').fill(svc.id);
  await ep.locator('form#anchor-offers').getByRole('button', { name: 'Read its offer' }).click();
  await sees(ep, 'form.anchor-ask', 'edubba-offer');
  await shot(ep, 'edubba-anchor-offer');
  await ep.getByRole('button', { name: 'Prepare the payment for Damgar' }).click();
  await sees(ep, 'form.anchor-ask .note.done', 'edubba-anchored');
  await sees(ep, '#e-anchors .item', 'edubba-anchors');
  await shot(ep, 'edubba-anchors');
  // The founder's Damgar holds both drafts.
  const g = await damgar(chain);
  await g.c.ask('bring', { id: f.id, words: f.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  await g.c.ask('look');
  const items = (await g.c.ask<{ items: { app: string | null; title: string }[] }>('to sign')).items;
  assert.deepEqual(items.map((i) => [i.app, i.title]).sort(), [['Edubba', 'A payment for an anchor'], ['Edubba', 'A payment to make']]);

  // Kišib: the change of keys, its vault fields.
  const k = await kishib();
  const { page: kp } = await open(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  // Paper's tile, its quiet door, then Change keys.
  await kp.click('[data-k-tile="paper"]');
  await kp.click('[data-action="open-door"]');
  await kp.click('[data-k-col="rotate"]');
  await sees(kp, 'form#form-rotate', 'kishib-rotate');
  await kp.locator('form#form-rotate details', { hasText: 'The vault' }).locator('summary').click();
  assert.ok((await kp.locator('form#form-rotate [name=vaultUnit] option').allInnerTexts()).some((t) => /regtest satoshis/.test(t)));
  await kp.locator('form#form-rotate [name=vault]').selectOption('set');
  await shot(kp, 'kishib-vault');
  void SPEC;
  assert.deepEqual(problems, []);
});
