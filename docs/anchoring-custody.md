# Step 14a's last pieces: the pool as visible custody, and the anchoring cMIP draft 4

*11 October 2026. Branch `claude/anchoring-custody`, not merged. One roadmap step: step 14a's last pieces, "pooled funds as visible custody, and the conversion to on-chain with receipts per hop", and the anchoring cMIP draft 4 saying the service's offer is a proven offer (F261). Written for Nobody, allegedly: plain words first, then precise. Choices the build made under the delegation of 10 October ("If the mechanic you find respect the rules we go ahead") are marked **(mechanic, the build's)**. One question comes back to you. Regtest only, test identities only, no real money. `spec/` was not touched.*

## In plain words

**What "visible custody" means here.** Between a payer's payment and the transaction that anchors their fingerprint, the anchoring service holds the payer's money. Now anyone can watch what it does with that money, batch by batch:

- **what came in** for batch n: each payment for a ticket naming batch n, shown by the service's own receipt;
- **what went back**: the refunds paid on those payments (an omitted fingerprint, a missed deadline);
- **what the batch's transaction spent**: the service's own coins, each shown by a receipt;
- **what it paid back to the service** (the change), shown by a receipt too;
- **the fee the miners took**: what it spent, less everything it paid;
- **what the service kept**: what came in, less the refunds, the fee and the batch's small output.

**Nothing new was invented to do it.** The service only publishes what it already signs: its tickets, its Money receipts, its batch publications, its refund claims. The pieces already point at each other: a ticket names its payment and its batch; a publication names its transaction; a receipt's proof names the exact output on the chain; and the transaction names the outputs it spends. One rule was followed: the service's own coins move as ordinary payments **from the service to itself**, so each one has a receipt.

**A batch that loses money shows the loss.** In the regtest test, batch 0 brought in 90 satoshis (Ana 50, Ben 20, Cal 20), paid Cal's 20 back, and cost 1,330 (a fee of 1,000 and the 330-satoshi output): **kept −1,260**, shown as a loss, the service's to bear (draft 3, F228). The deadline did not move.

**What could not be shown is shown as not shown.** If the batch's transaction spends a coin that no receipt shows, the fee is "unknown", never guessed. If it pays money somewhere no receipt shows, that money is listed as such.

**What was not built, and why (question CQ1).** The roadmap's words include "the conversion to on-chain with receipts per hop": the money paid in over Lightning becoming coins on the chain. If the service does that by itself (closing a channel, its own wallet), no one else is involved, so there is no hop to receipt, and the account shows the two sides separately. If a **conversion service** does it, Money already has the format for the hops (each receipt names the previous one, with what was passed on), but there is **no format yet for the conversion service's offer**: no conversion cMIP exists, and F261 says a rail swap is a proven offer, which needs a cMIP with its own checker. That would be a new format, so I stopped there and put it to you below.

**The cMIP draft 4** adds two things and changes nothing else: one paragraph saying the service's offer is a **proven offer** (F261: the access form, delivery proven from data, the fingerprint in its batch by the deadline, checked by this cMIP's checker, no vow and no buyer's confirmation), and the custody section.

**The core library did not change.** Nor did the WebAssembly, the clients, the six MIPs or the freeze suite.

## What was built, precisely

### The custody reading (`cmips/anchoring/src/custody.rs`, crate `mor-anchoring`, new)

`custody::follow(offer, paid, publications, txs, coins, chain)` gives one `Line` per batch, in batch order, and what the pool still holds:

- **In**: each `Paid` (a ticket, the payment buying it as the caller verified it, the act showing it, and what Money shows repaid on it). It counts only where the payment is valid and buys the ticket, by the same test `judge` uses (`service::bought`, now `pub(crate)`: the offer, the commitment, following the offer, to its payee's flow, the tier's price). A tip to the service's pointer brings nothing in.
- **Paid back**: what Money shows repaid on each payment, up to its price.
- **The chain side** (`Anchoring`): `NotPublished`, `NotShown(why)` or `Shown { tx, spent, output, change, elsewhere, fee }`. The publication's transaction is found among the transactions given, by id. Each output it spends must be a **coin**: a payment to the service shown by a receipt the caller verified valid, matched by what the rail Module calls that payment (F200: on-chain, the output). Otherwise `NotShown`. Each output beside the batch's own is change where a coin's receipt shows exactly that amount, otherwise `elsewhere`. The fee is what it spends less all it pays. Two publications of one batch naming different transactions: `NotShown`.
- **Kept**: in, less paid back, less the fee and the batch's output; negative is a loss. Unknown (`None`) where the chain side is not shown, and then the pool's total is unknown too.
- **Unspent**: the coins shown that no batch transaction shown spends.

The clock Module reads the transaction through a trait, `PoolChain` (as `BatchClock` already does for the judgment), so the cMIP stays clock-neutral.

### The Bitcoin side (`modules/onchain`)

- `tx::spends`: the outputs a transaction (serialised without witness) spends, `(txid, index)`, read from Bitcoin's serialisation. Checked through the custody tests against transactions rust-bitcoin built.
- `payment_of(txid, index)`: what "the same payment" is on the on-chain rail (F200), now one function, which `OnchainProof::payment` also uses (its bytes unchanged).
- `PoolChain for BitcoinClock`: a transaction's txid, the outputs it spends and its outputs, each named as a payment.

### End to end on regtest (`harness/tests/anchoring.rs`)

Added to the existing test, which still does everything it did:

- The service's pointer has **two rails**: Lightning (0), where buyers pay, and on-chain (1), its own coins.
- The service puts **each ticket** and **its receipt of each payment** on its home.
- It puts **10,000 of its own regtest coins into the pool** as a payment to its own on-chain rail, and signs the receipt.
- **Batch 0's transaction spends that coin**: the batch's 330-satoshi output (no OP_RETURN, as before); **8,670 change back to its own on-chain rail**, receipted; and 1,000 to the miners.
- After the refunds, a **third party** reads the home (tickets, receipts, publications), verifies every receipt, Lightning and on-chain, and asks Money what was repaid. It then follows the money.
- **Batch 0:** 90 in (each by the service's receipt), 20 paid back, one coin of 10,000 spent (a receipt), output 330, change 8,670 (a receipt), fee 1,000. **Kept −1,260, a loss.**
- **Batch 1:** 50 in, 50 paid back, never published: kept 0. The pool holds 8,670 on the chain.

Run here on **btcd 0.24.2**, and again with **real lnd nodes** (lnd 0.18.5-beta, step 12's Lightning regtest network). Both archives' SHA-256 matched what `modules/onchain/README.md` records.

### Texts

- **New:** the anchoring cMIP **draft 4** (`cmips/cmip-anchoring-draft-4.md`), a copy of draft 3 with:
  - its header;
  - item **10a** (the proven offer, F261);
  - a new section, **"The pool as visible custody"**, items 21 to 24;
  - three cost lines in place of draft 3's "Not built" line;
  - the custody tests in its freeze scenarios.

  Draft 3 is kept unchanged.
- **Updated:**
  - `cmips/README.md` and `cmips/anchoring/README.md`;
  - `modules/README.md` and `modules/onchain/README.md`;
  - the Bitcoin clock Module draft 2: a dated note and its reference-implementation paragraph (it now also reads a batch's transaction). No rule changed.
  - the roadmap: one line under step 14a.

## Mechanics, the build's

1. The service's own coins move as payments to its own pointer, each with the receipt it signs. This is the deposit into the pool and the change of each batch.
2. The batch's output (dust, left at the service's key tweaked by the root) is counted as spent on the batch.
3. A coin not shown leaves the batch's fee unknown, never guessed. A change output whose receipt names another amount is no change.
4. The clock Module reads the transaction (`PoolChain`). On Bitcoin, the outputs are named as the on-chain rail names payments.
5. The money in is counted from whichever act shows the payment (the service's receipt in the regtest test; Money rule 10's double entry admits the payer's claim too).

## Readings taken, to confirm

1. **A payment from the service to itself is a Money payment like any other**: payer and payee are the same identity, and the service signs the receipt as payee. Money has no rule against it. It is how the pool's coins become visible.
2. **Visible custody is what the service shows, not a condition of delivery.** A service that publishes no tickets or receipts still delivers its anchors (item 10a), and its pool is simply not visible. A reader shows "not shown", never zero.
3. **A refund owed and not yet paid** stays in what the batch kept, until Money shows it repaid. That it is owed, the judgment already says (`service::standing`).
4. **Publishing tickets beside receipts links each leaf to its payer** (never to the act). This is stated as a cost in draft 4. A payer who wants no link pays as a one-time bare key (F113).

## Question for Nobody, allegedly

### CQ1. Money converted from Lightning to the chain through a conversion service has no offer format

*In plain words:* the service is paid over Lightning but pays the miners on the chain. If a third party, a conversion service, swaps one for the other, the roadmap wants a receipt for each hop: the service pays the conversion service over Lightning, and the conversion service pays the service on the chain. Money already has receipts that chain hop to hop. What does not exist is the conversion service's **offer**: the rate and fee it promises, and how anyone checks that it delivered.

*Checked against the working rule "core business, or the participants' choice":*
- The core already says a conversion service is "an identity paid under its own offer", and conversion is a cMIP's task (Money, "Conversion"). So which terms a conversion service sells is the participants' choice, not the core's.
- But no conversion cMIP has been written.
- F261 classes a rail swap as a **proven offer**. That needs the access form under a cMIP whose checker reads the onward hop's receipt.
- Writing that cMIP is a new format, which this step's brief says to bring to you rather than invent. That is why the question is put.

*Laid beside it:*
- Money draft 6, "Route", "Conversion service", rules 5, 6 and 9 (a route valid when each receipt names the previous and each hop's amount equals the previous forward; only conversion hops forward, at the rate their agreement defines; a hop that forwarded nothing owes it under the agreement the forward names).
- The core, "Routes across rails".
- Agreements draft 11, rule 11 (a rail swap among proven offers).
- The freeze suite, scenario 2, steps 4 and 4b (a route through a conversion service, not yet built).

*As built:* the service converts by itself (draft 4, item 24). No hop between parties takes place, and the account shows each side by its own receipts. In the regtest test, the service's coins on the chain are its own regtest coins, put into the pool by a receipted payment to itself. That link is the service's own, not shown by any receipt.

*Options:*
1. **A conversion cMIP, its own step:** a rail swap sold as a proven offer, under terms naming a rate, a fee and a deadline. Its checker would read the onward hop's receipt naming the first hop's, for the forward's amount. The custody would then follow the route hop by hop: payers to the service over Lightning, the service to the conversion service over Lightning (a receipt with a forward), the conversion service to the service on the chain (a receipt naming the previous one), then the batch's transaction. *Cost:* a new founding cMIP, and a third party in every conversion. Its checker also needs the forward's agreement to name the offer.
2. **Leave conversion to the service itself** (as built): the cMIP says only what item 24 says. *Cost:* the step from Lightning money to chain coins is the service's own and unseen. Custody shows what came in and what was spent, not that one became the other.
3. **The swap sold under a vow** (a promised offer, existing formats). *Cost:* it contradicts F261, which puts a rail swap among proven offers. Not recommended.

*Lean of the build:* 2 now, and 1 as its own step when a real conversion service is wanted. Option 1 also delivers the freeze suite's route scenarios (2, steps 4 and 4b), which are still open.

## Stated costs

- **Each leaf linked to its payer** by the published ticket and receipt (never to the act). Avoided by a one-time bare key (F113), or by no key, which gives up the refund.
- **Custody is only as visible as the service makes it.** A service that publishes nothing is not prevented from anchoring.
- **The conversion from Lightning to the chain is not shown** where the service does it itself (CQ1).
- **A batch's output is dust left at the service's key.** It is counted as spent: spending it would cost more than it holds at most fee rates.
- **A loss is the service's** (F228): at the tests' prices every regtest batch loses money, and the account says so.

## Tests

**Before** (main at `59808fd`, `scripts/test-all.sh` without `--reproducible` or regtest): **all passed.**
- Rust: 626 passed, 0 failed, 1 ignored.
- TypeScript: 220 passed, 0 failed.

*The first run stopped after the Rust half, which had passed, because this container lacked `wasm-bindgen`, a tool the script names as a requirement. I installed the version it names (0.2.129) and reran the whole script on the untouched tree.*

**After** (this branch, the same script, the tree untouched during the run): **all passed.**
- Rust: 633 passed, 0 failed, 1 ignored (the seven new tests; the regtest test passes without running when `MOR_BTCD` is not set, as before).
- TypeScript: 220 passed, 0 failed.

**New (7), `modules/onchain/tests/custody.rs`:**
- `custody_follows_a_batchs_money_from_the_payers_payments_to_its_transaction`
- `a_batch_costing_more_than_it_brought_in_is_the_services_loss_shown`
- `refunds_paid_back_and_a_batch_never_published_are_in_the_account`
- `a_coin_no_receipt_shows_leaves_the_batchs_fee_unknown`
- `money_paid_out_where_no_receipt_shows_is_shown_as_such`
- `two_batches_chained_by_their_change`
- `a_payment_that_does_not_buy_its_ticket_brings_nothing_in`

Each pool coin in them is a real receipt, verified by the on-chain rail's rule on a regtest chain built with rust-bitcoin. The Lightning payments' answers are given as valid, since `tests/service.rs` and `tests/agreement.rs` already verify those for real.

**Failing first:** all seven were run against a `follow` that returned an empty account, and failed. Each failed at its account assertions, after its receipts had verified valid. Then they passed.

**Extended:** `harness/tests/anchoring.rs`. It was extended together with the code it drives, so it did not fail first; every mechanism it runs is pinned by a test above. It ran here:
- with `MOR_BTCD` (btcd 0.24.2): 1 passed, about 7 seconds;
- with `MOR_LN_REGTEST` too (lnd 0.18.5-beta, step 12's `up.sh`): 1 passed, about 9 seconds; step 12's `lightning_rail` test then passed on the same network.

The regtest network was shut down afterwards.

## Not done

- CQ1: the conversion through a conversion service, with receipts per hop.
- A hosted request endpoint (a host decision).
- The RV32IM programs (Development rule 12) for the clock's, the service's and the custody's rules.
- Real money, real identities: regtest only, test identities only.
