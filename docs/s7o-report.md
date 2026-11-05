**Ready to merge.** CI read on `ea2b0e5` (run 42102861191): `regtest` green; `all` green in every step but one, `clients/reader` test 8, "the texts shipped are the newest draft of each MIR" (actual `MIR-agreements-draft-20.md`, expected `-21.md`): the suite's one line in `clients/reader/src/mirs.ts`, which this session may not change (see "For the Dubsar Suite").

# S7o report: say each rule once

Branch `claude/s7o-say-it-once-xzwt8q` (the session's assigned branch; the prompt named `claude/s7o-say-it-once`), from main at `71a335f`. Not to be merged by me. No finding of my own; F431 unused.

## In plain words

Agreements draft 21 and the default control cMIP draft 4 say what drafts 20 and 3 said, each thing once. The glossary now defines each word in a line and names the rule; paragraphs that retold their rule are gone; the formats point to rules instead of re-explaining them; a stated cost or a reason said twice is kept at its rule. Two readers checked the old and new texts rule by rule and found no verdict that moved; what they found that had slipped (a client duty left only in italics, two stated costs said less precisely, one sentence turned from rule into commentary) is restored. No code changed, and the vectors are byte for byte the same.

The cut is smaller than Fable's guide: about 8% of Agreements, not a third. What is left is mostly rules stated once, dense; cutting further would have changed meanings, which the pass may not do.

## Sizes (words; with italics / without)

| Text | Before | After |
| --- | --- | --- |
| Agreements (draft 20 → 21) | 84,414 / 68,553 | 77,567 / 64,000 |
| Default control cMIP (draft 3 → 4) | 12,119 / 9,659 | 11,260 / 9,091 |
| MICS (v33 → v34) | 22,491 / 20,606 | 22,491 / 20,606 |
| Freeze test suite (v33 → v34) | 45,899 / 44,879 | 45,899 / 44,879 |
| The six MIRs together | 143,041 / 111,713 | 136,194 / 107,160 |

"Without italics" removes text between single asterisks; CDDL blocks are counted in both.

## What was cut, by kind

1. **Glossary** (about 1,500 words): one definition per word, pointing to its rule. "Belongs to", "Layer" and "This collective", whose rules live there, kept whole.
2. **How it runs / in short** (about 900): rule 11's and rule 15's, 17's, 22's "how it runs" paragraphs (rule 22's one normative sentence, a helper named in advance is a partner, kept as normal text); rule 47's "in short"; the cMIP's nine "in short" lines; first lines that only repeated their heading (rules 17, 46, 47, 57, 74, 81; the cMIP's 64, 66).
3. **Formats' commentary** (about 1,600): the publication's, claim's, transfer's, grant's, revocation's, release's, resignation's, record's, declaration's, identity chain's, fork's, closing's, notice's and keeper record's restatements of their rules, now pointers; the layers' four italic paragraphs; field 25's history (its reason stays in the Reasoning).
4. **Stated costs and reasons said twice** (about 1,500): abandonment's reason (kept at rule 89), the control-model-not-held cost (kept at rule 98), the vault's reason (Money rule 17's), the concurrency rule's withdrawal (kept in the glossary and the format), eighteen Reasoning bullets whose reason is given at the rule; the cMIP's tier table, its repeated cell said once above it.
5. **Copies of a rule** (about 1,300): rule 6's copy of "Made before, made after", 4; rule 15's copies of the closing and of rule 47; rule 60's of the layers' format and of rule 98; rule 93's copy of Money rule 17; the cMIP's copies of Agreements rules 10 and 91; the MIR's freeze-scenario lines shortened to their topic and rule, the suite holding the steps (about 1,400 of the total).

Not touched: any CDDL, field or type number, rule number or order; the other five MIRs; the MICS and the suite beyond naming the new drafts and one pointer (the suite's step 8c cited Agreements "14. Succession"; it is "17. Succession").

## The meaning diff

Two subagents, each given draft 20 and draft 21 (the second also the cMIP pair), read them rule by rule. **No act gets a different verdict; no MUST, SHOULD or MAY is missing; no validity condition changed.** Restored:
- the "No owner" flag back in rule 14's normal text (it was left only in an italic stated cost);
- "The promise, restated" in rule 79;
- the glossary's "Done" and "Contest" entries, whose short forms read wider than the rules (a Money act sealed to holders who are no members; a contest changing no validity, status or selection);
- the glossary's italic on the time reference against the collective's chain, and "Voice" pointing to point 4 as well as 3;
- rule 71's own sentences on the draft a stepping down fails to name (the resignation format's "brings her back" does not fit a stepping down);
- rule 91's fork-specific stated cost for a Money-only wallet;
- rule 91 D's batching sentence in normal text;
- the cMIP's prices stated cost with "or at none";
- the fork's freeze-scenario line in full (see question 3).
Removed: a sentence I had added at the glossary's head, which was not true of every entry.

## The stranger's reading

A subagent limited to the eight texts and the default cMIP read draft 21 whole and told back the four parts (grammar; what others relied on stands; the way out; the deciders, last resort and tasks), the boundary (the model names powers inside the room the constitution leaves; the core counts; the way out read by the core alone when the model is not held; refused against overreaching) and the way out for an owner, a deal's party, a member and a departed holder, all correctly. It found nothing it could not follow because of a passage cut. It listed words of several senses ("holder", "line", "release", "record", "verifier", "stake" for one holder's share), most of them old, and some contradictions, below.

## Contradictions (questions; nothing chosen)

1. **Which version's rules bind a buyer of a stake.** *Plain words:* rule 10 says the buyer accepts the rules of the version in force when the collective's line places its transfer, "never" the version its transfer names; rule 48 says it "bought under the version … its transfer names (field 0)". Options: (a) rule 10's reading, rule 48's sentence corrected; (b) rule 48's, rule 10's corrected. Lean: (a) with rule 48 read as its second sentence says (a change in the window binds the buyer only with its signature); the cMIP's rule 94 already reads rule 10's way. Cost: one sentence.
2. **What ends a grant.** The grant format and rule 79 list revocation, a departure emptying its area, a layer freezing, a fork, a closing; rule 74 adds a change of control model for a grant within an area. Lean: add it to both lists. Cost: two clauses.
3. **A payment naming the fork.** Draft 20's fork scenario line says such a payment "is pending until a successor's chain records it"; no rule says so, and rule 91 says a payment after the fork is owed back. Kept as written. Lean: the scenario follows rule 91. Cost: one line, and the suite's step checked.
4. **From the stranger, older than this pass:** rule 98.3 names the judicial fields among the constitutional ones while rule 65 and 67 treat the judicial tier as beside the constitution; an issuance's parameter 32 sits in field 35, whose change rule 98 calls constitutional, while the cMIP calls an issuance no constitutional change; "How to read" keeps rule 67 in the core while rule 99 says the cMIP carries "66 to 68"; rules 70, 83 and 89 say "rotate" where rule 69 asks a rotation only for key holders; the absence authority's three lists (rules 85, the deal sentence, the format comment) differ; a closing's "other than its own stake in itself" against "the collective holds no share of itself"; leftovers "to the first as listed" against "the order decides nothing"; the cMIP's handover and suite step 3.7ar say "refused" where rule 99 says "overreaching". Each for the MOR lead to send to Fable or Nobody, allegedly; none was touched.

## For the Dubsar Suite

- **Ummia's pins** (computed as `docs/s7l-report.md` shows, `tagged_hash("MOR/spec", {0: kind, 9: text})`, one final line break removed; the method reproduces the v30 pins):
  - `MICS_HASH = '86150e996ecd0bc7a7ae20cd28fcd7d0fa1711eeb3344134bee592da00ed9189'` (v34)
  - `SUITE_HASH = 'ce3cc0a9327d105bf904001ef2f5eb5928172262604de86c36f42894fd09c94b'` (v34)
  - Agreements draft 21's spec hash: `371abd68c4b2d6c3073001b7c2898b2559240e65e79f1e40093ccdabb1a986f1`.
- `clients/reader/src/mirs.ts` names Agreements draft 20; its test "the texts shipped are the newest draft of each MIR" fails until it names draft 21. One line, the suite's; `clients/` untouched.
- Nothing an app does changes: no code, no binding, no vector moved.

## Checks

- `cargo test --workspace --locked`: 800 passed, 0 failed, 95 suites.
- Vectors regenerated: `git diff --exit-code core/vectors` clean, byte for byte. `python3 core/vectors/check.py`: all 291 agree, 113 verdict vectors judged.
- `scripts/c-box/make-c-box.sh` into a scratch folder: refused nothing; 8 texts (Agreements 21, MICS v34, suite v34), 1 cMIP (draft 4), 12 vector files.
- No release rebuild: nothing under `core/` or `wasm/` changed.
- CI on `ea2b0e5`, read by me: `regtest` green; `all` red only at `clients/reader` test 8, as expected above; every other step green, the vectors regenerated and the Python check among them.
