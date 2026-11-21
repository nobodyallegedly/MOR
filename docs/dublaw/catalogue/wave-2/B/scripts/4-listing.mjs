// DubLaw wave 2, session B. Step 4: the listing, one entry per fingerprint, every count by code.
// Usage: node 4-listing.mjs RESEARCH_DIR KIT_DIR OUT_DIR   (after steps 1 to 3)
// Writes OUT_DIR/listing-agreements.json and OUT_DIR/windows-of-identities.json.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
const [R, KIT, OUT] = process.argv.slice(2);
const { mor, SPECS } = await import(join(KIT, 'lib/core.mjs'));
const AG = mor.agreementsNewSpecs();
const acts = readFileSync(join(OUT, 'acts.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const byId = new Map(acts.map((a) => [a.id, a]));
const { byHash, texts } = JSON.parse(readFileSync(join(OUT, 'texts.json'), 'utf8'));
const named = new Map(JSON.parse(readFileSync(join(OUT, 'named.json'), 'utf8')).map((n) => [n.hash, n]));
const sha = (s) => createHash('sha256').update(s).digest('hex');
const isTerms = (a) => a?.specName === 'agreements' && a.type === 0;
const isSt = (a) => a?.specName === 'agreements' && a.type === 1;
const textOf = (a) => (a?.payload && typeof a.payload['0'] === 'string' ? a.payload['0'] : null);

// ---- What the kit holds: its stub cMIPs (one per task, core/src/agreements_new/grammar/stubs.rs, built into the kit's
// core at 74739bb7) and its control cMIP (agreementsControlCmip). Every other cMIP the kit answers "unchecked" (G9).
const STUBS = ['K1 body: parts and a delegation, from its parameters', 'K2 in force: the names its parameters list, or a count of names', 'K3 power: yes for the signers its parameters list', 'K4 update condition: k of the original\'s signers, never, or always', 'K5 spot: the fillings its parameters list', 'K6 control: always yes', 'K7 kind: a meaning from its parameters', 'K8 data: yes for the readers its parameters list'];
const KIT_HOLDS = new Map(STUBS.map((s) => [sha(`agreements-new/stub cMIP (for tests only): ${s}`), 'stub: ' + s]));
KIT_HOLDS.set(mor.agreementsControlCmip(), 'the kit\'s control cMIP (agreementsControlCmip)');

// ---- Windows of identities: named in a window's own reports (full 64 characters, or the 8…4 short form), and the tray
// (window) that carried the identity's acts, from the postman's log.
const winNames = readdirSync(join(R, 'windows')).filter((w) => existsSync(join(R, 'windows', w, 'reports')));
const reportText = {};
for (const w of winNames) reportText[w] = readdirSync(join(R, 'windows', w, 'reports')).filter((f) => f.endsWith('.md')).map((f) => ({ f, t: readFileSync(join(R, 'windows', w, 'reports', f), 'utf8') }));
const mentions = {}; // identity -> Set(windows)
const signers = new Set(acts.map((a) => a.signer).filter(Boolean));
const shortForms = new Map(); // 'abcd1234…wxyz' -> identity
for (const s of signers) shortForms.set(s.slice(0, 8) + s.slice(-4), s);
for (const w of winNames) for (const { t } of reportText[w]) {
  for (const m of t.matchAll(/\b[0-9a-f]{64}\b/g)) if (signers.has(m[0])) (mentions[m[0]] ??= new Set()).add(w);
  for (const m of t.matchAll(/\b([0-9a-f]{8})(?:…|\.\.\.)([0-9a-f]{4})\b/g)) { const s = shortForms.get(m[1] + m[2]); if (s) (mentions[s] ??= new Set()).add(w); }
}
const trayCount = {};
for (const a of acts) if (a.signer && a.carried?.tray) { const t = (trayCount[a.signer] ??= {}); t[a.carried.tray] = (t[a.carried.tray] ?? 0) + 1; }
const windowOf = {};
for (const s of signers) {
  const trays = Object.entries(trayCount[s] ?? {}).sort((x, y) => y[1] - x[1]);
  const named_ = [...(mentions[s] ?? [])];
  let w = null, ground = null;
  if (trays.length && named_.includes(trays[0][0])) { w = trays[0][0]; ground = 'named in its own reports, and its acts carried from its tray'; }
  else if (trays.length) { w = trays[0][0]; ground = 'its acts carried from this tray (not named in that window\'s reports)'; }
  else if (named_.length === 1) { w = named_[0]; ground = 'named in this window\'s reports only (no act carried)'; }
  windowOf[s] = { window: w, ground, trays: Object.fromEntries(trays), namedInReportsOf: named_ };
}
writeFileSync(join(OUT, 'windows-of-identities.json'), JSON.stringify(windowOf));

// ---- Candidates
// (a) in a socket of Terms or as a Statement's K7 kind; (b) the spec of acts that are not the core layers'; (c) held
// texts that read as a cMIP or a Module by their first line; (d) held texts whose spec hash a later act names.
const CORE = new Set([...Object.values(SPECS), AG.terms.spec, AG.report.spec]);
const isCmipText = (t) => {
  const first = t.split('\n').find((l) => l.trim()) ?? '';
  return /^#?\s*(cMIP\b|Stall cMIP\b|Stall split, cMIP\b|Counterparty plain-words body\b)/i.test(first) || /\bA Module\b/.test(t.slice(0, 600)) || /^#?\s*A room let, in plain words.*Template, draft \d+/.test(first);
};
const cand = new Map(); // key fingerprint -> entry
const textKeyToCand = new Map();
const specOfText = (a) => { try { return mor.decodeSpec(mor.cborEncode(new Map([[0, 0], [1, Uint8Array.from(Buffer.from(a.signer, 'hex'))], [9, textOf(a)]]))).hash; } catch { return null; } };
function entry(fp) {
  if (!cand.has(fp)) cand.set(fp, { fingerprint: fp, why: [] });
  return cand.get(fp);
}
for (const [fp, n] of named) {
  if (Object.keys(n.sockets).length || n.k7Statements.length) entry(fp).why.push('named in a socket');
  if (n.actsUnderSpec.length && !CORE.has(fp)) entry(fp).why.push('acts signed under it as their spec');
}
for (const a of acts) {
  const t = textOf(a);
  if (a.specName !== 'text' || a.type !== 0 || !t || !isCmipText(t)) continue;
  // keyed by the fingerprint a socket names it by, where one does; else by its spec hash (kind 0, its signer creator)
  const hits = (named.size ? [...(byHash[a.id] ? [a.id] : [])] : []).filter((fp) => cand.has(fp));
  const sp = specOfText(a);
  const key = hits[0] ?? sp;
  entry(key).why.push('a text that reads as a cMIP or a Module');
}
for (const [fp, n] of named) {
  if (cand.has(fp)) continue;
  const spec = (n.held ?? []).filter((e) => e.how === 'spec' && e.text.startsWith('act:'));
  if (!spec.length) continue;
  const later = n.namedBy.filter((id) => byId.get(id) && byId.get(spec[0].text.slice(4)) && byId.get(id).order > byId.get(spec[0].text.slice(4)).order);
  if (later.length) entry(fp).why.push('a held text whose spec hash a later act names');
}
// The held text of each candidate: act texts first (spec, act id, sha256, work, then stated in its own text), else files.
const statedIn = {};
for (const a of acts) { const t = textOf(a); if (!t || a.specName !== 'text') continue; for (const m of t.matchAll(/(fingerprint|spec hash)[\s\S]{0,240}?\b([0-9a-f]{64})\b/gi)) (statedIn[m[2]] ??= []).push(a.id); }
for (const [fp, e] of cand) {
  const held = (byHash[fp] ?? []).slice();
  const pick = (how, src) => held.filter((x) => x.how === how && x.text.startsWith(src));
  let h = pick('spec', 'act:')[0] ?? pick('act', 'act:')[0] ?? pick('sha256', 'act:')[0] ?? pick('work', 'act:')[0] ?? held.find((x) => x.how.startsWith('sha256 of its opening') && x.text.startsWith('act:'));
  let how = h?.how;
  if (!h && statedIn[fp]) { const own = statedIn[fp].map((id) => byId.get(id)).filter((a) => isCmipText(textOf(a))); if (own.length) { h = { text: 'act:' + own[0].id }; how = 'stated as its own fingerprint in its text'; } }
  if (!h) { h = pick('spec', 'file:')[0] ?? pick('sha256', 'file:')[0] ?? pick('work', 'file:')[0]; how = h ? h.how + ' (a file held in _research)' : null; }
  e.heldAs = how ?? null;
  e.textKey = h?.text ?? null;
  if (h) textKeyToCand.set(h.text, fp);
}
// merge: a text keyed twice (its spec hash and another fingerprint) is one entry under the fingerprint used in sockets
const result = [];
const ordered = [...acts].sort((x, y) => x.order - y.order);
const W = (s) => windowOf[s]?.window ?? null;
function prefixes(t) { const s = new Set(); for (const m of t.matchAll(/\b([0-9a-f]{8})[0-9a-f]*/g)) s.add(m[1]); return s; }
const allTextCands = [...cand.values()].filter((e) => e.textKey?.startsWith('act:'));

// hosts' counts and rulings: which fingerprints were applied by hand, or named
const hostFiles = ['count-rerun.md', 'contest/count-day3.md', 'contest/result-day3.md', 'contest/result-day3-fix.md', 'contest/rerun-ruling-1.md', 'contest/rerun-ruling-2.md', 'contest/readings-1.md', 'contest/readings-2.md', ...readdirSync(join(R, 'hosts')).filter((f) => /^notice-\d+\.md$/.test(f))].filter((f) => existsSync(join(R, 'hosts', f)));
const hostText = Object.fromEntries(hostFiles.map((f) => [f, readFileSync(join(R, 'hosts', f), 'utf8')]));
const byHandSection = (t) => { const out = []; const re = /(applied by hand|Applied by hand)[\s\S]*?(?=\n## |\n\d+\. \*\*[A-Z]|$)/g; for (const m of t.matchAll(re)) out.push(m[0]); return out.join('\n'); };
const handRerun = byHandSection(hostText['count-rerun.md'] ?? '');
const handDay3 = byHandSection(hostText['contest/count-day3.md'] ?? '');

for (const [fp, e] of cand) {
  const n = named.get(fp) ?? { sockets: {}, k7Statements: [], actsUnderSpec: [], namedBy: [] };
  const tAct = e.textKey?.startsWith('act:') ? byId.get(e.textKey.slice(4)) : null;
  const t = tAct ? textOf(tAct) : null;
  const tf = e.textKey ? texts[e.textKey] : null;
  const specHash = tAct ? specOfText(tAct) : null;
  // use
  const termsIds = [...new Set(Object.values(n.sockets).flat())];
  const termsSet = new Set(termsIds);
  const assents = acts.filter((a) => isSt(a) && a.payload?.['2'] === 0 && termsSet.has(a.payload['1']?.h));
  const k7 = n.k7Statements ?? [];
  const under = CORE.has(fp) ? [] : n.actsUnderSpec ?? [];
  const using = [...termsIds, ...assents.map((a) => a.id), ...k7, ...under].map((id) => byId.get(id)).filter(Boolean);
  const sgn = new Set(using.map((a) => a.signer).filter(Boolean));
  const wins = new Set([...sgn].map(W).filter(Boolean));
  const ord = using.sort((x, y) => x.order - y.order);
  const at = (a) => a && { act: a.id, order: a.order, firstCarried: a.carried?.first ?? null, home: a.sources.find((s) => !s.src.startsWith('window:'))?.src ?? null, position: a.sources.find((s) => !s.src.startsWith('window:'))?.pos ?? null };
  // built on: any act naming it in full (payload, refs or text), other than its own use; and cMIP texts citing it by an 8-character prefix
  const useIds = new Set(using.map((a) => a.id));
  const fullNamers = (n.namedBy ?? []).filter((id) => !useIds.has(id) && id !== tAct?.id).map((id) => byId.get(id)).filter(Boolean);
  const pfx = new Set([fp.slice(0, 8), specHash?.slice(0, 8), tAct?.id.slice(0, 8)].filter(Boolean));
  const citedBy = allTextCands.filter((o) => o.fingerprint !== fp && o.textKey !== e.textKey).filter((o) => { const ot = textOf(byId.get(o.textKey.slice(4))); return ot && [...pfx].some((p) => ot.includes(p)); }).map((o) => o.textKey.slice(4));
  // earlier drafts it names (8-character prefixes in its text matching another candidate's text act or fingerprint)
  let names = [], replaces = [];
  if (t) {
    const ps = prefixes(t);
    for (const o of allTextCands) {
      if (o.textKey === e.textKey) continue;
      const oa = byId.get(o.textKey.slice(4));
      const ofp = [o.fingerprint.slice(0, 8), oa.id.slice(0, 8), specOfText(oa)?.slice(0, 8)];
      if (ofp.some((p) => ps.has(p))) {
        names.push(oa.id);
        if (new RegExp(`[Rr]eplac[^.]{0,200}(${ofp.join('|')})`).test(t)) replaces.push(oa.id);
      }
    }
  }
  // same title, same author, lower draft: earlier drafts (by title)
  const stem = (s) => (s ?? '').toLowerCase().replace(/^#?\s*/, '').replace(/,?\s*draft\s*\d+.*$/, '').replace(/\(.*$/, '').replace(/[:,]\s*$/, '').trim();
  const sameLine = tf ? allTextCands.filter((o) => o.textKey !== e.textKey && texts[o.textKey]?.signer === tf.signer && stem(texts[o.textKey]?.title) === stem(tf.title) && (texts[o.textKey]?.draft ?? 0) < (tf.draft ?? 0)).map((o) => ({ act: o.textKey.slice(4), draft: texts[o.textKey].draft })) : [];
  // kit
  const p8 = [...pfx];
  const kit = KIT_HOLDS.get(fp) ? { word: 'kit holds it', ground: KIT_HOLDS.get(fp) } : null;
  const hand = [];
  if (p8.some((p) => handRerun.includes(p))) hand.push('applied by hand in the rerun count (count-rerun.md, "Applied by hand, kit lacking")');
  if (p8.some((p) => handDay3.includes(p))) hand.push('applied by hand in the day-three count (contest/count-day3.md)');
  const inHost = Object.entries(hostText).filter(([f, x]) => p8.some((p) => x.includes(p))).map(([f]) => f);
  const kitWord = kit ? kit : hand.length ? { word: 'applied by hand', ground: hand.join('; ') } : { word: 'kit lacks it (answers unchecked)', ground: 'not among the kit\'s stub cMIPs nor its control cMIP; not applied by hand in either count' };
  // windows' reports naming it (full or 8-character prefix of the fingerprint, its spec hash or its text act)
  const reportWins = winNames.filter((w) => reportText[w].some(({ t: rt }) => p8.some((p) => rt.includes(p))));
  result.push({
    fingerprint: fp,
    namedAs: fp === specHash ? 'spec hash' : fp === tAct?.id ? 'act id of its text (not a spec hash)' : e.heldAs?.startsWith('stated') ? 'a fingerprint stated in its own text' : e.heldAs ? e.heldAs : 'not held',
    specHash: specHash ?? (e.heldAs ? null : fp),
    why: [...new Set(e.why)],
    held: e.textKey ? (e.textKey.startsWith('act:') ? 'text act' : 'file') : 'not held',
    heldAs: e.heldAs,
    title: tf?.title ?? null,
    draft: tf?.draft ?? null,
    textBytes: tf?.bytes ?? null,
    author: tAct?.signer ?? null,
    authorWindow: tAct ? W(tAct.signer) : null,
    authorWindowGround: tAct ? windowOf[tAct.signer]?.ground ?? null : null,
    publishedBy: tAct?.id ?? null,
    publishedAt: at(tAct),
    file: tf?.file ?? null,
    namesHeldTexts: names,
    replaces,
    earlierDraftsSameTitle: sameLine,
    sockets: Object.fromEntries(Object.entries(n.sockets).map(([k, v]) => [k, [...new Set(v)].length])),
    k7Statements: k7.length,
    actsUnderIt: under.length,
    use: { terms: termsIds.length, assents: assents.length, k7Statements: k7.length, actsUnderSpec: under.length, signers: sgn.size, windows: [...wins].sort(), first: at(ord[0]), last: at(ord[ord.length - 1]) },
    builtOn: { actsNamingInFull: fullNamers.length, termsNamingInFull: fullNamers.filter(isTerms).map((a) => a.id), textsNamingInFull: fullNamers.filter((a) => a.specName === 'text').map((a) => a.id), cmipTextsCitingByPrefix: citedBy },
    kit: kitWord,
    namedInHostsTexts: inHost,
    namedInReportsOf: reportWins,
  });
}

// ---- Category (inferred: DubLaw's five, or another area), from the text's title, by this table, first match wins;
// where no title is held, from the socket it is named in. Written out in listing-agreements.md.
const CATS = [
  [/escrow|split|\bpot\b|\btab\b|money decision|period payment|pass-on by the receiver|home bond|lending purse|invoice|loan/, 'other: DubPay'],
  [/public flow|anchoring|head statements|open books|warning notice|lineup vote|signed credits|line records|lodging|place'?s record/, 'other: DubWeb'],
  [/arbiter|award|proven claim|findings held in trust|contest|resolve|mediat|refusal/, '3'],
  [/way out|handover check|succession|leaving|carried/, '5'],
  [/consent to be recorded|room let|consign|delivery receipt|custody receipt|lending shelf|held for you|plain-words body|plain words, draft|hours of care/, '4'],
  [/shower work|shares nobody may rewrite|seller may change|guild|co-?op|collective|update condition/, '2'],
  [/named signers|buyer by assent|buyer's spot|in force|quorum|guide spot|client that served|agent|sealed assent|power/, '1'],
];
const SOCKCAT = { 'K2 in_force': '1', 'K3 power rule': '1', 'K5 spot': '1', 'K4 condition': '2', 'K1 body': null, 'K6 control': 'other: DubPay', 'K8 data': 'other: DubWeb' };
function category(r) {
  const t = (r.title ?? '').toLowerCase();
  if (t) for (const [re, c] of CATS) if (re.test(t)) return { category: c, ground: 'inferred, from its title by the table in 4-listing.mjs' };
  const main = Object.entries(r.sockets).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (main && SOCKCAT[main]) return { category: SOCKCAT[main], ground: 'inferred, from the socket it is most named in (' + main + '); no title held' };
  if (r.actsUnderIt) return { category: 'other: DubWeb', ground: 'inferred: acts are signed under it as their spec (records, notices), no title held' };
  return { category: 'unplaced', ground: 'no title held and no socket that says' };
}
// ---- Names players used in their reports: "cMIP NAME, draft N" and "NAME draft N" phrases, matched to an entry by
// its title's stem and draft number; counted by windows.
const norm = (s) => (s ?? '').toLowerCase().replace(/^#?\s*/, '').replace(/^(stall )?cmip:?\s*/, '').replace(/^the\s+/, '').replace(/\(.*$/, '').replace(/,?\s*draft\s*\d+.*$/, '').replace(/[^a-z' -]/g, '').replace(/\s+/g, ' ').trim();
const reportNames = {}; // 'stem|draft' -> Set(windows)
for (const w of winNames) for (const { t: rt } of reportText[w]) for (const m of rt.matchAll(/(?:cMIP:?\s+)?(?:the\s+)?([A-Za-z][A-Za-z' -]{2,48}?),?\s+drafts?\s+(\d+)/g)) {
  const k = norm(m[1]) + '|' + m[2];
  if (norm(m[1]).length < 3) continue;
  (reportNames[k] ??= new Set()).add(w);
}
const matchedNames = new Set();
for (const r of result) {
  if (!r.title) { r.reportNames = { names: [], windows: [] }; continue; }
  const k = norm(r.title) + '|' + (r.draft ?? '');
  const st = k.split('|')[0];
  const owner = (r.authorWindow ?? '').replace(/-.*/, '');
  // a name matches: the same stem and draft; or a longer name ending in the stem, where the stem has 10 characters or
  // more, or the name also carries the author's window name (short stems such as "split" are shared by several authors)
  const hits = Object.entries(reportNames).filter(([n]) => { const [ns, nd] = n.split('|'); if (nd !== String(r.draft)) return false; if (ns === st) return true; if (!ns.endsWith(' ' + st)) return false; return st.length >= 10 || (owner && ns.includes(owner)); });
  const ws = new Set(hits.flatMap(([, w]) => [...w]));
  r.reportNames = { names: hits.sort((a, b) => b[1].size - a[1].size).slice(0, 4).map(([n]) => n.replace('|', ', draft ')), windows: [...ws].sort() };
  hits.forEach(([n]) => matchedNames.add(n));
}
for (const r of result) Object.assign(r, category(r));
// one text named by two fingerprints
const byText = {};
for (const r of result) if (r.publishedBy) (byText[r.publishedBy] ??= []).push(r.fingerprint);
for (const r of result) r.sameTextAs = r.publishedBy ? byText[r.publishedBy].filter((f) => f !== r.fingerprint) : [];
for (const r of result) if (r.held === 'not held') { const n = named.get(r.fingerprint); r.namedByActs = [...new Set([...Object.values(n?.sockets ?? {}).flat(), ...(n?.k7Statements ?? [])])]; r.signersUnderIt = [...new Set((n?.actsUnderSpec ?? []).map((id) => byId.get(id)?.signer).filter(Boolean))]; }
const unmatchedNames = Object.entries(reportNames).filter(([n, ws]) => !matchedNames.has(n) && ws.size >= 2 && /split|work|flow|signer|assent|escrow|award|claim|receipt|vote|anchor|shares|force|quorum|pot|tab|credits|notice|consent|shelf|books|spot|decision|payment|trust|bond|way out|held|care|records|statement|let|body/.test(n)).map(([n, ws]) => ({ name: n.replace('|', ', draft '), windows: ws.size })).sort((a, b) => b.windows - a.windows);
writeFileSync(join(OUT, 'report-names-unmatched.json'), JSON.stringify(unmatchedNames, null, 1));

result.sort((a, b) => (b.use.terms + b.use.k7Statements + b.use.actsUnderSpec) - (a.use.terms + a.use.k7Statements + a.use.actsUnderSpec) || (a.title ?? '~').localeCompare(b.title ?? '~') || (a.draft ?? 0) - (b.draft ?? 0));
writeFileSync(join(OUT, 'listing-raw.json'), JSON.stringify(result, null, 1));
console.log({ entries: result.length, held: result.filter((r) => r.held !== 'not held').length, inSocket: result.filter((r) => r.use.terms || r.use.k7Statements).length });
