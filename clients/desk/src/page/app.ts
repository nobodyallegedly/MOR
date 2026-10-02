// The desk's page. Nothing here signs an act: it asks the program for the
// drafts waiting, shows the program's plain-words reading of each draft's
// exact bytes, and sends back that draft's digest only when the owner
// presses Approve and sign.

import { Client, Refused, type Done, type DraftView, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;
let state: State;

function say(kind: 'error' | 'done' | 'warn' | '', html: string) {
  const s = $('status');
  if (s) s.innerHTML = html ? v.note(kind, html) : '';
  if (html) s?.scrollIntoView({ block: 'nearest' });
}

function fail(err: unknown) {
  if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
    void start();
    return;
  }
  say('error', v.e(err instanceof Error ? err.message : String(err)));
}

const fill = (id: string, html: string) => {
  const el = $(id);
  if (el) el.innerHTML = html;
};

async function refresh() {
  state = await c.ask<State>('state');
  fill('identities', v.identities(state));
  fill('history', v.history(state));
  fill('settings', v.settings(state));
  fill('browsers', v.browsers(state));
}

async function drafts() {
  fill('drafts', v.drafts(await c.ask<DraftView[]>('drafts')));
}

/** Busy: the buttons wait, so nothing is sent twice. */
async function busy<T>(words: string, f: () => Promise<T>): Promise<T | undefined> {
  say('', `<span class="small">${v.e(words)}</span>`);
  const was = [...app.querySelectorAll('button')].map((b) => [b, b.disabled] as const);
  app.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    return await f();
  } catch (err) {
    fail(err);
    return undefined;
  } finally {
    for (const [b, d] of was) b.disabled = d;
  }
}

async function after(d: Done | undefined) {
  if (!d) return;
  await refresh();
  await drafts();
  say('done', v.done(d));
}

// ---------------------------------------------------------------- clicks

app.addEventListener('click', async (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!b || b instanceof HTMLInputElement) return;
  const d = b.dataset;
  switch (d.action) {
    case 'drafts':
      await busy('Reading the drafts folder…', drafts);
      say('', '');
      break;
    case 'approve':
      await after(await busy('Signing and sending…', () => c.ask<Done>('approve', { digest: d.digest })));
      break;
    case 'decline':
      await after(await busy('Declining…', () => c.ask<Done>('decline', { digest: d.digest, note: '' })));
      break;
    case 'resend':
      await after(await busy('Sending the same act again…', () => c.ask<Done>('resend', { digest: d.digest })));
      break;
    case 'refresh': {
      const r = await busy('Opening the inbox…', () => c.ask<{ added: number; problems: string[] }>('refresh', { identity: d.identity }));
      if (r) {
        await refresh();
        say(r.problems.length ? 'warn' : 'done', `${r.added === 1 ? '1 new item' : `${r.added} new items`}.${r.problems.map((p) => `<br>${v.e(p)}`).join('')}`);
      }
      break;
    }
    case 'sort':
      try {
        await c.ask('sort', { identity: d.identity, key: d.key, sorted: d.sorted });
        await refresh();
      } catch (err) {
        fail(err);
      }
      break;
    case 'code': {
      const r = await busy('Making a code…', () => c.ask<{ code: string }>('code'));
      if (r) {
        say('', '');
        fill('code', v.note('', `Code for another browser, valid ten minutes, once: <span class="code">${v.e(r.code)}</span>`));
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
        fail(err);
      }
      break;
  }
});

app.addEventListener('change', async (ev) => {
  const t = ev.target as HTMLInputElement;
  if (t.dataset.action !== 'link') return;
  try {
    await c.ask('link', { id: t.dataset.identity, on: t.checked });
    await refresh();
    say('done', t.checked ? 'Linked to Claude.' : 'No longer linked to Claude: drafts for it are refused.');
  } catch (err) {
    fail(err);
  }
});

// ---------------------------------------------------------------- forms

const words = (s: FormDataEntryValue | null) => (typeof s === 'string' ? s.trim() : '');
const linesOf = (s: FormDataEntryValue | null) => words(s).split(/\s+/).filter(Boolean);

app.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const form = ev.target as HTMLFormElement;
  const d = new FormData(form);
  if (form.id === 'pair') {
    try {
      await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: $<HTMLInputElement>('pair-label')!.value });
      await start();
      say('done', 'This browser is paired.');
    } catch (err) {
      fill('pair-status', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
    return;
  }
  if (form.classList.contains('send-back')) {
    return after(await busy('Sending it back to Claude…', () => c.ask<Done>('send back', { digest: form.dataset.digest, note: words(d.get('note')) })));
  }
  if (form.id === 'new-identity') {
    const r = await busy('Making the identity at its homes…', () => c.ask<Done>('identity', { name: words(d.get('name')), linked: d.get('linked') === 'on' }));
    if (r) form.reset();
    return after(r);
  }
  if (form.id === 'settings') {
    const r = await busy('Asking each home who runs it…', () =>
      c.ask('settings', {
        homes: linesOf(d.get('homes')),
        relays: linesOf(d.get('relays')),
        via: words(d.get('via')).split('\n').map((s) => s.trim()).filter(Boolean),
        drafts: words(d.get('drafts')),
      }),
    );
    if (r) {
      await refresh();
      say('done', 'Settings saved.');
    }
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
    state = await c.ask<State>('state');
  } catch (err) {
    if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
      app.innerHTML = v.pairing();
      return;
    }
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  app.innerHTML = v.frame();
  fill('new', v.newIdentity());
  try {
    await refresh();
    await drafts();
  } catch (err) {
    fail(err);
  }
}

void start();
