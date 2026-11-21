// DubLaw wave 2, session B. Step 1: decode every act once, by code.
// Usage: node 1-decode.mjs RESEARCH_DIR KIT_DIR OUT_DIR
// RESEARCH_DIR: _research (read only). KIT_DIR: tools/postman/kit of the MOR repository at 74739bb7.
// Sources: every home's feed pages, postmark-place's record pages, dubsar's relay database (read from a copy,
// with sqlite3 -readonly), and every window's acts/. Deduplicated by act id. Sealed containers are never opened:
// they are listed by the SHA-256 of their bytes, as sealed. Writes OUT_DIR/acts.jsonl (one decoded act per line)
// and OUT_DIR/all-acts-index.json.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';

const [R, KIT, OUT] = process.argv.slice(2);
const { mor, SPECS } = await import(join(KIT, 'lib/core.mjs'));
const AG = mor.agreementsNewSpecs();
const hex = (b) => Buffer.from(b).toString('hex');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const J = (v) => {
  if (v instanceof Uint8Array) return { h: hex(v) };
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Map) return Object.fromEntries([...v].map(([k, x]) => [String(k), J(x)]));
  if (Array.isArray(v)) return v.map(J);
  return v;
};
const SPEC_NAME = { [SPECS.identity]: 'identity', [SPECS.envelopes]: 'envelopes', [SPECS.text]: 'text', [SPECS.money]: 'money', [SPECS.agreements]: 'agreements-old', [SPECS.development]: 'development', [AG.terms.spec]: 'agreements', [AG.report.spec]: 'report-block' };

const acts = new Map(); // id -> record
const sealed = new Map(); // sha256 -> {sources}
const stats = { items: 0, acts: 0, sealedItems: 0, media: 0, undecodable: 0, bySource: {} };

function add(bytes, src, pos) {
  stats.items++;
  stats.bySource[src] = (stats.bySource[src] ?? 0) + 1;
  let d;
  try {
    d = mor.describeAct(bytes);
  } catch {
    stats.undecodable++;
    return;
  }
  stats.acts++;
  let r = acts.get(d.id);
  if (!r) {
    r = { id: d.id, signer: d.signer ?? null, spec: d.spec, specName: SPEC_NAME[d.spec] ?? null, type: d.type, public: d.public, position: d.position ?? null, to: d.to ?? null, refs: d.refs ?? [], sha256: sha(bytes), bytes: bytes.length, sources: [] };
    if (d.payload) {
      const p = typeof d.payload === 'string' ? Uint8Array.from(Buffer.from(d.payload, 'hex')) : d.payload;
      try {
        r.payload = J(mor.cborDecode(p));
      } catch {
        r.payloadUndecodable = true;
      }
    } else r.payloadLocked = true; // a private act held without its key: not opened
    acts.set(d.id, r);
  }
  r.sources.push(pos === null ? { src } : { src, pos });
}
function addSealed(bytes, src, pos) {
  stats.items++;
  stats.sealedItems++;
  stats.bySource[src] = (stats.bySource[src] ?? 0) + 1;
  const h = sha(bytes);
  const s = sealed.get(h) ?? { sha256: h, sources: [] };
  s.sources.push({ src, pos });
  sealed.set(h, s);
}

// 1. Home feeds: feed-after-N.cbor, {0: [[arrival, kind, bytes]...], 1: next}
const feeds = join(R, 'feeds');
for (const home of readdirSync(feeds).sort()) {
  const dir = join(feeds, home);
  for (const f of readdirSync(dir).filter((f) => /^feed-after-\d+\.cbor$/.test(f)).sort((a, b) => parseInt(a.slice(11)) - parseInt(b.slice(11)))) {
    const m = mor.cborDecode(new Uint8Array(readFileSync(join(dir, f))));
    for (const [arrival, kind, item] of m.get(0)) {
      if (Number(kind) === 0) add(item, home, Number(arrival));
      else if (Number(kind) === 1) addSealed(item, home, Number(arrival));
      else stats.media++;
    }
  }
  // 2. Postmark-place's record: records-N.cbor, an array of record acts, positions N, N+1, ...
  for (const f of readdirSync(dir).filter((f) => /^records-\d+\.cbor$/.test(f))) {
    const base = parseInt(f.slice(8));
    const arr = mor.cborDecode(new Uint8Array(readFileSync(join(dir, f))));
    arr.forEach((b, i) => add(b, home + '#record', base + i));
  }
}
// 3. Dubsar's relay database, read from a temporary copy (the WAL with it), read only.
const db = join(feeds, 'dubsar-before-closure', 'relay.db');
if (existsSync(db)) {
  const tmp = mkdtempSync(join(tmpdir(), 'dubsar-'));
  for (const f of ['relay.db', 'relay.db-wal', 'relay.db-shm']) if (existsSync(join(feeds, 'dubsar-before-closure', f))) cpSync(join(feeds, 'dubsar-before-closure', f), join(tmp, f));
  const out = execFileSync('sqlite3', ['-readonly', '-separator', '|', join(tmp, 'relay.db'), 'select arrival, kind, hex(bytes) from items where bytes is not null order by arrival'], { maxBuffer: 1 << 30 }).toString();
  for (const line of out.split('\n')) {
    if (!line) continue;
    const [a, k, h] = line.split('|');
    const b = Uint8Array.from(Buffer.from(h, 'hex'));
    if (k === '0') add(b, 'dubsar', Number(a));
    else if (k === '1') addSealed(b, 'dubsar', Number(a));
    else stats.media++;
  }
}
// 4. Every window's acts/
const wins = join(R, 'windows');
for (const w of readdirSync(wins).sort()) {
  const dir = join(wins, w, 'acts');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).sort()) if (f.endsWith('.mor')) add(new Uint8Array(readFileSync(join(dir, f))), 'window:' + w, null);
}

// The postman's log: the first time each act's exact bytes were carried by POST /acts, and by which tray.
const carried = new Map();
for (const line of readFileSync(join(R, 'postman/log/carried.jsonl'), 'utf8').split('\n')) {
  if (!line.includes('"POST"')) continue;
  const e = JSON.parse(line);
  if (!e.path?.startsWith('/acts') || !e.sent?.sha256) continue;
  const c = carried.get(e.sent.sha256);
  if (!c) carried.set(e.sent.sha256, { first: e.time, tray: e.tray, trays: [e.tray], to: [e.to], status: [e.status] });
  else {
    if (!c.trays.includes(e.tray)) c.trays.push(e.tray);
    if (!c.to.includes(e.to)) c.to.push(e.to);
  }
}
let withTime = 0;
for (const r of acts.values()) {
  const c = carried.get(r.sha256);
  if (c) {
    r.carried = { first: c.first, tray: c.tray, trays: c.trays, to: c.to };
    withTime++;
  }
}
stats.distinctActs = acts.size;
stats.distinctSealed = sealed.size;
stats.actsWithCarriedTime = withTime;
const bySpec = {};
for (const r of acts.values()) bySpec[(r.specName ?? r.spec) + '/' + r.type] = (bySpec[(r.specName ?? r.spec) + '/' + r.type] ?? 0) + 1;
stats.bySpecType = bySpec;

// Feed order: the first time the postman carried the act; then, for acts it never carried, the source and position.
const order = [...acts.values()].sort((a, b) => (a.carried?.first ?? '9') .localeCompare(b.carried?.first ?? '9') || (a.sources[0].src + String(a.sources[0].pos ?? 0).padStart(8, '0')).localeCompare(b.sources[0].src + String(b.sources[0].pos ?? 0).padStart(8, '0')) || a.id.localeCompare(b.id));
order.forEach((r, i) => (r.order = i));
writeFileSync(join(OUT, 'acts.jsonl'), order.map((r) => JSON.stringify(r)).join('\n') + '\n');
const index = order.map((r) => {
  const home = r.sources.find((s) => !s.src.startsWith('window:'));
  const c = r.payload ?? {};
  let cmip = null;
  if (r.specName === 'agreements' && r.type === 0 && c['4']) cmip = c['4']?.[1]?.[0]?.h ?? null;
  return { id: r.id, signer: r.signer, spec: r.spec, specName: r.specName, type: r.type, public: r.public, bodyCmip: cmip, home: home?.src ?? null, feedPosition: home?.pos ?? null, homes: r.sources.filter((s) => !s.src.startsWith('window:')).map((s) => [s.src, s.pos]), keptBy: r.sources.filter((s) => s.src.startsWith('window:')).map((s) => s.src.slice(7)), firstCarried: r.carried?.first ?? null, tray: r.carried?.tray ?? null, order: r.order };
});
writeFileSync(join(OUT, 'all-acts-index.json'), JSON.stringify({ made: 'by 1-decode.mjs, DubLaw wave 2 session B', fields: { order: 'feed order used throughout: the first time the postman carried the act exact bytes (postman/log/carried.jsonl), then acts it never carried by source and position', home: 'first home or record the act is in; feedPosition: its arrival number there (record position for postmark-place#record)', keptBy: 'windows whose acts/ hold it', bodyCmip: 'Terms only: the spec hash in the body socket (K1)' }, sealed: [...sealed.values()].map((s) => ({ sha256: s.sha256, sealed: true, homes: s.sources.map((x) => [x.src, x.pos]) })), stats, acts: index }));
writeFileSync(join(OUT, 'decode-stats.json'), JSON.stringify(stats, null, 1));
console.log(JSON.stringify(stats, null, 1));
