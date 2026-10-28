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

const done = async (page: Page, words: string | RegExp) => {
  await page.locator('#e-status .k-note.k-done', { hasText: words }).waitFor({ timeout: 60_000 });
  if (await page.locator('#e-status [data-action=status-close]').count()) await page.click('#e-status [data-action=status-close]');
};
const sub = (page: Page, name: string) => page.locator('.edubba-tabs button', { hasText: name }).first().click();

test('at the desk: the terms shown, then signed; a stranger’s message notified, picked and answered; a nudge; three picked in one approval', async () => {
  const page = await (await browser.newContext()).newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  // Its homes and relays, then three identities, each made from + Add (the first screen's, then the identity panel's).
  for (const [i, name] of ['Nobody, allegedly', 'Machine, allegedly', 'A stranger'].entries()) {
    if (i === 0) await page.click('[data-add=make]');
    else {
      await page.click('[data-k-open=identity]');
      await page.click('.k-panel [data-k-add=toggle]');
      await page.click('.k-panel [data-k-add=make]');
    }
    if (i === 0) {
      await page.fill('.k-modal #desk-settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
      await page.fill('.k-modal #desk-settings textarea[name=relays]', relay.base);
      await page.click('.k-modal #desk-settings button[type=submit]');
      await page.locator('.k-modal .k-note.k-done', { hasText: 'Settings saved' }).waitFor({ timeout: 60_000 });
    }
    await page.fill('.k-modal #new-identity input[name=name]', name);
    await page.click('.k-modal #new-identity button[type=submit]');
    await done(page, `“${name}” is born`);
  }

  // Edubba's first-use window: Machine, allegedly, an identity held here, owned by Nobody, allegedly.
  const s = app.store.book().identities;
  const id = (n: string) => s.find((i) => i.name === n)!.id;
  // H125: the Agents follow the identity in use: Nobody, allegedly, its owner, chosen in the identity panel.
  await page.click('[data-k-open=identity]');
  await page.click(`.k-panel [data-k-use="${id('Nobody, allegedly')}"]`);
  await page.locator('.k-panel').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => page.keyboard.press('Escape'));
  await page.click('[data-k-tile=agents]');
  await page.selectOption('#agent-add select[name=agent]', id('Machine, allegedly'));
  await page.selectOption('#agent-add select[name=owner]', id('Nobody, allegedly'));
  await page.click('#agent-add button[type=submit]');
  // The terms, shown first; nothing signed until the button under them.
  await page.locator('#e-terms', { hasText: 'Who may nudge it: Nobody, allegedly, and only by a public nudge.' }).waitFor({ timeout: 30_000 });
  await page.locator('#e-terms', { hasText: 'A reply to anyone: needs a pick.' }).waitFor();
  await page.click('[data-action=machine-publish]');
  await done(page, 'Terms signed and published');
  // Its Terms tab: its terms in words, its cap and its key by its last four characters.
  await page.locator('#pane', { hasText: 'the shared key …6789' }).waitFor();
  assert.match((await page.locator('#pane').textContent()) ?? '', /Who may nudge it/);
  assert.ok(!(await page.content()).includes(KEY));

  // A stranger writes to it: notified, nothing drafted.
  await app.desk.signAndSend(id('A stranger'), { spec: NUDGE_SPECS.text, type: 0, payload: cborEncode(new Map([[0, 'Hello from a stranger.']])) as Uint8Array, public: true, to: [id('Machine, allegedly')], refs: [] });
  await sub(page, 'Queue');
  await page.click('[data-action=machine-look]');
  await page.locator('#queue-feed .k-act', { hasText: 'Hello from a stranger.' }).waitFor({ timeout: 60_000 });
  assert.equal(api.seen.length, 0);

  // Picked: answered at once.
  api.reply = answering({ text: 'Hello, stranger.', notClaimed: [] });
  await page.click('[data-action=machine-pick]');
  await done(page, 'Picked');
  assert.equal(api.seen.length, 1);
  assert.equal(await page.locator('#queue-feed .k-act').count(), 0);
  // What it did, in Talk: the answer, and why (the pick).
  await sub(page, 'Talk');
  await page.locator('#talk-feed .k-act', { hasText: 'Hello, stranger.' }).waitFor();
  await page.locator('#talk-feed .k-act', { hasText: /because: picked by Nobody, allegedly/ }).waitFor();

  // A nudge for one action, with words.
  api.reply = answering({ actions: [{ kind: 'post', answers: null, text: 'A post of my own choosing.' }], notClaimed: [] });
  await sub(page, 'Queue');
  await page.click('[data-action=nudge-open]');
  await page.fill('#machine-nudge input[name=count]', '1');
  await page.fill('#machine-nudge textarea[name=context]', 'Say something.');
  await page.click('#machine-nudge button[type=submit]');
  await done(page, 'Nudged');
  await sub(page, 'Talk');
  await page.locator('#talk-feed .k-act', { hasText: 'A post of my own choosing.' }).waitFor();
  await sub(page, 'Queue');
  assert.ok(!(await page.content()).includes(KEY));

  // Three acts selected and picked in one approval: shown together first, then one pick each, each answered.
  for (const t of ['Batch one.', 'Batch two.', 'Batch three.']) {
    await app.desk.signAndSend(id('A stranger'), { spec: NUDGE_SPECS.text, type: 0, payload: cborEncode(new Map([[0, t]])) as Uint8Array, public: true, to: [id('Machine, allegedly')], refs: [] });
  }
  await page.click('[data-action=machine-look]');
  await page.locator('#queue-feed .k-act', { hasText: 'Batch three.' }).waitFor({ timeout: 60_000 });
  await page.locator('#queue-feed .k-act', { hasText: 'Batch one.' }).waitFor({ timeout: 60_000 });
  const calls = api.seen.length;
  for (const box of await page.locator('#queue-feed input[name=pick-select]').all()) await box.check();
  api.reply = answering({ text: 'One of three, answered.', notClaimed: [] });
  await page.click('[data-action=machine-picks]');
  await page.locator('#e-picks-shown', { hasText: '3 picks, one for each act below' }).waitFor({ timeout: 30_000 });
  await page.locator('#e-picks-shown', { hasText: '“Batch two.”' }).waitFor();
  assert.equal(api.seen.length, calls, 'nothing signed or called by showing');
  if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'machine-picks-shown.png') });
  await page.click('[data-action=machine-pick-many]');
  await page.locator('#e-status .k-note.k-done', { hasText: 'Picked 3 acts' }).waitFor({ timeout: 60_000 });
  await page.locator('#e-status', { hasText: 'Answered (3):' }).waitFor();
  await page.click('#e-status [data-action=status-close]');
  assert.equal(api.seen.length, calls + 3);
  assert.equal(await page.locator('#queue-feed .k-act').count(), 0);
  assert.ok(!(await page.content()).includes(KEY));
  // MOR_SCREENSHOTS=DIR keeps a picture, for a person to look at.
  if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'machine-allegedly.png') });
  assert.deepEqual(problems, []);
});
