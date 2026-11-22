// node check.mjs DATA KIT AGREEMENTS_CHECK : runs the repository's agreements-check on every Agreements act file of the
// data, held together, and on the acts of the rerun's entries' agreements alone; prints the tally of verdicts and notes.
import { loadRound } from './agreements.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const [data, kit, bin] = process.argv.slice(2);
const r = await loadRound(data, kit);
const count = JSON.parse(readFileSync(join(data, 'hosts', 'count-rerun.json'), 'utf8'));
const roots = new Set(count.entries.flatMap((e) => [e.terms_root, e.receiver_deal]));
function run(label, es) {
  const out = spawnSync(bin, ['--json', ...es.map((e) => e.files[0])], { maxBuffer: 1 << 30, encoding: 'utf8' });
  const rows = out.stdout.trim().split('\n').map((l) => JSON.parse(l));
  const tally = {};
  for (const x of rows) { const k = `${x.verdict}${x.rule ? ' ' + x.rule : ''}${x.notes.length ? ' notes ' + x.notes.map((n) => n.rule).join(',') : ''}`; tally[k] = (tally[k] ?? 0) + 1; }
  console.log(label, rows.length, 'acts, exit', out.status, JSON.stringify(tally));
  // the kit's own check (agreementsNewCheckHeld), on the same bytes
  const kitRows = r.mor.agreementsNewCheckHeld(es.map((e) => ({ act: e.bytes })));
  let diff = 0; kitRows.forEach((k, i) => { if (k.verdict !== rows[i].verdict || (k.rule ?? null) !== (rows[i].rule ?? null)) diff++; });
  console.log('   the kit\'s check on the same bytes:', diff ? diff + ' verdicts differ' : 'the same verdict and rule for every act');
  return rows;
}
run('every Agreements act of the data:', [...r.ag.values()]);
const rows = run('the acts of the 52 agreements of the rerun\'s entries:', [...r.ag.values()].filter((e) => roots.has(e.f.root)));
for (const x of rows) if (x.notes.length || x.verdict !== 'pass') console.log('   ', x.id.slice(0, 8), x.verdict, x.rule ?? '', x.notes.map((n) => n.rule + ': ' + n.says.slice(0, 90)).join(' | '));
