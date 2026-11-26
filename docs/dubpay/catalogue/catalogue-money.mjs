// DubPay W3-B: the catalogue of Money, by problem.
// Reads (read only): DubPay wave-2 listing B (listing-money.json), wave-3 slice check A (slice-check.json),
// DubWeb's shared inventory (inventory-all.json), the research copy (through listing B's own reader, for the
// act ids cited), and the hand-made part beside this file (catalogue-money-hand.mjs).
// Writes, only beside itself: catalogue-money.md and catalogue-money.json.
// Rerun: node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/B/catalogue-money.mjs
// It signs nothing, posts nothing, pays nothing, and reads no key.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROUND = process.env.MOR_ROUND || join(process.env.HOME, 'Documents/mor-round-2');
const T = join(ROUND, '_team');
const L = JSON.parse(readFileSync(join(T, 'dubpay/wave-2/results/B/listing-money.json'), 'utf8'));
const A = JSON.parse(readFileSync(join(T, 'dubpay/wave-3/results/A/slice-check.json'), 'utf8'));
const INV = JSON.parse(readFileSync(join(T, 'dubweb/wave-3/inventory/inventory-all.json'), 'utf8'));
const H = await import(join(HERE, 'catalogue-money-hand.mjs'));
const D = await import(join(T, 'dubpay/wave-2/results/B/listing-money-data.mjs')); // listing B's reader of _research/

const USED = 'Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.';
const s8 = (x) => (x ? x.slice(0, 8) : '—');
const entry = new Map(L.entries.map((e) => [e.key, e]));

// ---------- 1. every id cited by hand: an act in the research copy, or a media hash ----------
const byPrefix = new Map();
for (const id of D.acts.keys()) { const k = id.slice(0, 8); if (!byPrefix.has(k)) byPrefix.set(k, []); byPrefix.get(k).push(id); }
const media = new Set();
for (const e of L.entries) for (const d of e.drafts) if (d.media) media.add(d.media);
for (const h of D.mediaPosts.keys()) media.add(h);
const resolved = new Map(); // short -> {full, kind} or {missing}
function resolve(short) {
  if (resolved.has(short)) return resolved.get(short);
  let r;
  const acts = (byPrefix.get(short.slice(0, 8)) || []).filter((id) => id.startsWith(short));
  if (acts.length === 1) r = { full: acts[0], kind: 'act' };
  else if (acts.length > 1) r = { ambiguous: acts };
  else { const m = [...media].filter((h) => h.startsWith(short)); r = m.length === 1 ? { full: m[0], kind: 'media' } : { missing: true }; }
  resolved.set(short, r); return r;
}
const expand = (fld) => fld && ({ ...fld, acts: fld.acts.map((a) => ({ cited: a, ...resolve(a) })) });

// ---------- 2. the slice's Money keys, and where each is placed ----------
const keyOfLine = (l) => l.B_key || (l.text.includes('guide spot') ? 'guide-spot' : null);
const moneyKeys = new Map(); // key -> {text, status, prompted:Set}
for (const l of A.lines) {
  if (l.status === 'placed elsewhere in the inventory') continue;
  const k = keyOfLine(l); if (!k) continue;
  const m = moneyKeys.get(k) || { text: l.text, status: new Set(), prompted: new Set() };
  m.status.add(l.status); if (l.prompted) m.prompted.add(l.prompted); moneyKeys.set(k, m);
}
const placed = new Map(); // key -> [problem ids]
for (const p of H.PROBLEMS) {
  for (const s of p.solutions) { placed.set(s.key, [...(placed.get(s.key) || []), p.id]); for (const b of s.built || []) placed.set(b, [...(placed.get(b) || []), p.id]); }
}
const placement = [...moneyKeys].map(([k, m]) => ({ key: k, text: m.text, status: [...m.status].join(' + '), problems: placed.get(k) || [] }));
const placementOk = placement.every((x) => x.problems.length === 1) && [...placed.keys()].every((k) => moneyKeys.has(k));

// ---------- 3. counts per text, from listing B (or the inventory for the guide spot) ----------
const guide = INV.specifications.find((r) => r.spec_hash?.startsWith('824698f3'));
function counts(key) {
  if (key === 'guide-spot') return {
    name: 'cMIP guide spot (Turnstile)', author: s8(guide.creator), window: guide.creator_window_inferred,
    drafts: [`1: ${s8(guide.act)} → ${s8(guide.spec_hash)}`], uses: { acts: guide.use.acts, identities: guide.use.identities, windows: guide.use.windows_inferred.length },
    byOthers: null, builtOn: guide.built_on_by.length, faultActs: guide.fault_candidates.length, kit: 'no Terms names it', days: [], source: 'inventory (by spec hash)',
    answersToItsAct: guide.answers_to_its_act.length,
  };
  const e = entry.get(key);
  const kit = {}; for (const k of e.kit || []) { const w = k.in_force?.word ?? `check ${k.check}`; kit[w] = (kit[w] || 0) + 1; }
  return {
    name: e.name, author: e.author.length ? e.author.map((a) => s8(a.identity)).join(', ') : 'the kit', window: e.author.length ? e.author.map((a) => a.window).join(', ') : 'no window',
    drafts: e.drafts.map((d) => `${d.draft}: ${s8(d.act || d.media)}${d.spec ? ' → ' + s8(d.spec) : ''}`),
    uses: { acts: e.uses.acts, identities: e.uses.identities, windows: e.uses.windowCount },
    byOthers: { acts: e.usesByOthers.acts, identities: e.usesByOthers.identities },
    builtOn: e.builtOnBy.length, faultActs: e.faults.length,
    kit: Object.keys(kit).length ? Object.entries(kit).map(([w, n]) => `${w} ${n}`).join(', ') : 'no Terms names it',
    days: e.uses.days, source: 'listing B',
  };
}
const prompted = (key) => { const m = moneyKeys.get(key); return m ? [...m.prompted].join('; ') || 'not found' : 'not found'; };

// ---------- 4. the records ----------
const records = H.PROBLEMS.map((p) => ({
  id: p.id, problem: p.title, category: p.category,
  solutions: p.solutions.map((s) => ({
    key: s.key, task: s.task, counts: counts(s.key), countsMark: 'counted', caveat: USED,
    promptedInSlice: prompted(s.key), promptedRead: s.prompted,
    holdsAndDecides: expand(s.holds), remainderFailedShare: expand(s.remainder), memberWhoStops: expand(s.stops),
    wayOut: expand(s.wayOut), provesAndWord: expand(s.proves), faults: expand(s.faults),
    builtOnIt: (s.built || []).map((b) => ({ key: b, counts: counts(b), promptedInSlice: prompted(b), note: expand(p.builtNotes[b]) })),
  })),
  candidates: (p.candidates || []).map(expand),
  pointers: p.pointers.map(expand),
  agree: expand(p.agree), differ: expand(p.differ),
  lean: { ...p.lean, by: "DubPay's (proposed)", acts: p.lean.acts.map((a) => ({ cited: a, ...resolve(a) })) },
  namedSignersAndBuyerByAssent: p.rule3.turns ? { turns: true, text: p.rule3.text, ifDefault: p.rule3.ifDefault, ifNot: p.rule3.ifNot, acts: p.rule3.acts.map((a) => ({ cited: a, ...resolve(a) })) } : { turns: false },
}));
const seams = H.SEAMS.map((x) => ({ ...x, acts: x.acts.map((a) => ({ cited: a, ...resolve(a) })) }));
const morLead = H.MOR_LEAD.map(expand);
const missing = [...resolved].filter(([, r]) => !r.full).map(([k, r]) => ({ cited: k, ...r }));

// Tallies (counted).
const tally = {
  problems: records.length,
  solutions: records.reduce((n, r) => n + r.solutions.length, 0),
  builtOn: records.reduce((n, r) => n + r.solutions.reduce((m, s) => m + s.builtOnIt.length, 0), 0),
  moneyKeysInSlice: moneyKeys.size, placedOnce: placement.filter((x) => x.problems.length === 1).length,
  leans: Object.fromEntries(['keep one', 'merge two', 'gap still open'].map((k) => [k, records.filter((r) => r.lean.kind === k).length])),
  turnOnRule3: records.filter((r) => r.namedSignersAndBuyerByAssent.turns).length,
  idsCited: resolved.size, idsActs: [...resolved.values()].filter((r) => r.kind === 'act').length,
  idsMedia: [...resolved.values()].filter((r) => r.kind === 'media').length, idsNotFound: missing.length,
  seams: seams.length,
};

// ---------- 5. markdown ----------
const cite = (fld) => (fld.acts.length ? ` (${fld.acts.map((a) => s8(a.full || a.cited)).join(', ')})` : '') + ` *${fld.mark}*`;
const md = [];
const P = (...x) => md.push(...x);
P('# The catalogue of Money, by problem (DubPay W3-B)', '',
  `*DubPay wave 3, session B, ${new Date().toISOString().slice(0, 10)}. Nobody, allegedly. Made by \`catalogue-money.mjs\` (beside this file; rerun: \`node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/B/catalogue-money.mjs\`) from listing B, slice check A, the shared inventory and the hand-made \`catalogue-money-hand.mjs\`. Marks: **counted** (the script counted it), **traced** (an act's words show it), **inferred** (our reading). Every lean is **DubPay's (proposed)**; nothing here is decided, fixed or built. Ids are cut to 8 characters; \`catalogue-money.json\` holds them whole.*`, '',
  `> ${USED} "Prompted" marks what the hosts' prompts asked for: notice 7 (apps), notice 8 (attack the shower, with bounties; it named the straight split draft 4), the contest's remainder rule, and the day-five prompts ("something MOR has not been used for", "what the language could not say"). The players are machines: where a prompt asked for a pattern, the pattern is the prompt's.`, '');

// 1. plain words
P('## 1. In plain words', '', `${tally.problems} problems (counted). Each Money text of A's slice sits under exactly one (${tally.placedOnce} of ${tally.moneyKeysInSlice}, counted).`, '');
for (const r of records) P(`- **${r.id}.** ${r.problem}. *Lean: ${r.lean.kind}.*`);
P('', "**DubPay's three most important leans (proposed):**", '');
H.TOP.forEach((id, i) => { const r = records.find((x) => x.id === id); P(`${i + 1}. **${r.id}, ${r.lean.kind}.** ${r.lean.text}${r.namedSignersAndBuyerByAssent.turns ? ' *Turns on named signers and buyer by assent: see its two outcomes.*' : ''}`); });
P('', `Leans: keep one ${tally.leans['keep one']}, merge two ${tally.leans['merge two']}, gap still open ${tally.leans['gap still open']}; ${tally.turnOnRule3} turn on whether named signers and buyer by assent become the grammar's defaults (counted).`, '');

// 2. problem by problem
P('## 2. Problem by problem', '');
for (const r of records) {
  P(`### ${r.id}. ${r.problem}`, '', `*Category: ${r.category}.*`, '');
  if (r.solutions.length) {
    P(`> ${USED}`, '', '| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const s of r.solutions) {
      const c = s.counts;
      P(`| ${c.name} | ${c.author} (${c.window}) | ${c.drafts.join('; ')} | ${s.task} | ${c.uses.acts}, ${c.uses.identities}, ${c.uses.windows} | ${c.byOthers ? `${c.byOthers.acts} acts, ${c.byOthers.identities} ids` : '—'} | ${c.builtOn} | ${c.faultActs} | ${c.kit} | ${s.promptedInSlice} |`);
    }
    P('', '*Counts: counted, from ' + [...new Set(r.solutions.map((s) => s.counts.source))].join(' and ') + '.*', '');
    for (const s of r.solutions) {
      P(`**${s.counts.name}**`, '',
        `- Who holds money, who decides a release: ${s.holdsAndDecides.text}${cite(s.holdsAndDecides)}`,
        `- A remainder, a failed share: ${s.remainderFailedShare.text}${cite(s.remainderFailedShare)}`,
        `- A member who stops: ${s.memberWhoStops.text}${cite(s.memberWhoStops)}`,
        `- The way out if its service closes: ${s.wayOut.text}${cite(s.wayOut)}`,
        `- What it proves, and what is only someone's word: ${s.provesAndWord.text}${cite(s.provesAndWord)}`,
        `- Faults found, by whom, fixed or not: ${s.faults.text}${cite(s.faults)}`,
        `- Prompted, read: ${s.promptedRead}`);
      for (const b of s.builtOnIt) P(`- Built on it: **${b.counts.name}** (${b.counts.author}, ${b.counts.window}; uses ${b.counts.uses.acts} acts by ${b.counts.uses.identities} identities, counted; used ≠ checked; prompted: ${b.promptedInSlice}). ${b.note.text}${cite(b.note)}`);
      P('');
    }
  } else P('No Money text of the slice answers it (counted).', '');
  for (const c of r.candidates) P(`- Candidate: ${c.text}${cite(c)}`);
  for (const x of r.pointers) P(`- Pointer: ${x.text}${cite(x)}`);
  if (r.candidates.length || r.pointers.length) P('');
  P(`- **They agree on:** ${r.agree.text}${r.agree.acts.length ? cite(r.agree) : ''}`,
    `- **They differ, and why it matters:** ${r.differ.text}${r.differ.acts.length ? cite(r.differ) : ''}`,
    `- **Lean, DubPay's (proposed): ${r.lean.kind}.** ${r.lean.text} Rests on ${r.lean.acts.map((a) => s8(a.full || a.cited)).join(', ')}.`);
  const q = r.namedSignersAndBuyerByAssent;
  if (q.turns) P(`- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). ${q.text} *Outcome 1:* ${q.ifDefault} *Outcome 2:* ${q.ifNot} (${q.acts.map((a) => s8(a.full || a.cited)).join(', ')})`);
  P('');
}

// 3. MOR lead
P('## 3. For the MOR lead: what the language could not say, in Money\'s area', '',
  `*Adds to listing B's section (${L.forTheMorLead.length} items there, not repeated). Its section's shape is a day-five prompt's ("what the language could not say", in 19 acts, counted by B). Nothing here is decided.*`, '');
for (const x of morLead) P(`- ${x.text}${cite(x)}`);
P('', '- And the core question the order names: whether named signers and buyer by assent become the grammar\'s defaults. In Money\'s area it decides the in-force reading of every deal, pot, tab, circle and listing above; the groupings that turn on it are marked, each with its two outcomes.', '');

// 4. seams
P('## 4. Seam problems', '', '*Each sits on another Dub\'s area. Settled by seam act before filing; not settled here.*', '', '| Problem | Other Dub | What sits on their area | Acts |', '|---|---|---|---|');
for (const x of seams) P(`| ${x.problem} | ${x.with} | ${x.what} | ${x.acts.map((a) => s8(a.full || a.cited)).join(', ')} |`);
P('');

// 5. limits
P('## 5. Limits', '');
for (const x of H.LIMITS) P(`- ${x}`);
P(`- Recovery by vouching: the last report's rule D (M13) and the "taken identity" item (section 3) rest on the one case of an identity others spoke for, where thief, victim and vouchers were one window. Not catalogued as tried. No Money solution was tried with a recovered identity: every line, claim and confirmation assumes the same key throughout.`,
  `- Cited ids: ${tally.idsCited}, of which ${tally.idsActs} are acts held in the research copy and ${tally.idsMedia} media hashes; ${tally.idsNotFound} not found${missing.length ? ': ' + missing.map((m) => m.cited).join(', ') : ''} (counted).`,
  `- Placement check: ${placementOk ? 'every' : 'NOT every'} Money key of slice A is under exactly one problem (${tally.placedOnce} of ${tally.moneyKeysInSlice}, counted).`, '');

const out = {
  made: 'DubPay W3-B, the catalogue of Money by problem. Counts computed by catalogue-money.mjs; problems, fields and leans hand-made in catalogue-money-hand.mjs. Every lean is DubPay\'s (proposed).',
  author: 'Nobody, allegedly', caveat: USED,
  rules: {
    usedIsNotChecked: USED,
    vouching: 'Recovery by vouching was not tested; no Money solution here is catalogued as tried with it.',
    namedSignersAndBuyerByAssent: 'Groupings that turn on it carry namedSignersAndBuyerByAssent.turns = true, with both outcomes.',
  },
  sources: { listingB: 'dubpay/wave-2/results/B/listing-money.json', sliceA: 'dubpay/wave-3/results/A/slice-check.json', inventory: 'dubweb/wave-3/inventory/inventory-all.json', actsRead: D.acts.size },
  tally, placement, placementOk, problems: records, seams, morLead, top: H.TOP, missing,
};
writeFileSync(join(HERE, 'catalogue-money.json'), JSON.stringify(out, null, 1) + '\n');
writeFileSync(join(HERE, 'catalogue-money.md'), md.join('\n'));
console.log(JSON.stringify(tally));
if (!placementOk) console.log('placement:', placement.filter((x) => x.problems.length !== 1));
if (missing.length) console.log('missing:', missing);
