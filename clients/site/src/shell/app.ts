// The gateway's display client, in the visitor's browser (website cMIP,
// "Showing a site"). The gateway serves this same page at every address of
// the site. It reads the gateway's settings, checks the version with the
// core library (the publication, its signer's chain, the manifest), fetches
// the file this address names, checks its bytes against the manifest, and
// only then shows it, under a bar that says who signed it and whether it
// verified. A file that does not match is not shown.

import { readPost } from '../../../barebone/src/post.ts';
import { renderPost } from '../../../barebone/src/html.ts';
import { kindOf, pathFor, type FileEntry } from '../manifest.ts';
import { parseSiteSettings, type SiteSettings } from '../settings.ts';
import { matches, openVersion } from '../verify.ts';
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
      inner.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${actStyle}"></head><body>${html}</body></html>`;
      inner.addEventListener('load', () => {
        const d = inner.contentDocument;
        if (!d) return;
        const fit = () => (inner.style.height = `${d.documentElement.scrollHeight}px`);
        fit();
        new ResizeObserver(fit).observe(d.body);
      });
      box.replaceChildren(inner);
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
    frame.addEventListener('load', () => void showActs(frame, settings), { once: true });
    frame.srcdoc = prepared.html;
    view.replaceChildren(frame);
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
}

void main();
