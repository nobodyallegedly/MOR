# Building decisions F169 to F181

*7 October 2026. A building session, branch `build-f163-f168`, with main (`d0000f8`, decisions F169 to F181 and the spec updated for them) merged in. It builds F169 to F181 and finishes F167 from branch `f167-floor-open-question`. Branch `held-f164-f166-f168-11` was not used: F164 and F166 were replaced by F169 and F172. Nothing in `spec/` or the findings log was changed. The previous report is `docs/decisions-f163-f168-build-2026-10-07.md`.*

*How it was built: this session built F173 and Finance rule 15 itself. Three agents (the same model as this session), each working on its own copy of the code, built the other parts: F172, F171, and the text floor. Each part was then folded into the branch as a single commit.*

## In plain words first

- **Theft: anchor or bear the loss (F169, F176 to F181) is built.**
  - The owner names a clock: a main time reference and, optionally, a backup. It is declared with the safety key.
  - After a theft, the owner changes the locks by rotation. While that rotation is not anchored, every payment that followed what was published counts. The owner bears the loss.
  - Once the home receipts that make the rotation count (its "quorum") are anchored on the owner's clock, a payment it affects counts only in two cases: the owner's own valid receipt shows it, or the payer's claim was anchored on that clock before or at that point.
  - The stolen-phone story runs end to end and comes out as the decisions say. It uses real signed acts, three homes, real Lightning invoices, and the payment cMIP.
- **Anchoring is in the Envelope part of the core library (F173).** It gives any act a proof on a named reference, and compares two anchors only on the same reference.
- **Absence returns to the authority's judgment (F172).**
  - The core no longer reads time.
  - Clause key 2 makes terms invalid.
  - Key 3 names an absence-proof cMIP. Where it is named, its acceptance is needed.
  - The old time checks are kept as a reference module, outside the core path.
  - Before a party signs terms with an abandonment clause, the client shows in plain words who can declare it absent.
- **The tally chain (F171).**
  - Every split act carries the running count and cites the previous split for its stake.
  - A reset, a fork, or a wrong count breaks the plan.
  - Every split goes to every holder, and each holder's client checks it against the chain it keeps.
  - The count's key in the split format is **proposed, not in the spec** (question 1 below).
- **The text floor (F167, F174, F175, F178) is built in full.** Quotes and links work again. 804 of 20,000 generated texts are still refused, all for the format's own markup touching a digit, and each refused text is shown plain (questions 9 to 12).
- **Every test passes:**
  - Rust workspace: 403 tests, 0 failures.
  - TypeScript: 172 tests across the eleven packages.
- **Every new test was checked to fail with its fix taken out.**

## What was built

### F173: anchoring (core library, Envelope part)

- **Code:** `core/src/envelope/anchoring.rs`.
  - A `Reference` is an anchoring cMIP's hash and its parameters: one time reference, in Finance's clock entry and Law's time reference shape.
  - A cMIP plugs in through `AnchoringCmip::verify(act, params, proof)`, which returns a point.
  - `Anchors` holds what was checked, or what the caller states. Each act keeps its earliest point on each reference, and `compare` works on one reference only.
  - A point is a `u64` in the order the cMIP defines. The core only compares points.
- **Tests:** two unit tests (earliest anchor per reference; a proof checked by the cMIP the reference names). The rule 15 tests below anchor everything through a test anchoring cMIP that really signs and checks its proofs.

### F169 to F181: Finance rule 15

- **The clock (F176, F179, F181).**
  - `finance::Clock`, `clock_declaration` and `clock_in`, kind 1 in the declarations slot.
  - The format is `[ main, ? backup ]`, each entry `[ hash, any ]`.
- **The home quorum (F180).**
  - `chain::Quorum` and `Verifier::quorum(identity, rotation)` give the receipts that the home rule in effect before the rotation requires, each passing the receipt checks, per operator.
  - `finance::quorum_point` turns those into a point: the need-th earliest operator's anchored receipt. For an identity that counts on its own signatures, the rotation's own anchor is the point.
  - A rotation held back, or held by fewer homes than the rule requires, has no point.
- **A lock change by its effect (F178 item 5, F181 item 4).**
  - `LawView::payment_counts` asks, at each link of the payee's chain, whether the payment followed the chain as published there:
    - for the flow: the pointer stood there, on the unbroken chain (rule 12), and rule 14's version selected from the payee's acts as they stood there is that one or later;
    - the vault in force there lets the payment go to the flow;
    - for a vault payment: the entry is still in the vault.
  - A lock change is a rotation after which a payment that followed the chain immediately before it no longer follows it.
  - `LawView::lock_changes` lists them, for a client that must explain.
- **The rule itself (F169, F178, F179, F175).**
  - `finance::rule_15`, `lock_point` and `claim_in_time`.
  - An unanchored lock change leaves the payment counting.
  - An anchored lock change needs one of two answers: the payee's own receipt, valid now (on the kept line, under a key bound after the rotation, or by a grant whose grant still stands), or a payer's claim anchored on the declared clock before or at the point.
  - Comparison is on the main reference where the lock change is anchored there. Otherwise it is on the backup, and a claim anchored on the main reference then counts too.
  - The clock is the one declared before the lock change. With no clock declared, the lock change counts as unanchored.
  - Where several lock changes affect one payment, every anchored one must be answered. That is the same as "anchored before the first of them".
- **Which version is selected (F178 items 3 and 4).**
  - For a payment that counts under rule 15, the version is selected from the payee's acts as they stood before the lock change, the voided ones included.
  - Now, a voided act holds no pointer, and its receipt is no receipt.
- **Rule 12a and the payment cMIP (F181 item 5).**
  - `mor_payment::beside` first judges the payment on the chain as it stands now.
  - If the payment does not follow it, `beside` asks the core's rule 15 through a new `Held::payment_counts`.
  - `verify` checks the rail Module of the pointer or vault entry paid to, as the chain stood for the payment.
  - The vault applies as the chain declares it (`Held::vault_in_force`). F160's `vault_at_binding` and the F139/F146 `PayersClaim` proviso are removed.
- **The owner's client (F181 item 6, rule 14b), in `clients/genesis`.**
  - It declares a clock at genesis or rotation.
  - After every rotation that counts, `settleRotation(anchoring)` anchors every receipt of the quorum the core names, on the main reference. It uses the backup only where the main one fails, and reports a failure without losing the settled keys.
  - Every rotation is anchored, because any rotation can be a lock change for some payment.
  - `clockWarning()` and the command line say plainly, before a genesis or rotation that leaves no clock, that a theft's loss will be the owner's.
  - WebAssembly gains `Verifier.quorum` and declarations given as CBOR.
- **Payer's client (rule 15: read the clock, write the claim, anchor it promptly).** No shipped client pays yet. The stolen-phone story's wallet does all three.

**Tests, each run with its fix removed:**

| Test | Fix taken out | Failed at |
| --- | --- | --- |
| `anchor_or_bear_the_loss` | rule 15 reads no lock change | `finance_rule_15.rs:351` |
| same | "before" read strictly (not "or at") | `:355` |
| `the_version_is_selected_as_the_payees_acts_stood_before_the_lock_change` | voided acts left out of the selection before | `:374` |
| `a_claim_anchored_on_another_clock_is_not_protected` | a claim compared on any reference | `:398` |
| `the_backup_clock_is_used_only_when_the_main_one_is_not` | backup compared first | `:438` |
| `with_no_clock_declared_the_owner_bears` | no clock read as anchored | `:452` |
| `the_clock_declared_before_the_lock_change_decides` | clock read at the lock change | `:470` |
| `the_point_is_when_the_home_quorum_is_anchored` | point at the earliest receipt (F177's reading) | `:489` |
| `a_rotation_held_back_has_no_point_until_its_quorum_is_anchored` | rotation's own anchor as the point for a homed identity | `:516` |
| `a_self_hosted_rotations_own_anchor_is_its_point` | no point for a self-hosted rotation | `:542` |
| `the_payees_kept_receipt_answers_the_lock_change` | receipt not read | `:580` |
| same | a voided (thief's) receipt counted | `:581` |
| `a_lock_change_is_defined_by_its_effect` | every rotation treated as a lock change | `:612` |
| `several_lock_changes_the_claim_must_be_anchored_before_the_first` | only the last lock change judged | `:654` |
| genesis client: anchors its home quorum (three real homes) | anchoring call removed | test fails |
| genesis client: says plainly when no clock | warning removed | test fails |

**The clock format test** (`the_clock_declares_a_main_reference_and_an_optional_backup`) pins the format. It has no fix of its own to remove.

**Older tests changed:**
- `core/tests/finance_f145.rs` loses the F139, F146, F147-together and F160 tests, which the new file replaces.
- `modules/lightning/tests/flow_theft.rs` states the core's rule 15 answer in its stand-in for what the verifier holds, and replaces the F160 test with "a lowered vault applies at once".

### The stolen phone, end to end

**Test:** `modules/lightning/tests/stolen_phone.rs`.
- **Setup.**
  - Ana declares a clock (main and backup), three homes (one her own; the default majority, two of three) and a vault above 50,000 sat.
  - She signs a label's deal citing her wallet.
  - A thief with her signing key publishes a wallet and re-signs the deal citing it.
- **Royalties paid to the thief's wallet in the window, on real invoices:**
  - (1) the label's wallet anchors its claim at 100 on Ana's main clock;
  - (2) a payer colluding with the thief anchors at 90, on a clock Ana never named;
  - (3) a payer never anchors.
- **Ana's rotation held back.**
  - Ana signs a rotation, anchors it herself at 105, and holds it back.
  - (4) An honest payment is anchored at 130.
  - She then publishes the rotation. The homes receipt it, and her client anchors the receipts at 151 (her own home), 160 and 170.
- **Results.**
  - Before the quorum is anchored, all four count.
  - The point is 160. After it, (1) and (4) count, and (2) and (3) do not. The core and the payment cMIP, judging beside the rail, agree.
  - After the lock change, a payment to the thief does not count even when anchored, and one to Ana's own wallet does.
  - A payment above the vault limit is never protected.
- **Removal checks.** Each of five fixes taken out makes the story fail: no lock change read; voided acts left out of the selection; any reference compared; the point at the earliest receipt; the rotation's own anchor as the point. The receipt check does not apply: the story has no receipts.

### F172: absence returns to the authority's judgment

**Code:**
- `core/src/law/formats.rs`:
  - the clause has `proof: Option<(Hash, Value)>`, read from key 3;
  - terms carrying key 2 fail to decode;
  - the absence-proof cMIP is a judge: it may be named for no task, as no time reference or extension, and in no chain link (F178 item 14).
- `core/src/law/view.rs`:
  - the `anchors` field and the anchor checks are gone from the core path;
  - `absence_accepted: BTreeSet<(declaration, act)>` is the cMIP's answer for the record or clone using the declaration, stated by the caller, like `rail_valid`. A pair not listed does not count ("a declaration it refuses or cannot judge does not count").
- The old F136/F148/F158/F162 checks are kept as `core/src/law/view/reference_absence_proof.rs`. It is experimental and called by nothing in the core path.
- A hole was found and closed: a member's later signature on a version she had never signed made an earlier record fail retroactively. Now, at the collective's line, such a signature counts only where the collective placed it ("Made before, made after", 2). This is a reading (question 4).

**Clients:**
- `clients/collective`: the period and F158 warnings are removed. A plain-words warning before every signing of terms names the authority and the outcomes, and says whether an absence-proof cMIP stands between (rule 49, F178 item 11).
- `clients/repo`: the same notice before `found`, `change` and `words`.

**Tests**, each failing with its fix removed:
- `under_a_period_module_the_core_reads_no_anchor`;
- `abandonment_key_2_is_retired_and_key_3_names_a_cmip`;
- `the_absence_proof_cmip_is_a_judge`;
- `under_an_absence_proof_cmip_a_declaration_counts_only_where_accepted` (also failing with acceptance keyed by the declaration alone);
- `a_later_act_of_the_party_never_undoes_the_line`;
- the collective client's and the repo client's warnings.

`scenario_1_step_9_absence_is_the_authoritys_judgment` follows freeze step 9 as now written. It passes under the old code too, so it is a guard only.

### F171: the tally chain

**Code:**
- `core/src/law/formats.rs`: `Split.tally`, key 4, `[+ [stake, [+ [holder, count]]]]`, the count after this split. Marked in the code as **a proposed format, to confirm**.
- `core/src/law/view.rs`:
  - the split act cites its previous split for the stake;
  - its judgment carries `breaks` (a reset, a fork, a count that does not add up, a missing count) and `count_unknown`;
  - ties take turns from the previous split's carried count, checked from two acts;
  - F165's walk back through every earlier receipt is gone.
- `clients/collective`:
  - each split goes to every holder of its stake, paid or not;
  - the holder's client keeps the chain and shows "does not continue the chain it keeps… breaks the plan" for a reset, a fork or a wrong count.

**Tests**, each failing with its fix removed:
- `a_split_service_cannot_steer_ties_by_grinding_salts` (rewritten);
- `a_split_service_citing_no_previous_split_resets_the_count_a_deviation` (replaces F165's flaw test);
- `two_splits_citing_the_same_previous_fork_the_chain_a_deviation`;
- the invariants oracle, which now generates resets, forks and lying counts and computes them itself;
- the collective client's delivery and holder-check tests.

### F167, F174, F175, F178: the text floor

**Code:** `clients/longform/src/format.ts`.
- `FLOOR` has one entry per clause of Text draft 6, in the spec's order.
- `checkBound(doc, declared, endsBlock)` checks the floor first, whatever declaration it is handed. It then checks:
  - any run of hidden characters between two digits;
  - emphasis or code markup between two digits, which is refused;
  - a line break that ends a block, which may be hidden between digits only where the declaration lists it and a new block is really shown.

**The format's own declaration and the cMIP.**
- The format declares `ENDS_BLOCK = '\n'`.
- The link's closing `>` is shown next to a digit (F178 item 17).
- `cmips/cmip-long-form-draft-1.md` is revised to say both, and marked as awaiting approval by Nobody, allegedly.

**Tests.**
- Long-form passes 26 of 26. Tables cover amounts, negative and decimal forms, dates, percentages, scripts with vowel marks, letters, and `?` and `!`.
- 27 attacks on real documents.
- All 21 parts of the floor were removed in turn, and each removal fails at least one test.
- **Generated texts:** 804 of 20,000 are refused, against 10,936 before:
  - 650 for a link's `<` right after a digit;
  - 127 for a quote's `>` right before a digit;
  - 27 for emphasis or code between digits.

  Each refused text is shown plain.

## Run

- **Rust workspace** (`cargo test --workspace --locked --no-fail-fast`):
  - after merging main, before any change: 385 passed;
  - after everything: **403 passed, 0 failed**.
- **WebAssembly and TypeScript** (the WebAssembly rebuilt; Chromium for the site's browser test): **172 tests, 0 failed**: barebone 9, collective 21, connector 12, desk 10, genesis 17, longform 26, manage 7, reader 16, repo 13, site 27, jpeg 14.
- **Verifier2:** its own tests unchanged; rerun on this code (`c611b1f`) over the same 4,000 histories (seed 1, cases 0 to 2,999; seed 2, cases 0 to 999): **0 disagreements** (`docs/verifier2-report.md`, "Rerun after F169 to F181"). It covers collectives' endings only, so this checks that nothing there moved.
- **GitHub:** see "GitHub and the release" below.

## Only reasoned, not run

- **Anchors in the tests** come from a test anchoring cMIP: a key that signs `(act, point)`. No real chain is read. The core's interface takes any cMIP.
- **A homeless rotation's quorum is not read.** Its receipts come from the new homes under the new rule (F86). It is given no point, so as a lock change it counts as unanchored and the owner bears (question 2).
- **Receipts signed with a split service's grant key** are judged by the existing grant check ("whose grant still stands"). No rule 15 test covers that case.
- **No shipped client pays.** The payer's duties (read the clock, write the claim at payment, anchor it promptly) are carried out only by the test wallet in the stolen-phone story and the harness's regtest wallet, which reads Finance only and answers rule 15 as unknown.
- **F172:** the late-signature placement applies to collectives only. In a deal, every version normally carries every party's signature.
- **F171:** a split that pays two stakes and cites two previous splits, one per stake, is handled but not tested.

## Questions for Nobody, allegedly

**Finance rule 15**

1. **When the lock change is anchored only on the backup, "a claim anchored on the main reference also counts as made"** is built literally: a main-reference anchor at any point counts, since the two references cannot be compared. Is that the intent, or should a main-reference claim count only up to some point?
2. **A homeless rotation as a lock change:** its quorum is the new homes' receipts under the new rule. Should its point be read from those? As built, it has no point, and the owner bears.
3. **A payment a lock change affected that follows the chain again later** (a limit lowered, then raised again). As built, the first lock change still affects it, and it must be answered. Confirm.
4. **A vault payment whose rail answer names the declaring act but no entry** (`PaidAt::Vault`, used by older tests) is judged against the whole vault that act declared. The payment cMIP always names the entry (`PaidAt::VaultEntry`). Confirm, or drop the entry-less form.

**F171** (from its agent)

5. **The running count's key and shape** (split key 4, `[+ [stake, [+ [holder, count]]]]`, the count after this split, a holder not named counting zero) are proposed, not written in the spec. Confirm or give the format.
6. **"Receipt" in rule 15a** is read as the split act (F178 item 15). The Finance receipts no longer cite each other. Confirm.
7. **What "the latest" means for a verifier holding only some acts.**
   - The core sees a reset only as two held splits that both cite none, and a fork only as two held splits citing the same one.
   - The service signs both, so the core cannot tell which came first, and it shows the break on both splits. Only the holder's client, which knows the order they arrived in, names the second one.
   - Is that acceptable?
8. **After a deviation, the arriving split becomes "the latest" for the holder**, so later splits are checked against it. The other reading keeps the last split that continued the chain. Which is intended? Also:
   - splits made from a payer's claim are in the chain;
   - a new holder starts keeping the chain from its first split, with a warning.

   Confirm both.

**The text floor** (from its agent)

9. **A quote's `>` before a digit, and a link's `<` after one** (`>5 apples`, `>50%`, `5<https://x.org>`), are refused and shown plain. F178 decided only the link's closing `>`. Should these be shown, read as text, or stay refused?
10. **A block break inside a longer run between digits:** the exception is read for the whole run (heading, quote or fence markup in it included). Read literally, only the line break is excepted. Which reading?
11. **Emphasis between digits** (`1*2*3`) is refused, so the whole document is shown plain. Should the format read it as text instead?
12. **Readings to confirm** (`clients/longform/README.md`, items 12 to 18):
    - "digit" means category N;
    - "next to", "before" and "after" mean directly;
    - the sets of punctuation are taken by Unicode name;
    - a letter with its combining marks counts as a letter;
    - what an amount in brackets is;
    - whether U+060A joins the percent list.

    Still missed by a hostile format: "- 5" (minus, space, digit), a maths sign between spaced digits, other minus look-alikes (U+2012, U+2010, U+2011, U+2796), "(5 EUR)", and zero-width joiners.

**F172** (from its agent)

13. **Which signatures place a party at a line.** Placement is applied only to signatures on versions later than the one the declaration names; founding signatures count as before. Is that the intended reading?
14. **The chain of judgment for absence proof** (F178 item 14). A link names its judge as `[0, task]` for tasks 9 to 11, while the clause names the absence-proof cMIP in key 3. How does a link name it, and is it task 14? Not built.
15. **At a recovery rotation,** the cMIP's answer is keyed to the clone the rotation declares, not to the rotation itself. Confirm.
16. **An unknown absence-proof cMIP:** should a client refuse to sign terms naming one, as it does for an unknown extension? As built, it only names it as unknown.
17. **The reference absence-proof module** judges every act held, not only the using act's history (F178 item 12). Develop it into a real cMIP with its own specification, or drop it?

## GitHub and the release

*Written below once the runs are known.*
