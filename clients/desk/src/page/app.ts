// The desk's page. Nothing here signs an act: it asks the program for the
// drafts waiting, shows the program's plain-words reading of each draft's
// exact bytes, and sends back that draft's digest only when the owner
// presses Approve and sign.

import { Client, Refused, type Done, type DraftView, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;
let state: State;

/**
 * Say something where the person is looking: in the place given (beside
 * what they clicked), or at the top of the page.
 */
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

/** The status place on an identity's card. */
const hereFor = (id: string | undefined) => (id ? app.querySelector<HTMLElement>(`.here[data-here="${CSS.escape(id)}"]`) : null);

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

/** The drafts on the page, by digest, to see when the folder has others. */
let shown = '';

async function drafts() {
  const ds = await c.ask<DraftView[]>('drafts');
  // A note being written to send a draft back is kept across the redraw.
  const notes = new Map<string, string>();
  app.querySelectorAll<HTMLFormElement>('form.send-back').forEach((f) => {
    const t = f.querySelector('textarea');
    if (t?.value) notes.set(f.dataset.digest ?? '', t.value);
  });
  fill('drafts', v.drafts(ds));
  for (const [digest, note] of notes) {
    const t = app.querySelector<HTMLTextAreaElement>(`form.send-back[data-digest="${CSS.escape(digest)}"] textarea`);
    if (t) t.value = note;
  }
  shown = ds.map((d) => d.digest).join(',');
  fill('drafts-watch', v.WATCHING);
}

let working = false;

/**
 * New drafts appear by themselves: every few seconds, while the page is
 * in view and nothing else is under way, the program is asked which
 * drafts wait (the folder alone, no relay), and the drafts are read again
 * only when that list changed.
 */
async function watch() {
  if (working || !c || document.visibilityState !== 'visible' || !$('drafts')) return;
  try {
    const waiting = await c.ask<string[]>('waiting');
    if (working || waiting.join(',') === shown) return;
    const before = new Set(shown.split(','));
    await drafts();
    const fresh = waiting.filter((d) => !before.has(d)).length;
    if (fresh) fill('drafts-watch', fresh === 1 ? 'A new draft from Claude arrived, below.' : `${fresh} new drafts from Claude arrived, below.`);
  } catch (err) {
    if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) fail(err);
    // Otherwise, the next look tries again.
  }
}

/** Busy: the buttons wait, so nothing is sent twice. */
async function busy<T>(words: string, f: () => Promise<T>, where?: HTMLElement | null): Promise<T | undefined> {
  say('', `<span class="small">${v.e(words)}</span>`, where);
  working = true;
  const was = [...app.querySelectorAll('button')].map((b) => [b, b.disabled] as const);
  app.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    return await f();
  } catch (err) {
    fail(err, where);
    return undefined;
  } finally {
    for (const [b, d] of was) b.disabled = d;
    working = false;
  }
}

/** Copy text, with the clipboard where the browser allows it, else by a selection. */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.append(t);
    t.select();
    const ok = document.execCommand('copy');
    t.remove();
    return ok;
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
      const r = await busy('Opening the inbox…', () => c.ask<{ added: number; problems: string[] }>('refresh', { identity: d.identity }), hereFor(d.identity));
      if (r) {
        await refresh();
        say(r.problems.length ? 'warn' : 'done', `${r.added === 1 ? '1 new item' : `${r.added} new items`}.${r.problems.map((p) => `<br>${v.e(p)}`).join('')}`, hereFor(d.identity));
      }
      break;
    }
    case 'copy': {
      const id = d.id ?? '';
      const ok = await copy(id);
      b.textContent = ok ? 'Copied' : 'Copy failed: select the fingerprint';
      setTimeout(() => (b.textContent = 'Copy ID'), 2000);
      break;
    }
    case 'link': {
      const on = d.on === 'true';
      try {
        await c.ask('link', { id: d.identity, on });
        await refresh();
        say(
          'done',
          on ? 'Saved: Claude may now prepare drafts for this identity.' : 'Saved: Claude may no longer prepare drafts for this identity; drafts for it are refused.',
          hereFor(d.identity),
        );
      } catch (err) {
        fail(err, hereFor(d.identity));
      }
      break;
    }
    case 'witness':
      // Nothing is signed by this click: it shows what a witness act does.
      say('', v.witnessAsk(d.identity!, d.act!), hereFor(d.identity));
      break;
    case 'witness-cancel':
      say('', '', hereFor(d.identity));
      break;
    case 'witness-sign': {
      const r = await busy('Signing the witness act…', () => c.ask<{ id: string }>('witness', { identity: d.identity, act: d.act, shown: WITNESS_EXPLANATION }), hereFor(d.identity));
      if (r) say('done', `Witness act ${v.e(r.id.slice(0, 16))}… signed and sent.`, hereFor(d.identity));
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
    const r = await busy(
      'Asking each home who runs it…',
      () =>
      c.ask('settings', {
        homes: linesOf(d.get('homes')),
        relays: linesOf(d.get('relays')),
        via: words(d.get('via')).split('\n').map((s) => s.trim()).filter(Boolean),
        drafts: words(d.get('drafts')),
      }),
      $('settings-status'),
    );
    if (r) {
      await refresh();
      say('done', 'Settings saved.', $('settings-status'));
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

setInterval(() => void watch(), 4000);
document.addEventListener('visibilitychange', () => void watch());
void start();
