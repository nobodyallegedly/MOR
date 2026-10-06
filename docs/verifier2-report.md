# Verifier2: a second verifier for collectives' endings, compared with the reference

*6 October 2026. Branch `claude/verifier2-law-endings`. An independent implementation of one part of Law draft 10, written from the specification text alone and then compared with the reference library on 4,000 random collective histories. No rule in `spec/` was changed, and the reference library was not changed: every disagreement below is a finding for Nobody, allegedly, to decide. Written against Law draft 10 as approved for F131 and F132, Identity draft 11 and findings F1 to F140.*

## In plain words

### What was built

A second judge for how a collective ends, in `verifier2/`, in Python, as its own small project. It reads an abstract story of a collective (its members, the rule they decide by, and each act in the collective's name as an id, a signer, a kind and what it cites, never its bytes) and says: which acts are done and count; whether each fork or closing is complete; which complete ending counts; which member's signature on an ending counts or is void; and which successor owes each debt after a fork.

It was written from the text alone: Law draft 10 ("Made before, made after", "Fork (type 19)", "Closing (type 20)", rules 35a, 35b, 36a, 37b, 40, 43, 44d, 47a and 47b), Identity draft 11's chain signature, and findings F131 and F132. The reference's code was not read until the verifier was committed. Where the text left a choice, the choice is written down in `verifier2/README.md` under "Readings", so that a disagreement can be told from a slip. Its own tests are the freeze scenarios on endings (3.9f, 3.9l, 3.9n, 3.9p, 3.9w to 3.9y, 3.9ab, 3.9ac) and the smallest stories IC5, IC8 and IC9, each written from the text.

Then the reference's own generator of random collective histories (`core/tests/law_invariants.rs`) was made to export its stories, with the library's verdicts on each, and both verifiers were run on every story. Each disagreement was shrunk to the smallest story that still shows it, by re-drawing the story from its seed with fewer steps and fewer members.

### How many histories

Two runs of the reference's generator: seed 1, cases 0 to 2,999, and seed 2, cases 0 to 999.

| Stories | Acts judged | Of them by grant keys | Forks and closings | Complete | Collectives ended | Ending signatures |
| --- | --- | --- | --- | --- | --- | --- |
| 4,000 | 40,632 | 4,025 | 4,873 | 2,078 | 1,616 | 13,580 |

On everything the two verifiers both judge, they agree in 3,662 stories of 4,000. The 338 stories where they disagree fall into three readings of the text, below (a story can show more than one): A in 269 stories, B in 47, C in 32. No disagreement was left unexplained. In particular, the two verifiers never disagree on a member's ending signature (U1, U4, U4b: 13,580 signatures), and where they disagree on which ending counts, the cause is always reading C.

### What was found

Three disagreements of reading, each shown by a story of three or four acts, and a fourth found on the first pass and settled by the text's own words. None breaks the promises the invariants test checks (a complete ending stays final, a cited act stays safe, no successor owes a debt outside the fork's history). Each is a place where two careful readers of the same text reach different verdicts, so the text should say which it means.

**A. Can an Identity witness act, which is on neither chain, adopt an agent's act?** A collective can acknowledge an act by a witness act (Identity type 15), which carries no `objects` and so cites nothing on the collective's chain. Rule 40 says the collective adopts a grant key's act by "an act of the collective's own key that counts" that acknowledges or cites it. The reference counts the witness act (no area reaches it, so it counts on the collective's signature), and so the acknowledgement adopts. Verifier2 reads rule 35a and 35b first: an act in the collective's name is done only once it is on the collective's chain, citing its head, and "an action citing no decision ... is on no chain of the collective, and counts for nothing"; a witness act can never cite a decision, so it never counts, and never adopts.

*Smallest story.* Ana and Ben's collective names a split service by a grant. The service sells something with its grant key. The collective revokes the grant from a device that has not seen the sale, so the revocation and the sale cite neither each other. The collective's device then makes a witness act acknowledging the sale. The reference: the sale binds, adopted by the acknowledgement. Verifier2: the witness act counts for nothing, nothing adopted the sale, and the ending wins: the sale is void. (Seed 1, case 63, steps 5, 10 and 18.)

*Why it matters.* The witness act is the one way Identity gives to acknowledge an act one did not sign around (F110), and the collective client may well use it to adopt. If adoption by acknowledgement is meant to work that way, rule 35b's "counts for nothing" needs an exception for Identity's own everyday acts, or rule 42 should say that an acknowledgement adopts only when carried by an act on the actions chain.

**B. What "complete" means for a closing once another ending already counts.** The text says what a closing needs to be complete, and separately that a complete ending is final and a later one naming it counts for nothing. The two verifiers agree on which ending counts in every such story. They disagree on the status shown for the later closing. Verifier2 judges every ending as if it were the one that counted: its own line, the debts in its own history, the departures its own history registers. The reference does that too while choosing the ending that counts; but when asked afterwards for the later closing's status, it judges it with the first ending already in force: debts outside the first ending's history are void, so they are not owed; records after the first ending register nothing, so a departure they carried takes no voice away. So the reference's reported status of a later closing can be "complete" where its own choice judged it incomplete, and the other way round.

*Smallest story, one way.* Ana and Ben fork their collective before any act; the fork is complete and counts. The collective then signs a debt, sealed to every member. Ana drafts a closing whose line holds the debt, naming the fork; both sign it. Verifier2: the closing is incomplete, it owes the debt. The reference: the closing is complete (the debt is void, outside the fork's history) but counts for nothing. (Seed 1, case 243, steps 1, 4 and 7.)

*The other way.* Ana alone holds the Finance lane. The collective signs a debt Ana's signature completes; Ana, Ben and Cy fork, handing the debt to one successor; a record on another device, after the fork's line, registers Ana stepping down from the lane; Ana drafts a closing whose line holds the debt and that record, naming the fork. Verifier2: judged as if it counted, the closing's record registers Ana's departure, which races the debt, so the debt counts for nothing and nothing is owed: complete, counting for nothing. The reference: the record is after the fork and registers nothing, the debt binds and is unpaid: incomplete. (Seed 1, case 1648, steps 7, 14, 15 and 19.)

*Why it matters.* Only what a client shows for an ending that does not count, in these stories; the ending that counts was the same every time. But a verifier's answer should not depend on whether it is asked during or after its choice, and the text could say which judgment "complete" means.

**C. Must a fork hand out an obligation that is on no chain?** A fork must name "every obligation of the original in that history, published or not, paid or not, save one sealed neither to every member nor publicly, which is never the collective's (rule 35a)". The reference reads the exception as the seal alone: a debt in the history that cites nothing on the collective's chain (and so counts for nothing, both verifiers agree) must still be handed out, or the fork does not take effect; listed, it binds no successor (IC5). Verifier2 reads the exception by its reason, "never the collective's": rule 35a makes an act the collective's only once it is sealed and on its chain, so a debt on no chain is never the collective's either, and need not be handed out.

*Smallest story.* A collective's device signs a debt that cites nothing on the collective's chain. Its members fork, naming that debt as the device's tip and handing out nothing. Verifier2: the fork is complete and ends the collective; the debt counts for nothing. The reference: the fork does not take effect, it must list the debt. (Seed 1, case 446, steps 0 and 11.)

*Why it matters.* Under the reference's reading a stray debt that never bound anyone, left by a device that cited nothing, blocks every fork whose line reaches it until the fork lists it and a successor signs for it, for a debt no successor will owe. Under verifier2's reading such a debt is ignored. Which ending counts changed in 15 of the 32 stories, since the reference's fork was not complete.

**D. An action that names no decision but follows one.** Found on the first pass and resolved by the text: rule 35b says an action "names, in its inside's `objects`, ... the decision it acts under", and "an action citing no decision ... counts for nothing"; it also says "its own sequence's previous act counts as cited". Verifier2 first read the last clause as letting a decision reached through the previous act do; the reference reads the format sentence as it stands. *Smallest story:* a publication citing the collective's genesis, then a debt on the same device naming nothing in its `objects`. The reference: the debt is on no chain and counts for nothing. Verifier2, first reading: it counts. (Seed 1, case 4, steps 10 and 13.) The format sentence settles it, so verifier2 now reads it as the reference does, and keeps the first reading as a switch (`--cites loose`). It is recorded here because the sentence "its own sequence's previous act counts as cited" can mislead.

Besides those, a few differences turned out to be slips of mine or gaps in what the abstract model carries, not readings of the text. They were fixed in verifier2 and are listed under "Not disagreements" below, with the reading taken, so that nothing is hidden.

### Rerun after F142 to F144 (6 October 2026, branch `law-gaps-grants-releases-splits`)

The three readings were decided (F142 to F144, F144 reworded after the review of F133 to F144) and built in the reference: a witness act adopts nothing; a fork or closing is judged on its own history, whenever asked; a fork hands out every obligation that binds the collective. Verifier2's default hand-out became `binding` (its reading 1), its readings 11 and 15 now the text's. The same two runs were exported again (seed 1, cases 0 to 2,999; seed 2, cases 0 to 999) and compared.

| Stories | Agree on everything | Differ | Kinds of disagreement |
| --- | --- | --- | --- |
| 4,000 | 3,738 | 262 | one |

On every story, the two verifiers now agree on which ending counts, on every fork's and closing's status, on every member's ending signature, on every debt's debtors, and on every act in the collective's name but one kind. The one kind is the collective's own Identity witness act (type 15, the acknowledgement): the reference counts it as the collective's act, which adopts nothing (F142) but still places the members' signature acts it acknowledges; verifier2 counts it for nothing in Law (rule 35b: on neither chain). 333 such acts in 262 stories (257 in 203 of seed 1, 76 in 59 of seed 2). It was the "witness act alone" story of finding A, which F142 did not decide: recorded as **F151**, for Nobody, allegedly. Neither verifier was changed for it.

To reproduce: as above, with `--handout binding` (now the default); `python3 verifier2/group.py cmp.json` prints the one group.

## Precisely

### Files

- `verifier2/law_endings.py`: the verifier; `verifier2/test_law_endings.py` and `verifier2/stories/`: its tests, one per freeze scenario or smallest story.
- `verifier2/export/export.rs`: the exporter, included as a child module at the end of `core/tests/law_invariants.rs` (the one change to a file outside `verifier2/`: four lines, test-only, ignored unless asked for; the reference's own tests pass unchanged, 22 of 22).
- `verifier2/compare.py`, `shrink.py`, `render.py`, `group.py`, `classify.py`: the comparison, the shrinker, a plain-words rendering, the grouping of disagreements by reason, and the sorting of disagreeing stories into the findings above.
- `verifier2/stories/compared/`: each shrunk story below, as exported, with the reference's verdicts beside it.
- `verifier2/README.md`: the story format, the verdict format, and every reading taken.

### Seeds

Every story is drawn as the reference draws them (`docs/law-invariants.md`, "Seeds"): the run seed keys the generator, and case *i* of a run is the *i*-th story drawn. The exporter takes `VERIFIER2_SEED` and `VERIFIER2_CASES`; a shrunk story is re-drawn from the same seed and case with only the named steps applied, and a smaller shape (fewer members, devices, lanes), so it is reproducible by seed, case and step indices. The two runs: seed 1, cases 0 to 2,999 (3,000 stories, 44 seconds per 500 in a release build); seed 2, cases 0 to 999.

### What was compared

For each story: the ending that counts; each fork's or closing's status (no ending by U4b, incomplete, complete) and whether it counts; each member's chain signature on each ending (counts or void); for each act in the collective's name, whether it counts, meaning: done, on the chain, its area's consent met, backed by its grant, not void by the tie rule, or adopted; and each debt's debtors after the fork that counts. The reference's answers are read as: `closed_by`; `fork` and `closing` (`complete`), `ending_sigs` (`counting`, `void`, `no_ending`); for a debt `obligation_binds`, for a grant key's act `consent` and `backing`, for a record `record(..).line` and `after_closing`, otherwise `consent`; `debtors`. Verdicts resting on rules outside the scope are left out of the comparison and marked in the export: a receipt on a rail the collective's pointer does not name (Finance rule 12a), a split service's grant key signing a payout (H5, H7), a specification not adopted. Whether the collective holds a stake (N9) is read from the generator: its collective holds its work where it owns one, and nothing in the stories releases it, so no closing of such a collective is complete, in either verifier.

### The disagreements, as stories

Each story is in `verifier2/stories/compared/` (`<name>.story.json`, `<name>.ref.json`); `python3 verifier2/render.py verifier2/stories/compared <name>` prints it with both verdicts.

| Finding | Story | Seed, case, steps | Shape | Stories showing it |
| --- | --- | --- | --- | --- |
| A | `a-witness-act-adopts` | 1, 63, steps 5, 10, 18 | 2 members, 1 device, a split service | 269 |
| A (the witness act alone) | `a-witness-act-counts` | 1, 9, steps 10, 11, 18 | 2 members, 1 device | |
| B | `b-closing-after-a-fork` | 1, 243, steps 1, 4, 7 | 2 members, 1 device | 47 |
| B (the other way) | `b-closing-owes-after-a-fork` | 1, 1648, steps 7, 14, 15, 19 | 3 members, 2 devices, a Finance lane held by one | |
| C | `c-uncited-debt-handed-out` | 1, 446, steps 0, 11 | 5 members, 1 device | 32 |
| D | `d-action-naming-no-decision` | 1, 4, steps 10, 13 (compared with `--cites loose`) | 2 members, 1 device | (first pass) |

**A, precisely.** Rule 42: "An acknowledgement of a grant key's act counts as an adoption only when it is an act of the collective's own key that counts (rule 40), wherever it sits (C6)." Rule 35a: an act in a collective's name "is done, and binds the collective, only once it is sealed to every member ... and it is on the collective's chain, citing its head as its signer knew it (rule 35b). Before that, even signed, it is planning, and binds no one ... it counts for nothing in Law". Rule 35b: "Identity's own everyday acts carry no objects and are on neither chain." The reference: `LawView::consent` answers `NoArea` for the witness act, and `backing` takes it as an adopter (`Backing::Binds`). Verifier2: `done` is false for any act whose `objects` name no decision of the collective, so the witness act counts for nothing, and only acts that count adopt. Both agree the witness act itself binds nothing; the difference is whether it adopts.

**B, precisely.** "A closing is complete when: ... the collective owes nothing (F125, D5): every obligation that binds it and lies before its line, that is, in the history it cites ... is fulfilled in full by receipts a verifier holds, or ended by its creditor's release"; and, for a complete ending, "after its line, the collective's keys count for nothing in Law". The reference: `closed_by` judges every ending while its own re-entry guard makes `closed_by` answer `None`, so no ending is in force during the choice; once the choice is cached, `closing(id)` for a later ending uses `obligation_binds`, which applies `after_closing` (the first ending's tie rule), and `departure_lines`, which drops records after the first ending (IC8). Verifier2 judges each ending's completeness with that ending taken as the one that counts (its `judge_acts(e)`), both while choosing and when reporting. The reference's own order-independence test (`verdicts()`) records `closing=(complete, why, open_debts)` after `closed_by`, so what it checks for determinism is the post-hoc status.

**C, precisely.** "Fork (type 19)": "field 6 names every obligation of the original in that history, published or not, paid or not, save one sealed neither to every member nor publicly, which is never the collective's (rule 35a), one signed with a grant key included; ... otherwise the fork does not take effect". The reference's `to_hand_out`: every valid obligation signed by the collective, `sealed_to_all`, before the line; no check that it cites the chain or that its lane signed it. Verifier2's `obligations_to_hand_out`: every obligation in the history that is done, where done is rule 35a's sealed and on the chain. Both agree that such a debt counts for nothing and that, listed, no successor owes it. Both read alike on a debt the lane never signed: it is handed out (the reference's oracle, `FORK-HANDS-OUT`, requires less than its library, since it checks only that binding debts are listed).

**D, precisely.** Rule 35b, as quoted above. Verifier2's `Story.on_chain`, strict: the action's own `cites` name a decision; loose: a decision lies in its history. The reference's `Consent::Uncited`: "it does not cite, on the collective's chain, the decision it acts under".

### Not disagreements: fixed in verifier2 on the second pass

Found by the comparison and corrected as slips or gaps of the abstract model, each with the reading taken, in `verifier2/README.md`:

1. **Identity's "scoped" status.** An act signed with a grant key has Identity status `Scoped`, not `Valid`; the first export marked it invalid. Fixed in the exporter.
2. **"Holds nothing".** The generator's collective holds a stake in its work where it owns one; the first export said it held nothing, so verifier2 completed closings the reference refused under N9. Now read from the generator (out of scope).
3. **A record signed with a grant key** did not decode in the exporter (it names a departure that is no act) and was left out, so acts citing it seemed to cite nothing. Now exported; both verifiers hold that a grant key signs no decision.
4. **The agreement in force at a record or a line** (rule 37c, B2): a record on a device that never saw the record of the clone naming the split service names that clone as its agreement, and is no line; verifier2 did not model agreements in force. Now: the clone written by the furthest done record in the act's history, else the founding agreement.
5. **A grant's acceptance** was folded into the grant's own counting; rule 44 puts it with the grant key's act. Moved.
6. **A fork's successors** (N1, N4): a member whose resignation the fork's line does not hold is a voice at the line, on no side, and must be kept by every successor as a departed holder; verifier2 did not see successors' founding terms. Now exported and checked (parties and departed holders; shares are not modelled).
7. **Genesis**, and verdicts outside the scope (rails, the split service's limits, unadopted specifications), left out of the comparison.

### What this did not cover

Successors' own forks and inherited debts; rotations of the collective and clones changing its members; stakes, releases and "holds nothing" beyond the generator's one shape; payments and purchases beyond a creditor's receipt and release; keepers; deals. The generator's stories hold every act (nothing is unheld), so the "not held" rule is tested only by verifier2's own scenario.
