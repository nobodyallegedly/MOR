# Building the review's decisions, F145 to F156

*6 October 2026. A building session, branch `review-decisions-f145-f156`. It builds in code the decisions taken on the hostile review of F133 to F144 (`docs/reviews/f133-f144-review.md`), F145 to F156, and takes up the review's finding 11, the sentences that still say "when". The spec texts already carried every decision; this session changed code and tests, the long-form cMIP's markup declaration, and the verifier2 report's rerun section. It did not change `spec/`.*

*How it was built: three building agents, each in its own copy of the repository, one for Finance (F145, F146, F147, F151, F154, F155), one for Law (F148, F150, F156 and verifier2's rerun), one for Identity and Text (F149, F152, F153); their work was merged here and tested together. All three are the same model as this session. Verifier2 itself was not changed, so its agreement is still a second reading, written from the text before it saw the code.*

## In plain words first

- **Every decision is now in the code, with tests.** Each test was checked to fail when its fix is taken out.
- **Verifier2 now agrees with the reference library on all 4,000 random collective histories,** with no disagreement left.
- **One test was already failing on main before this session** (`collective_promises_hold`, seed 845751907876880101). A collective's witness act recorded a sale. F156 fixes it.
- **Building exposed three possible flaws in the MIPs.** They are for Nobody, allegedly, and nothing was changed to work around them:
  1. **F145 and F155 still let a payer who works with a thief choose the pointer, in one case.** "Holds" follows every citation, and a signature on terms must cite those terms. So if a debtor drafts terms citing the thief's pointer and the owner signs them, the owner's own signature "holds" the thief's pointer. Review finding 1's first story then still works. A test pins this, so a decision will visibly change it.
  2. **F148: a keeper's operator who is also the authority can acknowledge its own absence declaration.** The "kept for later" attack then still works in freeze scenario 1's shape.
  3. **F152 against F137.** A private link now counts only if it is published at its signer's homes. But the list of inputs every verifier must share does not name what a verifier found at the homes. Two verifiers holding the same acts and keys can disagree.
- **The "when" sentences are rewritten below, but not written into the spec.** This session's permissions refused the edit to `spec/` and the paper. So the rewrites are proposals here, for Nobody, allegedly, to apply. One of them would change a rule's meaning (which vault counts for a payment), so it is written as a question instead.
- **GitHub:** the tests run on this branch by hand (see "Run").
  - The check that the published display client is the same as the code fails by design until the display client is released again.
  - A release commits to main and moves the live site, so it waits for Nobody, allegedly.

## What was built, decision by decision

### F145 and F155: the pointer is judged by the payee's own act (Finance rules 14 and 15)
- **The rule as built.** The flow-pointer version that counts for a debt, or for a payment under an agreement or offer, is the latest one an act of the payee's own holds:
  - its signature act on the terms;
  - its own offer;
  - for an IOU, its own act acknowledging the IOU.

  "Holds" means reachable through `prev`, `objects`, `acks` and `refs`, never a hash written in a payload. A forked pointer chain counts only up to the fork. A payment to that wallet, or to an older one, counts. A newer one does not.

  The version the debt names is only informative. An IOU with no act of the payee's counts only if paid to the vault.
- **Code.**
  - `core/src/finance.rs`: `Citations`, `holds`, `history`, `select_pointer`, `rule_14`.
  - `core/src/law/view.rs`: `pointer_holding`, `payees_acts_on`. The debt discharge in `paid_where_it_counts` now uses them.
  - `cmips/payment/src/lib.rs`: `pointer_in_force`. Its `Held` trait loses `HeldObligation` and gains `holding`.
  - `core/tests/finance_f133.rs` is replaced by `core/tests/finance_f145.rs`.
- **Tests.**
  - In `core/tests/finance_f145.rs`:
    - `the_pointer_is_judged_by_the_payees_own_signature_act`
    - `an_iou_counts_only_to_the_vault_until_the_creditor_acknowledges_it`
    - `an_offer_is_the_payees_own_act_only_when_the_payee_signed_it`
    - `flaw_the_payees_signature_holds_what_the_drafters_terms_cite` (flaw 1 below)
  - In `modules/lightning/tests/flow_theft.rs`, over Lightning acts:
    - `an_obligation_whose_payees_act_holds_the_later_pointer_counts_on_that_flow`
    - `a_debt_resigned_to_the_thiefs_pointer_counts_for_nothing_there`
    - `an_iou_counts_on_the_flow_only_once_the_payee_acknowledges_it`
  - Changed: in `core/tests/law_collective.rs`, `a_debt_is_paid_only_where_the_creditors_rules_let_it_count`. IOUs now need the creditor's acknowledgement to count on the flow, as F145 says.

### F146, F154 and F147's "read together": good faith after a rotation (Finance rule 15)
- **The rule as built.** A payment to a pointer that a rotation voided counts as made in three cases:
  - a claim of the payer's does not hold the rotation (all of a payer's claims for one rail proof are read together);
  - the payer made no claim at all;
  - where the claim and the rotation are both anchored, the claim is anchored before the rotation.
- **Code.**
  - `core/src/finance.rs`: `PayersClaim`, `good_faith`.
  - `core/src/law/view.rs`: `voided_pointer`, `pointers_before`, `payers_claims`. Their status reads go through F153's binding path.
  - `core/src/chain.rs`: `Verifier::judged_by`, the rotation that voided an act.
- **Tests.**
  - In `core/tests/finance_f145.rs`: `good_faith_after_a_rotation_reads_the_payers_claims_together` and `where_both_are_anchored_the_anchor_order_decides`.
  - In `modules/lightning/tests/flow_theft.rs`: `a_tip_paid_before_the_rotation_is_judged_by_the_payers_claims`. It covers no claim, a claim without the rotation, a claim holding it, the honest payer's second and later claim, the anchor order, and an unknown history.
- **Only stated, not computed.** Anchor order is a fact the caller states (`LawView::anchored_before`), because the anchoring format is still open.

### F147: an anonymous payer's claim covers its citations
- **Signed bytes.** The anonymous key now signs:
  - fields 0 to 4;
  - fields 5, 6, 7 and 9, each null where absent;
  - the act's `objects`, `acks` and `refs` (inside keys 3, 7 and 8), each null where absent and encoded as the act encodes it.

  Such a claim's history for rules 14 and 15 is only those citations, never the carrier's `prev`.
- **Code.**
  - `core/src/act.rs`: `objects_value`, `acks_value`, `refs_value`.
  - `core/src/finance.rs`: `Claim::anonymous_message(&Citations)`. `check_signer` and `claims_refund` now take the act's citations, and every caller follows.
- **Tests.**
  - New in `core/tests/finance.rs`: `the_anonymous_message_is_the_array_the_format_shows`.
  - New in `core/tests/finance_f145.rs`: `an_anonymous_claims_history_is_only_what_its_key_signed`. Re-wrapping a claim with other citations breaks key 8.
  - Updated: `an_anonymous_claim_is_signed_by_its_committed_key` in `core/tests/finance.rs`, and `rule_32_an_anonymous_refund_goes_to_the_committed_key` in `core/tests/law_draft_10.rs`.

### F151: on a rail that binds nothing, the payer's claim decides (Finance rule 10)
- **The rule as built.** Where the rail binds neither payee nor purpose, the payer's claim decides what the payment fulfils. The receiver's contrary receipt stays shown as a dispute. Where the rail binds them, the commitment decides, as before. This replaces the U5 "neither counts" code.
- **Code** (`core/src/law/view.rs`): `claim_unsettled` becomes `claim_overruled`, and `receipt_overruled` is new.
- **Only stated, not read.** Which rails bind nothing is a fact the caller states (`LawView::unbound_rails`). The field where a rail Module declares it is still format open (F140 item 1). Every rail written so far binds both.
- **Test.** `the_payers_claim_decides_the_purpose_where_the_rail_binds_none` (`core/tests/finance_f145.rs`), the review's receiver-veto story.

### F148: absence judged by anchors (Law rules 50 and 51)
- **The rule as built.** The caller states each act's anchored point on the time reference (`LawView::anchors`, which replaces `absence_anchored`; in wasm, `anchors`). The core does the rest of rule 51 (`absence_by_anchors`):
  - the declaration must be anchored;
  - no act of the declared party **on the agreement** may be anchored within the period before it;
  - an acknowledgement by another party or by the keeper must be anchored within one further period;
  - no act of the declared party may be anchored between the two.

  Whoever anchored an act, it protects its party. An act nobody anchored protects no one.
- **Tests.**
  - `scenario_1_absence_is_judged_by_anchors` (freeze scenario 1, step 9, which no test ran before). It covers:
    - liveness anchored by someone else;
    - unanchored liveness;
    - activity elsewhere;
    - the holiday declaration published months later;
    - the party's act between the declaration and the acknowledgement;
    - acknowledgements by the declared party and by a stranger;
    - the keeper's acknowledgement.
  - `a_declaration_under_a_period_counts_only_anchored` was rewritten for the new rule.

### F150: leftovers by largest remainder (Law rules 15a and 21)
- **The rule as built.** `core/src/law/formats.rs`: `divide_stake` and `leftover_key`.
  - Each holder gets its exact share rounded down.
  - Leftover units go one each to the largest remainders.
  - Ties are ordered by `tagged_hash("MOR/law/leftover", [receipt, holder])`, smallest first, with the array encoded in CBOR.
- **Where it is used.**
  - `payer_split` takes the receipt.
  - In wasm, `lawDivideStake` is new and `lawPayerSplit` takes a receipt.
  - The collective client's split preview says that a tied unit is decided by the receipt's hash.
- **Forks unchanged.** A fork's division keeps "leftovers to the first side" (renamed `divide_first`), because the fork's text still says so (question 10).
- **Tests.**
  - `leftovers_ignore_the_order_of_holders`: 2,000 random stakes, seed printed. Reordering holders moves nothing, payouts sum exactly, and each payout is within one unit.
  - `leftovers_go_by_largest_remainder_whatever_the_order`: the review's 1 unit among 333,333 / 333,333 / 333,334 goes to the holder of 333,334, in any order.
  - A tie case, and a collective-client test.

### F156: a collective's witness act places nothing in Law
- **The rule as built.** Identity's everyday acts of a collective now get their own answer, `Consent::Identity`, and count for nothing in Law. This covers the witness act, routes and the encryption key.

  A member's signature act is placed only by an act of the collective on its chain: an action citing a decision, or a decision, or a record or rotation naming it. A witness act places nothing.
- **Tests changed.** Four tests in `core/tests/law_collective.rs` had placed signatures with a witness act. They now use an acknowledging action on the chain (`Lab::acknowledge`).

  In `law_invariants`, `ic4_an_acknowledgement_records_the_whole_payment` now expects both receipts of one payment to share one verdict: refunded, since a witness act records nothing.
- **Tests added.**
  - "witnessed before" and "acknowledged off the chain", in `a_threshold_authority_is_counted_at_the_line`.
  - A WITNESS-COUNTS check in the `collective_promises_hold` oracle.
- **Verifier2 rerun** (`docs/verifier2-report.md`, "Rerun after F156").
  - It was run on the same 4,000 histories: seed 1, cases 0 to 2,999, and seed 2, cases 0 to 999.
  - There were 0 disagreements, over 559 witness acts of the collective in 444 stories.
  - The exports were deleted for lack of disk space. They can be redrawn from the seeds.

### F149: a text format hides only its declared markup (Text, the format task)
- **The cMIP.** `cmips/cmip-long-form-draft-1.md` gains a "Markup declaration" table. It lists each markup character and the only positions where it may be hidden, exactly what the existing code already hid. Its rule 12, "Checking a rendering", now checks each hidden character against that table.
- **The client** (`clients/longform/src/format.ts`, `html.ts`).
  - The parser records each piece of markup it hides, with the declaration entry that hides it.
  - `checkBound()` refuses a reading that hides anything else.
  - `renderHtml()` shows a refused reading as plain text, with a line saying why.
- **Tests.**
  - The review's stories (U+2212, "10.00", the Devanagari vowel sign in "काम") are shown inside every construct.
  - Tampered readings are refused.
  - The old F140 test of the L and N bound is replaced.
  - 20,000 generated texts pass, and a separate 300,000-text run found no false refusals.

### F152: a private link's existence is public (Identity, "The envelope", rule 24)
- **Private links accepted for the first time.** The core used to refuse every private Identity act, so F134 had never been built. Now `core/src/chain.rs` accepts private link acts (types 6 to 8) and still refuses every other private Identity act.
- **Published at the homes.** A private link counts only once the verifier records that it fetched the act from the signer's homes: `published_at_home`, an input the caller states, per act.
- **Code.**
  - `link(claim, seen_by)`, in `core/src/chain.rs`, answers "not linked", "linked", "ended" or "unknown". A link's ending applies to every act holding the termination in its history.
  - Homes serve an identity's private acts, opaque, beside its record (`relay/src/store.rs`, `node.rs`).
  - The genesis client's `lookUp` records what it fetched at the homes.
  - `TestIdentity.unrecognised()` lists acts signed with the identity's key that its file did not make. The desk client warns on each: "the signing key may be stolen: rotate".
- **Tests.**
  - `core/tests/private_links.rs`: the thief's private link shown to one bank, other private types refused, and the ending through history.
  - `relay/tests/home.rs`: a home serves an identity's private acts.
  - A genesis-client test.

### F153: nothing binding rests on a reader's own attempts (Identity, after rule 17)
- **The rule as built.** An act's standing "rests on" the verifier's own attempts where it differs from what the same acts give without them. Code: `rests_on_own_attempt` and `binding_status` in `core/src/chain.rs`.

  Law reads every act through `binding_status`. `fork`, `closing`, `closed_by` and a new `paid(obligation)` answer "unknown" (`LawError::OwnAttempt`) while their answer rests on such attempts.

  Reading and following an identity still use them.
- **Payments.** The payment cMIP's `Held` is documented to mean binding standing. The harness uses `binding_status`.
- **Tests.**
  - `core/tests/binding_answers.rs`.
  - In `core/tests/law_collective.rs`: `a_debt_paid_through_a_readers_own_attempt_is_unknown` and `a_fork_resting_on_a_readers_own_attempt_is_unknown`. Both turn known once the old home closes.
- **Owed.** Other Law answers (consent, purchases, splits, releases) show such an act as "does not stand" rather than "unknown". Keeper records are not built, since their format is open.

## Run

- **Rust workspace.** Run on this branch after the three merges (`cargo test --workspace --locked --no-fail-fast`); see the closing note for the final count.
- **WebAssembly and TypeScript clients.** Rebuilt and run on this branch; see the closing note.
- **Each building agent** ran the full suites in its own copy before merging:
  - Identity and Text: Rust 360 passed; TypeScript 159 passed across eleven packages.
  - Law: Rust 356 passed; the collective, repo and genesis clients passed.
  - Finance: Rust 362 passed; the manage, reader, repo, site and longform clients passed.
  - The `manage` and `reader` browser tests each failed once and then passed twice. The cause was not found.
- **Verifier2.** 4,000 histories, 0 disagreements (above).
- **GitHub.** The test workflow, run by hand on this branch; see the closing note. The reproducible-build check compares the code with the published display client in `clients/site/built/`, so it fails until the display client is released again (`.github/workflows/release-display-client.yml`). That release commits to main and the live site follows it, so it waits for Nobody, allegedly.

## Only reasoned, not run

- **Anchors** (F146, F148) and **which rails bind nothing** (F151) are facts the caller states. Nothing computes them from real anchors or real Module specifications, since those formats are open. The rules are run; their inputs are stated.
- **Where a good-faith payment is judged from.** `pointers_before` judges it against the pointers bound before the rotation. So a pointer the owner publishes after the rotation, of the same version as the thief's, is not a fork of the thief's. This is the Finance agent's reading, not stated text.
- **A Finance-only verifier** cannot read the payee's acts on an agreement, so it answers "unknown" for debts under one, never "valid".
- **The theft window itself stays open.** A deal the thief signs with the stolen key holds the thief's pointer, and payments to it count. This is the stated cost, not a bug.

## The "when" sentences (review finding 11)

**These rewrites are not in the spec.** The edit to `spec/` and the paper was refused by this session's permissions. They are proposed here; each replaces a time by what an act cites or by a rule's citation. Unless marked otherwise, none changes what a rule means.

| Where | Now | Proposed |
| --- | --- | --- |
| Finance, obligation field 3 | "the creditor's payee-pointer act in force when the obligation arose" | "the creditor's payee-pointer act the debtor names; informative only: the version that counts is the one rule 14 selects (F155)" |
| Finance rule 14, first two sentences | "counts only for obligations and acts that name that flow pointer's version or a later one. Anything that arose under an earlier flow pointer counts only if paid to the vault." | "counts only toward what has, as its version that counts, that flow pointer's version or a later one: for an obligation, the version selected below; for a payment under an agreement or offer, the version rule 15 selects; for a tip, the version of the payee pointer it follows. Toward anything whose version that counts is earlier, it counts only if paid to the vault." |
| Finance rule 12a | "that pointer or vault being the payee's own and in force for that payment (rules 12, 14 and 14a)" | the pointer half: "that pointer being the payee's own and counting for that payment by rules 12 and 14". **The vault half changes meaning; see question A.** |
| Finance rule 15 | "followed both the published pointer and the published vault counts as made, even if a later rotation invalidates that pointer" | "followed both the pointer and the vault published on the payee's chain counts as made, even if a rotation invalidates that pointer" (the proviso that follows already orders the rotation against the claim) |
| Finance, reasoning on the vault | "an obligation names the flow version in force when it arose" | "the version that counts for a debt is the latest the payee's own act on it holds, and the payee's acts that made the backlog never held the thief's pointer (F145, F155)" (subject to flaw 1) |
| Core v21, "Good faith" | "even if a later rotation invalidates it" | "even if a rotation invalidates it, provided the payer's claim does not hold that rotation in its history (Finance rule 15)" |
| Law, "Judged on its own history" | "A complete ending that an earlier final one makes count for nothing … (\"… an earlier ending is final\")" | "A complete ending that names a final one (directly, or through the endings it names), and so counts for nothing … (\"complete, counts for nothing: an ending it names is final\")" (the fork's text defines "later" as "naming it"; no code shows the old label) |
| Freeze suite, scenario 1 step 5c | "A fan tips in good faith before the rotation" … "or to the flow pointer the debt names" | "A fan tips in good faith: the fan's claim does not hold the rotation in its history, or the fan publishes no claim (Finance rule 15, F139, F154)" … "or to the flow pointer that counts for the debt, the latest the contributor's own acts on their deals hold, or an older one (Finance rule 14, F145, F155)" |
| Paper, section 5.1 | "An obligation names the flow pointer in force when it arose" … "even if a later rotation invalidates them" | "The flow pointer that counts for a debt is the latest one the payee's own act on the agreement holds through its citations, so a thief who changes the flow pointer cannot collect older obligations" … "even if a rotation invalidates them, provided the payer's claim does not hold that rotation in its history" (subject to flaw 1) |

**Already done before this session:**
- Identity rule 24 (F152).
- F143's italic.

**Question A, which changes meaning, so not rewritten.** Which vault counts for a payment? The pointer is now selected by the payee's own act. The vault is not: the text says "the published vault" and "in force for that payment" and names no act.

The code judges the limit against the vault the payee's chain declares as the verifier reads it now. So a flow payment within the limits can stop being protected once the owner rotates to a lower limit.

Smallest story:
1. Owner's vault limit is 1,000.
2. A fan pays 900 to the flow.
3. Owner rotates to a limit of 500.
4. Was the fan's payment one that "followed the published vault"?

Options:
- (a) the vault the payer's claim holds;
- (b) the vault the payee's own act holds, as for the pointer;
- (c) the vault at the binding just before the act the payment cites.

## Flaws found while building (for Nobody, allegedly)

1. **F145 and F155: a payee's signature holds what the drafter's terms cite.**
   - "Holds" follows every citation, and Law requires a signature act to cite the terms it signs. So a debtor working with a thief drafts terms citing the thief's pointer. The owner signs. The owner's own signature now holds the thief's pointer, and debts under those terms count on the thief's flow.
   - IOUs: an owner's act acknowledging an IOU holds everything its debtor ever cited.
   - This is review finding 1's first story, still open as the text reads.
   - Built as written. `flaw_the_payees_signature_holds_what_the_drafters_terms_cite` pins it.
   - A possible fix, for Nobody, allegedly, to judge: the walk for "holds" stops at acts others signed, passing only through the payee's own acts.
2. **F148: the authority can acknowledge its own declaration.**
   - Where the keeper's operator is the authority, as in freeze scenario 1, "or by the keeper" lets it acknowledge its own declaration.
   - It anchors both in January, keeps them, and publishes in October. The declaration counts.
   - Built as written (the keeper's acknowledgement counts).
3. **F152 against F137.**
   - A private link counts only if it is published at the signer's homes.
   - The list of inputs every verifier must share (after Identity rule 17) does not name "what this verifier found at the signer's homes". Two verifiers holding the same acts and keys can disagree if only one fetched from the homes.
   - It is an observation of the same kind as an own attempt, and probably belongs in the list.

## Questions where the spec is silent or unclear

**Finance**
1. The exact bytes of the anonymous signature (F147). Built: fields 0 to 4; then 5, 6, 7, 9, null where absent; then inside keys 3, 7, 8, null where absent, each as the act encodes it. Confirm.

**Law, F148**
2. Rule 51 says no period declaration can count until the anchoring and time-reference formats exist. The library lets one count on anchors the caller states, as F136's build did. Intended?
3. Anchored points are read as numbers in the period's unit. Bounds are inclusive: an act anchored at the same point as the declaration protects its party.
4. "Another party": may the declaring party acknowledge its own declaration? This ties to flaw 2.
5. "On the agreement" is read as naming the agreement or an earlier version, or a signature on one.
   - Do acts on later clones count?
   - In a collective, do members' acts on the collective's acts count?
6. "Acknowledgement" is read as Envelope `acks` only. A keeper record is not counted, since its format is open.

**Law, F150**

7. The tie hash's array `[receipt, holder]` is read as encoded in CBOR. The text does not say so.
8. Payer-side splitting: the wallet divides before any receipt exists. Which hash orders ties?
   - Built: the preview says ties are decided by the receipt's hash, and payouts are computed once it is signed.
   - Is that enough under rule 4a ("what you sign is what you saw")?
9. A split made from a payer's claim with no receipt (rule 20): which hash orders ties?
10. Does F150 cover a fork's division? The fork's text still says "leftovers to the first side", and freeze scenario 9 expects 333,334 / 666,666 by that rule. A fork has no receipt. Kept "first side".
11. Smaller points for the next suite pass:
    - Freeze 7t's wording "to the first" is stale, though its result is the same.
    - The split check's tolerance (up to as many units as the stake has holders) is unchanged.
    - Rule 21's "must not depend on order" cannot yet be checked, because no code reads a split cMIP's declared remainder rule.

**Law, F156**

12. The findings log says a member's signature is placed by an action "acknowledging **or citing**" it. "Made before, made after", item 2, says acknowledging. Built: acknowledging, by an act on the chain.
13. Identity's everyday acts now count for nothing in Law. Rule 36a still allows an area "by whole layer (Identity …)". What does such an area now govern?

**Identity, F152 and F153**

14. Which homes count as "where its signer's acts are published"?
    - Options: those at the act's binding, the current ones, or any the chain ever declared.
    - Story: Ana moves homes. Is a private link that only her old home holds still valid?
    - Built per act, the homes left to the caller.
15. Identity rule 13 still says a home "MAY store encrypted private links". Since a private link now counts only if published there, should it be SHOULD or MUST?
16. "Rests on own attempts" is read as "differs from the answer without any of the verifier's attempts". A case where only some of the attempts change the answer is not caught.
17. How does a link confirmation or termination name the claim in `objects`? No chain is stated. Built: any entry whose predecessor is the claim.

    "Signed by the MOR side" sits against "either side may end it". Built: for MOR-to-MOR links, either side.

**Text, F149**

18. Two points written into the long-form markup declaration, read from the existing text:
    - The line break that ends a block before another block may be hidden.
    - A character a backslash escapes ends a run of `*` or backticks.

## What changed beside the code

- `cmips/cmip-long-form-draft-1.md`: the markup declaration (F149), rule 12 and a "revised in place for F149" note. `cmips/README.md` and `clients/longform/README.md` follow.
- `docs/verifier2-report.md`: "Rerun after F156".
- The display client in `clients/site/built/` is not rebuilt. Its WebAssembly and `gateway.js` would change: the bindings gain `bindingStatus`, `publishedAtHome`, `link`, `lawPaid`, `anchors`, `lawDivideStake`, and the gateway bundles the long-form checker.
