// The gateway's display client in a real browser (headless Chromium, or
// WebKit, Safari's engine, with MOR_BROWSER=webkit), on a
// fresh profile each time, as a fresh device would open the site: the built
// display client, served by the gateway with its headers, checks the version
// against local relays with the core library's WebAssembly, then each page
// against the signed manifest, and shows it under the bar, or shows it
// failing. Real homes and a relay on local ports.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Frame, type Page } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { post } from '../../barebone/src/post.ts';
import { gatewayFor, phone, siteCopy, world, type World } from './world.ts';
import { PICTURE_SHARE } from '../src/shell/view.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/** WebKit is Safari's engine, which every browser on an iPhone uses: Playwright's own build of it, installed with `npx playwright-core install webkit`. */
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;
const LOCAL = ['http://127.0.0.1:*'];

let w: World;
let browser: Browser;
let honest: Gateway;
let base: string;
let hostile: Gateway;
let hostileBase: string;
const csp: string[] = [];
/** Refusals while the hostile page is parsed: the policy turning away what it tries, a second wall behind the display client. */
const hostileCsp: string[] = [];

/** A page that tries everything a site may not do (website cMIP, rules 11 to 14). */
const HOSTILE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=https://example.org/">
<base href="https://example.org/">
<title>A page that tries too much</title>
<link rel="stylesheet" href="https://example.org/evil.css">
<link rel="stylesheet" href="look.css">
<link rel="prefetch" href="https://example.org/track">
<link rel="icon" href="https://example.org/icon.jpg">
<style>body{display:none}</style>
<script>document.documentElement.dataset.ran = 'head';</script>
</head>
<body onload="document.body.dataset.ran = 'onload'">
<h1 style="display:none" id="title">Still readable</h1>
<p>A picture of the site: <img id="own" src="photo.jpg" alt="own" onerror="document.body.dataset.ran = 'onerror'"></p>
<p>A picture from elsewhere: <img id="far" src="https://example.org/pixel.jpg" alt="far"></p>
<p><a id="out" href="https://example.org/">a link out</a>, <a id="mail" href="mailto:someone@example.org">mail</a>,
<a id="js" href="javascript:alert(1)">a script link</a>, <a id="home" href="./">home</a>, <a id="gone" href="nowhere.html">a page that is not there</a></p>
<iframe src="https://example.org/"></iframe>
<object data="https://example.org/x"></object>
<form action="https://example.org/"><input name="q"><button>Send</button></form>
<svg><script>document.documentElement.dataset.ran = 'svg'</script></svg>
<mor-act act="not-an-act"></mor-act>
<noscript><img src="https://example.org/noscript.jpg"></noscript>
</body></html>`;

const ok = async (g: Gateway) => (await g.load()).every((s) => s.loaded.ok);
const at = (g: Gateway) => g.sites.get('127.0.0.1')!;

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  w = await world();
  honest = new Gateway(gatewayFor(w, w.site.id), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok(await ok(honest));
  base = await honest.listen('127.0.0.1', 0);

  const dir = mkdtempSync(join(tmpdir(), 'mor-site-hostile-'));
  writeFileSync(join(dir, 'index.html'), HOSTILE);
  writeFileSync(join(dir, 'look.css'), "@import url('https://example.org/more.css');\nh1{color:rebeccapurple;background:url(https://example.org/bg.jpg)}\n");
  writeFileSync(join(dir, 'photo.jpg'), strip(phone).bytes);
  writeFileSync(join(dir, 'notes.txt'), 'Plain text, shown as it is.\n<b>not bold</b>\n');
  const v = await publishSite(w.owner, { name: 'a hostile test site', files: readFolder(dir), relays: [w.relay.base] });
  hostile = new Gateway(gatewayFor(w, v.id), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok(await ok(hostile));
  hostileBase = await hostile.listen('127.0.0.1', 0);

  browser = WEBKIT ? await webkit.launch() : await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  honest?.close();
  hostile?.close();
  await w?.stop();
});

/** A fresh browser context: no cache, no storage, as a fresh device. */
async function open(url: string, refusals = csp) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const problems: string[] = [];
  const elsewhere: string[] = [];
  /** WebKit's reports of the page's sandbox refusing a script, or a navigation without a click: the sandbox at work. */
  const sandbox: string[] = [];
  page.on('console', (m) => {
    if (/Content.Security.Policy/i.test(m.text())) refusals.push(m.text());
    else if (/sandboxed/.test(m.text())) sandbox.push(m.text());
    else if (m.type() === 'error' && !benign(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => {
    if (/sandboxed/.test(String(e))) sandbox.push(String(e));
    else if (!benign(String(e))) problems.push(String(e));
  });
  page.on('request', (r) => {
    if (!/^(http:\/\/127\.0\.0\.1:|blob:|data:|about:)/.test(r.url())) elsewhere.push(r.url());
  });
  await page.goto(url);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  return { page, ctx, problems, elsewhere, sandbox };
}

/**
 * WebKit's notice that a frame's size changed again while being fitted: the
 * remaining notices come at the next frame, as the observer's rules say, so
 * nothing is lost.
 */
const benign = (m: string) => /ResizeObserver loop completed with undelivered notifications/.test(m);

const standing = (page: Page) => page.textContent('#mor-standing');
const fp = async (page: Page) => (await page.textContent('#mor-signer'))!.replace(/ /g, '');

async function pageFrame(page: Page): Promise<Frame> {
  const handle = await page.waitForSelector('#mor-page');
  const f = await handle.contentFrame();
  assert.ok(f);
  await f.waitForLoadState();
  return f;
}

const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

test('a fresh browser shows each page of the site as verified, and signed by the owner', async () => {
  const pages: [string, string, string][] = [
    ['/', 'dubsar.org · dubsar.org', 'front'],
    ['/read.html', 'Read · dubsar.org · dubsar.org', 'read'],
    ['/build.html', 'Build · dubsar.org · dubsar.org', 'build'],
    ['/run.html', 'Run · dubsar.org · dubsar.org', 'run'],
    ['/use.html', 'Use · dubsar.org · dubsar.org', 'use'],
  ];
  for (const [address, title, name] of pages) {
    const { page, ctx, problems, elsewhere, sandbox } = await open(base + address);
    const why = (await page.locator('#mor-reasons').count()) ? await page.textContent('#mor-reasons') : '';
    assert.match((await standing(page))!, /^Verified: this page is exactly what was signed by the identity this gateway names as Nobody, allegedly\. Checked in this browser\./, `${address}: ${why} ${problems.join(' ')}`);
    assert.equal(await fp(page), w.owner.id, `${address}: the whole fingerprint of the signer`);
    assert.equal(await page.textContent('#mor-version'), w.site.id);
    assert.equal(await page.title(), title);
    const f = await pageFrame(page);
    if (address === '/') assert.equal(await f.locator('.doors a').count(), 4, 'four doors');
    else assert.equal(await f.textContent('h1'), name[0].toUpperCase() + name.slice(1));
    assert.equal(await f.locator('script').count(), 0);
    await shot(page, `page-${name}`);
    assert.deepEqual(problems, [], address);
    assert.deepEqual(elsewhere, [], `${address}: nothing fetched from elsewhere`);
    assert.deepEqual(sandbox, [], `${address}: the display client tries nothing the page's sandbox refuses`);
    await ctx.close();
  }
});

test('the front page opens on the first act, shown as the act, verified, with its picture', async () => {
  const { page, ctx, problems } = await open(base + '/');
  const f = await pageFrame(page);
  const inner = await (await f.waitForSelector('.mor-act iframe', { timeout: 60_000 })).contentFrame();
  assert.ok(inner);
  await inner.waitForSelector('.mor-post img');
  assert.match((await inner.textContent('.mor-post-by'))!, /verified/);
  assert.match((await inner.textContent('.mor-post'))!, /Thank you for the shower/);
  // Two shortcuts before the sections, opening the reader apart from the site: MOR in one page, and the full
  // shower text; their acts are placeholders until step 17 (layout decided by Nobody, allegedly, 7 October 2026).
  const onePage = f.locator('.shortcuts a.button#one-page');
  assert.equal(await onePage.textContent(), 'MOR in one page');
  assert.equal(await onePage.getAttribute('href'), 'https://reader.dubsar.org/#ONE-PAGE');
  assert.equal(await onePage.getAttribute('target'), '_blank');
  const shower = f.locator('.shortcuts a.button#shower-text');
  assert.equal(await shower.textContent(), 'Thank you for the shower');
  assert.equal(await shower.getAttribute('href'), 'https://reader.dubsar.org/#SHOWER-TEXT');
  // Nothing under the first act: the shortcuts come right after it, then the four sections.
  assert.deepEqual(
    await f.$$eval('main > *', (els) => els.map((e) => e.className || e.localName)),
    ['first-act', 'shortcuts', 'doors'],
  );
  assert.deepEqual(await f.$$eval('.doors .door', (els) => els.map((e) => e.textContent)), ['Read', 'Build', 'Run', 'Use']);
  const size = await inner.$eval('.mor-post img', (i) => (i as HTMLImageElement).naturalWidth);
  assert.ok(size > 0, 'the picture is shown');
  // A little less than fully opaque (asked for by Nobody, allegedly, 9 October 2026): the value is the site
  // stylesheet's, so the test follows it rather than fixing a number.
  const opacity = await f.$eval('.first-act .mor-act', (b) => [
    getComputedStyle(b).opacity,
    getComputedStyle(document.documentElement).getPropertyValue('--first-act-opacity').trim(),
  ]);
  assert.equal(Number(opacity[0]), Number(opacity[1]), `the first act shown at the stylesheet's opacity (${opacity})`);
  assert.ok(Number(opacity[0]) > 0.5 && Number(opacity[0]) < 1, `a little less than fully opaque (${opacity[0]})`);
  await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''));
  const acts = (await page.textContent('#mor-acts'))!;
  assert.ok(acts.includes(w.firstAct) && acts.replace(/ /g, '').includes(w.owner.id), 'the bar names the act, its standing and signer');
  await shot(page, 'front-first-act');
  assert.deepEqual(problems, []);
  await ctx.close();
});

/** A large JPEG, as the photograph of the Earth is: drawn by the browser, stripped to the picture alone. */
async function largeJpeg(): Promise<Uint8Array> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const bytes = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 2400;
    c.height = 2400;
    const x = c.getContext('2d')!;
    x.fillStyle = '#0b3d91';
    x.fillRect(0, 0, 2400, 2400);
    const b: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.8));
    return [...new Uint8Array(await b.arrayBuffer())];
  });
  await ctx.close();
  return strip(new Uint8Array(bytes)).bytes;
}

test("the first act's photograph scales to the page's width, whole, and nothing scrolls inside the page", async () => {
  // "Image needs a better fit. Now it shows pixel per pixel in a scrollable box" (Nobody, allegedly, 7 October 2026).
  const act = (await post(w.owner, { text: 'Thank you for the shower… (a large picture)', jpeg: await largeJpeg(), relays: [w.relay.base] })).id;
  const v = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(siteCopy(act)), relays: [w.relay.base] });
  const g = new Gateway(gatewayFor(w, v.id, { serve: 'pinned' }), join(here, 'dist'), { extraConnect: LOCAL });
  try {
    assert.ok(await ok(g));
    const at = await g.listen('127.0.0.1', 0);
    for (const width of [390, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(at + '/');
      await page.waitForSelector('#mor-bar.ok', { timeout: 60_000 });
      const f = await pageFrame(page);
      const inner = (await (await f.waitForSelector('.mor-act iframe', { timeout: 60_000 })).contentFrame())!;
      await inner.waitForSelector('.mor-post img');
      await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''));
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const frame = document.getElementById('mor-page') as HTMLIFrameElement;
        const d = frame.contentDocument!;
        const actFrame = d.querySelector('.mor-act iframe') as HTMLIFrameElement;
        const a = actFrame.contentDocument!;
        const img = a.querySelector('.mor-post img') as HTMLImageElement;
        const box = a.querySelector('.mor-post') as HTMLElement;
        return {
          natural: img.naturalWidth,
          shown: img.getBoundingClientRect().width,
          room: box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight),
          actScroll: [a.documentElement.scrollWidth, a.documentElement.clientWidth, a.documentElement.scrollHeight, actFrame.clientHeight],
          pageScroll: [d.documentElement.scrollWidth, d.documentElement.clientWidth, d.documentElement.scrollHeight, frame.clientHeight],
          top: [document.documentElement.scrollWidth, window.innerWidth],
        };
      });
      assert.equal(m.natural, 2400);
      assert.ok(Math.abs(m.shown - m.room) < 1, `the picture fills the width it has (${m.shown} of ${m.room})`);
      assert.ok(m.shown < width, 'and is shown whole, not pixel per pixel');
      assert.ok(m.actScroll[0] <= m.actScroll[1] && m.actScroll[2] <= m.actScroll[3] + 1, `the act's frame does not scroll (${m.actScroll})`);
      assert.ok(m.pageScroll[0] <= m.pageScroll[1] && m.pageScroll[2] <= m.pageScroll[3] + 1, `the page's frame does not scroll: it is as tall as the page (${m.pageScroll})`);
      assert.ok(m.top[0] <= m.top[1], 'nothing wider than the window');
      await shot(page, `front-large-picture-${width}`);
      await ctx.close();
    }
  } finally {
    g.close();
  }
});

test("on a phone's first screen (390 x 844), the photograph is whole and the band shows: the shortcuts, then the sections through a gradient", async () => {
  // Decided by Nobody, allegedly, 9 October 2026: the photograph a little less tall, still whole, so that a broadish
  // band ends the first screen; the two shortcuts at its top; below them a gradient, behind the sections and never
  // over their words, through which their first line shows. In light and dark.
  const act = (await post(w.owner, { text: 'Thank you for the shower… (a large picture)', jpeg: await largeJpeg(), relays: [w.relay.base] })).id;
  const v = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(siteCopy(act)), relays: [w.relay.base] });
  const g = new Gateway(gatewayFor(w, v.id, { serve: 'pinned' }), join(here, 'dist'), { extraConnect: LOCAL });
  try {
    assert.ok(await ok(g));
    const at = await g.listen('127.0.0.1', 0);
    for (const colorScheme of ['light', 'dark'] as const) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme });
      const page = await ctx.newPage();
      await page.goto(at + '/');
      await page.waitForSelector('#mor-bar.ok', { timeout: 60_000 });
      const f = await pageFrame(page);
      const inner = (await (await f.waitForSelector('.mor-act iframe', { timeout: 60_000 })).contentFrame())!;
      await inner.waitForSelector('.mor-post img');
      await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''));
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const frame = document.getElementById('mor-page') as HTMLIFrameElement;
        const top = frame.getBoundingClientRect().top;
        const d = frame.contentDocument!;
        const actFrame = d.querySelector('.mor-act iframe') as HTMLIFrameElement;
        const a = actFrame.contentDocument!;
        const img = a.querySelector('.mor-post img') as HTMLImageElement;
        const r = img.getBoundingClientRect();
        const look = getComputedStyle(img);
        const shortcuts = d.querySelector('.shortcuts')!.getBoundingClientRect();
        const door = d.querySelector('.doors a')!.getBoundingClientRect();
        const doors = d.querySelector('.doors')!;
        return {
          screen: window.innerHeight,
          img: [r.width, r.height, img.naturalWidth, img.naturalHeight],
          fit: look.objectFit,
          actScroll: [a.documentElement.scrollWidth, a.documentElement.clientWidth, a.documentElement.scrollHeight, actFrame.clientHeight],
          shortcuts: [top + shortcuts.top, top + shortcuts.bottom],
          door: top + door.top,
          gradient: getComputedStyle(doors).backgroundImage,
          doorBackground: getComputedStyle(d.querySelector('.doors a')!).backgroundColor,
          band: [getComputedStyle(d.documentElement).getPropertyValue('--band'), getComputedStyle(d.body).backgroundColor],
        };
      });
      const [shownW, shownH, naturalW, naturalH] = m.img;
      // Whole: the picture keeps its proportions inside its box, and nothing of it is cut off or scrolled.
      assert.equal(m.fit, 'contain', 'the picture is fitted whole into its box, never cropped');
      const scale = Math.min(shownW / naturalW, shownH / naturalH);
      assert.ok(naturalW * scale <= shownW + 0.5 && naturalH * scale <= shownH + 0.5, `the whole picture fits its box (${m.img})`);
      assert.ok(m.actScroll[0] <= m.actScroll[1] && m.actScroll[2] <= m.actScroll[3] + 1, `the act's frame does not scroll (${m.actScroll})`);
      // Less tall: no taller than its share of the screen's height.
      assert.ok(shownH <= PICTURE_SHARE * m.screen + 1, `the picture is no taller than ${PICTURE_SHARE} of the screen (${shownH} of ${m.screen})`);
      // The band: both shortcuts on the first screen, whole, and the sections' first line showing below them.
      assert.ok(m.shortcuts[1] <= m.screen, `both shortcuts on the first screen (${m.shortcuts} of ${m.screen})`);
      for (const id of ['#one-page', '#shower-text']) {
        const b = (await (await f.$(id))!.boundingBox())!;
        assert.ok(b.y >= 0 && b.y + b.height <= m.screen, `${id} shown whole on the first screen (${b.y}, ${b.height})`);
      }
      assert.ok(m.door + 40 <= m.screen, `the sections' first line shows on the first screen (${m.door} of ${m.screen})`);
      // Broadish: this test reads it as at least a quarter of the screen, from the shortcuts' top down.
      assert.ok(m.screen - m.shortcuts[0] >= m.screen / 4, `the band is at least a quarter of the screen (${m.screen - m.shortcuts[0]} of ${m.screen})`);
      // The gradient, behind the sections: their own boxes stay see-through, so nothing is drawn over their words.
      assert.match(m.gradient, /linear-gradient/, 'a gradient behind the sections');
      assert.equal(m.doorBackground, 'rgba(0, 0, 0, 0)', 'the sections draw nothing of their own over the gradient');
      assert.notEqual(m.band[0].trim(), '', 'the band colour is drawn from the page colours');
      await shot(page, `front-first-screen-${colorScheme}`);
      await ctx.close();
    }
  } finally {
    g.close();
  }
});

test('the footer: only the contact and the sealed message, then the clay tablet, the very last thing, on light and dark; the KI icon on the tab', async () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const path of ['/', '/read.html', '/build.html', '/run.html', '/use.html']) {
      const ctx = await browser.newContext({ colorScheme });
      // The icon as it is when the window finishes loading, which is when Safari's engine reads it, once.
      await ctx.addInitScript("addEventListener('load', () => { window.morIconAtLoad = document.querySelector('link[rel=\"icon\"]')?.getAttribute('href') ?? null; });");
      const page = await ctx.newPage();
      await page.goto(base + path);
      await page.waitForSelector('#mor-bar.ok', { timeout: 60_000 });
      const f = await pageFrame(page);
      const links = await f.$$eval('footer a', (as) => as.map((a) => [a.textContent, a.getAttribute('href')]));
      assert.deepEqual(links, [
        ['nobodyallegedly@dubsar.org', 'mailto:nobodyallegedly@dubsar.org'],
        ['A sealed message, through the reader', 'https://reader.dubsar.org/'],
      ]);
      const tablet = await f.evaluate(() => {
        const shown = [...document.querySelectorAll<HTMLImageElement>('footer img.tablet')].filter((i) => getComputedStyle(i).display !== 'none');
        // Every other thing shown, the boxes holding the tablet aside, ends above it.
        const tablet = shown[0];
        const others = [...document.body.querySelectorAll('*')].filter(
          (e) => e !== tablet && !e.contains(tablet) && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0,
        );
        const lowest = Math.max(...others.map((e) => e.getBoundingClientRect().bottom));
        return {
          shown: shown.map((i) => ({ cls: i.className, width: i.getBoundingClientRect().width, loaded: i.complete && i.naturalWidth > 0 })),
          last: tablet ? tablet.getBoundingClientRect().top >= lowest : false,
          page: getComputedStyle(document.body).backgroundColor,
        };
      });
      assert.equal(tablet.shown.length, 1, 'one tablet shown');
      assert.equal(tablet.shown[0].cls, `tablet ${colorScheme}`, 'the one drawn on this colour');
      assert.ok(tablet.shown[0].loaded, 'its checked bytes shown');
      assert.ok(tablet.shown[0].width >= 120, `about 120 px wide or more (${tablet.shown[0].width})`);
      assert.ok(tablet.last, 'the very last thing on the page');
      // The tablet is drawn on exactly the page's colour (scripts/marks.ts).
      assert.equal(tablet.page, colorScheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(18, 18, 18)');
      // The tab's icon: the site's icon.jpg, as the bytes the display client checked.
      const icon = await page.getAttribute('link[rel="icon"]', 'href');
      assert.equal(icon, `data:image/jpeg;base64,${readFileSync(join(w.dir, 'icon.jpg')).toString('base64')}`);
      // Already there when the window finished loading: the display client holds the load until the icon is
      // checked and set, since WebKit reads it then and never again.
      assert.equal(await page.evaluate(() => (window as { morIconAtLoad?: string | null }).morIconAtLoad), icon, 'the icon set before the window finished loading');
      assert.equal(await page.locator('iframe[aria-hidden]').count(), 0, 'the hold is gone once released');
      if (path === '/') await shot(page, `footer-${colorScheme}`);
      await ctx.close();
    }
  }
});

test("a door opens its page through the display client, checked again", async () => {
  const { page, ctx, problems, sandbox } = await open(base + '/');
  const f = await pageFrame(page);
  assert.equal(await f.getAttribute('.doors a:nth-child(3)', 'href'), '/run.html');
  // A plain click of the mouse, as a visitor's: Playwright's own click adds listeners inside the page's
  // frame, which WebKit's sandbox refuses, and reports.
  await f.locator('.doors a:nth-child(3)').scrollIntoViewIfNeeded();
  const door = (await f.locator('.doors a:nth-child(3)').boundingBox())!;
  await Promise.all([page.waitForURL(base + '/run.html'), page.mouse.click(door.x + door.width / 2, door.y + door.height / 2)]);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  assert.match((await standing(page))!, /^Verified/);
  assert.equal(await (await pageFrame(page)).textContent('h1'), 'Run');
  assert.deepEqual(problems, []);
  // Only the sandbox at work: the test's own helpers refused inside the page's frame, and WebKit reporting
  // its rule for leaving the page (only on a click) before it follows the click.
  assert.ok(sandbox.every((m) => /^Blocked script execution in 'about:srcdoc'|initiate navigation .* sandboxed/s.test(m)), sandbox.join('\n'));
  await ctx.close();
});

test('an altered page is shown as failing, and not shown', async () => {
  const original = at(honest).files.get('run.html')!;
  const altered = new TextDecoder().decode(original).replace('<h1>Run</h1>', '<h1>Run: send your keys to the gateway</h1>');
  at(honest).files.set('run.html', new TextEncoder().encode(altered));
  try {
    const { page, ctx } = await open(base + '/run.html');
    assert.match((await standing(page))!, /^Failing: what this gateway served for run\.html is not what was signed\. Not shown\./);
    assert.equal(await page.locator('#mor-page').count(), 0, 'no frame');
    assert.ok(!(await page.content()).includes('send your keys'), 'the altered words appear nowhere');
    assert.equal(await fp(page), w.owner.id, 'who signed the real page is still said');
    assert.match((await page.textContent('#mor-reasons'))!, /do not match the work hash/);
    await shot(page, 'altered-page');
    await ctx.close();
  } finally {
    at(honest).files.set('run.html', original);
  }
  // The other pages still verify.
  const { page, ctx } = await open(base + '/read.html');
  assert.match((await standing(page))!, /^Verified/);
  await ctx.close();
});

test('an altered stylesheet fails every page that uses it', async () => {
  const original = at(honest).files.get('site.css')!;
  at(honest).files.set('site.css', new TextEncoder().encode('.placeholder{display:none}\n'));
  try {
    const { page, ctx } = await open(base + '/read.html');
    assert.match((await standing(page))!, /^Failing: a file this page uses is not what was signed/);
    assert.match((await page.textContent('#mor-reasons'))!, /site\.css/);
    assert.equal(await page.locator('#mor-page').count(), 0);
    await ctx.close();
  } finally {
    at(honest).files.set('site.css', original);
  }
});

test("a version signed by someone else is shown as failing, naming who did sign it", async () => {
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home) });
  await other.publishGenesis();
  const copy = await publishSite(other, { name: 'dubsar.org', files: readFolder(w.dir), relays: [w.relay.base] });
  // A gateway whose settings are wrong (or lying): it names the owner, and a version by another.
  const g = new Gateway(gatewayFor(w, w.site.id), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok(await ok(g));
  at(g).served = copy.id;
  const b = await g.listen('127.0.0.1', 0);
  try {
    const { page, ctx } = await open(b + '/');
    assert.match((await standing(page))!, /^Failing: the site this gateway serves does not verify/);
    assert.equal(await fp(page), other.id, 'the real signer');
    assert.match((await page.textContent('#mor-bar'))!, /Not the identity this gateway names as Nobody, allegedly/);
    assert.equal(await page.locator('#mor-page').count(), 0);
    await shot(page, 'other-signer');
    await ctx.close();
  } finally {
    g.close();
  }
});

test('an address the signed site does not hold says so', async () => {
  const { page, ctx } = await open(base + '/nothing.html');
  assert.match((await standing(page))!, /^Failing: the signed site has no file at this address/);
  await ctx.close();
});

test('a page runs no code and loads nothing from elsewhere, whatever it tries; what is left is shown, verified', async () => {
  const { page, ctx, problems, elsewhere } = await open(hostileBase + '/', hostileCsp);
  assert.match((await standing(page))!, /^Verified/);
  const f = await pageFrame(page);
  await f.waitForSelector('#own');
  for (const sel of ['script', 'iframe', 'object', 'form', 'style', 'base', 'meta[http-equiv]', 'svg', 'noscript', '#far', '#js']) {
    assert.equal(await f.locator(sel).count(), 0, `${sel} dropped`);
  }
  assert.equal(await f.evaluate(() => document.querySelectorAll('[onload],[onerror],[style]').length), 0, 'no handler, no inline style');
  assert.equal(await f.evaluate(() => document.documentElement.dataset.ran ?? document.body.dataset.ran ?? null), null, 'nothing ran');
  assert.match((await f.getAttribute('#own', 'src'))!, /^blob:/, 'the site picture, as its checked bytes');
  assert.ok((await f.$eval('#own', (i) => (i as HTMLImageElement).naturalWidth)) > 0);
  assert.equal(await f.getAttribute('#out', 'target'), '_blank');
  assert.equal(await f.getAttribute('#out', 'title'), 'https://example.org/', 'where it goes is shown');
  assert.equal(await f.getAttribute('#mail', 'href'), 'mailto:someone@example.org');
  assert.equal(await f.getAttribute('#home', 'href'), '/');
  assert.equal(await f.locator('#gone').count(), 0, 'a link to a page the site does not hold is text');
  assert.ok((await f.textContent('body'))!.includes('a page that is not there'));
  assert.ok((await f.textContent('body'))!.includes('a script link'), 'its words stay, as text');
  assert.match((await f.textContent('.mor-act'))!, /Not an act id: not-an-act/);
  assert.equal(await f.$eval('#title', (h) => getComputedStyle(h).color), 'rgb(102, 51, 153)', 'the site stylesheet applies');
  assert.equal(await f.$eval('#title', (h) => getComputedStyle(h).backgroundImage), 'none', 'its url() is inert');
  await shot(page, 'hostile');
  assert.deepEqual(elsewhere, [], 'nothing fetched from elsewhere');
  assert.equal(await page.getAttribute('link[rel="icon"]', 'href'), 'data:,', 'an icon from elsewhere is not the tab icon');
  assert.deepEqual(problems, []);
  assert.ok(hostileCsp.every((m) => /base URI|inline style/.test(m)), hostileCsp.join('\n'));
  await ctx.close();

  // Files that are not pages: a picture and text, each under the bar.
  const pic = await open(hostileBase + '/photo.jpg');
  assert.match((await standing(pic.page))!, /^Verified: this picture/);
  assert.ok((await pic.page.$eval('#mor-view img', (i) => (i as HTMLImageElement).naturalWidth)) > 0);
  await pic.ctx.close();
  const txt = await open(hostileBase + '/notes.txt');
  assert.match((await standing(txt.page))!, /^Verified: this file/);
  assert.equal(await txt.page.textContent('#mor-view pre'), 'Plain text, shown as it is.\n<b>not bold</b>\n');
  await txt.ctx.close();
});

test('the display client always looks for later versions, and says when a newer one exists', async () => {
  // Pinned by its operator to the first version.
  const pinned = new Gateway(gatewayFor(w, w.site.id, { serve: 'pinned' }), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok(await ok(pinned));
  const pb = await pinned.listen('127.0.0.1', 0);
  try {
    let { page, ctx } = await open(pb + '/');
    await page.waitForSelector('#mor-bar[data-looked]', { timeout: 60_000 });
    assert.equal(await page.locator('#mor-newer').count(), 0, 'nothing newer yet');
    assert.match((await page.textContent('#mor-bar'))!, /This gateway's operator chose this version, and serves no other/);
    await ctx.close();

    // The owner publishes a second version, naming the first.
    const next = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(w.dir), relays: [w.relay.base], previous: w.site.id });
    ({ page, ctx } = await open(pb + '/'));
    assert.match((await standing(page))!, /^Verified/, 'the version served still verifies');
    assert.equal(await page.textContent('#mor-version'), w.site.id);
    await page.waitForSelector('#mor-newer', { timeout: 60_000 });
    assert.match((await page.textContent('#mor-newer'))!, /^A newer version of this site exists, signed by the same identity: [0-9a-f]{64}\. This gateway serves an earlier one\.$/);
    assert.equal(await page.textContent('#mor-latest'), next.id);
    await shot(page, 'newer-version');
    await ctx.close();

    // A gateway following the owner's latest moves to it once it looks again.
    assert.ok(await ok(honest));
    assert.equal(at(honest).served, next.id);
    ({ page, ctx } = await open(base + '/'));
    assert.equal(await page.textContent('#mor-version'), next.id);
    await page.waitForSelector('#mor-bar[data-looked]', { timeout: 60_000 });
    assert.equal(await page.locator('#mor-newer').count(), 0);
    assert.match((await page.textContent('#mor-bar'))!, /This gateway follows the owner's latest version/);
    await ctx.close();
  } finally {
    pinned.close();
  }
});

test('a browser that blocks WebAssembly is told, in plain words, that the page cannot be checked there, and why; nothing is shown', async () => {
  // As Tor Browser's Safer level does (onion check, 1 October 2026), the
  // browser offers no WebAssembly at all; the checker used to wait for the
  // core library forever. (Chromium's own switch for it is ignored, so the
  // page loses it before anything runs. As text: a function would be
  // rewritten by the TypeScript loader with helpers the page lacks.)
  const ctx = await browser.newContext();
  await ctx.addInitScript('delete globalThis.WebAssembly;');
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await page.waitForSelector('#mor-bar.bad', { timeout: 30_000 });
  assert.equal(await page.evaluate(() => typeof (globalThis as { WebAssembly?: unknown }).WebAssembly), 'undefined');
  assert.equal(await standing(page), 'This page cannot be checked in this browser, so it is not shown.');
  const why = (await page.textContent('#mor-cannot'))!;
  assert.match(why, /does not run WebAssembly, which the checker needs/);
  assert.match(why, /Tor Browser's Safer and Safest security levels/);
  assert.match(why, /mor-site verify/);
  assert.match(why, /Nothing from the site is shown unchecked\./);
  assert.equal(await page.title(), 'Not checked');
  assert.equal(await page.locator('#mor-page').count(), 0, 'no page shown');
  assert.equal(await page.locator('#mor-view').innerHTML(), '');
  await shot(page, 'no-webassembly');
  await ctx.close();
});

test('when the core library does not start for another reason, the page says so, with the reason, and shows nothing', async () => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route('**/_mor/mor_wasm_bg.wasm', (r) => r.abort('connectionfailed'));
  await page.goto(base + '/');
  await page.waitForSelector('#mor-bar.bad', { timeout: 30_000 });
  assert.equal(await standing(page), 'This page cannot be checked: the checker could not start. Not shown.');
  const why = (await page.textContent('#mor-cannot'))!;
  assert.match(why, /could not be started in this browser \(.+\)\./);
  assert.match(why, /Reload the page to try again/);
  assert.equal(await page.locator('#mor-page').count(), 0, 'no page shown');
  await ctx.close();
});

test('everything ran under the content security policy, with nothing refused', () => {
  assert.deepEqual(csp, []);
});
