# Test split service (mor-split-service)

**A TEST split service**, on regtest only (round 3, part C), so that a collective, or a lone seller's one-party deal, can be paid and have each payment divided among its holders, as Agreements rules 16 to 23, the split cMIP (draft 2) and the money messages cMIP (draft 4, 4.4, F357) describe. Its coins are regtest coins, worth nothing. Never for real money.

## In plain words

On first start it makes its own test identity and says where it is paid (its Lightning node, carol by default). A collective asks it for **a key of its own** (`key`), and names the service and that key in its money terms (Edubba, “Its money”); the service then signs to accept the grant. From then on, a buyer's Damgar reading the collective's agreement sends the **invoice request** to the service; the service answers with an invoice of its own node; once it is paid, it signs the buyer's **receipt** with the collective's grant key, waits a moment for the buyer's claim (which names the repost the buyer followed, for a referral share), publishes **the split** and **pays each holder** their part, each payout an ordinary Money payment their Damgar receipts. It tells each member of the sale, so a member's Edubba delivers the work's key. It speaks only through MOR acts.

## Precisely

| File | What |
| --- | --- |
| `src/service.ts` | `SplitService`: `start` (identity, payee pointer), `grantKey(grantor)`, `tick` (grants accepted by a signature act, F128; invoice requests checked by draft 4 and answered; receipts under the grant key, sealed to the payer and every party, rule 57; the referral read from the payer's claim, rule 22; the split, type 8, delivered to every holder it pays, rule 20, leftover units by rule 9 from its own tally; the sale told to each party, draft 4, 7.2.3; each payout asked, the holder's answer checked by its rail's rule, paid, claimed). |
| `src/cli.ts` | `npm start -- --regtest RUN_DIR --homes URL --relays URL [--node carol] [--payer alice] [--dir DIR] [--every SECONDS]`; `node --import tsx src/cli.ts key GRANTOR [--dir DIR]` while it runs, printing the key to give in Edubba. Its folder `~/mor-split-service`. Its invoices are its node's (carol by default); its payouts are paid from the same node or from `--payer`'s: on the regtest network only alice holds spendable funds (carol's few thousand received sit below its channel's reserve, as human test 14 found). MOR checks the invoice each holder's node signed and the preimage, never which wallet paid. |

Its Lightning connection is the anchoring service's (`../anchoring-service/src/lnd.ts`), which pays invoices too.

A payment that waits for its buyer's claim is split without one after three rounds: the referral share, if nobody is named, goes to the stake. This wait is the build's own, a reading to confirm (`docs/round-3-report.md`).

## Tests

It is tested where it is used, in `clients/desk`: `split.test.ts` (with a test node) and `round-3.test.ts`. `npm test` here type-checks it.
