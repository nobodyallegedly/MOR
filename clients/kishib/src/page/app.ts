// Kišib's page, from the program on the Mac or Linux. Nothing here signs an
// act or holds a word: it asks the program, which runs Kišib's code. Its
// requests are signed by this browser's own key (Edubba's `api.ts` and
// `keystore.ts`), with Kišib's domain line. Screens: `ui.ts`.

import { Client, Refused } from '../../../desk/src/page/api.ts';
import { loadKey } from '../../../desk/src/page/keystore.ts';
import { mount } from './ui.ts';
import * as v from './view.ts';

/** As the program's `DOMAIN` (`src/server.ts`). */
const DOMAIN = 'MOR Kišib, version 1\n';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;

const unpaired = (err: unknown) => err instanceof Refused && err.status === 401 && /not paired/.test(err.message);

const ui = mount(app, { web: false, ask: (op, a) => c.ask(op, a), start, unpaired });

app.addEventListener('submit', async (ev) => {
  const form = ev.target as HTMLFormElement;
  if (form.getAttribute('id') !== 'pair') return;
  ev.preventDefault();
  try {
    await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: 'this browser' });
    await start();
  } catch (err) {
    const s = $('pair-status');
    if (s) s.innerHTML = v.note('error', v.e(err instanceof Error ? err.message : String(err)));
  }
});

async function start() {
  if (!window.isSecureContext || !crypto?.subtle) {
    app.innerHTML = `${v.top()}${v.note('error', 'This page keeps a pairing key in the browser, which browsers allow only on the machine itself (http://127.0.0.1) or over https.')}`;
    return;
  }
  let keys: CryptoKeyPair;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', `This browser cannot make or keep an Ed25519 key (${v.e(err instanceof Error ? err.message : String(err))}).`)}`;
    return;
  }
  c = await Client.open(keys, '', DOMAIN);
  const linked = /^#pair=([0-9A-Za-z-]+)$/.exec(location.hash)?.[1];
  if (linked) {
    history.replaceState(null, '', location.pathname);
    try {
      await c.ask('pair', { code: linked, label: 'this browser' });
    } catch {
      // already paired, or the code was spent: the page says which below
    }
  }
  let state: v.State;
  try {
    state = await c.ask<v.State>('state');
  } catch (err) {
    if (unpaired(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  await ui.show(state);
}

void start();
