// The kit's rows of hand test v3, checked in every app at once, in a real
// browser (headless Chromium; WebKit where the iPad's and iPhone's fixes
// are, when it is installed): each app's program with an identity in it,
// driven by clicks alone.
//
// - H102 (with H91): Remove from the identity panel, its confirmation drawn
//   on top of the panel, in view; Keep it returns to the panel; Escape
//   closes the top one only; the panel's ×.
//
// Real homes and a relay on local ports. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright-core';
import { ACCEPTABLE } from '../../damgar/src/specs.ts';
import { closeAll, damgar, dub, edubba, start, type Relay } from '../../damgar/test/world.ts';
import { closeAll as closeUmmia, ummia } from '../../ummia/test/world.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const SIZES = { mac: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } } as const;

let homes: Relay[];
let relay: Relay;
let browser: Browser;
/** Each app's page, with an identity in use: its address (paired once per page opened). */
const apps: { name: string; url: () => string }[] = [];
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const max = await dub(H, R);
  await max.c.ask('name', { name: 'Max' });
  apps.push({ name: 'Dub', url: () => `${max.app.base}/#pair=${max.app.access.newCode()}` });
  const g = await damgar();
  await g.c.ask('bring', { id: max.id, words: max.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  apps.push({ name: 'Damgar', url: () => `${g.app.base}/#pair=${g.app.access.newCode()}` });
  const e = await edubba(H, R);
  await e.c.ask('bring', { name: 'Max', id: max.id, words: max.words, address: H[0], linked: false });
  apps.push({ name: 'Edubba', url: () => `${e.app.base}/#pair=${e.app.access.newCode()}` });
  const u = await ummia();
  await u.c.ask('bring', { id: max.id, words: max.words, address: H[0] });
  await u.c.ask('settings', { relays: R, track: R });
  apps.push({ name: 'Ummia', url: () => `${u.app.base}/#pair=${u.app.access.newCode()}` });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  await closeUmmia();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string, size: { width: number; height: number }): Promise<Page> {
  const context = await browser.newContext({ viewport: size });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (err) => problems.push(err.message));
  await page.goto(url);
  await page.locator('[data-k-open="identity"]').first().waitFor({ timeout: 90_000 });
  return page;
}

const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: `${shots}/every-app-${name}.png` });
};

/** Whether the element is what a tap at its middle reaches, in view. */
const onTop = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40));
    return !!at && el.contains(at) && r.top >= 0 && r.bottom <= window.innerHeight + 1;
  });

for (const size of ['mac', 'phone'] as const) {
  test(`H102: in every app, Remove from the identity panel: its confirmation on top of the panel, in view; Keep it; Escape closes the top one only (${size})`, async () => {
    for (const a of apps) {
      const page = await open(a.url(), SIZES[size]);
      try {
      // Whatever a page said on opening is closed first, so it covers nothing.
      await page.keyboard.press('Escape');
      await page.locator('[data-k-open="identity"]').first().click();
      const panel = page.locator('.k-panel[data-k-panel="identity"]');
      await panel.waitFor();
      assert.equal(await panel.locator('[data-k-close]').count(), 1, `${a.name}: the panel’s ×`);
      await panel.locator('[data-k-idmenu]').first().click();
      await page.getByRole('menuitem', { name: /^Remove from / }).click();
      const confirm = page.locator('[data-k-confirm]');
      await confirm.waitFor();
      assert.match(await confirm.innerText(), /Remove .+\?/, a.name);
      assert.ok(await onTop(page, '[data-k-confirm]'), `${a.name}: the confirmation is on top, in view`);
      await shot(page, `${a.name}-remove-${size}`);
      await confirm.locator('[data-k-remove-no]').click();
      await confirm.waitFor({ state: 'detached' });
      assert.ok(await panel.isVisible(), `${a.name}: Keep it returns to the panel`);
      await panel.locator('[data-k-idmenu]').first().click();
      await page.getByRole('menuitem', { name: /^Remove from / }).click();
      await confirm.waitFor();
      await page.keyboard.press('Escape');
      await confirm.waitFor({ state: 'detached' });
      assert.ok(await panel.isVisible(), `${a.name}: Escape closed the confirmation only`);
      await panel.locator('[data-k-close]').click();
      await panel.waitFor({ state: 'detached' });
      assert.equal(await page.locator('.k-shade').count(), 0, `${a.name}: nothing left over the page`);
      } catch (err) {
        await shot(page, `${a.name}-failed-${size}`);
        throw new Error(`${a.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
      await page.context().close();
    }
    assert.deepEqual(problems, []);
  });
}
