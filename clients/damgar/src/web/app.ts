// Damgar's web client, for testing only: the same page as the program,
// running Damgar's own code (`../damgar.ts`) in this browser. Every act is
// made and checked here by the core library's WebAssembly, and sent from
// here to the homes and relays. It follows no chain: an on-chain payment is
// shown paid, not yet checked against the chain. Every page carries the
// banner (`static/web.html`).

import { Damgar } from '../damgar.ts';
import { run } from '../ops.ts';
import { mount } from '../page/ui.ts';
import * as v from '../page/view.ts';
import { WebKeep } from './keep.ts';

const app = document.getElementById('app')!;
let damgar: Damgar;

const ask = <T>(op: string, a: Record<string, unknown> = {}): Promise<T> => run(damgar, op, a) as Promise<T>;
const ui = mount(app, { web: true, ask, start });

async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${v.top(true)}${v.note('error', 'This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.')}`;
    return;
  }
  try {
    damgar ??= new Damgar(await WebKeep.open(), { web: true, chain: null });
  } catch (err) {
    app.innerHTML = `${v.top(true)}${v.note('error', `This browser does not let the page keep anything (${v.e(err instanceof Error ? err.message : String(err))}).`)}`;
    return;
  }
  try {
    await ui.show(await damgar.state());
  } catch (err) {
    app.innerHTML = `${v.top(true)}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
  }
}

void start();
