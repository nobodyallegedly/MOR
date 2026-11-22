// node params.mjs DATA KIT IDPREFIX... : the control socket's parameters and a few fields of Terms acts (no words).
import { loadRound } from './agreements.mjs';
import { plain } from './round.mjs';
const [data, kit, ...ids] = process.argv.slice(2);
const r = await loadRound(data, kit);
for (const p of ids) {
  const e = [...r.ag.values()].find((x) => x.f.id.startsWith(p));
  const m = r.mor.cborDecode(Uint8Array.from(Buffer.from(e.d.payload, 'hex')));
  const show = (k) => (m.get(k) ? JSON.stringify(plain(m.get(k))).replace(/[0-9a-f]{64}/g, (x) => x.slice(0, 8) + '…') : '-');
  console.log(`${p} rec ${r.place.get(e.f.id) ?? '—'} control(14) ${show(14)} | inForce(6) ${show(6)} | condition(13) ${show(13)} | relies_on(5) ${show(5)} | receiver(10) ${show(10)} | data(16) ${show(16)} | body(4) ${show(4)}`);
}
