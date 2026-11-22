// Finds acts by id prefix in the research copy (windows/*/acts/*.mor and every
// home's feed pages), read in place, and describes each: where it is, its
// signer, spec, type, refs, and, for a text act, its text's length and its
// first characters (to the terminal only; nothing is written).
//
// node find-acts.mjs RESEARCH_DIR KIT_DIR [--full] PREFIX ...
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [root, kitDir, ...rest] = process.argv.slice(2);
const full = rest.includes('--full');
const prefixes = rest.filter((x) => x !== '--full');
const { mor, plain, SPECS } = await import(pathToFileURL(resolve(kitDir, 'lib/core.mjs')).href);

const where = new Map(); // id -> {bytes, places:[]}
const see = (bytes, place) => {
  let id;
  try { id = mor.actId(bytes); } catch { return; }
  if (!prefixes.some((p) => id.startsWith(p))) return;
  if (!where.has(id)) where.set(id, { bytes, places: [] });
  where.get(id).places.push(place);
};
for (const w of readdirSync(join(root, 'windows'))) {
  const d = join(root, 'windows', w, 'acts');
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) if (f.endsWith('.mor') && prefixes.some((p) => f.startsWith(p.slice(0, 8)))) see(new Uint8Array(readFileSync(join(d, f))), `windows/${w}/acts`);
}
for (const h of readdirSync(join(root, 'feeds'))) {
  const d = join(root, 'feeds', h);
  for (const f of readdirSync(d).filter((f) => /^(feed-after|records)-\d+\.cbor$/.test(f))) {
    const m = mor.cborDecode(new Uint8Array(readFileSync(join(d, f))));
    const list = m instanceof Map ? m.get(0) : m;
    for (const it of list) {
      if (it instanceof Uint8Array) see(it, `feeds/${h} (record)`);
      else if (Number(it[1]) === 0) see(it[2], `feeds/${h} #${it[0]}`);
    }
  }
}
const names = Object.fromEntries(Object.entries(SPECS).map(([k, v]) => [v, k]));
for (const [id, { bytes, places }] of where) {
  const d = plain(mor.describeAct(bytes));
  const o = { id, places: [...new Set(places)], signer: d.signer, spec: names[d.spec] ?? d.spec, type: d.type, position: d.position, refs: d.refs, public: d.public };
  if (d.payload && d.spec === SPECS.text) {
    const t = mor.cborDecode(Uint8Array.from(Buffer.from(d.payload, 'hex'))).get(0);
    o.textLength = t.length;
    o.text = full ? t : t.slice(0, 300);
  }
  console.log(JSON.stringify(o, null, 1));
}
const missing = prefixes.filter((p) => ![...where.keys()].some((id) => id.startsWith(p)));
if (missing.length) console.log('not found:', missing.join(' '));
