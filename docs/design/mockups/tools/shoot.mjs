// Captures every mockup page at two sizes: a Mac window (1280×800) and a phone (390×844).
// Run from the repository root, after build.mjs: node docs/design/mockups/tools/shoot.mjs [slug-filter]
// Uses the pre-installed Chromium (PLAYWRIGHT_BROWSERS_PATH) and playwright-core from clients/dub.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(join(here, '../../../../clients/dub/package.json'));
const { chromium } = require('playwright-core');
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const only = process.argv[2];
const pages = JSON.parse(readFileSync(join(root, 'pages.json'), 'utf8')).filter((p) => !only || p.file.includes(only));
const browser = await chromium.launch({ executablePath: CHROMIUM });
for (const [size, viewport, scale] of [['mac', { width: 1280, height: 800 }, 1], ['phone', { width: 390, height: 844 }, 2]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(pathToFileURL(join(root, p.file)).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(root, 'shots/after', `${p.file.replace('.html', '')}-${size}.png`) });
  }
  await ctx.close();
}
await browser.close();
console.log(`${pages.length} pages × 2 sizes`);
