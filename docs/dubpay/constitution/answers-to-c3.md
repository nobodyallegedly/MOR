# DubPay: answers to the cold check C3, finding by finding

*DubPay, 27 November 2026. C3 is on branch `claude/dubpay-check-c3` (draft pull request 295). DubPay accepts the check; every row below says what draft 4 does, or why it changes nothing. Nothing here is decided.*

The stint's wish (Nobody, allegedly, 26 November 2026): "We need to change the current wish to updating the core after the findings"

## The five plain-words points

| C3 | Answer in draft 4 |
|---|---|
| 1. Shape holds; part one's quote "the infrastructure to achieve financial flow…" is not in `docs/decisions.md` | Part one stays as the lead wrote it. The quote is the lead's to source; DubPay reports it to the lead (it is in the project's `claude/MOR-dubsar-windows-prompts.md` lineage, which no repository session can open). |
| 2. Three misdirected citations (principles 5, 8, 11) | All three re-sourced: 5 to the lurker's report and DubPay's own admission (9be6cfc3); 8 to 6fe32aed for the fix and 7a8c4db3 for the fault it answers; 11 to the closing act f7c5606a, as catalogue v2 names it. Principle 1 also moves from 9144a9c0 to 37df0a45, the act that shows the holding. |
| 3. Principle 12's example contradicts its rule | Kept as a counterexample, and said so: the round's own correction did not name the act it corrected. That is the fault the rule prevents. |
| 4. Principle 14's count turned around | Corrected to `changes.md`'s wording: 42 Terms asked, answers on shape and in force only, 0 money rules checked. "24 of 36" now cites listing B, where it is counted. |
| 5. Principle 1 decides what is his; principle 3's mark names no rule; two answers to P4 not in the draft | Principle 1 now "proposes", and names M1 as open and his. Principle 3 is marked SEAM [DubLaw], not provisional. Principle 7 now says a payment never sent has failed. Principle 12 now states the gate's limit. |

## Section 1, the shape

| Finding | Answer |
|---|---|
| Four provisional marks, `changes.md` said five | Draft 4 has three, each naming a rule of the list or the Money review; `changes.md` corrected. The two that were seams (3, and the DubLaw half of 6) are now SEAM marks, a label the order's third point does not have but part one does ("settle it with a seam act"). |
| Principle 6's "one way to name a set of acts": dependence not shown | Dropped from 6; the line is closed by one act. |
| Principle 11's mark on "the words of Terms": dependence not shown | Dropped; principle 11 is a SEAM [DubWeb: records]. The naming question moves to principle 12, where it belongs. |
| Principle 12 not marked, though how texts are named may move | Marked PROVISIONAL [how a text's words are named]. |
| Principles 4 and 5 and "valid means in force" | Principle 4 marked PROVISIONAL on it, "if it reaches reports": DubPay cannot tell from the list's one sentence either; the MOR lead can. |

## Section 2, the claims

| Principle | C3's verdict | Answer |
|---|---|---|
| 1, act 9144a9c0 | Right fact, wrong act | Now 37df0a45 ("79 of my 100 sats are sitting with DubPay"). |
| 2, 7 debt lines | Not rerun by C3; DubPay's count | Stays: a count DubPay reran (catalogue v2's script, byte-identical on a fresh copy). The acts behind it are in `_research/`, cited in catalogue v2. |
| 3, "judging" | Inferred, stated as read | Now says so: "whose judgement that is, inferred". |
| 4, Damgar 0.2.4 | From the README, not rerun | DubPay ran the 12 tests itself on 22 November; the draft says "run". The README is the record; the test file is on the fix branch. |
| 5, acts | Not the lurker's finding | Re-sourced (above). The lurker's words are in a report, not an act; the draft now says which. |
| 6, 81 acts | Matches two independent counts | Stays. |
| 6, S7 | Verified | Stays. |
| 7, 37df0a45 | A stale list, the principle's neighbour | Said so: "a wrong state shown as certain". It is the nearest thing the round holds; the pending state itself was built in 0.2.4, which the draft also cites. |
| 8, acts and the claim | Misdirected; stated more strongly than built | Re-sourced; the claim cut to what 0.2.1 does, with "comparing amount and payee … not yet built" said plainly. |
| 9, the pot's tests | Not in the bundle | The file is named (pot.test.mjs, DubPay's build folder). DubPay ran it in the round; not in `_research/`, so unverifiable to a session: a limit stated, not hidden. |
| 9, NUT-02; 12, CONTRIBUTING | Verified at source | Stays. |
| 10, Damgar's sequence | Shows the rule by its breach | Now said: "a lesson from DubPay's breach". |
| 11, 28f20a30 | Contradicted | Replaced by f7c5606a. |
| 11, M13 | It is M10 | Corrected to M10. |
| 12, the two publications | Cuts against the principle | Made the counterexample (above). |
| 12, Cashu's gate | Two implementations, no vectors; limit left out | Vectors dropped; the limit stated; "agree on its reading" is the text's own point. |
| 13, W3-F | By the README only | DubPay read W3-F in full on 22 November (branch `claude/dubpay-check-w3f`); C3's reading list did not include it. Stays. |
| 14, "0 naming a money cMIP" | Contradicted | Corrected (above). |
| 14, "24 of 36" | In no source read | Listing B (`_team/dubpay/wave-2/results/B/listing-money.md`, plain words, point 3), counted by its script; now cited. |
| Gate, 7084340b | Inferred for 0.2.2 | Dropped; 43a4c7bd alone, which shows 0.2.1's 404s. |
| Gate, three kinds of report | README documents two mutations | Now "a forged report and a forged closing report", the two the README documents. |
| Gate, the pot's tests | Not verified | As principle 9. |
| Workflow, RULES.md | Not in the bundle; matches the prompt | Stays; RULES.md is on the Mac. |

## Section 3, the seams

| Finding | Answer |
|---|---|
| DubWeb's checklist: the three items are DubPay's paraphrase; the round shows six checks (393f664c) | The paraphrase is out. Draft 4 names DubWeb's checklist as the base and restates nothing of it. |
| Principles 3 and 6 reach into DubLaw's area; a provisional mark changes the label, not the reach | Both now carry SEAM [DubLaw], and the cross-reading note (order, step 3) will say what DubPay asks of DubLaw's texts and what it leaves to them. The reach is real until that note; C3 is right that it is settled by seam act, not by a mark. |
| Principles 4 and 11 reach into DubWeb's | SEAM [DubWeb], same treatment. |
| Home names in the workflow are an operational detail | Removed from the constitution; kept in DubPay's notes. |

## Section 4, anticipating the core

Answered under section 1: principle 12 marked; principle 4 marked on "valid means in force"; principle 3's mark replaced by a seam.

## Section 5, holding money, releases, what is his

| Finding | Answer |
|---|---|
| Principle 1 settles M1's open point before he does | Now "proposes", and says M1 is open and his. DubPay's lean stays what catalogue v2 says; the constitution no longer pre-empts it. |
| Principle 6: who holds owed shares when DubPay runs the service | Open under M1; principle 6 asks the text to name the holder and the cap, principle 1 says whose decision it is. |
| Principle 7: who refunds | Added: "the text says … who refunds". |
| Principle 12: who calls a DubPay text final | "with his word" added. |
| Two counts not rerunnable from the bundle | Both now cite their source files; the pot's tests remain outside `_research/`, stated as a limit. |

## Section 6, `changes.md` against P4

| Finding | Answer |
|---|---|
| "Principle 7 says both": a timeout before sending is a failure was not in the draft | Now in principle 7; `changes.md` corrected. |
| "The gate's limit stated": it was not | Now in principle 12; `changes.md` corrected. |
| "Five provisional" | Three, now; corrected. |
| P4 §3 answered with provisional marks | Answered with SEAM marks and the cross-reading note; corrected. |
| "Part one carries it whole" does not make it verifiable | True. Part one is verifiable only against the project copy, which only Nobody, allegedly, or a window attached to the project can open. Said so in `changes.md`; the lead reads the three drafts side by side (order, step 4) and holds the source. |
| P4 §2 items left out: DubPay's reason unverified | Stands as DubPay's reason; the backlog is listed in `changes.md`. |

## What DubPay keeps against C3

Nothing is rejected outright. Two points are kept with a reason:
- Principle 2's count and principle 9's tests are DubPay's own reruns, outside what a bundle can carry; the draft says "count" and "run", and the files are named.
- Principle 13 cites W3-F from DubPay's own full reading, not from the README.
