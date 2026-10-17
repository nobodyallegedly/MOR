// The apps' icons (H25), from their drawings: Dub's (`static/icon/dub.svg`,
// a tablet) and Edubba's (`../desk/static/icon/edubba.svg`, a house of
// tablets). Each is rendered by Chromium at the sizes the Mac and Linux ask
// for, then:
//   NAME.png    256 pixels, for the Linux desktop entry (`make-desktop.sh`);
//   NAME.icns   the Mac's icon file, its PNG entries 16 to 1024 pixels
//               (`make-app.sh` puts it in the app as AppIcon.icns).
// Both are kept in the repository beside the drawing, so making an app needs
// nothing more; run this again only when a drawing changes:
//   node --import tsx scripts/make-icons.ts
// Chromium: /opt/pw-browsers or MOR_CHROMIUM (as the tests find it).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function chromium(): string {
  if (process.env.MOR_CHROMIUM) return process.env.MOR_CHROMIUM;
  const base = '/opt/pw-browsers';
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    const p = join(base, d, 'chrome-linux', 'chrome');
    if (/^chromium-\d+$/.test(d) && existsSync(p)) return p;
  }
  throw new Error('No Chromium: set MOR_CHROMIUM');
}

/** The drawing at `size` pixels, as PNG, on a transparent background. */
function render(svg: string, size: number, tmp: string): Buffer {
  const page = join(tmp, `${size}.html`);
  const out = join(tmp, `${size}.png`);
  writeFileSync(page, `<html><body style="margin:0;background:transparent"><img src="file://${svg}" width="${size}" height="${size}" style="display:block"></body></html>`);
  execFileSync(chromium(), ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', `--window-size=${size},${size}`, `--screenshot=${out}`, `file://${page}`], { stdio: 'ignore' });
  return readFileSync(out);
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

for (const [dir, name] of [
  [join(here, 'static', 'icon'), 'dub'],
  [join(here, '..', 'desk', 'static', 'icon'), 'edubba'],
] as const) {
  const tmp = mkdtempSync(join(tmpdir(), 'mor-icon-'));
  try {
    const svg = join(dir, `${name}.svg`);
    const pngs = new Map([16, 32, 64, 128, 256, 512, 1024].map((n) => [n, render(svg, n, tmp)]));
    writeFileSync(join(dir, `${name}.png`), pngs.get(256)!);
    writeFileSync(join(dir, `${name}.icns`), icns(pngs));
    console.log(`made ${join(dir, `${name}.png`)} and ${name}.icns`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
