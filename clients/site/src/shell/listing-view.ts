// A listing as the display client shows it (website cMIP draft 9, rule 13c;
// F288): in a frame of its own, apart from the page's styles; first, in
// plain words, that it is one listing among any and decides nothing; then
// its first purpose, the extensions agreements name, most named first, each
// with the layers the work touches and links to those agreements' public
// terms, saying that private agreements are not counted; then the xtypes by
// use, the public acts of their types counted, saying that private acts are
// not counted; then, below, a card for each line of drafts, newest draft first in its card, with what
// the specification's own fields say it is, its creator, the code released
// for it, and its drafts in order; then the publications that could not be
// verified, saying why, nothing they say shown. Phones first: one column,
// nothing wider than the screen. Everything that comes from an act or the
// page is escaped.

import { escapeHtml as e } from '../../../longform/src/html.ts';
import { fingerprint } from '../../../reader/src/read.ts';
import { roleWords, type Draft, type Extension, type Line, type Listed, type Listing, type Release, type Use } from '../listing.ts';

export const LISTING_STYLE = `:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 18%,transparent);--soft:color-mix(in srgb,CanvasText 66%,Canvas);--ok:#1a7f37;--bad:#b3261e}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80}}
*{box-sizing:border-box}
body{margin:0;background:Canvas;color:CanvasText;font:16px/1.5 system-ui,-apple-system,sans-serif;overflow-wrap:anywhere}
.l-any{margin:0 0 12px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;font-size:15px}
.l-any strong{display:block;font-size:17px}
.l-note{margin:0 0 12px;font-size:13px;color:var(--soft)}
.l-line{margin:0 0 12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px}
.l-line.l-bad{border-color:var(--bad);border-style:dashed}
.l-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;margin:0 0 4px}
.l-name{margin:0;font-size:18px;line-height:1.3;font-weight:700}
.l-ok{color:var(--ok);font-size:13px;font-weight:600}
.l-no{color:var(--bad);font-size:13px;font-weight:600}
.l-facts{font-size:14px;color:var(--soft)}
.l-facts b{color:CanvasText;font-weight:600}
.l-role{margin:6px 0;padding-left:1.2em;font-size:15px}
.l-row{margin:4px 0;font-size:14px}
.l-warn{color:var(--bad)}
.l-drafts{margin:8px 0 0;padding-left:1.4em;font-size:14px}
.l-drafts li{margin:2px 0}
.l-line details{margin-top:8px;font-size:12px;color:var(--soft)}
.l-line summary{cursor:pointer;min-height:24px}
code,.l-fp{font-family:ui-monospace,Menlo,monospace;font-size:12px}
.l-section{margin:16px 0 8px;font-size:15px}
.l-none{font-size:14px;color:var(--soft)}
.l-h{margin:18px 0 6px;font-size:19px}
.l-mor2{margin:0 0 8px;font-size:16px;font-weight:600}
.l-count{font-size:15px;font-weight:700}
.l-terms{margin:4px 0 0;padding-left:1.2em;font-size:14px}
.l-terms a{display:inline-block;min-height:24px}`;

const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-4)}`;
const fp = (identity: string) => `<span class="l-fp">${fingerprint(identity)}</span>`;

function releaseWords(r: Release, creator: string | null): string {
  const by = r.signer === creator ? 'by its creator' : `by another identity, <span class="l-fp">${short(r.signer)}</span>`;
  const how = r.by === 'implements' ? 'its manifest names it among what it implements' : 'its publication refers to it';
  if (r.problem) return `<li data-release="${r.id}" data-by="${r.by}" data-verified="no">a release ${by}, <span class="l-no">not verified</span>: ${e(r.problem)}</li>`;
  return `<li data-release="${r.id}" data-by="${r.by}" data-verified="yes"><span class="l-ok">released</span> ${by}: “${e(r.name ?? '')}” ${e(r.version ?? '')} (${how})</li>`;
}

/** An xtype's use, in a line: its public acts found, by type. */
function useWords(u: Use): string {
  const types = u.byType.map((t) => `${e(t.name)} ${t.acts}`).join(', ');
  return `<span class="l-count">${u.acts} public ${u.acts === 1 ? 'act' : 'acts'}</span> of its types found (${types})${u.notValid ? `; ${u.notValid} not valid for ${u.notValid === 1 ? 'its signer' : 'their signers'}, not counted` : ''}`;
}

function code(l: Listed): string {
  if (!l.releases.length) return `<div class="l-row" data-code="none">Code: no release naming it found at the relays read.</div>`;
  return `<div class="l-row" data-code="${l.releases.some((r) => !r.problem) ? 'released' : 'unverified'}">Code:<ul class="l-role">${l.releases.map((r) => releaseWords(r, l.spec.creator)).join('')}</ul></div>`;
}

function creator(l: Listed): string {
  const c = l.spec.creator;
  if (!c) return `<div class="l-row">No creator: a MIR is the protocol itself.</div>`;
  if (l.claimed) return `<div class="l-row" data-claimed="yes">Creator ${fp(c)}, who published it.</div>`;
  const by = [...new Set(l.publications.map((p) => p.signer))].map(fp).join('; ');
  return `<div class="l-row l-warn" data-claimed="no">Unclaimed by its named creator ${fp(c)}: that identity's publication of it was not found. Published by ${by}.</div>`;
}

function draftItem(d: Draft): string {
  const l = d.listed;
  const notes: string[] = [];
  if (d.afterMissing) notes.push(`names a predecessor not found here, <code>${short(d.afterMissing)}</code>`);
  if (d.otherCreator) notes.push(`<span class="l-warn" data-other-creator="">by another creator than the draft it follows</span>`);
  if (d.siblings.length) notes.push(`<span class="l-warn" data-fork="">${d.siblings.length === 1 ? 'another specification names' : `${d.siblings.length} others name`} the same predecessor</span>`);
  if (l.releases.some((r) => !r.problem)) notes.push('code released');
  return `<li data-draft="${l.hash}" data-number="${d.number}">Draft ${d.number}: “${e(l.name)}”, <code>${short(l.hash)}</code>${l.spec.creator ? `, by <span class="l-fp">${short(l.spec.creator)}</span>` : ''}${notes.length ? `; ${notes.join('; ')}` : ''}</li>`;
}

function lineHtml(line: Line, all: Map<string, Listed>): string {
  const l = line.newest;
  const w = roleWords(l, all);
  const draft = line.drafts.find((d) => d.listed === l)!;
  const drafts =
    line.drafts.length > 1 || draft.afterMissing
      ? `<div class="l-row">Drafts, in order:</div><ol class="l-drafts">${line.drafts.map(draftItem).join('')}</ol>`
      : '';
  return `<article class="l-line" data-spec="${l.hash}" data-verified="yes">
<div class="l-head"><h3 class="l-name">${e(l.name)}</h3><span class="l-ok">Verified</span></div>
<div class="l-facts"><b data-kind="">${e(w.kind)}</b> · layer: <span data-layer="">${e(w.layer)}</span>${line.drafts.length > 1 ? ` · draft ${draft.number}` : ''}</div>
<ul class="l-role" data-role="">${w.role.map((r) => `<li>${e(r)}</li>`).join('')}</ul>
${l.use ? `<div class="l-row" data-use="${l.use.acts}">Use: ${useWords(l.use)}.</div>\n` : ''}${creator(l)}
${code(l)}
${drafts}
<details><summary>How it was checked</summary>
<div>Spec hash <code>${e(l.hash)}</code></div>
${l.publications.map((p) => `<div>Published in act <code>${e(p.id)}</code>, signed by ${fp(p.signer)}, verified through its identity chain in this browser; its content matches its work hash.</div>`).join('')}
</details></article>`;
}

/** An act id as a link to it in the page's reader, or as text where the page names none. */
function actLink(id: string, reader: string | null): string {
  return reader ? `<a href="${e(reader)}#${id}">terms <code>${short(id)}</code></a>` : `terms <code>${short(id)}</code>`;
}

function extensionHtml(x: Extension, reader: string | null): string {
  const n = x.agreements.length;
  const name = x.listed ? `“${e(x.listed.name)}”` : `a cMIP not found at the relays read`;
  const layers = x.layers ? `the work touches ${e(x.layers.join(', '))}` : 'which layers the work touches is not said: its specification is not found here';
  const terms = x.agreements
    .map((a) => `<li data-agreement="${a.agreement}">${a.terms.map((t) => actLink(t, reader)).join(', ')}</li>`)
    .join('');
  return `<article class="l-line" data-extension="${x.hash}" data-count="${n}">
<div class="l-head"><span class="l-name">${name}</span></div>
<div class="l-row"><span class="l-count">named by ${n} ${n === 1 ? 'agreement' : 'agreements'}</span>; <span data-layers="">${layers}</span>.</div>
<div class="l-row">Their public terms:</div><ul class="l-terms">${terms}</ul>
<details><summary>Which cMIP</summary><div>Spec hash <code>${e(x.hash)}</code></div></details></article>`;
}

function extensionsHtml(listing: Listing, reader: string | null): string {
  const a = listing.agreements;
  const counted = `From ${a.counted} ${a.counted === 1 ? 'agreement' : 'agreements'} counted on these relays: public terms, signed by every party, each checked in this browser.`;
  const not = `<strong>Private agreements are not counted</strong>: their terms cannot be read${a.private ? ` (${a.private} private ${a.private === 1 ? 'act' : 'acts'} found, not opened)` : ''}.${a.proposed ? ` ${a.proposed} public ${a.proposed === 1 ? 'proposal' : 'proposals'} not yet signed by every party, not counted.` : ''}${a.notCounted.length ? ` ${a.notCounted.length} public terms could not be verified, not counted.` : ''}`;
  const body = listing.extensions.length
    ? listing.extensions.map((x) => extensionHtml(x, reader)).join('\n')
    : '<p class="l-none">No agreement counted here names an extension.</p>';
  return `<section id="l-extensions"><h2 class="l-h">Extensions agreements name</h2>
<p class="l-mor2" id="l-mor2">Each extension marks work the core did not foresee: the raw material of MOR 2.</p>
<p class="l-note" id="l-counted">${counted} ${not} Most named first.</p>
${body}</section>`;
}

function xtypesHtml(listing: Listing): string {
  const body = listing.xtypes.length
    ? `<ul class="l-terms">${listing.xtypes.map((l) => `<li data-xtype="${l.hash}" data-use="${l.use!.acts}">“${e(l.name)}”, <code>${short(l.hash)}</code>: ${useWords(l.use!)}</li>`).join('')}</ul>`
    : '<p class="l-none">No xtype listed here.</p>';
  return `<section id="l-xtypes"><h2 class="l-h">Xtypes, by use</h2>
<p class="l-note" id="l-use">An xtype defines act types and fills no task. Counted: the public acts of its types found on these relays, each checked in this browser; each draft is its own specification, counted on its own. <strong>Private acts are not counted</strong>: which specification a private act belongs to cannot be read. Most used first.</p>
${body}</section>`;
}

function unverifiedHtml(listing: Listing): string {
  if (!listing.unverified.length) return '';
  const items = listing.unverified.map(
    (p) => `<article class="l-line l-bad" data-pub="${p.id}" data-verified="no">
<div class="l-head"><span class="l-name">A specification?</span><span class="l-no">Not verified</span></div>
<div class="l-row">A publication that could not be verified in this browser: ${e(p.problem ?? 'unknown')}. What it says is not shown.</div>
<details><summary>Which act</summary><div>Act <code>${e(p.id)}</code>${p.signer ? `, naming as its signer ${fp(p.signer)}` : ''}</div></details></article>`,
  );
  return `<h3 class="l-section" id="l-unverified">Could not be verified (${listing.unverified.length})</h3>${items.join('\n')}`;
}

/** The listing's frame document. */
export function listingHtml(listing: Listing, style: string, reader: string | null = null): string {
  const all = new Map<string, Listed>();
  for (const line of listing.lines) for (const d of line.drafts) all.set(d.listed.hash, d.listed);
  const relays = listing.relays.map((r) => e(r.name ?? r.address)).join(', ');
  const top = `<div class="l-any" id="l-any"><strong>One listing among any; anyone can run another.</strong>
It decides nothing and refuses nothing: a specification is named by its own hash, not by being listed here, and is used by whoever adopts it.</div>
<p class="l-note">Read from ${relays || 'no relay'}: first the extensions the agreements there name, then the xtypes by use, then the cMIPs, Modules and other specifications published there, each checked in this browser: who signed it, and that it is what they signed. What each specification is comes from its own fields; a name is the first line of its text.</p>`;
  const body = listing.lines.length
    ? listing.lines.map((l) => lineHtml(l, all)).join('\n')
    : '<p class="l-none">No verified specification found at the relays read.</p>';
  const specs = `<section id="l-specs"><h2 class="l-h">cMIPs and Modules</h2>${body}${unverifiedHtml(listing)}</section>`;
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${style}"></head><body>${top}${extensionsHtml(listing, reader)}${xtypesHtml(listing)}${specs}</body></html>`;
}
