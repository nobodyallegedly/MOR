# cMIP: Anchoring

*Draft 6, 30 October 2026 (the Dubsar Suite's round 8, F407), on draft 5 (`cmip-anchoring-draft-5.md`), for Nobody, allegedly, to approve. The core moved to the redesign (S7h: `docs/s7h-report.md`, `docs/s7h-2-report.md`): the Agreements **standing offer is gone**, and the **publication** (Agreements type 6) is the offer, its price a **price tag** (Money type 5). Draft 6 moves the pooled service from the standing offer to a publication and its price tag, and changes nothing else in what this cMIP decides: the anchor, the batch, the ticket, omission and default, the tiers, the price scheme, the custody and the checker stay as draft 5 wrote them. Where draft 5 said "the offer" it now means the publication and its tag together. This cMIP's own type 3, which drafts 2 to 5 called its "publication", is renamed in prose the **batch notice**, so that it is never confused with the Agreements publication; its type number and payload keys do not change.*

*Draft 5, 15 October 2026 (F326): its rules are a reference implementation, not programs published under Development draft 10's rule 22. Draft 4, 11 October 2026: the proven offer (F261) and the pool as visible custody. Draft 3, 10 October 2026: F225 (buying an anchor is an agreement), F228 (a price scheme; a shortfall is the service's), F226 (a lock change anchored through two services). Drafts 1 and 2: the anchor, the clock Modules, the batch, the pooled service, omission and default, urgency tiers, and what the service learns. **Experimental, not approved:** an instrument for testing the core, not a product. It fills the Envelopes' anchoring task (Envelopes, "Anchoring", F173; Development's task 11). Its hash stays a draft hash until its creator is named at step 17. Not core: a founding cMIP, frozen at publication, competing with any other anchoring cMIP.* *Decided by Nobody, allegedly, 10 October 2026 (F202): "We need tu ensure that anchoring to multiple clocks is possible, cMIP is the anchoring, modules are the clocks."*

*Reading this document: normal text is the specification. Italic text is commentary. Every choice the build made under the delegation of 10 October 2026 ("If the mechanic you find respect the rules we go ahead") is marked **(mechanic, the build's)**. The choices of the Dubsar Suite's cMIP author for draft 6 are marked **(the suite's, F407)**.*

## Reassessment (new in draft 6)

*In plain words: the core now does part of what this cMIP used to do for itself, and the rest is still this cMIP's.*

*What the core now does for the service.* A publication says what is sold, by whom, on which time reference, with which refund terms, and which split service receives the money. A price tag says the price and who is paid. The core reads both: it says whether the publication counts (every party signed it, it is public, it has not ended), whether the tag counts under it (signed by its split service), and whether a payment is a **purchase** under the publication (it names a tag that counts). A wallet that reads only Money can pay a tag and its purchase is valid. Money shows a refund repaid. Partners and shares by reference are carried by the publication too, though a lone anchoring service uses none.

*What is still this cMIP's.* The core does not check what a payment buys beyond the tag: it does not check the amount against the tag's price, and it knows nothing of tiers, tickets, batches, deadlines, omission or default. So this cMIP still defines: the anchor and its comparison; the batch tree; the terms (tiers and price schemes); the ticket and the batch notice; the judgment (anchored, omitted, late, default, not paid); the refund owed and where it stands; the custody account; and the checker the core asks for a proof of delivery.

*What can go.* The offer-reading this cMIP did for itself (a lone seller's, its field 2 as the most a hash costs, its payee by field 3, "naming no claim") is replaced by reading the publication and its tag, most of whose checks the core now makes. The service's "payee by field 3" goes: the service is its own split service and receives in its own name (Agreements, "Split service"). Draft 2's own offer act (type 1) stays retired.

*Verdict: keep.* The cMIP still decides everything the core cannot see (whether a hash was anchored by its deadline), and is smaller by its offer section.

## In plain words

*MOR has no clock. To show that an act existed by some moment, someone puts its fingerprint on a clock everyone can read: the Bitcoin chain, or a timestamp service. This cMIP says what such an "anchor" is and how two anchors are compared; each clock is a Module under it, the way each payment rail is a Module under the payment cMIP. An act may be anchored on many clocks; an owner names the one that decides its theft rule (Money, "clock").*

*Putting one fingerprint on Bitcoin costs a transaction. So a service gathers many, builds a tree of them, and puts only the tree's top on the chain, hidden inside an ordinary-looking payment to its own key (pay-to-contract, no OP_RETURN). **Buying an anchor is an agreement** (F225): the service signs a **publication**, the same act anyone selling something signs, selling this cMIP's terms: for each urgency tier, a price (or a price that follows the network's fees, F228) and a deadline. Its **price tag** names the publication and says what one fingerprint costs at most. Each payer pays the tag, at its tier's price, over Lightning, and gets a ticket: "your fingerprint goes into batch number n, on the chain by block D". The service then signs a **batch notice** for every batch: its list of fingerprints and the transaction carrying it. If the list leaves a paid fingerprint out, the ticket and the notice, both signed by the service, prove it. If nothing comes by block D, that is a default. Either way the price is owed back under the publication's terms, and the service pays it back like any payment, its claim showing the money went back. If the network's fees spike and a batch costs more than it brought in, that loss is the service's: the deadline does not move. The service never learns which act it anchored: the payer sends a fingerprint mixed with a random secret.*

## Anchors

1. **An anchor** places one act at one **point** on one **time reference**. A time reference is a clock Module under this cMIP and its parameters: `[ clock Module's spec hash, parameters ]`, the shape Money's clock entry and Agreements' time reference take.
2. **Comparing.** Two anchors compare only on the same reference (the same Module, the same parameters); anchors on references that cannot be compared order nothing. On a reference, an act is judged by its earliest anchor there (F178).
3. **Anyone may anchor any act** (F169, F173). An act may carry anchors on any number of references.
4. **A clock Module MUST define:** its parameters; its points, as a total order the core compares as unsigned integers; the proofs it accepts and the rule checking them (Development rule 12), naming any data the rule reads that the client supplies (a chain's headers, F204); and the depth at which a proof counts, where its clock can be rewritten.

## The point on a clock that counts blocks (F201)

On a clock whose points are blocks of a chain, **the point is the block**: an anchor's point is the height of the block that carries it, on the chain the verifier follows (F204). Two anchors in one block are at the same point, so "before or at" holds between them.

## Anchoring a commitment that names its act (F201)

A clock Module MAY accept, in place of an act id, **a commitment that names its act**: a hash the act determines under the specification that defines it. *The one such commitment so far is the payment cMIP's.* The anchor so placed shows that what the commitment binds (the payment) existed by that point. A clock Module that accepts it says which commitments, and the verifier recomputes the commitment from the act before the Module's rule runs. *Unchanged from draft 1.*

## Data a clock's rule reads (F204)

A clock Module's rule MAY name data the client supplies with the proof, such as the headers of a chain; the client hands them over as input (Development rule 12), and the rule never fetches them. A client that holds none gets the answer the rule gives without them.

## The batch

5. **A batch** is a list of distinct **leaves**, at least one, in an order its maker chooses. Each leaf is `H_leaf(act || blind)`: the act anchored (its id, 32 bytes) and a **blind** of 32 bytes. The batch's tree is built as Bitcoin builds a block's: each row hashed in pairs, an odd row's last node paired with itself, `H_node(left || right)`, up to one top node; the **batch root** is `H_root(count || top)`, `count` the number of leaves as eight bytes, big-endian. `H_leaf`, `H_node` and `H_root` are the core's tagged hashes under `MOR/cmip/anchoring/leaf`, `MOR/cmip/anchoring/node` and `MOR/cmip/anchoring/root`. **(mechanic, the build's.)**
6. **Domain separation.** A leaf, a node and a root are hashes under three distinct tags, none of them the payment cMIP's commitment tag. So a batch root never equals a payment commitment, a batch of one leaf has a root that is not the leaf, and an inner node is never read as a leaf.
7. **One proof per leaf** (F200). A leaf's proof is its index, the count, and its branch. It holds where the branch is exactly as long as the tree of `count` leaves is deep, the index is below the count, and, wherever a sibling equals the running hash, the index's bit at that level is 0; it then gives the root. A batch never holds two equal leaves: one payment, one leaf.
8. **A batch anchor** is a clock Module's proof that a batch root was committed at a point of its clock, with a leaf's proof under that root. On the Bitcoin clock Module: the root committed by pay-to-contract to a Taproot output, no OP_RETURN. The anchor places the leaf's act at that point; whoever shows it shows the blind.

## The pooled anchoring service

9. **The publication, its price tag, and two acts under them** (F225; moved in draft 6, F407). A pooled service sells under an **Agreements publication** (type 6) **(the suite's, F407)**:
   - **a lone seller's**: it names no ownership agreement (no field 1) and no partner (field 2 empty); its drafter is **its own split service** (field 3 the service). *So its owners' line is its own, and its split service's receipts carry no field 9 (Agreements rule 11, "A lone seller's publication").*
   - **what it sells is this cMIP's terms:** its field 0 is exactly `[ [ 2, [ this cMIP, terms ] ] ]`, the access form, a proven delivery (item 10a);
   - its **time reference** (field 6) is the terms' reference, the clock its deadlines are points on;
   - its **refund terms** (field 8), where it sets them, are a point on that reference until which a refund owed under it is claimable (F219);
   - its **cMIPs** (field 9) name this cMIP for the anchoring task (task 11) **(the suite's, F407)**;
   - its split plan (field 4) is the service's own business: whatever it divides, it divides its own money. *The reference implementation writes a plan with no share off the top.*

   Its price is **one price tag** (Money type 5) naming the publication's first version (field 1), **signed by the service** (or by a party the publication designates in its field 10), **its payee the service**, its price **the most one hash costs under the terms** **(mechanic, the build's; as draft 5's field 2)**, in the unit every tier's price is in. *A tag paying anyone but the service is not this cMIP's offer: the core would read it as bypassing the split service (Agreements rule 16), and for a lone seller there is nothing to bypass it for.*

   **Changes and stops**, as the core reads them: a later version of the tag changes its price; a tag version with no price withdraws it, the service's one-sided stop (Money rule 18); a later version of the publication selling nothing ends the offer, signed by every party (here the service alone) (Agreements rule 11). A later version of the publication changing the terms is read from the version in force; a ticket names the publication by its first version.

   Under them the service signs acts of two types of this cMIP, each naming the publication by its first version in its payload and in its `objects` as `[publication, publication]` **(mechanic, the build's: the types, payloads and citation; the wire keys of draft 5 kept, key 0 now holding the publication)**:
   - **Ticket** (type 2): `{ 0: publication, 1: leaf, 2: commitment, 3: tier, 4: batch, 5: deadline, ? 6: quote }`: for one paid hash, the publication it sells under, the leaf, the payment commitment of the payment buying it, the tier, **the batch it goes into** by number on the service's line of batches, the **deadline**, a point on the publication's reference, and, under a price scheme, **the measure quoted** (F228).
   - **Batch notice** (type 3; drafts 2 to 5: "publication"): `{ 0: publication, 1: batch, 2: [ + leaf ], 3: tx, 4: output }`: for each batch, its number, **its leaves** in order, and the transaction and output committing to its root.

   The terms:

   ```cddl
   terms  = { 0 => reference, 1 => [+ tier] }          ; the clock, and the tiers, most urgent first
   tier   = [ price: uint / scheme, blocks: uint ]     ; the price of one hash, and the most points it may take
   scheme = [ measure: uint, base: uint, per: uint, cap: uint ]
   ```

   A **price scheme** (F228) prices a hash at `base + per × measure`, never above `cap`; the one measure written so far is `0`, **the fee rate in satoshis per virtual byte, as the service reads it at the ticket's point and quotes it in the ticket** **(mechanic, the build's)**. *Type 1, draft 2's own offer act of this cMIP, stays retired, never reused.*
10. **Paying for a hash.** The payer's client finds the latest version of the publication and of its tag (Agreements rule 11, Money rule 18), and sends the service's request endpoint the leaf (never the act), a tier, and the payment commitment it computed: payee the tag's payee, the amount **the tier's price** (under a scheme, the price the quote gives), **`fulfils` the tag's version** (Money rule 18), paid to the payee's flow as Money rule 17 selects the pointer for a payment of a tag, naming no ownership agreement (a lone seller's publication), its salt and payer as the payment cMIP says. The endpoint answers with the rail's request (on Lightning, an invoice committing to the commitment) and the ticket. The payer's client checks the ticket before paying (client conformance, below). The payment is verified as any payment is, by the payment cMIP and the rail Module; **the core reads it as a purchase under the publication** (Agreements rule 12), and **this cMIP checks what the core does not**: it buys the ticket that names its commitment and the publication, where it pays exactly the tier's price to the tag's payee. *A payment to the service's pointer as a tip, or naming the publication without its tag (a tip through the publication, Money rule 18), buys no ticket.*

    *Stated, for Nobody, allegedly (F407, open): Money rule 18 says a payment of a tag "pays the price it states". A ticket at a cheaper tier pays less than the tag's price, which is the most a hash costs; the core does not check the amount, so the purchase counts, and this cMIP checks the tier's price. A Money-only wallet that pays the tag's price as stated buys the most urgent tier (or, under a scheme, the cap), never a cheaper one. The alternative, one tag line per tier, would keep rule 18's words exactly for fixed prices, but not for a scheme, whose price moves with each quote.*
10a. **A proven delivery** (F261; Agreements rule 11). The publication sells in the access form, `[ 2, [ this cMIP, terms ] ]`, and its delivery is proven from data alone: the ticket's leaf anchored on the publication's reference, at the clock's depth, at or before the ticket's deadline. Any verifier checks it with this cMIP's checker (`mor_anchoring::service::Checker`, the judgment of item 12), given the proof `[ ticket, anchor / null ]` **(mechanic, the build's: the encoding)**; the core passes it the publication. Proven where the leaf is anchored by the deadline; not proven where it is omitted, late, a default, or not paid; unknown while pending, or where the verifier does not follow the clock or does not hold the publication, its tag or the payment. **No vow is signed and no buyer's confirmation is asked.**

    *Note (F268, unchanged): this cMIP declares, by the specification format's field 12, `12 => true`, that it checks proofs of delivery; its code (`Checker::checks_delivery`) states what this text declares.*
11. **The anchor.** The service builds each batch from the leaves its tickets promised it, anchors its root on the publication's reference, and signs the batch's notice.

## Omission and default

12. A ticket whose payment is valid is judged, in this order:
    1. **Omitted:** a batch notice by the service of the ticket's batch, under its publication, that does not list the ticket's leaf, or whose leaves make no batch. *A provable omission, from two acts the service signed, checkable by anyone, before the deadline and without the clock.* A leaf moved to another batch is omitted from the one its ticket named.
    2. **Anchored:** an anchor of the leaf, under the clock Module's rule at its depth, at a point at or before the deadline: delivered.
    3. **Late:** such an anchor after the deadline: a default. The anchor still counts as an anchor of the act, at its point.
    4. **Default:** the verifier's clock stands at the deadline plus the clock's depth less one and no anchor at or before the deadline is shown: **non-delivery of a proof by a deadline on a named reference**. An unpublished batch is a default the same way. **(mechanic, the build's.)**
    5. Otherwise, pending.
13. **Each default is a refund owed under the publication's terms** (F225; Agreements, "A service sold under a cMIP's terms"): the price paid for the ticket, owed back to the payer the payment committed to (an identity; a bare key, by its claim; or, where it committed to none, nobody can claim it: Money rule 19), claimable until the publication's refund point (field 8) where it sets one (F219: past it unpaid, the refund is ended and the service keeps the money). **Money carries the repayment and shows it** (Money rules 17 and 19): the service pays the price back to the payer's pointer that rule 17 selects from the payer's own acts on the payment (or its pointer in force, or the refund rail its claim names), and its claim names the payment refunded, with the rail's proof that the money went back; repaid once such payments reach the price. *This cMIP judges what is owed, Money shows what was paid back; only a client that reads Agreements judges the default.* A ticket whose payment is not shown made, or does not buy it (another commitment or payee, not paying the tag, or not the tier's price), owes nothing.
13a. **Who bears a batch's cost** (F228): the publication's terms state the prices, or a scheme tied to an on-chain measure, and the deadlines; nothing in them moves a deadline with the measure. A batch that costs more than its tickets brought is the service's loss to bear; a service that does not anchor by a deadline defaults and owes the refund. *Stated cost, the service's.*

## Urgency tiers and selective delay

14. **Each tier's price is stated in the terms**, beside the most points it allows; the ticket's deadline is the point the service read as its tip, plus its tier's points. A service MAY offer any tiers. *The tests' terms have three tiers, two blocks, six and a day (144), at 50, 20 and 5 satoshis a hash; the tag's price is then 50.*
15. **What remains, stated.** Within a tier's deadline the service chooses, unseen, when each paid hash lands: a service colluding with a thief can hold back an owner's lock-change receipt up to its tier's points (pinned by `modules/onchain/tests/money.rs`). Beyond the deadline it is a default, and the refund is the price, never the loss it caused. **For a lock change, Money's client conformance answers it** (F226): the owner's client anchors the quorum's home receipts through two independent services, or by its own transaction; the earliest anchor counts (F178). A service may also refuse to sell, visibly, by withdrawing its tag.

## The pool as visible custody

*Unchanged from draft 4, its words moved: "its offer" is its publication and tag, "its publications" its batch notices.*

21. **What the service publishes.** A pooled service keeps its pool as **visible custody** by putting on its home, beside its publication, its tag and its batch notices: each **ticket** it signs; its Money **receipt for each payment buying a ticket**; its **receipts of the payments it makes to itself** on the chain of the publication's reference (the coins its batches' transactions spend, and the change they pay back); and its **refund claims**. No new act and no new format. **(mechanic, the build's.)**
22. **Following a batch's money.** From those acts a reader follows batch *n*: **in** (the payments buying the tickets naming batch *n*); **paid back** (what Money shows repaid on them); **its transaction** (the one its batch notice names); **spent** (each output the transaction spends, shown by a receipt of a payment to the service, else **not shown** and the fee unknown); **change** (each output paying the service back, shown by its receipt; any other output **paid where no receipt shows**); **the fee**; and **kept**: in, less paid back, less the fee and the batch's output. **Below zero, the service's loss** (F228), shown.
23. **What the pool holds** on the chain: the coins shown that no batch transaction shown spends.
24. **Money moved between Lightning and the chain.** Where the service moves its own money by itself, the account shows each side by its receipts. Through a conversion service, the move is a Money route under the conversion cMIP (`cmip-conversion-draft-4.md`).

## What the service learns

16. **At the request endpoint:** the payer's network address unless it reaches the endpoint through Tor or a proxy; the moment; the leaf, which tells it nothing of the act where the blind is random; the tier; and the whole payment commitment: the payer, the price, the salt, the tag version paid and the pointer paid. **It never learns the act.**
17. **On the rail:** what a Lightning payee learns: the amount and the moment.
18. **Publicly, by design:** each batch notice names its transaction, so the service's batches are linked to it on the chain; the pool's coins link its batches to each other. A leaf names no act and no payer.
19. **Whoever is shown an anchor** learns the act, the blind, the batch and the service; whoever is shown a ticket learns the payment commitment it names.
20. **What it can still link:** timing. *Stated cost, not closed by this cMIP.*

## Client conformance, in one list

- **A random blind**, 32 random bytes, kept with the act.
- **Check the ticket before paying:** it names the publication chosen (by its first version; the client read the latest versions of the publication and of its tag, Agreements rule 11, Money rule 18), the leaf sent and the payer's commitment; the commitment pays the tag's version, exactly the tier's price, to its payee; the deadline is after the client's own point now and no later than that point plus the tier's points and **one point of slack** **(mechanic, the build's: one block)**. **Under a price scheme**, the client reads the measure itself and refuses a quote above its own reading.
- **Show the deadline before paying** (Agreements rule 11).
- **Write the payer's claim at payment**: it is the payment a refund names.
- **Keep the ticket and the payment's proof** until the anchor is delivered.
- **Read every batch notice** of the ticket's batch under the publication.

**Its rules are a reference implementation** (F326): given as text and as a reference implementation (`cmips/anchoring`), not a program published under Development's rule 22.

## Costs, stated

- **Selective delay within a tier**, and a refund of the price only. For a lock change, closed by anchoring through two services or by the owner's own transaction (F226).
- **A shortfall is the service's** (F228).
- **A scheme's quote is the service's reading**, checked by the payer against its own before paying.
- **A refund needs outbound liquidity** on Lightning.
- **A refund owed to nobody:** a payer that committed to no key cannot claim one (Money rule 19).
- **Batch notice size**: 32 bytes per leaf, the price of making omission provable.
- **Timing links** at the endpoint.
- **A rewrite of the clock deeper than its depth** leaves an anchor pointing at a point no longer on the chain (F205).
- **Visible custody links each leaf to its payer** through the ticket and the service's receipt; a payer who wants no such link pays as a one-time bare key, or with no key, giving up the refund.
- **Custody is shown as far as the service publishes it.**
- **New in draft 6: the tag's price is the most a hash costs, not every ticket's price** (item 10's stated question): a Money-only wallet paying the tag as stated buys the most urgent tier.
- **New in draft 6: a service's acts name the publication by its first version.** A later version changing the terms changes them for tickets the service signs after it; a ticket's payer read the version its client found latest, and the payer's check is against that version.

## Freeze scenarios

Through the Bitcoin clock Module: an on-chain payment's proof anchors its claim at its block; anchors compare on one reference only; a lock change anchored at a block and a payment mined before or at it, or after it (`modules/onchain/tests/money.rs`). The batch: domain separation, one proof per leaf, a payment commitment never a root (`cmips/anchoring/tests/batch.rs`); batch anchors under the clock's rule (`modules/onchain/tests/anchor.rs`); the service: delivered, omitted, late, default, not paid, the ticket checked, **the publication and its tag read as the offer, and what is refused** (another drafter, a partner, an ownership agreement, an ended publication, a split agreement, no anchoring task, a withdrawn tag, a tag on another publication, paid to another or signed by another), the refund under the publication's terms, a price scheme, a tip through the publication buying nothing (`modules/onchain/tests/service.rs`); **the core reading the publication as one that counts, the tag as counting under it, and the payment of the tag as a purchase under the publication**, a default refunded and shown repaid, the checker asked for the publication's proven delivery (`modules/onchain/tests/agreement.rs`); the earliest of two services' anchors of a lock change counting (`modules/onchain/tests/money.rs`); the custody (`modules/onchain/tests/custody.rs`); and end to end on regtest, the publication and tag on the home, refunds paid, with real lnd nodes where the Lightning regtest network runs (`harness/tests/anchoring.rs`, with `MOR_BTCD`; draft 6's port compiles and passes without it, and was not run against btcd in round 8).
