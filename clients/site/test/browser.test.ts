// The gateway's display client in a real browser (headless Chromium), on a
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
import { chromium, type Browser, type Frame, type Page } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { parseSiteSettings } from '../src/settings.ts';
import { phone, world, type World } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
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

const settingsFor = (version: string, identity = w.owner.id) =>
  parseSiteSettings({ version, identity, name: 'Nobody, allegedly', relays: [w.relay.base] });

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  w = await world();
  honest = new Gateway(settingsFor(w.site.id), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok((await honest.load()).ok);
  base = await honest.listen('127.0.0.1', 0);

  const dir = mkdtempSync(join(tmpdir(), 'mor-site-hostile-'));
  writeFileSync(join(dir, 'index.html'), HOSTILE);
  writeFileSync(join(dir, 'look.css'), "@import url('https://example.org/more.css');\nh1{color:rebeccapurple;background:url(https://example.org/bg.jpg)}\n");
  writeFileSync(join(dir, 'photo.jpg'), strip(phone).bytes);
  writeFileSync(join(dir, 'notes.txt'), 'Plain text, shown as it is.\n<b>not bold</b>\n');
  const v = await publishSite(w.owner, { name: 'a hostile test site', files: readFolder(dir), relays: [w.relay.base] });
  hostile = new Gateway(settingsFor(v.id), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok((await hostile.load()).ok);
  hostileBase = await hostile.listen('127.0.0.1', 0);

  browser = await chromium.launch({ executablePath: CHROMIUM });
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
  page.on('console', (m) => {
    if (/Content.Security.Policy/i.test(m.text())) refusals.push(m.text());
    else if (m.type() === 'error') problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('request', (r) => {
    if (!/^(http:\/\/127\.0\.0\.1:|blob:|data:|about:)/.test(r.url())) elsewhere.push(r.url());
  });
  await page.goto(url);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  return { page, ctx, problems, elsewhere };
}

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
    const { page, ctx, problems, elsewhere } = await open(base + address);
    assert.match((await standing(page))!, /^Verified: this page is exactly what was signed by the identity this gateway names as Nobody, allegedly\. Checked in this browser\./, address);
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
  const size = await inner.$eval('.mor-post img', (i) => (i as HTMLImageElement).naturalWidth);
  assert.ok(size > 0, 'the picture is shown');
  await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''));
  const acts = (await page.textContent('#mor-acts'))!;
  assert.ok(acts.includes(w.firstAct) && acts.replace(/ /g, '').includes(w.owner.id), 'the bar names the act, its standing and signer');
  await shot(page, 'front-first-act');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test("a door opens its page through the display client, checked again", async () => {
  const { page, ctx, problems } = await open(base + '/');
  const f = await pageFrame(page);
  assert.equal(await f.getAttribute('.doors a:nth-child(3)', 'href'), '/run.html');
  await Promise.all([page.waitForURL(base + '/run.html'), f.click('.doors a:nth-child(3)')]);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  assert.match((await standing(page))!, /^Verified/);
  assert.equal(await (await pageFrame(page)).textContent('h1'), 'Run');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('an altered page is shown as failing, and not shown', async () => {
  const original = honest.files.get('run.html')!;
  const altered = new TextDecoder().decode(original).replace('<h1>Run</h1>', '<h1>Run: send your keys to the gateway</h1>');
  honest.files.set('run.html', new TextEncoder().encode(altered));
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
    honest.files.set('run.html', original);
  }
  // The other pages still verify.
  const { page, ctx } = await open(base + '/read.html');
  assert.match((await standing(page))!, /^Verified/);
  await ctx.close();
});

test('an altered stylesheet fails every page that uses it', async () => {
  const original = honest.files.get('site.css')!;
  honest.files.set('site.css', new TextEncoder().encode('.placeholder{display:none}\n'));
  try {
    const { page, ctx } = await open(base + '/read.html');
    assert.match((await standing(page))!, /^Failing: a file this page uses is not what was signed/);
    assert.match((await page.textContent('#mor-reasons'))!, /site\.css/);
    assert.equal(await page.locator('#mor-page').count(), 0);
    await ctx.close();
  } finally {
    honest.files.set('site.css', original);
  }
});

test("a version signed by someone else is shown as failing, naming who did sign it", async () => {
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home) });
  await other.publishGenesis();
  const copy = await publishSite(other, { name: 'dubsar.org', files: readFolder(w.dir), relays: [w.relay.base] });
  // A gateway whose settings are wrong (or lying): it names the owner, and a version by another.
  const g = new Gateway(settingsFor(w.site.id), join(here, 'dist'), { extraConnect: LOCAL });
  assert.ok((await g.load()).ok);
  g.settings = settingsFor(copy.id);
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

test('everything ran under the content security policy, with nothing refused', () => {
  assert.deepEqual(csp, []);
});
