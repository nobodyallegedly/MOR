// node run.mjs DATA KIT COUNT_ASK [--mode as-shown|anchoring] [--upto N] [--stand-in FP=NAME ...] [--entries a,b] [--roots r1,r2] [--full]
// Asks verifier 2 (count-ask) and the kit's own binding (agreementsNewAsk) the plan's questions about the
// agreements of the rerun's entries, over every Agreements act of the round, read in place. Prints a compact
// table; writes nothing. No data inside.
import { loadRound } from './agreements.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const [data, kit, countAsk] = argv;
const opt = { mode: 'as-shown', standins: [], full: false };
for (let i = 3; i < argv.length; i++) {
  if (argv[i] === '--mode') opt.mode = argv[++i];
  else if (argv[i] === '--upto') opt.upto = Number(argv[++i]);
  else if (argv[i] === '--stand-in') opt.standins.push(argv[++i]);
  else if (argv[i] === '--entries') opt.entries = argv[++i].split(',');
  else if (argv[i] === '--roots') opt.roots = argv[++i].split(',');
  else if (argv[i] === '--full') opt.full = true;
  else if (argv[i] === '--no-kit') opt.noKit = true;
  else if (argv[i] === '--summary') opt.summary = true;
  else if (argv[i] === '--with-others') opt.withOthers = argv[++i]; // 'held' or 'pieces': also give the non-Agreements acts that Agreements acts name
}
const r = await loadRound(data, kit);
const count = JSON.parse(readFileSync(join(data, 'hosts', 'count-rerun.json'), 'utf8'));
const s = (h) => (h ? h.slice(0, 8) : '-');
const placeId = r.records[0].d.signer; // the place, by its identity: the anchoring the reader is told to accept
const files = [...r.ag.values()].flatMap((e) => e.files.slice(0, 1));
const pages = readdirSync(join(data, 'feeds', 'postmark-place')).filter((f) => /^records-\d+\.cbor$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8))).map((f) => join(data, 'feeds', 'postmark-place', f));

function actsOf(root) {
  const v = [...r.ag.values()].filter((e) => e.f.root === root).map((e) => ({ ...e.f, rec: r.place.get(e.f.id) ?? null }));
  v.sort((a, b) => (a.rec ?? 1e9) - (b.rec ?? 1e9) || (a.signer < b.signer ? -1 : a.signer > b.signer ? 1 : a.seq - b.seq));
  return v;
}
function questions(root) {
  const acts = actsOf(root);
  const q = [['last_version', root]];
  for (const a of acts) if (a.act === 'terms') { q.push(['in_force', a.id]); if (a.replaces) q.push(['update', a.id]); }
  for (const a of acts) if (a.act === 'statement' && a.kind === 'assent') q.push(['assent', a.id]);
  for (const sg of [...new Set(acts.map((a) => a.signer))]) q.push(['line', sg, root]);
  for (const a of acts) if (a.resolves) q.push(['resolution', a.id]);
  return q;
}
let roots = [];
if (opt.roots) roots = opt.roots.map((x) => ({ root: [...r.ag.keys()].find((k) => k.startsWith(x)) ?? x, label: 'root ' + x }));
else for (const e of count.entries) {
  if (opt.entries && !opt.entries.includes(String(e.position))) continue;
  roots.push({ root: e.terms_root, label: `ENTRY ${e.position} work Terms (count: ${e.verdict}; last ${s(e.terms_in_force)} by rec ${e.in_force_by_record})` });
  roots.push({ root: e.receiver_deal, label: `ENTRY ${e.position} deal (count: version ${s(e.deal_version)})` });
}
const qs = roots.flatMap((x) => questions(x.root));
// The acts of other specifications that an Agreements act names (a work its Terms rely on): given too, on request.
const others = [];
if (opt.withOthers) {
  const named = new Set();
  for (const e of r.ag.values()) for (const x of [...(e.f.reliesOn ?? []), e.f.previous, e.f.terms]) if (x && !r.ag.has(x) && r.all.has(x)) named.add(x);
  for (const id of named) { const e = r.all.get(id); if (e.files) others.push(e.files[0]); }
}
const args = ['--asks', '-', '--acts', ...files, ...others];
const pre = [];
if (opt.withOthers === 'pieces') pre.push('--others-are-pieces');
if (opt.mode === 'anchoring') { pre.push('--place-records', `${placeId}=${pages.join(',')}`, '--anchoring', placeId); if (opt.upto) pre.push('--upto', String(opt.upto)); }
for (const x of opt.standins) pre.push('--stand-in', x);
const out = spawnSync(countAsk, [...pre, ...args], { input: qs.map((q) => q.join(' ')).join('\n'), maxBuffer: 1 << 30, encoding: 'utf8' });
if (out.status !== 0) { console.error(out.stderr); process.exit(1); }
const v2 = out.stdout.trim().split('\n').map((l) => JSON.parse(l));

// The kit: the same question through the kit's own binding, as `agreements ask` calls it (acts, ask, args).
// The kit's command passes no place and no anchoring; they are given here only in anchoring mode, to compare the library.
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((y) => [y, x[y]])) : x));
let kitAnswers = null, kitDiff = 0;
if (!opt.noKit && !opt.standins.length) {
  const acts = [...r.ag.values()].map((e) => ({ bytes: e.bytes }));
  const extra = {};
  if (opt.mode === 'anchoring') {
    let order = r.records.filter((x) => x.names).map((x) => [x.names, x.n]);
    // the binding's place is a list in order, positions from 1: pad so positions equal record numbers
    const max = opt.upto ?? Math.max(...order.map((x) => x[1]));
    const list = []; const seen = new Set();
    for (let n = 1; n <= max; n++) { const x = r.records.find((y) => y.n === n); const id = x && x.names && !seen.has(x.names) ? x.names : null; if (id) seen.add(id); list.push(id ?? (n.toString(16).padStart(64, 'f'))); }
    extra.places = [{ id: placeId, order: list }]; extra.anchoring = placeId;
  }
  kitAnswers = qs.map((q) => { try { return JSON.parse(r.mor.agreementsNewAsk({ acts, ask: q[0], args: q.slice(1), ...extra })); } catch (e) { return { error: String(e) }; } });
  kitAnswers.forEach((a, i) => { if (canon(a) !== canon(v2[i].answers)) { kitDiff++; if (kitDiff < 4) console.log('KIT DIFFERS', qs[i].map(s).join(' '), JSON.stringify(a).slice(0, 300), '<>', JSON.stringify(v2[i].answers).slice(0, 300)); } });
}
console.log(`${opt.withOthers ? others.length + ' named acts of other specifications given as ' + opt.withOthers + '; ' : ''}mode ${opt.mode}${opt.upto ? ' upto ' + opt.upto : ''}${opt.standins.length ? ' stand-ins ' + opt.standins.map((x) => s(x) + '=' + x.split('=')[1]).join(',') : ''}; ${files.length} acts held; ${qs.length} questions; kit ${kitAnswers ? (kitDiff ? kitDiff + ' answers DIFFER' : 'gives the same answers, byte for byte') : 'not asked'}`);
if (opt.summary) {
  let j = 0;
  for (const x of roots) {
    const qsr = questions(x.root);
    const ans = qsr.map(() => v2[j++]);
    const get = (name) => qsr.map((q, k) => [q, ans[k].answers?.[0], ans[k].answers]).filter(([q]) => q[0] === name);
    const lv = ans[0].answers[0];
    const terms = get('in_force').map(([q, a]) => `${s(q[1])}@${r.place.get(q[1]) ?? '—'}:${a.word}/${a.rule}`).join('  ');
    const ups = get('update').map(([q, a]) => `${s(q[1])}:${a.word}/${a.rule}`).join('  ');
    const tally = {};
    for (const [q, a] of get('assent')) { const f = r.ag.get(q[1]).f; const k = `${a.word}/${a.rule}→${s(f.terms)}`; (tally[k] ??= []).push(s(q[1])); }
    const forks = get('line').filter(([q, a]) => a.word === 'fork' || a.rule !== 'G6.1').map(([q, a]) => `${s(q[1])}:${a.word}/${a.rule}[${a.acts.map(s)}]`).join(' ');
    const res = get('resolution').map(([q, a]) => `${s(q[1])}:${a.word}/${a.rule}`).join(' ');
    console.log(x.label + ' root ' + s(x.root));
    console.log(`   last_version: ${lv.word}/${lv.rule}/${lv.qualifier.replace(/ [0-9a-f]+$/, '')} acts ${lv.acts.map(s)}${ans[0].answers.length > 1 ? ' + ' + ans[0].answers.slice(1).map((y) => y.word + '/' + y.rule + ' ' + y.acts.map(s)).join('; ') : ''}`);
    console.log(`   in_force: ${terms}`);
    if (ups) console.log(`   update:   ${ups}`);
    console.log(`   assents:  ${Object.entries(tally).map(([k, v]) => `${k} ×${v.length}${v.length <= 3 ? ' (' + v.join(',') + ')' : ''}`).join(' | ')}`);
    if (forks) console.log(`   lines:    ${forks}`);
    if (res) console.log(`   resolve:  ${res}`);
    if (opt.full) console.log(`   says:     ${lv.says.replace(/[0-9a-f]{12}(?![0-9a-f])/g, (m) => m.slice(0, 8)).slice(0, 300)}`);
  }
  process.exit(0);
}
let i = 0;
const short = (t) => t.replace(/[0-9a-f]{12}(?![0-9a-f])/g, (m) => m.slice(0, 8));
for (const x of roots) {
  console.log(x.label + ' root ' + s(x.root));
  for (const q of questions(x.root)) {
    const a = v2[i++];
    const first = a.answers?.[0];
    const f = r.ag.get(q[1])?.f;
    const tag = q[0] === 'line' ? `line of ${s(q[1])}` : `${q[0]} ${s(q[1])}${f?.rec ? '' : ''}`;
    const rec = q[0] === 'line' ? '' : ` [rec ${r.place.get(q[1]) ?? '—'}]`;
    console.log(`   ${tag.padEnd(24)}${rec.padEnd(11)} ${a.error ? 'ERROR ' + a.error : `${first.word} | ${first.rule} | ${first.qualifier.replace(/ [0-9a-f]+$/, '')}${first.acts.length ? ' | acts ' + first.acts.map(s).join(',') : ''}${opt.full ? ' | ' + short(first.says).slice(0, 260) : ''}`}${a.answers?.length > 1 ? ' (+' + a.answers.slice(1).map((y) => y.word + ' ' + y.rule + ' ' + y.acts.map(s).join(',')).join('; ') + ')' : ''}`);
  }
}
