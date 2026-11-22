// node overview.mjs DATA KIT : for each entry of the rerun's count, the acts of its two agreements, in the place's order, with their knots.
import { loadRound } from './agreements.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const [data, kit, only] = process.argv.slice(2);
const r = await loadRound(data, kit);
const count = JSON.parse(readFileSync(join(data, 'hosts', 'count-rerun.json'), 'utf8'));
const s = (h) => (h ? h.slice(0, 8) : '-');
export function actsOf(root) {
  const v = [...r.ag.values()].filter((e) => e.f.root === root).map((e) => ({ ...e.f, rec: r.place.get(e.f.id) ?? null }));
  v.sort((a, b) => (a.rec ?? 1e9) - (b.rec ?? 1e9) || (a.signer < b.signer ? -1 : a.signer > b.signer ? 1 : a.seq - b.seq));
  return v;
}
function show(root, label) {
  console.log(`  ${label} root ${s(root)}`);
  for (const a of actsOf(root)) {
    const what = a.act === 'terms' ? (a.replaces ? `TERMS replaces ${s(a.replaces)}` : 'TERMS root') + (a.resolves ? ` RESOLVES ${a.resolves.map(s)} cont ${s(a.continues)}` : '') + ` inF ${s(a.inForce)} cond ${s(a.condition)}${a.place ? ' place ' + s(a.place) : ''} parties ${a.parties.map((p) => (p.role ? 'role' : (p.agreement ? 'agr:' : '') + s(p.signer ?? p.agreement))).join(',')} recv ${a.receiver ? (a.receiver.agreement ? s(a.receiver.agreement) : 'party' + a.receiver.party) : '-'}`
      : `${a.kind} terms ${s(a.terms)}` + (a.for ? ' FOR' : '') + (a.resolves ? ` RESOLVES ${a.resolves.map(s)} cont ${s(a.continues)}` : '');
    console.log(`    rec ${String(a.rec ?? '—').padStart(4)}  ${s(a.id)}  by ${s(a.signer)} #${String(a.seq).padStart(3)}  prev ${s(a.previous)}  ${what}`);
  }
}
for (const e of count.entries) {
  if (only && !only.split(',').includes(String(e.position))) continue;
  console.log(`ENTRY rec ${e.position} work ${s(e.work)} author ${s(e.author)} count: ${e.verdict}, last version ${s(e.terms_in_force)} by rec ${e.in_force_by_record}, deal version ${s(e.deal_version)}`);
  show(e.terms_root, 'A1 work Terms');
  show(e.receiver_deal, 'A2 deal');
}
