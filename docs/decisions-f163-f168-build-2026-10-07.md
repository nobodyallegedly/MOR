# Building decisions F163 to F168

*7 October 2026. A building session, branch `build-f163-f168`, rebuilt from main `63cff75` after Fable's review of F163 to F168 (`docs/reviews/f163-f168-review.md`) reached main. It builds the decisions the review did not break. Nothing in `spec/`, the findings log or the paper was changed. **Nothing is merged into main and nothing is released**, as asked, until new decisions are recorded. The previous build's report is `docs/decisions-f157-f162-build-2026-10-06.md`.*

*How it was built: everything was first built here (F166 by one agent, merged here; F167 by a second agent, held on its own branch), from main `f13ea1e`. When the review arrived, the branch was rebuilt from the new main without F164, F166 and F168 item 11. Those three sit on a separate branch, as built, never merged. Both agents are the same model as this session.*

## In plain words first

- **On this branch, built and tested:** F163, F165, and F168 items 9, 10, 13, B4 and B5. Each new test was checked to fail when its fix is taken out.
- **Held on branch `held-f164-f166-f168-11`, not for main:** F164, F166 and F168 item 11, as decided this morning, with their tests. The review found breaks in all three. The code on this branch is still main's for them, F160's vault and F146's anchoring included.
- **F167 cannot be finished without a decision.** The floor forbids every mathematical sign. But `<` and `>` are mathematical signs, and the long-form format hides them for quotes and links. With the floor in place, every quote and link is shown plain and 7 of the long-form client's 17 tests fail. The review found the same thing (its finding 10). Making it pass would mean choosing which signs the floor means, a rule. The work waits on branch `f167-floor-open-question`.
- **F165 is built as written, and both this build and the review found the same gap.** A split service can restart the turn count by citing no earlier receipt, and then every tie goes to the same holder. A test pins it.
- **F163 is built as written, with the review's caveat.** During a theft window, the client cites the newest pointer it finds, which may be the thief's.

## What is on this branch, decision by decision

### F163: the payee's client cites its latest pointer (Finance rule 14)
- **The rule as built.** When the repo client signs terms or an offer (an act that can pay its signer), `sign()` fetches the signer's payee pointers from the relays it publishes on. Each one must be valid on the signer's own chain and name the signer as payee. It cites the latest in `refs` (rule 12: the unbroken chain, or the last pointer before a fork), whichever device published it. Signing anything else cites nothing. Verifiers are unchanged.
- **Code.**
  - `clients/repo/src/law.ts`: `latestPointer`, `sign`.
  - `wasm/src/lib.rs`: `lawPointerHolding`, so a client can ask the core what the payee's acts hold.
- **Tests.**
  - `a deal signed on the phone cites the wallet published from the laptop (F163)` (`clients/repo/test/repo.test.ts`). Two devices, two sequences of one identity. The laptop publishes Ana's pointers 1 and 2; the phone signs a deal.
    - Uncited, the signature holds no pointer.
    - Through `sign`, it holds both.
    - A signature on an act that pays nobody cites nothing.
    - Fails with the citation removed: the holding comes back empty.
  - `a_deal_signed_on_the_phone_finds_the_wallet_published_on_the_laptop` (`core/tests/finance_f145.rs`), over signed acts. A debt under the uncited deal counts only through the vault; under the cited one, it counts on the laptop's wallet. This pins what verifiers read. Since verifiers did not change, it has no fix of its own to remove.
- **"Where the pointers are published"** is read as the relays the client publishes on. Finance names no place (review finding 6).

### F165: leftover ties take turns (Law rule 15a)
- **The rule as built.** `divide_stake` takes `Ties`:
  - `Turns(counts)`: the fewest leftover units so far, then the smallest identity hash;
  - `Hash(act)`: a fork's sides, unchanged;
  - `Open`: a tie is reported, not settled.
- **The count.**
  - `LawView::turns` counts each holder's leftover units from the stake along the service's own receipts. It starts from the receipt the split names, takes the receipt that one cites (in `objects`, `acks` or `refs`) that one split of the same service divides on the same stake, then that one's, and so on.
  - The spec leaves the running count's field open (FORMAT OPEN). So no field was invented, and the count is walked back through every earlier receipt, not checked from two acts.
  - The count is unknown where an act cited is not held, where a receipt cites two earlier ones, or where one receipt has two splits.
- **The split check.**
  - `LawView::split` now holds every unit to rule 15a: each holder gets its share rounded down, plus its leftover unit where the rule gives one. Before, any holder could be one unit either way, so a tied unit could go to either holder.
  - A tie whose turns cannot be counted is shown in `turns_unknown`. Those holders are checked within one unit, and everyone else exactly.
  - A split made from a payer's claim leaves the tied unit to the payer (F168, 10).
  - The invariants oracle and two assertions of `every_payout_matches_its_stake` follow: a leftover unit sent to the wrong holder, each holder still within one unit of its exact share, is now a deviation.
- **Clients.** The collective client's split service divides by the core's turns (`lawSplitTurns`, `lawDivideStake` with `turns`) and cites its previous receipt. Its check shows a tie it cannot count.
- **Tests** (`core/tests/law_collective.rs`).
  - `a_split_service_cannot_steer_ties_by_grinding_salts`. A duo at 500,000 / 500,000 earns one-unit payments.
    - Twenty receipts of the first payment, each with its own salt, all send the unit to the smaller identity hash. Giving it to the other member is a deviation.
    - Receipts citing their previous one alternate the unit.
    - A receipt citing an act not held leaves the tie unknown.
    - Fails with the old one-unit tolerance.
  - `flaw_a_service_citing_no_previous_receipt_restarts_the_turns`. It passes today, showing the steer working, so that it fails once the rule closes the gap. This is the review's finding 7, first part.

### F168: items 9, 10, 13, B4 and B5
- **Item 9.** No code. Nothing in the code discharges a refund to a bare key through rule 14, so nothing could read it the wrong way. The review notes that rules 7 and 12a still speak of the creditor's pointer (its finding 13); that is text.
- **Item 10, the payer decides a tied unit.**
  - `payer_split` no longer takes a receipt.
  - This wallet gives a tied unit to the smaller identity hash: a choice, not a rule, as its doc comment says. `lawPayerSplit` follows.
  - Test: `payer_side_splitting_follows_the_claim`. Fails when ties are left open.
- **Item 13, an offer the payee did not sign.**
  - The payee's own act is then its signature accepting the offer (`payees_acts_on`).
  - Test: `a_payee_accepting_anothers_offer_is_paid_by_what_its_acceptance_holds`, a buyer's bounty. Fails without the acceptance.
  - Item 11's "any later act" is **not** here: only signature acts count, as on main.
- **B4.** A private link act signed by a scoped key is invalid. Test: `a_private_link_signed_by_a_scoped_key_is_invalid`. Fails when removed: the act showed "scoped".
- **B5.** The rotation is judged before the home check. Test: `a_private_link_a_rotation_voids_is_void_whether_or_not_fetched`. Fails with the old order: unknown.

## Held on branch `held-f164-f166-f168-11` (not for main)

Two commits on top of this branch, built and tested as the text stood this morning. On that branch: Rust workspace 389 passed, 0 failed; the collective client 21 of 21 (run by the F166 agent).

- **F164 and F168 item 11** (commit "Held: F164 and F168 item 11…").
  - **F164:**
    - F160 is undone: the vault applies as the chain declares it.
    - Good faith reads (a) the payee's receipt, then (b) the payer's word until the rotation is anchored, and after the anchor only a claim anchored before it.
    - The payment cMIP's `Held` trait trades `payers_claims` and `vault_at_binding` for `evidence` and `vaults_of`.
    - Tests: the stolen phone with the flow off (over signed acts, and on Lightning); once the rotation is anchored, only a claim anchored before it counts.
  - **Item 11:** any act of the payee's on the agreement counts.
  - The review's findings 1, 2 and 5 break these as decided.
- **F166** (the agent's commit).
  - The acknowledgement is gone, and a later anchored act of the party defeats the declaration.
  - A collective's line is placed by its own anchor, so what it put in force before the return stands.
  - F158's client warning is removed.
  - Tests: the kept-declaration story, a duo, a threshold, and what is never undone.
  - The review's finding 8 (what a defeat undoes; the declaration format's record sentence) breaks this. The agent also built readings the text does not give (questions 8 to 11 below).

## Held on branch `f167-floor-open-question`: F167

- **Built.**
  - `underFloor(s, i)` and `checkBound(doc, declared)`, which checks the floor first and can be handed a hostile declaration.
  - Five tests in `clients/longform/test/floor.test.ts`.
- **Choices.**
  - Percent and per-mille signs: the six characters Unicode names so (U+0025, U+066A, U+FE6A, U+FF05, U+2030, U+0609).
  - "Digit" means category N.
  - Plus and minus: exactly U+002B, U+002D and U+2212.
- **Checked against real text.**
  - **Protected as intended:**
    - amounts: "−2.50", "1,000.00", "1.000,00", "1 000" with any space, "1'000", "$5", "€5", "₿0.001";
    - dates and times: "2026-10-07", "07/10/2026", "07.10.2026", "10:30";
    - percentages: "50%", "5‰", "٥٠٪";
    - vowel marks: Hebrew niqqud, Arabic harakat, Devanagari, Thai, Latin with a combining acute.
  - **Misses** (a hostile format can still hide them):
    - ",5";
    - "- 5";
    - "-$5", and a trailing minus "5-";
    - "(5)" for a negative amount;
    - look-alike minus signs (U+2013, U+FF0D, U+FE63);
    - "‱";
    - a run of two hidden characters between digits ("1, 2" read as "12"), the most serious;
    - invisible joiners in Persian and Indic scripts (reasoned, not rendered).
    - The review adds "?" and the apostrophe (its finding 11).
  - **Markup wrongly forbidden:**
    - `>` for quotes, and `<` `>` around links (both Sm);
    - the line break ending a block between two digits ("1. Pay 5" then "2. Ship");
    - emphasis or a code span between digits.
- **Runs.** With the floor in place, longform passes 14 of 22, and 10,936 of its 20,000 generated texts are refused, 10,920 of them for `<` or `>`. With the floor removed, 21 of 22 pass: only the hostile-declaration test fails, as it should.

## Run

- **Rust workspace** (`cargo test --workspace --locked --no-fail-fast`):
  - main before any change: 379 passed;
  - this branch: 385 passed, 0 failed;
  - the held branch: 389 passed, 0 failed.
- **Removal checks.**
  - On this branch, each new test for F165, F168 items 10 and 13, B4 and B5 was run with its fix taken out and failed at the expected line.
  - F163's client test failed with the citation removed (run before the rebuild, on the same client code).
  - The held branch's checks were run before the rebuild: F164's and item 11's here, F166's by its agent.
- **WebAssembly and TypeScript** (Chromium for the site's browser test): the WebAssembly was rebuilt, and every package passed, 161 tests in all: barebone 9, collective 21, connector 12, desk 10, genesis 15, longform 17, manage 7, reader 16, repo 13, site 27, jpeg 14.
- **Verifier2.** Its own tests pass. Rerun on this branch's code, on the same 4,000 histories (seed 1, cases 0 to 2,999; seed 2, cases 0 to 999): **0 disagreements** (`docs/verifier2-report.md`, "Rerun after F163 to F168").
- **GitHub.**
  - Run 99 ran on the first build, which included the held parts. It is superseded.
  - This branch's run is reported to Nobody, allegedly with this session's end, not written here, since it comes after this commit.
  - The two display-client comparison steps fail by design on a branch until a release.

## Only reasoned, not run

- **Anchors and rails** are still facts the caller states.
- **F165's count from two acts.** The text describes a running count carried in each receipt. With that field open, the count is walked through every earlier receipt instead. That gives the same answer to a verifier holding them all, and unknown to one missing any.
- **F163 in other clients.** Only the repo client signs terms. The collective client signs through it. No client publishes offers yet.
- **Rule 15's selection** (the review's finding 12). The code selects the pointer for a payment under an agreement or offer and for an obligation the same way (`pointer_holding`), so the text's two lists do not diverge in the code.
- **Verifier2 does not cover** payments, splits, absence declarations or private links. Its agreement says nothing about F163 to F168; it checks only that nothing else in collectives' endings moved.

## Questions for Nobody, allegedly

**The review's findings** (`docs/reviews/f163-f168-review.md`, open in the findings log) stand as written. They are not repeated here, except where this build adds to them.

**F167** (the review's findings 10 and 11; blocking the merge of F167)

1. **`<` and `>` are maths signs.** Exempt them from the floor, protect Sm characters only next to a digit, or change the long-form format's quote and link markup?
2. **A line break that ends a block:** is it "hidden" when it falls between two digits?
3. **Emphasis or a code span between two digits** ("1*2*3"): should they be refused?
4. **A run of hidden characters between two digits** ("1, 2" shown as "12"): should "between two digits" cover it?
5. **More characters:** should the floor add the per-ten-thousand signs and the dash-like minus signs, as well as the review's "-$", ".5" and "?"?

**F165** (the review's finding 7)

6. **A receipt citing no previous one restarts the turns.** What does a verifier holding the earlier receipt do: show a deviation, or show the ties unknown?
7. **"Every unit is rule 15a's."** The split format still says "but for rounding of one smallest unit per payout". As built, under the default rule, every leftover unit must go where rule 15a sends it, which is what makes steering visible. Confirm.

**F166** (from the Law agent, on the held branch, beside the review's finding 8)

8. **Placing a line against the return.** A collective's line is placed by its own anchor, and a line with no anchor is defeated by any return. Is that right?
9. **Deals.** A clone completed while the declaration counted becomes a draft again once the return is shown, against "never undone". Should it be placed by keepers' records, or by anchors?
10. **The voice.** Does it come back after the return? As built, it does not, for lines drawn before it.
11. **Splits paid while a declaration counted:** what does a defeat mean for them?
12. **Rule 50 still defines "acknowledgement"**, which rule 51 no longer uses.

**F164** (on the held branch, beside the review's findings 1 to 4)

13. **Several rotations changing the vault.** As built, a payment falls under the latest rotation after which it never followed a vault again.
14. **"A grant key the payee's chain still holds"** is read as a grant that still backs the receipt.
