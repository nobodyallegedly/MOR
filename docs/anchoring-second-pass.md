# Step 14a, second pass: pooled anchoring as an agreement

*10 October 2026, night. Branch `claude/anchoring-second-pass`, not merged. One roadmap step: the second pass on step 14a, building F225, F226 and F228 (decided by Nobody, allegedly, 10 October 2026) and putting a real Lightning node into the regtest anchoring test. Written for Nobody, allegedly: plain words first, then precise. Every mechanic chosen under the delegation of 10 October ("If the mechanic you find respect the rules we go ahead") is marked **(mechanic, the build's)**. Regtest only, test identities only, no real money.*

## In plain words

**Buying an anchor is now an agreement, as you decided (F225).** Before, the anchoring service published a price list of its own kind, and a payer paid it the way you tip someone. Now the service publishes an ordinary **standing offer**, the same kind of offer anyone selling alone publishes (F215). What the offer sells is "anchoring under these terms", and the terms are the anchoring cMIP's: for each speed (urgency tier), a price and a deadline. The payer pays **by following that offer**, so the core sees the payment as a purchase accepted under the offer's terms. The tickets ("your fingerprint goes in batch n, on the chain by block D") and the batch lists are the service's own acts under that offer: they name it.

**This reverses one of the readings taken after step 14a** (reading 3: "the anchoring offer is an act of the anchoring cMIP, not a Law offer", and "a payment for a hash follows the service's payee pointer as a tip does"). It no longer holds. A tip to the service now buys nothing: it buys no ticket.

**When the service fails, the money goes back, for real.** A fingerprint left out of its batch, or not on the chain by its deadline, means the price is owed back **under the offer's terms**, to whoever paid. The service pays it back over Lightning to the payer's own wallet, and signs a payment claim saying "this repays that payment", carrying Lightning's proof that the money arrived. The core reads that claim and shows the refund **repaid**. If the service's offer sets a last day for claiming refunds and it passes unpaid, the refund is **ended** (F219): the service keeps the money, and its terms stay public. Money says the money moved; Agreements say why it had to.

**A price that follows the network's fees (F228).** A tier may now say "10 satoshis, plus 3 for every satoshi-per-byte the network charges right now, never more than 400". The ticket states the fee rate the service read, so the price follows from it. The payer's wallet checks that rate against its own reading before paying and refuses a ticket that claims a higher one. If fees then spike and the batch costs the service more than it took in, **that loss is the service's**: the deadline does not move, and missing it still means a refund.

**Two services for a lock change (F226).** Money's theft rule (rule 15) now says, beside the existing MUST, that after a lock change the owner's wallet SHOULD have the home receipts anchored by **two independent services**, or by its own transaction, at an urgent tier. The earliest anchor counts, so one service dragging its feet (or working with a thief) is cancelled out by the other. A test shows it: one service holds Ana's receipt back two blocks, a second anchors it at once, and the royalty paid to the thief in between no longer counts against her.

**A real Lightning node.** The regtest test now runs, when step 12's Lightning test network is up, with real lnd nodes: four payers pay the service's node over real channels, and two refunds flow back the same way. Running it found a practical fact: **a service needs money on its own side of its Lightning channels to pay any refund at all** (lnd keeps a reserve the few satoshis it earned do not cover). The test gives the service that money first, and the cost is stated.

**The core library changed, by one small addition**: a way to ask "how much has been paid back toward this refund?" (`LawView::refund_repaid`), reusing the rule that already existed for refunds owed by collectives. Nothing else in the core changed; the WebAssembly binding does not expose it.

**One question comes back to you** (below): a payer may name, in its claim, where a refund should go; the payment cMIP cannot yet check a payment sent there.

## What was built, precisely

### F225: the service's offer is an Agreements standing offer (`cmips/anchoring/src/service.rs`)

- **The terms** (`Terms`), the anchoring cMIP's, carried as what the offer sells: `terms = { 0 => reference, 1 => [+ tier] }`, `tier = [ price: uint / scheme, blocks: uint ]`. **(mechanic, the build's: the format.)**
- **The offer** (`Terms::standing_offer`, `Offer::read`): an Agreements offer, type 6, a lone seller's (no field 0, F215), public, paid to its signer or its field 3 payee. `Offer::read` refuses, rather than guesses: an offer under co-owners' agreement; one selling anything but exactly `[ [2, [anchoring cMIP, terms]] ]` (a version selling nothing withdraws it); another cMIP's access; terms not in the format; a time reference (field 6) other than the terms' own; a price (field 2) other than the most one hash costs; a refund point not a point. **(mechanic, the build's: exactly one thing sold; field 6 required and equal to the terms' reference; field 2 read as the most one hash costs, OF5 a's one amount, in the unit every tier's price is in; the refund point a block height.)**
- **The core reads it as an offer that counts** (`LawView::offer`), and a payment following it as a **purchase accepted under its terms** (`LawView::purchase`, F215), unchanged code: `modules/onchain/tests/agreement.rs`.
- **Buying a ticket** (`bought`): the ticket names the offer and the commitment; the payment follows the standing offer (`fulfils` the offer act), to the offer's payee's flow (which pointer counts is Money's, rules 14 and 15, checked beside by `mor_payment::beside`), names no claim, for exactly the tier's price. **A tip to the service's pointer buys no ticket: reading 3 of step 14a is reversed.**
- **The ticket and publication** keep their types (2 and 3) and payloads; the ticket gains an optional quote (field 6, F228). In the regtest test both cite the offer in `objects` as `[offer, offer]`. **(mechanic, the build's: the citation.)** Type 1, draft 2's own offer act, is **retired, never reused**.
- **The judgment** (`judge`) is unchanged in its order (not paid, omitted, anchored, late, default, pending); each refund is now a `Refund { amount, to, until }`: the price, **owed to the payer the payment committed to** (an identity, a bare key, or nobody: Money rule 10a), claimable until the offer's refund point (F219).
- **Where a refund stands** (`standing`): **repaid** once what Money shows paid back reaches the price; otherwise **ended** once the clock stands past the offer's refund point at its depth (a block after the point would now count); otherwise **owed**, with what is left. **(mechanic, the build's: the point's passing read at the clock's depth, as the default is; repaid in full counts whenever paid.)**

### F225: the refund paid for real

- **Core, one additive method:** `LawView::refund_repaid(payment, to, unit)` (`core/src/law/view.rs`): what Money shows paid back toward a refund owed on a payment, by the rule a collective's money owed back already used (QF5, QG1, QG2: a payment naming what it repays, either side's record with the rail's proof, to the place Money rule 14 selects). The cMIP judges what is owed; this says what was repaid.
- **Paid** (`modules/onchain/tests/agreement.rs`, offline; `harness/tests/anchoring.rs`, regtest): the service pays the price back over Lightning to the payer's own pointer (Money rule 14: the payer's pointer in force, since none of its acts on the payment holds another), its commitment `fulfils` the payer's claim (the payment refunded), its payer the service; the service signs its claim with the rail's proof; the core shows the refund repaid and `standing` reads **Repaid**. A repayment sent to another identity's pointer repays nothing. **(mechanic, the build's, within QG2: the refund goes to the payer's pointer, not a refund rail; see question RQ1.)**

### F228: a price scheme tied to an on-chain measure

- `Scheme { measure, base, per, cap }`: a hash costs `base + per × measure`, never above `cap`; the one measure written is `0`, **the fee rate in satoshis per virtual byte, as the service reads it at the ticket's point** and quotes in the ticket (field 6). A fixed price takes no quote; a scheme needs one. **(mechanic, the build's: the shape, the one measure, the quote in the ticket.)**
- **Client conformance:** the payer's client reads the measure itself and refuses a quote above its own reading, or a quote it cannot check. **(mechanic, the build's.)**
- **The shortfall is the service's:** nothing in the terms moves a deadline; a fee spike that makes a batch cost more than its tickets brought leaves a missed deadline a default and a refund (`f228_a_price_scheme_tied_to_an_onchain_measure`). Stated in the cMIP, item 13a.

### F226: two services for a lock change

- **Money (Finance) draft 6, rule 15**, revised in place for you to approve again: beside F181's MUST, "**it SHOULD anchor them through two independent anchoring services, or by its own transaction, at an urgent tier**, the earliest anchor counting (client conformance, a SHOULD; F226 …)", with its reason and cost; a header note.
- **The anchoring cMIP's stated cost** (item 15, and "Costs, stated") points to it; so does the Bitcoin clock Module's cost line on a lock change's point.
- **The test** (`modules/onchain/tests/finance.rs`, `f226_the_earliest_of_two_services_anchors_closes_one_services_delay`): one service holds Ana's lock-change receipt back two blocks; a second anchors it in the next block. Through the first alone, the point is its late block; with both, the earliest, and the thief's royalty mined in between does not count.

### The regtest test, with a real Lightning node (`harness/tests/anchoring.rs`)

One btcd node (0.24.2) for the anchors, a throwaway home, five test identities. The service publishes its pointer and its **standing offer** (Agreements type 6); four payers each publish their own pointer, read the offer (the core says it counts), pay **following the offer**, check the ticket the service signs under it, and write their claims; the core reads each payment as a **purchase**. Batch 0 (Ana's and Ben's leaves) is anchored in one regtest transaction, a 330-satoshi Taproot output, no OP_RETURN, and published under the offer. A third party verifies both inclusions; Ana and Ben anchor their acts. Cal's leaf was omitted: **20 owed**; Dan's batch never came: **default, 50 owed**. **Both refunds are paid back over Lightning, the service's claims naming the payments refunded, and the core shows each repaid.**

**With `MOR_LN_REGTEST` set** (step 12's `modules/lightning/regtest/up.sh`: btcd and three lnd nodes, lnd 0.18.5-beta, its archive's SHA-256 checked against the release manifest), every payment moves over **real lnd nodes**: bob is the service's node, the payers pay from alice, and the refunds go back from bob to alice, each invoice issued by the receiver's own node. The Lightning network runs on its own regtest chain, beside the anchors' btcd: two regtest chains, both test coins. Without it, invoices are real BOLT 11 invoices signed by test node keys, as before. About 9 seconds either way.

**Found running it:** the first refund failed with lnd's "insufficient_balance". The service's node had received only 140 satoshis, under lnd's channel reserve (about 1% of the channel), so it could pay nothing out. The test now has alice pay bob 200,000 regtest satoshis on a plain invoice (no MOR payment) before the refunds. **Stated cost: a service on Lightning needs outbound liquidity to refund at all.**

### Texts

- **New:** the anchoring cMIP **draft 3** (`cmips/cmip-anchoring-draft-3.md`): item 9 (the offer, and two acts under it; the terms; the price scheme; type 1 retired, reading 3 reversed), item 10 (paying by following the offer), item 13 (the refund under the offer's terms, Money carrying and showing its repayment), new item 13a (F228), item 15 (F226), client conformance, costs, freeze scenarios. Draft 2 kept, marked superseded.
- **Revised in place, for you to approve again:** Money (Finance) draft 6, rule 15 (F226) and its header; Agreements (Law) draft 10, one paragraph in "The open formats", "A service sold under a cMIP's terms" (F225), beside the standing offer. Nothing near rule 45b, stake transfers or deals.
- **Updated:** the Bitcoin clock Module draft 2 (two cost lines, a dated note, no rule changed); READMEs (`cmips/`, `cmips/anchoring/`, `modules/`, `modules/onchain/`); the roadmap (step 14a, "Second pass"); the findings log ("Step 14a's second pass built").
- **Not written here:** F225's line for the core document's description of the layers ("the principle"). The core document was left untouched while the deals-and-owning build runs beside this one; it is a one-paragraph change for the rename pass, which F225 already names for reading Money's text against the principle.

## Mechanics, the build's, in one list

1. The terms' format, carried as what the offer sells, `[2, [anchoring cMIP, terms]]`.
2. An anchoring offer sells exactly that one thing.
3. Field 6 (the lone seller's own time reference) required, and equal to the terms' reference.
4. Field 2 (the one amount, OF5 a) read as the most one hash costs under the offer, in the unit every price is in.
5. The refund point (field 7) a block height; ended once buried at the clock's depth.
6. The price scheme's shape, its one measure (the fee rate, sat/vB) and the quote in the ticket (field 6).
7. The payer's client refuses a quote above its own reading of the measure.
8. Tickets and publications cite the offer in `objects` as `[offer, offer]`.
9. Draft 2's offer type (1) retired, never reused.
10. A refund to an identity paid to the payer's pointer as Money rule 14 selects it (QG2), the repayment's commitment `fulfils` the payer's claim.
11. "Repaid" counts whenever paid; "ended" only while unpaid.
12. In the regtest test: liquidity moved to the service's node before refunds.

## Stated costs

- **Selective delay within a tier** remains for any act anchored through one service; for a lock change, closed by F226's SHOULD (two services, or the owner's own transaction). A refund is the price, never the loss.
- **A shortfall is the service's** (F228): a fee spike can make a cheap tier lose money; the service bears it or defaults and refunds.
- **A scheme's quote is the service's own reading** of the fee rate. The payer checks it before paying; nobody can check it later from Bitcoin's headers alone (it would need full blocks). A quote below the payer's reading costs the service; one above is refused.
- **Outbound liquidity:** a Lightning service must keep funds on its side of its channels, above the reserve, to refund.
- **A refund owed to nobody:** a payer that committed to no key cannot claim one (Money rule 10a), as before.
- **Two services cost two prices** per lock change (F226), or one on-chain fee; lock changes are rare.
- **Only a client that reads Agreements judges a default** (F225, F126): a Money-only wallet sees a payment and, later, a repayment, but not why it was owed.

## Question for Nobody, allegedly

### RQ1. A refund sent where the payer's claim said cannot yet be checked

*In plain words:* when you pay, your claim may say "if I'm owed a refund, send it here" (a refund address, the claim's key 7). Money's rules then say a refund counts only if it went there. But the payment cMIP, which checks every payment against its proof, only knows how to check payments sent to a wallet pointer or a vault. A payment to the address named in a claim cannot be checked against its proof at all. So a payer who names a refund address cannot actually be shown repaid; and an anonymous payer (a one-time key), who has no pointer and must name one, cannot either.

*Laid beside it:* Money rule 10a (QG1, decided 9 October 2026: "a refund to a bare key is shown repaid by the refunder's claim naming the payment refunded, whose rail proof shows the money reached where the claim signed with that key said"); Money rule 14 (QG2, "Agreed": "a refund owed to an identity on a payment is paid to the refund rail the payer's own claim on that payment names (key 7), where it names one"). The core's tests of QG1 and QG2 state that rail answer by hand; nothing verifies it.

*As built:* this pass sidesteps it. The payers name no refund rail, so the refunds go to their own pointers and are verified for real. Nothing about the gap was changed.

*Options:*
1. **The payment cMIP's `paid-to` gains a third form**, `[2, claim]`, "paid to the refund rail this claim names": the rail Module checks the address from the claim's key 7 as it does from a pointer, and the core's reading (a repayment's paid-at naming the claim) is unchanged. A payment cMIP format change, in a founding cMIP; the payment cMIP's own question, not a MIP's.
2. **Refunds to identities go only to pointers**; key 7 stays for bare keys, with option 1 for them alone. Narrower, but it changes what QG2 decided.
3. **Leave it**, the gap stated: refunds to a named refund rail stay unverifiable until a rail's own proof can carry the address.

*Lean of the build:* 1. It makes both of your decisions (QG1, QG2) checkable as written, and touches only the payment cMIP's format.

## Readings taken, to confirm

1. **Field 2 of an anchoring offer is the most one hash costs**, the tiers' prices and any scheme being the cMIP's terms in what it sells (OF5 a keeps its one amount).
2. **The refund point of an anchoring offer is a block** on its own reference, past once buried six deep, as the deadline is.
3. **Repaid wins over ended:** money paid back after the refund point still shows repaid.

## Tests

**Before** (main at `c2ced0e`, with `MOR_BTCD` set, btcd 0.24.2): Rust workspace **558 passed, 0 failed, 1 ignored**.

**After:** Rust workspace **564 passed, 0 failed, 1 ignored**, with `MOR_BTCD` set. With `MOR_LN_REGTEST` also set (lnd 0.18.5-beta), the regtest anchoring test passes with real lnd nodes, and step 12's Lightning test (`harness/tests/lightning_rail.rs`) passes too, on the same network after this test's payments (each 1 passed).

New (6): `modules/onchain/tests/service.rs` 3 (`f225_the_services_offer_is_a_lone_sellers_standing_offer_carrying_its_terms`, `f225_a_default_owes_the_price_back_under_the_offers_terms`, `f228_a_price_scheme_tied_to_an_onchain_measure`); `modules/onchain/tests/agreement.rs` 2, a new file (`f225_the_core_reads_the_services_offer_as_a_standing_offer_and_the_payment_as_a_purchase`, `f225_a_default_is_refunded_for_real_and_shown_repaid`); `modules/onchain/tests/finance.rs` 1 (`f226_…`). **Rewritten to the new offer** (each saying why in its file's header): the six earlier tests of `modules/onchain/tests/service.rs` (their refunds now owed under the offer's terms; the client check now refuses a tip in place of "another pointer"), and the regtest test `harness/tests/anchoring.rs` (renamed `test_identities_buy_anchors_under_a_standing_offer_and_defaults_are_refunded_on_regtest`; refunds paid; real lnd nodes where the network runs).

**Failing first:** the five new tests of `service.rs` and `agreement.rs`, and the six rewritten, were run against the unchanged code and failed by not compiling (40 and 14 errors: no `Terms`, `Offer::read`, `Refund`, `standing`, `FEE_RATE`, ticket quote, `LawView::refund_repaid`); then passed. One of them failed afterwards on my own mistake, and was corrected in the test, not the code: it asserted that an offer priced in another unit is refused, which no decided rule says. **Not failing first:** the F226 test passed as soon as written, since the core already judges each act by its earliest anchor (F178); it pins the decision rather than driving code, and F226 itself is a text change. The regtest test was rewritten together with the code it drives; every mechanism it runs is pinned by a test above that failed first.

**Not run here:** the TypeScript clients (untouched; the binding unchanged). The display client's built files were not touched.

## Not done

- The pool as visible custody, and the conversion from Lightning to on-chain with receipts per hop (roadmap 14a's wording); a hosted request endpoint.
- RQ1 (a refund to a claim's refund rail, unverifiable).
- F225's principle in the core document's description of the layers (left for the rename pass, above).
- The RV32IM programs (Development rule 12) for the clock's and the service's rules.
- Real money, real identities: regtest only, test identities only.
