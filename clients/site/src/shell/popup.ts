// A film a page lists (website cMIP, draft 5, rule 12b), played over the
// page: pressing its button opens a pop-up in the display client's own page,
// never in the page's frame (which may run no script), holding the same
// player as a film shown in the page (film.ts), under the same rules: the
// film fetched only now, checked against what was signed and by the video
// Module, played inline, never starting with sound on its own. The press that
// opened the pop-up is the visitor's ask to play, so the player starts at
// once. The pop-up closes with its close button, the Escape key, or a press
// outside the film, and the film stops when it closes.

import type { FileEntry } from '../manifest.ts';
import { filmPlayer } from './film.ts';
import type { FilmLine } from './view.ts';

export interface Listed {
  entry: FileEntry;
  poster: Uint8Array | null;
  label: string;
}

let open: { close: () => void } | null = null;

/** Close the pop-up showing now, if any, stopping its film. */
export function closePopup(): void {
  open?.close();
}

/**
 * Open a listed film over the page. `get` fetches and checks its bytes, as for
 * any film; `opener` gets the focus back when the pop-up closes.
 */
export function openPopup(
  film: Listed,
  get: (entry: FileEntry, signal?: AbortSignal) => Promise<Uint8Array | null>,
  line: FilmLine,
  changed: () => void,
  opener: HTMLElement | null,
): HTMLElement {
  closePopup();
  // Another film playing on the page is paused: two films never speak at once.
  for (const v of document.querySelectorAll('video')) v.pause();

  const stop = new AbortController();
  const shade = document.createElement('div');
  shade.className = 'mor-popup';
  shade.dataset.film = film.entry.path;
  shade.setAttribute('role', 'dialog');
  shade.setAttribute('aria-modal', 'true');
  shade.setAttribute('aria-label', film.label);

  const panel = document.createElement('div');
  panel.className = 'mor-popup-panel';
  const head = document.createElement('div');
  head.className = 'mor-popup-head';
  const title = document.createElement('span');
  title.className = 'mor-popup-title';
  title.textContent = film.label;
  const closer = document.createElement('button');
  closer.type = 'button';
  closer.className = 'mor-popup-close';
  closer.textContent = '✕ Close';
  closer.setAttribute('aria-label', `Close ${film.label}`);
  head.append(title, closer);

  const player = filmPlayer(
    film.entry,
    film.poster,
    get,
    line,
    changed,
    (w, h) => {
      if (w && h) player.style.setProperty('--shape', String(w / h));
    },
    { now: true, signal: stop.signal },
  );
  panel.append(head, player);
  shade.append(panel);

  const root = document.documentElement;
  const overflow = root.style.overflow;
  const close = () => {
    if (open !== handle) return;
    open = null;
    stop.abort();
    shade.remove();
    root.style.overflow = overflow;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('focusin', onFocus, true);
    changed();
    opener?.focus({ preventScroll: true });
  };
  const handle = { close };
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      close();
    }
  };
  // The focus stays in the pop-up while it is open.
  const onFocus = (ev: FocusEvent) => {
    if (!shade.contains(ev.target as Node)) closer.focus({ preventScroll: true });
  };
  closer.addEventListener('click', close);
  // A press outside the film (on the shade, not the panel) closes it.
  shade.addEventListener('click', (ev) => {
    if (ev.target === shade) close();
  });
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('focusin', onFocus, true);

  root.style.overflow = 'hidden';
  document.body.append(shade);
  open = handle;
  closer.focus({ preventScroll: true });
  return shade;
}
