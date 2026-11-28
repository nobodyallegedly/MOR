// count-corrections.mjs — DubWeb wave 3, session F: counts the rows of corrections.md by reread and by verdict. Prints; writes nothing.
import { readFileSync } from 'node:fs';
const rows = readFileSync(new URL('./corrections.md', import.meta.url), 'utf8').split('\n').filter((l) => /^\| (D|E1|E2)·/.test(l));
const by = {}; const verdict = {};
for (const l of rows) { const c = l.split(' | '); const who = c[0].slice(2).split('·')[0]; by[who] = (by[who] ?? 0) + 1; const v = c[3].trim(); verdict[v] = (verdict[v] ?? 0) + 1; }
console.log(JSON.stringify({ rows: rows.length, by_reread: by, by_verdict: verdict }));
