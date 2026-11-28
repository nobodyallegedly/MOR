#!/usr/bin/env node
// catalogue.mjs: DubLaw wave 3, session F (Nobody, allegedly). Every count of catalogue-agreements.md.
//
//   node catalogue.mjs RESEARCH_DIR KIT_DIR TEAM_DIR OUT_JSON
//
// RESEARCH_DIR: ~/Documents/mor-round-2/_research (read only). KIT_DIR: the round's kit (commit 74739bb), for example
// _team/dubweb/wave-3/inventory/kit. TEAM_DIR: ~/Documents/mor-round-2/_team (read only: DubWeb's inventory, DubLaw's
// wave 2 listing and its identity-to-window table). OUT_JSON: catalogue-agreements.json.
//
// Step 1 indexes every public act in RESEARCH_DIR, as DubLaw W3-C's index.mjs does (feed pages, a private copy of
// dubsar's database, every *.mor file; folders named keys are skipped; sealed acts are never opened). An act held only
// as a file outside any acts/ folder (for example an unpublished duplicate) is marked unpublished and left out of the
// use counts. Step 2 counts, for each of the 51 texts of the slice (slice-check.md), the Terms that name it, the
// assents to those Terms, Statements of its kind, acts under its spec, and the specification texts that cite it.
// The grouping into problems is DubLaw F's reading, written below as data (PROBLEMS); every number is computed.
// Needs Node.js 22.5 or later (node:sqlite). Nothing is written but OUT_JSON (and a temporary copy of the database,
// in the system's temporary folder, deleted after).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const [R, KIT, TEAM, OUT] = process.argv.slice(2).map((p) => path.resolve(p));
const { mor, plain, hex } = await import(pathToFileURL(path.join(KIT, 'lib/core.mjs')).href);
const AG = plain(mor.agreementsNewSpecs());
const TEXT_SPEC = 'a9167c22f01bd8f9489bd364f04b1144d5ff7a755aa59ffdbf34cfac374daf80';
const CAVEAT = 'Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.';

// ---------- step 1: the index ----------
const acts = new Map();
let order = 0;
function take(bytes, where) {
  let a;
  try { a = plain(mor.describeAct(bytes)); } catch { return; }
  let e = acts.get(a.id);
  if (!e) {
    e = { id: a.id, signer: a.signer ?? null, public: !!a.public, spec: a.spec ?? null, type: a.type ?? null, order: order++, where: [] };
    if (a.public && a.payload) e.payload = a.payload;
    if (a.refs) e.refs = a.refs;
    acts.set(a.id, e);
  }
  if (!e.where.includes(where)) e.where.push(where);
}
const FEEDS = path.join(R, 'feeds');
for (const home of fs.readdirSync(FEEDS).sort()) {
  const d = path.join(FEEDS, home);
  if (!fs.statSync(d).isDirectory()) continue;
  const pages = fs.readdirSync(d).filter((f) => f.endsWith('.cbor'))
    .sort((x, y) => Number(x.match(/(\d+)\.cbor$/)[1]) - Number(y.match(/(\d+)\.cbor$/)[1]));
  for (const f of pages) {
    const v = mor.cborDecode(new Uint8Array(fs.readFileSync(path.join(d, f))));
    let list = [];
    if (Array.isArray(v)) list = v;
    else if (v instanceof Map) list = (v.get(0) || []).map((x) => (Array.isArray(x) ? x.find((y) => y instanceof Uint8Array && y.length > 64) : x));
    for (const b of list) if (b instanceof Uint8Array) take(b, 'feed:' + home);
  }
}
const DBDIR = path.join(FEEDS, 'dubsar-before-closure');
if (fs.existsSync(path.join(DBDIR, 'relay.db'))) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dublaw-f-'));
  for (const f of ['relay.db', 'relay.db-wal']) if (fs.existsSync(path.join(DBDIR, f))) fs.copyFileSync(path.join(DBDIR, f), path.join(tmp, f));
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(path.join(tmp, 'relay.db'));
  for (const row of db.prepare('SELECT bytes FROM items WHERE kind = 0 AND bytes IS NOT NULL ORDER BY arrival').all()) take(new Uint8Array(row.bytes), 'db:dubsar');
  db.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) { if (e.name !== 'keys') walk(p); }
    else if (e.name.endsWith('.mor')) {
      const rel = path.relative(R, p).split(path.sep);
      take(new Uint8Array(fs.readFileSync(p)), rel.includes('acts') ? 'acts:' + rel.slice(0, 2).join('/') : 'file:' + rel.join('/'));
    }
  }
})(R);

const H = (v) => (v instanceof Uint8Array ? hex(v) : v);
const sock = (s) => (Array.isArray(s) && s.length === 2 ? { cmip: H(s[0]), params: s[1] instanceof Uint8Array ? hex(s[1]) : null } : null);
const KINDS = ['assent', 'counter_signature', 'contest', 'resolve'];
for (const e of acts.values()) {
  e.published = e.where.some((w) => !w.startsWith('file:'));
  if (!e.payload) continue;
  let m;
  try { m = mor.cborDecode(new Uint8Array(Buffer.from(e.payload, 'hex'))); } catch { delete e.payload; continue; }
  delete e.payload;
  if (!(m instanceof Map)) continue;
  if (e.spec === AG.terms.spec && e.type === 0) {
    const t = { sockets: [] };
    if (m.has(1)) t.agreement = H(m.get(1));
    if (m.has(0)) t.replaces = H(m.get(0));
    t.parties = (m.get(2) || []).map((p) => {
      if (!Array.isArray(p)) return {};
      if (p[0] === 0) return { signer: H(p[1]) };
      if (p[0] === 2) return { agreement: H(p[1]) };
      if (p[0] === 1) { const r = p[1] instanceof Map ? p[1] : new Map(); const s = sock(r.get(2)); if (s) t.sockets.push({ socket: 'K5', ...s }); return { role: r.get(0) }; }
      return {};
    });
    const body = m.get(4);
    if (Array.isArray(body)) { const s = sock(body[1]); if (s) t.sockets.push({ socket: 'K1', ...s }); }
    for (const [k, name] of [[6, 'K2'], [13, 'K4'], [14, 'K6'], [16, 'K8']]) { const s = sock(m.get(k)); if (s) t.sockets.push({ socket: name, ...s }); }
    for (const pw of m.get(7) || []) if (Array.isArray(pw)) { const s = sock(pw[1]); if (s) t.sockets.push({ socket: 'K3', ...s }); t.powerKinds = [...(t.powerKinds || []), H(pw[0])]; }
    t.reliesOn = (m.get(5) || []).map(H);
    e.terms = t;
  } else if (e.spec === AG.statement.spec && e.type === 1) {
    const k = m.get(2);
    e.statement = { agreement: H(m.get(0)), terms: H(m.get(1)) };
    if (typeof k === 'number') e.statement.kind = KINDS[k] ?? 'kind ' + k;
    else { e.statement.kind = 'K7'; e.statement.k7 = sock(k); }
  } else if (e.spec === TEXT_SPEC && e.type === 0) {
    const text = m.get(0);
    if (typeof text === 'string') e.text = text;
  }
}
const ALL = [...acts.values()];
const byId = (p) => { const x = ALL.filter((a) => a.id.startsWith(p)); if (x.length !== 1) throw new Error('act prefix ' + p + ': ' + x.length); return x[0]; };
const TERMS = ALL.filter((a) => a.terms && a.published);
const STATEMENTS = ALL.filter((a) => a.statement && a.published);
const TEXTS = ALL.filter((a) => typeof a.text === 'string' && a.published);

// ---------- inputs from the team's folders (read only) ----------
const inv = JSON.parse(fs.readFileSync(path.join(TEAM, 'dubweb/wave-3/inventory/inventory-all.json'), 'utf8'));
const listing = JSON.parse(fs.readFileSync(path.join(TEAM, 'dublaw/wave-2/results/B/listing-agreements.json'), 'utf8'));
const WIN = JSON.parse(fs.readFileSync(path.join(TEAM, 'dublaw/wave-2/results/B/windows-of-identities.json'), 'utf8'));
const win = (id) => (id && WIN[id] ? WIN[id].window : 'unknown');
const invByAct = new Map(inv.specifications.map((s) => [s.act, s]));
const kitFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else kitFiles.push(fs.readFileSync(p)); } })(KIT);
const inKit = (h) => kitFiles.some((b) => b.includes(Buffer.from(h, 'utf8')) || b.includes(Buffer.from(h, 'hex')) || b.includes(Buffer.from(h.slice(0, 16), 'utf8')));
const HOST_PROMPTS = [path.join(R, 'hosts/notice-7.md'), path.join(R, 'hosts/notice-8.md'),
  ...fs.readdirSync(path.join(R, 'windows')).map((w) => path.join(R, 'windows', w, 'from-the-hosts/brief-day-five.md')).filter((p) => fs.existsSync(p))];
const promptText = HOST_PROMPTS.map((p) => [path.relative(R, p), fs.readFileSync(p, 'utf8')]);

// ---------- the 51 texts and the problems (DubLaw F's reading, as data) ----------
// t: [key, act prefix, short name, draft, extra fingerprints named in Terms besides the spec hash and act id]
const T = (key, act, name, draft, extra = []) => ({ key, act, name, draft, extra });
const SOLUTIONS = {
  namedSigners: { name: 'named signers', texts: [T('ns1', 'd8a19d7d', 'named signers', 1)] },
  stallInForce: { name: "Stall's in force on the sellers' assents", texts: [T('sk2', 'de8d5d29', "Stall's in force on the sellers' assents", 1)] },
  inForceCond: { name: 'in force by the condition', texts: [T('ic1', '502ba52f', 'in force by the condition', 1), T('ic2', '5f5443a6', 'in force by the condition', 2)] },
  buyerAssent: { name: 'buyer by assent', texts: [T('ba1', '735c3cf8', 'buyer by assent', 1)] },
  stallSpot: { name: "Stall's buyer's spot", texts: [T('sk5', '0b9eee89', "Stall's buyer's spot", 1)] },
  quorum: { name: 'quorum with stand-ins', texts: ['73c8671f', '5859c1fe', 'f4053010', '3b406376'].map((a, i) => T('q' + (i + 1), a, 'quorum with stand-ins', i + 1)) },
  shower: { name: 'shower work', texts: ['6f83ad57', 'd7948509', '420e94e9', '5412396a', '36709414', 'cb26fcb9', '16e8ce43', '8acd058f', 'b3b0b43d', 'b2a64e3c', '89a110c1', 'fc6eb5b6'].map((a, i) => T('sw' + (i + 1), a, 'shower work', i + 1)) },
  shares: { name: 'shares nobody may rewrite', texts: ['00670bc6', '768fe5af', 'ebbf4fed', 'bc4d5304', 'be1ff7b1', 'ad9b5abb', 'e963680b'].map((a, i) => T('sh' + (i + 1), a, 'shares nobody may rewrite', i + 1)) },
  stallChangeLeave: { name: "Stall's the seller may change the offer, or leave its service alone", texts: [T('scl', '6dd4fff6', "Stall's change the offer, or leave the service alone", 1)] },
  stallFuture: { name: "Stall's the seller may change an offer for future buyers", texts: [T('sfb', '3f2a69de', "Stall's change an offer for future buyers", 1)] },
  lineup: { name: 'lineup vote', texts: ['86f5c6ff', '724bbe8b', 'd1f02d2e', '41f1ceef'].map((a, i) => T('lv' + (i + 1), a, 'lineup vote', i + 1)) },
  award: { name: "an arbiter's award", texts: [T('aw1', '5102247f', "an arbiter's award", 1), T('aw2', 'c96e1cea', "an arbiter's award", 2)] },
  provenClaim: { name: 'Proven claim', texts: [T('pc1', 'd6647391', 'Proven claim', 1), T('pc2', 'de67b513', 'Proven claim', 2)] },
  receipt: { name: 'delivery receipt', texts: [T('dr1', 'fa31564e', 'delivery receipt', 1), T('dr2', '87d4b559', 'delivery receipt', 2)] },
  plainSteward: { name: "Steward & Co.'s plain words", texts: [T('pw', 'fc1c5436', "Steward & Co.'s plain words", 1)] },
  plainCounterparty: { name: "Counterparty's plain-words body", texts: [T('cpb', 'ee0fd121', "Counterparty's plain-words body (two fingerprints, one text)", 1, ['61bcdb5b15c282e81a5b822c0d1c6c704af0df360ae98189e63e9715f7114528'])] },
  consent: { name: 'consent to be recorded', texts: [T('cr1', 'ada9f31e', 'consent to be recorded', 1)] },
  shelf: { name: 'the lending shelf', texts: [T('ls1', 'e5d774d2', 'the lending shelf', 1), T('ls2', '8ff8ac74', 'the lending shelf', 2)] },
  roomLet: { name: 'a room let, in plain words (a template)', texts: [T('rl1', '526f4947', 'a room let', 1), T('rl2', '943e2ad4', 'a room let', 2), T('rl3', '9f1911e7', 'a room let', 3)] },
  wayOut: { name: 'the way out', texts: [T('wo1', 'fe98a3f1', 'the way out', 1)] },
};
// faults: [act prefix, what, status] as read in the acts; the script checks each act exists and gives its signer's window.
const FAULTS = {
  namedSigners: [['0785547b', 'one silent signer blocks every later version, even where the update condition says valid (DubLaw on its own rule)', 'not fixed in this text; answered by another text, in force by the condition'],
    ['7e1aa448', "a client read the kit's \"unchecked\" as \"no\"", "a client's fault, not the text's; fixed in the client"]],
  buyerAssent: [['7bc8fcd0', 'serious, under notice 8: a filling checks no payment, so a lineup needs only assents', 'unfixed: no draft 2; the text states it as a cost'],
    ['6947f703', 'the same, shown open on entries whose version 2 adds the role', 'unfixed']],
  inForceCond: [['8949732f', "Y-1: an old quorum could fork the current Terms", 'fixed in draft 2']],
  quorum: [['5d54329e', 'K3-1: evidence of silence from a home the signer has left', 'fixed in draft 3']],
  shares: [['53cccd25', 'retest T1 to T4 (cumulative admission, dormancy evidence, latest assent, floor)', 'fixed in draft 4'],
    ['1edde3ea', 'an assent made for a holder under a power counted as theirs (found by the author)', 'fixed in draft 3'],
    ['298d832a', 'a swapped power rule', 'fixed in draft 4'],
    ['3c599960', 'Q1: one holder freezes the group with a fork', 'fixed in draft 5'],
    ['5d54329e', 'B2, R1, K3-1 (on Backlot\'s Terms)', 'fixed in draft 6'],
    ['eb56f122', 'V1, V5: the guard removed by the vote it guards; unlodged assents', 'fixed in draft 7']],
  shower: [['7738a500', 'D1 to D6 on draft 1', 'fixed in draft 2 (D2, D5, D6 as stated costs)'],
    ['5fd08530', 'the condition did not guard itself', 'fixed in draft 5'],
    ['1edde3ea', 'power-of-assent gap, ruled serious', 'fixed in draft 6'],
    ['32a7ac63', 'a fixed line paid with no evidence, ruled minor', 'fixed in draft 6'],
    ['a69f00ea', 'owners written as text, ruled serious', 'fixed in draft 6'],
    ['fc5207bf', 'Y2 to Y4 on draft 5', 'fixed in draft 7 (Y4 as a stated cost)'],
    ['9144a9c0', 'a service-owner blocks its own replacement', 'fixed in draft 7'],
    ['e994e3d0', 'K1: a silent owner freezes the work', 'fixed in draft 8'],
    ['181409af', 'K2: the group gives a quiet owner a stand-in', 'fixed in draft 9'],
    ['2ac300da', 'W1 to W11', 'fixed in draft 10'],
    ['c924941a', 'N1 to N12, second reading of the pipe', 'fixed in draft 12, except N4 and N5, which draft 12 does not name']],
  lineup: [['0be4a1da', 'L1 to L8; L1 serious: free voters, any number', 'L1 fixed in draft 2 (also found by Keep, Plain Words, The Back Row)'],
    ['c8d9cc3e', 'findings 1 to 5 on draft 1', 'findings 1, 2 and 5 closed by draft 4; 3 (which version names the receiver paid) and 4 (a voter\'s forked line) open, per act 06b11315'],
    ['74e85b51', 'M1 serious: buying from yourself is still a vote, at a few sats per 100 points', 'unfixed'],
    ['71138be3', 'minor: a 1% fee rounds to 0 under 100 sats, so "no free handling" passes on paper', 'unfixed']],
  award: [['5102247f', 'F1 (DubLaw, catalogue/found-faults.md): an arbiter decides for the payer by doing nothing; its only way to decline is silence', 'unfixed; the default is unchanged in draft 2 (act c96e1cea)']],
  provenClaim: [['07e86444', 'a copier won: rival claims ordered by each claimant\'s own sequence', 'fixed in draft 2 (ordered only by a witness)'],
    ['a93b1365', 'a preimage published before lodging can be copied', 'draft 2 says lodge first; who paid stays unprovable (stated)']],
  receipt: [['ac426987', 'receipts from friends worth little; time unchecked; a buyer can lie', 'first two answered in draft 2 (rules W and T); the third stated as a limit']],
  roomLet: [['ac11e54c', "draft 1 overstated what a contest does under Until's escrow draft 4 (Until's answer)", 'fixed in draft 2']],
};
const DEFAULTS_NOTE = 'turns on the defaults (named signers, buyer by assent)';
const PROBLEMS = [
  { id: 'P1', category: 1, problem: 'Terms with an open role (a buyer nobody knows yet) come into force on the named parties\' assents alone.', solutions: ['namedSigners', 'stallInForce'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P2', category: 1, problem: 'A new version of Terms comes into force by the group\'s own update rule, although one signer is silent.', solutions: ['inForceCond'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P3', category: 1, problem: 'A stranger becomes a buyer of an offer, and what that buyer has earned.', solutions: ['buyerAssent', 'stallSpot'], lean: 'merge two', turnsOnDefaults: true },
  { id: 'P4', category: 1, problem: 'A power held by k of a named list keeps working when one of them falls silent.', solutions: ['quorum'], lean: 'keep one', turnsOnDefaults: false },
  { id: 'P5', category: 2, problem: 'A work owned by several people in shares: one payment reaches every owner and everyone along the pipe, and each sees their line.', solutions: ['shower'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P6', category: 2, problem: 'A group changes its own Terms by its rule, but nobody\'s share is cut without their own signature.', solutions: ['shares', 'shower'], lean: 'merge two', turnsOnDefaults: false, pointerOnly: ['shower'] },
  { id: 'P7', category: 2, problem: 'A seller changes an offer for future buyers, or drops a service, without touching what buyers already earned.', solutions: ['stallChangeLeave', 'stallFuture'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P8', category: 2, problem: 'A group votes, and anyone can count the result from the signed acts.', solutions: ['lineup'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P9', category: 3, problem: 'A third person both sides chose in advance decides a dispute under their Terms.', solutions: ['award'], lean: 'keep one', turnsOnDefaults: false },
  { id: 'P10', category: 3, problem: 'Someone took money and gave nothing, with no Terms: the debt is written beside their number, proven by bytes.', solutions: ['provenClaim'], lean: 'keep one', turnsOnDefaults: false, seam: 'seam with DubWeb' },
  { id: 'P11', category: 3, problem: 'The buyer says, in a signed word, whether the seller delivered.', solutions: ['receipt'], lean: 'keep one', turnsOnDefaults: false, seam: 'seam with DubWeb' },
  { id: 'P12', category: 4, problem: 'The words of Terms are read by people, as written, with nothing computed.', solutions: ['plainSteward', 'plainCounterparty'], lean: 'merge two', turnsOnDefaults: false },
  { id: 'P13', category: 4, problem: 'A person agrees to be recorded, says what may be done with it, and can withdraw for the future.', solutions: ['consent'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P14', category: 4, problem: 'Neighbours lend a thing, with a record of the loan nobody can rewrite.', solutions: ['shelf'], lean: 'keep one', turnsOnDefaults: true },
  { id: 'P15', category: 4, problem: 'A room let between two people: rent, deposit, and whose word counts on the state of the room.', solutions: ['roomLet'], lean: 'keep one', turnsOnDefaults: false },
  { id: 'P16', category: 5, problem: 'A party leaves an agreement alone, or a stand-in it named takes the place of a party that is gone.', solutions: ['wayOut'], lean: 'keep one', turnsOnDefaults: false },
];
// gaps: problems the round met with no text (DubLaw F's reading; ground in the md)
const GAPS = [
  { id: 'G1', category: 1, problem: 'Someone refuses, in a signed act a reader can count: a party refusing a version, a role, or a case.', lean: 'a gap', acts: ['2c28bdb1', '11316a63'] },
  { id: 'G2', category: 1, problem: 'What silence means: a co-signer, a payee, a respondent or an arbiter who never answers.', lean: 'a gap', acts: [] },
  { id: 'G3', category: 5, problem: 'An agreement ends: by notice, at a term, or by the parties together.', lean: 'a gap', acts: [] },
  { id: 'G4', category: 3, problem: 'A dispute where nobody was named in advance to decide it.', lean: 'a gap', acts: [] },
  { id: 'G5', category: 4, problem: 'What the parties keep among themselves: Terms or acts that may not be republished.', lean: 'a gap', acts: [] },
  { id: 'G6', category: 1, problem: 'One clause that says which clock or reference a set of Terms reads time by, instead of each cMIP restating it.', lean: 'a gap', acts: [] },
];

// ---------- step 2: counting ----------
const ownSpec = (a) => { const s = invByAct.get(a.id); return s ? s.spec_hash : null; };
const listingBy = new Map(listing.entries.map((e) => [e.fingerprint, e]));
const SPEC_TEXT_ACTS = new Set([...inv.specifications.map((s) => s.act), ...Object.values(SOLUTIONS).flatMap((s) => s.texts.map((t) => byId(t.act).id))]);
const uniq = (x) => [...new Set(x)].sort();
const countBy = (xs) => xs.reduce((o, x) => ((o[x] = (o[x] || 0) + 1), o), {});

function useOf(fps) {
  const F = new Set(fps);
  const terms = TERMS.filter((t) => t.terms.sockets.some((s) => F.has(s.cmip)) || (t.terms.powerKinds || []).some((k) => F.has(k)) || t.terms.reliesOn.some((k) => F.has(k)));
  const sockets = countBy(terms.flatMap((t) => [...new Set([...t.terms.sockets.filter((s) => F.has(s.cmip)).map((s) => s.socket), ...((t.terms.powerKinds || []).some((k) => F.has(k)) ? ['a power\'s kind'] : []), ...(t.terms.reliesOn.some((k) => F.has(k)) ? ['relies_on'] : [])])]));
  const tIds = new Set(terms.map((t) => t.id));
  const assents = STATEMENTS.filter((s) => s.statement.kind === 'assent' && tIds.has(s.statement.terms));
  const k7 = STATEMENTS.filter((s) => s.statement.kind === 'K7' && s.statement.k7 && F.has(s.statement.k7.cmip));
  const under = ALL.filter((a) => a.published && F.has(a.spec));
  const ids = uniq([...terms, ...assents, ...k7, ...under].map((a) => a.signer).filter(Boolean));
  return {
    sockets, terms: terms.length, assents: assents.length, k7Statements: k7.length, actsUnderSpec: under.length,
    identities: ids.length, windows: uniq(ids.map(win)),
    firstTerms: terms.length ? terms.reduce((a, b) => (a.order < b.order ? a : b)).id : null,
    termsIds: terms.map((t) => t.id).sort(),
  };
}
function citedBy(text, fps) {
  // specification texts (DubWeb's inventory, and the six added) that name it in full or by an 8-character prefix
  const keys = uniq(fps.flatMap((f) => [f, f.slice(0, 8)]));
  const author = text.signer;
  const hits = TEXTS.filter((a) => a.id !== text.id && SPEC_TEXT_ACTS.has(a.id) && keys.some((k) => a.text.includes(k)));
  const mentions = TEXTS.filter((a) => a.id !== text.id && fps.some((f) => a.text.includes(f)));
  return {
    specTextsCiting: hits.map((a) => ({ act: a.id, title: a.text.startsWith('#') ? a.text.split('\n')[0].slice(0, 90) : '(a text with no heading; read it by its act id)', signer: a.signer, window: win(a.signer), sameAuthor: a.signer === author })),
    textActsNamingInFull: mentions.length, textActsNamingInFullByOthers: mentions.filter((a) => a.signer !== author).length,
  };
}
const solutionsOut = {};
for (const [k, sol] of Object.entries(SOLUTIONS)) {
  const drafts = sol.texts.map((t) => {
    const a = byId(t.act);
    const spec = ownSpec(a);
    const fps = uniq([a.id, ...(spec ? [spec] : []), ...t.extra]);
    const lst = fps.map((f) => listingBy.get(f)).find(Boolean);
    const inv1 = invByAct.get(a.id);
    return {
      key: t.key, draft: t.draft, name: t.name, act: a.id, specHash: spec, fingerprints: fps,
      author: a.signer, authorWindow: win(a.signer), textBytes: Buffer.byteLength(a.text, 'utf8'), textSha256: crypto.createHash('sha256').update(a.text).digest('hex'),
      firstLine: a.text.split('\n')[0].slice(0, 120),
      use: useOf(fps), useByFingerprint: Object.fromEntries(fps.map((f) => [f, useOf([f]).terms])),
      builtOn: citedBy(a, fps),
      kit: { inKitFiles: fps.some(inKit), wave2Listing: lst ? lst.kit.word : 'not in the wave 2 listing' },
      prompted: { inventory: inv1 ? inv1.prompted : 'not in the inventory (added text)', namedInHostPrompts: promptText.filter(([, s]) => fps.some((f) => s.includes(f) || s.includes(f.slice(0, 16)))).map(([p]) => p) },
      inventoryArea: inv1 ? inv1.area : 'added by DubLaw (slice-check.md)',
      caveat: CAVEAT,
    };
  });
  const fps = uniq(drafts.flatMap((d) => d.fingerprints));
  const faults = (FAULTS[k] || []).map(([p, what, status]) => { const a = byId(p); return { act: a.id, signer: a.signer, window: win(a.signer), what, status }; });
  solutionsOut[k] = { key: k, name: sol.name, author: drafts[0].author, authorWindow: drafts[0].authorWindow, drafts, allDrafts: useOf(fps), faults, caveat: CAVEAT };
}
// how often the slice's texts are named together in one Terms act
const fpOwner = new Map();
for (const [k, s] of Object.entries(solutionsOut)) for (const d of s.drafts) for (const f of d.fingerprints) fpOwner.set(f, k);
const pairs = {};
for (const t of TERMS) {
  const ks = uniq([...t.terms.sockets.map((s) => fpOwner.get(s.cmip)), ...(t.terms.powerKinds || []).map((x) => fpOwner.get(x))].filter(Boolean));
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const p = ks[i] + ' + ' + ks[j]; pairs[p] = (pairs[p] || 0) + 1; }
}
const allFps = uniq([...fpOwner.keys()]);
const problemsOut = PROBLEMS.map((p) => {
  const main = p.solutions.filter((s) => !(p.pointerOnly || []).includes(s));
  const fps = uniq(main.flatMap((s) => solutionsOut[s].drafts.flatMap((d) => d.fingerprints)));
  return { ...p, leanIsDubLawFs: true, solutionsMain: main, use: useOf(fps), caveat: CAVEAT };
});
const termsNamingSlice = useOf(allFps);
const termsNamingBothDefaults = TERMS.filter((t) => { const ks = new Set(t.terms.sockets.map((s) => fpOwner.get(s.cmip))); return ks.has('namedSigners') && ks.has('buyerAssent'); }).length;
const termsK2 = TERMS.filter((t) => t.terms.sockets.some((s) => s.socket === 'K2')).length;
const termsK5 = TERMS.filter((t) => t.terms.sockets.some((s) => s.socket === 'K5')).length;
const termsWithRole = TERMS.filter((t) => t.terms.parties.some((p) => p.role !== undefined)).length;
const out = {
  made: 'catalogue.mjs, DubLaw wave 3 session F; Nobody, allegedly',
  caveat: CAVEAT,
  index: { distinct: ALL.length, published: ALL.filter((a) => a.published).length, unpublished: ALL.filter((a) => !a.published).map((a) => a.id), terms: TERMS.length, statements: STATEMENTS.length, texts: TEXTS.length, agreementsSpec: AG.terms.spec },
  slice: { texts: Object.values(SOLUTIONS).reduce((n, s) => n + s.texts.length, 0) + 1, textActs: Object.values(SOLUTIONS).reduce((n, s) => n + s.texts.length, 0), note: "51 = 50 text acts + Counterparty's body named by two fingerprints (61bcdb5b..., ee0fd121...), counted as two in slice-check.md" },
  totals: {
    problems: PROBLEMS.length + GAPS.length, problemsWithText: PROBLEMS.length, gaps: GAPS.length,
    leans: countBy([...PROBLEMS, ...GAPS].map((p) => p.lean)),
    turnsOnDefaults: PROBLEMS.filter((p) => p.turnsOnDefaults).length,
    termsNamingAnySliceText: termsNamingSlice.terms, assentsToThem: termsNamingSlice.assents, identities: termsNamingSlice.identities,
    termsAll: TERMS.length, termsWithK2: termsK2, termsWithK5: termsK5, termsWithARole: termsWithRole, termsNamingNamedSignersAndBuyerByAssent: termsNamingBothDefaults,
    kitHoldsAny: Object.values(solutionsOut).some((s) => s.drafts.some((d) => d.kit.inKitFiles)),
  },
  problems: problemsOut,
  gaps: GAPS.map((g) => ({ ...g, leanIsDubLawFs: true, acts: g.acts.map((p) => { const a = byId(p); return { act: a.id, signer: a.signer, window: win(a.signer), kind: a.terms ? 'Terms' : a.statement ? 'Statement ' + a.statement.kind : a.text !== undefined ? 'text' : 'other' }; }) })),
  solutions: solutionsOut, namedTogetherInOneTerms: pairs,
  hostPromptsRead: promptText.map(([p]) => p),
};
// every other act the catalogue cites (gaps, the MOR lead's section): does it exist, who signed it, what kind is it
const CITED = ['2c28bdb1', '11316a63', '865311ab', '0785547b', 'a17ad636', '8dba1780', '94dddf2f', '8bbe3989', '7e1aa448', '293444c6', '4e9c7511',
  'c1614891', '9d6aab2e', 'bc2e3604', 'b5dd0f2c', '06309e73', '9144a9c0', '82a722c1', 'a5162e53', '298d832a', '1edde3ea', '297baf7e', '5ff4a362',
  '36a402ff', 'd4604b0a', '14e01443', '81374b4f', 'b6c78860', '9717eea1', 'fe1403bc', '53aaea9b', 'b54a2876', '94f0b3a2', 'ca9d95cd', '3b2237d8', 'f81aa8c3'];
out.citedActs = CITED.map((p) => {
  const x = ALL.filter((a) => a.id.startsWith(p));
  if (x.length !== 1) return { prefix: p, found: x.length };
  const a = x[0];
  return { prefix: p, found: 1, act: a.id, signer: a.signer, window: win(a.signer), published: a.published, kind: a.terms ? 'Terms' : a.statement ? 'Statement ' + a.statement.kind : a.text !== undefined ? 'text' : a.public ? 'other public act' : 'sealed (not opened)' };
});
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('cited acts not found once:', out.citedActs.filter((c) => c.found !== 1).map((c) => c.prefix + ':' + c.found).join(' ') || 'none');
console.log(JSON.stringify(out.totals));
for (const p of problemsOut) console.log(p.id, p.lean, 'terms', p.use.terms, 'assents', p.use.assents, 'k7', p.use.k7Statements, 'under', p.use.actsUnderSpec, 'ids', p.use.identities, JSON.stringify(p.use.sockets));
