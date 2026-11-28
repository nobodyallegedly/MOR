// DubWeb wave 3, session C: the reader of the research copy, shared by catalogue.mjs and look.mjs.
// Author: Nobody, allegedly. It reads _research/ only, opens public acts only (those whose own outside
// carries their content key), never opens a sealed container or a private act, reads no key file,
// and calls no network. The decoder is the one DubWeb's wave-2 inventory.mjs used (CBOR, XChaCha20-Poly1305,
// tagged hashes); catalogue.mjs cross-checks it against the kit's core library when kit/ is beside it.

import { readFileSync, readdirSync, existsSync, mkdtempSync, copyFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash, createDecipheriv } from 'node:crypto';

const argv = process.argv.slice(2);
export const opt = {};
export const rest = [];
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; else rest.push(argv[i]); }
export const here = dirname(fileURLToPath(import.meta.url));
const candidates = [opt.research, process.env.MOR_RESEARCH, '_research', join(here, '..', '..', '..', '..', '_research'),
  join(process.env.HOME ?? '', 'Documents', 'mor-round-2', '_research')].filter((p) => typeof p === 'string');
export const RESEARCH = candidates.map((p) => resolve(p)).find((p) => existsSync(join(p, 'feeds')));
if (!RESEARCH) { console.error('No _research folder found: pass --research DIR'); process.exit(1); }

export const sha = (b) => createHash('sha256').update(b).digest();
export const hx = (b) => Buffer.from(b).toString('hex');
export const tagged = (tag, data) => { const t = sha(Buffer.from(tag)); return createHash('sha256').update(t).update(t).update(data).digest(); };

/** Deterministic CBOR, decoded: maps as Map (with .raw, the bytes they came from), byte strings as Buffer. */
export function cborDecode(buf) {
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
export function specContent(text, creator, kind = 0) {
  const t = Buffer.from(text, 'utf8');
  return Buffer.concat([cborHead(5, 3), cborHead(0, 0), cborHead(0, kind), cborHead(0, 1), cborHead(2, 32), Buffer.from(creator, 'hex'), cborHead(0, 9), cborHead(3, t.length), t]);
}
export const specHash = (text, creator, kind = 0) => hx(tagged('MOR/spec', specContent(text, creator, kind)));

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
/** XChaCha20-Poly1305, no associated data. Used only with a key the act's own outside carries (a public act). */
function unlock(locked, key, nonce) {
  const d = createDecipheriv('chacha20-poly1305', hchacha20(key, nonce.subarray(0, 16)), Buffer.concat([Buffer.alloc(4), nonce.subarray(16, 24)]), { authTagLength: 16 });
  d.setAuthTag(locked.subarray(locked.length - 16));
  return Buffer.concat([d.update(locked.subarray(0, locked.length - 16)), d.final()]);
}

/** An act: [outside, locked, signature]. Public acts are opened; sealed or private ones are not. */
export function describe(bytes) {
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

// The round's constants (test values until the freeze).
export const TEXT_MIR = hx(sha('TEXT, test value until the freeze'));
export const IDENTITY_MIR = hx(sha('IDENTITY, test value until the freeze'));
export const AGREEMENTS = 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c'; // the round's Agreements (draft 25); type 0 = Terms

// ------------------------------------------------------------------ reading the copy
export const acts = new Map(); // id -> { d, bytes, seen: { home: [arrival...] } }
export const stats = { items: 0, sealed_items_not_opened: 0, not_acts: 0, private_acts_not_opened: 0, per_home: {} };
function take(home, arrival, bytes) {
  stats.items++;
  let d; try { d = describe(bytes); } catch { stats.not_acts++; return; }
  if (!d.public) { stats.private_acts_not_opened++; return; }
  let x = acts.get(d.id); if (!x) acts.set(d.id, (x = { d, bytes: Buffer.from(bytes), seen: {} }));
  (x.seen[home] ??= []).push(arrival);
  stats.per_home[home] = (stats.per_home[home] ?? 0) + 1;
}
const FEEDS = join(RESEARCH, 'feeds');
const num = (f) => Number(f.match(/(\d+)\.cbor$/)?.[1] ?? 0);
for (const home of readdirSync(FEEDS).sort()) {
  const dir = join(FEEDS, home);
  if (!statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith('.cbor')).sort((a, b) => num(a) - num(b));
  for (const f of files) {
    const v = cborDecode(readFileSync(join(dir, f)));
    if (Array.isArray(v)) v.forEach((b, i) => take(home, num(f) + i + 1, b)); // postmark-place: a page of records, each an act
    else for (const [arrival, kind, bytes] of v.get(0) ?? []) {
      if (Number(kind) !== 0) { stats.sealed_items_not_opened++; continue; } // kind 1: a sealed container, never opened
      take(home, Number(arrival), bytes);
    }
  }
  if (existsSync(join(dir, 'relay.db'))) { // dubsar before closure: read from a temporary copy, so the original is never opened
    const tmp = mkdtempSync(join(tmpdir(), 'catalogue-'));
    try {
      for (const f of readdirSync(dir).filter((f) => f.startsWith('relay.db'))) copyFileSync(join(dir, f), join(tmp, f));
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(join(tmp, 'relay.db'));
      for (const row of db.prepare('SELECT arrival, kind, bytes FROM items ORDER BY arrival').all()) {
        if (Number(row.kind) !== 0 || !row.bytes) { stats.sealed_items_not_opened++; continue; }
        take(home, Number(row.arrival), Buffer.from(row.bytes));
      }
      db.close();
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  }
}
for (const x of acts.values()) for (const h of Object.keys(x.seen)) x.seen[h].sort((a, b) => a - b);

export const strings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (v instanceof Map) for (const y of v.values()) strings(y, out); else if (Array.isArray(v)) for (const y of v) strings(y, out); return out; };
export function hashesIn(v, out) { if (Buffer.isBuffer(v)) { if (v.length === 32) out.push(hx(v)); } else if (v instanceof Map) for (const y of v.values()) hashesIn(y, out); else if (Array.isArray(v)) for (const y of v) hashesIn(y, out); return out; }
export const textOf = (d) => d.spec === TEXT_MIR && d.type === 0 && typeof d.payload.get(0) === 'string' ? d.payload.get(0) : null;
/** All the words of an act: every text string anywhere in its payload, joined. */
export const wordsOf = (d) => strings(d.payload).join('\n');

/**
 * Every way an act names a 32-byte value: [hash, way]. The ways:
 *   'spec'   the act is written under it (its own spec field);
 *   'socket' a 32-byte value in the payload of an Agreements act (a Terms socket or another Agreements key);
 *   'bytes'  a 32-byte value in the payload of any other act;
 *   'refs'   in the act's refs;
 *   'words'  64 hex characters in a text string (the core does not read these).
 */
export function namings(d) {
  const out = [];
  out.push([d.spec, 'spec']);
  for (const [, v] of d.payload) for (const h of new Set(hashesIn(v, []))) out.push([h, d.spec === AGREEMENTS ? 'socket' : 'bytes']);
  for (const r of d.refs) { const h = Buffer.isBuffer(r) ? r : Array.isArray(r) && Buffer.isBuffer(r[0]) ? r[0] : null; if (h && h.length === 32) out.push([hx(h), 'refs']); }
  for (const m of new Set(wordsOf(d).toLowerCase().match(/[0-9a-f]{64}/g) ?? [])) out.push([m, 'words']);
  return out;
}
export const named = new Map(); // hash -> [[actId, way]]
for (const [id, x] of acts) for (const [h, way] of namings(x.d)) { if (!named.has(h)) named.set(h, []); named.get(h).push([id, way]); }

/** Every public text act's kind-0 spec hash under its signer: spec hash -> [text act ids]. */
export const specOfText = new Map(); // text act id -> spec hash
export const textsBySpec = new Map();
for (const [id, x] of acts) { const t = textOf(x.d); if (t == null) continue; const h = specHash(t, x.d.signer, 0); specOfText.set(id, h); if (!textsBySpec.has(h)) textsBySpec.set(h, []); textsBySpec.get(h).push(id); }

/** The lowest arrival number of an act at each home (arrival numbers order acts within one home only). */
export const firstSeen = (id) => Object.fromEntries(Object.entries(acts.get(id)?.seen ?? {}).map(([h, a]) => [h, a[0]]));

/**
 * The tray that carried each signer's acts, from the postman's log: an act's exact bytes (SHA-256) posted by a tray.
 * signer -> { tray: number of that signer's acts the tray posted }. A tray is one window's folder; this shows which
 * window carried an identity's acts, not who a person "is".
 */
export const traysOf = new Map();
{
  const bySha = new Map(); for (const [id, x] of acts) bySha.set(hx(sha(x.bytes)), id);
  const log = join(RESEARCH, 'postman', 'log', 'carried.jsonl');
  if (existsSync(log)) for (const l of readFileSync(log, 'utf8').split('\n')) {
    if (!l) continue; let e; try { e = JSON.parse(l); } catch { continue; }
    const id = e.sent?.sha256 && bySha.get(e.sent.sha256); if (!id) continue;
    const sg = acts.get(id).d.signer; const m = traysOf.get(sg) ?? {}; m[e.tray] = (m[e.tray] ?? 0) + 1; traysOf.set(sg, m);
  }
}
/** The tray that posted most of a signer's acts, or null. */
export const mainTray = (signer) => { const m = traysOf.get(signer); return m ? Object.entries(m).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0] : null; };
