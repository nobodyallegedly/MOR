// node resolves.mjs DATA KIT COUNT_ASK : every Statement of kind resolve in the data, what it names, and verifier 2's
// answers about it and about its signer's line (plain: the binding's own inputs; as shown).
import { loadRound } from './agreements.mjs';
import { spawnSync } from 'node:child_process';
const [data, kit, countAsk] = process.argv.slice(2);
const r = await loadRound(data, kit);
const s = (h) => (h ? h.slice(0, 8) : '-');
const res = [...r.ag.values()].filter((e) => e.f.resolves).map((e) => e.f).sort((a, b) => (r.place.get(a.id) ?? 1e9) - (r.place.get(b.id) ?? 1e9));
const qs = res.flatMap((a) => [['resolution', a.id], ['line', a.signer, a.root], ['act', a.id]]);
const out = spawnSync(countAsk, ['--asks', '-', '--acts', ...[...r.ag.values()].map((e) => e.files[0])], { input: qs.map((q) => q.join(' ')).join('\n'), maxBuffer: 1 << 30, encoding: 'utf8' });
const ans = out.stdout.trim().split('\n').map((l) => JSON.parse(l).answers[0]);
// forks in any line at all, among every Agreements act of the data
const lines = new Map();
for (const e of r.ag.values()) { const k = `${e.f.signer} ${e.f.root} ${e.f.previous ?? 'none'}`; (lines.get(k) ?? lines.set(k, []).get(k)).push(e.f); }
const forks = [...lines.entries()].filter(([, v]) => v.length > 1);
console.log(`${res.length} resolves; ${forks.length} groups of acts of one signer in one agreement naming the same previous (or none), by plain reading of the fields`);
res.forEach((a, i) => {
  const what = (id) => { const f = r.ag.get(id)?.f; return f ? `${s(id)}(${f.act === 'terms' ? 'Terms' : f.kind} by ${f.signer === a.signer ? 'the signer' : s(f.signer)}, prev ${s(f.previous)}${f.replaces ? ', replaces ' + s(f.replaces) : ''})` : `${s(id)}(not in the data)`; };
  console.log(`resolve ${s(a.id)} by ${s(a.signer)} rec ${r.place.get(a.id) ?? '—'} in ${s(a.root)} prev ${s(a.previous)} resolves ${a.resolves.map(what).join(' + ')} continues ${s(a.continues)}`);
  console.log(`     resolution: ${ans[3 * i].word}/${ans[3 * i].rule} "${ans[3 * i].says.replace(/[0-9a-f]{12}(?![0-9a-f])/g, (m) => m.slice(0, 8)).slice(0, 150)}" | line: ${ans[3 * i + 1].word}/${ans[3 * i + 1].rule} | act: ${ans[3 * i + 2].word}/${ans[3 * i + 2].rule}`);
});
for (const [k, v] of forks) { const [sg, root] = k.split(' '); console.log(`same-previous group: signer ${s(sg)} agreement ${s(root)} previous ${s(v[0].previous)}: ${v.map((f) => `${s(f.id)}(${f.act === 'terms' ? 'Terms' : f.kind}, rec ${r.place.get(f.id) ?? '—'})`).join(' , ')}`); }
