// Kišib's program: it serves Kišib's page to the browser on this machine
// only (127.0.0.1), built at start under a content security policy, and
// runs Kišib's code (`kishib.ts`) for it. Every request from the page is
// signed by a paired browser (the collective client's `access.ts`), with
// Kišib's own domain line, so a request or a pairing code made for Dub or
// Edubba is never good here. The server itself is Edubba's
// (`clients/desk/src/local.ts`).
//
// Its folder holds what pairing needs and nothing else: the paired
// browsers' public keys (`access.json`) and how to reach the running
// program (`run.json`). Never a word, a key or an act: what Kišib holds for
// an act lives in this program's memory, and is gone when it stops.

import type { Server } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { pageScript, serveLocal } from '../../desk/src/local.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
import { Kishib } from './kishib.ts';
import { OPS, run } from './ops.ts';
import { STYLE } from './page/view.ts';
import { version } from './version.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR Kišib, version 1\n';
export const CODE_LABEL = 'MOR Kišib pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  access: Access;
  kishib: Kishib;
  close(): Promise<void>;
}

const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`. */
export async function serve(opts: { dir: string; port: number; now?: () => number }): Promise<Running> {
  mkdirSync(opts.dir, { recursive: true, mode: 0o700 });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const kishib = new Kishib({ now: opts.now });
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();
  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'code':
        return { code: access.newCode() };
      case 'unpair':
        access.unpair(text(a.key));
        return {};
      default:
        if (!(OPS as readonly string[]).includes(op)) throw new Refusal(400, `unknown operation ${op}`);
        return run(kishib, op, a);
    }
  };
  // Inter and its licence, Dub's files, served beside the page from the program's own origin (F332).
  const files = Object.fromEntries(Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(here(`../dub/${FONTS_DIR}/${name}`)) }]));
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files });
  return {
    server: local.server,
    port: local.port,
    base: local.base,
    access,
    kishib,
    close: async () => {
      kishib.forget();
      await local.close();
    },
  };
}
