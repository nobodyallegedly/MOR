// Damgar's page, as HTML strings, for the program and the web client alike
// (`web` set). Everything from the program, from relays or typed by the
// person is escaped.
//
// The look (H36): Dub's (F332), tinted by the Money layer's gold, #e8b33a,
// by Kišib's rule (`docs/kishib-report.md`): the layer colour laid over the
// background #06080c at a share, channel by channel, on separators,
// outlines and quiet accents only, never on text that must be read; red
// only for an alarm (a proof that does not hold, a void act, a key changed
// elsewhere).

import { e } from '../../../manage/src/view.ts';
import { cardWords } from '../../../genesis/src/card-words.ts';
import { STYLE as DUB_STYLE } from '../../../dub/src/page/view.ts';
import type { Account, Accept, LaneShown, Line, PaymentShown, Rails, Shown, State, ToSign, Verdict, Who } from '../shapes.ts';

export { e };
export type { Account, Accept, LaneShown, Line, PaymentShown, Rails, State, ToSign };

export const NAME = 'Damgar';
export const TEST_ONLY = 'Test identities and test networks only, until MOR is frozen. No real money';

/** The web client's banner, on every page it shows: for testing only, and the risks in plain words. In the page's HTML itself (`static/web.html`). */
export const WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. The risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment you bring an identity here could copy its signing key, and the on-chain request key Damgar makes: with them, sign claims and receipts as you, and commit your side to payments you did not intend.</li>
<li>This browser’s storage, where those keys are kept, can be lost, or read by what runs in this page.</li>
<li>Damgar holds no wallet: money moves only in your own wallet, on a test network. This page follows no chain, so an on-chain payment is shown paid, not yet checked against the chain.</li></ol>
<p>Never bring a real identity here, and never pay real money for anything it shows.</p></div>`;

/**
 * Damgar's tint (H36): the Money layer's gold, #e8b33a, laid over #06080c
 * at a share, channel by channel (Kišib's rule): separators 22% (#382e16),
 * outlines of cards, fields and buttons 30% (#4a3b1a), quiet accents (a
 * hover or focus outline, a fold's mark, a tab's count) 60% (#8e6f28).
 */
export const TINT = { layer: '#e8b33a', line: '#382e16', edge: '#4a3b1a', accent: '#8e6f28' } as const;

export const STYLE = `${DUB_STYLE}
:root{--line:${TINT.line};--edge:${TINT.edge};--tint:${TINT.accent}}
button:hover,.door:hover{border-color:var(--tint)}
input:focus,textarea:focus{border-color:var(--tint)}
details>summary::before{color:var(--tint)}
.bar{border-bottom-color:var(--edge)}
.count{background:var(--edge)}
.card{background:var(--raise)}
.item{border:1px solid var(--edge);border-radius:12px;padding:12px 14px;margin:12px 0;background:var(--raise)}
.item h3{margin:0 0 4px;font-weight:400;font-size:15px}
.item .meta{font-size:12px;color:var(--soft)}
.item ul{margin:6px 0;padding-left:1.1em;font-size:14px}
.item li{margin:3px 0}
li.bad{color:var(--bad)}
li.warn{color:var(--soft)}
.amount{font-size:17px;margin:4px 0}
.unknown{border-color:var(--line)}
.unknown h3{color:var(--soft)}
.copy{font:12px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--soft);overflow-wrap:anywhere;border:1px solid var(--edge);border-radius:10px;padding:8px 10px;background:var(--bg);margin:6px 0}
.v{font-size:12px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--edge);color:var(--soft)}
.v.valid{color:var(--text);border-color:var(--tint)}
.v.invalid{color:var(--bad);border-color:var(--bad)}
.proofs{border-top:1px solid var(--line);margin-top:8px;padding-top:6px;font-size:13px}
.proofs .p{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin:4px 0}
details.settled{border:1px solid var(--line);border-radius:12px;padding:8px 14px;margin:8px 0}
details.settled>summary{font-size:14px;color:var(--text);cursor:pointer}
details.setting{border-top:1px solid var(--line, rgba(127,127,127,.25));padding:2px 0}
details.setting>summary{cursor:pointer;list-style-position:outside}
details.setting>summary>h2{display:inline;margin:0}
details.setting[open]>summary{margin-bottom:6px}
details.settled[open]>summary{margin-bottom:4px}
details.settled .item{border:0;padding:0;margin:4px 0 0;background:none}
.totals{border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:12px 0}
.totals dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0;font-size:14px}
.totals dt{color:var(--soft)}
.totals dd{margin:0}
.accept li{list-style:none;border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:10px 0}
.accept ul{padding:0}
.accept .check{font-size:15px;color:var(--text)}
.accept .kind{font-size:12px;color:var(--soft);margin-left:6px}
.accept p{margin:4px 0 0 26px;font-size:13px;color:var(--soft)}
.accept .round{color:var(--faint)}
.costs{border:1px solid var(--bad);border-radius:12px;padding:10px 14px;margin:12px 0}
.costs h3{font-weight:400;margin:0 0 4px}`;

export const note = (kind: 'error' | 'done' | 'warn' | 'spent' | '', html: string) => `<div class="note ${kind}">${html}</div>`;
export const lines = (ls: Line[]) => (ls.length ? `<ul>${ls.map((l) => `<li class="${e(l.tone ?? '')}">${e(l.text)}</li>`).join('')}</ul>` : '');

export function who(w: Who): string {
  return `<span class="who"><span class="fp" title="${e(w.id)}">${e(w.short)}</span>${w.me ? '<span class="you">you</span>' : ''}</span>`;
}

function testNotice(web: boolean): string {
  return web ? '' : `<div class="banner" id="test-only">${TEST_ONLY}. Damgar holds no wallet and no node: money moves only in your own wallet. The signing key and the on-chain request key are held in software in this program’s folder: a prototype, never for a real identity.</div>`;
}

export function top(web = false, back = false): string {
  return `<header class="bar"><h1 class="mark">${NAME}</h1><span class="grow"></span>${back ? '<button class="quiet" data-action="back">Back to Damgar</button>' : `<span class="small">${web ? 'web client, for testing only' : 'this machine only'}</span>`}</header>
${testNotice(web)}`;
}

export function pairing(): string {
  return `${top()}
<h2>Pair this browser</h2>
<p class="small">This page acts for the Damgar program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" class="grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit">Pair</button></form>
<div id="pair-status"></div>`;
}

// ------------------------------------------------------------------ the identity window

export function identityWindow(s: State, web: boolean): string {
  const held = s.held.length
    ? `<h2>Identities held here</h2><div class="held"><ul>${s.held.map((h) => `<li><span class="fp" title="${e(h.id)}">${e(h.short)}</span>${h.active ? '<span class="small">in use</span>' : `<button data-action="use" data-id="${e(h.id)}">Use this one</button>`}<button class="quiet" data-action="forget" data-id="${e(h.id)}">Forget it here</button></li>`).join('')}</ul></div>`
    : '';
  const i = s.identity;
  const mine = i
    ? `<section class="card"><h3>In use</h3><p class="id">${e(i.form)}</p><p class="small">In hexadecimal, as before: <span class="fp">${e(i.grouped)}</span></p>
<dl class="facts"><dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd><dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd><dt>Damgar’s line</dt><dd>${cardWords(i.line, 'Damgar', e)}</dd></dl>
<p class="small">Most of Damgar’s acts are sealed, so Kišib cannot read its line from the homes: when the signing key is changed there, give Kišib this card (latest act, position, summary), or every claim and receipt signed here becomes void (Identity rule 35).</p>
${i.encryption ? '' : note('warn', 'Damgar holds no encryption key for this identity: nothing sealed to it opens here.')}
<div class="row"><button data-action="carry">Show the signing key’s words</button><button data-action="leave" class="quiet">Leave it</button><button data-action="back" class="primary">Back to Damgar</button></div>
<details><summary>Its signing key was changed elsewhere (in Kišib): take the new words</summary><form id="renew"><label>The new signing key’s 24 words</label><textarea name="words" required></textarea><div class="row"><button type="submit">Use the new words</button></div></form></details></section>`
    : '';
  return `${top(web, !!i)}
<h2>${i ? 'The identity' : 'First, an identity'}</h2>
<p class="small">Damgar never makes an identity and never holds a chain key. Bring one you have, by its ID and its signing key’s words, as in Dub: Dub’s identity window shows them (“Show the signing key’s words”).</p>
${mine}
${held}
<section class="card"><h3>Bring an identity you have</h3>
<form id="bring"><label>Its ID (mid1…, or its hexadecimal)</label><input name="id" autocomplete="off" spellcheck="false" required>
<label>Its signing key’s 24 words (never the chain key’s)</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<details><summary>Relays, if it names none</summary><label>One per line</label><textarea name="relays"></textarea></details>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>
<div id="status"></div>`;
}

export function carry(c: { grouped: string; words: string[] }, web: boolean): string {
  return `${top(web, true)}<h2>The signing key’s words</h2>
<p class="small">With the ID, they bring this identity into Damgar, Dub or Edubba on another device. Whoever holds them can sign claims and receipts as this identity and open what is sealed to it. They are not the chain key’s words, and not a Bitcoin wallet’s.</p>
<p class="id">${e(c.grouped)}</p><div class="words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join('')}</div>
<div class="row"><button data-action="back" class="primary">Back to Damgar</button></div>`;
}

// ------------------------------------------------------------------ what is accepted

export function acceptList(items: Accept[]): string {
  return `<div class="accept"><ul>${items
    .map(
      (a) => `<li><label class="check"><input type="checkbox" name="accept" value="${e(a.key)}"${a.accepted ? ' checked' : ''}> ${e(a.name)}<span class="kind">${e(a.kind)}, draft ${a.draft}</span></label>
<p>${e(a.does)}</p><p>${e(a.here)}</p><p class="round">${e(a.text)}${a.built ? '' : ' · not used by Damgar in round 1'}${a.needs.length ? ` · needs ${a.needs.map(e).join(', ')}` : ''}</p></li>`,
    )
    .join('')}</ul></div>`;
}

export function acceptScreen(s: State, web: boolean): string {
  return `${top(web)}
<h2>What you accept</h2>
<p class="small">Every money act names the specifications it follows. Damgar reads, checks and signs only under those you accept here; an act under any other is shown unknown, and is never signed (as the core treats a specification it does not implement). Your choice is sealed to your identity and kept at its homes, so every app holding it reads the same list (F340); changeable in Settings.</p>
${s.list.problems.length ? note('warn', lines(s.list.problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}
<form id="accept">${acceptList(s.accept)}<div class="row"><button type="submit" class="primary">Accept these</button></div></form>
<div id="status"></div>`;
}

// ------------------------------------------------------------------ the app: four tabs

export function app(s: State, web: boolean): string {
  const i = s.identity!;
  const tab = (k: string, label: string, count = '') => `<button class="tab${k === 'sign' ? ' on' : ''}" data-tab="${k}">${label}<span class="count" id="count-${k}">${count}</span></button>`;
  return `<header class="bar"><h1 class="mark">${NAME}</h1>
<nav class="tabs">${tab('sign', 'To sign', s.counts.toSign ? String(s.counts.toSign) : '')}${tab('account', 'The account')}${tab('pay', 'Pay', s.counts.toPay ? String(s.counts.toPay) : '')}${tab('lanes', 'Lanes')}${tab('collectives', 'For a collective')}${tab('settings', 'Settings')}</nav>
<button class="me" data-action="window" title="The identity">${who({ id: i.id, short: i.short, me: true })}</button></header>
${testNotice(web)}
<div id="spent"></div>
<div id="status"></div>
<section id="sign"><div class="row"><span class="grow small">Drafts prepared in Dub and Edubba, requests others sent, invoices to make, receipts to sign. Nothing is signed until you choose.</span><button class="quiet" data-action="look">Look again</button></div><div id="sign-list"><p class="empty">Looking…</p></div></section>
<section id="account" hidden><div id="account-body"><p class="empty">Reading the account…</p></div></section>
<section id="pay" hidden><p class="small">Damgar holds no wallet. For each payment it shows what to pay; pay it in your own wallet, then paste the proof back here.</p><div id="pay-list"><p class="empty">Reading…</p></div></section>
<section id="lanes" hidden><p class="small">A lane lets an app (Dub, or Damgar itself) sign some of your money acts by itself, within a cap per act and until a date: a grant of your identity to itself, its key held by that app (F338, F351). Every act signed under one is shown so, here and to every reader. One revocation ends it.</p><div id="lanes-body"><p class="empty">Reading…</p></div></section>
<section id="collectives" hidden><p class="small">For a collective whose Money area you hold: Damgar acts for it with your own key for it, made as you signed its founding and sealed to you at your homes (F353). Within the area’s cap, your key alone; above it, another holder’s key too, as its constitution writes it.</p><div id="collectives-body"><p class="empty">Reading…</p></div></section>
<section id="settings" hidden><div id="settings-body"><p class="empty">Reading…</p></div></section>`;
}

const amount = (a: Shown | null) => (a ? `<p class="amount">${e(a.said)}</p>` : '');
const verdict = (v: Verdict) => `<span class="v ${e(v.answer)}" title="${e(v.why)}">${e(v.answer)}</span>`;

export function toSign(items: ToSign[], problems: string[]): string {
  if (!items.length) return `<p class="empty">Nothing waits to be signed.</p>${problems.length ? note('warn', lines(problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}`;
  const btn = (o: string, id: string, label: string, primary = false) => `<button${primary ? ' class="primary"' : ''} data-action="${o}" data-id="${e(id)}">${label}</button>`;
  return (
    items
      .map((t) => {
        const offers = t.offers
          .map((o) => {
            switch (o) {
              case 'sign':
                return btn('sign draft', t.id, t.kind === 'draft' && t.title.startsWith('A request') ? 'Sign and send the request' : 'Sign it', true);
              case 'decline':
                return btn('decline', t.id, t.kind === 'unknown' ? 'Set it aside' : 'Decline');
              case 'debt':
                return btn('accept debt', t.id, 'Accept as a debt (sign an obligation)');
              case 'pay':
                return btn('pay request', t.id, 'Pay it', true);
              case 'receipt':
                return btn('sign receipt', t.id, 'Check it, and sign the receipt', true);
              case 'refuse':
                return btn('refuse invoice', t.id, 'Refuse');
              case 'grant':
                return btn('grant lane', t.id, 'Grant this lane', true);
              case 'address':
                return btn('answer address', t.id, 'Give an address bound to it', true);
              default:
                return '';
            }
          })
          .join('');
        const invoice =
          t.offers.includes('invoice')
            ? `<label>The description hash to give your wallet</label><div class="copy" data-copy>${e(t.descriptionHash ?? '')}</div><button class="quiet" data-action="copy" data-text="${e(t.descriptionHash ?? '')}">Copy</button>
<form class="invoice" data-id="${e(t.id)}"><label>The invoice your wallet made (BOLT 11)</label><textarea name="invoice" required spellcheck="false" placeholder="lnbcrt…"></textarea><div class="row"><button type="submit" class="primary">Check it and send it</button></div></form>`
            : '';
        return `<div class="item${t.unknown ? ' unknown' : ''}" data-item="${e(t.id)}"><h3>${e(t.title)}</h3><div class="meta">${t.app ? `Prepared in ${e(t.app)} · ` : ''}from ${who(t.from)}</div>${amount(t.amount)}${lines(t.lines)}${invoice}<div class="row">${offers}</div></div>`;
      })
      .join('') + (problems.length ? note('warn', lines(problems.map((x) => ({ text: x, tone: 'warn' })))) : '')
  );
}

export function payment(p: PaymentShown, forPay = false): string {
  const proofs = p.proofs.length
    ? `<div class="proofs">${p.proofs.map((x) => `<div class="p"><span>${x.kind === 'claim' ? 'Claim' : 'Receipt'} by ${who(x.by)}</span><span class="small how">${e(x.how)}</span>${verdict(x.rail)}<span class="small">rail: ${e(x.rail.why || 'the rail’s own evidence holds')}</span>${x.confirmations ? `<span class="small">${x.confirmations[0]} of ${x.confirmations[1]} confirmations</span>` : ''}</div><div class="p small">Beside it: ${verdict(x.beside)} ${e(x.beside.why)}${x.standing !== 'valid' ? ` · the act itself: ${e(x.standing)}` : ''}</div>`).join('')}</div>`
    : '';
  const pay =
    forPay && p.pay
      ? p.pay.invoice
        ? `<label>Pay this invoice in your wallet</label><div class="copy">${e(p.pay.invoice)}</div><button class="quiet" data-action="copy" data-text="${e(p.pay.invoice)}">Copy the invoice</button>
<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once paid: the preimage (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="row"><button type="submit" class="primary">Check it and sign my claim</button></div></form>`
        : `<label>Pay exactly ${e(p.pay.amount.said)} to this address, from your wallet</label><div class="copy">${e(p.pay.address ?? '')}</div><button class="quiet" data-action="copy" data-text="${e(p.pay.address ?? '')}">Copy the address</button>
${p.stage === 'paid' ? `<div class="row"><button data-action="recheck" data-key="${e(p.key)}" class="primary">Check the chain again</button></div>` : `<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once sent: the transaction’s id (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="row"><button type="submit" class="primary">Check it and sign my claim</button></div></form>`}`
      : '';
  const vaultInvoice =
    forPay && p.vaultInvoice
      ? `<p class="small">Make an invoice on your vault’s node (${e(p.vaultInvoice.node.slice(0, 16))}…) for exactly ${e(p.amount.said)}, with this description hash and no description (on regtest, in the test wallet, on the vault’s node):</p><div class="copy">${e(p.vaultInvoice.descriptionHash)}</div>
<form class="vault-invoice" data-key="${e(p.key)}"><label>The invoice your vault’s node made</label><input name="invoice" required spellcheck="false" autocomplete="off"><div class="row"><button type="submit" class="primary">Check it</button></div></form>`
      : '';
  const ticket = p.ticket ? `<p class="small">An anchor’s ticket: batch ${p.ticket.batch}, tier ${p.ticket.tier}, on the chain by block ${p.ticket.deadline}.${p.ticket.checked ? '' : ' Not checked here: this Damgar follows no chain, so whether that block is within the tier’s reach of today’s is unknown. Pay only if you trust the service on it, or check it in Damgar on a computer.'}</p>` : '';
  return `<div class="item" data-payment="${e(p.key)}"><h3>${p.side === 'out' ? 'To' : 'From'} ${who(p.other)} · ${e(p.railName)}${p.to === 'vault' ? ', to the vault' : ''}</h3>
<div class="meta">${e(p.stageSaid)}</div>${amount(p.amount)}${p.whatFor ? `<p class="small">For “${e(p.whatFor)}”</p>` : ''}${ticket}${lines(p.lines)}${vaultInvoice}${pay}${proofs}</div>`;
}

/** Paid and confirmed: settled, its receipt and a claim each valid by the rail's own evidence, and counting. */
export const confirmed = (p: PaymentShown): boolean =>
  p.stage === 'settled' && (['claim', 'receipt'] as const).every((k) => p.proofs.some((x) => x.kind === k && x.rail.answer === 'valid' && x.standing === 'valid'));

/** A payment in the account: folded once paid and confirmed, its record one click away. */
function accountPayment(p: PaymentShown): string {
  if (!confirmed(p)) return payment(p);
  return `<details class="fold settled" data-settled="${e(p.key)}"><summary>${p.side === 'out' ? 'To' : 'From'} ${e(p.other.short)} · ${e(p.railName)} · ${e(p.amount.said)} · <span class="v valid">paid and confirmed</span></summary>${payment(p)}</details>`;
}

export function account(a: Account): string {
  const totals = `<div class="totals"><dl>${a.totals.map((t) => `<dt>${e(t.label)}</dt><dd>${t.amounts.length ? t.amounts.map((x) => e(x.said)).join('<br>') : '<span class="small">none</span>'}</dd>`).join('')}</dl></div>`;
  const asks = a.asks.length
    ? `<h2>Requests and debts</h2>${a.asks.map((x) => `<div class="item"><h3>${x.side === 'out' ? 'You asked' : 'Asked of you by'} ${who(x.other)}</h3><div class="meta">${e(x.state)}</div>${amount(x.amount)}${x.whatFor ? `<p class="small">For “${e(x.whatFor)}”</p>` : ''}${lines(x.lines)}</div>`).join('')}`
    : '';
  return `<p class="small">Totals are per unit, never added across units.</p>${totals}
<h2>Payments</h2>${a.payments.length ? `${a.payments.some(confirmed) ? '<p class="small">Payments paid and confirmed are folded: open one to see its record.</p>' : ''}${a.payments.map(accountPayment).join('')}` : '<p class="empty">No payment yet.</p>'}
${asks}
<details class="fold"><summary>What this account does not judge</summary>${lines(a.notes.map((t) => ({ text: t })))}</details>
${a.problems.length ? note('warn', lines(a.problems.map((t) => ({ text: t, tone: 'warn' })))) : ''}`;
}

export function payList(ps: PaymentShown[]): string {
  return ps.length ? ps.map((p) => payment(p, true)).join('') : '<p class="empty">Nothing to pay.</p>';
}

/** One section of Settings, folding (H45): open on first use, before anything is saved there; after, folded unless the person opened it. */
const fold = (name: string, title: string, body: string, open: boolean) => `<details class="fold setting" data-fold="${name}"${open ? ' open' : ''}><summary><h2>${title}</h2></summary>${body}</details>`;

/**
 * Settings (H45, Nobody, allegedly, from using Damgar): every section folds,
 * the person opening the ones they need; on first use, before anything is
 * saved here, all start open. What you accept comes last.
 */
export function settings(s: State, r: Rails | null, problem: string | null, l: { manual: boolean; link: boolean; linkSay: string[]; clock: string | null } | null, opened: Set<string> = new Set()): string {
  const i = s.identity!;
  const open = (name: string) => !s.settingsSaved || opened.has(name);
  const pointer = r?.pointer
    ? `<p>Your payee pointer in force: version ${r.pointer.version}${r.pointer.forked ? ' (its chain is forked: the last pointer before the fork counts)' : ''}.</p>${lines(r.pointer.rails.map((x, n) => ({ text: `${n + 1}. ${x.name}: ${x.said}${x.accepted ? '' : ' (a rail Module you do not accept)'}` })))}`
    : '<p class="small">You have no payee pointer yet: nobody can pay you until you say where.</p>';
  const vault = r?.vault
    ? `${lines(r.vault.entries.map((x) => ({ text: `${x.unit.said}, on ${x.railName}: ${x.said}.` })))}<p class="small">Declared in your identity’s chain (act ${e(r.vault.declaredBy.slice(0, 12))}…), with the chain key: it is changed only in Kišib, in a change of keys, never here (Money rule 2).</p>`
    : '<p class="small">Your identity’s chain declares no vault: every payment goes to your flow, and you have chosen no protection (Money rule 3). A vault, and its limit per unit, is declared with the chain key, in Kišib.</p>';
  const paid = `${problem ? note('warn', e(problem)) : pointer}
<form id="rails"><label>Lightning: your wallet’s node key (66 hexadecimal characters; the test wallet shows it)</label><input name="lightning" autocomplete="off" spellcheck="false">
<label>On-chain: a Bitcoin key of your wallet, x-only (64 hexadecimal characters)</label><input name="onchain" autocomplete="off" spellcheck="false">
<label>Network</label><select name="network"><option value="3" selected>regtest</option><option value="2">signet</option></select>
<label class="check"><input type="checkbox" name="newRequestKey"> Make a new on-chain request key (the old one then no longer counts for new payments)</label>
<div class="row"><button type="submit">Read it back</button></div></form><div id="rails-review"></div>
${r?.requestKey ? `<p class="small">The on-chain request key Damgar holds: <span class="fp">${e(r.requestKey.slice(0, 16))}…</span></p>` : ''}`;
  const where = `<dl class="facts"><dt>Homes</dt><dd>${e(i.homes.join(', '))} (the identity’s chain names them; changed in Kišib)</dd><dt>The chain followed</dt><dd>${e(r?.chain ?? '')}</dd></dl>
<form id="relays"><label>Relays its money acts go to, one per line</label><textarea name="relays">${e(i.relays.join('\n'))}</textarea><div class="row"><button type="submit">Save the relays</button></div></form>`;
  const accept = `<p class="small">Sealed to your identity at its homes${s.list.version ? ` (version ${s.list.version})` : ''}: every app holding it reads it, each for its part. Damgar changes only the Money layer’s part.</p>
${s.list.merged.length ? note('warn', `Two apps changed it at once; merged: ${lines(s.list.merged.map((t) => ({ text: t })))}`) : ''}
<form id="accept">${acceptList(s.accept)}<div class="row"><button type="submit" class="primary">Save what I accept</button></div></form>
<div class="row"><span class="grow small">${s.list.published ? 'Published: anyone can read which specifications you accept.' : 'Private: sealed to yourself (the default).'}</span><button data-action="publish list" data-on="${s.list.published ? 'false' : 'true'}">${s.list.published ? 'Make it private again' : 'Publish it'}</button></div>`;
  return [
    fold('paid', 'Where you are paid', paid, open('paid')),
    fold('vault', 'The vault', `${vault}${r?.vault ? vaultTransferForm(r.vault.entries) : ''}`, open('vault')),
    fold('relays', 'Homes and relays', where, open('relays')),
    ...(l ? byHand(l, s.web).map(([name, title, body]) => fold(name, title, body, open(name))) : []),
    fold('accept', 'What you accept', accept, open('accept')),
  ].join('\n');
}

/** Transfer to the vault (H46, F355): one of its entries and an amount, read back before anything is bound. */
function vaultTransferForm(entries: { unit: { said: string }; railName: string }[]): string {
  return `<h3>Transfer to the vault</h3><p class="small">From your wallet to your vault, one way only: Damgar binds the payment, you pay it in your wallet (on regtest, the test wallet) and paste the proof back. Withdrawing needs the chain key and stays in Kišib.</p>
<form id="vault-transfer"><label>To</label><select name="entry">${entries.map((x, i) => `<option value="${i}">${e(x.railName)}, ${e(x.unit.said)}</option>`).join('')}</select>
<label>Amount (whole units)</label><input name="value" inputmode="numeric" autocomplete="off" required>
<div class="row"><button type="submit">Read it back</button></div></form><div id="vault-review"></div>`;
}

/** A transfer to the vault, read back: the vault, the amount, the fee as far as Damgar can say, and what it costs. */
export function vaultReview(r: { digest: string; lines: Line[]; costs: Line[]; blocking: string[] }): string {
  return `<div class="item"><h3>Transfer to your vault, read back</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="costs"><h3>Before you send</h3>${lines(r.costs)}</div>` : ''}
${r.blocking.length ? note('warn', lines(r.blocking.map((t) => ({ text: t, tone: 'warn' as const })))) : `<div class="row"><button class="primary" data-action="vault transfer" data-digest="${e(r.digest)}">Bind it, then pay it in Pay</button></div>`}`;
}

export function railsReview(r: { digest: string; lines: Line[]; costs: Line[] }): string {
  return `<div class="item"><h3>Your new payee pointer</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="costs"><h3>What each rail costs you, stated by its Module</h3>${lines(r.costs)}</div>` : ''}
<div class="row"><button class="primary" data-action="rails publish" data-digest="${e(r.digest)}">Sign and publish it</button></div>`;
}

export function spent(say: string): string {
  return note('spent', `${e(say)} <button data-action="window">Give the new words</button>`);
}

// ------------------------------------------------------------------ lanes (round 2)

export function lanes(r: { lanes: LaneShown[]; manual: boolean }, units: { hash: string; label: string }[]): string {
  const list = r.lanes.length
    ? r.lanes
        .map(
          (l) => `<div class="item lane${l.state === 'in force' ? '' : ' unknown'}" data-lane="${e(l.grant)}"><h3>${e(l.label)}</h3><div class="meta">${e(l.state)} · its key held by ${e(l.here ? 'this Damgar' : l.app)} · grant <span class="fp" title="${e(l.grant)}">${e(l.grant.slice(0, 8))}…</span></div>
${lines(l.words.map((text) => ({ text })))}
<details class="fold"><summary>Signed under it: ${l.acts.length} act${l.acts.length === 1 ? '' : 's'}</summary>${l.acts.length ? lines(l.acts.map((a) => ({ text: `${a.said} · ${a.id.slice(0, 12)}…` }))) : '<p class="small">None yet.</p>'}</details>
${l.state === 'in force' ? `<div data-revoke="${e(l.grant)}"><div class="row"><button data-action="revoke lane review" data-grant="${e(l.grant)}">Revoke it</button></div></div>` : ''}</div>`,
        )
        .join('')
    : '<p class="empty">No lane yet. An app asks for one (in Dub: its identity window, “Paying from Dub: a lane from Damgar”), and it waits in To sign.</p>';
  const unitOptions = units.map((u) => `<option value="${e(u.hash)}"${/regtest/.test(u.label) ? ' selected' : ''}>${e(u.label)}</option>`).join('');
  const own = (role: string, title: string, say: string) => `<form class="own-lane" data-role="${role}"><h3>${title}</h3><p class="small">${say}</p>
<div class="row"><label>At most, per act <input name="cap" inputmode="numeric" required></label><label>Unit <select name="unit">${unitOptions}</select></label></div>
<label>Until (optional; judged on the timestamp clock named in Settings)</label><input name="until" type="datetime-local">
<div class="row"><button type="submit">Read it back</button></div></form>`;
  return `${r.manual ? note('warn', 'Every step is followed by hand (Settings): the lanes Damgar holds sign nothing until you turn it off. Lanes other apps hold still sign there.') : ''}
<h2>Your lanes</h2>${list}
<h2>Damgar by itself</h2>
<p class="small">With these, a payment to you needs nothing from you: Damgar answers and signs the receipt by itself, below the cap. Without them, everything waits in To sign, as in round 1.</p>
${own('receipts', 'Receipts and invoices, by itself', 'Damgar checks a payment to you from the rail’s own evidence and signs the receipt; it answers an invoice request with an address, or with an invoice your node made through its receive-only link (Settings).')}
${own('payouts', 'Referral shares, by itself', 'When someone buys your work through a repost and your offer promises the reposter a share, Damgar asks for that payment by itself; you still pay it in your wallet, from Pay.')}
<div id="lane-review"></div>`;
}

/** A lane's revocation, read back with its cost before it is signed (F352). */
export function revokeReview(grant: string, said: Line[]): string {
  return `<div class="item"><h3>The revocation, read back</h3>${lines(said)}</div><div class="row"><button class="primary" data-action="revoke lane" data-grant="${e(grant)}">Sign the revocation</button></div>`;
}

export function laneReview(r: { digest: string; lines: Line[] }): string {
  return `<div class="item"><h3>The lane, read back</h3>${lines(r.lines)}</div><div class="row"><button class="primary" data-action="own lane" data-digest="${e(r.digest)}">Sign this lane</button></div>`;
}

/** Settings' sections for how Damgar signs (round 2): by hand, the clock for lanes, the receive-only link. Each [fold name, title, body]. */
export function byHand(r: { manual: boolean; link: boolean; linkSay: string[]; clock: string | null }, web: boolean): [string, string, string][] {
  return [
    ['manual', 'Every step by hand', `<p class="small">For those who want to follow the real process step by step: every signature waits for you, as in round 1. Off by default.</p>
<label class="check"><input type="checkbox" id="manual"${r.manual ? ' checked' : ''}> Follow every step by hand (a clear demonstration of the real process)</label>`],
    ['clock', 'The clock for lanes', `<p class="small">A lane’s expiry is judged on a timestamp clock you name (the grant limits cMIP, 3.1): until it stamps an act, whether it came before the expiry is unknown.</p>
<form id="clock" class="row"><input name="clock" class="grow" placeholder="its ID" value="${e(r.clock ?? '')}" spellcheck="false"><button type="submit">Save the clock</button></form>`],
    ['link', 'Making invoices by itself (receive-only)', `${lines(r.linkSay.map((text) => ({ text })))}
${web ? note('warn', 'The web client never makes a link to a node: use Damgar on your computer.') : r.link ? `<p>A receive-only link is kept.</p><div class="row"><button data-action="link remove">Remove it</button></div>` : `<form id="link"><label>Your node’s REST address</label><input name="rest" placeholder="https://127.0.0.1:8080" spellcheck="false" required>
<label>The receive-only permission’s file (on lnd, the macaroon baked with invoices:write and invoices:read)</label><input name="macaroonFile" spellcheck="false" required>
<label>The node’s certificate file (tls.cert)</label><input name="certFile" spellcheck="false" required>
<div class="row"><button type="submit">Check it and keep it</button></div></form>`}`],
  ];
}

/** For a collective (round 3, F353): each collective acted for, its Money area, a promise to pay, and the promises signed here with how they stand. */
export function collectives(r: { collectives: { id: string; area: { name: string; holders: string[]; number: number; cap: { value: number } | null } | null; why: string | null; acts: { act: string; to: string; amount: { value: number }; whatFor: string; standing: { met: boolean; areas: { signers: string[]; needed: number; byKey: string[]; limits?: string | null }[] } | null }[] }[] }): string {
  const one = (c: (typeof r.collectives)[number]) => {
    const area = c.area;
    const acts = c.acts.length
      ? lines(
          c.acts.map((a) => {
            const st = a.standing;
            const keys = st?.areas[0];
            return { text: `${a.amount.value.toLocaleString('en')} to ${a.to.slice(0, 8)}…${a.whatFor ? ` (${a.whatFor})` : ''}: ${st ? (st.met ? 'counts for the collective' : 'does not count yet') : 'not read'}${keys ? `, ${keys.signers.length} of ${keys.needed} keys${keys.limits === 'above' ? ', above the cap' : ''}` : ''} · ${a.act.slice(0, 12)}…`, tone: st?.met ? 'ok' : 'warn' };
          }),
        )
      : '<p class="small">No promise signed here yet.</p>';
    return `<div class="item" data-collective="${e(c.id)}"><h3>Collective <span class="fp" title="${e(c.id)}">${e(c.id.slice(0, 8))}…${e(c.id.slice(-4))}</span></h3>
${area ? `<p class="small">Its Money area, “${e(area.name)}”: ${area.holders.length} holder${area.holders.length === 1 ? '' : 's'}, ${area.number} key${area.number === 1 ? '' : 's'}${area.cap ? `; above ${area.cap.value.toLocaleString('en')} an act, one more` : ''}.</p>` : ''}
${c.why ? note('warn', e(c.why)) : `<form class="collective-promise" data-collective="${e(c.id)}"><h4>A promise to pay, from the collective</h4>
<label>To whom (an ID)</label><input name="to" type="text" required autocomplete="off" spellcheck="false">
<div class="row"><label>How much (regtest satoshis) <input name="value" type="text" inputmode="numeric" required class="narrow"></label></div>
<label>What for</label><input name="whatFor" type="text">
<div class="row"><button type="submit">Read it back</button></div><div class="promise-read"></div></form>`}
<h4>Promises signed here</h4>${acts}</div>`;
  };
  return `${r.collectives.map(one).join('') || '<p class="empty">No collective yet.</p>'}
<form id="collective-add" class="row"><input name="id" type="text" class="grow" placeholder="A collective’s ID (mid1… or hex)" autocomplete="off" spellcheck="false" required><button type="submit">Act for it</button></form>`;
}

/** A promise read back, before it is signed. */
export function promiseRead(r: { lines: Line[]; digest: string }): string {
  return `${lines(r.lines)}<div class="row"><button class="primary" data-action="collective-promise" data-digest="${e(r.digest)}">Sign it for the collective, with my own key</button></div>`;
}
