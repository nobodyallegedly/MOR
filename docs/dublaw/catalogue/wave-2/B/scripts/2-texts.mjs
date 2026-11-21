// DubLaw wave 2, session B. Step 2: every text held, and every fingerprint it can be named by.
// Usage: node 2-texts.mjs RESEARCH_DIR KIT_DIR OUT_DIR   (after 1-decode.mjs)
// For each text act (Text MIR, type 0), and for each text file held in _research (windows/*/ but acts/,
// and hosts/), the fingerprints a socket might name it by:
//   spec   tagged_hash("MOR/spec", {0: kind, 1: creator, 9: text}), kinds 0 to 3, the creator being the act's
//          signer (for a file: every identity that signed a text or Agreements act; at most one final line
//          break removed, as Development rule 26 reads a file);
//   act    the text act's own id (Stall named its cMIPs so);
//   sha256 the plain SHA-256 of the text's UTF-8 bytes (Counterparty named its plain-words body so);
//   work   tagged_hash("MOR/work", bytes), MOR's work hash;
//   lead   the SHA-256 of the text's opening sentences, up to each of its first 20 sentence ends (Counterparty's
//          plain-words body names itself by the SHA-256 of its first four sentences).
// Writes OUT_DIR/texts.json: { byHash: {hash: [{how, source, ...}]}, texts: {key: {title, draft, ...}} }.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const [R, KIT, OUT] = process.argv.slice(2);
const { mor } = await import(join(KIT, 'lib/core.mjs'));
const sha = (b) => createHash('sha256').update(b).digest();
const tagged = (tag, b) => { const t = sha(Buffer.from(tag)); return createHash('sha256').update(t).update(t).update(b).digest('hex'); };
const acts = readFileSync(join(OUT, 'acts.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const byHash = {};
const texts = {};
const put = (h, e) => (byHash[h] ??= []).push(e);
function specHash(text, creator, kind) {
  try {
    return mor.decodeSpec(mor.cborEncode(new Map([[0, kind], [1, Uint8Array.from(Buffer.from(creator, 'hex'))], [9, text]]))).hash;
  } catch {
    return null;
  }
}
function head(text) {
  const first = text.split('\n').find((l) => l.trim()) ?? '';
  const title = first.replace(/^#+\s*/, '').replace(/\*/g, '').trim().slice(0, 160);
  const m = text.slice(0, 600).match(/draft[\s-]*(\d+)/i);
  return { title, draft: m ? Number(m[1]) : null };
}
const creators = new Set();
for (const a of acts) if (a.signer && (a.specName === 'text' || a.specName === 'agreements')) creators.add(a.signer);
// Text acts
for (const a of acts) {
  if (a.specName !== 'text' || a.type !== 0 || !a.payload || typeof a.payload['0'] !== 'string') continue;
  const text = a.payload['0'];
  const key = 'act:' + a.id;
  texts[key] = { source: 'act', act: a.id, signer: a.signer, bytes: Buffer.byteLength(text), order: a.order, ...head(text) };
  for (const k of [0, 1, 2, 3]) { const h = specHash(text, a.signer, k); if (h) put(h, { how: 'spec', kind: k, creator: a.signer, text: key }); }
  put(a.id, { how: 'act', text: key });
  put(sha(Buffer.from(text)).toString('hex'), { how: 'sha256', text: key });
  put(tagged('MOR/work', Buffer.from(text)), { how: 'work', text: key });
  let n = 0;
  for (const m of text.matchAll(/[.!?](?= )/g)) { if (++n > 20) break; put(sha(Buffer.from(text.slice(0, m.index + 1))).toString('hex'), { how: 'sha256 of its opening sentences (' + n + ')', text: key }); }
}
// Text files held
function* walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) { if (!['acts', 'kit', 'node_modules', 'media'].includes(f)) yield* walk(p); }
    else if (/\.(md|txt)$/.test(f) && s.size < 400000) yield p;
  }
}
let files = 0;
for (const root of ['windows', 'hosts']) for (const p of walk(join(R, root))) {
  if (/\/reports\//.test(p)) continue;
  const raw = readFileSync(p, 'utf8');
  const text = raw.endsWith('\r\n') ? raw.slice(0, -2) : raw.endsWith('\n') ? raw.slice(0, -1) : raw;
  const key = 'file:' + relative(R, p);
  texts[key] = { source: 'file', file: relative(R, p), bytes: Buffer.byteLength(text), ...head(text) };
  files++;
  for (const b of new Set([raw, text])) { put(sha(Buffer.from(b)).toString('hex'), { how: 'sha256', text: key }); put(tagged('MOR/work', Buffer.from(b)), { how: 'work', text: key }); }
  try { mor.checkText(text); } catch { continue; }
  if (!/cmip|draft|module|terms/i.test(text.slice(0, 2000))) continue; // only texts that read as a cMIP, a Module or Terms words
  for (const c of creators) { const h = specHash(text, c, 0); if (h) put(h, { how: 'spec', kind: 0, creator: c, text: key }); }
}
writeFileSync(join(OUT, 'texts.json'), JSON.stringify({ byHash, texts }));
console.log({ textActs: Object.values(texts).filter((t) => t.source === 'act').length, files, creators: creators.size, hashes: Object.keys(byHash).length });
