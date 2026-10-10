# Step 14a: the pooled anchoring service on Bitcoin

*10 October 2026, night. Branch `claude/amazing-hypatia-nkwjwf`, not merged. One roadmap step: 14a, the pooled anchoring service on Bitcoin, completing the anchoring cMIP and the Bitcoin clock Module. Written for Nobody, allegedly: plain words first, then precise. Every mechanic chosen under the delegation of 10 October ("If the mechanic you find respect the rules we go ahead") is marked **(mechanic, the build's)**. Three questions come back to you, at the end, and four readings to confirm. Regtest only, test identities only, no real money.*

## In plain words

**What the service does.** Putting one fingerprint (a hash) on Bitcoin costs a whole transaction. So a service collects many fingerprints, builds a tree of them, and puts only the tree's top on the chain, hidden inside an ordinary-looking payment of a few hundred satoshis to its own key. Nothing on the chain says "this is an anchor": no OP_RETURN. Each person who wants a fingerprint anchored pays a small price over Lightning and receives a **ticket**, signed by the service: "your fingerprint goes into batch number n, and will be on the chain by block D."

**How cheating is caught.** For every batch, the service must publish a signed list: every fingerprint in the batch, and the transaction that carries it. Then:

1. **Left out, and provably so.** If batch n's list does not contain a fingerprint whose ticket said "batch n", two documents the service signed contradict each other. Anyone can check it, at once, without even looking at the chain.
2. **Never delivered.** If block D passes, and six more blocks pile up on it, and nobody can show an anchor of the fingerprint at or before D, the service has defaulted. It cannot answer except by showing the anchor, and it has none.
3. **Late.** An anchor after block D is a default too, though it still works as an anchor at its own block.

Each of these means the price is owed back.

**How slow the service may be.** The service publishes an offer with **urgency tiers**: each tier is a price and a number of blocks. In the tests: 2 blocks for 50 satoshis, 6 blocks for 20, a day (144 blocks) for 5. The numbers are the service's choice; the rule is that each tier's price and deadline are in the offer. Within a tier, the service can still choose, unseen, when your fingerprint lands, up to the deadline. That is the cost that remains, and a test pins it: a service working with a thief can hold back an owner's lock change by up to its tier's blocks, and a payment to the thief mined in between counts against the owner. The refund is the price, never the loss.

**What the service learns.** Not which act you anchored: you send a fingerprint mixed with a random secret of yours (a "blind"), and only you can later show which act it was. It does learn when you asked, from which network address unless you use Tor, how much you paid, and who you said you were in the payment, unless you pay as a one-time key.

**What it changes for the theft rule.** Until now, a lock change's moment on the Bitcoin clock had to be "stated" in the tests by hand. Now the home's receipt for the lock change is anchored by a real batch, checked by the Bitcoin clock Module, and Finance rule 15 reads it like any other anchor. A payment mined before that block counts; one mined after does not.

**What comes back to you.** Three questions (below): who pays when a batch costs more than the pool collected; where the refund obligation lives; and whether an owner's client should anchor a lock change through two services or by itself, which would add to rule 15's client conformance.

**What changed beyond anchoring.** **The core library did not change.** The WebAssembly and the clients are untouched. The on-chain rail's code was rearranged so the clock's batch rule reuses its block-and-header checks word for word; its answers are unchanged (every rail test passes as before). No format of Finance, Law or the core was touched.

## What was built, precisely

### The batch (`cmips/anchoring/src/tree.rs`, crate `mor-anchoring`, new)

- **Leaves, nodes, root, three tags:** a leaf is `H_leaf(act || blind)`, a node `H_node(left || right)`, the root `H_root(count || top)`, under `MOR/cmip/anchoring/leaf`, `…/node`, `…/root`, none of them the payment cMIP's commitment tag. So a batch root never equals a payment commitment, a one-leaf batch's root is not its leaf, and an inner node is never read as a leaf (review 7d; section 9, item 6). **(mechanic, the build's: the tags; the count in the root, eight bytes big-endian; the act and blind as the leaf.)**
- **One proof per leaf (F200 applied to the batch):** rows built as Bitcoin builds its own (an odd row repeats its last node); a proof holds only at the exact depth for its count, at an index below the count, and wherever a sibling equals the running hash only at the left position. A batch never holds two equal leaves. **(mechanic, the build's: Bitcoin's repeated node kept, so a batch reads as a block does; the bit rule kept beside the count bound.)**

### The anchoring rule, a sibling of the rail's (`modules/onchain/src/clock.rs`)

- **A batch anchor** (`BatchAnchor`): the blind, the leaf's index, count and branch, the key, an optional script tree, the transaction (without witness), the output, and the block as the rail's proof carries it. **(mechanic, the build's: the shape.)**
- **The rule** (`BitcoinClock::batch_anchor`, and through the core's unchanged `AnchoringCmip::verify` for `Anchors::add_proof`): the leaf gives the root; the output pays the key tweaked by the root (BIP 341, exactly as the rail tweaks by a commitment; checked against rust-bitcoin); **no amount matched**; then the rail's own steps 8 to 11, now one shared function (`confirmed` in `modules/onchain/src/lib.rs`): canonical position in the block, headers checked against the chain the verifier follows (F204), exactly six confirmations (F205, the rail's number). The point is the block's height (F201).
- **For the service's judgment** the same rule reads a leaf instead of an act and blind (`BatchClock::leaf_point`), since the service never holds the act.

### The pooled service (`cmips/anchoring/src/service.rs`, new)

- **Three acts** the service's identity signs, types of the anchoring cMIP: **offer** (reference, pointer, unit, tiers), **ticket** (offer, leaf, payment commitment, tier, batch number, deadline), **publication** (offer, batch number, its leaves, transaction and output). **(mechanic, the build's: the types and payloads.)**
- **A hash paid for over Lightning:** the payment commitment pays the tier's price to the service, following the offer's pointer as a tip follows a pointer, so the payment cMIP and the Lightning rail Module verify it with no new notion. The invoice is a real BOLT 11 invoice committing to the commitment, signed by a test node key. **(mechanic, the build's: following the pointer; reading R3.)**
- **The judgment** (`service::judge`), in order: not paid (nothing owed); **omitted** (a publication of the ticket's batch without its leaf, or whose leaves make no batch); **anchored** at or before the deadline; **late**; **default** once the deadline is buried at the clock's depth (the tip at deadline + 5); otherwise pending. Each default names the refund: the tier's price. **(mechanics, the build's: the ticket names its batch; the leaves listed in the publication; the default read on the verifier's own chain at deadline + depth − 1; readings R1, R2, R4.)**
- **Client conformance** (`service::acceptable`): before paying, the payer's client checks the ticket names its offer, leaf and commitment, the commitment pays exactly the tier's price to the service through the pointer, and the deadline is after its own tip and no later than its tip plus the tier's blocks plus **one block of slack**. **(mechanic, the build's: the slack.)**

### Rule 15 on the Bitcoin clock, with no stated anchor

`modules/onchain/tests/finance.rs`, `on_the_bitcoin_clock_a_lock_changes_point_is_its_home_receipts_batch_anchor`: the home receipt of Ana's lock change is anchored in a batch; the point the quorum gives is the batch's block; a royalty to the thief mined before it counts, one mined after does not. Run again with the service holding the receipt back two blocks (its urgent tier): the point moves two blocks later and a royalty mined in between counts against Ana. That is reading 4 of F220 delivered: "a lock change's point on the Bitcoin clock needs its home receipts anchored on Bitcoin, which step 14a's service does."

### End to end on regtest (`harness/tests/anchoring.rs`)

One btcd node (0.24.2, archive SHA-256 checked against `modules/onchain/README.md`), a throwaway home, five test identities. The service publishes its pointer and offer as acts. Four payers each read the offer from the home, post an act, pay for its leaf over Lightning (real invoices, test node key, no Lightning node running), and check the ticket act the service signs. The service anchors batch 0 (Ana's and Ben's leaves) in one regtest transaction, a 330-satoshi Taproot output to its key tweaked by the root, no OP_RETURN, and publishes the batch as an act. A third party reading the home and the node's headers verifies both inclusions; Ana and Ben each anchor their act on the Bitcoin clock with their blind. Cal's ticket said batch 0 and the publication leaves him out: **omitted, 20 owed**. Dan's batch 1 never comes: once block 502 is six deep, **default, 50 owed**. About 7 seconds.

### Texts

New: the anchoring cMIP **draft 2** (`cmips/cmip-anchoring-draft-2.md`) and the Bitcoin clock Module **draft 2** (`modules/module-bitcoin-clock-draft-2.md`); drafts 1 kept, each with a line saying it is superseded. The on-chain rail Module's pointer to the clock Module updated. READMEs (`cmips/`, `modules/`, `modules/onchain/`, new `cmips/anchoring/`), the roadmap (step 14a) and the findings log ("Step 14a built") updated. **Not touched:** the core, the six MIPs, the freeze suite, Finance's clock format, rule 15, Law's deal forks, the clients.

## The review's items, settled

| Item (review, 7d and section 9) | Settled as | Where |
| --- | --- | --- |
| 7d, 6. Same tweak, two meanings; the canonical proof for the batch | Domain-separated leaf, node and root; the count bound; the canonical rule | cMIP items 5 to 7; `tree.rs`; `tests/batch.rs`, `tests/anchor.rs` |
| 1. The floor decides the theft rule | Already answered by F204: batch anchors are checked against the chain followed | clock Module, rule step 5 |
| 2. Omission not provable under pay-to-contract | Each batch published with its leaves and transaction in a signed act; the ticket names its batch; default as non-delivery by a deadline on the offer's reference | cMIP items 9, 12; `service.rs`; `tests/service.rs`; regtest |
| 3. Selective delay | Priced tiers in the offer, deadlines in blocks (2, 6, 144 in the tests); the delay that remains stated and pinned | cMIP items 14, 15; `tests/service.rs`, `tests/finance.rs` |
| 4. The point is the block | Already F201; batch anchors use it | clock Module |
| 5. Final at N | Six, the rail's number (F205, F220) | clock Module, rule step 5 |
| 7. Step 6 does not fit an anchor | A sibling rule: same tweak and header checks, no amount | clock Module, "A batch anchor" |
| 8. Privacy through the service | The service never learns the act (the blind); what it does learn, stated | cMIP items 16 to 20 |
| 9. The request endpoint | What its operator learns, stated; a hosted endpoint for payees not built | cMIP item 16, "Not built" |

## Stated costs, in one list

- **Selective delay within a tier**: the service decides, unseen, when each paid hash lands, up to its tier's deadline (2 blocks at the urgent tier in the tests); against an owner's lock change it lets payments to a thief mined in that window count (pinned). A default refunds the price, never the loss.
- **A refusal to sell** is visible; the payer goes elsewhere or anchors its own act (anyone may anchor any act, F169).
- **Fee spikes**: an honest service either pays the fee a deadline needs or defaults; the urgent tier's price carries it.
- **Publication size**: 32 bytes per leaf, the price of making omission provable.
- **The blind**: lost, the anchor cannot be used; guessable, the act can be tested against published leaves (client conformance: 32 random bytes).
- **Timing at the endpoint**: a named payer asking for an anchor right after an on-chain payment of a listed price is linkable by the service (weaker than before, since it never sees the act); avoided by a one-time payer key and Tor, not by the cMIP.
- **Public by design**: each publication ties its transaction to the service; batch sizes and moments are public; the pool's coins link batches.
- **A batch costs a transaction and a dust output** (330 satoshis under Bitcoin's relay rules) whatever its size.
- **A rewrite deeper than six blocks** leaves an anchor dangling (F205), final for whoever counted it (F220).

## Questions for Nobody, allegedly

### Q1. When a batch costs more than its pool collected, who pays the output and the fee?

*In plain words:* the service sold ten fingerprints at 20 satoshis (200 in all), but the transaction needs a 330-satoshi output and a fee of 2,000 because the network is busy. Someone pays the gap.

*Laid beside it:* the roadmap's step 14a: "who pays when a batch costs more than the pool, stated in advance, and exact division of one fee among many payers"; review section 9, item 7: "who pays the output and the fee when the batch costs more than the pool is the roadmap's own open item"; your decided rule for omission (this step's brief, item 2): the default is non-delivery by a deadline.

*As built:* nothing in the rule looks at cost. A service that does not anchor by the deadline defaults and owes the price back. So in effect the service bears the gap, or defaults.

*Options, none built:*
1. **The service bears** (as built). Its prices, per tier, must carry the fee risk. *Cost:* in a long fee spike a small service defaults on every ticket and refunds; cheap tiers may be unviable.
2. **The offer states a shortfall rule in advance**, for example: a batch is sent only once the pool covers it, and the deadline moves until then. *Cost:* the deadline is no longer fixed when you pay, which reopens selective delay (review item 3).
3. **The payers of the batch share the gap**, divided exactly (Law's exact division of one fee among many payers). *Cost:* a payer does not know the full price when it pays; needs a second payment or a deposit.

*Lean of the build:* 1, with the tiers priced for it, since it keeps the deadline fixed, which is what makes the default provable and bounds selective delay.

### Q2. Where does the refund owed on a default live?

*In plain words:* the service defaulted and owes Cal 20 satoshis back. Is that a Finance debt any wallet sees, or a matter of the offer's terms, which only a client that reads Law understands?

*Laid beside it:* the roadmap: "a paid hash missing after the deadline is a provable default and a refund"; Finance rule 10a (a refund owed to whoever signs with the bare key the payment committed to) and rule 10c ("money received for nothing, owed back to the payer as a refund"); "Finance never depends on Law: a Finance-only client, such as a wallet that sends tips, is a complete client."

*As built:* the judgment names the amount owed; no refund obligation is written and no refund is paid (the regtest test prints "owed").

*Options, none built:*
1. **Finance, by rule 10a's path:** a default is money received for nothing; the refund is owed to the payer the commitment names (an identity, or the bare key, F113) and shown repaid by the service's claim naming the payment refunded. A Finance-only wallet that bought an anchor sees it. *Cost:* a reading of rule 10a beyond purchases, which is yours.
2. **The offer's terms (Law):** the offer is a standing offer with a refund clause; a default is a breach judged under it. *Cost:* a Finance-only wallet cannot see its own refund; the anchoring cMIP depends on Law.

*Lean of the build:* 1, because anchoring is bought by wallets that may read Finance only, and the evidence (ticket, payment, publication) is already enough to show the money was received for nothing.

### Q3. Should an owner's client anchor a lock change through two services, or by itself?

*In plain words:* the remaining lever is a service, working with a thief, holding back the owner's lock-change receipt up to its tier's deadline (two blocks at the urgent tier in the tests). Anchoring the same receipt through two services, or with the owner's own transaction, closes it: the earliest anchor counts.

*Laid beside it:* F181, item 6: "After a lock change, the owner's client **MUST** obtain the quorum's home receipts and anchor them on the main reference (client conformance)"; F169: "you should anchor, we just don't specify how"; F178: each act judged by its earliest anchor.

*As built:* nothing added to rule 15. The cMIP states the delay as a cost and says anyone may anchor any act and the earliest counts; the test pins the cost.

*Options:*
1. **Leave rule 15 as it is**: the delay within a tier is a stated cost of anchoring through one service.
2. **Add to F181's client conformance**: the owner's client SHOULD anchor a lock change's receipts through two independent services, or by its own transaction, at the urgent tier. *Cost:* two prices, or one on-chain fee, per lock change (rare events).

*Lean of the build:* 2, as a SHOULD: lock changes are rare, and this is the one place a service's delay decides who bears a theft. It changes rule 15's client conformance text, so it is yours.

## Readings to confirm

1. **A leaf moved to a later batch is an omission** from the batch its ticket named, even if the later batch is mined by the deadline: the ticket is the service's promise, and that is what makes a publication able to contradict it. The anchor still counts as an anchor.
2. **Late is a default**: an anchor after the deadline owes the price back, and still counts as an anchor of the act at its block.
3. **A payment for a hash follows the service's payee pointer as a tip does** (Finance rule 14), so Finance verifies it with no new notion; the anchoring offer is an act of the anchoring cMIP, not a Law offer, and the payment does not name it (the ticket does).
4. **The default is read on the verifier's own chain**, once its tip reaches the deadline plus five (a block at the deadline would then have six confirmations).

## Tests

**Before** (the starting commit `0981364`, with `MOR_BTCD` set, btcd 0.24.2): Rust workspace **516 passed, 0 failed, 1 ignored**.

**After:** Rust workspace **534 passed, 0 failed, 1 ignored**, with `MOR_BTCD` set (the regtest on-chain test and the new regtest anchoring test both run).

New in this step (18): `cmips/anchoring/tests/batch.rs` 5; `modules/onchain/tests/anchor.rs` 5; `modules/onchain/tests/service.rs` 6; `modules/onchain/tests/finance.rs` 1; `harness/tests/anchoring.rs` 1 (regtest). The rail's rule refactored into a shared function: its 19 rule tests, 10 review tests and the regtest test unchanged and passing.

**A test that failed first, for each change:** the batch tree (all five failed against a plain tree without tags, count or canonical rule, then passed); the batch anchor (all five failed against the draft 1 clock, which accepted no batch proof, then passed); the service (all six failed against a judgment that always answered pending and a client check that accepted everything, while the Lightning payments in them already verified valid); the lock change's batch-anchored point (failed with the clock's batch check switched back to accepting nothing, passed with it on). *Not failing first:* the regtest end-to-end test, written after the code it drives; every mechanism it runs is pinned by a test above that failed first.

## Not done

- **A refund actually paid** (waits on Q2), and the shortfall rule (Q1).
- **The pool as visible custody** and the conversion from Lightning to on-chain with receipts per hop (roadmap 14a's wording); **a hosted request endpoint** for payees who do not run their own.
- **A Lightning node** in the regtest test: invoices are real and signed by a test node key, settled by their preimages, but no channel moves money (step 12's Lightning regtest network was not started).
- The RV32IM programs (Production rule 12) for the clock's rules.
- Real money, real identities: regtest only, test identities only.
