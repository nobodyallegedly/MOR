# DubPay constitution: from draft 2 to draft 3, and draft 3 to draft 4

*DubPay, 27 November 2026. What changed, and why. The order: `_team/lead/constitutions/order.md`. Checks answered: P4 (`claude/dubpay-check-p4`, draft pull request 224) in draft 3; C3 (`claude/dubpay-check-c3`, draft pull request 295) in draft 4, finding by finding in `answers-to-c3.md`. Nothing here is decided.*

The stint's wish (Nobody, allegedly, 26 November 2026): "We need to change the current wish to updating the core after the findings"

## The shape

- **Common part:** the lead's text of 20 November, pasted unchanged as part one. Draft 2 only pointed to it.
- **Own part:** 1,199 words in draft 4 (1,188 in draft 3; draft 2's block, gate and workflow were about 900, its reasoning sections another 1,100).
- **What rests on what:** every principle now names an act, a count DubPay reran, or a text DubPay read at source. Draft 2 claimed this (P4 §5, D10) and did not do it.
- **Provisional marks** on three principles, each naming a rule of the may-move list or the Money review: what settles "paid" and whether "valid means in force" reaches reports (4); whether a report binds its payer (6); how a text's words are named (12). Draft 3 had four marks and called them five; two of them were seams, not core rules (C3 §1), and are now **seam marks**: disputes and obligations (3, 6: DubLaw), what is shown and records (4, 11: DubWeb), each to be settled by seam act, with DubPay's cross-reading note (order, step 3) saying what it asks of the other Dub's texts.
- **Release gate:** DubWeb's shared checklist named as the base, as the order settles, and not restated (draft 3 paraphrased three of its items from memory; the round shows six, act 393f664c: C3 §3). DubPay keeps only Money's additions. Draft 2's gate had been credited to a report that does not contain it (P4 §5, D57).
- **Hand-back:** the team's rule of 26 November, word for word in substance; draft 2's rule predates it.

## Dropped from draft 2, and why

| Draft 2 | Why it is out |
|---|---|
| "A holder who can audit them from public acts alone" (D42) | P4 §1.1: no source shows a holder audited from public acts; the round proved nothing of the kind. Principle 1 now asks the text to name what the holder's books show, no more. |
| "Paid means a preimage against an invoice the payee signed, or a token locked to the payee's key" (D45) | P4 §1.2: a preimage does not show who paid; a locked token is not yet money. Principle 4 keeps "shown, not said" and leaves what settles "paid" on each rail to the Money review. |
| "Pending, never failed" (D47) | P4 §1.3: a timeout before the first attempt is a plain failure, and nothing said what ends pending. Draft 3 said only the second (C3 §6); draft 4's principle 7 says both, and who refunds. |
| "Two independent readers agree" (D53) | P4 §1.5: the gate in the source is two independent programs, and it proves implementers agree, not that the text is right. Draft 3 said programs but dropped the limit and added vectors the source does not have (C3 §2); draft 4's principle 12 says programs, states the limit, drops the vectors, and applies to DubPay's texts only, with his word. |
| Narrow wallet links; the way out as a list of months and notices; ecash held "by the mint" (D51, D52, draft 2 §1.7 and the P3 rules) | They rested on P3 cases read as search summaries (P4 §5, D10 on C1 to C9 and X1 to X3). The order excludes principles resting on unchecked snippets. The way out is kept as principle 11, resting on the round's own acts. Wallet links and ecash go back to the research reports, to return when DubPay has read the sources or built the tool. |
| "Reconcile against the rail's own records" (D50) | P4 §5: P2 marks it an inference from an unverified excerpt. Principle 9 keeps what the pot's tests and NUT-02 support: whole numbers, one equation, remainder rules. |
| "Not 'holds nothing' against 'holds money'" (D20) and the claim that round two used the still-owed line as P3 asks | P4 §4 and §5: the first eased DubPay into holding; the second was not in any report. Principle 6 now says who holds what is owed and the cap, and marks it provisional. |
| The citation "S17", "used everywhere", "the hold runs out before a long dispute does" | P4 §5: no such row; no source; a structural point with no documented loss. Gone. |
| "Decided by Nobody, allegedly" over the hand-back rule (D31) | The rule is the team's now (RULES.md); his words on it stay in `docs/decisions.md`, not paraphrased here. |

## Added since draft 2

- **Principle 2, interests stated.** From W3-C and catalogue v2: DubPay's leans had favoured its own texts; DubPay has 7 debt lines in Hop's tab.
- **Principle 5, the report-key check.** From the fault fixed in Damgar 0.2.3 and 0.2.4, with its stated limit.
- **Principle 14, used is not checked.** From the MOR lead's rule of wave 1 and the counts (42 Terms, 0 money rules checked by the kit).
- **Gate lines** for forged, unchecked and wrong-signer reports, and for "what the tool does not verify", from review W3-F.

## P4's findings, one by one

| P4 | What draft 3 does |
|---|---|
| §1.1 audit from public acts | Dropped (above). |
| §1.2 what counts as paid | Weakened to "shown, not said"; provisional on the Money review. |
| §1.3 never failed | Reworded in draft 4: a payment never sent has failed; "what ends pending" and "who refunds" required. |
| §1.4 never edited comes from MOR, not research | Kept, and said so: it rests on texts named by hash (the kit), not on P1. |
| §1.5 two readers | Two programs; the gate's limit stated (from draft 4); DubPay's texts only. |
| §1.6, §1.7, §1.8 rails, readers first, the fresh check: no source | Marked as DubPay's working rules (10) or resting on the round's own checks (13). |
| §1.9, §1.10, §1.11 reconciliation, identity key, narrowest link rest on inferences or excerpts | Dropped. |
| §2 ecash, receipts, before sending a split, payment names, wallet links, what DubPay says up front, retries over a link, reporting flaws, dependencies, the missing gate items, amounts, texts | Not added. Each rests on report sections DubPay has not read at source, and the order excludes those. They stay listed here as the research backlog for the next draft: DubPay reads the sources first, or builds the tool and tests it. Two exceptions came in from the round itself: "could not check is a state" (principle 4) and "what the tool does not verify" (gate). |
| §3 overlaps with DubLaw and DubWeb | Principles 3 and 6 carry SEAM [DubLaw], 4 and 11 SEAM [DubWeb] (draft 3 had wrongly called the first two provisional: C3 §3). The reach is settled by seam act and the cross-reading note, not by the mark. |
| §4 holding money, deciding a release, the stop switch, principle 12's reach | Principle 1 now "proposes" to hold nothing and names M1 as open and his (draft 3 had settled it: C3 §5); 6 names the holder and the cap; 7 names who refunds; the stop switch is out of the gate until a trust table names it; 12 is limited to DubPay's texts and needs his word to call one final. |
| §5 claims stronger than their source | Each one corrected or dropped (above). |
| Could not read the lead's constitution | Part one carries it whole, which does not make it verifiable to a repository session (C3 §6): only the project copy does, which the lead and Nobody, allegedly, hold. The lead compares at step 4. |

## Draft 3 to draft 4, in short (C3)

- Three citations re-sourced (principles 5, 8, 11) and one moved (1: 9144a9c0 to 37df0a45).
- Principle 12's example turned into the counterexample it is; the gate's limit stated; vectors dropped; his word added.
- Principle 14's count restored to its meaning; "24 of 36" sourced to listing B.
- Principle 1 proposes, and leaves M1 to him. Principle 3 is a seam, not provisional. Principle 8 claims only what 0.2.1 does. Principle 10 says it is a lesson from a breach.
- The gate names DubWeb's checklist without restating it; two mutations, not three kinds; 7084340b dropped.
- Home names removed from the workflow (operational detail).
- One line of part one DubPay cannot source from the repository ("the infrastructure to achieve financial flow…"): reported to the lead, who holds the project copy.

## One line of the common part DubPay thinks is outdated (for the report, not rewritten)

"names what to read, what to produce and where (your folder's out/, one file per task)" and "says which folder to request access to and nothing else": since RULES.md (21 and 26 November) results go to `_team/<dub>/wave-N/results/` and to the session's own branch, and Mac sessions connect `_research/` and `_team/`. Draft 3's workflow says the current practice; the common part's sentence is left as written.

## Draft 4 to draft 5 (the lead's step 4 and the two cross-notes on DubPay's draft)

*27 November. Part two: 1,197 words; thirteen principles, none new; four provisional marks (one added: principle 8's in-force check), seven seam marks.*

**Moved to the common part, dropped here:** "used is not checked" (was principle 14); the way out's boundary (principle 11 keeps only Money's part: what happens to money held); "nothing released as media without his word" (was the gate's last line); the finality test for a text (principle 12 now says "the common part's test"; the question whether his word is needed for every text is his, carried by the lead); act ids as eight characters and an ellipsis (applied throughout).

**Settled seams, applied:**
- "A payment with no Terms stops the app, once" is now in principle 8, as the suite's one line; only the in-force check is provisional on "valid means in force".
- "Fetch back by hash" is cited as DubWeb's base item 1 (with DubPay's act as its ground), not restated.
- The diff check stays in the hand-back only.
- A cloud session gets what it needs attached or in its prompt; a Mac session reads the Mac (workflow).
- Repository place: `reports/dubsar/dubpay/` for reports, catalogues, checks and drafts; `clients/` or `tools/` for code.

**From DubPay's own cross-reading:** two duplicate gate lines dropped (fetch back; says what it does not verify); Damgar's standings onto the three words (principle 4, seam); "a web number is unchecked until its source is read" (workflow); "not pushed is not delivered" (hand-back); Damgar's known list changes only after a cold check (principle 13); Damgar's version line names the specs it reads (gate).

**From DubLaw's note:** SEAM [DubLaw] added to principle 8 (what was agreed), principle 7 (who refunds) and principle 11 (leaving); principle 3 names the award's draft 3 as the text written together; principle 6 says in one clause that Agreements says what is owed and Money what was paid; "no other Dub's figure without rerunning it" (principle 2).

**From DubWeb's note:** principle 4 says "shown as unchecked, with the reason", the standard's word; principle 7's words go to the shared glossary by seam act; SEAM [DubWeb] added to principle 8 (warnings, how a stop is shown) and principle 5 (one code path for "checked"); the release-as-media line left to the base.

**Not changed, with a reason:** principle 12 keeps "two programs agreeing" out, since the common part now carries it as added evidence with its limit; principle 1 keeps "proposes" and M1 as his.
