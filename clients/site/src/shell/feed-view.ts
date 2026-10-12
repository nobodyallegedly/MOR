// A feed as the display client shows it (website cMIP draft 6, rule 13a): in
// a frame of its own, apart from the page's styles, newest first in signed
// order; each post under its author's name, verified or saying why not; a
// reply with the post it answers. Phones first: one column, the text at
// reading size, nothing wider than the screen. Everything that comes from an
// act or the page is escaped.

import { escapeHtml as e, renderHtml, STYLE as LONGFORM_STYLE } from '../../../longform/src/html.ts';
import { parse } from '../../../longform/src/format.ts';
import { POST_SPECS } from '../../../barebone/src/specs.ts';
import type { ShownPicture, ShownPost } from '../../../barebone/src/post.ts';
import { base64 } from '../../../genesis/src/core.ts';
import { fingerprint } from '../../../reader/src/read.ts';
import type { Author, Feed, FeedPost } from '../feed.ts';

export const FEED_STYLE = `${LONGFORM_STYLE}
:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 18%,transparent);--soft:color-mix(in srgb,CanvasText 66%,Canvas);--ok:#1a7f37;--bad:#b3261e}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80}}
*{box-sizing:border-box}
body{margin:0;background:Canvas;color:CanvasText;font:17px/1.5 system-ui,-apple-system,sans-serif;overflow-wrap:anywhere}
.f-note{margin:0 0 12px;font-size:13px;color:var(--soft)}
.f-post{margin:0 0 12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px}
.f-post.f-bad{border-color:var(--bad);border-style:dashed}
.f-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;margin-bottom:6px}
.f-name{font-weight:700}
.f-ok{color:var(--ok);font-size:13px;font-weight:600}
.f-no{color:var(--bad);font-size:13px;font-weight:600}
.f-text{white-space:pre-wrap}
.f-text p:first-child,.f-text h1:first-child,.f-text h2:first-child{margin-top:0}
.f-answers{margin:0 0 8px;padding:6px 10px;border-left:3px solid var(--line);font-size:15px;color:var(--soft)}
.f-answers .f-text{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap}
.f-why{font-size:14px}
.f-post figure{margin:8px 0 0}
.f-post img{display:block;width:100%;height:auto;border-radius:8px;image-orientation:from-image}
.f-post figcaption,.f-missing{font-size:12px;color:var(--soft)}
.f-post details{margin-top:8px;font-size:12px;color:var(--soft)}
.f-post summary{cursor:pointer;min-height:24px}
.f-post code,.f-fp{font-family:ui-monospace,Menlo,monospace;font-size:12px}
.f-more{font-size:13px;color:var(--soft)}`;

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

/** The page's name for an identity, or the start of its fingerprint when the page gives none. */
function nameOf(authors: Author[], identity: string): string {
  return authors.find((a) => a.identity === identity)?.name ?? `Identity ${short(identity)}`;
}

function picture(p: ShownPicture): string {
  if (!p.bytes || !p.picture) return `<div class="f-missing">A picture, not shown: ${e(p.problem ?? 'unknown')}.</div>`;
  return `<figure><img src="data:image/jpeg;base64,${base64(p.bytes)}" width="${p.picture.shownWidth}" height="${p.picture.shownHeight}" alt="">
<figcaption>JPEG, ${p.picture.shownWidth} × ${p.picture.shownHeight}, checked against its publication.</figcaption></figure>`;
}

function text(post: ShownPost): string {
  return post.format === POST_SPECS.longform
    ? `<div class="f-text f-lf">${renderHtml(parse(post.text))}</div>`
    : `<div class="f-text" dir="auto">${e(post.text)}</div>`;
}

/** The post a reply answers, above the reply's words. */
function answered(feed: Feed, id: string, authors: Author[]): string {
  const a = feed.answered.get(id);
  if (!a) return '';
  if (!a.signer) return `<div class="f-answers">Answers a post not found at the places asked: <code>${short(id)}</code>.</div>`;
  if (!authors.some((x) => x.identity === a.signer)) {
    return `<div class="f-answers">Answers a post by another identity, not shown in this feed: <span class="f-fp">${fingerprint(a.signer)}</span>.</div>`;
  }
  if (!a.post || a.problem) {
    return `<div class="f-answers">Answers a post by ${e(nameOf(authors, a.signer))} that could not be verified: ${e(a.problem ?? 'unknown')}.</div>`;
  }
  return `<div class="f-answers" data-answers="${id}"><div><span class="f-name">${e(nameOf(authors, a.signer))}</span> <span class="f-ok">verified</span></div>${text(a.post)}</div>`;
}

function who(p: FeedPost): string {
  return `<details><summary>Who signed it</summary>
<div>Signed by <span class="f-fp">${fingerprint(p.signer)}</span></div>
<div>Post <code>${e(p.id)}</code>${p.position !== null ? `, number ${p.position} in its signer's sequence` : ''}</div></details>`;
}

function postHtml(feed: Feed, p: FeedPost, authors: Author[]): string {
  const name = e(nameOf(authors, p.signer));
  if (!p.post || p.problem) {
    return `<article class="f-post f-bad" data-post="${p.id}" data-verified="no">
<div class="f-head"><span class="f-name">${name}?</span><span class="f-no">Not verified</span></div>
<div class="f-why">A post naming this identity as its signer that could not be verified in this browser: ${e(p.problem ?? 'unknown')}. Its words are not shown.</div>
${who(p)}</article>`;
  }
  const pictures = p.post.refs.filter((r): r is ShownPicture => r.kind === 'picture').map(picture).join('');
  return `<article class="f-post" data-post="${p.id}" data-verified="yes">
<div class="f-head"><span class="f-name">${name}</span><span class="f-ok">Verified</span></div>
${p.answers.map((id) => answered(feed, id, authors)).join('')}${text(p.post)}${pictures}
${who(p)}</article>`;
}

/** The feed's frame document. */
export function feedHtml(feed: Feed, authors: Author[], style: string): string {
  const note = `<p class="f-note">Public posts of ${authors.map((a) => e(a.name ?? short(a.identity))).join(', ')}, each checked in this browser. Newest first, as their signatures order them: a reply after what it answers, each identity's posts in the order it signed them. MOR has no clock: between posts nothing signed links, the order is not a time.</p>`;
  const body = feed.posts.length
    ? feed.posts.map((p) => postHtml(feed, p, authors)).join('\n')
    : '<p class="f-more">No public post found at the places asked.</p>';
  const more = feed.more ? `<p class="f-more" id="f-more">${feed.more} older ${feed.more === 1 ? 'post' : 'posts'} found, not shown here.</p>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${style}"></head><body>${note}${body}${more}</body></html>`;
}
