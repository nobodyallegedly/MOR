// The management page's sections, as HTML strings. Everything that comes
// from the relay is escaped: labels, addresses, and above all what strangers
// sent (a rotation waiting for approval may be a thief's, its addresses
// chosen by the thief).

import type { Item, Paired, Served, Status, Waiting } from './api.ts';

export const STYLE = `:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 18%,transparent);--soft:color-mix(in srgb,CanvasText 65%,Canvas);--ok:#1a7f37;--bad:#b3261e;--warn:#9a6700}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80;--warn:#d29922}}
*{box-sizing:border-box}
body{margin:0;background:Canvas;color:CanvasText;font:15px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}
main{max-width:60em;margin:0 auto;padding:20px 16px 64px}
header.top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px 16px;padding-bottom:12px;border-bottom:1px solid var(--line)}
header.top h1{font-size:18px;margin:0}
.small{font-size:13px;color:var(--soft)}
code{font-family:ui-monospace,Menlo,monospace;font-size:.9em;overflow-wrap:anywhere}
section{margin-top:32px}
h2{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--soft);margin:0 0 8px}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0}
dl.facts dt{color:var(--soft)}
dl.facts dd{margin:0;overflow-wrap:anywhere}
.table{overflow-x:auto}
table{border-collapse:collapse;width:100%}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:600;font-size:13px;color:var(--soft)}
button{font:600 14px system-ui,sans-serif;padding:6px 12px;border-radius:6px;border:1px solid CanvasText;background:CanvasText;color:Canvas;cursor:pointer}
button.quiet{background:transparent;color:CanvasText;border-color:var(--line)}
button.danger{background:var(--bad);border-color:var(--bad);color:#fff}
button:disabled{opacity:.5;cursor:default}
input[type=text],input[type=number]{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText;min-width:0}
input.wide{width:100%}
form.row,div.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.note{padding:10px 12px;border-left:3px solid var(--line);margin:12px 0}
.note.error{border-left-color:var(--bad)}
.note.done{border-left-color:var(--ok)}
.note.warn{border-left-color:var(--warn)}
.tag{display:inline-block;font-size:12px;font-weight:600;padding:1px 6px;border-radius:4px;border:1px solid var(--line)}
.tag.ok{color:var(--ok);border-color:var(--ok)}
.tag.bad{color:var(--bad);border-color:var(--bad)}
.tag.warn{color:var(--warn);border-color:var(--warn)}
.code{font:600 20px ui-monospace,Menlo,monospace;letter-spacing:.06em}
#status{position:sticky;top:0;background:Canvas;z-index:1}
details{margin:12px 0}
summary{cursor:pointer;font-weight:600}
ul.plain{list-style:none;padding:0}`;

/** Escape text for HTML, attributes included. */
export function e(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** A hash, shortened on screen, whole on hover and when copied. */
export function hash(h: string | null): string {
  if (!h) return '<span class="small">none</span>';
  return `<code title="${e(h)}">${e(h.slice(0, 12))}…${e(h.slice(-4))}</code>`;
}

export function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KiB', 'MiB', 'GiB', 'TiB'];
  let v = n / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[u]}`;
}

export function when(unix: number): string {
  return new Date(unix * 1000).toLocaleString();
}

const IDENTITY_TYPES: Record<number, string> = {
  0: 'genesis',
  1: 'rotation',
  2: 'receipt',
  3: 'routes',
  4: 'name',
  5: 'name withdrawal',
  6: 'link claim',
  7: 'link confirmation',
  8: 'link termination',
  9: 'log summary',
  10: 'cosignature',
  12: 'objection',
  13: 'absence statement',
  14: 'escape endorsement',
};

const ENVELOPES_TYPES: Record<number, string> = { 0: 'publication', 4: 'encryption key' };

/** What an arrival is, in words the relay can tell. */
export function what(it: Item): string {
  if (it.kind === 'sealed') return 'sealed container';
  if (it.kind === 'media') return 'media';
  if (it.spec === null) return 'private act';
  if (it.spec === 'identity') return `Identity: ${IDENTITY_TYPES[it.type ?? -1] ?? `type ${it.type}`}`;
  if (it.spec === 'envelope') return `Envelopes: ${ENVELOPES_TYPES[it.type ?? -1] ?? `type ${it.type}`}`;
  return `spec ${it.spec.slice(0, 8)}…, type ${it.type}`;
}

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export function top(s: { role: string; bases: string[] } | null, where: string, role = s?.role): string {
  const name = role === 'home' ? 'Home' : role === 'relay' ? 'Relay' : 'Relay or home';
  return `<header class="top"><h1>${name} management</h1><span class="small">${e(s ? s.bases.join(', ') : where)}</span></header>`;
}

/** The page before this browser is paired. */
export function pairing(role: string, where: string): string {
  return `${top(null, where, role)}
<section>
<h2>Pair this browser</h2>
<p>This page runs the ${role === 'home' ? 'home' : 'relay'} at <code>${e(where)}</code>. Only a browser paired with it may: pairing happens once, with a one-time code.</p>
<p>The ${role === 'home' ? 'home' : 'relay'} printed a code when it was set up. For a new one, on the machine it runs on: <code>mor-relay pair --dir DIR</code>, or, from a browser already paired, "Pair another device" below its page. A code lasts an hour and pairs one browser.</p>
<form class="row" id="pair" autocomplete="off">
<input type="text" id="pair-code" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" required spellcheck="false" autocapitalize="characters">
<input type="text" id="pair-label" placeholder="A name for this browser, e.g. Mac, Safari" required maxlength="64">
<button type="submit">Pair</button>
</form>
<div id="pair-status" aria-live="polite"></div>
<p class="small">This browser has made a management key of its own for this address, kept so that even this page cannot read it out. Every request is signed with it, and the relay answers only keys it has paired. It is not an identity, and your identity's keys play no part.</p>
</section>`;
}

/** The paired page's frame: each section is filled in on its own. */
export function frame(s: Status): string {
  const home = s.role === 'home';
  return `${top(s, s.bases[0])}
<div id="status" aria-live="polite"></div>
<div class="row"><button class="quiet" data-action="refresh">Refresh</button><span class="small" id="refreshed"></span></div>
<section id="overview"></section>
${home ? '<section id="pending"></section>' : ''}
${home ? '<section id="identities"></section>' : ''}
<section id="allowlist"></section>
${home ? '<section id="newcomers"></section>' : ''}
<section id="recent"></section>
${home ? '<section id="operator"></section>' : ''}
<section id="managers"></section>`;
}

export function overview(s: Status): string {
  const home = s.role === 'home';
  const state = s.closed
    ? '<span class="tag bad">closed by its operator\'s rotation</span>'
    : '<span class="tag ok">running</span>';
  const rows: [string, string][] = [
    ['State', state],
    ['Answers as', s.bases.map((b) => `<code>${e(b)}</code>`).join('<br>')],
    ['Kind', home ? 'home (and relay)' : 'basic relay'],
    ['Whose acts', s.policy === 'open' ? 'anyone\'s' : 'listed identities only'],
    ['Its words', e(s.policyText ?? '')],
  ];
  if (home) rows.push(['Operator', `${hash(s.operator)}${s.holdsChainKey ? ' <span class="tag warn">test operator: chain key on this server</span>' : ''}`]);
  rows.push(
    ['Holds', `${s.counts.acts} acts, ${s.counts.sealed} sealed containers, ${s.counts.media} media (${bytes(s.counts.bytes)})`],
    ['Arrivals', String(s.arrivals)],
  );
  if (home) {
    rows.push(
      ['Identities served', String(s.served)],
      ['Receipt log', `${s.log} receipts`],
      [
        'New identities',
        `${s.newIdentitiesToday} in the last 24 hours${s.newIdentityLimit === null ? ', no limit' : `, at most ${s.newIdentityLimit}`}`,
      ],
    );
  }
  rows.push(
    ['Limits', `acts up to ${bytes(s.limits.act)}, media up to ${bytes(s.limits.media)}`],
    ['Program', `mor-relay ${e(s.version)}`],
  );
  const alert = s.pending
    ? note('warn', `${s.pending} rotation${s.pending === 1 ? '' : 's'} waiting for your approval, below.`)
    : '';
  return `<h2>Overview</h2>${alert}<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
}

export function pending(list: Waiting[]): string {
  const intro = `<p class="small">For identities whose owners chose it, this home takes a rotation only once you approve it: a stand-in for proof from a registered device. Approve only a rotation the owner tells you, by another channel, is theirs: a thief holding the chain key can send one too. Once approved, the owner's client sends it again and the home takes it.</p>`;
  if (!list.length) return `<h2>Rotations waiting for approval</h2>${intro}<p class="small">None.</p>`;
  const rows = list
    .map((p) => {
      const homes = p.homes
        ? p.homes.map((h) => `${hash(h.operator)} <code>${e(h.hint)}</code>`).join('<br>')
        : '<span class="small">unchanged</span>';
      const flags = [p.homeless ? '<span class="tag warn">homeless</span>' : '', p.closure ? '<span class="tag bad">closure</span>' : '']
        .filter(Boolean)
        .join(' ');
      const act = p.approved
        ? '<span class="tag ok">approved</span><div class="small">waiting for the owner to send it again</div>'
        : `<button data-action="approve" data-rotation="${e(p.rotation)}">Approve</button>`;
      return `<tr><td>${hash(p.identity)}</td><td>${p.position}</td><td>${hash(p.rotation)} ${flags}</td><td>${homes}</td><td>${e(when(p.at))}</td><td>${act}</td></tr>`;
    })
    .join('');
  return `<h2>Rotations waiting for approval</h2>${intro}<div class="table"><table><thead><tr><th>Identity</th><th>Position</th><th>Rotation</th><th>New homes</th><th>Last sent</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/** How many identities the table shows at most; the rest are counted. */
export const SHOWN = 200;

export function identities(list: Served[], policy: string): string {
  const rows = list
    .slice(0, SHOWN)
    .map((i) => {
      const last = i.chain[i.chain.length - 1];
      // A home signs no receipt for its own operator's chain.
      const receipted = i.operator || i.chain.every((c) => c.receipted) ? '' : ' <span class="small">(not all receipted here)</span>';
      const who = i.operator ? ' <span class="tag">operator</span>' : '';
      const strict = i.operator
        ? ''
        : `<button class="quiet" data-action="strict" data-identity="${e(i.identity)}" data-on="${i.strict ? 'false' : 'true'}">${i.strict ? 'Approval required: stop' : 'Require approval'}</button>`;
      const listed = policy === 'allowlist' && !i.operator ? (i.allowed ? ' <span class="tag ok">listed</span>' : ' <span class="tag bad">not listed</span>') : '';
      return `<tr><td>${hash(i.identity)}${who}${listed}</td><td>${last ? last.position : '-'}${receipted}</td><td>${strict}</td></tr>`;
    })
    .join('');
  const more = list.length > SHOWN ? `<p class="small">And ${list.length - SHOWN} more.</p>` : '';
  return `<h2>Identities this home serves</h2>
<p class="small">"Require approval" is the owner's choice of a device policy: ask them before turning it on. The position is that of the latest identity-chain act this home holds.</p>
<div class="table"><table><thead><tr><th>Identity</th><th>Position</th><th>Rotations</th></tr></thead><tbody>${rows || '<tr><td colspan="3" class="small">None.</td></tr>'}</tbody></table></div>${more}`;
}

export function allowlist(list: string[], s: Status): string {
  const applies =
    s.policy === 'allowlist'
      ? `This ${s.role} keeps only the acts of the identities listed here (and evidence about them)${s.role === 'home' ? ', and takes the genesis and rotations of listed identities only' : ''}.`
      : `This ${s.role} is open to anyone, so the list has no effect now: it matters only for a ${s.role} set up for listed identities.`;
  const rows = list
    .map((i) => `<li class="row"><code>${e(i)}</code> <button class="quiet" data-action="disallow" data-identity="${e(i)}">Remove</button></li>`)
    .join('');
  return `<h2>Listed identities</h2>
<p class="small">${applies}</p>
<form class="row" id="allow" autocomplete="off"><input type="text" class="wide" id="allow-identity" placeholder="An identity: 64 hexadecimal characters" pattern="[0-9a-fA-F]{64}" required spellcheck="false"><button type="submit">List</button></form>
<ul class="plain">${rows || '<li class="small">No one listed.</li>'}</ul>`;
}

export function newcomers(s: Status): string {
  const now =
    s.newIdentityLimit === null
      ? 'No limit: this home takes every new identity that names it.'
      : `At most ${s.newIdentityLimit} new identities in any 24 hours; past that, a genesis is refused with "try again later" (error 10), and can go to another home.`;
  return `<h2>New identities</h2>
<p>${now} <span class="small">${s.newIdentitiesToday} taken in the last 24 hours. Identities already served are never limited.</span></p>
<p class="small">For a public home: every message sent from the reader's page leaves a new identity at the homes it names.</p>
<form class="row" id="limit"><input type="number" id="limit-n" min="0" step="1" placeholder="per 24 hours" value="${s.newIdentityLimit ?? ''}"><button type="submit">Set the limit</button><button type="button" class="quiet" data-action="no-limit">No limit</button></form>`;
}

export function recent(items: Item[], more: boolean): string {
  const rows = items
    .map(
      (it) =>
        `<tr><td>${it.arrival}</td><td>${e(what(it))}</td><td>${hash(it.id)}</td><td>${hash(it.signer)}</td><td>${bytes(it.size)}</td></tr>`,
    )
    .join('');
  return `<h2>Latest arrivals</h2>
<div class="table"><table><thead><tr><th>#</th><th>What</th><th>Id</th><th>Signer</th><th>Size</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="small">Nothing yet.</td></tr>'}</tbody></table></div>
${more ? '<div class="row"><button class="quiet" data-action="older">Older</button></div>' : ''}`;
}

export function operator(s: Status): string {
  if (s.closed) {
    return `<h2>Operator</h2><p>${hash(s.operator)}</p>${note('', 'This home has closed by its operator\'s rotation: it holds nothing new and signs nothing more, and still serves what it held, so readers find the closure.')}`;
  }
  const own = s.holdsChainKey
    ? `<details><summary>Rotate the operator</summary>
<p>New keys for the operator, made on this server; the home's own acts are kept, and every receipt it signed still counts. Do it if the operator's signing key may have leaked. Type <code>rotate</code> to confirm.</p>
<form class="row" id="rotate" autocomplete="off"><input type="text" id="rotate-confirm" placeholder="rotate" spellcheck="false"><button type="submit">Rotate</button></form>
</details>
<details><summary>Close this home for good</summary>
<p><strong>This cannot be undone.</strong> A closure is a rotation of the operator (Identity rule 8c): the home then holds no new identity-chain acts and signs no receipts, and the identities it served must leave it. Type <code>close</code> to confirm.</p>
<form class="row" id="close" autocomplete="off"><input type="text" id="close-confirm" placeholder="close" spellcheck="false"><button type="submit" class="danger">Close for good</button></form>
</details>`
    : `<p class="small">The operator's chain key is not on this server, as it should be: rotate (or close) where it is kept, then hand the rotation and the new key file to this home below.</p>`;
  return `<h2>Operator</h2>
<p>This home runs under the identity ${hash(s.operator)}. Its signing key is on this server, to sign receipts around the clock.</p>
${own}
<details><summary>Hand over a rotation made elsewhere</summary>
<p>The operator rotated where its chain key is kept: give this home the rotation (a bundle holding that one act, <code>.mor</code>) and the new key file. It checks that both are the operator's and that the key is the one the rotation set.</p>
<form id="rotated"><div class="row"><label>Rotation <input type="file" id="rotated-rotation" required></label></div><div class="row"><label>Key file <input type="file" id="rotated-key" required></label></div><div class="row"><button type="submit">Hand over</button></div></form>
</details>`;
}

export function managers(list: Paired[]): string {
  const rows = list
    .map(
      (m) =>
        `<tr><td>${e(m.label)}${m.you ? ' <span class="tag">this browser</span>' : ''}</td><td>${e(when(m.added))}</td><td>${hash(m.key)}</td><td><button class="quiet" data-action="unpair" data-key="${e(m.key)}" data-you="${m.you}">Unpair</button></td></tr>`,
    )
    .join('');
  return `<h2>Paired browsers</h2>
<div class="table"><table><thead><tr><th>Name</th><th>Paired</th><th>Key</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="row"><button class="quiet" data-action="code">Pair another device</button></div>
<div id="code"></div>`;
}

export function code(c: { code: string; expires: number }): string {
  return note('done', `Open this page on the other device and enter <span class="code">${e(c.code)}</span>. It pairs one browser, once, until ${e(when(c.expires))}.`);
}
