// The step's "done when" in a real browser (headless Chromium, a fresh
// profile), as the author will do it: open the launcher's link, then only
// clicks and typing into the page. Every step is reviewed in plain words
// before Sign is pressed. Real homes and a relay, as everywhere else.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { verifyRelease } from '../../repo/src/release.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { serve, type Running } from '../src/server.ts';
import { checkout, commit } from './setup.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/** Set MOR_SCREENSHOTS to a folder to keep a picture of each review, for a person to look at. */
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let browser: Browser;
let co: string;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-collective-browser-')), port: 0 });
  co = checkout();
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await app?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (page: Page, words: string | RegExp) => page.locator('#status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });

/** Wait for the review, check it says what it should, then press Sign. */
async function review(page: Page, title: string | RegExp, name: string, says: (string | RegExp)[] = []) {
  const r = page.locator('#reading');
  await r.locator('h2', { hasText: title }).waitFor({ timeout: 60_000 });
  const text = (await r.textContent())!;
  for (const s of says) assert.ok(typeof s === 'string' ? text.includes(s) : s.test(text), `the review says ${s}:\n${text}`);
  await shot(page, name);
  await r.locator('[data-action=confirm]').click();
}

test('the author, without a terminal, from the page alone', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (m) => {
    // A browser not paired yet is answered 401, as it should be.
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('dialog', (d) => void d.accept());

  // The launcher's link pairs this browser by itself; the code leaves the address bar.
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('h1', { hasText: 'MOR collectives' }).waitFor();
  await page.locator('#settings form').waitFor();
  assert.equal(new URL(page.url()).hash, '');

  // Settings: the homes, the relays, the folder to release.
  await page.fill('#settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await page.fill('#settings textarea[name=relays]', `${relay.base}\n${homes[0].base}`);
  await page.fill('#settings input[name=checkout]', co);
  await page.click('#settings button[type=submit]');
  await done(page, 'Settings saved');

  // Identities: the author, then three simulated members.
  await page.fill('#new-identity input[name=name]', 'Ada');
  await page.click('#new-identity button');
  await review(page, 'A new test identity, “Ada”', '1-identity', ['It is you', 'kept in software']);
  await done(page, '“Ada” is born');
  for (const n of ['Sim One', 'Sim Two', 'Sim Three']) {
    await page.fill('#new-identity input[name=name]', n);
    assert.equal(await page.isChecked('#new-identity input[name=mine]'), false);
    await page.click('#new-identity button');
    await review(page, `A new test identity, “${n}”`, `1-${n}`, ['simulated member']);
    await done(page, `“${n}” is born`);
  }

  // A release under one's own name.
  await page.fill('#own-release input[name=version]', '11b.0');
  await page.click('#own-release button');
  await review(page, /Publish MOR 11b\.0 as Ada \(you\)/, '2-own-release', ["own name", 'first release']);
  await done(page, 'MOR 11b.0 is published');

  // Found a collective with two simulated members. Its words hide a direction control: the review shows it.
  await page.fill('#found input[name=name]', 'Makers');
  for (const n of ['Ada (you)', 'Sim One', 'Sim Two']) await page.locator('#found label.check', { hasText: n }).locator('input').check();
  await page.fill('#found textarea[name=words]', 'We publish MOR together. ‮nothing hidden‬.');
  await page.click('#found button[type=submit]');
  await page.locator('#reading .mor-lf-ctl', { hasText: 'U+202E' }).waitFor();
  await review(page, 'Found the collective “Makers”', '3-found', [
    'Hidden characters',
    'Who is bound',
    'any 2 of the 3 parties have signed it',
    'Their consent is simulated',
  ]);
  await done(page, '“Makers” is founded');

  const card = page.locator('.card', { hasText: 'Makers' });
  const change = async (check: string, which: 'join' | 'leave') => {
    await card.locator('details.change summary').click();
    await card.locator(`form.change label.check:has(input[name=${which}])`, { hasText: check }).locator('input').check();
    await card.locator('form.change button[type=submit]').click();
  };

  // Add one, remove one.
  await change('Sim Three', 'join');
  await review(page, /Add Sim Three .* to “Makers”/, '4-add', ['joins, bound once they sign the clone', 'The words stay the same']);
  await done(page, ': done');
  await change('Sim One', 'leave');
  await review(page, /Remove Sim One .* from “Makers”/, '5-remove', ['They hand over nothing']);
  await done(page, ': done');

  // A release under the new rules, signed by two members.
  commit(co, 'src/lib.rs', 'pub fn two() -> u8 { 2 }\n');
  await card.locator('form.release input[name=version]').fill('11b.1');
  await card.locator('form.release button').click();
  await review(page, /Publish MOR 11b\.1 as the collective “Makers”/, '6-release', ['It is not a release yet', 'It is the first release', '3 files']);
  await done(page, 'MOR 11b.1 is published');
  const rel = (await card.locator('li', { hasText: '11b.1' }).locator('code').getAttribute('title'))!;
  await card.locator('li', { hasText: '11b.1' }).locator('[data-action=sign]', { hasText: 'Sign as Ada (you)' }).click();
  await review(page, /Sign MOR 11b\.1 as Ada \(you\)/, '7-sign', ['all 3 files are the same', 'No member has signed it yet', 'cannot be taken back']);
  await done(page, 'Signed by Ada');
  await card.locator('li', { hasText: '11b.1' }).locator('[data-action=sign]', { hasText: 'Sign as Sim Three' }).click();
  await review(page, /Sign MOR 11b\.1 as Sim Three/, '8-sign', ['Signed so far by Ada (you)']);
  await page.locator('#status .note.done', { hasText: 'It is now a release: VERIFIED' }).waitFor({ timeout: 60_000 });

  // Leave: the numbers are fitted to the two who stay, and the review says so.
  await card.locator('[data-action=leave]').click();
  await review(page, /Ada \(you\) .* leaves “Makers”/, '9-leave', [
    'They hand over nothing',
    'yours end with your membership',
    'The everyday key passes to Sim Two',
    'Any one member alone can rebuild the safety key',
  ]);
  await done(page, ': done');
  assert.equal(await card.locator('[data-action=leave]').count(), 0, 'no longer a member');
  assert.equal(await card.locator('dt:text("Members") + dd').textContent().then((t) => /Ada/.test(t!)), false);

  // Anyone can check the release; a fresh verifier agrees.
  await card.locator('li', { hasText: '11b.1' }).locator('[data-action=verify]').click();
  await page.locator('#reading h2', { hasText: 'VERIFIED: MOR 11b.1' }).waitFor({ timeout: 60_000 });
  await shot(page, '10-verified');
  const v = await verifyRelease(rel, [relay.base]);
  assert.equal(v.ok, true, v.problems.join('; '));

  // Everything signed is listed.
  assert.equal(await page.locator('#history li').count(), 12);
  assert.deepEqual(problems, []);
  await context.close();
});
