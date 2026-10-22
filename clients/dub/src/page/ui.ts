// Dub's page: its screens, clicks and forms, the same for the program on
// the Mac (`app.ts`, which asks the program) and for the web client
// (`../web/app.ts`, which runs Dub's code in this browser). Each gives a
// `Backend`: how to ask, and how to start again. Built on the kit
// (`clients/kit`): the act card and its two menus, the pop-up thread, the
// panels, names for @ and To…; this file says what each choice means in Dub.

import {
  attachCards,
  attachClosing,
  attachNames,
  card,
  closePanel,
  contactsPanel,
  copy,
  identityPanel,
  namedIn,
  note,
  openPanel,
  openSlot,
  panelOpen,
  popAt,
  Popup,
  profile as profilePage,
  redrawPanel,
  removeSaid,
  shortForm,
  type Contact,
  type KitAct,
  type MenuItem,
} from '../../../kit/src/index.ts';
import * as v from './view.ts';
import type { Collective, Item, Message, PayWays, Purchase, State } from '../shapes.ts';

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
  toYou: Item[];
  messages: Message[];
  encryption: boolean;
  opening?: string | null;
  hidden: number;
  problems: string[];
}

type Lines = { lines: v.Line[] };
const errorOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

export function mount(app: HTMLElement, b: Backend): { show(state: State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  app.classList.add('k-page', 'k-dub');
  let state: State | null = null;

  // ---------------------------------------------------------------- Kišib's runner: its panel in Dub's slot (the Dubsar runner cMIP, section 4)

  /** The panel shown now, if any, and the request it is for. */
  let slot: { close(): void; request: string } | null = null;
  /** A request whose panel the person closed: it still waits, in Kišib too. */
  let closedAsk: { request: string; panel: string; title: string; origin: string } | null = null;
  const raw = b.ask.bind(b);
  const NOT_WATCHED = new Set(['runner asking', 'runner', 'state', 'runner drop']);
  function showPanel(a: { request: string; panel: string; title: string }, origin: string) {
    slot?.close();
    closedAsk = null;
    // Only Kišib's origin, as Dub's program knows it, is framed; any other is refused and nothing drawn (the slot's rule 1).
    let s: ReturnType<typeof openSlot>;
    try {
      s = openSlot(app, {
      app: 'kishib',
      by: 'Kišib',
      host: 'Dub',
      src: a.panel,
      allowed: [origin, origin.replace('127.0.0.1', 'localhost')],
      closed: () => {
        slot = null;
        closedAsk = { ...a, origin };
        say('', `${v.e(a.title)}: Kišib waits for your answer. It waits in Kišib too (Runner, Waiting), for ten minutes. <button type="button" class="k-btn k-small" data-action="runner-again">Show the panel again</button> <button type="button" class="k-btn k-q k-small" data-action="runner-drop">Do not sign</button>`);
      },
      });
    } catch (e) {
      closedAsk = { ...a, origin };
      return say('error', v.e(errorOf(e)));
    }
    slot = { close: () => s.close(), request: a.request };
  }
  /**
   * Damgar's panel in Dub's slot (Ask Damgar, 2A): framed only from Damgar's
   * origin as Dub's program knows it; Dub cannot read it or press its
   * buttons. Dub asks its program, every second, whether it was answered,
   * and closes the frame then. Closed by the person, the payment still waits
   * in Damgar.
   */
  function damgarPanel(w: { request: string; panel: string; title: string; origin: string }) {
    let s: ReturnType<typeof openSlot>;
    let over = false;
    try {
      s = openSlot(app, {
        app: 'damgar',
        by: 'Damgar',
        host: 'Dub',
        src: w.panel,
        allowed: [w.origin, w.origin.replace('127.0.0.1', 'localhost')],
        closed: () => {
          over = true;
          say('', `${v.e(w.title)}: it waits in Damgar, in Waiting, to be signed or declined there.`);
        },
      });
    } catch (e) {
      return say('error', v.e(errorOf(e)));
    }
    void (async () => {
      while (!over) {
        await new Promise((r) => setTimeout(r, 1000));
        if (over) return;
        const a = await raw<{ answer: string; lines: v.Line[] }>('damgar answer', { request: w.request }).catch(() => null);
        if (!a || a.answer === 'waiting') continue;
        over = true;
        // Let the person read Damgar's own words in the frame a moment, then close it.
        await new Promise((r) => setTimeout(r, 1500));
        s.close();
        say(a.answer === 'signed' ? 'done' : '', a.answer === 'signed' ? `Damgar signed it. ${v.lines(a.lines)}` : a.answer === 'declined' ? 'Declined in Damgar: nothing was signed.' : 'Damgar’s panel waited past its ten minutes: the payment still waits in Damgar.');
        return;
      }
    })();
  }

  /** Each request to Dub's program, for an identity used through Kišib: while it waits, Kišib's panel is drawn when one is asked for. */
  b.ask = async <T>(op: string, a?: Record<string, unknown>): Promise<T> => {
    if (b.web || NOT_WATCHED.has(op) || state?.identity?.kind !== 'runner') return raw<T>(op, a);
    let over = false;
    const watch = (async () => {
      while (!over) {
        await new Promise((r) => setTimeout(r, 300));
        if (over) break;
        const w = await raw<{ asking: { request: string; panel: string; title: string } | null; origin: string | null }>('runner asking').catch(() => null);
        if (!over && w?.asking && w.origin && slot?.request !== w.asking.request && closedAsk?.request !== w.asking.request) showPanel(w.asking, w.origin);
      }
    })();
    try {
      return await raw<T>(op, a);
    } finally {
      over = true;
      await watch;
      slot?.close();
      slot = null;
      closedAsk = null;
    }
  };
  /** Decided: Dub always opens on Public. */
  let part: v.Part = 'public';
  let lens: v.Lens = 'following';
  let layers: string[] = ['text', 'envelopes'];
  let shelf: v.Shelf = 'all';
  let feed: Item[] = [];
  let inbox: Inbox | null = null;
  let relayItems: Item[] | null = null;
  let relayFoot = '';
  let feedFoot = '';
  let bought: Purchase[] | null = null;
  /** The conversation open in Private, by the other party's ID; null: none chosen. */
  let conv: string | null = null;
  /** A new conversation, with someone not yet written to. */
  let fresh: v.Who | null = null;
  /** The post being answered, if any. */
  let replying: { id: string; signer: string; name: string } | null = null;
  /** Identities a post is addressed to: To… and each @ chosen. */
  let addressed: { id: string; name: string }[] = [];
  /** Cc and the collective appended, for the message being written. */
  let cc: { id: string; name: string }[] = [];
  let appended: string | null = null;
  /** Words shown once, held only until they are hidden (H3). */
  let shown: { positions: number[] } | null = null;
  /** Whether a profile is open, and whose. */
  let profileOf: string | null = null;
  /** Every card drawn, by its ID, with what it shows. */
  const drawn = new Map<string, { act: KitAct; item?: Item; message?: Message; purchase?: Purchase }>();
  const popup = new Popup(app);

  // ---------------------------------------------------------------- saying

  /** What Dub says after something is done or refused: a note at the bottom, closed by a click. */
  function say(kind: 'error' | 'done' | '', html: string) {
    let s = $('status');
    if (!s) {
      s = document.createElement('div');
      s.id = 'status';
      s.className = 'k-status';
      s.setAttribute('aria-live', 'polite');
      app.append(s);
    }
    s.innerHTML = html ? `${note(kind, html)}<button type="button" class="k-round k-close" data-action="unsay" aria-label="Close">×</button>` : '';
    // What is done fades by itself; a refusal stays until closed.
    clearTimeout(fading);
    if (kind === 'done') fading = setTimeout(() => s?.isConnected && s.querySelector('.k-done') && (s.innerHTML = ''), 9000);
  }
  let fading: ReturnType<typeof setTimeout> | undefined;

  async function fail(err: unknown) {
    if (b.unpaired?.(err)) {
      void b.start();
      return;
    }
    const m = errorOf(err);
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
    say('', `<span class="k-small">${v.e(words)}</span>`);
    const was = [...app.querySelectorAll('button')].map((x) => [x, x.disabled] as const);
    app.querySelectorAll('button').forEach((x) => (x.disabled = true));
    try {
      const r = await f();
      say('', '');
      return r;
    } catch (err) {
      await fail(err);
      return undefined;
    } finally {
      for (const [x, d] of was) if (x.isConnected) x.disabled = d;
      working = false;
    }
  }

  // ---------------------------------------------------------------- the cards drawn

  const keep = (act: KitAct, more: { item?: Item; message?: Message; purchase?: Purchase }) => {
    drawn.set(act.id, { act, ...more });
    return act;
  };
  const collectives = () => state?.identity?.collectives.map((c) => c.id) ?? [];
  const itemCards = (items: Item[]) => items.map((it) => card(keep(v.itemAct(it, collectives()), { item: it }))).join('');

  /** The people this identity follows, for @, To…, Cc and Contacts: names first. */
  function contacts(): Contact[] {
    return (state?.identity?.follows ?? []).map((w) => ({ id: w.id, form: w.form, name: w.pet ?? w.names[0] ?? null, names: w.names, collective: collectives().includes(w.id) }));
  }

  // ---------------------------------------------------------------- reading

  /** "To you": the inbox's, and the feed's posts answering this identity, each once. */
  function toYou(): Item[] {
    const out = [...(inbox?.toYou ?? [])];
    for (const p of feed) if (p.toMe && !out.some((x) => x.id === p.id)) out.push(p);
    return out;
  }

  function counts() {
    const n = (k: number) => (k ? String(k) : '');
    const unseen = toYou().filter((x) => !x.seen).length;
    app.querySelectorAll<HTMLElement>('[data-k-count="toyou"]').forEach((x) => (x.textContent = n(unseen)));
    app.querySelectorAll<HTMLElement>('[data-k-count="public"]').forEach((x) => (x.textContent = n(unseen)));
    app.querySelectorAll<HTMLElement>('[data-k-count="private"]').forEach((x) => (x.textContent = n((inbox?.messages ?? []).filter((m) => !m.seen && m.dir === 'in').length)));
  }

  /** Films checked in this page, by publication: shown in whichever card holds them now, a redraw included. */
  const films = new Map<string, string>();
  /** Recordings checked, by publication, as films are. */
  const recordings = new Map<string, string>();
  function showFilms() {
    for (const box of app.querySelectorAll<HTMLElement>('[data-film]')) {
      const url = films.get(box.dataset.film ?? '');
      if (!url) continue;
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.src = url;
      video.dataset.checked = 'yes';
      box.replaceWith(video);
    }
    // Recordings, as films: played only from bytes the Module checked, on the listener's action (the audio Module, rule 11).
    for (const box of app.querySelectorAll<HTMLElement>('[data-recording]')) {
      const url = recordings.get(box.dataset.recording ?? '');
      if (!url) continue;
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = url;
      audio.dataset.checked = 'yes';
      box.replaceWith(audio);
    }
  }

  function drawFeed() {
    if (part !== 'public' || profileOf) return;
    const box = $('feed');
    if (!box) return;
    if (lens === 'relay') {
      box.innerHTML = relayItems ? (relayItems.length ? itemCards(relayItems) : '<p class="k-empty">Nothing of these layers at this identity’s relays yet.</p>') : '<p class="k-empty">Reading every public act at this identity’s relays…</p>';
      fill('feed-foot', relayFoot);
      showFilms();
      return;
    }
    const items = lens === 'toyou' ? toYou() : feed;
    box.innerHTML = items.length ? itemCards(items) : `<p class="k-empty">${lens === 'toyou' ? 'Nothing addressed to you yet: replies to your posts, and public messages to you, come here.' : 'Nothing yet. Write something, or follow someone.'}</p>`;
    fill('feed-foot', feedFoot);
    showFilms();
  }

  async function readFeed(again = false) {
    try {
      const r = await b.ask<{ items: Item[]; more: number; problems: string[]; notes?: string[]; followsChanged?: boolean; clock: { name: string; placed: number; shown: number } | null }>('feed', { fresh: again });
      feed = r.items;
      // The follow list sealed to the identity was changed by another app holding it: Contacts drawn again where open.
      if (r.followsChanged) {
        state = await b.ask<State>('state');
        if (panelOpen()?.dataset.kPanel === 'contacts') openContacts();
      }
      feedFoot = v.feedFoot(r.clock, [...(r.notes ?? []), ...r.problems]);
      drawFeed();
    } catch (err) {
      if (lens !== 'relay') fill('feed', note('error', v.e(errorOf(err))));
    }
    counts();
  }

  /** The Relay lens (H29, H55): every public act at this identity's relays, of the layers chosen. */
  async function readRelay() {
    relayItems = null;
    drawFeed();
    try {
      const r = await b.ask<{ items: Item[]; hidden: number; left: number; problems: string[]; clock: { name: string; placed: number; shown: number } | null }>('relay', { layers });
      relayItems = r.items;
      relayFoot = v.feedFoot(r.clock, [
        'At this identity’s relays, newest first: by the clock named where it stamped them, else in each relay’s own order, not a signed time. Anyone’s acts, not only those you follow.',
        ...(r.left ? [`${r.left} of other layers, behind the filter.`] : []),
        ...(r.hidden ? [`${r.hidden} from muted identities, not shown.`] : []),
        ...r.problems,
      ]);
      drawFeed();
    } catch (err) {
      if (lens === 'relay') fill('feed', note('error', v.e(errorOf(err))));
    }
  }

  async function readInbox() {
    try {
      inbox = await b.ask<Inbox>('inbox');
      // Proposals to sign that arrived are counted from the inbox just read (signed in Edubba).
      const st = await b.ask<State>('state');
      if (state && st.identity?.id === state.identity?.id) state.proposalsWaiting = st.proposalsWaiting;
      if (lens === 'toyou') drawFeed();
      if (part === 'private') drawPrivate();
    } catch (err) {
      if (part === 'private') fill('private-notes', note('error', v.e(errorOf(err))));
    }
    counts();
  }

  async function readBought() {
    try {
      const r = await b.ask<{ items: Purchase[]; problems: string[] }>('purchases');
      bought = r.items;
      drawBought();
      fill('bought-foot', `${r.problems.map((p) => `<p class="k-clock">${v.e(p)}</p>`).join('')}<button type="button" class="k-btn k-q k-small" data-action="look">Look again</button>`);
    } catch (err) {
      fill('bought', note('error', v.e(errorOf(err))));
    }
  }

  function drawBought() {
    const box = $('bought');
    if (!box || !bought) return;
    const shown = bought.filter((x) => shelf === 'all' || (shelf === 'files' ? x.kind === 'file' : x.kind === 'vow'));
    box.innerHTML = shown.length ? shown.map((p) => card(keep(v.purchaseAct(p), { purchase: p }))).join('') : '<p class="k-empty">Nothing bought here yet. A file or a vow you buy shows here.</p>';
  }

  /** Payments under the lane waiting for the wallet (round 2), and keys to deliver or arrived (round 2): looked for on opening and on Look again. */
  async function readPayments() {
    try {
      await b.ask('money look');
    } catch (err) {
      // H80: a key delivery refused because the key changed elsewhere is said where the new words are taken.
      if (errorOf(err).startsWith(SPENT)) await fail(err);
    }
  }

  /** Payments signed here under the lane, where a pop-up has a place for them: the invoice to pay, and the proof taken back. */
  let paymentsAgain: ReturnType<typeof setTimeout> | undefined;
  async function showPayments() {
    if (!$('payments')) return;
    try {
      await readPayments();
      const r = await b.ask<{ payments: v.PaymentShownHere[]; done: v.PaymentShownHere[]; problems: string[] }>('payments');
      const box = $('payments');
      if (!box) return;
      // The proof box is left alone while it is being typed in.
      if (box.querySelector('form#paid input[name=proof]:focus')) return;
      box.innerHTML = v.paymentsHere(r, whoOf);
      // A payment still waiting for the seller's invoice: looked for again while its place is open.
      clearTimeout(paymentsAgain);
      if (r.payments.some((p) => !p.pay?.invoice && !p.proofs.length)) paymentsAgain = setTimeout(() => void showPayments(), 4000);
    } catch (err) {
      fill('payments', note('error', v.e(errorOf(err))));
    }
  }

  async function check() {
    try {
      const c = await b.ask<{ current: boolean; say: string | null }>('check');
      const old = $('spent-box');
      if (c.current) old?.remove();
      else if (!old) {
        const holder = document.createElement('div');
        holder.innerHTML = v.spent(c.say ?? '');
        app.querySelector('.k-top')?.after(holder.firstElementChild!);
      }
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

  // ---------------------------------------------------------------- drawing

  async function refresh() {
    state = await b.ask<State>('state');
    await show(state);
  }

  async function show(s: State) {
    state = s;
    popup.close();
    closePanel();
    if (s.stage === 'confirm') {
      app.innerHTML = v.typeBack(shown?.positions ?? s.confirm!.positions);
      return;
    }
    if (s.stage === 'identity' && !s.identity) {
      app.innerHTML = v.firstScreen(b.web, b.suggested?.() ?? {});
      if (s.held.length) openIdentities();
      return;
    }
    draw();
    void check();
    await Promise.all([readFeed(), readInbox(), readPayments().then(() => (part === 'purchases' ? readBought() : undefined))]);
  }

  /** The window: the top, then the part chosen (or a profile). */
  function draw() {
    const s = state!;
    const body = profileOf ? `<div class="k-body"><section class="k-pane" id="profile"><p class="k-empty">Reading the profile…</p></section></div>` : part === 'public' ? v.publicPart(s, lens, layers) : part === 'private' ? '' : v.purchasesPart(shelf);
    app.innerHTML = `${v.topBar(s, profileOf ? null : part)}${body}`;
    if (part === 'private' && !profileOf) drawPrivate();
    if (part === 'public' && !profileOf) {
      drawFeed();
      drawTyping();
      wireNames();
    }
    if (part === 'purchases') drawBought();
    counts();
  }

  function drawTyping() {
    fill('replying', replying ? `<span class="k-chip k-on">Replying to ${v.e(replying.name)}<button type="button" class="k-x" data-action="unreply" aria-label="Not a reply">×</button></span>` : '');
    fill('addressed', addressed.map((a) => `<span class="k-chip k-on">To ${v.e(a.name)}<button type="button" class="k-x" data-action="unaddress-one" data-id="${v.e(a.id)}" aria-label="Not to them">×</button></span>`).join(''));
  }

  /** @ in the public typing box, To… and Cc: names from one's contacts, never hashes (H57, H78). */
  function wireNames() {
    const ta = app.querySelector<HTMLTextAreaElement>('#post textarea');
    if (ta) attachNames(ta, contacts, { mention: true, picked: (c) => addTo(c) });
    const to = $<HTMLInputElement>('to');
    if (to) attachNames(to, contacts, { mention: false, picked: (c) => (addTo(c), (to.value = ''), drawTyping()) });
    const ccf = $<HTMLInputElement>('cc');
    if (ccf) attachNames(ccf, contacts, { mention: false, title: 'Cc', picked: (c) => (addCc(c), (ccf.value = '')) });
    const cf = $<HTMLInputElement>('find-conv');
    cf?.addEventListener('input', () => {
      const q = cf.value.trim().toLowerCase();
      app.querySelectorAll<HTMLElement>('[data-conv]').forEach((x) => (x.hidden = !!q && !x.innerText.toLowerCase().includes(q)));
    });
  }

  const addTo = (c: Contact) => {
    if (!addressed.some((a) => a.id === c.id)) addressed.push({ id: c.id, name: c.name ?? shortForm(c.form) });
    drawTyping();
  };
  const addCc = (c: Contact) => {
    if (!cc.some((a) => a.id === c.id)) cc.push({ id: c.id, name: c.name ?? shortForm(c.form) });
    drawCc();
  };
  const drawCc = () => fill('ccs', cc.map((a) => `<span class="k-chip k-on">Cc: ${v.e(a.name)}<button type="button" class="k-x" data-action="uncc-one" data-id="${v.e(a.id)}" aria-label="Not in Cc">×</button></span>`).join(''));

  // ---------------------------------------------------------------- Private: a mailbox

  function conversations(): v.Conversation[] {
    const me = state!.identity!.who;
    const byWith = new Map<string, v.Conversation>();
    for (const m of inbox?.messages ?? []) {
      if (!m.with) continue;
      const c = byWith.get(m.with) ?? { with: m.dir === 'in' ? m.who : (state!.identity!.follows.find((f) => f.id === m.with) ?? m.cc[0] ?? whoOf(m.with)), last: null, unseen: 0 };
      if (m.dir === 'out' && c.with.id !== m.with) c.with = whoOf(m.with);
      if (!c.last || m.at > c.last.at) c.last = m;
      if (m.dir === 'in' && !m.seen) c.unseen++;
      byWith.set(m.with, c);
    }
    if (fresh && !byWith.has(fresh.id)) byWith.set(fresh.id, { with: fresh, last: null, unseen: 0 });
    void me;
    return [...byWith.values()].sort((a, b) => (b.last?.at ?? Infinity) - (a.last?.at ?? Infinity));
  }

  /** An identity this page knows only by its ID. */
  function whoOf(id: string): v.Who {
    const f = state?.identity?.follows.find((x) => x.id === id);
    if (f) return f;
    for (const m of inbox?.messages ?? []) {
      if (m.who.id === id) return m.who;
      const c = m.cc.find((x) => x.id === id);
      if (c) return c;
    }
    return { id, short: `${id.slice(0, 8)}…${id.slice(-4)}`, names: [], pet: null, me: false, followed: false, muted: false, form: v.actFormOf(id, 'mid'), link: v.actFormOf(id, 'mid') };
  }

  function drawPrivate() {
    if (part !== 'private' || profileOf) return;
    const all = conversations();
    const open = conv ? (all.find((c) => c.with.id === conv) ?? null) : null;
    const msgs = open ? (inbox?.messages ?? []).filter((m) => m.with === open.with.id).sort((a, b) => a.at - b.at) : [];
    const body = app.querySelector('.k-body');
    const html = v.privatePart(state!, all, open, msgs.map((m) => (keep(v.messageAct(m), { message: m }), m)));
    if (body) body.outerHTML = html;
    else app.insertAdjacentHTML('beforeend', html);
    const notes = [
      ...(inbox && !inbox.encryption
        ? [inbox.opening ?? 'No encryption key for this identity is here, so its private messages cannot be opened here: it was brought by words that do not carry the one it publishes.']
        : []),
      ...(inbox?.hidden ? [`${inbox.hidden} from muted identities, not shown.`] : []),
      ...(state?.proposalsWaiting ? [`${state.proposalsWaiting === 1 ? 'A proposal to sign waits' : `${state.proposalsWaiting} proposals to sign wait`} in this identity’s inbox: sign them in Edubba, Collectives › To sign.`] : []),
      ...(inbox?.problems ?? []),
    ];
    fill('private-notes', notes.map((n) => `<p class="k-clock">${v.e(n)}</p>`).join(''));
    const t = $('thread');
    if (t) t.scrollTop = t.scrollHeight;
    if (appended) app.querySelector(`[data-append="${CSS.escape(appended)}"]`)?.classList.add('k-on');
    drawCc();
    wireNames();
    if (open) void seen(msgs.filter((m) => !m.seen && m.dir === 'in').map((m) => m.key));
  }

  // ---------------------------------------------------------------- the profile

  async function openProfile(id: string) {
    profileOf = id;
    popup.close();
    closePanel();
    draw();
    try {
      const r = await b.ask<{ who: v.Who; lives: string; trouble: string | null; items: Item[]; clock: { name: string; placed: number; shown: number } | null; problems: string[] }>('profile', { id });
      if (profileOf !== id) return;
      const me = r.who.me;
      fill(
        'profile',
        profilePage({
          who: v.kitWho(r.who, collectives().includes(r.who.id)),
          lives: r.lives,
          trouble: r.trouble,
          actions: me ? [] : [r.who.followed ? { key: 'unfollow', label: 'Following' } : { key: 'follow', label: 'Follow', primary: true }, { key: 'message', label: 'Message' }, { key: 'pay', label: 'Pay' }],
          cards: itemCards(r.items),
          empty: 'Nothing found from them yet at the places asked.',
          record: 'its homes, keys and lines',
          clock: v.feedFoot(r.clock, r.problems),
        }),
      );
    } catch (err) {
      fill('profile', `<div class="k-row"><button type="button" class="k-btn k-q" data-k-back="profile">← Back</button></div>${note('error', v.e(errorOf(err)))}`);
    }
  }

  // ---------------------------------------------------------------- the act card's menus: what each choice means in Dub

  attachClosing();
  attachCards(app, {
    app: v.NAME,
    act: (id) => drawn.get(id)?.act,
    signerItems: (a) => (a.signer.me ? [] : [{ key: 'message', label: 'Message' }]),
    actItems(a) {
      const d = drawn.get(a.id);
      const it = d?.item;
      const before: MenuItem[] = [];
      const after: MenuItem[] = [];
      if (it || d?.message) before.push({ key: 'reply', label: 'Reply' });
      // Repost: a sealed post, held at this identity's relays with what it names (round 2): where Dub can repost.
      if (it?.sealed && !it.who.me && it.sealed.seller === it.who.id) before.push({ key: 'repost', label: 'Repost' });
      if (!a.signer.me && (it || d?.message)) after.push({ key: 'tip', label: 'Tip' });
      if (it?.sealed?.state === 'for sale' && !it.who.me) after.push({ key: 'buy', label: 'Buy' });
      if (it?.vow?.state === 'for sale' && !it.who.me && !it.vow.problem) after.push({ key: 'buy-vow', label: 'Buy' });
      for (const p of it?.pictures.filter((x) => x.withdrawable) ?? []) after.push({ key: `withdraw:${p.publication}`, label: 'Withdraw the picture' });
      for (const f of it?.films?.filter((x) => x.withdrawable) ?? []) after.push({ key: `withdraw:${f.publication}`, label: 'Withdraw the film' });
      for (const r of it?.recordings?.filter((x) => x.withdrawable) ?? []) after.push({ key: `withdraw:${r.publication}`, label: 'Withdraw the recording' });
      // Decided (question 5): confirm or contest only on vows the identity bought.
      const vow = it?.vow?.state === 'bought' ? it.vow.vow : d?.purchase?.kind === 'vow' && d.purchase.paid && d.purchase.sale !== 'confirmed' && d.purchase.sale !== 'contested' ? d.purchase.id : null;
      if (vow) after.push({ key: `confirm:${vow}`, label: 'Confirm: it was kept', line: true }, { key: `contest:${vow}`, label: 'Contest it…' });
      return { before, after };
    },
    choose: (key, a) => void choose(key, a),
  });

  async function choose(key: string, a: KitAct) {
    const d = drawn.get(a.id);
    const signer = a.signer.id;
    switch (key) {
      case 'profile':
        return openProfile(signer);
      case 'open': {
        const target = a.corrects ?? a.answers;
        if (!target) return;
        const title = a.corrects ? `What ${a.signer.name ?? 'it'}’s correction corrects` : `What ${a.signer.me ? 'your' : `${a.signer.name ?? 'this'}’s`} ${d?.message ? 'message' : 'post'} answers`;
        popup.show(title, '<p class="k-empty">Reading it from where its signer lives…</p>');
        try {
          const r = await b.ask<{ item: Item }>('open', { id: target.id, signer: target.signer ?? '' });
          popup.replace(`${'<div class="k-feedwrap"><div class="k-feed">'}${itemCards([r.item])}${card(a, { selected: true })}</div></div><p class="k-clock">The same card, the same two menus. Back returns; closing returns to where you were.</p>`);
        } catch (err) {
          popup.replace(note('error', v.e(errorOf(err))));
        }
        return;
      }
      case 'why': {
        popup.show('Why it’s valid', '<p class="k-empty">Reading it, and its signer’s identity chain…</p>');
        try {
          const r = await b.ask<{ title: string; lines: v.Line[] }>('why', { id: a.id, signer });
          popup.replace(`<h4>${v.e(r.title)}</h4>${v.lines(r.lines)}`);
        } catch (err) {
          popup.replace(note('error', v.e(errorOf(err))));
        }
        return;
      }
      case 'follow':
      case 'unfollow':
      case 'mute':
      case 'unmute':
        return people(key, signer);
      case 'message':
        return startConversation(whoOf(signer).id === signer && state?.identity?.follows.some((f) => f.id === signer) ? whoOf(signer) : (d?.item?.who ?? d?.message?.who ?? whoOf(signer)));
      case 'reply': {
        popup.close();
        if (d?.message) {
          conv = d.message.with;
          part = 'private';
          profileOf = null;
          draw();
          app.querySelector<HTMLTextAreaElement>('#message textarea')?.focus();
          return;
        }
        replying = { id: a.id, signer, name: a.signer.me ? 'yourself' : (a.signer.name ?? shortForm(a.signer.form)) };
        part = 'public';
        profileOf = null;
        draw();
        app.querySelector<HTMLTextAreaElement>('#post textarea')?.focus();
        return;
      }
      case 'repost': {
        const r = await busy('Reposting, with the sealed post held at your relays…', () => b.ask<Lines>('repost', { post: a.id, signer }));
        if (r) (say('done', v.lines(r.lines)), await readFeed());
        return;
      }
      case 'rely': {
        popup.show('Rely on it', '<p class="k-empty">Reading it back…</p>');
        try {
          const r = await b.ask<{ lines: v.Line[]; explanation: string; blocking: string[] }>('rely read', { id: a.id, signer });
          const body = popup.replace(v.relyForm(r));
          body?.querySelector<HTMLFormElement>('#rely')?.setAttribute('data-act', a.id);
          body?.querySelector<HTMLFormElement>('#rely')?.setAttribute('data-signer', signer);
        } catch (err) {
          popup.replace(note('error', v.e(errorOf(err))));
        }
        return;
      }
      case 'anchor': {
        const body = popup.show('Anchor it', v.anchorForm(null));
        body.dataset.act = a.id;
        return;
      }
      case 'correct': {
        const body = popup.show('Correct it', v.correctForm());
        body.dataset.act = a.id;
        return;
      }
      case 'tip':
        return payOpen('tip', a, d);
      case 'buy':
        return payOpen('buy', a, d);
      case 'buy-vow':
        return payOpen('vow', a, d);
    }
    if (key.startsWith('withdraw:')) {
      const publication = key.slice('withdraw:'.length);
      if (!confirm('Withdraw it? Readers stop showing it; the post stays. It cannot be undone.')) return;
      const r = await busy('Withdrawing…', () => b.ask<{ id: string }>('withdraw', { publication }));
      if (r) (say('done', `Withdrawn (act <code>${v.e(shortForm(v.actFormOf(r.id)))}</code>).`), await readFeed());
      return;
    }
    if (key.startsWith('confirm:')) {
      const vow = key.slice('confirm:'.length);
      if (!confirm('Confirm that this vow was kept? Your claim of its payment, acknowledging the vow, is signed in public.')) return;
      const r = await busy('Signing your confirmation…', () => b.ask<Lines>('vow confirm', { vow }));
      if (r) (say('done', v.lines(r.lines)), await Promise.all([readFeed(), readBought()]));
      return;
    }
    if (key.startsWith('contest:')) {
      const body = popup.show('Contest it', v.contestForm());
      body.dataset.vow = key.slice('contest:'.length);
    }
  }

  async function people(op: 'follow' | 'unfollow' | 'mute' | 'unmute', id: string) {
    if (op === 'mute' && !confirm('Mute this identity? Nothing of it is shown here any more. Nobody is told; it is never published.')) return;
    const r = await busy('Saving…', () => b.ask<Lines>(op, { id }));
    if (!r) return;
    state = await b.ask<State>('state');
    if (op === 'follow') say('done', `<strong>Added to contacts.</strong>${r.lines.length ? v.lines(r.lines) : ''}`);
    else if (r.lines.length) say('done', v.lines(r.lines));
    if (panelOpen()?.dataset.kPanel === 'contacts') openContacts();
    if (profileOf) return openProfile(profileOf);
    await readFeed();
  }

  function startConversation(w: v.Who) {
    popup.close();
    closePanel();
    profileOf = null;
    part = 'private';
    conv = w.id;
    if (!(inbox?.messages ?? []).some((m) => m.with === w.id)) fresh = w;
    cc = [];
    appended = null;
    draw();
    app.querySelector<HTMLTextAreaElement>('#message textarea')?.focus();
  }

  // ---------------------------------------------------------------- paying: one chooser, the ways open

  let paying: { kind: 'tip' | 'buy' | 'vow' | 'pay'; signer: string; post?: string; publication?: string; vow?: string; repost?: string; reposter?: string } | null = null;

  async function payOpen(kind: 'tip' | 'buy' | 'vow' | 'pay', a: KitAct | null, d?: { item?: Item }, to?: v.Who) {
    const it = d?.item;
    const who = to ?? whoOf(a!.signer.id);
    paying = { kind, signer: who.id };
    if (kind === 'tip' && a) paying.post = a.id;
    if (kind === 'buy' && it?.sealed) Object.assign(paying, { publication: it.sealed.publication, signer: it.sealed.seller, ...(it.repost ? { repost: it.id, reposter: it.repost.by.id } : { post: it.id }) });
    if (kind === 'vow' && it?.vow) Object.assign(paying, { vow: it.vow.vow, signer: it.vow.seller, post: it.id });
    const name = v.nameOf(who);
    const title = kind === 'tip' ? `Tip ${name}` : kind === 'pay' ? `Pay ${name}` : kind === 'vow' ? `Buy ${name}’s vow` : `Buy ${name}’s sealed ${it?.sealed?.media ?? 'file'}`;
    popup.show(title, '<p class="k-empty">Reading the ways open…</p>');
    try {
      const ways = await b.ask<PayWays>('pay ways', { kind });
      popup.replace(v.payChooser({ title, sub: `${kind === 'tip' && a ? `For ${shortForm(a.form)} · ` : ''}${name} · ${shortForm(who.form)}`, kind, ways, units: state?.units ?? [], price: it?.vow?.price ?? it?.sealed?.price ?? null }));
    } catch (err) {
      popup.replace(note('error', v.e(errorOf(err))));
    }
  }

  // ---------------------------------------------------------------- the identity panel and its menus

  function panelIds() {
    const s = state!;
    const ids = s.held.map((h) => {
      const on = h.active;
      const cs: Collective[] = on ? (s.identity?.collectives ?? []) : [];
      return {
        id: h.id,
        form: v.actFormOf(h.id, 'mid'),
        name: h.who.names[0] ?? null,
        on: on && !s.identity?.acting,
        collectives: cs.map((c) => ({ id: c.id, form: c.form, name: c.name, on: s.identity?.acting === c.id, why: c.available ? null : c.why })),
      };
    });
    return ids;
  }

  const ADD = [
    { key: 'make', label: 'Make one', say: 'its chain key’s words shown once' },
    { key: 'bring', label: 'Bring one', say: 'its ID and its signing key’s words' },
    b.web
      ? { key: 'kishib', label: 'Use one from Kišib', say: 'through Kišib’s runner, in the computer’s program only: never in the web client', empty: true }
      : { key: 'kishib', label: 'Use one from Kišib', say: 'through Kišib’s runner, on this Mac: Dub holds no key' },
  ];

  function identityHtml(adding = false, inside = '') {
    return identityPanel({ ids: panelIds(), adding, add: ADD, foot: '<button type="button" class="k-btn k-q k-small" data-action="this-app">This app: paired browsers, the clock, homes and relays</button>', inside });
  }

  function openIdentities() {
    openPanel(app, identityHtml(false));
  }

  function openContacts() {
    const html = contactsPanel({ contacts: contacts(), action: 'Message', below: v.contactsBelow(state!) });
    if (panelOpen()?.dataset.kPanel === 'contacts') redrawPanel(html);
    else openPanel(app, html);
  }

  /** An identity's own menu: Name, Relays, Words, Line and homes, A lane from Damgar, A collective; a line; Remove, said plainly first. */
  function identityMenu(button: HTMLElement, id: string) {
    const s = state!;
    const inUse = s.identity?.id === id;
    const h = s.held.find((x) => x.id === id);
    const name = h?.who.names[0] ?? 'this identity';
    const items = inUse
      ? [
          ['name', 'Name', s.identity!.who.names[0] ?? 'none'],
          ['relays', 'Relays', String(s.identity!.relays.length)],
          ['words', 'Words', 'the signing words'],
          ['line', 'Line and homes', ''],
          ['lane', 'A lane from Damgar', ''],
          ['collective', 'A collective under it', String(s.identity!.collectives.length || '')],
        ]
      : [['use', 'Use this one', '']];
    popAt(
      button,
      `<div class="k-pop" role="menu"><div class="k-t">${v.e(name)} · ${v.e(shortForm(v.actFormOf(id, 'mid')))}</div>${items.map(([k, l, hint]) => `<button type="button" role="menuitem" data-k-item="${k}">${v.e(l)}${hint ? `<span class="k-k">${v.e(hint)}</span>` : ''}</button>`).join('')}<hr><button type="button" role="menuitem" data-k-item="remove">Remove from Dub…</button></div>`,
      'below',
      (key) => void identityChoice(key, id, name),
    );
  }

  /** + Add, Use one from Kišib: where the pairing stands, and the identities Kišib lets Dub use. */
  async function runnerPopup() {
    const body = popup.show('Use one from Kišib', '<p class="k-small k-soft">Asking Kišib, on this Mac…</p>');
    const r = await raw<v.RunnerState>('runner').catch((e) => ({ available: true, origin: null, state: null, code: null, identities: [], problem: errorOf(e) }) as v.RunnerState);
    if (body.isConnected) popup.replace(v.runnerForm(r));
  }

  async function identityChoice(key: string, id: string, name: string) {
    const s = state!;
    const runnerKind = s.held.find((x) => x.id === id)?.kind === 'runner';
    switch (key) {
      case 'use':
        return use(id, null);
      case 'remove':
        redrawPanel(identityHtml(false, runnerKind ? v.runnerRemoveSaid(name) : removeSaid('Dub', name)));
        app.querySelector<HTMLElement>('[data-k-remove-yes]')!.dataset.id = id;
        return;
      case 'name':
        closePanel();
        popup.show('Name', v.nameForm(s));
        return;
      case 'relays':
        closePanel();
        popup.show('Relays', v.relaysForm(s));
        return;
      case 'words': {
        closePanel();
        if (runnerKind) return void popup.show('The signing key’s words', v.runnerWords());
        const r = await busy('Reading the identity…', () => b.ask<{ grouped: string; words: string[]; say: string[] }>('carry'));
        if (r) popup.show('The signing key’s words', v.carry(r));
        return;
      }
      case 'line':
        closePanel();
        popup.show('Line and homes', v.lineFacts(s));
        return;
      case 'lane': {
        closePanel();
        const r = await b.ask<{ lanes: { label: string; state: string; cap: string; total: string | null; until: number | null }[]; say: string[] }>('lanes').catch(() => null);
        const body = popup.show('A lane from Damgar', v.laneForm(s, b.web, r?.say ?? []));
        const l = body.querySelector('#lanes');
        if (l) l.innerHTML = r ? v.lanesHere(r.lanes) : '';
        await showPayments();
        return;
      }
      case 'collective':
        closePanel();
        popup.show('A collective under it', v.collectiveForm(s));
        return;
    }
  }

  async function use(id: string, as: string | null) {
    closePanel();
    const s = state!;
    if (s.identity?.id !== id) {
      const r = await busy('Switching…', () => b.ask('use', { id }));
      if (!r) return;
      feed = [];
      inbox = null;
      relayItems = null;
      bought = null;
      conv = null;
      fresh = null;
    }
    if (as !== (state?.identity?.acting ?? null) || s.identity?.id !== id) {
      const r = await busy(as ? 'Acting as the collective…' : 'Acting as the identity itself…', () => b.ask('act as', { id: as ?? '' }));
      if (!r) return refresh();
    }
    replying = null;
    addressed = [];
    profileOf = null;
    await refresh();
  }

  // ---------------------------------------------------------------- clicks

  app.addEventListener('change', async (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name === 'picture' || el.name === 'video' || el.name === 'audio') {
      // One file at a time: picking one forgets the others.
      if (el.files?.[0]) for (const other of app.querySelectorAll<HTMLInputElement>('#post input[type=file]')) if (other !== el) other.value = '';
      fill('picked', el.files?.[0] ? `${el.name === 'video' ? 'Film' : el.name === 'audio' ? 'Recording' : 'Picture'}: ${v.e(el.files[0].name)} <button type="button" class="k-x" data-action="unpick" aria-label="Not this file">×</button>` : '');
    }
    if (el.id === 'publish-list') {
      const on = el.checked;
      if (on && !confirm(v.PUBLISH_WARNING)) {
        el.checked = false;
        return;
      }
      const r = await busy(on ? 'Publishing the follow list…' : 'Making the follow list private again…', () => b.ask<Lines>('list', { published: on, shown: on ? v.PUBLISH_WARNING : '' }));
      if (r) {
        state = await b.ask<State>('state');
        openContacts();
        say('done', v.lines(r.lines));
      } else el.checked = !on;
    }
  });

  app.addEventListener('click', async (ev) => {
    const t = ev.target as HTMLElement;
    // The kit's own: the switch, lenses, panels, the identity rows.
    const partB = t.closest<HTMLElement>('[data-k-part]');
    if (partB) {
      part = partB.dataset.kPart as v.Part;
      profileOf = null;
      draw();
      // Keys that arrived for what was bought are looked for first: a file opens once its key is here.
      if (part === 'purchases') void readPayments().then(readBought);
      if (part === 'private') void readInbox();
      return;
    }
    const lensB = t.closest<HTMLElement>('[data-k-lens]');
    if (lensB) {
      lens = lensB.dataset.kLens as v.Lens;
      app.querySelectorAll<HTMLElement>('[data-k-lens]').forEach((x) => (x.classList.toggle('k-on', x === lensB), x.setAttribute('aria-selected', String(x === lensB))));
      draw();
      if (lens === 'relay') void readRelay();
      if (lens === 'toyou') void seen(toYou().filter((x) => !x.seen).map((x) => x.id));
      return;
    }
    const layerB = t.closest<HTMLElement>('[data-k-layer]');
    if (layerB) {
      const k = layerB.dataset.kLayer!;
      layers = layers.includes(k) ? layers.filter((x) => x !== k) : [...layers, k];
      if (!layers.length) layers = ['text', 'envelopes'];
      draw();
      void readRelay();
      return;
    }
    const shelfB = t.closest<HTMLElement>('[data-k-shelf]');
    if (shelfB) {
      shelf = shelfB.dataset.kShelf as v.Shelf;
      app.querySelectorAll<HTMLElement>('[data-k-shelf]').forEach((x) => x.classList.toggle('k-on', x === shelfB));
      drawBought();
      return;
    }
    const opener = t.closest<HTMLElement>('[data-k-open]');
    if (opener?.dataset.kOpen === 'identity') return openIdentities();
    if (opener?.dataset.kOpen === 'contacts') return openContacts();
    const useB = t.closest<HTMLElement>('[data-k-use]');
    if (useB) return use(useB.dataset.kUnder ?? useB.dataset.kUse!, useB.dataset.kUnder ? useB.dataset.kUse! : null);
    const more = t.closest<HTMLElement>('[data-k-idmenu]');
    if (more) {
      ev.stopPropagation();
      return identityMenu(more, more.dataset.kIdmenu!);
    }
    const add = t.closest<HTMLElement>('[data-k-add]');
    if (add) {
      const k = add.dataset.kAdd!;
      if (k === 'toggle') return void redrawPanel(identityHtml(!add.classList.contains('k-on')));
      closePanel();
      if (k === 'make') popup.show('Make a new identity', v.makeForm(b.web, b.suggested?.() ?? {}));
      if (k === 'bring') popup.show('Bring an identity you have', v.bringForm(b.web));
      if (k === 'kishib') await runnerPopup();
      return;
    }
    if (t.closest('[data-k-remove-no]')) return void redrawPanel(identityHtml(false));
    const yes = t.closest<HTMLElement>('[data-k-remove-yes]');
    if (yes) {
      const id = yes.dataset.id!;
      closePanel();
      if (await busy('Removing it from Dub…', () => b.ask('forget', { id }))) {
        feed = [];
        inbox = null;
        bought = null;
        await b.start();
        say('done', 'Removed from Dub: its keys and what Dub kept about it are gone from this device. Its acts, its homes and the other apps keep it.');
      }
      return;
    }
    const contactOpen = t.closest<HTMLElement>('[data-k-contact-open]');
    if (contactOpen) return openProfile(contactOpen.dataset.kContactOpen!);
    const contactDo = t.closest<HTMLElement>('[data-k-contact-do]');
    if (contactDo) return startConversation(whoOf(contactDo.dataset.kContactDo!));
    const prof = t.closest<HTMLElement>('[data-k-do]');
    if (prof && profileOf) {
      const k = prof.dataset.kDo!;
      if (k === 'follow' || k === 'unfollow') return people(k, profileOf);
      if (k === 'message') return startConversation(whoOf(profileOf));
      if (k === 'pay') return payOpen('pay', null, undefined, whoOf(profileOf));
    }
    if (t.closest('[data-k-back="profile"]')) {
      profileOf = null;
      draw();
      void readFeed();
      return;
    }
    const copyB = t.closest<HTMLElement>('[data-k-copy],[data-copy-text]');
    if (copyB) {
      const was = copyB.textContent;
      copyB.textContent = (await copy(copyB.dataset.kCopy ?? copyB.dataset.copyText ?? '')) ? 'Copied' : 'Select it and copy it';
      setTimeout(() => (copyB.textContent = was), 1500);
      return;
    }
    const convB = t.closest<HTMLElement>('[data-conv]');
    if (convB) {
      conv = convB.dataset.conv!;
      cc = [];
      appended = null;
      return drawPrivate();
    }
    const appendB = t.closest<HTMLElement>('[data-append]');
    if (appendB) {
      appended = appended === appendB.dataset.append ? null : appendB.dataset.append!;
      app.querySelectorAll<HTMLElement>('[data-append]').forEach((x) => (x.classList.toggle('k-on', x.dataset.append === appended), x.setAttribute('aria-pressed', String(x.dataset.append === appended))));
      return;
    }
    const el = t.closest<HTMLElement>('[data-action]');
    if (!el) return;
    const d = el.dataset;
    switch (d.action) {
      case 'unsay':
        return say('', '');
      case 'runner-again':
        if (closedAsk) showPanel(closedAsk, closedAsk.origin);
        return say('', '');
      case 'runner-drop':
        if (closedAsk) await raw('runner drop', { request: closedAsk.request }).catch(() => undefined);
        closedAsk = null;
        return say('', '');
      case 'runner-pair': {
        const r = await busy('Asking Kišib…', () => raw<{ code: string }>('runner pair'));
        if (r) await runnerPopup();
        return;
      }
      case 'runner-look':
        return runnerPopup();
      case 'runner-take': {
        const r = await busy('Reading the identity from its homes…', () => raw<Lines>('runner take', { id: d.id }));
        if (!r) return;
        popup.close();
        await b.start();
        say('done', v.lines(r.lines));
        return;
      }
      case 'written':
        // H3: the words go before three are asked back.
        app.innerHTML = v.typeBack(shown!.positions);
        return;
      case 'abandon':
        if (!confirm('Forget this new identity? Nothing of it was published. A new one will show new words.')) return;
        shown = null;
        try {
          await b.ask('abandon');
          await b.start();
        } catch (err) {
          await fail(err);
        }
        return;
      case 'this-app': {
        closePanel();
        popup.show('This app', v.appFoot(state!, b.web));
        return;
      }
      case 'code': {
        const r = await busy('Making a code…', () => b.ask<{ code: string }>('code'));
        if (r) fill('code', note('', `Code for another browser, valid ten minutes, once: <code>${v.e(r.code)}</code>`));
        return;
      }
      case 'unpair':
        if (!confirm('Unpair this browser? It will need a new link from the app.')) return;
        try {
          await b.unpair?.();
          await b.start();
        } catch (err) {
          await fail(err);
        }
        return;
      case 'collective-remove': {
        const r = await busy('Removing it…', () => b.ask<Lines>('collective remove', { id: d.id }));
        if (r) (await refresh(), say('done', v.lines(r.lines)));
        return;
      }
      case 'at': {
        const ta = app.querySelector<HTMLTextAreaElement>('#post textarea');
        if (!ta) return;
        const at = ta.selectionStart ?? ta.value.length;
        const before = ta.value.slice(0, at);
        ta.value = `${before}${before && !/\s$/.test(before) ? ' ' : ''}@${ta.value.slice(at)}`;
        ta.focus();
        ta.setSelectionRange(ta.value.length - (ta.value.length - at) + (before && !/\s$/.test(before) ? 2 : 1), ta.value.length - (ta.value.length - at) + (before && !/\s$/.test(before) ? 2 : 1));
        ta.dispatchEvent(new Event('input'));
        return;
      }
      case 'address':
        $('to-field')!.hidden = false;
        $('to')?.focus();
        return;
      case 'unaddress': {
        const to = $<HTMLInputElement>('to');
        // A name typed and not chosen, or an ID pasted: taken as it is.
        if (to?.value.trim()) addressed.push({ id: namedIn(to, contacts()), name: to.value.trim() });
        if (to) to.value = '';
        $('to-field')!.hidden = true;
        return drawTyping();
      }
      case 'unaddress-one':
        addressed = addressed.filter((a) => a.id !== d.id);
        return drawTyping();
      case 'unreply':
        replying = null;
        return drawTyping();
      case 'unpick':
        app.querySelectorAll<HTMLInputElement>('#post input[type=file]').forEach((x) => (x.value = ''));
        return fill('picked', '');
      case 'cc':
        $('cc-field')!.hidden = false;
        $('cc')?.focus();
        return;
      case 'uncc': {
        const f = $<HTMLInputElement>('cc');
        if (f?.value.trim()) cc.push({ id: namedIn(f, contacts()), name: f.value.trim() });
        if (f) f.value = '';
        $('cc-field')!.hidden = true;
        return drawCc();
      }
      case 'uncc-one':
        cc = cc.filter((a) => a.id !== d.id);
        return drawCc();
      case 'askpaid':
        popup.show(`Ask ${conv ? v.nameOf(whoOf(conv)) : 'them'} to pay you`, v.askPaidForm(state?.units ?? []));
        return;
      case 'convs':
        conv = null;
        return drawPrivate();
      case 'new-conv': {
        const body = popup.show('A new conversation', '<form id="new-conv" class="dub-modal-form"><label>To: a contact’s name, or an ID</label><input name="to" id="new-to" autocomplete="off" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Open it</button></div></form>');
        const f = body.querySelector<HTMLInputElement>('#new-to')!;
        attachNames(f, contacts, { mention: false, picked: () => undefined });
        f.focus();
        return;
      }
      case 'unmute':
        return people('unmute', d.id!);
      case 'play': {
        const box = el.closest<HTMLElement>('[data-film]')!;
        el.textContent = 'Reading and checking the film…';
        try {
          const r = await b.ask<{ b64: string; type: string }>('film', { publication: box.dataset.film, signer: box.dataset.filmSigner });
          const bytes = Uint8Array.from(atob(r.b64), (c) => c.charCodeAt(0));
          // The card may have been drawn again meanwhile: the film goes to wherever it is now.
          films.set(box.dataset.film!, URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' })));
          showFilms();
        } catch (err) {
          box.innerHTML = `<span class="k-label k-warn">The film is not played: ${v.e(errorOf(err))}</span>`;
        }
        return;
      }
      case 'play-recording': {
        const box = el.closest<HTMLElement>('[data-recording]')!;
        // A browser that says it cannot decode AAC in M4A is said so before anything is fetched (the audio Module, rule 12).
        if (!document.createElement('audio').canPlayType('audio/mp4; codecs="mp4a.40.2"')) {
          box.innerHTML = '<span class="k-label k-warn">The recording is not played: this browser says it cannot play AAC sound in M4A, so nothing was fetched.</span>';
          return;
        }
        el.textContent = 'Reading and checking the recording…';
        try {
          // Checked by the audio Module (rules 2 to 9) before its bytes come back: a recording it refuses never reaches the player.
          const r = await b.ask<{ b64: string; type: string }>('recording', { publication: box.dataset.recording, signer: box.dataset.recordingSigner });
          const bytes = Uint8Array.from(atob(r.b64), (c) => c.charCodeAt(0));
          recordings.set(box.dataset.recording!, URL.createObjectURL(new Blob([bytes], { type: 'audio/mp4' })));
          showFilms();
        } catch (err) {
          box.innerHTML = `<span class="k-label k-warn">The recording is not played: ${v.e(errorOf(err))}</span>`;
        }
        return;
      }
      case 'look':
        say('', '');
        await readPayments();
        if (part === 'purchases') return readBought();
        if (lens === 'relay') void readRelay();
        await Promise.all([readFeed(true), readInbox()]);
        return;
    }
  });

  // ---------------------------------------------------------------- forms

  const text = (s: FormDataEntryValue | null) => (typeof s === 'string' ? s.trim() : '');
  const linesOf = (s: FormDataEntryValue | null) => text(s).split(/\s+/).filter(Boolean);
  const viaOf = (s: FormDataEntryValue | null) => text(s).split('\n').map((x) => x.trim()).filter(Boolean);

  /** A file as base64, read in this browser. */
  function base64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  // Enter sends in a typing box; Shift and Enter goes to a new line.
  app.addEventListener('keydown', (ev) => {
    const ta = ev.target as HTMLElement;
    if (ev.key === 'Enter' && !ev.shiftKey && ta instanceof HTMLTextAreaElement && ta.closest('.k-typing') && !app.querySelector('[data-k-suggest]')) {
      ev.preventDefault();
      ta.closest('form')?.requestSubmit();
    }
  });

  app.addEventListener('submit', async (ev) => {
    const form = ev.target as HTMLFormElement;
    // Not `form.id`: a form's fields shadow its properties (the bring form has a field named "id").
    const name = form.getAttribute('id');
    if (name === 'pair') return; // the program's own start handles it (`app.ts`)
    ev.preventDefault();
    const d = new FormData(form);
    const body = form.closest<HTMLElement>('.k-mbody');
    switch (name) {
      case 'begin': {
        const r = await busy('Asking each home who runs it, and making the identity…', () =>
          b.ask<{ words: string[]; positions: number[]; say: string[] }>('begin', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: viaOf(d.get('via')), name: String(d.get('name') ?? '') }),
        );
        // The words are on the page now and nowhere else it can reach: a reload will not show them again.
        if (r) {
          popup.close();
          shown = { positions: r.positions };
          app.innerHTML = v.words(r.words, r.say);
        }
        return;
      }
      case 'confirm': {
        const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
        const r = await busy('Checking the words, then sending the genesis to the homes…', () => b.ask<Lines>('confirm', { typed }));
        if (r) {
          shown = null;
          part = 'public';
          await b.start();
          say('done', `<strong>The identity is born.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'bring': {
        const r = await busy('Reading the identity from its homes…', () => b.ask<Lines>('bring', { id: text(d.get('id')), words: text(d.get('words')), address: text(d.get('address')), relays: linesOf(d.get('relays')), via: viaOf(d.get('via')) }));
        if (r) {
          popup.close();
          feed = [];
          inbox = null;
          part = 'public';
          await b.start();
          say('done', `<strong>The identity is here.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'renew': {
        const r = await busy('Checking the new words at its homes…', () => b.ask<Lines>('renew', { words: text(d.get('words')) }));
        if (r) (await refresh(), say('done', `<strong>The new words are in use.</strong>${v.lines(r.lines)}`));
        return;
      }
      case 'name': {
        const r = await busy('Publishing the name…', () => b.ask<Lines & { names: string[] }>('name', { name: String(d.get('name') ?? '') }));
        if (r) (await refresh(), say('done', r.lines.length ? v.lines(r.lines) : 'Nothing changed.'));
        return;
      }
      case 'relays': {
        const relays = linesOf(d.get('relays'));
        const r = await busy('Reading it back…', () => b.ask<{ digest: string; lines: v.Line[] }>('relays review', { relays }));
        if (r && body) {
          const rv = body.querySelector('#relays-review');
          if (rv) rv.innerHTML = `<div class="k-box">${v.lines(r.lines)}<form id="relays-publish" data-digest="${v.e(r.digest)}" data-relays="${v.e(relays.join('\n'))}"><button type="submit" class="k-btn k-p">Sign and publish the new routes</button></form></div>`;
        }
        return;
      }
      case 'relays-publish': {
        const r = await busy('Publishing the new routes…', () => b.ask<Lines>('relays publish', { relays: (form.dataset.relays ?? '').split('\n'), digest: form.dataset.digest }));
        if (r) (await refresh(), say('done', v.lines(r.lines)));
        return;
      }
      case 'lane': {
        const until = String(d.get('until') ?? '');
        const r = await busy('Sealing the lane’s request to this identity…', () =>
          b.ask<Lines>('lane ask', { label: String(d.get('label') ?? ''), cap: String(d.get('cap') ?? ''), total: String(d.get('total') ?? ''), unit: String(d.get('unit') ?? ''), until: until ? Math.floor(new Date(until).getTime() / 1000) : '', clock: String(d.get('clock') ?? '') }),
        );
        if (r) {
          popup.close();
          say('done', v.lines(r.lines));
        }
        return;
      }
      case 'collective': {
        const r = await busy('Reading the collective and your member key…', () => b.ask<Lines>('collective add', { id: text(d.get('id')) }));
        if (r) (await refresh(), say('done', v.lines(r.lines)));
        return;
      }
      case 'clock': {
        const r = await busy('Saving…', () => b.ask<Lines>('clock', { id: text(d.get('id')), name: text(d.get('name')) }));
        if (r) (await refresh(), say('done', v.lines(r.lines)));
        return;
      }
      case 'follow': {
        const r = await busy('Following…', () => b.ask<Lines>('follow', { id: text(d.get('id')), name: text(d.get('name')) }));
        if (r) {
          state = await b.ask<State>('state');
          openContacts();
          say('done', `<strong>Added to contacts.</strong>${r.lines.length ? v.lines(r.lines) : ''}`);
          void readFeed();
        }
        return;
      }
      case 'post': {
        const pic = (form.elements.namedItem('picture') as HTMLInputElement).files?.[0];
        const film = (form.elements.namedItem('video') as HTMLInputElement).files?.[0];
        const sound = (form.elements.namedItem('audio') as HTMLInputElement | null)?.files?.[0];
        const reply = replying ? { id: replying.id, signer: replying.signer } : undefined;
        const to = $<HTMLInputElement>('to');
        if (to?.value.trim()) addressed.push({ id: namedIn(to, contacts()), name: to.value.trim() });
        const r = await busy(film ? 'Checking the film, stripping it, publishing, and reading it back…' : sound ? 'Checking the recording, stripping it, publishing, and reading it back…' : pic ? 'Stripping the picture, publishing, and reading it back…' : 'Publishing, and reading it back…', async () =>
          b.ask<{ post: Item; lines: v.Line[] }>('post', { text: String(d.get('text') ?? ''), jpeg: pic ? await base64(pic) : '', mp4: film ? await base64(film) : '', m4a: sound ? await base64(sound) : '', to: addressed.map((a) => a.id), reply }),
        );
        if (r) {
          form.reset();
          replying = null;
          addressed = [];
          if (to) (to.value = '', ($('to-field')!.hidden = true));
          fill('picked', '');
          drawTyping();
          feed = [r.post, ...feed.filter((x) => x.id !== r.post.id)];
          lens = 'following';
          draw();
          // The feed read again before "Posted." is said: drawn again after, it would close a card's menu just opened.
          await readFeed();
          say('done', `<strong>Posted.</strong>${v.lines(r.lines)}`);
        }
        return;
      }
      case 'message': {
        if (!conv) return;
        const f = $<HTMLInputElement>('cc');
        if (f?.value.trim()) cc.push({ id: namedIn(f, contacts()), name: f.value.trim() });
        const r = await busy('Sealing it, and leaving it in each inbox…', () => b.ask<Lines>('message', { to: conv!, text: String(d.get('text') ?? ''), cc: cc.map((x) => x.id), collective: appended ?? '' }));
        if (r) {
          fresh = null;
          cc = [];
          appended = null;
          say('done', `<strong>Sent.</strong>${v.lines(r.lines)}`);
          await readInbox();
          drawPrivate();
        }
        return;
      }
      case 'new-conv': {
        const f = form.querySelector<HTMLInputElement>('input')!;
        const id = namedIn(f, contacts());
        let who: v.Who;
        if (/^[0-9a-f]{64}$/.test(id)) who = whoOf(id);
        else {
          // An ID written for people, or with where it lives: Dub reads it when sending; shown by what was typed.
          const typed = id.trim();
          who = { id: typed, short: shortForm(typed), names: [], pet: null, me: false, followed: false, muted: false, form: typed.split('?')[0], link: typed };
        }
        startConversation(who);
        return;
      }
      case 'askpaid': {
        const r = await busy('Sealing the request to this identity…', () => b.ask<Lines>('ask paid', { to: conv ?? '', value: String(d.get('value') ?? ''), unit: String(d.get('unit') ?? ''), whatFor: String(d.get('whatFor') ?? '') }));
        if (r) (popup.close(), say('done', v.lines(r.lines)));
        return;
      }
      case 'pay': {
        if (!paying) return;
        const how = String(d.get('how') ?? '');
        const r = await busy(how === 'lane' ? 'Signing under Dub’s lane…' : how === 'damgar' ? 'Sealing the payment for Damgar…' : 'Writing it out…', () =>
          b.ask<{ lines: v.Line[]; hand?: { text: string; said: string[] }; woken?: { request: string; panel: string; title: string; origin: string } }>('pay', { ...paying, how, value: String(d.get('value') ?? ''), unit: String(d.get('unit') ?? ''), whatFor: String(d.get('whatFor') ?? '') }),
        );
        if (!r) return;
        if (r.hand) {
          popup.replace(`${v.lines(r.lines)}${v.byHand(r.hand)}`);
          return;
        }
        if (r.woken) {
          // Ask Damgar, on this computer (2A): Damgar found the draft on MOR and draws its panel here, in the slot; Dub learns only the answer.
          popup.close();
          damgarPanel(r.woken);
          return;
        }
        if (how === 'lane') {
          // Under the lane: the invoice to pay in the wallet, and the proof taken back, right here.
          popup.replace(`${v.lines(r.lines)}<div id="payments"><p class="k-small k-soft">Reading…</p></div>`);
          await showPayments();
        } else {
          popup.close();
          say('done', v.lines(r.lines));
        }
        await Promise.all([readFeed(), part === 'purchases' ? readBought() : Promise.resolve()]);
        return;
      }
      case 'rely': {
        const r = await busy('Signing the witness act…', () => b.ask<Lines>('rely', { id: form.dataset.act, signer: form.dataset.signer, typed: String(d.get('typed') ?? '') }));
        if (r) (popup.close(), say('done', v.lines(r.lines)));
        return;
      }
      case 'anchor-offers': {
        const service = text(d.get('service'));
        const r = await busy('Reading the service’s standing offers…', () => b.ask<{ offers: Parameters<typeof v.anchorForm>[0] }>('anchor offers', { service }));
        if (r && body) {
          const act = body.dataset.act;
          popup.replace(v.anchorForm(r.offers, service));
          const nb = app.querySelector<HTMLElement>('.k-mbody');
          if (nb && act) nb.dataset.act = act;
        }
        return;
      }
      case 'anchor': {
        const [offer, tier] = String(d.get('tier') ?? ':').split(':');
        const r = await busy('Preparing the payment for Damgar…', () => b.ask<Lines>('anchor', { id: body?.dataset.act, service: form.dataset.service, offer, tier: Number(tier) }));
        if (r) (popup.close(), say('done', v.lines(r.lines)));
        return;
      }
      case 'correct': {
        const r = await busy('Signing the correction…', () => b.ask<Lines>('correct', { id: body?.dataset.act, text: String(d.get('text') ?? '') }));
        if (r) (popup.close(), say('done', v.lines(r.lines)), await readFeed());
        return;
      }
      case 'contest': {
        if (!confirm('Contest this sale? A contest naming it is signed in public. It voids nothing.')) return;
        const r = await busy('Signing your contest…', () => b.ask<Lines>('vow contest', { vow: body?.dataset.vow, promise: String(d.get('promise') ?? '') }));
        if (r) (popup.close(), say('done', v.lines(r.lines)), await Promise.all([readFeed(), readBought()]));
        return;
      }
      case 'paid': {
        const r = await busy('Checking the proof, then signing the claim under the lane…', () => b.ask<Lines>('paid', { key: form.dataset.key, proof: String(d.get('proof') ?? '') }));
        if (r) (say('done', v.lines(r.lines)), await showPayments(), await Promise.all([readFeed(), readBought()]));
        return;
      }
    }
  });

  return { show };
}
