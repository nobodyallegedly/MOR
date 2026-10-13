// dubsar.org's feed page (F275; website cMIP draft 7, rules 13a and 13b) in a
// real browser on a phone's screen, a fresh profile each time: the page as
// the site holds it, with two test identities in place of Nobody, allegedly,
// and Machine, allegedly, each on its own home, posting and receiving at its
// own relay. A visitor writes from the page, privately and publicly, and the
// owner's inbox holds the note, sealed or not. A public note is shown only
// beside a reply of either identity that names it, labelled by who picked
// it. Real homes and relays on local ports; test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Frame, type Page } from 'playwright-core';
import { cborEncode, describeAct, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { post, textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { parseGatewaySettings } from '../src/settings.ts';
import { NUDGE, NUDGE_TYPES } from '../src/specs.ts';
import { writeNote } from '../src/write.ts';
import { benign, SITE_DIR } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;
const NA = '1fc19135ea25e19bcd213e7bc610091f8248cef76a4683d582b8d4a69b6ec144';
const MA = '02a6585ffa967e3c8b7a4bf0b8dadda4890a03ee814b7f9200e2da5c789bc0e3';

let browser: Browser;
let gateway: Gateway;
let base: string;
const running: Running[] = [];
let nobody: TestIdentity;
let machine: TestIdentity;
let out1: Running;
let out2: Running;
let home1: Running;
let home2: Running;
let places: string[];
const ids: Record<string, string> = {};

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  [home1, home2] = [await start('home'), await start('home')];
  const site = await start('relay');
  [out1, out2] = [await start('relay'), await start('relay')];
  running.push(home1, home2, site, out1, out2);

  // Each on its own home; each posts and receives at its own relay.
  nobody = TestIdentity.create({ homes: [home1.home] });
  machine = TestIdentity.create({ homes: [home2.home] });
  for (const [who, relay] of [
    [nobody, out1],
    [machine, out2],
  ] as const) {
    await who.publishGenesis();
    await who.publishRoutes([
      { scope: null, hints: [relay.base], kind: 0 },
      { scope: null, hints: [relay.base], kind: 1 },
    ]);
    await who.publishEncryptionKey();
  }
  places = [site.base, home1.base, home2.base];

  // Visitors' public notes, written as the page writes them.
  const note = async (to: TestIdentity, text: string) =>
    (await writeNote({ text, to: to.id, public: true, places, homes: [home1.base] })).note;
  ids.picked = await note(machine, 'A note Nobody, allegedly, picked for Machine to answer.');
  ids.nudged = await note(machine, 'A note Machine chose under a nudge.');
  ids.ownAnswer = await note(nobody, 'A note Nobody, allegedly, answers himself.');
  ids.unanswered = await note(machine, 'A note nobody answers, never to be shown.');

  // Machine's agency terms, its owner's pick and nudge (nudge cMIP draft 2), and the replies.
  const nudgeAct = (by: TestIdentity, type: number, payload: Map<number, unknown>, relays: string[]) =>
    by.publish(NUDGE, type, cborEncode(payload), { public: true, relays });
  const terms = await nudgeAct(machine, NUDGE_TYPES.terms, new Map<number, unknown>([[0, [unhex(nobody.id)]], [1, [[1, null, false]]], [5, [unhex(nobody.id)]]]), [out2.base]);
  const pick = await nudgeAct(nobody, NUDGE_TYPES.pick, new Map<number, unknown>([[0, unhex(machine.id)], [1, unhex(terms.id)], [2, unhex(ids.picked)]]), [out1.base]);
  const nudge = await nudgeAct(nobody, NUDGE_TYPES.nudge, new Map<number, unknown>([[0, unhex(machine.id)], [1, unhex(terms.id)], [2, 1]]), [out1.base]);
  const reply = async (by: TestIdentity, text: string, refs: string[], relays: string[]) =>
    (await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(text), { public: true, relays, refs })).id;
  ids.n1 = (await post(nobody, { text: 'A post of Nobody, allegedly.', relays: [out1.base] })).id;
  ids.replyPicked = await reply(machine, 'Machine answers the note that was picked.', [pick.id, ids.picked], [out2.base]);
  ids.replyNudged = await reply(machine, 'Machine answers a note it chose.', [nudge.id, ids.nudged], [out2.base]);
  ids.replyOwn = await reply(nobody, 'Nobody, allegedly, answers himself.', [ids.ownAnswer], [out1.base]);

  // The site, its feed page carrying the test identities in place of the real ones.
  const dir = mkdtempSync(join(tmpdir(), 'mor-site-feed-page-'));
  cpSync(SITE_DIR, dir, { recursive: true });
  const page = join(dir, 'feed.html');
  writeFileSync(page, readFileSync(page, 'utf8').replaceAll(NA, nobody.id).replaceAll(MA, machine.id));
  const v = await publishSite(nobody, { name: 'dubsar.org', files: readFolder(dir), relays: [site.base] });
  gateway = new Gateway(
    parseGatewaySettings({
      listen: '127.0.0.1:0',
      look: 0,
      sites: [{ hosts: ['127.0.0.1'], version: v.id, identity: nobody.id, name: 'Nobody, allegedly', relays: places, serve: 'pinned', messageHomes: [home1.base] }],
    }),
    join(here, 'dist'),
    { extraConnect: ['http://127.0.0.1:*'] },
  );
  assert.ok((await gateway.load()).every((s) => s.loaded.ok));
  base = await gateway.listen('127.0.0.1', 0);
  browser = WEBKIT ? await webkit.launch() : await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  gateway?.close();
  for (const r of running) await r.stop().catch(() => {});
});

async function open(path: string) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: !WEBKIT, hasTouch: true });
  const page = await ctx.newPage();
  const problems: string[] = [];
  const elsewhere: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !benign(m.text()) && !/Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => {
    if (!benign(String(e))) problems.push(String(e));
  });
  page.on('request', (r) => {
    if (!/^(http:\/\/127\.0\.0\.1:|blob:|data:|about:)/.test(r.url())) elsewhere.push(r.url());
  });
  await page.goto(`${base}${path}`);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  return { page, ctx, problems, elsewhere };
}

async function feedFrame(page: Page): Promise<Frame> {
  const outer = (await (await page.waitForSelector('#mor-page')).contentFrame())!;
  const box = await outer.waitForSelector('.mor-feed[data-done]', { timeout: 90_000 });
  return (await (await box.$('iframe'))!.contentFrame())!;
}

/** Write from the page's box: choose whom and how, type, send, and wait for the answer. */
async function write(page: Page, to: 'Nobody, allegedly' | 'Machine, allegedly', how: 'Private' | 'Public', text: string): Promise<string> {
  const box = await page.waitForSelector('.mor-write-box');
  await (await box.$(`button >> text="${to}"`))!.click();
  await (await box.$(`button >> text="${how}"`))!.click();
  await (await box.$('textarea'))!.fill(text);
  await (await box.$('.mw-send'))!.click();
  await page.waitForFunction(() => {
    const s = document.querySelector<HTMLElement>('.mor-write-box')?.dataset.sent;
    return s && s !== '';
  }, undefined, { timeout: 60_000 });
  const sent = await box.getAttribute('data-sent');
  assert.notEqual(sent, 'failed', (await box.$eval('.mw-status', (e) => e.textContent))!);
  return sent!;
}

test('the page: the placeholder link to the third thank-you text, said in one line, and the box beside its plain words', async () => {
  const { page, ctx, problems } = await open('/feed.html');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/);
  const outer = (await (await page.$('#mor-page'))!.contentFrame())!;
  assert.equal(await outer.$eval('#third-thank-you', (a) => a.getAttribute('href')), 'https://reader.dubsar.org/#THIRD-THANK-YOU');
  assert.match((await outer.textContent('#third-placeholder'))!, /^Placeholder: the third thank-you text is not published yet/);
  // Beside the one-way box, where to take part for real: the clients, the web client for testing only, the homes.
  assert.match((await outer.textContent('#take-part'))!, /no answer can reach you.*make an identity of your own, with a client and a home/);
  const clients = await outer.$$eval('#clients li', (els) => els.map((e) => e.textContent!));
  assert.match(clients[0], /^Dub: /);
  assert.match(clients[1], /^Dub on the web, https:\/\/dub\.dubsar\.org\/: .*for testing only/);
  assert.equal(await outer.$eval('#clients a', (a) => a.getAttribute('href')), 'https://dub.dubsar.org/');
  assert.match(clients[2], /^MOR Identities: /);
  const homes = await outer.$$eval('#homes li', (els) => els.map((e) => e.textContent!));
  assert.deepEqual(homes.map((h) => h.split(':')[0] + ':' + h.split(':')[1]), ['https://home1.dubsar.org', 'https://home2.dubsar.org']);
  const box = await page.waitForSelector('.mor-write-box');
  // Private by default, to the first identity named; each choice said in plain words.
  assert.match((await box.$eval('.mw-means', (e) => e.textContent))!, /^Private: sealed in this browser so that only Nobody, allegedly can open it/);
  await (await box.$('button >> text="Public"'))!.click();
  assert.match((await box.$eval('.mw-means', (e) => e.textContent))!, /^Public: left unsealed in Nobody, allegedly's inbox, readable by anyone who holds it\. It appears on this page only if Nobody, allegedly or Machine, allegedly answers it\./);
  await (await box.$('button >> text="Machine, allegedly"'))!.click();
  assert.match((await box.$eval('.mw-means', (e) => e.textContent))!, /Machine, allegedly's inbox/);
  assert.match((await box.$eval('.mw-always', (e) => e.textContent))!, /one-time identity made in this browser, whose keys are forgotten once it is sent.*Nothing is kept in this browser\./);
  // The box lies over its place in the page, within the phone's width; the page is not hidden under it.
  const r = await box.boundingBox();
  assert.ok(r && r.width > 300 && r.x + r.width <= 390, `box at ${JSON.stringify(r)}`);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  if (shots) await page.screenshot({ path: join(shots, 'feed-page-phone.png'), fullPage: true });
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a visitor writes privately: the owner’s inbox holds it sealed, and only the owner opens it', async () => {
  const { page, ctx, elsewhere, problems } = await open('/feed.html');
  const text = `A private note to Nobody, allegedly, ${Date.now()}.`;
  const id = await write(page, 'Nobody, allegedly', 'Private', text);
  const got = await nobody.readInbox({ inbox: [out1.base], senderHints: [out1.base, home1.base] });
  const it = got.find((g) => g.act === id);
  assert.ok(it, 'a sealed container in the inbox');
  assert.equal(it.opened, true);
  assert.equal(it.text, text);
  assert.equal(it.status, 'valid');
  // Nothing readable in the open: the relay holds no act by that id.
  assert.equal(await relayAt(out1.base).getAct(id), null);
  assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0], 'nothing kept in the browser');
  assert.deepEqual(elsewhere, []);
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a visitor writes publicly: the owner’s inbox holds the act unsealed, addressed to the identity chosen, and the feed does not show it unanswered', async () => {
  const { page, ctx, elsewhere, problems } = await open('/feed.html');
  const text = `A public note to Machine, allegedly, ${Date.now()}.`;
  const id = await write(page, 'Machine, allegedly', 'Public', text);
  const feed = await relayAt(out2.base).feed({ to: machine.id });
  const act = feed.items.find((i) => i.kind === 'act' && describeAct(i.item).id === id);
  assert.ok(act, 'the act in Machine’s inbox, unsealed');
  const d = describeAct(act.item) as { public: boolean; to?: string[]; signer?: string };
  assert.equal(d.public, true);
  assert.deepEqual(d.to, [machine.id]);
  assert.notEqual(d.signer, machine.id);
  const f = await feedFrame(page);
  const body = (await f.textContent('body'))!;
  assert.ok(!body.includes(text), 'not shown, unanswered');
  assert.deepEqual(elsewhere, []);
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a public note is shown only beside a reply that names it, labelled by who picked it', async () => {
  const { page, ctx, elsewhere, problems } = await open('/feed.html');
  const f = await feedFrame(page);
  const notes = await f.$$eval('.f-visitor', (els) => els.map((e) => (e as HTMLElement).dataset.note));
  assert.deepEqual(new Set(notes), new Set([ids.picked, ids.nudged, ids.ownAnswer]));
  const body = (await f.textContent('body'))!;
  assert.doesNotMatch(body, /never to be shown/, 'an unanswered note is not shown');

  const card = async (reply: string) =>
    f.$eval(`[data-post="${reply}"]`, (e) => ({
      picked: e.querySelector<HTMLElement>('.f-visitor [data-picked]')?.textContent ?? null,
      answered: e.querySelector<HTMLElement>('[data-answered]')?.textContent ?? null,
      note: e.querySelector<HTMLElement>('.f-visitor')?.dataset.verified,
      noteFirst: !!e.firstElementChild?.classList.contains('f-visitor'),
      text: e.textContent ?? '',
    }));
  // Picked by Nobody, allegedly: the note carries his pick; Machine's reply below, under its name alone.
  const picked = await card(ids.replyPicked);
  assert.equal(picked.picked, 'Picked by Nobody, allegedly');
  assert.equal(picked.answered, null);
  assert.equal(picked.note, 'yes');
  assert.ok(picked.noteFirst, 'the note above, the reply below');
  assert.match(picked.text, /A note Nobody, allegedly, picked[\s\S]*Machine, allegedly\s*Verified\s*Machine answers the note that was picked/);
  // Under a nudge: Machine chose the note.
  const nudged = await card(ids.replyNudged);
  assert.equal(nudged.picked, 'Picked by Machine, allegedly');
  assert.equal(nudged.answered, null);
  // His own reply: answered by Nobody, allegedly; no pick on the note.
  const own = await card(ids.replyOwn);
  assert.equal(own.picked, null);
  assert.equal(own.answered, 'Answered by Nobody, allegedly');
  assert.deepEqual(elsewhere, [], 'nothing fetched beyond the gateway, the homes and the relays');
  assert.deepEqual(problems, []);
  if (shots) {
    const outer = (await (await page.$('#mor-page'))!.contentFrame())!;
    await (await outer.$('.mor-feed'))!.scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(shots, 'feed-page-answered-phone.png'), fullPage: true });
  }
  await ctx.close();
});
