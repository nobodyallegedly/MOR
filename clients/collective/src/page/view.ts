// The page's sections, as HTML strings. Everything that comes from the
// program or from relays is escaped: names, addresses, words of agreements.
// Texts to be signed are shown as plain text, character for character, with
// every invisible control as a visible escape (Text rule 5a).

import { STYLE as BASE, e } from '../../../manage/src/view.ts';
import { STYLE as TEXT, plainHtml } from '../../../longform/src/html.ts';
import type { Done, Line, Reading, Review, State } from './api.ts';

export { e };

export const STYLE = `${BASE}
${TEXT}
.banner{margin:12px 0;padding:8px 12px;border:1px solid var(--warn);color:var(--warn);font-weight:600;font-size:13px}
.card{border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}
.card h3{margin:0 0 4px;font-size:17px}
.review{border:2px solid CanvasText;border-radius:8px;padding:16px;margin:16px 0;background:Canvas}
.review h2{font-size:20px;text-transform:none;letter-spacing:0;color:CanvasText}
.review h3{font-size:14px;margin:18px 0 6px}
.review ul{margin:0;padding-left:20px}
.review li{margin:4px 0}
li.warn{color:var(--warn)}
li.bad{color:var(--bad);font-weight:600}
li.ok{color:var(--ok)}
.plain{border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin:6px 0 12px;max-height:24em;overflow:auto}
.digest{font:13px ui-monospace,Menlo,monospace;overflow-wrap:anywhere}
textarea{font:inherit;width:100%;min-height:6em;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText}
label.check{display:inline-flex;gap:6px;align-items:center;margin-right:16px}
fieldset{border:1px solid var(--line);border-radius:6px;margin:8px 0;padding:8px 12px}
legend{font-size:13px;color:var(--soft)}
input[type=number]{width:5em}
select{font:inherit;padding:5px 8px;border-radius:6px;border:1px solid var(--line);background:Canvas;color:CanvasText}
.grid{display:grid;grid-template-columns:max-content 1fr;gap:6px 12px;align-items:center}`;

/** A fingerprint, shortened on screen, whole on hover. */
export function fp(h: string): string {
  return `<code title="${e(h)}">${e(h.slice(0, 8))}…${e(h.slice(-4))}</code>`;
}

export const note = (kind: 'error' | 'done' | 'warn' | '', html: string) => `<div class="note ${kind}">${html}</div>`;

export function top(): string {
  return `<header class="top"><h1>MOR collectives</h1><span class="small">this machine only · ${e(location.host)}</span></header>
<div class="banner">TEST IDENTITIES ONLY. Every key, every share, is held in software in this program's folder. A prototype, never for a real identity or collective.</div>`;
}

export function pairing(): string {
  return `${top()}
<section><h2>Pair this browser</h2>
<p>This page acts for the program running on this machine, which holds the keys. Open it with the launcher (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<input id="pair-label" type="text" placeholder="A name for this browser" value="this browser"><button type="submit">Pair</button></form>
<div id="pair-status"></div></section>`;
}

export function frame(): string {
  return `${top()}
<div id="status"></div>
<div id="review"></div>
<section><h2>Identities</h2><div id="identities"></div></section>
<section><h2>Collectives</h2><div id="collectives"></div></section>
<section><h2>Found a collective</h2><div id="found"></div></section>
<section><h2>A release under your own name</h2><div id="own-release"></div></section>
<section><h2>Sign or check a release by its id</h2><div id="by-id"></div></section>
<section><h2>What was signed</h2><div id="history"></div></section>
<section><h2>Settings</h2><div id="settings"></div></section>
<section><h2>Browsers</h2><div id="browsers"></div></section>`;
}

function lines(ls: Line[]): string {
  return `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>`;
}

/** A reading, before signing (with a plan) or after checking (without). */
export function reading(r: Reading, review?: Review): string {
  const blocking = r.blocking.length
    ? note('error', `<strong>This cannot be signed:</strong><ul>${r.blocking.map((b) => `<li>${e(b)}</li>`).join('')}</ul>`)
    : '';
  const plain = r.plain
    .map((p) => `<h3>${e(p.heading)}</h3><p class="small">As plain text, character for character; any invisible control is shown as U+… .</p><div class="plain">${plainHtml(p.text, { showControls: true })}</div>`)
    .join('');
  const actions = review
    ? `<p class="small">Digest of exactly what is signed: <span class="digest" id="review-digest">${e(review.digest)}</span></p>
<div class="row"><button data-action="confirm" ${r.blocking.length ? 'disabled' : ''}>Sign</button><button class="quiet" data-action="cancel">Cancel</button></div>`
    : `<div class="row"><button class="quiet" data-action="dismiss">Close</button></div>`;
  return `<div class="review" id="reading"><h2>${e(r.title)}</h2>
${r.summary.map((s) => `<p>${e(s)}</p>`).join('')}
${blocking}
${r.sections.map((s) => `<h3>${e(s.heading)}</h3>${lines(s.lines)}`).join('')}
${plain}
${actions}</div>`;
}

export function done(d: Done): string {
  return note('done', `<strong>${e(d.title)}</strong>${lines(d.lines)}`);
}

const nameOf = (s: State, id: string) => {
  const i = s.identities.find((x) => x.id === id);
  return i ? `${i.name}${i.mine ? ' (you)' : ''}` : id.slice(0, 8);
};

export function identities(s: State): string {
  const rows = s.identities
    .map(
      (i) => `<tr><td>${e(i.name)}</td><td>${i.mine ? '<span class="tag ok">you</span>' : '<span class="tag">simulated member</span>'}</td><td>${fp(i.id)}</td>
<td>${i.releases.map((r) => `${e(r.version)} ${fp(r.id)} <button class="quiet" data-action="verify" data-release="${e(r.id)}">Check</button>`).join('<br>') || '<span class="small">none</span>'}</td></tr>`,
    )
    .join('');
  return `${s.identities.length ? `<div class="table"><table><tr><th>Name</th><th></th><th>Fingerprint</th><th>Releases under its own name</th></tr>${rows}</table></div>` : '<p class="small">None yet.</p>'}
<form id="new-identity" class="row"><input name="name" type="text" placeholder="A name, kept on this device" required>
<label class="check"><input name="mine" type="checkbox" ${s.identities.some((i) => i.mine) ? '' : 'checked'}> this is me</label>
<button type="submit">Review a new test identity</button></form>
<p class="small">A test identity is born at the homes named in Settings. Make yourself, then the simulated members a test collective needs.</p>`;
}

function rulesFields(r: { safety: number | ''; release: number | ''; clone: number | ''; others: number | ''; constitution?: number | '' }): string {
  const f = (name: string, v: number | '', words: string, placeholder = '') =>
    `<label>${words}</label><input name="${name}" type="number" min="1" value="${e(v)}" placeholder="${e(placeholder)}">`;
  return `<fieldset><legend>Rules</legend><div class="grid">
${f('safety', r.safety, 'Shares needed to rebuild the chain key')}
${f('release', r.release, 'Members who must sign a release')}
${f('constitution', r.constitution ?? '', 'Members who must sign a change of members or rules', 'every member')}
${f('clone', r.clone, 'Members who must sign any other change (a change of who judges needs every member)')}
${f('others', r.others, 'Other members who together judge absence', 'all the others')}
</div></fieldset>`;
}

type Col = State['collectives'][number];

/** The release area, in plain words: who holds it, how many decide, whether it is frozen; stepping down; its words. */
function releaseArea(s: State, c: Col): string {
  return c.areas
    .map((a) => {
      const holders = a.holders
        .map((h) => `${e(h.name)}${h.steppedDown ? ' <span class="tag">stepped down</span>' : !h.voice ? ' <span class="tag">left</span>' : ''}`)
        .join('<br>');
      const down = a.holders
        .filter((h) => h.held && h.voice)
        .map((h) => `<button class="quiet" data-action="stepdown" data-collective="${e(c.id)}" data-member="${e(h.id)}">Step down as ${e(nameOf(s, h.id))}</button>`)
        .join(' ');
      return `<div class="area" data-area="${a.id}"><h4>The ${e(a.name)} area</h4>
<dl class="facts"><dt>Holders</dt><dd>${holders}</dd>
<dt>Who decides</dt><dd>${a.frozen ? '<strong>Frozen</strong>: nobody holds it any more. A release counts for nothing until the members refit it (a change of members or rules).' : `Any ${a.needed} of the holders who remain${a.needed < a.threshold ? ` (the rule asks for ${a.threshold}; fewer remain, so all of them)` : ''}`}</dd>
<dt>Its own words</dt><dd>${a.words ? e(a.words) : '<span class="small">none</span>'}</dd></dl>
${down ? `<div class="row">${down}</div><p class="small">A holder may step down at once, alone; the other holders carry on. With nobody left, the area is frozen until the members refit it.</p>` : ''}
${a.frozen ? '' : `<form class="words row" data-collective="${e(c.id)}"><input name="text" type="text" class="wide" placeholder="New words for the ${e(a.name)} area" required><button type="submit">Review the new words</button></form>
<p class="small">An ordinary change: signed by enough holders and written on the collective's record at once, with no rotation.</p>`}</div>`;
    })
    .join('');
}

export function collectives(s: State): string {
  if (!s.collectives.length) return '<p class="small">None yet.</p>';
  return s.collectives
    .map((c) => {
      const heldMembers = c.members.filter((m) => m.held);
      const releases = c.releases
        .map(
          (r) => `<li>${e(r.version)} ${fp(r.id)} <button class="quiet" data-action="verify" data-release="${e(r.id)}">Check</button>
${heldMembers.map((m) => `<button class="quiet" data-action="sign" data-release="${e(r.id)}" data-member="${e(m.id)}">Sign as ${e(nameOf(s, m.id))}</button>`).join(' ')}</li>`,
        )
        .join('');
      const others = s.identities.filter((i) => !c.members.some((m) => m.id === i.id));
      const mine = c.members.filter((m) => !m.left && s.identities.find((i) => i.id === m.id)?.mine);
      const agreementsNote = c.law.broken
        ? note('error', `<strong>Agreements read this collective as broken.</strong> No agreement can be found in force for it, so nothing signed in its name counts, and no change of it can come into force. Agreements' reason: ${e(c.law.broken)}. <span class="small">The rules below are this device's copy, not rules in force.</span>${c.law.rollback ? `<br>The way back is a rollback: a new rotation brings back the agreement in force just before the broken act, signed under its rule for changing the constitution; what was signed since stays shown and counts for nothing. <button data-action="rollback" data-collective="${e(c.id)}">Review a rollback</button><details class="rollback"><summary>Roll back with new numbers</summary><p class="small">Where the rules before the broken act do not fit the members left after it.</p><form class="rollback" data-collective="${e(c.id)}">${rulesFields(c.rules)}<div class="row"><button type="submit">Review the rollback</button></div></form></details>` : ''}`)
        : c.law.unread
          ? note('warn', `Agreements' own reading of this collective could not be had (${e(c.law.unread)}). <span class="small">The rules below are this device's copy; nothing is signed until Agreements can count.</span>`)
          : '';
      // RB3: a declaration naming a member is always shown, with the way to contest it.
      const declaredNote = (c.declared ?? []).length
        ? note(
            'warn',
            `<strong>Declared absent.</strong><br>${c.declared
              .map((d) => `${e(d.text)}${d.held && !d.contested ? ` <button class="quiet" data-action="contest" data-collective="${e(c.id)}" data-declaration="${e(d.act)}">Contest as ${e(d.name)}</button>` : ''}`)
              .join('<br>')}`,
          )
        : '';
      // RB2: payments received during a broken stretch, owed back.
      const owedNote = (c.owedBack ?? []).length
        ? note(
            'warn',
            `<strong>Owed back.</strong><br>${c.owedBack
              .map((o) => `${fp(o.payment)}: ${e(o.text)}${o.toKind === 'identity' && !o.notice && !c.closed ? ` <button class="quiet" data-action="notice" data-collective="${e(c.id)}" data-payment="${e(o.payment)}">Send ${e(o.toName)} a notice</button>` : ''}`)
              .join('<br>')}`,
          )
        : '';
      return `<div class="card" data-collective="${e(c.id)}"><h3>${e(c.name)}</h3>
${agreementsNote}
${declaredNote}
${owedNote}
<dl class="facts"><dt>Collective</dt><dd>${fp(c.id)}</dd>
<dt>Members</dt><dd>${c.members.map((m) => `${e(m.name)}${m.left ? ' <span class="tag">left: a party until the members refit the collective</span>' : ''}`).join('<br>')}</dd>
<dt>Signing key</dt><dd>${e(c.holder)}</dd>
<dt>Chain key</dt><dd>${c.shares.of} shares, any ${c.shares.threshold} rebuild it</dd>
<dt>A change of members or rules needs</dt><dd>${c.rules.constitution ? `any ${c.rules.constitution} members` : 'every member whose voice remains'}</dd>
<dt>Any other change needs</dt><dd>${c.rules.clone} members' signatures</dd>
<dt>${c.law.broken || c.law.unread ? 'Agreement this device holds' : 'Agreement in force (as Agreements read it)'}</dt><dd>${fp(c.agreement)} (${c.agreements === 1 ? 'the founding agreement' : `clone ${c.agreements - 1}`})</dd>
<dt>Records drawn</dt><dd>${c.records}${c.departed.length ? `; left: ${c.departed.map((d) => e(d.name)).join(', ')}` : ''}${c.steppedDown.length ? `; stepped down: ${c.steppedDown.map((d) => e(d.name)).join(', ')}` : ''}</dd>
<dt>Relays</dt><dd>${c.relays.map(e).join('<br>')}</dd></dl>
${releaseArea(s, c)}
${c.pending ? note('warn', `A member change is waiting for the homes. <button data-action="resend" data-collective="${e(c.id)}">Send it again</button> <span class="small">(the same bytes: nothing new is signed)</span>`) : ''}
<h4>Releases</h4>${releases ? `<ul class="plain">${releases}</ul>` : '<p class="small">None yet.</p>'}
<form class="release row" data-collective="${e(c.id)}"><input name="version" type="text" placeholder="Version, e.g. 11b.1" required><button type="submit">Review a release</button></form>
${mine.map((m) => `<button class="quiet" data-action="leave" data-collective="${e(c.id)}" data-member="${e(m.id)}">Leave as ${e(nameOf(s, m.id))}</button>`).join(' ')}
${c.members.filter((m) => !m.left).length > 1 ? `<details class="absence"><summary>Declare a member absent</summary><p class="small">The other members judge it, under the clause that member signed; the outcome is that member losing their voice, never what they own.</p>${c.members.filter((m) => !m.left).map((m) => `<button class="quiet" data-action="declare" data-collective="${e(c.id)}" data-member="${e(m.id)}">${e(nameOf(s, m.id))} is absent</button>`).join(' ')}</details>` : ''}
<details class="change"><summary>Change members or rules</summary>
<form class="change" data-collective="${e(c.id)}">
<fieldset><legend>Add</legend>${others.map((i) => `<label class="check"><input type="checkbox" name="join" value="${e(i.id)}"> ${e(nameOf(s, i.id))}</label>`).join('') || '<span class="small">Make a test identity first.</span>'}</fieldset>
<fieldset><legend>Remove</legend>${c.members.map((m) => `<label class="check"><input type="checkbox" name="leave" value="${e(m.id)}"> ${e(nameOf(s, m.id))}</label>`).join('')}</fieldset>
${rulesFields(c.rules)}
<label>The words (empty: the standard words, if the words were standard)</label><textarea name="words">${e(c.words)}</textarea>
<div class="row"><button type="submit">Review the change</button></div></form></details>
${money(s, c)}</div>`;
    })
    .join('');
}

/** Money and endings (Agreements draft 10, F121 to F124): stakes, the split service, the pointer, splits, debts, the fork, a release to the public domain, closing. */
function money(s: State, c: State['collectives'][number]): string {
  if (c.closed) return note('warn', `Ended by its fork or closing ${fp(c.closed)}: what its keys sign afterwards counts for nothing in Agreements.`);
  const id = e(c.id);
  const back = c.forkedFrom ? `<p class="small">Forked from ${fp(c.forkedFrom)}.</p>` : '';
  const stakes = back + (c.stakes.length
    ? `<p class="small">Shares of all its income: ${c.stakes.map((x) => `${e(x.name)} ${x.percent}%${x.member ? '' : ' (departed)'}`).join(', ')}.</p>`
    : '<p class="small">No stakes in the collective yet.</p>');
  const voices = c.members.filter((m) => !m.left);
  return `<details class="money"><summary>Money and endings</summary>
${stakes}
<form class="stakes" data-collective="${id}"><fieldset><legend>Each holder's share of all the collective's income, in percent</legend>
${c.holdersToBe.map((h) => `<label>${e(h.name)} <input type="number" step="any" min="0" name="share:${e(h.id)}" value="${c.stakes.find((x) => x.id === h.id)?.percent ?? ''}"></label>`).join(' ')}</fieldset>
<div class="row"><button type="submit">Review the stakes</button></div></form>
<form class="split-service row" data-collective="${id}"><select name="service">${s.identities.map((i) => `<option value="${e(i.id)}">${e(nameOf(s, i.id))}</option>`).join('')}</select><button type="submit">Review a split service</button></form>
<form class="pointer row" data-collective="${id}"><input name="addresses" type="text" placeholder="the collective's addresses, separated by spaces" required><button type="submit">Review a payee pointer</button></form>
<form class="service-pointer row"><select name="owner">${s.identities.map((i) => `<option value="${e(i.id)}">${e(nameOf(s, i.id))}</option>`).join('')}</select><input name="addresses" type="text" placeholder="its addresses, separated by spaces" required><button type="submit">Review a pointer for this identity</button></form>
<div class="row"><button class="quiet" data-action="check-pointer" data-collective="${id}">Check the collective's pointer, as an Agreements client before paying</button></div>
${c.splitService ? `<form class="split row" data-collective="${id}"><input name="amount" type="number" min="1" placeholder="amount received" required><input name="fee" type="number" min="0" placeholder="the service's fee" value="0"><button type="submit">Review a simulated payment and its split</button></form>` : ''}
${c.splits.length ? `<ul class="plain">${c.splits.map((x) => `<li>Split ${fp(x)} <button class="quiet" data-action="check-split" data-collective="${id}" data-split="${e(x)}">Check it</button></li>`).join('')}</ul>` : ''}
${c.releases.length ? `<form class="release-work row" data-collective="${id}"><select name="release">${c.releases.map((r) => `<option value="${e(r.id)}">${e(r.version)}</option>`).join('')}</select><button type="submit">Review a release to the public domain</button></form>` : ''}
${voices.length > 1 ? `<form class="fork" data-collective="${id}"><fieldset><legend>Fork: each member on a side</legend>
${voices.map((m) => `<label>${e(nameOf(s, m.id))} <select name="side:${e(m.id)}"><option value="1">side 1</option><option value="2">side 2</option><option value="none">no side</option></select></label>`).join(' ')}</fieldset>
<p class="small">Each side founds its own collective first; the fork names them. A member on no side has no seat in either, and keeps their share in both as a departed holder.</p>
<div class="row"><button type="submit">Review the fork</button></div></form>` : ''}
<form class="debt row" data-collective="${id}"><select name="creditor">${s.identities.map((i) => `<option value="${e(i.id)}">${e(nameOf(s, i.id))}</option>`).join('')}</select><input name="amount" type="number" min="1" placeholder="amount owed" required><button type="submit">Review a debt of the collective</button></form>
${c.debts.some((x) => x.creditorHeld) ? `<form class="debt-release row"><select name="debt">${c.debts.filter((x) => x.creditorHeld).map((x) => `<option value="${e(x.id)}">${e(x.id.slice(0, 8))}…, owed to ${e(x.creditorName)}${x.inherited ? ' (from the collective it was forked from)' : ''}</option>`).join('')}</select><button type="submit">Review the creditor's release of a debt (signed by the creditor alone)</button></form>` : ''}
<form class="closing row" data-collective="${id}"><button type="submit">Review closing the collective (it must hold nothing and owe nothing)</button></form>
</details>`;
}

export function found(s: State): string {
  return `<form id="found">
<div class="row"><input name="name" type="text" placeholder="A name, kept on this device" required></div>
<fieldset><legend>Members (you first: you propose it and hold the signing key)</legend>${s.identities.map((i) => `<label class="check"><input type="checkbox" name="members" value="${e(i.id)}"> ${e(nameOf(s, i.id))}</label>`).join('') || '<span class="small">Make test identities first.</span>'}</fieldset>
${rulesFields({ safety: 2, release: 2, clone: 2, others: '' })}
<label>The words everyone signs (empty: the standard words for these rules)</label><textarea name="words"></textarea>
<div class="row"><button type="submit">Review the founding</button></div></form>`;
}

export function ownRelease(s: State): string {
  return `<form id="own-release" class="row"><select name="publisher">${s.identities.map((i) => `<option value="${e(i.id)}"${i.mine ? ' selected' : ''}>${e(nameOf(s, i.id))}</option>`).join('')}</select>
<input name="version" type="text" placeholder="Version, e.g. 11b.1" required><button type="submit">Review a release</button></form>
<p class="small">Publishes every file git tracks in ${e(s.settings.checkout ?? s.settings.checkoutDefault)}, signed by that identity alone, as the first real release will be (step 17).</p>`;
}

export function byId(s: State): string {
  return `<form id="by-id">
<div class="grid"><label>Release id</label><input name="release" type="text" class="wide" placeholder="64 hexadecimal characters" required>
<label>Where to look (optional)</label><input name="at" type="text" class="wide" placeholder="relay addresses, separated by spaces">
<label>Sign as</label><select name="member">${s.identities.map((i) => `<option value="${e(i.id)}">${e(nameOf(s, i.id))}</option>`).join('')}</select></div>
<div class="row"><button type="submit" name="do" value="sign">Review a signature</button><button class="quiet" type="submit" name="do" value="verify">Check it</button></div></form>`;
}

export function settings(s: State): string {
  const via = Object.entries(s.settings.via).map(([a, b]) => `${a}=${b}`).join('\n');
  return `<form id="settings">
<label>Homes, one address per line: where new identities and collectives live</label><textarea name="homes">${e(s.settings.homes.map((h) => h.hint).join('\n'))}</textarea>
<label>Relays, one per line: where agreements, signatures, releases and files go (empty: the homes)</label><textarea name="relays">${e(s.settings.relays.join('\n'))}</textarea>
<label>Other ways to reach an address, one per line, as address=where (for example the onion home at its local port)</label><textarea name="via">${e(via)}</textarea>
<label>The folder a release publishes and a member compares with (empty: this MOR repository)</label><input name="checkout" type="text" class="wide" value="${e(s.settings.checkout ?? '')}" placeholder="${e(s.settings.checkoutDefault)}">
<div class="row"><button type="submit">Save settings</button></div></form>`;
}

export function history(s: State): string {
  if (!s.history.length) return '<p class="small">Nothing yet.</p>';
  return `<ul class="plain">${s.history
    .map((h) => `<li>${e(new Date(h.time * 1000).toLocaleString())}: ${e(h.title)} <span class="small">digest</span> <code title="${e(h.digest)}">${e(h.digest.slice(0, 16))}…</code></li>`)
    .join('')}</ul>`;
}

export function browsers(s: State): string {
  return `<ul class="plain">${s.paired
    .map((p) => `<li>${e(p.label)}${p.you ? ' <span class="tag ok">this browser</span>' : ''} <button class="quiet" data-action="unpair" data-key="${e(p.key)}" data-you="${p.you}">Unpair</button></li>`)
    .join('')}</ul><div class="row"><button class="quiet" data-action="code">A code for another browser on this machine</button></div><div id="code"></div>`;
}
