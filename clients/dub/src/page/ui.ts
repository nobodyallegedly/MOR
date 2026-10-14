// Dub's page: its screens, clicks and forms, the same for the program on
// the Mac (`app.ts`, which asks the program) and for the web client
// (`../web/app.ts`, which runs Dub's code in this browser). Each gives a
// `Backend`: how to ask, and how to start again.

import * as v from './view.ts';

export interface Backend {
  /** One of Dub's operations, by name, as the program's API names them. */
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  /** The web client (F281), not the program on the Mac. */
  web: boolean;
  /** Draw the first screen again, from the state as it is now. */
  start(): Promise<void>;
  /** The program on the Mac: whether a refusal means this browser is not paired. */
  unpaired?(err: unknown): boolean;
  /** The program on the Mac: forget this browser's key. */
  unpair?(): Promise<void>;
  /** The web client: forget the identity in this browser. */
  forget?(): Promise<void>;
}

export function mount(app: HTMLElement, b: Backend): { show(state: v.State, suggested?: v.Suggested): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

  function say(kind: 'error' | 'done' | 'warn' | '', html: string, where?: HTMLElement | null) {
    const s = where ?? $('status');
    if (s) s.innerHTML = html ? v.note(kind, html) : '';
    if (html) s?.scrollIntoView({ block: 'nearest' });
  }

  function fail(err: unknown, where?: HTMLElement | null) {
    if (b.unpaired?.(err)) {
      void b.start();
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
    const was = [...app.querySelectorAll('button')].map((x) => [x, x.disabled] as const);
    app.querySelectorAll('button').forEach((x) => (x.disabled = true));
    try {
      return await f();
    } catch (err) {
      fail(err, where);
      return undefined;
    } finally {
      for (const [x, d] of was) x.disabled = d;
    }
  }

  /** The identity's card, with this app's line as it is now. */
  async function line() {
    try {
      fill('identity', v.identity(await b.ask<v.State>('state'), b.web));
    } catch (err) {
      fail(err);
    }
  }

  async function posts() {
    fill('posts', '<p class="small">Reading your posts from the relays…</p>');
    try {
      const ps = await b.ask<v.Shown[]>('posts');
      fill('posts', ps.length ? ps.map(v.shown).join('') : '<p class="small">No post yet.</p>');
    } catch (err) {
      fill('posts', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
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
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!el || el instanceof HTMLInputElement) return;
    const d = el.dataset;
    switch (d.action) {
      case 'abandon':
        if (!confirm('Forget this new identity? Nothing of it was published. A new one will show new words.')) break;
        try {
          await b.ask('abandon');
          await b.start();
        } catch (err) {
          fail(err);
        }
        break;
      case 'posts':
        await posts();
        break;
      case 'withdraw': {
        if (!confirm('Withdraw this picture? Readers stop showing it; the post stays. It cannot be undone.')) break;
        const r = await busy('Withdrawing…', () => b.ask<{ id: string }>('withdraw', { publication: d.publication }));
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
        el.textContent = ok ? 'Copied' : 'Copy failed: select the ID';
        setTimeout(() => (el.textContent = 'Copy ID'), 2000);
        break;
      }
      case 'code': {
        const r = await busy('Making a code…', () => b.ask<{ code: string }>('code'));
        if (r) {
          say('', '');
          fill('code', v.note('', `Code for another browser, valid ten minutes, once: <span class="code">${v.e(r.code)}</span>`));
        }
        break;
      }
      case 'unpair':
        if (!confirm('Unpair this browser? It will need a new link from the app.')) break;
        try {
          await b.unpair?.();
          await b.start();
        } catch (err) {
          fail(err);
        }
        break;
      case 'carry': {
        const r = await busy('Reading the identity…', () => b.ask<{ grouped: string; words: string[]; say: string[] }>('carry'));
        if (r) {
          say('', '');
          fill('carry', v.carry(r));
        }
        break;
      }
      case 'hide-carry':
        fill('carry', '');
        break;
      case 'forget':
        if (!confirm('Forget this identity in this browser? Its signing key goes with it. Only its carry words, written down, bring it back. Its posts stay published.')) break;
        try {
          await b.forget?.();
          await b.start();
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

  /** A file as base64, read in this browser. */
  function base64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  app.addEventListener('submit', async (ev) => {
    const form = ev.target as HTMLFormElement;
    // Not `form.id`: the bring form has a field named "id", which `form.id` would give instead
    // (a form's fields shadow its properties). Until 13 October 2026 the bring door never submitted from the page.
    const name = form.getAttribute('id');
    if (name === 'pair') return; // the program's own start handles it (`app.ts`)
    ev.preventDefault();
    const d = new FormData(form);
    switch (name) {
      case 'begin': {
        const r = await busy(b.web ? 'Asking each home who runs it, and making the identity in this browser…' : 'Asking each home who runs it, and making the identity…', () =>
          b.ask<{ words: string[]; positions: number[]; say: string[] }>('begin', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: viaOf(d.get('via')) }),
        );
        // The words are on the page now and nowhere else it can reach: a reload will not show them again.
        if (r) app.innerHTML = v.words(r.words, r.positions, r.say, b.web);
        return;
      }
      case 'confirm': {
        const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
        const r = await busy('Checking the words, then sending the genesis to the homes…', () => b.ask<{ lines: v.Line[] }>('confirm', { typed }));
        if (r) {
          await b.start();
          say('done', `<strong>The identity is born.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'bring': {
        const r = await busy('Reading the identity from its homes…', () =>
          b.ask<{ lines: v.Line[] }>('bring', {
            id: words(d.get('id')),
            words: words(d.get('words')),
            address: words(d.get('address')),
            relays: linesOf(d.get('relays')),
            via: viaOf(d.get('via')),
          }),
        );
        if (r) {
          await b.start();
          say('done', `<strong>The identity is here.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'post': {
        const file = (form.elements.namedItem('picture') as HTMLInputElement).files?.[0];
        const r = await busy(file ? 'Stripping the picture, publishing, and reading it back…' : 'Publishing, and reading it back…', async () =>
          b.ask<{ post: v.Shown; lines: v.Line[] }>('post', { text: String(d.get('text') ?? ''), jpeg: file ? await base64(file) : '', to: String(d.get('to') ?? '') }),
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

  return {
    async show(state, suggested) {
      if (state.stage === 'doors') app.innerHTML = v.doors(b.web, suggested);
      else if (state.stage === 'confirm') app.innerHTML = v.typeBack(state.confirm!.positions, true, b.web);
      else {
        app.innerHTML = v.ready(state, b.web);
        await posts();
      }
    },
  };
}
