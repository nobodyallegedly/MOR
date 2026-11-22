// Finding 4, exploratory: every rotation (Identity type 1) in the home feeds,
// by what its bytes show (kept tips, homes before and after, home rule),
// and whether any act signed with the key it replaced extends one of its
// kept tips (an act after the tip, bound to the act the rotation replaced).
// Read in place; prints counts, and short ids only for the identity asked.
//
// node rotations.mjs RESEARCH_DIR KIT_DIR [IDENTITY_PREFIX]
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [root, kitDir, who] = process.argv.slice(2);
const { mor, plain, SPECS } = await import(pathToFileURL(resolve(kitDir, 'lib/core.mjs')).href);
const acts = new Map();
for (const h of readdirSync(join(root, 'feeds'))) {
  const dir = join(root, 'feeds', h);
  for (const f of readdirSync(dir).filter((f) => /^feed-after-\d+\.cbor$/.test(f)))
    for (const [, k, b] of mor.cborDecode(new Uint8Array(readFileSync(join(dir, f)))).get(0)) {
      if (Number(k) !== 0) continue;
      try { const d = plain(mor.describeAct(b)); if (!acts.has(d.id)) acts.set(d.id, d); } catch {}
    }
}
const get = (m, k) => (m.map ? (m.map.find(([x]) => x === k) ?? [])[1] : m[k]);
const P = (d) => plain(mor.cborDecode(Uint8Array.from(Buffer.from(d.payload, 'hex'))));
const chainActs = [...acts.values()].filter((d) => d.spec === SPECS.identity && (d.type === 0 || d.type === 1));
const byIdentity = new Map();
for (const d of chainActs) { const id = d.type === 0 ? d.id : d.signer; if (!byIdentity.has(id)) byIdentity.set(id, []); byIdentity.get(id).push(d); }
const tally = {};
const bump = (k) => { tally[k] = (tally[k] ?? 0) + 1; };
let n = 0;
for (const [id, chain] of byIdentity) {
  const homesAt = new Map();
  for (const d of chain) { const p = P(d); homesAt.set(d.type === 0 ? 0 : Number(get(p, 1)), JSON.stringify((get(p, 6) ?? []).map((h) => h[0]))); }
  for (const d of chain.filter((d) => d.type === 1)) {
    n++;
    const p = P(d); const pos = Number(get(p, 1));
    const tips = get(p, 4) ?? [];
    bump(`kept tips: ${tips.length}`);
    const before = homesAt.get(pos - 1), after = get(p, 6) ? JSON.stringify(get(p, 6).map((h) => h[0])) : null;
    bump(after === null ? 'homes: left as they were' : after === before ? 'homes: restated, same' : 'homes: changed');
    bump(get(p, 5) !== undefined ? 'home rule: present' : 'home rule: absent');
    // Acts by the same signer, bound to the act this rotation replaced, after a kept tip.
    const replaced = pos === 1 ? id : (chain.find((x) => x.type === 1 && Number(get(P(x), 1)) === pos - 1) ?? {}).id;
    const tipIds = new Set(tips.map((t) => t[0]));
    const past = [...acts.values()].filter((x) => x.signer === id && x.binding === replaced && x.prev && tipIds.has(x.prev));
    bump(past.length ? 'old-key acts extending a kept tip: some' : 'old-key acts extending a kept tip: none');
    if (who && id.startsWith(who)) console.log(`${id.slice(0, 8)}… rotation ${d.id.slice(0, 8)}… pos ${pos}: kept tips ${tips.length}, homes ${after === before ? 'same' : 'changed'}, old-key acts past a tip ${past.length} (${past.map((x) => x.id.slice(0, 8) + '…').join(', ')})`);
  }
}
console.log(`rotations in the feeds: ${n}, of ${byIdentity.size} identities with a chain act`);
for (const [k, v] of Object.entries(tally).sort()) console.log(`  ${String(v).padStart(4)}  ${k}`);
