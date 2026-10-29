// A page drawing every piece of the kit with invented people (Max, Pa, Pa
// again, Ph, T, Collective Y), for the kit's own test in a real browser.
// What a choice would do in an app is only recorded (`window.chosen`).

import {
  appMark,
  attachCards,
  attachClosing,
  attachColumn,
  attachNames,
  card,
  clockLine,
  closePanel,
  contactsButton,
  contactsPanel,
  feedBox,
  identityPanel,
  lenses,
  meButton,
  openConfirm,
  openPanel,
  openSlot,
  popAt,
  opened,
  Popup,
  profile,
  redrawPanel,
  removeSaid,
  say,
  fold,
  switcher,
  tiles,
  top,
  typingBox,
  type Contact,
  type KitAct,
  type KitWho,
  type PanelIdentity,
} from '../src/index.ts';

declare global {
  interface Window {
    chosen: string[];
    slotOrigin: string;
    openTestSlot(src: string): string;
    slotMessages: unknown[];
    openForm(): void;
    sayNote(text: string): void;
  }
}
window.chosen = [];
window.slotMessages = [];

const hex = (c: string) => c.repeat(64).slice(0, 64);
const who = (n: string, c: string, o: Partial<KitWho> = {}): KitWho => ({ id: hex(c), form: `mid1${c}${c}x7q9${c}m4k`, link: `mid1${c}${c}x7q9${c}m4k?r=https://home.test`, name: n, ...o });
const MAX = who('Max', 'a', { me: true });
const PA = who('Pa', 'b', { followed: true });
const PA2 = who('Pa', 'c');
const PH = who('Ph', 'd', { followed: true });
const Y = who('Collective Y', 'e', { collective: true });

const acts: KitAct[] = [
  { id: hex('1'), form: 'mact1r8dqqqqq4kq', signer: PA, text: 'The reading of the tablets moves to Thursday. Same room, same tea.', verified: true, when: '09:14' },
  { id: hex('2'), form: 'mact1c5hqqqqq0lp', signer: MAX, text: 'Thursday works. I’ll bring the second tablet.', verified: true, when: '09:20', labels: [{ text: '↳ answers Pa · mact1r8d…4kq' }], answers: { id: hex('1'), signer: PA.id }, own: true },
  { id: hex('3'), form: 'mact1w2nqqqqq9xe', signer: PH, text: 'Clay drying on the sill this morning.', verified: true, when: '08:52', of: 'Collective Y' },
  { id: hex('4'), form: 'mact1y0gqqqqq7tt', signer: Y, text: 'Collective Y’s first release is out.', verified: true, labels: [{ text: 'signed under a grant: Machine, allegedly, for Collective Y' }] },
  { id: hex('5'), form: 'mact1z9xqqqqq4dw', signer: PA2, text: 'A contested act, shown with its alarm.', verified: false, alarm: 'contested: its signer’s homes disagree' },
];
const byId = new Map(acts.map((a) => [a.id, a]));

const contacts: Contact[] = [
  { id: PA.id, form: PA.form, name: 'Pa' },
  { id: PA2.id, form: PA2.form, name: 'Pa' },
  { id: PH.id, form: PH.form, name: 'Ph' },
  { id: Y.id, form: Y.form, name: 'Collective Y', collective: true },
];

let using = { id: MAX.id, as: null as string | null };
const ids = (): PanelIdentity[] => [
  { id: MAX.id, form: MAX.form, name: 'Max', on: using.id === MAX.id && !using.as, collectives: [{ id: Y.id, form: Y.form, name: 'Collective Y', on: using.as === Y.id }] },
  { id: hex('f'), form: 'mid1ffft6vqqqq0z', name: 'T', on: using.id === hex('f'), collectives: [] },
];

const page = document.getElementById('app')!;
page.className = 'k-page k-dub';
let part = 'public';

function draw() {
  const left = `<div class="k-row">${contactsButton()}${appMark('Demo', 'icon.png')}</div>`;
  const center = switcher([{ key: 'public', label: 'Public' }, { key: 'tiles', label: 'Tiles' }, { key: 'profile', label: 'Profile' }], part);
  const as = using.as ? { name: 'Collective Y', form: Y.form } : null;
  const right = meButton({ name: using.id === MAX.id ? 'Max' : 'T', form: using.id === MAX.id ? MAX.form : 'mid1ffft6vqqqq0z', as });
  let body = '';
  if (part === 'public') {
    body = `<div class="k-body"><section class="k-pane" id="public">${feedBox({
      id: 'feed',
      above: `${lenses([{ key: 'following', label: 'Following' }, { key: 'toyou', label: 'To you' }, { key: 'relay', label: 'Relay' }], 'following')}`,
      cards: acts.map((a) => card(a)).join(''),
      below: clockLine({ name: 'the test clock', placed: 3, shown: 5 }),
    })}${typingBox({ id: 'post', placeholder: 'Write something public…', button: 'Post', tools: '<button type="button">Picture</button><button type="button" data-at>@</button>', opts: '<input id="to" placeholder="To…" aria-label="To">' })}${say('Test identities only, until MOR is frozen', ['Every key is held in software.', 'Nothing here is for a real identity.'])}${fold('A lane from Damgar', '<form id="lane-demo"><label>Cap per payment</label><input name="cap" inputmode="numeric"><button type="submit" class="k-btn">Ask Damgar</button></form>')}</section></div>`;
  } else if (part === 'tiles') {
    body = `<div class="k-body" id="tiles">${tiles([
      { key: 'identities', name: 'Identities', say: 'Records and successions.', icon: 'identities', danger: 1 },
      { key: 'runner', name: 'Runner', say: 'Signing for other apps.', icon: 'runner', danger: 2 },
      { key: 'paper', name: 'Paper', say: 'Changes of keys.', icon: 'paper', danger: 3 },
      { key: 'collectives', name: 'Collectives', say: 'Rotations and shares.', icon: 'collectives', danger: 3, alert: 'contested' },
    ])}</div>`;
  } else if (part === 'opened') {
    body = opened(['Paper', { key: 'keys', label: 'Change keys' }, { key: 'vault', label: 'Change the vault' }, '-', { key: 'check', label: 'Check paper words', k: 2 }], null, '<h2 id="part-title">Choose a part</h2>');
  } else {
    body = `<div class="k-body"><section class="k-pane">${profile({
      who: { ...PA, ownName: 'Pa the potter' },
      lives: 'Lives on two homes, reached through one relay.',
      trouble: null,
      actions: [{ key: 'follow', label: 'Follow', primary: true }, { key: 'message', label: 'Message' }, { key: 'pay', label: 'Pay' }],
      cards: card(acts[0]),
      record: 'its homes, keys and lines',
    })}</section></div>`;
  }
  page.innerHTML = `${top({ left, center, right })}${body}`;
  const to = document.getElementById('to') as HTMLInputElement | null;
  const ta = page.querySelector<HTMLTextAreaElement>('#post textarea');
  if (ta) attachNames(ta, () => contacts, { mention: true, picked: (c) => window.chosen.push(`mention:${c.id}`) });
  if (to) attachNames(to, () => contacts, { mention: false, picked: (c) => window.chosen.push(`to:${c.id}`) });
}

const popup = new Popup(page);
attachClosing();
attachColumn(page, (key) => window.chosen.push(`part:${key}`));
attachCards(page, {
  app: 'Demo',
  act: (id) => byId.get(id),
  signerItems: () => [{ key: 'message', label: 'Message' }],
  actItems: () => ({ before: [{ key: 'reply', label: 'Reply' }], after: [{ key: 'tip', label: 'Tip' }] }),
  choose(key, a) {
    window.chosen.push(`${key}:${a.id}`);
    if (key === 'open') {
      const answered = byId.get(a.answers!.id)!;
      popup.show('What Max’s reply answers', `${feedBox({ id: 'thread-feed', cards: [card(answered), card(a, { selected: true })].join('') })}`);
    }
    if (key === 'profile') {
      part = 'profile';
      draw();
    }
    if (key === 'why') popup.show('Why it’s valid', '<p id="why">Signed by its signer’s current key, in its identity chain.</p>');
  },
});
// Opening something inside the pop-up replaces its content, with a back arrow.
page.addEventListener('click', (ev) => {
  const t = ev.target as HTMLElement;
  const p = t.closest<HTMLElement>('[data-k-part]');
  if (p) {
    part = p.dataset.kPart!;
    draw();
  }
  const tile = t.closest<HTMLElement>('[data-k-tile]');
  if (tile) {
    part = 'opened';
    draw();
  }
  if (t.closest('[data-k-back="profile"]')) {
    part = 'public';
    draw();
  }
  const opener = t.closest<HTMLElement>('[data-k-open]');
  if (opener?.dataset.kOpen === 'identity') openPanel(page, identityPanel({ ids: ids(), adding: false, add: [], foot: 'This app: paired browsers, homes and relays' }));
  if (opener?.dataset.kOpen === 'contacts') openPanel(page, contactsPanel({ contacts, action: 'Message', below: '<p class="k-small k-soft">+ Add by ID</p>' }));
  const use = t.closest<HTMLElement>('[data-k-use]');
  if (use) {
    using = use.dataset.kUnder ? { id: use.dataset.kUnder, as: use.dataset.kUse! } : { id: use.dataset.kUse!, as: null };
    window.chosen.push(`use:${use.dataset.kUse}`);
    closePanel();
    draw();
  }
  const add = t.closest<HTMLElement>('[data-k-add]');
  if (add) redrawPanel(identityPanel({ ids: ids(), adding: true, add: [{ key: 'make', label: 'Make one', say: 'its chain key’s words shown once' }, { key: 'bring', label: 'Bring one', say: 'its ID and signing words' }, { key: 'kishib', label: 'Use one from Kišib', say: 'with Kišib’s runner, on a Mac: in a later round', empty: true }], foot: 'This app' }));
  const more = t.closest<HTMLElement>('[data-k-idmenu]');
  if (more) {
    ev.stopPropagation();
    popAt(more, `<div class="k-pop" role="menu"><div class="k-t">Max</div><button type="button" role="menuitem" data-k-item="name">Name</button><button type="button" role="menuitem" data-k-item="relays">Relays</button><button type="button" role="menuitem" data-k-item="words">Words</button><button type="button" role="menuitem" data-k-item="line">Line and homes</button><hr><button type="button" role="menuitem" data-k-item="remove">Remove from Demo…</button></div>`, 'below', (key) => {
        window.chosen.push(`idmenu:${key}`);
        if (key === 'remove') openConfirm(page, removeSaid('Demo', 'Max'));
      });
  }
  if (t.closest('[data-k-remove-yes]')) window.chosen.push('removed');
});
window.openTestSlot = (src: string) => {
  try {
    const s = openSlot(page, { app: 'kishib', by: 'Kišib', host: 'Demo', src, allowed: [window.slotOrigin], message: (d) => window.slotMessages.push(d) });
    let read = 'unreadable';
    try {
      read = String(s.frame.contentDocument?.body?.innerHTML ?? 'unreadable');
    } catch {
      read = 'unreadable';
    }
    return read;
  } catch (err) {
    return `refused: ${err instanceof Error ? err.message : String(err)}`;
  }
};
// A pop-up with a form, to type in and close (H91), and a note under the top with its ×.
window.openForm = () => void popup.show('Write', '<form id="demo-form"><textarea name="text"></textarea><button type="submit" class="k-btn">Send</button></form>');
window.sayNote = (text: string) => {
  let st = document.getElementById('status');
  if (!st) {
    st = document.createElement('div');
    st.id = 'status';
    st.className = 'k-status';
    page.append(st);
  }
  st.innerHTML = `<div class="k-note k-done" role="status">${text}</div>`;
};
draw();
