// The dubsar.org marks as JPEG pictures, the only kind of picture a site may
// hold (website cMIP, rule 4). The marks are drawn as SVG (docs/marks/, from
// the canvas "Scribe of Enki Logo"); a JPEG has no see-through parts, so each
// is drawn here on a fixed colour (decided by Nobody, allegedly, 8 October
// 2026):
//
//   tablet-light.jpg, tablet-dark.jpg   the clay tablet for the footer, on the
//                                       page's light and dark colours, which
//                                       site.css fixes to the same values
//   icon.jpg                            the KI icon for the browser tab
//
// Each is rendered by Chromium, then stripped to the picture alone, as
// `mor-site publish` requires (rule 6).
//
//   node --import tsx scripts/marks.ts      writes into docs/dubsar.org/

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const marks = join(root, 'docs/marks');
const site = join(root, 'docs/dubsar.org');
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** The page's colours, light and dark: the same values as in site.css. */
export const LIGHT = '#ffffff';
export const DARK = '#121212';

interface Job {
  out: string;
  svg: string;
  /** The part of the drawing to keep, in its own units: the clay and its chips, without the empty margin. */
  crop: { x: number; y: number; w: number; h: number };
  /** Width of the picture in pixels (three times the width it is shown at, for sharp screens). */
  width: number;
  background: string;
}

const TABLET = { x: 95, y: 128, w: 812, h: 180 };
const ICON = { x: 20, y: 22, w: 472, h: 472 };

const jobs: Job[] = [
  { out: 'tablet-light.jpg', svg: 'tablet.svg', crop: TABLET, width: 720, background: LIGHT },
  { out: 'tablet-dark.jpg', svg: 'tablet.svg', crop: TABLET, width: 720, background: DARK },
  // The cut-out sign shows the light colour, on light and dark tabs alike.
  { out: 'icon.jpg', svg: 'ki-icon.svg', crop: ICON, width: 64, background: LIGHT },
];

const browser = await chromium.launch({ executablePath: CHROMIUM });
try {
  for (const j of jobs) {
    const scale = j.width / j.crop.w;
    const height = Math.round(j.crop.h * scale);
    const svg = readFileSync(join(marks, j.svg), 'utf8');
    const full = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (!full) throw new Error(`${j.svg}: no viewBox`);
    const page = await browser.newPage({ viewport: { width: j.width, height }, deviceScaleFactor: 1 });
    const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    await page.setContent(
      `<body style="margin:0;background:${j.background};overflow:hidden">` +
        `<img src="${src}" style="display:block;position:absolute;left:${-j.crop.x * scale}px;top:${-j.crop.y * scale}px;` +
        `width:${Number(full[1]) * scale}px;height:${Number(full[2]) * scale}px"></body>`,
    );
    await page.waitForFunction(() => document.images[0]?.complete);
    const shot = await page.screenshot({ type: 'jpeg', quality: 92 });
    const { bytes } = strip(new Uint8Array(shot));
    writeFileSync(join(site, j.out), bytes);
    console.log(`${j.out}: ${j.width}×${height}, ${bytes.length} bytes`);
    await page.close();
  }
} finally {
  await browser.close();
}
