// Films listed under the main film (website cMIP, draft 5, rule 12b), in a
// real browser (headless Chromium, or WebKit, Safari's engine, with
// MOR_BROWSER=webkit), on a fresh profile each time, against real homes and a
// relay on local ports. Two versions of dubsar.org: as in the repository
// (its films block empty), and with three synthetic films put in by the
// publishing tool (`mor-site films`): the main one, "MOR use cases" and "The
// unwritten layer". Each film is a synthetic clip (ffmpeg's test pattern),
// stripped; never anyone's real film.
//
// As in film.test.ts: a browser that plays H.264 (Google Chrome, Safari)
// plays the films; one that does not (Playwright's own Chromium and WebKit on
// Linux) says so and fetches nothing; where the check itself must be
// reached, the browser is told it plays H.264.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Frame, type Page } from 'playwright-core';
import { placeFilms } from '../src/films.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { benign, gatewayFor, siteCopy, world, type World } from './world.ts';

// A time limit on each test and hook (WebKit on GitHub once hung 58 minutes with no word, round 8's follow-up): a hang fails here, named.
const LIMIT = { timeout: 240_000 };

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;
const LOCAL = ['http://127.0.0.1:*'];
const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`../../../modules/video/test/fixtures/${name}`, import.meta.url)));
const picture = (name: string) => new Uint8Array(readFileSync(new URL(`../../../modules/jpeg/test/fixtures/${name}`, import.meta.url)));

const USE_CASES = 'films/mor-use-cases.mp4';
const UNWRITTEN = 'films/the-unwritten-layer.mp4';

/** A page trying to list films any other way: from elsewhere, a picture as a film, a film the version does not hold, a place it made itself. */
const TRIES = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Listed films that are not allowed</title></head><body>
<p>
<mor-film id="far" src="https://example.org/elsewhere.mp4" poster="/films/main.jpg">From elsewhere</mor-film>
<mor-film id="picture" src="/films/main.jpg">A picture</mor-film>
<mor-film id="absent" src="/films/absent.mp4">Not in this version</mor-film>
<mor-film id="poster-far" src="/films/mor-use-cases.mp4" poster="https://example.org/poster.jpg"><img src="https://example.org/x.jpg">Its own, with a poster from elsewhere</mor-film>
<span class="mor-film-link" data-film-listed="0" id="forged">A place the page made itself</span>
</p>
</body></html>`;

let w: World;
let browser: Browser;
/** The version as in the repository, without films; and the one with them. */
let bare: Gateway;
let filmed: Gateway;
let bareAt: string;
let filmedAt: string;

before(async () => {
  // Its own folder, not dist/: the other test files build at the same time, and each build empties its folder first.
  const shell = mkdtempSync(join(tmpdir(), 'mor-films-shell-'));
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts', '--out', shell], { cwd: here, stdio: 'ignore' });
  w = await world();
  const dir = siteCopy(w.firstAct);
  placeFilms(dir, {
    main: { film: fixture('sound.mp4'), poster: picture('phone.jpg') },
    listed: [
      { film: fixture('plain.mp4'), poster: picture('grey.jpg'), label: 'MOR use cases' },
      { film: fixture('sound.mp4'), poster: picture('phone.jpg'), label: 'The unwritten layer' },
    ],
  });
  writeFileSync(join(dir, 'tries.html'), TRIES);
  const v = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(dir), relays: [w.relay.base], previous: w.site.id });
  bare = new Gateway(gatewayFor(w, w.site.id, { serve: 'pinned' }), shell, { extraConnect: LOCAL });
  filmed = new Gateway(gatewayFor(w, v.id, { serve: 'pinned' }), shell, { extraConnect: LOCAL });
  for (const g of [bare, filmed]) assert.ok((await g.load()).every((s) => s.loaded.ok));
  bareAt = await bare.listen('127.0.0.1', 0);
  filmedAt = await filmed.listen('127.0.0.1', 0);
  browser = WEBKIT ? await webkit.launch() : await chromium.launch({ executablePath: CHROMIUM });
}, LIMIT);

after(async () => {
  await browser?.close();
  bare?.close();
  filmed?.close();
  await w?.stop();
}, LIMIT);

const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

/** A fresh browser context (a fresh device); `canPlay` tells the page's browser it plays H.264, whatever it does. */
async function open(at: string, address: string, o: { phone?: boolean; canPlay?: boolean } = {}) {
  const ctx = await browser.newContext(o.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true } : {});
  if (o.canPlay) {
    await ctx.addInitScript(() => {
      HTMLMediaElement.prototype.canPlayType = () => 'probably';
    });
  }
  const page = await ctx.newPage();
  const fetched: string[] = [];
  const elsewhere: string[] = [];
  const problems: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/_mor/file/')) fetched.push(r.url().replace(/^.*\/_mor\/file\//, ''));
    if (!/^(http:\/\/127\.0\.0\.1:|blob:|data:|about:)/.test(r.url())) elsewhere.push(r.url());
  });
  page.on('pageerror', (e) => {
    if (!benign(String(e))) problems.push(String(e));
  });
  await page.goto(at + address);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  return { page, ctx, fetched, elsewhere, problems };
}

async function pageFrame(page: Page): Promise<Frame> {
  const f = await (await page.waitForSelector('#mor-page')).contentFrame();
  assert.ok(f);
  await f.waitForLoadState();
  return f;
}

/** Whether this browser, untold, plays H.264. */
const playsH264 = (page: Page) => page.evaluate(() => !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'));

const popup = '.mor-popup';
const button = (path: string) => `.mor-film-open[data-film="${path}"]`;

/** Wait until the pop-up's player has decided: verified, failing, or cannot. */
async function decided(page: Page): Promise<string> {
  await page.waitForFunction(() => /^(verified|failing|cannot)$/.test(document.querySelector<HTMLElement>('.mor-popup .mor-player')?.dataset.state ?? ''), undefined, { timeout: 60_000 });
  return (await page.getAttribute('.mor-popup .mor-player', 'data-state'))!;
}

/** The pop-up is gone, nothing of a film is left playing, and the page scrolls again. */
async function closedAndStopped(page: Page, opener: string) {
  await page.waitForSelector(popup, { state: 'detached', timeout: 10_000 });
  assert.equal(await page.locator('.mor-popup, .mor-popup video').count(), 0);
  assert.ok(await page.evaluate(() => [...document.querySelectorAll('video')].every((v) => v.paused)), 'no film plays');
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '', 'the page scrolls again');
  assert.equal(await page.evaluate((s) => document.activeElement === document.querySelector(s), opener), true, 'the focus back on its button');
}

test('without the films, the front page shows no film and no button', LIMIT, async () => {
  const { page, ctx, problems } = await open(bareAt, '/');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified: this page is exactly what was signed/);
  const f = await pageFrame(page);
  assert.equal(await f.locator('.films, .mor-film, .mor-film-link, mor-film, video').count(), 0);
  assert.equal(await page.locator('.mor-player, .mor-film-open').count(), 0);
  assert.equal(await page.locator('#mor-films').count(), 0, 'no film in the bar');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('with the films, two small buttons sit under the main film, labelled, side by side; nothing of their films is fetched', LIMIT, async () => {
  const { page, ctx, fetched, elsewhere, problems } = await open(filmedAt, '/');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified: this page is exactly what was signed/);
  const f = await pageFrame(page);
  assert.equal(await f.locator('mor-film, video').count(), 0, 'no film element left in the page itself');
  assert.deepEqual(await f.$$eval('.more-films .mor-film-link', (els) => els.map((e) => e.textContent)), ['MOR use cases', 'The unwritten layer']);
  await page.waitForFunction(() => (document.querySelector<HTMLImageElement>('.mor-player img')?.naturalWidth ?? 0) > 0);
  await page.waitForTimeout(200);
  const main = (await page.locator('.mor-player[data-film="films/main.mp4"]').boundingBox())!;
  const frameAt = await page.$eval('#mor-page', (e) => e.getBoundingClientRect().top);
  const boxes = [];
  for (const [path, label] of [
    [USE_CASES, 'MOR use cases'],
    [UNWRITTEN, 'The unwritten layer'],
  ]) {
    const b = page.locator(button(path));
    assert.equal(await b.textContent(), label);
    assert.equal(await b.getAttribute('aria-haspopup'), 'dialog');
    const box = (await b.boundingBox())!;
    // Laid exactly on its place in the page.
    const spot = await f.$eval(`.mor-film-link:text-is("${label}")`, (e) => {
      const r = e.getBoundingClientRect();
      return { y: r.top, w: r.width, h: r.height };
    });
    assert.ok(Math.abs(box.y - (frameAt + spot.y)) < 1.5 && Math.abs(box.width - spot.w) < 1.5 && Math.abs(box.height - spot.h) < 1.5, `${label} lies on its place`);
    assert.ok(box.y >= main.y + main.height, `${label} is under the main film`);
    assert.ok(box.height < 60 && box.width < main.width / 2, `${label} is small (${box.width} x ${box.height})`);
    boxes.push(box);
  }
  assert.ok(Math.abs(boxes[0].y - boxes[1].y) < 1.5 && boxes[0].x + boxes[0].width <= boxes[1].x, 'side by side');
  // Their posters are checked with the page; their films are not fetched.
  for (const p of ['films/mor-use-cases.jpg', 'films/the-unwritten-layer.jpg']) assert.ok(fetched.includes(p), `${p} checked with the page`);
  for (const p of ['films/main.mp4', USE_CASES, UNWRITTEN]) assert.ok(!fetched.includes(p), `${p} not fetched`);
  const bar = (await page.textContent('#mor-films'))!;
  assert.match(bar, /films\/mor-use-cases\.mp4 \(“MOR use cases”\): not fetched/);
  assert.match(bar, /films\/the-unwritten-layer\.mp4 \(“The unwritten layer”\): not fetched/);
  assert.deepEqual(elsewhere, []);
  assert.deepEqual(problems, []);
  await shot(page, 'films-buttons');
  await ctx.close();
});

test('pressed, a button opens the pop-up, which plays its film with the same player and rules; the close control closes it and stops the film', LIMIT, async () => {
  const { page, ctx, fetched, problems } = await open(filmedAt, '/');
  await pageFrame(page);
  const plays = await playsH264(page);
  await page.click(button(USE_CASES));
  await page.waitForSelector(popup);
  assert.equal(await page.getAttribute(popup, 'role'), 'dialog');
  assert.equal(await page.getAttribute(popup, 'aria-modal'), 'true');
  assert.equal(await page.getAttribute(popup, 'aria-label'), 'MOR use cases');
  assert.equal(await page.textContent('.mor-popup-title'), 'MOR use cases');
  assert.ok(await page.evaluate(() => document.activeElement?.classList.contains('mor-popup-close')), 'the focus on the close control');
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden', 'the page behind does not scroll');
  const state = await decided(page);
  if (plays) {
    // The press was the ask: fetched, checked, played inline with its controls, from the checked bytes.
    assert.equal(state, 'verified', (await page.textContent('#mor-films'))!);
    const video = page.locator('.mor-popup video');
    assert.ok(await video.evaluate((v: HTMLVideoElement) => v.controls && v.playsInline && v.hasAttribute('playsinline') && v.hasAttribute('webkit-playsinline') && !v.autoplay && !v.muted));
    assert.match((await video.getAttribute('src'))!, /^blob:/);
    await page.waitForFunction(() => (document.querySelector<HTMLVideoElement>('.mor-popup video')?.currentTime ?? 0) > 0.2, undefined, { timeout: 30_000 });
    assert.ok(fetched.includes(USE_CASES));
    assert.match((await page.textContent('#mor-films'))!, /films\/mor-use-cases\.mp4 \(“MOR use cases”\): verified: exactly what was signed/);
  } else {
    assert.equal(state, 'cannot');
    assert.match((await page.textContent('.mor-popup .mor-player'))!, /This browser does not play H\.264 films, so the film was not fetched/);
    assert.ok(!fetched.includes(USE_CASES), 'nothing of the film fetched');
    assert.equal(await page.locator('.mor-popup .mor-player img').count(), 1, 'its poster in its place');
  }
  await page.evaluateHandle(() => ((window as unknown as { film: unknown }).film = document.querySelector('.mor-popup video')));
  await page.click('.mor-popup-close');
  await closedAndStopped(page, button(USE_CASES));
  // The film that was playing is stopped and let go, not merely hidden.
  assert.ok(await page.evaluate(() => {
    const v = (window as unknown as { film: HTMLVideoElement | null }).film;
    return !v || (v.paused && !v.hasAttribute('src') && !v.isConnected);
  }));
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/, 'the page stays verified');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a browser told it plays H.264 fetches and checks the film in the pop-up; the Escape key closes it, and a press outside it', LIMIT, async () => {
  const { page, ctx, fetched, problems } = await open(filmedAt, '/', { canPlay: true });
  await pageFrame(page);
  await page.click(button(UNWRITTEN));
  const state = await decided(page);
  assert.ok(['verified', 'cannot'].includes(state), state);
  assert.ok(fetched.includes(UNWRITTEN), 'fetched once its button was pressed');
  if (state === 'cannot') assert.match((await page.textContent('#mor-films'))!, /“The unwritten layer”\): not played in this browser, this browser stopped playing it/);
  // A press on the film itself does not close it.
  await page.click('.mor-popup-head .mor-popup-title');
  assert.equal(await page.locator(popup).count(), 1);
  await page.keyboard.press('Escape');
  await closedAndStopped(page, button(UNWRITTEN));
  // Opened again, it is not fetched again: its checked bytes were kept.
  const before = fetched.filter((p) => p === UNWRITTEN).length;
  await page.click(button(UNWRITTEN));
  await decided(page);
  assert.equal(fetched.filter((p) => p === UNWRITTEN).length, before);
  // A press outside the film, on the shade.
  await page.mouse.click(5, 5);
  await closedAndStopped(page, button(UNWRITTEN));
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('closed while its film is still being fetched, the pop-up leaves nothing to play later', LIMIT, async () => {
  const { page, ctx, problems } = await open(filmedAt, '/', { canPlay: true });
  await pageFrame(page);
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route(`**/_mor/file/${USE_CASES}`, async (route) => {
    await held;
    await route.continue().catch(() => {});
  });
  await page.click(button(USE_CASES));
  await page.waitForFunction(() => document.querySelector<HTMLElement>('.mor-popup .mor-player')?.dataset.state === 'checking');
  await page.click('.mor-popup-close');
  await closedAndStopped(page, button(USE_CASES));
  release();
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('video').count(), 0, 'no film made after closing');
  assert.match((await page.textContent('#mor-films'))!, /“MOR use cases”\): not fetched/);
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a listed film the gateway altered is not played, and the bar says so; the page stays as signed', LIMIT, async () => {
  const at = filmed.sites.get('127.0.0.1')!;
  const original = at.files.get(USE_CASES)!;
  const altered = original.slice();
  altered[altered.length - 100] ^= 0xff;
  at.files.set(USE_CASES, altered);
  try {
    const { page, ctx, problems } = await open(filmedAt, '/', { canPlay: true });
    await pageFrame(page);
    await page.click(button(USE_CASES));
    assert.equal(await decided(page), 'failing');
    assert.match((await page.textContent('.mor-popup .mor-player'))!, /What this gateway served for the film is not what was signed\. Not played\./);
    assert.equal(await page.locator('video').count(), 0);
    assert.match((await page.textContent('#mor-films'))!, /“MOR use cases”\): failing: not played, what this gateway served is not what was signed/);
    assert.match((await page.textContent('#mor-standing'))!, /^Verified: this page/);
    assert.deepEqual(problems, []);
    await ctx.close();
  } finally {
    at.files.set(USE_CASES, original);
  }
});

test('a page cannot list a film from outside its version: from elsewhere, a picture, a film it does not hold, or a place it made itself', LIMIT, async () => {
  const { page, ctx, elsewhere, fetched } = await open(filmedAt, '/tries.html');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/);
  const f = await pageFrame(page);
  assert.equal(await f.locator('mor-film, img').count(), 0);
  // Only its own film gets a place, its poster from elsewhere dropped; the place the page made itself gets no button.
  assert.deepEqual(await f.$$eval('.mor-film-link[data-film-listed]', (els) => els.map((e) => e.id)), ['poster-far']);
  assert.equal(await page.locator('.mor-film-open').count(), 1);
  assert.equal(await page.locator(button(USE_CASES)).textContent(), 'Its own, with a poster from elsewhere');
  await page.click(button(USE_CASES));
  await decided(page);
  assert.equal(await page.locator('.mor-popup .mor-player img').count(), 0, 'no poster from elsewhere');
  assert.deepEqual(elsewhere, [], 'nothing asked of anyone else');
  assert.ok(!fetched.includes('films/absent.mp4'));
  await ctx.close();
});

test("on a phone, the buttons fit side by side, the pop-up fits the screen with a close control big enough to tap, and a tap outside closes it", LIMIT, async () => {
  const { page, ctx, problems } = await open(filmedAt, '/', { phone: true, canPlay: true });
  await pageFrame(page);
  await page.waitForFunction(() => (document.querySelector<HTMLImageElement>('.mor-player img')?.naturalWidth ?? 0) > 0);
  await page.waitForTimeout(200);
  const a = (await page.locator(button(USE_CASES)).boundingBox())!;
  const b = (await page.locator(button(UNWRITTEN)).boundingBox())!;
  assert.ok(Math.abs(a.y - b.y) < 1.5 && a.x >= 0 && b.x + b.width <= 390, `side by side, on the screen (${JSON.stringify([a, b])})`);
  await page.locator(button(USE_CASES)).scrollIntoViewIfNeeded();
  await page.locator(button(USE_CASES)).tap();
  await decided(page);
  const player = (await page.locator('.mor-popup .mor-player').boundingBox())!;
  const close = (await page.locator('.mor-popup-close').boundingBox())!;
  assert.ok(player.x >= 0 && player.x + player.width <= 390 + 0.5 && player.width > 300, `the film spans the screen (${JSON.stringify(player)})`);
  assert.ok(player.y >= 0 && player.y + player.height <= 844, 'the film is whole on the screen');
  assert.ok(close.y >= 0 && close.height >= 44 && close.x + close.width <= 390 + 0.5, `the close control can be tapped (${JSON.stringify(close)})`);
  await shot(page, 'films-popup-phone');
  await page.touchscreen.tap(195, 835);
  await closedAndStopped(page, button(USE_CASES));
  assert.deepEqual(problems, []);
  await ctx.close();
});
