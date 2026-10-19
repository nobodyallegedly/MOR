// Edubba's page (F333). Nothing here signs an act: it asks the program, shows
// the program's plain-words reading of what would be signed, and sends back
// a digest only when the owner presses the button that signs. The
// Constitution sub-tab is the collective client's own page logic
// (`clients/collective/src/page/mount.ts`), mounted here.
//
// Started by `app.ts` (the program on a computer, paired) or by
// `../web/app.ts` (the web client, for testing only: the same operations run
// in this browser, `../ops.ts`, without the Agents tab).

import { Client, Refused, type ActRead, type IdentityRecord, type RealCollective, type ShareHere, type AgentDetails, type AgentView, type Constitution, type Done, type DraftView, type Line, type Permissions, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';
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

/** Whom the page asks: the program on this computer (a paired `Client`), or, on the web, Edubba's operations run in this browser. */
export interface Asker {
  ask<T = unknown>(op: string, args?: object): Promise<T>;
}

let c: Asker;
/** The web client (for testing only): no Agents tab, nothing of Claude's, no folder, no pairing. */
let web: Asker | null = null;
let state: State;
let drafts: DraftView[] = [];

/** Where the person is: the tab, and what is selected in each. */
const at = {
  tab: 'agents' as v.Tab,
  agent: null as string | null,
  /** "MOR as seen by this agent": a view, not a tab. */
  seeing: false,
  /** The first-use window or "+ Add an agent" open. */
  adding: false,
  identity: null as string | null,
  collective: null as string | null,
  sub: 'act' as 'act' | 'constitution',
};

let collectiveMount: Mounted | null = null;
let postReview: Review | null = null;
/** A real collective's review (H18): founding, a member change, a release. Nothing is signed until confirmed. */
let realReview: { plan: string; digest: string } | null = null;
/** A protected file read back on the Publishing tab, waiting for Sign (round 3, part B). */
let pubReview: { plan: string; digest: string } | null = null;

// ---------------------------------------------------------------- the founding grid (round 3)

/** The grid of each form being filled: the founding's, a member change's. */
const grids = new Map<string, Grid>();
/** The grids the person changed: until then, a founding's grid is drawn afresh for the members chosen. */
const touched = new Set<string>();

const gridName = (id: string) => state.identities.find((i) => i.id === id)?.name ?? state.contacts.find((x) => x.id === id)?.name ?? `${id.slice(0, 8)}…`;

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
app.addEventListener('change', (ev) => {
  const el = ev.target as HTMLElement;
  if (el.closest('[data-grid-form]')) {
    gridEvent(el);
    return;
  }
  const form = el.closest('form');
  if (form && (form.id === 'real-found' || form.id === 'real-change') && (el.getAttribute('name') === 'member' || el.getAttribute('name') === 'typed' || el.getAttribute('name') === 'founder')) void syncGrid(form.id);
});
app.addEventListener('input', (ev) => {
  const el = ev.target as HTMLElement;
  if (el.dataset.gridName !== undefined) gridEvent(el);
});

const unpaired = (err: unknown) => err instanceof Refused && err.status === 401 && /not paired/.test(err.message);

function say(kind: 'error' | 'done' | 'warn' | '', html: string, where?: HTMLElement | null) {
  const s = where ?? $('e-status');
  if (s) s.innerHTML = html ? v.note(kind, html) : '';
  if (html) s?.scrollIntoView({ block: 'nearest' });
}

function fail(err: unknown, where?: HTMLElement | null) {
  if (unpaired(err)) {
    void start();
    return;
  }
  say('error', v.e(err instanceof Error ? err.message : String(err)), where);
}

const fill = (id: string, html: string) => {
  const el = $(id);
  if (el) el.innerHTML = html;
};

const hereFor = (id: string | undefined) => (id ? app.querySelector<HTMLElement>(`.here[data-here="${CSS.escape(id)}"]`) : null);

let working = false;

/** Busy: the buttons wait, so nothing is sent twice. */
async function busy<T>(words: string, f: () => Promise<T>, where?: HTMLElement | null): Promise<T | undefined> {
  say('', `<span class="small">${v.e(words)}</span>`, where);
  working = true;
  const was = [...app.querySelectorAll('button')].map((b) => [b, b.disabled] as const);
  app.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    return await f();
  } catch (err) {
    fail(err, where);
    return undefined;
  } finally {
    for (const [b, d] of was) if (b.isConnected) b.disabled = d;
    working = false;
  }
}

// ---------------------------------------------------------------- drawing

function counts(): Partial<Record<v.Tab, number>> {
  return {
    agents: state.agents.reduce((n, a) => n + a.notified + drafts.filter((d) => d.signer === a.id).length, 0),
    identities: drafts.filter((d) => !state.agents.some((a) => a.id === d.signer)).length + v.secondary(state).reduce((n, i) => n + i.received.filter((x) => x.sorted === 'new').length, 0),
  };
}

async function draw() {
  fill('e-top', v.top(at.tab, counts()));
  collectiveMount = null;
  const body = $('e-body')!;
  switch (at.tab) {
    case 'agents': {
      const first = !state.agents.length;
      if (first || at.adding) {
        body.innerHTML = `${first ? '' : v.agentList(state, null)}${v.agentWindow(state, first)}`;
        return;
      }
      if (!at.agent || !state.agents.some((a) => a.id === at.agent)) at.agent = state.agents[0].id;
      body.innerHTML = `${at.seeing ? '' : v.agentList(state, at.agent)}<div class="detail" id="e-detail"><p class="small">Reading…</p></div>`;
      if (at.seeing) {
        const view = await c.ask<AgentView>('agent view', { agent: at.agent });
        fill('e-detail', v.agentView(state.agents.find((a) => a.id === at.agent)!.name, view));
      } else {
        const d = await c.ask<AgentDetails>('agent', { agent: at.agent });
        fill('e-detail', v.agentDetails(state, d, drafts));
        shown = drafts.map((x) => x.digest).join(',');
        await drawAgentExtras(at.agent);
      }
      return;
    }
    case 'publishing': {
      body.innerHTML = '<p class="small">Reading…</p>';
      const p = await c.ask<v.PublishingShown>('publishing');
      body.innerHTML = v.publishingTab(p);
      // Keys of sales told of are delivered as the tab opens (as Dub does on its main screen).
      if (p.works.some((w) => !w.collective)) {
        void c.ask<{ lines: Line[] }>('publishing deliver').then((r) => {
          if (r.lines.some((l) => /delivered/.test(l.text))) say('done', v.lines(r.lines));
        }).catch(() => undefined);
      }
      return;
    }
    case 'identities': {
      // Agents have their own tab (decided by Nobody, allegedly): only the other identities here.
      const held = v.secondary(state);
      if (!at.identity || (at.identity !== 'new' && !held.some((i) => i.id === at.identity))) at.identity = held[0]?.id ?? 'new';
      const kept = keepForms();
      body.innerHTML = `${v.identityList(state, at.identity, drafts)}<div class="detail" id="e-detail">${
        at.identity === 'new' ? v.newIdentity() : v.identityDetails(state, at.identity, drafts)
      }${v.strayDrafts(state, drafts)}</div>`;
      kept();
      shown = drafts.map((d) => d.digest).join(',');
      if (at.identity !== 'new') {
        await drawMoney();
        await drawRecord(at.identity, false);
        await drawIdentityPosts(at.identity);
      }
      return;
    }
    case 'collectives': {
      const proposalOf = (k: string | null) => (k?.startsWith('p:') ? state.proposals.find((p) => p.act === k.slice(2) && !p.founded) : undefined);
      if (at.collective === 'sign') {
        body.innerHTML = `${v.actingAs(state)}${v.collectiveList(state, at.collective)}<div class="detail" id="e-detail">${v.memberSigning(state, null)}</div>`;
        await readMember();
        return;
      }
      if (!at.collective || (!['found', 'bring', 'real', 'sign'].includes(at.collective) && !proposalOf(at.collective) && !state.collectives.some((x) => x.id === at.collective))) at.collective = state.collectives[0]?.id ?? 'real';
      const here = state.collectives.find((x) => x.id === at.collective);
      const brought = here?.brought;
      realReview = null;
      if (at.collective === 'real' || proposalOf(at.collective)) {
        const p = proposalOf(at.collective);
        body.innerHTML = `${v.actingAs(state)}${v.collectiveList(state, at.collective)}<div class="detail" id="e-detail">${p ? v.realProposalDetails(state, p) : v.realFound(state)}</div>`;
        if (!p) await syncGrid('real-found');
        return;
      }
      if (here?.real) {
        const rc = await c.ask<RealCollective>('real collective', { collective: here.id });
        body.innerHTML = `${v.actingAs(state)}${v.collectiveList(state, at.collective)}<div class="detail" id="e-detail">${v.realDetails(state, here.id, rc)}</div>`;
        grids.delete('real-change');
        touched.delete('real-change');
        await syncGrid('real-change');
        await drawMoney(here.id);
        await drawAct(here.id);
        return;
      }
      body.innerHTML = `${v.actingAs(state)}${v.collectiveList(state, at.collective)}<div class="detail" id="e-detail">${
        at.collective === 'found' ? v.foundCollective() : at.collective === 'bring' ? v.bringCollective() : brought ? v.broughtDetails(state, at.collective) : v.collectiveDetails(state, at.collective, at.sub)
      }</div>`;
      if (at.collective === 'bring') return;
      if (at.collective !== 'found' && (brought || at.sub === 'act')) await drawAct(at.collective);
      else await mountCollective();
      return;
    }
    case 'settings':
      body.innerHTML = v.settingsTab(state);
      await mountCollective();
      return;
  }
}

/** The collective client's page logic, in the Constitution sub-tab (or the founding, or its settings). */
async function mountCollective() {
  const root = app.querySelector<HTMLElement>('[data-collective-root]');
  if (!root) return;
  collectiveMount = mount(root, {
    ask: (op, args) => c.ask(`collective ${op}`, args ?? {}),
    fail: (err) => {
      if (!unpaired(err)) return false;
      void start();
      return true;
    },
    only: () => (at.collective && at.collective !== 'found' ? at.collective : undefined),
    // Something was signed: the collectives listed may have changed (one founded, one ended).
    done: async () => {
      const before = state.collectives.map((x) => x.id).join(',');
      state = await c.ask<State>('state');
      if (state.collectives.map((x) => x.id).join(',') !== before) {
        const added = state.collectives.find((x) => !before.includes(x.id));
        if (added && at.collective === 'found') {
          at.collective = added.id;
          at.sub = 'constitution';
          await draw();
        } else fill('e-top', v.top(at.tab, counts()));
      }
    },
  });
  try {
    await collectiveMount.refresh();
  } catch (err) {
    fail(err);
  }
}

/** The record of the identity selected, read from its homes and relays; kept between redraws until read again. */
const records = new Map<string, IdentityRecord>();
async function drawRecord(id: string, again = true) {
  const had = records.get(id);
  if (had && !again) {
    fill('e-record', v.record(had));
    return;
  }
  if (had) fill('e-record', v.record(had));
  try {
    const r = await c.ask<IdentityRecord>('record', { identity: id });
    records.set(id, r);
    if (at.identity === id) fill('e-record', v.record(r));
  } catch (err) {
    if (at.identity === id) fill('e-record', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

/**
 * What is being written or reviewed on the Identities tab (an act read
 * back), kept across a redraw, as notes on
 * drafts are: a new draft arriving must not lose them.
 */
function keepForms(): () => void {
  const ids = ['e-rely-shown'];
  const html = new Map(ids.map((i) => [i, $(i)?.innerHTML ?? '']));
  const values = new Map<string, string>();
  for (const f of ['rely']) $<HTMLFormElement>(f)?.querySelectorAll<HTMLInputElement>('input,select,textarea').forEach((x) => values.set(`${f}:${x.name}`, x.value));
  const was = at.identity;
  return () => {
    if (at.identity !== was) return;
    for (const [i, h] of html) if (h) fill(i, h);
    for (const [k, val] of values) {
      const [f, n] = k.split(':');
      const x = $<HTMLFormElement>(f)?.elements.namedItem(n) as HTMLInputElement | null;
      if (x) x.value = val;
    }
  };
}

/** F338: the units a money draft may name, the acts a collective may anchor, and the anchors asked, filled in after a redraw. */
let units: { hash: string; label: string }[] | null = null;
async function drawMoney(collective?: string) {
  try {
    units ??= await c.ask<{ hash: string; label: string }[]>('money units');
    app.querySelectorAll<HTMLSelectElement>('select[data-units]').forEach((x) => (x.innerHTML = units!.map((u) => `<option value="${v.e(u.hash)}">${v.e(u.label)}</option>`).join('')));
    if (!collective) return;
    const acts = await c.ask<{ act: string; label: string }[]>('money anchorable', { collective });
    const sel = app.querySelector<HTMLSelectElement>(`select[data-anchorable="${CSS.escape(collective)}"]`);
    if (sel) sel.innerHTML = acts.map((a) => `<option value="${v.e(a.act)}">${v.e(a.label)} (${v.e(a.act.slice(0, 8))}…)</option>`).join('');
    fill('e-anchors', v.anchors(await c.ask('money anchors', { collective })));
  } catch (err) {
    fill('e-anchors', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

async function drawAct(id: string) {
  try {
    const p = await c.ask<Permissions>('collective permissions', { collective: id });
    if (at.collective === id) fill('e-perms', v.permissions(p, state.unfolded?.[id] !== false));
  } catch (err) {
    fill('e-perms', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
  try {
    const r = await c.ask<Parameters<typeof v.posts>[0]>('collective posts', { collective: id });
    // A collective's correction is read back and signed as any of its posts (the corrections cMIP): for a test-mode collective, whose posting is the collective client's; a real or brought one posts nothing from here.
    const held = state.collectives.find((x) => x.id === id);
    if (at.collective === id) fill('e-posts', v.posts(r, held?.brought || held?.real ? null : { kind: 'collective', id }));
  } catch (err) {
    fill('e-posts', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

/** An agent's grants and notes, read after its details (H22; the grant, film 2). Its diary is never read here. */
async function drawAgentExtras(agent: string) {
  try {
    const g = await c.ask<v.GrantListed[]>('agent grants', { agent });
    if (at.agent === agent) fill('e-grants', v.grantsCard(g));
  } catch (err) {
    fill('e-grants', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
  try {
    const n = await c.ask<v.NotesRead>('agent notes', { agent });
    if (at.agent === agent) fill('e-memory', v.memoryCard(n));
  } catch (err) {
    fill('e-memory', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

/** An identity's own posts, each correctable (the corrections cMIP). */
async function drawIdentityPosts(identity: string) {
  $('e-detail')?.insertAdjacentHTML('beforeend', '<div id="e-ident-posts"></div>');
  try {
    const r = await c.ask<Parameters<typeof v.posts>[0]>('identity posts', { identity });
    if (at.identity === identity) fill('e-ident-posts', v.identityPosts(identity, r));
  } catch (err) {
    fill('e-ident-posts', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

/** Bytes as base64, in the page (no Buffer here). */
function toBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}

async function refresh() {
  state = await c.ask<State>('state');
  await draw();
}

// ---------------------------------------------------------------- signing as a member (H33)

/** A share awaited in the member's view: looked for by itself while the view is open. */
let memberAwaits = false;

/** The proposals to sign as the identity acted as, read in plain words (Dub's own reading). A share being shown, or its words being typed, is never drawn over. */
async function readMember() {
  try {
    const r = await c.ask<{ proposals: MemberProposal[]; problems: string[] }>('member proposals');
    memberAwaits = r.proposals.some((p) => !p.answer || p.share === 'waiting' || p.share === 'ready');
    if (at.tab !== 'collectives' || at.collective !== 'sign') return;
    if ($('share-shown') || [...app.querySelectorAll<HTMLInputElement>('#e-signing form.share-back input')].some((i) => i.value)) return;
    fill('e-detail', v.memberSigning(state, r));
  } catch (err) {
    fill('e-signing', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

/** A member's step, by Dub's names for them (`accept`, `decline`, `share`, `share-written`, `sharehand`, `lookshare`). */
async function memberAction(b: HTMLElement): Promise<void> {
  const d = b.dataset;
  switch (d.action) {
    case 'accept': {
      if (!confirm('Sign it? Your signature is public, and binds this identity to exactly what you read here.')) return;
      const r = await busy('Signing, and answering the proposer…', () => c.ask<{ lines: { text: string }[] }>('member accept', { thread: d.thread }));
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
      const r = await busy('Signing the resignation, and telling the founder…', () => c.ask<{ lines: { text: string }[] }>('member leave', { thread: d.thread, digest: d.digest }));
      if (r) {
        await readMember();
        say('done', `<strong>Resigned.</strong><ul>${r.lines.map((l) => `<li>${v.e(l.text)}</li>`).join('')}</ul>`);
      }
      return;
    }
    case 'decline': {
      const why = prompt('Decline it. Your reason, if you like (sent to the proposer, sealed):');
      if (why === null) return;
      const r = await busy('Declining…', () => c.ask<{ lines: { text: string }[] }>('member decline', { thread: d.thread, why }));
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
        say('', '');
        const card = app.querySelector<HTMLElement>(`#e-signing .proposal[data-thread="${CSS.escape(r.thread)}"]`);
        if (card) card.outerHTML = v.memberShare(r);
      }
      return;
    }
    case 'share-written': {
      const card = $('share-shown');
      if (card) card.outerHTML = `<div class="proposal" data-thread="${v.e(d.thread!)}">${shareTypeBack(d.thread!, (d.positions ?? '').split(',').map(Number))}</div>`;
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
      say('', '');
      return;
  }
}

// ---------------------------------------------------------------- answers looked for by themselves (H32)

/** The proposals sent from here that still wait for answers. */
const pendingProposals = () =>
  state.proposals.filter((p) => (p.kind === 'founding' ? !p.founded : p.kind === 'clone' ? !p.standing.enough : !p.standing.enough));

let gathering = false;
/** Look for answers to every proposal that waits, as "Look for answers" does; redraw only what changed, never a form being filled. */
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
    if (at.tab !== 'collectives') return;
    // Only the list and the cards of proposals are drawn again: forms keep what is typed.
    const list = app.querySelector('.list[aria-label=Collectives]');
    if (list) list.outerHTML = v.collectiveList(state, at.collective);
    for (const p of state.proposals) {
      const card = app.querySelector(`section.proposal-status[data-proposal="${CSS.escape(p.act)}"]`);
      if (card) card.outerHTML = v.proposalStatus(state, p);
    }
  } finally {
    gathering = false;
  }
}

// ---------------------------------------------------------------- the folder picker (H31)

async function picker(target: string, path?: string) {
  try {
    const l = await c.ask<Listing>('folders', path ? { path } : {});
    fill('e-dialog-body', v.folderPicker(l, target));
    const dlg = $<HTMLDialogElement>('e-dialog')!;
    if (!dlg.open) dlg.showModal();
  } catch (err) {
    fail(err);
  }
}

async function readDrafts() {
  drafts = await c.ask<DraftView[]>('drafts');
}

/** The drafts on the page, by digest, to see when the folder has others. */
let shown = '';

/**
 * New drafts appear by themselves: every few seconds, while nothing else
 * is under way, the program is asked which drafts wait (the folder alone,
 * no relay), and the drafts are read again only when that list changed.
 * This runs whether or not the browser says the page is in view.
 */
async function watch() {
  if (working || !c || !state) return;
  try {
    const waiting = await c.ask<string[]>('waiting');
    if (working || waiting.join(',') === shown) return;
    const before = new Set(shown.split(','));
    shown = waiting.join(',');
    // A note being written to send a draft back is kept across the redraw.
    const notes = new Map<string, string>();
    app.querySelectorAll<HTMLFormElement>('form.send-back').forEach((f) => {
      const t = f.querySelector('textarea');
      if (t?.value) notes.set(f.dataset.digest ?? '', t.value);
    });
    await readDrafts();
    shown = drafts.map((d) => d.digest).join(',');
    if (at.tab === 'identities' || (at.tab === 'agents' && !at.seeing && !at.adding && state.agents.length)) {
      await draw();
      for (const [digest, note] of notes) {
        const t = app.querySelector<HTMLTextAreaElement>(`form.send-back[data-digest="${CSS.escape(digest)}"] textarea`);
        if (t) t.value = note;
      }
      const fresh = waiting.filter((d) => !before.has(d)).length;
      if (fresh) fill('drafts-watch', fresh === 1 ? 'A new draft from Claude arrived.' : `${fresh} new drafts from Claude arrived.`);
    } else fill('e-top', v.top(at.tab, counts()));
  } catch (err) {
    if (unpaired(err)) fail(err);
  }
}

async function after(d: Done | undefined) {
  if (!d) return;
  await readDrafts();
  await refresh();
  say('done', v.done(d));
}

/** Copy text, with the clipboard where the browser allows it, else by a selection. */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.append(t);
    t.select();
    const ok = document.execCommand('copy');
    t.remove();
    return ok;
  }
}

/** A file chosen in a form, as base64. */
function base64Of(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });
}

// ---------------------------------------------------------------- clicks

app.addEventListener('click', async (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!b || b instanceof HTMLInputElement) return;
  // The collective client's page answers its own buttons, the folder picker aside (H19, H31: its release folder setting).
  if (b.closest('[data-collective-root]') && b.dataset.action !== 'pick-folder') return;
  const d = b.dataset;
  const agent = at.agent ?? undefined;
  // H33: a member's steps, in the "To sign" view, by Dub's names for them.
  if (b.closest('#e-signing')) return memberAction(b);
  switch (d.action) {
    case 'member-look':
      await busy('Reading the inbox for proposals and shares…', readMember);
      say('', '');
      break;
    case 'pick-folder':
      await picker(d.target!);
      break;
    case 'real-register-resignation': {
      const r = await busy('Drawing the collective’s line, registering the resignation…', () => c.ask<Done>('real register resignation', { collective: d.collective, act: d.act }));
      if (r) {
        await draw().catch(fail);
        say('done', v.lines(r.lines));
      }
      break;
    }
    case 'folder-open':
      await picker(b.closest<HTMLElement>('.picker')!.dataset.target!, d.path);
      break;
    case 'folder-use': {
      const target = b.closest<HTMLElement>('.picker')!.dataset.target!;
      // The target: a form with a field named "folder", or the input itself.
      const el = $<HTMLElement>(target);
      const input = (el instanceof HTMLInputElement ? el : ((el as HTMLFormElement | null)?.elements.namedItem('folder') ?? null)) as HTMLInputElement | null;
      if (input) input.value = d.path!;
      $<HTMLDialogElement>('e-dialog')!.close();
      break;
    }
    case 'real-lists': {
      const r = await busy('Reading the follow lists sealed to your identities…', () => c.ask<{ read: number; problems: string[] }>('real lists'));
      if (r) {
        await refresh();
        say(r.problems.length ? 'warn' : 'done', `${r.read === 1 ? 'One follow list read' : `${r.read} follow lists read`}.${r.problems.map((p) => `<br>${v.e(p)}`).join('')}`);
      }
      break;
    }
    case 'note-retire': {
      const why = prompt('Why retire this note? (optional, kept with it)') ?? '';
      const r = await busy('Signing a later act that marks the note dropped…', () => c.ask<Done>('agent note retire', { agent: at.agent, note: d.note, why }));
      if (r) {
        say('done', v.done(r));
        await drawAgentExtras(at.agent!);
      }
      break;
    }
    case 'diary-ask': {
      const n = await busy('…', () => c.ask<v.NotesRead>('agent notes', { agent: at.agent }));
      if (n) fill('e-diary', v.diaryAsk(n.diary.say, n.diary.button));
      break;
    }
    case 'diary-read': {
      const r = await busy('Reading its diary from its homes…', () => c.ask<{ entries: { day: string; striking: string; reflection: string; why: string }[] }>('agent diary', { agent: at.agent, reading: true }));
      if (r) fill('e-diary', v.diary(r));
      break;
    }
    case 'diary-close':
      fill('e-diary', '');
      break;
    case 'grant-sign': {
      const r = await busy('Signing the grant; asking your agent whether it accepts…', () => c.ask<Done>('agent grant publish', { agent: at.agent, digest: d.digest }));
      if (r) {
        say(r.title.includes('accepted') ? 'done' : 'warn', v.done(r));
        await drawAgentExtras(at.agent!);
      }
      break;
    }
    case 'grant-cancel':
      fill('e-grant-shown', '');
      break;
    case 'grant-revoke': {
      if (!confirm('Revoke this grant? Its key backs nothing signed after the revocation.')) break;
      const r = await busy('Signing the revocation…', () => c.ask<Done>('agent grant revoke', { agent: at.agent, grant: d.grant }));
      if (r) {
        say('done', v.done(r));
        await drawAgentExtras(at.agent!);
      }
      break;
    }
    case 'grant-ask': {
      const r = await busy('Asking your agent whether it accepts…', () => c.ask<Done>('agent grant ask', { agent: at.agent, grant: d.grant }));
      if (r) {
        say('done', v.done(r));
        await drawAgentExtras(at.agent!);
      }
      break;
    }
    case 'tab':
      at.tab = d.tab as v.Tab;
      at.seeing = false;
      say('', '');
      await draw().catch(fail);
      break;
    case 'pick-agent':
      at.agent = d.id!;
      at.seeing = false;
      at.adding = false;
      say('', '');
      await draw().catch(fail);
      break;
    case 'add-agent':
      at.adding = true;
      say('', '');
      await draw().catch(fail);
      break;
    case 'add-cancel':
      at.adding = false;
      await draw().catch(fail);
      break;
    case 'pick-identity':
      at.identity = d.id!;
      say('', '');
      await draw().catch(fail);
      break;
    case 'pick-collective':
      at.collective = d.id!;
      at.sub = 'act';
      postReview = null;
      say('', '');
      await draw().catch(fail);
      break;
    case 'sub':
      at.sub = d.sub as 'act' | 'constitution';
      say('', '');
      await draw().catch(fail);
      break;
    case 'agent-view':
      at.seeing = true;
      await busy('Reading what it reads…', draw);
      say('', '');
      break;
    case 'agent-back':
      at.seeing = false;
      await draw().catch(fail);
      break;
    case 'agent-name':
      await after(await busy('Signing and publishing its display name…', () => c.ask<Done>('agent name', { agent })));
      break;
    case 'agent-unfollow':
      await busy('Unfollowing…', () => c.ask('agent unfollow', { agent, id: d.id }));
      await draw().catch(fail);
      break;
    case 'pay-member': {
      const f = $<HTMLFormElement>('pay-member');
      const to = f?.elements.namedItem('to') as HTMLInputElement | null;
      if (to) to.value = d.member ?? '';
      f?.querySelector<HTMLInputElement>('input[name=value]')?.focus();
      return;
    }
    case 'constitution': {
      const r = await busy('Reading its agreement in force…', () => c.ask<Constitution>('collective constitution', { collective: at.collective }));
      if (r) {
        say('', '');
        fill('e-dialog-body', v.constitution(state.collectives.find((x) => x.id === at.collective)?.name ?? '', r));
        $<HTMLDialogElement>('e-dialog')!.showModal();
      }
      break;
    }
    case 'pub-deliver': {
      const r = await busy('Looking for sales and delivering keys…', () => c.ask<{ lines: Line[] }>('publishing deliver'));
      if (r) {
        await draw();
        say('done', v.lines(r.lines));
      }
      break;
    }
    case 'dialog-close':
      $<HTMLDialogElement>('e-dialog')!.close();
      break;
    case 'confirm': {
      if (pubReview && at.tab === 'publishing') {
        const r = pubReview;
        const done = await busy('Sealing, signing and publishing…', () => c.ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest }));
        if (done) {
          pubReview = null;
          await draw();
          say('done', v.done(done));
        }
        return;
      }
      if (realReview) {
        const r = realReview;
        const done = await busy('Signing and sending…', () => c.ask<Done>('real confirm', { plan: r.plan, digest: r.digest }));
        if (done) {
          realReview = null;
          if (at.collective === 'real') at.collective = `p:${done.acts[0]}`;
          await refresh();
          say('done', v.done(done));
        }
        return;
      }
      // A post for a collective, reviewed (the collective client's reading).
      if (!postReview) return;
      const r = postReview;
      const done = await busy('Signing and sending…', () => c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest }));
      if (done) {
        postReview = null;
        fill('e-post-review', '');
        $<HTMLFormElement>('collective-post')?.reset();
        say('done', v.done(done));
        await drawAct(at.collective!);
      }
      break;
    }
    case 'cancel':
      if (realReview) {
        void c.ask('real cancel', { plan: realReview.plan }).catch(() => undefined);
        realReview = null;
        fill('e-real-review', '');
        say('', 'Nothing was signed.');
        break;
      }
      if (postReview) void c.ask('collective cancel', { plan: postReview.plan }).catch(() => undefined);
      postReview = null;
      fill('e-post-review', '');
      say('', 'Nothing was signed.');
      break;
    case 'contact-remove':
      if (await busy('Removing…', () => c.ask('real contact remove', { id: d.id }))) await refresh();
      break;
    case 'real-gather': {
      const where = () => app.querySelector<HTMLElement>(`[data-here-proposal="${CSS.escape(d.act!)}"]`);
      const r = await busy('Reading the answers in your inbox…', () => c.ask<{ problems: string[] }>('real gather', { act: d.act }), where());
      if (r) {
        await refresh();
        if (r.problems.length) say('warn', r.problems.map(v.e).join('<br>'), where());
      }
      break;
    }
    case 'real-found': {
      const read = $<HTMLInputElement>(`real-found-read-${d.act!.slice(0, 12)}`)?.checked === true;
      if (!read) {
        say('warn', 'Read what this device will hold while founding (F337), and tick it, first. Nothing was dealt.');
        break;
      }
      const r = await busy('Dealing the chain key, founding the collective, sealing each share to its one-time key…', () => c.ask<Done & { show: string[] }>('real found', { act: d.act, read: true }));
      if (r) {
        at.collective = r.acts[0];
        await refresh();
        say('done', v.done(r));
      }
      break;
    }
    case 'real-show-share': {
      const r = await busy('Opening the share, once…', () => c.ask<ShareHere>('real show share', { collective: d.collective, member: d.member }));
      if (r) {
        say('', '');
        fill('e-shares-here', v.shareHere(d.collective!, r, state.identities.find((i) => i.id === d.member)?.name ?? state.contacts.find((x) => x.id === d.member)?.name ?? 'a member'));
        $('e-shares-here')?.scrollIntoView({ block: 'start' });
      }
      break;
    }
    case 'real-share-written':
      // As H3: the words go before three are asked back.
      fill('e-shares-here', v.shareBackHere(d.collective!, d.member!, (d.positions ?? '').split(',').map(Number)));
      break;
    case 'real-release-standing': {
      const where = () => app.querySelector<HTMLElement>(`[data-here-proposal="${CSS.escape(d.act!)}"]`);
      const r = await busy('Checking the release as a fresh verifier…', () => c.ask<{ ok: boolean; signers: string[]; problems: string[] }>('real release standing', { act: d.act }), where());
      if (r) say(r.ok ? 'done' : 'warn', r.ok ? `It counts as the collective’s release, signed by ${r.signers.length} members.` : `It does not count yet: ${r.problems.map(v.e).join(' ')}`, where());
      break;
    }
    case 'drafts':
      await busy('Reading the drafts folder…', async () => {
        await readDrafts();
        await draw();
      });
      say('', '');
      break;
    case 'approve':
      await after(await busy('Signing and sending…', () => c.ask<Done>('approve', { digest: d.digest })));
      break;
    case 'decline':
      await after(await busy('Declining…', () => c.ask<Done>('decline', { digest: d.digest, note: '' })));
      break;
    case 'resend':
      await after(await busy('Sending the same act again…', () => c.ask<Done>('resend', { digest: d.digest })));
      break;
    case 'refresh': {
      const where = () => app.querySelector<HTMLElement>(`[data-here-received="${CSS.escape(d.identity!)}"]`);
      const r = await busy('Opening the inbox…', () => c.ask<{ added: number; problems: string[] }>('refresh', { identity: d.identity }), where());
      if (r) {
        await refresh();
        say(r.problems.length ? 'warn' : 'done', `${r.added === 1 ? '1 new item' : `${r.added} new items`}.${r.problems.map((p) => `<br>${v.e(p)}`).join('')}`, where());
      }
      break;
    }
    case 'copy': {
      const was = b.textContent;
      const ok = await copy(d.id ?? '');
      b.textContent = ok ? 'Copied' : 'Copy failed: select the fingerprint';
      setTimeout(() => (b.textContent = was), 2000);
      break;
    }
    case 'link': {
      const on = d.on === 'true';
      try {
        await c.ask('link', { id: d.identity, on });
        await refresh();
        say('done', on ? 'Saved: Claude may now prepare drafts for this identity.' : 'Saved: Claude may no longer prepare drafts for this identity; drafts for it are refused.', hereFor(d.identity));
      } catch (err) {
        fail(err, hereFor(d.identity));
      }
      break;
    }
    case 'witness': {
      // Nothing is signed by this click: the act is read back on the identity's page, with what a witness act does.
      const r = await busy('Reading the act back…', () => c.ask<ActRead>('read act', { identity: d.identity, act: d.act }), $('e-rely-shown'));
      if (r) {
        fill('e-rely-shown', v.relyShown(d.identity!, r));
        const fold = $<HTMLDetailsElement>('e-rely');
        if (fold) fold.open = true;
        $('e-rely')?.scrollIntoView({ block: 'start' });
      }
      break;
    }
    case 'rely-cancel':
      fill('e-rely-shown', '');
      break;
    case 'record':
      await drawRecord(d.identity!);
      break;
    case 'sort':
      try {
        await c.ask('sort', { identity: d.identity, key: d.key, sorted: d.sorted });
        await refresh();
      } catch (err) {
        fail(err);
      }
      break;
    case 'machine-publish': {
      const r = await busy('Signing and publishing its terms…', () => c.ask<Done>('machine publish', { agent: d.agent, owner: d.owner, digest: d.digest, own: d.own === 'true' }));
      if (r) {
        at.adding = false;
        at.agent = d.agent!;
        await after(r);
      }
      break;
    }
    case 'machine-on':
      try {
        await c.ask('machine on', { agent, on: d.on === 'true' });
        await refresh();
      } catch (err) {
        fail(err);
      }
      break;
    case 'machine-look': {
      const r = await busy('Looking at what it received…', () => c.ask<{ answered: number; stopped: string | null; problems: string[] }>('machine look', { agent }));
      if (r) {
        await refresh();
        say(r.stopped || r.problems.length ? 'warn' : 'done', `${r.answered === 1 ? 'One answer sent' : `${r.answered} answers sent`}.${[r.stopped ?? '', ...r.problems].filter(Boolean).map((p) => `<br>${v.e(p)}`).join('')}`);
      }
      break;
    }
    case 'machine-pick':
      await after(await busy('Signing your pick; it is answering…', () => c.ask<Done>('machine pick', { agent, key: d.key })));
      break;
    case 'machine-picks': {
      // Nothing is signed by this click: the picks are shown together first.
      const keys = [...app.querySelectorAll<HTMLInputElement>('input[name=pick-select]:checked')].map((x) => x.value);
      if (!keys.length) {
        fill('e-picks-shown', v.note('warn', 'Select the acts to pick first.'));
        break;
      }
      const t = await busy('Reading the picks…', () => c.ask<{ lines: string[]; digest: string }>('machine picks', { agent, keys }), $('e-picks-shown'));
      if (t) fill('e-picks-shown', v.picksShown(keys, t));
      break;
    }
    case 'machine-picks-cancel':
      fill('e-picks-shown', '');
      break;
    case 'machine-pick-many':
      await after(await busy('Signing your picks; it answers each…', () => c.ask<Done>('machine pick many', { agent, keys: JSON.parse(d.keys!), digest: d.digest })));
      break;
    case 'machine-retry':
      await busy('Trying again…', () => c.ask('machine retry', { agent, act: d.act }));
      await refresh();
      break;
    case 'code': {
      const r = await busy('Making a code…', () => c.ask<{ code: string }>('code'));
      if (r) {
        say('', '');
        fill('code', v.note('', `Code for another browser, valid ten minutes, once: <span class="code">${v.e(r.code)}</span>`));
      }
      break;
    }
    case 'unpair':
      if (!confirm(d.you === 'true' ? 'Unpair this browser? It will need a new link from the Edubba app.' : 'Unpair that browser?')) break;
      try {
        await c.ask('unpair', { key: d.key });
        if (d.you === 'true') {
          await forgetKey();
          await start();
        } else await refresh();
      } catch (err) {
        fail(err);
      }
      break;
  }
});

// ---------------------------------------------------------------- forms

const words = (s: FormDataEntryValue | null) => (typeof s === 'string' ? s.trim() : '');
const linesOf = (s: FormDataEntryValue | null) => words(s).split(/\s+/).filter(Boolean);

app.addEventListener('submit', async (ev) => {
  const form = ev.target as HTMLFormElement;
  // The collective client's page answers its own forms.
  if (form.closest('[data-collective-root]')) return;
  ev.preventDefault();
  const d = new FormData(form);
  const agent = at.agent ?? undefined;
  // Not `form.id`: a form's fields shadow its properties (the bring forms have a field named "id").
  const fid = form.getAttribute('id');
  // The Publishing tab (round 3, part B).
  if (fid === 'collective-add' && at.tab === 'publishing') {
    const r = await busy('Reading the collective from its relays and homes, and your key for it…', () => c.ask<{ lines: Line[] }>('publishing collective add', { id: words(d.get('collective')) }));
    if (r) {
      await draw();
      say('done', v.lines(r.lines));
    }
    return;
  }
  if (fid === 'pub-work') {
    const media = String(d.get('media') ?? 'text');
    const file = d.get('file');
    let data = '';
    if (media === 'picture') {
      if (file instanceof File && file.size) data = toBase64(new Uint8Array(await file.arrayBuffer()));
    } else data = toBase64(new TextEncoder().encode(String(d.get('text') ?? '')));
    const r = await busy('Reading it back…', () => c.ask<Review>('publishing work read', { media, data, title: words(d.get('title')), price: words(d.get('price')), referral: words(d.get('referral')) }));
    if (r) {
      pubReview = { plan: r.plan, digest: r.digest };
      say('', '');
      fill('e-pub-review', `<div class="colroot">${reading(r.reading, r)}</div>`);
      $('e-pub-review')?.scrollIntoView({ block: 'start' });
    }
    return;
  }
  if (fid === 'pair') {
    try {
      await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: 'this browser' });
      await start();
      say('done', 'This browser is paired.');
    } catch (err) {
      fill('pair-status', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
    return;
  }
  if (form.classList.contains('share-back') && form.closest('#e-signing')) {
    const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
    const r = await busy('Checking the words, then destroying the one-time key…', () => c.ask<{ lines: { text: string }[] }>('member shareback', { thread: form.dataset.thread, typed }));
    if (r) {
      await readMember();
      say('done', `<strong>The share is written down.</strong> ${r.lines.map((l) => v.e(l.text)).join(' ')}`);
    }
    return;
  }
  if (fid === 'acting-as') return;
  if (form.classList.contains('send-back')) {
    return after(await busy('Sending it back to Claude…', () => c.ask<Done>('send back', { digest: form.dataset.digest, note: words(d.get('note')) })));
  }
  if (fid === 'agent-add') {
    const own = d.get('own') === 'on';
    const r = await busy('Making its identity at its homes, and publishing its name…', async () => {
      if (d.has('homes')) await c.ask('settings', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: [], drafts: '' });
      return c.ask<Done & { agent: string; owner: string; terms: { lines: string[]; digest: string } }>('agent add', {
        name: words(d.get('name')),
        agent: words(d.get('agent')),
        owner: words(d.get('owner')),
        ownerName: words(d.get('ownerName')),
        key: words(d.get('key')),
        own,
      });
    });
    if (r) {
      // The key leaves the page: the field is emptied, and the page keeps nothing of it.
      form.reset();
      form.querySelectorAll('input,select,button').forEach((x) => ((x as HTMLInputElement).disabled = true));
      say('done', v.done(r));
      fill('e-terms', v.termsShown(r.agent, r.owner, own, r.terms));
      $('e-terms')?.scrollIntoView({ block: 'start' });
    }
    return;
  }
  if (fid === 'agent-prompt') {
    const r = await busy('Signing your prompt, sealing it to the agent; it is answering…', () => c.ask<Done>('agent prompt', { agent, text: String(d.get('text') ?? '') }));
    if (r) {
      await refresh();
      say('', '');
      say('done', v.done(r), $('e-agent-here'));
      $('e-prompt')?.scrollIntoView({ block: 'end' });
    }
    return;
  }
  if (fid === 'agent-follow') {
    const r = await busy('Following…', () => c.ask('agent follow', { agent, id: words(d.get('who')), name: words(d.get('name')) }));
    if (r) await draw().catch(fail);
    return;
  }
  if (fid === 'agent-key') {
    const own = d.get('own') === 'own';
    const r = await busy('Saving its key…', () => c.ask<{ last4: string | null }>('agent key', { agent, own, key: words(d.get('key')) }));
    form.reset();
    if (r) {
      await refresh();
      say('done', own ? `It uses a key of its own${r.last4 ? `, …${v.e(r.last4)}` : ''}.` : 'It uses the shared key.');
    }
    return;
  }
  if (fid === 'machine-cap') {
    const r = await busy('Saving the cap…', () => c.ask('machine cap', { agent, callsPerDay: Number(words(d.get('callsPerDay'))), maxChars: Number(words(d.get('maxChars'))) }));
    if (r) await refresh();
    return;
  }
  if (fid === 'machine-nudge') {
    return after(await busy('Signing your nudge; it is choosing…', () => c.ask<Done>('machine nudge', { agent, count: Number(words(d.get('count'))), context: words(d.get('context')) })));
  }
  if (fid === 'grant-form') {
    const until = words(d.get('until'));
    const r = await busy('Reading the grant back…', () =>
      c.ask<{ lines: string[]; digest: string }>('agent grant preview', {
        agent,
        kinds: d.getAll('kinds').map(String),
        cap: words(d.get('cap')) || null,
        clock: words(d.get('clock')),
        until: until ? Math.floor(new Date(until).getTime() / 1000) : 0,
      }),
    );
    if (r) fill('e-grant-shown', v.grantShown(r));
    return;
  }
  if (form.classList.contains('correct-form')) {
    const kind = form.dataset.kind;
    if (kind === 'identity') {
      const r = await busy('Signing the correction…', () => c.ask<Done>('identity correct', { identity: form.dataset.id, act: form.dataset.act, text: String(d.get('text') ?? '') }));
      if (r) {
        say('done', v.done(r));
        await draw();
      }
      return;
    }
    const r = await busy('Preparing the correction, and reading it back…', () => c.ask<Review>('collective prepare', { kind: 'post', collective: form.dataset.id, text: String(d.get('text') ?? ''), corrects: form.dataset.act }));
    if (r) {
      postReview = r;
      say('', '');
      fill('e-post-review', `<div class="colroot">${reading(r.reading, r)}</div>`);
      $('e-post-review')?.scrollIntoView({ block: 'start' });
    }
    return;
  }
  if (fid === 'collective-post') {
    const file = d.get('jpeg');
    const jpeg = file instanceof File && file.size ? await base64Of(file) : undefined;
    const r = await busy('Preparing, and reading it back…', () => c.ask<Review>('collective prepare', { kind: 'post', collective: at.collective, text: String(d.get('text') ?? ''), jpeg }));
    if (r) {
      postReview = r;
      say('', '');
      fill('e-post-review', `<div class="colroot">${reading(r.reading, r)}</div>`);
      $('e-post-review')?.scrollIntoView({ block: 'start' });
    }
    return;
  }
  if (fid === 'bring-identity') {
    const r = await busy('Reading the identity from its homes, and checking the words…', () =>
      c.ask<Done>('bring', { name: words(d.get('name')), id: words(d.get('id')), words: words(d.get('words')), address: words(d.get('address')), linked: d.get('linked') === 'on' }),
    );
    if (r) {
      form.reset();
      at.identity = r.acts[0];
    }
    return after(r);
  }
  if (fid === 'contact-add') {
    const r = await busy('Adding…', () => c.ask('real contact add', { id: words(d.get('id')), name: words(d.get('name')) }));
    if (r) {
      // A founding form being filled is kept: only the contacts are drawn again.
      state = await c.ask<State>('state');
      const picked = new Set([...app.querySelectorAll<HTMLInputElement>('input[name=member]:checked')].map((x) => x.value));
      const values = new Map([...app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#real-found input:not([type=checkbox]),#real-found textarea,#real-found select')].map((x) => [x.name, x.value]));
      await draw();
      for (const x of app.querySelectorAll<HTMLInputElement>('input[name=member]')) if (picked.has(x.value)) x.checked = true;
      for (const [n, val] of values) {
        const x = $<HTMLFormElement>('real-found')?.elements.namedItem(n) as HTMLInputElement | null;
        if (x) x.value = val;
      }
    }
    return;
  }
  if (fid === 'pay-someone' || fid === 'pay-member') {
    const r = await busy('Sealing the draft to the identity…', () => c.ask<Done>('money pay', { identity: form.dataset.identity, to: words(d.get('to')), value: words(d.get('value')), unit: words(d.get('unit')), whatFor: String(d.get('whatFor') ?? '') }), form);
    if (r) say('done', v.lines(r.lines), form);
    return;
  }
  if (fid === 'anchor-offers') {
    const service = words(d.get('service'));
    const act = String(d.get('act') ?? '');
    const r = await busy('Reading the service’s standing offer…', () => c.ask<Parameters<typeof v.anchorOffers>[3]>('money offers', { service }), form);
    if (r) fill('e-anchor-offer', v.anchorOffers(form.dataset.collective!, act, service, r, units ?? []));
    return;
  }
  if (form.classList.contains('anchor-ask')) {
    const tier = Number(d.get('tier') ?? 0);
    const r = await busy('Making the blind and sealing the draft…', () => c.ask<Done>('money anchor', { identity: state.acting, collective: form.dataset.collective, act: form.dataset.act, service: form.dataset.service, offer: form.dataset.offer, tier }), form);
    if (r) {
      say('done', v.lines(r.lines), form);
      fill('e-anchors', v.anchors(await c.ask('money anchors', { collective: form.dataset.collective })));
    }
    return;
  }
  if (fid === 'real-found' || fid === 'real-change' || fid === 'real-release') {
    const members = [...form.querySelectorAll<HTMLInputElement>('input[name=member]:checked')].map((x) => x.value);
    const typed = words(d.get('typed')).split(/\n+/).map((x) => x.trim()).filter(Boolean);
    const r = await busy('Making it, and reading it back…', () =>
      fid === 'real-found'
        ? c.ask<Review>('real found prepare', {
            name: words(d.get('name')),
            founder: words(d.get('founder')),
            members: [...members, ...typed],
            grid: grids.get('real-found'),
            words: words(d.get('words')),
          })
        : fid === 'real-change'
          ? c.ask<Review>('real change prepare', { collective: form.dataset.collective, members: [...members, ...typed], grid: grids.get('real-change') })
          : c.ask<Review>('real release prepare', { collective: form.dataset.collective, folder: String(d.get('folder') ?? ''), name: words(d.get('name')), version: words(d.get('version')) }),
    );
    if (r) {
      realReview = { plan: r.plan, digest: r.digest };
      say('', '');
      fill('e-real-review', `<div class="colroot">${reading(r.reading, r)}</div>`);
      $('e-real-review')?.scrollIntoView({ block: 'start' });
    }
    return;
  }
  // After Kišib: the new signing key's words, for an identity held here or a real collective (`src/kishib.ts`).
  if (fid === 'identity-renew' || fid === 'real-renew') {
    const id = fid === 'identity-renew' ? form.dataset.identity! : form.dataset.collective!;
    const r = await busy('Reading it from its homes, and checking the words…', () =>
      fid === 'identity-renew' ? c.ask<Done>('identity renew', { identity: id, words: words(d.get('words')) }) : c.ask<Done>('real collective renew', { collective: id, words: words(d.get('words')) }),
    );
    form.reset();
    if (r) {
      await refresh();
      if (fid === 'identity-renew') await drawRecord(id);
      say('done', v.done(r));
    }
    return;
  }
  if (fid === 'real-share-back') {
    const typed = [...form.querySelectorAll<HTMLInputElement>('input')].map((i) => i.value);
    const r = await busy('Checking the words…', () => c.ask<Done>('real share back', { collective: form.dataset.collective, member: form.dataset.member, typed }));
    if (r) {
      await refresh();
      say('done', v.done(r));
    }
    return;
  }
  if (fid === 'bring-collective') {
    const r = await busy('Reading the collective from its homes and relays…', () => c.ask<Done>('collective bring', { id: words(d.get('id')), name: words(d.get('name')) }));
    if (r) {
      form.reset();
      at.collective = r.acts[0];
    }
    return after(r);
  }
  if (fid === 'rely') {
    const identity = at.identity!;
    const r = await busy('Reading the act back…', () => c.ask<ActRead>('read act', { identity, act: words(d.get('act')) }), $('e-rely-shown'));
    if (r) fill('e-rely-shown', v.relyShown(identity, r));
    return;
  }
  if (fid === 'rely-sign') {
    const r = await busy('Signing the witness act…', () => c.ask<{ id: string }>('witness', { identity: form.dataset.identity, act: form.dataset.act, shown: WITNESS_EXPLANATION, typed: words(d.get('typed')) }), $('e-rely-shown'));
    if (r) {
      records.delete(form.dataset.identity!);
      fill('e-rely-shown', '');
      void drawRecord(form.dataset.identity!);
      say('done', `<strong>Witness act signed and sent.</strong><br>Act ${v.e(r.id)}.`, $('e-rely-shown'));
    }
    return;
  }
  if (fid === 'new-identity') {
    const r = await busy('Making the identity at its homes…', () => c.ask<Done>('identity', { name: words(d.get('name')), linked: d.get('linked') === 'on' }));
    if (r) {
      form.reset();
      at.identity = r.acts[0];
    }
    return after(r);
  }
  if (fid === 'desk-settings') {
    const r = await busy(
      'Asking each home who runs it…',
      () => c.ask('settings', { homes: linesOf(d.get('homes')), relays: linesOf(d.get('relays')), via: words(d.get('via')).split('\n').map((s) => s.trim()).filter(Boolean), drafts: words(d.get('drafts')) }),
      $('settings-status'),
    );
    if (r) {
      state = await c.ask<State>('state');
      say('done', 'Settings saved.', $('settings-status'));
    }
  }
});

// ---------------------------------------------------------------- start

async function start() {
  if (web) {
    await startWeb(web);
    return;
  }
  if (!window.isSecureContext || !crypto?.subtle) {
    app.innerHTML = `${v.top()}${v.note('error', 'This page keeps a key in the browser, which browsers allow only on the machine itself (http://127.0.0.1) or over https.')}`;
    return;
  }
  let keys: CryptoKeyPair;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', `This browser cannot make or keep an Ed25519 key (${v.e(err instanceof Error ? err.message : String(err))}). A recent Firefox, Safari or Chrome can; a private window may not keep it.`)}`;
    return;
  }
  try {
    c = await Client.open(keys);
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
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
    if (unpaired(err)) {
      app.innerHTML = v.pairing();
      return;
    }
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  app.innerHTML = v.frame();
  // With no agent yet, the first-use window shows; otherwise the Agents tab.
  try {
    await readDrafts();
    await draw();
  } catch (err) {
    fail(err);
  }
  opened();
}

/** The web client: the operations already run in this browser; no pairing, and the Collectives tab first (the Identities tab while none is brought). */
async function startWeb(w: Asker) {
  c = w;
  try {
    state = await c.ask<State>('state');
  } catch (err) {
    app.innerHTML = `${v.top()}${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  at.tab = state.identities.length ? 'collectives' : 'identities';
  app.innerHTML = v.frame();
  try {
    await draw();
  } catch (err) {
    fail(err);
  }
  opened();
}

/** What is looked for on opening, on a computer and on the web. */
function opened() {
  // On opening: an identity whose signing key was changed elsewhere (F335: a change of keys is done in Kišib), said.
  void c
    .ask<{ id: string; name: string; say: string }[]>('keys check')
    .then((xs) => {
      if (xs.length && !working) say('warn', xs.map((x) => `<strong>${v.e(x.name)}</strong>: ${v.e(x.say)}`).join('<br>'));
    })
    .catch(() => undefined);
  // On opening: answers waiting for proposals sent from here (H32), and the follow lists sealed to the identities held here (people cMIP draft 2).
  void gatherAll();
  void c
    .ask<{ read: number }>('real lists')
    .then(async (r) => {
      if (!r.read) return;
      state = await c.ask<State>('state');
      if (at.tab === 'collectives' && !working) await draw();
    })
    .catch(() => undefined);
}

// H18: a member's share shown here, hand to hand, rather than sealed to a one-time key.
app.addEventListener('change', async (ev) => {
  const el = ev.target as HTMLInputElement;
  if (el.name === 'actor' && el.closest('form#acting') && at.tab === 'publishing') {
    const r = await busy('Choosing who acts…', () => c.ask<{ lines: Line[] }>('publishing act as', { id: el.value }));
    if (r) {
      pubReview = null;
      await draw();
      say('done', v.lines(r.lines));
    }
    return;
  }
  if (el.id === 'acting-select') {
    const r = await busy('Acting as another identity…', () => c.ask('acting as', { id: el.value }));
    if (r) {
      await refresh();
      say('done', `Acting as ${v.e(state.identities.find((i) => i.id === state.acting)?.name ?? 'it')}.`);
    }
    return;
  }
  if (el.dataset.action !== 'real-byhand') return;
  try {
    await c.ask('real by hand', { act: el.dataset.act, member: el.dataset.member, on: el.checked });
    state = await c.ask<State>('state');
  } catch (err) {
    el.checked = !el.checked;
    fail(err);
  }
});

// H14, H26, H34: every fold opens and closes at the person's choice, remembered by the program ("What you may do for it" per collective, every other by its name).
app.addEventListener(
  'toggle',
  (ev) => {
    const el = ev.target as HTMLElement;
    if (!(el instanceof HTMLDetailsElement) || !el.dataset.fold) return;
    const key = el.dataset.fold;
    const open = el.open;
    if (el.id === 'e-may') {
      const hint = el.querySelector('summary .small');
      if (hint) hint.textContent = open ? 'Fold' : 'Unfold';
    }
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

// H32: answers to proposals sent from here are looked for by themselves, every 20 seconds and on opening; H33: proposals and shares to sign, while that view is open.
setInterval(() => {
  if (document.hidden) return;
  void gatherAll();
  if (at.tab === 'collectives' && at.collective === 'sign' && memberAwaits && !working) void readMember();
}, 20000);

/** Start the page: on a computer, paired with the program; with `o.web`, the web client, its operations run in this browser. */
export function begin(o: { web?: Asker } = {}) {
  web = o.web ?? null;
  v.setWeb(!!web);
  // Drafts from Claude are a computer's: the web client reads no drafts folder.
  if (!web) {
    setInterval(() => void watch(), 4000);
    document.addEventListener('visibilitychange', () => void watch());
    window.addEventListener('focus', () => void watch());
  }
  void start();
}
