**Done: this is S7h-4's last commit. The suite may rebuild its releases against it** (the WebAssembly changed).

# S7h-4, the redesign's core gaps closed: report

*Session S7h-4, 30 October 2026, on branch `claude/s7h-the-redesign` (pull request 113), beside the Dubsar Suite's round. It built F406's decisions into the core, and closed the 17 skipped core tests. It recorded no finding: F408 stays free. It touched `core/`, `wasm/` (one binding), `spec/` (rule 64.3, with rule 83's matching line), `scripts/c-box/vectors-README.md` and `docs/`.*

## The decisions built (F406)

- **Q1, a sale before a price tag's withdrawal** (`publishing.rs`: `tag_withdrawals`, in the purchase check). On a push rail, a receipt the split service records with the withdrawal in its history is no sale. That means after its own signature on the version with no price, or with that version in the receipt's history. On a request rail nothing changes.
- **Q2, Identity rule 49 as written** (`chain.rs`: `objection_voids`). One valid objection from a live home of the old set voids a person's homeless rotation, which is now shown as void, where it was pending. A collective's homeless rotation is its own escape endorsement and is unchanged.
- **Q3, a plan passes a stake** (`view.rs`: `plan_stakes`). A plan-marked clone passes the party's stakes to its stake successors, in the plan's parts; every other holder stays as it was.
  - Rounding is the build's, as for a stake moved by abandonment: each heir's gain may be off by less than one millionth, and the total is exact.
  - Rule 64.3 now lists this as "the party's stakes passed to its stake successors, in the plan's parts (field 7)", and rule 83's list says the same. A plan naming stake successors whose clone leaves the stakes as they were is invalid.
- **Q4, a layer's rule under a plan** (`view.rs`: `plan_layers`). A plan-marked clone changes field 19 only by putting the seat successors in the party's place, once for each seat; the core refuses any other change there.
- **Q7, `after_closing`** reads the collective an act names, not its signer.

## The 17 tests restored

`core/tests/agreements_collective.rs` now passes 253, with none skipped.

- **Rule 93 for publications (12).** The core already did what rule 93 says: `owed_back`, `stretch_sale`, and the purchase check's "signed anew". Only the fixtures moved, from a receipt fulfilling terms to a publication and its price tag. The 12 tests:
  - `rb2_bq2_bq3_…_judged_by_the_publication_named`
  - `rb2_a_payment_to_the_collective_itself…`
  - `f189_7…`
  - `f190_qf5…`
  - `qg2_…` (two)
  - `f255…`
  - `qg1_…` (two)
  - `f197…`
  - `f208…`
  - `f219…`
- **Rule 48 on a split agreement's versions (1).** It was already wired. The test's later version simply lacked the members' signatures, so it never counted.
- **The owners' matters on a collective's split agreement (4).** `owners_consent_problem` was rewritten:
  - A version paying the stake less is judged on the collective's agreement in force for it.
  - The roster is read at the version, applying the transfers its history places.
  - Every holder who is no member signs under "every holder". Under a rule by share, the holders signing must meet the share, and a proxy may vote for a non-member who has not signed. A non-member the rule does not bind signs for itself.
  - New, `successor_split_pays_less`: a fork's successor whose first split agreement pays its kept holders less than the original's needs them too (rule 95).
  - Tests: `f270_f274…`, `a_holders_rule_3_7aj`, `who_holds_what_at_the_vote_3_7ad`, `proxies_3_7ak`, `a_forks_founding_plans_3_9ag`.
- **Also,** `a_seat_passes_by_automatic_succession` now passes Ben's stake to his children in its clone, as Q3 requires.

**Expectations moved,** each because the text is clear:
- **3.7aj, 3.7ad, 3.7ak:** a split agreement's version falls under the judicial tier, so every member signs it. The members' signatures therefore always count, and the stories were re-cut so that each case still turns on a non-member holder.
  - 3.7aj: Dana now holds half the stake. The members alone fall short, and her signature carries the change.
  - 3.7ad: the shares are 20% for each member and 40% for Dana, so that the seller dropping out after the line places the transfer still shows.
  - 3.7ak: the case where Dana's own signature, placed by the line, beat Pat's vote and left the change a draft is dropped (question 1).
- **The rule-93 cases** no longer ask for the old wording of the reason, only that the payment is no purchase.

## Verdicts moved, and vectors added

- **No case whose acts are unchanged moved its verdict.**
- **Six cases changed their acts, each the decision's own case, their verdicts as they were:**
  - 9.3's four: the succession clone now passes Ben's share to his two children; its words, its rotation and Dee's text follow.
  - 9.6's two on the withdrawn tag: the version with no price now names the tag it follows in `objects`, as Money rule 18 writes a later version.
- **Four Agreements cases added:**
  - 9.3, the clone leaving Ben's share where it was: invalid;
  - 9.5, a person's homeless rotation under an objection: void;
  - 9.6, a payment naming the tag's earlier, priced version, receipted on a push rail after the withdrawal: no purchase;
  - a succession clone also adding a member to the rule for Text: invalid.
- **Readmes:** `core/vectors/README.md` and `core/README.md` are updated, and `scripts/c-box/vectors-README.md` is brought level with the first, S7h-3's note included.

## Binding changes, for the Dubsar Suite

Listed in `wasm/README.md`, old shape first:

- **`agreementsConsent`'s area counts.** `area` was the core's internal lane id for a layer's rule, near 2^64. JavaScript cannot hold it, so the call threw for every act counted under a layer's rule: the suite's report.
  - It is now a JavaScript number: a finer area's id, or minus the layer for a layer's rule.
  - A new `layer` field gives the layer's number, or `null` for a finer area.
- **Verdicts an app may see change:**
  - the withdrawn tag on a push rail;
  - a person's objected homeless rotation, now void;
  - plan-marked clones and stakes;
  - a collective's split-agreement versions needing their holders.
- **The anchoring binding is unchanged.** The moved anchoring cMIP is on the suite's own branch, not yet on this one; the binding follows it once it is.

## Questions

1. **What places a holder's vote on a split agreement's version** (rules 94 and 97).
   - *Plain words:* for a clone of terms, the record is the line that puts it in force. A publication's version counts once every party has signed it, and no line puts it in force.
   - *As built:* the version's own history is its line. Transfers and proxies are placed there; a holder's valid signature is its vote, and always beats its proxy.
   - *Options:*
     - (a) This reading.
     - (b) The text names a placing act for such votes.
   - *Lean:* (a). *Cost:* rule 97's "a signature of the holder's the line does not reach leaves the proxy standing" never applies to a publication, and a disowned holder's vote is not shown as kept by a line.
2. **From S7h-3, still for the next text pass after the merge, per F406:** the stranger's wording points (S7h-3's question 5).

## c-box

`scripts/c-box/make-c-box.sh` into a scratch folder assembled 8 texts and 12 vector files, refusing nothing.

## Checks

- **Rust:** `mor-core`, `mor-relay`, `mor-airgap` and `mor-wasm` pass every test, with `agreements_collective` at 253 and none skipped. The cMIPs' tests and the apps are the suite's.
- **Vectors:** they regenerate byte for byte, the Rust check passes 10 of 10, and the Python check says "all 276 vectors agree".
- **The second verifier:** its Python unit tests pass.
