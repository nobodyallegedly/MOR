// Edubba's program (called MOR Identities until 16 October 2026, F333): it
// holds the test keys, in its folder, and serves its
// page to the browser on this machine only (127.0.0.1). Every request from
// the page is signed by a paired browser, as in the collective client
// (step 11b), with the desk's own domain line, so a request or a pairing
// code made for one program is never good for the other.

import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { Desk } from './desk.ts';
import { type MachineOptions } from './machine.ts';
import { Agents } from './agents.ts';
import { Collectives } from './collectives.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
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
  agents: Agents;
  collectives: Collectives;
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
export async function serve(opts: { dir: string; port: number; drafts?: string; machineEvery?: number; machine?: MachineOptions; collective?: string }): Promise<Running> {
  const store = new Store(opts.dir);
  if (opts.drafts) store.saveSettings({ ...store.settings(), drafts: opts.drafts });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const desk = new Desk(store);
  const agents = new Agents(desk, store, opts.machine);
  // The collective client's folder, read where it is (~/mor-collective), or
  // inside this one for a new install (src/cli.ts).
  const collectives = new Collectives(opts.collective ?? join(opts.dir, 'collective'), store);
  const agentOf = (a: Record<string, unknown>) => agents.for(text(a.agent) || null);
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
        return {
          ...desk.state(),
          machine: agents.for(null).state(),
          agents: agents.list(),
          sharedKey: agents.sharedKey(),
          collectives: collectives.list(),
          paired: access.paired().map((p) => ({ ...p, you: p.key === key })),
        };
      // An agent's answering: `agent` names it; without, the first agent (as MOR Identities had one).
      case 'machine terms': {
        const agent = text(a.agent);
        return agents.for(store.isAgent(agent) ? agent : null).previewTerms(agent, text(a.owner));
      }
      case 'machine publish':
        return agents.publishTerms(text(a.agent), text(a.owner), text(a.digest), a.own === true);
      case 'machine on':
        agentOf(a).setOn(a.on === true);
        return {};
      case 'machine cap':
        agentOf(a).setCap({ callsPerDay: num(a.callsPerDay), maxChars: num(a.maxChars) });
        return {};
      case 'machine look':
        return agentOf(a).tick();
      case 'machine pick':
        return agentOf(a).pick(text(a.key));
      case 'machine picks':
        return agentOf(a).previewPicks(a.keys);
      case 'machine pick many':
        return agentOf(a).pickMany(a.keys, text(a.digest));
      case 'machine nudge':
        return agentOf(a).nudge(num(a.count), text(a.context));
      case 'machine retry':
        return agentOf(a).retry(text(a.act));
      case 'agent':
        return agents.details(text(a.agent));
      case 'agent add':
        return agents.add({ name: text(a.name), agent: text(a.agent), owner: text(a.owner), ownerName: text(a.ownerName), key: text(a.key), own: a.own === true });
      case 'agent name':
        return agents.name(text(a.agent));
      case 'agent key':
        return agents.setKey(text(a.agent), { own: a.own === true, key: text(a.key) });
      case 'shared key':
        return agents.saveKey(null, text(a.key));
      case 'agent prompt':
        return agents.prompt(text(a.agent), text(a.text));
      case 'agent follow':
        agents.follow(text(a.agent), text(a.id), text(a.name));
        return {};
      case 'agent unfollow':
        agents.unfollow(text(a.agent), text(a.id));
        return {};
      case 'agent view':
        return agents.view(text(a.agent));
      case 'collective constitution':
        return collectives.constitution(text(a.collective));
      case 'collective permissions':
        return collectives.permissions(text(a.collective));
      case 'collective posts':
        return collectives.posts(text(a.collective));
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
        // The collective client's own operations, for the Collectives tab (its code is the library Edubba uses).
        if (op.startsWith('collective ')) return collectives.api(op.slice('collective '.length), a);
        throw new Refusal(400, `unknown operation ${op}`);
    }
  };

  // Inter, bundled with Dub (F332), served from this page's own origin too.
  const fonts = Object.fromEntries(
    Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(fileURLToPath(new URL(`../../dub/${FONTS_DIR}/${name}`, import.meta.url))) }]),
  );
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files: fonts, limit: 32 << 20 });
  // Each agent's answering looks by itself while the program runs; a failure is kept for the page to show, never thrown away silently.
  const every = opts.machineEvery ?? MACHINE_EVERY;
  const timer = every > 0 ? setInterval(() => void agents.tickAll(), every) : null;
  timer?.unref();
  return {
    server: local.server,
    port: local.port,
    base: local.base,
    store,
    access,
    desk,
    agents,
    collectives,
    async close() {
      if (timer) clearInterval(timer);
      await local.close();
    },
  };
}
