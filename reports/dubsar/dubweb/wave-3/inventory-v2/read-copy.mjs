// read-copy.mjs — lines 21 to 208 of inventory.mjs (the copy run), unchanged, exported for wave3.mjs: the same reading of _research.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync, copyFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash, createDecipheriv } from 'node:crypto';

// ------------------------------------------------------------------ arguments
const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
const here = dirname(fileURLToPath(import.meta.url));
const candidates = [opt.research, process.env.MOR_RESEARCH, '_research', join(here, '..', '..', '..', '..', '_research'),
  join(process.env.HOME ?? '', 'Documents', 'mor-round-2', '_research')].filter(Boolean);
const RESEARCH = candidates.map((p) => resolve(p)).find((p) => existsSync(join(p, 'feeds')));
if (!RESEARCH) { console.error('No _research folder found: pass --research DIR'); process.exit(1); }
const OUT = resolve(opt.out ?? 'inventory-web.json');

// ------------------------------------------------------------------ primitives
const sha = (b) => createHash('sha256').update(b).digest();
const hx = (b) => Buffer.from(b).toString('hex');
const tagged = (tag, data) => { const t = sha(Buffer.from(tag)); return createHash('sha256').update(t).update(t).update(data).digest(); };
const HEX64 = /^[0-9a-f]{64}$/;

/** Deterministic CBOR, decoded: maps as Map (with .raw, the bytes they came from), byte strings as Buffer. */
function cborDecode(buf) {
  let p = 0;
  const head = () => {
    const b = buf[p++]; const major = b >> 5; const ai = b & 31; let n;
    if (ai < 24) n = ai; else if (ai === 24) n = buf[p++];
    else if (ai === 25) { n = buf.readUInt16BE(p); p += 2; } else if (ai === 26) { n = buf.readUInt32BE(p); p += 4; }
    else if (ai === 27) { n = Number(buf.readBigUInt64BE(p)); p += 8; } else throw new Error('indefinite length');
    return [major, n, ai];
  };
  const item = () => {
    const start = p; const [major, n, ai] = head();
    if (major === 0) return n;
    if (major === 1) return -1 - n;
    if (major === 2) { const v = buf.subarray(p, p + n); p += n; return v; }
    if (major === 3) { const v = buf.subarray(p, p + n).toString('utf8'); p += n; return v; }
    if (major === 4) { const a = []; for (let i = 0; i < n; i++) a.push(item()); return a; }
    if (major === 5) { const m = new Map(); for (let i = 0; i < n; i++) { const k = item(); m.set(k, item()); } m.raw = buf.subarray(start, p); return m; }
    if (major === 6) return { tag: n, value: item() };
    if (ai === 20) return false; if (ai === 21) return true; if (ai === 22) return null;
    throw new Error('unsupported simple value');
  };
  const v = item();
  if (p !== buf.length) throw new Error('trailing bytes');
  return v;
}
const cborHead = (major, n) => n < 24 ? Buffer.from([(major << 5) | n]) : n < 256 ? Buffer.from([(major << 5) | 24, n])
  : n < 65536 ? Buffer.from([(major << 5) | 25, n >> 8, n & 255]) : (() => { const b = Buffer.alloc(5); b[0] = (major << 5) | 26; b.writeUInt32BE(n, 1); return b; })();

/** A specification's content as the hosts' kit builds it ({0: kind, 1: creator, 9: text}), and its spec hash. */
function specContent(text, creator, kind) {
  const t = Buffer.from(text, 'utf8');
  return Buffer.concat([cborHead(5, 3), cborHead(0, 0), cborHead(0, kind), cborHead(0, 1), cborHead(2, 32), Buffer.from(creator, 'hex'), cborHead(0, 9), cborHead(3, t.length), t]);
}
const specHash = (text, creator, kind = 0) => hx(tagged('MOR/spec', specContent(text, creator, kind)));

function hchacha20(key, n16) {
  const s = new Uint32Array(16); s.set([0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]);
  for (let i = 0; i < 8; i++) s[4 + i] = key.readUInt32LE(i * 4);
  for (let i = 0; i < 4; i++) s[12 + i] = n16.readUInt32LE(i * 4);
  const r = (a, b) => ((a << b) | (a >>> (32 - b))) >>> 0;
  const q = (a, b, c, d) => { s[a] = (s[a] + s[b]) >>> 0; s[d] = r(s[d] ^ s[a], 16); s[c] = (s[c] + s[d]) >>> 0; s[b] = r(s[b] ^ s[c], 12);
    s[a] = (s[a] + s[b]) >>> 0; s[d] = r(s[d] ^ s[a], 8); s[c] = (s[c] + s[d]) >>> 0; s[b] = r(s[b] ^ s[c], 7); };
  for (let i = 0; i < 10; i++) { q(0, 4, 8, 12); q(1, 5, 9, 13); q(2, 6, 10, 14); q(3, 7, 11, 15); q(0, 5, 10, 15); q(1, 6, 11, 12); q(2, 7, 8, 13); q(3, 4, 9, 14); }
  const o = Buffer.alloc(32); for (let i = 0; i < 4; i++) { o.writeUInt32LE(s[i], i * 4); o.writeUInt32LE(s[12 + i], 16 + i * 4); }
  return o;
}
/** XChaCha20-Poly1305, no associated data (core/src/lock.rs). Used only with a key the act's own outside carries. */
function unlock(locked, key, nonce) {
  const d = createDecipheriv('chacha20-poly1305', hchacha20(key, nonce.subarray(0, 16)), Buffer.concat([Buffer.alloc(4), nonce.subarray(16, 24)]), { authTagLength: 16 });
  d.setAuthTag(locked.subarray(locked.length - 16));
  return Buffer.concat([d.update(locked.subarray(0, locked.length - 16)), d.final()]);
}

/** An act: [outside, locked, signature]. Public (content key on the outside) acts are opened; sealed or private ones are not. */
function describe(bytes) {
  const a = cborDecode(Buffer.from(bytes));
  if (!Array.isArray(a) || a.length !== 3 || !(a[0] instanceof Map)) throw new Error('not an act');
  const out = a[0];
  const id = hx(tagged('MOR/act', out.raw));
  const r = { id, signer: out.get(0) ? hx(out.get(0)) : id, public: Buffer.isBuffer(out.get(5)) };
  if (!r.public) return r;
  const ins = cborDecode(unlock(a[1], out.get(5), out.get(4)));
  r.spec = hx(ins.get(0)); r.type = ins.get(1); r.payload = ins.get(4) ?? new Map();
  r.refs = ins.get(8) ?? []; r.position = ins.get(5) ?? null;
  return r;
}

// ------------------------------------------------------------------ the round's constants (test values)
const TEXT_MIR = hx(sha('TEXT, test value until the freeze'));     // a9167c22…af80, text acts: type 0, payload {0: text}
const AGREEMENTS = 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c'; // the round's Agreements (draft 25); type 0 = Terms
const MIRS = { [hx(sha('IDENTITY, test value until the freeze'))]: 'Identity MIR', [hx(sha('ENVELOPE, test value until the freeze'))]: 'Envelopes MIR', [TEXT_MIR]: 'Text MIR', [AGREEMENTS]: 'Agreements (draft 25)' };
const KINDS = Array.from({ length: 16 }, (_, k) => k); // spec kinds tried; the kit's default is 0
const SOCKET_NAMES = { 16: 'data socket' };

// ------------------------------------------------------------------ reading the copy
const acts = new Map(); // id -> { d, seen: { home: [arrival...] } }
const stats = { items: 0, sealedItems: 0, notActs: 0, private: 0, perHome: {} };
function take(home, arrival, bytes) {
  stats.items++;
  let d; try { d = describe(bytes); } catch { stats.notActs++; return; }
  if (!d.public) { stats.private++; return; }
  let x = acts.get(d.id); if (!x) acts.set(d.id, (x = { d, bytes: Buffer.from(bytes), seen: {} }));
  (x.seen[home] ??= []).push(arrival);
  stats.perHome[home] = (stats.perHome[home] ?? 0) + 1;
}
const FEEDS = join(RESEARCH, 'feeds');
const num = (f) => Number(f.match(/(\d+)\.cbor$/)?.[1] ?? 0);
for (const home of readdirSync(FEEDS).sort()) {
  const dir = join(FEEDS, home);
  if (!statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith('.cbor')).sort((a, b) => num(a) - num(b));
  for (const f of files) {
    const v = cborDecode(readFileSync(join(dir, f)));
    if (Array.isArray(v)) { // postmark-place: a page of records, each an act; record number = page start + index + 1
      v.forEach((b, i) => take(home, num(f) + i + 1, b));
    } else for (const [arrival, kind, bytes] of v.get(0) ?? []) {
      if (Number(kind) !== 0) { stats.sealedItems++; continue; } // kind 1: a sealed container, never opened
      take(home, Number(arrival), bytes);
    }
  }
  if (existsSync(join(dir, 'relay.db'))) {
    const tmp = mkdtempSync(join(tmpdir(), 'inventory-'));
    try {
      for (const f of readdirSync(dir).filter((f) => f.startsWith('relay.db'))) copyFileSync(join(dir, f), join(tmp, f));
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(join(tmp, 'relay.db'));
      for (const row of db.prepare('SELECT arrival, kind, bytes FROM items ORDER BY arrival').all()) {
        if (Number(row.kind) !== 0 || !row.bytes) { stats.sealedItems++; continue; }
        take(home, Number(row.arrival), Buffer.from(row.bytes));
      }
      db.close();
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  }
}
for (const x of acts.values()) for (const h of Object.keys(x.seen)) x.seen[h].sort((a, b) => a - b);

// Which window an identity is in (inferred): the window whose acts/ holds most of that identity's own
// Identity-MIR acts (genesis, rotations, keys), which the kit keeps for the window that signed them.
const IDENTITY_MIR = Object.keys(MIRS)[0];
const windowOf = {};
{
  const signedIn = {};
  const W = join(RESEARCH, 'windows');
  for (const w of existsSync(W) ? readdirSync(W).sort() : []) {
    const dir = join(W, w, 'acts'); if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.mor')).sort()) {
      let d; try { d = describe(readFileSync(join(dir, f))); } catch { continue; }
      if (!d.public) continue;
      if (d.spec !== IDENTITY_MIR) continue; // its identity chain and keys: kept by the window that made them
      ((signedIn[d.signer] ??= {})[w] ??= 0); signedIn[d.signer][w]++;
    }
  }
  for (const [id, by] of Object.entries(signedIn)) {
    windowOf[id] = Object.keys(by).sort((a, b) => (by[b] ?? 0) - (by[a] ?? 0) || a.localeCompare(b))[0];
  }
}

// ------------------------------------------------------------------ what every act names
const strings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (v instanceof Map) for (const y of v.values()) strings(y, out); else if (Array.isArray(v)) for (const y of v) strings(y, out); return out; };
function hashesIn(v, out) { if (Buffer.isBuffer(v)) { if (v.length === 32) out.push(hx(v)); } else if (v instanceof Map) for (const y of v.values()) hashesIn(y, out); else if (Array.isArray(v)) for (const y of v) hashesIn(y, out); return out; }
const textOf = (d) => d.spec === TEXT_MIR && d.type === 0 && typeof d.payload.get(0) === 'string' ? d.payload.get(0) : null;
const SHORT = /\b([0-9a-f]{8})(?:…|\.\.\.?)([0-9a-f]{4})\b/g;

/** Every way an act names a 32-byte value: [hash, way]. */
function namings(d) {
  const out = [];
  out.push([d.spec, 'act spec (field 0)']);
  for (const [k, v] of d.payload) {
    const way = d.spec === AGREEMENTS ? (d.type === 0 ? `Terms socket key ${k}` : `Agreements type ${d.type} key ${k}`) : `payload key ${k}`;
    for (const h of new Set(hashesIn(v, []))) out.push([h, way]);
  }
  for (const r of d.refs) { const h = Buffer.isBuffer(r) ? r : Array.isArray(r) && Buffer.isBuffer(r[0]) ? r[0] : null; if (h && h.length === 32) out.push([hx(h), 'refs']); }
  const all = strings(d.payload).join('\n');
  for (const m of new Set(all.toLowerCase().match(/[0-9a-f]{64}/g) ?? [])) out.push([m, 'text']);
  return out;
}
const shortForms = (d) => [...new Set([...strings(d.payload).join('\n').toLowerCase().matchAll(SHORT)].map((m) => m[1] + '…' + m[2]))];

const named = new Map(); // hash -> [[actId, way]]
const shortNamed = new Map(); // "xxxxxxxx…yyyy" -> [actId]
for (const [id, x] of acts) {
  for (const [h, way] of namings(x.d)) { if (!named.has(h)) named.set(h, []); named.get(h).push([id, way]); }
  for (const s of shortForms(x.d)) { if (!shortNamed.has(s)) shortNamed.set(s, []); shortNamed.get(s).push(id); }
}
export { acts, named, shortNamed, textOf, specHash, strings, hx, describe, RESEARCH, TEXT_MIR, AGREEMENTS, windowOf, SHORT };
