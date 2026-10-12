// A page's feed (website cMIP draft 6, rule 13a) in a real browser (headless
// Chromium, or WebKit with MOR_BROWSER=webkit), on a fresh profile each time:
// three test identities on two homes, each posting to its own relay through
// its outbox route; a reply crossing identities; a fourth identity whose
// home is gone, so its post cannot be verified. The site names the
// identities in its page; the display client finds their posts and checks
// each in the browser. Real homes and relays on local ports; test
// identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Frame, type Page } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { post, textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { parseGatewaySettings } from '../src/settings.ts';
import { signedOrder } from '../src/feed.ts';
import { benign, phone } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;
/** An address no browser reaches: an onion address over plain http, as home3 is. */
const ONION = 'http://abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrstuv.onion';

let browser: Browser;
let gateway: Gateway;
let base: string;
const running: Running[] = [];
let nobody: TestIdentity;
let machine: TestIdentity;
let third: TestIdentity;
let gone: TestIdentity;
/** The posts, by name, in the order they were signed. */
const ids: Record<string, string> = {};

const feedPage = (authors: [TestIdentity, string | null][], extra = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The public feed</title><link rel="stylesheet" href="look.css"></head>
<body><h1>The public feed</h1>
<mor-feed>
${authors.map(([who, name]) => `  <mor-author identity="${who.id}">${name ?? ''}</mor-author>`).join('\n')}
${extra}
</mor-feed>
</body></html>`;

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  const [home1, home2, home3] = [await start('home'), await start('home'), await start('home')];
  const [site, out1, out2] = [await start('relay'), await start('relay'), await start('relay')];
  running.push(home1, home2, home3, site, out1, out2);

  // Nobody, allegedly on home1, posting to its relay; Machine, allegedly on
  // home2, posting to another, and naming an onion address too; a third on
  // home1, posting to the first relay.
  nobody = TestIdentity.create({ homes: [home1.home] });
  machine = TestIdentity.create({ homes: [home2.home] });
  third = TestIdentity.create({ homes: [home1.home] });
  for (const [who, outbox] of [
    [nobody, [out1.base]],
    [machine, [out2.base, ONION]],
    [third, [out1.base]],
  ] as const) {
    await who.publishGenesis();
    await who.publishRoutes([{ scope: null, hints: [...outbox], kind: 0 }]);
  }
  const reply = async (by: TestIdentity, text: string, to: string, relays: string[]) =>
    (await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(text), { public: true, relays, refs: [to] })).id;
  ids.n1 = (await post(nobody, { text: 'The first post, with the planet.', jpeg: phone, relays: [out1.base] })).id;
  ids.m1 = (await post(machine, { text: 'Machine, allegedly, says hello.', relays: [out2.base] })).id;
  ids.n2 = (await post(nobody, { text: 'A second thought.', relays: [out1.base] })).id;
  ids.mReply = await reply(machine, 'An answer from the other home.', ids.n1, [out2.base]);
  ids.n3 = (await post(nobody, { text: 'A third, the newest of mine.', relays: [out1.base] })).id;
  ids.t1 = (await post(third, { text: 'A third identity, named in the page alone.', relays: [out1.base] })).id;

  // An identity whose home is gone before its genesis reached anyone: its
  // post is on the site's relay, but its identity chain is found nowhere, so
  // nothing can say who signed it.
  gone = TestIdentity.create({ homes: [home3.home] });
  await home3.stop();
  ids.g1 = (await gone.publish(POST_SPECS.text, TEXT_ACT, textPayload('Words that must not be shown unverified.'), { public: true, relays: [site.base] })).id;

  const dir = mkdtempSync(join(tmpdir(), 'mor-site-feed-'));
  writeFileSync(join(dir, 'index.html'), feedPage([
    [nobody, 'Nobody, allegedly'],
    [machine, 'Machine, allegedly'],
    [third, null],
  ]));
  writeFileSync(
    join(dir, 'unverified.html'),
    feedPage([[nobody, 'Nobody, allegedly'], [gone, 'An identity whose home is gone']], '<mor-author identity="not-an-identity">Dropped</mor-author><p>dropped text</p>'),
  );
  writeFileSync(join(dir, 'empty.html'), '<!doctype html><title>Empty</title><mor-feed><mor-author identity="xyz">No</mor-author></mor-feed>');
  writeFileSync(join(dir, 'look.css'), 'body{margin:0 16px;font-family:Georgia,serif}h1{font-size:1.4em}\n');
  const v = await publishSite(nobody, { name: 'a feed test site', files: readFolder(dir), relays: [site.base] });

  // The gateway's relays: the site's relay and the two homes, where each
  // identity's genesis is found; outbox relays come from each identity's routes.
  gateway = new Gateway(
    parseGatewaySettings({
      listen: '127.0.0.1:0',
      look: 0,
      sites: [{ hosts: ['127.0.0.1'], version: v.id, identity: nobody.id, name: 'Nobody, allegedly', relays: [site.base, home1.base, home2.base], serve: 'pinned' }],
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

async function open(path: string, viewport = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport, isMobile: !WEBKIT && viewport.width < 500, hasTouch: viewport.width < 500 });
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

/** The feed's own frame, once filled. */
async function feedFrame(page: Page): Promise<Frame> {
  const outer = await (await page.waitForSelector('#mor-page')).contentFrame();
  assert.ok(outer);
  const box = await outer.waitForSelector('.mor-feed[data-done]', { timeout: 90_000 });
  const inner = await (await box.$('iframe'))?.contentFrame();
  assert.ok(inner, 'the feed is shown in a frame of its own');
  return inner;
}

const posts = (f: Frame) => f.$$eval('.f-post', (els) => els.map((e) => ({ id: (e as HTMLElement).dataset.post!, ok: (e as HTMLElement).dataset.verified, text: e.textContent ?? '' })));

test('signed order: a reply after what it answers, an identity never reversed, otherwise the page’s order', () => {
  const act = (id: string, signer: string, position: number, links: Partial<{ prev: string; refs: string[] }> = {}) => ({
    id,
    signer,
    position,
    public: true,
    spec: POST_SPECS.text,
    type: TEXT_ACT,
    ...links,
  });
  const A = 'a'.repeat(64);
  const B = 'b'.repeat(64);
  const acts = [
    act('a1', A, 1),
    act('b1', B, 1),
    act('a2', A, 2, { prev: 'a1' }),
    act('b2', B, 2, { prev: 'b1', refs: ['a1'] }),
    act('a3', A, 3, { prev: 'a2' }),
  ];
  const rank = (s: string) => [A, B].indexOf(s);
  assert.deepEqual(signedOrder(acts, rank), ['a3', 'a2', 'b2', 'a1', 'b1']);
  // The other way round in the page: B's line first where nothing links.
  assert.deepEqual(signedOrder(acts, (s) => [B, A].indexOf(s)), ['b2', 'b1', 'a3', 'a2', 'a1']);
  // An act that is not a post still carries the order, and is left out.
  const pic = { ...act('p', A, 4, { prev: 'a3' }), type: 99 };
  const a4 = act('a4', A, 5, { prev: 'p' });
  assert.deepEqual(signedOrder([...acts, pic, a4], rank), ['a4', 'a3', 'a2', 'b2', 'a1', 'b1']);
});

test('a phone shows the feed of three identities, newest first in signed order, each post verified in the browser', async () => {
  const { page, ctx, problems, elsewhere } = await open('/');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/);
  const f = await feedFrame(page);
  const shown = await posts(f);
  // Nobody's three in signed order; Machine's reply after the post it answers; the rest by the page's order.
  assert.deepEqual(
    shown.map((p) => p.id),
    [ids.n3, ids.n2, ids.mReply, ids.n1, ids.m1, ids.t1],
  );
  assert.ok(shown.every((p) => p.ok === 'yes'), 'every post verified');
  assert.match(shown[0].text, /Nobody, allegedly\s*Verified/);
  assert.match(shown[2].text, /Machine, allegedly\s*Verified/);
  // The third identity, named with no name: shown by its fingerprint, with no change to the code.
  assert.match(shown[5].text, new RegExp(`Identity ${third.id.slice(0, 8)}`));
  assert.match(shown[5].text, /A third identity, named in the page alone/);
  // The reply shows the post it answers, verified, across homes.
  const answers = await f.$eval(`[data-post="${ids.mReply}"] .f-answers`, (e) => ({ id: (e as HTMLElement).dataset.answers, text: e.textContent }));
  assert.equal(answers.id, ids.n1);
  assert.match(answers.text!, /Nobody, allegedly\s*verified\s*The first post, with the planet/);
  // The first post's picture, from its checked bytes, within the phone's width.
  const img = await f.$eval(`[data-post="${ids.n1}"] img`, (e) => ({ w: e.getBoundingClientRect().width, src: (e as HTMLImageElement).src.slice(0, 22), done: (e as HTMLImageElement).naturalWidth }));
  assert.equal(img.src, 'data:image/jpeg;base64');
  assert.ok(img.done > 0 && img.w <= 390, `picture ${img.w}px wide`);
  // Nothing wider than the phone; nothing scrolls sideways.
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  // The bar names each identity with its whole fingerprint, where it asked, and the onion address it did not try.
  await page.click('#mor-bar summary');
  const bar = (await page.textContent('#mor-feeds'))!;
  for (const who of [nobody, machine, third]) assert.ok(bar.includes(who.id.match(/.{4}/g)!.join(' ')), 'whole fingerprint in the bar');
  assert.match(bar, /6 posts shown, 6 verified/);
  assert.match(bar, /The names are this page's; the identities are what was checked/);
  assert.ok(bar.includes(`not reachable from a browser, not asked: ${ONION}`));
  assert.match(bar, /3 posts found, 3 shown verified/);
  assert.deepEqual(elsewhere, [], 'nothing fetched from anywhere but the gateway and the relays');
  assert.deepEqual(problems, []);
  if (shots) {
    await page.click('#mor-bar summary');
    await page.screenshot({ path: join(shots, 'feed-phone.png'), fullPage: true });
  }
  await ctx.close();
});

test('a post that cannot be verified is shown as such, its words not shown', async () => {
  const { page, ctx, problems } = await open('/unverified.html');
  const f = await feedFrame(page);
  const shown = await posts(f);
  const bad = shown.find((p) => p.id === ids.g1);
  assert.ok(bad, 'the unverifiable post is listed');
  assert.equal(bad.ok, 'no');
  assert.match(bad.text, /An identity whose home is gone\?\s*Not verified/);
  assert.match(bad.text, /could not be verified in this browser/);
  assert.doesNotMatch(bad.text, /must not be shown/);
  assert.ok(shown.filter((p) => p.id !== ids.g1).every((p) => p.ok === 'yes'));
  // The page's malformed author is dropped, and its other content.
  const outer = (await (await page.$('#mor-page'))!.contentFrame())!;
  assert.doesNotMatch((await outer.textContent('body'))!, /Dropped|dropped text/);
  await page.click('#mor-bar summary');
  const bar = (await page.textContent('#mor-feeds'))!;
  assert.match(bar, /1 not verified/);
  assert.match(bar, /not looked up, the genesis of [0-9a-f]{64} was not found/);
  if (shots) await page.screenshot({ path: join(shots, 'feed-unverified.png'), fullPage: true });
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a feed naming no identity says so, and shows nothing', async () => {
  const { page, ctx } = await open('/empty.html');
  const outer = (await (await page.waitForSelector('#mor-page')).contentFrame())!;
  await outer.waitForSelector('.mor-feed');
  assert.match((await outer.textContent('.mor-feed'))!, /A feed naming no identity: nothing to show/);
  assert.equal(await outer.$('.mor-feed iframe'), null);
  await ctx.close();
});
