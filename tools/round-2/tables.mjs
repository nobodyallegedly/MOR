// node tables.mjs DATA KIT COUNT_ASK --stand-in FP=NAME ... : prints, as Markdown, the handback's appendices for the
// rerun's entries: (A) each agreement's acts in the place's order with their knots, (B) the answers per verifier.
// Ids are printed as their first 8 characters and "…". Writes nothing. No data inside.
import { loadRound } from './agreements.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const argv = process.argv.slice(2);
const [data, kit, countAsk] = argv;
const standins = []; for (let i = 3; i < argv.length; i++) if (argv[i] === '--stand-in') standins.push('--stand-in', argv[++i]);
const r = await loadRound(data, kit);
const count = JSON.parse(readFileSync(join(data, 'hosts', 'count-rerun.json'), 'utf8'));
const s = (h) => (h ? '`' + h.slice(0, 8) + '…`' : 'none');
const placeId = r.records[0].d.signer;
const pages = readdirSync(join(data, 'feeds', 'postmark-place')).filter((f) => /^records-\d+\.cbor$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8))).map((f) => join(data, 'feeds', 'postmark-place', f));
const files = [...r.ag.values()].map((e) => e.files[0]);
const others = []; { const named = new Set(); for (const e of r.ag.values()) for (const x of e.f.reliesOn ?? []) if (x && !r.ag.has(x) && r.all.has(x)) named.add(x); for (const id of named) others.push(r.all.get(id).files[0]); }
const actsOf = (root) => [...r.ag.values()].filter((e) => e.f.root === root).map((e) => ({ ...e.f, rec: r.place.get(e.f.id) ?? null })).sort((a, b) => (a.rec ?? 1e9) - (b.rec ?? 1e9) || (a.signer < b.signer ? -1 : a.signer > b.signer ? 1 : a.seq - b.seq));
const groups = count.entries.flatMap((e) => [{ e, root: e.terms_root, what: 'work Terms' }, { e, root: e.receiver_deal, what: 'deal' }]);
const qsOf = (root) => { const a = actsOf(root); const q = [['last_version', root]]; for (const x of a) if (x.act === 'terms') { q.push(['in_force', x.id]); if (x.replaces) q.push(['update', x.id]); } for (const x of a) if (x.act === 'statement' && x.kind === 'assent') q.push(['assent', x.id]); for (const sg of [...new Set(a.map((x) => x.signer))]) q.push(['line', sg, root]); for (const x of a) if (x.resolves) q.push(['resolution', x.id]); return q; };
const qs = groups.flatMap((g) => qsOf(g.root));
function run(pre, withOthers) {
  const out = spawnSync(countAsk, [...pre, '--asks', '-', '--acts', ...files, ...(withOthers ? others : [])], { input: qs.map((q) => q.join(' ')).join('\n'), maxBuffer: 1 << 30, encoding: 'utf8' });
  if (out.status !== 0) { console.error(out.stderr); process.exit(1); }
  const m = new Map(); out.stdout.trim().split('\n').map((l) => JSON.parse(l)).forEach((x) => m.set(x.ask + ' ' + x.args.join(' '), x.answers));
  return m;
}
const anch = (n) => ['--place-records', `${placeId}=${pages.join(',')}`, '--anchoring', placeId, '--upto', String(n)];
const modes = [['verifier 2 and the kit, as shown', run([], false)], ['at record 1034', run(anch(1034), false)]];
const ex = [['as shown', run(['--others-are-pieces', ...standins], true)], ['≤1034', run(['--others-are-pieces', ...standins, ...anch(1034)], true)], ['≤1669', run(['--others-are-pieces', ...standins, ...anch(1669)], true)]];
const w = (a) => `${a.word} (${a.rule})`;
console.log('### Appendix A. The acts of each entry, in the place\'s order, with their knots\n');
console.log('*Counted: read from the bytes with the kit\'s own core. "rec" is the place\'s record number; "not lodged" means the place\'s record does not show the act. "#n" is the act\'s position in its signer\'s own sequence. Each line gives the knots the act carries.*\n');
for (const e of count.entries) {
  console.log(`**Entry at record ${e.position}, work ${s(e.work)}, author ${s(e.author)}** (the count: ${e.verdict})\n`);
  for (const [root, what] of [[e.terms_root, 'Work Terms'], [e.receiver_deal, 'Deal']]) {
    console.log(`${what}, root ${s(root)}:\n`);
    for (const a of actsOf(root)) {
      const kn = [];
      if (a.act === 'terms') { kn.push(a.replaces ? `Terms, replaces ${s(a.replaces)}` : 'Terms, the root'); kn.push(`receiver ${a.receiver ? (a.receiver.agreement ? 'the deal ' + s(a.receiver.agreement) : 'party ' + a.receiver.party) : 'none'}`); }
      else { kn.push(`${a.kind}, terms ${s(a.terms)}`); if (a.resolves) kn.push(`resolves ${a.resolves.map(s).join(' and ')}, continues ${s(a.continues)}`); }
      kn.push(`previous ${s(a.previous)}`);
      console.log(`- ${a.rec ? 'rec ' + a.rec : 'not lodged'}: ${s(a.id)} by ${s(a.signer)} #${a.seq}: ${kn.join('; ')}`);
    }
    console.log('');
  }
}
console.log('### Appendix B. The answers, agreement by agreement\n');
console.log('*Counted. Columns: the count\'s own answer; verifier 2 (count-ask) and the kit (the same answers, byte for byte) on what the binding accepts, as shown and with the place\'s record given as the reader\'s anchoring, cut at record 1034; then, **exploratory**, the same verifier with the grammar\'s own defaults held in place of the three cMIPs it lacks and the works held as pieces: as shown, cut at 1034, cut at 1669. Each cell is the last version the verifier names, with its word and rule. "Assents" counts the verifier\'s words for the assents in the agreement under the exploratory reading at 1669.*\n');
console.log('| Entry | Agreement | Versions (record) | The count | Verifier 2 and kit, as shown | The same, at 1034 | Exploratory: as shown | Exploratory: ≤1034 | Exploratory: ≤1669 | Late or other (exploratory) | Assents (exploratory, ≤1669) | Lines |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const g of groups) {
  const a = actsOf(g.root);
  const terms = a.filter((x) => x.act === 'terms');
  const cnt = g.what === 'deal' ? `${s(g.e.deal_version)}` : `${s(g.e.terms_in_force)}, by record ${g.e.in_force_by_record}`;
  const lv = (m) => { const x = m.get('last_version ' + g.root)[0]; return `${x.acts.map(s).join(', ') || '-'} ${w(x)}`; };
  const late = terms.filter((t) => t.replaces).map((t) => { const x = ex[2][1].get('update ' + t.id)[0]; return x.word === 'valid' ? null : `${s(t.id)}: ${x.rule === 'G4.7' ? 'late' : x.word} (${x.rule})`; }).filter(Boolean).join('; ') || '-';
  const tally = {}; for (const x of a.filter((y) => y.act === 'statement' && y.kind === 'assent')) { const k = w(ex[2][1].get('assent ' + x.id)[0]); tally[k] = (tally[k] ?? 0) + 1; }
  const lines = [...new Set(a.map((x) => x.signer))].map((sg) => modes[0][1].get(`line ${sg} ${g.root}`)[0]);
  const forks = lines.filter((x) => x.word === 'fork').length;
  const res = a.filter((x) => x.resolves).map((x) => { const y = modes[0][1].get('resolution ' + x.id)[0]; return `resolve ${s(x.id)}: ${w(y)}`; }).join('; ');
  console.log(`| ${g.e.position} | ${g.what} ${s(g.root)} | ${terms.map((t) => `${s(t.id)} (${t.rec ?? 'not lodged'})`).join(', ')} | ${cnt} | ${lv(modes[0][1])} | ${lv(modes[1][1])} | ${lv(ex[0][1])} | ${lv(ex[1][1])} | ${lv(ex[2][1])} | ${late} | ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join('; ')} | ${lines.length} lines, ${forks} forks (G6.1)${res ? '; ' + res : ''} |`);
}
