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
  /** The relay view's acts (H29), read when that filter is chosen. */
  let relayItems: v.Item[] | null = null;
  let filter: 'all' | 'toyou' | 'relay' = 'all';
  /** H30: a reload keeps the tab one was on (this browser's session storage: a tab's name, nothing else). */
  let tab: 'public' | 'private' | 'signing' = remembered();
  /** A share awaited in the Signing tab (H30): looked for by itself while the tab is open. */
  let shareAwaited = false;
  /** The post being answered, if any. */
  let replying: { id: string; signer: string } | null = null;
  /** Words shown once, held only until they are hidden (H3). */
  let shown: { positions: number[] } | null = null;

  function remembered(): 'public' | 'private' | 'signing' {
    try {
      const t = sessionStorage.getItem('dub:tab');
      return t === 'private' || t === 'signing' ? t : 'public';
    } catch {
      return 'public';
    }
  }

  // H34: folds, each remembered by this page (local storage: which fold is open, nothing else).
  function folds(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem('dub:folds') ?? '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  }
  function applyFolds(root: ParentNode) {
    const f = folds();
    root.querySelectorAll<HTMLDetailsElement>('details[data-fold]').forEach((d) => {
      const k = d.dataset.fold!;
      if (k in f && d.open !== f[k]) d.open = f[k];
    });
  }
  new MutationObserver((ms) => {
    for (const m of ms) for (const n of m.addedNodes) if (n instanceof HTMLElement) applyFolds(n.parentNode ?? n);
  }).observe(app, { childList: true, subtree: true });
  app.addEventListener(
    'toggle',
    (ev) => {
      const d = ev.target;
      if (!(d instanceof HTMLDetailsElement) || !d.dataset.fold) return;
      const f = folds();
      if (f[d.dataset.fold] === d.open) return;
      f[d.dataset.fold] = d.open;
      try {
        localStorage.setItem('dub:folds', JSON.stringify(f));
      } catch {
        // not remembered: the page works the same
      }
    },
    true,
  );

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
  let working = false;
  async function busy<T>(words: string, f: () => Promise<T>): Promise<T | undefined> {
    working = true;
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
      working = false;
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
    if (filter === 'relay') {
      if (!relayItems) {
        fill('feed', '<p class="empty">Reading every public act at this identity’s relays…</p>');
        return;
      }
      fill(
        'feed',
        `<p class="small">Every public act at this identity’s relays, newest first, in the order each relay received them: its own order, not a signed time. Posts of anyone, not only those you follow.</p>${
          relayItems.length ? relayItems.map(v.post).join('') : '<p class="empty">Nothing public at its relays yet.</p>'
        }`,
      );
      return;
    }
    const items = filter === 'toyou' ? toYou() : feed;
    const empty = filter === 'toyou' ? 'Nothing addressed to you yet: replies to your posts, and public messages to you, come here.' : 'Nothing yet. Write something, or follow someone.';
    fill('feed', items.length ? items.map(v.post).join('') : `<p class="empty">${empty}</p>`);
  }

  /** The relay view (H29): every public act at this identity's relays. */
  async function readRelay() {
    relayItems = null;
    drawFeed();
    try {
      const r = await b.ask<{ items: v.Item[]; hidden: number; problems: string[] }>('relay');
      relayItems = r.items;
      if (filter !== 'relay') return;
      drawFeed();
      $('feed')!.insertAdjacentHTML('beforeend', (r.hidden ? `<p class="small">${r.hidden} from muted identities, not shown.</p>` : '') + r.problems.map((p) => `<p class="small">${v.e(p)}</p>`).join(''));
    } catch (err) {
      if (filter === 'relay') fill('feed', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
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

  async function readFeed(fresh = false) {
    try {
      const r = await b.ask<{ items: v.Item[]; more: number; problems: string[]; notes?: string[]; followsChanged?: boolean }>('feed', { fresh });
      feed = r.items;
      // The follow list sealed to the identity was changed by another app holding it: the people panel is drawn again.
      if (r.followsChanged) {
        state = await b.ask<v.State>('state');
        const el = $('people');
        if (el && state.identity) el.outerHTML = v.people(state);
      }
      if (filter === 'relay') return;
      drawFeed();
      const extra = [...(r.notes ?? []), ...r.problems];
      if (extra.length) $('feed')!.insertAdjacentHTML('beforeend', extra.map((p) => `<p class="small">${v.e(p)}</p>`).join(''));
      if (r.items.length) $('feed')!.insertAdjacentHTML('beforeend', '<p class="small">In signed order: a reply after what it answers. MOR has no clock, so this is not a time.</p>');
    } catch (err) {
      fill('feed', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
    counts();
  }

  /** The lanes asked here (round 2), in the identity window. */
  async function readLanes() {
    if (!$('lanes')) return;
    try {
      const r = await b.ask<{ lanes: { label: string; state: string; cap: string; until: number | null }[] }>('lanes');
      fill('lanes', v.lanesHere(r.lanes));
    } catch (err) {
      fill('lanes', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
  }

  /** Payments made here under the lane; keys to deliver and keys arrived for sealed posts (round 2). */
  async function readPayments() {
    try {
      await b.ask('money look');
      if (!$('payments')) return;
      const r = await b.ask<{ payments: v.PaymentShownHere[]; done: v.PaymentShownHere[]; problems: string[] }>('payments');
      fill('payments', v.paymentsHere(r));
    } catch (err) {
      fill('payments', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
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
    try {
      sessionStorage.setItem('dub:tab', t);
    } catch {
      // not remembered: the page works the same
    }
    app.querySelectorAll<HTMLElement>('[data-tab]').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
    $('public')!.hidden = t !== 'public';
    $('private')!.hidden = t !== 'private';
    if ($('signing')) $('signing')!.hidden = t !== 'signing';
    // Proposals and shares arrive while the page is open: the tab reads them again when opened.
    if (t === 'signing') void readSigning();
    if (t === 'private') void seen((inbox?.messages ?? []).filter((m) => !m.seen).map((m) => m.key));
  }

  function setFilter(f: 'all' | 'toyou' | 'relay') {
    const was = filter;
    filter = f;
    app.querySelectorAll<HTMLElement>('[data-filter]').forEach((x) => x.classList.toggle('on', x.dataset.filter === f));
    drawFeed();
    if (f === 'relay' && (was !== 'relay' || !relayItems)) void readRelay();
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
      void readLanes();
      return;
    }
    app.innerHTML = v.app(s, b.web);
    setTab(tab);
    setFilter(filter);
    void check();
    await Promise.all([readFeed(), readInbox(), readPayments()]);
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
      shareAwaited = r.proposals.some((p) => p.share === 'waiting' || p.share === 'ready');
      // A share being shown, or its words being typed back, is never drawn over.
      if (app.querySelector('#share-shown') || [...app.querySelectorAll<HTMLInputElement>('#signing form.share-back input')].some((i) => i.value)) return;
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
      void readLanes();
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
    if (d.filter) return setFilter(d.filter as 'all' | 'toyou' | 'relay');
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
        if (state) {
          app.innerHTML = v.identityWindow(state, b.web, b.suggested?.() ?? {});
          void readLanes();
        }
        break;
      case 'back':
        await refresh();
        break;
      case 'use': {
        const r = await busy('Switching…', () => b.ask('use', { id: d.id }));
        if (r) {
          feed = [];
          inbox = null;
          relayItems = null;
          filter = 'all';
          await refresh();
        }
        break;
      }
      case 'leave': {
        // H28: leave the identity in use first (its keys stay here), then the window to choose, make or bring one.
        const r = await busy('Leaving this identity…', () => b.ask('leave'));
        if (r) {
          feed = [];
          inbox = null;
          relayItems = null;
          filter = 'all';
          await refresh();
          say('done', 'You left that identity: its keys stay here. Choose one, or make or bring another.');
        }
        break;
      }
      case 'lookshare':
        await busy('Looking for your share…', () => readSigning());
        say('', '');
        if (shareAwaited && !app.querySelector('[data-action="share"]')) say('', '<span class="small">Not arrived yet: the founder’s Edubba sends it once every member has signed. Dub keeps looking while this tab is open.</span>');
        break;
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
        const label = el.textContent;
        const ok = await copy(d.id ?? '');
        el.textContent = ok ? 'Copied' : 'Copy failed: select the ID';
        setTimeout(() => (el.textContent = label), 2000);
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
      case 'tip': {
        if (!card) break;
        const t = card.querySelector('.tipping');
        if (t) t.innerHTML = v.tipForm(state?.units);
        break;
      }
      case 'relays publish': {
        const r = await busy('Publishing the new routes…', () => b.ask<{ lines: v.Line[] }>('relays publish', { relays: (d.relays ?? '').split('\n'), digest: d.digest }));
        if (r) {
          await refresh();
          say('done', v.lines(r.lines));
        }
        break;
      }
      case 'buy': {
        if (!confirm('Buy it, under the lane? Dub signs the request to pay within the lane’s cap; you then pay the invoice in your wallet (Payments, in the Private tab).')) break;
        const r = await busy('Asking the seller where to pay, under the lane…', () => b.ask<{ lines: v.Line[] }>('buy', { publication: d.publication, seller: d.seller, repost: d.repost, reposter: d.reposter }));
        if (r) {
          say('done', v.lines(r.lines));
          await readFeed();
        }
        break;
      }
      case 'repost': {
        if (!card) break;
        const r = await busy('Reposting, with the sealed post held at your relays…', () => b.ask<{ lines: v.Line[] }>('repost', { post: card.dataset.post, signer: card.dataset.signer }));
        if (r) {
          say('done', v.lines(r.lines));
          await readFeed();
        }
        break;
      }
      case 'copy-text': {
        const ok = await copy(d.text ?? '');
        el.textContent = ok ? 'Copied' : 'Select it and copy it';
        break;
      }
      case 'untip':
        if (card) card.querySelector('.tipping')!.innerHTML = '';
        break;
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
          const people = $<HTMLDetailsElement>('people');
          if (open && people) people.open = true;
          if (r.lines.length) say('done', v.lines(r.lines));
        }
        break;
      }
      case 'call': {
        const name = prompt('Your name for this identity. It stays in this app, never published.');
        if (name === null) break;
        if (await busy('Saving…', () => b.ask('call', { id: d.id, name }))) {
          await refresh();
          const people = $<HTMLDetailsElement>('people');
          if (people) people.open = true;
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
        if (filter === 'relay') void readRelay();
        await readPayments();
        await Promise.all([readFeed(true), readInbox()]);
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
      case 'leave-read': {
        const r = await busy('Reading the collective’s agreement in force…', () => b.ask<{ lines: v.Line[]; digest: string }>('leave read', { thread: d.thread }));
        const box = app.querySelector<HTMLElement>(`[data-leave="${CSS.escape(d.thread!)}"]`);
        if (r && box) box.innerHTML = v.leaveRead(d.thread!, r);
        break;
      }
      case 'leave-collective': {
        if (!confirm('Resign from this collective? Your resignation is public, and needs nobody else.')) break;
        const r = await busy('Signing your resignation, and telling the founder…', () => b.ask<{ lines: v.Line[] }>('leave collective', { thread: d.thread, digest: d.digest }));
        if (r) {
          await readSigning();
          say('done', `<strong>Resigned.</strong>${v.lines(r.lines)}`);
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
    if (form.classList.contains('tip')) {
      const card = form.closest<HTMLElement>('article');
      const lane = (ev as SubmitEvent).submitter?.getAttribute('value') === 'lane';
      const a = { post: card?.dataset.post, signer: card?.dataset.signer, value: String(d.get('value') ?? ''), unit: String(d.get('unit') ?? ''), whatFor: String(d.get('whatFor') ?? '') };
      const r = await busy(lane ? 'Asking where to pay, under the lane…' : 'Sealing the draft to this identity…', () => b.ask<{ lines: v.Line[] }>(lane ? 'tip now' : 'tip', a));
      if (r) {
        form.remove();
        say('done', v.lines(r.lines));
        if (lane) await readPayments();
      }
      return;
    }
    if (form.classList.contains('paid')) {
      const r = await busy('Checking the proof, then signing the claim under the lane…', () => b.ask<{ lines: v.Line[] }>('paid', { key: form.dataset.key, proof: String(d.get('proof') ?? '') }));
      if (r) {
        say('done', v.lines(r.lines));
        await readPayments();
      }
      return;
    }
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
      case 'relays': {
        const relays = linesOf(d.get('relays'));
        const r = await busy('Reading it back…', () => b.ask<{ digest: string; lines: v.Line[] }>('relays review', { relays }));
        if (r) fill('relays-review', `<div class="card">${v.lines(r.lines)}<div class="row"><button class="primary" data-action="relays publish" data-digest="${v.e(r.digest)}" data-relays="${v.e(relays.join('\n'))}">Sign and publish the new routes</button></div></div>`);
        return;
      }
      case 'lane': {
        const until = String(d.get('until') ?? '');
        const r = await busy('Sealing the lane’s request to this identity…', () =>
          b.ask<{ lines: v.Line[] }>('lane ask', { label: String(d.get('label') ?? ''), cap: String(d.get('cap') ?? ''), unit: String(d.get('unit') ?? ''), until: until ? Math.floor(new Date(until).getTime() / 1000) : '', clock: String(d.get('clock') ?? '') }),
        );
        if (r) {
          say('done', v.lines(r.lines));
          await readLanes();
        }
        return;
      }
      case 'sell': {
        const r = await busy('Sealing the post, its offer, and posting…', () =>
          b.ask<{ lines: v.Line[] }>('sell', { text: String(d.get('text') ?? ''), teaser: String(d.get('teaser') ?? ''), value: String(d.get('value') ?? ''), unit: String(d.get('unit') ?? ''), referral: String(d.get('referral') ?? '') }),
        );
        if (r) {
          form.reset();
          say('done', v.lines(r.lines));
          await readFeed();
        }
        return;
      }
      case 'askpaid': {
        const r = await busy('Sealing the draft to this identity…', () => b.ask<{ lines: v.Line[] }>('ask paid', { to: String(d.get('to') ?? ''), value: String(d.get('value') ?? ''), unit: String(d.get('unit') ?? ''), whatFor: String(d.get('whatFor') ?? '') }));
        if (r) {
          form.reset();
          say('done', v.lines(r.lines));
        }
        return;
      }
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
      void readLanes();
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
          const people = $<HTMLDetailsElement>('people');
          if (people) people.open = true;
          say('done', `<strong>Followed.</strong>${r.lines.length ? v.lines(r.lines) : ''}`);
        }
        return;
      }
    }
  });

  // H30: while the Signing tab is open and a share is awaited, Dub looks for it by itself, every 15 seconds.
  setInterval(() => {
    if (tab === 'signing' && shareAwaited && state?.stage === 'ready' && !document.hidden && !working) void readSigning();
  }, 15000);

  return { show };
}
