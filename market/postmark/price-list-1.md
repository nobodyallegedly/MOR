# Postmark price list 1

*7 November 2026. Rehearsal prices, regtest, in satoshis. Read with `terms-1.md`. Published by Postmark, to be signed as an act by its desk identity once it exists. Nothing is updated: a change is price list 2, and this one stays. A raised price reaches existing customers only after 38,880 blocks' notice; a lower price or a new service applies once signed. Not part of the core.*

A period is 4,320 blocks on the agreement's time reference. Every price is the same for everyone.

| Service | Price |
| --- | --- |
| Keeper, monthly term: every agreement the customer is party to, those it signs later included | 2,000 / period + 5 / record |
| Keeper, one agreement, no monthly fee | 5 / record, at least 100 / period with any record |
| Anchoring of the keeper's sequence, at least every 144 blocks (C = 144) | included |
| Records from signers a customer covers by account tag | 5 / record, billed to the customer up to its cap |
| Free allowance, every signer identity | 3 records / period |
| Intake receipts | included |
| Clock: one hash, deadline 144 blocks | 3, chain fee included |
| Clock: one hash, deadline 36 blocks | 10, chain fee included |
| Clock: one hash, deadline 6 blocks | 40, chain fee included |
| Stamp | 1 per act stamped |
| Deposit, kept for the agreement's retention term or 4,320 blocks if none | 2 / deposit |
| Delivery record on fetch | 0 |
| Silence statement, for a party of an agreement we keep | 0 |
| Silence statement, for anyone else | 10 |
| Hand-over of everything we hold for an agreement, to any of its parties | 0 |
| Absence-proof cMIP and every specification we publish | free, public, replaceable |

*Clock prices are tiers under the anchoring cMIP, draft 8: one price tag per tier. Default under a tier is refunded under the publication's refund terms.*
