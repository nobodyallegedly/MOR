// Dub's program: it holds the test identity's keys, in its folder, and
// serves its page to the browser on this machine only (127.0.0.1), built at
// start under a content security policy. Every request from the page is
// signed by a paired browser (the collective client's `access.ts`), with
// Dub's own domain line, so a request or a pairing code made for the
// desk or the collective client is never good here. The server itself is
// the desk's (`clients/desk/src/local.ts`).

import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { pageScript, serveLocal } from '../../desk/src/local.ts';
import { Dub } from './dub.ts';
import { OPS, run } from './ops.ts';
import { Store } from './store.ts';
import { PAGE_STYLE as STYLE } from './page/view.ts';
import { FONT_FILES, FONTS_DIR } from './fonts.ts';
import { version } from './version.ts';
import { KISHIB_DIR, RunnerLink } from './runner.ts';
import { DAMGAR_DIR, DamgarLink } from './damgar-link.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR post, version 1\n';
export const CODE_LABEL = 'MOR post pairing code';
/** A picture, a film or a recording travels from the page as base64 inside the request: up to 96 MiB of request (a film or a recording is at most 64 MiB, the video and audio Modules' limit). */
export const LIMIT = 96 << 20;

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  store: Store;
  access: Access;
  dub: Dub;
  close(): Promise<void>;
}

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

function via(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of list(v)) {
    const [from, to] = line.split('=').map((s) => s.trim());
    if (!from || !to) throw new Error(`“${line}”: write it as address=where to reach it`);
    out[from] = to;
  }
  return out;
}

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`. */
export async function serve(opts: { dir: string; port: number; reader?: string; /** Kišib's folder, where its program names its port (the runner); default ~/mor-kishib. */ kishib?: string; /** Damgar's folder, where its program names its port (Ask Damgar on this computer); default ~/mor-damgar. */ damgar?: string }): Promise<Running> {
  const store = new Store(opts.dir);
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  let base = '';
  // Kišib's runner (the Dubsar runner cMIP): an identity used through it, Dub holding no key.
  const runner = new RunnerLink(opts.dir, { kishib: opts.kishib ?? KISHIB_DIR, origin: () => base, name: 'Dub' });
  // Damgar on this computer, woken for a payment: its panel drawn in Dub's window (2A).
  const damgar = new DamgarLink({ damgar: opts.damgar ?? DAMGAR_DIR, origin: () => base, name: 'Dub' });
  const dub = new Dub(store, { reader: opts.reader, runner, damgar });
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();

  const platform = { bytes: (b64: string) => new Uint8Array(Buffer.from(b64, 'base64')), via };
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
        return run(dub, op, a, platform);
    }
  };

  // Inter and its licence, served beside the page from the program's own origin (F332, "Inter bundled").
  const files: Record<string, { type: string; body: Buffer }> = Object.fromEntries(Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(here(`${FONTS_DIR}/${name}`)) }]));
  // Dub's icon, beside its name at the top (the kit's app mark), as the web client serves it.
  files['/icon.png'] = { type: 'image/png', body: readFileSync(here('static/icon/dub.png')) };
  // The policy frames Kišib's origin (its runner's panel) and Damgar's (its money panel), each in the kit's slot, and nothing else.
  const kishib = runner.origin();
  const dg = damgar.origin();
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, limit: LIMIT, files, media: true, frames: [kishib, kishib.replace('127.0.0.1', 'localhost'), dg, dg.replace('127.0.0.1', 'localhost')] });
  base = local.base;
  return { server: local.server, port: local.port, base: local.base, store, access, dub, close: local.close };
}
