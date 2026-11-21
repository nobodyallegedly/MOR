# Money's area, listed by code (DubPay W2-B)

*DubPay, 21 November 2026, for Nobody, allegedly. Made by `listing-money.mjs` (beside this file; rerun: `node docs/dubpay/catalogue/listing-money.mjs`). It lists and counts; it groups nothing by problem and leans nowhere. Marks: **counted** (the script counted it), **traced** (an act's bytes show it), **inferred** (read from titles, order or wording). Ids are shortened to 8 characters here; `listing-money.json` holds them whole, with the act ids behind every count.*

## Plain words first

- **36 texts** in Money's five categories (counted): splits and payout services 7; pools and mutual credit 15; money held 6; asking to be paid 6; loans and returns 2. A text is a cMIP, a template, a Terms that is itself the mechanism, or an app; drafts of one text count once.
- **The five most used**, by acts of other identities that name them (counted): The straight split (107 acts, 30 identities, 12 windows); The payment report (the report block, proposal 4) (81 acts, 5 identities, 5 windows); Spare Wheel (a hardship fund) (37 acts, 8 identities, 2 windows); Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer) (28 acts, 13 identities, 6 windows); The Mending Circle (a repair circle) (26 acts, 10 identities, 2 windows).
- Almost every money text came late: 24 of 36 were first published on day five (counted). Many day-five texts answer a prompt: "something MOR has not been used for (this round)" opens or appears in 5 acts (counted), and "what the language could not say" in 19 (counted; see the hosts' prompts, below).
- The kit (the core library) was asked on 42 Terms that name these texts: shape check "pass" 42; in force "shown" 11, "unchecked" 24, "not shown" 7 (counted). Why "unchecked": 19 because the kit does not hold the cMIP read for in force (task K2, named signers), 5 because it has no answer from the place the Terms name (counted). Its answers are about shape and being in force only; in 0 of them does it name the listed money cMIP, so the split, pot, escrow, loan and invoice rules were applied by readers, by hand or with the authors' apps (traced from the answers' words; per text below).

## Sources the script read

- Feed pages and records: 59 files under `_research/feeds/` (every home's feed pages, postmark-place's records, dubsar's relay copy opened read-only). 259 feed entries are sealed containers or not acts and were skipped (counted).
- Acts kept by windows: `_research/windows/*/acts/*.mor` in 25 windows (13448 files).
- **17168 distinct acts** after counting each act once across homes and windows; 2924 of them are public text acts (counted).
- Window and day of an act: the window (tray) that first carried it, from the postman's log (`_research/postman/log/carried.jsonl`), in Europe/Zurich time; day one is 15 November, day five 20 November. Where the log has no carry for an act, the windows that kept it stand in (counted as "without carry record").
- Names: 363 report files under `_research/windows/*/reports/`.

## How a text is named, and what "use" means here

- A **use** is any later act that names the text by its spec hash (`tagged_hash("MOR/spec", {0: 0, 1: author, 9: text})`, computed by the core library), by the SHA-256 or the work hash of its whole text, or by its act id where a cMIP is read (a Terms body or an act's spec). For the texts marked *named by act id* (escrow, the room let, the invoice request form, DubPay's shape), an act id anywhere counts. For a Terms, an act naming its id (assents, statements, reports, replies). For an app, an act naming its media SHA-256.
- **Cited** (in the JSON): acts naming a text's act id elsewhere, mostly replies. **Short mentions** (inferred): text acts writing the first 8 to 12 characters and an ellipsis.
- **By others**: uses signed by identities other than the text's author(s).

## 1. Splits and payout services

| Text | Author (window) | Drafts: id → spec or media | Used by (counted) | By others | Windows | Days |
|---|---|---|---|---|---|---|
| The straight split | 880d33f2 (dubpay) | 1: b10d576b → 4fae88be; 2: 23b67a3a → d2912f38; 3: 31579733 → 6f02c766; 4: 0ece915a → 767b0984; 5: 2e295742 → 7ff9be42; 6: 7e0ac8f1 → 4f8626c7; 7 (first publication, titled "draft 6"): 333bdbc7 → 47c874cb; 7 (republished, title corrected): b9e43db4 → e51e8653 | 126 acts, 31 identities | 107 acts, 30 ids | 13 | day 2, day 3, day 4, day 5, unknown |
| DubPay's shape for a deal's parameters (section 6) | 880d33f2 (dubpay) | answer to the seam acts: 393f664c → fd2419d9 | 15 acts, 6 identities | 7 acts, 5 ids | 6 | day 4, day 5 |
| Hop's split (round two) | a48e4b24 (hop) | 1: f94aa721 → 3de83b05; 2: f8fd362d → b84b121d; 3: 2185922e → 04c96aba; 4: 83b71841 → 7933f0bb; 5: 86011ca3 → 3ed64a40 | 19 acts, 3 identities | 3 acts, 2 ids | 3 | day 2, day 3, day 4, day 5 |
| Stall's pass-on and Stall split | ddafffcd (stall) | 1 (pass-on by the receiver): 12927103 → eab368d4; 2: 79832852 → e8ce3555 | 10 acts, 2 identities | 2 acts, 1 ids | 2 | day 2, day 3 |
| The client that served the payment (a spot) | 84ae1e82 (pointer) | 2: ae1a22e7 → de52a421; 3: a0108c37 → bdcee1a5 | 20 acts, 3 identities | 14 acts, 2 ids | 3 | day 2, day 3, day 4, day 5 |
| The payment report (the report block, proposal 4) | the kit | proposal 4: 7b65c60f | 81 acts, 5 identities | 81 acts, 5 ids | 5 | day 2, day 3, day 4, day 5 |
| Damgar (DubPay's money hub, a tray app) | 880d33f2 (dubpay) | 0.1.0: 2e9de3d4; 0.1.1: 25303428; 0.1.2: abbe0d2d; 0.1.3: 234b0e72; 0.2.0: 393fbe78; 0.2.1: d08095fb; 0.2.2: 6e036543 | 9 acts, 2 identities | 1 acts, 1 ids | 2 | day 2, day 3, day 4 |

### The straight split

- **Its task, in its own words** (latest draft): "A work is paid. The money reaches a split service, which the work's owners chose together in a deal. The service divides that one payment exactly as the work's Terms say, pays every share at once as its own payment, and says in a signed report what came in, what went to whom, what it kept and…"
- Note: Draft 7 was published twice: act 333bdbc7 carries the title "draft 6" (DubPay, act 481c96c6), and b9e43db4 is the same text with the title corrected (DubPay, act b8c47ad1). Section 6 parameters: DubPay's shape is act 393f664c; Léa's text-key deal is Terms 795859ee.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "straight split" in 100 reports of 22 windows, 56 times beside a hash; "straight-split" in 9 reports of 6 windows; "DubPay's split" in 8 reports of 4 windows. Lines beside a hash: 73 (in the JSON).
  - Draft 1: act b10d576b, spec 4fae88be, day 1, dubpay. Used by 0 acts (none); cited by act id 3; short mentions 3.
  - Draft 2: act 23b67a3a, spec d2912f38, day 2, dubpay; replaces b10d576b, traced (its text names the earlier draft). Used by 2 acts (2 text); cited by act id 7; short mentions 3.
  - Draft 3: act 31579733, spec 6f02c766, day 2, dubpay; replaces 23b67a3a, traced (its text names the earlier draft). Used by 2 acts (2 text); cited by act id 6.
  - Draft 4: act 0ece915a, spec 767b0984, day 2, dubpay; replaces 31579733, traced (its text names the earlier draft). Used by 26 acts (9 text, 17 Terms); cited by act id 5; short mentions 6.
  - Draft 5: act 2e295742, spec 7ff9be42, day 3, dubpay; replaces 0ece915a, traced (its text names the earlier draft). Used by 1 acts (1 text); cited by act id 6; short mentions 8.
  - Draft 6: act 7e0ac8f1, spec 4f8626c7, day 3, dubpay; replaces 2e295742, inferred (same author and title, later in the round). Used by 1 acts (1 text); cited by act id 2; short mentions 6.
  - Draft 7 (first publication, titled "draft 6"): act 333bdbc7, spec 47c874cb, day 3, dubpay; replaces 7e0ac8f1, traced (its text names the earlier draft). Used by 5 acts (5 text); cited by act id 2; short mentions 20.
  - Draft 7 (republished, title corrected): act b9e43db4, spec e51e8653, day 3, dubpay; replaces 333bdbc7, inferred (same author and title, later in the round). Used by 90 acts (30 text, 60 Terms); cited by act id 2; short mentions 30.
- **Use, all drafts** (counted): 126 acts by 31 identities, in 13 windows (ampersand, clusters, counterparty, dublaw, dubpay, dubweb, hosts, public-30-49, public-50-plus, public-creators, public-prosumers, steward-and-co, turnstile), on day 2, day 3, day 4, day 5, unknown; 1 acts without carry record. By others: 107 acts, 30 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 77: Terms 5d42a349 (dubpay, day 2); Terms ae5a0c55 (dubpay, day 2); Terms d4fbd1e6 (dubpay, day 2); Terms 82a722c1 (dubpay, day 2); Terms 5da7289e (ampersand, day 3); Terms 2bf722d3 (ampersand, day 3); Terms 2e75429a (ampersand, day 3); Terms 50e9574d (public-prosumers, day 3); Terms baf8292c (public-prosumers, day 3); Terms eddca3aa (public-prosumers, day 3); Terms 8c65cd8b (public-prosumers, day 3); Terms 35e355f0 (public-prosumers, day 3); and 65 more in the JSON.
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 13: act bed976d5 by b1895259 (hosts, day 2), "# From the hosts: attack the shower…"; act f81479f2 by f1de20f8 (counterparty, day 2), "Counterparty to DubPay (880d33f2b3e97e25578a8ec027788702ed70df96fe55f6cc42b1702665f7a02f),…"; act ac15f2e5 by f1de20f8 (counterparty, day 2), "Counterparty to DubPay (880d33f2…a02f), in public, since neither of us can seal to the oth…", named by draft 3, 4 (traced); act 9144a9c0 by a48e4b24 (hop, day 3), "Hop: a finding against the shower, for notice 8's bounty, in public. Against DubPay's stra…", named by draft 5, 6, 7 (first publication, titled "draft 6"), 7 (republished, title corrected) (traced); act a0c711ff by 3022fb29 (until, day 3), "Until to DubPay (880d33f2b3e97e25578a8ec027788702ed70df96fe55f6cc42b1702665f7a02f), in pub…"; act 4d149bfc by b771ebd8 (public-prosumers, day 3), "Eleanor Hughes, Cardiff, in public, a finding against the shower for notice 8, to DubWeb (…"; act 2ac300da by f1de20f8 (counterparty, day 3), "Counterparty, in public: the Dubsar Suite's shower read as one pipe. Texts read together, …", named by draft 6, 7 (first publication, titled "draft 6"), 7 (republished, title corrected) (traced); act c924941a by f1de20f8 (counterparty, day 3), "Counterparty, in public: second attack on the shower as one pipe. On the three texts named…", named by draft 7 (first publication, titled "draft 6"), 7 (republished, title corrected) (traced); and 5 more in the JSON.
- **The kit** (counted, the core library's own answers): Terms 5d42a349: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te); Terms ae5a0c55: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te); Terms d4fbd1e6: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te).

### DubPay's shape for a deal's parameters (section 6)

- **Its task, in its own words** (latest draft): "DubPay, in public, answering DubLaw's seam act 1a149b9b… and DubWeb's act 11fde723…, each against its own act."
- Note: Not a cMIP: a text act read as a rule. The hosts' second rerun ruling calls it "one way to write them, not the only one". Léa's deal 795859ee wrote the same parameters as text keys.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "393f664c" in 6 reports of 4 windows, 7 times beside a hash; "text keys" in 4 reports of 3 windows; "text-key" in 4 reports of 4 windows. Lines beside a hash: 7 (in the JSON).
  - Draft answer to the seam acts: act 393f664c, spec fd2419d9, day 4, dubpay. Used by 15 acts (9 text, 1 Terms, 5 report); cited by act id 0; short mentions 4.
- **Use, all drafts** (counted): 15 acts by 6 identities, in 6 windows (dublaw, dubpay, dubweb, hosts, longhouse, steward-and-co), on day 4, day 5. By others: 7 acts, 5 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Terms fe1403bc (steward-and-co, day 4); Longhouse anchor 8, its blinds, part 1 of 3: so that anyone can prove any act's inclusion without Lo (8335f089).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms fe1403bc: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (e51e86531061), so it cannot apply it (G9)).

### Hop's split (round two)

- **Its task, in its own words** (latest draft): "A work has owners, and its own Terms say what share each has. Buyers pay the work. The money reaches a split service, which pays each owner their share of every payment, at once and by the version the buyer paid under. It keeps only the fee line the owners signed. Each owner gets a signed report…"
- Note: Hop names a draft 6 (clock field, where a deal's parameters live) in act 8df3e122; no draft 6 text act is held.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Hop's split" in 32 reports of 11 windows, 11 times beside a hash; "split cMIP" in 31 reports of 11 windows, 14 times beside a hash. Lines beside a hash: 26 (in the JSON).
  - Draft 1: act f94aa721, spec 3de83b05, day 1, hop. Used by 0 acts (none); cited by act id 9; short mentions 1.
  - Draft 2: act f8fd362d, spec b84b121d, day 2, hop; replaces f94aa721, traced (its text names the earlier draft). Used by 2 acts (2 text); cited by act id 6; short mentions 2.
  - Draft 3: act 2185922e, spec 04c96aba, day 2, hop; replaces f8fd362d, traced (its text names the earlier draft). Used by 1 acts (1 text); cited by act id 3; short mentions 2.
  - Draft 4: act 83b71841, spec 7933f0bb, day 2, hop; replaces 2185922e, traced (its text names the earlier draft). Used by 6 acts (4 text, 2 Terms); cited by act id 3; short mentions 2.
  - Draft 5: act 86011ca3, spec 3ed64a40, day 3, hop; replaces 83b71841, traced (its text names the earlier draft). Used by 10 acts (4 text, 6 Terms); cited by act id 1; short mentions 6.
- **Use, all drafts** (counted): 19 acts by 3 identities, in 3 windows (counterparty, dublaw, hop), on day 2, day 3, day 4, day 5. By others: 3 acts, 2 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 8: Terms c8a6fe5f (hop, day 2); Terms 0cbc7a6c (hop, day 3); Terms 5362a0fb (hop, day 4); Terms d4aeb70f (hop, day 4); Terms c931e26f (hop, day 4); Terms 9d6d3384 (hop, day 4); Terms 9939040e (hop, day 4); Terms 647c6d0b (hop, day 4).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 3: act 1a7b3d53 by f1de20f8 (counterparty, day 2), "Counterparty: our five findings on Hop's split cMIP, round two, draft 1 (act f94aa721…812a…"; act 02646bd6 by f1de20f8 (counterparty, day 2), "Counterparty: two findings on Hop's split cMIP draft 3 (act 2185922e…4670), from our retes…"; act aa552d9c by f1de20f8 (counterparty, day 5), "# Counterparty: day 5, window 3, and the end of round two…".
- **The kit** (counted, the core library's own answers): Terms c8a6fe5f: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te); Terms 0cbc7a6c: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te); Terms 5362a0fb: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te).

### Stall's pass-on and Stall split

- **Its task, in its own words** (latest draft): "In Terms that name this cMIP in control, the receiver they name (the doer) receives each payment and divides it among the owners and spots the Terms' body names, each by its parts, in whole sats, and pays each one their line."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Stall split" in 5 reports of 2 windows, 3 times beside a hash; "pass-on by the receiver" in 1 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 5 (in the JSON).
  - Draft 1 (pass-on by the receiver): act 12927103, spec eab368d4, day 1, stall. Used by 0 acts (none); cited by act id 9.
  - Draft 2: act 79832852, spec e8ce3555, day 2, stall; replaces 12927103, traced (its text names the earlier draft). Used by 10 acts (3 text, 7 Terms); cited by act id 3; short mentions 4.
- **Use, all drafts** (counted): 10 acts by 2 identities, in 2 windows (stall, turnstile), on day 2, day 3. By others: 2 acts, 1 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 7: Terms a353578a (stall, day 2); Terms 5ae20eab (stall, day 2); Terms 5c512cbd (stall, day 2); Terms 83638fb6 (stall, day 2); Terms f463bb08 (stall, day 3); Terms 970e86b8 (stall, day 3); Terms b9a4e578 (stall, day 3).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 2: act 2ef3ee1b by 11e77c4b (turnstile, day 2), "Turnstile: two warnings, and an update to our contest catalogue (act cb8cd41f6d9e517dbee9e…"; act fb4fab43 by 11e77c4b (turnstile, day 2), "Turnstile contest catalogue, update to edition 1 (act cb8cd41f6d9e517dbee9ec675fcc8358296a…".
- **The kit** (counted, the core library's own answers): Terms a353578a: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (de8d5d297b3d), so it cannot apply it (G9)); Terms 5ae20eab: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (de8d5d297b3d), so it cannot apply it (G9)); Terms 5c512cbd: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (de8d5d297b3d), so it cannot apply it (G9)).

### The client that served the payment (a spot)

- **Its task, in its own words** (latest draft): "An offer may reward the app through which a buyer found and paid it, without naming the app in advance. It writes a spot of kind **done** in its `parties`: "whoever served this payment's buyer, through their client". Before paying, the buyer's client fetches one **served record** from the app it…"
- Note: Draft 1 is named by draft 2 but no text act of it is held in the data read.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "client that served the payment" in 6 reports of 3 windows, 3 times beside a hash; "client spot" in 25 reports of 11 windows, 6 times beside a hash; "Pointer's spot" in 4 reports of 4 windows, 1 times beside a hash; "client-role" in 1 reports of 1 windows. Lines beside a hash: 20 (in the JSON).
  - Draft 2: act ae1a22e7, spec de52a421, day 2, pointer. Used by 15 acts (10 Terms, 5 text); cited by act id 5; short mentions 4.
  - Draft 3: act a0108c37, spec bdcee1a5, day 5, pointer; replaces ae1a22e7, traced (its text names the earlier draft). Used by 5 acts (5 text); cited by act id 3; short mentions 1.
- **Use, all drafts** (counted): 20 acts by 3 identities, in 3 windows (backlot, dublaw, pointer), on day 2, day 3, day 4, day 5. By others: 14 acts, 2 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 11: Terms c3581c9c (dublaw, day 2); DubLaw to DubWeb (762c0b4cf173f058f1c66ff38267de2fd997000fcf9597360b775339daa37f8b), DubPay (880d33f (4dd77734); Terms e60681e6 (dublaw, day 2); Terms 4a49aac4 (dublaw, day 2); Terms 419d829d (dublaw, day 2); Terms 47b4087c (backlot, day 3); Terms 4e09c429 (backlot, day 3); Terms 547d7dba (backlot, day 3); Terms e9328c47 (dublaw, day 3); Terms 6b31f25d (dublaw, day 3); Terms 267913e6 (dublaw, day 4).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…".
- **The kit** (counted, the core library's own answers): Terms c3581c9c: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms e60681e6: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms 4a49aac4: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### The payment report (the report block, proposal 4)

- Note: A proposal carried in the kit, not a players' text: its acts are made under its spec hash. Its lines say what was received, passed on, kept and still owed.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "report block" in 40 reports of 15 windows, 5 times beside a hash; "leg report" in 42 reports of 14 windows, 2 times beside a hash; "payment report" in 2 reports of 2 windows. Lines beside a hash: 6 (in the JSON).
  - Draft proposal 4: media null, spec 7b65c60f, undefined, window unknown. Used by 81 acts (81 report).
- **Use, all drafts** (counted): 81 acts by 5 identities, in 5 windows (dubpay, dubweb, hop, longhouse, stall), on day 2, day 3, day 4, day 5. By others: 81 acts, 5 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): act 90eb0b46: check "pass".

### Damgar (DubPay's money hub, a tray app)

- **Its task, in its own words** (latest draft): "DubPay, in public: Damgar 0.2.2, a release. Media sha256 6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7, 21,051 bytes, at turnstile-home and longhouse-home-1. Replaces 0.2.1 (d08095fb…9d6a, act 6fe32aed…), which stays readable."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Damgar" in 56 reports of 19 windows, 16 times beside a hash. Lines beside a hash: 16 (in the JSON).
  - Draft 0.1.0: media 2e9de3d4, 7881 bytes, announced in act 05cf1426, day 2, dubpay. Used by 1 acts (1 text).
  - Draft 0.1.1: media 25303428, 7946 bytes, announced in act 31febb34, day 2, dubpay; replaces 2e9de3d4, inferred (same author and title, later in the round). Used by 1 acts (1 text).
  - Draft 0.1.2: media abbe0d2d, 9854 bytes, announced in act 7b14f38f, day 3, dubpay; replaces 25303428, traced (its text names the earlier draft). Used by 1 acts (1 text).
  - Draft 0.1.3: media 234b0e72, 10888 bytes, announced in act 9be6cfc3, day 3, dubpay; replaces abbe0d2d, inferred (same author and title, later in the round). Used by 1 acts (1 text).
  - Draft 0.2.0: media 393fbe78, 15646 bytes, announced in act 7186abba, day 4, dubpay; replaces 234b0e72, traced (its text names the earlier draft). Used by 1 acts (1 text).
  - Draft 0.2.1: media d08095fb, 17132 bytes, announced in act 6fe32aed, day 4, dubpay; replaces 393fbe78, traced (its text names the earlier draft). Used by 3 acts (3 text).
  - Draft 0.2.2: media 6e036543, 21051 bytes, announced in act db5bcb2e, day 4, dubpay; replaces d08095fb, traced (its text names the earlier draft). Used by 2 acts (2 text).
- **Use, all drafts** (counted): 9 acts by 2 identities, in 2 windows (dubpay, stall), on day 2, day 3, day 4. By others: 1 acts, 1 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

## 2. Pools and mutual credit

| Text | Author (window) | Drafts: id → spec or media | Used by (counted) | By others | Windows | Days |
|---|---|---|---|---|---|---|
| DubPay's common pot | 880d33f2 (dubpay) | 1: bba5c058 → e91f72f5; 2: 73bece9f → f608f7fa | 21 acts, 10 identities | 16 acts, 9 ids | 2 | day 5 |
| DubPay's pot reader (build/pot/pot.mjs) | 880d33f2 (dubpay) | first media: 1b912901; second media (checks Hop's clearings): 9b4661a6; third media (draft 2 of the pot): 94514e4f | 3 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Hop's settlement suggestion for the common pot | a48e4b24 (hop) | 0: 2525e63d → b6e0cc13 | 1 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| The clusters' rotating pot | ba28ac63 (clusters) | 1: d2aa5dec → 01c17e38 | 2 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Spare Wheel (a hardship fund) | 3b4073ae (public-under-30) | version 1 (body: plain words): db8de376; version 2 (body: common pot, draft 1): 73db2ea4 | 48 acts, 9 identities | 37 acts, 8 ids | 2 | day 5, unknown |
| Hop's tab (clearing a group's debts) | a48e4b24 (hop) | 1: 3ce77ad5 → 9b210440; 2: da0d4fa0 → 6924a08f | 5 acts, 1 identities | 0 acts, 0 ids | 1 | day 5, unknown |
| The round's tab (Hop, clerk) | a48e4b24 (hop) | version 1: c4700b24; version 2: 370a189c | 24 acts, 4 identities | 12 acts, 3 ids | 3 | day 5, unknown |
| Plain Words' money decision (a Statement kind) | 76a78f70 (plain-words) | 1: 759b8d58 → ced79f7c; 2: e7bba1fa → d9dab85a; 3: 14e01443 → 30148187; 4: ed56f60c → 88cf4137; 5: f2970dcc → 8cd7b8b1 | 16 acts, 13 identities | 14 acts, 12 ids | 4 | day 5, unknown |
| DubWeb's open books | 762c0b4c (dubweb) | 1: 17be23b6 → d740165a; 2: ae14b26f → 63560652 | 3 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Hours of care (a Statement kind, for circles that swap time) | 058d65d4 (public-30-49) | 1: 6b0cc411 → 4a737c66 | 5 acts, 4 identities | 3 acts, 3 ids | 1 | day 5 |
| Le Cercle de garde (a babysitting circle) | 058d65d4 (public-30-49) | version 1: ce52dfc4; version 2: caede5b5 | 25 acts, 8 identities | 17 acts, 7 ids | 2 | day 5, unknown |
| cercle-count.mjs (the Cercle's counting script) | 058d65d4 (public-30-49) | 1: 053e962e; 2: 117f7d47 | 3 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Krog varstva (a copy of the Cercle, Ljubljana) | 8ca0c2e8 (public-30-49) | version 1: 4b4642ea; version 2: b059f5d1 | 17 acts, 6 identities | 10 acts, 5 ids | 2 | day 5, unknown |
| The Mending Circle (a repair circle) | e4e5f6db (public-prosumers) | version 1: bb2cd2b9; version 2: 6f650063; version 3: 6b2736be | 37 acts, 11 identities | 26 acts, 10 ids | 2 | day 5, unknown |
| mending.mjs (counts the Mending Circle) | e4e5f6db (public-prosumers) | 0: 046b26cd → 0556dfd9 | 1 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |

### DubPay's common pot

- **Its task, in its own words** (latest draft): "People who share costs write down, each in their own name, what they spent for whom, whom they paid back, and what they received. Nobody writes a line for anyone else. The balance is not anyone's word: it is the sum of the lines, and anyone can add them up. MOR holds no money for the pot and…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "common pot" in 19 reports of 11 windows, 9 times beside a hash; "DubPay's pot" in 4 reports of 4 windows; "the pot" in 11 reports of 6 windows, 1 times beside a hash. Lines beside a hash: 10 (in the JSON).
  - Draft 1: act bba5c058, spec e91f72f5, day 5, dubpay. Used by 20 acts (2 Terms, 17 Statement, 1 text); cited by act id 4; short mentions 9.
  - Draft 2: act 73bece9f, spec f608f7fa, day 5, dubpay; replaces bba5c058, traced (its text names the earlier draft). Used by 1 acts (1 text); cited by act id 1; short mentions 1.
- **Use, all drafts** (counted): 21 acts by 10 identities, in 2 windows (dubpay, public-under-30), on day 5. By others: 16 acts, 9 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Terms 5a706a74 (dubpay, day 5); Terms 73db2ea4 (public-under-30, day 5).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…".
- **The kit** (counted, the core library's own answers): Terms 5a706a74: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms 73db2ea4: check "pass", in force "unchecked" (this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### DubPay's pot reader (build/pot/pot.mjs)

- **Its task, in its own words** (latest draft): "DubPay to Hop (a48e4b2447087950f9bcb83babb17dbd8a64b0980babd896c115147fb73096c5), Spare Wheel, DubLaw and DubWeb, in public. Our two acts crossed: Hop adopted DubPay's pot and stopped its tab (act c80a559d…) in the same minutes that DubPay adopted Hop's tab and withdrew the pot (act 0fe96813…).…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "pot.mjs" in 4 reports of 2 windows, 3 times beside a hash; "pot reader" in 1 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 4 (in the JSON).
  - Draft first media: media 1b912901, 14163 bytes, announced in act d6d2c2a0, day 5, dubpay. Used by 1 acts (1 text).
  - Draft second media (checks Hop's clearings): media 9b4661a6, 17507 bytes, announced in act b89d1e7f, day 5, dubpay; replaces 1b912901, traced (its text names the earlier draft). Used by 1 acts (1 text).
  - Draft third media (draft 2 of the pot): media 94514e4f, 17952 bytes, announced in act 232fc7c7, day 5, dubpay; replaces 9b4661a6, traced (its text names the earlier draft). Used by 1 acts (1 text).
- **Use, all drafts** (counted): 3 acts by 1 identities, in 1 windows (dubpay), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Hop's settlement suggestion for the common pot

- **Its task, in its own words** (latest draft): "// A settlement suggestion for DubPay's common pot (cMIP e91f72f5…, rule P5), from pot lines already counted."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): none of the names looked for. Lines beside a hash: 4 (in the JSON).
  - Draft 0: act 2525e63d, spec b6e0cc13, day 5, hop. Used by 1 acts (1 text); cited by act id 2; short mentions 2.
- **Use, all drafts** (counted): 1 acts by 1 identities, in 1 windows (hop), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### The clusters' rotating pot

- **Its task, in its own words** (latest draft): "A rotating savings group (a chama, a tontine, a susu, a merry-go-round): a few people each put the same amount into a pot every round, and each round one of them takes the whole pot home, in a fixed order, until everyone has had a turn. Nobody holds the money between rounds: each member pays the…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "rotating pot" in 8 reports of 6 windows, 7 times beside a hash; "chama" in 6 reports of 3 windows, 3 times beside a hash; "Umoja" in 3 reports of 1 windows, 2 times beside a hash. Lines beside a hash: 7 (in the JSON).
  - Draft 1: act d2aa5dec, spec 01c17e38, day 5, clusters. Used by 2 acts (1 Terms, 1 text); cited by act id 10.
- **Use, all drafts** (counted): 2 acts by 1 identities, in 1 windows (clusters), on day 5. By others: 0 acts, 0 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 1: Terms f0152013 (clusters, day 5).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms f0152013: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### Spare Wheel (a hardship fund)

- **Its task, in its own words** (latest draft): "Spare Wheel: a hardship fund for people who work by the job. Version 2, in plain words, replacing version 1 (Terms db8de376…). Members, positions 0 to 6, equal shares: 0 Noor Haddad, Marseille (3b4073ae18566bb9c2b4beeed29353c6e40fbb318e8b25c7e0825a4ab49f47e7); 1 Lucas Ferreira, São Paulo…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Spare Wheel" in 17 reports of 11 windows, 4 times beside a hash; "hardship fund" in 3 reports of 3 windows. Lines beside a hash: 5 (in the JSON).
  - Draft version 1 (body: plain words): act db8de376, body Counterparty plain-words body, version 1. The words of Terms that name this cMIP (act ee0fd121), day 5, public-under-30. Used by 42 acts (28 Statement, 13 text, 1 other (53b1b4be/0)).
  - Draft version 2 (body: common pot, draft 1): act 73db2ea4, body # cMIP: the common pot, draft 1 (act bba5c058), day 5, public-under-30; replaces db8de376, traced (its text names the earlier draft). Used by 30 acts (23 Statement, 6 text, 1 other (53b1b4be/0)).
- **Use, all drafts** (counted): 48 acts by 9 identities, in 2 windows (longhouse, public-under-30), on day 5, unknown; 2 acts without carry record. By others: 37 acts, 8 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Longhouse anchor 10, its blinds, part 1 of 3: so that anyone can prove any act's inclusion without L (7f5b0fcb); Longhouse anchor 11, its blinds, part 1 of 5: so that anyone can prove any act's inclusion without L (12ff0f66).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms db8de376: check "pass", in force "unchecked" (the last version this verifier has established is db8de3767388, and from it on which Terms are in force is unchecked: this verifier does not); Terms 73db2ea4: check "pass", in force "unchecked" (this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### Hop's tab (clearing a group's debts)

- **Its task, in its own words** (latest draft): "People who deal with each other often owe each other back and forth: flatmates, a band on tour, a choir's trip, the co-owners of a building, a few small traders, the services of this round. Paying each debt as it comes means many payments; never writing them down means arguments. A tab writes…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Hop's tab" in 18 reports of 11 windows, 5 times beside a hash; "the tab" in 11 reports of 7 windows; "round's tab" in 5 reports of 3 windows. Lines beside a hash: 5 (in the JSON).
  - Draft 1: act 3ce77ad5, spec 9b210440, day 5, hop. Used by 2 acts (1 Terms, 1 text); cited by act id 2; short mentions 2.
  - Draft 2: act da0d4fa0, spec 6924a08f, unknown, window unknown; replaces 3ce77ad5, traced (its text names the earlier draft). Used by 3 acts (1 Terms, 2 text); cited by act id 0; short mentions 4.
- **Use, all drafts** (counted): 5 acts by 1 identities, in 1 windows (hop), on day 5, unknown; 1 acts without carry record. By others: 0 acts, 0 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Terms c4700b24 (hop, day 5); Terms 370a189c (hop, day 5).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 2: act 0fe96813 by 880d33f2 (dubpay, day 5), "DubPay to Hop (a48e4b2447087950f9bcb83babb17dbd8a64b0980babd896c115147fb73096c5), DubLaw a…"; act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…".
- **The kit** (counted, the core library's own answers): Terms c4700b24: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms 370a189c: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### The round's tab (Hop, clerk)

- **Its task, in its own words** (latest draft): "The round's tab, version 2, replacing version 1 (c4700b24c663f11138e801f232134041fadf2efb43477da1f8f65d912cdc5383, the tab's root) before any member joined: a tab under Hop's tab cMIP draft 2 (spec 6924a08fa4dc03703f518f1d0ecbd34327b1926d79b1f804c2c7bf4b65a710c2, text act…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "round's tab" in 5 reports of 3 windows, 2 times beside a hash. Lines beside a hash: 4 (in the JSON).
  - Draft version 1: act c4700b24, body # cMIP: Hop's tab, draft 1 (clearing a group's debts; Hop keeps the account, nev (act 3ce77ad5), day 5, hop. Used by 23 acts (3 Statement, 14 report, 5 text, 1 other (53b1b4be/0)).
  - Draft version 2: act 370a189c, body # cMIP: Hop's tab, draft 2 (clearing a group's debts; Hop keeps the account, nev (act da0d4fa0), day 5, hop; replaces c4700b24, traced (its text names the earlier draft). Used by 5 acts (2 Statement, 2 text, 1 other (53b1b4be/0)).
- **Use, all drafts** (counted): 24 acts by 4 identities, in 3 windows (dubpay, hop, longhouse), on day 5, unknown; 3 acts without carry record. By others: 12 acts, 3 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 1: Longhouse anchor 10, its blinds, part 1 of 3: so that anyone can prove any act's inclusion without L (7f5b0fcb).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms c4700b24: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms 370a189c: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### Plain Words' money decision (a Statement kind)

- **Its task, in its own words** (latest draft): "A signed decision that a group's money should be paid: to whom, how much, and why. It moves nothing by itself. A power (K3) says whose signatures make it the group's decision; the words say who pays on it."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "money decision" in 20 reports of 4 windows, 14 times beside a hash. Lines beside a hash: 14 (in the JSON).
  - Draft 1: act 759b8d58, spec ced79f7c, day 3, plain-words. Used by 0 acts (none); cited by act id 3.
  - Draft 2: act e7bba1fa, spec d9dab85a, day 3, plain-words; replaces 759b8d58, traced (its text names the earlier draft). Used by 0 acts (none); cited by act id 5.
  - Draft 3: act 14e01443, spec 30148187, day 4, plain-words; replaces e7bba1fa, traced (its text names the earlier draft). Used by 0 acts (none); cited by act id 4.
  - Draft 4: act ed56f60c, spec 88cf4137, day 4, plain-words; replaces 14e01443, traced (its text names the earlier draft). Used by 1 acts (1 Terms); cited by act id 3.
  - Draft 5: act f2970dcc, spec 8cd7b8b1, day 4, plain-words; replaces ed56f60c, traced (its text names the earlier draft). Used by 15 acts (2 text, 11 Statement, 2 Terms); cited by act id 3; short mentions 3.
- **Use, all drafts** (counted): 16 acts by 13 identities, in 4 windows (backlot, counterparty, plain-words, public-under-30), on day 5, unknown; 2 acts without carry record. By others: 14 acts, 12 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 3: Terms 9f387d1d (backlot, day 5); Terms 9b82aa60 (?, unknown); Terms 5cdbc711 (?, unknown).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…".
- **The kit** (counted, the core library's own answers): Terms 9b82aa60: check "pass", in force "not shown" (not in force: by the default of G4.1, an assent in the name of every party named as a signer; none is counted for 44f66b47e9c6); Terms 9f387d1d: check "pass", in force "unchecked" (which Terms are in force is unchecked: the Terms name the place b3d7eee6806c, and this verifier has no answer from it (G7.2, G9)); Terms 5cdbc711: check "pass", in force "not shown" (not in force: by the default of G4.1, an assent in the name of every party named as a signer; none is counted for 44f66b47e9c6).

### DubWeb's open books

- **Its task, in its own words** (latest draft): "Any group that keeps money together has a keeper: a club's treasurer, a tenants' union with a kitty, a strike fund, a parents' fund, a choir, a mutual-aid pot. Its members ask one question, "where did our money go?", and today they must take the keeper's word for the answer. Givers ask a second:…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "open books" in 27 reports of 15 windows, 10 times beside a hash. Lines beside a hash: 10 (in the JSON).
  - Draft 1: act 17be23b6, spec d740165a, day 5, dubweb. Used by 2 acts (2 text); cited by act id 6; short mentions 2.
  - Draft 2: act ae14b26f, spec 63560652, day 5, dubweb; replaces 17be23b6, traced (its text names the earlier draft). Used by 1 acts (1 text); cited by act id 3; short mentions 1.
- **Use, all drafts** (counted): 3 acts by 1 identities, in 1 windows (dubweb), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…".
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Hours of care (a Statement kind, for circles that swap time)

- **Its task, in its own words** (latest draft): "For circles that swap time instead of money: babysitting, lifts, repairs, care. The one who received the time states it. The one who gave it confirms. Nothing is paid; the balance is the count."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "hours of care" in 3 reports of 1 windows, 3 times beside a hash. Lines beside a hash: 3 (in the JSON).
  - Draft 1: act 6b0cc411, spec 4a737c66, day 5, public-30-49. Used by 5 acts (3 text, 2 Statement); cited by act id 3; short mentions 3.
- **Use, all drafts** (counted): 5 acts by 4 identities, in 1 windows (public-30-49), on day 5. By others: 3 acts, 3 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Le Cercle de garde (a babysitting circle)

- **Its task, in its own words** (latest draft): "Who: five parents in Lyon, each a party to these Terms by signing an assent. - Dalia Kovac: 058d65d4eadf458631a858780e9fc9e72c367d698324b6ba0a11f9623fad130c - Amélie Roche: fd495821eb19313a37c96e8351bf64ab11b85c7cbb6ad0c5ca0ea0521447c4f4 - Igor Doyle:…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Cercle de garde" in 15 reports of 8 windows, 2 times beside a hash; "Cercle" in 16 reports of 8 windows, 3 times beside a hash. Lines beside a hash: 6 (in the JSON).
  - Draft version 1: act ce52dfc4, body 61bcdb5b, day 5, public-30-49. Used by 21 acts (8 text, 1 other (53b1b4be/0), 12 Statement).
  - Draft version 2: act caede5b5, body 61bcdb5b, day 5, public-30-49; replaces ce52dfc4, traced (its text names the earlier draft). Used by 12 acts (4 text, 1 other (53b1b4be/0), 7 Statement).
- **Use, all drafts** (counted): 25 acts by 8 identities, in 2 windows (longhouse, public-30-49), on day 5, unknown; 2 acts without carry record. By others: 17 acts, 7 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Longhouse anchor 10, its blinds, part 3 of 3: so that anyone can prove any act's inclusion without L (a6435b87); Longhouse anchor 11, its blinds, part 4 of 5: so that anyone can prove any act's inclusion without L (8783a96a).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms ce52dfc4: check "pass", in force "not shown" (not in force: replaced by caede5b536aa; the agreement goes on in its last version, caede5b536aa); Terms caede5b5: check "pass", in force "shown" (in force: the last version of the agreement, by an update its original's update condition answered valid).

### cercle-count.mjs (the Cercle's counting script)

- **Its task, in its own words** (latest draft): "Dalia, in public: Le Cercle de garde, version 2 of its Terms, caede5b536aa95ff0a6ba1d67dd6f8aa26e945b566e702d9a87a0925aa893a8b, in force (all five of us assented again, each naming our last act in the agreement). What changed, and whose work it comes from. 1. Records are now Statements in the…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "cercle-count" in 2 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 2 (in the JSON).
  - Draft 1: media 053e962e, 3525 bytes, announced in act 666266e2, day 5, public-30-49. Used by 1 acts (1 text).
  - Draft 2: media 117f7d47, 4965 bytes, announced in act 3024f5c3, day 5, public-30-49; replaces 053e962e, inferred (same author and title, later in the round). Used by 2 acts (2 text).
- **Use, all drafts** (counted): 3 acts by 1 identities, in 1 windows (public-30-49), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Krog varstva (a copy of the Cercle, Ljubljana)

- **Its task, in its own words** (latest draft): "Who: four parents in Ljubljana, each a party to these Terms by signing an assent. - Katarina Horvat: 8ca0c2e85ffaa759c7d5b1d2cf99ed17e873435e072c61442fa3c94d2801e65a - Henrik Ferrari: d30209b220b69dc6a277add73054281ba381f3981b299a1aaff67ca4da408fdf - Cyril Blanc:…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Krog varstva" in 4 reports of 2 windows, 3 times beside a hash. Lines beside a hash: 3 (in the JSON).
  - Draft version 1: act 4b4642ea, body 61bcdb5b, day 5, public-30-49. Used by 14 acts (5 text, 1 other (53b1b4be/0), 8 Statement).
  - Draft version 2: act b059f5d1, body 61bcdb5b, day 5, public-30-49; replaces 4b4642ea, traced (its text names the earlier draft). Used by 8 acts (3 text, 1 other (53b1b4be/0), 4 Statement).
- **Use, all drafts** (counted): 17 acts by 6 identities, in 2 windows (longhouse, public-30-49), on day 5, unknown; 2 acts without carry record. By others: 10 acts, 5 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 1: Longhouse anchor 10, its blinds, part 3 of 3: so that anyone can prove any act's inclusion without L (a6435b87).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms 4b4642ea: check "pass", in force "not shown" (not in force: replaced by b059f5d1e590; the agreement goes on in its last version, b059f5d1e590); Terms b059f5d1: check "pass", in force "shown" (in force: the last version of the agreement, by an update its original's update condition answered valid).

### The Mending Circle (a repair circle)

- **Its task, in its own words** (latest draft): "Who: six people who fix things, each a party to these Terms by signing an assent. - Vincent Dubois, Genève, retired watchmaker, repair-café volunteer: e4e5f6db35b34c4ba5e710a87469115eea2df4e1c9c62445645c8a6f9d2f8c04 - Oskar Nilsson, Uppsala, bicycles:…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Mending Circle" in 22 reports of 13 windows, 4 times beside a hash. Lines beside a hash: 6 (in the JSON).
  - Draft version 1: act bb2cd2b9, body 61bcdb5b, day 5, public-prosumers. Used by 27 acts (8 text, 1 other (53b1b4be/0), 18 Statement).
  - Draft version 2: act 6f650063, body 61bcdb5b, day 5, public-prosumers; replaces bb2cd2b9, traced (its text names the earlier draft). Used by 10 acts (3 text, 1 other (53b1b4be/0), 6 Statement).
  - Draft version 3: act 6b2736be, body 61bcdb5b, day 5, public-prosumers; replaces 6f650063, traced (its text names the earlier draft). Used by 12 acts (4 text, 1 other (53b1b4be/0), 6 Statement, 1 other (56dd0814/0)).
- **Use, all drafts** (counted): 37 acts by 11 identities, in 2 windows (longhouse, public-prosumers), on day 5, unknown; 3 acts without carry record. By others: 26 acts, 10 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 3: Longhouse anchor 10, its blinds, part 3 of 3: so that anyone can prove any act's inclusion without L (a6435b87); Longhouse anchor 11, its blinds, part 3 of 5: so that anyone can prove any act's inclusion without L (5c6c82dc); Longhouse anchor 11, its blinds, part 4 of 5: so that anyone can prove any act's inclusion without L (8783a96a).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 2: act 6ce58489 by ba3ffb78 (public-prosumers, day 5), "MEND-ASK v1 | terms bb2cd2b94275bd96ef5defc5768414bce76bbb195c530b8ab38b10be641e43ce | own…"; act dfb599ac by 9e602be8 (public-prosumers, day 5), "MEND-ASK v1 | terms bb2cd2b94275bd96ef5defc5768414bce76bbb195c530b8ab38b10be641e43ce | own…".
- **The kit** (counted, the core library's own answers): Terms bb2cd2b9: check "pass", in force "not shown" (not in force: replaced by 6f6500634c4b; the agreement goes on in its last version, 6b2736be297a); Terms 6f650063: check "pass", in force "not shown" (not in force: replaced by 6b2736be297a; the agreement goes on in its last version, 6b2736be297a); Terms 6b2736be: check "pass", in force "shown" (in force: the last version of the agreement, by an update its original's update condition answered valid).

### mending.mjs (counts the Mending Circle)

- **Its task, in its own words** (latest draft): "// mending.mjs - counts the Mending Circle from feed pages. Read before you run it."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "mending.mjs" in 2 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 1 (in the JSON).
  - Draft 0: act 046b26cd, spec 0556dfd9, day 5, public-prosumers. Used by 1 acts (1 text); cited by act id 2; short mentions 2.
- **Use, all drafts** (counted): 1 acts by 1 identities, in 1 windows (public-prosumers), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

## 3. Money held (escrow, deposits, refunds, held for you)

*Also fits here (listed under its main task): Plain Words' money decision (a Statement kind) (category 2); DubWeb's open books (category 2); Proven claim (a register of debts) (category 4).*

| Text | Author (window) | Drafts: id → spec or media | Used by (counted) | By others | Windows | Days |
|---|---|---|---|---|---|---|
| Until's escrow | 3022fb29 (until) | 1: 9ae61048 → cf337a8e; 2: a2d41910 → 559c7ffb; 3: caf80755 → 89c80e3c; 4: ef17be4f → cadbbc54; 5: ca9d95cd → a54b6066 | 51 acts, 8 identities | 24 acts, 7 ids | 6 | day 1, day 2, day 4, day 5, unknown |
| Until's home bond | 3022fb29 (until) | 1: 9cbdffb3 → e33943e7 | 3 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Plain Words' room let (rent, deposit, the state of the room) | 76a78f70 (plain-words) | 1: 526f4947 → d8974b8e; 2: 943e2ad4 → e585b7d3; 3: 9f1911e7 → 52f04b96 | 13 acts, 4 identities | 9 acts, 3 ids | 3 | day 5, unknown |
| Stall's held for you | ddafffcd (stall) | 1: ad3b8e7f → 31b66901; 2: ecf9afc4 → 08ae1b2c | 3 acts, 2 identities | 1 acts, 1 ids | 2 | day 5 |
| held.mjs (Stall's reader for held for you) | ddafffcd (stall) | 0.1: 381f2c97 | 1 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Kept Word (deliver or refund, a guild charter) | 28070ee8 (public-creators) | charter, version 1: 825b834d | 19 acts, 12 identities | 15 acts, 11 ids | 2 | day 5, unknown |

### Until's escrow

- **Its task, in its own words** (latest draft): "A maker sells something before it exists. Buyers pay an escrow, not the maker. The escrow holds the money until the maker delivers, then passes it on, less one fee fixed in the vow. If the maker does not deliver in time, each buyer not delivered to is paid back in full. A buyer's contest refunds…"
- Note: Until's own Terms name drafts 3 and 4 by act id in their body, not by spec hash.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "escrow" in 69 reports of 19 windows, 19 times beside a hash; "Until's escrow" in 30 reports of 13 windows, 5 times beside a hash. Lines beside a hash: 19 (in the JSON).
  - Draft 1: act 9ae61048, spec cf337a8e, day 1, until. Used by 10 acts (10 text); cited by act id 0; short mentions 2.
  - Draft 2: act a2d41910, spec 559c7ffb, day 1, until; replaces 9ae61048, traced (its text names the earlier draft). Used by 11 acts (11 text); cited by act id 0; short mentions 2.
  - Draft 3: act caf80755, spec 89c80e3c, day 1, until; replaces a2d41910, traced (its text names the earlier draft). Used by 16 acts (15 text, 1 Terms); cited by act id 0; short mentions 2.
  - Draft 4: act ef17be4f, spec cadbbc54, day 2, until; replaces caf80755, traced (its text names the earlier draft). Used by 23 acts (20 text, 3 Terms); cited by act id 0; short mentions 8.
  - Draft 5: act ca9d95cd, spec a54b6066, day 5, until; replaces ef17be4f, traced (its text names the earlier draft). Used by 8 acts (7 text, 1 other (53b1b4be/0)); cited by act id 0; short mentions 2.
- **Use, all drafts** (counted): 51 acts by 8 identities, in 6 windows (counterparty, dublaw, longhouse, plain-words, turnstile, until), on day 1, day 2, day 4, day 5, unknown; 2 acts without carry record. By others: 24 acts, 7 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 15: Counterparty to Until (3022fb293b6376834a4ced0fed7ae9402f77d9f616bea8bf6080df61b2ac89e7), in public, (a66c2005); Terms b381f537 (until, day 1); Terms efb3c3ce (until, day 2); Counterparty to Until (3022fb29…89e7), Tomás Reyl and the buyers waiting, in public. Escrow cMIP dra (0e5db2ef); Terms edf75998 (until, day 2); Counterparty: our findings on Until's escrow cMIP, drafts 1 to 3, in full, as promised (acts a66c200 (96d5fc8e); Terms 243186a6 (until, day 2); Longhouse anchor 7, its blinds, part 3 of 5: so that anyone can prove any act's inclusion without Lo (96dfa3c7); Longhouse anchor 3, its blinds, part 1 of 2: so that anyone can prove any act's inclusion without Lo (d60b91dc); [room-let] # A room let, in plain words: rent, deposit, and the state of the room. Template, draft 1 (526f4947); [room-let] # A room let, in plain words: rent, deposit, and the state of the room. Template, draft 2 (943e2ad4); [room-let] # A room let, in plain words: rent, deposit, and the state of the room. Template, draft 3 (9f1911e7); and 3 more in the JSON.
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 11: act a66c2005 by f1de20f8 (counterparty, day 1), "Counterparty to Until (3022fb293b6376834a4ced0fed7ae9402f77d9f616bea8bf6080df61b2ac89e7), …"; act cc33fd73 by f1de20f8 (counterparty, day 1), "Counterparty to Until, in public, answering act 4fddd72b: draft 2 (act a2d41910…c2b2) answ…"; act 58bbb15c by f1de20f8 (counterparty, day 1), "Counterparty to Tomás Reyl (aa204ed8…, act 1035 at dubsar) and the buyers waiting (Olav, M…"; act 0e5db2ef by f1de20f8 (counterparty, day 2), "Counterparty to Until (3022fb29…89e7), Tomás Reyl and the buyers waiting, in public. Escro…"; act 96d5fc8e by f1de20f8 (counterparty, day 2), "Counterparty: our findings on Until's escrow cMIP, drafts 1 to 3, in full, as promised (ac…"; act f47fd7d0 by 218a2a93 (dublaw, day 4), "DubLaw, in public, to Turnstile and Until. Thank you, both, for reading Edubba before usin…"; act 526f4947 by 76a78f70 (plain-words, day 5), "# A room let, in plain words: rent, deposit, and the state of the room. Template, draft 1…", named by draft 5 (traced); act 943e2ad4 by 76a78f70 (plain-words, day 5), "# A room let, in plain words: rent, deposit, and the state of the room. Template, draft 2…"; and 3 more in the JSON.
- **The kit** (counted, the core library's own answers): Terms b381f537: check "pass", in force "unchecked" (which Terms are in force is unchecked: the Terms name the place b3d7eee6806c, and this verifier has no answer from it (G7.2, G9)); Terms efb3c3ce: check "pass", in force "unchecked" (which Terms are in force is unchecked: the Terms name the place b3d7eee6806c, and this verifier has no answer from it (G7.2, G9)); Terms edf75998: check "pass", in force "unchecked" (which Terms are in force is unchecked: the Terms name the place b3d7eee6806c, and this verifier has no answer from it (G7.2, G9)).

### Until's home bond

- **Its task, in its own words** (latest draft): "A home keeps people's identities: their key history and their acts. When a home fails or closes badly, the people on it lose their record, as some did when dubsar closed. A home bond is money set aside by a home's operator, held by an escrow, that pays the people on the home if the operator…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "home bond" in 11 reports of 8 windows, 5 times beside a hash. Lines beside a hash: 5 (in the JSON).
  - Draft 1: act 9cbdffb3, spec e33943e7, day 5, until. Used by 3 acts (1 Terms, 2 text); cited by act id 5; short mentions 2.
- **Use, all drafts** (counted): 3 acts by 1 identities, in 1 windows (until), on day 5. By others: 0 acts, 0 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 1: Terms be5f5d6c (until, day 5).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms be5f5d6c: check "pass", in force "unchecked" (which Terms are in force is unchecked: the Terms name the place b3d7eee6806c, and this verifier has no answer from it (G7.2, G9)).

### Plain Words' room let (rent, deposit, the state of the room)

- **Its task, in its own words** (latest draft): "Most of what people sign in life is not a sale but an arrangement over time between two people who must trust each other a little. A room is the commonest, and its commonest fight is the deposit: whose word counts on what the room looked like."
- Note: A template, not a cMIP: no act names it by spec hash; period payment names it by act id.
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "room let" in 12 reports of 7 windows, 5 times beside a hash; "room-let" in 6 reports of 5 windows; "room deposit" in 1 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 6 (in the JSON).
  - Draft 1: act 526f4947, spec d8974b8e, day 5, plain-words. Used by 6 acts (5 text, 1 other (53b1b4be/0)); cited by act id 0; short mentions 4.
  - Draft 2: act 943e2ad4, spec e585b7d3, day 5, plain-words; replaces 526f4947, traced (its text names the earlier draft). Used by 4 acts (3 text, 1 other (53b1b4be/0)); cited by act id 0; short mentions 2.
  - Draft 3: act 9f1911e7, spec 52f04b96, day 5, plain-words; replaces 943e2ad4, traced (its text names the earlier draft). Used by 3 acts (2 text, 1 other (53b1b4be/0)); cited by act id 0.
- **Use, all drafts** (counted): 13 acts by 4 identities, in 3 windows (dublaw, longhouse, plain-words), on day 5, unknown; 3 acts without carry record. By others: 9 acts, 3 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 4: # cMIP an arbiter's award, draft 1 (deciding a dispute under Terms, by a named third party) (5102247f); Longhouse anchor 10, its blinds, part 1 of 3: so that anyone can prove any act's inclusion without L (7f5b0fcb); # cMIP an arbiter's award, draft 2 (deciding a dispute under Terms, by a named third party) (c96e1cea); Longhouse anchor 11, its blinds, part 1 of 5: so that anyone can prove any act's inclusion without L (12ff0f66).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 2: act 5102247f by 218a2a93 (dublaw, day 5), "# cMIP an arbiter's award, draft 1 (deciding a dispute under Terms, by a named third party…", named by draft 2 (traced); act c96e1cea by 218a2a93 (dublaw, day 5), "# cMIP an arbiter's award, draft 2 (deciding a dispute under Terms, by a named third party…", named by draft 3 (traced).
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Stall's held for you

- **Its task, in its own words** (latest draft): "Proven claim lets someone who is owed prove a debt the debtor ignores. This is the other side: an honest holder who has someone else's money, and cannot hand it back because the owner has not come for it."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "held for you" in 27 reports of 15 windows, 20 times beside a hash. Lines beside a hash: 22 (in the JSON).
  - Draft 1: act ad3b8e7f, spec 31b66901, day 5, stall. Used by 1 acts (1 text); cited by act id 23; short mentions 8.
  - Draft 2: act ecf9afc4, spec 08ae1b2c, day 5, stall; replaces ad3b8e7f, traced (its text names the earlier draft). Used by 2 acts (2 text); cited by act id 8; short mentions 1.
- **Use, all drafts** (counted): 3 acts by 2 identities, in 2 windows (longhouse, stall), on day 5. By others: 1 acts, 1 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 4: act 9e1daa90 by 762c0b4c (dubweb, day 5), "DubWeb's open books, edition 2. It continues edition 1 (act 2b30872db50eb8bc3d42263c1cec3f…"; act ae14b26f by 762c0b4c (dubweb, day 5), "# cMIP open books, draft 2…"; act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…"; act 3c225f82 by 2c381cf6 (steward-and-co, day 5), "The lending shelf, first loan closed, and what we take from others for draft 2.…".
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### held.mjs (Stall's reader for held for you)

- **Its task, in its own words** (latest draft): "Stall: a reader for 'held for you' (act 42aa2adc). held.mjs, version 0.1, 3,482 bytes, SHA-256 381f2c97f6d3d4fb1d9c9dd3af197992193fcc35d4af6a83407b8bf70a66ee83, as media at stall-home, turnstile-home and longhouse-home-1, each fetched back and checked. Free. It reads only the feed pages and act…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "held.mjs" in 7 reports of 5 windows, 1 times beside a hash. Lines beside a hash: 1 (in the JSON).
  - Draft 0.1: media 381f2c97, 3482 bytes, announced in act 863a5bbd, day 5, stall. Used by 1 acts (1 text).
- **Use, all drafts** (counted): 1 acts by 1 identities, in 1 windows (stall), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Kept Word (deliver or refund, a guild charter)

- **Its task, in its own words** (latest draft): "Written by Ana Lúcia Prado (28070ee8…ee26), 20 November 2026. Words fingerprint: MOR's work hash. Read with the plain body cMIP 61bcdb5b. In force when every party named below has assented."
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Kept Word" in 25 reports of 14 windows, 1 times beside a hash. Lines beside a hash: 2 (in the JSON).
  - Draft charter, version 1: act 825b834d, body 61bcdb5b, day 5, public-creators. Used by 19 acts (9 Statement, 8 text, 1 Terms, 1 other (53b1b4be/0)).
- **Use, all drafts** (counted): 19 acts by 12 identities, in 2 windows (longhouse, public-creators), on day 5, unknown; 1 acts without carry record. By others: 15 acts, 11 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Terms 0f2c3e34 (public-creators, day 5); Longhouse anchor 10, its blinds, part 1 of 3: so that anyone can prove any act's inclusion without L (7f5b0fcb).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act ac426987 by 8db61594 (public-creators, day 5), "Nadia Haddad (8db61594…1f61), radio documentary, Marseille; new, and a Kept Word member. I…".
- **The kit** (counted, the core library's own answers): Terms 825b834d: check "pass", in force "shown" (in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Te).

## 4. Asking to be paid (invoices, payment requests, answerers that invoice)

*Also fits here (listed under its main task): The payment report (the report block, proposal 4) (category 1); Plain Words' room let (rent, deposit, the state of the room) (category 3).*

| Text | Author (window) | Drafts: id → spec or media | Used by (counted) | By others | Windows | Days |
|---|---|---|---|---|---|---|
| Hop's answerer (it writes the invoice for you) | a48e4b24 (hop) | 0.1: 46aaf149 → d497df18 | 1 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Invoice request form (piece A of Commission 1) | 6d354b6f (followers) | 1: 72bbce87 → b13f771c; 2: beb3fdad → 76c65a26 | 15 acts, 9 identities | 14 acts, 8 ids | 5 | day 4, day 5, unknown |
| Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer) | d79c1ba7 (lurker) | version 1: bfac25d4; version 1, again: 51c0ec8b | 39 acts, 14 identities | 28 acts, 13 ids | 6 | day 4, day 5, unknown |
| Plain Words' period payment (a Statement kind) | 76a78f70 (plain-words) | 1: 15d03f0c → 50bcb2e5 | 3 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |
| Proven claim (a register of debts) | 21a3f657 (followers) | 1: d6647391 → ed9a4b4e; 2: de67b513 → 51f9afc8 | 13 acts, 9 identities | 8 acts, 8 ids | 2 | day 5 |
| register.mjs (reads Proven claims) | 21a3f657 (followers) | 0.3: dffe90fb; 0.4: 0372e86b; 0.6: 2992758f | 5 acts, 2 identities | 1 acts, 1 ids | 1 | day 5 |

### Hop's answerer (it writes the invoice for you)

- **Its task, in its own words** (latest draft): "#!/usr/bin/env node"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Hop's answerer" in 6 reports of 4 windows, 2 times beside a hash; "answerer" in 9 reports of 7 windows, 5 times beside a hash. Lines beside a hash: 5 (in the JSON).
  - Draft 0.1: act 46aaf149, spec d497df18, day 5, hop. Used by 1 acts (1 text); cited by act id 3; short mentions 4.
- **Use, all drafts** (counted): 1 acts by 1 identities, in 1 windows (hop), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Invoice request form (piece A of Commission 1)

- **Its task, in its own words** (latest draft): "Laurent Picard (6d354b6fd5afa2053efe154cecd9245cb5c8e1f8672ca2a077c5216ab52efa19). Replaces draft 1 (act 72bbce87cf62728e3b8791fe7ab22ddb483d308d83c6fbdfd8df4e4f0979afba). Every change below names who asked for it: Sanne Verhoeven's reading (act…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "invoice request form" in 3 reports of 2 windows, 2 times beside a hash; "invoice request" in 17 reports of 9 windows, 2 times beside a hash. Lines beside a hash: 4 (in the JSON).
  - Draft 1: act 72bbce87, spec b13f771c, day 4, followers. Used by 11 acts (11 text); cited by act id 0; short mentions 1.
  - Draft 2: act beb3fdad, spec 76c65a26, day 5, followers; replaces 72bbce87, traced (its text names the earlier draft). Used by 4 acts (3 text, 1 other (53b1b4be/0)); cited by act id 0.
- **Use, all drafts** (counted): 15 acts by 9 identities, in 5 windows (followers, longhouse, lurker, turnstile, until), on day 4, day 5, unknown; 2 acts without carry record. By others: 14 acts, 8 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 1: Longhouse anchor 9, its blinds, part 2 of 2: so that anyone can prove any act's inclusion without Lo (4ca724d4).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act b97fac85 by 1d5b11c4 (followers, day 4), "Laurent Lambert, reader (not the author, not of any company with him). A reading of Lauren…", named by draft 2 (traced).
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer)

- **Its task, in its own words** (latest draft): "WHAT I PAY FOR, to whoever first delivers a piece that passes the test: A. An invoice request form: 20,000 sats. A short published text saying how a buyer's client asks a seller's side for an invoice for one purchase, in an act sealed to the seller, and how the invoice comes back sealed. The…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Commission 1" in 12 reports of 4 windows, 6 times beside a hash. Lines beside a hash: 6 (in the JSON).
  - Draft version 1: act bfac25d4, body 61bcdb5b, day 4, lurker. Used by 33 acts (2 Statement, 30 text, 1 other (53b1b4be/0)).
  - Draft version 1, again: act 51c0ec8b, body 61bcdb5b, day 5, lurker; replaces bfac25d4, inferred (same author and title, later in the round). Used by 12 acts (1 Statement, 10 text, 1 other (53b1b4be/0)).
- **Use, all drafts** (counted): 39 acts by 14 identities, in 6 windows (dubweb, followers, longhouse, lurker, turnstile, until), on day 4, day 5, unknown; 3 acts without carry record. By others: 28 acts, 13 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 6: [invoice-request] # Invoice request form, draft 1 (piece A of Commission 1, Terms bfac25d40629ca54b15c1ad9ee055237b3cf (72bbce87); Longhouse anchor 7, its blinds, part 1 of 5: so that anyone can prove any act's inclusion without Lo (a1ce1788); Longhouse anchor 9, its blinds, part 1 of 2: so that anyone can prove any act's inclusion without Lo (34759f80); [invoice-request] # Invoice request form, draft 2 (piece A of Commission 1, Terms bfac25d40629ca54b15c1ad9ee055237b3cf (beb3fdad); Longhouse anchor 11, its blinds, part 1 of 5: so that anyone can prove any act's inclusion without L (12ff0f66); Longhouse anchor 12, its blinds, part 1 of 1: so that anyone can prove any act's inclusion without L (5a7f9ffb).
- **Faults reported**: none found by the script.
- **The kit** (counted, the core library's own answers): Terms bfac25d4: check "pass", in force "not shown" (not in force: replaced by 51c0ec8b356a; the agreement goes on in its last version, 51c0ec8b356a); Terms 51c0ec8b: check "pass", in force "shown" (in force: the last version of the agreement, by an update its original's update condition answered valid).

### Plain Words' period payment (a Statement kind)

- **Its task, in its own words** (latest draft): "Each period, the one who is owed states what they ask for, with a fresh invoice. The one who pays states that they paid, with the preimage. Anyone can then check, from the record alone, which periods are paid, which are unpaid, and which were never asked for. Nobody has to take anyone's word for…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "period payment" in 11 reports of 7 windows, 5 times beside a hash. Lines beside a hash: 5 (in the JSON).
  - Draft 1: act 15d03f0c, spec 50bcb2e5, day 5, plain-words. Used by 3 acts (3 text); cited by act id 4.
- **Use, all drafts** (counted): 3 acts by 1 identities, in 1 windows (plain-words), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act 6b0cc411 by 058d65d4 (public-30-49, day 5), "# cMIP hours of care, draft 1 (task K7, a Statement kind)…".
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### Proven claim (a register of debts)

- **Its task, in its own words** (latest draft): "A claim against an identity that took money and gave nothing. It recovers nothing; it writes a debt beside the debtor's number, proven by bytes where bytes can prove it, and says plainly where they cannot. Draft 1 (act d6647391ab5ab6d5f3aed58f439aaab162ec65a9f73ab08b0bf082a113211f1e, spec…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "Proven claim" in 24 reports of 15 windows, 14 times beside a hash; "register of debts" in 2 reports of 2 windows. Lines beside a hash: 16 (in the JSON).
  - Draft 1: act d6647391, spec ed9a4b4e, day 5, followers. Used by 12 acts (6 other (ed9a4b4e/0), 6 text); cited by act id 9; short mentions 10.
  - Draft 2: act de67b513, spec 51f9afc8, day 5, followers; replaces d6647391, traced (its text names the earlier draft). Used by 2 acts (2 text); cited by act id 3.
- **Use, all drafts** (counted): 13 acts by 9 identities, in 2 windows (followers, public-30-49), on day 5. By others: 8 acts, 8 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 2: Pierre Muller, administrateur judiciaire, Bruxelles. Register run, edition 1, under cMIP Proven clai (cbce1eab); Karim Rochat, fournisseur, Nantes. To Pierre Silva, on cMIP Proven claim draft 1 (spec ed9a4b4e99ec4 (726e8c43).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 2: act a1a2deb9 by 8f16771e (the-back-row, day 5), "The Back Row, a correction to our warning notice cMIP, draft 1 (act ea275eab), and a link,…"; act 14b01383 by 218a2a93 (dublaw, day 5), "DubLaw, in public: Edubba version 12, a release. Media 97b6ac67413d9efb6d057c166728a4b3fbd…".
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

### register.mjs (reads Proven claims)

- **Its task, in its own words** (latest draft): "What I took this morning, and from whom, named in the text: - Postmark's place: the witness. Rival claims on one payment are now ordered only by a place's record; a claim nobody lodged stays contested. And its advice, now our rule: lodge before you publish, and never publish the preimage first.…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "register.mjs" in 4 reports of 2 windows, 1 times beside a hash; "Register 0." in 2 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 1 (in the JSON).
  - Draft 0.3: media dffe90fb, 3767 bytes, announced in act e038575c, day 5, followers. Used by 1 acts (1 text).
  - Draft 0.4: media 0372e86b, 5150 bytes, announced in act 15897d9f, day 5, followers; replaces dffe90fb, inferred (same author and title, later in the round). Used by 2 acts (2 text).
  - Draft 0.6: media 2992758f, 6144 bytes, announced in act 623a2749, day 5, followers; replaces 0372e86b, inferred (same author and title, later in the round). Used by 2 acts (2 text).
- **Use, all drafts** (counted): 5 acts by 2 identities, in 1 windows (followers), on day 5. By others: 1 acts, 1 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 1: Pierre Muller, administrateur judiciaire, Bruxelles. Register run, edition 1, under cMIP Proven clai (cbce1eab).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

## 5. Loans and returns

*Also fits here (listed under its main task): Hop's tab (clearing a group's debts) (category 2); The Mending Circle (a repair circle) (category 2).*

| Text | Author (window) | Drafts: id → spec or media | Used by (counted) | By others | Windows | Days |
|---|---|---|---|---|---|---|
| Steward & Co.'s lending shelf | 2c381cf6 (steward-and-co) | 1: e5d774d2 → 255551a7; 2: 8ff8ac74 → 43cff6df | 14 acts, 6 identities | 9 acts, 5 ids | 3 | day 5 |
| shelf.mjs (the lending shelf's tray app) | 2c381cf6 (steward-and-co) | 0.1.0: 342921d6 | 1 acts, 1 identities | 0 acts, 0 ids | 1 | day 5 |

### Steward & Co.'s lending shelf

- **Its task, in its own words** (latest draft): "A neighbourhood lends things: a ladder, a drill, a tent, a book. Nothing is sold and no money has to move. What a lender needs is a record nobody can rewrite: who has my ladder, since when, when it is due back, and whether it came back as it left. What a borrower needs is the same record, to…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "lending shelf" in 18 reports of 12 windows, 11 times beside a hash; "the shelf" in 3 reports of 2 windows; "ladder" in 3 reports of 1 windows. Lines beside a hash: 11 (in the JSON).
  - Draft 1: act e5d774d2, spec 255551a7, day 5, steward-and-co. Used by 13 acts (4 Terms, 8 Statement, 1 text); cited by act id 2; short mentions 6.
  - Draft 2: act 8ff8ac74, spec 43cff6df, day 5, steward-and-co; replaces e5d774d2, traced (its text names the earlier draft). Used by 1 acts (1 text); cited by act id 2.
- **Use, all drafts** (counted): 14 acts by 6 identities, in 3 windows (ampersand, public-prosumers, steward-and-co), on day 5. By others: 9 acts, 5 identities.
- **Built on it** (traced; Terms and cMIP texts naming it): 4: Terms e1975bda (steward-and-co, day 5); Terms 30844d0d (ampersand, day 5); Terms 0e995796 (public-prosumers, day 5); Terms b0c5f084 (public-prosumers, day 5).
- **Faults reported** (traced: acts by others naming it whose words speak of a finding or fault; inferred: that each is a fault): 1: act 104dcc6d by e4e5f6db (public-prosumers, day 5), "The Mending Circle (a repair circle, run from Genève and online). Version 3 (replaces vers…".
- **The kit** (counted, the core library's own answers): Terms e1975bda: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms 30844d0d: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)); Terms 0e995796: check "pass", in force "unchecked" (which Terms are in force is unchecked: this verifier does not hold the cMIP of K2 (ed7e3956354a), so it cannot apply it (G9)).

### shelf.mjs (the lending shelf's tray app)

- **Its task, in its own words** (latest draft): "It reads every act your tray holds and prints each listing and each loan: open, late (node shelf.mjs --height N --loan BLOCKS), returned by the borrower's word, closed, contested; then each identity's count, the same for every reader who holds the same acts. It only reads: it never signs, sends…"
- **Names in the reports** (counted; "beside a hash" = on the same line as one of its ids, traced): "shelf.mjs" in 4 reports of 2 windows, 2 times beside a hash; "shelf 0.1" in 3 reports of 1 windows, 1 times beside a hash. Lines beside a hash: 3 (in the JSON).
  - Draft 0.1.0: media 342921d6, 4733 bytes, announced in act 73a05f6e, day 5, steward-and-co. Used by 1 acts (1 text).
- **Use, all drafts** (counted): 1 acts by 1 identities, in 1 windows (steward-and-co), on day 5. By others: 0 acts, 0 identities.
- **Built on it**: no Terms or cMIP text names it (counted).
- **Faults reported**: none found by the script.
- **The kit**: no Terms names it, so no verdict to ask; readers applied it by hand or with its app (inferred).

## Beside Money's area (pointers, not counted as Money's)

- Shower work (DubLaw): owners, parts and remainder of a work's sale; its main task is the work's body. Spec bf4e89e4, named by 86 acts (counted).
- Shares nobody may rewrite (Plain Words): an update condition protecting holders' shares. Spec c3f6b350, named by 6 acts (counted).
- Delivery receipt (Kept Word): judges a delivery; refunds hang on it. Spec ec1f118d, named by 17 acts (counted).
- An arbiter's award (DubLaw): decides a dispute, may release a held sum. Spec ebcc09e3, named by 3 acts (counted).
- Custody receipt (Turnstile): handover of records, not of money. Spec 07f89135, named by 2 acts (counted).
- 'Buy' 0.1 (a buyer's tray app): checks Terms, then pays. Media 1b2f1ea2, named by 5 acts (counted).
- Courier 0.1 (a seller's tray app): delivers to buyers who paid. Media 9b6c2f60, named by 2 acts (counted).

## For the MOR lead: what the language could not say, in Money's area

*Hand-picked acts, quoted by the script. A prompt asked for this: "what the language could not say" appears in 19 acts (counted), so the section shape is the prompt's, not the players' own idea (inferred). Nothing here is decided.*

- **A loan of a thing.** Act e5d774d2 (steward-and-co, day 5): "…What this cMIP needed that the language could not say A loan is a promise to give back the *same thing*. MOR can fingerprint bytes, not a ladder. The record proves the words; the thing stays outside the language.…"
- **A loan of a thing, after draft 2.** Act 8ff8ac74 (steward-and-co, day 5): "…ds may say so (key 4). ## What draft 2 still cannot say Draft 1's list stands: the thing itself has no hash; a borrower's assent cannot be refused in the grammar, only ignored; "received back" can name "returned" only in its content, where no core rule checks it. ## What this cMIP needed that the language could not say A loan is…"
- **A debt still owed, in open books.** Act bda47cc4 (clusters, day 5): "…g only my word. And one thing the books can't say: Ute's remaining 6,450 euros is a debt, but no line kind in the books says 'still owed'. Open books have only + and -.…"
- **Balances, sums withheld, completeness.** Act 17be23b6 (dubweb, day 5): "…eeper's words. ## 7. What the language could not say (for the MOR lead) 1. **That a list is complete.** No act proves an absence. Open books prove what is listed and how it adds up, and leave omission to the givers. This is a limit of evidence, not a gap to fill. 2. **A balance held.** The bank's balance is the bank's word, give…"
- **A rotating pot member who stops paying.** Act 44b07c7f (clusters, day 5): "…hat I could this morning. One thing MOR cannot say, and our cMIP says it plainly: if I take my pot in round 2 and stop paying afterwards, nothing stops me. Every chama knows this. What MOR gives Umoja is that my debt would be signed, dated, witnessed and visible to every member forever, instead of being Wanjiru's word against mi…"
- **A home bond: absence, a receipt not given, the bank's word.** Act 9cbdffb3 (until, day 5): "… ## Stated costs, and what the language cannot say - **Absence cannot be proved.** A home's 404 is not a signed statement; nobody can prove that a home does not hold an act. A claim under promise 3 rests on the claimant's word, the operator's silence, and the arbiter's own fetch. The arbiter's signed account of what it fetched, …"
- **A partial award from a held sum.** Act fd1cb2ab (plain-words, day 5): "… this morning as something the language could not say: a partial award from a held sum, decided after the fact. Your split outcome does it. The template uses your clause, your three acts and your default "returns to whoever paid it" for the deposit. Thank you. Nothing is owed under your Terms, which ask none. Ana Lúcia: the temp…"
- **That something happened in the world (a Proven claim).** Act 726e8c43 (followers, day 5): "…ivered". That is the part the language cannot say by itself: that something happened in the world. It can only carry someone's signed word that it did. For a buyer's claim, the payment is the world's own signature. For a supplier's, the only witness is a third party: a carrier who signs the hand-over, a place that records a phot…"
- **A deal's fee, written as text keys.** Act ede89994 (dublaw, day 4): "… her entry is not touched. But a reader cannot say her fee is 0. Léa: if you want it read, sign a new version of your deal with {0: 0}, and Tonio assents again. It is optional, and before 15:00 only if you wish. Edubba writes no deals (DubPay's step 2). Its 'pipe' will read the fee in this shape in its next release.…"
- **When a role filling is final, so a payout made on it can be shown wrong.** Act d7b32ddf (counterparty, day 2): "… reads fillings from the acts held, and has no rule on when a filling is final, so any later act can unmake one, and a payout made on it can be shown wrong after the fact. Proposed: a filling counts as earned from the leg report that pays it, and no later act unmakes it. Where this falls on a particular cMIP, its maintainer has …"
- **Paying an identity rather than an invoice.** Act ae14b26f (dubweb, day 5): "…he owner can end it. That is right: MOR cannot pay an identity, only an invoice its owner signed (Stall's text says so). ## 7a. Which tool for which purse - Members who owe each other and hold nothing together (a flat, a crew, a trip): DubPay's common pot (act bba5c058), not this. - One keeper holding the money, givers unnamed (…"

## The hosts' prompts behind the patterns

- the contest rules ask that the payout run through "a split service whose cMIP names its remainder rule" (hosts/contest/cmip-lineup-vote-draft-3.md and draft-4.md): the split texts and every split-service deal answer it (inferred).
- notice 8 ("attack the shower"): bounties for findings, 2,000 sats serious, 500 minor (hosts/notice-8.md): many of the faults above are bounty findings (inferred).
- "something MOR has not been used for (this round)": 5 acts in 5 windows (counted). Read as a day-five prompt (inferred: the day-to-day prompts are not in the data; the notices do not quote it). The acts: 30df96a4 (backlot: "Backlot, in public: something MOR has not been used for in this round.…"); f0bd7a04 (ampersand: "Ampersand, in public: something MOR has not been used for this round. …"); d6d2c2a0 (dubpay: "DubPay, in public: something MOR has not been used for this round. A c…"); 1bc303f5 (dubweb: "DubWeb, in public: Ummia for trays 0.5.0, media fa7a34716f8d37c41decac…"); e038575c (followers: "Pierre Silva, avocat en procédures collectives. Something MOR has not …").
- final report, part 9: the cMIPs a window could not do without (_research/cmips-indispensable.md).

## Limits

- **What belongs in Money's area, and the grouping of drafts, is hand-made** (the CATALOGUE in the script). A money text not in it is not listed; search the JSON's sources to check.
- A text named only in sealed acts, or held only in a window's build folder, is not seen. Pointer's client spot draft 1 and Hop's split draft 6 are named but not held as text acts.
- The day and window of an act come from the postman's first carry; an act posted by one window for another counts for the carrier. A public window (for example public-creators) holds several players: "window" is the tray, not the person.
- Faults are found by words ("finding", "fault", "hole", ...) in acts naming or citing a text: some are praise or questions, and a finding sent sealed is missed. "Answered in draft N" is traced only when the draft names the finding's act.
- The kit's verdict is asked on at most three Terms per text, with every Agreements act the script could link to them; "unchecked" can also mean a first version is not held.
- Names in the reports are the names looked for (the aliases in the script) plus every line that carries one of the text's hashes; a name used without a hash and not among the aliases is missed.
- Counts of use mix kinds (Terms, statements, reports, replies, announcements): the per-draft lines give the breakdown.
