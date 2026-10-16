// Machine, allegedly, plugged in, at the desk in a real browser (headless
// Chromium, a fresh profile), by clicks and typing alone: its terms shown,
// then signed; a stranger's message notified and picked; a nudge; three
// acts picked in one approval. Real homes
// and a relay; Anthropic's API faked (no network, no key).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { cborEncode } from '../../genesis/src/core.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { answering, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { NUDGE_SPECS } from '../../nudge/src/specs.ts';
import { serve, type Running } from '../src/server.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const KEY = 'sk-ant-api03-FAKE-never-a-real-key-browser-0123456789';

let homes: Relay[];
let relay: Relay;
let app: Running;
let api: Fake;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  app = await serve({
    dir: mkdtempSync(join(tmpdir(), 'mor-desk-machine-browser-')),
    port: 0,
    drafts: mkdtempSync(join(tmpdir(), 'mor-drafts-machine-browser-')),
    machineEvery: 0,
    machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: { ANTHROPIC_API_KEY: KEY } },
  });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await app?.close();
  await api?.stop();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (page: Page, words: string | RegExp) => page.locator('#e-status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });

test('at the desk: the terms shown, then signed; a stranger’s message notified, picked and answered; a nudge; three picked in one approval', async () => {
  const page = await (await browser.newContext()).newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.click('[data-action=tab][data-tab=settings]');
  await page.locator('form#desk-settings').waitFor();
  await page.fill('#desk-settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await page.fill('#desk-settings textarea[name=relays]', relay.base);
  await page.click('#desk-settings button[type=submit]');
  await page.locator('#settings-status .note.done', { hasText: 'Settings saved' }).waitFor({ timeout: 60_000 });
  await page.click('[data-action=tab][data-tab=identities]');
  for (const name of ['Nobody, allegedly', 'Machine, allegedly', 'A stranger']) {
    await page.click('.entry.add[data-id=new]');
    await page.fill('#new-identity input[name=name]', name);
    await page.click('#new-identity button[type=submit]');
    await done(page, `“${name}” is born`);
  }

  // Edubba's first-use window: Machine, allegedly, an identity held here, owned by Nobody, allegedly.
  const s = app.store.book().identities;
  const id = (n: string) => s.find((i) => i.name === n)!.id;
  await page.click('[data-action=tab][data-tab=agents]');
  await page.selectOption('#agent-add select[name=agent]', id('Machine, allegedly'));
  await page.selectOption('#agent-add select[name=owner]', id('Nobody, allegedly'));
  await page.click('#agent-add button[type=submit]');
  // The terms, shown first; nothing signed until the button under them.
  await page.locator('#e-terms', { hasText: 'Who may nudge it: Nobody, allegedly, and only by a public nudge.' }).waitFor({ timeout: 30_000 });
  await page.locator('#e-terms', { hasText: 'A reply to anyone: needs a pick.' }).waitFor();
  await page.click('[data-action=machine-publish]');
  await done(page, 'Terms signed and published');
  await page.locator('#e-terms-card', { hasText: 'Who may nudge it' }).waitFor();
  await page.locator('#e-cap', { hasText: 'The shared key, …6789. The key is never shown here beyond its last four characters.' }).waitFor();
  assert.ok(!(await page.content()).includes(KEY));

  // A stranger writes to it: notified, nothing drafted.
  await app.desk.signAndSend(id('A stranger'), { spec: NUDGE_SPECS.text, type: 0, payload: cborEncode(new Map([[0, 'Hello from a stranger.']])) as Uint8Array, public: true, to: [id('Machine, allegedly')], refs: [] });
  await page.click('[data-action=machine-look]');
  await page.locator('#e-queue [data-notified]', { hasText: 'Hello from a stranger.' }).waitFor({ timeout: 60_000 });
  assert.equal(api.seen.length, 0);

  // Picked: answered at once.
  api.reply = answering({ text: 'Hello, stranger.', notClaimed: [] });
  await page.click('[data-action=machine-pick]');
  await done(page, 'Picked');
  await page.locator('#e-status', { hasText: 'Machine, allegedly answered' }).waitFor();
  assert.equal(api.seen.length, 1);
  await page.locator('details.card', { hasText: 'Hello, stranger.' }).waitFor({ state: 'attached' });
  await page.locator('details.card', { hasText: /Cause: picked by Nobody, allegedly/ }).waitFor({ state: 'attached' });
  assert.equal(await page.locator('#e-queue [data-notified]').count(), 0);

  // A nudge for one action, with words.
  api.reply = answering({ actions: [{ kind: 'post', answers: null, text: 'A post of my own choosing.' }], notClaimed: [] });
  await page.fill('#machine-nudge input[name=count]', '1');
  await page.fill('#machine-nudge textarea[name=context]', 'Say something.');
  await page.click('#machine-nudge button[type=submit]');
  await done(page, 'Nudged');
  await page.locator('#e-status', { hasText: 'Machine, allegedly took one action' }).waitFor();
  await page.locator('details.card', { hasText: 'A post of my own choosing.' }).waitFor({ state: 'attached' });
  assert.ok(!(await page.content()).includes(KEY));

  // Three acts selected and picked in one approval: shown together first, then one pick each, each answered.
  for (const t of ['Batch one.', 'Batch two.', 'Batch three.']) {
    await app.desk.signAndSend(id('A stranger'), { spec: NUDGE_SPECS.text, type: 0, payload: cborEncode(new Map([[0, t]])) as Uint8Array, public: true, to: [id('Machine, allegedly')], refs: [] });
  }
  await page.click('[data-action=machine-look]');
  await page.locator('#e-queue [data-notified]', { hasText: 'Batch three.' }).waitFor({ timeout: 60_000 });
  await page.locator('#e-queue [data-notified]', { hasText: 'Batch one.' }).waitFor({ timeout: 60_000 });
  const calls = api.seen.length;
  for (const box of await page.locator('#e-queue input[name=pick-select]').all()) await box.check();
  api.reply = answering({ text: 'One of three, answered.', notClaimed: [] });
  await page.click('[data-action=machine-picks]');
  await page.locator('#e-picks-shown', { hasText: '3 picks, one for each act below' }).waitFor({ timeout: 30_000 });
  await page.locator('#e-picks-shown', { hasText: '“Batch two.”' }).waitFor();
  assert.equal(api.seen.length, calls, 'nothing signed or called by showing');
  if (process.env.MOR_SCREENSHOTS) await page.locator('#e-detail').screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'machine-picks-shown.png') });
  await page.click('[data-action=machine-pick-many]');
  await done(page, 'Picked 3 acts');
  await page.locator('#e-status', { hasText: 'Answered (3):' }).waitFor();
  assert.equal(api.seen.length, calls + 3);
  assert.equal(await page.locator('#e-queue [data-notified]').count(), 0);
  assert.ok(!(await page.content()).includes(KEY));
  // MOR_SCREENSHOTS=DIR keeps a picture of the section, for a person to look at.
  if (process.env.MOR_SCREENSHOTS) await page.locator('#e-detail').screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'machine-allegedly.png') });
  assert.deepEqual(problems, []);
});
