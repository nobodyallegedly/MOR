// Ummia's web client, for testing only: the same page as the program,
// running Ummia's own code (`../ummia.ts`) in this browser. Every act is
// made and checked here by the core library's WebAssembly, and sent from
// here to the homes and relays. It reads no folder, so it makes no release,
// and follows no chain, so it checks no anchor: both said where they are.
// Every page carries the banner (`static/web.html`).

import { Ummia } from '../ummia.ts';
import { run } from '../ops.ts';
import { mount } from '../page/ui.ts';
import * as v from '../page/view.ts';
import { WebKeep } from './keep.ts';

const app = document.getElementById('app')!;
let ummia: Ummia;

const ask = <T>(op: string, a: Record<string, unknown> = {}): Promise<T> => run(ummia, op, a) as Promise<T>;
const ui = mount(app, { web: true, ask, start });

async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${v.top0(true)}${v.note('error', 'This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.')}`;
    return;
  }
  try {
    ummia ??= new Ummia(await WebKeep.open(), { web: true, releases: null, chain: null });
  } catch (err) {
    app.innerHTML = `${v.top0(true)}${v.note('error', `This browser does not let the page keep anything (${v.e(err instanceof Error ? err.message : String(err))}).`)}`;
    return;
  }
  try {
    await ui.show(await ummia.state());
  } catch (err) {
    app.innerHTML = `${v.top0(true)}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
  }
}

void start();
