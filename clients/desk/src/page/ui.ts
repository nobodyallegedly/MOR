// Edubba's page on the kit (round 4 of the redesign, 22 October 2026): its
// tiles, columns, panes, clicks and forms, the same for the program on a
// computer (`app.ts`, paired with it) and for the web client (`../web/app.ts`,
// Edubba's operations run in this browser, without the Agents tile).
// Nothing here signs an act: it asks the program, shows the program's
// plain-words reading of what would be signed, and sends back a digest only
// when the person presses the button that signs. A test collective's
// workings are the collective client's own page logic
// (`clients/collective/src/page/mount.ts`), mounted in its pane.
//
// It keeps in the browser's session storage which tile, part and inner tab
// were open (`edubba:at`), and what Vows' Track points at
// (`edubba:points`); nothing of a key or an act.

import { Client, Refused, type ActRead, type AgentDetails, type AgentView, type Constitution, type Done, type Line, type Permissions, type RealCollective, type ShareHere, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';
import { attachCards, attachClosing, attachColumn, card, cardsUntimed, stampCards, closePanel, copy, note, openPanel, openSlot, panelOpen, popAt, Popup, redrawPanel, shortForm, type CardHost, type KitAct, type KitWho, type MenuItem } from '../../../kit/src/index.ts';
import { mount, type Mounted } from '../../../collective/src/page/mount.ts';
import { reading } from '../../../collective/src/page/view.ts';
import type { Review } from '../../../collective/src/page/api.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';
import type { Proposal as MemberProposal, ShareShown } from '../../../dub/src/shapes.ts';
import { leaveRead as dubLeaveRead, shareTypeBack } from '../../../dub/src/page/view.ts';
import type { Listing } from '../folders.ts';
import { defaultGrid, type Grid, type AreaRow } from '../grid.ts';
import { gridTable } from './grid-view.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const errorOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Whom the page asks: the program on this computer (a paired `Client`), or, on the web, Edubba's operations run in this browser. */
export interface Asker {
  ask<T = unknown>(op: string, args?: object): Promise<T>;
}

let c: Asker;
/** The web client (for testing only): no Agents tile, nothing of Claude's, no pairing. */
let web: Asker | null = null;
let state: State;

/** Where the person is: the tile, the part of its column, the inner tab. */
let tab: v.Tab | null = null;
let part = '';
let sub = '';
/** A collective under the identity in use, acted as (the identity panel's gesture); memory only. */
let as: v.Acting | null = null;
/** The kind of protected file being made. */
let media = 'text';

let collectiveMount: Mounted | null = null;
let postReview: Review | null = null;
/** A real collective's review (H18): founding, a member change, its money. Nothing is signed until confirmed. */
let realReview: { plan: string; digest: string } | null = null;
/** A protected file or a vow read back, waiting for Sign. */
let pubReview: { plan: string; digest: string } | null = null;
const popup = new Popup(app);

const keepAt = () => {
  try {
    sessionStorage.setItem('edubba:at', JSON.stringify(tab ? { tab, part, sub } : null));
  } catch {
    // nothing kept
  }
};

// ---------------------------------------------------------------- the founding grid (round 3)

/** The grid of each form being filled: the founding's, a member change's. */
const grids = new Map<string, Grid>();
/** The grids the person changed: until then, a founding's grid is drawn afresh for the members chosen. */
const touched = new Set<string>();

const nameOf = (id: string) => state.identities.find((i) => i.id === id)?.name ?? state.contacts.find((x) => x.id === id)?.name ?? state.collectives.find((x) => x.id === id)?.name ?? null;
const gridName = (id: string) => nameOf(id) ?? `${id.slice(0, 8)}…`;
const shown = (id: string) => nameOf(id) ?? shortForm(v.idForm(id));

/** The members a form names now: the founder first, then the boxes ticked, then the IDs typed. */
function formMembers(fid: string): string[] {
  const form = $<HTMLFormElement>(fid);
  if (!form) return [];
  const founder = (form.elements.namedItem('founder') as HTMLSelectElement | null)?.value;
  const picked = [...form.querySelectorAll<HTMLInputElement>('input[name=member]:checked')].map((x) => x.value);
  const typed = String((form.elements.namedItem('typed') as HTMLTextAreaElement | null)?.value ?? '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
  return [...new Set([...(founder ? [founder] : []), ...picked, ...typed])];
}

function drawGrid(fid: string): void {
  const g = grids.get(fid);
  const box = $(`e-grid-${fid}`);
  if (!g || !box) return;
  box.innerHTML = gridTable(fid, g, gridName);
}

/** The grid follows the members chosen: new columns empty (the constitution's box filled where every member had one), removed ones gone. */
async function syncGrid(fid: string): Promise<void> {
  const members = formMembers(fid);
  let g = fid === 'real-found' && !touched.has(fid) ? undefined : grids.get(fid);
  if (!g) {
    if (fid === 'real-change') {
      const form = $<HTMLFormElement>(fid);
      const r = await c.ask<{ grid: Grid }>('real grid', { collective: form?.dataset.collective, members }).catch(() => null);
      g = r?.grid ?? defaultGrid(members);
    } else g = defaultGrid(members);
  }
  const all = g.members.every((m) => g!.constitution.holders.includes(m));
  const keep = (xs: string[]) => xs.filter((x) => members.includes(x));
  const added = members.filter((m) => !g!.members.includes(m));
  g = {
    ...g,
    members,
    constitution: { holders: [...keep(g.constitution.holders), ...(all ? added : [])], number: all && g.constitution.number >= g.members.length ? members.length : g.constitution.number },
    areas: g.areas.map((l) => ({ ...l, holders: keep(l.holders) })),
  };
  grids.set(fid, g);
  drawGrid(fid);
}

/** A tap or a change in a grid (`grid-view.ts`): the grid's state changed, then drawn again. */
function gridEvent(el: HTMLElement): boolean {
  const box = el.closest<HTMLElement>('[data-grid-form]');
  if (!box) return false;
  const fid = box.dataset.gridForm!;
  const g = grids.get(fid);
  if (!g) return false;
  touched.add(fid);
  const d = el.dataset;
  const row = (i: string | undefined): AreaRow | undefined => (i === undefined ? undefined : g.areas[Number(i)]);
  const toggle = (xs: string[], m: string) => (xs.includes(m) ? xs.filter((x) => x !== m) : [...xs, m]);
  if (d.gridCell !== undefined) {
    const m = d.m!;
    if (d.gridCell === 'const') g.constitution = { ...g.constitution, holders: toggle(g.constitution.holders, m) };
    else {
      const l = row(d.gridCell.split(':')[1])!;
      l.holders = toggle(l.holders, m);
      l.number = Math.max(1, Math.min(l.number, l.holders.length || 1));
    }
  } else if (d.gridAdd !== undefined) {
    g.areas.push({ name: '', layer: 2, holders: [], number: 1 });
  } else if (d.gridRemove !== undefined) {
    g.areas.splice(Number(d.gridRemove), 1);
  } else if (d.gridNum !== undefined) {
    const n = Number((el as HTMLInputElement).value);
    if (d.gridNum === 'const') g.constitution = { ...g.constitution, number: n };
    else if (d.gridNum === 'chain') g.chainKey = n;
    else if (d.gridNum === 'absence') g.absence = n;
    else if (d.gridNum === 'clone') g.clone = n;
    else row(d.gridNum.split(':')[1])!.number = n;
  } else if (d.gridLayer !== undefined) {
    const l = row(d.gridLayer)!;
    l.layer = Number((el as HTMLSelectElement).value);
    if (l.kinds) l.kinds = [];
    if (l.layer !== 2) delete l.cap;
  } else if (d.gridSome !== undefined) {
    const l = row(d.gridSome)!;
    if ((el as HTMLInputElement).checked) l.kinds = [];
    else delete l.kinds;
  } else if (d.gridKind !== undefined) {
    const l = row(d.gridKind)!;
    l.kinds = toggle(l.kinds ?? [], (el as HTMLInputElement).value);
  } else if (d.gridCap !== undefined) {
    const x = (el as HTMLInputElement).value.trim();
    const l = row(d.gridCap)!;
    if (x) l.cap = Number(x);
    else delete l.cap;
  } else if (d.gridName !== undefined) {
    row(d.gridName)!.name = (el as HTMLInputElement).value;
    return true;
  } else return false;
  drawGrid(fid);
  return true;
}

app.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-grid-cell],[data-grid-add],[data-grid-remove]');
  if (el && gridEvent(el)) ev.preventDefault();
});
app.addEventListener('input', (ev) => {
  const el = ev.target as HTMLElement;
  if (el.dataset.gridName !== undefined) gridEvent(el);
});

// ---------------------------------------------------------------- saying

const unpaired = (err: unknown) => err instanceof Refused && err.status === 401 && /not paired/.test(err.message);

/** Said in the status box (top), or right where it happened (`where`). */
function say(kind: 'error' | 'done' | 'warn' | '', html: string, where?: HTMLElement | null) {
  const k = kind === 'warn' ? '' : kind;
  if (where) {
    where.querySelector(':scope > .k-note[data-e-said]')?.remove();
    if (html) where.insertAdjacentHTML('afterbegin', note(k, html).replace('class="k-note', 'data-e-said class="k-note'));
    return;
  }
  let s = $('e-status');
  if (!s) {
    app.insertAdjacentHTML('beforeend', '<div id="e-status" class="k-status" role="status" aria-live="polite"></div>');
    s = $('e-status')!;
  }
  s.innerHTML = html ? `${note(k, html)}<button type="button" class="k-round k-close" data-action="status-close" aria-label="Close">×</button>` : '';
}

function fail(err: unknown, where?: HTMLElement | null) {
  if (unpaired(err)) {
    void start();
    return;
  }
  const m = errorOf(err);
  say('error', v.e(m), where);
  if (v.KEY_CHANGED_START.some((x) => m.startsWith(x))) void offerRenew();
}

/**
 * H80: where a refusal (or the check on opening) says a key held here was
 * changed elsewhere, the warning under the top, and the box for the new
 * words right under it, as in the other apps.
 */
async function offerRenew(changed?: { id: string; name: string; say: string; kind: 'identity' | 'collective' }[]) {
  const xs = changed ?? (await c.ask<{ id: string; name: string; say: string; kind: 'identity' | 'collective' }[]>('keys check').catch(() => []));
  spentNow = xs.filter((x) => v.KEY_CHANGED_START.some((k) => x.say.startsWith(k)));
  drawAlarms();
}

/** Keys changed elsewhere (H80), and the seller's alarms (Agreements rule 45b), drawn under the top. */
let spentNow: { id: string; name: string; say: string; kind: 'identity' | 'collective' }[] = [];
function alarmsHtml(): string {
  const forms = spentNow.map((x) => (x.kind === 'collective' ? `<p class="small"><strong>${v.e(x.name)}</strong></p>${v.renewCollectiveForm(x.id)}` : v.renewIdentityForm(x.id, x.name))).join('');
  let hidden: string[] = [];
  try {
    hidden = JSON.parse(sessionStorage.getItem('edubba:alarms-seen') ?? '[]') as string[];
  } catch {
    // nothing kept
  }
  const alarms = state.identities.flatMap((i) => i.received.filter((x) => x.alarm && !hidden.includes(x.key)).map((x) => ({ name: i.name, alarm: x.alarm, act: x.act, key: x.key })));
  const seller = alarms.length ? v.sellerAlarms(alarms).replace('</div>', `<div class="k-row"><button type="button" class="k-btn k-small" data-action="alarms-seen" data-keys="${v.e(JSON.stringify(alarms.map((a) => a.key)))}">Seen: hide until Edubba opens again</button></div></div>`) : '';
  return `<div id="e-alarms">${v.spent(spentNow, forms)}${seller}</div>`;
}
function drawAlarms() {
  const at = $('e-alarms');
  const html = alarmsHtml();
  if (at) at.outerHTML = html;
  else app.querySelector('.k-top')?.insertAdjacentHTML('afterend', html);
}

let working = false;

/** Busy: the buttons wait, so nothing is sent twice. */
async function busy<T>(words: string, f: () => Promise<T>, where?: HTMLElement | null): Promise<T | undefined> {
  if (words && !where) say('', `<span class="k-small">${v.e(words)}</span>`);
  working = true;
  const was = [...app.querySelectorAll('button')].map((b) => [b, b.disabled] as const);
  app.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    const r = await f();
    if (words && !where && $('e-status')?.textContent?.includes(words)) say('', '');
    return r;
  } catch (err) {
    fail(err, where);
    return undefined;
  } finally {
    for (const [b, d] of was) if (b.isConnected) b.disabled = d;
    working = false;
  }
}

// ---------------------------------------------------------------- Kišib's runner: its panel in Edubba's slot (the Dubsar runner cMIP, section 4)

let slot: { close(): void; request: string } | null = null;
const NOT_WATCHED = new Set(['runner asking', 'runner', 'state', 'runner drop', 'keys check', 'member proposals', 'real gather', 'refresh', 'fold']);
/** Ask the program; for an identity used through Kišib, Kišib's panel is drawn in the slot while it waits for the person. */
async function ask<T>(op: string, a?: object): Promise<T> {
  const me = state?.identities.find((i) => i.id === state.acting);
  if (web || NOT_WATCHED.has(op) || me?.kind !== 'runner') return c.ask<T>(op, a);
  let over = false;
  const watch = (async () => {
    while (!over) {
      await new Promise((r) => setTimeout(r, 300));
      if (over) break;
      const w = await c.ask<{ asking: { request: string; panel: string; title: string } | null; origin: string | null }>('runner asking').catch(() => null);
      if (over || !w?.asking || !w.origin || slot?.request === w.asking.request) continue;
      const asked = w.asking;
      slot?.close();
      try {
        const s = openSlot(app, {
          app: 'kishib',
          by: 'Kišib',
          host: 'Edubba',
          src: asked.panel,
          allowed: [w.origin, w.origin.replace('127.0.0.1', 'localhost')],
          closed: () => {
            slot = null;
            void c.ask('runner drop', { request: asked.request }).catch(() => undefined);
          },
        });
        slot = { close: () => s.close(), request: asked.request };
      } catch (e) {
        say('error', v.e(errorOf(e)));
      }
    }
  })();
  try {
    return await c.ask<T>(op, a);
  } finally {
    over = true;
    await watch;
    slot?.close();
    slot = null;
  }
}

// ---------------------------------------------------------------- cards: each with the kit's two menus

interface Drawn {
  act: KitAct;
  /** Why it is valid, in lines, where Edubba read it. */
  why?: Line[];
  /** A sale of a vow bought by an identity held here, still pending: confirmed or contested from the act's menu. */
  sale?: { vow: string; sale: string; buyer: string; seller: string; amount: { unit: string; value: number } | null };
  /** A test collective's own post: corrected as the collective. */
  collective?: string;
  /** Anchored as a collective's act (its founding, its agreements). */
  anchorable?: string;
}
const drawn = new Map<string, Drawn>();

const who = (id: string, o: { name?: string | null; collective?: boolean } = {}): KitWho => {
  const form = v.idForm(id);
  return { id, form, link: form, name: o.name ?? nameOf(id), me: id === state.acting, collective: o.collective, followed: state.contacts.some((x) => x.id === id) };
};

/** A card drawn, and kept for its menus. */
function cardOf(a: Omit<KitAct, 'form'> & { form?: string }, extra: Omit<Drawn, 'act'> = {}): string {
  const act: KitAct = { ...a, form: a.form ?? v.formOf(a.id) };
  drawn.set(act.id, { act, ...extra });
  return card(act);
}

const host: CardHost = {
  app: 'Edubba',
  act: (id) => drawn.get(id)?.act,
  signerItems: () => [],
  actItems: (a) => {
    const d = drawn.get(a.id);
    const after: MenuItem[] = [];
    if (d?.sale) after.push({ key: 'confirm-sale', label: 'Confirm: it was kept', line: true, disabled: !d.sale.amount }, { key: 'contest-sale', label: 'Contest it…' });
    return { before: [], after };
  },
  choose: (key, a) => void choose(key, a),
};
attachCards(app, host);
attachClosing();

async function choose(key: string, a: KitAct) {
  const d = drawn.get(a.id);
  switch (key) {
    case 'profile': {
      const w = a.signer;
      popup.show(w.name ?? shortForm(w.form), v.inside(`<p class="small">${w.collective ? 'A collective' : 'An identity'}: <code>${v.e(w.form)}</code></p><div class="row"><button data-action="copy" data-text="${v.e(w.form)}">Copy ID</button>${state.contacts.some((x) => x.id === w.id) ? '' : `<button data-action="contact-add-from" data-id="${v.e(w.id)}">Follow: add to contacts</button>`}</div><p class="small">Its feed and messages are in Dub; its full record is in Kišib.</p>`));
      return;
    }
    case 'open':
    case 'why': {
      const id = key === 'open' ? (a.answers?.id ?? a.corrects?.id ?? '') : a.id;
      if (key === 'why' && d?.why?.length) return void popup.show('Why it’s valid', v.inside(v.lines(d.why)));
      const body = popup.show(key === 'open' ? 'What it answers' : 'Why it’s valid', '<p class="k-empty">Reading it back…</p>');
      try {
        const r = await c.ask<ActRead>('read act', { identity: state.acting, act: id });
        if (body.isConnected) popup.replace(v.inside(`${v.lines(r.lines)}${r.text !== null ? `<div class="plain">${v.e(r.text)}</div>` : ''}`));
      } catch (err) {
        popup.replace(note('error', v.e(errorOf(err))));
      }
      return;
    }
    case 'follow':
      return void popup.show('Follow: add to contacts', v.inside(`<form id="contact-add" class="row"><input name="id" type="hidden" value="${v.e(a.signer.id)}"><input name="name" type="text" class="pet" placeholder="Its name here" value="${v.e(a.signer.name ?? '')}" required><button type="submit" class="primary">Add</button></form><p class="small">Edubba’s contacts are kept ${web ? 'in this browser' : 'on this Mac'} and never published; Dub’s follow list is read into them.</p>`));
    case 'unfollow':
      return void (await busy('Removing…', async () => {
        await c.ask('real contact remove', { id: a.signer.id });
        await refresh();
      }));
    case 'mute':
    case 'unmute':
      return void say('', 'Muting is Dub’s: whom you read and whom you mute live in Dub’s contacts.');
    case 'rely': {
      const body = popup.show('Rely on it', '<p class="k-empty">Reading it back…</p>');
      try {
        const r = await c.ask<ActRead>('read act', { identity: state.acting, act: a.id });
        if (body.isConnected) popup.replace(v.inside(v.relyShown(state.acting!, r)));
      } catch (err) {
        popup.replace(note('error', v.e(errorOf(err))));
      }
      return;
    }
    case 'anchor': {
      popup.show('Anchor it', v.inside(`<ul class="say">${v.ANCHOR_SAY.map((t) => `<li>${v.e(t)}</li>`).join('')}</ul><form id="anchor-any" data-act="${v.e(a.id)}"><label>The anchoring service: its ID</label><div class="row"><input name="service" class="grow" autocomplete="off" spellcheck="false" required><button type="submit">Read its offer</button></div></form><div id="e-anchor-any"></div>`));
      return;
    }
    case 'correct': {
      popup.show('Correct it', v.inside(`<p class="small">${v.e(v.CORRECTION_SAY)}</p><form id="correct-any" data-act="${v.e(a.id)}"${d?.collective ? ` data-collective="${v.e(d.collective)}"` : ''}><textarea name="text" required>${v.e(a.text ?? '')}</textarea><div class="row"><button type="submit" class="primary">${d?.collective ? 'Read the correction back' : 'Sign the correction'}</button></div></form><div id="e-correct-review"></div>`));
      return;
    }
    case 'confirm-sale': {
      const x = d?.sale;
      if (!x?.amount) return;
      if (!confirm('Confirm that this vow was kept? Edubba prepares your claim of its payment, acknowledging the vow, for Damgar to sign (a Money act): it waits in Damgar.')) return;
      const r = await busy('Preparing the confirmation for Damgar…', () => ask<Done>('publishing confirm sale', { vow: x.vow, sale: x.sale, buyer: x.buyer, seller: x.seller, unit: x.amount!.unit, value: x.amount!.value }));
      if (r) say('done', v.done(r));
      return;
    }
    case 'contest-sale': {
      const x = d?.sale;
      if (!x) return;
      popup.show('Contest it', v.inside(`<form class="pub-contest" data-vow="${v.e(x.vow)}" data-sale="${v.e(x.sale)}" data-buyer="${v.e(x.buyer)}"><label>What was not kept (optional, public)</label><input name="promise" maxlength="280"><div class="row"><button type="submit" class="primary">Contest it, as ${v.e(shown(x.buyer))}</button></div><p class="small">A contest is public, signed by the buyer: it is shown beside the sale and changes no payment.</p></form>`));
      return;
    }
  }
}

// ---------------------------------------------------------------- drawing

function counts(): Partial<Record<v.Tab, number>> {
  return { agents: state.agents.reduce((n, a) => n + a.notified, 0) };
}

const alarms = () => alarmsHtml();

async function show(s: State) {
  state = s;
  closePanel();
  if (as && !Object.values(state.under ?? {}).some((xs) => xs.some((x) => x.id === as!.id))) as = null;
  if (!state.identities.some((i) => !state.agents.some((a) => a.id === i.id))) {
    app.innerHTML = v.firstScreen();
    return;
  }
  await draw();
}

async function draw() {
  keepAt();
  collectiveMount = null;
  drawn.clear();
  if (!tab) {
    app.innerHTML = v.home(state, as, alarms());
    return;
  }
  if (!v.tabsHere().includes(tab)) tab = 'collectives';
  if (tab === 'publishing' || tab === 'vows') await readPublishing().catch(() => null);
  // Two redraws can overlap: what the first saw typed is kept until a pane is drawn.
  typed = (pane() ? typingNow(pane()!) : null) ?? typed;
  const k = { here: pubCache?.works.length, mine: pubCache?.vows.length, sales: pubCache ? pubCache.works.reduce((n, w) => n + Object.keys(w.delivered).length, 0) : undefined, toSign: toSignCount, deals: pubCache?.deals?.filter((d) => d.state === 'waiting').length || undefined, dealsToSign: dealsToSignCount };
  app.innerHTML = v.tabPage(state, tab, part, k, as, alarms(), counts());
  await fill();
}

const pane = () => $('pane');
let filling = 0;
/** The form last sent: its text is not kept across the redraw that follows. */
let sentForm: string | null = null;
type Typed = { form: string; name: string; value: string; at: number | null };
/** What is typed when the whole page is redrawn, given back once its pane is filled. */
let typed: Typed | null = null;

/**
 * What is being typed survives a redraw (H32): a reading that lands late must
 * not empty the box the person is typing in. A form just sent is not kept.
 */
function typingNow(within: HTMLElement): Typed | null {
  const t = document.activeElement;
  const typing = t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && t.type === 'text') ? t : null;
  const form = typing?.form?.getAttribute('id');
  return typing && form && form !== sentForm && within.contains(typing) && typing.value ? { form, name: typing.name, value: typing.value, at: typing.selectionStart } : null;
}

/** The part open, filled from what Edubba reads. */
async function fill() {
  const p = pane();
  if (!p) return;
  const mine = ++filling;
  try {
    const html = await partHtml();
    if (mine !== filling || !p.isConnected) return;
    const kept = typed ?? typingNow(p);
    typed = null;
    p.innerHTML = html;
    if (kept) {
      const again = p.querySelector<HTMLTextAreaElement | HTMLInputElement>(`form#${CSS.escape(kept.form)} [name="${CSS.escape(kept.name)}"]`);
      if (again && !again.value) {
        again.value = kept.value;
        again.focus();
        if (kept.at !== null) again.setSelectionRange(kept.at, kept.at);
      }
    }
    await after();
    void timeCards(p);
  } catch (err) {
    if (mine !== filling) return;
    p.innerHTML = '';
    fail(err);
  }
}

/** The Dubsar clock's time on the cards drawn in a pane that show none yet (decided 23 October 2026): read after drawing, so a slow clock delays nothing. */
async function timeCards(root: HTMLElement) {
  const ids = cardsUntimed(root);
  if (!ids.length) return;
  const words = await c.ask<Record<string, string>>('clock words', { ids }).catch(() => ({}) as Record<string, string>);
  if (root.isConnected) stampCards(root, words);
}

/** What is filled in once a pane is drawn: grids, the collective client's page, late readings. */
let after = async () => undefined as void;

let pubCache: v.PublishingShown | null = null;
let toSignCount = 0;
let dealsToSignCount = 0;

async function partHtml(): Promise<string> {
  after = async () => undefined;
  switch (tab) {
    case 'agents':
      return agentsPart();
    case 'collectives':
      return collectivesPart();
    case 'publishing':
      return publishingPart();
    case 'vows':
      return vowsPart();
  }
  return '';
}

// ---------------------------------------------------------------- agents

async function agentsPart(): Promise<string> {
  if (part === 'add' || !state.agents.length) {
    if (part !== 'add') part = 'add';
    return v.inside(`${v.agentWindow(state, !state.agents.length).replace('<section class="card" id="e-window">', '<section id="e-window">')}`);
  }
  if (part === 'key') return v.keyPane(state, v.KEY_SAY);
  const agent = part.startsWith('agent:') ? part.slice(6) : state.agents[0].id;
  if (!state.agents.some((a) => a.id === agent)) {
    part = `agent:${state.agents[0].id}`;
    return agentsPart();
  }
  if (!['talk', 'queue', 'mind', 'terms'].includes(sub)) sub = 'talk';
  const d = await c.ask<AgentDetails>('agent', { agent });
  const name = (d.agentName ?? '').replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '') || shown(agent);
  const top = v.agentHead(d, d.notified.length, sub);
  if (sub === 'talk') {
    const cards: string[] = [];
    const inTalk = new Set(d.conversation.map((m) => m.act).filter(Boolean));
    const items: { time: number; html: string }[] = d.conversation
      .filter((m) => m.act)
      .map((m) => ({
        time: m.time,
        html: cardOf({ id: m.act!, signer: who(m.from === 'owner' ? d.owner! : agent, { name: m.from === 'owner' ? shown(d.owner!) : name }), kind: m.from === 'owner' ? 'sealed prompt' : 'sealed answer', text: m.text, labels: m.note ? [{ text: m.note }] : [], verified: true }),
      }));
    for (const h of d.history)
      if (h.act && !inTalk.has(h.act) && h.verdict !== 'prompted')
        items.push({
          time: h.time,
          html: cardOf({ id: h.act, signer: who(h.signer, { name: h.signer === agent ? name : shown(h.signer) }), kind: h.verdict === 'under grant' ? 'under a grant' : h.verdict, text: h.text ?? h.title, labels: [{ text: `what it did: ${h.title}` }, ...(h.cause ? [{ text: `because: ${h.cause}` }] : [])], verified: true }),
        });
    items.sort((x, y) => x.time - y.time);
    for (const x of items) cards.push(x.html);
    after = async () => {
      const f = $('talk-feed');
      if (f) f.scrollTop = f.scrollHeight;
    };
    return `${top}${v.talkPane(cards.join(''), name, d.stopped)}`;
  }
  if (sub === 'queue') {
    const cards = d.notified
      .map((x) =>
        cardOf({
          id: x.act ?? x.key,
          form: x.act ? v.formOf(x.act) : x.key,
          signer: who(x.from ?? '', { name: x.fromName?.replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '') ?? 'an unknown sender' }),
          kind: x.private ? 'sealed note' : x.kind === 'reply' ? 'public reply' : 'public note',
          text: x.text ?? '',
          html: `<div class="edubba-card-acts"><label class="k-small"><input type="checkbox" name="pick-select" value="${v.e(x.key)}"> Select</label><button type="button" class="k-btn k-p" data-action="machine-pick" data-key="${v.e(x.key)}">Pick: it answers now</button></div>`,
          verified: x.standing === 'valid',
          alarm: x.standing === 'valid' ? null : x.standing,
        }),
      )
      .join('');
    return `${top}${v.queuePane(d, cards)}`;
  }
  if (sub === 'mind') {
    const n = await c.ask<v.NotesRead>('agent notes', { agent }).catch((e) => ({ notes: [], problems: [errorOf(e)], costs: '', diary: { say: '', button: '' } }) as v.NotesRead);
    const live = n.notes.filter((x) => !x.dropped);
    const dropped = n.notes.filter((x) => x.dropped);
    const one = (x: v.NotesRead['notes'][number]) =>
      `<div class="item"><div class="row tight"><span class="grow" dir="auto">${v.e(x.text)}</span>${x.dropped ? `<span class="small">dropped${x.dropped.by === 'owner' ? ' at your request' : ' by it'}</span>` : `<button class="quiet" data-action="note-retire" data-note="${v.e(x.id)}">Retire</button>`}</div><span class="meta">${x.kind === 'person' ? `about ${v.e((x.aboutName ?? '').replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, ''))}` : x.kind === 'instruction' ? 'your standing instruction' : x.kind === 'said' ? 'what it said publicly' : 'an open thread'}</span></div>`;
    const notes = `<h3>Its notes (${live.length})</h3>${n.problems.map((p) => `<p class="small">${v.e(p)}</p>`).join('')}${live.map(one).join('') || '<p class="small">No notes yet.</p>'}${dropped.length ? `<details><summary class="small">Dropped (${dropped.length})</summary>${dropped.map(one).join('')}</details>` : ''}${n.costs ? `<p class="small">${v.e(n.costs)}</p>` : ''}`;
    return `${top}${v.mindPane(notes, d.follows.length, v.diaryShut())}`;
  }
  // Terms.
  const grants = await c.ask<v.GrantListed[]>('agent grants', { agent }).catch(() => [] as v.GrantListed[]);
  const keeperFor: string[] = [];
  for (const x of state.collectives.filter((y) => y.real)) {
    const k = await c.ask<v.KeepersShown>('real keepers', { collective: x.id }).catch(() => null);
    if (k?.keepers.some((y) => y.id === agent)) keeperFor.push(x.name);
  }
  return `${top}${v.termsPane(d, v.grantsCard(grants).replace('<details class="card fold"', '<details class="card fold" open'), keeperFor)}`;
}

// ---------------------------------------------------------------- collectives

/** To sign: proposals sent to the identity in use; a collective's in Collectives, a shared deal's (this round) in Publishing. */
async function readSign(collective: string | null, deals = false): Promise<string> {
  const r = await c.ask<{ proposals: MemberProposal[]; problems: string[] }>('member proposals').catch((e) => ({ proposals: [], problems: [errorOf(e)] }));
  memberAwaits = r.proposals.some((p) => !p.answer || p.share === 'waiting' || p.share === 'ready');
  const isDeal = (p: MemberProposal) => p.reading?.kind === 'deal';
  toSignCount = r.proposals.filter((p) => !p.answer && !isDeal(p)).length;
  dealsToSignCount = r.proposals.filter((p) => !p.answer && isDeal(p)).length;
  const mine = deals ? r.proposals.filter(isDeal) : collective ? r.proposals.filter((p) => p.collective === collective) : r.proposals.filter((p) => !isDeal(p));
  const html = v.memberSigning(state, { proposals: mine, problems: r.problems });
  return deals ? html.replace('by a collective’s founder', 'by the person who set up a shared deal').replace('agreements for real collectives: founding one, changing its members, its releases', 'shared deals with other people: a work, a vow or a post whose payments a split service divides') : html;
}

async function collectivesPart(): Promise<string> {
  realReview = null;
  if (part === 'found') {
    after = async () => void (await syncGrid('real-found'));
    return v.inside(v.realFound(state));
  }
  if (part === 'test') {
    after = mountCollective;
    return v.inside(v.foundCollective());
  }
  if (part === 'bring') return v.inside(v.bringCollective());
  if (part === 'sign') return v.inside(`<div id="e-signing-wrap">${await readSign(null)}</div>`);
  if (part.startsWith('p:')) {
    const p = state.proposals.find((x) => x.act === part.slice(2) && !x.founded);
    if (p) return v.inside(v.realProposalDetails(state, p));
  }
  const id = part.startsWith('c:') ? part.slice(2) : '';
  const col = state.collectives.find((x) => x.id === id);
  if (!col) {
    part = state.collectives[0] ? `c:${state.collectives[0].id}` : 'found';
    return collectivesPart();
  }
  const subs = col.real ? ['act', 'members', 'money', 'keepers', 'sign'] : col.brought ? ['act', 'sign'] : ['act', 'members'];
  if (!subs.includes(sub)) sub = 'act';
  const head = v.collectiveHead(col, sub, 0);
  const acting = shown(state.acting ?? '');
  if (sub === 'act') {
    const p = await c.ask<Permissions>('collective permissions', { collective: id }).catch((e) => ({ items: [], notes: [{ text: errorOf(e) }] }) as unknown as Permissions);
    const chips = p.items.map((i) => v.chip(i.what, i.state, i.lines.map((l) => l.text).join(' '))).join('');
    const posts = await c.ask<{ items: { id: string; text: string; standing: string; when?: string | null; hint?: string | null; pictures: string[]; corrects: string | null; correctedBy: string[] }[]; problems: string[] }>('collective posts', { collective: id }).catch((e) => ({ items: [], problems: [errorOf(e)] }));
    const test = !col.real && !col.brought;
    const cards = posts.items
      .map((x) =>
        cardOf(
          {
            id: x.id,
            signer: who(id, { name: col.name, collective: true }),
            text: x.text,
            when: x.when ?? null,
            hint: x.hint ?? null,
            html: x.pictures.map((src) => `<figure><img alt="A picture of the post" src="${v.e(src)}"></figure>`).join(''),
            labels: [...(x.corrects ? [{ text: `correction of ${shortForm(v.formOf(x.corrects))}` }] : []), ...(x.correctedBy.length ? [{ text: `corrected by ${x.correctedBy.map((y) => shortForm(v.formOf(y))).join(', ')}` }] : [])],
            corrects: x.corrects ? { id: x.corrects, signer: id } : null,
            verified: x.standing === 'valid',
            alarm: x.standing === 'valid' ? null : x.standing,
            own: test,
          },
          { collective: test ? id : undefined },
        ),
      )
      .join('');
    const typing = col.brought ? null : v.postBox(col.name, test);
    return `${head}${v.actPane({ name: col.name, acting, chips, cards, typing, note: [...p.notes.map((l) => v.e(l.text)), ...posts.problems.map(v.e), col.brought ? 'Brought here: Edubba holds none of its keys, so nothing can be signed for it here.' : test ? v.e(v.TEST_MODE_SAY) : ''].filter(Boolean).join('<br>') })}`;
  }
  if (sub === 'sign') return `${head}${v.inside(`<div id="e-signing-wrap">${await readSign(id)}</div>${state.proposals.filter((x) => x.collective === id && x.kind === 'release').map((x) => v.proposalStatus(state, x)).join('')}`)}`;
  if (!col.real) {
    // A test collective's members, money and endings: the collective client's own page, kept.
    after = mountCollective;
    return `${head}${v.inside(`<div class="colroot" data-collective-root id="e-col-root"><div id="status"></div><div id="review"></div><div id="collectives"></div>
<details class="card"><summary>Sign or check a release by its id</summary><div id="by-id"></div></details>
<details class="card"><summary>What was signed, in every collective</summary><div id="history"></div></details></div>`)}`;
  }
  const rc = await c.ask<RealCollective>('real collective', { collective: id });
  if (sub === 'members') {
    after = async () => {
      grids.delete('real-change');
      touched.delete('real-change');
      await syncGrid('real-change');
    };
    const resigned = rc.resigned ?? [];
    return `${head}${v.inside(`<h3>Its members (${rc.members.length})</h3><ul class="plain">${rc.members.map((m) => `<li>${v.person(state, m)}${m === rc.holder ? ' <span class="small">holds its signing key, here</span>' : ''}</li>`).join('')}</ul>
<p class="small">Its chain key: one share per member, kept on paper, any ${rc.threshold} rebuilding it. ${rc.fingerprint ? `Dealing fingerprint <code>${v.e(rc.fingerprint.match(/.{1,4}/g)!.slice(0, 8).join(' '))}</code>.` : 'Dealt in Kišib: its fingerprint was shown there and in each member’s app.'} No app holds a share.</p>
${rc.pending ? v.note('warn', 'A member change was rotated and waits for its homes to count it.') : ''}
${resigned.length ? `<section class="card" id="e-resigned"><h3>Leaving alone (rule 70)</h3><ul class="plain">${resigned.map((r) => `<li>${v.person(state, r.member)} resigned, act ${v.fp(r.act)}. ${r.registered ? `Registered at the collective’s line ${v.fp(r.registered)}: now change its members without them, below.` : `<button data-action="real-register-resignation" data-collective="${v.e(id)}" data-act="${v.e(r.act)}">Register a resignation: at the collective’s line</button>`}</li>`).join('')}</ul><p class="small">A member can always leave alone: nobody else signs a resignation. It takes effect at the collective’s line registering it.</p></section>` : ''}
${v.sharesHere(state, id, rc.toShow)}<div id="e-shares-here"></div>
${state.proposals.filter((p) => p.collective === id && p.kind === 'clone').map((p) => v.proposalStatus(state, p)).join('')}
${v.foldCard('e-real-change', 'collective-change', 'Change its members', `<form id="real-change" data-collective="${v.e(id)}">
<p class="small">Tick who is a member after the change. Every member whose voice remains signs it, and each joining member, each in their own app, each naming a new key of their own; then it waits for Kišib.</p>
<div class="picks">${rc.members.map((m) => `<label class="check"><input type="checkbox" name="member" value="${v.e(m)}" checked> ${v.person(state, m)}</label>`).join('')}</div>
${v.contactPicks(state, [], rc.members)}
<label>Or by ID, one per line</label><textarea name="typed" spellcheck="false"></textarea>
<h3>Who decides what, after the change</h3>
<div id="e-grid-real-change"><p class="small">Reading its agreement in force…</p></div>
<div class="row"><button type="submit">Review the change</button></div></form>`, false)}
<p class="small">Leaving it yourself: “Leave this collective…” in its To sign, once you signed its founding as a member.</p>
<div id="e-real-review"></div>`)}`;
  }
  if (sub === 'money') {
    after = async () => drawMoney(id);
    return `${head}${v.inside(`${v.moneyCard(state, id, rc).replace('<details class="card fold"', '<details class="card fold" open')}
${state.proposals.filter((p) => p.collective === id && p.kind === 'money').map((p) => v.proposalStatus(state, p)).join('')}
<div id="e-real-review"></div>${web ? '' : v.realMoney(state, id, rc.members)}
<p class="small">A collective’s releases are made in Ummia (and signed here, in To sign); anchoring its founding and agreements is here until Ummia’s round takes it.</p>`)}`;
  }
  // Keepers.
  const k = await c.ask<v.KeepersShown>('real keepers', { collective: id }).catch(() => null);
  return `${head}${v.inside(k ? v.keepersShown(state, id, k).replace('<details class="card fold"', '<details class="card fold" open') : v.note('error', 'Its keepers could not be read.'))}`;
}

/** The collective client's page logic, for a test collective (or its founding, or its settings). */
async function mountCollective() {
  const root = app.querySelector<HTMLElement>('[data-collective-root]');
  if (!root) return;
  const only = part.startsWith('c:') ? part.slice(2) : undefined;
  collectiveMount = mount(root, {
    ask: (op, args) => c.ask(`collective ${op}`, args ?? {}),
    fail: (err) => {
      if (!unpaired(err)) return false;
      void start();
      return true;
    },
    only: () => only,
    // Something was signed: the collectives listed may have changed (one founded, one ended).
    done: async () => {
      const before = state.collectives.map((x) => x.id).join(',');
      state = await c.ask<State>('state');
      if (state.collectives.map((x) => x.id).join(',') !== before) {
        const added = state.collectives.find((x) => !before.includes(x.id));
        if (added && part === 'test') {
          part = `c:${added.id}`;
          sub = 'members';
          await draw();
        }
      }
    },
  });
  try {
    await collectiveMount.refresh();
  } catch (err) {
    fail(err);
  }
}

/** F338: the units a money draft may name, the acts a collective may anchor, and the anchors asked. */
let units: { hash: string; label: string }[] | null = null;
async function drawMoney(collective: string) {
  try {
    units ??= await c.ask<{ hash: string; label: string }[]>('money units');
    app.querySelectorAll<HTMLSelectElement>('select[data-units]').forEach((x) => (x.innerHTML = units!.map((u) => `<option value="${v.e(u.hash)}">${v.e(u.label)}</option>`).join('')));
    const acts = await c.ask<{ act: string; label: string }[]>('money anchorable', { collective });
    const sel = app.querySelector<HTMLSelectElement>(`select[data-anchorable="${CSS.escape(collective)}"]`);
    if (sel) sel.innerHTML = acts.map((a) => `<option value="${v.e(a.act)}">${v.e(a.label)} (${v.e(a.act.slice(0, 8))}…)</option>`).join('');
    const xs = await c.ask<Parameters<typeof v.anchors>[0]>('money anchors', { collective });
    const box = $('e-anchors');
    if (box) box.innerHTML = v.anchors(xs);
  } catch (err) {
    const box = $('e-anchors');
    if (box) box.innerHTML = v.note('error', v.e(errorOf(err)));
  }
}

// ---------------------------------------------------------------- publishing and vows

/** "Who shares in it" (this round): the contacts' names offered, the deal's own payee to give the split service. */
const sharesHtml = (p: v.PublishingShown, kind: string) => v.sharesFields({ names: [...state.contacts.map((x) => x.name), ...state.identities.filter((i) => i.id !== state.acting).map((i) => i.name)], payee: p.dealPayee ?? null, say: p.sharesSay ?? [], kind });
const MEDIA_KIND: Record<string, string> = { text: 'text', picture: 'picture', video: 'film', audio: 'recording' };
/** What "Who shares in it" holds, as the program takes it. */
const sharesOf = (d: FormData) => ({ with: [0, 1].map((i) => ({ who: words(d.get(`with${i}`)), share: words(d.get(`share${i}`)) })), mine: words(d.get('mine')), referral: words(d.get('dealReferral')), service: words(d.get('dealService')), serviceKey: words(d.get('dealKey')) });
const actorsHtml = (p: v.PublishingShown) => v.whoActs(p.actors.filter((x) => x.kind === 'collective' || x.id === state.acting), p.as, (id) => shown(id));

async function readPublishing(): Promise<v.PublishingShown> {
  pubCache = await c.ask<v.PublishingShown>('publishing');
  return pubCache;
}

async function publishingPart(): Promise<string> {
  const p = await readPublishing();
  if (part === 'here') {
    const cards = p.works
      .map((w) =>
        cardOf({
          id: w.publication,
          signer: who(w.as, { collective: w.collective }),
          kind: `protected ${w.media === 'picture' ? 'picture' : w.media === 'video' ? 'film' : w.media === 'audio' ? 'recording' : 'text'}`,
          text: w.title,
          html: `<div class="k-small k-soft">${w.price.toLocaleString('en')} ${v.e(p.unit)} · ${v.e(w.words)}<br>${w.collective ? (w.toMembers ? 'Its key is sealed to every member: any member’s app can deliver it to a buyer.' : 'Its key was not yet sealed to the members.') : `Its key delivered to ${Object.keys(w.delivered).length} buyer${Object.keys(w.delivered).length === 1 ? '' : 's'}.`} Offer ${v.e(shortForm(v.formOf(w.offer)))}.</div>`,
          verified: true,
        }),
      )
      .join('');
    return v.herePane(cards);
  }
  if (part === 'sales') {
    // F386: each buyer's contests, shown beside the sale; "unknown" where the core cannot say, never "none".
    const sold = p.works.filter((w) => Object.keys(w.delivered).length);
    type Contested = { by: Record<string, Record<string, v.ContestsBeside>>; problems: string[] };
    const contested: Contested = sold.length ? await c.ask<Contested>('publishing sales contests').catch((e) => ({ by: {}, problems: [errorOf(e)] })) : { by: {}, problems: [] };
    const rows = sold
      .map((w) => `<div class="k-box"><h4>${v.e(w.title)}</h4><div class="k-list">${Object.entries(w.delivered).map(([buyer, act]) => `<div><span>${v.e(shown(buyer))} <span class="k-mono k-faint">${v.e(shortForm(v.idForm(buyer)))}</span></span><span class="k-r">key delivered · ${v.e(shortForm(v.formOf(act)))}</span></div>${w.collective ? '' : v.contestsBeside(contested.by[w.publication]?.[buyer])}`).join('')}</div></div>`)
      .join('');
    // Shared works (this round): the sales told to you as a party of a deal or a member of a collective, the buyer's contest beside each (decided with the MOR lead, 23 October 2026).
    type SharedSales = { sales: { kind: 'deal' | 'collective'; title: string; buyer: string; receipt: string; claim: string | null; beside: v.ContestsBeside }[]; problems: string[] };
    const sh = await c.ask<SharedSales>('publishing shared sales').catch((e) => ({ sales: [], problems: [errorOf(e)] }) as SharedSales);
    const shared = sh.sales
      .map((x) => `<div class="k-box"><h4>${v.e(x.title)} <span class="k-small k-soft">${x.kind === 'deal' ? 'a shared deal' : 'a collective'}</span></h4><div class="k-list"><div><span>Bought by ${v.e(shown(x.buyer))} <span class="k-mono k-faint">${v.e(shortForm(v.idForm(x.buyer)))}</span></span><span class="k-r">receipt ${v.e(shortForm(v.formOf(x.receipt)))}${x.claim ? ` · their claim ${v.e(shortForm(v.formOf(x.claim)))}` : ''}</span></div>${v.contestsBeside(x.beside)}</div></div>`)
      .join('');
    return v.salesPane(rows, [...contested.problems, ...sh.problems], shared);
  }
  if (part === 'post') return v.sharedPostPane({ who: actorsHtml(p), shares: sharesHtml(p, 'post') });
  if (part === 'sign') return v.inside(`<div id="e-signing-wrap">${await readSign(null, true)}</div>`);
  if (part === 'deals') {
    const cards = (p.deals ?? [])
      .map((d) =>
        cardOf({
          id: d.id,
          signer: who(state.acting ?? ''),
          kind: `a shared ${d.kind === 'work' ? 'file' : d.kind}`,
          text: d.title,
          html: `<div class="k-small k-soft">${d.shares.map(([id, n]) => `${v.e(shown(id))} ${(n / 10_000).toLocaleString('en')}%`).join(' · ')}${d.referral ? ` · ${(d.referral / 10_000).toLocaleString('en')}% off the top to a reposter` : ''}<br>Its own payee ${v.e(shortForm(v.idForm(d.payee)))} · its split service ${v.e(shown(d.service))}<br>${d.state === 'announced' ? 'Every person signed: announced.' : `Waiting: ${v.e(d.signed)}. Nothing is announced yet.`}</div>`,
          labels: d.state === 'waiting' ? [{ text: 'waiting for signatures', tone: 'warn' as const }] : [{ text: 'announced' }],
          verified: d.state === 'announced',
        }),
      )
      .join('');
    return v.dealsPane(cards);
  }
  part = 'file';
  // Keys of sales told of are delivered as the tile opens (as Dub does on its main screen).
  if (p.works.length)
    void c.ask<{ lines: Line[] }>('publishing deliver').then((r) => {
      if (r.lines.some((l) => /delivered/.test(l.text))) say('done', v.lines(r.lines));
    }).catch(() => undefined);
  return v.filePane({ who: actorsHtml(p), media, unit: p.unit, say: p.say, judged: v.JUDGED_SAY, shares: sharesHtml(p, MEDIA_KIND[media] ?? 'work') });
}

interface Point {
  key: string;
  label: string;
  relay: boolean;
}
function points(): Point[] {
  try {
    const xs = JSON.parse(sessionStorage.getItem('edubba:points') ?? 'null') as Point[] | null;
    if (xs) return xs;
  } catch {
    // nothing kept
  }
  return state.acting ? [{ key: state.acting, label: shown(state.acting), relay: false }] : [];
}
function keepPoints(xs: Point[]) {
  try {
    sessionStorage.setItem('edubba:points', JSON.stringify(xs));
  } catch {
    // nothing kept
  }
}
let showing = 'all';

async function vowsPart(): Promise<string> {
  const p = await readPublishing();
  if (part === 'new') return v.newVowPane({ who: actorsHtml(p), unit: p.unit, shares: sharesHtml(p, 'vow') });
  if (part === 'mine') {
    const cards = p.vows.map((x) => cardOf({ id: x.vow, signer: who(x.as, { collective: x.collective }), kind: 'vow', text: `${x.title}. ${x.price.toLocaleString('en')} ${p.unit}`, html: `<div class="k-small k-soft">${v.e(x.words)}</div>`, verified: true })).join('');
    return v.minePane(cards);
  }
  part = 'track';
  const ps = points();
  // The relays pointed at; with none, Edubba's own (its relays and homes in "This app").
  const pointed = ps.filter((x) => x.relay).map((x) => x.key);
  const relays = pointed.length ? pointed : [...new Set([...state.settings.relays, ...state.settings.homes.map((h) => h.hint)])];
  const problems: string[] = [];
  const cards: string[] = [];
  for (const x of ps.filter((y) => !y.relay)) {
    const r = await c.ask<v.VowSalesShown>('publishing vow sales', { identity: x.key, relays }).catch((e) => (problems.push(`${x.label}: ${errorOf(e)}`), null));
    if (!r) continue;
    problems.push(...r.problems);
    for (const vw of r.vows) {
      if (showing === 'all' || showing === 'vows')
        cards.push(cardOf({ id: vw.name, signer: who(vw.signer), kind: 'vow', text: vw.words[0] ?? '', labels: vw.void ? [{ text: 'its first act void (its signer’s change of keys): the name stands', tone: 'warn' }] : [], verified: !vw.void }));
      for (const s of vw.sales) {
        if (showing === 'vows' || (showing !== 'all' && showing !== 'sales' && s.state !== showing)) continue;
        const mine = vw.mine.includes(s.act) && s.state === 'pending';
        cards.push(
          cardOf(
            {
              id: s.act,
              signer: who(s.buyer),
              kind: s.state,
              text: s.promise ? `Not kept: ${s.promise}` : s.state === 'confirmed' ? 'It was kept.' : s.amount ? `Bought for ${s.amount.value.toLocaleString('en')}.` : 'Bought.',
              answers: { id: vw.name, signer: vw.signer },
              labels: [
                { text: `↳ answers ${shown(vw.signer)}’s vow · ${shortForm(v.formOf(vw.name))}` },
                // S7e (Q53): a sale whose answer rests on a rail answer not given here reads unknown, never pending or paid.
                ...v.saleUnknown(s),
                // F386: a contest in the purchase's form marks no sale; shown beside it, so it is not lost (and not counted with the vow's own form).
                ...(s.beside?.state === 'unknown' ? [{ text: `contests beside the purchase: unknown (${s.beside.why ?? 'not read'})`, tone: 'warn' as const }] : (s.beside?.contests ?? []).map((x) => ({ text: `contested beside the purchase, marking no sale${x.promise ? `: “${x.promise}”` : ''}`, tone: 'bad' as const }))),
              ],
              verified: s.state !== 'contested' && s.state !== 'unknown',
              alarm: s.state === 'contested' ? 'contested' : null,
            },
            mine ? { sale: { vow: vw.name, sale: s.act, buyer: s.buyer, seller: vw.signer, amount: s.amount } } : {},
          ),
        );
      }
    }
  }
  return v.trackPane(ps.map((x) => ({ key: x.key, label: x.label })), showing, cards.join(''), problems);
}

// ---------------------------------------------------------------- the identity panel

let adding = false;
const panelHtml = (inside = '') => v.panel(state, as, adding, inside);
function openIdentityPanel(inside?: string) {
  if (panelOpen()) redrawPanel(panelHtml(inside));
  else openPanel(app, panelHtml(inside));
}

async function useIdentity(id: string) {
  await busy('', async () => {
    await c.ask('acting as', { id });
    await c.ask('publishing act as', { id }).catch(() => undefined);
  });
}

async function identityMenu(button: HTMLElement, id: string) {
  const i = state.identities.find((x) => x.id === id);
  if (!i) return;
  popAt(button, v.idMenu(i), 'below', async (key) => {
    if (key === 'remove') return void redrawPanel(panelHtml(v.removeBox(i.name).replace('data-k-remove>', `data-k-remove data-id="${v.e(id)}">`)));
    closePanel();
    if (key === 'name') popup.show('Name', v.inside(v.nameForm(i)));
    else if (key === 'line') popup.show('Line and homes', v.inside(v.lineShown(i)));
    else if (key === 'renew') popup.show('New words from Kišib', v.inside(v.renewIdentityForm(id, i.name)));
    else if (key === 'words') {
      if (id !== state.acting) await useIdentity(id);
      const r = await busy('', () => c.ask<{ grouped: string; words: string[]; say: string[] }>('words'));
      if (id !== state.acting) state = await c.ask<State>('state');
      if (r) popup.show('Words', v.inside(v.wordsShown(r)));
    }
  });
}

async function addPart(k: string) {
  closePanel();
  if (k === 'kishib') {
    const body = popup.show('Use one from Kišib', '<p class="k-empty">Reading Kišib’s runner…</p>');
    return void (await runnerPart(body));
  }
  // With no homes named yet, where they are comes first (an identity is born at its homes).
  const where = state.settings.homes.length ? '' : `<section class="card"><h3>First: its homes and relays</h3>${v.settings(state)}</section>`;
  popup.show(k === 'make' ? 'Make an identity' : 'Bring an identity', v.inside(`${where}${k === 'make' ? v.newIdentity() : v.newIdentity().replace(/^[\s\S]*?(<section class="card"><h3>Bring)/, '$1')}`));
}

async function runnerPart(into: HTMLElement) {
  const r = await c.ask<Parameters<typeof v.runnerForm>[0]>('runner').catch((e) => ({ available: true, state: null, code: null, identities: [], problem: errorOf(e) }));
  if (into.isConnected) into.innerHTML = v.runnerForm(r);
}

// ---------------------------------------------------------------- answers looked for by themselves (H32), and To sign (H33)

let memberAwaits = false;
let gathering = false;
const pendingProposals = () => state.proposals.filter((p) => (p.kind === 'founding' ? !p.founded : !p.standing.enough));

async function gatherAll() {
  if (gathering || working || !c || !state) return;
  const waiting = pendingProposals();
  if (!waiting.length) return;
  gathering = true;
  try {
    let changed = false;
    for (const p of waiting) {
      const before = JSON.stringify(p.standing);
      try {
        const r = await c.ask<{ standing: State['proposals'][number]['standing'] }>('real gather', { act: p.act });
        if (JSON.stringify(r.standing) !== before) changed = true;
      } catch {
        // its relays did not answer: the next look tries again
      }
    }
    if (!changed || working) return;
    state = await c.ask<State>('state');
    if (tab !== 'collectives') return;
    // Only the column and the cards of proposals are drawn again: forms keep what is typed.
    for (const p of state.proposals) {
      const box = app.querySelector(`section.proposal-status[data-proposal="${CSS.escape(p.act)}"]`);
      if (box) box.outerHTML = v.proposalStatus(state, p);
      const entry = app.querySelector(`[data-k-col="p:${CSS.escape(p.act)}"] .k-k`);
      if (entry) entry.textContent = `${p.standing.signed.length} of ${p.signers.length} signed`;
    }
  } finally {
    gathering = false;
  }
}

/** To sign, read again; a share being shown, or its words being typed, is never drawn over. */
async function readMember() {
  const wrap = $('e-signing-wrap');
  if (!wrap) return;
  if ($('share-shown') || [...app.querySelectorAll<HTMLInputElement>('#e-signing form.share-back input')].some((i) => i.value)) return;
  const html = await readSign(part.startsWith('c:') ? part.slice(2) : null);
  if (wrap.isConnected) wrap.innerHTML = html;
}

/** A member's step, by Dub's names for them (`accept`, `decline`, `share`, `share-written`, `sharehand`, `lookshare`, `leave-read`, `leave-collective`). */
async function memberAction(b: HTMLElement): Promise<void> {
  const d = b.dataset;
  switch (d.action) {
    case 'accept': {
      if (!confirm('Sign it? Your signature is public, and binds this identity to exactly what you read here.')) return;
      const r = await busy('Signing, and answering the proposer…', () => ask<{ lines: { text: string }[] }>('member accept', { thread: d.thread }));
      if (r) {
        await readMember();
        say('done', `<strong>Signed.</strong><ul>${r.lines.map((l) => `<li>${v.e(l.text)}</li>`).join('')}</ul>`);
      }
      return;
    }
    case 'leave-read': {
      const r = await busy('Reading the collective’s agreement in force…', () => c.ask<{ lines: { text: string; tone?: string }[]; digest: string }>('member leave read', { thread: d.thread }));
      const box = app.querySelector<HTMLElement>(`#e-signing [data-leave="${CSS.escape(d.thread!)}"]`);
      if (r && box) box.innerHTML = dubLeaveRead(d.thread!, r as never);
      return;
    }
    case 'leave-collective': {
      if (!confirm('Resign from this collective? Your resignation is public, and needs nobody else.')) return;
      const r = await busy('Signing the resignation, and telling the founder…', () => ask<{ lines: { text: string }[] }>('member leave', { thread: d.thread, digest: d.digest }));
      if (r) {
        await readMember();
        say('done', `<strong>Resigned.</strong><ul>${r.lines.map((l) => `<li>${v.e(l.text)}</li>`).join('')}</ul>`);
      }
      return;
    }
    case 'decline': {
      const why = prompt('Decline it. Your reason, if you like (sent to the proposer, sealed):');
      if (why === null) return;
      const r = await busy('Declining…', () => ask<{ lines: { text: string }[] }>('member decline', { thread: d.thread, why }));
      if (r) {
        await readMember();
        say('done', r.lines.map((l) => v.e(l.text)).join(' '));
      }
      return;
    }
    case 'share': {
      const r = await busy('Opening the share with its one-time key, and checking it against the dealing…', () => c.ask<ShareShown>('member share', { thread: d.thread }));
      // Shown once: on the page now and nowhere else; a reload asks for three of its words instead.
      if (r) {
        const box = app.querySelector<HTMLElement>(`#e-signing .proposal[data-thread="${CSS.escape(r.thread)}"]`);
        if (box) box.outerHTML = v.memberShare(r);
      }
      return;
    }
    case 'share-written': {
      const box = $('share-shown');
      if (box) box.outerHTML = `<div class="proposal" data-thread="${v.e(d.thread!)}">${shareTypeBack(d.thread!, (d.positions ?? '').split(',').map(Number))}</div>`;
      return;
    }
    case 'sharehand': {
      if (!confirm('The share came by hand, shown on the founder’s screen? The one-time key is destroyed: a share sealed to it could never be opened.')) return;
      const r = await busy('Destroying the one-time key…', () => c.ask<{ lines: { text: string }[] }>('member sharehand', { thread: d.thread }));
      if (r) {
        await readMember();
        say('done', r.lines.map((l) => v.e(l.text)).join(' '));
      }
      return;
    }
    case 'lookshare':
      await busy('Looking for the share…', readMember);
      return;
  }
}

// ---------------------------------------------------------------- the folder picker (H31), for a test collective's release folder

async function picker(target: string, path?: string) {
  try {
    const l = await c.ask<Listing>('folders', path ? { path } : {});
    if (popup.open) popup.replace(v.inside(v.folderPicker(l, target)));
    else popup.show('Choose a folder', v.inside(v.folderPicker(l, target)));
  } catch (err) {
    fail(err);
  }
}

async function refresh() {
  state = await c.ask<State>('state');
  await draw();
}

async function afterDone(d: Done | undefined) {
  if (!d) return;
  await refresh();
  say('done', v.done(d));
}

/** Bytes as base64, in the page (no Buffer here). */
function toBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}

const reviewIn = (id: string, r: Review) => {
  const box = $(id) ?? (popup.open ? popup.replace(`<div id="${id}" class="e-in"></div>`)?.querySelector<HTMLElement>(`#${id}`) : null);
  if (box) {
    box.innerHTML = `<div class="colroot">${reading(r.reading, r)}</div>`;
    box.scrollIntoView({ block: 'start' });
  }
};

// ---------------------------------------------------------------- clicks

attachColumn(app, async (key) => {
  part = key;
  sub = '';
  say('', '');
  keepAt();
  await fill();
});

app.addEventListener('change', async (ev) => {
  const el = ev.target as HTMLInputElement;
  if (el.closest('[data-grid-form]')) {
    gridEvent(el);
    return;
  }
  const form = el.closest('form');
  if (form && (form.id === 'real-found' || form.id === 'real-change') && (el.name === 'member' || el.name === 'typed' || el.name === 'founder')) return void (await syncGrid(form.id));
  if (el.dataset.action !== 'real-byhand') return;
  try {
    await c.ask('real by hand', { act: el.dataset.act, member: el.dataset.member, on: el.checked });
    state = await c.ask<State>('state');
  } catch (err) {
    el.checked = !el.checked;
    fail(err);
  }
});

app.addEventListener('click', async (ev) => {
  const t = ev.target as HTMLElement;
  // The collective client's page answers its own buttons, the folder picker aside.
  const b = t.closest<HTMLElement>('[data-action]');
  if (t.closest('[data-collective-root]') && b?.dataset.action !== 'pick-folder') return;
  if (b && b.closest('#e-signing')) return void (await memberAction(b));
  const tile = t.closest<HTMLElement>('[data-k-tile]');
  if (tile) {
    say('', '');
    tab = tile.dataset.kTile as v.Tab;
    part = v.firstPart(tab, state);
    sub = '';
    return void (await draw());
  }
  const tb = t.closest<HTMLElement>('[data-tab]');
  if (tb) {
    say('', '');
    tab = tb.dataset.tab as v.Tab;
    part = v.firstPart(tab, state);
    sub = '';
    return void (await draw());
  }
  const sb = t.closest<HTMLElement>('[data-sub]');
  if (sb) {
    // The tab already open: nothing to redraw (a redraw would only race what is being typed).
    if (sb.classList.contains('k-on')) return;
    say('', '');
    sub = sb.dataset.sub!;
    keepAt();
    return void (await fill());
  }
  if (t.closest('[data-k-open="identity"]')) {
    adding = false;
    // What was said gives way to the panel, as to the pop-up.
    say('', '');
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
    const owner = use.dataset.kUnder;
    closePanel();
    if (owner) {
      // A collective under the identity: acting as it is the same gesture as switching (decided).
      if (owner !== state.acting) await useIdentity(owner);
      const cx = (state.under[owner] ?? []).find((x) => x.id === id);
      if (as?.id === id || !cx) {
        as = null;
        await c.ask('publishing act as', { id: owner }).catch(() => undefined);
      } else {
        as = { id, name: cx.name };
        const r = await c.ask<{ lines: Line[] }>('publishing act as', { id }).catch((e) => ({ lines: [{ text: `Publishing cannot act as it: ${errorOf(e)}`, tone: 'warn' as const }] }));
        if (r.lines.some((l) => l.tone === 'warn')) say('', v.lines(r.lines));
        if (tab !== 'publishing' && tab !== 'vows') [tab, part, sub] = ['collectives', `c:${id}`, 'act'];
      }
      state = await c.ask<State>('state');
      return void (await draw());
    }
    as = null;
    await useIdentity(id);
    return void (await show(await c.ask<State>('state')));
  }
  const menu = t.closest<HTMLElement>('[data-k-idmenu]');
  if (menu) return void (await identityMenu(menu, menu.dataset.kIdmenu!));
  if (t.closest('[data-k-remove-no]')) return void redrawPanel(panelHtml());
  const yes = t.closest('[data-k-remove-yes]');
  if (yes) {
    const id = yes.closest<HTMLElement>('[data-k-remove]')?.dataset.id ?? '';
    closePanel();
    const r = await busy('Removing…', () => c.ask<{ lines: Line[] }>('forget', { id }));
    if (r) {
      await show(await c.ask<State>('state'));
      say('done', v.lines(r.lines));
    }
    return;
  }
  const unpoint = t.closest<HTMLElement>('[data-unpoint]');
  if (unpoint) {
    keepPoints(points().filter((x) => x.key !== unpoint.dataset.unpoint));
    return void (await fill());
  }
  const sh = t.closest<HTMLElement>('[data-show]');
  if (sh) {
    showing = sh.dataset.show!;
    return void (await fill());
  }
  const md = t.closest<HTMLElement>('[data-media]');
  if (md && !md.matches('form')) {
    if (media === md.dataset.media) return;
    media = md.dataset.media!;
    pubReview = null;
    return void (await fill());
  }
  const actor = t.closest<HTMLElement>('[data-actor]');
  if (actor) {
    const r = await busy('Choosing who acts…', () => c.ask<{ lines: Line[] }>('publishing act as', { id: actor.dataset.actor }));
    if (r) {
      pubReview = null;
      const isMe = actor.dataset.actor === state.acting;
      as = isMe ? null : { id: actor.dataset.actor!, name: nameOf(actor.dataset.actor!) };
      await draw();
    }
    return;
  }
  if (!b) return;
  const d = b.dataset;
  const agent = part.startsWith('agent:') ? part.slice(6) : undefined;
  switch (d.action) {
    case 'home-tiles':
      tab = null;
      return void (await draw());
    case 'status-close':
      return say('', '');
    case 'alarms-seen': {
      try {
        const seen = JSON.parse(sessionStorage.getItem('edubba:alarms-seen') ?? '[]') as string[];
        sessionStorage.setItem('edubba:alarms-seen', JSON.stringify([...seen, ...(JSON.parse(d.keys ?? '[]') as string[])]));
      } catch {
        // nothing kept
      }
      return drawAlarms();
    }
    case 'this-app': {
      closePanel();
      popup.show('This app', v.thisApp(state, v.settings(state), web ? '' : v.browsers(state)));
      const root = app.querySelector<HTMLElement>('.k-modal [data-collective-root]');
      if (root) {
        collectiveMount = mount(root, { ask: (op, args) => c.ask(`collective ${op}`, args ?? {}), fail: () => false, only: () => undefined, done: async () => undefined });
        await collectiveMount.refresh().catch(fail);
      }
      return;
    }
    case 'copy': {
      const was = b.textContent;
      const ok = await copy(d.text ?? d.id ?? '');
      b.textContent = ok ? 'Copied' : 'Select it and copy it';
      setTimeout(() => (b.textContent = was), 2000);
      return;
    }
    case 'contact-add-from':
      popup.replace(v.inside(`<form id="contact-add" class="row"><input name="id" type="hidden" value="${v.e(d.id ?? '')}"><input name="name" type="text" class="pet" placeholder="Its name here" required><button type="submit" class="primary">Add</button></form>`));
      return;
    case 'runner-pair': {
      const r = await busy('', () => c.ask<{ code: string }>('runner pair'));
      if (r) await runnerPart(b.closest<HTMLElement>('#first-part, .k-mbody')!);
      return;
    }
    case 'runner-look':
      return void (await runnerPart(b.closest<HTMLElement>('#first-part, .k-mbody')!));
    case 'runner-take': {
      const r = await busy('Reading it from its homes…', () => c.ask<{ lines: Line[] }>('runner take', { id: d.id }));
      if (r) {
        popup.close();
        await show(await c.ask<State>('state'));
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'constitution': {
      const id = part.slice(2);
      const r = await busy('Reading its agreement in force…', () => c.ask<Constitution>('collective constitution', { collective: id }));
      if (r) popup.show('Its constitution, in plain words', v.inside(v.constitution(nameOf(id) ?? '', r).replace(/^<button class="close"[^>]*>Close<\/button>/, '')));
      return;
    }
    case 'dialog-close':
    case 'modal-close':
    case 'rely-cancel':
      return popup.close();
    // An agent.
    case 'machine-on':
      return void (await busy('', async () => {
        await c.ask('machine on', { agent, on: d.on === 'true' });
        await refresh();
      }));
    case 'machine-look': {
      const r = await busy('Looking at what it received…', () => c.ask<{ answered: number; stopped: string | null; problems: string[] }>('machine look', { agent }));
      if (r) {
        await refresh();
        say(r.stopped || r.problems.length ? 'warn' : 'done', `${r.answered === 1 ? 'One answer sent' : `${r.answered} answers sent`}.${[r.stopped ?? '', ...r.problems].filter(Boolean).map((p) => `<br>${v.e(p)}`).join('')}`);
      }
      return;
    }
    case 'machine-pick':
      return void (await afterDone(await busy('Signing your pick; it is answering…', () => c.ask<Done>('machine pick', { agent, key: d.key }))));
    case 'machine-picks': {
      const keys = [...app.querySelectorAll<HTMLInputElement>('input[name=pick-select]:checked')].map((x) => x.value);
      const box = $('e-picks-shown');
      if (!keys.length) return say('warn', 'Select the acts to pick first.', box);
      const r = await busy('Reading the picks…', () => c.ask<{ lines: string[]; digest: string }>('machine picks', { agent, keys }), box);
      if (r && box) box.innerHTML = v.picksShown(keys, r);
      return;
    }
    case 'machine-picks-cancel':
      return void ($('e-picks-shown') && ($('e-picks-shown')!.innerHTML = ''));
    case 'machine-pick-many':
      return void (await afterDone(await busy('Signing your picks; it answers each…', () => c.ask<Done>('machine pick many', { agent, keys: JSON.parse(d.keys!), digest: d.digest }))));
    case 'machine-retry':
      await busy('Trying again…', () => c.ask('machine retry', { agent, act: d.act }));
      return void (await refresh());
    case 'nudge-open':
      return void ($('nudge-here') && ($('nudge-here')!.innerHTML = v.nudgeForm()));
    case 'nudge-close':
      return void ($('nudge-here') && ($('nudge-here')!.innerHTML = ''));
    case 'machine-publish': {
      const r = await busy('Signing and publishing its terms…', () => c.ask<Done>('machine publish', { agent: d.agent, owner: d.owner, digest: d.digest, own: d.own === 'true' }));
      if (r) {
        part = `agent:${d.agent}`;
        sub = 'terms';
        await afterDone(r);
      }
      return;
    }
    case 'add-cancel':
      part = state.agents[0] ? `agent:${state.agents[0].id}` : 'add';
      return void (await fill());
    case 'agent-name':
      return void (await afterDone(await busy('Signing and publishing its display name…', () => c.ask<Done>('agent name', { agent }))));
    case 'agent-view': {
      const r = await busy('Reading what it reads…', () => c.ask<AgentView>('agent view', { agent }));
      if (r) popup.show(`MOR as seen by ${shown(agent!)}`, v.inside(v.agentView(shown(agent!), r).replace(/^<div class="row"><button data-action="agent-back">[^<]*<\/button><\/div>/, '')));
      return;
    }
    case 'agent-back':
      return popup.close();
    case 'agent-unfollow': {
      await busy('Unfollowing…', () => c.ask('agent unfollow', { agent, id: d.id }));
      const r = await c.ask<AgentView>('agent view', { agent }).catch(() => null);
      if (r) popup.replace(v.inside(v.agentView(shown(agent!), r).replace(/^<div class="row"><button data-action="agent-back">[^<]*<\/button><\/div>/, '')));
      return;
    }
    case 'note-retire': {
      const why = prompt('Why retire this note? (optional, kept with it)') ?? '';
      const r = await busy('Signing a later act that marks the note dropped…', () => c.ask<Done>('agent note retire', { agent, note: d.note, why }));
      if (r) {
        await fill();
        say('done', v.done(r));
      }
      return;
    }
    // The diary, behind a public act (decided): shown, signed with the key checked (H80), opened once a home accepted it.
    case 'diary-ask': {
      const r = await busy('', () => c.ask<Parameters<typeof v.diaryAct>[0]>('agent diary act', { agent }), $('e-diary'));
      const box = $('e-diary');
      if (r && box) box.innerHTML = v.diaryAct(r, shown(agent!));
      return;
    }
    case 'diary-sign': {
      const box = $('e-diary');
      const r = await busy('Signing the act, publishing it, and waiting for your homes…', () => ask<{ act: string; accepted: string[]; entries: { day: string; striking: string; reflection: string; why: string }[] }>('agent diary', { agent, digest: d.digest }), box);
      if (r && box) box.innerHTML = v.diaryOpen(r);
      return;
    }
    case 'diary-close':
      return void ($('e-diary') && ($('e-diary')!.innerHTML = v.diaryShut()));
    case 'grant-sign': {
      const r = await busy('Signing the grant; asking your agent whether it accepts…', () => c.ask<Done>('agent grant publish', { agent, digest: d.digest }));
      if (r) {
        await fill();
        say(r.title.includes('accepted') ? 'done' : 'warn', v.done(r));
      }
      return;
    }
    case 'grant-cancel':
      return void ($('e-grant-shown') && ($('e-grant-shown')!.innerHTML = ''));
    case 'grant-revoke': {
      if (!confirm('Revoke this grant? Its key backs nothing signed after the revocation.')) return;
      const r = await busy('Signing the revocation…', () => c.ask<Done>('agent grant revoke', { agent, grant: d.grant }));
      if (r) {
        await fill();
        say('done', v.done(r));
      }
      return;
    }
    case 'grant-ask': {
      const r = await busy('Asking your agent whether it accepts…', () => c.ask<Done>('agent grant ask', { agent, grant: d.grant }));
      if (r) {
        await fill();
        say('done', v.done(r));
      }
      return;
    }
    // A collective.
    case 'pick-folder':
      return void (await picker(d.target!));
    case 'folder-open':
      return void (await picker(b.closest<HTMLElement>('.picker')!.dataset.target!, d.path));
    case 'folder-use': {
      const target = b.closest<HTMLElement>('.picker')!.dataset.target!;
      const el = $<HTMLElement>(target);
      const input = (el instanceof HTMLInputElement ? el : ((el as HTMLFormElement | null)?.elements.namedItem('folder') ?? null)) as HTMLInputElement | null;
      if (input) input.value = d.path!;
      return popup.close();
    }
    case 'real-lists': {
      const r = await busy('Reading the follow lists sealed to your identities…', () => c.ask<{ read: number; problems: string[] }>('real lists'));
      if (r) {
        await refresh();
        say(r.problems.length ? 'warn' : 'done', `${r.read === 1 ? 'One follow list read' : `${r.read} follow lists read`}.${r.problems.map((p) => `<br>${v.e(p)}`).join('')}`);
      }
      return;
    }
    case 'contact-remove':
      if (await busy('Removing…', () => c.ask('real contact remove', { id: d.id }))) await refresh();
      return;
    case 'pay-member': {
      const f = $<HTMLFormElement>('pay-member');
      const to = f?.elements.namedItem('to') as HTMLInputElement | null;
      if (to) to.value = d.member ?? '';
      f?.querySelector<HTMLInputElement>('input[name=value]')?.focus();
      return;
    }
    case 'real-register-resignation': {
      const r = await busy('Drawing the collective’s line, registering the resignation…', () => c.ask<Done>('real register resignation', { collective: d.collective, act: d.act }));
      if (r) {
        await fill();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'real-keep': {
      const r = await busy('Recording what arrived, its signers’ chains checked first…', () => c.ask<Done>('real keep', { collective: d.collective, keeper: d.keeper }));
      if (r) {
        await fill();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'real-money-record': {
      const r = await busy('Recording it on the collective’s line, and pointing its payee pointer at the service…', () => c.ask<Done>('real money record', { act: d.act }));
      if (r) {
        await refresh();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'real-gather': {
      const r = await busy('Reading the answers in your inbox…', () => c.ask<{ problems: string[] }>('real gather', { act: d.act }));
      if (r) {
        await refresh();
        if (r.problems.length) say('warn', r.problems.map(v.e).join('<br>'));
      }
      return;
    }
    case 'real-found': {
      const read = $<HTMLInputElement>(`real-found-read-${d.act!.slice(0, 12)}`)?.checked === true;
      if (!read) return say('warn', 'Read what this device will hold while founding (F337), and tick it, first. Nothing was dealt.');
      const r = await busy('Dealing the chain key, founding the collective, sealing each share to its one-time key…', () => c.ask<Done & { show: string[] }>('real found', { act: d.act, read: true }));
      if (r) {
        part = `c:${r.acts[0]}`;
        sub = 'members';
        await refresh();
        say('done', v.done(r));
      }
      return;
    }
    case 'real-show-share': {
      const r = await busy('Opening the share, once…', () => c.ask<ShareHere>('real show share', { collective: d.collective, member: d.member }));
      const box = $('e-shares-here');
      if (r && box) {
        box.innerHTML = v.shareHere(d.collective!, r, shown(d.member!));
        box.scrollIntoView({ block: 'start' });
      }
      return;
    }
    case 'real-share-written':
      return void ($('e-shares-here') && ($('e-shares-here')!.innerHTML = v.shareBackHere(d.collective!, d.member!, (d.positions ?? '').split(',').map(Number))));
    case 'real-release-standing': {
      const r = await busy('Checking the release as a fresh verifier…', () => c.ask<{ ok: boolean; signers: string[]; problems: string[] }>('real release standing', { act: d.act }));
      if (r) say(r.ok ? 'done' : 'warn', r.ok ? `It counts as the collective’s release, signed by ${r.signers.length} members.` : `It does not count yet: ${r.problems.map(v.e).join(' ')}`);
      return;
    }
    case 'pub-deals-gather': {
      const r = await busy('Looking for each person’s signatures…', () => ask<{ lines: Line[] }>('publishing deals gather'));
      if (r) {
        await fill();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'member-look':
      await busy('Reading the inbox for proposals and shares…', readMember);
      return;
    // Reviews: signed only by this button, with the digest shown.
    case 'confirm': {
      if (pubReview && (tab === 'publishing' || tab === 'vows')) {
        const r = pubReview;
        const done = await busy('Sealing, signing and publishing…', () => ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest }));
        if (done) {
          pubReview = null;
          // A shared deal waits for every person's signature: shown under Shared deals, in Publishing.
          if (/sent to each person/.test(done.title)) [tab, part] = ['publishing', 'deals'];
          else part = tab === 'vows' ? 'mine' : 'here';
          await afterDone(done);
        }
        return;
      }
      if (realReview) {
        const r = realReview;
        const done = await busy('Signing and sending…', () => ask<Done>('real confirm', { plan: r.plan, digest: r.digest }));
        if (done) {
          realReview = null;
          if (part === 'found') part = `p:${done.acts[0]}`;
          await afterDone(done);
        }
        return;
      }
      if (!postReview) return;
      const r = postReview;
      const done = await busy('Signing and sending…', () => c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest }));
      if (done) {
        postReview = null;
        popup.close();
        await fill();
        say('done', v.done(done));
      }
      return;
    }
    case 'cancel':
    case 'dismiss':
      if (realReview) void c.ask('real cancel', { plan: realReview.plan }).catch(() => undefined);
      if (postReview) void c.ask('collective cancel', { plan: postReview.plan }).catch(() => undefined);
      realReview = postReview = pubReview = null;
      for (const id of ['e-real-review', 'e-post-review', 'e-pub-review', 'e-vow-review', 'e-correct-review']) if ($(id)) $(id)!.innerHTML = '';
      return say('', 'Nothing was signed.');
    case 'pub-deliver': {
      const r = await busy('Looking for sales and delivering keys…', () => c.ask<{ lines: Line[] }>('publishing deliver'));
      if (r) {
        await fill();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'code': {
      const r = await busy('Making a code…', () => c.ask<{ code: string }>('code'));
      if (r && $('code')) $('code')!.innerHTML = v.note('', `Code for another browser, valid ten minutes, once: <span class="code">${v.e(r.code)}</span>`);
      return;
    }
    case 'unpair':
      if (!confirm(d.you === 'true' ? 'Unpair this browser? It will need a new link from the Edubba app.' : 'Unpair that browser?')) return;
      try {
        await c.ask('unpair', { key: d.key });
        if (d.you === 'true') {
          await forgetKey();
          await start();
        } else popup.close();
      } catch (err) {
        fail(err);
      }
      return;
  }
});

// ---------------------------------------------------------------- forms

const words = (s: FormDataEntryValue | null) => (typeof s === 'string' ? s.trim() : '');
const linesOf = (s: FormDataEntryValue | null) => words(s).split(/\s+/).filter(Boolean);

// Typing again in a form sent: what is typed is kept again across a redraw.
app.addEventListener('input', (ev) => {
  if (sentForm && (ev.target as HTMLInputElement).form?.getAttribute('id') === sentForm) sentForm = null;
});

app.addEventListener('submit', async (ev) => {
  const form = ev.target as HTMLFormElement;
  // The collective client's page answers its own forms.
  if (form.closest('[data-collective-root]')) return;
  ev.preventDefault();
  const d = new FormData(form);
  const agent = part.startsWith('agent:') ? part.slice(6) : undefined;
  // Not `form.id`: a form's fields shadow its properties (the bring forms have a field named "id").
  const fid = form.getAttribute('id');
  sentForm = fid;
  if (fid === 'pair') {
    try {
      await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: 'this browser' });
      await start();
    } catch (err) {
      if ($('pair-status')) $('pair-status')!.innerHTML = note('error', v.e(errorOf(err)));
    }
    return;
  }
  if (form.classList.contains('share-back') && form.closest('#e-signing')) {
    const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
    const r = await busy('Checking the words, then destroying the one-time key…', () => c.ask<{ lines: { text: string }[] }>('member shareback', { thread: form.dataset.thread, typed }));
    if (r) {
      form.reset();
      await readMember();
      say('done', `<strong>The share is written down.</strong> ${r.lines.map((l) => v.e(l.text)).join(' ')}`);
    }
    return;
  }
  switch (fid) {
    // The identity panel.
    case 'new-identity': {
      const r = await busy('Making the identity at its homes…', () => c.ask<Done>('identity', { name: words(d.get('name')) }));
      if (r) {
        popup.close();
        await useIdentity(r.acts[0]);
        await afterDone(r);
      }
      return;
    }
    case 'bring-identity': {
      const r = await busy('Reading the identity from its homes, and checking the words…', () => c.ask<Done>('bring', { name: words(d.get('name')), id: words(d.get('id')), words: words(d.get('words')), address: words(d.get('address')) }), form);
      if (r) {
        popup.close();
        await useIdentity(r.acts[0]);
        await afterDone(r);
      }
      return;
    }
    case 'rename': {
      const r = await busy('', () => c.ask('rename', { id: form.dataset.identity, name: words(d.get('name')) }), form);
      if (r) {
        popup.close();
        await refresh();
      }
      return;
    }
    case 'desk-settings': {
      const r = await busy('Asking each home who runs it…', () => c.ask('settings', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: words(d.get('via')).split('\n').map((s) => s.trim()).filter(Boolean), drafts: '' }), form);
      if (r) {
        state = await c.ask<State>('state');
        say('done', 'Settings saved.', form);
      }
      return;
    }
    // After Kišib: the new signing key's words, for an identity held here or a real collective (`src/kishib.ts`).
    case 'identity-renew':
    case 'real-renew': {
      const id = fid === 'identity-renew' ? form.dataset.identity! : form.dataset.collective!;
      const r = await busy('Reading it from its homes, and checking the words…', () => (fid === 'identity-renew' ? c.ask<Done>('identity renew', { identity: id, words: words(d.get('words')) }) : c.ask<Done>('real collective renew', { collective: id, words: words(d.get('words')) })), form);
      form.reset();
      if (r) {
        spentNow = spentNow.filter((x) => x.id !== id);
        popup.close();
        await afterDone(r);
      }
      return;
    }
    // Agents.
    case 'agent-add': {
      const own = d.get('own') === 'on';
      const r = await busy('Making its identity at its homes, and publishing its name…', async () => {
        if (d.has('homes')) await c.ask('settings', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: [], drafts: '' });
        return c.ask<Done & { agent: string; owner: string; terms: { lines: string[]; digest: string } }>('agent add', { name: words(d.get('name')), agent: words(d.get('agent')), owner: words(d.get('owner')), ownerName: words(d.get('ownerName')), key: words(d.get('key')), own });
      }, form);
      if (r) {
        // The key leaves the page: the field is emptied, and the page keeps nothing of it.
        form.reset();
        form.querySelectorAll('input,select,button').forEach((x) => ((x as HTMLInputElement).disabled = true));
        say('done', v.done(r));
        if ($('e-terms')) $('e-terms')!.innerHTML = v.termsShown(r.agent, r.owner, own, r.terms);
        $('e-terms')?.scrollIntoView({ block: 'start' });
      }
      return;
    }
    case 'shared-key': {
      const r = await busy('Keeping the key…', () => c.ask('shared key', { key: words(d.get('key')) }), form);
      form.reset();
      if (r) await afterDone({ title: 'The shared key is in place', lines: [], acts: [] });
      return;
    }
    case 'agent-prompt': {
      const r = await busy('Signing your prompt, sealing it to the agent; it is answering…', () => c.ask<Done>('agent prompt', { agent, text: String(d.get('text') ?? '') }));
      if (r) {
        form.reset();
        await refresh();
      }
      return;
    }
    case 'agent-follow': {
      const r = await busy('Following…', () => c.ask('agent follow', { agent, id: words(d.get('who')), name: words(d.get('name')) }));
      if (r) {
        const view = await c.ask<AgentView>('agent view', { agent });
        popup.replace(v.inside(v.agentView(shown(agent!), view).replace(/^<div class="row"><button data-action="agent-back">[^<]*<\/button><\/div>/, '')));
      }
      return;
    }
    case 'agent-key': {
      const own = d.get('own') === 'own';
      const r = await busy('Saving its key…', () => c.ask<{ last4: string | null }>('agent key', { agent, own, key: words(d.get('key')) }));
      form.reset();
      if (r) {
        await refresh();
        say('done', own ? `It uses a key of its own${r.last4 ? `, …${v.e(r.last4)}` : ''}.` : 'It uses the shared key.');
      }
      return;
    }
    case 'machine-cap': {
      const r = await busy('Saving the cap…', () => c.ask('machine cap', { agent, callsPerDay: Number(words(d.get('callsPerDay'))), maxChars: Number(words(d.get('maxChars'))) }));
      if (r) await refresh();
      return;
    }
    case 'machine-nudge':
      return void (await afterDone(await busy('Signing your nudge; it is choosing…', () => c.ask<Done>('machine nudge', { agent, count: Number(words(d.get('count'))), context: words(d.get('context')) }))));
    case 'grant-form': {
      const until = words(d.get('until'));
      const r = await busy('Reading the grant back…', () => c.ask<{ lines: string[]; digest: string }>('agent grant preview', { agent, kinds: d.getAll('kinds').map(String), cap: words(d.get('cap')) || null, clock: words(d.get('clock')), until: until ? Math.floor(new Date(until).getTime() / 1000) : 0 }), form);
      if (r && $('e-grant-shown')) $('e-grant-shown')!.innerHTML = v.grantShown(r);
      return;
    }
    // The act menu.
    case 'rely-sign': {
      const r = await busy('Signing the witness act…', () => ask<{ id: string }>('witness', { identity: form.dataset.identity, act: form.dataset.act, shown: WITNESS_EXPLANATION, typed: words(d.get('typed')) }), form);
      if (r) {
        popup.close();
        say('done', `<strong>Witness act signed and sent.</strong> Act <code>${v.e(shortForm(v.formOf(r.id)))}</code>.`);
      }
      return;
    }
    case 'anchor-any': {
      const service = words(d.get('service'));
      const r = await busy('Reading the service’s standing offers…', () => c.ask<{ offers: { act: string; unit: string; tiers: { tier: number; words: string }[]; words: string | null }[] }>('anchor offers', { service }), form);
      const box = $('e-anchor-any');
      if (r && box)
        box.innerHTML = r.offers.length
          ? r.offers.map((o) => `<form class="anchor-pick card" data-act="${v.e(form.dataset.act!)}" data-service="${v.e(service)}" data-offer="${v.e(o.act)}">${o.words ? `<p class="small">${v.e(o.words)}</p>` : ''}${o.tiers.map((t, i) => `<label class="check"><input type="radio" name="tier" value="${t.tier}"${i === 0 ? ' checked' : ''}> ${v.e(t.words)}</label>`).join('')}<div class="row"><button type="submit" class="primary">Prepare the payment for Damgar</button></div></form>`).join('')
          : v.note('warn', 'No standing offer under the anchoring cMIP was found for that identity.');
      return;
    }
    case 'correct-any': {
      if (form.dataset.collective) {
        const r = await busy('Preparing the correction, and reading it back…', () => c.ask<Review>('collective prepare', { kind: 'post', collective: form.dataset.collective, text: String(d.get('text') ?? ''), corrects: form.dataset.act }), form);
        if (r) {
          postReview = r;
          reviewIn('e-correct-review', r);
        }
        return;
      }
      const r = await busy('Signing the correction…', () => ask<{ lines: Line[] }>('correct', { id: form.dataset.act, text: String(d.get('text') ?? '') }), form);
      if (r) {
        popup.close();
        await fill();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'contact-add': {
      const r = await busy('Adding…', () => c.ask('real contact add', { id: words(d.get('id')), name: words(d.get('name')) }), form);
      if (!r) return;
      state = await c.ask<State>('state');
      if (popup.open && form.closest('.k-modal')) return void (popup.close(), say('done', 'Added to your contacts.'));
      // A founding form being filled is kept: only the contacts are drawn again.
      const picked = new Set([...app.querySelectorAll<HTMLInputElement>('input[name=member]:checked')].map((x) => x.value));
      const values = new Map([...app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#real-found input:not([type=checkbox]),#real-found textarea,#real-found select')].map((x) => [x.name, x.value]));
      await fill();
      for (const x of app.querySelectorAll<HTMLInputElement>('input[name=member]')) if (picked.has(x.value)) x.checked = true;
      for (const [n, val] of values) {
        const x = $<HTMLFormElement>('real-found')?.elements.namedItem(n) as HTMLInputElement | null;
        if (x) x.value = val;
      }
      return;
    }
    // A collective.
    case 'collective-post': {
      const id = part.slice(2);
      const col = state.collectives.find((x) => x.id === id);
      if (col?.real) {
        const r = await busy('Signing it as the collective, with your own key for it…', () => ask<{ post: string; lines: Line[] }>('real collective post', { identity: state.acting, collective: id, text: String(d.get('text') ?? '') }));
        if (r) {
          await fill();
          say('done', v.lines(r.lines as Line[]));
        }
        return;
      }
      const file = d.get('jpeg');
      const jpeg = file instanceof File && file.size ? toBase64(new Uint8Array(await file.arrayBuffer())) : undefined;
      const r = await busy('Preparing, and reading it back…', () => c.ask<Review>('collective prepare', { kind: 'post', collective: id, text: String(d.get('text') ?? ''), jpeg }));
      if (r) {
        postReview = r;
        reviewIn('e-post-review', r);
      }
      return;
    }
    case 'bring-collective': {
      const r = await busy('Reading the collective from its homes and relays…', () => c.ask<Done>('collective bring', { id: words(d.get('id')), name: words(d.get('name')) }), form);
      if (r) {
        part = `c:${r.acts[0]}`;
        await afterDone(r);
      }
      return;
    }
    case 'pay-member': {
      const r = await busy('Sealing the draft to the identity…', () => c.ask<Done>('money pay', { identity: form.dataset.identity, to: words(d.get('to')), value: words(d.get('value')), unit: words(d.get('unit')), whatFor: String(d.get('whatFor') ?? '') }), form);
      if (r) say('done', v.lines(r.lines), form);
      return;
    }
    case 'anchor-offers': {
      const service = words(d.get('service'));
      const act = String(d.get('act') ?? '');
      const r = await busy('Reading the service’s standing offer…', () => c.ask<Parameters<typeof v.anchorOffers>[3]>('money offers', { service }), form);
      if (r && $('e-anchor-offer')) $('e-anchor-offer')!.innerHTML = v.anchorOffers(form.dataset.collective!, act, service, r, units ?? []);
      return;
    }
    case 'real-money': {
      const shares = Object.fromEntries([...form.querySelectorAll<HTMLInputElement>('input[name=share]')].map((x) => [x.dataset.member!, Number(x.value)]));
      const keepers = words(d.get('keepers')).split(/\n+/).map((x) => x.trim()).filter(Boolean);
      const r = await busy('Making it, and reading it back…', () => c.ask<Review>('real money prepare', { collective: form.dataset.collective, shares, referral: Number(d.get('referral') ?? 0), service: words(d.get('service')), serviceKey: words(d.get('serviceKey')), keepers, keepersNeeded: Number(d.get('keepersNeeded') ?? 1) }));
      if (r) {
        realReview = { plan: r.plan, digest: r.digest };
        reviewIn('e-real-review', r);
      }
      return;
    }
    case 'real-found':
    case 'real-change': {
      const members = [...form.querySelectorAll<HTMLInputElement>('input[name=member]:checked')].map((x) => x.value);
      const typed = words(d.get('typed')).split(/\n+/).map((x) => x.trim()).filter(Boolean);
      const r = await busy('Making it, and reading it back…', () =>
        fid === 'real-found'
          ? c.ask<Review>('real found prepare', { name: words(d.get('name')), founder: words(d.get('founder')), members: [...members, ...typed], grid: grids.get('real-found'), words: words(d.get('words')) })
          : c.ask<Review>('real change prepare', { collective: form.dataset.collective, members: [...members, ...typed], grid: grids.get('real-change') }),
      );
      if (r) {
        realReview = { plan: r.plan, digest: r.digest };
        reviewIn('e-real-review', r);
      }
      return;
    }
    case 'real-share-back': {
      const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
      const r = await busy('Checking the words…', () => c.ask<Done>('real share back', { collective: form.dataset.collective, member: form.dataset.member, typed }));
      if (r) await afterDone(r);
      return;
    }
    // Publishing and vows.
    case 'collective-add': {
      const r = await busy('Reading the collective from its relays and homes, and your key for it…', () => c.ask<{ lines: Line[] }>('publishing collective add', { id: words(d.get('collective')) }), form);
      if (r) {
        await fill();
        say('done', v.lines(r.lines));
      }
      return;
    }
    case 'pub-work': {
      const m = form.dataset.media ?? 'text';
      const file = d.get('file');
      let data = '';
      if (m === 'text') data = toBase64(new TextEncoder().encode(String(d.get('text') ?? '')));
      else if (file instanceof File && file.size) data = toBase64(new Uint8Array(await file.arrayBuffer()));
      const r = await busy(m === 'video' || m === 'audio' ? 'Checking it with its Module, stripping it, and reading it back…' : 'Reading it back…', () => c.ask<Review>('publishing work read', { media: m, data, title: words(d.get('title')), price: words(d.get('price')), referral: words(d.get('referral')), service: words(d.get('service')), serviceKey: words(d.get('serviceKey')), shares: sharesOf(d) }));
      if (r) {
        pubReview = { plan: r.plan, digest: r.digest };
        reviewIn('e-pub-review', r);
      }
      return;
    }
    case 'pub-vow': {
      const r = await busy('Reading it back…', () => c.ask<Review>('publishing vow read', { words: words(d.get('words')), title: words(d.get('title')), price: words(d.get('price')), shares: sharesOf(d) }));
      if (r) {
        pubReview = { plan: r.plan, digest: r.digest };
        reviewIn('e-vow-review', r);
      }
      return;
    }
    case 'pub-post': {
      const r = await busy('Reading it back…', () => c.ask<Review>('publishing post read', { text: words(d.get('text')), shares: sharesOf(d) }));
      if (r) {
        pubReview = { plan: r.plan, digest: r.digest };
        reviewIn('e-post-review', r);
      }
      return;
    }
    case 'point-add': {
      const at = words(d.get('at'));
      if (!at) return;
      const relay = /^https?:\/\//.test(at);
      const label = relay ? at.replace(/^https?:\/\//, '').replace(/\/$/, '') : (state.identities.find((i) => i.name === at || i.id === at)?.name ?? state.contacts.find((x) => x.name === at)?.name ?? (at.length > 16 ? shortForm(at) : at));
      const key = relay ? at : (state.identities.find((i) => i.name === at)?.id ?? state.contacts.find((x) => x.name === at)?.id ?? state.collectives.find((x) => x.name === at)?.id ?? at);
      keepPoints([...points().filter((x) => x.key !== key), { key, label, relay }]);
      return void (await fill());
    }
  }
  if (form.classList.contains('pub-contest')) {
    const r = await busy('Signing the contest…', () => ask<Done>('publishing contest', { vow: form.dataset.vow, sale: form.dataset.sale, buyer: form.dataset.buyer, promise: words(d.get('promise')) }), form);
    if (r) {
      popup.close();
      await fill();
      say('done', v.done(r));
    }
    return;
  }
  if (form.classList.contains('anchor-pick')) {
    const r = await busy('Preparing the payment for Damgar…', () => ask<{ lines: Line[] }>('anchor', { id: form.dataset.act, service: form.dataset.service, offer: form.dataset.offer, tier: Number(d.get('tier') ?? 0) }), form);
    if (r) {
      popup.close();
      say('done', v.lines(r.lines));
    }
    return;
  }
  if (form.classList.contains('anchor-ask')) {
    const tier = Number(d.get('tier') ?? 0);
    const r = await busy('Making the blind and sealing the draft…', () => c.ask<Done>('money anchor', { identity: state.acting, collective: form.dataset.collective, act: form.dataset.act, service: form.dataset.service, offer: form.dataset.offer, tier }), form);
    if (r) {
      say('done', v.lines(r.lines), form);
      await drawMoney(form.dataset.collective!);
    }
  }
});

// H14, H26, H34: every fold opens and closes at the person's choice, remembered by the program.
app.addEventListener(
  'toggle',
  (ev) => {
    const el = ev.target as HTMLElement;
    if (!(el instanceof HTMLDetailsElement) || !el.dataset.fold || !state) return;
    const key = el.dataset.fold;
    const open = el.open;
    const was = state.unfolded?.[key];
    if (was === open || (was === undefined && el.dataset.default === String(open))) return;
    state.unfolded = { ...(state.unfolded ?? {}), [key]: open };
    void c.ask('fold', { key, open }).catch(fail);
  },
  true,
);

/** Folds drawn as the person left them. */
new MutationObserver((ms) => {
  if (!state) return;
  for (const m of ms)
    for (const n of m.addedNodes) {
      if (!(n instanceof HTMLElement)) continue;
      const all = [...(n.matches('details[data-fold]') ? [n] : []), ...n.querySelectorAll<HTMLDetailsElement>('details[data-fold]')] as HTMLDetailsElement[];
      for (const d of all) {
        d.dataset.default ??= String(d.open);
        const want = state.unfolded?.[d.dataset.fold!];
        if (want !== undefined && d.open !== want) d.open = want;
      }
    }
}).observe(app, { childList: true, subtree: true });

// ---------------------------------------------------------------- start

async function start() {
  app.classList.add('k-page', 'k-edubba');
  try {
    const at = JSON.parse(sessionStorage.getItem('edubba:at') ?? 'null') as { tab: v.Tab; part: string; sub: string } | null;
    if (at && v.tabsHere().includes(at.tab)) [tab, part, sub] = [at.tab, at.part, at.sub];
  } catch {
    // no session storage: the tiles
  }
  if (web) {
    c = web;
    try {
      state = await c.ask<State>('state');
    } catch (err) {
      app.innerHTML = v.alone(note('error', v.e(errorOf(err))));
      return;
    }
    await show(state).catch(fail);
    opened();
    return;
  }
  if (!window.isSecureContext || !crypto?.subtle) {
    app.innerHTML = v.alone(note('error', 'This page keeps a key in the browser, which browsers allow only on the machine itself (http://127.0.0.1) or over https.'));
    return;
  }
  let keys: CryptoKeyPair;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = v.alone(note('error', `This browser cannot make or keep an Ed25519 key (${v.e(errorOf(err))}). A recent Firefox, Safari or Chrome can; a private window may not keep it.`));
    return;
  }
  try {
    c = await Client.open(keys);
  } catch (err) {
    app.innerHTML = v.alone(note('error', v.e(errorOf(err))));
    return;
  }
  // The launcher's link carries a one-time code in the fragment, which never leaves this browser.
  const linked = /^#pair=([0-9A-Za-z-]+)$/.exec(location.hash)?.[1];
  if (linked) {
    history.replaceState(null, '', location.pathname);
    try {
      await c.ask('pair', { code: linked, label: 'this browser' });
    } catch {
      // already paired, or the code was spent: the page says which below
    }
  }
  try {
    state = await c.ask<State>('state');
  } catch (err) {
    app.innerHTML = unpaired(err) ? v.pairing() : v.alone(note('error', v.e(errorOf(err))));
    return;
  }
  await show(state).catch(fail);
  opened();
}

/** What is looked for on opening, on a computer and on the web. */
function opened() {
  // An identity whose signing key was changed elsewhere (F335: a change of keys is done in Kišib): the warning and the box for the new words, under the top.
  void c
    .ask<{ id: string; name: string; say: string; kind: 'identity' | 'collective' }[]>('keys check')
    .then((xs) => offerRenew(xs))
    .catch(() => undefined);
  // Answers waiting for proposals sent from here (H32), and the follow lists sealed to the identities held here (people cMIP draft 2).
  void gatherAll();
  void c
    .ask<{ read: number }>('real lists')
    .then(async (r) => {
      if (r.read) state = await c.ask<State>('state');
    })
    .catch(() => undefined);
  // What each identity received is read, for the seller's alarm alone (Agreements rule 45b, client conformance): the piles are gone (decided), the alarm stays, in red under the top.
  void (async () => {
    for (const i of state.identities.filter((x) => !state.agents.some((a) => a.id === x.id) && x.kind !== 'runner')) await c.ask('refresh', { identity: i.id }).catch(() => undefined);
    state = await c.ask<State>('state').catch(() => state);
    drawAlarms();
  })();
}

// H32: answers to proposals sent from here are looked for by themselves, every 20 seconds; H33: To sign, while it is open.
setInterval(() => {
  if (document.hidden || !state) return;
  void gatherAll();
  if ($('e-signing-wrap') && memberAwaits && !working) void readMember();
}, 20000);

/** Start the page: on a computer, paired with the program; with `o.web`, the web client, its operations run in this browser. */
export function begin(o: { web?: Asker } = {}) {
  web = o.web ?? null;
  v.setWeb(!!web);
  void start();
}
