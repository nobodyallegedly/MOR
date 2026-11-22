// Finding 4: an identity's chain, judged by the core's Identity verifier
// (the kit's WebAssembly `Verifier`, the same core as `v2`), with every
// Identity-spec act of every home feed held, and the identity's own acts.
// Read in place; prints ids (8 characters), types, positions and answers.
//
// node identity.mjs RESEARCH_DIR KIT_DIR IDENTITY_PREFIX [ACT_PREFIX ...]
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [root, kitDir, who, ...extra] = process.argv.slice(2);
const { mor, plain, SPECS } = await import(pathToFileURL(resolve(kitDir, 'lib/core.mjs')).href);
const s8 = (h) => (h ? `${h.slice(0, 8)}…` : h);

const acts = new Map(); // id -> { bytes, d, homes:Set }
for (const h of readdirSync(join(root, 'feeds'))) {
  const dir = join(root, 'feeds', h);
  for (const f of readdirSync(dir).filter((f) => /^feed-after-\d+\.cbor$/.test(f))) {
    for (const [, k, b] of mor.cborDecode(new Uint8Array(readFileSync(join(dir, f)))).get(0)) {
      if (Number(k) !== 0) continue;
      let d; try { d = plain(mor.describeAct(b)); } catch { continue; }
      if (!acts.has(d.id)) acts.set(d.id, { bytes: b, d, homes: new Set() });
      acts.get(d.id).homes.add(h);
    }
  }
}
const ids = [...acts.keys()];
const identity = ids.find((i) => i.startsWith(who) && acts.get(i).d.spec === SPECS.identity && acts.get(i).d.type === 0);
if (!identity) throw new Error(`no genesis ${who}… in the feeds`);

const v = new mor.Verifier(SPECS.identity, SPECS.money, SPECS.agreements, SPECS.envelopes, SPECS.text);
let refused = 0;
for (const [id, a] of acts) {
  if (a.d.spec !== SPECS.identity && a.d.signer !== identity && !extra.some((p) => id.startsWith(p))) continue;
  try { v.add(a.bytes); } catch { refused++; }
}
console.log(`held: ${v.held().length} acts (every Identity act of every feed, and every act signed as ${s8(identity)}); refused as malformed: ${refused}`);

const mine = [...acts.values()].filter((a) => a.d.signer === identity || a.d.id === identity).sort((x, y) => (x.d.position ?? 0) - (y.d.position ?? 0));
const names = Object.fromEntries(Object.entries(SPECS).map(([k, x]) => [x, k]));
console.log(`\nthe identity's own acts (${mine.length}):`);
for (const a of mine) {
  const d = a.d;
  console.log(`  pos ${d.position ?? 0}\t${s8(d.id)}\t${names[d.spec] ?? s8(d.spec)}/${d.type}\tbinding ${s8(d.binding)}\tprev ${s8(d.prev)}\tstatus ${v.status(d.id)}\tbinding-status ${v.bindingStatus(d.id)}\tat ${[...a.homes].join(',')}`);
}
const r = plain(v.resolve(identity));
console.log('\nresolve:', JSON.stringify(r, (k, x) => (k === 'hint' ? undefined : typeof x === 'string' && /^[0-9a-f]{64}$/.test(x) ? s8(x) : x)).slice(0, 2500));
console.log('succession:', JSON.stringify(plain(v.succession(identity))));
for (const a of mine.filter((a) => a.d.spec === SPECS.identity && a.d.type === 1)) {
  let q; try { q = plain(v.quorum(identity, a.d.id)); } catch (e) { q = String(e); }
  console.log(`quorum for rotation ${s8(a.d.id)}:`, JSON.stringify(q, (k, x) => (typeof x === 'string' && /^[0-9a-f]{64}$/.test(x) ? s8(x) : x)));
  console.log(`  rotation payload:`, JSON.stringify(plain(mor.cborDecode(Uint8Array.from(Buffer.from(a.d.payload, 'hex')))), (k, x) => (typeof x === 'string' && /^[0-9a-f]{64,}$/.test(x) ? `${x.slice(0, 8)}…(${x.length / 2} bytes)` : x)).slice(0, 1500));
}
// Receipts and other acts naming the identity's acts (objects/refs).
const mineIds = new Set(mine.map((a) => a.d.id));
const about = [...acts.values()].filter((a) => a.d.signer !== identity && [...(a.d.objects ?? []), ...(a.d.refs ?? [])].some((x) => mineIds.has(x)));
console.log(`\nacts by others naming its acts (${about.length}):`);
for (const a of about) console.log(`  ${s8(a.d.id)}\t${names[a.d.spec] ?? s8(a.d.spec)}/${a.d.type}\tby ${s8(a.d.signer)}\tnames ${[...(a.d.objects ?? []), ...(a.d.refs ?? [])].filter((x) => mineIds.has(x)).map(s8).join(',')}\tstatus ${v.status(a.d.id)}`);
