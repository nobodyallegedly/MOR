*Superseded, 10 October 2026 (night), by draft 3 (`cmips/cmip-anchoring-draft-3.md`, step 14a's second pass, `docs/anchoring-second-pass.md`). Kept as written.*

# cMIP: Anchoring

*Draft 2, 10 October 2026 (roadmap step 14a; `docs/anchoring-step-14a.md`). Draft 1 (findings F201, F202 and F204) is kept unchanged in its first five sections; draft 2 adds the batch, the pooled anchoring service, omission and default, urgency tiers, and what the service learns. **Experimental, not approved:** an instrument for testing the core, not a product. It fills the Envelope's anchoring task (Envelope draft 7, "Anchoring", F173). Its hash stays a draft hash until its creator is named at step 17. Not core: a founding cMIP, frozen at publication, competing with any other anchoring cMIP.* *Decided by Nobody, allegedly, 10 October 2026 (F202): "We need tu ensure that anchoring to multiple clocks is possible, cMIP is the anchoring, modules are the clocks."*

*Reading this document: normal text is the specification. Italic text is commentary. Every choice the build made under the delegation of 10 October 2026 ("If the mechanic you find respect the rules we go ahead") is marked **(mechanic, the build's)**.*

## In plain words

*MOR has no clock. To show that an act existed by some moment, someone puts its fingerprint on a clock everyone can read: the Bitcoin chain, or a timestamp service. This cMIP says what such an "anchor" is and how two anchors are compared; each clock is a Module under it, the way each payment rail is a Module under the payment cMIP. An act may be anchored on many clocks; an owner names the one that decides its theft rule (Finance, "clock").*

*Putting one fingerprint on Bitcoin costs a transaction. So a service gathers many, builds a tree of them, and puts only the tree's top on the chain, hidden inside an ordinary-looking payment to its own key (pay-to-contract, no OP_RETURN). Each payer pays a small price per fingerprint over Lightning and gets a ticket: "your fingerprint goes into batch number n, on the chain by block D". The service then publishes every batch: its list of fingerprints and the transaction carrying it. If the list leaves a paid fingerprint out, the ticket and the list, both signed by the service, prove it. If nothing comes by block D, that is a default. Either way the price is owed back. The faster the deadline, the higher the price, and each price is in the service's published offer. The service never learns which act it anchored: the payer sends a fingerprint mixed with a random secret.*

## Anchors

1. **An anchor** places one act at one **point** on one **time reference**. A time reference is a clock Module under this cMIP and its parameters: `[ clock Module's spec hash, parameters ]`, the shape Finance's clock entry and Law's time reference take.
2. **Comparing.** Two anchors compare only on the same reference (the same Module, the same parameters); anchors on references that cannot be compared order nothing. On a reference, an act is judged by its earliest anchor there (F178).
3. **Anyone may anchor any act** (F169, F173). An act may carry anchors on any number of references.
4. **A clock Module MUST define:** its parameters; its points, as a total order the core compares as unsigned integers; the proofs it accepts and the rule checking them (Production rule 12), naming any data the rule reads that the client supplies (a chain's headers, F204); and the depth at which a proof counts, where its clock can be rewritten.

## The point on a clock that counts blocks (F201)

On a clock whose points are blocks of a chain, **the point is the block**: an anchor's point is the height of the block that carries it, on the chain the verifier follows (F204). Two anchors in one block are at the same point, so "before or at" holds between them. *Defined once here, used by the Bitcoin clock Module, the on-chain rail and the pooled service alike.*

## Anchoring a commitment that names its act (F201)

A clock Module MAY accept, in place of an act id, **a commitment that names its act**: a hash the act determines under the specification that defines it. *The one such commitment so far is the payment cMIP's: a receipt or claim recomputes it. A payment made on the clock's own chain then anchors that receipt or claim at the payment's block.* The anchor so placed shows that what the commitment binds (the payment) existed by that point; the act itself is written later. *Finance rule 15 compares exactly that: whether a payment was made before or at a lock change's point.* A clock Module that accepts it says which commitments, and the verifier recomputes the commitment from the act before the Module's rule runs.

*Chosen by the build under the delegation (F201's technical wording left the choice: the payment's commitment to carry the request act's id, or the anchoring task to accept a commitment naming its act, "whichever the build finds smaller"): this one. Making the commitment carry an act id would change every commitment hash on every rail, and no act exists before the payment to name; accepting a commitment changes nothing already written.*

## Data a clock's rule reads (F204)

A clock Module's rule MAY name data the client supplies with the proof, such as the headers of a chain; the client hands them over as input (Production rule 12), and the rule never fetches them. A client that holds none gets the answer the rule gives without them.

## The batch

5. **A batch** is a list of distinct **leaves**, at least one, in an order its maker chooses. Each leaf is `H_leaf(act || blind)`: the act anchored (its id, 32 bytes) and a **blind** of 32 bytes. The batch's tree is built as Bitcoin builds a block's: each row hashed in pairs, an odd row's last node paired with itself, `H_node(left || right)`, up to one top node; the **batch root** is `H_root(count || top)`, `count` the number of leaves as eight bytes, big-endian. `H_leaf`, `H_node` and `H_root` are the core's tagged hashes under `MOR/cmip/anchoring/leaf`, `MOR/cmip/anchoring/node` and `MOR/cmip/anchoring/root`. **(mechanic, the build's: the tags, the count in the root, Bitcoin's repeated node, the act and blind as the leaf.)**
6. **Domain separation** (review 7d; section 9, item 6). A leaf, a node and a root are hashes under three distinct tags, none of them the payment cMIP's commitment tag. So a batch root never equals a payment commitment (a maker choosing its leaves cannot make its output read as a payment on the on-chain rail, nor a payment's output read as a batch), a batch of one leaf has a root that is not the leaf, and an inner node is never read as a leaf.
7. **One proof per leaf** (F200, applied to the batch). A leaf's proof is its index, the count, and its branch (the siblings from the leaves up). It holds where the branch is exactly as long as the tree of `count` leaves is deep, the index is below the count, and, wherever a sibling equals the running hash, the index's bit at that level is 0; it then gives the root. *With the count bound into the root, an index past the leaves is refused, and that is where Bitcoin's twin index falls; the bit rule is kept as the on-chain rail keeps it, so a batch reads as a block does.* A batch never holds two equal leaves: one payment, one leaf.
8. **A batch anchor** is a clock Module's proof that a batch root was committed at a point of its clock, with a leaf's proof under that root. A clock Module that carries batches defines its batch anchor and its rule (the Bitcoin clock Module: the root committed by pay-to-contract to a Taproot output, no OP_RETURN). The anchor places the leaf's act at that point; whoever shows it shows the blind.

## The pooled anchoring service

*Roadmap step 14a: "an anchoring service paid per hash over Lightning pools the requests and commits each batch in one on-chain transaction, by pay-to-contract rather than OP_RETURN where it holds in practice." It holds in practice: the regtest test anchors a batch so (`harness/tests/anchoring.rs`).*

9. **Three acts.** A pooled service publishes, signed by its identity, acts of three types of this cMIP **(mechanic, the build's: the types and their payloads)**:
   - **Offer** (type 1): `{ 0: reference, 1: pointer, 2: unit, 3: [ + [ price, blocks ] ] }`: the time reference it anchors on; the payee pointer every payment for a hash follows; the unit of its prices; its **tiers**, most urgent first, each the price of one hash and the most points (on Bitcoin, blocks) it may take.
   - **Ticket** (type 2): `{ 0: offer, 1: leaf, 2: commitment, 3: tier, 4: batch, 5: deadline }`: for one paid hash, the offer it sells under, the leaf, the payment commitment of the payment buying it (payment cMIP), the tier, **the batch it goes into** by number on the service's line of batches, and the **deadline**, a point on the offer's reference.
   - **Publication** (type 3): `{ 0: offer, 1: batch, 2: [ + leaf ], 3: tx, 4: output }`: for each batch, its number, **its leaves** in order, and the transaction and output committing to its root.
10. **Paying for a hash.** The payer sends the service's request endpoint the leaf (never the act), a tier, and the payment commitment it computed: payee the service, the amount the tier's price, following the offer's pointer as a tip follows a pointer (Finance rule 14), its salt and payer as the payment cMIP says. The endpoint answers with the rail's request (on Lightning, an invoice committing to the commitment) and the ticket. The payer's client checks the ticket before paying (client conformance, below). The payment is verified as any payment is, by the payment cMIP and the rail Module; it buys the ticket that names its commitment, where it pays exactly the tier's price to the service through the offer's pointer.
11. **The anchor.** The service builds each batch from the leaves its tickets promised it, anchors its root on the offer's reference, and publishes the batch.

## Omission and default (review section 9, item 2)

12. A ticket whose payment is valid is judged, in this order:
    1. **Omitted:** a publication by the service of the ticket's batch, under its offer, that does not list the ticket's leaf, or whose leaves make no batch. *A provable omission, from two acts the service signed, checkable by anyone, before the deadline and without the clock.* A leaf moved to another batch is omitted from the one its ticket named, whatever that other batch's point **(mechanic, the build's: the ticket names its batch, so that a publication contradicts it)**.
    2. **Anchored:** an anchor of the leaf, under the clock Module's rule at its depth, at a point at or before the deadline: delivered.
    3. **Late:** such an anchor after the deadline: a default. The anchor still counts as an anchor of the act, at its point.
    4. **Default:** the verifier's clock stands at the deadline plus the clock's depth less one (a point at the deadline would now count) and no anchor at or before the deadline is shown: **non-delivery of a proof by a deadline on a named reference**. An unpublished batch is a default the same way. **(mechanic, the build's: the default is read once the deadline is buried at the clock's depth, on the chain the verifier follows.)**
    5. Otherwise, pending.
13. **Each default is a refund**: the price paid for the ticket, owed back to the payer. A ticket whose payment is not shown made, or does not buy it (another commitment, payee or pointer, or not the tier's price), owes nothing. *Where that refund obligation lives (Finance or the offer's terms), and who pays when a batch costs more than its pool collected, are open: `docs/anchoring-step-14a.md`, questions Q1 and Q2.*

## Urgency tiers and selective delay (review section 9, item 3)

14. **Each tier's price is stated in the offer**, beside the most points it allows; the ticket's deadline is the point the service read as its tip, plus its tier's points. A service MAY offer any tiers. *For rule 15 a deadline matters only if it is shorter than the window a thief and a payer could use: an hour of delay on Bitcoin is the width of the review's findings 2 and 3. The tests' offer has three tiers, two blocks, six and a day (144), at 50, 20 and 5 satoshis a hash; the numbers are the service's to choose, not this cMIP's.*
15. **What remains, stated.** Within a tier's deadline the service chooses, unseen, when each paid hash lands: a service colluding with a thief can hold back an owner's lock-change receipt up to its tier's points, and a payment to the thief mined in between counts against the owner (pinned by `modules/onchain/tests/finance.rs`); one colluding with an owner can hold back a payer's claim the same way, on a clock that is not Bitcoin (F203). At the most urgent tier this is two blocks. Beyond the deadline it is a default, and the refund is the price, never the loss it caused. A service may also refuse to sell: visible to the payer, who goes to another service or anchors its own act (anyone may anchor any act, F169; the earliest anchor counts, F178). *An honest service in a fee spike either pays the fee the deadline needs or defaults; an urgent tier's price carries that risk.*

## What the service learns (review section 9, items 8 and 9)

16. **At the request endpoint** (an HTTP form, open as the rail Modules' are): the payer's network address unless it reaches the endpoint through Tor or a proxy; the moment; the leaf, which tells it nothing of the act where the blind is random; the tier; and the whole payment commitment: the payer (an identity, a one-time bare key, or none, F113), the price, the salt, the service's own pointer. **It never learns the act.**
17. **On the rail:** what a Lightning payee learns: the amount and the moment; not the payer's node, unless the payer pays over a direct channel to it.
18. **Publicly, by design:** each publication names its transaction, so the service's batches are linked to it on the chain, with their sizes and moments; the pool's coins link its batches to each other. A leaf in a publication names no act and no payer.
19. **Whoever is shown an anchor** learns the act, the blind, the batch and the service; whoever is shown a ticket learns the payment commitment it names.
20. **What it can still link:** timing. A named payer asking for an anchor moments after an on-chain transaction of a listed price is the review's section 8 link (behaviour 7), weaker here since the service never sees the act; a payer avoids it by paying as a one-time bare key and reaching the endpoint through Tor. *Stated cost, not closed by this cMIP.*

## Client conformance, in one list

- **A random blind.** The payer's client makes each blind from 32 random bytes and keeps it with the act; a blind it loses loses the anchor's use. A guessable blind lets the service, or anyone reading a publication, test which act a leaf holds.
- **Check the ticket before paying:** it names the offer chosen, the leaf sent and the payer's commitment; the commitment pays exactly the tier's price to the service through the offer's pointer; the deadline is after the client's own point now and no later than that point plus the tier's points and **one point of slack** for the service's view of the tip **(mechanic, the build's: one block)**.
- **Keep the ticket and the payment's proof** until the anchor is delivered: they are the evidence of omission and default.
- **Read every publication** of the ticket's batch under the offer.

## Costs, stated

- **Selective delay within a tier**, as item 15 states it, and a refund of the price only.
- **Publication size**: 32 bytes per leaf in each publication, the price of making omission provable.
- **Timing links** at the endpoint, as item 20 states.
- **A rewrite of the clock deeper than its depth** leaves an anchor pointing at a point no longer on the chain (F205); final for whoever counted it (F220).
- **Not built in draft 2:** the pool as visible custody and the conversion from Lightning to on-chain with receipts per hop; a refund actually paid; a hosted request endpoint for payees.

## Freeze scenarios

Through the Bitcoin clock Module: an on-chain payment's proof anchors its claim at its block; anchors compare on one reference only; a lock change anchored at a block and a payment mined before or at it, or after it (`modules/onchain/tests/finance.rs`). The batch: domain separation, one proof per leaf, a payment commitment never a root (`cmips/anchoring/tests/batch.rs`); batch anchors under the clock's rule (`modules/onchain/tests/anchor.rs`); the service: delivered, omitted, late, default, not paid, the ticket checked (`modules/onchain/tests/service.rs`); a lock change's point as its home receipt's batch anchor, with and without delay (`modules/onchain/tests/finance.rs`); end to end on regtest (`harness/tests/anchoring.rs`).
