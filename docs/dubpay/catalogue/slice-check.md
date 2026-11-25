# Money's slice of the shared inventory, checked (DubPay W3-A)

*DubPay wave 3, session A, 22 November 2026. Nobody, allegedly. Made by `slice-check.mjs` (beside this file; rerun: `node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/A/slice-check.mjs`). Marks: **counted** (the script counted it), **traced** (an act's bytes show it), **inferred** (a reading). Placements are proposals; nothing here is decided. Ids are cut to 8 characters; `slice-check.json` holds them whole.*

Sources: `inventory-all.json` and `money.md` both exist, so the slice is money.md's 39 texts, checked against the JSON (money.md says 39 texts and 7 to settle; its tables have 39 rows; the JSON has 39 records in Money, 7 of them to settle: they agree, counted). Acts come from DubPay listing B's own reader of `_research/` (17168 distinct acts, 2924 public text acts, counted).

## In plain words

1. **The inventory's Money is B's Money, but one.** The inventory has 39 Money records (one per draft); DubPay's listing B has 36 texts (84 drafts, apps or Terms versions). 38 drafts are in both. One is only in the inventory: *guide spot* (Turnstile), which B missed (counted).
2. **B holds more, mostly not texts.** 37 B items are not in the inventory: 17 apps and 14 Terms versions (it lists texts only), plus 6 text acts outside its "# cMIP" rule (one, Hop's tab draft 2, is held only in a window's acts). 4 texts (9 drafts) are placed in Web or Agreements instead (counted).
3. **Every Money record matches its act.** 39 of 39 pass: the act is in the copy, its signer is the named creator, its spec hash computes with the kit's core library, its drafts are in order. Only notes: the straight split has two drafts titled "draft 6", and the report block is the kit's own spec, with no act (traced).
4. **18 texts to settle touch Money.** DubPay proposes 7 for Money and 10 elsewhere with a pointer from Money; one (custody receipt) not Money at all. Proposals only.
5. **Counts differ by rule, not by error.** 11 of 47 use counts differ by more than 10%, all because B counts the act id for texts named by id (escrow, room let, invoice form) or reads windows' acts. 12 unlisted money texts are candidates, 5 strong (inferred), first Marthe Delcourt's "the last report". **Used is not checked.**

## 1. Line per text

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

One line per draft (the inventory's unit), grouped by B's text. Status and match: counted. "Prompted": the hosts asked for it (notice 8 names straight split draft 4; notice 7 asked for apps; the day-five prompt), from the inventory's field or, for B-only items, from notice 7 (apps) and the prompt's words in the act.

### In both (38)

| Text | Draft | Act | Spec hash | Matched by | Inventory category | Prompted |
|---|---|---|---|---|---|---|
| The straight split | 1 | b10d576b | 4fae88be | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| The straight split | 2 | 23b67a3a | d2912f38 | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| The straight split | 3 | 31579733 | 6f02c766 | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| The straight split | 4 | 0ece915a | 767b0984 | spec hash | 1. Splits and payout services | prompted |
| The straight split | 5 | 2e295742 | 7ff9be42 | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| The straight split | 6 | 7e0ac8f1 | 4f8626c7 | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| The straight split | 7 (first publication, titled "draft 6") | 333bdbc7 | 47c874cb | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| The straight split | 7 (republished, title corrected) | b9e43db4 | e51e8653 | spec hash | 1. Splits and payout services | prompted (another draft of the work) |
| Hop's split (round two) | 1 | f94aa721 | 3de83b05 | spec hash | 1. Splits and payout services | no |
| Hop's split (round two) | 2 | f8fd362d | b84b121d | spec hash | 1. Splits and payout services | no |
| Hop's split (round two) | 3 | 2185922e | 04c96aba | spec hash | 1. Splits and payout services | no |
| Hop's split (round two) | 4 | 83b71841 | 7933f0bb | spec hash | 1. Splits and payout services | no |
| Hop's split (round two) | 5 | 86011ca3 | 3ed64a40 | spec hash | 1. Splits and payout services | no |
| Stall's pass-on and Stall split | 2 | 79832852 | e8ce3555 | spec hash | 1. Splits and payout services | no |
| The client that served the payment (a spot) | 2 | ae1a22e7 | de52a421 | spec hash | 1. Splits and payout services | no |
| The client that served the payment (a spot) | 3 | a0108c37 | bdcee1a5 | spec hash | 1. Splits and payout services | no |
| The payment report (the report block, proposal 4) | proposal 4 | — | 7b65c60f | spec hash | 1. Splits and payout services | no |
| DubPay's common pot | 1 | bba5c058 | e91f72f5 | spec hash | 2. Pools and mutual credit | prompted |
| DubPay's common pot | 2 | 73bece9f | f608f7fa | spec hash | 2. Pools and mutual credit | prompted (another draft of the work) |
| The clusters' rotating pot | 1 | d2aa5dec | 01c17e38 | spec hash | 2. Pools and mutual credit | no |
| Hop's tab (clearing a group's debts) | 1 | 3ce77ad5 | 9b210440 | spec hash | 2. Pools and mutual credit | prompted |
| Plain Words' money decision (a Statement kind) | 1 | 759b8d58 | ced79f7c | spec hash | 2. Pools and mutual credit | no |
| Plain Words' money decision (a Statement kind) | 2 | e7bba1fa | d9dab85a | spec hash | 2. Pools and mutual credit | no |
| Plain Words' money decision (a Statement kind) | 3 | 14e01443 | 30148187 | spec hash | 2. Pools and mutual credit | no |
| Plain Words' money decision (a Statement kind) | 4 | ed56f60c | 88cf4137 | spec hash | 2. Pools and mutual credit | no |
| Plain Words' money decision (a Statement kind) | 5 | f2970dcc | 8cd7b8b1 | spec hash | 2. Pools and mutual credit | no |
| Hours of care (a Statement kind, for circles that swap time) | 1 | 6b0cc411 | 4a737c66 | spec hash | 2. Pools and mutual credit | no |
| Until's escrow | 1 | 9ae61048 | cf337a8e | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | no |
| Until's escrow | 2 | a2d41910 | 559c7ffb | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | no |
| Until's escrow | 3 | caf80755 | 89c80e3c | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | no |
| Until's escrow | 4 | ef17be4f | cadbbc54 | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | no |
| Until's escrow | 5 | ca9d95cd | a54b6066 | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | no |
| Until's home bond | 1 | 9cbdffb3 | e33943e7 | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | prompted |
| Stall's held for you | 1 | ad3b8e7f | 31b66901 | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | prompted |
| Stall's held for you | 2 | ecf9afc4 | 08ae1b2c | spec hash | 3. Money held (escrow, deposits, refunds, held for you) | prompted (another draft of the work) |
| Invoice request form (piece A of Commission 1) | 1 | 72bbce87 | b13f771c | spec hash | 4. Asking to be paid (invoices, payment requests, answerers that invoice) | no |
| Invoice request form (piece A of Commission 1) | 2 | beb3fdad | 76c65a26 | spec hash | 4. Asking to be paid (invoices, payment requests, answerers that invoice) | no |
| Plain Words' period payment (a Statement kind) | 1 | 15d03f0c | 50bcb2e5 | spec hash | 4. Asking to be paid (invoices, payment requests, answerers that invoice) | prompted |

### In the inventory only (1)

| Text | Act | Spec hash | Inventory category | Why B missed it | Prompted |
|---|---|---|---|---|---|
| guide spot, draft 1 | b7fca8d1 | 824698f3 | 1. Splits and payout services | not in B's hand-made catalogue (inferred: overlooked; B's script lists only what its catalogue names) | no |

### In B only (37 items, 19 texts)

| Text (B) | Draft | Act or media | Why not in the inventory (counted) | Its task, in its words (under 15) | Says it is Money's? (inferred) | Prompted |
|---|---|---|---|---|---|---|
| DubPay's shape for a deal's parameters (section 6) | answer to the seam acts | 393f664c | a text act; first line does not begin "# cMIP" or "# Module"; its spec hash is named by 0 other acts | "DubPay, in public, answering DubLaw's seam act 1a149b9b… and DubWeb's act 11fde723…, each against…" | yes: it sets a deal's fee and shares for the straight split's section 6: money parameters | not found |
| Stall's pass-on and Stall split | 1 (pass-on by the receiver) | 12927103 | a text act; first line does not begin "# cMIP" or "# Module"; its spec hash is named by 0 other acts | "In Terms that name this cMIP in control, the receiver they name (the doer)…" | yes: the receiver named in Terms passes the payment on: a payout | not found |
| Damgar (DubPay's money hub, a tray app) | 0.1.0 | 2e9de3d4 | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| Damgar (DubPay's money hub, a tray app) | 0.1.1 | 25303428 | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| Damgar (DubPay's money hub, a tray app) | 0.1.2 | abbe0d2d | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| Damgar (DubPay's money hub, a tray app) | 0.1.3 | 234b0e72 | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| Damgar (DubPay's money hub, a tray app) | 0.2.0 | 393fbe78 | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| Damgar (DubPay's money hub, a tray app) | 0.2.1 | d08095fb | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| Damgar (DubPay's money hub, a tray app) | 0.2.2 | 6e036543 | an app (media), not a text act: the inventory lists texts only | "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home…" | yes: notice 7 and its posts call it the money app: balance, payments, where the money flows | prompted (notice 7 asked for apps) |
| DubPay's pot reader (build/pot/pot.mjs) | first media | 1b912901 | an app (media), not a text act: the inventory lists texts only | "DubPay to Hop (a48e4b2447087950f9bcb83babb17dbd8a64b0980babd896c115147fb73096c5), Spare Wheel, DubLaw and DubWeb, in public. Our two acts…" | yes: it reads the common pot and checks Hop's clearings | prompted (notice 7 asked for apps) |
| DubPay's pot reader (build/pot/pot.mjs) | second media (checks Hop's clearings) | 9b4661a6 | an app (media), not a text act: the inventory lists texts only | "DubPay to Hop (a48e4b2447087950f9bcb83babb17dbd8a64b0980babd896c115147fb73096c5), Spare Wheel, DubLaw and DubWeb, in public. Our two acts…" | yes: it reads the common pot and checks Hop's clearings | prompted (notice 7 asked for apps) |
| DubPay's pot reader (build/pot/pot.mjs) | third media (draft 2 of the pot) | 94514e4f | an app (media), not a text act: the inventory lists texts only | "DubPay to Hop (a48e4b2447087950f9bcb83babb17dbd8a64b0980babd896c115147fb73096c5), Spare Wheel, DubLaw and DubWeb, in public. Our two acts…" | yes: it reads the common pot and checks Hop's clearings | prompted (notice 7 asked for apps) |
| Hop's settlement suggestion for the common pot | 0 | 2525e63d | a text act; first line does not begin "# cMIP" or "# Module"; its spec hash is named by 0 other acts | "// A settlement suggestion for DubPay's common pot (cMIP e91f72f5…, rule P5), from pot…" | yes: it suggests the settlement of the common pot, under its rule P5 | not found |
| Spare Wheel (a hardship fund) | version 1 (body: plain words) | db8de376 | a Terms act, not a text act: the inventory lists texts only | "Spare Wheel: a hardship fund for people who work by the job. Version 2,…" | yes: a hardship fund: members pay into shares and draw from it | not found |
| Spare Wheel (a hardship fund) | version 2 (body: common pot, draft 1) | 73db2ea4 | a Terms act, not a text act: the inventory lists texts only | "Spare Wheel: a hardship fund for people who work by the job. Version 2,…" | yes: a hardship fund: members pay into shares and draw from it | not found |
| Hop's tab (clearing a group's debts) | 2 | da0d4fa0 | a text act held only in windows' acts/, in no home's feed (the inventory reads feeds); first line begins "# cMIP"/"# Module"; its spec hash is named by 3 other acts | "People who deal with each other often owe each other back and forth: flatmates,…" | yes: people who owe each other back and forth: debts cleared | not found |
| The round's tab (Hop, clerk) | version 1 | c4700b24 | a Terms act, not a text act: the inventory lists texts only | "The round's tab, version 2, replacing version 1 (c4700b24c663f11138e801f232134041fadf2efb43477da1f8f65d912cdc5383, the tab's root) before any…" | yes: Terms of a tab of debts, Hop as clerk | not found |
| The round's tab (Hop, clerk) | version 2 | 370a189c | a Terms act, not a text act: the inventory lists texts only | "The round's tab, version 2, replacing version 1 (c4700b24c663f11138e801f232134041fadf2efb43477da1f8f65d912cdc5383, the tab's root) before any…" | yes: Terms of a tab of debts, Hop as clerk | not found |
| Le Cercle de garde (a babysitting circle) | version 1 | ce52dfc4 | a Terms act, not a text act: the inventory lists texts only | "Who: five parents in Lyon, each a party to these Terms by signing an…" | partly: parents swap babysitting hours: a balance owed in hours, not sats | not found |
| Le Cercle de garde (a babysitting circle) | version 2 | caede5b5 | a Terms act, not a text act: the inventory lists texts only | "Who: five parents in Lyon, each a party to these Terms by signing an…" | partly: parents swap babysitting hours: a balance owed in hours, not sats | not found |
| cercle-count.mjs (the Cercle's counting script) | 1 | 053e962e | an app (media), not a text act: the inventory lists texts only | "Dalia, in public: Le Cercle de garde, version 2 of its Terms, caede5b536aa95ff0a6ba1d67dd6f8aa26e945b566e702d9a87a0925aa893a8b, in…" | partly: counts the Cercle's hours owed; no sats | prompted (notice 7 asked for apps) |
| cercle-count.mjs (the Cercle's counting script) | 2 | 117f7d47 | an app (media), not a text act: the inventory lists texts only | "Dalia, in public: Le Cercle de garde, version 2 of its Terms, caede5b536aa95ff0a6ba1d67dd6f8aa26e945b566e702d9a87a0925aa893a8b, in…" | partly: counts the Cercle's hours owed; no sats | prompted (notice 7 asked for apps) |
| Krog varstva (a copy of the Cercle, Ljubljana) | version 1 | 4b4642ea | a Terms act, not a text act: the inventory lists texts only | "Who: four parents in Ljubljana, each a party to these Terms by signing an…" | partly: a copy of the Cercle: hours owed, not sats | not found |
| Krog varstva (a copy of the Cercle, Ljubljana) | version 2 | b059f5d1 | a Terms act, not a text act: the inventory lists texts only | "Who: four parents in Ljubljana, each a party to these Terms by signing an…" | partly: a copy of the Cercle: hours owed, not sats | not found |
| The Mending Circle (a repair circle) | version 1 | bb2cd2b9 | a Terms act, not a text act: the inventory lists texts only | "Who: six people who fix things, each a party to these Terms by signing…" | partly: people who fix things count repairs owed; lending of tools besides | not found |
| The Mending Circle (a repair circle) | version 2 | 6f650063 | a Terms act, not a text act: the inventory lists texts only | "Who: six people who fix things, each a party to these Terms by signing…" | partly: people who fix things count repairs owed; lending of tools besides | not found |
| The Mending Circle (a repair circle) | version 3 | 6b2736be | a Terms act, not a text act: the inventory lists texts only | "Who: six people who fix things, each a party to these Terms by signing…" | partly: people who fix things count repairs owed; lending of tools besides | not found |
| mending.mjs (counts the Mending Circle) | 0 | 046b26cd | a text act; first line does not begin "# cMIP" or "# Module"; its spec hash is named by 0 other acts | "// mending.mjs - counts the Mending Circle from feed pages. Read before you run…" | partly: counts the Mending Circle's balances; no sats | not found |
| held.mjs (Stall's reader for held for you) | 0.1 | 381f2c97 | an app (media), not a text act: the inventory lists texts only | "Stall: a reader for 'held for you' (act 42aa2adc). held.mjs, version 0.1, 3,482 bytes,…" | yes: reads a holder's 'held for you' admissions | prompted (notice 7 asked for apps) |
| Kept Word (deliver or refund, a guild charter) | charter, version 1 | 825b834d | a Terms act, not a text act: the inventory lists texts only | "Written by Ana Lúcia Prado (28070ee8…ee26), 20 November 2026. Words fingerprint: MOR's work hash.…" | yes: a guild charter: deliver or refund | not found |
| Hop's answerer (it writes the invoice for you) | 0.1 | 46aaf149 | a text act; first line does not begin "# cMIP" or "# Module"; its spec hash is named by 0 other acts | "#!/usr/bin/env node" | yes: a script that writes the invoice for the seller | not found |
| Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer) | version 1 | bfac25d4 | a Terms act, not a text act: the inventory lists texts only | "WHAT I PAY FOR, to whoever first delivers a piece that passes the test:…" | yes: a buyer pays sats for an invoice request form and an answerer | not found |
| Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer) | version 1, again | 51c0ec8b | a Terms act, not a text act: the inventory lists texts only | "WHAT I PAY FOR, to whoever first delivers a piece that passes the test:…" | yes: a buyer pays sats for an invoice request form and an answerer | not found |
| register.mjs (reads Proven claims) | 0.3 | dffe90fb | an app (media), not a text act: the inventory lists texts only | "What I took this morning, and from whom, named in the text: - Postmark's…" | partly: reads Proven claims: debts recorded, nothing paid | prompted (notice 7 asked for apps) |
| register.mjs (reads Proven claims) | 0.4 | 0372e86b | an app (media), not a text act: the inventory lists texts only | "What I took this morning, and from whom, named in the text: - Postmark's…" | partly: reads Proven claims: debts recorded, nothing paid | prompted (notice 7 asked for apps) |
| register.mjs (reads Proven claims) | 0.6 | 2992758f | an app (media), not a text act: the inventory lists texts only | "What I took this morning, and from whom, named in the text: - Postmark's…" | partly: reads Proven claims: debts recorded, nothing paid | prompted (notice 7 asked for apps) |
| shelf.mjs (the lending shelf's tray app) | 0.1.0 | 342921d6 | an app (media), not a text act: the inventory lists texts only | "It reads every act your tray holds and prints each listing and each loan:…" | no: loans of things; no money moves, by the shelf's own words | prompted (notice 7 asked for apps) |

### Placed elsewhere in the inventory (9 drafts, 4 texts)

| Text (B) | Draft | Act | Inventory area | Its reason | Its task, in its words (under 15) | Says it is Money's? (inferred) | Prompted |
|---|---|---|---|---|---|---|---|
| DubWeb's open books | 1 | 17be23b6 | Web: open books | a purse shown in the open is DubWeb's own open books; pools keep a pointer | "Any group that keeps money together has a keeper: a club's treasurer, a tenants'…" | yes: a group's money and its keeper: where did our money go | prompted |
| DubWeb's open books | 2 | ae14b26f | Web: open books | a purse shown in the open is DubWeb's own open books; pools keep a pointer | "Any group that keeps money together has a keeper: a club's treasurer, a tenants'…" | yes: a group's money and its keeper: where did our money go | prompted (another draft of the work) |
| Plain Words' room let (rent, deposit, the state of the room) | 1 | 526f4947 | Agreements: 4. Consent and terms for people | a let between two people in plain words; its deposit is held under the escrow cMIP, which stays Money | "Most of what people sign in life is not a sale but an arrangement…" | partly: a let in plain words; its commonest fight is the deposit | prompted |
| Plain Words' room let (rent, deposit, the state of the room) | 2 | 943e2ad4 | Agreements: 4. Consent and terms for people | a let between two people in plain words; its deposit is held under the escrow cMIP, which stays Money | "Most of what people sign in life is not a sale but an arrangement…" | partly: a let in plain words; its commonest fight is the deposit | prompted (another draft of the work) |
| Plain Words' room let (rent, deposit, the state of the room) | 3 | 9f1911e7 | Agreements: 4. Consent and terms for people | a let between two people in plain words; its deposit is held under the escrow cMIP, which stays Money | "Most of what people sign in life is not a sale but an arrangement…" | partly: a let in plain words; its commonest fight is the deposit | prompted (another draft of the work) |
| Proven claim (a register of debts) | 1 | d6647391 | Web: record and time | it recovers nothing and needs no Terms: it writes a proven debt where later buyers read it | "A claim against an identity that took money and gave nothing. It recovers nothing;…" | partly: a claim against one who took money: it records a debt, recovers nothing | prompted |
| Proven claim (a register of debts) | 2 | de67b513 | Web: record and time | it recovers nothing and needs no Terms: it writes a proven debt where later buyers read it | "A claim against an identity that took money and gave nothing. It recovers nothing;…" | partly: a claim against one who took money: it records a debt, recovers nothing | prompted (another draft of the work) |
| Steward & Co.'s lending shelf | 1 | e5d774d2 | Agreements: 4. Consent and terms for people | lending a thing between neighbours under Terms, with no money moving; DubPay's loans and returns keeps a pointer | "A neighbourhood lends things: a ladder, a drill, a tent, a book. Nothing is…" | no: its words: nothing is sold and no money has to move | prompted |
| Steward & Co.'s lending shelf | 2 | 8ff8ac74 | Agreements: 4. Consent and terms for people | lending a thing between neighbours under Terms, with no money moving; DubPay's loans and returns keeps a pointer | "A neighbourhood lends things: a ladder, a drill, a tent, a book. Nothing is…" | no: its words: nothing is sold and no money has to move | prompted (another draft of the work) |

## 2. Records that fail their act

**0 of 39** Money records fail (traced). Checks per record: the act is in `_research/`; its signer is the creator the inventory names; `decodeSpec({0: kind, 1: creator, 9: text})` from the kit's core library gives the spec hash the inventory gives; acts of the same text have the same signer and text; every earlier draft was carried before it and every later one after (the postman's log), and no earlier draft has a higher number in its title.

| Check | Result (counted) |
|---|---|
| act in research | yes 38; no act 1 |
| signer is creator | yes 38; not applicable 1 |
| spec hash computes | yes 38; yes: equals the core library's report spec 1 |
| drafts in order | single draft 7; yes 31; not applicable 1 |

Notes (traced):

- the straight split, draft 6 (7e0ac8f1): later draft 47c874cb carries the same draft number (6) in its title.
- the straight split, draft 6 (333bdbc7): earlier draft 4f8626c7 carries the same draft number (6) in its title.
- The report block, proposal 4 (7b65c60f): a spec of the kit, not a players' text: no act, no signer to check.

The same checks on the 11 records outside Money that touch it (to settle, or placed elsewhere): 11 pass, 0 fail.

## 3. To settle, where Money is one of the places

The three wave-2 placements and the inventory's proposal are counted from `inventory-all.json`. **DubPay's column is a proposal**, hand-written in `slice-check-hand.json`; it decides nothing.

| Text | Spec hash | DubWeb | DubPay (wave 2) | DubLaw | Inventory proposes | **DubPay proposes (proposal)** | Reason |
|---|---|---|---|---|---|---|---|
| hours of care, draft 1 (task K7, a Statement kind) | 4a737c66 | Web: open books | Money: 2. Pools and mutual credit | Agreements: 4. Consent and terms for people | Money: 2. Pools and mutual credit | Money: 2. Pools and mutual credit; pointers from Web (open books) and Agreements (4) | a balance of hours owed among members is mutual credit, though no sats move |
| custody receipt, draft 1 | 07f89135 | Web: record and time | not Money (beside): beside: Custody receipt (Turnstile): handover of records, not of money. | Agreements: 4. Consent and terms for people | Web: record and time | Web: record and time; no Money pointer | a handover of records, not of money |
| guide spot, draft 1 | 824698f3 | Money: not DubWeb's: DubPay | not listed | Agreements: 1. When Terms are in force, and who signs | Money: 1. Splits and payout services | Money: 1. Splits and payout services | it pays whoever led a buyer to a sale, the client spot's shape; B missed it |
| Proven claim, draft 1 | ed9a4b4e | Web: record and time | Money: 4. Asking to be paid (invoices, payment requests, answerers that invoice) | Agreements: 3. Disputes | Web: record and time | Web: record and time; pointer from Money 4 | it writes a debt where buyers read it, but asks nobody to pay |
| Proven claim, draft 2 | 51f9afc8 | Web: record and time | Money: 4. Asking to be paid (invoices, payment requests, answerers that invoice) | Agreements: 3. Disputes | Web: record and time | Web: record and time; pointer from Money 4 | as draft 1: a recorded debt, no payment asked |
| delivery receipt, draft 1 | ec1f118d | Web: open books | not Money (beside): beside: Delivery receipt (Kept Word): judges a delivery; refunds hang on it. | Agreements: 4. Consent and terms for people | Web: open books | Web or Agreements (theirs to settle); pointer from Money 3 | it judges a delivery; refunds hang on it but it moves no money |
| the lending shelf, draft 1 | 255551a7 | Agreements: not DubWeb's: DubLaw | Money: 5. Loans and returns | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people; pointer from Money 5 | its own words: no money has to move; Money's loans category keeps a pointer |
| the lending shelf, draft 2 | 43cff6df | Agreements: not DubWeb's: DubLaw | Money: 5. Loans and returns | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people; pointer from Money 5 | as draft 1 |
| home bond, draft 1 | e33943e7 | Web: homes and the way out | Money: 3. Money held (escrow, deposits, refunds, held for you) | Money: other: DubPay | Money: 3. Money held (escrow, deposits, refunds, held for you) | Money: 3. Money held; pointer from Web (homes) | sats set aside and held for a home's residents |
| open books, draft 1 | d740165a | Web: open books | Money: 2. Pools and mutual credit | Web: other: DubWeb | Web: open books | Web: open books; pointer from Money 2 | DubWeb's own: it shows a purse, it moves no money |
| open books, draft 2 | 63560652 | Web: open books | Money: 2. Pools and mutual credit | Web: other: DubWeb | Web: open books | Web: open books; pointer from Money 2 | as draft 1 |
| The client that served the payment (a spot, task K5) | de52a421 | Money: not DubWeb's: DubPay | Money: 1. Splits and payout services | Agreements: 1. When Terms are in force, and who signs | Money: 1. Splits and payout services | Money: 1. Splits and payout services; pointer from Agreements (1) | a payout share to the client that served the payment |
| The client that served the payment (a spot, task K5) | bdcee1a5 | Money: not DubWeb's: DubPay | Money: 1. Splits and payout services | Agreements: 1. When Terms are in force, and who signs | Money: 1. Splits and payout services | Money: 1. Splits and payout services; pointer from Agreements (1) | as draft 2 |
| held for you, draft 1 (a holder's own admission, and how the owner cla | 31b66901 | Web: open books | Money: 3. Money held (escrow, deposits, refunds, held for you) | Agreements: 4. Consent and terms for people | Money: 3. Money held (escrow, deposits, refunds, held for you) | Money: 3. Money held; pointer from Web (open books) | a holder's public admission of money held for others |
| held for you, draft 2 (a holder's own admission, and how the owner cla | 08ae1b2c | Web: open books | Money: 3. Money held (escrow, deposits, refunds, held for you) | Agreements: 4. Consent and terms for people | Money: 3. Money held (escrow, deposits, refunds, held for you) | Money: 3. Money held; pointer from Web (open books) | as draft 1 |
| A room let, in plain words: rent, deposit, and the state of the room.  | d8974b8e | no area: draft-titled, not included | Money: 3. Money held (escrow, deposits, refunds, held for you) | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people; pointer from Money 3 | a let between two people; its deposit is held under escrow, which stays Money |
| A room let, in plain words: rent, deposit, and the state of the room.  | e585b7d3 | no area: draft-titled, not included | Money: 3. Money held (escrow, deposits, refunds, held for you) | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people; pointer from Money 3 | as draft 1 |
| A room let, in plain words: rent, deposit, and the state of the room.  | 52f04b96 | no area: draft-titled, not included | Money: 3. Money held (escrow, deposits, refunds, held for you) | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people | Agreements: 4. Consent and terms for people; pointer from Money 3 | as draft 1 |

## 4. Money texts nobody listed (candidates, inferred)

Rule (counted): a public text act that neither the inventory (any area, nor its draft-titled list) nor B lists, with a heading on its first line, a rule word in its title or sections in its body, and four or more money words (pay, invoice, split, pot, held, deposit, escrow, loan, lend, refund, owed, credit, and their forms) or one in its title. That rule caught 7; reading the texts it nearly caught added 8. Whether each reads as a rule or template is **inferred**. "Other listings" = its act or spec hash appears in DubLaw's or DubWeb's wave-2 listing (counted).

| Act | Window (inferred) | Day | Title | Money words | Acts naming its id | Other listings | Category (inferred) | Reading (inferred) |
|---|---|---|---|---|---|---|---|---|
| 4e37b9cb | until | 1 | # Until: terms and prices, 1 | 23 (hold 5, escrow 4, pay 3, payment 3, refund 2) | 11 | no | 3. Money held | an escrow service's own rules: fee on release, free refund, a late penalty paid to the buyer |
| 0e2d9be9 | until | 1 | # Until: terms and prices, 2 | 21 (hold 6, escrow 3, pay 3, refund 2, held 2) | 9 | yes | 3. Money held | version 2 of Until's terms and prices: the same rules, revised |
| 28a5608f | lurker | 4 | Marthe Delcourt. The last report, draft 0. Plain words, for attack. It is | 21 (owed 6, held 4, owes 3, payment 2, holds 1) | 20 | no | 3. Money held (and what is owed) | a template for a service that stops: held, owed, received, passed on; three rules (lines sum, silence has a clock) |
| fb97b75e | dubpay | 2 | DubPay: how a maker gets paid through the shower, in plain words (part 1 of 3: t | 21 (split 6, paid 4, owed 3, payment 3, pays 2) | 5 | yes | 1. Splits and payout services | a how-to of the split in six steps: parts, leftover, invoices in advance, report |
| ff9e88fb | lurker | 5 | Marthe Delcourt. The last report, draft 1. Plain words, for attack. Still | 14 (holds 3, owed 3, owes 2, held 2, payment 1) | 13 | no | 3. Money held (and what is owed) | draft 1 of the last report: adds order of payment when what is held is short |
| 13c98e04 | hop | 1 | # Hop: price list 2 | 11 (split 3, payment 3, escrow 2, owed 1, paid 1) | 2 | no | 4. Asking to be paid (weak) | a price list with rules for every fee: same for everyone, no private rates |
| 8495d322 | longhouse | 2 | Longhouse paid services, round two, version 1 (a DRAFT for review, not signed; o | 10 (paid 3, payment 3, hold 1, holds 1, refund 1) | 3 | yes | 4. Asking to be paid (weak) | an offer of paid services, a draft for review, not signed |
| 3edd7886 | dubpay | 2 | DubPay: price list 1, round two. One price for everyone; nothing is updated: a n | 9 (split 3, payment 2, holds 1, invoice 1, owed 1) | 3 | yes | 4. Asking to be paid (weak) | DubPay's own price list 1 |
| 412c690e | public-prosumers | 1 | Harmattan Run: terms of sale, version 1, in plain words. Seller and only party:  | 7 (paid 2, payment 2, invoice 1, pays 1, refund 1) | 7 | no | none (Agreements, likely) | terms of sale in plain words, copied by many sellers: a template of a sale, not of money |
| 90294dc2 | keep | 1 | # Keep: price list 4 | 6 (held 2, hold 1, split 1, splits 1, pay 1) | 1 | no | 4. Asking to be paid (weak) | Keep's price list with its terms of the list |
| 57bf8418 | hop | 2 | # Hop: price list 3, and the shower contest | 6 (split 3, paid 2, payment 1) | 1 | yes | 4. Asking to be paid (weak) | Hop's price list 3, with the contest |
| 772bda2f | counterparty | 1 | Counterparty, price list 4 (round two, in sats; 1 sat = 1 euro cent). One price  | 6 (paid 2, split 2, pay 1, payment 1) | 5 | no | 4. Asking to be paid (weak) | Counterparty's price list 4, a shared target; Pointer accepted it for the client spot |
| 63b6f2d4 | counterparty | 5 | # Counterparty: day 5, window 2 | 33 (pay 6, held 5, credit 4, paid 4, payment 3) | 1 | yes | not read as a rule or template | caught by the rule; read and set aside (a report or a reply) |
| aa552d9c | counterparty | 5 | # Counterparty: day 5, window 3, and the end of round two | 32 (split 6, hold 4, owed 4, paid 4, held 3) | 0 | yes | not read as a rule or template | caught by the rule; read and set aside (a report or a reply) |
| 52bd8175 | turnstile | 1 | # Turnstile home: policy | 5 (holds 3, pays 1, held 1) | 5 | no | not read as a rule or template | caught by the rule; read and set aside (a report or a reply) |

Also near Money and already listed, not repeated here: the draft-titled texts the inventory set aside (the room let, the invoice request form) were added by hand or placed; B's "beside" list (shower work, shares nobody may rewrite, delivery receipt, arbiter's award, custody receipt, two tray apps).

## 5. Use counts: the inventory against B, same draft

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

What each counts (traced from both scripts). **Inventory, by hash**: acts naming the spec hash whole, in any slot, read from homes' feeds only. **Inventory, by act**: acts naming an act id of the text whole, or as 8…4, or by its first 8 characters in words. **B, uses**: acts naming the spec hash, the text's SHA-256 or work hash, or the act id in a Terms body or spec slot (anywhere, for texts B marks "named by act id": escrow, room let, invoice request form, DubPay's shape), read from feeds and windows' acts. **B, cited**: acts naming the act id whole in refs or payload, not already uses. "All" = by hash ∪ by act, against uses ∪ cited. Every act in a gap is classed by rule below (counted).

| Text | Draft | Inv. by hash | B uses | Inv. all | B all | B short mentions | >10%? |
|---|---|---|---|---|---|---|---|
| The straight split | 1 | 0 | 0 | 6 | 3 | 3 | all |
| The straight split | 2 | 2 | 2 | 12 | 9 | 3 | all |
| The straight split | 3 | 2 | 2 | 8 | 8 | 0 | no |
| The straight split | 4 | 26 | 26 | 31 | 31 | 6 | no |
| The straight split | 5 | 1 | 1 | 13 | 7 | 8 | all |
| The straight split | 6 | 1 | 1 | 5 | 3 | 6 | all |
| The straight split | 7 (first publication, titled "draft 6") | 5 | 5 | 10 | 7 | 20 | all |
| The straight split | 7 (republished, title corrected) | 89 | 90 | 91 | 92 | 30 | no |
| Hop's split (round two) | 1 | 0 | 0 | 10 | 9 | 1 | no |
| Hop's split (round two) | 2 | 2 | 2 | 9 | 8 | 2 | all |
| Hop's split (round two) | 3 | 1 | 1 | 6 | 4 | 2 | all |
| Hop's split (round two) | 4 | 6 | 6 | 9 | 9 | 2 | no |
| Hop's split (round two) | 5 | 10 | 10 | 12 | 11 | 6 | no |
| Stall's pass-on and Stall split | 2 | 10 | 10 | 13 | 13 | 4 | no |
| The client that served the payment (a spot) | 2 | 15 | 15 | 20 | 20 | 4 | no |
| The client that served the payment (a spot) | 3 | 5 | 5 | 8 | 8 | 1 | no |
| The payment report (the report block, proposal 4) | proposal 4 | 81 | 81 | 81 | 81 | 0 | no |
| DubPay's common pot | 1 | 20 | 20 | 30 | 24 | 9 | all |
| DubPay's common pot | 2 | 1 | 1 | 3 | 2 | 1 | all |
| The clusters' rotating pot | 1 | 2 | 2 | 12 | 12 | 0 | no |
| Hop's tab (clearing a group's debts) | 1 | 2 | 2 | 5 | 4 | 2 | all |
| Plain Words' money decision (a Statement kind) | 1 | 0 | 0 | 3 | 3 | 0 | no |
| Plain Words' money decision (a Statement kind) | 2 | 0 | 0 | 5 | 5 | 0 | no |
| Plain Words' money decision (a Statement kind) | 3 | 0 | 0 | 5 | 4 | 0 | all |
| Plain Words' money decision (a Statement kind) | 4 | 0 | 1 | 3 | 4 | 0 | headline, all |
| Plain Words' money decision (a Statement kind) | 5 | 14 | 15 | 18 | 18 | 3 | no |
| DubWeb's open books | 1 | 2 | 2 | 8 | 8 | 2 | no |
| DubWeb's open books | 2 | 1 | 1 | 5 | 4 | 1 | all |
| Hours of care (a Statement kind, for circles that swap time) | 1 | 5 | 5 | 8 | 8 | 3 | no |
| Until's escrow | 1 | 0 | 10 | 18 | 10 | 2 | headline, all |
| Until's escrow | 2 | 0 | 11 | 16 | 11 | 2 | headline, all |
| Until's escrow | 3 | 0 | 16 | 20 | 16 | 2 | headline, all |
| Until's escrow | 4 | 5 | 23 | 27 | 23 | 8 | headline, all |
| Until's escrow | 5 | 2 | 8 | 9 | 8 | 2 | headline, all |
| Until's home bond | 1 | 3 | 3 | 8 | 8 | 2 | no |
| Plain Words' room let (rent, deposit, the state of the room) | 1 | 0 | 6 | 10 | 6 | 4 | headline, all |
| Plain Words' room let (rent, deposit, the state of the room) | 2 | 0 | 4 | 7 | 4 | 2 | headline, all |
| Plain Words' room let (rent, deposit, the state of the room) | 3 | 0 | 3 | 3 | 3 | 0 | headline |
| Stall's held for you | 1 | 1 | 1 | 28 | 24 | 8 | all |
| Stall's held for you | 2 | 2 | 2 | 10 | 10 | 1 | no |
| Invoice request form (piece A of Commission 1) | 1 | 0 | 11 | 12 | 11 | 1 | headline |
| Invoice request form (piece A of Commission 1) | 2 | 0 | 4 | 4 | 4 | 0 | headline |
| Plain Words' period payment (a Statement kind) | 1 | 3 | 3 | 7 | 7 | 0 | no |
| Proven claim (a register of debts) | 1 | 13 | 12 | 27 | 21 | 10 | all |
| Proven claim (a register of debts) | 2 | 2 | 2 | 5 | 5 | 0 | no |
| Steward & Co.'s lending shelf | 1 | 13 | 13 | 19 | 15 | 6 | all |
| Steward & Co.'s lending shelf | 2 | 1 | 1 | 3 | 3 | 0 | no |

Differences of more than 10%, explained (counted, by rule):

- **The straight split, 1** (by hash 0 vs uses 0; all 6 vs 3):
  - all: 3 counted by the inventory, not by B: 3 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **The straight split, 2** (by hash 2 vs uses 2; all 12 vs 9):
  - all: 3 counted by the inventory, not by B: 3 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **The straight split, 5** (by hash 1 vs uses 1; all 13 vs 7):
  - all: 6 counted by the inventory, not by B: 6 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **The straight split, 6** (by hash 1 vs uses 1; all 5 vs 3):
  - all: 2 counted by the inventory, not by B: 2 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **The straight split, 7 (first publication, titled "draft 6")** (by hash 5 vs uses 5; all 10 vs 7):
  - all: 3 counted by the inventory, not by B: 3 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Hop's split (round two), 2** (by hash 2 vs uses 2; all 9 vs 8):
  - all: 1 counted by the inventory, not by B: 1 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Hop's split (round two), 3** (by hash 1 vs uses 1; all 6 vs 4):
  - all: 2 counted by the inventory, not by B: 2 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **DubPay's common pot, 1** (by hash 20 vs uses 20; all 30 vs 24):
  - all: 6 counted by the inventory, not by B: 6 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **DubPay's common pot, 2** (by hash 1 vs uses 1; all 3 vs 2):
  - all: 1 counted by the inventory, not by B: 1 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Hop's tab (clearing a group's debts), 1** (by hash 2 vs uses 2; all 5 vs 4):
  - all: 1 counted by the inventory, not by B: 1 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Plain Words' money decision (a Statement kind), 3** (by hash 0 vs uses 0; all 5 vs 4):
  - all: 1 counted by the inventory, not by B: 1 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Plain Words' money decision (a Statement kind), 4** (by hash 0 vs uses 1; all 3 vs 4):
  - headline: 1 counted by B, not by the inventory: 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 1 counted by B, not by the inventory: 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
- **DubWeb's open books, 2** (by hash 1 vs uses 1; all 5 vs 4):
  - all: 1 counted by the inventory, not by B: 1 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Until's escrow, 1** (by hash 0 vs uses 10; all 18 vs 10):
  - headline: 10 counted by B, not by the inventory: 8 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs: B counts this, the inventory's by-hash rule counts the spec hash only; 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 1 counted by B, not by the inventory: 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 9 counted by the inventory, not by B: 9 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Until's escrow, 2** (by hash 0 vs uses 11; all 16 vs 11):
  - headline: 11 counted by B, not by the inventory: 9 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 1 counted by B, not by the inventory: 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 6 counted by the inventory, not by B: 6 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Until's escrow, 3** (by hash 0 vs uses 16; all 20 vs 16):
  - headline: 16 counted by B, not by the inventory: 13 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in payload+body: B counts this, the inventory's by-hash rule counts the spec hash only; 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 1 counted by B, not by the inventory: 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
  - all: 5 counted by the inventory, not by B: 5 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Until's escrow, 4** (by hash 5 vs uses 23; all 27 vs 23):
  - headline: 18 counted by B, not by the inventory: 3 names act id in refs: B counts this, the inventory's by-hash rule counts the spec hash only; 2 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only; 10 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 3 names act id in payload+body: B counts this, the inventory's by-hash rule counts the spec hash only.
  - all: 4 counted by the inventory, not by B: 4 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Until's escrow, 5** (by hash 2 vs uses 8; all 9 vs 8):
  - headline: 6 counted by B, not by the inventory: 6 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only.
  - all: 1 counted by the inventory, not by B: 1 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Plain Words' room let (rent, deposit, the state of the room), 1** (by hash 0 vs uses 6; all 10 vs 6):
  - headline: 6 counted by B, not by the inventory: 2 names act id in refs: B counts this, the inventory's by-hash rule counts the spec hash only; 3 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only.
  - all: 4 counted by the inventory, not by B: 4 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Plain Words' room let (rent, deposit, the state of the room), 2** (by hash 0 vs uses 4; all 7 vs 4):
  - headline: 4 counted by B, not by the inventory: 2 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only.
  - all: 3 counted by the inventory, not by B: 3 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Plain Words' room let (rent, deposit, the state of the room), 3** (by hash 0 vs uses 3; all 3 vs 3):
  - headline: 3 counted by B, not by the inventory: 3 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only.
- **Stall's held for you, 1** (by hash 1 vs uses 1; all 28 vs 24):
  - all: 4 counted by the inventory, not by B: 4 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Invoice request form (piece A of Commission 1), 1** (by hash 0 vs uses 11; all 12 vs 11):
  - headline: 11 counted by B, not by the inventory: 8 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 2 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 held only in windows' acts/, in no home's feed: B reads these, the inventory does not.
- **Invoice request form (piece A of Commission 1), 2** (by hash 0 vs uses 4; all 4 vs 4):
  - headline: 4 counted by B, not by the inventory: 3 names act id in payload: B counts this, the inventory's by-hash rule counts the spec hash only; 1 names act id in refs+payload: B counts this, the inventory's by-hash rule counts the spec hash only.
- **Proven claim (a register of debts), 1** (by hash 13 vs uses 12; all 27 vs 21):
  - all: 6 counted by the inventory, not by B: 6 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.
- **Steward & Co.'s lending shelf, 1** (by hash 13 vs uses 13; all 19 vs 15):
  - all: 4 counted by the inventory, not by B: 4 names it only by short form (8…4) or first 8 characters in words: the inventory counts these, B keeps them apart as short mentions.

## 6. Limits

- Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works. No count here says a split, pot, escrow, loan or invoice rule works.
- Acts are read with listing B's reader, not the inventory's: the spec hash computes to the inventory's for every Money record with an act, and the one without (the report block) equals the core library's report spec (traced), but the inventory reads homes' feeds only and B reads windows' acts too, which explains the few acts one side holds and the other does not.
- Draft order is checked by the postman's first carrying time and the numbers in titles; a draft with no carry record is checked by title only.
- "Says it is Money's?", the candidate readings and DubPay's placements are readings (inferred, proposals), kept in `slice-check-hand.json` so they can be argued line by line. The candidate rule is one rule; other money rules may sit in replies or reports it does not catch.
- B's media, Terms and script items are compared by key only; the inventory lists texts, so their absence there is by rule, not a fault.
- Nothing was signed, posted or paid; no key was read.
