# Module: Bitcoin clock

*Draft 2, 10 October 2026 (roadmap step 14a; `docs/anchoring-step-14a.md`). Draft 1 (findings F201, F202, F204 and F205) is kept unchanged except where draft 2 adds the batch anchor, its rule, and the costs it brings. **EXPERIMENTAL. Not approved, not a product, not for real money.** A clock Module under the anchoring cMIP draft 2 (`cmips/cmip-anchoring-draft-2.md`), which its field 5 names. *Revised in place, 10 October 2026 (night, step 14a's second pass, `docs/anchoring-second-pass.md`): one stated cost now points to F228 and the anchoring cMIP draft 3; no rule changed.* Its hash stays a draft hash until its creator is named at step 17. Not core: frozen at publication, competing with any other Bitcoin clock Module.*

*Reading this document: normal text is the specification. Italic text is commentary. Choices the build made under the delegation of 10 October 2026 are marked **(mechanic, the build's)**.*

## In plain words

*The Bitcoin chain is a clock: each block comes after the one before, and nobody can put a block back in time. This Module reads it as one. A moment on it is a block. Where an owner has declared Bitcoin as its clock, an on-chain payment needs nothing more to be anchored: the block that holds it is its moment, and the theft rule asks whether that block came before or at the block of the owner's lock change. "Yes, that is the whole idea of anchoring via Bitcoin, no?" (Nobody, allegedly, deciding F201.) Draft 2 adds the other way onto this clock: a batch of fingerprints, put on the chain by an anchoring service inside an ordinary-looking payment to its own key, so that anything, a home's receipt for a lock change among them, can be given a block.*

## The reference

`[ this Module's spec hash, network: uint ]`, the network numbered as the on-chain rail Module numbers it (0 Bitcoin, 1 testnet, 2 signet, 3 regtest). *One reference per network: a regtest anchor never compares with a Bitcoin one.*

## The point

**The block** (anchoring cMIP, F201): the height, on the chain the verifier follows, of the block carrying the anchor. **The chain followed** is the headers the client hands over, as the on-chain rail Module defines them (its "The chain the verifier follows", F204): from the network's genesis, each building on the one before; a block not on that chain gives no point.

## The depth

**An anchor counts at the on-chain rail Module's N confirmations, six** (F205: one number for payments and anchors), on the chain followed. Once counted it stays counted: a rewrite of Bitcoin deeper than that is a stated cost (below; F220: final for whoever counted it).

## The proofs it accepts

1. **An on-chain payment** (F201), under the on-chain rail Module draft 2: the anchoring cMIP's "commitment naming its act". The act is a receipt or claim; the verifier recomputes its payment commitment under the payment cMIP and runs the on-chain rail's rule on the act's proof, with the chain followed. Where the rule answers valid, the anchor places the act at the height of the payment's block. Otherwise there is no anchor: pending, short of the depth, a block off the chain followed, invalid, or another rail.
2. **A batch anchor** (step 14a): the anchoring cMIP's batch, its root committed by pay-to-contract.

**This Module reads the on-chain rail's proofs as payments' anchors** (F201): on this clock, Finance rule 15 compares the payer's valid claims of a payment, the payment's block among their anchors, and a pending claim's anchor counts for nothing (Finance rule 15, F203 applying only on other clocks). *Declared as the pair (this Module, the on-chain rail Module); format open, as a rail's kind is (F140 item 1).*

## A batch anchor

`batch-anchor = [ blind: bstr .size 32, index: uint, count: uint, branch: [ * bstr .size 32 ], key: bstr .size 32, tree: bstr .size 32 / null, tx: bstr, output: uint, ? block ]`, `block = [ index: uint, branch: [ * bstr .size 32 ], headers: [ + bstr .size 80 ] ]`, the block as the on-chain rail's proof carries it. **(mechanic, the build's: the shape; `tree` beside the root as the rail allows one.)**

**The rule**, for an act, a sibling of the on-chain rail's (review section 9, item 7): the same tweak and the same header checks, **no amount to match**.

1. **The shapes.** Invalid otherwise.
2. **The leaf.** `H_leaf(act || blind)`, the anchoring cMIP's leaf, at `index` in a batch of `count` leaves with `branch`, under the cMIP's rule for one proof per leaf (domain-separated, the count bound, F200 applied to the batch), gives the batch root. Invalid otherwise.
3. **The tweak.** Output `output` of `tx` (one transaction without its witness) is a Taproot output paying `key` tweaked by that root, BIP 341's tweak, beside `tree` where one is given, exactly as the on-chain rail Module tweaks a payment's address by its commitment. Invalid otherwise. **Its value is not read.**
4. **Not mined:** pending.
5. **In the block, on the chain followed, at the depth:** the on-chain rail rule's steps 8 to 11, unchanged: the transaction at its one canonical position in the proof's block (F200), under headers that build on each other and meet their targets; that block on the chain the verifier follows, of the reference's network (F204), unknown otherwise; exactly six headers on the proof and on the chain held (F205): fewer, pending; more, invalid (truncate to six, client conformance, as on the rail).
6. **Valid:** the anchor places the act at the block's height on this Module's reference.

*Anyone may make a batch anchor, of a batch of one, with its own key (F169): a service is a convenience, not a gate. The key is not declared anywhere: what proves the anchor is the chain, not who holds the key.* For the pooled service's judgment the same rule reads a leaf in place of an act and a blind (steps 2 to 6), since the service holds the leaf and never the act.

## Costs, stated

- **Headers kept, or a header service trusted** (F204): about 75 MB of Bitcoin headers in 2026, about 4 MB more a year; a client relying on a header service trusts it, and MUST say so (client conformance).
- **A rewrite deeper than six blocks** (F205) leaves an anchor pointing at a block no longer on the chain; nothing reopens. *It has happened twice on Bitcoin, from software faults (August 2010, about 53 blocks; March 2013, about 24 blocks); an attack needs a majority of the hash rate.*
- **Points are coarse**: a block every ten minutes on average, and two anchors in one block are at the same point; "before or at" counts the lock change's own block for the payer.
- **A lock change's point on this clock** is its home receipts' anchors here: through the pooled service, at the service's pace within its tier (the anchoring cMIP, item 15), or by the owner's own transaction. Its owner's client SHOULD anchor them through two independent services, or by its own transaction (Money rule 15's client conformance, F226): the earliest counts.
- **A batch anchor costs a transaction** and at least a dust output (330 satoshis for a Taproot output under Bitcoin's relay rules), whatever the batch's size; the anchoring cMIP's pooled service shares it. Who bears a batch costing more than its tickets brought is the service, under its own terms (F228; anchoring cMIP draft 3, item 13a).
- **A key-path spend of a batch output reveals nothing**; a script-path spend, where a `tree` is given, publishes the key and the batch root, as on the rail (review section 8, behaviour 2).

## Reference implementation

`modules/onchain/src/clock.rs` (crate `mor-onchain`): the reference, the pair it declares, an on-chain payment's anchor (`BitcoinClock::payment_anchor`), a batch anchor (`BatchAnchor`, `BitcoinClock::batch_anchor`, the core's `AnchoringCmip::verify`), and the leaf reading the service's judgment uses (`BatchClock`). Tested in `modules/onchain/tests/finance.rs`, `tests/anchor.rs` and `tests/service.rs`, and end to end on regtest in `harness/tests/anchoring.rs`. Regtest only before step 17.
