#!/usr/bin/env node
// inventory.mjs — DubWeb, wave 2, session B: every specification text of round two, listed by code.
//
//   node inventory.mjs [--research DIR] [--out FILE]
//
// Reads _research/ (read only): every home's feed pages (feeds/*/feed-after-*.cbor), postmark-place's
// records (feeds/postmark-place/records-*.cbor), dubsar's relay database taken before it closed
// (feeds/dubsar-before-closure/relay.db, read from a temporary copy so the original is never opened),
// and the windows' kept acts (windows/*/acts/*.mor), used only to tell which window an identity is in.
// Writes one JSON file (inventory-web.json by default, in the current folder). Nothing else is written.
//
// Run from a folder holding the hosts' kit (kit/lib/core.mjs) and the script cross-checks, with the
// kit's own core library, every act id it decoded and every spec hash it computed. Without the kit it
// runs on its own decoder (CBOR, XChaCha20-Poly1305, the tagged hashes), written from the core's
// sources (core/src/act.rs, lock.rs, hash.rs), and says so in the output's "decoder" field.
//
// Never opens a sealed act (only acts whose content key travels on their outside are read), never
// reads a key, makes no network call. Deterministic: two runs over the same _research give the same file.
// The category is the only field that is DubWeb's (CATEGORIES below); everything else is any Dub's to reuse.

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

// ------------------------------------------------------------------ specification texts
const ANNOUNCES = /^#\s*(cMIP|Module)\b/i;
const specs = new Map(); // hash -> spec
for (const [id, x] of acts) {
  const t = textOf(x.d); if (t === null) continue;
  const title = t.split('\n')[0];
  for (const kind of KINDS) {
    const h = specHash(t, x.d.signer, kind);
    const isNamed = named.has(h) && named.get(h).some(([a]) => a !== id);
    const isShort = !isNamed && (shortNamed.get(h.slice(0, 8) + '…' + h.slice(-4)) ?? []).some((a) => a !== id);
    if (!isNamed && !isShort && !(kind === 0 && ANNOUNCES.test(title))) continue;
    let s = specs.get(h);
    if (!s) specs.set(h, (s = { spec_hash: h, title, creator: x.d.signer, kind, acts: [], text: t, named: isNamed ? 'named' : isShort ? 'named in short form only' : 'never named', position: x.d.position }));
    s.acts.push(id);
  }
}
for (const s of specs.values()) s.acts.sort((a, b) => minArrival(a) - minArrival(b) || a.localeCompare(b));
function minArrival(id) { const x = acts.get(id); return Math.min(...Object.values(x.seen).flat()); }

// Works: same creator and same title stem. Order: the draft number in the title, else the act's position in its signer's sequence.
const stem = (title) => title.replace(/^#+\s*/, '').replace(/^(cMIP|Module)\s*:?\s*/i, '').replace(/\s*\([^)]*\)\s*$/, '')
  .replace(/,?\s*(draft|version)\s+\d+\b/ig, '').replace(/[,:;.\s]+$/, '').trim().toLowerCase();
const draftNo = (title) => Number(title.match(/\b(?:draft|version)\s+(\d+)/i)?.[1] ?? NaN);
const works = new Map();
for (const s of specs.values()) { s.work = `${s.creator.slice(0, 8)}:${stem(s.title)}`; if (!works.has(s.work)) works.set(s.work, []); works.get(s.work).push(s); }
for (const list of works.values()) {
  list.sort((a, b) => (draftNo(a.title) - draftNo(b.title)) || ((a.position ?? 0) - (b.position ?? 0)) || a.kind - b.kind || a.spec_hash.localeCompare(b.spec_hash));
  list.forEach((s, i) => { s.earlier = list.slice(0, i).map((y) => y.spec_hash); s.later = list.slice(i + 1).map((y) => y.spec_hash); s.drafts_linked_by = ['same creator and title stem']; });
}
// A text saying it replaces another (a spec hash or act id, whole or short, within 300 characters of "replace"/"supersede").
const shortOf = (h) => h.slice(0, 8) + '…' + h.slice(-4);
const specByShort = new Map(); for (const s of specs.values()) for (const k of [s.spec_hash, ...s.acts]) { specByShort.set(k, s); specByShort.set(shortOf(k), s); }
for (const s of specs.values()) {
  const low = s.text.toLowerCase();
  for (const m of low.matchAll(/replac|supersed/g)) {
    const win = low.slice(Math.max(0, m.index - 300), m.index + 300);
    const ids = [...(win.match(/[0-9a-f]{64}/g) ?? []), ...[...win.matchAll(SHORT)].map((q) => q[1] + '…' + q[2])];
    for (const k of ids) {
      const o = specByShort.get(k); if (!o || o === s) continue;
      if (o.work === s.work) (s.replaces ??= new Set()).add(o.spec_hash);
      else (s.nearReplaceOther ??= new Set()).add(o.spec_hash); // not linked as drafts: quoted near the word only

    }
  }
}

// ------------------------------------------------------------------ use, building on, faults
const FAULT = /\b(fault|faults|finding|findings|correction|corrections|bug|bugs|flaw|flaws)\b/i; // candidates only: a word, not a judgement
for (const s of specs.values()) {
  const by = (named.get(s.spec_hash) ?? []).filter(([a]) => !s.acts.includes(a));
  const ways = {}; const using = new Set();
  for (const [a, way] of by) { using.add(a); (ways[way] ??= new Set()).add(a); }
  const shortUse = (shortNamed.get(shortOf(s.spec_hash)) ?? []).filter((a) => !using.has(a) && !s.acts.includes(a));
  const per = {}; const ids = new Set(); const wins = new Set();
  for (const a of using) {
    const x = acts.get(a); ids.add(x.d.signer); if (windowOf[x.d.signer]) wins.add(windowOf[x.d.signer]);
    for (const [h, arr] of Object.entries(x.seen)) { const p = (per[h] ??= { first: Infinity, last: -Infinity, acts: 0 }); p.first = Math.min(p.first, arr[0]); p.last = Math.max(p.last, arr[arr.length - 1]); p.acts++; }
  }
  s.use = {
    acts: using.size,
    by_way: Object.fromEntries(Object.entries(ways).sort().map(([w, set]) => [w, set.size])),
    identities: ids.size,
    windows_inferred: [...wins].sort(),
    per_home: Object.fromEntries(Object.entries(per).sort().map(([h, p]) => [h, p])),
    acts_naming: [...using].sort(),
    short_form_only_acts: shortUse.sort(),
  };
  // Answers to the text act itself (refs or whole id in text), not counted as use of the spec hash.
  const answers = new Set();
  for (const id of s.acts) for (const [a, way] of named.get(id) ?? []) if (way === 'refs' || way === 'text') answers.add(a);
  s.answers = [...answers].filter((a) => !s.acts.includes(a)).sort();
}
const namingCache = new Map();
const namingsOf = (a) => { if (!namingCache.has(a)) namingCache.set(a, namings(acts.get(a).d)); return namingCache.get(a); };
for (const s of specs.values()) {
  // Built on by: other specification texts naming its spec hash or its act (whole), or its short form.
  const mine = new Set([s.spec_hash, ...s.acts]);
  s.built_on_by = [...specs.values()].filter((o) => o !== s && o.creator + o.title !== s.creator + s.title &&
    (o.acts.some((a) => (namingsOf(a).some(([h, w]) => w !== 'act spec (field 0)' && mine.has(h)))) || o.text.toLowerCase().includes(shortOf(s.spec_hash))))
    .map((o) => o.spec_hash).sort();
  // Apps: text acts that are no specification, name it (whole or short) and announce a release (a version number or a .mjs file).
  s.apps_naming = [...new Set([...s.use.acts_naming, ...s.use.short_form_only_acts, ...s.answers])].filter((a) => {
    const t = textOf(acts.get(a).d); return t && ![...specs.values()].some((o) => o.acts.includes(a)) && /\b\d+\.\d+\.\d+\b|\.mjs\b/.test(t);
  }).sort();
  // Faults: acts answering it (its act in refs, or its spec hash named) whose words call something a fault, finding, bug, flaw or correction.
  const specActs = new Set([...specs.values()].flatMap((o) => o.acts));
  const viaWords = (named.get(s.spec_hash) ?? []).filter(([, w]) => w === 'refs' || w === 'text').map(([a]) => a);
  const answering = new Set([...s.answers, ...viaWords, ...s.use.short_form_only_acts].filter((a) => !specActs.has(a)));
  const laterTexts = s.later.map((h) => specs.get(h)).filter(Boolean);
  // Near: a fault word within 300 characters of where the act names it (spec hash or its act, whole or short);
  // an act answering its text act in refs is read whole.
  const marks = [s.spec_hash, shortOf(s.spec_hash), ...s.acts, ...s.acts.map(shortOf), ...s.acts.map((x) => x.slice(0, 8))];
  const refsIt = (a) => acts.get(a).d.refs.some((r) => { const h = Buffer.isBuffer(r) ? r : Array.isArray(r) ? r[0] : null; return Buffer.isBuffer(h) && s.acts.includes(hx(h)); });
  const near = (a) => {
    const t = strings(acts.get(a).d.payload).join('\n'); const low = t.toLowerCase();
    if (refsIt(a)) return FAULT.test(t);
    for (const m of marks) for (let i = low.indexOf(m); i >= 0; i = low.indexOf(m, i + 1)) if (FAULT.test(t.slice(Math.max(0, i - 300), i + m.length + 300))) return true;
    return false;
  };
  s.faults = [...answering].filter(near).sort().map((a) => {
    const fixedBy = laterTexts.filter((o) => { const low = o.text.toLowerCase(); return low.includes(a) || low.includes(shortOf(a)) || low.includes(a.slice(0, 8)); }).map((o) => o.spec_hash);
    return { act: a, signer: acts.get(a).d.signer, answers_in_refs: refsIt(a), by_creator: acts.get(a).d.signer === s.creator, window_inferred: windowOf[acts.get(a).d.signer] ?? null, said_fixed_by_later_draft: fixedBy };
  });
}

// ------------------------------------------------------------------ categories (DubWeb's only field; proposals)
// Keyed by work (creator's first 8 characters : title stem), or by full spec hash. Every value is a proposal.
const CATEGORIES = {
  "8f16771e:warning notice": { category: "identity safety", reason: "warning notices against an identity (impersonation, asking for keys): its main task is a mark on an identity" },
  "a83df2c7:head statements": { category: "identity safety", reason: "Keep's own words: identity safety on MOR, an identity's head stated so a fork or impostor shows" },
  "f1de20f8:findings held in trust": { category: "identity safety", reason: "holds a found flaw until those at risk are warned (coordinated disclosure); weak fit, no closer category" },
  "d750de30:line records": { category: "finding and reading", reason: "one reader for any circle's one-line records, so no script of its own is needed" },
  "762c0b4c:public flow": { category: "open books", reason: "public flow: what a reader may see of the money a work received" },
  "762c0b4c:open books": { category: "open books", reason: "a keeper's purse in the open: every sat in and out, checkable by members" },
  "76f53113:signed credits": { category: "open books", reason: "credits on a work, said by its author and confirmed, shown to all" },
  "c48cdf0c:signed credits": { category: "open books", reason: "credits on a work nobody may quietly change; pointer from DubLaw (it is also a Terms body)" },
  "28070ee8:delivery receipt": { category: "open books", reason: "receipts of delivery anyone can read; pointer from record and time" },
  "058d65d4:hours of care": { category: "open books", reason: "time swapped and confirmed, anyone counts the balance; no money moves; pointer from DubLaw (a Statement kind)" },
  "ddafffcd:held for you": { category: "open books", reason: "a holder's public admission of what it holds for others, read beside open books; pointer from DubPay" },
  "21a3f657:proven claim": { category: "record and time", reason: "a proven claim against an identity, by bytes; pointer from identity safety (scam marks)" },
  "11e77c4b:custody receipt": { category: "record and time", reason: "handover of records between keepers, what was handed and when" },
  "3022fb29:home bond": { category: "homes and the way out", reason: "money set aside by a home's operator for the people on it if the home fails; pointer from DubPay" },
  "880d33f2:the straight split": { category: "not DubWeb's: DubPay", reason: "divides a payment among receivers" },
  "880d33f2:the common pot": { category: "not DubWeb's: DubPay", reason: "a group pot of money" },
  "a48e4b24:split": { category: "not DubWeb's: DubPay", reason: "divides a payment among owners" },
  "a48e4b24:hop's tab": { category: "not DubWeb's: DubPay", reason: "clearing a group's debts" },
  "ddafffcd:stall split, cmip": { category: "not DubWeb's: DubPay", reason: "divides a payment (task K6, control)" },
  "3022fb29:escrow": { category: "not DubWeb's: DubPay", reason: "money held until a condition" },
  "76a78f70:money decision": { category: "not DubWeb's: DubPay", reason: "a decision to move a group's money (Statement kind)" },
  "76a78f70:period payment": { category: "not DubWeb's: DubPay", reason: "rent, loans, subscriptions paid by the period" },
  "ba28ac63:rotating pot": { category: "not DubWeb's: DubPay", reason: "a rotating savings group" },
  "84ae1e82:the client that served the payment": { category: "not DubWeb's: DubPay", reason: "a spot paid to the client that served a payment" },
  "11e77c4b:guide spot": { category: "not DubWeb's: DubPay", reason: "a spot paid to whoever led a buyer to a sale" },
  "218a2a93:named signers": { category: "not DubWeb's: DubLaw", reason: "when Terms come into force (task K2)" },
  "218a2a93:buyer by assent": { category: "not DubWeb's: DubLaw", reason: "a buyer by their own assent (task K5)" },
  "218a2a93:an arbiter's award": { category: "not DubWeb's: DubLaw", reason: "deciding a dispute under Terms" },
  "218a2a93:shower work": { category: "not DubWeb's: DubLaw", reason: "the body of a work's Terms in the shower contest" },
  "76a78f70:in force by the condition": { category: "not DubWeb's: DubLaw", reason: "when Terms come into force (task K2)" },
  "76a78f70:quorum with stand-ins": { category: "not DubWeb's: DubLaw", reason: "a power's rule (task K3)" },
  "76a78f70:shares nobody may rewrite": { category: "not DubWeb's: DubLaw", reason: "an update condition (task K4)" },
  "a83df2c7:the way out (task k4, update condition)": { category: "not DubWeb's: DubLaw", reason: "a way out of Terms (task K4), not of a home" },
  "b1895259:lineup vote": { category: "not DubWeb's: DubLaw", reason: "the contest's voting rule, under Terms" },
  "f94d310f:consent to be recorded": { category: "not DubWeb's: DubLaw", reason: "consent as Terms a person signs (task K1)" },
  "2c381cf6:plain words, by steward & co.: a reading for the body of terms": { category: "not DubWeb's: DubLaw", reason: "a reading for the body of Terms" },
  "2c381cf6:the lending shelf": { category: "not DubWeb's: DubLaw", reason: "lending things between people under Terms" },
};

// ------------------------------------------------------------------ the kit's cross-check, where the kit is beside us
const decoder = { own: 'inventory.mjs (CBOR, XChaCha20-Poly1305, tagged hashes, from core/src/act.rs, lock.rs, hash.rs)', kit: null };
const kitCore = resolve('kit', 'lib', 'core.mjs');
if (existsSync(kitCore)) {
  try {
    const { mor } = await import(kitCore);
    let ids = 0, idsAgree = 0, hashes = 0, hashesAgree = 0, refused = 0;
    for (const [id, x] of acts) { ids++; try { if (mor.describeAct(Buffer.from(x.bytes ?? [])).id === id) idsAgree++; } catch { } }
    for (const s of specs.values()) {
      hashes++;
      const c = specContent(s.text, s.creator, s.kind);
      try { if (mor.decodeSpec(Uint8Array.from(c)).hash === s.spec_hash) hashesAgree++; } catch { refused++; }
    }
    decoder.kit = { core: 'kit/lib/core.mjs', spec_hashes: hashes, spec_hashes_agreeing: hashesAgree, spec_contents_refused_by_core: refused };
  } catch (e) { decoder.kit = { error: String(e?.message ?? e) }; }
}

// ------------------------------------------------------------------ self-check
const SELF = [
  { name: 'public flow draft 8 named in the data socket of at least 26 Terms acts', specs: ['5516c238d6a0a14ff4566990db06cfbae60106a2282d3b1d7aa0e9761e0cd4a3'],
    test: ([s]) => { const n = s?.use.by_way['Terms socket key 16'] ?? 0; let rerun = null;
      const f = join(RESEARCH, 'hosts', 'count-rerun.json');
      if (s && existsSync(f)) { const want = JSON.parse(readFileSync(f, 'utf8')).entries.map((e) => e.terms_in_force); const got = new Set((named.get(s.spec_hash) ?? []).filter(([, w]) => w === 'Terms socket key 16').map(([a]) => a)); rerun = { entries: want.length, their_terms_in_force_found_naming_it: want.filter((a) => got.has(a)).length }; }
      return { passed: n >= 26 && (!rerun || rerun.their_terms_in_force_found_naming_it === rerun.entries), found: n, rerun }; } },
  { name: 'open books drafts 1 and 2 linked as drafts of one work', specs: ['d740165a4c93f96b9b760ba71a679242ea458ccaa93b0fff370df1e02cbb0310', '63560652cb1914d0d539c343faf7cc070ba21113f37b6d29754632bf3d25687e'] },
  { name: 'held for you drafts 1 and 2', specs: ['31b669016dc2ea5878e63aff9979d417821b255b75d99d74d8197e3e752edfb1', '08ae1b2cb42d8c3a9052021a1daebdbd237016cfba6981bcda1c4fac5d517b9f'] },
  { name: 'warning notice drafts 1 to 3', specs: ['56dd08144a9b5cf26565acef3b7216cf6477514e65b2bade0405c3e061170815', '01cdcebb00e612e77300383d08f82a843a9f582d8105a5767bd340ea7476135f', '9b88aee2bc0ca6269c116e7c3ba71bd1681425218f8743331472ed1eef4a310b'] },
];
const linked = (list) => list.every((s, i) => s && list.slice(i + 1).every((o) => o && s.later.includes(o.spec_hash) && o.earlier.includes(s.spec_hash)));
const self_check = SELF.map((c) => {
  const list = c.specs.map((h) => specs.get(h));
  const r = c.test ? c.test(list) : { passed: list.every(Boolean) && linked(list), found: list.filter(Boolean).length };
  return { check: c.name, ...r, linked_as_one_work: linked(list), specs: c.specs.map((h, i) => ({ spec_hash: h, found: !!list[i], title: list[i]?.title ?? null })) };
});

// ------------------------------------------------------------------ output
const category = (s) => CATEGORIES[s.spec_hash] ?? CATEGORIES[s.work] ?? { category: 'unassigned', reason: 'no proposal yet', proposed: true };
const records = [...specs.values()].sort((a, b) => a.work.localeCompare(b.work) || a.earlier.length - b.earlier.length || a.spec_hash.localeCompare(b.spec_hash)).map((s) => ({
  title: s.title, creator: s.creator, creator_window_inferred: windowOf[s.creator] ?? null, kind: s.kind, spec_hash: s.spec_hash,
  act: s.acts[0], acts_same_text: s.acts, text_bytes: Buffer.byteLength(s.text), named: s.named,
  first_seen: Object.fromEntries(Object.entries(acts.get(s.acts[0]).seen).map(([h, a]) => [h, a[0]]).sort()),
  work: s.work, drafts: { earlier: s.earlier, later: s.later, replaces_by_its_words: [...(s.replaces ?? [])].sort(), other_work_quoted_near_replace_not_linked: [...(s.nearReplaceOther ?? [])].sort() },
  use: s.use, answers_to_its_act: s.answers, built_on_by: s.built_on_by, apps_naming: s.apps_naming, fault_candidates: s.faults,
  category: { ...category(s), proposed: true },
}));
const specActIds = new Set([...specs.values()].flatMap((s) => s.acts));
const no_text_found = [...named].filter(([h, list]) => !specs.has(h) && !MIRS[h] && !acts.has(h) && list.some(([, w]) => w === 'act spec (field 0)'))
  .map(([h, list]) => { const ways = {}; for (const [a, w] of list) (ways[w] ??= new Set()).add(a); return { hash: h, acts: new Set(list.map(([a]) => a)).size, identities: new Set(list.map(([a]) => acts.get(a).d.signer)).size, by_way: Object.fromEntries(Object.entries(ways).sort().map(([w, x]) => [w, x.size])) }; })
  .sort((a, b) => b.acts - a.acts || a.hash.localeCompare(b.hash));
// Texts whose first line is a heading with "draft N" or "version N", left out by the rule above (not named, not "# cMIP"/"# Module").
const inSpecs = new Set([...specs.values()].flatMap((x) => x.acts));
const draft_titled_not_included = [...acts].filter(([id, x]) => { const t = textOf(x.d); return t && !inSpecs.has(id) && /^#/.test(t) && /\b(draft|version)\s+\d+/i.test(t.split('\n')[0]); })
  .map(([id, x]) => ({ title: textOf(x.d).split('\n')[0], creator: x.d.signer, act: id, spec_hash_kind_0: specHash(textOf(x.d), x.d.signer, 0) })).sort((a, b) => a.title.localeCompare(b.title) || a.act.localeCompare(b.act));
const result = {
  about: 'DubWeb wave 2, session B: every specification text of round two, by code. Counts come from this script. Categories are proposals.',
  research: '_research (feeds of every home, postmark-place records, dubsar before closure)',
  decoder,
  read: { items: stats.items, sealed_items_not_opened: stats.sealedItems, not_acts: stats.notActs, private_acts_not_opened: stats.private, public_acts_distinct: acts.size,
    public_acts_by_home_with_duplicates: Object.fromEntries(Object.entries(stats.perHome).sort()), identities_with_window_inferred: Object.keys(windowOf).length },
  constants: { text_mir: TEXT_MIR, agreements: AGREEMENTS, kinds_tried: KINDS.length, socket_names: SOCKET_NAMES },
  self_check,
  specifications: records,
  named_as_a_spec_but_no_text_found: no_text_found,
  draft_titled_texts_not_included: draft_titled_not_included,
};
writeFileSync(OUT, JSON.stringify(result, null, 1) + '\n');
console.log(`${records.length} specifications (${records.filter((r) => r.named === 'named').length} named, ${records.filter((r) => r.named === 'named in short form only').length} short form only, ${records.filter((r) => r.named === 'never named').length} never named) from ${acts.size} public acts -> ${OUT}`);
for (const c of self_check) console.log(`self-check ${c.passed ? 'PASSED' : 'FAILED'}: ${c.check} (found ${c.found})`);
