// Edubba's program (called MOR Identities until 16 October 2026, F333): it
// holds the test keys, in its folder, and serves its
// page to the browser on this machine only (127.0.0.1). Every request from
// the page is signed by a paired browser, as in the collective client
// (step 11b), with the desk's own domain line, so a request or a pairing
// code made for one program is never good for the other.

import { Publishing } from './publishing.ts';
import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { Desk } from './desk.ts';
import { type MachineOptions } from './machine.ts';
import { Corrections } from './corrections.ts';
import { Agents } from './agents.ts';
import { Collectives } from './collectives.ts';
import { Setup } from './setup.ts';
import { Real } from './real.ts';
import { AfterKishib } from './kishib.ts';
import { EdubbaMoney } from './money.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import { Member } from './member.ts';
import { KISHIB_DIR, RunnerLink } from '../../dub/src/runner.ts';
import { listFolders } from './folders.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
import { Store } from './store.ts';
import { STYLE } from './page/view.ts';
import { version } from './version.ts';
import { pageScript, serveLocal } from './local.ts';
import { operations } from './ops.ts';

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
  setup: Setup;
  real: Real;
  close(): Promise<void>;
}

/** How often Machine, allegedly's answering looks for what it received, while it is on. */
export const MACHINE_EVERY = 60_000;

/**
 * Start the program on 127.0.0.1 at `port` (0: any free port), with its
 * folder at `dir`. `machineEvery`: how often Machine, allegedly's answering
 * looks (milliseconds; 0, never by itself); `machine`: where its API and key
 * are, for the tests.
 */
export async function serve(opts: { dir: string; port: number; drafts?: string; machineEvery?: number; machine?: MachineOptions; collective?: string; chain?: ChainSource | null; /** Kišib's folder, where its program names its port (the runner); default ~/mor-kishib. */ kishib?: string }): Promise<Running> {
  const store = new Store(opts.dir);
  if (opts.drafts) store.saveSettings({ ...store.settings(), drafts: opts.drafts });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const desk = new Desk(store);
  const agents = new Agents(desk, store, opts.machine);
  const corrections = new Corrections(desk, store);
  // The collective client's folder, read where it is (~/mor-collective), or
  // inside this one for a new install (src/cli.ts).
  const collectives = new Collectives(opts.collective ?? join(opts.dir, 'collective'), store);
  const setup = new Setup(desk, store);
  const real = new Real(desk, store);
  // After Kišib: the new signing key's words, for an identity or a real collective held here (`kishib.ts`).
  const after = new AfterKishib(desk, store, real);
  // Money, prepared here and signed in Damgar (F338): a payment from an identity held here, Bitcoin anchoring of a collective's act.
  const money = new EdubbaMoney(desk, store, real, opts.chain ?? null);
  // H33: Edubba signs as a member, with Dub's own code, for any identity it holds; the names it shows are Edubba's own.
  let base = '';
  // Kišib's runner (the Dubsar runner cMIP): an identity used through it, Edubba holding no key; it signs in To sign through Kišib's panel, as Dub does.
  const runner = new RunnerLink(opts.dir, { kishib: opts.kishib ?? KISHIB_DIR, origin: () => base, name: 'Edubba' });
  const member = new Member(store, desk, () => [...store.book().identities.map((i) => ({ id: i.id, name: i.name })), ...real.contacts().map((c) => ({ id: c.id, name: c.name }))], runner);
  // The Publishing tab (round 3, part B): protected files and vows, as oneself or a collective.
  const publishing = new Publishing(desk, store, real);
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();

  const api = operations({ store, desk, setup, real, after, member, publishing, corrections, collectives, agents, access, money, folders: listFolders, refuse: (status, message) => new Refusal(status, message) }, { web: false });

  // Inter, bundled with Dub (F332), served from this page's own origin too.
  const fonts = Object.fromEntries(
    Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(fileURLToPath(new URL(`../../dub/${FONTS_DIR}/${name}`, import.meta.url))) }]),
  );
  // Edubba's icon, beside its name at the top (the kit's app mark), as the web client serves it.
  const files: Record<string, { type: string; body: Buffer }> = { ...fonts, '/icon.png': { type: 'image/png', body: readFileSync(here('static/icon/edubba.png')) } };
  // The policy frames Kišib's origin (its runner's panel, in the kit's slot), and nothing else.
  const kishib = runner.origin();
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files, limit: 32 << 20, media: true, frames: [kishib, kishib.replace('127.0.0.1', 'localhost')] });
  base = local.base;
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
    setup,
    real,
    async close() {
      if (timer) clearInterval(timer);
      await local.close();
    },
  };
}
