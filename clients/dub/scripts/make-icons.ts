// The apps' icons (H25), from their drawings: Dub's (`static/icon/dub.svg`,
// a tablet), Edubba's (`../desk/static/icon/edubba.svg`, a house of
// tablets), Kišib's (`../kishib/static/icon/kishib.svg`, a cylinder seal
// beside the strip of clay it leaves) and Damgar's
// (`../damgar/static/icon/damgar.svg`, the sleeping duck alone, in its own
// shape as a duck weight is: H47) and Ummia's (`../ummia/static/icon/ummia.svg`, a round
// school tablet, its name carved once between two ruled lines). Each is rendered by Chromium at the sizes the Mac and Linux ask
// for, then:
//   NAME.png    256 pixels, for the Linux desktop entry (`make-desktop.sh`);
//   NAME.icns   the Mac's icon file, its PNG entries 16 to 1024 pixels
//               (`make-app.sh` puts it in the app as AppIcon.icns);
//   NAME-touch.png  180 pixels, full bleed on the icon's dark: the icon a
//               phone keeps when a web client is added to its home screen
//               (apple-touch-icon; H35). The phone rounds its corners itself.
// Both are kept in the repository beside the drawing, so making an app needs
// nothing more; run this again only when a drawing changes:
//   node --import tsx scripts/make-icons.ts [NAME...]
// With names (dub, edubba, kishib, damgar, ummia), only those are made.
// Chromium: /opt/pw-browsers or MOR_CHROMIUM (as the tests find it).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright-core';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function chromium_(): string {
  if (process.env.MOR_CHROMIUM) return process.env.MOR_CHROMIUM;
  const base = '/opt/pw-browsers';
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    const p = join(base, d, 'chrome-linux', 'chrome');
    if (/^chromium-\d+$/.test(d) && existsSync(p)) return p;
  }
  throw new Error('No Chromium: set MOR_CHROMIUM');
}

/**
 * The drawing at `size` pixels, as PNG, on a transparent background: drawn
 * in a page whose viewport is exactly that size. (Until 17 October 2026 this
 * used Chromium's `--window-size` from the command line, whose screenshot is
 * shorter than the window at small sizes: the PNGs came out cut off at the
 * bottom, found by the Kišib session.)
 */
/** The drawing full bleed: its dark square scaled past the edges, on the same dark, for a phone's home screen. */
async function renderTouch(page: Page, drawing: string, size: number): Promise<Buffer> {
  // The frame (the rounded square's edge) is left out, and the page takes the square's own fill: edge to edge, the phone rounds it.
  const fill = /<rect x="100" y="100" width="824" height="824" rx="184" fill="(#[0-9a-f]{6})"\/>/.exec(drawing)?.[1] ?? '#06080c';
  const svg = drawing.replace(/<rect [^>]*rx="1[78]\d(?:\.5)?" fill="none" stroke="[^"]+" stroke-width="\d+"\/>/, '');
  // The drawing's square is 824 of 1024 units, centred: scaled a little past the page, so its rounded corners fall outside.
  const scaled = Math.ceil((size * 1024) / 800);
  const offset = -Math.round((scaled - size) / 2);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${fill};overflow:hidden"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${scaled}" height="${scaled}" style="display:block;position:absolute;left:${offset}px;top:${offset}px"></body></html>`);
  await page.locator('img').evaluate((i) => (i as HTMLImageElement).decode());
  return page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
}

async function render(page: Page, svg: string, size: number): Promise<Buffer> {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block"></body></html>`);
  await page.locator('img').evaluate((i) => (i as HTMLImageElement).decode());
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

/** The Mac's icon format: "icns", its length, then entries of a type, a length and PNG data. */
function icns(pngs: Map<number, Buffer>): Buffer {
  const types: [string, number][] = [
    ['icp4', 16],
    ['icp5', 32],
    ['icp6', 64],
    ['ic07', 128],
    ['ic08', 256],
    ['ic09', 512],
    ['ic10', 1024],
    ['ic11', 32],
    ['ic12', 64],
    ['ic13', 256],
    ['ic14', 512],
  ];
  const parts = types.map(([t, n]) => {
    const head = Buffer.alloc(8);
    head.write(t, 0, 'ascii');
    head.writeUInt32BE(8 + pngs.get(n)!.length, 4);
    return Buffer.concat([head, pngs.get(n)!]);
  });
  const head = Buffer.alloc(8);
  head.write('icns', 0, 'ascii');
  head.writeUInt32BE(8 + parts.reduce((s, p) => s + p.length, 0), 4);
  return Buffer.concat([head, ...parts]);
}

const browser = await chromium.launch({ executablePath: chromium_() });
const page = await browser.newPage();
try {
  for (const [dir, name] of [
    [join(here, 'static', 'icon'), 'dub'],
    [join(here, '..', 'desk', 'static', 'icon'), 'edubba'],
    [join(here, '..', 'kishib', 'static', 'icon'), 'kishib'],
    [join(here, '..', 'damgar', 'static', 'icon'), 'damgar'],
    [join(here, '..', 'ummia', 'static', 'icon'), 'ummia'],
  ] as const) {
    if (process.argv.length > 2 && !process.argv.slice(2).includes(name)) continue;
    const svg = readFileSync(join(dir, `${name}.svg`), 'utf8');
    const pngs = new Map<number, Buffer>();
    for (const n of [16, 32, 64, 128, 256, 512, 1024]) pngs.set(n, await render(page, svg, n));
    writeFileSync(join(dir, `${name}.png`), pngs.get(256)!);
    writeFileSync(join(dir, `${name}.icns`), icns(pngs));
    writeFileSync(join(dir, `${name}-touch.png`), await renderTouch(page, svg, 180));
    console.log(`made ${join(dir, `${name}.png`)}, ${name}.icns and ${name}-touch.png`);
  }
} finally {
  await browser.close();
}
