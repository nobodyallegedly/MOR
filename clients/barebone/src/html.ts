// A post as HTML: its text (plain, or in the long-form format when it names
// it), each picture it refers to under its own signer, and the signer's
// identity with its standing. The picture is embedded as the verified bytes
// themselves, turned as its Exif orientation says (JPEG Module, rule 3).

import { escapeHtml, plainHtml, renderHtml, STYLE as LONGFORM_STYLE } from '../../longform/src/html.ts';
import { parse } from '../../longform/src/format.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import type { ShownPicture, ShownPost } from './post.ts';
import { POST_SPECS } from './specs.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

export const STYLE = `${LONGFORM_STYLE}
.mor-post{border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:8px;padding:12px 16px;margin:16px 0}
.mor-post-by{font-size:.85em;opacity:.8;overflow-wrap:anywhere}
.mor-post-by code{font-size:.95em}
.mor-post-text{margin:.75em 0;white-space:pre-wrap;overflow-wrap:anywhere}
.mor-post figure{margin:.75em 0}
.mor-post img{display:block;max-width:100%;height:auto;image-orientation:from-image}
.mor-post figcaption{font-size:.8em;opacity:.8;overflow-wrap:anywhere}
.mor-post-missing{font-size:.9em;padding:.5em;border:1px dashed currentColor;border-radius:4px}
.mor-post-bad{font-weight:bold}`;

function standingWords(s: string): string {
  return s === 'valid' ? 'verified' : `not verified: ${s}`;
}

function picture(p: ShownPicture, poster: string): string {
  const by = p.signer === poster ? '' : ` A picture by <code>${short(p.signer)}</code>, not by the poster.`;
  if (!p.bytes || !p.picture) {
    return `<figure><div class="mor-post-missing">Picture not shown: ${escapeHtml(p.problem ?? 'unknown')}.${by}</div></figure>`;
  }
  const src = `data:image/jpeg;base64,${Buffer.from(p.bytes).toString('base64')}`;
  const still = p.picture.carries.length
    ? ` It still carries ${p.picture.carries.map((c) => CARRIED_WORDS[c]).join('; ')}, not shown.`
    : '';
  return `<figure><img src="${src}" width="${p.picture.shownWidth}" height="${p.picture.shownHeight}" alt="">
<figcaption>JPEG, ${p.picture.shownWidth} × ${p.picture.shownHeight}, publication <code>${short(p.publication)}</code>, ${standingWords(p.standing)}.${by}${still}</figcaption></figure>`;
}

/** One post, as an HTML fragment. */
export function renderPost(p: ShownPost): string {
  const text =
    p.format === POST_SPECS.longform
      ? renderHtml(parse(p.text))
      : `<div class="mor-post-text" dir="auto">${escapeHtml(p.text)}</div>`;
  const others = p.refs
    .filter((r) => r.kind === 'act')
    .map((r) => `<div class="mor-post-by">Refers to <code>${short(r.id)}</code>: ${escapeHtml(r.kind === 'act' ? r.what : '')}.</div>`)
    .join('');
  const pictures = p.refs
    .filter((r): r is ShownPicture => r.kind === 'picture')
    .map((r) => picture(r, p.signer))
    .join('');
  const bad = p.standing === 'valid' ? '' : ' mor-post-bad';
  return `<article class="mor-post">
<div class="mor-post-by${bad}">By <code title="${p.signer}">${short(p.signer)}</code>, ${standingWords(p.standing)}. Post <code title="${p.id}">${short(p.id)}</code>.</div>
${text}${pictures}${others}
<details><summary>Plain text</summary>${plainHtml(p.text, { showControls: true })}</details>
</article>`;
}

/** A standalone page of posts. */
export function renderPage(posts: ShownPost[], title: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>:root{color-scheme:light dark}body{max-width:40em;margin:2em auto;padding:0 16px;font-family:system-ui,sans-serif;line-height:1.5;background:Canvas;color:CanvasText}
${STYLE}</style></head>
<body>
${posts.map(renderPost).join('\n')}
</body></html>
`;
}
