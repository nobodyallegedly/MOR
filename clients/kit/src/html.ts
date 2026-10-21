// The kit's pieces, as HTML strings: the same in every app. Everything that
// comes from an app, from relays or from a person is escaped here; `html`
// fields are an app's own markup, already escaped by it.
//
// Nothing here knows MOR: a piece is given plain words and IDs written for
// people, and draws them. What a click does is the app's (`dom.ts` hands
// each choice back to it).

import type { App } from './style.ts';

/** Escape for HTML text and attribute values. */
export const e = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * An ID written for people, short: its label and the three characters after
 * it, then its last three (`mid1qx7…m4k`, `mact1r8d…4kq`). Shown on cards and
 * in lists; the whole form is what is copied.
 */
export function shortForm(form: string): string {
  const one = form.indexOf('1');
  if (one < 0 || form.length < one + 10) return form;
  return `${form.slice(0, one + 4)}…${form.slice(-3)}`;
}

/** The first letter of a name, for its round mark. */
const initial = (name: string | null | undefined, id: string) => (name?.trim()?.[0] ?? id.replace(/^m\w*1/, '')[0] ?? '?').toUpperCase();

// ---------------------------------------------------------------- who and what

/** An identity as a card shows it. `name` is the name this app gives it (a contact's) or its display name; `ownName` its own display name, shown beneath when it differs. */
export interface KitWho {
  /** The ID, hexadecimal: what the app works with. */
  id: string;
  /** Its ID written for people (`mid1…`): what is copied. */
  form: string;
  /** Its ID link (`mid1…?r=…`, with where it lives): what "Copy ID link" copies. */
  link: string;
  name: string | null;
  ownName?: string | null;
  me?: boolean;
  followed?: boolean;
  muted?: boolean;
  /** A collective, marked as one. */
  collective?: boolean;
}

/** A quiet label on a card: answers…, correction of…, signed under a grant, a pick or a nudge and who gave it. `bad` is red: an alarm only. */
export interface KitLabel {
  text: string;
  tone?: 'warn' | 'bad';
}

/** An act as a card shows it. */
export interface KitAct {
  /** Its ID, hexadecimal. */
  id: string;
  /** Its ID written for people (`mact1…`): what "Copy act ID" copies. */
  form: string;
  signer: KitWho;
  /** A collective appended to an act in one's own name, shown only where the membership checks: "of Collective Y". */
  of?: string | null;
  /** When, in words, and by whose clock (the app's line says which). */
  when?: string | null;
  /** What it is, in a word or two, where it is not a plain post (a vow, a release, a display name…). */
  kind?: string | null;
  labels?: KitLabel[];
  text?: string | null;
  /** The app's own markup inside the card (pictures, a film, a sealed file), already escaped. */
  html?: string;
  /** Verified: one ✓. A void or contested act keeps its alarm line in red instead. */
  verified: boolean;
  alarm?: string | null;
  /** What it answers or corrects, so "Open what it answers or corrects" can open it. */
  answers?: { id: string; signer: string | null } | null;
  corrects?: { id: string; signer: string | null } | null;
  /** One's own act: "Correct it" shows. */
  own?: boolean;
}

/** One act's card: the signer's short ID and name top left, the act's short ID bottom right, each opening its own menu (click or tap; never hover). */
export function card(a: KitAct, o: { selected?: boolean } = {}): string {
  const s = a.signer;
  const name = s.name ?? (s.collective ? 'a collective' : '');
  const signer = `<button type="button" class="k-signer" data-k-menu="signer" aria-haspopup="menu"><span class="k-sid">${e(shortForm(s.form))}</span>${name ? `<span class="k-nm" dir="auto">${e(name)}</span>` : ''}${s.ownName && s.ownName !== s.name ? `<span class="k-dn" dir="auto">“${e(s.ownName)}”</span>` : ''}${a.of ? `<span class="k-of" dir="auto">of ${e(a.of)}</span>` : ''}${s.me ? '<span class="k-dn">you</span>' : ''}</button>`;
  const labels = (a.labels ?? []).map((l) => `<div class="k-label${l.tone === 'bad' ? ' k-bad' : l.tone === 'warn' ? ' k-warn' : ''}">${e(l.text)}</div>`).join('');
  const kind = a.kind ? `<span class="k-kind">${e(a.kind)}</span>` : '';
  const text = a.text || kind ? `<div class="k-txt" dir="auto">${kind}${e(a.text ?? '')}</div>` : '';
  const foot = `<div class="k-foot">${a.verified && !a.alarm ? '<span class="k-v" title="verified">✓</span>' : ''}${a.alarm ? `<span class="k-alarmline">${e(a.alarm)}</span>` : ''}<button type="button" class="k-actid" data-k-menu="act" aria-haspopup="menu">${e(shortForm(a.form))}</button></div>`;
  return `<article class="k-act${o.selected ? ' k-sel' : ''}" data-k-act="${e(a.id)}" data-k-signer="${e(s.id)}">${a.when ? `<span class="k-when">${e(a.when)}</span>` : ''}${signer}${labels}${text}${a.html ?? ''}${foot}</article>`;
}

// ---------------------------------------------------------------- menus

/** An item of a menu below its line: what changes something, the app's own. */
export interface MenuItem {
  key: string;
  label: string;
  /** A quiet word at the item's right. */
  hint?: string;
  disabled?: boolean;
  /** A line above this item. */
  line?: boolean;
}

/**
 * The signer's menu. Above the line, what you take, identical in every app
 * and never signing: Copy ID, Copy ID link, Open profile. Below, what
 * changes something: Follow (adds to contacts) and Mute, then the app's own.
 */
export function signerMenu(app: string, w: KitWho, own: MenuItem[]): string {
  const below: MenuItem[] = w.me
    ? own
    : [w.followed ? { key: 'unfollow', label: 'Following: remove from contacts' } : { key: 'follow', label: 'Follow: add to contacts' }, ...own, w.muted ? { key: 'unmute', label: 'Unmute' } : { key: 'mute', label: 'Mute' }];
  return menu(`${w.name ? `${w.name} · ` : ''}${shortForm(w.form)}`, [
    { key: 'copy-id', label: 'Copy ID' },
    { key: 'copy-link', label: 'Copy ID link' },
    { key: 'profile', label: 'Open profile' },
  ], app, below);
}

/**
 * The act's menu. Above the line, identical in every app: Copy act ID, Open
 * what it answers or corrects, Why it's valid. Below, the app's own around
 * what every app offers: Rely on it, Anchor it, and Correct it on one's own
 * acts.
 */
export function actMenu(app: string, a: KitAct, own: { before: MenuItem[]; after: MenuItem[] }): string {
  const opens = a.corrects ? 'Open what it corrects' : 'Open what it answers';
  const every: MenuItem[] = [{ key: 'rely', label: 'Rely on it' }, { key: 'anchor', label: 'Anchor it' }, ...(a.own ? [{ key: 'correct', label: 'Correct it' }] : [])];
  return menu(shortForm(a.form), [
    { key: 'copy-act', label: 'Copy act ID' },
    { key: 'open', label: opens, disabled: !a.answers && !a.corrects, hint: !a.answers && !a.corrects ? 'nothing' : undefined },
    { key: 'why', label: 'Why it’s valid' },
  ], app, [...own.before, ...every, ...own.after]);
}

function menu(title: string, take: MenuItem[], app: string, below: MenuItem[]): string {
  const item = (m: MenuItem) => `${m.line ? '<hr>' : ''}<button type="button" role="menuitem" data-k-item="${e(m.key)}"${m.disabled ? ' disabled' : ''}>${e(m.label)}${m.hint ? `<span class="k-k">${e(m.hint)}</span>` : ''}</button>`;
  return `<div class="k-pop" role="menu"><div class="k-t">${e(title)}</div>${take.map(item).join('')}${below.length ? `<hr><div class="k-own">${e(app)}’s own</div>${below.map(item).join('')}` : ''}</div>`;
}

// ---------------------------------------------------------------- the frame of a window

/** The top of a window: left (the app, or Contacts), the middle (a switch or tabs), right (the identity). */
export function top(o: { left: string; center?: string; right: string }): string {
  return `<header class="k-top">${o.left}<span class="k-grow"></span>${o.center ?? ''}<span class="k-grow"></span>${o.right}</header>`;
}

/** The app's mark: its icon and name. */
export function appMark(name: string, icon: string | null): string {
  return `<div class="k-app">${icon ? `<img src="${e(icon)}" alt="">` : ''}<span class="k-nm">${e(name)}</span></div>`;
}

/** A switch at the top (Dub: Public · Private · Purchases), each part with a count. */
export function switcher(parts: { key: string; label: string }[], on: string): string {
  return `<nav class="k-switch" aria-label="Views">${parts.map((p) => `<button type="button" data-k-part="${e(p.key)}" class="${p.key === on ? 'k-on' : ''}"${p.key === on ? ' aria-current="page"' : ''}>${e(p.label)}<span class="k-count" data-k-count="${e(p.key)}"></span></button>`).join('')}</nav>`;
}

/** The identity in use, top right: what opens the identity panel. A collective acted as shows beside its member. */
export function meButton(o: { name: string | null; form: string; as?: { name: string | null; form: string } | null }): string {
  const shown = o.as ?? o;
  return `<button type="button" class="k-me" data-k-open="identity" aria-haspopup="dialog" title="Identities"><span class="k-n">${e(shown.name ?? 'No name')}</span><span class="k-s">${e(shortForm(shown.form))}</span>${o.as ? `<span class="k-dot k-c k-alt">${e(initial(o.as.name, o.as.form))}</span>` : ''}<span class="k-dot">${e(initial(o.name, o.form))}</span></button>`;
}

/** Contacts, top left (Dub); a menu button. */
export function contactsButton(label = 'Contacts'): string {
  return `<button type="button" class="k-menu-btn" data-k-open="contacts" aria-haspopup="dialog"><span aria-hidden="true">☰</span><span class="k-l">${e(label)}</span></button>`;
}

// ---------------------------------------------------------------- tiles and their column

/** A tile's danger, 1 to 3: three bars, filled to the level. Never red. */
export const danger = (l: 1 | 2 | 3) => `<span class="k-dm k-l${l}" title="danger ${l} of 3" aria-label="danger ${l} of 3"><i></i><i></i><i></i></span>`;

export interface Tile {
  key: string;
  name: string;
  /** One line about it. */
  say: string;
  icon: keyof typeof ICONS;
  danger: 1 | 2 | 3;
  /** An alarm, in red: the only red on a home. */
  alert?: string | null;
}

/** A home: big tiles, an icon, a name, one line, danger marks. */
export function tiles(ts: Tile[]): string {
  return `<div class="k-home">${ts.map((t) => `<button type="button" class="k-tile k-d${t.danger}${t.alert ? ' k-alarm' : ''}" data-k-tile="${e(t.key)}">${ICONS[t.icon]}${danger(t.danger)}<h2>${e(t.name)}</h2><p>${e(t.say)}</p>${t.alert ? `<span class="k-alert">${e(t.alert)}</span>` : ''}</button>`).join('')}</div>`;
}

/** A column's entries: a heading, a line, or a part (with a quiet count). */
export type ColumnEntry = string | '-' | { key: string; label: string; k?: string | number };

/** A tile opened: its column on the left for its parts, the part on the right. On a phone, the column first, folding away once a part is chosen, with a back arrow. */
export function opened(column: ColumnEntry[], on: string | null, pane: string): string {
  const col = column
    .map((c) => (c === '-' ? '<div class="k-sep"></div>' : typeof c === 'string' ? `<h3>${e(c)}</h3>` : `<button type="button" data-k-col="${e(c.key)}" class="${c.key === on ? 'k-on' : ''}">${e(c.label)}${c.k != null ? `<span class="k-k">${e(c.k)}</span>` : ''}</button>`))
    .join('');
  return `<div class="k-body k-opened${on ? ' k-chosen' : ''}"><aside class="k-col">${col}</aside><section class="k-pane"><button type="button" class="k-back" data-k-back="column">← Back</button>${pane}</section></div>`;
}

// ---------------------------------------------------------------- the feed box

/** Lenses (or any choice) above a feed box. */
export function lenses(ls: { key: string; label: string }[], on: string, name = 'lens'): string {
  return `<div class="k-controls" role="tablist">${ls.map((l) => `<button type="button" role="tab" class="k-lens${l.key === on ? ' k-on' : ''}" data-k-${name}="${e(l.key)}" aria-selected="${l.key === on}">${e(l.label)}<span class="k-count" data-k-count="${e(l.key)}"></span></button>`).join('')}</div>`;
}

/** "Point at" and "filter by" (Ummia's Look, Dub's Relay lens): a row of chips under a quiet label. */
export function pointRow(label: string, chips: { key: string; label: string; on?: boolean }[], name = 'point'): string {
  return `<div class="k-point"><span class="k-lbl">${e(label)}</span>${chips.map((c) => `<button type="button" class="k-chip${c.on ? ' k-on' : ''}" data-k-${name}="${e(c.key)}" aria-pressed="${!!c.on}">${e(c.label)}</button>`).join('')}</div>`;
}

/** The feed box: fills its space, scrolls inside (never the page). One look everywhere. */
export function feedBox(o: { id: string; above?: string; cards: string; empty?: string; below?: string }): string {
  return `${o.above ?? ''}<div class="k-feedwrap"><div class="k-feed" id="${e(o.id)}" tabindex="0">${o.cards || `<p class="k-empty">${e(o.empty ?? 'Nothing yet.')}</p>`}</div>${o.below ?? ''}</div>`;
}

/**
 * Whose clock orders a feed, said under it (H54; the timestamp clock
 * Module): a clock the feed names, by its name; or, where none is named or
 * none stamped what is shown, each signer's own order, said as such.
 */
export function clockLine(c: { name: string; placed: number; shown: number } | null): string {
  if (!c) return `<p class="k-clock">Ordered by each signer’s own sequence: no clock is named, so this is not a time.</p>`;
  if (!c.placed) return `<p class="k-clock">No act shown here was stamped by ${e(c.name)}’s clock: in each signer’s own sequence, not a time.</p>`;
  return `<p class="k-clock">Ordered by ${e(c.name)}’s clock: its word on when it held each act${c.placed < c.shown ? `; ${c.shown - c.placed} not stamped, kept in their signer’s own order` : ''}.</p>`;
}

/** The typing box, at the bottom: options above (chips), the text, tools, the main button. */
export function typingBox(o: { id: string; placeholder: string; button: string; tools?: string; opts?: string; extra?: string; name?: string }): string {
  return `<form class="k-typing" id="${e(o.id)}" autocomplete="off">${o.opts ? `<div class="k-opts">${o.opts}</div>` : ''}${o.extra ?? ''}<div class="k-line"><textarea name="${e(o.name ?? 'text')}" rows="1" placeholder="${e(o.placeholder)}" autocomplete="off" autocapitalize="sentences" spellcheck="true"></textarea><div class="k-tools">${o.tools ?? ''}<button type="submit" class="k-btn k-p">${e(o.button)}</button></div></div></form>`;
}

// ---------------------------------------------------------------- disclaimers

/** A disclaimer in one line; the "?" opens the rest. Never a finding number (H76). */
export function say(line: string, more: string[] | string): string {
  const rest = Array.isArray(more) ? more.map((m) => `<p>${e(m)}</p>`).join('') : more;
  return `<details class="k-say"><summary>${e(line)}<span class="k-help" aria-label="more">?</span></summary><div class="k-more-text">${rest}</div></details>`;
}

/** A note the app says after something is done or refused. */
export const note = (kind: 'done' | 'error' | '', html: string) => `<div class="k-note${kind ? ` k-${kind}` : ''}" role="status">${html}</div>`;

// ---------------------------------------------------------------- the profile page

export interface Profile {
  who: KitWho;
  /** One line on where they live (and since when, where known). */
  lives: string;
  /** A red line, only when there is trouble (a contested identity, a key changed, homes that disagree). */
  trouble?: string | null;
  /** The buttons: Follow, Message, Pay; each may be left out by the app. */
  actions: { key: string; label: string; primary?: boolean }[];
  /** Their feed (or the thread with them), as a feed box's cards. */
  cards: string;
  empty?: string;
  /** "Full record in Kišib", quietly: what it says beside. */
  record?: string;
  clock?: string;
}

/** The profile page, light and friendly: name, their own display name beneath if it differs, where they live, the ID link, trouble only when there is, the buttons, their feed. */
export function profile(p: Profile): string {
  const w = p.who;
  const name = w.name ?? w.ownName ?? shortForm(w.form);
  return `<div class="k-prof" data-k-profile="${e(w.id)}"><div class="k-row"><button type="button" class="k-btn k-q" data-k-back="profile">← Back</button></div>
<div class="k-hero"><span class="k-dot${w.collective ? ' k-c' : ''}">${e(initial(name, w.form))}</span><div class="k-grow"><h2 dir="auto">${e(name)}</h2>${w.ownName && w.ownName !== name ? `<div class="k-own-name" dir="auto">calls itself “${e(w.ownName)}”</div>` : ''}<p class="k-soft">${e(p.lives)}</p><span class="k-mono k-soft">${e(shortForm(w.form))}</span> <button type="button" class="k-btn k-q k-small" data-k-copy="${e(w.link)}">Copy ID link</button></div>
<div class="k-row">${p.actions.map((a) => `<button type="button" class="k-btn${a.primary ? ' k-p' : ''}" data-k-do="${e(a.key)}">${e(a.label)}</button>`).join('')}</div></div>
${p.trouble ? `<div class="k-alarmbox">${e(p.trouble)}</div>` : ''}
${feedBox({ id: 'k-profile-feed', cards: p.cards, empty: p.empty ?? 'Nothing found from them yet.' })}${p.clock ?? ''}
<p class="k-small k-soft">Full record in Kišib${p.record ? ` <span class="k-faint">· ${e(p.record)}</span>` : ''}</p></div>`;
}

// ---------------------------------------------------------------- the identity panel

export interface PanelIdentity {
  id: string;
  form: string;
  name: string | null;
  /** In use (and not acting as one of its collectives). */
  on: boolean;
  /** The collectives under it, which it can act as: the same gesture as switching. */
  collectives: { id: string; form: string; name: string | null; on: boolean; why?: string | null }[];
}

/**
 * The identity panel, opened from the identity top right: identities held,
 * the one in use marked; the collectives under each; + Add (make, bring,
 * use one from Kišib, left empty until the runner); each identity's menu
 * (`⋯`); the panel's foot for the app itself.
 */
export function identityPanel(o: { ids: PanelIdentity[]; adding: boolean; add: { key: string; label: string; say: string; empty?: boolean }[]; foot: string; inside?: string }): string {
  const row = (x: { id: string; form: string; name: string | null; on: boolean }, sub: boolean, owner: string, why?: string | null) =>
    `<div class="k-idline"><button type="button" class="k-idrow${x.on ? ' k-on' : ''}${sub ? ' k-sub' : ''}" data-k-use="${e(x.id)}"${sub ? ` data-k-under="${e(owner)}"` : ''}${x.on ? ' aria-current="true"' : ''}${why ? ' disabled' : ''}><span class="k-dot${sub ? ' k-c' : ''}${x.on ? '' : ' k-alt'}">${e(initial(x.name, x.form))}</span><span><span class="k-n" dir="auto">${e(x.name ?? 'No name')}${sub ? '<span class="k-tagc">collective</span>' : ''}</span><br><span class="k-s">${e(shortForm(x.form))}</span>${why ? `<br><span class="k-small k-faint">${e(why)}</span>` : ''}</span></button>${sub ? '' : `<button type="button" class="k-more" data-k-idmenu="${e(x.id)}" aria-haspopup="menu" title="Its menu">⋯</button>`}</div>`;
  const ids = o.ids.map((x) => row(x, false, x.id) + x.collectives.map((c) => row(c, true, x.id, c.why)).join('')).join('');
  const add = `<button type="button" class="k-idrow${o.adding ? ' k-on' : ''}" data-k-add="toggle"><span class="k-soft">+ Add</span></button>${
    o.adding
      ? `<div class="k-pane-in">${o.add.map((a) => `<button type="button" class="k-idrow" data-k-add="${e(a.key)}"${a.empty ? ' disabled' : ''}><span><span class="k-n">${e(a.label)}</span><br><span class="k-small k-soft">${e(a.say)}</span></span></button>`).join('')}</div>`
      : ''
  }`;
  return `<div class="k-panel" role="dialog" aria-label="Identities" data-k-panel="identity">${ids || '<p class="k-small k-soft">No identity here yet.</p>'}${add}<div class="k-sepline"></div><div class="k-foot-note">${o.foot}</div>${o.inside ? `<div class="k-pane-in" data-k-inside>${o.inside}</div>` : ''}</div>`;
}

/** Remove, said plainly first: what goes, and what does not. */
export function removeSaid(app: string, name: string): string {
  return `<div class="k-box" data-k-remove><h4>Remove ${e(name)} from ${e(app)}?</h4><p class="k-small k-soft">${e(app)} forgets ${e(name)}’s signing words, and what it kept about it, on this device. ${e(name)} itself is not touched: its acts, its homes and the other apps keep it. To use it here again, bring it with its words.</p><div class="k-row"><button type="button" class="k-btn k-p" data-k-remove-yes>Remove it</button><button type="button" class="k-btn k-q" data-k-remove-no>Keep it</button></div></div>`;
}

// ---------------------------------------------------------------- contacts

export interface Contact {
  id: string;
  form: string;
  /** The name given here (sealed to oneself), else a display name. */
  name: string | null;
  /** Its display names, where they differ from the name. */
  names?: string[];
  collective?: boolean;
}

/** The label two contacts would share: their name. A faint short ID is added only where two collide (H57, H78). */
export function labelOf(c: Contact): string {
  return c.name ?? c.names?.[0] ?? 'No name';
}

/** Names that collide in a list: shown with a faint short ID. */
export function colliding(cs: Contact[]): Set<string> {
  const seen = new Map<string, number>();
  for (const c of cs) seen.set(labelOf(c).toLowerCase(), (seen.get(labelOf(c).toLowerCase()) ?? 0) + 1);
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}

/** The contacts panel: one list, names first, searched by name; each with Message; the app's own lines below (add by ID, muted, publish). */
export function contactsPanel(o: { contacts: Contact[]; below: string; action?: string }): string {
  const twice = colliding(o.contacts);
  const rows = o.contacts
    .map((c) => `<div class="k-idline" data-k-contact="${e(c.id)}" data-k-name="${e([labelOf(c), ...(c.names ?? [])].join(' ').toLowerCase())}"><button type="button" class="k-idrow" data-k-contact-open="${e(c.id)}"><span class="k-dot${c.collective ? ' k-c' : ''} k-alt">${e(initial(labelOf(c), c.form))}</span><span><span class="k-n" dir="auto">${e(labelOf(c))}${c.collective ? '<span class="k-tagc">collective</span>' : ''}</span><br><span class="k-s">${e(shortForm(c.form))}${twice.has(labelOf(c).toLowerCase()) ? '' : ''}</span></span></button>${o.action ? `<button type="button" class="k-btn k-q k-small" data-k-contact-do="${e(c.id)}">${e(o.action)}</button>` : ''}</div>`)
    .join('');
  return `<div class="k-panel k-left" role="dialog" aria-label="Contacts" data-k-panel="contacts"><div class="k-row"><h4>Contacts</h4><span class="k-grow"></span><span class="k-small k-soft">${o.contacts.length}</span></div><input type="search" data-k-find placeholder="Find a contact by name…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a contact">${rows || '<p class="k-small k-soft">Nobody yet.</p>'}<div class="k-sepline"></div>${o.below}</div>`;
}

/** The suggestions for @ or To…: names first, a faint short ID only where two names collide. */
export function suggestions(cs: Contact[], title = 'Contacts'): string {
  const twice = colliding(cs);
  return `<div class="k-pop" role="listbox" data-k-suggest><div class="k-t">${e(title)}</div>${cs
    .map((c, i) => `<button type="button" role="option" data-k-pick="${e(c.id)}"${i === 0 ? ' aria-selected="true"' : ''}><span class="k-dot${c.collective ? ' k-c' : ''} k-alt">${e(initial(labelOf(c), c.form))}</span><span dir="auto">${e(labelOf(c))}</span>${twice.has(labelOf(c).toLowerCase()) ? `<span class="k-k">${e(shortForm(c.form))}</span>` : ''}</button>`)
    .join('')}</div>`;
}

// ---------------------------------------------------------------- icons (drawn for the mockups; one stroke weight, the app's pastel)

const SVG = (d: string) => `<svg class="k-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONS = {
  identities: SVG('<circle cx="24" cy="17" r="8"/><path d="M9 41c2-9 8-13 15-13s13 4 15 13"/>'),
  runner: SVG('<rect x="7" y="13" width="20" height="22" rx="4"/><path d="M27 20h6a6 6 0 0 1 0 12h-6M33 26h8M14 22h6M14 27h6"/>'),
  paper: SVG('<path d="M13 6h16l8 8v28H13z"/><path d="M29 6v8h8M18 22h14M18 28h14M18 34h9"/>'),
  collectives: SVG('<circle cx="16" cy="18" r="5.5"/><circle cx="32" cy="18" r="5.5"/><circle cx="24" cy="12" r="5"/><path d="M6 38c1-7 5-10 10-10s7 2 8 5c1-3 3-5 8-5s9 3 10 10"/>'),
  waiting: SVG('<path d="M14 6h20M14 42h20M16 6c0 10 16 12 16 18S16 32 16 42M32 6c0 10-16 12-16 18s16 8 16 18"/>'),
  account: SVG('<rect x="8" y="9" width="32" height="30" rx="4"/><path d="M8 17h32M15 25h8M15 31h12M31 25h3M31 31h3"/>'),
  lanes: SVG('<path d="M14 42 19 6M34 42 29 6M24 10v4M24 21v5M24 33v6"/>'),
  settings: SVG('<path d="M10 14h28M10 24h28M10 34h28"/><circle cx="18" cy="14" r="3.5"/><circle cx="31" cy="24" r="3.5"/><circle cx="22" cy="34" r="3.5"/>'),
  agents: SVG('<rect x="10" y="12" width="28" height="24" rx="7"/><circle cx="19" cy="24" r="2.4"/><circle cx="29" cy="24" r="2.4"/><path d="M24 6v6M6 22v6M42 22v6"/>'),
  publishing: SVG('<path d="M8 30v8h32v-8M24 30V8M15 17l9-9 9 9"/>'),
  vows: SVG('<circle cx="24" cy="22" r="12"/><path d="M18 22l4 4 8-8M17 33l-3 9 10-5 10 5-3-9"/>'),
  look: SVG('<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/>'),
  discuss: SVG('<path d="M6 10h24v16H16l-6 6v-6H6z"/><path d="M34 18h8v16h-4v6l-6-6H22v-4"/>'),
  publish: SVG('<path d="M10 40h28M24 32V8M15 17l9-9 9 9"/>'),
  choose: SVG('<path d="M8 12l3 3 6-6M8 24l3 3 6-6M8 36l3 3 6-6M22 12h18M22 24h18M22 36h18"/>'),
} as const;

// ---------------------------------------------------------------- the slot for another app's panel

/** The words on a slot's frame: who drew what is inside, and that the host cannot read or change it. */
export function slotWords(by: string, host: string): string {
  return `Drawn by ${by} · ${host} cannot read or change this frame`;
}

export type { App };
