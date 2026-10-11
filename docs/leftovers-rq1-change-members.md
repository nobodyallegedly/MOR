# Two leftovers: RQ1 in the payment cMIP, and drafts named in "Change members"

*A building session for Nobody, allegedly: two small items left open by earlier builds (the findings log, round 2: "The evening's builds", RQ1 taken as option 1; "The layers-and-judges build"; `docs/layers-judges-build.md`, "Not done here"). Branch `claude/rq1-payment-cmip-change-members-i7wwxc`, rebased onto main at `0718a46`. Test identities only. One text revised in place, for Nobody, allegedly, to approve again: the payment cMIP draft 2.*

*No MIP changed, and the core library did not change: neither its code nor what its WebAssembly binding answers. No vector changed (see below).*

## In plain words

**1. A refund sent where the payer asked can now be checked.** When you pay, your claim may say "if I'm ever owed a refund, send it here" (a refund address, the claim's key 7). Money's rules, as you decided them (QG1 for an anonymous payer's one-time key, QG2 for an identity), say a refund counts only if it went there. Until now the payment cMIP, which checks every payment against the proof of the payment system that carried it, could only check payments sent to a wallet pointer or a vault: a refund sent to the address in a claim could not be checked at all, so the tests stated the answer by hand. Now the cMIP has a third way of saying where a payment went: "to the refund address this claim names". The checker reads the address out of the claim, exactly as it reads one out of a pointer, and the payment system's own proof is checked against it. A refund sent there for real, over Lightning in the tests, now shows repaid; one sent anywhere else, or whose invoice another node signed, does not.

**2. Removing a member in "Change members" names the drafts they leave behind.** When a member resigns by themselves, or steps down from the Releases area, the collective client already looked for the versions of the agreement they had signed that never came into force (drafts), showed them, and named them in the resignation, so none of them could pull the member back in later (F207). "Change members" also has a member resign first when they are removed and have not left yet, but that resignation named no drafts. It now does the same: the same search, the same lines in the review, and the drafts named in the resignation.

## What changed, precisely

### 1. RQ1, option 1: `paid-to = [2, claim]` (the payment cMIP draft 2, revised in place)

- **The format.** `paid-to` gains a third form, `[ 2, claim: hash ]`: "a claim of the payee's naming a refund rail (key 7): a refund owed on that claim's payment, paid there". The two earlier forms are unchanged, byte for byte.
- **Before paying** (item 1): the payee's side issues a receiving address for a `paid-to` that is its own pointer or vault, or a claim it signed naming a refund rail (for a refund owed to it).
- **Verifying** (step 3): for `[2, claim]`, the verifier holds that claim, valid, or the answer is unknown; it is signed by its payer as Money requires (with an anonymous payer's key signature, key 8, checked), its signer is the payee, and its refund rail names this rail Module and carries the amount's unit, or the answer is invalid. Then, as for every payment, the commitment is recomputed and the rail Module's rule is run on the address found.
- **What verification does not decide**: whether a payment to `[2, claim]` repays a refund owed (the claim being the payer's own on the payment refunded) is Agreements', from the same acts; the core reads it as paid at that claim.
- **The library** (`cmips/payment/src/lib.rs`): `PaidTo::Refund { claim }`, its encoding and decoding; `Held::claim` (a claim by id, with its signer and citations; by default not held, so the answer is unknown, and no existing verifier changes); the address read from the claim's key 7 with the checks above; `paid_at` gives the core `PaidAt::Flow(claim)`, the reading the core already used for QG1 and QG2 (Agreements' `repaid`), unchanged; `pointer_in_force` and `followed_vault` answer valid for it (see question Q1).
- **Freeze scenarios** (the cMIP's table): a row for 3.7w's QG1 and QG2, run offline.

**Vectors: none change.** No published vector encodes a payment commitment or a payment proof: `core/vectors` covers canonical text, CBOR, tagged hashes, the lock, opening an act, the running summary and a sequence of three acts, and the payment cMIP has no vector file. And the two existing forms of `paid-to` encode exactly as before, so every commitment made with them, and every invoice committing to one, keeps its hash: the Lightning and on-chain rule tests, which check real invoices signed over those hashes, pass unchanged.

### 2. F207 in "Change members" (`clients/collective`, `clients/repo`)

- `prepareChange` (`clients/collective/src/actions.ts`): for each member removed who has not left and is held here (who therefore resigns first), the drafts are found by `draftsLeft`, the search the resign and step-down flows use, excluding the agreement the resignation names (this device's agreement in force, as that flow's resignation names it) and the versions seen in force. The review gains a section "Drafts left behind", one set of `draftLines` per member resigning, the same lines the resign flow shows. The drafts enter the plan's digest, so the review signed is the one shown.
- `changeMembers` (`clients/repo/src/collective.ts`): takes `drafts`, by member id, and passes each member's to `resign`, which writes them in the resignation's field 2 (Agreements type 16).

## Readings taken under the delegation of mechanics, to confirm

1. **The payee of a refund paid to `[2, claim]` is the claim's signer**: the payer itself, or the one-time identity an anonymous payer signed with (F113). The refund is still owed to the key (Money rule 10a); a receipt or claim's payee field is an identity, and this mirrors how a pointer's payee is the pointer's signer. The core's existing QG1 test already paid the one-time identity.
2. **The cMIP does not check that the claim is on the payment refunded**: the core does, as it already did (only the payer's own claims on that payment count, QG2; a claim carrying the key's signature, QG1).

## Questions for Nobody, allegedly

**Q1. Does the vault's limit apply to a refund paid to a refund rail the payer's claim names?** *In plain words:* your vault says "anything above this amount must come to my safe, not my everyday wallet", so a thief who steals your everyday key cannot redirect a large payment. A refund address in a claim is chosen by whoever signed the claim with your key. As the core reads Money rule 14 (QG2: "to the refund rail the payer's own claim names, where it names one"), and as this build follows it, a refund there counts at any size: the vault's limit (rule 14a) is not applied. So a thief holding your key during a theft window could sign a claim naming their own refund address, and a large refund paid there would count as repaid. *Options:* (a) as built: the payer's claim chose the rail, as for the vault, a stated cost during a theft window; (b) a refund to a refund rail counts only up to the payer's vault limit for its unit, above it only to the vault; (c) leave it to a later draft. *Lean of the build:* none taken; it changes nothing built today and is Money's, not the cMIP's. Nothing was changed for it.

## Tests

**Before** (main at `7954ce0`): Rust workspace **597 passed, 0 failed, 1 ignored**.

**After** (rebased onto main at `0718a46`), `cargo test --workspace --locked` and then `scripts/test-all.sh`: Rust workspace **599 passed, 0 failed, 1 ignored**; TypeScript **220 passed, 0 failed** (barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, the JPEG Module 14, the video Module 6). The regtest tests (`MOR_BTCD`, `MOR_LN_REGTEST`) were not set, as on main: they stay ignored or skipped.

New (3):

- `modules/onchain/tests/agreement.rs`, `rq1_a_refund_to_the_refund_rail_the_payers_claim_names_is_checked_and_shown_repaid` (QG2): Ana's claim names a refund rail; a refund to her pointer repays nothing; one to `[2, claim]` whose invoice another node signed is invalid, one naming Ben as payee is invalid, one to a claim naming no refund rail is invalid, one to a claim not held is unknown; one to `[2, claim]` signed by her refund node is valid on the Lightning rule, read by the core as paid at her claim, and Money shows it repaid, 50 of 50.
- `modules/onchain/tests/agreement.rs`, `rq1_a_refund_to_a_bare_key_is_checked_where_its_claim_said` (QG1): an anonymous payment committing a bare key, its claim signed by a one-time identity with the key's signature and naming a refund rail; a refund to the wrong node is invalid; one to `[2, claim]` is valid and Money shows it repaid to the key.
- `clients/collective/test/f207.test.ts`, `F207 in Change members: a resignation signed there names the drafts its signer leaves behind`: Ada signs a draft; Change members removes her; the review names the draft as left behind; the resignation at the relay names it in field 2.

**Failing first:** the two Rust tests, run against the unchanged library, failed by not compiling (5 errors: no `PaidTo::Refund`, no `Held::claim`); then passed. The client test, run against the client as it was before this build (both changed files restored from main), failed on its assertion (the review named no drafts); then passed.

## Not done here

- The resignation signed in "Change members" still names this device's copy of the agreement in force, not the one Agreements find (the resign flow names the latter, F187 (4)); seen, not asked here.
- Question Q1 above.
- The findings log's entry for this build, and the roadmap row, are left to the project lead.
