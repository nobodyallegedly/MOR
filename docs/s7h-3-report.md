# S7h-3, the redesign's last text points: report

*Session S7h-3, 30 October 2026, on branch `claude/s7h-the-redesign` (pull request 113), beside the Dubsar Suite's round on the same branch. It wrote F405's decisions into the texts, made scenario 9 agree with the MIRs, and ported the second verifier's export. It recorded no finding: F406 stays free. It touched only `spec/`, `core/` (tests, vectors, README), `verifier2/` and `docs/`. Nothing in the core library changed, so the WebAssembly and every binding's answer are as they were.*

## The sentences written

**Agreements draft 17, the MICS and the suite:**

- **Rule 14, "A vow has an owner" (Q1).**
  - An ownership agreement claiming a vow gives its signer the whole stake, as before.
  - A publication selling a vow that no ownership agreement claims has the owners' side rule 11 gives any publication. Naming no ownership agreement, it is a lone seller's: its drafter is its owners' side, and its owners' line is the drafter's.
  - *Stated cost:* a vow's owner is paid only where she drafts the publication, is its partner, or claims the vow under an ownership agreement it names.
  - "No owner" now flags a publication selling her vow that pays her nothing.
  - The same is written in the MICS's bullet, Agreements' format of a publication naming a vow, its freeze line, the suite's two component lines and its case 9f, where the cleaner now claims her vow first.
- **Rules 11 and 30 (Q2).** "Where the owners' side is an ownership agreement, each holder paid on its line owes back their own payout": a holder that is itself an ownership agreement owes it back through its own holders. "This obligation is this rule's, as the split service's is, not one the terms write: it is open whether or not the holder signed the publication." That last part keeps it clear of rule 1's "shown as unsigned".
- **Rule 58 (Q3).** Its sentence on placement now ends "one nothing cites is outside every line", and goes on: "This decides what a line of the collective holds (an ending's, a record's, a rotation's through the signature acts it names), and nothing else: whether an act counts for the collective is decided above, as soon as it is done and cites the collective's latest decision as the signer knew it. An act outside every line still counts; no ending, record or rotation holds it." The words "and counts for nothing" were struck from that sentence: the decision gives it lines alone.
- **Rules 64.3 and 83 (Q4).** A plan-marked clone puts the seat successors in the party's place in every layer's rule naming it (field 19, `[2, names]`). One already named there is written once, and nothing else in the layers' rules changes. Areas still pass to nobody.
- **Rule 12 (Q5).** "A sale before a price tag's withdrawal is a payment naming the tag's earlier version, the one carrying a price, settled as above."
  - On a request rail, the version the request committed to decides.
  - On a push rail, a receipt whose history does not hold the version with no price is a sale. One whose history holds it is no purchase, owed back, and so is a payment naming the version with no price.
  - **The core does not yet apply this push-rail test to a tag's withdrawal** (question 1).

## Scenario 9

- **9.1.**
  - The transfer "names the ownership agreement, its chain", no longer "the work's chain".
  - The split service's open obligation to Cy runs "from the service's first split citing the transfer (split key 8)", as rule 10 writes it. That is the stranger's case 5, settled.
- **9.2.**
  - The founding's key grammar names an escrowed share released by the abandonment authority.
  - The re-dealt key is "both needed, and an escrowed share of the new key where the recovery path puts it", which keeps rule 59.
- **9.3.** The declaration states outcome 0, the voice removed (the stranger's case 16). Case 17 is question 3.
- **9.5.**
  - A person's homeless rotation under the objection, with no endorsement, "does not count, the person's chain ending before it", citing Identity rules 49 and 53.
  - The decision's "pending while the old home lives" is not written: Identity rule 49 says one valid objection voids it (question 2).
  - The pass line says the collective escapes "by its homeless rotation, its own escape endorsement, which no member signs".
  - Receipts are cited as Identity rule 20, where the text had rule 7.
- **9.7.**
  - A successor changes the tag prefix, so each act is made anew under MOR 2, saying what it said, with every hash new, its work hash and claim among them (Development rule 27).
  - What MOR 1 checks is the source alone: the bake, the claim and the ownership agreement, each valid in core format, read without any publication.
  - The claim that "nothing in the ownership agreement needs to change" is dropped.

## The second verifier's export

VERIFIER2_PLACEHOLDER

## Vectors

- **Every earlier case keeps its verdict, its acts and its ids.** No case was exactly one of this session's decisions.
- **Three Agreements cases added**, all in `core/vectors/README.md`:
  - a platform's publication of a worker's vow that no ownership agreement claims: a purchase, its drafter the owners' side;
  - a succession clone putting the seat successor in the departing member's place in the rule for Text: not invalid;
  - the same clone leaving that rule naming the departed member: invalid.
- **Not added:** scenario 9.5's case. It does not yet agree (question 2).
- **The decisions already shown by earlier cases:**
  - Q2 by 9.6's "owed back by: label 150, Ana 340, Ben 510";
  - Q5's cases written so far by 9.6's withdrawn tag and the sale before it. A payment naming the priced version after the withdrawal has no case until the core follows (question 1).
- **Checks:** the Rust check passes 10 of 10, and the Python check says "all 276 vectors agree".
- **Readmes:** `core/vectors/README.md` and `core/README.md` are updated. `scripts/c-box/vectors-README.md`, the box's copy, is outside this session's folders and stays at S7h-2; see question 4.
- **The core test that waited on Q1** (`f285_…_is_its_drafters`) is rewritten to the decision and passes.

## The stranger's reading

A reader given only the eight texts read each changed sentence, and scenario 9 whole. **Its first reading found the first draft did not yet read as one story.** Each point was answered in the texts above:

- **Rule 14's decision was contradicted by text that had not changed:** the MICS, the suite's component lines and 9f, Agreements' freeze line and the publication format. All now say the drafter is the owners' side.
- **Rule 58's new sentence contradicted the one it explained.** That sentence now decides lines alone, "as the signer knew it" kept.
- **Q5's first wording let a payment naming the priced version count after the withdrawal**, against rule 11, the suite and Money rule 18. It is now settled as a push rail settles (question 1).
- **Rules 11 and 30 ran into rule 1's "shown as unsigned"**, and wrote "the party is the ownership agreement" of a lone seller too. The obligation is now the rule's own, and holds only where the owners' side is an ownership agreement.
- **9.5's "pending" ran against Identity rule 49** (question 2).
- **9.7's "content as it was" ran against Development rule 27's "every hash is new".**
- **Rules 64.3 and 83 gave a reason the rules do not support** ("never met again"). It is struck, and the case of a successor already named is written.
- **Points outside the decisions:** listed as question 5.

What it found fitting at once: 9.1's transfer wording, 9.2's re-dealt grammar under rule 59's "both" option, 9.3's outcome 0, and 9.5's and 9.7's pass lines.

**A second reading** of the answered texts found these fitting:
- the vow story across the MICS, rule 14, 9f and the lists;
- 9.1's obligation window;
- 9.2's re-dealt grammar under rule 59;
- 9.3's outcome 0;
- 9.5 against Identity rules 20, 49 and 53;
- the `[3, vow]` format line;
- the pass lines.

What it found next was answered in turn:
- **Rule 58.** The new sentence denied the tie rule's and placements' use of lines. It now says a line decides whether an act counts "only where 'Made before, made after' says so".
- **The transfer.** The MICS, the suite's list, its scenario 1.4 and Agreements' freeze line still had it naming "the work's chain". All now say "the agreement's chain", as its format and 9.1 do.
- **The holders' refund** (Q2) is carried into the MICS, the suite's list, its scenario 2.6, 9.6 and its pass line.
- **The vow.** Read "as a lone seller's, whoever signed the vow". "No owner" comes before she signs anything about it, everywhere. The MICS's stated cost names "an ownership agreement the publication names". 9f shows the platform's lone publication of her claimed vow as outside her agreement.
- **Layers' rules under a plan.** The successor is written "once for each seat, as in field 0", so a successor already named gains no power by the plan, and the false-mark list names layers' rules too. The format is written `[2, [+ hash]]`.
- **9.7.** The bake's work hash is no longer said to cross unchanged, and Development rule 27 is cited for "every hash is new" alone.

Left as questions:
- the price tag's withdrawal (question 1, with two further points: a plain change of price, and a withdrawal signed by the designated party, which the split service's history may not hold);
- the lone seller of another's vow, read by rule 11's words "sells what its drafter owns alone";
- 9.1's citation of rule 30 beside rule 10's "receipted or not";
- rule 11's and rule 12's two racing tests for a receipt on another of the service's sequences.

They are added to question 5.

## Questions

Each is in plain words, then precisely, with the options, my lean and its cost.

1. **A tag's withdrawal and the push-rail test (Q5).** *This needs the core, so the suite rebuilds.*
   - *Plain words:* the text now settles a sale before a withdrawal as a push rail settles an ending: a receipt the split service records after the withdrawal is in its history is no sale. The core decides by the tag version the payment names alone, so a payment naming the old, priced version counts even when recorded after the withdrawal.
   - *Options:*
     - (a) The core follows the text. It changes `publishing.rs`'s purchase check, and so the WebAssembly.
     - (b) The text says "the version named decides". That was this session's first draft, and the stranger showed it runs against rule 11's "stops sales at that price", the suite's 2.6 and 9.6, and Money rule 18's "the latest version counts".
   - *Lean:* (a), in a session allowed to change the core.
2. **A person's homeless rotation under an objection (9.5).**
   - *Plain words:* Identity rule 49 says one valid objection from a live home voids a homeless rotation. The core shows it "pending" while the old home is not shown gone. The decision says "pending while the old home lives".
   - *Options:*
     - (a) The core follows rule 49 and shows it void. That is a core change.
     - (b) Identity says such a rotation is pending until the old home is shown gone, and void once its objection is held. That is a text change, beyond this session's decisions.
   - *Lean:* (a). *Cost:* a core change. Meanwhile 9.5 says "does not count", which both readings give, and its vector waits.
3. **A plan passing a stake (the stranger's case 17).**
   - *Plain words:* rule 83 says a succession clone "carries the stakes and seats the plan gives", but rule 64.3's list leaves out the stake (field 7), and the core refuses a plan-marked clone that changes it. So 9.3's "their share to two children" cannot pass in the automatic clone.
   - *Options:*
     - (a) Add the stake to rule 64.3, and the core follows (WebAssembly).
     - (b) Say that the stake passes by succession outside the plan-marked clone (rule 89).
   - *Lean:* (a), since rule 83 is plain.
4. **A plan's clone changing a layer's rule beyond the successor (Q4).**
   - *Plain words:* the texts allow only the successor in the party's place. The core accepts any change to field 19 in a plan-marked clone; it refuses only a rule naming someone no longer a party.
   - *Lean:* tighten the core to the text. *Cost:* a core change.
5. **The stranger's points this session did not change**, each outside the decisions:
   - Agreements' freeze line "transfer naming both chains";
   - 9.1's pass line "from the next payment", beside rule 10's stated-cost window;
   - 9.3's "counts twice" beside rule 81's "no voting weight";
   - 9.3's fourth case, "the other signature acts" where "nobody but the declared member remains";
   - rule 11's "sells what its drafter owns alone", beside a lone publication of another's vow;
   - 9.1's citation of rule 30, beside rule 10's "receipted or not";
   - rule 11's and rule 12's racing tests, which differ for a receipt on another of the service's sequences;
   - a tag's price change, and a withdrawal signed by the designated party, under Q5's push-rail test.
   - *Lean:* one pass of words in the next text session.
6. **The c-box's own vectors README** (`scripts/c-box/vectors-README.md`) is outside this session's folders, so it lacks the S7h-3 bullet.
   - *Lean:* copy it from `core/vectors/README.md` when `scripts/` is next open.

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
