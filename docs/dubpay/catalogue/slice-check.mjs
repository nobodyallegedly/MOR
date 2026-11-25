// DubPay W3-A: check Money's slice of the shared inventory (DubWeb wave 3) against DubPay's listing B
// (wave 2) and against the acts themselves.
//
// One command:   node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/A/slice-check.mjs
// MOR_ROUND=/path/to/mor-round-2 reads another copy. Needs Node 22.5+ (node:sqlite).
//
// Reads only: _team/dubweb/wave-3/inventory/ (inventory-all.json, money.md), _team/dubpay/wave-2/results/B/
// (listing-money.json; its loader listing-money-data.mjs is imported, and reads _research/ only),
// _team/dublaw/wave-2/results/B/listing-agreements.json and _team/dubweb/wave-2/results/inventory-web.json
// (placements only), _research/ (through the loader), the kit's core library (_team/dubpay/wave-2/kit/).
// Writes only slice-check.json and slice-check.md beside this file.
//
// Hand-made here, and only here: HAND (DubPay's proposals for texts to settle, the reading of B-only and
// placed-elsewhere texts, the reading of candidates). Every count, match, signer, hash and order is computed.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROUND = process.env.MOR_ROUND || join(process.env.HOME, 'Documents/mor-round-2');
const INV_DIR = join(ROUND, '_team/dubweb/wave-3/inventory');
const INV_FILE = join(INV_DIR, 'inventory-all.json');
if (!existsSync(INV_FILE)) { console.error(`STOP: ${INV_FILE} is missing; nothing checked.`); process.exit(2); }
const MONEY_MD = existsSync(join(INV_DIR, 'money.md'));
const B_DIR = join(ROUND, '_team/dubpay/wave-2/results/B');
const INV = JSON.parse(readFileSync(INV_FILE, 'utf8'));
const B = JSON.parse(readFileSync(join(B_DIR, 'listing-money.json'), 'utf8'));
const D = await import(join(B_DIR, 'listing-money-data.mjs'));
const { acts, texts, namedBy, mor, hex, AG, REPORT } = D;
const unhex = (s) => Uint8Array.from(Buffer.from(s, 'hex'));
const s8 = (h) => (h ? h.slice(0, 8) : '—');
const CAVEAT = 'Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.';
const MONEY_WORDS = /\b(pay|pays|paid|payment|payments|invoice|invoices|split|splits|pot|pots|held|hold|holds|deposit|deposits|escrow|loan|loans|lend|lends|lending|refund|refunds|owed|owe|owes|credit|credits)\b/gi;

// ---------------------------------------------------------------------------------- the two slices
const SPECS = INV.specifications;
const touchesMoney = (r) => r.to_settle && (JSON.stringify(r.to_settle).includes('Money') || r.area === 'Money');
const invMoney = SPECS.filter((r) => r.area === 'Money');
const invToSettleMoney = SPECS.filter((r) => touchesMoney(r));
const invIndex = new Map(); // key (spec hash, act id, stand-in, terms, words act) -> record
for (const r of SPECS) for (const k of [r.spec_hash, r.act, ...(r.acts_same_text ?? []), r.hand?.stand_in, r.hand?.terms, r.hand?.words_text_act].filter(Boolean)) invIndex.set(k, r);
const inventoryKey = (r) => r.spec_hash;

// B, one line per draft (the unit the inventory counts), grouped by text (B's unit).
const bDrafts = [];
for (const e of B.entries) for (const d of e.drafts) bDrafts.push({ e, d });
function matchB({ e, d }) {
  const tries = [['spec hash', d.spec], ['act id', d.act], ['media hash', d.media], ['act id (words of the Terms)', d.wordsTextAct]];
  if (e.kind === 'kitspec') tries.unshift(['spec hash', REPORT]);
  for (const [how, k] of tries) if (k && invIndex.has(k)) return { how, rec: invIndex.get(k) };
  return null;
}

// ---------------------------------------------------------------------------------- per-act checks
const specHashOf = (kind, creator, text) => mor.decodeSpec(mor.cborEncode(new Map([[0, kind], [1, unhex(creator)], [9, text]]))).hash;
const draftNo = (title) => { const m = (title ?? '').match(/\b(?:draft|version|proposal)\s+(\d+)/i); return m ? Number(m[1]) : null; };
const timeOf = (id) => acts.get(id)?.time ?? null;
const bySpec = new Map(SPECS.map((r) => [r.spec_hash, r]));
function checkRecord(r) {
  const out = { act_in_research: null, signer_is_creator: null, spec_hash_computes: null, same_text_acts: null, drafts_in_order: null, notes: [] };
  if (!r.act) {
    out.act_in_research = 'no act (none named)';
    if (r.spec_hash === REPORT) { out.spec_hash_computes = 'yes: equals the core library\'s report spec (agreementsNewSpecs().report.spec)'; out.notes.push('a spec of the kit, not a players\' text: no act, no signer to check'); }
    else out.spec_hash_computes = 'not computable (no text in the copy)';
    out.signer_is_creator = 'not applicable';
    out.drafts_in_order = 'not applicable';
    return out;
  }
  const a = acts.get(r.act);
  out.act_in_research = a ? 'yes' : 'NO';
  if (!a) return out;
  out.signer_is_creator = a.d.signer === r.creator ? 'yes' : `NO (signed by ${s8(a.d.signer)})`;
  const t = texts.get(r.act);
  if (!t) out.spec_hash_computes = 'NO (not a public text act)';
  else {
    let h = null; try { h = specHashOf(r.kind ?? 0, r.creator, a.text); } catch (er) { h = 'error: ' + er.message; }
    out.spec_hash_computes = h === r.spec_hash ? 'yes' : `NO (computes to ${s8(h)})`;
  }
  const same = (r.acts_same_text ?? []).filter((x) => x !== r.act);
  out.same_text_acts = same.length ? same.map((x) => { const b = acts.get(x); return b ? (b.d.signer === r.creator && b.text === a.text ? `${s8(x)} same signer, same text` : `${s8(x)} DIFFERS`) : `${s8(x)} NOT IN COPY`; }).join('; ') : 'none other';
  // Order: every earlier draft carried before this one, every later one after; titles' numbers do not go down.
  const me = timeOf(r.act), myNo = draftNo(r.title); const bad = [];
  for (const [side, list] of [['earlier', r.drafts?.earlier ?? []], ['later', r.drafts?.later ?? []]]) for (const sh of list) {
    const o = bySpec.get(sh); if (!o) { bad.push(`${side} ${s8(sh)} not in the inventory`); continue; }
    const ot = timeOf(o.act), oNo = draftNo(o.title);
    if (me && ot && (side === 'earlier' ? ot > me : ot < me)) bad.push(`${side} ${s8(sh)} carried ${side === 'earlier' ? 'after' : 'before'} it`);
    if (myNo != null && oNo != null && (side === 'earlier' ? oNo > myNo : oNo < myNo)) bad.push(`${side} ${s8(sh)} titled draft ${oNo}, this one ${myNo}`);
    if (myNo != null && oNo != null && oNo === myNo) out.notes.push(`${side} draft ${s8(sh)} carries the same draft number (${oNo}) in its title`);
  }
  out.drafts_in_order = !(r.drafts?.earlier?.length || r.drafts?.later?.length) ? 'single draft' : bad.length ? 'NO: ' + bad.join('; ') : 'yes (by carry time and title number)';
  if (!me) out.notes.push('no carry record in the postman\'s log: order by time not checked');
  return out;
}
const failed = (c) => Object.values(c).some((v) => typeof v === 'string' && /\bNO\b/.test(v));

// ---------------------------------------------------------------------------------- use counts
// Inventory: by hash = acts naming the spec hash whole (any slot), own acts excluded (inventory.mjs);
// by act = acts naming an act id whole, or 8…4, or its first 8 characters in words (wave3.mjs).
// B: uses = acts naming spec hash, SHA-256 or work hash of the text, or the act id in a Terms body or spec slot
// (anywhere, for texts B marks named by act id); cited = act id in refs or payload, not already a use.
function invSets(r) {
  const byHash = new Set(r.added_by_hand ? (r.hand?.by_hash ?? []).flatMap((b) => b.use.acts_naming) : r.use?.acts_naming ?? []);
  const byAct = new Set(r.added_by_hand ? r.hand?.by_act?.acts_naming ?? [] : r.uses_wave_3?.by_act_detail?.acts_naming ?? []);
  return { byHash, byAct };
}
function why(id, d) {
  // What names this act's draft, slot by slot (from B's loader: every 32-byte string and 64-hex in every public act).
  const ways = [];
  for (const [form, h] of [['spec hash', d.spec], ['SHA-256 of the text', d.sha256OfText], ['work hash of the text', d.workHashOfText], ['act id', d.act], ['media hash', d.media]]) {
    if (!h) continue; const sl = namedBy.get(h)?.get(id); if (sl) ways.push(`${form} in ${[...sl].join('+')}`);
  }
  return ways.length ? ways.join(', ') : 'no whole name: short form or first 8 characters only';
}
function compareCounts(rec, d) {
  const inv = invSets(rec);
  const bUse = new Set(d.uses?.actIds ?? []), bCited = new Set(d.citedByActId?.actIds ?? []);
  const invAll = new Set([...inv.byHash, ...inv.byAct]), bAll = new Set([...bUse, ...bCited]);
  const row = { inventory_by_hash: inv.byHash.size, B_uses: bUse.size, inventory_all_namings: invAll.size, B_all_namings: bAll.size, inventory_by_act: inv.byAct.size, B_cited_by_act_id: bCited.size, B_short_mentions: d.shortMentions ?? 0 };
  const pct = (x, y) => (Math.max(x, y) === 0 ? 0 : Math.abs(x - y) / Math.max(x, y));
  row.differs_headline = pct(row.inventory_by_hash, row.B_uses) > 0.1;
  row.differs_all = pct(row.inventory_all_namings, row.B_all_namings) > 0.1;
  const feedless = (id) => acts.has(id) && acts.get(id).homes.size === 0;
  const ruleB = (id) => feedless(id) ? 'held only in windows\' acts/, in no home\'s feed: B reads these, the inventory does not'
    : (namedBy.get(d.spec)?.has(id) ? 'names the spec hash: both rules count it (the inventory reads it otherwise)' : 'names ' + why(id, d) + ': B counts this, the inventory\'s by-hash rule counts the spec hash only');
  const ruleI = (id, set) => !acts.has(id) ? 'act not in B\'s read' : bAll.has(id) && set === 'headline' ? 'B counts it as cited (act id in refs or payload), not a use' : 'names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions';
  const tally = (ids, f) => { const t = {}; for (const id of ids) { const k = f(id); t[k] = (t[k] || 0) + 1; } return t; };
  const explain = [];
  for (const [flag, I, Bs, name] of [[row.differs_headline, inv.byHash, bUse, 'headline'], [row.differs_all, invAll, bAll, 'all']]) {
    if (!flag) continue;
    const onlyB = [...Bs].filter((x) => !I.has(x)), onlyI = [...I].filter((x) => !Bs.has(x));
    if (onlyB.length) explain.push({ count: name, side: 'counted by B, not by the inventory', acts: onlyB.length, by_rule: tally(onlyB, ruleB) });
    if (onlyI.length) explain.push({ count: name, side: 'counted by the inventory, not by B', acts: onlyI.length, by_rule: tally(onlyI, (id) => ruleI(id, name)) });
  }
  row.explained = explain;
  return row;
}

// ---------------------------------------------------------------------------------- hand-made reading
const HAND = JSON.parse(readFileSync(join(HERE, 'slice-check-hand.json'), 'utf8'));

// ---------------------------------------------------------------------------------- 1-2: line per text
const lines = [];
const seenInv = new Set();
for (const e of B.entries) {
  for (const d of e.drafts) {
    const m = matchB({ e, d });
    const rec = m?.rec ?? null;
    if (rec) seenInv.add(inventoryKey(rec));
    const status = !rec ? 'in B only' : rec.area === 'Money' ? 'in both' : 'placed elsewhere in the inventory';
    const line = {
      text: e.name, B_key: e.key, B_category: `${e.category}. ${B.categories[e.category]}`, B_kind: e.kind, draft: d.draft,
      act: d.act, spec_hash: d.spec ?? (e.kind === 'kitspec' ? REPORT : null), media_hash: d.media, status, matched_by: m?.how ?? null, mark: m ? 'counted' : 'counted (no key of it in the inventory)',
      inventory: rec ? { title: rec.title.slice(0, 120), area: rec.area, area_category: rec.area_category, area_reason: rec.area_reason, prompted: rec.prompted, to_settle: !!rec.to_settle } : null,
    };
    if (status !== 'in both') {
      const h = HAND.read[`${e.key}`] ?? null;
      line.task_under_15_words = (e.task ?? '').split(/\s+/).slice(0, 14).join(' ') + ((e.task ?? '').split(/\s+/).length > 14 ? '…' : '');
      const src = d.act && acts.get(d.act)?.text ? d.act : d.wordsTextAct ?? d.announcedBy ?? null;
      const txt = src && acts.get(src)?.text;
      line.money_words_from = src ? (src === d.act ? 'its own text act' : src === d.wordsTextAct ? 'the text act of its Terms words' : 'the text act announcing it') : null;
      if (status === 'in B only') {
        // Why the inventory's rule left it out (counted): the rule takes a text act whose first line begins "# cMIP"
        // or "# Module", or whose spec hash some act names; apps, Terms and kit specs are not text specifications.
        const t = d.act && texts.get(d.act);
        line.why_not_in_inventory = e.kind === 'media' ? 'an app (media), not a text act: the inventory lists texts only'
          : e.kind === 'terms' ? 'a Terms act, not a text act: the inventory lists texts only'
          : !t ? 'not a public text act'
          : `a text act${acts.get(d.act).homes.size ? '' : ' held only in windows\' acts/, in no home\'s feed (the inventory reads feeds)'}; first line ${/^#\s*(cMIP|Module)/i.test(t.title) ? 'begins "# cMIP"/"# Module"' : 'does not begin "# cMIP" or "# Module"'}; its spec hash is named by ${[...(namedBy.get(t.spec) ?? new Map()).keys()].filter((x) => x !== t.id).length} other acts`;
      }
      line.money_words_in_act = txt ? (txt.match(MONEY_WORDS) ?? []).length : null;
      if (!h) throw new Error(`no reading written for ${e.key}`);
      line.act_says_it_is_money = { answer: h.says, basis: h.basis, mark: 'inferred' };
    }
    line.prompted = rec?.prompted === 'yes' ? 'prompted' : rec?.prompted === 'work' ? 'prompted (another draft of the work)' : e.kind === 'media' ? 'prompted (notice 7 asked for apps)' : (d.act && /has not been used for/i.test(acts.get(d.act)?.text ?? '')) ? 'prompted (day-five prompt, its words)' : rec ? 'no' : 'not found';
    lines.push(line);
  }
}
for (const r of invMoney) if (!seenInv.has(inventoryKey(r))) lines.push({ text: r.title.replace(/^#\s*/, '').slice(0, 120), B_key: null, draft: draftNo(r.title), act: r.act, spec_hash: r.spec_hash, status: 'in the inventory only', matched_by: null, mark: 'counted',
  inventory: { title: r.title.slice(0, 120), area: r.area, area_category: r.area_category, area_reason: r.area_reason, prompted: r.prompted, to_settle: !!r.to_settle },
  prompted: r.prompted === 'yes' ? 'prompted' : r.prompted === 'work' ? 'prompted (another draft of the work)' : 'no' });

// ---------------------------------------------------------------------------------- 3: records against their acts
const checks = invMoney.map((r) => ({ title: r.title.slice(0, 120), act: r.act, spec_hash: r.spec_hash, creator: r.creator, added_by_hand: r.added_by_hand, mark: 'traced', ...checkRecord(r) }));
// The same checks on to-settle and placed-elsewhere records that touch Money, for completeness.
const elsewhere = [...new Set([...invToSettleMoney.filter((r) => r.area !== 'Money'), ...lines.filter((l) => l.status === 'placed elsewhere in the inventory').map((l) => invIndex.get(l.spec_hash) ?? invIndex.get(l.act))])].filter(Boolean);
const checksElsewhere = elsewhere.map((r) => ({ title: r.title.slice(0, 120), area: r.area, act: r.act, spec_hash: r.spec_hash, mark: 'traced', ...checkRecord(r) }));

// ---------------------------------------------------------------------------------- 4: to settle
const toSettle = invToSettleMoney.map((r) => {
  const p = r.placements_wave_2 ?? {};
  const pl = (who) => (p[who] ? `${p[who].area ?? '—'}: ${p[who].category ?? '—'}` : r.to_settle?.disagreement?.[who] ?? 'not listed');
  const h = HAND.proposals[r.spec_hash.slice(0, 8)] ?? null;
  if (!h) throw new Error(`no DubPay proposal written for to-settle text ${s8(r.spec_hash)}`);
  return { title: r.title.slice(0, 120), spec_hash: r.spec_hash, act: r.act, why: r.to_settle.why, DubWeb: r.to_settle.disagreement?.DubWeb ?? pl('DubWeb'), DubPay: r.to_settle.disagreement?.DubPay ?? pl('DubPay'), DubLaw: r.to_settle.disagreement?.DubLaw ?? pl('DubLaw'),
    inventory_proposal: `${r.area}: ${r.area_category}`, DubPay_proposal: h ? { placement: h.placement, reason: h.reason, label: 'proposal' } : null, mark: 'counted (placements); proposal (DubPay\'s)' };
});

// ---------------------------------------------------------------------------------- 5: candidates nobody listed
const listedActs = new Set([...SPECS.flatMap((r) => [r.act, ...(r.acts_same_text ?? [])]), ...bDrafts.map(({ d }) => d.act), ...bDrafts.map(({ d }) => d.announcedBy), ...(INV.draft_titled_texts_not_included ?? []).map((x) => x.act)].filter(Boolean));
const otherListings = new Set();
for (const f of [join(ROUND, '_team/dublaw/wave-2/results/B/listing-agreements.json'), join(ROUND, '_team/dubweb/wave-2/results/inventory-web.json')]) {
  if (!existsSync(f)) continue; const s = readFileSync(f, 'utf8'); for (const m of s.matchAll(/[0-9a-f]{64}/g)) otherListings.add(m[0]);
}
const RULE_SHAPE = /^#\s|^\*\*[^*]+\*\*\s*$/m; // a heading
const RULE_WORDS = /\b(cmip|template|draft \d|version \d|rule|rules|module|terms|charter|form)\b/i;
const candidates = [];
for (const t of texts.values()) {
  if (listedActs.has(t.id)) continue;
  const text = t.act.text; const title = t.title;
  if (!/^#\s/.test(title)) continue; // reads as a document: a heading on its first line
  if (!RULE_WORDS.test(title) && !/^##\s/m.test(text)) continue; // a rule or template: named so, or sectioned
  const words = (text.match(MONEY_WORDS) ?? []).map((w) => w.toLowerCase());
  const titleMoney = (title.match(MONEY_WORDS) ?? []).length;
  if (words.length < 4 && !titleMoney) continue;
  const tally = {}; for (const w of words) tally[w] = (tally[w] || 0) + 1;
  candidates.push({ act: t.id, signer: t.signer, title: title.slice(0, 140), bytes: Buffer.byteLength(text), money_words: words.length, money_words_in_title: titleMoney, top_words: Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w, n]) => `${w} ${n}`).join(', '),
    in_other_listings: otherListings.has(t.id) || otherListings.has(t.spec), day: acts.get(t.id).day ?? null, mark: 'inferred', reading: HAND.candidates[t.id.slice(0, 8)] ?? null });
}
for (const p of Object.keys(HAND.candidates)) {
  if (candidates.some((c) => c.act.startsWith(p))) continue;
  const ids = [...texts.keys()].filter((k) => k.startsWith(p)); if (ids.length !== 1) throw new Error(`candidate ${p}: ${ids.length} text acts`);
  const t = texts.get(ids[0]); if (listedActs.has(t.id)) throw new Error(`candidate ${p} is already listed`);
  const words = (t.act.text.match(MONEY_WORDS) ?? []).map((w) => w.toLowerCase()); const tally = {}; for (const w of words) tally[w] = (tally[w] || 0) + 1;
  candidates.push({ act: t.id, signer: t.signer, title: t.title.slice(0, 140), bytes: Buffer.byteLength(t.act.text), money_words: words.length, money_words_in_title: (t.title.match(MONEY_WORDS) ?? []).length,
    top_words: Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w, n]) => `${w} ${n}`).join(', '), in_other_listings: otherListings.has(t.id) || otherListings.has(t.spec), day: acts.get(t.id).day ?? null, mark: 'inferred', found_by: 'reading (hand)', reading: null });
}
for (const c of candidates) {
  c.found_by ??= 'rule (heading, rule word, money words)';
  c.window_inferred = D.windowOfSigner(c.signer);
  c.acts_naming_its_id = [...(namedBy.get(c.act) ?? new Map()).keys()].filter((x) => x !== c.act).length;
  const h = HAND.candidates[c.act.slice(0, 8)]; c.reading = h ? { ...h, mark: 'inferred' } : { category: 'not read as a rule or template', reading: 'caught by the rule; read and set aside (a report or a reply)', mark: 'inferred' };
}
candidates.sort((a, b) => (a.reading.category.startsWith('not') - b.reading.category.startsWith('not')) || (b.money_words - a.money_words));

// ---------------------------------------------------------------------------------- 6: use counts
const counts = [];
for (const { e, d } of bDrafts) {
  const m = matchB({ e, d }); if (!m) continue;
  counts.push({ text: e.name, draft: d.draft, act: d.act, spec_hash: m.rec.spec_hash, area: m.rec.area, ...compareCounts(m.rec, d), mark: 'counted' });
}

// ---------------------------------------------------------------------------------- write
const summary = {
  inventory_money_records: invMoney.length,
  inventory_money_by_hand: invMoney.filter((r) => r.added_by_hand).length,
  inventory_to_settle_touching_money: invToSettleMoney.length,
  B_texts: B.entries.length, B_drafts: bDrafts.length,
  lines: Object.fromEntries(['in both', 'in the inventory only', 'in B only', 'placed elsewhere in the inventory'].map((s) => [s, lines.filter((l) => l.status === s).length])),
  B_texts_by_status: Object.fromEntries(['all drafts in both', 'some drafts in both', 'none in the inventory', 'placed elsewhere'].map((s) => [s, 0])),
  records_failing_their_act: checks.filter(failed).length,
  records_elsewhere_failing: checksElsewhere.filter(failed).length,
  candidates: candidates.length,
  count_rows: counts.length, count_rows_differing_headline: counts.filter((c) => c.differs_headline).length, count_rows_differing_all: counts.filter((c) => c.differs_all).length,
};
for (const e of B.entries) {
  const st = lines.filter((l) => l.B_key === e.key).map((l) => l.status);
  const k = st.every((s) => s === 'in both') ? 'all drafts in both' : st.some((s) => s === 'in both') ? 'some drafts in both' : st.some((s) => s.startsWith('placed')) ? 'placed elsewhere' : 'none in the inventory';
  summary.B_texts_by_status[k]++;
}
let moneyMd = null;
if (MONEY_MD) {
  const md = readFileSync(join(INV_DIR, 'money.md'), 'utf8');
  const m = md.match(/(\d+) texts proposed for Money; (\d+) to settle/);
  const rows = (md.match(/^\| .* \| `[0-9a-f]{8}…[0-9a-f]{4}` \|/mg) ?? []).length;
  const toSettleMd = (md.match(/^- \*\*/mg) ?? []).length;
  moneyMd = { says_texts: m ? Number(m[1]) : null, says_to_settle: m ? Number(m[2]) : null, table_rows: rows, to_settle_items: toSettleMd,
    json_money_records: invMoney.length, json_money_records_to_settle: invMoney.filter((r) => r.to_settle).length, json_to_settle_touching_money_any_area: invToSettleMoney.length,
    agrees: m && Number(m[1]) === invMoney.length && rows === invMoney.length && Number(m[2]) === invMoney.filter((r) => r.to_settle).length };
}
const out = { made: 'DubPay W3-A, slice-check.mjs. Nobody, allegedly. Every count, match, signer, spec hash and order below is computed by the script; readings marked inferred and DubPay\'s proposals come from slice-check-hand.json.',
  caveat: CAVEAT, sources: { inventory: 'dubweb/wave-3/inventory/inventory-all.json', money_md_present: MONEY_MD, money_md_used_for: MONEY_MD ? 'cross-check of the Money records\' count and the to-settle list' : null, listing_B: 'dubpay/wave-2/results/B/listing-money.json', acts_read: acts.size, public_text_acts: texts.size },
  money_md_check: moneyMd, summary, lines, checks, checks_elsewhere: checksElsewhere, to_settle: toSettle, candidates, counts };
writeFileSync(join(HERE, 'slice-check.json'), JSON.stringify(out, null, 1));
const { renderMd } = await import(join(HERE, 'slice-check-md.mjs'));
writeFileSync(join(HERE, 'slice-check.md'), renderMd(out, HAND));
console.log(JSON.stringify(summary, null, 1));
