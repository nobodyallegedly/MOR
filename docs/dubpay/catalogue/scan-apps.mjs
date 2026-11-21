#!/usr/bin/env node
// DubPay W2-A: the features scan, step 1 by code.
// Finds every app or script the players published as media or said they installed,
// from the round-two research copy (feeds, postmark-place's records, dubsar's relay copy,
// every window's kept acts and reports), and writes what it found as JSON.
//
// Usage: node scan-apps.mjs RESEARCH_DIR KIT_DIR OUT_DIR
//   RESEARCH_DIR  the research copy (_research), read only
//   KIT_DIR       a copy of the round's kit (its core library decodes the acts)
//   OUT_DIR       where acts.json, apps.json and mentions.json are written
// It reads only; it signs, posts and pays nothing, and opens no sealed act.
// dubsar's relay database is read from a copy (sqlite3 -readonly) made by the caller in OUT_DIR/dubsar/.

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const [RES, KIT, OUT] = process.argv.slice(2);
if (!RES || !KIT || !OUT) { console.error('usage: node scan-apps.mjs RESEARCH_DIR KIT_DIR OUT_DIR'); process.exit(2); }
const { mor, plain, hex, SPECS, sha256 } = await import(join(KIT, 'lib/core.mjs'));
mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------------ load every act
const acts = new Map(); // id -> { d, where:Set }
const sources = [];
function addAct(bytes, where) {
  let d;
  try { d = plain(mor.describeAct(bytes)); } catch { return null; }
  const e = acts.get(d.id) || { d, where: new Set() };
  e.where.add(where);
  acts.set(d.id, e);
  return d.id;
}
const feeds = join(RES, 'feeds');
for (const home of readdirSync(feeds)) {
  const dir = join(feeds, home);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.cbor')).sort()) {
    const v = mor.cborDecode(new Uint8Array(readFileSync(join(dir, f))));
    let n = 0;
    if (v instanceof Map) for (const it of v.get(0) || []) { if (addAct(it[2], `feed:${home}`)) n++; }
    else if (Array.isArray(v)) for (const b of v) { if (addAct(b, `feed:${home}`)) n++; }
    sources.push({ source: `feeds/${home}/${f}`, acts: n });
  }
}
// dubsar's relay database (copy), kind 0 = acts, kind 2 = media
const db = join(OUT, 'dubsar', 'relay.db');
const dubsarMedia = new Map();
if (existsSync(db)) {
  const rows = execFileSync('sqlite3', ['-readonly', db, 'select kind, hex(id), hex(bytes) from items where kind in (0,2)'], { maxBuffer: 1 << 30 }).toString().trim().split('\n');
  let n = 0;
  for (const r of rows) {
    const [kind, id, b] = r.split('|');
    if (!b) continue;
    const bytes = Uint8Array.from(Buffer.from(b, 'hex'));
    if (kind === '0') { if (addAct(bytes, 'feed:dubsar')) n++; }
    else dubsarMedia.set(id.toLowerCase(), bytes);
  }
  sources.push({ source: 'feeds/dubsar-before-closure/relay.db (copy)', acts: n, media: dubsarMedia.size });
}
// every window's kept acts (and any .mor in build/)
const windowsDir = join(RES, 'windows');
const windows = readdirSync(windowsDir).filter((w) => statSync(join(windowsDir, w)).isDirectory()).sort();
const keptBy = new Map(); // id -> Set(window)
for (const w of windows) {
  for (const sub of ['acts', 'build']) {
    const dir = join(windowsDir, w, sub);
    if (!existsSync(dir)) continue;
    let n = 0;
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.mor'))) {
      const id = addAct(new Uint8Array(readFileSync(join(dir, f))), `window:${w}`);
      if (id) { n++; (keptBy.get(id) || keptBy.set(id, new Set()).get(id)).add(w); }
    }
    sources.push({ source: `windows/${w}/${sub}/*.mor`, acts: n });
  }
}

// ------------------------------------------------------------------ owners: identity -> window
// An identity belongs to a window whose acts/ holds its chain's first act (the genesis act, whose id is the identity).
const owner = new Map();
for (const [id, e] of acts) {
  const d = e.d;
  if (d.spec === SPECS.identity && !d.signer) for (const w of keptBy.get(id) || []) {
    // keep the window that also holds most of this identity's signed acts
    (owner.get(id) || owner.set(id, new Map()).get(id)).set(w, 0);
  }
}
for (const [id, e] of acts) {
  const s = e.d.signer; if (!s || !owner.has(s)) continue;
  for (const w of keptBy.get(id) || []) { const m = owner.get(s); if (m.has(w)) m.set(w, m.get(w) + 1); }
}
const ownerOf = (idn) => { const m = owner.get(idn); if (!m) return null; return [...m].sort((a, b) => b[1] - a[1])[0][0]; };

// ------------------------------------------------------------------ texts
const texts = new Map(); // id -> text
for (const [id, e] of acts) {
  const d = e.d;
  if (d.spec !== SPECS.text || d.type !== 0 || !d.public || !d.payload) continue;
  try { const m = mor.cborDecode(Uint8Array.from(Buffer.from(d.payload, 'hex'))); const t = m.get(0); if (typeof t === 'string') texts.set(id, t); } catch {}
}

// ------------------------------------------------------------------ media in hand: work hash of every local file
const local = new Map(); // workHash -> {path, bytes}
const walk = (dir) => { for (const f of readdirSync(dir)) { const p = join(dir, f); const s = statSync(p); if (s.isDirectory()) { if (f !== 'node_modules') walk(p); } else if (s.size < 4e6 && !p.endsWith('.mor') && !p.endsWith('.cbor') && !p.includes('relay.db') && !p.endsWith('ACCESS-hosts-only.md')) { const b = new Uint8Array(readFileSync(p)); const r = { path: p.slice(RES.length + 1), size: b.length }; local.set(sha256(b), r); local.set(mor.workHash(b), r); } } };
walk(RES);
for (const [id, b] of dubsarMedia) local.set(sha256(b), { path: `dubsar relay.db media ${id.slice(0, 16)}`, size: b.length });

// ------------------------------------------------------------------ app announcements in acts
const HEX = /\b[0-9a-f]{64}\b/g;
const APPWORD = /\b(app|apps|script|tool|client|reader|checker|wallet|tray app|\.mjs|node [a-z0-9_-]+\.mjs|media)\b/i;
const MEDIAWORD = /\bmedia\b|\bbytes\b|\bsize\b|\.mjs\b|\bfetch\b/i;
const versionsIn = (t) => [...new Set([...t.matchAll(/\b(?:v|version |versión |draft )?(\d+\.\d+(?:\.\d+)?)\b/gi)].map((m) => m[1]).filter((v) => !/^\d+\.\d{4,}$/.test(v)))];
const sizeIn = (t) => [...t.matchAll(/(\d{1,3}(?:[ ,. ]\d{3})+|\d{3,7})\s*bytes/gi)].map((m) => Number(m[1].replace(/[^0-9]/g, '')));
const nameIn = (t) => {
  const m = t.match(/\b([A-Z][\w&'’ -]{1,40}?)\s*(?:,\s*)?(?:v|version\s*)?\d+\.\d+(?:\.\d+)?/) || t.match(/\b([a-z0-9_-]+\.mjs)\b/);
  return m ? m[1].trim() : null;
};
const announcements = [];
for (const [id, t] of texts) {
  const hashes = (t.match(HEX) || []).filter((h) => !acts.has(h) && h !== id);
  const short = /[0-9a-f]{8}…[0-9a-f]{4}/.test(t);
  if (!APPWORD.test(t) || !MEDIAWORD.test(t)) continue;
  if (!hashes.length && !short) continue;
  const mediaHashes = hashes.filter((h) => new RegExp(`(\\bmedia\\b|/media/)[^\\n]{0,60}${h}|${h}[^\\n]{0,30}\\bbytes\\b|${h}\\)?,? \\d[\\d,.\u202f ]* bytes`, 'i').test(t) || local.has(h));
  // second tier: an app word, a media word and a hash that is no act id, in a post that names a program file or says "app"/"script"
  const loose = mediaHashes.length ? [] : hashes.filter((h) => /\.mjs\b|\b(app|script|answerer|tool|reader)\b/i.test(t) && new RegExp(`sha-?256[^\\n]{0,24}${h}`, 'i').test(t));
  if (!mediaHashes.length && !loose.length) continue;
  const d = acts.get(id).d;
  announcements.push({ tier: mediaHashes.length ? 'media hash named as media' : 'hash in an app post (possible)', act: id, signer: d.signer, window: ownerOf(d.signer), homes: [...acts.get(id).where].filter((w) => w.startsWith('feed:')).map((w) => w.slice(5)), name: nameIn(t), versions: versionsIn(t), sizes: sizeIn(t), media: mediaHashes.length ? mediaHashes : loose, refs: d.refs, inHand: (mediaHashes.length ? mediaHashes : loose).filter((h) => local.has(h)).map((h) => ({ h, ...local.get(h) })), text: t.slice(0, 1500) });
}

// ------------------------------------------------------------------ code published as the text of an act
// Some players posted a program's source as the act's text ("the act's text is the file").
const codeActs = [];
for (const [id, t] of texts) {
  if (!/^(#!\/usr\/bin\/env node|\/\/ )/.test(t) || !/\b(import|require|process\.argv|function)\b/.test(t)) continue;
  const d = acts.get(id).d;
  const first = t.split('\n')[0].replace(/^(#!.*|\/\/\s*)/, '').trim() || t.split('\n')[1].replace(/^\/\/\s*/, '');
  const b = Buffer.from(t, 'utf8');
  codeActs.push({ act: id, signer: d.signer, window: ownerOf(d.signer), file: (t.match(/\b[\w-]+\.mjs\b/) || [null])[0], firstLine: first.slice(0, 160), versions: versionsIn(t.split('\n').slice(0, 3).join(' ')), bytes: b.length, sha256: sha256(b), homes: [...acts.get(id).where].filter((w) => w.startsWith('feed:')).map((w) => w.slice(5)) });
}
for (const c of codeActs) { if (!local.has(c.sha256)) local.set(c.sha256, { path: `act ${c.act} (its text)`, size: c.bytes }); }

// ------------------------------------------------------------------ uses: acts that name an announcement, or its media hash, or its file name
const byMedia = new Map();
for (const a of announcements) for (const h of a.media) (byMedia.get(h) || byMedia.set(h, []).get(h)).push(a.act);
const uses = new Map(); // media -> [{act, how, signer, window}]
const annIds = new Set(announcements.map((a) => a.act));
for (const [id, e] of acts) {
  const d = e.d;
  const t = texts.get(id) || '';
  for (const [h, anns] of byMedia) {
    let how = null;
    if (!annIds.has(id) && t.includes(h)) how = 'names the media hash';
    else if (!annIds.has(id) && (d.refs || []).some((r) => anns.includes(r))) how = 'answers the announcement (refs)';
    else if (!annIds.has(id) && [...(d.objects || []), ...(d.acks || [])].some((r) => anns.includes(r))) how = 'names the announcement (objects/acks)';
    if (how) (uses.get(h) || uses.set(h, []).get(h)).push({ act: id, how, signer: d.signer || null, window: ownerOf(d.signer), spec: d.spec, type: d.type });
  }
}

// ------------------------------------------------------------------ the reports: media hashes, short hashes, and "installed / fetched / ran"
const mentions = [];
const SHORT = /\b([0-9a-f]{6,16})(?:…|\.\.\.)([0-9a-f]{2,8})\b/g;
const INSTALL = /\b(installed|install|fetched|fetch(?:ed)? (?:it )?back|downloaded|ran|run|used|uses|using|tried|tested)\b/i;
for (const w of windows) {
  const dir = join(windowsDir, w, 'reports');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const lines = readFileSync(join(dir, f), 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (!/media/i.test(line) && !/\.mjs\b/.test(line) && !/\b(Damgar|Dub|Ummia|Edubba|Kišib|Kisib|pot\.mjs)\b/.test(line)) return;
      const full = (line.match(HEX) || []);
      const shorts = [...line.matchAll(SHORT)].map((m) => [m[1], m[2]]);
      const mediaFull = full.filter((h) => byMedia.has(h) || local.has(h) || new RegExp(`media[^\\n]{0,30}${h}`, 'i').test(line));
      const mediaShort = shorts.filter(([a, b]) => new RegExp(`media[^\\n]{0,12}${a}`, 'i').test(line));
      const apps = [...new Set([...(line.match(/\b[\w-]+\.mjs\b/g) || []), ...(line.match(/\b(Damgar|Ummia|Edubba|Kišib|Pointer Look|Dub)\b/g) || [])])];
      if (!mediaFull.length && !mediaShort.length && !(apps.length && INSTALL.test(line))) return;
      mentions.push({ window: w, file: f, line: i + 1, media: mediaFull, mediaShort: mediaShort.map(([a, b]) => `${a}…${b}`), apps, install: INSTALL.test(line), acts: full.filter((h) => acts.has(h)), text: line.slice(0, 600) });
    });
  }
}

// resolve short media hashes against every full one known
const allMedia = new Set([...byMedia.keys(), ...local.keys(), ...mentions.flatMap((m) => m.media)]);
for (const m of mentions) m.mediaResolved = m.mediaShort.map((s) => { const [a, b] = s.split('…'); const hit = [...allMedia].filter((h) => h.startsWith(a) && h.endsWith(b)); return { short: s, full: hit.length === 1 ? hit[0] : null }; });

// ------------------------------------------------------------------ one record per media hash
const apps = new Map();
const rec = (h) => apps.get(h) || apps.set(h, { media: h, names: new Set(), versions: new Set(), sizes: new Set(), authors: new Set(), authorWindows: new Set(), announcedIn: new Set(), homes: new Set(), reportMentions: [], uses: [], inHand: null, tier: 'possible' }).get(h);
for (const a of announcements) for (const h of a.media) { const r = rec(h); if (a.tier.startsWith('media')) r.tier = 'media'; if (a.name) r.names.add(a.name); a.versions.forEach((v) => r.versions.add(v)); a.sizes.forEach((s) => r.sizes.add(s)); if (a.signer) r.authors.add(a.signer); if (a.window) r.authorWindows.add(a.window); r.announcedIn.add(a.act); a.homes.forEach((x) => r.homes.add(x)); }
for (const m of mentions) { for (const h of [...m.media, ...m.mediaResolved.map((x) => x.full).filter(Boolean)]) { const r = rec(h); r.reportMentions.push(`${m.window}/${m.file}:${m.line}`); r.tier = 'media'; m.apps.forEach((x) => r.names.add(x)); sizeIn(m.text).forEach((s) => r.sizes.add(s)); m.acts.forEach((x) => { const d = acts.get(x).d; if (texts.has(x) && texts.get(x).includes(h.slice(0, 8))) r.announcedIn.add(x); }); } }
for (const [h, r] of apps) { r.uses = uses.get(h) || []; if (local.has(h)) r.inHand = local.get(h); }
const out = [...apps.values()].map((r) => ({ ...r, names: [...r.names], versions: [...r.versions], sizes: [...r.sizes], authors: [...r.authors], authorWindows: [...r.authorWindows], announcedIn: [...r.announcedIn], homes: [...r.homes] }));

// install mentions by app name, without a hash
const installs = {};
for (const m of mentions.filter((m) => m.install)) for (const a of m.apps) (installs[a] ||= new Set()).add(m.window);

const summary = {
  sources,
  actsDecoded: acts.size,
  publicTexts: texts.size,
  identitiesWithWindow: owner.size,
  announcements: announcements.length,
  mediaHashes: out.length,
  mediaInHand: out.filter((r) => r.inHand).length,
  codeActs: codeActs.length,
  reportMentions: mentions.length,
  installMentionsByApp: Object.fromEntries(Object.entries(installs).map(([a, s]) => [a, [...s].sort()])),
};
writeFileSync(join(OUT, 'apps.json'), JSON.stringify({ summary, apps: out }, null, 1));
writeFileSync(join(OUT, 'announcements.json'), JSON.stringify(announcements, null, 1));
writeFileSync(join(OUT, 'code-acts.json'), JSON.stringify(codeActs, null, 1));
writeFileSync(join(OUT, 'mentions.json'), JSON.stringify(mentions, null, 1));
writeFileSync(join(OUT, 'owners.json'), JSON.stringify(Object.fromEntries([...owner.keys()].map((k) => [k, ownerOf(k)])), null, 1));
// a reusable index of public texts for the later steps
writeFileSync(join(OUT, 'texts.json'), JSON.stringify(Object.fromEntries([...texts].map(([id, t]) => { const d = acts.get(id).d; return [id, { signer: d.signer, window: ownerOf(d.signer), refs: d.refs, homes: [...acts.get(id).where], text: t }]; }))));
console.log(JSON.stringify(summary, null, 1));

// ------------------------------------------------------------------ step 2-5 counts: line formats, cMIP spec hashes, app names, Damgar faults
// Each count is over distinct acts (one act held at several homes counts once).
const LINES = { 'ASK v1': /^ASK v1 \|/, 'INVOICE v1': /^INVOICE v1 \|/, 'HELD v1': /^HELD v1 \|/, 'CLAIM v1': /^CLAIM v1 \|/,
  'MEND/LEND/RETURNED': /^(MEND|LEND|RETURNED)/, 'CERCLE-HOURS/CONFIRM': /^CERCLE-(HOURS|CONFIRM)/ };
const SPECP = { 'warning notice d1': '56dd0814', 'warning notice d2': '01cdcebb', 'warning notice d3': '9b88aee2', 'proven claim d1': 'ed9a4b4e', 'proven claim d2': '51f9afc8',
  'delivery receipt': 'ec1f118d', 'lending shelf d1': '255551a7', 'hours of care d1': '4a737c66', 'common pot d1': 'e91f72f5', 'common pot d2': 'f608f7fa', "Hop's tab d2": '6924a08f',
  'held for you d1': '31b66901', 'held for you d2': '08ae1b2c', 'report block p4': '7b65c60f', 'escrow (Until) d5 or earlier': 'cadbbc54', 'grant limits': null };
const APPN = { Damgar: /\bDamgar\b/, 'Pointer Look': /Pointer Look/, 'lookup.mjs': /lookup\.mjs/, 'held.mjs': /\bheld\.mjs/, "Hop's answerer": /answerer/i, "Buy (Bilal Qureshi)": /'Buy'|\bBuy 0\.1|Buy'/,
  Courier: /\bCourier 0\.1|\bCourier\b/, 'kept.mjs': /kept\.mjs/, 'shelf.mjs': /shelf\.mjs/, Fennec: /\bFennec\b/, 'register.mjs (Proven claim)': /register(\.mjs| 0\.\d)/i,
  'cercle counting script': /counting script|cercle-count/i, 'mending.mjs': /mending\.mjs/, 'pot.mjs': /pot\.mjs/, 'words-check.mjs': /words-check/, 'pot-settle.mjs': /pot-settle/, 'open books': /open books/i };
const PHRASES = { 'something MOR has not been used for': /(has not been used for|nothing in this round has used it for|not been used for)/i, 'read it before you run it': /read (it|this|the code|its code) before (you run|running)/i };
const count = { lines: {}, specs: {}, apps: {}, phrases: {} };
const bump = (o, k, id) => { const e = acts.get(id); const s = e.d.signer || 'none'; const w = ownerOf(e.d.signer) || 'unknown';
  const r = (o[k] ||= { acts: new Set(), signers: new Set(), windows: new Set(), sample: [] }); if (!r.acts.has(id)) { r.acts.add(id); r.signers.add(s); r.windows.add(w); if (r.sample.length < 12) r.sample.push(id); } };
for (const [id, e] of acts) {
  const d = e.d; const t = texts.get(id);
  for (const [k, pre] of Object.entries(SPECP)) if (pre && d.spec && d.spec.startsWith(pre)) bump(count.specs, `${k} (signed under it)`, id);
  if (!t) continue;
  for (const [k, re] of Object.entries(LINES)) if (re.test(t)) bump(count.lines, k, id);
  for (const [k, pre] of Object.entries(SPECP)) if (pre && t.includes(pre)) bump(count.specs, `${k} (named in a text)`, id);
  for (const [k, re] of Object.entries(APPN)) if (re.test(t)) bump(count.apps, k, id);
  for (const [k, re] of Object.entries(PHRASES)) if (re.test(t)) bump(count.phrases, k, id);
}
// Damgar faults reported by others: a text by a signer outside DubPay naming Damgar with a fault word
const FAULT = /\b(bug|wrong|fault|404|not held here|does not|doesn't|cannot|can't|missing|never stored|without asking|no question asked|fix)\b/i;
const damgarFaults = [];
for (const [id, t] of texts) { const d = acts.get(id).d; const w = ownerOf(d.signer); if (w === 'dubpay' || !/\bDamgar\b/.test(t) || !FAULT.test(t)) continue;
  damgarFaults.push({ act: id, window: w, signer: d.signer, words: (t.match(FAULT) || [])[0], text: t.slice(0, 400) }); }
const reportFaults = [];
for (const w of windows) { if (w === 'dubpay') continue; const dir = join(windowsDir, w, 'reports'); if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) readFileSync(join(dir, f), 'utf8').split('\n').forEach((l, i) => { if (/\bDamgar\b/.test(l) && FAULT.test(l)) reportFaults.push({ where: `${w}/${f}:${i + 1}`, text: l.slice(0, 400) }); }); }
const flat = (o) => Object.fromEntries(Object.entries(o).map(([k, r]) => [k, { acts: r.acts.size, signers: r.signers.size, windows: [...r.windows].sort(), sample: r.sample }]));
const counts = { lines: flat(count.lines), specs: flat(count.specs), apps: flat(count.apps), phrases: flat(count.phrases), damgarFaultsInActs: damgarFaults.length, damgarFaultsInReports: reportFaults.length };
writeFileSync(join(OUT, 'counts.json'), JSON.stringify({ counts, damgarFaults, reportFaults }, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, `${b.acts} acts, ${b.signers} signers, ${b.windows.length} windows`])) : v])), null, 1));
