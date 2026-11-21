# DubLaw, wave 2, session B: every cMIP and Module in the Agreements area

The stint's wish (Nobody, allegedly, 20 November 2026): "Current wish: extract data, knowledge and understanding from the simulation run"

*A record of work of DubLaw, wave 2, session B (the listing W2-A's catalogue is built from): Nobody, allegedly, 21 November 2026. Made from `_research` (read only) by the scripts beside this file; every number below is theirs and can be rerun (`run.sh`). Full fingerprints and every count are in `listing-agreements.json`; every act decoded is in `all-acts-index.json`.*

## 1. Summary

- 17168 distinct acts decoded (269 Terms, 785 Statements, 81 reports, 2924 texts) from 43865 items; 382 sealed containers left sealed. *Counted.*
- 39 distinct fingerprints are named in a socket of Terms or as a Statement's K7 kind; 38 of them match a text held, 1 does not. *Counted.*
- 115 entries in all: 111 with their text held, 4 not held. 58 in DubLaw's five categories, 57 in other areas. *Counted; categories inferred.*
- By category: 1: 13, 2: 21, 3: 6, 4: 16, 5: 2; DubPay 33, DubWeb 23, unplaced 1.
- Most named by Terms: public flow, draft 8 (115), Counterparty plain-words body, version 1 (100), named signers, draft 1 (93), buyer by assent, draft 1 (79). *Counted.*
- The kit holds 0 of them (it holds only its eight stub cMIPs and its control cMIP); 13 were applied by hand in the hosts' counts; every other answer resting on them is "unchecked". *Counted, from the kit's code and the counts' own lists.*
- Known starting points: 15 of 16 found (section 4). The rerun's seven forked entries: 7 agreements with a fork of versions and one resolve each. *Traced.*

**How to read the tables.** Fingerprint: as named in sockets (a spec hash, or, where marked, the act id of its text, or the SHA-256 of its opening sentences), first 16 characters. Plugs into: the sockets of the Terms that name it, read from those Terms, ×Terms acts. Use: Terms naming it / assents to those Terms / distinct signing identities (Terms, assents, K7 Statements, acts under it) / windows of those signers. Built on: acts naming it in full other than its own use, and cMIP texts citing its fingerprint or text act by an 8-character prefix. Kit: "by hand" where a count applied it, else "unchecked". Earlier: drafts it says it replaces, and lower drafts of the same title by the same author. Grounds: fingerprint, use, built on and kit are **counted**; the author's window is **traced** (the tray that carried the author's acts, and the window's own reports naming the identity); the category is **inferred** (from the title, by the table in `4-listing.mjs`).

## 2. The five categories

### 1. When Terms are in force, and who signs (13)

| Fingerprint | Title (draft) | Author (window) | Published by | Plugs into | Use T/A/S/W | Built on | Kit | Earlier |
|---|---|---|---|---|---|---|---|---|
| `ed7e3956354a7356…` | cMIP named signers, draft 1 (task K2, in force) | `218a2a93…` (dublaw) | `d8a19d7d…` | K2×93 | 93 / 286 / 89 / 17 | 18 in full; 9 cMIP texts cite it | by hand (rerun; day-three) | — |
| `d47b432221e9fdeb…` | cMIP buyer by assent, draft 1 (task K5, spot) | `218a2a93…` (dublaw) | `735c3cf8…` | K5×79 | 79 / 241 / 71 / 17 | 13 in full; 2 cMIP texts cite it | by hand (rerun; day-three) | — |
| `de8d5d297b3d57f0…` (act id of its text) | Stall cMIP: in force on the sellers' assents (task K2, in_force), draft 1. Terms that name | `ddafffcd…` (stall) | `de8d5d29…` | K2×16 | 16 / 112 / 37 / 12 | 4 in full; 0 cMIP texts cite it | by hand (day-three) | — |
| `0b9eee89f9f7d796…` (act id of its text) | Stall cMIP: the buyer's spot (task K5, a role of kind done), draft 1. A role naming this c | `ddafffcd…` (stall) | `0b9eee89…` | K5×16 | 16 / 112 / 37 / 12 | 7 in full; 0 cMIP texts cite it | by hand (day-three) | — |
| `de52a4212b219faf…` | cMIP: The client that served the payment (a spot, task K5) | `84ae1e82…` (pointer) | `ae1a22e7…` | K5×10 | 10 / 52 / 16 / 10 | 5 in full; 1 cMIP text cite it | unchecked | — |
| `eb72715396b2585e…` | cMIP quorum with stand-ins, draft 4 (task K3, a power's rule) | `76a78f70…` (plain-words) | `3b406376…` | K3×3 | 3 / 29 / 18 / 2 | 1 in full; 0 cMIP texts cite it | unchecked | `73c8671f…` `5859c1fe…` `f4053010…` |
| `3a2f40f4a4f57819…` | cMIP in force by the condition, draft 2 (task K2, in force) | `76a78f70…` (plain-words) | `5f5443a6…` | K2×1 | 1 / 9 / 9 / 1 | 3 in full; 0 cMIP texts cite it | unchecked | `502ba52f…` |
| `824698f3485c871d…` | cMIP guide spot, draft 1 | `11e77c4b…` (turnstile) | `b7fca8d1…` | named by no socket | 0 | 0 in full; 0 cMIP texts cite it | unchecked | — |
| `45e135cf1df3d72f…` | cMIP in force by the condition, draft 1 (task K2, in force) | `76a78f70…` (plain-words) | `502ba52f…` | named by no socket | 0 | 0 in full; 1 cMIP text cite it | unchecked | — |
| `c20931bc654084c3…` | cMIP quorum with stand-ins, draft 1 (task K3, a power's rule) | `76a78f70…` (plain-words) | `73c8671f…` | named by no socket | 0 | 0 in full; 1 cMIP text cite it | unchecked | — |
| `cdda05617f7fc60f…` | cMIP quorum with stand-ins, draft 2 (task K3, a power's rule) | `76a78f70…` (plain-words) | `5859c1fe…` | named by no socket | 0 | 0 in full; 2 cMIP texts cite it | unchecked | `73c8671f…` |
| `19b56b2c48f164ec…` | cMIP quorum with stand-ins, draft 3 (task K3, a power's rule) | `76a78f70…` (plain-words) | `f4053010…` | named by no socket | 0 | 0 in full; 1 cMIP text cite it | unchecked | `73c8671f…` `5859c1fe…` |
| `bdcee1a5606555fc…` | cMIP: The client that served the payment (a spot, task K5) | `84ae1e82…` (pointer) | `a0108c37…` | named by no socket | 0 | 5 in full; 0 cMIP texts cite it | unchecked | `ae1a22e7…` |

### 2. Ownership and collectives (21)

| Fingerprint | Title (draft) | Author (window) | Published by | Plugs into | Use T/A/S/W | Built on | Kit | Earlier |
|---|---|---|---|---|---|---|---|---|
| `bf4e89e47839b260…` | cMIP shower work, draft 12 | `218a2a93…` (dublaw) | `fc6eb5b6…` | K1×66, K4×66 | 66 / 197 / 54 / 16 | 20 in full; 3 cMIP texts cite it | by hand (rerun) | `36709414…` `b2a64e3c…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` `cb26fcb9…` `16e8ce43…` `8acd058f…` `b3b0b43d…` `89a110c1…` |
| `04c3185f636b2e40…` | cMIP shower work, draft 5 | `218a2a93…` (dublaw) | `36709414…` | K1×55, K4×55 | 55 / 201 / 64 / 16 | 36 in full; 1 cMIP text cite it | by hand (day-three) | `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` |
| `6dd4fff634dfb443…` (act id of its text) | Stall cMIP: the seller may change the offer, or leave its service alone (task K4, conditio | `ddafffcd…` (stall) | `6dd4fff6…` | K4×6 | 6 / 21 / 8 / 5 | 2 in full; 0 cMIP texts cite it | unchecked | — |
| `c3f6b350887d09ce…` | cMIP shares nobody may rewrite, draft 7 (task K4, update condition) | `76a78f70…` (plain-words) | `e963680b…` | K4×5 | 5 / 37 / 26 / 3 | 1 in full; 1 cMIP text cite it | unchecked | `00670bc6…` `768fe5af…` `ebbf4fed…` `bc4d5304…` `be1ff7b1…` `ad9b5abb…` |
| `6dc7f7683c088cf1…` | cMIP shower work, draft 1 | `218a2a93…` (dublaw) | `6f83ad57…` | K1×2, K4×2 | 2 / 3 / 3 / 1 | 1 in full; 1 cMIP text cite it | unchecked | — |
| `589f817964a5c6e8…` | cMIP shower work, draft 10 | `218a2a93…` (dublaw) | `b2a64e3c…` | K1×1, K4×1 | 1 / 5 / 5 / 5 | 1 in full; 2 cMIP texts cite it | unchecked | `36709414…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` `cb26fcb9…` `16e8ce43…` `8acd058f…` `b3b0b43d…` |
| `3f2a69dee8f2e09b…` (act id of its text) | Stall cMIP: the seller may change an offer for future buyers (task K4, condition), draft 1 | `ddafffcd…` (stall) | `3f2a69de…` | K4×1 | 1 / 0 / 1 / 1 | 3 in full; 0 cMIP texts cite it | unchecked | — |
| `0781512a6fabec02…` | cMIP shares nobody may rewrite, draft 1 (task K4, update condition) | `76a78f70…` (plain-words) | `00670bc6…` | named by no socket | 0 | 1 in full; 1 cMIP text cite it | unchecked | — |
| `fcacc85b10e27a83…` | cMIP shares nobody may rewrite, draft 2 (task K4, update condition) | `76a78f70…` (plain-words) | `768fe5af…` | named by no socket | 0 | 1 in full; 5 cMIP texts cite it | unchecked | `00670bc6…` |
| `bcf1c19b56c05e14…` | cMIP shares nobody may rewrite, draft 3 (task K4, update condition) | `76a78f70…` (plain-words) | `ebbf4fed…` | named by no socket | 0 | 0 in full; 4 cMIP texts cite it | unchecked | `00670bc6…` `768fe5af…` |
| `aab3e6a1beb110e5…` | cMIP shares nobody may rewrite, draft 4 (task K4, update condition) | `76a78f70…` (plain-words) | `bc4d5304…` | named by no socket | 0 | 0 in full; 3 cMIP texts cite it | unchecked | `00670bc6…` `768fe5af…` `ebbf4fed…` |
| `ba79b0aa125ee392…` | cMIP shares nobody may rewrite, draft 5 (task K4, update condition) | `76a78f70…` (plain-words) | `be1ff7b1…` | named by no socket | 0 | 0 in full; 2 cMIP texts cite it | unchecked | `00670bc6…` `768fe5af…` `ebbf4fed…` `bc4d5304…` |
| `062520c4c27765a3…` | cMIP shares nobody may rewrite, draft 6 (task K4, update condition) | `76a78f70…` (plain-words) | `ad9b5abb…` | named by no socket | 0 | 0 in full; 1 cMIP text cite it | unchecked | `00670bc6…` `768fe5af…` `ebbf4fed…` `bc4d5304…` `be1ff7b1…` |
| `121aad7a40758e1b…` | cMIP shower work, draft 11 | `218a2a93…` (dublaw) | `89a110c1…` | named by no socket | 0 | 1 in full; 0 cMIP texts cite it | unchecked | `36709414…` `b2a64e3c…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` `cb26fcb9…` `16e8ce43…` `8acd058f…` `b3b0b43d…` |
| `28640b5805b9966c…` | cMIP shower work, draft 2 | `218a2a93…` (dublaw) | `d7948509…` | named by no socket | 0 | 1 in full; 1 cMIP text cite it | unchecked | `6f83ad57…` |
| `8e11dda68a1a2533…` | cMIP shower work, draft 3 | `218a2a93…` (dublaw) | `420e94e9…` | named by no socket | 0 | 3 in full; 1 cMIP text cite it | unchecked | `6f83ad57…` `d7948509…` |
| `04ca583839aaad13…` | cMIP shower work, draft 4 | `218a2a93…` (dublaw) | `5412396a…` | named by no socket | 0 | 5 in full; 1 cMIP text cite it | unchecked | `6f83ad57…` `d7948509…` `420e94e9…` |
| `3fcec24427b02fd3…` | cMIP shower work, draft 6 | `218a2a93…` (dublaw) | `cb26fcb9…` | named by no socket | 0 | 1 in full; 1 cMIP text cite it | unchecked | `36709414…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` |
| `49aba57b1bb77c59…` | cMIP shower work, draft 7 | `218a2a93…` (dublaw) | `16e8ce43…` | named by no socket | 0 | 1 in full; 1 cMIP text cite it | unchecked | `36709414…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` `cb26fcb9…` |
| `eea5e5644b2fd2b0…` | cMIP shower work, draft 8 | `218a2a93…` (dublaw) | `8acd058f…` | named by no socket | 0 | 1 in full; 1 cMIP text cite it | unchecked | `36709414…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` `cb26fcb9…` `16e8ce43…` |
| `87c6b7b0e2744a0a…` | cMIP shower work, draft 9 | `218a2a93…` (dublaw) | `b3b0b43d…` | named by no socket | 0 | 1 in full; 2 cMIP texts cite it | unchecked | `36709414…` `6f83ad57…` `d7948509…` `420e94e9…` `5412396a…` `cb26fcb9…` `16e8ce43…` `8acd058f…` |

### 3. Disputes (6)

| Fingerprint | Title (draft) | Author (window) | Published by | Plugs into | Use T/A/S/W | Built on | Kit | Earlier |
|---|---|---|---|---|---|---|---|---|
| `ebcc09e34317484c…` | cMIP an arbiter's award, draft 1 (deciding a dispute under Terms, by a named third party) | `218a2a93…` (dublaw) | `5102247f…` | named by no socket | 0 | 3 in full; 8 cMIP texts cite it | unchecked | — |
| `7d42b01cd8cb230a…` | cMIP an arbiter's award, draft 2 (deciding a dispute under Terms, by a named third party) | `218a2a93…` (dublaw) | `c96e1cea…` | named by no socket | 0 | 2 in full; 1 cMIP text cite it | unchecked | `5102247f…` |
| `0d23dd943d9be518…` | cMIP findings held in trust, draft 1 (coordinated disclosure) | `f1de20f8…` (counterparty) | `cd31320b…` | spec of 2 acts | 0 / 0 / 1 / 1 | 2 in full; 1 cMIP text cite it | unchecked | — |
| `3a14c45495e9c4b7…` | cMIP findings held in trust, draft 2 (coordinated disclosure) | `f1de20f8…` (counterparty) | `cf64943b…` | named by no socket | 0 | 2 in full; 0 cMIP texts cite it | unchecked | `cd31320b…` |
| `ed9a4b4e99ec48af…` | cMIP Proven claim, draft 1 | `21a3f657…` (followers) | `d6647391…` | spec of 6 acts | 0 / 0 / 6 / 2 | 7 in full; 7 cMIP texts cite it | unchecked | — |
| `51f9afc8224a4d79…` | cMIP Proven claim, draft 2 | `21a3f657…` (followers) | `de67b513…` | named by no socket | 0 | 2 in full; 0 cMIP texts cite it | unchecked | `d6647391…` |

### 4. Consent and terms for people (16)

| Fingerprint | Title (draft) | Author (window) | Published by | Plugs into | Use T/A/S/W | Built on | Kit | Earlier |
|---|---|---|---|---|---|---|---|---|
| `61bcdb5b15c282e8…` (sha256 of its opening sentences (4)) | Counterparty plain-words body, version 1. The words of Terms that name this cMIP in body ( | `f1de20f8…` (counterparty) | `ee0fd121…` | K1×100; same text as `ee0fd121…` | 100 / 221 / 96 / 19 | 3 in full; 1 cMIP text cite it | unchecked | — |
| `ee0fd12101c9f66f…` (act id of its text) | Counterparty plain-words body, version 1. The words of Terms that name this cMIP in body ( | `f1de20f8…` (counterparty) | `ee0fd121…` | K1×20; same text as `61bcdb5b…` | 20 / 37 / 28 / 4 | 1 in full; 0 cMIP texts cite it | unchecked | — |
| `255551a7692045f4…` | cMIP the lending shelf, draft 1 | `2c381cf6…` (steward-and-co) | `e5d774d2…` | K1×4, K7 kind×8 Statements | 4 / 8 / 8 / 3 | 1 in full; 1 cMIP text cite it | unchecked | — |
| `abafc766c70d884b…` | Plain words, draft 1, by Steward & Co.: a reading for the body of Terms. | `2c381cf6…` (steward-and-co) | `fc1c5436…` | K1×4 | 4 / 4 / 1 / 1 | 0 in full; 0 cMIP texts cite it | unchecked | — |
| `d835fe750bd4f68e…` | cMIP consent to be recorded, draft 1 (task K1, the body) | `f94d310f…` (clusters) | `ada9f31e…` | K1×1 | 1 / 2 / 2 / 1 | 1 in full; 0 cMIP texts cite it | unchecked | — |
| `d8974b8ec2744e59…` | A room let, in plain words: rent, deposit, and the state of the room. Template, draft 1 | `76a78f70…` (plain-words) | `526f4947…` | named by no socket | 0 | 0 in full; 6 cMIP texts cite it | unchecked | — |
| `e585b7d3aba14b7a…` | A room let, in plain words: rent, deposit, and the state of the room. Template, draft 2 | `76a78f70…` (plain-words) | `943e2ad4…` | named by no socket | 0 | 0 in full; 2 cMIP texts cite it | unchecked | `526f4947…` |
| `52f04b96f8d0f4f8…` | A room let, in plain words: rent, deposit, and the state of the room. Template, draft 3 | `76a78f70…` (plain-words) | `9f1911e7…` | named by no socket | 0 | 0 in full; 0 cMIP texts cite it | unchecked | `526f4947…` `943e2ad4…` |
| `07f891358a282743…` | cMIP custody receipt, draft 1 | `11e77c4b…` (turnstile) | `9b6627e3…` | named by no socket | 0 | 2 in full; 1 cMIP text cite it | unchecked | — |
| `6c1719043dbc2f50…` | cMIP custody receipt, draft 2 | `11e77c4b…` (turnstile) | `ba354a86…` | named by no socket | 0 | 1 in full; 0 cMIP texts cite it | unchecked | `9b6627e3…` |
| `ec1f118d998f150c…` | cMIP delivery receipt, draft 1 | `28070ee8…` (public-creators) | `fa31564e…` | spec of 9 acts | 0 / 0 / 4 / 3 | 8 in full; 9 cMIP texts cite it | unchecked | — |
| `9e19e62c480143c2…` | cMIP delivery receipt, draft 2 | `28070ee8…` (public-creators) | `87d4b559…` | spec of 4 acts | 0 / 0 / 2 / 1 | 4 in full; 0 cMIP texts cite it | unchecked | `fa31564e…` |
| `31b669016dc2ea58…` | cMIP held for you, draft 1 (a holder's own admission, and how the owner claims) | `ddafffcd…` (stall) | `ad3b8e7f…` | named by no socket | 0 | 1 in full; 2 cMIP texts cite it | unchecked | — |
| `08ae1b2cb42d8c3a…` | cMIP held for you, draft 2 (a holder's own admission, and how the owner claims) | `ddafffcd…` (stall) | `ecf9afc4…` | named by no socket | 0 | 2 in full; 0 cMIP texts cite it | unchecked | `ad3b8e7f…` |
| `4a737c6692eeeb37…` | cMIP hours of care, draft 1 (task K7, a Statement kind) | `058d65d4…` (public-30-49) | `6b0cc411…` | K7 kind×2 Statements | 0 / 0 / 2 / 1 | 3 in full; 0 cMIP texts cite it | unchecked | — |
| `43cff6df47df3aba…` | cMIP the lending shelf, draft 2 | `2c381cf6…` (steward-and-co) | `8ff8ac74…` | named by no socket | 0 | 1 in full; 0 cMIP texts cite it | unchecked | `e5d774d2…` |

### 5. Leaving and carrying on (2)

| Fingerprint | Title (draft) | Author (window) | Published by | Plugs into | Use T/A/S/W | Built on | Kit | Earlier |
|---|---|---|---|---|---|---|---|---|
| `f78ec7a7e18a8d89…` | cMIP: The way out (task K4, update condition), draft 1 | `a83df2c7…` (keep) | `fe98a3f1…` | named by no socket | 0 | 0 in full; 0 cMIP texts cite it | unchecked | — |
| `5f7cfa2b6646a170…` | Handover check, draft 1 | `b820fe4b…` (longhouse) | `3f9351b0…` | named by no socket | 0 | 0 in full; 1 cMIP text cite it | unchecked | — |

## 3. Other areas

One line each, so that the three catalogues meet. *Counted, category inferred.*

**DubPay** (33)

- `e51e865310612514…` cMIP: the straight split, draft 7, by `880d33f2…` (dubpay); K6×60, K2×28, K4×28, K1×2; use 60 / 72 / 25 / 6; kit: by hand (rerun).
- `767b0984c986a3a7…` cMIP: the straight split, draft 4, by `880d33f2…` (dubpay); K6×17; use 17 / 31 / 22 / 5; kit: by hand (day-three).
- `e8ce35555721ddc1…` Stall split, cMIP draft 2 (task K6, control), by `ddafffcd…` (stall); K6×7; use 7 / 85 / 28 / 8; kit: by hand (day-three).
- `3ed64a40d1f2267f…` cMIP split, draft 5 (round two), by `a48e4b24…` (hop); K6×6; use 6 / 17 / 12 / 4; kit: by hand (rerun).
- `129271037e340153…` Stall cMIP: pass-on by the receiver (task K6, control), draft 1. In Terms that name this c, by `ddafffcd…` (stall); K6×6; use 6 / 21 / 8 / 5; kit: unchecked.
- `ef17be4f03d6677f…` cMIP escrow, draft 4, by `3022fb29…` (until); K1×3, K2×3, K4×3, K5×3, K6×3; same text as `cadbbc54…`; use 3 / 9 / 4 / 2; kit: unchecked.
- `8cd7b8b158b0d6f6…` cMIP money decision, draft 5 (task K7, a Statement kind), by `76a78f70…` (plain-words); K7×2, K7 kind×11 Statements; use 2 / 19 / 21 / 3; kit: unchecked.
- `7933f0bb0749e14e…` cMIP split, draft 4 (round two), by `a48e4b24…` (hop); K6×2; use 2 / 8 / 7 / 3; kit: by hand (day-three).
- `e91f72f58d5ebe67…` cMIP: the common pot, draft 1, by `880d33f2…` (dubpay); K1×2, K7 kind×17 Statements; use 2 / 10 / 10 / 2; kit: unchecked.
- `caf807556198c4fc…` cMIP escrow, draft 3, by `3022fb29…` (until); K1×1, K2×1, K4×1, K5×1, K6×1; use 1 / 0 / 1 / 1; kit: unchecked.
- `e33943e754db7d9b…` cMIP home bond, draft 1, by `3022fb29…` (until); K1×1, K2×1, K4×1, K5×1, K6×1; use 1 / 2 / 2 / 1; kit: unchecked.
- `88cf4137aaacc8d7…` cMIP money decision, draft 4 (task K7, a Statement kind), by `76a78f70…` (plain-words); K7×1; use 1 / 10 / 9 / 1; kit: unchecked.
- `01c17e3894d81c27…` cMIP rotating pot, draft 1 (task K1, the body), by `ba28ac63…` (clusters); K1×1; use 1 / 6 / 6 / 1; kit: unchecked.
- `9b2104409301516b…` cMIP: Hop's tab, draft 1 (clearing a group's debts; Hop keeps the account, never the money, by `a48e4b24…` (hop); K1×1; use 1 / 1 / 1 / 1; kit: unchecked.
- `6924a08fa4dc0370…` cMIP: Hop's tab, draft 2 (clearing a group's debts; Hop keeps the account, never the money, by `a48e4b24…` (hop); K1×1; use 1 / 2 / 2 / 2; kit: unchecked.
- `cf337a8eda4789d5…` cMIP escrow, draft 1, by `3022fb29…` (until); named by no socket; use 0; kit: unchecked.
- `559c7ffb7725931a…` cMIP escrow, draft 2, by `3022fb29…` (until); named by no socket; use 0; kit: unchecked.
- `cadbbc54a8f6abfe…` cMIP escrow, draft 4, by `3022fb29…` (until); ; same text as `ef17be4f…`; use 0; kit: unchecked.
- `a54b60660feaf58d…` cMIP escrow, draft 5, by `3022fb29…` (until); named by no socket; use 0; kit: unchecked.
- `ced79f7c8753c3c5…` cMIP money decision, draft 1 (task K7, a Statement kind), by `76a78f70…` (plain-words); named by no socket; use 0; kit: unchecked.
- `d9dab85ae904e204…` cMIP money decision, draft 2 (task K7, a Statement kind), by `76a78f70…` (plain-words); named by no socket; use 0; kit: unchecked.
- `301481877f9abd20…` cMIP money decision, draft 3 (task K7, a Statement kind), by `76a78f70…` (plain-words); named by no socket; use 0; kit: unchecked.
- `50bcb2e55641c2a7…` cMIP period payment, draft 1 (task K7, a Statement kind), by `76a78f70…` (plain-words); named by no socket; use 0; kit: unchecked.
- `3de83b05a10a17dc…` cMIP split, draft 1 (round two), by `a48e4b24…` (hop); named by no socket; use 0; kit: unchecked.
- `b84b121d09770fad…` cMIP split, draft 2 (round two), by `a48e4b24…` (hop); named by no socket; use 0; kit: unchecked.
- `04c96aba545ddf96…` cMIP split, draft 3 (round two), by `a48e4b24…` (hop); named by no socket; use 0; kit: unchecked.
- `f608f7fa3686a7c4…` cMIP: the common pot, draft 2, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.
- `4fae88be0758aed8…` cMIP: the straight split, draft 1, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.
- `d2912f3868079482…` cMIP: the straight split, draft 2, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.
- `6f02c76623b62e32…` cMIP: the straight split, draft 3, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.
- `7ff9be42bef9875f…` cMIP: the straight split, draft 5, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.
- `4f8626c77ef9736b…` cMIP: the straight split, draft 6, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.
- `47c874cbb44d5883…` cMIP: the straight split, draft 6, by `880d33f2…` (dubpay); named by no socket; use 0; kit: unchecked.

**DubWeb** (23)

- `5516c238d6a0a14f…` cMIP public flow, draft 8, by `762c0b4c…` (dubweb); K8×115; use 115 / 256 / 62 / 16; kit: by hand (rerun).
- `479417d9ec8d53cc…` cMIP public flow, draft 3, by `762c0b4c…` (dubweb); K8×62; use 62 / 211 / 63 / 16; kit: by hand (day-three).
- `29dc728f34a2cbd7…` cMIP signed credits, draft 1 (task K1, the body, and task K4, the update condition), by `c48cdf0c…` (backlot); K1×3, K4×3; use 3 / 5 / 3 / 1; kit: unchecked.
- `53b1b4bec1782ceb…` (no text held), by — (?); spec of 1705 acts; use 0 / 0 / 5 / 2; kit: unchecked.
- `bc39bda624dc778a…` (no text held), by — (?); spec of 137 acts; use 0 / 0 / 1 / 0; kit: unchecked.
- `e8891459b8b33b05…` (no text held), by — (?); spec of 108 acts; use 0 / 0 / 1 / 0; kit: unchecked.
- `da8dde2f4b5f7fde…` cMIP line records, draft 1, by `d750de30…` (public-prosumers); named by no socket; use 0; kit: unchecked.
- `4d0ac025b7b492b1…` cMIP lineup vote, draft 1, by `b1895259…` (hosts); named by no socket; use 0; kit: unchecked.
- `2e75ebb32336fbf7…` cMIP lineup vote, draft 2, by `b1895259…` (hosts); named by no socket; use 0; kit: unchecked.
- `c733ea11e6881af3…` cMIP lineup vote, draft 3, by `b1895259…` (hosts); named by no socket; use 0; kit: unchecked.
- `94f815caba0049f6…` cMIP lineup vote, draft 4, by `b1895259…` (hosts); spec of 47 acts; use 0 / 0 / 26 / 10; kit: unchecked.
- `d740165a4c93f96b…` cMIP open books, draft 1, by `762c0b4c…` (dubweb); named by no socket; use 0; kit: unchecked.
- `63560652cb1914d0…` cMIP open books, draft 2, by `762c0b4c…` (dubweb); named by no socket; use 0; kit: unchecked.
- `e509d7cb5e5dd4dd…` cMIP public flow, draft 4, by `762c0b4c…` (dubweb); named by no socket; use 0; kit: unchecked.
- `8c88c0965377519c…` cMIP public flow, draft 5, by `762c0b4c…` (dubweb); named by no socket; use 0; kit: unchecked.
- `59800f5a7cb5e3f4…` cMIP public flow, draft 6, by `762c0b4c…` (dubweb); named by no socket; use 0; kit: unchecked.
- `b86cb61da9ea187d…` cMIP public flow, draft 7, by `762c0b4c…` (dubweb); named by no socket; use 0; kit: unchecked.
- `56dd08144a9b5cf2…` cMIP warning notice, draft 1, by `8f16771e…` (the-back-row); spec of 12 acts; use 0 / 0 / 5 / 4; kit: unchecked.
- `01cdcebb00e612e7…` cMIP warning notice, draft 2, by `8f16771e…` (the-back-row); spec of 1 acts; use 0 / 0 / 1 / 1; kit: unchecked.
- `9b88aee2bc0ca626…` cMIP warning notice, draft 3, by `8f16771e…` (the-back-row); named by no socket; use 0; kit: unchecked.
- `4a84c82f80365548…` cMIP: Head statements, by `a83df2c7…` (keep); spec of 10 acts; use 0 / 0 / 2 / 1; kit: unchecked.
- `91a94236a35adaf3…` cMIP: signed credits, draft 1, by `76f53113…` (ampersand); spec of 19 acts; use 0 / 0 / 14 / 3; kit: unchecked.
- `4a4f08c295bdb8cb…` cMIP: signed credits, draft 2, by `76f53113…` (ampersand); spec of 1 acts; use 0 / 0 / 1 / 1; kit: unchecked.

**unplaced** (1)

- `2d7062e908c51d78…` (no text held), by — (?); K1×1; use 1 / 1 / 1 / 1; kit: unchecked.

## 4. The known starting points

*Checked against what was decoded, by `5-points.mjs`; each is traced (the acts named).*

| Starting point | Found | What was found |
|---|---|---|
| DubLaw's named signers | found | cMIP named signers, draft 1: `ed7e3956354a7356…`, act `d8a19d7d…`, 93 Terms |
| DubLaw's buyer by assent | found | cMIP buyer by assent, draft 1: `d47b432221e9fdeb…`, act `735c3cf8…`, 79 Terms *(draft 2 is named in two windows' reports; no text of it is held (see report-names-unmatched.json))* |
| Shower work drafts 1 to 12 | found | cMIP shower work, draft 1: `6dc7f7683c088cf1…`, act `6f83ad57…`, 2 Terms; cMIP shower work, draft 2: `28640b5805b9966c…`, act `d7948509…`, 0 Terms; cMIP shower work, draft 3: `8e11dda68a1a2533…`, act `420e94e9…`, 0 Terms; cMIP shower work, draft 4: `04ca583839aaad13…`, act `5412396a…`, 0 Terms; cMIP shower work, draft 5: `04c3185f636b2e40…`, act `36709414…`, 55 Terms; cMIP shower work, draft 6: `3fcec24427b02fd3…`, act `cb26fcb9…`, 0 Terms; cMIP shower work, draft 7: `49aba57b1bb77c59…`, act `16e8ce43…`, 0 Terms; cMIP shower work, draft 8: `eea5e5644b2fd2b0…`, act `8acd058f…`, 0 Terms; cMIP shower work, draft 9: `87c6b7b0e2744a0a…`, act `b3b0b43d…`, 0 Terms; cMIP shower work, draft 10: `589f817964a5c6e8…`, act `b2a64e3c…`, 1 Terms; cMIP shower work, draft 11: `121aad7a40758e1b…`, act `89a110c1…`, 0 Terms; cMIP shower work, draft 12: `bf4e89e47839b260…`, act `fc6eb5b6…`, 66 Terms *(drafts held: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12; missing: none)* |
| Plain Words' shares nobody may rewrite | found | cMIP shares nobody may rewrite, draft 1: `0781512a6fabec02…`, act `00670bc6…`, 0 Terms; cMIP shares nobody may rewrite, draft 2: `fcacc85b10e27a83…`, act `768fe5af…`, 0 Terms; cMIP shares nobody may rewrite, draft 3: `bcf1c19b56c05e14…`, act `ebbf4fed…`, 0 Terms; cMIP shares nobody may rewrite, draft 4: `aab3e6a1beb110e5…`, act `bc4d5304…`, 0 Terms; cMIP shares nobody may rewrite, draft 5: `ba79b0aa125ee392…`, act `be1ff7b1…`, 0 Terms; cMIP shares nobody may rewrite, draft 6: `062520c4c27765a3…`, act `ad9b5abb…`, 0 Terms; cMIP shares nobody may rewrite, draft 7: `c3f6b350887d09ce…`, act `e963680b…`, 5 Terms |
| Plain Words' room let | found | A room let, in plain words: rent, deposit, and the: `d8974b8ec2744e59…`, act `526f4947…`, 0 Terms; A room let, in plain words: rent, deposit, and the: `e585b7d3aba14b7a…`, act `943e2ad4…`, 0 Terms; A room let, in plain words: rent, deposit, and the: `52f04b96f8d0f4f8…`, act `9f1911e7…`, 0 Terms *(a template of Terms words, not a cMIP: listed as a Module-like text)* |
| Plain Words' in force by the condition | found | cMIP in force by the condition, draft 1: `45e135cf1df3d72f…`, act `502ba52f…`, 0 Terms; cMIP in force by the condition, draft 2: `3a2f40f4a4f57819…`, act `5f5443a6…`, 1 Terms |
| Until's escrow drafts | found | cMIP escrow, draft 1: `cf337a8eda4789d5…`, act `9ae61048…`, 0 Terms; cMIP escrow, draft 2: `559c7ffb7725931a…`, act `a2d41910…`, 0 Terms; cMIP escrow, draft 3: `caf807556198c4fc…`, act `caf80755…`, 1 Terms; cMIP escrow, draft 4: `ef17be4f03d6677f…`, act `ef17be4f…`, 3 Terms; cMIP escrow, draft 4: `cadbbc54a8f6abfe…`, act `ef17be4f…`, 0 Terms; cMIP escrow, draft 5: `a54b60660feaf58d…`, act `ca9d95cd…`, 0 Terms *(drafts 3 and 4 are named in sockets by the act id of their text, not by spec hash; draft 4 is also listed under its spec hash, which other texts cite)* |
| Until's arbiter drafts | **not found** | — *(no text act by Until titled as an arbiter cMIP. 23 of Until's texts mention an arbiter; escrow drafts 1, 2, 3, 4, 5 speak of one inside them)* |
| DubLaw's arbiter's award, drafts 1 and 2 | found | cMIP an arbiter's award, draft 1: `ebcc09e34317484c…`, act `5102247f…`, 0 Terms; cMIP an arbiter's award, draft 2: `7d42b01cd8cb230a…`, act `c96e1cea…`, 0 Terms |
| The clusters' consent to be recorded | found | cMIP consent to be recorded, draft 1: `d835fe750bd4f68e…`, act `ada9f31e…`, 1 Terms |
| Kept Word: delivery receipt | found | cMIP delivery receipt, draft 1: `ec1f118d998f150c…`, act `fa31564e…`, 0 Terms; cMIP delivery receipt, draft 2: `9e19e62c480143c2…`, act `87d4b559…`, 0 Terms |
| Kept Word: the makers' guild (its charter) | found | text `713ad026…` "Kept Word, a guild of makers who deliver. Charter, version 1…", words of Terms `825b834d…` *(Terms words (a charter), not a cMIP)* |
| The consignment Terms | found | text `6870f9ea…` "Léa Faure, merci. J'écris les Conditions de dépôt cet après-…"; text `50063897…` "Léa Faure, voici les Conditions de dépôt, NON signées, comme…"; text `c1e403d4…` "Léa Marchand, last window: what I owe, and what stays open, …" *(found by: Terms signed by Léa Marchand (0a3025ae…) naming Léa Faure (ba7b26a0…) as a signer party, and her texts mentioning dépôt or consignment. The clusters' report says the Terms were written and deliberately left unsigned: 0 such Terms decoded)* |
| Odile Ferrant's Commission 1 | found | text `053c88fb…` "Commission 1, version 1, in plain words. Payer and only part…", words of Terms `bfac25d4…`; text `c9ad32e5…` "Commission 1, version 1, in plain words. Payer and only part…", words of Terms `51c0ec8b…`; Terms `bfac25d4…`, body `61bcdb5b…`; Terms `5a58f2c7…`, body `61bcdb5b…`; Terms `66072149…`, body `61bcdb5b…`; Terms `51c0ec8b…`, body `61bcdb5b…`; Terms `fd4e44f1…`, body `61bcdb5b…`; Terms `ecc3dd70…`, body `61bcdb5b…` *(Terms words and Terms, not a cMIP; their sockets name the cMIPs listed in the tables)* |
| Commission 1's reading rules | found | text `053c88fb…` "the READERS paragraph of Commission 1, version 1, in plain w…"; text `c9ad32e5…` "the READERS paragraph of Commission 1, version 1, in plain w…" *(no separate text: the rules for readers are a paragraph (READERS) inside Commission 1's words, in 2 of its 2 word texts (inferred: read, not counted). By keyword, Odile Ferrant's texts also hold "Word in advance" 1 and 2 (2ea9aa1d, 1820e96c): Terms words on what to believe if her identity is taken, not reading rules)* |
| Proven claim | found | cMIP Proven claim, draft 1: `ed9a4b4e99ec48af…`, act `d6647391…`, 0 Terms; cMIP Proven claim, draft 2: `51f9afc8224a4d79…`, act `de67b513…`, 0 Terms |
| The forks and resolves of the rerun's entries | found | 7 entries' Terms each hold two versions replacing the same version and one resolve: `db3ce515…` (resolve `06b0f886…`, tips `5b9e8c91…` `bba99964…`); `fd3b7ae4…` (resolve `438ba058…`, tips `41beaf8f…` `a2e92de5…`); `10864013…` (resolve `28ef323c…`, tips `1f9d26ad…` `4c797c6a…`); `48184556…` (resolve `1c13a455…`, tips `9a23b5c3…` `a8530333…`); `b6b9fa19…` (resolve `ac00cf88…`, tips `190e1686…` `7349d438…`); `ca22d788…` (resolve `e998e57f…`, tips `1d63199d…` `f9c9ea5b…`); `fddb0fd1…` (resolve `8352d190…`, tips `4faaf2af…` `8fef8392…`). 20 resolve Statements decoded in all. |

**Everything else found** is in the tables of sections 2 and 3: every entry not named above.

## 5. Not held

Fingerprints named in a socket, or as the spec of acts, whose text is not held in `_research`, with the acts that name them. *Counted.*

- `53b1b4bec1782cebf8c90d89c3a9b6008e13767e2a996dd6ce94c8bf7c96da77`: spec of 1705 acts; use 0 / 0 / 5 / 2. Acts under it signed by 5 identities (`e6cb0683…` `fbde4ca7…` `f1de20f8…` `b3d7eee6…` `109e9dc4…`).
- `bc39bda624dc778aaccfbd9f038d456a2fdb7e4cb84fed57e24895206492b7c0`: spec of 137 acts; use 0 / 0 / 1 / 0. Acts under it signed by 1 identity (`b3d7eee6…`).
- `e8891459b8b33b05b93beb800022d7ced6e2ca0d3a7a87149a5c922bc8190efc`: spec of 108 acts; use 0 / 0 / 1 / 0. Acts under it signed by 1 identity (`b3d7eee6…`).
- `2d7062e908c51d78553726b3b3628e81615eb883b66c3003b607c7f71c2979e8`: K1×1; use 1 / 1 / 1 / 1. Named by 1 act: `293444c6…`.

*What the reports and texts say of them (traced, not counted):* `2d7062e9…` is the SHA-256 of one Terms act's own words, named again as its body cMIP: no cMIP text stands behind it. `53b1b4be…` (the stand-in lodging spec of Postmark's place), `e8891459…` and `bc39bda6…` (the place's record acts) are specs of acts, with no text held in `_research`.

**Names used in reports and matched to no held text**, in two windows or more (counted by `4-listing.mjs`): "anchoring cmip, draft 8" (5), "split cmip, draft 5" (4), "anchoring, draft 8" (3), "split cmip, draft 4" (2), "escrow cmip, draft 1" (2), "quorum, draft 4" (2), "longhouse's anchoring, draft 8" (2), "until's escrow cmip, draft 1" (2), "public flow, draft 2" (2), "buyer by assent, draft 2" (2), "split cmip, draft 2" (2), "longhouse's anchoring cmip, draft 8" (2). Anchoring draft 8 is a genesis-repository text, not in `_research`; no text of buyer by assent draft 2 or public flow draft 2 is held.

## 6. For the MOR lead

Evidence that touches the lead's questions; listed, not judged.

- *Whether named signers and buyer by assent should be the grammar's default:* text `d8a19d7d…` (93 Terms, 286 assents); text `735c3cf8…` (79 Terms, 241 assents). They are the two most named cMIPs of category 1 and the kit holds neither.
- *How assents to replaced versions, resolved forks and in force at a deadline were counted:* resolves in the rerun's entries `06b0f886…` `438ba058…` `28ef323c…` `1c13a455…` `ac00cf88…` `e998e57f…` `8352d190…`; the fork tips `5b9e8c91…` `bba99964…` `a2e92de5…` `41beaf8f…` `1f9d26ad…` `4c797c6a…` `9a23b5c3…` `a8530333…` `7349d438…` `190e1686…` `f9c9ea5b…` `1d63199d…` `4faaf2af…` `8fef8392…`; 163 assents name a Terms version that a later Terms act replaces (ids in `listing-agreements.json`, `forLead`).
- *Postmark's place's role in ordering acts:* the place's specs `53b1b4be…` (1705 acts), `bc39bda6…` (137 acts), `e8891459…` (108 acts); the hosts' counts order entries by its records. This listing orders acts by the postman's log instead (section 7).
- The thief's valid rotation and "exactly these acts": nothing in this listing touches them.

## 7. Limits

- **Feed order** is the first time the postman carried an act's exact bytes (`postman/log/carried.jsonl`, matched by SHA-256); 8367 of 17168 acts have one. The rest (genesis acts sent otherwise, the place's records, acts held only by windows) follow, by source and position. Arrival at a relay is no signed proof of time.
- **Texts are matched** by four fingerprints (spec hash with the act's signer as creator, kinds 0 to 3; the act id; SHA-256; MOR's work hash) and, for files, spec hash with every identity that signed a text or Agreements act as creator. A text published by one identity under another's creator name, or with other bytes, is missed.
- **Windows of identities** come from the trays that carried each identity's acts and the windows' reports; an identity that only one window named but another window's tray carried is given the tray. Public windows played many people: their reports do not name every identity.
- **"Built on" by prefix** counts 8-character prefixes in cMIP texts: a prefix shared by two hashes could miscount (none was seen, not checked exhaustively). Report names are matched by title stem and draft; short stems ("split", "signed credits") shared by several authors are matched only with the author's window name, and may still mix.
- **Categories are a reading**, by a keyword table on titles: a text whose main task is money went to DubPay even where it also settles a dispute (escrow, home bond). The next wave should read them, not take them.
- **Kit**: "kit holds it" is read from the kit's code (stub fingerprints, control cMIP); "by hand" from the counts' own lists; a cMIP applied by a player by hand outside the hosts' counts is not seen.
- **Machines:** the players were Claude windows. The shared shape of the titles ("cMIP NAME, draft N (task Kn …)"), the reach for named signers and buyer by assent, and the "free to use, copy and replace" lines may come from what they were told (the prompts, the notices, the kit's guides), not from need.
- **Sealed**: 382 sealed containers were not opened; 457 private acts held without their key were not read. A cMIP used only inside them is not seen.
