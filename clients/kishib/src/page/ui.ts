// Kišib's page: its screens, clicks and forms, on the kit, the same for the
// program on the Mac and Linux (`app.ts`, which asks the program) and for
// the web client (`../web/app.ts`, which runs Kišib's code in this
// browser). It keeps nothing in the browser's storage, not even which
// screen was open: a reload opens on the four tiles.

import { ask, attachCards, attachClosing, attachColumn, attachContacts, attachIds, card, cardsUntimed, ownId, Popup, stampCards, type KitAct, type Named } from '../../../kit/src/index.ts';
import { actFormOf } from '../../../dub/src/page/view.ts';
import * as v from './view.ts';

export interface Backend {
  /** One of Kišib's operations, by name (`../ops.ts`, and the runner's on the program). */
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  web: boolean;
  start(): Promise<void>;
  unpaired?(err: unknown): boolean;
}

type ProgramState = v.State & { runner?: v.RunnerView };

export function mount(app: HTMLElement, b: Backend): { show(state: ProgramState): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  app.classList.add('k-page', 'k-kishib');
  let state: ProgramState | null = null;
  let runner: v.RunnerView | null = null;
  /** The tile open, and its part; null: the four tiles. */
  let tab: v.Tab | null = null;
  let part: string | null = null;
  /** The quiet door opened, for this visit of the tab only. */
  let door: v.Tab | null = null;
  /** The review on screen, until signed or dropped. */
  let current: { review: v.Review; must: boolean } | null = null;
  const popup = new Popup(app);
  attachClosing();

  const errorOf = (err: unknown) => (err instanceof Error ? err.message : String(err));
  const fail = (err: unknown) => {
    if (b.unpaired?.(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    const s = $('status') ?? $('result');
    const html = v.note('error', v.said(errorOf(err)));
    if (s) {
      s.innerHTML = html;
      s.scrollIntoView({ block: 'nearest' });
    } else app.insertAdjacentHTML('beforeend', `<div id="status" class="k-status">${html}</div>`);
  };
  const done = (html: string) => {
    const s = $('status');
    if (s) s.innerHTML = v.note('done', html);
  };
  /** Said after a change of the contacts (H100), on whatever screen is open. */
  const tell = (kind: 'done' | 'error', html: string) => {
    const s = $('status');
    if (s) s.innerHTML = v.note(kind, html);
    else app.insertAdjacentHTML('beforeend', `<div id="status" class="k-status">${v.note(kind, html)}</div>`);
  };

  async function act<T>(f: () => Promise<T>): Promise<T | undefined> {
    const was = [...app.querySelectorAll('button')].map((x) => [x, x.disabled] as const);
    app.querySelectorAll('button').forEach((x) => (x.disabled = true));
    try {
      return await f();
    } catch (err) {
      fail(err);
      return undefined;
    } finally {
      for (const [x, d] of was) if (x.isConnected) x.disabled = d;
    }
  }

  // ---------------------------------------------------------------- drawing

  function draw(pane?: string) {
    const r = b.web ? null : runner;
    if (!tab) {
      app.innerHTML = v.home(b.web, r);
      return;
    }
    if ((tab === 'paper' || tab === 'collectives') && door !== tab && !state?.sitting) {
      app.innerHTML = v.door(b.web, tab, r);
      return;
    }
    app.innerHTML = v.tabPage(b.web, tab, part, pane ?? v.part(tab, part ?? '', b.web, r), r);
    if (tab === 'runner' && part === 'signed') drawSigned();
  }

  /** Where the state says Kišib stands: a sitting in its tab, or what was open. */
  async function show(s: ProgramState) {
    state = s;
    current = null;
    if (s.runner) runner = s.runner;
    v.setUnits(s.units);
    const st = s.sitting;
    if (st) {
      tab = v.tabOf(st);
      door = tab;
      if (st.stage === 'shown' && st.positions) return draw(v.askBack(st.positions, st.kind === 'identity' ? (st.words === 'signing' ? 4 : 2) : null));
      return draw(v.sitting(st));
    }
    draw();
  }

  function openTab(t: v.Tab) {
    if (state?.sitting && v.tabOf(state.sitting) !== t && state.sitting.stage !== 'done') {
      // An act in progress stays where it is: one act at a time.
      tab = v.tabOf(state.sitting);
      void show(state);
      return fail(new Error('Kišib is in the middle of an act: finish it, or forget it (Cancel), first. One act at a time.'));
    }
    tab = t;
    part = v.firstPart(t, runner, b.web);
    if (door !== t) door = null;
    draw();
  }

  // ---------------------------------------------------------------- what the runner signed: cards with the kit's two menus

  const drawn = new Map<string, { act: KitAct; s: v.RunnerView['signed'][number] }>();
  const label = (text: string) => ({ text, html: v.said(text) });
  function drawSigned() {
    const box = $('signed');
    if (!box || !runner) return;
    drawn.clear();
    box.innerHTML = runner.signed
      .map((s) => {
        const form = actFormOf(s.identity, 'mid');
        const at = `${new Date(s.at * 1000).toISOString().replace('T', ' ').slice(0, 16)} UTC`;
        const kind = runner!.kinds.find((k) => k.kind === s.kind)?.name ?? s.kind;
        // Draft 2: an opening is listed beside what was signed, said as an opening (nothing signed), keyed by its sealed container.
        const a: KitAct = {
          id: s.opened && s.sealed ? s.sealed : s.act,
          form: actFormOf(s.act),
          signer: { id: s.identity, form, link: form, name: s.name, me: true },
          kind: s.opened ? `${s.app} · opened · ${kind}` : `${s.app} · ${kind}`,
          // H121: the IDs in its words, each a tap showing it whole.
          html: `<div class="k-txt" dir="auto">${s.words.map(v.said).join(' ')}</div>`,
          labels: [label(s.opened ? `opened, nothing signed · ${s.times === 1 ? 'once' : `${s.times} times`} · last ${at}` : `${s.lane ? 'signed without asking: a lane’s record, to the identity itself' : s.standing ? 'signed without asking' : 'asked, and signed'} · ${s.as ? `as the collective ${actFormOf(s.as, 'mid')}, with its member key` : s.line === 'apart' ? 'on a line of its own' : `${s.app}’s ${s.line} line, position ${s.position}`} · ${at}`)],
          verified: false,
        };
        drawn.set(a.id, { act: a, s });
        return card(a);
      })
      .join('');
    // The Dubsar clock's time on each card it stamped (decided 23 October 2026), read after drawing.
    const ids = cardsUntimed(box);
    if (ids.length)
      void b
        .ask<Record<string, string>>('clock words', { ids })
        .then((w) => box.isConnected && stampCards(box, w))
        .catch(() => undefined);
  }

  attachCards(app, {
    app: 'Kišib',
    signs: false,
    act: (id) => drawn.get(id)?.act,
    signerItems: () => [],
    actItems: () => ({ before: [], after: [] }),
    async choose(key, a) {
      const s = drawn.get(a.id)?.s;
      if (!s) return;
      if (key === 'profile') return openRecord(a.signer.form);
      if (key === 'why' && s.opened) {
        popup.show('An opening', `${v.lines([{ text: `Kišib opened, for ${s.app}, what was sealed to this identity: ${s.times === 1 ? 'once' : `${s.times} times`}. An opening signs nothing; ${s.app} reads the act inside, not the identity’s key.` }])}<div class="kishib-review">${s.words.map((w) => `<p dir="auto">${v.said(w)}</p>`).join('')}</div>`);
        return;
      }
      if (key === 'why') {
        const body = popup.show('Why it’s valid', `<p class="k-small k-soft">Reading its standing at its homes…</p>`);
        const r = await b.ask<{ lines: v.Line[] }>('runner standing', { act: s.act, identity: s.identity }).catch((e) => ({ lines: [{ text: errorOf(e), tone: 'warn' as const }] }));
        if (body.isConnected) popup.replace(`${v.lines(r.lines)}<div class="kishib-review">${s.words.map((w) => `<p dir="auto">${v.said(w)}</p>`).join('')}</div>`);
      }
    },
  });

  /** An identity's record, its ID filled in: Kišib's profile of anyone (Identities, Read a record). */
  function openRecord(form: string) {
    tab = 'identities';
    part = 'record';
    draw();
    const f = app.querySelector<HTMLFormElement>('#form-record');
    if (f) (f.elements.namedItem('id') as HTMLInputElement).value = form;
  }

  // ---------------------------------------------------------------- names, IDs and contacts (hand test v3: H96, H100, H106, H109, H119, H121)

  // Every identity shown by its names, read by Kišib's program (the nickname, the published name faint; Loading… until read); every short ID a tap: whole, then copied; Open profile: its record.
  attachIds(app, {
    names: (ids, fresh) => b.ask<Record<string, Named>>('names', { ids, fresh: !!fresh }),
    profile: (id) => openRecord(v.idFormOf(id)),
  });
  // Contacts top left, and the Contacts button beside every field taking an ID: the one list of the identity the runner holds.
  attachContacts(app, { app: 'Kišib', ask: (op, a) => b.ask(op, a), profile: (id) => openRecord(v.idFormOf(id)), said: tell, readOnly: 'Shown here, changed in Dub, Damgar, Edubba or Ummia: changing them signs an act, and Kišib signs only for the apps paired with it.' });

  attachColumn(app, async (key) => {
    part = key;
    const runnerTab = tab === 'runner';
    // The runner's parts are read fresh: what waits, what was signed.
    if (runnerTab && !b.web) runner = (await b.ask<v.RunnerView>('runner state').catch(() => null)) ?? runner;
    if (part !== key) return;
    if (runnerTab) return draw();
    const pane = $('pane');
    if (pane && tab) pane.innerHTML = v.part(tab, key, b.web, b.web ? null : runner);
    const st = $('status');
    if (st) st.innerHTML = '';
    if (tab === 'runner' && key === 'signed') drawSigned();
  });

  // ---------------------------------------------------------------- forms

  const values = (form: HTMLFormElement): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (!el.name || el.name === 'allow') continue;
      out[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    }
    return out;
  };

  /** Clear every field that held words, once they were sent. */
  const clear = (form: HTMLFormElement) => (Array.from(form.elements) as HTMLInputElement[]).forEach((el) => (el.tagName === 'TEXTAREA' || el.type === 'password') && (el.value = ''));

  /** A file chosen, read whole, as base64 (Nakišib's files: a commitment, a request, an answer). Nothing is kept. */
  const fileB64 = async (el: HTMLInputElement): Promise<string> => {
    const f = el.files?.[0];
    if (!f) return '';
    const b = new Uint8Array(await f.arrayBuffer());
    let t = '';
    for (const x of b) t += String.fromCharCode(x);
    return btoa(t);
  };
  const withFiles = async (form: HTMLFormElement, a: Record<string, unknown>) => {
    for (const el of Array.from(form.querySelectorAll<HTMLInputElement>('input[type=file]'))) a[el.name] = await fileB64(el);
    return a;
  };

  /** The request for Nakišib, saved where the person chooses (the browser's own save dialog where it has one; else a download). */
  async function saveFile(name: string, b64: string) {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const w = window as unknown as { showSaveFilePicker?: (o: unknown) => Promise<{ createWritable(): Promise<{ write(b: Uint8Array): Promise<void>; close(): Promise<void> }> }> };
    if (w.showSaveFilePicker) {
      try {
        const h = await w.showSaveFilePicker({ suggestedName: name });
        const out = await h.createWritable();
        await out.write(bytes);
        await out.close();
        return;
      } catch {
        // cancelled, or not allowed here: a download instead
      }
    }
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  const PLANS: Record<string, string> = { nakisib: 'nakisib plan', rotate: 'rotate plan', escape: 'escape plan', confirm: 'confirm plan', start: 'collective start', give: 'collective give', make: 'make plan' };

  function showReview(r: v.Review, kind: string) {
    current = { review: r, must: kind === 'start' };
    const pane = $('pane');
    if (pane) pane.innerHTML = v.review(r, current.must, kind === 'rotate');
    pane?.scrollTo?.(0, 0);
  }

  app.addEventListener('submit', async (ev) => {
    const form = ev.target as HTMLFormElement;
    const id = form.getAttribute('id') ?? '';
    if (id === 'pair') return;
    ev.preventDefault();
    const a = values(form);
    if (form.classList.contains('kishib-renew')) {
      const r = await act(() => b.ask<v.RunnerView>('runner give', { id: a.id, address: a.address, words: a.words }));
      if (!r) return;
      runner = r;
      draw();
      return done('The new signing key’s words are taken: the runner signs for this identity again, with its new key.');
    }
    await withFiles(form, a);
    if (id === 'nakisib-answer' || id === 'nakisib-late') {
      const s = await act(() => b.ask<v.State>('nakisib answer', a));
      if (s) await show({ ...s, runner: runner ?? undefined });
      return;
    }
    const kind = form.dataset.kind ?? '';
    switch (kind) {
      case 'check':
      case 'record': {
        const r = await act(() => b.ask<{ title: string; lines?: v.Line[]; sections?: v.Section[] }>(kind === 'check' ? 'check words' : 'record', a));
        if (!r) return;
        clear(form);
        $('result')!.innerHTML = `<div class="kishib-review" id="answer"><h3>${v.said(r.title)}</h3>${r.lines ? v.lines(r.lines) : v.sections(r.sections ?? [])}</div>`;
        return;
      }
      case 'checkshare': {
        const more = String(a.more ?? '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => /^(\d+)\s+(.*)$/.exec(l) ?? [l, '', l]);
        const r = await act(() => b.ask<{ title: string; lines: v.Line[] }>('check share', { collective: a.collective, address: a.address, numbers: [a.number, ...more.map((m) => m[1])], shares: [a.shareWords, ...more.map((m) => m[2])] }));
        if (!r) return;
        clear(form);
        $('result')!.innerHTML = `<div class="kishib-review" id="answer"><h3>${v.said(r.title)}</h3>${v.lines(r.lines)}</div>`;
        return;
      }
      case 'unlock': {
        // Draft 2: the passphrase asked when Kišib starts with the runner on.
        const r = await act(() => b.ask<v.RunnerView>('runner unlock', { passphrase: a.passphrase, again: a.again }));
        clear(form);
        if (!r) return;
        runner = r;
        draw();
        return done('Unlocked: the runner’s keys, apps and log are back. The apps paired sign through it again; none pairs again.');
      }
      case 'give-runner': {
        const r = await act(() => b.ask<v.RunnerView>('runner give', a));
        if (!r) return;
        runner = r;
        draw();
        // H88: the identity brought, its ID whole, with Copy ID and Share your ID link.
        const typed = String(a.id ?? '').trim();
        const h = r.held.find((x) => x.id === typed || x.form === typed || typed.startsWith(`${x.form}?`));
        return done(`Kept by the runner, on this Mac: approve it for an app in Runner, Apps.${h ? `<p class="k-small k-soft">Its ID, to give to whoever may write to it:</p>${ownId({ form: h.form, link: h.link })}` : ''}`);
      }
      default:
        if (PLANS[kind]) {
          const r = await act(() => b.ask<v.Review>(PLANS[kind], { ...a, ...(a.room === '1' ? { room: true } : {}) }));
          if (!r) return;
          clear(form);
          return showReview(r, kind);
        }
    }
    if (id === 'typed') {
      const typed = Object.keys(a)
        .sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)))
        .map((k) => String(a[k]));
      const s = await act(() => b.ask<v.State>('words typed', { typed }));
      if (s) await show({ ...s, runner: runner ?? undefined });
      return;
    }
    if (id === 'paper') {
      const s = await act(() => b.ask<v.State>('collective paper', a));
      if (s) await show({ ...s, runner: runner ?? undefined });
    }
  });

  // ---------------------------------------------------------------- clicks

  app.addEventListener('click', async (ev) => {
    const t = ev.target as HTMLElement;
    const tile = t.closest<HTMLElement>('[data-k-tile]');
    if (tile) return openTab(tile.dataset.kTile as v.Tab);
    const tb = t.closest<HTMLElement>('[data-tab]');
    if (tb) return openTab(tb.dataset.tab as v.Tab);
    const el = t.closest<HTMLElement>('[data-action]');
    if (!el) return;
    const d = el.dataset;
    const again = async (s: v.State | undefined) => s && show({ ...s, runner: runner ?? undefined });
    switch (d.action) {
      case 'home-tiles':
        if (state?.sitting && state.sitting.stage !== 'done') return fail(new Error('Kišib is in the middle of an act: finish it, or forget it (Cancel), first.'));
        tab = null;
        part = null;
        door = null;
        return draw();
      case 'holds':
        return openTab(b.web ? 'identities' : runner?.on ? 'identities' : 'runner');
      case 'open-door':
        door = tab;
        return draw();
      case 'forget': {
        const s = await act(() => b.ask<v.State>('forget'));
        if (s) {
          state = { ...s, runner: runner ?? undefined };
          current = null;
          draw();
        }
        return;
      }
      case 'read request': {
        const form = t.closest('form') as HTMLFormElement;
        const a = values(form);
        const r = await act(() => b.ask<{ title: string; sections: v.Section[] }>('collective read', { collective: a.collective, fingerprint: a.fingerprint, address: a.address }));
        if (r) $('request')!.innerHTML = `<div class="kishib-review"><h3>${v.said(r.title)}</h3>${v.sections(r.sections)}</div>`;
        return;
      }
      case 'sign': {
        if (!current) return;
        if (current.must && !$<HTMLInputElement>('read-it')?.checked) return fail(new Error('Read what this device will hold, and say so, before anything is done.'));
        const warned = current.review.warning ? ($<HTMLInputElement>('warned')?.checked ? current.review.warning : undefined) : undefined;
        if (current.review.warning && !warned) return fail(new Error('A line of acts would be left out, or cannot be placed: read the warning in red and tick it, or go back and give its card.'));
        return again(await act(() => b.ask<v.State>('confirm', { plan: current!.review.plan, digest: current!.review.digest, ...(warned ? { warned } : {}) })));
      }
      case 'nakisib write': {
        const r = await act(() => b.ask<{ name: string; bytes: string; fingerprint: string }>('nakisib request'));
        if (!r) return;
        await saveFile(r.name, r.bytes);
        return done(`The request is written (${v.e(r.name)}): carry it to the offline Mac, and open it in Nakišib, “Change keys”. Its new signing key’s fingerprint, which Nakišib shows too: ${v.e(r.fingerprint)}.`);
      }
      case 'refresh':
      case 'resend':
      case 'gather':
      case 'rotate collective': {
        const op = d.action === 'gather' ? 'collective gather' : d.action === 'rotate collective' ? 'collective rotate' : d.action;
        return again(await act(() => b.ask<v.State>(op)));
      }
      case 'show words': {
        const w = await act(() => b.ask<{ words: string[]; say: string[]; holder?: string; which?: 'chain' | 'signing' }>('words show'));
        if (!w) return;
        const st = state?.sitting;
        const label = w.holder ? 'The collective’s new signing key’s words' : st?.kind === 'make' ? (w.which === 'chain' ? 'Its chain key’s words: its first paper' : 'Its signing key’s words') : w.which === 'chain' ? 'Write a new chain-key paper' : 'The new signing key’s words';
        const pane = $('pane');
        if (pane) pane.innerHTML = v.wordsShown(w.words, w.say, label, st?.kind === 'identity' ? (w.which === 'chain' ? 2 : 4) : null);
        return;
      }
      case 'written': {
        if (app.querySelector('#words[data-share]')) {
          const holder = (app.querySelector('#words') as HTMLElement).dataset.share!;
          return again(await act(() => b.ask<v.State>('collective share written', { holder })));
        }
        return again(await act(() => b.ask<v.State>('words written')));
      }
      case 'show share': {
        const holder = d.holder!;
        const r = await act(() => b.ask<{ x: number; words: string[]; fingerprint: string; say: string[] }>('collective share', { holder }));
        if (!r) return;
        const pane = $('pane');
        if (pane) {
          pane.innerHTML = v.wordsShown(r.words, [...r.say, `Share number ${r.x}. The new dealing’s fingerprint: ${r.fingerprint}.`], `New share ${r.x} of the collective’s chain key`, null);
          pane.querySelector('#words')!.setAttribute('data-share', holder);
        }
        return;
      }
      // ------------------------------------------------ the runner (the program only)
      case 'runner-on-ask':
        $('risk')?.scrollIntoView({ block: 'center' });
        return $('risk-read')?.focus();
      case 'runner-on': {
        if (!$<HTMLInputElement>('risk-read')?.checked) return fail(new Error('Read the risk, and tick it, before the runner is turned on. It stays off.'));
        const pass = $<HTMLInputElement>('runner-pass');
        const again = $<HTMLInputElement>('runner-pass-again');
        const r = await act(() => b.ask<v.RunnerView>('runner on', { read: true, passphrase: pass?.value ?? '', again: again?.value ?? '' }));
        if (pass) pass.value = '';
        if (again) again.value = '';
        if (!r) return;
        runner = r;
        draw();
        return done('The runner is on, its file encrypted under your passphrase. Give it an identity (Identities, Held here), then pair an app: in Dub, the identity panel, + Add, Use one from Kišib.');
      }
      case 'quit': {
        if (!(await ask(app, { title: 'Quit Kišib?', text: 'Its program ends, and the runner, if on, is locked: the apps sign through it no more until Kišib is opened again and its passphrase given. Nothing is erased.', yes: 'Quit Kišib' }))) return;
        const r = await act(() => b.ask<{ quit: boolean }>('quit'));
        if (!r) return;
        app.innerHTML = v.quitDone(runner?.state === 'off');
        return;
      }
      case 'runner-lock': {
        const r = await act(() => b.ask<v.RunnerView>('runner lock'));
        if (!r) return;
        runner = r;
        draw();
        return done('Locked: the runner signs and opens nothing until its passphrase is given again. Nothing was erased.');
      }
      // H90: Off, or the button below it, asks the same question in the page (never the browser's own dialog), then turns it off.
      case 'runner-off-ask':
      case 'runner-off': {
        if (!(await ask(app, { title: 'Turn the runner off?', text: 'It erases everything: every signing key it holds, every app paired with it, and what it signed and opened. The apps stop signing through it. Turned on again, it starts from nothing.', yes: 'Turn it off, and erase everything', alarm: true }))) return;
        const r = await act(() => b.ask<v.RunnerView>('runner off'));
        if (!r) return;
        runner = r;
        draw();
        return done('The runner is off: every key, pairing and record it held is erased, its file overwritten and removed.');
      }
      case 'approve': {
        const box = t.closest<HTMLElement>('.kishib-app')!;
        const identities = [...box.querySelectorAll<HTMLInputElement>('input[name="allow"]:checked')].map((x) => x.value);
        const opens = [...box.querySelectorAll<HTMLInputElement>('input[name="open"]:checked')].map((x) => x.value).filter((x) => identities.includes(x));
        const r = await act(() => b.ask<v.RunnerView>('runner approve', { pairing: d.pairing, identities, opens }));
        if (r) {
          runner = r;
          draw();
          done('Approved: the app may now use the identities chosen, each act shown in Kišib’s panel inside its window.');
        }
        return;
      }
      case 'refuse':
      case 'revoke': {
        if (d.action === 'revoke' && !(await ask(app, { title: 'Revoke this app?', text: 'It signs through Kišib no more, and what waits from it is dropped.', yes: 'Revoke it' }))) return;
        const r = await act(() => b.ask<v.RunnerView>('runner revoke', { pairing: d.pairing }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case 'yes': {
        const r = await act(() => b.ask<v.RunnerView>('runner yes', { pairing: d.pairing, kind: d.kind, on: d.on === '1' }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case 'member-answer': {
        const r = await act(() => b.ask<v.RunnerView>('runner member answer', { ask: d.ask, yes: d.yes === '1' }));
        if (r) {
          runner = r;
          draw();
          if (d.yes === '1') done('Kept: Kišib holds this identity’s key for the collective, encrypted. The app acts as the collective through Kišib’s panel.');
        }
        return;
      }
      case 'member-remove': {
        if (!(await ask(app, { title: 'Forget this collective’s key here?', text: 'The app using the identity through Kišib can no longer act as the collective. The key itself stays sealed to the identity at its homes.', yes: 'Forget it here' }))) return;
        const r = await act(() => b.ask<v.RunnerView>('runner member remove', { identity: d.id, collective: d.collective }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case 'opening': {
        const r = await act(() => b.ask<v.RunnerView>('runner opening', { pairing: d.pairing, identity: d.identity, on: d.on === '1' }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case 'answer': {
        const always = !!app.querySelector<HTMLInputElement>(`[data-always="${CSS.escape(d.request!)}"]`)?.checked;
        const r = await act(() => b.ask<v.RunnerView>('runner answer', { request: d.request, yes: d.yes === '1', always }));
        if (r) {
          runner = r;
          draw();
          done(d.yes === '1' ? 'Signed: the app that asked has its signature.' : 'Declined: nothing was signed.');
        }
        return;
      }
      case 'held-record': {
        const h = runner?.held.find((x) => x.id === d.id);
        const r = await act(() => b.ask<{ title: string; sections: v.Section[] }>('record', { id: d.id, address: h?.homes[0] ?? '' }));
        if (r) popup.show(r.title, v.sections(r.sections));
        return;
      }
      case 'held-remove': {
        if (!(await ask(app, { title: 'Remove this identity from the runner?', text: 'Kišib forgets its signing key; the apps using it through Kišib stop signing as it. The identity itself is not touched.', yes: 'Remove it' }))) return;
        const r = await act(() => b.ask<v.RunnerView>('runner remove', { id: d.id }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case 'runner-cards': {
        const form = t.closest('form') as HTMLFormElement;
        const id = (form.elements.namedItem('id') as HTMLInputElement).value.trim();
        const r = await act(() => b.ask<{ cards: string }>('runner cards', { id }));
        if (!r) return;
        const area = form.elements.namedItem('cards') as HTMLTextAreaElement;
        if (!r.cards) return fail(new Error('Kišib’s runner signed no line for this identity under its current key (or does not hold it).'));
        area.value = [area.value.trim(), ...r.cards.split('; ')].filter(Boolean).join('\n');
        return;
      }
    }
  });

  // What waits in the runner (a pairing asked, a request whose panel was closed) shows without a reload; and the page follows the
  // runner's state wherever it changes (H90: locked, turned off or quit from the seal in the menu bar), on every screen.
  if (!b.web) {
    let missed = 0;
    setInterval(async () => {
      if (document.hidden || !runner || app.querySelector('#quit-done')) return;
      let r: v.RunnerView;
      try {
        r = await b.ask<v.RunnerView>('runner state');
        missed = 0;
      } catch (err) {
        if (b.unpaired?.(err)) return;
        // Twice unanswered: Kišib's program has ended (quit from the seal).
        if (++missed >= 2) app.innerHTML = v.quitDone(runner.state === 'off');
        return;
      }
      if (r.state !== runner.state) {
        runner = r;
        popup.close();
        draw();
        return;
      }
      if (!runner.on) return;
      const changed = JSON.stringify([r.apps, r.waiting, r.signed.length, r.held, r.memberAsks]) !== JSON.stringify([runner.apps, runner.waiting, runner.signed.length, runner.held, runner.memberAsks]);
      runner = r;
      if (!changed) return;
      // Only the runner's own lists are drawn again: never a form being typed.
      if (tab === 'runner' && part !== 'onoff') draw();
      else app.querySelectorAll<HTMLElement>('.kishib-holds').forEach((x) => (x.outerHTML = v.holds(b.web, runner)));
    }, 2000);
  }

  return { show };
}
