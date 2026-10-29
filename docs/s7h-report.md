**Starting the final merge of main: stopped here so the lead can write "preparing to merge".** Main is not yet merged and the six web releases are not yet rebuilt (step 8, below). Everything before that is done to the clean points listed here, and what remains is listed with its reasons.

# S7h, the redesign from bake to publication, written in: report

*Session S7h, 29 October 2026, branch `claude/s7h-the-redesign`, from main (71687cb). This session recorded no finding: F399 stays free. The questions below go to the lead and Fable before they are decided. Where a text had to say something the decisions did not, it says the lean written here, and the question names it.*

## In plain words

- **All eight texts are rewritten to the four acts.** These are the six MIRs, the MICS v30 and the freeze test suite v30:
  - a **bake**, "I uploaded this";
  - a **claim**, "I claim to have made this";
  - an **ownership agreement**, who owns what share and how the owners decide;
  - a **publication**, "this is how we agree to publish it with these specified partners".
  
  Beside them comes the **price tag**, a Money act any wallet can pay.
- **The texts also carry:**
  - **six layers**, one per MIR;
  - **collectives with no key of their own**, whose members act for them with their own keys;
  - **every one of Fable's walked exits**, as a new freeze scenario (9, "The way out, walked").
- **The words are one per thing** in all eight texts and their glossaries: bake, upload, claim, ownership agreement, publication (publisher only in that sense), price tag.
- **The core moved part of the way**, to clean, tested points:
  - the six layers;
  - the bake (fields 7 and 8 refused, withdrawal retired);
  - the price tag (its format, its versions, and whose tag counts on a bare bake);
  - the claim's name.
  
  **What remains in the core is the larger part:**
  - publications in place of the standing offer and the split fields of terms;
  - shares by reference;
  - the keyless collective.
  
  It means rewriting most of the Agreements view, about 12,000 lines, and its tests, about 30,000 lines. It is a session of its own, and its order is given below. The keyless genesis also needs `modules/airgap` to change, and this session was not to touch `modules/`.
- **Vectors.** 338 cases, up from 327. Every moved verdict is listed with its reason, and so is every added case. The Python check passes.
- **Two checks will be red until two things outside this session's reach are allowed:**
  - The desk client's type list (`clients/desk/src/core-types.ts`) is generated from the core's tables, and it is now stale. Nothing in `clients/` may change beyond `built/`.
  - The keyless genesis needs `modules/airgap` to change (above).
  
  Both are questions below (Q31, Q30).

## Step 1: six layers

- **The MICS.** Its structure table has one row per MIR, numbered 0 Identity, 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development.
- **The texts.** Every "Envelopes and Text" is split in all eight texts. Agreements' kind `[0, layer]` and Development's field 10 (layers 0 to 4) use these numbers.
- **Client conformance** (Identity, Envelopes and Text in every client) is unchanged.
- **The core:**
  - `agreements::layers` is `IDENTITY` 0, `TEXT` 1, `ENVELOPES` 2, `MONEY` 3, `AGREEMENTS` 4, `DEVELOPMENT` 5.
  - `Mirs::layer` tells Text from Envelopes.
  - `task_layer` follows Development's task table: task 4 is Text's, tasks 5 and 11 are Envelopes'. Before, task 11, anchoring, was counted in Agreements (Q32).

## Step 2: the four acts, and step 3: the price tag

**Envelopes.**
- The bake is type 0. Fields 7 (price) and 8 (`for`) are reserved, and a bake carrying either is invalid. "Upload" is the verb, and the bake's signer is its uploader.
- Rule 23: money sent to a bare bake (a payment naming the bake itself) is the uploader's, unsplit.
- Rule 24 and type 3, the withdrawal, are retired: a bake is never withdrawn.
- A collective has no encryption key: it is sealed to through its members.

**Agreements.**
- **The claim** is its own act, type 3.
- **The ownership agreement** is one act type (terms) with a target, field 33, `[kind, hash]`: kind 0 is a claim, kind 1 is the identity it founds. It carries one stake, on the target. Terms fields 8, 14, 28 and 29 are withdrawn, as are 10 and 25 already.
- **The publication** (type 6) is the offer:
  - what it sells;
  - its owners, an ownership agreement read by reference;
  - its partners, each a map with an identity, a share and an optional label, with the italic note on why the label is in the core;
  - its split service, split plan, words, time reference, refund terms and cMIPs;
  - a designated tag signer, and the backups.
  
  It is ended by a later version selling nothing. A payment racing the ending is owed back by the split service from what it holds, then by each party in the share it received.
- **Shares by reference.** The split service's receipt names `[ownership agreement, version]` in field 9. The version in force is the latest complete version on that line in its history, and a version on no line is a wrong receipt. The request-rail and push-rail sentences of F402-3 are written in rule 12.
- **The stated cost of re-uploading**, in Nobody, allegedly's words, is in Money rule 18, Envelopes rule 23 and the MICS: *"Absolutely, piracy cannot be stopped. But truly rewarding creators can be made easy."*

**Money.**
- **The price tag**, type 5: `{ ? 0 bake, ? 1 publication, 2 version, ? 3 previous, ? 4 price, 5 payee }`, exactly one of fields 0 and 1.
- **Whose tag counts.** On a bare bake, only the uploader's. Under a publication, the split service's or that of the party the publication designates. Anyone else's is nobody's offer.
- **Versions.** A later version names `[first, previous]` and is signed by the same signer. A version with no price withdraws the tag.
- **Purchases.** A payment naming a counted tag under a publication is a purchase, so a Money-only wallet can buy.
- **The two stops** are stated in one place, Agreements rule 11, "Two stops, two different people's", and the MICS repeats them: the tag is withdrawn by its signer alone; the publication ends by a later version every party signs.

## Step 4: the collective

- **Identity.**
  - Rule 1: a collective's genesis declares its founding agreement in place of a signing key. It is signed by a chain key revealed in its signature, its commitment naming the next key (Q2).
  - Rule 7: the chain key signs rotations, chain signatures and such a genesis.
  - It is a one-way door, stated as one.
  - A collective signs no everyday act (everyday check 4), and its rotations carry no signing key and no kept tip (rotation check 4; Q3).
  - The escape endorsement is signed by members meeting the constitutional change rule (Q14).
- **Agreements.**
  - Rule 56: no signing key, no member keys; F353's mechanics are retired.
  - Rule 58: a member acts with their own key, naming the collective and the decision it acts under; a stranger's act naming it is nobody's; decisions name the previous decision. Any member draws a record. A member's power ends at the line that registers their departure, and their own key keeps signing their own acts.
  - Rule 60 opens with Fable's sentence, as written. Field 19 is a map keyed by layer number: the five layers 1 to 5 are required, and a key for a layer the MIRs do not define is refused. Finer areas go to field 34 and are optional, and the new mark power is `[6, layer]` (Q12). The client conformance is "Money first".
  - Fable's other sentences are written in:
    - a single chain-key holder still needs a successor (rule 59);
    - sealing goes to the members (rule 57);
    - Money rule 7 is one line;
    - Text rule 14's first case goes, and its second covers members as `[collective, decision]`;
    - a publication over a closed collective sells nothing (rule 12);
    - payouts become the buyer's once the transfer is complete (rule 10).
- **The MICS's stated cost:** a client knowing only Identity, or only Money, judges nothing a collective does.

## Step 5: F400 and F397's four

- **F400.** Identity rules 10 and 11: the copy is kept, as client conformance after rule 11's commentary.
- **F397.** These are written with Fable's sentences:
  - **Q-A12**, a sale outside the claim's ownership agreement: Agreements rule 14.
  - **Q-A10**, outcome 2 struck from MOR 1: rule 89, with every "outcome 1 or 2" reduced to outcome 1.
  - **Q-A22**, what the plan alone may pass: rule 83 and its client conformance.
  - **Q-A3**, the bypassing tag: rule 16.
  
  F397's other sentences and the routes are S7i's, and are not written.

## Step 6: the words, the glossaries and scenario 9

- **Glossaries.** Each text's glossary has the new words, and the MICS glossary entries were rewritten. The retired member key is gone; added are Bake, Claim, Ownership agreement, Partner, Price tag, Publication, Split agreement, Upload and uploader, and Layer and layer rule.
- **No history in the eight texts.** One word per thing, no finding numbers, no review labels. The "once …" notes in format comments are reduced to "reserved, never reused".
- **The freeze test suite v30.**
  - Every component box and every step of scenarios 1 to 8 is rewritten to the four acts and the keyless collective. No step number moved; new steps take new letters (3.1a to 3.1f, 1c, 4k, 8e, 8f, 9aj, among others).
  - The label (scenario 3) has five layer rules and one finer area. Text: any one member. Envelopes and Development: the release manager. Money: the treasurer. Agreements: any two of three. The finer area, "Releases", covers its publications and refund terms.
  - **Scenario 9, "The way out, walked"**, writes Fable's seven exits as acts: an owner leaving a work; a member leaving; succession; closing and fork; rotation and escape; a refund owed back; a work cloned to MOR 2.
- **The MICS's MOR 2 section** says a work crosses as its bake, claim and ownership agreement, and its publications are remade.

## Step 7: core, vectors, binding

**Done, each a clean point with every Rust test and both vector checks passing:**

1. **The six layers.** In the core, as above.
2. **The bake.**
   - `envelopes::types::BAKE`.
   - Fields 7 and 8 are refused.
   - `RETIRED_WITHDRAWAL`, type 3, is invalid, and the withdrawal-authority check is removed from `chain.rs`.
   - The relay names the bake.
3. **The price tag.**
   - `money::types::PRICE_TAG`, `PriceTag`, `Priced`, decoded strictly.
   - A tag must be public.
   - A later version must name `[first, previous]` (`check_signer`). It must continue the version its field 3 names, by the same signer, pricing the same thing, on the first version's chain (`Verifier::tag_continues`). It is unknown while those are not held.
   - `Verifier::price_tag` says whose offer it is (`TagCount`).
   - Binding: `moneyPayload` makes one, and `Verifier.priceTag`.
   - Tests: `core/tests/money_price_tag.rs`.
4. **The claim** is named `agreements::types::CLAIM`.
5. **The READMEs.**
   - `core/README.md` and `core/vectors/README.md` each have "What changed since the previous edition".
   - `wasm/README.md` has "For the Dubsar Suite" (below).
   - The vectors test counts every case in the file, in place of a fixed 327.

**What remains**, in the order it should be done, each a session's step of its own. The texts are ahead of the core here; the core still reads the earlier Agreements formats.

1. **The publication (type 6)**, replacing the standing offer and terms fields 8, 14, 28 and 29: split by the publication's split service, which receives in its own name, with backups in fields 11 and 12. The view's `offer`, `purchase`, `split`, `pointer_check`, `cut_check`, `service_account` and `turns` move to it, and so do the tests in `agreements.rs`, `agreements_invariants.rs`, `money_rule_15.rs` and `purchase_contest.rs` that build deals with plans.
2. **The ownership agreement's target (field 33) and one stake; shares by reference.** The receipt's field 9 becomes `[ownership agreement, version]`, the version in force read from its history, and wrong receipts follow.
3. **Purchases by price tag under a publication.** The tag counting under the publication; the request-rail commitment and the push-rail settlement by the split service; a payment racing the ending, owed back by the service and then the parties; a tip through a publication.
4. **The keyless collective.**
   - Field 19 as a map and field 34 for areas.
   - Acts for a collective named in `objects` and signed by members.
   - Records drawn by any member.
   - No member key (signature field 1 refused), and grants of a collective with no grant key (field 9 refused, field 8 retired).
   - Record field 1 and fork and closing fields 2 and 3 refused.
   - The line's history read on the collective's chain.
   
   This moves most of `agreements_collective.rs` (16,000 lines).
5. **The keyless genesis and rotation** (Identity rule 1): `Genesis::signing_key` and `Rotation::signing_key` become optional, and so does the chain state's key. This was built and then reverted (Q30): it compiles in the core and the relay, but breaks `modules/airgap` (`online.rs`, `summary.rs`). The air-gapped signer genuinely needs to learn keyless rotations, and this session was not to change `modules/`.
6. **Vectors for the new rules and scenario 9's walks**, once the core judges them. The publication, the shares by reference, the member's act naming the collective, the stranger's act being nobody's, the field 19 map, and each walk as acts.

### Moved verdicts, each with why

- **Development, "field 10 naming layer 4"**: it was "no specification" and is now "a specification". Layer 4 is Agreements now (MICS, "Structure"). Same acts.
- **Envelopes, the withdrawal (type 3) cases.** Type 3 is retired and a bake is never withdrawn (Envelopes rule 24, retired; rule 30). These are now invalid:
  - the case whose publication the verifier did not hold, which was unknown;
  - the cases signed by the publication's signer and by its `for`, which were valid.
  
  The stranger's withdrawal, the one naming a text act and the one with no entry were invalid and stay invalid.
- **Act ids changed, no verdict moved: the collective cases.** Their founding terms name Text and Envelopes as two layers where they named one. That is 29 Agreements cases, 13 Text cases and 2 Money cases.

### Added vectors

- **Development, 1 case.** Field 10 naming layer 5: no specification.
- **Envelopes, 3 cases.**
  - A bake carrying field 8: invalid.
  - A bake carrying field 7: invalid.
  - A bake with neither: valid.
- **Money, 7 cases**, with a new question, "price tag":
  - the uploader's tag on its bare bake, not held: unknown;
  - the same, held: counts;
  - another's tag on that bake: nobody's offer;
  - a tag under a publication, to a verifier reading Money: unknown;
  - a second version with no price: valid;
  - a second version by another signer: invalid;
  - a tag naming both a bake and a publication: invalid.

### For the Dubsar Suite

This is in `wasm/README.md`. Old names first:

| Old | New |
| --- | --- |
| `envelopes::types::PUBLICATION`, a "publication" of media | `BAKE`; uploader, upload |
| bake fields 7 and 8 | refused |
| `WITHDRAWAL` | `RETIRED_WITHDRAWAL`, invalid |
| — | `money::types::PRICE_TAG`; `moneyPayload({ type: "priceTag", … })`; `Verifier.priceTag` |
| `agreements::types::WORK_CLAIM` | `CLAIM` |
| `layers::ENVELOPES_AND_TEXT` 1, `MONEY` 2, `AGREEMENTS` 3, `DEVELOPMENT` 4 | `TEXT` 1, `ENVELOPES` 2, `MONEY` 3, `AGREEMENTS` 4, `DEVELOPMENT` 5 |
| task 11 in Agreements | task 11 in Envelopes |

**Where an app test signs a disallowed act, or reads a name that moved:**

- `clients/desk/test/core-types.test.ts` regenerates its type list from `core/src` and compares it with `clients/desk/src/core-types.ts`, which is now stale: `PUBLICATION` became `BAKE`, `WITHDRAWAL` is retired, `PRICE_TAG` was added and `WORK_CLAIM` became `CLAIM`. `src/kinds.ts` needs words for `BAKE`, `PRICE_TAG` and `CLAIM` (Q31).
- `clients/desk/test/core-types.test.ts` also asserts the grid's layer names (`'Text and Envelopes, together'`) and the old layer numbers.
- The other client tests' results are under "CI", below.

## The questions (to the lead and Fable)

Each is in plain words, with the options, the lean (which the texts now say), and its cost.

1. **Q1. A collective's target.**
   - The question: its ownership agreement's target is `[1, null]`, "the identity it founds". The hash cannot be written, since the genesis names the agreement.
   - Options: (a) null, read as the identity whose genesis declares it; (b) a separate act binding them.
   - Lean: (a). Cost: one reserved meaning for null.
2. **Q2. Who signs a collective's genesis.**
   - The question: Fable's "the chain key it commits to" would make one chain key sign twice, the genesis and the first rotation.
   - Options: (a) a chain key revealed in the genesis's signature, with field 1 committing the next; (b) as Fable wrote it.
   - Lean: (a), which keeps "used once". Cost: one unchecked key at birth, as any genesis's signing key is.
3. **Q3. A collective's rotations.**
   - The question: no signing key and no kept tips, which is a format change Fable did not name. The line's history is read through the signature acts the rotation names.
   - Options: (a) as written; (b) keep kept tips for the members' acts.
   - Lean: (a), since a member's `prev` is never followed for the collective (Q15).
4. **Q4. Constitutional clones still declared by a rotation (rule 69).**
   - The question: Fable's walk had a member leave by resignation, record and clone, with no rotation unless they held a key share.
   - Options: (a) keep the rotation for every constitutional clone; (b) a record suffices, and the rotation only where the key grammar changes.
   - Lean: (a), kept, since no decision changed it. Cost: a key ceremony per membership change. (b) is Fable's simplification, for the lead to decide.
5. **Q5. A collective's grants hand no key.**
   - The question: the grantee acts with its own key, naming the collective and the grant. A person's grant still hands a grant key.
   - Lean: as written. Cost: none found.
6. **Q6. One stake, on the target.**
   - The question: field 7 holds the one stake, and every stake index elsewhere must be 0.
   - Lean: as written. Cost: old multi-stake deals cannot be expressed as one act; a compilation names its parts' ownership agreements as owners (Q9).
7. **Q7. Deals without a target.**
   - The question: such deals carry no stakes. A vow is owned by its signer, or by an ownership agreement over a claim on the vow's name.
   - Lean: as written.
8. **Q8. The split agreement.**
   - The question: a collective's split agreement is a publication with no field 0. It is made a protected clause (judicial tier), keeping the old protection of the split service.
   - Options: (a) protected; (b) operational, under the rule for Money.
   - Lean: (a). Cost: every member signs a change of the collective's split service.
9. **Q9. An agreement as an owner.**
   - The question: an owner that is itself an ownership agreement is paid through it, by nested reading, at most 8 layers.
   - Lean: as written.
10. **Q10. Backups in the publication (fields 11 and 12).**
    - The question: each backup is a party and signs.
    - Lean: as written. Cost: a backup's signature on every publication.
11. **Q11. Payer-side splitting.**
    - The question: it retires as a core model. With no split service there is nothing to split.
    - Lean: as written. Cost: a seller who wants none names itself as its split service.
12. **Q12. How field 19 is written.**
    - The question: field 19 is a map keyed by layer, with finer areas in a new field 34 and a new mark power `[6, layer]`.
    - Options: (a) as written; (b) one field holding both.
    - Lean: (a), so layers and areas never share ids.
13. **Q13. A collective's bake.**
    - The question: a member's bake naming the collective is the collective's (Agreements), and a Money-only wallet shows its uploader unknown. The stranger's reading found that Money's text lets a Money-only wallet follow the signer's pointer, which pays the member.
    - Options: (a) Money-only refuses to tip a bake naming a collective; (b) the member's pointer, as a stated cost.
    - Lean: (a). This needs a sentence in Money that no decision gave.
14. **Q14. The collective's escape endorsement.**
    - The question: it is endorsed by members meeting the constitutional change rule; F402 said "the Identity layer". The stranger's reading adds that Identity then counts the escape on Agreements' judgment, against the MICS's "a layer's validity depends only on its own clients' data". The endorsement also cannot name a decision.
    - Options: (a) as written, a stated cost; (b) the escape judged by the key grammar's holders of the chain key, an Identity matter.
    - Lean: (a), with the cost stated. Not yet stated in the texts.
15. **Q15. History never follows a member's `prev`** for the collective.
    - Lean: as written. Cost: a member must cite the collective's acts it knows.
16. **Q16. The broken stretch is read by citations.**
    - The question: an act is "of the stretch" where its history holds the broken act and not the rollback. The old rule that a grantee cites the rollback was replaced.
    - Lean: as written.
17. **Q17. A work's holder who is no party.**
    - The question: such a holder (a buyer of a share) is not protected on a publication's off-the-top shares.
    - Lean: as a stated cost (rule 48).
18. **Q18. Q-A22's two seats.**
    - The question: an identity holding two seats is listed twice in field 0.
    - Lean: as written.
19. **Q19. The recovery rotation**
    - The question: it names the other signature acts only where no other member remains to draw a record.
    - Lean: as written.
20. **Q20. Money naming a bake that a publication also sells.**
    - The question: such money is the uploader's (Envelopes rule 23: what the payment names decides).
    - Options: (a) as written; (b) through the publication.
    - Lean: (a).
21. **Q21. Holders' consent on a split agreement.**
    - The question: on a split agreement version that is an owners' matter, holders consent by signature acts naming the version, with no mark.
    - Lean: as written.
22. **Q22. "Owners that ended."**
    - The question: this reads as the closed collective's own publications and split agreement. A work's publications follow the fork's successors (rule 91).
    - Lean: as written.
23. **Q23. Every share transfer needs the seller's chain signature** (rule 10, unchanged).
    - The stranger asks who chain-signs a collective's transfer, and why neither the MICS nor Identity's list says it.
    - Lean: the collective's chain key under its key grammar, and the MICS and Identity to say so.
24. **Q24. A collective that sold its works by transfer can never close**, since "holds nothing" reads only agreement versions (stranger's finding 5).
    - Options: (a) count the transfers in the closing's history; (b) sell by a clone only.
    - Lean: (a). This is a rule change, for the lead.
25. **Q25. A publication with no ownership agreement** (field 1 absent, a lone seller).
    - The question: what its receipt's field 9 carries, and what it belongs to for keepers.
    - Lean: field 9 absent, and it belongs to itself.
26. **Q26. "Purchase" for a bare bake's tag.**
    - The question: the texts use the word four ways. Does it give standing to contest?
    - Lean: a payment of a bare bake's tag is "a sale by the uploader", and gives standing as a purchase does.
27. **Q27. Which key delivery completes which purchase.**
    - The question: a delivery names the act, never the payment.
    - Lean: the split service's delivery, or the designated party's, sealed to the payer, completes every purchase it reaches. A cMIP may bind them tighter.
28. **Q28. Where a tip through a publication is paid.**
    - Lean: to the split service named in field 3. A Money-only wallet cannot read field 3, so it tips through a tag or not at all.
29. **Q29. Hash tags named after old layers.**
    - The question: `MOR/finance/anonymous-claim` and `MOR/law/leftover`.
    - Options: (a) keep them, frozen as names; (b) rename them before the freeze.
    - Lean: (a), with a sentence saying so. Cost: a stranger's surprise.
30. **Q30. May the next session change `modules/airgap`?** The air-gapped Module must learn the keyless rotation.
31. **Q31. May the desk client's generated type list and its words be regenerated?** That is `clients/desk/src/core-types.ts` and `src/kinds.ts`. Its test reads the core's tables, so any new core type turns it red.
32. **Q32. Task 11, anchoring.** It is counted in the Envelopes layer, as Development's task table writes it; the core counted it in Agreements. It is judicial either way, so no verdict moved.

## The stranger's reading

A fresh agent read the eight texts and nothing else, and reported 22 findings. What was done with them:

- **Clarity, fixed:**
  - 1: "bare bake" is defined in Envelopes rule 23.
  - 6: the protected clauses name the split agreement, not withdrawn fields.
  - 7: "a person's grant key"; the stale fork bullet and suite line fixed.
  - 12: acts naming `[x, x]` are never a fork (rule 6).
  - 13: field 0 across versions.
  - 14: backups listed among a publication's parties in rule 11 and the MICS.
  - 17: Development's Money-only sentence.
  - 18: rule 91's "its claim names the successors".
  - 21: "once …" history in the format comments.
- **Rules, sent to questions:** 2 (Q13), 3 (Q14), 4 (Q23), 5 (Q24), 8 (Q25), 9 (Q26), 10 (Q27), 11 (Q28), 22 (Q29).
- **Left as they stand**, not this session's decisions:
  - 15: "seller" in Money's glossary;
  - 16: a text naming a non-decision;
  - 19: "release", "line" and "position" overloaded;
  - 20: the Development layer rule;
  - the older history notes in Agreements (field 25's story, "Strands"), which predate this session.

## The c-box

`scripts/c-box/make-c-box.sh` was run into a scratch folder. It assembled 8 texts and 12 vector files, and refused nothing: no finding number, and no pointer to code or docs.

## Step 8: releases, the pull request and CI

- **Not yet done.** Main is not yet merged, and the six web releases (the display client, Dub, Kišib, Damgar, Ummia and Edubba) are not rebuilt. This report stops at the start of the final merge, as asked.
- **CI, checked myself** (pull request #113, head as pushed with this report).
  - **Green on GitHub:** `linux` and `mac`, the Rust workspace tests.
  - **Green locally:** the regenerated vectors (byte for byte) and the Python check.
  - **Red on GitHub:** `regtest` and `all`. Every red step is a client following the core, which this session was not to change (`clients/` beyond `built/`), or a release not yet rebuilt.
- **The client tests, run as `test.yml` runs them** (locally, after `npm run wasm`).
  - **Passing:** connector, genesis, grants, longform, anchoring-service, reports, repo, split-service.
  - **Failing for a reason in this session**, each the suite to follow:
    - *A withdrawal is now invalid*, and these apps sign or expect one:
      - `barebone` 6, "a withdrawn picture is no longer shown";
      - `barebone` 12, "withdrawn by its signer";
      - `dub` 9 and the profile picture it withdraws.
    - *The layers are renumbered*, and these apps write an area's kind `[0, layer]` in the old numbers:
      - `desk` round 3, "one key of Publishing counts", also red on GitHub's `regtest`;
      - `desk` 3 to 5, the grant's cap, expiry and revocation;
      - `desk` 86, 89 and 96, member keys and areas;
      - `damgar` 14, a member acting within the Money area;
      - `ummia` 16, a collective's release.
    - *The core's type tables moved* (`BAKE`, `RETIRED_WITHDRAWAL`, `PRICE_TAG`, `CLAIM`): `desk` 15, `core-types.test.ts` (Q31).
    - *The eight texts changed*, so their test hashes did: `ummia` 12, "the eight texts: built-in titles, keyed by their test hashes".
    - *The releases are not rebuilt:* `site`, "the display client built twice is the same, and is the one published in the release" (`gateway.js` differs from `built/`), red on GitHub's `all`; and the `site` gateway tests.
  - **Not judged here:** the tests that start a browser (collective, manage, kit, kishib, testwallet, reader, and most of dub, damgar, site and ummia). They could not launch Chromium in this container (a Playwright build mismatch, nothing to do with MOR). GitHub's run is the reference for them.
- **What step 8 then needs:** merge main; rebuild the six releases' `built/` (the display client, Dub, Kišib, Damgar, Ummia, Edubba); and, before GitHub can be green, the lead's answer to Q31 and the Dubsar Suite's follow-up on the client tests above. Those are in `clients/`, outside what this session may touch.
