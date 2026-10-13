// A feed ordered by the clock a page names (website cMIP draft 8, rule 13a,
// "Ordered by a clock"; the timestamp clock Module), in a real browser
// (headless Chromium, or WebKit with MOR_BROWSER=webkit), on a phone's
// screen: three test identities on two homes posting, a timestamp clock
// stamping their posts one by one, so that the clock's order crosses
// identities where signed order cannot; one post left unstamped; a second
// clock, which no page names, stamping the same posts in the reverse order,
// at the same relay. The label, the times, and the bar. A page naming no
// clock, and one naming a clock that stamped nothing, keep signed order.
// Real homes and relays on local ports; test identities only.

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
import { ClockService } from '../../../modules/timestamp/src/service.ts';
import { earliestByNames } from '../../../modules/timestamp/src/read.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { parseGatewaySettings } from '../src/settings.ts';
import { signedOrder } from '../src/feed.ts';
import { timeWords } from '../src/shell/feed-view.ts';
import { benign } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;

let browser: Browser;
let gateway: Gateway;
let base: string;
const running: Running[] = [];
let nobody: TestIdentity;
let machine: TestIdentity;
let third: TestIdentity;
let clock: TestIdentity;
let rogue: TestIdentity;
let quiet: TestIdentity;
const ids: Record<string, string> = {};
/** 13 October 2026, 09:00 UTC: the clock's first minute. */
const T0 = Date.UTC(2026, 9, 13, 9, 0) / 1000;
const at: Record<string, number> = {};

const feedPage = (authors: [TestIdentity, string | null][], extra = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The public feed</title></head>
<body><h1>The public feed</h1>
<mor-feed>
${authors.map(([who, name]) => `  <mor-author identity="${who.id}">${name ?? ''}</mor-author>`).join('\n')}
${extra}
</mor-feed>
</body></html>`;

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  const [home1, home2] = [await start('home'), await start('home')];
  const [site, out1, out2, stamps] = [await start('relay'), await start('relay'), await start('relay'), await start('relay')];
  running.push(home1, home2, site, out1, out2, stamps);

  nobody = TestIdentity.create({ homes: [home1.home] });
  machine = TestIdentity.create({ homes: [home2.home] });
  third = TestIdentity.create({ homes: [home1.home] });
  // The clock the page names, the one it does not, and one that stamps nothing: all three publish at the same relay.
  clock = TestIdentity.create({ homes: [home1.home] });
  rogue = TestIdentity.create({ homes: [home2.home] });
  quiet = TestIdentity.create({ homes: [home1.home] });
  for (const [who, outbox] of [
    [nobody, out1.base],
    [machine, out2.base],
    [third, out1.base],
    [clock, stamps.base],
    [rogue, stamps.base],
    [quiet, stamps.base],
  ] as const) {
    await who.publishGenesis();
    await who.publishRoutes([{ scope: null, hints: [outbox], kind: 0 }]);
  }

  // Each post stamped by the clock a minute after the one before, across
  // identities; Nobody's newest left unstamped (the clock has not caught it).
  let now = T0;
  const named = new ClockService({ identity: clock, outbox: [stamps.base], now: () => now });
  const stamp = async (name: string) => {
    now += 60;
    at[name] = now;
    await named.stamp([ids[name]]);
  };
  ids.n1 = (await post(nobody, { text: 'Nobody, first.', relays: [out1.base] })).id;
  await stamp('n1');
  ids.m1 = (await post(machine, { text: 'Machine, first.', relays: [out2.base] })).id;
  await stamp('m1');
  ids.t1 = (await post(third, { text: 'The third identity, first.', relays: [out1.base] })).id;
  await stamp('t1');
  ids.n2 = (await post(nobody, { text: 'Nobody, second.', relays: [out1.base] })).id;
  await stamp('n2');
  ids.mReply = (await machine.publish(POST_SPECS.text, TEXT_ACT, textPayload('Machine answers Nobody’s first.'), { public: true, relays: [out2.base], refs: [ids.n1] })).id;
  await stamp('mReply');
  ids.n3 = (await post(nobody, { text: 'Nobody, third, not yet stamped.', relays: [out1.base] })).id;

  // The clock no page names stamps the same posts in the reverse order, earlier, Nobody's third included.
  let then = T0 - 86_400;
  const other = new ClockService({ identity: rogue, outbox: [stamps.base], now: () => then });
  for (const name of ['n3', 'mReply', 'n2', 't1', 'm1', 'n1']) {
    then += 60;
    await other.stamp([ids[name]]);
  }

  const dir = mkdtempSync(join(tmpdir(), 'mor-site-clock-'));
  const three: [TestIdentity, string | null][] = [
    [nobody, 'Nobody, allegedly'],
    [machine, 'Machine, allegedly'],
    [third, null],
  ];
  writeFileSync(join(dir, 'index.html'), feedPage(three, `<mor-clock identity="${clock.id}">The test clock</mor-clock>\n<mor-clock identity="${rogue.id}">A second clock, dropped</mor-clock>`));
  writeFileSync(join(dir, 'noclock.html'), feedPage(three));
  writeFileSync(join(dir, 'quiet.html'), feedPage(three, `<mor-clock identity="${quiet.id}">A quiet clock</mor-clock>`));
  writeFileSync(join(dir, 'badclock.html'), feedPage(three, `<mor-clock identity="not-a-clock">No clock</mor-clock>`));
  const v = await publishSite(nobody, { name: 'a clock test site', files: readFolder(dir), relays: [site.base] });

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

async function feedFrame(page: Page): Promise<Frame> {
  const outer = await (await page.waitForSelector('#mor-page')).contentFrame();
  assert.ok(outer);
  const box = await outer.waitForSelector('.mor-feed[data-done]', { timeout: 90_000 });
  const inner = await (await box.$('iframe'))?.contentFrame();
  assert.ok(inner, 'the feed is shown in a frame of its own');
  return inner;
}

const posts = (f: Frame) =>
  f.$$eval('.f-post', (els) =>
    els.map((e) => ({
      id: (e as HTMLElement).dataset.post!,
      ok: (e as HTMLElement).dataset.verified,
      time: e.querySelector<HTMLElement>('.f-time')?.dataset.time ?? null,
      when: e.querySelector('.f-time')?.textContent ?? null,
    })),
  );

/** Signed order, as the page names the identities with no clock: Nobody's line, the reply after what it answers, then the page's order. */
const SIGNED = () => [ids.n3, ids.n2, ids.mReply, ids.n1, ids.m1, ids.t1];

test("a clock's times order acts across identities, never before what they name; an act it has not stamped comes first", () => {
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
  const acts = [act('a1', A, 1), act('b1', B, 1), act('a2', A, 2, { prev: 'a1' }), act('b2', B, 2, { prev: 'b1', refs: ['a1'] }), act('a3', A, 3, { prev: 'a2' })];
  const rank = (s: string) => [A, B].indexOf(s);
  const links = acts.map((d) => ({ id: d.id, links: [...(d.prev ? [d.prev] : []), ...(d.refs ?? [])] }));
  // b1 stamped before a1: B's first comes first, which signed order alone cannot say.
  const times = earliestByNames(links, new Map([['a1', 20], ['b1', 10], ['a2', 30], ['b2', 40]]));
  assert.deepEqual(signedOrder(acts, rank, times), ['a3', 'b2', 'a2', 'a1', 'b1']);
  assert.deepEqual(signedOrder(acts, rank), ['a3', 'a2', 'b2', 'a1', 'b1'], 'without times, signed order as before');
  // A reply stamped before what it answers: what it answers existed by then, and is never shown after it.
  const early = earliestByNames(links, new Map([['a1', 20], ['b1', 10], ['a2', 30], ['b2', 5]]));
  assert.equal(early.get('a1'), 5);
  const order = signedOrder(acts, rank, early);
  assert.ok(order.indexOf('b2') < order.indexOf('a1') && order.indexOf('b2') < order.indexOf('b1'));
  assert.deepEqual(order, ['a3', 'a2', 'b2', 'a1', 'b1']);
});

test("a phone shows the feed ordered by the clock the page names, across identities, with each post's time", async () => {
  const { page, ctx, problems, elsewhere } = await open('/');
  const f = await feedFrame(page);
  const shown = await posts(f);
  // The unstamped post first; then by the clock's stamps, newest first, crossing identities.
  assert.deepEqual(
    shown.map((p) => p.id),
    [ids.n3, ids.mReply, ids.n2, ids.t1, ids.m1, ids.n1],
  );
  assert.notDeepEqual(shown.map((p) => p.id), SIGNED(), 'not the signed order');
  assert.ok(shown.every((p) => p.ok === 'yes'), 'every post verified');
  // The label, and each post's time from the named clock, never the other one's.
  assert.equal(await f.textContent('#f-order'), "ordered by The test clock's stamps");
  assert.equal(await f.getAttribute('.f-note', 'data-order'), 'clock');
  assert.match((await f.textContent('.f-note'))!, /its word only/);
  assert.equal(shown[0].time, '');
  assert.equal(shown[0].when, 'not stamped by The test clock');
  for (const p of shown.slice(1)) {
    const name = Object.keys(ids).find((k) => ids[k] === p.id)!;
    assert.equal(Number(p.time), at[name], `${name}: the named clock's time`);
    assert.equal(p.when, timeWords(at[name]));
  }
  assert.equal(shown[5].when, '13 October 2026, 09:01 UTC');
  // The reply still shows the post it answers.
  assert.equal(await f.getAttribute(`[data-post="${ids.mReply}"] .f-answers`, 'data-answers'), ids.n1);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390, 'nothing scrolls sideways');
  // The bar: the clock by its whole fingerprint, its stamps, whose order it is; the clock the page does not name is not there.
  await page.click('#mor-bar summary');
  const bar = (await page.textContent('#mor-clock'))!;
  assert.ok(bar.includes(clock.id.match(/.{4}/g)!.join(' ')), "the clock's whole fingerprint");
  assert.ok(!bar.includes(rogue.id.match(/.{4}/g)!.join(' ')), 'the second clock named in the page is dropped');
  assert.match(bar, /The test clock, .*: 5 stamps found, 5 verified, placing 5 posts/);
  assert.match(bar, /ordered by its stamps: its operator's word/);
  assert.deepEqual(elsewhere, [], 'nothing fetched from anywhere but the gateway and the relays');
  assert.deepEqual(problems, []);
  if (shots) {
    await page.click('#mor-bar summary');
    await page.screenshot({ path: join(shots, 'feed-clock-phone.png'), fullPage: true });
  }
  await ctx.close();
});

test('without a clock named, or with one that stamped nothing, the feed keeps signed order and says it is not a time', async () => {
  for (const path of ['/noclock.html', '/quiet.html', '/badclock.html']) {
    const { page, ctx, problems } = await open(path);
    const f = await feedFrame(page);
    const shown = await posts(f);
    assert.deepEqual(shown.map((p) => p.id), SIGNED(), `${path}: signed order, the other clock's stamps ignored`);
    assert.ok(shown.every((p) => p.time === null), `${path}: no time shown`);
    assert.equal(await f.getAttribute('.f-note', 'data-order'), 'signed');
    assert.match((await f.textContent('.f-note'))!, /the order is not a time/);
    assert.equal(await f.$('#f-order'), null);
    await page.click('#mor-bar summary');
    const clockRow = await page.$('#mor-clock');
    if (path === '/quiet.html') {
      assert.match((await clockRow!.textContent())!, /A quiet clock, .*: 0 stamps found, 0 verified, placing 0 posts.*No post found carries its stamps: the posts are in signed order/);
    } else {
      assert.equal(clockRow, null, `${path}: no clock in the bar`);
    }
    assert.deepEqual(problems, []);
    await ctx.close();
  }
});
