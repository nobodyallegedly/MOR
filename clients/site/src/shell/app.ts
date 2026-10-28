// The gateway's display client, in the visitor's browser (website cMIP,
// "Showing a site"). The gateway serves this same page at every address of
// the site. It reads the gateway's settings, checks the version with the
// core library (the publication, its signer's chain, the manifest), fetches
// the file this address names, checks its bytes against the manifest, and
// only then shows it, under a bar that says who signed it and whether it
// verified. A file that does not match is not shown. A film is fetched and
// checked only when the visitor presses play (draft 4, rule 12a; film.ts);
// a film the page lists, when its button is pressed, over the page (draft 5,
// rule 12b; popup.ts). A feed the page names is filled with the public
// posts of its identities, each checked on its own (draft 6, rule 13a;
// feed.ts). A listing the page names is filled with the specifications
// published on its relays, each checked on its own (draft 9, rule 13c;
// listing.ts).

import { releaseLoad } from './hold.ts';
import { readPost } from '../../../barebone/src/post.ts';
import { renderPost } from '../../../barebone/src/html.ts';
import { kindOf, pathFor, type FileEntry } from '../manifest.ts';
import { parseSiteSettings, type SiteSettings } from '../settings.ts';
import { findLater } from '../latest.ts';
import { matches, openVersion, type Version } from '../verify.ts';
import { readFeed, type Author } from '../feed.ts';
import { FEED_STYLE, feedHtml } from './feed-view.ts';
import { writeBox } from './write-box.ts';
import { readListing } from '../listing.ts';
import type { ListingAsked } from './page.ts';
import { LISTING_STYLE, listingHtml } from './listing-view.ts';
import { filmPlayer, layOver } from './film.ts';
import { preparePage } from './page.ts';
import { openPopup, type Listed } from './popup.ts';
import { ACT_STYLE, bar, fontFaces, briefWords, failingWords, verifiedWords, type BarState, type FilmLine } from './view.ts';

const barEl = document.getElementById('mor-bar')!;
const view = document.getElementById('mor-view')!;
const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

const state: BarState = {
  phase: 'checking',
  words: 'Checking this page against what its owner signed…',
  brief: null,
  settings: null,
  version: null,
  path: null,
  work: null,
  acts: [],
  films: [],
  feeds: [],
  listings: [],
  writes: [],
  reasons: [],
  newer: null,
};

function paint(): void {
  barEl.className = state.phase;
  barEl.innerHTML = bar(state);
}

function fail(what: string, reasons: string[] = []): void {
  state.phase = 'bad';
  state.words = failingWords(what);
  state.brief = null;
  state.reasons = reasons;
  view.innerHTML = '';
  paint();
}

/** A file of the site as this gateway serves it, checked against its entry; null if it does not match. */
async function gatewayFile(entry: FileEntry, signal?: AbortSignal): Promise<Uint8Array | null> {
  const r = await fetch(`/_mor/file/${entry.path}`, { cache: 'no-store', signal });
  if (!r.ok) return null;
  const b = new Uint8Array(await r.arrayBuffer());
  return matches(entry, b) ? b : null;
}

/** Fill each act's box with the act, fetched and judged on its own, in a frame of its own. */
async function showActs(frame: HTMLIFrameElement, settings: SiteSettings): Promise<void> {
  const doc = frame.contentDocument;
  if (!doc) return;
  const actStyle = URL.createObjectURL(new Blob([ACT_STYLE], { type: 'text/css' }));
  for (const box of [...doc.querySelectorAll<HTMLElement>('.mor-act[data-act]')]) {
    const id = box.dataset.act!;
    const line = state.acts.find((a) => a.id === id)!;
    try {
      const post = await readPost(id, settings.relays);
      line.standing = post.standing;
      line.signer = post.signer;
      const inner = doc.createElement('iframe');
      inner.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      inner.setAttribute('title', `Act ${id}`);
      const html = renderPost(post).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
      // Written into the frame at once, rather than waiting for the frame's
      // load event: Safari's engine, WebKit, runs no listener for an event in
      // a document that may not run scripts, as the page's frame may not, so
      // the act's frame was never sized there and scrolled in a short box.
      box.replaceChildren(inner);
      const d = inner.contentDocument!;
      d.open();
      d.write(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${actStyle}"></head><body>${html}</body></html>`);
      d.close();
      fitFrame(inner);
    } catch (err) {
      line.problem = message(err);
      const note = doc.createElement('div');
      note.className = 'mor-act-note';
      note.textContent = `Act ${id} not shown: ${message(err)}.`;
      box.replaceChildren(note);
    }
    paint();
  }
}

/**
 * Fill each feed's box (draft 6, rule 13a): the public posts of the
 * identities it names, found through their homes and outbox routes and the
 * gateway's relays, each judged on its own, in a frame of its own apart from
 * the page's styles. Feeds are filled one after another, after the acts.
 */
async function showFeeds(frame: HTMLIFrameElement, settings: SiteSettings, feeds: Author[][], clocks: (Author | null)[]): Promise<void> {
  const doc = frame.contentDocument;
  if (!doc || !feeds.length) return;
  const style = URL.createObjectURL(new Blob([`${fontFaces(location.origin)}\n${FEED_STYLE}`], { type: 'text/css' }));
  for (const box of [...doc.querySelectorAll<HTMLElement>('.mor-feed[data-feed]')]) {
    const i = Number(box.dataset.feed);
    const authors = feeds[i];
    const line = state.feeds[i];
    if (!authors || !line) continue;
    try {
      const feed = await readFeed(authors, settings.relays, {}, undefined, clocks[i] ?? null);
      line.found = feed.authors;
      line.clockFound = feed.clock;
      line.order = feed.order;
      line.shown = feed.posts.length;
      line.verified = feed.posts.filter((p) => !p.problem).length;
      const inner = doc.createElement('iframe');
      inner.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      inner.setAttribute('title', 'Public posts');
      const html = feedHtml(feed, authors, style).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
      box.replaceChildren(inner);
      const d = inner.contentDocument!;
      d.open();
      d.write(html);
      d.close();
      fitFrame(inner);
    } catch (err) {
      line.found = [];
      const note = doc.createElement('div');
      note.className = 'mor-act-note';
      note.textContent = `The feed could not be read: ${message(err)}.`;
      box.replaceChildren(note);
    }
    box.dataset.done = '';
    paint();
  }
}

/**
 * Fill each listing's box (draft 9, rule 13c): the specifications published
 * on the relays it names, each judged on its own, in a frame of its own
 * apart from the page's styles. Listings are filled one after another,
 * after the feeds.
 */
async function showListings(frame: HTMLIFrameElement, settings: SiteSettings, listings: ListingAsked[]): Promise<void> {
  const doc = frame.contentDocument;
  if (!doc || !listings.length) return;
  const style = URL.createObjectURL(new Blob([`${fontFaces(location.origin)}\n${LISTING_STYLE}`], { type: 'text/css' }));
  for (const box of [...doc.querySelectorAll<HTMLElement>('.mor-listing[data-listing]')]) {
    const i = Number(box.dataset.listing);
    const asked = listings[i];
    const line = state.listings[i];
    if (!asked || !line) continue;
    try {
      const listing = await readListing(asked.relays, settings.relays);
      line.read = listing.relays;
      line.verified = listing.lines.reduce((n, l) => n + l.drafts.length, 0) + listing.mips.count;
      line.unverified = listing.unverified.length;
      line.agreements = listing.agreements;
      line.extensions = listing.extensions.length;
      line.xtypes = { listed: listing.xtypes.length, acts: listing.xtypes.reduce((n, l) => n + (l.use?.acts ?? 0), 0) };
      line.mips = { listed: listing.mips.count, under: listing.mips.roots.filter((r) => r.total).length, versions: listing.versions.length };
      const inner = doc.createElement('iframe');
      inner.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      inner.setAttribute('title', 'Specifications');
      box.replaceChildren(inner);
      const d = inner.contentDocument!;
      d.open();
      d.write(listingHtml(listing, style, asked.reader).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" '));
      d.close();
      fitFrame(inner);
    } catch (err) {
      line.read = [];
      const note = doc.createElement('div');
      note.className = 'mor-act-note';
      note.textContent = `The listing could not be read: ${message(err)}.`;
      box.replaceChildren(note);
    }
    box.dataset.done = '';
    paint();
  }
}

/**
 * Lay a writing box over each place the page gave one (draft 7, rule 13b):
 * the display client's own, outside the page, where its code runs. The
 * place is made as tall as the box, so the page flows around it.
 */
function showWrites(frame: HTMLIFrameElement, settings: SiteSettings, writes: Author[][]): void {
  const doc = frame.contentDocument;
  if (!doc || !writes.length) return;
  const over = new Map<HTMLElement, HTMLElement>();
  for (const spot of [...doc.querySelectorAll<HTMLElement>('.mor-write[data-write]')]) {
    const authors = writes[Number(spot.dataset.write)];
    if (!authors) continue;
    const box = writeBox(authors, settings.relays, settings.messageHomes);
    box.style.visibility = 'hidden';
    view.append(box);
    // The box's own height, laid out at the place's width, sets the place's.
    const fit = () => {
      box.style.width = `${spot.getBoundingClientRect().width}px`;
      const h = box.scrollHeight;
      if (Math.abs(spot.offsetHeight - h) > 1) spot.style.height = `${h}px`;
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(spot);
    watch.observe(box.firstElementChild!);
    box.style.visibility = '';
    over.set(spot, box);
  }
  layOver(frame, over);
}

/**
 * Make a frame as tall as what it shows (the page, or an act in it), now and
 * whenever that grows or shrinks (an act shown, a picture loaded, a turned
 * phone), so that nothing scrolls inside it: the browser's own scrolling is
 * the only one. Capped, so that a page whose height follows its frame's
 * cannot grow it without end. Uses no event of the framed document, which
 * WebKit would not deliver there: the observer belongs to this window.
 */
function fitFrame(frame: HTMLIFrameElement): void {
  const doc = frame.contentDocument;
  if (!doc) return;
  const fit = () => {
    const h = Math.min(Math.ceil(doc.documentElement.getBoundingClientRect().height), 100_000);
    if (Math.abs(frame.clientHeight - h) > 1) frame.style.height = `${h}px`;
  };
  fit();
  new ResizeObserver(fit).observe(doc.documentElement);
}

/** The page's icon on the browser tab: the picture's checked bytes, never an address (rule 16a). */
function showIcon(bytes: Uint8Array): void {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.head.appendChild(document.createElement('link'));
  link.rel = 'icon';
  link.type = 'image/jpeg';
  link.href = `data:image/jpeg;base64,${btoa(s)}`;
}

/**
 * Give each film of the page its player, laid over the place the page gave
 * it. The poster's own shape, once known, becomes the place's shape (a page's
 * stylesheet may still size it), so the film is not cropped. Give each film
 * the page lists its button, laid over its place, which opens the film over
 * the page (draft 5, rule 12b).
 */
function showFilms(frame: HTMLIFrameElement, films: { entry: FileEntry; poster: Uint8Array | null }[], listed: Listed[]): void {
  const doc = frame.contentDocument;
  if (!doc || (!films.length && !listed.length)) return;
  const over = new Map<HTMLElement, HTMLElement>();
  for (const spot of [...doc.querySelectorAll<HTMLElement>('.mor-film[data-film]')]) {
    const film = films[Number(spot.dataset.film)];
    if (!film) continue;
    const line: FilmLine = { path: film.entry.path, state: 'waiting', why: null };
    state.films.push(line);
    const shape = (w: number, h: number) => {
      if (w && h) spot.style.aspectRatio = `${w} / ${h}`;
    };
    over.set(spot, filmPlayer(film.entry, film.poster, gatewayFile, line, paint, shape));
  }
  for (const spot of [...doc.querySelectorAll<HTMLElement>('.mor-film-link[data-film-listed]')]) {
    const film = listed[Number(spot.dataset.filmListed)];
    if (!film) continue;
    const line: FilmLine = { path: film.entry.path, state: 'waiting', why: null, label: film.label };
    state.films.push(line);
    // A film checked once is not fetched again when its pop-up opens again.
    let kept: Uint8Array | null = null;
    const get = async (entry: FileEntry, signal?: AbortSignal) => (kept ??= await gatewayFile(entry, signal));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mor-film-open';
    button.dataset.film = film.entry.path;
    button.textContent = film.label;
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openPopup(film, get, line, paint, button));
    over.set(spot, button);
  }
  view.append(...over.values());
  layOver(frame, over);
  paint();
}

/**
 * Look for later versions of the site, whatever the gateway's setting, and
 * say when a newer one exists (cMIP rule 24). The page is already shown:
 * this never holds it back.
 */
async function lookForLater(version: Version): Promise<void> {
  const later = await findLater(version);
  state.newer = { latest: later.latest.version === version.version ? null : later.latest.version, fork: later.fork };
  paint();
  barEl.dataset.looked = '';
}

async function main(): Promise<void> {
  paint();
  let settings: SiteSettings;
  try {
    const r = await fetch('/_mor/site.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    settings = parseSiteSettings(await r.json());
  } catch (err) {
    fail(`this gateway's settings could not be read (${message(err)}).`);
    return;
  }
  state.settings = settings;
  const path = pathFor(location.pathname);
  state.path = path;
  paint();

  const version = await openVersion(settings.version, settings.identity, settings.relays);
  state.version = version;
  if (!version.ok) {
    fail('the site this gateway serves does not verify.', version.problems);
    return;
  }
  const entry = path ? version.manifest!.files.find((f) => f.path === path) : undefined;
  if (!entry) {
    document.title = `Not found · ${version.manifest!.name}`;
    fail(`the signed site has no file at this address (${location.pathname}).`, [
      `The site holds: ${version.manifest!.files.map((f) => f.path).join(', ')}.`,
    ]);
    view.innerHTML = `<p class="note">Nothing here. <a href="/">The front page</a>.</p>`;
    return;
  }
  state.work = entry.work;
  paint();
  let bytes: Uint8Array | null;
  try {
    bytes = await gatewayFile(entry);
  } catch (err) {
    fail(`this page could not be fetched from the gateway (${message(err)}).`);
    return;
  }
  if (!bytes) {
    fail(`what this gateway served for ${entry.path} is not what was signed.`, [
      `Its bytes do not match the work hash and size in the signed manifest. The gateway, or something between it and this browser, altered them.`,
    ]);
    return;
  }

  const kind = kindOf(entry.path)!;
  if (kind === 'page') {
    let prepared;
    try {
      prepared = await preparePage(bytes, entry.path, version.manifest!, gatewayFile);
    } catch (err) {
      fail(`this page could not be read (${message(err)}).`);
      return;
    }
    if (prepared.problems.length) {
      fail(`a file this page uses is not what was signed.`, prepared.problems);
      return;
    }
    document.title = `${prepared.title ?? entry.path} · ${version.manifest!.name}`;
    state.acts = prepared.acts.map((id) => ({ id, standing: null, signer: null, problem: null }));
    state.writes = prepared.writes;
    state.listings = prepared.listings.map((l) => ({ relays: l.relays, read: null, verified: 0, unverified: 0, agreements: null, extensions: 0, xtypes: null, mips: null }));
    state.feeds = prepared.feeds.map((authors, i) => ({ authors, clock: prepared.clocks[i] ?? null, found: null, clockFound: null, order: null, shown: 0, verified: 0 }));
    state.phase = 'ok';
    state.words = verifiedWords(settings, 'page');
    state.brief = briefWords(settings);
    paint();
    const frame = document.createElement('iframe');
    // No allow-scripts: nothing in the page can run (rule 11).
    frame.setAttribute('sandbox', 'allow-same-origin allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox');
    frame.setAttribute('title', prepared.title ?? entry.path);
    frame.id = 'mor-page';
    frame.addEventListener(
      'load',
      () => {
        fitFrame(frame);
        showFilms(frame, prepared.films, prepared.listed);
        showWrites(frame, settings, prepared.writes);
        void showActs(frame, settings).then(() => showFeeds(frame, settings, prepared.feeds, prepared.clocks)).then(() => showListings(frame, settings, prepared.listings));
      },
      { once: true },
    );
    frame.srcdoc = prepared.html;
    if (prepared.icon) showIcon(prepared.icon);
    view.replaceChildren(frame);
    void lookForLater(version);
    return;
  }

  document.title = `${entry.path} · ${version.manifest!.name}`;
  state.phase = 'ok';
  state.words = verifiedWords(settings, kind === 'picture' ? 'picture' : kind === 'film' ? 'film' : 'file');
  state.brief = briefWords(settings);
  paint();
  const box = document.createElement('div');
  box.className = 'file';
  if (kind === 'film') {
    // The film at its own address: its bytes are already here and checked
    // (that is how this address works for every file), so the player only
    // reads them with the video Module when the visitor presses play.
    const line: FilmLine = { path: entry.path, state: 'waiting', why: null };
    state.films = [line];
    const checkedBytes = bytes;
    box.append(filmPlayer(entry, null, async () => checkedBytes, line, paint));
  } else if (kind === 'picture') {
    const img = document.createElement('img');
    img.alt = entry.path;
    img.src = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'image/jpeg' }));
    box.append(img);
  } else {
    const pre = document.createElement('pre');
    pre.textContent = new TextDecoder().decode(bytes);
    box.append(pre);
  }
  view.replaceChildren(box);
  void lookForLater(version);
}

// The window finishes loading once the icon is on the tab, or there is none (hold.ts).
void main().finally(releaseLoad);
