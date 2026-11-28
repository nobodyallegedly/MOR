# Inventory version 2: what changed from version 1

*DubWeb wave 3, session F, 26 November 2026. Nobody, allegedly. Written by `changes.mjs` from `../inventory/inventory-all.json` (version 1, unchanged) and `inventory-all.json` (version 2). Areas are proposals; nothing is decided.*

**Used is not checked:** the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

## 1. In plain words

1. **Records:** 116 in version 1, 121 in version 2 (5 added, 0 removed). Money 39 → 39, Agreements 41 → 50, Web 36 → 32. To settle 35 → 8.
2. **35 records changed** area, category, settled state or marks (section 2), each with the check that asked for it.
3. **DubLaw's six additions are five texts here.** DubLaw lists Counterparty's plain-words body "in two copies (61bcdb5b… and ee0fd121…)". The copy holds one text act, `ee0fd121…e681`; `61bcdb5b…4528` is no act in the copy but the fingerprint DubLaw's listing gives as "sha256 of its opening sentences". One record carries both keys. So DubLaw's proposed slice of 51 is 50 records here; the difference is that one text.
4. **Still to settle:** 8 records (section 3), all placed by no Dub in wave 2 and spoken to by neither check. They keep version 1's proposal and both (empty) placements.
5. **Not applied, and why:** DubPay's twelve "Money texts nobody listed" are candidates it marks as inferred, and the order adds no new text; DubLaw's Stall "pass-on by the receiver (K6)" "stays with Money" and is in neither check's list of texts to add, so it is not added. Both stay in their checks.

## 2. Every record that changed

| Text | Spec hash | Version 1 | Version 2 | Asked by |
|---|---|---|---|---|
| cMIP hours of care, draft 1 (task K7, a Statement kind) | `4a737c66…04a1` | Money: 2. Pools and mutual credit; to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP custody receipt, draft 1 | `07f89135…fdf2` | Web: record and time; to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP custody receipt, draft 2 | `6c171904…af7d` | Web: record and time; to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP guide spot, draft 1 | `824698f3…b708` | Money: 1. Splits and payout services; to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP Proven claim, draft 1 | `ed9a4b4e…1648` | Web: record and time; to settle | area Web → Agreements; category "record and time" → "3. Disputes"; to settle → settled; marked: seam with DubWeb | DubLaw's slice check; DubPay's slice check |
| cMIP Proven claim, draft 2 | `51f9afc8…9f0a` | Web: record and time; to settle | area Web → Agreements; category "record and time" → "3. Disputes"; to settle → settled; marked: seam with DubWeb | DubLaw's slice check; DubPay's slice check |
| cMIP delivery receipt, draft 1 | `ec1f118d…4bc7` | Web: open books; to settle | area Web → Agreements; category "open books" → "4. Consent and terms for people"; to settle → settled; marked: seam with DubWeb | DubLaw's slice check |
| cMIP delivery receipt, draft 2 | `9e19e62c…2a2a` | Web: open books; to settle | area Web → Agreements; category "open books" → "4. Consent and terms for people"; to settle → settled; marked: seam with DubWeb | DubLaw's slice check |
| cMIP the lending shelf, draft 1 | `255551a7…b536` | Agreements: 4. Consent and terms for people; to settle | to settle → settled | DubPay's slice check; DubLaw's slice check |
| cMIP the lending shelf, draft 2 | `43cff6df…4be5` | Agreements: 4. Consent and terms for people; to settle | to settle → settled | DubPay's slice check; DubLaw's slice check |
| cMIP home bond, draft 1 | `e33943e7…41b0` | Money: 3. Money held (escrow, deposits, refunds, held for you); to settle | to settle → settled | DubPay's slice check |
| cMIP open books, draft 1 | `d740165a…0310` | Web: open books; to settle | to settle → settled | DubPay's slice check |
| cMIP open books, draft 2 | `63560652…687e` | Web: open books; to settle | to settle → settled | DubPay's slice check |
| cMIP: The client that served the payment (a spot, task K5) | `de52a421…59fa` | Money: 1. Splits and payout services; to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP: The client that served the payment (a spot, task K5) | `bdcee1a5…7ca2` | Money: 1. Splits and payout services; to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP: the straight split, draft 6 | `4f8626c7…0083` | Money: 1. Splits and payout services; settled | marked: two drafts titled "draft 6" | DubPay's slice check |
| cMIP: the straight split, draft 6 | `47c874cb…d77b` | Money: 1. Splits and payout services; settled | marked: two drafts titled "draft 6" | DubPay's slice check |
| cMIP lineup vote, draft 1 | `4d0ac025…189a` | Agreements: 2. Ownership and collectives; to settle | to settle → settled | DubLaw's slice check |
| cMIP lineup vote, draft 2 | `2e75ebb3…1b8d` | Agreements: 2. Ownership and collectives; to settle | to settle → settled | DubLaw's slice check |
| cMIP lineup vote, draft 3 | `c733ea11…2577` | Agreements: 2. Ownership and collectives; to settle | to settle → settled | DubLaw's slice check |
| cMIP lineup vote, draft 4 | `94f815ca…ec29` | Agreements: 2. Ownership and collectives; to settle | to settle → settled | DubLaw's slice check |
| cMIP held for you, draft 1 (a holder's own admission, and how the owne | `31b66901…dfb1` | Money: 3. Money held (escrow, deposits, refunds, held for you); to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP held for you, draft 2 (a holder's own admission, and how the owne | `08ae1b2c…7b9f` | Money: 3. Money held (escrow, deposits, refunds, held for you); to settle | to settle → settled | DubLaw's slice check; DubPay's slice check |
| cMIP findings held in trust, draft 1 (coordinated disclosure) | `0d23dd94…0839` | Web: identity safety; to settle | to settle → settled | DubLaw's slice check |
| cMIP findings held in trust, draft 2 (coordinated disclosure) | `3a14c454…770a` | Web: identity safety; to settle | to settle → settled | DubLaw's slice check |
| Handover check, draft 1 | `5f7cfa2b…8fd3` | Web: homes and the way out; to settle | to settle → settled | DubLaw's slice check |
| A room let, in plain words: rent, deposit, and the state of the room.  | `d8974b8e…21dc` | Agreements: 4. Consent and terms for people; to settle | to settle → settled | DubPay's slice check; DubLaw's slice check |
| A room let, in plain words: rent, deposit, and the state of the room.  | `e585b7d3…52ce` | Agreements: 4. Consent and terms for people; to settle | to settle → settled | DubPay's slice check; DubLaw's slice check |
| A room let, in plain words: rent, deposit, and the state of the room.  | `52f04b96…a6b0` | Agreements: 4. Consent and terms for people; to settle | to settle → settled | DubPay's slice check; DubLaw's slice check |
| The report block, proposal 4 | `7b65c60f…7854` | Money: 1. Splits and payout services; settled | marked: the kit's own spec | DubPay's slice check |
| Stall cMIP: in force on the sellers' assents (task K2, in_force), draf | `a188d311…bba6` | no record | Agreements: 1. When Terms are in force, and who signs; settled; added by hand (named by act id only) | DubLaw's slice check |
| Stall cMIP: the buyer's spot (task K5, a role of kind done), draft 1.  | `6d68a808…4bd9` | no record | Agreements: 1. When Terms are in force, and who signs; settled; added by hand (named by act id only) | DubLaw's slice check |
| Stall cMIP: the seller may change the offer, or leave its service alon | `687572c7…a0d3` | no record | Agreements: 2. Ownership and collectives; settled; added by hand (named by act id only) | DubLaw's slice check |
| Stall cMIP: the seller may change an offer for future buyers (task K4, | `1d13e1e9…b808` | no record | Agreements: 2. Ownership and collectives; settled; added by hand (named by act id only) | DubLaw's slice check |
| Counterparty plain-words body, version 1. The words of Terms that name | `80658862…e51b` | no record | Agreements: 4. Consent and terms for people; settled; added by hand (named by act id only) | DubLaw's slice check |

What each check says, per work (from the record's `checks_wave_3.says`):

- **hours of care**: Conceded to Money by DubLaw ("mutual credit"); DubPay proposes "Money: 2 … pointers from Web (open books) and Agreements (4)". DubWeb's wave-2 placement was Web; its wave-3 inventory already proposed Money.
- **custody receipt**: Conceded to Web by DubLaw ("record and time"); DubPay proposes "Web: record and time; no Money pointer".
- **guide spot**: Conceded to Money by DubLaw ("a payout share"). DubPay: "One is only in the inventory: guide spot (Turnstile), which B missed"; it proposes "Money: 1. Splits and payout services".
- **proven claim**: Contested, kept in Agreements: "It settles a claim … that is disputes, category 3. The register that later buyers read is DubWeb's. Seam with DubWeb." DubWeb conceded (26 November). DubPay proposed Web with a pointer from Money 4; its pointer stands.
- **delivery receipt**: Contested, kept in Agreements: "The receipt is what an agreement's performance is proven by … DubWeb shows it. Seam with DubWeb." DubWeb conceded (26 November). DubPay had set it beside Money ("Web or Agreements (theirs to settle)").
- **the lending shelf**: DubPay proposes "Agreements: 4 … pointer from Money 5"; it is among DubLaw's 37 agreed.
- **home bond**: DubPay proposes "Money: 3. Money held; pointer from Web (homes)". DubLaw placed it "other: DubPay" in wave 2 and does not contest it. DubWeb's wave-2 placement was Web; its wave-3 inventory already proposed Money.
- **open books**: DubPay proposes "Web: open books; pointer from Money 2". DubLaw placed it "other: DubWeb" in wave 2.
- **the client that served the payment**: Conceded to Money by DubLaw ("a payout share"); DubPay proposes "Money: 1 … pointer from Agreements (1)".
- **the straight split**: DubPay traced it: "the straight split has two drafts titled 'draft 6'" (7e0ac8f1 and 333bdbc7). Opened here: Counterparty's act 7555d468…f119 calls spec 47c874cb… "straight split draft 7 as first published (spec 47c874cb…, now withdrawn)", whose text "differs from the withdrawn one in the first line only, 'draft 6' to 'draft 7'" (reissued as act b9e43db4…, spec e51e8653…). So 333bdbc7 is draft 7 under a wrong title; a join by title merges it with draft 6.
- **lineup vote**: Accepted into Agreements: lineup vote, drafts 1 to 4. "A group's vote under Terms is a collective's rule (category 2)." DubWeb accepted (26 November).
- **held for you**: Conceded to Money by DubLaw ("money held"); DubPay proposes "Money: 3. Money held; pointer from Web (open books)". DubWeb's wave-2 placement was Web; its wave-3 inventory already proposed Money.
- **findings held in trust**: Conceded to Web by DubLaw ("identity safety"). DubPay does not list it.
- **handover check**: Conceded to Web by DubLaw ("a home's way out"). DubPay does not list it.
- **room let**: DubPay proposes "Agreements: 4 … pointer from Money 3"; it is among DubLaw's 37 agreed.
- **report block**: DubPay traced it: "the report block is the kit's own spec, with no act"; its spec hash "equals the core library's report spec".
- **in force on the sellers' assents**: To add to Agreements: "the six texts named only by act id. Each answers an Agreements socket." DubWeb accepted (26 November).
- **the buyer's spot**: To add to Agreements: "the six texts named only by act id. Each answers an Agreements socket." DubWeb accepted (26 November).
- **change the offer, or leave its service alone**: To add to Agreements: "the six texts named only by act id. Each answers an Agreements socket." DubWeb accepted (26 November).
- **change an offer for future buyers**: To add to Agreements: "the six texts named only by act id. Each answers an Agreements socket." DubWeb accepted (26 November).
- **plain-words body**: To add to Agreements: "the six texts named only by act id. Each answers an Agreements socket." DubWeb accepted (26 November).

## 3. Still to settle (unchanged)

| Text | Proposed | Why still open |
|---|---|---|
| Keep recovery, draft 1: MOR for people who will never hold a key | Web: identity safety | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb no area: draft-titled, not included; DubPay not listed; DubLaw not listed. |
| Keep recovery, draft 2: the right person, decided by people who know t | Web: identity safety | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb no area: draft-titled, not included; DubPay not listed; DubLaw not listed. |
| Keep recovery, draft 2: the right person, decided by people who know t | Web: identity safety | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb no area: draft-titled, not included; DubPay not listed; DubLaw not listed. |
| Until's home: policy, version 1 | Web: homes and the way out | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb no area: draft-titled, not included; DubPay not listed; DubLaw not listed. |
| Until's home: policy, version 2 | Web: homes and the way out | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb no area: draft-titled, not included; DubPay not listed; DubLaw not listed. |
| A ring of names, draft 2: the words of Beatrice's ring, in the shape o | Web: identity safety | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb not listed; DubPay not listed; DubLaw not listed. |
| Word in advance 1, of Odile Ferrant: what to believe about this identi | Web: identity safety | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb not listed; DubPay not listed; DubLaw not listed. |
| Anchoring cMIP, draft 8 (Longhouse runs it) | Web: record and time | Neither slice check speaks to it: DubPay's does not list it as Money, and DubLaw's 58 do not hold it. It stays to settle, as version 1 had it. Wave 2: DubWeb not listed; DubPay not listed; DubLaw not listed. |

## 4. Rerun

`MOR_RESEARCH=~/Documents/mor-round-2/_research node wave3.mjs`, then `node changes.mjs`, both in this folder. inventory-run.json is version 1's, copied unchanged (inventory.mjs reruns to it byte for byte, as `check-inv/` showed).
