# Judges, vows and the pointer: F246, F247 and F248, built

*A building session for Nobody, allegedly: one roadmap step, three decisions (findings log, round 2: F246, F247, F248; F236, F244 and F245 as records). Branch `claude/judges-vows-pointer-build`, rebased onto main. Test identities only. Texts revised in place, for Nobody, allegedly, to approve again: Agreements draft 10, the freeze test suite v21, core v21's open list.*

*The core library changed, and what its WebAssembly binding answers with it: one input was added to the binding (`settled_out_of_turn`, below), no function added or changed. No format changed; the vectors are unchanged.*

## In plain words

**1. One deadline per stage, for the question, not per person (F246).** A deal can name a chain of judges: the first, and others who take over if it does not answer in time. Until now the program started a separate clock for every request, so the first judge could miss Ben's deadline but still answer Ana's, while the second judge answered Ben's: two judges, two answers, and F236 said the first judge won. You decided there is no "deadline per party", only the agreed deadline. So now the clock belongs to the question (here, the disputed fork). Ben's request starts the first judge's time; Ana's later request joins it and starts nothing new. If that time runs out with no answer, the second judge is the one in charge and the first judge is out on that question for good: whatever it signs afterwards counts for nothing. Only the judge in charge can settle, and only during its own time. A settlement the second judge signed before its turn came counts for nothing, even after its turn comes; it has to sign again. In the case you were asked about (QL2), where the first judge answers late after seeing the second judge's answer, the second judge's answer stands.

**2. Vows are read like works (F247).** When someone offers a work for sale under an agreement that is not the one owning the work, MOR shows it as "outside the owning agreement": still a valid offer, but visibly contradicting a signed deal. Vows now get the same treatment. In the test, Dario and the club own a vow (the cup final, from the stands); Dario and a sponsor also write a stake in it under a second deal and sell it. The sponsor's offer is now shown as outside the club's deal. It still counts and the fan's purchase still stands; the buyer simply sees that the seller is not the deal owning the vow. While building it I found the library showed this for works only in a different case (an offer not every party had signed), not for a work offered under a second agreement. It now shows both the same way, since the rule says "as it reads a work's".

**3. One address for the work's money (F248).** A work's agreement now has one designated pointer for payments, the same whoever pays: a buyer, or a publisher passing on the work's share. The publisher pays that pointer and divides nothing; its job ends there. No new field was needed. The agreement already says which split service it uses (field 14), and the existing rules already make that exactly one service: in a deal, every payee's grant must name the same service, or the deal carries none of them. So field 14's service is the designation. A deal with one owner holding everything, and no split service, points at that owner's own pointer, as F244 already said. A deal naming no service at all, or whose payees named different services, has no designation and cannot be paid through a publisher until it designates one.

One thing to tell you plainly. QV2, as the last build put it, said "each payee may grant its own split service, so an agreement may name several." That misread the text: field 14's grants must all name the same service. An agreement names several services only through its chain of judgment (backup services that take over if the first stops working). Until now a publisher paying one of those backups counted as paying the work; now only field 14's service counts. Whether the designation should move to the backup once the chain has passed to it is a question I could not answer from the texts (QW1, below). Meanwhile a payment to a backup shows as a mismatch, which is the cautious answer.

## What changed, precisely

### 1. F246 (supersedes F236)

**Library** (`core/src/agreements/view.rs`):

- **`judges_lapsed`** is now keyed `(question, judge)`, no longer `(request, judge)`: the judge's stage on that question passed with no answer within it, as the caller reads the agreement's time reference. For a deal's fork the question is the fork's reference (the version the settlement requests name); for a request to a judge (type 25), its field 2.
- **New caller fact, `settled_out_of_turn`:** judges' settlements (type 23) the time reference places before their link's stage opened. The library reads no clock, so the time reference's answer comes from the caller, as for `judges_lapsed`. A settlement signed after its stage closed needs no entry: its link is in `judges_lapsed`.
- **`arbitrated`:** a settlement counts for nothing where its link is listed as lapsed on the fork, or where it is listed as out of turn.
- **`deal_walk`:** a link is active on the fork only once every link before it let its stage on the fork pass, or answered "unknown" (F206 a); no longer per request. The F236 branch (the earlier link prevailing between two links' settlements) is removed: with one active link per question, two links' settlements never meet. F206 (a) within one link, F206 (b) (the parties against a judge) and F192 (a settlement holding another is after it) are unchanged.
- **Binding** (`wasm/src/lib.rs`): `judges_lapsed`'s description reads per question; `settled_out_of_turn` added as an optional input (empty by default). No client passes either yet.

**Texts.** Agreements draft 10: rule 34a (the per-request period and F236's sentence replaced by F246: the chain runs per question; the first valid request with standing starts the active link's period on the time reference; later requests join that stage; the next link active and every earlier link void once the period passes with no answer; only the active link settles; a settlement outside its link's active window counts for nothing; QL3 read the same way); rule 45b's paragraph on two complete versions (F236's sentence replaced; the stale "refused rather than guessed: QK1" line removed; the judge of forks' period counted from the first request on the fork); "Decided" (F246); QK1's entry marked superseded. Freeze suite v21: step 1.7a rewritten for F246; a header note. Core v21: the open list.

### 2. F247

**Library** (`core/src/agreements/view/selling.rs`): `OfferEval` gains **`outside_claims`**: the agreements, as in force, whose stakes claim what the offer sells (a publication's work, or a vow's name, read by `work_owners`) and under whose line the offer is not made. It is shown, not a problem: the offer stays valid and may count. Read by a new helper, `outside_claims`.

**Texts.** Agreements draft 10: rule 15b (an announcement's name read as a work's; the mechanic); "Decided" (F247); QV1 marked answered. Freeze suite v21: the announcements component line.

### 3. F248

**Library** (`core/src/agreements/view.rs`): **`layer_receivers` replaced by `layer_receiver`**, which returns the one designated pointer or none: field 14's one grantee (in a deal through `deal_services`, field 14's group first; in a collective, its one grant), else a deal's lone owner holding every stake. A service the chain of judgment names to take over is no longer read as the pointer. The split check (`split`) compares a payout's receiver with that one pointer. `layer_services` (field 14 and the chain's services) stays, read only for a service's own account (`layer_share`): a named service that received a layer's share still holds it as an open obligation until split.

**Texts.** Agreements draft 10: terms field 14's comment (its one grantee is the designated pointer); rule 16 (the vow grammar build's mechanic replaced by F248: the designation, the publisher's obligation ending at it, how it is written, the lone owner, the chain's services not designated, an agreement designating none or naming several without designating one); rule 23; the split plan's checks; "Decided" (F248); QV2 marked answered, with the misread premise stated; QW1 added. Freeze suite v21: scenario 7, step 8a.

## Tests

- **Before** (main at `50e613b`, the vow grammar build's count): Rust workspace **593 passed, 0 failed, 1 ignored**; TypeScript **205 passed**.
- **After** (this branch, rebased onto main, `cargo test --workspace --locked` and `scripts/test-all.sh`): Rust workspace **597 passed, 0 failed, 1 ignored** (+5 new, −1 replaced); TypeScript: see "Test run" below.
- **New Rust tests** (`core/tests/agreements_collective.rs`), each seen failing against the old library first:
  - `f246_the_chain_runs_per_question_a_judge_whose_stage_passed_is_void_on_it`: F236's own case, now answered the other way: the next link's settlement stands, whichever was signed first.
  - `f246_only_the_active_link_settles_on_any_request_on_the_question`: while the judge's stage runs, the next link's settlement counts for nothing; once it passes, the next link settles on the later request too.
  - `f246_ql2_the_later_links_settlement_stands`: QL2, the judge settling after seeing the next link's settlement.
  - `f246_a_settlement_outside_its_links_active_window_counts_for_nothing`: three links; a settlement signed before its stage opened counts for nothing; within its stage it settles; after its stage passed it is void too.
  - `f248_the_work_agreement_designates_one_pointer_and_the_layer_pays_it`: field 14's service receives; the chain's backup service and an owner are mismatches; payees granting two different services designate none.
- **Removed:** `f236_of_two_judges_in_the_chain_settling_one_fork_the_earlier_prevails`, replaced by the F246 tests.
- **Changed answer:** `qg4_the_judge_of_forks_follows_the_chain_of_judgment`. Its next link settled while the judge's period still ran; before, that settlement counted once the period passed. Now, placed by the time reference before its stage opened, it counts for nothing, and the next link signs again within its stage. Keys moved from the request to the fork.
- **Review test 4 updated** (`core/tests/review_announcements.rs`): `an_offer_naming_a_vow_under_a_second_agreement_is_not_shown_outside_the_first` is now **`…_is_shown_outside_the_first`**: the sponsor's offer is shown outside the club's deal, still counting, the purchase standing; a lone seller's offer is outside both; a work offered the same way is shown the same way. The file's header says what changed and why.
- **The vectors** (`core/tests/vectors.rs` and its data) pass unchanged: **no vector changed**, because no format changed. `judges_lapsed` and `settled_out_of_turn` are the caller's statements to the library, not anything signed or sent.

## Questions for Nobody, allegedly

1. **QW1. Does the designated pointer move with the split service's chain of judgment?** F248: a work accepts payments at the same pointer whoever pays, and the designation is field 14's one service. A deal's chain of judgment can name backup services that take over if field 14's stops acting (rule 34a, H6), and the payee pointer check (rule 18) already accepts their addresses. Once the chain has passed to a backup, does a publisher pay the backup as the designated pointer, or must the work's agreement first be cloned to designate it? *As built:* only field 14's service is designated; a publisher's payout to a backup is a mismatch (the cautious answer), and the backup, having received it, still owes splitting it.

## Readings taken under the delegation of mechanics, to confirm

Each respects the decided rule; none changes what a rule decides.

- **J-R1. What "the question" is.** For a disputed fork, its reference, the version the settlement requests (type 22) name. For a request to a judge (type 25), its field 2, the act it is about.
- **J-R2. When the next stage's period starts.** From the end of the stage before, not from a new request.
- **J-R3. The time reference's answers come from the caller.** The library reads no clock: the caller states which links' stages passed on which question (`judges_lapsed`) and which settlements were signed before their stage opened (`settled_out_of_turn`). A caller that states nothing about a settlement leaves it counting where its link is active, since the library cannot see when it was signed.
- **J-R4. Who was asked.** Unchanged from review 2.6's mechanic: a settlement names a request on the question that reached its link and every link before it (public, or sealed to each). A request that reaches no judge starts no stage.
- **J-R5. A judge contradicting itself** (F206 a) makes the next link active with no period to wait, as before. A settlement the next link signed before that is placed by the caller like any other out of turn.
- **V-R15. "Not signed under that claim's agreement".** Read as: the offer's field 0 names no version of that agreement's line (the same founding terms). A lone seller's offer is under none, so outside every agreement claiming what it sells. Whether every party of a deal signed the offer stays OF3 (a)'s (`unsigned`).
- **V-R16. "Claimed".** The agreements, as in force, whose stakes write shares in the vow's name, read as for a work (`work_owners`).
- **V-R17. Works read the same way.** An offer selling a publication is read through its work hash (field 1) by the same helper. Publications themselves (Envelopes acts, with their `for` field) are not judged here; nothing about them changed.
- **V-R18. Shown, never a problem.** `outside_claims` does not stop an offer counting or a purchase standing (rule 15b: "a valid act that visibly contradicts a signed agreement").
- **P-R1. How the designation is written.** By field 14's one grantee, no new field: in a deal every grant field 14 lists names the same service, or the deal carries none of them (F129 reading 3); in a collective, its one grant. An owner acting as treasury is an owner so named (V-R12, unchanged).
- **P-R2. A lone owner.** A deal of one party holding every stake it writes, with no split service, designates that party's own payee pointer: the one pointer its terms can mean (F244).
- **P-R3. "Naming several split services without designating one".** Field 14's grants naming different services: the deal carries none of them, so it designates none. The chain's backup services are not designated (QW1).
- **P-R4. A service's own account is unchanged.** A service named in field 14 or in the chain that received a layer's share holds it as its open obligation until split (rules 20, 29), designated or not: the library shows more owed, never less.

## Test run

*Filled in after the rebase onto the latest main.*

## Not done here

- No client passes `judges_lapsed` or `settled_out_of_turn` yet, nor shows `outside_claims`; the library gives every client the same answer. The display client release and the gateway update the roadmap names follow the merge.
- Scenario 7's pass line still speaks of "the next layer's split service" (F235's wording); step 8a carries F248.
- The findings log's entry for this build, and the roadmap row, are left to the project lead.
