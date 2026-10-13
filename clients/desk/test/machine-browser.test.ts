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

const done = (page: Page, words: string | RegExp) => page.locator('#status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });

test('at the desk: the terms shown, then signed; a stranger’s message notified, picked and answered; a nudge; three picked in one approval', async () => {
  const page = await (await browser.newContext()).newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('#settings form').waitFor();
  await page.fill('#settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await page.fill('#settings textarea[name=relays]', relay.base);
  await page.click('#settings button[type=submit]');
  await page.locator('#settings-status .note.done', { hasText: 'Settings saved' }).waitFor({ timeout: 60_000 });
  for (const name of ['Nobody, allegedly', 'Machine, allegedly', 'A stranger']) {
    await page.fill('#new-identity input[name=name]', name);
    await page.click('#new-identity button[type=submit]');
    await done(page, `“${name}” is born`);
  }

  // The terms, shown first; nothing signed until the button under them.
  await page.click('#machine-terms button[type=submit]');
  await page.locator('#machine-shown', { hasText: 'Who may nudge it: Nobody, allegedly, and only by a public nudge.' }).waitFor({ timeout: 30_000 });
  await page.locator('#machine-shown', { hasText: 'A reply to anyone: needs a pick.' }).waitFor();
  await page.click('[data-action=machine-publish]');
  await done(page, 'Terms signed and published');
  await page.locator('#machine', { hasText: 'Its terms, signed and published' }).waitFor();
  await page.locator('#machine', { hasText: 'The API key is found (the environment variable ANTHROPIC_API_KEY); it is never shown here.' }).waitFor();
  assert.ok(!(await page.content()).includes(KEY));

  // A stranger writes to it: notified, nothing drafted.
  const s = app.store.book().identities;
  const id = (n: string) => s.find((i) => i.name === n)!.id;
  await app.desk.signAndSend(id('A stranger'), { spec: NUDGE_SPECS.text, type: 0, payload: cborEncode(new Map([[0, 'Hello from a stranger.']])) as Uint8Array, public: true, to: [id('Machine, allegedly')], refs: [] });
  await page.click('[data-action=machine-look]');
  await page.locator('#machine [data-notified]', { hasText: 'Hello from a stranger.' }).waitFor({ timeout: 60_000 });
  assert.equal(api.seen.length, 0);

  // Picked: answered at once.
  api.reply = answering({ text: 'Hello, stranger.', notClaimed: [] });
  await page.click('[data-action=machine-pick]');
  await done(page, 'Picked');
  await page.locator('#status', { hasText: 'Machine, allegedly answered' }).waitFor();
  assert.equal(api.seen.length, 1);
  await page.locator('#history', { hasText: 'Hello, stranger.' }).waitFor();
  await page.locator('#history', { hasText: /Cause: picked by Nobody, allegedly/ }).waitFor();
  assert.equal(await page.locator('#machine [data-notified]').count(), 0);

  // A nudge for one action, with words.
  api.reply = answering({ actions: [{ kind: 'post', answers: null, text: 'A post of my own choosing.' }], notClaimed: [] });
  await page.fill('#machine-nudge input[name=count]', '1');
  await page.fill('#machine-nudge textarea[name=context]', 'Say something.');
  await page.click('#machine-nudge button[type=submit]');
  await done(page, 'Nudged');
  await page.locator('#status', { hasText: 'Machine, allegedly took one action' }).waitFor();
  await page.locator('#history', { hasText: 'A post of my own choosing.' }).waitFor();
  assert.ok(!(await page.content()).includes(KEY));

  // Three acts selected and picked in one approval: shown together first, then one pick each, each answered.
  for (const t of ['Batch one.', 'Batch two.', 'Batch three.']) {
    await app.desk.signAndSend(id('A stranger'), { spec: NUDGE_SPECS.text, type: 0, payload: cborEncode(new Map([[0, t]])) as Uint8Array, public: true, to: [id('Machine, allegedly')], refs: [] });
  }
  await page.click('[data-action=machine-look]');
  await page.locator('#machine [data-notified]', { hasText: 'Batch three.' }).waitFor({ timeout: 60_000 });
  await page.locator('#machine [data-notified]', { hasText: 'Batch one.' }).waitFor({ timeout: 60_000 });
  const calls = api.seen.length;
  for (const box of await page.locator('#machine input[name=pick-select]').all()) await box.check();
  api.reply = answering({ text: 'One of three, answered.', notClaimed: [] });
  await page.click('[data-action=machine-picks]');
  await page.locator('#machine-picks-shown', { hasText: '3 picks, one for each act below' }).waitFor({ timeout: 30_000 });
  await page.locator('#machine-picks-shown', { hasText: '“Batch two.”' }).waitFor();
  assert.equal(api.seen.length, calls, 'nothing signed or called by showing');
  if (process.env.MOR_SCREENSHOTS) await page.locator('#machine').screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'machine-picks-shown.png') });
  await page.click('[data-action=machine-pick-many]');
  await done(page, 'Picked 3 acts');
  await page.locator('#status', { hasText: 'Answered (3):' }).waitFor();
  assert.equal(api.seen.length, calls + 3);
  assert.equal(await page.locator('#machine [data-notified]').count(), 0);
  assert.ok(!(await page.content()).includes(KEY));
  // MOR_SCREENSHOTS=DIR keeps a picture of the section, for a person to look at.
  if (process.env.MOR_SCREENSHOTS) await page.locator('#machine').screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'machine-allegedly.png') });
  assert.deepEqual(problems, []);
});
