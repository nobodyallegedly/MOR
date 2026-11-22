#!/usr/bin/env node
// check-claims.mjs: DubLaw wave 3, session C (Nobody, allegedly). Four claims DubLaw has relied on, checked from the
// acts and the code, with this session's index (index.mjs). Read-only.
//
//   node check-claims.mjs RESEARCH_DIR KIT_DIR INDEX_JSON B_LISTING_JSON OUT_JSON [MOR_REPO_DIR]
//   (MOR_REPO_DIR: a clone of the MOR repository holding commit 5d73191b, from which build/ says the clients were copied;
//   used read-only, by git show, to read the two modules the clients import from outside build/.)
//
// 1. The kit checked none of the agreement cMIPs (B, summary): (a) every fingerprint named in a socket, as a power's
//    kind or as a Statement's K7 kind, in the round's Terms and Statements, plus every fingerprint of B's 115
//    entries, searched in every file of the kit, as hex text and as its 32 raw bytes; (b) the kit's own verifier
//    (agreements ask in_force) asked of one Terms act for each distinct K2 cMIP, with every act of its agreement
//    that a window kept in acts/.
// 2. DubLaw's award cMIP (spec 7d42b01c…9130) and its draft 1 (ebcc09e3…c6b4): the full hashes found by prefix and
//    suffix among every 64-hex string in the round's texts and B's listing; then acts signed under each as spec,
//    Terms naming each anywhere in their decoded fields, Statements naming each, text acts naming each.
// 3. Until wrote no arbiter cMIP of its own: Until's identities are those its own reports name right after the word
//    "Until" (within 40 characters, at least twice); every text act they signed; those whose first line names a cMIP
//    or a Module; those of them whose text names an arbiter, an award or arbitration.
// 4. Dubsar's desk and collective clients (windows/dublaw/build/clients): which Agreements spec hash and which core
//    functions their sources read with, and how many of the round's acts are under each spec hash.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [R, KIT, IDX, BL, OUTF, REPO] = process.argv.slice(2).map((p) => path.resolve(p));
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
const { mor, plain } = await import(pathToFileURL(path.join(KIT, 'lib/core.mjs')).href);
const index = JSON.parse(fs.readFileSync(IDX, 'utf8'));
const B = JSON.parse(fs.readFileSync(BL, 'utf8'));
const acts = index.acts;
const byId = new Map(acts.map((a) => [a.id, a]));
const terms = acts.filter((a) => a.terms);
const stmts = acts.filter((a) => a.statement);
const texts = acts.filter((a) => typeof a.text === 'string');
const out = { made: 'check-claims.mjs, DubLaw wave 3 session C' };
const walk = (d, skip = []) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (e.isSymbolicLink()) return [];
  if (e.isDirectory()) return skip.includes(e.name) ? [] : walk(p, skip);
  return [p];
});

// ---------------------------------------------------------------- 1. the kit and the agreement cMIPs
{
  const named = new Set();
  for (const t of terms) for (const s of t.terms.sockets) { named.add(s.cmip); if (s.socket === 'K3' && /^[0-9a-f]{64}$/.test(String(s.kind))) named.add(s.kind); }
  for (const s of stmts) if (s.statement.k7) named.add(s.statement.k7.cmip);
  const fps = new Set([...named, ...B.entries.map((e) => e.fingerprint), ...B.entries.map((e) => e.specHash).filter(Boolean)]);
  const files = walk(KIT);
  const blobs = files.map((f) => ({ f: path.relative(KIT, f), b: fs.readFileSync(f) }));
  const hits = [];
  for (const fp of fps) {
    const raw = Buffer.from(fp, 'hex');
    for (const { f, b } of blobs) {
      if (b.includes(fp) || b.includes(raw)) hits.push({ fingerprint: fp, file: f });
      else if (b.includes(fp.slice(0, 16))) hits.push({ fingerprint: fp, file: f, only: 'its first 16 hex characters' });
    }
  }
  // the verifier, asked
  const R_W = path.join(R, 'windows');
  const file = new Map();
  for (const w of fs.readdirSync(R_W)) { const d = path.join(R_W, w, 'acts'); if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (/^[0-9a-f]{64}\.mor$/.test(f)) file.set(f.slice(0, 64), path.join(d, f)); }
  const k2 = [...new Set(terms.flatMap((t) => t.terms.sockets.filter((s) => s.socket === 'K2').map((s) => s.cmip)))].sort();
  const asked = [];
  for (const c of k2) {
    const t = terms.find((x) => x.terms.sockets.some((s) => s.socket === 'K2' && s.cmip === c) && file.has(x.id));
    if (!t) { asked.push({ k2: c, terms: null, answer: 'no Terms act naming it kept in an acts/ folder' }); continue; }
    const root = t.terms.agreement || t.id;
    const group = acts.filter((a) => ((a.terms && (a.terms.agreement || a.id) === root) || (a.statement && a.statement.agreement === root)) && file.has(a.id));
    let answer;
    try { answer = JSON.parse(mor.agreementsNewAsk({ acts: group.map((a) => ({ bytes: new Uint8Array(fs.readFileSync(file.get(a.id))) })), ask: 'in_force', args: [t.id] })); } catch (e) { answer = 'error: ' + String(e).slice(0, 200); }
    asked.push({ k2: c, terms: t.id, actsGiven: group.length, answer: Array.isArray(answer) ? answer.map((x) => ({ word: x.word, rule: x.rule, says: x.says })) : answer });
  }
  let control = null; try { control = plain(mor.agreementsControlCmip()); } catch { /* none */ }
  out.claim1 = {
    claim: 'the kit checked none of the agreement cMIPs (B, summary)',
    fingerprintsSearched: fps.size, namedInRoundActs: named.size, kitFiles: files.length, hits,
    kitControlCmip: control, controlCmipNamedInRoundActs: control ? named.has(control) : null,
    verifierAsked: asked,
    k2Distinct: k2.length,
    answersUnchecked: asked.filter((a) => Array.isArray(a.answer) && a.answer.every((x) => x.word === 'unchecked')).length,
  };
}

// ---------------------------------------------------------------- 2. DubLaw's award cMIP
{
  const all = new Set();
  for (const t of texts) for (const m of t.text.matchAll(/\b[0-9a-f]{64}\b/g)) all.add(m[0]);
  for (const e of B.entries) { all.add(e.fingerprint); if (e.specHash) all.add(e.specHash); if (e.publishedBy) all.add(e.publishedBy); }
  for (const a of acts) all.add(a.id);
  const find = (pre, suf) => [...all].filter((h) => h.startsWith(pre) && h.endsWith(suf));
  const targets = { 'award spec 7d42b01c…9130': find('7d42b01c', '9130'), 'draft 1 ebcc09e3…c6b4': find('ebcc09e3', 'c6b4') };
  const res = {};
  for (const [label, hs] of Object.entries(targets)) {
    res[label] = hs.map((h) => {
      const a = byId.get(h);
      const bEntry = B.entries.find((e) => e.fingerprint === h || e.specHash === h || e.publishedBy === h);
      return {
        hash: h,
        isAnAct: a ? { kind: a.text !== undefined ? 'text' : a.spec + '/' + a.type, signer: a.signer, firstLine: (a.text || '').split('\n')[0].slice(0, 120) } : null,
        actsUnderItAsSpec: acts.filter((x) => x.spec === h).map((x) => x.id),
        termsNamingIt: terms.filter((t) => JSON.stringify(t.terms).includes(h)).map((t) => t.id),
        statementsNamingIt: stmts.filter((s) => JSON.stringify(s.statement).includes(h)).map((s) => s.id),
        textActsNamingIt: texts.filter((t) => t.id !== h && t.text.includes(h)).map((t) => ({ id: t.id, signer: t.signer })),
        textActsNamingItBy16: texts.filter((t) => t.id !== h && !t.text.includes(h) && t.text.includes(h.slice(0, 16))).length,
        bEntry: bEntry ? { fingerprint: bEntry.fingerprint, title: bEntry.title, use: bEntry.use && { terms: bEntry.use.terms, assents: bEntry.use.assents, k7: bEntry.use.k7Statements, under: bEntry.use.actsUnderSpec } } : null,
      };
    });
  }
  // the spec hash of the draft-1 text, if the draft-1 hash is a text act: computed as a cMIP by its signer
  out.claim2 = { claim: "DubLaw's arbiter's award cMIP and its draft 1 have no act under them and no Terms naming them", found: res };
}

// ---------------------------------------------------------------- 3. Until and an arbiter cMIP
{
  const rep = path.join(R, 'windows', 'until', 'reports');
  const counts = new Map();
  for (const f of fs.readdirSync(rep)) {
    const t = fs.readFileSync(path.join(rep, f), 'utf8');
    for (const m of t.matchAll(/Until[^.\n]{0,40}?([0-9a-f]{64})/g)) counts.set(m[1], (counts.get(m[1]) || 0) + 1);
  }
  const ids = [...counts].filter(([, n]) => n >= 2).map(([h]) => h);
  const isIdentity = (h) => acts.some((a) => a.signer === h);
  const own = texts.filter((t) => ids.includes(t.signer));
  const cmipish = own.filter((t) => /cmip|module/i.test(t.text.split('\n')[0]));
  const arb = /arbit|award|arbiter/i;
  // a cMIP or Module text: its first line is a title beginning '# cMIP' or '# Module'
  const titled = own.filter((t) => /^#\s*(cMIP|Module)\b/i.test(t.text.split('\n')[0]));
  // what they cite near the words arbiter or award: 64-hex strings or 8-hex prefixes within 300 characters, resolved to B's entries
  const cite = (t) => {
    const found = new Set();
    for (const m of t.text.matchAll(/arbit|award/gi)) {
      const win = t.text.slice(Math.max(0, m.index - 300), m.index + 300);
      for (const h of win.matchAll(/\b[0-9a-f]{8}(?:[0-9a-f]{56})?\b/g)) found.add(h[0]);
    }
    return [...found].map((h) => {
      const e = B.entries.find((x) => x.fingerprint.startsWith(h) || (x.specHash || '').startsWith(h) || (x.publishedBy || '').startsWith(h));
      return { cited: h, bEntry: e ? { fingerprint: e.fingerprint, title: e.title, author: e.author, authorWindow: e.authorWindow } : null, authorIsUntil: e ? ids.includes(e.author) : null };
    });
  };
  out.claim3 = {
    claim: 'Until wrote no arbiter cMIP of its own',
    identities: ids.map((h) => ({ id: h, timesNamed: counts.get(h), signsActs: isIdentity(h), textActs: own.filter((t) => t.signer === h).length })),
    textActsByThem: own.length,
    cmipOrModuleTexts: cmipish.map((t) => ({ id: t.id, signer: t.signer, firstLine: t.text.split('\n')[0].slice(0, 140), namesArbiterOrAward: arb.test(t.text), titleNamesArbiterOrAward: arb.test(t.text.split('\n')[0]) })),
    titledCmipOrModuleTexts: titled.map((t) => ({ id: t.id, signer: t.signer, title: t.text.split('\n')[0].slice(0, 140), titleNamesArbiterOrAward: arb.test(t.text.split('\n')[0]), textNamesArbiterOrAward: arb.test(t.text), citedNearArbiterOrAward: cite(t) })),
    titledNamingArbiterOrAwardInTitle: titled.filter((t) => arb.test(t.text.split('\n')[0])).length,
    cmipTitlesNamingArbiterOrAward: cmipish.filter((t) => arb.test(t.text.split('\n')[0])).length,
    cmipTextsNamingArbiterOrAwardAnywhere: cmipish.filter((t) => arb.test(t.text)).length,
  };
}

// ---------------------------------------------------------------- 4. the desk and collective clients
{
  const base = path.join(R, 'windows', 'dublaw', 'build', 'clients');
  const SPEC17 = '00538b90e190a5808df8dc9ba3c470c9b04a9c3d4f8baab3d4ac8362b4b4796a'; // sha256('LAW, test value until the freeze')
  const SPEC25 = plain(mor.agreementsNewSpecs()).terms.spec;
  const probes = { spec17: SPEC17, spec25: SPEC25, readTerms: 'readTerms', checkTerms: 'checkTerms', agreementsNew: 'agreementsNew', 'draft 17': 'draft 17', 'draft 25': 'draft 25', agreementsSpecs: 'agreementsSpecs', AGREEMENTS_SPECS: 'AGREEMENTS_SPECS' };
  const res = {};
  for (const client of ['desk', 'collective']) {
    const files = walk(path.join(base, client), ['node_modules']).filter((f) => /\.(ts|mjs|js|md|json|html)$/.test(f));
    const per = {};
    for (const [k, p] of Object.entries(probes)) {
      per[k] = files.filter((f) => fs.readFileSync(f, 'utf8').includes(p)).map((f) => path.relative(base, f));
    }
    const src = files.filter((f) => /\/src\//.test(f) && /\.ts$/.test(f));
    const srcPer = {};
    for (const [k, p] of Object.entries(probes)) srcPer[k] = src.filter((f) => fs.readFileSync(f, 'utf8').includes(p)).map((f) => path.relative(base, f));
    res[client] = { filesScanned: files.length, sourceFiles: src.length, inAnyFile: per, inSource: srcPer };
  }
  const under = (h) => acts.filter((a) => a.spec === h).length;
  // the modules imported from outside build/ (../../repo/src/specs.ts, ../../genesis/src/core.ts), at the commit build/FROM-MAIN.txt names
  const from = fs.readFileSync(path.join(R, 'windows', 'dublaw', 'build', 'FROM-MAIN.txt'), 'utf8');
  const commit = (from.match(/main at ([0-9a-f]{7,40})/) || [])[1] || null;
  const imported = {};
  if (REPO && commit) for (const f of ['clients/repo/src/specs.ts', 'clients/genesis/src/core.ts']) {
    try {
      const src = execFileSync('git', ['-C', REPO, 'show', commit + ':' + f], { encoding: 'utf8' });
      const line = src.split('\n').find((l) => /^\s*agreements:\s/.test(l)) || null;
      const lit = line && (line.match(/'([^']+)'/) || [])[1];
      imported[f] = { agreementsLine: line && line.trim(), sha256OfItsLiteral: lit ? crypto.createHash('sha256').update(lit).digest('hex') : null, isSpec17: lit ? crypto.createHash('sha256').update(lit).digest('hex') === SPEC17 : null, definesReadTerms: /readTerms/.test(src), mentionsAgreementsNew: /agreementsNew/.test(src) };
    } catch (e) { imported[f] = 'not read: ' + String(e).slice(0, 120); }
  }
  out.claim4 = {
    claim: "Dubsar's desk and collective clients read Agreements draft 17, not draft 25 (which draft they read only)",
    spec17: SPEC17, spec25: SPEC25,
    roundActsUnderSpec17: under(SPEC17), roundActsUnderSpec25: under(SPEC25),
    copiedFromCommit: commit, importedModulesAtThatCommit: imported,
    clients: res,
  };
}

fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
const c1 = out.claim1;
console.log('1. fingerprints', c1.fingerprintsSearched, 'kit files', c1.kitFiles, 'hits', c1.hits.length, '| K2 cMIPs asked', c1.k2Distinct, 'answered unchecked', c1.answersUnchecked, '| control cMIP named in round acts', c1.controlCmipNamedInRoundActs);
for (const [k, v] of Object.entries(out.claim2.found)) for (const h of v) console.log('2.', k, h.hash.slice(0, 16), 'act?', !!h.isAnAct, 'under', h.actsUnderItAsSpec.length, 'terms', h.termsNamingIt.length, 'stmts', h.statementsNamingIt.length, 'texts naming', h.textActsNamingIt.length);
for (const [k, v] of Object.entries(out.claim2.found)) if (!v.length) console.log('2.', k, 'NOT FOUND');
for (const t of out.claim3.titledCmipOrModuleTexts) console.log('3.  ', t.id.slice(0, 8), t.title.slice(0, 40), 'arbiter in title', t.titleNamesArbiterOrAward, 'in text', t.textNamesArbiterOrAward, 'cites', t.citedNearArbiterOrAward.filter((c) => c.bEntry).map((c) => c.bEntry.title.slice(0, 40) + ' [' + c.bEntry.authorWindow + ']').join('; '));
console.log('3. identities', out.claim3.identities.map((x) => x.id.slice(0, 8) + ':' + x.textActs).join(' '), 'cMIP/Module texts', out.claim3.cmipOrModuleTexts.length, 'titles naming arbiter/award', out.claim3.cmipTitlesNamingArbiterOrAward, 'anywhere', out.claim3.cmipTextsNamingArbiterOrAwardAnywhere);
console.log('4. acts under spec17', out.claim4.roundActsUnderSpec17, 'spec25', out.claim4.roundActsUnderSpec25, 'imported', JSON.stringify(out.claim4.importedModulesAtThatCommit));
for (const [c, v] of Object.entries(out.claim4.clients)) console.log('  ', c, JSON.stringify(Object.fromEntries(Object.entries(v.inSource).map(([k, x]) => [k, x.length]))));
