// Dub in a real browser (headless Chromium, a fresh profile), as a
// person uses it: open the app's link, then only clicks and typing. Real
// homes and a relay. `MOR_SCREENSHOTS=DIR` keeps a picture of each step.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { readPost, type ShownPicture } from '../../barebone/src/post.ts';
import { serve, type Running } from '../src/server.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { groupId, toWords } from '../../../modules/carry/src/carry.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PHONE = fileURLToPath(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-browser-')), port: 0 });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await app?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (page: Page, words: string | RegExp) => page.locator('#status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });

test('a person, without a terminal: a new identity, its words written and three typed back, a post, a picture, a withdrawal', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());

  // The app's link, as the launcher opens it.
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.getByRole('heading', { name: 'Dub' }).waitFor();
  assert.match(await page.locator('#test-only').innerText(), /^Test identities only, until MOR is frozen\./);
  await page.getByRole('heading', { name: 'Make a new identity' }).waitFor();
  await page.getByRole('heading', { name: 'Bring an identity you have' }).waitFor();
  await shot(page, '1-doors');

  // Door one.
  const begin = page.locator('form#begin');
  await begin.locator('textarea[name=homes]').fill(homes.map((h) => h.base).join('\n'));
  await begin.locator('textarea[name=relays]').fill(relay.base);
  await begin.getByRole('button', { name: 'Make it' }).click();
  await page.locator('#words').waitFor({ timeout: 60_000 });
  const written = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.equal(written.length, 24);
  assert.match(await page.locator('.say').innerText(), /Whoever holds these words can post as this identity/);
  await shot(page, '2-words');

  // A reload does not show the words again; it asks for three.
  await page.reload();
  await page.locator('form#confirm').waitFor();
  assert.equal(await page.locator('#words').count(), 0);
  const inputs = page.locator('form#confirm input');
  const names = await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name));
  const positions = names.map((n) => Number(n.slice(1)));
  // One wrong: refused, nothing published.
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(i === 2 ? 'wrong' : written[p - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await page.locator('#status .note.error', { hasText: 'Nothing has been published' }).waitFor({ timeout: 60_000 });
  await inputs.nth(2).fill(written[positions[2] - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await done(page, 'The identity is born');
  await shot(page, '3-born');

  // A post, read back verified.
  await page.locator('form#post textarea[name=text]').fill('Hello, from a page.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, 'Posted');
  const published = page.locator('#published .mor-post');
  await published.waitFor();
  assert.match(await published.innerText(), /verified/);
  assert.match(await published.innerText(), /Hello, from a page\./);

  // With a picture: stripped before it left.
  await page.locator('form#post textarea[name=text]').fill('And a picture.');
  await page.locator('form#post input[name=picture]').setInputFiles(PHONE);
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /the place the picture was taken \(GPS\)/);
  await page.locator('#published img').waitFor();
  const id = await page.locator('#published [data-post]').getAttribute('data-post');
  await shot(page, '4-picture');
  const read = await readPost(id!, [relay.base]);
  assert.equal(read.standing, 'valid');
  assert.deepEqual((read.refs[0] as ShownPicture).picture!.carries, []);

  // The list, newest first, then withdraw the picture from it.
  await page.locator('#posts .mor-post').nth(1).waitFor({ timeout: 60_000 });
  assert.match(await page.locator('#posts .mor-post').first().innerText(), /And a picture\./);
  await page.locator('#posts').getByRole('button', { name: 'Withdraw this picture' }).click();
  await done(page, 'The picture is withdrawn');
  await page.locator('#posts .mor-post-missing', { hasText: 'withdrawn by its signer' }).waitFor({ timeout: 60_000 });
  assert.ok((await readPost(id!, [relay.base]).then((p) => (p.refs[0] as ShownPicture).withdrawn)));
  // The card shows this app's line as it is now: routes, a post, a picture, a post, a withdrawal.
  await page.locator('#identity', { hasText: '5 acts' }).waitFor({ timeout: 60_000 });
  await shot(page, '5-withdrawn');

  assert.deepEqual(problems, []);
  await context.close();
});

test('the second door by clicks: an identity made elsewhere, brought in by its ID and words (the form never submitted before 13 October 2026)', async () => {
  const other = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-browser-')), port: 0 });
  try {
    const made = TestIdentity.create({ homes: [homes[0].home] });
    await made.publishGenesis();
    await made.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', (e) => problems.push(e.message));
    await page.goto(`${other.base}/#pair=${other.access.newCode()}`);
    const bring = page.locator('form#bring');
    await bring.waitFor({ timeout: 60_000 });
    await bring.locator('input[name=id]').fill(groupId(made.id));
    await bring.locator('textarea[name=words]').fill(toWords(unhex(made.f.signingSecret)).join(' '));
    await bring.locator('input[name=address]').fill(homes[0].base);
    await bring.getByRole('button', { name: 'Bring it' }).click();
    await done(page, 'The identity is here');
    assert.match(await page.locator('#identity').innerText(), /Elsewhere, and brought here by its words/);
    assert.deepEqual(problems, []);
    await context.close();
  } finally {
    await other.close();
  }
});
