# cMIP: Conversion

*Draft 4, 30 October 2026 (the Dubsar Suite's round 8, F407), on draft 3 (`cmip-conversion-draft-3.md`), for Nobody, allegedly, to approve. The core moved to the redesign (S7h: `docs/s7h-report.md`, `docs/s7h-2-report.md`): the Agreements **standing offer is gone**, and the **publication** (Agreements type 6) is the offer, its price a **price tag** (Money type 5). Draft 4 moves the conversion service from the standing offer to a publication and its price tag, as the anchoring cMIP's draft 6 does, and changes nothing else: the terms, the order, delivery and default, the route as read here, and the checker stay as draft 3 wrote them. Where draft 3 said "the offer" it now means the publication and its tag together; where a forward named the offer as its agreement, it names the publication.*

*Draft 3, 15 October 2026 (F326): its rules are a reference implementation. Draft 2, 12 October 2026: F267 (the service's own claim carries a forward on where the next payee signs nothing) and F268 (it declares that it checks proofs of delivery). Draft 1, 12 October 2026: the anchoring custody's question CQ1, option 1. **Experimental, not approved:** an instrument for testing the core, not a product. It fills the Money MIR's conversion task (Development's task 7: "a conversion service's offer, and a hop received on one rail"). Money rules are cited by Money draft 11's numbers. Its hash stays a draft hash until its creator is named at step 17. Not core: a founding cMIP, frozen at publication, competing with any other conversion cMIP.*

*Reading this document: normal text is the specification. Italic text is commentary. Every choice the build made under the delegation of 10 October 2026 is marked **(mechanic, the build's)**; the choices of the Dubsar Suite's cMIP author for draft 4 are marked **(the suite's, F407)**.*

## Reassessment (new in draft 4)

*In plain words: the core now carries the service's offer; the conversion itself is still this cMIP's.*

*What the core now does for the service.* The publication says what is sold, on which time reference, and who receives; the price tag says the price and the payee; the core says whether the publication counts, whether the tag counts under it, and whether a payment of the tag is a purchase under the publication, which a Money-only wallet can make.

*What is still this cMIP's.* The core does not check the amount, binds no forward before payment, reads no route, and judges no delivery. So this cMIP still defines the terms (rate, fee, deadline), the order binding each forward before the money moves, delivery and default from the receipts and the clock, Money's route rules as read here (rules 24 to 28; the core still reads no route), and the checker for the proven delivery.

*What can go.* Reading a standing offer (a lone seller's, paid to its signer, its field 2 the most a conversion takes in) is replaced by reading the publication and its tag, most of whose checks the core now makes.

*Verdict: keep.*

## In plain words

*Sometimes a payer and a payee use different payment systems: the payer has Lightning, the payee wants coins on the Bitcoin chain. A **conversion service** sits in between. It takes the money on one rail and pays it on the other, at its own rate, for a fee. Money already says how such a payment reads: two hops, each with its own receipt, the second receipt naming the first (Money, "Routes across rails"). This cMIP is the service's side: what it promises, and how anyone checks that it kept the promise.*

*The service signs a **publication**, the act anyone selling something signs, selling this cMIP's terms: what it pays out on, the rate (or that each order quotes one, never worse than a floor), the fee, and how many blocks it may take. Its **price tag** says the most one conversion takes in. Before each payment it signs an **order**: "for this payment, I will pay so much, to this payee, by block D". The payer's wallet checks the order and pays the tag. The service signs its receipt of the payment, saying what it will pass on (Money's "forward"), and pays on. The next payee's receipt names the service's receipt.*

*Whether the service delivered needs nobody's word. If a valid receipt of the next payee names the service's receipt (or, where the next payee signs nothing, the service's own claim of its payment names it, F267), for exactly the amount promised, placed on the chain by block D, it delivered. If nothing comes by block D, the forward stays the service's open obligation, under its publication. A rail swap is a **proven delivery** (Agreements rule 11): its proof is the onward receipt, and this cMIP's checker reads it.*

## Purpose

This cMIP fills Money's conversion task. It defines:

- the conversion service's **offer**: a publication in the access form and its price tag, and its **terms** (items 1 to 3);
- the **order** that binds each forward before the money moves (items 4 to 6);
- **delivery and default**, judged from receipts and the publication's clock (items 7 to 10);
- its **checker** for the core (item 11);
- how it reads **Money's route rules** over receipts and claims (items 12 to 14);
- what its **specification declares** (item 15, F268).

## Dependencies

Identity, Envelopes, Text, Money, Agreements; the payment cMIP; a clock Module under the anchoring cMIP for the publication's time reference (on Bitcoin, the Bitcoin clock Module).

## The offer

1. **A publication, a lone seller's, and its price tag** (Agreements rule 11; moved in draft 4, F407) **(the suite's, F407)**. A conversion service sells under an **Agreements publication** (type 6) that names no ownership agreement (no field 1) and no partner, **its drafter its own split service** (field 3) **(mechanic, the build's: the service converts, so the identity paid on the first hop is the one that pays on)**. **What it sells is this cMIP's terms:** its field 0 is exactly `[ [ 2, [ this cMIP, terms ] ] ]`, a proven delivery: "a rail swap, the payment's proof". Its **time reference** (field 6) is required: the clock its deadlines are points on. Its **cMIPs** (field 9) name this cMIP for the conversion task (task 7). Its split plan is the service's own business. **Its price is one price tag** (Money type 5) naming the publication's first version, signed by the service (or a party the publication designates), its payee the service, its price **the most one conversion takes in**, in the unit it takes in **(mechanic, the build's; as draft 3's field 2)**. A later version of the tag changes the price; a tag version with no price withdraws it (Money rule 18); a later version of the publication selling nothing ends the offer (Agreements rule 11).

   *Stated, for Nobody, allegedly (F407, open): Money rule 18 says a payment of a tag "pays the price it states". A conversion takes any amount up to the tag's price; the core does not check the amount, and this cMIP checks it (item 3). A Money-only wallet paying the tag as stated converts the most.*

2. **The terms:**

   ```cddl
   terms = { 0 => [ rail: hash, unit: hash ],   ; what it pays out on: the onward hop's rail Module, and the forward's unit
             1 => rate,
             2 => fee: uint,                    ; in the out unit, taken off each conversion
             3 => blocks: uint }                ; the most points on the publication's time reference between an order and its deadline
   rate  = [ 0, num: uint, den: uint ]          ; fixed: every order at num / den
         / [ 1, num: uint, den: uint ]          ; quoted: each order quotes its own rate, no worse than num / den
   ```

   Every number in a rate is above zero. **(mechanic, the build's.)**

3. **The forward's amount** (Money rule 25): for a payment of `in` in the tag's unit, more than nothing and at most the tag's price, the forward is `floor(in × num / den) − fee` in the out unit, at the fixed rate or at the order's quote; it must be more than nothing. *A rail swap may keep the unit: the rate is then 1:1 and the fee is the price.*

   *A **rate source** is the service's own quote, signed in the order before payment and bounded below by the terms' floor; the payer's client compares it with its own source.*

## The order

4. **Before each payment the service signs an order** under its publication: an act of this cMIP, type 1, naming the publication by its first version in its payload and in its `objects` as `[publication, publication]` **(mechanic, the build's; the wire keys of draft 3 kept, key 0 now holding the publication)**:

   ```cddl
   order   = { 0 => publication: hash,
               1 => commitment: hash,   ; the first hop's payment commitment (payment cMIP)
               2 => forward,            ; Money's forward: what the service will pay on
               3 => onward: hash,       ; what the onward hop follows (its receipt's field 5)
               4 => deadline: uint,     ; a point on the publication's time reference
               ? 5 => quote }           ; the rate quoted, where the terms' rate is quoted
   forward = [ next-payee: hash, amount, agreement: hash ]   ; Money's; its agreement is the publication
   quote   = [ num: uint, den: uint ]
   ```

   *Why an order: Money's forward is written in the service's receipt of the first hop, which the service signs alone, after it is paid. Without a binding signed before the money moves, the service could name any next payee after the fact. The order is the service's word given first, the way the anchoring cMIP's ticket is.*

5. **Paying for a conversion.** The payer's client finds the latest versions of the publication and of its tag, and tells the service's request endpoint the next payee, what the onward hop follows, and the payment commitment it computed: payee the tag's payee, the service; **`fulfils` the tag's version** (Money rule 18); paid to the service's flow or vault as Money rule 17 selects the pointer for a payment of a tag; naming no ownership agreement (a lone seller's publication); in the tag's unit, at most its price. The endpoint answers with the rail's request and the order. **The order buys the conversion where:** it names the publication and the commitment; the commitment is as just said; its forward is the terms' amount for the payment (item 3), under the publication; and, under a quoted rate, its quote is no worse than the floor. *A payment to the service's pointer as a tip buys no conversion.* The core reads the payment as a purchase under the publication (Agreements rule 12); this cMIP checks what the core does not.

6. **The receipts.** Once paid, the service signs its **receipt of the first hop**, declaring the order's forward (Money receipt field 7), and pays the forward on the terms' out rail, following the order's `onward`. The next payee signs its **receipt of the onward hop**, naming the service's receipt in its field 6 and in its `objects`. **The service signs its claim of the onward payment**, naming its receipt of the first hop in the claim's field 10 and in its `objects` (F267). The service SHOULD put its orders and receipts where the payer can read them (Money rule 26).

## Delivery and default

7. **Delivered** where a receipt of the onward hop, or, where the next payee signed none, the service's claim of it (F267): is valid on its rail; names the service's receipt of the first hop (field 6, a claim's field 10, and `objects`); is signed by the forward's next payee (a claim: by the service), its payment serving no other forward (Money rule 12); records a payment by the service of exactly the forward's amount (Money rule 24), on the terms' out rail, following the order's `onward`; and its payment is **placed at or before the deadline** on the publication's clock, at the clock's depth.
8. **Late.** Placed after the deadline: nothing stays owed under Money, but the delivery is **not proven**. *No penalty in the terms.*
9. **Forwarded nothing** (Money rule 27). Once the clock stands at the deadline plus its depth less one and no receipt shows the forward paid: a **default**. **The forward stays an open obligation of the service, under the publication**: owed to the forward's next payee, its amount, as the service's receipt of the first hop declared it, or, where it signed none, as its order did. *What follows (a refund, a penalty, a contest) is Agreements' business (rule 28); the terms add nothing.*
10. **Contradicted.** The service's valid receipt of the first hop declaring another forward than its order: **the order's forward is what is owed**.

## The checker

11. **This cMIP's checker** (Agreements rule 11) gives the core a proof's verdict under the publication, by items 7 to 10: delivered, **proven**; not paid, late, a default or contradicted, **not proven**; pending, or what the verifier cannot read, **unknown**. The proof: `[ order: hash, onward: hash / null ]` **(mechanic, the build's)**. The core passes the publication; the checker reads the offer under it whose tag version the first hop pays, the orders, first payments, receipts and claims the verifier holds and checked, and the clock.

## Money's route, as read here

12. **One chain** (Money rule 24, with F267): every record valid, each naming the previous hop's receipt (a receipt in field 6, a claim in field 10; both in `objects`), each hop's received amount the previous hop's forward, ending at a record declaring no forward.
13. **Who pays the next hop** (Money rule 25), and **one payment serves one forward** (Money rule 12, bounding F267): a claim carries a forward on only where no valid receipt of its payment was signed by the next payee and no other claim of its payment names another hop; a receipt is followed before a claim, then the smallest act id **(mechanic, the build's)**.
14. **Where it stops** (rules 27 and 28): where a receipt declares a forward and nothing carries it on, the forward is that hop's open obligation, under the agreement the forward names, and the records naming that hop that are not its forward are shown beside it, each with why.

## The specification

15. **This cMIP checks proofs of delivery** (F268): `12 => true` **(mechanic, the build's)**. *Its code (`Checker::checks_delivery`) states what this text declares.*

## Client conformance, in one list

- **The payer's client** reads the latest versions of the publication and its tag, checks the order before paying (item 5): its forward's next payee and `onward` are those it asked for; under a quoted rate, the quote against its own source; the deadline after its own point and no later than that point plus the terms' blocks and one point of slack **(mechanic, the build's)**. It shows the deadline before paying (Agreements rule 11).
- **The payer's client** keeps its claim of the first hop (Money rule 11).
- **The service** receipts each first hop, declaring the order's forward, and pays on by the deadline.
- **The next payee** receipts the onward payment naming the service's receipt.
- **The service** claims its onward payment naming its receipt of the first hop, one payment for one forward only (Money rule 12).

## Costs, stated

- **The link is the paying hop's word** where the next payee signs nothing (F267), bounded by rule 12.
- **"By the deadline" is read only where the publication's clock can place the onward payment**: a Lightning onward hop on the Bitcoin clock is unknown, never proven.
- **A third party in every conversion**: the service holds the payer's money between the hops.
- **What the service learns:** at its endpoint, the payer, the amount, the next payee and the onward purpose.
- **Late carries no penalty.**
- **New in draft 4: the tag's price is the most a conversion takes in, not each payment's amount** (item 1's stated question).

**Its verification rules and its checker's are a reference implementation** (F326; `cmips/conversion`, crate `mor-conversion`).

## Open

- **Binding the forward in the onward payment itself** (the payment cMIP's "a forward's binding"): bound in the order.
- **The core reads no route.** Money's route rules are read in this cMIP's code (`route`).
- **The tag's price against the amount paid** (item 1, F407): for Nobody, allegedly.

## Freeze scenarios

| Scenario | What it shows | Run or reasoned |
| --- | --- | --- |
| 2.4 (the route) | Lightning in, on-chain out through a conversion service under its publication and price tag; each hop receipted; the route read as one chain; the delivery proven by this cMIP's checker, which the core asks for the publication; the publication counts and its tag counts under it; a payment of the tag is a purchase under the publication | Regtest (`harness/tests/conversion.rs`, needs `MOR_BTCD`; draft 4's port not run against btcd in round 8); offline (`modules/onchain/tests/conversion.rs`) |
| 2.4b | The service receipts a payment and forwards nothing: pending, then a default; the route stops at its receipt; the forward its open obligation under the publication | Regtest (`harness/tests/conversion.rs`); offline (`modules/onchain/tests/conversion.rs`) |
| — | Late, short, uncited and contradicted forwards; a silent service still owes its order; a quoted rate's floor; the order refused where it does not follow the terms; a Lightning onward hop the clock cannot place; **the publication and tag read as the offer, and what is refused** (an ownership agreement, a partner, another split service, no time reference, no conversion task, an ended publication, a tag paid to another, withdrawn, on another publication or signed by another) | Offline (`modules/onchain/tests/conversion.rs`) |
| CV1, F267 | A silent next payee: the service's claim carries the forward on | Offline (`modules/onchain/tests/conversion.rs`, the four `f267_` tests) |
