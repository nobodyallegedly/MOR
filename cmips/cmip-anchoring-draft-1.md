*Superseded, 10 October 2026, by draft 2 (`cmips/cmip-anchoring-draft-2.md`, roadmap step 14a, `docs/anchoring-step-14a.md`). Kept as written.*

# cMIP: Anchoring

*Draft 1, 10 October 2026 (findings F201, F202 and F204; `docs/onchain-rail-f200-f205-build-2026-10-10.md`). **Experimental, not approved:** an instrument for testing the core, not a product. It fills the Envelope's anchoring task (Envelope draft 7, "Anchoring", F173). Written only as far as F201, F202 and F204 need: **the pooled anchoring service of roadmap step 14a (batches, payment per hash, omission, deadlines, urgency tiers) is not written here; it is that step's.** Its hash stays a draft hash until its creator is named at step 17. Not core: a founding cMIP, frozen at publication, competing with any other anchoring cMIP.* *Decided by Nobody, allegedly, 10 October 2026 (F202): "We need tu ensure that anchoring to multiple clocks is possible, cMIP is the anchoring, modules are the clocks."*

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

*MOR has no clock. To show that an act existed by some moment, someone puts its fingerprint on a clock everyone can read: the Bitcoin chain, or a timestamp service. This cMIP says what such an "anchor" is and how two anchors are compared; each clock is a Module under it, the way each payment rail is a Module under the payment cMIP. An act may be anchored on many clocks; an owner names the one that decides its theft rule (Finance, "clock").*

## Anchors

1. **An anchor** places one act at one **point** on one **time reference**. A time reference is a clock Module under this cMIP and its parameters: `[ clock Module's spec hash, parameters ]`, the shape Finance's clock entry and Law's time reference take.
2. **Comparing.** Two anchors compare only on the same reference (the same Module, the same parameters); anchors on references that cannot be compared order nothing. On a reference, an act is judged by its earliest anchor there (F178).
3. **Anyone may anchor any act** (F169, F173). An act may carry anchors on any number of references.
4. **A clock Module MUST define:** its parameters; its points, as a total order the core compares as unsigned integers; the proofs it accepts and the rule checking them (Production rule 12), naming any data the rule reads that the client supplies (a chain's headers, F204); and the depth at which a proof counts, where its clock can be rewritten.

## The point on a clock that counts blocks (F201)

On a clock whose points are blocks of a chain, **the point is the block**: an anchor's point is the height of the block that carries it, on the chain the verifier follows (F204). Two anchors in one block are at the same point, so "before or at" holds between them. *Defined once here, used by the Bitcoin clock Module, the on-chain rail and step 14a alike.*

## Anchoring a commitment that names its act (F201)

A clock Module MAY accept, in place of an act id, **a commitment that names its act**: a hash the act determines under the specification that defines it. *The one such commitment so far is the payment cMIP's: a receipt or claim recomputes it. A payment made on the clock's own chain then anchors that receipt or claim at the payment's block.* The anchor so placed shows that what the commitment binds (the payment) existed by that point; the act itself is written later. *Finance rule 15 compares exactly that: whether a payment was made before or at a lock change's point.* A clock Module that accepts it says which commitments, and the verifier recomputes the commitment from the act before the Module's rule runs.

*Chosen by the build under the delegation (F201's technical wording left the choice: the payment's commitment to carry the request act's id, or the anchoring task to accept a commitment naming its act, "whichever the build finds smaller"): this one. Making the commitment carry an act id would change every commitment hash on every rail, and no act exists before the payment to name; accepting a commitment changes nothing already written.*

## Data a clock's rule reads (F204)

A clock Module's rule MAY name data the client supplies with the proof, such as the headers of a chain; the client hands them over as input (Production rule 12), and the rule never fetches them. A client that holds none gets the answer the rule gives without them.

## For step 14a, not written here

The pooled anchoring service: batches and their Merkle tree (domain-separated, with the canonical index, so a batch root never equals a payment commitment and an inner node is never a leaf: review, 7d and section 9, item 6); paid now, anchored later, with a deadline on a named reference; omission as non-delivery by the deadline, with each batch's root published in a signed act (section 9, item 2); selective delay (item 3); who pays when a batch costs more than the pool; urgency tiers; and what the service learns (item 8).

## Freeze scenarios

Through the Bitcoin clock Module: an on-chain payment's proof anchors its claim at its block; anchors compare on one reference only; a lock change anchored at a block and a payment mined before or at it, or after it (`modules/onchain/tests/finance.rs`). The rest at step 14a.
