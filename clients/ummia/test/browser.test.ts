// Ummia on the kit, in a real browser (headless Chromium, fresh profiles), by
// clicks and typing alone, against real homes and relays on local ports, at
// a Mac's size (1280×800) and a phone's (390×844):
//
// - the program's page: an identity brought by its signing words; the four
//   tiles and their danger marks; Publish: a cMIP read back with its hash
//   first, then its card offered and signed with a discussion thread; a
//   release from a folder chosen with the picker, checked as anyone would;
//   Look: the feed, the card's title on the specification, a release saying
//   what changed since the version before; Point at each kind, Filter by
//   each kind and by layer, a saved point; the act menu's "Add to accepted
//   list", the signer's "Follow their releases" becoming a saved point;
//   a specification's page; hashes copied; Discuss: a MIP started, written
//   and published for discussion, a reply as a signed document, a bug report
//   with its reporting identity; Choose: by layer, + Accept by hash, Remove,
//   Publish it; the identity panel (+ Add: Bring one, Use one from Kišib;
//   the menu; Relays in its foot);
// - acting as a collective from the identity panel, and its release;
// - Edubba's folder checks, carried over with its releases (H19, H23, H31);
// - Use one from Kišib: Ummia paired with Kišib's runner, a card signed with
//   Kišib's panel inside Ummia's window;
// - the web client, built as released and served with its headers: the
//   banner on every screen, releases said to need a computer, a
//   specification published from the browser, nothing of a chain key kept.
//
// `MOR_SCREENSHOTS=DIR` keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { MIRS } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import type { Done, Review } from '../src/shapes.ts';
import { closeAll, developer, dub, folder, kishib, releaseCollective, start, ummia, type Relay } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
};
const MAC = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  mkdirSync(shots, { recursive: true });
  await page.screenshot({ path: join(shots, `${name}.png`) });
};

let homes: Relay[];
let relay: Relay;
const sites: Server[] = [];
let web: string;
let browser: Browser;
const csp: string[] = [];
const problems: string[] = [];

async function serveBuilt(dist: string, policy: string): Promise<string> {
  const site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    if (req.method === 'POST' && path === '/csp') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        csp.push(body);
        res.end();
      });
      return;
    }
    try {
      if (!/^[a-z0-9_.-]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': `${policy}; report-uri /csp`, 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  sites.push(site);
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${(site.address() as { port: number }).port}`;
}

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  const d = mkdtempSync(join(tmpdir(), 'ummia-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', d], { cwd: here, stdio: 'ignore' });
  web = await serveBuilt(d, policy);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

// Every browser, app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await browser?.close().catch(() => undefined);
    await closeAll();
  } finally {
    for (const s of sites) await new Promise((r) => s.close(r));
    for (const r of [...(homes ?? []), relay]) await r?.stop().catch(() => undefined);
  }
});

async function open(url: string, viewport = MAC): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());
  await page.goto(url);
  return { context, page };
}

/** Wait for an element, or fail at once with what the page said. */
async function sees(page: Page, selector: string, name: string, timeout = 90_000) {
  const err = page.locator('#status .k-note.k-error');
  try {
    await Promise.race([page.locator(selector).first().waitFor({ timeout }), err.waitFor({ timeout }).then(async () => assert.fail(await err.innerText()))]);
  } catch (e) {
    await shot(page, `failed-${name}`);
    console.error(`at ${name}:`, (await page.locator('body').innerText()).slice(-1500));
    throw e;
  }
}

async function done(page: Page, button: ReturnType<Page['locator']>, name: string): Promise<string> {
  await page.evaluate(() => {
    const st = document.getElementById('status');
    if (st) st.innerHTML = '';
  });
  await button.click();
  await sees(page, '#status .k-note.k-done', name);
  const said = await page.locator('#status').innerText();
  // The note is closed by its ×, as a person would, so it covers nothing after.
  await page.locator('#status [data-action="status-close"]').click();
  return said;
}

/** Nothing being done (no button disabled by an act) and the part open read (not "Reading…"). */
const settled = (page: Page) =>
  page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled && !b.closest('.k-panel') && !b.closest('[data-add]') && b.dataset.kAdd === undefined && !b.closest('.k-pop')) && !/^Reading/.test(document.querySelector('#pane')?.textContent?.trim() ?? ''), undefined, { timeout: 90_000 });

async function bring(page: Page, who: { id: string; words: string }, home: string) {
  await sees(page, 'form#bring', 'bring');
  await page.locator('form#bring [name=id]').fill(who.id);
  await page.locator('form#bring [name=words]').fill(who.words);
  await page.locator('form#bring [name=address]').fill(home);
  await page.getByRole('button', { name: 'Bring it' }).click();
  await sees(page, '.k-tile', 'tiles');
}

/** Open a tile by its name from the home, or a tab across the top. */
async function tile(page: Page, name: 'Look' | 'Discuss' | 'Publish' | 'Choose') {
  const t = page.locator(`.k-tile`, { hasText: name });
  if (await t.count()) await t.first().click();
  else await page.locator('.k-top .k-tab', { hasText: name }).click();
  await sees(page, '.k-col', `tile-${name}`);
}

/** A chip of Look's rows (0 point at, 1 filter by, 2 layer) clicked, then the feed read again: its row redrawn with the chip's new state. */
async function chip(page: Page, row: number, label: string) {
  const c = page.locator('.k-point').nth(row).locator('.k-chip', { hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });
  const was = await c.getAttribute('aria-pressed');
  await c.click();
  if (row === 1) await page.waitForFunction(([r, l, w]) => [...document.querySelectorAll('.k-point')][r as number]?.querySelector(`.k-chip[data-k-filter]`) && [...[...document.querySelectorAll('.k-point')][r as number].querySelectorAll('.k-chip')].some((x) => x.textContent === l && x.getAttribute('aria-pressed') !== w) && !!document.querySelector('#look-feed'), [row, label, was], { timeout: 90_000 });
  else await page.waitForFunction(([r, l]) => [...[...document.querySelectorAll('.k-point')][r as number]?.querySelectorAll('.k-chip') ?? []].some((x) => x.textContent === l && x.getAttribute('aria-pressed') === 'true') && !!document.querySelector('#look-feed'), [row, label], { timeout: 90_000 });
  await settled(page);
}

/** Only these filters on. */
async function only(page: Page, labels: string[]) {
  for (const l of ['releases', 'cMIPs', 'Modules', 'xtypes', 'extensions', 'MIPs']) {
    const on = (await page.locator('.k-point').nth(1).locator('.k-chip', { hasText: new RegExp(`^${l}$`) }).getAttribute('aria-pressed')) === 'true';
    if (on !== labels.includes(l)) await chip(page, 1, l);
  }
}

/** A part of the column open. */
async function part(page: Page, label: string) {
  await page.locator('.k-col button', { hasText: label }).first().click();
  await settled(page);
}

test('Ummia by clicks at a Mac’s size: the tiles; Publish with its card; Look pointed and filtered; a specification’s page; Discuss; Choose by layer; the identity panel', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const me = await dub(H, R);
  // Pa: another developer, whose cMIP is in the feed, so their signer's menu can be used.
  const pa = await developer(H, R);
  const paSpec = await pa.ummia.c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Dubsar Slots, draft 1\n\nA vow sold many times: one offer per slot.', types: '0 slot slot = tstr' });
  const paDone = await pa.ummia.c.ask<Done>('confirm', { plan: paSpec.plan, digest: paSpec.digest });
  const paRel = await pa.ummia.c.ask<Review>('release prepare', { folder: folder(), name: 'mor-slots', version: '0.3' });
  const paRel1 = await pa.ummia.c.ask<Done>('release confirm', { plan: paRel.plan, digest: paRel.digest });

  const u = await ummia();
  const { page } = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  // The first screen drawn once the program answered (read before it, the list is empty: the step that flaked).
  await sees(page, '[data-add]', 'first');
  await shot(page, 'mac-01-first');
  assert.deepEqual(await page.locator('[data-add]').allInnerTexts(), ['Bring one', 'Use one from Kišib']);
  await bring(page, me, H[0]);
  // The relays, in the identity panel's foot.
  await page.locator('[data-k-open="identity"]').click();
  await page.locator('[data-action="relays-open"]').click();
  await sees(page, 'form#relays', 'relays');
  await page.locator('form#relays [name=relays]').fill(R.join('\n'));
  await page.locator('form#relays [name=track]').fill(R.join('\n'));
  await done(page, page.locator('form#relays').getByRole('button', { name: 'Save' }), 'relays-saved');

  // The four tiles and their danger marks (decided on the mockups): Look 1, Discuss 1, Publish 2, Choose 2.
  const tiles = await page.locator('.k-tile').evaluateAll((ts) => ts.map((t) => [t.querySelector('h2')!.textContent, t.querySelector('.k-dm')!.className]));
  assert.deepEqual(tiles, [['Look', 'k-dm k-l1'], ['Discuss', 'k-dm k-l1'], ['Publish', 'k-dm k-l2'], ['Choose', 'k-dm k-l2']]);
  await shot(page, 'mac-02-home');

  // Publish › A cMIP or Module: its hash first, then Sign and publish; its card offered right after.
  await tile(page, 'Publish');
  assert.deepEqual((await page.locator('.k-col button').allInnerTexts()).map((x) => x.split('\n')[0]), ['A release', 'A cMIP or Module', 'Anchoring', 'Published here']);
  await part(page, 'A cMIP or Module');
  await page.locator('form#spec [name=text]').fill('# cMIP: Clicked notes, draft 1\n\nNotes, published by clicks.');
  await page.locator('form#spec summary', { hasText: 'Act types it defines' }).click();
  await page.locator('form#spec [name=types]').fill('0 note note = tstr');
  await page.getByRole('button', { name: 'Read it back, with its hash' }).click();
  await sees(page, '#review-hash', 'spec-review');
  const shown = (await page.locator('#review-hash .k-mono').innerText()).trim();
  assert.match(shown, /^mspec1[02-9ac-hj-np-z]{58}$/);
  // Hashes easy to copy (decided): the whole form, copied.
  await page.locator('#review-hash [data-copy]').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), shown);
  await shot(page, 'mac-10-spec-hash-first');
  await page.locator('#spec-review').getByRole('button', { name: 'Sign and publish' }).click();
  await sees(page, '#card-offer form#card', 'card-offered');
  assert.equal(await page.locator('form#card [name=title]').inputValue(), 'Clicked notes, draft 1');
  assert.ok(await page.locator('form#card [name=thread]').isChecked(), 'a discussion thread offered with it');
  await page.locator('form#card [name=summary]').fill('Notes, for a test of cards.');
  await page.locator('form#card [name=vectors]').fill('https://example.invalid/notes-vectors.json');
  await shot(page, 'mac-11-card-offered');
  await page.locator('form#card').getByRole('button', { name: 'Read it back' }).click();
  await sees(page, '#card-review .review', 'card-review');
  assert.match(await page.locator('#card-review').innerText(), /Dubsar Specification Card[\s\S]*Title: Clicked notes, draft 1[\s\S]*Summary: Notes, for a test of cards\./);
  await shot(page, 'mac-12-card-review');
  assert.match(await done(page, page.locator('#card-review').getByRole('button', { name: 'Sign and publish' }), 'card-signed'), /card of “Clicked notes, draft 1” is published/);

  // Publish › A release: the folder chosen with the picker, read back with every file, signed, checked as anyone would.
  await part(page, 'A release');
  const f = folder();
  await page.getByRole('button', { name: 'Choose a folder…' }).click();
  await sees(page, '.ummia-picker', 'picker');
  await page.locator('#picker').evaluate((el, p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.action = 'folders';
    b.dataset.path = p;
    b.id = 'go-there';
    b.textContent = 'there';
    el.appendChild(b);
  }, dirname(f));
  await page.locator('#go-there').click();
  await sees(page, '.ummia-picker button[data-path$="testrelease"]', 'picker-into');
  await page.locator('.ummia-picker button[data-path$="testrelease"]').first().click();
  await page.getByRole('button', { name: 'Use this folder' }).click();
  await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement)?.value === 'testrelease');
  await page.locator('form#release [name=version]').fill('1.0');
  await page.locator('form#release').getByRole('button', { name: 'Read it back' }).click();
  await sees(page, '#release-review .review', 'release-review');
  const files = await page.locator('#release-review .ummia-files').first().innerText();
  assert.match(files, /README\.md/);
  assert.doesNotMatch(files, /\.hidden/);
  await shot(page, 'mac-13-release-review');
  assert.match(await done(page, page.locator('#release-review').getByRole('button', { name: 'Sign and publish' }), 'released'), /testrelease 1\.0 is published/);
  await sees(page, '[data-release] button[data-action="release check"]', 'release-list');
  await page.locator('[data-release] button[data-action="release check"]').first().click();
  await sees(page, '[id^="check-"] li.ok', 'checked');
  assert.match(await page.locator('[id^="check-"]').first().innerText(), /VERIFIED/);
  // A second release of Pa's line, so its card says what changed (accepted).
  writeFileSync(join(f, 'README.md'), '# A test release, changed\n');
  const paRel2 = await pa.ummia.c.ask<Review>('release prepare', { folder: f, name: 'mor-slots', version: '0.4', previous: paRel1.acts[0] });
  const paRel2Done = await pa.ummia.c.ask<Done>('release confirm', { plan: paRel2.plan, digest: paRel2.digest });
  // Published here: the specification with its card, and "A later card".
  await part(page, 'Published here');
  await sees(page, '.k-act button[data-action="card-new"]', 'published-here');
  assert.match(await page.locator('.k-pane').innerText(), /Its card, signed 1 time/);
  await shot(page, 'mac-14-published-here');

  // Look: the feed, pointed at the relay, every kind but MIPs (as drawn).
  await tile(page, 'Look');
  await sees(page, '#look-feed .k-act', 'feed');
  assert.deepEqual(await page.locator('.k-point').nth(0).locator('.k-chip').allInnerTexts(), [R[0].replace(/^https?:\/\//, ''), 'a single ID', 'my contacts', 'a release']);
  assert.deepEqual(await page.locator('.k-point').nth(1).locator('.k-chip').allInnerTexts(), ['releases', 'cMIPs', 'Modules', 'xtypes', 'extensions', 'MIPs']);
  assert.deepEqual(await page.locator('.k-point').nth(1).locator('.k-chip.k-on').allInnerTexts(), ['releases', 'cMIPs', 'Modules', 'xtypes', 'extensions']);
  const feed = await page.locator('#look-feed').innerText();
  assert.match(feed, /Clicked notes, draft 1/);
  assert.match(feed, /Notes, for a test of cards\./, 'the card’s summary on the specification');
  assert.match(feed, /mor-slots 0\.4 · 2 files\nWhat changed since 0\.3: 1 file changed/);
  assert.match(feed, /Dubsar Slots, draft 1/);
  assert.match(await page.locator('.k-say', { hasText: 'Public agreements only, as the relays answer' }).innerText(), /Public agreements only, as the relays answer/);
  await shot(page, 'mac-20-look');

  // Filter by each kind, then by layer.
  for (const [label, kind] of [['releases', 'release'], ['cMIPs', null], ['Modules', null], ['xtypes', 'xtype'], ['extensions', null]] as const) {
    await only(page, [label]);
    const kinds = await page.locator('#look-feed .k-act .k-kind').allInnerTexts();
    if (kind) assert.ok(kinds.length && kinds.every((k) => k.toLowerCase() === kind), `${label}: ${kinds}`);
    else assert.ok(kinds.every((k) => !['release', 'xtype'].includes(k.toLowerCase())), `${label}: ${kinds}`);
  }
  await only(page, ['xtypes']);
  await chip(page, 2, 'Money');
  assert.equal(await page.locator('#look-feed .k-act').count(), 0, 'no xtype of the Money layer');
  await chip(page, 2, 'Development');
  assert.ok(await page.locator('#look-feed .k-act').count(), 'xtypes are the Development layer’s');
  await shot(page, 'mac-21-look-filtered');
  await chip(page, 2, 'any');
  await only(page, ['releases', 'cMIPs', 'Modules', 'xtypes', 'extensions']);

  // The act menu: "Add to accepted list" below the line (decided); the signer's: "Follow their releases".
  const paCard = page.locator('#look-feed .k-act', { hasText: 'Dubsar Slots, draft 1' }).first();
  await paCard.locator('[data-k-menu="act"]').click();
  assert.deepEqual((await page.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Copy act ID', 'Open what it answers', 'Why it’s valid', 'Add to accepted list', 'Rely on it', 'Anchor it']);
  await shot(page, 'mac-22-act-menu');
  await page.locator('.k-pop [data-k-item="accept"]').click();
  await sees(page, '.k-modal form#accept-add', 'accept-from-card');
  await done(page, page.locator('.k-modal form#accept-add').getByRole('button', { name: 'Accept it' }), 'accepted-from-card');
  await paCard.locator('[data-k-menu="signer"]').click();
  assert.deepEqual((await page.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Copy ID', 'Copy ID link', 'Open profile', 'Follow: add to contacts', 'Follow their releases', 'Mute']);
  await shot(page, 'mac-23-signer-menu');
  await page.locator('.k-pop [data-k-item="follow-releases"]').click();
  await page.locator('.k-modal form#follow-releases [name=name]').fill('Pa');
  await done(page, page.locator('.k-modal form#follow-releases').getByRole('button', { name: 'Follow their releases' }), 'followed');
  // A saved point: Pa's releases (decided: "the same follow list, but here it filters").
  await sees(page, '.k-col button[data-k-col^="saved:"]', 'saved-point');
  await part(page, 'Pa’s releases');
  await sees(page, '#look-feed .k-act', 'saved-feed');
  assert.equal(await page.locator('.ummia-pane h2').first().innerText(), 'Pa’s releases');
  assert.ok((await page.locator('#look-feed .k-act .k-kind').allInnerTexts()).every((k) => k.toLowerCase() === 'release'));
  assert.match(await page.locator('#look-feed').innerText(), /mor-slots 0\.4/);
  await shot(page, 'mac-24-saved-point');

  // Point at a single ID, my contacts, a release.
  await part(page, 'The feed');
  await page.locator('.k-point').nth(0).locator('.k-chip', { hasText: 'a single ID' }).click();
  await sees(page, 'form#look input[name=value]', 'id-field');
  await page.locator('form#look [name=value]').fill(pa.id);
  await page.locator('form#look').getByRole('button', { name: 'Look' }).click();
  await settled(page);
  await sees(page, '#look-feed .k-act', 'single-id');
  assert.ok((await page.locator('#look-feed .k-act').count()) >= 2);
  assert.doesNotMatch(await page.locator('#look-feed').innerText(), /Clicked notes/);
  await chip(page, 0, 'my contacts');
  await sees(page, '#look-feed .k-act', 'contacts');
  assert.doesNotMatch(await page.locator('#look-feed').innerText(), /Clicked notes/);
  await page.locator('.k-point').nth(0).locator('.k-chip', { hasText: 'a release' }).click();
  await sees(page, 'form#look input[placeholder^="The release"]', 'release-field');
  await page.locator('form#look [name=value]').fill(paRel2Done.acts[0]);
  await page.locator('form#look').getByRole('button', { name: 'Look' }).click();
  await settled(page);
  await sees(page, '#look-feed .k-act', 'release-line');
  assert.deepEqual((await page.locator('#look-feed .k-act .k-txt').allInnerTexts()).map((x) => x.replace(/^release/i, '').split(' ·')[0].trim()).sort(), ['mor-slots 0.3', 'mor-slots 0.4']);
  await done(page, page.getByRole('button', { name: 'Save this point' }), 'saved-line');
  assert.equal(await page.locator('.k-col [data-k-col^="saved:"]').count(), 2);
  assert.match(await page.locator('.k-col [data-k-col^="saved:"]').nth(1).innerText(), /^Release line mact1/);
  await shot(page, 'mac-25-release-line');

  // A specification's page: its card, its thread, its creator.
  await page.locator('.k-point').nth(0).locator('.k-chip', { hasText: 'a single ID' }).click();
  await sees(page, 'form#look input[placeholder^="Their ID"]', 'id-field-2');
  await page.locator('form#look [name=value]').fill(me.id);
  await page.locator('form#look').getByRole('button', { name: 'Look' }).click();
  await settled(page);
  await sees(page, '#look-feed .k-act button[data-spec]', 'own-spec');
  await page.locator('#look-feed .k-act button[data-spec]').first().click();
  await sees(page, '#spec-title', 'spec-page');
  const sp = await page.locator('#pane').innerText();
  assert.match(sp, /Its creator’s card/);
  assert.match(sp, /Notes, for a test of cards\./);
  assert.match(sp, /https:\/\/example\.invalid\/notes-vectors\.json/);
  assert.match(sp, /Discussion of Clicked notes, draft 1/);
  await shot(page, 'mac-26-spec-page');
  // A core text: its built-in card.
  await part(page, 'A specification’s page');
  await page.locator('form#page [name=hash]').fill(MIRS.money);
  await page.locator('form#page').getByRole('button', { name: 'Open its page' }).click();
  await sees(page, '#spec-title', 'mir-page');
  assert.equal(await page.locator('#spec-title').innerText(), 'MIR: Money');
  assert.match(await page.locator('[data-builtin]').innerText(), /Ummia’s own words, built in/);
  await shot(page, 'mac-27-mir-page');
  // One specification's acts.
  await part(page, 'One specification’s acts');
  await page.locator('form#acts [name=spec]').fill(paDone.hash!);
  await page.locator('form#acts').getByRole('button', { name: 'Look' }).click();
  await settled(page);

  // Discuss: a MIP started, written, published for discussion; the thread answered as a signed document; a bug report.
  await tile(page, 'Discuss');
  assert.deepEqual((await page.locator('.k-col button').allInnerTexts()).map((x) => x.split('\n')[0]), ['MIP drafts', 'Discussions', 'Bug reports', '+ Start a MIP']);
  await part(page, '+ Start a MIP');
  await page.locator('form#mip-new [name=title]').fill('Text, with footnotes');
  await page.locator('form#mip-new [name=forks]').selectOption('text');
  await page.getByRole('button', { name: 'Start it in the MIP shape' }).click();
  await sees(page, 'form.mip-text textarea', 'mip-text');
  assert.match(await page.locator('form.mip-text textarea').inputValue(), /^# MIP: Text, with footnotes/);
  await shot(page, 'mac-30-mip');
  assert.match(await done(page, page.getByRole('button', { name: 'Publish this draft for discussion' }), 'mip-draft'), /published for discussion/);
  await part(page, 'Discussions');
  await sees(page, '[data-thread]', 'threads');
  assert.match(await page.locator('#pane').innerText(), /Discussion of Clicked notes, draft 1/);
  await page.locator('[data-thread]', { hasText: 'Discussion of Clicked notes' }).getByRole('button', { name: 'Reply, as a signed document' }).click();
  await page.locator('.k-modal form#reply [name=text]').fill('A first reply, as a document.');
  await done(page, page.locator('.k-modal form#reply').getByRole('button', { name: 'Sign and send' }), 'replied');
  await sees(page, '[data-thread] .k-act', 'reply-shown');
  assert.match(await page.locator('[data-thread]', { hasText: 'Discussion of Clicked notes' }).innerText(), /A first reply, as a document\./);
  await shot(page, 'mac-31-discussions');
  // Bug reports: the reporting identity, settled here.
  const reporting = TestIdentity.create({ homes: [homes[0].home] });
  await reporting.publishGenesis();
  await reporting.publishRoutes([{ kind: 0, scope: null, hints: R }, { kind: 1, scope: null, hints: R }]);
  await part(page, 'Bug reports');
  await page.locator('form#reporting [name=reports]').fill(reporting.id);
  await done(page, page.locator('form#reporting').getByRole('button', { name: 'Save' }), 'reporting-saved');
  await sees(page, 'form#report', 'report');
  await page.locator('form#report [name=text]').fill('Ummia: a test report\n\nIt works by clicks.');
  assert.match(await done(page, page.getByRole('button', { name: 'Sign and send it' }), 'report-sent'), /Left in the reporting identity’s inbox/);
  await shot(page, 'mac-32-reports');

  // Choose: the accepted list by layer; + Accept by hash; Remove; Publish it.
  await tile(page, 'Choose');
  assert.deepEqual((await page.locator('.k-col button').allInnerTexts()).map((x) => x.split('\n')[0]), ['Every layer', 'Identity', 'Text', 'Envelopes', 'Money', 'Agreements', 'Development', '+ Accept by hash', 'Ummia’s own rules']); // H93: Ummia’s own rules, its part of Choose
  await sees(page, '#accepted li', 'accepted');
  assert.match(await page.locator('#accepted').innerText(), /Dubsar Slots, draft 1/);
  await part(page, 'Development');
  await sees(page, '#accepted li', 'accepted-development');
  assert.match(await page.locator('#accepted').innerText(), /Development/);
  await part(page, 'Money');
  assert.equal(await page.locator('#accepted li').count(), 0);
  await shot(page, 'mac-40-choose-money');
  await part(page, '+ Accept by hash');
  await page.locator('form#accept-add [name=hash]').fill(MIRS.money);
  await page.locator('form#accept-add [name=label]').fill('Money MIR');
  await done(page, page.locator('form#accept-add').getByRole('button', { name: 'Accept it' }), 'accepted-by-hash');
  await sees(page, `#accepted li[data-hash="${MIRS.money}"]`, 'accepted-shown');
  await part(page, 'Money');
  await sees(page, `#accepted li[data-hash="${MIRS.money}"]`, 'money-layer');
  await shot(page, 'mac-41-choose');
  await done(page, page.locator(`#accepted li[data-hash="${MIRS.money}"] [data-action="accepted remove"]`), 'removed');
  assert.match(await done(page, page.getByRole('button', { name: 'Publish it' }), 'published-list'), /anyone can read which specifications you accept/);

  // The identity panel: + Add (Bring one, Use one from Kišib), each identity's menu, Remove said plainly first.
  await page.locator('[data-k-open="identity"]').click();
  await page.locator('.k-panel [data-k-add="toggle"]').click();
  assert.deepEqual(await page.locator('.k-panel [data-k-add]:not([data-k-add="toggle"]) .k-n').allInnerTexts(), ['Bring one', 'Use one from Kišib']);
  await shot(page, 'mac-50-identity-panel');
  await page.locator('.k-panel [data-k-idmenu]').first().click();
  assert.deepEqual((await page.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Words', 'Line and homes', 'New words from Kišib', 'A collective under it', 'Remove from Ummia…']);
  await page.locator('.k-pop [data-k-item="line"]').click();
  await sees(page, '.k-modal .k-facts', 'line');
  assert.match(await page.locator('.k-modal').innerText(), /Ummia’s line/);
  await page.locator('.k-modal [data-k-popup="close"]').click();
  assert.deepEqual(problems, []);
});

test('every function of Ummia before the redesign, found in its new place (the mockups report’s table)', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const d = await developer(H, R);
  const rv = await d.ummia.c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Found again, draft 1\n\nFor the table.' });
  await d.ummia.c.ask('confirm', { plan: rv.plan, digest: rv.digest });
  const { page } = await open(`${d.ummia.app.base}/#pair=${d.ummia.app.access.newCode()}`);
  await sees(page, '.k-tile', 'table-tiles');
  const found: string[] = [];
  const row = async (fn: string, where: () => Promise<void>, selector: string) => {
    await where();
    await sees(page, selector, `table-${fn}`);
    found.push(fn);
  };
  const col = async (t: 'Look' | 'Discuss' | 'Publish' | 'Choose', label: string) => {
    await page.locator('.k-top [data-action="home-tiles"]').click();
    await tile(page, t);
    await part(page, label);
  };
  const closeAll = async () => {
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
  };
  // Who acts: the identity panel (collectives under each identity), and chips in Publish.
  await row('Who acts (self or a collective)', async () => page.locator('[data-k-open="identity"]').click(), '.k-panel [data-k-use]');
  await closeAll();
  await row('A release from a folder; checked; the previous one', () => col('Publish', 'A release'), 'form#release select[name=previous]');
  await row('Does it count for the collective', async () => undefined, 'form#release');
  await row('Anchoring: offer, tier, prepared for Damgar', () => col('Publish', 'Anchoring'), '.ummia-pane h2:text("Anchoring")');
  await row('cMIP or Module, hash first', () => col('Publish', 'A cMIP or Module'), 'form#spec');
  await row('Tracking relays: cMIPs, Modules, extensions, xtypes, MIPs', () => col('Look', 'The feed'), '.k-point [data-k-filter="mips"]');
  await row('The acts of one specification', () => col('Look', 'One specification’s acts'), 'form#acts');
  await row('Following a dev’s releases; a release line', async () => {
    await col('Look', 'The feed');
    await sees(page, '#look-feed .k-act', 'table-feed');
    await page.locator('#look-feed .k-act [data-k-menu="act"]').first().click();
  }, '.k-pop [data-k-item="accept"]');
  await closeAll();
  await row('What changed between versions', async () => undefined, '.k-point [data-k-point="release"]');
  await row('MIPs: start, write, discuss, publish', () => col('Discuss', '+ Start a MIP'), 'form#mip-new');
  await row('Bug reports and answers', () => col('Discuss', 'Bug reports'), 'form#reporting');
  await row('Accepted list: add, remove, publish, by layer', () => col('Choose', 'Every layer'), '[data-action="accepted publish"]');
  await row('Settings: relays, tracking relays', async () => {
    await page.locator('[data-k-open="identity"]').click();
    await page.locator('[data-action="relays-open"]').click();
  }, 'form#relays [name=track]');
  await closeAll();
  await row('Settings: reporting ID', () => col('Discuss', 'Bug reports'), 'form#reporting [name=reports]');
  await row('Anchor it, in the act menu', async () => {
    await col('Look', 'The feed');
    await sees(page, '#look-feed .k-act', 'table-feed-2');
    await page.locator('#look-feed .k-act [data-k-menu="act"]').first().click();
    await page.locator('.k-pop [data-k-item="anchor"]').click();
  }, '.k-modal form.anchor');
  await closeAll();
  await row('Rely on it, in the act menu', async () => {
    await page.locator('#look-feed .k-act [data-k-menu="act"]').first().click();
    await page.locator('.k-pop [data-k-item="rely"]').click();
  }, '.k-modal form#rely');
  await closeAll();
  await row('The identity: words, line and homes, new words, forget', async () => {
    await page.locator('[data-k-open="identity"]').click();
    await page.locator('.k-panel [data-k-idmenu]').first().click();
  }, '.k-pop [data-k-item="remove"]');
  await closeAll();
  assert.equal(found.length, 17);
  assert.deepEqual(problems, []);
});

test('at a phone’s size: the tiles stack, a tile opens on its first part, ← Back shows its column', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const d = await developer(H, R);
  const { page } = await open(`${d.ummia.app.base}/#pair=${d.ummia.app.access.newCode()}`, PHONE);
  await sees(page, '.k-tile', 'phone-tiles');
  const boxes = await page.locator('.k-tile').evaluateAll((ts) => ts.map((t) => t.getBoundingClientRect().left));
  assert.ok(boxes.every((x) => x === boxes[0]), 'stacked');
  await shot(page, 'phone-01-home');
  for (const name of ['Look', 'Discuss', 'Publish', 'Choose'] as const) {
    await page.locator('.k-top [data-action="home-tiles"]').click();
    await page.locator('.k-tile', { hasText: name }).click();
    await sees(page, '.k-opened', `phone-${name}`);
    await settled(page);
    await page.locator('.k-pane .k-back').click();
    assert.ok(await page.locator('.k-col').isVisible(), `${name}: its column`);
    await shot(page, `phone-${name.toLowerCase()}-column`);
    await page.locator('.k-col button').first().click();
    await settled(page);
    assert.ok(!(await page.locator('.k-col').isVisible()), `${name}: the column folds away`);
    await shot(page, `phone-${name.toLowerCase()}`);
  }
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(width <= PHONE.width, `no sideways scroll (${width})`);
  assert.deepEqual(problems, []);
});

test('acting as a collective from the identity panel: the collective under its member, its release signed with the member’s own key', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const { A, col } = await releaseCollective(H, R);
  const u = await ummia();
  await u.c.ask('bring', { id: A.id, words: A.words, address: H[0] });
  await u.c.ask('settings', { relays: R, track: R });
  const { page } = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  await sees(page, '.k-tile', 'collective-tiles');
  await page.locator('[data-k-open="identity"]').click();
  await page.locator('.k-panel [data-k-idmenu]').first().click();
  await page.locator('.k-pop [data-k-item="collective"]').click();
  await page.locator('.k-modal form#collective-add [name=collective]').fill(col);
  await page.locator('.k-modal form#collective-add').getByRole('button', { name: 'Act for it' }).click();
  await sees(page, '.k-modal .k-note.k-done', 'collective-added');
  await page.locator('.k-modal [data-k-popup="close"]').click();
  await page.locator('[data-k-open="identity"]').click();
  await sees(page, `.k-panel [data-k-use="${col}"][data-k-under]`, 'collective-under');
  await shot(page, 'mac-51-collective-under');
  await page.locator(`.k-panel [data-k-use="${col}"]`).click();
  await settled(page);
  assert.match(await page.locator('.k-me').innerText(), /Collective/);
  await page.locator('.k-tile', { hasText: 'Publish' }).click();
  await sees(page, '.ummia-who', 'who-acts');
  // H96, H121: the collective by the name it published; it published none, so "Collective" (its short ID a tap away in the identity panel, never bare on a chip).
  assert.equal(await page.locator('.ummia-who .k-chip.k-on').innerText(), 'Collective');
  await page.locator('form#release [name=folder]').fill(folder());
  await page.locator('form#release [name=folder]').dispatchEvent('change');
  await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement)?.value === 'testrelease');
  await page.locator('form#release [name=version]').fill('1');
  await page.locator('form#release').getByRole('button', { name: 'Read it back' }).click();
  await sees(page, '#release-review .review', 'collective-review');
  assert.match(await page.locator('#release-review h3').first().innerText(), /for the collective/);
  await shot(page, 'mac-52-collective-release');
  assert.match(await done(page, page.locator('#release-review').getByRole('button', { name: 'Sign and publish' }), 'collective-released'), /published for the collective/);
  // Back to oneself: the same gesture.
  await page.locator('[data-k-open="identity"]').click();
  await page.locator(`.k-panel [data-k-use="${A.id}"]`).click();
  await settled(page);
  assert.doesNotMatch(await page.locator('.k-me').innerText(), /Collective/);
  assert.deepEqual(problems, []);
});

test('H19, H23, H31, carried over from Edubba: a near match named, a Terminal path read, the picker browsing the computer’s folders', async () => {
  const H = homes.map((h) => h.base);
  const me = await dub(H, [relay.base]);
  const u = await ummia();
  const { page } = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  await bring(page, me, H[0]);
  await tile(page, 'Publish');
  await sees(page, 'form#release', 'release-form');
  const was = process.env.HOME;
  const home = mkdtempSync(join(tmpdir(), 'ummia-home-'));
  mkdirSync(join(home, 'Projects', 'testrelease '), { recursive: true });
  mkdirSync(join(home, 'Projects', '.hidden'), { recursive: true });
  writeFileSync(join(home, 'Projects', 'testrelease ', 'notes.txt'), 'clay\n');
  process.env.HOME = home;
  try {
    const field = page.locator('form#release [name=folder]');
    // Typed without the space at its end, as Finder shows it: no such folder, and the near match named.
    await field.fill('~/Projects/testrelease');
    await field.dispatchEvent('change');
    await page.locator('#status .k-note.k-error').waitFor({ timeout: 30_000 });
    assert.match(await page.locator('#status').innerText(), /There is no folder at .*testrelease\. Did you mean “testrelease ” \(with a space at the end\)\?/);
    await shot(page, 'mac-60-near-match');
    // Pasted from the Terminal: "\ " is a space.
    await field.fill('~/Projects/testrelease\\ ');
    await field.dispatchEvent('change');
    await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement).value === 'testrelease ');
    // Quoted, as Finder's “Copy as Pathname” pasted into the Terminal may be.
    await field.fill(`'${join(home, 'Projects', 'testrelease ')}'`);
    await field.dispatchEvent('change');
    await page.locator('#folder-said', { hasText: 'a plain folder' }).waitFor({ timeout: 30_000 });
    // The picker: the computer's folders, browsed by the program; the space at the end said; hidden folders counted, not listed.
    await page.locator('form#release [name=name]').fill('');
    await page.getByRole('button', { name: 'Choose a folder…' }).click();
    await page.locator('.ummia-picker', { hasText: home }).waitFor({ timeout: 30_000 });
    await page.locator('.ummia-picker button', { hasText: 'Projects' }).click();
    await page.locator('.ummia-picker button', { hasText: 'with a space at the end' }).waitFor({ timeout: 30_000 });
    assert.match(await page.locator('.ummia-picker').innerText(), /1 hidden folder/);
    await shot(page, 'mac-61-picker');
    await page.locator('.ummia-picker button', { hasText: 'with a space at the end' }).click();
    await page.getByRole('button', { name: 'Use this folder' }).click();
    await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement).value === 'testrelease ');
    assert.equal(await field.inputValue(), join(home, 'Projects', 'testrelease '));
  } finally {
    process.env.HOME = was;
  }
});

test('Use one from Kišib: Ummia paired with Kišib’s runner; a card signed with Kišib’s panel inside Ummia’s window', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const max = await dub(H, R);
  const k = await kishib();
  await k.c.ask('runner on', { read: true, passphrase: 'test passphrase, not a real one', again: 'test passphrase, not a real one' });
  await k.c.ask('runner give', { id: max.id, address: H[0], words: max.words });
  const u = await ummia(null, { kishib: k.dir });
  const { page } = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  await sees(page, '[data-add="kishib"]', 'first');
  await page.locator('[data-add="kishib"]').click();
  await page.locator('[data-action="runner-pair"]').click();
  await sees(page, '[data-action="runner-look"]', 'code');
  const code = (await page.locator('.k-mono').first().innerText()).trim();
  await shot(page, 'mac-70-kishib-code');
  const st = await k.c.ask<{ apps: { id: string; code: string; name: string }[] }>('runner state');
  const app = st.apps.find((x) => x.name === 'Ummia')!;
  assert.equal(app.code, code, 'the same code in both');
  await k.c.ask('runner approve', { pairing: app.id, identities: [max.id], opens: [] });
  await page.locator('[data-action="runner-look"]').click();
  await page.locator(`[data-runner-take="${max.id}"]`).click();
  await sees(page, '.k-tile', 'tiles through Kišib');
  assert.match(await page.locator('.k-me').innerText(), /via Kišib/);
  // A card for a core text, signed through Kišib: its panel drawn inside Ummia's window.
  await page.locator('.k-tile', { hasText: 'Look' }).click();
  await part(page, 'A specification’s page');
  await page.locator('form#page [name=hash]').fill(MIRS.text);
  await page.locator('form#page').getByRole('button', { name: 'Open its page' }).click();
  await sees(page, '#spec-title', 'text-page');
  await page.getByRole('button', { name: 'Write a card of your own' }).click();
  await page.locator('.k-modal form#card [name=thread]').uncheck();
  await page.locator('.k-modal form#card').getByRole('button', { name: 'Read it back' }).click();
  await sees(page, '.k-modal #card-review .review', 'card-review-runner');
  await page.locator('.k-modal #card-review').getByRole('button', { name: 'Sign and publish' }).click();
  await page.waitForSelector('.k-frame.k-kishib iframe', { timeout: 60_000 });
  assert.match((await page.textContent('.k-frame .k-by')) ?? '', /Drawn by Kišib · Ummia cannot read or change this frame/);
  const fl = page.frameLocator('.k-frame.k-kishib iframe');
  await fl.locator('text=Ummia asks Kišib to sign').waitFor({ timeout: 60_000 });
  await shot(page, 'mac-71-kishib-panel');
  await fl.getByRole('button', { name: /^Sign/ }).first().click();
  await sees(page, '#status .k-note.k-done', 'signed-through-kishib');
  assert.match(await page.locator('#status').innerText(), /card of .* is published/);
});

test('Ummia’s web client: the banner on every screen, releases said to need a computer, a specification published, nothing of a chain key kept', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const me = await dub(H, R);
  const { page } = await open(`${web}/`);
  const banner = async (where: string) => {
    const t = await page.locator('#for-testing-only').innerText();
    assert.match(t, /^For testing only\./, where);
  };
  await sees(page, 'form#bring', 'web-bring');
  await banner('the first screen');
  assert.ok(await page.locator('[data-add="kishib"]').isDisabled(), 'never in the web client');
  await page.locator('#for-testing-only summary').click();
  assert.match(await page.locator('#for-testing-only').innerText(), /could copy its signing key/);
  await shot(page, 'web-01-first');
  await bring(page, me, H[0]);
  await banner('home');
  await shot(page, 'web-02-home');
  await tile(page, 'Publish');
  await settled(page);
  assert.match(await page.locator('#pane').innerText(), /Releases are made from a folder on a computer/);
  await part(page, 'A cMIP or Module');
  await page.locator('form#spec [name=text]').fill('# cMIP: From the web client, draft 1\n\nFor testing only.');
  await page.getByRole('button', { name: 'Read it back, with its hash' }).click();
  await sees(page, '#review-hash', 'web-spec-review');
  await page.locator('#spec-review').getByRole('button', { name: 'Sign and publish' }).click();
  await sees(page, '#card-offer', 'web-card-offer');
  await shot(page, 'web-10-card-offered');
  for (const t of ['Look', 'Discuss', 'Choose'] as const) {
    await page.locator('.k-top .k-tab', { hasText: t }).click();
    await settled(page);
    await banner(t);
  }
  await shot(page, 'web-20-choose');
  // Nothing of the chain key in the browser's storage: only the signing key, as the banner says.
  const kept = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const r = indexedDB.open('ummia');
        r.onsuccess = () => {
          const t = r.result.transaction('keep').objectStore('keep').getAll();
          t.onsuccess = () => resolve(JSON.stringify(t.result));
        };
      }),
  );
  assert.ok(kept.includes(me.id));
  assert.ok(!kept.includes(me.chainWords.join(' ')));
  assert.deepEqual(csp, [], 'nothing the content security policy refused');
  assert.deepEqual(problems, []);
});
