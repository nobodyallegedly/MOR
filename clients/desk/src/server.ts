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
import { Machine, type MachineOptions } from './machine.ts';
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
  machine: Machine;
  close(): Promise<void>;
}

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** How often Machine, allegedly's answering looks for what it received, while it is on. */
export const MACHINE_EVERY = 60_000;

/**
 * Start the program on 127.0.0.1 at `port` (0: any free port), with its
 * folder at `dir`. `machineEvery`: how often Machine, allegedly's answering
 * looks (milliseconds; 0, never by itself); `machine`: where its API and key
 * are, for the tests.
 */
export async function serve(opts: { dir: string; port: number; drafts?: string; machineEvery?: number; machine?: MachineOptions }): Promise<Running> {
  const store = new Store(opts.dir);
  if (opts.drafts) store.saveSettings({ ...store.settings(), drafts: opts.drafts });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const desk = new Desk(store);
  const machine = new Machine(desk, store, opts.machine);
  const num = (v: unknown): number => (typeof v === 'number' ? v : Number(text(v)));
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();

  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'state':
        return { ...desk.state(), machine: machine.state(), paired: access.paired().map((p) => ({ ...p, you: p.key === key })) };
      case 'machine terms':
        return machine.previewTerms(text(a.agent), text(a.owner));
      case 'machine publish':
        return machine.publishTerms(text(a.agent), text(a.owner), text(a.digest));
      case 'machine on':
        machine.setOn(a.on === true);
        return {};
      case 'machine cap':
        machine.setCap({ callsPerDay: num(a.callsPerDay), maxChars: num(a.maxChars) });
        return {};
      case 'machine look':
        return machine.tick();
      case 'machine pick':
        return machine.pick(text(a.key));
      case 'machine picks':
        return machine.previewPicks(a.keys);
      case 'machine pick many':
        return machine.pickMany(a.keys, text(a.digest));
      case 'machine nudge':
        return machine.nudge(num(a.count), text(a.context));
      case 'machine retry':
        return machine.retry(text(a.act));
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
  // Machine, allegedly's answering looks by itself while the program runs; a failure is kept for the desk to show, never thrown away silently.
  const every = opts.machineEvery ?? MACHINE_EVERY;
  const timer = every > 0 ? setInterval(() => void machine.tick().catch((e) => machine.failed(e)), every) : null;
  timer?.unref();
  return {
    server: local.server,
    port: local.port,
    base: local.base,
    store,
    access,
    desk,
    machine,
    async close() {
      if (timer) clearInterval(timer);
      await local.close();
    },
  };
}
