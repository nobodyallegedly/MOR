// Rendering to HTML. Every character a node shows is written from the
// source, escaped; nothing else is written but tags and attributes. List
// markers are shown as written, never replaced by a bullet or a number of
// the browser's own (cMIP, rule 8), so the stylesheet turns the browser's
// markers off. Spaces are kept as written (`white-space: pre-wrap`).
//
// Every reading is checked before it is rendered (F149): one that would
// hide anything but the format's declared markup, in its declared place,
// is refused, and the text is shown plain, with a line saying why.

import { checkBound, type Block, type Document, type Inline, type Span } from './format.ts';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESC[c]);

/** The stylesheet the rendering needs to show what the cMIP says. */
export const STYLE = `.mor-lf{white-space:pre-wrap;overflow-wrap:anywhere}
.mor-lf :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,pre){unicode-bidi:isolate}
.mor-lf ul,.mor-lf ol{list-style:none;padding-left:0}
.mor-lf li{display:flex;gap:.5em}
.mor-lf li>.mor-lf-marker{flex:none}
.mor-lf li>div{flex:1;min-width:0}
.mor-lf li>div>:first-child{margin-top:0}
.mor-lf li>div>:last-child{margin-bottom:0}
.mor-lf li{margin:.25em 0}
.mor-lf blockquote{margin-left:0;padding-left:1em;border-left:3px solid currentColor}
.mor-lf pre{overflow-x:auto}
.mor-lf .mor-lf-label{display:block;font-size:.85em;opacity:.8}
.mor-lf-plain{white-space:pre-wrap;overflow-wrap:anywhere;font-family:ui-monospace,monospace}
.mor-lf-ctl{outline:1px solid currentColor;font-size:.8em}`;

export function renderHtml(doc: Document): string {
  const breach = checkBound(doc);
  if (breach) {
    return `<div class="mor-lf"><p class="mor-lf-refused">Shown plain: the long-form rendering would break the Text MIP's bound (${escapeHtml(breach)}).</p>${plainHtml(doc.source, { showControls: true })}</div>`;
  }
  const s = doc.source;
  const text = (x: Span) => escapeHtml(s.slice(x.from, x.to));
  const inl = (ns: Inline[]): string =>
    ns
      .map((n) => {
        switch (n.t) {
          case 'text':
            return text(n.span);
          case 'break':
            return '<br>';
          case 'em':
            return `<em>${inl(n.children)}</em>`;
          case 'strong':
            return `<strong>${inl(n.children)}</strong>`;
          case 'code':
            return `<code>${text(n.span)}</code>`;
          case 'link':
            return `<a href="${escapeHtml(n.href)}" rel="nofollow noopener noreferrer">${text(n.span)}</a>`;
        }
      })
      .join('');
  const blk = (bs: Block[]): string =>
    bs
      .map((b) => {
        switch (b.t) {
          case 'heading':
            return `<h${b.level} dir="auto">${inl(b.children)}</h${b.level}>`;
          case 'paragraph':
            return `<p dir="auto">${inl(b.children)}</p>`;
          case 'quote':
            return `<blockquote>${blk(b.children)}</blockquote>`;
          case 'list': {
            const tag = b.ordered ? 'ol' : 'ul';
            const items = b.items
              .map((it) => `<li><span class="mor-lf-marker">${text(it.marker)}</span><div>${blk(it.children)}</div></li>`)
              .join('');
            return `<${tag}>${items}</${tag}>`;
          }
          case 'code': {
            const label = b.label ? `<span class="mor-lf-label">${text(b.label)}</span>` : '';
            return `<pre dir="auto">${label}<code>${b.lines.map(text).join('\n')}</code></pre>`;
          }
          case 'rule':
            return '<hr>';
        }
      })
      .join('');
  return `<div class="mor-lf">${blk(doc.blocks)}</div>`;
}

/** Invisible characters that can make text display differently from its bytes (Text MIP, rule 5). */
const INVISIBLE = /[\u061C\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * The plain text, character for character (Text MIP, rules 3 and 5a). With
 * `showControls`, bidirectional controls and the other invisible characters
 * of rule 5 are shown as escapes, marked as such, as rule 5a requires before
 * terms, a grant or a clone are signed.
 */
export function plainHtml(source: string, opts: { showControls?: boolean } = {}): string {
  if (!opts.showControls) return `<div class="mor-lf-plain" dir="ltr">${escapeHtml(source)}</div>`;
  let out = '';
  let last = 0;
  for (const m of source.matchAll(INVISIBLE)) {
    const cp = m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');
    out += escapeHtml(source.slice(last, m.index)) + `<span class="mor-lf-ctl" title="invisible character">U+${cp}</span>`;
    last = m.index! + m[0].length;
  }
  out += escapeHtml(source.slice(last));
  return `<div class="mor-lf-plain" dir="ltr">${out}</div>`;
}

/** A standalone page: the rendering, and the plain text one tap away. */
export function renderPage(doc: Document, title: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>body{max-width:42em;margin:2em auto;padding:0 16px;font-family:Georgia,serif;line-height:1.5}
details{margin-top:3em}${STYLE}</style></head>
<body>${renderHtml(doc)}
<details><summary>Plain text</summary>${plainHtml(doc.source, { showControls: true })}</details>
</body></html>
`;
}
