# Roadmap step 12a: the on-chain rail

*9 October 2026. Branch `claude/onchain-rail-step-12a`, not merged. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved yet. The Module was written on the two decisions of 9 October 2026 (a request rail by pay-to-contract, no OP_RETURN; the vault an ordinary Bitcoin key changed only by a rotation), and building it raised three questions Finance does not answer. They are listed below, one by one; nothing was chosen for them.*

## In plain words

**What works.** Alice pays Bob in Bitcoin, on a private test network. Bob's address for each payment is his own key, mixed with a fingerprint of the payment (who pays whom, how much, for what): every payment gets a fresh address that only Bob can spend from and that nobody watching the chain can link to him. Before Alice pays, Bob's software signs the fingerprint: that is his "request". The transaction carries the fingerprint without writing anything extra on the chain. After six blocks, both hold the same proof, and anyone can check it: the right key, the right fingerprint, the right amount, six blocks of work on top.

**Pending, then counted.** When Alice sends the payment, her record says "paid, not yet settled". After one block it still says so ("1 of 6"). After six it counts, and Bob signs his receipt. Finance already had a word for this ("pending"), so the normal case needed no new rule.

**Where Finance is silent.** Bitcoin can change its mind: a longer chain can replace the last few blocks, and with them a payment. In the test, a payment confirmed six times was undone that way, and Alice got her coins back. Both Alice's and Bob's records still say the payment was made, and the rules give no way to say otherwise. Three questions follow from that, below. **Nothing was chosen for them.**

**Also built.** A payment above Bob's vault limit goes to his vault, an ordinary Bitcoin key he could keep offline; a payment in a currency his vault does not cover is refused; a payment to an address that does not carry the fingerprint is refused, by Alice's wallet before paying, and by everyone after.

## What was written

- **The on-chain rail Module, draft 1** (`modules/module-onchain-rail-draft-1.md`), in the shape of the Lightning Module: its addresses, how it carries the commitment, its proof and its rule, request rail declared, costs stated, and the questions it raises for Finance. **Experimental.**
- **The payment cMIP's code** (`cmips/payment`): a rail Module now declares in code whether it is a request or a push rail (`RailModule::kind`), and a client reads the push rails from the Modules it adopted (`Modules::push_rails`), as F140 item 1 asked to build. The Lightning rail declares itself a request rail. *No specification text changed.*

## What was built

- **The Module** (`modules/onchain`, crate `mor-onchain`): the pay-to-contract tweak; a decoder for transactions, block headers, targets and Merkle branches, written from Bitcoin's serialisation; the rule; and a client for btcd (feature `btcd`) that builds a payment's proof from the chain, the way a payer's wallet and a payee's watcher each would.
- **The core library**: unchanged. Its Finance rules (pointers, vault limits per unit, the theft rule) are rail-agnostic and take the rail's answer as a fact the caller states, so the on-chain rail plugs in without touching them. **The WebAssembly did not change**: nothing under `core/` or `wasm/` changed, and `Cargo.lock` only gained the new crate's entries.
- **The clients**: as for Lightning, the harness plays the wallet and the payee's software (Alice's wallet, Bob's request service and watcher). No TypeScript client changed; showing "paid, not yet settled" in a client waits on the answers below.
- **Tests**: offline, the decoders and the tweak against a second, independent implementation (rust-bitcoin), and the rule through the payment cMIP (`modules/onchain/tests/rule.rs`, 17 tests); the rail against Finance's rules (`modules/onchain/tests/finance.rs`, 3 tests); and end to end on regtest with two btcd nodes (`harness/tests/onchain_rail.rs`).

## How it works, precisely

- **Address** (`onchain-address`): network, `key` (the x-only Taproot internal key the money goes to: one key, or a MuSig2 or FROST key standing for several), `request` (the x-only key that signs requests), an optional `tree` (the root of the owner's own Taproot scripts, for a k-of-n script multisig), an optional endpoint. The same form is a flow pointer's rail address and a vault entry's source.
- **The commitment on the chain**: the payment's output key is BIP 341's Taproot output key for `key` with the payment cMIP's commitment hash as the Merkle root (or beside `tree`, as a branch). Any Taproot wallet spends it, given the commitment. No OP_RETURN, nothing else on the chain.
- **The request**: a BIP 340 signature by `request` over `tagged_hash("MOR/module/onchain/request", commitment)`. It makes this a request rail (F128, W4): the payee's side committed, the purchase's claim included. The money never goes to `request`, so a vault's Bitcoin key stays offline while its request key signs.
- **The proof** (`onchain-proof`): the request; once paid, the transaction without its witness and the output index; once mined, its position, its Merkle branch, and the block's header followed by the headers built on it, **exactly six** for a valid proof.
- **The rule**, in order: invalid shapes; the unit; the request signature; the tweak; **pending** if not paid; the output pays exactly the amount to the tweaked key, or **invalid** ("paid to an address not tweaked by this payment's commitment"); **pending** if unconfirmed; the branch and the header chain with their work; **unknown** if a header's target is easier than the network's floor; **pending** below six headers; **invalid** above six (one payment, one proof); **valid**. No trusted party.
- **Two parameters**, stated in the Module for confirmation: six confirmations; on Bitcoin, a floor of `0x170fffff` (difficulty about 2^44). The rule runs on nothing but the proof (Production rule 12: no clock, no network), so the floor is what makes a forged proof cost real work: about 0.8 of a block's work in 2026 for six headers.

## Receipts and claims, before and after confirmation

| Moment | Payer's claim | Payee's receipt | The obligation | A client shows |
| --- | --- | --- | --- | --- |
| Request signed, not paid | — (the wallet checks the request: pending) | — | open | — |
| Broadcast | written at payment, anchored (rule 15): **pending**, unconfirmed | none yet | open (rule 4) | paid, not yet settled |
| 1 to 5 blocks | a proof built now: **pending**, "k of 6" | none yet | open | paid, not yet settled: k of 6 |
| 6 blocks | a second claim, with the six-header proof: **valid**; the first stays pending forever | signed now, the same proof: **valid** | discharged (rule 7) | paid |
| Reorganised before 6 | still pending | none | open | paid, not yet settled |
| Reorganised after 6, coins spent again | **valid**, unchanged | **valid**, unchanged | discharged | paid (the chain says otherwise) |

## What the reorganisation did, on regtest

Two btcd nodes, A and B. B left the network. On A, Alice paid Bob 3,000; six blocks; Bob's watcher built the proof from A and signed his receipt; Alice wrote her claim with the same proof. On B, which never saw the payment, Alice spent the same coins back to herself, and B mined eight blocks. B came back; A switched to B's longer chain.

| Who | What the record shows | What the chain shows |
| --- | --- | --- |
| Alice | her claim at payment: pending; her claim at six: **valid**; Bob's receipt: **valid** | her coins are back with her |
| Bob | Alice's claim at payment: pending; Alice's claim at six: **valid**; his own receipt: **valid** | his output does not exist; the block the proof names is off the best chain |
| Anyone verifying | the same: the rule sees only the proof, whose six headers still carry their work | — |

A client that runs its own node can see that the proof's block is off its best chain (`Btcd::on_best_chain`); what it may do with that, beside the rule's answer, is question 1.

## Questions for Nobody, allegedly

### Question 1. A payment counted, then taken back by the chain

*In plain words:* after six blocks, Bob's receipt says "paid", and so does Alice's claim. Then the chain reorganises, and the money goes back to Alice. Nothing in MOR can change: acts are never updated, and the rule only looks at the proof, which still looks fine. Should a payment, once it has six confirmations, count for good; or should someone be able to show that the chain took it back, and undo it?

*Precisely:* Finance knows four answers (valid, invalid, pending, unknown) and treats each as the answer for the act; it has no rule for an answer that was valid and is later overturned by the rail, nor for what was built on it (a discharged debt, a sale a collective recorded, a split's payouts, the next hop's forward, a theft-rule anchor). The rule cannot see a reorganisation (Production rule 12).

Options:
1. **Final at the Module's confirmations.** A proof with six confirmations counts for good; a deeper reorganisation is the payee's loss, a stated cost, as fraud on any rail outside MOR. A client running a node may show "the chain no longer holds this payment" as information, never changing an answer. Nothing new in Finance but the stated cost. *Cost:* whoever can rewrite six blocks of Bitcoin (a large share of the world's mining) keeps the goods and the money; the payee's recourse is outside Finance (a Law dispute naming the double spend).
2. **Undone by evidence.** Anyone may present a counter-proof (a heavier chain of headers without the block, with the conflicting transaction), and the answer becomes invalid; everything relying on the payment reopens. *Needs* a Finance rule for an answer that can be overturned, a rule input beyond the proof, and a rule for each act built on it. *Cost:* no on-chain payment is ever final, and two verifiers holding different evidence disagree.
3. **As 1, with a number of confirmations that grows with the amount**, set by the Module, so a large payment waits longer. A Module parameter, not a Finance rule; it narrows the cost of 1, not its kind.

*The session's lean, not built:* 1 (or 3): it keeps acts final and the rule pure; the case is an attack on Bitcoin itself. But it is a rare case with a real loss, so it is yours.

### Question 2. The theft rule meets a claim still pending

*In plain words:* to be protected if the payee's phone was stolen, a payer's wallet writes its claim the moment it pays and anchors it (rule 15). On-chain, at that moment the claim can only say "pending"; the claim that says "valid" exists an hour later. If the owner changes the locks in between, the payer who paid honestly, before the lock change, is not protected under the rules as they stand: the anchored claim was pending, and the valid one came after.

*Precisely:* rule 15(b) protects a payment whose payer's claim is anchored before or at the lock change's point. The core reads the payer's claims carrying the payment's rail proof whose answer is valid (`LawView::payers_claims`). On this rail the claim written at payment carries a pending proof (other bytes); the valid claim exists only after six blocks. Run offline (`modules/onchain/tests/finance.rs`, `a_payment_confirmed_after_the_lock_change_...`): two royalties paid at the same moment, both pending claims anchored at 100; the one confirmed before the point (anchored at 120) counts; the one confirmed after it (anchored at 170) counts for nothing, the payer bearing. The Lightning rail never meets this: its claim is valid the moment it is paid.

Options:
1. **The pending claim's anchor counts, once the same payment is proven valid.** Rule 15 reads the earliest anchor among the payer's claims of the same payment, provided one of them is valid. *Needs* "the same payment" (question 3). *Cost:* none found: a pending claim never confirmed protects nothing.
2. **Only a valid claim's anchor counts.** A lock change landing between payment and confirmation (about an hour on Bitcoin) leaves the payer bearing: a stated cost, and a client may tell payers to wait or to pay over Lightning. *Cost:* it bends F169's promise ("never on a payer whose payment … an earlier anchor shows").

*Lean, not built:* 1.

### Question 3. One payment, two proofs

*In plain words:* if the chain reorganises and the same payment is simply mined again in another block, it has two proofs, both of which look valid. MOR tells payments apart by their proofs, so Bob's receipt with one proof and Alice's claim with the other count as two payments: a debt of 2,000 paid with 1,000 shows as fully paid.

*Precisely:* rules 8a ("share a rail proof"), 10 ("name the same rail proof") and 15 identify a payment by its proof's bytes. The Module makes the proof unique for a payment in a given block (exactly six headers), so payer and payee hold the same bytes; a payment re-mined after a reorganisation has a second valid proof. Run offline (`one_payment_mined_again_after_a_reorganisation_counts_twice_...`): `paid_toward` gives 2,000 for one payment of 1,000.

Options:
1. **The commitment identifies the payment**: receipts and claims naming the same payment commitment (recomputed from the act and its proof's salt and paid-to) are one payment, whatever their rail proofs. *Needs* Finance's rules to read "the same payment" through the payment cMIP, since the core does not know the commitment. *Cost:* a payer who pays the same commitment twice (two outputs) is counted once; the salt makes that its own error.
2. **The rail Module identifies the payment** (on-chain: the transaction's output; on Lightning: the payment hash), and Finance reads "the same rail proof" as "the same payment as its Module identifies it".
3. **As now**, a stated cost, rare; it needs a reorganisation first. Under question 1's option 2, a counter-proof would undo the first proof; under its option 1, nothing would.

*Lean, not built:* 1 (it is one notion for every rail, already in the payment cMIP), which also answers question 2's need.

### To confirm with the Module

- **Six confirmations**, and **the floor on Bitcoin** (`0x170fffff`, difficulty about 2^44; a forged proof then costs about 0.8 of a block's work). Parameters of the Module; question 1's option 3 would make the first depend on the amount.

## Readings taken, to confirm

1. **"Paid, not yet settled" needs no new Finance state.** It is a pending verification answer, which Finance already has; rule 4 keeps the obligation open; the payee signs its receipt only once the rail shows the payment complete (payment cMIP, "Delivery"). The client shows "paid, not yet settled: k of 6". *The roadmap said receipts must show it: on this reading, no receipt exists before confirmation; the payer's claim shows it.*
2. **The payer writes a second claim** once the payment confirms; the claim written at payment stays pending forever (acts never change). Nothing forbids it; question 2 asks what the first one's anchor is worth.
3. **The request key is apart from the money key**, so a vault's Bitcoin key can stay offline. A thief with the request key can make the payee's side commit, never spend.
4. **The tweak is BIP 341's own** (the commitment as the Merkle root), so any Taproot wallet, or an offline signer given the commitment, spends it; a script multisig sits beside it as a branch.
5. **Exact amounts**: an output of another value is no payment under this Module (as on Lightning).
6. **The same units as Lightning** (one name per unit): a vault with an entry for regtest satoshis on each rail takes the smaller limit (F114), tested.
7. **The rail's kind is declared in code** (`RailModule::kind`) until the specification format has a field for it (F140 item 1, format open).

## Wording to change, not made

- Payment cMIP draft 2, rail Modules item 3: "Every rail Module written under this draft (the Lightning rail Module) is a request rail" → "… (the Lightning and on-chain rail Modules) …"; its freeze table: the on-chain rows (tip, vault, refusal, reorganisation, run on regtest).
- Finance draft 6, "Rail" definition and reasoning already name on-chain Bitcoin; nothing to change until the questions are answered.

## Tests

Before: Rust workspace 448 passed, 0 failed, 1 ignored (`main`, `ae40c1a`). After: **469 passed, 0 failed, 1 ignored**, the 21 new tests included (17 rule, 3 Finance, 1 end to end, run with `MOR_BTCD` set); the end-to-end test ran on regtest (btcd 0.24.2, checked against its release manifest) and four times in a row in 3.3 to 3.5 seconds.

*A test that failed first, for each rule built:* the rule was written as a stub answering unknown, and its 14 tests failed against it (13 for the rule, and the decoder test, whose failure was a wrong test vector: `0x21000001` fits in 256 bits; corrected to `0x23010000`). The three Finance tests passed at their first run: rule 14a was built in the core at step 12, and the on-chain rail plugs into it; the other two record what Finance does today, for questions 2 and 3. The end-to-end test failed first on btcd's way of reporting a block off its best chain, fixed in the client (`on_best_chain`).

The TypeScript clients were not touched; the WebAssembly did not change.

## The human test, on the Mac

Not needed for this step to stand; if wanted, the same command runs on the Mac with btcd for macOS (`modules/onchain/README.md`).
