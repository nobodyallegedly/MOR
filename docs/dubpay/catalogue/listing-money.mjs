// DubPay W2-B: every cMIP and Module in Money's area, listed by code.
//
// One command, from anywhere:   node docs/dubpay/catalogue/listing-money.mjs
// Reads (never writes) ~/Documents/mor-round-2/_research/ (feeds, windows' acts and reports, the
// postman's log, the hosts' notices) and uses the round's kit (_team/dubpay/wave-2/kit/) to decode
// and check acts. Writes listing-money.json and listing-money.md beside this file.
// MOR_ROUND=/path/to/mor-round-2 reads another copy. Needs Node 22.5+ (node:sqlite).
//
// What is hand-made here, and only here: the CATALOGUE below (which texts belong to Money's five
// categories, their grouping into drafts, the names to look for in the reports) and the list of
// acts for the MOR lead's section. Every count, date, window, identity and verdict is computed.

import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from './listing-money-data.mjs';
const { acts, texts, namedBy, shortIn, reports, mediaPosts, termsBody, windowOfSigner, mor, hex, plain, AG, REPORT, R, read } = D;
const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------------------------
// The catalogue (hand-made). Ids are prefixes, resolved below; an unresolved prefix stops the run.
// kind: text (a text act holding a cMIP or template), terms (Terms acts, their words resolved),
// media (an app posted as media: its SHA-256, and the text act announcing it), script (code
// published as a text act), kitspec (a spec of the kit itself).
// ---------------------------------------------------------------------------------------------
const CAT = {
  1: 'Splits and payout services',
  2: 'Pools and mutual credit',
  3: 'Money held (escrow, deposits, refunds, held for you)',
  4: 'Asking to be paid (invoices, payment requests, answerers that invoice)',
  5: 'Loans and returns',
};
const CATALOGUE = [
  // 1. splits and payout services
  { key: 'straight-split', name: 'The straight split', cat: 1, kind: 'text', aliases: ['straight split', 'straight-split', "DubPay's split"],
    drafts: [['1', 'b10d576b'], ['2', '23b67a3a'], ['3', '31579733'], ['4', '0ece915a'], ['5', '2e295742'], ['6', '7e0ac8f1'], ['7 (first publication, titled "draft 6")', '333bdbc7'], ['7 (republished, title corrected)', 'b9e43db4']],
    note: 'Draft 7 was published twice: act 333bdbc7 carries the title "draft 6" (DubPay, act 481c96c6), and b9e43db4 is the same text with the title corrected (DubPay, act b8c47ad1). Section 6 parameters: DubPay\'s shape is act 393f664c; Léa\'s text-key deal is Terms 795859ee.' },
  { key: 'deal-parameters', name: "DubPay's shape for a deal's parameters (section 6)", cat: 1, kind: 'text', aliases: ['393f664c', 'text keys', 'text-key'],
    drafts: [['answer to the seam acts', '393f664c']], idNamed: true,
    note: 'Not a cMIP: a text act read as a rule. The hosts\' second rerun ruling calls it "one way to write them, not the only one". Léa\'s deal 795859ee wrote the same parameters as text keys.' },
  { key: 'hop-split', name: "Hop's split (round two)", cat: 1, kind: 'text', aliases: ["Hop's split", 'Hop split', 'split cMIP'],
    drafts: [['1', 'f94aa721'], ['2', 'f8fd362d'], ['3', '2185922e'], ['4', '83b71841'], ['5', '86011ca3']],
    note: 'Hop names a draft 6 (clock field, where a deal\'s parameters live) in act 8df3e122; no draft 6 text act is held.' },
  { key: 'stall-split', name: "Stall's pass-on and Stall split", cat: 1, kind: 'text', aliases: ['Stall split', "Stall's pass-on", 'pass-on by the receiver'],
    drafts: [['1 (pass-on by the receiver)', '12927103'], ['2', '79832852']] },
  { key: 'client-spot', name: 'The client that served the payment (a spot)', cat: 1, kind: 'text', aliases: ['client that served the payment', 'client spot', "Pointer's spot", 'client-role'],
    drafts: [['2', 'ae1a22e7'], ['3', 'a0108c37']], note: 'Draft 1 is named by draft 2 but no text act of it is held in the data read.' },
  { key: 'report-block', name: 'The payment report (the report block, proposal 4)', cat: 1, also: [4], kind: 'kitspec', aliases: ['report block', 'leg report', 'payment report'],
    spec: REPORT, note: 'A proposal carried in the kit, not a players\' text: its acts are made under its spec hash. Its lines say what was received, passed on, kept and still owed.' },
  { key: 'damgar', name: 'Damgar (DubPay\'s money hub, a tray app)', cat: 1, kind: 'media', aliases: ['Damgar'],
    drafts: [['0.1.0', '2e9de3d4'], ['0.1.1', '25303428'], ['0.1.2', 'abbe0d2d'], ['0.1.3', '234b0e72'], ['0.2.0', '393fbe78'], ['0.2.1', 'd08095fb'], ['0.2.2', '6e036543']] },
  // 2. pools and mutual credit
  { key: 'common-pot', name: "DubPay's common pot", cat: 2, kind: 'text', aliases: ['common pot', "DubPay's pot", 'the pot'],
    drafts: [['1', 'bba5c058'], ['2', '73bece9f']] },
  { key: 'pot-reader', name: "DubPay's pot reader (build/pot/pot.mjs)", cat: 2, kind: 'media', aliases: ['pot.mjs', 'pot reader'],
    drafts: [['first media', '1b912901'], ['second media (checks Hop\'s clearings)', '9b4661a6'], ['third media (draft 2 of the pot)', '94514e4f']] },
  { key: 'pot-settlement', name: "Hop's settlement suggestion for the common pot", cat: 2, kind: 'script', aliases: ['settlement suggestion'], drafts: [['0', '2525e63d']] },
  { key: 'rotating-pot', name: "The clusters' rotating pot", cat: 2, kind: 'text', aliases: ['rotating pot', 'chama', 'Umoja'], drafts: [['1', 'd2aa5dec']] },
  { key: 'spare-wheel', name: 'Spare Wheel (a hardship fund)', cat: 2, kind: 'terms', aliases: ['Spare Wheel', 'hardship fund'],
    drafts: [['version 1 (body: plain words)', 'db8de376'], ['version 2 (body: common pot, draft 1)', '73db2ea4']] },
  { key: 'hop-tab', name: "Hop's tab (clearing a group's debts)", cat: 2, also: [5], kind: 'text', aliases: ["Hop's tab", 'the tab', "round's tab"],
    drafts: [['1', '3ce77ad5'], ['2', 'da0d4fa0']] },
  { key: 'rounds-tab', name: "The round's tab (Hop, clerk)", cat: 2, kind: 'terms', aliases: ["round's tab"], drafts: [['version 1', 'c4700b24'], ['version 2', '370a189c']] },
  { key: 'money-decision', name: "Plain Words' money decision (a Statement kind)", cat: 2, also: [3], kind: 'text', aliases: ['money decision'],
    drafts: [['1', '759b8d58'], ['2', 'e7bba1fa'], ['3', '14e01443'], ['4', 'ed56f60c'], ['5', 'f2970dcc']] },
  { key: 'open-books', name: "DubWeb's open books", cat: 2, also: [3], kind: 'text', aliases: ['open books'], drafts: [['1', '17be23b6'], ['2', 'ae14b26f']] },
  { key: 'hours-of-care', name: 'Hours of care (a Statement kind, for circles that swap time)', cat: 2, kind: 'text', aliases: ['hours of care'], drafts: [['1', '6b0cc411']] },
  { key: 'cercle-de-garde', name: 'Le Cercle de garde (a babysitting circle)', cat: 2, kind: 'terms', aliases: ['Cercle de garde', 'Cercle'], drafts: [['version 1', 'ce52dfc4'], ['version 2', 'caede5b5']] },
  { key: 'cercle-count', name: 'cercle-count.mjs (the Cercle\'s counting script)', cat: 2, kind: 'media', aliases: ['cercle-count'], drafts: [['1', '053e962e'], ['2', '117f7d47']] },
  { key: 'krog-varstva', name: 'Krog varstva (a copy of the Cercle, Ljubljana)', cat: 2, kind: 'terms', aliases: ['Krog varstva'], drafts: [['version 1', '4b4642ea'], ['version 2', 'b059f5d1']] },
  { key: 'mending-circle', name: 'The Mending Circle (a repair circle)', cat: 2, also: [5], kind: 'terms', aliases: ['Mending Circle'], drafts: [['version 1', 'bb2cd2b9'], ['version 2', '6f650063'], ['version 3', '6b2736be']] },
  { key: 'mending-count', name: 'mending.mjs (counts the Mending Circle)', cat: 2, kind: 'script', aliases: ['mending.mjs'], drafts: [['0', '046b26cd']] },
  // 3. money held
  { key: 'escrow', name: "Until's escrow", cat: 3, kind: 'text', aliases: ['escrow', "Until's escrow"],
    drafts: [['1', '9ae61048'], ['2', 'a2d41910'], ['3', 'caf80755'], ['4', 'ef17be4f'], ['5', 'ca9d95cd']], idNamed: true,
    note: 'Until\'s own Terms name drafts 3 and 4 by act id in their body, not by spec hash.' },
  { key: 'home-bond', name: "Until's home bond", cat: 3, kind: 'text', aliases: ['home bond'], drafts: [['1', '9cbdffb3']] },
  { key: 'room-let', name: "Plain Words' room let (rent, deposit, the state of the room)", cat: 3, also: [4], kind: 'text', aliases: ['room let', 'room-let', 'room deposit'],
    drafts: [['1', '526f4947'], ['2', '943e2ad4'], ['3', '9f1911e7']], idNamed: true, note: 'A template, not a cMIP: no act names it by spec hash; period payment names it by act id.' },
  { key: 'held-for-you', name: "Stall's held for you", cat: 3, kind: 'text', aliases: ['held for you'], drafts: [['1', 'ad3b8e7f'], ['2', 'ecf9afc4']] },
  { key: 'held-reader', name: "held.mjs (Stall's reader for held for you)", cat: 3, kind: 'media', aliases: ['held.mjs'], drafts: [['0.1', '381f2c97']] },
  { key: 'kept-word', name: 'Kept Word (deliver or refund, a guild charter)', cat: 3, kind: 'terms', aliases: ['Kept Word'], drafts: [['charter, version 1', '825b834d']] },
  // 4. asking to be paid
  { key: 'answerer', name: "Hop's answerer (it writes the invoice for you)", cat: 4, kind: 'script', aliases: ["Hop's answerer", 'answerer'], drafts: [['0.1', '46aaf149']] },
  { key: 'invoice-request', name: 'Invoice request form (piece A of Commission 1)', cat: 4, kind: 'text', aliases: ['invoice request form', 'invoice request'], drafts: [['1', '72bbce87'], ['2', 'beb3fdad']], idNamed: true },
  { key: 'commission-1', name: "Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer)", cat: 4, kind: 'terms', aliases: ['Commission 1'], drafts: [['version 1', 'bfac25d4'], ['version 1, again', '51c0ec8b']] },
  { key: 'period-payment', name: "Plain Words' period payment (a Statement kind)", cat: 4, kind: 'text', aliases: ['period payment'], drafts: [['1', '15d03f0c']] },
  { key: 'proven-claim', name: 'Proven claim (a register of debts)', cat: 4, also: [3], kind: 'text', aliases: ['Proven claim', 'register of debts'], drafts: [['1', 'd6647391'], ['2', 'de67b513']] },
  { key: 'register', name: 'register.mjs (reads Proven claims)', cat: 4, kind: 'media', aliases: ['register.mjs', 'Register 0.'], drafts: [['0.3', 'dffe90fb'], ['0.4', '0372e86b'], ['0.6', '2992758f']] },
  // 5. loans and returns
  { key: 'lending-shelf', name: "Steward & Co.'s lending shelf", cat: 5, kind: 'text', aliases: ['lending shelf', 'the shelf', 'ladder'], drafts: [['1', 'e5d774d2'], ['2', '8ff8ac74']] },
  { key: 'shelf-app', name: 'shelf.mjs (the lending shelf\'s tray app)', cat: 5, kind: 'media', aliases: ['shelf.mjs', 'shelf 0.1'], drafts: [['0.1.0', '342921d6']] },
];
// Beside Money's area: texts that touch money but whose main task is elsewhere (pointers only, not counted as Money's).
const BESIDE = [
  ['bf4e89e4', 'spec', 'Shower work (DubLaw): owners, parts and remainder of a work\'s sale; its main task is the work\'s body.'],
  ['c3f6b350', 'spec', 'Shares nobody may rewrite (Plain Words): an update condition protecting holders\' shares.'],
  ['ec1f118d', 'spec', 'Delivery receipt (Kept Word): judges a delivery; refunds hang on it.'],
  ['ebcc09e3', 'spec', 'An arbiter\'s award (DubLaw): decides a dispute, may release a held sum.'],
  ['07f89135', 'spec', 'Custody receipt (Turnstile): handover of records, not of money.'],
  ['1b2f1ea2', 'media', "'Buy' 0.1 (a buyer's tray app): checks Terms, then pays."],
  ['9b6c2f60', 'media', 'Courier 0.1 (a seller\'s tray app): delivers to buyers who paid.'],
];
// For the MOR lead: acts where a player says the language could not say something in Money's area (hand-picked, quoted by the script).
const LEAD = [
  ['e5d774d2', 'could not say', 'A loan of a thing'],
  ['8ff8ac74', 'still cannot say', 'A loan of a thing, after draft 2'],
  ['bda47cc4', "can't say", "A debt still owed, in open books"],
  ['17be23b6', 'could not say', 'Balances, sums withheld, completeness'],
  ['44b07c7f', 'cannot say', 'A rotating pot member who stops paying'],
  ['9cbdffb3', 'cannot say', 'A home bond: absence, a receipt not given, the bank\'s word'],
  ['fd1cb2ab', 'could not say', 'A partial award from a held sum'],
  ['726e8c43', 'cannot say', 'That something happened in the world (a Proven claim)'],
  ['ede89994', 'cannot say', "A deal's fee, written as text keys"],
  ['d7b32ddf', 'has no rule', 'When a role filling is final, so a payout made on it can be shown wrong'],
  ['ae14b26f', 'cannot pay an identity', 'Paying an identity rather than an invoice'],
];

// ---------------------------------------------------------------------------------------------
const red = (s) => String(s ?? '')
  .replace(/https?:\/\/\S+/g, '<address>')
  .replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?\b/g, '<address>')
  .replace(/\blocalhost:\d+\b/g, '<address>')
  .replace(/\bport\s+\d{2,5}\b/gi, 'port <n>');
const short = (h) => (h ? h.slice(0, 8) : null);
const byPrefix = (p, pool) => { const m = [...pool].filter((k) => k.startsWith(p)); if (m.length !== 1) throw new Error(`prefix ${p}: ${m.length} matches`); return m[0]; };
const actIds = [...acts.keys()];
const mediaIds = [...mediaPosts.keys()];
const dayName = (d) => (d == null ? 'unknown' : d === 4.5 ? '19 Nov' : `day ${d}`);
const AGSPECS = new Set([AG, REPORT]);

// Uses of a set of names: acts naming any of them, by slot.
function usesOf(names, { idSlotsOnly = null, exclude = new Set() } = {}) {
  const out = new Map(); // actId -> Set(form)
  for (const [form, h, slots] of names) {
    for (const [id, sl] of namedBy.get(h) ?? []) {
      if (exclude.has(id)) continue;
      if (slots && ![...sl].some((s) => slots.includes(s))) continue;
      let s = out.get(id); if (!s) out.set(id, (s = new Set())); s.add(form);
    }
  }
  return out;
}
function stats(map) {
  const ids = [...map.keys()];
  const signers = new Set(), windows = new Set(), days = new Set(); let noLog = 0;
  const kinds = {};
  for (const id of ids) {
    const a = acts.get(id);
    signers.add(a.d.signer);
    if (a.tray) windows.add(a.tray); else { noLog++; for (const w of a.kept) windows.add(w); }
    days.add(dayName(a.day));
    const k = a.d.spec === AG ? (a.d.type === 0 ? 'Terms' : 'Statement') : a.d.spec === REPORT ? 'report' : a.text ? 'text' : `other (${short(a.d.spec)}/${a.d.type})`;
    kinds[k] = (kinds[k] || 0) + 1;
  }
  return { acts: ids.length, identities: signers.size, windows: [...windows].sort(), windowCount: windows.size, days: [...days].sort(), kinds, actsWithoutCarryRecord: noLog, actIds: ids.sort() };
}
// The agreement an act belongs to, as far as naming shows: everything Agreements-shaped linked to it.
function closure(startId) {
  const seen = new Set([startId]); const q = [startId];
  while (q.length && seen.size < 400) {
    const id = q.shift();
    const a = acts.get(id);
    const nbrs = new Set();
    for (const [nid] of namedBy.get(id) ?? []) nbrs.add(nid);
    try { (function w(x) { if (x instanceof Uint8Array && x.length === 32) nbrs.add(hex(x)); else if (Array.isArray(x)) x.forEach(w); else if (x instanceof Map) for (const [k, v] of x) { w(k); w(v); } })(mor.cborDecode(a.d.payload)); } catch {}
    for (const n of nbrs) { const b = acts.get(n); if (b && b.d.public && AGSPECS.has(b.d.spec) && !seen.has(n)) { seen.add(n); q.push(n); } }
  }
  return [...seen];
}
function kitVerdict(termsIds, ownSpecs) {
  const out = [];
  for (const tid of termsIds.slice(0, 3)) {
    const held = closure(tid).map((id) => ({ bytes: acts.get(id).bytes }));
    const one = {};
    one.terms = tid; one.held = held.length;
    try { one.check = plain(mor.agreementsNewCheck(acts.get(tid).bytes)).verdict; } catch (e) { one.check = 'error: ' + e.message; }
    for (const ask of ['in_force', 'whole']) {
      try { const r = JSON.parse(mor.agreementsNewAsk({ acts: held, ask, args: [tid] }))[0]; one[ask] = { word: r.word, rule: r.rule, says: red(r.says) }; }
      catch (e) { one[ask] = { word: 'error', says: red(e.message) }; }
    }
    one.namesThisCmip = ownSpecs.some((s) => s && [one.in_force?.says, one.whole?.says].some((x) => x?.includes(s.slice(0, 12))));
    out.push(one);
  }
  return out;
}
// Task in its own words: the first paragraph under "In plain words" / "What it does", else the first body paragraph.
function taskQuote(text) {
  const t = text.replace(/\r/g, '');
  const m = t.match(/##\s*(In plain words|What it does|What this is|Plain words)[^\n]*\n+([^\n#][^\n]*)/i);
  let q = m ? m[2] : (t.split(/\n\s*\n/).slice(1).find((p) => p.trim() && !/^\*|^#|^-/.test(p.trim())) ?? t.split('\n')[0]);
  q = q.replace(/\s+/g, ' ').trim();
  return red(q.length > 300 ? q.slice(0, 297).replace(/\s\S*$/, '') + '…' : q);
}
const FAULT = /\b(finding|findings|fault|faults|flaw|bug|hole|holes|wrong|broken|fails|gap|attacked|attack|serious|minor|not a finding)\b/i;

// ---------------------------------------------------------------------------------------------
const records = [];   // one per draft
const entries = [];   // one per text (entry)
for (const e of CATALOGUE) {
  const drafts = [];
  if (e.kind === 'kitspec') {
    const u = usesOf([['spec', e.spec, null]]);
    drafts.push({ draft: 'proposal 4', spec: e.spec, uses: u });
  }
  for (const [label, p] of e.drafts ?? []) {
    if (e.kind === 'media') {
      const sha = byPrefix(p, mediaIds); const m = mediaPosts.get(sha);
      const u = usesOf([['media sha256', sha, null]]);
      const ann = [...u.keys()].map((id) => acts.get(id)).filter((a) => a.text).sort((a, b) => (a.time ?? 'z') < (b.time ?? 'z') ? -1 : 1)[0];
      drafts.push({ draft: label, media: sha, bytes: m.bytes, postedBy: m.tray, postedAt: m.time, day: dayName(D.dayOf(m.time).day), announced: ann?.d.id ?? null, author: ann?.d.signer ?? null, uses: u, text: ann?.text });
      continue;
    }
    const id = byPrefix(p, actIds); const a = acts.get(id);
    if (e.kind === 'terms') {
      const pl = mor.cborDecode(a.d.payload);
      const words = hex(pl.get(4)[0]); const body = termsBody.get(id);
      const wt = [...texts.values()].find((t) => t.work === words || t.sha256 === words);
      const bodyT = [...texts.values()].find((t) => t.spec === body || t.id === body || t.sha256 === body);
      const u = usesOf([['act id', id, null]], { exclude: new Set([id]) });
      drafts.push({ draft: label, act: id, author: a.d.signer, day: dayName(a.day), window: a.tray, words, wordsText: wt?.id ?? null, body, bodyText: bodyT ? `${bodyT.title.slice(0, 80)} (act ${short(bodyT.id)})` : null, uses: u, text: wt?.act.text ?? null });
      continue;
    }
    const t = texts.get(id);
    if (!t) throw new Error(`${p} is not a text act`);
    const names = [['spec', t.spec, null], ['sha256', t.sha256, null], ['work', t.work, null], ['act id', id, e.idNamed ? null : ['body', 'spec']]];
    const u = usesOf(names, { exclude: new Set([id]) });
    const cited = usesOf([['act id', id, ['refs', 'payload']]], { exclude: new Set([id, ...u.keys()]) });
    const shortM = new Set([...(shortIn.get(short(t.spec)) ?? []), ...(shortIn.get(short(id)) ?? [])]); shortM.delete(id);
    drafts.push({ draft: label, act: id, author: t.signer, day: dayName(a.day), window: a.tray, spec: t.spec, sha256: t.sha256, work: t.work, uses: u, cited, short: shortM, text: t.act.text, title: t.title });
  }
  // replaces: each draft the one before; traced when its text names the previous act id or spec.
  for (let i = 1; i < drafts.length; i++) {
    const prev = drafts[i - 1], cur = drafts[i];
    const names = [prev.act, prev.spec, prev.media, prev.wordsText].filter(Boolean).map(short);
    const text = cur.text ?? '';
    cur.replaces = prev.act ?? prev.media; cur.replacesBasis = names.some((n) => text.includes(n)) ? 'traced (its text names the earlier draft)' : 'inferred (same author and title, later in the round)';
  }
  entries.push({ e, drafts });
}

// Builders, faults, kit, report names: per entry.
const allIdsOfEntry = (x) => x.drafts.flatMap((d) => [d.act, d.spec, d.media, d.sha256].filter(Boolean));
const catalogueActs = new Map(); for (const x of entries) for (const d of x.drafts) if (d.act) catalogueActs.set(d.act, x.e.key);
for (const x of entries) {
  const { e, drafts } = x;
  const own = new Set(drafts.map((d) => d.act).filter(Boolean));
  const authors = new Set(drafts.map((d) => d.author).filter(Boolean));
  // Uses across drafts, each act once.
  const all = new Map();
  for (const d of drafts) for (const [id, f] of d.uses) { if (own.has(id)) continue; let s = all.get(id); if (!s) all.set(id, (s = new Set())); f.forEach((y) => s.add(`${d.draft}: ${y}`)); }
  x.useStats = stats(all);
  x.byOthers = stats(new Map([...all].filter(([id]) => !authors.has(acts.get(id).d.signer))));
  for (const d of drafts) { d.useStats = stats(new Map([...d.uses].filter(([id]) => !own.has(id)))); d.citedStats = d.cited ? stats(d.cited) : null; d.shortCount = d.short ? d.short.size : 0; }
  // Builders: Terms naming it, and catalogue or cMIP-titled texts naming it.
  x.builtOnBy = [...all.keys()].map((id) => acts.get(id)).filter((a) => (a.d.spec === AG && a.d.type === 0) || (a.text && !authors.has(a.d.signer) && (catalogueActs.has(a.d.id) || /^#\s*cMIP|cMIP[^.]{0,20}draft/.test(a.text.split('\n')[0]))))
    .map((a) => ({ act: a.d.id, what: a.d.spec === AG ? 'Terms' : 'text', by: a.d.signer, window: a.tray, day: dayName(a.day), catalogue: catalogueActs.get(a.d.id) ?? null, title: a.text ? red(a.text.split('\n')[0].slice(0, 100)) : null }))
    .sort((p, q) => (p.day < q.day ? -1 : 1));
  // Faults: texts by others that name or cite it and speak of findings.
  const cand = new Set([...all.keys()]); for (const d of drafts) { d.cited?.forEach((_, id) => cand.add(id)); d.short?.forEach((id) => cand.add(id)); }
  // A fault word within 300 characters of one of the text's names (full or 8-character).
  const marks = [...new Set(allIdsOfEntry(x).map(short))];
  const near = (t) => { for (const h of marks) { let i = t.indexOf(h); while (i >= 0) { const w = t.slice(Math.max(0, i - 300), i + 300); const m = w.match(FAULT); if (m) return m; i = t.indexOf(h, i + 1); } } return null; };
  x.faults = [...cand].map((id) => acts.get(id)).filter((a) => a.text && !authors.has(a.d.signer) && !own.has(a.d.id) && near(a.text))
    .map((a) => {
      const later = drafts.filter((d) => d.text && (d.text.includes(short(a.d.id))));
      const m = near(a.text);
      return { act: a.d.id, by: a.d.signer, window: a.tray ?? [...a.kept][0] ?? null, day: dayName(a.day), opening: red(a.text.split('\n')[0].slice(0, 160)), word: m[0], answeredInDraft: later.map((d) => d.draft), basis: later.length ? 'traced (a draft names this act)' : 'not traced' };
    }).sort((p, q) => (p.day < q.day ? -1 : 1));
  // Kit verdict on Terms using it (or on the Terms themselves).
  const termsUsing = e.kind === 'terms' ? drafts.map((d) => d.act) : [...all.keys()].filter((id) => acts.get(id).d.spec === AG && acts.get(id).d.type === 0);
  x.kit = termsUsing.length ? kitVerdict(termsUsing, drafts.map((d) => d.spec)) : [];
  if (e.kind === 'kitspec') { const one = [...all.keys()][0]; try { x.kit = [{ act: one, check: plain(mor.agreementsNewCheck(acts.get(one).bytes)).verdict, note: 'the kit builds and checks report acts itself' }]; } catch (er) { x.kit = [{ act: one, check: 'error: ' + er.message }]; } }
  // Names in the reports: aliases, and the line beside each hash.
  const hashes = allIdsOfEntry(x).map(short);
  x.reportNames = {}; x.reportHashLines = [];
  for (const r of reports) {
    const lines = r.text.split('\n');
    for (const al of e.aliases) { const re = new RegExp(al.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); if (re.test(r.text)) { const n = (x.reportNames[al] ??= { files: 0, windows: new Set(), tiedToHash: 0 }); n.files++; n.windows.add(r.window); } }
    for (const ln of lines) for (const h of hashes) if (ln.includes(h)) {
      const tied = e.aliases.filter((al) => ln.toLowerCase().includes(al.toLowerCase()));
      tied.forEach((al) => x.reportNames[al].tiedToHash++);
      x.reportHashLines.push({ file: r.file, hash: h, names: tied, line: red(ln.replace(/\s+/g, ' ').trim().slice(0, 220)) });
    }
  }
  for (const k of Object.keys(x.reportNames)) x.reportNames[k].windows = [...x.reportNames[k].windows].sort();
}

// Prompt patterns: phrases asked for by a prompt, and how many acts and reports carry them.
const phrase = (re) => { const ids = [...acts.values()].filter((a) => a.text && re.test(a.text)); return { acts: ids.length, windows: [...new Set(ids.map((a) => a.tray).filter(Boolean))].sort(), actIds: ids.map((a) => a.d.id) }; };
const prompts = {
  notUsedFor: { phrase: 'something MOR has not been used for (this round)', ...phrase(/has not been used for/i) },
  couldNotSay: { phrase: 'what the language could not say', ...phrase(/language (could not|cannot) say|could not say|cannot say here/i) },
  contestSplit: { phrase: 'the contest rules ask that the payout run through "a split service whose cMIP names its remainder rule"', source: 'hosts/contest/cmip-lineup-vote-draft-3.md and draft-4.md' },
  bounties: { phrase: 'notice 8 ("attack the shower"): bounties for findings, 2,000 sats serious, 500 minor', source: 'hosts/notice-8.md' },
  indispensable: { phrase: 'final report, part 9: the cMIPs a window could not do without', source: '_research/cmips-indispensable.md' },
};
// MOR lead section.
const lead = LEAD.map(([p, cue, what]) => {
  const id = byPrefix(p, actIds); const a = acts.get(id); const i = a.text.toLowerCase().indexOf(cue.toLowerCase());
  const q = a.text.slice(Math.max(0, i - 40), i + 380).replace(/\s+/g, ' ');
  return { act: id, by: a.d.signer, window: a.tray ?? [...a.kept][0] ?? null, day: dayName(a.day), what, words: red(q) };
});
const beside = BESIDE.map(([p, form, what]) => {
  if (form === 'media') { const sha = byPrefix(p, mediaIds); return { media: sha, what, namedBy: stats(usesOf([['m', sha, null]])).acts }; }
  const t = [...texts.values()].find((x) => x.spec?.startsWith(p));
  return { spec: t.spec, act: t.id, what, namedBy: stats(usesOf([['spec', t.spec, null]], { exclude: new Set([t.id]) })).acts };
});

// ---------------------------------------------------------------------------------------------
// listing-money.json
const json = {
  made: 'DubPay W2-B, listing by code. Every count below is computed by listing-money.mjs from the data it names; the catalogue (what belongs in Money\'s area, how drafts group) is hand-made in the script.',
  read: { feedPages: read.feedPages, windowsActs: read.windowsActs, undecodableFeedEntries: read.undecodable.length, postmanLog: 'postman/log/carried.jsonl (POST /acts and POST /media letters: first carrying time and tray)', reports: reports.length, actsDistinct: acts.size, textActs: texts.size },
  categories: CAT,
  prompts,
  entries: entries.map((x) => ({
    key: x.e.key, name: x.e.name, category: x.e.cat, alsoIn: x.e.also ?? [], kind: x.e.kind, note: x.e.note ?? null,
    author: [...new Set(x.drafts.map((d) => d.author).filter(Boolean))].map((s) => ({ identity: s, window: windowOfSigner(s) })),
    task: x.drafts.map((d) => d.text).filter(Boolean).slice(-1).map(taskQuote)[0] ?? null,
    uses: x.useStats, usesByOthers: { acts: x.byOthers.acts, identities: x.byOthers.identities, windows: x.byOthers.windows },
    namesInReports: x.e.aliases.map((al) => ({ name: al, ...(x.reportNames[al] ?? { files: 0, windows: [], tiedToHash: 0 }) })),
    reportLinesBesideAHash: x.reportHashLines,
    builtOnBy: x.builtOnBy, faults: x.faults, kit: x.kit,
    drafts: x.drafts.map((d) => ({
      draft: d.draft, act: d.act ?? null, media: d.media ?? null, bytes: d.bytes ?? null, announcedBy: d.announced ?? null, author: d.author ?? null, window: d.window ?? d.postedBy ?? null, day: d.day,
      spec: d.spec ?? null, sha256OfText: d.sha256 ?? null, workHashOfText: d.work ?? null, termsWords: d.words ?? null, wordsTextAct: d.wordsText ?? null, termsBody: d.body ?? null, termsBodyText: d.bodyText ?? null,
      title: d.title ? red(d.title.slice(0, 160)) : null, replaces: d.replaces ?? null, replacesBasis: d.replacesBasis ?? null,
      uses: d.useStats, citedByActId: d.citedStats ? { acts: d.citedStats.acts, actIds: d.citedStats.actIds } : null, shortMentions: d.shortCount,
    })),
  })),
  beside, forTheMorLead: lead,
};
writeFileSync(join(HERE, 'listing-money.json'), JSON.stringify(json, null, 1) + '\n');

// ---------------------------------------------------------------------------------------------
// listing-money.md
const md = [];
const P = (...l) => md.push(...l);
const per = {}; for (const x of entries) per[x.e.cat] = (per[x.e.cat] || 0) + 1;
const ranked = [...entries].sort((a, b) => b.byOthers.acts - a.byOthers.acts || b.useStats.acts - a.useStats.acts);
const kitAll = entries.flatMap((x) => x.kit.filter((k) => k.in_force));
const kitCount = (f) => { const c = {}; for (const k of kitAll) { const w = f === 'check' ? k.check : k[f].word; c[w] = (c[w] || 0) + 1; } return c; };
const W = (ws) => ws.length ? ws.join(', ') : '—';
P('# Money\'s area, listed by code (DubPay W2-B)', '',
  `*DubPay, 21 November 2026, for Nobody, allegedly. Made by \`listing-money.mjs\` (beside this file; rerun: \`node docs/dubpay/catalogue/listing-money.mjs\`). It lists and counts; it groups nothing by problem and leans nowhere. Marks: **counted** (the script counted it), **traced** (an act's bytes show it), **inferred** (read from titles, order or wording). Ids are shortened to 8 characters here; \`listing-money.json\` holds them whole, with the act ids behind every count.*`, '');
P('## Plain words first', '',
  `- **${entries.length} texts** in Money's five categories (counted): ${Object.entries(CAT).map(([k, v]) => `${v.split(' (')[0].toLowerCase()} ${per[k] ?? 0}`).join('; ')}. A text is a cMIP, a template, a Terms that is itself the mechanism, or an app; drafts of one text count once.`,
  `- **The five most used**, by acts of other identities that name them (counted): ${ranked.slice(0, 5).map((x) => `${x.e.name} (${x.byOthers.acts} acts, ${x.byOthers.identities} identities, ${x.byOthers.windows.length} windows)`).join('; ')}.`,
  `- Almost every money text came late: ${entries.filter((x) => x.drafts.every((d) => d.day === 'day 5')).length} of ${entries.length} were first published on day five (counted). Many day-five texts answer a prompt: "${prompts.notUsedFor.phrase}" opens or appears in ${prompts.notUsedFor.acts} acts (counted), and "${prompts.couldNotSay.phrase}" in ${prompts.couldNotSay.acts} (counted; see the hosts' prompts, below).`,
  `- The kit (the core library) was asked on ${kitAll.length} Terms that name these texts: shape check ${Object.entries(kitCount('check')).map(([a, b]) => `"${a}" ${b}`).join(', ')}; in force ${Object.entries(kitCount('in_force')).map(([a, b]) => `"${a}" ${b}`).join(', ')} (counted). Why "unchecked": ${kitAll.filter((k) => /does not hold the cMIP of K2/.test(k.in_force.says)).length} because the kit does not hold the cMIP read for in force (task K2, named signers), ${kitAll.filter((k) => /no answer from it/.test(k.in_force.says)).length} because it has no answer from the place the Terms name (counted). Its answers are about shape and being in force only; in ${kitAll.filter((k) => k.namesThisCmip).length} of them does it name the listed money cMIP, so the split, pot, escrow, loan and invoice rules were applied by readers, by hand or with the authors' apps (traced from the answers' words; per text below).`, '');
P('## Sources the script read', '',
  `- Feed pages and records: ${read.feedPages.length} files under \`_research/feeds/\` (every home's feed pages, postmark-place's records, dubsar's relay copy opened read-only). ${read.undecodable.length} feed entries are sealed containers or not acts and were skipped (counted).`,
  `- Acts kept by windows: \`_research/windows/*/acts/*.mor\` in ${Object.keys(read.windowsActs).length} windows (${Object.values(read.windowsActs).reduce((a, b) => a + b, 0)} files).`,
  `- **${acts.size} distinct acts** after counting each act once across homes and windows; ${texts.size} of them are public text acts (counted).`,
  `- Window and day of an act: the window (tray) that first carried it, from the postman's log (\`_research/postman/log/carried.jsonl\`), in Europe/Zurich time; day one is 15 November, day five 20 November. Where the log has no carry for an act, the windows that kept it stand in (counted as "without carry record").`,
  `- Names: ${reports.length} report files under \`_research/windows/*/reports/\`.`, '');
P('## How a text is named, and what "use" means here', '',
  '- A **use** is any later act that names the text by its spec hash (`tagged_hash("MOR/spec", {0: 0, 1: author, 9: text})`, computed by the core library), by the SHA-256 or the work hash of its whole text, or by its act id where a cMIP is read (a Terms body or an act\'s spec). For the texts marked *named by act id* (escrow, the room let, the invoice request form, DubPay\'s shape), an act id anywhere counts. For a Terms, an act naming its id (assents, statements, reports, replies). For an app, an act naming its media SHA-256.',
  '- **Cited** (in the JSON): acts naming a text\'s act id elsewhere, mostly replies. **Short mentions** (inferred): text acts writing the first 8 to 12 characters and an ellipsis.',
  '- **By others**: uses signed by identities other than the text\'s author(s).', '');

for (const [k, v] of Object.entries(CAT)) {
  const xs = entries.filter((x) => x.e.cat == k);
  const ptr = entries.filter((x) => (x.e.also ?? []).includes(+k));
  P(`## ${k}. ${v}`, '');
  if (ptr.length) P(`*Also fits here (listed under its main task): ${ptr.map((x) => `${x.e.name} (category ${x.e.cat})`).join('; ')}.*`, '');
  P('| Text | Author (window) | Drafts: id → spec or media | Used by (counted) | By others | Windows | Days |', '|---|---|---|---|---|---|---|');
  for (const x of xs) {
    const au = [...new Set(x.drafts.map((d) => d.author).filter(Boolean))].map((s) => `${short(s)} (${windowOfSigner(s) ?? '?'})`).join(', ') || 'the kit';
    const dr = x.drafts.map((d) => `${d.draft}: ${short(d.act ?? d.media ?? d.spec)}${d.spec && d.act ? ' → ' + short(d.spec) : ''}`).join('; ');
    P(`| ${x.e.name} | ${au} | ${dr} | ${x.useStats.acts} acts, ${x.useStats.identities} identities | ${x.byOthers.acts} acts, ${x.byOthers.identities} ids | ${x.useStats.windowCount} | ${x.useStats.days.join(', ') || '—'} |`);
  }
  P('');
  for (const x of xs) {
    P(`### ${x.e.name}`, '');
    const task = x.drafts.map((d) => d.text).filter(Boolean).slice(-1).map(taskQuote)[0];
    if (task) P(`- **Its task, in its own words** (latest draft): "${task}"`);
    if (x.e.note) P(`- Note: ${x.e.note}`);
    const names = x.e.aliases.map((al) => ({ al, n: x.reportNames[al] })).filter((y) => y.n);
    P(`- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): ${names.length ? names.map(({ al, n }) => `"${al}" in ${n.files} reports of ${n.windows.length} windows${n.tiedToHash ? `, ${n.tiedToHash} times beside a hash` : ''}`).join('; ') : 'none of the names looked for'}. Lines beside a hash: ${x.reportHashLines.length} (in the JSON).`);
    for (const d of x.drafts) {
      const id = d.act ? `act ${short(d.act)}` : `media ${short(d.media)}${d.bytes ? `, ${d.bytes} bytes` : ''}${d.announced ? `, announced in act ${short(d.announced)}` : ''}`;
      const spec = d.spec ? `, spec ${short(d.spec)}` : d.body ? `, body ${d.bodyText ?? short(d.body)}` : '';
      const rep = d.replaces ? `; replaces ${short(d.replaces)}, ${d.replacesBasis}` : '';
      P(`  - Draft ${d.draft}: ${id}${spec}, ${d.day}, ${d.window ?? d.postedBy ?? 'window unknown'}${rep}. Used by ${d.useStats.acts} acts (${Object.entries(d.useStats.kinds).map(([a, b]) => `${b} ${a}`).join(', ') || 'none'})${d.citedStats ? `; cited by act id ${d.citedStats.acts}` : ''}${d.shortCount ? `; short mentions ${d.shortCount}` : ''}.`);
    }
    P(`- **Use, all drafts** (counted): ${x.useStats.acts} acts by ${x.useStats.identities} identities, in ${x.useStats.windowCount} windows (${W(x.useStats.windows)}), on ${x.useStats.days.join(', ') || '—'}${x.useStats.actsWithoutCarryRecord ? `; ${x.useStats.actsWithoutCarryRecord} acts without carry record` : ''}. By others: ${x.byOthers.acts} acts, ${x.byOthers.identities} identities.`);
    if (x.builtOnBy.length) P(`- **Built on it** (traced; Terms and cMIP texts naming it): ${x.builtOnBy.length}: ${x.builtOnBy.slice(0, 12).map((b) => b.what === 'Terms' ? `Terms ${short(b.act)} (${b.window ?? '?'}, ${b.day})` : `${b.catalogue ? `[${b.catalogue}] ` : ''}${b.title} (${short(b.act)})`).join('; ')}${x.builtOnBy.length > 12 ? `; and ${x.builtOnBy.length - 12} more in the JSON` : ''}.`);
    else P('- **Built on it**: no Terms or cMIP text names it (counted).');
    if (x.faults.length) P(`- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): ${x.faults.length}: ${x.faults.slice(0, 8).map((f) => `act ${short(f.act)} by ${short(f.by)} (${f.window ?? '?'}, ${f.day}), "${f.opening.slice(0, 90)}…"${f.answeredInDraft.length ? `, named by draft ${f.answeredInDraft.join(', ')} (traced)` : ''}`).join('; ')}${x.faults.length > 8 ? `; and ${x.faults.length - 8} more in the JSON` : ''}.`);
    else P('- **Faults reported**: none found by the script.');
    if (x.kit.length) P(`- **The kit** (counted, the core library's own answers): ${x.kit.map((k) => k.in_force ? `Terms ${short(k.terms)}: check "${k.check}", in force "${k.in_force.word}" (${k.in_force.says.slice(0, 140)})${k.namesThisCmip ? ' — names this cMIP as not held' : ''}` : `act ${short(k.act)}: check "${k.check}"`).join('; ')}.`);
    else P('- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).');
    P('');
  }
}
P('## Beside Money\'s area (pointers, not counted as Money\'s)', '');
for (const b of beside) P(`- ${b.what} ${b.spec ? `Spec ${short(b.spec)}` : `Media ${short(b.media)}`}, named by ${b.namedBy} acts (counted).`);
P('');
P('## For the MOR lead: what the language could not say, in Money\'s area', '',
  `*Hand-picked acts, quoted by the script. A prompt asked for this: "${prompts.couldNotSay.phrase}" appears in ${prompts.couldNotSay.acts} acts (counted), so the section shape is the prompt's, not the players' own idea (inferred). Nothing here is decided.*`, '');
for (const l of lead) P(`- **${l.what}.** Act ${short(l.act)} (${l.window ?? '?'}, ${l.day}): "…${l.words.slice(0, 330)}…"`);
P('');
P('## The hosts\' prompts behind the patterns', '',
  `- ${prompts.contestSplit.phrase} (${prompts.contestSplit.source}): the split texts and every split-service deal answer it (inferred).`,
  `- ${prompts.bounties.phrase} (${prompts.bounties.source}): many of the faults above are bounty findings (inferred).`,
  `- "${prompts.notUsedFor.phrase}": ${prompts.notUsedFor.acts} acts in ${prompts.notUsedFor.windows.length} windows (counted). Read as a day-five prompt (inferred: the day-to-day prompts are not in the data; the notices do not quote it). The acts: ${prompts.notUsedFor.actIds.map((id) => `${short(id)} (${acts.get(id).tray ?? '?'}: "${red(acts.get(id).text.split('\\n')[0].slice(0, 70))}…")`).join('; ')}.`,
  `- ${prompts.indispensable.phrase} (${prompts.indispensable.source}).`, '');
P('## Limits', '',
  '- **What belongs in Money\'s area, and the grouping of drafts, is hand-made** (the CATALOGUE in the script). A money text not in it is not listed; search the JSON\'s sources to check.',
  '- A text named only in sealed acts, or held only in a window\'s build folder, is not seen. Pointer\'s client spot draft 1 and Hop\'s split draft 6 are named but not held as text acts.',
  '- The day and window of an act come from the postman\'s first carry; an act posted by one window for another counts for the carrier. A public window (for example public-creators) holds several players: "window" is the tray, not the person.',
  '- Faults are found by words ("finding", "fault", "hole", ...) in acts naming or citing a text: some are praise or questions, and a finding sent sealed is missed. "Answered in draft N" is traced only when the draft names the finding\'s act.',
  '- The kit\'s verdict is asked on at most three Terms per text, with every Agreements act the script could link to them; "unchecked" can also mean a first version is not held.',
  '- Names in the reports are the names looked for (the aliases in the script) plus every line that carries one of the text\'s hashes; a name used without a hash and not among the aliases is missed.',
  '- Counts of use mix kinds (Terms, statements, reports, replies, announcements): the per-draft lines give the breakdown.', '');
writeFileSync(join(HERE, 'listing-money.md'), md.join('\n'));
console.log(`listing-money: ${entries.length} texts, ${acts.size} acts read; wrote listing-money.json and listing-money.md`);
