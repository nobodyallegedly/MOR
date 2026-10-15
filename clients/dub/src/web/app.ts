// Dub's web client (F281, decided by Nobody, allegedly, 13 October 2026:
// "With risks stated, for testing purpose only"). The same page as Dub on
// the Mac, running Dub's own code (`../dub.ts`) in this browser instead of
// asking a program: every act is made and checked here by the core
// library's WebAssembly, and sent from here to the homes and relays.
//
// A new identity's chain key is shown once as words and never kept; its
// signing key is kept in this browser (`keep.ts`), with the carry words as
// the way out. Every page carries the banner (`static/web.html`).

import { Dub } from '../dub.ts';
import { mount } from '../page/ui.ts';
import * as v from '../page/view.ts';
import { WebKeep } from './keep.ts';

const app = document.getElementById('app')!;
let keep: WebKeep;
let dub: Dub;

const text = (x: unknown) => (typeof x === 'string' ? x : '');
const list = (x: unknown) => (Array.isArray(x) ? x.map(String) : []);
const bytes = (b64: string) => Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));

/** Dub's operations, as the program on the Mac names them, run here. */
async function ask<T>(op: string, a: Record<string, unknown> = {}): Promise<T> {
  switch (op) {
    case 'state':
      return (await dub.state()) as T;
    case 'begin':
      return (await dub.begin({ homes: list(a.homes), relays: list(a.relays) })) as T;
    case 'confirm':
      return (await dub.confirm(list(a.typed))) as T;
    case 'abandon':
      return (await dub.abandon()) as T;
    case 'bring':
      return (await dub.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list(a.relays) })) as T;
    case 'post':
      return (await dub.post({ text: text(a.text), jpeg: text(a.jpeg) ? bytes(text(a.jpeg)) : undefined, to: text(a.to) })) as T;
    case 'posts':
      return (await dub.posts()) as T;
    case 'withdraw':
      return (await dub.withdraw(text(a.publication))) as T;
    case 'carry':
      return (await dub.carry()) as T;
    default:
      throw new Error(`unknown operation ${op}`);
  }
}

/** Addresses the deployer suggests, in `dub.json` beside the page: optional, only filled in, never trusted for anything else. */
async function suggested(): Promise<v.Suggested> {
  try {
    const r = await fetch('dub.json', { cache: 'no-store' });
    if (!r.ok) return {};
    const j = (await r.json()) as { homes?: unknown; relays?: unknown };
    const urls = (x: unknown) => list(x).filter((s) => /^https:\/\/[^\s]+$/.test(s));
    return { homes: urls(j.homes), relays: urls(j.relays) };
  } catch {
    return {};
  }
}

const ui = mount(app, {
  web: true,
  ask,
  start,
  forget: () => keep.forget(),
});

async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${v.top(true)}${v.note('error', 'This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.')}`;
    return;
  }
  try {
    keep ??= await WebKeep.open();
  } catch (err) {
    app.innerHTML = `${v.top(true)}${v.note('error', `This browser does not let the page keep anything (${v.e(err instanceof Error ? err.message : String(err))}). A private window may not.`)}`;
    return;
  }
  dub ??= new Dub(keep, { web: true });
  let state: v.State;
  try {
    state = (await dub.state()) as v.State;
  } catch (err) {
    app.innerHTML = `${v.top(true)}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  await ui.show(state, state.stage === 'doors' ? await suggested() : undefined);
}

void start();
