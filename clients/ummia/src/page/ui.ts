// Ummia's page: its screens, clicks and forms, on the kit, the same for the
// program on the Mac and Linux (`app.ts`, which asks the program) and for
// the web client (`../web/app.ts`, which runs Ummia's code in this
// browser). It keeps one thing in the browser's session storage, which tile
// and part were open (`ummia:at`); Look's point and filters in memory;
// nothing of a key or an act.

import { keyStringHtml } from '../../../../modules/carry/src/key-html.ts';
import { NOT_STAMPED, attachCards, attachClosing, attachColumn, attachContacts, attachIds, card, cardsUntimed, closePanel, copy, feedBox, identityPanel, namesHtml, openPanel, openSlot, ownId, panelOpen, popAt, Popup, redrawPanel, removeSaid, openConfirm, keyChanged, rulesAsk, attachRules, rulesPart, shortForm, stampCards, type KitAct, type Named } from '../../../kit/src/index.ts';
import * as v from './view.ts';
import type { Done, Review, State } from '../shapes.ts';
import type { LookItem, Looked, SpecPage } from '../look.ts';
import type { MipDraft, Reply } from '../mips.ts';
import type { AnchorShown } from '../anchor.ts';

export interface Backend {
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  web: boolean;
  start(): Promise<void>;
  unpaired?(err: unknown): boolean;
}

type Lines = { lines: v.Line[] };
type Page = SpecPage & { mine: boolean; say: string[] };
type Threads = { threads: { id: string; title: string; spec: string | null; kind: 'thread' | 'draft'; replies: (Reply & { mine: boolean })[] }[]; lines: v.Line[] };
const errorOf = (err: unknown) => (err instanceof Error ? err.message : String(err));
const TABS: v.Tab[] = ['look', 'discuss', 'publish', 'choose'];
/** Look's filters at first: every kind as drawn; MIPs one chip more, off. */
const EVERY: v.LookAt['filters'] = ['releases', 'cmips', 'modules', 'xtypes', 'extensions'];

export function mount(app: HTMLElement, b: Backend): { show(state: State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  app.classList.add('k-page', 'k-ummia');
  let state: State | null = null;
  let tab: v.Tab | null = null;
  let part = '';
  /** Look's point, filters and layer (decided: "point at … filter by …"); memory only. */
  let at: v.LookAt = { point: { kind: 'relay', value: '' }, filters: [...EVERY], layer: null };
  /** A specification's page open in Look, by its hash. */
  let page: string | null = null;
  let openMip: string | null = null;
  let counts = { mips: 0, threads: 0, reports: 0, anchors: 0, published: 0 };
  /** The last review shown, and what it was: a specification is followed by its card. */
  let reviewing: { kind: 'spec' | 'mip' | 'card' | 'release'; title: string } | null = null;
  const popup = new Popup(app);
  attachClosing();

  try {
    const kept = JSON.parse(sessionStorage.getItem('ummia:at') ?? 'null') as { tab: v.Tab; part: string } | null;
    if (kept && TABS.includes(kept.tab)) [tab, part] = [kept.tab, kept.part];
  } catch {
    // no session storage: the four tiles
  }
  const keepAt = () => {
    try {
      sessionStorage.setItem('ummia:at', JSON.stringify(tab ? { tab, part } : null));
    } catch {
      // nothing kept
    }
  };

  // ---------------------------------------------------------------- saying

  function say(kind: 'error' | 'done' | '', html: string) {
    let s = $('status');
    if (!s) {
      app.insertAdjacentHTML('beforeend', '<div id="status" class="k-status"></div>');
      s = $('status')!;
    }
    s.innerHTML = `${v.note(kind, html)}<button type="button" class="k-round k-close" data-action="status-close" aria-label="Close">×</button>`;
  }
  // H82, H83: the kit's warning, a pop-up with the box for the new words, for the identity in use only.
  const spentShown = (m: string | null) => {
    const i = state?.identity;
    keyChanged(app, m && i ? { id: i.id, name: v.labelOf(i.named, 'This identity'), say: m, form: v.renewForm() } : null);
  };
  const fail = (err: unknown) => {
    if (b.unpaired?.(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    const m = errorOf(err);
    if (/^This identity’s signing key was changed elsewhere/.test(m)) spentShown(m);
    say('error', v.e(m));
  };
  const done = (r: { lines?: v.Line[]; title?: string } | undefined) => {
    if (r?.lines?.length) say('done', `${r.title ? `<b>${v.e(r.title)}</b>` : ''}${v.lines(r.lines)}`);
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

  // ---------------------------------------------------------------- Kišib's runner: its panel in Ummia's slot (the Dubsar runner cMIP, section 4)

  let slot: { close(): void; request: string } | null = null;
  const raw = b.ask.bind(b);
  const NOT_WATCHED = new Set(['runner asking', 'runner', 'state', 'runner drop', 'look', 'spec page', 'clock words', 'check', 'accepted', 'published here', 'discussions', 'releases', 'mips', 'reports', 'contacts', 'names']);
  b.ask = async <T>(op: string, a?: Record<string, unknown>): Promise<T> => {
    if (b.web || NOT_WATCHED.has(op) || !state?.identity?.runner) return raw<T>(op, a);
    let over = false;
    const watch = (async () => {
      while (!over) {
        await new Promise((r) => setTimeout(r, 300));
        if (over) break;
        const w = await raw<{ asking: { request: string; panel: string; title: string } | null; origin: string | null }>('runner asking').catch(() => null);
        if (over || !w?.asking || !w.origin || slot?.request === w.asking.request) continue;
        const asked = w.asking;
        slot?.close();
        try {
          const s = openSlot(app, {
            app: 'kishib',
            by: 'Kišib',
            host: 'Ummia',
            src: asked.panel,
            allowed: [w.origin, w.origin.replace('127.0.0.1', 'localhost')],
            closed: () => {
              slot = null;
              void raw('runner drop', { request: asked.request }).catch(() => undefined);
            },
          });
          slot = { close: () => s.close(), request: asked.request };
        } catch (e) {
          say('error', v.e(errorOf(e)));
        }
      }
    })();
    try {
      return await raw<T>(op, a);
    } finally {
      over = true;
      await watch;
      slot?.close();
      slot = null;
    }
  };

  // ---------------------------------------------------------------- names, contacts and short IDs (H96, H100, H106, H109, H119, H121)

  /** Names read for the signers of the cards drawn, by ID; read again once the contacts change. */
  const known = new Map<string, Named>();
  /** H100: Contacts top left, the one list; every Contacts button beside a field taking an ID (H119). */
  const contacts = attachContacts(app, {
    app: 'Ummia',
    ask: (op, a) => b.ask(op, a),
    profile: (id) => profileOf(id),
    said: (kind, html) => {
      known.clear();
      say(kind, html);
    },
  });
  // H96, H106, H121: every identity Ummia shows has its names asked for; every short ID shows whole on a tap, copies on a second.
  attachIds(app, { names: (ids, fresh) => b.ask<Record<string, Named>>('names', { ids, fresh: !!fresh }), profile: (id) => profileOf(id) });

  /** The cards' signers, named once drawn (H106): their nicknames and published names, read by Ummia's engine. */
  async function nameCards(root: HTMLElement) {
    const arts = [...root.querySelectorAll<HTMLElement>('.k-act[data-k-signer]')];
    const ids = [...new Set(arts.map((a) => a.dataset.kSigner!))].filter((id) => !known.has(id) && /^[0-9a-f]{64}$/.test(id));
    if (ids.length) {
      try {
        for (const [id, n] of Object.entries(await b.ask<Record<string, Named>>('names', { ids }))) known.set(id, n);
      } catch {
        // not reached: said as such below, never "no name"
      }
    }
    for (const a of arts) {
      if (!a.isConnected) continue;
      const n = known.get(a.dataset.kSigner!) ?? { published: { state: 'unreached' as const } };
      const box = a.querySelector(':scope > .k-signer .k-names');
      if (box) box.innerHTML = namesHtml(n, { retry: false });
      const d = drawn.get(a.dataset.kAct!);
      if (d) d.act.signer.named = n;
    }
  }

  /** H88: one's own ID whole, with Copy ID and Share your ID link, at the end of bringing an identity. */
  const ownIdNow = () => (state?.identity ? `<p class="k-small k-soft">Its ID, to give to whoever may write to it:</p>${ownId({ form: state.identity.form, link: state.identity.link })}` : '');

  // ---------------------------------------------------------------- drawing

  async function show(s: State) {
    state = s;
    closePanel();
    if (s.stage === 'identity') {
      app.innerHTML = v.firstScreen(b.web);
      return;
    }
    await draw();
    void b
      .ask<{ current: boolean; say: string | null }>('check')
      .then((c) => spentShown(c.current ? null : c.say))
      .catch(() => undefined);
    void readCounts();
  }

  async function draw() {
    keepAt();
    if (!tab) {
      app.innerHTML = v.home(state!, b.web);
      askRules();
      return;
    }
    app.innerHTML = v.tabPage(state!, tab, part, counts);
    askRules();
    await fill();
  }

  // ---------------------------------------------------------------- Rules I follow (H93)

  /** A rule Ummia runs not approved yet: asked under the top, for the identity in use. */
  function askRules() {
    const s = state;
    rulesAsk(app, s?.identity && s.rules ? { id: s.identity.id, app: 'Ummia', missing: s.rules.missing, open: () => void go('choose', 'ummia-rules') } : null);
  }

  const rulesHtml = () => `<h2>Ummia’s own rules</h2>${rulesPart({ app: 'Ummia', rules: state?.rules?.rules ?? [], problem: state?.rules?.problem ?? null, manage: 'Every layer, above: your whole list, every app’s part of it.' })}`;

  async function rulesChosen(key: string, where: 'here' | 'list', remove = false) {
    try {
      const r = await b.ask<{ lines: v.Line[]; rules: NonNullable<State['rules']> }>('rules approve', { keys: [key], where, remove });
      if (!state) return;
      state.rules = r.rules;
      if (tab === 'choose') await draw();
      say('done', v.lines(r.lines));
    } catch (err) {
      fail(err);
    }
  }

  attachRules(app, { approve: (key, where) => void rulesChosen(key, where), stop: (key) => void rulesChosen(key, 'here', true) });

  /** The column's quiet counts, read after drawing. */
  async function readCounts() {
    const s = state;
    if (!s?.identity) return;
    const m = await b.ask<{ drafts: MipDraft[] }>('mips').catch(() => null);
    counts = {
      mips: m?.drafts.length ?? s.counts.mips,
      threads: s.counts.cards ? (await b.ask<{ discussions: unknown[] }>('published here').catch(() => ({ discussions: [] }))).discussions.length + (m?.drafts.reduce((n, d) => n + d.drafts.length, 0) ?? 0) : (m?.drafts.reduce((n, d) => n + d.drafts.length, 0) ?? 0),
      reports: s.counts.reports,
      anchors: s.counts.anchors,
      published: s.counts.specs + s.counts.releases,
    };
    const col = app.querySelector('.k-col');
    if (!col) return;
    const n: Record<string, number> = { mips: counts.mips, threads: counts.threads, reports: counts.reports, anchoring: counts.anchors, published: counts.published };
    for (const [k, x] of Object.entries(n)) {
      const el = col.querySelector(`[data-k-col="${k}"] .k-k`);
      if (el) el.textContent = String(x);
    }
  }

  const pane = () => $('pane');
  /** Each fill numbered: a part chosen since wins over one still being read. */
  let filling = 0;

  /** The part open, filled from what Ummia reads. */
  async function fill() {
    const p = pane();
    if (!p) return;
    const mine = ++filling;
    try {
      const html = await partHtml();
      if (mine !== filling || !p.isConnected) return void (cards = []);
      p.innerHTML = html;
      drawCards();
      void nameCards(p);
      // The Dubsar clock's time on each card it stamped (decided 23 October 2026), read after drawing.
      const ids = cardsUntimed(p);
      if (ids.length)
        void b
          .ask<Record<string, string>>('clock words', { ids })
          .then((w) => p.isConnected && stampCards(p, w))
          .catch(() => undefined);
    } catch (err) {
      if (mine !== filling) return;
      p.innerHTML = '';
      fail(err);
    }
  }

  // ---------------------------------------------------------------- cards: each with the kit's two menus

  const drawn = new Map<string, { act: KitAct; item: LookItem | null }>();
  let cards: { act: KitAct; item: LookItem | null }[] = [];
  const meId = () => state?.identity?.id ?? '';
  /** An identity named where Ummia shows it in words (H96, H106): its names, its short ID under, a tap away. */
  const whoOf = (id: string) => v.idCopy(id, { me: id === meId(), inline: true });
  /** A card's signer: its names as read (Loading… until then), filled in once drawn (`nameCards`). */
  const who = (id: string): KitAct['signer'] => {
    const form = v.formOf(id, 'mid');
    const named = id === meId() ? (state?.identity?.named ?? null) : (known.get(id) ?? { nick: null, published: { state: 'loading' as const } });
    return { id, form, link: form, name: null, named, me: id === meId() };
  };

  /** An identity's profile, as Ummia has one: its ID, Look pointed at it, Follow their releases. */
  function profileOf(id: string) {
    const me = id === meId();
    const named = me ? state?.identity?.named : known.get(id);
    popup.show(me ? 'You' : v.labelOf(named, 'Their profile'), `<dl class="k-facts"><dt>ID</dt><dd>${v.idCopy(id, { me })}</dd></dl><div class="k-row"><button type="button" class="k-btn k-p" data-point-id="${v.e(id)}">Point Look at them</button>${me ? '' : `<button type="button" class="k-btn" data-follow-releases="${v.e(id)}">Follow their releases</button>`}</div><p class="k-small k-soft">Full record in Kišib. Their posts and profile are in Dub.</p>`);
  }
  const cardOf = (a: KitAct, item: LookItem | null = null) => {
    cards.push({ act: a, item });
    return card(a);
  };
  function drawCards() {
    drawn.clear();
    for (const c of cards) drawn.set(c.act.id, c);
    cards = [];
  }
  const itemCard = (x: LookItem) =>
    cardOf(
      {
        id: x.id,
        form: v.formOf(x.id),
        signer: who(x.signer),
        kind: x.kind,
        text: x.text,
        html: `<div class="ummia-acts">${x.hash ? `${v.hashCopy(x.hash)}<button type="button" class="k-btn k-q k-small" data-spec="${v.e(x.hash)}">Its page</button>` : ''}${x.release ? `<button type="button" class="k-btn k-q k-small" data-point-release="${v.e(x.id)}">Its line</button>` : ''}</div>`,
        labels: x.labels,
        verified: x.verified,
        alarm: x.alarm,
        when: x.when,
        unstamped: x.when ? null : NOT_STAMPED,
        hint: x.hint,
        own: x.signer === meId(),
      },
      x,
    );

  attachCards(app, {
    app: 'Ummia',
    act: (id) => drawn.get(id)?.act,
    signerItems: (a) => (a.signer.me ? [] : [{ key: 'follow-releases', label: 'Follow their releases' }]),
    // "Add to accepted list" in the act menu, below the line (decided).
    actItems: (a) => ({ before: [{ key: 'accept', label: 'Add to accepted list', disabled: !drawn.get(a.id)?.item?.hash, hint: drawn.get(a.id)?.item?.hash ? undefined : 'not a specification' }], after: [] }),
    async choose(key, a) {
      const c = drawn.get(a.id);
      const item = c?.item ?? null;
      switch (key) {
        case 'profile':
          return void profileOf(a.signer.id);
        case 'follow':
          return void popup.show('Follow: add to contacts', followForm(a.signer.id, false));
        case 'follow-releases':
          return void popup.show('Follow their releases', followForm(a.signer.id, true));
        case 'unfollow':
          // H100: the one list, Contacts top left: Nickname… and Remove there.
          return void contacts.open();
        case 'mute':
        case 'unmute':
          return void popup.show('Muting is Dub’s', '<p class="k-soft">Ummia shares the one contacts list (Contacts, top left); muting is done in Dub, from their card or profile.</p>');
        case 'why':
          return void popup.show('Why it’s valid', `${v.lines([{ text: a.verified ? 'Its signature and its place in its signer’s sequence hold, judged through its signer’s chain by the core library.' : (a.alarm ?? 'Not shown as valid.'), tone: a.verified ? 'ok' : 'bad' }, ...(item?.hash ? [{ text: 'Its content decodes as a specification (Development, Part three), and its hash is computed from that content.' }] : []), ...(item?.release ? [{ text: 'Its manifest was found and matches its fingerprint. “Check it as anyone would” (Publish) fetches every file.' }] : [])])}`);
        case 'open':
          return void popup.show('What it answers', '<p class="k-soft">It answers nothing.</p>');
        case 'accept':
          if (item?.hash) popup.show('Add to accepted list', v.acceptForm(item.hash, item.title));
          return;
        case 'rely':
          return void popup.show('Rely on it', v.relyForm(a.id));
        case 'anchor': {
          const x = await act(() => b.ask<{ anchorSay: string[] }>('releases'));
          return void popup.show('Anchor it', v.anchorForm(a.id, null, x?.anchorSay ?? []));
        }
        case 'correct':
          return void popup.show('Correct it', `<p class="k-soft">${item?.hash ? 'A specification is never corrected: a changed one is a new one, with a new hash (Development rule 4). What can be said again is its card: sign a later one.' : 'A release is never corrected: publish the next one, naming this one as the one before it.'}</p>${item?.hash ? `<div class="k-row"><button type="button" class="k-btn k-p" data-action="card-new" data-hash="${v.e(item.hash)}" data-title="${v.e(item.title)}">Sign a later card</button></div>` : ''}`);
      }
    },
  });

  const followForm = (id: string, releases: boolean) =>
    `<form id="${releases ? 'follow-releases' : 'follow'}" data-id="${v.e(id)}">${v.say(releases ? 'Their releases, in Look’s saved points: the one contacts list, here it filters.' : 'Added to the one contacts list, the same in every app.', ['Your contacts are sealed to you at your homes: nobody else can read them, nor the nickname you give.'])}<p>${v.idCopy(id)}</p><label>Your nickname for it (optional: only you see it)</label><input name="name" maxlength="48" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">${releases ? 'Follow their releases' : 'Add to contacts'}</button></div></form>`;

  // ---------------------------------------------------------------- each part

  async function partHtml(): Promise<string> {
    const s = state!;
    if (tab === 'look') {
      if (part === 'page') return v.pageForm();
      if (part === 'acts') return v.actsForm();
      if (part === 'saved-none') return `<h2>Saved points</h2><p class="k-soft">None yet. Point Look somewhere and press “Save this point”, or choose “Follow their releases” in a signer’s menu: a developer’s releases, from the same follow list Dub reads.</p>`;
      if (page) {
        const p = await b.ask<Page>('spec page', { hash: page });
        return v.specPagePane(p, whoOf);
      }
      const saved = part.startsWith('saved:') ? (s.saved.find((x) => `saved:${x.key}` === part) ?? null) : null;
      const here: v.LookAt = saved ? { point: { kind: saved.point.kind, value: saved.point.value }, filters: saved.filters, layer: null } : at;
      const head = v.lookHead(here, s, saved);
      if (here.point.kind === 'release' && !here.point.value) return `${head}${feedBox({ id: 'look-feed', cards: '', empty: 'Name a release by its act ID, then Look.' })}`;
      if (here.point.kind === 'id' && !here.point.value) return `${head}${feedBox({ id: 'look-feed', cards: '', empty: 'Name an identity by its ID, then Look.' })}`;
      const l = await b.ask<Looked & { limit: string[] }>('look', { point: here.point, filters: here.filters, layer: here.layer ?? '' });
      return `${head}${l.lines.length ? v.lines(l.lines) : ''}${feedBox({ id: 'look-feed', cards: l.items.map(itemCard).join(''), empty: 'Nothing found there with these filters.' })}${v.lookFoot(l.limit, l.counts, l.ordered)}`;
    }
    if (tab === 'discuss') {
      if (part === 'mip-new') return v.mipNew((await b.ask<{ forkable: { key: string; name: string }[] }>('mips')).forkable);
      if (part === 'reports') return v.reportsPane(await b.ask<Parameters<typeof v.reportsPane>[0]>('reports'));
      if (part === 'threads') {
        const t = await b.ask<Threads>('discussions');
        return `<h2>Discussions</h2>${v.say('The threads started here and the MIP drafts published for discussion, each with its replies.', ['A reply comes from any app: Dub’s replies are plain posts; here, a reply is a signed document. Replies are found in your inbox and on the relays you name.'])}${v.lines(t.lines)}${
          t.threads
            .map(
              (x) => `<div class="k-box" data-thread="${v.e(x.id)}"><div class="k-row"><h3 class="k-grow">${v.e(x.title)}</h3>${v.actCopy(x.id)}</div>${x.spec ? `<div class="k-row">${v.hashCopy(x.spec, false, 'about')}<button type="button" class="k-btn k-q k-small" data-spec="${v.e(x.spec)}">Its page</button></div>` : ''}<div class="k-feed">${x.replies.map((r) => cardOf({ id: r.id, form: v.formOf(r.id), signer: who(r.signer), kind: r.sealed ? 'sent to you' : null, text: r.text, verified: r.standing === 'valid', alarm: r.standing === 'valid' ? null : r.standing, own: r.mine })).join('') || '<p class="k-empty">No reply found yet.</p>'}</div><div class="k-row"><button type="button" class="k-btn" data-action="reply-open" data-to="${v.e(x.id)}" data-title="${v.e(x.title)}">Reply, as a signed document</button></div></div>`,
            )
            .join('') || '<p class="k-empty">No discussion yet: a thread is started with a specification’s card (Publish), and a MIP draft is published for discussion here.</p>'
        }`;
      }
      return v.mipsPane(await b.ask<Parameters<typeof v.mipsPane>[0]>('mips'), openMip);
    }
    if (tab === 'publish') {
      if (part === 'spec') return v.specPane(s, await b.ask<{ tasks: { n: number; layer: string; name: string }[] }>('spec choices'));
      if (part === 'anchoring') {
        const r = await b.ask<{ anchors: AnchorShown[]; anchorSay: string[] }>('releases');
        return v.anchoringPane(r.anchors, r.anchorSay, b.web);
      }
      if (part === 'published') {
        const p = await b.ask<{ specs: { id: string; hash: string; name: string; kind: string }[]; cards: { id: string; spec: string; title: string }[]; discussions: { id: string; spec: string; title: string }[] }>('published here');
        const r = s.releases ? await b.ask<{ releases: { id: string; name: string; version: string }[] }>('releases').catch(() => ({ releases: [] })) : { releases: [] };
        return `<h2>Published here</h2>${v.say('What this identity published from Ummia: specifications with their cards, releases.', ['A specification stays as published; its card can be signed again whenever something new arrives, and the latest counts.'])}
<h3>Specifications</h3><div class="k-feed">${
          p.specs
            .map((x) => {
              const cs = p.cards.filter((c) => c.spec === x.hash);
              const th = p.discussions.find((d) => d.spec === x.hash);
              return cardOf({ id: x.id, form: v.formOf(x.id), signer: who(meId()), kind: x.kind, text: `${cs[cs.length - 1]?.title ?? x.name}${cs.length ? `\nIts card, signed ${cs.length} time${cs.length === 1 ? '' : 's'}` : '\nNo card yet'}`, html: `<div class="ummia-acts">${v.hashCopy(x.hash)}<button type="button" class="k-btn k-q k-small" data-spec="${v.e(x.hash)}">Its page</button><button type="button" class="k-btn k-small${cs.length ? '' : ' k-p'}" data-action="card-new" data-hash="${v.e(x.hash)}" data-title="${v.e(cs[cs.length - 1]?.title ?? x.name)}" data-discussion="${v.e(th?.id ?? '')}">${cs.length ? 'A later card' : 'Its card'}</button></div>`, verified: true, own: true });
            })
            .join('') || '<p class="k-empty">None yet.</p>'
        }</div>
<h3>Releases</h3>${r.releases.length ? `<ul class="ummia-list">${r.releases.map((x) => `<li><span class="k-grow">${v.e(x.name)} ${v.e(x.version)}</span>${v.actCopy(x.id)}</li>`).join('')}</ul>` : '<p class="k-empty">None from here.</p>'}`;
      }
      const r = s.releases ? await b.ask<Parameters<typeof v.releasePane>[1]>('releases') : null;
      return v.releasePane(s, r);
    }
    if (tab === 'choose') {
      if (part === 'accept-hash') return `<h2>Accept by hash</h2>${v.acceptForm()}`;
      if (part === 'ummia-rules') return rulesHtml();
      const a = await b.ask<Parameters<typeof v.choosePane>[0]>('accepted');
      return v.choosePane(a, part.startsWith('layer:') ? part.slice(6) : null);
    }
    return '';
  }

  // ---------------------------------------------------------------- the identity panel

  let adding = false;
  function panelHtml(inside?: string) {
    const s = state!;
    // H96: each identity by its names (its published name, or why none is shown); H88: the one in use with its ID link.
    const ids = s.held.map((h) => ({
      id: h.id,
      form: h.form,
      link: h.link,
      // One used through Kišib, with no name published: said so, as before.
      name: v.labelOf(h.named, h.runner ? 'via Kišib' : '') || null,
      named: h.runner && !v.labelOf(h.named, '') ? null : h.named,
      on: h.active && !v.actingOf(s),
      collectives: h.active ? s.actors.filter((c) => c.kind === 'collective').map((c) => ({ id: c.id, form: v.formOf(c.id, 'mid'), name: v.labelOf(s.names?.[c.id], 'Collective'), named: s.names?.[c.id] ?? null, on: s.acting === c.id, why: c.available ? null : c.why })) : [],
    }));
    return identityPanel({ ids, adding, add: v.ADD(b.web), foot: `<button type="button" class="k-btn k-q k-small" data-action="relays-open">Relays</button> <span class="k-small k-soft">${b.web ? 'This browser: the web client, for testing only.' : 'This app: Ummia on this computer.'}</span>`, inside });
  }

  function openIdentityPanel(inside?: string) {
    if (panelOpen()) redrawPanel(panelHtml(inside));
    else openPanel(app, panelHtml(inside));
  }

  async function identityMenu(button: HTMLElement, id: string) {
    const runner = state?.held.find((h) => h.id === id)?.runner;
    const items = v.IDENTITY_MENU.filter(([k]) => (runner ? k !== 'renew' && k !== 'words' : true)).map(([key, label, hint], i, all) => ({ key, label, hint: hint || undefined, line: i === all.length - 1 }));
    const named = state?.held.find((h) => h.id === id)?.named;
    popAt(button, `<div class="k-pop" role="menu"><div class="k-t">${v.e(v.labelOf(named, 'Its settings'))}</div>${items.map((m) => `${m.line ? '<hr>' : ''}<button type="button" role="menuitem" data-k-item="${m.key}">${v.e(m.label)}${m.hint ? `<span class="k-k">${v.e(m.hint)}</span>` : ''}</button>`).join('')}</div>`, 'below', async (key) => {
      if (id !== state?.identity?.id && key !== 'remove') {
        await act(() => b.ask('use', { id }));
        state = await b.ask<State>('state');
      }
      // Said plainly first, on top of the panel (H102).
      if (key === 'remove') return void openConfirm(app, removeSaid('Ummia', v.labelOf(named, 'this identity')).replace('data-k-remove>', `data-k-remove data-id="${v.e(id)}">`));
      closePanel();
      if (key === 'words') {
        const c = await act(() => b.ask<{ grouped: string; words: string[]; key: string }>('carry'));
        if (c) popup.show('The signing key’s words', v.wordsShown(c) + keyStringHtml(c.key));
      } else if (key === 'line') popup.show('Line and homes', v.lineShown(state!));
      else if (key === 'renew') popup.show('New words from Kišib', v.renewForm());
      else if (key === 'collective') popup.show('A collective under it', v.collectiveForm(state!));
    });
  }

  async function addPart(k: string) {
    if (state?.stage === 'identity') {
      app.innerHTML = v.firstScreen(b.web, k as 'bring' | 'kishib');
      if (k === 'kishib') await runnerPart($('first-part')!);
      return;
    }
    closePanel();
    const body = popup.show(k === 'bring' ? 'Bring an identity' : 'Use one from Kišib', k === 'bring' ? v.bringForm() : '<p class="k-small k-soft">Reading Kišib’s runner…</p>');
    if (k === 'kishib') await runnerPart(body);
  }

  async function runnerPart(into: HTMLElement) {
    const r = await raw<Parameters<typeof v.runnerForm>[0]>('runner').catch((e) => ({ available: true, origin: null, state: null, code: null, identities: [], problem: errorOf(e) }));
    if (into.isConnected) into.innerHTML = v.runnerForm(r);
  }

  // ---------------------------------------------------------------- moving about

  async function go(t: v.Tab, p: string) {
    [tab, part] = [t, p];
    if (t !== 'look' || p !== 'feed') page = null;
    await draw();
  }

  async function openPage(hash: string) {
    popup.close();
    page = hash;
    [tab, part] = ['look', 'feed'];
    await draw();
  }

  async function lookAgain() {
    page = null;
    if (part !== 'feed' && !part.startsWith('saved:')) part = 'feed';
    await draw();
  }

  attachColumn(app, async (key) => {
    part = key;
    page = null;
    keepAt();
    // Another part: what was shown goes at once, so nothing of the last part is read as this one's.
    const p = pane();
    if (p) p.innerHTML = '<p class="k-empty">Reading…</p>';
    await fill();
  });

  // ---------------------------------------------------------------- clicks

  app.addEventListener('click', async (ev) => {
    const t = ev.target as HTMLElement;
    const tile = t.closest<HTMLElement>('[data-k-tile]');
    if (tile) return void (await go(tile.dataset.kTile as v.Tab, v.firstPart(tile.dataset.kTile as v.Tab)));
    const tb = t.closest<HTMLElement>('[data-tab]');
    if (tb) return void (await go(tb.dataset.tab as v.Tab, v.firstPart(tb.dataset.tab as v.Tab)));
    const cp = t.closest<HTMLElement>('[data-copy]');
    if (cp) {
      const ok = await copy(cp.dataset.copy ?? '');
      cp.textContent = ok ? 'Copied' : 'Select it and copy it';
      cp.dataset.copied = ok ? 'yes' : 'no';
      return;
    }
    const sp = t.closest<HTMLElement>('[data-spec]');
    if (sp) return void (await openPage(sp.dataset.spec!));
    const pr = t.closest<HTMLElement>('[data-point-release]');
    if (pr) {
      popup.close();
      at = { point: { kind: 'release', value: v.formOf(pr.dataset.pointRelease!) }, filters: ['releases'], layer: null };
      return void (await go('look', 'feed'));
    }
    const pid = t.closest<HTMLElement>('[data-point-id]');
    if (pid) {
      popup.close();
      at = { ...at, point: { kind: 'id', value: v.formOf(pid.dataset.pointId!, 'mid') } };
      return void (await go('look', 'feed'));
    }
    const fr = t.closest<HTMLElement>('[data-follow-releases]');
    if (fr) return void popup.show('Follow their releases', followForm(fr.dataset.followReleases!, true));
    const pt = t.closest<HTMLElement>('[data-k-point]');
    if (pt && tab === 'look') {
      const kind = pt.dataset.kPoint as v.LookAt['point']['kind'];
      at = { ...at, point: { kind, value: kind === at.point.kind ? at.point.value : kind === 'relay' ? '' : '' }, filters: kind === 'release' ? ['releases'] : at.point.kind === 'release' ? [...EVERY] : at.filters };
      if (part.startsWith('saved:')) part = 'feed';
      return void (await lookAgain());
    }
    const fl = t.closest<HTMLElement>('[data-k-filter]');
    if (fl && tab === 'look') {
      const f = fl.dataset.kFilter as v.LookAt['filters'][number];
      at = { ...at, filters: at.filters.includes(f) ? at.filters.filter((x) => x !== f) : [...at.filters, f] };
      if (part.startsWith('saved:')) part = 'feed';
      return void (await lookAgain());
    }
    const ly = t.closest<HTMLElement>('[data-k-layer]');
    if (ly && tab === 'look') {
      at = { ...at, layer: ly.dataset.kLayer || null };
      if (part.startsWith('saved:')) part = 'feed';
      return void (await lookAgain());
    }
    const sr = t.closest<HTMLElement>('[data-saved-remove]');
    if (sr) {
      const r = await act(() => b.ask<Lines>('saved remove', { key: sr.dataset.savedRemove }));
      if (r) (state = await b.ask<State>('state'), (part = 'feed'), await draw(), done(r));
      return;
    }
    const ac = t.closest<HTMLElement>('[data-acting]');
    if (ac) {
      const r = await act(() => b.ask<Lines>('acting', { id: ac.dataset.acting }));
      if (r) (state = await b.ask<State>('state'), await draw(), done(r));
      return;
    }
    if (t.closest('[data-k-open="identity"]')) {
      adding = false;
      return openIdentityPanel();
    }
    const add = t.closest<HTMLElement>('[data-k-add]');
    if (add) {
      if (add.dataset.kAdd === 'toggle') {
        adding = !adding;
        return void redrawPanel(panelHtml());
      }
      return void (await addPart(add.dataset.kAdd!));
    }
    const first = t.closest<HTMLElement>('[data-add]');
    if (first) return void (await addPart(first.dataset.add!));
    const use = t.closest<HTMLElement>('[data-k-use]');
    if (use) {
      const id = use.dataset.kUse!;
      closePanel();
      if (use.dataset.kUnder) {
        // A collective under the identity: acting as it is the same gesture as switching (decided).
        const r = await act(() => b.ask<Lines>('acting', { id: state?.acting === id ? meId() : id }));
        if (r) (state = await b.ask<State>('state'), await draw(), done(r));
        return;
      }
      if (id === meId()) {
        if (state?.acting !== id) await act(() => b.ask('acting', { id }));
      } else await act(() => b.ask('use', { id }));
      return void (await show(await b.ask<State>('state')));
    }
    const menu = t.closest<HTMLElement>('[data-k-idmenu]');
    if (menu) return void (await identityMenu(menu, menu.dataset.kIdmenu!));
    if (t.closest('[data-k-remove-no]')) return void redrawPanel(panelHtml());
    const yes = t.closest('[data-k-remove-yes]');
    if (yes) {
      const id = yes.closest<HTMLElement>('[data-k-remove]')?.dataset.id ?? meId();
      closePanel();
      await act(() => b.ask('forget', { id }));
      return void (await show(await b.ask<State>('state')));
    }
    const take = t.closest<HTMLElement>('[data-runner-take]');
    if (take) {
      const r = await act(() => raw<Lines>('runner take', { id: take.dataset.runnerTake }));
      if (r) (popup.close(), await show(await b.ask<State>('state')), say('done', `${v.lines(r.lines)}${ownIdNow()}`));
      return;
    }
    const el = t.closest<HTMLElement>('[data-action]');
    if (!el) return;
    const a = el.dataset.action!;
    const id = el.dataset.id ?? '';
    switch (a) {
      case 'status-close':
        $('status')!.innerHTML = '';
        return;
      case 'home-tiles':
        tab = null;
        page = null;
        return void (await draw());
      case 'look-back':
        page = null;
        return void (await fill());
      case 'relays-open':
        closePanel();
        return void popup.show('Relays', v.relaysForm(state!));
      case 'runner-pair': {
        const r = await act(() => raw<{ code: string }>('runner pair'));
        if (r) await runnerPart(el.closest<HTMLElement>('#first-part, .k-mbody')!);
        return;
      }
      case 'runner-look':
        return void (await runnerPart(el.closest<HTMLElement>('#first-part, .k-mbody')!));
      case 'save-point': {
        const label = at.point.kind === 'contacts' ? 'My contacts' : at.point.kind === 'relay' ? (at.point.value || 'Every relay').replace(/^https?:\/\//, '') : `${at.point.kind === 'release' ? 'Release line' : 'ID'} ${shortForm(/^[0-9a-f]{64}$/.test(at.point.value) ? v.formOf(at.point.value, at.point.kind === 'id' ? 'mid' : 'mact') : at.point.value)}`;
        const r = await act(() => b.ask<Lines>('saved add', { label, point: at.point, filters: at.filters }));
        if (r) (state = await b.ask<State>('state'), await draw(), done(r));
        return;
      }
      case 'card-new':
        return void popup.show(el.dataset.discussion !== undefined || el.textContent?.includes('later') ? 'A later card' : 'Its card', v.cardForm({ hash: el.dataset.hash!, title: el.dataset.title ?? '', discussion: el.dataset.discussion || null, later: /later/i.test(el.textContent ?? ''), limits: { title: 120, summary: 600 } }));
      case 'card-skip':
        el.closest('#card-offer')?.remove();
        popup.close();
        return;
      case 'reply-open':
        return void popup.show('Reply', v.replyForm(el.dataset.to!, el.dataset.title ?? 'its thread'));
      case 'accept-hash':
        return void popup.show('Add to accepted list', v.acceptForm(el.dataset.hash, el.dataset.label));
      case 'accept-hash-open':
        return void popup.show('Accept by hash', v.acceptForm());
      case 'confirm':
      case 'release confirm': {
        const r = await act(() => b.ask<Done>(a, { plan: el.dataset.plan, digest: el.dataset.digest }));
        if (!r) return;
        state = await b.ask<State>('state');
        const was = reviewing;
        reviewing = null;
        // Right after a specification is signed, its card is offered (decided 23 October 2026).
        if (was?.kind === 'spec' && r.hash) {
          const into = el.closest('#spec-review');
          if (into) {
            into.innerHTML = `${v.note('done', `<b>${v.e(r.title)}</b>${v.lines(r.lines)}`)}${v.cardForm({ hash: r.hash, title: was.title, later: false, limits: { title: 120, summary: 600 } })}`;
            void readCounts();
            return;
          }
        }
        if (popup.open) popup.close();
        await fill();
        void readCounts();
        done(r);
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
        return void (await useFolder(el.dataset.path ?? ''));
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
      case 'accepted remove': {
        const r = await act(() => b.ask<Lines>('accepted change', { remove: [el.dataset.hash] }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'accepted publish': {
        const r = await act(() => b.ask<Lines>('accepted publish', { on: el.dataset.on === 'true' }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'mip draft': {
        const r = await act(() => b.ask<Done>('mip draft', { key: el.dataset.key }));
        if (r) (await fill(), void readCounts(), done(r));
        return;
      }
      case 'mip replies': {
        const r = await act(() => b.ask<{ replies: Record<string, Reply[]>; lines: v.Line[] }>('mip replies', { key: el.dataset.key }));
        const box = $(`mip-out-${el.dataset.key}`);
        if (r && box) {
          const all = Object.values(r.replies).flat();
          box.innerHTML = `${v.lines(r.lines)}<div class="k-feed">${all.map((x) => cardOf({ id: x.id, form: v.formOf(x.id), signer: who(x.signer), kind: x.sealed ? 'sent to you' : null, text: x.text, verified: x.standing === 'valid', alarm: x.standing === 'valid' ? null : x.standing })).join('') || '<p class="k-empty">No reply found yet.</p>'}</div>`;
          for (const c of cards) drawn.set(c.act.id, c);
          cards = [];
          void nameCards(box);
        }
        return;
      }
      case 'mip prepare': {
        const r = await act(() => b.ask<Review>('mip prepare', { key: el.dataset.key }));
        if (r) {
          reviewing = { kind: 'mip', title: r.title };
          $(`mip-out-${el.dataset.key}`)!.innerHTML = v.review(r);
        }
        return;
      }
    }
  });

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

  app.addEventListener('change', async (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name === 'folder' && el.closest('form#release') && el.value.trim()) return void (await useFolder(el.value));
    if (el.id === 'spec-file' && el.files?.[0]) {
      const text = await el.files[0].text();
      const area = (el.form ?? app).querySelector<HTMLTextAreaElement>('textarea[name=text]');
      if (area) area.value = text.replace(/\r\n/g, '\n');
    }
  });

  // ---------------------------------------------------------------- forms

  const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');
  const all = (fd: FormData, k: string) => fd.getAll(k).map(String);
  const rows = (fd: FormData, k: string) => str(fd, k).split('\n').map((x) => x.trim()).filter(Boolean);

  app.addEventListener('submit', async (ev) => {
    const f = ev.target as HTMLFormElement;
    // Not `f.id`: a form with a field named "id" answers that field.
    const fid = f.getAttribute('id');
    if (fid === 'pair') return;
    ev.preventDefault();
    const fd = new FormData(f);
    switch (fid) {
      case 'bring': {
        const r = await act(() => b.ask<Lines>('bring', { id: str(fd, 'id'), words: str(fd, 'words'), address: str(fd, 'address'), relays: str(fd, 'relays') }));
        // H88: the end of bringing it shows its ID whole, Copy ID and Share your ID link.
        if (r) (popup.close(), await show(await b.ask<State>('state')), say('done', `<strong>The identity is here.</strong>${v.lines(r.lines)}${ownIdNow()}`));
        return;
      }
      case 'renew': {
        const r = await act(() => b.ask<Lines>('renew', { words: str(fd, 'words') }));
        if (r) (popup.close(), spentShown(null), await show(await b.ask<State>('state')), done(r));
        return;
      }
      case 'collective-add': {
        const r = await act(() => b.ask<Lines>('collective add', { id: str(fd, 'collective') }));
        if (r) {
          state = await b.ask<State>('state');
          popup.replace(v.collectiveForm(state))?.insertAdjacentHTML('afterbegin', v.note('done', v.lines(r.lines)));
        }
        return;
      }
      case 'relays': {
        const r = await act(() => b.ask<Lines>('settings', { relays: str(fd, 'relays'), track: str(fd, 'track') }));
        if (r) (state = await b.ask<State>('state'), popup.close(), done(r));
        return;
      }
      case 'reporting': {
        const r = await act(() => b.ask<Lines>('settings', { reports: str(fd, 'reports') }));
        if (r) (state = await b.ask<State>('state'), await fill(), done(r));
        return;
      }
      case 'look': {
        at = { ...at, point: { kind: at.point.kind, value: str(fd, 'value') } };
        page = null;
        if (part.startsWith('saved:')) part = 'feed';
        return void (await act(() => fill()));
      }
      case 'page': {
        const box = $('page-out');
        const p = await act(() => b.ask<Page>('spec page', { hash: str(fd, 'hash') }));
        if (p && box) {
          page = p.hash;
          [tab, part] = ['look', 'feed'];
          await draw();
        }
        return;
      }
      case 'acts': {
        const r = await act(() => b.ask<Parameters<typeof v.acts>[0]>('acts of', { spec: str(fd, 'spec'), type: str(fd, 'type'), signer: str(fd, 'signer') }));
        if (r) $('acts-out')!.innerHTML = v.acts(r);
        return;
      }
      case 'follow':
      case 'follow-releases': {
        const r = await act(() => b.ask<Lines>(fid === 'follow' ? 'follow' : 'follow releases', { id: f.dataset.id, name: str(fd, 'name') }));
        if (r) {
          known.clear();
          popup.close();
          state = await b.ask<State>('state');
          if (tab) await draw();
          done(r);
        }
        return;
      }
      case 'accept-add': {
        const r = await act(() => b.ask<Lines>('accepted change', { add: [{ hash: str(fd, 'hash'), label: str(fd, 'label') }] }));
        if (r) {
          if (popup.open) popup.close();
          if (tab === 'choose') {
            part = 'every';
            await draw();
          }
          done(r);
        }
        return;
      }
      case 'rely': {
        const r = await act(() => b.ask<Lines>('rely', { id: f.dataset.id, typed: str(fd, 'typed') }));
        if (r) (popup.close(), done(r));
        return;
      }
      case 'release': {
        const r = await act(() => b.ask<Review>('release prepare', { folder: str(fd, 'folder'), name: str(fd, 'name'), version: str(fd, 'version'), previous: str(fd, 'previous'), implements: str(fd, 'implements') }));
        if (r) {
          reviewing = { kind: 'release', title: r.title };
          $('release-review')!.innerHTML = v.review(r, 'release confirm');
        }
        return;
      }
      case 'spec': {
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
        if (r) {
          // Its card's title, offered after: the text's own first line.
          const first = str(fd, 'text').split('\n').find((l) => /\p{L}/u.test(l)) ?? '';
          reviewing = { kind: 'spec', title: first.replace(/^#+\s*/, '').replace(/^(cMIP|Module):\s*/, '').trim().slice(0, 120) };
          $('spec-review')!.innerHTML = v.review(r);
        }
        return;
      }
      case 'card': {
        const r = await act(() => b.ask<Review>('card prepare', { spec: f.dataset.hash, title: str(fd, 'title'), summary: str(fd, 'summary'), releases: rows(fd, 'releases'), vectors: rows(fd, 'vectors'), discussion: fd.get('thread') === 'on' ? 'new' : str(fd, 'discussion') }));
        if (r) {
          reviewing = { kind: 'card', title: r.title };
          const box = f.parentElement?.querySelector('#card-review') ?? $('card-review');
          if (box) box.innerHTML = v.review(r);
        }
        return;
      }
      case 'reply': {
        const r = await act(() => b.ask<Done>('reply', { to: f.dataset.to, text: str(fd, 'text') }));
        if (r) (popup.close(), tab === 'discuss' && (await fill()), done(r));
        return;
      }
      case 'mip-new': {
        const forks = str(fd, 'forks') || str(fd, 'hash');
        const r = await act(() => b.ask<{ key: string }>('mip new', { title: str(fd, 'title'), forks }));
        if (r) {
          openMip = r.key;
          await go('discuss', 'mips');
          void readCounts();
        }
        return;
      }
      case 'report': {
        const r = await act(() => b.ask<Done>('report send', { text: str(fd, 'text') }));
        if (r) (await fill(), done(r));
        return;
      }
    }
    if (f.classList.contains('mip-text')) {
      const r = await act(() => b.ask<Lines>('mip save', { key: f.dataset.key, text: str(fd, 'text') }));
      if (r) {
        openMip = f.dataset.key!;
        $(`mip-out-${f.dataset.key}`)!.innerHTML = v.lines(r.lines);
      }
    } else if (f.classList.contains('anchor')) {
      const release = f.dataset.release!;
      const choice = str(fd, 'choice');
      const into = f.parentElement!;
      if (!choice) {
        const offers = await act(() => b.ask<Parameters<typeof v.anchorForm>[1]>('anchor offers', { service: str(fd, 'service') }));
        const x = await b.ask<{ anchorSay: string[] }>('releases');
        if (offers) {
          into.innerHTML = v.anchorForm(release, offers, x.anchorSay);
          (into.querySelector('input[name=service]') as HTMLInputElement).value = str(fd, 'service');
        }
        return;
      }
      const [offer, tier] = choice.split(' ');
      const r = await act(() => b.ask<Done>('anchor ask', { release, service: str(fd, 'service'), offer, tier: Number(tier) }));
      if (r) {
        if (popup.open) popup.close();
        state = await b.ask<State>('state');
        void readCounts();
        if (tab === 'publish') await fill();
        done(r);
      }
    }
  });

  return { show };
}
