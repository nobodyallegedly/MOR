# The catalogue of Agreements, by problem

*DubLaw, wave 3, session F. Author: Nobody, allegedly. 26 November 2026. For DubLaw and the Dubsar Suite lead.*

The stint's wish (Nobody, allegedly, 20 November 2026): "Current wish: extract data, knowledge and understanding from the simulation run"

This catalogue is read-only over `_research` and `_team`. Every number comes from `catalogue.mjs`, which sits beside this file, and is in `catalogue-agreements.json`. To rerun it:

`node catalogue.mjs _research _team/dubweb/wave-3/inventory/kit _team catalogue-agreements.json`

It runs in about 5 seconds and needs Node 22.5 or later. Each finding gives its ground: **counted** (by the script), **traced** (acts cited in order) or **inferred** (my reading). Every lean is mine, DubLaw F's. None is DubLaw's, and none is Nobody, allegedly's.

**Used is not checked.** The kit checked no rule above the core. It holds none of the 51 texts: the script searched its files for every fingerprint and found 0. Every use count below says a text was applied by hand, not that it works. This caveat stands beside every count in this file, and the JSON repeats it on every record.

## 1. Summary

- **22 problems: 16 with texts, 6 gaps.** The 51 texts are 50 text acts, because Counterparty's plain-words body is named by two fingerprints. They sit across the five categories: in force 4, collectives 4, disputes 3, people 4, leaving 1. *Counted; the grouping is inferred.*
- **Leans: 13 keep one, 3 merge two, 6 gaps.** **8** groupings turn on whether named signers and buyer by assent become the grammar's defaults.
- **The three leans that matter most:**
  1. **A buyer's spot (P3): merge two.** DubLaw's buyer by assent makes a buyer by assent alone. 79 Terms name it, with 241 assents. A serious finding against it (Pointer, act `7bc8fcd0…`, under notice 8) is unfixed. Stall's spot is filled only by a confirmed payment. 16 Terms name it, with 112 assents. They are one task with two rules for when a buyer counts. *Turns on the defaults.*
  2. **Shares nobody may cut (P6): merge two.** Plain Words' shares nobody may rewrite and the update condition inside DubLaw's shower work guard the same thing in K4: no cut without your own signature, a group threshold, leaving alone, dormant voices. Two windows wrote them in parallel, and different attackers found and fixed the same faults in each (act `1edde3ea…` was fixed in both).
  3. **An arbiter's award (P9): keep one, draft 2.** It is the round's only text for deciding a dispute under Terms. Six other texts build on it, yet no act ran under it and no Terms named it. Its fault F1 is unfixed: an arbiter decides for the payer by staying silent. Three gaps sit beside it: refusal (G1), silence (G2) and a dispute with no arbiter named (G4).

The hosts' prompts shaped this area. The contest's own rules (lineup vote, written by the hosts) required entries under shower work, with buyers who assent. Notice 8 asked everyone to attack the shower. The day-five briefs asked what the language could not say. Each entry below says where its pattern may come from what the players were told.

## 2. The problems, by category

How to read each entry:
- **Use** counts are by the script. Terms naming = Terms acts whose sockets (or a power's kind, or `relies_on`) name one of the text's fingerprints: its spec hash, its act id, and for Counterparty's body also `61bcdb5b…`. Assents = published assent Statements to those Terms. Identities = distinct signers of those Terms, assents, K7 Statements and acts under the text's spec.
- **Built on** = specification texts by others that name the text in full or by an 8-character prefix.
- **Kit:** "applied by hand" means the hosts' counts applied it by hand (wave 2 listing). "kit lacks it" means unchecked.
- One unpublished assent (`82452b2e…`, held only as a file in `windows/followers/build/vote/`) is left out, as in DubLaw's wave 2 listing.

### Category 1. When Terms are in force, and who signs

#### P1. Terms with an open role (a buyer nobody knows yet) come into force on the named parties' assents alone.

*Turns on the defaults.*

| Solution | Author (window) | Spec hash / fingerprint, drafts | Socket | Terms / assents / identities | Windows | Built on by | Kit |
|---|---|---|---|---|---|---|---|
| named signers | `218a2a93…` (dublaw) | `ed7e3956…08be` (act `d8a19d7d…`), 1 draft | K2 in force (93); its act id also named in `relies_on` (26) | 93 / 286 / 89 | 17 | 8 specification texts by 5 windows (backlot, clusters, dubpay, hop, steward-and-co): consent to be recorded, rotating pot, signed credits, lending shelf 1 and 2, Hop's tab, common pot 1 and 2 | applied by hand |
| Stall's in force on the sellers' assents | `ddafffcd…` (stall) | its act id `de8d5d29…`, 1 draft, no spec hash | K2 in force (16) | 16 / 112 / 37 | 12 | none | applied by hand |

All counts: used is not checked.

- **Faults:**
  - Act `0785547b…` (dublaw, on its own rule): under named signers, one silent signer blocks every later version, even where the update condition says valid. Not fixed in this text; another text, P2, answers it.
  - Act `7e1aa448…` (pointer): a client read the kit's "unchecked" as "no". That is the client's fault, not the text's, and it was fixed in the client. *Traced.*
- **Agree:** both put a Terms act in force once every party named as a signer has assented, and neither counts a role.
- **Differ:** only in form. Stall names its text by act id, not by spec hash, and its line "a buyer's assent never decides whether an offer is in force" is said once in its rule, where named signers says it in its plain words. A person using either gets the same answer. *Inferred.*
- **Lean (mine): keep one, named signers.** Point Stall's text to it.
  - *If they become defaults:* G4.1 read with roles left out becomes the grammar's own, and both texts are no longer needed for first versions.
  - *If they stay cMIPs:* keep named signers. One fingerprint for one rule lets a reader see that 109 Terms use the same rule, not two.
- **Prompted:** the contest rules (lineup vote drafts 2 to 4) asked voters to be buyers of entries "in force". Of the 93 Terms naming named signers, 79 also name buyer by assent, and 79 also name shower work (counted, `namedTogetherInOneTerms`). So most of the use comes from what the contest asked for.

#### P2. A new version of Terms comes into force by the group's own update rule, although one signer is silent.

*Turns on the defaults (see the last bullet).*

| Solution | Author (window) | Spec hash, drafts | Socket | Terms / assents / identities | Built on by | Kit |
|---|---|---|---|---|---|---|
| in force by the condition | `76a78f70…` (plain-words) | draft 1 `45e135cf…930e` (act `502ba52f…`), draft 2 `3a2f40f4…3a8d` (act `5f5443a6…`) | K2 in force | draft 1: 0 / 0 / 0; draft 2: 1 / 9 / 9 (backlot) | none by others | kit lacks it |

All counts: used is not checked.

- **Faults:** Counterparty's Y-1 (act `8949732f…`): an old quorum could fork the current Terms. Fixed in draft 2. Plain Words asked for a second attack, and none is on record. *Traced.*
- **Pointer:** shares nobody may rewrite (P6) and shower work (P5) are the conditions it is meant to follow. Its stated cost: "the condition is now the whole guard".
- **Lean (mine): keep one, draft 2.**
  - *If named signers becomes a default:* this text is still needed, since named signers' default holds for replacing versions too (act `0785547b…`).
  - *If it stays a cMIP:* keep draft 2 beside named signers, as Plain Words and DubLaw jointly said (act `9ba9a3d9…`).
  - Counterparty asked that "valid means in force" become the core's default for Terms naming a condition (act `aa552d9c…`). That is a question for the MOR lead, listed in section 5, not answered here.

#### P3. A stranger becomes a buyer of an offer, and what that buyer has earned.

*Turns on the defaults.*

| Solution | Author (window) | Fingerprint, drafts | Socket | Terms / assents / identities | Windows | Built on by | Kit |
|---|---|---|---|---|---|---|---|
| buyer by assent | `218a2a93…` (dublaw) | `d47b4322…70ec` (act `735c3cf8…`), 1 draft | K5 spot (79); act id in `relies_on` (40) | 79 / 241 / 71 | 17 | lending shelf 1 and 2 (steward-and-co) | applied by hand |
| Stall's buyer's spot | `ddafffcd…` (stall) | act id `0b9eee89…`, 1 draft | K5 spot (16) | 16 / 112 / 37 | 12 | none | applied by hand |

All counts: used is not checked.

- **Faults:**
  - Pointer, act `7bc8fcd0…`, judged serious, under notice 8: a filling checks no payment, so under the contest's rules a lineup needs only assents.
  - Pointer, act `6947f703…`: the same hole, shown open on entries' version 2 Terms.
  - Unfixed: there is no draft 2. The text states "it does not check that the buyer paid" as a cost. *Traced.*
- **Agree:**
  - Both fill a role once per signer under the version named.
  - Both leave what the buyer gets to the Terms' words.
  - Both keep what was earned under an earlier version (Stall cites G10.6).
- **Differ:**
  - Buyer by assent fills the spot on the assent. A buyer who assents and never pays holds a filling and owes the price.
  - Stall's spot fills only once the receiving side has confirmed a payment of at least the price to the right receiver (G11.7), so a buyer's word alone fills nothing.
  - For a person, this decides whether "buyer" means "said yes" or "paid". The contest's vote, the lending shelf's borrower and every count of buyers turn on it. *Inferred.*
- **Lean (mine): merge two.** One K5 text whose parameter says when a buyer counts: on the assent, or on a confirmed payment.
  - *If buyer by assent becomes a default:* the grammar's default buyer is "on assent", and Stall's paid spot remains the one cMIP for "on payment".
  - *If they stay cMIPs:* the merged text replaces both, and every Terms says which rule it chose.
- **Prompted:** heavily. The contest rules (lineup vote drafts 2 to 4, by the hosts) defined a vote as an assent "as a buyer". Notice 8 invited the finding against it. The use counts follow the contest's entries: 72 Terms name both buyer by assent and shower work.

#### P4. A power held by k of a named list keeps working when one of them falls silent.

| Solution | Author (window) | Spec hashes, drafts | Socket | Terms / assents / identities | Kit |
|---|---|---|---|---|---|
| quorum with stand-ins | `76a78f70…` (plain-words) | `c20931bc…`, `cdda0561…`, `19b56b2c…`, `eb727153…4375` (acts `73c8671f…`, `5859c1fe…`, `f4053010…`, `3b406376…`): 4 drafts | K3, a power's rule | draft 4: 3 / 29 / 18 (backlot, counterparty, one window unknown); drafts 1 to 3: 0 | kit lacks it |

All counts: used is not checked.

- **Faults:**
  - Draft 2 fixed the author's own: silence is read only from evidence the decision carries.
  - Draft 3 fixed Counterparty's K3-1 (act `5d54329e…`): evidence from a home the signer has left.
  - Draft 4 adds money-decision limits. *Traced.*
- **Pointer:** the way out (P16) and shower work's stand-in (draft 8 onward) also put a named stand-in in place of a silent party, but in K4, for the party's place, not for a power.
- **Lean (mine): keep one, draft 4.** It is the only K3 rule in the slice.

### Category 2. Ownership and collectives

#### P5. A work owned by several people in shares: one payment reaches every owner and everyone along the pipe, and each sees their line.

*Turns on the defaults: entries name it with named signers and buyer by assent.*

| Solution | Author (window) | Drafts | Sockets | Terms / assents / identities | Windows | Built on by | Kit |
|---|---|---|---|---|---|---|---|
| shower work | `218a2a93…` (dublaw) | 12 drafts. Spec hashes in the JSON. Draft 5 is `04c3185f…a78c` (act `36709414…`); draft 12 is `bf4e89e4…e6b6` (act `fc6eb5b6…`) | K1 body and K4 update condition, always together | all drafts: 124 / 406 / 77. Draft 5: 55 / 201 / 64. Draft 12: 66 / 197 / 54. Draft 1: 2 / 3 / 3. Draft 10: 1 / 5 / 5. Others: 0 | 18 | public flow 6 to 8 (dubweb); straight split 6 and 7 (dubpay); released as one pipe in a joint act (`8b9357c4…`) | applied by hand (drafts 5, 12); kit lacks the rest |

All counts: used is not checked.

- **Faults, all fixed in later drafts, by the drafts' own words** (*traced*):
  - Counterparty D1 to D6, act `7738a500…`: draft 2.
  - Plain Words, `5fd08530…`: draft 5.
  - Plain Words, `1edde3ea…`, ruled serious: draft 6.
  - Longhouse, `32a7ac63…`, minor: draft 6.
  - Hop, `a69f00ea…`, serious: draft 6.
  - Counterparty Y2 to Y4, `fc5207bf…`: draft 7.
  - Hop, `9144a9c0…`: draft 7.
  - Keep K1, `e994e3d0…`: draft 8.
  - Keep K2, `181409af…`: draft 9.
  - Counterparty W1 to W11, `2ac300da…`: draft 10.
  - Counterparty N1 to N12, `c924941a…`: draft 12.
  - Not closed, by my reading of draft 12: N4 and N5 are named nowhere in it. Its vector 20's arithmetic is off (the result holds). None of the fixes has been retested by its finder. *Inferred.*
- **Lean (mine): keep one, draft 12.** Its K4 half goes to the merge in P6. Draft 10 must not be named for new Terms (draft 12, N10).
  - *If named signers and buyer by assent become defaults:* the entries' Terms name only shower work and its companions.
  - *If they stay cMIPs:* every entry keeps naming three DubLaw texts together (79 Terms do).
- **Prompted:** heavily.
  - Notice 8 named draft 5 and asked for attacks, with bounties.
  - The contest rules (draft 3 onward) required "shower work, its latest published draft".
  - Its use is the contest's use.

#### P6. A group changes its own Terms by its rule, but nobody's share is cut without their own signature.

| Solution | Author (window) | Drafts | Socket | Terms / assents / identities | Built on by | Kit |
|---|---|---|---|---|---|---|
| shares nobody may rewrite | `76a78f70…` (plain-words) | 7 drafts. Draft 7 is `c3f6b350…e1bf` (act `e963680b…`) | K4 update condition | draft 7: 5 / 37 / 26 (backlot, clusters, counterparty, one unknown); drafts 1 to 6: 0 | rotating pot (clusters) | kit lacks it |
| shower work, its update condition (pointer from P5) | `218a2a93…` (dublaw) | as P5 | K4 | counted under P5 | as P5 | as P5 |

All counts: used is not checked.

- **Faults in shares, all fixed by later drafts** (*traced*):
  - Counterparty S1 to S6 (three serious): draft 2.
  - The author's own `1edde3ea…`: draft 3.
  - Counterparty's retest T1 to T4 (`53cccd25…`) and the swapped power rule (`298d832a…`, sealed, not opened): draft 4.
  - Q1 (`3c599960…`): draft 5.
  - B2, R1 and K3-1 (`5d54329e…`): draft 6.
  - V1 and V5 (`eb56f122…`): draft 7.
  - Draft 7 says "not yet retested".
- **Agree:** both shares (draft 7) and shower work's condition (draft 12) say:
  - no holder's parts or share fall without their own-name assent (never one made under a power);
  - the group decides the rest by a threshold;
  - a member may leave alone and keep being paid;
  - a silent member may lose their voice, never their parts;
  - changing the receiver, the split, `data`, `calls` or the condition itself needs everyone.
  The same finding (`1edde3ea…`) was fixed in both.
- **Differ:**
  - Shares has a floor, cumulative admission caps and an ordering of competing updates at one place (clause G).
  - Shower work has spots as owners, fixed amounts, a stand-in for a gone owner (from Keep), and the division of each payment.
  - For a person: a group that adopts one does not get the other's protections. *Inferred.*
- **Lean (mine): merge two.** One K4 guard, with shower work keeping its body (K1) and division.
- **Prompted:** shares was not prompted. Plain Words paid Counterparty to attack it. Shower work's K4 was prompted (see P5).

#### P7. A seller changes an offer for future buyers, or drops a service, without touching what buyers already earned.

*Turns on the defaults: Stall's three offer texts work together.*

| Solution | Author (window) | Fingerprint | Socket | Terms / assents / identities | Kit |
|---|---|---|---|---|---|
| Stall's the seller may change the offer, or leave its service alone | `ddafffcd…` (stall) | act id `6dd4fff6…`, 1 draft | K4 | 6 / 21 / 8 | kit lacks it |
| Stall's the seller may change an offer for future buyers | `ddafffcd…` (stall) | act id `3f2a69de…`, 1 draft | K4 | 1 / 0 / 1 | kit lacks it |

All counts: used is not checked.

- **Faults:** none found.
- **Agree:** a new version needs every signer and no buyer, and nothing a buyer has earned changes (G10.6).
- **Differ:** the first adds rule (b): the seller alone may take a service out. *Traced (the texts).*
- **Lean (mine): keep one,** "change the offer, or leave its service alone". It contains the other.
  - *If buyer by assent becomes a default:* "of no buyer" must say which buyers it means: assenters or payers (see P3).
  - *If they stay cMIPs:* Stall's spot defines them.

#### P8. A group votes, and anyone can count the result from the signed acts.

*Turns on the defaults: a voter is a buyer by assent.*

| Solution | Author | Spec hashes, drafts | Socket | Use | Kit |
|---|---|---|---|---|---|
| lineup vote | `b1895259…` (the Dubsar Suite lead, as host) | 4 drafts. Draft 4 is `94f815ca…ec29` (act `41f1ceef…`) | none: acts under its own spec, not a socket of Terms | 47 acts under draft 4's spec by 26 identities in 10 windows; drafts 1 to 3: 0 | kit lacks it; counted by the hosts |

All counts: used is not checked.

- **Faults** (*traced*):
  - Counterparty L1 to L8 (`0be4a1da…`), with Keep, Plain Words and The Back Row: free voters. Fixed in draft 2.
  - Pointer's findings 1 to 5 (`c8d9cc3e…`): 1, 2 and 5 were closed. 3 and 4 are open (`06b11315…`): which version names the receiver, and a voter's forked line.
  - Counterparty M1 (`74e85b51…`), serious: buying from yourself is still a vote. Unfixed.
  - Steward & Co. (`71138be3…`), minor: a fee that rounds to 0. Unfixed.
- **Lean (mine): keep one, draft 4, as a contest's rule, not a collective's.**
  - *If buyer by assent becomes a default:* M1 stays open by design, since no payment is checked.
  - *If it stays a cMIP:* a vote could name Stall's paid spot instead.
- **Prompted:** entirely. The hosts wrote it for their own contest (`_research/hosts-log.md`, the contest's shape). Its use is the contest.

### Category 3. Disputes

#### P9. A third person both sides chose in advance decides a dispute under their Terms.

| Solution | Author (window) | Spec hashes, drafts | Socket | Use | Built on by | Kit |
|---|---|---|---|---|---|---|
| an arbiter's award | `218a2a93…` (dublaw) | draft 1 `ebcc09e3…c6b4` (act `5102247f…`), draft 2 `7d42b01c…9130` (act `c96e1cea…`) | none in a socket. A clause Statement named in `relies_on`; claim, answer and award are Statements of its own | 0 Terms, 0 acts under it, 0 identities | room let, escrow draft 5 (until), Proven claim 2 (followers), delivery receipt 2 (public-creators), open books 2 (dubweb), common pot 2 (dubpay): 6 texts by 6 windows | kit lacks it |

All counts: used is not checked.

- **Faults:** F1 (`catalogue/found-faults.md`): an arbiter who misses the award window decides for the payer, and silence is its only way to decline. Unfixed: draft 2 keeps the default (key 4, default 0). *Traced (the text).*
- **Gaps that draft 2 names as open:** appeal, several parties, sealed evidence, and that assent to Terms covers what they rely on.
- **Lean (mine): keep one, draft 2.** It has no rival. F1 and the gaps G1, G2 and G4 decide its next draft.
- **Prompted:** the inventory marks draft 1 "yes". It was written under the order to compare with Until's escrow. *Counted (inventory field).*

#### P10. Someone took money and gave nothing, with no Terms: the debt is written beside their number, proven by bytes.

*Seam with DubWeb: its register is DubWeb's.*

| Solution | Author (window) | Spec hashes | Use | Built on by | Kit |
|---|---|---|---|---|---|
| Proven claim | `21a3f657…` (followers) | draft 1 `ed9a4b4e…` (act `d6647391…`), draft 2 `51f9afc8…` (act `de67b513…`) | 6 claim acts under draft 1 by 6 identities (followers, public-30-49); 0 under draft 2 | award 1 and 2 (dublaw), held for you 1 and 2 (stall), warning notice 2 and 3 (the-back-row) | kit lacks it |

All counts: used is not checked.

- **Faults** (*traced*):
  - Draft 1 ordered rivals by each claimant's own sequence, and a copier won (act `07e86444…`). Fixed in draft 2: rivals are ordered only by a witness.
  - A preimage published before lodging can be copied (`a93b1365…`, lurker). Draft 2 says to lodge first. Who paid stays unprovable, as the text states.
- **Lean (mine): keep one, draft 2.** Its settling by an award ties it to P9.

#### P11. The buyer says, in a signed word, whether the seller delivered.

*Seam with DubWeb: DubWeb shows it.*

| Solution | Author (window) | Spec hashes | Use | Built on by | Kit |
|---|---|---|---|---|---|
| delivery receipt | `28070ee8…` (public-creators) | draft 1 `ec1f118d…` (act `fa31564e…`), draft 2 `9e19e62c…` (act `87d4b559…`) | 13 receipts: 9 under draft 1 by 4 identities, 4 under draft 2 by 2; 5 identities in 3 windows | 8 texts by 6 windows (room let, Proven claim 2, award 2, findings held in trust 2, held for you 2, warning notice 2 and 3, an invoice request form) | kit lacks it |

All counts: used is not checked.

- **Faults:** the reading `ac426987…` found three. Receipts from friends are worth little: answered by rule W in draft 2. Time is unchecked: answered by rule T. A buyer can lie: stated as a limit. *Traced.*
- **Lean (mine): keep one, draft 2.** The award's evidence and Proven claim's "other side of a sale" both name it.

### Category 4. Consent and terms for people

#### P12. The words of Terms are read by people, as written, with nothing computed.

| Solution | Author (window) | Fingerprint | Socket | Terms / assents / identities | Kit |
|---|---|---|---|---|---|
| Counterparty's plain-words body, version 1 | `f1de20f8…` (counterparty) | one text act `ee0fd121…`, named by two fingerprints: `61bcdb5b…` (100 Terms) and `ee0fd121…` (20 Terms) | K1 body | 120 / 258 / 113, in 19 windows | kit lacks it |
| Steward & Co.'s plain words, draft 1 | `2c381cf6…` (steward-and-co) | `abafc766…25ac` (act `fc1c5436…`) | K1 body | 4 / 4 / 1 | kit lacks it |

All counts: used is not checked.

- **Faults:** none found.
- **Agree:** words read as written, by people, nothing computed.
- **Differ:**
  - Steward's adds "where they are unclear, the parties decide together, or a contest is raised".
  - Counterparty's names no shares and no delegation. It also names itself by a SHA-256 of its own sentences, "until a shared plain-words body cMIP exists".
  - For a person, the two say the same thing, under three fingerprints. *Inferred.*
- **Lean (mine): merge two.** One plain-words body with one fingerprint, as Counterparty's text itself asks.

#### P13. A person agrees to be recorded, says what may be done with it, and can withdraw for the future.

*Turns on the defaults: it credits named signers for in force.*

| Solution | Author (window) | Spec hash | Socket | Terms / assents / identities | Kit |
|---|---|---|---|---|---|
| consent to be recorded | `f94d310f…` (clusters) | `d835fe75…2345` (act `ada9f31e…`), 1 draft | K1 body | 1 / 2 / 2 | kit lacks it |

All counts: used is not checked.

- **Faults:** none found.
- **What it builds on:** named signers, shares draft 7 and public flow draft 8.
- **What it says it cannot do:** prove that a file is the recording heard, or take a copy down.
- **Lean (mine): keep one.**
  - *If named signers becomes a default:* its in force needs no cMIP.
  - *If not:* it keeps naming one.
- **Prompted:** not marked by the inventory. It was written on day five, and no day-five brief for clusters is on file. *Counted (inventory field).*

#### P14. Neighbours lend a thing, with a record of the loan nobody can rewrite.

*Turns on the defaults: the borrower's spot is buyer by assent, and in force is named signers.*

| Solution | Author (window) | Spec hashes | Socket | Use | Kit |
|---|---|---|---|---|---|
| the lending shelf | `2c381cf6…` (steward-and-co) | draft 1 `255551a7…` (act `e5d774d2…`), draft 2 `43cff6df…` (act `8ff8ac74…`) | K1 body, and the kind of its three Statements (K7) | draft 1: 4 Terms, 8 assents, 8 K7 Statements, 8 identities (ampersand, public-prosumers, steward-and-co); draft 2: 0 | kit lacks it |

All counts: used is not checked.

- **Faults:** none found. The Mending Circle moved its lending onto it (`104dcc6d…`).
- **What draft 2 says it cannot say:** the thing itself has no hash, and a borrower's assent cannot be refused, only ignored (G1).
- **Lean (mine): keep one, draft 2.**
  - *If buyer by assent becomes a default:* the borrower is the grammar's default buyer.
  - *If not:* it names DubLaw's two texts, or the merged spot (P3).

#### P15. A room let between two people: rent, deposit, and whose word counts on the state of the room.

| Solution | Author (window) | Spec hashes | Socket | Use | Built on by | Kit |
|---|---|---|---|---|---|---|
| a room let, in plain words (a template) | `76a78f70…` (plain-words) | `d8974b8e…`, `e585b7d3…`, `52f04b96…` (acts `526f4947…`, `943e2ad4…`, `9f1911e7…`): 3 drafts | none: a template that composes Terms, the award, the receipt, escrow and period payment | 0 Terms, 0 identities ("nothing in it has been signed by anyone") | award 1 and 2 (dublaw), escrow 5 (until) | kit lacks it |

All counts: used is not checked.

- **Faults:** draft 1 overstated what a contest does under escrow draft 4 (Until's answer, `ac11e54c…`). Fixed in draft 2.
- **Lean (mine): keep one, draft 3.** It has no rival. It rests on P9 and P11.

### Category 5. Leaving and carrying on

#### P16. A party leaves an agreement alone, or a stand-in it named takes the place of a party that is gone.

| Solution | Author (window) | Spec hash | Socket | Use | Kit |
|---|---|---|---|---|---|
| the way out | `a83df2c7…` (keep) | `f78ec7a7…ab3d` (act `fe98a3f1…`), 1 draft | K4 update condition | 0 Terms, 0 identities | kit lacks it |

All counts: used is not checked.

- **Faults:** none on record. It says it is "on paper only", and its `gone` Statement has no encoding.
- **Pointers:**
  - Shower work took its stand-in "in Keep's shape" (draft 8).
  - Shares has "leaving alone" (clause F).
  - Quorum has stand-ins for powers.
- **Lean (mine): keep one.** It is the only text whose whole task is the way out.
- **Prompted:** Keep's day-five brief asked for "the way out" of an identity service. That brief came after this draft (day 1); the brief is about identities, not agreements.
- Recovery by vouching was not tested and is not catalogued as tried (rule 2 of the order).

## 3. The gaps

Problems the round met with no text at all. *Inferred, from the reports and acts cited.* Each is a lean "a gap", and the lean is mine.

- **G1 (category 1). Someone refuses, in a signed act a reader can count: a party refusing a version, a role, or a case.**
  - Pointer declined the Edubba sale in a plain text act (`2c28bdb1…`). DubLaw read it as silence for days (dublaw reports, day 2 window 3).
  - The Back Row refused to check an escrow in text (`11316a63…`).
  - Hop refused a version only by assenting to another (`865311ab…`, assent).
  - The lending shelf says a borrower's assent "cannot be refused in the grammar, only ignored".
  - F1's arbiter can decline only by silence.
  - *Prompt caveat:* Nobody, allegedly, raised a stated refusal on day five (`_research/hosts-log.md`, 09:51: "not yet a decision"). DubLaw's day-two request came before it.
- **G2 (category 1). What silence means: a co-signer, a payee, a respondent or an arbiter who never answers.**
  - Partly answered, each for one case: by in force by the condition (P2), the quorum's and the way out's stand-ins, and the award's default.
  - No text says it in general. Counterparty's C2 (day 5 window 1) finds that one silent party stops every replacing version.
  - A payee who never invoices leaves a debt nobody can pay (longhouse, day 3 window 2).
  - *Prompt caveat:* the same hosts' log line.
- **G3 (category 5). An agreement ends: by notice, at a term, or by the parties together.**
  - G4.9 says no agreement ends. The way out covers leaving, not ending.
  - A friends' ring invented its own leaving rule (public-50-plus, day 5).
- **G4 (category 3). A dispute where nobody was named in advance to decide it.**
  - The award needs an arbiter named before the dispute. Proven claim records a debt with no forum (followers, day 5 window 1).
- **G5 (category 4). What the parties keep among themselves: Terms or acts that may not be republished.**
  - A private act was republished (plain-words, day 4 window 3, act `94f0b3a2…`, sealed, not opened).
  - "Take it down" has no act (clusters, day 5).
  - Consent to be recorded covers future publication only.
  - *Prompt caveat:* this comes mostly from the day-five "what could the language not say" sections, which the day-five briefs asked for.
- **G6 (category 1). One clause that says which clock or reference a set of Terms reads time by, instead of each cMIP restating it.**
  - The award, the receipt, the shelf and the room let each restate time by two references.
  - DubLaw asked for one clause (dublaw, day 5 window 3).
  - *Not answered here:* how "in force at a deadline" was counted is the MOR lead's question.
  - *Prompt caveat:* as G5.

Raised in the reports, and placed elsewhere or left out:
- unclaimed money (held for you, Money);
- proof that something did not happen (core);
- recovery of a lost identity (not tested; Web);
- appeal (named open in the award's draft 2, but met by no case in the reports).

## 4. The eleven conceded texts

Not catalogued here. Each is placed as `slice-check.md` agreed:

- findings held in trust, drafts 1 and 2: Web (identity safety).
- custody receipt, drafts 1 and 2: Web (record and time).
- Handover check, draft 1: Web (a home's way out).
- hours of care, draft 1: Money (mutual credit).
- held for you, drafts 1 and 2: Money (money held).
- the client that served the payment, two copies: Money (a payout share).
- guide spot, draft 1: Money (a payout share).

## 5. For the MOR lead

Listed, not judged. The sources are the windows' reports (`_research/windows/<name>/reports/`, by day and window) and the acts given. An act marked sealed was not opened: its reading is the report's.

### 5.1 What the language could not say, from this area

- **A refusal, and what silence means.** G1 and G2 above. Pointer `2c28bdb1…`; Hop `865311ab…`; Counterparty's commitment `b54a2876…`, never acknowledged (counterparty, day 5 window 1).
- **That assent to Terms covers what they rely on.** The award's clause rests on it (draft 2, section 9), and the grammar does not say so (dublaw, day 5 windows 1 and 2).
- **A thing or event outside bytes:**
  - that a photo shows this room (room let; award);
  - that a delivery happened (receipt; Proven claim 2, section 6);
  - that a ladder is the same ladder (lending shelf).
- **That an arbiter is independent, or read what it cites.** Award draft 2, section 9.
- **Who paid.** A preimage proves knowledge, not identity (Proven claim 2; dublaw, day 5 window 2).
- **Order between signers.** Proven claim 1's copier, act `07e86444…`.
  - *The MOR lead's open question on Postmark's place's role in ordering acts: not answered.*
- **A limit on a Statement kind.** It can only live in K3 or K4 (plain-words, day 5 window 3; quorum draft 4's parameter 4; money decision draft 3, `14e01443…`).
- **Consent to a work but not to a role in it.** Backlot, day 5 window 1.
- **A person with no key named in Terms.** Ampersand and backlot, day 5.
- **A spec's name is not reserved.** Two "signed credits, draft 1" exist (backlot, day 5 window 1).
- *Prompt caveat:* most of these come from the day-five sections on "what the language could not say", which the briefs asked for (`windows/counterparty/from-the-hosts/brief-day-five.md`, and the homes' and Postmark's briefs).

### 5.2 Rules of Agreements draft 25 that two honest readers applied differently

- **G4.1 with G4.8: does a replacing version need every signer?**
  - Yes, unless the Terms name an `in_force` rule: plain-words (day 4 window 3), dublaw (`0785547b…`), Counterparty's C2 (day 5 window 1; narrowed in `a17ad636…`, sealed).
  - The update condition alone: Plain Words' own reading before Q-1 (`8dba1780…`, sealed).
  - Both readings are relied on: dubpay is held by the default (`94dddf2f…`), and a ring is protected by it (`8bbe3989…`).
- **G4.2: roles and in force.**
  - Any role needs a K2 cMIP: dublaw, day 2 window 3, which is why named signers exists.
  - Named signers only restates the default: clusters (final), public-50-plus (day 5 window 3).
  - A client read "unchecked" as "no" (`7e1aa448…`).
- **G4.2, G4.8(a) and G10.3: a buyer's assent to a one-party offer.**
  - The buyer becomes a party by their assent: public-under-30's checker, as public-prosumers cites it (day 1 window 2).
  - With no role named, the assent counts for nothing: public-prosumers (day 1 window 2), public-creators (day 2 window 2).
- **G4.1: is signing Terms assenting?**
  - Sellers read the signed Terms as binding.
  - The kit and checkers did not: Longhouse's Terms `293444c6…`, made in force by assent `4e9c7511…` (plain-words, day 1 window 3).
- **G6.1 and G6.2: the author's assent with no `previous`.**
  - The hosts' count reads a fork (`_research/hosts/contest/count-day3.md`).
  - Pointer's count reads the Terms as in force.
  - Stall resolved it with resolves (`f81aa8c3…`, and 13 more, stall, day 3 window 3).
- **G4.7, G4.8 and G12: version 3 replacing version 1 in seven entries.**
  - The second update is void: Pointer (`c1614891…`, `9d6aab2e…`).
  - A fork, then corrected to a late update: Counterparty (`bc2e3604…`, then `b5dd0f2c…`).
  - The hosts' rerun says no fork that its count relies on (`_research/hosts/count-rerun.md`, step 3).
  - *How resolved forks were counted: the MOR lead's open question, not answered.*
- **G4.11(e) and G4.4: who signs an update when no condition is named.**
  - Every assenting buyer: stall (day 1 window 2); the-back-row (day 1 window 1).
  - Everyone who signed the original: plain-words (day 1 window 1).
  - The service alone, an agreement party not counted: hop (`9144a9c0…`, deal `82a722c1…`), accepted by dubpay (day 3 window 2).
- **G4.11(a): which assents an update condition is given.**
  - Role fillers' too: Counterparty V5; until (day 1 window 3); shares draft 7, S4.
  - Signers only: the verifier until describes (day 1 window 3).
- **G5.5: a dropped or swapped power rule.**
  - Counterparty: it changes an answer (finding 7; `a5162e53…`, sealed; `298d832a…`, sealed).
  - The hosts' verifier-2 report: it does not (counterparty, day 1 window 2; backlot, day 1 window 3).
  - Shares draft 4 and shower work draft 6 count any swap as a change.
- **G5.1(b) and G5.6(f): does an assent under a power count as the party's own?** Plain Words (`1edde3ea…`), and both P6 texts then excluded it.
- **G10.6 and G5.1(c): what a buyer keeps from an earlier version.**
  - The rights of its version: plain-words (`297baf7e…`).
  - Past payments keep their terms, but the buyer is bound by later updates while a party: the-back-row (day 1 window 1).
- **G10.3 and G11.7: is a buyer one who assented, or one who paid?**
  - Assented: Pointer's method (`5ff4a362…`); buyer by assent; DubLaw's answer (`36a402ff…`).
  - Paid: Stall's spot; public-50-plus (day 1 window 3); the-back-row (day 2 window 1).
  - *Whether buyer by assent becomes a default: the MOR lead's question, not answered.*
- **Assents to replaced versions.**
  - Does an assent follow the agreement or the version? backlot (day 4 window 2).
  - Every version needs every buyer again: public-30-49 (day 4 window 2).
  - The hosts' rerun reads "the version now in force" (`count-rerun.md`, step 4).
  - *How these were counted: the MOR lead's open question, not answered.*
- **In force at a deadline.**
  - An assent never lodged counts by the signer's own line: the hosts' reading D2 (assents `81374b4f…`, `b6c78860…`), with which Counterparty agrees (`9717eea1…`).
  - Only a place's record proves time: other readers.
  - *The MOR lead's open question, not answered.*
- **G4.1 and G7: in force depends on which home a reader asks.** Followers and until (day 4 window 2); stall (day 3 window 2).
- **A power's kind and a K7 kind.**
  - Money decision drafts 1 and 2 read limits from the kind; draft 3 (`14e01443…`) reads them from the power's rule.
  - Counterparty's W-1 (day 4 window 1).
  - DubLaw's wave 2 listing filed a power's kind under "K7" (`check-wave-2.md`, §).
- Also listed as open, not answered here:
  - the thief's valid rotation;
  - "exactly these acts";
  - the defaults (named signers, buyer by assent).

## 6. Limits

- **The grouping and every lean are my reading.** The counts are the script's. A problem's wording is mine, not the authors'.
- **How I read the texts:**
  - Every text was read whole: the 10 single-draft texts and every latest draft, line by line.
  - Earlier drafts of the multi-draft works were read by their diffs against the next draft, with each draft's header of fixes.
  - For shower work's twelve drafts, the diffs and the change log were made by a helper reading under this session; draft 12's costs were checked against its text.
- **Use counts** are of published acts: one unpublished assent is left out. They count naming, not validity: no count says a Terms act was in force.
  - `relies_on` naming a text's act id is counted as naming, and shown apart in `sockets`.
- **"Built on"** counts specification texts in DubWeb's inventory, plus the six added, that name a text by its full hash or its first 8 characters. A text built on by prose only is missed, and a chance 8-character match would count. I checked every hit listed above by its title.
- **Windows** come from DubLaw's wave 2 table of identities. "Unknown" means that table has none.
- **Faults** are those named in the texts and the acts the inventory flagged, read by me. A fault reported only in a report, with no act, may be missing. "Fixed" means a later draft says so; no fix was retested.
- **The gaps and section 5 rest on reports**, read by helpers with grep and context, then checked by act: the script confirms every cited act exists and who signed it. Six cited acts are sealed and were not opened.
- **Not done:**
  - No sealed act was opened, and nothing in `_hosts/` or `_research/ACCESS-hosts-only.md` was read.
  - No player's file, home or relay was touched.
  - Nothing was built, fixed or drafted.
  - The core was not judged, and none of the MOR lead's questions was answered.
- **Personal names:** the texts carry many player names. This file names identities and windows only.
