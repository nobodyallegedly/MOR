// node groupb.mjs DATA KIT COUNT_ASK [--stand-in FP=NAME ...] : for each lineup of the rerun's count and each entry it names,
// the voter's assents in that entry's work agreement: which version each names, where the place shows it, and
// verifier 2's answer about it (plain; and, exploratory, with stand-ins: as shown, and per anchoring cut at 1669).
import { loadRound } from './agreements.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const argv = process.argv.slice(2);
const [data, kit, countAsk] = argv;
const standins = []; for (let i = 3; i < argv.length; i++) if (argv[i] === '--stand-in') standins.push('--stand-in', argv[++i]);
const r = await loadRound(data, kit);
const count = JSON.parse(readFileSync(join(data, 'hosts', 'count-rerun.json'), 'utf8'));
const s = (h) => (h ? h.slice(0, 8) : '-');
const placeId = r.records[0].d.signer;
const pages = readdirSync(join(data, 'feeds', 'postmark-place')).filter((f) => /^records-\d+\.cbor$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8))).map((f) => join(data, 'feeds', 'postmark-place', f));
const files = [...r.ag.values()].map((e) => e.files[0]);
const others = []; { const named = new Set(); for (const e of r.ag.values()) for (const x of e.f.reliesOn ?? []) if (x && !r.ag.has(x) && r.all.has(x)) named.add(x); for (const id of named) others.push(r.all.get(id).files[0]); }
const entryByWork = new Map(count.entries.map((e) => [e.work.slice(0, 16), e]));
const rows = [];
for (const l of count.lineups) {
  const lu = r.all.get(l.lineup);
  for (const p of l.points) {
    const key = p[0];
    const e = [...entryByWork.entries()].find(([k]) => String(key).startsWith(k.slice(0, 8)))?.[1];
    if (!e) { rows.push({ l, key, none: true }); continue; }
    const mine = [...r.ag.values()].filter((x) => x.f.root === e.terms_root && x.f.signer === l.voter && x.f.act === 'statement').map((x) => x.f).sort((a, b) => a.seq - b.seq);
    rows.push({ l, e, mine, lineupSeq: lu?.d?.position });
  }
}
const qs = rows.flatMap((x) => (x.mine ?? []).map((a) => ['assent', a.id]));
function run(pre) {
  const out = spawnSync(countAsk, [...pre, '--asks', '-', '--acts', ...files, ...others], { input: qs.map((q) => q.join(' ')).join('\n'), maxBuffer: 1 << 30, encoding: 'utf8' });
  if (out.status !== 0) { console.error(out.stderr); process.exit(1); }
  return new Map(out.stdout.trim().split('\n').map((x) => JSON.parse(x)).map((x) => [x.args[0], x.answers[0]]));
}
const plain = run([]);
const shown = standins.length ? run(['--others-are-pieces', ...standins]) : null;
const at = standins.length ? run(['--others-are-pieces', ...standins, '--place-records', `${placeId}=${pages.join(',')}`, '--anchoring', placeId, '--upto', '1669']) : null;
const w = (a) => (a ? `${a.word}/${a.rule}` : '');
let cur = '';
for (const x of rows) {
  const head = `LINEUP ${s(x.l.lineup)} voter ${s(x.l.voter)} rec ${x.l.place_record} line pos ${x.l.line_position} (count: ${x.l.verdict})`;
  if (head !== cur) { console.log(head); cur = head; }
  if (x.none) { console.log(`   names ${String(x.key).slice(0, 8)}: not an entry of the count`); continue; }
  console.log(`   entry ${x.e.position} work ${s(x.e.work)} (count: ${x.e.verdict}; last version ${s(x.e.terms_in_force)})`);
  if (!x.mine.length) console.log('      no assent by the voter in this agreement is in the data');
  for (const a of x.mine) console.log(`      ${a.kind} ${s(a.id)} → version ${s(a.terms)}${a.terms === x.e.terms_in_force ? ' (the last version by the count)' : a.terms === x.e.terms_root ? ' (the root)' : ' (another version)'}  place rec ${r.place.get(a.id) ?? '—'}  voter's seq ${a.seq} (lineup at ${x.lineupSeq ?? '?'})  prev ${s(a.previous)}  | verifier 2: ${w(plain.get(a.id))}${shown ? ` | stand-in, as shown: ${w(shown.get(a.id))} | stand-in, per anchoring ≤1669: ${w(at.get(a.id))}` : ''}`);
}
