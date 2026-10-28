// Damgar's program: it serves Damgar's page to the browser on this machine
// only (127.0.0.1), built at start under a content security policy, and
// runs Damgar's code (`damgar.ts`) for it. Every request from the page is
// signed by a paired browser, with Damgar's own domain line, so a request
// or a pairing code made for Dub, Edubba or Kišib is never good here. The
// server itself is Edubba's (`clients/desk/src/local.ts`).

import type { Server } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { pageScript, serveLocal } from '../../desk/src/local.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
import type { ChainSource } from './chain.ts';
import { Damgar } from './damgar.ts';
import { lndLink, type InvoiceLink, type LinkConfig } from './link.ts';
import { OPS, run } from './ops.ts';
import { STYLE } from './page/view.ts';
import { Store } from './store.ts';
import { version } from './version.ts';
import { wakeRoutes } from './wake.ts';
import { KISHIB_DIR, RunnerLink } from '../../dub/src/runner.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR Damgar, version 1\n';
export const CODE_LABEL = 'MOR Damgar pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  access: Access;
  damgar: Damgar;
  store: Store;
  close(): Promise<void>;
}

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
/** A path as typed, "~" for the home folder, quotes and a Terminal's "\\ " read as the folder they name. */
const expand = (p: string) => p.trim().replace(/^['"]|['"]$/g, '').replace(/\\ /g, ' ').replace(/^~(?=\/|$)/, process.env.HOME ?? '~');

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`, following `chain` for the on-chain rail. */
export async function serve(opts: { dir: string; port: number; chain?: ChainSource | null; link?: (c: LinkConfig) => Promise<InvoiceLink>; /** Kišib's folder, where its program names its port (the runner); default ~/mor-kishib. */ kishib?: string }): Promise<Running> {
  mkdirSync(opts.dir, { recursive: true, mode: 0o700 });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const store = new Store(opts.dir);
  let base = '';
  // Kišib's runner (the Dubsar runner cMIP): an identity used through it, Damgar holding no key; money always asks, in Kišib's panel here.
  const runner = new RunnerLink(opts.dir, { kishib: opts.kishib ?? KISHIB_DIR, origin: () => base, name: 'Damgar' });
  const damgar = new Damgar(store, { chain: opts.chain ?? null, link: opts.link ?? lndLink, runner });
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
      case 'link':
        // On this computer, the permission and the certificate may be given as files (the node's folder), read here.
        if (a.remove !== true && text(a.macaroonFile)) a = { ...a, macaroon: readFileSync(expand(text(a.macaroonFile))).toString('hex') };
        if (a.remove !== true && text(a.certFile)) a = { ...a, cert: readFileSync(expand(text(a.certFile)), 'utf8') };
        return run(damgar, op, a);
      default:
        if (!(OPS as readonly string[]).includes(op)) throw new Refusal(400, `unknown operation ${op}`);
        return run(damgar, op, a);
    }
  };
  // The suite's type (H123), from the kit, and Damgar's icon, served beside the page from the program's own origin.
  const files = {
    ...Object.fromEntries(Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(here(`../dub/${FONTS_DIR}/${name}`)) }])),
    '/icon.png': { type: 'image/png', body: readFileSync(here('static/icon/damgar.png')) },
  };
  // Woken by an app on this computer (the second way to pay, 2A): its panel drawn in that app's window.
  const routes = wakeRoutes(damgar, () => base, files);
  // The policy frames Kišib's origin, its runner's panel in the kit's slot, and nothing else.
  const kishib = runner.origin();
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files, routes, frames: [kishib, kishib.replace('127.0.0.1', 'localhost')] });
  base = local.base;
  return { server: local.server, port: local.port, base: local.base, access, damgar, store, close: () => local.close() };
}
