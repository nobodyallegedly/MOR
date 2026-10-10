# The rename pass (10 October 2026)

*One roadmap step, wording only: no rule changed, nothing on the wire changed. Part 1 renames the layers (F212). Part 2 renames the two keys ("The two keys renamed", 5 October 2026). Part 3 is a reading of Money's text against F225's principle; its suggestions are not applied and come back as questions. Records keep their wording: findings, reviews, build reports, older drafts and machine reports were not touched, except for one mapping note added at the head of `docs/findings/MOR-findings-log-round-2.md`. Commits: part 1 `03fecff`, part 2 `fa6a2c9`, this report after them.*

**In plain words.** The names people read changed; the numbers machines read did not. Every act carries its layer as a number (Money is 2, Agreements 3, Development 4) and every specification as a hash. Those numbers, those hashes, the tags mixed into hashes and every published test vector are byte for byte what they were. What changed is the text of the current drafts, the documents that explain them, and the names inside the code. A few names were left alone on purpose, because changing them would have changed something stored or computed, or because the change was a judgment rather than a substitution. They are listed in section 3, each with its reason.

## 1. Part 1: the layers

Envelope → **Envelopes**, Finance → **Money**, Law → **Agreements**, Production → **Development**. Identity and Text stay.

**Grammar.** "Agreements" and "Envelopes" are treated as plural, as in F225 ("Money says…; Agreements say…"). So "Law counts" became "Agreements count", "Law's" became "Agreements'", and "a Law act" became "an Agreements act". Where a client or a wallet is the subject, the verb stayed singular: "a wallet reading Agreements pays".

**Documents renamed:**
- `spec/`: the core document v21, the freeze test suite v21 and the six MIPs. Four files moved, keeping their draft numbers: `MIP-envelopes-draft-7.md`, `MIP-money-draft-6.md`, `MIP-agreements-draft-10.md` and `MIP-development-draft-6.md`. Each old file name now holds a one-line pointer, so the links in records still lead to the right draft. The specs' notation for spec hashes follows the rename (`[AGREEMENTS, 0, agreement]`, `vault = [ MONEY, 0, … ]`).
- The latest draft of each cMIP and Module: anchoring 3, long-form 1, payment 2, relay transport 3, release manifest 2, website 3; the air-gapped signer 4, Bitcoin clock 2, JPEG 1, Lightning rail 2, on-chain rail 2, the two seed Modules 1, Bitcoin units 1.
- The latest draft of each case study (04 v4, 08 v3, 09 v4, 10 v4, 11 v2, 12 v4, 13 v3, 14 v4, 15 v3, 16 v2, 17 v4, 18 v3, 19 v3, 20 v5, 21 v2) and each companion (05 v6, legible greed v3).
- `docs/dubsar.org`: the Build door's list of MIPs, and the department doors that name a MIP.
- `docs/build-brief-v1.md`, every README (the root, `spec/`, `docs/`, `clients/*`, `core/`, `core/vectors/`, `cmips/`, `modules/*`, `relay/`, `harness/*`, `wasm/`, `verifier2/`) and `clients/connector/DRAFTS.md`. CLAUDE.md names no layer, so it needed no change.

**Code renamed:**
- The core library's modules `law`, `finance` and `envelope` became `agreements`, `money` and `envelopes`, and their files moved with them (`core/src/agreements/`, `core/src/money.rs`, `core/src/envelopes.rs`, `core/src/envelopes/anchoring.rs`). So did the tests (`core/tests/agreements*.rs`, `money*.rs`, `envelopes.rs`, `modules/onchain/tests/money.rs`), `clients/repo/src/agreements.ts`, and verifier2's `agreements_endings.py` and its test.
- Identifiers were renamed segment by segment: `LawError` → `AgreementsError`, `LawView` → `AgreementsView`, `law_act` → `agreements_act`, `FINANCE_TYPES` → `MONEY_TYPES`, `ENVELOPE_TYPES` → `ENVELOPES_TYPES`, `SPECS.law` → `SPECS.agreements`, `mips.envelope` → `mips.envelopes`, and so on. "Flaw" and "Coproduction" were not touched.
- Constants keep their numbers: `layers::IDENTITY = 0`, `ENVELOPES_AND_TEXT = 1`, `MONEY = 2`, `AGREEMENTS = 3`, `DEVELOPMENT = 4`.
- The WebAssembly binding's exports: all 46 `law…` exports became `agreements…` (`agreementsOf`, `agreementsClonePlan`, `agreementsRollbackPlan`, `agreementsSplit`, `agreementsPurchase`, …). Every client using them changed with them.
- User-facing strings: error messages ("not in the Agreements format", "(Money rule 14a)"), the pages' and command lines' words, the Cargo package descriptions.
- In the tests, the area names written into test agreements ("Finance" → "Money", "Law" → "Agreements") follow the new names. They are test data, not vectors.

**Found while building, and fixed:**
- The collective page already had a property `agreements` (the number of versions) beside `law` (Law's reading of the collective). A plain rename would have produced two properties with one name. The type checker caught it, and `law` was kept for that one property (section 3).
- A test's list of department doors named the dubsar.org Law door, which is about the discipline of law, not the layer. Its name was restored.

## 2. Part 2: the keys

The safety key → **the chain key**; the everyday key → **the signing key**. With the same rules as Part 1: the same documents, the same code, records untouched.

**Wording.** "Safety key(s)" became "chain key(s)" (also "Chain key" and "CHAIN KEY"). "Everyday key", "everyday signing key" and "everyday MOR key" all became "signing key" ("an everyday key" became "a signing key"). Words built on the old key name became "chain-key" ones: a chain-key commitment, seed, scheme or signer, and the CDDL name `chain-key-commit`. "Everyday scheme" and "everyday signatures" became "signing-key scheme" and "signing-key signatures". Ordinary English stayed: safety teams, safety testers, physical safety, a safety network of operators, everyday life, an everyday phone, everyday deal making.

**Files moved** (old names left as one-line pointers): `modules/module-airgap-chain-key-signer-draft-4.md`, `modules/module-chain-key-seed-words-draft-1.md`, `modules/module-chain-key-seed-hex-draft-1.md`.

**Code renamed:**
- `SafetyCommit` → `ChainKeyCommit`; `safety_commit`, `next_safety_scheme`, `safety_seeds` → `chain_key_commit`, `next_chain_key_scheme`, `chain_key_seeds`; `holds_safety_key` → `holds_chain_key`; `from_everyday_key` → `from_signing_key`. The core already called the everyday key `signing_key`, so that name fits.
- The binding's exports: `newTestSafetyKey`, `safetyFromSeeds`, `dealSafety` and `rebuildSafety` became `newTestChainKey`, `chainKeyFromSeeds`, `dealChainKey` and `rebuildChainKey`, and the clients follow. The objects passed across the binding changed too (`chainKeyScheme`, `nextChainKeyCommit`, `grammar.chainKey`).
- The relay sends a JSON key to its management page: `holdsSafetyKey` became `holdsChainKey` on both sides. The page's built script (`relay/manage/manage.js`) was rebuilt from `clients/manage` and is identical to the edited one.
- Test names follow: `a_rotation_to_a_signing_key_of_an_unknown_scheme`, `the_chain_key_signs_only_rotations`, ….

## 3. What was left, and why

**Kept because they are on the wire, or are hashed:**
- Hash tags: `"MOR/safety"` (the chain-key commitment), `"MOR/finance/anonymous-claim"`, `"MOR/law/leftover"`. Changing a tag changes every hash made with it.
- The stand-in spec hashes the code and tests use until freeze: `sha256("FINANCE, test value until the freeze")` and its siblings for `LAW`, `ENVELOPE` and `PRODUCTION`, and the vector generator's `"stand-in for the TEXT spec hash"`. These strings are hashed into spec hashes that acts carry. Only the name of the field holding them changed (`finance:` → `money:`).
- The test vector generators' descriptions (`core/examples/gen_vectors.rs`, `modules/airgap/examples/seed_vectors.rs`). They are written into the published vector files, which must stay byte for byte (section 4). Their comments were renamed.

**Kept because files already on disk carry them** (renaming them would make existing test identities and collectives unreadable, so it is not mechanical):
- The identity file's field `safety` (and the pending rotation's `safety`), and the collective file's `safety` (its dealt chain key), `pending.safety` and `governance.safetyThreshold`. The code around them uses the new names; only these keys stay. The collective page's rule `safety`, which follows the form's field name `'safety'`, stays with them.
- The file labels that are checked when a file is read: `"MOR TEST IDENTITY. The safety key is held in software…"` (genesis, repo and relay) and `"MOR TEST COLLECTIVE. Its everyday key…"`. A changed label refuses every existing file.

**Kept because they are values another program reads, not names:**
- The core's error codes as the binding passes them to clients (`law/shape`, `law/check: …`), and the clients' parsers and tests that read them.
- The relay management API's value `'envelope'` for an Envelopes act (`relay/src/manage.rs`, `clients/manage/src/view.ts`).
- The environment variables `LAW_INVARIANT_SEED` and `LAW_INVARIANT_CASES` (the invariant tests' reproduction instructions name them). The test binary's name did change: `--test agreements_invariants`, and verifier2's `shrink.py` follows.
- verifier2's exported area value `"finance"` (`verifier2/export/export.rs`), which its Python reads.

**Kept because renaming is not a substitution:**
- `law` on the collective page (`clients/collective/src/page/api.ts`, `Shown.law`, read by the page and the tests): Agreements' reading of the collective. The object already has `agreements`, the number of versions. A new name needs choosing (for example `reading`), so it is a question.
- "Everyday act", "everyday acts", "everyday check", "everyday line", "everyday Identity acts" and the code built on them (`everyday_act`, `makeEveryday`, `check_everyday_shape`). These are Identity's terms for the acts the signing key signs ("Signing key. The key that signs everyday acts"), not a name for the key. **Question:** do they keep "everyday", or become, say, "signed acts"?
- "Everyday pointer" (the flow pointer, in case study 18 and the who-can-earn companion): it names the pointer, not the key.
- Ordinary-English uses of the old layer words: "Law comes first", "Law varies by country", "Law is moving fast" in the case studies' limits; the dubsar.org Law door (`docs/dubsar.org/law/`, the discipline); "Coproduction".
- Quotations: the author's words keep their wording ("…the use of the safety key makes sense here" in the Identity MIP), as does the anchoring cMIP's quotation of the project lead's earlier reading ("not a Law offer").

**Not in this pass's list, so left as written** (each names the old layers or keys; whether to bring them along is a question):
- `docs/07-MOR-in-one-page-v10.md`, the author's redraft. "The two keys renamed" names "one page" among its targets, but this pass's list does not, and it is the author's own text.
- `docs/roadmap-v1.md`, `docs/paper/mor-paper-draft-2.md`, `docs/run-guide-draft-1.md`, `docs/project-lead-prompt-v2.md`.
- `clients/site/built/`, the released display client, which is rebuilt and released afterwards, not by this pass. Until then it carries the old binding names together with its own old WebAssembly, so it stays consistent.
- The project's instructions on claude.ai, which only Nobody, allegedly, can change (F212).

**Records whose links now point at moved files:** records name code by its old path (`core/src/law/view.rs`, `core/tests/law_collective.rs`, `verifier2/law_endings.py`). Those paths are gone; the mapping note gives the new ones. The MIP and Module documents moved with pointers, so links to them still work.

## 4. The wire proof

1. **The vectors were regenerated and are unchanged.** After each part, every vector set was rebuilt from the renamed code: `cargo run -p mor-core --example gen_vectors` (seven files in `core/vectors/`), `cargo run -p mor-airgap --example seed_vectors` (compared byte for byte with `modules/airgap/vectors/seeds.json`), and `npm run vectors` in `clients/longform` and `modules/jpeg`. `git diff 17726e9 -- core/vectors modules/airgap/vectors clients/longform/vectors modules/jpeg/vectors` shows only `core/vectors/README.md`, whose prose was renamed; no vector file changed.
2. **The vectors are checked as published:** `core/tests/vectors.rs`, the air-gapped Module's functional tests and the long-form and JPEG tests all pass. The independent checkers agree: `modules/airgap/vectors/check.py` ("24 keys checked") and `modules/jpeg/vectors/check.py` ("9 of 9 vectors agree"). `core/vectors/check.py` could not run in this container, because its `unicodedata2` package is not installed. That is not a failure of the vectors.
3. **The same tests as before pass.** Rust: 577 tests before (on `17726e9`) and 577 after. verifier2: 23 before and 23 after, its stories unchanged. Every TypeScript package passes, and each type-checks with `tsc --noEmit`. `scripts/test-all.sh` passes on the final commit ("All tests passed": 577 Rust tests, 204 TypeScript tests), and on the part 1 commit by itself.
4. **Why that settles it:** the layer numbers are constants whose values did not change; spec hashes are computed from the same stand-in strings; and every hash tag is the same string. So an act built by the renamed code is the same bytes as one built before.

## 5. Part 3: Money's text read against F225 (a reading only; nothing applied)

*F225's principle, as Nobody, allegedly, stated it:* "Money says how money moves, that it moved, or asks that it move; Agreements say what must follow." Below is each sentence where Money's text decides a consequence rather than carrying the payment. Each comes with a suggested wording that moves the obligation to Agreements and leaves its payment in Money. In several places Agreements already says the same thing, so Money's sentence is a second statement of an Agreements rule. In one place (rule 14's over-sale) Agreements even cites Money as the ground of its own obligation.

**M1. Rule 7, "past its terms"** (`spec/MIP-money-draft-6.md`, rule 7).
*Now:* "**Past its terms ends the obligation** (F219, …): a refund past the terms the buyer accepted by paying is closed there, the owners keep the money, and it blocks no closing (Agreements rule 32)."
*Why it decides a consequence:* it says when a refund obligation ends, who keeps the money and what it does to a collective's closing. Each of those is a term of the agreement the buyer accepted. Agreements rule 32 already says all three (F219).
*Suggested:* keep "past its terms" in the list of states and drop the sentence. In its place: "*Past its terms*: Agreements decide when an obligation's terms have passed and what follows (Agreements rule 32, F219); Money only shows the state." *Also noted, wording:* the sentence that follows ("The last three depend on Agreements") now reads after the F219 sentence, so "the last three" is hard to place. Without the F219 sentence it again points at past its terms, closed by clone and redirected.

**M2. Rule 10c, a payment that is no purchase.**
*Now:* "A payment for a work under an Agreements claim … is a purchase only when its receipt and claim name, in field 9, the claim it pays under … A payment for such a work naming no claim, or a claim that is not the work's current one …, is no purchase: money received for nothing, owed back to the payer as a refund, by rule 10a."
*Why:* whether a payment is a purchase, and that something is owed back when it is not, are Agreements' (rule 32a already says "is no purchase: money received for nothing, owed back to the payer as a refund"). The field 9 that names the claim is Money's format, and the refund's payment is Money's.
*Suggested:* "A receipt or claim of a payment for a work under an Agreements claim names, in field 9, the claim it pays under … (the format, and the payment commitment carrying it on the rail, stay here). Whether the payment is a purchase, and what is owed when it is not, Agreements say (rule 32a); a refund they owe is paid as rule 10a says."

**M3. Rule 10c, a push rail.**
*Now:* "**the payment is a purchase only if every holder's receipt is a sale; otherwise every holder refunds what it received, by rule 10a**".
*Why:* who must refund, and when, is a consequence. Agreements rule 32a already says "otherwise every holder refunds what it received".
*Suggested:* "…each holder of the work's stake settles on its own chain whether its receipt is a sale (Agreements rule 32a, which says what each holder owes otherwise); a refund owed is paid by rule 10a."

**M4. Rule 10c, a collective seller.**
*Now:* "a payment the original's chain never recorded before the fork that superseded its claim is no purchase, owed back to the payer by rule 10a."
*Why:* the same pattern. It decides the obligation, which follows from Agreements' fork and claim rules (F127).
*Suggested:* "Where the seller is a collective, Agreements say when a payment becomes a sale (F127, W2: once the collective's actions chain records it) and what is owed when it does not; a refund owed is paid by rule 10a."

**M5. Rule 10c, the stated cost for a Money-only wallet.**
*Now:* "*Cost, stated: a Money-only wallet can pay a claimed work's publication, but cannot buy it; its payment is owed back to it.*"
*Why:* "owed back" is Agreements' consequence. The cost as Money can state it is that such a wallet cannot tell whether it bought anything.
*Suggested:* "*Cost, stated: a Money-only wallet can pay a claimed work's publication, but cannot tell whether it bought it; what is owed when it did not, Agreements say (rule 32a), and a Money-only wallet can still receive the refund (rule 10a).*"

**M6. Rule 10c, the over-sale refund (F224).**
*Now:* "**A payment for a stake transfer** (Agreements rule 14, F224) fulfils the transfer (field 5), or is named in its field 4: it buys the stake share, unless the transfer is an over-sale on the seller's own line, which confers nothing; **then it is money received for nothing, owed back by the seller** as a refund, by rule 10a."
*Why:* that an over-sale confers nothing, and that the seller owes the payment back, are Agreements' (rule 14 says both). Rule 14 then grounds its obligation in Money: "its payment is owed back by the seller (money received for nothing, Money rule 10c)". So the obligation is decided in two places, each citing the other.
*Suggested,* Money: "**A payment for a stake transfer** (Agreements rule 14, F224) fulfils the transfer (field 5), or is named in its field 4; what it buys, and what the seller owes when the transfer is an over-sale, Agreements rule 14 says; a refund owed is paid by rule 10a." Agreements rule 14: "…an over-sale confers nothing, and its payment is owed back by the seller, paid as a refund (Money rule 10a)."

**M7. Rule 10a, a broken collective's closing.**
*Now:* "A payment that committed to no key leaves its refund unclaimable: the obligation stays open and visible, and nobody can take it; where it is money a broken collective owes back, it does not block that collective's closing, which names it (Agreements rule 37d, QG1)."
*Why:* that the closing is not blocked is a rule about a collective's closing, which Agreements rule 37d already decides. The first half (an unclaimable refund stays open and visible; nobody can take it) is Money's own: where money can and cannot move.
*Suggested:* keep the first half and move the clause to Agreements rule 37d: "…the obligation stays open and visible, and nobody can take it (what that means for a broken collective's closing, Agreements rule 37d says, QG1)."

**M8. Rule 18a, a payout's shortfall.**
*Now:* "a shortfall beyond that maximum is an open obligation of the split service (F64). Amounts below a rail's minimum are held as open obligations until they can be moved (F50)."
*Why:* when a payout counts as discharged (the receipt shows the amount less the fee the plan allows) is Money's: that the money moved. That the split service owes the shortfall is a consequence of the split plan, an Agreements obligation, beside F214's "a service that skips it is liable".
*Suggested:* "A payout (Agreements) counts as discharged when its receipt shows the amount minus the rail fee the split plan says the receiver bears, and no more than the plan's maximum fee per payout; what the split service owes for a shortfall beyond it, Agreements say (the split plan, F64, F214). Amounts below a rail's minimum cannot be moved until they reach it (F50)."

**Read and left, as already in line with the principle:** rule 9 (a hop that forwarded nothing: the forward stays an open obligation "under the agreement named in the forward", which already defers); rule 10's double entry ("the greater amount counts as received"), which says that money moved; rule 14a and 16 (an undeliverable payment stays a debt; how long, and whether it is redirected, "is for the agreement"); rule 15's "anchor or bear the loss", which says whether a payment counts as made, that is, whether money moved to the owner, and decides no obligation. Rule 10a's "Whether an unclaimed refund ever lapses is for the offer's terms (Agreements)" already defers.

**Questions for Nobody, allegedly** (one at a time, as each comes up):
1. M1 to M8: move each obligation to Agreements as suggested, leaving Money to carry the payment?
2. "Everyday act" and its family: keep the word, or rename now that the key is the signing key?
3. The collective page's `law` reading property: a new name (for example `reading`)?
4. The documents outside this pass's list (the one page v10, the roadmap, the paper, the run guide, the project-lead prompt): bring them along, and who does the one page, since it is the author's redraft?
5. The persisted key-file fields (`safety`, `safetyThreshold`) and labels: rename them with a one-time conversion of existing test files, or keep them until the test identities are wiped before the first real acts?
