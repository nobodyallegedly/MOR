// Damgar's page: its screens, clicks and forms, the same for the program
// (`app.ts`, which asks the program) and for the web client
// (`../web/app.ts`, which runs Damgar's code in this browser). It keeps one
// thing in the browser's session storage: which tab was open
// (`damgar:tab`), nothing of a key or a payment.

import * as v from './view.ts';
import type { Account, PaymentShown, Rails, State, ToSign } from '../shapes.ts';

export interface Backend {
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  web: boolean;
  start(): Promise<void>;
  unpaired?(err: unknown): boolean;
}

type Tab = 'sign' | 'account' | 'pay' | 'settings';
const TABS: Tab[] = ['sign', 'account', 'pay', 'settings'];

export function mount(app: HTMLElement, b: Backend): { show(state: State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  let state: State | null = null;
  let screen: 'window' | 'app' | 'accept' | 'carry' = 'app';
  let tab: Tab = 'sign';
  let timer: ReturnType<typeof setInterval> | null = null;
  /** The pointer reviewed, until published or left. */
  let reviewed: Record<string, unknown> | null = null;

  try {
    const t = sessionStorage.getItem('damgar:tab') as Tab | null;
    if (t && TABS.includes(t)) tab = t;
  } catch {
    // no session storage: the first tab
  }

  const say = (kind: 'error' | 'done' | 'warn' | '', html: string) => {
    const s = $('status');
    if (s) {
      s.innerHTML = v.note(kind, html);
      s.scrollIntoView({ block: 'nearest' });
    } else app.insertAdjacentHTML('beforeend', v.note(kind, html));
  };
  const fail = (err: unknown) => {
    if (b.unpaired?.(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    const m = err instanceof Error ? err.message : String(err);
    if (/^This identity’s signing key was changed elsewhere/.test(m)) {
      const sp = $('spent');
      if (sp) sp.innerHTML = v.spent(m);
    }
    say('error', v.e(m));
  };
  const done = (r: { lines?: v.Line[] } | undefined) => {
    if (r?.lines?.length) say('done', v.lines(r.lines));
  };

  async function act<T>(f: () => Promise<T>): Promise<T | undefined> {
    app.querySelectorAll<HTMLButtonElement>('button').forEach((x) => (x.disabled = true));
    try {
      return await f();
    } catch (err) {
      fail(err);
      return undefined;
    } finally {
      app.querySelectorAll<HTMLButtonElement>('button').forEach((x) => (x.disabled = false));
    }
  }

  async function show(s: State) {
    state = s;
    if (timer) clearInterval(timer);
    timer = null;
    if (s.stage === 'identity' || screen === 'window') {
      app.innerHTML = v.identityWindow(s, b.web);
      return;
    }
    if (s.stage === 'accept') {
      app.innerHTML = v.acceptScreen(s, b.web);
      return;
    }
    app.innerHTML = v.app(s, b.web);
    void b.ask<{ current: boolean; say: string | null }>('check').then((c) => {
      const sp = $('spent');
      if (sp && !c.current && c.say) sp.innerHTML = v.spent(c.say);
    }).catch(() => undefined);
    await open(tab);
    // While the page is in view, what arrived is looked for every 20 seconds (as Edubba's answers are).
    timer = setInterval(() => {
      if (document.visibilityState === 'visible' && tab === 'sign' && !app.querySelector('textarea:focus,input:focus')) void refreshSign(true);
    }, 20000);
  }

  async function counts() {
    const s = await b.ask<State>('state');
    state = s;
    const c = (id: string, n: number) => {
      const x = $(id);
      if (x) x.textContent = n ? String(n) : '';
    };
    c('count-sign', s.counts.toSign);
    c('count-pay', s.counts.toPay);
  }

  async function refreshSign(quiet = false) {
    const box = $('sign-list');
    if (!box) return;
    const looked = await b.ask<{ lines: v.Line[]; problems: string[] }>('look').catch((err) => {
      if (!quiet) fail(err);
      return null;
    });
    const r = await b.ask<{ items: ToSign[]; problems: string[] }>('to sign');
    const target = $('sign-list');
    if (!target) return;
    target.innerHTML = v.toSign(r.items, [...r.problems, ...(looked?.problems ?? [])]);
    if (looked?.lines.length && !quiet) say('done', v.lines(looked.lines));
    await counts();
  }

  async function open(t: Tab) {
    tab = t;
    try {
      sessionStorage.setItem('damgar:tab', t);
    } catch {
      // nothing kept
    }
    for (const x of TABS) {
      const sec = $(x);
      if (sec) sec.hidden = x !== t;
    }
    app.querySelectorAll<HTMLButtonElement>('.tabs .tab').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
    if (t === 'sign') await act(() => refreshSign());
    if (t === 'account') {
      const a = await act(() => b.ask<Account>('account'));
      if (a) $('account-body')!.innerHTML = v.account(a);
    }
    if (t === 'pay') {
      await act(() => b.ask('look'));
      const p = await act(() => b.ask<{ payments: PaymentShown[] }>('pay'));
      if (p) $('pay-list')!.innerHTML = v.payList(p.payments);
      await counts();
    }
    if (t === 'settings') {
      let r: Rails | null = null;
      let problem: string | null = null;
      try {
        r = await b.ask<Rails>('rails');
      } catch (err) {
        problem = err instanceof Error ? err.message : String(err);
      }
      $('settings-body')!.innerHTML = v.settings(state!, r, problem);
    }
  }

  const form = (f: HTMLFormElement) => new FormData(f);
  const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');

  app.addEventListener('click', async (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action],[data-tab]');
    if (!el) return;
    if (el.dataset.tab) {
      await open(el.dataset.tab as Tab);
      return;
    }
    const a = el.dataset.action!;
    const id = el.dataset.id ?? '';
    switch (a) {
      case 'window':
        screen = 'window';
        await show(await b.ask<State>('state'));
        return;
      case 'back':
        screen = 'app';
        await show(await b.ask<State>('state'));
        return;
      case 'carry': {
        const c = await act(() => b.ask<{ grouped: string; words: string[] }>('carry'));
        if (c) app.innerHTML = v.carry(c, b.web);
        return;
      }
      case 'use':
      case 'forget':
      case 'leave': {
        if (a === 'forget' && !confirm('Forget this identity here? Its keys, its request key and its account go from this app. What it signed stays where it was sent.')) return;
        await act(() => b.ask(a, { id }));
        screen = a === 'use' ? 'app' : 'window';
        await show(await b.ask<State>('state'));
        return;
      }
      case 'copy':
        try {
          await navigator.clipboard.writeText(el.dataset.text ?? '');
          el.textContent = 'Copied';
        } catch {
          el.textContent = 'Select it and copy it';
        }
        return;
      case 'look':
        await act(() => refreshSign());
        return;
      case 'sign draft':
      case 'decline':
      case 'accept debt':
      case 'pay request':
      case 'sign receipt': {
        const r = await act(() => b.ask<{ lines: v.Line[] }>(a, a === 'sign receipt' ? { key: id } : { id }));
        if (r) {
          await act(() => refreshSign(true));
          done(r);
        }
        return;
      }
      case 'refuse invoice': {
        const why = prompt('Why (sent to them, sealed)?', 'not expected') ?? '';
        const r = await act(() => b.ask<{ lines: v.Line[] }>('refuse invoice', { id, why }));
        if (r) {
          await act(() => refreshSign(true));
          done(r);
        }
        return;
      }
      case 'recheck': {
        const r = await act(() => b.ask<{ lines: v.Line[] }>('recheck', { key: el.dataset.key }));
        if (r) {
          await open('pay');
          done(r);
        }
        return;
      }
      case 'publish list': {
        const r = await act(() => b.ask<{ lines: v.Line[] }>('publish list', { on: el.dataset.on === 'true' }));
        if (r) {
          state = await b.ask<State>('state');
          await open('settings');
          done(r);
        }
        return;
      }
      case 'rails publish': {
        if (!reviewed) return;
        const r = await act(() => b.ask<{ lines: v.Line[] }>('rails publish', { ...reviewed, digest: el.dataset.digest }));
        if (r) {
          reviewed = null;
          await open('settings');
          done(r);
        }
        return;
      }
    }
  });

  app.addEventListener('submit', async (ev) => {
    const f = ev.target as HTMLFormElement;
    // Not `f.id`: a form with a field named "id" (the identity's) answers that field.
    const fid = f.getAttribute('id');
    if (fid === 'pair') return;
    ev.preventDefault();
    const fd = form(f);
    if (fid === 'bring') {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('bring', { id: str(fd, 'id'), words: str(fd, 'words'), address: str(fd, 'address'), relays: str(fd, 'relays') }));
      if (r) {
        screen = 'app';
        await show(await b.ask<State>('state'));
        done(r);
      }
    } else if (fid === 'renew') {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('renew', { words: str(fd, 'words') }));
      if (r) {
        screen = 'app';
        await show(await b.ask<State>('state'));
        done(r);
      }
    } else if (fid === 'accept') {
      const keys = [...f.querySelectorAll<HTMLInputElement>('input[name=accept]:checked')].map((x) => x.value);
      const r = await act(() => b.ask<{ lines: v.Line[] }>('accept', { keys }));
      if (r) {
        const s = await b.ask<State>('state');
        if (state?.stage === 'accept') {
          await show(s);
        } else {
          state = s;
          await open('settings');
        }
        done(r);
      }
    } else if (f.classList.contains('invoice')) {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('answer invoice', { id: f.dataset.id, invoice: str(fd, 'invoice') }));
      if (r) {
        await act(() => refreshSign(true));
        done(r);
      }
    } else if (f.classList.contains('paid')) {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('paid', { key: f.dataset.key, proof: str(fd, 'proof') }));
      if (r) {
        await open('pay');
        done(r);
      }
    } else if (fid === 'rails') {
      const a = { lightning: str(fd, 'lightning'), onchain: str(fd, 'onchain'), network: Number(str(fd, 'network') || 3), newRequestKey: fd.get('newRequestKey') === 'on' };
      const r = await act(() => b.ask<{ digest: string; lines: v.Line[]; costs: v.Line[] }>('rails review', a));
      if (r) {
        reviewed = a;
        $('rails-review')!.innerHTML = v.railsReview(r);
      }
    } else if (fid === 'relays') {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('relays', { relays: str(fd, 'relays') }));
      if (r) {
        state = await b.ask<State>('state');
        done(r);
      }
    }
  });

  return { show };
}
