// The display client's player for a film of the site (website cMIP, draft 4,
// rule 12a; the video Module). It lives in the display client's own page,
// never in the page's frame: the page may run no script, and Safari's own
// film controls are themselves a script, so they would not work there. Over
// a page, it is laid on the place the page gave the film, and moves with it.
//
// Nothing of the film is fetched until the visitor presses play: then its
// bytes are fetched from the gateway, checked against the signed manifest
// (work hash and size), then read by the video Module (rules 2 to 9), and
// only then handed to the browser to play, inline, with its controls. A film
// that does not match is not played; a film this browser cannot play is said
// to be so, with its poster left in its place.

import { NotFilm, read } from '../../../../modules/video/src/video.ts';
import type { FileEntry } from '../manifest.ts';
import type { FilmLine } from './view.ts';

/** What every browser that plays H.264 answers yes to: asked before anything is fetched. */
const ANY_H264 = 'video/mp4; codecs="avc1.42E01E"';

const megabytes = (n: number) => (n < 1_000_000 ? `${Math.max(1, Math.round(n / 1000))} kB` : `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)} MB`);

/**
 * A player for one film. `get` fetches the film's bytes and checks them
 * against its entry (null if they do not match); `changed` repaints the bar
 * after `line` changes.
 */
export function filmPlayer(
  entry: FileEntry,
  poster: Uint8Array | null,
  get: (entry: FileEntry) => Promise<Uint8Array | null>,
  line: FilmLine,
  changed: () => void,
  posterLoaded: (width: number, height: number) => void = () => {},
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'mor-player';
  box.dataset.film = entry.path;
  const posterUrl = poster ? URL.createObjectURL(new Blob([poster as BlobPart], { type: 'image/jpeg' })) : '';
  const posterImg = () => {
    if (!posterUrl) return null;
    const img = document.createElement('img');
    img.alt = '';
    img.src = posterUrl;
    img.addEventListener('load', () => posterLoaded(img.naturalWidth, img.naturalHeight), { once: true });
    return img;
  };
  const parts = (...xs: (HTMLElement | null)[]) => xs.filter((x): x is HTMLElement => x !== null);
  const note = (words: string) => {
    const n = document.createElement('div');
    n.className = 'mor-film-note';
    n.textContent = words;
    return n;
  };
  const set = (state: FilmLine['state'], why: string | null = null) => {
    line.state = state;
    line.why = why;
    box.dataset.state = state;
    changed();
  };
  /** The poster and a sentence, nothing of the film: what is shown when it is not played (Module rule 12). */
  const stop = (state: 'failing' | 'cannot', why: string, words: string) => {
    box.replaceChildren(...parts(posterImg(), note(words)));
    set(state, why);
  };

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '▶ Play the film';
  box.replaceChildren(...parts(posterImg(), button, note(`${megabytes(entry.size)}, checked against what was signed before it plays.`)));
  box.dataset.state = 'waiting';

  button.addEventListener('click', async () => {
    const probe = document.createElement('video');
    if (!probe.canPlayType(ANY_H264)) {
      stop('cannot', 'this browser plays no H.264 film', 'This browser does not play H.264 films, so the film was not fetched. The rest of the page is as signed.');
      return;
    }
    button.disabled = true;
    button.textContent = 'Fetching and checking…';
    set('checking');
    let bytes: Uint8Array | null;
    try {
      bytes = await get(entry);
    } catch (err) {
      stop('failing', `not fetched (${err instanceof Error ? err.message : String(err)})`, 'The film could not be fetched from this gateway. Not played.');
      return;
    }
    if (!bytes) {
      stop('failing', 'what this gateway served is not what was signed', 'What this gateway served for the film is not what was signed. Not played.');
      return;
    }
    let type: string;
    try {
      type = read(bytes).type;
    } catch (err) {
      const why = err instanceof NotFilm ? err.message : String(err);
      stop('cannot', `the video Module does not play it: ${why}`, `The film is as signed, but it is not a film the video Module plays (${why}). Not played.`);
      return;
    }
    if (!probe.canPlayType(type)) {
      stop('cannot', `this browser cannot play ${type}`, 'The film is as signed, but this browser cannot play its kind. Not played.');
      return;
    }
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'auto';
    if (posterUrl) video.poster = posterUrl;
    video.addEventListener(
      'error',
      () => stop('cannot', `this browser stopped playing it (error ${video.error?.code ?? '?'})`, 'This browser could not play the film. The film is as signed.'),
      { once: true },
    );
    video.src = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'video/mp4' }));
    box.classList.add('played');
    box.replaceChildren(video, note('Checked: exactly what was signed. Press play.'));
    set('verified');
    // Played on the visitor's own press. If the browser holds that the press
    // was too long ago (the fetch took a while), its controls are there.
    video.play().catch(() => box.classList.remove('played'));
  });
  return box;
}

/**
 * Lay each film's player on the place the page gave it, in the page's frame,
 * and keep it there as the page grows, shrinks or turns. The frame is as
 * tall as the page (nothing scrolls inside it), so a place's position in the
 * frame is its position under the frame's top.
 */
export function layOver(frame: HTMLIFrameElement, players: Map<HTMLElement, HTMLElement>): void {
  const doc = frame.contentDocument;
  if (!doc || !players.size) return;
  const place = () => {
    for (const [spot, player] of players) {
      const r = spot.getBoundingClientRect();
      player.hidden = r.width < 1 || r.height < 1;
      player.style.left = `${frame.offsetLeft + r.left}px`;
      player.style.top = `${frame.offsetTop + r.top}px`;
      player.style.width = `${r.width}px`;
      player.style.height = `${r.height}px`;
    }
  };
  place();
  const watch = new ResizeObserver(place);
  watch.observe(doc.documentElement);
  for (const spot of players.keys()) watch.observe(spot);
  window.addEventListener('resize', place);
}
