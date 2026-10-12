// MOR Post's page. Nothing here signs an act or holds a key of the
// identity: it asks the program, which holds them. Its requests are signed
// by this browser's own key (the desk's `api.ts` and `keystore.ts`), with
// MOR Post's domain line.

import { Client, Refused } from '../../../desk/src/page/api.ts';
import { forgetKey, loadKey } from '../../../desk/src/page/keystore.ts';
import * as v from './view.ts';

/** As the program's `DOMAIN` (`src/server.ts`). */
const DOMAIN = 'MOR post, version 1\n';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;

function say(kind: 'error' | 'done' | 'warn' | '', html: string, where?: HTMLElement | null) {
  const s = where ?? $('status');
  if (s) s.innerHTML = html ? v.note(kind, html) : '';
  if (html) s?.scrollIntoView({ block: 'nearest' });
}

function fail(err: unknown, where?: HTMLElement | null) {
  if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
    void start();
    return;
  }
  say('error', v.e(err instanceof Error ? err.message : String(err)), where);
}

const fill = (id: string, html: string) => {
  const el = $(id);
  if (el) el.innerHTML = html;
};

/** Busy: the buttons wait, so nothing is sent twice. */
async function busy<T>(words: string, f: () => Promise<T>, where?: HTMLElement | null): Promise<T | undefined> {
  say('', `<span class="small">${v.e(words)}</span>`, where);
  const was = [...app.querySelectorAll('button')].map((b) => [b, b.disabled] as const);
  app.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    return await f();
  } catch (err) {
    fail(err, where);
    return undefined;
  } finally {
    for (const [b, d] of was) b.disabled = d;
  }
}

/** The identity's card, with this app's line as it is now. */
async function line() {
  try {
    fill('identity', v.identity(await c.ask<v.State>('state')));
  } catch (err) {
    fail(err);
  }
}

async function posts() {
  fill('posts', '<p class="small">Reading your posts from the relays…</p>');
  try {
    const ps = await c.ask<v.Shown[]>('posts');
    fill('posts', ps.length ? ps.map(v.shown).join('') : '<p class="small">No post yet.</p>');
  } catch (err) {
    fill('posts', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

/** A file as base64, read in this browser. */
function base64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- clicks

app.addEventListener('click', async (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!b || b instanceof HTMLInputElement) return;
  const d = b.dataset;
  switch (d.action) {
    case 'abandon':
      if (!confirm('Forget this new identity? Nothing of it was published. A new one will show new words.')) break;
      try {
        await c.ask('abandon');
        await start();
      } catch (err) {
        fail(err);
      }
      break;
    case 'posts':
      await posts();
      break;
    case 'withdraw': {
      if (!confirm('Withdraw this picture? Readers stop showing it; the post stays. It cannot be undone.')) break;
      const r = await busy('Withdrawing…', () => c.ask<{ id: string }>('withdraw', { publication: d.publication }));
      if (r) {
        say('done', `The picture is withdrawn (act <code>${v.e(r.id.slice(0, 16))}…</code>).`);
        const pub = $('published')?.querySelector('[data-post]')?.getAttribute('data-post');
        await line();
        await posts();
        if (pub) fill('published', '<p class="small">The post above was changed: see it in the list below.</p>');
      }
      break;
    }
    case 'copy': {
      const ok = await copy(d.id ?? '');
      b.textContent = ok ? 'Copied' : 'Copy failed: select the ID';
      setTimeout(() => (b.textContent = 'Copy ID'), 2000);
      break;
    }
    case 'code': {
      const r = await busy('Making a code…', () => c.ask<{ code: string }>('code'));
      if (r) {
        say('', '');
        fill('code', v.note('', `Code for another browser, valid ten minutes, once: <span class="code">${v.e(r.code)}</span>`));
      }
      break;
    }
    case 'unpair':
      if (!confirm('Unpair this browser? It will need a new link from the app.')) break;
      try {
        await c.ask('unpair', { key: c.publicKey });
        await forgetKey();
        await start();
      } catch (err) {
        fail(err);
      }
      break;
  }
});

// ---------------------------------------------------------------- forms

const words = (s: FormDataEntryValue | null) => (typeof s === 'string' ? s.trim() : '');
const linesOf = (s: FormDataEntryValue | null) => words(s).split(/\s+/).filter(Boolean);
const viaOf = (s: FormDataEntryValue | null) => words(s).split('\n').map((x) => x.trim()).filter(Boolean);

app.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const form = ev.target as HTMLFormElement;
  const d = new FormData(form);
  switch (form.id) {
    case 'pair':
      try {
        await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: 'this browser' });
        await start();
      } catch (err) {
        fill('pair-status', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
      }
      return;
    case 'begin': {
      const r = await busy('Asking each home who runs it, and making the identity…', () =>
        c.ask<{ words: string[]; positions: number[]; say: string[] }>('begin', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: viaOf(d.get('via')) }),
      );
      // The words are on the page now and nowhere else it can reach: a reload will not show them again.
      if (r) app.innerHTML = v.words(r.words, r.positions, r.say);
      return;
    }
    case 'confirm': {
      const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
      const r = await busy('Checking the words, then sending the genesis to the homes…', () => c.ask<{ lines: v.Line[] }>('confirm', { typed }));
      if (r) {
        await start();
        say('done', `<strong>The identity is born.</strong>${v.lines(r.lines)}`);
      }
      return;
    }
    case 'bring': {
      const r = await busy('Reading the identity from its homes…', () =>
        c.ask<{ lines: v.Line[] }>('bring', {
          id: words(d.get('id')),
          words: words(d.get('words')),
          address: words(d.get('address')),
          relays: linesOf(d.get('relays')),
          via: viaOf(d.get('via')),
        }),
      );
      if (r) {
        await start();
        say('done', `<strong>The identity is here.</strong>${v.lines(r.lines)}`);
      }
      return;
    }
    case 'post': {
      const file = (form.elements.namedItem('picture') as HTMLInputElement).files?.[0];
      const r = await busy(file ? 'Stripping the picture, publishing, and reading it back…' : 'Publishing, and reading it back…', async () =>
        c.ask<{ post: v.Shown; lines: v.Line[] }>('post', { text: String(d.get('text') ?? ''), jpeg: file ? await base64(file) : '' }),
      );
      if (r) {
        form.reset();
        say('done', `<strong>Posted.</strong>${v.lines(r.lines)}`);
        fill('published', `<div class="published">${v.shown(r.post)}</div>`);
        await line();
        await posts();
      }
      return;
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
    c = await Client.open(keys, '', DOMAIN);
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
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
    if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
      app.innerHTML = v.pairing();
      return;
    }
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  if (state.stage === 'doors') app.innerHTML = v.doors();
  else if (state.stage === 'confirm') app.innerHTML = v.typeBack(state.confirm!.positions, true);
  else {
    app.innerHTML = v.ready(state);
    await posts();
  }
}

void start();
