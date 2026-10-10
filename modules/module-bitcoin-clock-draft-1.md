*Superseded, 10 October 2026, by draft 2 (`modules/module-bitcoin-clock-draft-2.md`, roadmap step 14a, `docs/anchoring-step-14a.md`). Kept as written.*

# Module: Bitcoin clock

*Draft 1, 10 October 2026 (findings F201, F202, F204 and F205; `docs/onchain-rail-f200-f205-build-2026-10-10.md`). **EXPERIMENTAL. Not approved, not a product, not for real money.** A clock Module under the anchoring cMIP draft 1 (`cmips/cmip-anchoring-draft-1.md`), which its field 5 names. Written only as far as F201 to F205 need: **batch anchors, the pooled anchoring service's proofs, are roadmap step 14a's and are not defined here.** Its hash stays a draft hash until its creator is named at step 17. Not core: frozen at publication, competing with any other Bitcoin clock Module.*

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

*The Bitcoin chain is a clock: each block comes after the one before, and nobody can put a block back in time. This Module reads it as one. A moment on it is a block. Where an owner has declared Bitcoin as its clock, an on-chain payment needs nothing more to be anchored: the block that holds it is its moment, and the theft rule asks whether that block came before or at the block of the owner's lock change. "Yes, that is the whole idea of anchoring via Bitcoin, no?" (Nobody, allegedly, deciding F201.)*

## The reference

`[ this Module's spec hash, network: uint ]`, the network numbered as the on-chain rail Module numbers it (0 Bitcoin, 1 testnet, 2 signet, 3 regtest). *One reference per network: a regtest anchor never compares with a Bitcoin one.*

## The point

**The block** (anchoring cMIP, F201): the height, on the chain the verifier follows, of the block carrying the anchor. **The chain followed** is the headers the client hands over, as the on-chain rail Module defines them (its "The chain the verifier follows", F204): from the network's genesis, each building on the one before; a block not on that chain gives no point.

## The depth

**An anchor counts at the on-chain rail Module's N confirmations, six** (F205: one number for payments and anchors), on the chain followed. Once counted it stays counted: a rewrite of Bitcoin deeper than that is a stated cost (below).

## The proofs it accepts

1. **An on-chain payment** (F201), under the on-chain rail Module draft 2: the anchoring cMIP's "commitment naming its act". The act is a receipt or claim; the verifier recomputes its payment commitment under the payment cMIP and runs the on-chain rail's rule on the act's proof, with the chain followed. Where the rule answers valid, the anchor places the act at the height of the payment's block. Otherwise there is no anchor: pending, short of the depth, a block off the chain followed, invalid, or another rail.
2. **A batch anchor**: roadmap step 14a. Not defined in this draft; no such proof is accepted.

**This Module reads the on-chain rail's proofs as payments' anchors** (F201): on this clock, Finance rule 15 compares the payer's valid claims of a payment, the payment's block among their anchors, and a pending claim's anchor counts for nothing (Finance rule 15, F203 applying only on other clocks). *Declared as the pair (this Module, the on-chain rail Module); format open, as a rail's kind is (F140 item 1).*

## Costs, stated

- **Headers kept, or a header service trusted** (F204): about 75 MB of Bitcoin headers in 2026, about 4 MB more a year; a client relying on a header service trusts it, and MUST say so (client conformance).
- **A rewrite deeper than six blocks** (F205) leaves an anchor pointing at a block no longer on the chain; nothing reopens. *It has happened twice on Bitcoin, from software faults (August 2010, about 53 blocks; March 2013, about 24 blocks); an attack needs a majority of the hash rate.*
- **Points are coarse**: a block every ten minutes on average, and two anchors in one block are at the same point; "before or at" counts the lock change's own block for the payer.
- **A lock change's point on this clock** needs its home receipts anchored here, which is step 14a's service; until it is built, a client states those anchors.

## Reference implementation

`modules/onchain/src/clock.rs` (crate `mor-onchain`): the reference, the pair it declares, and an on-chain payment's anchor (`BitcoinClock::payment_anchor`), tested in `modules/onchain/tests/finance.rs`. Regtest only before step 17.
