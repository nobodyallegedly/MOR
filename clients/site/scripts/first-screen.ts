// Screenshots of dubsar.org's first screen, for Nobody, allegedly, to choose
// the first act's photograph's height by looking (roadmap step 10a, decided
// 9 October 2026): a phone held upright (390 x 844), light and dark, at each
// share of the screen's height given, and the same phone held sideways
// (844 x 390). Runs the real display client, gateway, homes and relay, as the
// browser tests do. The photograph stands in for the Earth's: a square JPEG,
// as large as the real one (the browser tests' "large picture").
//
//   node --import tsx scripts/first-screen.ts <folder> [share ...]
//
// In WebKit, Safari's engine, with MOR_BROWSER=webkit; in Chromium otherwise.
// The share is shown by setting the act frame's `--mor-picture-share`; the
// released value is PICTURE_SHARE (src/shell/view.ts).

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Page } from 'playwright-core';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { post } from '../../barebone/src/post.ts';
import { Gateway } from '../src/gateway.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { PICTURE_SHARE } from '../src/shell/view.ts';
import { gatewayFor, siteCopy, world } from '../test/world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const [out, ...given] = process.argv.slice(2);
if (!out) throw new Error('usage: first-screen.ts <folder> [share ...]');
const shares = given.length ? given.map(Number) : [PICTURE_SHARE];
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
    for (const [name, sel] of [['act', '.first-act'], ['shortcuts', '.shortcuts'], ['doors', '.doors'], ['firstDoor', '.doors a']]) {
      const r = d.querySelector(sel)!.getBoundingClientRect();
      box[name] = { top: Math.round(top + r.top), bottom: Math.round(top + r.bottom) };
    }
    const act = d.querySelector('.mor-act iframe') as HTMLIFrameElement;
    const img = act.contentDocument!.querySelector('.mor-post img')!.getBoundingClientRect();
    return { screen: window.innerHeight, photo: Math.round(img.height), ...box };
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
    const middle = [shares[Math.floor(shares.length / 2)]];
    // The phone's whole screen; what Safari leaves of it with its bars showing (about 390 x 664 on an
    // iPhone of that size, an estimate); and the phone held sideways.
    const views: [string, { width: number; height: number }, number[], ('light' | 'dark')[]][] = [
      ['upright', { width: 390, height: 844 }, shares, ['light', 'dark']],
      ['upright-safari-bars', { width: 390, height: 664 }, shares, ['light']],
      ['sideways', { width: 844, height: 390 }, middle, ['light']],
    ];
    for (const [hold, viewport, list, schemes] of views) {
      for (const colorScheme of schemes) {
        const ctx = await browser.newContext({ viewport, colorScheme, deviceScaleFactor: 2 });
        const page = await ctx.newPage();
        await page.goto(base + '/');
        await page.waitForSelector('#mor-bar.ok', { timeout: 60_000 });
        await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''), null, { timeout: 60_000 });
        for (const share of list) {
          await page.evaluate((s) => {
            const frame = document.getElementById('mor-page') as HTMLIFrameElement;
            const act = frame.contentDocument!.querySelector('.mor-act iframe') as HTMLIFrameElement;
            act.contentDocument!.documentElement.style.setProperty('--mor-picture-share', String(s));
          }, share);
          await page.waitForTimeout(400);
          const name = `first-screen-${engine}-${hold}-${colorScheme}-${Math.round(share * 100)}`;
          await page.screenshot({ path: join(out, `${name}.png`) });
          report[name] = await measure(page);
        }
        await ctx.close();
      }
    }
  } finally {
    writeFileSync(join(out, `first-screen-${engine}.json`), JSON.stringify(report, null, 1) + '\n');
    console.log(JSON.stringify(report));
    await browser.close();
    g.close();
    await w.stop();
  }
}

await main();
