// DubPay W3-C: the counts behind the check of the catalogue's leans (review only).
// Reads, read only: the research copy (_research/windows/*/acts/*.mor and _research/feeds/*/feed-after-*.cbor),
// DubPay W3-B's catalogue-money.json (only for the draft ids it lists), and the kit copy in
// _team/dubpay/wave-2/kit/ (the core library, through its WebAssembly binding).
// Writes, only beside itself: check-w3c-counts.json. Signs nothing, posts nothing, pays nothing, reads no key.
// Run: node check-w3c.mjs   (MOR_ROUND defaults to ~/Documents/mor-round-2)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROUND = process.env.MOR_ROUND || join(process.env.HOME, 'Documents/mor-round-2');
const R = join(ROUND, '_research');
const { mor, plain } = await import(join(ROUND, '_team/dubpay/wave-2/kit/lib/kit.mjs'));
const CAT = JSON.parse(readFileSync(join(ROUND, '_team/dubpay/wave-3/results/B/catalogue-money.json'), 'utf8'));
const AGR = 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c'; // Agreements draft 25
const s8 = (x) => String(x).slice(0, 8);

// ---------- 1. every act in the research copy ----------
const acts = new Map();
function add(bytes, where) {
  let d; try { d = plain(mor.describeAct(bytes)); } catch { return; }
  if (acts.has(d.id)) { acts.get(d.id).where.add(where); return; }
  let body = null; try { body = plain(mor.cborDecode(Buffer.from(d.payload ?? '', 'hex'))); } catch {}
  const t = body?.map?.find(([k]) => k === 0)?.[1];
  acts.set(d.id, { bytes, signer: d.signer, spec: d.spec, type: d.type, public: d.public, body, text: typeof t === 'string' ? t : null, where: new Set([where]) });
}
for (const w of readdirSync(join(R, 'windows'))) {
  const dir = join(R, 'windows', w, 'acts'); if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) if (f.endsWith('.mor')) add(readFileSync(join(dir, f)), 'window:' + w);
}
for (const h of readdirSync(join(R, 'feeds'))) for (const f of readdirSync(join(R, 'feeds', h))) {
  if (!f.startsWith('feed-after')) continue;
  let p; try { p = plain(mor.cborDecode(readFileSync(join(R, 'feeds', h, f)))); } catch { continue; }
  for (const e of p.map?.find(([k]) => k === 0)?.[1] || []) {
    const hx = Array.isArray(e) ? e.find((x) => typeof x === 'string' && x.length > 100) : null;
    if (hx) add(Buffer.from(hx, 'hex'), 'feed:' + h);
  }
}
const ids = [...acts.keys()];
const full = (p) => ids.filter((i) => i.startsWith(p));
const blob = (a) => JSON.stringify(a.body ?? '') + (a.text ?? '');

// ---------- 2. the catalogue's 89 cited ids: found, and sealed or public ----------
const cited = [...new Set(JSON.stringify(CAT).match(/"cited":\s*"[0-9a-f]+"/g).map((s) => s.match(/[0-9a-f]+(?="$)/)[0]))];
const citedRes = cited.map((c) => { const m = full(c); const a = m.length === 1 ? acts.get(m[0]) : null; return { id: s8(c), found: m.length === 1, public: a ? a.public !== false && a.body !== null : null }; });

// ---------- 3. per solution, every Terms act naming one of its drafts (act id or spec hash), and the core's in-force answer ----------
const NS = ['ed7e3956', 'd8a19d7d'];  // DubLaw's named signers, draft 1: spec, act
const BBA = ['d47b4322', '735c3cf8']; // DubLaw's buyer by assent, draft 1: spec, act
const sol = [];
for (const p of CAT.problems) for (const s of p.solutions) {
  const pre = s.counts.drafts.flatMap((d) => d.match(/[0-9a-f]{8}/g) || []);
  sol.push({ problem: p.id, key: s.key, name: s.counts.name, pre, catalogueKit: s.counts.kit });
}
const agr = [...acts].filter(([, a]) => a.spec === AGR);
const held = agr.map(([, a]) => ({ bytes: Uint8Array.from(a.bytes) }));
const terms = agr.filter(([, a]) => a.type === 0);
const inForce = new Map();
const ask = (id) => {
  if (!inForce.has(id)) { let r; try { r = JSON.parse(mor.agreementsNewAsk({ acts: held, ask: 'in_force', args: [id] }))[0]; } catch (e) { r = { word: 'error', says: String(e.message || e) }; } inForce.set(id, r); }
  return inForce.get(id);
};
const perSolution = sol.map((s) => {
  const named = terms.filter(([, a]) => { const h = blob(a).match(/[0-9a-f]{64}/g) || []; return h.some((x) => s.pre.includes(x.slice(0, 8))); });
  const rows = named.map(([id, a]) => {
    const r = ask(id); const b = blob(a);
    const parties = a.body?.map?.find(([k]) => k === 2)?.[1] || [];
    return {
      terms: s8(id), signer: s8(a.signer), word: r.word, rule: r.rule,
      missingCmip: (r.says || '').match(/cMIP of K2 \(([0-9a-f]{8})/)?.[1] || null,
      draftsNamed: [...new Set((b.match(/[0-9a-f]{64}/g) || []).map(s8).filter((x) => s.pre.includes(x)))],
      namedSigners: NS.some((x) => b.includes(x)), buyerByAssent: BBA.some((x) => b.includes(x)),
      hasInForceField: !!a.body?.map?.some(([k]) => k === 6),
      partyKinds: parties.map((q) => (Array.isArray(q) ? q[0] : null)),
      test: (b.match(/"test":"([^"]*)"/) || [])[1] || null,
    };
  });
  const tally = {}; for (const r of rows) { const k = `${r.word}${r.missingCmip ? ' (no ' + r.missingCmip + ')' : ''}`; tally[k] = (tally[k] || 0) + 1; }
  return { ...s, termsNaming: rows.length, tally, turnsOnRule3InActs: rows.some((r) => r.namedSigners || r.buyerByAssent), rows };
});

// ---------- 4. targeted counts ----------
// (a) acts other than its own announcement naming the common pot draft 2 (act 73bece9f / spec f608f7fa); pot lines by draft
const potD2 = ids.filter((i) => !i.startsWith('73bece9f') && /f608f7fa|73bece9f/.test(blob(acts.get(i)))).map((i) => ({ id: s8(i), signer: s8(acts.get(i).signer), start: (acts.get(i).text || '').slice(0, 60) }));
const potLines = agr.filter(([, a]) => a.type === 1).map(([id, a]) => ({ id, b: blob(a), signer: a.signer }));
const potLinesD1 = potLines.filter((x) => /e91f72f5|bba5c058/.test(x.b)).length;
const potLinesD2 = potLines.filter((x) => /f608f7fa|73bece9f/.test(x.b)).length;
// (b) the escrow's vows: Terms naming any escrow draft, their test label, and acts that speak of money paid into them
const escrow = perSolution.find((s) => s.key === 'escrow' || /escrow/i.test(s.name));
const vowIds = escrow ? escrow.rows.map((r) => r.terms) : [];
const vowTalk = ids.filter((i) => { const a = acts.get(i); return a.text && vowIds.some((v) => a.text.includes(v)) && /paid|refund|released|contest/i.test(a.text); }).map((i) => ({ id: s8(i), signer: s8(acts.get(i).signer) }));
// (c) Kept Word's charter Terms: does it name the escrow?
const kw = full('825b834d')[0]; const kwNamesEscrow = kw ? escrow.pre.some((p) => blob(acts.get(kw)).includes(p)) : null;
// (d) report-block acts by signer
const rb = {}; for (const a of acts.values()) if (String(a.spec).startsWith('7b65c60f')) rb[s8(a.signer)] = (rb[s8(a.signer)] || 0) + 1;

// (e) the core's in-force answer on Terms read beside the problems (the circles, Spare Wheel, Kept Word, the home bond, the lending shelf's listing)
const extra = ['caede5b5', 'b059f5d1', '6b2736be', '73db2ea4', '825b834d', 'be5f5d6c', 'e1975bda'].map((p) => {
  const id = full(p)[0]; const b = blob(acts.get(id)); const r = ask(id);
  return { terms: p, word: r.word, namedSigners: NS.some((x) => b.includes(x)), buyerByAssent: BBA.some((x) => b.includes(x)), says: (r.says || '').slice(0, 140) };
});
// (f) the used-is-not-checked line in each problem section of B's catalogue
const md = readFileSync(join(ROUND, '_team/dubpay/wave-3/results/B/catalogue-money.md'), 'utf8');
const caveatBySection = Object.fromEntries(md.split(/^### /m).slice(1).filter((x) => /^M\d+\./.test(x)).map((x) => [x.match(/^(M\d+)/)[1], x.split(/^## /m)[0].includes('Used is not checked')]));

const out = {
  made: 'DubPay W3-C check, counts only. Every in-force word is the core library\'s, through the kit, on the acts held in the research copy; "shown" means as far as these acts show.',
  author: 'Nobody, allegedly',
  actsIndexed: acts.size,
  cited: { total: cited.length, found: citedRes.filter((x) => x.found).length, sealed: citedRes.filter((x) => x.public === false).map((x) => x.id) },
  perSolution: perSolution.map(({ pre, ...x }) => x),
  potDraft2NamedBy: potD2, potLinesNamingDraft1: potLinesD1, potLinesNamingDraft2: potLinesD2,
  escrowVowActsSpeakingOfMoney: vowTalk.length, escrowVowTalkSigners: [...new Set(vowTalk.map((x) => x.signer))],
  keptWordTermsNameEscrow: kwNamesEscrow,
  reportBlockActsBySigner: rb,
  otherTerms: extra,
  caveatBySection,
};
writeFileSync(join(HERE, 'check-w3c-counts.json'), JSON.stringify(out, null, 1));
console.log('acts indexed', out.actsIndexed, '| cited', out.cited.found + '/' + out.cited.total, 'found; sealed:', out.cited.sealed.join(', '));
for (const s of out.perSolution) console.log(`${s.problem} ${s.name}: ${s.termsNaming} Terms; core: ${JSON.stringify(s.tally)}; catalogue's kit column: ${s.catalogueKit}; names named signers or buyer by assent: ${s.turnsOnRule3InActs}`);
console.log('pot draft 2 named by', potD2.length, 'acts:', potD2.map((x) => x.id + '/' + x.signer).join(' '), '| pot lines naming draft 1:', potLinesD1, 'draft 2:', potLinesD2);
console.log('escrow vows:', escrow?.rows.map((r) => `${r.terms} "${r.test}"`).join('; '));
console.log('acts speaking of money in those vows:', vowTalk.length, 'by', out.escrowVowTalkSigners.join(', '));
for (const e of extra) console.log('Terms', e.terms, e.word, 'named signers', e.namedSigners, 'buyer by assent', e.buyerByAssent);
console.log('caveat in each problem section:', JSON.stringify(caveatBySection));
console.log('Kept Word charter Terms name the escrow:', kwNamesEscrow, '| report block acts by signer:', JSON.stringify(rb));
