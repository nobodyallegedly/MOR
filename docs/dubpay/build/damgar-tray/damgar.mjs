#!/usr/bin/env node
// Damgar, the Dubsar Suite's money hub, as a tray app. Version 0.2.2, DubPay.
// Run from your own folder (the one holding kit/, in/, out/, keys/):  node damgar.mjs help
// What it does: shows your bank balance, makes invoices, pays invoices, and follows a shower
// payment through the signed leg reports it can read, to everyone it reached.
// What it never does: read or send your keys, write anywhere but out/, or talk to anything but
// the postman's tray. Every bank order is made and signed by your own kit (kit/mor.mjs), so
// Damgar holds no key and signs nothing itself. Read this file before you run it.
// Test identities and regtest only. Free to use, copy and change. No fee.

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HERE = process.cwd();
const KIT = join(HERE, 'kit', 'mor.mjs');
if (!existsSync(KIT)) { console.error('damgar: run me from your folder (kit/mor.mjs not found here)'); process.exit(1); }
const { mor, plain, unhex, hex } = await import(join(HERE, 'kit', 'lib', 'core.mjs'));
const REPORT_SPEC = '7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854';

function kit(args) {
  const r = spawnSync(process.execPath, [KIT, ...args], { cwd: HERE, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/20\d{15}-\d{3}-[a-z]+-[0-9a-f]{4}/);
  return { out, letter: m ? m[0] : null };
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function answer(letter, seconds = 120) {
  const f = join(HERE, 'in', `${letter}.answer.json`);
  for (let i = 0; i < seconds; i++) { if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8')); await sleep(1000); }
  return null;
}
const sats = (n) => `${Number(n).toLocaleString('en')} sats (€${(Number(n) / 100).toFixed(2)})`;

async function bank(args, label) {
  const { out, letter } = kit(['bank', ...args]);
  if (!letter) { console.log(out.trim()); return null; }
  console.log(`${label}: order sent (${letter}); waiting for the postman…`);
  const a = await answer(letter);
  if (!a) { console.log('No answer yet. Read it later: node kit/mor.mjs read ' + letter); return null; }
  console.log(`Outcome: ${a.outcome}${a.reason ? ' — ' + a.reason : ''}`);
  if (a.account) console.log(`Balance ${sats(a.account.balance)}; held ${sats(a.account.held)}; available ${sats(a.account.available)}.`);
  return { ...a, letter };
}

// --- following a shower payment -------------------------------------------------------
function reportsFrom(letters) {
  const out = new Map();
  for (const name of letters) {
    let b; try { b = readFileSync(join(HERE, 'in', `${name}.answer.body`)); } catch { continue; }
    let items = [];
    try { const p = mor.cborDecode(b); const v = p && p.get ? p.get(0) : null; items = Array.isArray(v) ? v : []; } catch { items = [[0, 0, new Uint8Array(b)]]; }
    for (const it of items) {
      const bytes = it[2] instanceof Uint8Array ? it[2] : (typeof it[2] === 'string' ? unhex(it[2]) : null);
      if (!bytes) continue;
      let d; try { d = plain(mor.describeAct(bytes)); } catch { continue; }
      if (d.spec !== REPORT_SPEC || !d.payload) continue;
      let p; try { p = mor.cborDecode(unhex(d.payload)); } catch { continue; }
      const lines = (p.get(2) || []).map((l) => plain(l));
      out.set(d.id, { id: d.id, signer: d.signer, call: plain(p.get(0)), lines });
    }
  }
  return [...out.values()];
}
const KIND = ['received', 'passed on', 'own part', 'kept (fee)', 'still owed'];
const who = (w) => (Array.isArray(w) ? (w[0] === 2 ? 'agreement ' : '') + w[1] : (typeof w === 'string' ? w : JSON.stringify(w))).slice(0, 80);
function amt(a) { return Array.isArray(a) ? Number(a[1]) : Number(a); }


const idOf = (w) => (Array.isArray(w) ? w[1] : w);
// The receiver's own report with a received line for this amount and settlement.
function confirmed(reports, to, value, settlement) {
  const rid = idOf(to);
  const r = reports.find((x) => x.signer === rid && x.lines.some((l) => l[0] === 0 && l[2] === settlement && amt(l[1]) === value));
  return r ? r.id : null;
}
// A passed-on line, by the same signer, that closes line i of report r for the same amount and receiver.
function closing(reports, r, i) {
  const owed = r.lines[i];
  for (const x of reports) {
    if (x.signer !== r.signer) continue;
    for (const l of x.lines) {
      if (l[0] === 1 && Array.isArray(l[4]) && l[4][0] === r.id && Number(l[4][1]) === i && amt(l[1]) === amt(owed[1]) && idOf(l[2]) === idOf(owed[2])) return { report: x, line: l };
    }
  }
  return null;
}

function follow(reports, settlement, depth = 0, seen = new Set()) {
  const pad = '  '.repeat(depth);
  const here = reports.filter((r) => r.lines.some((l) => l[0] === 0 && l[2] === settlement));
  if (!here.length) { console.log(`${pad}· no report held names ${settlement.slice(0, 16)}… as received: the flow is not shown past here (one leg, or no path you may read)`); return; }
  for (const r of here) {
    if (seen.has(r.id)) continue; seen.add(r.id);
    const got = r.lines.filter((l) => l[0] === 0 && l[2] === settlement).reduce((s, l) => s + amt(l[1]), 0);
    console.log(`${pad}${r.signer.slice(0, 12)}… received ${sats(got)} (report ${r.id.slice(0, 12)}…)`);
    r.lines.forEach((l, i) => {
      if (l[0] === 0) return;
      const to = l[2] && l[0] !== 2 && l[0] !== 3 ? ' to ' + who(l[2]) : '';
      // 0.1.2: say whose word each line rests on.
      if (l[0] === 1) {
        const ok = l[3] && confirmed(reports, l[2], amt(l[1]), l[3]);
        console.log(`${pad}  passed on: ${sats(amt(l[1]))}${to}: ${ok ? 'CONFIRMED by the receiver\'s own report ' + ok.slice(0, 12) + '…' : 'by the payer\'s word only (no received line from the receiver held)'}`);
        if (l[3]) follow(reports, l[3], depth + 2, seen);
        return;
      }
      if (l[0] === 4) {
        // A later report by the same signer may close this line: [1, amount, to, by, [this report, this line]].
        const c = closing(reports, r, i);
        if (c) {
          const ok = confirmed(reports, c.line[2], amt(c.line[1]), c.line[3]);
          console.log(`${pad}  still owed: ${sats(amt(l[1]))}${to}: PAID LATER by report ${c.report.id.slice(0, 12)}… (payment ${String(c.line[3]).slice(0, 12)}…), ${ok ? 'confirmed by the receiver' : 'by the payer\'s word only'}`);
        } else console.log(`${pad}  still owed: ${sats(amt(l[1]))}${to}: NOT PAID in any report held`);
        return;
      }
      console.log(`${pad}  ${KIND[l[0]] || 'line ' + l[0]}: ${sats(amt(l[1]))}${to}${l[0] === 2 ? ' (the payer\'s own word)' : ''}`);
    });
  }
}


// --- 0.2.0: before you pay --------------------------------------------------------------
// Newcomers were scammed on day four: an impostor posting "my key was compromised, this is my new identity";
// services sold for sats in advance with no Terms; "help desks" asking for key files; two people with one name.
// `check ACT` reads one act that asks you to pay or trust, and says plainly what it does and does not prove.
const TERMS_SPEC = 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c';
async function getAct(id) {
  for (const relay of ['turnstile-home', 'longhouse-home-1', 'longhouse-home-2', 'stall-home']) {
    const { letter } = kit(['letter', '--to', relay, '--get', `/acts/${id}`]);
    if (!letter) continue;
    const a = await answer(letter, 25);
    if (a && a.status === 200) { try { return plain(mor.describeAct(readFileSync(join(HERE, 'in', `${letter}.answer.body`)))); } catch {} }
  }
  return null;
}
// The text rules, one place for 'check' and 'inbox'. DubWeb's shared warnings file (agreed, act 447709a8…) will
// replace these; until it exists Damgar keeps its own, and they match before-pay.ts in build/.
const RX = {
  newId: /(new|my) (identity|key)|key (was |is )?(compromised|stolen|lost)|lost my key|compromis|nouvelle identit|nouvelle cl|nuova identit|neue identit|kompromittiert|nueva identidad|comprometid|n'utilisez plus|non usate più|ancienne identit/i,
  keys: /key ?s? ?file|keys\.json|signing words|signing key|your (signing |chain |recovery )?words|seed|secret words|chain words|recovery words|words of your chain|keys\/|private key|send (me|us) your (key|words|identity file)|dossier de cl|fichier de cl|mots de signature|mots de (la )?cha[iî]ne|mots de r[ée]cup|file delle chiavi|parole (della catena|di recupero)|schl[üu]sseldatei|wiederherstellungsw|palabras de (recuperaci|la cadena)/i,
  recovery: /recover(y|ing)? (of )?(your |the )?(funds|money|sats|payment|identit|key|account)|we recover|recovery (fee|service|desk)|key recovery|r[ée]cup[ée]r(er|ation)? (vos|votre|les|des)? ?(fonds|sats|argent|cl|identit)|frais de r[ée]cup|recuper(o|are) (i |il |la )?(fondi|sats|soldi|chiav|identit)|wiederherstell|recuperaci[oó]n/i,
  advance: /done for you|beta seat|guaranteed|negotiat(e|ion) (of )?your debt|debt negotiation|limited seats|pay first|in advance|up ?front|d'avance|en avance|in anticipo|im voraus|por adelantado/i,
  vouch: /\bvouch|i can confirm|i confirm (they|he|she|it)|\blegit\b|trustworthy|volunteer|b[ée]n[ée]vole|volontari[oa]|freiwillig|voluntari[oa]|je (le |la )?confirme|je garantis|garantisco|ich b[üu]rge/i,
};
function scan(text, { sealed = false } = {}) {
  const w = [];
  if (RX.newId.test(text)) w.push('A CHANGE OF KEY IS NEVER ANNOUNCED FROM ANOTHER IDENTITY. A real change is a rotation inside the same identity\'s own chain, signed by its old key. A post from a new identity claiming to be someone proves only that the new identity wrote it. Ask the person in their old identity, in public.');
  if (RX.keys.test(text)) w.push('IT TALKS ABOUT KEYS, WORDS OR KEY FILES. No one on MOR ever needs your key, your chain words, your signing words or your keys file: not a desk, not a helper, not the hosts. Never send them.');
  if (RX.recovery.test(text)) w.push('A RECOVERY FOR A FEE. Nobody can recover a Lightning payment: it is final. Nobody can recover a key for you: only a rotation you prepared, in your own chain, can. A "recovery" you pay for is a second loss.');
  if (RX.advance.test(text)) w.push('A SERVICE SOLD IN ADVANCE. Check for Terms first; pay nothing in advance without them.');
  if (RX.vouch.test(text)) w.push('A VOUCH IS ONE IDENTITY\'S WORD. A friendly helper or "volunteer" vouching for a desk proves only that the helper wrote it, and both can be one person. Go by Terms you can read, in public.');
  if (sealed && RX.keys.test(text)) w.push('IT ASKED YOU IN PRIVATE ABOUT KEYS. Real help on MOR is given in public, where others can check it. Answer in public, or not at all.');
  else if (sealed && /lnbcrt|lnbc|\bpay\b|payer|pagare|zahlen/i.test(text)) w.push('MONEY, IN PRIVATE. Pay only a signer you already know, under Terms you hold; a stranger asking in private is the mark of a scam.');
  return w;
}
async function check(id) {
  const d = await getAct(id);
  if (!d) { console.log('NOT FOUND on either home: an act you cannot fetch proves nothing.'); return { found: false, warn: ['NOT FOUND'], noTerms: true }; }
  let text = ''; try { text = Buffer.from(d.payload || '', 'hex').toString('utf8'); } catch {}
  const short = (x) => `${x.slice(0, 8)}…${x.slice(-4)}`;
  console.log(`Signed by ${short(d.signer)} (the identity that signed it; a name in the text proves nothing).`);
  const warn = [];
  if (/lnbcrt|invoice|pay|sats/i.test(text)) {
    const ids = [...new Set(text.match(/\b[0-9a-f]{64}\b/g) || [])].filter((x) => x !== d.signer).slice(0, 8);
    let terms = 0;
    for (const x of ids) { const t = await getAct(x); if (t && t.spec === TERMS_SPEC && t.type === 0) { terms++; console.log(`  names Terms ${short(x)}, signed by ${short(t.signer)}${t.signer === d.signer ? ' (the same identity)' : ''}`); } }
    if (!terms) warn.push('NO TERMS. It asks for money but names no Terms you can read and assent to. Nothing binds the seller to deliver or refund. On MOR, a payment worth making names its Terms; pay nothing in advance without them.');
  }
  warn.push(...scan(text));
  // name collisions: the first words before a comma, compared with other signers' posts on the feed held
  const name = (text.match(/^[\s\S]{0,4}?([A-Z][\p{L}'-]+(?: [A-Z][\p{L}'-]+)?)[,.]/u) || [])[1];
  if (name) {
    const letters = readdirSync(join(HERE, 'in')).filter((f) => f.endsWith('.answer.body')).map((f) => f.replace('.answer.body', ''));
    const others = new Set();
    for (const n of letters.slice(-400)) { let b; try { b = readFileSync(join(HERE, 'in', `${n}.answer.body`)); } catch { continue; }
      let items = []; try { const p = mor.cborDecode(b); items = p && p.get ? (p.get(0) || []) : []; } catch { continue; }
      for (const it of items) { try { const a = plain(mor.describeAct(it[2] instanceof Uint8Array ? it[2] : unhex(it[2]))); const t = Buffer.from(a.payload || '', 'hex').toString('utf8'); if (a.signer !== d.signer && t.slice(0, 80).includes(name)) others.add(a.signer); } catch {} } }
    if (others.size) warn.push(`SAME NAME, ANOTHER IDENTITY. ${others.size} other identit${others.size > 1 ? 'ies' : 'y'} on the feeds you hold also write as "${name}": ${[...others].map(short).join(', ')}. A name is not an identity; go by the signer.`);
  }
  if (!warn.length) console.log('Nothing here matches a known scam. That is not proof of good faith: read its Terms.');
  for (const w of warn) console.log('\n! ' + w);
  return { found: true, warn, noTerms: warn.some((w) => w.startsWith('NO TERMS')) };
}

// --- commands -------------------------------------------------------------------------
const [cmd, ...a] = process.argv.slice(2);
const flag = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
switch (cmd) {
  case 'balance': await bank(['balance', a[0]], 'Balance'); break;
  case 'invoice': {
    if (!/^[1-9]\d*$/.test(a[1] || '')) { console.log('Not sent: an invoice needs an amount in whole sats (node damgar.mjs invoice NAME SATS). The round\'s bank makes no invoice without one.'); break; }
    const args = ['invoice', a[0], '--amount', a[1]]; if (flag('--memo')) args.push('--memo', flag('--memo'));
    const r = await bank(args, 'Invoice');
    if (r) { try { const t = readFileSync(join(HERE, 'in', `${r.letter}.answer.body`), 'utf8'); const m = t.match(/lnbcrt[0-9a-z]+/); if (m) console.log('Invoice (give this to the payer):\n' + m[0]); } catch {} }
    break; }
  case 'pay': {
    const args = ['pay', a[0], '--invoice', a[1]]; if (flag('--fee')) args.push('--fee', flag('--fee')); if (flag('--amount')) args.push('--amount', flag('--amount'));
    // 0.2.1 (The Back Row, act ad744f18…): 'pay' checks first. Name the act the invoice came from with --from ACT.
    const from = flag('--from');
    if (!from) {
      if (!a.includes('--unchecked')) { console.log('Not paid. Damgar checks before it pays: add --from ACT, the act the invoice came from (a post, a Terms, a message).\nOnly if you already know and trust the payee, add --unchecked instead.'); break; }
      console.log('Paying UNCHECKED, at your word: no act was read.');
    } else {
      console.log(`Checking ${from.slice(0, 8)}… before paying:`);
      const r = await check(from);
      if (r.noTerms && !a.includes('--no-terms')) { console.log('\nNot paid: the act names no Terms you can read. Nothing binds the payee to deliver or refund. If this is a gift or a payment you owe anyway, add --no-terms.'); break; }
      if (r.warn.some((w) => !w.startsWith('NO TERMS')) && !a.includes('--yes')) { console.log('\nNot paid: read the warnings above. If you still want to pay, run the same command again with --yes.'); break; }
    }
    console.log('You are about to pay this invoice from ' + a[0] + '. A Lightning payment is final.');
    await bank(args, 'Payment'); break; }
  case 'inbox': {
    // 0.2.2: sealed messages to you, read with the same warnings. Scammers moved to private messages.
    const id = (kit(['identity', 'show', a[0]]).out.match(/"identity": "([0-9a-f]{64})"/) || [])[1];
    if (!id) { console.log('No identity named ' + a[0] + ' in keys/.'); break; }
    let n = 0;
    for (const relay of ['turnstile-home', 'longhouse-home-1']) {
      const { letter } = kit(['letter', '--to', relay, '--get', `/feed?to=${id}`]);
      if (!letter || !(await answer(letter, 60))) { console.log(`${relay}: no answer yet.`); continue; }
      let acts = []; try { acts = JSON.parse(spawnSync(process.execPath, [KIT, 'open', a[0], '--letter', letter], { cwd: HERE, encoding: 'utf8' }).stdout); } catch { continue; }
      for (const x of acts) { const d = x.described || {}; let t = ''; try { t = Buffer.from(d.payload || '', 'hex').subarray(4).toString('utf8'); } catch {}
        n++; const short = (v) => v ? `${v.slice(0, 8)}…${v.slice(-4)}` : '?';
        console.log(`\nSealed to you, signed by ${short(d.signer)} (${relay}, act ${short(x.act)}):\n  ${t.replace(/[\x00-\x08]/g, '').slice(0, 240)}`);
        const w = scan(t, { sealed: true }); if (!w.length) console.log('  Nothing here matches a known scam. That is not proof of good faith.');
        for (const m of w) console.log('  ! ' + m); }
    }
    if (!n) console.log('No sealed messages to you on your homes.');
    break; }
  case 'fetch': {
    const relay = a[0]; const after = flag('--after') || '0'; const to = flag('--to');
    const path = to ? `/feed?to=${to}` : `/feed?after=${after}`;
    const { letter, out } = kit(['letter', '--to', relay, '--get', path]);
    console.log(letter ? `Feed asked of ${relay} (${letter}). After the next pass: node damgar.mjs flow SETTLEMENT --from ${letter}` : out.trim()); break; }
  case 'flow': {
    const settlement = a[0]; const froms = []; for (let i = 0; i < a.length; i++) if (a[i] === '--from') froms.push(a[i + 1]);
    const letters = froms.length ? froms : readdirSync(join(HERE, 'in')).filter((f) => f.endsWith('.answer.body')).map((f) => f.replace('.answer.body', ''));
    const reps = reportsFrom(letters);
    console.log(`Following ${settlement.slice(0, 16)}… through ${reps.length} leg report(s) held. Each line is its signer's word (G8); a passed-on line is followed where the receiver's own report names the same settlement.`);
    console.log('Signatures: UNCHECKED by Damgar. To check them: node kit/mor.mjs agreements check acts/ID.mor');
    follow(reps, settlement);
    // Straight split draft 6: the full report names SHA-256(settlement || preimage) in line 0, never the settlement.
    const pre = flag('--preimage');
    if (pre && /^[0-9a-f]{64}$/.test(pre) && /^[0-9a-f]{64}$/.test(settlement)) {
      const { createHash } = await import('node:crypto');
      const c = createHash('sha256').update(Buffer.concat([Buffer.from(settlement, 'hex'), Buffer.from(pre, 'hex')])).digest('hex');
      console.log(`\nYour commitment (draft 6): ${c.slice(0, 16)}…. Full reports that count your payment:`);
      follow(reps, c);
    } else if (!pre) console.log('\nFull reports under straight split draft 6 name a commitment, not your settlement. Add --preimage YOUR_PREIMAGE to find them (only you and the receiver hold it). Without it: unchecked.');
    break; }
  case 'check': await check(a[0]); break;
  case 'reports': {
    const letters = readdirSync(join(HERE, 'in')).filter((f) => f.endsWith('.answer.body')).map((f) => f.replace('.answer.body', ''));
    for (const r of reportsFrom(letters)) { console.log(`${r.id}  by ${r.signer.slice(0, 12)}…`); for (const l of r.lines) console.log(`   ${KIND[l[0]] || l[0]}: ${sats(amt(l[1]))}${typeof l[2] === 'string' ? ' ' + l[2].slice(0, 16) + '…' : ''}`); }
    break; }
  default:
    console.log(`Damgar 0.2.2, the money hub (DubPay, the Dubsar Suite). Tray app: runs your own kit, holds no key.
  node damgar.mjs balance NAME                         your account
  node damgar.mjs invoice NAME SATS [--memo TEXT]      an invoice for someone to pay you
  node damgar.mjs pay NAME BOLT11 --from ACT [--fee SATS]   check the act the invoice came from, then pay (final).
                                                       Refuses with NO TERMS (unless --no-terms) or other warnings (unless --yes).
                                                       --unchecked instead of --from: pay without a check, at your word
  node damgar.mjs fetch RELAY [--after N | --to ID]    ask a relay for its feed (leg reports live there)
  node damgar.mjs inbox NAME                           sealed messages to you, with the same warnings as check
  node damgar.mjs check ACT                            before you pay or trust: does it name Terms? another identity with the same name? asks for keys?
  node damgar.mjs flow SETTLEMENT [--preimage P]       follow a payment; with the preimage, find draft-6 full reports by commitment
  node damgar.mjs reports                              every leg report in your in/ answers
  node damgar.mjs flow SETTLEMENT [--from LETTER ...]  follow one payment to everyone it reached`);
}
