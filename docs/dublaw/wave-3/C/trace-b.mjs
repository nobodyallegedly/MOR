#!/usr/bin/env node
// trace-b.mjs: DubLaw wave 3, session C (Nobody, allegedly). Traces twelve of wave 2 B's entries from the acts,
// with this session's own index (index.mjs), not B's scripts. Reads B's listing only to choose entries and to compare.
//
//   node trace-b.mjs INDEX_JSON B_LISTING_JSON KIT_DIR OUT_JSON [SEED]
//
// Choice (stated before any trace was run):
//   1. B's four entries with the most Terms naming them (use.terms, descending; ties by fingerprint ascending);
//   2. the four with the fewest Terms naming them among those named by at least one Terms (use.terms >= 1,
//      ascending; ties by fingerprint ascending);
//   3. four drawn from the 107 left, by a mulberry32 generator with the seed printed (default 20261122), a
//      Fisher-Yates shuffle of the remainder sorted by fingerprint, first four taken.
// For each: the text acts whose fingerprint is the entry's (by spec hash = core mirHash of the text, by act id, by
// plain SHA-256, by work hash, or by SHA-256 of the text up to one of its first 30 sentence ends), their signers;
// every socket of every Terms act naming the fingerprint; K7 Statements of that kind; acts signed under it as their
// spec; assents to those Terms, counted two ways (Statement.terms one of them; Statement.agreement one of their roots).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const [IDX, BL, KIT, OUTF, SEEDS] = process.argv.slice(2);
const SEED = Number(SEEDS ?? 20261122);
const { mor } = await import(pathToFileURL(path.join(path.resolve(KIT), 'lib/core.mjs')).href);
const index = JSON.parse(fs.readFileSync(IDX, 'utf8'));
const B = JSON.parse(fs.readFileSync(BL, 'utf8'));
const acts = index.acts;
const byId = new Map(acts.map((a) => [a.id, a]));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const tagged = (tag, bytes) => { const t = crypto.createHash('sha256').update(tag).digest(); return crypto.createHash('sha256').update(t).update(t).update(bytes).digest('hex'); };

// ---- choice
const E = B.entries.slice();
const fpAsc = (a, b) => (a.fingerprint < b.fingerprint ? -1 : 1);
const most = E.slice().sort((a, b) => b.use.terms - a.use.terms || fpAsc(a, b)).slice(0, 4);
const least = E.filter((e) => e.use.terms >= 1).sort((a, b) => a.use.terms - b.use.terms || fpAsc(a, b)).slice(0, 4);
const chosen = new Set([...most, ...least].map((e) => e.fingerprint));
const rest = E.filter((e) => !chosen.has(e.fingerprint)).sort(fpAsc);
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(SEED);
for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
const random = rest.slice(0, 4);
const pick = [...most.map((e) => ['most named', e]), ...least.map((e) => ['least named, some use', e]), ...random.map((e) => ['random, seed ' + SEED, e])];

// ---- fingerprints of every text act
const fpOf = new Map(); // fingerprint -> [{act, how}]
const put = (fp, act, how) => { if (!fpOf.has(fp)) fpOf.set(fp, []); fpOf.get(fp).push({ act, how }); };
for (const a of acts) {
  if (typeof a.text !== 'string') continue;
  put(a.id, a.id, 'act id');
  try { put(mor.mirHash(a.text), a.id, 'spec hash as a MIR (mirHash)'); } catch { /* not canonical */ }
  // Development's content of a cMIP (kind 0), Module (1), unit (2) or media type (3): {0: kind, 1: creator, 9: text},
  // the creator taken to be the text act's signer (core/src/development.rs, Spec::from_value; hash.rs, "MOR/spec").
  if (a.signer) for (const k of [0, 1, 2, 3]) {
    try {
      const content = mor.cborEncode(new Map([[0, k], [1, new Uint8Array(Buffer.from(a.signer, 'hex'))], [9, a.text]]));
      put(tagged('MOR/spec', content), a.id, 'spec hash, kind ' + k + ', creator its signer');
    } catch { /* not encodable */ }
  }
  put(sha(Buffer.from(a.text)), a.id, 'sha256');
  put(mor.workHash(new Uint8Array(Buffer.from(a.text))), a.id, 'work hash');
  let n = 0;
  for (const m of a.text.matchAll(/[.!?](?=\s|$)/g)) { if (++n > 30) break; put(sha(Buffer.from(a.text.slice(0, m.index + 1))), a.id, 'sha256 of text to sentence end ' + n); }
}

// ---- trace
const terms = acts.filter((a) => a.terms);
const stmts = acts.filter((a) => a.statement);
const out = { made: 'trace-b.mjs, DubLaw wave 3 session C', seed: SEED, rule: 'see header', traces: [] };
for (const [why, e] of pick) {
  const fp = e.fingerprint;
  const texts = (fpOf.get(fp) || []).map((x) => ({ ...x, signer: byId.get(x.act)?.signer, where: byId.get(x.act)?.where }));
  const sockets = [];
  const T = new Set();
  for (const t of terms) for (const s of t.terms.sockets) {
    if (s.cmip === fp) { sockets.push({ terms: t.id, socket: s.socket, at: s.at ?? null }); T.add(t.id); }
    // a power whose kind is this K7 cMIP (encoding 2, E14): not a socket, counted apart, labelled 'K7 (power kind)'
    if (s.socket === 'K3' && s.kind === fp) { sockets.push({ terms: t.id, socket: 'K7 (power kind)', at: s.at ?? null }); T.add(t.id); }
  }
  const roots = new Set([...T].map((id) => byId.get(id).terms.agreement ?? id));
  const assentsByTerms = stmts.filter((s) => s.statement.kind === 'assent' && T.has(s.statement.terms));
  // acts held only in a file outside a window's acts/ folder (never in a feed, dubsar's database or an acts/ folder)
  const onlyOutside = (a) => a.where.every((w) => w.startsWith('file:') && !w.endsWith('/acts'));
  const assentsByTermsPublished = assentsByTerms.filter((a) => !onlyOutside(a));
  const assentsByRoot = stmts.filter((s) => s.statement.kind === 'assent' && roots.has(s.statement.agreement));
  const k7 = stmts.filter((s) => s.statement.kind === 'K7' && s.statement.k7?.cmip === fp);
  const under = acts.filter((a) => a.spec === fp);
  const signers = new Set([...[...T].map((id) => byId.get(id).signer), ...assentsByTerms.map((a) => a.signer), ...k7.map((a) => a.signer), ...under.map((a) => a.signer)].filter(Boolean));
  const socketCount = {};
  for (const s of sockets) socketCount[s.socket] = (socketCount[s.socket] || 0) + 1;
  const bSockets = {};
  for (const [k, v] of Object.entries(e.sockets || {})) bSockets[k.split(' ')[0]] = v;
  if (socketCount['K7 (power kind)'] && bSockets.K7 && !socketCount.K7) { socketCount.K7 = socketCount['K7 (power kind)']; delete socketCount['K7 (power kind)']; socketCount.note = 'B labels power kinds K7'; }
  const mine = {
    textActs: texts, termsNaming: T.size, socketsByKind: socketCount, sockets,
    assentsByTerms: assentsByTerms.length, assentsByTermsHeldOnlyOutsideActs: assentsByTerms.filter(onlyOutside).map((a) => ({ act: a.id, where: a.where })), assentsByTermsWithoutThose: assentsByTermsPublished.length, assentsByRoot: assentsByRoot.length, k7Statements: k7.length, actsUnderSpec: under.length, signers: signers.size,
  };
  const b = { title: e.title, namedAs: e.namedAs, held: e.held, author: e.author, publishedBy: e.publishedBy, sockets: bSockets, terms: e.use.terms, assents: e.use.assents, k7Statements: e.use.k7Statements, actsUnderSpec: e.use.actsUnderSpec, signers: e.use.signers };
  const textIds = new Set(texts.map((x) => x.act));
  const cmp = {
    held: (b.held === 'not held') === (texts.length === 0),
    publishedByAmongMine: b.publishedBy ? textIds.has(b.publishedBy) : texts.length === 0,
    authorIsSignerOfPublishing: b.publishedBy ? byId.get(b.publishedBy)?.signer === b.author : null,
    sockets: JSON.stringify(Object.entries(socketCount).filter(([k]) => k !== 'note').sort()) === JSON.stringify(Object.entries(bSockets).sort()),
    terms: mine.termsNaming === b.terms,
    assents: mine.assentsByTerms === b.assents || mine.assentsByRoot === b.assents,
    assentsWithoutActsHeldOnlyOutsideActs: mine.assentsByTermsWithoutThose === b.assents,
    k7Statements: mine.k7Statements === b.k7Statements,
    actsUnderSpec: mine.actsUnderSpec === b.actsUnderSpec,
    signers: mine.signers === b.signers,
  };
  out.traces.push({ why, fingerprint: fp, b, mine, agree: cmp, allAgree: Object.entries(cmp).every(([k, v]) => v !== false || (k === 'assents' && cmp.assentsWithoutActsHeldOnlyOutsideActs) || (k === 'assentsWithoutActsHeldOnlyOutsideActs' && cmp.assents)) });
}
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
for (const t of out.traces) console.log(t.why.padEnd(24), t.fingerprint.slice(0, 16), (t.b.title || '(not held)').slice(0, 50).padEnd(50), 'T', t.b.terms, t.mine.termsNaming, 'A', t.b.assents, t.mine.assentsByTerms + '/' + t.mine.assentsByTermsWithoutThose + '/' + t.mine.assentsByRoot, 'S', t.b.signers, t.mine.signers, t.allAgree ? 'AGREE' : 'DIFF ' + Object.entries(t.agree).filter(([, v]) => v === false).map(([k]) => k).join(','));
