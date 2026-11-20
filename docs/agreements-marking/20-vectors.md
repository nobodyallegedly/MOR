# Agreements marking: the vectors

*S8b, the marking pass (F443), 11 November 2026. The 269 Agreements cases of `core/vectors/verdicts.json`, in their order in the file (n is the case's place, counted from 1), each marked: its part; whether its verdict **stays**, **moves** (to the founding cMIP of a task) or **changes** by a decision; what that rests on; what it serves. Codes as in the [README](README.md). Nothing here is decided.*

**One mark for the whole corpus, not repeated below.** Every case whose acts hold the terms of a deal of two or more parties, or of a collective, is **re-made**: every party, member and named role now states its absence proof and absence outcome before the agreement completes (R-238, T14, ONCE; a deal of one is not asked, ONE). The bytes and act hashes change; the verdict is the one marked here. "Stays, bytes re-made" below marks the cases where the re-making itself carries a new rule (a transfer).

**"Stays, re-derived"** means: the verdict is the same, but the rule that gives it is new, so the case is derived again from the new text and not copied.

| n | Question | Case (as named) | Part | Verdict | Rests on | Serves | Open | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | agreement exists | a deal one party has not signed: does not exist | shared | stays | draft 24 unchanged | L1, D2 |  |  |
| 2 | agreement exists | a deal every party signed: exists | shared | stays | draft 24 unchanged | L1, D2 |  |  |
| 3 | deal fork | two complete versions of one version: a fork, the version before it the reference | deal | stays | draft 24 unchanged | D1 |  |  |
| 4 | consent counts | a collective's act its layer's rule needs two members for, signed by one: does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 5 | consent counts | the same signed by both members it names: counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 6 | backing | an act of a grant key within its reach, the grant accepted: backed | shared | stays | draft 24 unchanged | S16 |  |  |
| 7 | backing | an act the revocation's history holds: binds | shared | stays | draft 24 unchanged | S16 |  |  |
| 8 | backing | an act the revocation misses, nobody else acknowledging it: void | shared | stays | draft 24 unchanged | S16 |  |  |
| 9 | backing | an act the revocation misses, another identity acknowledging it: disputed | shared | stays | draft 24 unchanged | S16 |  |  |
| 10 | backing | an act the revocation misses, only its grantee acknowledging it: void | shared | stays | draft 24 unchanged | S16 |  |  |
| 11 | backing | an act the revocation misses, recorded by a keeper of a deal it belongs to before the revocation: disputed | shared | stays | draft 24 unchanged | S16 |  |  |
| 12 | status after keepers | a deal's keeper recorded the act before the rotation: disputed | shared | stays | draft 24 unchanged | S15 |  |  |
| 13 | status after keepers | the deal's keeper recorded the act only after the rotation: void | shared | stays | draft 24 unchanged | S15 |  |  |
| 14 | status after keepers | a keeper's record of an act belonging to its deal at depth two, before the rotation: disputed | shared | stays | draft 24 unchanged | S15 |  |  |
| 15 | status after keepers | the same at a verifier not holding the obligation: unknown | shared | stays | draft 24 unchanged | S15 |  |  |
| 16 | status after keepers | a party's contest naming an obligation of the deal in objects, recorded by the deal's keeper before the rotation: disputed | shared | stays | draft 24 unchanged | S15 |  |  |
| 17 | status after keepers | an act naming the founding, its history holding a clone in force: the clone's keeper recorded it before the rotation: disputed | shared | stays | draft 24 unchanged | S15 |  |  |
| 18 | status after keepers | the same recorded only by the founding's keeper, whom the clone replaced: void | shared | stays | draft 24 unchanged | S15 |  |  |
| 19 | consent counts | a collective's act of the payment cMIP an operational clone names, after the record putting that clone in force: counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 20 | consent counts | the same kind of act signed before the record: does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 21 | consent counts | a record naming the signatures that meet its clone's mark: the clone in force, a collective's act of the cMIP it names counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 22 | consent counts | a record naming valid signatures short of its clone's mark: the clone not in force | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 23 | consent counts | a record naming a clone whose parent is not the agreement in force for it: the clone not in force | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 24 | closing | a collective's closing signed by every member with a chain signature: complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 25 | closing | the same, one member's chain signature not held: not complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 26 | consent counts | an act of the collective after its closing: it does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 27 | closing | a refund owed on a payment to a collective that its closing's line does not place: it does not block the closing | collective | stays | draft 24 unchanged | C5 |  |  |
| 28 | consent counts | an act of the collective before its closing: it still counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 29 | closing | a collective's closing signed by every remaining member after a registered resignation: complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 30 | closing | a collective's closing under a constitutional rule counted by shares, signed by a member holding more than the share: complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 31 | fork | a collective's fork into two sides, each successor founded first, signed by every member with a chain signature: complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 32 | fork | the same, one member's chain signature not held: not complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 33 | consent counts | an act of the original after its fork: it does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 34 | consent counts | an act of the original before its fork: it still counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 35 | agreement exists | a deal one of whose parties is an agreement, signed by the other party and by every party of that agreement: exists | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 36 | agreement exists | the same without one party of the inner agreement signing it: does not exist | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 37 | agreement exists | a deal one of whose parties is an agreement standing forked, unsettled, signed by the other party and by every party of the inner agreement's reference: exists | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 38 | version in force | a deal's fork settled by the judge its terms name, within its period: the version kept is in force | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 39 | version in force | the next link of the chain settling while the first judge's period runs: the deal stays on its reference | deal | stays, re-derived | JUDGE; NOSUSP | S17 |  | the first judge's lapse is now its role's absence (task 14), the next judge a move (task 26); verdicts unchanged |
| 40 | version in force | the first judge's period passed with no answer: the next link settles, keeping B | deal | stays, re-derived | JUDGE; NOSUSP | S17 |  | the first judge's lapse is now its role's absence (task 14), the next judge a move (task 26); verdicts unchanged |
| 41 | version in force | the first judge answering after its period: counts for nothing, the next link's settlement stands | deal | stays, re-derived | JUDGE; NOSUSP | S17 |  | the first judge's lapse is now its role's absence (task 14), the next judge a move (task 26); verdicts unchanged |
| 42 | version in force | a judge's two first settlements keeping different versions: the next link active, its settlement in force | deal | stays, re-derived | JUDGE | S17 | O-7 | a judge that settles twice is not absent: whether its failure is a role's absence or a rule of its own is not decided |
| 43 | version in force | a judge's settlement naming every tip it saw: the version kept is in force | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 44 | version in force | a judge's settlement omitting a tip it saw: it counts for nothing | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 45 | deadline | a deadline met by an anchor of the act | shared | stays | draft 24 unchanged | S14, task 10 |  |  |
| 46 | deadline | a deadline met by both keepers' records lying before their records anchored by the point | shared | stays | draft 24 unchanged | S14, task 10 |  |  |
| 47 | deadline | a deadline missed: both keepers' sequences anchored past the point hold no record of the act | shared | stays | draft 24 unchanged | S14, task 10 |  |  |
| 48 | deadline | a deadline with no anchor: undetermined | shared | stays | draft 24 unchanged | S14, task 10 |  |  |
| 49 | deadline | an anchor of the act wins over the keepers' silence | shared | stays | draft 24 unchanged | S14, task 10 |  |  |
| 50 | purchase contests | a buyer's contest of their purchase: shown beside it | shared | stays | draft 24 unchanged | S9 |  |  |
| 51 | purchase contests | the same contest signed by another identity: shows nothing | shared | stays | draft 24 unchanged | S9 |  |  |
| 52 | version in force | a judge's settlement keeping A and dropping B, its request's history holding a third version C: it counts for nothing | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 53 | version in force | the same settlement naming C among the tips it drops: the version kept is in force | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 54 | purchase | a sale of a collective's work under its publication, naming the collective's own ownership agreement: a purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 55 | purchase contests | the fan's contest of that purchase: shown beside it | shared | stays | draft 24 unchanged | S9 |  |  |
| 56 | version in force | a deal's fork settled by its parties: a complete version on one branch naming the other's tip, the version in force | deal | stays | draft 24 unchanged | D1, S1 |  |  |
| 57 | deal fork | two settlements of the parties, neither holding the other, keeping different lines: tangled, on the reference | deal | stays | draft 24 unchanged | D1 |  |  |
| 58 | version in force | the parties' settlement against the judge's, neither holding the other: the parties' holds | deal | stays | draft 24 unchanged | D1, S1 |  |  |
| 59 | version in force | a settling version naming a tip this verifier does not hold: a plain version, the deal on its reference | deal | stays | draft 24 unchanged | D1, S1 |  |  |
| 60 | version in force | the same once the verifier holds the tip it names: the settlement counts | deal | stays | draft 24 unchanged | D1, S1 |  |  |
| 61 | status after keepers | a deal with two keepers under the rule "every keeper", only one recording the act before the rotation: void | shared | stays | draft 24 unchanged | S15 |  |  |
| 62 | status after keepers | the same under the rule "at least one keeper": disputed | shared | stays | draft 24 unchanged | S15 |  |  |
| 63 | purchase | a payment naming a claimed work's bake, no price tag: a tip to its uploader, no payment for a work | shared | stays | draft 24 unchanged | S7 |  |  |
| 64 | purchase | the same payment naming the publication's price tag, the receipt naming the ownership agreement: a purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 65 | purchase | a payment of a lone seller's price tag, naming no ownership agreement: a purchase | shared | stays | draft 24 unchanged; ONE | S7 |  | a lone seller: a deal of one, asked no absence choices (ONE); bytes unchanged |
| 66 | purchase | a payment of a publication's tag, the ownership terms it names signed by nobody: no purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 67 | purchase | the same terms signed by their drafter alone: still no purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 68 | purchase | the same terms once every party signed: the agreement signs the publication, and the payment is a purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 69 | purchase | a purchase of the publication's tag naming its ownership agreement, its version a release of another work under another agreement: a wrong receipt | shared | stays | draft 24 unchanged | S7 |  |  |
| 70 | purchase | the same purchase, its version the ownership agreement's founding version: a purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 71 | version in force | a deal's complete version nothing relies on, a signer's rotation disowning its signature: the version before it in force | deal | stays | draft 24 unchanged | S15, D1 |  |  |
| 72 | version in force | a later complete version cloning a deal's version, then a signer's rotation disowning its signature on that version: the later version in force | deal | stays | draft 24 unchanged | S15, D1 |  |  |
| 73 | version in force | a later version cloning a deal's version, signed by its drafter alone, then a signer's rotation disowning its signature on that version: nothing relied on it, the founding in force | deal | stays | draft 24 unchanged | S15, D1 |  |  |
| 74 | version in force | a deal's fork settled by its judge on the request of a stake holder who is no party: it counts for nothing, the deal on its reference | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 75 | version in force | the same settlement on the request of a party who signed the reference: the version kept is in force | deal | stays | draft 24 unchanged | S17, D1 |  |  |
| 76 | purchase | a payment under co-owners' publication every party of their ownership agreement signed, naming the agreement: a purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 77 | agreement exists | a deal one of whose parties is a deal, signed by every party of that deal's version in force: exists | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 78 | agreement exists | a deal one of whose parties is an agreement this verifier does not hold, every other signature held: unknown | shared | stays | draft 24 unchanged | L2 |  |  |
| 79 | agreement exists | the same at a verifier holding the inner deal: exists | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 80 | vow | a free sale confirmed by the buyer's act acknowledging both the door's record of the vow and the buyer's own sign-on: confirmed | shared | stays | draft 24 unchanged | S9 |  |  |
| 81 | backing | a collective's grant whose acceptance an act of the collective acknowledged, after the grantee's rotation disowns it: the grantee's act is backed | collective | stays | draft 24 unchanged | S16, C1 |  |  |
| 82 | backing | the same, the acceptance acknowledged by no act of the collective: not backed | collective | stays | draft 24 unchanged | S16, C1 |  |  |
| 83 | agreement invalid | a clone marked with a succession plan alone that places the seat successor after the other parties, not in the party's place: invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 84 | agreement invalid | the same clone with the seat successor in the party's own place among the parties: not invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 85 | backing | a grantee's obligation for the collective that the collective pays on, its grant revoked by a revocation not holding it: binds | shared | stays | draft 24 unchanged | S16 |  |  |
| 86 | backing | the same obligation the collective never paid on, acknowledged, nor cited: void | shared | stays | draft 24 unchanged | S16 |  |  |
| 87 | liveness | a member's public liveness on the collective's agreement, acknowledged by an act of the collective: shows presence | collective | stays | draft 24 unchanged | C1 |  | where the party's answer is "never", a liveness shows nothing (HAND) |
| 88 | liveness | the same liveness no act of the collective placed: shows nothing | collective | stays | draft 24 unchanged | C1 |  | where the party's answer is "never", a liveness shows nothing (HAND) |
| 89 | transfer | 9.1 Ana's transfer of her whole share to Cy, Cy's signature and Ana's chain signature placed: it takes effect | shared | stays, bytes re-made | BUYER; TRAVEL; RESEARCH | S3 | pull P-1 | the buyer now states its own absence choices in the transfer it completes (BUYER, to confirm); TRAVEL reads the other way |
| 90 | transfer | 9.1 the same transfer, Ana's signature alone: it does not take effect yet | shared | stays, bytes re-made | BUYER; TRAVEL; RESEARCH | S3 | pull P-1 | the buyer now states its own absence choices in the transfer it completes (BUYER, to confirm); TRAVEL reads the other way |
| 91 | purchase | 9.1 a purchase under the label's publication after the transfer: a purchase, neither publication changed | shared | stays | draft 24 unchanged | S7 |  |  |
| 92 | split | 9.1 its split, following the complete transfer, paying Cy 400,000 of every million left on the owners' line: the plan kept | shared | stays | draft 24 unchanged | S11, task 8 |  | the owners' line is the core's (S11); the remainder rule task 8's |
| 93 | split | 9.1 once the transfer is complete, a split under the self-published publication paying Ana for the share: it breaks the plan | shared | stays | draft 24 unchanged | S10, S11 |  |  |
| 94 | split | 9.1 the same split, the transfer bearing only Ana's signature: it still pays Ana, the plan kept | shared | stays | draft 24 unchanged | S10, S11 |  |  |
| 95 | transfer | 9.1 a payout receipt Ana signs for the share, bound to a rotation after her transfer's chain signature: a wrong receipt | shared | stays | draft 24 unchanged | S3 |  |  |
| 96 | record | 9.2 a record registering Cy's resignation, drawn by Ben, naming the band and its previous decision: the line | collective | stays | draft 24 unchanged | C2 |  |  |
| 97 | status | 9.2 the rotation of the band's chain key, rebuilt from Ana's and Ben's shares, declaring the clone without Cy: valid | collective | stays | draft 24 unchanged | — |  |  |
| 98 | consent counts | 9.2 Cy's text for the band before the line: it counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 99 | consent counts | 9.2 a pointer of the band Cy signed before the line: his signature still counts for it | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 100 | consent counts | 9.2 Cy's text naming the band after the line: it counts for nothing | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 101 | consent counts | 9.2 a pointer after the line, drafted by Ana and signed by Cy: it does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 102 | consent counts | 9.2 the same pointer once Ben signs it too: it counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 103 | status | 9.2 Cy's own post after he left: valid, untouched | collective | stays | draft 24 unchanged | C2 |  |  |
| 104 | consent counts | 9.2 a pointer after the line drafted by Cy, Ana and Ben both signing it: it counts for nothing | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 105 | record | 9.3 a record registering the abandonment authority's declaration of Ben: the line | collective | stays, re-derived | R-238; ONCE; T14 | S4, S5 |  | a declaration under the member's own absence proof; the line unchanged |
| 106 | agreement invalid | 9.3 the clone marked with Ben's plan, Dee in his place, every threshold unchanged, his share to his two children: not invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 107 | agreement invalid | 9.3 the same clone changing the words too: invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 108 | agreement invalid | 9.3 the same clone leaving Ben's share where it was, his plan naming his children: invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 109 | status | 9.3 the rotation declaring the succession clone: valid | collective | stays | draft 24 unchanged | — |  |  |
| 110 | consent counts | 9.3 Dee's text for the band, citing the rotation: it counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 111 | agreement invalid | 9.3 a founding naming a single chain-key holder with a successor and an escrowed share: not invalid | collective | stays | draft 24 unchanged | C5 |  |  |
| 112 | agreement invalid | 9.3 a founding naming a single chain-key holder with neither: invalid | collective | stays | draft 24 unchanged | C5 |  |  |
| 113 | fork | 9.4 a fork drawn by a member, naming the band, its line and the successors, chain-signed by every member: complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 114 | consent counts | 9.4 a text for the band after its fork: it counts for nothing | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 115 | purchase | 9.4 a payment under the band's own publication made before the fork, which the fork's history does not hold: racing it, no purchase | shared | stays | draft 24 unchanged | S7, S15 |  |  |
| 116 | purchase | 9.4 a payment under the band's own publication after the fork: no purchase, owed back | shared | stays | draft 24 unchanged | S7, S15 |  |  |
| 117 | closing | 9.4 a closing of a band that still holds half a song's stake: not complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 118 | transfer | 9.4 the band's transfer of its whole half to Dee, drawn by a member, completed by Dee, chain-signed by the band: it takes effect | shared | stays, bytes re-made | BUYER; TRAVEL; RESEARCH | S3 | pull P-1 | the buyer now states its own absence choices in the transfer it completes (BUYER, to confirm); TRAVEL reads the other way |
| 119 | closing | 9.4 the band's closing citing that transfer, chain-signed by every member: complete | collective | stays | draft 24 unchanged | C5 |  |  |
| 120 | status | 9.5 the band's genesis, declaring its founding and no signing key, signed by a chain key revealed in its signature: valid | shared | stays (Identity's or the MICS's rule) | draft 24 unchanged | — |  |  |
| 121 | status | 9.5 the band's rotation, signed with its chain key, receipted by its home: valid | shared | stays (Identity's or the MICS's rule) | draft 24 unchanged | — |  |  |
| 122 | chain | 9.5 the band's homeless rotation, its old home objecting: it counts, its own escape endorsement | shared | stays (Identity's rule) | draft 24 unchanged | — |  |  |
| 123 | status | 9.5 a person's homeless rotation under the same objection, with no endorsement: void | shared | stays (Identity's or the MICS's rule) | draft 24 unchanged | — |  |  |
| 124 | purchase | 9.6 a payment the split service received on a push rail before the ending: a purchase, past sales standing | shared | stays | draft 24 unchanged | S7 |  |  |
| 125 | purchase | 9.6 a payment the service recorded after its own signature on the version ending the publication: racing it, no purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 126 | owed back by | 9.6 who owes that payment back, the service having paid out the label's share and the owners' line: each party in the share it received | shared | stays | draft 24 unchanged | S8 |  |  |
| 127 | purchase | 9.6 a payment following the tag's later version with no price, its signer's alone: no purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 128 | purchase | 9.6 the sale before the withdrawal: still a purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 129 | purchase | 9.6 a payment naming the tag's earlier, priced version, receipted on a push rail after the withdrawal is in the service's history: no purchase | shared | stays | draft 24 unchanged | S7 |  |  |
| 130 | status | 9.7 the bake that crosses, its bytes and work hash: valid | shared | stays (Identity's or the MICS's rule) | draft 24 unchanged | — |  |  |
| 131 | status | 9.7 the claim that crosses, naming who made the work: valid | shared | stays (Identity's or the MICS's rule) | draft 24 unchanged | — |  |  |
| 132 | agreement exists | 9.7 the ownership agreement that crosses, naming who owns what share: it exists | shared | stays | draft 24 unchanged | L1 |  |  |
| 133 | agreement invalid | a collective's terms naming a rule for every layer, 1 to 5: not invalid | collective | stays | draft 24 unchanged | C4 |  |  |
| 134 | agreement invalid | a collective's terms naming no rule for one layer: invalid | collective | stays | draft 24 unchanged | C4 |  |  |
| 135 | agreement invalid | a collective's terms naming a rule for layer 0: invalid | collective | stays | draft 24 unchanged | C4 |  |  |
| 136 | agreement invalid | a collective's terms naming a rule for a layer above 5: invalid | collective | stays | draft 24 unchanged | C4 |  |  |
| 137 | agreement invalid | a collective's terms whose rule for a layer is counted by shares: invalid | collective | stays | draft 24 unchanged | C4 |  |  |
| 138 | agreement invalid | a collective's terms with a finer area reaching acts of one type: not invalid | collective | stays | SMALL | C4 |  | "field 34" as the formats define it (SMALL) |
| 139 | agreement invalid | a collective's terms with a finer area reaching a whole layer: invalid | collective | stays | SMALL | C4 |  | "field 34" as the formats define it (SMALL) |
| 140 | record | a record naming the collective drawn by someone who is no member: no line, nothing in force | collective | stays | draft 24 unchanged | C2 |  |  |
| 141 | record | the same record drawn by Cy, a member holding nothing in particular: the clone in force | collective | stays | draft 24 unchanged | C2 |  |  |
| 142 | record | a record of a constitutional clone adding a member, the key grammar unchanged: the clone in force | collective | stays | draft 24 unchanged | C2 |  |  |
| 143 | record | a record of a clone changing the key grammar: a line, but nothing put in force | collective | stays | draft 24 unchanged | C2 |  |  |
| 144 | status | the rotation declaring that clone, Dee's share dealt: valid | collective | stays | draft 24 unchanged | — |  |  |
| 145 | purchase | a platform's publication of a worker's vow, no ownership agreement claiming it: a purchase, its drafter the owners' side | shared | stays | draft 24 unchanged | S7 |  | a vow has an owner (rule 14); the showing of a sale outside the claim's agreement is open (U4), this verdict is not |
| 146 | consent counts | a grant in an area of number one, drawn by one of the area's holders, no other signing: its grantee's act within it counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 147 | consent counts | the same grant drawn by a member holding no part of the area, no holder signing: its grantee's act counts for nothing | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 148 | purchase | a payment to a backup the publication lists, still naming the tag, receipted by the backup in its own name: a purchase | out | moves, to task 17's founding cMIP | G3; G3F; LAWS | task 17 |  | to the founding cMIP of task 17 (receiver for this payment), with the backup test (law 3) |
| 149 | agreement invalid | a succession clone putting the seat successor in the departing member's place in the rule for Text: not invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 150 | agreement invalid | the same clone leaving the rule for Text naming the departed member: invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 151 | agreement invalid | the same clone also adding another member to the rule for Text: invalid | collective | stays, re-derived | R-238; ONCE | S5, C4 | O-8 | rule 83's succession plan read as the member's absence outcome, a move with the voice: not decided |
| 152 | transfer | 3.9ak Ben's transfer to Carla, chain-signed and receipted, Carla's signature placed: it takes effect | shared | stays, bytes re-made | BUYER; TRAVEL; RESEARCH | S3 | pull P-1 | the buyer now states its own absence choices in the transfer it completes (BUYER, to confirm); TRAVEL reads the other way |
| 153 | chain | 3.9ak Ben then escapes at that position, abandoning his chain signature: the escape counts | shared | stays (Identity's rule) | draft 24 unchanged | — |  |  |
| 154 | transfer | 3.9ak the complete transfer stands after the escape, the escape shown as a dispute on it | shared | stays | draft 24 unchanged | S3 |  |  |
| 155 | publication | 7.7 the owners' side alone replaces a split service that does not sign, the new service accepting: it counts | shared | stays | draft 24 unchanged | S6, S12 |  | switching services is the owners' side's way out, kept by gate 3 |
| 156 | publication | 7.7 the same version also raising the partner's share, the partner not signing: it does not count | shared | stays | draft 24 unchanged | S2 |  |  |
| 157 | publication | 7.7 the owners' side alone ends the publication by a version selling nothing: it counts, and ends it | shared | stays | draft 24 unchanged | S6 |  |  |
| 158 | vow | two claims naming a rail Module the payee never listed, unanswered: they count for nothing, and the vow's sales stand | shared | stays | draft 24 unchanged | S9 |  | decided by Money rule 4 |
| 159 | split judged | a relay's role share, its use record acknowledged in the payer's claim: evidenced | out | moves, to task 18's founding cMIP | G3; G3F | task 18 |  |  |
| 160 | split judged | the same role share, its record acknowledged by no claim: evidence of nothing | out | moves, to task 18's founding cMIP | G3; G3F | task 18 |  |  |
| 161 | split judged | a relay's delivery record naming the media the payment was for, acknowledged: evidenced | out | moves, to task 18's founding cMIP | G3; G3F; R-223 | task 18 |  |  |
| 162 | split judged | a relay's delivery record naming another object, acknowledged: evidence of nothing | out | moves, to task 18's founding cMIP | G3; G3F; R-223 | task 18 |  |  |
| 163 | split judged | a metric payout to a holder the owners' line pays nothing: one the plan already pays | out | moves, to task 19's founding cMIP | G3; G3F | task 19 |  |  |
| 164 | split judged | a metric payout whose measurer is the split service: wrong | out | moves, to task 19's founding cMIP | G3; G3F | task 19 |  |  |
| 165 | record | a collective naming no control model: a clone marked with the clone rule, nothing in force | collective | stays | ITAL | C4 |  | "no control model, judged by the last resort": an italic sentence made a rule (ITAL) |
| 166 | record | the same collective: the same clone marked with the constitutional change rule, every member signing: in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 167 | record | a collective's operational clone, at a verifier that does not hold its control model: unknown | collective | stays | draft 24 unchanged | L2, C4 |  |  |
| 168 | record | a constitutional clone adding a member, at a verifier that does not hold the collective's control model: in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 169 | record | a clone changing the constitution's words, marked with a power a model names: nothing in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 170 | record | two of three change one word of the constitution and the arbitrator, marked with the constitutional change rule alone: nothing in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 171 | record | the same, marked with both rules and signed by every member: in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 172 | record | an issuance under no holders' rule, one holder not signing: nothing in force | shared | stays | R-92 | S2 |  | no share rule: every holder signs (S2) |
| 173 | record | the same issuance, every holder signing: in force | shared | stays | R-92 | S2 |  | no share rule: every holder signs (S2) |
| 174 | record | an issuance under a holders' rule by share, a buyer who bought under it not signing: in force | out | moves, to task 27's founding cMIP | R-92; SIGNED; G3F | S2, task 27 |  | issuance under a holders' rule goes to task 27's founding cMIP; "bought under" counts as signed by SIGNED; verdict unchanged |
| 175 | record | an issuance under a holders' rule by share that a holder never signed, that holder not signing: nothing in force | out | moves, to task 27's founding cMIP | R-92; SIGNED; G3F | S2, task 27 |  | the core's check (S2) holds the verdict; the issuance rule itself to task 27's founding cMIP |
| 176 | record | the buyer bait: a holders' rule added after a sale was signed and before the line placed it, then an issuance under it, the buyer not signing: nothing in force | out | moves, to task 27's founding cMIP | R-92; SIGNED; G3F | S2, task 27 |  | the core's check (S2) holds the verdict; the issuance rule itself to task 27's founding cMIP |
| 177 | control answer | a control model's answer: a clone's answer naming an area's power, counted among its one holder, any one of them: a clone | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 178 | control answer | a control model's answer: a clone's answer naming the rule for Money and the clone rule, any two of two holders: a clone | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 179 | control answer | a control model's answer: a clone's answer letting a stake's holders' rule stand in for a holder: a clone | collective | open: stays or changes | R-92; R-206; NUMBERS | S2, task 27 | O-36 | a holders' rule standing in for a holder in a control answer: R-92 moves share rules to task 27 |
| 180 | control answer | a control model's answer: a clone's answer naming the constitutional change rule: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 181 | control answer | a control model's answer: a clone's answer naming the judicial tier's rule: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 182 | control answer | a control model's answer: a clone's answer naming a succession plan: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 183 | control answer | a control model's answer: a clone's answer whose parties are not ascending: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 184 | control answer | a control model's answer: a clone's answer naming the rule for Money as a stand-in for a holder: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 185 | control answer | a control model's answer: an act's answer: the area of id 3 reaches it | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 186 | control answer | a control model's answer: an act's answer: no area reaches it, its layer's rule counting | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 187 | control answer | a control model's answer: a refusal: refused, the act or clone invalid | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 188 | control answer | a control model's answer: unknown | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 189 | control answer | a control model's answer: an answer of a kind rule 99 does not define: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 190 | record | a clone adding a member and naming a second payment cMIP, marked with the constitutional change rule alone: nothing in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 191 | record | the same clone marked with the constitutional change rule and the rule for Money, every member and the member named for Money signing: in force | collective | stays | draft 24 unchanged | C4 |  |  |
| 192 | record | a member's proxy, an act of the default control cMIP's own specification, registered by a record: the line | collective | stays | draft 24 unchanged | task 25 |  | the proxy is already an act of the default control cMIP (task 25); the record is the core's |
| 193 | status | the same proxy under the Agreements MIR's hash, type 27: invalid | shared | stays | draft 24 unchanged | — |  |  |
| 194 | consent counts | a payee pointer by share: drafted by the member holding 30 per cent alone, the model asking more than half: it does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 195 | consent counts | the same pointer signed by the member holding 20 per cent too: half, not more than half: it does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 196 | consent counts | the same pointer signed by the member holding half too: it counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 197 | consent counts | the pointer drafted by the member holding 30 per cent alone, the model's power for it written by head: overreaching, set aside: it counts under the collective's rule for Money, that member alone | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 198 | control answer | a control model's answer: an act's answer giving it a power by share: an act, by share | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 199 | control answer | a control model's answer: an act's answer giving it a power by head where by share is asked: overreaching | collective | stays | draft 24 unchanged | C4, task 25 |  |  |
| 200 | record | a change of control model: the record putting in force the clone naming another model, every member signing: the line | collective | stays | draft 24 unchanged | C4 |  |  |
| 201 | backing | the agent's pointer under a grant within the Money area, before the change of model: backed | shared | stays | draft 24 unchanged | S16 |  |  |
| 202 | backing | the agent's pointer under the same grant after the change of model, the new model giving an area of the same id: not backed | shared | stays | draft 24 unchanged | S16 |  |  |
| 203 | consent counts | a grant reaching the payee pointers a power by share reaches, drawn by the member holding 30 per cent and signed by the one holding 20: exactly half, it does not count | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 204 | backing | the agent's pointer under that grant: not backed | shared | stays | draft 24 unchanged | S16 |  |  |
| 205 | consent counts | the same grant signed by the member holding half too: it counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 206 | backing | the agent's pointer under that grant: backed, asking no further share | shared | stays | draft 24 unchanged | S16 |  |  |
| 207 | consent counts | a payee pointer whose power by share the model answers otherwise than its query answer lists for payee pointers: overreaching, set aside: it counts under the rule for Money, its drafter alone | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 208 | status | a claim a member signs for the collective, naming the collective its one creator: the collective's claim, the collective the default holder | shared | stays | draft 24 unchanged | L1 |  |  |
| 209 | work owners | the same: the collective the default holder of the work | shared | stays | draft 24 unchanged | L1 |  |  |
| 210 | work owners | a member's claim for the collective listing that member beside it, the member's own signature act not yet given: not bound | shared | stays | draft 24 unchanged | L1 |  |  |
| 211 | work owners | the same, Ben's own signature act naming it: bound, the collective the default holder | shared | stays | draft 24 unchanged | L1 |  |  |
| 212 | work owners | a stranger's claim naming the collective its creator: nobody's claim | shared | stays | draft 24 unchanged | L1 |  |  |
| 213 | work owners | a member's claim naming the collective, the member its only creator: the collective's act, its opener not among its creators, counting for nothing | shared | stays | draft 24 unchanged | L1 |  |  |
| 214 | status | a claim naming neither its signer nor the collective it names among its creators: invalid | shared | stays | draft 24 unchanged | L1 |  |  |
| 215 | work owners | a collective's claim listing beside it a person who is no member, their signature act not yet given: not bound | shared | stays | draft 24 unchanged | L1 |  |  |
| 216 | work owners | the same, the non-member's own signature act naming it: bound, the collective the default holder | shared | stays | draft 24 unchanged | L1 |  |  |
| 217 | work owners | a collective's claim listing another collective beside it, that collective's signature act not yet given: not bound | shared | stays | draft 24 unchanged | L1 |  |  |
| 218 | work owners | the same, a member's signature act for the other collective naming it: bound, the opening collective the default holder | shared | stays | draft 24 unchanged | L1 |  |  |
| 219 | work owners | the same, a stranger's signature act naming the other collective: not bound | shared | stays | draft 24 unchanged | L1 |  |  |
| 220 | consent counts | a collective's key delivery sealed only to the member its Envelopes rule names: counts | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 221 | consent counts | a collective's key delivery sealed to the other members but not to the one its Envelopes rule names: not done | collective | stays | draft 24 unchanged | C1, C4 |  |  |
| 222 | purchase | a payment naming a tag's earlier price on a push rail, the seller's receipt recorded after a later version changing the price: no purchase, owed back | shared | stays | draft 24 unchanged | S7 |  |  |
| 223 | purchase | the same payment, the seller's receipt recorded before the later version: a purchase at the earlier price | shared | stays | draft 24 unchanged | S7 |  |  |
| 224 | specification claim, reading Agreements | a specification naming a collective its creator, published by a member for it: the collective's | shared | stays (Development's rule) | draft 24 unchanged | — |  |  |
| 225 | specification claim, reading Agreements | the same naming the collective, published by a stranger: unclaimed | shared | stays (Development's rule) | draft 24 unchanged | — |  |  |
| 226 | specification claim, reading Agreements | a specification naming a person its creator, published under her grant key that Agreements backs: hers | shared | stays (Development's rule) | draft 24 unchanged | — |  |  |
| 227 | agreement exists | a deal one of whose parties is a deal, signed by every party of that deal's version in force at the time: exists | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 228 | agreement exists | an inner deal already re-versioned, Lu in Kai's place, the outer deal then signed by Jo and Kai: it does not exist | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 229 | agreement exists | the outer deal signed by Jo and Kai under the inner deal's founding, the inner deal then re-versioned: the consent stands, the outer deal exists | shared | stays | draft 24 unchanged | L1, S1 |  |  |
| 230 | closing | a closing of a collective owing a refund on a payment its own receipt records before the line: not complete | collective | stays | draft 24 unchanged | C5, S8 |  |  |
| 231 | closing | the same, the fan's receipt of the refund acknowledged by an act of the band before the line: complete | collective | stays | draft 24 unchanged | C5, S8 |  |  |
| 232 | closing | a closing of a collective whose own receipt before the line records a payment naming no payer, naming another seller's tag: complete | collective | stays | draft 24 unchanged | C5, S8 |  |  |
| 233 | status | a closing whose field 4 names a payment with a null notice: invalid | collective | stays | SMALL | — |  | a bound in a format comment read as a rule (SMALL) |
| 234 | publication | 7.7b the owners' side alone ends a publication before its termination terms' minimum term: not yet met, the version does not count | shared | stays | draft 24 unchanged | S6 |  |  |
| 235 | termination | 7.7b the same act read as a termination: the publication and every place in it stay active | shared | stays | draft 24 unchanged | S6, task 15 |  |  |
| 236 | publication | 7.7b the version before it still counts: sales under it stand | shared | stays | draft 24 unchanged | S6 |  |  |
| 237 | termination | 7.7b after the minimum term the owners' side alone ends it: met, it counts, the publication terminated | shared | stays | draft 24 unchanged | S6, task 15 |  |  |
| 238 | publication | 7.7c a reader without the termination terms' cMIP reads the terminating act: unknown | shared | stays | draft 24 unchanged | S6, L2, task 15 | O-6 | unknown from the act on, as draft 24; whether UNKNOWN makes a default termination still available is open |
| 239 | termination | 7.7c the same reader: the publication's state unknown from that act on, never active, never terminated | shared | stays | draft 24 unchanged | S6, L2, task 15 | O-6 | unknown from the act on, as draft 24; whether UNKNOWN makes a default termination still available is open |
| 240 | publication | 7.7c the same reader: the version before the act still counts | shared | stays | draft 24 unchanged | S6 |  |  |
| 241 | termination | 7.7b the owners' side alone drops the label before the minimum term: not yet met, the label's place stays active | shared | stays | draft 24 unchanged | S6, task 15 |  |  |
| 242 | termination | 7.7b the owners' side alone drops the label after the minimum term: met, the label's place terminated, the publication active | shared | stays | draft 24 unchanged | S6, task 15 |  |  |
| 243 | termination | 7.7c a reader without the cMIP reads the owners' side dropping the label: unknown for the label's place, the publication active | shared | stays | draft 24 unchanged | S6, L2, task 15 | O-6 | unknown from the act on, as draft 24; whether UNKNOWN makes a default termination still available is open |
| 244 | termination | 7.7d after the minimum term the label alone drops itself from field 2: met, its place terminated, the publication active | shared | stays | draft 24 unchanged (G3 keeps the way out) | S6 |  | partners leave the core (G3); the partner's place and its default stay as the way out |
| 245 | termination | 7.7d the same version by the label before the minimum term: not yet met, it does not count | shared | stays | draft 24 unchanged (G3 keeps the way out) | S6 |  | partners leave the core (G3); the partner's place and its default stay as the way out |
| 246 | termination | 7.7d with no termination terms, a partner alone drops itself: it does not count, the default being the owners' side's | shared | stays | draft 24 unchanged (G3 keeps the way out) | S6 |  | partners leave the core (G3); the partner's place and its default stay as the way out |
| 247 | termination | 7.7d with no termination terms, the owners' side alone drops the partner: it counts, the partner's place terminated | shared | stays | draft 24 unchanged (G3 keeps the way out) | S6 |  | partners leave the core (G3); the partner's place and its default stay as the way out |
| 248 | agreement invalid | a deal naming termination terms (field 36): not invalid | shared | stays | draft 24 unchanged | task 15 |  |  |
| 249 | agreement invalid | a deal whose field 36 and field 2's task 15 name different cMIPs: invalid | shared | stays | draft 24 unchanged | task 15 |  |  |
| 250 | agreement invalid | a collective's terms naming termination terms: invalid | collective | stays | draft 24 unchanged | — |  |  |
| 251 | termination | 1.9i a deal's marked clone, every party signing, before its notice has run: not yet met, it does not count, the deal active | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 252 | termination | 1.9i the same marked clone after the notice has run: met, it counts, the deal terminated | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 253 | termination | 1.9i a reader without the termination terms' cMIP reads the marked clone: unknown from it on | shared | stays | draft 24 unchanged | S6, L2, task 15 | O-6 | unknown from the act on, as draft 24; whether UNKNOWN makes a default termination still available is open |
| 254 | agreement exists | 1.9i the same reader asks whether the marked clone exists: unknown | shared | stays | draft 24 unchanged | L2, task 15 | O-6 |  |
| 255 | termination | 1.9i a clone without the termination mark stating no further obligations: no terminating act, the deal active | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 256 | agreement exists | 1.9i the unmarked clone is a version of the deal like any other: it exists once complete | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 257 | termination | 1.9i a marked clone naming one party's place, after the notice: that place terminated, the deal active | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 258 | agreement invalid | 1.9i a clone leaving out a party of the parent without the termination mark: invalid | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 259 | agreement invalid | a mark naming a party the clone still lists: invalid | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 260 | agreement invalid | a mark naming someone who is no party of the parent: invalid | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 261 | agreement invalid | founding terms carrying the termination mark: invalid | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 262 | agreement invalid | a deal's clone carrying the termination mark naming the deal, drafted: not invalid | deal | stays | draft 24 unchanged | S6, D1 |  |  |
| 263 | agreement invalid | a collective's terms carrying the termination mark: invalid | collective | stays | draft 24 unchanged | — |  |  |
| 264 | declaration | 3.7bb the judge the new clause names declares the buyer absent, field 1 the latest version: counts for nothing | shared | stays, re-derived | BUYER; SIGNED; T14; RESEARCH | S5, task 14, task 26 | pull P-1 | the buyer is declared only under the clause it accepted; now its own absence choices in its transfer (BUYER) |
| 265 | declaration | 3.7bb the authority of the clause the buyer accepted declares it, field 1 that version: counts | shared | stays, re-derived | BUYER; SIGNED; T14; RESEARCH | S5, task 14, task 26 | pull P-1 | the buyer is declared only under the clause it accepted; now its own absence choices in its transfer (BUYER) |
| 266 | declaration | 3.7bc Cy, departed, declared absent by the authority of the clause it last signed: counts, its stake passing by succession | shared | changes | R-238; TRAVEL; RESEARCH | S5, task 14, task 26 |  | "counts" stays; "its stake passing by succession" becomes "its stake stays or moves as its own absence outcome says" |
| 267 | status | 3.7bc the rotation declaring the clone, put in force under that declaration, that passes Cy's stake to its successor: valid | collective | stays, re-derived | R-238; TRAVEL | S5 |  | the clone applying Cy's own outcome; valid if it applies that outcome |
| 268 | declaration | 3.7bc the judge the clause names since Cy's resignation declares the successor absent, field 1 the latest version: counts for nothing | shared | stays, re-derived | TRAVEL; SIGNED; R-238 | S5, task 14, task 26 | pull P-1 | the successor under the clause that bound its holder (TRAVEL); BUYER's reasoning would give the successor its own choices |
| 269 | declaration | 3.7bc the authority of the clause that bound Cy declares the successor absent, field 1 that version: counts | shared | stays, re-derived | TRAVEL; SIGNED; R-238 | S5, task 14, task 26 | pull P-1 | the successor under the clause that bound its holder (TRAVEL); BUYER's reasoning would give the successor its own choices |
