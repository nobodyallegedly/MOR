// The display client's own parts, as HTML strings: the bar above every file
// (website cMIP, rule 9), the stylesheets, and the frames' styles. Everything
// that comes from the site, the settings or an act is escaped.

import { escapeHtml as e } from '../../../longform/src/html.ts';
import { STYLE as POST_STYLE } from '../../../barebone/src/html.ts';
import { fingerprint, standingWords } from '../../../reader/src/read.ts';
import type { SiteSettings } from '../settings.ts';
import type { Version } from '../verify.ts';

/** The display client's own page: the bar on top, the file below. */
export const STYLE = `:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 22%,transparent);--soft:color-mix(in srgb,CanvasText 70%,Canvas);--ok:#1a7f37;--bad:#b3261e;--bar:color-mix(in srgb,CanvasText 6%,Canvas)}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80}}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;display:flex;flex-direction:column;background:Canvas;color:CanvasText;font:15px/1.45 system-ui,sans-serif}
#mor-bar{flex:none;padding:8px 16px;border-bottom:2px solid var(--line);background:var(--bar);max-height:60vh;overflow:auto}
#mor-bar.ok{border-bottom-color:var(--ok)}
#mor-bar.bad{border-bottom-color:var(--bad)}
#mor-bar .standing{font-weight:600}
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
#mor-view{flex:1;min-height:0;display:flex}
#mor-view>iframe{flex:1;width:100%;border:0;background:Canvas}
#mor-view>.file{flex:1;overflow:auto;padding:16px}
#mor-view img{max-width:100%;height:auto;image-orientation:from-image}
#mor-view pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.5 ui-monospace,Menlo,monospace}
.note{max-width:42em;margin:24px auto;padding:10px 12px;border-left:3px solid var(--bad)}`;

/** Put first in every page's frame: the boxes where acts are shown, and links that leave the site. */
export const FRAME_STYLE = `.mor-act{display:block;margin:1em 0}
.mor-act>iframe{display:block;width:100%;border:0;min-height:4em}
.mor-act-note{font:13px system-ui,sans-serif;padding:8px;border:1px dashed currentColor;border-radius:4px}`;

/** Inside an act's own frame: the post as the reader shows it. */
export const ACT_STYLE = `${POST_STYLE}
:root{color-scheme:light dark}
body{margin:0;background:Canvas;color:CanvasText;font:16px/1.5 Georgia,'Times New Roman',serif}
.mor-post{margin:0}`;

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

export interface BarState {
  phase: 'checking' | 'ok' | 'bad';
  /** The sentence on top, in plain words. */
  words: string;
  settings: SiteSettings | null;
  version: Version | null;
  path: string | null;
  work: string | null;
  acts: ActLine[];
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
  if (s.acts.length) rows.push(`<dt>Acts shown</dt><dd><ul id="mor-acts">${s.acts.map(actItem).join('')}</ul></dd>`);
  if (s.reasons.length) rows.push(`<dt>Why</dt><dd><ul id="mor-reasons">${s.reasons.map((r) => `<li>${e(r)}</li>`).join('')}</ul></dd>`);
  rows.push(
    `<dt>Checked by</dt><dd>This gateway's display client${set?.release ? `, release <code>${e(set.release)}</code>` : ''}, running in this browser with MOR's core library. It is served by the gateway, so it is as honest as the gateway: to check without trusting it, verify the version from a relay with your own copy of MOR (<code>mor-site verify</code>), or compare what this gateway serves with the release (<code>mor-site check</code>).</dd>`,
  );
  const open = s.phase === 'bad' ? ' open' : '';
  const newer = s.newer && newerWords(s.newer);
  return `<div class="standing" id="mor-standing">${e(s.words)}</div>${newer ? `\n<div class="newer" id="mor-newer">${newer}</div>` : ''}
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

export const failingWords = (what: string) => `Failing: ${what} Not shown.`;
