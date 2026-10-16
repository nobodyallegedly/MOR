// Edubba (F333) in a real browser: headless Chromium, a fresh profile, the
// launcher's link, then only clicks and typing. Real homes and a relay; a
// fake of Anthropic's API on a local port (no network, no real key).
//
// - First use: the window plugs in the API key, names the agent, makes its
//   owner and its identity, shows its terms, signs them; it shows once.
// - The Agents tab: the list on top (ID, display name, cap, key by its last
//   four characters), the selected agent below; the prompt box answers at
//   once; "+ Add an agent" with a key of its own; its queue, a pick; "MOR as
//   seen by this agent", following for it, and back.
// - The Identities tab: the list, the selected identity, a new identity.
// - The Collectives tab: Act (what you may do, each naming its rule; a
//   post; a picture needing the release area's signatures), its
//   constitution as a pop-up, the Constitution sub-tab (the collective
//   client's page).
// - Dub's look: #06080c, Inter served from the page's origin, no glow.
// - The key is never on the page, nor in the page's requests' answers.
//
// MOR_SCREENSHOTS=DIR keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { leaveInInbox, post as postAs } from '../../barebone/src/post.ts';
import { answering, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

const KEY = 'sk-ant-api03-FAKE-edubba-browser-never-real-WXYZ';
const OWN = 'sk-ant-api03-FAKE-second-agent-own-key-QRST';

let homes: Relay[];
let relay: Relay;
let app: Running;
let api: Fake;
let browser: Browser;
let home: string;
let page: Page;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  home = mkdtempSync(join(tmpdir(), 'edubba-home-'));
  app = await serve({
    dir: mkdtempSync(join(tmpdir(), 'edubba-browser-')),
    port: 0,
    drafts: mkdtempSync(join(tmpdir(), 'edubba-drafts-')),
    machineEvery: 0,
    machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: {}, home, today: () => '2026-10-16' },
  });
  browser = await chromium.launch({ executablePath: CHROMIUM });
  const context = await browser.newContext({ viewport: { width: 900, height: 1000 } });
  page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
});

after(async () => {
  await browser?.close();
  await app?.close();
  await api?.stop();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const said = (words: string | RegExp) => page.locator('#e-status .note.done', { hasText: words }).waitFor({ timeout: 90_000 });
const noKey = async () => {
  const html = await page.content();
  assert.ok(!html.includes(KEY) && !html.includes(OWN), 'no key on the page');
  assert.ok(!html.includes(KEY.slice(0, -4)) && !html.includes(OWN.slice(0, -4)), 'nothing of a key but its last four characters');
};

let AGENT: string;
let OWNER: string;

test('first use: the window plugs in the key, names the agent, makes it and its owner, shows and signs its terms; it shows once', async () => {
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('h1.mark', { hasText: 'Edubba' }).waitFor();
  assert.equal(await page.title(), 'Edubba');
  await page.locator('#e-window h2', { hasText: 'Plug in your first agent' }).waitFor();
  // The look (F332): the background, Inter from this page's own origin.
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(6, 8, 12)');
  assert.match(await page.evaluate(() => getComputedStyle(document.body).fontFamily), /^Inter/);
  assert.equal((await page.request.get(`${app.base}/inter_light.woff2`)).status(), 200);
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('*')].filter((x) => getComputedStyle(x).boxShadow !== 'none').length), 0, 'no glow, no shadow');
  await shot(page, '01-first-use');

  await page.fill('#agent-add textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await page.fill('#agent-add textarea[name=relays]', relay.base);
  await page.fill('#agent-add input[name=key]', KEY);
  await page.fill('#agent-add input[name=name]', 'Machine, allegedly');
  await page.selectOption('#agent-add select[name=owner]', '');
  await page.fill('#agent-add input[name=ownerName]', 'Nobody, allegedly');
  await page.click('#agent-add button[type=submit]');
  await said('is born: read its terms');
  // The key left the page: the field is empty, and only its last four characters are ever shown.
  assert.equal(await page.inputValue('#agent-add input[name=key]'), '');
  await page.locator('#e-terms', { hasText: 'Who may nudge it: Nobody, allegedly' }).waitFor();
  await noKey();
  await shot(page, '02-first-use-terms');
  // Kept in an owner-only file on this machine.
  const file = join(home, '.config', 'mor', 'anthropic-key');
  assert.equal(readFileSync(file, 'utf8').trim(), KEY);
  assert.equal(statSync(file).mode & 0o777, 0o600);
  assert.equal(statSync(join(home, '.config', 'mor')).mode & 0o777, 0o700);

  await page.click('[data-action=machine-publish]');
  await said('Terms signed and published');
  const s = app.agents.list();
  assert.equal(s.length, 1);
  AGENT = s[0].id;
  OWNER = app.agents.for(AGENT).state().owner!;
  assert.equal(s[0].name, 'Machine, allegedly');
  assert.ok(s[0].named, 'its display name published');
  // The list on top: by ID and display name, its cap and key beside it.
  const row = page.locator(`.entry[data-id="${AGENT}"]`);
  await row.waitFor();
  assert.match(await row.innerText(), /Machine, allegedly[\s\S]*0 of 20 calls today[\s\S]*shared key …WXYZ/);
  await page.locator('#e-terms-card', { hasText: 'Who may nudge it' }).waitFor();
  await noKey();
  // The window shows once: opened again, the Agents tab shows the list.
  await page.reload();
  await page.locator(`.entry[data-id="${AGENT}"]`).waitFor();
  assert.equal(await page.locator('#e-window').count(), 0);
  await shot(page, '03-agents');
});

test('the prompt box: an act, a private message sealed from the owner to the agent, answered at once', async () => {
  api.reply = answering({ text: 'I am here. The MICS says every act is signed.', notClaimed: [] });
  await page.fill('#agent-prompt textarea[name=text]', 'Are you there?');
  await page.click('#agent-prompt button[type=submit]');
  await page.locator('#e-agent-here .note.done', { hasText: 'answered at once, privately' }).waitFor({ timeout: 90_000 });
  await page.locator('#e-prompt .chat .msg.owner', { hasText: 'Are you there?' }).waitFor();
  await page.locator('#e-prompt .chat .msg.agent', { hasText: 'I am here.' }).waitFor();
  assert.equal(api.seen.at(-1)!.headers['x-api-key'], KEY);
  const prompted = app.store.history().find((h) => h.verdict === 'prompted')!;
  assert.equal(prompted.signer, OWNER, 'signed by the owner’s identity');
  assert.equal(prompted.agent, AGENT);
  assert.ok(app.store.signed(prompted.act!)?.sealed, 'sealed to the agent, and kept');
  await shot(page, '04-agent-prompt');
});

test('+ Add an agent: a second agent with a key of its own, its own cap; selected from the list', async () => {
  await page.click('[data-action=add-agent]');
  await page.locator('#e-window h2', { hasText: 'Add an agent' }).waitFor();
  await page.locator('#e-window', { hasText: 'A shared key is in place (…WXYZ)' }).waitFor();
  await shot(page, '05-add-agent');
  await page.fill('#agent-add input[name=key]', OWN);
  await page.check('#agent-add input[name=own]');
  await page.fill('#agent-add input[name=name]', 'Second agent');
  await page.selectOption('#agent-add select[name=owner]', OWNER);
  await page.click('#agent-add button[type=submit]');
  await said('is born');
  await page.click('[data-action=machine-publish]');
  await said('Terms signed and published');
  const second = app.agents.list().find((a) => a.name === 'Second agent')!;
  assert.equal(second.key.kind, 'own');
  assert.equal(readFileSync(join(home, '.config', 'mor', 'agents', `${second.id}.key`), 'utf8').trim(), OWN);
  assert.match(await page.locator(`.entry[data-id="${second.id}"]`).innerText(), /its own key …QRST/);
  // Its own cap.
  await page.fill('#machine-cap input[name=callsPerDay]', '5');
  await page.click('#machine-cap button[type=submit]');
  await page.locator(`.entry[data-id="${second.id}"]`, { hasText: '0 of 5 calls today' }).waitFor();
  assert.equal(app.agents.for(AGENT).state().callsPerDay, 20, 'the first agent keeps its own cap');
  await noKey();
  await page.click(`.entry[data-id="${AGENT}"]`);
  await page.locator('.head h2', { hasText: 'Machine, allegedly' }).waitFor();
});

test('its queue: a stranger’s message waits until picked; MOR as seen by this agent, following for it, and back', async () => {
  const stranger = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await stranger.publishGenesis();
  await stranger.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('rename', { id: stranger.id, name: 'A stranger' });
  const p = await postAs(stranger, { text: 'Hello, Machine.', relays: [relay.base], to: [AGENT] });
  // Left in its inbox (the relay its routes name), as a public message is.
  await leaveInInbox(stranger, p.act, [relay.base]);
  await page.click('[data-action=machine-look]');
  await page.locator('#e-queue .item', { hasText: 'Hello, Machine.' }).waitFor({ timeout: 60_000 });
  await shot(page, '06-agent-queue');
  api.reply = answering({ text: 'Hello, stranger.', notClaimed: [] });
  await page.click('#e-queue [data-action=machine-pick]');
  await said('Picked');

  // MOR as seen by this agent: follow the stranger for it; its feed shows the post.
  await page.click('[data-action=agent-view]');
  await page.locator('h2', { hasText: 'MOR as seen by Machine, allegedly' }).waitFor();
  await page.fill('#agent-follow input[name=who]', stranger.id);
  await page.fill('#agent-follow input[name=name]', 'The stranger');
  await page.click('#agent-follow button[type=submit]');
  await page.locator('.post', { hasText: 'Hello, Machine.' }).waitFor({ timeout: 60_000 });
  await page.locator('.post', { hasText: 'Hello, stranger.' }).waitFor();
  await page.locator('ul.plain li', { hasText: 'The stranger' }).waitFor();
  assert.deepEqual(app.store.people(AGENT).follows.map((f) => f.id), [stranger.id]);
  await shot(page, '07-agent-view');
  await page.click('[data-action=agent-back]');
  await page.locator('#e-prompt').waitFor();
});

test('the Identities tab: the list, the selected identity and what it received, a new identity', async () => {
  await page.click('[data-action=tab][data-tab=identities]');
  await page.locator(`.entry[data-id="${OWNER}"]`).waitFor();
  // Agents have their own tab: the Identities tab lists the other identities only.
  assert.equal(await page.locator(`.entry[data-id="${AGENT}"]`).count(), 0);
  await page.click(`.entry[data-id="${OWNER}"]`);
  await page.locator('.head h2', { hasText: 'Nobody, allegedly' }).waitFor();
  await page.click(`[data-action=refresh][data-identity="${OWNER}"]`);
  await page.locator(`[data-here-received="${OWNER}"] .note`).waitFor({ timeout: 60_000 });
  await page.locator('[data-pile=new] .item', { hasText: 'I am here.' }).waitFor();
  await shot(page, '08-identities');
  await page.click('.entry.add[data-id=new]');
  await page.fill('#new-identity input[name=name]', 'Me again');
  await page.click('#new-identity button[type=submit]');
  await said('“Me again” is born');
  await page.locator('.head h2', { hasText: 'Me again' }).waitFor();
});

test('the Collectives tab: what you may do, each naming its rule; a post; a picture needs the release area; its constitution; the Constitution sub-tab', async () => {
  // A test collective, made through the collective client's requests: you and two simulated members.
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'setup' });
  const confirm = async (args: object) => {
    const r = await c.ask<{ plan: string; digest: string }>('collective prepare', args);
    return c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest });
  };
  const ids: string[] = [];
  for (const [name, mine] of [['Me', true], ['Ana', false], ['Bo', false]] as const) ids.push((await confirm({ kind: 'identity', name, mine })).acts[0]);
  await confirm({ kind: 'found', name: 'The test collective', members: ids, rules: {} });

  await page.click('[data-action=tab][data-tab=collectives]');
  await page.reload();
  await page.click('[data-action=tab][data-tab=collectives]');
  const col = app.collectives.list()[0];
  await page.locator(`.entry[data-id="${col.id}"]`, { hasText: 'The test collective' }).waitFor();
  const may = page.locator('#e-may');
  await may.waitFor({ timeout: 90_000 });
  const text = await may.innerText();
  assert.match(text, /Post a text for it[\s\S]*You may[\s\S]*No area reaches a text[\s\S]*Agreements rule 60/i);
  assert.match(text, /You hold it\./, 'you hold the signing key');
  assert.match(text, /rule 59/);
  assert.match(text, /Post a picture for it[\s\S]*With others’ signatures[\s\S]*“Releases” area[\s\S]*cannot tell a release from a picture/i);
  assert.match(text, /rule 57/);
  assert.match(text, /Text rule 14, F334/);
  await shot(page, '09-collective-act');

  // A text post: reviewed, then signed.
  await page.fill('#collective-post textarea[name=text]', 'Hello from the collective.');
  await page.click('#collective-post button[type=submit]');
  await page.locator('#e-post-review #reading h2', { hasText: 'A post for the collective' }).waitFor({ timeout: 90_000 });
  await shot(page, '10-collective-post-review');
  await page.click('#e-post-review [data-action=confirm]');
  await said('Posted for');
  await page.locator('#e-status', { hasText: 'counts for the collective, on its own signature' }).waitFor();
  await page.locator('#e-posts .post', { hasText: 'Hello from the collective.' }).waitFor({ timeout: 60_000 });

  // A picture: the release area's signatures, by you and a simulated member, said.
  const jpeg = readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));
  await page.fill('#collective-post textarea[name=text]', 'With a picture.');
  await page.setInputFiles('#collective-post input[name=jpeg]', { name: 'phone.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  await page.click('#collective-post button[type=submit]');
  await page.locator('#e-post-review #reading', { hasText: '“Releases” area' }).waitFor({ timeout: 90_000 });
  await page.locator('#e-post-review #reading', { hasText: 'its consent simulated' }).waitFor();
  await page.click('#e-post-review [data-action=confirm]');
  await said('Posted for');
  await page.locator('#e-status', { hasText: 'The picture: counts for the collective, its area’s signatures met' }).waitFor();
  await page.locator('#e-posts .post img').first().waitFor({ timeout: 60_000 });
  // Verified in its feed, not flagged.
  assert.equal(await page.locator('#e-posts .flag.bad').count(), 0);
  await shot(page, '11-collective-posts');

  // Its constitution, as a pop-up, in plain words.
  await page.click('[data-action=constitution]');
  await page.locator('#e-dialog[open] h2', { hasText: 'The constitution of The test collective' }).waitFor({ timeout: 90_000 });
  await page.locator('#e-dialog', { hasText: 'Areas: who decides which acts' }).waitFor();
  await shot(page, '12-constitution');
  await page.click('[data-action=dialog-close]');

  // The Constitution sub-tab: the collective client's own page, for this collective.
  await page.click('[data-action=sub][data-sub=constitution]');
  await page.locator('#e-col-root .card[data-collective]', { hasText: 'The test collective' }).waitFor({ timeout: 90_000 });
  await page.fill('#e-col-root form.release input[name=version]', '0.1-test');
  await shot(page, '13-constitution-tab');
  // Founding, from "+ Found a collective".
  await page.click('.entry.add[data-id=found]');
  await page.locator('#e-col-root #found form').waitFor({ timeout: 60_000 });
  await shot(page, '14-found');
});

test('Settings, and no console error throughout', async () => {
  await page.click('[data-action=tab][data-tab=settings]');
  await page.locator('#e-col-settings #settings form').waitFor({ timeout: 60_000 });
  await shot(page, '15-settings');
  await noKey();
  assert.deepEqual(problems, []);
});

test('a draft from Claude for an agent is shown in its details on the Agents tab, approved there', async () => {
  const { connect } = await import('../../connector/test/world.ts');
  const { handed } = await import('./setup.ts');
  await app.desk.link(AGENT, true);
  const claude = await connect({ MOR_RELAYS: relay.base, MOR_DRAFTS: app.store.settings().drafts });
  try {
    const r = await claude.ask('mor_prepare_post', { signer: 'Machine, allegedly', text: 'Drafted for the agent.' });
    const digest = handed(r.text);
    await page.click('[data-action=tab][data-tab=agents]');
    await page.click(`.entry[data-id="${AGENT}"]`);
    const card = page.locator(`.draft[data-draft="${digest}"]`);
    await card.waitFor({ timeout: 30_000 });
    await shot(page, '16-agent-draft');
    await card.locator('[data-action=approve]').click();
    await said('Approved and signed');
  } finally {
    await claude.close();
  }
});
