// Dub's page: its screens, clicks and forms, the same for the program on
// the Mac (`app.ts`, which asks the program) and for the web client
// (`../web/app.ts`, which runs Dub's code in this browser). Each gives a
// `Backend`: how to ask, and how to start again.

import * as v from './view.ts';

export interface Backend {
  /** One of Dub's operations, by name (`../ops.ts`). */
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  /** The web client (F281), not the program on the Mac. */
  web: boolean;
  /** Draw the first screen again, from the state as it is now. */
  start(): Promise<void>;
  /** The program on the Mac: whether a refusal means this browser is not paired. */
  unpaired?(err: unknown): boolean;
  /** The program on the Mac: forget this browser's key. */
  unpair?(): Promise<void>;
  /** The web client: the addresses its deployer suggests. */
  suggested?(): v.Suggested;
}

/** The first words of what Dub says when its signing key no longer counts (`SPENT_SAY` in `dub.ts`). */
const SPENT = 'This identity’s signing key was changed elsewhere';

interface Inbox {
  toYou: v.Item[];
  messages: v.Message[];
  encryption: boolean;
  hidden: number;
  problems: string[];
}

export function mount(app: HTMLElement, b: Backend): { show(state: v.State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  let state: v.State | null = null;
  /** What was read last: the feed and the inbox, for the filter and the counts. */
  let feed: v.Item[] = [];
  let inbox: Inbox | null = null;
  let filter: 'all' | 'toyou' = 'all';
  let tab: 'public' | 'private' | 'signing' = 'public';
  /** The post being answered, if any. */
  let replying: { id: string; signer: string } | null = null;
  /** Words shown once, held only until they are hidden (H3). */
  let shown: { positions: number[] } | null = null;

  function say(kind: 'error' | 'done' | 'warn' | '', html: string) {
    const s = $('status');
    if (s) s.innerHTML = html ? v.note(kind, html) : '';
    if (html) s?.scrollIntoView({ block: 'nearest' });
  }

  async function fail(err: unknown) {
    if (b.unpaired?.(err)) {
      void b.start();
      return;
    }
    const m = err instanceof Error ? err.message : String(err);
    if (m.startsWith(SPENT)) {
      await check();
      say('', '');
      return;
    }
    say('error', v.e(m));
  }

  const fill = (id: string, html: string) => {
    const el = $(id);
    if (el) el.innerHTML = html;
  };

  /** Busy: the buttons wait, so nothing is sent twice. */
  async function busy<T>(words: string, f: () => Promise<T>): Promise<T | undefined> {
    say('', `<span class="small">${v.e(words)}</span>`);
    const was = [...app.querySelectorAll('button')].map((x) => [x, x.disabled] as const);
    app.querySelectorAll('button').forEach((x) => (x.disabled = true));
    try {
      return await f();
    } catch (err) {
      await fail(err);
      return undefined;
    } finally {
      for (const [x, d] of was) x.disabled = d;
    }
  }

  // ---------------------------------------------------------------- reading

  /** "To you": the inbox's, and the feed's posts answering this identity, each once. */
  function toYou(): v.Item[] {
    const out = [...(inbox?.toYou ?? [])];
    for (const p of feed) if (p.toMe && !out.some((x) => x.id === p.id)) out.push(p);
    return out;
  }

  function counts() {
    const n = (k: number) => (k ? String(k) : '');
    const unseen = toYou().filter((x) => !x.seen).length;
    fill('count-toyou', n(unseen));
    fill('count-public', n(unseen));
    fill('count-private', n((inbox?.messages ?? []).filter((m) => !m.seen).length));
  }

  function drawFeed() {
    const items = filter === 'toyou' ? toYou() : feed;
    const empty = filter === 'toyou' ? 'Nothing addressed to you yet: replies to your posts, and public messages to you, come here.' : 'Nothing yet. Write something, or follow someone.';
    fill('feed', items.length ? items.map(v.post).join('') : `<p class="empty">${empty}</p>`);
  }

  function drawInbox() {
    if (!inbox) return;
    const ms = inbox.messages;
    fill(
      'inbox',
      (ms.length ? ms.map(v.msg).join('') : '<p class="empty">No private message yet.</p>') +
        (inbox.hidden ? `<p class="small">${inbox.hidden} from muted identities, not shown.</p>` : '') +
        inbox.problems.map((p) => `<p class="small">${v.e(p)}</p>`).join('') +
        (ms.length ? '<p class="small">In the order this app found or sent them: its own time, not a signed one.</p>' : ''),
    );
  }

  async function readFeed() {
    try {
      const r = await b.ask<{ items: v.Item[]; more: number; problems: string[] }>('feed');
      feed = r.items;
      drawFeed();
      if (r.problems.length) $('feed')!.insertAdjacentHTML('beforeend', r.problems.map((p) => `<p class="small">${v.e(p)}</p>`).join(''));
      if (r.items.length) $('feed')!.insertAdjacentHTML('beforeend', '<p class="small">In signed order: a reply after what it answers. MOR has no clock, so this is not a time.</p>');
    } catch (err) {
      fill('feed', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
    counts();
  }

  async function readInbox() {
    try {
      inbox = await b.ask<Inbox>('inbox');
      drawInbox();
      if (filter === 'toyou') drawFeed();
    } catch (err) {
      fill('inbox', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
    counts();
  }

  async function check() {
    try {
      const c = await b.ask<{ current: boolean; say: string | null }>('check');
      fill('spent', c.current ? '' : v.spent(c.say ?? ''));
    } catch {
      // its homes did not answer: said when something is signed
    }
  }

  /** Mark seen what the person is looking at, for the counts. */
  async function seen(keys: string[]) {
    if (!keys.length) return;
    try {
      await b.ask('seen', { keys });
      for (const x of [...toYou(), ...(inbox?.messages ?? [])]) if (keys.includes('key' in x ? x.key : x.id)) x.seen = true;
      for (const x of feed) if (keys.includes(x.id)) x.seen = true;
    } catch {
      // the counts stay as they are
    }
    counts();
  }

  function setTab(t: 'public' | 'private' | 'signing') {
    if (t === 'signing' && !$('signing')) t = 'public';
    tab = t;
    app.querySelectorAll<HTMLElement>('[data-tab]').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
    $('public')!.hidden = t !== 'public';
    $('private')!.hidden = t !== 'private';
    if ($('signing')) $('signing')!.hidden = t !== 'signing';
    // Proposals and shares arrive while the page is open: the tab reads them again when opened.
    if (t === 'signing') void readSigning();
    if (t === 'private') void seen((inbox?.messages ?? []).filter((m) => !m.seen).map((m) => m.key));
  }

  function setFilter(f: 'all' | 'toyou') {
    filter = f;
    app.querySelectorAll<HTMLElement>('[data-filter]').forEach((x) => x.classList.toggle('on', x.dataset.filter === f));
    drawFeed();
    if (f === 'toyou') void seen(toYou().filter((x) => !x.seen).map((x) => x.id));
  }

  async function refresh() {
    const s = await b.ask<v.State>('state');
    state = s;
    await show(s);
  }

  async function show(s: v.State) {
    state = s;
    if (s.stage === 'confirm' && shown) {
      app.innerHTML = v.typeBack(shown.positions, b.web);
      return;
    }
    if (s.stage === 'confirm') {
      app.innerHTML = v.typeBack(s.confirm!.positions, b.web);
      return;
    }
    if (s.stage === 'identity') {
      app.innerHTML = v.identityWindow(s, b.web, b.suggested?.() ?? {});
      return;
    }
    app.innerHTML = v.app(s, b.web);
    setTab(tab);
    setFilter(filter);
    void check();
    await Promise.all([readFeed(), readInbox()]);
    await readSigning();
  }

  /** The Signing tab (H18): the proposals read in plain words; with it off, how many wait. */
  async function readSigning() {
    try {
      const r = await b.ask<{ on: boolean; waiting: number; proposals: v.Proposal[]; problems: string[]; say: string }>('proposals');
      if (!r.on) {
        fill('signing-waiting', r.waiting ? v.note('', `${r.waiting === 1 ? 'A proposal to sign waits' : `${r.waiting} proposals to sign wait`}. ${v.e(r.say)}`) : '');
        return;
      }
      fill('signing-list', r.proposals.length ? r.proposals.map(v.proposal).join('') : '<p class="empty">No proposal to sign. When a collective’s founder asks you to sign, it comes here.</p>');
      fill('count-signing', r.waiting ? String(r.waiting) : '');
    } catch (err) {
      fill('signing-list', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
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

  app.addEventListener('change', async (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name === 'picture') fill('picked', el.files?.[0] ? v.e(el.files[0].name) : '');
    if (el.id === 'signing-on') {
      const on = el.checked;
      if (on && !confirm(v.SIGNING_LABEL)) {
        el.checked = false;
        return;
      }
      const r = await busy(on ? 'Turning Signing on…' : 'Turning Signing off…', () => b.ask<{ lines: v.Line[] }>('signing', { on }));
      if (r) {
        const s = await b.ask<v.State>('state');
        state = s;
        app.innerHTML = v.identityWindow(s, b.web, b.suggested?.() ?? {});
        say(on ? 'warn' : 'done', v.lines(r.lines));
      } else el.checked = !on;
      return;
    }
    if (el.id === 'publish-list') {
      const on = el.checked;
      if (on && !confirm(v.PUBLISH_WARNING)) {
        el.checked = false;
        return;
      }
      const r = await busy(on ? 'Publishing the follow list…' : 'Making the follow list private again…', () => b.ask<{ lines: v.Line[] }>('list', { published: on, shown: on ? v.PUBLISH_WARNING : '' }));
      if (r) {
        await refresh();
        say('done', v.lines(r.lines));
      } else el.checked = !on;
    }
  });

  app.addEventListener('click', async (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action],[data-tab],[data-filter]');
    if (!el || el instanceof HTMLInputElement) return;
    const d = el.dataset;
    if (d.tab) return setTab(d.tab as 'public' | 'private' | 'signing');
    if (d.filter) return setFilter(d.filter as 'all' | 'toyou');
    const card = el.closest<HTMLElement>('[data-post]');
    switch (d.action) {
      case 'written':
        // H3: the words go before three are asked back.
        app.innerHTML = v.typeBack(shown!.positions, b.web);
        break;
      case 'abandon':
        if (!confirm('Forget this new identity? Nothing of it was published. A new one will show new words.')) break;
        shown = null;
        try {
          await b.ask('abandon');
          await b.start();
        } catch (err) {
          await fail(err);
        }
        break;
      case 'window':
        if (state) app.innerHTML = v.identityWindow(state, b.web, b.suggested?.() ?? {});
        break;
      case 'back':
        await refresh();
        break;
      case 'use': {
        const r = await busy('Switching…', () => b.ask('use', { id: d.id }));
        if (r) {
          feed = [];
          inbox = null;
          await refresh();
        }
        break;
      }
      case 'forget':
        if (!confirm('Forget this identity here? Its keys go with it. Only its signing key’s words, written down, bring it back. Its posts stay published.')) break;
        if (await busy('Forgetting…', () => b.ask('forget', { id: d.id }))) {
          feed = [];
          inbox = null;
          await refresh();
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
          fill('code', v.note('', `Code for another browser, valid ten minutes, once: <code>${v.e(r.code)}</code>`));
        }
        break;
      }
      case 'unpair':
        if (!confirm('Unpair this browser? It will need a new link from the app.')) break;
        try {
          await b.unpair?.();
          await b.start();
        } catch (err) {
          await fail(err);
        }
        break;
      case 'address':
        $('post')?.classList.toggle('addressed');
        break;
      case 'reply': {
        if (!card) break;
        replying = { id: card.dataset.post!, signer: card.dataset.signer! };
        const w = card.querySelector('.who')?.outerHTML ?? '';
        fill('replying', `<span class="chip">Replying to ${w}<button type="button" data-action="unreply" title="Not a reply">×</button></span>`);
        setTab('public');
        $<HTMLTextAreaElement>('post')?.querySelector('textarea')?.focus();
        break;
      }
      case 'unreply':
        replying = null;
        fill('replying', '');
        break;
      case 'answer': {
        const f = $<HTMLFormElement>('message');
        (f?.elements.namedItem('to') as HTMLInputElement).value = d.id ?? '';
        f?.querySelector('textarea')?.focus();
        break;
      }
      case 'follow':
      case 'unfollow':
      case 'mute':
      case 'unmute': {
        if (d.action === 'mute' && !confirm('Mute this identity? Nothing of it is shown here any more. Nobody is told; it is never published.')) break;
        const r = await busy('Saving…', () => b.ask<{ lines: v.Line[] }>(d.action!, { id: d.id }));
        if (r) {
          const open = $<HTMLDetailsElement>('people')?.open;
          await refresh();
          if (open) $<HTMLDetailsElement>('people')!.open = true;
          if (r.lines.length) say('done', v.lines(r.lines));
        }
        break;
      }
      case 'call': {
        const name = prompt('Your name for this identity. It stays in this app, never published.');
        if (name === null) break;
        if (await busy('Saving…', () => b.ask('call', { id: d.id, name }))) {
          await refresh();
          $<HTMLDetailsElement>('people')!.open = true;
        }
        break;
      }
      case 'withdraw': {
        if (!confirm('Withdraw this picture? Readers stop showing it; the post stays. It cannot be undone.')) break;
        const r = await busy('Withdrawing…', () => b.ask<{ id: string }>('withdraw', { publication: d.publication }));
        if (r) {
          say('done', `The picture is withdrawn (act <code>${v.e(r.id.slice(0, 16))}…</code>).`);
          await readFeed();
        }
        break;
      }
      case 'feed':
        say('', '');
        await Promise.all([readFeed(), readInbox()]);
        await readSigning();
        break;
      case 'accept': {
        if (!confirm('Sign it? Your signature is public, and binds you to exactly what you read here.')) break;
        const r = await busy('Signing, and answering the proposer…', () => b.ask<{ lines: v.Line[] }>('accept', { thread: d.thread }));
        if (r) {
          await readSigning();
          say('done', `<strong>Signed.</strong>${v.lines(r.lines)}`);
        }
        break;
      }
      case 'decline': {
        const why = prompt('Decline it. Your reason, if you like (sent to the proposer, sealed):');
        if (why === null) break;
        const r = await busy('Declining…', () => b.ask<{ lines: v.Line[] }>('decline', { thread: d.thread, why }));
        if (r) {
          await readSigning();
          say('done', v.lines(r.lines));
        }
        break;
      }
      case 'share': {
        const r = await busy('Opening your share with its one-time key, and checking it against the dealing…', () => b.ask<v.ShareShown>('share', { thread: d.thread }));
        // Shown once: on the page now and nowhere else; a reload asks for three of its words instead.
        if (r) {
          say('', '');
          const card = app.querySelector<HTMLElement>(`.proposal[data-thread="${CSS.escape(r.thread)}"]`);
          if (card) card.outerHTML = v.share(r);
        }
        break;
      }
      case 'share-written': {
        // As H3: the words go before three are asked back.
        const card = $('share-shown');
        if (card) card.outerHTML = `<div class="proposal" data-thread="${v.e(d.thread!)}">${v.shareTypeBack(d.thread!, (d.positions ?? '').split(',').map(Number))}</div>`;
        break;
      }
      case 'sharehand': {
        if (!confirm('Your share came by hand, shown on the founder’s screen? The one-time key is destroyed: a share sealed to it could never be opened.')) break;
        const r = await busy('Destroying the one-time key…', () => b.ask<{ lines: v.Line[] }>('sharehand', { thread: d.thread }));
        if (r) {
          await readSigning();
          say('done', v.lines(r.lines));
        }
        break;
      }
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
    // Not `form.id`: a form's fields shadow its properties (the bring form has a field named "id").
    const name = form.getAttribute('id');
    if (name === 'pair') return; // the program's own start handles it (`app.ts`)
    ev.preventDefault();
    const d = new FormData(form);
    if (form.classList.contains('share-back')) {
      const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
      const r = await busy('Checking the words, then destroying the one-time key…', () => b.ask<{ lines: v.Line[] }>('shareback', { thread: form.dataset.thread, typed }));
      if (r) {
        await readSigning();
        say('done', `<strong>Your share is written down.</strong>${v.lines(r.lines)}`);
      }
      return;
    }
    switch (name) {
      case 'begin': {
        const r = await busy('Asking each home who runs it, and making the identity…', () =>
          b.ask<{ words: string[]; positions: number[]; say: string[] }>('begin', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: viaOf(d.get('via')), name: String(d.get('name') ?? '') }),
        );
        // The words are on the page now and nowhere else it can reach: a reload will not show them again.
        if (r) {
          shown = { positions: r.positions };
          app.innerHTML = v.words(r.words, r.say, b.web);
        }
        return;
      }
      case 'confirm': {
        const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
        const r = await busy('Checking the words, then sending the genesis to the homes…', () => b.ask<{ lines: v.Line[] }>('confirm', { typed }));
        if (r) {
          shown = null;
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
          feed = [];
          inbox = null;
          await b.start();
          say('done', `<strong>The identity is here.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'renew': {
        const r = await busy('Checking the new words at its homes…', () => b.ask<{ lines: v.Line[] }>('renew', { words: words(d.get('words')) }));
        if (r) {
          await refresh();
          say('done', `<strong>The new words are in use.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'name': {
        const r = await busy('Publishing the name…', () => b.ask<{ lines: v.Line[]; names: string[] }>('name', { name: String(d.get('name') ?? '') }));
        if (r) {
          const s = await b.ask<v.State>('state');
          state = s;
          app.innerHTML = v.identityWindow(s, b.web, b.suggested?.() ?? {});
          say('done', r.lines.length ? v.lines(r.lines) : 'Nothing changed.');
        }
        return;
      }
      case 'post': {
        const file = (form.elements.namedItem('picture') as HTMLInputElement).files?.[0];
        const reply = replying;
        const r = await busy(file ? 'Stripping the picture, publishing, and reading it back…' : 'Publishing, and reading it back…', async () =>
          b.ask<{ post: v.Item; lines: v.Line[] }>('post', { text: String(d.get('text') ?? ''), jpeg: file ? await base64(file) : '', to: String(d.get('to') ?? ''), reply }),
        );
        if (r) {
          form.reset();
          form.classList.remove('addressed');
          replying = null;
          fill('replying', '');
          fill('picked', '');
          feed = [r.post, ...feed.filter((x) => x.id !== r.post.id)];
          setFilter('all');
          say('done', `<strong>Posted.</strong>${v.lines(r.lines)}`);
          await readFeed();
        }
        return;
      }
      case 'message': {
        const r = await busy('Sealing it, and leaving it in their inbox…', () => b.ask<{ lines: v.Line[] }>('message', { to: String(d.get('to') ?? ''), text: String(d.get('text') ?? '') }));
        if (r) {
          form.reset();
          say('done', `<strong>Sent.</strong>${v.lines(r.lines)}`);
          await readInbox();
        }
        return;
      }
      case 'follow': {
        const r = await busy('Following…', () => b.ask<{ lines: v.Line[] }>('follow', { id: words(d.get('id')), name: words(d.get('name')) }));
        if (r) {
          await refresh();
          $<HTMLDetailsElement>('people')!.open = true;
          say('done', `<strong>Followed.</strong>${r.lines.length ? v.lines(r.lines) : ''}`);
        }
        return;
      }
    }
  });

  return { show };
}
