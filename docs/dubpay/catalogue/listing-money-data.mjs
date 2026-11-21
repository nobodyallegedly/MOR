// Raw extraction: every act, every text act's four names, who names what.
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export const ROUND = process.env.MOR_ROUND || join(process.env.HOME, 'Documents/mor-round-2');
export const R = join(ROUND, '_research');
const KIT = process.env.MOR_KIT || join(ROUND, '_team/dubpay/wave-2/kit');
const { mor, plain, hex, unhex, SPECS } = await import(join(KIT, 'lib/core.mjs'));
export { mor, plain, hex, SPECS };
export const AG = mor.agreementsNewSpecs().terms.spec; // Terms (type 0) and Statements (type 1)
export const REPORT = mor.agreementsNewSpecs().report.spec;
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// ---------- 1. every act, deduplicated by id ----------
export const acts = new Map();
export const read = { feedPages: [], windowsActs: {}, sealedEntries: 0, undecodable: [] };
function add(bytes, src) {
  let d;
  try { d = mor.describeAct(bytes); } catch (e) { read.undecodable.push(src); return; }
  let a = acts.get(d.id);
  if (!a) { a = { d, bytes, homes: new Set(), kept: new Set() }; acts.set(d.id, a); }
  if (src.startsWith('home:')) a.homes.add(src.slice(5)); else a.kept.add(src.slice(7));
}
for (const h of readdirSync(join(R, 'feeds')).sort()) {
  const dir = join(R, 'feeds', h);
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.cbor')) continue;
    read.feedPages.push(`feeds/${h}/${f}`);
    const v = mor.cborDecode(new Uint8Array(readFileSync(join(dir, f))));
    const ents = Array.isArray(v) ? v : v.get(0);
    for (const e of ents) add(e instanceof Uint8Array ? e : e[2], 'home:' + h);
  }
  if (existsSync(join(dir, 'relay.db'))) {
    read.feedPages.push(`feeds/${h}/relay.db (items of kind 0, opened read-only)`);
    const db = new DatabaseSync(join(dir, 'relay.db'), { readOnly: true });
    for (const r of db.prepare('select bytes from items where kind = 0').all()) add(new Uint8Array(r.bytes), 'home:' + h);
    db.close();
  }
}
for (const w of readdirSync(join(R, 'windows')).sort()) {
  const dir = join(R, 'windows', w, 'acts');
  if (!existsSync(dir)) continue;
  let n = 0;
  for (const f of readdirSync(dir)) if (f.endsWith('.mor')) { add(new Uint8Array(readFileSync(join(dir, f))), 'window:' + w); n++; }
  read.windowsActs[w] = n;
}

// ---------- 2. when and from which window each act was first carried (the postman's log) ----------
const carried = new Map(); // sha256(bytes) -> {time, tray}
export const mediaPosts = new Map(); // sha256 -> {time, tray, bytes, to:Set}
for (const line of readFileSync(join(R, 'postman/log/carried.jsonl'), 'utf8').split('\n')) {
  if (!line) continue;
  const x = JSON.parse(line);
  if (x.event !== 'carried' || x.method !== 'POST' || !x.sent) continue;
  if (x.path === '/acts') { const c = carried.get(x.sent.sha256); if (!c || x.time < c.time) carried.set(x.sent.sha256, { time: x.time, tray: x.tray }); }
  if (x.path?.startsWith('/media')) {
    let m = mediaPosts.get(x.sent.sha256);
    if (!m) { m = { time: x.time, tray: x.tray, bytes: x.sent.bytes, status: x.status }; mediaPosts.set(x.sent.sha256, m); }
    if (x.time < m.time) Object.assign(m, { time: x.time, tray: x.tray });
  }
}
// Day of the round, Europe/Zurich (UTC+1 in November). Day one is 15 November.
const DAYNO = { '2026-11-15': 1, '2026-11-16': 2, '2026-11-17': 3, '2026-11-18': 4, '2026-11-19': 4.5, '2026-11-20': 5 };
export function dayOf(iso) { const t = new Date(new Date(iso).getTime() + 3600e3).toISOString().slice(0, 10); return { date: t, day: DAYNO[t] ?? null }; }
for (const a of acts.values()) {
  const c = carried.get(sha256(a.bytes));
  a.time = c?.time ?? null; a.tray = c?.tray ?? null;
  a.day = c ? dayOf(c.time).day : null;
  a.windows = new Set([...(a.tray ? [a.tray] : []), ...a.kept]);
}

// ---------- 3. who is who: the tray that carried an identity's acts ----------
export const trayOf = new Map(); // signer -> Map(tray -> n)
for (const a of acts.values()) {
  const s = a.d.signer; if (!s || !a.tray) continue;
  let m = trayOf.get(s); if (!m) trayOf.set(s, (m = new Map()));
  m.set(a.tray, (m.get(a.tray) || 0) + 1);
}
export function windowOfSigner(s) { const m = trayOf.get(s); if (!m) return null; return [...m].sort((x, y) => y[1] - x[1])[0][0]; }

// ---------- 4. text acts and their four names ----------
export const texts = new Map(); // id -> record
for (const a of acts.values()) {
  if (!a.d.public || a.d.spec !== SPECS.text || a.d.type !== 0) continue;
  const t = mor.cborDecode(a.d.payload).get(0);
  if (typeof t !== 'string') continue;
  a.text = t;
  let spec = null;
  try { spec = mor.decodeSpec(mor.cborEncode(new Map([[0, 0], [1, unhex(a.d.signer)], [9, t]]))).hash; } catch {}
  const bytes = Buffer.from(t, 'utf8');
  texts.set(a.d.id, { id: a.d.id, signer: a.d.signer, title: t.split('\n')[0], spec, sha256: sha256(bytes), work: mor.workHash(new Uint8Array(bytes)), act: a });
}

// ---------- 5. who names what: every 32-byte string and 64-hex in every public act ----------
// slot: 'spec' (the act is made under it), 'body' (a Terms body's cMIP), 'refs' (a reply's refs), 'payload' (anywhere else)
export const namedBy = new Map(); // hash -> Map(actId -> Set(slot))
function put(h, id, slot) { let m = namedBy.get(h); if (!m) namedBy.set(h, (m = new Map())); let s = m.get(id); if (!s) m.set(id, (s = new Set())); s.add(slot); }
function walk(x, id) {
  if (x instanceof Uint8Array) { if (x.length === 32) put(hex(x), id, 'payload'); else if (x.length > 40) { try { walk(mor.cborDecode(x), id); } catch {} } }
  else if (typeof x === 'string') { for (const m of x.matchAll(/[0-9a-f]{64}/g)) put(m[0], id, 'payload'); }
  else if (Array.isArray(x)) x.forEach((y) => walk(y, id));
  else if (x instanceof Map) for (const [k, v] of x) { walk(k, id); walk(v, id); }
}
export const termsBody = new Map(); // terms id -> body cmip
for (const a of acts.values()) {
  if (!a.d.public) continue;
  put(a.d.spec, a.d.id, 'spec');
  for (const r of a.d.refs ?? []) put(r, a.d.id, 'refs');
  let p; try { p = mor.cborDecode(a.d.payload); } catch { continue; }
  walk(p, a.d.id);
  if (a.d.spec === AG && a.d.type === 0) { try { const c = hex(p.get(4)[1][0]); termsBody.set(a.d.id, c); put(c, a.d.id, 'body'); } catch {} }
}
// Short mentions (8 to 12 hex followed by an ellipsis or a dot-dot) in text acts: a weaker, inferred naming.
export const shortIn = new Map(); // prefix8 -> Set(actId)
for (const a of acts.values()) {
  if (!a.text) continue;
  for (const m of a.text.matchAll(/(?<![0-9a-f])([0-9a-f]{8,12})(?:…|\.\.\.|\.\.)/g)) { const k = m[1].slice(0, 8); let s = shortIn.get(k); if (!s) shortIn.set(k, (s = new Set())); s.add(a.d.id); }
}

// ---------- 6. the windows' reports ----------
export const reports = [];
for (const w of readdirSync(join(R, 'windows')).sort()) {
  const dir = join(R, 'windows', w, 'reports');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).sort()) if (f.endsWith('.md')) reports.push({ window: w, file: `windows/${w}/reports/${f}`, text: readFileSync(join(dir, f), 'utf8') });
}
