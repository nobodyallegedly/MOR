# Agreements draft 11: what it marks "to build", built

*11 October 2026. Roadmap: build what Agreements draft 11 (approved 11 October 2026) marks "to build", one step: the library, its tests, the clients where needed. Branch `claude/agreements-draft-11-build-9yucpt`. The step was paused while main was red: `deal_promises_hold` failed on a seed, a gap in draft 11, decided as F266 and fixed on its own in pull request 9 (`docs/invariant-deal-promises-fix.md`). Main was merged in after that, and the build resumed on a green main.*

## In plain words

Draft 11 wrote down nine decisions the code didn't follow yet. The code now does, and each new piece cites draft 11's rule numbers.

- **A contest names the sale it disputes, not the whole vow** (F253). One bad match in a season marks one ticket contested, not every ticket the buyer holds. Saying which promise failed is optional.
- **A vow that mentions another vow says nothing about it** (Q2). Acknowledging the stream's vow confirms no seat at the match.
- **An agreement can be a party of another** (F254), named by its first version. What it agreed to stays agreed through its later versions. It can never end up a party of itself, and nesting stops at 8 layers, one number in the code.
- **The vault protects refunds too** (F255). A large refund sent to the refund address in a payer's claim doesn't count as repaid; it has to reach the payer's vault. A thief holding the payer's key can't redirect a big refund to themselves.
- **A buyer paying the owners directly tries the split services in order** (F260), as a publisher does: the backup only after the main service failed for that payment. Each owner's own check of their cut follows such a payment too.
- **Offers are of two kinds** (F261, F264). Some deliveries prove themselves (an anchored hash): the core asks the checker of the offer's cMIP for its verdict, and the anchoring cMIP's existing check is the first such checker. Everything else rests on someone's word and is sold under a vow. There, a proof such as a stream's key is kept beside the sale as evidence, and only the buyer decides whether the promise was kept.
- **A collective's closing checks nothing new** (F262, F265). A test shows an absent member's money going where the collective's own rules send it (its split service, which keeps what it cannot deliver), and the closing still counting, with nothing owed lost from view.

Nothing in draft 11 turned out wrong while building it; no question is put. The readings taken are listed below. One of them (F254, loops) has a consequence I name plainly, for review.

## What was built, item by item

### 1. F253: a contest and a confirmation name the sale (rule 13; "Contest (type 14)")

- **The contest format** (`core/src/agreements/formats.rs`, `Contest`):
  - Field 0 is the act it answers. For a vow, that is **the sale**: the buyer's payer's claim of the payment, or, at no price, the buyer's signature act on the offer.
  - The vow is named by its name in `objects`, `[[vow, vow]]`.
  - Field 1, optional, is **the promise not kept**: canonical text, or `[cmip, any]` (`Promise`). It is allowed in a vow's contest only.
  - A declaration's contest keeps its form, field 0 the declaration named in `objects`.
  - Constructors: `Contest::of_declaration`, `Contest::of_sale`.
- **The per-sale reading** (`core/src/agreements/view/vows.rs`, `sale_state`): a sale is contested only by the buyer's valid contest naming that sale and that vow. Draft 10's V-R9, where field 0 named the vow and marked every sale of the buyer, is replaced.
- **A confirmation names the sale.**
  - For a payment: the buyer's own claim of that payment is the sale, as before.
  - For a free sale: the confirming act acknowledges both an act about the vow and the buyer's signature act on the offer. This is draft 11's own reading, built as written.
- **Clients:** the WebAssembly library gains `vowContestPayload(vow, sale, promise?)`. No client signs a vow's contest yet, so no client changes.

### 2. Reading (Q2): a vow naming another vow is not an act about it (`about_vow`)

A vow is about another vow only as one of its versions, or by naming it in `objects`. A vow naming it in `refs` moves none of its sales' states. Any other act naming the vow in `refs` (a door scanner's record) still counts, as before.

### 3. F254: agreements as parties of agreements (rules 7 and 15; "Open technical parameters")

The work is in a new module, `core/src/agreements/view/parties.rs`.

- **Named by line.** A party or stake holder that is an agreement must be named by its founding version. Terms naming one by a later version are refused (`Agreement::invalid`, never existing), and payer-side splitting refuses to pay such a holder. This replaces the build's version-hash mechanic.
- **Consenting by its own rule, carrying what it signed.** An agreement-party signs an act where every party of some version of its line signed it, from its founding version up to its version in force (`line_signed`). A later re-version cannot undo it. A collective is still named by its identity and signs with its own keys.
- **No loops, failing closed** (`party_problem`). A version naming its own line is refused. So is a later version whose agreement-parties, followed through their signed versions, lead back to its own line.
- **The nesting bound.** `NESTING_BOUND = 8`, one constant in `formats.rs`, a freeze parameter. It is used by consent, by payer-side splitting, by the participant's cut check, and by the terms check: a ninth layer below is refused.
- **A manifest neither claims its parts nor is reached by their claims.** Nothing new was needed: a work claim binds one hash. A test shows it.

### 4. F255: the vault's limit protects refunds (rule 11; `repaid`)

A refund paid to the refund rail the payer's own claim names counts only where its amount is within the payer's vault limit for its unit, judged as Money rule 14a judges a payment to the flow. Above that limit it counts only once it reaches the payer's vault. A payer with no vault has no vault rule. A bare key has no vault, so no limit, as draft 11's reading says.

### 5. F260: every payer tries the services in order (rules 15, 17, 18)

- **The receiver for a direct buyer:** `AgreementsView::direct_receiver(agreement, payment)`. It runs as for a layer: field 14's service first, then field 29's backups, each only where the attempt before it is stated failed for that payment. The split cMIP's answer is a fact the caller states, `attempts_failed`, as before.
- **A backup's split of a buyer's payment received directly** (not a layer's share) breaks the plan unless the backup is the receiver in order. This shows on the split (`SplitEval::problems`), and so on each participant's cut check (rule 18), which follows a direct buyer's payment to its payouts.
- **A backup receipts in the owners' name with the grants it already holds** (field 29's, one per payee in a deal). This was already accepted; the test checks it.
- Money's pointer format is unchanged.

### 6. F261 and F264: two classes of offers, and evidence (rules 11 and 13)

- **Telling the classes apart:** `Sold::class()` gives `OfferClass::Publication`, `Proven { cmip, params }` (the access form) or `Promised(vow)` (`core/src/agreements/proofs.rs`).
- **The checker:** a `ProofChecker` trait gives a proof's verdict (`ProofVerdict::Proven`, `NotProven(why)` or `Unknown(why)`) from the offer, the item's parameters and the proof.
  - `AgreementsView::proven_delivery(offer, proof, checkers)` asks the checker of the cMIP the offer names, among those the caller holds.
  - With none held, the verdict is unknown: the delivery is not proven for that verifier.
  - An offer selling nothing in the access form is no proven offer, and gets an error.
- **The first checker:** the anchoring cMIP's existing `judge`, wrapped as `mor_anchoring::service::Checker`. The hash is in the batch or it is not. No new cMIP.
- **Evidence under a vow** (F264): each sale of a vow lists, as `VowSale::evidence`, the valid acts naming that sale in their `refs`, such as the seller's delivery of a stream's key. Evidence is shown and never moves the sale's state.

### 7. F262 and F265: nothing new checked

The core keeps what draft 11 says: the closing counts only when the collective holds nothing, and nothing owed vanishes silently. A test confirms it. A collective whose split plan gives an absent holder 20% has its split service pay out; the absentee never takes their share, which stays the service's open obligation (rule 24). The closing names nothing for it in field 4, and is complete. After the closing, the share is still shown as owed.

## Readings taken

Each is a mechanic under the rules, not a rule. Each is marked "(mechanic, the build's)" in the code.

1. **F253, which act is the sale.** For a payment, a contest may name any of the buyer's own valid claims of that payment, with the rail's answer: one payment, one sale.
2. **F253, draft 10's form.** A contest naming the vow in field 0 names no sale, and marks nothing.
3. **Q2.** A vow is about another only as its version, or by naming it in `objects`; naming it in `refs` never counts.
4. **F254, carrying what was signed.** Consent counts from any version of the inner agreement's line up to the one in force. No clock orders a signature against a later version, so a signature made under a version already superseded is not told apart. In a deal every version needs every party, so this needs all of a version's parties.
5. **F254, which versions the loop and bound walk follows.** Every held version of a party's line whose parties that are not themselves agreements have all signed it. A draft nobody signed moves nothing, and no version's own verdict is read, so no judgment depends on itself.
6. **F254, which terms a loop refuses.** A founding version is never refused for a loop: whatever names its line was made after it. A later version is refused wherever the loop holds, because no clock orders two later versions of different lines (fail closed). *The consequence, named plainly:* if A's later version names B, and later every party of B signs a version naming A, both later versions are refused, and A returns to its earlier version. B's parties can so undo A's change only by signing, all of them, a version that is itself refused, in public. Read as the rule's "failing closed".
7. **F254, the bound.** It counts the layers of agreements below the one judged; eight are allowed, a ninth is refused. The layers build allowed one more in places (its "depth > 8"); no test relied on it.
8. **F254, holders.** A stake holder naming an agreement by a later version is refused as a party would be.
9. **F255.** Judged per payment, as rule 14a does, against the payer's vault in force.
10. **F260, which act names the payment.** An attempt stated failed for any act of the same rail payment (the buyer's claim, or the receipt) counts for that payment. Only a backup's split is checked; field 14's service always receives first.
11. **F261, an offer selling several proven items.** The first whose checker says proven decides. Checkers are passed to each call, so a checker may borrow a clock.
12. **F261, the anchoring proof's encoding.** `[ticket, anchor / null]` (`service::delivery_proof`). Anchored by the deadline is proven. Omitted, late, a default or not paid is not proven. Pending, an unfollowed clock, or an offer or payment not held is unknown.
13. **F264, what counts as evidence.** A valid act naming the sale in its `refs`, by anyone. Shown, never judged by the core: what a proof is stays the cMIP's.

## Questions

None. Each point was checked against the working rule "core business, or the participants' choice". The consequence in reading 6 follows from the rule as decided ("failing closed"), so it is named for review, not put as a question.

## Tests

**Before** (main at `0e7cd68`, whose code is pull request 9's; `scripts/test-all.sh` without `--reproducible` or regtest, run for that pull request): all passed. Rust 608 passed, 0 failed, 1 ignored. TypeScript 220 passed, 0 failed.

*How the first baseline went wrong, for the record:* this step's first run on main had its TypeScript half spoiled, because I edited the tree during the run. A clean rerun found main red (`deal_promises_hold`), and the step stopped there until pull request 9 fixed it.

**New tests (14):**

- `core/tests/vows.rs` (6):
  - `draft_11_f253_a_contest_names_the_sale_not_the_vow`
  - `draft_11_q3_the_promise_not_kept_is_optional`
  - `draft_11_f253_a_confirmation_names_the_sale`
  - `draft_11_q2_a_vows_reference_to_another_vow_confirms_nothing`
  - `draft_11_f261_a_proven_offer_is_judged_by_its_cmips_checker`
  - `draft_11_f264_a_key_delivered_under_a_vow_is_evidence_not_a_state`
- `core/tests/agreements_collective.rs` (7):
  - `draft_11_f254_an_agreement_is_named_by_its_line_and_carries_what_it_signed`
  - `draft_11_f254_no_loops`
  - `draft_11_f254_nesting_is_bounded_at_8`
  - `draft_11_f254_a_manifest_neither_claims_its_parts_nor_is_reached_by_them`
  - `f255_the_vault_limit_protects_a_refund_to_the_refund_rail`: freeze suite v21, step 7w, "The debt rule".
  - `f260_a_direct_buyer_tries_the_services_in_order`
  - `f262_f265_an_absentees_share_follows_the_collectives_rules_and_the_closing_counts`
- `modules/onchain/tests/agreement.rs` (1): `draft_11_f261_the_anchoring_check_is_the_first_proof_checker`.

For F255 and F260, each test was also run with the change taken out, and it failed.

**Freeze-suite steps.** Draft 11 names two:
- the "Announcements" line, for F253 and Q3: the vow tests above;
- step 7w, "The debt rule", for F255: the F255 test above.

Both suite lines now say "built" instead of "to build", as do the two sentences in core v21 that quoted them.

**Tests changed, not added:**
- the existing vow tests now contest the sale (`contest` takes the sale);
- the free sale's confirmation acknowledges the sale, per F253;
- `review_live_work`'s stranger names a sale;
- a declaration's contest uses `Contest::of_declaration`.

**No vector changed.**

**`deal_promises_hold` with ten seeds** (`AGREEMENTS_INVARIANT_SEED`, 48 cases each, release build), since the view code these properties check (splits, `repaid`, agreements) changed:

All ten pass. They were drawn by Python's `random.Random(11)`, 64 bits each: `15970126346341786989`, `15806332507635138087`, `14410929494797389965`, `8334835209022527425`, `15772808007039181501`, `3503074255122127410`, `14829343298631886456`, `8776282599422980546`, `11325541433240190585`, `3434298343398869075`.

**After** (`scripts/test-all.sh` on this branch, without `--reproducible` or regtest, the tree untouched during the run):

RESULTS_AFTER
