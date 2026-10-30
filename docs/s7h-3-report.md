# S7h-3, the redesign's last text points: report

*Session S7h-3, 30 October 2026, on branch `claude/s7h-the-redesign` (pull request 113), beside the Dubsar Suite's round on the same branch. It wrote F405's decisions into the texts, made scenario 9 agree with the MIRs, and ported the second verifier's export. It recorded no finding: F406 stays free. It touched only `spec/`, `core/` (tests, vectors, README), `verifier2/` and `docs/`. Nothing in the core library changed, so the WebAssembly and every binding's answer are as they were.*

## The sentences written

**Agreements draft 17:**

- **Rule 14, "A vow has an owner" (Q1):**
  - An ownership agreement claiming a vow gives its signer the whole stake, as before.
  - **A publication selling a vow that no ownership agreement claims is a lone seller's publication: its drafter is its owners' side, and its owners' line is the drafter's.**
  - *Stated cost:* a vow's owner is paid by a publication of her vow only where she drafts it, is one of its partners, or claims the vow under an ownership agreement it names.
  - The worker's example now claims her vow first.
  - The "No owner" bullet ("counts whether or not it pays the vow's signer") now agrees with the rule.
- **Rules 11 and 30 (Q2):** "On the owners' line, each holder paid owes back their own payout: the party is the ownership agreement, and what it received is what its holders were paid." Rule 30's obligation of another identity says the same.
- **Rule 58 (Q3):** "The two sentences answer two questions: whether an act counts for the collective is decided by the first, as soon as it is done and cites the latest decision; what an ending's or a record's line holds is decided by this one alone."
- **Rules 64.3 and 83 (Q4):**
  - A clone marked with a succession plan puts the seat successors in the party's place in every layer's rule naming it (field 19, `[2, names]`), nothing else in the layers' rules changed.
  - Rule 83 says why: a layer's rule is the collective's own rule for a whole layer, not a job given within it, and one naming a party who left could never be met again.
  - Areas (field 34) still pass to nobody.
- **Rule 12 (Q5):** "A sale before a price tag's withdrawal is a payment naming the tag's earlier version, the one carrying a price; a payment naming the version with no price is no purchase, owed back as a payment naming a tag the publication does not count. The payment decides, as for wrong receipts below." See question 1: the decision also named rule 12's push-rail test, which the core does not apply to a tag's withdrawal.

## Scenario 9

- **9.1:**
  - The transfer names the ownership agreement, its chain, and no longer "the work's chain".
  - The split service's open obligation to Cy runs "from the service's first split citing the transfer (split key 8)", as rule 10 writes it. That is the stranger's case 5, settled: the text was clear.
- **9.2:**
  - The founding's key grammar names an escrowed share as its recovery path.
  - The re-dealt key is "both needed, the escrowed share kept as the way that survives the loss of either", so it keeps rule 59.
- **9.3:** the declaration states outcome 0, the dead member's voice removed (the stranger's case 16). See question 2 for case 17.
- **9.5:**
  - A person's homeless rotation under the objection, with no endorsement, "does not count: it stays pending while the old home lives".
  - The pass line now says the collective escapes "by its homeless rotation, its own escape endorsement, which no member signs".
- **9.7:**
  - What MOR 1 checks is the source alone: the bake, the claim and the ownership agreement, each valid in core format, read without any publication.
  - A successor changes the tag prefix, so each act is made anew under MOR 2, its content as it was.
  - How MOR 2 checks what it makes anew is MOR 2's.

## The second verifier's export

VERIFIER2_PLACEHOLDER

## Vectors

- **Every earlier case keeps its verdict, its acts and its ids.** No case was exactly one of this session's decisions.
- **Four Agreements cases added**, all in `core/vectors/README.md`:
  - a platform's publication of a worker's vow that no ownership agreement claims: a purchase, its drafter the owners' side;
  - a succession clone putting the seat successor in the departing member's place in the rule for Text: not invalid;
  - the same clone leaving that rule naming the departed member: invalid;
  - scenario 9.5, a person's homeless rotation under an objection: pending.
- **The decisions already shown by earlier cases:**
  - Q2 by 9.6's "owed back by: label 150, Ana 340, Ben 510";
  - Q5 by 9.6's withdrawn tag and the sale before it.
- **Checks:** the Rust check passes 10 of 10, and the Python check says "all 276 vectors agree".
- **Readmes:** `core/vectors/README.md` and `core/README.md` are updated. `scripts/c-box/vectors-README.md`, the box's copy, is outside this session's folders and stays at S7h-2; see question 4.
- **The core test that waited on Q1** (`f285_…_is_its_drafters`) is rewritten to the decision and passes.

## The stranger's reading

STRANGER_PLACEHOLDER

## Questions

Each is in plain words, then precisely, with the options, my lean and its cost.

1. **The tag's withdrawal and the push-rail test (Q5).**
   - *Plain words:* the decision says a sale before a tag's withdrawal is the payment naming the earlier, priced version, "under rule 12's push-rail test". The core decides it by the version the payment names alone. A payment naming the priced version counts, even when the split service records it after the withdrawal.
   - *Options:*
     - (a) The text as written: the version named decides, as for wrong receipts. This is what the core does.
     - (b) Add the push-rail test: a receipt whose history holds the version with no price is owed back. That changes the core, and so the WebAssembly.
   - *Lean:* (a). *Cost:* a buyer who paid the old version after its withdrawal keeps the purchase, and the seller bears it, as a seller on a push rail already does.
2. **A plan passing a stake (the stranger's case 17).**
   - *Plain words:* rule 83 says a succession clone "carries the stakes and seats the plan gives", but rule 64.3's list of what a plan-marked clone may change leaves out the stake (field 7). The core refuses a plan-marked clone that changes field 7. So scenario 9.3's "their share to two children" cannot pass in the automatic clone.
   - *Options:*
     - (a) Add "the stake passed to its stake successors in its shares, field 7" to rule 64.3. The core would follow, and the WebAssembly changes.
     - (b) Say that the stake passes by succession outside the plan-marked clone (rule 89).
   - *Lean:* (a), since rule 83 is plain. *Cost:* one core change, which the suite rebuilds against.
3. **A plan's clone that changes a layer's rule beyond the successor (Q4).**
   - *Plain words:* the texts now allow only the successor in the party's place. The core accepts any change to field 19 in a plan-marked clone; it refuses only a rule naming someone no longer a party.
   - *Lean:* tighten the core to the text. *Cost:* a core change, so the WebAssembly changes.
4. **The c-box's own vectors README** (`scripts/c-box/vectors-README.md`) is outside the folders this session may touch, so it lacks this session's bullet.
   - *Lean:* copy the bullet from `core/vectors/README.md` when the scripts are next open.

## Still open from S7h-2, in the core

These are core work, so they change the WebAssembly, and they were outside this session. `core/tests/agreements_collective.rs` still skips 17 tests:

- **12:** rule 93 for publications, a payment under a publication the collective signed during a broken stretch, owed back.
- **1:** rule 48 on a split agreement's versions.
- **4:** the owners' matters on a collective's split agreement.

S7h-2's report counted these as "the original ignores". They are gaps in the core, not tests waiting on a text.

## c-box

`scripts/c-box/make-c-box.sh` into a scratch folder assembled 8 texts and 12 vector files, refusing nothing.

## Checks

CHECKS_PLACEHOLDER
