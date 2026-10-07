# Building decision F182

*7 October 2026, afternoon. A building session, branch `claude/decision-f182-build-jkg992`, from main at `53cacd2` (F182 decided, the spec updated for it). It builds items 1, 2, 4, 8, 9 to 12, 14 and 16 of F182. Items 3, 5, 6, 7, 13, 15 and 17 confirm what was built and need no code. Nothing in `spec/` or the findings log was changed. The previous report is `docs/decisions-f169-f181-build-2026-10-07.md`.*

## In plain words first

- **Theft (Finance rule 15).**
  - When the owner's lock change is anchored only on the backup clock, a payer's claim anchored on the main clock counts, however late. The two clocks cannot be compared. This was already built this way; it now has its own test (item 1).
  - When the owner escapes to new homes (a "homeless" rotation), the moment the lock change counts is read from the new homes' receipts, under the new home rule. Before, such a rotation never got a moment, so the owner always bore the loss (item 2).
  - A payment to the vault must say which vault entry it was paid to. The vaguer form, used only by tests, is gone (item 4).
- **The tally chain (Law rule 15a).** After a holder's client sees a split that breaks the chain, it keeps checking later splits against the last good one. A bad split never becomes the new starting point (item 8).
- **The text floor (Text, the format task).**
  - The long-form format no longer refuses a document because one of its own signs would hide something the floor protects. It shows that sign as text instead (items 9 to 11). On 20,000 generated texts, none is refused now; 804 were.
  - Four more minus look-alikes are protected: U+2010, U+2011, U+2012 and U+2796 (item 12).
- **Absence proof (Law).**
  - Absence proof is task 14. A chain of judgment can name it as `[0, 14]`, meaning the cMIP the abandonment clause names (item 14).
  - The collective client implements no absence-proof cMIP, so it refuses to sign terms naming one (item 16).
- **Every test passes.** Rust 407, TypeScript 172.
- **Every new test fails when its fix is taken out.**
- Six readings are written down below as questions.

## What was built

### Item 1: a main-clock claim against a backup-only lock change

- **Code:** `finance::claim_in_time` already counted a main-reference anchor at any point. Only its comment changed.
- **Test:** `a_main_clock_claim_counts_when_the_lock_change_is_anchored_only_on_the_backup` (`core/tests/finance_rule_15.rs`).
  - A claim anchored on the backup after the point does not count.
  - The same claim anchored on the main clock at 1,000,000 does count.

### Item 2: a homeless rotation's point

- **Code:**
  - `chain::Quorum::Homeless` now carries `need` and `supports`, like `Homes`.
  - `Verifier::quorum` reads them from the state the rotation sets. That means the new homes, the new home rule, and the audit requirement it declares or inherits, which is what the homeless procedure's step 5 counts.
  - `finance::quorum_point` treats it like any home quorum.
  - The two use one helper, `Verifier::supports`.
- **Other places:**
  - WebAssembly `quorum` returns the homeless rotation's receipts.
  - The genesis client's `anchorQuorum` anchors them instead of skipping them.
  - No shipped client makes homeless rotations yet, so that client path is untested.
- **Test:** `a_homeless_rotations_point_is_read_from_the_new_homes_quorum`.
  - The story: a theft, then an escape to three new homes (two of three needed), with both keys.
  - The quorum is `Homeless { need: 2, … }`.
  - One anchored receipt gives no point. The second, at 120, is the point.
  - A claim anchored at 110 counts. With no anchored claim, the payment does not count.

### Item 4: the entry-less vault payment form is dropped

- **Code:**
  - `finance::PaidAt::Vault` is removed.
  - `LawView::follows_at` reads only `VaultEntry`.
  - The older tests that used the dropped form (`law_collective`, `law_invariants`, `finance_f145`) now name entry 0. They pass unchanged otherwise.
- **Test:** `a_vault_payment_names_its_entry`.
  - The story: a vault of two entries; a payment to entry 1; a rotation then replaces entry 0's source.
  - The payment is not affected, and it counts.
  - The test's `match` names every form of `PaidAt`, so it stops compiling if the dropped form returns.

### Item 8: after a deviation, the reference stays the last good split

- **Code:** `clients/collective`, `receiveSplit`.
  - The holder's kept chain is updated only by a split that continues it.
  - A deviating split is shown, and the message says the chain stays at the last split that continued it.
  - If the very first split delivered deviates, the client records that the chain is kept from its start with no good split yet (`tip: null`). The next split must then cite none.
- **Unchanged and confirmed:** splits made from a payer's claim are in the chain, and a new holder starts with a warning.
- **Test:** in `money and endings` (`test/collective.test.ts`).
  - Before: after a fork and a reset, the service's next split cited the reset and every holder accepted it.
  - Now: the core sees nothing wrong with that link. But all five holders' clients show it as a deviation: it does not cite the last good split, and their chain stays there.

### Items 9 to 11: the floor's forbidden markup shown as text

- **Code:** `clients/longform/src/format.ts`.
  - **A quote.** A `>` directly before a digit opens and continues no quote (`quoteOpens`). The line is read as other text, and the `>` is shown. `>5 apples` is a paragraph; `> 5 apples` is a quote.
  - **A link.** A link's `<` directly after a digit is shown (`linkOpenShown`), and the address is still the link. This matches the closing `>`, which F178 item 17 already shows next to a digit.
  - **Between two digits.** After a line's inline markup is read, the parser looks for hidden markup standing between two digits (`betweenDigits`). If it finds any, the first such sign becomes text and the line is read again, until none is left. `1*2*3`, `1`2`3`, `Pay 1**000**0` and `Code 5``6``` are shown exactly as typed.
  - **The check.** `checkBound` accepts a link whose `<` is shown because of the floor and whose `>` is hidden. Readings that hide any of these signs are still refused.
- **The cMIP.**
  - `cmips/cmip-long-form-draft-1.md` is revised in place: rule 5, rule 10, a new rule 11a, and the markup declaration.
  - The README's readings 12 to 18 are marked confirmed, and reading 18 rewritten.
  - **The cMIP revision awaits approval by Nobody, allegedly.**
- **Item 10:** confirmed as built. Only a comment changed.
- **Tests:**
  - `the long-form markup the floor forbids hiding is shown as text, not refused` (eight texts, plus readings that hide the signs and are refused);
  - `emphasis or code markup between two digits is shown as text, not refused`;
  - the generated-texts test now requires that none of 20,000 is refused.

### Item 12: the minus look-alikes

- **Code:** `SIGNS` gains U+2010, U+2011, U+2012 and U+2796.
- **Tests:**
  - six new cases in the floor table;
  - the four look-alikes leave the "not covered" list.
- **Still not covered, as decided:** "- 5", which is also list markup.

### Item 14: absence proof is task 14

- **Code:** `core/src/law/formats.rs`.
  - `LAST_TASK` is 14, as the Production task table now lists it.
  - `ABSENCE_PROOF_TASK = 14` joins `JUDICIAL_TASKS`.
  - `task_layer(14)` is Law.
  - A chain link `[0, 14]` follows the cMIP the clause names in key 3 (`Terms::task_judge`, used by both the check and `chain_of`). With no key 3, the chain names no judge and the terms are refused. The one who takes over is a judge too, so it may be named nowhere else.
  - Field 2 may not name task 14 (question 1).
- **Test:** `absence_proof_is_task_14_in_the_chain_of_judgment` (`core/tests/law_collective.rs`). It includes reading the terms back from their bytes.

### Item 16: no terms naming an unknown absence-proof cMIP

- **Code:** `clients/collective/src/explain.ts`.
  - The client implements no absence-proof cMIP.
  - `readAgreement` blocks signing terms whose clause names one, as it does for an unknown extension. The "If someone disappears" section says why.
  - Signing already refuses anything with a blocking line.
- **The repository client** writes its own terms and never names one (key 3 empty), so it has nothing to refuse.
- **Test:** in `Law rule 49` (`test/explain.test.ts`). Terms naming an unknown absence-proof cMIP are blocked once; terms naming none are not blocked.

**Each test, run with its fix taken out:**

| Item | Test | Fix taken out | Failed at |
| --- | --- | --- | --- |
| 1 | `a_main_clock_claim_counts_…_only_on_the_backup` | main anchor compared with the backup point | `finance_rule_15.rs:457` (also the older backup test, `:429`) |
| 2 | `a_homeless_rotations_point_is_read_from_the_new_homes_quorum` | homeless quorum unread (no point) | `finance_rule_15.rs:562` |
| 4 | `a_vault_payment_names_its_entry` | the entry-less form restored | does not compile; with the test written in the old form, `:707` |
| 8 | collective `money and endings` | the arriving split taken as the new reference | that test |
| 9, 10 | floor `…shown as text, not refused`; generated texts | a `>` before a digit opens a quote | both |
| 9 | same | a link's `<` after a digit hidden | both |
| 11 | floor emphasis test; `…shown as text`; generated texts | no reading again for markup between digits | all three |
| 12 | `the floor, character by character` | the four look-alikes taken out | that test |
| 14 | `absence_proof_is_task_14_in_the_chain_of_judgment` | task 14 not a judicial task | `law_collective.rs:2219` |
| 16 | `Law rule 49` (explain) | the refusal removed | that test |

## Run

- **Rust workspace** (`cargo test --workspace --locked --no-fail-fast`): **407 passed, 0 failed**. That is 403 before, plus four new tests.
- **WebAssembly and TypeScript** (the WebAssembly rebuilt; Chromium for the site's browser test): **172 tests, 0 failed**: barebone 9, collective 21, connector 12, desk 10, genesis 17, longform 26, manage 7, reader 16, repo 13, site 27, jpeg 14.
- **Verifier2:** see "Verifier2" below.
- **GitHub:** see "GitHub and the release" below.

## Only reasoned, not run

- **No shipped client makes a homeless rotation.** The genesis client's anchoring of a homeless rotation's quorum is a one-line change, not exercised by a test.
- **A homeless rotation to a self-hosted home** gives `Quorum::Own`: the rotation's own anchor is its point, as for any self-hosted identity (rule 22a). No test covers it.

## Questions for Nobody, allegedly

1. **Field 2 and task 14.** The clause's key 3 names the absence-proof cMIP, and rule 51 reads only key 3. Field 2 ("cMIPs, at most one per task") could now also name task 14, since the task table lists it. As built, field 2 naming task 14 is refused, so there is one place to name it. The alternative is to allow it, if it names the same cMIP as key 3, as field 6 and task 10 must agree (Q31). Which is intended?
2. **The CDDL comment in Law** (`judge = [ 0, task: uint ]`, line 151) still says "judicial task 9, 10 or 11". The rule text says task 14 is named "as any judge". The comment needs "or 14 (the abandonment clause's key 3)". The spec was not changed here.
3. **A quote's `>` before a digit.** As built, the line is not a quote and the `>` is text. The other reading keeps it a quote and shows the `>`. That cannot be done simply: what follows the `>` would be read as a quote again. Confirm.
4. **Markup between two digits made of several pieces** (`*a1*`2``). As built, the first piece on the line becomes text (here the emphasis's closing `*`, so its opening `*` becomes text too) and the code span stays. The cMIP's new rule 11a says so. Confirm the rule, or name another order.
5. **A holder whose very first split deviates.** As built, the client keeps "no good split yet": the next split must cite none, as a first split does. A split citing the deviating first one is then a deviation too. Confirm.
6. **The revised long-form cMIP** (rules 5, 10, 11a and the declaration) awaits approval, together with the earlier F178 revision.

## Verifier2

*To be filled in once the rerun finishes.*

## GitHub and the release

*To be filled in from the runs on GitHub.*
