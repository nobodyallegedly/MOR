// A film on a page of the site (website cMIP, draft 4, rule 12a; the video
// Module), in a real browser (headless Chromium, or WebKit, Safari's engine,
// with MOR_BROWSER=webkit), on a fresh profile each time, against real homes
// and a relay on local ports. The film is a synthetic clip (ffmpeg's test
// pattern and a tone), stripped; its poster a stripped JPEG.
//
// A browser that plays H.264 (Google Chrome, Safari) plays it; one that does
// not (Playwright's own Chromium and WebKit on Linux) says so and fetches
// nothing. Both paths are tested, whichever this browser is; where the check
// itself must be reached, the browser is told it can play H.264, and then
// says it could not when its decoder fails.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Frame, type Page } from 'playwright-core';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { strip as stripFilm } from '../../../modules/video/src/video.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { gatewayFor, phone, siteCopy, world, type World } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;
const LOCAL = ['http://127.0.0.1:*'];
const FILM = stripFilm(new Uint8Array(readFileSync(new URL('../../../modules/video/test/fixtures/sound.mp4', import.meta.url)))).bytes;
const POSTER = strip(phone).bytes;

/** Where the film goes on the front page in this test: after the shortcuts. Its place on dubsar.org is Nobody, allegedly's to choose. */
const FILM_HTML = `<section class="film"><video src="film.mp4" poster="film-poster.jpg" autoplay muted loop controls preload="auto" title="The film"></video></section>\n`;

/** A page trying to get a film any other way. */
const TRIES = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Films that are not allowed</title></head><body>
<h1>Films</h1>
<video id="far" src="https://example.org/elsewhere.mp4" poster="https://example.org/poster.jpg" autoplay></video>
<video id="sources" poster="film-poster.jpg"><source src="film.mp4" type="video/mp4"><source src="https://example.org/x.mp4"></video>
<video id="picture" src="film-poster.jpg"></video>
<audio src="film.mp4" autoplay></audio>
<video id="own" src="film.mp4" poster="https://example.org/poster.jpg"></video>
<div class="mor-film" data-film="0" id="forged">A place the page made itself</div>
</body></html>`;

let w: World;
let browser: Browser;
let g: Gateway;
let base: string;
let version: string;

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  w = await world();
  const dir = siteCopy(w.firstAct);
  const index = join(dir, 'index.html');
  writeFileSync(index, readFileSync(index, 'utf8').replace('<nav class="doors">', `${FILM_HTML}<nav class="doors">`));
  writeFileSync(join(dir, 'film.mp4'), FILM);
  writeFileSync(join(dir, 'film-poster.jpg'), POSTER);
  writeFileSync(join(dir, 'films.html'), TRIES);
  const v = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(dir), relays: [w.relay.base] });
  version = v.id;
  g = new Gateway(gatewayFor(w, version), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok((await g.load()).every((s) => s.loaded.ok));
  base = await g.listen('127.0.0.1', 0);
  browser = WEBKIT ? await webkit.launch() : await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  g?.close();
  await w?.stop();
});

const at = () => g.sites.get('127.0.0.1')!;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

/** A fresh browser context (a fresh device); `canPlay` tells the page's browser it plays H.264, whatever it does. */
async function open(address: string, o: { phone?: boolean; canPlay?: boolean } = {}) {
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
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.goto(base + address);
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

/** Press play, and wait until the player has decided: verified, failing, or cannot. */
async function press(page: Page, selector = '.mor-player[data-film="film.mp4"]'): Promise<string> {
  await page.click(`${selector} button`);
  await page.waitForFunction((s) => /^(verified|failing|cannot)$/.test(document.querySelector<HTMLElement>(s)?.dataset.state ?? ''), selector, { timeout: 60_000 });
  return (await page.getAttribute(selector, 'data-state'))!;
}

test("the front page shows the film's place with its poster, checked, and fetches nothing of the film until play is pressed", async () => {
  const { page, ctx, fetched, elsewhere, problems } = await open('/');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified: this page is exactly what was signed/);
  const f = await pageFrame(page);
  // In the page: a place for the film, no video element, nothing the page asked for (autoplay, loop, muted).
  assert.equal(await f.locator('video, audio, source').count(), 0, 'no video element in the page itself');
  assert.equal(await f.locator('section.film > .mor-film[data-film]').count(), 1);
  // Over it: the display client's own player, with the poster, laid exactly on the place.
  const player = page.locator('.mor-player[data-film="film.mp4"]');
  await page.waitForFunction(() => (document.querySelector<HTMLImageElement>('.mor-player img')?.naturalWidth ?? 0) > 0);
  await page.waitForTimeout(200);
  const spot = await f.$eval('.mor-film', (e) => {
    const r = e.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const frameAt = await page.$eval('#mor-page', (e) => ({ x: (e as HTMLElement).getBoundingClientRect().left, y: (e as HTMLElement).getBoundingClientRect().top }));
  const box = (await player.boundingBox())!;
  for (const [a, b, what] of [
    [box.x, frameAt.x + spot.x, 'left'],
    [box.y, frameAt.y + spot.y, 'top'],
    [box.width, spot.w, 'width'],
    [box.height, spot.h, 'height'],
  ] as const) assert.ok(Math.abs(a - b) < 1.5, `the player lies on the film's place (${what}: ${a} and ${b})`);
  // The place takes the poster's shape, so nothing of the film is cropped.
  const shape = await page.$eval('.mor-player img', (i) => (i as HTMLImageElement).naturalWidth / (i as HTMLImageElement).naturalHeight);
  assert.ok(Math.abs(spot.w / spot.h - shape) < 0.02, `the place has the poster's shape (${spot.w / spot.h} and ${shape})`);
  assert.match((await player.textContent())!, /Play the film/);
  assert.match((await player.textContent())!, /^[^]*[0-9.]+ (kB|MB), checked against what was signed before it plays\.$/);
  assert.equal(await page.locator('video').count(), 0, 'no video element until play is pressed');
  assert.ok(fetched.includes('film-poster.jpg'), 'the poster is fetched and checked with the page');
  assert.ok(!fetched.includes('film.mp4'), 'the film is not fetched before play is pressed');
  assert.match((await page.textContent('#mor-films'))!, /film\.mp4: not fetched; checked against what was signed before it plays/);
  assert.deepEqual(elsewhere, []);
  assert.deepEqual(problems, []);
  await shot(page, 'film-waiting');
  await ctx.close();
});

test('pressed, the film is fetched, checked, and played inline with its controls; nothing starts on its own', async () => {
  const { page, ctx, fetched, problems } = await open('/');
  await pageFrame(page);
  const plays = await playsH264(page);
  const state = await press(page);
  if (plays) {
    assert.equal(state, 'verified', (await page.textContent('#mor-films'))!);
    const video = page.locator('.mor-player video');
    assert.equal(await video.count(), 1);
    assert.ok(await video.evaluate((v: HTMLVideoElement) => v.controls && v.playsInline && v.hasAttribute('playsinline') && v.hasAttribute('webkit-playsinline')), 'inline, with its controls');
    assert.ok(await video.evaluate((v: HTMLVideoElement) => !v.autoplay && !v.loop && !v.muted), "the page's autoplay, loop and muted are not the page's to set");
    assert.match((await video.getAttribute('src'))!, /^blob:/, 'played from the checked bytes');
    await page.waitForFunction(() => (document.querySelector('video')?.currentTime ?? 0) > 0.2, undefined, { timeout: 30_000 });
    assert.match((await page.textContent('#mor-films'))!, /film\.mp4: verified: exactly what was signed/);
    assert.ok(fetched.includes('film.mp4'), 'fetched once play was pressed');
  } else {
    // A browser that plays no H.264 is told so, and the film is not fetched at all.
    assert.equal(state, 'cannot');
    assert.match((await page.textContent('.mor-player'))!, /This browser does not play H\.264 films, so the film was not fetched/);
    assert.ok(!fetched.includes('film.mp4'), 'nothing of the film fetched');
    assert.equal(await page.locator('.mor-player img').count(), 1, 'the poster stays in its place');
    assert.match((await page.textContent('#mor-films'))!, /not played in this browser, this browser plays no H\.264 film/);
  }
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/, 'the page stays verified');
  assert.deepEqual(problems, []);
  await shot(page, 'film-pressed');
  await ctx.close();
});

test('a browser told it plays H.264 checks the film, then plays it or says its decoder could not', async () => {
  const { page, ctx, fetched } = await open('/', { canPlay: true });
  await pageFrame(page);
  const state = await press(page);
  assert.ok(fetched.includes('film.mp4'));
  assert.equal(await page.locator('.mor-player[data-state] video, .mor-player[data-state] img').count() > 0, true);
  if (state === 'cannot') {
    // This browser's decoder could not play it: said, the poster left, nothing of the film shown.
    await page.waitForSelector('.mor-player img');
    assert.match((await page.textContent('#mor-films'))!, /not played in this browser, this browser stopped playing it/);
    assert.equal(await page.locator('.mor-player video').count(), 0);
  } else {
    assert.equal(state, 'verified');
  }
  await ctx.close();
});

test('a film the gateway altered is not played, and the bar says so; the page stays as signed', async () => {
  const original = at().files.get('film.mp4')!;
  const altered = original.slice();
  altered[altered.length - 100] ^= 0xff; // one bit of one picture
  at().files.set('film.mp4', altered);
  try {
    const { page, ctx, problems } = await open('/', { canPlay: true });
    await pageFrame(page);
    assert.equal(await press(page), 'failing');
    assert.match((await page.textContent('.mor-player'))!, /What this gateway served for the film is not what was signed\. Not played\./);
    assert.equal(await page.locator('video').count(), 0, 'nothing of it is handed to the browser');
    assert.equal(await page.locator('.mor-player img').count(), 1, 'the poster stays');
    assert.match((await page.textContent('#mor-films'))!, /film\.mp4: failing: not played, what this gateway served is not what was signed/);
    assert.match((await page.textContent('#mor-standing'))!, /^Verified: this page/, 'the page itself is as signed');
    assert.deepEqual(problems, []);
    await shot(page, 'film-altered');
    await ctx.close();
  } finally {
    at().files.set('film.mp4', original);
  }
});

test('an altered poster fails the page, as any picture it uses', async () => {
  const original = at().files.get('film-poster.jpg')!;
  at().files.set('film-poster.jpg', strip(new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/grey.jpg', import.meta.url)))).bytes);
  try {
    const { page, ctx } = await open('/');
    assert.match((await page.textContent('#mor-standing'))!, /^Failing: a file this page uses is not what was signed/);
    assert.match((await page.textContent('#mor-reasons'))!, /film-poster\.jpg/);
    assert.equal(await page.locator('#mor-page, .mor-player').count(), 0);
    await ctx.close();
  } finally {
    at().files.set('film-poster.jpg', original);
  }
});

test('a page cannot load a film from elsewhere, through sources, as sound, or start one on its own', async () => {
  const { page, ctx, elsewhere, fetched } = await open('/films.html');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/);
  const f = await pageFrame(page);
  assert.equal(await f.locator('video, audio, source').count(), 0);
  // Only the film named by its own `src` gets a place; its poster from elsewhere is dropped, not fetched.
  assert.deepEqual(await f.$$eval('.mor-film[data-film]', (els) => els.map((e) => e.id)), ['own'], 'a place the page made itself gets no player');
  assert.equal(await page.locator('.mor-player').count(), 1);
  assert.equal(await page.locator('.mor-player img').count(), 0, 'no poster from elsewhere');
  assert.deepEqual(elsewhere, [], 'nothing asked of anyone else');
  assert.ok(!fetched.includes('film.mp4'));
  await ctx.close();
});

test('the film at its own address is shown in the player, verified, under the bar', async () => {
  const { page, ctx } = await open('/film.mp4');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified: this film is exactly what was signed/);
  assert.equal(await page.locator('.file .mor-player').count(), 1);
  const state = await press(page, '.file .mor-player');
  assert.ok(['verified', 'cannot'].includes(state), state);
  await ctx.close();
});

test("on a phone's screen the film's place spans the page's width, and the player with it", async () => {
  const { page, ctx } = await open('/', { phone: true });
  const f = await pageFrame(page);
  await page.waitForFunction(() => (document.querySelector<HTMLImageElement>('.mor-player img')?.naturalWidth ?? 0) > 0);
  await page.waitForTimeout(200);
  const spot = await f.$eval('.mor-film', (e) => e.getBoundingClientRect().width);
  const main = await f.$eval('section.film', (e) => e.getBoundingClientRect().width);
  const box = (await page.locator('.mor-player').boundingBox())!;
  assert.ok(Math.abs(spot - main) < 1.5 && spot > 300, `the place spans the page's width (${spot} of ${main})`);
  assert.ok(Math.abs(box.width - spot) < 1.5 && box.x >= 0 && box.x + box.width <= 390 + 0.5, `the player with it (${JSON.stringify(box)})`);
  await shot(page, 'film-phone');
  await ctx.close();
});
