// Edubba's page (F333). Nothing here signs an act: it asks the program, shows
// the program's plain-words reading of what would be signed, and sends back
// a digest only when the owner presses the button that signs. The
// Constitution sub-tab is the collective client's own page logic
// (`clients/collective/src/page/mount.ts`), mounted here.

import { Client, Refused, type ActRead, type IdentityRecord, type ReleaseReview, type AgentDetails, type AgentView, type Constitution, type Done, type DraftView, type Permissions, type State } from './api.ts';
import { forgetKey, loadKey } from './keystore.ts';
import * as v from './view.ts';
import { mount, type Mounted } from '../../../collective/src/page/mount.ts';
import { reading } from '../../../collective/src/page/view.ts';
import type { Review } from '../../../collective/src/page/api.ts';
import { WITNESS_EXPLANATION } from '../../../genesis/src/witness.ts';

const app = document.getElementById('app')!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let c: Client;
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
      if (at.identity !== 'new') await drawRecord(at.identity, false);
      return;
    }
    case 'collectives': {
      if (!at.collective || (!['found', 'bring'].includes(at.collective) && !state.collectives.some((x) => x.id === at.collective))) at.collective = state.collectives[0]?.id ?? 'found';
      const brought = state.collectives.find((x) => x.id === at.collective)?.brought;
      body.innerHTML = `${v.collectiveList(state, at.collective)}<div class="detail" id="e-detail">${
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
    if (at.identity === id) fill('e-record', `<h3>Its record</h3>${v.note('error', v.e(err instanceof Error ? err.message : String(err)))}`);
  }
}

/**
 * What is being written or reviewed on the Identities tab (a folder chosen,
 * a release reviewed, an act read back), kept across a redraw, as notes on
 * drafts are: a new draft arriving must not lose them.
 */
function keepForms(): () => void {
  const ids = ['e-rely-shown', 'e-release-form', 'e-release-review'];
  const html = new Map(ids.map((i) => [i, $(i)?.innerHTML ?? '']));
  const values = new Map<string, string>();
  for (const f of ['rely', 'release-folder', 'release-prepare']) $<HTMLFormElement>(f)?.querySelectorAll<HTMLInputElement>('input,select,textarea').forEach((x) => values.set(`${f}:${x.name}`, x.value));
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

async function drawAct(id: string) {
  try {
    const p = await c.ask<Permissions>('collective permissions', { collective: id });
    if (at.collective === id) fill('e-perms', v.permissions(p, state.unfolded?.[id] !== false));
  } catch (err) {
    fill('e-perms', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
  try {
    const r = await c.ask<Parameters<typeof v.posts>[0]>('collective posts', { collective: id });
    if (at.collective === id) fill('e-posts', v.posts(r));
  } catch (err) {
    fill('e-posts', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
  }
}

async function refresh() {
  state = await c.ask<State>('state');
  await draw();
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
  // The collective client's page answers its own buttons.
  if (b.closest('[data-collective-root]')) return;
  const d = b.dataset;
  const agent = at.agent ?? undefined;
  switch (d.action) {
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
    case 'constitution': {
      const r = await busy('Reading its agreement in force…', () => c.ask<Constitution>('collective constitution', { collective: at.collective }));
      if (r) {
        say('', '');
        fill('e-dialog-body', v.constitution(state.collectives.find((x) => x.id === at.collective)?.name ?? '', r));
        $<HTMLDialogElement>('e-dialog')!.showModal();
      }
      break;
    }
    case 'dialog-close':
      $<HTMLDialogElement>('e-dialog')!.close();
      break;
    case 'confirm': {
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
      if (postReview) void c.ask('collective cancel', { plan: postReview.plan }).catch(() => undefined);
      postReview = null;
      fill('e-post-review', '');
      say('', 'Nothing was signed.');
      break;
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
      const ok = await copy(d.id ?? '');
      b.textContent = ok ? 'Copied' : 'Copy failed: select the fingerprint';
      setTimeout(() => (b.textContent = 'Copy ID'), 2000);
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
    case 'release-cancel':
      void c.ask('release cancel', { plan: d.plan }).catch(() => undefined);
      fill('e-release-review', '');
      say('', 'Nothing was signed.', $('e-release-review'));
      break;
    case 'release-sign': {
      const r = await busy('Signing the release and publishing its files…', () => c.ask<Done>('release confirm', { plan: d.plan, digest: d.digest }), $('e-release-review'));
      if (r) {
        records.delete(at.identity!);
        await refresh();
        say('done', v.done(r));
      }
      break;
    }
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
  if (form.id === 'pair') {
    try {
      await c.ask('pair', { code: $<HTMLInputElement>('pair-code')!.value, label: 'this browser' });
      await start();
      say('done', 'This browser is paired.');
    } catch (err) {
      fill('pair-status', v.note('error', v.e(err instanceof Error ? err.message : String(err))));
    }
    return;
  }
  if (form.classList.contains('send-back')) {
    return after(await busy('Sending it back to Claude…', () => c.ask<Done>('send back', { digest: form.dataset.digest, note: words(d.get('note')) })));
  }
  if (form.id === 'agent-add') {
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
  if (form.id === 'agent-prompt') {
    const r = await busy('Signing your prompt, sealing it to the agent; it is answering…', () => c.ask<Done>('agent prompt', { agent, text: String(d.get('text') ?? '') }));
    if (r) {
      await refresh();
      say('', '');
      say('done', v.done(r), $('e-agent-here'));
      $('e-prompt')?.scrollIntoView({ block: 'end' });
    }
    return;
  }
  if (form.id === 'agent-follow') {
    const r = await busy('Following…', () => c.ask('agent follow', { agent, id: words(d.get('who')), name: words(d.get('name')) }));
    if (r) await draw().catch(fail);
    return;
  }
  if (form.id === 'agent-key') {
    const own = d.get('own') === 'own';
    const r = await busy('Saving its key…', () => c.ask<{ last4: string | null }>('agent key', { agent, own, key: words(d.get('key')) }));
    form.reset();
    if (r) {
      await refresh();
      say('done', own ? `It uses a key of its own${r.last4 ? `, …${v.e(r.last4)}` : ''}.` : 'It uses the shared key.');
    }
    return;
  }
  if (form.id === 'machine-cap') {
    const r = await busy('Saving the cap…', () => c.ask('machine cap', { agent, callsPerDay: Number(words(d.get('callsPerDay'))), maxChars: Number(words(d.get('maxChars'))) }));
    if (r) await refresh();
    return;
  }
  if (form.id === 'machine-nudge') {
    return after(await busy('Signing your nudge; it is choosing…', () => c.ask<Done>('machine nudge', { agent, count: Number(words(d.get('count'))), context: words(d.get('context')) })));
  }
  if (form.id === 'collective-post') {
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
  if (form.id === 'bring-identity') {
    const r = await busy('Reading the identity from its homes, and checking the words…', () =>
      c.ask<Done>('bring', { name: words(d.get('name')), id: words(d.get('id')), words: words(d.get('words')), address: words(d.get('address')), linked: d.get('linked') === 'on' }),
    );
    if (r) {
      form.reset();
      at.identity = r.acts[0];
    }
    return after(r);
  }
  if (form.id === 'bring-collective') {
    const r = await busy('Reading the collective from its homes and relays…', () => c.ask<Done>('collective bring', { id: words(d.get('id')), name: words(d.get('name')) }));
    if (r) {
      form.reset();
      at.collective = r.acts[0];
    }
    return after(r);
  }
  if (form.id === 'rely') {
    const identity = at.identity!;
    const r = await busy('Reading the act back…', () => c.ask<ActRead>('read act', { identity, act: words(d.get('act')) }), $('e-rely-shown'));
    if (r) fill('e-rely-shown', v.relyShown(identity, r));
    return;
  }
  if (form.id === 'rely-sign') {
    const r = await busy('Signing the witness act…', () => c.ask<{ id: string }>('witness', { identity: form.dataset.identity, act: form.dataset.act, shown: WITNESS_EXPLANATION, typed: words(d.get('typed')) }), $('e-rely-shown'));
    if (r) {
      records.delete(form.dataset.identity!);
      fill('e-rely-shown', '');
      void drawRecord(form.dataset.identity!);
      say('done', `<strong>Witness act signed and sent.</strong><br>Act ${v.e(r.id)}.`, $('e-rely-shown'));
    }
    return;
  }
  if (form.id === 'release-folder') {
    const i = state.identities.find((x) => x.id === at.identity)!;
    const r = await busy('Looking at the folder…', () => c.ask<{ folder: string; how: 'git' | 'plain'; name: string; previous: string | null }>('release folder', { identity: i.id, folder: words(d.get('folder')) }), $('e-release-form'));
    if (r) {
      fill('e-release-review', '');
      fill('e-release-form', v.releaseForm(i, r));
    }
    return;
  }
  if (form.id === 'release-prepare') {
    const r = await busy(
      'Reading every file, locking each, and making the manifest…',
      () => c.ask<ReleaseReview>('release prepare', { identity: at.identity, folder: form.dataset.folder, name: words(d.get('name')), version: words(d.get('version')), previous: words(d.get('previous')) }),
      $('e-release-review'),
    );
    if (r) {
      fill('e-release-review', v.releaseReview(r));
      $('e-release-review')?.scrollIntoView({ block: 'start' });
    }
    return;
  }
  if (form.id === 'new-identity') {
    const r = await busy('Making the identity at its homes…', () => c.ask<Done>('identity', { name: words(d.get('name')), linked: d.get('linked') === 'on' }));
    if (r) {
      form.reset();
      at.identity = r.acts[0];
    }
    return after(r);
  }
  if (form.id === 'desk-settings') {
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
}

// H14: "What you may do for it" folds and unfolds at the person's choice, remembered per collective by the program.
app.addEventListener(
  'toggle',
  (ev) => {
    const el = ev.target as HTMLElement;
    if (!(el instanceof HTMLDetailsElement) || el.id !== 'e-may') return;
    const id = el.dataset.collective!;
    const open = el.open;
    const hint = el.querySelector('summary .small');
    if (hint) hint.textContent = open ? 'Fold' : 'Unfold';
    if ((state.unfolded?.[id] !== false) === open) return;
    state.unfolded = { ...(state.unfolded ?? {}), [id]: open };
    void c.ask('fold', { collective: id, open }).catch(fail);
  },
  true,
);

setInterval(() => void watch(), 4000);
document.addEventListener('visibilitychange', () => void watch());
window.addEventListener('focus', () => void watch());
void start();
