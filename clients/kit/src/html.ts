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

// ---------------------------------------------------------------- names (H96)

/** What reading an identity's published name gave (H96). */
export type NameShown = { state: 'loading' } | { state: 'name'; name: string } | { state: 'none' } | { state: 'unreached' };

/** An identity's names as shown: the nickname given it here (the people cMIP's, sealed), and the name it published (the naming cMIP's). */
export interface Named {
  nick?: string | null;
  published?: NameShown;
}

/** The words for a published name's state, where there is no name to show. */
export const NAME_WORDS = { loading: 'Loading…', none: 'No name published', unreached: 'Name not reached' } as const;

/** The best single label for an identity: its nickname, else its published name, else null. */
export function nameOf(n: Named | null | undefined): string | null {
  return n?.nick?.trim() || (n?.published?.state === 'name' ? n.published.name : null);
}

/**
 * Its names, as HTML (H96): the nickname first; the published name beside
 * it, small and faint (never hidden, so a changed or copied name still
 * shows); with no nickname, the published name, or its state said.
 */
export function namesHtml(n: Named | null | undefined, o: { retry?: boolean } = {}): string {
  const nick = n?.nick?.trim() || null;
  const p = n?.published ?? { state: 'loading' as const };
  const pub =
    p.state === 'name'
      ? p.name
      : null;
  const state = p.state === 'name' ? '' : `<span class="k-pub k-state" data-k-name-state="${p.state}">${NAME_WORDS[p.state]}</span>${p.state === 'unreached' && o.retry !== false ? '<button type="button" class="k-retry" data-k-name-retry>Ask again</button>' : ''}`;
  if (nick) return `<span class="k-nick" dir="auto">${e(nick)}</span>${pub && pub !== nick ? ` <span class="k-pub" dir="auto">${e(pub)}</span>` : ''}`;
  if (pub) return `<span class="k-nick" dir="auto">${e(pub)}</span>`;
  return state;
}

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
  /** Its names as read (H96): the nickname given here, and the published name or its state. Where given, it is what is shown; else `name` and `ownName` are. */
  named?: Named | null;
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
  /** The app's own markup for it, already escaped (a reply's IDs as buttons, H95); `text` is then what it says in words. */
  html?: string;
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
  /**
   * The signer's own hint (Envelopes, the inside's field 9), as it wrote it:
   * shown faint, labelled as the signer's own, only where no clock stamped
   * the act (no `when`). Never a time the app vouches for, never used to
   * order anything (Envelopes rule 6, "Hints never decide").
   */
  hint?: string | null;
  /**
   * Where the feed is ordered by a clock and this act has no time yet: the
   * app's words for it ("not yet stamped by the Dubsar clock"), shown faint;
   * it is placed by its signer's own sequence until stamped (H110).
   */
  unstamped?: string | null;
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
  /**
   * Shown in the place of what it corrects (H103): the earlier versions,
   * the original first, each as signed, expanding above it when its
   * "Corrected" label is pressed. Only corrections signed by the
   * original's signer are shown so; any other is a reply.
   */
  earlier?: KitAct[];
}

/** The faint words on a card the suite's clock has not stamped yet, in a feed it orders (H110). */
export const NOT_STAMPED = 'not yet stamped by the Dubsar clock';

/** An identity's names from what an app gives: its `named` where given; else its `name` (a nickname where it differs from `ownName`) and `ownName`. */
export function namedOf(w: { name?: string | null; ownName?: string | null; named?: Named | null }): Named {
  if (w.named) return w.named;
  const nick = w.name && w.ownName && w.name !== w.ownName ? w.name : null;
  const pub = w.ownName ?? (nick ? null : w.name ?? null);
  return { nick, published: pub ? { state: 'name', name: pub } : { state: 'none' } };
}

/** One act's card: the signer's short ID and name top left, the act's short ID bottom right, each opening its own menu (click or tap; never hover). */
export function card(a: KitAct, o: { selected?: boolean } = {}): string {
  const s = a.signer;
  // H96: its names first (the nickname, the published name small and faint), its short ID under.
  const named = namedOf(s);
  const names = !nameOf(named) && s.collective && named.published?.state === 'none' ? '<span class="k-nick">a collective</span>' : namesHtml(named, { retry: false });
  const signer = `<button type="button" class="k-signer" data-k-menu="signer" aria-haspopup="menu"><span class="k-names k-nm">${names}</span>${a.of ? `<span class="k-of" dir="auto">of ${e(a.of)}</span>` : ''}${s.me ? '<span class="k-dn">you</span>' : ''}<span class="k-sid">${e(shortForm(s.form))}</span></button>`;
  const labels = (a.labels ?? []).map((l) => `<div class="k-label${l.tone === 'bad' ? ' k-bad' : l.tone === 'warn' ? ' k-warn' : ''}">${l.html ?? e(l.text)}</div>`).join('');
  const kind = a.kind ? `<span class="k-kind">${e(a.kind)}</span>` : '';
  const text = a.text || kind ? `<div class="k-txt" dir="auto">${kind}${e(a.text ?? '')}</div>` : '';
  const foot = `<div class="k-foot">${a.verified && !a.alarm ? '<span class="k-v" title="verified">✓</span>' : ''}${a.alarm ? `<span class="k-alarmline">${e(a.alarm)}</span>` : ''}<button type="button" class="k-actid" data-k-menu="act" aria-haspopup="menu">${e(shortForm(a.form))}</button></div>`;
  const hint = (!a.when && a.unstamped ? `<div class="k-hint k-unstamped">${e(a.unstamped)}</div>` : '') + (!a.when && a.hint ? `<div class="k-hint" title="Written by the signer when signing: not checked by anyone, and not used to order anything" dir="auto">the signer’s own hint: ${e(a.hint)}</div>` : '');
  // H103: a correction in the original's place, labelled Corrected; pressing it unfolds the earlier versions above, as signed.
  const earlier = a.earlier?.length
    ? `<div class="k-earlier" data-k-earlier hidden><div class="k-earlier-say">${a.earlier.length === 1 ? 'The original, as signed' : `The original and ${a.earlier.length - 1} earlier correction${a.earlier.length > 2 ? 's' : ''}, as signed, oldest first`}</div>${a.earlier.map((x) => card(x)).join('')}</div>`
    : '';
  const corrected = a.earlier?.length ? `<button type="button" class="k-corrected" data-k-corrected aria-expanded="false">Corrected</button>` : '';
  return `<article class="k-act${o.selected ? ' k-sel' : ''}${a.earlier?.length ? ' k-is-corrected' : ''}" data-k-act="${e(a.id)}" data-k-signer="${e(s.id)}">${earlier}${a.when ? `<span class="k-when">${e(a.when)}</span>` : ''}${signer}${corrected}${labels}${text}${a.html ?? ''}${hint}${foot}</article>`;
}

/**
 * A feed's acts, newest first, with corrections in place (H103): each act a
 * correction by its own signer replaced is shown as its latest version,
 * labelled Corrected, the earlier ones (the original first) unfolding above
 * it. A correction signed by anyone else stays where it is, as a reply.
 */
export function inPlace(acts: KitAct[]): KitAct[] {
  const byId = new Map(acts.map((a) => [a.id, a]));
  const rootOf = (a: KitAct): KitAct => {
    let r = a;
    const seen = new Set<string>();
    while (r.corrects && !seen.has(r.id)) {
      seen.add(r.id);
      const up = byId.get(r.corrects.id);
      if (!up || up.signer.id !== a.signer.id) break;
      r = up;
    }
    return r;
  };
  const groups = new Map<string, KitAct[]>();
  for (const a of acts) groups.set(rootOf(a).id, [...(groups.get(rootOf(a).id) ?? []), a]);
  const out: KitAct[] = [];
  const done = new Set<string>();
  for (const a of acts) {
    const g = groups.get(rootOf(a).id)!;
    if (g.length < 2) {
      out.push(a);
      continue;
    }
    const key = rootOf(a).id;
    if (done.has(key)) continue;
    done.add(key);
    // The newest shown (the feed is newest first), what it corrects said by its label; the others oldest first above it.
    const [latest, ...rest] = g;
    out.push({ ...latest, labels: (latest.labels ?? []).filter((l) => !/^correction of /i.test(l.text)), earlier: rest.reverse().map((x) => ({ ...x, labels: (x.labels ?? []).filter((l) => !/^(corrected by|correction of) /i.test(l.text)) })) });
  }
  return out;
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
  const n = nameOf(namedOf(w));
  return menu(`${n ? `${n} · ` : ''}${shortForm(w.form)}`, [
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
export function actMenu(app: string, a: KitAct, own: { before: MenuItem[]; after: MenuItem[] }, signs = true): string {
  const opens = a.corrects ? 'Open what it corrects' : 'Open what it answers';
  // An app that signs nothing everyday (Kišib, which only lists what its runner signed) offers no Rely, Anchor or Correct.
  const every: MenuItem[] = signs ? [{ key: 'rely', label: 'Rely on it' }, { key: 'anchor', label: 'Anchor it' }, ...(a.own ? [{ key: 'correct', label: 'Correct it' }] : [])] : [];
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

/**
 * The identity in use, top right: what opens the identity panel. A
 * collective acted as shows beside its member. Its name as read (H96):
 * "Loading…" while asked, "No name published" once its homes answered with
 * none, "Name not reached" where they could not be asked; never "No name"
 * for a name not read yet.
 */
export function meButton(o: { name: string | null; form: string; named?: Named | null; as?: { name: string | null; form: string; named?: Named | null } | null }): string {
  const shown = o.as ?? o;
  const n = namedOf(shown);
  const label = nameOf(n) ?? NAME_WORDS[n.published?.state === 'name' ? 'none' : (n.published?.state ?? 'loading')];
  return `<button type="button" class="k-me" data-k-open="identity" aria-haspopup="dialog" title="Identities"><span class="k-n">${e(label)}</span><span class="k-s">${e(shortForm(shown.form))}</span>${o.as ? `<span class="k-dot k-c k-alt">${e(initial(o.as.name, o.as.form))}</span>` : ''}<span class="k-dot">${e(initial(o.name, o.form))}</span></button>`;
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
  if (!c.placed) return `<p class="k-clock">No act shown here was stamped by ${e(c.name)}: in each signer’s own sequence, not a time.</p>`;
  return `<p class="k-clock">Ordered by ${e(c.name)}: its word on when it held each act${c.placed < c.shown ? `; ${c.shown - c.placed} not stamped, kept in their signer’s own order` : ''}.</p>`;
}

/** The typing box, at the bottom: options above (chips), the text, tools, the main button. */
export function typingBox(o: { id: string; placeholder: string; button: string; tools?: string; opts?: string; extra?: string; name?: string }): string {
  return `<form class="k-typing" id="${e(o.id)}" autocomplete="off">${o.opts ? `<div class="k-opts">${o.opts}</div>` : ''}${o.extra ?? ''}<div class="k-line"><textarea name="${e(o.name ?? 'text')}" rows="1" placeholder="${e(o.placeholder)}" autocomplete="off" autocapitalize="sentences" spellcheck="true"></textarea><div class="k-tools">${o.tools ?? ''}<button type="submit" class="k-btn k-p">${e(o.button)}</button></div></div></form>`;
}

// ---------------------------------------------------------------- disclaimers

/**
 * A disclaimer in one line; the "?" opens the rest. Never a finding number
 * (H76). The "?" only ever unfolds an explanation (H99); a line opening a
 * panel to work in is a `fold`, with a chevron. `mor`: What is MOR? beside
 * the "?" and in what it opens (H94).
 */
export function say(line: string, more: string[] | string, o: { mor?: boolean | 'offline' } = {}): string {
  const rest = Array.isArray(more) ? more.map((m) => `<p>${e(m)}</p>`).join('') : more;
  const mor = o.mor ? whatIsMor(o.mor === 'offline') : '';
  return `<details class="k-say"><summary>${e(line)}<span class="k-help" aria-label="more">?</span>${mor}</summary><div class="k-more-text">${rest}${o.mor ? `<p>${whatIsMor(o.mor === 'offline', true)}</p>` : ''}</div></details>`;
}

/** Where to learn what MOR is (H94): dubsar.org's front page. */
export const MOR_HOME = 'https://dubsar.org/';

/**
 * What is MOR? (H94): a button opening dubsar.org's front page in a new tab,
 * the app left as it was. `offline` (Nakišib, which never connects): the
 * address as text, to type on another device; nothing opened.
 */
export function whatIsMor(offline = false, long = false): string {
  if (offline) return `<span class="k-mor k-mor-text" data-k-mor>${long ? 'What is MOR? Read it at ' : 'What is MOR? '}<span class="k-mono">dubsar.org</span>${long ? ', on another device: this one never connects.' : ' (on another device)'}</span>`;
  return `<a class="k-mor" data-k-mor href="${MOR_HOME}" target="_blank" rel="noopener noreferrer">${long ? 'What is MOR? dubsar.org’s front page, in a new tab' : 'What is MOR?'}</a>`;
}

/**
 * A line opening a panel to work in (H99): a chevron, turning down when open;
 * never the "?", which only unfolds an explanation.
 */
export function fold(line: string, body: string, o: { open?: boolean; attrs?: string } = {}): string {
  return `<details class="k-fold"${o.open ? ' open' : ''}${o.attrs ? ` ${o.attrs}` : ''}><summary>${e(line)}<span class="k-chev" aria-hidden="true">›</span></summary><div class="k-fold-body">${body}</div></details>`;
}

/** A note the app says after something is done or refused. */
export const note = (kind: 'done' | 'error' | '', html: string) => `<div class="k-note${kind ? ` k-${kind}` : ''}" role="status">${html}</div>`;

// ---------------------------------------------------------------- the profile page

export interface Profile {
  who: KitWho;
  /** One line on where they live (and since when, where known). */
  lives: string;
  /** H100: the rails and currencies they are paid on, from their payee pointer, or that they publish none. */
  takes?: string | null;
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
  const n = namedOf(w);
  const name = nameOf(n) ?? shortForm(w.form);
  // H96: with a nickname, the name it published beside it, faint; its state said where it has none.
  const own = n.nick ? (n.published?.state === 'name' ? (n.published.name !== n.nick ? `calls itself “${n.published.name}”` : null) : n.published && n.published.state !== 'loading' ? NAME_WORDS[n.published.state] : null) : !nameOf(n) && n.published && n.published.state !== 'name' ? NAME_WORDS[n.published.state] : null;
  return `<div class="k-prof" data-k-profile="${e(w.id)}"><div class="k-row"><button type="button" class="k-btn k-q" data-k-back="profile">← Back</button></div>
<div class="k-hero"><span class="k-dot${w.collective ? ' k-c' : ''}">${e(initial(name, w.form))}</span><div class="k-grow"><h2 dir="auto">${e(name)}</h2>${own ? `<div class="k-own-name" dir="auto">${e(own)}</div>` : ''}<p class="k-soft">${e(p.lives)}</p>${p.takes ? `<p class="k-small k-soft" data-k-takes>${e(p.takes)}</p>` : ''}<span class="k-mono k-soft">${e(shortForm(w.form))}</span> <button type="button" class="k-btn k-q k-small" data-k-copy="${e(w.link)}">Copy ID link</button></div>
<div class="k-row">${p.actions.map((a) => `<button type="button" class="k-btn${a.primary ? ' k-p' : ''}" data-k-do="${e(a.key)}">${e(a.label)}</button>`).join('')}</div></div>
${p.trouble ? `<div class="k-alarmbox">${e(p.trouble)}</div>` : ''}
${feedBox({ id: 'k-profile-feed', cards: p.cards, empty: p.empty ?? 'Nothing found from them yet.' })}${p.clock ?? ''}
<p class="k-small k-soft">Full record in Kišib${p.record ? ` <span class="k-faint">· ${e(p.record)}</span>` : ''}</p></div>`;
}

// ---------------------------------------------------------------- the identity panel

export interface PanelIdentity {
  id: string;
  form: string;
  /** Its ID link (`mid1…?r=…`): Share your ID link, on the one in use (H88). */
  link?: string;
  name: string | null;
  /** Its names as read (H96), shown where given. */
  named?: Named | null;
  /** In use (and not acting as one of its collectives). */
  on: boolean;
  /** The collectives under it, which it can act as: the same gesture as switching. */
  collectives: { id: string; form: string; name: string | null; named?: Named | null; on: boolean; why?: string | null }[];
}

/**
 * The identity panel, opened from the identity top right: identities held,
 * the one in use marked; the collectives under each; + Add (make, bring,
 * use one from Kišib, left empty until the runner); each identity's menu
 * (`⋯`); the panel's foot for the app itself.
 */
export function identityPanel(o: { ids: PanelIdentity[]; adding: boolean; add: { key: string; label: string; say: string; empty?: boolean }[]; foot: string; inside?: string }): string {
  const row = (x: { id: string; form: string; name: string | null; named?: Named | null; on: boolean }, sub: boolean, owner: string, why?: string | null) =>
    `<div class="k-idline"><button type="button" class="k-idrow${x.on ? ' k-on' : ''}${sub ? ' k-sub' : ''}" data-k-use="${e(x.id)}"${sub ? ` data-k-under="${e(owner)}"` : ''}${x.on ? ' aria-current="true"' : ''}${why ? ' disabled' : ''}><span class="k-dot${sub ? ' k-c' : ''}${x.on ? '' : ' k-alt'}">${e(initial(x.name, x.form))}</span><span><span class="k-n k-names" dir="auto">${namesHtml(namedOf(x), { retry: false })}${sub ? '<span class="k-tagc">collective</span>' : ''}</span><br><span class="k-s">${e(shortForm(x.form))}</span>${why ? `<br><span class="k-small k-faint">${e(why)}</span>` : ''}</span></button>${sub ? '' : `<button type="button" class="k-more" data-k-idmenu="${e(x.id)}" aria-haspopup="menu" title="Its settings" aria-label="Its settings">${GEAR}</button>`}</div>`;
  // The one in use: its ID whole, Copy ID and Share your ID link (H88).
  const ids = o.ids.map((x) => row(x, false, x.id) + (x.on ? ownId({ form: x.form, link: x.link ?? x.form }) : '') + x.collectives.map((c) => row(c, true, x.id, c.why)).join('')).join('');
  const add = `<button type="button" class="k-idrow${o.adding ? ' k-on' : ''}" data-k-add="toggle"><span class="k-soft">+ Add</span></button>${
    o.adding
      ? `<div class="k-pane-in">${o.add.map((a) => `<button type="button" class="k-idrow" data-k-add="${e(a.key)}"${a.empty ? ' disabled' : ''}><span><span class="k-n">${e(a.label)}</span><br><span class="k-small k-soft">${e(a.say)}</span></span></button>`).join('')}</div>`
      : ''
  }`;
  return `<div class="k-panel" role="dialog" aria-label="Identities" data-k-panel="identity"><div class="k-ph"><h4>Identities</h4><span class="k-grow"></span>${CLOSE_X}</div>${ids || '<p class="k-small k-soft">No identity here yet.</p>'}${add}<div class="k-sepline"></div><div class="k-foot-note">${o.foot}</div>${o.inside ? `<div class="k-pane-in" data-k-inside>${o.inside}</div>` : ''}</div>`;
}

/** The × top right of every pop-up, sheet and panel (H91): it closes what it is in. */
export const CLOSE_X = '<button type="button" class="k-round k-x" data-k-close aria-label="Close">×</button>';

/** The small gear beside each identity held (H87): its settings (Name, Relays, Words, Line and homes, …, Remove). */
export const GEAR = '<svg class="k-gear" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

/**
 * One's own ID (H88): whole, with Copy ID and Share your ID link (the ID
 * with where it lives, so others find it). In the identity panel, on the
 * one in use, and at the end of making or bringing one.
 */
export function ownId(o: { form: string; link: string }): string {
  return `<div class="k-ownid" data-k-ownid><span class="k-mono k-idwhole">${e(o.form)}</span><div class="k-row"><button type="button" class="k-btn k-small" data-k-copy-id="${e(o.form)}">Copy ID</button><button type="button" class="k-btn k-small" data-k-share="${e(o.link)}">Share your ID link</button></div></div>`;
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
  /** Its names as read (H96): its nickname (the people cMIP's, sealed) and the name it published; shown where given. */
  named?: Named | null;
  /** Its display names, where they differ from the name. */
  names?: string[];
  collective?: boolean;
}

/** The label two contacts would share: their name. A faint short ID is added only where two collide (H57, H78). */
export function labelOf(c: Contact): string {
  return (c.named ? nameOf(c.named) : null) ?? c.name ?? c.names?.[0] ?? shortForm(c.form);
}

/** Names that collide in a list: shown with a faint short ID. */
export function colliding(cs: Contact[]): Set<string> {
  const seen = new Map<string, number>();
  for (const c of cs) seen.set(labelOf(c).toLowerCase(), (seen.get(labelOf(c).toLowerCase()) ?? 0) + 1);
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}

/**
 * The contacts panel, top left in every app (H100): the one list, names
 * first (the nickname, the published name faint), searched by nickname and
 * name; each with the app's action (Message) and Nickname… to add, change or
 * remove it (H109); the app's own lines below (add by ID, muted, publish).
 */
export function contactsPanel(o: { contacts: Contact[]; below: string; action?: string; nick?: boolean }): string {
  const rows = o.contacts
    .map((c) => {
      const n = c.named ?? namedOf({ name: c.name, ownName: c.names?.[0] ?? null });
      const words = [labelOf(c), n.nick ?? '', n.published?.state === 'name' ? n.published.name : '', ...(c.names ?? []), c.form].join(' ').toLowerCase();
      return `<div class="k-idline" data-k-contact="${e(c.id)}" data-k-name="${e(words)}"><button type="button" class="k-idrow" data-k-contact-open="${e(c.id)}"><span class="k-dot${c.collective ? ' k-c' : ''} k-alt">${e(initial(labelOf(c), c.form))}</span><span><span class="k-n k-names" dir="auto">${namesHtml(n, { retry: false })}${c.collective ? '<span class="k-tagc">collective</span>' : ''}</span><br><span class="k-s">${e(shortForm(c.form))}</span></span></button>${o.nick ? `<button type="button" class="k-btn k-q k-small" data-k-nick="${e(c.id)}" title="Your own name for it, sealed: only you see it">Nickname…</button>` : ''}${o.action ? `<button type="button" class="k-btn k-q k-small" data-k-contact-do="${e(c.id)}">${e(o.action)}</button>` : ''}</div>`;
    })
    .join('');
  return `<div class="k-panel k-left" role="dialog" aria-label="Contacts" data-k-panel="contacts"><div class="k-ph"><h4>Contacts</h4><span class="k-grow"></span><span class="k-small k-soft">${o.contacts.length}</span>${CLOSE_X}</div><input type="search" data-k-find placeholder="Find by nickname or name…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a contact">${rows || '<p class="k-small k-soft">Nobody yet.</p>'}<div class="k-sepline"></div>${o.below}</div>`;
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
  // The runner: the seal of Kišib's menu bar (H111), as its state shows it there: hollow while off, filled while on, a padlock while locked.
  runner: SVG('<path d="M24 8.5Q29 5.2 31.8 10.6Q37.8 10.2 37.4 16.2Q42.8 19 39.5 24Q42.8 29 37.4 31.8Q37.8 37.8 31.8 37.4Q29 42.8 24 39.5Q19 42.8 16.3 37.4Q10.2 37.8 10.6 31.8Q5.2 29 8.5 24Q5.2 19 10.6 16.2Q10.2 10.2 16.2 10.6Q19 5.2 24 8.5Z"/>'),
  runnerOn: SVG('<path d="M24 8.5Q29 5.2 31.8 10.6Q37.8 10.2 37.4 16.2Q42.8 19 39.5 24Q42.8 29 37.4 31.8Q37.8 37.8 31.8 37.4Q29 42.8 24 39.5Q19 42.8 16.3 37.4Q10.2 37.8 10.6 31.8Q5.2 29 8.5 24Q5.2 19 10.6 16.2Q10.2 10.2 16.2 10.6Q19 5.2 24 8.5Z" fill="currentColor" fill-opacity=".85"/>'),
  runnerLocked: SVG('<rect x="13" y="22" width="22" height="17" rx="3.5"/><path d="M17.5 22v-5a6.5 6.5 0 0 1 13 0v5"/><circle cx="24" cy="30.5" r="2"/>'),
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

/** A rule an app runs, as Rules I follow shows it (H93; `engine/rules.ts`). */
export interface KitRule {
  key: string;
  name: string;
  kind: string;
  does: string;
  text?: string;
  on: 'list' | 'here' | null;
}

/**
 * Rules I follow (H93): the cMIPs and Modules this app runs, each with where
 * it is followed: on your list (read by every app), in this app only, or not
 * yet (its acts unknown here, nothing signed under it), with the two ways to
 * approve it. In Settings, every app but Kišib and Nakišib.
 */
export function rulesPart(o: { app: string; rules: KitRule[]; problem: string | null; manage?: string }): string {
  const missing = o.rules.filter((r) => !r.on);
  const both = (key: string) =>
    `<button type="button" class="k-btn k-p k-small" data-k-rule="${e(key)}" data-k-rule-where="list">Add to my list</button><button type="button" class="k-btn k-small" data-k-rule="${e(key)}" data-k-rule-where="here">In ${e(o.app)} only</button>`;
  const row = (r: KitRule) => {
    const state = r.on === 'list' ? 'On your list: every app follows it' : r.on === 'here' ? `In ${o.app} only: the other apps still ask` : `Not followed yet: its acts are unknown here, and ${o.app} signs nothing under it`;
    const acts =
      r.on === 'list'
        ? ''
        : r.on === 'here'
          ? `<button type="button" class="k-btn k-p k-small" data-k-rule="${e(r.key)}" data-k-rule-where="list">Add to my list</button><button type="button" class="k-btn k-q k-small" data-k-rule-stop="${e(r.key)}">Stop following in ${e(o.app)}</button>`
          : both(r.key);
    return `<li class="k-rule${r.on ? '' : ' k-rule-not'}" data-k-rule-row="${e(r.key)}"><div class="k-rule-head"><b>${e(r.name)}</b> <span class="k-tagc">${e(r.kind)}</span></div><p class="k-small k-soft">${e(r.does)}</p>${r.text ? `<p class="k-small k-faint k-mono">${e(r.text)}</p>` : ''}<p class="k-small k-rule-on">${e(state)}</p>${acts ? `<div class="k-row">${acts}</div>` : ''}</li>`;
  };
  return `<section class="k-rules" data-k-rules-part>${say(`The rules ${o.app} runs, and whether you follow them.`, [
    `A rule here is a cMIP or a Module: a specification anyone may write, which ${o.app} carries in its build. You choose which you follow.`,
    `Add to my list: kept on your list of rules, sealed to this identity at its homes, and every app holding it reads it. In ${o.app} only: kept by ${o.app}; your list is unchanged, so the other apps still ask.`,
    `Until you follow a rule, what others did under it is shown unknown here, and ${o.app} signs nothing under it (Development rule 10).`,
  ])}${o.problem ? `<p class="k-small k-soft">${e(o.problem)}.</p>` : ''}${missing.length > 1 ? `<div class="k-row k-rules-all"><span class="k-small">${missing.length} not followed yet:</span>${both('*')}</div>` : ''}<ul class="k-rule-list">${o.rules.map(row).join('')}</ul>${o.manage ? `<p class="k-small k-soft">${e(o.manage)}</p>` : ''}</section>`;
}
