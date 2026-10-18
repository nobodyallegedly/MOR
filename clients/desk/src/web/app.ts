// Edubba's web client, for testing only (decided by Nobody, allegedly, 17
// and 18 October 2026: "so I can access it from other devices than the
// Mac"): the same page as Edubba on the Mac (`../page/ui.ts`), running
// Edubba's own code (`../ops.ts` and what it uses) in this browser, with
// Edubba's folder kept in this browser's storage (`vfs.ts`). Every act is
// made and checked here by the core library's WebAssembly and sent from here
// to the homes and relays. No Agents tab, no API key, nothing from Claude's
// connector, no test collective, no folder: those need Edubba on a computer.
// Every page carries the banner (`static/web.html`).

import { folder } from './vfs.ts';
import { Store } from '../store.ts';
import { Desk } from '../desk.ts';
import { Setup } from '../setup.ts';
import { Real } from '../real.ts';
import { AfterKishib } from '../kishib.ts';
import { Member } from '../member.ts';
import { Corrections } from '../corrections.ts';
import { Collectives } from '../collectives.ts';
import { operations } from '../ops.ts';
import { begin } from '../page/ui.ts';
import * as v from '../page/view.ts';

/** Edubba's folder, inside this browser's storage (`vfs.ts`): the same layout as `~/edubba` on a computer. */
export const DIR = '/edubba';
/** The Web Locks name: one tab of this site holds Edubba's folder at a time. */
export const LOCK = 'edubba-web';

const app = document.getElementById('app')!;
const stop = (html: string) => (app.innerHTML = `${v.top()}${v.note('error', html)}`);

/** Hold the lock for as long as this tab is open; false if another tab of this site holds it. */
function only(): Promise<boolean> {
  if (!navigator.locks) return Promise.resolve(true);
  return new Promise((resolve) => {
    void navigator.locks.request(LOCK, { ifAvailable: true }, (lock) => {
      resolve(!!lock);
      // Held until this tab closes.
      return lock ? new Promise<void>(() => undefined) : undefined;
    });
  });
}

/** Addresses the deployer suggests in `edubba.json` beside the page, as Dub's `dub.json`: optional, https only, filled into Settings while they are empty, never trusted for anything else. */
async function deployer(): Promise<{ homes: string[]; relays: string[] }> {
  try {
    const r = await fetch('edubba.json', { cache: 'no-store' });
    if (!r.ok) return { homes: [], relays: [] };
    const j = (await r.json()) as { homes?: unknown; relays?: unknown };
    const urls = (x: unknown) => (Array.isArray(x) ? x.map(String).filter((u) => /^https:\/\/[^\s]+$/.test(u)) : []);
    return { homes: urls(j.homes), relays: urls(j.relays) };
  } catch {
    return { homes: [], relays: [] };
  }
}

async function main() {
  v.setWeb(true);
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    stop('This page keeps keys in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.');
    return;
  }
  if (!(await only())) {
    stop('Edubba is open in another tab of this browser. Close that tab, then reload this one: two tabs would each sign from their own copy of what this browser keeps.');
    return;
  }
  try {
    await folder.open();
  } catch (err) {
    stop(`This browser does not let the page keep anything (${v.e(err instanceof Error ? err.message : String(err))}). A private window may not.`);
    return;
  }
  const store = new Store(DIR);
  const desk = new Desk(store);
  const real = new Real(desk, store);
  const run = operations(
    {
      store,
      desk,
      setup: new Setup(desk, store),
      real,
      after: new AfterKishib(desk, store, real),
      member: new Member(store, desk, () => [...store.book().identities.map((i) => ({ id: i.id, name: i.name })), ...real.contacts().map((c) => ({ id: c.id, name: c.name }))]),
      corrections: new Corrections(desk, store),
      collectives: new Collectives(`${DIR}/collective`, store),
      agents: null,
      access: null,
      money: null,
      folders: null,
      refuse: (_status, message) => new Error(message),
    },
    { web: true },
  );
  const places = store.settings();
  if (!places.homes.length && !places.relays.length) {
    const d = await deployer();
    if (d.homes.length || d.relays.length) await run('settings', d, 'web').catch(() => undefined);
  }
  await folder.flushed();
  begin({
    web: {
      // As over the program's wire: the arguments and the answer as JSON, and the answer given only once what it changed is kept.
      async ask<T>(op: string, args: object = {}): Promise<T> {
        const r = await run(op, JSON.parse(JSON.stringify(args)) as Record<string, unknown>, 'web');
        await folder.flushed();
        return JSON.parse(JSON.stringify(r ?? {})) as T;
      },
    },
  });
}

void main();
