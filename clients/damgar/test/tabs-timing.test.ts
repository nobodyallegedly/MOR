// H115 (hand test v3): Damgar on the Mac struggled to show a tab's content
// when switching tabs. Each part is now drawn at once from what it last
// showed, said "Looking…", then filled in with what the look-ups return. A
// timing test in the program: each part drawn once; then every request to
// the program is held back 2.5 seconds (as a slow look at the homes or the
// node would hold it), and each part opened again shows at once, within a
// fraction of that, before it is filled in. Real homes and a relay on local
// ports; test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { closeAll, damgar, dub, start, type Relay } from './world.ts';
import { ACCEPTABLE } from '../src/specs.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const SLOW = 2500;

let homes: Relay[];
let relay: Relay;
let browser: Browser;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

// Every browser, app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await browser?.close().catch(() => undefined);
    await closeAll();
  } finally {
    for (const h of [...(homes ?? []), relay]) await h?.stop().catch(() => undefined);
  }
});

/** Open a part by its tile and column, and the time until its heading shows. */
async function openPart(page: Page, tile: string, part: string, heading: string): Promise<number> {
  await page.locator('[data-action="home-tiles"]').click();
  await page.locator(`[data-k-tile="${tile}"]`).click();
  const t0 = Date.now();
  await page.locator(`.k-col [data-k-col="${part}"]`).click();
  await page.locator(`#pane h2:text-is("${heading}")`).waitFor({ timeout: 30_000 });
  return Date.now() - t0;
}

test('H115: a part opened again shows at once from what it last showed, said Looking…, then is filled in', async () => {
  const H = homes.map((h) => h.base);
  const max = await dub(H, [relay.base]);
  const g = await damgar();
  await g.c.ask('bring', { id: max.id, words: max.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(`${g.app.base}/#pair=${g.app.access.newCode()}`);
  await page.locator('.k-tile').first().waitFor({ timeout: 60_000 });
  const parts = [
    ['account', 'payments', 'Payments'],
    ['lanes', 'in-force', 'In force'],
    ['settings', 'accept', 'Rules I follow'],
    ['waiting', 'to-pay', 'To pay'],
  ] as const;
  // Each drawn once, at the program's own pace.
  for (const [tile, part, heading] of parts) await openPart(page, tile, part, heading);
  // Then the program held back: each request answered 2.5 seconds late.
  await page.route('**/*', async (r) => {
    if (r.request().method() === 'POST') await new Promise((x) => setTimeout(x, SLOW));
    await r.continue();
  });
  for (const [tile, part, heading] of parts) {
    const took = await openPart(page, tile, part, heading);
    assert.ok(took < SLOW / 2, `${heading} shown in ${took} ms, not waiting on the program`);
    // Said to be looking while the program is asked (a part needing nothing from it, Settings', is filled in at once).
    if (part !== 'accept') assert.ok(await page.locator('#pane .damgar-looking', { hasText: 'Looking…' }).isVisible(), `${heading}: said to be looking`);
    if (shots) await page.screenshot({ path: join(shots, `h115-${part}-looking.png`) });
    // Filled in, the word gone.
    await page.locator('#pane .damgar-looking').waitFor({ state: 'detached', timeout: 30_000 });
    await page.locator(`#pane h2:text-is("${heading}")`).waitFor();
  }
  await page.unroute('**/*');
});
