**Done. The binding changes: a receipt's payer is an identity or absent, and claim key 8 is gone (`moneyRead`, `paymentCommitment`, `readCommitment`, `anchoringCheckTicket`); `agreementsOwedBack` loses `toKind`, and a gift is never listed; `agreementsPurchase`'s `refundTo` is an identity or null; `agreementsClosing`'s field 4 leaves open only a payer with no address, its notice required (a closing carrying null there is invalid; `leftOpen`'s notice is never null); `agreementsClonePlan` and `agreementsRecord` refuse `[5, stake]` under every holder again. The crate builds only once the payment cMIP's matching patch (`docs/s7k-cmips-payer.patch`) is applied. Ummia's final hashes are in "Checks", unchanged by the last round.**

# S7k: the last text points before the redesign's second merge

*Session S7k, 1 November 2026, on `claude/s7i-routes` (pull request 116), beside the Dubsar Suite's round 10. The decisions are F414 and F416 (`claude/lead-records`), the last replacing its earlier follow-up. `spec/`, `core/`, `docs/`, `harness/tests/` and `wasm/` are touched, and the c-box's vectors README. Nothing in `clients/`, `cmips/` or `modules/`; no web release is rebuilt. This session records no finding of its own.*

## In plain words

- **An anonymous payer is a fresh identity.** A payer who wants to stay unknown makes a throwaway identity hosted by its own wallet. The payment names that identity as payer, and its claim says where money owed back goes. The bare signing key as a payer is gone, and so is the claim's second signature (key 8). A payment naming no payer is a gift: it counts as paid, and nothing is owed back on it. So there is no longer a refund "owed to nobody", and a closing never waits on one.
- **An owner held at a contested position can leave.** The owner signs one escape that abandons both rotations, wherever the position is contested: at a self-hosted home, by one home's conflict, or by two rotations each missing the home rule. The core already counted it; the texts now say so, with Fable's four cases and the third kind as vectors.
- **A holder is a holder, and a collective counts once.** A collective among a stake's holders gives one consent, by its own constitution. Under every holder, declared or by default, each holder with no voice signs. `[5, stake]` is only for a rule by share.
- **The one-time key's standing, built earlier in this session, is undone** with the bare key itself. It was never released.

## 1. The anonymous payer (F416, decided by Nobody, allegedly, on Fable's review)

- **Built first, as a vector, before anything was struck.** A refund to a fresh identity the payment committed to, hosted by its own wallet, paid to the refund rail its claim names: repaid (300). A routing node holding the proof claims the payment, naming its own refund rail, and the money is sent there: nothing repaid to the fresh identity (0). Both passed on the core as it stood, and still pass.
- **Texts, in Fable's sentences:**
  - Money, receipt field 2: an identity; absent where the payer named none, a gift. The `payer = hash / signing-key` line is removed.
  - Money, the claim: key 8 and its signed message (`MOR/finance/anonymous-claim`) removed; "Key 8 is reserved, never reused", as the bake's fields 7 and 8 are. The tag is removed from Identity's list of tags too.
  - Money rule 11: the gift sentence, and the rail proof's commentary moved from rule 19.
  - Money rule 17: a refund owed on a payment is owed to the payer it names, paid to its payee pointer, or, where the payer's claim names a refund rail (key 7), there; a fresh identity with no pointer names one so. The bare-key sentences in rules 15 and 17 are removed.
  - Money rule 19: retired, its number never reused, as Envelopes does. Its citations now cite rule 17 (Money rules 18 and 28; Agreements rules 10, 12 and 93; the citation example in Agreements' "How to read").
  - Money rule 24: the one-time key's sentence removed.
  - Money's reasoning: "A refund goes to the payer named, not to a proof", with the stated cost once: anonymity on MOR is a fresh identity, not a missing one.
  - Agreements rule 12: owed back "to the payer named, or nothing where none is".
  - Agreements rule 13 and "A contest of a purchase": the buyer is the identity the commitment names, or the signer of the sign-on; with none, no buyer. The one-time key's sentences are removed.
  - Agreements rule 22: the payer an identity or nobody; its stated cost back to one sentence; a payer naming none cannot reward a relay, and a fresh identity can.
  - Agreements rule 93 and the closing: "money owed back to nobody" and its stated cost removed. A refund paid to the refund rail is repaid by the collective's claim. A gift owes nothing and does not block a closing. The notice to a one-time key, and its line in the notice's row, are removed.
  - The closing's field 4: the left-open kinds reduced to one, the payer with no address. **The grammar `notice: hash / null` is kept**; its comment now says null leaves nothing open. See question 1.
  - The MICS: "Refunds go to the payer named, not to a proof"; the deal's refund; the payment claim's row.
  - The suite: scenario 2 step 6 (the buyer paid as a fresh identity and claims the refund by a claim signed by it, naming key 7) and 6b (a routing node cannot claim it; a payment naming no payer is a gift); 4l's one-time-key sentence removed; 7w's "A bare key" and "Owed to nobody" become "A fresh identity" and "A gift"; scenario 9 step 6; the checklist lines at 102 and 144.
- **Core:**
  - `money.rs`: `Receipt.payer` is `Option<Hash>`. A signing key in field 2, or a claim carrying key 8, no longer decodes. Removed: `Payer`, `Anonymous`, `ANONYMOUS_CLAIM_TAG`, `anonymous_message`, `anonymous_signature`, `Claim::payer`, `RefundTo` and `claims_refund`. `refund_owed_to` returns the payer named, or none for a gift. `history` lost its anonymous flag.
  - The Agreements view: a new `payment_payer` reads the payer a payment names: its receipt's field 2, or the signer of a payer's claim of it to the same payee (the smallest act id). `PurchaseEval.refund_to` is `Option<Hash>`, and `OwedBack.to` is a `Hash`. A gift is never owed back. `repaid` takes the payer's identity. The closing's owed-to-nobody and one-time-key exceptions are removed. The one-time-key standing in `vows.rs` and `routes.rs` is reverted to S7j's.
  - Tests: the bare-key and key-8 tests are replaced by a test that neither decodes; a refund to the payer named, or none for a gift (rule 32); a refund to a fresh identity repaid at its claim's refund rail; and a gift that owes nothing and does not block a closing. F208's one-time-key notice test is removed. The harness's Lightning test, step 5, now pays as a fresh identity.
- **Vectors that moved, against this session's earlier commit:**
  - gone, with the one-time key's standing: "a purchase whose payer committed only a one-time key: the contest of the identity that signed the key's claim (key 8), naming it, is shown" (shown); "the same purchase, a contest naming the key's claim signed by someone else: shows nothing"; "a vow's seat paid by a one-time key, a later claim carrying the key's signature acknowledging the door's record: confirmed"; "a route's first payer who committed only a one-time key, … the first payer is the buyer";
  - gone, with the refund owed to nobody: S7j's "a closing naming in field 4 a refund owed to nobody (a payment that committed no key), its own receipt before the line: complete";
  - in its place: "a closing of a collective whose own receipt before the line records a payment naming no payer, naming another seller's tag: complete" (the same verdict: a gift owes nothing, and field 4 names nothing);
  - every other case keeps its verdict, acts and ids. No vector carried a bare key or a key-8 claim, so no other act id moved.

## 2. The escape on a standing contest (F414, F416)

- **Texts (Identity):**
  - rule 29's second exception: a position contested by two rotations revealing the same chain key, wherever served. That covers a self-hosted home (rule 4), one home's conflict leaving the others short (rule 44), and competing rotations each missing the rule (rule 40);
  - its conformance paragraph, with the stated cost beside it: the competing rotation's bytes prove a rival exists, not that the position is contested, and abandoning a rotation that counts harms only the owner;
  - section 11 and its "In short"; line 70; rule 42; rule 44's stated cost. Elsewhere: the suite's 7d and the MICS row.
- **Core:** no change. **Vectors:** Fable's four (contested; the endorsed escape counts; no endorsement and objected to, void; a verifier without the endorsement, contested) and a rule 40 contest (the escape counts). *Found while writing them:* the escape's own home rule must fit its new homes (rotation check 5).

## 3. The holders' rule (F416)

- **Texts (Agreements):** field 30 says the one reading once, with the italic "Richer models of control are a cMIP's, built from this grammar". Rules 48, 94, 95 and 65 are back to S7i's wording. Rule 64 item 4: under every holder, declared or by default, the holders who are no members of the agreement in force sign outside the mark, members consenting through the powers above. **Rules 94 and 95 (its lead-in and item 3), field 30 and rule 64 item 4 read "each holder who is no member of the agreement in force"**, as the core does, members consenting through the collective's own constitution (question 2, decided (b)). Rule 48's wording for publications and fees, outside a collective, is unchanged.
- **Core:** this session's change in `owners_consent` and the split agreement's owners' matter is reverted, and so is S7j's Q-A11 core (`[5, stake]` under a declared every-holder rule). *Said plainly:* F414 had kept Q-A11 "as built"; F416's single reading leaves it nothing to stand on, so I reverted it rather than keep two readings. No vector held a declared every-holder rule.

## Vectors

- 509 verdict cases. This session added 8: five for the escape, two for the fresh identity, one for the closing's required notice ("a closing whose field 4 names a payment with a null notice: invalid"). One S7j case was replaced, as listed in section 1. No other verdict turned on the last round's decisions: no vector carried a null notice, and items 2 to 5 change no core reading.
- Both vectors READMEs and the c-box's are updated.

## For the Dubsar Suite

- **First, the payment cMIP's commitment takes an identity where it took a key.** `cmips/payment`, `cmips/conversion` and `cmips/anchoring` still name the removed `Payer` and `RefundTo`. Until they change, they do not build, and so neither do the WebAssembly crate, the harness and the Modules. **`docs/s7k-cmips-payer.patch` is the change, built and tested here and then left out of the commit** (`git apply docs/s7k-cmips-payer.patch`):
  - `Commitment.payer: Option<Hash>`, encoded as the hash or null;
  - a claim's payer is its signer (`verify`, the conversion cMIP's `Hop::claim`);
  - `transfer_to_oneself` compares the identity;
  - the anchoring cMIP's `Refund.to` is the payer named, or none for a gift.
  - With it, the whole workspace builds, and every test outside the Modules and the cMIPs' own tests passes.
  - The payment cMIP's own text, if it shows the payer as `hash / signing-key`, takes `hash / null`.
- **Your tests to change** (they build bare-key payers or key-8 claims): `cmips/payment/tests/transfer.rs` (the `Payer` import); `modules/lightning/tests/rule.rs` (the anonymous claim cases); `modules/onchain/tests/rule.rs`, `agreement.rs` and `service.rs`. Each `Some(Payer::Identity(x))` becomes `Some(x)`, and `anonymous: None` goes. The bare-key cases retire or become fresh-identity cases, as `harness/tests/lightning_rail.rs` step 5 now is.
- **The apps' anonymous paths** make a fresh identity, self-hosted (one genesis naming the wallet as its home), and commit it as the payer. Its claim names a refund rail (key 7) and is shipped with the genesis to the seller. A payment that names no payer is a gift: show it as such, with no refund to wait for.
- **The binding:** `wasm/README.md`, "Changed in S7k", old shape first. The S7j line saying `agreementsClonePlan` lists `[5, stake]` is removed.
- **The air-gapped Module** (`modules/airgap`, yours) opens the escape at any homes already. To change:
  - the summary's words for `Exception::EscapeContested` ("contested at a self-hosted home" becomes "contested by two rotations revealing this key");
  - the doc comments on `EscapeContested` and `check_competing`, and the README;
  - tests in `tests/rule_29.rs` for a contest at two homes and for a rule 40 contest: the competing rotation opens the escape, and without it the escape is refused.
- **Ummia's pinned hashes**, final for these texts: in "Checks".

## Questions, decided

The MOR lead took all five under delegation (F416, "S7k done"); each is now in the texts.

1. **(b) The closing's field 4 is `left-open = [ payment: hash, notice: hash, ? holder: hash ]`.** The notice is required; a null is outside the format. Core: `OpenOwed.notice` is a `Hash`, and decoding refuses null; the closing reads the notice directly. The binding's `leftOpen` notice is never null. A test that named a payment with no notice now leaves it unnamed (it still blocks). New vector: a closing whose field 4 carries a null notice is invalid.
2. **(b) Rules 94 and 95 item 3 read "each holder who is no member of the agreement in force"**, as the core does. For one reading, the same words go into rule 95's lead-in, field 30 and rule 64 item 4. Core: no change.
3. **Rule 11:** "Where the rail binds the payer, the payment's commitment says which." It sits after the gift sentence.
4. **Money's words list, in normal text:** "A proof binding the purpose binds the payer the commitment names" and "On a push rail, a claim makes its signer the payer", with the stated cost that anyone holding a public push-rail proof can claim it, as its payer. Core: no change; it already reads a claim's signer as its payer.
5. **Client conformance** beside "An anonymous payer" (receipt format): a payer's client paying as a fresh identity delivers its genesis with its claim.

## The stranger's reading

A subagent read only the eight texts and the diff of every sentence changed since the last reading.

- **Verdicts:** five of the decisions agree once the points below are fixed (the fresh identity, the gift, rule 19 retired, key 8 reserved, rule 95 item 3). Two agree with the tensions in questions 3 and 4.
- **Its points, fixed in the texts:**
  - leftovers of the old model: the MICS's broken-collective bullet (a refund to a bare key; money owed to nobody); Identity's example of a signature inside a payload (key 8); Agreements' bare-key vault sentence; rule 93's "two kinds" of exception, now one; and the journalist scenario's refund by "a signature with the key", now the fresh identity's claim;
  - citations of the retired rule 19, now rule 17 (Agreements rule 12's stated cost, the anchoring paragraph, the suite's scenario 9);
  - "owed back to nobody" for a tip, now "nothing owed back" (Agreements rule 12; the suite's checklist and 4k);
  - Money rule 14: an absent payer is a gift, and a key delivery may go to a bare key either way;
  - rule 17's sentence now ends before its list ("It is paid:");
  - rule 22's stated cost: "a payment naming no payer rewards no relay or service";
  - Identity's tag sentence carries no history.
- **Its points, left as questions and since decided:** 1, 3, 4 and 5 above.

## Checks

- `cargo test --workspace`, with the cMIP patch applied locally: green for core, relay, harness, the WebAssembly crate and the cMIPs' libraries. The suite's own tests in `cmips/*/tests` and `modules/` need the changes listed above. Without the patch, the core and relay build and pass alone.
- `cargo test -p mor-core`: green; the binding builds with the cMIP patch applied.
- `python3 core/vectors/check.py`: all 276 agree, 98 verdict cases judged.
- The generator gives the same bytes again.
- `scripts/c-box/make-c-box.sh`: 8 texts, 12 vector files.
- No finding number or review label is in the texts.
- **Ummia's pinned hashes, final for these texts** (`clients/ummia/src/cards.ts`), unchanged by the last round, which touched only Money and Agreements:
  - `MICS_HASH = 'c1ced60231d44db71aa59585c9a145b2ddbbedfbecf39eb23b7b2148bce1b9b2'`
  - `SUITE_HASH = '586d2f1df0f82f92517d869efbfc7464f976c23fb1df2cbcb2deb6bcc4d19b2e'`
- GitHub: not read by me. It will be red until the suite applies the cMIP patch, which it needs anyway to build the binding.
