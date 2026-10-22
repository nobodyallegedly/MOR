// Dub's web client (F281, decided by Nobody, allegedly, 13 October 2026:
// "With risks stated, for testing purpose only"). The same page as Dub on
// the Mac, running Dub's own code (`../dub.ts`) in this browser instead of
// asking a program: every act is made and checked here by the core
// library's WebAssembly, and sent from here to the homes and relays.
//
// A new identity's chain key is shown once as words and never kept; its
// signing and encryption keys are kept in this browser (`keep.ts`), with the
// signing key's words as the way out. Every page carries the banner
// (`static/web.html`).

import { Dub } from '../dub.ts';
import { run } from '../ops.ts';
import { mount } from '../page/ui.ts';
import * as v from '../page/view.ts';
import type { State, Suggested } from '../shapes.ts';
import { WebKeep } from './keep.ts';

const app = document.getElementById('app')!;
let keep: WebKeep;
let dub: Dub;

const list = (x: unknown) => (Array.isArray(x) ? x.map(String) : []);
const platform = { bytes: (b64: string) => Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0)), via: () => ({}) };

/** Dub's operations, as the program on the Mac names them, run here. */
const ask = <T>(op: string, a: Record<string, unknown> = {}): Promise<T> => run(dub, op, a, platform) as Promise<T>;

/** Addresses the deployer suggests, and the reader it names, in `dub.json` beside the page: optional, only filled in, never trusted for anything else. */
async function deployer(): Promise<Suggested & { reader?: string }> {
  try {
    const r = await fetch('dub.json', { cache: 'no-store' });
    if (!r.ok) return {};
    const j = (await r.json()) as { homes?: unknown; relays?: unknown; reader?: unknown };
    const urls = (x: unknown) => list(x).filter((s) => /^https:\/\/[^\s]+$/.test(s));
    return { homes: urls(j.homes), relays: urls(j.relays), reader: urls([j.reader])[0] };
  } catch {
    return {};
  }
}

let suggested: Suggested = {};

const ui = mount(app, { web: true, ask, start, suggested: () => suggested });

async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${v.alone(v.note('error', 'This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.'))}`;
    return;
  }
  try {
    keep ??= await WebKeep.open();
  } catch (err) {
    app.innerHTML = `${v.alone(v.note('error', `This browser does not let the page keep anything (${v.e(err instanceof Error ? err.message : String(err))}). A private window may not.`))}`;
    return;
  }
  if (!dub) {
    const d = await deployer();
    suggested = { homes: d.homes, relays: d.relays };
    dub = new Dub(keep, { web: true, reader: d.reader });
  }
  let state: State;
  try {
    state = await dub.state();
  } catch (err) {
    app.innerHTML = `${v.alone(v.note('error', v.e(err instanceof Error ? err.message : String(err))))}`;
    return;
  }
  await ui.show(state);
}

void start();
