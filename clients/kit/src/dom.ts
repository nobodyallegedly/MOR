// The kit's pieces in the browser: menus opened by a click or a tap (never
// a hover), closed by a click elsewhere or Escape; the pop-up thread with
// its back arrow; panels; the column folding away on a phone; names offered
// for @ and To…; the slot for another app's panel. Each choice is handed
// back to the app, which alone knows what it means.

import { actMenu, colliding, labelOf, signerMenu, suggestions, slotWords, type Contact, type KitAct, type MenuItem } from './html.ts';
import type { App } from './style.ts';

/** What an app answers for the cards it shows. */
export interface CardHost {
  /** The app's name, as its menus say "Dub's own". */
  app: string;
  /** The act a card shows, by its ID (the app keeps what it drew). */
  act(id: string): KitAct | undefined;
  /** The app's own items in the signer's menu, after Follow and before Mute. */
  signerItems(a: KitAct): MenuItem[];
  /** The app's own items in the act's menu, around Rely on it, Anchor it and Correct it. */
  actItems(a: KitAct): { before: MenuItem[]; after: MenuItem[] };
  /** Every choice the kit does not take itself: profile, open, why, follow, mute, rely, anchor, correct, the app's own. */
  choose(key: string, a: KitAct, card: HTMLElement): void;
  /** Whether the app signs everyday acts: false leaves Rely on it, Anchor it and Correct it out (Kišib). */
  signs?: boolean;
}

/** Copy words to the clipboard; false where the browser refuses. */
export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // An older or stricter browser: a hidden field, selected and copied.
    try {
      const t = document.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', '');
      t.className = 'k-offscreen';
      document.body.append(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

let openMenu: { pop: HTMLElement; button: HTMLElement; done?: () => void } | null = null;

/** Close the menu open, if any. */
export function closeMenu(): void {
  if (!openMenu) return;
  openMenu.pop.remove();
  openMenu.button.classList.remove('k-open');
  openMenu.button.setAttribute('aria-expanded', 'false');
  openMenu.done?.();
  openMenu = null;
}

/**
 * Place a pop next to the button that opened it, inside the window: below
 * it where there is room, above otherwise; on a phone, the style lays it as
 * a sheet at the bottom instead.
 */
function place(pop: HTMLElement, button: HTMLElement, prefer: 'below' | 'above') {
  const r = button.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let left = prefer === 'above' ? r.right - w : r.left;
  left = Math.max(8, Math.min(left, vw - w - 8));
  let topAt = prefer === 'below' ? r.bottom + 6 : r.top - h - 6;
  if (topAt + h > vh - 8) topAt = r.top - h - 6;
  if (topAt < 8) topAt = Math.min(r.bottom + 6, vh - h - 8);
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(Math.max(8, topAt))}px`;
}

/** Open a pop of HTML next to a button; its items handed to `pick`. */
export function popAt(button: HTMLElement, html: string, prefer: 'below' | 'above', pick: (key: string, item: HTMLButtonElement) => void, done?: () => void): HTMLElement {
  closeMenu();
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const pop = holder.firstElementChild as HTMLElement;
  (button.closest('.k-page') ?? document.body).append(pop);
  place(pop, button, prefer);
  button.classList.add('k-open');
  button.setAttribute('aria-expanded', 'true');
  openMenu = { pop, button, done };
  pop.addEventListener('click', (ev) => {
    const item = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-k-item]');
    if (!item || item.disabled) return;
    ev.stopPropagation();
    pick(item.dataset.kItem!, item);
  });
  pop.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({ preventScroll: true });
  return pop;
}

/** Say "Copied" (or why not) on the item, then close. */
async function copied(item: HTMLButtonElement, text: string) {
  const ok = await copy(text);
  const k = document.createElement('span');
  k.className = 'k-k';
  k.textContent = ok ? 'copied' : 'select it: copying refused';
  item.querySelector('.k-k')?.remove();
  item.append(k);
  item.dataset.kCopied = ok ? 'yes' : 'no';
  setTimeout(closeMenu, ok ? 450 : 2400);
}

/**
 * Cards inside `root` (and any pop-up thread) get their two menus: the
 * signer's (its short ID and name, top left) and the act's (its short ID,
 * bottom right). The top halves are the kit's and identical everywhere; the
 * bottom halves the app's.
 */
export function attachCards(root: HTMLElement, host: CardHost): void {
  root.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-k-menu]');
    if (!b) return;
    const card = b.closest<HTMLElement>('[data-k-act]');
    if (!card) return;
    ev.stopPropagation();
    if (openMenu?.button === b) return closeMenu();
    const a = host.act(card.dataset.kAct!);
    if (!a) return;
    const which = b.dataset.kMenu as 'signer' | 'act';
    card.classList.add('k-sel');
    const html = which === 'signer' ? signerMenu(host.app, a.signer, host.signerItems(a)) : actMenu(host.app, a, host.actItems(a), host.signs !== false);
    popAt(
      b,
      html,
      which === 'signer' ? 'below' : 'above',
      (key, item) => {
        if (key === 'copy-id') return void copied(item, a.signer.form);
        if (key === 'copy-link') return void copied(item, a.signer.link);
        if (key === 'copy-act') return void copied(item, a.form);
        closeMenu();
        host.choose(key, a, card);
      },
      () => card.classList.remove('k-sel'),
    );
  });
}

// ---------------------------------------------------------------- closing what is open

/** One listener on the document: a click outside a pop or Escape closes it (then a panel, then the pop-up thread). */
export function attachClosing(doc: Document = document): void {
  doc.addEventListener('click', (ev) => {
    if (!openMenu) return;
    const t = ev.target as HTMLElement;
    if (openMenu.pop.contains(t) || openMenu.button.contains(t)) return;
    closeMenu();
  });
  doc.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (openMenu) return closeMenu();
    if (panel) return closePanel();
    popup?.close();
  });
}

// ---------------------------------------------------------------- panels (identities, contacts)

let panel: { el: HTMLElement; shade: HTMLElement; done?: () => void } | null = null;

/** Open a panel (its HTML from `identityPanel` or `contactsPanel`) over a light shade; one at a time. */
export function openPanel(page: HTMLElement, html: string, done?: () => void): HTMLElement {
  closePanel();
  const shade = document.createElement('div');
  shade.className = 'k-shade k-light';
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const el = holder.firstElementChild as HTMLElement;
  page.append(shade, el);
  shade.addEventListener('click', () => closePanel());
  panel = { el, shade, done };
  const find = el.querySelector<HTMLInputElement>('[data-k-find]');
  find?.addEventListener('input', () => {
    const q = find.value.trim().toLowerCase();
    el.querySelectorAll<HTMLElement>('[data-k-contact]').forEach((r) => (r.hidden = !!q && !r.dataset.kName!.includes(q)));
  });
  return el;
}

/** Draw the panel open again in place (after a change), keeping it open. */
export function redrawPanel(html: string): HTMLElement | null {
  if (!panel) return null;
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const el = holder.firstElementChild as HTMLElement;
  panel.el.replaceWith(el);
  panel.el = el;
  return el;
}

export function closePanel(): void {
  if (!panel) return;
  closeMenu();
  panel.el.remove();
  panel.shade.remove();
  panel.done?.();
  panel = null;
}

export const panelOpen = () => panel?.el ?? null;

// ---------------------------------------------------------------- the pop-up thread

/**
 * The pop-up thread: what an act answers or corrects, as a small feed box in
 * a pop-up. Opening something inside replaces its content, with a back
 * arrow; Back returns step by step; closing returns to where you were.
 */
export class Popup {
  private stack: { title: string; html: string }[] = [];
  private shade: HTMLElement | null = null;
  private box: HTMLElement | null = null;
  private scroll: { el: Element; top: number }[] = [];

  constructor(
    private page: HTMLElement,
    /** Called with the body each time content is drawn, so the app can fill in what it reads late. */
    private drawn: (body: HTMLElement) => void = () => undefined,
  ) {}

  get open(): boolean {
    return !!this.box;
  }

  /** Open with this content, or, when open, put it in place of what is shown (Back returns). */
  show(title: string, html: string): HTMLElement {
    if (!this.box) {
      // A note of something done gives way to the pop-up; a refusal stays.
      for (const st of this.page.querySelectorAll('.k-status')) if (st.querySelector('.k-done')) st.innerHTML = '';
      // Where you were, to return to it.
      this.scroll = [...this.page.querySelectorAll('.k-feed')].map((el) => ({ el, top: el.scrollTop }));
      this.shade = document.createElement('div');
      this.shade.className = 'k-shade';
      this.shade.addEventListener('click', () => this.close());
      this.box = document.createElement('div');
      this.box.className = 'k-modal';
      this.box.setAttribute('role', 'dialog');
      this.box.setAttribute('aria-modal', 'true');
      this.box.addEventListener('click', (ev) => {
        const t = ev.target as HTMLElement;
        if (t.closest('[data-k-popup="back"]')) this.back();
        else if (t.closest('[data-k-popup="close"]')) this.close();
      });
      this.page.append(this.shade, this.box);
      popup = this;
    }
    this.stack.push({ title, html });
    return this.draw();
  }

  /** Replace what is shown now, without a new step (content read late). */
  replace(html: string): HTMLElement | null {
    if (!this.box || !this.stack.length) return null;
    this.stack[this.stack.length - 1].html = html;
    return this.draw();
  }

  back(): void {
    if (this.stack.length <= 1) return this.close();
    this.stack.pop();
    this.draw();
  }

  close(): void {
    closeMenu();
    this.box?.remove();
    this.shade?.remove();
    this.box = this.shade = null;
    this.stack = [];
    for (const s of this.scroll) s.el.scrollTop = s.top;
    if (popup === this) popup = null;
  }

  private draw(): HTMLElement {
    const now = this.stack[this.stack.length - 1];
    const back = this.stack.length > 1 ? '<button type="button" class="k-round" data-k-popup="back" aria-label="Back">←</button>' : '';
    this.box!.innerHTML = `<div class="k-mh">${back}<h3 dir="auto">${escapeText(now.title)}</h3><button type="button" class="k-round" data-k-popup="close" aria-label="Close">×</button></div><div class="k-mbody">${now.html}</div>`;
    const body = this.box!.querySelector<HTMLElement>('.k-mbody')!;
    this.drawn(body);
    return body;
  }
}

let popup: Popup | null = null;

const escapeText = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// ---------------------------------------------------------------- the clock's time on cards drawn

/** The act IDs of the cards drawn in `root` that show no time yet. */
export function cardsUntimed(root: ParentNode): string[] {
  return [...root.querySelectorAll<HTMLElement>('article.k-act[data-k-act]')].filter((a) => !a.querySelector('.k-when')).map((a) => a.dataset.kAct!);
}

/**
 * The clock's time on cards already drawn, by act ID, as the app read it
 * ("… · by the Dubsar clock"): put where a card shows it, faint, top right,
 * and the signer's own hint taken away there (a card shows the clock's time,
 * or else the signer's hint, or nothing).
 */
export function stampCards(root: ParentNode, words: Record<string, string>): void {
  for (const a of root.querySelectorAll<HTMLElement>('article.k-act[data-k-act]')) {
    const w = words[a.dataset.kAct ?? ''];
    if (!w || a.querySelector('.k-when')) continue;
    const s = document.createElement('span');
    s.className = 'k-when';
    s.textContent = w;
    a.prepend(s);
    a.querySelectorAll('.k-hint').forEach((h) => h.remove());
  }
}

// ---------------------------------------------------------------- the column, on a phone

/** A tile opened: choosing a part folds the column away on a phone; the back arrow brings it again. */
export function attachColumn(root: HTMLElement, chose: (key: string) => void): void {
  root.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    const c = t.closest<HTMLElement>('[data-k-col]');
    const opened = t.closest<HTMLElement>('.k-opened');
    if (c && opened) {
      opened.querySelectorAll('[data-k-col]').forEach((x) => x.classList.toggle('k-on', x === c));
      opened.classList.add('k-chosen');
      chose(c.dataset.kCol!);
      return;
    }
    if (t.closest('[data-k-back="column"]') && opened) opened.classList.remove('k-chosen');
  });
}

// ---------------------------------------------------------------- names, for @ and To…

/**
 * Offer one's contacts by name where an identity is named: in a text, after
 * `@` (a mention); or in a field (To…, Cc), the whole field. Names first,
 * never hashes; a faint short ID only where two names collide (H57, H78).
 * The app's own list, drawn by the app, never the browser's autofill.
 * A name chosen is handed to `picked`; in a field, its ID is kept on the
 * field (`data-k-id`) while the name stays what is shown.
 */
export function attachNames(field: HTMLInputElement | HTMLTextAreaElement, contacts: () => Contact[], o: { mention: boolean; picked: (c: Contact) => void; title?: string }): void {
  field.setAttribute('autocomplete', 'off');
  field.setAttribute('autocorrect', 'off');
  let shown: Contact[] = [];
  let at = 0;
  const query = (): string | null => {
    const v = field.value;
    if (!o.mention) return v.trim();
    const caret = field.selectionStart ?? v.length;
    const m = /(^|\s)@([^\s@]*)$/.exec(v.slice(0, caret));
    return m ? m[2] : null;
  };
  const close = () => {
    if (openMenu?.button === field) closeMenu();
    shown = [];
  };
  const choose = (c: Contact) => {
    if (o.mention) {
      const caret = field.selectionStart ?? field.value.length;
      const before = field.value.slice(0, caret).replace(/@([^\s@]*)$/, `@${labelOf(c)} `);
      field.value = before + field.value.slice(caret);
      field.setSelectionRange(before.length, before.length);
    } else {
      field.value = labelOf(c);
      field.dataset.kId = c.id;
    }
    close();
    field.focus();
    o.picked(c);
  };
  const offer = () => {
    const q = query();
    if (!o.mention) delete field.dataset.kId;
    if (q === null || (!o.mention && !q)) return close();
    const ql = q.toLowerCase();
    shown = contacts()
      .filter((c) => [labelOf(c), ...(c.names ?? [])].some((n) => n.toLowerCase().split(/\s+/).some((w) => w.startsWith(ql)) || n.toLowerCase().startsWith(ql)))
      .slice(0, 8);
    if (!shown.length) return close();
    at = 0;
    const pop = popAt(field, suggestions(shown, o.title ?? (o.mention ? 'Mention' : 'Contacts')), o.mention ? 'above' : 'below', () => undefined);
    pop.addEventListener('click', (ev) => {
      const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-k-pick]');
      const c = b && shown.find((x) => x.id === b.dataset.kPick);
      if (c) choose(c);
    });
    // The field keeps the keyboard: arrows move, Enter or Tab take.
    field.focus({ preventScroll: true });
  };
  field.addEventListener('input', offer);
  field.addEventListener('keydown', (ev: Event) => {
    if (!(ev instanceof KeyboardEvent)) return;
    if (!shown.length || openMenu?.button !== field) return;
    const items = [...openMenu.pop.querySelectorAll<HTMLElement>('[data-k-pick]')];
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      at = (at + (ev.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      items.forEach((x, i) => x.setAttribute('aria-selected', String(i === at)));
    } else if (ev.key === 'Enter' || ev.key === 'Tab') {
      // The key takes the name, and nothing else: no form is sent by it.
      ev.preventDefault();
      ev.stopPropagation();
      choose(shown[at]);
    }
  });
}

/** The contacts a name typed in a field stands for: the one chosen, or the one whose name it is, if only one has it. */
export function namedIn(field: HTMLInputElement, contacts: Contact[]): string {
  if (field.dataset.kId) return field.dataset.kId;
  const v = field.value.trim();
  const same = contacts.filter((c) => labelOf(c).toLowerCase() === v.toLowerCase());
  return same.length === 1 ? same[0].id : v;
}

/** Whether these contacts have names that collide (for an app's own lists). */
export { colliding };

// ---------------------------------------------------------------- the slot for another app's panel

/**
 * The rules of the slot (built in round 1, filled in round 2 by Kišib's
 * runner and Damgar's authorisation):
 *
 * 1. Only an origin the host app was told belongs to that other app is
 *    framed (`allowed`); any other is refused and nothing is drawn.
 * 2. The frame is sandboxed without `allow-same-origin`: what is inside runs
 *    in an origin of its own, so the host cannot read or change it, and it
 *    cannot reach the host's page, storage or keys either. No navigation of
 *    the host, no pop-ups, no features (camera, payment…), no referrer.
 * 3. The edge is striped in the other app's colour and says who drew it;
 *    the host draws only the edge and a way to close.
 * 4. What passes between them is a message the other app posts to the
 *    host's window (`postMessage`), its origin checked by the host; the
 *    other app's own decision is made inside the frame. *The gap, accepted
 *    (decided): a malicious host could cover the frame or trick a click.*
 */
export const SLOT_RULES = [
  'Only an origin given as the other app’s is framed; any other is refused.',
  'Sandboxed without same-origin: the host cannot read or change it, and it cannot reach the host.',
  'No navigation of the host, no pop-ups, no device features, no referrer.',
  'Its edge is striped in the other app’s colour and names who drew it.',
  'What passes between them is a message whose origin the host checks.',
] as const;

export interface Slot {
  frame: HTMLIFrameElement;
  close(): void;
}

/** Open the slot: another app's panel in a frame, under the rules above. Throws, drawing nothing, for an origin not allowed. */
export function openSlot(page: HTMLElement, o: { app: App; by: string; host: string; src: string; allowed: string[]; message?: (data: unknown) => void; /** The person closed it (the ×), not the host. */ closed?: () => void }): Slot {
  let url: URL;
  try {
    url = new URL(o.src);
  } catch {
    throw new Error(`Not an address: ${o.src}. Nothing was opened.`);
  }
  if (!o.allowed.includes(url.origin)) throw new Error(`${url.origin} is not ${o.by}’s, as this app knows it. Nothing was opened.`);
  const shade = document.createElement('div');
  shade.className = 'k-shade';
  const box = document.createElement('div');
  box.className = `k-frame k-${o.app}`;
  box.setAttribute('role', 'dialog');
  const by = document.createElement('div');
  by.className = 'k-by';
  by.textContent = slotWords(o.by, o.host);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'k-round';
  close.setAttribute('aria-label', 'Close');
  close.textContent = '×';
  const grow = document.createElement('span');
  grow.className = 'k-grow';
  by.append(grow, close);
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts allow-forms');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.setAttribute('allow', '');
  frame.setAttribute('title', `${o.by}’s panel`);
  frame.src = url.href;
  box.append(by, frame);
  page.append(shade, box);
  // A sandboxed frame has an opaque origin ("null"): the message is taken only from that frame's window.
  const listen = (ev: MessageEvent) => {
    if (ev.source === frame.contentWindow) o.message?.(ev.data);
  };
  window.addEventListener('message', listen);
  const slot = {
    frame,
    close() {
      window.removeEventListener('message', listen);
      box.remove();
      shade.remove();
    },
  };
  close.addEventListener('click', () => {
    slot.close();
    o.closed?.();
  });
  return slot;
}
