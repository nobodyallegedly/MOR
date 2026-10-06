# Building decisions F157 to F162

*6 October 2026. A building session, branch `review-decisions-f145-f156`, after main's decisions F157 to F162 were merged into it. It builds those decisions in code, with tests, and changes nothing in `spec/`. The previous session's report is `docs/review-decisions-build-2026-10-06.md`.*

*How it was built: F157, F158, F160 and F162 in this session; F159 by one building agent in its own copy of the repository, merged here and tested together. A second agent, meant for Law, could not start from the right commit (its copy was made from main, and moving it was refused), so it changed nothing and its work was done here instead. Both agents are the same model as this session.*

## In plain words first

- **Every decision asked for is now in the code, with tests.** Each new test was checked to fail when its fix is taken out. One exception: F162 item 9 needed no new code, only documentation (below).
- **Three questions came up while building. Nobody, allegedly answered them during the session:**
  1. **Which vault counts (F160).** A vault is set only in a genesis or a rotation, and no citation reaches those, so read literally no act "holds" a vault. Answer: the vault the payee's chain had declared at the binding of the payee's own act for the payment.
  2. **Rotations and the Identity area (F162 item 13).** Answer: Law shows whether a rotation has that area's consent, and nothing more for now.
  3. **What names a side at a fork (F162 item 10).** Answer: its successor.
- **One of my own proposals turned out to be a flaw, and is left open.** Ordering the tied units of members counted alike by the fork act's hash is circular, because a leaving member's share must already be written in the successors' founding terms, which come before the fork act. Nobody, allegedly chose to leave it open. Sides follow F150; members counted alike keep the old rule, "leftovers to the first".
- **A test that failed about one run in three was fixed:** the air-gapped signer's command-line test. Its cause was in the test, not the signer (below).
- **Verifier2 and GitHub:** see "Run".

## What was built, decision by decision

### F157: the payee's pointer, through the payee's own acts only (Finance rule 14)
- **The rule as built.** To select the payee's pointer, the walk follows citations only through acts the payee signed. An act another identity signed is neither held nor followed. An act the verifier does not hold may be the payee's, so meeting one makes the walk incomplete, and the answer unknown.
- **Code.**
  - `core/src/finance.rs`: `holds_own`.
  - `core/src/law/view.rs`: `pointer_holding` uses it.
- **Test.**
  - The test that pinned flaw 1, `flaw_the_payees_signature_holds_what_the_drafters_terms_cite`, is now `the_payees_pointer_is_found_through_its_own_acts_only` (`core/tests/finance_f145.rs`).
  - It covers the owner signing terms the debtor drafted to cite the thief's pointer: the thief collects nothing, and the owner's own latest pointer counts.
  - It also covers the owner acknowledging an IOU whose debtor's history cites the thief's pointer: that pointer is not reached.
  - Fails when `pointer_holding` uses `holds` again.

### F160: the vault, selected like the pointer (Finance rules 12a and 14a)
- **The rule as built** (Nobody, allegedly's answer to question 1 above). The vault and limits that apply are those the payee's chain declared at the binding of the payee's own act for the payment.
  - For a debt, an agreement or an offer, those acts are the ones `pointer_holding` finds. Where there are several, the latest binding counts, as the latest pointer does.
  - For a tip, the act is the payee pointer it follows.
  - A limit lowered afterwards does not reach back.
- **Code.**
  - `core/src/finance.rs`: `Holding` gains `vault`.
  - `core/src/law/view.rs`:
    - `pointer_holding` fills it, through the new `vault_at`.
    - Law's debt discharge (`paid_where_it_counts`) reads it instead of the vault declared now.
  - `cmips/payment/src/lib.rs`:
    - `followed_vault` reads the vault the payee's act showed.
    - The `Held` trait trades `vault_in_force` for `vault_at_binding`.
    - A payment whose payee's own act this verifier cannot read is unknown here, as it already was for the pointer.
  - The three `Held` implementations in tests follow: `modules/lightning/tests/flow_theft.rs`, `rule.rs` and `harness/tests/lightning_rail.rs`.
- **Tests.**
  - `a_limit_lowered_after_the_payment_does_not_reach_back` (`core/tests/finance_f145.rs`), over signed acts, the previous report's smallest story:
    1. The owner's limit is 1,000, and it signs a deal.
    2. 900 is paid to the flow.
    3. The owner rotates to a limit of 500.
    4. The 900 still counts.
    5. A deal signed after the rotation shows 500: 900 to the flow does not count there, while to the vault it does.
    - Fails when the discharge reads the vault declared now.
  - `a_flow_payment_is_judged_by_the_vault_the_payees_act_showed` (`modules/lightning/tests/flow_theft.rs`): the same story through the payment cMIP, on Lightning. Fails when the test double reports the vault declared now.

### F158: who may acknowledge a declaration (Law rules 50 and 51)
- **The rule as built.** Under a period clause, the acknowledgement must come from a party or a keeper's operator who is neither of these:
  - the declaration's signer, together with, for a threshold authority, the other parties whose signature acts name the declaration;
  - the declared party.
- **Code.** `core/src/law/view.rs`, `absence_by_anchors`.
- **Tests.**
  - `scenario_1_absence_is_judged_by_anchors` (`core/tests/law_collective.rs`) now expects the opposite of before. In freeze scenario 1's shape, the keeper's operator, who is the authority, acknowledges its own declaration: it does not count. Another party's acknowledgement does. Fails when the signer is no longer excluded.
  - `a_threshold_declarations_signers_do_not_acknowledge_it` (new): Ben declares Ana absent and Cy co-signs. Cy's acknowledgement is none; the keeper's counts. Fails when co-signers are no longer excluded.
- **The client warning at signing.**
  - `clients/collective/src/explain.ts`: `unacknowledged`, and a line in the reading shown before signing (`readAgreement`).
  - It warns where a period clause leaves nobody to acknowledge: "Add a keeper or a third party for the clause to work; signing as it is accepts that it cannot (… F158, a stated cost)".
  - A threshold is counted at its number of signers.
  - Test: `F158: a period clause nobody else can acknowledge is warned of at signing` (`clients/collective/test/explain.test.ts`). Fails when the warning is removed.

### F159: what a verifier found at the homes (Identity, "The envelope", rule 13, after rule 17)
Built by the Identity agent and merged (`12abd14`).
- **Input.** The input is now per home: `Verifier::found_at_home(act, home operator)`. For a self-hosted home, the operator is the signer. It replaces `published_at_home(act)`. In WebAssembly, `foundAtHome`.
- **Which homes count.** A private link counts only if found at a home named in its signer's chain at the link act's binding. A later move of homes does not void it.
- **Not found there.** It is unknown, never invalid (it was invalid before).
- **The fetch is an input like the verifier's own attempts.** `has_own_attempts` and `without_own_attempts` include it, so `binding_status` of a found private link is unknown.
- **`link()` answers unknown, not "not linked",** where the claim is unknown, where only an unknown confirmation exists, or where an unknown termination is (or may be) held.
- **Callers.** The genesis client's `lookUp` names the home it fetched from. Relay comments now cite rule 13's MUST; no behaviour changed.
- **Tests** in `core/tests/private_links.rs`:
  - Three new tests:
    - a link counts at the homes named at its binding and survives a move;
    - a link nobody fetched is unknown, never invalid;
    - a found link binds nothing on the fetch alone.
  - The thief-and-bank story is rewritten.
  - Each test fails under one or more removals of the fix, as the agent checked one by one.
  - The genesis client's test now expects a private link shown to one party to be unknown.

### F162: the smaller questions
- **Item 3, bounds inclusive.** Already built so; now pinned in scenario 1's test. An act of the party anchored at the declaration's own point protects them. Fails when the bound is made exclusive.
- **Item 5, presence** (`absence_by_anchors`). It now counts:
  - acts naming a later version of the agreement, by clones, besides earlier ones;
  - in a collective, the member's acts on the collective's chain (`objects` naming the collective).

  Tests: in scenario 1, an act on a clone made after the deal; in the threshold test above, Ana's act on the label's chain. Each fails when its part is removed.
- **Items 8 and 9.** No code change. Payer-side splitting already shows that a tied unit is decided by the receipt's hash. A split from a payer's claim with no receipt passes the claim's hash to the same function. The doc comments of `payer_split` and of the wasm `lawPayerSplit` now say so.
- **Item 10, a fork's division.**
  - Among sides: largest remainder, ties ordered by `tagged_hash("MOR/law/leftover", [fork act, successor])`. This covers the fork's shares and `fork_transfer` (`divide_fork`).
  - Freeze scenario 9 now gives **333,333 / 666,667** (`a_collective_forks`). It fails with the old division.
  - Members counted alike keep "leftovers to the first" (see the flaw below).
- **Item 11.**
  - The split check now shows a payout not matching its stake when it is over or short by a whole unit or more. Before, it could be over by as many units as the stake has holders.
  - Test in `every_payout_matches_its_stake`: of 803, Ana's exact share is 321.2. Paid 323, she is 1.8 over while nobody else is short by one. The old check let it through; the test fails with it.
  - The invariants oracle in `core/tests/law_invariants.rs` states the same one unit.
  - Freeze 7t's test comments already followed F150.
- **Item 13, an area over the Identity layer.**
  - `LawView::rotation_consent` counts the areas reaching a rotation or chain signature under the agreement in force just before it, as an action's areas are counted. The count is now shared: `count_areas`.
  - It only shows; nothing else reads it (Nobody, allegedly's answer to question 2 above).
  - Test: `an_identity_area_shows_its_consent_on_a_rotation`.
    - Not met with no signatures, nor with one of two.
    - Met with both.
    - The rotation counts under Identity throughout.
    - A witness act of the collective still answers `Consent::Identity`.
    - Fails when every area is counted instead of those reaching the rotation.

### Beside the decisions: the air-gapped signer's test
`modules/airgap/tests/cli.rs` wrote each case's input after starting the signer. Where the signer refuses before reading (a file it will not sign), it can exit first, and the write then failed with a broken pipe. It happened twice in this session's first runs, about one run in three when repeated. The test checks the signer's answer through its status and output, so a closed input pipe is now accepted. It then passed six runs in a row.

## Run

- **Rust workspace** (`cargo test --workspace --locked --no-fail-fast`).
  - Before any change, after merging main: 372 passed, 0 failed.
  - At the last code commit (`b414210`): 379 passed, 0 failed.
  - The first full run in between gave 373 passed and 1 failed: the air-gapped signer's test, fixed above.
- **Removal checks.** Each new or changed test was run once with its fix taken out, and failed at the expected line (listed with each decision above).
  - F159's were run by its agent.
  - Item 9's was not: it changed no code.
- **WebAssembly and TypeScript.** The WebAssembly was rebuilt, and every package passed, 160 tests in all: barebone 9, collective 21, connector 12, desk 10, genesis 15, longform 17, manage 7, reader 16, repo 12, site 27, jpeg 14.
  - The F159 agent ran genesis (15) and desk (10) in its own copy.
- **Verifier2.** Rerun on the same 4,000 histories (seed 1, cases 0 to 2,999; seed 2, cases 0 to 999): **0 disagreements** (`docs/verifier2-report.md`, "Rerun after F157 to F162").
- **GitHub, on the branch** (run 84, at `f7c2ec8`, started by hand).
  - Every test step passed: the Rust workspace, the WebAssembly, the ten clients and the JPEG Module.
  - The two steps that compare the code with the published display client in `clients/site/built/` failed, as by design until the display client is released (as in run 76).
- **The release.** RELEASE-RESULTS

## Only reasoned, not run

- **Anchors and rails** are still facts the caller states (as before): the F158 and F162 item 5 tests state anchors.
- **The client warning** (F158) is computed in the client from the decoded terms. It is not a core library function: it counts a threshold authority at its number of signers, and a named authority alone.
- **The vault for a tip** (F160) is read at the binding of the pointer it follows, the payee's own act for it. No test follows a tip through a vault rotation in signed acts; the Lightning test covers it through the payment cMIP's test double only.
- **verifier2 does not cover** the fork's division, splits, absence declarations, payments or private links: it takes stakes and successors' terms as given. So its agreement says nothing about F157 to F160 or F162 items 3 to 11. It checks only that nothing else in collectives' endings moved.

## Questions for Nobody, allegedly

**From this session**

1. **The fork's members counted alike** (F162 item 10, left open by your choice):
   - What orders a leaving member's tied unit? The share must be in the successors' founding terms before the fork exists, so the fork act's hash cannot.
   - Built: "leftovers to the first", the old rule.
   - Candidates: the agreement in force with each member, or the first as listed.
2. **What follows from a rotation lacking its Identity area's consent** (F162 item 13)? For example, does its Law declaration (a clone, placed signatures) not count? Built: shown only.

**From the F159 agent, where the text is silent**

3. **What makes a found private link stop "resting on the fetch alone"?** F153 names a closure, absence statements, an escape endorsement and an objection for failed attempts; F159 names nothing for fetches.
   - As built, a found private link's binding answer is always unknown, so no private link can decide anything binding.
   - Nothing binding reads a link today, so this changes no answer now.
   - Should something count, such as a home's receipt or inclusion proof, or a second party finding it?
4. **A private link whose binding is a higher MIP's act** (a scoped key) shows as "scoped", with no home requirement. Identity rule 1a says a scoped key never signs an Identity act, but the code does not refuse one. Should it be invalid?
5. **Order of checks.** A private link voided by a later rotation and never fetched now shows unknown, because the home check runs before the rotation's judgement. Should "void" win?

## What changed beside the code

- Nothing in `spec/`, the findings log or the paper.
- The display client in `clients/site/built/` is released from main by the release workflow (see "Run").
