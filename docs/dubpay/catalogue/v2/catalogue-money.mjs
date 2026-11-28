// DubPay W3-B2: the catalogue of Money, by problem, version 2 (after the cold check W3-C).
// Version 1's script (wave-3/results/B/catalogue-money.mjs), changed only where the check asks for a count:
// section 1b asks the core, through the kit, about every Terms that names a solution (W3-C asked for all, not 3),
// and counts what W3-C's findings rest on (Hop's deals and their signers, the escrow's vows, pot lines by draft,
// DubPay's tab debts, sealed acts cited). Section-solutions (a part of a text already placed) are allowed.
// The hand-made part may write {{name}} for a count; this script fills it, and stops on an unknown name.
// Reads (read only): DubPay wave-2 listing B (listing-money.json) and its reader of _research/ (listing-money-data.mjs),
// wave-3 slice check A (slice-check.json), DubWeb's shared inventory (inventory-all.json), and catalogue-money-hand.mjs.
// Writes, only beside itself: catalogue-money.md, catalogue-money.json and answers-to-w3c.md.
// Rerun: node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/B2/catalogue-money.mjs
// It signs nothing, posts nothing, pays nothing, and reads no key.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROUND = process.env.MOR_ROUND || join(process.env.HOME, 'Documents/mor-round-2');
const T = join(ROUND, '_team');
const L = JSON.parse(readFileSync(join(T, 'dubpay/wave-2/results/B/listing-money.json'), 'utf8'));
const A = JSON.parse(readFileSync(join(T, 'dubpay/wave-3/results/A/slice-check.json'), 'utf8'));
const INV = JSON.parse(readFileSync(join(T, 'dubweb/wave-3/inventory/inventory-all.json'), 'utf8'));
const H = await import(join(HERE, 'catalogue-money-hand.mjs'));
const D = await import(join(T, 'dubpay/wave-2/results/B/listing-money-data.mjs')); // listing B's reader of _research/

const USED = 'Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.';
const s8 = (x) => (x ? String(x).slice(0, 8) : '—');
const entry = new Map(L.entries.map((e) => [e.key, e]));

// ---------- 1. every id cited by hand: an act in the research copy (public or sealed), or a media hash ----------
const byPrefix = new Map();
for (const id of D.acts.keys()) { const k = id.slice(0, 8); if (!byPrefix.has(k)) byPrefix.set(k, []); byPrefix.get(k).push(id); }
const media = new Set();
for (const e of L.entries) for (const d of e.drafts) if (d.media) media.add(d.media);
for (const h of D.mediaPosts.keys()) media.add(h);
const resolved = new Map(); // short -> {full, kind, sealed} or {missing}
function resolve(short) {
  if (resolved.has(short)) return resolved.get(short);
  let r;
  const acts = (byPrefix.get(short.slice(0, 8)) || []).filter((id) => id.startsWith(short));
  if (acts.length === 1) r = { full: acts[0], kind: 'act', sealed: !D.acts.get(acts[0]).d.public };
  else if (acts.length > 1) r = { ambiguous: acts };
  else { const m = [...media].filter((h) => h.startsWith(short)); r = m.length === 1 ? { full: m[0], kind: 'media' } : { missing: true }; }
  resolved.set(short, r); return r;
}
const full = (p) => resolve(p).full;

// ---------- 1b. what the check asks for: the core on every Terms naming a solution, and the targeted counts ----------
const hex = (u) => Buffer.from(u).toString('hex');
function hashes(x, out = new Set()) { // every 32-byte string and 64-hex in a decoded payload
  if (x instanceof Uint8Array) { if (x.length === 32) out.add(hex(x)); else if (x.length > 40) { try { hashes(D.mor.cborDecode(x), out); } catch {} } }
  else if (typeof x === 'string') { for (const m of x.matchAll(/[0-9a-f]{64}/g)) out.add(m[0]); }
  else if (Array.isArray(x)) x.forEach((y) => hashes(y, out));
  else if (x instanceof Map) for (const [k, v] of x) { hashes(k, out); hashes(v, out); }
  return out;
}
function strings(x, out = []) {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => strings(y, out));
  else if (x instanceof Map) for (const [k, v] of x) { strings(k, out); strings(v, out); }
  return out;
}
const agr = [];
for (const [id, a] of D.acts) {
  if (a.d.spec !== D.AG || !a.d.public) continue;
  let p = null; try { p = D.mor.cborDecode(a.d.payload); } catch {}
  agr.push({ id, a, p, h: p ? hashes(p) : new Set() });
}
const held = agr.map((x) => ({ bytes: x.a.bytes }));
const termsActs = agr.filter((x) => x.a.d.type === 0);
const askCache = new Map();
function inForce(id) {
  if (!askCache.has(id)) {
    let r; try { r = JSON.parse(D.mor.agreementsNewAsk({ acts: held, ask: 'in_force', args: [id] }))[0]; } catch (e) { r = { word: 'error', says: String(e.message || e) }; }
    askCache.set(id, r);
  }
  return askCache.get(id);
}
const NS = ['ed7e3956', 'd8a19d7d']; // DubLaw's named signers, draft 1: spec, act
const BBA = ['d47b4322', '735c3cf8']; // DubLaw's buyer by assent, draft 1: spec, act
const getK = (p, k) => (p instanceof Map ? p.get(k) : undefined);
function termsRow(x, pre) {
  const r = inForce(x.id); const hs = [...x.h];
  const parties = (getK(x.p, 2) || []).map((q) => ({ kind: q[0], who: q[1] instanceof Uint8Array ? hex(q[1]) : String(q[1]) }));
  return {
    terms: x.id, signer: x.a.d.signer, word: r.word, rule: r.rule ?? null,
    missingCmip: (r.says || '').match(/cMIP of K2 \(([0-9a-f]{8})/)?.[1] || null,
    draftsNamed: [...new Set(hs.map(s8).filter((h) => pre.includes(h)))],
    namedSigners: hs.some((h) => NS.includes(s8(h))), buyerByAssent: hs.some((h) => BBA.includes(s8(h))),
    hasInForceField: x.p instanceof Map && x.p.has(6), parties,
    test: strings(x.p).find((s) => /^TEST VOW/.test(s)) || null,
  };
}
const prefixesOf = (key, only) => {
  const e = entry.get(key); if (!e) return [];
  return e.drafts.filter((d) => !only || only(d)).flatMap((d) => [d.act, d.spec, d.media].filter(Boolean).map(s8));
};
const coreByKey = new Map();
function core(key) {
  if (coreByKey.has(key)) return coreByKey.get(key);
  const pre = prefixesOf(key);
  const rows = pre.length ? termsActs.filter((x) => [...x.h].some((h) => pre.includes(s8(h)))).map((x) => termsRow(x, pre)) : [];
  const tally = {}; for (const r of rows) { const k = `${r.word}${r.missingCmip ? ` (no ${r.missingCmip})` : ''}`; tally[k] = (tally[k] || 0) + 1; }
  const c = { terms: rows.length, tally, rows }; coreByKey.set(key, c); return c;
}
const tallyText = (c) => (c.terms ? Object.entries(c.tally).map(([w, n]) => `${w} ${n}`).join(', ') : 'no Terms names it');

// The counts W3-C's findings rest on. K holds what {{name}} may fill.
const K = {};
const words = (rows) => [...new Set(rows.map((r) => r.word))].join(', ');
{ // the straight split
  const c = core('straight-split');
  const d7 = prefixesOf('straight-split', (d) => String(d.draft).startsWith('7'));
  const d4 = prefixesOf('straight-split', (d) => String(d.draft).startsWith('4'));
  const shown = c.rows.filter((r) => r.word === 'shown');
  const d7rows = c.rows.filter((r) => r.draftsNamed.some((h) => d7.includes(h)));
  Object.assign(K, {
    ssTerms: c.terms, ssShown: shown.length, ssShownIds: shown.map((r) => s8(r.terms)).join(', '),
    ssShownAllDraft4: shown.every((r) => r.draftsNamed.every((h) => d4.includes(h))) ? 'all name draft 4 only' : 'NOT all draft 4',
    ssShownNoInForce: shown.filter((r) => !r.hasInForceField).length,
    ssShownServiceOnlySigner: shown.filter((r) => r.parties.filter((p) => p.kind === 0).length === 1).length,
    ssD7Terms: d7rows.length, ssD7Shown: d7rows.filter((r) => r.word === 'shown').length,
    ssNoOwnRule: c.rows.filter((r) => r.missingCmip === 'e51e8653').length,
    ssNoNamedSigners: c.rows.filter((r) => r.missingCmip === 'ed7e3956').length,
  });
}
{ // Hop's split: its deals, every party a signer, and who they are
  const c = core('hop-split');
  const others = new Set(); for (const r of c.rows) for (const p of r.parties) if (p.kind === 0 && p.who !== r.signer) others.add(p.who);
  const wins = {}; for (const o of others) { const w = D.windowOfSigner(o) || 'no tray'; wins[w] = (wins[w] || 0) + 1; }
  Object.assign(K, {
    hopTerms: c.terms, hopShown: c.rows.filter((r) => r.word === 'shown').length,
    hopAllPartiesSigners: c.rows.filter((r) => r.parties.every((p) => p.kind === 0)).length,
    hopSignedByHop: c.rows.filter((r) => r.signer.startsWith('a48e4b24')).length,
    hopOthers: others.size, hopOtherIds: [...others].map(s8).join(', '),
    hopOtherWindows: Object.entries(wins).map(([w, n]) => `${w} ${n}`).join(', '),
  });
  K.hopDealRows = c.rows.map((r) => `${s8(r.terms)} (${r.word}; signers ${r.parties.map((p) => s8(p.who)).join(', ')})`).join('; ');
}
{ // the report block, by signer
  const by = {}; let n = 0;
  for (const a of D.acts.values()) if (a.d.public && a.d.spec === D.REPORT) { by[s8(a.d.signer)] = (by[s8(a.d.signer)] || 0) + 1; n++; }
  Object.assign(K, { rbActs: n, rbHop: by.a48e4b24 || 0, rbDubPay: by['880d33f2'] || 0, rbSigners: Object.keys(by).length });
}
{ // DubPay's own debts in the round's tab (report-block acts naming the tab's Terms c4700b24)
  const tab = full('c4700b24'); let sum = 0; const lines = [];
  for (const a of D.acts.values()) {
    if (!a.d.public || a.d.spec !== D.REPORT || !a.d.signer.startsWith('880d33f2')) continue;
    let p; try { p = D.mor.cborDecode(a.d.payload); } catch { continue; }
    const head = getK(p, 0); if (!head || !(head[0] instanceof Uint8Array) || hex(head[0]) !== tab) continue;
    for (const l of getK(p, 2) || []) if (l[0] === 4) { const amt = Number(l[1][1]); sum += amt; lines.push(`${s8(a.d.id)}: ${amt} to ${s8(hex(l[2][1]))}`); }
  }
  Object.assign(K, { tabDebtSum: sum.toLocaleString('en'), tabDebtLines: lines.length, tabDebtList: lines.join('; ') });
}
{ // the common pot: lines by draft, acts naming draft 2; Spare Wheel's Terms and members
  const d1 = prefixesOf('common-pot', (d) => String(d.draft).startsWith('1'));
  const d2 = prefixesOf('common-pot', (d) => String(d.draft).startsWith('2'));
  const lines = agr.filter((x) => x.a.d.type === 1);
  K.potLinesD1 = lines.filter((x) => [...x.h].some((h) => d1.includes(s8(h)))).length;
  K.potLinesD2 = lines.filter((x) => [...x.h].some((h) => d2.includes(s8(h)))).length;
  const d2full = [full('73bece9f')];
  const namers = [...D.acts.values()].filter((a) => a.d.public && a.d.id !== d2full[0] && a.text && /73bece9f|f608f7fa/.test(a.text));
  K.potD2NamedBy = namers.length; K.potD2NamedByList = namers.map((a) => `${s8(a.d.id)} by ${s8(a.d.signer)}`).join(', ');
  const sw = agr.find((x) => x.id === full('73db2ea4')); const r = termsRow(sw, d1);
  K.swWord = r.word; K.swNamedSigners = r.namedSigners ? 'names named signers (ed7e3956)' : 'does not name named signers';
  K.swDraftsNamed = r.draftsNamed.map((h) => (d1.includes(h) ? 'draft 1' : h)).join(', ');
  const ms = r.parties.filter((p) => p.kind === 0).map((p) => p.who); const w = {};
  for (const m of ms) { const x = D.windowOfSigner(m) || 'no tray'; w[x] = (w[x] || 0) + 1; }
  K.swMembers = ms.length; K.swMemberTrays = Object.entries(w).map(([x, n]) => `${x} ${n}`).join(', ');
}
{ // the escrow's vows, the drafts they name, and the acts that speak of money in them
  const c = core('escrow'); const ids = c.rows.map((r) => r.terms);
  const by = (n) => prefixesOf('escrow', (d) => String(d.draft).startsWith(String(n)));
  K.vows = c.terms; K.vowWord = words(c.rows);
  K.vowLabels = c.rows.map((r) => `${s8(r.terms)} "${r.test}"`).join('; ');
  for (const n of [1, 2, 3, 4, 5]) K[`vowsDraft${n}`] = c.rows.filter((r) => r.draftsNamed.some((h) => by(n).includes(h))).length;
  K.vowsNamedSignersOrAssent = c.rows.filter((r) => r.namedSigners || r.buyerByAssent).length;
  const talk = [...D.acts.values()].filter((a) => a.d.public && a.text && ids.some((v) => a.text.includes(s8(v))) && /paid|refund|released|contest/i.test(a.text));
  K.vowMoneyActs = talk.length; K.vowMoneySigners = new Set(talk.map((a) => a.d.signer)).size;
  K.vowMoneySignerIds = [...new Set(talk.map((a) => s8(a.d.signer)))].join(', ');
}
{ // Kept Word: its charter Terms, the escrow, and the core
  const kw = agr.find((x) => x.id === full('825b834d')); const esc = prefixesOf('escrow');
  K.kwTermsNameEscrow = [...kw.h].some((h) => esc.includes(s8(h))) ? 'names' : 'does not name';
  K.kwWord = inForce(kw.id).word;
  const charter = D.acts.get(full('713ad026')).text || '';
  K.kwCharterNamesEscrow = esc.some((p) => charter.includes(p)) ? 'names an escrow draft by act id (as a pointer, rule 6)' : 'names no escrow draft';
}
{ // other Terms read beside the problems
  for (const [k, p] of Object.entries({ cercle: 'caede5b5', krog: 'b059f5d1', mending: '6b2736be', homeBond: 'be5f5d6c', shelfListing: 'e1975bda', roundsTab: 'c4700b24', md9f38: '9f387d1d' })) {
    const x = agr.find((y) => y.id === full(p)); const r = termsRow(x, []);
    K[`${k}Word`] = r.word; K[`${k}NS`] = r.namedSigners || r.buyerByAssent ? 'names named signers or buyer by assent' : 'names neither';
  }
}
{ // the money decision's Terms, and the sealed acts cited
  const c = core('money-decision'); K.mdTerms = c.terms; K.mdTally = tallyText(c);
}

const fill = (s) => (typeof s !== 'string' ? s : s.replace(/\{\{(\w+)\}\}/g, (_, n) => { if (!(n in K)) throw new Error(`unknown count {{${n}}}`); return String(K[n]); }));
const ff = (fld) => fld && ({ ...fld, text: fill(fld.text) });
const expand = (fld) => fld && ({ ...ff(fld), acts: fld.acts.map((a) => ({ cited: a, ...resolve(a) })) });

// ---------- 2. the slice's Money keys, and where each is placed ----------
const keyOfLine = (l) => l.B_key || (l.text.includes('guide spot') ? 'guide-spot' : null);
const moneyKeys = new Map(); // key -> {text, status, prompted:Set}
for (const l of A.lines) {
  if (l.status === 'placed elsewhere in the inventory') continue;
  const k = keyOfLine(l); if (!k) continue;
  const m = moneyKeys.get(k) || { text: l.text, status: new Set(), prompted: new Set() };
  m.status.add(l.status); if (l.prompted) m.prompted.add(l.prompted); moneyKeys.set(k, m);
}
const placed = new Map(); // key -> [problem ids]; a section-solution (s.section) is a part of a text placed elsewhere and is not counted here
for (const p of H.PROBLEMS) {
  for (const s of p.solutions) { if (!s.section) placed.set(s.key, [...(placed.get(s.key) || []), p.id]); for (const b of s.built || []) placed.set(b, [...(placed.get(b) || []), p.id]); }
}
const placement = [...moneyKeys].map(([k, m]) => ({ key: k, text: m.text, status: [...m.status].join(' + '), problems: placed.get(k) || [] }));
const placementOk = placement.every((x) => x.problems.length === 1) && [...placed.keys()].every((k) => moneyKeys.has(k));

// ---------- 3. counts per text, from listing B (or the inventory for the guide spot); the core's answer from 1b ----------
const guide = INV.specifications.find((r) => r.spec_hash?.startsWith('824698f3'));
function counts(key) {
  if (key === 'guide-spot') return {
    name: 'cMIP guide spot (Turnstile)', author: s8(guide.creator), window: guide.creator_window_inferred,
    drafts: [`1: ${s8(guide.act)} → ${s8(guide.spec_hash)}`], uses: { acts: guide.use.acts, identities: guide.use.identities, windows: guide.use.windows_inferred.length },
    byOthers: null, builtOn: guide.built_on_by.length, faultActs: guide.fault_candidates.length, kit: 'no Terms names it', core: 'no Terms names it', days: [], source: 'inventory (by spec hash)',
    answersToItsAct: guide.answers_to_its_act.length,
  };
  const e = entry.get(key);
  const kit = {}; for (const k of e.kit || []) { const w = k.in_force?.word ?? `check ${k.check}`; kit[w] = (kit[w] || 0) + 1; }
  return {
    name: e.name, author: e.author.length ? e.author.map((a) => s8(a.identity)).join(', ') : 'the kit', window: e.author.length ? e.author.map((a) => a.window).join(', ') : 'no window',
    drafts: e.drafts.map((d) => `${d.draft}: ${s8(d.act || d.media)}${d.spec ? ' → ' + s8(d.spec) : ''}`),
    uses: { acts: e.uses.acts, identities: e.uses.identities, windows: e.uses.windowCount },
    byOthers: { acts: e.usesByOthers.acts, identities: e.usesByOthers.identities },
    builtOn: e.builtOnBy.length, faultActs: e.faults.length,
    kit: Object.keys(kit).length ? Object.entries(kit).map(([w, n]) => `${w} ${n}`).join(', ') : 'no Terms names it',
    core: tallyText(core(key)),
    days: e.uses.days, source: 'listing B',
  };
}
const prompted = (key) => { const m = moneyKeys.get(key); return m ? [...m.prompted].join('; ') || 'not found' : 'not found'; };

// ---------- 4. the records ----------
const records = H.PROBLEMS.map((p) => ({
  id: p.id, problem: p.title, category: p.category,
  solutions: p.solutions.map((s) => ({
    key: s.key, section: s.section || null, sectionName: s.name || null, task: s.task,
    counts: s.section ? null : counts(s.key), countsMark: 'counted', caveat: USED,
    promptedInSlice: prompted(s.key), promptedRead: fill(s.prompted),
    holdsAndDecides: expand(s.holds), remainderFailedShare: expand(s.remainder), memberWhoStops: expand(s.stops),
    wayOut: expand(s.wayOut), provesAndWord: expand(s.proves), faults: expand(s.faults),
    builtOnIt: (s.built || []).map((b) => ({ key: b, counts: counts(b), promptedInSlice: prompted(b), note: expand(p.builtNotes[b]) })),
  })),
  candidates: (p.candidates || []).map(expand),
  pointers: p.pointers.map(expand),
  agree: expand(p.agree), differ: expand(p.differ),
  lean: { ...p.lean, text: fill(p.lean.text), by: "DubPay's (proposed)", mark: p.lean.mark || 'inferred', acts: p.lean.acts.map((a) => ({ cited: a, ...resolve(a) })) },
  namedSignersAndBuyerByAssent: p.rule3.turns ? { turns: true, text: fill(p.rule3.text), ifDefault: fill(p.rule3.ifDefault), ifNot: fill(p.rule3.ifNot), acts: p.rule3.acts.map((a) => ({ cited: a, ...resolve(a) })) } : { turns: false, why: fill(p.rule3.why || '') },
}));
// Each lean carries the order's two caveats beside it: used is not checked, and what the slice marks prompted.
for (const r of records) {
  const marks = [];
  for (const s of r.solutions) {
    const nm = s.section ? s.sectionName : s.counts.name; const pm = s.section ? 'see its text\'s own row' : s.promptedInSlice;
    marks.push(`${nm}: ${pm}`);
    for (const b of s.builtOnIt) marks.push(`${b.counts.name}: ${b.promptedInSlice}`);
  }
  r.lean.caveat = `Any use this lean names is used, not checked (the order's rule 1). Prompted, as slice A marks it: ${marks.join('; ') || 'no text'}.`;
}
const seams = H.SEAMS.map((x) => ({ ...x, what: fill(x.what), acts: x.acts.map((a) => ({ cited: a, ...resolve(a) })) }));
const morLead = H.MOR_LEAD.map(expand);
const answers = H.ANSWERS.map((x) => ({ ...x, finding: fill(x.finding), change: fill(x.change), acts: x.acts.map((a) => ({ cited: a, ...resolve(a) })) }));
const missing = [...resolved].filter(([, r]) => !r.full).map(([k, r]) => ({ cited: k, ...r }));
const sealedCited = [...resolved].filter(([, r]) => r.sealed).map(([k]) => k);

// Tallies (counted).
const KINDS = ['keep one', 'merge two', 'gap still open', 'moved out (a pointer stays)'];
const tally = {
  problems: records.length,
  solutions: records.reduce((n, r) => n + r.solutions.length, 0),
  sectionSolutions: records.reduce((n, r) => n + r.solutions.filter((s) => s.section).length, 0),
  builtOn: records.reduce((n, r) => n + r.solutions.reduce((m, s) => m + s.builtOnIt.length, 0), 0),
  moneyKeysInSlice: moneyKeys.size, placedOnce: placement.filter((x) => x.problems.length === 1).length,
  leans: Object.fromEntries(KINDS.map((k) => [k, records.filter((r) => r.lean.kind === k).length])),
  leansOfOtherKind: records.filter((r) => !KINDS.includes(r.lean.kind)).map((r) => r.id),
  turnOnRule3: records.filter((r) => r.namedSignersAndBuyerByAssent.turns).length,
  idsCited: resolved.size, idsActs: [...resolved.values()].filter((r) => r.kind === 'act').length,
  idsSealed: sealedCited.length,
  idsMedia: [...resolved.values()].filter((r) => r.kind === 'media').length, idsNotFound: missing.length,
  seams: seams.length, answers: answers.length,
  agreementsActsHeld: agr.length, termsAsked: askCache.size, actsRead: D.acts.size,
};

// ---------- 5. markdown ----------
const sealedNote = (a) => (a.sealed ? ' sealed, unread' : '');
const ids = (acts) => acts.map((a) => s8(a.full || a.cited) + sealedNote(a)).join(', ');
const cite = (fld) => (fld.acts.length ? ` (${ids(fld.acts)})` : '') + ` *${fld.mark}*`;
const md = [];
const P = (...x) => md.push(...x);
const today = new Date().toISOString().slice(0, 10);
P('# The catalogue of Money, by problem, version 2 (DubPay W3-B2)', '',
  `*DubPay wave 3, session B2, ${today}. Nobody, allegedly. Version 2, after the cold check W3-C (\`_team/dubpay/wave-3/results/C/W3-C-catalogue-check.md\`), which DubPay accepts; each of its findings is answered in \`answers-to-w3c.md\` beside this file. Made by \`catalogue-money.mjs\` (beside this file; rerun: \`node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/B2/catalogue-money.mjs\`) from listing B and its reader, slice check A, the shared inventory and the hand-made \`catalogue-money-hand.mjs\`. Marks: **counted** (the script counted it), **traced** (an act's words show it), **inferred** (our reading). Every lean is **DubPay's (proposed)**; nothing here is decided, fixed or built. Ids are cut to 8 characters; \`catalogue-money.json\` holds them whole. Every in-force word is the core library's, through the kit, on the ${tally.agreementsActsHeld} Agreements acts held in the research copy: "as far as these acts show".*`, '',
  `> **DubPay's interests, in its own words.** ${fill(H.INTERESTS)}`, '',
  `> ${USED} "Prompted" marks what the hosts' prompts asked for: notice 7 (apps), notice 8 (attack the shower, with bounties; it named the straight split draft 4), the contest's remainder rule, and the day-five prompts ("something MOR has not been used for", "what the language could not say"). The players are machines: where a prompt asked for a pattern, the pattern is the prompt's. Recovery by vouching was not tested and nothing here is catalogued as tried with it.`, '');

// 1. plain words
P('## 1. In plain words', '', `${tally.problems} problems (counted). Each Money text of A's slice sits under exactly one (${tally.placedOnce} of ${tally.moneyKeysInSlice}, counted); ${tally.sectionSolutions} more solutions are parts of texts placed elsewhere, named as such.`, '');
for (const r of records) P(`- **${r.id}.** ${r.problem}. *Lean: ${r.lean.kind}.*`);
P('', "**DubPay's three most important leans (proposed):**", '');
H.TOP.forEach((id, i) => {
  const r = records.find((x) => x.id === id); const q = r.namedSignersAndBuyerByAssent;
  P(`${i + 1}. **${r.id}, ${r.lean.kind}.** ${r.lean.text} *${r.lean.caveat}*${q.turns ? ` *Turns on named signers and buyer by assent. Outcome 1: ${q.ifDefault} Outcome 2: ${q.ifNot}*` : ''} (rests on ${ids(r.lean.acts)}; *${r.lean.mark}*)`);
});
P('', `Leans: ${KINDS.map((k) => `${k} ${tally.leans[k]}`).join(', ')}; ${tally.turnOnRule3} turn on whether named signers and buyer by assent become the grammar's defaults (counted).`, '');

// 2. problem by problem
P('## 2. Problem by problem', '');
for (const r of records) {
  P(`### ${r.id}. ${r.problem}`, '', `*Category: ${r.category}.*`, '');
  const whole = r.solutions.filter((s) => !s.section);
  if (r.solutions.length) {
    if (whole.length) {
      P(`> ${USED}`, '', '| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others (used ≠ checked) | Built on it | Acts speaking of a fault | The core on every Terms naming it (in force, v2: all asked) | Prompted (slice A) |', '|---|---|---|---|---|---|---|---|---|---|');
      for (const s of whole) {
        const c = s.counts;
        P(`| ${c.name} | ${c.author} (${c.window}) | ${c.drafts.join('; ')} | ${s.task} | ${c.uses.acts}, ${c.uses.identities}, ${c.uses.windows} | ${c.byOthers ? `${c.byOthers.acts} acts, ${c.byOthers.identities} ids` : '—'} | ${c.builtOn} | ${c.faultActs} | ${c.core} | ${s.promptedInSlice} |`);
      }
      P('', '*Counts: counted, from ' + [...new Set(whole.map((s) => s.counts.source))].join(' and ') + '; the core column counted by this script (version 1 showed listing B\'s at most 3 asked).*', '');
    }
    for (const s of r.solutions) {
      P(s.section ? `**${s.sectionName}** *(a part of a text placed elsewhere; its counts are that text's, not repeated)*` : `**${s.counts.name}**`, '',
        `- Who holds money, who decides a release: ${s.holdsAndDecides.text}${cite(s.holdsAndDecides)}`,
        `- A remainder, a failed share: ${s.remainderFailedShare.text}${cite(s.remainderFailedShare)}`,
        `- A member who stops: ${s.memberWhoStops.text}${cite(s.memberWhoStops)}`,
        `- The way out if its service closes: ${s.wayOut.text}${cite(s.wayOut)}`,
        `- What it proves, and what is only someone's word: ${s.provesAndWord.text}${cite(s.provesAndWord)}`,
        `- Faults found, by whom, fixed or not: ${s.faults.text}${cite(s.faults)}`,
        `- Prompted, read: ${s.promptedRead}`);
      for (const b of s.builtOnIt) P(`- Built on it: **${b.counts.name}** (${b.counts.author}, ${b.counts.window}; uses ${b.counts.uses.acts} acts by ${b.counts.uses.identities} identities, counted; used ≠ checked; prompted: ${b.promptedInSlice}). ${b.note.text}${cite(b.note)}`);
      P('');
    }
  } else P('No Money text of the slice answers it (counted).', '');
  for (const c of r.candidates) P(`- Candidate: ${c.text}${cite(c)}`);
  for (const x of r.pointers) P(`- Pointer: ${x.text}${cite(x)}`);
  if (r.candidates.length || r.pointers.length) P('');
  P(`- **They agree on:** ${r.agree.text}${r.agree.acts.length ? cite(r.agree) : ''}`,
    `- **They differ, and why it matters:** ${r.differ.text}${r.differ.acts.length ? cite(r.differ) : ''}`,
    `- **Lean, DubPay's (proposed): ${r.lean.kind}.** ${r.lean.text} *${r.lean.caveat}* Rests on ${ids(r.lean.acts)}; *${r.lean.mark}*.`);
  const q = r.namedSignersAndBuyerByAssent;
  if (q.turns) P(`- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). ${q.text} *Outcome 1:* ${q.ifDefault} *Outcome 2:* ${q.ifNot} (${ids(q.acts)})`);
  else if (q.why) P(`- **Does not turn on named signers and buyer by assent:** ${q.why}`);
  P('');
}

// 3. MOR lead
P('## 3. For the MOR lead: what the language could not say, in Money\'s area', '',
  `*Adds to listing B's section (${L.forTheMorLead.length} items there, not repeated). Its section's shape is a day-five prompt's ("what the language could not say", in 19 acts, counted by B): prompted. Nothing here is decided.*`, '');
for (const x of morLead) P(`- ${x.text}${cite(x)}`);
P('', '- And the core question the order names: whether named signers and buyer by assent become the grammar\'s defaults. In Money\'s area it decides the in-force reading of the pots, tabs, circles, spots, listings and Spare Wheel\'s decisions above, and of the straight split\'s deals that name named signers; it does not decide the straight split\'s own threshold rule, which no verifier holds in either outcome. The groupings that turn on it are marked, each with its two outcomes.', '');

// 4. seams
P('## 4. Seam problems', '', '*Each sits on another Dub\'s area. Settled by seam act before filing; not settled here.*', '', '| Problem | Other Dub | What sits on their area | Acts |', '|---|---|---|---|');
for (const x of seams) P(`| ${x.problem} | ${x.with} | ${x.what} | ${ids(x.acts)} |`);
P('');

// 5. limits
P('## 5. Limits', '');
for (const x of H.LIMITS) P(`- ${fill(x)}`);
P(`- Recovery by vouching: the last report's rule D (M13) and the "taken identity" item (section 3) rest on the one case of an identity others spoke for, where thief, victim and vouchers were one window. Not catalogued as tried. No Money solution was tried with a recovered identity. One met a key change, which is rotation, not recovery: the escrow's release to a test maker whose bank orders are refused since its rotation could not be received and is held as owed (abdc12ea, a0c711ff) *traced*.`,
  `- Cited ids: ${tally.idsCited}, of which ${tally.idsActs} are acts held in the research copy (${tally.idsSealed} of them sealed, never opened: ${sealedCited.map(s8).join(', ') || 'none'}; where one is cited, "sealed, unread" stands beside it and the trace is the public act named with it) and ${tally.idsMedia} media hashes; ${tally.idsNotFound} not found${missing.length ? ': ' + missing.map((m) => m.cited).join(', ') : ''} (counted).`,
  `- Placement check: ${placementOk ? 'every' : 'NOT every'} Money key of slice A is under exactly one problem (${tally.placedOnce} of ${tally.moneyKeysInSlice}, counted).`,
  `- Acts read: ${tally.actsRead}, through listing B's reader (feeds, the homes' relay stores opened read-only, and the windows' kept acts). W3-C's own index held 14,413 (no relay stores); counts here are this script's.`, '');

// answers-to-w3c.md
const am = [];
am.push('# DubPay W3-B2: the answers to W3-C, finding by finding', '',
  `*DubPay wave 3, session B2, ${today}. Nobody, allegedly. Each row is one finding of the cold check W3-C (\`_team/dubpay/wave-3/results/C/W3-C-catalogue-check.md\`), the acts it rests on, and what version 2 of the catalogue (\`catalogue-money.md\` beside this file) changes, or why it changes nothing. Made by \`catalogue-money.mjs\` from the hand-made \`catalogue-money-hand.mjs\` (ANSWERS); every count in a row is the script's. Marks: **counted**, **traced**, **inferred**. Findings and problems only: nothing here is fixed or built, and no new text is written.*`, '',
  `> ${USED} The hosts' prompts (notices 7 and 8, the day-five prompt) asked for several of the patterns counted: "prompted".`, '',
  '| # | W3-C finding | Acts | What version 2 changes, or why nothing | Mark |', '|---|---|---|---|---|');
answers.forEach((x, i) => am.push(`| ${i + 1} | ${x.finding} | ${ids(x.acts)} | ${x.change} | ${x.mark} |`));
am.push('', `*${answers.length} findings answered (counted).*`, '');

const out = {
  made: 'DubPay W3-B2, the catalogue of Money by problem, version 2, after the cold check W3-C. Counts computed by catalogue-money.mjs; problems, fields, leans and answers hand-made in catalogue-money-hand.mjs. Every lean is DubPay\'s (proposed).',
  author: 'Nobody, allegedly', caveat: USED, interests: fill(H.INTERESTS),
  rules: {
    usedIsNotChecked: USED,
    prompted: 'Notices 7 and 8, the contest\'s remainder rule and the day-five prompts asked for several patterns counted; each lean carries lean.caveat with slice A\'s prompted marks.',
    vouching: 'Recovery by vouching was not tested; no Money solution here is catalogued as tried with it.',
    namedSignersAndBuyerByAssent: 'Groupings that turn on it carry namedSignersAndBuyerByAssent.turns = true, with both outcomes; the others say why not.',
  },
  sources: { listingB: 'dubpay/wave-2/results/B/listing-money.json', sliceA: 'dubpay/wave-3/results/A/slice-check.json', inventory: 'dubweb/wave-3/inventory/inventory-all.json', check: 'dubpay/wave-3/results/C/W3-C-catalogue-check.md', actsRead: D.acts.size },
  tally, checkCounts: K, coreBySolution: Object.fromEntries([...coreByKey].map(([k, c]) => [k, { terms: c.terms, tally: c.tally, rows: c.rows.map((r) => ({ ...r, terms: r.terms, parties: r.parties })) }])),
  placement, placementOk, problems: records, seams, morLead, answers, top: H.TOP, missing, sealedCited,
};
writeFileSync(join(HERE, 'catalogue-money.json'), JSON.stringify(out, null, 1) + '\n');
writeFileSync(join(HERE, 'catalogue-money.md'), md.join('\n'));
writeFileSync(join(HERE, 'answers-to-w3c.md'), am.join('\n'));
console.log(JSON.stringify(tally));
console.log(JSON.stringify(Object.fromEntries(Object.entries(K).filter(([k]) => !/List|Rows|Ids|Labels/.test(k)))));
if (!placementOk) console.log('placement:', placement.filter((x) => x.problems.length !== 1));
if (missing.length) console.log('missing:', missing);
if (tally.leansOfOtherKind.length) console.log('leans of an unknown kind:', tally.leansOfOtherKind);
