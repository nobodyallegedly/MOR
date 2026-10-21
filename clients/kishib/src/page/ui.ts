// Kišib's page: its screens, clicks and forms, the same for the program on
// the Mac and Linux (`app.ts`, which asks the program) and for the web
// client (`../web/app.ts`, which runs Kišib's code in this browser). It
// keeps nothing in the browser's storage, not even which screen was open.

import * as v from './view.ts';

export interface Backend {
  /** One of Kišib's operations, by name (`../ops.ts`). */
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  web: boolean;
  start(): Promise<void>;
  unpaired?(err: unknown): boolean;
}

export function mount(app: HTMLElement, b: Backend): { show(state: v.State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  /** The review on screen, until signed or dropped. */
  let current: { review: v.Review; must: boolean } | null = null;

  const fail = (err: unknown) => {
    if (b.unpaired?.(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    const s = $('status');
    const html = v.note('error', v.e(err instanceof Error ? err.message : String(err)));
    if (s) {
      s.innerHTML = html;
      s.scrollIntoView({ block: 'nearest' });
    } else app.insertAdjacentHTML('beforeend', html);
  };

  const busy = (on: boolean) => app.querySelectorAll<HTMLButtonElement>('button').forEach((x) => (x.disabled = on || x.dataset.blocked === '1'));

  async function act<T>(f: () => Promise<T>): Promise<T | undefined> {
    busy(true);
    try {
      return await f();
    } catch (err) {
      fail(err);
      return undefined;
    } finally {
      app.querySelectorAll<HTMLButtonElement>('button').forEach((x) => {
        if (x.dataset.action === 'sign' && current?.review.blocking.length) return;
        x.disabled = false;
      });
    }
  }

  async function show(state: v.State) {
    current = null;
    v.setUnits(state.units);
    if (!state.sitting) {
      app.innerHTML = v.start(b.web);
      return;
    }
    if (state.sitting.stage === 'shown' && state.sitting.positions) {
      app.innerHTML = v.askBack(state.sitting.positions, b.web);
      return;
    }
    app.innerHTML = v.sitting(state.sitting, b.web);
  }

  const values = (form: HTMLFormElement): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (!el.name) continue;
      out[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    }
    return out;
  };

  /** Clear every field that held words, once they were sent. */
  const clear = (form: HTMLFormElement) => (Array.from(form.elements) as HTMLInputElement[]).forEach((el) => el.tagName === 'TEXTAREA' && (el.value = ''));

  const OPS: Record<string, string> = { rotate: 'rotate plan', escape: 'escape plan', confirm: 'confirm plan', start: 'collective start', give: 'collective give' };

  app.addEventListener('change', (ev) => {
    const t = ev.target as HTMLInputElement;
    if (t.name === 'room') {
      const remote = app.querySelector<HTMLElement>('[data-remote]');
      if (remote) {
        remote.hidden = t.checked;
        remote.querySelectorAll<HTMLInputElement>('input,textarea').forEach((x) => (x.required = !t.checked));
      }
    }
  });

  app.addEventListener('submit', async (ev) => {
    const form = ev.target as HTMLFormElement;
    const id = form.getAttribute('id') ?? '';
    if (id === 'pair') return;
    ev.preventDefault();
    const a = values(form);
    if (id.startsWith('form-')) {
      const kind = form.dataset.kind!;
      if (kind === 'check' || kind === 'record') {
        const r = await act(() => b.ask<{ title: string; lines?: v.Line[]; sections?: v.Section[] }>(kind === 'check' ? 'check words' : 'record', a));
        if (!r) return;
        clear(form);
        $('status')!.innerHTML = `<div class="review"><h3>${v.e(r.title)}</h3>${r.lines ? v.lines(r.lines) : v.sections(r.sections ?? [])}</div>`;
        return;
      }
      const r = await act(() => b.ask<v.Review>(OPS[kind], a));
      if (!r) return;
      clear(form);
      current = { review: r, must: kind === 'start' };
      app.innerHTML = v.review(r, b.web, current.must);
      window.scrollTo(0, 0);
      return;
    }
    if (id === 'typed') {
      const typed = Object.keys(a)
        .sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)))
        .map((k) => String(a[k]));
      const s = await act(() => b.ask<v.State>('words typed', { typed }));
      if (s) await show(s);
      return;
    }
    if (id === 'paper') {
      const s = await act(() => b.ask<v.State>('collective paper', a));
      if (s) await show(s);
    }
  });

  app.addEventListener('click', async (ev) => {
    const t = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!t) return;
    const action = t.dataset.action!;
    switch (action) {
      case 'open':
        app.innerHTML = v.form(t.dataset.form!, b.web);
        return;
      case 'home': {
        const s = await act(() => b.ask<v.State>('forget'));
        if (s) await show(s);
        return;
      }
      case 'read request': {
        const form = t.closest('form') as HTMLFormElement;
        const a = values(form);
        const r = await act(() => b.ask<{ title: string; sections: v.Section[] }>('collective read', { collective: a.collective, fingerprint: a.fingerprint, address: a.address }));
        if (r) $('request')!.innerHTML = `<div class="review"><h3>${v.e(r.title)}</h3>${v.sections(r.sections)}</div>`;
        return;
      }
      case 'sign': {
        if (!current) return;
        if (current.must && !$<HTMLInputElement>('read-it')?.checked) return fail(new Error('Read what this device will hold, and say so, before anything is done.'));
        const warned = current.review.warning ? ($<HTMLInputElement>('warned')?.checked ? current.review.warning : undefined) : undefined;
        if (current.review.warning && !warned) return fail(new Error('A line of acts would be left out, or cannot be placed: read the warning in red and tick it, or go back and give its card.'));
        const s = await act(() => b.ask<v.State>('confirm', { plan: current!.review.plan, digest: current!.review.digest, ...(warned ? { warned } : {}) }));
        if (s) await show(s);
        return;
      }
      case 'refresh':
      case 'resend':
      case 'gather':
      case 'rotate collective': {
        const op = action === 'gather' ? 'collective gather' : action === 'rotate collective' ? 'collective rotate' : action;
        const s = await act(() => b.ask<v.State>(op));
        if (s) await show(s);
        return;
      }
      case 'show words': {
        const w = await act(() => b.ask<{ words: string[]; say: string[]; holder?: string; which?: 'chain' | 'signing' }>('words show'));
        if (w) app.innerHTML = v.wordsShown(w.words, w.say, b.web, w.holder ? 'The collective’s new signing key’s words' : w.which === 'chain' ? 'The new chain key’s words: a new paper' : 'The new signing key’s words');
        return;
      }
      case 'written': {
        if (app.querySelector('#words[data-share]')) {
          const holder = (app.querySelector('#words') as HTMLElement).dataset.share!;
          const s = await act(() => b.ask<v.State>('collective share written', { holder }));
          if (s) await show(s);
          return;
        }
        const s = await act(() => b.ask<v.State>('words written'));
        if (s) await show(s);
        return;
      }
      case 'show share': {
        const holder = t.dataset.holder!;
        const r = await act(() => b.ask<{ x: number; words: string[]; fingerprint: string; say: string[] }>('collective share', { holder }));
        if (!r) return;
        app.innerHTML = v.wordsShown(r.words, [...r.say, `Share number ${r.x}. The new dealing’s fingerprint: ${r.fingerprint}.`], b.web, `New share ${r.x} of the collective’s chain key`);
        app.querySelector('#words')!.setAttribute('data-share', holder);
        return;
      }
    }
  });

  return { show };
}
