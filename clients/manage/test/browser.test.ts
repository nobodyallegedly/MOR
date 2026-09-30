// The management page in a real browser (headless Chromium, fresh
// profiles), served by a real home and a real relay, as an operator would
// use it without a terminal: pair with the code the relay gave, then list
// an identity, approve a waiting rotation, limit new identities, pair and
// unpair another device, and rotate the operator. The owner's side is the
// genesis client, against the same home.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { pairingCode } from './pair.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/** Set MOR_SCREENSHOTS to a folder to keep a picture of each page, for a person to look at. */
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

let home: Running;
let relay: Running;
let browser: Browser;
const problems: string[] = [];

async function fresh(): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (m) => {
    // Refusals the test provokes (a browser not paired yet, a wrong
    // confirmation) are answered 4xx, as they should be; anything else, a
    // fault of the relay or a breach of the page's policy, is a problem.
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('dialog', (d) => void d.accept());
  return { context, page };
}

async function pair(page: Page, base: string, code: string, label: string) {
  await page.goto(`${base}/manage/`);
  await page.getByText('Pair this browser').waitFor();
  await page.fill('#pair-code', code);
  await page.fill('#pair-label', label);
  await page.click('#pair button');
}

const done = (page: Page, words: string) => page.locator('#status .note.done', { hasText: words }).waitFor();
const refresh = (page: Page) => page.click('[data-action=refresh]');

before(async () => {
  home = await start('home');
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await home?.stop();
  await relay?.stop();
});

test('an operator runs a home from the page, without a terminal', async () => {
  const { page } = await fresh();

  // Pairing: a wrong code is refused; the relay's code pairs.
  await pair(page, home.base, 'AAAAA-AAAAA-AAAAA-AAAAA', 'Test browser');
  await page.locator('#pair-status .note.error', { hasText: 'not one this relay gave' }).waitFor();
  assert.equal(await page.locator('h1').textContent(), 'Home management');
  await shot(page, '1-pairing');
  await page.fill('#pair-code', pairingCode(home.dir).toLowerCase());
  await page.click('#pair button');
  await done(page, 'This browser is paired');
  assert.equal(await page.locator('h1').textContent(), 'Home management');
  assert.ok((await page.locator('#overview').textContent())!.includes('running'));
  assert.equal(await page.locator('#overview code[title]').first().getAttribute('title'), home.operator);

  // An owner whose rotations wait for the operator's approval.
  const owner = TestIdentity.create({ homes: [home.home] });
  await owner.publishGenesis();
  await refresh(page);
  await page.click(`[data-action=strict][data-identity="${owner.id}"]`);
  await done(page, 'now wait for your approval');
  owner.prepareRotation();
  const refused = await owner.submitRotation();
  assert.equal(refused[0].code, 5, JSON.stringify(refused));
  await refresh(page);
  await page.locator('#overview .note.warn', { hasText: '1 rotation waiting' }).waitFor();
  await shot(page, '2-waiting');
  await page.click('[data-action=approve]');
  await done(page, 'Approved');
  const sent = await owner.submitRotation();
  assert.ok(sent[0].result?.receipt, JSON.stringify(sent));
  assert.equal((await owner.settleRotation()).counts, true);
  await refresh(page);
  await page.locator('#pending', { hasText: 'None.' }).waitFor();

  // The list of identities.
  const listed = 'ab'.repeat(32);
  await page.fill('#allow-identity', listed.toUpperCase());
  await page.click('#allow button');
  await done(page, 'Listed');
  await page.locator('#allowlist', { hasText: listed }).waitFor();
  await page.click(`[data-action=disallow][data-identity="${listed}"]`);
  await done(page, 'Removed');

  // A limit on new identities: past it, a genesis is refused for now.
  await page.fill('#limit-n', '0');
  await page.click('#limit button[type=submit]');
  await done(page, 'At most 0 new identities');
  const late = TestIdentity.create({ homes: [home.home] });
  const r = await late.publishGenesis();
  assert.equal(r[0].code, 10, JSON.stringify(r));
  await page.click('[data-action=no-limit]');
  await done(page, 'No limit');
  assert.ok((await late.publishGenesis())[0].result?.receipt);

  // Another device: a code made on the page pairs it; unpairing shuts it out.
  await page.click('[data-action=code]');
  const code = (await page.locator('#code .code').textContent())!;
  const other = await fresh();
  await pair(other.page, home.base, code, 'Phone');
  await done(other.page, 'This browser is paired');
  await refresh(page);
  await page.locator('#managers', { hasText: 'Phone' }).waitFor();
  await shot(page, '3-home');
  await page.locator('#managers tr', { hasText: 'Phone' }).locator('[data-action=unpair]').click();
  await done(page, 'Unpaired');
  await refresh(other.page);
  await other.page.getByText('Pair this browser').waitFor();

  // The operator's rotation, confirmed by typing.
  await page.click('#operator summary >> text=Rotate the operator');
  await page.fill('#rotate-confirm', 'rotat');
  await page.click('#rotate button');
  await page.locator('#status .note.error', { hasText: 'type "rotate"' }).waitFor();
  await page.fill('#rotate-confirm', 'rotate');
  await page.click('#rotate button');
  await done(page, 'The operator has rotated');
  // The home signs on under the new key: a newcomer still gets a receipt.
  const after = TestIdentity.create({ homes: [home.home] });
  assert.ok((await after.publishGenesis())[0].result?.receipt);

  assert.deepEqual(problems, []);
});

test('an operator runs a basic relay from the page', async () => {
  const { page } = await fresh();
  await pair(page, relay.base, pairingCode(relay.dir), 'Test browser');
  await done(page, 'This browser is paired');
  assert.equal(await page.locator('h1').textContent(), 'Relay management');
  assert.equal(await page.locator('#identities').count(), 0);
  assert.equal(await page.locator('#operator').count(), 0);
  // An act published there shows among the latest arrivals.
  const someone = TestIdentity.create({ homes: [home.home] });
  await someone.publishGenesis();
  await fetch(`${relay.base}/acts`, { method: 'POST', body: someone.chainActs()[0] as unknown as BodyInit });
  await refresh(page);
  await page.locator('#recent td', { hasText: 'Identity: genesis' }).waitFor();
  await shot(page, '4-relay');
  assert.deepEqual(problems, []);
});
