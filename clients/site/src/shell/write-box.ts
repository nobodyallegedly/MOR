// A page's writing box (website cMIP draft 7, rule 13b; F275): the display
// client's own box, laid over the place the page gave it, since nothing runs
// in a page. Two switches, to whom and public or private, the meaning of the
// choice in plain words beside it, and the note sent from this browser by
// `../write.ts`. Nothing is kept: the one-time identity's keys are forgotten
// once the note is sent, and nothing is written to the browser's storage.

import { escapeHtml as e } from '../../../longform/src/html.ts';
import type { Author } from '../feed.ts';
import { MAX_MESSAGE, writeNote } from '../write.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const nameOf = (a: Author) => a.name ?? `Identity ${short(a.identity)}`;

/** All the names, as a sentence: "A", "A or B", "A, B or C". */
const either = (as: Author[]) => {
  const n = as.map(nameOf);
  return n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} or ${n.at(-1)}`;
};

/** What each choice means, in plain words. */
export function meaning(to: Author, isPublic: boolean, authors: Author[]): string {
  const name = nameOf(to);
  return isPublic
    ? `Public: left unsealed in ${name}'s inbox, readable by anyone who holds it. It appears on this page only if ${either(authors)} answers it.`
    : `Private: sealed in this browser so that only ${name} can open it, then left in ${name}'s inbox. It is never shown on this page.`;
}

export const ALWAYS =
  'Either way it is signed by a one-time identity made in this browser, whose keys are forgotten once it is sent: no reply can reach you, so write how to be reached if you want one. Nothing is kept in this browser.';

/** The box, ready to be laid over its place. */
export function writeBox(authors: Author[], places: string[], homes: string[]): HTMLElement {
  let to = authors[0];
  let isPublic = false;
  let sending = false;
  const box = document.createElement('section');
  box.className = 'mor-write-box';
  box.setAttribute('aria-label', 'Write a note');
  const switches = authors
    .map((a, i) => `<button type="button" class="mw-opt" data-to="${i}" aria-pressed="${i === 0}">${e(nameOf(a))}</button>`)
    .join('');
  box.innerHTML = `<div class="mw-inner"><div class="mw-row" role="group" aria-label="To"><span class="mw-lab">To</span>${switches}</div>
<div class="mw-row" role="group" aria-label="Who can read it"><span class="mw-lab">As</span><button type="button" class="mw-opt" data-public="0" aria-pressed="true">Private</button><button type="button" class="mw-opt" data-public="1" aria-pressed="false">Public</button></div>
<p class="mw-means" id="mw-means"></p>
<textarea class="mw-text" rows="4" maxlength="${MAX_MESSAGE}" aria-describedby="mw-means mw-always" placeholder="Your note"></textarea>
<div class="mw-send-row"><button type="button" class="mw-send">Send</button><span class="mw-status" role="status"></span></div>
<p class="mw-always" id="mw-always">${e(ALWAYS)}</p></div>`;
  const means = box.querySelector<HTMLElement>('.mw-means')!;
  const text = box.querySelector<HTMLTextAreaElement>('.mw-text')!;
  const send = box.querySelector<HTMLButtonElement>('.mw-send')!;
  const status = box.querySelector<HTMLElement>('.mw-status')!;
  const show = () => {
    means.textContent = meaning(to, isPublic, authors);
    for (const b of box.querySelectorAll<HTMLButtonElement>('[data-to]')) b.setAttribute('aria-pressed', String(authors[Number(b.dataset.to)] === to));
    for (const b of box.querySelectorAll<HTMLButtonElement>('[data-public]')) b.setAttribute('aria-pressed', String((b.dataset.public === '1') === isPublic));
    box.dataset.to = to.identity;
    box.dataset.public = isPublic ? '1' : '0';
  };
  for (const b of box.querySelectorAll<HTMLButtonElement>('[data-to]')) b.addEventListener('click', () => ((to = authors[Number(b.dataset.to)]), show()));
  for (const b of box.querySelectorAll<HTMLButtonElement>('[data-public]')) b.addEventListener('click', () => ((isPublic = b.dataset.public === '1'), show()));
  if (!homes.length) {
    text.disabled = true;
    send.disabled = true;
    status.textContent = "This gateway takes no notes: its operator names no home for a visitor's one-time identity.";
  }
  send.addEventListener('click', async () => {
    if (sending || !text.value.trim()) return;
    sending = true;
    send.disabled = true;
    box.dataset.sent = '';
    status.className = 'mw-status';
    status.textContent = 'Signing and sending from this browser…';
    try {
      const w = await writeNote({ text: text.value, to: to.identity, public: isPublic, places, homes });
      text.value = '';
      status.className = 'mw-status mw-ok';
      status.textContent = `Sent: note ${short(w.note)}, ${w.public ? 'unsealed' : 'sealed'}, is in ${nameOf(to)}'s inbox. Its one-time identity's keys are forgotten.`;
      box.dataset.sent = w.note;
    } catch (err) {
      status.className = 'mw-status mw-bad';
      status.textContent = `Not sent: ${err instanceof Error ? err.message : String(err)}.`;
      box.dataset.sent = 'failed';
    } finally {
      sending = false;
      send.disabled = false;
    }
  });
  show();
  return box;
}
