# The shared inventory of round two's specification texts

*DubWeb wave 3, inventory version 2 (session F, 26 November 2026), beside version 1 (session A, 22 November, in ../inventory/, unchanged). Nobody, allegedly. For DubPay, DubLaw and DubWeb. Version 2 applies DubLaw's and DubPay's slice checks; every record that moved is in changes.md. Files: inventory-all.json, add-by-hand.json, money.md, agreements.md, web.md, changes.md, inventory.mjs (the copy run), wave3.mjs, changes.mjs.*

## 1. In plain words

1. **121 texts in one list**: the 98 that inventory.mjs finds by code, and 23 added by hand, each marked with why the script missed it. The kit's core agrees with every one of the script's 98 spec hashes (98 of 98).
2. **Each text has one proposed area**: Money 39, Agreements 50, Web 32. Where the three Dubs' wave-2 placements agree, the area is theirs; 8 texts (5 works) are **to settle**: the Dubs disagree, or no Dub placed them.
3. **Four texts are used but not held.** The report block (proposal 4) and Postmark's place drafts 1 and 4 are used under their hashes by 1892 acts, but no text of theirs is in the copy; draft 3's text is in the copy and its acts use a stand-in hash. Postmark's three stand-ins are SHA-256 of a fixed string, checked here, so e8891459…0efc is draft 1 by computation, not only inferred. Longhouse's anchoring cMIP draft 8 is applied in every Longhouse anchor from the third on, but its text is not in the copy at all.
4. **Two texts are Terms, not text acts**: Beatrice's ring of names (version 2) and Odile Ferrant's word in advance. Their Terms name the MOR work hash of a text act, and no spec hash, so a reader by spec hash never finds them. **Found, not added:** 3 more texts that DubPay or DubLaw listed in wave 2 have no record here, most because acts name them by act id, not by spec hash (section 4).
5. **A use count is not a check.** Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works. The hosts' prompts asked for three texts by name (notice 8: shower work draft 5, public flow draft 3, straight split draft 4); notice 7 asked for apps, not texts; the day-five brief asked for something new and named no text, and 18 texts here answer it.

## 2. Totals per area and category

| Area | Category | Texts | of which to settle | added by hand |
|---|---|---|---|---|
| Money | 1. Splits and payout services | 18 | 0 | 1 |
| Money | 2. Pools and mutual credit | 10 | 0 | 0 |
| Money | 3. Money held (escrow, deposits, refunds, held for you) | 8 | 0 | 0 |
| Money | 4. Asking to be paid (invoices, payment requests, answerers that invoice) | 3 | 0 | 2 |
| **Money** | **all** | **39** | 0 | 3 |
| Agreements | 1. When Terms are in force, and who signs | 10 | 0 | 2 |
| Agreements | 2. Ownership and collectives | 25 | 0 | 2 |
| Agreements | 3. Disputes | 4 | 0 | 0 |
| Agreements | 4. Consent and terms for people | 10 | 0 | 4 |
| Agreements | 5. Leaving and carrying on | 1 | 0 | 0 |
| **Agreements** | **all** | **50** | 0 | 8 |
| Web | finding and reading | 1 | 0 | 0 |
| Web | homes and the way out | 3 | 2 | 3 |
| Web | identity safety | 11 | 5 | 5 |
| Web | open books | 11 | 0 | 0 |
| Web | record and time | 6 | 1 | 4 |
| **Web** | **all** | **32** | 8 | 12 |
| **all** | | **121** | 8 | 23 |

Works (drafts of one text by one creator counted once): Money 16, Agreements 20, Web 16.

## 3. To settle

One line per work; every draft of the work is marked in the JSON. Wave 2 placements: DubWeb's inventory-web.json, DubPay's listing-money.json, DubLaw's listing-agreements.json.

| Work (drafts) | Proposed | Why | DubWeb | DubPay | DubLaw |
|---|---|---|---|---|---|
| Until's home: policy, version 1 (2) | Web: homes and the way out | a home's published policy: what it keeps, logs and promises its residents; placed in no area by any Dub in wave 2 | no area: draft-titled, not included | not listed | not listed |
| A ring of names, draft 2: the words of Beatrice's ring, in the shape o (1) | Web: identity safety | what to believe about an identity if it is taken, lost or silent; placed in no area by any Dub in wave 2 | not listed | not listed | not listed |
| Keep recovery, draft 1: MOR for people who will never hold a key (3) | Web: identity safety | getting an identity back to the right person: identity safety; placed in no area by any Dub in wave 2 | no area: draft-titled, not included | not listed | not listed |
| Word in advance 1, of Odile Ferrant: what to believe about this identi (1) | Web: identity safety | what to believe about an identity if it is taken, lost or silent; placed in no area by any Dub in wave 2 | not listed | not listed | not listed |
| Anchoring cMIP, draft 8 (Longhouse runs it) (1) | Web: record and time | proof that acts existed by a block: time to the world; placed in no area by any Dub in wave 2 | not listed | not listed | not listed |

## 4. Added by hand

Each is in inventory-all.json with `added_by_hand` and in add-by-hand.json with what was read. Use is counted three ways and kept apart. Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Text | Creator | Act / Terms | Spec hash (stand-in) | In the copy | Why missed | by hash | by act | by name |
|---|---|---|---|---|---|---|---|---|
| Keep recovery, draft 1: MOR for people who will never hold a key | a83df2c7 (keep) | `f2b809a2…8ea9` | `eb14ebea…80be` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 10 | 2 |
| Keep recovery, draft 2: the right person, decided by people who know them | a83df2c7 (keep) | `16432468…c7f4` | `db038103…0aba` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 2 | 2 |
| Keep recovery, draft 2: the right person, decided by people who know them | a83df2c7 (keep) | `2c6a10b9…4dcf` | `36112182…36cc` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 8 | 2 |
| Postmark's place: records and answers, draft 3 | e6cb0683 (postmark) | `e15cb368…73ed` | `0d8af220…7b89` (`bc39bda6…b7c0`) | yes | draft-titled, never named, no "# cMIP" heading | 137 | 3 | 422 |
| Handover check, draft 1 | b820fe4b (longhouse) | `3f9351b0…0b05` | `5f7cfa2b…8fd3` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 14 | 19 |
| Until's home: policy, version 1 | 3022fb29 (until) | `6f779dbe…93a9` | `e4c700d8…5976` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 2 | 2 |
| Until's home: policy, version 2 | 3022fb29 (until) | `d6ab83fb…480e` | `0f041c37…5bda` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 9 | 2 |
| A room let, in plain words: rent, deposit, and the state of the room. Template,  | 76a78f70 (plain-words) | `526f4947…4491` | `d8974b8e…21dc` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 10 | 15 |
| A room let, in plain words: rent, deposit, and the state of the room. Template,  | 76a78f70 (plain-words) | `943e2ad4…e40d` | `e585b7d3…52ce` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 7 | 15 |
| A room let, in plain words: rent, deposit, and the state of the room. Template,  | 76a78f70 (plain-words) | `9f1911e7…55c6` | `52f04b96…a6b0` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 3 | 15 |
| Invoice request form, draft 1 (piece A of Commission 1, Terms bfac25d40629ca54b1 | 6d354b6f (followers) | `72bbce87…afba` | `b13f771c…a74f` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 12 | 11 |
| Invoice request form, draft 2 (piece A of Commission 1, Terms bfac25d40629ca54b1 | 6d354b6f (followers) | `beb3fdad…a80d` | `76c65a26…35ec` | yes | draft-titled, never named, no "# cMIP" heading | 0 | 4 | 11 |
| A ring of names, draft 2: the words of Beatrice's ring, in the shape of Odile Fe | 611acc3e (public-50-plus) | Terms `9b660a34…20ea`, words `c412a37d…6ea7` | `3e809f2a…6f30` | yes | its words are Terms (Agreements draft 25, type 0), not a text act under a spec | 0 | 20 | 10 |
| Word in advance 1, of Odile Ferrant: what to believe about this identity if it i | d79c1ba7 (lurker) | Terms `66072149…f245`, words `2ea9aa1d…675e` | `64415bc6…5178` | yes | its words are Terms (Agreements draft 25, type 0), not a text act under a spec | 0 | 43 | 42 |
| Anchoring cMIP, draft 8 (Longhouse runs it) | — (not in the copy) | — | `—` | **no** | its text is not a public text act in the copy | 0 | — | 81 |
| The report block, proposal 4 | — (not in the copy) | — | `7b65c60f…7854` | **no** | named as a spec (81 acts are signed under it) but its text is not a text act in the copy | 81 | — | 73 |
| Postmark's place, specification draft 4 (place 0.4.0; stand-in hash) | e6cb0683 (postmark) | — | `53b1b4be…da77` | **no** | named as a spec (1,699 acts under it) but no text in the copy | 1703 | — | 423 |
| Postmark's place, records spec draft 1 (stand-in hash) | e6cb0683 (postmark) | — | `e8891459…0efc` | **no** | named as a spec (108 records under it) but no text in the copy | 108 | — | 423 |
| Stall cMIP: in force on the sellers' assents (task K2, in_force), draft 1. Terms | ddafffcd (stall) | `de8d5d29…7f1b` | `a188d311…bba6` | yes | named by act id only | 0 | 22 | 0 |
| Stall cMIP: the buyer's spot (task K5, a role of kind done), draft 1. A role nam | ddafffcd (stall) | `0b9eee89…9a65` | `6d68a808…4bd9` | yes | named by act id only | 0 | 23 | 1 |
| Stall cMIP: the seller may change the offer, or leave its service alone (task K4 | ddafffcd (stall) | `6dd4fff6…3d15` | `687572c7…a0d3` | yes | named by act id only | 0 | 12 | 0 |
| Stall cMIP: the seller may change an offer for future buyers (task K4, condition | ddafffcd (stall) | `3f2a69de…c2eb` | `1d13e1e9…b808` | yes | named by act id only | 0 | 3 | 1 |
| Counterparty plain-words body, version 1. The words of Terms that name this cMIP | f1de20f8 (counterparty) | `ee0fd121…e681` | `80658862…e51b` | yes | named by act id only | 0 | 23 | 18 |

What was read, for each:

- **Keep recovery, draft 1: MOR for people who will never hold a key**: its text act, as the run listed it.
- **Keep recovery, draft 2: the right person, decided by people who know them**: Draft 2, first publication. A second act with the same title (2c6a10b9) says it replaces this one, which overstated how many texts used one-line fields; the bytes differ, so the spec hash differs.
- **Keep recovery, draft 2: the right person, decided by people who know them**: Draft 2, published a second time: its first line says it replaces act 16432468…c7f4 (same title, changed words).
- **Postmark's place: records and answers, draft 3**: The text says its acts are typed under a stand-in hash, not under its spec hash: the 137 place records under bc39bda6 are its use. checked: SHA-256 of "POSTMARK PLACE, draft 3, test value until uploaded" = bc39bda6…b7c0, the string the text itself gives as its stand-in (and Postmark's day-1-window-3 report: "Specification draft 3 under a new stand-in hash (bc39bda6…b7c0)").
- **Handover check, draft 1**: its text act, as the run listed it.
- **Until's home: policy, version 1**: its text act, as the run listed it.
- **Until's home: policy, version 2**: its text act, as the run listed it.
- **A room let, in plain words: rent, deposit, and the state of the room. Template, **: its text act, as the run listed it.
- **A room let, in plain words: rent, deposit, and the state of the room. Template, **: its text act, as the run listed it.
- **A room let, in plain words: rent, deposit, and the state of the room. Template, **: its text act, as the run listed it.
- **Invoice request form, draft 1 (piece A of Commission 1, Terms bfac25d40629ca54b1**: its text act, as the run listed it.
- **Invoice request form, draft 2 (piece A of Commission 1, Terms bfac25d40629ca54b1**: its text act, as the run listed it.
- **A ring of names, draft 2: the words of Beatrice's ring, in the shape of Odile Fe**: Terms 9b660a34…20ea, signed by Beatrice (611acc3e…4c9b): body.words = cc29e10f…, which is the MOR work hash (tagged "MOR/work") of the text act c412a37d…6ea7 ("A ring of names, draft 2"), computed here; body.cmip = 61bcdb5b…4528 (the plain-words reading); previous (key 5) = c412a37d…; it replaces draft 1 (Terms 789552185d61…, words in act 34d68932…), which is not added here.
- **Word in advance 1, of Odile Ferrant: what to believe about this identity if it i**: Terms 66072149…f245, signed by Odile Ferrant (d79c1ba7…70ff), parties Odile and three witnesses: body.words = f2c8b30d…, which is the MOR work hash of the text act 2ea9aa1d…675e ("Word in advance 1, of Odile Ferrant"), computed here; body.cmip = 61bcdb5b…4528 (the plain-words reading).
- **Anchoring cMIP, draft 8 (Longhouse runs it)**: Searched every public text act signed by b820fe4b: anchors 1 to 12, their leaves and blinds, offers, answers, the Handover check; none is the anchoring cMIP. _research/cmips-indispensable.md lists "Anchoring, draft 8 | genesis repository; Longhouse runs it". Not in the copy: no spec hash, no text. Its use is counted by name only.
- **The report block, proposal 4**: Identified from the hosts' 01-where-to-read.md (every window's from-the-hosts/): "The report block, proposal 4 (a proposal, not yet a rule): docs/lead/proposals/report-block-4.md … spec hash 7b65c60f…7854. Proposals 2 and 3 are replaced." Text not in the copy.
- **Postmark's place, specification draft 4 (place 0.4.0; stand-in hash)**: Postmark's day-2-window-1 report: "Specification draft 4 (stand-in 53b1b4be…da77)"; day-5-window-3: drafts 4 and 5 "Not yet published under a creator, so still stand-ins"; the followers' day-5-window-3-final report: "Postmark's place, draft 4 | 53b1b4be…". Draft 5 (3c58eeaa…, handover and takeover) is named in the same report; no act in the copy is signed under it. checked: SHA-256 of "POSTMARK PLACE, draft 4, test value until uploaded" = 53b1b4be…da77.
- **Postmark's place, records spec draft 1 (stand-in hash)**: Draft 3's text says "The payloads are as in drafts 1 and 2"; the stand-in of draft 2 (SHA-256 of the same string with "draft 2") is named by no act in the copy. checked, no longer only inferred: SHA-256 of "POSTMARK PLACE, draft 1, test value until uploaded" = e8891459…0efc, the same pattern as drafts 3, 4 and 5; all 108 acts under it are records of the place identity b3d7eee6…0919 in postmark-place's record. No report in the copy names e8891459..
- **Stall cMIP: in force on the sellers' assents (task K2, in_force), draft 1. Terms**: its text act, as the run listed it.
- **Stall cMIP: the buyer's spot (task K5, a role of kind done), draft 1. A role nam**: its text act, as the run listed it.
- **Stall cMIP: the seller may change the offer, or leave its service alone (task K4**: its text act, as the run listed it.
- **Stall cMIP: the seller may change an offer for future buyers (task K4, condition**: its text act, as the run listed it.
- **Counterparty plain-words body, version 1. The words of Terms that name this cMIP**: DubLaw lists this text twice, "in two copies (61bcdb5b… and ee0fd121…)". The copy holds one text act, ee0fd121…e681; 61bcdb5b…4528 is no act in the copy: it is the fingerprint DubLaw's listing gives as "sha256 of its opening sentences", which Terms name in their body socket. So one record here carries both keys: DubLaw's six entries are five texts.

### Found missing, not added

Texts that a Dub's wave-2 listing holds and the script does not, found by this session's cross-check. Not added: the order named what to add. DubWeb decides whether a rerun adds them.

| Text | Listed by | Text act | Why the script has no record (by code) |
|---|---|---|---|
| DubPay's shape for a deal's parameters (section 6) | DubPay (1. Splits and payout services) | `393f664c…829e` | a text act whose spec hash (fd2419d9…51fa) no act names (0), while 15 acts name its act id; its first line does not begin "# cMIP" or "# Module" |
| Stall cMIP: pass-on by the receiver (task K6, control), draft 1. In Terms that n | DubLaw `12927103` (act id of its text (not a spec hash)) (other: DubPay), sockets {"K6 control":6} | `12927103…ae00` | a text act whose spec hash (eab368d4…1245) no act names (0), while 9 acts name its act id; its first line does not begin "# cMIP" or "# Module" |
| cMIP: Hop's tab, draft 2 (clearing a group's debts; Hop keeps the account, never | DubLaw `6924a08f` (spec hash) (other: DubPay), sockets {"K1 body":1} | `da0d4fa0…44a4` | not a public act in any home's feed in the copy (the script reads windows' acts/ only to infer windows) |

## 5. Method and caveats

- **The run.** inventory.mjs (DubWeb wave 2, copied unchanged) was run once over all of _research/ with DubPay's wave-2 kit beside it as kit/: 16499 distinct public acts from 29999 items (423 sealed items and 215 private acts not opened); 98 specifications; self-checks 4 of 4 passed. The kit cross-check: 98 of 98 spec hashes agree, 0 refused. Its output is kept as inventory-run.json; inventory-all.json is that output with fields added, never changed (the script's own `category` field is DubWeb's wave-2 category; the proposed one is `area_category`).
- **The additions.** wave3.mjs reads the same copy through read-copy.mjs (lines 21 to 208 of inventory.mjs, unchanged) and counts, for each added text: use by spec hash (the script's own rule), by act id (whole, short form, or the first 8 characters in words), and by name in words (a pattern per work, given in add-by-hand.json). The three are kept apart and overlap. By name counts per work, not per draft, and a pattern can catch a mention that is not a use. By act is counted for the script's texts too; by name only for the added ones.
- **Areas.** placements.mjs reads the three wave-2 files and finds each text by spec hash, act id or words act. Where every Dub that placed a text put it in one area, that area stands and the owning Dub's category with it (or this session's, marked, where the owner did not place it). DubPay's "beside" list counts as "not Money". Otherwise this session proposes one area with a one-line reason and marks it to settle. Nothing is decided.
- **Prompted.** Notice 7 (apps in your tray) asks teams to build and offer apps, and names Dubsar's Dub and Damgar: apps, not texts, so no text here is prompted by it. Notice 8 (attack the shower) names shower work draft 5, public flow draft 3 and straight split draft 4: marked "yes"; their other drafts "work". The day-five prompt: no day-5-window-1 report quotes it whole. They describe it: "build something MOR has not been used for" (The Back Row; Ampersand, Backlot, DubLaw, DubWeb, Pointer, Plain Words and Until in nearly the same words), "what else can MOR say" (Keep), "History that outlives its keeper" (Postmark's own brief), work that "helps others more than it earns" (Stall), and the succession drill for the home companies (Turnstile, Stall, Longhouse, Until). It named no text, so "prompted: yes" for day five means the creator's own day-5-window-1 report presents the text as its build for the brief: read by hand, listed in wave3.mjs (D5). brief-day-five.md itself was not used as the source, as the order asked.
- **Not here, though a Dub listed it in wave 2**: 20 entries (DubPay 17, DubLaw 3): 3 entries are 3 texts the script missed (section 4); the rest are apps, programs, Terms whose words are text acts, or not held. All are in inventory-all.json under wave_3.in_a_dubs_wave_2_listing_not_a_text_here. None was added.
  DubPay deal-parameters (text); DubPay damgar (media); DubPay pot-reader (media); DubPay pot-settlement (script); DubPay spare-wheel (terms); DubPay rounds-tab (terms); DubPay cercle-de-garde (terms); DubPay cercle-count (media); DubPay krog-varstva (terms); DubPay mending-circle (terms); DubPay mending-count (script); DubPay held-reader (media); DubPay kept-word (terms); DubPay answerer (script); DubPay commission-1 (terms); DubPay register (media); DubPay shelf-app (media); DubLaw `12927103` Stall cMIP: pass-on by the receiver (tas; DubLaw `2d7062e9` (not held); DubLaw `6924a08f` cMIP: Hop's tab, draft 2 (clearing a gro.
- **Limits.** Counts come from code; areas, categories, the day-five list and the reasons are readings. The window of a creator is inferred by the script. Draft 1 of Beatrice's ring and Postmark's drafts 2 and 5 are named but not added. Rerun: `node inventory.mjs --research ~/Documents/mor-round-2/_research --out inventory-run.json`, then `MOR_RESEARCH=~/Documents/mor-round-2/_research node wave3.mjs`.
