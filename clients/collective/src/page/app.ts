// The collective client's page. Nothing here signs an act: it asks the
// program to prepare one, shows the program's plain-words reading of the
// exact bytes, and sends back the reading's digest only when the person
// presses Sign (`mount.ts`, shared with Edubba's Constitution sub-tab).
//
// Retired as the person's page on 16 October 2026 (F333): Edubba
// (clients/desk) takes the collective client in. This page stays for the
// collective client's own tests, and as the library's reference page.

import { Client, Refused, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import { mount, type Mounted } from './mount.ts';
import * as v from './view.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;
let m: Mounted;

const unpaired = (err: unknown) => err instanceof Refused && err.status === 401 && /not paired/.test(err.message);

function say(kind: 'error' | 'done' | 'warn' | '', html: string) {
  const s = $('status');
  if (s) s.innerHTML = html ? v.note(kind, html) : '';
}

const fill = (id: string, html: string) => {
  const el = $(id);
  if (el) el.innerHTML = html;
};

async function refresh() {
  await m.refresh();
  const state = m.state()!;
  fill('browsers', v.browsers(state));
}

// The page's own: pairing, codes for another browser, unpairing.
app.addEventListener('click', async (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!b) return;
  const d = b.dataset;
  switch (d.action) {
    case 'code': {
      try {
        const r = await c.ask<{ code: string }>('code');
        say('', '');
        fill('code', v.note('', `Code for another browser, valid ten minutes, once: <span class="code">${v.e(r.code)}</span>`));
      } catch (err) {
        say('error', v.e(err instanceof Error ? err.message : String(err)));
      }
      break;
    }
    case 'unpair':
      if (!confirm(d.you === 'true' ? 'Unpair this browser? It will need a new link from the launcher.' : 'Unpair that browser?')) break;
      try {
        await c.ask('unpair', { key: d.key });
        if (d.you === 'true') {
          await forgetKey();
          await start();
        } else await refresh();
      } catch (err) {
        say('error', v.e(err instanceof Error ? err.message : String(err)));
      }
      break;
  }
});

app.addEventListener('submit', async (ev) => {
  const form = ev.target as HTMLFormElement;
  if (form.id !== 'pair') return;
  ev.preventDefault();
  try {
    await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: $<HTMLInputElement>('pair-label')!.value });
    await start();
    say('done', 'This browser is paired.');
  } catch (err) {
    fill('pair-status', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
});

// ---------------------------------------------------------------- start

async function start() {
  if (!window.isSecureContext || !crypto?.subtle) {
    app.innerHTML = `${v.top()}${v.note('error', 'This page keeps a key in the browser, which browsers allow only on the machine itself (http://127.0.0.1) or over https.')}`;
    return;
  }
  let keys: CryptoKeyPair;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', `This browser cannot make or keep an Ed25519 key (${v.e(err instanceof Error ? err.message : String(err))}). A recent Firefox, Safari or Chrome can; a private window may not keep it.`)}`;
    return;
  }
  try {
    c = await Client.open(keys);
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  // The launcher's link carries a one-time code in the fragment, which never leaves this browser.
  const linked = /^#pair=([0-9A-Za-z-]+)$/.exec(location.hash)?.[1];
  if (linked) {
    history.replaceState(null, '', location.pathname);
    try {
      await c.ask('pair', { code: linked, label: 'this browser' });
    } catch {
      // already paired, or the code was spent: the page says which below
    }
  }
  try {
    await c.ask<State>('state');
  } catch (err) {
    if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
      app.innerHTML = v.pairing();
      return;
    }
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  app.innerHTML = v.frame();
  m = mount(app, {
    ask: (op, args) => c.ask(op, args),
    fail: (err) => {
      if (!unpaired(err)) return false;
      void start();
      return true;
    },
    done: () => refresh(),
  });
  try {
    await refresh();
  } catch (err) {
    say('error', v.e(err instanceof Error ? err.message : String(err)));
  }
}

void start();
