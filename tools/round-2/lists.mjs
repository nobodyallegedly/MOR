// Finding 2, "exactly these acts": compares lists of a home's acts, posted as
// text acts, with that home's feed as the research copy holds it, and
// recomputes each list's hash in several forms. Prints counts and hashes only.
//
// node lists.mjs RESEARCH_DIR KIT_DIR HOME LIST_ACT_ID ...
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const [root, kitDir, home, ...listIds] = process.argv.slice(2);
const { mor, plain, SPECS } = await import(pathToFileURL(resolve(kitDir, 'lib/core.mjs')).href);
const sha = (x) => createHash('sha256').update(x).digest('hex');

// The home's feed: arrival -> { kind, id, signer, spec, type }.
const feed = new Map();
const d = join(root, 'feeds', home);
for (const f of readdirSync(d).filter((f) => /^feed-after-\d+\.cbor$/.test(f))) {
  for (const [a, k, b] of mor.cborDecode(new Uint8Array(readFileSync(join(d, f)))).get(0)) {
    const e = { kind: Number(k), byteHash: sha(b) };
    if (e.kind === 0) { const x = plain(mor.describeAct(b)); Object.assign(e, { id: x.id, signer: x.signer ?? x.id, spec: x.spec, type: x.type, public: x.public }); }
    feed.set(Number(a), e);
  }
}
const arrivals = [...feed.keys()].sort((a, b) => a - b);
const specName = Object.fromEntries(Object.entries(SPECS).map(([k, v]) => [v, k]));
console.log(`feed ${home}: ${arrivals.length} items, arrivals ${arrivals[0]}..${arrivals.at(-1)}; acts ${arrivals.filter((a) => feed.get(a).kind === 0).length}, sealed ${arrivals.filter((a) => feed.get(a).kind === 1).length}`);

// A list act's text, found in any window's acts/.
const text = (id) => {
  for (const w of readdirSync(join(root, 'windows'))) {
    const p = join(root, 'windows', w, 'acts', `${id}.mor`);
    if (existsSync(p)) { const x = plain(mor.describeAct(new Uint8Array(readFileSync(p)))); return mor.cborDecode(Uint8Array.from(Buffer.from(x.payload, 'hex'))).get(0); }
  }
  throw new Error(`no act ${id.slice(0, 8)}… in windows/*/acts`);
};
const forms = (ids) => ({
  'sha256(ids as hex, end to end)': sha(ids.join('')),
  'sha256(ids as bytes, end to end)': sha(Buffer.concat(ids.map((i) => Buffer.from(i, 'hex')))),
  'sha256(ids as hex, one per line)': sha(ids.join('\n')),
  'sha256(ids as hex, one per line, final newline)': sha(ids.join('\n') + '\n'),
});

for (const lid of listIds) {
  const t = text(lid);
  const lines = t.split('\n');
  const rows = lines.map((l) => l.trim().split(/\s+/)).filter((r) => r.every((x) => x) && r.some((x) => /^[0-9a-f]{64}$/.test(x)));
  const head = lines.length - rows.length;
  console.log(`\nlist ${lid.slice(0, 8)}…: ${lines.length} lines, ${rows.length} rows with an id, ${head} other lines; columns per row: ${[...new Set(rows.map((r) => r.length))].join(',')}`);
  const withArrival = rows.every((r) => /^\d+$/.test(r[0]));
  const ids = rows.map((r) => r.find((x) => /^[0-9a-f]{64}$/.test(x)));
  for (const [k, v] of Object.entries(forms(ids))) console.log(`  ${k}: ${v.slice(0, 8)}…${v.slice(-4)}`);
  const sorted = ids.every((x, i) => i === 0 || ids[i - 1] < x);
  console.log(`  sorted by id: ${sorted}; distinct ids: ${new Set(ids).size}`);
  // Compare with the feed.
  const byId = new Map(); const byByte = new Map();
  for (const a of arrivals) { const e = feed.get(a); if (e.id) byId.set(e.id, a); byByte.set(e.byteHash, a); }
  let asAct = 0, asSealed = 0, absent = 0, arrivalMatch = 0, arrivalMismatch = 0;
  const kinds = {};
  rows.forEach((r, n) => {
    const id = ids[n];
    if (byId.has(id)) { asAct++; const e = feed.get(byId.get(id)); const k = `${specName[e.spec] ?? 'other'}/${e.type}${e.public ? '' : ' private'}`; kinds[k] = (kinds[k] ?? 0) + 1; }
    else if (byByte.has(id)) asSealed++;
    else absent++;
    if (withArrival) { const e = feed.get(Number(r[0])); if (e && (e.id === id || e.byteHash === id)) arrivalMatch++; else arrivalMismatch++; }
  });
  console.log(`  in the feed as an act id: ${asAct}; as a sealed item's byte hash: ${asSealed}; not in the feed: ${absent}`);
  console.log(`  by spec/type: ${JSON.stringify(kinds)}`);
  if (withArrival) {
    const nums = rows.map((r) => Number(r[0]));
    console.log(`  arrivals listed ${Math.min(...nums)}..${Math.max(...nums)}; row's arrival names that id in the feed: ${arrivalMatch}, does not: ${arrivalMismatch}`);
    const missing = arrivals.filter((a) => a <= Math.max(...nums) && !nums.includes(a));
    console.log(`  feed arrivals up to the last listed, not in the list: ${missing.length} ${missing.slice(0, 20).join(' ')}`);
    // The same rule rebuilt from the feed, over 1..N for each N near the end.
    for (const N of [953, Math.max(...nums), 975, 984]) {
      const ids2 = arrivals.filter((a) => a <= N).map((a) => feed.get(a).id ?? feed.get(a).byteHash);
      console.log(`  rebuilt from the feed, arrivals 1..${N} (sealed by byte hash): ${ids2.length} ids, sha256 hex end to end ${sha(ids2.join('')).slice(0, 8)}…${sha(ids2.join('')).slice(-4)}`);
      const ids3 = arrivals.filter((a) => a <= N).map((a) => feed.get(a).id ?? 'unreadable');
      console.log(`    the same with sealed items as "unreadable": ${sha(ids3.join('')).slice(0, 8)}…`);
    }
  } else {
    // An unordered list: which rule over the feed rebuilds it?
    for (const N of [953, 974, 975, 984, arrivals.at(-1)]) {
      const pick = arrivals.filter((a) => a <= N && feed.get(a).spec === SPECS.identity).map((a) => feed.get(a).id);
      const s = [...new Set(pick)].sort();
      const set = new Set(ids);
      const same = s.length === ids.length && s.every((x) => set.has(x));
      console.log(`  identity acts at arrivals 1..${N}: ${s.length} (signers ${new Set(arrivals.filter((a) => a <= N && feed.get(a).spec === SPECS.identity).map((a) => feed.get(a).signer)).size}); same set as the list: ${same}; in list not here ${ids.filter((x) => !s.includes(x)).length}, here not in list ${s.filter((x) => !set.has(x)).length}`);
      for (const [k, v] of Object.entries(forms(s))) if (N === 984) console.log(`    ${k}: ${v.slice(0, 8)}…${v.slice(-4)}`);
    }
  }
}
