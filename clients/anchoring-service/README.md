# Test anchoring service (mor-anchoring-service)

**A TEST pooled anchoring service**, on regtest only (F338), so that Edubba can anchor a collective's act and Damgar can pay for it, as the anchoring cMIP (draft 5) describes. Its coins are regtest coins, worth nothing. Never for real money.

## In plain words

On first start it makes its own test identity, says where it is paid (its Lightning node, carol by default), and publishes its **standing offer**: three urgency tiers (50 regtest sat within 2 blocks, 20 within 6, 5 within 144). Then, every few seconds, it reads its inbox: for each invoice request for an anchor it answers with an invoice of its node and a signed **ticket** (the leaf, the batch, the deadline block); when its node sees an invoice paid, it signs the payer's **receipt**; once every ticket of the open batch is paid (or its earliest deadline is a block away), it **anchors** the batch's root on the chain by pay-to-contract and publishes the batch. It speaks only through MOR acts.

## Precisely

| File | What |
| --- | --- |
| `src/service.ts` | `Service`: `start` (identity, payee pointer, offer, the anchoring key), `tick` (inbox, answers, receipts, anchoring and publication). Refusals said to the payer: no leaf asked, another payer or payee, another offer, not a tier's price, not paid to its pointer on Lightning. |
| `src/lnd.ts` | Its node: invoices with a description hash, settlement, on-chain sends (REST, certificate pinned). |
| `src/cli.ts` | `npm start -- --regtest RUN_DIR --homes URL --relays URL [--node carol] [--dir DIR] [--every SECONDS]`; its folder `~/mor-anchoring-service`. |

The publication carries two fields the anchoring cMIP draft 5 does not define (5, the key the batch's output is tweaked from; 6, the script tree): without them a reader cannot check the anchor. This is the build's lean, asked of Nobody, allegedly (`docs/damgar-report.md`, open question 1).

## Round 8: waiting on the binding (F407)

*In plain words:* the anchoring service still sells by a **standing offer**, which the core no longer reads. The anchoring cMIP's draft 6 moves it to a **publication** (what it sells: the cMIP's terms, its tiers) with **one price tag** (the most a hash costs, payable to the service, its own split service). The service's offer is made by the core's WebAssembly (`anchoringOffer`) and read by it (`anchoringReadOffer`, `anchoringCheckTicket`), and those three refuse until the MOR lead changes the binding to the publication and its tag. Writing the publication here by hand would guess the binding's encoding of the terms, so the service waits: it type-checks, and starting it fails at its offer, saying why.

*Precisely:* what the payer's side can already do is done in Damgar: a payment following a price tag pays the tag's payee (Money rule 18). What waits for the binding, in the order the cMIP gives it: the service's publication (lone seller's, field 0 `[[2, [anchoring cMIP, terms]]]`, field 3 itself, field 6 the clock, field 9 task 11) and its price tag; the ticket and batch notice naming the publication by its first version (key 0, objects `[publication, publication]`); the payer's ticket check against the publication and tag. The tests that stay red until then: Damgar's act menu's anchor, an anchor of a collective's act, a missed deadline, Edubba's anchor by clicks; Ummia's release anchored on Bitcoin.

## Tests

It is tested where it is used, in `clients/damgar`: `anchor.test.ts` and `browser.test.ts` (with a test node and a test chain), `regtest.test.ts` (on carol and btcd). `npm test` here type-checks it.
