# The conversion cMIP: a rail swap sold as a proven offer, with receipts per hop

*12 October 2026. Branch `claude/conversion-cmip`, not merged. One roadmap step: session (e) of "Before the review", the anchoring custody's question CQ1, taken as option 1 and made its own step (the findings log, "The overnight reports"). Written for Nobody, allegedly: plain words first, then precise. Choices the build made under the delegation of 10 October ("If the mechanic you find respect the rules we go ahead") are marked **(mechanic, the build's)**. One question comes back to you, CV1. Regtest only, test identities only, no real money, no hosting. The core is unchanged; in `spec/`, only freeze scenario 2's steps 4 and 4b are marked run.*

## In plain words

**What a conversion service is.** Sometimes the one who pays and the one who is paid use different payment systems. Ana has Lightning; the owners' split service wants coins on the Bitcoin chain. A conversion service sits in between: it takes Ana's money on Lightning and pays the owners on the chain, at its own rate, for a fee. Money already said how such a payment reads: two hops, each with its own receipt, the second receipt naming the first, so the two read as one chain. What was missing was the service's side: what it promises, and how anyone checks that it kept its promise. That is this cMIP.

**How it works, step by step.**

1. The service publishes a **standing offer**, the same kind of offer anyone selling alone publishes. Its terms say what it pays out on (here, coins on the chain), the rate (here, one for one), the fee (here, 500 satoshis) and how many blocks it may take (here, 6).
2. Before Ana pays, the service signs an **order**: "for this payment, I will pay 29,500 to the owners' split service, on the chain, by block 506". Ana's wallet checks the order against the offer, then pays.
3. The service signs its **receipt** of Ana's payment. The receipt repeats what it will pass on (Money calls it the "forward"). Then it pays the owners on the chain.
4. The owners sign their **receipt**, naming the service's receipt.

**How anyone checks it.** Nobody's word is needed. If a valid receipt of the owners names the service's receipt, for exactly 29,500, and the chain shows the payment by block 506, the service delivered. If nothing comes by block 506, the service forwarded nothing. Money already says what follows: what it should have passed on stays its **open debt**, under its offer. A rail swap is a **proven offer** (your decision F261): its proof is the onward receipt, and this cMIP's checker reads it for the core.

**Why the order.** Without it, the only place the destination is written is the service's own receipt, which it signs alone, after it has the money. It could name any destination afterwards, and Ana could not show what was asked for. The order is the service's word given first, the way the anchoring service's ticket is.

**It ran for real.** On regtest, with real Lightning nodes: Ana paid 30,000 over Lightning; the service paid 29,500 on the chain; a third party read the home and found every receipt valid, the route one chain, and the delivery proven. Ben paid 20,000 the same way; the service receipted it and paid nothing on. Once block 506 was six blocks deep, the reading said: the route stops at the service's receipt, which names the service and its offer, and 19,500 is the service's open debt.

**One question comes back to you (CV1).** If the owners receive the money and then simply never sign their receipt, the service cannot show that it paid. Money links the hops by receipts only, and the service's own record of its payment (its "claim") has no place to say which forward it paid. So, as Money reads today, the service still owes what it already paid. Details and options below.

**The core did not change.** Nor did the six MIPs, the WebAssembly or the clients.

## What was built, precisely

### The cMIP (`cmips/cmip-conversion-draft-1.md`, new, founding, experimental)

Draft 1, items 1 to 14:

- **The offer** (items 1 to 3): an Agreements standing offer, a lone seller's (F215), paid to its signer, selling `[2, [conversion cMIP, terms]]` (the access form, a proven offer, F261), on its own time reference (field 6, required). Field 2 is the most one conversion takes in. The terms: `{ 0: [out rail, out unit], 1: rate, 2: fee, 3: blocks }`, the rate `[0, num, den]` (fixed) or `[1, num, den]` (quoted per order, no worse than this floor). The forward's amount is `floor(in × num / den) − fee`, more than nothing (Money rule 25, was 6).
- **The order** (items 4 to 6): type 1 of this cMIP, naming the offer in its payload and `objects`: `{ 0: offer, 1: the first hop's commitment, 2: Money's forward, 3: what the onward hop follows, 4: deadline, ? 5: quote }`. It buys the conversion where the payment follows the offer, to the service's flow or vault, naming no claim, in the offer's unit and at most its field 2, and its forward is what the terms make of it, under the offer.
- **Delivery and default** (items 7 to 10): delivered, late, a default (the forward owed, Money rule 27, was 9), contradicted (the service's receipt declares another forward than its order: the order's is owed), or not paid.
- **The checker** (item 11), and **Money's route as read here** (items 12 to 14).
- Client conformance, stated costs, open points, and freeze scenarios.

### The code (`cmips/conversion`, crate `mor-conversion`, new)

- `src/lib.rs`:
  - `Terms`, `Rate`, `Offer::read`, `Offer::out` (the forward's amount);
  - `Order` (its map), `ordered` (the order buys the conversion), `acceptable` (the payer's client check, deadline within the terms' blocks plus one point of slack);
  - `Hop` (a receipt as held: its `objects`, the rail's answer), `commitment_of`, `Payment`;
  - `DeliveryClock` (the clock the deadline is read on);
  - `judge`, giving `Judgment::{NotPaid, Pending, Delivered, Late, Default, Contradicted, Unknown}`, with `Owed` (debtor, forward, the act declaring it);
  - `Checker`, the core's `ProofChecker`; its proof is `[order, onward / null]` (`delivery_proof`).
- `src/route.rs`: Money draft 7, rules 24 to 28 over receipts. `link` (one hop to the next), `from` (forward from the first receipt) and `ending_at` (back from the last, as the final creditor reads it) give `Route::{Complete, Stopped, Broken}`. A stopped route names the hop, its open forward, and each receipt near it that is not its forward, with why.

### The Bitcoin clock (`modules/onchain/src/clock.rs`)

`BitcoinClock` implements `DeliveryClock`. An onward payment's point is its anchor, the block (F201), counted once valid at the rail's depth on the chain followed (F205), through the existing `payment_anchor`. A payment on another rail has no point there. No rule changed: the Module's text gets a dated note, and its reference-implementation paragraph names the new reading.

### End to end on regtest (`harness/tests/conversion.rs`, new)

- A throwaway home holds:
  - the conversion service's pointer (Lightning) and standing offer;
  - the owners' split service's pointer (on-chain);
  - two orders, the payers' claims, the service's receipts with their forwards, and the owners' receipt.
- **Ana:**
  - Her client reads the offer, which the core says counts and is a proven offer by its form.
  - It reads the order the service signed and checks it, then pays 30,000 over Lightning.
  - The service pays 29,500 from its own regtest coins (rust-bitcoin signs).
  - Six blocks later, the owners' receipt names the service's, in field 6 and in `objects`.
- **A third party then:**
  - verifies all three receipts (two on Lightning, one on the chain the node follows);
  - reads the route as one chain;
  - judges it delivered at block 501, by the deadline 506;
  - asks the core, which, asking the conversion cMIP's checker, says **proven**.
  - Both payments following the offer are purchases accepted under its terms (F215), as the core says.
- **Ben (step 4b):**
  - Pending before the deadline is buried. Once it is buried six deep: a **default**, the forward of 19,500 the service's open obligation, declared by its receipt.
  - The route stops at that receipt, naming the service and the offer.
  - The core's verdict: not proven.

### Texts

- **New:** the cMIP draft 1; `cmips/conversion/README.md`; this report.
- **Updated:**
  - `cmips/README.md` (a row);
  - `modules/onchain/README.md` (the clock's reading, the tests, the end-to-end run);
  - the Bitcoin clock Module draft 2 (a dated note and its reference-implementation paragraph, no rule changed);
  - the roadmap (one paragraph under step 14a);
  - the freeze suite: scenario 2, step 4 (the route) and step 4b marked run.
- **Not touched:** the anchoring cMIP draft 4, whose item 24 still says the conversion service's offer has no format. A later anchoring draft can point here.

## Mechanics, the build's

1. **The order** (item 4): the service's act, signed before payment, binding the forward, what the onward hop follows and the deadline, as the anchoring ticket binds a batch. *Why:* Money's forward is otherwise written only in the service's receipt, which it signs alone after it is paid. The payment commitment does not bind where the money goes next (the payment cMIP leaves "a forward's binding" to a later draft). Round 2's first pattern ("what decides is signed by the wrong party").
2. **Formats and numbers:**
   - the terms' map, its two forms of rate, and the forward's amount rounded down;
   - the order's type number (1), its payload, and its citation of the offer;
   - the proof's encoding, `[order, onward / null]`.
3. **The offer's field 2 is the most one conversion takes in**, and a payment may convert less. The core checks no amount on a lone seller's offer; this cMIP does.
4. **The offer is paid to its signer**: the identity paid on the first hop is the one that pays on.
5. **A rate source is the service's own quote**, signed in the order, no worse than the terms' floor. A third party's signed price is not built: it would rest on that party's word, a promised element in a proven offer (F261).
6. **One point of slack** in the payer's deadline check, as the anchoring cMIP's.
7. **Several receipts carrying one forward on:** the smallest act id is followed.
8. **Money's route rules are read in this cMIP's code** (`route.rs`), since the core library reads no route and this step left the core unchanged. They could move to the core library's `money` module at a later core step.

## Readings taken, to confirm

1. **Who an open forward is owed to.** Money rule 27 says "an open obligation of that hop, under the agreement named in the forward", without naming a creditor. The build reads the creditor as **the forward's next payee**, as the forward names. The payer's own purpose stays as Money leaves it. A debt the payer owed the next payee, for example, is discharged only by a route reaching the creditor (rule 15). Anything else (a refund to the payer, a penalty) is Agreements' business (rule 28), so a matter for the offer's terms in a later draft. Draft 1's terms add none. *In a swap to oneself, the payer and the next payee are one.*
2. **Late delivery** completes the route and leaves nothing owed (the money reached its payee), but it is not proven. Draft 1 sets no penalty.
3. **"Only conversion hops forward"** (rule 25) is read with Money's definition, "the payer of the next hop". A receipt carries a forward on only where its payer is the forwarding hop's payee and its payee is the forward's next payee.
4. **A receipt names the previous hop in field 6 and in `objects`** (Money, "Settlement receipt": "also named in `objects`"). One naming it in field 6 alone does not chain.
5. **A rail swap in one unit is a conversion.** A regtest satoshi on Lightning is a regtest satoshi on the chain ("one name per unit"), and Money's conversion service receives "on one rail or unit". The rate is then 1:1, and the fee is the price.
6. **Freeze scenario 2, step 4 names a stablecoin.** The route was run Lightning in and on-chain out, since no stablecoin rail Module exists; the route's rules do not depend on the rail. The mark says so, and says it covers the route only. The step's other parts (the Money-only wallet, referrals, the key delivered) are not marked by this step.

## Question for Nobody, allegedly

### CV1. A silent next payee keeps a paid forward open

*Area: core business (Money: routes across rails, rules 24 and 27; double entry, rule 11).*

*In plain words:* the conversion service pays the owners on the chain, as promised. The owners receive the money and simply never sign their receipt. The service holds its own record of the payment, its claim, with the chain's proof: that shows the money arrived (Money rule 11, double entry). But a claim has no place to say which forward it paid, and Money's route rules read only receipts. So the route stops at the service, and the forward stays its open debt, though it was paid. In a swap to oneself, the payer, by staying silent, could be paid twice.

*Checked against the working rule "core business, or the participants' choice":* what ends an obligation, and what a route is, are Money's rules (24 and 27). A cMIP cannot make rule 27 read a claim. The core has given participants no way to choose this. So it is core business, and the question is put.

*Laid beside it:*
- **Money rule 11:** a claim is evidence on equal footing with a receipt; "where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived".
- **Rule 24:** each receipt "names the previous hop's receipt".
- **Rule 27:** "no valid receipt from the next payee names it".
- **The claim format:** fields 0 to 9, no previous hop.
- **Round 2's first pattern:** the party who benefits from silence decides.
- **Rule 12:** one payment, one count. A payment cannot serve two forwards.

*Pinned:* `modules/onchain/tests/conversion.rs`, `question_cv1_a_silent_next_payee_keeps_a_paid_forward_open`. The service's claim verifies valid; the route stops; past the deadline the forward is owed.

*Options:*
1. **A claim may name the previous hop's receipt** (Money, one optional claim field mirroring receipt field 6, the anonymous claim's signed array extended by it). Rules 24 and 27 then read "a valid receipt *or claim* of the next hop names it". This is double entry for routes, as rule 11 already gives single hops. *Cost:* one optional field in Money's claim format, and a sentence in rules 24 and 27. The link is then the paying hop's word, bounded by rule 12. A stronger binding, the previous hop inside the onward payment's commitment, is the payment cMIP's open "forward's binding", and is not needed for this.
2. **The onward payment fulfils the forward's receipt** (`fulfils` naming it, as a refund names the payment refunded, QG1 and QG2). Rule 27 then reads a claim of a payment to the next payee fulfilling it. *Cost:* the onward hop no longer names the payer's purpose at the next payee, so a route can no longer discharge a debt by rule 15 ("each naming the obligation").
3. **Leave it, a stated cost.** The next payee's silence stays visible beside the service's valid claim, but the forward stays owed. A service serves only next payees it trusts. *Cost:* the conversion service bears it; in a swap to oneself, the payer can be paid twice.

*Lean of the build:* **1**. It is the smallest change that makes Money's double entry hold along a route, and it changes nothing for routes whose next payee signs. Until you decide, draft 1 states the cost. Its checker proves delivery from the onward receipt, as this step's brief says.

## Stated costs

- **A silent next payee keeps a paid forward open** (CV1).
- **"By the deadline" is read only where the offer's clock can place the onward payment.** On the Bitcoin clock, an on-chain onward hop is placed by its block; a Lightning onward hop is not, and its delivery is unknown, never proven. Pinned by `an_onward_payment_the_offers_clock_cannot_place_is_unknown`.
- **A third party in every conversion:** the service holds the money between the hops, for at most the terms' blocks. On default, the open obligation is the only recourse draft 1 gives.
- **What the service learns:** the payer (as the commitment names it), the amount, the next payee and the onward purpose; its own coins on the chain link its conversions.
- **Late carries no penalty** in draft 1.

## Tests

**Before** (main at `ea7cd5d`, `scripts/test-all.sh` without `--reproducible` or regtest): **all passed.**
- Rust: 634 passed, 0 failed, 1 ignored.
- TypeScript: 248 passed, 0 failed.

*Two things happened on the way:*
- **Missing tool:** this container lacked `wasm-bindgen`, which the script names as a requirement. I installed the version it names (0.2.129), outside the tree.
- **Stale branch:** the first run started on this container's local `main`, which turned out 121 commits behind `origin/main`. I stopped it and ran the whole script on `origin/main`'s tip (`ea7cd5d`), on a branch made from it, the tree untouched during the run.

**After** (this branch, the same script, the tree untouched during the run): **all passed.**
- Rust: 647 passed, 0 failed, 1 ignored (the thirteen new tests).
- TypeScript: 248 passed, 0 failed.

**New (13):**
- `modules/onchain/tests/conversion.rs` (12):
  - `a_rail_swap_lightning_in_onchain_out_delivered_by_its_deadline_is_proven`
  - `a_swap_to_the_payer_itself_reads_as_the_same_route`
  - `a_hop_that_forwarded_nothing_owes_the_forward_under_the_offer`
  - `a_silent_service_still_owes_what_its_order_promised`
  - `a_late_onward_payment_completes_the_route_but_is_not_proven`
  - `an_onward_receipt_for_less_or_not_citing_the_previous_hop_is_not_the_forward`
  - `the_services_receipt_contradicting_its_order_is_shown`
  - `the_order_binds_the_forward_before_the_money_moves`
  - `a_quoted_rate_no_worse_than_the_floor`
  - `a_conversion_offer_is_a_lone_sellers_selling_these_terms`
  - `an_onward_payment_the_offers_clock_cannot_place_is_unknown`
  - `question_cv1_a_silent_next_payee_keeps_a_paid_forward_open`
- `harness/tests/conversion.rs` (1): `a_rail_swap_lightning_in_onchain_out_through_a_conversion_service_on_regtest`. It passes without running when `MOR_BTCD` is not set, as the other regtest tests do.

Each Lightning receipt in the offline tests carries a real BOLT 11 invoice signed by a test node key, verified by the Lightning rail Module through the payment cMIP. Each on-chain receipt is verified by the on-chain rail Module on a regtest chain built with rust-bitcoin. The checker is asked through the core's `AgreementsView::proven_delivery`, the offer a real act in the core's test world.

**Failing first:** the twelve offline tests were run against a crate whose `judge`, checker and route reader were stubs. Nine failed, each at its judgment, route or verdict, after its receipts had verified valid. Then they passed. The other three test the terms, the order and the offer's reading, which were written before the tests.

**Regtest** (archives fetched from their GitHub releases, outside the tree; each SHA-256 matched what `modules/onchain/README.md` records):
- `harness/tests/conversion.rs` with `MOR_BTCD` (btcd 0.24.2): 1 passed, about 6 seconds.
- With `MOR_LN_REGTEST` too (lnd 0.18.5-beta, step 12's `up.sh`): 1 passed, about 6 seconds; the Lightning hops were real payments from alice to bob.
- On the same network, the existing `anchoring`, `lightning_rail` and `onchain_rail` tests then passed too.
- The regtest network was shut down afterwards.

## Not done

- **CV1:** the question above.
- **The anchoring custody following a route through a conversion service** (CQ1's option 1, optional in this step's brief). The pieces exist:
  - the custody already accepts a coin shown by the anchoring service's receipt of a payment to it, whoever paid it, so a converted coin counts as a coin;
  - `route::ending_at` on that receipt reads where the coin came from, back to the service's Lightning payment (`a_swap_to_the_payer_itself_reads_as_the_same_route`).

  Joining the two in the custody's account (a coin's route shown on its batch's line) is not built. It would make the anchoring crate read this one, and the step was full.
- **A Lightning onward hop placed on the clock** (by anchoring its receipt): not built.
- **A stablecoin rail:** none exists; step 2.4's route ran Lightning in, on-chain out.
- **A hosted request endpoint** (a host decision).
- **The RV32IM programs** (Development rule 12).
- **Real money, real identities:** regtest only, test identities only.
