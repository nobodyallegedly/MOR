// Edubba on the kit (round 4 of the redesign, 22 October 2026), in a real
// browser: headless Chromium, a fresh profile, the launcher's link, then
// only clicks and typing, at a Mac's size (1280×800) and a phone's
// (390×844). Real homes and a relay; a fake of Anthropic's API on a local
// port (no network, no real key).
//
// - The first screen; an identity made from the identity panel's + Add.
// - Four tiles with their danger marks (Agents 2, Collectives 3, Publishing
//   2, Vows 2); each opening its column; the tabs; back to the tiles.
// - Agents: + Add an agent, its terms signed; its four tabs: Talk (the
//   prompt answered in the feed box, the typing box at the bottom), Queue
//   (an outsider's note picked), Mind (its notes; the diary only after the
//   public act: shown, Not now opens nothing, then signed, accepted by a
//   home and only then opened), Terms (answering, cap, key, grants).
// - The API key by its last four characters only; no key on the page.
// - Collectives: a test collective founded (the collective client's kept
//   screens), its Act tab (permissions as chips, a post reviewed and signed,
//   shown as a card with the kit's two menus), its constitution in plain
//   words, top right.
// - Publishing (way 1, Upload, round 8): who acts, what (a text, a picture,
//   a video, an audio); an audio stripped, a price tag on it, read back, then
//   signed; Published here; Sales.
// - Vows: a vow read back and signed; Track pointing at its signer.
// - The identity panel: identities, + Add's three ways, the menu, Remove
//   said plainly; the foot, "This app".
// - The phone: tiles stacked, a tile opening on its column, ← Back.
// - No console error; no finding number on any screen.
//
// MOR_SCREENSHOTS=DIR keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { leaveInInbox, post as postAs } from '../../barebone/src/post.ts';
import { answering, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';
import { DIARY_RULE_SAY } from '../src/agents.ts';
import { closeAll, dub } from '../../damgar/test/world.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`) });
};
const KEY = 'sk-ant-api03-FAKE-edubba-kit-never-real-WXYZ';
const M4A = readFileSync(new URL('../../../modules/audio/test/fixtures/tagged.m4a', import.meta.url));

let homes: Relay[];
let relay: Relay;
let app: Running;
let api: Fake;
let browser: Browser;
let page: Page;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  app = await serve({
    dir: mkdtempSync(join(tmpdir(), 'edubba-kit-')),
    port: 0,
    machineEvery: 0,
    kishib: mkdtempSync(join(tmpdir(), 'edubba-kit-no-kishib-')),
    collective: mkdtempSync(join(tmpdir(), 'edubba-kit-collective-')),
    machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: {}, home: mkdtempSync(join(tmpdir(), 'edubba-kit-home-')), today: () => '2026-10-22' },
  });
  browser = await chromium.launch({ executablePath: CHROMIUM });
  page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
});

after(async () => {
  await closeAll();
  await browser?.close();
  await app?.close();
  await api?.stop();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = async (words: string | RegExp) => {
  await page.locator('.k-note.k-done', { hasText: words }).first().waitFor({ timeout: 90_000 });
  // The note is read; closed, so it covers nothing.
  if (await page.locator('#e-status [data-action=status-close]').count()) await page.click('#e-status [data-action=status-close]');
};
const col = (label: string | RegExp) => page.locator('.k-col button', { hasText: label }).first().click();
const tabTo = (name: string) => page.locator('.k-top .k-tab', { hasText: name }).click();
const subTo = async (name: string | RegExp) => {
  await page.locator('.edubba-tabs button', { hasText: name }).click();
  // The tab drawn open before anything is typed in it.
  await page.locator('.edubba-tabs button.k-on', { hasText: name }).waitFor();
};
const noFinding = async () => assert.doesNotMatch(await page.locator('#app').innerText(), /\bF\d{3}\b/, 'no finding number on screen');

let ME = '';

test('the first screen, then an identity made from + Add, and the four tiles with their danger marks', async () => {
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('h2', { hasText: 'First, an identity' }).waitFor();
  assert.equal(await page.title(), 'Edubba');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(6, 8, 12)');
  await shot(page, 'mac-01-first-screen');
  await page.click('[data-add=make]');
  await page.fill('.k-modal #desk-settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await page.fill('.k-modal #desk-settings textarea[name=relays]', relay.base);
  await page.click('.k-modal #desk-settings button[type=submit]');
  await page.locator('.k-modal .k-note.k-done', { hasText: 'Settings saved' }).waitFor({ timeout: 60_000 });
  await page.fill('.k-modal #new-identity input[name=name]', 'Max');
  await shot(page, 'mac-02-make');
  await page.click('.k-modal #new-identity button[type=submit]');
  await page.locator('.k-tile').first().waitFor({ timeout: 60_000 });
  ME = app.store.book().identities.find((i) => i.name === 'Max')!.id;
  const tiles = await page.locator('.k-tile').evaluateAll((ts) => ts.map((t) => [t.querySelector('h2')!.textContent, t.querySelector('.k-dm')!.className]));
  assert.deepEqual(tiles, [
    ['Agents', 'k-dm k-l2'],
    ['Collectives', 'k-dm k-l3'],
    ['Publishing', 'k-dm k-l2'],
    ['Vows', 'k-dm k-l2'],
  ]);
  assert.match(await page.locator('.k-me').innerText(), /Max/);
  await noFinding();
  if (await page.locator('#e-status [data-action=status-close]').count()) await page.click('#e-status [data-action=status-close]');
  await shot(page, 'mac-03-home');
});

test('Agents: + Add an agent, its terms signed; the API key by its last four characters', async () => {
  await page.click('[data-k-tile=agents]');
  await page.locator('#agent-add').waitFor();
  await page.fill('#agent-add input[name=key]', KEY);
  await page.fill('#agent-add input[name=name]', 'Machine, allegedly');
  await page.selectOption('#agent-add select[name=owner]', ME);
  await page.click('#agent-add button[type=submit]');
  await page.locator('#e-terms', { hasText: 'Who may nudge it' }).waitFor({ timeout: 90_000 });
  assert.ok(!(await page.content()).includes(KEY), 'no key on the page');
  await page.click('[data-action=machine-publish]');
  await page.locator('.edubba-tabs button', { hasText: 'Terms' }).waitFor({ timeout: 90_000 });
  await page.locator('.edubba-head h2', { hasText: 'Machine, allegedly' }).waitFor();
  await shot(page, 'mac-10-agent-terms');
  await col('The API key');
  await page.locator('#pane', { hasText: '…WXYZ' }).waitFor();
  assert.ok(!(await page.content()).includes(KEY.slice(0, -4)), 'nothing of the key but its last four');
  await shot(page, 'mac-11-api-key');
});

test('Agents › Terms: a grant read back in plain words, signed, the agent asked and accepting by its signature', async () => {
  await col('Machine, allegedly');
  await subTo('Terms');
  await page.locator('#grant-form').waitFor();
  await page.click('#grant-form button[type=submit]');
  await page.locator('#e-grant-shown', { hasText: 'The grant, before you sign it' }).waitFor({ timeout: 60_000 });
  api.reply = answering({ accept: true, why: 'Within these limits, yes.' });
  await page.click('[data-action=grant-sign]');
  await page.locator('.k-note', { hasText: /accepted/ }).first().waitFor({ timeout: 90_000 });
  await page.locator('#e-grants', { hasText: '1 in force' }).waitFor({ timeout: 60_000 });
  await shot(page, 'mac-17-agent-grant');
});

test('Agents › Talk: the prompt is a sealed act, answered at once, both in the feed box; the typing box at the bottom', async () => {
  await col('Machine, allegedly');
  await subTo('Talk');
  api.reply = answering({ text: 'The tablet house opens at ten.', notClaimed: [], memory: { add: [{ kind: 'instruction', about: null, text: 'Keep answers short.' }], retire: [] } });
  await page.fill('#agent-prompt textarea', 'When does the tablet house open?');
  await page.click('#agent-prompt button[type=submit]');
  await page
    .locator('#talk-feed .k-act', { hasText: 'The tablet house opens at ten.' })
    .waitFor({ timeout: 90_000 })
    .catch(async (e) => {
      throw new Error(`${e}\nEdubba showed: ${(await page.locator('body').innerText()).slice(-1200)}`);
    });
  await page.locator('#talk-feed .k-act', { hasText: 'When does the tablet house open?' }).waitFor();
  // The kit's two menus on a card: the act's ID bottom right.
  await page.locator('#talk-feed .k-act .k-actid').first().click();
  await page.locator('.k-pop button', { hasText: 'Copy act ID' }).waitFor();
  await page.keyboard.press('Escape');
  await shot(page, 'mac-12-agent-talk');
});

test('Agents › Mind: its notes, and its diary only after the public act, signed and accepted by a home', async () => {
  await subTo('Mind');
  await page.locator('#pane', { hasText: 'Its notes' }).waitFor();
  await page.click('[data-action=diary-ask]');
  await page.locator('.edubba-diary', { hasText: 'I have read Machine, allegedly’s diary, on' }).waitFor();
  assert.match(await page.locator('.edubba-diary').innerText(), /public/);
  await page.locator('.edubba-diary .k-say summary').click();
  await page.locator('.edubba-diary', { hasText: DIARY_RULE_SAY.slice(0, 40) }).waitFor();
  await shot(page, 'mac-13-diary-act');
  // Not now opens nothing.
  await page.click('[data-action=diary-close]');
  assert.equal(await page.locator('.edubba-diary .item').count(), 0);
  await page.click('[data-action=diary-ask]');
  await page.click('[data-action=diary-sign]');
  await page.locator('.edubba-diary', { hasText: 'Opened after your public act' }).waitFor({ timeout: 90_000 });
  await shot(page, 'mac-14-diary-open');
  const h = app.store.history().find((x) => x.verdict === 'diary read');
  assert.ok(h?.act, 'the public act is recorded');
});

test('Agents › Queue: an outsider’s note waits until picked; MOR as seen by it', async () => {
  const agent = app.agents.list()[0].id;
  const stranger = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await stranger.publishGenesis();
  await stranger.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const p = await postAs(stranger, { text: 'Machine, allegedly: what is a vow sold many times?', relays: [relay.base], to: [agent] });
  await leaveInInbox(stranger, p.act, [relay.base]);
  await subTo('Queue');
  await page.click('[data-action=machine-look]');
  await page.locator('#queue-feed .k-act', { hasText: 'what is a vow sold many times?' }).waitFor({ timeout: 60_000 });
  await shot(page, 'mac-15-agent-queue');
  api.reply = answering({ text: 'One vow, many sales, each with its own state.', notClaimed: [] });
  await page.click('#queue-feed [data-action=machine-pick]');
  await done('Picked');
  await subTo('Mind');
  await page.click('[data-action=agent-view]');
  await page.locator('.k-modal h3', { hasText: 'MOR as seen by Machine, allegedly' }).waitFor();
  await shot(page, 'mac-16-agent-view');
  await page.click('.k-modal [data-k-popup=close]');
});


test('Collectives: a real collective founded by Max; Act with its permissions as chips, a post signed, its card; its constitution top right; no test collective offered', async () => {
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'setup' });
  // Ana and Bo, each in their own Dub, accept Max's founding there (test collectives are gone from Edubba: decided).
  const H = homes.map((h) => h.base);
  const ana = await dub(H, [relay.base]);
  const bo = await dub(H, [relay.base]);
  await c.ask('real contact add', { id: ana.id, name: 'Ana' });
  await c.ask('real contact add', { id: bo.id, name: 'Bo' });
  const all = [ME, ana.id, bo.id];
  // Text and Envelopes, any one member alone; Money, Agreements and Development, any two (F402: every layer named); shares even.
  const row = (number: number) => ({ holders: all, number });
  const grid = { members: all, constitution: { holders: all, number: 3 }, chainKey: 2, absence: 2, layers: { 1: row(1), 2: row(1), 3: row(2), 4: row(2), 5: row(2) }, areas: [], clone: 2, shares: { [all[0]]: 33.3334, [all[1]]: 33.3333, [all[2]]: 33.3333 } };
  const rv = await c.ask<any>('real found prepare', { name: 'Three tablets', founder: ME, members: [ana.id, bo.id], grid });
  const terms = (await c.ask<Done>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  for (const m of [ana, bo]) {
    await m.c.ask('signing', { on: true });
    const pr = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: pr.thread });
  }
  await c.ask('real gather', { act: terms });
  await c.ask<Done>('real found', { act: terms, read: true });
  await page.reload();
  await tabTo('Collectives');
  await page.locator('.edubba-head h2', { hasText: 'Three tablets' }).waitFor({ timeout: 60_000 });
  await page.locator('.edubba-chips .k-chip').first().waitFor({ timeout: 90_000 });
  const column = await page.locator('.k-col').innerText();
  assert.match(column, /Three tablets[\s\S]*To sign[\s\S]*\+ Found a collective[\s\S]*\+ Bring a collective/);
  assert.doesNotMatch(column, /test collective/i);
  await page.fill('#collective-post textarea', 'The tablet house opens on Tuesday.');
  await page.click('#collective-post button[type=submit]');
  await page.locator('#collective-feed .k-act', { hasText: 'The tablet house opens on Tuesday.' }).waitFor({ timeout: 90_000 });
  await shot(page, 'mac-20-collective-post');
  await page.locator('#collective-feed .k-act .k-actid').first().click();
  await page.locator('.k-pop button', { hasText: 'Rely on it' }).waitFor();
  await shot(page, 'mac-21-collective-act-menu');
  await page.keyboard.press('Escape');
  assert.equal(await page.inputValue('form#collective-post [name=text]'), '', 'the typing box is empty once the post is signed');
  await shot(page, 'mac-22-collective-act');
  await page.click('[data-action=constitution]');
  await page.locator('.k-modal', { hasText: 'Areas: who decides which acts' }).waitFor({ timeout: 90_000 });
  await shot(page, 'mac-23-constitution');
  await page.click('.k-modal [data-k-popup=close]');
  await col('+ Found a collective');
  await page.locator('#real-found').waitFor();
  await shot(page, 'mac-25-found');
  // H118: you and one other, + Add a member; H120: one choice per layer, each kind the core defines, in words.
  assert.equal(await page.locator('#real-found [data-member-row]').count(), 2);
  await page.fill('#real-found input[name=member-2]', 'cd'.repeat(32));
  await page.locator('#real-found input[name=member-2]').dispatchEvent('change');
  const area = page.locator('#e-grid-real-found tr[data-area="0"]');
  await area.waitFor({ timeout: 30_000 });
  assert.deepEqual(await area.locator('select[data-grid-layer] option').allInnerTexts(), ['Text', 'Envelopes', 'Text and Envelopes, together', 'Money', 'Agreements', 'Development']);
  await area.locator('select[data-grid-layer]').selectOption('3');
  await page.locator('#e-grid-real-found tr[data-area="0"] [data-grid-some]').check();
  const kinds = await page.locator('#e-grid-real-found tr.kinds').innerText();
  for (const k of ['work claims', 'keepers’ records', 'negotiation messages', 'issuance offers']) assert.ok(kinds.includes(k), k);
  await shot(page, 'mac-26-found-agreements-kinds');
});

test('Publishing, way 1 (Upload, round 8): who acts, what; an audio (M4A) stripped by the audio Module, a price tag on it, read back, signed; Published here', async () => {
  await tabTo('Publishing');
  await page.locator('h2', { hasText: 'Upload' }).waitFor();
  await page.locator('button[data-media=audio]').click();
  await page.locator('#pub-upload[data-media=audio]').waitFor();
  await page.locator('#pub-upload input[name=file]').waitFor();
  await page.setInputFiles('#pub-upload input[name=file]', { name: 'reading-thursday.m4a', mimeType: 'audio/mp4', buffer: M4A });
  await page.fill('#pub-upload input[name=title]', 'The reading, recorded');
  await page.check('#pub-upload input[name=then][value=price]');
  await page.fill('#pub-upload input[name=price]', '1500');
  await shot(page, 'mac-30-publishing-audio');
  await page.click('#pub-upload button[type=submit]');
  await page.locator('#e-pub-review #reading', { hasText: 'Upload a recording' }).waitFor({ timeout: 90_000 });
  await page.locator('#e-pub-review #reading', { hasText: 'Stripped from the recording before it is locked' }).waitFor();
  await shot(page, 'mac-31-publishing-review');
  await page.click('#e-pub-review [data-action=confirm]');
  await page.locator('#here-feed .k-act', { hasText: 'The reading, recorded' }).waitFor({ timeout: 90_000 });
  await shot(page, 'mac-32-published-here');
  // A file the Module refuses: refused in plain words, nothing signed.
  await col('1 · Upload');
  await page.locator('button[data-media=audio]').click();
  await page.locator('#pub-upload[data-media=audio]').waitFor();
  await page.setInputFiles('#pub-upload input[name=file]', { name: 'not.m4a', mimeType: 'audio/mp4', buffer: readFileSync(new URL('../../../modules/audio/test/fixtures/with-picture.m4a', import.meta.url)) });
  await page.fill('#pub-upload input[name=title]', 'A picture inside');

  await page.click('#pub-upload button[type=submit]');
  await page.locator('#e-pub-review #reading').waitFor({ timeout: 90_000 });
  await shot(page, 'mac-33-publishing-refused');
  assert.match(await page.locator('#e-pub-review').innerText(), /not a recording the audio Module plays/);
});

test('Vows: a new vow read back and signed; Track pointing at its signer', async () => {
  await tabTo('Vows');
  await col('A new vow');
  await page.fill('#pub-vow textarea[name=words]', 'A seat at the reading of the tablets.');
  await page.fill('#pub-vow input[name=title]', 'A seat');
  await page.fill('#pub-vow input[name=price]', '500');
  await page.click('#pub-vow button[type=submit]');
  await page.locator('#e-vow-review #reading').waitFor({ timeout: 90_000 });
  await page.click('#e-vow-review [data-action=confirm]');
  await page.locator('#mine-feed .k-act', { hasText: 'A seat' }).waitFor({ timeout: 90_000 });
  await col('Track');
  await page.locator('#track-feed').waitFor();
  await shot(page, 'mac-40-vows-track-first');
  await page.locator('#track-feed .k-act', { hasText: 'A seat at the reading' }).waitFor({ timeout: 90_000 });
  await shot(page, 'mac-40-vows-track');
});

test('the identity panel: identities, + Add with three ways, the menu, Remove said plainly, the foot', async () => {
  await page.click('[data-k-open=identity]');
  await page.locator('.k-panel .k-idrow.k-on', { hasText: 'Max' }).waitFor();
  await page.click('.k-panel [data-k-add=toggle]');
  assert.match(await page.locator('.k-panel').innerText(), /Make one[\s\S]*Bring one[\s\S]*Use one from Kišib/);
  await shot(page, 'mac-50-identity-panel');
  await page.click(`.k-panel [data-k-idmenu="${ME}"]`);
  await page.locator('.k-pop button', { hasText: 'Line and homes' }).waitFor();
  await shot(page, 'mac-51-identity-menu');
  await page.locator('.k-pop button', { hasText: 'Remove from Edubba' }).click();
  await page.locator('[data-k-confirm] [data-k-remove]', { hasText: 'Max itself is not touched' }).waitFor();
  await shot(page, 'mac-52-remove-said');
  await page.click('[data-k-confirm] [data-k-remove-no]');
  await page.click('.k-panel [data-action=this-app]');
  await page.locator('.k-modal #desk-settings').waitFor();
  await shot(page, 'mac-53-this-app');
  await page.click('.k-modal [data-k-popup=close]');
  await noFinding();
});

test('H125: Agents and Collectives follow the identity in use: a second identity with none says so; switching back shows Max’s again', async () => {
  // Bob, made from the identity panel's + Add: in use at once.
  await page.click('[data-k-open=identity]');
  await page.click('.k-panel [data-k-add=toggle]');
  await page.click('.k-panel [data-k-add=make]');
  await page.locator('.k-modal #new-identity').waitFor();
  await page.fill('.k-modal #new-identity input[name=name]', 'Bob');
  await page.click('.k-modal #new-identity button[type=submit]');
  await page.locator('.k-me', { hasText: 'Bob' }).waitFor({ timeout: 60_000 });
  await page.click('.k-modal [data-k-popup=close]').catch(() => undefined);
  if (await page.locator('#e-status [data-action=status-close]').count()) await page.click('#e-status [data-action=status-close]');
  const column = async (tile: string) => {
    await page.click('[data-action=home-tiles]');
    await page.click(`[data-k-tile=${tile}]`);
    await page.locator('.k-col').waitFor();
    return page.locator('.k-col').innerText();
  };
  let agents = await column('agents');
  assert.match(agents, /No agents for Bob yet/i);
  assert.doesNotMatch(agents, /Machine, allegedly/);
  assert.match(agents, /\+ Add an agent/);
  let cols = await column('collectives');
  assert.match(cols, /No collectives for Bob yet/i);
  assert.doesNotMatch(cols, /Three tablets/);
  await shot(page, 'mac-55-bob-collectives');
  // Back to Max: his agent and his test collective again.
  await page.click('[data-k-open=identity]');
  await page.locator(`.k-panel [data-k-use="${ME}"]`).click();
  await page.locator('.k-me', { hasText: 'Max' }).waitFor({ timeout: 60_000 });
  agents = await column('agents');
  assert.match(agents, /Machine, allegedly/);
  assert.doesNotMatch(agents, /No agents for/i);
  cols = await column('collectives');
  assert.doesNotMatch(cols, /No collectives for/i);
  assert.match(cols, /Three tablets/);
  await noFinding();
});

test('the phone: tiles stacked, a tile opening on its column, ← Back', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('[data-action=home-tiles]');
  await page.locator('.k-tile').first().waitFor();
  await shot(page, 'phone-01-home');
  await page.click('[data-k-tile=collectives]');
  await page.locator('.edubba-head h2').waitFor();
  await shot(page, 'phone-02-collective');
  await page.locator('.k-back').click();
  await page.locator('.k-col').waitFor();
  await shot(page, 'phone-03-collectives-column');
  await page.setViewportSize({ width: 1280, height: 800 });
});

test('no console error', () => {
  assert.deepEqual(problems, []);
});
