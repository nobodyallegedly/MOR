// The display client's own parts, as HTML strings: the bar above every file
// (website cMIP, rule 9), the stylesheets, and the frames' styles. Everything
// that comes from the site, the settings or an act is escaped.

import { escapeHtml as e } from '../../../longform/src/html.ts';
import { STYLE as POST_STYLE } from '../../../barebone/src/html.ts';
import { fingerprint, standingWords } from '../../../reader/src/read.ts';
import type { SiteSettings } from '../settings.ts';
import type { Version } from '../verify.ts';
import type { Author, AuthorLine } from '../feed.ts';

/**
 * The display client's own page: the bar on top, the file below. The page's
 * frame is as tall as the page (app.ts), so the browser's own scrolling is the
 * only one: no box scrolls inside the page (layout decided by Nobody,
 * allegedly, 7 October 2026). Frames are `width:1px;min-width:100%`, since
 * Safari on phones otherwise widens a frame to its content.
 */
export const STYLE = `:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 22%,transparent);--soft:color-mix(in srgb,CanvasText 70%,Canvas);--ok:#1a7f37;--bad:#b3261e;--bar:color-mix(in srgb,CanvasText 6%,Canvas)}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:Canvas;color:CanvasText;font:15px/1.45 system-ui,sans-serif}
#mor-bar{flex:none;padding:8px 16px;border-bottom:2px solid var(--line);background:var(--bar);max-height:60vh;overflow:auto}
#mor-bar.ok{border-bottom-color:var(--ok)}
#mor-bar.bad{border-bottom-color:var(--bad)}
#mor-bar .standing{font-weight:600}
#mor-bar .brief{display:none}
@media (max-width:40em),(max-height:30em){#mor-bar .brief{display:block}#mor-bar .brief+.standing{display:none}}
#mor-bar.ok .standing{color:var(--ok)}
#mor-bar.bad .standing{color:var(--bad)}
#mor-bar .newer{margin-top:4px;font-weight:600}
#mor-bar details{margin-top:4px;font-size:13px}
#mor-bar summary{cursor:pointer;color:var(--soft)}
#mor-bar dl{margin:6px 0;display:grid;grid-template-columns:max-content 1fr;gap:4px 12px}
#mor-bar dt{color:var(--soft)}
#mor-bar dd{margin:0;overflow-wrap:anywhere}
#mor-bar ul{margin:4px 0;padding-left:18px}
code,.fp{font-family:ui-monospace,Menlo,monospace;font-size:.92em;overflow-wrap:anywhere}
.ok-word{color:var(--ok);font-weight:600}
.bad-word{color:var(--bad);font-weight:600}
#mor-view{flex:1;position:relative}
#mor-view>iframe{display:block;width:1px;min-width:100%;height:calc(100vh - 4em);border:0;background:Canvas}
#mor-view>.file{padding:16px}
#mor-view img{max-width:100%;height:auto;image-orientation:from-image}
#mor-view pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.5 ui-monospace,Menlo,monospace}
.note{max-width:42em;margin:24px auto;padding:10px 12px;border-left:3px solid var(--bad)}
.mor-player{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#000;color:#fff;overflow:hidden;font:14px/1.4 system-ui,sans-serif}
.file .mor-player{position:relative;width:100%;aspect-ratio:16/9}
.mor-player>img,.mor-player>video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;max-width:none}
.mor-player>button{position:relative;font:600 16px system-ui,sans-serif;padding:12px 20px;border:0;border-radius:999px;background:rgba(0,0,0,.65);color:#fff;cursor:pointer}
.mor-player>.mor-film-note{position:relative;max-width:90%;padding:4px 10px;border-radius:6px;background:rgba(0,0,0,.65);text-align:center}
.mor-player.played>.mor-film-note{display:none}
.mor-film-open{position:absolute;margin:0;padding:0;border:0;border-radius:999px;background:transparent;color:transparent;font:inherit;cursor:pointer;overflow:hidden;white-space:nowrap}
.mor-film-open:hover{background:rgba(127,127,127,.18)}
.mor-film-open:focus-visible{outline:3px solid Highlight;outline-offset:2px}
.mor-popup{position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,.8)}
.mor-popup-panel{display:flex;flex-direction:column;gap:8px;width:min(100%,64em);max-height:100%}
.mor-popup-head{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;font:600 16px/1.3 system-ui,sans-serif}
.mor-popup-title{overflow-wrap:anywhere}
.mor-popup-close{flex:none;min-height:44px;padding:8px 16px;border:2px solid #fff;border-radius:999px;background:#000;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer}
.mor-popup .mor-player{position:relative;align-self:center;width:min(100%,calc((100vh - 96px) * var(--shape,1.7778)));width:min(100%,calc((100dvh - 96px) * var(--shape,1.7778)));aspect-ratio:var(--shape,16/9)}
.mor-write-box{position:absolute;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:Canvas;color:CanvasText;font:16px/1.45 system-ui,-apple-system,sans-serif;overflow:hidden}
.mw-inner{display:flex;flex-direction:column;gap:8px}
.mw-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.mw-lab{min-width:2.2em;font-size:14px;color:var(--soft)}
.mw-opt{min-height:40px;padding:6px 14px;border:1px solid var(--line);border-radius:999px;background:Canvas;color:CanvasText;font:600 15px system-ui,sans-serif;cursor:pointer}
.mw-opt[aria-pressed=true]{background:CanvasText;color:Canvas;border-color:CanvasText}
.mw-means,.mw-always{margin:0;font-size:14px}
.mw-always{color:var(--soft);font-size:13px}
.mw-text{width:100%;min-height:6em;padding:8px;border:1px solid var(--line);border-radius:8px;background:Canvas;color:CanvasText;font:16px/1.4 system-ui,sans-serif;resize:vertical}
.mw-send-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.mw-send{min-height:44px;padding:8px 22px;border:0;border-radius:999px;background:var(--ok);color:#fff;font:600 16px system-ui,sans-serif;cursor:pointer}
.mw-send:disabled{opacity:.5;cursor:default}
.mw-status{font-size:14px}
.mw-ok{color:var(--ok)}
.mw-bad{color:var(--bad)}`;

/** Put first in every page's frame: the boxes where acts are shown, the places films are played, and links that leave the site. */
export const FRAME_STYLE = `.mor-act{display:block;margin:1em 0}
.mor-film{display:block;width:100%;aspect-ratio:16/9;background:#000}
.mor-film-link{display:inline-block;padding:.4em 1em;border:1px solid currentColor;border-radius:999px;font:600 14px/1.3 system-ui,sans-serif;white-space:nowrap}
.mor-act>iframe{display:block;width:1px;min-width:100%;border:0;min-height:4em}
.mor-feed{display:block;margin:1em 0}
.mor-write{display:block;margin:1em 0;min-height:4em}
.mor-feed>iframe{display:block;width:1px;min-width:100%;border:0;min-height:4em}
.mor-act-note{font:13px system-ui,sans-serif;padding:8px;border:1px dashed currentColor;border-radius:4px}`;

/** Inside an act's own frame: the post as the reader shows it, its picture scaled to the frame's width, whole. */
export const ACT_STYLE = `${POST_STYLE}
:root{color-scheme:light dark}
body{margin:0;background:Canvas;color:CanvasText;font:16px/1.5 Georgia,'Times New Roman',serif}
.mor-post{margin:0}
.mor-post img{width:100%}`;

export interface ActLine {
  id: string;
  standing: string | null;
  signer: string | null;
  problem: string | null;
}

/** What the display client found after the version shown (cMIP rule 24). */
export interface Newer {
  /** The latest version found, if later than the one shown. */
  latest: string | null;
  /** Versions naming the same one, where following stopped. */
  fork: string[];
}

/** A film a page shows, or the film at this address (rule 12a): fetched and checked only when the visitor asks to play it. */
export interface FilmLine {
  path: string;
  state: 'waiting' | 'checking' | 'verified' | 'failing' | 'cannot';
  /** Why it failed, or why this browser cannot play it. */
  why: string | null;
  /** The label of a film the page lists (draft 5, rule 12b). */
  label?: string;
}

/** A feed a page shows (draft 6, rule 13a): the identities it names, and what was found for each. */
export interface FeedLine {
  authors: Author[];
  /** Null while fetching and checking. */
  found: AuthorLine[] | null;
  /** Posts shown, and of those, how many verified. */
  shown: number;
  verified: number;
}

export interface BarState {
  phase: 'checking' | 'ok' | 'bad';
  /** The sentence on top, in plain words. */
  words: string;
  /** The same, briefly, shown instead on a narrow or short screen (a phone); null to show `words` on every screen. */
  brief: string | null;
  settings: SiteSettings | null;
  version: Version | null;
  path: string | null;
  work: string | null;
  acts: ActLine[];
  films: FilmLine[];
  feeds: FeedLine[];
  /** The writing boxes the page shows (draft 7, rule 13b): the identities each writes to. */
  writes: Author[][];
  reasons: string[];
  /** Null while looking for later versions, or before. */
  newer: Newer | null;
}

function actItem(a: ActLine): string {
  if (a.problem) return `<li><code>${e(a.id)}</code>: <span class="bad-word">not shown</span>, ${e(a.problem)}</li>`;
  if (!a.standing) return `<li><code>${e(a.id)}</code>: checking…</li>`;
  const w = standingWords(a.standing);
  return `<li><code>${e(a.id)}</code>: <span class="${w.ok ? 'ok-word' : 'bad-word'}">${w.ok ? 'verified' : e(a.standing)}</span>, signed by <span class="fp">${fingerprint(a.signer!)}</span></li>`;
}

function feedItem(f: FeedLine): string {
  const who = (a: Author) => `${a.name ? `${e(a.name)}, ` : ''}<span class="fp">${fingerprint(a.identity)}</span>`;
  if (!f.found) return `<li>checking the posts of ${f.authors.map(who).join('; ')}…</li>`;
  const lines = f.found.map((a) => {
    const where = a.problem
      ? `<span class="bad-word">not looked up</span>, ${e(a.problem)}`
      : `${a.found} ${a.found === 1 ? 'post' : 'posts'} found, ${a.verified} shown verified; asked: ${a.asked.map((h) => `<code>${e(h)}</code>`).join(', ')}`;
    const away = a.unreachable.length ? `; not reachable from a browser, not asked: ${a.unreachable.map((h) => `<code>${e(h)}</code>`).join(', ')}` : '';
    return `<li>${who(a)}: ${where}${away}</li>`;
  });
  const bad = f.shown - f.verified;
  return `<li>${f.shown} ${f.shown === 1 ? 'post' : 'posts'} shown, ${f.verified} verified${bad ? `, <span class="bad-word">${bad} not verified</span>` : ''}. The names are this page's; the identities are what was checked.<ul>${lines.join('')}</ul></li>`;
}

function filmItem(f: FilmLine): string {
  const words = {
    waiting: 'not fetched; checked against what was signed before it plays',
    checking: 'fetching and checking…',
    verified: '<span class="ok-word">verified</span>: exactly what was signed',
    failing: '<span class="bad-word">failing</span>: not played',
    cannot: '<span class="bad-word">not played</span> in this browser',
  }[f.state];
  return `<li><code>${e(f.path)}</code>${f.label ? ` (“${e(f.label)}”)` : ''}: ${words}${f.why ? `, ${e(f.why)}` : ''}</li>`;
}

/** The bar: whether this file is what the identity signed, who signed, and how to check without this gateway. */
export function bar(s: BarState): string {
  const set = s.settings;
  const v = s.version;
  const rows: string[] = [];
  if (v?.signer) {
    rows.push(`<dt>Signed by</dt><dd><span class="fp" id="mor-signer">${fingerprint(v.signer)}</span></dd>`);
    if (set) {
      rows.push(
        v.signer === set.identity
          ? `<dt>Whose</dt><dd>The identity this gateway names as ${e(set.name)}. The name is the gateway's setting; the identity is what was checked.</dd>`
          : `<dt>Whose</dt><dd><strong>Not the identity this gateway names as ${e(set.name)}</strong>, which is <span class="fp">${fingerprint(set.identity)}</span>.</dd>`,
      );
    }
  } else if (set) {
    rows.push(`<dt>Expected from</dt><dd><span class="fp">${fingerprint(set.identity)}</span>, named by this gateway as ${e(set.name)}</dd>`);
  }
  if (set) {
    rows.push(`<dt>Version</dt><dd><code id="mor-version">${e(set.version)}</code>${v?.manifest ? `, the site “${e(v.manifest.name)}”` : ''}</dd>`);
    rows.push(
      `<dt>Why this version</dt><dd>${
        set.serve === 'latest'
          ? "This gateway follows the owner's latest version, as far as it last looked."
          : "This gateway's operator chose this version, and serves no other."
      } That is the gateway's setting; this browser looks for later versions itself.</dd>`,
    );
  }
  if (s.path) rows.push(`<dt>This file</dt><dd><code>${e(s.path)}</code>${s.work ? `, work hash <code>${e(s.work)}</code>` : ''}</dd>`);
  if (s.films.length) rows.push(`<dt>Films</dt><dd><ul id="mor-films">${s.films.map(filmItem).join('')}</ul></dd>`);
  if (s.feeds.length) rows.push(`<dt>Feeds</dt><dd><ul id="mor-feeds">${s.feeds.map(feedItem).join('')}</ul></dd>`);
  if (s.writes.length) {
    const to = (as: Author[]) => as.map((a) => `${a.name ? `${e(a.name)}, ` : ''}<span class="fp">${fingerprint(a.identity)}</span>`).join('; ');
    rows.push(
      `<dt>Writing</dt><dd id="mor-writes">${s.writes.map((w) => `<div>A box to write to ${to(w)}. A note is signed in this browser by a one-time identity and sent to the inbox the identity's routes name; nothing is kept here. The names are this page's; the identities are what the note is addressed to.</div>`).join('')}</dd>`,
    );
  }
  if (s.acts.length) rows.push(`<dt>Acts shown</dt><dd><ul id="mor-acts">${s.acts.map(actItem).join('')}</ul></dd>`);
  if (s.reasons.length) rows.push(`<dt>Why</dt><dd><ul id="mor-reasons">${s.reasons.map((r) => `<li>${e(r)}</li>`).join('')}</ul></dd>`);
  rows.push(
    `<dt>Checked by</dt><dd>This gateway's display client${set?.release ? `, release <code>${e(set.release)}</code>` : ''}, running in this browser with MOR's core library. It is served by the gateway, so it is as honest as the gateway: to check without trusting it, verify the version from a relay with your own copy of MOR (<code>mor-site verify</code>), or compare what this gateway serves with the release (<code>mor-site check</code>).</dd>`,
  );
  const open = s.phase === 'bad' ? ' open' : '';
  const newer = s.newer && newerWords(s.newer);
  const brief = s.brief ? `<div class="standing brief" id="mor-brief">${e(s.brief)}</div>` : '';
  return `${brief}<div class="standing" id="mor-standing">${e(s.words)}</div>${newer ? `\n<div class="newer" id="mor-newer">${newer}</div>` : ''}
<details${open}><summary>Who signed it, and how to check</summary><dl>${rows.join('')}</dl></details>`;
}

/** What the bar says about later versions, under the top sentence; empty when there is nothing to say. */
export function newerWords(n: Newer): string {
  const fork = n.fork.length
    ? `Later versions split: ${n.fork.length} versions, each signed by the same identity, name the same version before them (${n.fork.map((f) => `<code>${e(f)}</code>`).join(', ')}). The owner's key may be in someone else's hands; none of them is shown here.`
    : '';
  const later = n.latest
    ? `A newer version of this site exists, signed by the same identity: <code id="mor-latest">${e(n.latest)}</code>. This gateway serves an earlier one.`
    : '';
  return [later, fork].filter(Boolean).join(' ');
}

/** What the bar says on top, in plain words. */
export function verifiedWords(settings: SiteSettings, kind: string): string {
  return `Verified: this ${kind} is exactly what was signed by the identity this gateway names as ${settings.name}. Checked in this browser.`;
}

/**
 * The top sentence, briefly, for a narrow or short screen, where the bar
 * would otherwise take much of the first screen (roadmap step 10a, option B,
 * decided by Nobody, allegedly, 9 October 2026). Shown only once the file
 * verified; everything else rule 9 asks for stays under "Who signed it, and
 * how to check", as on every screen: the whole fingerprint, whether it is the
 * identity expected (and that the name is the gateway's setting), the version.
 */
export function briefWords(settings: SiteSettings): string {
  return `Verified: signed by ${settings.name}`;
}

export const failingWords = (what: string) => `Failing: ${what} Not shown.`;
