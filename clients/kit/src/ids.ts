// IDs and their names, as every app shows them (hand test v3: H95, H96,
// H106, H109, H119, H121).
//
// In plain words: wherever an identity's ID is shown, its names follow: the
// nickname the person gave it (sealed to them, "only you see it"), then the
// name it published for itself, small and faint beside it, and its short ID
// under. While the name is being read the place says "Loading…"; where its
// homes answered and it published none, "No name published"; where they
// could not be reached, "Name not reached", with a way to ask again (silence
// proves nothing). Every short ID is a button: one tap shows it whole, a
// second copies it ("Copied"); for a person, Open profile beside it. Every
// field that takes an ID has a Contacts button beside it, opening the
// person's one contacts list, searchable.
//
// Precisely: the pieces are HTML strings (usable anywhere) and their clicks
// (`attachIds`, `attachContactsButtons`); the names themselves are read by
// the app's engine (`engine/names.ts`, `engine/people.ts`) and handed over
// through the host's `names`. Nothing here knows MOR beyond the form of an
// ID written for people.

import { contactsPanel, e, namesHtml, shortForm, type Named } from './html.ts';
import { askNick, ask, closeMenu, copy, openPanel, panelOpen, popAt, redrawPanel } from './dom.ts';

// ---------------------------------------------------------------- the form of an ID

/** An ID written for people (`mid1…`, `mact1…`) from its hexadecimal: the same bech32m the core writes, for display only. */
export function idForm(hex: string, label: 'mid' | 'mact' = 'mid'): string {
  if (!/^[0-9a-f]{64}$/.test(hex)) return hex;
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16));
  const data: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = ((acc << 8) | b) & 0xffff;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data.push((acc >> bits) & 31);
    }
  }
  if (bits) data.push((acc << (5 - bits)) & 31);
  const polymod = (v: number[]) => {
    const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const x of v) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ x;
      for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= G[i];
    }
    return chk;
  };
  const hrp = [...label].map((c) => c.charCodeAt(0));
  const pm = polymod([...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...data, 0, 0, 0, 0, 0, 0]) ^ 0x2bc830a3;
  const check = [0, 1, 2, 3, 4, 5].map((i) => (pm >> (5 * (5 - i))) & 31);
  return `${label}1${[...data, ...check].map((d) => CHARSET[d]).join('')}`;
}

/**
 * An identity, wherever its ID is shown (H96, H106, H121): its names, then
 * its short ID under them, a button (one tap: whole; a second: copied; Open
 * profile beside it). `named` absent: its names are asked of the host once
 * it is drawn (`attachIds`), "Loading…" until then.
 */
export function who(o: { id: string; form?: string; named?: Named | null; me?: boolean; collective?: boolean; inline?: boolean }): string {
  const form = o.form ?? idForm(o.id, 'mid');
  return `<span class="k-who${o.inline ? ' k-inline' : ''}" data-k-who="${e(o.id)}"${o.named ? ' data-k-named=""' : ''}><span class="k-names">${namesHtml(o.named ?? null)}${o.me ? '<span class="k-you">you</span>' : ''}${o.collective ? '<span class="k-tagc">collective</span>' : ''}</span>${idButton(form, { person: o.id })}</span>`;
}

/** A short ID as a button (H121): one tap shows it whole, a second copies it. `person`: Open profile beside it once whole. `act`: the act it names, which the host may expand where it is (H95). */
export function idButton(form: string, o: { person?: string; act?: string; expand?: boolean } = {}): string {
  return `<button type="button" class="k-idbtn" data-k-idform="${e(form)}"${o.person ? ` data-k-person="${e(o.person)}"` : ''}${o.act ? ` data-k-act-id="${e(o.act)}"` : ''}${o.expand ? ' data-k-expand=""' : ''} title="Tap to show it whole">${e(shortForm(form))}</button>`;
}

/** An act's ID (`mact1…`), short, a button as every ID is. */
export const actId = (id: string, o: { expand?: boolean } = {}) => idButton(idForm(id, 'mact'), { act: id, expand: o.expand });

/** A hash (a specification's, a fingerprint), short, a button as every ID is: its first eight and last four characters. */
export function hashButton(hex: string): string {
  return `<button type="button" class="k-idbtn k-hash" data-k-idform="${e(hex)}" data-k-short="${e(`${hex.slice(0, 8)}…${hex.slice(-4)}`)}" title="Tap to show it whole">${e(`${hex.slice(0, 8)}…${hex.slice(-4)}`)}</button>`;
}

// ---------------------------------------------------------------- their clicks

/** What an app answers for the IDs it shows. */
export interface IdHost {
  /** The names of these identities, read by the app's engine (its contacts' nicknames, the names they published). `fresh`: asked again (a retry). */
  names?(ids: string[], fresh?: boolean): Promise<Record<string, Named>>;
  /** Open an identity's profile. */
  profile?(id: string): void;
  /** Expand, where it is, the act an ID names (H95: in a reply, what it answers): fetched and verified by the app. */
  act?(id: string, button: HTMLElement): void;
}

const hosts = new WeakMap<HTMLElement, IdHost>();

/**
 * IDs inside `root` get their taps (H121): a short ID, tapped, is shown
 * whole, wrapped, in place; tapped again, copied ("Copied"); a person's
 * gains Open profile. Identities drawn without names have them asked of the
 * host, and filled in; "Ask again" asks once more.
 */
export function attachIds(root: HTMLElement, host: IdHost): void {
  hosts.set(root, host);
  root.addEventListener('click', async (ev) => {
    const t = ev.target as HTMLElement;
    const retry = t.closest<HTMLElement>('[data-k-name-retry]');
    if (retry) {
      ev.stopPropagation();
      const w = retry.closest<HTMLElement>('[data-k-who]');
      if (w) await fillNames(root, [w], true);
      return;
    }
    const prof = t.closest<HTMLElement>('[data-k-open-profile]');
    if (prof) {
      ev.stopPropagation();
      return host.profile?.(prof.dataset.kOpenProfile!);
    }
    const b = t.closest<HTMLElement>('.k-idbtn');
    if (!b || !root.contains(b)) return;
    ev.stopPropagation();
    ev.preventDefault();
    closeMenu();
    // An act answered, in a reply: expanded where it is (H95), as the host reads it.
    if (b.dataset.kExpand !== undefined && b.dataset.kActId && host.act) return host.act(b.dataset.kActId, b);
    const form = b.dataset.kIdform!;
    if (!b.classList.contains('k-whole')) {
      b.classList.add('k-whole');
      b.textContent = form;
      b.title = 'Tap again to copy it';
      if (b.dataset.kPerson && host.profile && !b.nextElementSibling?.matches('[data-k-open-profile]')) b.insertAdjacentHTML('afterend', `<button type="button" class="k-btn k-q k-small" data-k-open-profile="${e(b.dataset.kPerson)}">Open profile</button>`);
      return;
    }
    const ok = await copy(form);
    b.textContent = ok ? 'Copied' : 'Select it: copying refused';
    b.dataset.kCopied = ok ? 'yes' : 'no';
    setTimeout(() => {
      if (b.isConnected) b.textContent = form;
    }, 1200);
  });
  // Names asked for every identity drawn without them, as it is drawn.
  let queued = false;
  const ask = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(async () => {
      queued = false;
      const ws = [...root.querySelectorAll<HTMLElement>('[data-k-who]:not([data-k-named])')];
      if (ws.length) await fillNames(root, ws, false);
    });
  };
  new MutationObserver(ask).observe(root, { childList: true, subtree: true });
  ask();
}

/** Ask the host for these identities' names, and draw them in place. */
async function fillNames(root: HTMLElement, ws: HTMLElement[], fresh: boolean): Promise<void> {
  const host = hosts.get(root);
  for (const w of ws) w.dataset.kNamed = '';
  if (!host?.names) {
    for (const w of ws) w.querySelector('.k-names')!.innerHTML = namesHtml({ published: { state: 'unreached' } }, { retry: false });
    return;
  }
  if (fresh) for (const w of ws) w.querySelector('.k-names')!.innerHTML = namesHtml({ published: { state: 'loading' } });
  const ids = [...new Set(ws.map((w) => w.dataset.kWho!))];
  let got: Record<string, Named> = {};
  try {
    got = await host.names(ids, fresh);
  } catch {
    // not reached: said as such
  }
  for (const w of ws) {
    if (!w.isConnected) continue;
    const box = w.querySelector<HTMLElement>('.k-names')!;
    const extra = [...box.querySelectorAll('.k-you, .k-tagc')].map((x) => x.outerHTML).join('');
    box.innerHTML = namesHtml(got[w.dataset.kWho!] ?? { published: { state: 'unreached' } }) + extra;
  }
}

// ---------------------------------------------------------------- contacts, beside every field taking an ID (H119)

/** A contact as the picker lists it: its ID, its names. */
export interface PickContact {
  id: string;
  form?: string;
  named: Named;
  collective?: boolean;
}

/** The Contacts button beside a field that takes an ID (H119). */
export const contactsButtonFor = (field: string) => `<button type="button" class="k-btn k-q k-small k-pick" data-k-pick-for="${e(field)}" aria-haspopup="dialog">Contacts</button>`;

/**
 * Every field inside `root` marked `data-k-id-field` (its name or id given to
 * `contactsButtonFor`) gets its Contacts button's pop-up: the one contacts
 * list, searchable by nickname and name, each with its short ID; choosing one
 * fills the field with its `mid1…` (added on a new line where the field takes
 * several). Typing or pasting an ID still works.
 */
export function attachContactsButtons(root: HTMLElement, contacts: () => Promise<PickContact[]> | PickContact[], picked?: (field: HTMLInputElement | HTMLTextAreaElement, c: PickContact) => boolean): void {
  root.addEventListener('click', async (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-k-pick-for]');
    if (!b) return;
    ev.preventDefault();
    ev.stopPropagation();
    const scope = b.closest('form') ?? root;
    const key = b.dataset.kPickFor!;
    const field = scope.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${CSS.escape(key)}"], #${CSS.escape(key)}`);
    if (!field) return;
    const list = await contacts();
    const byForm = new Map(list.map((c) => [c.form ?? idForm(c.id, 'mid'), c]));
    const row = (c: PickContact) => {
      const form = c.form ?? idForm(c.id, 'mid');
      const words = [c.named.nick ?? '', c.named.published?.state === 'name' ? c.named.published.name : '', form].join(' ').toLowerCase();
      return `<button type="button" role="option" data-k-picked="${e(form)}" data-k-words="${e(words)}"><span class="k-names">${namesHtml(c.named, { retry: false })}${c.collective ? '<span class="k-tagc">collective</span>' : ''}</span><span class="k-k">${e(shortForm(form))}</span></button>`;
    };
    const pop = popAt(
      b,
      `<div class="k-pop k-picker" role="listbox" data-k-picker><div class="k-t">Contacts</div><input type="search" data-k-pick-find placeholder="Find by nickname or name…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a contact">${list.map(row).join('') || '<p class="k-small k-soft">No contacts yet: add one by its ID in Contacts, top left.</p>'}</div>`,
      'below',
      () => undefined,
    );
    const find = pop.querySelector<HTMLInputElement>('[data-k-pick-find]')!;
    find.focus({ preventScroll: true });
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      pop.querySelectorAll<HTMLElement>('[data-k-picked]').forEach((x) => (x.hidden = !!q && !x.dataset.kWords!.includes(q)));
    });
    pop.addEventListener('click', (e2) => {
      const p = (e2.target as HTMLElement).closest<HTMLElement>('[data-k-picked]');
      if (!p) return;
      e2.stopPropagation();
      const form = p.dataset.kPicked!;
      // The app's own way to take it (a To… or a Cc that keeps the name shown), where it has one.
      if (picked?.(field, byForm.get(form)!)) {
        closeMenu();
        return;
      }
      // A field taking several (a textarea, or marked so): one more line; else the field is the one chosen.
      if (field.tagName === 'TEXTAREA' || field.dataset.kSeveral !== undefined) {
        const have = field.value.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
        if (!have.includes(form)) field.value = [...have, form].join('\n');
      } else field.value = form;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      closeMenu();
      field.focus({ preventScroll: true });
    });
  });
}

/** What an app answers for its contacts (H100, H109, H119): its engine's operations, by name, and what it does with a contact. */
export interface ContactsHost {
  /** This app's name, as said ("Damgar"). */
  app: string;
  /** One of the app's operations: `contacts` (`{ contacts, problem }`), `contact add` / `contact nick` / `contact remove` (`{ lines }`), `names`. */
  ask<T>(op: string, a?: Record<string, unknown>): Promise<T>;
  /** Open an identity's profile, where the app has one. */
  profile?(id: string): void;
  /** Say something done, or a refusal. */
  said(kind: 'done' | 'error', html: string): void;
}

interface Shown {
  id: string;
  form: string;
  name: string | null;
  named: Named;
}

/**
 * Contacts, top left, the same in every app (H100): the one list, the
 * people cMIP's, sealed to the identity at its homes; each contact's names
 * (H96), Nickname… (H109), Remove; + Add by ID, with a nickname. Wires the
 * Contacts button (`contactsButton`), every Contacts button beside a field
 * taking an ID (H119), and every ID's names and taps (H121) in `page`.
 */
export function attachContacts(page: HTMLElement, host: ContactsHost): { open(): Promise<void>; list(): Shown[]; refresh(): Promise<void> } {
  let list: Shown[] = [];
  let problem: string | null = null;
  const below = () =>
    `<form data-k-contact-add class="k-contact-add"><div class="k-row"><input name="contact-id" data-k-id-field autocomplete="off" spellcheck="false" placeholder="+ Add by ID (mid1…, or an ID link)" required aria-label="Add by ID"></div><input name="contact-nick" autocomplete="off" placeholder="Your nickname for it (only you see it)" aria-label="Your nickname for it"><div class="k-row"><button type="submit" class="k-btn">Add to contacts</button></div></form>${problem ? `<p class="k-small k-soft">${e(problem)}.</p>` : '<p class="k-small k-soft">Sealed to you at your homes: every app holding this identity reads the same list. Your nicknames are seen by you alone.</p>'}`;
  const html = () => contactsPanel({ contacts: list.map((c) => ({ id: c.id, form: c.form, name: c.name, named: c.named })), nick: true, action: 'Remove', below: below() });
  const refresh = async () => {
    try {
      const r = await host.ask<{ contacts: Shown[]; problem: string | null }>('contacts');
      list = r.contacts;
      problem = r.problem;
    } catch (err) {
      problem = err instanceof Error ? err.message : String(err);
    }
  };
  const open = async () => {
    await refresh();
    if (panelOpen()?.dataset.kPanel === 'contacts') redrawPanel(html());
    else openPanel(page, html());
  };
  const changed = async (op: string, a: Record<string, unknown>, done: string) => {
    try {
      const r = await host.ask<{ lines: { text: string }[] }>(op, a);
      host.said('done', `<strong>${e(done)}</strong>${r.lines?.length ? ` ${r.lines.map((l) => e(l.text)).join(' ')}` : ''}`);
      await open();
    } catch (err) {
      host.said('error', e(err instanceof Error ? err.message : String(err)));
    }
  };
  page.addEventListener('click', async (ev) => {
    const t = ev.target as HTMLElement;
    if (t.closest('[data-k-open="contacts"]')) return void open();
    const panel = t.closest('[data-k-panel="contacts"]');
    if (!panel) return;
    const opened = t.closest<HTMLElement>('[data-k-contact-open]');
    if (opened && host.profile) return host.profile(opened.dataset.kContactOpen!);
    const nickB = t.closest<HTMLElement>('[data-k-nick]');
    if (nickB) {
      const c = list.find((x) => x.id === nickB.dataset.kNick);
      const nick = await askNick(page, { title: `Nickname for ${c?.named.published?.state === 'name' ? c.named.published.name : shortForm(c?.form ?? '')}`, current: c?.name ?? null, yes: 'Save', skip: 'Keep it as it is' });
      if (nick === undefined || nick === (c?.name ?? null)) return;
      return changed('contact nick', { id: nickB.dataset.kNick, nick: nick ?? '' }, nick ? 'Nickname saved.' : 'Nickname taken away.');
    }
    const rm = t.closest<HTMLElement>('[data-k-contact-do]');
    if (rm) {
      const c = list.find((x) => x.id === rm.dataset.kContactDo);
      if (!(await ask(page, { title: `Remove ${c?.name ?? shortForm(c?.form ?? '')} from your contacts?`, text: 'Taken out of the one list, in every app holding this identity. Nobody is told.', yes: 'Remove', no: 'Keep it' }))) return;
      return changed('contact remove', { id: rm.dataset.kContactDo }, 'Removed from your contacts.');
    }
  });
  page.addEventListener('submit', (ev) => {
    const f = (ev.target as HTMLElement).closest<HTMLFormElement>('form[data-k-contact-add]');
    if (!f) return;
    ev.preventDefault();
    ev.stopPropagation();
    const d = new FormData(f);
    void changed('contact add', { id: String(d.get('contact-id') ?? '').trim(), nick: String(d.get('contact-nick') ?? '').trim() }, 'Added to your contacts.');
  });
  // Every field taking an ID: the one list beside it (H119).
  attachContactsButtons(page, async () => {
    if (!list.length) await refresh();
    return list.map((c) => ({ id: c.id, form: c.form, named: c.named }));
  });
  return { open, list: () => list, refresh };
}
