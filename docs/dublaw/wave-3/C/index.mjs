#!/usr/bin/env node
// index.mjs: DubLaw wave 3, session C (Nobody, allegedly). An independent index of every public act in _research.
// Written from scratch for this check; it shares no code with wave 2's scripts. Read-only over _research.
//
//   node index.mjs RESEARCH_DIR KIT_DIR OUT_DIR
//
// Sources: every feed page in feeds/*/ (*.cbor), dubsar's database before closure (items of kind 0, read from a
// private copy of relay.db and its log in OUT_DIR/tmp, deleted after), and every *.mor file anywhere in _research
// (folders named keys are skipped). Sealed acts are never opened: an act the core describes as not public is
// counted and left. Writes OUT_DIR/index.json (one entry per act id) and prints its totals.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [R, KIT, OUT] = process.argv.slice(2).map((p) => path.resolve(p));
const { mor, plain, hex } = await import(pathToFileURL(path.join(KIT, 'lib/core.mjs')).href);
const AG = plain(mor.agreementsNewSpecs());
const TEXT = 'a9167c22f01bd8f9489bd364f04b1144d5ff7a755aa59ffdbf34cfac374daf80';

const acts = new Map();
const totals = { items: 0, undecodable: 0, notPublic: 0, fromFeeds: 0, fromDb: 0, fromFiles: 0 };
let order = 0;
function take(bytes, where) {
  totals.items++;
  let a;
  try { a = plain(mor.describeAct(bytes)); } catch { totals.undecodable++; return; }
  let e = acts.get(a.id);
  if (!e) {
    e = { id: a.id, signer: a.signer ?? null, public: !!a.public, spec: a.spec ?? null, type: a.type ?? null, order: order++, where: [] };
    if (a.public && a.payload) e.payload = a.payload;
    if (a.refs) e.refs = a.refs;
    acts.set(a.id, e);
  }
  if (!e.where.includes(where)) e.where.push(where);
}

// 1. feed pages, oldest first
const FEEDS = path.join(R, 'feeds');
for (const home of fs.readdirSync(FEEDS).sort()) {
  const d = path.join(FEEDS, home);
  if (!fs.statSync(d).isDirectory()) continue;
  const pages = fs.readdirSync(d).filter((f) => f.endsWith('.cbor'))
    .sort((x, y) => Number(x.match(/(\d+)\.cbor$/)[1]) - Number(y.match(/(\d+)\.cbor$/)[1]));
  for (const f of pages) {
    const v = mor.cborDecode(new Uint8Array(fs.readFileSync(path.join(d, f))));
    let list;
    if (Array.isArray(v)) list = v;
    else if (v instanceof Map) list = (v.get(0) || []).map((x) => (Array.isArray(x) ? x.find((y) => y instanceof Uint8Array && y.length > 64) : x));
    else list = [];
    for (const b of list) if (b instanceof Uint8Array) { totals.fromFeeds++; take(b, 'feed:' + home); }
  }
}

// 2. dubsar's database, on a private copy (the -wal must come with it)
const DBDIR = path.join(FEEDS, 'dubsar-before-closure');
if (fs.existsSync(path.join(DBDIR, 'relay.db'))) {
  const tmp = path.join(OUT, 'tmp-db');
  fs.mkdirSync(tmp, { recursive: true });
  for (const f of ['relay.db', 'relay.db-wal']) if (fs.existsSync(path.join(DBDIR, f))) fs.copyFileSync(path.join(DBDIR, f), path.join(tmp, f));
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(path.join(tmp, 'relay.db'));
  for (const row of db.prepare('SELECT bytes FROM items WHERE kind = 0 AND bytes IS NOT NULL ORDER BY arrival').all()) {
    totals.fromDb++; take(new Uint8Array(row.bytes), 'db:dubsar');
  }
  db.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}

// 3. every .mor file
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) { if (e.name !== 'keys') walk(p); }
    else if (e.name.endsWith('.mor')) { totals.fromFiles++; { const rel = path.relative(R, p).split(path.sep); take(new Uint8Array(fs.readFileSync(p)), 'file:' + rel.slice(0, 2).join('/') + (rel[2] === 'acts' ? '/acts' : '/' + rel.slice(2).join('/'))); } }
  }
}
walk(R);

// 4. decode what this check reads: Terms, Statements, texts
const H = (v) => (v instanceof Uint8Array ? hex(v) : v);
const sock = (s) => (Array.isArray(s) && s.length === 2 ? { cmip: H(s[0]), params: s[1] instanceof Uint8Array ? hex(s[1]) : null } : null);
const KINDS = ['assent', 'counter_signature', 'contest', 'resolve'];
const stat = { terms: 0, statements: 0, texts: 0, undecodedPayload: 0 };
for (const e of acts.values()) {
  if (!e.payload) continue;
  let m;
  try { m = mor.cborDecode(new Uint8Array(Buffer.from(e.payload, 'hex'))); } catch { stat.undecodedPayload++; continue; }
  if (!(m instanceof Map)) continue;
  if (e.spec === AG.terms.spec && e.type === 0) {
    stat.terms++;
    const t = { sockets: [] };
    if (m.has(1)) t.agreement = H(m.get(1)); if (m.has(0)) t.replaces = H(m.get(0));
    const prev = m.get(19); t.previous = Array.isArray(prev) && prev.length ? H(prev[0]) : null;
    const parties = m.get(2) || [];
    t.parties = parties.map((p, i) => {
      if (!Array.isArray(p)) return { bad: true };
      if (p[0] === 0) return { signer: H(p[1]) };
      if (p[0] === 2) return { agreement: H(p[1]) };
      if (p[0] === 1) { const r = p[1] instanceof Map ? p[1] : new Map(); const s = sock(r.get(2)); if (s) t.sockets.push({ socket: 'K5', at: 'party ' + i, ...s }); return { role: { kind: r.get(0), what: H(r.get(1)) } }; }
      return { bad: true };
    });
    const body = m.get(4); if (Array.isArray(body)) { t.words = H(body[0]); const s = sock(body[1]); if (s) t.sockets.push({ socket: 'K1', ...s }); }
    const add = (k, name) => { const s = sock(m.get(k)); if (s) t.sockets.push({ socket: name, ...s }); };
    add(6, 'K2'); add(13, 'K4'); add(14, 'K6'); add(16, 'K8');
    for (const [i, pw] of (m.get(7) || []).entries()) { if (Array.isArray(pw)) { const s = sock(pw[1]); if (s) t.sockets.push({ socket: 'K3', at: 'power ' + i, kind: H(pw[0]), ...s }); } }
    if (m.has(5)) t.reliesOn = (m.get(5) || []).map(H);
    if (m.has(17)) t.resolves = m.get(17).map(H);
    e.terms = t;
  } else if (e.spec === AG.statement.spec && e.type === 1) {
    stat.statements++;
    const k = m.get(2);
    const s = { agreement: H(m.get(0)), terms: H(m.get(1)) };
    if (typeof k === 'number') s.kind = KINDS[k] ?? 'kind ' + k; else { const so = sock(k); s.kind = 'K7'; s.k7 = so; }
    const prev = m.get(6); s.previous = Array.isArray(prev) && prev.length ? H(prev[0]) : null;
    if (m.has(5)) s.under = H(m.get(5));
    e.statement = s;
  } else if (e.spec === TEXT && e.type === 0) {
    stat.texts++;
    const text = m.get(0);
    if (typeof text === 'string') e.text = text;
  }
  delete e.payload;
}
fs.mkdirSync(OUT, { recursive: true });
const out = { made: 'index.mjs, DubLaw wave 3 session C', totals: { ...totals, distinct: acts.size, public: [...acts.values()].filter((a) => a.public).length, ...stat, agreementsSpecs: AG }, acts: [...acts.values()] };
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(out));
console.log(JSON.stringify(out.totals));
