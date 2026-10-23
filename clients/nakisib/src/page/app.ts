// Nakišib's page in its window: it asks Nakišib's program on this Mac
// (127.0.0.1, the same origin, nothing else) and draws what it answers.
// It keeps nothing: no browser storage, ever; a field holding words is
// emptied as soon as they are sent.

import * as v from './view.ts';
import { attachColumn } from '../../../kit/src/dom.ts';

const app = document.getElementById('app')!;
let view: 'home' | 'rotation' | 'first' | 'signed' = 'home';
/** Whether this Mac has its own file dialog (no: a path is typed). */
let typedPaths = false;
let shownWords: v.Shown | null = null;
let message = '';

async function ask<T>(op: string, body: Record<string, unknown> = {}): Promise<T> {
  const r = await fetch(`/api/${op}`, { method: 'POST', headers: { 'x-nakisib': '1', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? 'refused');
  return j as T;
}

async function draw(): Promise<void> {
  const s = await ask<v.State>('state');
  if (view === 'home') {
    app.innerHTML = v.home();
    return;
  }
  let pane = '';
  if (view === 'signed') {
    const m = await ask<{ signed: v.Signed[] }>('memory');
    pane = v.signedList(m.signed, typedPaths);
  } else if (view === 'rotation') {
    if (s.kind !== 'rotation') pane = v.rotationStart(typedPaths);
    else if (s.stage === 'read') pane = v.preview(s);
    else if (s.stage === 'review') pane = v.reviewed(s);
    else if (s.stage === 'paper' && shownWords) pane = v.shown(shownWords, false);
    else if (s.stage === 'shown') pane = v.askBack(s.asked ?? [], false, s.preview?.summary ? isHex() : false);
    else if (s.stage === 'sign') pane = v.signScreen(s);
    else if (s.stage === 'signed' || s.stage === 'written') pane = v.signed(s, typedPaths);
    else pane = v.reviewed(s);
  } else {
    if (s.kind !== 'first') pane = v.firstStart();
    else if (s.stage === 'paper' && shownWords) pane = v.shown(shownWords, true);
    else if (s.stage === 'shown') pane = v.askBack(s.asked ?? [], true, s.module === 'hex');
    else if (s.stage === 'ready' || s.stage === 'written') pane = v.firstReady(s, typedPaths);
    else pane = v.firstStart();
  }
  app.innerHTML = v.frame(view, (message ? v.error(message) : '') + pane);
  message = '';
  attachColumn(app, (key) => go(key as typeof view));
}

let hexPaper = false;
const isHex = () => hexPaper;

function go(to: typeof view) {
  view = to;
  void draw();
}

async function act(f: () => Promise<unknown>) {
  try {
    await f();
  } catch (x) {
    if (x instanceof Error && x.message === 'ended') return;
    message = x instanceof Error ? x.message : String(x);
  }
  await draw();
}

/** A file chosen in the Mac's dialog; null where the page must ask for a path, or nothing was chosen. */
async function chosen(forWrite: boolean, name: string): Promise<string | null> {
  const r = await ask<{ path: string | null; dialog: boolean }>('choose', { for: forWrite ? 'write' : 'read', name });
  if (!r.dialog) {
    typedPaths = true;
    return null;
  }
  return r.path;
}

async function withFile(action: string, path: string, data: DOMStringMap) {
  if (action === 'read') await ask('read', { path });
  else if (action === 'write') await ask('write', { path });
  else if (action === 'again') {
    const r = await ask<{ written: string }>('again', { path, act: data.act ?? pendingAct });
    message = '';
    alertDone = `Written again to ${r.written}.`;
  }
}

let pendingAct = '';
let alertDone = '';

app.addEventListener('click', (ev) => {
  const t = (ev.target as HTMLElement).closest<HTMLElement>('[data-action],[data-k-tile]');
  if (!t) return;
  if (t.dataset.kTile) return go(t.dataset.kTile as typeof view);
  const a = t.dataset.action!;
  void act(async () => {
    switch (a) {
      case 'home':
        view = 'home';
        return;
      case 'forget':
        shownWords = null;
        await ask('forget');
        return;
      case 'quit':
        shownWords = null;
        await ask('quit');
        app.innerHTML = '<div class="nk-pane"><h2>Nakišib has ended</h2><p>It forgot everything it held. Close this window.</p></div>';
        throw new Error('ended');
      case 'same':
        await ask('same');
        return;
      case 'show': {
        shownWords = await ask<v.Shown>('show');
        hexPaper = shownWords.module === 'hex';
        return;
      }
      case 'hide':
        shownWords = null;
        await ask('hide');
        return;
      case 'first':
        await ask('first', { module: t.dataset.module });
        shownWords = await ask<v.Shown>('show');
        hexPaper = shownWords.module === 'hex';
        return;
      case 'read':
      case 'write':
      case 'again': {
        if (a === 'again') pendingAct = t.dataset.act ?? '';
        const name = a === 'read' ? '' : view === 'first' ? 'nakisib-commitment.mor' : 'nakisib-answer.mor';
        const p = (await chosen(a !== 'read', name)) ?? (typedPaths ? document.querySelector<HTMLInputElement>(`form[data-path="${a}"] input[name=path]`)?.value.trim() || null : null);
        if (p) await withFile(a, p, t.dataset);
        else if (typedPaths) throw new Error('This Mac shows no file dialog here: type the file’s path in the field below, then press the button again.');
        return;
      }
    }
  }).then(() => {
    if (alertDone) {
      const n = document.getElementById('pane');
      n?.insertAdjacentHTML('afterbegin', `<div class="k-note k-done" role="status">${alertDone}</div>`);
      alertDone = '';
    }
  });
});

app.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const f = ev.target as HTMLFormElement;
  const data = new FormData(f);
  // Words leave the field at once: the field is emptied before anything else.
  const values = [...f.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')].map((i) => {
    const x = i.value;
    i.value = '';
    return [i.name, x] as const;
  });
  void act(async () => {
    if (f.id === 'paper') {
      const w = values.find(([n]) => n === 'words')?.[1] ?? '';
      hexPaper = w.trim().split(/\s+/).length !== 24;
      await ask('paper', { words: w });
    } else if (f.id === 'typed') {
      await ask('typed', { typed: values.map(([, x]) => x) });
    } else if (f.id === 'sign') {
      await ask('sign', { word: values[0]?.[1] ?? '' });
    } else if (f.dataset.path) {
      await withFile(f.dataset.path, String(data.get('path') ?? values[0]?.[1] ?? ''), { act: pendingAct });
    }
  }).then(() => {
    if (alertDone) {
      document.getElementById('pane')?.insertAdjacentHTML('afterbegin', `<div class="k-note k-done" role="status">${alertDone}</div>`);
      alertDone = '';
    }
  });
});

// Whether this Mac has a file dialog: asked once, quietly, by a choice that is never shown (no file is opened).
void (async () => {
  if (!/Mac/.test(navigator.platform)) typedPaths = true;
  await draw();
})();
