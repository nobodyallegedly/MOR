// DubWeb wave 3, session C: the catalogue by problem. Author: Nobody, allegedly.
// VERSION 2 (session F, 26 November 2026): reads inventory-v2/; renders pointers to DubLaw's catalogue, seams, and leans marked "changed".
//
// This script computes every count in catalogue-web.md and catalogue-web.json, and writes both files.
// The groupings, comparisons and leans are hand-written in catalogue-input.mjs; nothing in them is a count.
//
//   node catalogue.mjs [--research DIR]      (run from this folder; kit/ beside it gives the core cross-check)
//
// What it does:
//   1. reads the research copy (read.mjs): public acts only; sealed containers and private acts stay closed;
//   2. for every solution, counts use three ways, kept apart: by spec hash, by act id, by name;
//   3. resolves every act cited in the input ([a:PREFIX]) to one public act in the copy, or says it could not;
//   4. reads the hosts' prompts: notices 7 and 8, the day-five briefs, and which day-5-window-1 reports quote the prompt;
//   5. reads the shared inventory and the merged features if they are there, and says what state they were in;
//   6. writes catalogue-web.json and catalogue-web.md. Two runs over the same inputs give the same files.
//
// It signs nothing, sends nothing, opens no key file and makes no network call.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { acts, named, stats, textOf, wordsOf, specHash, specContent, specOfText, traysOf, mainTray, RESEARCH, here, TEXT_MIR, AGREEMENTS, hx, sha } from './read.mjs';
import { categories, problems, solutions, plain, threeLeans, morLead, appFaults, limits, notReadInTheAct, changedFromV1 } from './catalogue-input.mjs';

const CAVEAT = 'Used is not checked: the kit checked no rule above the core, money rules included. A count says a text was applied by hand, not that it works.';
const short = (h) => h.slice(0, 8) + '…' + h.slice(-4);
const uniq = (a) => [...new Set(a)];
const sorted = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => (a[0] < b[0] ? -1 : 1)));

// ------------------------------------------------------------------ citations: [a:PREFIX] -> one public act in the copy
const ids = [...acts.keys()].sort();
const cited = new Map(); // prefix -> { id | null, why }
function resolveAct(prefix) {
  if (cited.has(prefix)) return cited.get(prefix);
  const hit = ids.filter((i) => i.startsWith(prefix));
  const r = hit.length === 1 ? { id: hit[0] } : { id: null, why: hit.length ? `${hit.length} acts begin so` : 'no public act in the copy begins so' };
  cited.set(prefix, r); return r;
}
const CITE = /\[a:([0-9a-f]{8,64})\]/g;
const citeList = (s) => uniq([...String(s ?? '').matchAll(CITE)].map((m) => m[1]));
const render = (s) => String(s ?? '').replace(CITE, (_, p) => { const r = resolveAct(p); return r.id ? '`' + short(r.id) + '`' : '`' + p + '` (NOT FOUND in the copy)'; });
const fullIds = (s) => citeList(s).map((p) => resolveAct(p).id ?? `${p} (not found)`);

// ------------------------------------------------------------------ use, three ways
const firstLine = (t) => (t ?? '').split('\n')[0].slice(0, 110);
function usersOf(hashes, exclude) {
  const out = new Map(); // act id -> Set(ways)
  for (const h of hashes) for (const [id, way] of named.get(h) ?? []) { if (exclude.has(id)) continue; if (!out.has(id)) out.set(id, new Set()); out.get(id).add(way); }
  return out;
}
function summarize(actIds, creators) {
  const signers = uniq(actIds.map((i) => acts.get(i).d.signer));
  const others = signers.filter((s) => !creators.has(s));
  const trays = {}; for (const s of others) { const t = mainTray(s) ?? 'unmapped'; trays[t] = (trays[t] ?? 0) + 1; }
  return { acts: actIds.length, signers: signers.length, signers_other_than_the_authors: others.length, acts_by_others: actIds.filter((i) => !creators.has(acts.get(i).d.signer)).length, trays_of_the_other_signers: sorted(trays) };
}
function countSolution(key, s) {
  const texts = (s.texts ?? []).map((t) => {
    const r = resolveAct(t.act); if (!r.id) return { label: t.label, act: `${t.act} (not found)`, missing: true };
    const d = acts.get(r.id).d; const text = textOf(d);
    return { label: t.label, act: r.id, signer: d.signer, title: firstLine(text ?? wordsOf(d)), bytes: text ? Buffer.byteLength(text) : null,
      spec_hash: text != null && !s.no_spec ? specHash(text, d.signer, 0) : null, homes: Object.keys(acts.get(r.id).seen).sort(), note: t.note ?? null };
  });
  const own = new Set(texts.filter((t) => !t.missing).map((t) => t.act));
  const creators = new Set([...texts.filter((t) => !t.missing).map((t) => t.signer), ...(s.authors ?? []).map((p) => ids.find((i) => i.startsWith(p)) ?? p)]);
  for (const p of s.authors ?? []) { const full = [...traysOf.keys()].find((k) => k.startsWith(p)); if (full) creators.add(full); }
  const specHashes = uniq([...texts.map((t) => t.spec_hash).filter(Boolean), ...(s.extra_spec_hashes ?? []).map((e) => e.hash)]);
  // by spec hash
  const bySpec = usersOf(specHashes, own);
  const ways = {}; const under = {};
  for (const [id, w] of bySpec) { for (const x of w) ways[x] = (ways[x] ?? 0) + 1; if (w.has('spec')) { const k = 'type ' + acts.get(id).d.type; under[k] = (under[k] ?? 0) + 1; } }
  const binding = [...bySpec].filter(([, w]) => w.has('spec') || w.has('socket') || w.has('bytes') || w.has('refs')).map(([id]) => id);
  // by act id: the text acts, and any other act that carries the solution (its Terms, its announcement)
  const also = (s.also_acts ?? []).map((p) => resolveAct(p).id).filter(Boolean);
  const targets = new Set([...own, ...also]);
  const byAct = usersOf([...targets], targets);
  // by name
  const nameRe = s.name_re ? new RegExp(s.name_re, 'i') : null;
  const lineRe = s.line_re ? new RegExp(s.line_re) : null; // tested against the start of an act's words: the act is the line
  const byName = []; const byLine = [];
  for (const [id, x] of acts) { if (own.has(id)) continue; const w = wordsOf(x.d); if (nameRe && nameRe.test(w)) byName.push(id); if (lineRe && lineRe.test(w)) byLine.push(id); }
  const nameOnly = byName.filter((i) => !bySpec.has(i) && !byAct.has(i));
  // short forms (kept apart, never counted as use)
  const shortRe = specHashes.concat([...own]).map((h) => h.slice(0, 8)); const shortOnly = [];
  if (shortRe.length) { const re = new RegExp('\\b(' + shortRe.join('|') + ')(?![0-9a-f])'); for (const [id, x] of acts) { if (own.has(id) || bySpec.has(id) || byAct.has(id)) continue; if (re.test(wordsOf(x.d))) shortOnly.push(id); } }
  // built on by: other signers' specification-like texts that name it (hash, act id or short form)
  const builtOn = [];
  for (const id of uniq([...bySpec.keys(), ...byAct.keys(), ...shortOnly])) {
    const d = acts.get(id).d; const t = textOf(d); if (t == null || creators.has(d.signer)) continue;
    const fl = firstLine(t); if (t.length < 1200 || !(/^#/.test(fl) || /\b(draft|version) \d/i.test(fl))) continue;
    builtOn.push({ act: id, signer: d.signer, tray: mainTray(d.signer), title: fl.slice(0, 90) });
  }
  builtOn.sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : a.act < b.act ? -1 : 1));
  const actors = Object.fromEntries(Object.entries(s.actors ?? {}).map(([role, p]) => { const full = [...traysOf.keys()].find((k) => k.startsWith(p)) ?? ids.find((i) => i.startsWith(p)) ?? p; return [role, { identity: full, trays: sorted(traysOf.get(full) ?? {}) }]; }));
  return {
    key, name: s.name, by: s.by, category: s.category ?? null, main_problem: s.problem, pointer_to: s.pointer_to ?? null, texts,
    spec_hashes: specHashes.map((h) => ({ hash: h, note: (s.extra_spec_hashes ?? []).find((e) => e.hash === h)?.note ?? null })),
    other_acts_that_carry_it: also,
    apps: (s.apps ?? []).map(render),
    use: {
      caveat: CAVEAT,
      by_spec_hash: { ...summarize([...bySpec.keys()], creators), by_way: sorted(ways), acts_written_under_it: sorted(under), signers_of_the_acts_written_under_it: uniq([...bySpec].filter(([, w]) => w.has('spec')).map(([id]) => acts.get(id).d.signer)).length, acts_naming_it_where_the_core_reads: binding.length,
        note: specHashes.length ? null : 'no spec hash: its words are Terms or its texts are not in the copy' },
      by_act_id: summarize([...byAct.keys()], creators),
      by_name: nameRe ? { pattern: s.name_re, ...summarize(byName, creators), acts_naming_it_by_name_only: nameOnly.length, signers_by_name_only: uniq(nameOnly.map((i) => acts.get(i).d.signer)).length } : null,
      by_its_line_form: lineRe ? { pattern: s.line_re, ...summarize(byLine, creators) } : null,
      short_form_only_acts_not_counted_as_use: shortOnly.length,
    },
    built_on_by: builtOn,
    built_on_note: s.built_on_note ? render(s.built_on_note) : null,
    faults: (s.faults ?? []).map((f) => ({ what: render(f.what), found_by: render(f.found_by), acts: fullIds(f.what + ' ' + f.fixed + ' ' + f.found_by), fixed: render(f.fixed) })),
    kit: render(s.kit), kit_in_a_word: /^Partly/.test(s.kit) ? 'partly' : /^(Not a rule|An app|A text|It )/.test(s.kit) ? 'not a rule' : /^The (core|kit|records)/.test(s.kit) ? 'core only' : 'by hand', prompted: { ...s.prompted, why: render(s.prompted?.why) }, tested: s.tested ? render(s.tested) : null,
    actors_and_the_trays_that_carried_them: Object.keys(actors).length ? actors : null,
    notes: s.notes ? render(s.notes) : null, acts_cited: uniq([s.notes, s.tested, s.built_on_note, s.prompted?.why, ...(s.faults ?? []).map((f) => f.what)].flatMap(fullIds)),
  };
}
const S = {}; for (const [k, s] of Object.entries(solutions)) S[k] = countSolution(k, s);

// ------------------------------------------------------------------ the hosts' prompts
const hostsDir = join(RESEARCH, 'hosts'); const winDir = join(RESEARCH, 'windows');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const quoteRe = /something MOR ha[ds] not been used for[^.*\n]*/i;
const quoting = []; const notQuoting = []; const briefs = {};
for (const w of readdirSync(winDir).sort()) {
  const rep = read(join(winDir, w, 'reports', 'day-5-window-1.md'));
  if (rep != null) { const m = rep.match(quoteRe) ?? rep.match(/brief to build something MOR ha[ds] not been used for/i); if (m) quoting.push({ window: w, words: m[0].slice(0, 120) }); else notQuoting.push(w); }
  const b = read(join(winDir, w, 'from-the-hosts', 'brief-day-five.md'));
  if (b != null) { const title = b.split('\n')[0].replace(/^# /, ''); const ask = (b.split('\n').find((l, i) => i > 2 && l.trim() && !l.startsWith('*')) ?? '').slice(0, 160); (briefs[title] ??= { asks: ask, sha256: hx(sha(Buffer.from(b))), windows: [] }).windows.push(w); }
}
const prompts = {
  notice_7: { file: 'hosts/notice-7.md', present: read(join(hostsDir, 'notice-7.md')) != null, asks: 'any team may build an app and offer it on MOR, with its hash and size; "Read it before you run it"; announces Dub and Damgar' },
  notice_8: { file: 'hosts/notice-8.md', present: read(join(hostsDir, 'notice-8.md')) != null, asks: 'every window is invited to attack the shower (shower work draft 5, public flow draft 3, straight split draft 4), with bounties' },
  notice_8_names_public_flow_draft_3: (read(join(hostsDir, 'notice-8.md')) ?? '').includes('479417d9ec8d53cc949ab76db460733da0c41f6414de9fb4acd45e79fcb44384'),
  contest_rules_ask_for_public_flow: ['cmip-lineup-vote-draft-3.md', 'cmip-lineup-vote-draft-4.md', 'rerun-how-to-enter.md'].filter((f) => /public flow/i.test(read(join(hostsDir, 'contest', f)) ?? '')),
  day_five_prompt: { as_quoted: 'build "something MOR has not been used for" (this round)', day_5_window_1_reports_quoting_it: quoting, day_5_window_1_reports_not_quoting_it: notQuoting,
    note: 'The day-five prompt was given in the hosts\' conversation and is not a file in the copy; the reports above quote or paraphrase it.' },
  day_five_briefs_in_from_the_hosts: briefs,
  the_line_on_time: { hosts_log_says: /dual anchoring/i.test(read(join(RESEARCH, 'hosts-log.md')) ?? ''), note: 'hosts-log.md, day five 09:41 to 09:48: a line on time (two independent references, "dual anchoring") went into the window-two prompt. Texts of day five, window two, that rest time on two references follow a prompt.' },
};

// ------------------------------------------------------------------ the shared inventory and the merged features, as they stood at this run
const invPath = resolve(here, '..', 'inventory-v2', 'inventory-all.json'); const webMd = resolve(here, '..', 'inventory-v2', 'web.md');
const featPath = resolve(here, '..', 'features', 'features-all.json');
const inputs = { inventory_all_json: existsSync(invPath), web_md: existsSync(webMd), features_all_json: existsSync(featPath), records: 0, records_with_an_area: 0, web_records: 0, web_records_to_settle: 0,
  inventory_version: 'version 2 (inventory-v2/)', checked_by_dubpay_and_dublaw: 'applied in inventory-v2/: DubPay\'s _team/dubpay/wave-3/results/A/slice-check.md and DubLaw\'s _team/dublaw/wave-3/slice-check.md, with DubWeb\'s answer of 26 November; every record that moved is in inventory-v2/changes.md',
  texts_here_found_in_the_inventory: 0, solutions_with_a_text_to_settle: [], solutions_the_inventory_proposes_for_another_area: [], carriers_here_that_are_not_inventory_records: [], web_records_not_catalogued: [] };
if (inputs.inventory_all_json) {
  const inv = JSON.parse(readFileSync(invPath, 'utf8'));
  const recs = inv.specifications ?? [];
  const byAct = new Map(recs.filter((r) => r.act).map((r) => [r.act, r])); const byHash = new Map(recs.filter((r) => r.spec_hash).map((r) => [r.spec_hash, r]));
  const isWeb = (r) => /web/i.test(r.area ?? '');
  inputs.records = recs.length; inputs.records_with_an_area = recs.filter((r) => r.area != null).length;
  inputs.web_records = recs.filter(isWeb).length; inputs.web_records_to_settle = recs.filter((r) => isWeb(r) && r.to_settle).length;
  const seen = new Set();
  for (const s of Object.values(S)) {
    const found = [];
    for (const t of s.texts) { if (t.missing) continue; const r = byAct.get(t.act); if (!r) { inputs.carriers_here_that_are_not_inventory_records.push({ solution: s.key, label: t.label, act: t.act }); t.inventory = null; continue; }
      seen.add(r); found.push(r); inputs.texts_here_found_in_the_inventory++;
      t.inventory = { area: r.area, category: r.area_category ?? null, to_settle: r.to_settle ? (r.to_settle.why ?? []).join('; ') : null, placements_wave_2: r.to_settle?.disagreement ?? null, added_by_hand: r.added_by_hand ? true : false, prompted: r.prompted ?? null, prompted_basis: r.prompted_basis ?? null }; }
    for (const h of s.spec_hashes) { const r = byHash.get(h.hash); if (r && !seen.has(r)) { seen.add(r); found.push(r); } }
    const tre = solutions[s.key].inventory_title_re; if (tre) for (const r of recs) if (new RegExp(tre, 'i').test(r.title ?? '') && !seen.has(r)) { seen.add(r); found.push(r); }
    const settle = uniq(found.filter((r) => r.to_settle).flatMap((r) => r.to_settle.why ?? ['to settle']));
    const place = found.find((r) => r.to_settle?.disagreement)?.to_settle.disagreement ?? null;
    s.inventory = found.length ? { records: found.length, areas: uniq(found.map((r) => r.area)), categories: uniq(found.map((r) => r.area_category).filter(Boolean)), to_settle: settle.length ? settle : null, wave_2_placements: settle.length ? place : null,
      added_by_hand: found.some((r) => r.added_by_hand), prompted_marks: uniq(found.map((r) => r.prompted).filter(Boolean)), prompted_basis: uniq(found.map((r) => r.prompted_basis).filter(Boolean)) } : null;
    if (settle.length) inputs.solutions_with_a_text_to_settle.push(s.key);
    if (found.length && !found.some(isWeb)) inputs.solutions_the_inventory_proposes_for_another_area.push({ solution: s.key, area: uniq(found.map((r) => r.area)).join(', ') });
  }
  for (const r of recs) if (isWeb(r) && !seen.has(r)) inputs.web_records_not_catalogued.push({ title: r.title, act: r.act || null });
} else for (const s of Object.values(S)) s.inventory = null;
const featById = new Map();
if (inputs.features_all_json) { const fj = JSON.parse(readFileSync(featPath, 'utf8')); for (const f of fj.features ?? []) featById.set(f.id, f); inputs.features = featById.size; inputs.features_to_settle = [...featById.values()].filter((f) => f.to_settle).length; }
for (const [k, s] of Object.entries(S)) {
  s.features = (solutions[k].features ?? []).map((id) => { const f = featById.get(id); if (!f) return { id, missing: true };
    return { id, feature: f.feature, apps: (f.apps ?? []).map((a) => ({ app: a.app, versions: (a.versions ?? []).length, authors: uniq((a.versions ?? []).map((v) => v.author)), code: uniq((a.versions ?? []).map((v) => v.code)) })),
      found_by: f.dubs_found ?? [], proposed: (f.proposals ?? []).map((p) => ({ dub: p.dub, apps: p.apps })), to_settle: !!f.to_settle, acts_showing_use_by_others_as_the_scans_cite_them: (f.use ?? []).length }; });
}

// ------------------------------------------------------------------ problems
const P = problems.map((p) => {
  for (const k of [...p.solutions, ...(p.pointers ?? []).map((x) => x.solution)]) if (!S[k]) throw new Error(`problem ${p.id}: no solution ${k}`);
  const prose = [p.agree, p.differ, p.why, ...(p.shows ?? []), p.lean.text, p.defaults?.with, p.defaults?.without].join(' ');
  return { id: p.id, category: p.category, problem: p.problem, needed: p.needed, solutions: p.solutions, pointers_from_other_problems: p.pointers ?? [],
    they_agree_on: render(p.agree), they_differ_on: render(p.differ), why_it_matters: render(p.why), in_the_round: (p.shows ?? []).map(render),
    lean: { whose: 'DubWeb\'s proposal, for Nobody, allegedly, to decide', kind: p.lean.kind, text: render(p.lean.text), changed_from_version_1: p.lean.changed ? render(p.lean.changed) : null },
    seam_with_dublaw: p.solutions.some((k) => solutions[k].pointer_to) ? p.solutions.filter((k) => solutions[k].pointer_to).map((k) => ({ solution: k, ...solutions[k].pointer_to })) : null,
    turns_on_named_signers_or_buyer_by_assent: p.defaults ? { with_them_as_the_grammars_defaults: render(p.defaults.with), without: render(p.defaults.without) } : null,
    who_carried_whom: p.actors ? Object.fromEntries(Object.entries(p.actors).map(([role, pre]) => { const full = [...traysOf.keys()].find((k) => k.startsWith(pre)) ?? pre; return [role, { identity: full, trays: sorted(traysOf.get(full) ?? {}) }]; })) : null,
    acts_cited: fullIds(prose) };
});
for (const k of Object.keys(S)) if (!problems.some((p) => p.solutions.includes(k))) throw new Error(`solution ${k} sits under no problem`);
for (const k of Object.keys(S)) if (problems.filter((p) => p.solutions.includes(k)).length > 1) throw new Error(`solution ${k} sits under two problems`);

// resolve the remaining prose (so every citation is checked before writing)
const TEXTLESS = [
  ['7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854', 'the report block, proposal 4; its text is the hosts\' 01-where-to-read.md'],
  ['53b1b4bec1782cebf8c90d89c3a9b6008e13767e2a996dd6ce94c8bf7c96da77', 'Postmark\'s place, stand-in for draft 4'],
  ['bc39bda624dc778aaccfbd9f038d456a2fdb7e4cb84fed57e24895206492b7c0', 'Postmark\'s place, stand-in for draft 3'],
  ['e8891459b8b33b05b93beb800022d7ced6e2ca0d3a7a87149a5c922bc8190efc', 'Postmark\'s place, its records specification, draft 1'],
];
const textless = TEXTLESS.map(([hash, what]) => { const under = [...acts.values()].filter((x) => x.d.spec === hash); let standIn = null; for (let n = 1; n <= 9 && !standIn; n++) { const str = `POSTMARK PLACE, draft ${n}, test value until uploaded`; if (hx(sha(Buffer.from(str))) === hash) standIn = str; }
  return { hash, what, acts: under.length, signers: uniq(under.map((x) => x.d.signer)).length, a_text_in_the_copy_hashes_to_it: [...specOfText.values()].includes(hash), stand_in_of: standIn }; });
const R = { S, P, prompts, inputs, stats, textless, acts_public_distinct: acts.size };
const changedR = changedFromV1.map(render);
const plainR = plain(R).map(render); const leansR = threeLeans.map(render); const morR = morLead.map((m) => ({ title: m.title, text: render(m.text), acts_cited: fullIds(m.text) }));
const faultsR = appFaults.map((f) => ({ app: f.app, fault: render(f.fault), found_by: f.found_by, acts: fullIds(f.fault), state: render(f.state) }));
const notRead = new Set(notReadInTheAct); const citedNotRead = [...cited].filter(([p, r]) => r.id && notRead.has(p.slice(0, 8))).map(([, r]) => r.id).sort();
R.citations = { cited: cited.size, resolved: [...cited.values()].filter((r) => r.id).length, cited_as_another_source_cites_them: citedNotRead.length, read_in_the_act: [...cited.values()].filter((r) => r.id).length - citedNotRead.length };
const limitsR = limits(R).map(render);
const notFound = [...cited].filter(([, r]) => !r.id).map(([p, r]) => ({ prefix: p, why: r.why }));

// ------------------------------------------------------------------ the kit's cross-check
const decoder = { own: 'read.mjs (CBOR, XChaCha20-Poly1305, tagged hashes; the decoder of DubWeb\'s wave-2 inventory.mjs)', kit: null };
const kitCore = resolve(here, 'kit', 'lib', 'core.mjs');
if (existsSync(kitCore)) {
  try {
    const { mor } = await import(kitCore);
    let n = 0, agree = 0, hashes = 0, hashesAgree = 0;
    for (const p of cited.keys()) { const r = cited.get(p); if (!r.id) continue; n++; try { if (mor.describeAct(Buffer.from(acts.get(r.id).bytes)).id === r.id) agree++; } catch { } }
    for (const s of Object.values(S)) for (const t of s.texts) { if (!t.spec_hash) continue; hashes++; try { if (mor.decodeSpec(Uint8Array.from(specContent(textOf(acts.get(t.act).d), t.signer, 0))).hash === t.spec_hash) hashesAgree++; } catch { } }
    decoder.kit = { core: 'kit/lib/core.mjs', cited_acts_checked: n, cited_act_ids_agreeing: agree, spec_hashes: hashes, spec_hashes_agreeing: hashesAgree };
  } catch (e) { decoder.kit = { error: String(e?.message ?? e) }; }
}

// ------------------------------------------------------------------ write the JSON
const json = {
  about: 'DubWeb wave 3, session C: DubWeb\'s catalogue by problem. Counts come from catalogue.mjs; groupings, comparisons and leans are hand-written in catalogue-input.mjs. Leans are DubWeb\'s proposals; nothing is decided.',
  author: 'Nobody, allegedly',
  rules_of_this_wave: {
    a: CAVEAT + ' A pattern the hosts asked for is marked prompted, not chosen.',
    b: 'Recovery by vouching was not tested. It is catalogued as written and untested.',
    c: 'Named signers and buyer by assent: where a grouping turns on whether they become the grammar\'s defaults, both outcomes are given.',
  },
  read: { research: '_research (feeds of every home, postmark-place records, dubsar before closure; the postman\'s log for trays)', public_acts_distinct: acts.size, ...stats },
  decoder, inputs_as_they_stood_at_this_run: inputs, hosts_prompts: prompts, spec_hashes_in_use_with_no_text_in_the_copy: textless,
  citations: { acts_cited: cited.size, resolved_to_one_public_act: cited.size - notFound.length, not_found: notFound, read_in_the_act_by_this_session: R.citations.read_in_the_act, cited_but_not_read_in_the_act: citedNotRead },
  categories, problems: P, solutions: Object.values(S),
  version: { this: 2, session: 'F', date: '26 November 2026', version_1: '_team/dubweb/wave-3/catalogue/ (session C, 22 November 2026), unchanged', corrections: 'corrections.md', found_while_correcting: 'found-while-correcting.md' },
  what_changed_from_version_1: changedR,
  in_plain_words: plainR, three_leans: leansR, for_the_mor_lead: morR, faults_in_dubwebs_apps: faultsR, limits: limitsR,
};
writeFileSync(join(here, 'catalogue-web.json'), JSON.stringify(json, null, 1) + '\n');

// ------------------------------------------------------------------ write the Markdown
const WAY = { spec: 'written under it', socket: 'in a socket of an Agreements act', bytes: 'as bytes in another act', refs: 'in refs', words: 'in words only the reader sees' };
const n3 = (u) => (u ? `${u.acts} (${u.signers_other_than_the_authors})` : '–');
const L = [];
L.push('# DubWeb\'s catalogue by problem', '',
  '*DubWeb, of the Dubsar Suite, wave 3. Version 2 (session F, 26 November 2026), beside version 1 (session C, 22 November 2026, in `../catalogue/`, unchanged). Author: Nobody, allegedly. Findings and problems only. Every finding of the three rereads was checked in the full copy and applied or not: `corrections.md`. Every count comes from `catalogue.mjs`, run over `_research/`; the same numbers are in `catalogue-web.json`. The groupings and comparisons are this session\'s reading. Each lean is DubWeb\'s proposal, for Nobody, allegedly, to decide. Nothing here is decided.*', '',
  'The wishes this serves (Nobody, allegedly): "Current wish: extract data, knowledge and understanding from the simulation run"; "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications."; "Dubsar will focus on the cMIPs and modules developed during the simulation, split in categories, grouping competing solutions for the same problem."', '');
L.push('## What changed from version 1', '', ...changedR.map((x) => '- ' + x), '');
L.push('## 1. In plain words', '', ...plainR.map((x) => '- ' + x), '');
L.push('## 2. The problems', '',
  `**How to read the tables.** "Uses" are counted three ways and kept apart: acts naming the solution's **spec hash**, acts naming its **text act id**, and acts naming it **by name** in their words. Each cell is \`acts (signers other than the authors)\`. The solution's own texts are never counted. **${CAVEAT}** "Kit" says whether the hosts' kit could check the rule: for everything above the core it could not. "Prompted" says whether the hosts asked for the pattern (notice 7, notice 8, the contest rules, the day-five prompt or a day-five brief); a prompted pattern was asked for, not chosen. An act is cited by the first eight and last four characters of its id; the full ids are in the JSON.`, '');
for (const c of categories) {
  L.push(`### ${c[0].toUpperCase() + c.slice(1)}`, '');
  for (const p of P.filter((x) => x.category === c)) {
    L.push(`#### ${p.id}. ${p.problem}`, '', `*What a person needed:* ${p.needed}`, '');
    L.push('| Solution | By | Texts | By spec hash | By act id | By name | Kit | Prompted |', '|---|---|---|---|---|---|---|---|');
    for (const k of p.solutions) { const s = S[k];
      L.push(`| ${s.name}${s.pointer_to ? ` *(${s.pointer_to.area}: ${s.pointer_to.dub}'s catalogue; seam)*` : ''}${s.inventory?.to_settle ? ' *(to settle)*' : ''} | ${s.by} | ${s.texts.length ? s.texts.map((t) => t.label).join(', ') : 'none in the copy'} | ${s.spec_hashes.length ? n3(s.use.by_spec_hash) : 'no spec hash'} | ${s.texts.length ? n3(s.use.by_act_id) : '–'} | ${n3(s.use.by_name)} | ${s.kit_in_a_word} | ${s.prompted.mark} |`); }
    L.push('', `*${CAVEAT}*`, '');
    for (const x of p.pointers_from_other_problems) L.push(`- *Pointer:* **${S[x.solution].name}** also bears on this problem; it sits under ${S[x.solution].main_problem}. ${render(x.why ?? '')}`);
    if (p.pointers_from_other_problems.length) L.push('');
    for (const k of p.solutions) { const s = S[k]; const u = s.use;
      L.push(`**${s.name}** (${s.by})`, '');
      if (s.pointer_to) {
        L.push(`- **Now in ${s.pointer_to.area}: a pointer.** ${s.pointer_to.dub}'s catalogue holds this text: \`${s.pointer_to.catalogue}\`, ${s.pointer_to.entry} ${s.pointer_to.seam} Its faults, kit and prompt are catalogued there; DubWeb's corrected reading of them stays in \`catalogue-web.json\`. What DubWeb shows of it is the comparison under this problem, marked as a seam.`);
        if (s.inventory) L.push(`- Shared inventory (version 2): area ${s.inventory.areas.join(', ')}${s.inventory.categories.length ? ', ' + s.inventory.categories.join(', ') : ''}; seam with DubWeb.`);
        if (s.texts.length) L.push('- Texts: ' + s.texts.map((t) => `${t.label}, act \`${short(t.act)}\`${t.spec_hash ? `, spec \`${short(t.spec_hash)}\`` : ''}`).join('; ') + '.');
        const w0 = u.by_spec_hash; L.push(`- Use: by spec hash ${w0.acts} acts from ${w0.signers} signers; by act id ${u.by_act_id.acts} acts${u.by_name ? `; by name ${u.by_name.acts} acts` : ''}. *Used is not checked: these acts applied it by hand.*`, '');
        continue;
      }
      if (s.inventory) L.push(`- Shared inventory: area ${s.inventory.areas.join(', ')}${s.inventory.categories.length ? ', ' + s.inventory.categories.join(', ') : ''}${s.inventory.added_by_hand ? '; added by hand' : ''}; its prompted mark: ${s.inventory.prompted_marks.join(', ') || 'none'}.` + (s.inventory.to_settle ? ` **To settle:** ${s.inventory.to_settle.join('; ')}${s.inventory.wave_2_placements ? ' (wave 2: ' + Object.entries(s.inventory.wave_2_placements).map(([d, v]) => `${d}: ${v}`).join(' / ').replace(/\|/g, '/') + ')' : ''}.` : ''));
      else L.push('- Shared inventory: no record (it is an app, a practice, or a text the inventory does not list).');
      if (s.texts.length) L.push('- Texts: ' + s.texts.map((t) => t.missing ? `${t.label}: ${t.act}` : `${t.label}, act \`${short(t.act)}\`${t.spec_hash ? `, spec \`${short(t.spec_hash)}\`` : ''}${t.inventory?.to_settle ? ' (**to settle**)' : ''}${t.note ? ` (${t.note})` : ''}`).join('; ') + '.');
      for (const e of s.spec_hashes.filter((h) => h.note)) L.push(`- Spec hash with no text in the copy: \`${short(e.hash)}\`: ${e.note}.`);
      if (s.apps.length) L.push('- Apps: ' + s.apps.join('; ') + '.');
      if (s.features.length) L.push('- In the merged feature list: ' + s.features.map((f) => f.missing ? `${f.id} (not found)` : `${f.id}, "${f.feature}" (${f.apps.map((a) => `${a.app}: ${a.versions} version${a.versions === 1 ? '' : 's'}, code ${a.code.join(' and ')}`).join('; ') || 'no players\' app'}; proposed for ${uniq(f.proposed.flatMap((p) => p.apps)).join(', ') || 'no Dubsar app'}${f.to_settle ? '; **to settle**' : ''})`).join('; ') + '.');
      const w = u.by_spec_hash; const parts = [];
      if (s.spec_hashes.length) parts.push(`by spec hash ${w.acts} acts from ${w.signers} signers, ${w.signers_other_than_the_authors} of them not the authors (${Object.entries(w.by_way).map(([k2, v]) => `${v} ${WAY[k2]}`).join(', ') || 'none'}${Object.keys(w.acts_written_under_it).length ? '; those written under it: ' + Object.entries(w.acts_written_under_it).map(([k2, v]) => `${v} of ${k2}`).join(', ') + `, by ${w.signers_of_the_acts_written_under_it} signers` : ''})`);
      if (s.texts.length) parts.push(`by act id ${u.by_act_id.acts} acts from ${u.by_act_id.signers} signers, ${u.by_act_id.signers_other_than_the_authors} not the authors`);
      if (u.by_name) parts.push(`by name (\`${u.by_name.pattern}\`) ${u.by_name.acts} acts from ${u.by_name.signers} signers, ${u.by_name.signers_other_than_the_authors} not the authors; ${u.by_name.acts_naming_it_by_name_only} of those acts name it by name only`);
      if (u.by_its_line_form) parts.push(`in its own line form (\`${u.by_its_line_form.pattern}\`) ${u.by_its_line_form.acts} acts from ${u.by_its_line_form.signers} signers, ${u.by_its_line_form.signers_other_than_the_authors} not the authors`);
      L.push(parts.length ? '- Use: ' + parts.join('; ').replace(/\b1 signers\b/g, '1 signer').replace(/\b1 acts\b/g, '1 act') + `. Short forms only, not counted: ${u.short_form_only_acts_not_counted_as_use}. *Used is not checked: these acts applied it by hand.*` : '- Use: not countable by spec hash, act id or name: it is a way of reading, not a named text. The acts that show it are cited below. *Used is not checked.*');
      const tr = Object.entries((s.spec_hashes.length ? w : u.by_name ?? u.by_act_id).trays_of_the_other_signers ?? {});
      if (tr.length) L.push(`- Trays that carried the other signers (${s.spec_hashes.length ? 'by spec hash' : u.by_name ? 'by name' : 'by act id'}): ${tr.map(([t, n]) => `${t} ${n}`).join(', ')}.`);
      L.push('- Built on by' + (s.built_on_by.length ? ` (texts of other signers that name it, by code): ${s.built_on_by.slice(0, 8).map((b) => `${b.title.replace(/^#+ ?/, '').replace(/\|/g, '/').slice(0, 60)} (\`${short(b.act)}\`)`).join('; ')}${s.built_on_by.length > 8 ? `; and ${s.built_on_by.length - 8} more in the JSON` : ''}.` : ': no other signer\'s specification text names it.') + (s.built_on_note ? ' ' + s.built_on_note : ''));
      L.push('- Faults found: ' + (s.faults.length ? s.faults.map((f) => `${f.what} Found by ${f.found_by}. ${f.fixed}`).join(' ') : 'none found in the acts read.'));
      L.push(`- Kit: ${s.kit}`, `- Prompted: **${s.prompted.mark}**. ${s.prompted.why}`);
      if (s.tested) L.push(`- Tested: ${s.tested}`);
      if (s.actors_and_the_trays_that_carried_them) L.push('- Who carried whom (from the postman\'s log): ' + Object.entries(s.actors_and_the_trays_that_carried_them).map(([role, a]) => `${role} \`${a.identity.slice(0, 8)}\` by tray ${Object.keys(a.trays).join(' and ') || 'unmapped'}`).join('; ') + '.');
      if (s.notes) L.push(`- ${s.notes}`);
      L.push('');
    }
    if (p.seam_with_dublaw) L.push(`*Seam with DubLaw: ${p.seam_with_dublaw.map((x) => S[x.solution].name).join(', ')} ${p.seam_with_dublaw.length > 1 ? 'are' : 'is'} now in Agreements. The comparison below is what DubWeb shows of it, kept under the problem it serves.*`, '');
    L.push(`**They agree on.** ${p.they_agree_on}`, '', `**They differ on.** ${p.they_differ_on}`, '', `**Why it matters.** ${p.why_it_matters}`, '', '**In the round.**', ...p.in_the_round.map((x) => '- ' + x), '');
    if (p.who_carried_whom) L.push('**Who carried whom (from the postman\'s log, by this script).** ' + Object.entries(p.who_carried_whom).map(([role, a]) => `${role} \`${a.identity.slice(0, 8)}\`: tray ${Object.keys(a.trays).join(' and ') || 'unmapped'}`).join('; ') + '.', '');
    if (p.turns_on_named_signers_or_buyer_by_assent) L.push('**This grouping turns on named signers or buyer by assent (a core question for Nobody, allegedly).**', `- With them as the grammar's defaults: ${p.turns_on_named_signers_or_buyer_by_assent.with_them_as_the_grammars_defaults}`, `- Without: ${p.turns_on_named_signers_or_buyer_by_assent.without}`, '');
    L.push(`**DubWeb's lean (${p.lean.kind})${p.lean.changed_from_version_1 ? ', changed' : ''}.** ${p.lean.text}${p.lean.changed_from_version_1 ? ` *Why changed:* ${p.lean.changed_from_version_1}` : ''}`, '');
  }
}
L.push('## 3. The three most important leans', '', '*DubWeb\'s, for Nobody, allegedly, to decide.*', '', ...leansR.map((x, i) => `${i + 1}. ${x}`), '');
L.push('## 4. For the MOR lead: what the language could not say, in DubWeb\'s area', '', '*Evidence, not remedies. It adds to the time findings already logged (two references, links between parties\' lines, a "seen" statement) and to the chains evidence (`_team/dubweb/wave-2/results/chains.md`); it does not restate them.*', '');
morR.forEach((m, i) => L.push(`${i + 1}. **${m.title}** ${m.text}`)); L.push('');
L.push('## 5. Faults in Kišib, Dub or Ummia, to fix as faults', '', '| App | Fault | Found by | State |', '|---|---|---|---|', ...faultsR.map((f) => `| ${f.app} | ${f.fault} | ${f.found_by} | ${f.state} |`), '');
L.push('## 6. Method and limits', '', ...limitsR.map((x) => '- ' + x), '');
writeFileSync(join(here, 'catalogue-web.md'), L.join('\n'));

console.log(`problems ${P.length}, solutions ${Object.keys(S).length}, acts cited ${cited.size}, not found ${notFound.length}`);
for (const nf of notFound) console.log('  NOT FOUND', nf.prefix, nf.why);
console.log('inventory:', inputs.inventory_all_json ? `${inputs.records} records, ${inputs.records_with_an_area} with an area, ${inputs.web_records} Web (${inputs.web_records_to_settle} to settle); web.md ${inputs.web_md ? 'present' : 'absent'}` : 'absent', '| features:', inputs.features ?? 'absent');
console.log('web records not catalogued:', inputs.web_records_not_catalogued.map((r) => r.title).join(' | ') || 'none');
console.log('proposed for another area:', JSON.stringify(inputs.solutions_the_inventory_proposes_for_another_area));
console.log('kit:', JSON.stringify(decoder.kit));
