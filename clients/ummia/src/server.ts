// Ummia's program: it serves Ummia's page to the browser on this machine
// only (127.0.0.1), built at start under a content security policy, and
// runs Ummia's code (`ummia.ts`) for it, with the releases a folder allows
// (`releases.ts`). Every request from the page is signed by a paired
// browser, with Ummia's own domain line, so a request or a pairing code made
// for Dub, Edubba, Kišib or Damgar is never good here. The server itself is
// Edubba's (`clients/desk/src/local.ts`).

import type { Server } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { pageScript, serveLocal } from '../../desk/src/local.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import { listFolders } from '../../desk/src/folders.ts';
import { Releases } from './releases.ts';
import { Ummia } from './ummia.ts';
import { OPS, run } from './ops.ts';
import { STYLE } from './page/view.ts';
import { Store } from './store.ts';
import { version } from './version.ts';
import { KISHIB_DIR, RunnerLink } from '../../dub/src/runner.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR Ummia, version 1\n';
export const CODE_LABEL = 'MOR Ummia pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  access: Access;
  ummia: Ummia;
  store: Store;
  close(): Promise<void>;
}

const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`, following `chain` for the anchors of releases. */
export async function serve(opts: { dir: string; port: number; chain?: ChainSource | null; /** Kišib's folder, where its program names its port (the runner); default ~/mor-kishib. */ kishib?: string }): Promise<Running> {
  mkdirSync(opts.dir, { recursive: true, mode: 0o700 });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const store = new Store(opts.dir);
  let base = '';
  // Kišib's runner (the Dubsar runner cMIP): an identity used through it, Ummia holding no key; every act shows Kišib's panel here.
  const runner = new RunnerLink(opts.dir, { kishib: opts.kishib ?? KISHIB_DIR, origin: () => base, name: 'Ummia' });
  const ummia = new Ummia(store, { releases: new Releases(), chain: opts.chain ?? null, runner });
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
      case 'folders':
        // The computer's folders, browsed by the program for the page, which cannot open the system's own dialog (Edubba's, H31).
        return listFolders(text(a.path));
      default:
        if (!(OPS as readonly string[]).includes(op)) throw new Refusal(400, `unknown operation ${op}`);
        return run(ummia, op, a);
    }
  };
  // Inter, Dub's files, and Ummia's icon, served beside the page from the program's own origin.
  const files = {
    ...Object.fromEntries(Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(here(`../dub/${FONTS_DIR}/${name}`)) }])),
    '/icon.png': { type: 'image/png', body: readFileSync(here('static/icon/ummia.png')) },
  };
  // The policy frames Kišib's origin, its runner's panel in the kit's slot, and nothing else.
  const kishib = runner.origin();
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files, frames: [kishib, kishib.replace('127.0.0.1', 'localhost')] });
  base = local.base;
  return { server: local.server, port: local.port, base: local.base, access, ummia, store, close: () => local.close() };
}
