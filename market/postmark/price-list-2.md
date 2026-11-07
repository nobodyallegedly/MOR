# Postmark price list 2

*7 November 2026. Rehearsal prices, regtest, in satoshis. Read with `terms-2.md`. Published by Postmark, to be signed as an act by its desk identity once it exists. Price list 1 stays; a customer signed under it keeps its prices. A raised price reaches existing customers only after 38,880 blocks' notice; a lower price or a new service applies once signed. Not part of the core.*

## What changed since price list 1

- **A deposit on no deal, anchored, 5 sat**: the deposit and its anchor in one price, for any identity. *The Back Row.*
- **Account tags** stated as their own line, with the cap in the customer's term. *Ampersand, Backlot.*
- **Billing**: per deposit, never per fetch; billing kept 8,640 blocks. *The Back Row.*
- Nothing else changed in price. The per-agreement keeper line (from price list 1, added in the Backlot meeting) stays as it was.

A period is 4,320 blocks on the agreement's time reference. Every price is the same for everyone.

| Service | Price |
| --- | --- |
| Keeper, monthly term: every agreement the customer is party to, those it signs later included | 2,000 / period + 5 / record |
| Keeper, one agreement, no monthly fee | 5 / record, at least 100 / period with any record |
| Anchoring of the keeper's sequence, C = 144 blocks from intake receipt to anchor | included |
| Intake receipts | included |
| Free allowance, every signer identity | 3 records / period |
| Records billed through an account tag, up to the customer's cap | 5 / record, to the customer |
| Records from an unlisted signer beyond the allowance, with no tag | 5 / record, to the signer |
| Clock: one hash, deadline 144 blocks | 3, chain fee included |
| Clock: one hash, deadline 36 blocks | 10, chain fee included |
| Clock: one hash, deadline 6 blocks | 40, chain fee included |
| Stamp | 1 per act stamped |
| Deposit on an agreement Postmark keeps (anchored with the keeper's sequence) | 2 / deposit |
| Deposit on no deal, anchored within 144 blocks | 5 / deposit |
| Delivery record on fetch | 0 |
| Fetch | never billed |
| Silence statement, for a party of an agreement we keep | 0 |
| Silence statement, for anyone else | 10 |
| Hand-over of everything we hold for an agreement, to any of its parties | 0 |
| Absence-proof cMIP, intake receipt xtype, every specification we publish | free, public, replaceable |

*Clock prices are tiers under the anchoring cMIP, draft 8: one price tag per tier. A default under a tier is refunded under the publication's refund terms.*
