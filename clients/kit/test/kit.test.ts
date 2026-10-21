// The kit in a real browser (headless Chromium, the one installed with
// Playwright), by clicks alone, at a Mac's size and a phone's: both menus of
// a card and their identical top halves; the pop-up thread and its back
// arrow; the identity panel (switching, acting as a collective under an
// identity, Remove said first); @ by names with two names colliding; the
// column folding away on a phone; the slot's frame rules; a disclaimer in
// one line; no finding number anywhere; no console error; nothing the
// content security policy refused. `MOR_SCREENSHOTS=DIR` keeps a picture of
// each screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright-core';
import { KIT_STYLE } from '../src/style.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const shots = process.env.MOR_SCREENSHOTS;

let page1: Server;
let page2: Server;
let base = '';
let other = '';
let browser: Browser;

const listen = (s: Server) => new Promise<string>((r) => s.listen(0, '127.0.0.1', () => r(`http://127.0.0.1:${(s.address() as { port: number }).port}`)));

before(async () => {
  const js = (await build({ entryPoints: [here('test/demo.ts')], bundle: true, format: 'esm', write: false, target: 'es2022' })).outputFiles[0].text;
  const fonts = (f: string) => readFileSync(here(`../dub/static/fonts/${f}`));
  // The other app's origin, for the slot: its own page, posting one message to whoever framed it.
  page2 = createServer((req, res) => {
    if (req.url === '/frame') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end('<!doctype html><body style="color:#fff">Kišib’s panel<script>parent.postMessage({ from: "kishib", said: "hello" }, "*")</script></body>');
    } else res.writeHead(404).end();
  });
  other = await listen(page2);
  page1 = createServer((req, res) => {
    const csp = `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; frame-src ${other}; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
    const send = (type: string, body: string | Buffer) => res.writeHead(200, { 'content-type': type, 'content-security-policy': csp }).end(body);
    if (req.url === '/') return send('text/html; charset=utf-8', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kit</title><link rel="icon" href="data:,"><link rel="stylesheet" href="kit.css"></head><body><main id="app"></main><script type="module" src="demo.js"></script></body></html>`);
    if (req.url === '/demo.js') return send('text/javascript', `window.slotOrigin=${JSON.stringify(other)};\n${js}`);
    if (req.url === '/kit.css') return send('text/css', KIT_STYLE);
    if (req.url === '/icon.png') return send('image/png', readFileSync(here('../dub/static/icon/dub.png')));
    if (req.url?.endsWith('.woff2')) return send('font/woff2', fonts(req.url.slice(1)));
    res.writeHead(404).end();
  });
  base = await listen(page1);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  page1?.close();
  page2?.close();
});

const SIZES = [
  { name: 'mac', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 844 },
] as const;

async function open(size: (typeof SIZES)[number]) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(base);
  await page.evaluate(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP refused ${e.blockedURI} (${e.violatedDirective})`)));
  await page.locator('.k-act').first().waitFor();
  return { page, problems, close: () => context.close() };
}

const shot = async (page: Page, size: string, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `kit-${name}-${size}.png`) });
};
const items = (page: Page) => page.locator('.k-pop button').allInnerTexts();
/** The top half of the open menu: the items above its first line. */
const topHalf = (page: Page) => page.locator('.k-pop').evaluate((p) => {
  const out: string[] = [];
  for (const c of p.children) {
    if (c.tagName === 'HR') break;
    if (c.tagName === 'BUTTON') out.push((c as HTMLElement).innerText.split('\n')[0]);
  }
  return out;
});
const noFindingNumber = async (page: Page) => assert.doesNotMatch(await page.locator('body').innerText(), /\b[FH]\d{1,3}\b/, 'no finding number on screen (H76)');

for (const size of SIZES) {
  test(`the act card's two menus, at ${size.name} size`, async () => {
    const { page, problems, close } = await open(size);
    await shot(page, size.name, 'feed');
    // No hovering: a pointer over the signer opens nothing.
    await page.locator('.k-act .k-signer').first().hover();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.k-pop').count(), 0, 'nothing opens on hover');

    // The signer's menu: what you take above the line, what changes something below.
    await page.locator('.k-act').nth(0).locator('.k-signer').click();
    assert.deepEqual(await topHalf(page), ['Copy ID', 'Copy ID link', 'Open profile']);
    assert.deepEqual(await items(page), ['Copy ID', 'Copy ID link', 'Open profile', 'Following: remove from contacts', 'Message', 'Mute']);
    await shot(page, size.name, 'signer-menu');
    await page.getByRole('menuitem', { name: 'Copy ID', exact: true }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'mid1bbx7q9bm4k', 'the whole ID written for people is copied');
    await page.locator('.k-pop').waitFor({ state: 'detached' });

    // Another signer's menu: the same top half.
    await page.locator('.k-act').nth(2).locator('.k-signer').click();
    assert.deepEqual(await topHalf(page), ['Copy ID', 'Copy ID link', 'Open profile']);
    await page.getByRole('menuitem', { name: 'Copy ID link' }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'mid1ddx7q9dm4k?r=https://home.test');
    await page.locator('.k-pop').waitFor({ state: 'detached' });

    // The act's menu, on someone else's act: no Correct it.
    await page.locator('.k-act').nth(0).locator('.k-actid').click();
    assert.deepEqual(await topHalf(page), ['Copy act ID', 'Open what it answers', 'Why it’s valid']);
    assert.deepEqual((await items(page)).map((x) => x.split('\n')[0]), ['Copy act ID', 'Open what it answers', 'Why it’s valid', 'Reply', 'Rely on it', 'Anchor it', 'Tip']);
    assert.ok(await page.getByRole('menuitem', { name: /Open what it answers/ }).isDisabled(), 'nothing to open: it answers nothing');
    await shot(page, size.name, 'act-menu');
    // A click elsewhere closes it.
    await page.locator('.k-top').click({ position: { x: 5, y: 5 } });
    await page.locator('.k-pop').waitFor({ state: 'detached' });

    // One's own act: Correct it, and the identical top half; Escape closes.
    await page.locator('.k-act').nth(1).locator('.k-actid').click();
    assert.deepEqual(await topHalf(page), ['Copy act ID', 'Open what it answers', 'Why it’s valid']);
    assert.ok((await items(page)).includes('Correct it'));
    await page.getByRole('menuitem', { name: 'Copy act ID' }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'mact1c5hqqqqq0lp');
    await page.locator('.k-act').nth(1).locator('.k-actid').click();
    await page.keyboard.press('Escape');
    await page.locator('.k-pop').waitFor({ state: 'detached' });

    // A collective appended and checked, a grant, an alarm in red, one ✓ per verified card.
    assert.match(await page.locator('.k-act').nth(2).innerText(), /of Collective Y/);
    assert.match(await page.locator('.k-act').nth(3).innerText(), /signed under a grant/);
    assert.equal(await page.locator('.k-act').nth(4).locator('.k-alarmline').innerText(), 'contested: its signer’s homes disagree');
    assert.equal(await page.locator('.k-act').nth(4).locator('.k-v').count(), 0, 'no ✓ on an act with an alarm');
    assert.equal(await page.locator('.k-act').nth(0).locator('.k-v').count(), 1);
    assert.equal(await page.locator('.k-act .k-alarmline').evaluate((x) => getComputedStyle(x).color), 'rgb(196, 100, 95)', 'red only for the alarm');
    // The clock the feed is ordered by, said under it.
    assert.match(await page.locator('.k-clock').innerText(), /Ordered by the test clock’s clock/);
    // The feed box scrolls inside, never the page.
    assert.equal(await page.evaluate(() => document.scrollingElement!.scrollHeight <= window.innerHeight), true, 'the page itself does not scroll');
    assert.equal(await page.locator('.k-feed').evaluate((f) => getComputedStyle(f).overflowY), 'auto');
    // Inter, in its light weight, from the page's own origin.
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.fonts.check('300 15px Inter')), true);
    await noFindingNumber(page);
    assert.deepEqual(problems, []);
    await close();
  });

  test(`the pop-up thread and its back arrow, at ${size.name} size`, async () => {
    const { page, problems, close } = await open(size);
    await page.locator('.k-act').nth(1).locator('.k-actid').click();
    await page.getByRole('menuitem', { name: 'Open what it answers' }).click();
    const modal = page.locator('.k-modal');
    await modal.waitFor();
    assert.match(await modal.locator('h3').innerText(), /What Max’s reply answers/);
    assert.equal(await modal.locator('.k-act').count(), 2, 'a small feed box: what it answers, and the reply');
    assert.equal(await modal.locator('[data-k-popup="back"]').count(), 0, 'no back arrow on the first step');
    await shot(page, size.name, 'thread');
    // Opening something inside replaces the content, with a back arrow; the cards inside have the same menus.
    await modal.locator('.k-act').first().locator('.k-actid').click();
    assert.deepEqual(await topHalf(page), ['Copy act ID', 'Open what it answers', 'Why it’s valid']);
    await page.getByRole('menuitem', { name: 'Why it’s valid' }).click();
    await modal.locator('#why').waitFor();
    await modal.locator('[data-k-popup="back"]').click();
    assert.equal(await modal.locator('.k-act').count(), 2, 'Back returns to the thread');
    // Closing returns to where you were.
    await modal.locator('[data-k-popup="close"]').click();
    assert.equal(await page.locator('.k-modal').count(), 0);
    assert.equal(await page.locator('#feed .k-act').count(), 5);
    await noFindingNumber(page);
    assert.deepEqual(problems, []);
    await close();
  });

  test(`the identity panel, at ${size.name} size: switching, a collective under its identity, Remove said first`, async () => {
    const { page, problems, close } = await open(size);
    await page.locator('[data-k-open="identity"]').click();
    const panel = page.locator('[data-k-panel="identity"]');
    await panel.waitFor();
    const rows = await panel.locator('[data-k-use]').allInnerTexts();
    assert.equal(rows.length, 3);
    assert.match(rows[0], /^M\s*Max/);
    assert.match(rows[1], /Collective Y\s*collective/);
    assert.ok(await panel.locator('[data-k-use].k-sub').count(), 'the collective sits under its identity');
    assert.equal(await panel.locator('[data-k-use][aria-current]').innerText().then((t) => /Max/.test(t)), true, 'the one in use marked');
    await shot(page, size.name, 'identity-panel');
    // Acting as the collective: the same gesture as switching.
    await panel.locator('[data-k-use].k-sub').click();
    assert.equal(await page.locator('.k-panel').count(), 0);
    if (size.name === 'mac') assert.match(await page.locator('.k-me').innerText(), /Collective Y/);
    assert.ok((await page.evaluate(() => window.chosen)).some((c) => c.startsWith('use:e')));
    // + Add: make, bring, and an empty place for Kišib's.
    await page.locator('[data-k-open="identity"]').click();
    await page.locator('[data-k-add="toggle"]').click();
    assert.ok(await page.locator('[data-k-add="kishib"]').isDisabled(), 'use one from Kišib: an empty place for round 2');
    // Each identity's menu; Remove said plainly before anything is removed.
    await page.locator('[data-k-idmenu]').first().click();
    assert.deepEqual(await items(page), ['Name', 'Relays', 'Words', 'Line and homes', 'Remove from Demo…']);
    await page.getByRole('menuitem', { name: 'Remove from Demo…' }).click();
    const said = page.locator('[data-k-remove]');
    await said.waitFor();
    assert.match(await said.innerText(), /Remove Max from Demo\?[\s\S]*forgets Max’s signing words[\s\S]*Max itself is not touched/);
    assert.ok(!(await page.evaluate(() => window.chosen)).includes('removed'), 'nothing removed before it is said and confirmed');
    await shot(page, size.name, 'identity-remove');
    await page.locator('[data-k-remove-yes]').click();
    assert.ok((await page.evaluate(() => window.chosen)).includes('removed'));
    await noFindingNumber(page);
    assert.deepEqual(problems, []);
    await close();
  });

  test(`@ and To… by names, two names colliding, at ${size.name} size`, async () => {
    const { page, problems, close } = await open(size);
    const ta = page.locator('#post textarea');
    await ta.click();
    await ta.pressSequentially('Thursday then. @P');
    const pop = page.locator('[data-k-suggest]');
    await pop.waitFor();
    const offered = await pop.locator('[data-k-pick]').allInnerTexts();
    assert.equal(offered.length, 3);
    assert.ok(offered.every((x) => !/^[0-9a-f]{16,}/.test(x)), 'names, never hashes');
    // The two called Pa carry a faint short ID; Ph, alone with its name, carries none.
    assert.equal(await pop.locator('[data-k-pick] .k-k').count(), 2);
    assert.match(offered[0], /Pa\s*mid1bbx…m4k/);
    assert.match(offered[2], /^P?\s*Ph$/);
    await shot(page, size.name, 'mention');
    await pop.locator('[data-k-pick]').nth(1).click();
    assert.equal(await ta.inputValue(), 'Thursday then. @Pa ');
    assert.ok((await page.evaluate(() => window.chosen)).includes(`mention:${'c'.repeat(64)}`), 'the second Pa, by its ID');
    // To…: the whole field, the ID kept beside the name shown.
    const to = page.locator('#to');
    await to.fill('');
    await to.pressSequentially('ph');
    await page.locator('[data-k-suggest]').waitFor();
    await page.keyboard.press('Enter');
    assert.equal(await to.inputValue(), 'Ph');
    assert.equal(await to.getAttribute('data-k-id'), 'd'.repeat(64));
    assert.equal(await to.getAttribute('autocomplete'), 'off', 'the app’s own list, not the browser’s autofill');
    // Contacts: one list, names first, found by name.
    await page.locator('[data-k-open="contacts"]').click();
    await page.locator('[data-k-find]').fill('ph');
    assert.deepEqual((await page.locator('[data-k-contact]:not([hidden]) .k-n').allInnerTexts()).map((x) => x.trim()), ['Ph']);
    assert.deepEqual(problems, []);
    await close();
  });

  test(`tiles, their column, a disclaimer and the profile, at ${size.name} size`, async () => {
    const { page, problems, close } = await open(size);
    // A disclaimer in one line; its "?" opens the rest.
    const s = page.locator('.k-say');
    assert.equal(await s.locator('.k-more-text').isVisible(), false);
    await s.locator('.k-help').click();
    assert.match(await s.locator('.k-more-text').innerText(), /held in software/);
    await page.locator('[data-k-part="tiles"]').click();
    await page.locator('.k-tile').first().waitFor();
    assert.equal(await page.locator('.k-tile').count(), 4);
    assert.equal(await page.locator('.k-tile.k-d3').count(), 2, 'the edge thickens with the level');
    assert.equal(await page.locator('.k-tile .k-dm.k-l3').count(), 2);
    assert.equal(await page.locator('.k-tile.k-alarm .k-alert').innerText(), 'contested');
    await shot(page, size.name, 'tiles');
    await page.locator('[data-k-tile="paper"]').click();
    const col = page.locator('.k-col');
    await col.waitFor();
    if (size.name === 'phone') {
      assert.equal(await page.locator('.k-pane').isVisible(), false, 'on a phone, the column first');
      await page.locator('[data-k-col="vault"]').click();
      assert.equal(await col.isVisible(), false, 'the column folds away once a part is chosen');
      await page.locator('[data-k-back="column"]').click();
      assert.equal(await col.isVisible(), true, 'the back arrow brings it again');
    } else {
      assert.equal(await page.locator('.k-pane').isVisible(), true, 'on a Mac, the column beside the part');
      await page.locator('[data-k-col="vault"]').click();
      assert.equal(await col.isVisible(), true);
      assert.equal(await page.locator('[data-k-back="column"]').isVisible(), false);
    }
    await shot(page, size.name, 'column');
    await page.locator('[data-k-part="profile"]').click();
    const prof = page.locator('.k-prof');
    await prof.waitFor();
    assert.match(await prof.innerText(), /Pa[\s\S]*calls itself “Pa the potter”[\s\S]*Lives on two homes[\s\S]*Copy ID link[\s\S]*Follow[\s\S]*Message[\s\S]*Pay[\s\S]*Full record in Kišib/);
    assert.equal(await prof.locator('.k-alarmbox').count(), 0, 'no red line without trouble');
    await shot(page, size.name, 'profile');
    await noFindingNumber(page);
    assert.deepEqual(problems, []);
    await close();
  });
}

test('the slot: another app’s panel in a frame the host cannot read or change', async () => {
  const { page, problems, close } = await open(SIZES[0]);
  // An origin not given as the other app's: refused, nothing drawn.
  assert.match(await page.evaluate(() => window.openTestSlot('https://elsewhere.test/panel')), /^refused: https:\/\/elsewhere\.test is not Kišib’s/);
  assert.equal(await page.locator('.k-frame').count(), 0);
  const read = await page.evaluate((o) => window.openTestSlot(`${o}/frame`), other);
  assert.equal(read, 'unreadable', 'the host cannot read inside the frame');
  const frame = page.locator('.k-frame iframe');
  assert.equal(await frame.getAttribute('sandbox'), 'allow-scripts allow-forms', 'sandboxed, never same-origin');
  assert.equal(await frame.getAttribute('referrerpolicy'), 'no-referrer');
  assert.equal(await page.locator('.k-frame .k-by').innerText().then((t) => t.split('\n')[0]), 'Drawn by Kišib · Demo cannot read or change this frame');
  await page.frameLocator('.k-frame iframe').locator('body').getByText('Kišib’s panel').waitFor();
  await page.waitForFunction(() => window.slotMessages.length > 0);
  assert.deepEqual(await page.evaluate(() => window.slotMessages), [{ from: 'kishib', said: 'hello' }]);
  // Inside, the frame cannot reach the host either: its origin is its own.
  assert.equal(await page.frameLocator('.k-frame iframe').locator('body').evaluate(() => { try { return String(parent.document.title); } catch { return 'blocked'; } }), 'blocked');
  await shot(page, 'mac', 'slot');
  await page.locator('.k-frame .k-round').click();
  assert.equal(await page.locator('.k-frame').count(), 0);
  assert.deepEqual(problems, []);
  await close();
});
