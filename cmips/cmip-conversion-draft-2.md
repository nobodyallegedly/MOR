# cMIP: Conversion

*Draft 2, 12 October 2026 (`docs/f267-f268-rule-17-build.md`): draft 1 (`cmip-conversion-draft-1.md`, `docs/conversion-cmip.md`) with two decisions of Nobody, allegedly, built in. **F267** (CV1): where the next payee signs nothing, the service's own claim of the onward payment, naming the service's receipt of the first hop (Money claim field 10), carries the forward on, bounded by Money rule 12; items 6, 7, 11 to 14, the client conformance, the costs and the freeze scenarios say so. **F268**: this cMIP declares, in its specification, that it checks proofs of delivery (item 15). Nothing else changed. *Money's claim field 10 and the reading of rules 24 and 27 are F267's, decided and built here and in the core library; the marked pass writing them into Money draft 7's text is another session's.* Draft 1: 12 October 2026 (the anchoring custody's question CQ1, option 1, made its own step). **Experimental, not approved:** an instrument for testing the core, not a product (build brief, 2 October 2026). It fills the Money MIP's conversion task (Money draft 7, "Tasks": "a cMIP defining how a conversion is offered and evidenced"). Written against core v21, Money draft 7, Agreements draft 11, the payment cMIP draft 2, the Lightning rail Module draft 2, the on-chain rail Module draft 2, the Bitcoin clock Module draft 2 and the findings to F266. Money rules are cited by draft 7's numbers, with draft 6's beside them where code and records still use them. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Not core: a founding cMIP, frozen at publication, competing with any other conversion cMIP.*

*Reading this document: normal text is the specification. Italic text is commentary. Every choice the build made under the delegation of 10 October 2026 ("If the mechanic you find respect the rules we go ahead") is marked **(mechanic, the build's)**.*

## In plain words

*Sometimes a payer and a payee use different payment systems: the payer has Lightning, the payee wants coins on the Bitcoin chain. A **conversion service** sits in between. It takes the money on one rail and pays it on the other, at its own rate, for a fee. Money already says how such a payment reads: two hops, each with its own receipt, the second receipt naming the first, so the two read as one chain (Money, "Routes across rails"). What was missing was the service's side: what it promises, and how anyone checks that it kept the promise.*

*This cMIP is that side. The service publishes a **standing offer**, the same kind of offer anyone selling alone publishes. Its terms say: what it pays out on, the rate (or that each order quotes one, never worse than a floor), the fee, and how many blocks it may take. Before each payment it signs an **order**: "for this payment, I will pay so much, to this payee, by block D". The payer's wallet checks the order and pays. The service signs its receipt of the payment, saying what it will pass on (Money's "forward"), and pays on. The next payee's receipt names the service's receipt.*

*Whether the service delivered needs nobody's word. If a valid receipt of the next payee names the service's receipt (or, where the next payee signs nothing, the service's own claim of its payment names it, F267), for exactly the amount promised, placed on the chain by block D, it delivered. If nothing comes by block D, the service forwarded nothing, and Money already says what that means: the forward stays the service's open obligation, under its offer. A rail swap is a **proven offer** (Agreements rule 11, F261): its proof is the onward receipt, and this cMIP's checker reads it.*

## Purpose

This cMIP fills Money's conversion task. It defines:

- the conversion service's **offer**: an Agreements standing offer in the access form, and its **terms** (items 1 to 3);
- the **order** that binds each forward before the money moves (items 4 to 6);
- **delivery and default**, judged from receipts and the offer's clock (items 7 to 10);
- its **checker** for the core (item 11);
- how it reads **Money's route rules** over receipts and claims (items 12 to 14);
- what its **specification declares** (item 15, F268).

## Dependencies

Identity, Envelopes, Text, Money, Agreements; the payment cMIP (each hop is a payment under it, Money, "Tasks"); a clock Module under the anchoring cMIP for the offer's time reference (on Bitcoin, the Bitcoin clock Module).

## The offer

1. **A standing offer, a lone seller's** (Agreements rule 11; F215). A conversion service sells under an **Agreements standing offer** (type 6), with no co-owners' agreement behind it (no field 0), public, **paid to its signer** **(mechanic, the build's: the service converts, so the identity paid on the first hop is the one that pays on)**. **What it sells is this cMIP's terms:** its field 1 is exactly `[ [ 2, [ this cMIP, terms ] ] ]`. It is a **proven offer** (F261): "a rail swap, the payment's proof". Its own time reference (field 6) is required: the clock its deadlines are points on. Its price (field 2, the one amount an offer states) is **the most one conversion takes in**, in the unit it takes in **(mechanic, the build's)**. A version of it changes or withdraws it as any offer's does (OF4 a).

2. **The terms:**

   ```cddl
   terms = { 0 => [ rail: hash, unit: hash ],   ; what it pays out on: the onward hop's rail Module, and the forward's unit
             1 => rate,
             2 => fee: uint,                    ; in the out unit, taken off each conversion
             3 => blocks: uint }                ; the most points on the offer's time reference between an order and its deadline
   rate  = [ 0, num: uint, den: uint ]          ; fixed: every order at num / den
         / [ 1, num: uint, den: uint ]          ; quoted: each order quotes its own rate, no worse than num / den
   ```

   Every number in a rate is above zero. **(mechanic, the build's: the map, the keys, the two forms of rate.)**

3. **The forward's amount** (Money rule 25, was 6: "a conversion hop forwards in the next unit, at the rate its agreement defines"): for a payment of `in` in the offer's unit, at most its field 2, the forward is `floor(in × num / den) − fee` in the out unit, at the fixed rate or at the order's quote; it must be more than nothing. *A rail swap may keep the unit (a regtest satoshi on Lightning is a regtest satoshi on the chain, Money, "One name per unit"): the rate is then 1:1 and the fee is the price.*

   *A **rate source** is the service's own quote, signed in the order before payment and bounded below by the terms' floor. The payer's client compares the quote with its own source before paying. A rate read from a third party's signed price is not built: the delivery would then rest on that party's word for the rate, a promised element in a proven offer (F261).*

## The order

4. **Before each payment the service signs an order** under its offer: an act of this cMIP, type 1, naming the offer in its payload and in its `objects` as `[offer, offer]` **(mechanic, the build's: the type, the payload, the citation; as the anchoring cMIP's ticket)**:

   ```cddl
   order   = { 0 => offer: hash,
               1 => commitment: hash,   ; the first hop's payment commitment (payment cMIP)
               2 => forward,            ; Money's forward: what the service will pay on
               3 => onward: hash,       ; what the onward hop follows (its receipt's field 5)
               4 => deadline: uint,     ; a point on the offer's time reference
               ? 5 => quote }           ; the rate quoted, where the terms' rate is quoted
   forward = [ next-payee: hash, amount, agreement: hash ]   ; Money's; its agreement is the offer
   quote   = [ num: uint, den: uint ]
   ```

   *Why an order (mechanic, the build's): Money's forward is written in the service's receipt of the first hop, which the service signs alone, after it is paid. The payment commitment binds who is paid, how much and for what, but not where the money goes next (the payment cMIP leaves "a forward's binding" for a later draft). Without a binding signed before the money moves, the service could name any next payee after the fact, and the payer could not show what it asked for: "what decides is signed by the wrong party" (round 2's first pattern). The order is the service's word given first, the way the anchoring cMIP's ticket is.*

5. **Paying for a conversion.** The payer tells the service's request endpoint the next payee, what the onward hop follows (its purpose at the next payee: its pointer, an obligation it is paying, an offer it is buying under), and the payment commitment it computed: payee the service, **following the standing offer** (`fulfils` the offer), paid to the service's flow or vault as Money rules 17 and 29 select the pointer for a payment under an offer, naming no claim (a lone seller's offer, F215), in the offer's unit, at most its field 2. The endpoint answers with the rail's request (on Lightning, an invoice committing to the commitment) and the order. **The order buys the conversion where:** it names the offer and the commitment; the commitment is as just said; its forward is the terms' amount for the payment (item 3), under the offer; and, under a quoted rate, its quote is no worse than the floor. *A payment to the service's pointer as a tip buys no conversion.* The payment is verified as any payment is, by the payment cMIP and its rail Module, and is a purchase accepted under the offer's terms (Agreements rule 11).

6. **The receipts.** Once paid, the service signs its **receipt of the first hop**, declaring the order's forward (Money receipt field 7), and pays the forward: a payment by the service (its payer) to the next payee, on the terms' out rail, following the order's `onward`, under the payment cMIP. The next payee signs its **receipt of the onward hop**, naming the service's receipt in its field 6 and in its `objects` (Money, "Settlement receipt"). **The service signs its claim of the onward payment** (Money rule 11), naming its receipt of the first hop in the claim's field 10 and in its `objects` (F267): where the next payee signs nothing, that claim carries the forward on (items 7 and 12). The service SHOULD put its orders and receipts where the payer can read them, and the next payee its receipt where the payer and the final creditor can (Money rule 26, was 8: "each hop's receipt MUST be disclosed at least to the next payee and to the final creditor").

## Delivery and default

7. **Delivered** where a receipt of the onward hop, or, where the next payee signed none, the service's claim of it (F267):
   - is valid on its rail (payment cMIP);
   - names the service's receipt of the first hop, in field 6 (a claim: field 10) and in `objects`;
   - is signed by the forward's next payee (a claim: by the service, its payer), and its payment serves no other forward (Money rule 12, item 13); records a payment by the service, of exactly the forward's amount (Money rule 24, was 5), on the terms' out rail, following the order's `onward`;
   - and its payment is **placed at or before the deadline** on the offer's clock, at the clock's depth. On the Bitcoin clock, an on-chain payment's point is its block (F201), counted once buried as deep as the on-chain rail requires (F205).

   The first hop's payment is the one the order names, shown valid by the service's receipt or by the payer's claim (Money rule 11, was 10, double entry).

8. **Late.** Such a receipt placed after the deadline: the forward reached its payee, so nothing stays owed under Money; but the delivery is not what the order promised, and is **not proven**. *Draft 1 sets no penalty for lateness; a later draft, or another conversion cMIP, may put one in its terms.*

9. **Forwarded nothing** (Money rule 27, was 9). Once the clock stands at the deadline plus its depth less one (a point at the deadline would now count) and no receipt shows the forward paid: a **default**. **The forward stays an open obligation of the service, under the offer**: owed to the forward's next payee, its amount, as the service's receipt of the first hop declared it, or, where the service signed no such receipt, as its order did. The receipts name the hop and the agreement that failed (rule 28, was 11). *What follows (a refund to the payer, a penalty, a contest) is Agreements' business (rule 28); draft 1's terms add nothing to Money's open obligation.*

10. **Contradicted.** The service's valid receipt of the first hop declaring another forward than its order: two acts it signed disagree, shown; **the order's forward is what is owed**.

    *A service that signs no receipt of the first hop is not let off: the payer's claim shows the payment arrived (Money rule 11), and its order binds the forward (item 9). But the onward hop cannot then name the first hop's receipt, so it can never be proven delivered: a service that wants its deliveries proven receipts what it is paid.*

    *A next payee that signs nothing no longer keeps a paid forward open (F267, was the stated cost CV1 of draft 1): the service's claim of the onward payment shows the money arrived (Money rule 11) and, by its field 10, which forward it paid.*

## The checker

11. **This cMIP's checker** (Agreements draft 11, rule 11, F261) gives the core a proof's verdict under the offer, by items 7 to 10: delivered, **proven**; not paid, late, a default or contradicted, **not proven**; pending (no onward receipt shown, the deadline not yet buried), or what the verifier cannot read (a clock it does not follow, an order, payment or receipt it does not hold), **unknown**. The proof, in this cMIP's encoding: `[ order: hash, onward: hash / null ]`, the order act's id and the onward receipt's or claim's **(mechanic, the build's)**. Beside the proof, the checker reads the offers, orders, first payments, receipts and claims the verifier holds and checked (every record of the onward payment, so that rule 12 is read), and the offer's clock. *The verifier checks the receipts and the chain itself, never the cMIP's or the service's say-so.*

## Money's route, as read here

12. **One chain** (Money rule 24, was 5, with F267). A route read from its first receipt, or back from its last record (the final creditor's reading, rule 26), is **complete** where every record is valid, each names the previous hop's receipt (a receipt in field 6, a claim of the paying hop in field 10; both in `objects`), each hop's received amount equals the previous hop's forward, and it ends at a record declaring no forward. *A claim declares no forward: a route carried on by the paying hop's claim ends there.*

13. **Who pays the next hop** (Money, "Conversion service": it "is the payer of the next hop"; rule 25, "only conversion hops forward"). A receipt or claim follows a hop declaring a forward only where its payee is the forward's next payee and its payer is that hop's payee. **One payment serves one forward** (Money rule 12, bounding F267), its payment told apart as its rail Module says (F200): a claim carries a forward on only where no valid receipt of its payment was signed by the next payee (that receipt says which hop the payment served) and no other claim of its payment names another hop (a payment claimed for two forwards serves neither, until the next payee's receipt of it says which); two receipts of one payment naming two hops serve neither. Where several records carry one forward on, a receipt is followed before a claim, then the one with the smallest act id **(mechanic, the build's)**.

14. **Where it stops** (rules 27 and 28, were 9 and 11, with F267). Where a receipt declares a forward and no valid receipt or claim of the next hop carries it on, the route **stops** there: the forward is that hop's open obligation, under the agreement the forward names, and the records naming that hop that are not its forward are shown beside it, each with why (another amount, not citing it, not valid, its payment serving another hop or claimed twice). *Rule 25's rate is the agreement's to check: for an offer under this cMIP, items 3 and 7.*

## The specification

15. **This cMIP checks proofs of delivery** (F268, decided by Nobody, allegedly, 12 October 2026). Its specification declares so by the specification format's field for it, as a rail Module declares its kind: `12 => true` **(mechanic, the build's: the field's number and value; F268 names "one declared field" and no number; to confirm against Development's marked pass)**. A verifier asks this cMIP's checker for a proven offer's verdict (item 11) because it declares so; the core library asks no checker whose cMIP does not. *Until its creator is named at step 17 its spec hash is a test value, and its code (`Checker::checks_delivery`) states what this text declares, as each rail Module's code states its kind.*

## Client conformance, in one list

- **The payer's client** checks the order before paying: it buys the conversion (item 5); its forward's next payee and its `onward` are those it asked for; under a quoted rate, the quote against its own source; and the deadline after its own clock's point and no later than that point plus the terms' blocks and one point of slack **(mechanic, the build's: the slack, as the anchoring cMIP's)**. It shows the deadline before paying (Agreements rule 11).
- **The payer's client** keeps its claim of the first hop (Money rule 11): it shows the payment arrived if the service signs nothing.
- **The service** receipts each first hop it is paid, declaring the order's forward, and pays on by the deadline.
- **The next payee** receipts the onward payment naming the service's receipt (field 6 and `objects`).
- **The service** claims its onward payment naming its receipt of the first hop (claim field 10 and `objects`; F267), and claims one payment for one forward only (Money rule 12).

## Costs, stated

- **The link is the paying hop's word** (F267, as decided): where the next payee signs nothing, the service's claim names which forward its payment carried. Rule 12 bounds it: one payment serves one forward, so a payment claimed twice serves neither, and the next payee's receipt, where it signs one, decides. *Draft 1's cost, "a silent next payee keeps a paid forward open" (CV1), is closed: pinned the other way by `modules/onchain/tests/conversion.rs`, `f267_a_silent_next_payee_the_services_claim_carries_the_forward_on`.*
- **"By the deadline" is read only where the offer's clock can place the onward payment.** On the Bitcoin clock, an on-chain onward hop is placed by its block; a Lightning onward hop is not, and its delivery is unknown, never proven (an anchor of its receipt would place it; not built).
- **A third party in every conversion** (CQ1's option 1): the service holds the payer's money between the hops, and the deadline bounds how long. The fee is its price, and the open obligation on default its only recourse in draft 1.
- **What the service learns:** at its endpoint, the payer (as the commitment names it), the amount, the next payee and what the onward hop is for; on the chain, its own coins link its conversions to each other. *A payer who wants less linked pays as a one-time bare key (F113).*
- **Late carries no penalty** in draft 1 (item 8).

## Open

- **Binding the forward in the onward payment itself** (the payment cMIP's "a forward's binding", for a later draft): draft 1 binds it in the order, signed by the service before payment.
- **The verification rules' RV32IM programs** (Development rule 12), as for the payment cMIP: given as text and as a reference implementation (`cmips/conversion`, crate `mor-conversion`).
- **The core reads no route.** Money's route rules are read in this cMIP's code (`route`), since its checker needs them and this step left the core unchanged.

## Freeze scenarios

| Scenario | What it shows | Run or reasoned |
| --- | --- | --- |
| 2.4 (the route) | Lightning in, on-chain out through a conversion service under its standing offer; each hop receipted; the route read as one chain of receipts; the delivery proven by this cMIP's checker, which the core asks; a payment following the offer is a purchase under its terms | Run, regtest, btcd 0.24.2, and with real lnd 0.18.5-beta nodes (`harness/tests/conversion.rs`); offline (`modules/onchain/tests/conversion.rs`) |
| 2.4b | The conversion service receipts a payment, declaring its forward, and forwards nothing: pending until the deadline is buried, then a default; the route stops at its receipt, naming the hop and the offer; the forward its open obligation | Run, regtest (`harness/tests/conversion.rs`); offline (`modules/onchain/tests/conversion.rs`) |
| — | A late onward payment completes the route but is not proven; one for less than the forward, or naming the previous hop in field 6 but not in `objects`, is not the forward; a service's receipt contradicting its order; a silent service still owes its order; a quoted rate no worse than the floor; the order refused where it does not follow the terms; a Lightning onward hop the Bitcoin clock cannot place | Run, offline (`modules/onchain/tests/conversion.rs`) |
| CV1, F267 | A silent next payee: the service's claim of the onward payment, naming its receipt of the first hop, carries the forward on; the route is one chain and the delivery proven. A claim not citing the hop in `objects` carries nothing; one payment claimed for two forwards serves neither; the next payee's receipt decides which forward a payment served | Run, offline (`modules/onchain/tests/conversion.rs`, the four `f267_` tests) |
