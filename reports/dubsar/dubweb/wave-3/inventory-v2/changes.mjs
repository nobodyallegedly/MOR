// changes.mjs — DubWeb wave 3, session F: what changed between inventory version 1 (../inventory/) and version 2 (this folder).
// Reads the two inventory-all.json files, writes changes.md. Every line is by code; the "asked by" column is the record's own checks_wave_3.
import { readFileSync, writeFileSync } from 'node:fs';
const v1 = JSON.parse(readFileSync('../inventory/inventory-all.json', 'utf8')).specifications;
const v2 = JSON.parse(readFileSync('inventory-all.json', 'utf8')).specifications;
const key = (r) => r.spec_hash ?? r.act;
const m1 = new Map(v1.map((r) => [key(r), r]));
const t = (r) => String(r.title ?? '').replace(/^#+\s*/, '').replace(/\|/g, '/').slice(0, 70);
const cut = (h) => (h ? h.slice(0, 8) + '…' + h.slice(-4) : '—');
const st = (r) => (r.to_settle ? 'to settle' : 'settled');
const rows = []; const same = [];
for (const r of v2) {
  const o = m1.get(key(r)); const by = r.checks_wave_3?.by?.map((b) => b.replace(/ \(.*\)/, '')).join('; ') || '—';
  if (!o) { rows.push({ r, from: 'no record', to: `${r.area}: ${r.area_category}; ${st(r)}; added by hand (named by act id only)`, by, says: r.checks_wave_3?.says }); continue; }
  const d = [];
  if (o.area !== r.area) d.push(`area ${o.area} → ${r.area}`);
  if (o.area_category !== r.area_category) d.push(`category "${o.area_category}" → "${r.area_category}"`);
  if (!!o.to_settle !== !!r.to_settle) d.push(`${st(o)} → ${st(r)}`);
  const marks = r.checks_wave_3?.marks ?? [];
  if (marks.length) d.push('marked: ' + marks.join('; '));
  if (d.length) rows.push({ r, from: `${o.area}: ${o.area_category}; ${st(o)}`, to: d.join('; '), by, says: r.checks_wave_3?.says });
  else if (r.to_settle) same.push(r);
}
const gone = v1.filter((o) => !v2.some((r) => key(r) === key(o)));
const count = (L, a) => L.filter((r) => r.area === a).length;
let md = `# Inventory version 2: what changed from version 1\n\n*DubWeb wave 3, session F, 26 November 2026. Nobody, allegedly. Written by \`changes.mjs\` from \`../inventory/inventory-all.json\` (version 1, unchanged) and \`inventory-all.json\` (version 2). Areas are proposals; nothing is decided.*\n\n`;
md += `**Used is not checked:** the kit checked no rule above the core; a count says the text was applied by hand, not that it works.\n\n`;
md += `## 1. In plain words\n\n`;
md += `1. **Records:** ${v1.length} in version 1, ${v2.length} in version 2 (${v2.length - v1.length} added, ${gone.length} removed). Money ${count(v1, 'Money')} → ${count(v2, 'Money')}, Agreements ${count(v1, 'Agreements')} → ${count(v2, 'Agreements')}, Web ${count(v1, 'Web')} → ${count(v2, 'Web')}. To settle ${v1.filter((r) => r.to_settle).length} → ${v2.filter((r) => r.to_settle).length}.\n`;
md += `2. **${rows.length} records changed** area, category, settled state or marks (section 2), each with the check that asked for it.\n`;
md += `3. **DubLaw's six additions are five texts here.** DubLaw lists Counterparty's plain-words body "in two copies (61bcdb5b… and ee0fd121…)". The copy holds one text act, \`ee0fd121…e681\`; \`61bcdb5b…4528\` is no act in the copy but the fingerprint DubLaw's listing gives as "sha256 of its opening sentences". One record carries both keys. So DubLaw's proposed slice of 51 is ${count(v2, 'Agreements')} records here; the difference is that one text.\n`;
md += `4. **Still to settle:** ${v2.filter((r) => r.to_settle).length} records (section 3), all placed by no Dub in wave 2 and spoken to by neither check. They keep version 1's proposal and both (empty) placements.\n`;
md += `5. **Not applied, and why:** DubPay's twelve "Money texts nobody listed" are candidates it marks as inferred, and the order adds no new text; DubLaw's Stall "pass-on by the receiver (K6)" "stays with Money" and is in neither check's list of texts to add, so it is not added. Both stay in their checks.\n\n`;
md += `## 2. Every record that changed\n\n| Text | Spec hash | Version 1 | Version 2 | Asked by |\n|---|---|---|---|---|\n`;
for (const x of rows) md += `| ${t(x.r)} | \`${cut(x.r.spec_hash)}\` | ${x.from} | ${x.to} | ${x.by} |\n`;
md += `\nWhat each check says, per work (from the record's \`checks_wave_3.says\`):\n\n`;
const seen = new Set(); for (const x of rows) { if (seen.has(x.r.work) || !x.says) continue; seen.add(x.r.work); md += `- **${x.r.work.split(':')[1]}**: ${x.says}\n`; }
md += `\n## 3. Still to settle (unchanged)\n\n| Text | Proposed | Why still open |\n|---|---|---|\n`;
for (const r of same) md += `| ${t(r)} | ${r.area}: ${r.area_category} | ${r.checks_wave_3?.says ?? ''} Wave 2: ${Object.entries(r.to_settle.disagreement).map(([d, p]) => `${d} ${p}`).join('; ')}. |\n`;
md += `\n## 4. Rerun\n\n\`MOR_RESEARCH=~/Documents/mor-round-2/_research node wave3.mjs\`, then \`node changes.mjs\`, both in this folder. inventory-run.json is version 1's, copied unchanged (inventory.mjs reruns to it byte for byte, as \`check-inv/\` showed).\n`;
writeFileSync('changes.md', md);
console.log(`changed ${rows.length}; still to settle ${same.length}; removed ${gone.length}`);
