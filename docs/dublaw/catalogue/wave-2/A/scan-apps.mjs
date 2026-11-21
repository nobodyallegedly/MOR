#!/usr/bin/env node
// scan-apps.mjs: DubLaw wave 2, session A. The players' apps, by code, and the acts that show agreement features used.
// Read-only over the round's research copy. Writes only apps-inventory.json (and nothing else) into --out.
//
//   node scan-apps.mjs --research ~/Documents/mor-round-2/_research --kit KIT_DIR --out OUT_DIR
//
// KIT_DIR is the players' kit, tools/postman/kit of the MOR repository at commit 74739bb (branch claude/round-2-postman).
// Every count in features-agreements.md comes from this script's output; rerun it to check them.
// Node 22.5 or later (node:sqlite, on a temporary copy of dubsar's database). No network. Never opens a key file.
// Held bytes are matched over the whole of _research, apps-from-trays/ included (added by the lead on 21 November).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const R = path.resolve(arg('research', path.join(process.env.HOME, 'Documents/mor-round-2/_research')));
const KIT = path.resolve(arg('kit', 'kit'));
const OUT = path.resolve(arg('out', '.'));
const core = await import(pathToFileURL(path.join(KIT, 'lib/core.mjs')).href);
const { mor, plain, hex, unhex, SPECS } = core;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const H = (v) => (v instanceof Uint8Array ? hex(v) : v);

// ---------------------------------------------------------------- 1. every act held in _research
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) { if (e.name === 'keys' || e.name === 'node_modules') continue; walk(p, out); }
    else if (e.isFile()) out.push(p);
  }
  return out;
}
const acts = new Map();
const stats = { feedEntries: 0, undecodable: 0, keptFiles: 0, dubsarActs: 0, dubsarSealed: 0 };
let order = 0;
function addAct(bytes, where) {
  let a;
  try { a = plain(mor.describeAct(bytes)); } catch { stats.undecodable++; return; }
  let e = acts.get(a.id);
  if (!e) { a.seen = new Set(); a.bytes = bytes; a.order = order++; acts.set(a.id, a); e = a; }
  e.seen.add(where);
}
const FEEDS = path.join(R, 'feeds');
for (const home of fs.readdirSync(FEEDS).sort()) {
  const d = path.join(FEEDS, home);
  if (!fs.statSync(d).isDirectory()) continue;
  const pages = fs.readdirSync(d).filter((f) => f.endsWith('.cbor')).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
  for (const f of pages) {
    const v = mor.cborDecode(fs.readFileSync(path.join(d, f)));
    const arr = v instanceof Map ? v.get(0).map((e) => e[2]) : v;
    for (const b of arr) { stats.feedEntries++; addAct(b, 'home:' + home); }
  }
}
const DB = path.join(FEEDS, 'dubsar-before-closure', 'relay.db');
if (fs.existsSync(DB)) {
  // SQLite updates the -shm index even when a database is opened read-only, so the database and its log are
  // copied to a private temporary folder first, and read there: nothing in _research is touched.
  const { DatabaseSync } = await import('node:sqlite');
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-apps-'));
  for (const f of ['relay.db', 'relay.db-wal']) if (fs.existsSync(path.join(FEEDS, 'dubsar-before-closure', f))) fs.copyFileSync(path.join(FEEDS, 'dubsar-before-closure', f), path.join(tmp, f));
  const db = new DatabaseSync(path.join(tmp, 'relay.db'));
  for (const r of db.prepare('select kind, bytes from items order by arrival').all()) {
    if (r.kind === 0 && r.bytes) { stats.dubsarActs++; addAct(new Uint8Array(r.bytes), 'home:dubsar'); }
    else if (r.kind === 1) stats.dubsarSealed++;
  }
  db.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
const WIN = path.join(R, 'windows');
const windows = fs.readdirSync(WIN).filter((w) => fs.statSync(path.join(WIN, w)).isDirectory()).sort();
for (const w of windows) {
  for (const p of walk(path.join(WIN, w, 'acts')).concat(walk(path.join(WIN, w, 'build')))) {
    if (!p.endsWith('.mor')) continue;
    stats.keptFiles++;
    addAct(new Uint8Array(fs.readFileSync(p)), 'kept:' + w);
  }
}
const payloadOf = (a) => { if (!a.payload) return null; try { return mor.cborDecode(unhex(a.payload)); } catch { return null; } };
const textOf = (a) => { if (a.spec !== SPECS.text || a.type !== 0) return null; const v = payloadOf(a); return v instanceof Map && typeof v.get(0) === 'string' ? v.get(0) : null; };
const strings = (v, out = []) => {
  if (v instanceof Uint8Array) out.push(hex(v)); else if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out)); else if (v instanceof Map) v.forEach((x, k) => { strings(k, out); strings(x, out); });
  return out;
};
const all = [...acts.values()].sort((a, b) => a.order - b.order);
for (const a of all) { a.text = textOf(a); a.flat = a.text ?? strings(payloadOf(a)).join(' '); }
const texts = all.filter((a) => a.text);
stats.uniqueActs = acts.size;
stats.publicActs = all.filter((a) => a.public).length;
stats.textActs = texts.length;

// ---------------------------------------------------------------- 2. media: every upload and fetch the postman carried
const LOG = fs.readFileSync(path.join(R, 'postman/log/carried.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const media = new Map();
for (const l of LOG) {
  if (!l.path || !l.path.startsWith('/media')) continue;
  const h = l.method === 'POST' ? l.sent?.sha256 : l.path.split('/')[2];
  if (!h || !/^[0-9a-f]{64}$/.test(h)) continue;
  let m = media.get(h);
  if (!m) media.set(h, (m = { hash: h, posts: [], gets: [] }));
  (l.method === 'POST' ? m.posts : m.gets).push(l);
}
// bytes held anywhere in _research (feeds' pages and databases excepted: they hold acts, not media)
const held = new Map();
for (const p of walk(R)) {
  const rel = path.relative(R, p);
  if (rel.startsWith('feeds/') && !rel.includes('/media/')) continue;
  if (p.endsWith('.mor')) continue;
  const h = sha256(fs.readFileSync(p));
  if (!held.has(h)) held.set(h, []);
  held.get(h).push(rel);
}

// ---------------------------------------------------------------- 3. what each media is: names as their announcements give them
// Each entry: hash prefix, name, version, kind, and the words that must appear in an announcing act (or a report line
// naming the hash) for the name to stand. kind: app (a program people run), script (a counting or checking
// program), data (counts, snapshots, bundles, records), words (the bytes behind a Terms fingerprint), unknown.
const CAT = [
  ['ec035b45f5fd', 'Dub for trays', '0.1.0', 'app', 'Dub for trays'], ['46098770fb15', 'Pointer Look', '0.1', 'app', 'Pointer Look 0.1'],
  ['eaa8ad33e51f', 'Edubba (tray)', '1', 'app', 'Edubba'], ['2ca2110ffbec', 'Ummia for trays', '0.1.0', 'app', 'Ummia'],
  ['2e9de3d4b92f', 'Damgar', '0.1.0', 'app', 'Damgar 0.1.0'], ['2b1864f35aa1', 'Pointer Look', '0.1.1', 'app', 'Pointer Look 0.1.1'],
  ['3e0a460add13', 'turnstile-move', '1', 'app', 'turnstile-move.mjs'], ['dd61e1e030bf', 'Dub for trays', '0.2.0', 'app', 'version 0.2.0'],
  ['ec550443ce09', 'Fennec', '0.1', 'app', 'Fennec 0.1'], ['9b6c2f609864', 'Courier', '0.1', 'app', 'Courier 0.1'],
  ['1b2f1ea251aa', 'Buy', '0.1', 'app', "'Buy' 0.1"], ['0221126a2d1a', 'Shower Pro (hostile)', '?', 'app', 'Shower Pro'],
  ['25303428d3e5', 'Damgar', '0.1.1', 'app', 'Damgar 0.1.1'], ['865625ca52c9', '(not announced)', '?', 'unknown', null],
  ['dc09721e44f7', 'Pointer Look', '0.1.2', 'app', 'Pointer Look 0.1.2'], ['03403b2f7b1d', 'Edubba (tray)', '2', 'app', 'Edubba, version 2'],
  ['5da16ec69a89', 'Dub for trays', '0.3.0', 'app', 'version 0.3.0'], ['fc0722d03579', 'Edubba (tray)', '3', 'app', 'Edubba, version 3'],
  ['3d502c76477e', 'count of the contest (count.md)', '-', 'data', 'count.md'], ['cac1591b1bb3', 'count of the contest (count.json)', '-', 'data', 'count'],
  ['50e6628851b6', 'Edubba (tray)', '4', 'app', 'Edubba, version 4'], ['ed801d6be7f4', "Steward & Co.'s words", '-', 'words', 'words'],
  ['6fed387261f1', "Steward & Co.'s deal words", '-', 'words', 'words'], ['abbe0d2d6f31', 'Damgar', '0.1.2', 'app', 'Damgar 0.1.2'],
  ['08955992ec38', '(not announced; DubLaw upload)', '?', 'unknown', null], ['234b0e723fa6', 'Damgar', '0.1.3', 'app', 'Damgar 0.1.3'],
  ['e0e79e05581f', 'Edubba (tray)', '5', 'app', 'Edubba, version 5'], ['30f9ba1aab63', 'Edubba (tray)', '6 (withdrawn)', 'app', 'Edubba, version 6'],
  ['4b060aafc6e8', 'Edubba (tray)', '7', 'app', 'Edubba, version 7'], ['b3a51fda7f62', 'Pointer Look', '0.1.3', 'app', 'Pointer Look 0.1.3'],
  ['1e41bc7b7fb5', 'Ummia for trays', '0.2.1', 'app', 'Ummia for trays 0.2.1'], ['fe77a504f14c', "Edubba Terms' words", '-', 'words', 'words'],
  ['3a5f363f3aba', 'Edubba (tray)', '8', 'app', 'ersion 8'], ['4fdd737054b2', "Steward & Co.'s words (v1)", '-', 'words', 'words'],
  ['04ce3c8c3538', "Steward & Co.'s deal words", '-', 'words', 'words'], ['1660be9e8897', "Steward & Co.'s words (v2)", '-', 'words', 'words'],
  ['6cb11c79b95c', "Steward & Co.'s work text", '-', 'words', "work's text"], ['805220fd9d85', "DubLaw's words for a maker", '-', 'words', 'words'],
  ['d78c7bc70aff', "DubLaw's words for a maker", '-', 'words', 'words'], ['daedd24e63bb', "DubLaw's words for a maker", '-', 'words', 'words'],
  ['d6c16684cf80', 'Edubba (tray)', '9', 'app', 'Edubba version 9'], ['e2290fc5e0bf', '(not announced; public-creators upload)', '?', 'unknown', null],
  ['a9410669a3bf', '(not announced; public-creators upload)', '?', 'unknown', null], ['ac68bc070edf', '(not announced; public-creators upload)', '?', 'unknown', null],
  ['1430988bc0de', '(not announced; public-creators upload)', '?', 'unknown', null], ['781aa098e3c5', '(not announced; public-creators upload)', '?', 'unknown', null],
  ['68a1d96245de', "DubLaw's words for a maker", '-', 'words', 'Terms version 1'], ['393fbe78585b', 'Damgar', '0.2.0', 'app', 'Damgar 0.2.0'],
  ['1c6dbfbb5f7d', 'Edubba (tray)', '10', 'app', 'Edubba version 10'], ['1d3ebb773d13', 'Dub for trays', '0.4.0', 'app', 'DUB FOR TRAYS 0.4.0'],
  ['789b3ce7e5fa', 'Ummia for trays', '0.3.0', 'app', 'Ummia'], ['589505b4d903', 'Ummia for trays', '0.3.1', 'app', 'Ummia for trays 0.3.1'],
  ['2af9c129723d', 'words-check', '0.1.0', 'app', 'words-check 0.1.0'], ['b78499382fd9', 'turnstile-check', '1', 'app', 'turnstile-check.mjs'],
  ['836ce017eb92', 'Edubba (tray)', '11', 'app', 'version 11'], ['f8f7c207f6c3', 'Dub for trays', '0.5.0', 'app', 'Dub'],
  ['370ed8c047fa', 'Ummia for trays', '0.4.0', 'app', 'Ummia 0.4.0'], ['d5e98eace0aa', 'Dub for trays', '0.5.1', 'app', 'Dub for trays 0.5.1'],
  ['e3bef00d93f7', 'Ummia for trays', '0.4.1', 'app', 'Ummia for trays 0.4.1'], ['d08095fb6376', 'Damgar', '0.2.1', 'app', 'Damgar 0.2.1'],
  ['6e036543a84e', 'Damgar', '0.2.2', 'app', 'Damgar 0.2.2'], ['57ed75011edd', "Postmark's place line, snapshot 1", '-', 'data', 'the line'],
  ['226ad552c8ec', "Postmark's place anchors", '-', 'data', 'anchors'], ['e4d660b8ce73', 'prove.mjs (first)', '?', 'script', 'prove.mjs'],
  ['808111c9bffb', "Postmark's place genesis", '-', 'data', null], ['2659901adac1', "Postmark's desk genesis", '-', 'data', "desk's"],
  ['a68d5abc96d5', 'register (Proven claim)', '0.1', 'script', null], ['c75609f858fb', 'register (Proven claim)', '0.2', 'script', null],
  ['dffe90fbbe2c', 'register (Proven claim)', '0.3', 'script', 'register.mjs, version 0.3'], ['0372e86b00ea', 'register (Proven claim)', '0.4', 'script', 'Register 0.4'],
  ['259a2d6dbbea', 'register (Proven claim)', '0.5', 'script', '5,804 bytes'], ['2992758f4f8c', 'register (Proven claim)', '0.6', 'script', 'Register 0.6'],
  ['332d02f91f12', 'credits-read', 'draft 1', 'script', 'credits-read.mjs'], ['33875a4edacf', 'credits-read2', 'draft 2', 'script', 'credits-read2.mjs'],
  ['55321843cffc', 'lending shelf listing words', '-', 'words', 'words: media'], ['053e962eaa72', 'cercle-count', '1', 'script', 'cercle-count.mjs, version 1'],
  ['117f7d47163b', 'cercle-count', '2', 'script', 'cercle-count.mjs version 2'], ['f75a49ef6c3b', 'warning register (register.mjs, The Back Row)', '1', 'script', 'register.mjs, 2,865 bytes'],
  ['342921d6dd5c', 'shelf', '0.1.0', 'app', 'shelf 0.1.0'], ['1443f1cf27f7', 'Pointer Cite', '0.1', 'app', 'Pointer Cite 0.1'],
  ['72507a04db1d', 'Pointer Cite', '0.1.1', 'app', 'Pointer Cite 0.1.1'], ['958ac2616939', 'Pointer Cite', '0.2', 'app', 'Pointer Cite 0.2'],
  ['4714449937d6', 'Pointer Cite', '0.2.1', 'app', 'Pointer Cite 0.2.1'], ['afbf5ec50753', 'Pointer Cite', '0.3', 'app', 'Pointer Cite 0.3'],
  ['687f9afc2ede', 'Pointer Cite', '0.3.2', 'app', 'Pointer Cite 0.3.2'], ['26d9bc87811d', 'prove.mjs', '?', 'script', 'prove.mjs'],
  ['e22d414b88dd', "Postmark's draft 5 (text)", '-', 'data', 'draft 5'], ['e2ed0e2da141', "Postmark's drill snapshot", '-', 'data', 'drill snapshot'],
  ['79314bc0cfde', "Postmark's place source", '0.5.0', 'app', '0.5.0 source'], ['1b912901c7ca', 'pot (DubPay)', '1', 'app', 'pot.mjs'],
  ['ce5bbd9a1b2b', "Stall's count of longhouse-home-2", '-', 'data', "Stall's count"], ['fa7a34716f8d', 'Ummia for trays', '0.5.0', 'app', 'Ummia for trays 0.5.0'],
  ['381f2c97f6d3', 'held', '0.1', 'app', 'held.mjs, version 0.1'], ['ef62d7461be7', "Postmark's place line, snapshot 2", '-', 'data', 'second snapshot'],
  ['34eb92d19ed5', "Postmark's place anchors", '-', 'data', 'anchors'], ['73c910cbd1ee', "Postmark's place file", '-', 'data', null],
  ['182b35bd7246', 'Dub for trays', '0.5.2', 'app', 'Dub'], ['e194f0ff0d91', 'Ummia for trays', '0.5.1', 'app', 'Ummia'],
  ['b4bb924b23f6', 'words-check', '0.1.1', 'app', 'words-check 0.1.1'], ['abada2421974', '(not announced; public-prosumers upload)', '?', 'unknown', null],
  ['b07bd318528a', '(not announced; public-prosumers upload)', '?', 'unknown', null], ['e323b113b690', 'lookup (superseded copy)', '?', 'app', 'lookup.mjs'],
  ['690e76596f9f', '(not announced; Postmark upload)', '?', 'unknown', null], ['0601ada550d9', 'lookup', '1', 'app', 'lookup.mjs, version 1'],
  ['97b6ac67413d', 'Edubba (tray)', '12', 'app', 'Edubba version 12'], ['309d57ce413d', "Postmark's place anchor file", '-', 'data', null],
  ['2ceb348eb328', "Postmark bundle: Until's notice of closing", '-', 'data', "Until's notice of closing"], ['0be07207919d', "Postmark bundle: Longhouse's handover check", '-', 'data', 'handover check'],
  ['a92685ce8a87', "Postmark bundle: Stall's count", '-', 'data', "Stall's count"], ['117f7d47163b', 'cercle-count', '2', 'script', 'cercle-count.mjs version 2'],
  ['958ac2616939', 'Pointer Cite', '0.2', 'app', 'Pointer Cite 0.2'], ['9b4661a690bb', 'pot (DubPay)', '2', 'app', 'pot.mjs'],
  ['e23953820a67', "Postmark's place line, snapshot 3", '-', 'data', 'third'], ['666e2a6093fc', "Postmark's place anchor file", '-', 'data', null],
  ['a176a9f904f3', 'Pointer Look', '0.1.4', 'app', 'Pointer Look 0.1.4'], ['c271520eaa56', 'Ummia for trays', '0.5.2', 'app', 'Ummia for trays 0.5.2'],
  ['2faf07d4066d', "Postmark bundle: the Mending Circle's Terms v2", '-', 'data', 'Mending Circle'], ['23d85fdddd8c', "Postmark bundle: Jan's lineup", '-', 'data', "Jan's lineup"],
  ['76c01a4987aa', 'Postmark bundle', '-', 'data', null], ['aef32c61516a', 'Pointer: file for Postmark and Longhouse', '?', 'unknown', null],
  ['fd02795fb9f9', 'Postmark bundle (record of two works)', '-', 'data', null], ['63d24e4a69c4', 'Postmark bundle (record of two works)', '-', 'data', null],
  ['94514e4fb4bc', 'pot (DubPay)', '3', 'app', 'pot.mjs'], ['c56f3ce70760', "Postmark's desk answer", '-', 'data', null],
  ['1ffd905845c6', "Postmark's place line, snapshot 4", '-', 'data', 'fourth snapshot'], ['4377dc53c1bf', 'lookup', '1.1', 'app', 'lookup.mjs 1.1'],
  ['1542ae4408c8', "Postmark's place line, final snapshot", '-', 'data', null], ['c026ad19ca6e', "Postmark's place anchor file", '-', 'data', null],
  ['15a4c3a9ca2a', "Postmark's place anchor file", '-', 'data', null], ['50c32afa2faa', 'pot (DubPay)', '4', 'app', 'pot'],
  ['b26c525dfe85', 'Pointer Look', '0.1.5', 'app', 'Pointer Look 0.1.5'],
];
const DUBSAR_TRAYS = new Set(['dublaw', 'dubpay', 'dubweb']);
const catalogue = new Map();
for (const [p, name, version, kind, must] of CAT) {
  const h = [...media.keys()].find((x) => x.startsWith(p));
  if (h && !catalogue.has(h)) catalogue.set(h, { name, version, kind, must });
}

// reports: every line naming a 64-hex hash, or an 8-hex prefix followed by an ellipsis
const reportLines = [];
for (const w of windows) for (const p of walk(path.join(WIN, w, 'reports'))) {
  fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => { if (/[0-9a-f]{8}/.test(line)) reportLines.push({ ref: path.relative(R, p) + ':' + (i + 1), line, window: w }); });
}
const reportsNaming = (h) => reportLines.filter((r) => r.line.includes(h) || r.line.includes(h.slice(0, 8) + '…'));

// ---------------------------------------------------------------- 4. the inventory
const apps = [];
for (const m of [...media.values()].sort((a, b) => ((a.posts[0]?.time ?? a.gets[0]?.time) < (b.posts[0]?.time ?? b.gets[0]?.time) ? -1 : 1))) {
  const ok = m.posts.filter((p) => p.status === 200);
  const bytes = ok[0]?.sent?.bytes ?? m.gets.find((g) => g.status === 200)?.answer?.bytes ?? null;
  const ann = all.filter((a) => a.flat.includes(m.hash));
  const c = catalogue.get(m.hash) ?? { name: '(not in the catalogue)', version: '?', kind: 'unknown', must: null };
  const reps = reportsNaming(m.hash);
  const trays0 = [...new Set(m.posts.map((p) => p.tray))];
  const keptBy = (a, ts) => (ts.some((t) => a.seen.has('kept:' + t)) ? 1 : 0);
  // the author: the signer of the first act that names the hash and carries the catalogue's words
  // the announcement is the act where the catalogue's words come first (a later mention by someone else does not make them its author)
  const named = c.must ? ann.filter((a) => (a.text ?? '').includes(c.must)).sort((x, y) => keptBy(y, trays0) - keptBy(x, trays0) || x.text.indexOf(c.must) - y.text.indexOf(c.must) || x.order - y.order) : [];
  const author = named[0]?.signer ?? null;
  const nameGround = named.length ? 'act ' + named[0].id : c.must && reps.some((r) => r.line.includes(c.must)) ? 'report ' + reps.find((r) => r.line.includes(c.must)).ref : c.must ? 'UNVERIFIED' : 'none';
  const heldAt = held.get(m.hash) ?? null;
  let heldKind = null;
  if (heldAt) { const b = fs.readFileSync(path.join(R, heldAt[0])); heldKind = /^(#!|\/\/|import |'use strict')/.test(b.subarray(0, 200).toString()) ? 'code' : 'not code'; }
  const trays = [...new Set(m.posts.map((p) => p.tray))];
  apps.push({
    key: 'media:' + m.hash, media_hash: m.hash, act: null, name: c.name, version: c.version, kind: c.kind,
    uploaded_by_tray: trays, dubsar: trays.some((t) => DUBSAR_TRAYS.has(t)) || /^(Edubba|Damgar|Dub for trays|Ummia for trays|pot \(DubPay\))/.test(c.name),
    author_identity: author, name_ground: nameGround,
    bytes, homes: [...new Set(ok.map((p) => p.to))], first_upload: m.posts[0]?.time ?? null,
    uploads_refused: m.posts.filter((p) => p.status !== 200).map((p) => p.to + ' ' + p.status),
    held: heldAt, held_kind: heldKind,
    fetched_by_trays: [...new Set(m.gets.filter((g) => g.status === 200).map((g) => g.tray))].filter((t) => !trays.includes(t)),
    fetches_404: m.gets.filter((g) => g.status === 404).length,
    named_in_acts: ann.map((a) => a.id), named_in_acts_by_others: ann.filter((a) => a.signer && a.signer !== author).length,
    named_in_reports: reps.map((r) => r.ref),
  });
}
// GET-only hashes that are not media (an act id asked as media, for instance)
for (const a of apps) if (!a.homes.length && !a.bytes) a.kind = acts.has(a.media_hash) ? 'not media: an act id asked for as media' : a.kind;

// code published inside text acts
const codeRe = (t) => /^(#!|\/\/|import |'use strict')/.test(t) || (/\bimport\s*\{[^}]*\}\s*from\s*['"]/.test(t) && /process\.argv|readFileSync/.test(t));
for (const a of texts) {
  if (!codeRe(a.text)) continue;
  const first = a.text.split('\n').find((l) => /[A-Za-z]/.test(l)) ?? '';
  let mm = first.match(/([A-Za-z0-9_-]+\.mjs|[A-Za-z0-9_-]+)[,]?\s+(?:version\s+)?(\d+(?:\.\d+)*)/i);
  // first lines that carry no file name: the name as the act's own text gives it, checked against that text
  const OVERRIDE = { 'ff1eaf705931': ['Longhouse handover check (Module)', 'draft 1', 'handover check, Module draft 1'], '505597a00ee5': ['Longhouse handover check (Module)', 'draft 1.1', 'Module draft 1.1'],
    '2525e63d3ce3': ["Hop's pot settlement suggestion", '?', 'A settlement suggestion'], '46aaf149b42a': ["Hop's answerer", '0.1', "Hop's answerer, 0.1"], '046b26cd3bcb': ['mending.mjs', '?', 'mending.mjs'] };
  const o = OVERRIDE[a.id.slice(0, 12)];
  if (o && a.text.includes(o[2])) mm = [null, o[0], o[1]];
  apps.push({
    key: 'act:' + a.id, media_hash: null, act: a.id, name: mm ? mm[1] : first.slice(0, 60), version: mm ? mm[2] : '?', kind: 'script (published as a text act)',
    uploaded_by_tray: [], kept_by_windows: [...a.seen].filter((s) => s.startsWith('kept:')).map((s) => s.slice(5)), dubsar: false,
    author_identity: a.signer, name_ground: 'act ' + a.id + ' (first line)', bytes: Buffer.byteLength(a.text), homes: [...a.seen].filter((s) => s.startsWith('home:')).map((s) => s.slice(5)),
    first_upload: null, uploads_refused: [], held: ['in the act itself (text act ' + a.id + ')'], held_kind: 'code', fetched_by_trays: [], fetches_404: 0,
    named_in_acts: all.filter((x) => x.id !== a.id && x.flat.includes(a.id)).map((x) => x.id), named_in_acts_by_others: all.filter((x) => x.id !== a.id && x.signer !== a.signer && x.flat.includes(a.id)).length,
    named_in_reports: reportsNaming(a.id).map((r) => r.ref), first_line: first.slice(0, 200),
  });
}
// the build/ folders: each app root, and each single-file app
const builds = [];
for (const w of windows) {
  const B = path.join(WIN, w, 'build');
  if (!fs.existsSync(B)) continue;
  for (const p of walk(B)) {
    const rel = path.relative(R, p);
    if (/\/(test|built|static|scripts|node_modules|_to_delete)\//.test(rel)) continue;
    if (p.endsWith('package.json')) {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      builds.push({ window: w, path: path.dirname(rel), name: j.name ?? path.basename(path.dirname(p)), version: j.version ?? '?', kind: 'client (package)', sha256: null });
    } else if (/\.(mjs)$/.test(p) && !/\/src\//.test(rel) && !/\.test\.mjs$/.test(p)) {
      const b = fs.readFileSync(p); const h = sha256(b); const head = b.subarray(0, 400).toString();
      const v = head.match(/[Vv]ersion\s+(\d+(?:\.\d+)*)/);
      builds.push({ window: w, path: rel, name: path.basename(p), version: v ? v[1] : '?', kind: 'single file', sha256: h, published_as_media: media.has(h) });
    } else if (/arbiter\/arbiter\.ts$/.test(p)) {
      builds.push({ window: w, path: rel, name: 'arbiter (library)', version: 'drafts 1-2', kind: 'library', sha256: sha256(fs.readFileSync(p)), published_as_media: false });
    }
  }
}
// scripts the reports name that were never published, as media or as a text act
const scriptMentions = new Map();
for (const w of windows) for (const p of walk(path.join(WIN, w, 'reports'))) {
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/([A-Za-z0-9_-]+\.(?:mjs|js|py|sh))\b/g)) {
    const n = m[1]; if (n === 'mor.mjs' || n === 'kit.mjs' || n === 'core.mjs') continue;
    if (!scriptMentions.has(n)) scriptMentions.set(n, { windows: new Set(), mentions: 0 });
    const e = scriptMentions.get(n); e.windows.add(w); e.mentions++;
  }
}
const publishedNames = new Set(apps.flatMap((a) => [a.name, a.first_line ?? '']).join(' ').toLowerCase().match(/[a-z0-9_-]+\.mjs|[a-z0-9_-]+/g));
const builtNames = new Set(builds.map((b) => b.name.toLowerCase()));
const unpublished = [...scriptMentions].filter(([n]) => {
  const base = n.toLowerCase().replace(/\.(mjs|js|py|sh)$/, '');
  if (builtNames.has(n.toLowerCase())) return false;
  // the file names under which the published apps above are run (their announcements give them)
  const PUBLISHED_FILES = ['dub.mjs', 'ummia.mjs', 'edubba.mjs', 'damgar.mjs', 'pointer-look.mjs', 'pointer-cite.mjs', 'courier.mjs', 'buy.mjs', 'held.mjs', 'lookup.mjs', 'shelf.mjs',
    'kept.mjs', 'words-check.mjs', 'turnstile-move.mjs', 'turnstile-check.mjs', 'turnstile-census.mjs', 'credits-read.mjs', 'credits-read2.mjs', 'cercle-count.mjs', 'cercle-count-v2.mjs',
    'cercle-count-2.mjs', 'prove.mjs', 'register.mjs', 'standing.mjs', 'mending.mjs', 'pot.mjs', 'answerer.mjs', 'keep-recover.mjs', 'ummia-0.5.0.mjs', 'ummia-0.5.1.mjs', 'ummia-0.5.2.mjs', 'dub-0.5.2.mjs'];
  if (PUBLISHED_FILES.includes(n.toLowerCase())) return false;
  return !texts.some((a) => codeRe(a.text) && a.text.slice(0, 300).toLowerCase().includes(n.toLowerCase())) &&
    ![...catalogue.values()].some((c) => (c.must ?? '').toLowerCase().includes(n.toLowerCase()) || c.name.toLowerCase().replace(/[^a-z0-9-]/g, '') === base.replace(/[^a-z0-9-]/g, ''));
}).map(([n, e]) => ({ script: n, windows: [...e.windows], mentions: e.mentions })).sort((a, b) => b.mentions - a.mentions);
void publishedNames;

// ---------------------------------------------------------------- 5. Agreements acts and the features they show
const AG = mor.agreementsNewSpecs();
const AGS = plain(AG).terms.spec;
const KIND = ['assent', 'counter_signature', 'contest', 'resolve'];
const terms = new Map(); const stmts = [];
for (const a of all) {
  if (a.spec !== AGS) continue;
  const m = payloadOf(a); if (!(m instanceof Map)) continue;
  if (a.type === 0) {
    const sock = (v) => (Array.isArray(v) ? H(v[0]) : null);
    const parties = (m.get(2) ?? []).map((p) => (Array.isArray(p) ? { form: p[0], v: plain(p[1]) } : { form: '?', v: plain(p) }));
    terms.set(a.id, { id: a.id, signer: a.signer, root: H(m.get(1)) ?? a.id, replaces: H(m.get(0)) ?? null, parties,
      signers: parties.filter((p) => p.form === 0).map((p) => p.v), roles: parties.filter((p) => p.form === 1).map((p) => p.v),
      agreementsAsParty: parties.filter((p) => p.form === 2).map((p) => p.v),
      body: sock(m.get(4)), inForce: sock(m.get(6)), powers: (m.get(7) ?? []).map((x) => plain(x)), place: m.has(8) ? plain(m.get(8)) : null,
      clock: m.has(9) ? plain(m.get(9)) : null, condition: sock(m.get(13)), control: sock(m.get(14)), data: sock(m.get(16)),
      previous: (m.get(19) ?? []).map(H), flat: a.flat });
  } else if (a.type === 1) {
    const k = m.get(2);
    stmts.push({ id: a.id, signer: a.signer, agreement: H(m.get(0)), terms: H(m.get(1)), kind: typeof k === 'number' ? KIND[k] ?? 'kind#' + k : H(Array.isArray(k) ? k[0] : k),
      hasContent: m.has(3), previous: (m.get(6) ?? []).map(H), seen: [...a.seen] });
  }
}
const roleCmip = (r) => { try { const s = r.map ? new Map(r.map).get(2) : null; return Array.isArray(s) ? s[0] : null; } catch { return null; } };
const ids = (xs) => xs.map((x) => x.id ?? x);
const byKind = (k) => stmts.filter((s) => s.kind === k);
const actsUnder = (spec, type) => all.filter((a) => a.spec === spec && (type === undefined || a.type === type));
const namesInSockets = (t) => [t.body, t.inForce, t.condition, t.control, t.data, ...t.roles.map(roleCmip), ...t.powers.map((p) => (Array.isArray(p) ? p[0] : null))].filter(Boolean);
const termsNaming = (cmip) => [...terms.values()].filter((t) => namesInSockets(t).includes(cmip));
const inAgreement = (roots) => { const R2 = new Set(roots); return { terms: [...terms.values()].filter((t) => R2.has(t.root)), stmts: stmts.filter((s) => R2.has(s.agreement)) }; };
const mentions = (re, excludeSigner) => texts.filter((a) => re.test(a.text) && a.signer !== excludeSigner);
const signersOf = (xs) => [...new Set(xs.map((x) => x.signer))];
const pack = (xs) => ({ count: xs.length, signers: signersOf(xs).length, ids: ids(xs) });

// forks in an author's own line: an author's assent whose previous names nothing
const forkedAuthorAssents = byKind('assent').filter((s) => { const t = terms.get(s.terms); return t && t.signer === s.signer && s.previous.length === 0; });
// buyers' assents: assents to Terms that name a role by buyer by assent, by a signer not named as a signer there
const BUYER = 'd47b432221e9fdeb2f66b506d3bd0f5f65f0da1b081dd7f3e65c13fff19270ec';
const buyerAssents = byKind('assent').filter((s) => { const t = terms.get(s.terms); return t && t.roles.some((r) => roleCmip(r) === BUYER) && !t.signers.includes(s.signer) && t.signer !== s.signer; });
const appByHash = (p) => apps.find((a) => (a.media_hash ?? a.act ?? '').startsWith(p));
const pointerLook = apps.filter((a) => a.name === 'Pointer Look');
const cite = apps.filter((a) => a.name === 'Pointer Cite');

const F = {};
F.statement_kinds = Object.fromEntries([...new Set(stmts.map((s) => s.kind))].map((k) => [k, byKind(k).length]));
F.terms_acts = terms.size; F.statements = stmts.length;
F.contests = pack(byKind('contest')); F.counter_signatures = pack(byKind('counter_signature')); F.resolves = pack(byKind('resolve'));
F.forked_author_assents = pack(forkedAuthorAssents);
F.buyer_assents = pack(buyerAssents);
F.terms_with_buyer_role = pack([...terms.values()].filter((t) => t.roles.some((r) => roleCmip(r) === BUYER)));
F.inforce_named_signers = pack([...terms.values()].filter((t) => t.inForce === 'ed7e3956354a73562105382feaffc2ccc067859d6f5a44fb5ab8870e710308be'));
F.terms_with_place = pack([...terms.values()].filter((t) => t.place));
F.terms_with_agreement_party = pack([...terms.values()].filter((t) => t.agreementsAsParty.length));
// lending shelf (Steward & Co.): K7 kind, Terms naming it, listings
const LEND = '255551a7692045f442cb15115cde25b1371a0143e18e78513c752ed5c657b536';
F.lending_statements = pack(byKind(LEND));
F.lending_terms = pack([...terms.values()].filter((t) => t.flat.includes(LEND) || stmts.some((s) => s.kind === LEND && s.agreement === t.root)));
F.lending_app_named_by_others = pack(mentions(/shelf\.mjs|342921d6/, appByHash('342921d6dd5c')?.author_identity));
// hours of care (Le Cercle de garde)
const CARE = '4a737c6692eeeb379343076f1a6e43649f56fb2b773f457db692c0780a0104a1';
const cercle = inAgreement(['ce52dfc46e5928d4ae89b101d6ce4d2274fcb624e1a968e48f1dd56469965f48']);
F.care_statements = pack(byKind(CARE));
F.cercle_terms = pack(cercle.terms); F.cercle_assents = pack(cercle.stmts.filter((s) => s.kind === 'assent'));
F.cercle_text_records = pack(texts.filter((a) => /CERCLE-(HOURS|CONFIRM)/.test(a.text)));
// money decision (Plain Words) and common pot (DubPay): K7 kinds, for completeness of the statement kinds
F.money_decision_statements = pack(byKind('8cd7b8b158b0d6f6ddaf3d294e85ca228804ec33f6183a288c44288034971a30'));
F.common_pot_statements = pack(byKind('e91f72f58d5ebe6756c6967be6e9601582668514ed43d2392ddb65ab7110c39d'));
// acts under players' own specs (not Agreements Statements)
F.proven_claims = { draft1: pack(actsUnder('ed9a4b4e99ec48af5c13db437590934f18a1c65c16d1b509af5f0f5cf7be1648')), draft2: pack(actsUnder('51f9afc8224a4d79a59881cb4e5f825e88231f198a36af4f3f67c6fb57e69f0a')) };
F.register_runs = pack(texts.filter((a) => /Register run, edition/.test(a.text)));
F.delivery_receipts = { draft1: pack(actsUnder('ec1f118d998f150cb2a693f7f7b77ddb4a59f21deab95aabfbf20b19e6bc4bc7')), draft2: pack(actsUnder('9e19e62c480143c241171984d8e5d05d1d71a7811958e966279932f83ae82a2a')) };
F.kept_word_charter = (() => { const x = inAgreement(['825b834deabfa35c3c9cce6cd1dd67b9e6445e1c41c1660df82e1af816e0245b']); return { terms: pack(x.terms), assents: pack(x.stmts.filter((s) => s.kind === 'assent')) }; })();
F.credits = { ampersand_d1: pack(actsUnder('91a94236a35adaf3f09c57cfa939e7adbf0cc23c853543d165e9b4fed6cf8005')), ampersand_d2: pack(actsUnder('4a4f08c295bdb8cbb0abd61936ce0a181805dfb67bde84f4678dcd20835a36f6')),
  backlot_in_terms: pack(termsNaming('29dc728f34a2cbd76987f70079e8ba97e3516f43b0bd58104a21e415d8f900e3')) };
F.warning_notices = { d1: pack(actsUnder('56dd08144a9b5cf26565acef3b7216cf6477514e65b2bade0405c3e061170815')), d2: pack(actsUnder('01cdcebb00e612e77300383d08f82a843a9f582d8105a5767bd340ea7476135f')), d3: pack(actsUnder('9b88aee2bc0ca6269c116e7c3ba71bd1681425218f8743331472ed1eef4a310b')) };
const AWARD = ['ebcc09e34317484cf3ab2a611aa57cd329cea9ecd866397a2eee398a0886c6b4', '7d42b01cd8cb230a355ca6b18cf015c610683a2876e9e283605126d14cff9130'];
F.award = { acts_under: pack(all.filter((a) => AWARD.includes(a.spec))), terms_naming: pack([...terms.values()].filter((t) => AWARD.some((h) => t.flat.includes(h)))), statements_of_kind: pack(stmts.filter((s) => AWARD.includes(s.kind))) };
F.findings_in_trust = pack(actsUnder('0d23dd943d9be51883421b4222536764cee86c620da4cefd69e3315991e30839'));
F.place_records = pack(actsUnder('53b1b4bec1782cebf8c90d89c3a9b6008e13767e2a996dd6ce94c8bf7c96da77'));
// the word in advance (Odile Ferrant's Terms, read by standing.mjs)
const ODILE = [...terms.values()].find((t) => t.id.startsWith('66072149'));
F.word_in_advance = ODILE ? (() => { const x = inAgreement([ODILE.root]); return { root: ODILE.root, terms: pack(x.terms), assents: pack(x.stmts.filter((s) => s.kind === 'assent')), statements: pack(x.stmts) }; })() : null;
F.standing_named_by_others = pack(mentions(/standing\.mjs/, 'f9de7f3e611fd4adffde10b755383b8f67eb4d0364913afab77a8d36904b5291'));
// apps named by people other than their authors (a reading of reach, not of use)
const reach = (list, re) => { const authors = new Set(list.map((a) => a.author_identity).filter(Boolean)); return pack(texts.filter((a) => !authors.has(a.signer) && (re.test(a.text) || list.some((x) => x.media_hash && a.text.includes(x.media_hash))))); };
F.named_by_others = {
  'Pointer Look': reach(pointerLook, /Pointer Look/), 'Pointer Cite': reach(cite, /Pointer Cite|pointer-cite/),
  Buy: reach(apps.filter((a) => a.name === 'Buy'), /'Buy' 0\.1|buy\.mjs/), Courier: reach(apps.filter((a) => a.name === 'Courier'), /Courier 0\.1|courier\.mjs/),
  'turnstile-check': reach(apps.filter((a) => a.name === 'turnstile-check'), /turnstile-check/), 'words-check': reach(apps.filter((a) => a.name === 'words-check'), /words-check/),
  shelf: reach(apps.filter((a) => a.name === 'shelf'), /shelf\.mjs/), register: reach(apps.filter((a) => a.name.startsWith('register (Proven')), /register\.mjs|register 0\.\d|Register 0\.\d/),
  'kept.mjs': reach(apps.filter((a) => a.name === 'kept.mjs'), /kept\.mjs/), 'cercle-count': reach(apps.filter((a) => a.name === 'cercle-count'), /cercle-count/),
  'credits-read': reach(apps.filter((a) => a.name.startsWith('credits-read')), /credits-read/), 'turnstile-move': reach(apps.filter((a) => a.name === 'turnstile-move'), /turnstile-move/),
  'turnstile-census': reach(apps.filter((a) => a.name === 'turnstile-census.mjs'), /turnstile-census/), 'Longhouse handover check': pack(mentions(/handover check/i, 'b820fe4bbcc0c2a05766a577c8167292bcdff19593b1bb49977b69eca52310f1')),
  'mending.mjs': reach(apps.filter((a) => a.name === 'mending.mjs'), /mending\.mjs/), Edubba: reach(apps.filter((a) => a.name.startsWith('Edubba')), /Edubba/),
};

// ---------------------------------------------------------------- 6. write
const toFetch = apps.filter((a) => a.media_hash && !a.held && a.homes.length).map((a) => ({ media_hash: a.media_hash, name: a.name, version: a.version, kind: a.kind, bytes: a.bytes, homes: a.homes, uploaded_by_tray: a.uploaded_by_tray }));
const out = {
  made_by: 'scan-apps.mjs (DubLaw wave 2, session A), for Nobody, allegedly', research: '_research (read-only)', kit: '74739bb tools/postman/kit',
  stats: { ...stats, media_hashes: media.size, media_held: apps.filter((a) => a.media_hash && a.held).length, media_to_fetch: toFetch.length,
    code_in_text_acts: apps.filter((a) => a.act).length, terms: terms.size, statements: stmts.length, report_lines_with_hashes: reportLines.length },
  apps, builds, to_fetch: toFetch, named_in_reports_never_published: unpublished, features: F,
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'apps-inventory.json'), JSON.stringify(out, null, 1) + '\n');
const short = (x) => (x ? x.slice(0, 12) : '-');
console.log(JSON.stringify(out.stats));
console.log('features:', JSON.stringify(Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v?.count ?? (typeof v === 'object' ? Object.fromEntries(Object.entries(v ?? {}).map(([a, b]) => [a, b?.count ?? b])) : v)]))));
console.log('to fetch:', toFetch.length, '; unverified names:', apps.filter((a) => a.name_ground === 'UNVERIFIED').map((a) => short(a.media_hash) + ' ' + a.name).join('; ') || 'none');
