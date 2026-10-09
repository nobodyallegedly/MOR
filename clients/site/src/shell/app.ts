// The gateway's display client, in the visitor's browser (website cMIP,
// "Showing a site"). The gateway serves this same page at every address of
// the site. It reads the gateway's settings, checks the version with the
// core library (the publication, its signer's chain, the manifest), fetches
// the file this address names, checks its bytes against the manifest, and
// only then shows it, under a bar that says who signed it and whether it
// verified. A file that does not match is not shown.

import { releaseLoad } from './hold.ts';
import { readPost } from '../../../barebone/src/post.ts';
import { renderPost } from '../../../barebone/src/html.ts';
import { kindOf, pathFor, type FileEntry } from '../manifest.ts';
import { parseSiteSettings, type SiteSettings } from '../settings.ts';
import { findLater } from '../latest.ts';
import { matches, openVersion, type Version } from '../verify.ts';
import { preparePage } from './page.ts';
import { ACT_STYLE, bar, failingWords, verifiedWords, type BarState } from './view.ts';

const barEl = document.getElementById('mor-bar')!;
const view = document.getElementById('mor-view')!;
const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

const state: BarState = {
  phase: 'checking',
  words: 'Checking this page against what its owner signed…',
  settings: null,
  version: null,
  path: null,
  work: null,
  acts: [],
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
  state.reasons = reasons;
  view.innerHTML = '';
  paint();
}

/** A file of the site as this gateway serves it, checked against its entry; null if it does not match. */
async function gatewayFile(entry: FileEntry): Promise<Uint8Array | null> {
  const r = await fetch(`/_mor/file/${entry.path}`, { cache: 'no-store' });
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
    state.phase = 'ok';
    state.words = verifiedWords(settings, 'page');
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
        void showActs(frame, settings);
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
  state.words = verifiedWords(settings, kind === 'picture' ? 'picture' : 'file');
  paint();
  const box = document.createElement('div');
  box.className = 'file';
  if (kind === 'picture') {
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
