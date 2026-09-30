// The management page: pair this browser once, then run the relay that
// served the page. Every request is signed with the browser's management
// key; the relay checks it (relay/src/manage.rs).

import { Manager, Refused, toHex, type Item, type Paired, type Served, type Status, type Waiting } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const where = location.origin;

let m: Manager;
let status: Status;
let items: Item[] = [];
let more = false;
const PAGE = 50;

function say(kind: 'error' | 'done' | '', text: string) {
  const s = $('status');
  if (s) s.innerHTML = text ? v.note(kind, v.e(text)) : '';
}

function fail(err: unknown) {
  if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
    void start();
    return;
  }
  say('error', err instanceof Error ? err.message : String(err));
}

const fill = (id: string, html: string) => {
  const el = $(id);
  if (el) el.innerHTML = html;
};

async function refreshStatus() {
  status = await m.ask<Status>('status');
  fill('overview', v.overview(status));
  const r = $('refreshed');
  if (r) r.textContent = `as of ${new Date().toLocaleTimeString()}`;
}

async function refreshPending() {
  if (status.role === 'home') fill('pending', v.pending(await m.ask<Waiting[]>('pending')));
}

async function refreshRecent() {
  items = await m.ask<Item[]>('recent');
  more = items.length === PAGE;
  fill('recent', v.recent(items, more));
}

/** Every section, from the relay's answers now. */
async function refresh() {
  await refreshStatus();
  const home = status.role === 'home';
  const [allowed, paired] = await Promise.all([m.ask<string[]>('allowlist'), m.ask<Paired[]>('managers')]);
  fill('allowlist', v.allowlist(allowed, status));
  fill('managers', v.managers(paired));
  await refreshRecent();
  if (home) {
    await refreshPending();
    fill('identities', v.identities(await m.ask<Served[]>('identities'), status.policy));
    fill('newcomers', v.newcomers(status));
    fill('operator', v.operator(status));
  }
}

/** Do something on the relay, then show the page as it now is. */
async function act(op: string, args: object, done: string) {
  try {
    await m.ask(op, args);
    await refresh();
    say('done', done);
  } catch (err) {
    fail(err);
  }
}

async function fileHex(id: string): Promise<string> {
  const f = $<HTMLInputElement>(id)?.files?.[0];
  if (!f) throw new Error('choose the file first');
  return toHex(new Uint8Array(await f.arrayBuffer()));
}

// ---------------------------------------------------------------- clicks

app.addEventListener('click', async (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!b) return;
  const d = b.dataset;
  switch (d.action) {
    case 'refresh':
      try {
        await refresh();
        say('', '');
      } catch (err) {
        fail(err);
      }
      break;
    case 'approve':
      await act('approve', { rotation: d.rotation }, 'Approved. Once the owner\'s client sends the rotation again, this home takes it.');
      break;
    case 'strict':
      await act(
        'strict',
        { identity: d.identity, on: d.on === 'true' },
        d.on === 'true' ? 'Rotations of that identity now wait for your approval.' : 'Rotations of that identity no longer wait for approval.',
      );
      break;
    case 'disallow':
      if (confirm('Remove this identity from the list? Under a list-only policy, the relay will refuse its new acts.'))
        await act('disallow', { identity: d.identity }, 'Removed from the list.');
      break;
    case 'no-limit':
      await act('limit', { perDay: null }, 'No limit on new identities.');
      break;
    case 'older':
      try {
        const older = await m.ask<Item[]>('recent', { before: items[items.length - 1]?.arrival });
        items = items.concat(older);
        more = older.length === PAGE;
        fill('recent', v.recent(items, more));
      } catch (err) {
        fail(err);
      }
      break;
    case 'code':
      try {
        fill('code', v.code(await m.ask<{ code: string; expires: number }>('code')));
      } catch (err) {
        fail(err);
      }
      break;
    case 'unpair': {
      const you = d.you === 'true';
      const q = you
        ? 'Unpair this browser? It will need a new code to manage this relay again.'
        : 'Unpair that browser? It will need a new code to manage this relay again.';
      if (!confirm(q)) break;
      try {
        await m.ask('unpair', { key: d.key });
        if (you) {
          await forgetKey();
          await start();
        } else {
          await refresh();
          say('done', 'Unpaired.');
        }
      } catch (err) {
        fail(err);
      }
      break;
    }
  }
});

// ---------------------------------------------------------------- forms

app.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const form = ev.target as HTMLFormElement;
  const value = (id: string) => $<HTMLInputElement>(id)?.value.trim() ?? '';
  switch (form.id) {
    case 'pair': {
      const out = $('pair-status')!;
      try {
        await m.ask('pair', { code: value('pair-code'), label: value('pair-label') });
        await start();
        say('done', 'This browser is paired.');
      } catch (err) {
        out.innerHTML = v.note('error', v.e(err instanceof Error ? err.message : String(err)));
      }
      break;
    }
    case 'allow':
      await act('allow', { identity: value('allow-identity').toLowerCase() }, 'Listed.');
      break;
    case 'limit': {
      const n = value('limit-n');
      if (!/^\d+$/.test(n)) {
        say('error', 'The limit is a whole number of new identities per 24 hours.');
        break;
      }
      await act('limit', { perDay: Number(n) }, `At most ${n} new identities in any 24 hours.`);
      break;
    }
    case 'rotate':
      await act('rotate', { closure: false, confirm: value('rotate-confirm') }, 'The operator has rotated: the home signs under its new key from now on.');
      break;
    case 'close':
      await act('rotate', { closure: true, confirm: value('close-confirm') }, 'The home is closed for good.');
      break;
    case 'rotated':
      try {
        const args = { rotation: await fileHex('rotated-rotation'), key: await fileHex('rotated-key') };
        await act('rotated', args, 'The home holds the operator\'s rotation and signs under the new key from now on.');
      } catch (err) {
        fail(err);
      }
      break;
  }
});

// ---------------------------------------------------------------- start

let timer: ReturnType<typeof setInterval> | undefined;

async function start() {
  clearInterval(timer);
  if (!window.isSecureContext || !crypto?.subtle) {
    app.innerHTML = `${v.top(null, where)}${v.note('error', 'This page signs requests with a key the browser keeps, which browsers allow only over https, or on the machine itself (http://127.0.0.1 or localhost). Open it that way.')}`;
    return;
  }
  let keys: CryptoKeyPair;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = `${v.top(null, where)}${v.note('error', `This browser cannot make or keep an Ed25519 key (${v.e(err instanceof Error ? err.message : String(err))}). A recent Firefox, Safari or Chrome can; a private window may not keep it.`)}`;
    return;
  }
  try {
    m = await Manager.open(keys);
  } catch (err) {
    app.innerHTML = `${v.top(null, where)}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  try {
    status = await m.ask<Status>('status');
  } catch (err) {
    if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
      app.innerHTML = v.pairing(m.hello.role, where);
      return;
    }
    app.innerHTML = `${v.top(null, where)}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  app.innerHTML = v.frame(status);
  try {
    await refresh();
  } catch (err) {
    fail(err);
  }
  // Keep the overview and the waiting rotations current while the page is open.
  timer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    refreshStatus()
      .then(refreshPending)
      .catch(fail);
  }, 30_000);
}

void start();
