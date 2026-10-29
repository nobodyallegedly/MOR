// Damgar's rows of fix round 7 that change what a person does, by clicks
// (hand test v3): H92, Where you are paid, the rail chosen first from the
// rail Modules accepted, each rail its own card with its own fields, + Add a
// rail, Remove, the pointer read back and published with only those rails;
// H100, the rails and currencies an identity takes, on its profile (Dub's,
// read from its payee pointer); H117, an invoice to pay handed to the
// person's wallet: Open in wallet (a lightning: link) and its QR, and a
// WebLN wallet in the browser offered first, its proof taken back by
// itself, the claim signed. Real homes and a relay; a test node; test
// identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { closeAll, damgar, dub, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import { ACCEPTABLE, SPEC } from '../src/specs.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;

let homes: Relay[];
let relay: Relay;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string, init?: string): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  if (init) await context.addInitScript(init);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  return { context, page };
}

const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `wallet-${name}.png`) });
};

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

/** Open a part by the tiles and the column; wait until it is filled in (H115). */
async function go(page: Page, tab: string, part: string) {
  await page.locator('[data-action="home-tiles"]').click();
  await page.locator(`[data-k-tile="${tab}"]`).click();
  await sees(page, '.k-opened', tab);
  const label = (await page.locator(`.k-col [data-k-col="${part}"]`).innerText()).split('\n')[0].replace(/^\+ /, '').trim();
  await page.locator(`.k-col [data-k-col="${part}"]`).click();
  await sees(page, `#pane h2:text-is("${label}")`, `${tab}-${part}`);
  await page.locator('#pane .damgar-looking').waitFor({ state: 'detached', timeout: 60_000 });
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled), undefined, { timeout: 60_000 });
}


test('H92, H100, H117: the rail chosen first; the rails taken on the profile; an invoice handed to the wallet, WebLN first', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const node = new TestNode();
  const bobD = await damgar();
  const bob = await dub(H, R, { damgar: bobD.dir });
  await bobD.c.ask('bring', { id: bob.id, words: bob.words, address: H[0] });
  await bobD.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });

  // H92: Bob's Where you are paid, by clicks: the rail first, then its fields alone.
  const { context: bc, page: bp } = await open(`${bobD.app.base}/#pair=${bobD.app.access.newCode()}`);
  await sees(bp, '.k-tile', 'tiles');
  await go(bp, 'settings', 'paid');
  await bp.locator('#rails-fold > summary').click();
  const add = bp.locator('form#rails select[name="rail-add"]');
  await add.waitFor();
  assert.deepEqual(await add.locator('option').allInnerTexts(), ['Lightning rail', 'On-chain rail'], 'the rail Modules accepted');
  assert.equal(await bp.locator('form#rails input[name=lightning], form#rails input[name=onchain]').count(), 0, 'no rail\'s fields before a rail is chosen');
  await add.selectOption('lightning');
  await bp.locator('[data-action="rail-add"]').click();
  await bp.locator('[data-rail-card="lightning"] input[name=lightning]').waitFor();
  assert.equal(await bp.locator('form#rails input[name=onchain]').count(), 0, 'only the chosen rail\'s fields');
  await bp.locator('[data-rail-card="lightning"] input[name=lightning]').fill(node.key);
  // + Add a rail: the other one, then removed; what was typed stays.
  await bp.getByRole('button', { name: '+ Add a rail' }).click();
  await bp.locator('[data-rail-card="onchain"] input[name=onchain]').waitFor();
  assert.deepEqual(await bp.locator('[data-rail-card] h4').allInnerTexts(), ['1. Lightning rail', '2. On-chain rail']);
  await shot(bp, 'h92-two-rails');
  await bp.locator('[data-rail-card="onchain"] [data-action="rail-remove"]').click();
  await bp.locator('[data-rail-card="onchain"]').waitFor({ state: 'detached' });
  assert.equal(await bp.locator('[data-rail-card="lightning"] input[name=lightning]').inputValue(), node.key, 'what was typed kept');
  await bp.getByRole('button', { name: 'Read it back' }).click();
  await sees(bp, '#rails-review [data-action="rails publish"]', 'read back');
  const review = await bp.locator('#rails-review').innerText();
  assert.match(review, /Lightning: the node/);
  assert.doesNotMatch(review, /On-chain/);
  await bp.locator('#rails-review [data-action="rails publish"]').click();
  await bp.locator('#status .k-note.k-done').waitFor({ timeout: 60_000 });
  const rails = await bobD.c.ask<{ pointer: { rails: { name: string }[] } | null }>('rails');
  assert.deepEqual(rails.pointer?.rails.map((r) => r.name), ['Lightning']);
  await bc.close();

  // H100: on Bob's profile, from his payee pointer: the rail and the currency it takes.
  const ad = await damgar();
  const alice = await dub(H, R, { damgar: ad.dir });
  await ad.c.ask('bring', { id: alice.id, words: alice.words, address: H[0] });
  await ad.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const prof = await alice.c.ask<{ takes: string }>('profile', { id: bob.id });
  assert.match(prof.takes, /^Paid on Lightning, in regtest satoshis \(its payee pointer, version 1\)\.$/);
  const none = await bob.c.ask<{ takes: string }>('profile', { id: alice.id });
  assert.match(none.takes, /publishes no payee pointer/);

  // H117: a tip from Alice; Bob's node makes its invoice; Alice's To pay hands it to her wallet.
  const tip = await ad.c.ask<{ id: string }>('tip', { to: bob.id, value: '300', unit: SPEC.units.regtest, whatFor: 'for the wallet test' });
  await ad.c.ask('sign draft', { id: tip.id });
  await bobD.c.ask('look');
  const inv = (await bobD.c.ask<{ items: { id: string; kind: string; descriptionHash?: string }[] }>('to sign')).items.find((i) => i.kind === 'invoice')!;
  const made = node.invoice(300, inv.descriptionHash!);
  await bobD.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
  // No wallet in the browser: Open in wallet first, its QR beside it.
  const { context: ac, page: ap } = await open(`${ad.app.base}/#pair=${ad.app.access.newCode()}`);
  await sees(ap, '.k-tile', 'tiles');
  await go(ap, 'waiting', 'to-pay');
  await sees(ap, '#pane [data-open-wallet]', 'open in wallet');
  assert.equal(await ap.locator('#pane [data-open-wallet]').getAttribute('href'), `lightning:${made.invoice}`);
  assert.equal(await ap.locator('#pane [data-action="webln"]').count(), 0, 'no browser wallet, none offered');
  await ap.locator('#pane .damgar-wallet details.k-fold > summary').click();
  await ap.locator('#pane .damgar-qr svg.k-qr').waitFor();
  await shot(ap, 'h117-open-in-wallet');
  await ac.close();
  // A WebLN wallet in the browser: offered first; it approves, and the proof comes back by itself, the claim signed.
  const webln = `window.webln = { async enable() {}, async sendPayment(inv) { if (inv !== ${JSON.stringify(made.invoice)}) throw new Error('another invoice'); return { preimage: ${JSON.stringify(made.preimage)} }; } };`;
  const { context: wc, page: wp } = await open(`${ad.app.base}/#pair=${ad.app.access.newCode()}`, webln);
  await sees(wp, '.k-tile', 'tiles');
  await go(wp, 'waiting', 'to-pay');
  const pay = wp.locator('#pane [data-action="webln"]');
  await pay.waitFor();
  assert.ok((await pay.getAttribute('class'))!.includes('k-p'), 'the browser\'s wallet first');
  await shot(wp, 'h117-webln');
  await pay.click();
  const ok = wp.locator('#status .k-note.k-done');
  await ok.waitFor({ timeout: 60_000 });
  assert.match(await ok.innerText(), /says valid/);
  await wc.close();
  assert.deepEqual(problems, []);
});
