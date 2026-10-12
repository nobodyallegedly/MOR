// The desk's program: it holds the test keys, in its folder, and serves its
// page to the browser on this machine only (127.0.0.1). Every request from
// the page is signed by a paired browser, as in the collective client
// (step 11b), with the desk's own domain line, so a request or a pairing
// code made for one program is never good for the other.

import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { Desk } from './desk.ts';
import { Store } from './store.ts';
import { STYLE } from './page/view.ts';
import { version } from './version.ts';
import { pageScript, serveLocal } from './local.ts';

export type { RunFile } from './local.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR desk, version 1\n';
export const CODE_LABEL = 'MOR desk pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  store: Store;
  access: Access;
  desk: Desk;
  close(): Promise<void>;
}

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`. */
export async function serve(opts: { dir: string; port: number; drafts?: string }): Promise<Running> {
  const store = new Store(opts.dir);
  if (opts.drafts) store.saveSettings({ ...store.settings(), drafts: opts.drafts });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const desk = new Desk(store);
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();

  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'state':
        return { ...desk.state(), paired: access.paired().map((p) => ({ ...p, you: p.key === key })) };
      case 'settings': {
        const via: Record<string, string> = {};
        for (const line of list(a.via)) {
          const [from, to] = line.split('=').map((s) => s.trim());
          if (!from || !to) throw new Error(`“${line}”: write it as address=where to reach it`);
          via[from] = to;
        }
        await desk.setSettings({ homes: list(a.homes), relays: list(a.relays), via, drafts: text(a.drafts) });
        return {};
      }
      case 'identity':
        return desk.createIdentity({ name: text(a.name), linked: a.linked === true });
      case 'rename':
        desk.rename(text(a.id), text(a.name));
        return {};
      case 'link':
        desk.link(text(a.id), a.on === true);
        return {};
      case 'drafts':
        return desk.drafts();
      case 'waiting':
        return desk.waiting();
      case 'approve':
        return desk.approve(text(a.digest));
      case 'decline':
        return desk.decline(text(a.digest), text(a.note));
      case 'send back':
        return desk.sendBack(text(a.digest), text(a.note));
      case 'resend':
        return desk.resend(text(a.digest));
      case 'refresh':
        return desk.refresh(text(a.identity));
      case 'witness':
        return desk.witness(text(a.identity), text(a.act), text(a.shown));
      case 'sort':
        desk.sort(text(a.identity), text(a.key), text(a.sorted));
        return {};
      case 'code':
        return { code: access.newCode() };
      case 'unpair':
        access.unpair(text(a.key));
        return {};
      default:
        throw new Refusal(400, `unknown operation ${op}`);
    }
  };

  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api });
  return { server: local.server, port: local.port, base: local.base, store, access, desk, close: local.close };
}
