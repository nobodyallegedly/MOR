# F200 to F205 built into the on-chain rail

*10 October 2026, evening. Branch `claude/onchain-rail-f200-f205`, not merged. One roadmap step: the decisions Nobody, allegedly, took on 10 October 2026 about the on-chain rail (F200 to F205), built into the rail, with the smaller findings of Fable's review settled as wording, stated costs or client conformance. Written for Nobody, allegedly: plain words first, then precise. Every mechanic chosen under the delegation of 10 October ("If the mechanic you find respect the rules we go ahead") is marked **(mechanic, the build's)**. One question comes back to you, at the end.*

## In plain words

**What is built.** Six decisions, each with a test that failed before the change and passes after it:

1. **One payment is one payment** (F200). Bitcoin's way of hashing a block let about one payment in eight carry two different-looking proofs, so Finance counted it twice. Now the rail accepts only one of the two, and, separately, Finance asks the rail *which payment* a proof shows (on-chain: the transaction's output; on Lightning: the payment hash) instead of comparing proofs letter by letter. A payment mined again after the chain reorganises is still one payment.
2. **On a Bitcoin clock, the payment's block is its anchor** (F201, F202). There is now one anchoring cMIP and a first clock Module under it, Bitcoin. Where the owner's clock is Bitcoin, the theft rule asks: was the payment's block before or at the block of the lock change? No claim act is needed in between. Both of Fable's levers are shut on that clock: the payer who signs a payment, anchors a claim and pays after the lock change gains nothing; the owner who changes the locks while an honest payment is confirming gains nothing.
3. **On any other clock, the owner bears** (F203). The claim the payer wrote and anchored at the moment of paying protects the payment once the payment is proven. The stated cost, at the size Fable found: a thief and a payer who hold back a signed transaction, anchor a claim for it in the window, and broadcast it after the lock change, are protected. Paying with *another* transaction is another payment and is not.
4. **Proofs are checked against the real chain** (F204). A verifier hands the rail the block headers of the chain it follows; a proof whose block is not on that chain is "unknown", however much work its own headers carry. The fixed difficulty floor is gone. A client offline answers "unknown" for mined payments.
5. **Final once counted** (F205). A payment counted at its confirmations stays counted; a deeper rewrite of Bitcoin is a stated cost naming the two software faults of 2010 and 2013 as well as attacks. A payee asking for a large sum may ask for more confirmations in its request; the payment then counts only at that depth.
6. **The review's smaller findings** are now sentences in the Module: what a receipt proves (only what the payee says), the online request key, truncating proofs to the right length, never sweeping to the declared key, why testnet headers cannot pass as Bitcoin's, and a privacy section listing who learns what.

**What comes back to you.** One question, Q1, below: after a rewrite of Bitcoin deeper than the confirmations, F205 says the payment stays counted and F204 says a block off the chain is "unknown". Both cannot hold for a verifier that only ever saw the new chain. As built, the rule follows F204 word for word.

**What changed beyond the rail.** The core library changed (Finance's rule 15 and the Law view's way of telling payments apart), so the WebAssembly changes too. Nothing in the clients was touched.

## What was built, precisely

### F200: the canonical proof, and "the same payment" through the rail Module

- **The canonical index** (`modules/onchain/src/block.rs`, `canonical`): wherever the Merkle branch's sibling at a level equals the running hash, the index's bit at that level must be 0; the rule's step 8 answers invalid otherwise ("the index is not canonical"). **(mechanic, the build's: the bit rule.)** *An honest block has no other equal siblings (Bitcoin Core refuses such a block as mutated), so no honest proof is refused.*
- **A rail Module says what the same payment is** (`mor_payment::RailModule::payment`, a required method): on-chain `[txid, output]` in deterministic CBOR (`OnchainProof::payment`); on Lightning the payment hash, once the proof carries the preimage. `mor_payment::payment(record, modules)` gives `[rail, the Module's bytes]`. **(mechanics, the build's: the output as CBOR; a Lightning proof without a preimage shows no payment, as an on-chain request without a transaction shows none.)**
- **Finance reads it** (`core/src/law/view.rs`): the Law view gains `payments`, a fact the caller states (like `rail_valid`), mapping each receipt's or claim's proof to its payment; `payment_of` and `same_payment_of` replace every comparison of proof bytes (`paid_toward`, money owed back, rule 10's overruled receipts and claims, double entry's disagreements, rule 15's payer's claims and receipts, the purchase and collective records that ask "the same payment"). **(mechanic, the build's: a proof the caller states nothing for is its own payment, its bytes, as before; the two kinds of key are tagged so they never meet.)** *Stated cost: a verifier that states no payments counts a re-mined payment twice, as draft 1 did; the payment cMIP says a verifier states them.*
- **Tests**: the review's finding-1 tests rewritten to pin the fix (`one_payment_has_one_valid_proof_in_its_block_where_its_merkle_node_is_duplicated`, `a_twin_proof_is_invalid_and_one_payment_counts_once`); `one_payment_mined_again_after_a_reorganisation_counts_once` (Finance, 1,000 counted once; 2,000 when no payments are stated); `the_same_payment_is_the_payment_hash` (Lightning).

### F201 and F202: one anchoring cMIP, the Bitcoin clock Module, the payment's block as its anchor

- **Texts**: `cmips/cmip-anchoring-draft-1.md` (one cMIP; what a clock Module must define; the point on a block-based clock is the block; an anchor may place a commitment naming its act; a clock's data supplied by the client), written only as far as F201, F202 and F204 need: the pooled anchoring service is left whole to step 14a. `modules/module-bitcoin-clock-draft-1.md` (the reference `[spec, network]`; the point, the block's height on the chain followed; the depth, six; the proofs it accepts: an on-chain payment now, batch anchors at step 14a). Envelope draft 7's anchoring task and Finance's clock format revised in place (each clock entry names a clock Module).
- **The commitment naming its act** (the smaller of the two options F201 left open): the anchoring task accepts a commitment that names its act, rather than the payment cMIP's commitment carrying an act id. **(mechanic, the build's: carrying an act id would change every commitment on every rail, and no act exists before the payment to name.)** The payment cMIP recomputes the commitment from the receipt or claim, and the anchor places that act at the payment's block.
- **Code** (`modules/onchain/src/clock.rs`): `clock::reference(network)`; `BitcoinClock { chain }.payment_anchor(act, record, held)`, which runs the rail's rule on the chain followed and, where it answers valid, gives `Anchor { act, reference, point: height of the payment's block }`; the caller holds it in the Law view's `anchored` as for any anchor. Batch proofs (`AnchoringCmip::verify`) accept nothing before step 14a. **(mechanic, the build's: the point is the height; the anchor goes to the act through the existing `Anchors`, so Finance gains no new notion, as F201 asked.)**
- **Which claims, on that clock**: the Law view gains `rail_clocks`, pairs (clock Module, rail Module) where the clock reads the rail's proofs, stated by the caller from the specifications it holds (`clock::reads()`). On such a reference rule 15 reads the payer's valid claims only; a pending claim's anchor counts for nothing. **(mechanic, the build's: a caller-stated pair, as `push_rails` is; the field a Module declares it in is format open, F140 item 1.)** *Reference implementation note: the core's `Reference` keeps its field name `cmip`; on a clock entry it now holds the clock Module's spec hash.*
- **Test**: `on_the_bitcoin_clock_the_payments_block_is_its_anchor`: a royalty mined before the lock change's block and confirmed after it counts; a transaction held back, its pending claim anchored on Bitcoin before the lock change, mined after it, does not (and would, read as on another clock). The clock Module refuses a proof short of the depth and one off the chain it follows. *The lock change's home receipt is anchored by a stated anchor, as step 14a's service will do it.*

### F203: the earliest claim of the same payment, on any other clock

- **Finance rule 15** (`core/src/finance.rs`): `PaymentClaims { valid, pending }`, `claims_in_time`, `rule_15_by`. Per reference: on a clock reading the rail's proof, the valid claims; on any other, valid and pending claims of the same payment once one is valid; with none valid, none. The old `rule_15` keeps its meaning (valid claims only). **(mechanic, the build's: the choice is made per reference, so a clock whose main reference is Bitcoin and whose backup is not reads each its own way.)**
- **The Law view** gains `rail_pending`: claims whose rail answer the caller found pending *with a payment shown* (on-chain, a transaction). A claim of a request alone shows no payment and protects nothing. **(mechanic, the build's.)**
- **Client conformance** added to rule 15: a payer's wallet writes a second claim once the rail answers valid.
- **Stated cost** written into Finance rule 15 and the Module, at the size Fable found (above, in plain words).
- **Tests**: `on_a_clock_that_is_not_bitcoin_the_earliest_claim_of_the_same_payment_counts_once_one_is_valid` (finance); the review's finding-2 and finding-3 tests rewritten: `on_a_clock_that_is_not_bitcoin_a_pending_claim_counts_only_for_its_own_transaction` (another transaction: 0, nothing protects it; the very transaction held back: 20,000, the stated cost) and `the_owners_hour_wide_lever_is_shut_by_the_pending_claims_anchor` (20,000).

### F204: proofs checked against the real chain's headers

- **The data** (`modules/onchain/src/chain.rs`, `HeaderChain`): the headers of the client's best chain, in order, from a start to its tip; each builds on the one before and meets its stated target; the start is a block the Module names for the network. Production rule 12 holds: the headers are input the client supplies, never fetched. *Mechanics, all the build's:*
  - **How headers are supplied:** as one ordered list from a starting height; the reference client reads them from its own node (`Btcd::chain`).
  - **How far back:** from the network's genesis (Bitcoin, testnet and signet genesis hashes named in the code); on regtest any start, a test network proving nothing. No later checkpoint in this draft.
  - **What the rule does not check:** the difficulty schedule and timestamp rules, which the client's header sync checks as every node does.
  - **Two verifiers with different tips:** the proof's block and headers must be the chain's at their heights; a longer chain agrees; a chain holding the block with fewer headers on it answers pending ("j of k"); a chain with another header at a covered height answers unknown.
  - **The floor's role:** removed. Its jobs are done by the chain followed (the price of a forgery) and the genesis start (telling networks apart, review 7c). Kept, it would refuse every honest proof below a difficulty Bitcoin had until 2021.
  - **What an offline client answers:** unknown for every mined payment, pending before mining.
- **The rule's step 9** answers unknown where the verifier holds no chain of the address's network, the block is not on it, or a later header differs from it. `Onchain` is now adopted with its chain (`Onchain::on(&chain)`, `Onchain::offline()`).
- **Stated cost** (client conformance): about 75 MB of headers kept in 2026, about 4 MB more a year, or a header service trusted, which the client MUST say.
- **Tests**: `a_mined_payment_is_checked_against_the_chain_the_verifier_follows`, `a_held_chain_starts_where_the_module_says_on_every_network_but_regtest` (rule); the review's floor tests rewritten: `a_forged_header_chain_answers_unknown_whatever_its_work`, `honest_proofs_verify_at_any_difficulty_and_forging_now_costs_the_chain_itself`.

### F205: final once counted; the request may name more confirmations

- **The request** may name a number of confirmations k ≥ N; it is signed with it (`tagged_hash(tag, commitment || k as 8 bytes, big-endian)`), encoded `request = bstr / [bstr, k]`; the proof is valid at exactly k headers on the chain followed; a request naming fewer than N is invalid; a payer stripping the number breaks the signature. **(mechanics, the build's: the message and the encoding; the same tag, so a request naming no number is exactly draft 1's.)**
- **The Bitcoin clock's depth** is the rail's N, one number for both.
- **Stated cost** in the Module and the clock Module: a rewrite deeper than the confirmations leaves a counted payment unpaid or an anchor pointing at a block no longer on the chain; it has happened twice from software faults (August 2010, about 53 blocks; March 2013, about 24 blocks); an attack needs a majority of the hash rate. Never said to be impossible.
- **Test**: `a_request_may_name_more_confirmations_and_the_payment_counts_only_there`.

### The review's smaller findings and section 8

| Finding | Settled as | Where |
| --- | --- | --- |
| 5. The receipt proves payment to the key, not by the payer | Wording: a receipt naming a payer proves only what the payee says, as the Lightning Module says of itself | Module, "What a verifier ties together" |
| 6. The request key is online, and W4 rests on it | Stated cost: a thief with it makes the seller's side commit to any version of a claim; `request` equal to `key` puts a flow's key online | Module, "Costs, stated" and "The rail" |
| 7a. More than k headers is invalid | Client conformance: truncate to k; why invalid stated | Module, "The rail proof" |
| 7b. Sweeping to the bare key links the payee | Client conformance: never sweep to the declared key's address; **the end-to-end test now sweeps to a fresh key** | Module; `harness/tests/onchain_rail.rs` |
| 7c. Nothing in the proof names the network | Wording: a testnet header is on no chain starting at Bitcoin's genesis; the floor's second job moved there | Module, "The chain the verifier follows" |
| 7d. (for step 14a) | Domain separation required of the batch root, written into the anchoring cMIP as step 14a's | anchoring cMIP |
| 8. Privacy, nine behaviours | 1 (salt) and 4 (consolidation), 5 (explorer), 7 (relay timing) as client conformance; 2 (script path), 3 (sweep), 6 (hosted endpoint), 8 (shown acts), 9 (exact price, the amount in the clear) as stated costs | Module, "Costs, stated" and "Client conformance, in one list" |

## Texts changed

Revised in place, for Nobody, allegedly, to approve again: Finance draft 6 (rules 8a, 10, 15; the clock format; header note), Envelope draft 7 (anchoring), Production draft 6 (rule 12), core v21 and the freeze suite (a revision note; step 4c's wording; the anchoring row), the payment cMIP draft 2 (item 6, "the same payment"; item 5's data; the on-chain rail is a request rail), the Lightning rail Module draft 2 (its same payment). New: the on-chain rail Module **draft 2** (draft 1 renamed and rewritten), the anchoring cMIP draft 1, the Bitcoin clock Module draft 1. READMEs, the findings log ("F200 to F205 built") and the roadmap (step 12a) updated; a note at the top of Fable's review says its tests were rewritten.

## Stated costs, in one list

- F200: a verifier stating no payments counts a re-mined payment twice. A payer paying one commitment twice (two transactions) makes two payments.
- F203: on a clock that is not Bitcoin, a transaction held back and anchored in the window is protected though paid after the lock change; the owner bears and closes it by declaring Bitcoin.
- F204: headers kept (75 MB, 4 MB a year) or a header service trusted (client conformance); offline, mined payments are unknown; the rule trusts the client's chain for the difficulty schedule.
- F205: a rewrite deeper than the confirmations (faults 2010 and 2013, or a majority attack) leaves a counted payment unpaid or an anchor dangling.
- Review 6 and section 8: as in the table.

## Question for Nobody, allegedly

### Q1. Counted, then rewritten deeper than its confirmations: what does a verifier answer?

*In plain words:* Bob counted Alice's payment at six confirmations. Later Bitcoin rewrites seven blocks (a fault like 2013's) and the block is gone. F205 says the payment stays counted. F204 says a proof whose block is not on the chain the verifier follows is "unknown", never valid. A verifier that only ever saw the new chain (Carol, checking Bob's books a year later) can only answer "unknown". Bob's own client, if it kept the old headers, answers "valid". The two decisions meet here and cannot both hold for Carol.

*Laid beside it, your words:* F204, "Yes B." (proofs checked against the real chain); F205, "Hard for me to imagine, so I will agree with you. But, never say never."; F192, "settle is final for what signers could see".

*As built:* the rule follows F204 to the letter: against the chain now followed, unknown; against the chain the payment was counted on, valid (shown on regtest, `harness/tests/onchain_rail.rs`, and offline, `one_payment_mined_again_after_a_reorganisation_counts_once`). A client that keeps the rail answer it had when it counted (the Law view's `rail_valid` is a fact the caller states) keeps counting it; one that re-asks the rail does not.

*Options, none built:*
1. **As built.** "Final once counted" holds for the verifier that counted, and for acts built on it (nothing reopens on its own); a verifier that sees only the new chain answers unknown. *Cost:* verifiers can disagree after such a rewrite, which F205 hoped to avoid.
2. **A kept branch counts.** A verifier keeps, beside its best chain, the headers of any block it once counted, and hands them with the chain; a proof on such a branch, at depth, is valid. *Cost:* a verifier that never held the branch still answers unknown; and it changes what F204's "not on the chain" means, so it is yours.
3. **A side branch with the chain's own difficulty counts.** A proof whose block is on a branch leaving the verifier's chain, its headers stating the very targets the chain had at those heights, is valid at depth. Forging one costs k real blocks of work, never published. *Cost:* it reopens forgery at the price of a k-block rewrite, which F204 closed, so it changes F204's rule.

*Lean of the build:* 1. It is the rare case F205 already names as a stated cost, and it keeps F204 exact.

## Readings taken, to confirm

1. **A pending claim protects only with a payment shown.** On-chain a claim must carry the transaction; a claim of a request alone protects nothing (F203). On Lightning a claim without the preimage shows no payment either.
2. **Per reference.** Where a clock's main reference is Bitcoin and its backup is not (or the reverse), rule 15 reads each reference its own way (F201 on Bitcoin, F203 elsewhere).
3. **"Before or at"** on Bitcoin includes the lock change's own block: a payment in the same block counts.
4. **The point of a lock change on the Bitcoin clock** needs its home receipts anchored on Bitcoin, which step 14a's service does; until then a client states those anchors (as the tests do).

## Tests

**Before** (the starting commit `86b72b6`, run in a clean worktree): Rust workspace **512 passed, 0 failed, 1 ignored**.

**After:** Rust workspace **516 passed, 0 failed, 1 ignored**, the end-to-end regtest test run with `MOR_BTCD` set (btcd 0.24.2, its archive's SHA-256 checked against the value recorded in `modules/onchain/README.md`), in about 19 seconds.

New or rewritten in this step: `modules/onchain/tests/rule.rs` 19 (3 new, the floor test replaced), `tests/review.rs` 10 (all six of findings 1 to 4 rewritten to pin the fixes), `tests/finance.rs` 4 (2 rewritten, 1 new), `modules/lightning/tests/rule.rs` 1 new, the end-to-end test updated (headers from the node, the reorganisation read under F204, the sweep to a fresh key).

**A test that failed first, for each change:** the canonical index (the twin answered valid against a stub, then invalid); the same payment (2,000 counted for one payment of 1,000 until the core read `payments`); F203 (0 until rule 15 read pending claims of the same payment); F201 (the clock Module's check, a stub anchoring nothing, failed the test; then the real one); F204 and F205 (written with the new interface, then shown to fail with the chain check and the requested confirmations switched off in the rule, and to pass with them on). *Not failing first:* the Lightning `payment` test, written after the method the trait made required.

**Main's red check** (`npm run test:build`, the released display client compared with the code): not fixed here, as asked. **These changes touch it:** the core library changed, so the WebAssembly changes and the display client released in `clients/site/built/` falls one more change behind the code; a release is owed after merge, as after any core change. *The TypeScript clients, run on the WebAssembly rebuilt from this branch (wasm-bindgen 0.2.129): 203 tests in eleven packages, all passing; the site's reproducible-build check itself was not run.*

## Not done

- Step 14a's anchoring service: batches, payment per hash, omission, deadlines, tiers. Nothing beyond what F201, F202 and F204 need.
- The RV32IM programs (Production rule 12) for the rail and the clock.
- Real money, real identities: regtest only, test identities only.
