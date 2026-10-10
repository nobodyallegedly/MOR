// A page of the site, made ready to show (website cMIP, rules 11 to 16):
// parsed, everything that would run code or load from elsewhere dropped,
// pictures and stylesheets replaced by the checked bytes themselves, each
// film turned into a place the display client fills with its own player
// (draft 4, rule 12a), its poster checked as a picture is, links
// to the site's own pages sent to the top window, links leaving the site
// opened apart, and every `mor-act` turned into a box the display client
// fills with the act, judged on its own. The page is then shown in a frame
// whose sandbox forbids scripts, so even what this misses cannot run.

import { addressOf, kindOf, resolveRef, type FileEntry, type SiteManifest } from '../manifest.ts';
import { FRAME_STYLE } from './view.ts';

export interface Prepared {
  /** The page's HTML, for the frame's `srcdoc`. */
  html: string;
  title: string | null;
  /** The acts the page shows, in order. */
  acts: string[];
  /** The films the page shows (rule 12a), in order: each one's entry, and its poster's checked bytes. Their places carry `data-film`, the index here. */
  films: { entry: FileEntry; poster: Uint8Array | null }[];
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
  const out: Prepared = { html: '', title: null, acts: [], films: [], icon: null, problems: [], dropped: 0 };
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

  // Films (rule 12a): a `video` naming a film of the same version, with a poster
  // picture of the same version or none, becomes a place the display client
  // fills with its own player, outside the page; nothing of it is fetched
  // until the visitor asks to play it. Its other attributes (autoplay, loop,
  // muted, sources, tracks) are not the page's to set. Any other `video` goes.
  for (const video of [...doc.querySelectorAll('video')]) {
    const p = resolveRef(path, video.getAttribute('src') ?? '');
    const entry = p ? byPath.get(p) : undefined;
    if (!entry || kindOf(entry.path) !== 'film') {
      drop(video);
      continue;
    }
    let poster: Uint8Array | null = null;
    const posterRef = video.getAttribute('poster');
    if (posterRef !== null) {
      const pp = resolveRef(path, posterRef);
      const pe = pp ? byPath.get(pp) : undefined;
      if (pe && kindOf(pe.path) === 'picture') poster = await checked(pe);
      else out.dropped++;
    }
    const place = doc.createElement('div');
    place.className = ['mor-film', video.getAttribute('class') ?? ''].join(' ').trim();
    if (video.id) place.id = video.id;
    const label = video.getAttribute('title') ?? video.getAttribute('aria-label');
    if (label) place.setAttribute('aria-label', label);
    place.setAttribute('data-film', String(out.films.length));
    out.films.push({ entry, poster });
    video.replaceWith(place);
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

  out.title = doc.querySelector('title')?.textContent?.trim() || null;
  const frameStyle = doc.createElement('link');
  frameStyle.rel = 'stylesheet';
  frameStyle.href = URL.createObjectURL(new Blob([FRAME_STYLE], { type: 'text/css' }));
  doc.head.prepend(frameStyle);
  out.html = `<!doctype html>\n${doc.documentElement.outerHTML}`;
  return out;
}
