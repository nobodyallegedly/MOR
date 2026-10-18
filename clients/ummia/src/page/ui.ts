// Ummia's page: its screens, clicks and forms, the same for the program
// (`app.ts`, which asks the program) and for the web client
// (`../web/app.ts`, which runs Ummia's code in this browser). It keeps one
// thing in the browser's session storage: which tab was open (`ummia:tab`),
// nothing of a key or an act.

import * as v from './view.ts';
import type { Done, Review, State } from '../shapes.ts';
import type { Tracked } from '../track.ts';

export interface Backend {
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  web: boolean;
  start(): Promise<void>;
  unpaired?(err: unknown): boolean;
}

const TABS = v.TABS.map(([k]) => k);

export function mount(app: HTMLElement, b: Backend): { show(state: State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  let state: State | null = null;
  let screen: 'window' | 'app' = 'app';
  let tab: v.Tab = 'releases';
  /** The accepted list's hashes, as last read: to mark what Tracking found as accepted. */
  let acceptedNow = new Set<string>();
  let openMip: string | null = null;

  try {
    const t = sessionStorage.getItem('ummia:tab') as v.Tab | null;
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
  const done = (r: { lines?: v.Line[]; title?: string } | undefined) => {
    if (r?.lines?.length) say('done', `${r.title ? `<b>${v.e(r.title)}</b>` : ''}${v.lines(r.lines)}`);
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
    if (s.stage === 'identity' || screen === 'window') {
      app.innerHTML = v.identityWindow(s, b.web);
      return;
    }
    app.innerHTML = v.app(s, b.web, tab);
    void b
      .ask<{ current: boolean; say: string | null }>('check')
      .then((c) => {
        const sp = $('spent');
        if (sp && !c.current && c.say) sp.innerHTML = v.spent(c.say);
      })
      .catch(() => undefined);
    await open(tab);
  }

  const body = (t: v.Tab) => $(`${t}-body`);

  async function open(t: v.Tab) {
    tab = t;
    try {
      sessionStorage.setItem('ummia:tab', t);
    } catch {
      // nothing kept
    }
    for (const x of TABS) {
      const sec = $(x);
      if (sec) sec.hidden = x !== t;
    }
    app.querySelectorAll<HTMLButtonElement>('.tabs .tab').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
    const into = body(t);
    if (!into || !state) return;
    switch (t) {
      case 'releases': {
        const r = state.releases ? await act(() => b.ask<Parameters<typeof v.releases>[1]>('releases')) : null;
        into.innerHTML = v.releases(state, r ?? null);
        return;
      }
      case 'specs': {
        const [c, p] = await Promise.all([b.ask<{ tasks: { n: number; layer: string; name: string }[] }>('spec choices'), b.ask<{ id: string; hash: string; name: string; kind: string }[]>('specs')]).catch((err) => {
          fail(err);
          return [null, null];
        });
        if (c && p) into.innerHTML = v.specs(c, p);
        return;
      }
      case 'track':
        into.innerHTML = v.trackForm(state);
        await readAccepted();
        return;
      case 'mips': {
        const m = await act(() => b.ask<Parameters<typeof v.mips>[0]>('mips'));
        if (m) into.innerHTML = v.mips(m, openMip);
        return;
      }
      case 'reports': {
        const r = await act(() => b.ask<Parameters<typeof v.reports>[0]>('reports'));
        if (r) into.innerHTML = v.reports(r);
        return;
      }
      case 'accepted': {
        const a = await act(() => b.ask<Parameters<typeof v.accepted>[0]>('accepted'));
        if (a) {
          acceptedNow = new Set(a.entries.map((x) => x.hash));
          into.innerHTML = v.accepted(a);
        }
        return;
      }
      case 'settings':
        into.innerHTML = v.settings(state);
        return;
    }
  }

  async function readAccepted() {
    try {
      acceptedNow = new Set((await b.ask<{ entries: { hash: string }[] }>('accepted')).entries.map((x) => x.hash));
    } catch {
      // without its encryption key, nothing is known as accepted
    }
  }

  /** A folder chosen or typed (as the Terminal writes it, or Finder): its name and the release before it suggested, or a near match named. */
  async function useFolder(path: string) {
    const f = $<HTMLFormElement>('release');
    const s = await act(() => b.ask<{ folder: string; name: string; previous: string | null; how: string }>('release suggest', { folder: path }));
    if (f && s) {
      (f.elements.namedItem('folder') as HTMLInputElement).value = s.folder;
      (f.elements.namedItem('name') as HTMLInputElement).value = s.name;
      (f.elements.namedItem('previous') as HTMLSelectElement).value = s.previous ?? '';
      $('picker')!.innerHTML = '';
      $('folder-said')!.textContent = `${s.folder}: ${s.how === 'git' ? 'a git folder: the files git tracks there.' : 'a plain folder: every file but hidden ones.'}`;
    }
  }

  const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');
  const all = (fd: FormData, k: string) => fd.getAll(k).map(String);
  let reviewOp: 'confirm' | 'release confirm' = 'confirm';

  app.addEventListener('change', async (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name === 'actor' && el.closest('#acting')) {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('acting', { id: el.value }));
      if (r) {
        state = await b.ask<State>('state');
        await show(state);
        done(r);
      }
      return;
    }
    if (el.name === 'folder' && el.closest('form#release') && el.value.trim()) {
      await useFolder(el.value);
      return;
    }
    if (el.id === 'spec-file' && el.files?.[0]) {
      const t = await el.files[0].text();
      const area = (el.form ?? app).querySelector<HTMLTextAreaElement>('textarea[name=text]');
      if (area) area.value = t.replace(/\r\n/g, '\n');
    }
  });

  app.addEventListener('click', async (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action],[data-tab]');
    if (!el) return;
    if (el.dataset.tab) {
      await open(el.dataset.tab as v.Tab);
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
        if (a === 'forget' && !confirm('Forget this identity here? Its key and its book go from this app. What it signed stays where it was sent.')) return;
        await act(() => b.ask(a, { id }));
        screen = a === 'use' ? 'app' : 'window';
        await show(await b.ask<State>('state'));
        return;
      }
      case 'confirm':
      case 'release confirm': {
        const r = await act(() => b.ask<Done>(a, { plan: el.dataset.plan, digest: el.dataset.digest }));
        if (r) {
          state = await b.ask<State>('state');
          await open(tab);
          done(r);
        }
        return;
      }
      case 'cancel':
        await b.ask('cancel', { plan: el.dataset.plan }).catch(() => undefined);
        el.closest('.review')?.remove();
        return;
      case 'folders': {
        const l = await act(() => b.ask<Parameters<typeof v.picker>[0]>('folders', { path: el.dataset.path ?? '' }));
        if (l) $('picker')!.innerHTML = v.picker(l);
        return;
      }
      case 'folder use':
        await useFolder(el.dataset.path ?? '');
        return;
      case 'release standing': {
        const c = await act(() => b.ask<{ met: boolean; lines: v.Line[] }>('collective release standing', { id }));
        if (c) $(`check-${id}`)!.innerHTML = v.lines(c.lines);
        return;
      }
      case 'release check': {
        const c = await act(() => b.ask<{ ok: boolean; lines: v.Line[] }>('release check', { id }));
        if (c) $(`check-${id}`)!.innerHTML = v.checked(c);
        return;
      }
      case 'anchor open': {
        const x = await act(() => b.ask<{ anchorSay: string[] }>('releases'));
        if (x) $(`anchor-${id}`)!.innerHTML = v.anchorForm(id, null, x.anchorSay);
        return;
      }
      case 'accept spec': {
        const r = await act(() => b.ask<{ lines: v.Line[] }>('accepted change', { add: [{ hash: el.dataset.hash, label: el.dataset.label }] }));
        if (r) {
          acceptedNow.add(el.dataset.hash!);
          el.replaceWith(Object.assign(document.createElement('span'), { className: 'small', textContent: 'Accepted' }));
          done(r);
        }
        return;
      }
      case 'accepted remove': {
        const r = await act(() => b.ask<{ lines: v.Line[] }>('accepted change', { remove: [el.dataset.hash] }));
        if (r) {
          await open('accepted');
          done(r);
        }
        return;
      }
      case 'accepted publish': {
        const r = await act(() => b.ask<{ lines: v.Line[] }>('accepted publish', { on: el.dataset.on === 'true' }));
        if (r) {
          await open('accepted');
          done(r);
        }
        return;
      }
      case 'mip draft': {
        const r = await act(() => b.ask<Done>('mip draft', { key: el.dataset.key }));
        if (r) {
          await open('mips');
          done(r);
        }
        return;
      }
      case 'mip replies': {
        const r = await act(() => b.ask<Parameters<typeof v.replies>[0]>('mip replies', { key: el.dataset.key }));
        if (r) $(`mip-out-${el.dataset.key}`)!.innerHTML = v.replies(r);
        return;
      }
      case 'mip prepare': {
        const r = await act(() => b.ask<Review>('mip prepare', { key: el.dataset.key }));
        if (r) $(`mip-out-${el.dataset.key}`)!.innerHTML = v.review(r);
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
    const fd = new FormData(f);
    if (fid === 'collective-add') {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('collective add', { id: str(fd, 'collective') }));
      if (r) {
        state = await b.ask<State>('state');
        await show(state);
        done(r);
      }
      return;
    }
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
    } else if (fid === 'release') {
      reviewOp = 'release confirm';
      const r = await act(() => b.ask<Review>('release prepare', { folder: str(fd, 'folder'), name: str(fd, 'name'), version: str(fd, 'version'), previous: str(fd, 'previous'), implements: str(fd, 'implements') }));
      if (r) $('release-review')!.innerHTML = v.review(r, reviewOp);
    } else if (f.classList.contains('anchor')) {
      const release = f.dataset.release!;
      const choice = str(fd, 'choice');
      if (!choice) {
        const offers = await act(() => b.ask<Parameters<typeof v.anchorForm>[1]>('anchor offers', { service: str(fd, 'service') }));
        const x = await b.ask<{ anchorSay: string[] }>('releases');
        if (offers) {
          $(`anchor-${release}`)!.innerHTML = v.anchorForm(release, offers, x.anchorSay);
          ($(`anchor-${release}`)!.querySelector('input[name=service]') as HTMLInputElement).value = str(fd, 'service');
        }
        return;
      }
      const [offer, tier] = choice.split(' ');
      const r = await act(() => b.ask<Done>('anchor ask', { release, service: str(fd, 'service'), offer, tier: Number(tier) }));
      if (r) {
        await open('releases');
        done(r);
      }
    } else if (fid === 'spec') {
      const r = await act(() =>
        b.ask<Review>('spec prepare', {
          kind: Number(str(fd, 'kind')),
          text: str(fd, 'text'),
          tasks: all(fd, 'tasks'),
          types: str(fd, 'types'),
          implements: str(fd, 'implements'),
          predecessor: str(fd, 'predecessor'),
          dependencies: str(fd, 'dependencies'),
          layers: all(fd, 'layers'),
          railKind: str(fd, 'railKind'),
          railBinds: all(fd, 'railBinds'),
          checker: fd.get('checker') === 'on',
        }),
      );
      if (r) $('spec-review')!.innerHTML = v.review(r);
    } else if (fid === 'track') {
      const out = $('track-out')!;
      out.innerHTML = '<p class="empty">Asking the relays…</p>';
      const t = await act(() => b.ask<Tracked>('track', { relays: str(fd, 'relays'), signer: str(fd, 'signer') }));
      out.innerHTML = t ? v.tracked(t, acceptedNow) : '';
    } else if (fid === 'acts') {
      const r = await act(() => b.ask<Parameters<typeof v.acts>[0]>('acts of', { spec: str(fd, 'spec'), type: str(fd, 'type'), signer: str(fd, 'signer') }));
      if (r) $('acts-out')!.innerHTML = v.acts(r);
    } else if (fid === 'mip-new') {
      const forks = str(fd, 'forks') || str(fd, 'hash');
      const r = await act(() => b.ask<{ key: string }>('mip new', { title: str(fd, 'title'), forks }));
      if (r) {
        openMip = r.key;
        await open('mips');
      }
    } else if (f.classList.contains('mip-text')) {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('mip save', { key: f.dataset.key, text: str(fd, 'text') }));
      if (r) {
        openMip = f.dataset.key!;
        $(`mip-out-${f.dataset.key}`)!.innerHTML = v.lines(r.lines);
      }
    } else if (fid === 'report') {
      const r = await act(() => b.ask<Done>('report send', { text: str(fd, 'text') }));
      if (r) {
        await open('reports');
        done(r);
      }
    } else if (fid === 'accept-add') {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('accepted change', { add: [{ hash: str(fd, 'hash'), label: str(fd, 'label') }] }));
      if (r) {
        await open('accepted');
        done(r);
      }
    } else if (fid === 'settings') {
      const r = await act(() => b.ask<{ lines: v.Line[] }>('settings', { relays: str(fd, 'relays'), track: str(fd, 'track'), reports: str(fd, 'reports') }));
      if (r) {
        state = await b.ask<State>('state');
        done(r);
      }
    }
  });

  return { show };
}
