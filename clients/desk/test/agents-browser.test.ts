// The Edubba agents session in a real browser (headless Chromium, by clicks
// and typing): the tabs in their new order with the Publishing placeholder;
// Edubba's emerald tint; an agent's notes read and one retired; its diary
// shown only after the deliberate "Read …'s diary" and its plain words; a
// grant read back, signed, and accepted by the agent; a post corrected from
// the Identities tab and labelled. Real homes and a relay; a fake of
// Anthropic's API. MOR_SCREENSHOTS=DIR keeps every new screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { SPECS, cborEncode } from '../../genesis/src/core.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { answering, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};
const KEY = 'sk-ant-api03-FAKE-agents-browser-never-real-MNOP';

let homes: Relay[];
let relay: Relay;
let app: Running;
let api: Fake;
let browser: Browser;
let page: Page;
let NA: string;
let MA: string;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  app = await serve({
    dir: mkdtempSync(join(tmpdir(), 'edubba-agents-browser-')),
    port: 0,
    drafts: mkdtempSync(join(tmpdir(), 'edubba-drafts-')),
    machineEvery: 0,
    machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: { ANTHROPIC_API_KEY: KEY }, today: () => '2026-10-16' },
  });
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'setup' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  NA = (await c.ask<Done>('identity', { name: 'Nobody, allegedly', linked: false })).acts[0];
  MA = (await c.ask<Done>('identity', { name: 'Machine, allegedly', linked: false })).acts[0];
  const shown = await c.ask<{ digest: string }>('machine terms', { agent: MA, owner: NA });
  await c.ask('machine publish', { agent: MA, owner: NA, digest: shown.digest });
  // A note made from a prompt, and a diary entry, both sealed to the agent at its homes.
  api.reply = answering({ text: 'Understood.', notClaimed: [], memory: { add: [{ kind: 'instruction', about: null, text: 'Sign every answer “M.”' }], retire: [] } });
  await c.ask('agent prompt', { agent: MA, text: 'Always sign your answers “M.”' });
  await app.agents.for(MA).memory.writeDiary(MA, { day: '2026-10-15', striking: 'Being asked to sign with one letter.', reflection: 'A small mark of identity.', why: 'I notice names, perhaps because I have one I did not choose.' });
  await app.desk.signAndSend(NA, { spec: SPECS.text, type: 0, payload: cborEncode(new Map([[0, 'The house opens at nine.']])) as Uint8Array, public: true, to: [], refs: [] });
  browser = await chromium.launch({ executablePath: CHROMIUM });
  page = await (await browser.newContext({ viewport: { width: 900, height: 1100 } })).newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('dialog', (d) => void d.accept(d.type() === 'prompt' ? 'Done with it.' : undefined));
});

after(async () => {
  await browser?.close();
  await app?.close();
  await api?.stop();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

/** Open a fold, whatever it was (folds are remembered by the program). */
const unfold = (sel: string) => page.locator(sel).evaluate((d) => ((d as HTMLDetailsElement).open = true));
const said = (words: string | RegExp) => page.locator('#e-status .note', { hasText: words }).waitFor({ timeout: 90_000 });

test('the tabs: Agents, Collectives, Publishing (a placeholder), Identities last; Edubba’s emerald tint', async () => {
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('h1.mark', { hasText: 'Edubba' }).waitFor();
  assert.deepEqual(await page.locator('nav.tabs .tab').allInnerTexts(), ['Agents', 'Collectives', 'Publishing', 'Identities']);
  assert.deepEqual(
    await page.evaluate(() => ['--line', '--edge', '--tint'].map((v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim())),
    ['#153028', '#1a3f32', '#2e7659'],
  );
  await page.click('[data-action=tab][data-tab=publishing]');
  await page.locator('.card', { hasText: 'Coming after Damgar’s round 2' }).waitFor();
  await shot(page, 'agents-01-publishing');
  await page.click('[data-action=tab][data-tab=agents]');
});

test('its notes, read in its details and retired by a click; its diary shown nowhere until read on purpose', async () => {
  await page.locator('#e-memory-card').waitFor({ timeout: 60_000 });
  await unfold('#e-memory-card');
  await page.locator('#e-memory-card .item', { hasText: 'Sign every answer “M.”' }).waitFor();
  assert.match(await page.locator('#e-memory-card').innerText(), /Whoever holds the agent’s signing key’s words can read them/);
  assert.match(await page.locator('#e-memory-card').innerText(), /every day[\s\S]*on a day it did nothing, it reflects on itself instead[\s\S]*one call to Claude a day, counted under its cap, quiet days included/);
  assert.ok(!(await page.content()).includes('I notice names'), 'the diary is shown nowhere by default');
  await shot(page, 'agents-02-notes');
  await page.click('#e-memory-card [data-action=diary-ask]');
  await page.locator('#e-diary', { hasText: 'You are about to read what Machine, allegedly wrote for itself' }).waitFor();
  assert.ok(!(await page.content()).includes('I notice names'), 'still not shown: only said what reading it means');
  await shot(page, 'agents-03-diary-ask');
  await page.click('[data-action=diary-read]');
  await page.locator('#e-diary', { hasText: 'I notice names' }).waitFor();
  await shot(page, 'agents-04-diary');
  await page.click('[data-action=diary-close]');
  await page.click('#e-memory-card [data-action=note-retire]');
  await said('Note retired');
  await page.locator('#e-memory-card summary', { hasText: 'Its notes (0)' }).waitFor();
});

test('a grant: read back in plain words, signed, the agent asked and accepting by its signature', async () => {
  await unfold('#e-grants-card');
  await page.fill('#grant-form input[name=cap]', '1000');
  await page.click('#grant-form button[type=submit]');
  await page.locator('#e-grant-shown', { hasText: 'at most 1000 regtest satoshis' }).waitFor();
  await shot(page, 'agents-05-grant-shown');
  api.reply = answering({ accept: true, why: 'Within these limits, yes.' });
  await page.click('[data-action=grant-sign]');
  await said('Granted and accepted');
  await page.locator('#e-grants-card').waitFor();
  await unfold('#e-grants-card');
  await page.locator('#e-grants-card .item', { hasText: 'accepted by its signature' }).waitFor();
  await shot(page, 'agents-06-granted');
});

test('a post corrected from the Identities tab, labelled; the original shown “corrected by”; no console error', async () => {
  await page.click('[data-action=tab][data-tab=identities]');
  await page.locator('#e-identity-posts').waitFor({ state: 'attached', timeout: 60_000 });
  await unfold('#e-identity-posts');
  await page.locator('#e-identity-posts details.correct summary').first().click();
  await page.fill('#e-identity-posts form.correct-form textarea', 'The house opens at ten.');
  await page.click('#e-identity-posts form.correct-form button[type=submit]');
  await said('Correction signed');
  await page.locator('#e-identity-posts .post').first().waitFor({ state: 'attached', timeout: 60_000 });
  await unfold('#e-identity-posts');
  await page.locator('#e-identity-posts .post', { hasText: 'The house opens at ten.' }).locator('.label', { hasText: 'Correction' }).waitFor();
  await page.locator('#e-identity-posts .post', { hasText: 'The house opens at nine.' }).locator('div.small', { hasText: /^Corrected by / }).waitFor();
  await shot(page, 'agents-07-corrected');
  assert.deepEqual(problems, []);
});
