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

## Tests

It is tested where it is used, in `clients/damgar`: `anchor.test.ts` and `browser.test.ts` (with a test node and a test chain), `regtest.test.ts` (on carol and btcd). `npm test` here type-checks it.
