// Screenshots of dubsar.org's first screen (roadmap step 10a, option B,
// decided by Nobody, allegedly, 9 October 2026): a phone held upright
// (390 x 844), the same phone as Safari leaves it with its bars showing
// (about 390 x 664, an estimate), each in light and dark, and the phone held
// sideways (844 x 390). Runs the real display client, gateway, homes and
// relay, as the browser tests do. The photograph stands in for the Earth's: a
// square JPEG, as large as the real one.
//
//   node --import tsx scripts/first-screen.ts <folder>
//
// In WebKit, Safari's engine, with MOR_BROWSER=webkit; in Chromium otherwise.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Page } from 'playwright-core';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { post } from '../../barebone/src/post.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { gatewayFor, siteCopy, world } from '../test/world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const [out] = process.argv.slice(2);
if (!out) throw new Error('usage: first-screen.ts <folder>');
mkdirSync(out, { recursive: true });

/** A square photograph like the Earth's: a blue disc on black, 2400 px, drawn by the browser. */
async function earth(browser: Browser): Promise<Uint8Array> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const bytes = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = c.height = 2400;
    const x = c.getContext('2d')!;
    x.fillStyle = '#000';
    x.fillRect(0, 0, 2400, 2400);
    const g = x.createRadialGradient(1000, 950, 100, 1200, 1200, 1100);
    g.addColorStop(0, '#5b8fd6');
    g.addColorStop(0.7, '#1d4f9c');
    g.addColorStop(1, '#0b2554');
    x.fillStyle = g;
    x.beginPath();
    x.arc(1200, 1200, 1100, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = 'rgba(255,255,255,.75)';
    for (const [cx, cy, r] of [[900, 800, 260], [1500, 1300, 200], [1100, 1650, 300], [1650, 700, 150]]) {
      x.beginPath();
      x.ellipse(cx, cy, r, r * 0.45, 0.4, 0, Math.PI * 2);
      x.fill();
    }
    const b: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.85));
    return [...new Uint8Array(await b.arrayBuffer())];
  });
  await ctx.close();
  return strip(new Uint8Array(bytes)).bytes;
}

/** Where things sit on the first screen, in CSS pixels from the top of the window. */
async function measure(page: Page) {
  // No named functions inside: the page runs this as it is, without tsx's helpers.
  return page.evaluate(() => {
    const frame = document.getElementById('mor-page') as HTMLIFrameElement;
    const top = frame.getBoundingClientRect().top;
    const d = frame.contentDocument!;
    const box: Record<string, { top: number; bottom: number }> = {};
    const bar = document.getElementById('mor-bar')!.getBoundingClientRect();
    box.bar = { top: Math.round(bar.top), bottom: Math.round(bar.bottom) };
    for (const [name, sel] of [['act', '.first-act'], ['shortcuts', '.shortcuts'], ['onePage', '#one-page'], ['showerText', '#shower-text'], ['firstDoor', '.doors a']]) {
      const r = d.querySelector(sel)!.getBoundingClientRect();
      box[name] = { top: Math.round(top + r.top), bottom: Math.round(top + r.bottom) };
    }
    const act = d.querySelector('.mor-act iframe') as HTMLIFrameElement;
    const img = act.contentDocument!.querySelector('.mor-post img')!.getBoundingClientRect();
    return { screen: [window.innerWidth, window.innerHeight], photo: [Math.round(img.width), Math.round(img.height)], ...box };
  });
}

async function main(): Promise<void> {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  const w = await world();
  const browser = WEBKIT ? await webkit.launch() : await chromium.launch({ executablePath: CHROMIUM });
  const engine = WEBKIT ? 'webkit' : 'chromium';
  const act = (await post(w.owner, { text: 'Thank you for the shower… (a test post, its photograph standing in for the Earth’s)', jpeg: await earth(browser), relays: [w.relay.base] })).id;
  const v = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(siteCopy(act)), relays: [w.relay.base] });
  const g = new Gateway(gatewayFor(w, v.id, { serve: 'pinned' }), join(here, 'dist'), { extraConnect: ['http://127.0.0.1:*'] });
  const report: Record<string, unknown> = {};
  try {
    if (!(await g.load()).every((s) => s.loaded.ok)) throw new Error('the gateway did not load the site');
    const base = await g.listen('127.0.0.1', 0);
    const views: [string, { width: number; height: number }, ('light' | 'dark')[]][] = [
      ['upright', { width: 390, height: 844 }, ['light', 'dark']],
      ['upright-safari-bars', { width: 390, height: 664 }, ['light', 'dark']],
      ['sideways', { width: 844, height: 390 }, ['light']],
    ];
    for (const [hold, viewport, schemes] of views) {
      for (const colorScheme of schemes) {
        const ctx = await browser.newContext({ viewport, colorScheme, deviceScaleFactor: 2 });
        const page = await ctx.newPage();
        await page.goto(base + '/');
        await page.waitForSelector('#mor-bar.ok', { timeout: 60_000 });
        await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''), null, { timeout: 60_000 });
        await page.waitForTimeout(600);
        const name = `first-screen-${engine}-${hold}-${colorScheme}`;
        await page.screenshot({ path: join(out, `${name}.png`) });
        report[name] = await measure(page);
        await ctx.close();
      }
    }
  } finally {
    writeFileSync(join(out, `first-screen-${engine}.json`), JSON.stringify(report, null, 1) + '\n');
    console.log(JSON.stringify(report, null, 1));
    await browser.close();
    g.close();
    await w.stop();
  }
}

await main();
