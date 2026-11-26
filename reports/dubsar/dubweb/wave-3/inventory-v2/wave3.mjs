#!/usr/bin/env node
// wave3.mjs — DubWeb wave 3, session A: the shared inventory, built on the run of inventory.mjs.
// VERSION 2 (session F, 26 November 2026): the copy in inventory-v2/. Same run, same reading, plus the two slice checks
// (DubLaw's _team/dublaw/wave-3/slice-check.md; DubPay's _team/dubpay/wave-3/results/A/slice-check.md), applied below
// in DUBLAW_ADDED and CHECKS. Every change is listed, by code, in changes.md (changes.mjs).
//
//   node inventory.mjs --research ~/Documents/mor-round-2/_research --out inventory-all.json
//   cp inventory-all.json inventory-run.json          (the script's own output, kept as it came)
//   MOR_RESEARCH=~/Documents/mor-round-2/_research node wave3.mjs
//
// Reads inventory-run.json (untouched output of inventory.mjs), the three Dubs' wave-2 placements
// (placements.mjs) and _research again through read-copy.mjs (lines 21-208 of inventory.mjs, unchanged),
// to count use of the texts added by hand. Writes, in this folder only: inventory-all.json (every field
// the script wrote, plus area, area_category, added_by_hand, prompted, to_settle), add-by-hand.json,
// inventory-all.md, money.md, agreements.md, web.md. No network, no key, no sealed act opened.
// Every area and category is a proposal. Counts come from code; what was read by hand says so.

import { readFileSync, writeFileSync } from 'node:fs';
import { acts, named, shortNamed, textOf, specHash, strings, windowOf } from './read-copy.mjs';
import { placementsOf, pay, law, PAYCAT, LAWCAT } from './placements.mjs';
import { createHash } from 'node:crypto';

const run = JSON.parse(readFileSync('inventory-run.json', 'utf8'));
const sha = (s) => createHash('sha256').update(s).digest('hex');
const shortOf = (h) => h.slice(0, 8) + '…' + h.slice(-4);
const CAVEAT = 'Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.';
const full = (p) => { const m = [...acts.keys()].filter((k) => k.startsWith(p)); if (m.length !== 1) throw new Error(`prefix ${p}: ${m.length} acts`); return m[0]; };
const signerOf = (id) => acts.get(id).d.signer;
const minArrival = (id) => Math.min(...Object.values(acts.get(id).seen).flat());

// ------------------------------------------------------------------ counting (same reading as inventory.mjs)
const payloadText = new Map(); const textOfAct = (a) => { if (!payloadText.has(a)) payloadText.set(a, strings(acts.get(a).d.payload).join('\n')); return payloadText.get(a); };
const ALL = [...acts.keys()];
/** Use by spec hash, as inventory.mjs counts it (lines 259-276), for a hash with or without a text. */
function useByHash(h, own) {
  const by = (named.get(h) ?? []).filter(([a]) => !own.has(a));
  const ways = {}; const using = new Set();
  for (const [a, way] of by) { using.add(a); (ways[way] ??= new Set()).add(a); }
  const shortUse = (shortNamed.get(shortOf(h)) ?? []).filter((a) => !using.has(a) && !own.has(a));
  const per = {}; const ids = new Set(); const wins = new Set();
  for (const a of using) {
    const x = acts.get(a); ids.add(x.d.signer); if (windowOf[x.d.signer]) wins.add(windowOf[x.d.signer]);
    for (const [hm, arr] of Object.entries(x.seen)) { const p = (per[hm] ??= { first: Infinity, last: -Infinity, acts: 0 }); p.first = Math.min(p.first, arr[0]); p.last = Math.max(p.last, arr[arr.length - 1]); p.acts++; }
  }
  return { acts: using.size, by_way: Object.fromEntries(Object.entries(ways).sort().map(([w, s]) => [w, s.size])), identities: ids.size, windows_inferred: [...wins].sort(),
    per_home: Object.fromEntries(Object.entries(per).sort()), acts_naming: [...using].sort(), short_form_only_acts: shortUse.sort() };
}
/** Use by act id: acts naming one of the ids whole (any way), in short form (8…4), or by its first 8 characters in words. */
function useByAct(ids, own, creator) {
  const whole = new Map(); const short = new Set(); const prefix = new Set();
  for (const id of ids) {
    for (const [a, way] of named.get(id) ?? []) if (!own.has(a)) { if (!whole.has(a)) whole.set(a, new Set()); whole.get(a).add(way); }
    for (const a of shortNamed.get(shortOf(id)) ?? []) if (!own.has(a)) short.add(a);
    const re = new RegExp(`\\b${id.slice(0, 8)}`, 'i');
    for (const a of ALL) if (!own.has(a) && re.test(textOfAct(a))) prefix.add(a);
  }
  const all = new Set([...whole.keys(), ...short, ...prefix]);
  const ways = {}; for (const [, set] of whole) for (const w of set) ways[w] = (ways[w] ?? 0) + 1;
  return { acts: all.size, whole_id: whole.size, whole_id_by_way: Object.fromEntries(Object.entries(ways).sort()), short_form: short.size, first_8_in_words: prefix.size,
    identities: new Set([...all].map(signerOf)).size, acts_not_by_creator: [...all].filter((a) => signerOf(a) !== creator).length, acts_naming: [...all].sort() };
}
/** Use by name in words: acts (other than its own) whose public words match the pattern. */
function useByName(pattern, own, creator) {
  if (!pattern) return null;
  const re = new RegExp(pattern, 'i'); const hit = ALL.filter((a) => !own.has(a) && re.test(textOfAct(a)));
  return { pattern, acts: hit.length, identities: new Set(hit.map(signerOf)).size, acts_not_by_creator: hit.filter((a) => signerOf(a) !== creator).length, acts_naming: hit.sort() };
}

// ------------------------------------------------------------------ the texts added by hand
const POSTMARK = signerOf(full('e15cb368')); const PLACE = 'b3d7eee6806c0494f85c9835e2ad4c257dc3e88e83a792d11a49f1f306200919';
const standIn = (n) => sha(`POSTMARK PLACE, draft ${n}, test value until uploaded`);
const DT = Object.fromEntries(run.draft_titled_texts_not_included.map((d) => [d.act.slice(0, 8), d]));
const MISSED_DT = "in the run's own list draft_titled_texts_not_included: a heading with 'draft N' or 'version N', but no act names its spec hash (whole or short) and its title does not begin '# cMIP' or '# Module', the script's rule for a specification";
const DUBLAW_WHY = 'named by act id only: acts name it by its act id, never by its spec hash, and its first line does not begin "# cMIP" or "# Module"; added by hand in version 2 because DubLaw\'s slice check (25 November 2026) asks for it in Agreements';
const HAND = [
  { id: 'keep-recovery-1', act: 'f2b809a2', work: 'a83df2c7:keep recovery', name: 'keep recovery', why: MISSED_DT },
  { id: 'keep-recovery-2a', act: '16432468', work: 'a83df2c7:keep recovery', name: 'keep recovery', why: MISSED_DT,
    read: 'Draft 2, first publication. A second act with the same title (2c6a10b9) says it replaces this one, which overstated how many texts used one-line fields; the bytes differ, so the spec hash differs.' },
  { id: 'keep-recovery-2b', act: '2c6a10b9', work: 'a83df2c7:keep recovery', name: 'keep recovery', why: MISSED_DT,
    read: 'Draft 2, published a second time: its first line says it replaces act 16432468…c7f4 (same title, changed words).' },
  { id: 'postmark-place-3', act: 'e15cb368', work: 'postmark:place', name: "postmark'?s place|postmark-place", why: MISSED_DT,
    stand_in: standIn(3), stand_in_check: 'checked: SHA-256 of "POSTMARK PLACE, draft 3, test value until uploaded" = bc39bda6…b7c0, the string the text itself gives as its stand-in (and Postmark\'s day-1-window-3 report: "Specification draft 3 under a new stand-in hash (bc39bda6…b7c0)")',
    read: 'The text says its acts are typed under a stand-in hash, not under its spec hash: the 137 place records under bc39bda6 are its use.' },
  { id: 'handover-check-1', act: '3f9351b0', work: 'b820fe4b:handover check', name: 'handover check', why: MISSED_DT },
  { id: 'until-policy-1', act: '6f779dbe', work: '3022fb29:until home policy', name: "until'?s home:? policy", why: MISSED_DT },
  { id: 'until-policy-2', act: 'd6ab83fb', work: '3022fb29:until home policy', name: "until'?s home:? policy", why: MISSED_DT },
  { id: 'room-let-1', act: '526f4947', work: '76a78f70:room let', name: 'room let', why: MISSED_DT },
  { id: 'room-let-2', act: '943e2ad4', work: '76a78f70:room let', name: 'room let', why: MISSED_DT },
  { id: 'room-let-3', act: '9f1911e7', work: '76a78f70:room let', name: 'room let', why: MISSED_DT },
  { id: 'invoice-request-1', act: '72bbce87', work: '6d354b6f:invoice request form', name: 'invoice request form', why: MISSED_DT },
  { id: 'invoice-request-2', act: 'beb3fdad', work: '6d354b6f:invoice request form', name: 'invoice request form', why: MISSED_DT },
  { id: 'ring-of-names-2', terms: '9b660a34', act: 'c412a37d', work: '611acc3e:ring of names', name: 'ring of names',
    why: 'its words are Terms (Agreements draft 25, type 0), not a text act under a spec: the Terms name a fingerprint of the words (body key 4), never a spec hash, so the script\'s rule never sees them',
    read: 'Terms 9b660a34…20ea, signed by Beatrice (611acc3e…4c9b): body.words = cc29e10f…, which is the MOR work hash (tagged "MOR/work") of the text act c412a37d…6ea7 ("A ring of names, draft 2"), computed here; body.cmip = 61bcdb5b…4528 (the plain-words reading); previous (key 5) = c412a37d…; it replaces draft 1 (Terms 789552185d61…, words in act 34d68932…), which is not added here.' },
  { id: 'word-in-advance-1', terms: '66072149', act: '2ea9aa1d', work: 'd79c1ba7:word in advance', name: 'word in advance',
    why: 'its words are Terms (Agreements draft 25, type 0), not a text act under a spec: the Terms name a fingerprint of the words, never a spec hash',
    read: 'Terms 66072149…f245, signed by Odile Ferrant (d79c1ba7…70ff), parties Odile and three witnesses: body.words = f2c8b30d…, which is the MOR work hash of the text act 2ea9aa1d…675e ("Word in advance 1, of Odile Ferrant"), computed here; body.cmip = 61bcdb5b…4528 (the plain-words reading).' },
  { id: 'anchoring-8', work: 'genesis:anchoring', title: 'Anchoring cMIP, draft 8 (Longhouse runs it)', creator: null, name: "anchoring cmip[^\\n]{0,30}draft 8|anchoring, draft 8|anchoring cmip'?s (own )?form",
    why: 'its text is not a public text act in the copy: none of Longhouse\'s (b820fe4b…10f1) public text acts is the cMIP; they only apply it ("in the anchoring cMIP draft 8\'s form") and never give its spec hash',
    read: 'Searched every public text act signed by b820fe4b: anchors 1 to 12, their leaves and blinds, offers, answers, the Handover check; none is the anchoring cMIP. _research/cmips-indispensable.md lists "Anchoring, draft 8 | genesis repository; Longhouse runs it". Not in the copy: no spec hash, no text. Its use is counted by name only.' },
  { id: 'report-block-4', hash: '7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854', work: 'hosts:report block', title: 'The report block, proposal 4', creator: null, name: 'report block',
    why: 'named as a spec (81 acts are signed under it) but its text is not a text act in the copy: it is a hosts\' proposal file in the repository',
    read: 'Identified from the hosts\' 01-where-to-read.md (every window\'s from-the-hosts/): "The report block, proposal 4 (a proposal, not yet a rule): docs/lead/proposals/report-block-4.md … spec hash 7b65c60f…7854. Proposals 2 and 3 are replaced." Text not in the copy.' },
  { id: 'postmark-place-4', hash: standIn(4), work: 'postmark:place', title: "Postmark's place, specification draft 4 (place 0.4.0; stand-in hash)", creator: POSTMARK, name: "postmark'?s place|postmark-place",
    why: 'named as a spec (1,699 acts under it) but no text in the copy: a stand-in hash, not computed from creator, kind and text',
    stand_in_check: 'checked: SHA-256 of "POSTMARK PLACE, draft 4, test value until uploaded" = 53b1b4be…da77',
    read: 'Postmark\'s day-2-window-1 report: "Specification draft 4 (stand-in 53b1b4be…da77)"; day-5-window-3: drafts 4 and 5 "Not yet published under a creator, so still stand-ins"; the followers\' day-5-window-3-final report: "Postmark\'s place, draft 4 | 53b1b4be…". Draft 5 (3c58eeaa…, handover and takeover) is named in the same report; no act in the copy is signed under it.' },
  { id: 'postmark-place-1', hash: standIn(1), work: 'postmark:place', title: "Postmark's place, records spec draft 1 (stand-in hash)", creator: POSTMARK, name: "postmark'?s place|postmark-place",
    why: 'named as a spec (108 records under it) but no text in the copy: a stand-in hash',
    stand_in_check: 'checked, no longer only inferred: SHA-256 of "POSTMARK PLACE, draft 1, test value until uploaded" = e8891459…0efc, the same pattern as drafts 3, 4 and 5; all 108 acts under it are records of the place identity b3d7eee6…0919 in postmark-place\'s record. No report in the copy names e8891459.',
    read: 'Draft 3\'s text says "The payloads are as in drafts 1 and 2"; the stand-in of draft 2 (SHA-256 of the same string with "draft 2") is named by no act in the copy.' },
  // ---- version 2: the six texts DubLaw's slice check asks to add (named by act id only)
  ...[
    { id: 'stall-k2-in-force-on-assents', act: 'de8d5d29', work: 'ddafffcd:in force on the sellers\' assents', name: "in force on the sellers'? assents" },
    { id: 'stall-k5-buyers-spot', act: '0b9eee89', work: 'ddafffcd:the buyer\'s spot', name: "stall[^\\n]{0,20}buyer'?s spot" },
    { id: 'stall-k4-change-or-leave', act: '6dd4fff6', work: 'ddafffcd:change the offer, or leave its service alone', name: 'leave its service alone' },
    { id: 'stall-k4-future-buyers', act: '3f2a69de', work: 'ddafffcd:change an offer for future buyers', name: 'for future buyers' },
    { id: 'counterparty-plain-words-body-1', act: 'ee0fd121', fingerprint: '61bcdb5b15c282e81a5b822c0d1c6c704af0df360ae98189e63e9715f7114528', work: 'f1de20f8:plain-words body', name: 'plain-words body',
      read: 'DubLaw lists this text twice, "in two copies (61bcdb5b… and ee0fd121…)". The copy holds one text act, ee0fd121…e681; 61bcdb5b…4528 is no act in the copy: it is the fingerprint DubLaw\'s listing gives as "sha256 of its opening sentences", which Terms name in their body socket. So one record here carries both keys: DubLaw\'s six entries are five texts.' },
  ].map((x) => ({ ...x, why: DUBLAW_WHY })),
];

function handRecord(h) {
  let title, creator, ownActs = [], spec_hash = null, termsId = null, kind = 0;
  if (h.act) { const a = full(h.act); ownActs = [a]; const t = textOf(acts.get(a).d); title = t.split('\n')[0]; creator = signerOf(a); spec_hash = specHash(t, creator, 0); }
  if (h.terms) { termsId = full(h.terms); ownActs.push(termsId); creator = signerOf(termsId); }
  if (h.hash) { spec_hash = h.hash; }
  if (h.title) title = h.title; if (h.creator !== undefined && !h.act) creator = h.creator;
  const own = new Set(ownActs);
  const hashes = [spec_hash, h.stand_in].filter(Boolean);
  const byHash = hashes.map((x) => ({ hash: x, role: x === h.stand_in ? 'stand-in hash its acts are typed under' : h.act ? 'spec hash (kind 0) computed from creator, kind and text' : h.hash === x && h.stand_in_check ? 'stand-in hash' : 'spec hash, as named', use: useByHash(x, own) }));
  const first = ownActs.length ? ownActs.reduce((a, b) => (minArrival(a) <= minArrival(b) ? a : b)) : null;
  const t = h.act ? textOf(acts.get(full(h.act)).d) : null;
  return {
    title, creator, creator_window_inferred: creator ? windowOf[creator] ?? (creator === POSTMARK ? 'postmark (by its reports)' : null) : null, kind: h.act ? kind : null,
    spec_hash, act: h.act ? full(h.act) : termsId, acts_same_text: ownActs, text_bytes: t ? Buffer.byteLength(t) : null,
    named: byHash.some((b) => b.use.acts) ? 'named' : 'never named',
    first_seen: first ? Object.fromEntries(Object.entries(acts.get(first).seen).map(([hm, a]) => [hm, a[0]]).sort()) : null,
    work: h.work, drafts: { earlier: [], later: [], replaces_by_its_words: [], other_work_quoted_near_replace_not_linked: [] },
    use: byHash[0]?.use ?? null, answers_to_its_act: null, built_on_by: null, apps_naming: null, fault_candidates: null, category: null,
    hand: { id: h.id, fingerprint: h.fingerprint ?? null, why_missed: h.why, read: h.read ?? null, stand_in: h.stand_in ?? (h.stand_in_check ? spec_hash : null), stand_in_check: h.stand_in_check ?? null,
      terms: termsId, words_text_act: h.terms ? full(h.act) : null, text_in_copy: !!h.act, by_hash: byHash,
      by_act: ownActs.length ? useByAct(ownActs, own, creator) : null, by_name: useByName(h.name, own, creator),
      note_on_fields: 'Fields the script computes only for its own records (answers_to_its_act, built_on_by, apps_naming, fault_candidates, category) are null here: not computed.' },
  };
}
const handRecords = HAND.map(handRecord);
// drafts within the added works: by draft number in the title, else by first arrival
const byWork = {}; for (const r of handRecords) (byWork[r.work] ??= []).push(r);
const dn = (r) => Number(r.title.match(/\b(?:draft|version)\s+(\d+)/i)?.[1] ?? NaN);
for (const list of Object.values(byWork)) {
  list.sort((a, b) => (dn(a) - dn(b)) || ((a.first_seen ? Math.min(...Object.values(a.first_seen)) : 0) - (b.first_seen ? Math.min(...Object.values(b.first_seen)) : 0)));
  const key = (r) => r.spec_hash ?? r.act;
  list.forEach((r, i) => { r.drafts.earlier = list.slice(0, i).map(key); r.drafts.later = list.slice(i + 1).map(key); });
}
handRecords.find((r) => r.hand.id === 'keep-recovery-2b').drafts.replaces_by_its_words = [handRecords.find((r) => r.hand.id === 'keep-recovery-2a').spec_hash];

// ------------------------------------------------------------------ areas (proposals)
const WEBCAT = ['identity safety', 'finding and reading', 'open books', 'record and time', 'homes and the way out'];
const M = (n) => `${n}. ${PAYCAT[n]}`, L = (n) => `${n}. ${LAWCAT[n]}`;
// This session's proposals where the Dubs disagree, a text sits in none, or the owner did not give a category. Every one is a proposal.
const PROPOSE = {
  '058d65d4:hours of care': ['Money', M(2), 'a balance of hours swapped among members is mutual credit; no sats move, so open books and consent keep pointers'],
  '11e77c4b:custody receipt': ['Web', 'record and time', 'a receipt of records handed between keepers, read by anyone: record and time, not Terms between people'],
  '11e77c4b:guide spot': ['Money', M(1), 'a spot paid to whoever led a buyer to a sale, the same shape as the client spot DubPay placed in splits and payouts'],
  '21a3f657:proven claim': ['Web', 'record and time', 'it recovers nothing and needs no Terms: it writes a proven debt where later buyers read it'],
  '28070ee8:delivery receipt': ['Web', 'open books', 'receipts of delivery that anyone reads; refunds and Terms hang on it, but its task is the public record'],
  '2c381cf6:the lending shelf': ['Agreements', L(4), 'lending a thing between neighbours under Terms, with no money moving; DubPay\'s loans and returns keeps a pointer'],
  '3022fb29:home bond': ['Money', M(3), 'money set aside and held for a home\'s residents; homes and the way out keeps a pointer'],
  '762c0b4c:open books': ['Web', 'open books', 'a purse shown in the open is DubWeb\'s own open books; pools keep a pointer'],
  '84ae1e82:the client that served the payment': ['Money', M(1), 'a spot that pays the client which served a payment: a payout share'],
  'b1895259:lineup vote': ['Agreements', L(2), 'a group\'s vote under Terms is a collective\'s rule; DubWeb and DubLaw each placed it with the other'],
  'ddafffcd:held for you': ['Money', M(3), 'a holder\'s public admission of money it holds for others: money held; open books keeps a pointer'],
  'f1de20f8:findings held in trust': ['Web', 'identity safety', 'holding a found flaw until those at risk are warned protects people\'s identities; disputes keep a pointer'],
  '76a78f70:room let': ['Agreements', L(4), 'a let between two people in plain words; its deposit is held under the escrow cMIP, which stays Money'],
  'b820fe4b:handover check': ['Web', 'homes and the way out', 'checks that a closing home\'s acts were carried to a staying home: a home\'s way out'],
  'a83df2c7:keep recovery': ['Web', 'identity safety', 'getting an identity back to the right person: identity safety'],
  '3022fb29:until home policy': ['Web', 'homes and the way out', 'a home\'s published policy: what it keeps, logs and promises its residents'],
  '611acc3e:ring of names': ['Web', 'identity safety', 'what to believe about an identity if it is taken, lost or silent'],
  'd79c1ba7:word in advance': ['Web', 'identity safety', 'what to believe about an identity if it is taken, lost or silent'],
  'genesis:anchoring': ['Web', 'record and time', 'proof that acts existed by a block: time to the world'],
  'postmark:place': ['Web', 'record and time', 'a place that orders acts between signers and answers by when'],
};
function propose(rec) {
  const keys = [rec.spec_hash, ...(rec.acts_same_text ?? []), rec.hand?.stand_in, rec.hand?.words_text_act, rec.hand?.fingerprint].filter(Boolean);
  const pl = placementsOf(keys);
  const pos = [...new Set(Object.values(pl).map((p) => p?.area).filter((a) => ['Money', 'Agreements', 'Web'].includes(a)))];
  const neg = Object.values(pl).filter((p) => p?.area === 'not Money (beside)').length ? ['Money'] : [];
  const mine = PROPOSE[rec.work];
  let area, cat, src, why = null, settle = [];
  if (pos.length === 1 && !(mine && mine[0] !== pos[0])) {
    area = pos[0];
    const owner = { Web: 'DubWeb', Money: 'DubPay', Agreements: 'DubLaw' }[area];
    if (pl[owner]?.area === area) { cat = pl[owner].category; src = `${owner}'s wave-2 placement`; }
    else { cat = mine?.[1] ?? null; src = `this session (${owner} did not place it in wave 2); proposal`; }
    if (neg.includes(area)) settle.push('DubPay set it beside Money, yet it is proposed Money');
  } else {
    area = mine?.[0]; cat = mine?.[1]; why = mine?.[2]; src = 'this session; proposal';
    if (pos.length > 1) settle.push(`placed in ${pos.join(' and ')} by different Dubs`);
    if (pos.length === 0) settle.push('placed in no area by any Dub in wave 2');
    if (pos.length === 1) settle.push(`only ${pos[0]} placed it; this session reads it as ${mine[0]}`);
  }
  if (!area) throw new Error('no area for ' + rec.title);
  if (area === 'Web' && !WEBCAT.includes(cat)) throw new Error('web category ' + cat);
  return { area, area_category: cat, area_category_source: src, area_reason: why, placements_wave_2: pl, to_settle: settle.length ? { why: settle, disagreement: Object.fromEntries(Object.entries(pl).map(([d, p]) => [d, p ? `${p.area ?? 'no area'}: ${p.category}` : 'not listed'])) } : false };
}

// ------------------------------------------------------------------ prompted (from notices 7 and 8, and the day-five brief as reports describe it)
const N8 = { '218a2a93:shower work': '04c3185f', '762c0b4c:public flow': '479417d9', '880d33f2:the straight split': '767b0984' };
// Day five: read by hand in each creator's day-5-window-1 report, where it presents the text as that window's build for the brief.
const D5 = { '9b6627e3': 'turnstile', '5102247f': 'dublaw', 'd6647391': 'followers', 'fa31564e': 'public-creators', 'e5d774d2': 'steward-and-co', '9cbdffb3': 'until', '17be23b6': 'dubweb',
  '15d03f0c': 'plain-words', '526f4947': 'plain-words', '2f929cb5': 'ampersand', '710de023': 'backlot', 'bba5c058': 'dubpay', 'ea275eab': 'the-back-row', '3ce77ad5': 'hop', 'ad3b8e7f': 'stall',
  'cd31320b': 'counterparty', '3f9351b0': 'longhouse', 'f2b809a2': 'keep', '34d68932': 'public-50-plus' };
const D5WORKS = new Set();
function prompted(rec) {
  const ids = (rec.acts_same_text ?? []).map((a) => a.slice(0, 8));
  if (N8[rec.work]) return rec.spec_hash.startsWith(N8[rec.work]) ? { prompted: 'yes', basis: 'notice 8 (attack the shower) names this draft' } : { prompted: 'work', basis: `notice 8 names draft spec ${N8[rec.work]}… of this work, not this draft` };
  const hit = ids.find((a) => D5[a]);
  if (hit) return { prompted: 'yes', basis: `day-five brief ("something MOR has not been used for this round", as the reports say it): ${D5[hit]}'s day-5-window-1 report presents it as its build; read by hand` };
  return null;
}
const all = [...run.specifications.map((r) => ({ ...r, added_by_hand: false })), ...handRecords.map((r) => ({ ...r, added_by_hand: true }))];
for (const r of all) { const p = prompted(r); if (p?.prompted === 'yes' && p.basis.startsWith('day-five')) D5WORKS.add(r.work); }
D5WORKS.add('611acc3e:ring of names'); // draft 1 of Beatrice's ring (34d68932) was public-50-plus's build; draft 1 is not in this inventory

// ------------------------------------------------------------------ the records
const out = all.map((r) => {
  const a = propose(r);
  let p = prompted(r) ?? (D5WORKS.has(r.work) ? { prompted: 'work', basis: 'an earlier or later draft of this work answered the day-five brief' } : { prompted: 'no', basis: null });
  const by_act = r.added_by_hand ? r.hand.by_act : useByAct(r.acts_same_text, new Set(r.acts_same_text), r.creator);
  const uses = { by_hash: r.added_by_hand ? r.hand.by_hash.reduce((n, b) => n + b.use.acts, 0) : r.use.acts, by_act: by_act?.acts ?? null, by_name: r.added_by_hand ? r.hand.by_name?.acts ?? null : null };
  const rec = { ...r, area: a.area, area_category: a.area_category, area_category_source: a.area_category_source, area_reason: a.area_reason,
    added_by_hand: r.added_by_hand ? { why_missed: r.hand.why_missed, read: r.hand.read } : false,
    prompted: p.prompted, prompted_basis: p.basis, to_settle: a.to_settle, placements_wave_2: a.placements_wave_2,
    uses_wave_3: { ...uses, by_act_detail: r.added_by_hand ? undefined : by_act, caveat: CAVEAT } };
  return rec;
});

// ------------------------------------------------------------------ version 2: the two slice checks, applied
// LAW = DubLaw's slice check (_team/dublaw/wave-3/slice-check.md, 25 November 2026), with DubWeb's answer on MOR (26 November):
//   "concede the 4 contested (delivery receipt d1-2, Proven claim d1-2) to Agreements; DubWeb shows them, seam named in both catalogues.
//    Your 6 additions and the lineup vote accepted."
// PAY = DubPay's slice check (_team/dubpay/wave-3/results/A/slice-check.md, 22 November 2026), its sections 1 to 3.
// A record leaves "to settle" only where every Dub's latest word (a wave-3 check where it speaks, else wave 2) names one area.
// Nothing is decided: an area is still a proposal.
const LAW = 'DubLaw\'s slice check (_team/dublaw/wave-3/slice-check.md)';
const PAY = 'DubPay\'s slice check (_team/dubpay/wave-3/results/A/slice-check.md)';
const CHECKS = {
  'b1895259:lineup vote': { area: 'Agreements', cat: L(2), settled: true, by: [LAW], says: 'Accepted into Agreements: lineup vote, drafts 1 to 4. "A group\'s vote under Terms is a collective\'s rule (category 2)." DubWeb accepted (26 November).' },
  '28070ee8:delivery receipt': { area: 'Agreements', cat: L(4), settled: true, seam: 'seam with DubWeb', by: [LAW], says: 'Contested, kept in Agreements: "The receipt is what an agreement\'s performance is proven by … DubWeb shows it. Seam with DubWeb." DubWeb conceded (26 November). DubPay had set it beside Money ("Web or Agreements (theirs to settle)").' },
  '21a3f657:proven claim': { area: 'Agreements', cat: L(3), settled: true, seam: 'seam with DubWeb', by: [LAW, PAY], says: 'Contested, kept in Agreements: "It settles a claim … that is disputes, category 3. The register that later buyers read is DubWeb\'s. Seam with DubWeb." DubWeb conceded (26 November). DubPay proposed Web with a pointer from Money 4; its pointer stands.' },
  'f1de20f8:findings held in trust': { area: 'Web', cat: 'identity safety', settled: true, by: [LAW], says: 'Conceded to Web by DubLaw ("identity safety"). DubPay does not list it.' },
  '11e77c4b:custody receipt': { area: 'Web', cat: 'record and time', settled: true, by: [LAW, PAY], says: 'Conceded to Web by DubLaw ("record and time"); DubPay proposes "Web: record and time; no Money pointer".' },
  'b820fe4b:handover check': { area: 'Web', cat: 'homes and the way out', settled: true, by: [LAW], says: 'Conceded to Web by DubLaw ("a home\'s way out"). DubPay does not list it.' },
  '058d65d4:hours of care': { area: 'Money', cat: M(2), settled: true, by: [LAW, PAY], says: 'Conceded to Money by DubLaw ("mutual credit"); DubPay proposes "Money: 2 … pointers from Web (open books) and Agreements (4)". DubWeb\'s wave-2 placement was Web; its wave-3 inventory already proposed Money.' },
  'ddafffcd:held for you': { area: 'Money', cat: M(3), settled: true, by: [LAW, PAY], says: 'Conceded to Money by DubLaw ("money held"); DubPay proposes "Money: 3. Money held; pointer from Web (open books)". DubWeb\'s wave-2 placement was Web; its wave-3 inventory already proposed Money.' },
  '84ae1e82:the client that served the payment': { area: 'Money', cat: M(1), settled: true, by: [LAW, PAY], says: 'Conceded to Money by DubLaw ("a payout share"); DubPay proposes "Money: 1 … pointer from Agreements (1)".' },
  '11e77c4b:guide spot': { area: 'Money', cat: M(1), settled: true, by: [LAW, PAY], says: 'Conceded to Money by DubLaw ("a payout share"). DubPay: "One is only in the inventory: guide spot (Turnstile), which B missed"; it proposes "Money: 1. Splits and payout services".' },
  '3022fb29:home bond': { area: 'Money', cat: M(3), settled: true, by: [PAY], says: 'DubPay proposes "Money: 3. Money held; pointer from Web (homes)". DubLaw placed it "other: DubPay" in wave 2 and does not contest it. DubWeb\'s wave-2 placement was Web; its wave-3 inventory already proposed Money.' },
  '762c0b4c:open books': { area: 'Web', cat: 'open books', settled: true, by: [PAY], says: 'DubPay proposes "Web: open books; pointer from Money 2". DubLaw placed it "other: DubWeb" in wave 2.' },
  '2c381cf6:the lending shelf': { area: 'Agreements', cat: L(4), settled: true, by: [PAY, LAW], says: 'DubPay proposes "Agreements: 4 … pointer from Money 5"; it is among DubLaw\'s 37 agreed.' },
  '76a78f70:room let': { area: 'Agreements', cat: L(4), settled: true, by: [PAY, LAW], says: 'DubPay proposes "Agreements: 4 … pointer from Money 3"; it is among DubLaw\'s 37 agreed.' },
  '880d33f2:the straight split': { mark: 'two drafts titled "draft 6"', by: [PAY], says: 'DubPay traced it: "the straight split has two drafts titled \'draft 6\'" (7e0ac8f1 and 333bdbc7). Opened here: Counterparty\'s act 7555d468…f119 calls spec 47c874cb… "straight split draft 7 as first published (spec 47c874cb…, now withdrawn)", whose text "differs from the withdrawn one in the first line only, \'draft 6\' to \'draft 7\'" (reissued as act b9e43db4…, spec e51e8653…). So 333bdbc7 is draft 7 under a wrong title; a join by title merges it with draft 6.', titles: ['the straight split, draft 6'] },
  'hosts:report block': { mark: 'the kit\'s own spec', by: [PAY], says: 'DubPay traced it: "the report block is the kit\'s own spec, with no act"; its spec hash "equals the core library\'s report spec".' },
};
for (const h of HAND.filter((x) => x.why === DUBLAW_WHY)) CHECKS[h.work] = { settled: true, added: true, by: [LAW], says: 'To add to Agreements: "the six texts named only by act id. Each answers an Agreements socket." DubWeb accepted (26 November).' };
for (const r of out) {
  const c = CHECKS[r.work];
  if (c && (!c.titles || c.titles.some((t) => (r.title ?? '').includes(t)))) {
    if (c.area) { r.area = c.area; r.area_category = c.cat; r.area_category_source = `${c.by.join('; ')}; proposal`; }
    if (c.settled && r.to_settle) r.to_settle_in_version_1 = r.to_settle;
    if (c.settled) r.to_settle = false;
    r.seam = c.seam ?? null;
    r.checks_wave_3 = { by: c.by, says: c.says, marks: [c.seam, c.mark, c.added ? 'added by hand: named by act id only' : null].filter(Boolean) };
  } else {
    r.seam = null;
    if (r.to_settle) r.checks_wave_3 = { by: [], says: 'Neither slice check speaks to it: DubPay\'s does not list it as Money, and DubLaw\'s 58 do not hold it. It stays to settle, as version 1 had it.', marks: [] };
    else r.checks_wave_3 = null;
  }
}

// ------------------------------------------------------------------ what a Dub listed in wave 2 that is not a text here
const keysHere = new Set(out.flatMap((r) => [r.spec_hash, ...(r.acts_same_text ?? []), r.hand?.stand_in, r.hand?.words_text_act, r.hand?.terms, r.hand?.fingerprint].filter(Boolean)));
const notHere = [];
/** Why the script has no record for a text act a Dub listed: read from the copy, by code. */
function whyNotHere(actId) {
  if (!actId) return 'no text act given';
  if (!acts.has(actId)) return 'not a public act in any home\'s feed in the copy (the script reads windows\' acts/ only to infer windows)';
  const x = acts.get(actId); const t = textOf(x.d); if (t === null) return 'not a text act';
  const h = specHash(t, x.d.signer, 0); const bySpec = (named.get(h) ?? []).filter(([a]) => a !== actId).length; const byAct = new Set((named.get(actId) ?? []).map(([a]) => a)).size;
  return `a text act whose spec hash (${shortOf(h)}) no act names (${bySpec}), while ${byAct} acts name its act id; its first line does not begin "# cMIP" or "# Module"`;
}
const missingText = (dub, e, actId, extra) => ({ dub, ...extra, text_act: actId ?? null, why_the_script_has_no_record: whyNotHere(actId), text_missed_by_the_script: !!actId });
for (const e of pay.entries) { const ks = (e.drafts ?? []).flatMap((d) => [d.spec, d.act, d.wordsTextAct]).filter(Boolean); if (!ks.some((k) => keysHere.has(k))) { const d = (e.drafts ?? []).find((y) => y.act) ?? {}; notHere.push(missingText('DubPay', e, ['text', 'script'].includes(e.kind) ? d.act : null, { entry: e.key, name: e.name, kind: e.kind, category: `${e.category}. ${PAYCAT[e.category]}`, wave_2_note: e.kind === 'terms' ? 'Terms whose words are a text act' : e.kind === 'media' ? 'an app (media), not a text' : null })); } }
for (const e of law.entries) { const ks = [e.fingerprint, e.specHash, e.publishedBy, ...(e.sameTextAs ?? [])].filter((k) => typeof k === 'string'); if (!ks.some((k) => keysHere.has(k))) notHere.push(missingText('DubLaw', e, e.publishedBy, { fingerprint: e.fingerprint, title: e.title, named_as: e.namedAs, held: e.held, sockets: e.sockets, category: String(e.category) })); }
for (const x of notHere) if (x.dub === 'DubPay' && x.kind !== 'text') x.text_missed_by_the_script = false; // apps, programs and Terms: not specification texts

const missed = notHere.filter((x) => x.text_missed_by_the_script); const missedTexts = new Set(missed.map((x) => x.text_act)).size;
const result = { ...run,
  about: 'DubWeb wave 3, inventory version 2 (session F; version 1 by session A): the shared inventory of round two\'s specification texts, for DubPay, DubLaw and DubWeb. Every field inventory.mjs wrote is kept as it wrote it (see inventory-run.json); records added by hand follow, marked. Areas and categories are proposals. ' + CAVEAT,
  wave_3: { script_output: 'inventory-run.json (inventory.mjs, run once; this file = that output + the fields below)', added_fields: ['area', 'area_category', 'area_category_source', 'area_reason', 'added_by_hand', 'prompted', 'prompted_basis', 'to_settle', 'placements_wave_2', 'uses_wave_3', 'hand (added records only)', 'version 2: seam, checks_wave_3, to_settle_in_version_1'],
    note: 'category is the script\'s own field (DubWeb\'s wave-2 category); the proposed area\'s category is area_category.', caveat: CAVEAT,
    in_a_dubs_wave_2_listing_not_a_text_here: notHere },
  specifications: out };
writeFileSync('inventory-all.json', JSON.stringify(result, null, 1) + '\n');
writeFileSync('add-by-hand.json', JSON.stringify({ about: 'Texts added by hand to inventory-all.json, why the script missed each, what was read, and use counted by hash, by act id and by name in words, kept apart. ' + CAVEAT,
  texts: out.filter((r) => r.added_by_hand).map((r) => ({ id: r.hand.id, title: r.title, creator: r.creator, spec_hash: r.spec_hash, acts: r.acts_same_text, terms: r.hand.terms, words_text_act: r.hand.words_text_act,
    text_in_copy: r.hand.text_in_copy, why_missed: r.hand.why_missed, read: r.hand.read, stand_in: r.hand.stand_in, stand_in_check: r.hand.stand_in_check,
    use_by_spec_hash: r.hand.by_hash.map((b) => ({ hash: b.hash, role: b.role, acts: b.use.acts, by_way: b.use.by_way, identities: b.use.identities })),
    use_by_act_id: r.hand.by_act && { ...r.hand.by_act, acts_naming: undefined }, use_by_name: r.hand.by_name && { ...r.hand.by_name, acts_naming: undefined },
    area: r.area, area_category: r.area_category, to_settle: !!r.to_settle, prompted: r.prompted })) }, null, 1) + '\n');

// ------------------------------------------------------------------ markdown
const cut = (h) => (h ? shortOf(h) : '—');
const who = (c) => (c ? c.slice(0, 8) + (windowOf[c] ? ` (${windowOf[c]})` : c === POSTMARK ? ' (postmark)' : '') : '— (not in the copy)');
const draftsOf = (r) => { const n = 1 + r.drafts.earlier.length + r.drafts.later.length; return `${r.drafts.earlier.length + 1} of ${n}`; };
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/^#+\s*/, '');
const row = (r) => `| ${esc(r.title).slice(0, 110)} | ${who(r.creator)} | ${draftsOf(r)} | \`${cut(r.spec_hash)}\`${r.hand?.stand_in && r.hand.stand_in !== r.spec_hash ? ` (stand-in \`${cut(r.hand.stand_in)}\`)` : ''} | ${r.uses_wave_3.by_hash} | ${r.uses_wave_3.by_act ?? '—'} | ${r.uses_wave_3.by_name ?? '—'} | ${r.prompted} | ${r.to_settle ? 'to settle' : ''}${r.added_by_hand ? ' · added by hand' + (r.hand?.why_missed === DUBLAW_WHY ? ' (named by act id only; DubLaw\'s check)' : '') : ''}${r.seam ? ' · **' + r.seam + '**' : ''}${r.checks_wave_3?.marks?.some((m) => /draft 6|kit\'s own/.test(m)) ? ' · ' + r.checks_wave_3.marks.join('; ') : ''} |`;
const HEAD = '| Title | Creator (window, inferred) | Draft | Spec hash | Uses by hash | by act | by name | Prompted | Notes |\n|---|---|---|---|---|---|---|---|---|';
const order = (a, b) => a.area_category.localeCompare(b.area_category) || a.work.localeCompare(b.work) || a.drafts.earlier.length - b.drafts.earlier.length;
const AREAS = { Money: 'DubPay', Agreements: 'DubLaw', Web: 'DubWeb' };
const counts = {}; for (const r of out) { ((counts[r.area] ??= {})[r.area_category] ??= 0); counts[r.area][r.area_category]++; }
const slice = (area) => {
  const rs = out.filter((r) => r.area === area).sort(order);
  let s = `# ${area}: ${AREAS[area]}'s slice of the shared inventory\n\n*DubWeb wave 3, inventory version 2 (session F, 26 November 2026; version 1 by session A, 22 November). Nobody, allegedly. ${rs.length} texts proposed for ${area}; ${rs.filter((r) => r.to_settle).length} to settle. Areas and categories are proposals: ${AREAS[area]} checks this slice.*\n\n`;
  s += `**${CAVEAT}**\n\nUses by hash: acts naming its spec hash (or stand-in) other than its own, as inventory.mjs counts them. By act: acts naming its act id whole, in short form, or by its first 8 characters in words. By name: acts whose words name it (added texts only; the pattern is in add-by-hand.json). Prompted: yes = named or answered in a hosts' prompt; work = another draft of the same work was.\n\n`;
  for (const [c] of Object.entries(counts[area]).sort()) { s += `## ${c}\n\n${HEAD}\n`; for (const r of rs.filter((x) => x.area_category === c)) s += row(r) + '\n'; s += '\n'; }
  const ts = rs.filter((r) => r.to_settle); if (ts.length) { s += '## To settle in this slice\n\n'; for (const r of ts) s += `- **${esc(r.title).slice(0, 90)}** (\`${cut(r.spec_hash)}\`): proposed ${r.area}, ${r.area_category}. ${r.area_reason ? r.area_reason + "." : ''} To settle: ${r.to_settle.why.join('; ')}. Wave 2: ${Object.entries(r.to_settle.disagreement).map(([d, p]) => `${d} ${p}`).join('; ')}.\n`; }
  return s;
};
for (const a of Object.keys(AREAS)) writeFileSync(`${a.toLowerCase()}.md`, slice(a));

const total = out.length, hand = out.filter((r) => r.added_by_hand), settle = out.filter((r) => r.to_settle);
const works = (rs) => new Set(rs.map((r) => r.work)).size;
let md = `# The shared inventory of round two's specification texts\n\n*DubWeb wave 3, inventory version 2 (session F, 26 November 2026), beside version 1 (session A, 22 November, in ../inventory/, unchanged). Nobody, allegedly. For DubPay, DubLaw and DubWeb. Version 2 applies DubLaw\'s and DubPay\'s slice checks; every record that moved is in changes.md. Files: inventory-all.json, add-by-hand.json, money.md, agreements.md, web.md, changes.md, inventory.mjs (the copy run), wave3.mjs, changes.mjs.*\n\n`;
md += `## 1. In plain words\n\n`;
md += `1. **${total} texts in one list**: the ${run.specifications.length} that inventory.mjs finds by code, and ${hand.length} added by hand, each marked with why the script missed it. The kit's core agrees with every one of the script's ${run.decoder.kit.spec_hashes} spec hashes (${run.decoder.kit.spec_hashes_agreeing} of ${run.decoder.kit.spec_hashes}).\n`;
md += `2. **Each text has one proposed area**: Money ${out.filter((r) => r.area === 'Money').length}, Agreements ${out.filter((r) => r.area === 'Agreements').length}, Web ${out.filter((r) => r.area === 'Web').length}. Where the three Dubs' wave-2 placements agree, the area is theirs; ${settle.length} texts (${works(settle)} works) are **to settle**: the Dubs disagree, or no Dub placed them.\n`;
md += `3. **Four texts are used but not held.** The report block (proposal 4) and Postmark's place drafts 1 and 4 are used under their hashes by ${hand.filter((r) => !r.hand.text_in_copy && r.spec_hash).map((r) => r.uses_wave_3.by_hash).reduce((a, b) => a + b, 0)} acts, but no text of theirs is in the copy; draft 3's text is in the copy and its acts use a stand-in hash. Postmark's three stand-ins are SHA-256 of a fixed string, checked here, so e8891459…0efc is draft 1 by computation, not only inferred. Longhouse's anchoring cMIP draft 8 is applied in every Longhouse anchor from the third on, but its text is not in the copy at all.\n`;
md += `4. **Two texts are Terms, not text acts**: Beatrice's ring of names (version 2) and Odile Ferrant's word in advance. Their Terms name the MOR work hash of a text act, and no spec hash, so a reader by spec hash never finds them. **Found, not added:** ${missedTexts} more texts that DubPay or DubLaw listed in wave 2 have no record here, most because acts name them by act id, not by spec hash (section 4).\n`;
md += `5. **A use count is not a check.** ${CAVEAT} The hosts' prompts asked for three texts by name (notice 8: shower work draft 5, public flow draft 3, straight split draft 4); notice 7 asked for apps, not texts; the day-five brief asked for something new and named no text, and ${out.filter((r) => r.prompted === 'yes' && /day-five/.test(r.prompted_basis)).length} texts here answer it.\n\n`;
md += `## 2. Totals per area and category\n\n| Area | Category | Texts | of which to settle | added by hand |\n|---|---|---|---|---|\n`;
for (const a of Object.keys(AREAS)) { for (const [c, n] of Object.entries(counts[a]).sort()) md += `| ${a} | ${c} | ${n} | ${out.filter((r) => r.area === a && r.area_category === c && r.to_settle).length} | ${out.filter((r) => r.area === a && r.area_category === c && r.added_by_hand).length} |\n`;
  md += `| **${a}** | **all** | **${out.filter((r) => r.area === a).length}** | ${out.filter((r) => r.area === a && r.to_settle).length} | ${out.filter((r) => r.area === a && r.added_by_hand).length} |\n`; }
md += `| **all** | | **${total}** | ${settle.length} | ${hand.length} |\n\nWorks (drafts of one text by one creator counted once): Money ${works(out.filter((r) => r.area === 'Money'))}, Agreements ${works(out.filter((r) => r.area === 'Agreements'))}, Web ${works(out.filter((r) => r.area === 'Web'))}.\n\n`;
md += `## 3. To settle\n\nOne line per work; every draft of the work is marked in the JSON. Wave 2 placements: DubWeb's inventory-web.json, DubPay's listing-money.json, DubLaw's listing-agreements.json.\n\n| Work (drafts) | Proposed | Why | DubWeb | DubPay | DubLaw |\n|---|---|---|---|---|---|\n`;
const seen = new Set();
for (const r of settle.sort(order)) { if (seen.has(r.work)) continue; seen.add(r.work); const n = settle.filter((x) => x.work === r.work).length; const d = r.to_settle.disagreement;
  md += `| ${esc(r.title).slice(0, 70)} (${n}) | ${r.area}: ${r.area_category} | ${r.area_reason}; ${r.to_settle.why.join('; ')} | ${d.DubWeb} | ${d.DubPay} | ${d.DubLaw} |\n`; }
md += `\n## 4. Added by hand\n\nEach is in inventory-all.json with \`added_by_hand\` and in add-by-hand.json with what was read. Use is counted three ways and kept apart. ${CAVEAT}\n\n| Text | Creator | Act / Terms | Spec hash (stand-in) | In the copy | Why missed | by hash | by act | by name |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const r of hand) md += `| ${esc(r.title).slice(0, 80)} | ${who(r.creator)} | ${r.hand.terms ? `Terms \`${cut(r.hand.terms)}\`, words \`${cut(r.hand.words_text_act)}\`` : r.act ? `\`${cut(r.act)}\`` : '—'} | \`${cut(r.spec_hash)}\`${r.hand.stand_in && r.hand.stand_in !== r.spec_hash ? ` (\`${cut(r.hand.stand_in)}\`)` : ''} | ${r.hand.text_in_copy ? 'yes' : '**no**'} | ${r.hand.why_missed.startsWith('in the run') ? 'draft-titled, never named, no "# cMIP" heading' : r.hand.why_missed.split(':')[0]} | ${r.uses_wave_3.by_hash} | ${r.uses_wave_3.by_act ?? '—'} | ${r.uses_wave_3.by_name ?? '—'} |\n`;
md += `\nWhat was read, for each:\n\n`; for (const r of hand) md += `- **${esc(r.title).slice(0, 80)}**: ${r.hand.read ?? 'its text act, as the run listed it.'}${r.hand.stand_in_check ? ' ' + r.hand.stand_in_check + '.' : ''}\n`;
md += `\n### Found missing, not added\n\nTexts that a Dub's wave-2 listing holds and the script does not, found by this session's cross-check. Not added: the order named what to add. DubWeb decides whether a rerun adds them.\n\n| Text | Listed by | Text act | Why the script has no record (by code) |\n|---|---|---|---|\n`;
for (const x of missed) md += `| ${esc(x.title ?? x.name ?? x.fingerprint).slice(0, 80)} | ${x.dub}${x.fingerprint ? ' `' + x.fingerprint.slice(0, 8) + '` (' + x.named_as + ')' : ''}${x.category ? ' (' + x.category + ')' : ''}${x.sockets ? ', sockets ' + JSON.stringify(x.sockets) : ''} | \`${cut(x.text_act)}\` | ${x.why_the_script_has_no_record} |\n`;
md += `\n## 5. Method and caveats\n\n`;
md += `- **The run.** inventory.mjs (DubWeb wave 2, copied unchanged) was run once over all of _research/ with DubPay's wave-2 kit beside it as kit/: ${run.read.public_acts_distinct} distinct public acts from ${run.read.items} items (${run.read.sealed_items_not_opened} sealed items and ${run.read.private_acts_not_opened} private acts not opened); ${run.specifications.length} specifications; self-checks ${run.self_check.filter((c) => c.passed).length} of ${run.self_check.length} passed. The kit cross-check: ${run.decoder.kit.spec_hashes_agreeing} of ${run.decoder.kit.spec_hashes} spec hashes agree, ${run.decoder.kit.spec_contents_refused_by_core} refused. Its output is kept as inventory-run.json; inventory-all.json is that output with fields added, never changed (the script's own \`category\` field is DubWeb's wave-2 category; the proposed one is \`area_category\`).\n`;
md += `- **The additions.** wave3.mjs reads the same copy through read-copy.mjs (lines 21 to 208 of inventory.mjs, unchanged) and counts, for each added text: use by spec hash (the script's own rule), by act id (whole, short form, or the first 8 characters in words), and by name in words (a pattern per work, given in add-by-hand.json). The three are kept apart and overlap. By name counts per work, not per draft, and a pattern can catch a mention that is not a use. By act is counted for the script's texts too; by name only for the added ones.\n`;
md += `- **Areas.** placements.mjs reads the three wave-2 files and finds each text by spec hash, act id or words act. Where every Dub that placed a text put it in one area, that area stands and the owning Dub's category with it (or this session's, marked, where the owner did not place it). DubPay's "beside" list counts as "not Money". Otherwise this session proposes one area with a one-line reason and marks it to settle. Nothing is decided.\n`;
md += `- **Prompted.** Notice 7 (apps in your tray) asks teams to build and offer apps, and names Dubsar's Dub and Damgar: apps, not texts, so no text here is prompted by it. Notice 8 (attack the shower) names shower work draft 5, public flow draft 3 and straight split draft 4: marked "yes"; their other drafts "work". The day-five prompt: no day-5-window-1 report quotes it whole. They describe it: "build something MOR has not been used for" (The Back Row; Ampersand, Backlot, DubLaw, DubWeb, Pointer, Plain Words and Until in nearly the same words), "what else can MOR say" (Keep), "History that outlives its keeper" (Postmark's own brief), work that "helps others more than it earns" (Stall), and the succession drill for the home companies (Turnstile, Stall, Longhouse, Until). It named no text, so "prompted: yes" for day five means the creator's own day-5-window-1 report presents the text as its build for the brief: read by hand, listed in wave3.mjs (D5). brief-day-five.md itself was not used as the source, as the order asked.\n`;
md += `- **Not here, though a Dub listed it in wave 2**: ${notHere.length} entries (DubPay ${notHere.filter((x) => x.dub === 'DubPay').length}, DubLaw ${notHere.filter((x) => x.dub === 'DubLaw').length}): ${missed.length} entries are ${missedTexts} texts the script missed (section 4); the rest are apps, programs, Terms whose words are text acts, or not held. All are in inventory-all.json under wave_3.in_a_dubs_wave_2_listing_not_a_text_here. None was added.\n`;
md += `  ${notHere.map((x) => x.dub === 'DubPay' ? `DubPay ${x.entry} (${x.kind})` : `DubLaw \`${x.fingerprint.slice(0, 8)}\` ${x.title ? esc(x.title).slice(0, 40) : '(' + x.named_as + ')'}`).join('; ')}.\n`;
md += `- **Limits.** Counts come from code; areas, categories, the day-five list and the reasons are readings. The window of a creator is inferred by the script. Draft 1 of Beatrice's ring and Postmark's drafts 2 and 5 are named but not added. Rerun: \`node inventory.mjs --research ~/Documents/mor-round-2/_research --out inventory-run.json\`, then \`MOR_RESEARCH=~/Documents/mor-round-2/_research node wave3.mjs\`.\n`;
writeFileSync('inventory-all.md', md);
console.log(`${out.length} records (${hand.length} by hand); Money ${out.filter((r) => r.area === 'Money').length}, Agreements ${out.filter((r) => r.area === 'Agreements').length}, Web ${out.filter((r) => r.area === 'Web').length}; to settle ${settle.length}; not here ${notHere.length}`);
