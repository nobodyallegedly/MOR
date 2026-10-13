# F282 and F284: written in and built

*13 October 2026, afternoon. One roadmap step: the core's business decided on 13 October 2026 (F282, F284), written into the texts and built. Test identities only. For Nobody, allegedly, to approve: Agreements draft 13, the MICS v26, the freeze suite v26 and case study 12, draft 7.*

## In plain words

**F282, who signs what pays them less in a collective.** Your words: "Q2 also answers itself. A new agreement is born. All signature are needed, yes it is born from a clone." Anyone holding part of a collective's income without being a member signs any new version that pays them less: a member who left, a successor who inherited a stake, someone who bought part of one. The code already worked this way (it was built as the reading in the last session). What changes is the text: the "to confirm" mark becomes your decision, in Agreements, the MICS and the freeze suite.

**F284, a deal made on a vow has an owner.** Your words: "The deal in question is based on a vow. Somebody owns the vow." A cleaner signs a vow: "two hours of cleaning, at your home". A platform books her. The job's agreement writes a stake in her vow, and that stake is hers. The platform's fee comes off the top, and what is left is hers. Because she holds a stake, she now has an owner's protection: the platform cannot raise its fee without her signature.

What the core now does:

- **A stake in a vow belongs to whoever signed the vow.** Terms that write a stake in her vow held by the platform, or shared between her and the platform, are refused, even if both sign them. In a collective, a member's vow is that member's, and the collective's own vow is the collective's.
- **After that, she can do with it what any owner can.** She can sell part of it, or sign a version that shares it. The rule only fixes who holds the stake when it is first written.
- **The platform raising its fee needs her signature.** In a deal she is a party, so she signs every version anyway. Where she is not a party (the job's deal is between the platform and the client), the protection from F270 applies to her as a holder. Both cases are tested.
- **A deal that sells a vow must write its stake.** If a platform's deal sells her vow but writes no stake in it, its offer does not count. I built this as the reading I think fits your decision, marked "to confirm". It is the one question below (Q1).

The deal-assessment tool gets a new warning, **"No owner"**: terms that divide money but write no stake. Everything is then overhead, and nobody gets an owner's protection. It now flags case study 21's award (Noor is paid as overhead, with no stake). I have not changed that case study, since only case 12 was asked for. The tool's renovation job (case 12) is rewritten with the worker's stake in her vow.

**Budgets:** you said "This is cMIP business", so no core text changes. The MICS and Agreements each carry one line of commentary saying budgets are not vows.

**Case study 12, draft 7.** Every trade is now written under F284, in the study's own voice:

- the gig worker's job, the driver's ride, the designer's commission and the handyman's jobs are each made on that person's vow;
- the delivery is made on the restaurant's vow (the meal);
- the holiday stay is made on the host's vow;
- each owner holds the stake, and the platform, the courier, the cleaner and the helpers come off the top.

Nothing else changed.

**One question for you** (below, Q1): what the core does with a deal that sells a vow but writes no stake in it.

## Do the tests and implementations pass

Yes. Every step of `scripts/test-all.sh` was run on main and on this branch, each to the end, without stopping at a failure:

| | Rust | TypeScript |
| --- | --- | --- |
| main (`dc7cec1`) | 672 passed, 0 failed, 1 ignored | 371 of 372, in 17 packages; the one failure in `clients/site` ("every department's door verifies…") |
| this branch | 676 passed, 0 failed, 1 ignored (672, plus 4 new in `core/tests/agreements_collective.rs`) | 373 of 373, in 17 packages (`clients/assess` 51: one test added) |

The ignored Rust test is the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set. `clients/site`'s test failed on main's run and passed on the branch's, with nothing in `clients/site` changed: it looks timing-dependent (it drives Chromium), and it is not this branch's. The steps were run by a script running each of `scripts/test-all.sh`'s commands to the end; every step passing on the branch is what `scripts/test-all.sh` reports as "All tests passed". `wasm-bindgen` 0.2.129 was installed outside the repository; the site's browser tests used the container's Chromium.

**Seen failing first:**

- **Core.** The four new tests were written before the code. Three failed:
  - the platform holding the stake in her vow was accepted;
  - the offer under a deal with no stake in the vow counted;
  - a collective's version writing a member's vow held by another was ready.

  The fourth (the cleaner, who is no party, must sign a fee raise) already passed: F270 covers it. It is kept as the freeze step's proof.
- **Deal tool.** With the tool's code put back as on main and the new tests kept, two tests failed: the new "No owner" flag test, and the award, which now carries the flag. Both pass with the change.

## Precisely

### The texts

**Agreements draft 13** (`spec/MIR-agreements-draft-13.md`). Draft 12 stays as it is, approved. Every change is marked:

1. **Header**, a new first paragraph:
   - "*Draft 13, 13 October 2026 (afternoon), for Nobody, allegedly, to approve: draft 12 (approved 13 October 2026, his reading to follow), with two decisions written in, each change marked "new in draft 13 (F282)" or "new in draft 13 (F284)".
   - **F282** (decided by Nobody, allegedly: "Q2 also answers itself. A new agreement is born. All signature are needed, yes it is born from a clone"): in a collective, every holder who is no member signs what pays it less, departed members, successors and buyers alike, where draft 12 marked it "Reading, to confirm (Q2)" (rule 48).
   - **F284** (decided by Nobody, allegedly: "The deal in question is based on a vow. Somebody owns the vow"): a deal made on a vow has an owner, the vow's signer, who holds the stake; the overhead comes off the top, and what is left is the owner's, with F280's and F270's protection (rule 14, the glossary's stake, the stakes' format, a freeze line).
   - Two readings taken writing F284 in are marked "reading, to confirm" (`docs/f282-f284-build.md`): the stake held wholly by the signer in the version first writing it, and how the core reads a deal selling a vow it writes no stake in (its Q1).
   - F284's budgets ("This is cMIP business. The vote and the vows they then create as an answer to the common need are separate parts") change no core text.
   - **Nothing else changes**: every other rule, format, mark and freeze line is draft 12's, word for word, and draft 12's header follows unchanged. Findings F1 to F284.*"
2. **Glossary, "Stake"**, a line added after the collective's own stake: "**A stake whose object is a vow is held by the vow's signer: a deal made on a vow has an owner** (new in draft 13, F284; rule 14)."
3. **Rule 14**, after its mechanic on "signed under that claim's agreement", new paragraphs:
   - "**A deal made on a vow has an owner: the vow's signer, who holds the stake** (new in draft 13, F284). A stake an agreement writes in a vow, its object the vow's name, is held by the vow's signer; in a collective's terms, the collective's own vow is held by the collective, written null (S1). The overhead (a platform's fee, a helper's share, a fee) comes off the top (rule 22, F280), and what is left is the owner's. A version that pays the owner less needs the owner's signature where the owner has no voice in the power making it (rule 48, F270): in a deal the owner who is a party signs every version anyway (rule 47). Terms writing a stake in a vow held otherwise are invalid, signed by every party or not."
   - In italics, his words and the worker's example: "*"The deal in question is based on a vow. Somebody owns the vow" (Nobody, allegedly).* *A worker's vow, a job booked through a platform: the job's agreement writes the stake in her vow, held by her; the platform's fee comes off the top; what is left is hers, and the platform raising its fee needs her signature.*"
   - "*Reading, to confirm (`docs/f282-f284-build.md`):* the vow's signer holds the whole stake in the version that first writes it (the founding terms, or a clone whose parent writes no stake in that vow). From then on the stake moves as any stake moves: by its holder's transfer (rule 10), by succession (rule 89), or by a version its holder signs (rule 48), so the owner may sell or share what she owns."
   - "*Reading, to confirm (`docs/f282-f284-build.md`, Q1): a deal silent on the vow it sells.* **An offer made under an agreement and naming a vow counts only where the version it is made under writes a stake in that vow**; a collective's offer of its own vow needs none, its income going to the collective's own stakes (rule 68). A lone seller's offer is under no agreement: selling her own vow, the seller is its payee (F215)."
   - "*Mechanic, the build's:* the vow's signer is read from the vow the verifier holds, by its name (its genesis). A verifier that does not hold the vow cannot tell its name from a work's hash, and judges neither check, as for an offer's `[ 3, vow ]` ("Standing offer (type 6)")."
   - "*Budgets are not vows (F284): the vote that decides where a common budget goes is a cMIP's; the projects answering the need make vows, each a deal with its owner, which the budget pays. No core text.*"
4. **Rule 48**:
   - **Before:** "- in a collective, a departed holder (rule 68). *Reading, to confirm (`docs/f270-build.md`, Q2; new in draft 12, F279): in a collective, every holder who is no member, as a departed holder: a stake successor who received a stake by succession (rule 83), and a holder who bought part of a stake (rule 10).*"
   - **Now:** "- in a collective, **every holder who is no member: a departed holder (rule 68), a stake successor who received a stake by succession (rule 83), and a holder who bought part of a stake (rule 10)** (new in draft 13, F282: draft 12's reading of Q2, decided). *"Q2 also answers itself. A new agreement is born. All signature are needed, yes it is born from a clone" (Nobody, allegedly): a change paying such a holder less is a new version, born from a clone, and every holder it pays less who has no voice in the power making it signs it.*"
5. **The stakes' format** (terms, `stakes`), its comment:
   - **Before:** "…the object the collective itself: a share of all its income (Q8)"
   - **Now:** "…the object the collective itself: a share of all its income (Q8); the object a vow's name: held by the vow's signer (null for the collective's own vow) in the version first writing it (new in draft 13, F284; rule 14)"
6. **Freeze scenarios, "Works and stakes"**, a line added: "- A deal made on a vow: the stake in it held by the vow's signer, the platform's fee off the top, the rest hers, the platform raising its fee only with her signature; terms writing the stake held by anyone else invalid; an offer under a deal writing no stake in the vow it sells not counting (reading, to confirm) (new in draft 13, F284): 1."
7. **Open in this draft**, a paragraph added: "**Draft 13** (`docs/f282-f284-build.md`) writes in F282, which decides draft 12's Q2 reading, and F284. Two readings taken writing F284 in are to confirm, marked in rule 14; the second is put as Q1."

Rules 22, 48 (beyond F282), 68 and 89 needed no change: F284 adds who holds a vow's stake, and F280, F270 and F279 then apply to it as to any stake.

**The MICS v26** (`spec/02-MOR-MICS-v26.md`). Version 25 was written for approval, and its reading waited for F282 and F284. The sentences changed:

1. **The header:**
   - "*Version 26, 13 October 2026 (afternoon), for Nobody, allegedly, to approve: version 25 (written for approval; its reading waited for F282 and F284) naming Agreements draft 13, which writes in **F282** (decided by Nobody, allegedly: "Q2 also answers itself. A new agreement is born. All signature are needed, yes it is born from a clone"): in a collective, every holder who is no member signs what pays it less, departed members, successors and buyers alike; and **F284** (decided by Nobody, allegedly: "The deal in question is based on a vow. Somebody owns the vow"): a deal made on a vow has an owner, the vow's signer, who holds the stake, the overhead coming off the top and what is left being the owner's. F284 is built (`docs/f282-f284-build.md`).
   - The six current drafts are … Agreements draft 13 and Development draft 8 … Nothing else changes; the sentences changed are quoted in `docs/f282-f284-build.md`. …*"
   - The rest of the paragraph is version 25's.
   - Version 25's header moves to "Earlier versions", its opening now: "*Version 25, 13 October 2026. **Written for approval; its reading waited for F282 and F284, which version 26 writes in**: …*".
2. **"Agreements and deals"**, the clone line:
   - **Before:** "…who has no voice in the power making that change: a deal's holder who is no party, a collective's departed holder (F270)."
   - **Now:** "…who has no voice in the power making that change: a deal's holder who is no party, a collective's holder who is no member, a departed member, a stake successor or a buyer alike (F270, F282)."
3. **"Keepers, stakes and works"**, a bullet added under Stakes, after F280's:
   - "**A deal made on a vow has an owner: the vow's signer, who holds the stake** (F284). The overhead comes off the top, and what is left is the owner's, a version paying the owner less needing the owner's signature where the owner has no voice in the power making it (F270, F280). Terms writing a stake in a vow held by anyone else are invalid."
   - In italics: "*"The deal in question is based on a vow. Somebody owns the vow" (Nobody, allegedly). Budgets are not vows: the vote placing a common budget is a cMIP's, and the vows answering the need are deals with their owners.*"
4. **"Open before freeze"**, the freeze-ready drafts' item:
   - **Before:** "…F273's mechanism is superseded by F279; one reading taken building them, who has no voice in a collective, is to confirm (its Q2)."
   - **Now:** "…F273's mechanism is superseded by F279; the reading taken building them, who has no voice in a collective, is decided by F282: every holder who is no member, departed members, successors and buyers alike (Agreements draft 13). F284 is written in Agreements draft 13 and built (`docs/f282-f284-build.md`); two readings taken writing it in are to confirm, the second put as its Q1."

**The freeze suite v26** (`spec/03-MOR-freeze-test-suite-v26.md`). The sentences changed:

1. **The header:**
   - "*Version 26, 13 October 2026 (afternoon), for Nobody, allegedly, to approve: version 25 (written for approval; its reading waited for F282 and F284) matching core v26 and the six current drafts, … Agreements draft 13 and Development draft 8.
   - Decided since version 25, and where it is tested: **F282** (…), in a collective every holder who is no member signs what pays it less: the departed holders line names successors and buyers, and step 3.7y's successor signing a fee raise is no longer a reading to confirm; **F284** (…), a deal made on a vow has an owner, the vow's signer, who holds the stake: a line for it, and new step 1.9f, a worker's vow, the platform's fee off the top, the rest hers, the platform raising its fee only with her signature. Nothing else changes; …*"
   - Version 25's header moves to "Earlier versions", marked as in the MICS.
2. **The departed holders line**:
   - **Before:** "…the split cMIP or its parameters included (F270, F274), abandonment moving…"
   - **Now:** "…the split cMIP or its parameters included (F270, F274), every holder who is no member signing so, a departed member, a stake successor or a buyer alike (F282), abandonment moving…"
3. **A line added** after the split plan's (F280): "- [ ] A deal made on a vow: the stake in the vow held by the vow's signer, the collective's own vow by the collective; terms writing it held by anyone else invalid where the verifier holds the vow; the overhead off the top, what is left the owner's, a version paying the owner less needing the owner's signature (F284, with F270 and F280); an offer under a deal writing no stake in the vow it sells not counting (reading, to confirm) (1)"
4. **New step 1.9f**:
   - "9f. *(F284, with F270 and F280; Agreements draft 13, rule 14)* **A worker's vow.** A cleaner signs a vow: two hours of cleaning, at the client's home. The job's deal between her and a platform writes a stake in her vow, held by her wholly; the platform's fee, 100,000, comes off the top (F280), and what is left goes to her stake: the deal exists once both sign.
   - The same deal writing the stake held by the platform, or by the cleaner and the platform together, is invalid, signed by both or not.
   - The platform raises its fee to 150,000: the stake is paid less, and the version, signed by the platform alone, is a draft; with her signature it exists.
   - A later version she signs may share her stake: once written, it moves as any stake moves. A clone first writing a stake in her vow held by the platform is invalid.
   - Where the job's deal is the platform's and the client's, the cleaner no party, the platform raising its fee, signed by both parties, is a draft until she signs (rule 48, F270).
   - An offer under a deal writing no stake in her vow, selling it, does not count; under the deal writing her stake, it counts (reading, to confirm: `docs/f282-f284-build.md`, Q1).
   - In a collective, a member's vow written in its terms is held by that member, and the collective's own vow by the collective, written null.
   - *Run: `core/tests/agreements_collective.rs`, `f284_a_deal_on_a_vow_names_its_signer_as_the_stakes_holder`, `f284_the_vows_owner_who_is_no_party_signs_what_pays_her_less`, `f284_an_offer_under_a_deal_selling_a_vow_needs_the_vows_stake`, `f284_in_a_collective_the_vows_signer_holds_its_stake`.*"
5. **Step 3.7y**:
   - **Before:** "…the successor, who holds the stake with no voice, must then sign a fee raise (reading, to confirm: `docs/f270-build.md`, Q2)."
   - **Now:** "…must then sign a fee raise (F282)."
6. **Scenario 1's "Passes if"**: after "…whatever the deal pre-authorised (1.9d, 1.9e)," it adds "a stake in a vow is held by the vow's signer, what is left after the overhead hers, and her pay lowered only with her signature (1.9f),".

**Case study 12, draft 7** (`docs/case-studies/12-MOR-case-study-gig-economy-v7.md`). Draft 6 stays beside it. The case studies' README names draft 7. The new draft note:

> "*Case study, draft 7, 13 October 2026. Draft 6 rewritten under F284 (`docs/f282-f284-build.md`), nothing else changed: every trade is made on a vow, and its agreement writes the stake in that vow, held by whoever signed it (the worker, the restaurant, the host); the platform's fee and every helper come off the top, and what is left is the vow's owner's, so a platform raising its fee needs the owner's signature. Draft 6's note follows.*"

The passages, old then new:

1. **Section 1, the job.**
   - **Old:** "The agreement names the parties, the price or the pricing rule, and any platform that matched them."
   - **New:** "The agreement names the parties, the price or the pricing rule, and any platform that matched them, and it writes the stake in the worker's vow, held by the worker: the job is the worker's."
2. **Section 1, the settlement.**
   - **Old:** "the split pays the worker, the platform's matching fee and any other role, each off the top with its own receipt: the job's agreement writes no stake, so nothing is left after them. Each of them checks one thing: is my cut at my flow address? The platform's cut is a line in the settlement, not a mystery."
   - **New:** "the split takes the platform's matching fee and any other role off the top, each with its own receipt, and what is left is the worker's, as the owner of the vow. Each of them checks one thing: is my cut at my flow address? The platform's cut is a line in the settlement, not a mystery, and the platform cannot raise it without the worker's signature."
3. **Section 2, rides.**
   - **Old:** "…and what the platform keeps. The platform may take any cut it likes, everyone can see it."
   - **New:** "…and what the platform keeps. The ride is the driver's vow, and the driver holds its stake: the platform's cut comes off the top, and what is left is the driver's. The platform may take any cut it likes, everyone can see it, and it changes only with the driver's signature."
4. **Section 3, delivery.**
   - **Old:** "The settlement splits the order, all of it off the top, since the order's agreement writes no stake: the restaurant's share, the courier's fee, the platform's commission, the fees of the modules used."
   - **New:** "The order is made on the restaurant's vow, so the order's agreement writes the stake in it, held by the restaurant. The settlement takes the courier's fee, the platform's commission and the fees of the modules used off the top, and what is left is the restaurant's."
5. **Section 4, starting small.**
   - **Old:** "…each job is a small agreement, and each neighbour pays him directly, confirms the job when it is done, and rates him. No platform is involved at all."
   - **New:** "…each job is a small agreement made on that vow, whose stake is his, and each neighbour pays him directly, confirms the job when it is done, and rates him. No platform is involved at all, so nothing comes off the top for one."
6. **Section 4, bigger jobs.** Added before "Materials bought…": "The job's agreement writes the stake in his vow, held by him; the arbitrator and anyone else paid through the split come off the top."
7. **Section 5, the designer.** Added after "…by what they actually take.": "The commission is the designer's vow, and the designer holds its stake: the marketplace's fee comes off the top, and what is left is the designer's."
8. **Section 5, the production chain.**
   - **Old:** "Each link is its own agreement with its own margin."
   - **New:** "Each link is its own agreement, made on the vow of the one who delivers it, with its own margin: what a link pays the next comes off the top, as its cost, and what is left is the link's owner's."
9. **Section 6, rentals.**
   - **Old:** "The cleaner, the key-handover service and the platform each receive a named share of the booking, off the top, as every share of it is: the booking's agreement writes no stake."
   - **New:** "The stay is the host's vow, and the booking's agreement writes its stake, held by the host. The cleaner, the key-handover service and the platform each receive a named share of the booking, off the top, and what is left is the host's."
10. **Section 7, the mutual pool.**
    - **Old:** "…naming the pool as its receiver, and a published target…"
    - **New:** "…naming the pool as its receiver, off the top, and a published target…"

*Not changed:* section 8's "They can set any fee. Nothing forbids a high cut; it is simply visible" (still true; it is about platforms, not a trade), section 10's "From the core, nothing new" (a rule-level summary, for the author's redraft), and every non-trade passage.

**`spec/README.md`:** lines for Agreements draft 13, the MICS v26 and the freeze suite v26, each "for Nobody, allegedly, to approve"; the MICS v25 line notes that its reading waited for F282 and F284; the findings range now runs to F284.

### The code

**`core/src/agreements/view/vows.rs`**, three new functions:

- `vow_owner(name, agreement, terms)`: the owner of a vow the verifier holds by its name (its genesis), read as its signer. It is written null where the signer is the collective those terms found (S1).
- `vow_stake_problem(id, terms, parent)`: rule 14. A stake whose object is a vow the verifier holds must be held wholly by the vow's owner, in the version that first writes it (the founding terms, or a clone whose parent writes no stake in that vow).
- `offer_vow_stake_problem(name, under, terms)`: rule 14, Q1's reading. An offer under an agreement, naming a vow, needs a stake in that vow in the version it is made under, unless the vow is the collective's own.

**`core/src/agreements/view.rs`** (`agreement_as`): `vow_stake_problem` is checked beside rule 15's `party_problem`. A failure makes the agreement invalid, so it never exists and a clone never completes. The reason given: "a stake in a vow is held by the vow's signer, wholly, in the version that first writes it: a deal made on a vow has an owner, and what is left after the overhead is the owner's (Agreements draft 13, rule 14; F284)".

**`core/src/agreements/view/selling.rs`** (`offer`): for each vow an offer under an agreement sells, `offer_vow_stake_problem` adds a problem, so the offer does not count. The reason ends "(Agreements draft 13, rule 14; F284; reading, to confirm)".

**`core/src/agreements/pay.rs`**: a comment only. `pay_signers`' "reading, to confirm: Q2" now cites F282, decided. The code was already F282 (`docs/f270-build.md`, "Revision").

*Why in the view and not in `Terms::check`:* the terms alone cannot tell a vow's name from a work's hash. Only a verifier holding the vow can, as for rule 15's loops and for an offer's `[ 3, vow ]`.

*Nothing else needed:*

- **F270 and F274** already ask the owner's signature for a fee raise once she holds the stake.
- **F280** already sends what is left to the stakes.
- **The split cMIP** divides the plan as before, so the rest reaches her stake.
- **WebAssembly** is unchanged: the deal tool reads the core's verdicts through calls that already existed.

**The deal tool (`clients/assess`):**

- **`src/assess.ts`, a new flag, `no-owner`** (listed): terms with a split plan or fees and no stake. The text, in full: "No owner: it divides money but writes no stake, so every share is overhead, taken off the top, and nothing is left for an owner. Nobody is paid as an owner is, protected against a fee raised or a share added without their signature. A deal made on a vow writes a stake in the vow, held by whoever signed it, and what is left after the overhead is theirs."
  - It rests on rule 14 (F284), rule 22 (F280) and rule 48 (F270).
  - Which object is a vow, the terms alone cannot say. Where the relays hold the vow, the core's own verdict (an invalid holder) is shown under "Who signed".
- **The "none of the risks" sentence** now lists "money divided with no owner".
- **Rule numbers** are those of Agreements draft 13, the newest draft. They are the same as draft 12's, so every quoted rule is found.
- **`test/deals.ts`, the renovation job** (case study 12, draft 7) now writes the handyman's stake in his vow, with the platform's fee off the top. Its flags gain `split-service-window`, since it now has a stake and a split service.
- **`test/deals.ts`, the award** (case study 21, draft 2) is now flagged `no-owner`: a true reading of that study, left for its own pass (below).
- **`README.md`:** the flag in the list and the table.

**`core/tests/review_announcements.rs`:** F247's test wrote a vow's stake half to Dario, the vow's signer, and half to the club, in both deals. Under F284 that is refused, so each deal now writes the stake held by Dario (`owned_by`). What the test proves is unchanged: the sponsor's offer is shown outside the club's deal, the lone offer outside both, and the work read the same way.

## Readings taken

Each is marked in the texts.

- **The stake is held wholly by the vow's signer in the version that first writes it; then it moves as any stake does** (rule 14, "reading, to confirm"). F284 says the vow's signer "holds the stake"; the build reads that as all of it, when it is first written.
  - Read so, the platform can never put itself beside her in what is left, which is what F284 closes.
  - She stays free to sell or share what she owns: "a reseller of what she owns", as the project lead read it. A share given later needs her signature, as every reduction does (rule 48).
  - *Not put now (one question at a time); it is the next question if you see it otherwise.*
- **The collective's own vow** is held by the collective, written null, as the collective is in its own terms (S1); a member's vow by that member. *Mechanic, the build's.*
- **A verifier that does not hold the vow judges nothing.** It cannot tell a vow's name from a work's hash, as for an offer's `[ 3, vow ]`. *Mechanic, the build's.*

## Question for Nobody, allegedly

Checked against the working rule (F265) first. Participants already choose whether to write a stake in a vow (F247), and how their split pays. What F284 adds is that the deal on a vow has an owner, which is what F270 and F280 then protect. Whether a deal may sell a vow while writing no owner's stake is that protection, so it is put.

**Q1. A deal that sells a vow but writes no stake in it: what does the core do?** *(area: core business, Agreements stakes and selling; rule 14, F284)*

*In plain words:* a platform's deal with the cleaner sells her vow (an offer under the deal names it) but writes no stake in it. Every share is then overhead, nothing is left for her, and she has no owner's protection: exactly the case F284 answers. The terms themselves are valid. Only the offer, under the deal and naming her vow, shows that the deal is made on it.

- **(a) The offer does not count until the deal writes her stake** *(built, my lean)*. An offer under an agreement, naming a vow, counts only where that version writes a stake in the vow (held by its signer). A collective selling its own vow needs none: its income already goes to its own stakes. A lone seller selling her own vow is her own payee and needs nothing.
  - Read from the acts alone (the offer, the terms, the vow), failing closed.
  - Stated cost: an offer made this way under an older deal stops counting until a version writes the stake.
- **(b) The offer counts; clients show it.** The deal tool already flags terms with no stake ("No owner"). Stated cost: her protection then rests on her client warning her before she signs.
- **(c) The core reads her as the owner by default**, as a work's creator is read where no agreement writes shares (F218). Stated cost: the split plan has no way to pay "what is left" to someone it does not name as a stake. It needs a format change to the plan, and verifiers would read the split differently from what the parties signed.

## Noticed, not changed

- **Case study 21's award**, now flagged "No owner" by the deal tool: Noor is paid as overhead, with no stake. Under F284 the award would be made on Noor's vow (the pilot), and she would hold the stake. Not edited: only case 12 was asked for. The same shape, from `docs/case-studies-f280-layers.md`, Q1:
  - case 14's recruiter;
  - case 19's bounty;
  - case 11's funders' pool, if read as an envelope;
  - the unwritten layer's cooperative.

  Case 04's budgets and case 19's pooled payment are budgets, cMIP business under F284.
- **Someone can write a stake in another's vow without her.** A deal she is no party to may write a stake in her vow, held by her (F284 makes her the holder). It pays her, but her own lone offers on her vow are then shown "outside the claiming agreement" (rule 14, F247), though she never signed that deal. Before F284 the same deal could name anyone as the holder, which was worse. Whether the vow's signer must sign the version that first writes a stake in her vow is a possible later question. Not built.
- **The deal tool fetches the vow only when its signer is a party.** It fetches "every act their parties published", so a vow whose owner is no party may not be held, and the core then judges nothing (the mechanic above).
- **Case study 12's section 10** still says "From the core, nothing new". F284 is core, but the study's list of core pieces already names stakes and vows. For the author's redraft.

## Tests

**New, in `core/tests/agreements_collective.rs`:**

- **`f284_a_deal_on_a_vow_names_its_signer_as_the_stakes_holder`** (suite 1.9f):
  - the cleaner's vow, with a deal writing her stake: it exists;
  - the platform holding part or all of the stake: invalid, signed by both, naming F284;
  - the platform raising its fee: the stake is paid less, a draft with the platform alone, in force with her;
  - a later version sharing her stake, which she signs: it exists;
  - a clone first writing a stake in her vow held by the platform: invalid.
- **`f284_the_vows_owner_who_is_no_party_signs_what_pays_her_less`** (1.9f): the deal is the platform's and the client's. A fee raise both sign is a draft until the cleaner signs. `pay_signers` names her alone.
- **`f284_an_offer_under_a_deal_selling_a_vow_needs_the_vows_stake`** (1.9f, Q1's reading): under the deal writing no stake, the offer does not count and names F284; under the deal writing her stake, it counts. The terms stand either way.
- **`f284_in_a_collective_the_vows_signer_holds_its_stake`** (1.9f):
  - Ana's vow held by Ana: ready;
  - Ana's vow held by Ben, or by the collective: invalid;
  - the collective's own vow held by the collective: ready;
  - the collective's own vow held by Ana: invalid.

**Changed:** `review_announcements.rs`, F247's test, as above. **`clients/assess`:** a new flag test, and the two deals above. 51 tests (50 before).
