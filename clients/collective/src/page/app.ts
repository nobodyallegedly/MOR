// The collective client's page. Nothing here signs an act: it asks the
// program to prepare one, shows the program's plain-words reading of the
// exact bytes, and sends back the reading's digest only when the person
// presses Sign.

import { Client, Refused, type Done, type Reading, type Review, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;
let state: State;
let review: Review | null = null;

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
  fill('collectives', v.collectives(state));
  fill('found', v.found(state));
  fill('own-release', v.ownRelease(state));
  fill('by-id', v.byId(state));
  fill('history', v.history(state));
  fill('settings', v.settings(state));
  fill('browsers', v.browsers(state));
}

/** Busy: the buttons wait, so nothing is sent twice. */
async function busy<T>(words: string, f: () => Promise<T>): Promise<T | undefined> {
  say('', `<span class="small">${v.e(words)}</span>`);
  app.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    return await f();
  } catch (err) {
    fail(err);
    return undefined;
  } finally {
    app.querySelectorAll('button').forEach((b) => (b.disabled = false));
    if (review?.reading.blocking.length) $<HTMLButtonElement>('reading')?.querySelector<HTMLButtonElement>('[data-action=confirm]')?.setAttribute('disabled', '');
  }
}

/** Ask the program to prepare something, and show what signing it would mean. */
async function prepare(args: object) {
  const r = await busy('Preparing, and reading it back…', () => c.ask<Review>('prepare', args));
  if (!r) return;
  review = r;
  say('', '');
  fill('review', v.reading(r.reading, r));
  if (r.reading.blocking.length) $('reading')?.querySelector('[data-action=confirm]')?.setAttribute('disabled', '');
  $('reading')?.scrollIntoView({ block: 'start' });
}

function show(r: Reading) {
  review = null;
  fill('review', v.reading(r));
  $('reading')?.scrollIntoView({ block: 'start' });
}

async function after(d: Done | undefined) {
  if (!d) return;
  review = null;
  fill('review', '');
  await refresh();
  say('done', `<strong>${v.e(d.title)}</strong><ul>${d.lines.map((l) => `<li class="${v.e(l.tone ?? '')}">${v.e(l.text)}</li>`).join('')}</ul>`);
}

const words = (s: FormDataEntryValue | null) => (typeof s === 'string' ? s.trim() : '');
const linesOf = (s: FormDataEntryValue | null) => words(s).split(/\s+/).filter(Boolean);
const numberOf = (s: FormDataEntryValue | null) => (words(s) === '' ? undefined : Number(words(s)));
const rulesOf = (d: FormData) => ({
  safety: numberOf(d.get('safety')),
  release: numberOf(d.get('release')),
  clone: numberOf(d.get('clone')),
  others: numberOf(d.get('others')),
  constitution: numberOf(d.get('constitution')),
});

// ---------------------------------------------------------------- clicks

app.addEventListener('click', async (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!b) return;
  const d = b.dataset;
  switch (d.action) {
    case 'confirm': {
      if (!review) return;
      const r = review;
      await after(await busy('Signing and sending…', () => c.ask<Done>('confirm', { plan: r.plan, digest: r.digest })));
      break;
    }
    case 'cancel':
      if (review) void c.ask('cancel', { plan: review.plan }).catch(() => undefined);
      review = null;
      fill('review', '');
      say('', 'Nothing was signed.');
      break;
    case 'dismiss':
      fill('review', '');
      break;
    case 'verify': {
      const r = await busy('Fetching and checking every file…', () => c.ask<{ ok: boolean; reading: Reading }>('verify', { release: d.release }));
      if (r) {
        say('', '');
        show(r.reading);
      }
      break;
    }
    case 'sign':
      await prepare({ kind: 'sign', member: d.member, release: d.release });
      break;
    case 'leave':
      // Leaving is not a member change: a resignation, registered by the collective's record (Law rule 37a).
      await prepare({ kind: 'leave', collective: d.collective, member: d.member });
      break;
    case 'stepdown':
      await prepare({ kind: 'stepdown', collective: d.collective, member: d.member });
      break;
    case 'declare':
      // Absence, judged by the other members under the clause the member signed (Law rules 49, 53; B15).
      await prepare({ kind: 'declare', collective: d.collective, member: d.member });
      break;
    case 'check-pointer':
    case 'check-split': {
      const r = await busy('Fetching and judging…', () =>
        c.ask<{ reading: Reading }>(d.action!, d.action === 'check-split' ? { collective: d.collective, split: d.split } : { collective: d.collective }),
      );
      if (r) {
        say('', '');
        show(r.reading);
      }
      break;
    }
    case 'resend':
      await after(await busy('Sending the member change again…', () => c.ask<Done>('resend', { collective: d.collective })));
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
  if (form.id === 'new-identity') return prepare({ kind: 'identity', name: words(d.get('name')), mine: d.get('mine') === 'on' });
  if (form.id === 'own-release') return prepare({ kind: 'release', publisher: words(d.get('publisher')), version: words(d.get('version')) });
  if (form.id === 'found') {
    return prepare({ kind: 'found', name: words(d.get('name')), members: d.getAll('members').map(String), rules: rulesOf(d), words: words(d.get('words')) });
  }
  if (form.id === 'by-id') {
    const which = (ev as SubmitEvent).submitter?.getAttribute('value');
    const release = words(d.get('release'));
    const at = linesOf(d.get('at'));
    if (which === 'verify') {
      const r = await busy('Fetching and checking every file…', () => c.ask<{ ok: boolean; reading: Reading }>('verify', { release, at }));
      if (r) {
        say('', '');
        show(r.reading);
      }
      return;
    }
    return prepare({ kind: 'sign', release, at, member: words(d.get('member')) });
  }
  if (form.id === 'settings') {
    const r = await busy('Asking each home who runs it…', () =>
      c.ask('settings', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: words(d.get('via')).split('\n').map((s) => s.trim()).filter(Boolean), checkout: words(d.get('checkout')) }),
    );
    if (r) {
      await refresh();
      say('done', 'Settings saved.');
    }
    return;
  }
  if (form.classList.contains('service-pointer')) return prepare({ kind: 'pointer', owner: words(d.get('owner')), addresses: linesOf(d.get('addresses')) });
  const collective = form.dataset.collective;
  const prefixed = (p: string) => [...d.entries()].filter(([k]) => k.startsWith(p)).map(([k, x]) => [k.slice(p.length), words(x)] as [string, string]);
  if (form.classList.contains('stakes')) return prepare({ kind: 'stakes', collective, shares: Object.fromEntries(prefixed('share:').filter(([, x]) => x !== '').map(([k, x]) => [k, Number(x)])) });
  if (form.classList.contains('split-service')) return prepare({ kind: 'split-service', collective, service: words(d.get('service')) });
  if (form.classList.contains('pointer')) return prepare({ kind: 'pointer', owner: collective, addresses: linesOf(d.get('addresses')) });
  if (form.classList.contains('split')) return prepare({ kind: 'split', collective, amount: numberOf(d.get('amount')), fee: numberOf(d.get('fee')) ?? 0 });
  if (form.classList.contains('release-work')) return prepare({ kind: 'release-work', collective, release: words(d.get('release')) });
  if (form.classList.contains('fork')) {
    const sides: string[][] = [[], []];
    // "none": a member who signs no side (F124 N1).
    for (const [m, side] of prefixed('side:')) if (side !== 'none') sides[side === '2' ? 1 : 0].push(m);
    return prepare({ kind: 'fork', collective, sides });
  }
  if (form.classList.contains('debt')) return prepare({ kind: 'debt', collective, creditor: words(d.get('creditor')), amount: numberOf(d.get('amount')) });
  if (form.classList.contains('closing')) return prepare({ kind: 'closing', collective });
  if (form.classList.contains('release')) return prepare({ kind: 'release', publisher: collective, version: words(d.get('version')) });
  if (form.classList.contains('words')) return prepare({ kind: 'words', collective, text: words(d.get('text')) });
  if (form.classList.contains('change')) {
    return prepare({ kind: 'change', collective, join: d.getAll('join').map(String), leave: d.getAll('leave').map(String), rules: rulesOf(d), words: words(d.get('words')) });
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
  try {
    await refresh();
  } catch (err) {
    fail(err);
  }
}

void start();
