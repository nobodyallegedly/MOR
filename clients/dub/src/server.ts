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
import { Store } from './store.ts';
import { STYLE } from './page/view.ts';
import { STYLE as POST_STYLE } from '../../barebone/src/html.ts';
import { version } from './version.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR post, version 1\n';
export const CODE_LABEL = 'MOR post pairing code';
/** A picture travels from the page as base64 inside the request: up to 32 MiB of request. */
export const LIMIT = 32 << 20;

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
export async function serve(opts: { dir: string; port: number }): Promise<Running> {
  const store = new Store(opts.dir);
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const dub = new Dub(store);
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();

  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'state':
        return dub.state();
      case 'begin':
        return dub.begin({ homes: list(a.homes), relays: list(a.relays), via: via(a.via) });
      case 'confirm':
        return dub.confirm(list(a.typed));
      case 'abandon':
        await dub.abandon();
        return {};
      case 'bring':
        return dub.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list(a.relays), via: via(a.via) });
      case 'post': {
        const jpeg = text(a.jpeg) ? new Uint8Array(Buffer.from(text(a.jpeg), 'base64')) : undefined;
        return dub.post({ text: text(a.text), jpeg });
      }
      case 'posts':
        return dub.posts();
      case 'withdraw':
        return dub.withdraw(text(a.publication));
      case 'code':
        return { code: access.newCode() };
      case 'unpair':
        access.unpair(text(a.key));
        return {};
      default:
        throw new Refusal(400, `unknown operation ${op}`);
    }
  };

  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: `${STYLE}\n${POST_STYLE}`, version: built, api, limit: LIMIT });
  return { server: local.server, port: local.port, base: local.base, store, access, dub, close: local.close };
}
