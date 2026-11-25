// Renders slice-check.md from the object slice-check.mjs builds. No counting here: every number comes from `o`.
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const s8 = (h) => (h ? h.slice(0, 8) : '—');
const shortTitle = (t) => esc(String(t ?? '').replace(/^#\s*/, '').replace(/^cMIP:?\s*/i, '')).slice(0, 70);

export function renderMd(o) {
  const S = o.summary, L = o.lines;
  const by = (st) => L.filter((l) => l.status === st);
  const invOnly = by('in the inventory only');
  const bOnly = by('in B only');
  const elsewhere = by('placed elsewhere in the inventory');
  const bOnlyTexts = [...new Set(bOnly.map((l) => l.B_key))];
  const elseTexts = [...new Set(elsewhere.map((l) => l.text))];
  const toMoney = o.to_settle.filter((t) => t.DubPay_proposal.placement.startsWith('Money')).length;
  const withPointer = o.to_settle.filter((t) => !t.DubPay_proposal.placement.startsWith('Money') && /pointer from Money/.test(t.DubPay_proposal.placement)).length;
  const cands = o.candidates.filter((c) => !c.reading.category.startsWith('not read'));
  const strong = cands.filter((c) => !/weak|none/.test(c.reading.category));
  const failing = o.checks.filter((c) => Object.values(c).some((v) => typeof v === 'string' && /\bNO\b/.test(v)));
  let md = '';
  md += `# Money's slice of the shared inventory, checked (DubPay W3-A)\n\n`;
  md += `*DubPay wave 3, session A, 22 November 2026. Nobody, allegedly. Made by \`slice-check.mjs\` (beside this file; rerun: \`node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/A/slice-check.mjs\`). Marks: **counted** (the script counted it), **traced** (an act's bytes show it), **inferred** (a reading). Placements are proposals; nothing here is decided. Ids are cut to 8 characters; \`slice-check.json\` holds them whole.*\n\n`;
  md += `Sources: \`inventory-all.json\` and \`money.md\` both exist, so the slice is money.md's 39 texts, checked against the JSON (money.md says ${o.money_md_check.says_texts} texts and ${o.money_md_check.says_to_settle} to settle; its tables have ${o.money_md_check.table_rows} rows; the JSON has ${o.money_md_check.json_money_records} records in Money, ${o.money_md_check.json_money_records_to_settle} of them to settle: ${o.money_md_check.agrees ? 'they agree' : '**they disagree**'}, counted). Acts come from DubPay listing B's own reader of \`_research/\` (${o.sources.acts_read} distinct acts, ${o.sources.public_text_acts} public text acts, counted).\n\n`;

  md += `## In plain words\n\n`;
  md += `1. **The inventory's Money is B's Money, but one.** The inventory has ${S.inventory_money_records} Money records (one per draft); DubPay's listing B has ${S.B_texts} texts (${S.B_drafts} drafts, apps or Terms versions). ${S.lines['in both']} drafts are in both. One is only in the inventory: *guide spot* (Turnstile), which B missed (counted).\n`;
  md += `2. **B holds more, mostly not texts.** ${bOnly.length} B items are not in the inventory: ${bOnly.filter((l) => l.B_kind === 'media').length} apps and ${bOnly.filter((l) => l.B_kind === 'terms').length} Terms versions (it lists texts only), plus ${bOnly.filter((l) => /^a text act/.test(l.why_not_in_inventory ?? '')).length} text acts outside its "# cMIP" rule (one, Hop's tab draft 2, is held only in a window's acts). ${elseTexts.length} texts (${elsewhere.length} drafts) are placed in Web or Agreements instead (counted).\n`;
  md += `3. **Every Money record matches its act.** ${o.checks.length - failing.length} of ${o.checks.length} pass: the act is in the copy, its signer is the named creator, its spec hash computes with the kit's core library, its drafts are in order. Only notes: the straight split has two drafts titled "draft 6", and the report block is the kit's own spec, with no act (traced).\n`;
  md += `4. **${S.inventory_to_settle_touching_money} texts to settle touch Money.** DubPay proposes ${toMoney} for Money and ${withPointer} elsewhere with a pointer from Money; one (custody receipt) not Money at all. Proposals only.\n`;
  md += `5. **Counts differ by rule, not by error.** ${S.count_rows_differing_headline} of ${S.count_rows} use counts differ by more than 10%, all because B counts the act id for texts named by id (escrow, room let, invoice form) or reads windows' acts. ${cands.length} unlisted money texts are candidates, ${strong.length} strong (inferred), first Marthe Delcourt's "the last report". **Used is not checked.**\n\n`;

  md += `## 1. Line per text\n\n`;
  md += `> ${o.caveat}\n\n`;
  md += `One line per draft (the inventory's unit), grouped by B's text. Status and match: counted. "Prompted": the hosts asked for it (notice 8 names straight split draft 4; notice 7 asked for apps; the day-five prompt), from the inventory's field or, for B-only items, from notice 7 (apps) and the prompt's words in the act.\n\n`;
  md += `### In both (${S.lines['in both']})\n\n| Text | Draft | Act | Spec hash | Matched by | Inventory category | Prompted |\n|---|---|---|---|---|---|---|\n`;
  for (const l of by('in both')) md += `| ${esc(l.text)} | ${esc(l.draft)} | ${s8(l.act)} | ${s8(l.spec_hash)} | ${l.matched_by} | ${esc(l.inventory.area_category)} | ${l.prompted} |\n`;
  md += `\n### In the inventory only (${invOnly.length})\n\n| Text | Act | Spec hash | Inventory category | Why B missed it | Prompted |\n|---|---|---|---|---|---|\n`;
  for (const l of invOnly) md += `| ${shortTitle(l.inventory.title)} | ${s8(l.act)} | ${s8(l.spec_hash)} | ${esc(l.inventory.area_category)} | not in B's hand-made catalogue (inferred: overlooked; B's script lists only what its catalogue names) | ${l.prompted} |\n`;
  md += `\n### In B only (${bOnly.length} items, ${bOnlyTexts.length} texts)\n\n| Text (B) | Draft | Act or media | Why not in the inventory (counted) | Its task, in its words (under 15) | Says it is Money's? (inferred) | Prompted |\n|---|---|---|---|---|---|---|\n`;
  for (const l of bOnly) md += `| ${esc(l.text)} | ${esc(l.draft)} | ${s8(l.act ?? l.media_hash)} | ${esc(l.why_not_in_inventory)} | "${esc(l.task_under_15_words)}" | ${l.act_says_it_is_money.answer}: ${esc(l.act_says_it_is_money.basis)} | ${l.prompted} |\n`;
  md += `\n### Placed elsewhere in the inventory (${elsewhere.length} drafts, ${elseTexts.length} texts)\n\n| Text (B) | Draft | Act | Inventory area | Its reason | Its task, in its words (under 15) | Says it is Money's? (inferred) | Prompted |\n|---|---|---|---|---|---|---|---|\n`;
  for (const l of elsewhere) md += `| ${esc(l.text)} | ${esc(l.draft)} | ${s8(l.act)} | ${l.inventory.area}: ${esc(l.inventory.area_category)} | ${esc(l.inventory.area_reason)} | "${esc(l.task_under_15_words)}" | ${l.act_says_it_is_money.answer}: ${esc(l.act_says_it_is_money.basis)} | ${l.prompted} |\n`;

  md += `\n## 2. Records that fail their act\n\n`;
  md += `**${failing.length} of ${o.checks.length}** Money records fail (traced). Checks per record: the act is in \`_research/\`; its signer is the creator the inventory names; \`decodeSpec({0: kind, 1: creator, 9: text})\` from the kit's core library gives the spec hash the inventory gives; acts of the same text have the same signer and text; every earlier draft was carried before it and every later one after (the postman's log), and no earlier draft has a higher number in its title.\n\n`;
  const tallyCheck = (k) => { const t = {}; for (const c of o.checks) { const v = String(c[k]).replace(/\(.*\)/, '').trim(); t[v] = (t[v] || 0) + 1; } return Object.entries(t).map(([v, n]) => `${v} ${n}`).join('; '); };
  md += `| Check | Result (counted) |\n|---|---|\n`;
  for (const k of ['act_in_research', 'signer_is_creator', 'spec_hash_computes', 'drafts_in_order']) md += `| ${k.replace(/_/g, ' ')} | ${tallyCheck(k)} |\n`;
  md += `\nNotes (traced):\n\n`;
  for (const c of o.checks) for (const n of c.notes) md += `- ${shortTitle(c.title)} (${s8(c.act ?? c.spec_hash)}): ${esc(n)}.\n`;
  md += `\nThe same checks on the ${o.checks_elsewhere.length} records outside Money that touch it (to settle, or placed elsewhere): ${o.checks_elsewhere.length - S.records_elsewhere_failing} pass, ${S.records_elsewhere_failing} fail.\n`;
  for (const f of failing) md += `- **${shortTitle(f.title)}**: ${Object.entries(f).filter(([, v]) => typeof v === 'string' && /\bNO\b/.test(v)).map(([k, v]) => `${k}: ${esc(v)}`).join('; ')}\n`;

  md += `\n## 3. To settle, where Money is one of the places\n\n`;
  md += `The three wave-2 placements and the inventory's proposal are counted from \`inventory-all.json\`. **DubPay's column is a proposal**, hand-written in \`slice-check-hand.json\`; it decides nothing.\n\n`;
  md += `| Text | Spec hash | DubWeb | DubPay (wave 2) | DubLaw | Inventory proposes | **DubPay proposes (proposal)** | Reason |\n|---|---|---|---|---|---|---|---|\n`;
  for (const t of o.to_settle) md += `| ${shortTitle(t.title)} | ${s8(t.spec_hash)} | ${esc(t.DubWeb)} | ${esc(t.DubPay)} | ${esc(t.DubLaw)} | ${esc(t.inventory_proposal)} | ${esc(t.DubPay_proposal.placement)} | ${esc(t.DubPay_proposal.reason)} |\n`;

  md += `\n## 4. Money texts nobody listed (candidates, inferred)\n\n`;
  md += `Rule (counted): a public text act that neither the inventory (any area, nor its draft-titled list) nor B lists, with a heading on its first line, a rule word in its title or sections in its body, and four or more money words (pay, invoice, split, pot, held, deposit, escrow, loan, lend, refund, owed, credit, and their forms) or one in its title. That rule caught ${o.candidates.filter((c) => c.found_by.startsWith('rule')).length}; reading the texts it nearly caught added ${o.candidates.filter((c) => c.found_by.startsWith('reading')).length}. Whether each reads as a rule or template is **inferred**. "Other listings" = its act or spec hash appears in DubLaw's or DubWeb's wave-2 listing (counted).\n\n`;
  md += `| Act | Window (inferred) | Day | Title | Money words | Acts naming its id | Other listings | Category (inferred) | Reading (inferred) |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const c of o.candidates) md += `| ${s8(c.act)} | ${c.window_inferred ?? '—'} | ${c.day ?? '—'} | ${esc(c.title.replace(/\s*\([0-9a-f]{64}\)/g, '')).slice(0, 80)} | ${c.money_words} (${esc(c.top_words)}) | ${c.acts_naming_its_id} | ${c.in_other_listings ? 'yes' : 'no'} | ${esc(c.reading.category)} | ${esc(c.reading.reading)} |\n`;
  md += `\nAlso near Money and already listed, not repeated here: the draft-titled texts the inventory set aside (the room let, the invoice request form) were added by hand or placed; B's "beside" list (shower work, shares nobody may rewrite, delivery receipt, arbiter's award, custody receipt, two tray apps).\n`;

  md += `\n## 5. Use counts: the inventory against B, same draft\n\n`;
  md += `> ${o.caveat}\n\n`;
  md += `What each counts (traced from both scripts). **Inventory, by hash**: acts naming the spec hash whole, in any slot, read from homes' feeds only. **Inventory, by act**: acts naming an act id of the text whole, or as 8…4, or by its first 8 characters in words. **B, uses**: acts naming the spec hash, the text's SHA-256 or work hash, or the act id in a Terms body or spec slot (anywhere, for texts B marks "named by act id": escrow, room let, invoice request form, DubPay's shape), read from feeds and windows' acts. **B, cited**: acts naming the act id whole in refs or payload, not already uses. "All" = by hash ∪ by act, against uses ∪ cited. Every act in a gap is classed by rule below (counted).\n\n`;
  md += `| Text | Draft | Inv. by hash | B uses | Inv. all | B all | B short mentions | >10%? |\n|---|---|---|---|---|---|---|---|\n`;
  for (const c of o.counts) md += `| ${esc(c.text)} | ${esc(c.draft)} | ${c.inventory_by_hash} | ${c.B_uses} | ${c.inventory_all_namings} | ${c.B_all_namings} | ${c.B_short_mentions} | ${[c.differs_headline ? 'headline' : '', c.differs_all ? 'all' : ''].filter(Boolean).join(', ') || 'no'} |\n`;
  md += `\nDifferences of more than 10%, explained (counted, by rule):\n\n`;
  for (const c of o.counts) if (c.explained.length) {
    md += `- **${esc(c.text)}, ${esc(c.draft)}** (by hash ${c.inventory_by_hash} vs uses ${c.B_uses}; all ${c.inventory_all_namings} vs ${c.B_all_namings}):\n`;
    for (const x of c.explained) md += `  - ${x.count === 'headline' ? 'headline' : 'all'}: ${x.acts} ${x.side}: ${Object.entries(x.by_rule).map(([r, n]) => `${n} ${esc(r)}`).join('; ')}.\n`;
  }

  md += `\n## 6. Limits\n\n`;
  md += `- ${o.caveat} No count here says a split, pot, escrow, loan or invoice rule works.\n`;
  md += `- Acts are read with listing B's reader, not the inventory's: the spec hash computes to the inventory's for every Money record with an act, and the one without (the report block) equals the core library's report spec (traced), but the inventory reads homes' feeds only and B reads windows' acts too, which explains the few acts one side holds and the other does not.\n`;
  md += `- Draft order is checked by the postman's first carrying time and the numbers in titles; a draft with no carry record is checked by title only.\n`;
  md += `- "Says it is Money's?", the candidate readings and DubPay's placements are readings (inferred, proposals), kept in \`slice-check-hand.json\` so they can be argued line by line. The candidate rule is one rule; other money rules may sit in replies or reports it does not catch.\n`;
  md += `- B's media, Terms and script items are compared by key only; the inventory lists texts, so their absence there is by rule, not a fault.\n`;
  md += `- Nothing was signed, posted or paid; no key was read.\n`;
  return md;
}
