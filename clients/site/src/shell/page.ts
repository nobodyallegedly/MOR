// A page of the site, made ready to show (website cMIP, rules 11 to 16):
// parsed, everything that would run code or load from elsewhere dropped,
// pictures and stylesheets replaced by the checked bytes themselves, each
// film turned into a place the display client fills with its own player
// (draft 4, rule 12a), each film it lists turned into a place for the
// display client's button (draft 5, rule 12b), every poster checked as a picture is, links
// to the site's own pages sent to the top window, links leaving the site
// opened apart, and every `mor-act` turned into a box the display client
// fills with the act, judged on its own. The page is then shown in a frame
// whose sandbox forbids scripts, so even what this misses cannot run.

import { addressOf, kindOf, resolveRef, type FileEntry, type SiteManifest } from '../manifest.ts';
import type { Author } from '../feed.ts';
import type { ListedRelay } from '../listing.ts';

/** A listing a page names (draft 9, rule 13c): the relays it reads, and the reader its links to public terms open in, if any. */
export interface ListingAsked {
  relays: ListedRelay[];
  reader: string | null;
}
import { FRAME_STYLE } from './view.ts';

export interface Prepared {
  /** The page's HTML, for the frame's `srcdoc`. */
  html: string;
  title: string | null;
  /** The acts the page shows, in order. */
  acts: string[];
  /** The films the page shows (rule 12a), in order: each one's entry, and its poster's checked bytes. Their places carry `data-film`, the index here. */
  films: { entry: FileEntry; poster: Uint8Array | null }[];
  /** The films the page lists (draft 5, rule 12b), in order: each one's entry, its poster's checked bytes, and its label. Their places carry `data-film-listed`, the index here. */
  listed: { entry: FileEntry; poster: Uint8Array | null; label: string }[];
  /** The feeds the page shows (draft 6, rule 13a), in order: the identities each names. Their boxes carry `data-feed`, the index here. */
  feeds: Author[][];
  /** For each feed, in the same order, the clock it names (draft 8, `mor-clock`), or null. */
  clocks: (Author | null)[];
  /** The listings the page shows (draft 9, rule 13c), in order: the relays each names, and its reader. Their boxes carry `data-listing`, the index here. */
  listings: ListingAsked[];
  /** The writing boxes the page shows (draft 7, rule 13b), in order: the identities each lets a visitor write to. Their places carry `data-write`, the index here. */
  writes: Author[][];
  /** The checked bytes of the picture the page names as its icon, for the browser tab (rule 16a). */
  icon: Uint8Array | null;
  /** Files the page uses whose bytes did not match: the page is then not shown. */
  problems: string[];
  /** How many things were dropped (code, references to elsewhere or to files the site does not hold). */
  dropped: number;
}

const DROP = [
  'script', 'noscript', 'template', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'portal',
  'form', 'base', 'style', 'video', 'audio', 'source', 'track', 'svg', 'math', 'meta[http-equiv]',
];
/** Attributes that load something, or carry code, on any element. */
const LOADING = ['srcset', 'background', 'poster', 'action', 'formaction', 'ping', 'data', 'manifest', 'lowsrc', 'dynsrc', 'xlink:href', 'style'];

const ACT = /^[0-9a-f]{64}$/;

/** A stylesheet may not reach anything else: its `@import` and `url()` are made inert (rule 12). */
export function inertCss(css: string): string {
  return css.replace(/@import/gi, '@mor-dropped-import').replace(/url\s*\(/gi, 'mor-dropped-url(');
}

export async function preparePage(
  bytes: Uint8Array,
  path: string,
  manifest: SiteManifest,
  getFile: (entry: FileEntry) => Promise<Uint8Array | null>,
): Promise<Prepared> {
  const doc = new DOMParser().parseFromString(new TextDecoder('utf-8', { fatal: true }).decode(bytes), 'text/html');
  const byPath = new Map(manifest.files.map((f) => [f.path, f]));
  const out: Prepared = { html: '', title: null, acts: [], films: [], listed: [], feeds: [], clocks: [], listings: [], writes: [], icon: null, problems: [], dropped: 0 };
  const drop = (el: Element) => {
    el.remove();
    out.dropped++;
  };
  /** The checked bytes of a file the page refers to, or null (and a problem) if they do not match. */
  const checked = async (entry: FileEntry): Promise<Uint8Array | null> => {
    const b = await getFile(entry);
    if (!b) out.problems.push(`${entry.path}, which this page uses, does not match what was signed`);
    return b;
  };

  // The poster a film names, checked as a picture (a picture that does not
  // match fails the page); none if it names anything but a picture of the version.
  const posterOf = async (el: Element): Promise<Uint8Array | null> => {
    const ref = el.getAttribute('poster');
    if (ref === null) return null;
    const pp = resolveRef(path, ref);
    const pe = pp ? byPath.get(pp) : undefined;
    if (pe && kindOf(pe.path) === 'picture') return checked(pe);
    out.dropped++;
    return null;
  };
  /** The film of the version an element's `src` names, or undefined. */
  const filmOf = (el: Element): FileEntry | undefined => {
    const p = resolveRef(path, el.getAttribute('src') ?? '');
    const entry = p ? byPath.get(p) : undefined;
    return entry && kindOf(entry.path) === 'film' ? entry : undefined;
  };

  // Films (rule 12a): a `video` naming a film of the same version, with a poster
  // picture of the same version or none, becomes a place the display client
  // fills with its own player, outside the page; nothing of it is fetched
  // until the visitor asks to play it. Its other attributes (autoplay, loop,
  // muted, sources, tracks) are not the page's to set. Any other `video` goes.
  // Only the places made here carry `data-film`: one a page wrote itself goes.
  for (const el of [...doc.querySelectorAll('[data-film], [data-film-listed], [data-feed], [data-write], [data-listing]')]) {
    el.removeAttribute('data-listing');
    el.removeAttribute('data-write');
    el.removeAttribute('data-film');
    el.removeAttribute('data-film-listed');
    el.removeAttribute('data-feed');
  }
  for (const video of [...doc.querySelectorAll('video')]) {
    const entry = filmOf(video);
    if (!entry) {
      drop(video);
      continue;
    }
    const poster = await posterOf(video);
    const place = doc.createElement('div');
    place.className = ['mor-film', video.getAttribute('class') ?? ''].join(' ').trim();
    if (video.id) place.id = video.id;
    const label = video.getAttribute('title') ?? video.getAttribute('aria-label');
    if (label) place.setAttribute('aria-label', label);
    place.setAttribute('data-film', String(out.films.length));
    out.films.push({ entry, poster });
    video.replaceWith(place);
  }

  // Films listed (draft 5, rule 12b): a `mor-film` naming a film of the same
  // version, with a poster of the same version or none, becomes a place for a
  // small button carrying its label (its text, nothing else of what it holds);
  // the display client lays its own button over it, which opens the film over
  // the page. A `mor-film` naming anything else goes, with its label: no
  // button is shown for a film the version does not hold.
  for (const el of [...doc.querySelectorAll('mor-film')]) {
    const entry = filmOf(el);
    if (!entry) {
      drop(el);
      continue;
    }
    const poster = await posterOf(el);
    const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim() || entry.path;
    const place = doc.createElement('span');
    place.className = ['mor-film-link', el.getAttribute('class') ?? ''].join(' ').trim();
    if (el.id) place.id = el.id;
    place.textContent = label;
    // The button laid over it carries the label to screen readers; the place only holds its room.
    place.setAttribute('aria-hidden', 'true');
    place.setAttribute('data-film-listed', String(out.listed.length));
    out.listed.push({ entry, poster, label });
    el.replaceWith(place);
  }

  for (const sel of DROP) for (const el of [...doc.querySelectorAll(sel)]) drop(el);
  for (const el of [...doc.querySelectorAll('*')]) {
    for (const a of [...el.attributes]) {
      const n = a.name.toLowerCase();
      if (n.startsWith('on') || LOADING.includes(n)) {
        el.removeAttribute(a.name);
        out.dropped++;
      }
    }
    const tag = el.localName;
    if (el.hasAttribute('src') && tag !== 'img') {
      el.removeAttribute('src');
      out.dropped++;
    }
    if (el.hasAttribute('href') && tag !== 'a' && tag !== 'area' && tag !== 'link') {
      el.removeAttribute('href');
      out.dropped++;
    }
  }

  // Pictures: only the site's own, as their checked bytes.
  for (const img of [...doc.querySelectorAll('img')]) {
    const p = resolveRef(path, img.getAttribute('src') ?? '');
    const entry = p ? byPath.get(p) : undefined;
    if (!entry || kindOf(entry.path) !== 'picture') {
      drop(img);
      continue;
    }
    const b = await checked(entry);
    if (b) img.setAttribute('src', URL.createObjectURL(new Blob([b as BlobPart], { type: 'image/jpeg' })));
    else drop(img);
  }

  // Stylesheets: only the site's own, checked, reaching nothing else. The icon:
  // the first link naming one of the site's pictures, kept as checked bytes for
  // the browser tab; the link itself leaves the page (rule 16a).
  for (const link of [...doc.querySelectorAll('link')]) {
    const rel = (link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
    if (rel.includes('icon') && !rel.includes('stylesheet')) {
      const p = resolveRef(path, link.getAttribute('href') ?? '');
      const entry = p ? byPath.get(p) : undefined;
      drop(link);
      if (entry && kindOf(entry.path) === 'picture' && !out.icon) out.icon = await checked(entry);
      continue;
    }
    const p = rel.includes('stylesheet') ? resolveRef(path, link.getAttribute('href') ?? '') : null;
    const entry = p ? byPath.get(p) : undefined;
    if (!entry || kindOf(entry.path) !== 'stylesheet') {
      drop(link);
      continue;
    }
    for (const a of [...link.attributes]) if (a.name !== 'rel' && a.name !== 'href' && a.name !== 'media') link.removeAttribute(a.name);
    const b = await checked(entry);
    if (!b) {
      drop(link);
      continue;
    }
    const css = inertCss(new TextDecoder().decode(b));
    link.setAttribute('href', URL.createObjectURL(new Blob([css], { type: 'text/css' })));
  }

  // Links: the site's own pages through the display client, at the top; https and mailto apart; nothing else.
  for (const a of [...doc.querySelectorAll('a[href], area[href]')]) {
    const href = a.getAttribute('href')!.trim();
    for (const attr of ['target', 'rel', 'download', 'referrerpolicy']) a.removeAttribute(attr);
    let scheme = '';
    try {
      scheme = /^[a-z][a-z0-9+.-]*:/i.test(href) ? new URL(href).protocol : '';
    } catch {
      scheme = 'bad:';
    }
    if (scheme === 'https:' || scheme === 'mailto:') {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('title', href);
      continue;
    }
    const p = !scheme && !href.startsWith('#') ? resolveRef(path, href) : null;
    if (p && byPath.has(p)) {
      a.setAttribute('href', addressOf(p));
      a.setAttribute('target', '_top');
      continue;
    }
    // Anything else is shown as text (rule 14).
    if (a.localName === 'area') {
      drop(a);
      continue;
    }
    const span = doc.createElement('span');
    span.append(...a.childNodes);
    a.replaceWith(span);
    out.dropped++;
  }

  // Acts: a box each, filled by the display client once the page is shown.
  for (const el of [...doc.querySelectorAll('mor-act')]) {
    const id = (el.getAttribute('act') ?? '').trim();
    const box = doc.createElement('div');
    box.className = 'mor-act';
    if (ACT.test(id)) {
      box.setAttribute('data-act', id);
      box.innerHTML = `<div class="mor-act-note">Fetching and checking act <code></code>…</div>`;
      box.querySelector('code')!.textContent = id;
      out.acts.push(id);
    } else {
      box.innerHTML = `<div class="mor-act-note">Not an act id: <code></code></div>`;
      box.querySelector('code')!.textContent = id || '(empty)';
    }
    el.replaceWith(box);
  }

  // Feeds (draft 6, rule 13a): a box each, filled by the display client with
  // the public posts of the identities each `mor-feed` names, every one
  // checked on its own. Of what it holds, only its `mor-author` elements
  // count: each an identity hash, and its text, the page's name for it.
  const authorsOf = (el: Element): Author[] => {
    const authors: Author[] = [];
    for (const a of [...el.querySelectorAll('mor-author')]) {
      const identity = (a.getAttribute('identity') ?? '').trim();
      if (!ACT.test(identity) || authors.some((x) => x.identity === identity)) {
        out.dropped++;
        continue;
      }
      const name = (a.textContent ?? '').replace(/\s+/g, ' ').trim();
      authors.push({ identity, name: name || null });
    }
    return authors;
  };
  // Writing boxes (draft 7, rule 13b): a place each, over which the display
  // client lays its own box, outside the page, where its code runs. The page
  // names the identities a visitor may write to; nothing else it holds counts.
  for (const el of [...doc.querySelectorAll('mor-write')]) {
    const authors = authorsOf(el);
    const place = doc.createElement('div');
    place.className = ['mor-write', el.getAttribute('class') ?? ''].join(' ').trim();
    if (el.id) place.id = el.id;
    if (authors.length) {
      place.setAttribute('data-write', String(out.writes.length));
      out.writes.push(authors);
    } else {
      place.innerHTML = `<div class="mor-act-note">A writing box naming no identity: nothing to write to.</div>`;
    }
    el.replaceWith(place);
  }
  // A feed's clock (draft 8): the first `mor-clock` naming an identity hash,
  // its text the page's name for it; any other is dropped.
  const clockOf = (el: Element): Author | null => {
    let clock: Author | null = null;
    for (const c of [...el.querySelectorAll('mor-clock')]) {
      const identity = (c.getAttribute('identity') ?? '').trim();
      if (clock || !ACT.test(identity)) {
        out.dropped++;
        continue;
      }
      const name = (c.textContent ?? '').replace(/\s+/g, ' ').trim();
      clock = { identity, name: name || null };
    }
    return clock;
  };
  for (const el of [...doc.querySelectorAll('mor-feed')]) {
    const authors = authorsOf(el);
    const clock = clockOf(el);
    const box = doc.createElement('div');
    box.className = ['mor-feed', el.getAttribute('class') ?? ''].join(' ').trim();
    if (el.id) box.id = el.id;
    if (authors.length) {
      box.setAttribute('data-feed', String(out.feeds.length));
      box.innerHTML = `<div class="mor-act-note">Fetching and checking the public posts of ${authors.length === 1 ? 'one identity' : `${authors.length} identities`}…</div>`;
      out.feeds.push(authors);
      out.clocks.push(clock);
    } else {
      box.innerHTML = `<div class="mor-act-note">A feed naming no identity: nothing to show.</div>`;
    }
    el.replaceWith(box);
  }

  // Listings (draft 9, rule 13c): a box each, filled by the display client
  // with the specifications published on the relays each `mor-listing`
  // names, every one checked on its own. Of what it holds, only its
  // `mor-relay` elements count: each a relay's address, and its text, the
  // page's name for it; and its `reader` attribute, where the links to the
  // public terms of the agreements it counts open.
  for (const el of [...doc.querySelectorAll('mor-listing')]) {
    const relays: ListedRelay[] = [];
    for (const r of [...el.querySelectorAll('mor-relay')]) {
      const address = (r.getAttribute('address') ?? '').trim().replace(/\/$/, '');
      let ok = false;
      try {
        const u = new URL(address);
        ok = (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password && !u.search && !u.hash;
      } catch {
        ok = false;
      }
      if (!ok || relays.some((x) => x.address === address)) {
        out.dropped++;
        continue;
      }
      const name = (r.textContent ?? '').replace(/\s+/g, ' ').trim();
      relays.push({ address, name: name || null });
    }
    const box = doc.createElement('div');
    box.className = ['mor-listing', el.getAttribute('class') ?? ''].join(' ').trim();
    if (el.id) box.id = el.id;
    if (relays.length) {
      box.setAttribute('data-listing', String(out.listings.length));
      box.innerHTML = `<div class="mor-act-note">Reading and checking the specifications published on ${relays.length === 1 ? 'one relay' : `${relays.length} relays`}…</div>`;
      // The reader its links to public terms open in: an https address, followed by `#` and an act id.
      let reader: string | null = null;
      try {
        const u = new URL((el.getAttribute('reader') ?? '').trim());
        if (u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash) reader = u.href;
      } catch {
        reader = null;
      }
      out.listings.push({ relays, reader });
    } else {
      box.innerHTML = `<div class="mor-act-note">A listing naming no relay: nothing to read.</div>`;
    }
    el.replaceWith(box);
  }

  out.title = doc.querySelector('title')?.textContent?.trim() || null;
  const frameStyle = doc.createElement('link');
  frameStyle.rel = 'stylesheet';
  frameStyle.href = URL.createObjectURL(new Blob([FRAME_STYLE], { type: 'text/css' }));
  doc.head.prepend(frameStyle);
  out.html = `<!doctype html>\n${doc.documentElement.outerHTML}`;
  return out;
}
