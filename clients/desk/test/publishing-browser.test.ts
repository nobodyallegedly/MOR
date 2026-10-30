// Edubba's Publishing tab by clicks (round 8, F407): the four ways in, each
// opened from the tab's column, and "Who owns it" as H98 decided it (Nobody,
// allegedly: "With splits, the Edubba should start with two IDs me and
// another, then give option to add more people"): two rows, you (filled in)
// and one other person, then "+ Add a person"; the first two cannot be
// removed; the shares even until one is touched. The same rows for a
// publication's partners, each with a short label.
//
// Headless Chromium, a fresh profile, the pairing link, then only clicks and
// typing. Real homes and a relay; test identities only.
//
// Premises replaced in round 8 (said here, as the brief asks): the earlier
// screens, "A protected file" with "Who shares in it" (two fixed rows, your
// share typed, the deal's own payee shown to give the split service) and
// "Shared deals", are gone; their equivalents are the four ways in and the
// two-row form, tested here by clicks.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { closeAll, dub, edubba, start, type Relay } from '../../damgar/test/world.ts';
import type { Done } from '../src/page/api.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

let homes: Relay[] = [];
let relay: Relay | null = null;
let browser: Browser | null = null;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

// Every server and the browser stop whatever the outcome (CI robustness, Part 4).
after(async () => {
  await browser?.close().catch(() => undefined);
  await closeAll().catch(() => undefined);
  for (const h of [...homes, ...(relay ? [relay] : [])]) await h.stop().catch(() => undefined);
});

/** The shares a "Who owns it" box shows now, in order. */
const sharesIn = (page: Page, box: string) => page.locator(`[data-people="${box}"] input[name^="share-"]`).evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).value));

/** A wait for a condition on the page, not a read once (CI robustness, Part 4). */
async function until<T>(f: () => Promise<T>, ok: (x: T) => boolean, what: string): Promise<T> {
  let x = await f();
  for (let i = 0; i < 40 && !ok(x); i++) {
    await new Promise((r) => setTimeout(r, 250));
    x = await f();
  }
  assert.ok(ok(x), `${what}: ${JSON.stringify(x)}`);
  return x;
}

test('Publishing’s four ways in by clicks: Upload then a claim; Claim; an ownership agreement from two rows, you and Ana, then more (H98), even until touched; a publication with partners, each labelled', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay!.base];
  const e = await edubba(H, RL);
  const river = (await e.c.ask<Done>('identity', { name: 'River', linked: false })).acts[0];
  const ana = await dub(H, RL);
  const service = await dub(H, RL);
  await e.c.ask('real contact add', { id: ana.id, name: 'Ana' });
  await e.c.ask('real contact add', { id: service.id, name: 'The split service' });

  const problems: string[] = [];
  const page = await (await browser!.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  page.on('pageerror', (x) => problems.push(x.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  await page.goto(`${e.app.base}/#pair=${e.app.access.newCode()}`);
  await page.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });

  // The four ways in, each in the column, each opening its own form.
  const col = page.locator('.k-col');
  await col.locator('button', { hasText: '1 · Upload' }).waitFor({ timeout: 60_000 });
  const entries = await col.innerText();
  for (const w of ['1 · Upload', '2 · Claim', '3 · Ownership agreement', '4 · Publication', 'Published here', 'To sign', 'Sales']) assert.ok(entries.includes(w), `${w} in the column: ${entries}`);
  for (const [label, h2, form] of [
    ['2 · Claim', 'Claim', '#pub-claim'],
    ['3 · Ownership agreement', 'Ownership agreement', '#pub-ownership'],
    ['4 · Publication', 'Publication', '#pub-publication'],
    ['1 · Upload', 'Upload', '#pub-upload'],
  ] as const) {
    await col.locator('button', { hasText: label }).click();
    await page.locator('#pane h2', { hasText: h2 }).first().waitFor({ timeout: 60_000 });
    await page.locator(form).waitFor();
  }
  assert.match(await page.locator('#pane').innerText(), /A bake is never withdrawn by the protocol/);
  await shot(page, 'publishing-1-upload');

  // Way 1: a text uploaded, then a claim; the creators' rows start with you, then one other; a third added, then removed.
  await page.fill('#pub-upload textarea[name=text]', 'Two verses, made by two.');
  await page.fill('#pub-upload input[name=title]', 'Two verses');
  await page.check('#pub-upload input[name=then][value=claim]');
  const creators = page.locator('[data-people="upload-creators"] [data-person]');
  assert.equal(await creators.count(), 2);
  assert.equal(await page.locator('[data-people="upload-creators"] input[name=who-1]').inputValue(), 'River');
  assert.equal(await page.locator('[data-people="upload-creators"] input[name=who-1]').getAttribute('readonly'), '');
  assert.equal(await page.locator('[data-people="upload-creators"] [data-action=people-remove]').count(), 0, 'the first two cannot be removed');
  await page.locator('[data-people-for="upload-creators"]').click();
  assert.equal(await creators.count(), 3);
  await page.locator('[data-people="upload-creators"] [data-person="3"] [data-action=people-remove]').click();
  assert.equal(await creators.count(), 2);
  await page.fill('[data-people="upload-creators"] input[name=who-2]', 'Ana');
  await page.click('#pub-upload button[type=submit]');
  await page.locator('#e-pub-review #reading', { hasText: 'Then: a claim' }).waitFor({ timeout: 60_000 });
  assert.match(await page.locator('#e-pub-review').innerText(), /binding the work’s fingerprint to its creators: River.*Ana/s);
  await shot(page, 'publishing-1-upload-read-back');
  await page.click('#e-pub-review [data-action=confirm]');
  await page.locator('#here-feed .k-act', { hasText: 'Two verses' }).first().waitFor({ timeout: 90_000 });
  await page.locator('#here-feed .k-act .k-kind', { hasText: 'claim' }).waitFor({ timeout: 60_000 });
  await page.locator('#here-feed', { hasText: 'Waiting: Ana' }).waitFor();
  await shot(page, 'publishing-published-here');

  // Way 2: Claim, its form; nothing named is refused in plain words, nothing signed.
  await col.locator('button', { hasText: '2 · Claim' }).click();
  await page.locator('#pub-claim').waitFor();
  await page.click('#pub-claim button[type=submit]');
  await page.locator('#e-pub-review #reading', { hasText: 'The work: a bake’s ID' }).waitFor({ timeout: 60_000 });

  // Way 3 (H98): you and one other person, the shares even until touched; + Add a person; the first two stay.
  await col.locator('button', { hasText: '3 · Ownership agreement' }).click();
  await page.locator('#pub-ownership').waitFor();
  assert.match(await page.locator('#pub-ownership select[name=claim]').innerText(), /Two verses/);
  const owners = page.locator('[data-people="owners"] [data-person]');
  assert.equal(await owners.count(), 2, 'two rows: you and one other');
  assert.equal(await page.locator('[data-people="owners"] input[name=who-1]').inputValue(), 'River');
  await until(() => sharesIn(page, 'owners'), (x) => x.join() === '50,50', 'even, two');
  await page.locator('[data-people-for="owners"]').click();
  await until(() => sharesIn(page, 'owners'), (x) => x.join() === '33.3334,33.3333,33.3333', 'even, three');
  assert.equal(await page.locator('[data-people="owners"] [data-action=people-remove]').count(), 1, 'only the third can be removed');
  await page.locator('[data-people="owners"] [data-person="3"] [data-action=people-remove]').click();
  await until(() => sharesIn(page, 'owners'), (x) => x.join() === '50,50', 'even again, two');
  await page.fill('[data-people="owners"] input[name=who-2]', 'Ana');
  await page.fill('[data-people="owners"] input[name=share-1]', '60');
  await page.locator('[data-people-for="owners"]').click();
  assert.equal((await sharesIn(page, 'owners')).join(), '60,50,', 'touched: no longer drawn even');
  await page.locator('[data-people="owners"] [data-person="3"] [data-action=people-remove]').click();
  await page.fill('[data-people="owners"] input[name=share-2]', '40');
  await shot(page, 'publishing-3-ownership-two-rows');
  await page.click('#pub-ownership button[type=submit]');
  await page.locator('#e-pub-review #reading', { hasText: 'Who owns it' }).waitFor({ timeout: 60_000 });
  const owned = await page.locator('#e-pub-review').innerText();
  assert.match(owned, /River.*: 60% \(you\)/);
  assert.match(owned, /Ana.*: 40%/);
  assert.match(owned, /Ownership only: no split, no fees, no split service/);
  await page.click('#e-pub-review [data-action=confirm]');
  await page.locator('#here-feed .k-act .k-kind', { hasText: 'ownership agreement' }).waitFor({ timeout: 90_000 });

  // Way 4: a publication from it, with partners: you (labelled “publisher”, suggested) and one other, each labelled; read back.
  await col.locator('button', { hasText: '4 · Publication' }).click();
  await page.locator('#pub-publication').waitFor();
  assert.match(await page.locator('#pub-publication select[name=owners]').innerText(), /The ownership agreement “Two verses” \(not every owner has signed yet\)/);
  assert.equal(await page.locator('#pub-publication input[name=sold]').first().isChecked(), true, 'the upload chosen');
  await page.fill('#pub-publication input[name=price]', '900');
  await page.fill('#pub-publication input[name=service]', 'The split service');
  await page.check('#pub-publication input[name=withPartners]');
  const partners = page.locator('[data-people="partners"] [data-person]');
  assert.equal(await partners.count(), 2, 'two rows: you and one other');
  assert.equal(await page.locator('[data-people="partners"] input[name=label-1]').inputValue(), 'publisher');
  assert.equal((await sharesIn(page, 'partners')).join(), ',', 'a partner’s share is typed: off the top, never drawn even');
  await page.fill('[data-people="partners"] input[name=share-1]', '0');
  await page.fill('[data-people="partners"] input[name=who-2]', 'Ana');
  await page.fill('[data-people="partners"] input[name=label-2]', 'client');
  await page.fill('[data-people="partners"] input[name=share-2]', '5');
  await page.check('#pub-publication input[name=tagBy][value=me]');
  await shot(page, 'publishing-4-publication');
  await page.click('#pub-publication button[type=submit]');
  await page.locator('#e-pub-review #reading', { hasText: 'Who takes what' }).waitFor({ timeout: 60_000 });
  const pub = await page.locator('#e-pub-review').innerText();
  assert.match(pub, /River.*\(“publisher”\): 0% off the top, a partner/);
  assert.match(pub, /Ana.*\(“client”\): 5% off the top, a partner/);
  assert.match(pub, /signed by you, the party it designates/);
  assert.match(pub, /waits for Ana .* to sign/, 'its ownership agreement is not signed by Ana yet: said, and nothing can be signed');
  await shot(page, 'publishing-4-publication-read-back');
  assert.deepEqual(problems, []);
});
