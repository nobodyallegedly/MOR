# Freeze test suite v30: notes from cleaning

*The suite was cleaned in five parts (components; scenarios 1 and 2; scenario 3 in two halves; scenarios 4 to 8 and the freeze procedure). Each part's notes: the rule citations converted, the tags dropped, the questions, and what a stranger would still trip on. Kept for the approval; not part of the texts.*

## Notes on part A (core components)

### 1. Rule citations converted
- Vows line: "(rule 15b)" → Agreements rule 14 (A sale is tied to the seller's agreement, not to the work's stakes); "Agreements draft 11, reading (Q3)" → Agreements rule 13 (Vows: the state of each sale).
- Owners' matters line: "(F307 to F318; Agreements draft 14)" → Agreements rules 94 to 97.
- Concurrent records: "(rule 90; Agreements Q6, taken: ...)" → Agreements rule 90 (Forks of records).
- Kept as current and checked: Envelopes rule 24 (withdrawal), Development rule 18 (xtypes).
- New citations, checked against headings: Text rule 14; Agreements rules 13, 14, 33, 37, 41, 42, 58, 60, 73, 76, 90, 94 to 97; Money rule 7; Identity rule 34.
- Suite step cross-references inside lines ("3.7x", "1.9d") written "steps 3.7x" so they are not read as rule numbers.

### 2. Tags dropped
- Every test name, path and build-status note ("run", "code after step 15", "to build", "scenario: to write", "deferred", "built", the deal assessment tool's path, `cmips/...`).
- Review labels: Flaw G, C, M, N; Development Q6; Q4 to Q6; Q2, Q3; "Agreements round 2"; F270, F280, F294, F326; "version 27 read ..."; "step 12b".
- Three lines that had only "(scenario: to write)" (agreement as a party; deal ending; plus the split plan's no-cap flag, now marked conformance) are marked *(component)* or *(conformance)*: no scenario number backs them. The freeze report must reason or run them as components.

### 3. Rewritten (decisions written in, no verdict changed)
- "Lane" lines: the Money claim and receipt line now says a grant to oneself whose grant reaches claims or receipts (Money rule 7), with a new line for a collective's payee pointer under a holder's member key; the Agreements "grant whose grantee is its own grantor (a lane)" line now says a grant to oneself (Agreements rule 73); a new line for a holder's member key (Agreements rules 60, 73); the "Lanes" line now reads "Adoption by areas" (Agreements rule 60's adoption paragraphs).
- Text: the `objects` line now names Text rule 14's two cases; a new component line states them.
- Keepers: a new "Keeper records" line (type 2, the keeper's sequence, order not time, rules 37, 41, 42); the time line says a deadline is shown missed only by an anchor (rule 33), no longer "anchor or keeper".
- Grants: the grant keys line no longer lists import as a mechanism (type 11 retired; adoption by the grantor's act citing, acknowledging or paying on it); a new line for a revoked grant's acknowledged or recorded acts, disputed (Agreements rule 76), with the revocation citing every act (conformance).
- Relays line: the "read again in v28" note rewritten as a plain statement (Envelopes type 2 retired).
- Key delivery with a wrong key: "the clients' shown so is conformance" kept as conformance.

### 4. Questions (a verdict could change)
1. The new component lines for a grant to oneself, a member key, Text rule 14's two cases, keeper records and a revoked grant's disputed acts carry the scenario numbers of the steps that test them (2, 3, 1); the scenarios themselves (other parts) must contain such steps. If a part's cleaner did not add them, those lines are components with no scenario: lean, mark them *(component)* and reason them in the freeze report.
2. Judicial tasks: the Adoption line follows Agreements rule 60 (tasks 9, 10, 11); the Development table and the MICS add task 14 (abandonment) to the judicial tier. Which is the list? Lean: 9, 10, 11 and 14, as the Development table says, Agreements' sentence to be aligned (it is wording if task 14 is already changed only with every member elsewhere).

### 5. A stranger would still trip on
- "Written for people" no longer names its test vector file; the vectors go with the texts to the C session, but the suite names none.
- "Sequences with position and running summary from the published vector": the vector is named but not where it is published.
- "The pooled anchoring service and a rail swap as proven offers": named by role, no text defines them.

## Notes, part B (scenarios 1 and 2)

### 1. Rule citations converted
- 1.5c: Money rule 15 → Money rule 29 (Good faith); Money rule 14 → Money rule 17 (Which pointer a debt is paid to).
- 1.9d, 1.9e, 1.9f: "Agreements draft 12, rule 48", "draft 12, rules 48 and 89", "draft 13, rule 14" → Agreements rules 48, 48 and 89, 14 and 48 (headings checked: 48 No stake reduced without its holder; 89 Outcomes; 14 A sale is tied to the seller's agreement). "F274's list" → "rule 48's list" (rule 48 states the list).
- 1.9g, 1.9h: tag "(Agreements draft 14)" → "(Agreements rule 47)" (what others relied on stands, a deal's version relied on stays complete) and "(Agreements rule 48; terms field 31)".
- 1.7a: tag "(F188 and F189 ...)" → "(Agreements rule 47)" (the deal fork, reference, settlement, judge of forks are in rule 47).
- 2.4: Agreements rule 32a → Agreements rule 12; Money rule 10c → Money rule 18 (both "A purchase names the claim it pays under").
- 2.4 (route note), 2.4b, 2.4g: "Money draft 7, rules 24, 27, 28, 12, 11" → Money rules 24, 27, 28, 12, 11; "claim key 10" → "the claim's field 10" (Money 11 claim CDDL, field 10 = the previous hop's receipt); "(rule 26)" → Money rule 26.
- 2.4j: Money draft 8, rule 4 → Money rule 4.
- 2.5: "the RV32IM profile" → "the machine profile (Development rule 22)".

### 2. Tags and notes dropped
- Every "Run ...", "Reasoned ...", "Deferred ...", "Until built ...", "to build" note, test name and path (1.9d to 1.9h, 2.4, 2.4b, 2.4g to 2.4j, 2.5, 1.5c): build status, for the freeze report.
- Labels: QF1, DQ1 to DQ4, QL2, Flaw B19 (twice), Development Q6, "new in v28" (twice), dates and doc pointers in 1.7a, "superseding F236", F285, F270, F280, the `review_fdb_*` tests (kept its meaning: "A settlement is final").
- Stray "** " left by an earlier "new in v28" removal (1.5c, 2.4e to 2.4j, 2.6b).
- 2.4's route note kept as protocol in one sentence: the route valid (Money rule 24), the conversion delivery proven by its cMIP's checker. 2.4b's note kept as the step's expected outcome ("buried" → "has passed"), minus history. 2.4i's note kept as one sentence: each client reads kind and binding from the specification.

### 3. Wording changed to follow the drafts (no verdict a C verifier gives changes)
- 1.5: "become visible disputes, never valid acts" contradicted Identity rule 34 ("then it is valid and shown as disputed"); now "stay valid and are shown as disputed (Identity rule 34); on the deal's chain they confer nothing (Agreements rule 6)". The keeper case now says "recorded before recording the rotation" (rule 34's condition), also in 1.5b.
- 1.8: keepers order, never time: the missed deadline is now shown by an anchor of the keepers' sequence on the block height, undetermined without an anchor (Agreements rule 33); the Passes-if line says the same.
- 1.9f: "the deal tool flags" → "her client flags ... *(conformance)*" (Agreements rule 14's "her client flags terms ... 'No owner'").
- 1.9g: "until keeper records give a deal a line" (forward-looking) → "since a deal has no line" (Agreements rule 47).

### 4. Questions (verdict could change)
- 1.7a "The judge speaks once": the clause "where the first settlement is cited by nothing a second one holds, the verifier refuses (open)" was an open placeholder. Removed, since the same step decides that case later ("A judge that contradicts itself": both count for nothing, the reference stays in force, the next link settles) and Agreements rule 47 says "Any judge speaks once per fork: a second settlement, whose history holds the first, counts for nothing." Lean: the removal is wording; confirm.

### 5. What a stranger would still trip on
- Identity draft 15's freeze scenario "Rotation by chain key, delivered at the home; pending until the home rule is met: 1, 5": scenario 1 (step 5) shows a rotation from an offline device, but nothing in it shows it pending until the home rule is met. Either drop "1" from Identity's line or add a sentence to 1.5.
- Identity's "excluded or disowned acts void, or disputed if acknowledged or recorded: 1, 2, 5" matches 1.5, 1.5b and 2.5c. Text's "bidirectional override: scenario 1" matches 1.1.
- Scenario titles and concrete rails (a feature film, a song, Lightning, a stablecoin) are test fixtures; whether the core's "names no particular use" covers the suite is for the report.
- 2.5's machine profile is a specification published after the freeze: the step cannot run in MOR 1 (the freeze report says so).
- 2.4f's relay transport cMIP's delivery record (type 0) is named by role; its format is not in the eight texts.

## Notes: part C1 (scenario 3, heading to step 3.7am)

### 1. Rule citations converted (old → current; each heading checked in Agreements draft 17 or Money draft 11)
- step 3: rule 47 → Agreements rule 90 (Forks of records); rule 37c → Agreements rule 72 (Every complete clone is written on the record at once).
- steps 4, 5, 7m, 7o: rule 40 → Agreements rule 76 (Revocation; adoption).
- step 7k: rule 51 → Agreements rule 87 (Declaration).
- step 7o: "rule 90" kept, now "Agreements rule 90".
- step 7p: rule 34a → Agreements rule 35 (The chain of judgment).
- step 7w: rule 45a → Agreements rule 46 (A false mark makes a clone invalid); rule 37a → Agreements rule 70 (A member can always leave alone); "Money draft 7, rule 17, and Agreements draft 11" → Money rule 17 (Which pointer a debt is paid to).
- steps 7x, 7y: "Agreements draft 12, rule(s) 48, 87, 89" → Agreements rules 48 (No stake reduced without its holder), 87 (Declaration), 89 (Outcomes). "F274's list" → "those Agreements rule 48 lists".

### 2. Tags and notes dropped
- Review and finding labels: Flaw B1, B18, C (three), E, F, G (three), J, K, L (two), M (three), N (three); A2-1 to A2-8 (step tags); "A2's reason"; "replacing F109's B2 for actions"; "withdrawing C8"; "Rewritten for F115"; "F187" (became "The rollback, in detail"); "F329 Q4" note in 7af; "with F306's condition" (7am); Q23, Q28, Q30 (7o).
- History: "the concurrency rule being withdrawn (step 12b)" (step 3, now "terms field 10 is withdrawn, never reused"; 7o); "(Development draft 5)" (7j); "Under the sixth pass's text ..." (7o, twice); "version 27 read ..." (7o); "Under version 27 the sale waited for ever" (7ag); "Agreements draft 14's additions" (7am, now "the owners' additions").
- Every *Run ...* status note, with test names and paths (5, 7r, 7t to 7v, 7x to 7am); 7o's pointer to the ordering-story documents and harness.
- 7ag: the sentence "the outcome a declaration states where the holder's plan names a successor is a question for Nobody, allegedly (docs pointer)". Removed: an open point does not belong in the freeze-ready suite; it is question 1 below.

### 3. Questions (a verdict could change)
1. **A declaration against a departed holder whose plan names a stake successor: which outcome may it state?** Step 3.7ag says the stake passes to the successor and outcomes 0, 3 and 4 count for nothing; the stranger's reading of Agreements 17 found three wordings there ("states outcome 0 alone", "never outcome 0", an empty list). Options: (a) the empty list: the declaration states no outcome, the stake passing by succession; (b) outcome 0 alone; (c) never outcome 0. Lean: (a), which is what 3.7ag and 3.7y test. Left as the step stood; the Agreements wording is the question.
2. **Step 3.7o's emptied-area story contradicted 3.7m and Agreements rule 71** ("until the refit, B binds and A, C and D are undetermined; reinstated, every deal binds; sealed, only B binds, and A once imported"), while rule 71 and 3.7m say A, C and D are void, nothing undetermined, a reinstated grant taking nothing on, and the import act is retired. I rewrote the story to rule 71's and 3.7m's verdicts: the drafts and the suite's own step 3.7m already give them, so no verdict of the protocol changes, but it is a change to a step's stated verdicts, flagged for approval.

### 4. Written in (decisions this pass carries)
- Step 4: deal 2 void only as no other identity acknowledged it and no keeper recorded it; an added sentence: had a counterparty's signature act acknowledged it, or a keeper the deal names recorded it before the revocation, it would be valid and shown as disputed; the revocation cites every act under the grant the label holds *(conformance)*. Step 5: deal 4 likewise. (Agreements rule 76, in Identity rule 34's words.)
- "Lane" removed: step 1 gives the release manager "the Development layer, by which it decides the label's extensions" and the treasurer "the Money layer" (the area reaching Money); 7g, 7j, 7k, 7m, 7n, 7o, 7r reworded to "the area reaching Money / Development / Agreements", "falls in no area", "both areas' powers".
- "No handover" kept as "There is no handover" (Agreements says it); nothing in C1 used import as a mechanism except 7o's story (rewritten above).

### 5. A stranger would still trip on
- Step 7w refers to "a release" its members sign during the broken stretch: a release to the public domain, not named so.
- Step 7o's "A further label" and step 7's "In step 7k's collective": the suite's own cross-step references stand.
- Step 7al points to "step 9s" (scenario 3, part C2): check it exists in v30.
- Step 7u: whether the period passed is "the time reference's answer"; the note that the caller states it was a Run note, removed; Agreements says it is "a fact the caller states" (the stranger's reading found no caller defined).
- Test identities kept: Marco, Sofia, Cy, Dana. Rails: "a Lightning rail Module", "an on-chain rail" (7g) kept, the step needs two rails.

## Notes: part C2 (scenario 3, steps 7an to 9ai and the pass criteria)

### 1. Rule citations converted (old → current, each checked against the heading in Agreements 17 / Money 11)
- rule 37b → Agreements rule 71 (Leaving an area), step 8
- rule 36 (with Flaw B17) → Agreements rule 59 (Key grammar), step 8b
- shape A/B/C/D → Agreements rule 91 (How a collective ends: four shapes), with the shape letter; 9c also rule 55 (Public domain); 9e rule 55
- rule 47b → Agreements rule 92 (The creditor's release), steps 9f (also "Closing (type 20)"), 9h, 9j
- rule 47a → Agreements rule 91, steps 9p (with rule 57), 9w, 9ab, 9ac
- Agreements rule 35a → Agreements rule 57 (done), steps 9i, 9l (with "Record (type 17)"), 9q
- Agreements rule 35b → Agreements rule 58 (Two chains), step 9m
- Agreements rule 32a → Agreements rule 12, steps 9k, 9o, 9z
- Money rules 8a and 10c → Money rules 12 and 18, step 9z
- rules 38 to 44 → Agreements rules 73 to 80, steps 9r, 9s
- rules 18, 29, 38 → Agreements rules 16, 30, 73, steps 9t, 9v
- rules 18, 18a, 30 → Agreements rules 16, 17, 31, step 9u
- rules 40, 43 → Agreements rules 76 and 79, step 9x; rule 43 → 79, step 9y
- Agreements rule 14 (draft-21 era) → Agreements rule 10 (Transfer), step 9ad
- "(with F300)" → Identity "8. Succession"; Agreements "14. Succession", step 8c
- rule 90 (pass criteria): already current
- added: Agreements rule 95 on 9ah, rule 55 on 9e

### 2. Tags dropped
- "(Flaw B14)", "(flaw C)", "(Agreements draft 8, "Open in this draft")", "(G8: version 28 still read …)", "(replacing reading 9)", "(replacing F125 D1)", "(F128: …)" kept as "(where it is held decides nothing)", "(F304: version 27 read …)" made "never complete and never "not complete"", "(as adjusted in F126)", "(withdrawing field 25, …)", "(reading 6, adjusted)", "(reading)", "U1 and U2", "U4b", "the old way", "draft 13's", "Agreements draft 14's", "decided 10 October 2026 … docs/…", "Agreements Q6, taken: version 27 read …", "New in v28", "F307 to F318".
- Every "*Run (…)*" / "*Reasoned …*" status note with its test names and paths. Where a Run note carried a client behaviour that is a test (9f's successor that cannot close; 9g's debt sealing, marked *(conformance)*; 9i's "where it found every act", as information; 9e's caller stating the time reference's answer), it was kept as a plain sentence.
- 9m's and 9i's repo-client notes dropped (tooling, not tested behaviour).

### 3. Written in (decisions)
- "Lane" → "area": 8 ("held the area reaching Money"), 9f, 9j (title and text; the traded terms "signed under the area reaching Agreements: two acts, each counted by its own area"), 9k ("its payee pointer, an act of its area reaching Money, names a rail"), the pass criteria (the adoption sentence reworded after Agreements rule 60's "An area reaching a layer decides what the collective adopts for that layer").
- "Unrecorded" → "pending": 9, 9o.
- 9: "with no concurrency rule neither closes it" → "neither closes it until one names the other" (Agreements rule 91's words; same verdict).
- 9r: the revoked grant's disputed exception added as part of 9r (a third publication acknowledged by its buyer's Money claim, or recorded by a named keeper before the revocation: valid, shown disputed; the unrelied-on one void until adopted), and the revocation citing every act *(conformance)*. Pass criteria: a matching clause (3.9r).
- 9x: "the agent's acts after the revocation are void" → "…, which nobody else acknowledged and no keeper recorded, are void".
- Pass criteria: "acknowledged, paid on or imported" → "acknowledged, cited or paid on" (import retired, rule 77).

### 4. Questions (a verdict could change; text left as it was)
- 8b: "a clone placing the successor elsewhere than in the dead member's place among the parties is refused as unsettled". Agreements 17 says the succession clone puts the successor in the dead member's place (freeze scenarios, "Succession"), but nowhere says what a clone placing it elsewhere is; "refused as unsettled" was an open point of an old draft. Options: (a) invalid while marked with the plan alone, as a clone that reorders the other parties; (b) left as written. Lean (a), the same reasoning as "changes more than the plan gives".
- 9s and 9t: acts after or racing a person's revocation are said "void" with no mention of acknowledgement; under Agreements rule 76 they would be disputed if, say, a buyer's Money claim acknowledged them. As the steps are written nobody acknowledges them, so "void" holds; no change made. Flag only.
- 9h: "an Agreements act of the retired type 21 is no release": Agreements says an act of a retired type is invalid (of a type the MIR does not define). Both give "ends nothing"; wording could say "is invalid". Left.

### 5. A stranger would still trip on
- "the nominee of step 7m", "step 3.7ae", "step 3.9's collective", "deal 4", "Sofia" refer to the first half of scenario 3 (part C1).
- 9e: "the caller states whether the point passed": no interface defines the caller (also in the Agreements stranger's list).
- 9ad: "the window, a stated cost" relies on Agreements rule 10's text.

## Notes, part D (scenarios 4 to 8 and the freeze procedure)

### 1. Rule citations converted
- 5.3 "Text draft 8, rule 14" → "Text rule 14" (heading: What a text act carries).
- 5.7f "rule 29's first case" → "the first case of Identity rule 29's exception" (Identity 15 rule 29, One chain key, one rotation; the wording is now Identity's own client-conformance sentence).
- 7.8b "rule 18b" → "Agreements rule 18" (Each participant's check).
- 8.2 "Development draft 10's rule 22" → "Development rule 22" (One frozen machine).

### 2. Tags and notes dropped
- Every "Run (...)" note with test names, paths, "code after step 15", "the gauntlet", "Module draft 5": 5.5c, 5.5d, 5.7e, 5.7f, 5.7g, 5.8b, 7.8b, 8.1, 8.3, 8.4, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12. Run or reasoned belongs to the freeze report.
- Labels: "(Agreements round 2)" on 5.7f; "(Development Q6)" on 8.9; "(written by the build ... Fable's aggregated review, asked)" on 8.12; "(Development draft 5)" on 8.3; "(Development draft 7, reading confirmed)" on 8.6; "Development Q7, taken: version 27 named draft 3" and "release manifest cMIP draft 4" on 8.7 (now "under a release manifest cMIP"); dated "decided ..." tags and doc paths on 7.8, 7.8a; "roadmap step 13" on 7.8b; the F294, F298, F299, F323, F324 notes and every "version 27 read".
- "new in v28" in the Passes-if lines of scenarios 5 and 8; the "** " residue of "new in" marks on steps.
- 8.1: "Until the freeze the texts are drafts and the hashes clients judge with are test values" (status).
- 8.2: "Deferred" kept as substance, worded as "No published rule in MOR 1", as Development's freeze line says; "to build" dropped; "(which also lets any Module's field 5 name a MIR)" dropped as a side remark.
- 8.9: "The Lightning and on-chain rail Modules ... (their drafts 3 ...)" → "Two rail Modules"; the build's crate and adoption-test detail reduced to "the payment cMIP adopts a Module only from its specification".
- Freeze procedure: "MOR V1", "(Fable)", "round 3", "everything," removed; "a Lightning integration module" → "a rail Module"; step 1's open items as the texts now leave them (running-summary vector, signature-scheme specification format, pinned Unicode version, how a home is queried, unit specification format); "exact formats for Money, Agreements and Development" removed, since the drafts carry them.

### 3. Questions (a verdict could change)
- 8.1 says "a frozen specification committed with a final line break or a trailing space fails the repository's check", as Development's freeze line does; every spec file ends with one line break (question 12). Left as it was.

### 4. Freeze-scenario lines in the MIRs against scenarios 4 to 8
- Identity 15: 5.5c, 5.7e (two lines), 5.7f, 5.7g, 5.8b, 8.4 all exist and test what the lines say. The line "a witness act disowned by its signer keeps no post disputed: 5.7e" matches 5.7e's "the post it named is void, not disputed". The scenario-5 component lines (home rules, audits, homeless, escape, links, succession, outside link, disjoint relays) are covered by steps 5.1 to 5.8.
- Envelopes 11: "A container with a recipient and its capsule stripped ...: a component under 'Envelopes and Text', and 5": no step of scenario 5 strips a recipient. Fix proposed: drop ", and 5" from the Envelopes line (the component line carries it), or add to 5.3 "a relay strips one recipient of a container sealed to two; the other opens it as before".
- Envelopes 11: "Withdrawal, including a payment racing it: 2, 5": 5.4 has no racing payment (scenario 2 may). Fix proposed: "2" only, or "2, 5" kept if part B's scenario 2 does not cover it either.
- Envelopes 11: "Delegated key release at scale, stopping on lapse: 6, 7": the lapse stop is 7.3 and 7.5; fine.
- Development 11: "A Module working under a MIR with no cMIP (a seed Module, an air-gapped signer), naming the MIR in field 5: in the format: 8": no step of scenario 8 tests it. Fix proposed: add to 8.2's commentary or a new step 8.13 "the air-gapped chain key Module is published as a Module whose field 5 names the Identity MIR: in the format"; or drop ": 8" from the line.
- Development 11: "An extension declaring the layers it acts on (field 10); a collective adopting and dropping it with the approval of each layer declared: 3, 8": 8.3 has no collective; check scenario 3 (part C).
- Development 11: "a rule exceeding its budget, or making an environment call, answering unknown on both: 2, 8. Deferred": 8.2 does not state budget or environment call. Fix proposed: none needed while deferred; or add to 8.2 "a rule over its budget, or making an environment call, answers unknown on both".
- Development 11: 8.1, 8.3, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12 match their lines.
- Text 11: scenario 5 (text universal, format lacked shown plain, formatted rendering) matches 5.9.

### 5. A stranger would still trip on
- Scenario titles name uses ("a democracy round", "a nym journalist", "a streaming service", "a subscription service"): test fixtures, not protocol; listed for the report.
- 5.7c's "the gauntlet" and "throwaway homes" are gone; 5.7f/5.7g's Module half is now one conformance sentence.
- "The repository's check" (8.1) and "a listing" (8.3, 8.7, 8.8, 8.10) are named by role only.
- Test identities Ana and Ben (7.8b) stay.
