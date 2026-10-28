// Damgar's page: its screens, clicks and forms, on the kit, the same for the
// program on the Mac and Linux (`app.ts`, which asks the program) and for
// the web client (`../web/app.ts`, which runs Damgar's code in this
// browser). It keeps one thing in the browser's session storage, which tile
// and part were open (`damgar:at`), and in memory which collective is acted
// as; nothing of a key or a payment.

import { attachCards, attachClosing, attachColumn, card, cardsUntimed, closePanel, stampCards, copy, identityPanel, openPanel, openSlot, panelOpen, popAt, Popup, redrawPanel, removeSaid, openConfirm, keyChanged, shortForm, type KitAct, type KitWho } from '../../../kit/src/index.ts';
import * as v from './view.ts';
import type { Account, LaneShown, PaymentShown, Rails, State, ToSign, Who } from '../shapes.ts';

export interface Backend {
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  web: boolean;
  start(): Promise<void>;
  unpaired?(err: unknown): boolean;
}

type Lines = { lines: v.Line[] };
type CollectiveRead = Parameters<typeof v.collectivePane>[0] & {};
type LanesRead = { lanes: LaneShown[]; manual: boolean; link: boolean; linkSay: string[]; clock: string | null; dubsar?: boolean };
const errorOf = (err: unknown) => (err instanceof Error ? err.message : String(err));
const TABS: v.Tab[] = ['waiting', 'account', 'lanes', 'settings'];
/** What waits to be received rather than paid. */
const RECEIVE = new Set<ToSign['kind']>(['invoice', 'address', 'receipt', 'uncounted']);

export function mount(app: HTMLElement, b: Backend): { show(state: State): Promise<void> } {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  app.classList.add('k-page', 'k-damgar');
  let state: State | null = null;
  let tab: v.Tab | null = null;
  let part = '';
  /** The collective acted as, under the identity in use (the identity panel's gesture); memory only. */
  let acting: v.Acting | null = null;
  let counts = { toPay: 0, toReceive: 0, asked: 0, inForce: 0, ended: 0 };
  let timer: ReturnType<typeof setInterval> | null = null;
  /** What was read back and waits for its confirmation. */
  let reviewed: Record<string, unknown> | null = null;
  let vaultAsked: { entry: number; value: string } | null = null;
  let laneAsked: Record<string, unknown> | null = null;
  const popup = new Popup(app);
  attachClosing();

  try {
    const at = JSON.parse(sessionStorage.getItem('damgar:at') ?? 'null') as { tab: v.Tab; part: string } | null;
    if (at && TABS.includes(at.tab)) [tab, part] = [at.tab, at.part];
  } catch {
    // no session storage: the four tiles
  }
  const keepAt = () => {
    try {
      sessionStorage.setItem('damgar:at', JSON.stringify(tab ? { tab, part } : null));
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
    s.innerHTML = v.note(kind, html);
    s.scrollIntoView({ block: 'nearest' });
  }
  const fail = (err: unknown) => {
    if (b.unpaired?.(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    const m = errorOf(err);
    // H82, H83: the identity in use's key changed elsewhere: the kit's warning, a pop-up with the box for the new words.
    if (/^This identity’s signing key was changed elsewhere/.test(m)) return warnKey(m);
    say('error', v.e(m));
  };
  /** The kit's warning for the identity in use (H82), or none: it never stays for another identity (H83). */
  function warnKey(said: string | null) {
    const i = state?.identity;
    keyChanged(app, said && i ? { id: i.id, name: i.name ?? shortForm(i.form), say: said, form: v.renewForm() } : null);
  }
  const done = (r: Lines | undefined) => {
    if (r?.lines?.length) say('done', v.lines(r.lines));
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

  // ---------------------------------------------------------------- Kišib's runner: its panel in Damgar's slot (the Dubsar runner cMIP, section 4)

  let slot: { close(): void; request: string } | null = null;
  const raw = b.ask.bind(b);
  const NOT_WATCHED = new Set(['runner asking', 'runner', 'state', 'runner drop', 'to sign', 'pay', 'account', 'lanes', 'rails', 'collectives']);
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
            host: 'Damgar',
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

  // ---------------------------------------------------------------- drawing

  async function show(s: State) {
    state = s;
    if (timer) clearInterval(timer);
    timer = null;
    closePanel();
    if (acting && !s.identity?.collectives.some((c) => c.id === acting!.id)) acting = null;
    if (s.stage === 'identity') {
      app.innerHTML = v.firstScreen(b.web);
      return;
    }
    if (s.stage === 'accept') {
      app.innerHTML = v.acceptScreen(s);
      return;
    }
    await draw();
    void b.ask<{ current: boolean; say: string | null }>('check').then((c) => warnKey(c.current ? null : c.say)).catch(() => undefined);
    // While Waiting is in view, what arrived is looked for every 20 seconds.
    timer = setInterval(() => {
      if (document.visibilityState === 'visible' && tab === 'waiting' && (part === 'to-pay' || part === 'to-receive') && !app.querySelector('textarea:focus,input:focus') && !popup.open && !panelOpen()) void refresh(true);
    }, 20000);
  }

  async function draw() {
    keepAt();
    if (!tab) {
      app.innerHTML = v.home(state!, b.web, acting);
      return;
    }
    app.innerHTML = v.tabPage(state!, tab, part, counts, acting);
    await fill();
  }

  /** Redraw the column's counts in place. */
  function drawCounts() {
    if (!tab) return;
    const col = app.querySelector('.k-col');
    if (!col) return;
    const n: Record<string, number> = { 'to-pay': counts.toPay, 'to-receive': counts.toReceive, asked: counts.asked, 'in-force': counts.inForce, ended: counts.ended };
    for (const [k, x] of Object.entries(n)) {
      const b2 = col.querySelector(`[data-k-col="${k}"] .k-k`);
      if (b2) b2.textContent = String(x);
    }
  }

  const pane = () => $('pane');

  /** Each fill numbered: a part chosen since wins over one still being read. */
  let filling = 0;

  /** The part open, filled from what Damgar reads. */
  /**
   * Each part as last drawn, by identity, tile and part (H115): a part opened
   * again is drawn at once from it, said "Looking…", then filled in with
   * what the look-ups return; the program answers one request at a time, so
   * a part never waits on another's look before it shows.
   */
  const held = new Map<string, { html: string; drawn: [string, { act: KitAct; who: Who; lines: v.Line[]; acts: v.CardAct[] }][] }>();
  const heldKey = () => `${meId()}\u0000${acting?.id ?? ''}\u0000${tab}\u0000${part}`;
  async function fill() {
    const p = pane();
    if (!p) return;
    const mine = ++filling;
    const key = heldKey();
    const before = held.get(key);
    // Another part than the one shown: drawn at once, from what is held, or said Looking…; the same part (a refresh) is left as it is until filled in.
    if (p.dataset.shown !== key) {
      p.dataset.shown = key;
      if (before) {
        p.innerHTML = `<p class="k-small k-faint damgar-looking" role="status">Looking…</p>${before.html}`;
        drawn.clear();
        for (const [id, c] of before.drawn) drawn.set(id, c);
      } else p.innerHTML = '<p class="k-empty damgar-looking" role="status">Looking…</p>';
    }
    try {
      const html = await partHtml();
      if (mine !== filling || !p.isConnected) return void (cards = []);
      p.innerHTML = html;
      drawCards();
      held.set(key, { html, drawn: [...drawn] });
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
    drawCounts();
  }

  /** A part that reads what arrived: drawn first from what is held, then looked for once, and drawn again if still in view (H115). */
  let lookedFor = '';
  function lookThenFill(which: string) {
    if (lookedFor === which) return void (lookedFor = '');
    void b
      .ask('look')
      .catch(() => undefined)
      .then(async () => {
        if (part !== which) return;
        lookedFor = which;
        await fill();
      });
  }

  /** Look on MOR, then draw the part again; what was typed in a form survives (a look may land mid-paste). */
  async function refresh(quiet = false) {
    const looked = await b.ask<{ lines: v.Line[]; problems: string[] }>('look').catch((err) => {
      if (!quiet) fail(err);
      return null;
    });
    const typed = new Map<string, string>();
    let focused: string | null = null;
    for (const x of app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#pane form[data-id] [name], #pane form[data-key] [name]')) {
      const f = x.form as HTMLFormElement;
      const k = `${f.dataset.id ?? f.dataset.key}\u0000${x.name}`;
      if (x.value) typed.set(k, x.value);
      if (document.activeElement === x) focused = k;
    }
    state = await b.ask<State>('state').catch(() => state);
    await fill();
    for (const x of app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#pane form[data-id] [name], #pane form[data-key] [name]')) {
      const f = x.form as HTMLFormElement;
      const k = `${f.dataset.id ?? f.dataset.key}\u0000${x.name}`;
      if (typed.has(k) && !x.value) x.value = typed.get(k)!;
      if (k === focused) x.focus();
    }
    if (!quiet && looked) say(looked.lines.length ? 'done' : '', v.lines([...looked.lines, ...looked.problems.map((t) => ({ text: t, tone: 'warn' as const }))]) || 'Nothing new arrived.');
  }

  // ---------------------------------------------------------------- cards: each with the kit's two menus

  const drawn = new Map<string, { act: KitAct; who: Who; lines: v.Line[]; acts: v.CardAct[] }>();
  let cards: { act: KitAct; who: Who; lines: v.Line[]; acts: v.CardAct[] }[] = [];
  /** The acts of the card whose Anchor it is open: kept while the service's offer is read. */
  let anchoring: v.CardAct[] = [];
  const meId = () => state?.identity?.id ?? '';
  const kitWho = (w: Who): KitWho => {
    const form = v.formOf(w.id, 'mid');
    return { id: w.id, form, link: form, name: w.me ? (state?.identity?.name ?? null) : null, me: w.me };
  };
  const cardOf = (x: { id: string; who: Who; kind?: string | null; text: string; html?: string; labels?: { text: string; tone?: 'warn' | 'bad' }[]; verified?: boolean; alarm?: string | null; lines: v.Line[]; acts?: v.CardAct[] }): string => {
    const a: KitAct = { id: x.id, form: v.formOf(x.id), signer: kitWho(x.who), kind: x.kind ?? null, text: x.text, html: x.html, labels: x.labels, verified: !!x.verified, alarm: x.alarm ?? null };
    cards.push({ act: a, who: x.who, lines: x.lines, acts: x.acts ?? [] });
    return card(a);
  };
  function drawCards() {
    drawn.clear();
    for (const c of cards) drawn.set(c.act.id, c);
    cards = [];
  }

  const itemCard = (t: ToSign) =>
    cardOf({ id: t.id, who: t.from, kind: `${t.kind === 'draft' ? (t.byHand ? 'pasted by hand' : t.app ? `from ${t.app}` : 'a draft') : t.kind === 'lane' ? `lane · from ${t.app ?? 'an app'}` : t.kind}`, text: t.title, html: `<div class="k-box">${v.itemActs(t)}</div>`, labels: t.unknown ? [{ text: 'unknown here: nothing can be signed for it', tone: 'warn' }] : [], verified: !t.unknown, lines: t.lines, acts: [] });

  /** An identity in words on a card: its `mid1…` short form (Damgar keeps no contacts). */
  const shortOf = (w: Who) => shortForm(v.formOf(w.id, 'mid'));
  const paymentCard = (p: PaymentShown, forPay: boolean) => {
    const bad = p.proofs.some((x) => x.rail.answer === 'invalid');
    // S7e: a payment whose claims and receipts no rail answer here shows valid is unknown, with what the rail said: never shown as paid.
    const unverified = p.proofs.length > 0 && !bad && !p.proofs.some((x) => x.rail.answer === 'valid');
    // Its act: the first claim or receipt, else the invoice request that began it; signed by the payer (you, paying out) or the payee.
    const first = p.proofs[0];
    // What Rely on it and Anchor it offer: its receipts first, then its claims, then the invoice request that began it (decided: "receipts and claims first of all").
    const acts: v.CardAct[] = [
      ...p.proofs.filter((x) => x.kind === 'receipt').map((x) => ({ id: x.act, said: `The receipt, by ${x.by.me ? 'you' : shortOf(x.by)}` })),
      ...p.proofs.filter((x) => x.kind === 'claim').map((x) => ({ id: x.act, said: `The claim, by ${x.by.me ? 'you' : shortOf(x.by)}` })),
      ...(p.request ? [{ id: p.request, said: 'The invoice request that began it' }] : []),
    ];
    return cardOf({
      acts,
      id: first?.act ?? p.request ?? p.key,
      who: first ? first.by : p.side === 'out' ? { id: meId(), short: '', me: true } : p.other,
      kind: p.to === 'vault' && p.other.me ? 'to your vault' : p.side === 'out' ? 'you pay' : 'paid to you',
      text: `${p.side === 'out' ? (p.other.me ? 'To your vault' : `To ${shortOf(p.other)}`) : `From ${shortOf(p.other)}`} · ${p.amount.said}`,
      html: `<div class="k-box">${v.payment(p, forPay)}</div>`,
      labels: [...(p.deal ? [{ text: `under the deal “${p.deal}”` }] : []), { text: p.stageSaid }, ...[...new Set(p.proofs.map((x) => `${x.kind === 'claim' ? 'claim' : 'receipt'}: ${x.how}`))].map((text) => ({ text })), ...(unverified ? [{ text: v.unverifiedSaid(p), tone: 'warn' as const }] : [])],
      verified: v.confirmed(p),
      alarm: bad ? 'A proof that does not hold' : null,
      lines: [...p.lines, ...p.proofs.map((x) => ({ text: `${x.kind === 'claim' ? 'Claim' : 'Receipt'} by ${x.by.me ? 'you' : x.by.short}: the rail says ${x.rail.answer}${x.rail.why ? ` (${x.rail.why})` : ''}; beside it ${x.beside.answer}${x.beside.why ? ` (${x.beside.why})` : ''}; ${x.how}.`, tone: x.rail.answer === 'invalid' ? ('bad' as const) : undefined }))],
    });
  };

  attachCards(app, {
    app: 'Damgar',
    // Rely on it and Anchor it, below the line, on every act (decided by Nobody, allegedly: "Agreed"; Damgar's round 3, question 3): a witness act signed here, an anchor prepared and paid here.
    signs: true,
    act: (id) => drawn.get(id)?.act,
    signerItems: (a) => (a.signer.me ? [] : [{ key: 'tip', label: 'Tip' }]),
    actItems: () => ({ before: [], after: [] }),
    async choose(key, a) {
      const c = drawn.get(a.id);
      if (!c) return;
      if (key === 'why') return void popup.show('Why it’s valid', `${v.lines(c.lines)}<p class="k-small k-faint">Each judged from the rail’s own evidence, with what you accept.</p>`);
      if (key === 'profile') return void popup.show(a.signer.me ? 'You' : shortForm(a.signer.form), `<dl class="k-facts"><dt>ID</dt><dd class="k-mono">${v.e(a.signer.form)}</dd></dl><div class="k-row"><button type="button" class="k-btn k-small" data-action="copy" data-text="${v.e(a.signer.form)}">Copy ID</button></div><p class="k-small k-soft">Full record in Kišib. Their posts and profile are in Dub.</p>`);
      if (key === 'follow' || key === 'mute' || key === 'unfollow' || key === 'unmute') return void popup.show('Contacts are Dub’s', '<p class="k-soft">Damgar keeps no contacts: follow and mute in Dub, from their card or profile. Damgar shows who paid and whom you paid by their IDs.</p>');
      if (key === 'tip') return void popup.show(`Tip ${shortForm(a.signer.form)}`, tipForm(a.signer.id));
      if (key === 'rely') return void popup.show('Rely on it', v.relyForm(c.acts));
      if (key === 'anchor') {
        anchoring = c.acts;
        return void popup.show('Anchor it', v.anchorForm(c.acts, null));
      }
      if (key === 'correct') return void popup.show('Correct it', '<p class="k-soft">Corrections are Dub’s: Damgar signs no text.</p>');
    },
  });

  const tipForm = (to: string) =>
    `<form id="tip" data-to="${v.e(to)}"><div class="k-row"><input name="value" inputmode="numeric" placeholder="Amount" required class="k-grow"><select name="unit">${units()
      .map((u) => `<option value="${v.e(u.hash)}"${/regtest/.test(u.label) ? ' selected' : ''}>${v.e(u.label)}</option>`)
      .join('')}</select></div><input name="whatFor" placeholder="What for (optional)" maxlength="280"><p class="k-small k-soft">It waits in To pay, read in plain words, to be signed there; you pay it in your own wallet.</p><div class="k-row"><button type="submit" class="k-btn k-p">Prepare the tip</button></div></form>`;
  const units = () => (state?.accept ?? []).filter((x) => x.key === 'bitcoin-units').flatMap((x) => x.hashes.map((h, i) => ({ hash: h, label: `${['Bitcoin', 'testnet', 'signet', 'regtest'][i] ?? h.slice(0, 8)} satoshis` })));

  // ---------------------------------------------------------------- each part

  async function partHtml(): Promise<string> {
    const s = state!;
    if (tab === 'waiting') {
      if (part === 'paste') return v.pastePane();
      if (part === 'collective') {
        const r = await b.ask<{ collectives: CollectiveRead[] }>('collectives');
        return v.collectivePane(r.collectives.find((c) => c.id === acting?.id) ?? null, acting?.name ?? shortForm(acting?.form ?? ''));
      }
      const items = (await b.ask<{ items: ToSign[]; problems: string[] }>('to sign')).items;
      const pays = (await b.ask<{ payments: PaymentShown[] }>('pay')).payments;
      const own = items.filter((t) => t.kind !== 'lane' && !RECEIVE.has(t.kind));
      const out = pays.filter((p) => !(p.to === 'vault' && p.other.me));
      counts = { ...counts, toPay: own.length + out.length, toReceive: items.filter((t) => RECEIVE.has(t.kind)).length, asked: items.filter((t) => t.kind === 'lane').length };
      if (part === 'to-receive') {
        const rec = items.filter((t) => RECEIVE.has(t.kind));
        return `<h2>To receive</h2>${v.say('Invoices to make when someone pays you; receipts to sign once a payment to you is proven.', ['With Damgar’s own lanes (Lanes), it does both by itself, below their cap.'])}<div class="k-row"><span class="k-grow"></span><button type="button" class="k-btn k-q" data-action="look">Look again</button></div><div class="k-feed" id="waiting-feed">${rec.map(itemCard).join('') || '<p class="k-empty">Nothing to receive.</p>'}</div>`;
      }
      if (part === 'vault') {
        let rails: Rails | null = null;
        let problem: string | null = null;
        try {
          rails = await b.ask<Rails>('rails');
        } catch (e) {
          problem = errorOf(e);
        }
        const mine = pays.filter((p) => p.to === 'vault' && p.other.me);
        return v.vaultPane(rails, problem, mine.length ? `<h3>Transfers waiting</h3><div class="k-feed">${mine.map((p) => paymentCard(p, true)).join('')}</div>` : '');
      }
      return `<h2>To pay</h2>${v.say('Each payment read in plain words, signed here, paid in your own wallet, its proof pasted back.', ['Drafts the other apps put on MOR, sealed to you; what you pasted by hand; requests others sent. Signing one sends the payee an invoice request; once they answer, the invoice or address to pay shows on its card. Damgar holds no wallet.'])}<div class="k-row"><span class="k-grow"></span><button type="button" class="k-btn k-q" data-action="look">Look again</button></div><div class="k-feed" id="waiting-feed">${[...own.map(itemCard), ...out.map((p) => paymentCard(p, true))].join('') || '<p class="k-empty">Nothing to pay.</p>'}</div>`;
    }
    if (tab === 'account') {
      if (part === 'under') {
        // What other apps left since (the keys of their acts under the lanes, delivered to this identity): looked for after drawing what is held (H115).
        lookThenFill('under');
        const l = await b.ask<LanesRead>('lanes');
        const apps = l.lanes.filter((x) => !x.here);
        // The stage first, in plain words (H107): asked is not paid. A tip under a lane is only asked until the payee answers with an invoice and it is paid in the wallet.
        const stageOf = (p: NonNullable<LaneShown['payments']>[number]) => {
          const who = p.to.name ?? shortOf(p.to);
          return p.stage === 'paid' ? 'Paid: its claim signed under the lane' : p.stage === 'refused' ? `Refused by ${who}: not counted` : `Asked: waiting for ${who}’s invoice`;
        };
        const tally = (x: LaneShown) => {
          const ps = x.payments ?? [];
          const n = (st: string) => ps.filter((p) => p.stage === st).length;
          return `<p class="k-small k-soft" data-under-tally>Paid: ${n('paid') ? `${n('paid')}${x.paid ? `, ${v.e(x.paid.said)}` : ''}` : 'none yet'} · Asked, not paid yet: ${n('asked') ? `${n('asked')}${x.asked ? `, ${v.e(x.asked.said)}` : ''}` : 'none'}${n('refused') ? ` · Refused: ${n('refused')}` : ''}</p>`;
        };
        return `<h2>Under the lanes</h2>${v.say('What other apps asked and paid under their lanes: they finish those payments themselves; the record is kept here.', ['Asked: the app signed an invoice request under the lane; nothing has moved until the payee answers with an invoice and it is paid in the wallet. Paid: its claim is signed, with the rail’s proof.', 'Read from the acts under each lane whose keys the app delivered to this identity. An act whose key was not delivered (an identity used through Kišib’s runner in that app) is counted as sealed, and said.'])}${
          apps
            .map((x) => `<h3>${v.e(x.label)} <span class="k-small k-soft">${v.e(x.state)}</span></h3>${tally(x)}<dl class="k-facts">${v.laneTotal(x)}</dl><div class="k-feed">${(x.payments ?? []).map((p) => cardOf({ id: p.claims[0] ?? p.request ?? p.key, who: { id: meId(), short: '', me: true }, kind: null, text: `${stageOf(p)}\nTo ${p.to.name ? `${p.to.name} (${shortOf(p.to)})` : shortOf(p.to)} · ${p.amount.said}${p.whatFor ? ` · for “${p.whatFor}”` : ''} · under “${x.label}”`, labels: [], verified: p.stage === 'paid', lines: [{ text: `Signed by ${x.app} under the lane “${x.label}”, not with your own key.` }], acts: [...p.claims.map((c) => ({ id: c, said: 'Its claim, signed under the lane' })), ...(p.request ? [{ id: p.request, said: 'Its invoice request, signed under the lane' }] : [])] })).join('') || '<p class="k-empty">No payment under it read yet.</p>'}${x.sealed ? `<p class="k-small k-soft">${x.sealed} act${x.sealed === 1 ? '' : 's'} sealed: not counted.</p>` : ''}</div>`)
            .join('') || '<p class="k-empty">No app holds a lane of this identity.</p>'
        }`;
      }
      const a = await b.ask<Account>('account');
      if (part === 'payments') return `<h2>Payments</h2>${v.say('Each payment a card: its claim and receipt, how each was signed, and whether each verifies.', ['Paid and confirmed: settled, its receipt and a claim each valid by the rail’s own evidence. Open a card’s ID for why it is valid.'])}<div class="k-feed" id="account-feed">${a.payments.map((p) => paymentCard(p, false)).join('') || '<p class="k-empty">No payment yet.</p>'}</div>`;
      if (part === 'shared') {
        // Deals between separate people this identity is a party of (this round): the payments made to each, and the payouts its split service made to you.
        const ds = a.shared ?? [];
        return `<h2>Shared deals</h2>${v.say('The deals you share in with other people: what was paid to each, and what its split service paid you.', ['Each payment to a deal is receipted by its split service in the name of the deal’s own payee, and sealed to every person sharing in it; each split names what it pays each of you. A tip to you personally is under Payments, not here.'])}${
          ds
            .map((d) => `<h3>“${v.e(d.name)}” <span class="k-small k-soft k-mono">${v.e(shortForm(v.formOf(d.version)))}</span></h3><div class="k-feed">${[
              ...d.payments.map((x) => cardOf({ id: x.receipt, who: x.payer, kind: x.kind, text: d.collective ? `${x.kind === 'a tip' ? 'A tip' : 'A sale'} of the collective’s work · your share ${x.amount.said}` : `${x.kind === 'a tip' ? 'A tip' : 'A sale'} to the deal · ${x.amount.said}`, labels: [{ text: x.standing, ...(x.rail.answer === 'valid' ? {} : { tone: 'warn' as const }) }], verified: x.rail.answer === 'valid', lines: [] })),
              ...d.payouts.map((x) => cardOf({ id: x.split, who: { id: meId(), short: '', me: true }, kind: 'your payout', text: `Its split pays you ${x.amount.said}${x.role ? ` (${x.role})` : ''}`, labels: [{ text: x.paid ? 'paid to you by its split service, its rail answer valid' : 'named in its split; its payment here is not yet shown valid by its rail: unknown' }], verified: x.paid, lines: [] })),
            ].join('') || '<p class="k-empty">Nothing yet.</p>'}</div>`)
            .join('') || '<p class="k-empty">No deal shared with you yet: a deal is set up in Edubba, where you sign it.</p>'
        }`;
      }
      if (part === 'anchors') {
        const an = a.payments.filter((p) => p.ticket);
        return `<h2>Anchors</h2>${v.say('Payments for anchoring an act on Bitcoin: each waiting, anchored at its block, its deadline met or missed.', ['Asked in Edubba for a collective’s act, in Ummia for a release, in Dub for any act; paid here. Kept simple: it shows that anchoring exists.'])}<div class="k-feed">${an.map((p) => paymentCard(p, false)).join('') || '<p class="k-empty">No anchor paid from here.</p>'}</div>`;
      }
      return v.summaryPane(a);
    }
    if (tab === 'lanes') {
      if (part === 'asked') {
        const items = (await b.ask<{ items: ToSign[] }>('to sign')).items.filter((t) => t.kind === 'lane');
        counts.asked = items.length;
        return `<h2>Asked</h2>${v.say('Lanes other apps asked for, read in plain words, to grant or decline.', ['An app asks through MOR, sealed to you. Granting signs a public grant of this identity to itself, naming the key that app holds.'])}<div class="k-feed">${items.map(itemCard).join('') || '<p class="k-empty">No lane asked.</p>'}</div>`;
      }
      if (part === 'in-force') lookThenFill('in-force');
      const l = await b.ask<LanesRead>('lanes');
      counts = { ...counts, inForce: l.lanes.filter((x) => x.state === 'in force' && !x.here).length, ended: l.lanes.filter((x) => x.state !== 'in force').length };
      if (part === 'own') return v.ownPane(l.lanes.filter((x) => x.here && x.state === 'in force'), units().map((u) => ({ ...u, label: u.label.replace(' satoshis', '') })), l, b.web);
      if (part === 'ended') return `<h2>Ended</h2><p class="k-small k-soft">Revoked, or past their expiry: nothing signed under them after that counts.</p>${l.lanes.filter((x) => x.state !== 'in force').map((x) => v.lane(x, false)).join('') || '<p class="k-empty">No lane ended.</p>'}`;
      return v.inForcePane(l.lanes.filter((x) => x.state === 'in force' && !x.here), l.clock, l.manual, !!l.dubsar);
    }
    if (tab === 'settings') {
      if (part === 'accept') return v.acceptPane(s);
      if (part === 'manual') return v.manualPane((await b.ask<LanesRead>('lanes')).manual);
      if (part === 'relays') {
        const r = await b.ask<Rails>('rails').catch(() => null);
        return v.relaysPane(s, r?.chain ?? '');
      }
      let r: Rails | null = null;
      let problem: string | null = null;
      try {
        r = await b.ask<Rails>('rails');
      } catch (e) {
        problem = errorOf(e);
      }
      return v.paidPane(r, problem);
    }
    return '';
  }

  // ---------------------------------------------------------------- the identity panel

  let adding = false;
  function panelHtml(inside?: string) {
    const s = state!;
    const ids = s.held.map((h) => ({
      id: h.id,
      form: v.formOf(h.id, 'mid'),
      name: h.name ?? (h.runner ? 'via Kišib' : shortForm(v.formOf(h.id, 'mid'))),
      on: h.active && !acting,
      collectives: h.active ? (s.identity?.collectives ?? []).map((c) => ({ id: c.id, form: c.form, name: c.name ?? shortForm(c.form), on: acting?.id === c.id })) : [],
    }));
    return identityPanel({ ids, adding, add: v.ADD(b.web), foot: b.web ? 'This browser: the web client, for testing only.' : 'This app: Damgar on this computer. Money acts always show Kišib’s panel for an identity used through it.', inside });
  }

  function openIdentityPanel(inside?: string) {
    if (panelOpen()) redrawPanel(panelHtml(inside));
    else openPanel(app, panelHtml(inside));
  }

  async function identityMenu(button: HTMLElement, id: string) {
    const items = v.IDENTITY_MENU.filter(([k]) => (state?.held.find((h) => h.id === id)?.runner ? k !== 'renew' : true)).map(([key, label, hint], i, all) => ({ key, label, hint: hint || undefined, line: i === all.length - 1 }));
    popAt(button, `<div class="k-pop" role="menu"><div class="k-t">${v.e(shortForm(v.formOf(id, 'mid')))}</div>${items.map((m) => `${m.line ? '<hr>' : ''}<button type="button" role="menuitem" data-k-item="${m.key}">${v.e(m.label)}${m.hint ? `<span class="k-k">${v.e(m.hint)}</span>` : ''}</button>`).join('')}</div>`, 'below', async (key) => {
      if (id !== state?.identity?.id && key !== 'remove') {
        await act(() => b.ask('use', { id }));
        state = await b.ask<State>('state');
      }
      // Said plainly first, on top of the panel (H102).
      if (key === 'remove') return void openConfirm(app, removeSaid('Damgar', shortForm(v.formOf(id, 'mid'))).replace('data-k-remove>', `data-k-remove data-id="${v.e(id)}">`));
      closePanel();
      if (key === 'words') {
        const c = await act(() => b.ask<{ grouped: string; words: string[] }>('carry'));
        if (c) popup.show('The signing key’s words', v.wordsShown(c));
      } else if (key === 'line') popup.show('Line and homes', v.lineShown(state!));
      else if (key === 'renew') popup.show('New words from Kišib', v.renewForm());
      else if (key === 'collective') popup.show('A collective under it', v.collectiveForm(state!.identity!.collectives));
    });
  }

  async function addPart(k: string) {
    if (state?.stage === 'identity') {
      app.innerHTML = v.firstScreen(b.web, k as 'make' | 'bring' | 'kishib');
      if (k === 'kishib') await runnerPart($('first-part')!);
      return;
    }
    closePanel();
    const body = popup.show(k === 'make' ? 'Make an identity' : k === 'bring' ? 'Bring an identity' : 'Use one from Kišib', k === 'make' ? v.makeForm() : k === 'bring' ? v.bringForm() : '<p class="k-small k-soft">Reading Kišib’s runner…</p>');
    if (k === 'kishib') await runnerPart(body);
  }

  async function runnerPart(into: HTMLElement) {
    const r = await raw<Parameters<typeof v.runnerForm>[0]>('runner').catch((e) => ({ available: true, state: null, code: null, identities: [], problem: errorOf(e) }));
    if (into.isConnected) into.innerHTML = v.runnerForm(r);
  }

  // ---------------------------------------------------------------- clicks

  attachColumn(app, async (key) => {
    part = key;
    keepAt();
    await fill();
  });

  app.addEventListener('click', async (ev) => {
    const t = ev.target as HTMLElement;
    const tile = t.closest<HTMLElement>('[data-k-tile]');
    if (tile) {
      tab = tile.dataset.kTile as v.Tab;
      part = v.firstPart(tab);
      return void (await draw());
    }
    const tb = t.closest<HTMLElement>('[data-tab]');
    if (tb) {
      tab = tb.dataset.tab as v.Tab;
      part = v.firstPart(tab);
      return void (await draw());
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
      if (use.dataset.kUnder) {
        // A collective under the identity: acting as it is the same gesture as switching.
        const c = state?.identity?.collectives.find((x) => x.id === id);
        acting = acting?.id === id || !c ? null : { id, form: c.form, name: c.name ?? shortForm(c.form) };
        closePanel();
        if (acting) [tab, part] = ['waiting', 'collective'];
        else if (tab === 'waiting' && part === 'collective') part = 'to-pay';
        return void (await draw());
      }
      acting = null;
      closePanel();
      await act(() => b.ask('use', { id }));
      return void (await show(await b.ask<State>('state')));
    }
    const menu = t.closest<HTMLElement>('[data-k-idmenu]');
    if (menu) return void (await identityMenu(menu, menu.dataset.kIdmenu!));
    if (t.closest('[data-k-remove-no]')) return void redrawPanel(panelHtml());
    const yes = t.closest('[data-k-remove-yes]');
    if (yes) {
      const id = yes.closest<HTMLElement>('[data-k-remove]')?.dataset.id ?? state?.identity?.id ?? '';
      closePanel();
      await act(() => b.ask('forget', { id }));
      return void (await show(await b.ask<State>('state')));
    }
    const take = t.closest<HTMLElement>('[data-runner-take]');
    if (take) {
      const r = await act(() => raw<Lines>('runner take', { id: take.dataset.runnerTake }));
      if (r) {
        popup.close();
        await show(await b.ask<State>('state'));
        done(r);
      }
      return;
    }
    const cr = t.closest<HTMLElement>('[data-collective-remove]');
    if (cr) {
      const r = await act(() => b.ask<Lines>('collective remove', { id: cr.dataset.collectiveRemove }));
      state = await b.ask<State>('state');
      const body = popup.open ? popup.replace(v.collectiveForm(state.identity!.collectives)) : null;
      if (r && body) body.insertAdjacentHTML('afterbegin', v.note('done', v.lines(r.lines)));
      return;
    }
    const el = t.closest<HTMLElement>('[data-action]');
    if (!el) return;
    const a = el.dataset.action!;
    const id = el.dataset.id ?? '';
    switch (a) {
      case 'home-tiles':
        tab = null;
        return void (await draw());
      // H112: the first-use step never locks the app: Later, or back to the first page.
      case 'accept-later': {
        const r = await act(() => b.ask<Lines>('accept later'));
        if (r) {
          await show(await b.ask<State>('state'));
          done(r);
        }
        return;
      }
      case 'first-back': {
        const r = await act(() => b.ask<Lines>('first back'));
        if (r) await show(await b.ask<State>('state'));
        return;
      }
      case 'renew':
        return void popup.show('New words from Kišib', v.renewForm());
      case 'copy': {
        const ok = await copy(el.dataset.text ?? '');
        el.textContent = ok ? 'Copied' : 'Select it and copy it';
        return;
      }
      case 'look':
        return void (await act(() => refresh()));
      case 'runner-pair': {
        const r = await act(() => raw<{ code: string }>('runner pair'));
        if (r) await runnerPart(el.closest<HTMLElement>('#first-part, .k-mbody')!);
        return;
      }
      case 'runner-look':
        return void (await runnerPart(el.closest<HTMLElement>('#first-part, .k-mbody')!));
      case 'sign draft':
      case 'decline':
      case 'accept debt':
      case 'pay request':
      case 'grant lane':
      case 'answer address':
      case 'sign receipt': {
        const r = await act(() => b.ask<Lines>(a, a === 'sign receipt' ? { key: id } : { id }));
        if (r) {
          state = await b.ask<State>('state');
          await fill();
          done(r);
        }
        return;
      }
      case 'refuse invoice': {
        const why = prompt('Why (sent to them, sealed)?', 'not expected') ?? '';
        const r = await act(() => b.ask<Lines>('refuse invoice', { id, why }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'recheck': {
        const r = await act(() => b.ask<Lines>('recheck', { key: el.dataset.key }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'revoke lane review': {
        const r = await act(() => b.ask<Lines>('revoke lane review', { grant: el.dataset.grant }));
        const at = app.querySelector<HTMLElement>(`[data-revoke="${CSS.escape(el.dataset.grant ?? '')}"]`);
        if (r && at) at.innerHTML = v.revokeReview(el.dataset.grant ?? '', r.lines);
        return;
      }
      case 'revoke lane': {
        const r = await act(() => b.ask<Lines>('revoke lane', { grant: el.dataset.grant }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'own lane': {
        if (!laneAsked) return;
        const r = await act(() => b.ask<Lines>('own lane', { ...laneAsked, digest: el.dataset.digest }));
        if (r) {
          laneAsked = null;
          await fill();
          done(r);
        }
        return;
      }
      case 'link remove': {
        const r = await act(() => b.ask<Lines>('link', { remove: true }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'publish list': {
        const r = await act(() => b.ask<Lines>('publish list', { on: el.dataset.on === 'true' }));
        if (r) {
          state = await b.ask<State>('state');
          await fill();
          done(r);
        }
        return;
      }
      case 'vault transfer': {
        if (!vaultAsked) return;
        const r = await act(() => b.ask<{ lines: v.Line[]; key: string }>('vault transfer', { ...vaultAsked, digest: el.dataset.digest }));
        if (r) {
          vaultAsked = null;
          await fill();
          done(r);
        }
        return;
      }
      case 'rails publish': {
        if (!reviewed) return;
        const r = await act(() => b.ask<Lines>('rails publish', { ...reviewed, digest: el.dataset.digest }));
        if (r) {
          reviewed = null;
          await fill();
          done(r);
        }
        return;
      }
      case 'collective-promise': {
        const f = el.closest<HTMLFormElement>('form.collective-promise');
        if (!f) return;
        const fd = new FormData(f);
        const r = await act(() => b.ask<Lines>('collective promise', { collective: f.dataset.collective, to: str(fd, 'to'), value: str(fd, 'value'), unit: '', whatFor: str(fd, 'whatFor'), digest: el.dataset.digest }));
        if (r) (await fill(), done(r));
        return;
      }
    }
  });

  app.addEventListener('change', async (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.id !== 'manual') return;
    done(await act(() => b.ask<Lines>('manual', { on: el.checked })));
  });

  const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');

  // ---------------------------------------------------------------- forms

  app.addEventListener('submit', async (ev) => {
    const f = ev.target as HTMLFormElement;
    // Not `f.id`: a form with a field named "id" answers that field.
    const fid = f.getAttribute('id');
    if (fid === 'pair') return;
    ev.preventDefault();
    const fd = new FormData(f);
    const into = (html: string) => {
      const box = f.closest('.k-mbody') ?? $('first-part') ?? pane();
      if (box) box.innerHTML = html;
    };
    switch (fid) {
      case 'bring': {
        const r = await act(() => b.ask<Lines>('bring', { id: str(fd, 'id'), words: str(fd, 'words'), address: str(fd, 'address'), relays: str(fd, 'relays') }));
        if (r) (popup.close(), await show(await b.ask<State>('state')), done(r));
        return;
      }
      case 'make': {
        const r = await act(() => b.ask<{ words: string[]; positions: number[] }>('make', { homes: str(fd, 'homes'), relays: str(fd, 'relays') }));
        if (r) into(v.makeWords(r));
        return;
      }
      case 'make-confirm': {
        const typed = [...f.querySelectorAll<HTMLInputElement>('input')].map((x) => x.value.trim());
        const r = await act(() => b.ask<Lines>('make confirm', { typed }));
        if (r) (popup.close(), await show(await b.ask<State>('state')), done(r));
        return;
      }
      case 'renew': {
        const r = await act(() => b.ask<Lines>('renew', { words: str(fd, 'words') }));
        if (r) (popup.close(), keyChanged(app, null), await show(await b.ask<State>('state')), done(r));
        return;
      }
      case 'collective-add': {
        const r = await act(() => b.ask<Lines>('collective add', { id: str(fd, 'id') }));
        if (r) {
          state = await b.ask<State>('state');
          popup.replace(v.collectiveForm(state.identity!.collectives))?.insertAdjacentHTML('afterbegin', v.note('done', v.lines(r.lines)));
        }
        return;
      }
      case 'accept': {
        const keys = [...f.querySelectorAll<HTMLInputElement>('input[name=accept]:checked')].map((x) => x.value);
        const first = state?.stage === 'accept';
        const r = await act(() => b.ask<Lines>('accept', { keys, where: first ? 'first' : 'settings' }));
        if (r) {
          state = await b.ask<State>('state');
          if (first) await show(state);
          else await fill();
          done(r);
        }
        return;
      }
      case 'paste': {
        const r = await act(() => b.ask<{ id: string; lines: v.Line[] }>('paste', { text: str(fd, 'text') }));
        if (r) {
          state = await b.ask<State>('state');
          part = 'to-pay';
          await draw();
          done({ lines: r.lines.slice(0, 1) });
        }
        return;
      }
      case 'rely': {
        const r = await act(() => b.ask<Lines>('rely', { id: str(fd, 'act'), typed: str(fd, 'typed') }));
        if (r) (popup.close(), done(r));
        return;
      }
      case 'anchor-offers': {
        const service = str(fd, 'service');
        const chosen = str(fd, 'act');
        const r = await act(() => b.ask<{ offers: Parameters<typeof v.anchorForm>[1] }>('anchor offers', { service }));
        if (r) popup.replace(v.anchorForm(anchoring, r.offers, service, chosen));
        return;
      }
      case 'anchor': {
        const [offer, tier] = str(fd, 'tier').split(':');
        const r = await act(() => b.ask<Lines>('anchor', { id: f.dataset.act, service: f.dataset.service, offer, tier: Number(tier) }));
        if (r) {
          popup.close();
          state = await b.ask<State>('state');
          [tab, part] = ['account', 'anchors'];
          await draw();
          done(r);
        }
        return;
      }
      case 'tip': {
        const r = await act(() => b.ask<{ id: string; lines: v.Line[] }>('tip', { to: f.dataset.to, value: str(fd, 'value'), unit: str(fd, 'unit'), whatFor: str(fd, 'whatFor') }));
        if (r) {
          popup.close();
          state = await b.ask<State>('state');
          [tab, part] = ['waiting', 'to-pay'];
          await draw();
          done({ lines: r.lines.slice(0, 1) });
        }
        return;
      }
      case 'vault-transfer': {
        const a = { entry: Number(str(fd, 'entry') || 0), value: str(fd, 'value') };
        const r = await act(() => b.ask<{ digest: string; lines: v.Line[]; costs: v.Line[]; blocking: string[] }>('vault transfer read', a));
        if (r) {
          vaultAsked = a;
          $('vault-review')!.innerHTML = v.vaultReview(r);
        }
        return;
      }
      case 'rails': {
        const a = { lightning: str(fd, 'lightning'), onchain: str(fd, 'onchain'), network: Number(str(fd, 'network') || 3), newRequestKey: fd.get('newRequestKey') === 'on' };
        const r = await act(() => b.ask<{ digest: string; lines: v.Line[]; costs: v.Line[] }>('rails review', a));
        if (r) {
          reviewed = a;
          $('rails-review')!.innerHTML = v.railsReview(r);
        }
        return;
      }
      case 'clock':
        return void done(await act(() => b.ask<Lines>('clock', { clock: str(fd, 'clock') })));
      case 'link': {
        const r = await act(() => b.ask<Lines>('link', { rest: str(fd, 'rest'), macaroonFile: str(fd, 'macaroonFile'), certFile: str(fd, 'certFile') }));
        if (r) (await fill(), done(r));
        return;
      }
      case 'relays': {
        const r = await act(() => b.ask<Lines>('relays', { relays: str(fd, 'relays') }));
        if (r) (state = await b.ask<State>('state'), done(r));
        return;
      }
    }
    if (f.classList.contains('invoice')) {
      const r = await act(() => b.ask<Lines>('answer invoice', { id: f.dataset.id, invoice: str(fd, 'invoice') }));
      if (r) (await fill(), done(r));
    } else if (f.classList.contains('paid')) {
      const r = await act(() => b.ask<Lines>('paid', { key: f.dataset.key, proof: str(fd, 'proof') }));
      if (r) (state = await b.ask<State>('state'), await fill(), done(r));
    } else if (f.classList.contains('vault-invoice')) {
      const r = await act(() => b.ask<Lines>('vault invoice', { key: f.dataset.key, invoice: str(fd, 'invoice') }));
      if (r) (await fill(), done(r));
    } else if (f.classList.contains('own-lane')) {
      const until = str(fd, 'until');
      const a = { role: f.dataset.role, cap: str(fd, 'cap'), unit: str(fd, 'unit'), until: until ? Math.floor(new Date(until).getTime() / 1000) : null };
      const r = await act(() => b.ask<{ digest: string; lines: v.Line[] }>('own lane review', a));
      if (r) {
        laneAsked = a;
        $('lane-review')!.innerHTML = v.laneReview(r);
      }
    } else if (f.classList.contains('collective-promise')) {
      const args = { collective: f.dataset.collective, to: str(fd, 'to'), value: str(fd, 'value'), unit: '', whatFor: str(fd, 'whatFor') };
      const r = await act(() => b.ask<{ lines: v.Line[]; digest: string }>('collective promise read', args));
      const box = f.querySelector<HTMLElement>('.promise-read');
      if (r && box) box.innerHTML = v.promiseRead(r);
    }
  });

  return { show };
}
