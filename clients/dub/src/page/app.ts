// Dub's page, from the program on the Mac. Nothing here signs an act or
// holds a key of the identity: it asks the program, which holds them. Its
// requests are signed by this browser's own key (the desk's `api.ts` and
// `keystore.ts`), with Dub's domain line. Screens, clicks and forms: `ui.ts`.

import { Client, Refused } from '../../../desk/src/page/api.ts';
import { forgetKey, loadKey } from '../../../desk/src/page/keystore.ts';
import { mount } from './ui.ts';
import * as v from './view.ts';

/**
 * As the program's `DOMAIN` (`src/server.ts`). Kept from when Dub was called
 * MOR Post, so the browsers already paired with an install stay paired.
 */
const DOMAIN = 'MOR post, version 1\n';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;

const unpaired = (err: unknown) => err instanceof Refused && err.status === 401 && /not paired/.test(err.message);

const ui = mount(app, {
  web: false,
  ask: (op, a) => c.ask(op, a),
  start,
  unpaired,
  async unpair() {
    await c.ask('unpair', { key: c.publicKey });
    await forgetKey();
  },
});

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
    app.innerHTML = `${v.alone(v.note('error', 'This page keeps a key in the browser, which browsers allow only on the machine itself (http://127.0.0.1) or over https.'))}`;
    return;
  }
  let keys: CryptoKeyPair;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = `${v.alone(v.note('error', `This browser cannot make or keep an Ed25519 key (${v.e(err instanceof Error ? err.message : String(err))}). A recent Firefox, Safari or Chrome can; a private window may not keep it.`))}`;
    return;
  }
  try {
    c = await Client.open(keys, '', DOMAIN);
  } catch (err) {
    app.innerHTML = `${v.alone(v.note('error', v.e(err instanceof Error ? err.message : String(err))))}`;
    return;
  }
  // The app's link carries a one-time code in the fragment, which never leaves this browser.
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
    app.innerHTML = `${v.alone(v.note('error', v.e(err instanceof Error ? err.message : String(err))))}`;
    return;
  }
  await ui.show(state);
}

void start();
