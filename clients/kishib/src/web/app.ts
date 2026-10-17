// Kišib's web client, for testing only (to be served at kishib.dubsar.org):
// the same page as the program, running Kišib's own code (`../kishib.ts`)
// in this browser. Every act is made and checked here by the core library's
// WebAssembly, and sent from here to the homes and relays. Nothing is kept
// in this browser's storage: no database is opened, nothing is written to
// local or session storage, no cookie is set. Every page carries the banner
// (`static/web.html`).

import { Kishib } from '../kishib.ts';
import { run } from '../ops.ts';
import { mount } from '../page/ui.ts';
import * as v from '../page/view.ts';

const app = document.getElementById('app')!;
const kishib = new Kishib({ web: true });

const ask = <T>(op: string, a: Record<string, unknown> = {}): Promise<T> => run(kishib, op, a) as Promise<T>;

const ui = mount(app, { web: true, ask, start });

async function start() {
  if (!crypto?.getRandomValues) {
    app.innerHTML = `${v.top(true)}${v.note('error', 'This browser has no secure source of randomness: Kišib cannot run here.')}`;
    return;
  }
  await ui.show(kishib.state());
}

// Closing or leaving the page: overwrite what the sitting held.
addEventListener('pagehide', () => kishib.forget());

void start();
